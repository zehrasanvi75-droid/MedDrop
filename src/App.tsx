import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { dataService } from '@/services/dataService';
import { realtimeBus } from '@/services/realtimeSync';
import {
  Facility,
  InventoryItem,
  SupplyRequest,
  InventoryTransaction,
  DashboardStats,
  TransportMode,
} from '@/types';

// Layout & Navigation
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, NavTab } from '@/components/layout/Sidebar';
import { DemoTourBanner } from '@/components/demo/DemoTourBanner';
import { PitchGuideModal } from '@/components/demo/PitchGuideModal';
import { LoginView } from '@/components/auth/LoginView';

// Dashboard Components
import { StatCard } from '@/components/dashboard/StatCard';
import { ShortageAlertBanner } from '@/components/dashboard/ShortageAlertBanner';
import { RecentRequestsTable } from '@/components/dashboard/RecentRequestsTable';
import { RapidActionPanel } from '@/components/dashboard/RapidActionPanel';

// Inventory Components
import { InventoryTable } from '@/components/inventory/InventoryTable';

// Requests & Alerts
import { EmergencyRequestModal } from '@/components/requests/EmergencyRequestModal';
import { IncomingAlertCard } from '@/components/alerts/IncomingAlertCard';
import { RejectReasonModal } from '@/components/alerts/RejectReasonModal';

// Map & Dispatch
import { LeafletMapView } from '@/components/map/LeafletMapView';
import { DispatchKanban } from '@/components/dispatch/DispatchKanban';

// Tracking & Reports
import { RequestTrackingDetail } from '@/components/tracking/RequestTrackingDetail';
import { TransactionsAuditTable } from '@/components/reports/TransactionsAuditTable';
import { DemandMetricsChart } from '@/components/reports/DemandMetricsChart';

// Admin
import { FacilityManager } from '@/components/admin/FacilityManager';

// Icons & Primitives
import {
  Activity,
  Package,
  Flame,
  Truck,
  Clock,
  ShieldCheck,
  BellRing,
  Building2,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export const App: React.FC = () => {
  const { currentProfile, currentFacility } = useAuth();
  const { soundEnabled } = useNotifications();

  // App Navigation & Modal States
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAuthScreenOpen, setIsAuthScreenOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [preselectedItem, setPreselectedItem] = useState<InventoryItem | null>(null);
  const [isPitchGuideOpen, setIsPitchGuideOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<SupplyRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<SupplyRequest | null>(null);

  // Application Data States
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalFacilities: 0,
    criticalShortages: 0,
    activeRequests: 0,
    inTransitCount: 0,
    awaitingAcceptanceCount: 0,
    deliveredTodayCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load all operational data
  const loadData = useCallback(async () => {
    try {
      const [fList, iList, rList, tList, sData] = await Promise.all([
        dataService.getFacilities(),
        dataService.getInventories(),
        dataService.getRequests(),
        dataService.getTransactions(),
        dataService.getDashboardStats(),
      ]);

      setFacilities(fList);
      setInventories(iList);
      setRequests(rList);
      setTransactions(tList);
      setStats(sData);
    } catch (err) {
      console.error('Failed to load operational data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to Realtime Data updates across browser tabs
    const unsubscribe = realtimeBus.subscribe((msg) => {
      loadData();
    });

    return () => unsubscribe();
  }, [loadData]);

  // Critical Shortages for current facility
  const localCriticalShortages = inventories.filter((inv) => {
    if (currentFacility && inv.facility_id !== currentFacility.id) return false;
    return (
      inv.quantity_on_hand === 0 ||
      inv.quantity_on_hand <= Math.floor(inv.min_threshold / 2)
    );
  });

  const pendingAlerts = requests.filter((r) => r.status === 'requested');

  // Core Dispatch Handlers
  const handleAcceptRequest = async (req: SupplyRequest) => {
    if (!currentFacility) return;
    try {
      await dataService.acceptAndReserveRequest(req.id, currentFacility.id, currentProfile.id);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to accept request');
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingRequest) return;
    try {
      await dataService.rejectOrCancelRequest(rejectingRequest.id, currentProfile.id, 'reject', reason);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to reject request');
    }
  };

  const handleDispatch = async (requestId: string, mode: TransportMode, tracking: string) => {
    try {
      await dataService.dispatchSupplies(requestId, currentProfile.id, mode, tracking);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to dispatch supplies');
    }
  };

  const handleConfirmDelivery = async (requestId: string, receiverName: string) => {
    try {
      await dataService.confirmDelivery(requestId, currentProfile.id, receiverName);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to confirm delivery');
    }
  };

  if (isAuthScreenOpen) {
    return <LoginView onSuccess={() => setIsAuthScreenOpen(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-red-500 selection:text-white">
      {/* Top Tactical Navigation */}
      <Navbar onOpenPitchGuide={() => setIsPitchGuideOpen(true)} />

      {/* 3-Minute Hackathon Quick Tour Strip */}
      <DemoTourBanner
        onNavigate={setActiveTab}
        onRequestEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenScript={() => setIsPitchGuideOpen(true)}
      />

      {/* Main Workspace with Sidebar & Dynamic Views */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingAlertsCount={pendingAlerts.length}
        />

        {/* View Port Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: OPERATIONS DASHBOARD */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Dashboard Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Operations Command Center</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      LIVE TELEMETRY
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {currentFacility
                      ? `Active Station: ${currentFacility.name} (${currentFacility.region})`
                      : 'Network Central Tactical Command Overview'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    className="text-xs text-slate-600"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setPreselectedItem(null);
                      setIsEmergencyModalOpen(true);
                    }}
                    className="shadow-md shadow-red-900/10 font-bold"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Request Supply</span>
                  </Button>
                </div>
              </div>

              {/* Critical Shortage Warning Banner (Outpost Alpha 0 blood) */}
              <ShortageAlertBanner
                criticalItems={localCriticalShortages}
                onRequestSupply={(item) => {
                  setPreselectedItem(item || null);
                  setIsEmergencyModalOpen(true);
                }}
              />

              {/* 5 Key Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <StatCard
                  title="Registered Facilities"
                  value={stats.totalFacilities}
                  subtitle="Active border posts & hubs"
                  icon={Building2}
                  variant="default"
                  onClick={() => setActiveTab('map')}
                />
                <StatCard
                  title="Critical Shortages"
                  value={stats.criticalShortages}
                  subtitle="Depleted emergency stock"
                  icon={Flame}
                  variant="critical"
                  onClick={() => setActiveTab('inventory')}
                />
                <StatCard
                  title="Active Requests"
                  value={stats.activeRequests}
                  subtitle="Pending or in coordination"
                  icon={Clock}
                  variant="warning"
                  onClick={() => setActiveTab('tracking')}
                />
                <StatCard
                  title="In Transit"
                  value={stats.inTransitCount}
                  subtitle="Ambulance & drone deliveries"
                  icon={Truck}
                  variant="info"
                  onClick={() => setActiveTab('dispatch')}
                />
                <StatCard
                  title="Awaiting Hub"
                  value={stats.awaitingAcceptanceCount}
                  subtitle="Pending acceptance queue"
                  icon={BellRing}
                  variant={stats.awaitingAcceptanceCount > 0 ? 'critical' : 'success'}
                  onClick={() => setActiveTab('alerts')}
                />
              </div>

              {/* Rapid Action Shortcuts */}
              <RapidActionPanel
                onRequestSupply={() => {
                  setPreselectedItem(null);
                  setIsEmergencyModalOpen(true);
                }}
                onNavigate={setActiveTab}
                pendingAlertsCount={pendingAlerts.length}
              />

              {/* Recent Requests Table */}
              <RecentRequestsTable
                requests={requests}
                onSelectRequest={(req) => setSelectedRequestForDetail(req)}
                onViewAll={() => setActiveTab('tracking')}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: LIVE INVENTORY */}
          {/* ============================================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Live Operational Inventory Grid
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Real-time stock on hand, reserved quantities, and minimum safety thresholds
                  </p>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setPreselectedItem(null);
                    setIsEmergencyModalOpen(true);
                  }}
                  className="font-bold"
                >
                  <Flame className="w-4 h-4" />
                  <span>Request Emergency Resupply</span>
                </Button>
              </div>

              <InventoryTable
                inventories={inventories}
                facilities={facilities}
                onRequestSupply={(item) => {
                  setPreselectedItem(item || null);
                  setIsEmergencyModalOpen(true);
                }}
                onRefresh={loadData}
                selectedFacilityId={currentFacility?.id}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: EMERGENCY SUPPLY REQUEST */}
          {/* ============================================================== */}
          {activeTab === 'request' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-200">
                    <Flame className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Broadcast Emergency Supply Request
                    </h2>
                    <p className="text-xs text-slate-500">
                      Submit critical blood or medicine requirements to eligible supplying facilities
                    </p>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="w-full py-4 text-base font-bold shadow-lg shadow-red-950/10"
                >
                  <Flame className="w-5 h-5" />
                  <span>Launch Emergency Supply Request Form</span>
                </Button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: INCOMING ALERTS QUEUE */}
          {/* ============================================================== */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Incoming Emergency Alerts Queue
                    </h1>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                      LIVE QUEUE ({pendingAlerts.length})
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Hub operational intake sorted by triage urgency (Critical first) and elapsed age
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Audio alerts: <strong className="text-slate-800">{soundEnabled ? 'ACTIVE' : 'MUTED'}</strong>
                  </span>
                </div>
              </div>

              {pendingAlerts.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-slate-800">
                    No Pending Unaccepted Alerts
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    All emergency coordination requests have been accepted, assigned, or fulfilled.
                    New incoming alerts will trigger audible and visual notifications automatically.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsEmergencyModalOpen(true)}
                  >
                    <Flame className="w-4 h-4" />
                    <span>Create a Test Emergency Request</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAlerts
                    .sort((a, b) => {
                      const urgencyOrder = { critical: 0, high: 1, moderate: 2 };
                      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
                      }
                      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    })
                    .map((req) => {
                      const matchingInv = inventories.find(
                        (i) => i.facility_id === currentFacility?.id && i.item_id === req.item_id
                      );

                      return (
                        <IncomingAlertCard
                          key={req.id}
                          request={req}
                          currentFacility={currentFacility}
                          localInventory={matchingInv}
                          onAccept={handleAcceptRequest}
                          onReject={(r) => setRejectingRequest(r)}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: TACTICAL MAP */}
          {/* ============================================================== */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <LeafletMapView
                facilities={facilities}
                inventories={inventories}
                activeRequests={requests}
                onRequestEmergency={() => setIsEmergencyModalOpen(true)}
                onSelectRequest={(req) => setSelectedRequestForDetail(req)}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: DISPATCH MANAGEMENT */}
          {/* ============================================================== */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4">
              <DispatchKanban
                requests={requests}
                onDispatch={handleDispatch}
                onConfirmDelivery={handleConfirmDelivery}
                onSelectRequest={(req) => setSelectedRequestForDetail(req)}
                onRefresh={loadData}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: REQUEST TRACKING */}
          {/* ============================================================== */}
          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Supply Request Tracking Grid
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Live lifecycle tracking, custody verification, and status event progression
                  </p>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsEmergencyModalOpen(true)}
                >
                  <Flame className="w-4 h-4" />
                  <span>New Request</span>
                </Button>
              </div>

              {selectedRequestForDetail ? (
                <RequestTrackingDetail
                  request={selectedRequestForDetail}
                  onClose={() => setSelectedRequestForDetail(null)}
                  onConfirmDelivery={(r) => handleConfirmDelivery(r.id, currentProfile.full_name)}
                />
              ) : (
                <RecentRequestsTable
                  requests={requests}
                  onSelectRequest={(req) => setSelectedRequestForDetail(req)}
                />
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 8: AUDIT LOG & ANALYTICS */}
          {/* ============================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Logistics Audit Trail & Performance Analytics
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Immutable transaction log of receipts, reservations, dispatches, and emergency demand metrics
                </p>
              </div>

              {/* Demand Charts */}
              <DemandMetricsChart
                requests={requests}
                inventories={inventories}
                facilities={facilities}
              />

              {/* Audit Table */}
              <TransactionsAuditTable transactions={transactions} />
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 9: NETWORK ADMINISTRATION (HQ) */}
          {/* ============================================================== */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <FacilityManager facilities={facilities} inventories={inventories} />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <EmergencyRequestModal
        isOpen={isEmergencyModalOpen}
        onClose={() => {
          setIsEmergencyModalOpen(false);
          setPreselectedItem(null);
        }}
        preselectedItem={preselectedItem}
        onSuccess={async (newId) => {
          await loadData();
          setActiveTab('tracking');
          const found = await dataService.getRequestById(newId);
          if (found) setSelectedRequestForDetail(found);
        }}
      />

      <PitchGuideModal
        isOpen={isPitchGuideOpen}
        onClose={() => setIsPitchGuideOpen(false)}
        onNavigate={setActiveTab}
        onRequestEmergencyModal={() => setIsEmergencyModalOpen(true)}
      />

      <RejectReasonModal
        request={rejectingRequest}
        isOpen={Boolean(rejectingRequest)}
        onClose={() => setRejectingRequest(null)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
};
