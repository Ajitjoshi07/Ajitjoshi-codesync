import { useState } from 'react';
import Home from './components/Home';
import Editor from './components/Editor';

export default function App() {
  const [session, setSession] = useState(null);

  if (session) {
    return (
      <Editor
        roomId={session.roomId}
        userName={session.userName}
        userColor={session.userColor}
        password={session.password}
        onLeave={() => {
          setSession(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  return (
    <Home
      onJoin={(roomId, userName, userColor, password) => {
        setSession({ roomId, userName, userColor, password });
        window.history.pushState({}, '', `?room=${roomId}`);
      }}
    />
  );
}
