require('dotenv').config();
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const { setupWSConnection, getRoomStats } = require('./wsHandler');
const sessionRoutes = require('./routes/sessions');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// CORS — allow requests from any origin (needed for Render)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use('/api/sessions', sessionRoutes);

// Health check — keeps server alive, used by client to wake server
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    rooms: getRoomStats().length,
    timestamp: new Date().toISOString()
  });
});

// Root route — show server info instead of blank
app.get('/', (req, res) => {
  res.json({
    name: 'CodeSync Server',
    status: 'running',
    version: '1.0.0',
    author: 'Ajit Mukund Joshi',
    websocket: 'ws://this-server/roomId',
    health: '/health',
    api: '/api/sessions'
  });
});

wss.on('connection', (ws, req) => {
  console.log(`[Server] WebSocket connection: "${req.url}"`);
  setupWSConnection(ws, req);
});

// MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('[MongoDB] Connected'))
    .catch(err => console.warn('[MongoDB] Not connected —', err.message));
}

const PORT = process.env.PORT || 1234;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CodeSync] Server running on port ${PORT}`);
  console.log(`[CodeSync] WebSocket ready`);
  console.log(`[CodeSync] REST API at /api`);
  console.log(`[CodeSync] Health check at /health`);
});
