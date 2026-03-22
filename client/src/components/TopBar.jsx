import { useState } from 'react';

export default function TopBar({ roomId, userName, userColor, users, status, onCopyLink, onLeave }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const statusColor = status === 'connected' ? 'var(--green)' : status === 'connecting' ? 'var(--yellow)' : 'var(--red)';

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'0 16px', height:'44px', background:'var(--surface)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>

      {/* Logo */}
      <div style={{ fontSize:'14px', fontWeight:'700', letterSpacing:'0.06em', color:'var(--accent)', textTransform:'uppercase', flexShrink:0 }}>
        Code<span style={{ color:'var(--text)' }}>Sync</span>
      </div>

      {/* Room pill */}
      <div
        onClick={handleCopy}
        title="Click to copy invite link"
        style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'20px', padding:'3px 10px 3px 8px', fontSize:'11px', color:'var(--text-muted)', cursor:'pointer', fontFamily:'var(--font-code)', transition:'border-color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
      >
        <span style={{ width:'7px', height:'7px', borderRadius:'50%', background: statusColor, display:'inline-block', flexShrink:0 }} />
        {copied ? 'Copied!' : roomId}
      </div>

      {/* WS status */}
      <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color: statusColor }}>
        {status}
      </div>

      {/* Spacer */}
      <div style={{ flex:1 }} />

      {/* Online users avatars */}
      <div style={{ display:'flex', alignItems:'center' }}>
        {users.slice(0, 5).map((u, i) => (
          <div
            key={u.clientId}
            title={u.isSelf ? `${u.name} (you)` : u.name}
            style={{ width:'28px', height:'28px', borderRadius:'50%', background: u.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', color:'#fff', border:'2px solid var(--bg)', marginLeft: i===0 ? 0 : '-8px', zIndex: users.length - i, cursor:'pointer', flexShrink:0, filter: u.isSelf ? 'brightness(1.2)' : 'none', boxShadow: u.isSelf ? `0 0 0 1px ${u.color}` : 'none' }}
          >
            {u.name.substring(0, 2).toUpperCase()}
          </div>
        ))}
        {users.length > 0 && (
          <span style={{ fontSize:'11px', color:'var(--text-muted)', marginLeft:'10px' }}>
            {users.length} online
          </span>
        )}
      </div>

      {/* Invite button */}
      <button
        onClick={handleCopy}
        style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:'6px', padding:'5px 12px', fontSize:'11px', fontWeight:'700', letterSpacing:'0.04em', transition:'opacity 0.15s', flexShrink:0 }}
        onMouseEnter={e => e.target.style.opacity='0.85'}
        onMouseLeave={e => e.target.style.opacity='1'}
      >
        {copied ? '✓ Copied' : '+ Invite'}
      </button>

      {/* Leave */}
      <button
        onClick={onLeave}
        title="Leave room"
        style={{ background:'transparent', color:'var(--text-muted)', border:'1px solid var(--border)', borderRadius:'6px', padding:'5px 10px', fontSize:'11px', transition:'all 0.15s', flexShrink:0 }}
        onMouseEnter={e => { e.target.style.borderColor='var(--red)'; e.target.style.color='var(--red)'; }}
        onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text-muted)'; }}
      >
        Leave
      </button>
    </div>
  );
}
