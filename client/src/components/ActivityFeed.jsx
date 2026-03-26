import { useState } from 'react';

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

export default function ActivityFeed({ activities, users, onClear, minimized, onToggle }) {
  return (
    <div style={{ width: minimized ? '32px' : '210px', background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, transition: 'width 0.2s', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '8px 10px', fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
        <button onClick={onToggle} title={minimized ? 'Expand' : 'Minimize'}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '12px', padding: 0, flexShrink: 0 }}>
          {minimized ? '▶' : '◀'}
        </button>
        {!minimized && (
          <>
            <span style={{ flex: 1 }}>Activity</span>
            <span style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', color: 'var(--text-muted)' }}>{activities.length}</span>
            {activities.length > 0 && (
              <button onClick={onClear} title="Clear activity"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '11px', padding: '0 2px' }}>🗑</button>
            )}
          </>
        )}
      </div>

      {!minimized && (
        <>
          {/* Online users */}
          {users.length > 0 && (
            <div style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {users.map(u => (
                <div key={u.clientId} title={u.name}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface2)', borderRadius: '12px', padding: '2px 7px 2px 4px', border: `1px solid ${u.color}33` }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: u.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', maxWidth: '55px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.isSelf ? 'You' : u.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {activities.length === 0 && (
              <div style={{ padding: '16px 12px', fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center' }}>No activity yet</div>
            )}
            {activities.map(a => (
              <div key={a.id} style={{ display: 'flex', gap: '7px', padding: '5px 10px', borderBottom: '1px solid rgba(255,255,255,0.02)', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: '700', color: '#fff', flexShrink: 0, marginTop: '1px' }}>
                  {(a.user || '?').substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--text)', fontWeight: '500' }}>{a.user}</strong> {a.text}
                  </span>
                  <div style={{ fontSize: '10px', color: 'var(--text-faint)' }}>{timeAgo(a.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(-3px)} to{opacity:1;transform:none} }`}</style>
    </div>
  );
}
