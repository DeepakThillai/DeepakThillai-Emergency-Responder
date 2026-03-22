const mongoose = require('mongoose');

// ─── History Schema ───────────────────────────────────────────────────────────
// Stores a full sensor snapshot every simulation cycle.
// Useful for analytics, charts, or audit trails.

const HistorySchema = new mongoose.Schema(
  {
    responderId: { type: String, required: true, index: true },
    snapshot: {
      vitals: {
        heartRate:              Number,
        bloodPressureSystolic:  Number,
        bloodPressureDiastolic: Number,
        respiratoryRate:        Number,
        spO2:                   Number,
        bodyTemperature:        Number,
        fatigueLevel:           Number,
      },
      gasExposure: {
        co:          Number,
        co2:         Number,
        o2:          Number,
        h2s:         Number,
        voc:         Number,
        ambientTemp: Number,
        humidity:    Number,
      },
      device: {
        batteryLevel:   Number,
        signalStrength: Number,
        gpsLat:         Number,
        gpsLon:         Number,
        mode:           String,
      },
    },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

HistorySchema.index({ responderId: 1, timestamp: -1 });

// Auto-expire history records after 7 days (optional - remove if you want full history)
// HistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('History', HistorySchema);
