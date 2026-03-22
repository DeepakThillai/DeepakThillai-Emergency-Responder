#  Emergency Responder Monitoring Dashboard — Full Stack

Real-time monitoring dashboard with MongoDB persistence, Node.js/Express backend,
an autonomous simulation engine, and a React/TypeScript/Vite frontend.

---

##  Quick Start (After Installation)

Since all dependencies are already installed, simply run:

### Windows
```bash
start-all.bat
```

### macOS / Linux
```bash
bash start-all.sh
```

This will automatically start all three services:
- **Backend API** on http://localhost:5000
- **Simulator Engine** (background process)
- **Frontend** on http://localhost:5173

> Open http://localhost:5173 in your browser to view the dashboard. You should see live data updating every 10 seconds.

---

### Data Flow
1. **Simulator** (`/simulator`) runs as a standalone Node.js process. Every 10 seconds it:
   - Reads the 5 responders from MongoDB
   - Applies realistic sensor drift to vitals, gas, and device values
   - Overwrites the responder documents with new values (+ appends to rolling history)
   - Saves a full snapshot to the `histories` collection
   - Evaluates alert thresholds and **appends** new alerts to the `alerts` collection

2. **Backend API** (`/backend`) is an Express server that exposes:
   - `GET  /responders`           → all 5 responders
   - `GET  /alerts`               → last 50 alerts (newest first)
   - `PATCH /alerts/:id/acknowledge` → mark one alert acknowledged
   - `DELETE /alerts/:id`         → remove one alert
   - `GET  /health`               → connection health check

3. **Frontend** (`/frontend`) polls the backend every 10 seconds.
   - No simulation logic exists in the frontend anymore
   - All existing UI components are unchanged
   - Dates returned as ISO strings are transparently converted back to `Date` objects

---

##  Folder Structure

```
full_stack_project/
├── backend/
│   ├── models/
│   │   ├── Responder.js      ← Mongoose schema (vitals, gas, device, history)
│   │   ├── Alert.js          ← Mongoose schema (never overwritten)
│   │   └── History.js        ← Full sensor snapshot per tick
│   ├── routes/
│   │   ├── responders.js     ← GET /responders, GET /responders/:id
│   │   └── alerts.js         ← GET, PATCH, DELETE /alerts
│   ├── server.js             ← Express app entry point
│   ├── .env                  ← MongoDB URI + PORT
│   └── package.json
│
├── simulator/
│   ├── simulate.js           ← Standalone simulation engine
│   ├── .env                  ← MongoDB URI
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/       ← All original UI components (unchanged)
    │   ├── utils/
    │   │   └── api.ts        ← NEW: all fetch calls to backend
    │   ├── App.tsx           ← MODIFIED: polls API, no more setInterval simulation
    │   ├── types.ts          ← Unchanged TypeScript interfaces
    │   └── ...
    ├── .env                  ← VITE_API_URL=http://localhost:5000
    └── package.json
```

---

##  How to Run (Step-by-Step)

### Prerequisites
- Node.js v18 or higher — https://nodejs.org
- npm (comes with Node.js)
- Internet access (to reach MongoDB Atlas)

---

### Step 1 — Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2 — Start the Backend API

```bash
# Still inside /backend
npm start
```

You should see:
```
  MongoDB connected successfully
  Backend API running on http://localhost:5000
```

Leave this terminal open.

---

### Step 3 — Install Simulator Dependencies

Open a **new terminal**:

```bash
cd simulator
npm install
```

### Step 4 — Start the Simulation Engine

```bash
# Still inside /simulator
npm start
```

You should see:
```
  Emergency Responder Simulation Engine starting...
  MongoDB connected
  Seeding initial responders into MongoDB...
     Created responder: Sarah Chen (R1000)
     Created responder: Michael Rodriguez (R1001)
   ...
  Simulation tick at 12:00:00
     Sarah Chen: All readings nominal
     Michael Rodriguez: 1 alert(s) → [Warning]
   ...
  Simulation running every 10s. Press Ctrl+C to stop.
```

Leave this terminal open.

---

### Step 5 — Install Frontend Dependencies

Open a **third terminal**:

```bash
cd frontend
npm install
```

### Step 6 — Start the Frontend

```bash
# Still inside /frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in 500ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

##  Verify Everything Is Working

1. The dashboard loads and shows **5 responder cards**
2. The header shows **"Last updated: HH:MM:SS"**
3. The control panel shows a green **"Live — updates every 10s"** badge
4. Every 10 seconds the sensor values visibly update
5. Alerts appear in the Alert System panel on the right

---

##  MongoDB Collections

| Collection   | Purpose                                       |
|-------------|-----------------------------------------------|
| `responders` | Latest state of all 5 responders (overwritten each tick) |
| `alerts`     | Append-only alert log (never overwritten)     |
| `histories`  | Full sensor snapshot per responder per tick   |

---

##  Configuration

### Backend `.env`
```
MONGODB_URI=mongodb+srv://diiihpak_db_user:...@cluster0.../emergency_responder
PORT=5000
```

### Simulator `.env`
```
MONGODB_URI=mongodb+srv://diiihpak_db_user:...@cluster0.../emergency_responder
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000
```

---

##  Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongoServerError: bad auth` | Check the MongoDB URI in `.env` files |
| `ECONNREFUSED` in frontend | Make sure backend is running on port 5000 |
| Responder cards stuck loading | Start the simulator first, then reload |
| No alerts appearing | Wait ~30s for the simulator to generate threshold-crossing values |
| `Cannot find module` errors | Run `npm install` inside the relevant folder |

---

##  Alert Thresholds

| Sensor         | Warning             | Critical            |
|----------------|---------------------|---------------------|
| Heart Rate     | —                   | > 120 BPM or < 50 BPM |
| SpO2           | —                   | < 90%               |
| Blood Pressure | Systolic > 140 mmHg | —                   |
| Body Temp      | > 38°C              | —                   |
| Respiratory    | > 25 or < 10 /min   | —                   |
| Fatigue        | > 60%               | > 80%               |
| CO             | > 35 PPM            | > 200 PPM           |
| CO2            | > 5000 PPM          | > 10000 PPM         |
| O2             | —                   | < 19.5% or > 23.5%  |
| H2S            | > 10 PPM            | > 50 PPM            |
| Battery        | < 30%               | < 15%               |
| Signal         | < 30%               | —                   |
