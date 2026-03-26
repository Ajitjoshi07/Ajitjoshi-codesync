// AI Code Completion using Gemini API
// Falls back to Monaco built-in if API unavailable

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY || '';

// Cache to avoid repeated API calls for same context
const cache = new Map();

export async function getAICompletion(code, language, cursorLine, allProjectFiles = []) {
  // Build context from cursor position
  const lines = code.split('\n');
  const before = lines.slice(Math.max(0, cursorLine - 20), cursorLine).join('\n');
  const after  = lines.slice(cursorLine, cursorLine + 5).join('\n');

  const cacheKey = before.slice(-200);
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // Build project context from other files
  const projectContext = allProjectFiles
    .filter(f => f.content && f.content.length < 2000)
    .map(f => `// File: ${f.name}\n${f.content.slice(0, 500)}`)
    .join('\n\n')
    .slice(0, 1500);

  const prompt = `You are a code completion engine like GitHub Copilot.
Language: ${language}

${projectContext ? `Project context:\n${projectContext}\n\n` : ''}
Code before cursor:
${before}

Code after cursor:
${after}

Complete the code at the cursor position. Return ONLY the completion text to insert — no explanation, no markdown, no code blocks. Maximum 3 lines. If nothing useful to suggest, return empty string.`;

  try {
    if (!GEMINI_KEY) {
      // No API key — return empty (Monaco built-in will handle it)
      return '';
    }

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
          stopSequences: ['\n\n\n']
        }
      })
    });

    if (!res.ok) return '';
    const data = await res.json();
    const completion = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    // Cache result
    cache.set(cacheKey, completion);
    if (cache.size > 100) cache.delete(cache.keys().next().value);

    return completion;
  } catch (err) {
    return '';
  }
}

// Register Monaco completion provider for project-wide symbols
export function registerProjectCompletions(monaco, projects, activeProjectId) {
  const activeProject = projects.find(p => p.id === activeProjectId);
  if (!activeProject) return () => {};

  // Extract all symbols from all project files
  const symbols = new Set();
  const functionDefs = [];
  const variableDefs = [];

  activeProject.files.forEach(file => {
    const content = file.content || '';

    // Extract function names
    const funcMatches = content.matchAll(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|def\s+(\w+)|func\s+(\w+)|public\s+\w+\s+(\w+)\s*\()/g);
    for (const m of funcMatches) {
      const name = m[1] || m[2] || m[3] || m[4] || m[5] || m[6];
      if (name && name.length > 1) {
        symbols.add(name);
        functionDefs.push({ name, file: file.name, lang: file.language });
      }
    }

    // Extract variable/const names
    const varMatches = content.matchAll(/(?:const|let|var|import)\s+(?:\{[^}]+\}|(\w+))/g);
    for (const m of varMatches) {
      if (m[1] && m[1].length > 1) {
        symbols.add(m[1]);
        variableDefs.push({ name: m[1], file: file.name });
      }
    }

    // Extract class names
    const classMatches = content.matchAll(/class\s+(\w+)/g);
    for (const m of classMatches) {
      symbols.add(m[1]);
    }
  });

  // Register provider for all languages
  const languages = [...new Set(activeProject.files.map(f => f.language))];
  const disposables = [];

  languages.forEach(lang => {
    const monacoLang = lang === 'jsx' ? 'javascript' : lang === 'tsx' ? 'typescript' : lang;
    try {
      const disposable = monaco.languages.registerCompletionItemProvider(monacoLang, {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions = [];

          // Add project symbols
          functionDefs.forEach(fn => {
            if (fn.name.toLowerCase().startsWith(word.word.toLowerCase())) {
              suggestions.push({
                label: fn.name,
                kind: monaco.languages.CompletionItemKind.Function,
                detail: `Function from ${fn.file}`,
                documentation: `Defined in ${fn.file}`,
                insertText: fn.name,
                range,
              });
            }
          });

          variableDefs.forEach(v => {
            if (v.name.toLowerCase().startsWith(word.word.toLowerCase())) {
              suggestions.push({
                label: v.name,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: `Variable from ${v.file}`,
                insertText: v.name,
                range,
              });
            }
          });

          return { suggestions };
        }
      });
      disposables.push(disposable);
    } catch(e) {}
  });

  // Return cleanup function
  return () => disposables.forEach(d => d.dispose());
}

// Register inline ghost text completion (Copilot-style)
export function registerInlineCompletion(monaco, getCode, language, allFiles) {
  try {
    const provider = monaco.languages.registerInlineCompletionsProvider(
      { pattern: '**' },
      {
        provideInlineCompletions: async (model, position, context, token) => {
          if (token.isCancellationRequested) return { items: [] };

          const code = model.getValue();
          const currentLine = position.lineNumber;

          // Debounce — only trigger after user stops typing
          await new Promise(resolve => setTimeout(resolve, 600));
          if (token.isCancellationRequested) return { items: [] };

          const completion = await getAICompletion(code, language, currentLine, allFiles);
          if (!completion || token.isCancellationRequested) return { items: [] };

          return {
            items: [{
              insertText: completion,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              }
            }],
            enableForwardStability: true,
          };
        },
        freeInlineCompletions: () => {}
      }
    );
    return () => provider.dispose();
  } catch(e) {
    return () => {};
  }
}
