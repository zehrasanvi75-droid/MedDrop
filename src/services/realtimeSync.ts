/**
 * Real-time event bus using BroadcastChannel & window events.
 * Enables live synchronization between browser tabs and UI views.
 */

export type RealtimeEventType = 
  | 'request_created'
  | 'request_accepted'
  | 'request_dispatched'
  | 'request_delivered'
  | 'request_rejected'
  | 'request_cancelled'
  | 'inventory_updated'
  | 'demo_reset';

export interface RealtimeMessage {
  type: RealtimeEventType;
  payload: any;
  timestamp: number;
}

type Listener = (msg: RealtimeMessage) => void;

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('meddrop_realtime_bus');
        this.channel.onmessage = (event: MessageEvent<RealtimeMessage>) => {
          this.notifyListeners(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization failed, using in-memory bus', err);
      }
    }
  }

  public broadcast(type: RealtimeEventType, payload: any) {
    const message: RealtimeMessage = {
      type,
      payload,
      timestamp: Date.now(),
    };

    // Send to other tabs
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        console.error('Failed to broadcast across tabs', e);
      }
    }

    // Notify listeners in current tab
    this.notifyListeners(message);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(message: RealtimeMessage) {
    this.listeners.forEach((listener) => {
      try {
        listener(message);
      } catch (err) {
        console.error('Realtime listener error', err);
      }
    });
  }
}

export const realtimeBus = new RealtimeSyncManager();
