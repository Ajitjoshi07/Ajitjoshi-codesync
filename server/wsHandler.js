const WebSocket = require('ws');
const Y = require('yjs');
const { encoding, decoding } = require('lib0');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');

const rooms = new Map();
const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    console.log(`[Server] New room: "${roomId}"`);
    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);

    awareness.on('update', ({ added, updated, removed }) => {
      const room = rooms.get(roomId);
      if (!room) return;
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed])
      );
      const buf = encoding.toUint8Array(encoder);
      room.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(buf); });
    });

    rooms.set(roomId, { doc, awareness, clients: new Set(), createdAt: Date.now() });
  }
  return rooms.get(roomId);
}

function setupWSConnection(ws, req) {
  // Parse room ID from URL path
  // y-websocket connects to: wss://server/roomId
  // So req.url = "/roomId" or "/roomId?params"
  let roomId = req.url.split('?')[0].replace(/^\/+/, '').trim().toLowerCase();

  if (!roomId) {
    console.warn(`[Server] No room ID in URL: "${req.url}" — closing`);
    ws.close(1008, 'Room ID required');
    return;
  }

  const room = getOrCreateRoom(roomId);
  room.clients.add(ws);
  console.log(`[Server] "${roomId}": ${room.clients.size} user(s)`);

  // Sync step 1
  const enc = encoding.createEncoder();
  encoding.writeVarUint(enc, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(enc, room.doc);
  ws.send(encoding.toUint8Array(enc));

  // Send awareness
  const states = room.awareness.getStates();
  if (states.size > 0) {
    const aEnc = encoding.createEncoder();
    encoding.writeVarUint(aEnc, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(aEnc, awarenessProtocol.encodeAwarenessUpdate(room.awareness, [...states.keys()]));
    ws.send(encoding.toUint8Array(aEnc));
  }

  ws.on('message', (data) => {
    try {
      const buf = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
      const decoder = decoding.createDecoder(buf);
      const msgType = decoding.readVarUint(decoder);

      if (msgType === MESSAGE_SYNC) {
        const replyEnc = encoding.createEncoder();
        encoding.writeVarUint(replyEnc, MESSAGE_SYNC);
        const syncMsgType = syncProtocol.readSyncMessage(decoder, replyEnc, room.doc, null);
        if (encoding.length(replyEnc) > 1) ws.send(encoding.toUint8Array(replyEnc));
        if (syncMsgType === syncProtocol.messageYjsSyncStep2 || syncMsgType === syncProtocol.messageYjsUpdate) {
          room.clients.forEach(c => { if (c !== ws && c.readyState === WebSocket.OPEN) c.send(buf); });
        }
      } else if (msgType === MESSAGE_AWARENESS) {
        awarenessProtocol.applyAwarenessUpdate(room.awareness, decoding.readVarUint8Array(decoder), ws);
      }
    } catch (err) {
      console.error(`[Room "${roomId}"] Msg error:`, err.message);
    }
  });

  ws.on('close', () => {
    room.clients.delete(ws);
    awarenessProtocol.removeAwarenessStates(room.awareness, [room.doc.clientID], null);
    console.log(`[Server] "${roomId}": ${room.clients.size} user(s)`);
    if (room.clients.size === 0) {
      setTimeout(() => {
        if (rooms.get(roomId)?.clients.size === 0) {
          room.doc.destroy();
          rooms.delete(roomId);
          console.log(`[Server] Room "${roomId}" cleaned up`);
        }
      }, 3600000);
    }
  });

  ws.on('error', err => console.error(`[Room "${roomId}"] Error:`, err.message));
}

function getRoomStats() {
  const stats = [];
  rooms.forEach((room, id) => stats.push({ id, users: room.clients.size, createdAt: room.createdAt }));
  return stats;
}

module.exports = { setupWSConnection, getRoomStats };
