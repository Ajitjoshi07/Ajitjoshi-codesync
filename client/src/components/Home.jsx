import { useState, useEffect } from 'react';

const COLORS = ['#4f8ef7','#a78bfa','#34d399','#fbbf24','#f87171','#38bdf8','#fb923c'];

function genRoomId() {
  const words = ['alpha','bravo','delta','echo','foxtrot','gamma','nova','omega','pixel','quantum','relay','sigma','turbo','ultra','vortex'];
  const a = words[Math.floor(Math.random()*words.length)];
  const b = words[Math.floor(Math.random()*words.length)];
  const n = Math.floor(Math.random()*900)+100;
  return `${a}-${b}-${n}`;
}

// Store room passwords in localStorage (creator stores it, joiners verify)
function saveRoomPassword(roomId, password) {
  try {
    const rooms = JSON.parse(localStorage.getItem('cs_rooms') || '{}');
    rooms[roomId] = password;
    localStorage.setItem('cs_rooms', JSON.stringify(rooms));
  } catch(e) {}
}

function getRoomPassword(roomId) {
  try {
    const rooms = JSON.parse(localStorage.getItem('cs_rooms') || '{}');
    return rooms[roomId] || null;
  } catch(e) { return null; }
}

function saveRecentRoom(roomId, name) {
  try {
    const stored = JSON.parse(localStorage.getItem('cs_recent') || '[]');
    const updated = [{ roomId, name }, ...stored.filter(r => r.roomId !== roomId)].slice(0, 3);
    localStorage.setItem('cs_recent', JSON.stringify(updated));
  } catch(e) {}
}

export default function Home({ onJoin }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('create');
  const [recentRooms, setRecentRooms] = useState([]);

  // Create room state
  const [useCustomId, setUseCustomId] = useState(false);
  const [customRoomId, setCustomRoomId] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);

  // Join room state
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState('');

  // Recent room join
  const [recentJoinId, setRecentJoinId] = useState(null);
  const [recentPassword, setRecentPassword] = useState('');
  const [showRecentPasswordModal, setShowRecentPasswordModal] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cs_recent') || '[]');
      setRecentRooms(stored.slice(0, 3));
    } catch(e) {}
  }, []);

  async function createRoom() {
    if (!name.trim()) return setError('Enter your name');
    const roomId = useCustomId && customRoomId.trim()
      ? customRoomId.trim().toLowerCase().replace(/\s+/g, '-')
      : genRoomId();
    const password = usePassword && createPassword.trim() ? createPassword.trim() : '';

    setLoading(true);
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${name}'s Session`, createdBy: name, roomId, hasPassword: !!password })
      });
    } catch(e) {}
    setLoading(false);

    if (password) saveRoomPassword(roomId, password);
    saveRecentRoom(roomId, `${name}'s Room`);
    onJoin(roomId, name.trim(), color, password);
  }

  function joinRoom() {
    if (!name.trim()) return setError('Enter your name');
    if (!joinRoomId.trim()) return setError('Enter a room ID');

    const roomId = joinRoomId.trim().toLowerCase();
    const savedPassword = getRoomPassword(roomId);

    // If room has a password stored locally, verify it
    if (savedPassword) {
      if (!joinPassword.trim()) {
        setJoinError('This room is password protected. Enter the password.');
        return;
      }
      if (joinPassword.trim() !== savedPassword) {
        setJoinError('Wrong password. Access denied.');
        return;
      }
    }

    setJoinError('');
    saveRecentRoom(roomId, roomId);
    onJoin(roomId, name.trim(), color, joinPassword.trim());
  }

  function handleRecentRoomClick(room) {
    if (!name.trim()) { setError('Enter your name first'); return; }
    const savedPassword = getRoomPassword(room.roomId);
    if (savedPassword) {
      setRecentJoinId(room.roomId);
      setShowRecentPasswordModal(true);
    } else {
      saveRecentRoom(room.roomId, room.name);
      onJoin(room.roomId, name.trim(), color, '');
    }
  }

  function joinRecentWithPassword() {
    const savedPassword = getRoomPassword(recentJoinId);
    if (recentPassword.trim() !== savedPassword) {
      setJoinError('Wrong password');
      return;
    }
    setShowRecentPasswordModal(false);
    onJoin(recentJoinId, name.trim(), color, recentPassword.trim());
  }

  const inp = {
    background: '#1c2030', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px', padding: '8px 12px', fontSize: '13px',
    color: '#e2e8f0', outline: 'none', fontFamily: "'Syne',sans-serif",
    width: '100%', transition: 'border-color 0.2s'
  };

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#0a0c10', color: '#e2e8f0', fontFamily: "'Syne',sans-serif", overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(79,142,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.03) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '-200px', left: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(79,142,247,0.05)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '0 32px' }}>

        {/* NAV */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>Code<span style={{ color: '#4f8ef7' }}>Sync</span></div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {['Yjs CRDT', 'WebSocket', 'React', 'Node.js'].map(t => (
              <span key={t} style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7694', fontFamily: "'JetBrains Mono',monospace" }}>{t}</span>
            ))}
            <a href="https://www.linkedin.com/in/ajit-joshi-ai-engineer" target="_blank" rel="noreferrer"
              style={{ fontSize: '11px', color: '#4f8ef7', textDecoration: 'none', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(79,142,247,0.3)', marginLeft: '8px' }}>LinkedIn</a>
            <a href="https://github.com/Ajitjoshi07" target="_blank" rel="noreferrer"
              style={{ fontSize: '11px', color: '#a78bfa', textDecoration: 'none', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(167,139,250,0.3)' }}>GitHub</a>
          </div>
        </nav>

        {/* MAIN — 3 columns */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.1fr 0.9fr', gap: '20px', padding: '16px 0', minHeight: 0 }}>

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#151820', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: '20px', padding: '3px 10px', fontSize: '10px', color: '#4f8ef7', marginBottom: '10px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                Open Source · Built from scratch
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '700', lineHeight: '1.15', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                Code together,<br /><span style={{ color: '#4f8ef7' }}>in real time.</span>
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7694', lineHeight: '1.6', margin: '0 0 12px' }}>
                Real-time collaborative editor powered by Yjs CRDT — zero conflicts, any number of users.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[{ v: '< 50ms', l: 'Latency' }, { v: '40+', l: 'Languages' }, { v: '0%', l: 'Conflicts' }].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#e2e8f0' }}>{s.v}</div>
                    <div style={{ fontSize: '10px', color: '#6b7694' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', flex: 1 }}>
              {[
                { icon: '⚡', title: 'Real-time sync', color: '#4f8ef7' },
                { icon: '🔀', title: 'CRDT engine', color: '#a78bfa' },
                { icon: '📁', title: 'Multi-project', color: '#34d399' },
                { icon: '🌐', title: '40+ languages', color: '#fbbf24' },
                { icon: '🔒', title: 'Password rooms', color: '#f87171' },
                { icon: '↓', title: 'Export anywhere', color: '#38bdf8' },
              ].map(f => (
                <div key={f.title} style={{ background: '#151820', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{f.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#e2e8f0' }}>{f.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MIDDLE — Form */}
          <div style={{ background: '#151820', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'auto' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Start coding</h3>

            {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#f87171' }}>{error}</div>}

            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#6b7694', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Your Name</label>
              <input value={name} onChange={e => { setName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && (tab === 'create' ? createRoom() : joinRoom())}
                placeholder="e.g. Ajit" style={inp}
                onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Color */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#6b7694', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Cursor Color</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setColor(c)}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, cursor: 'pointer', border: color === c ? `2px solid ${c}` : '2px solid transparent', outline: color === c ? `2px solid #151820` : 'none', transition: 'all 0.15s' }} />
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: '#1c2030', borderRadius: '8px', padding: '3px' }}>
              {['create', 'join'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); setJoinError(''); }}
                  style={{ flex: 1, padding: '6px', fontSize: '12px', fontWeight: '600', border: 'none', borderRadius: '6px', cursor: 'pointer', background: tab === t ? '#4f8ef7' : 'transparent', color: tab === t ? '#fff' : '#6b7694', transition: 'all 0.15s', fontFamily: "'Syne',sans-serif" }}>
                  {t === 'create' ? '+ Create' : '→ Join'}
                </button>
              ))}
            </div>

            {/* CREATE */}
            {tab === 'create' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Custom ID toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div onClick={() => setUseCustomId(v => !v)}
                    style={{ width: '32px', height: '18px', borderRadius: '9px', background: useCustomId ? '#4f8ef7' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: useCustomId ? '17px' : '3px', transition: 'left 0.2s' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#6b7694' }}>Custom room ID</span>
                </div>

                {useCustomId && (
                  <input value={customRoomId} onChange={e => setCustomRoomId(e.target.value)}
                    placeholder="e.g. team-alpha-2024"
                    style={{ ...inp, fontFamily: "'JetBrains Mono',monospace" }}
                    onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                )}

                {/* Password toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div onClick={() => setUsePassword(v => !v)}
                    style={{ width: '32px', height: '18px', borderRadius: '9px', background: usePassword ? '#f87171' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: usePassword ? '17px' : '3px', transition: 'left 0.2s' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#6b7694' }}>🔒 Password protect room</span>
                </div>

                {usePassword && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input value={createPassword} onChange={e => setCreatePassword(e.target.value)}
                      type="password" placeholder="Set room password..."
                      style={inp}
                      onFocus={e => e.target.style.borderColor = '#f87171'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    <span style={{ fontSize: '10px', color: '#3d4460' }}>Share this password with teammates who want to join</span>
                  </div>
                )}

                <button onClick={createRoom} disabled={loading}
                  style={{ background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.7 : 1, fontFamily: "'Syne',sans-serif" }}>
                  {loading ? 'Creating...' : '+ Create Room'}
                </button>
              </div>
            )}

            {/* JOIN */}
            {tab === 'join' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {joinError && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#f87171' }}>{joinError}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#6b7694', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Room ID</label>
                  <input value={joinRoomId} onChange={e => { setJoinRoomId(e.target.value); setJoinError(''); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && joinRoom()}
                    placeholder="e.g. team-alpha-2024"
                    style={{ ...inp, fontFamily: "'JetBrains Mono',monospace" }}
                    onFocus={e => e.target.style.borderColor = '#a78bfa'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#6b7694', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' }}>Room Password (if required)</label>
                  <input value={joinPassword} onChange={e => { setJoinPassword(e.target.value); setJoinError(''); }}
                    type="password" placeholder="Enter password if room is protected..."
                    style={inp}
                    onFocus={e => e.target.style.borderColor = '#a78bfa'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                <button onClick={joinRoom}
                  style={{ background: '#1c2030', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.color = '#a78bfa'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
                >
                  → Join Room
                </button>
              </div>
            )}

            {/* Recent rooms */}
            {recentRooms.length > 0 && (
              <div>
                <div style={{ fontSize: '10px', color: '#6b7694', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>Recent Rooms</div>
                {recentRooms.map(r => (
                  <div key={r.roomId} onClick={() => handleRecentRoomClick(r)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', marginBottom: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,142,247,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono',monospace", color: '#e2e8f0', flex: 1 }}>{r.roomId}</span>
                    {getRoomPassword(r.roomId) && <span style={{ fontSize: '10px' }}>🔒</span>}
                    <span style={{ fontSize: '11px', color: '#4f8ef7' }}>→</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent room password modal */}
            {showRecentPasswordModal && (
              <div style={{ background: '#1c2030', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', color: '#f87171', fontWeight: '600' }}>🔒 Password required for {recentJoinId}</div>
                {joinError && <div style={{ fontSize: '11px', color: '#f87171' }}>{joinError}</div>}
                <input value={recentPassword} onChange={e => { setRecentPassword(e.target.value); setJoinError(''); }}
                  type="password" placeholder="Enter room password..."
                  style={inp}
                  onFocus={e => e.target.style.borderColor = '#f87171'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={joinRecentWithPassword}
                    style={{ flex: 1, background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
                    Enter Room
                  </button>
                  <button onClick={() => { setShowRecentPasswordModal(false); setRecentPassword(''); setJoinError(''); }}
                    style={{ background: 'transparent', color: '#6b7694', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: "'Syne',sans-serif" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Profile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #151820, #1c2030)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '10px', color: '#6b7694', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700', marginBottom: '12px' }}>Built by</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>AJ</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>Ajit Mukund Joshi</div>
                  <div style={{ fontSize: '11px', color: '#4f8ef7', marginTop: '1px' }}>AI Engineer & Full-Stack Dev</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#6b7694', lineHeight: '1.5', marginBottom: '12px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                Final year B.Tech · AI & Data Science<br />MIT Chhatrapati Sambhajinagar
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <a href="https://www.linkedin.com/in/ajit-joshi-ai-engineer" target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: '6px', textDecoration: 'none', color: '#4f8ef7', fontSize: '11px', fontWeight: '600' }}>
                  <span style={{ fontWeight: '900', fontSize: '13px' }}>in</span> LinkedIn Profile →
                </a>
                <a href="https://github.com/Ajitjoshi07" target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '6px', textDecoration: 'none', color: '#a78bfa', fontSize: '11px', fontWeight: '600' }}>
                  <span style={{ fontSize: '13px' }}>⌥</span> GitHub Profile →
                </a>
                <a href="https://github.com/Ajitjoshi07/Ajitjoshi-codesync" target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '6px', textDecoration: 'none', color: '#34d399', fontSize: '11px', fontWeight: '600' }}>
                  <span style={{ fontSize: '13px' }}>↗</span> View Source Code
                </a>
              </div>
            </div>

            <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '700', marginBottom: '4px' }}>🔒 Secure Rooms</div>
              <div style={{ fontSize: '11px', color: '#6b7694', lineHeight: '1.5' }}>
                Password protect your room.<br />Only invited teammates can join.
              </div>
            </div>

            <div style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#4f8ef7', fontWeight: '700', marginBottom: '4px' }}>Open Source</div>
              <div style={{ fontSize: '11px', color: '#6b7694', lineHeight: '1.5' }}>
                Built with Yjs CRDT, WebSocket,<br />React, Node.js & MongoDB
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: '700' }}>Code<span style={{ color: '#4f8ef7' }}>Sync</span></span>
          <span style={{ fontSize: '10px', color: '#3d4460' }}>Built by Ajit Mukund Joshi · MIT © 2025</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[['LinkedIn', 'https://www.linkedin.com/in/ajit-joshi-ai-engineer', '#4f8ef7'], ['GitHub', 'https://github.com/Ajitjoshi07', '#a78bfa'], ['Source', 'https://github.com/Ajitjoshi07/Ajitjoshi-codesync', '#34d399']].map(([l, h, c]) => (
              <a key={l} href={h} target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: '#3d4460', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = c}
                onMouseLeave={e => e.target.style.color = '#3d4460'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
