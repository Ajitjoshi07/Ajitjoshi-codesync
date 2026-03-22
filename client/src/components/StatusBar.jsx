const LANG_LABELS = { javascript:'JavaScript', html:'HTML', css:'CSS', markdown:'Markdown', python:'Python', typescript:'TypeScript' };

export default function StatusBar({ status, activeFile, users, roomId }) {
  const statusColor = status === 'connected' ? '#34d399' : status === 'connecting' ? '#fbbf24' : '#f87171';
  const syncLabel = status === 'connected' ? '✓ synced' : status === 'connecting' ? '⟳ syncing...' : '✗ offline';

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'16px', height:'24px', padding:'0 16px', background:'var(--accent)', fontSize:'11px', color:'rgba(255,255,255,0.85)', flexShrink:0, overflow:'hidden' }}>
      <span>{LANG_LABELS[activeFile.language] || activeFile.language}</span>
      <span>{activeFile.name}</span>
      <span>UTF-8</span>
      <div style={{ flex:1 }} />
      <span style={{ color: status === 'connected' ? '#fff' : 'rgba(255,255,255,0.6)' }}>{syncLabel}</span>
      <span>WebSocket · Yjs CRDT</span>
      <span>{users.length} user{users.length !== 1 ? 's' : ''} online</span>
      <span style={{ fontFamily:'var(--font-code)', opacity:0.7 }}>room: {roomId}</span>
    </div>
  );
}
