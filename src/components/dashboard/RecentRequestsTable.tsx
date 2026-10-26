import React from 'react';
import { SupplyRequest } from '@/types';
import { getUrgencyBadgeStyle, getStatusBadgeStyle, formatTimeAgo, formatDateTime } from '@/lib/utils';
import { ArrowRight, Eye, Clock, AlertTriangle, Truck } from 'lucide-react';

interface RecentRequestsTableProps {
  requests: SupplyRequest[];
  onSelectRequest: (request: SupplyRequest) => void;
  onViewAll?: () => void;
}

export const RecentRequestsTable: React.FC<RecentRequestsTableProps> = ({
  requests,
  onSelectRequest,
  onViewAll,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">Active Emergency Requests</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time supply coordination requests in the network</p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <span>View All ({requests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Request Code</th>
              <th className="py-3 px-4">Facility Channel</th>
              <th className="py-3 px-4">Supply Item</th>
              <th className="py-3 px-4">Urgency</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No active emergency requests recorded
                </td>
              </tr>
            ) : (
              requests.slice(0, 5).map((req) => {
                const urgencyStyle = getUrgencyBadgeStyle(req.urgency);
                const statusStyle = getStatusBadgeStyle(req.status);

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelectRequest(req)}
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {req.request_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {req.requesting_facility?.name || 'Forward Camp'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {req.supplying_facility
                          ? `Supplying: ${req.supplying_facility.name}`
                          : 'Awaiting Hub Match'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 font-bold">
                          {req.quantity_requested}x
                        </span>
                        <span>{req.item?.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Patient: {req.patient_status.replace('_', ' ').toUpperCase()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${urgencyStyle.pill}`}
                      >
                        {urgencyStyle.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyle.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {formatTimeAgo(req.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRequest(req);
                        }}
                        className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View Full Tracking Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
