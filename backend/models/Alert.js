const mongoose = require('mongoose');

// ─── Alert Schema ─────────────────────────────────────────────────────────────
// Alerts are NEVER overwritten - they form a historical log.
// The frontend Alert interface uses string `id` — we expose _id as id via transform.

const AlertSchema = new mongoose.Schema(
  {
    responderId:   { type: String, required: true, index: true },
    responderName: { type: String, required: true },
    type:          { type: String, enum: ['Critical', 'Warning', 'Info'], required: true },
    category:      { type: String, required: true },  // e.g. "Vital Signs", "Gas Exposure", "Device", "Fatigue"
    message:       { type: String, required: true },
    value:         { type: Number, default: null },   // optional raw numeric value for reference
    timestamp:     { type: Date, required: true, default: Date.now },
    acknowledged:  { type: Boolean, default: false },
  },
  {
    timestamps: false,
    versionKey: false,
    // Transform _id → id in JSON output so frontend TypeScript type matches
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
      },
    },
  }
);

AlertSchema.index({ timestamp: -1 });
AlertSchema.index({ responderId: 1, timestamp: -1 });

module.exports = mongoose.model('Alert', AlertSchema);
