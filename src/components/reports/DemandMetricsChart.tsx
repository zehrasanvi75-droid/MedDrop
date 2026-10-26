import React from 'react';
import { SupplyRequest, InventoryItem, Facility } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Clock, TrendingUp, CheckCircle, ShieldAlert, Award } from 'lucide-react';

interface DemandMetricsChartProps {
  requests: SupplyRequest[];
  inventories: InventoryItem[];
  facilities: Facility[];
}

export const DemandMetricsChart: React.FC<DemandMetricsChartProps> = ({
  requests,
  inventories,
  facilities,
}) => {
  // 1. Calculate Most Frequently Requested Supplies
  const itemCounts: Record<string, number> = {};
  requests.forEach((r) => {
    const name = r.item?.name ? r.item.name.split(' (')[0] : 'Item';
    itemCounts[name] = (itemCounts[name] || 0) + r.quantity_requested;
  });

  const topRequestedData = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, units: count }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  // 2. Shortage count by facility
  const shortageData = facilities.map((f) => {
    const fInvs = inventories.filter((i) => i.facility_id === f.id);
    const criticalCount = fInvs.filter((i) => i.quantity_on_hand === 0).length;
    const lowCount = fInvs.filter(
      (i) => i.quantity_on_hand > 0 && i.quantity_on_hand < i.min_threshold
    ).length;
    return {
      name: f.name.replace('Sector ', ''),
      critical: criticalCount,
      low: lowCount,
    };
  });

  // 3. Operational Performance Calculations
  const deliveredCount = requests.filter((r) => r.status === 'delivered').length;
  const activeCount = requests.filter((r) =>
    ['requested', 'accepted', 'in_transit'].includes(r.status)
  ).length;
  const totalCompletedOrActive = deliveredCount + activeCount;
  const fulfillmentRate =
    totalCompletedOrActive > 0
      ? Math.round((deliveredCount / totalCompletedOrActive) * 100)
      : 100;

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Fulfillment Rate</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">
            {fulfillmentRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {deliveredCount} delivered out of {totalCompletedOrActive} total requests
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Avg Hub Acceptance</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">7.4 min</div>
          <p className="text-[11px] text-slate-400 mt-0.5">From field triage request to reservation</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Avg Dispatch Transit</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">26.8 min</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Ground & air medical cold-chain delivery</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase">Critical Outposts</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black font-mono text-red-600 mt-2">
            {shortageData.filter((s) => s.critical > 0).length} Stations
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Currently reporting zero-stock on key items</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Frequently Requested Supplies */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
            Top Emergency Supplies Demanded (Total Units)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRequestedData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="units" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortage Breakdown by Facility */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
            Stock Warnings by Operational Facility
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shortageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="critical" name="Critical Depleted (0)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low" name="Low Stock" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
