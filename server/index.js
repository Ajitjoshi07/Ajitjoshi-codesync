require('dotenv').config();
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const { setupWSConnection } = require('./wsHandler');
const sessionRoutes = require('./routes/sessions');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(require('cors')());
app.use('/api/sessions', sessionRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// WebSocket upgrade — extract room from URL: /collab?room=roomId
wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});

// MongoDB connect (optional — falls back gracefully if no URI)
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('[MongoDB] Connected'))
    .catch(err => console.warn('[MongoDB] Skipping —', err.message));
}

const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  console.log(`[CodeSync] Server running on port ${PORT}`);
  console.log(`[CodeSync] WebSocket: ws://localhost:${PORT}`);
  console.log(`[CodeSync] REST API: http://localhost:${PORT}/api`);
});
