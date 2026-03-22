const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// ─── GET /alerts ───────────────────────────────────────────────────────────────
// Returns the last 50 alerts sorted by newest first.
// The frontend polls this every 10 seconds.
router.get('/', async (_req, res) => {
  try {
    const alerts = await Alert.find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Transform to match frontend Alert TypeScript interface:
    //   id (string), responderId, responderName, type, category, message, timestamp, acknowledged
    const transformed = alerts.map((a) => ({
      id:            a._id.toString(),
      responderId:   a.responderId,
      responderName: a.responderName,
      type:          a.type,
      category:      a.category,
      message:       a.message,
      timestamp:     a.timestamp,
      acknowledged:  a.acknowledged,
    }));

    res.json(transformed);
  } catch (err) {
    console.error('GET /alerts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// ─── PATCH /alerts/:id/acknowledge ────────────────────────────────────────────
// Acknowledges a single alert by its MongoDB _id.
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true },
      { new: true }
    ).lean();

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      id:           alert._id.toString(),
      acknowledged: alert.acknowledged,
    });
  } catch (err) {
    console.error(`PATCH /alerts/${req.params.id}/acknowledge error:`, err.message);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// ─── DELETE /alerts/:id ────────────────────────────────────────────────────────
// Deletes (dismisses) a single alert permanently.
router.delete('/:id', async (req, res) => {
  try {
    const result = await Alert.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(`DELETE /alerts/${req.params.id} error:`, err.message);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

module.exports = router;
