-- ====================================================================
-- MedDrop: Demo Seed Data
-- ====================================================================

-- 1. Insert Facilities
INSERT INTO public.facilities (id, name, type, latitude, longitude, region, callsign, contact_frequency)
VALUES 
  ('f1111111-1111-1111-1111-111111111111', 'Outpost Alpha', 'outpost', 34.1526, 74.8214, 'Northern Mountain Sector', 'VIPER-1', 'VHF 142.850 MHz'),
  ('f2222222-2222-2222-2222-222222222222', 'Sector Base Hospital', 'base_hospital', 33.7782, 75.3412, 'Sector 4 Central Logistics Hub', 'AEGIS-BASE', 'VHF 156.800 MHz'),
  ('f3333333-3333-3333-3333-333333333333', 'Relief Camp Bravo', 'relief_camp', 33.5512, 74.9821, 'Valley Disaster Relief Zone', 'HAVEN-2', 'VHF 148.225 MHz'),
  ('f4444444-4444-4444-4444-444444444444', 'Forward Clinic Delta', 'clinic', 34.3210, 74.4120, 'Western Ridge Tactical Station', 'FALCON-4', 'VHF 139.400 MHz')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Supply Items
INSERT INTO public.supply_items (id, name, category, unit, blood_group, is_blood_product, storage_temp, notes)
VALUES
  ('i1111111-1111-1111-1111-111111111111', 'O-Negative Whole Blood (Universal Donor)', 'Blood Products', 'Units (450ml)', 'O-', TRUE, '2°C to 6°C', 'Critical for unmatched emergency resuscitations'),
  ('i2222222-2222-2222-2222-222222222222', 'Polyvalent Snake Antivenom', 'Antivenoms', 'Vials (10ml)', NULL, FALSE, '2°C to 8°C', 'Effective against Viper and Cobra envenomation'),
  ('i3333333-3333-3333-3333-333333333333', 'Tactical Trauma & Surgical Kit (TCCC)', 'Trauma & Surgical', 'Kits', NULL, FALSE, 'Ambient', 'Includes chest seals, hemostatics, airway control'),
  ('i4444444-4444-4444-4444-444444444444', 'Hydrogel Burn Dressings (10x10cm)', 'Burn Care', 'Packs (5pcs)', NULL, FALSE, 'Ambient', 'Sterile soothing dressings for 2nd/3rd degree burns'),
  ('i5555555-5555-5555-5555-555555555555', 'Combat Application Tourniquet (CAT Gen 7)', 'Trauma & Surgical', 'Units', NULL, FALSE, 'Ambient', 'High-priority hemorrhage control'),
  ('i6666666-6666-6666-6666-666666666666', 'O-Positive Whole Blood', 'Blood Products', 'Units (450ml)', 'O+', TRUE, '2°C to 6°C', 'Standard trauma resuscitation for Rh+ candidates'),
  ('i7777777-7777-7777-7777-777777777777', 'Tranexamic Acid (TXA) 1000mg IV', 'Emergency Medicine', 'Vials', NULL, FALSE, '15°C to 25°C', 'Antifibrinolytic for massive traumatic hemorrhage'),
  ('i8888888-8888-8888-8888-888888888888', 'Sterile Saline 0.9% IV (1000ml)', 'Emergency Medicine', 'Bags', NULL, FALSE, 'Ambient', 'Fluid resuscitation')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Profiles (Demo Users)
INSERT INTO public.profiles (id, full_name, role, facility_id, callsign, rank_or_title)
VALUES
  ('u1111111-1111-1111-1111-111111111111', 'Capt. Elena Rostova, MD', 'requester', 'f1111111-1111-1111-1111-111111111111', 'VIPER-LEAD', 'Senior Field Surgeon'),
  ('u2222222-2222-2222-2222-222222222222', 'Col. David Vance', 'supplier', 'f2222222-2222-2222-2222-222222222222', 'AEGIS-DISPATCH', 'Base Logistics Director'),
  ('u3333333-3333-3333-3333-333333333333', 'Dr. Aisha Patel', 'requester', 'f3333333-3333-3333-3333-333333333333', 'HAVEN-CHIEF', 'Camp Medical Director'),
  ('u4444444-4444-4444-4444-444444444444', 'Gen. Marcus Reed', 'administrator', NULL, 'COMMAND-ACTUAL', 'Regional Emergency Operations Director')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Inventories
-- Outpost Alpha: 0 units O- blood (CRITICAL), 3 snake antivenom (LOW), 2 burn dressings
INSERT INTO public.inventories (facility_id, item_id, quantity_on_hand, quantity_reserved, min_threshold)
VALUES
  ('f1111111-1111-1111-1111-111111111111', 'i1111111-1111-1111-1111-111111111111', 0, 0, 4),   -- O- blood: 0 (CRITICAL)
  ('f1111111-1111-1111-1111-111111111111', 'i2222222-2222-2222-2222-222222222222', 3, 0, 5),   -- Antivenom: 3 (LOW)
  ('f1111111-1111-1111-1111-111111111111', 'i3333333-3333-3333-3333-333333333333', 4, 0, 4),   -- Trauma Kit: 4 (Available)
  ('f1111111-1111-1111-1111-111111111111', 'i4444444-4444-4444-4444-444444444444', 2, 0, 5),   -- Burn Dressing: 2 (LOW)
  ('f1111111-1111-1111-1111-111111111111', 'i5555555-5555-5555-5555-555555555555', 6, 0, 4),   -- Tourniquets: 6 (Available)

-- Sector Base Hospital: 10 units O- blood (AVAILABLE), 12 trauma kits, 15 antivenom
  ('f2222222-2222-2222-2222-222222222222', 'i1111111-1111-1111-1111-111111111111', 10, 0, 4),  -- O- blood: 10 (Available)
  ('f2222222-2222-2222-2222-222222222222', 'i2222222-2222-2222-2222-222222222222', 15, 0, 5),  -- Antivenom: 15 (Available)
  ('f2222222-2222-2222-2222-222222222222', 'i3333333-3333-3333-3333-333333333333', 12, 0, 5),  -- Trauma Kit: 12 (Available)
  ('f2222222-2222-2222-2222-222222222222', 'i4444444-4444-4444-4444-444444444444', 18, 0, 6),  -- Burn Dressing: 18 (Available)
  ('f2222222-2222-2222-2222-222222222222', 'i5555555-5555-5555-5555-555555555555', 25, 0, 8),  -- Tourniquets: 25 (Available)
  ('f2222222-2222-2222-2222-222222222222', 'i6666666-6666-6666-6666-666666666666', 16, 0, 5),  -- O+ blood: 16 (Available)
  ('f2222222-2222-2222-2222-222222222222', 'i7777777-7777-7777-7777-777777777777', 30, 0, 10), -- TXA: 30 (Available)

-- Relief Camp Bravo: 8 packs burn dressings, 6 O+ blood, 2 tourniquets
  ('f3333333-3333-3333-3333-333333333333', 'i4444444-4444-4444-4444-444444444444', 8, 0, 5),   -- Burn Dressing: 8 (Available)
  ('f3333333-3333-3333-3333-333333333333', 'i6666666-6666-6666-6666-666666666666', 6, 0, 4),   -- O+ blood: 6 (Available)
  ('f3333333-3333-3333-3333-333333333333', 'i5555555-5555-5555-5555-555555555555', 2, 0, 4)    -- Tourniquets: 2 (LOW)
ON CONFLICT (facility_id, item_id) DO NOTHING;

-- 5. Existing Demo Requests
INSERT INTO public.supply_requests (
  id, request_code, requesting_facility_id, supplying_facility_id, item_id, quantity_requested, 
  urgency, patient_status, radius_km, notes, incident_reference, status, created_by, created_at, accepted_at, dispatched_at, transport_mode, tracking_number
) VALUES
  (
    'r1111111-1111-1111-1111-111111111111', 'REQ-2026-089',
    'f3333333-3333-3333-3333-333333333333', 'f2222222-2222-2222-2222-222222222222',
    'i4444444-4444-4444-4444-444444444444', 4,
    'high', 'stabilized', 60.0, 'Wildfire casualty care, burn dressing replenishment', 'INC-FIRE-04',
    'in_transit', 'u3333333-3333-3333-3333-333333333333',
    NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '20 minutes',
    'ground_ambulance', 'TRK-MED-8472'
  ),
  (
    'r2222222-2222-2222-2222-222222222222', 'REQ-2026-084',
    'f4444444-4444-4444-4444-444444444444', 'f2222222-2222-2222-2222-222222222222',
    'i2222222-2222-2222-2222-222222222222', 2,
    'critical', 'on_site', 45.0, 'Snakebite envenomation response completed', 'INC-BIO-09',
    'delivered', 'u1111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 45 minutes', NOW() - INTERVAL '2 hours 10 minutes',
    'air_evac', 'TRK-AIR-1029'
  )
ON CONFLICT (id) DO NOTHING;
