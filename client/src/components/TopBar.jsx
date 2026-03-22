import { useState } from 'react';
import {
  saveSingleFile, copyToClipboard, exportMarkdown,
  exportPDF, exportWord, exportHTML,
  exportProjectZip, exportAllProjectsZip, openInGoogleDocs, exportTxt
} from '../utils/exportManager';

const EXPORT_OPTIONS = [
  { id:'copy',     icon:'⎘', label:'Copy to Clipboard',   desc:'Copy entire file content',              group:'quick'   },
  { id:'file',     icon:'↓', label:'Save as Source File',  desc:'Download as original file type',        group:'quick'   },
  { id:'txt',      icon:'T', label:'Export as .txt',       desc:'Plain text, no formatting',             group:'single'  },
  { id:'markdown', icon:'M', label:'Export as Markdown',   desc:'Wrapped in code block with syntax',     group:'single'  },
  { id:'html',     icon:'H', label:'Export as HTML',       desc:'Standalone page with syntax colors',    group:'single'  },
  { id:'pdf',      icon:'P', label:'Export as PDF',        desc:'Syntax-highlighted, dark theme',        group:'single'  },
  { id:'word',     icon:'W', label:'Export as Word (.doc)','desc':'Open in Microsoft Word',              group:'single'  },
  { id:'gdoc',     icon:'G', label:'Open in Google Docs',  desc:'Copies code, opens new Doc',            group:'single'  },
  { id:'zip',      icon:'Z', label:'Save Project as .zip', desc:'All files in current project',          group:'project' },
  { id:'allzip',   icon:'A', label:'Save All Projects',    desc:'Every project as one .zip',             group:'project' },
];

const GROUP_LABELS = { quick:'Quick actions', single:'Export current file', project:'Export project' };

export default function TopBar({ roomId, userName, userColor, users, status, onCopyLink, onLeave, activeFile, activeProject, projects }) {
  const [copied, setCopied] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const statusColor = status==='connected' ? 'var(--green)' : status==='connecting' ? 'var(--yellow)' : 'var(--red)';

  function showToast(msg, ok=true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  }

  function handleCopy() {
    onCopyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExport(id) {
    if (!activeFile) return;
    setLoadingId(id);
    setShowExport(false);
    try {
      switch(id) {
        case 'copy':     await copyToClipboard(activeFile); showToast('Copied to clipboard!'); break;
        case 'file':     saveSingleFile(activeFile);        showToast(`Saved ${activeFile.name}`); break;
        case 'txt':      exportTxt(activeFile);             showToast(`Exported as .txt`); break;
        case 'markdown': exportMarkdown(activeFile);        showToast(`Exported as Markdown`); break;
        case 'html':     exportHTML(activeFile);            showToast(`Exported as HTML`); break;
        case 'pdf':      await exportPDF(activeFile);       showToast(`Exported as PDF`); break;
        case 'word':     await exportWord(activeFile);      showToast(`Exported as Word`); break;
        case 'gdoc':     await openInGoogleDocs(activeFile); showToast('Code copied! Paste in Google Docs'); break;
        case 'zip':      await exportProjectZip(activeProject); showToast(`Project saved as .zip`); break;
        case 'allzip':   await exportAllProjectsZip(projects); showToast(`All projects saved`); break;
        default: break;
      }
    } catch(err) {
      showToast('Export failed — try again', false);
    }
    setLoadingId(null);
  }

  // Group export options
  const groups = ['quick','single','project'];

  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'0 14px', height:'44px', background:'var(--surface)', borderBottom:'1px solid var(--border)', flexShrink:0, position:'relative' }}>

      {/* Logo */}
      <div style={{ fontSize:'14px', fontWeight:'700', letterSpacing:'0.06em', color:'var(--accent)', textTransform:'uppercase', flexShrink:0 }}>
        Code<span style={{ color:'var(--text)' }}>Sync</span>
      </div>

      {/* Room pill */}
      <div onClick={handleCopy} title="Click to copy invite link"
        style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'20px', padding:'3px 10px 3px 8px', fontSize:'11px', color:'var(--text-muted)', cursor:'pointer', fontFamily:'var(--font-code)', transition:'border-color 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
      >
        <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:statusColor, display:'inline-block', flexShrink:0 }} />
        {copied ? 'Copied!' : roomId}
      </div>

      <div style={{ fontSize:'11px', color:statusColor }}>{status}</div>
      <div style={{ flex:1 }} />

      {/* EXPORT BUTTON */}
      <div style={{ position:'relative' }}>
        <button onClick={() => setShowExport(v => !v)}
          style={{ background:'var(--surface2)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:'6px', padding:'5px 12px', fontSize:'11px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px', fontFamily:'var(--font-ui)', transition:'border-color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor='var(--green)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
        >
          {loadingId ? '⟳' : '↓'} Export
        </button>

        {showExport && (
          <>
            <div onClick={() => setShowExport(false)} style={{ position:'fixed', inset:0, zIndex:99 }} />
            <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', width:'260px', zIndex:100, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>

              {groups.map(group => {
                const opts = EXPORT_OPTIONS.filter(o => o.group === group);
                return (
                  <div key={group}>
                    <div style={{ padding:'8px 14px 4px', fontSize:'10px', color:'var(--text-faint)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:'700', background:'var(--surface2)' }}>
                      {GROUP_LABELS[group]}
                    </div>
                    {opts.map(opt => (
                      <button key={opt.id} onClick={() => handleExport(opt.id)}
                        disabled={loadingId === opt.id}
                        style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'9px 14px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', fontFamily:'var(--font-ui)', transition:'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                      >
                        <div style={{ width:'26px', height:'26px', borderRadius:'6px', background:'var(--surface2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'var(--accent)', flexShrink:0, fontFamily:'var(--font-code)' }}>
                          {loadingId===opt.id ? '⟳' : opt.icon}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:'12px', color:'var(--text)', fontWeight:'600', lineHeight:1.3 }}>{opt.label}</div>
                          <div style={{ fontSize:'10px', color:'var(--text-faint)', lineHeight:1.4, marginTop:'1px' }}>{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}

              <div style={{ padding:'8px 14px', fontSize:'10px', color:'var(--text-faint)', borderTop:'1px solid var(--border)', textAlign:'center' }}>
                All exports include syntax highlighting
              </div>
            </div>
          </>
        )}
      </div>

      {/* Online users */}
      <div style={{ display:'flex', alignItems:'center' }}>
        {users.slice(0,5).map((u,i) => (
          <div key={u.clientId} title={u.isSelf ? `${u.name} (you)` : u.name}
            style={{ width:'26px', height:'26px', borderRadius:'50%', background:u.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:'700', color:'#fff', border:'2px solid var(--bg)', marginLeft:i===0?0:'-7px', zIndex:users.length-i, cursor:'pointer', flexShrink:0, boxShadow:u.isSelf?`0 0 0 1px ${u.color}`:'none' }}>
            {u.name.substring(0,2).toUpperCase()}
          </div>
        ))}
        {users.length > 0 && <span style={{ fontSize:'11px', color:'var(--text-muted)', marginLeft:'8px' }}>{users.length} online</span>}
      </div>

      {/* Invite */}
      <button onClick={handleCopy}
        style={{ background:'var(--accent)', color:'#fff', border:'none', borderRadius:'6px', padding:'5px 12px', fontSize:'11px', fontWeight:'700', letterSpacing:'0.04em', cursor:'pointer', flexShrink:0, fontFamily:'var(--font-ui)' }}>
        {copied ? '✓ Copied' : '+ Invite'}
      </button>

      {/* Leave */}
      <button onClick={onLeave}
        style={{ background:'transparent', color:'var(--text-muted)', border:'1px solid var(--border)', borderRadius:'6px', padding:'5px 10px', fontSize:'11px', cursor:'pointer', flexShrink:0, fontFamily:'var(--font-ui)', transition:'all 0.15s' }}
        onMouseEnter={e => { e.target.style.borderColor='var(--red)'; e.target.style.color='var(--red)'; }}
        onMouseLeave={e => { e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text-muted)'; }}
      >Leave</button>

      {/* Toast */}
      {toast && (
        <div style={{ position:'absolute', bottom:'-44px', right:'14px', background: toast.ok ? 'var(--surface2)' : 'rgba(248,113,113,0.15)', border:`1px solid ${toast.ok ? 'var(--green)' : 'var(--red)'}`, borderRadius:'6px', padding:'8px 14px', fontSize:'12px', color: toast.ok ? 'var(--green)' : 'var(--red)', zIndex:200, whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(0,0,0,0.3)' }}>
          {toast.ok ? '✓' : '✗'} {toast.msg}
        </div>
      )}
    </div>
  );
}
