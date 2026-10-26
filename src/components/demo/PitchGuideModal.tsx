import React from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';
import { NavTab } from '@/components/layout/Sidebar';
import { CheckCircle2, ArrowRight, ShieldAlert, Radio, Hospital, Check } from 'lucide-react';

interface PitchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onRequestEmergencyModal: () => void;
}

export const PitchGuideModal: React.FC<PitchGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onRequestEmergencyModal,
}) => {
  const { availableProfiles, switchProfile } = useAuth();

  const outpostProfile = availableProfiles.find(
    (p) => p.facility_id === 'f1111111-1111-1111-1111-111111111111'
  );
  const baseHospitalProfile = availableProfiles.find(
    (p) => p.facility_id === 'f2222222-2222-2222-2222-222222222222'
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MedDrop 3-Minute Hackathon Demo Script"
      subtitle="Follow this exact sequence to demonstrate the end-to-end emergency logistics workflow"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-left">
        {/* Step 1 */}
        <div className="p-4 rounded-lg border border-red-200 bg-red-50/70">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-red-950 text-sm">
                Minute 1 — Identify Critical Emergency (Outpost Alpha)
              </h4>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
              0:00 - 1:00
            </span>
          </div>

          <p className="text-xs text-red-900 mt-2 leading-relaxed">
            Switch to <strong>Outpost Alpha</strong> (Capt. Elena Rostova). Inspect the dashboard to see the
            critical warning: <strong>0 units of O-Negative Blood remaining</strong> with incoming casualty.
            Click <strong>Request Emergency Supply</strong> to search for nearby eligible facilities and submit
            a Critical request for 2 units.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (outpostProfile) switchProfile(outpostProfile.id);
                onNavigate('dashboard');
                onClose();
              }}
            >
              <Radio className="w-3.5 h-3.5" />
              1. Switch to Outpost Alpha
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (outpostProfile) switchProfile(outpostProfile.id);
                onRequestEmergencyModal();
                onClose();
              }}
            >
              2. Open Emergency Request Form
            </Button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/70">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-amber-950 text-sm">
                Minute 2 — Coordinate Response & Reserve Stock (Sector Base Hospital)
              </h4>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              1:00 - 2:00
            </span>
          </div>

          <p className="text-xs text-amber-900 mt-2 leading-relaxed">
            Switch to <strong>Sector Base Hospital</strong> (Col. David Vance). Hear the audio alarm
            and observe the new incoming Critical alert on the Alerts Board. Check the straight-line
            distance (~65 km) and available stock (10 units). Click <strong>Accept & Reserve</strong>
            to atomically reserve the 2 units and prevent concurrent over-allocation.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="amber"
              onClick={() => {
                if (baseHospitalProfile) switchProfile(baseHospitalProfile.id);
                onNavigate('alerts');
                onClose();
              }}
            >
              <Hospital className="w-3.5 h-3.5" />
              1. Switch to Base Hospital Alerts
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onNavigate('map');
                onClose();
              }}
            >
              2. View Tactical Map
            </Button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/70">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-emerald-950 text-sm">
                Minute 3 — Dispatch & Confirm Delivery (Full Audit Closure)
              </h4>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              2:00 - 3:00
            </span>
          </div>

          <p className="text-xs text-emerald-900 mt-2 leading-relaxed">
            Go to <strong>Dispatch Management</strong>. Choose transport mode (Ground Ambulance / Air Evac / Drone)
            and click <strong>Dispatch Supplies</strong>. Observe that on-hand stock is decremented and status moves
            to <strong>In Transit</strong>. Switch back to <strong>Outpost Alpha</strong> or stay on tracking and click
            <strong>Confirm Delivery</strong>. Verify the audit log and inventory update (+2 units replenished)!
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="success"
              onClick={() => {
                onNavigate('dispatch');
                onClose();
              }}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Open Dispatch Board
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onNavigate('reports');
                onClose();
              }}
            >
              View Audit Log & Reports
            </Button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="tactical" size="sm" onClick={onClose}>
            Got it, Let's Demo
          </Button>
        </div>
      </div>
    </Modal>
  );
};
