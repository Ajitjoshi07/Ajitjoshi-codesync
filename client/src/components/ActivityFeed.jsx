function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

export default function ActivityFeed({ activities, users }) {
  return (
    <div style={{ width:'210px', background:'var(--surface)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ padding:'10px 14px', fontSize:'10px', color:'var(--text-faint)', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:'700', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        Activity
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
        {activities.map(a => (
          <div key={a.id} style={{ display:'flex', gap:'8px', padding:'6px 14px', animation:'fadeIn 0.3s ease' }}>
            <div style={{ width:'18px', height:'18px', borderRadius:'50%', background: a.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'8px', fontWeight:'700', color:'#fff', flexShrink:0, marginTop:'1px' }}>
              {a.user.substring(0,2).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <span style={{ fontSize:'11px', color:'var(--text-muted)', lineHeight:'1.5' }}>
                <strong style={{ color:'var(--text)', fontWeight:'500' }}>{a.user}</strong> {a.text}
              </span>
              <div style={{ fontSize:'10px', color:'var(--text-faint)', marginTop:'1px' }}>
                {timeAgo(a.time)}
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div style={{ padding:'16px 14px', fontSize:'11px', color:'var(--text-faint)' }}>
            No activity yet
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:none } }`}</style>
    </div>
  );
}
