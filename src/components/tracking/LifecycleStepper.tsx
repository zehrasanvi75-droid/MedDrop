import React from 'react';
import { RequestStatus } from '@/types';
import { Check, Clock, Truck, Package, ShieldCheck, XCircle } from 'lucide-react';

interface LifecycleStepperProps {
  currentStatus: RequestStatus;
  createdAt: string;
  acceptedAt?: string | null;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
}

export const LifecycleStepper: React.FC<LifecycleStepperProps> = ({
  currentStatus,
  createdAt,
  acceptedAt,
  dispatchedAt,
  deliveredAt,
}) => {
  const steps: { key: RequestStatus; label: string; desc: string; time?: string | null }[] = [
    {
      key: 'requested',
      label: 'Requested',
      desc: 'Broadcast to network',
      time: createdAt,
    },
    {
      key: 'accepted',
      label: 'Accepted & Reserved',
      desc: 'Hub allocated stock',
      time: acceptedAt,
    },
    {
      key: 'in_transit',
      label: 'Dispatched / In Transit',
      desc: 'En route with cold-chain',
      time: dispatchedAt,
    },
    {
      key: 'delivered',
      label: 'Delivered & Restocked',
      desc: 'Handover complete',
      time: deliveredAt,
    },
  ];

  if (currentStatus === 'rejected' || currentStatus === 'cancelled') {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3">
        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <p className="font-bold text-xs uppercase tracking-wider">
            Request Lifecycle Terminated ({currentStatus.toUpperCase()})
          </p>
          <p className="text-xs text-red-700 mt-0.5">
            This request was closed without dispatch. Any temporary stock reservations were safely released.
          </p>
        </div>
      </div>
    );
  }

  const getStepIndex = (status: RequestStatus) => {
    switch (status) {
      case 'requested':
        return 0;
      case 'accepted':
        return 1;
      case 'dispatched':
      case 'in_transit':
        return 2;
      case 'delivered':
        return 3;
      default:
        return 0;
    }
  };

  const activeIdx = getStepIndex(currentStatus);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between relative">
        {/* Background connector line */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute left-6 top-4 h-0.5 bg-emerald-500 transition-all duration-300 -z-0"
          style={{ width: `${(activeIdx / (steps.length - 1)) * 90}%` }}
        />

        {steps.map((step, idx) => {
          const isDone = idx < activeIdx || currentStatus === 'delivered';
          const isCurrent = idx === activeIdx && currentStatus !== 'delivered';

          return (
            <div key={step.key} className="flex flex-col items-center text-center z-10 px-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 border-2 ${
                  isDone
                    ? 'bg-emerald-600 border-white text-white shadow-sm ring-2 ring-emerald-500'
                    : isCurrent
                    ? 'bg-blue-600 border-white text-white shadow-sm ring-2 ring-blue-500 animate-pulse'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
              </div>

              <span
                className={`text-[11px] font-bold mt-2 ${
                  isDone
                    ? 'text-emerald-800'
                    : isCurrent
                    ? 'text-blue-700'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block">{step.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
