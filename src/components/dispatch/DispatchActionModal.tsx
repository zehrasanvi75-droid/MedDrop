import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { SupplyRequest, TransportMode } from '@/types';
import { Truck, Plane, Navigation, Send, AlertTriangle } from 'lucide-react';
import { estimateTravelTimeMinutes, calculateDistanceKm } from '@/services/distance';

interface DispatchActionModalProps {
  request: SupplyRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    requestId: string,
    mode: TransportMode,
    trackingNumber: string
  ) => Promise<void>;
}

export const DispatchActionModal: React.FC<DispatchActionModalProps> = ({
  request,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [transportMode, setTransportMode] = useState<TransportMode>('ground_ambulance');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (request) {
      setTrackingNumber(`TRK-${Math.floor(100000 + Math.random() * 900000)}`);
      setError(null);
    }
  }, [request]);

  if (!request) return null;

  const distanceKm =
    request.supplying_facility && request.requesting_facility
      ? calculateDistanceKm(
          request.supplying_facility.latitude,
          request.supplying_facility.longitude,
          request.requesting_facility.latitude,
          request.requesting_facility.longitude
        )
      : 50;

  const estimatedMinutes = estimateTravelTimeMinutes(distanceKm, transportMode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirm(request.id, transportMode, trackingNumber);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch supplies.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Authorize Emergency Supply Dispatch"
      subtitle={`Dispatch ${request.quantity_requested}x ${request.item?.name} to ${request.requesting_facility?.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Destination:</span>
            <span className="font-semibold text-slate-800">
              {request.requesting_facility?.name} ({request.requesting_facility?.callsign})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vector Distance:</span>
            <span className="font-mono font-semibold text-slate-800">~{distanceKm} km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Estimated Transit Duration:</span>
            <span className="font-mono font-bold text-blue-700">~{estimatedMinutes} minutes</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Transport Mode <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'ground_ambulance', label: 'Ambulance', icon: Truck, desc: 'All-weather armored' },
              { id: 'air_evac', label: 'Air Evac', icon: Plane, desc: 'Medical helicopter' },
              { id: 'tactical_drone', label: 'Med Drone', icon: Navigation, desc: 'Autonomous cold-box' },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = transportMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTransportMode(m.id as TransportMode)}
                  className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">{m.label}</span>
                  <span className="text-[10px] text-slate-400 text-center mt-0.5">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tracking Callout / Transport Manifest ID
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Dispatching will deduct {request.quantity_requested} units permanently from available hub
            stores and transmit real-time telemetry to the requesting outpost.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="font-bold">
            <Send className="w-4 h-4" />
            <span>Launch Dispatch</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
