export default function OutputPanel({ result, running, onClose, stdin, setStdin, showStdin, setShowStdin }) {
  if (!result && !running) return null;

  return (
    <div style={{ height: '220px', borderTop: '1px solid var(--border)', background: '#080a0f', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

      {/* Output toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Output</span>

        {result && !running && (
          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: result.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', color: result.type === 'success' ? 'var(--green)' : 'var(--red)', fontWeight: '600' }}>
            {result.type === 'success' ? '✓ Success' : '✗ Error'}
          </span>
        )}

        {result?.time && (
          <span style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
            {result.time}s · {Math.round((result.memory || 0) / 1024)}KB
          </span>
        )}

        <div style={{ flex: 1 }} />

        <button onClick={() => setShowStdin(v => !v)}
          style={{ background: showStdin ? 'var(--accent-dim)' : 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
          stdin
        </button>

        <button onClick={onClose}
          style={{ background: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border)', borderRadius: '4px', padding: '3px 8px', fontSize: '10px', cursor: 'pointer' }}>
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* stdin input */}
        {showStdin && (
          <div style={{ width: '180px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--text-faint)', borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>stdin input</div>
            <textarea
              value={stdin}
              onChange={e => setStdin(e.target.value)}
              placeholder="Enter input here..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-code)', fontSize: '12px', padding: '8px', resize: 'none', lineHeight: '1.6' }}
            />
          </div>
        )}

        {/* Output content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px', fontFamily: 'var(--font-code)', fontSize: '12px', lineHeight: '1.7' }}>
          {running && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
              Running your code...
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {result && !running && result.type === 'browser' && (
            <iframe
              srcDoc={result.content}
              style={{ width: '100%', height: '160px', border: 'none', background: '#fff', borderRadius: '4px' }}
              title="Output"
              sandbox="allow-scripts"
            />
          )}

          {result && !running && result.type !== 'browser' && (
            <pre style={{ margin: 0, color: result.type === 'success' ? '#34d399' : '#f87171', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {result.output}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
