import { useState, useCallback, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useCollabEditor } from '../hooks/useCollabEditor';
import ProjectManager, { DEFAULT_PROJECTS } from './ProjectManager';
import TopBar from './TopBar';
import ActivityFeed from './ActivityFeed';
import StatusBar from './StatusBar';
import { LANGUAGES, getLangColor } from '../utils/languages';

export default function Editor({ roomId, userName, userColor, onLeave }) {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(DEFAULT_PROJECTS[0].id);
  const [activeFileId, setActiveFileId] = useState(DEFAULT_PROJECTS[0].files[0].id);
  const [activities, setActivities] = useState([
    { id: 1, user: userName, color: userColor, text: 'opened the editor', time: new Date() }
  ]);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [running, setRunning] = useState(false);
  const editorRef = useRef(null);
  const isFirstMount = useRef(true);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activeFile = activeProject?.files.find(f => f.id === activeFileId) || activeProject?.files[0];

  const addActivity = useCallback((text, user = userName, color = userColor) => {
    setActivities(prev => [{ id: Date.now(), user, color, text, time: new Date() }, ...prev].slice(0, 30));
  }, [userName, userColor]);

  const { status, users, error, bindEditor, updateCursor, syncProjects } = useCollabEditor({
    roomId, userName, userColor,
    fileName: `${activeProjectId}___${activeFile?.id || 'default'}`,
    projects, setProjects
  });

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      setTimeout(() => syncProjects(projects), 1000);
      return;
    }
    syncProjects(projects);
  }, [projects]);

  function runCode() {
    if (!activeFile) return;
    setRunning(true);
    setShowOutput(true);
    setOutput('Running...');

    const code = editorRef.current?.getValue() || activeFile.content;
    const lang = activeFile.language;

    setTimeout(() => {
      if (lang === 'javascript' || lang === 'typescript' || lang === 'jsx') {
        const logs = [];
        const fakeConsole = {
          log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          error: (...args) => logs.push('❌ ' + args.join(' ')),
          warn: (...args) => logs.push('⚠ ' + args.join(' ')),
          info: (...args) => logs.push('ℹ ' + args.join(' ')),
        };
        try {
          const fn = new Function('console', code);
          fn(fakeConsole);
          setOutput(logs.length > 0 ? logs.join('\n') : '✓ Ran successfully (no output)');
        } catch (err) {
          setOutput('❌ Error: ' + err.message);
        }
      } else if (lang === 'html') {
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setOutput('✓ HTML opened in new tab');
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else if (lang === 'json') {
        try {
          const parsed = JSON.parse(code);
          setOutput(JSON.stringify(parsed, null, 2));
        } catch (err) {
          setOutput('❌ Invalid JSON: ' + err.message);
        }
      } else if (lang === 'css') {
        setOutput('ℹ CSS cannot run standalone.\nLink this in your HTML file to see styles.');
      } else if (lang === 'markdown') {
        setOutput('ℹ Export as HTML to see rendered Markdown.');
      } else {
        setOutput(`ℹ ${lang.toUpperCase()} requires a server runtime.\nOnly JavaScript runs in the browser.\nExport your code and run it locally.`);
      }
      setRunning(false);
    }, 300);
  }

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    bindEditor(editor, monaco);
    editor.onDidChangeCursorPosition(e => {
      updateCursor({ lineNumber: e.position.lineNumber, column: e.position.column });
    });
    monaco.editor.defineTheme('codesync-dark', {
      base: 'vs-dark', inherit: true,
      rules: [
        { token: 'comment', foreground: '4a5568', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'a78bfa' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'type', foreground: '4f8ef7' },
        { token: 'function', foreground: '60a5fa' },
      ],
      colors: {
        'editor.background': '#0d0f14',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#3d4460',
        'editorLineNumber.activeForeground': '#6b7694',
        'editor.selectionBackground': '#4f8ef730',
        'editor.lineHighlightBackground': '#151820',
        'editorCursor.foreground': '#4f8ef7',
        'editor.findMatchBackground': '#a78bfa40',
      }
    });
    monaco.editor.setTheme('codesync-dark');
  }

  function changeLanguage(langId) {
    const lang = LANGUAGES.find(l => l.id === langId);
    if (!lang || !activeFile) return;
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? {
        ...p, files: p.files.map(f => f.id === activeFileId ? { ...f, language: langId } : f)
      } : p
    ));
    addActivity(`changed language to ${lang.label}`);
  }

  function handleFileSwitch(fileId) {
    const file = activeProject?.files.find(f => f.id === fileId);
    if (file) { setActiveFileId(fileId); addActivity(`switched to ${file.name}`); }
  }

  function handleProjectSwitch(projId) {
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setActiveProjectId(projId);
      setActiveFileId(proj.files[0].id);
      addActivity(`switched to project "${proj.name}"`);
    }
  }

  function copyRoomLink() {
    const url = `${window.location.origin}?room=${roomId}&name=Guest`;
    navigator.clipboard?.writeText(url).catch(() => {});
    addActivity('copied invite link');
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      <TopBar roomId={roomId} userName={userName} userColor={userColor} users={users}
        status={status} onCopyLink={copyRoomLink} onLeave={onLeave}
        activeFile={activeFile} activeProject={activeProject} projects={projects} />

      {error && (
        <div style={{ background:'rgba(248,113,113,0.1)', borderBottom:'1px solid rgba(248,113,113,0.2)', padding:'5px 16px', fontSize:'12px', color:'var(--red)', display:'flex', alignItems:'center', gap:'8px' }}>
          <span>⚠</span> {error} <span style={{ color:'var(--text-muted)' }}>Edits saved locally.</span>
        </div>
      )}

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <ProjectManager
          projects={projects} setProjects={setProjects}
          activeProjectId={activeProjectId} setActiveProjectId={handleProjectSwitch}
          activeFileId={activeFileId} setActiveFileId={handleFileSwitch}
          users={users}
        />

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Tabs + language + run button */}
          <div style={{ display:'flex', alignItems:'center', background:'var(--surface)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
            <div style={{ display:'flex', flex:1, overflowX:'auto' }}>
              {(activeProject?.files || []).map(f => (
                <div key={f.id} onClick={() => handleFileSwitch(f.id)}
                  style={{ display:'flex', alignItems:'center', gap:'5px', padding:'7px 14px', fontSize:'12px', fontFamily:'var(--font-code)', cursor:'pointer', borderBottom: activeFileId===f.id ? '2px solid var(--accent)' : '2px solid transparent', color: activeFileId===f.id ? 'var(--text)' : 'var(--text-muted)', background: activeFileId===f.id ? 'var(--bg)' : 'transparent', whiteSpace:'nowrap', transition:'color 0.1s', flexShrink:0 }}>
                  <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:getLangColor(f.language), display:'inline-block', flexShrink:0 }} />
                  {f.name}
                </div>
              ))}
            </div>

            {/* Language selector */}
            <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'0 10px', borderLeft:'1px solid var(--border)', flexShrink:0 }}>
              <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:getLangColor(activeFile?.language), display:'inline-block' }} />
              <select value={activeFile?.language || 'javascript'} onChange={e => changeLanguage(e.target.value)}
                style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'4px 8px', fontSize:'11px', color:'var(--text)', outline:'none', fontFamily:'var(--font-ui)', cursor:'pointer', maxWidth:'130px' }}>
                {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>

            {/* RUN BUTTON */}
            <div style={{ padding:'0 10px', borderLeft:'1px solid var(--border)', flexShrink:0 }}>
              <button onClick={runCode} disabled={running}
                style={{ background: running ? 'var(--surface2)' : '#34d399', color: running ? 'var(--text-muted)' : '#0d1117', border:'none', borderRadius:'6px', padding:'5px 14px', fontSize:'12px', fontWeight:'700', cursor: running ? 'not-allowed' : 'pointer', fontFamily:'var(--font-ui)', display:'flex', alignItems:'center', gap:'5px', transition:'all 0.15s' }}>
                {running ? '⟳ Running...' : '▶ Run'}
              </button>
            </div>

            {/* Toggle output */}
            {showOutput && (
              <div style={{ padding:'0 10px', flexShrink:0 }}>
                <button onClick={() => setShowOutput(false)}
                  style={{ background:'transparent', border:'none', color:'var(--text-muted)', fontSize:'16px', cursor:'pointer', lineHeight:1 }}>×</button>
              </div>
            )}
          </div>

          {/* Editor + Output panel */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ flex: showOutput ? '1' : '1', minHeight:0 }}>
              {activeFile && (
                <MonacoEditor
                  key={`${activeProjectId}-${activeFileId}`}
                  height="100%"
                  language={activeFile.language}
                  theme="codesync-dark"
                  defaultValue={activeFile.content}
                  onMount={handleEditorMount}
                  options={{ fontSize:14, fontFamily:"'JetBrains Mono', monospace", fontLigatures:true, lineHeight:1.7, minimap:{enabled:false}, scrollBeyondLastLine:false, wordWrap:'on', automaticLayout:true, tabSize:2, cursorBlinking:'smooth', smoothScrolling:true, padding:{top:16,bottom:16}, renderLineHighlight:'line', bracketPairColorization:{enabled:true}, suggest:{showIcons:true}, quickSuggestions:true }}
                />
              )}
            </div>

            {/* Output panel */}
            {showOutput && (
              <div style={{ height:'180px', background:'#0a0c10', borderTop:'1px solid var(--border)', flexShrink:0, display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 14px', background:'var(--surface)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
                  <span style={{ fontSize:'11px', color:'var(--text-muted)', fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase' }}>Output</span>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => setOutput('')} style={{ background:'transparent', border:'none', color:'var(--text-faint)', fontSize:'11px', cursor:'pointer', fontFamily:'var(--font-ui)' }}>Clear</button>
                    <button onClick={() => setShowOutput(false)} style={{ background:'transparent', border:'none', color:'var(--text-faint)', fontSize:'16px', cursor:'pointer', lineHeight:1 }}>×</button>
                  </div>
                </div>
                <pre style={{ flex:1, overflowY:'auto', margin:0, padding:'12px 16px', fontSize:'12px', fontFamily:"'JetBrains Mono', monospace", color:'#34d399', lineHeight:'1.6', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>
                  {output || 'Click ▶ Run to execute your code...'}
                </pre>
              </div>
            )}
          </div>
        </div>

        <ActivityFeed activities={activities} users={users} />
      </div>

      <StatusBar status={status} activeFile={activeFile} users={users} roomId={roomId} activeProject={activeProject} />
    </div>
  );
}
