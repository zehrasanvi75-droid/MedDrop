-- ====================================================================
-- MedDrop: Emergency Medical Inventory & Dispatch Platform
-- PostgreSQL Database Schema with Concurrency Control & RLS Policies
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM / DOMAIN CONSTRAINTS
-- Facilities table
CREATE TABLE IF NOT EXISTS public.facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('outpost', 'relief_camp', 'clinic', 'base_hospital')),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    region TEXT NOT NULL,
    callsign TEXT,
    contact_frequency TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles table (linked to auth.users if Supabase Auth is enabled)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('requester', 'supplier', 'administrator')),
    facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
    callsign TEXT,
    rank_or_title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supply Items table
CREATE TABLE IF NOT EXISTS public.supply_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Blood Products', 'Antivenoms', 'Trauma & Surgical', 'Emergency Medicine', 'Burn Care')),
    unit TEXT NOT NULL,
    blood_group TEXT CHECK (blood_group IN ('O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+')),
    is_blood_product BOOLEAN NOT NULL DEFAULT FALSE,
    storage_temp TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventories table
CREATE TABLE IF NOT EXISTS public.inventories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.supply_items(id) ON DELETE RESTRICT,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    min_threshold INTEGER NOT NULL DEFAULT 5 CHECK (min_threshold >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_facility_item UNIQUE (facility_id, item_id),
    CONSTRAINT chk_reserved_not_exceed_on_hand CHECK (quantity_reserved <= quantity_on_hand)
);

-- Supply Requests table
CREATE TABLE IF NOT EXISTS public.supply_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_code TEXT UNIQUE NOT NULL,
    requesting_facility_id UUID NOT NULL REFERENCES public.facilities(id),
    supplying_facility_id UUID REFERENCES public.facilities(id),
    item_id UUID NOT NULL REFERENCES public.supply_items(id),
    quantity_requested INTEGER NOT NULL CHECK (quantity_requested > 0),
    urgency TEXT NOT NULL CHECK (urgency IN ('critical', 'high', 'moderate')),
    patient_status TEXT NOT NULL CHECK (patient_status IN ('incoming', 'on_site', 'stabilized')),
    radius_km NUMERIC(8, 2) NOT NULL DEFAULT 50.0,
    notes TEXT,
    incident_reference TEXT,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (
        status IN ('requested', 'accepted', 'dispatched', 'in_transit', 'delivered', 'rejected', 'cancelled')
    ),
    rejection_reason TEXT,
    transport_mode TEXT CHECK (transport_mode IN ('ground_ambulance', 'air_evac', 'tactical_drone', 'all_terrain')),
    tracking_number TEXT,
    estimated_arrival TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- Inventory Transactions table
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES public.inventories(id) ON DELETE SET NULL,
    facility_id UUID NOT NULL REFERENCES public.facilities(id),
    item_id UUID NOT NULL REFERENCES public.supply_items(id),
    request_id UUID REFERENCES public.supply_requests(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN ('receipt', 'reservation', 'release', 'dispatch', 'adjustment')
    ),
    quantity INTEGER NOT NULL,
    performed_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Request Events / Audit Trail
CREATE TABLE IF NOT EXISTS public.request_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.supply_requests(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES FOR HIGH-THROUGHPUT SEARCH & REALTIME
CREATE INDEX IF NOT EXISTS idx_inventories_facility ON public.inventories(facility_id);
CREATE INDEX IF NOT EXISTS idx_inventories_item ON public.inventories(item_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.supply_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_req_facility ON public.supply_requests(requesting_facility_id);
CREATE INDEX IF NOT EXISTS idx_requests_sup_facility ON public.supply_requests(supplying_facility_id);
CREATE INDEX IF NOT EXISTS idx_transactions_facility ON public.inventory_transactions(facility_id);
CREATE INDEX IF NOT EXISTS idx_events_request ON public.request_events(request_id);

-- 4. ATOMIC BUSINESS TRANSACTIONS (RPC FUNCTIONS)

-- Function: Accept Request and Reserve Inventory Atomically
CREATE OR REPLACE FUNCTION public.accept_and_reserve_request(
    p_request_id UUID,
    p_supplying_facility_id UUID,
    p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_inv RECORD;
    v_available INTEGER;
BEGIN
    -- Lock request row for update
    SELECT * INTO v_req FROM public.supply_requests WHERE id = p_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request % not found', p_request_id;
    END IF;

    IF v_req.status != 'requested' THEN
        RAISE EXCEPTION 'Request cannot be accepted in status: %', v_req.status;
    END IF;

    -- Lock inventory row for update
    SELECT * INTO v_inv FROM public.inventories 
    WHERE facility_id = p_supplying_facility_id AND item_id = v_req.item_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Supplying facility does not have this item in inventory';
    END IF;

    v_available := v_inv.quantity_on_hand - v_inv.quantity_reserved;
    IF v_available < v_req.quantity_requested THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_available, v_req.quantity_requested;
    END IF;

    -- Update inventory reservation
    UPDATE public.inventories
    SET quantity_reserved = quantity_reserved + v_req.quantity_requested,
        updated_at = NOW()
    WHERE id = v_inv.id;

    -- Log transaction
    INSERT INTO public.inventory_transactions (
        inventory_id, facility_id, item_id, request_id, transaction_type, quantity, performed_by, notes
    ) VALUES (
        v_inv.id, p_supplying_facility_id, v_req.item_id, p_request_id, 'reservation', v_req.quantity_requested, p_actor_id,
        'Reserved for ' || v_req.request_code
    );

    -- Update request
    UPDATE public.supply_requests
    SET status = 'accepted',
        supplying_facility_id = p_supplying_facility_id,
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Record audit event
    INSERT INTO public.request_events (request_id, previous_status, new_status, actor_id, note)
    VALUES (p_request_id, 'requested', 'accepted', p_actor_id, 'Request accepted & stock reserved by facility ' || p_supplying_facility_id);

    RETURN jsonb_build_object('success', TRUE, 'request_id', p_request_id, 'status', 'accepted');
END;
$$ LANGUAGE plpgsql;

-- Function: Dispatch Supplies Atomically
CREATE OR REPLACE FUNCTION public.dispatch_supplies(
    p_request_id UUID,
    p_actor_id UUID,
    p_transport_mode TEXT DEFAULT 'ground_ambulance',
    p_tracking_number TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_inv RECORD;
BEGIN
    SELECT * INTO v_req FROM public.supply_requests WHERE id = p_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    IF v_req.status != 'accepted' THEN
        RAISE EXCEPTION 'Cannot dispatch request in status %', v_req.status;
    END IF;

    -- Deduct on-hand and release reservation
    SELECT * INTO v_inv FROM public.inventories 
    WHERE facility_id = v_req.supplying_facility_id AND item_id = v_req.item_id 
    FOR UPDATE;

    IF v_inv.quantity_reserved < v_req.quantity_requested THEN
        RAISE EXCEPTION 'Reservation mismatch for dispatch';
    END IF;

    UPDATE public.inventories
    SET quantity_on_hand = quantity_on_hand - v_req.quantity_requested,
        quantity_reserved = quantity_reserved - v_req.quantity_requested,
        updated_at = NOW()
    WHERE id = v_inv.id;

    -- Log transaction
    INSERT INTO public.inventory_transactions (
        inventory_id, facility_id, item_id, request_id, transaction_type, quantity, performed_by, notes
    ) VALUES (
        v_inv.id, v_req.supplying_facility_id, v_req.item_id, p_request_id, 'dispatch', -v_req.quantity_requested, p_actor_id,
        'Dispatched via ' || COALESCE(p_transport_mode, 'ambulance')
    );

    -- Update request
    UPDATE public.supply_requests
    SET status = 'in_transit',
        dispatched_at = NOW(),
        transport_mode = p_transport_mode,
        tracking_number = COALESCE(p_tracking_number, 'TRK-' || FLOOR(RANDOM() * 900000 + 100000)::TEXT),
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Record audit event
    INSERT INTO public.request_events (request_id, previous_status, new_status, actor_id, note)
    VALUES (p_request_id, 'accepted', 'in_transit', p_actor_id, 'Supplies dispatched in transit');

    RETURN jsonb_build_object('success', TRUE, 'request_id', p_request_id, 'status', 'in_transit');
END;
$$ LANGUAGE plpgsql;

-- Function: Confirm Delivery Atomically
CREATE OR REPLACE FUNCTION public.confirm_delivery(
    p_request_id UUID,
    p_actor_id UUID,
    p_receiver_name TEXT
) RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_inv RECORD;
BEGIN
    SELECT * INTO v_req FROM public.supply_requests WHERE id = p_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    IF v_req.status != 'in_transit' THEN
        RAISE EXCEPTION 'Cannot confirm delivery for status: %', v_req.status;
    END IF;

    -- Add to receiving facility's inventory
    INSERT INTO public.inventories (facility_id, item_id, quantity_on_hand, quantity_reserved, min_threshold)
    VALUES (v_req.requesting_facility_id, v_req.item_id, v_req.quantity_requested, 0, 5)
    ON CONFLICT (facility_id, item_id)
    DO UPDATE SET 
        quantity_on_hand = inventories.quantity_on_hand + v_req.quantity_requested,
        updated_at = NOW();

    -- Log transaction
    INSERT INTO public.inventory_transactions (
        inventory_id, facility_id, item_id, request_id, transaction_type, quantity, performed_by, notes
    ) VALUES (
        NULL, v_req.requesting_facility_id, v_req.item_id, p_request_id, 'receipt', v_req.quantity_requested, p_actor_id,
        'Received & confirmed by ' || COALESCE(p_receiver_name, 'Field Officer')
    );

    -- Update request
    UPDATE public.supply_requests
    SET status = 'delivered',
        delivered_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Record audit event
    INSERT INTO public.request_events (request_id, previous_status, new_status, actor_id, note)
    VALUES (p_request_id, 'in_transit', 'delivered', p_actor_id, 'Supplies received by ' || COALESCE(p_receiver_name, 'Field Officer'));

    RETURN jsonb_build_object('success', TRUE, 'request_id', p_request_id, 'status', 'delivered');
END;
$$ LANGUAGE plpgsql;

-- Function: Reject or Cancel Request (Releases Reservation if needed)
CREATE OR REPLACE FUNCTION public.reject_or_cancel_request(
    p_request_id UUID,
    p_actor_id UUID,
    p_action TEXT, -- 'reject' or 'cancel'
    p_reason TEXT
) RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_inv RECORD;
    v_new_status TEXT;
BEGIN
    SELECT * INTO v_req FROM public.supply_requests WHERE id = p_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    v_new_status := CASE WHEN p_action = 'reject' THEN 'rejected' ELSE 'cancelled' END;

    -- If previously accepted, release reserved units
    IF v_req.status = 'accepted' AND v_req.supplying_facility_id IS NOT NULL THEN
        SELECT * INTO v_inv FROM public.inventories 
        WHERE facility_id = v_req.supplying_facility_id AND item_id = v_req.item_id 
        FOR UPDATE;

        IF FOUND THEN
            UPDATE public.inventories
            SET quantity_reserved = GREATEST(0, quantity_reserved - v_req.quantity_requested),
                updated_at = NOW()
            WHERE id = v_inv.id;

            INSERT INTO public.inventory_transactions (
                inventory_id, facility_id, item_id, request_id, transaction_type, quantity, performed_by, notes
            ) VALUES (
                v_inv.id, v_req.supplying_facility_id, v_req.item_id, p_request_id, 'release', v_req.quantity_requested, p_actor_id,
                'Reservation released due to ' || v_new_status || ': ' || COALESCE(p_reason, 'No reason')
            );
        END IF;
    END IF;

    -- Update request
    UPDATE public.supply_requests
    SET status = v_new_status,
        rejection_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Record audit event
    INSERT INTO public.request_events (request_id, previous_status, new_status, actor_id, note)
    VALUES (p_request_id, v_req.status, v_new_status, p_actor_id, p_reason);

    RETURN jsonb_build_object('success', TRUE, 'request_id', p_request_id, 'status', v_new_status);
END;
$$ LANGUAGE plpgsql;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_events ENABLE ROW LEVEL SECURITY;

-- Read policies: Authorized users can read network facilities and supply items
CREATE POLICY "Allow authenticated read facilities" ON public.facilities FOR SELECT USING (TRUE);
CREATE POLICY "Allow authenticated read supply_items" ON public.supply_items FOR SELECT USING (TRUE);
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Allow authenticated read inventories" ON public.inventories FOR SELECT USING (TRUE);
CREATE POLICY "Allow authenticated read requests" ON public.supply_requests FOR SELECT USING (TRUE);
CREATE POLICY "Allow authenticated read transactions" ON public.inventory_transactions FOR SELECT USING (TRUE);
CREATE POLICY "Allow authenticated read events" ON public.request_events FOR SELECT USING (TRUE);

-- Mutate policies: Controlled operations
CREATE POLICY "Allow insert requests" ON public.supply_requests FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update requests" ON public.supply_requests FOR UPDATE USING (TRUE);
CREATE POLICY "Allow insert transactions" ON public.inventory_transactions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow insert events" ON public.request_events FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update inventories" ON public.inventories FOR UPDATE USING (TRUE);
