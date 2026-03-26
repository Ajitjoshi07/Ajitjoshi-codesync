import { useState, useRef, useEffect } from 'react';
import { THEMES } from '../utils/theme';

function DropMenu({ label, items, theme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ padding: '3px 8px', fontSize: '12px', background: open ? 'var(--surface2)' : 'transparent', color: 'var(--text-muted)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-ui)', transition: 'all 0.1s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        {label}
      </button>
      {open && (
        <div style={{ position: 'fixed', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', minWidth: '200px', zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', padding: '4px' }}>
          {items.map((item, i) => item === 'divider' ? (
            <div key={i} style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
          ) : (
            <button key={item.label} onClick={() => { item.action(); setOpen(false); }}
              disabled={item.disabled}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 10px', background: 'transparent', border: 'none', cursor: item.disabled ? 'default' : 'pointer', fontSize: '12px', color: item.disabled ? 'var(--text-faint)' : item.danger ? 'var(--red)' : 'var(--text)', fontFamily: 'var(--font-ui)', borderRadius: '5px', textAlign: 'left', transition: 'background 0.1s', opacity: item.disabled ? 0.5 : 1 }}
              onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = 'var(--surface2)'; }}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.icon && <span style={{ fontSize: '13px', width: '16px' }}>{item.icon}</span>}
                {item.label}
              </span>
              {item.shortcut && <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-code)' }}>{item.shortcut}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuBar({
  activeFile, activeProject, projects,
  onSave, onSaveAll, onNewFile, onNewProject,
  onUndo, onRedo, onFind, onFindReplace,
  onToggleSidebar, onToggleChat, onToggleActivity, onToggleOutput,
  onZenMode, onThemeChange, currentTheme,
  onRun, onNewTerminal,
  onLeave, editorRef
}) {
  function execEdit(cmd) {
    editorRef?.current?.focus();
    document.execCommand(cmd);
  }

  function selectAll() {
    editorRef?.current?.focus();
    editorRef?.current?.setSelection(editorRef.current.getModel().getFullModelRange());
  }

  const menus = [
    {
      label: 'File',
      items: [
        { icon: '📄', label: 'New File', shortcut: 'Ctrl+N', action: onNewFile },
        { icon: '📁', label: 'New Project', action: onNewProject },
        'divider',
        { icon: '💾', label: 'Save', shortcut: 'Ctrl+S', action: onSave },
        { icon: '💾', label: 'Save All', shortcut: 'Ctrl+Shift+S', action: onSaveAll },
        'divider',
        { icon: '🚪', label: 'Leave Room', action: onLeave, danger: true },
      ]
    },
    {
      label: 'Edit',
      items: [
        { icon: '↩', label: 'Undo', shortcut: 'Ctrl+Z', action: () => editorRef?.current?.trigger('keyboard','undo',null) },
        { icon: '↪', label: 'Redo', shortcut: 'Ctrl+Y', action: () => editorRef?.current?.trigger('keyboard','redo',null) },
        'divider',
        { icon: '✂️', label: 'Cut', shortcut: 'Ctrl+X', action: () => editorRef?.current?.trigger('keyboard','editor.action.clipboardCutAction',null) },
        { icon: '📋', label: 'Copy', shortcut: 'Ctrl+C', action: () => editorRef?.current?.trigger('keyboard','editor.action.clipboardCopyAction',null) },
        { icon: '📌', label: 'Paste', shortcut: 'Ctrl+V', action: () => editorRef?.current?.focus() },
        'divider',
        { icon: '🔍', label: 'Find', shortcut: 'Ctrl+F', action: () => editorRef?.current?.trigger('keyboard','actions.find',null) },
        { icon: '🔄', label: 'Find & Replace', shortcut: 'Ctrl+H', action: () => editorRef?.current?.trigger('keyboard','editor.action.startFindReplaceAction',null) },
        'divider',
        { icon: '⬆️', label: 'Move Line Up', shortcut: 'Alt+↑', action: () => editorRef?.current?.trigger('keyboard','editor.action.moveLinesUpAction',null) },
        { icon: '⬇️', label: 'Move Line Down', shortcut: 'Alt+↓', action: () => editorRef?.current?.trigger('keyboard','editor.action.moveLinesDownAction',null) },
        { icon: '🗑️', label: 'Delete Line', shortcut: 'Ctrl+Shift+K', action: () => editorRef?.current?.trigger('keyboard','editor.action.deleteLines',null) },
      ]
    },
    {
      label: 'Selection',
      items: [
        { icon: '📝', label: 'Select All', shortcut: 'Ctrl+A', action: selectAll },
        'divider',
        { icon: '⬆️', label: 'Add Cursor Above', shortcut: 'Ctrl+Alt+↑', action: () => editorRef?.current?.trigger('keyboard','editor.action.insertCursorAbove',null) },
        { icon: '⬇️', label: 'Add Cursor Below', shortcut: 'Ctrl+Alt+↓', action: () => editorRef?.current?.trigger('keyboard','editor.action.insertCursorBelow',null) },
        { icon: '🔤', label: 'Select All Occurrences', shortcut: 'Ctrl+Shift+L', action: () => editorRef?.current?.trigger('keyboard','editor.action.selectHighlights',null) },
        { icon: '📌', label: 'Add Next Occurrence', shortcut: 'Ctrl+D', action: () => editorRef?.current?.trigger('keyboard','editor.action.addSelectionToNextFindMatch',null) },
      ]
    },
    {
      label: 'View',
      items: [
        { icon: '📂', label: 'Toggle Sidebar', shortcut: 'Ctrl+B', action: onToggleSidebar },
        { icon: '💬', label: 'Toggle Chat', action: onToggleChat },
        { icon: '📋', label: 'Toggle Activity', action: onToggleActivity },
        { icon: '▶️', label: 'Toggle Output', action: onToggleOutput },
        'divider',
        { icon: '🧘', label: 'Zen Mode', shortcut: 'Ctrl+K Z', action: onZenMode },
        'divider',
        ...Object.entries(THEMES).map(([key, t]) => ({
          icon: t.icon,
          label: `${t.name} Theme${currentTheme === key ? ' ✓' : ''}`,
          action: () => onThemeChange(key)
        })),
      ]
    },
    {
      label: 'Go',
      items: [
        { icon: '📍', label: 'Go to Line', shortcut: 'Ctrl+G', action: () => editorRef?.current?.trigger('keyboard','editor.action.gotoLine',null) },
        { icon: '🔤', label: 'Go to Symbol', shortcut: 'Ctrl+Shift+O', action: () => editorRef?.current?.trigger('keyboard','editor.action.gotoSymbol',null) },
        'divider',
        { icon: '⬅️', label: 'Go Back', shortcut: 'Alt+←', action: () => editorRef?.current?.trigger('keyboard','workbench.action.navigateBack',null) },
        { icon: '➡️', label: 'Go Forward', shortcut: 'Alt+→', action: () => editorRef?.current?.trigger('keyboard','workbench.action.navigateForward',null) },
        'divider',
        { icon: '🔝', label: 'Go to Top', shortcut: 'Ctrl+Home', action: () => editorRef?.current?.revealLine(1) },
        { icon: '🔚', label: 'Go to Bottom', shortcut: 'Ctrl+End', action: () => { const lines = editorRef?.current?.getModel()?.getLineCount(); if(lines) editorRef?.current?.revealLine(lines); } },
      ]
    },
    {
      label: 'Run',
      items: [
        { icon: '▶️', label: 'Run File', shortcut: 'F5', action: onRun },
        'divider',
        { icon: '🔴', label: 'Stop', shortcut: 'Shift+F5', action: () => {} },
      ]
    },
    {
      label: 'Terminal',
      items: [
        { icon: '➕', label: 'New Terminal', shortcut: 'Ctrl+`', action: onNewTerminal },
        { icon: '🔄', label: 'Split Terminal', action: () => onNewTerminal(true) },
      ]
    },
    {
      label: 'Help',
      items: [
        { icon: '⌨️', label: 'Keyboard Shortcuts', action: () => window.open('https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf','_blank') },
        { icon: '🐛', label: 'Report Issue', action: () => window.open('https://github.com/Ajitjoshi07/Ajitjoshi-codesync/issues','_blank') },
        { icon: '⭐', label: 'Star on GitHub', action: () => window.open('https://github.com/Ajitjoshi07/Ajitjoshi-codesync','_blank') },
      ]
    },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0 8px', height: '28px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      {menus.map(menu => (
        <DropMenu key={menu.label} label={menu.label} items={menu.items} />
      ))}
    </div>
  );
}
