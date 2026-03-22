import { useState, useEffect } from 'react';

const COLORS = ['#4f8ef7','#a78bfa','#34d399','#fbbf24','#f87171','#38bdf8','#fb923c'];

function genRoomId() {
  const words = ['alpha','bravo','delta','echo','foxtrot','gamma','nova','omega','pixel','quantum','relay','sigma','turbo','ultra','vortex'];
  const a = words[Math.floor(Math.random()*words.length)];
  const b = words[Math.floor(Math.random()*words.length)];
  const n = Math.floor(Math.random()*900)+100;
  return `${a}-${b}-${n}`;
}

export default function Home({ onJoin }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [customRoomId, setCustomRoomId] = useState('');
  const [useCustomId, setUseCustomId] = useState(false);
  const [tab, setTab] = useState('create');
  const [recentRooms, setRecentRooms] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('codesync_recent') || '[]');
      setRecentRooms(stored.slice(0, 2));
    } catch(e) {}
  }, []);

  function saveRecentRoom(roomId) {
    try {
      const stored = JSON.parse(localStorage.getItem('codesync_recent') || '[]');
      const updated = [roomId, ...stored.filter(r => r !== roomId)].slice(0, 3);
      localStorage.setItem('codesync_recent', JSON.stringify(updated));
    } catch(e) {}
  }

  async function createRoom() {
    if (!name.trim()) return setError('Enter your name');
    const roomId = useCustomId && customRoomId.trim()
      ? customRoomId.trim().toLowerCase().replace(/\s+/g,'-')
      : genRoomId();
    setLoading(true);
    try { await fetch('/api/sessions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: `${name}'s Session`, createdBy: name, roomId }) }); } catch(e) {}
    setLoading(false);
    saveRecentRoom(roomId);
    onJoin(roomId, name.trim(), color);
  }

  function joinRoom(id) {
    const roomId = id || joinRoomId;
    if (!name.trim()) return setError('Enter your name');
    if (!roomId.trim()) return setError('Enter a room ID');
    saveRecentRoom(roomId.trim().toLowerCase());
    onJoin(roomId.trim().toLowerCase(), name.trim(), color);
  }

  const inp = {
    background:'#1c2030', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'6px',
    padding:'8px 12px', fontSize:'13px', color:'#e2e8f0', outline:'none',
    fontFamily:"'Syne',sans-serif", width:'100%', transition:'border-color 0.2s'
  };

  return (
    <div style={{ height:'100vh', width:'100vw', background:'#0a0c10', color:'#e2e8f0', fontFamily:"'Syne',sans-serif", overflow:'hidden', display:'flex', flexDirection:'column' }}>

      {/* Background grid */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(79,142,247,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.03) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', top:'-200px', left:'-200px', width:'500px', height:'500px', borderRadius:'50%', background:'rgba(79,142,247,0.05)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-200px', right:'-200px', width:'500px', height:'500px', borderRadius:'50%', background:'rgba(167,139,250,0.04)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', height:'100%', padding:'0 32px' }}>

        {/* NAV */}
        <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:'48px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
          <div style={{ fontSize:'16px', fontWeight:'700' }}>Code<span style={{ color:'#4f8ef7' }}>Sync</span></div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {['Yjs CRDT','WebSocket','React','Node.js'].map(t => (
              <span key={t} style={{ fontSize:'10px', padding:'3px 8px', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.08)', color:'#6b7694', fontFamily:"'JetBrains Mono',monospace" }}>{t}</span>
            ))}
            <a href="https://www.linkedin.com/in/ajit-joshi-ai-engineer" target="_blank" rel="noreferrer"
              style={{ fontSize:'11px', color:'#4f8ef7', textDecoration:'none', padding:'4px 10px', borderRadius:'6px', border:'1px solid rgba(79,142,247,0.3)', marginLeft:'8px' }}>LinkedIn</a>
            <a href="https://github.com/Ajitjoshi07" target="_blank" rel="noreferrer"
              style={{ fontSize:'11px', color:'#a78bfa', textDecoration:'none', padding:'4px 10px', borderRadius:'6px', border:'1px solid rgba(167,139,250,0.3)' }}>GitHub</a>
          </div>
        </nav>

        {/* MAIN CONTENT — 3 columns */}
        <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1.1fr 0.9fr', gap:'20px', padding:'16px 0', minHeight:0 }}>

          {/* LEFT — Info + features */}
          <div style={{ display:'flex', flexDirection:'column', gap:'12px', overflow:'hidden' }}>

            {/* Hero text */}
            <div style={{ background:'#151820', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(79,142,247,0.1)', border:'1px solid rgba(79,142,247,0.2)', borderRadius:'20px', padding:'3px 10px', fontSize:'10px', color:'#4f8ef7', marginBottom:'10px' }}>
                <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#34d399', display:'inline-block' }} />
                Open Source · Built from scratch
              </div>
              <h1 style={{ fontSize:'26px', fontWeight:'700', lineHeight:'1.15', letterSpacing:'-0.02em', margin:'0 0 8px' }}>
                Code together,<br/><span style={{ color:'#4f8ef7' }}>in real time.</span>
              </h1>
              <p style={{ fontSize:'12px', color:'#6b7694', lineHeight:'1.6', margin:'0 0 12px' }}>
                Real-time collaborative editor powered by Yjs CRDT — zero conflicts, any number of users.
              </p>
              {/* Stats */}
              <div style={{ display:'flex', gap:'16px' }}>
                {[{v:'< 50ms',l:'Latency'},{v:'40+',l:'Languages'},{v:'0%',l:'Conflicts'}].map(s => (
                  <div key={s.l}>
                    <div style={{ fontSize:'16px', fontWeight:'700', color:'#e2e8f0' }}>{s.v}</div>
                    <div style={{ fontSize:'10px', color:'#6b7694' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', flex:1 }}>
              {[
                { icon:'⚡', title:'Real-time sync', color:'#4f8ef7' },
                { icon:'🔀', title:'CRDT engine', color:'#a78bfa' },
                { icon:'📁', title:'Multi-project', color:'#34d399' },
                { icon:'🌐', title:'40+ languages', color:'#fbbf24' },
                { icon:'👥', title:'Live presence', color:'#f87171' },
                { icon:'↓', title:'Export anywhere', color:'#38bdf8' },
              ].map(f => (
                <div key={f.title}
                  style={{ background:'#151820', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <span style={{ fontSize:'16px' }}>{f.icon}</span>
                  <span style={{ fontSize:'11px', fontWeight:'600', color:'#e2e8f0' }}>{f.title}</span>
                </div>
              ))}
            </div>

          </div>

          {/* MIDDLE — Form */}
          <div style={{ background:'#151820', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'20px', display:'flex', flexDirection:'column', gap:'12px', overflow:'hidden' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'700', margin:0 }}>Start coding</h3>

            {error && (
              <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'6px', padding:'8px 12px', fontSize:'12px', color:'#f87171' }}>
                {error}
              </div>
            )}

            {/* Name */}
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              <label style={{ fontSize:'10px', color:'#6b7694', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700' }}>Your Name</label>
              <input value={name} onChange={e => { setName(e.target.value); setError(''); }}
                onKeyDown={e => e.key==='Enter' && (tab==='create' ? createRoom() : joinRoom())}
                placeholder="e.g. Ajit" style={inp}
                onFocus={e => e.target.style.borderColor='#4f8ef7'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
              />
            </div>

            {/* Color */}
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              <label style={{ fontSize:'10px', color:'#6b7694', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700' }}>Cursor Color</label>
              <div style={{ display:'flex', gap:'6px' }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setColor(c)}
                    style={{ width:'24px', height:'24px', borderRadius:'50%', background:c, cursor:'pointer', border: color===c ? `2px solid ${c}` : '2px solid transparent', outline: color===c ? `2px solid #151820` : 'none', transition:'all 0.15s' }} />
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', background:'#1c2030', borderRadius:'8px', padding:'3px' }}>
              {['create','join'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); }}
                  style={{ flex:1, padding:'6px', fontSize:'12px', fontWeight:'600', border:'none', borderRadius:'6px', cursor:'pointer', background: tab===t ? '#4f8ef7' : 'transparent', color: tab===t ? '#fff' : '#6b7694', transition:'all 0.15s', fontFamily:"'Syne',sans-serif" }}>
                  {t==='create' ? '+ Create' : '→ Join'}
                </button>
              ))}
            </div>

            {/* Create */}
            {tab==='create' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div onClick={() => setUseCustomId(v => !v)}
                    style={{ width:'32px', height:'18px', borderRadius:'9px', background: useCustomId ? '#4f8ef7' : 'rgba(255,255,255,0.1)', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                    <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#fff', position:'absolute', top:'3px', left: useCustomId ? '17px' : '3px', transition:'left 0.2s' }} />
                  </div>
                  <span style={{ fontSize:'11px', color:'#6b7694' }}>Custom room ID</span>
                </div>
                {useCustomId && (
                  <input value={customRoomId} onChange={e => setCustomRoomId(e.target.value)}
                    placeholder="e.g. team-alpha-2024"
                    style={{ ...inp, fontFamily:"'JetBrains Mono',monospace" }}
                    onFocus={e => e.target.style.borderColor='#4f8ef7'}
                    onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
                  />
                )}
                <button onClick={createRoom} disabled={loading}
                  style={{ background:'#4f8ef7', color:'#fff', border:'none', borderRadius:'8px', padding:'10px', fontSize:'13px', fontWeight:'700', cursor:'pointer', opacity: loading ? 0.7 : 1, fontFamily:"'Syne',sans-serif" }}>
                  {loading ? 'Creating...' : '+ Create New Room'}
                </button>
              </div>
            )}

            {/* Join */}
            {tab==='join' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                <input value={joinRoomId} onChange={e => { setJoinRoomId(e.target.value); setError(''); }}
                  onKeyDown={e => e.key==='Enter' && joinRoom()}
                  placeholder="Enter room ID..."
                  style={{ ...inp, fontFamily:"'JetBrains Mono',monospace" }}
                  onFocus={e => e.target.style.borderColor='#a78bfa'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.08)'}
                />
                <button onClick={() => joinRoom()}
                  style={{ background:'#1c2030', color:'#e2e8f0', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:"'Syne',sans-serif" }}>
                  → Join Room
                </button>
              </div>
            )}

            {/* Recent rooms */}
            {recentRooms.length > 0 && (
              <div>
                <div style={{ fontSize:'10px', color:'#6b7694', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'6px' }}>Recent</div>
                {recentRooms.map(r => (
                  <div key={r} onClick={() => { if(name.trim()) joinRoom(r); else setError('Enter your name first'); }}
                    style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 8px', borderRadius:'6px', cursor:'pointer', marginBottom:'4px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='rgba(79,142,247,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'}
                  >
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#34d399', display:'inline-block', flexShrink:0 }} />
                    <span style={{ fontSize:'11px', fontFamily:"'JetBrains Mono',monospace", color:'#e2e8f0', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r}</span>
                    <span style={{ fontSize:'11px', color:'#4f8ef7' }}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Profile + code preview */}
          <div style={{ display:'flex', flexDirection:'column', gap:'12px', overflow:'hidden' }}>

            {/* Profile card */}
            <div style={{ background:'linear-gradient(135deg, #151820, #1c2030)', border:'1px solid rgba(79,142,247,0.2)', borderRadius:'12px', padding:'16px' }}>
              <div style={{ fontSize:'10px', color:'#6b7694', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:'700', marginBottom:'12px' }}>Built by</div>

              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'linear-gradient(135deg, #4f8ef7, #a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', color:'#fff', flexShrink:0 }}>AJ</div>
                <div>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#e2e8f0' }}>Ajit Mukund Joshi</div>
                  <div style={{ fontSize:'11px', color:'#4f8ef7', marginTop:'1px' }}>AI Engineer & Full-Stack Dev</div>
                </div>
              </div>

              <div style={{ fontSize:'11px', color:'#6b7694', lineHeight:'1.5', marginBottom:'12px', padding:'8px', background:'rgba(255,255,255,0.03)', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.05)' }}>
                Final year B.Tech · AI & Data Science<br/>MIT Chhatrapati Sambhajinagar
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <a href="https://www.linkedin.com/in/ajit-joshi-ai-engineer" target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', background:'rgba(79,142,247,0.08)', border:'1px solid rgba(79,142,247,0.2)', borderRadius:'6px', textDecoration:'none', color:'#4f8ef7', fontSize:'11px', fontWeight:'600' }}>
                  <span style={{ fontWeight:'900', fontSize:'13px' }}>in</span> LinkedIn Profile →
                </a>
                <a href="https://github.com/Ajitjoshi07" target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', background:'rgba(167,139,250,0.08)', border:'1px solid rgba(167,139,250,0.2)', borderRadius:'6px', textDecoration:'none', color:'#a78bfa', fontSize:'11px', fontWeight:'600' }}>
                  <span style={{ fontSize:'13px' }}>⌥</span> GitHub Profile →
                </a>
                <a href="https://github.com/Ajitjoshi07/Ajitjoshi-codesync" target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.15)', borderRadius:'6px', textDecoration:'none', color:'#34d399', fontSize:'11px', fontWeight:'600' }}>
                  <span style={{ fontSize:'13px' }}>↗</span> View Source Code
                </a>
              </div>
            </div>

            {/* Mini code preview */}
            <div style={{ background:'#151820', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', overflow:'hidden', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'5px', padding:'8px 12px', background:'#1c2030', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#f87171' }} />
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#fbbf24' }} />
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#34d399' }} />
                <span style={{ marginLeft:'6px', fontSize:'10px', color:'#6b7694', fontFamily:"'JetBrains Mono',monospace" }}>wsHandler.js</span>
                <div style={{ marginLeft:'auto', display:'flex', gap:'4px' }}>
                  {['AJ','PS','RM'].map((u,i) => (
                    <div key={u} style={{ width:'16px', height:'16px', borderRadius:'50%', background:['#4f8ef7','#a78bfa','#34d399'][i], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'7px', fontWeight:'700', color: i===2 ? '#0d1117' : '#fff' }}>{u}</div>
                  ))}
                </div>
              </div>
              <div style={{ padding:'10px 12px', fontFamily:"'JetBrains Mono',monospace", fontSize:'10px', lineHeight:'1.7' }}>
                {[
                  ['#5c6370', '// Yjs CRDT sync engine'],
                  ['#c678dd', 'const doc = '],['#61afef', 'new Y.Doc()'],['#abb2bf', ';'],
                  ['#c678dd', 'const provider = '],['#61afef', 'new WebsocketProvider'],
                  ['#abb2bf', '  (WS_URL, roomId, doc)'],
                  ['#98c379', 'provider'],['#abb2bf', '.on('],['#98c379', '"status"'],['#abb2bf', ', fn)'],
                  ['#5c6370', '// awareness sync'],
                  ['#61afef', 'awareness'],['#abb2bf', '.setLocalState({ user })'],
                ].map((line, i) => (
                  <div key={i} style={{ display:'flex', gap:'10px' }}>
                    <span style={{ color:'#3d4460', minWidth:'14px', textAlign:'right', userSelect:'none', fontSize:'9px' }}>{i+1}</span>
                    <span style={{ color: line[0] }}>{line.slice(1).join('')}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding:'6px 12px', background:'#1c2030', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'6px', fontSize:'10px', color:'#34d399' }}>
                <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#34d399', display:'inline-block' }} />
                3 users · synced · CRDT active
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', height:'32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <span style={{ fontSize:'11px', fontWeight:'700' }}>Code<span style={{ color:'#4f8ef7' }}>Sync</span></span>
          <span style={{ fontSize:'10px', color:'#3d4460' }}>Built by Ajit Mukund Joshi · MIT © 2025</span>
          <div style={{ display:'flex', gap:'12px' }}>
            {[['LinkedIn','https://www.linkedin.com/in/ajit-joshi-ai-engineer','#4f8ef7'],['GitHub','https://github.com/Ajitjoshi07','#a78bfa'],['Source','https://github.com/Ajitjoshi07/Ajitjoshi-codesync','#34d399']].map(([l,h,c]) => (
              <a key={l} href={h} target="_blank" rel="noreferrer" style={{ fontSize:'10px', color:'#3d4460', textDecoration:'none' }}
                onMouseEnter={e => e.target.style.color=c}
                onMouseLeave={e => e.target.style.color='#3d4460'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
