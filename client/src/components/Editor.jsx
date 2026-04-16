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
import { saveSingleFile, exportProjectZip } from '../utils/exportManager';

export default function Editor({ roomId, userName, userColor, onLeave }) {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState(DEFAULT_PROJECTS[0].id);
  const [activeFileId, setActiveFileId] = useState(DEFAULT_PROJECTS[0].files[0].id);

  const [activities, setActivities] = useState([]);
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);

  const [showTerminal, setShowTerminal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showChat, setShowChat] = useState(true);

  const [activityMinimized, setActivityMinimized] = useState(false);
  const [chatMinimized, setChatMinimized] = useState(false);

  const [zenMode, setZenMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(getSavedTheme());

  const editorRef = useRef(null);
  const isFirstMount = useRef(true);
  const completionDisposables = useRef([]);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activeFile = activeProject?.files?.find(f => f.id === activeFileId) || activeProject?.files?.[0];

  // ✅ CRASH PREVENTION
  if (!activeProject || !activeFile) {
    return <div style={{ color: "white" }}>Loading editor...</div>;
  }

  const addActivity = useCallback((text) => {
    setActivities(prev => [{ id: Date.now(), text }, ...prev]);
  }, []);

  const { status, users, error, bindEditor, updateCursor, syncProjects, ydoc } =
    useCollabEditor({
      roomId,
      userName,
      userColor,
      fileName: `${activeProjectId}___${activeFile?.id}`,
      projects,
      setProjects
    });

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    syncProjects(projects);
  }, [projects]);

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;

    try {
      bindEditor(editor, monaco);
    } catch (e) {
      console.error("Editor binding crash:", e);
    }

    editor.onDidChangeCursorPosition(e => {
      updateCursor({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });

    defineMonacoThemes(monaco);
    monaco.editor.setTheme(THEMES[currentTheme]?.monaco || 'vs-dark');
  }

  async function handleRun() {
    if (!activeFile || running) return;

    setRunning(true);
    addActivity(`Running ${activeFile.name}`);

    try {
      const code = editorRef.current?.getValue() || '';
      const result = await runCode(code, activeFile.language);
      setRunResult(result);
    } catch (e) {
      console.error(e);
    }

    setRunning(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {!zenMode && (
        <TopBar
          roomId={roomId}
          users={users}
          status={status}
          onLeave={onLeave}
        />
      )}

      {!zenMode && (
        <MenuBar
          onRun={handleRun}
          onToggleSidebar={() => setShowSidebar(v => !v)}
          onToggleChat={() => setChatMinimized(v => !v)}
          onToggleActivity={() => setActivityMinimized(v => !v)}
        />
      )}

      {error && (
        <div style={{ color: 'red', padding: 5 }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1 }}>

        {showSidebar && !zenMode && (
          <ProjectManager
            projects={projects}
            setProjects={setProjects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            activeFileId={activeFileId}
            setActiveFileId={setActiveFileId}
          />
        )}

        <div style={{ flex: 1 }}>

          <MonacoEditor
            height="100%"
            language={activeFile.language}
            defaultValue={activeFile.content}
            onMount={handleEditorMount}
          />

          {runResult && (
            <OutputPanel result={runResult} running={running} />
          )}

          {showTerminal && (
            <TerminalPanel
              activeFile={activeFile}
              onClose={() => setShowTerminal(false)}
            />
          )}
        </div>

        {!zenMode && (
          <ActivityFeed
            activities={activities}
            minimized={activityMinimized}
            onToggle={() => setActivityMinimized(v => !v)}
          />
        )}

        {/* ✅ SAFE CHAT PANEL (CRASH FIX) */}
        {!zenMode && ydoc && (
          <ChatPanel
            userName={userName}
            userColor={userColor}
            users={users}
            ydoc={ydoc}
            minimized={chatMinimized}
            onToggle={() => setChatMinimized(v => !v)}
          />
        )}
      </div>

      {!zenMode && (
        <StatusBar status={status} users={users} roomId={roomId} />
      )}
    </div>
  );
}
