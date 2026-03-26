import { useState, useRef, useEffect } from 'react';

let termCount = 0;
function newTerm(split = false) {
  termCount++;
  return { id: `term_${termCount}`, name: `Terminal ${termCount}`, lines: [{ type: 'info', text: `CodeSync Terminal ${termCount} — browser sandbox (read-only shell simulation)` }, { type: 'info', text: 'Type help for available commands.' }], input: '', split };
}

const FAKE_FS = {};

function processCommand(cmd, termId, setTerminals, activeFile, editorRef) {
  const parts = cmd.trim().split(/\s+/);
  const command = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  const push = (text, type = 'output') => {
    setTerminals(prev => prev.map(t => t.id === termId
      ? { ...t, lines: [...t.lines, { type, text }].slice(-200) }
      : t
    ));
  };

  switch(command) {
    case 'help':
      push('Available commands:', 'info');
      push('  clear          — clear terminal');
      push('  echo <text>    — print text');
      push('  pwd            — print working directory');
      push('  ls             — list files');
      push('  cat <file>     — show file content');
      push('  node <file>    — simulate node run');
      push('  python <file>  — simulate python run');
      push('  git status     — show git status');
      push('  git log        — show recent commits');
      push('  npm install    — simulate npm install');
      push('  npm start      — simulate npm start');
      push('  date           — show current date');
      push('  whoami         — show current user');
      break;
    case 'clear':
      setTerminals(prev => prev.map(t => t.id === termId ? { ...t, lines: [] } : t));
      break;
    case 'echo':
      push(args.join(' ') || '');
      break;
    case 'pwd':
      push('/workspace/codesync');
      break;
    case 'ls':
      push('client/  server/  docker-compose.yml  package.json  README.md  .gitignore');
      break;
    case 'date':
      push(new Date().toString());
      break;
    case 'whoami':
      push('codesync-user');
      break;
    case 'git':
      if (args[0] === 'status') {
        push('On branch main');
        push('Your branch is up to date with origin/main.');
        push('nothing to commit, working tree clean');
      } else if (args[0] === 'log') {
        push('commit a1b2c3d (HEAD -> main, origin/main)');
        push('Author: Ajit Mukund Joshi <ajitjoshi810@gmail.com>');
        push(`Date:   ${new Date().toDateString()}`);
        push('    feat: add AI completions, chat, task manager');
      } else {
        push(`git: '${args[0]}' is not available in browser terminal`);
      }
      break;
    case 'npm':
      if (args[0] === 'install') {
        push('npm warn: browser sandbox — simulating install');
        push('added 247 packages in 3s');
        push('found 0 vulnerabilities');
      } else if (args[0] === 'start') {
        push('> codesync-client@1.0.0 start');
        push('> react-scripts start');
        push('Starting development server...', 'info');
        push('Compiled successfully!', 'success');
        push('Local: http://localhost:3000');
      } else {
        push(`npm ${args.join(' ')} — not available in browser sandbox`);
      }
      break;
    case 'node':
    case 'python':
    case 'python3':
      if (args[0]) {
        push(`${command}: use the Run button in the editor to execute ${args[0]}`, 'info');
      } else {
        push(`${command} REPL not available in browser — use Run button`, 'info');
      }
      break;
    case 'cat':
      if (args[0] && activeFile) {
        if (args[0] === activeFile.name) {
          const content = editorRef?.current?.getValue() || activeFile.content || '';
          content.split('\n').forEach(line => push(line));
        } else {
          push(`cat: ${args[0]}: File available in editor sidebar`);
        }
      } else {
        push('cat: specify a filename');
      }
      break;
    case '':
      break;
    default:
      push(`${command}: command not found — type 'help' for available commands`, 'error');
  }
}

export default function TerminalPanel({ activeFile, editorRef, onClose }) {
  const [terminals, setTerminals] = useState([newTerm()]);
  const [activeTermId, setActiveTermId] = useState(terminals[0].id);
  const inputRef = useRef(null);
  const feedRef = useRef(null);

  const activeTerm = terminals.find(t => t.id === activeTermId) || terminals[0];

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [activeTerm?.lines]);

  function handleKey(e) {
    if (e.key === 'Enter') {
      const cmd = activeTerm.input;
      // Add command to lines
      setTerminals(prev => prev.map(t => t.id === activeTermId
        ? { ...t, lines: [...t.lines, { type: 'command', text: `$ ${cmd}` }], input: '' }
        : t
      ));
      processCommand(cmd, activeTermId, setTerminals, activeFile, editorRef);
    }
  }

  function setInput(val) {
    setTerminals(prev => prev.map(t => t.id === activeTermId ? { ...t, input: val } : t));
  }

  function addTerminal(split = false) {
    const term = newTerm(split);
    setTerminals(prev => [...prev, term]);
    setActiveTermId(term.id);
  }

  function closeTerminal(id) {
    if (terminals.length === 1) { onClose(); return; }
    const remaining = terminals.filter(t => t.id !== id);
    setTerminals(remaining);
    if (activeTermId === id) setActiveTermId(remaining[remaining.length - 1].id);
  }

  const lineColors = { command: 'var(--accent)', output: 'var(--text)', error: 'var(--red)', info: 'var(--text-muted)', success: 'var(--green)' };

  return (
    <div style={{ height: '220px', borderTop: '1px solid var(--border)', background: '#080a0f', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

      {/* Terminal tabs bar */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0, height: '30px' }}>
        <div style={{ display: 'flex', flex: 1, overflowX: 'auto', height: '100%' }}>
          {terminals.map(term => (
            <div key={term.id}
              onClick={() => setActiveTermId(term.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px', fontSize: '11px', cursor: 'pointer', borderBottom: activeTermId === term.id ? '2px solid var(--accent)' : '2px solid transparent', color: activeTermId === term.id ? 'var(--text)' : 'var(--text-muted)', background: activeTermId === term.id ? 'var(--bg)' : 'transparent', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <span style={{ fontSize: '12px' }}>⬛</span>
              {term.name}
              <span onClick={e => { e.stopPropagation(); closeTerminal(term.id); }}
                style={{ fontSize: '12px', color: 'var(--text-faint)', cursor: 'pointer', marginLeft: '2px' }}>×</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', padding: '0 8px', flexShrink: 0 }}>
          <button onClick={() => addTerminal()} title="New terminal"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: '0 4px', lineHeight: 1 }}>+</button>
          <button onClick={onClose} title="Close panel"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>✕</button>
        </div>
      </div>

      {/* Terminal output */}
      <div ref={feedRef} onClick={() => inputRef.current?.focus()}
        style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', fontFamily: 'var(--font-code)', fontSize: '12px', lineHeight: '1.6', cursor: 'text' }}>
        {activeTerm?.lines.map((line, i) => (
          <div key={i} style={{ color: lineColors[line.type] || 'var(--text)' }}>
            {line.text}
          </div>
        ))}
        {/* Input line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <span style={{ color: 'var(--green)' }}>$</span>
          <input
            ref={inputRef}
            value={activeTerm?.input || ''}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-code)', fontSize: '12px' }}
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
