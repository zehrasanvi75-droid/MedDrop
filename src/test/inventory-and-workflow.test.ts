import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '@/services/dataService';
import { calculateDistanceKm, estimateTravelTimeMinutes } from '@/services/distance';

describe('MedDrop Core Emergency Workflow & Business Rules', () => {
  beforeEach(() => {
    dataService.resetDemoData();
  });

  it('calculates Haversine distance correctly between facilities', () => {
    // Outpost Alpha (34.1526, 74.8214) to Sector Base Hospital (33.7782, 75.3412)
    const distance = calculateDistanceKm(34.1526, 74.8214, 33.7782, 75.3412);
    expect(distance).toBeGreaterThan(50);
    expect(distance).toBeLessThan(80);
  });

  it('estimates transport travel time based on vehicle type', () => {
    const dist = 60; // 60 km
    const ambulanceTime = estimateTravelTimeMinutes(dist, 'ground_ambulance');
    const airEvacTime = estimateTravelTimeMinutes(dist, 'air_evac');
    const droneTime = estimateTravelTimeMinutes(dist, 'tactical_drone');

    expect(ambulanceTime).toBeGreaterThan(airEvacTime);
    expect(droneTime).toBeLessThan(ambulanceTime);
  });

  it('finds eligible suppliers holding available stock within radius', async () => {
    // Item: O-Negative Blood ('i1111111-1111-1111-1111-111111111111')
    // Outpost Alpha has 0 units. Base Hospital has 10 units.
    const requestingFacilityId = 'f1111111-1111-1111-1111-111111111111';
    const itemId = 'i1111111-1111-1111-1111-111111111111';

    const matches = await dataService.findEligibleSuppliers(
      itemId,
      2, // 2 units requested
      requestingFacilityId,
      100 // 100 km radius
    );

    expect(matches.length).toBeGreaterThan(0);
    const baseHospitalMatch = matches.find(
      (m) => m.facility.id === 'f2222222-2222-2222-2222-222222222222'
    );
    expect(baseHospitalMatch).toBeDefined();
    expect(baseHospitalMatch?.availableStock).toBe(10);
    expect(baseHospitalMatch?.isWithinRadius).toBe(true);
  });

  it('rejects request acceptance if available stock is insufficient', async () => {
    // Create a request for 99 units (exceeding Base Hospital's 10 units)
    const req = await dataService.createEmergencyRequest({
      requesting_facility_id: 'f1111111-1111-1111-1111-111111111111',
      item_id: 'i1111111-1111-1111-1111-111111111111',
      quantity_requested: 99,
      urgency: 'critical',
      patient_status: 'incoming',
      radius_km: 100,
      created_by: 'u1111111-1111-1111-1111-111111111111',
    });

    await expect(
      dataService.acceptAndReserveRequest(
        req.id,
        'f2222222-2222-2222-2222-222222222222',
        'u2222222-2222-2222-2222-222222222222'
      )
    ).rejects.toThrow(/Insufficient available inventory/);
  });

  it('prevents duplicate emergency request submissions for the same item in short timeframe', async () => {
    const requestingFacilityId = 'f1111111-1111-1111-1111-111111111111';
    const itemId = 'i1111111-1111-1111-1111-111111111111';

    await dataService.createEmergencyRequest({
      requesting_facility_id: requestingFacilityId,
      item_id: itemId,
      quantity_requested: 2,
      urgency: 'critical',
      patient_status: 'incoming',
      radius_km: 80,
      created_by: 'u1111111-1111-1111-1111-111111111111',
    });

    // Immediate second attempt for the same facility and item should be blocked
    await expect(
      dataService.createEmergencyRequest({
        requesting_facility_id: requestingFacilityId,
        item_id: itemId,
        quantity_requested: 2,
        urgency: 'critical',
        patient_status: 'incoming',
        radius_km: 80,
        created_by: 'u1111111-1111-1111-1111-111111111111',
      })
    ).rejects.toThrow(/already in progress/);
  });

  it('completes the entire end-to-end lifecycle: Request -> Accept & Reserve -> Dispatch -> Confirm Delivery', async () => {
    const requestingFacilityId = 'f1111111-1111-1111-1111-111111111111'; // Outpost Alpha
    const supplyingFacilityId = 'f2222222-2222-2222-2222-222222222222'; // Base Hospital
    const itemId = 'i1111111-1111-1111-1111-111111111111'; // O- Blood
    const actorId = 'u2222222-2222-2222-2222-222222222222';

    // 1. Initial State: Outpost Alpha has 0 units of O- blood
    let outpostInv = (await dataService.getInventories()).find(
      (i) => i.facility_id === requestingFacilityId && i.item_id === itemId
    );
    expect(outpostInv?.quantity_on_hand).toBe(0);

    // Initial Base Hospital: 10 units on hand, 0 reserved
    let baseInv = (await dataService.getInventories()).find(
      (i) => i.facility_id === supplyingFacilityId && i.item_id === itemId
    );
    expect(baseInv?.quantity_on_hand).toBe(10);
    expect(baseInv?.quantity_reserved).toBe(0);

    // 2. Submit Critical Request for 2 units
    const request = await dataService.createEmergencyRequest({
      requesting_facility_id: requestingFacilityId,
      item_id: itemId,
      quantity_requested: 2,
      urgency: 'critical',
      patient_status: 'incoming',
      radius_km: 80,
      notes: 'Patient hemorrhaging, universal donor blood required',
      incident_reference: 'INC-2026-TEST',
      created_by: 'u1111111-1111-1111-1111-111111111111',
    });

    expect(request.status).toBe('requested');

    // 3. Base Hospital Accepts & Reserves
    const acceptedReq = await dataService.acceptAndReserveRequest(
      request.id,
      supplyingFacilityId,
      actorId
    );
    expect(acceptedReq.status).toBe('accepted');
    expect(acceptedReq.supplying_facility_id).toBe(supplyingFacilityId);

    // Verify atomic reservation in inventory
    baseInv = (await dataService.getInventories()).find(
      (i) => i.facility_id === supplyingFacilityId && i.item_id === itemId
    );
    expect(baseInv?.quantity_on_hand).toBe(10);
    expect(baseInv?.quantity_reserved).toBe(2); // 2 units atomically reserved

    // 4. Base Hospital Dispatches supplies
    const dispatchedReq = await dataService.dispatchSupplies(
      request.id,
      actorId,
      'ground_ambulance',
      'TRK-AMB-9988'
    );
    expect(dispatchedReq.status).toBe('in_transit');
    expect(dispatchedReq.tracking_number).toBe('TRK-AMB-9988');

    // Verify stock is decremented and reservation cleared
    baseInv = (await dataService.getInventories()).find(
      (i) => i.facility_id === supplyingFacilityId && i.item_id === itemId
    );
    expect(baseInv?.quantity_on_hand).toBe(8); // 10 - 2 = 8
    expect(baseInv?.quantity_reserved).toBe(0);

    // 5. Receiving facility confirms delivery
    const deliveredReq = await dataService.confirmDelivery(
      request.id,
      'u1111111-1111-1111-1111-111111111111',
      'Capt. Elena Rostova'
    );
    expect(deliveredReq.status).toBe('delivered');
    expect(deliveredReq.delivered_at).toBeDefined();

    // Verify Outpost Alpha's stock is restocked (+2 units)
    outpostInv = (await dataService.getInventories()).find(
      (i) => i.facility_id === requestingFacilityId && i.item_id === itemId
    );
    expect(outpostInv?.quantity_on_hand).toBe(2);

    // 6. Verify Audit Transactions Log
    const transactions = await dataService.getTransactions();
    const relatedTx = transactions.filter((t) => t.request_id === request.id);
    expect(relatedTx.some((t) => t.transaction_type === 'reservation')).toBe(true);
    expect(relatedTx.some((t) => t.transaction_type === 'dispatch')).toBe(true);
    expect(relatedTx.some((t) => t.transaction_type === 'receipt')).toBe(true);

    // 7. Verify Dashboard Stats are dynamically calculated
    const stats = await dataService.getDashboardStats();
    expect(stats.deliveredTodayCount).toBeGreaterThanOrEqual(1);
  });

  it('releases reserved inventory upon request cancellation', async () => {
    const requestingFacilityId = 'f1111111-1111-1111-1111-111111111111';
    const supplyingFacilityId = 'f2222222-2222-2222-2222-222222222222';
    const itemId = 'i2222222-2222-2222-2222-222222222222'; // Snake Antivenom

    const req = await dataService.createEmergencyRequest({
      requesting_facility_id: requestingFacilityId,
      item_id: itemId,
      quantity_requested: 3,
      urgency: 'high',
      patient_status: 'on_site',
      radius_km: 70,
      created_by: 'u1111111-1111-1111-1111-111111111111',
    });

    await dataService.acceptAndReserveRequest(
      req.id,
      supplyingFacilityId,
      'u2222222-2222-2222-2222-222222222222'
    );

    let inv = (await dataService.getInventories()).find(
      (i) => i.facility_id === supplyingFacilityId && i.item_id === itemId
    );
    expect(inv?.quantity_reserved).toBe(3);

    // Cancel request
    await dataService.rejectOrCancelRequest(
      req.id,
      'u1111111-1111-1111-1111-111111111111',
      'cancel',
      'Patient transported to higher echelon clinic'
    );

    // Reservation must be released back to 0
    inv = (await dataService.getInventories()).find(
      (i) => i.facility_id === supplyingFacilityId && i.item_id === itemId
    );
    expect(inv?.quantity_reserved).toBe(0);
  });

  it('rejects invalid status transitions gracefully', async () => {
    const requestingFacilityId = 'f1111111-1111-1111-1111-111111111111';
    const itemId = 'i3333333-3333-3333-3333-333333333333'; // Trauma kit

    const req = await dataService.createEmergencyRequest({
      requesting_facility_id: requestingFacilityId,
      item_id: itemId,
      quantity_requested: 1,
      urgency: 'moderate',
      patient_status: 'stabilized',
      radius_km: 50,
      created_by: 'u1111111-1111-1111-1111-111111111111',
    });

    // Cannot dispatch directly without acceptance
    await expect(
      dataService.dispatchSupplies(req.id, 'actor-1')
    ).rejects.toThrow(/Cannot dispatch request in status 'requested'/);

    // Cannot confirm delivery on an unaccepted request
    await expect(
      dataService.confirmDelivery(req.id, 'actor-1', 'Test Officer')
    ).rejects.toThrow(/Cannot confirm delivery for status 'requested'/);
  });
});
