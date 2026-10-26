import React from 'react';
import { Button } from '@/components/common/Button';
import { NavTab } from '@/components/layout/Sidebar';
import { Flame, MapPin, BellRing, PackageCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface RapidActionPanelProps {
  onRequestSupply: () => void;
  onNavigate: (tab: NavTab) => void;
  pendingAlertsCount: number;
}

export const RapidActionPanel: React.FC<RapidActionPanelProps> = ({
  onRequestSupply,
  onNavigate,
  pendingAlertsCount,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Rapid Response Operations
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Quick triggers for field coordinators & base dispatch</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          variant="destructive"
          size="md"
          onClick={onRequestSupply}
          className="flex items-center justify-center gap-2 w-full shadow-md shadow-red-900/10 py-3"
        >
          <Flame className="w-4 h-4" />
          <span className="font-bold">Request Emergency Supply</span>
        </Button>

        <Button
          variant="tactical"
          size="md"
          onClick={() => onNavigate('map')}
          className="flex items-center justify-center gap-2 w-full py-3"
        >
          <MapPin className="w-4 h-4 text-blue-400" />
          <span>Tactical Radius Map</span>
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={() => onNavigate('alerts')}
          className="flex items-center justify-center gap-2 w-full py-3 relative"
        >
          <BellRing className="w-4 h-4 text-amber-500" />
          <span>Incoming Alerts Queue</span>
          {pendingAlertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white font-mono animate-pulse">
              {pendingAlertsCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
