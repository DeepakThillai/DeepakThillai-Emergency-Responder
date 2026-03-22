require('dotenv').config();
const mongoose = require('mongoose');

// ─── Inline Models (simulator is standalone, no shared code with backend) ─────

const VitalSignsSchema = new mongoose.Schema({ heartRate: Number, bloodPressureSystolic: Number, bloodPressureDiastolic: Number, respiratoryRate: Number, spO2: Number, bodyTemperature: Number, fatigueLevel: Number }, { _id: false });
const GasExposureSchema = new mongoose.Schema({ co: Number, co2: Number, o2: Number, h2s: Number, voc: Number, ambientTemp: Number, humidity: Number }, { _id: false });
const DeviceStatusSchema = new mongoose.Schema({ batteryLevel: Number, signalStrength: Number, lastSync: Date, gpsLat: Number, gpsLon: Number, mode: String }, { _id: false });
const HistoryVitalSchema = new mongoose.Schema({ timestamp: Date, vitals: VitalSignsSchema }, { _id: false });
const HistoryGasSchema   = new mongoose.Schema({ timestamp: Date, gas: GasExposureSchema }, { _id: false });

const ResponderSchema = new mongoose.Schema({
  responderId:    { type: String, required: true, unique: true },
  name:           String,
  role:           String,
  status:         { type: String, enum: ['Active', 'Critical', 'Offline'], default: 'Active' },
  vitals:         VitalSignsSchema,
  gasExposure:    GasExposureSchema,
  device:         DeviceStatusSchema,
  deploymentTime: Date,
  vitalHistory:   [HistoryVitalSchema],
  gasHistory:     [HistoryGasSchema],
  lastUpdated:    { type: Date, default: Date.now },
}, { versionKey: false });

const AlertSchema = new mongoose.Schema({
  responderId:   { type: String, required: true },
  responderName: String,
  type:          { type: String, enum: ['Critical', 'Warning', 'Info'] },
  category:      String,
  message:       String,
  value:         Number,
  timestamp:     { type: Date, default: Date.now },
  acknowledged:  { type: Boolean, default: false },
}, { versionKey: false });

const HistorySchema = new mongoose.Schema({
  responderId: String,
  snapshot:    mongoose.Schema.Types.Mixed,
  timestamp:   { type: Date, default: Date.now },
}, { versionKey: false });

const Responder = mongoose.model('Responder', ResponderSchema);
const Alert     = mongoose.model('Alert', AlertSchema);
const History   = mongoose.model('History', HistorySchema);

// ─── Responder Definitions ────────────────────────────────────────────────────

const RESPONDER_DEFS = [
  { responderId: 'R1000', name: 'Sarah Chen',        role: 'Fire Captain' },
  { responderId: 'R1001', name: 'Michael Rodriguez', role: 'Paramedic' },
  { responderId: 'R1002', name: 'James Wilson',      role: 'Firefighter' },
  { responderId: 'R1003', name: 'Emily Taylor',      role: 'Hazmat Specialist' },
  { responderId: 'R1004', name: 'David Martinez',    role: 'Rescue Technician' },
];

// ─── Alert Thresholds (match frontend defaultThresholds exactly) ───────────────

const THRESHOLDS = {
  heartRate:       { min: 50,    max: 120 },
  bloodPressure:   { systolic: 140, diastolic: 90 },
  respiratoryRate: { min: 10,    max: 25 },
  spO2:            { min: 90 },
  bodyTemperature: { min: 35,    max: 38 },
  co:              { warning: 35,   danger: 200 },
  co2:             { warning: 5000, danger: 10000 },
  o2:              { min: 19.5,  max: 23.5 },
  h2s:             { warning: 10,   danger: 50 },
  fatigueLevel:    { warning: 60,   danger: 80 },
  battery:         { warning: 30,   danger: 15 },
};

// ─── Random Helpers ───────────────────────────────────────────────────────────

function rand(min, max) { return min + Math.random() * (max - min); }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function drift(val, delta, min, max) { return clamp(val + (Math.random() - 0.5) * delta, min, max); }

// ─── Initial State Generators ─────────────────────────────────────────────────

function initialVitals() {
  return {
    heartRate:              rand(68, 88),
    bloodPressureSystolic:  rand(112, 125),
    bloodPressureDiastolic: rand(72, 85),
    respiratoryRate:        rand(13, 18),
    spO2:                   rand(97, 99.9),
    bodyTemperature:        rand(36.4, 37.2),
    fatigueLevel:           rand(10, 25),
  };
}

function initialGas() {
  return {
    co:          rand(0, 8),
    co2:         rand(400, 600),
    o2:          rand(20.3, 21.0),
    h2s:         rand(0, 1.5),
    voc:         rand(0, 40),
    ambientTemp: rand(18, 28),
    humidity:    rand(38, 58),
  };
}

function initialDevice(responderId) {
  // Spread GPS around a NYC-style coordinate base
  const index = parseInt(responderId.replace('R', '')) - 1000;
  return {
    batteryLevel:   rand(80, 100),
    signalStrength: rand(70, 100),
    lastSync:       new Date(),
    gpsLat:         40.7128 + (index * 0.003) + rand(-0.002, 0.002),
    gpsLon:        -74.0060 + (index * 0.003) + rand(-0.002, 0.002),
    mode:           'Active',
  };
}

// ─── State Update Functions ───────────────────────────────────────────────────

function updateVitals(v, hoursDeployed) {
  // Fatigue builds up gradually over time
  const fatigueDrift = hoursDeployed * 0.08;

  return {
    heartRate:              drift(v.heartRate,              3,    50,  140),
    bloodPressureSystolic:  drift(v.bloodPressureSystolic,  2,    90,  160),
    bloodPressureDiastolic: drift(v.bloodPressureDiastolic, 2,    60,  100),
    respiratoryRate:        drift(v.respiratoryRate,        1,    8,   30),
    spO2:                   drift(v.spO2,                   0.5,  88,  100),
    bodyTemperature:        drift(v.bodyTemperature,        0.1,  34,  39),
    fatigueLevel:           clamp(v.fatigueLevel + fatigueDrift + (Math.random() - 0.3) * 0.5, 0, 100),
  };
}

function updateGas(g) {
  return {
    co:          Math.max(0,    drift(g.co,          2,    0,   250)),
    co2:         Math.max(400,  drift(g.co2,         100,  400, 12000)),
    o2:          drift(g.o2,    0.1,  19.0, 21.5),
    h2s:         Math.max(0,    drift(g.h2s,         0.5,  0,   80)),
    voc:         Math.max(0,    drift(g.voc,         10,   0,   400)),
    ambientTemp: drift(g.ambientTemp, 1,  15,  50),
    humidity:    drift(g.humidity,    2,  20,  80),
  };
}

function updateDevice(d, hoursDeployed) {
  // Battery drains ~2% per hour
  const newBattery = clamp(d.batteryLevel - (hoursDeployed * 0.003), 5, 100);
  return {
    batteryLevel:   newBattery,
    signalStrength: drift(d.signalStrength, 10, 20, 100),
    lastSync:       new Date(),
    gpsLat:         d.gpsLat + (Math.random() - 0.5) * 0.001,
    gpsLon:         d.gpsLon + (Math.random() - 0.5) * 0.001,
    mode:           newBattery < 20 ? 'Charging' : 'Active',
  };
}

function deriveStatus(vitals, gasExposure) {
  if (
    vitals.heartRate > THRESHOLDS.heartRate.max ||
    vitals.spO2 < THRESHOLDS.spO2.min ||
    gasExposure.co > THRESHOLDS.co.danger ||
    vitals.fatigueLevel > THRESHOLDS.fatigueLevel.danger
  ) return 'Critical';
  return 'Active';
}

// ─── Alert Generation ─────────────────────────────────────────────────────────

function generateAlerts(responderId, responderName, vitals, gasExposure, device) {
  const alerts = [];
  const now = new Date();

  function push(type, category, message, value = null) {
    alerts.push({ responderId, responderName, type, category, message, value, timestamp: now, acknowledged: false });
  }

  // ── Vital Signs ──
  if (vitals.heartRate > THRESHOLDS.heartRate.max) {
    push('Critical', 'Vital Signs', `Heart rate elevated: ${vitals.heartRate.toFixed(0)} BPM`, vitals.heartRate);
  } else if (vitals.heartRate < THRESHOLDS.heartRate.min) {
    push('Critical', 'Vital Signs', `Heart rate low: ${vitals.heartRate.toFixed(0)} BPM`, vitals.heartRate);
  }

  if (vitals.bloodPressureSystolic > THRESHOLDS.bloodPressure.systolic) {
    push('Warning', 'Vital Signs', `Blood pressure elevated: ${vitals.bloodPressureSystolic.toFixed(0)}/${vitals.bloodPressureDiastolic.toFixed(0)} mmHg`, vitals.bloodPressureSystolic);
  }

  if (vitals.spO2 < THRESHOLDS.spO2.min) {
    push('Critical', 'Vital Signs', `Low oxygen saturation: ${vitals.spO2.toFixed(1)}%`, vitals.spO2);
  }

  if (vitals.bodyTemperature > THRESHOLDS.bodyTemperature.max) {
    push('Warning', 'Vital Signs', `Elevated body temperature: ${vitals.bodyTemperature.toFixed(1)}°C`, vitals.bodyTemperature);
  }

  if (vitals.respiratoryRate > THRESHOLDS.respiratoryRate.max) {
    push('Warning', 'Vital Signs', `High respiratory rate: ${vitals.respiratoryRate.toFixed(0)} /min`, vitals.respiratoryRate);
  } else if (vitals.respiratoryRate < THRESHOLDS.respiratoryRate.min) {
    push('Warning', 'Vital Signs', `Low respiratory rate: ${vitals.respiratoryRate.toFixed(0)} /min`, vitals.respiratoryRate);
  }

  // ── Fatigue ──
  if (vitals.fatigueLevel > THRESHOLDS.fatigueLevel.danger) {
    push('Critical', 'Fatigue', `Critical fatigue level: ${vitals.fatigueLevel.toFixed(0)}%`, vitals.fatigueLevel);
  } else if (vitals.fatigueLevel > THRESHOLDS.fatigueLevel.warning) {
    push('Warning', 'Fatigue', `High fatigue level: ${vitals.fatigueLevel.toFixed(0)}%`, vitals.fatigueLevel);
  }

  // ── Gas Exposure ──
  if (gasExposure.co > THRESHOLDS.co.danger) {
    push('Critical', 'Gas Exposure', `Dangerous CO levels: ${gasExposure.co.toFixed(0)} PPM`, gasExposure.co);
  } else if (gasExposure.co > THRESHOLDS.co.warning) {
    push('Warning', 'Gas Exposure', `Elevated CO levels: ${gasExposure.co.toFixed(0)} PPM`, gasExposure.co);
  }

  if (gasExposure.co2 > THRESHOLDS.co2.danger) {
    push('Critical', 'Gas Exposure', `Dangerous CO2 levels: ${gasExposure.co2.toFixed(0)} PPM`, gasExposure.co2);
  } else if (gasExposure.co2 > THRESHOLDS.co2.warning) {
    push('Warning', 'Gas Exposure', `Elevated CO2 levels: ${gasExposure.co2.toFixed(0)} PPM`, gasExposure.co2);
  }

  if (gasExposure.o2 < THRESHOLDS.o2.min || gasExposure.o2 > THRESHOLDS.o2.max) {
    push('Critical', 'Gas Exposure', `Unsafe oxygen levels: ${gasExposure.o2.toFixed(1)}%`, gasExposure.o2);
  }

  if (gasExposure.h2s > THRESHOLDS.h2s.danger) {
    push('Critical', 'Gas Exposure', `Dangerous H2S levels: ${gasExposure.h2s.toFixed(1)} PPM`, gasExposure.h2s);
  } else if (gasExposure.h2s > THRESHOLDS.h2s.warning) {
    push('Warning', 'Gas Exposure', `Elevated H2S levels: ${gasExposure.h2s.toFixed(1)} PPM`, gasExposure.h2s);
  }

  // ── Device ──
  if (device.batteryLevel < THRESHOLDS.battery.danger) {
    push('Critical', 'Device', `Critical battery: ${device.batteryLevel.toFixed(0)}%`, device.batteryLevel);
  } else if (device.batteryLevel < THRESHOLDS.battery.warning) {
    push('Warning', 'Device', `Low battery: ${device.batteryLevel.toFixed(0)}%`, device.batteryLevel);
  }

  if (device.signalStrength < 30) {
    push('Warning', 'Device', `Weak signal: ${device.signalStrength.toFixed(0)}%`, device.signalStrength);
  }

  return alerts;
}

// ─── Seed Initial Responders (runs once if collection is empty) ───────────────

async function seedRespondersIfEmpty() {
  const count = await Responder.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  Found ${count} existing responders — skipping seed`);
    return;
  }

  console.log('🌱  Seeding initial responders into MongoDB...');
  const now = new Date();

  for (const def of RESPONDER_DEFS) {
    const deploymentOffset = Math.random() * 3600000; // up to 1 hour ago
    await Responder.create({
      responderId:    def.responderId,
      name:           def.name,
      role:           def.role,
      status:         'Active',
      vitals:         initialVitals(),
      gasExposure:    initialGas(),
      device:         initialDevice(def.responderId),
      deploymentTime: new Date(now.getTime() - deploymentOffset),
      vitalHistory:   [],
      gasHistory:     [],
      lastUpdated:    now,
    });
    console.log(`   ✅  Created responder: ${def.name} (${def.responderId})`);
  }

  console.log('✅  Seed complete\n');
}

// ─── Main Simulation Tick ─────────────────────────────────────────────────────

async function simulationTick() {
  const now = new Date();
  console.log(`\n⏱️  Simulation tick at ${now.toLocaleTimeString()}`);

  try {
    const responders = await Responder.find({});

    if (responders.length === 0) {
      console.warn('⚠️  No responders found. Run seed first.');
      return;
    }

    for (const responder of responders) {
      const hoursDeployed = (now.getTime() - responder.deploymentTime.getTime()) / 3600000;

      // ── Update sensor values ──
      const newVitals  = updateVitals(responder.vitals,     hoursDeployed);
      const newGas     = updateGas(responder.gasExposure);
      const newDevice  = updateDevice(responder.device,     hoursDeployed);
      const newStatus  = deriveStatus(newVitals, newGas);

      // ── Append to rolling history (capped at 60 entries) ──
      const vitalHistory = [
        ...responder.vitalHistory,
        { timestamp: now, vitals: newVitals },
      ].slice(-60);

      const gasHistory = [
        ...responder.gasHistory,
        { timestamp: now, gas: newGas },
      ].slice(-60);

      // ── Overwrite latest state in responders collection ──
      await Responder.findOneAndUpdate(
        { responderId: responder.responderId },
        {
          $set: {
            vitals:      newVitals,
            gasExposure: newGas,
            device:      newDevice,
            status:      newStatus,
            vitalHistory,
            gasHistory,
            lastUpdated: now,
          },
        },
        { new: true }
      );

      // ── Save full snapshot to history collection ──
      await History.create({
        responderId: responder.responderId,
        snapshot: {
          vitals:      newVitals,
          gasExposure: newGas,
          device: {
            batteryLevel:   newDevice.batteryLevel,
            signalStrength: newDevice.signalStrength,
            gpsLat:         newDevice.gpsLat,
            gpsLon:         newDevice.gpsLon,
            mode:           newDevice.mode,
          },
        },
        timestamp: now,
      });

      // ── Generate and store alerts (never overwritten) ──
      const newAlerts = generateAlerts(
        responder.responderId,
        responder.name,
        newVitals,
        newGas,
        newDevice
      );

      if (newAlerts.length > 0) {
        await Alert.insertMany(newAlerts);
        console.log(`   🚨  ${responder.name}: ${newAlerts.length} alert(s) → [${newAlerts.map(a => a.type).join(', ')}]`);
      } else {
        console.log(`   ✅  ${responder.name}: All readings nominal`);
      }
    }

    console.log(`✔️  Tick complete — updated ${responders.length} responders`);
  } catch (err) {
    console.error('❌  Simulation tick error:', err.message);
  }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

async function main() {
  console.log('🤖  Emergency Responder Simulation Engine starting...');
  console.log(`🔗  Connecting to MongoDB...`);

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  MongoDB connected\n');
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  }

  // Seed responders if DB is empty
  await seedRespondersIfEmpty();

  // Run first tick immediately
  await simulationTick();

  // Then repeat every 10 seconds
  const INTERVAL_MS = 10000;
  console.log(`\n🔄  Simulation running every ${INTERVAL_MS / 1000}s. Press Ctrl+C to stop.\n`);
  setInterval(simulationTick, INTERVAL_MS);
}

main();
