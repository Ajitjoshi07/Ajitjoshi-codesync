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
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  return (
    <Home
      onJoin={(roomId, userName, userColor, password) => {
        if (!roomId || !userName) return;
        const cleanRoomId = roomId.trim().toLowerCase();
        window.history.replaceState({}, '', '?room=' + encodeURIComponent(cleanRoomId));
        setSession({
          roomId: cleanRoomId,
          userName: userName.trim(),
          userColor: userColor,
          password: password,
        });
      }}
    />
  );
}
