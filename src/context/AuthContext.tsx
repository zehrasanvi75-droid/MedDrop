import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Facility } from '@/types';
import { dataService } from '@/services/dataService';
import { realtimeBus } from '@/services/realtimeSync';

interface AuthContextType {
  currentProfile: Profile;
  currentFacility: Facility | null;
  availableProfiles: Profile[];
  switchProfile: (profileId: string) => void;
  isDemoMode: boolean;
  logout: () => void;
  loginWithEmail: (email: string, role: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [isDemoMode] = useState<boolean>(true);

  const loadData = async () => {
    const [pList, fList] = await Promise.all([
      dataService.getProfiles(),
      dataService.getFacilities(),
    ]);
    setProfiles(pList);
    setFacilities(fList);

    // Default to Outpost Alpha (Capt Elena Rostova) for demo
    const savedProfileId = localStorage.getItem('meddrop_current_profile_id');
    const matched = pList.find((p) => p.id === savedProfileId) || pList[0];
    setCurrentProfile(matched);
  };

  useEffect(() => {
    loadData();

    const unsubscribe = realtimeBus.subscribe((msg) => {
      if (msg.type === 'demo_reset') {
        loadData();
      }
    });

    return () => unsubscribe();
  }, []);

  const switchProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      localStorage.setItem('meddrop_current_profile_id', profileId);
    }
  };

  const logout = () => {
    if (profiles.length > 0) {
      // Revert to Capt Elena or first profile
      switchProfile(profiles[0].id);
    }
  };

  const loginWithEmail = async (_email: string, role: string) => {
    const matched = profiles.find((p) => p.role === role) || profiles[0];
    if (matched) {
      switchProfile(matched.id);
      return true;
    }
    return false;
  };

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-mono text-sm tracking-widest text-slate-400">INITIALIZING SECURE MEDDROP NETWORK...</p>
        </div>
      </div>
    );
  }

  const currentFacility = currentProfile.facility_id
    ? facilities.find((f) => f.id === currentProfile.facility_id) || null
    : null;

  return (
    <AuthContext.Provider
      value={{
        currentProfile,
        currentFacility,
        availableProfiles: profiles,
        switchProfile,
        isDemoMode,
        logout,
        loginWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
