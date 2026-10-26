import React, { useState } from 'react';
import { SupplyRequest, TransportMode } from '@/types';
import { Button } from '@/components/common/Button';
import { getUrgencyBadgeStyle, formatTimeAgo } from '@/lib/utils';
import { DispatchActionModal } from './DispatchActionModal';
import { DeliveryConfirmModal } from './DeliveryConfirmModal';
import {
  Truck,
  Plane,
  Navigation,
  CheckCircle2,
  Send,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Eye,
} from 'lucide-react';

interface DispatchKanbanProps {
  requests: SupplyRequest[];
  onDispatch: (requestId: string, mode: TransportMode, tracking: string) => Promise<void>;
  onConfirmDelivery: (requestId: string, receiverName: string) => Promise<void>;
  onSelectRequest: (request: SupplyRequest) => void;
  onRefresh: () => void;
}

export const DispatchKanban: React.FC<DispatchKanbanProps> = ({
  requests,
  onDispatch,
  onConfirmDelivery,
  onSelectRequest,
  onRefresh,
}) => {
  const [dispatchingReq, setDispatchingReq] = useState<SupplyRequest | null>(null);
  const [deliveringReq, setDeliveringReq] = useState<SupplyRequest | null>(null);

  const columns = [
    {
      id: 'requested',
      title: 'Awaiting Hub Acceptance',
      filter: (r: SupplyRequest) => r.status === 'requested',
      headerBg: 'bg-amber-500/10 text-amber-900 border-amber-200',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'accepted',
      title: 'Accepted & Stock Reserved',
      filter: (r: SupplyRequest) => r.status === 'accepted',
      headerBg: 'bg-blue-500/10 text-blue-900 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'in_transit',
      title: 'In Transit / Dispatched',
      filter: (r: SupplyRequest) => r.status === 'in_transit',
      headerBg: 'bg-indigo-500/10 text-indigo-900 border-indigo-200',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'delivered',
      title: 'Delivered & Closed',
      filter: (r: SupplyRequest) => r.status === 'delivered',
      headerBg: 'bg-emerald-500/10 text-emerald-900 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
  ];

  const getTransportIcon = (mode?: string) => {
    switch (mode) {
      case 'air_evac':
        return <Plane className="w-3.5 h-3.5 text-blue-600" />;
      case 'tactical_drone':
        return <Navigation className="w-3.5 h-3.5 text-purple-600" />;
      case 'ground_ambulance':
      default:
        return <Truck className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">
            Dispatch Lifecycle Board
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end pipeline from reservation through multi-modal transport and custody handover
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Total Dispatches Active: {requests.filter((r) => r.status !== 'delivered').length}
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colRequests = requests.filter(col.filter);

          return (
            <div
              key={col.id}
              className="bg-slate-100/70 rounded-xl border border-slate-200 p-3 space-y-3 min-h-[480px] flex flex-col justify-between"
            >
              <div>
                {/* Column Header */}
                <div
                  className={`px-3 py-2 rounded-lg border flex items-center justify-between mb-3 ${col.headerBg}`}
                >
                  <span className="font-bold text-xs">{col.title}</span>
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.2 rounded-full ${col.badgeColor}`}
                  >
                    {colRequests.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5">
                  {colRequests.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs italic">
                      No requests in this stage
                    </div>
                  ) : (
                    colRequests.map((req) => {
                      const urgencyStyle = getUrgencyBadgeStyle(req.urgency);

                      return (
                        <div
                          key={req.id}
                          className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs hover:border-slate-300 transition-all space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-800">
                              {req.request_code}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${urgencyStyle.pill}`}
                            >
                              {urgencyStyle.label}
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1">
                              <span className="font-mono text-blue-700 bg-blue-50 px-1 rounded">
                                {req.quantity_requested}x
                              </span>
                              <span className="truncate">{req.item?.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              To: <strong>{req.requesting_facility?.name}</strong>
                            </p>
                            {req.supplying_facility && (
                              <p className="text-[10px] text-slate-400">
                                From: {req.supplying_facility.name}
                              </p>
                            )}
                          </div>

                          {/* Tracking metadata if dispatched */}
                          {req.tracking_number && (
                            <div className="p-1.5 rounded bg-slate-50 border border-slate-200 font-mono text-[10px] flex items-center justify-between">
                              <div className="flex items-center gap-1 text-slate-700">
                                {getTransportIcon(req.transport_mode)}
                                <span>{req.tracking_number}</span>
                              </div>
                              <span className="text-slate-400">
                                {formatTimeAgo(req.dispatched_at)}
                              </span>
                            </div>
                          )}

                          {/* Action Buttons depending on status */}
                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              onClick={() => onSelectRequest(req)}
                              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                              title="View Tracking Audit Stepper"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>

                            {req.status === 'accepted' && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => setDispatchingReq(req)}
                                className="text-[11px] py-1 px-2.5 font-bold"
                              >
                                <Send className="w-3 h-3" />
                                <span>Dispatch</span>
                              </Button>
                            )}

                            {req.status === 'in_transit' && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => setDeliveringReq(req)}
                                className="text-[11px] py-1 px-2.5 font-bold"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Confirm Delivery</span>
                              </Button>
                            )}

                            {req.status === 'delivered' && (
                              <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Restocked
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DispatchActionModal
        request={dispatchingReq}
        isOpen={Boolean(dispatchingReq)}
        onClose={() => setDispatchingReq(null)}
        onConfirm={async (id, mode, tracking) => {
          await onDispatch(id, mode, tracking);
          onRefresh();
        }}
      />

      <DeliveryConfirmModal
        request={deliveringReq}
        isOpen={Boolean(deliveringReq)}
        onClose={() => setDeliveringReq(null)}
        onConfirm={async (id, receiver) => {
          await onConfirmDelivery(id, receiver);
          onRefresh();
        }}
      />
    </div>
  );
};
