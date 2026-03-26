import { useState, useRef, useEffect } from 'react';
import { LANGUAGES, getLangColor } from '../utils/languages';

const DEFAULT_PROJECTS = [
  {
    id: 'proj_1', name: 'My Web App',
    files: [
      { id: 'f1', name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My App</title>\n</head>\n<body>\n  <h1>Hello from CodeSync!</h1>\n</body>\n</html>\n' },
      { id: 'f2', name: 'style.css', language: 'css', content: 'body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n' },
      { id: 'f3', name: 'main.js', language: 'javascript', content: '// Start coding!\nconsole.log("Hello, World!");\n' },
    ]
  },
  {
    id: 'proj_2', name: 'Python Scripts',
    files: [
      { id: 'f4', name: 'main.py', language: 'python', content: '# Python\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n' },
    ]
  }
];

function genId() { return 'id_' + Math.random().toString(36).slice(2, 9); }

// Context menu component
function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'fixed', left: x, top: y, zIndex: 9999,
      background: '#1c2030', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '8px', padding: '4px', minWidth: '160px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      {items.map((item, i) => item === 'divider' ? (
        <div key={i} style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
      ) : (
        <button key={item.label} onClick={() => { item.action(); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '7px 10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', color: item.danger ? '#f87171' : '#e2e8f0', fontFamily: "'Syne',sans-serif", borderRadius: '5px', textAlign: 'left', transition: 'background 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.background = item.danger ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '14px' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function ProjectManager({
  projects, setProjects,
  activeProjectId, setActiveProjectId,
  activeFileId, setActiveFileId,
  users, addActivity
}) {
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState('javascript');
  const [showNewFile, setShowNewFile] = useState(false);
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const activeProject = projects.find(p => p.id === activeProjectId);

  function openContextMenu(e, type, item) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, item });
  }

  function startRename(type, item) {
    setRenamingItem({ type, id: item.id });
    setRenameValue(item.name);
  }

  function commitRename() {
    if (!renameValue.trim() || !renamingItem) { setRenamingItem(null); return; }
    if (renamingItem.type === 'project') {
      setProjects(prev => prev.map(p => p.id === renamingItem.id ? { ...p, name: renameValue.trim() } : p));
      addActivity && addActivity(`renamed project to "${renameValue.trim()}"`);
    } else {
      setProjects(prev => prev.map(p =>
        p.id === activeProjectId ? { ...p, files: p.files.map(f => f.id === renamingItem.id ? { ...f, name: renameValue.trim() } : f) } : p
      ));
      addActivity && addActivity(`renamed file to "${renameValue.trim()}"`);
    }
    setRenamingItem(null);
  }

  function deleteProject(projId) {
    if (projects.length === 1) return alert('Cannot delete the only project');
    if (!window.confirm('Delete this project and all its files?')) return;
    const remaining = projects.filter(p => p.id !== projId);
    setProjects(remaining);
    if (activeProjectId === projId) {
      setActiveProjectId(remaining[0].id);
      setActiveFileId(remaining[0].files[0].id);
    }
    addActivity && addActivity('deleted a project');
  }

  function deleteFile(fileId) {
    if (!activeProject || activeProject.files.length === 1) return alert('Cannot delete the only file');
    if (!window.confirm('Delete this file?')) return;
    const remaining = activeProject.files.filter(f => f.id !== fileId);
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, files: remaining } : p));
    if (activeFileId === fileId) setActiveFileId(remaining[0].id);
    addActivity && addActivity('deleted a file');
  }

  function createProject() {
    if (!newProjectName.trim()) return;
    const proj = {
      id: genId(), name: newProjectName.trim(),
      files: [{ id: genId(), name: 'main.js', language: 'javascript', content: '// Start coding!\n' }]
    };
    setProjects(prev => [...prev, proj]);
    setActiveProjectId(proj.id);
    setActiveFileId(proj.files[0].id);
    setNewProjectName('');
    setShowNewProject(false);
    addActivity && addActivity(`created project "${proj.name}"`);
  }

  function createFile() {
    if (!newFileName.trim() || !activeProject) return;
    const lang = LANGUAGES.find(l => l.id === newFileLang);
    const ext = lang?.ext || 'txt';
    const name = newFileName.includes('.') ? newFileName.trim() : `${newFileName.trim()}.${ext}`;
    const file = { id: genId(), name, language: newFileLang, content: lang?.template || '' };
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, files: [...p.files, file] } : p));
    setActiveFileId(file.id);
    setNewFileName('');
    setShowNewFile(false);
    addActivity && addActivity(`created file "${name}"`);
  }

  const dupProject = (proj) => {
    const newProj = { ...proj, id: genId(), name: proj.name + ' (copy)', files: proj.files.map(f => ({ ...f, id: genId() })) };
    setProjects(prev => [...prev, newProj]);
    addActivity && addActivity(`duplicated project "${proj.name}"`);
  };

  const dupFile = (file) => {
    const newFile = { ...file, id: genId(), name: file.name.replace(/(\.[^.]+)$/, '-copy$1') };
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, files: [...p.files, newFile] } : p));
    addActivity && addActivity(`duplicated file "${file.name}"`);
  };

  return (
    <div style={{ width: '200px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={contextMenu.type === 'project' ? [
            { icon: '✏️', label: 'Rename', action: () => startRename('project', contextMenu.item) },
            { icon: '📋', label: 'Duplicate', action: () => dupProject(contextMenu.item) },
            'divider',
            { icon: '🗑️', label: 'Delete', danger: true, action: () => deleteProject(contextMenu.item.id) },
          ] : [
            { icon: '✏️', label: 'Rename', action: () => startRename('file', contextMenu.item) },
            { icon: '📋', label: 'Duplicate', action: () => dupFile(contextMenu.item) },
            'divider',
            { icon: '🗑️', label: 'Delete', danger: true, action: () => deleteFile(contextMenu.item.id) },
          ]}
        />
      )}

      {/* Projects header */}
      <div style={{ padding: '8px 10px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700' }}>Projects</span>
        <button onClick={() => setShowNewProject(v => !v)} title="New project"
          style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '16px', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>+</button>
      </div>

      {/* New project input */}
      {showNewProject && (
        <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '4px' }}>
          <input autoFocus value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createProject(); if (e.key === 'Escape') setShowNewProject(false); }}
            placeholder="Project name..."
            style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 6px', fontSize: '11px', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-ui)' }}
          />
          <button onClick={createProject}
            style={{ background: 'var(--accent)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', padding: '4px 6px', cursor: 'pointer' }}>OK</button>
        </div>
      )}

      {/* Project list */}
      <div style={{ maxHeight: '140px', overflowY: 'auto', borderBottom: '1px solid var(--border)' }}>
        {projects.map(proj => (
          <div key={proj.id}
            onClick={() => { setActiveProjectId(proj.id); setActiveFileId(proj.files[0].id); }}
            onContextMenu={e => openContextMenu(e, 'project', proj)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', cursor: 'pointer', background: activeProjectId === proj.id ? 'var(--accent-dim)' : 'transparent', borderLeft: activeProjectId === proj.id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.1s' }}
            onMouseEnter={e => { if (activeProjectId !== proj.id) e.currentTarget.style.background = 'var(--surface2)'; }}
            onMouseLeave={e => { if (activeProjectId !== proj.id) e.currentTarget.style.background = 'transparent'; }}
          >
            {renamingItem?.type === 'project' && renamingItem?.id === proj.id ? (
              <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingItem(null); }}
                onBlur={commitRename}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: '3px', padding: '1px 4px', fontSize: '11px', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-ui)' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span style={{ fontSize: '12px', flex: 1, color: activeProjectId === proj.id ? 'var(--accent)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)' }}>
                {activeProjectId === proj.id ? '▶ ' : '  '}{proj.name}
              </span>
            )}
            <span onClick={e => { e.stopPropagation(); openContextMenu(e, 'project', proj); }}
              style={{ fontSize: '14px', color: 'var(--text-faint)', cursor: 'pointer', opacity: 0, flexShrink: 0 }}
              onMouseEnter={e => e.target.style.opacity = '1'}
              onMouseLeave={e => e.target.style.opacity = '0'}
            >⋮</span>
          </div>
        ))}
      </div>

      {/* Files header */}
      <div style={{ padding: '8px 10px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeProject?.name || 'Files'}
        </span>
        <button onClick={() => setShowNewFile(v => !v)} title="New file"
          style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '16px', cursor: 'pointer', lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>+</button>
      </div>

      {/* New file input */}
      {showNewFile && (
        <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input autoFocus value={newFileName} onChange={e => setNewFileName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createFile(); if (e.key === 'Escape') setShowNewFile(false); }}
            placeholder="filename.js"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 6px', fontSize: '11px', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-code)' }}
          />
          <select value={newFileLang} onChange={e => setNewFileLang(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 6px', fontSize: '11px', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-ui)' }}>
            {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <button onClick={createFile}
            style={{ background: 'var(--accent)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '11px', padding: '4px', cursor: 'pointer' }}>
            Create File
          </button>
        </div>
      )}

      {/* File list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeProject?.files.map(file => (
          <div key={file.id}
            onClick={() => setActiveFileId(file.id)}
            onContextMenu={e => openContextMenu(e, 'file', file)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', cursor: 'pointer', background: activeFileId === file.id ? 'var(--surface2)' : 'transparent', borderLeft: activeFileId === file.id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.1s' }}
            onMouseEnter={e => { if (activeFileId !== file.id) e.currentTarget.style.background = 'var(--surface2)'; }}
            onMouseLeave={e => { if (activeFileId !== file.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: getLangColor(file.language), flexShrink: 0, display: 'inline-block' }} />

            {renamingItem?.type === 'file' && renamingItem?.id === file.id ? (
              <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingItem(null); }}
                onBlur={commitRename}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: '3px', padding: '1px 4px', fontSize: '11px', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-code)' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span style={{ flex: 1, fontSize: '11px', color: activeFileId === file.id ? 'var(--text)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-code)' }}>
                {file.name}
              </span>
            )}

            <span onClick={e => { e.stopPropagation(); openContextMenu(e, 'file', file); }}
              style={{ fontSize: '13px', color: 'var(--text-faint)', cursor: 'pointer', opacity: 0, flexShrink: 0 }}
              onMouseEnter={e => e.target.style.opacity = '1'}
              onMouseLeave={e => e.target.style.opacity = '0'}
            >⋮</span>
          </div>
        ))}
      </div>

      {/* Online users */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px 10px 4px' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700' }}>Online ({users.length})</span>
      </div>
      <div style={{ padding: '0 0 8px', maxHeight: '100px', overflowY: 'auto' }}>
        {users.map(u => (
          <div key={u.clientId} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 10px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: u.color, flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: u.isSelf ? 'var(--text)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {u.name}{u.isSelf ? ' (you)' : ''}
            </span>
            {u.cursor && <span style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-code)', marginLeft: 'auto' }}>L{u.cursor.lineNumber}</span>}
          </div>
        ))}
        {users.length === 0 && <div style={{ padding: '2px 10px', fontSize: '11px', color: 'var(--text-faint)' }}>Connecting...</div>}
      </div>
    </div>
  );
}

export { DEFAULT_PROJECTS };
