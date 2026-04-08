const express = require('express');
const router = express.Router();
const { customAlphabet } = require('nanoid');
const { getRoomStats } = require('../wsHandler');

let Session;
try { Session = require('../models/Session'); } catch (e) {}

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

// POST /api/sessions — create room
router.post('/', async (req, res) => {
  const { name = 'Untitled', createdBy = 'Anonymous', roomId, hasPassword } = req.body;

  const defaultFiles = [
    { name: 'main.js', language: 'javascript', content: '// Start coding!\nconsole.log("Hello, CodeSync!");\n' },
    { name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head><title>My App</title></head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>\n' },
    { name: 'style.css', language: 'css', content: 'body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n' }
  ];

  try {
    if (Session) {
      // Check if room already exists in DB
      const existing = await Session.findOne({ roomId });
      if (existing) {
        return res.status(409).json({ error: 'Room ID already exists', taken: true });
      }
      const session = await Session.create({ roomId, name, createdBy, files: defaultFiles, hasPassword: !!hasPassword });
      return res.json({ roomId, sessionId: session._id, name });
    }
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Room ID already exists', taken: true });
    }
    console.warn('[Sessions] DB error:', err.message);
  }

  // Fallback: check active WebSocket rooms
  const activeRooms = getRoomStats();
  const roomExists = activeRooms.some(r => r.id === roomId?.trim().toLowerCase());
  if (roomExists) {
    return res.status(409).json({ error: 'Room ID already exists', taken: true });
  }

  res.json({ roomId, name, note: 'Session not persisted (no DB)' });
});

// GET /api/sessions/check/:roomId — check if room exists
router.get('/check/:roomId', async (req, res) => {
  const roomId = req.params.roomId?.trim().toLowerCase();
  if (!roomId) return res.json({ exists: false });

  try {
    if (Session) {
      const existing = await Session.findOne({ roomId });
      if (existing) return res.json({ exists: true });
    }
  } catch (err) {}

  // Check active WebSocket rooms
  const activeRooms = getRoomStats();
  const exists = activeRooms.some(r => r.id === roomId);
  res.json({ exists });
});

// GET /api/sessions/:roomId
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    if (Session) {
      const session = await Session.findOne({ roomId });
      if (!session) return res.status(404).json({ error: 'Room not found' });
      return res.json(session);
    }
  } catch (err) {}
  res.json({ roomId, files: [], note: 'Live session (no DB)' });
});

// GET /api/sessions — list active rooms
router.get('/', (req, res) => {
  res.json({ activeRooms: getRoomStats() });
});

module.exports = router;
