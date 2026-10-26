import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import {
  Activity,
  Shield,
  Hospital,
  Radio,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { availableProfiles, switchProfile, loginWithEmail } = useAuth();
  const [email, setEmail] = useState('capt.rostova@outpost-alpha.mil');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('requester');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const ok = await loginWithEmail(email, selectedRole);
      if (ok) {
        onSuccess();
      } else {
        setError('Invalid credentials or unauthorized facility access.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (profileId: string) => {
    switchProfile(profileId);
    onSuccess();
  };

  const outpost = availableProfiles.find(
    (p) => p.facility_id === 'f1111111-1111-1111-1111-111111111111'
  );
  const baseHospital = availableProfiles.find(
    (p) => p.facility_id === 'f2222222-2222-2222-2222-222222222222'
  );
  const reliefCamp = availableProfiles.find(
    (p) => p.facility_id === 'f3333333-3333-3333-3333-333333333333'
  );
  const admin = availableProfiles.find((p) => p.role === 'administrator');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-red-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex w-14 h-14 rounded-2xl bg-red-600 items-center justify-center shadow-xl shadow-red-900/50 ring-4 ring-red-500/20 mb-4">
          <Activity className="w-8 h-8 text-white animate-pulse" />
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight font-sans">
          MED<span className="text-red-500">DROP</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400 font-mono">
          EMERGENCY MEDICAL INVENTORY & DISPATCH PLATFORM
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          Tactical Blood & Medicine Logistics for Remote Border Outposts & Disaster Relief
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 py-8 px-6 sm:px-8 border border-slate-800 rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Personnel Email / Service ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Encrypted Security Token / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="destructive"
              size="md"
              isLoading={isLoading}
              className="w-full py-2.5 font-bold shadow-md shadow-red-950"
            >
              <span>Authenticate & Enter Grid</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Clearly Separated Hackathon Demo Access */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                One-Click Hackathon Demo Personas
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {outpost && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(outpost.id)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-red-900/50 hover:border-red-600 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-red-950/80 text-red-400 group-hover:scale-105 transition-transform">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100 group-hover:text-red-300">
                        Outpost Alpha (Capt. Elena Rostova)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Requester • Critical Shortage (0 Blood Units)
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-red-400 font-bold">DEMO 1</span>
                </button>
              )}

              {baseHospital && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(baseHospital.id)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-900/50 hover:border-emerald-600 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 group-hover:scale-105 transition-transform">
                      <Hospital className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100 group-hover:text-emerald-300">
                        Sector Base Hospital (Col. David Vance)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supplying Hub • Stock Reserves & Dispatch
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">DEMO 2</span>
                </button>
              )}

              {reliefCamp && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(reliefCamp.id)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-900 text-blue-400">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">
                        Relief Camp Bravo (Dr. Aisha Patel)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Disaster Camp • Field Triage Requester
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">CAMP</span>
                </button>
              )}

              {admin && (
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(admin.id)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-purple-900/50 hover:border-purple-600 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-950/80 text-purple-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100">
                        Regional HQ (Gen. Marcus Reed)
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Administrator • Network Audit & Control
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400">ADMIN</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <p className="text-center text-[11px] text-slate-400 font-mono mt-6">
          SECURE PROTOCOL • NON-PRODUCTION DEMO BENCHMARK
        </p>
      </div>
    </div>
  );
};
