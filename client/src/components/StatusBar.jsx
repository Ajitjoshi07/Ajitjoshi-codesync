const LANG_LABELS = { javascript:'JavaScript', html:'HTML', css:'CSS', markdown:'Markdown', python:'Python', typescript:'TypeScript', jsx:'React JSX', tsx:'React TSX', cpp:'C++', java:'Java', go:'Go', rust:'Rust', php:'PHP', ruby:'Ruby', sql:'SQL', json:'JSON', yaml:'YAML', shell:'Shell', dart:'Dart', swift:'Swift', kotlin:'Kotlin' };

export default function StatusBar({ status, activeFile, users, roomId, activeProject }) {
  const statusColor = status==='connected' ? '#34d399' : status==='connecting' ? '#fbbf24' : '#f87171';
  const syncLabel = status==='connected' ? '✓ synced' : status==='connecting' ? '⟳ syncing...' : '✗ offline';
  const langLabel = LANG_LABELS[activeFile?.language] || activeFile?.language || 'Text';

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'16px', height:'24px', padding:'0 16px', background:'var(--accent)', fontSize:'11px', color:'rgba(255,255,255,0.85)', flexShrink:0, overflow:'hidden' }}>
      {activeProject && <span style={{ fontWeight:'600' }}>{activeProject.name}</span>}
      {activeProject && <span style={{ opacity:0.5 }}>›</span>}
      <span>{activeFile?.name || ''}</span>
      <span>{langLabel}</span>
      <span>UTF-8</span>
      <div style={{ flex:1 }} />
      <span style={{ color: status==='connected' ? '#fff' : 'rgba(255,255,255,0.6)' }}>{syncLabel}</span>
      <span>WebSocket · Yjs CRDT</span>
      <span>{users.length} online</span>
      <span style={{ fontFamily:'var(--font-code)', opacity:0.7 }}>room: {roomId}</span>
    </div>
  );
}
