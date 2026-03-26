const TOKEN_COLORS = {
  keyword:  '#c678dd', string:   '#98c379', comment:  '#5c6370',
  number:   '#d19a66', type:     '#e5c07b', function: '#61afef',
  operator: '#56b6c2', default:  '#abb2bf',
};

const PATTERNS = {
  javascript: [
    { regex: /(\/\/.*$)/gm,                                                   type:'comment'  },
    { regex: /(\/\*[\s\S]*?\*\/)/g,                                           type:'comment'  },
    { regex: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,    type:'string'   },
    { regex: /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|from|new|this|typeof|async|await|try|catch|finally|throw|switch|case|break|continue|of|in|extends|super|static|null|undefined|true|false)\b/g, type:'keyword' },
    { regex: /\b([A-Z][a-zA-Z0-9]*)\b/g,                                     type:'type'     },
    { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,                      type:'function' },
    { regex: /\b(\d+\.?\d*)\b/g,                                              type:'number'   },
  ],
  python: [
    { regex: /(#.*$)/gm,                                                      type:'comment'  },
    { regex: /("""[\s\S]*?"""|'''[\s\S]*?''')/g,                              type:'string'   },
    { regex: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,                       type:'string'   },
    { regex: /\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|pass|break|continue|lambda|yield|True|False|None|and|or|not|in|is|async|await)\b/g, type:'keyword' },
    { regex: /\b([A-Z][a-zA-Z0-9]*)\b/g,                                     type:'type'     },
    { regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,                        type:'function' },
    { regex: /\b(\d+\.?\d*)\b/g,                                              type:'number'   },
  ],
  java: [
    { regex: /(\/\/.*$)/gm,                                                   type:'comment'  },
    { regex: /(\/\*[\s\S]*?\*\/)/g,                                           type:'comment'  },
    { regex: /("(?:[^"\\]|\\.)*")/g,                                          type:'string'   },
    { regex: /\b(public|private|protected|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|static|final|abstract|void|int|long|double|float|boolean|char|null|true|false|this|super)\b/g, type:'keyword' },
    { regex: /\b([A-Z][a-zA-Z0-9]*)\b/g,                                     type:'type'     },
    { regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,                        type:'function' },
    { regex: /\b(\d+\.?\d*)\b/g,                                              type:'number'   },
  ],
};
PATTERNS.typescript = PATTERNS.javascript;
PATTERNS.jsx        = PATTERNS.javascript;
PATTERNS.tsx        = PATTERNS.javascript;
PATTERNS.cpp        = PATTERNS.java;
PATTERNS.csharp     = PATTERNS.java;
PATTERNS.go         = PATTERNS.javascript;
PATTERNS.rust       = PATTERNS.javascript;
PATTERNS.ruby       = PATTERNS.python;
PATTERNS.php        = PATTERNS.javascript;
PATTERNS.swift      = PATTERNS.java;
PATTERNS.kotlin     = PATTERNS.java;
PATTERNS.shell      = PATTERNS.python;
PATTERNS.sql        = [];
PATTERNS.json       = [
  { regex: /("(?:[^"\\]|\\.)*")\s*:/g,   type:'keyword' },
  { regex: /:\s*("(?:[^"\\]|\\.)*")/g,   type:'string'  },
  { regex: /\b(true|false|null)\b/g,      type:'number'  },
  { regex: /\b(\d+\.?\d*)\b/g,           type:'number'  },
];
PATTERNS.markdown = [];
PATTERNS.html = [
  { regex: /(<!--[\s\S]*?-->)/g,          type:'comment' },
  { regex: /("(?:[^"\\]|\\.)*")/g,        type:'string'  },
  { regex: /(<\/?[a-zA-Z][a-zA-Z0-9]*)/g, type:'keyword' },
  { regex: /\b([a-zA-Z-]+=)/g,            type:'function'},
];
PATTERNS.css = [
  { regex: /(\/\*[\s\S]*?\*\/)/g,         type:'comment' },
  { regex: /("(?:[^"\\]|\\.)*")/g,        type:'string'  },
  { regex: /([.#][a-zA-Z][a-zA-Z0-9_-]*)(?=[\s{,])/g, type:'function' },
  { regex: /\b([\w-]+)\s*(?=:)/g,         type:'keyword' },
  { regex: /#[0-9a-fA-F]{3,8}/g,          type:'number'  },
  { regex: /\b(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms)?\b/g, type:'number' },
];

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function tokenize(code, language) {
  const patterns = PATTERNS[language] || PATTERNS.javascript;
  if (!patterns.length) return escapeHtml(code);
  const len = code.length;
  const tags = new Array(len).fill(null);
  patterns.forEach(({ regex, type }) => {
    regex.lastIndex = 0;
    let m;
    while ((m = regex.exec(code)) !== null) {
      for (let i = m.index; i < m.index + m[0].length; i++) {
        if (!tags[i]) tags[i] = type;
      }
    }
  });
  let html = '';
  let i = 0;
  while (i < len) {
    const type = tags[i];
    if (!type) { html += escapeHtml(code[i]); i++; }
    else {
      let j = i;
      while (j < len && tags[j] === type) j++;
      const color = TOKEN_COLORS[type] || TOKEN_COLORS.default;
      html += `<span style="color:${color}">${escapeHtml(code.slice(i, j))}</span>`;
      i = j;
    }
  }
  return html;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = url; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ─── 1. Save raw file ───
export function saveSingleFile(file) {
  const blob = new Blob([file.content || ''], { type: 'text/plain' });
  triggerDownload(blob, file.name);
}

// ─── 2. Copy to clipboard ───
export async function copyToClipboard(file) {
  await navigator.clipboard.writeText(file.content || '');
}

// ─── 3. Export Markdown ───
export function exportMarkdown(file) {
  const ext = file.name.split('.').pop();
  const md = `# ${file.name}\n\n\`\`\`${ext}\n${file.content || ''}\n\`\`\`\n`;
  triggerDownload(new Blob([md], { type: 'text/markdown' }), file.name.replace(/\.[^.]+$/, '.md'));
}

// ─── 4. Export HTML ───
export function exportHTML(file) {
  const highlighted = tokenize(file.content || '', file.language);
  const lines = highlighted.split('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${file.name}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0f14;color:#abb2bf;font-family:'JetBrains Mono','Courier New',monospace;font-size:14px;line-height:1.7}
.header{background:#151820;border-bottom:1px solid #2a2f45;padding:14px 24px;display:flex;align-items:center;gap:16px}
.filename{color:#4f8ef7;font-weight:700;font-size:16px}
.lang{background:#1c2030;border:1px solid #2a2f45;border-radius:12px;padding:3px 10px;font-size:11px;color:#6b7694}
.stats{color:#6b7694;font-size:11px;margin-left:auto}
.code-wrap{padding:20px 0}
.line{display:flex;min-height:1.7em}
.line:hover{background:rgba(255,255,255,0.03)}
.ln{min-width:52px;padding:0 16px 0 24px;text-align:right;color:#3d4460;user-select:none;flex-shrink:0}
.lc{padding:0 24px 0 0;white-space:pre;flex:1}
.footer{text-align:center;padding:24px;color:#3d4460;font-size:11px;border-top:1px solid #1c2030;margin-top:20px}
</style>
</head>
<body>
<div class="header">
<span class="filename">${file.name}</span>
<span class="lang">${file.language}</span>
<span class="stats">${(file.content||'').split('\n').length} lines · ${(file.content||'').length} chars · CodeSync</span>
</div>
<div class="code-wrap">
${lines.map((line, i) => `<div class="line"><span class="ln">${i+1}</span><span class="lc">${line || ' '}</span></div>`).join('\n')}
</div>
<div class="footer">Exported from CodeSync · Built by Ajit Mukund Joshi</div>
</body>
</html>`;
  triggerDownload(new Blob([html], { type: 'text/html' }), file.name.replace(/\.[^.]+$/, '.html'));
}

// ─── 5. Export PDF — FIXED with proper text rendering ───
export async function exportPDF(file) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginLeft = 50;
  const marginRight = 20;
  const lineHeight = 14;
  const fontSize = 9;
  const maxWidth = pageW - marginLeft - marginRight - 40; // space for line numbers

  // Background
  doc.setFillColor(13, 15, 20);
  doc.rect(0, 0, pageW, pageH, 'F');

  // Header
  doc.setFillColor(21, 24, 32);
  doc.rect(0, 0, pageW, 36, 'F');
  doc.setFont('Courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(79, 142, 247);
  doc.text(file.name, marginLeft, 22);
  doc.setFontSize(9);
  doc.setTextColor(107, 118, 148);
  doc.text(file.language.toUpperCase(), pageW - marginRight - 10, 22, { align: 'right' });
  const lineCount = (file.content || '').split('\n').length;
  doc.text(`${lineCount} lines`, pageW - marginRight - 60, 22, { align: 'right' });

  // Separator
  doc.setDrawColor(42, 47, 69);
  doc.line(0, 36, pageW, 36);

  let y = 52;
  const lines = (file.content || '').split('\n');
  const patterns = PATTERNS[file.language] || PATTERNS.javascript;

  function hexToRgb(hex) {
    const h = hex.replace('#','');
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }

  function addPage() {
    doc.addPage();
    doc.setFillColor(13, 15, 20);
    doc.rect(0, 0, pageW, pageH, 'F');
    y = 20;
  }

  doc.setFontSize(fontSize);

  lines.forEach((rawLine, idx) => {
    if (y > pageH - 20) addPage();

    // Line number
    doc.setTextColor(61, 68, 96);
    doc.setFont('Courier', 'normal');
    doc.text(String(idx + 1).padStart(4, ' '), marginLeft - 10, y, { align: 'right' });

    if (!rawLine) { y += lineHeight; return; }

    // Tokenize the line
    const lineLen = rawLine.length;
    const tags = new Array(lineLen).fill(null);
    patterns.forEach(({ regex, type }) => {
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(rawLine)) !== null) {
        for (let ci = m.index; ci < m.index + m[0].length; ci++) {
          if (!tags[ci]) tags[ci] = type;
        }
      }
    });

    // Render segments
    let x = marginLeft + 4;
    let i = 0;
    doc.setFont('Courier', 'normal');

    while (i < lineLen) {
      if (x > pageW - marginRight) break; // prevent overflow

      const type = tags[i];
      let j = i;
      while (j < lineLen && tags[j] === type) j++;
      const seg = rawLine.slice(i, j);
      const color = TOKEN_COLORS[type] || TOKEN_COLORS.default;
      const [r, g, b] = hexToRgb(color);
      doc.setTextColor(r, g, b);

      // Check if segment fits on line
      const segWidth = doc.getTextWidth(seg);
      if (x + segWidth > pageW - marginRight) {
        // Truncate with ellipsis
        const available = pageW - marginRight - x;
        let truncated = seg;
        while (truncated.length > 0 && doc.getTextWidth(truncated + '…') > available) {
          truncated = truncated.slice(0, -1);
        }
        if (truncated.length > 0) doc.text(truncated + '…', x, y);
        break;
      }

      doc.text(seg, x, y);
      x += segWidth;
      i = j;
    }

    y += lineHeight;
  });

  doc.save(file.name.replace(/\.[^.]+$/, '') + '.pdf');
}

// ─── 6. Export Word ───
export async function exportWord(file) {
  const highlighted = tokenize(file.content || '', file.language);
  const lines = highlighted.split('\n');
  const wordHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${file.name}</title>
<style>
body{font-family:'Courier New',monospace;font-size:10pt;background:#1e1e1e;color:#abb2bf;margin:40px}
.header{font-family:Arial;font-size:14pt;color:#4f8ef7;font-weight:bold;border-bottom:1px solid #333;padding-bottom:8px;margin-bottom:16px}
.meta{font-family:Arial;font-size:9pt;color:#6b7694;margin-bottom:20px}
.code-block{background:#0d0f14;padding:16px;border-radius:4px}
.line{display:flex;gap:16px;line-height:1.6}
.ln{color:#3d4460;min-width:32px;text-align:right;user-select:none}
.lc{white-space:pre-wrap;word-break:break-all}
</style></head>
<body>
<div class="header">${file.name}</div>
<div class="meta">Language: ${file.language} &nbsp;|&nbsp; Lines: ${(file.content||'').split('\n').length} &nbsp;|&nbsp; Generated by CodeSync</div>
<div class="code-block">
${lines.map((line, i) => `<div class="line"><span class="ln">${i+1}</span><span class="lc">${line || ' '}</span></div>`).join('')}
</div></body></html>`;
  triggerDownload(new Blob(['\ufeff', wordHTML], { type: 'application/msword' }), file.name.replace(/\.[^.]+$/, '') + '.doc');
}

// ─── 7. Export TXT ───
export function exportTxt(file) {
  triggerDownload(new Blob([file.content || ''], { type: 'text/plain' }), file.name.replace(/\.[^.]+$/, '') + '.txt');
}

// ─── 8. ZIP project ───
export async function exportProjectZip(project) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  const zip = new window.JSZip();
  const folder = zip.folder(project.name.replace(/[^a-zA-Z0-9-_]/g, '_'));
  project.files.forEach(f => folder.file(f.name, f.content || ''));
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, project.name.replace(/[^a-zA-Z0-9-_]/g, '_') + '.zip');
}

// ─── 9. ZIP all projects ───
export async function exportAllProjectsZip(projects) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  const zip = new window.JSZip();
  projects.forEach(p => {
    const folder = zip.folder(p.name.replace(/[^a-zA-Z0-9-_]/g, '_'));
    p.files.forEach(f => folder.file(f.name, f.content || ''));
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, 'codesync-all-projects.zip');
}

// ─── 10. Google Docs ───
export async function openInGoogleDocs(file) {
  await navigator.clipboard.writeText(file.content || '').catch(() => {});
  window.open('https://docs.google.com/document/create', '_blank');
}

// Legacy aliases
export const saveAllFiles = exportProjectZip;
export const saveAllProjects = exportAllProjectsZip;
