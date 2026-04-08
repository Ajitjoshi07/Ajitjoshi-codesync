const express = require('express');
const router = express.Router();
const { getRoomStats } = require('../wsHandler');

let Session;
try { Session = require('../models/Session'); } catch(e) {}

// POST /api/sessions — create room
router.post('/', async (req, res) => {
  const { name = 'Untitled', createdBy = 'Anonymous', roomId, hasPassword } = req.body;

  if (!roomId) return res.status(400).json({ error: 'roomId required' });

  // Check if room already active in WebSocket
  const activeRooms = getRoomStats();
  const activeExists = activeRooms.some(r => r.id === roomId.trim().toLowerCase());
  if (activeExists) {
    return res.status(409).json({ error: 'Room ID already exists', taken: true });
  }

  try {
    if (Session) {
      const existing = await Session.findOne({ roomId });
      if (existing) return res.status(409).json({ error: 'Room ID already exists', taken: true });
      const session = await Session.create({ roomId, name, createdBy, hasPassword: !!hasPassword, files: [] });
      return res.json({ roomId, sessionId: session._id, name });
    }
  } catch(err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Room ID already exists', taken: true });
    console.warn('[Sessions] DB error:', err.message);
  }

  res.json({ roomId, name });
});

// GET /api/sessions/check/:roomId — availability check
router.get('/check/:roomId', async (req, res) => {
  const roomId = req.params.roomId?.trim().toLowerCase();
  if (!roomId) return res.json({ exists: false });

  // Check active WebSocket rooms first
  const activeRooms = getRoomStats();
  if (activeRooms.some(r => r.id === roomId)) {
    return res.json({ exists: true });
  }

  // Check DB
  try {
    if (Session) {
      const existing = await Session.findOne({ roomId });
      if (existing) return res.json({ exists: true });
    }
  } catch(err) {}

  res.json({ exists: false });
});

// GET /api/sessions — list active rooms
router.get('/', (req, res) => {
  res.json({ activeRooms: getRoomStats() });
});

// GET /api/sessions/:roomId
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    if (Session) {
      const session = await Session.findOne({ roomId });
      if (session) return res.json(session);
    }
  } catch(err) {}
  res.json({ roomId, files: [] });
});

module.exports = router;
