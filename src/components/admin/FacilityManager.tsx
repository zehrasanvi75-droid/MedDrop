import React from 'react';
import { Facility, InventoryItem } from '@/types';
import { Button } from '@/components/common/Button';
import { Building2, Radio, CheckCircle, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

interface FacilityManagerProps {
  facilities: Facility[];
  inventories: InventoryItem[];
}

export const FacilityManager: React.FC<FacilityManagerProps> = ({
  facilities,
  inventories,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">
            Registered Tactical Medical Facilities ({facilities.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational status, geospatial coordinates, and communications telemetry
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
          ADMIN HQ ACCESS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facilities.map((facility) => {
          const fInvs = inventories.filter((i) => i.facility_id === facility.id);
          const totalStock = fInvs.reduce((acc, curr) => acc + curr.quantity_on_hand, 0);
          const criticalItems = fInvs.filter((i) => i.quantity_on_hand === 0);

          return (
            <div
              key={facility.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs">
                    {facility.type === 'base_hospital'
                      ? 'HOSP'
                      : facility.type === 'outpost'
                      ? 'OUTP'
                      : 'CAMP'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{facility.name}</h4>
                    <p className="text-slate-500 text-[11px] font-mono">
                      {facility.region} • Callsign: {facility.callsign}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                    facility.is_active
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  OPERATIONAL
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Comms Frequency</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {facility.contact_frequency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">GPS Coordinates</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {facility.latitude.toFixed(4)}°N, {facility.longitude.toFixed(4)}°E
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Supplies On Hand</span>
                  <span className="font-mono font-bold text-slate-800">{totalStock} Units</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Critical Depletions</span>
                  <span
                    className={`font-mono font-bold ${
                      criticalItems.length > 0 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {criticalItems.length} Items Depleted
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
                <span>MIL-STD-2026 Facility Node</span>
                <span className="font-mono text-[10px]">{facility.id.substring(0, 8)}...</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
