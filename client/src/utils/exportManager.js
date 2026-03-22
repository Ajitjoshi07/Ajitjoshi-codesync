const TOKEN_COLORS = {
  keyword:'#c678dd', string:'#98c379', comment:'#5c6370',
  number:'#d19a66',  type:'#e5c07b',   function:'#61afef',
  operator:'#56b6c2',variable:'#e06c75',constant:'#d19a66',
  default:'#abb2bf',
};

const PATTERNS = {
  javascript:[
    {regex:/(\/\/.*$)/gm,                                                              type:'comment'},
    {regex:/(\/\*[\s\S]*?\*\/)/g,                                                      type:'comment'},
    {regex:/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,               type:'string'},
    {regex:/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|from|new|this|typeof|instanceof|async|await|try|catch|finally|throw|switch|case|break|continue|of|in|extends|super|static|null|undefined|true|false)\b/g, type:'keyword'},
    {regex:/\b([A-Z][a-zA-Z0-9]*)\b/g,                                                type:'type'},
    {regex:/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,                                 type:'function'},
    {regex:/\b(\d+\.?\d*)\b/g,                                                         type:'number'},
  ],
  python:[
    {regex:/(#.*$)/gm,                                                                 type:'comment'},
    {regex:/("""[\s\S]*?"""|'''[\s\S]*?''')/g,                                         type:'string'},
    {regex:/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,                                  type:'string'},
    {regex:/\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|pass|break|continue|lambda|yield|global|nonlocal|and|or|not|in|is|True|False|None|async|await)\b/g, type:'keyword'},
    {regex:/\b([A-Z][a-zA-Z0-9]*)\b/g,                                                type:'type'},
    {regex:/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,                                   type:'function'},
    {regex:/\b(\d+\.?\d*)\b/g,                                                         type:'number'},
  ],
  java:[
    {regex:/(\/\/.*$)/gm,                                                              type:'comment'},
    {regex:/(\/\*[\s\S]*?\*\/)/g,                                                      type:'comment'},
    {regex:/("(?:[^"\\]|\\.)*")/g,                                                     type:'string'},
    {regex:/\b(public|private|protected|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|static|final|abstract|void|int|long|double|float|boolean|char|null|true|false|this|super)\b/g, type:'keyword'},
    {regex:/\b([A-Z][a-zA-Z0-9]*)\b/g,                                                type:'type'},
    {regex:/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,                                   type:'function'},
    {regex:/\b(\d+)\b/g,                                                               type:'number'},
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
PATTERNS.swift      = PATTERNS.java;
PATTERNS.kotlin     = PATTERNS.java;
PATTERNS.shell      = PATTERNS.python;
PATTERNS.sql = [{regex:/(--.*$)/gm,type:'comment'},{regex:/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,type:'string'},{regex:/\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|JOIN|ON|AS|AND|OR|NOT|IN|LIKE|ORDER|BY|GROUP|HAVING|LIMIT|NULL|PRIMARY|KEY|INDEX)\b/gi,type:'keyword'},{regex:/\b(\d+)\b/g,type:'number'}];
PATTERNS.json = [{regex:/("(?:[^"\\]|\\.)*")\s*:/g,type:'keyword'},{regex:/:\s*("(?:[^"\\]|\\.)*")/g,type:'string'},{regex:/\b(true|false|null)\b/g,type:'constant'},{regex:/\b(\d+\.?\d*)\b/g,type:'number'}];
PATTERNS.css  = [{regex:/(\/\*[\s\S]*?\*\/)/g,type:'comment'},{regex:/([.#][a-zA-Z][a-zA-Z0-9_-]*)/g,type:'function'},{regex:/\b([a-zA-Z-]+)\s*(?=:)/g,type:'keyword'},{regex:/(#[0-9a-fA-F]{3,8})\b/g,type:'number'},{regex:/\b(\d+\.?\d*)(px|em|rem|%|vh|vw)?\b/g,type:'number'}];
PATTERNS.html = [{regex:/(<!--[\s\S]*?-->)/g,type:'comment'},{regex:/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,type:'string'},{regex:/(<\/?[a-zA-Z][a-zA-Z0-9-]*)/g,type:'keyword'},{regex:/\b([a-zA-Z-]+=)/g,type:'function'}];
PATTERNS.markdown = [];

function tokenize(code, language) {
  const patterns = PATTERNS[language] || PATTERNS.javascript;
  if (!patterns.length) return [{text:code,type:'default'}];
  const len = code.length;
  const tags = new Array(len).fill(null);
  patterns.forEach(({regex,type}) => {
    regex.lastIndex = 0;
    let m;
    while((m=regex.exec(code))!==null) {
      for(let i=m.index;i<m.index+m[0].length;i++) { if(!tags[i]) tags[i]=type; }
    }
  });
  const segs = [];
  let i = 0;
  while(i<len) {
    const type = tags[i] || 'default';
    let j = i;
    while(j<len && (tags[j]||'default')===type) j++;
    segs.push({text:code.slice(i,j),type});
    i = j;
  }
  return segs;
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function loadScript(url) {
  return new Promise((res,rej) => {
    if(document.querySelector(`script[src="${url}"]`)){res();return;}
    const s=document.createElement('script');
    s.src=url; s.onload=res; s.onerror=rej;
    document.head.appendChild(s);
  });
}

// 1. Save raw file
export function saveSingleFile(file) {
  triggerDownload(new Blob([file.content],{type:'text/plain'}), file.name);
}

// 2. Copy to clipboard
export async function copyToClipboard(file) {
  await navigator.clipboard.writeText(file.content);
}

// 3. Markdown
export function exportMarkdown(file) {
  const ext = file.name.split('.').pop();
  const md = `# ${file.name}\n\n\`\`\`${ext}\n${file.content}\n\`\`\`\n`;
  triggerDownload(new Blob([md],{type:'text/markdown'}), file.name.replace(/\.[^.]+$/,'.md'));
}

// 4. Plain text
export function exportTxt(file) {
  triggerDownload(new Blob([file.content],{type:'text/plain'}), file.name.replace(/\.[^.]+$/,'.txt'));
}

// 5. Standalone HTML with syntax highlighting
export function exportHTML(file) {
  const lines = file.content.split('\n');
  const highlighted = lines.map((line,i) => {
    const segs = tokenize(line, file.language);
    const html = segs.map(s=>`<span style="color:${TOKEN_COLORS[s.type]||TOKEN_COLORS.default}">${escHtml(s.text)}</span>`).join('');
    return `<div class="line"><span class="ln">${i+1}</span><span class="lc">${html||' '}</span></div>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${file.name}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#0d0f14;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.7}
.header{background:#151820;border-bottom:1px solid #2a2f45;padding:12px 20px;display:flex;align-items:center;gap:12px}
.filename{color:#4f8ef7;font-weight:700;font-size:15px}.lang{background:#1c2030;border:1px solid #2a2f45;border-radius:12px;padding:2px 8px;font-size:10px;color:#6b7694}
.meta{color:#6b7694;font-size:10px;margin-left:auto}.code-wrap{padding:16px 0}
.line{display:flex;min-height:1.7em}.line:hover{background:rgba(255,255,255,0.02)}
.ln{min-width:48px;padding:0 12px 0 20px;text-align:right;color:#3d4460;user-select:none;flex-shrink:0}
.lc{padding:0 20px 0 0;white-space:pre;flex:1}
.footer{text-align:center;padding:20px;color:#3d4460;font-size:10px;border-top:1px solid #1c2030;margin-top:16px}
</style></head><body>
<div class="header"><span class="filename">${file.name}</span><span class="lang">${file.language}</span>
<span class="meta">${lines.length} lines · Generated by CodeSync</span></div>
<div class="code-wrap">${highlighted}</div>
<div class="footer">Exported from CodeSync · Built by Ajit Mukund Joshi</div>
</body></html>`;
  triggerDownload(new Blob([html],{type:'text/html'}), file.name.replace(/\.[^.]+$/,'.html'));
}

// 6. PDF — fixed version using html2canvas approach via iframe print
export async function exportPDF(file) {
  // Build a printable HTML page and trigger browser print-to-PDF
  const lines = file.content.split('\n');
  const highlighted = lines.map((line,i) => {
    const segs = tokenize(line, file.language);
    const html = segs.map(s=>`<span style="color:${TOKEN_COLORS[s.type]||TOKEN_COLORS.default}">${escHtml(s.text)}</span>`).join('');
    return `<tr><td class="ln">${i+1}</td><td class="lc">${html||'&nbsp;'}</td></tr>`;
  }).join('\n');

  const printHTML = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${file.name}</title>
<style>
@page{size:A4;margin:15mm 10mm}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0f14;color:#abb2bf;font-family:'Courier New',monospace;font-size:9pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.header{background:#151820;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-radius:4px;border:1px solid #2a2f45}
.fname{color:#4f8ef7;font-weight:bold;font-size:11pt}.lang{color:#6b7694;font-size:8pt}
table{width:100%;border-collapse:collapse}
.ln{width:36px;text-align:right;padding-right:12px;color:#3d4460;user-select:none;white-space:nowrap;vertical-align:top;padding-top:1px}
.lc{white-space:pre-wrap;word-break:break-all;vertical-align:top}
tr{line-height:1.55}
tr:nth-child(even){background:rgba(255,255,255,0.015)}
.footer{margin-top:12px;text-align:center;color:#3d4460;font-size:7pt;border-top:1px solid #2a2f45;padding-top:8px}
</style></head><body>
<div class="header"><span class="fname">${file.name}</span><span class="lang">${file.language.toUpperCase()} · ${lines.length} lines · CodeSync</span></div>
<table><tbody>${highlighted}</tbody></table>
<div class="footer">Exported from CodeSync · Built by Ajit Mukund Joshi · github.com/Ajitjoshi07</div>
</body></html>`;

  const w = window.open('','_blank','width=800,height=600');
  if (!w) { alert('Allow popups to export PDF'); return; }
  w.document.write(printHTML);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 500);
}

// 7. Word (.doc)
export async function exportWord(file) {
  const lines = file.content.split('\n');
  const highlighted = lines.map((line,i) => {
    const segs = tokenize(line, file.language);
    const html = segs.map(s=>`<span style="color:${TOKEN_COLORS[s.type]||TOKEN_COLORS.default}">${escHtml(s.text)}</span>`).join('');
    return `<div style="display:flex;gap:16px;line-height:1.6"><span style="color:#3d4460;min-width:28px;text-align:right;font-size:8pt">${i+1}</span><span style="white-space:pre-wrap">${html||'&nbsp;'}</span></div>`;
  }).join('');

  const wordHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${file.name}</title>
<style>body{font-family:'Courier New',monospace;font-size:9pt;background:#0d0f14;color:#abb2bf;margin:20px}
.header{font-family:Arial;font-size:13pt;color:#4f8ef7;font-weight:bold;border-bottom:1px solid #2a2f45;padding-bottom:6px;margin-bottom:12px}
.meta{font-family:Arial;font-size:8pt;color:#6b7694;margin-bottom:16px}
.code{background:#0d0f14;padding:12px}</style></head>
<body><div class="header">${file.name}</div>
<div class="meta">Language: ${file.language} · Lines: ${lines.length} · Generated by CodeSync</div>
<div class="code">${highlighted}</div></body></html>`;

  triggerDownload(new Blob(['\ufeff',wordHTML],{type:'application/msword'}), file.name.replace(/\.[^.]+$/,'.doc'));
}

// 8. Google Docs
export async function openInGoogleDocs(file) {
  await navigator.clipboard.writeText(file.content).catch(()=>{});
  window.open('https://docs.google.com/document/create','_blank');
}

// 9. Project ZIP
export async function exportProjectZip(project) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  const zip = new window.JSZip();
  const folder = zip.folder(project.name.replace(/[^a-zA-Z0-9-_]/g,'_'));
  project.files.forEach(f => folder.file(f.name, f.content));
  triggerDownload(await zip.generateAsync({type:'blob'}), project.name.replace(/[^a-zA-Z0-9-_]/g,'_')+'.zip');
}

// 10. All projects ZIP
export async function exportAllProjectsZip(projects) {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
  const zip = new window.JSZip();
  projects.forEach(p => {
    const f = zip.folder(p.name.replace(/[^a-zA-Z0-9-_]/g,'_'));
    p.files.forEach(file => f.file(file.name, file.content));
  });
  triggerDownload(await zip.generateAsync({type:'blob'}), 'codesync-all-projects.zip');
}

export const saveAllFiles      = exportProjectZip;
export const saveAllProjects   = exportAllProjectsZip;
