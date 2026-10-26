import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Facility, SupplyItem, EligibleSupplierMatch, RequestUrgency, PatientStatus, InventoryItem } from '@/types';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';
import {
  Flame,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Hospital,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (requestId: string) => void;
  preselectedItem?: InventoryItem | null;
}

export const EmergencyRequestModal: React.FC<EmergencyRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedItem,
}) => {
  const { currentProfile, currentFacility, availableProfiles } = useAuth();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([]);
  const [requestingFacilityId, setRequestingFacilityId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(2);
  const [urgency, setUrgency] = useState<RequestUrgency>('critical');
  const [patientStatus, setPatientStatus] = useState<PatientStatus>('incoming');
  const [radiusKm, setRadiusKm] = useState<number>(80);
  const [notes, setNotes] = useState<string>('Mass casualty triage; emergency blood resuscitation required immediately.');
  const [incidentReference, setIncidentReference] = useState<string>('INC-2026-EMERG');

  const [eligibleSuppliers, setEligibleSuppliers] = useState<EligibleSupplierMatch[]>([]);
  const [isSearchingSuppliers, setIsSearchingSuppliers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load items and facilities
  useEffect(() => {
    if (!isOpen) return;

    const loadFormData = async () => {
      const [fList, iList] = await Promise.all([
        dataService.getFacilities(),
        dataService.getSupplyItems(),
      ]);
      setFacilities(fList);
      setSupplyItems(iList);

      const defaultFacilityId = currentFacility?.id || fList[0]?.id || '';
      setRequestingFacilityId(defaultFacilityId);

      if (preselectedItem?.item_id) {
        setSelectedItemId(preselectedItem.item_id);
      } else if (!selectedItemId && iList.length > 0) {
        setSelectedItemId(iList[0].id);
      }
    };

    loadFormData();
  }, [isOpen, currentFacility, preselectedItem]);

  // Discover eligible suppliers in real time as inputs change
  useEffect(() => {
    if (!isOpen || !selectedItemId || !requestingFacilityId) return;

    let isMounted = true;
    setIsSearchingSuppliers(true);

    dataService
      .findEligibleSuppliers(selectedItemId, quantity, requestingFacilityId, radiusKm)
      .then((matches) => {
        if (isMounted) {
          setEligibleSuppliers(matches);
          setIsSearchingSuppliers(false);
        }
      })
      .catch((err) => {
        console.error('Error finding suppliers', err);
        if (isMounted) setIsSearchingSuppliers(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedItemId, quantity, requestingFacilityId, radiusKm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingFacilityId || !selectedItemId || quantity <= 0) {
      setErrorMessage('Please fill in all required emergency request parameters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const newReq = await dataService.createEmergencyRequest({
        requesting_facility_id: requestingFacilityId,
        item_id: selectedItemId,
        quantity_requested: Number(quantity),
        urgency,
        patient_status: patientStatus,
        radius_km: Number(radiusKm),
        notes,
        incident_reference: incidentReference,
        created_by: currentProfile.id,
      });

      onSuccess(newReq.id);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit emergency request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItemObj = supplyItems.find((i) => i.id === selectedItemId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Emergency Supply"
      subtitle="Broadcast an immediate operational resupply request across the tactical medical network"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-xs font-semibold text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Requesting Facility */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Requesting Outpost / Camp <span className="text-red-500">*</span>
            </label>
            <select
              value={requestingFacilityId}
              onChange={(e) => setRequestingFacilityId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.callsign}) — {f.type}
                </option>
              ))}
            </select>
          </div>

          {/* Supply Item */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Required Medical Supply <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            >
              {supplyItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.blood_group ? `[${item.blood_group}] ` : ''}
                  {item.name} ({item.unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity, Urgency & Patient Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Quantity Requested ({selectedItemObj?.unit || 'Units'}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold font-mono focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Triage Urgency <span className="text-red-500">*</span>
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as RequestUrgency)}
              className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm font-bold focus:outline-none ${
                urgency === 'critical'
                  ? 'border-red-400 bg-red-50 text-red-800'
                  : urgency === 'high'
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-blue-400 bg-blue-50 text-blue-800'
              }`}
            >
              <option value="critical">CRITICAL (Immediate Life-Threat)</option>
              <option value="high">HIGH (Urgent Under 2 Hours)</option>
              <option value="moderate">MODERATE (Stabilized Routine)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Patient Status <span className="text-red-500">*</span>
            </label>
            <select
              value={patientStatus}
              onChange={(e) => setPatientStatus(e.target.value as PatientStatus)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="incoming">Patient Incoming / En Route</option>
              <option value="on_site">Patient On Site (Active Care)</option>
              <option value="stabilized">Patient Stabilized (Reserve Stock)</option>
            </select>
          </div>
        </div>

        {/* Radius Slider with Visual Feedback */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              Eligible Search Radius: <span className="text-blue-700 font-mono text-sm">{radiusKm} km</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Max range: 200 km</span>
          </div>
          <input
            type="range"
            min="15"
            max="200"
            step="5"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />

          {/* Supplier Discovery Live Preview */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Hospital className="w-3.5 h-3.5 text-emerald-600" />
                Matching Facilities with Sufficient Stock ({eligibleSuppliers.length})
              </span>
              {isSearchingSuppliers && (
                <span className="text-[11px] text-slate-400 animate-pulse">Scanning Grid...</span>
              )}
            </div>

            {eligibleSuppliers.length === 0 ? (
              <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                No nearby facilities currently hold &ge; {quantity} available unreserved units of this item. Try increasing the search radius.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {eligibleSuppliers.map((m) => (
                  <div
                    key={m.facility.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="font-bold text-slate-800">{m.facility.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">({m.facility.type})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                        {m.availableStock} units available
                      </span>
                      <span className="font-mono text-slate-600 font-semibold text-[11px]">
                        ~{m.distanceKm} km
                      </span>
                      {m.isWithinRadius ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                          IN RANGE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">OUT OF RADIUS</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes & Incident Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Notes / Clinical Context
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Critical trauma resuscitation, shrapnel injury, antivenom administration"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Incident Ref / Tag
            </label>
            <input
              type="text"
              value={incidentReference}
              onChange={(e) => setIncidentReference(e.target.value)}
              placeholder="INC-2026-01"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <p className="text-[11px] text-slate-400">
            Request will trigger real-time audible and visual alarms at eligible base hubs.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="md"
              isLoading={isSubmitting}
              className="shadow-md shadow-red-900/20 font-bold"
            >
              <Flame className="w-4 h-4" />
              <span>Broadcast Emergency Request</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
