import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

const WS_URL = process.env.REACT_APP_WS_URL || `ws://${window.location.hostname}:1234`;

export function useCollabEditor({ roomId, userName, userColor, fileName }) {
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const monacoRef = useRef(null);

  const [status, setStatus] = useState('connecting');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Initialize Yjs doc + WebSocket provider
  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const wsUrl = `${WS_URL}?room=${roomId}&name=${encodeURIComponent(userName)}&color=${encodeURIComponent(userColor)}`;

    let provider;
    try {
      provider = new WebsocketProvider(WS_URL, roomId, ydoc, {
        connect: true,
        params: { name: userName, color: userColor }
      });
      providerRef.current = provider;

      provider.on('status', ({ status }) => {
        setStatus(status);
        setError(null);
      });

      provider.on('connection-error', () => {
        setStatus('disconnected');
        setError('Cannot connect to server. Running in offline mode.');
      });

      // Set local user awareness
      provider.awareness.setLocalStateField('user', {
        name: userName,
        color: userColor,
        cursor: null
      });

      // Track online users
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
              isSelf: clientId === ydoc.clientID
            });
          }
        });
        setUsers(onlineUsers);
      };

      provider.awareness.on('change', updateUsers);
      updateUsers();

    } catch (err) {
      setStatus('disconnected');
      setError('WebSocket unavailable. Changes are local only.');
    }

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
      if (provider) {
        provider.awareness.destroy();
        provider.destroy();
      }
      ydoc.destroy();
    };
  }, [roomId, userName, userColor]);

  // Bind Monaco editor to Yjs
  const bindEditor = useCallback((editor, monaco) => {
    monacoRef.current = { editor, monaco };
    if (!ydocRef.current || !providerRef.current) return;

    if (bindingRef.current) {
      bindingRef.current.destroy();
    }

    const yText = ydocRef.current.getText(fileName);

    try {
      const binding = new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor]),
        providerRef.current.awareness
      );
      bindingRef.current = binding;
    } catch (err) {
      console.warn('[CRDT] Monaco binding failed:', err.message);
    }
  }, [fileName]);

  // Update cursor position in awareness
  const updateCursor = useCallback((position) => {
    if (!providerRef.current) return;
    const user = providerRef.current.awareness.getLocalState()?.user;
    if (user) {
      providerRef.current.awareness.setLocalStateField('user', {
        ...user,
        cursor: position
      });
    }
  }, []);

  return { status, users, error, bindEditor, updateCursor };
}
