const FILE_COLORS = { js: '#fbbf24', jsx: '#38bdf8', ts: '#4f8ef7', tsx: '#4f8ef7', html: '#f87171', css: '#a78bfa', md: '#34d399', json: '#fb923c', py: '#34d399' };

function getExt(name) { return name.split('.').pop(); }
function getDotColor(name) { return FILE_COLORS[getExt(name)] || '#888'; }

export default function Sidebar({ files, activeFile, users, onSelectFile }) {
  return (
    <div style={{ width:'188px', background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>

      {/* Files section */}
      <div style={{ padding:'10px 12px 4px', fontSize:'10px', color:'var(--text-faint)', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:'700' }}>
        Files
      </div>

      {files.map(f => (
        <div
          key={f.name}
          onClick={() => onSelectFile(f)}
          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 14px', fontSize:'12px', cursor:'pointer', color: activeFile.name===f.name ? 'var(--text)' : 'var(--text-muted)', borderLeft: activeFile.name===f.name ? '2px solid var(--accent)' : '2px solid transparent', background: activeFile.name===f.name ? 'var(--surface2)' : 'transparent', fontFamily:'var(--font-code)', transition:'all 0.1s' }}
          onMouseEnter={e => { if(activeFile.name!==f.name) { e.currentTarget.style.background='var(--surface2)'; e.currentTarget.style.color='var(--text)'; }}}
          onMouseLeave={e => { if(activeFile.name!==f.name) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; }}}
        >
          <span style={{ width:'7px', height:'7px', borderRadius:'50%', background: getDotColor(f.name), flexShrink:0, display:'inline-block' }} />
          {f.name}
        </div>
      ))}

      {/* Online users section */}
      <div style={{ padding:'16px 12px 4px', fontSize:'10px', color:'var(--text-faint)', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:'700', marginTop:'8px', borderTop:'1px solid var(--border)' }}>
        Online ({users.length})
      </div>

      {users.map(u => (
        <div key={u.clientId} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 14px' }}>
          <span style={{ width:'8px', height:'8px', borderRadius:'2px', background: u.color, flexShrink:0, display:'inline-block' }} />
          <span style={{ fontSize:'11px', color: u.isSelf ? 'var(--text)' : 'var(--text-muted)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {u.name}{u.isSelf ? ' (you)' : ''}
          </span>
          {u.cursor && (
            <span style={{ fontSize:'10px', color:'var(--text-faint)', fontFamily:'var(--font-code)', flexShrink:0 }}>
              L{u.cursor.lineNumber}
            </span>
          )}
        </div>
      ))}

      {users.length === 0 && (
        <div style={{ padding:'8px 14px', fontSize:'11px', color:'var(--text-faint)' }}>
          Connecting...
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex:1 }} />

      {/* CRDT info */}
      <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)' }}>
        <div style={{ fontSize:'10px', color:'var(--text-faint)', lineHeight:'1.6' }}>
          <div style={{ color:'var(--green)', marginBottom:'2px' }}>● Yjs CRDT active</div>
          <div>Conflict-free sync</div>
          <div>across all users</div>
        </div>
      </div>
    </div>
  );
}
