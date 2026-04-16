import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

// ✅ FIXED WebSocket URL (LOCAL + PRODUCTION)
const WS_BASE =
  window.location.hostname === "localhost"
    ? "ws://localhost:1234"
    : "wss://ajitjoshi-codesync.onrender.com";

export function useCollabEditor({ roomId, userName, userColor, fileName, projects, setProjects }) {
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const isRemoteUpdate = useRef(false);
  const currentRoomRef = useRef(null);

  const [status, setStatus] = useState('connecting');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ FIX: prevent crash if roomId missing
    if (!roomId || !roomId.trim()) {
      setStatus('disconnected');
      setError('Invalid room ID');
      return;
    }

    const cleanRoomId = roomId.trim().toLowerCase();
    currentRoomRef.current = cleanRoomId;

    console.log(`[Client] Connecting to room: "${cleanRoomId}"`);
    console.log(`[Client] WebSocket URL: ${WS_BASE}`);

    const doc = new Y.Doc();
    ydocRef.current = doc;

    const yProjects = doc.getMap('projects');

    let provider;

    try {
      // ✅ FIX: safe WebSocket creation
      provider = new WebsocketProvider(WS_BASE, cleanRoomId, doc, {
        connect: true,
        resyncInterval: 3000,
      });

      providerRef.current = provider;

      provider.on('status', ({ status }) => {
        console.log(`[Client] WebSocket status: ${status}`);
        setStatus(status);
        if (status === 'connected') setError(null);
      });

      provider.on('connection-error', () => {
        console.error('[Client] WebSocket connection failed');
        setStatus('disconnected');
        setError('Cannot connect to server');
      });

      // ✅ Set user awareness
      provider.awareness.setLocalStateField('user', {
        name: userName,
        color: userColor,
        cursor: null,
        roomId: cleanRoomId,
      });

      // ✅ Track users
      const updateUsers = () => {
        const states = provider.awareness.getStates();
        const onlineUsers = [];

        states.forEach((state, clientId) => {
          if (state.user) {
            onlineUsers.push({
              clientId,
              name: state.user.name,
              color: state.user.color,
              cursor: state.user.cursor,
              isSelf: clientId === doc.clientID,
            });
          }
        });

        setUsers(onlineUsers);
      };

      provider.awareness.on('change', updateUsers);
      updateUsers();

      // ✅ Sync project data
      yProjects.observe(() => {
        if (isRemoteUpdate.current) return;

        const remote = yProjects.get('data');
        if (remote && setProjects) {
          isRemoteUpdate.current = true;

          try {
            const parsed = JSON.parse(remote);
            if (Array.isArray(parsed)) {
              setProjects(parsed);
            }
          } catch (e) {
            console.warn("Project sync error:", e);
          }

          setTimeout(() => {
            isRemoteUpdate.current = false;
          }, 100);
        }
      });

    } catch (err) {
      console.error('[Client] WebSocket setup error:', err);
      setStatus('disconnected');
      setError('WebSocket unavailable');
    }

    // ✅ CLEANUP (important)
    return () => {
      console.log(`[Client] Disconnecting room: "${cleanRoomId}"`);

      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      if (provider) {
        provider.awareness.destroy();
        provider.destroy();
      }

      doc.destroy();

      ydocRef.current = null;
      providerRef.current = null;
      setUsers([]);
    };
  }, [roomId]);

  const syncProjects = useCallback((projectsData) => {
    if (!ydocRef.current || isRemoteUpdate.current) return;

    try {
      ydocRef.current
        .getMap('projects')
        .set('data', JSON.stringify(projectsData));
    } catch (e) {
      console.warn("Sync error:", e);
    }
  }, []);

  const bindEditor = useCallback((editor, monaco) => {
    if (!ydocRef.current || !providerRef.current) return;

    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    const cleanRoomId = currentRoomRef.current || 'default';
    const fileKey = `${cleanRoomId}::${fileName}`;

    console.log(`[Client] Binding editor: ${fileKey}`);

    const yText = ydocRef.current.getText(fileKey);

    try {
      bindingRef.current = new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor]),
        providerRef.current.awareness
      );
    } catch (err) {
      console.warn('[CRDT] Monaco binding failed:', err.message);
    }
  }, [fileName]);

  const updateCursor = useCallback((position) => {
    if (!providerRef.current) return;

    const user = providerRef.current.awareness.getLocalState()?.user;
    if (user) {
      providerRef.current.awareness.setLocalStateField('user', {
        ...user,
        cursor: position,
      });
    }
  }, []);

  return {
    status,
    users,
    error,
    bindEditor,
    updateCursor,
    syncProjects,
    ydoc: ydocRef,
  };
}
