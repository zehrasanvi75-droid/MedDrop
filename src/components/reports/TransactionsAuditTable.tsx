import React, { useState } from 'react';
import { InventoryTransaction } from '@/types';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import { Filter, Search, ArrowDownRight, ArrowUpRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface TransactionsAuditTableProps {
  transactions: InventoryTransaction[];
}

export const TransactionsAuditTable: React.FC<TransactionsAuditTableProps> = ({
  transactions,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.transaction_type !== filterType) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const itemName = tx.item?.name?.toLowerCase() || '';
      const facilityName = tx.facility?.name?.toLowerCase() || '';
      const notes = tx.notes?.toLowerCase() || '';
      if (!itemName.includes(term) && !facilityName.includes(term) && !notes.includes(term)) {
        return false;
      }
    }
    return true;
  });

  const getTxTypeBadge = (type: string) => {
    switch (type) {
      case 'receipt':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ArrowDownRight className="w-3 h-3 text-emerald-600" />
            RECEIPT / RESTOCK
          </span>
        );
      case 'dispatch':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowUpRight className="w-3 h-3 text-blue-600" />
            DISPATCH OUT
          </span>
        );
      case 'reservation':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            RESERVATION
          </span>
        );
      case 'release':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
            RELEASE
          </span>
        );
      case 'adjustment':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            <RefreshCw className="w-3 h-3" />
            ADJUSTMENT
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
      {/* Search and Filters */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50/50">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search transactions, notes, items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto"
          >
            <option value="all">All Transaction Types</option>
            <option value="receipt">Receipt (Stock In)</option>
            <option value="dispatch">Dispatch (Stock Out)</option>
            <option value="reservation">Reservation</option>
            <option value="release">Release</option>
            <option value="adjustment">Stock Adjustment</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Facility</th>
              <th className="py-3 px-4">Supply Item</th>
              <th className="py-3 px-4 text-center">Delta Qty</th>
              <th className="py-3 px-4">Responsible Actor</th>
              <th className="py-3 px-4">Audit Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No inventory transactions recorded
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    <div>{formatDateTime(tx.created_at)}</div>
                    <div className="text-[10px] text-slate-400">{formatTimeAgo(tx.created_at)}</div>
                  </td>
                  <td className="py-3 px-4">{getTxTypeBadge(tx.transaction_type)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {tx.facility?.name || 'Central Grid'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900">{tx.item?.name}</span>
                    <span className="text-[10px] text-slate-400 block">{tx.item?.unit}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                    <span
                      className={
                        tx.quantity > 0
                          ? 'text-emerald-700'
                          : tx.quantity < 0
                          ? 'text-red-600'
                          : 'text-slate-600'
                      }
                    >
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">
                      {tx.performer?.full_name || 'System / Field Officer'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {tx.performer?.callsign || 'OPERATIONS'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                    {tx.notes || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
