import React, { useEffect, useState } from 'react';
import { SupplyRequest, RequestEvent } from '@/types';
import { LifecycleStepper } from './LifecycleStepper';
import { dataService } from '@/services/dataService';
import { calculateDistanceKm } from '@/services/distance';
import { getUrgencyBadgeStyle, getStatusBadgeStyle, formatDateTime, formatTimeAgo } from '@/lib/utils';
import {
  MapPin,
  Clock,
  ShieldCheck,
  User,
  Truck,
  Plane,
  Navigation,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';

interface RequestTrackingDetailProps {
  request: SupplyRequest;
  onClose?: () => void;
  onConfirmDelivery?: (req: SupplyRequest) => void;
}

export const RequestTrackingDetail: React.FC<RequestTrackingDetailProps> = ({
  request,
  onClose,
  onConfirmDelivery,
}) => {
  const [events, setEvents] = useState<RequestEvent[]>([]);

  useEffect(() => {
    dataService.getRequestEvents(request.id).then(setEvents);
  }, [request.id]);

  const urgencyStyle = getUrgencyBadgeStyle(request.urgency);
  const statusStyle = getStatusBadgeStyle(request.status);

  const distanceKm =
    request.supplying_facility && request.requesting_facility
      ? calculateDistanceKm(
          request.supplying_facility.latitude,
          request.supplying_facility.longitude,
          request.requesting_facility.latitude,
          request.requesting_facility.longitude
        )
      : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in zoom-in-98 duration-150 text-slate-800">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
              {request.request_code}
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${urgencyStyle.bg}`}
            >
              {urgencyStyle.label}
            </span>
            {request.incident_reference && (
              <span className="text-[10px] font-mono text-slate-400">
                Ref: {request.incident_reference}
              </span>
            )}
          </div>
          <h2 className="text-base sm:text-lg font-bold mt-1 text-slate-100 flex items-center gap-2">
            <span>{request.quantity_requested}x</span>
            <span>{request.item?.name}</span>
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Stepper */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <LifecycleStepper
            currentStatus={request.status}
            createdAt={request.created_at}
            acceptedAt={request.accepted_at}
            dispatchedAt={request.dispatched_at}
            deliveredAt={request.delivered_at}
          />
        </div>

        {/* Facility & Telemetry Route Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin & Destination */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <span className="font-mono uppercase tracking-wider text-[10px] text-slate-400 font-bold block">
              Logistics Network Vector
            </span>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">
                  {request.requesting_facility?.name} (Requester)
                </p>
                <p className="text-slate-500 text-[11px]">
                  {request.requesting_facility?.region} • Callsign: {request.requesting_facility?.callsign}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/60">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">
                  {request.supplying_facility?.name || 'Awaiting Hub Allocation'}
                </p>
                {request.supplying_facility && (
                  <p className="text-slate-500 text-[11px]">
                    {request.supplying_facility.region} • Callsign: {request.supplying_facility.callsign}
                  </p>
                )}
              </div>
            </div>

            {distanceKm !== null && (
              <div className="pt-2 border-t border-slate-200/60 flex justify-between font-mono text-[11px]">
                <span className="text-slate-500">Vector Distance:</span>
                <span className="font-bold text-slate-800">~{distanceKm} km (Geodesic)</span>
              </div>
            )}
          </div>

          {/* Transport & Tracking Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <span className="font-mono uppercase tracking-wider text-[10px] text-slate-400 font-bold block">
              Custody & Transport Status
            </span>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Current Status:</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                {statusStyle.label}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Transport Mode:</span>
              <span className="font-semibold text-slate-800 uppercase font-mono text-[11px]">
                {request.transport_mode?.replace('_', ' ') || 'Pending Hub Assignment'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tracking Number:</span>
              <span className="font-mono font-bold text-blue-700">
                {request.tracking_number || 'Awaiting Dispatch'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Patient Triage Status:</span>
              <span className="font-semibold text-slate-800">
                {request.patient_status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            {request.status === 'in_transit' && onConfirmDelivery && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => onConfirmDelivery(request)}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Receipt & Sign Handover</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Audit Events Timeline */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Immutable Audit Trail & Status Events ({events.length})
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
            {events.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No events recorded yet
              </div>
            ) : (
              events.map((ev, i) => (
                <div key={ev.id || i} className="p-3 text-xs flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {ev.new_status}
                      </span>
                      <span className="font-semibold text-slate-800">{ev.note}</span>
                    </div>
                    {ev.actor && (
                      <p className="text-[11px] text-slate-400">
                        Action by: {ev.actor.full_name} ({ev.actor.rank_or_title})
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {formatDateTime(ev.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
