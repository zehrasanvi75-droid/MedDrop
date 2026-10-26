import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { NavTab } from '@/components/layout/Sidebar';
import { Radio, Hospital, Send, Sparkles, HelpCircle } from 'lucide-react';

interface DemoTourBannerProps {
  onNavigate: (tab: NavTab) => void;
  onRequestEmergency: () => void;
  onOpenScript: () => void;
}

export const DemoTourBanner: React.FC<DemoTourBannerProps> = ({
  onNavigate,
  onRequestEmergency,
  onOpenScript,
}) => {
  const { currentProfile, availableProfiles, switchProfile } = useAuth();

  const outpostProfile = availableProfiles.find(
    (p) => p.facility_id === 'f1111111-1111-1111-1111-111111111111'
  );
  const baseHospitalProfile = availableProfiles.find(
    (p) => p.facility_id === 'f2222222-2222-2222-2222-222222222222'
  );

  const isAtOutpost = currentProfile.facility_id === 'f1111111-1111-1111-1111-111111111111';
  const isAtBaseHospital = currentProfile.facility_id === 'f2222222-2222-2222-2222-222222222222';

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-mono uppercase tracking-wider font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-900/60">
          <Sparkles className="w-3.5 h-3.5" />
          HACKATHON WALKTHROUGH QUICK-BAR
        </span>
        <span className="hidden md:inline text-slate-400">
          Test the end-to-end shortage & dispatch flow:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Step 1: Outpost Alpha */}
        <button
          onClick={() => {
            if (outpostProfile) switchProfile(outpostProfile.id);
            onNavigate('dashboard');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
            isAtOutpost
              ? 'bg-red-600 text-white font-bold ring-1 ring-red-400'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Radio className="w-3 h-3" />
          <span>Step 1: Outpost Alpha (0 Blood)</span>
        </button>

        {/* Step 2: Base Hospital */}
        <button
          onClick={() => {
            if (baseHospitalProfile) switchProfile(baseHospitalProfile.id);
            onNavigate('alerts');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
            isAtBaseHospital
              ? 'bg-emerald-600 text-white font-bold ring-1 ring-emerald-400'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Hospital className="w-3 h-3" />
          <span>Step 2: Base Hospital (Alerts)</span>
        </button>

        {/* Step 3: Dispatch & Track */}
        <button
          onClick={() => onNavigate('dispatch')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
        >
          <Send className="w-3 h-3 text-blue-400" />
          <span>Step 3: Dispatch & Deliver</span>
        </button>

        {/* Pitch Guide */}
        <button
          onClick={onOpenScript}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          title="Open Pitch Sequence Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
