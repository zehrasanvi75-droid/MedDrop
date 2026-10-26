import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Facility, InventoryItem, SupplyRequest } from '@/types';
import { calculateDistanceKm, estimateTravelTimeMinutes } from '@/services/distance';
import { Button } from '@/components/common/Button';
import {
  MapPin,
  Hospital,
  Radio,
  Tent,
  AlertTriangle,
  Flame,
  Truck,
  Send,
  Sliders,
  Layers,
  Compass,
} from 'lucide-react';

interface LeafletMapViewProps {
  facilities: Facility[];
  inventories: InventoryItem[];
  activeRequests: SupplyRequest[];
  selectedRequestId?: string | null;
  onRequestEmergency?: () => void;
  onSelectRequest?: (req: SupplyRequest) => void;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  facilities,
  inventories,
  activeRequests,
  selectedRequestId,
  onRequestEmergency,
  onSelectRequest,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeRequestFilter, setActiveRequestFilter] = useState<string>(selectedRequestId || 'all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(75);
  const [showRadius, setShowRadius] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Northern Sector (approx 33.8, 74.9)
    const map = L.map(mapContainerRef.current, {
      center: [33.85, 74.9],
      zoom: 9,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | MedDrop Tactical GIS',
      maxZoom: 18,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers, Routes & Circles when data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw Facility Markers
    facilities.forEach((facility) => {
      const facilityInventories = inventories.filter((i) => i.facility_id === facility.id);
      const criticalShortages = facilityInventories.filter(
        (i) => i.quantity_on_hand === 0 || i.quantity_on_hand <= Math.floor(i.min_threshold / 2)
      );
      const isCritical = criticalShortages.length > 0;

      // Custom DivIcon
      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${
            isCritical
              ? '<span class="absolute w-8 h-8 rounded-full bg-red-500/50 radar-ping"></span>'
              : ''
          }
          <div class="w-7 h-7 rounded-lg shadow-lg flex items-center justify-center text-white border-2 ${
            isCritical
              ? 'bg-red-600 border-white ring-2 ring-red-500'
              : facility.type === 'base_hospital'
              ? 'bg-blue-600 border-white ring-2 ring-blue-500'
              : 'bg-slate-800 border-white'
          }">
            <span class="text-xs font-bold font-mono">
              ${facility.type === 'base_hospital' ? 'H' : facility.type === 'outpost' ? 'OP' : 'RC'}
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-facility-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([facility.latitude, facility.longitude], {
        icon: customIcon,
      });

      // Marker Click
      marker.on('click', () => {
        setSelectedFacility(facility);
      });

      // Tooltip
      marker.bindTooltip(
        `<strong>${facility.name}</strong><br/>Type: ${facility.type.replace('_', ' ').toUpperCase()}${
          isCritical ? '<br/><span style="color:red;font-weight:bold;">CRITICAL SHORTAGES</span>' : ''
        }`,
        { direction: 'top', offset: [0, -10] }
      );

      marker.addTo(layerGroup);
    });

    // 2. Draw Radius Circle around selected or first facility if toggled
    const targetFacility = selectedFacility || facilities[0];
    if (showRadius && targetFacility) {
      const circle = L.circle([targetFacility.latitude, targetFacility.longitude], {
        radius: radiusKm * 1000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 1.5,
        dashArray: '6, 6',
      });
      circle.addTo(layerGroup);
    }

    // 3. Draw Route Vectors for Active Requests
    const targetRequests =
      activeRequestFilter === 'all'
        ? activeRequests.filter((r) => ['accepted', 'in_transit'].includes(r.status))
        : activeRequests.filter((r) => r.id === activeRequestFilter);

    targetRequests.forEach((req) => {
      const reqFacility = facilities.find((f) => f.id === req.requesting_facility_id);
      const supFacility = facilities.find((f) => f.id === req.supplying_facility_id);

      if (reqFacility && supFacility) {
        const latlngs: [number, number][] = [
          [supFacility.latitude, supFacility.longitude],
          [reqFacility.latitude, reqFacility.longitude],
        ];

        const isTransit = req.status === 'in_transit';

        const polyline = L.polyline(latlngs, {
          color: isTransit ? '#6366f1' : '#3b82f6',
          weight: 3.5,
          opacity: 0.85,
          dashArray: isTransit ? '8, 8' : undefined,
        });

        polyline.bindTooltip(
          `<strong>${req.request_code} (${req.status.toUpperCase()})</strong><br/>
           ${req.quantity_requested}x ${req.item?.name || 'Supplies'}<br/>
           Distance: ~${calculateDistanceKm(
             supFacility.latitude,
             supFacility.longitude,
             reqFacility.latitude,
             reqFacility.longitude
           )} km (Straight-line vector)<br/>
           Mode: ${req.transport_mode?.replace('_', ' ').toUpperCase() || 'Ground'}`,
          { sticky: true }
        );

        polyline.addTo(layerGroup);
      }
    });
  }, [facilities, inventories, activeRequests, activeRequestFilter, selectedFacility, radiusKm, showRadius]);

  const selectedFacilityInventories = selectedFacility
    ? inventories.filter((i) => i.facility_id === selectedFacility.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Top Map Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              Tactical Operational GIS & Dispatch Radar
            </h3>
            <p className="text-xs text-slate-500">
              Straight-line geographical vectors and coverage radius visualization
            </p>
          </div>
        </div>

        {/* Filter and Radius controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <label className="text-slate-600 font-semibold">Radius:</label>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-20 sm:w-28 accent-blue-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-blue-700">{radiusKm} km</span>
          </div>

          <button
            onClick={() => setShowRadius(!showRadius)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              showRadius
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {showRadius ? 'Hide Coverage Ring' : 'Show Coverage Ring'}
          </button>

          {onRequestEmergency && (
            <Button variant="destructive" size="sm" onClick={onRequestEmergency}>
              <Flame className="w-3.5 h-3.5" />
              <span>Emergency Request</span>
            </Button>
          )}
        </div>
      </div>

      {/* Map Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaflet Map Viewer */}
        <div className="lg:col-span-3 h-[520px] rounded-xl overflow-hidden border border-slate-300 shadow-md relative bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Operational Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 shadow-xl max-w-xs space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">
              GIS Operational Vectors
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-blue-600 border border-white" />
              <span>Base Hospital Logistics Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-red-600 border border-white" />
              <span>Outpost / Camp with Shortage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-indigo-500 border-t border-dashed" />
              <span>Active Dispatch Vector (Straight-Line)</span>
            </div>
            <p className="text-[9px] text-slate-400 italic pt-1 border-t border-slate-800/80">
              * Straight-line geodesic distance. Road route terrain factors may vary.
            </p>
          </div>
        </div>

        {/* Selected Facility / Inventory Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between h-[520px] overflow-y-auto">
          <div>
            <div className="border-b border-slate-100 pb-3 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Selected Facility Telemetry
              </span>
              <h4 className="font-extrabold text-base text-slate-900 mt-0.5">
                {selectedFacility ? selectedFacility.name : 'Select a Facility Marker'}
              </h4>
              {selectedFacility && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[11px] text-slate-700">
                    {selectedFacility.callsign}
                  </span>
                  <span>{selectedFacility.region}</span>
                </div>
              )}
            </div>

            {selectedFacility ? (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Contact Frequency:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedFacility.contact_frequency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 mt-1">
                    <span>Coordinates:</span>
                    <span className="font-mono text-slate-800 text-[11px]">
                      {selectedFacility.latitude.toFixed(4)}°N, {selectedFacility.longitude.toFixed(4)}°E
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Station Inventory Breakdown
                  </h5>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {selectedFacilityInventories.map((inv) => {
                      const available = Math.max(0, inv.quantity_on_hand - inv.quantity_reserved);
                      const isZero = available === 0;

                      return (
                        <div
                          key={inv.id}
                          className={`p-2 rounded border text-xs flex items-center justify-between ${
                            isZero
                              ? 'bg-red-50 border-red-200 text-red-900'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div>
                            <p className="font-semibold">{inv.item?.name}</p>
                            <span className="text-[10px] text-slate-400">
                              Unit: {inv.item?.unit}
                            </span>
                          </div>
                          <span
                            className={`font-mono font-bold text-sm ${
                              isZero ? 'text-red-600 underline' : 'text-slate-800'
                            }`}
                          >
                            {available}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                Click any facility marker on the tactical map to inspect its real-time inventory and logistics telemetry.
              </div>
            )}
          </div>

          {selectedFacility && onRequestEmergency && (
            <div className="pt-3 border-t border-slate-100">
              <Button
                variant="destructive"
                size="sm"
                onClick={onRequestEmergency}
                className="w-full"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Request Supplies for {selectedFacility.name}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
