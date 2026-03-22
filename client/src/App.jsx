import { useState } from 'react';
import Home from './components/Home';
import Editor from './components/Editor';

export default function App() {
  const [session, setSession] = useState(null);

  // Check URL for existing room
  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get('room');
  const urlName = params.get('name') || 'Anonymous';

  if (urlRoom && !session) {
    setSession({ roomId: urlRoom, userName: urlName });
  }

  if (session) {
    return (
      <Editor
        roomId={session.roomId}
        userName={session.userName}
        userColor={session.userColor}
        onLeave={() => {
          setSession(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <Home
      onJoin={(roomId, userName, userColor) => {
        setSession({ roomId, userName, userColor });
        window.history.pushState({}, '', `?room=${roomId}&name=${encodeURIComponent(userName)}`);
      }}
    />
  );
}
