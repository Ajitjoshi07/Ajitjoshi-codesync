// Save a single file to disk
export function saveSingleFile(file) {
  const blob = new Blob([file.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
}

// Save all files in a project as a .zip
export async function saveAllFiles(project) {
  // Dynamically load JSZip from CDN
  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const zip = new window.JSZip();
  const folder = zip.folder(project.name.replace(/[^a-zA-Z0-9-_]/g, '_'));

  project.files.forEach(file => {
    folder.file(file.name, file.content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

// Save ALL projects as a zip
export async function saveAllProjects(projects) {
  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const zip = new window.JSZip();

  projects.forEach(project => {
    const folder = zip.folder(project.name.replace(/[^a-zA-Z0-9-_]/g, '_'));
    project.files.forEach(file => {
      folder.file(file.name, file.content);
    });
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codesync-projects.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
