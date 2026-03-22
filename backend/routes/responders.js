const express = require('express');
const router = express.Router();
const Responder = require('../models/Responder');

// ─── GET /responders ───────────────────────────────────────────────────────────
// Returns all 5 responders with their latest sensor data.
// The frontend polls this every 10 seconds.
router.get('/', async (_req, res) => {
  try {
    const responders = await Responder.find({}).lean();

    // Transform MongoDB documents to match frontend Responder TypeScript interface:
    //   - responderId → id
    //   - Dates are serialised as ISO strings (JS new Date() handles them fine)
    const transformed = responders.map((r) => ({
      id:             r.responderId,
      name:           r.name,
      role:           r.role,
      status:         r.status,
      vitals:         r.vitals,
      gasExposure:    r.gasExposure,
      device: {
        ...r.device,
        lastSync: r.device.lastSync,
      },
      deploymentTime: r.deploymentTime,
      vitalHistory:   r.vitalHistory || [],
      gasHistory:     r.gasHistory   || [],
      lastUpdated:    r.lastUpdated,
    }));

    res.json(transformed);
  } catch (err) {
    console.error('GET /responders error:', err.message);
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

// ─── GET /responders/:id ───────────────────────────────────────────────────────
// Returns a single responder by responderId.
router.get('/:id', async (req, res) => {
  try {
    const responder = await Responder.findOne({ responderId: req.params.id }).lean();
    if (!responder) {
      return res.status(404).json({ error: 'Responder not found' });
    }

    const transformed = {
      id:             responder.responderId,
      name:           responder.name,
      role:           responder.role,
      status:         responder.status,
      vitals:         responder.vitals,
      gasExposure:    responder.gasExposure,
      device:         responder.device,
      deploymentTime: responder.deploymentTime,
      vitalHistory:   responder.vitalHistory || [],
      gasHistory:     responder.gasHistory   || [],
      lastUpdated:    responder.lastUpdated,
    };

    res.json(transformed);
  } catch (err) {
    console.error(`GET /responders/${req.params.id} error:`, err.message);
    res.status(500).json({ error: 'Failed to fetch responder' });
  }
});

module.exports = router;
