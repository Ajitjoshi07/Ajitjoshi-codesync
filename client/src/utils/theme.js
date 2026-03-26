export const THEMES = {
  dark: {
    name: 'Dark',
    icon: '🌙',
    vars: {
      '--bg': '#0d0f14',
      '--surface': '#151820',
      '--surface2': '#1c2030',
      '--border': 'rgba(255,255,255,0.08)',
      '--border-hover': 'rgba(255,255,255,0.15)',
      '--accent': '#4f8ef7',
      '--accent-dim': 'rgba(79,142,247,0.15)',
      '--purple': '#a78bfa',
      '--green': '#34d399',
      '--yellow': '#fbbf24',
      '--red': '#f87171',
      '--text': '#e2e8f0',
      '--text-muted': '#6b7694',
      '--text-faint': '#3d4460',
      '--font-ui': "'Syne', sans-serif",
      '--font-code': "'JetBrains Mono', monospace",
      '--radius': '8px',
    },
    monaco: 'codesync-dark',
    monacoBase: 'vs-dark',
  },
  light: {
    name: 'Light',
    icon: '☀️',
    vars: {
      '--bg': '#ffffff',
      '--surface': '#f8f9fc',
      '--surface2': '#f0f2f7',
      '--border': 'rgba(0,0,0,0.1)',
      '--border-hover': 'rgba(0,0,0,0.2)',
      '--accent': '#2563eb',
      '--accent-dim': 'rgba(37,99,235,0.1)',
      '--purple': '#7c3aed',
      '--green': '#059669',
      '--yellow': '#d97706',
      '--red': '#dc2626',
      '--text': '#1e293b',
      '--text-muted': '#64748b',
      '--text-faint': '#94a3b8',
      '--font-ui': "'Syne', sans-serif",
      '--font-code': "'JetBrains Mono', monospace",
      '--radius': '8px',
    },
    monaco: 'codesync-light',
    monacoBase: 'vs',
  },
  monokai: {
    name: 'Monokai',
    icon: '🎨',
    vars: {
      '--bg': '#272822',
      '--surface': '#1e1f1c',
      '--surface2': '#2d2e2a',
      '--border': 'rgba(255,255,255,0.06)',
      '--border-hover': 'rgba(255,255,255,0.12)',
      '--accent': '#a6e22e',
      '--accent-dim': 'rgba(166,226,46,0.15)',
      '--purple': '#ae81ff',
      '--green': '#a6e22e',
      '--yellow': '#e6db74',
      '--red': '#f92672',
      '--text': '#f8f8f2',
      '--text-muted': '#75715e',
      '--text-faint': '#49483e',
      '--font-ui': "'Syne', sans-serif",
      '--font-code': "'JetBrains Mono', monospace",
      '--radius': '8px',
    },
    monaco: 'codesync-monokai',
    monacoBase: 'vs-dark',
  },
  nord: {
    name: 'Nord',
    icon: '❄️',
    vars: {
      '--bg': '#2e3440',
      '--surface': '#3b4252',
      '--surface2': '#434c5e',
      '--border': 'rgba(255,255,255,0.08)',
      '--border-hover': 'rgba(255,255,255,0.15)',
      '--accent': '#88c0d0',
      '--accent-dim': 'rgba(136,192,208,0.15)',
      '--purple': '#b48ead',
      '--green': '#a3be8c',
      '--yellow': '#ebcb8b',
      '--red': '#bf616a',
      '--text': '#eceff4',
      '--text-muted': '#d8dee9',
      '--text-faint': '#4c566a',
      '--font-ui': "'Syne', sans-serif",
      '--font-code': "'JetBrains Mono', monospace",
      '--radius': '8px',
    },
    monaco: 'codesync-nord',
    monacoBase: 'vs-dark',
  },
  solarized: {
    name: 'Solarized',
    icon: '🌅',
    vars: {
      '--bg': '#fdf6e3',
      '--surface': '#eee8d5',
      '--surface2': '#e8e2cf',
      '--border': 'rgba(0,0,0,0.1)',
      '--border-hover': 'rgba(0,0,0,0.2)',
      '--accent': '#268bd2',
      '--accent-dim': 'rgba(38,139,210,0.1)',
      '--purple': '#6c71c4',
      '--green': '#859900',
      '--yellow': '#b58900',
      '--red': '#dc322f',
      '--text': '#657b83',
      '--text-muted': '#839496',
      '--text-faint': '#93a1a1',
      '--font-ui': "'Syne', sans-serif",
      '--font-code': "'JetBrains Mono', monospace",
      '--radius': '8px',
    },
    monaco: 'codesync-solarized',
    monacoBase: 'vs',
  },
};

export function applyTheme(themeKey) {
  const theme = THEMES[themeKey];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
  localStorage.setItem('cs_theme', themeKey);
}

export function getSavedTheme() {
  return localStorage.getItem('cs_theme') || 'dark';
}

export function defineMonacoThemes(monaco) {
  // Dark
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
    }
  });
  // Light
  monaco.editor.defineTheme('codesync-light', {
    base: 'vs', inherit: true,
    rules: [
      { token: 'comment', foreground: '6b7694', fontStyle: 'italic' },
      { token: 'keyword', foreground: '7c3aed' },
      { token: 'string', foreground: '059669' },
      { token: 'number', foreground: 'd97706' },
      { token: 'function', foreground: '2563eb' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#1e293b',
      'editorLineNumber.foreground': '#94a3b8',
      'editor.lineHighlightBackground': '#f8f9fc',
      'editorCursor.foreground': '#2563eb',
    }
  });
  // Monokai
  monaco.editor.defineTheme('codesync-monokai', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'function', foreground: 'a6e22e' },
    ],
    colors: { 'editor.background': '#272822', 'editor.foreground': '#f8f8f2' }
  });
  // Nord
  monaco.editor.defineTheme('codesync-nord', {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'comment', foreground: '4c566a', fontStyle: 'italic' },
      { token: 'keyword', foreground: '81a1c1' },
      { token: 'string', foreground: 'a3be8c' },
      { token: 'number', foreground: 'b48ead' },
      { token: 'function', foreground: '88c0d0' },
    ],
    colors: { 'editor.background': '#2e3440', 'editor.foreground': '#eceff4' }
  });
  // Solarized
  monaco.editor.defineTheme('codesync-solarized', {
    base: 'vs', inherit: true,
    rules: [
      { token: 'comment', foreground: '93a1a1', fontStyle: 'italic' },
      { token: 'keyword', foreground: '859900' },
      { token: 'string', foreground: '2aa198' },
      { token: 'number', foreground: 'd33682' },
      { token: 'function', foreground: '268bd2' },
    ],
    colors: { 'editor.background': '#fdf6e3', 'editor.foreground': '#657b83' }
  });
}
