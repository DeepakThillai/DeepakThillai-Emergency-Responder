const mongoose = require('mongoose');

// ─── Sub-schemas (mirror frontend TypeScript interfaces exactly) ───────────────

const VitalSignsSchema = new mongoose.Schema(
  {
    heartRate:              { type: Number, required: true },
    bloodPressureSystolic:  { type: Number, required: true },
    bloodPressureDiastolic: { type: Number, required: true },
    respiratoryRate:        { type: Number, required: true },
    spO2:                   { type: Number, required: true },
    bodyTemperature:        { type: Number, required: true },
    fatigueLevel:           { type: Number, required: true },
  },
  { _id: false }
);

const GasExposureSchema = new mongoose.Schema(
  {
    co:          { type: Number, required: true },
    co2:         { type: Number, required: true },
    o2:          { type: Number, required: true },
    h2s:         { type: Number, required: true },
    voc:         { type: Number, required: true },
    ambientTemp: { type: Number, required: true },
    humidity:    { type: Number, required: true },
  },
  { _id: false }
);

const DeviceStatusSchema = new mongoose.Schema(
  {
    batteryLevel:   { type: Number, required: true },
    signalStrength: { type: Number, required: true },
    lastSync:       { type: Date,   required: true },
    gpsLat:         { type: Number, required: true },
    gpsLon:         { type: Number, required: true },
    mode:           { type: String, enum: ['Active', 'Standby', 'Charging'], default: 'Active' },
  },
  { _id: false }
);

const HistoryVitalSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    vitals:    { type: VitalSignsSchema, required: true },
  },
  { _id: false }
);

const HistoryGasSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    gas:       { type: GasExposureSchema, required: true },
  },
  { _id: false }
);

// ─── Main Responder Schema ─────────────────────────────────────────────────────
const ResponderSchema = new mongoose.Schema(
  {
    responderId:    { type: String, required: true, unique: true, index: true },
    name:           { type: String, required: true },
    role:           { type: String, required: true },
    status:         { type: String, enum: ['Active', 'Critical', 'Offline'], default: 'Active' },
    vitals:         { type: VitalSignsSchema,  required: true },
    gasExposure:    { type: GasExposureSchema, required: true },
    device:         { type: DeviceStatusSchema, required: true },
    deploymentTime: { type: Date, required: true },
    vitalHistory:   { type: [HistoryVitalSchema], default: [] },
    gasHistory:     { type: [HistoryGasSchema],   default: [] },
    lastUpdated:    { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Keep history capped at 60 entries per responder (done in simulator)
ResponderSchema.index({ responderId: 1 });

module.exports = mongoose.model('Responder', ResponderSchema);
