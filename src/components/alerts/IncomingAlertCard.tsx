import React, { useState } from 'react';
import { SupplyRequest, InventoryItem, Facility } from '@/types';
import { Button } from '@/components/common/Button';
import { getUrgencyBadgeStyle, getPatientStatusStyle, formatTimeAgo } from '@/lib/utils';
import { calculateDistanceKm } from '@/services/distance';
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  AlertOctagon,
  ShieldAlert,
  Flame,
  Truck,
  Package,
} from 'lucide-react';

interface IncomingAlertCardProps {
  request: SupplyRequest;
  currentFacility: Facility | null;
  localInventory: InventoryItem | undefined;
  onAccept: (request: SupplyRequest) => Promise<void>;
  onReject: (request: SupplyRequest) => void;
}

export const IncomingAlertCard: React.FC<IncomingAlertCardProps> = ({
  request,
  currentFacility,
  localInventory,
  onAccept,
  onReject,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);

  const urgencyStyle = getUrgencyBadgeStyle(request.urgency);
  const patientStyle = getPatientStatusStyle(request.patient_status);

  // Available stock calculation
  const onHand = localInventory?.quantity_on_hand ?? 0;
  const reserved = localInventory?.quantity_reserved ?? 0;
  const availableStock = Math.max(0, onHand - reserved);
  const canFulfill = availableStock >= request.quantity_requested;

  // Distance calculation
  const distanceKm =
    currentFacility && request.requesting_facility
      ? calculateDistanceKm(
          currentFacility.latitude,
          currentFacility.longitude,
          request.requesting_facility.latitude,
          request.requesting_facility.longitude
        )
      : null;

  const isCritical = request.urgency === 'critical';

  const handleAcceptClick = async () => {
    try {
      setIsAccepting(true);
      await onAccept(request);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden shadow-sm bg-white ${
        isCritical
          ? 'border-red-400 ring-2 ring-red-500/30'
          : request.urgency === 'high'
          ? 'border-amber-300'
          : 'border-slate-200'
      }`}
    >
      {/* Tactical Urgency Top Bar */}
      <div
        className={`px-4 py-2 text-xs font-mono font-bold flex items-center justify-between ${
          isCritical
            ? 'bg-red-600 text-white'
            : request.urgency === 'high'
            ? 'bg-amber-500 text-slate-900'
            : 'bg-blue-600 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertOctagon className="w-4 h-4 animate-pulse" />
          ) : (
            <Flame className="w-4 h-4" />
          )}
          <span>
            {request.urgency.toUpperCase()} EMERGENCY DISPATCH REQUEST
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimeAgo(request.created_at)}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Main Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">
                {request.request_code}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${patientStyle.bg}`}
              >
                {patientStyle.label}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{request.requesting_facility?.name || 'Remote Outpost'}</span>
              <span className="text-xs font-mono font-normal text-slate-500">
                ({request.requesting_facility?.callsign})
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Region: {request.requesting_facility?.region || 'Operational Border Sector'}
            </p>
          </div>

          {/* Distance Badge */}
          {distanceKm !== null && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-right shrink-0">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Direct Distance
              </div>
              <div className="text-sm font-mono font-extrabold text-slate-800 flex items-center gap-1 justify-end">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>~{distanceKm} km</span>
              </div>
            </div>
          )}
        </div>

        {/* Requested Supplies & Local Available Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Requested item */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
              Required Medical Supply
            </span>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              {request.item?.blood_group && (
                <span className="text-xs font-mono px-1.5 py-0.2 rounded font-extrabold bg-red-600 text-white">
                  {request.item.blood_group}
                </span>
              )}
              <span>{request.item?.name}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-red-600">
                {request.quantity_requested}
              </span>
              <span className="text-xs text-slate-600 font-semibold">
                {request.item?.unit}
              </span>
            </div>
          </div>

          {/* Local Stock Check */}
          <div
            className={`p-3 rounded-lg border ${
              canFulfill
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-red-50/60 border-red-200'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
              Hub Available Inventory Check
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black font-mono ${
                  canFulfill ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {availableStock}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {request.item?.unit} available
              </span>
            </div>
            <div className="text-[11px] mt-1 text-slate-600">
              {canFulfill ? (
                <span className="text-emerald-800 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Sufficient stock to fulfill ({reserved} units currently reserved)
                </span>
              ) : (
                <span className="text-red-700 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  Insufficient unreserved stock (Need {request.quantity_requested})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Clinical notes if any */}
        {request.notes && (
          <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800 mr-1">Triage Note:</span>
            {request.notes}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Accepting immediately reserves {request.quantity_requested} units atomically.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onReject(request)}
              className="text-red-700 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Request</span>
            </Button>

            <Button
              type="button"
              variant="success"
              size="md"
              disabled={!canFulfill}
              isLoading={isAccepting}
              onClick={handleAcceptClick}
              className="w-full sm:w-auto font-bold shadow-md shadow-emerald-900/10"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Accept & Reserve {request.quantity_requested} Units</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
