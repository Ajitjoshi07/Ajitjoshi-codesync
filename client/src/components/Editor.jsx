import { useState, useCallback, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useCollabEditor } from '../hooks/useCollabEditor';
import ProjectManager, { DEFAULT_PROJECTS } from './ProjectManager';
import TopBar from './TopBar';
import ActivityFeed from './ActivityFeed';
import StatusBar from './StatusBar';
import OutputPanel from './OutputPanel';
import ChatPanel from './ChatPanel';
import TerminalPanel from './TerminalPanel';
import MenuBar from './MenuBar';
import { LANGUAGES, getLangColor } from '../utils/languages';
import { runCode, isBrowserLang, canRun } from '../utils/codeRunner';
import { registerProjectCompletions, registerInlineCompletion } from '../utils/aiCompletion';
import { applyTheme, getSavedTheme, defineMonacoThemes, THEMES } from '../utils/theme';
import { saveSingleFile, exportProjectZip, exportAllProjectsZip } from '../utils/exportManager';

export default function Editor({ roomId, userName, userColor, onLeave }) {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(DEFAULT_PROJECTS[0].id);
  const [activeFileId, setActiveFileId] = useState(DEFAULT_PROJECTS[0].files[0].id);
  const [activities, setActivities] = useState([
    { id: 1, user: userName, color: userColor, text: 'opened the editor', time: new Date() }
  ]);
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [activityMinimized, setActivityMinimized] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getSavedTheme);
  const editorRef = useRef(null);
  const isFirstMount = useRef(true);
  const completionDisposables = useRef([]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activeFile = activeProject?.files.find(f => f.id === activeFileId) || activeProject?.files[0];

  // Apply saved theme on mount
  useEffect(() => { applyTheme(currentTheme); }, []);

  const addActivity = useCallback((text, user = userName, color = userColor) => {
    setActivities(prev => [{ id: Date.now(), user, color, text, time: new Date() }, ...prev].slice(0, 100));
  }, [userName, userColor]);

  const { status, users, error, bindEditor, updateCursor, syncProjects, ydoc } = useCollabEditor({
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

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (e.shiftKey) { handleSaveAll(); } else { handleSave(); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setShowSidebar(v => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setShowTerminal(v => !v);
      }
      if (e.key === 'F5') {
        e.preventDefault();
        handleRun();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        editorRef?.current?.trigger('keyboard','editor.action.quickCommand',null);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeFile]);

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    bindEditor(editor, monaco);
    editor.onDidChangeCursorPosition(e => {
      updateCursor({ lineNumber: e.position.lineNumber, column: e.position.column });
    });

    // Define all themes
    defineMonacoThemes(monaco);
    monaco.editor.setTheme(THEMES[currentTheme]?.monaco || 'codesync-dark');

    // Register completions
    completionDisposables.current.forEach(d => d());
    completionDisposables.current = [];
    const cleanupProject = registerProjectCompletions(monaco, projects, activeProjectId);
    completionDisposables.current.push(cleanupProject);
    const allFiles = projects.flatMap(p => p.files);
    const cleanupInline = registerInlineCompletion(monaco, () => editor.getValue(), activeFile?.language || 'javascript', allFiles);
    completionDisposables.current.push(cleanupInline);

    editor.updateOptions({
      inlineSuggest: { enabled: true, mode: 'prefix' },
      suggest: { showIcons: true, preview: true },
      quickSuggestions: { other: true, comments: false, strings: true },
    });
  }

  function handleThemeChange(themeKey) {
    setCurrentTheme(themeKey);
    applyTheme(themeKey);
    if (editorRef.current) {
      // Re-define and apply
      const monaco = window.monaco;
      if (monaco) monaco.editor.setTheme(THEMES[themeKey]?.monaco || 'codesync-dark');
    }
    addActivity(`changed theme to ${THEMES[themeKey]?.name}`);
  }

  function handleSave() {
    if (!activeFile) return;
    const content = editorRef?.current?.getValue() || activeFile.content;
    saveSingleFile({ ...activeFile, content });
    addActivity(`saved ${activeFile.name}`);
  }

  function handleSaveAll() {
    if (!activeProject) return;
    const updatedFiles = activeProject.files.map(f =>
      f.id === activeFile?.id ? { ...f, content: editorRef?.current?.getValue() || f.content } : f
    );
    exportProjectZip({ ...activeProject, files: updatedFiles });
    addActivity(`saved all files in ${activeProject.name}`);
  }

  function changeLanguage(langId) {
    const lang = LANGUAGES.find(l => l.id === langId);
    if (!lang || !activeFile) return;
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, files: p.files.map(f => f.id === activeFileId ? { ...f, language: langId } : f) } : p
    ));
    addActivity(`changed language to ${lang.label}`);
  }

  function handleFileSwitch(fileId) {
    const file = activeProject?.files.find(f => f.id === fileId);
    if (file) { setActiveFileId(fileId); addActivity(`switched to ${file.name}`); }
  }

  function handleProjectSwitch(projId) {
    const proj = projects.find(p => p.id === projId);
    if (proj) { setActiveProjectId(projId); setActiveFileId(proj.files[0].id); addActivity(`switched to project "${proj.name}"`); }
  }

  function copyRoomLink() {
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    addActivity('copied invite link');
  }

  async function handleRun() {
    if (!activeFile || running) return;
    setRunning(true);
    setRunResult(null);
    setShowTerminal(false);
    addActivity(`ran ${activeFile.name}`);
    const code = editorRef.current?.getValue() || activeFile.content;
    const result = await runCode(code, activeFile.language, stdin);
    setRunResult(result);
    setRunning(false);
  }

  function handleNewTerminal(split = false) {
    setShowTerminal(true);
    setRunResult(null);
  }

  function handleNewFile() {
    const name = prompt('File name (e.g. utils.js):');
    if (!name?.trim()) return;
    const ext = name.split('.').pop();
    const lang = LANGUAGES.find(l => l.ext === ext) || LANGUAGES[0];
    const file = { id: 'f_' + Date.now(), name: name.trim(), language: lang.id, content: lang.template || '' };
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, files: [...p.files, file] } : p));
    setActiveFileId(file.id);
    addActivity(`created ${name}`);
  }

  function handleNewProject() {
    const name = prompt('Project name:');
    if (!name?.trim()) return;
    const proj = { id: 'p_' + Date.now(), name: name.trim(), files: [{ id: 'f_' + Date.now(), name: 'main.js', language: 'javascript', content: '// Start coding!\n' }] };
    setProjects(prev => [...prev, proj]);
    setActiveProjectId(proj.id);
    setActiveFileId(proj.files[0].id);
    addActivity(`created project "${name}"`);
  }

  const lang = activeFile?.language;
  const runnable = canRun(lang) || isBrowserLang(lang);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* Top bar */}
      {!zenMode && (
        <TopBar roomId={roomId} userName={userName} userColor={userColor} users={users}
          status={status} onCopyLink={copyRoomLink} onLeave={onLeave}
          activeFile={activeFile} activeProject={activeProject} projects={projects} />
      )}

      {/* Menu bar */}
      {!zenMode && (
        <MenuBar
          activeFile={activeFile} activeProject={activeProject} projects={projects}
          onSave={handleSave} onSaveAll={handleSaveAll}
          onNewFile={handleNewFile} onNewProject={handleNewProject}
          onToggleSidebar={() => setShowSidebar(v => !v)}
          onToggleChat={() => setChatMinimized(v => !v)}
          onToggleActivity={() => setActivityMinimized(v => !v)}
          onToggleOutput={() => setRunResult(null)}
          onZenMode={() => setZenMode(v => !v)}
          onThemeChange={handleThemeChange} currentTheme={currentTheme}
          onRun={handleRun} onNewTerminal={handleNewTerminal}
          onLeave={onLeave} editorRef={editorRef}
        />
      )}

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', borderBottom: '1px solid rgba(248,113,113,0.2)', padding: '4px 16px', fontSize: '12px', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠</span> {error}
          {zenMode && <button onClick={() => setZenMode(false)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px' }}>Exit Zen Mode</button>}
        </div>
      )}

      {zenMode && (
        <div style={{ position: 'fixed', top: '8px', right: '12px', zIndex: 999 }}>
          <button onClick={() => setZenMode(false)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
            Exit Zen Mode
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        {showSidebar && !zenMode && (
          <ProjectManager
            projects={projects} setProjects={setProjects}
            activeProjectId={activeProjectId} setActiveProjectId={handleProjectSwitch}
            activeFileId={activeFileId} setActiveFileId={handleFileSwitch}
            users={users} addActivity={addActivity}
          />
        )}

        {/* Main editor area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* File tabs */}
          {!zenMode && (
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
                {(activeProject?.files || []).map(f => (
                  <div key={f.id} onClick={() => handleFileSwitch(f.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', fontSize: '12px', fontFamily: 'var(--font-code)', cursor: 'pointer', borderBottom: activeFileId===f.id ? '2px solid var(--accent)' : '2px solid transparent', color: activeFileId===f.id ? 'var(--text)' : 'var(--text-muted)', background: activeFileId===f.id ? 'var(--bg)' : 'transparent', whiteSpace: 'nowrap', transition: 'color 0.1s', flexShrink: 0 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getLangColor(f.language), display: 'inline-block', flexShrink: 0 }} />
                    {f.name}
                  </div>
                ))}
              </div>

              {/* Terminal button instead of language dropdown */}
              <button onClick={() => setShowTerminal(v => !v)}
                title="Toggle Terminal (Ctrl+`)"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0 4px', padding: '5px 10px', background: showTerminal ? 'var(--accent-dim)' : 'transparent', color: showTerminal ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${showTerminal ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-ui)', flexShrink: 0 }}>
                ⬛ Terminal
              </button>

              {/* Run button */}
              {runnable && (
                <button onClick={handleRun} disabled={running}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '0 8px 0 4px', padding: '5px 14px', background: running ? 'var(--surface2)' : '#34d399', color: running ? 'var(--text-muted)' : '#0d1117', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: running ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-ui)', flexShrink: 0 }}>
                  {running ? '⟳' : '▶'} {running ? 'Running...' : 'Run'}
                </button>
              )}
            </div>
          )}

          {/* Monaco editor */}
          {activeFile && (
            <MonacoEditor
              key={`${activeProjectId}-${activeFileId}`}
              height="100%"
              language={activeFile.language}
              theme={THEMES[currentTheme]?.monaco || 'codesync-dark'}
              defaultValue={activeFile.content}
              onMount={handleEditorMount}
              options={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", fontLigatures: true, lineHeight: 1.7, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: 'on', automaticLayout: true, tabSize: 2, cursorBlinking: 'smooth', smoothScrolling: true, padding: { top: 16, bottom: 16 }, renderLineHighlight: 'line', bracketPairColorization: { enabled: true }, suggest: { showIcons: true }, quickSuggestions: true }}
            />
          )}

          {/* Output panel */}
          {runResult !== null && !showTerminal && (
            <OutputPanel result={runResult} running={running}
              onClose={() => setRunResult(null)}
              stdin={stdin} setStdin={setStdin}
              showStdin={showStdin} setShowStdin={setShowStdin}
            />
          )}

          {/* Terminal panel */}
          {showTerminal && (
            <TerminalPanel activeFile={activeFile} editorRef={editorRef} onClose={() => setShowTerminal(false)} />
          )}
        </div>

        {/* Activity feed */}
        {!zenMode && (
          <ActivityFeed
            activities={activities} users={users}
            onClear={() => setActivities([])}
            minimized={activityMinimized}
            onToggle={() => setActivityMinimized(v => !v)}
          />
        )}

        {/* Chat panel */}
        {!zenMode && (
          <ChatPanel
            userName={userName} userColor={userColor} users={users} ydoc={ydoc}
            minimized={chatMinimized}
            onToggle={() => setChatMinimized(v => !v)}
          />
        )}
      </div>

      {!zenMode && (
        <StatusBar status={status} activeFile={activeFile} users={users} roomId={roomId} activeProject={activeProject} />
      )}
    </div>
  );
}
