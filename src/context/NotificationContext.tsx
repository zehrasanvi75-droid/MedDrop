import React, { createContext, useContext, useState, useEffect } from 'react';
import { realtimeBus, RealtimeMessage } from '@/services/realtimeSync';
import { soundEffects } from '@/lib/sound';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  soundEnabled: boolean;
  toggleSound: () => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  playTestTone: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentProfile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('meddrop_sound_enabled') !== 'false';
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('meddrop_sound_enabled', String(next));
      return next;
    });
  };

  const playTestTone = () => {
    soundEffects.playDispatchChime();
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const item: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...notif,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [item, ...prev.slice(0, 29)]);
  };

  useEffect(() => {
    const unsubscribe = realtimeBus.subscribe((msg: RealtimeMessage) => {
      switch (msg.type) {
        case 'request_created': {
          const req = msg.payload.request;
          const isCritical = req.urgency === 'critical';

          addNotification({
            title: `Incoming ${req.urgency.toUpperCase()} Supply Request`,
            message: `${req.request_code}: ${req.quantity_requested} units needed`,
            type: isCritical ? 'critical' : 'warning',
          });

          // Play alarm if user is a supplier or admin
          if (soundEnabled && (currentProfile.role === 'supplier' || currentProfile.role === 'administrator')) {
            if (isCritical) {
              soundEffects.playEmergencyAlarm();
            } else {
              soundEffects.playDispatchChime();
            }
          }
          break;
        }

        case 'request_accepted': {
          const req = msg.payload.request;
          addNotification({
            title: 'Request Accepted & Stock Reserved',
            message: `${req.request_code} accepted by Base Hospital logistics`,
            type: 'info',
          });
          if (soundEnabled) soundEffects.playDispatchChime();
          break;
        }

        case 'request_dispatched': {
          const req = msg.payload.request;
          addNotification({
            title: 'Supplies Dispatched & In Transit',
            message: `${req.request_code} en route via ${req.transport_mode?.replace('_', ' ')} (${req.tracking_number})`,
            type: 'info',
          });
          if (soundEnabled) soundEffects.playDispatchChime();
          break;
        }

        case 'request_delivered': {
          const req = msg.payload.request;
          addNotification({
            title: 'Delivery Confirmed & Restocked',
            message: `${req.request_code} received by ${msg.payload.receiverName || 'Field Team'}`,
            type: 'success',
          });
          if (soundEnabled) soundEffects.playSuccessChime();
          break;
        }

        case 'request_rejected': {
          const req = msg.payload.request;
          addNotification({
            title: 'Request Rejected',
            message: `${req.request_code} rejected: ${msg.payload.reason}`,
            type: 'critical',
          });
          break;
        }
      }
    });

    return () => unsubscribe();
  }, [currentProfile, soundEnabled]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => setNotifications([]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        soundEnabled,
        toggleSound,
        markAsRead,
        clearAll,
        playTestTone,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
