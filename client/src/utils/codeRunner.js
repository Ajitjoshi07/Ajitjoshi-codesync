// Judge0 CE Public API — free tier
// Docs: https://ce.judge0.com
const JUDGE0_URL = 'https://ce.judge0.com';

// Judge0 language IDs
const LANG_IDS = {
  javascript:  93,  // Node.js 18
  typescript:  74,
  python:      92,  // Python 3.11
  java:        62,  // Java 17
  cpp:         54,  // C++ 17
  c:           50,
  csharp:      51,
  go:          60,
  rust:        73,
  ruby:        72,
  php:         68,
  swift:       83,
  kotlin:      78,
  scala:       81,
  r:           80,
  lua:         64,
  perl:        85,
  shell:       46,  // Bash
  sql:         82,
  dart:        90,
  elixir:      57,
  haskell:     61,
  clojure:     86,
  julia:       87,
  objectivec:  79,
  html:        null, // handled by browser
  css:         null,
  jsx:         93,
  tsx:         74,
  markdown:    null,
  json:        null,
  yaml:        null,
  xml:         null,
  vue:         93,
  svelte:      93,
  dockerfile:  null,
  graphql:     null,
  powershell:  null,
  matlab:      null,
  plaintext:   null,
  scss:        null,
};

const BROWSER_LANGS = new Set(['html','css','markdown','json','yaml','xml','dockerfile','graphql','plaintext','scss']);

export function isBrowserLang(language) {
  return BROWSER_LANGS.has(language);
}

export function canRun(language) {
  return LANG_IDS[language] !== undefined && LANG_IDS[language] !== null;
}

export async function runCode(code, language, stdin = '') {
  const langId = LANG_IDS[language];

  // Browser-renderable languages
  if (isBrowserLang(language) || language === 'html') {
    return { type: 'browser', content: code };
  }

  if (!langId) {
    return { type: 'error', output: `Code execution not supported for ${language}.\nOpen in an online compiler to run this language.` };
  }

  try {
    // Submit code to Judge0
    const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
        stdin: stdin,
        cpu_time_limit: 10,
        memory_limit: 128000,
      })
    });

    if (!submitRes.ok) {
      throw new Error(`Judge0 API error: ${submitRes.status}`);
    }

    const result = await submitRes.json();

    // Parse result
    const stdout   = result.stdout   || '';
    const stderr   = result.stderr   || '';
    const compile  = result.compile_output || '';
    const message  = result.message  || '';
    const statusId = result.status?.id;
    const statusDesc = result.status?.description || 'Unknown';

    // Status IDs: 1=Queued, 2=Processing, 3=Accepted, 4=Wrong Answer,
    // 5=TLE, 6=CE, 7=RE(SIGSEGV), 11=RE(Other), 12=RE(NZEC), 13=RE(TO)
    if (statusId === 3) {
      return { type: 'success', output: stdout || '(No output)', time: result.time, memory: result.memory };
    } else if (statusId === 6) {
      return { type: 'error', output: `Compilation Error:\n${compile}` };
    } else if (statusId === 5) {
      return { type: 'error', output: 'Time Limit Exceeded (10 seconds)' };
    } else if (stderr) {
      return { type: 'error', output: `Runtime Error:\n${stderr}` };
    } else if (compile) {
      return { type: 'error', output: `Compilation Error:\n${compile}` };
    } else {
      return { type: 'error', output: `${statusDesc}\n${message || stdout || 'No output'}` };
    }

  } catch (err) {
    // Fallback if Judge0 is down
    if (err.message.includes('fetch')) {
      return { type: 'error', output: 'Cannot reach code execution server.\nPlease check your internet connection or try again later.\n\nAlternative: Open https://replit.com to run your code.' };
    }
    return { type: 'error', output: `Execution failed: ${err.message}` };
  }
}
