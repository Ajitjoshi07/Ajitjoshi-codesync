import { useState } from 'react';
import { LANGUAGES, getLangColor } from '../utils/languages';

const DEFAULT_PROJECTS = [
  {
    id: 'proj_1',
    name: 'My Web App',
    files: [
      { id: 'f1', name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello from CodeSync!</h1>\n  <script src="main.js"></script>\n</body>\n</html>\n' },
      { id: 'f2', name: 'style.css', language: 'css', content: 'body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f8fafc;\n}\n\nh1 { color: #4f8ef7; }\n' },
      { id: 'f3', name: 'main.js', language: 'javascript', content: '// Main JavaScript\nconsole.log("Hello, World!");\n\ndocument.querySelector("h1").addEventListener("click", () => {\n  alert("You clicked the heading!");\n});\n' },
    ]
  },
  {
    id: 'proj_2',
    name: 'Python Scripts',
    files: [
      { id: 'f4', name: 'main.py', language: 'python', content: '# Python Main\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nif __name__ == "__main__":\n    print(greet("World"))\n' },
      { id: 'f5', name: 'utils.py', language: 'python', content: '# Utility functions\ndef add(a: int, b: int) -> int:\n    return a + b\n\ndef subtract(a: int, b: int) -> int:\n    return a - b\n' },
    ]
  }
];

function genId() { return 'id_' + Math.random().toString(36).slice(2, 9); }

export default function ProjectManager({
  projects, setProjects,
  activeProjectId, setActiveProjectId,
  activeFileId, setActiveFileId,
  users
}) {
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState('javascript');
  const [showNewFile, setShowNewFile] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const activeProject = projects.find(p => p.id === activeProjectId);

  function createProject() {
    if (!newProjectName.trim()) return;
    const proj = {
      id: genId(),
      name: newProjectName.trim(),
      files: [{ id: genId(), name: 'main.js', language: 'javascript', content: '// Start coding!\nconsole.log("Hello, World!");\n' }]
    };
    setProjects(prev => [...prev, proj]);
    setActiveProjectId(proj.id);
    setActiveFileId(proj.files[0].id);
    setNewProjectName('');
    setShowNewProject(false);
  }

  function deleteProject(projId) {
    if (projects.length === 1) return;
    const remaining = projects.filter(p => p.id !== projId);
    setProjects(remaining);
    if (activeProjectId === projId) {
      setActiveProjectId(remaining[0].id);
      setActiveFileId(remaining[0].files[0].id);
    }
  }

  function createFile() {
    if (!newFileName.trim() || !activeProject) return;
    const lang = LANGUAGES.find(l => l.id === newFileLang);
    const ext = lang?.ext || 'txt';
    const name = newFileName.includes('.') ? newFileName.trim() : `${newFileName.trim()}.${ext}`;
    const file = { id: genId(), name, language: newFileLang, content: lang?.template || '' };
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, files: [...p.files, file] } : p
    ));
    setActiveFileId(file.id);
    setNewFileName('');
    setShowNewFile(false);
  }

  function deleteFile(fileId) {
    if (!activeProject || activeProject.files.length === 1) return;
    const remaining = activeProject.files.filter(f => f.id !== fileId);
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, files: remaining } : p
    ));
    if (activeFileId === fileId) setActiveFileId(remaining[0].id);
  }

  function startRename(file) {
    setRenamingFile(file.id);
    setRenameValue(file.name);
  }

  function commitRename(fileId) {
    if (!renameValue.trim()) { setRenamingFile(null); return; }
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? {
        ...p, files: p.files.map(f => f.id === fileId ? { ...f, name: renameValue.trim() } : f)
      } : p
    ));
    setRenamingFile(null);
  }

  return (
    <div style={{ width: '200px', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>

      {/* Projects header */}
      <div style={{ padding: '8px 10px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700' }}>Projects</span>
        <button onClick={() => setShowNewProject(v => !v)} title="New project"
          style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '16px', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>+</button>
      </div>

      {/* New project input */}
      {showNewProject && (
        <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '4px' }}>
          <input
            autoFocus
            value={newProjectName}
            onChange={e => setNewProjectName(e.target.value)}
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', cursor: 'pointer', background: activeProjectId === proj.id ? 'var(--accent-dim)' : 'transparent', borderLeft: activeProjectId === proj.id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.1s' }}
            onMouseEnter={e => { if (activeProjectId !== proj.id) e.currentTarget.style.background = 'var(--surface2)'; }}
            onMouseLeave={e => { if (activeProjectId !== proj.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: '12px', flex: 1, color: activeProjectId === proj.id ? 'var(--accent)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-ui)' }}>
              {activeProjectId === proj.id ? '▶ ' : '  '}{proj.name}
            </span>
            {projects.length > 1 && (
              <span onClick={e => { e.stopPropagation(); deleteProject(proj.id); }}
                title="Delete project"
                style={{ fontSize: '14px', color: 'var(--text-faint)', cursor: 'pointer', lineHeight: 1, opacity: 0 }}
                onMouseEnter={e => e.target.style.opacity = '1'}
                onMouseLeave={e => e.target.style.opacity = '0'}
              >×</span>
            )}
          </div>
        ))}
      </div>

      {/* Files header */}
      <div style={{ padding: '8px 10px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: '700' }}>
          {activeProject?.name || 'Files'}
        </span>
        <button onClick={() => setShowNewFile(v => !v)} title="New file"
          style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '16px', cursor: 'pointer', lineHeight: 1, padding: '0 2px' }}>+</button>
      </div>

      {/* New file input */}
      {showNewFile && (
        <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <input
            autoFocus
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', cursor: 'pointer', background: activeFileId === file.id ? 'var(--surface2)' : 'transparent', borderLeft: activeFileId === file.id ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.1s' }}
            onMouseEnter={e => { if (activeFileId !== file.id) e.currentTarget.style.background = 'var(--surface2)'; }}
            onMouseLeave={e => { if (activeFileId !== file.id) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: getLangColor(file.language), flexShrink: 0, display: 'inline-block' }} />

            {renamingFile === file.id ? (
              <input autoFocus value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(file.id); if (e.key === 'Escape') setRenamingFile(null); }}
                onBlur={() => commitRename(file.id)}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: '3px', padding: '1px 4px', fontSize: '11px', color: 'var(--text)', outline: 'none', fontFamily: 'var(--font-code)' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span onDoubleClick={e => { e.stopPropagation(); startRename(file); }}
                title="Double-click to rename"
                style={{ flex: 1, fontSize: '11px', color: activeFileId === file.id ? 'var(--text)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-code)' }}>
                {file.name}
              </span>
            )}

            {activeProject.files.length > 1 && (
              <span onClick={e => { e.stopPropagation(); deleteFile(file.id); }}
                title="Delete file"
                style={{ fontSize: '13px', color: 'var(--text-faint)', cursor: 'pointer', lineHeight: 1, flexShrink: 0, opacity: 0 }}
                onMouseEnter={e => e.target.style.opacity = '1'}
                onMouseLeave={e => e.target.style.opacity = '0'}
              >×</span>
            )}
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
            <span style={{ fontSize: '11px', color: u.isSelf ? 'var(--text)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
