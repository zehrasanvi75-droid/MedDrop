import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  BellRing,
  MapPin,
  Send,
  Navigation,
  FileText,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type NavTab =
  | 'dashboard'
  | 'inventory'
  | 'request'
  | 'alerts'
  | 'map'
  | 'dispatch'
  | 'tracking'
  | 'reports'
  | 'admin';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingAlertsCount,
}) => {
  const { currentProfile } = useAuth();
  const isSupplier = currentProfile.role === 'supplier';
  const isAdmin = currentProfile.role === 'administrator';

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Operations Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inventory' as NavTab,
      label: 'Live Inventory Grid',
      icon: Package,
      badge: null,
    },
    {
      id: 'request' as NavTab,
      label: 'Emergency Supply Request',
      icon: PlusCircle,
      isEmergencyAction: true,
      badge: 'URGENT',
    },
    {
      id: 'alerts' as NavTab,
      label: 'Incoming Alerts Queue',
      icon: BellRing,
      badge: pendingAlertsCount > 0 ? `${pendingAlertsCount}` : null,
      badgeColor: 'bg-red-500 text-white animate-pulse',
      highlightForSupplier: isSupplier && pendingAlertsCount > 0,
    },
    {
      id: 'map' as NavTab,
      label: 'Tactical Grid & Radius Map',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'dispatch' as NavTab,
      label: 'Dispatch Management',
      icon: Send,
      badge: null,
    },
    {
      id: 'tracking' as NavTab,
      label: 'Supply Request Tracking',
      icon: Navigation,
      badge: null,
    },
    {
      id: 'reports' as NavTab,
      label: 'Audit Log & Analytics',
      icon: FileText,
      badge: null,
    },
    ...(isAdmin
      ? [
          {
            id: 'admin' as NavTab,
            label: 'Network Administration',
            icon: ShieldCheck,
            badge: 'HQ',
            badgeColor: 'bg-purple-900 text-purple-200',
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3">
        {/* System Status Banner */}
        <div className="mb-3 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-mono tracking-wide text-slate-300">
              NETWORK ONLINE
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">MIL-STD-810</span>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (item.isEmergencyAction) {
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md group mt-2 mb-2',
                    isActive
                      ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-red-950'
                      : 'bg-red-950/70 hover:bg-red-900/90 text-red-100 border border-red-800/80'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-600 text-white font-extrabold uppercase">
                    EMERGENCY
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900',
                  item.highlightForSupplier && !isActive
                    ? 'bg-red-950/40 text-red-300 border border-red-900/50'
                    : ''
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-slate-300',
                      item.highlightForSupplier && 'text-red-400 animate-pulse'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded font-bold',
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / OpSec Notice */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950 text-[10px] text-slate-400">
        <p className="font-mono text-slate-400 font-semibold mb-0.5">MEDDROP DISPATCH V1.0</p>
        <p className="leading-tight text-slate-400">
          Operational Medical Coordination Network. Authenticated personnel only.
        </p>
      </div>
    </aside>
  );
};
