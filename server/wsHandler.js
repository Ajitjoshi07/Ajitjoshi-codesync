const WebSocket = require('ws');
const Y = require('yjs');
const { encoding, decoding } = require('lib0');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');

// In-memory room store: roomId -> { doc, awareness, clients: Set }
const rooms = new Map();

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    const doc = new Y.Doc();
    const awareness = new awarenessProtocol.Awareness(doc);

    awareness.on('update', ({ added, updated, removed }) => {
      const changedClients = [...added, ...updated, ...removed];
      const room = rooms.get(roomId);
      if (!room) return;

      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      const buf = encoding.toUint8Array(encoder);

      room.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(buf);
        }
      });
    });

    rooms.set(roomId, { doc, awareness, clients: new Set(), createdAt: Date.now() });
    console.log(`[Room] Created: ${roomId}`);
  }
  return rooms.get(roomId);
}

function setupWSConnection(ws, req) {
  const url = new URL(req.url, 'http://localhost');
  const roomId = url.searchParams.get('room') || 'default';
  const userName = url.searchParams.get('name') || 'Anonymous';
  const userColor = url.searchParams.get('color') || '#888888';

  const room = getOrCreateRoom(roomId);
  room.clients.add(ws);

  console.log(`[Room ${roomId}] "${userName}" joined — ${room.clients.size} users online`);

  // Send full sync step 1 to new client
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(encoder, room.doc);
  ws.send(encoding.toUint8Array(encoder));

  // Send current awareness state
  const awarenessStates = room.awareness.getStates();
  if (awarenessStates.size > 0) {
    const aEncoder = encoding.createEncoder();
    encoding.writeVarUint(aEncoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      aEncoder,
      awarenessProtocol.encodeAwarenessUpdate(room.awareness, [...awarenessStates.keys()])
    );
    ws.send(encoding.toUint8Array(aEncoder));
  }

  ws.on('message', (data) => {
    try {
      const buf = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
      const decoder = decoding.createDecoder(buf);
      const msgType = decoding.readVarUint(decoder);

      if (msgType === MESSAGE_SYNC) {
        const replyEncoder = encoding.createEncoder();
        encoding.writeVarUint(replyEncoder, MESSAGE_SYNC);
        const syncMsgType = syncProtocol.readSyncMessage(decoder, replyEncoder, room.doc, null);

        if (encoding.length(replyEncoder) > 1) {
          ws.send(encoding.toUint8Array(replyEncoder));
        }

        // Broadcast doc update to all other clients in room
        if (syncMsgType === syncProtocol.messageYjsSyncStep2 || syncMsgType === syncProtocol.messageYjsUpdate) {
          room.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(buf);
            }
          });
        }
      } else if (msgType === MESSAGE_AWARENESS) {
        awarenessProtocol.applyAwarenessUpdate(
          room.awareness,
          decoding.readVarUint8Array(decoder),
          ws
        );
      }
    } catch (err) {
      console.error('[WS] Message error:', err.message);
    }
  });

  ws.on('close', () => {
    room.clients.delete(ws);
    awarenessProtocol.removeAwarenessStates(room.awareness, [room.doc.clientID], null);
    console.log(`[Room ${roomId}] "${userName}" left — ${room.clients.size} users online`);

    // Cleanup empty rooms after 1 hour
    if (room.clients.size === 0) {
      setTimeout(() => {
        if (rooms.get(roomId)?.clients.size === 0) {
          room.doc.destroy();
          rooms.delete(roomId);
          console.log(`[Room] Cleaned up: ${roomId}`);
        }
      }, 3600000);
    }
  });

  ws.on('error', (err) => console.error(`[WS] Error in ${roomId}:`, err.message));
}

function getRoomStats() {
  const stats = [];
  rooms.forEach((room, id) => {
    stats.push({ id, users: room.clients.size, createdAt: room.createdAt });
  });
  return stats;
}

module.exports = { setupWSConnection, getRoomStats };
