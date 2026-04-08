import { useState, useEffect } from 'react';
import Home from './components/Home';
import Editor from './components/Editor';

// Wake up the server on app load
async function wakeServer() {
  const wsUrl = process.env.REACT_APP_WS_URL || '';
  if (!wsUrl) return;
  // Convert wss://server to https://server for health check
  const httpUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://').replace(':1234', '');
  try {
    await fetch(`${httpUrl}/health`, { mode: 'no-cors' });
  } catch(e) {}
}

export default function App() {
  const [session, setSession] = useState(null);
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    // Pre-warm server so it's ready when user joins
    const isProduction = process.env.REACT_APP_WS_URL?.includes('onrender.com');
    if (isProduction) {
      setWaking(true);
      wakeServer().finally(() => setWaking(false));
    }
  }, []);

  if (session) {
    return (
      <Editor
        roomId={session.roomId}
        userName={session.userName}
        userColor={session.userColor}
        password={session.password}
        onLeave={() => {
          setSession(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  return (
    <Home
      serverWaking={waking}
      onJoin={(roomId, userName, userColor, password) => {
        if (!roomId || !userName) return;
        const cleanRoomId = roomId.trim().toLowerCase();
        window.history.replaceState({}, '', `?room=${encodeURIComponent(cleanRoomId)}`);
        setSession({ roomId: cleanRoomId, userName: userName.trim(), userColor, password });
      }}
    />
  );
}
