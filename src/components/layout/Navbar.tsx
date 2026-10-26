import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { RoleSwitcher } from './RoleSwitcher';
import {
  Activity,
  Bell,
  Volume2,
  VolumeX,
  RotateCcw,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatTimeAgo } from '@/lib/utils';

export const Navbar: React.FC<{ onOpenPitchGuide?: () => void }> = ({ onOpenPitchGuide }) => {
  const { currentFacility, currentProfile } = useAuth();
  const { notifications, soundEnabled, toggleSound, markAsRead, clearAll } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleResetDemo = async () => {
    if (confirm('Reset demo data to initial pitch state? This resets Outpost Alpha to 0 units of O- blood.')) {
      setIsResetting(true);
      dataService.resetDemoData();
      setResetSuccess(true);
      setTimeout(() => {
        setIsResetting(false);
        setResetSuccess(false);
      }, 1500);
    }
  };

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 shadow-md">
      {/* Brand & Facility Info */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/40 ring-2 ring-red-500/20">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg text-white font-sans">
                MED<span className="text-red-500">DROP</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-900/60">
                CRITICAL LOGISTICS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Emergency Blood & Medicine Dispatch Grid
            </p>
          </div>
        </div>

        {/* Current Facility Tag */}
        {currentFacility && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-slate-300 font-medium">{currentFacility.name}</span>
            <span className="text-slate-400 font-mono text-[10px]">({currentFacility.callsign})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Realtime Engine Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
          <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>{isSupabaseConfigured ? 'SUPABASE REALTIME' : 'PEER REALTIME BUS'}</span>
        </div>

        {/* 3-Min Pitch Guide Button */}
        {onOpenPitchGuide && (
          <button
            onClick={onOpenPitchGuide}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-red-950/70 hover:bg-red-900/80 text-red-200 border border-red-800/80 transition-all shadow-sm"
            title="Open 3-Minute Hackathon Demo Script"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            3-Min Demo Script
          </button>
        )}

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-md border text-xs transition-colors flex items-center gap-1.5 ${
            soundEnabled
              ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Audio alerts active' : 'Audio alerts muted'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Reset Demo Button */}
        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className={`px-2.5 py-1.5 rounded-md border text-xs font-semibold flex items-center gap-1.5 transition-all ${
            resetSuccess
              ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Reset Outpost Alpha shortages and initial demo state"
        >
          {resetSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Reset Done</span>
            </>
          ) : (
            <>
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </>
          )}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white relative transition-colors"
            title="Operational Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Live Operational Feed ({notifications.length})
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No active emergency notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-800/60 ${
                          !notif.read ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              notif.type === 'critical'
                                ? 'text-red-400'
                                : notif.type === 'warning'
                                ? 'text-amber-400'
                                : notif.type === 'success'
                                ? 'text-emerald-400'
                                : 'text-blue-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-200 truncate">{notif.title}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                              {formatTimeAgo(notif.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Role Switcher */}
        <RoleSwitcher />
      </div>
    </header>
  );
};
