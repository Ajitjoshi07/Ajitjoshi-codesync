import { useState } from 'react';
import styled from './Home.module.css';

const COLORS = ['#4f8ef7','#a78bfa','#34d399','#fbbf24','#f87171','#38bdf8','#fb923c'];

export default function Home({ onJoin }) {
  const [name, setName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createRoom() {
    if (!name.trim()) return setError('Enter your name first');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${name}'s Session`, createdBy: name })
      });
      const data = await res.json();
      onJoin(data.roomId, name.trim(), color);
    } catch (err) {
      // If server not running, generate local roomId
      const roomId = Math.random().toString(36).slice(2, 10);
      onJoin(roomId, name.trim(), color);
    }
    setLoading(false);
  }

  function joinRoom() {
    if (!name.trim()) return setError('Enter your name first');
    if (!roomInput.trim()) return setError('Enter a room ID');
    onJoin(roomInput.trim(), name.trim(), color);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:'24px', gap:'0' }}>

      {/* Logo */}
      <div style={{ marginBottom:'48px', textAlign:'center' }}>
        <div style={{ fontSize:'38px', fontWeight:'700', letterSpacing:'-0.02em', color:'var(--text)', fontFamily:'var(--font-ui)' }}>
          Code<span style={{ color:'var(--accent)' }}>Sync</span>
        </div>
        <div style={{ color:'var(--text-muted)', fontSize:'14px', marginTop:'8px', letterSpacing:'0.04em' }}>
          Real-time collaborative code editor
        </div>

        {/* Tech badges */}
        <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginTop:'16px', flexWrap:'wrap' }}>
          {['Yjs CRDT','WebSocket','React','Node.js','MongoDB'].map(t => (
            <span key={t} style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', border:'1px solid var(--border)', color:'var(--text-muted)', fontFamily:'var(--font-code)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'32px', width:'100%', maxWidth:'420px', display:'flex', flexDirection:'column', gap:'20px' }}>

        {error && (
          <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'6px', padding:'10px 14px', fontSize:'13px', color:'var(--red)' }}>
            {error}
          </div>
        )}

        {/* Name input */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <label style={{ fontSize:'12px', color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:'600' }}>Your Name</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && createRoom()}
            placeholder="e.g. Ajit"
            style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'10px 14px', fontSize:'14px', color:'var(--text)', outline:'none', fontFamily:'var(--font-ui)', transition:'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor='var(--accent)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
        </div>

        {/* Color picker */}
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <label style={{ fontSize:'12px', color:'var(--text-muted)', letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:'600' }}>Cursor Color</label>
          <div style={{ display:'flex', gap:'8px' }}>
            {COLORS.map(c => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{ width:'28px', height:'28px', borderRadius:'50%', background:c, cursor:'pointer', border: color===c ? `3px solid ${c}` : '3px solid transparent', outline: color===c ? `2px solid var(--surface2)` : 'none', transition:'all 0.15s' }}
              />
            ))}
          </div>
        </div>

        {/* Create room */}
        <button
          onClick={createRoom}
          disabled={loading}
          style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'14px', fontWeight:'700', letterSpacing:'0.04em', transition:'opacity 0.15s', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Creating...' : '+ Create New Room'}
        </button>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ flex:1, height:'1px', background:'var(--border)' }}/>
          <span style={{ fontSize:'12px', color:'var(--text-faint)' }}>or join existing</span>
          <div style={{ flex:1, height:'1px', background:'var(--border)' }}/>
        </div>

        {/* Join existing */}
        <div style={{ display:'flex', gap:'8px' }}>
          <input
            value={roomInput}
            onChange={e => { setRoomInput(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && joinRoom()}
            placeholder="Enter room ID..."
            style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'10px 14px', fontSize:'14px', color:'var(--text)', outline:'none', fontFamily:'var(--font-code)', transition:'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor='var(--purple)'}
            onBlur={e => e.target.style.borderColor='var(--border)'}
          />
          <button
            onClick={joinRoom}
            style={{ background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:'6px', padding:'10px 16px', fontSize:'14px', fontWeight:'600', transition:'all 0.15s' }}
            onMouseEnter={e => e.target.style.borderColor='var(--purple)'}
            onMouseLeave={e => e.target.style.borderColor='var(--border)'}
          >
            Join
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop:'32px', textAlign:'center', fontSize:'12px', color:'var(--text-faint)' }}>
        Built by Ajit Joshi &nbsp;·&nbsp;
        <a href="https://github.com/ajitjoshi810/codesync" target="_blank" rel="noreferrer" style={{ color:'var(--text-muted)', textDecoration:'none' }}>GitHub</a>
      </div>
    </div>
  );
}
