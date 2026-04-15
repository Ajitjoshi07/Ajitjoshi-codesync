import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

// Base WebSocket URL
const WS_BASE = process.env.REACT_APP_WS_URL || `ws://${window.location.hostname}:1234`;

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
    if (!roomId || !roomId.trim()) {
      setStatus('disconnected');
      setError('No room ID');
      return;
    }

    const cleanRoomId = roomId.trim().toLowerCase();
    currentRoomRef.current = cleanRoomId;

    console.log(`[Client] Connecting to room: "${cleanRoomId}"`);
    console.log(`[Client] WebSocket URL will be: ${WS_BASE}/${cleanRoomId}`);

    const doc = new Y.Doc();
    ydocRef.current = doc;

    const yProjects = doc.getMap('projects');

    let provider;
    try {
      provider = new WebsocketProvider(WS_BASE, cleanRoomId, doc, {
        connect: true,
        resyncInterval: 3000,
      });
      providerRef.current = provider;

      provider.on('status', ({ status }) => {
        console.log(`[Client] Room "${cleanRoomId}" WebSocket status: ${status}`);
        setStatus(status);
        if (status === 'connected') setError(null);
      });

      provider.on('connection-error', () => {
        console.error(`[Client] Connection error for room "${cleanRoomId}"`);
        setStatus('disconnected');
        setError('Cannot connect to server. Running in offline mode.');
      });

      // Set local user
      provider.awareness.setLocalStateField('user', {
        name: userName,
        color: userColor,
        cursor: null,
        roomId: cleanRoomId,
      });

      // Track users
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

      // Sync project structure
      yProjects.observe(() => {
        if (isRemoteUpdate.current) return;

        const remote = yProjects.get('data');
        if (remote && setProjects) {
          isRemoteUpdate.current = true;
          try {
            const parsed = JSON.parse(remote);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setProjects(parsed);
            }
          } catch (e) {}

          setTimeout(() => {
            isRemoteUpdate.current = false;
          }, 100);
        }
      });

    } catch (err) {
      console.error('[Client] WebSocket setup error:', err);
      setStatus('disconnected');
      setError('WebSocket unavailable. Changes are local only.');
    }

    // Cleanup
    return () => {
      console.log(`[Client] Disconnecting from room: "${cleanRoomId}"`);

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
    } catch (e) {}
  }, []);

  const bindEditor = useCallback((editor, monaco) => {
    if (!ydocRef.current || !providerRef.current) return;

    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    const cleanRoomId = currentRoomRef.current || 'default';
    const fileKey = `${cleanRoomId}::${fileName}`;

    console.log(`[Client] Binding editor to key: "${fileKey}"`);

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

  // ✅ IMPORTANT: return ref, not raw object
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
