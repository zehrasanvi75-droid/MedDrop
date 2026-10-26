import {
  Facility,
  Profile,
  SupplyItem,
  InventoryItem,
  SupplyRequest,
  InventoryTransaction,
  RequestEvent,
} from '@/types';

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    name: 'Outpost Alpha',
    type: 'outpost',
    latitude: 34.1526,
    longitude: 74.8214,
    region: 'Northern Mountain Sector',
    callsign: 'VIPER-1',
    contact_frequency: 'VHF 142.850 MHz',
    is_active: true,
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    name: 'Sector Base Hospital',
    type: 'base_hospital',
    latitude: 33.7782,
    longitude: 75.3412,
    region: 'Sector 4 Central Logistics Hub',
    callsign: 'AEGIS-BASE',
    contact_frequency: 'VHF 156.800 MHz',
    is_active: true,
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    name: 'Relief Camp Bravo',
    type: 'relief_camp',
    latitude: 33.5512,
    longitude: 74.9821,
    region: 'Valley Disaster Relief Zone',
    callsign: 'HAVEN-2',
    contact_frequency: 'VHF 148.225 MHz',
    is_active: true,
  },
  {
    id: 'f4444444-4444-4444-4444-444444444444',
    name: 'Forward Clinic Delta',
    type: 'clinic',
    latitude: 34.321,
    longitude: 74.412,
    region: 'Western Ridge Tactical Station',
    callsign: 'FALCON-4',
    contact_frequency: 'VHF 139.400 MHz',
    is_active: true,
  },
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'u1111111-1111-1111-1111-111111111111',
    full_name: 'Capt. Elena Rostova, MD',
    role: 'requester',
    facility_id: 'f1111111-1111-1111-1111-111111111111',
    callsign: 'VIPER-LEAD',
    rank_or_title: 'Senior Field Surgeon',
  },
  {
    id: 'u2222222-2222-2222-2222-222222222222',
    full_name: 'Col. David Vance',
    role: 'supplier',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    callsign: 'AEGIS-DISPATCH',
    rank_or_title: 'Base Logistics Director',
  },
  {
    id: 'u3333333-3333-3333-3333-333333333333',
    full_name: 'Dr. Aisha Patel',
    role: 'requester',
    facility_id: 'f3333333-3333-3333-3333-333333333333',
    callsign: 'HAVEN-CHIEF',
    rank_or_title: 'Camp Medical Director',
  },
  {
    id: 'u4444444-4444-4444-4444-444444444444',
    full_name: 'Gen. Marcus Reed',
    role: 'administrator',
    facility_id: null,
    callsign: 'COMMAND-ACTUAL',
    rank_or_title: 'Regional Operations Director',
  },
];

export const INITIAL_SUPPLY_ITEMS: SupplyItem[] = [
  {
    id: 'i1111111-1111-1111-1111-111111111111',
    name: 'O-Negative Whole Blood (Universal Donor)',
    category: 'Blood Products',
    unit: 'Units (450ml)',
    blood_group: 'O-',
    is_blood_product: true,
    storage_temp: '2°C to 6°C',
    notes: 'Critical for unmatched emergency resuscitations in active hemorrhagic shock',
  },
  {
    id: 'i2222222-2222-2222-2222-222222222222',
    name: 'Polyvalent Snake Antivenom',
    category: 'Antivenoms',
    unit: 'Vials (10ml)',
    blood_group: null,
    is_blood_product: false,
    storage_temp: '2°C to 8°C',
    notes: 'Effective against Russell Viper, Saw-scaled Viper, and Cobra bites',
  },
  {
    id: 'i3333333-3333-3333-3333-333333333333',
    name: 'Tactical Trauma & Surgical Kit (TCCC)',
    category: 'Trauma & Surgical',
    unit: 'Kits',
    blood_group: null,
    is_blood_product: false,
    storage_temp: 'Ambient',
    notes: 'Sterile surgical set, chest seals, NPA, needle decompressors, and suture packs',
  },
  {
    id: 'i4444444-4444-4444-4444-444444444444',
    name: 'Hydrogel Burn Dressings (10x10cm)',
    category: 'Burn Care',
    unit: 'Packs (5pcs)',
    blood_group: null,
    is_blood_product: false,
    storage_temp: 'Ambient',
    notes: 'Sterile cooling hydrogel dressings for 2nd and 3rd degree burns',
  },
  {
    id: 'i5555555-5555-5555-5555-555555555555',
    name: 'Combat Application Tourniquet (CAT Gen 7)',
    category: 'Trauma & Surgical',
    unit: 'Units',
    blood_group: null,
    is_blood_product: false,
    storage_temp: 'Ambient',
    notes: 'Arterial tourniquet for extremity blast trauma and severe bleeding',
  },
  {
    id: 'i6666666-6666-6666-6666-666666666666',
    name: 'O-Positive Whole Blood',
    category: 'Blood Products',
    unit: 'Units (450ml)',
    blood_group: 'O+',
    is_blood_product: true,
    storage_temp: '2°C to 6°C',
    notes: 'Standard resuscitation for Rh+ confirmed trauma casualties',
  },
  {
    id: 'i7777777-7777-7777-7777-777777777777',
    name: 'Tranexamic Acid (TXA) 1000mg IV',
    category: 'Emergency Medicine',
    unit: 'Vials',
    blood_group: null,
    is_blood_product: false,
    storage_temp: '15°C to 25°C',
    notes: 'Antifibrinolytic infusion for severe blast trauma hemorrhage',
  },
  {
    id: 'i8888888-8888-8888-8888-888888888888',
    name: 'Sterile Saline 0.9% IV (1000ml)',
    category: 'Emergency Medicine',
    unit: 'Bags',
    blood_group: null,
    is_blood_product: false,
    storage_temp: 'Ambient',
    notes: 'Primary volume resuscitation and intravenous access maintenance',
  },
];

export const INITIAL_INVENTORIES: InventoryItem[] = [
  // Outpost Alpha: 0 units O- blood (CRITICAL), 3 snake antivenom (LOW), 2 burn dressings
  {
    id: 'inv-101',
    facility_id: 'f1111111-1111-1111-1111-111111111111',
    item_id: 'i1111111-1111-1111-1111-111111111111', // O- blood
    quantity_on_hand: 0,
    quantity_reserved: 0,
    min_threshold: 4,
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'inv-102',
    facility_id: 'f1111111-1111-1111-1111-111111111111',
    item_id: 'i2222222-2222-2222-2222-222222222222', // Snake Antivenom
    quantity_on_hand: 3,
    quantity_reserved: 0,
    min_threshold: 5,
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'inv-103',
    facility_id: 'f1111111-1111-1111-1111-111111111111',
    item_id: 'i3333333-3333-3333-3333-333333333333', // Trauma Kit
    quantity_on_hand: 4,
    quantity_reserved: 0,
    min_threshold: 4,
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'inv-104',
    facility_id: 'f1111111-1111-1111-1111-111111111111',
    item_id: 'i4444444-4444-4444-4444-444444444444', // Burn Dressing
    quantity_on_hand: 2,
    quantity_reserved: 0,
    min_threshold: 5,
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'inv-105',
    facility_id: 'f1111111-1111-1111-1111-111111111111',
    item_id: 'i5555555-5555-5555-5555-555555555555', // Tourniquet
    quantity_on_hand: 6,
    quantity_reserved: 0,
    min_threshold: 4,
    updated_at: new Date(Date.now() - 18000000).toISOString(),
  },

  // Sector Base Hospital: 10 units O- blood (AVAILABLE), 12 trauma kits, 15 antivenom, etc.
  {
    id: 'inv-201',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    item_id: 'i1111111-1111-1111-1111-111111111111', // O- blood
    quantity_on_hand: 10,
    quantity_reserved: 0,
    min_threshold: 4,
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'inv-202',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    item_id: 'i2222222-2222-2222-2222-222222222222', // Snake Antivenom
    quantity_on_hand: 15,
    quantity_reserved: 0,
    min_threshold: 5,
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'inv-203',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    item_id: 'i3333333-3333-3333-3333-333333333333', // Trauma Kit
    quantity_on_hand: 12,
    quantity_reserved: 0,
    min_threshold: 5,
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'inv-204',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    item_id: 'i4444444-4444-4444-4444-444444444444', // Burn Dressing
    quantity_on_hand: 18,
    quantity_reserved: 0,
    min_threshold: 6,
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'inv-205',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    item_id: 'i5555555-5555-5555-5555-555555555555', // Tourniquets
    quantity_on_hand: 25,
    quantity_reserved: 0,
    min_threshold: 8,
    updated_at: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: 'inv-206',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    item_id: 'i6666666-6666-6666-6666-666666666666', // O+ blood
    quantity_on_hand: 16,
    quantity_reserved: 0,
    min_threshold: 5,
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'inv-207',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    item_id: 'i7777777-7777-7777-7777-777777777777', // TXA
    quantity_on_hand: 30,
    quantity_reserved: 0,
    min_threshold: 10,
    updated_at: new Date(Date.now() - 21600000).toISOString(),
  },

  // Relief Camp Bravo: 8 packs burn dressings, 6 O+ blood, 2 tourniquets
  {
    id: 'inv-301',
    facility_id: 'f3333333-3333-3333-3333-333333333333',
    item_id: 'i4444444-4444-4444-4444-444444444444', // Burn Dressing
    quantity_on_hand: 8,
    quantity_reserved: 0,
    min_threshold: 5,
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'inv-302',
    facility_id: 'f3333333-3333-3333-3333-333333333333',
    item_id: 'i6666666-6666-6666-6666-666666666666', // O+ blood
    quantity_on_hand: 6,
    quantity_reserved: 0,
    min_threshold: 4,
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'inv-303',
    facility_id: 'f3333333-3333-3333-3333-333333333333',
    item_id: 'i5555555-5555-5555-5555-555555555555', // Tourniquet
    quantity_on_hand: 2,
    quantity_reserved: 0,
    min_threshold: 4,
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },

  // Forward Clinic Delta: 4 trauma kits, 5 saline IV
  {
    id: 'inv-401',
    facility_id: 'f4444444-4444-4444-4444-444444444444',
    item_id: 'i3333333-3333-3333-3333-333333333333',
    quantity_on_hand: 4,
    quantity_reserved: 0,
    min_threshold: 4,
    updated_at: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'inv-402',
    facility_id: 'f4444444-4444-4444-4444-444444444444',
    item_id: 'i8888888-8888-8888-8888-888888888888',
    quantity_on_hand: 14,
    quantity_reserved: 0,
    min_threshold: 8,
    updated_at: new Date(Date.now() - 21600000).toISOString(),
  },
];

export const INITIAL_REQUESTS: SupplyRequest[] = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    request_code: 'REQ-2026-089',
    requesting_facility_id: 'f3333333-3333-3333-3333-333333333333', // Relief Camp Bravo
    supplying_facility_id: 'f2222222-2222-2222-2222-222222222222', // Base Hospital
    item_id: 'i4444444-4444-4444-4444-444444444444', // Burn dressing
    quantity_requested: 4,
    urgency: 'high',
    patient_status: 'stabilized',
    radius_km: 75.0,
    notes: 'Valley wildfire casualty management; burn dressing stock depleted during triage',
    incident_reference: 'INC-FIRE-04',
    status: 'in_transit',
    transport_mode: 'ground_ambulance',
    tracking_number: 'TRK-MED-8472',
    created_by: 'u3333333-3333-3333-3333-333333333333',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60000).toISOString(),
    accepted_at: new Date(Date.now() - 35 * 60000).toISOString(),
    dispatched_at: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: 'r2222222-2222-2222-2222-222222222222',
    request_code: 'REQ-2026-084',
    requesting_facility_id: 'f4444444-4444-4444-4444-444444444444', // Clinic Delta
    supplying_facility_id: 'f2222222-2222-2222-2222-222222222222', // Base Hospital
    item_id: 'i2222222-2222-2222-2222-222222222222', // Snake Antivenom
    quantity_requested: 2,
    urgency: 'critical',
    patient_status: 'on_site',
    radius_km: 60.0,
    notes: 'Severe Russell viper bite with systemic coagulopathy',
    incident_reference: 'INC-BIO-09',
    status: 'delivered',
    transport_mode: 'air_evac',
    tracking_number: 'TRK-AIR-1029',
    created_by: 'u1111111-1111-1111-1111-111111111111',
    created_at: new Date(Date.now() - 180 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 60000).toISOString(),
    accepted_at: new Date(Date.now() - 165 * 60000).toISOString(),
    dispatched_at: new Date(Date.now() - 130 * 60000).toISOString(),
    delivered_at: new Date(Date.now() - 40 * 60000).toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-001',
    inventory_id: 'inv-204',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    item_id: 'i4444444-4444-4444-4444-444444444444',
    request_id: 'r1111111-1111-1111-1111-111111111111',
    transaction_type: 'dispatch',
    quantity: -4,
    performed_by: 'u2222222-2222-2222-2222-222222222222',
    notes: 'Dispatched 4 packs burn dressings via Ground Ambulance TRK-MED-8472',
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: 'tx-002',
    inventory_id: 'inv-202',
    facility_id: 'f2222222-2222-2222-2222-222222222222',
    item_id: 'i2222222-2222-2222-2222-222222222222',
    request_id: 'r2222222-2222-2222-2222-222222222222',
    transaction_type: 'dispatch',
    quantity: -2,
    performed_by: 'u2222222-2222-2222-2222-222222222222',
    notes: 'Dispatched 2 vials Snake Antivenom via Air Evac TRK-AIR-1029',
    created_at: new Date(Date.now() - 130 * 60000).toISOString(),
  },
  {
    id: 'tx-003',
    inventory_id: null,
    facility_id: 'f4444444-4444-4444-4444-444444444444',
    item_id: 'i2222222-2222-2222-2222-222222222222',
    request_id: 'r2222222-2222-2222-2222-222222222222',
    transaction_type: 'receipt',
    quantity: 2,
    performed_by: 'u1111111-1111-1111-1111-111111111111',
    notes: 'Received and verified at Forward Clinic Delta',
    created_at: new Date(Date.now() - 40 * 60000).toISOString(),
  },
];

export const INITIAL_REQUEST_EVENTS: RequestEvent[] = [
  {
    id: 'ev-001',
    request_id: 'r1111111-1111-1111-1111-111111111111',
    previous_status: null,
    new_status: 'requested',
    actor_id: 'u3333333-3333-3333-3333-333333333333',
    note: 'Emergency request submitted by Relief Camp Bravo',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 'ev-002',
    request_id: 'r1111111-1111-1111-1111-111111111111',
    previous_status: 'requested',
    new_status: 'accepted',
    actor_id: 'u2222222-2222-2222-2222-222222222222',
    note: 'Request accepted; 4 units reserved by Sector Base Hospital',
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: 'ev-003',
    request_id: 'r1111111-1111-1111-1111-111111111111',
    previous_status: 'accepted',
    new_status: 'in_transit',
    actor_id: 'u2222222-2222-2222-2222-222222222222',
    note: 'Dispatched via Ground Ambulance TRK-MED-8472',
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
  },
];
