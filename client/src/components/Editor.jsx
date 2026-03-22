import { useState, useCallback, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useCollabEditor } from '../hooks/useCollabEditor';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ActivityFeed from './ActivityFeed';
import StatusBar from './StatusBar';

const DEFAULT_FILES = [
  { name: 'main.js', language: 'javascript', content: '// CodeSync — Real-Time Collaborative Editor\n// Start coding! Changes sync instantly across all users.\n\nfunction greet(name) {\n  return `Hello, ${name}! Welcome to CodeSync.`;\n}\n\nconsole.log(greet("World"));\n' },
  { name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello from CodeSync!</h1>\n  <script src="main.js"></script>\n</body>\n</html>\n' },
  { name: 'style.css', language: 'css', content: '* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\nbody {\n  font-family: system-ui, sans-serif;\n  background: #f8fafc;\n  color: #1e293b;\n  padding: 2rem;\n}\n\nh1 {\n  font-size: 2rem;\n  color: #4f8ef7;\n}\n' },
  { name: 'README.md', language: 'markdown', content: '# My Project\n\nBuilt with CodeSync — real-time collaborative editor.\n\n## Features\n- Live collaboration\n- CRDT-based conflict resolution\n- Multi-file support\n\n## Getting Started\n```bash\nnpm install\nnpm start\n```\n' }
];

export default function Editor({ roomId, userName, userColor, onLeave }) {
  const [activeFile, setActiveFile] = useState(DEFAULT_FILES[0]);
  const [activities, setActivities] = useState([
    { id: 1, user: userName, color: userColor, text: `opened ${DEFAULT_FILES[0].name}`, time: new Date() }
  ]);
  const editorRef = useRef(null);

  const addActivity = useCallback((text, user = userName, color = userColor) => {
    setActivities(prev => [{
      id: Date.now(),
      user, color, text, time: new Date()
    }, ...prev].slice(0, 30));
  }, [userName, userColor]);

  const { status, users, error, bindEditor, updateCursor } = useCollabEditor({
    roomId,
    userName,
    userColor,
    fileName: activeFile.name
  });

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    bindEditor(editor, monaco);

    editor.onDidChangeCursorPosition(e => {
      updateCursor({ lineNumber: e.position.lineNumber, column: e.position.column });
    });

    // Custom theme
    monaco.editor.defineTheme('codesync-dark', {
      base: 'vs-dark',
      inherit: true,
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

  function switchFile(file) {
    setActiveFile(file);
    addActivity(`switched to ${file.name}`);
  }

  function copyRoomLink() {
    const url = `${window.location.origin}?room=${roomId}&name=Guest`;
    navigator.clipboard?.writeText(url).catch(() => {});
    addActivity('copied invite link');
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
      <TopBar
        roomId={roomId}
        userName={userName}
        userColor={userColor}
        users={users}
        status={status}
        onCopyLink={copyRoomLink}
        onLeave={onLeave}
      />

      {error && (
        <div style={{ background:'rgba(248,113,113,0.1)', borderBottom:'1px solid rgba(248,113,113,0.2)', padding:'6px 16px', fontSize:'12px', color:'var(--red)', display:'flex', alignItems:'center', gap:'8px' }}>
          <span>⚠</span> {error} &nbsp;
          <span style={{ color:'var(--text-muted)' }}>Your edits are saved locally.</span>
        </div>
      )}

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <Sidebar
          files={DEFAULT_FILES}
          activeFile={activeFile}
          users={users}
          onSelectFile={switchFile}
        />

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Tabs */}
          <div style={{ display:'flex', background:'var(--surface)', borderBottom:'1px solid var(--border)', flexShrink:0, overflowX:'auto' }}>
            {DEFAULT_FILES.slice(0, 3).map(f => (
              <div
                key={f.name}
                onClick={() => switchFile(f)}
                style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', fontSize:'12px', fontFamily:'var(--font-code)', cursor:'pointer', borderBottom: activeFile.name===f.name ? '2px solid var(--accent)' : '2px solid transparent', color: activeFile.name===f.name ? 'var(--text)' : 'var(--text-muted)', background: activeFile.name===f.name ? 'var(--bg)' : 'transparent', whiteSpace:'nowrap', transition:'color 0.1s' }}
              >
                <FileIcon name={f.name} />
                {f.name}
              </div>
            ))}
          </div>

          <MonacoEditor
            height="100%"
            language={activeFile.language}
            theme="codesync-dark"
            defaultValue={activeFile.content}
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              fontLigatures: true,
              lineHeight: 1.7,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              padding: { top: 16, bottom: 16 },
              renderLineHighlight: 'line',
              bracketPairColorization: { enabled: true },
              suggest: { showIcons: true },
              quickSuggestions: true,
            }}
          />
        </div>

        <ActivityFeed activities={activities} users={users} />
      </div>

      <StatusBar
        status={status}
        activeFile={activeFile}
        users={users}
        roomId={roomId}
      />
    </div>
  );
}

function FileIcon({ name }) {
  const ext = name.split('.').pop();
  const colors = { js: '#fbbf24', jsx: '#38bdf8', ts: '#4f8ef7', tsx: '#4f8ef7', html: '#f87171', css: '#a78bfa', md: '#34d399', json: '#fb923c', py: '#34d399' };
  return <span style={{ width:'7px', height:'7px', borderRadius:'50%', background: colors[ext] || '#888', display:'inline-block', flexShrink:0 }} />;
}
