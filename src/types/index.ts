// Domain Types for MedDrop

export type FacilityType = 'outpost' | 'relief_camp' | 'clinic' | 'base_hospital';

export type UserRole = 'requester' | 'supplier' | 'administrator';

export type SupplyCategory = 
  | 'Blood Products' 
  | 'Antivenoms' 
  | 'Trauma & Surgical' 
  | 'Emergency Medicine' 
  | 'Burn Care';

export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type RequestUrgency = 'critical' | 'high' | 'moderate';

export type PatientStatus = 'incoming' | 'on_site' | 'stabilized';

export type RequestStatus = 
  | 'requested' 
  | 'accepted' 
  | 'dispatched' 
  | 'in_transit' 
  | 'delivered' 
  | 'rejected' 
  | 'cancelled';

export type TransportMode = 
  | 'ground_ambulance' 
  | 'air_evac' 
  | 'tactical_drone' 
  | 'all_terrain';

export type TransactionType = 
  | 'receipt' 
  | 'reservation' 
  | 'release' 
  | 'dispatch' 
  | 'adjustment';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  latitude: number;
  longitude: number;
  region: string;
  callsign: string;
  contact_frequency: string;
  is_active: boolean;
  created_at?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  facility_id: string | null;
  callsign: string;
  rank_or_title: string;
  created_at?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: SupplyCategory;
  unit: string;
  blood_group: BloodGroup | null;
  is_blood_product: boolean;
  storage_temp: string;
  notes?: string;
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  facility_id: string;
  item_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  min_threshold: number;
  updated_at: string;
  // Join fields:
  facility?: Facility;
  item?: SupplyItem;
}

export interface SupplyRequest {
  id: string;
  request_code: string;
  requesting_facility_id: string;
  supplying_facility_id: string | null;
  item_id: string;
  quantity_requested: number;
  urgency: RequestUrgency;
  patient_status: PatientStatus;
  radius_km: number;
  notes?: string;
  incident_reference?: string;
  status: RequestStatus;
  rejection_reason?: string;
  transport_mode?: TransportMode;
  tracking_number?: string;
  estimated_arrival?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string | null;
  dispatched_at?: string | null;
  delivered_at?: string | null;
  // Join fields:
  requesting_facility?: Facility;
  supplying_facility?: Facility;
  item?: SupplyItem;
  creator?: Profile;
}

export interface InventoryTransaction {
  id: string;
  inventory_id?: string | null;
  facility_id: string;
  item_id: string;
  request_id?: string | null;
  transaction_type: TransactionType;
  quantity: number;
  performed_by: string;
  notes?: string;
  created_at: string;
  // Join fields:
  facility?: Facility;
  item?: SupplyItem;
  performer?: Profile;
  request?: SupplyRequest;
}

export interface RequestEvent {
  id: string;
  request_id: string;
  previous_status: RequestStatus | null;
  new_status: RequestStatus;
  actor_id: string;
  note?: string;
  created_at: string;
  actor?: Profile;
}

export interface EligibleSupplierMatch {
  facility: Facility;
  inventory: InventoryItem;
  distanceKm: number;
  availableStock: number;
  isWithinRadius: boolean;
}

export interface DashboardStats {
  totalFacilities: number;
  criticalShortages: number;
  activeRequests: number;
  inTransitCount: number;
  awaitingAcceptanceCount: number;
  deliveredTodayCount: number;
}
