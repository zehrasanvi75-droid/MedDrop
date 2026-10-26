# MedDrop — Emergency Medical Inventory & Dispatch Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet)](https://leafletjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-brightgreen?logo=vitest)](https://vitest.dev/)

**MedDrop** is an emergency blood and critical medicine coordination platform designed for remote military forward outposts, disaster-relief medical camps, and regional base hospitals.

When remote border stations experience traumatic mass casualties or venomous envenomation, fragmented phone calls, radio delays, or static spreadsheets cost lives. MedDrop provides a **shared real-time emergency inventory network** that discovers available supplies, calculates geodesic flight and road vectors, atomically reserves stock, and tracks custody handovers across the entire dispatch lifecycle.

---

## 🎯 Key Operational Capabilities

1. **Live Emergency Inventory Grid:**
   - Real-time stock status across registered facilities: **Critical Depleted (0)**, **Low Stock (< Threshold)**, and **Adequate**.
   - Specific medical protocol notice and ABO/Rh tracking for blood products (O-, O+, A+, B+, etc.) alongside antivenoms, surgical kits, burn dressings, and tourniquets.
2. **Dynamic Supplier Discovery & Matching Engine:**
   - Computes geodesic distance (Haversine formula) in kilometers.
   - Filters out facilities with insufficient unreserved stock.
   - Interactive search radius slider (15 km to 200 km) with instant live preview.
   - Prevents duplicate requests and concurrent over-allocation.
3. **Atomic Inventory Reservation:**
   - When a supplying hub clicks **Accept & Reserve**, stock is atomically placed into `quantity_reserved` before physical dispatch, preventing two concurrent forward outposts from reserving the same blood units.
4. **Tactical Incoming Alerts Board with Audio Sirens:**
   - Supplies hubs receive real-time incoming alerts sorted transparently by urgency (Critical first) and age.
   - Optional tactical acoustic siren and radio chime synthesized via browser Web Audio API (zero audio asset dependencies).
   - Reject action with mandatory operational justification.
5. **Interactive Tactical GIS Map (Leaflet & OpenStreetMap):**
   - Renders registered base hospitals, outposts, and relief camps with tactical markers and pulse animations.
   - Shows active straight-line dispatch vectors and coverage circles.
   - Interactive popups inspect local facility telemetry and on-hand supply breakdown.
6. **End-to-End Dispatch Lifecycle:**
   - Complete state machine: `Requested` → `Accepted` → `Dispatched` → `In Transit` → `Delivered`.
   - Multi-modal transport dispatch (Ground Ambulance, Air Evac Helicopter, Tactical Drone).
   - Custody handover signing and automated restock into requesting facility's inventory with celebration confetti.
7. **Immutable Audit Trail & Recharts Analytics:**
   - Transaction logging: `receipt`, `reservation`, `release`, `dispatch`, `adjustment`.
   - Analytics charts: Top demanded emergency supplies, stock warnings by station, fulfillment rates, and average response times.
8. **One-Click Demo Personas & Pitch Guide:**
   - Seamless switching between **Outpost Alpha** (Capt. Elena Rostova), **Sector Base Hospital** (Col. David Vance), **Relief Camp Bravo** (Dr. Aisha Patel), and **Regional HQ** (Gen. Marcus Reed).
   - Prominent **Reset Demo** button that restores the exact initial test conditions for repeatable 3-minute hackathon judging.

---

## ⏱️ 3-Minute Hackathon Demo Script

The application includes an in-app **3-Minute Demo Script modal** and a top **Quick-Bar** to guide judges:

- **Minute 1 — Identify the Emergency (Outpost Alpha)**
  - Switch to **Outpost Alpha**.
  - Show the Operations Dashboard: **0 units of O-Negative Blood** remaining (Critical Depletion).
  - Click **Request Emergency Supply**; observe that the discovery preview detects **Sector Base Hospital** (~65 km away) holding 10 units.
  - Broadcast a **Critical** request for 2 units.
- **Minute 2 — Coordinate Response & Atomic Reservation (Sector Base Hospital)**
  - Switch to **Sector Base Hospital**.
  - The tactical audio alarm sounds and the incoming alert card flashes on the Alerts Queue.
  - Observe distance (~65 km), patient triage status, and local stock verification (10 units available).
  - Click **Accept & Reserve**. 2 units are atomically locked in reserved status (`quantity_reserved = 2`).
- **Minute 3 — Dispatch, Custody Handover, and Restock**
  - Open **Dispatch Management**. Select **Air Evac Helicopter** or **Ground Ambulance** and click **Launch Dispatch**.
  - On-hand stock is decremented from 10 to 8 units. The status moves to **In Transit**.
  - Click **Confirm Delivery**, sign the field handover note as Capt. Rostova, and submit.
  - Outpost Alpha's O-Negative Blood inventory immediately increases from 0 to 2 units.
  - Open **Audit Log & Analytics** to show the complete immutable audit trail and performance charts.

---

## 🛠️ Technology Stack

- **Frontend:** React 18 with TypeScript, Vite 6
- **Styling:** Tailwind CSS with tactical operational color palette
- **Components & Icons:** Lucide React, Custom accessible UI modals and badges
- **Maps:** Leaflet with OpenStreetMap tiles
- **Charts:** Recharts
- **Audio Synthesizer:** Web Audio API (cross-browser tactical alert tone synthesis)
- **Database & Realtime:**
  - **Dual Mode:** Supabase PostgreSQL with Row Level Security and Stored Procedures (`supabase/schema.sql`).
  - **Local Peer Engine:** LocalStorage persistence with `BroadcastChannel` cross-tab realtime synchronization for 100% offline hackathon demonstration reliability.
- **Testing:** Vitest + React Testing Library (8 unit tests covering all business rules).

---

## 📁 Repository Structure

```
MediGo/
├── dist/                      # Production build output
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── admin/             # Facility management & admin controls
│   │   ├── alerts/            # Incoming alerts board & reject modals
│   │   ├── auth/              # Tactical military login & demo switcher
│   │   ├── common/            # Button, Badge, Modal primitives
│   │   ├── dashboard/         # Stat cards, shortage banners, rapid actions
│   │   ├── demo/              # 3-Minute pitch guide modal & quick tour bar
│   │   ├── dispatch/          # Dispatch kanban, launch modal, handover modal
│   │   ├── inventory/         # Live inventory table, adjust modal, blood notice
│   │   ├── layout/            # Navbar, Sidebar, Role switcher
│   │   ├── map/               # Leaflet map, vector routes, coverage circles
│   │   ├── reports/           # Transactions audit table & Recharts analytics
│   │   ├── requests/          # Emergency supply request modal & discovery
│   │   └── tracking/          # Lifecycle stepper & audit event timeline
│   ├── context/
│   │   ├── AuthContext.tsx    # Multi-persona authenticated session
│   │   └── NotificationContext.tsx # Real-time alerts & audio effects
│   ├── lib/
│   │   ├── sound.ts           # Web Audio API emergency siren synthesizer
│   │   ├── supabase.ts        # Supabase client with fallback detection
│   │   └── utils.ts           # Styling, badge formatters, timestamps
│   ├── services/
│   │   ├── dataService.ts     # Atomic mutations, inventory management, queries
│   │   ├── distance.ts        # Haversine formula & transport time estimates
│   │   ├── mockData.ts        # Seed data (Outpost Alpha, Base Hospital, etc.)
│   │   └── realtimeSync.ts    # BroadcastChannel cross-tab realtime sync
│   ├── test/
│   │   ├── setup.ts           # Test environment setup & mocks
│   │   └── inventory-and-workflow.test.ts # 8 vitest unit tests
│   ├── types/
│   │   └── index.ts           # Full TypeScript domain models
│   ├── App.tsx                # Main view router & coordination hub
│   ├── index.css              # Tailwind directives & tactical animations
│   └── main.tsx               # Entry point
├── supabase/
│   ├── schema.sql             # Complete PostgreSQL schema, RLS, & RPC functions
│   └── seed.sql               # Seed data for production Supabase databases
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd MediGo

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Unit Tests

```bash
npm run test
```

### Production Build

```bash
npm run build
```

---

## 🗄️ Connecting to Supabase (Optional)

MedDrop runs out-of-the-box in demo mode without any external configuration. If you wish to connect to a live Supabase project:

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL in `supabase/schema.sql` and `supabase/seed.sql` in the Supabase SQL Editor.
3. Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Restart the development server. MedDrop will automatically detect Supabase and connect to it!

---

## 🛡️ Operational Security & Blood Product Disclaimer

- **OPSEC:** All geographic coordinates and station identifiers in this MVP are fictional reference points designed for demonstration and triage coordination training.
- **Clinical Blood Disclaimer:** ABO/Rh compatibility matching in MedDrop facilitates logistics discovery only. Bedside verification, formal crossmatching, and cold-chain temperature verification (2°C–6°C) remain mandatory under standard medical command protocols before blood release or transfusion.
