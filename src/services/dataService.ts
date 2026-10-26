import {
  Facility,
  Profile,
  SupplyItem,
  InventoryItem,
  SupplyRequest,
  InventoryTransaction,
  RequestEvent,
  EligibleSupplierMatch,
  DashboardStats,
  TransportMode,
} from '@/types';
import {
  INITIAL_FACILITIES,
  INITIAL_PROFILES,
  INITIAL_SUPPLY_ITEMS,
  INITIAL_INVENTORIES,
  INITIAL_REQUESTS,
  INITIAL_TRANSACTIONS,
  INITIAL_REQUEST_EVENTS,
} from './mockData';
import { calculateDistanceKm } from './distance';
import { realtimeBus } from './realtimeSync';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const STORAGE_KEYS = {
  FACILITIES: 'meddrop_facilities_v1',
  PROFILES: 'meddrop_profiles_v1',
  ITEMS: 'meddrop_supply_items_v1',
  INVENTORIES: 'meddrop_inventories_v1',
  REQUESTS: 'meddrop_requests_v1',
  TRANSACTIONS: 'meddrop_transactions_v1',
  EVENTS: 'meddrop_events_v1',
};

class DataService {
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!this.isBrowser) return;

    if (!localStorage.getItem(STORAGE_KEYS.FACILITIES)) {
      localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_FACILITIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_SUPPLY_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORIES)) {
      localStorage.setItem(STORAGE_KEYS.INVENTORIES, JSON.stringify(INITIAL_INVENTORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_REQUEST_EVENTS));
    }
  }

  public resetDemoData() {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(INITIAL_FACILITIES));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_SUPPLY_ITEMS));
    localStorage.setItem(STORAGE_KEYS.INVENTORIES, JSON.stringify(INITIAL_INVENTORIES));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_REQUEST_EVENTS));
    realtimeBus.broadcast('demo_reset', { timestamp: Date.now() });
  }

  // --- Read Operations ---

  public async getFacilities(): Promise<Facility[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('facilities').select('*');
      if (!error && data && data.length > 0) return data as Facility[];
    }
    const raw = localStorage.getItem(STORAGE_KEYS.FACILITIES);
    return raw ? JSON.parse(raw) : INITIAL_FACILITIES;
  }

  public async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) return data as Profile[];
    }
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return raw ? JSON.parse(raw) : INITIAL_PROFILES;
  }

  public async getSupplyItems(): Promise<SupplyItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('supply_items').select('*');
      if (!error && data && data.length > 0) return data as SupplyItem[];
    }
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return raw ? JSON.parse(raw) : INITIAL_SUPPLY_ITEMS;
  }

  public async getInventories(): Promise<InventoryItem[]> {
    const [facilities, items] = await Promise.all([this.getFacilities(), this.getSupplyItems()]);
    let rawInventories: InventoryItem[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('inventories').select('*');
      if (!error && data && data.length > 0) {
        rawInventories = data as InventoryItem[];
      }
    }

    if (rawInventories.length === 0) {
      const raw = localStorage.getItem(STORAGE_KEYS.INVENTORIES);
      rawInventories = raw ? JSON.parse(raw) : INITIAL_INVENTORIES;
    }

    // Hydrate
    return rawInventories.map((inv) => ({
      ...inv,
      facility: facilities.find((f) => f.id === inv.facility_id),
      item: items.find((i) => i.id === inv.item_id),
    }));
  }

  public async getInventoryByFacility(facilityId: string): Promise<InventoryItem[]> {
    const all = await this.getInventories();
    return all.filter((inv) => inv.facility_id === facilityId);
  }

  public async getRequests(): Promise<SupplyRequest[]> {
    const [facilities, items, profiles] = await Promise.all([
      this.getFacilities(),
      this.getSupplyItems(),
      this.getProfiles(),
    ]);

    let rawRequests: SupplyRequest[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('supply_requests').select('*');
      if (!error && data && data.length > 0) {
        rawRequests = data as SupplyRequest[];
      }
    }

    if (rawRequests.length === 0) {
      const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      rawRequests = raw ? JSON.parse(raw) : INITIAL_REQUESTS;
    }

    return rawRequests
      .map((req) => ({
        ...req,
        requesting_facility: facilities.find((f) => f.id === req.requesting_facility_id),
        supplying_facility: facilities.find((f) => f.id === req.supplying_facility_id),
        item: items.find((i) => i.id === req.item_id),
        creator: profiles.find((p) => p.id === req.created_by),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getRequestById(id: string): Promise<SupplyRequest | null> {
    const requests = await this.getRequests();
    return requests.find((r) => r.id === id) || null;
  }

  public async getTransactions(): Promise<InventoryTransaction[]> {
    const [facilities, items, profiles] = await Promise.all([
      this.getFacilities(),
      this.getSupplyItems(),
      this.getProfiles(),
    ]);

    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const list: InventoryTransaction[] = raw ? JSON.parse(raw) : INITIAL_TRANSACTIONS;

    return list
      .map((tx) => ({
        ...tx,
        facility: facilities.find((f) => f.id === tx.facility_id),
        item: items.find((i) => i.id === tx.item_id),
        performer: profiles.find((p) => p.id === tx.performed_by),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getRequestEvents(requestId: string): Promise<RequestEvent[]> {
    const profiles = await this.getProfiles();
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const list: RequestEvent[] = raw ? JSON.parse(raw) : INITIAL_REQUEST_EVENTS;

    return list
      .filter((e) => e.request_id === requestId)
      .map((e) => ({
        ...e,
        actor: profiles.find((p) => p.id === e.actor_id),
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // --- Supplier Discovery ---

  public async findEligibleSuppliers(
    itemId: string,
    quantityRequested: number,
    requestingFacilityId: string,
    radiusKm: number
  ): Promise<EligibleSupplierMatch[]> {
    const [facilities, inventories] = await Promise.all([
      this.getFacilities(),
      this.getInventories(),
    ]);

    const requestingFacility = facilities.find((f) => f.id === requestingFacilityId);
    if (!requestingFacility) return [];

    const matches: EligibleSupplierMatch[] = [];

    for (const facility of facilities) {
      if (facility.id === requestingFacilityId || !facility.is_active) continue;

      const inv = inventories.find(
        (i) => i.facility_id === facility.id && i.item_id === itemId
      );

      const availableStock = inv ? Math.max(0, inv.quantity_on_hand - inv.quantity_reserved) : 0;
      const distance = calculateDistanceKm(
        requestingFacility.latitude,
        requestingFacility.longitude,
        facility.latitude,
        facility.longitude
      );

      // Only match facilities with sufficient unreserved inventory
      if (availableStock >= quantityRequested) {
        matches.push({
          facility,
          inventory: inv!,
          distanceKm: distance,
          availableStock,
          isWithinRadius: distance <= radiusKm,
        });
      }
    }

    // Sort by proximity
    return matches.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // --- Core Lifecycle Mutations with Atomic Guarantees ---

  public async createEmergencyRequest(params: {
    requesting_facility_id: string;
    item_id: string;
    quantity_requested: number;
    urgency: 'critical' | 'high' | 'moderate';
    patient_status: 'incoming' | 'on_site' | 'stabilized';
    radius_km: number;
    notes?: string;
    incident_reference?: string;
    created_by: string;
  }): Promise<SupplyRequest> {
    const requestsRaw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    const requests: SupplyRequest[] = requestsRaw ? JSON.parse(requestsRaw) : [];

    // Duplicate check: prevent submitting duplicate active requests for the exact same item within last 2 minutes
    const twoMinutesAgo = Date.now() - 120000;
    const isDuplicate = requests.some(
      (r) =>
        r.requesting_facility_id === params.requesting_facility_id &&
        r.item_id === params.item_id &&
        ['requested', 'accepted'].includes(r.status) &&
        new Date(r.created_at).getTime() > twoMinutesAgo
    );

    if (isDuplicate) {
      throw new Error('An active request for this item is already in progress for your facility.');
    }

    const requestCode = `REQ-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const newRequest: SupplyRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      request_code: requestCode,
      requesting_facility_id: params.requesting_facility_id,
      supplying_facility_id: null,
      item_id: params.item_id,
      quantity_requested: params.quantity_requested,
      urgency: params.urgency,
      patient_status: params.patient_status,
      radius_km: params.radius_km,
      notes: params.notes,
      incident_reference: params.incident_reference,
      status: 'requested',
      created_by: params.created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    requests.unshift(newRequest);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    // Audit Event
    await this.logRequestEvent(
      newRequest.id,
      null,
      'requested',
      params.created_by,
      `Emergency request ${requestCode} submitted (${params.urgency.toUpperCase()})`
    );

    // Broadcast Realtime Notification
    realtimeBus.broadcast('request_created', { request: newRequest });

    return newRequest;
  }

  public async acceptAndReserveRequest(
    requestId: string,
    supplyingFacilityId: string,
    actorId: string
  ): Promise<SupplyRequest> {
    const requestsRaw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    const requests: SupplyRequest[] = requestsRaw ? JSON.parse(requestsRaw) : [];
    const requestIndex = requests.findIndex((r) => r.id === requestId);

    if (requestIndex === -1) {
      throw new Error(`Request ${requestId} not found.`);
    }

    const request = requests[requestIndex];
    if (request.status !== 'requested') {
      throw new Error(`Cannot accept request in '${request.status}' status.`);
    }

    // Atomic Stock Check & Reservation
    const invRaw = localStorage.getItem(STORAGE_KEYS.INVENTORIES);
    const inventories: InventoryItem[] = invRaw ? JSON.parse(invRaw) : [];
    const invIndex = inventories.findIndex(
      (i) => i.facility_id === supplyingFacilityId && i.item_id === request.item_id
    );

    if (invIndex === -1) {
      throw new Error('Supplying facility has no inventory record for this item.');
    }

    const inv = inventories[invIndex];
    const available = inv.quantity_on_hand - inv.quantity_reserved;

    if (available < request.quantity_requested) {
      throw new Error(
        `Insufficient available inventory. Available: ${available}, Requested: ${request.quantity_requested}`
      );
    }

    // Mutate Reservation
    inv.quantity_reserved += request.quantity_requested;
    inv.updated_at = new Date().toISOString();
    inventories[invIndex] = inv;
    localStorage.setItem(STORAGE_KEYS.INVENTORIES, JSON.stringify(inventories));

    // Update Request
    request.status = 'accepted';
    request.supplying_facility_id = supplyingFacilityId;
    request.accepted_at = new Date().toISOString();
    request.updated_at = new Date().toISOString();
    requests[requestIndex] = request;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    // Log Inventory Transaction
    await this.logInventoryTransaction({
      inventory_id: inv.id,
      facility_id: supplyingFacilityId,
      item_id: request.item_id,
      request_id: request.id,
      transaction_type: 'reservation',
      quantity: request.quantity_requested,
      performed_by: actorId,
      notes: `Reserved ${request.quantity_requested} units for ${request.request_code}`,
    });

    // Log Audit Event
    await this.logRequestEvent(
      request.id,
      'requested',
      'accepted',
      actorId,
      `Accepted and reserved ${request.quantity_requested} units by Base Hospital logistics`
    );

    realtimeBus.broadcast('request_accepted', { request, supplyingFacilityId });
    return request;
  }

  public async dispatchSupplies(
    requestId: string,
    actorId: string,
    transportMode: TransportMode = 'ground_ambulance',
    trackingNumber?: string
  ): Promise<SupplyRequest> {
    const requestsRaw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    const requests: SupplyRequest[] = requestsRaw ? JSON.parse(requestsRaw) : [];
    const reqIndex = requests.findIndex((r) => r.id === requestId);

    if (reqIndex === -1) throw new Error('Request not found');
    const req = requests[reqIndex];

    if (req.status !== 'accepted') {
      throw new Error(`Cannot dispatch request in status '${req.status}'`);
    }

    if (!req.supplying_facility_id) {
      throw new Error('No supplying facility assigned');
    }

    // Deduct on_hand and unreserve
    const invRaw = localStorage.getItem(STORAGE_KEYS.INVENTORIES);
    const inventories: InventoryItem[] = invRaw ? JSON.parse(invRaw) : [];
    const invIndex = inventories.findIndex(
      (i) => i.facility_id === req.supplying_facility_id && i.item_id === req.item_id
    );

    if (invIndex === -1) throw new Error('Inventory record not found');
    const inv = inventories[invIndex];

    if (inv.quantity_reserved < req.quantity_requested) {
      throw new Error('Reservation integrity violation for dispatch');
    }

    // Atomic stock deduction
    inv.quantity_on_hand -= req.quantity_requested;
    inv.quantity_reserved -= req.quantity_requested;
    inv.updated_at = new Date().toISOString();
    inventories[invIndex] = inv;
    localStorage.setItem(STORAGE_KEYS.INVENTORIES, JSON.stringify(inventories));

    const finalTracking = trackingNumber || `TRK-EMERG-${Math.floor(1000 + Math.random() * 9000)}`;

    req.status = 'in_transit';
    req.dispatched_at = new Date().toISOString();
    req.transport_mode = transportMode;
    req.tracking_number = finalTracking;
    req.updated_at = new Date().toISOString();
    requests[reqIndex] = req;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    // Log Dispatch Transaction
    await this.logInventoryTransaction({
      inventory_id: inv.id,
      facility_id: req.supplying_facility_id,
      item_id: req.item_id,
      request_id: req.id,
      transaction_type: 'dispatch',
      quantity: -req.quantity_requested,
      performed_by: actorId,
      notes: `Dispatched via ${transportMode.replace('_', ' ').toUpperCase()} [${finalTracking}]`,
    });

    // Log Audit Event
    await this.logRequestEvent(
      req.id,
      'accepted',
      'in_transit',
      actorId,
      `Supplies dispatched in transit via ${transportMode.replace('_', ' ')}`
    );

    realtimeBus.broadcast('request_dispatched', { request: req });
    return req;
  }

  public async confirmDelivery(
    requestId: string,
    actorId: string,
    receiverName: string
  ): Promise<SupplyRequest> {
    const requestsRaw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    const requests: SupplyRequest[] = requestsRaw ? JSON.parse(requestsRaw) : [];
    const reqIndex = requests.findIndex((r) => r.id === requestId);

    if (reqIndex === -1) throw new Error('Request not found');
    const req = requests[reqIndex];

    if (req.status !== 'in_transit') {
      throw new Error(`Cannot confirm delivery for status '${req.status}'`);
    }

    // Increase requesting facility's inventory
    const invRaw = localStorage.getItem(STORAGE_KEYS.INVENTORIES);
    const inventories: InventoryItem[] = invRaw ? JSON.parse(invRaw) : [];
    const invIndex = inventories.findIndex(
      (i) => i.facility_id === req.requesting_facility_id && i.item_id === req.item_id
    );

    if (invIndex >= 0) {
      inventories[invIndex].quantity_on_hand += req.quantity_requested;
      inventories[invIndex].updated_at = new Date().toISOString();
    } else {
      inventories.push({
        id: `inv-${Date.now()}`,
        facility_id: req.requesting_facility_id,
        item_id: req.item_id,
        quantity_on_hand: req.quantity_requested,
        quantity_reserved: 0,
        min_threshold: 4,
        updated_at: new Date().toISOString(),
      });
    }
    localStorage.setItem(STORAGE_KEYS.INVENTORIES, JSON.stringify(inventories));

    req.status = 'delivered';
    req.delivered_at = new Date().toISOString();
    req.updated_at = new Date().toISOString();
    requests[reqIndex] = req;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    // Log Receipt Transaction
    await this.logInventoryTransaction({
      inventory_id: null,
      facility_id: req.requesting_facility_id,
      item_id: req.item_id,
      request_id: req.id,
      transaction_type: 'receipt',
      quantity: req.quantity_requested,
      performed_by: actorId,
      notes: `Delivery verified and restocked at facility by ${receiverName}`,
    });

    // Log Audit Event
    await this.logRequestEvent(
      req.id,
      'in_transit',
      'delivered',
      actorId,
      `Delivery confirmed and checked into local stores by ${receiverName}`
    );

    realtimeBus.broadcast('request_delivered', { request: req, receiverName });
    return req;
  }

  public async rejectOrCancelRequest(
    requestId: string,
    actorId: string,
    action: 'reject' | 'cancel',
    reason: string
  ): Promise<SupplyRequest> {
    const requestsRaw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    const requests: SupplyRequest[] = requestsRaw ? JSON.parse(requestsRaw) : [];
    const reqIndex = requests.findIndex((r) => r.id === requestId);

    if (reqIndex === -1) throw new Error('Request not found');
    const req = requests[reqIndex];
    const prevStatus = req.status;
    const newStatus = action === 'reject' ? 'rejected' : 'cancelled';

    // If request was accepted, release reserved units
    if (prevStatus === 'accepted' && req.supplying_facility_id) {
      const invRaw = localStorage.getItem(STORAGE_KEYS.INVENTORIES);
      const inventories: InventoryItem[] = invRaw ? JSON.parse(invRaw) : [];
      const invIndex = inventories.findIndex(
        (i) => i.facility_id === req.supplying_facility_id && i.item_id === req.item_id
      );

      if (invIndex >= 0) {
        inventories[invIndex].quantity_reserved = Math.max(
          0,
          inventories[invIndex].quantity_reserved - req.quantity_requested
        );
        inventories[invIndex].updated_at = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.INVENTORIES, JSON.stringify(inventories));

        await this.logInventoryTransaction({
          inventory_id: inventories[invIndex].id,
          facility_id: req.supplying_facility_id,
          item_id: req.item_id,
          request_id: req.id,
          transaction_type: 'release',
          quantity: req.quantity_requested,
          performed_by: actorId,
          notes: `Released reservation due to ${newStatus}: ${reason}`,
        });
      }
    }

    req.status = newStatus;
    req.rejection_reason = reason;
    req.updated_at = new Date().toISOString();
    requests[reqIndex] = req;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));

    await this.logRequestEvent(
      req.id,
      prevStatus,
      newStatus,
      actorId,
      `${newStatus.toUpperCase()}: ${reason}`
    );

    realtimeBus.broadcast(action === 'reject' ? 'request_rejected' : 'request_cancelled', {
      request: req,
      reason,
    });
    return req;
  }

  public async adjustInventory(
    inventoryId: string,
    newQuantityOnHand: number,
    minThreshold: number,
    actorId: string,
    notes: string
  ): Promise<InventoryItem> {
    const invRaw = localStorage.getItem(STORAGE_KEYS.INVENTORIES);
    const inventories: InventoryItem[] = invRaw ? JSON.parse(invRaw) : [];
    const index = inventories.findIndex((i) => i.id === inventoryId);

    if (index === -1) throw new Error('Inventory record not found');
    const oldInv = inventories[index];
    const diff = newQuantityOnHand - oldInv.quantity_on_hand;

    oldInv.quantity_on_hand = Math.max(0, newQuantityOnHand);
    oldInv.min_threshold = Math.max(0, minThreshold);
    oldInv.updated_at = new Date().toISOString();
    inventories[index] = oldInv;
    localStorage.setItem(STORAGE_KEYS.INVENTORIES, JSON.stringify(inventories));

    await this.logInventoryTransaction({
      inventory_id: oldInv.id,
      facility_id: oldInv.facility_id,
      item_id: oldInv.item_id,
      transaction_type: 'adjustment',
      quantity: diff,
      performed_by: actorId,
      notes: `Physical audit adjustment: ${notes} (delta: ${diff > 0 ? '+' : ''}${diff})`,
    });

    realtimeBus.broadcast('inventory_updated', { inventory: oldInv });
    return oldInv;
  }

  // --- Metrics and Dashboard Data Calculation ---

  public async getDashboardStats(): Promise<DashboardStats> {
    const [facilities, inventories, requests] = await Promise.all([
      this.getFacilities(),
      this.getInventories(),
      this.getRequests(),
    ]);

    const criticalShortages = inventories.filter(
      (inv) => inv.quantity_on_hand === 0 || inv.quantity_on_hand <= Math.floor(inv.min_threshold / 2)
    ).length;

    const activeRequests = requests.filter((r) =>
      ['requested', 'accepted', 'in_transit'].includes(r.status)
    ).length;

    const inTransitCount = requests.filter((r) => r.status === 'in_transit').length;
    const awaitingAcceptanceCount = requests.filter((r) => r.status === 'requested').length;
    const deliveredTodayCount = requests.filter((r) => r.status === 'delivered').length;

    return {
      totalFacilities: facilities.length,
      criticalShortages,
      activeRequests,
      inTransitCount,
      awaitingAcceptanceCount,
      deliveredTodayCount,
    };
  }

  // --- Helpers ---

  private async logInventoryTransaction(params: {
    inventory_id?: string | null;
    facility_id: string;
    item_id: string;
    request_id?: string | null;
    transaction_type: 'receipt' | 'reservation' | 'release' | 'dispatch' | 'adjustment';
    quantity: number;
    performed_by: string;
    notes?: string;
  }) {
    const txRaw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const txs: InventoryTransaction[] = txRaw ? JSON.parse(txRaw) : [];

    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      inventory_id: params.inventory_id,
      facility_id: params.facility_id,
      item_id: params.item_id,
      request_id: params.request_id,
      transaction_type: params.transaction_type,
      quantity: params.quantity,
      performed_by: params.performed_by,
      notes: params.notes,
      created_at: new Date().toISOString(),
    };

    txs.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  }

  private async logRequestEvent(
    requestId: string,
    previousStatus: any,
    newStatus: any,
    actorId: string,
    note?: string
  ) {
    const evRaw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    const evs: RequestEvent[] = evRaw ? JSON.parse(evRaw) : [];

    const newEv: RequestEvent = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      request_id: requestId,
      previous_status: previousStatus,
      new_status: newStatus,
      actor_id: actorId,
      note,
      created_at: new Date().toISOString(),
    };

    evs.push(newEv);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(evs));
  }
}

export const dataService = new DataService();
