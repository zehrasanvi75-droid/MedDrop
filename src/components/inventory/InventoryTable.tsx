import React, { useState, useMemo } from 'react';
import { InventoryItem, SupplyCategory, Facility } from '@/types';
import { StockBadge } from './StockBadge';
import { BloodCompatibilityNotice } from './BloodCompatibilityNotice';
import { Button } from '@/components/common/Button';
import {
  Search,
  Filter,
  Flame,
  Edit2,
  Droplet,
  Layers,
  ArrowUpDown,
  Building2,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import { InventoryAdjustModal } from './InventoryAdjustModal';

interface InventoryTableProps {
  inventories: InventoryItem[];
  facilities: Facility[];
  onRequestSupply: (item?: InventoryItem) => void;
  onRefresh: () => void;
  selectedFacilityId?: string;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventories,
  facilities,
  onRequestSupply,
  onRefresh,
  selectedFacilityId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [facilityFilter, setFacilityFilter] = useState<string>(selectedFacilityId || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);

  const categories: SupplyCategory[] = [
    'Blood Products',
    'Antivenoms',
    'Trauma & Surgical',
    'Emergency Medicine',
    'Burn Care',
  ];

  const filteredItems = useMemo(() => {
    return inventories.filter((inv) => {
      // Facility filter
      if (facilityFilter !== 'all' && inv.facility_id !== facilityFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && inv.item?.category !== categoryFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const itemName = inv.item?.name.toLowerCase() || '';
        const bloodGroup = inv.item?.blood_group?.toLowerCase() || '';
        const facilityName = inv.facility?.name.toLowerCase() || '';
        if (
          !itemName.includes(term) &&
          !bloodGroup.includes(term) &&
          !facilityName.includes(term)
        ) {
          return false;
        }
      }

      // Status filter
      const available = inv.quantity_on_hand - inv.quantity_reserved;
      if (statusFilter === 'critical' && available > 0) return false;
      if (statusFilter === 'low' && (available === 0 || available >= inv.min_threshold))
        return false;
      if (statusFilter === 'adequate' && available < inv.min_threshold) return false;

      return true;
    });
  }, [inventories, facilityFilter, categoryFilter, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search supplies, blood groups (e.g. O-, antivenom, trauma kit)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Facility Dropdown */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Operational Facilities</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.type.replace('_', ' ').toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Stock Statuses</option>
              <option value="critical">Critical Depleted (0)</option>
              <option value="low">Low Stock (&lt; Threshold)</option>
              <option value="adequate">Adequate Stock</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-mono font-semibold text-slate-400 mr-2 uppercase">
            Categories:
          </span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'Blood Products' && <Droplet className="w-3 h-3 text-red-500" />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blood protocol banner if viewing blood products or all */}
      {(categoryFilter === 'all' || categoryFilter === 'Blood Products') && (
        <BloodCompatibilityNotice />
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Supply Item & Group</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">On Hand</th>
                <th className="py-3 px-4 text-center">Reserved</th>
                <th className="py-3 px-4 text-center">Available</th>
                <th className="py-3 px-4 text-center">Threshold</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No matching inventory items found with current filters
                  </td>
                </tr>
              ) : (
                filteredItems.map((inv) => {
                  const available = Math.max(0, inv.quantity_on_hand - inv.quantity_reserved);
                  const isCritical = available === 0;
                  const isLow = available < inv.min_threshold;

                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isCritical ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span>{inv.facility?.name}</span>
                          <span className="text-[10px] font-mono px-1 rounded bg-slate-100 text-slate-500">
                            {inv.facility?.type}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {inv.facility?.region}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {inv.item?.blood_group && (
                            <span className="font-mono text-xs px-1.5 py-0.2 rounded font-extrabold bg-red-600 text-white shadow-xs">
                              {inv.item.blood_group}
                            </span>
                          )}
                          <span>{inv.item?.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Unit: {inv.item?.unit} • Storage: {inv.item?.storage_temp}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-600 font-medium">
                          {inv.item?.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 text-sm">
                        {inv.quantity_on_hand}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-xs">
                        {inv.quantity_reserved > 0 ? (
                          <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {inv.quantity_reserved}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-extrabold text-sm">
                        <span
                          className={
                            isCritical
                              ? 'text-red-600 underline'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }
                        >
                          {available}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-500 text-xs">
                        {inv.min_threshold}
                      </td>

                      <td className="py-3 px-4">
                        <StockBadge
                          quantityOnHand={inv.quantity_on_hand}
                          quantityReserved={inv.quantity_reserved}
                          minThreshold={inv.min_threshold}
                        />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(isCritical || isLow) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onRequestSupply(inv)}
                              className="text-[11px] py-1 px-2.5 shadow-sm"
                              title="Submit Emergency Resupply Request"
                            >
                              <Flame className="w-3 h-3" />
                              <span>Resupply</span>
                            </Button>
                          )}
                          <button
                            onClick={() => setAdjustingItem(inv)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Adjust Physical Inventory Count"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryAdjustModal
        inventory={adjustingItem}
        isOpen={Boolean(adjustingItem)}
        onClose={() => setAdjustingItem(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
};
