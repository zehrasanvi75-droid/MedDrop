import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, ChevronDown, Check, UserCheck, Hospital, Radio } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentProfile, availableProfiles, switchProfile } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'supplier':
        return <Hospital className="w-4 h-4 text-emerald-600" />;
      case 'administrator':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'requester':
      default:
        return <Radio className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700/80 text-left transition-all shadow-sm group"
        title="Switch Demo Role & Facility"
      >
        <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-600 flex items-center justify-center shrink-0">
          {getRoleIcon(currentProfile.role)}
        </div>
        <div className="flex flex-col text-xs leading-tight">
          <span className="font-semibold text-slate-100 group-hover:text-white flex items-center gap-1.5">
            {currentProfile.full_name}
            <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-700 text-slate-300">
              {currentProfile.callsign}
            </span>
          </span>
          <span className="text-slate-400 capitalize text-[11px]">
            {currentProfile.rank_or_title} • {currentProfile.role}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-transform duration-150 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3.5 py-2 border-b border-slate-800">
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                Active Tactical Persona
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Switch facility view instantly for demo testing</p>
            </div>

            <div className="divide-y divide-slate-800/50">
              {availableProfiles.map((p) => {
                const isSelected = p.id === currentProfile.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchProfile(p.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-slate-800/80 transition-colors ${
                      isSelected ? 'bg-slate-800/60' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getRoleIcon(p.role)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-100 truncate">{p.full_name}</p>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.rank_or_title}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        {p.callsign} • {p.role.toUpperCase()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
