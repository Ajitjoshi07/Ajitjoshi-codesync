const express = require('express');
const router = express.Router();
const { customAlphabet } = require('nanoid');
const { getRoomStats } = require('../wsHandler');

// Try to load Session model — graceful fallback if MongoDB not connected
let Session;
try {
  Session = require('../models/Session');
} catch (e) {}

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

// POST /api/sessions — create a new room
router.post('/', async (req, res) => {
  const roomId = nanoid();
  const { name = 'Untitled Session', createdBy = 'Anonymous' } = req.body;

  const defaultFiles = [
    { name: 'main.js', language: 'javascript', content: '// Start coding here!\nconsole.log("Hello, CodeSync!");\n' },
    { name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head><title>My App</title></head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>\n' },
    { name: 'style.css', language: 'css', content: 'body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n' }
  ];

  try {
    if (Session) {
      const session = await Session.create({ roomId, name, createdBy, files: defaultFiles });
      return res.json({ roomId, sessionId: session._id, name });
    }
  } catch (err) {
    console.warn('[Sessions] DB error, using in-memory:', err.message);
  }

  // Fallback: return roomId without DB persistence
  res.json({ roomId, name, note: 'Session not persisted (no DB)' });
});

// GET /api/sessions/:roomId — get session info
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    if (Session) {
      const session = await Session.findOne({ roomId });
      if (!session) return res.status(404).json({ error: 'Room not found' });
      return res.json(session);
    }
  } catch (err) {
    console.warn('[Sessions] DB error:', err.message);
  }
  res.json({ roomId, files: [], note: 'Live session (no DB)' });
});

// GET /api/sessions — list active rooms (WebSocket stats)
router.get('/', (req, res) => {
  res.json({ activeRooms: getRoomStats() });
});

module.exports = router;
