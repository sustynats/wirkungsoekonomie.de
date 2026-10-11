import fs from 'node:fs';
import path from 'node:path';

// Public HTML producers also create new files before git has seen them.
// Do not use git ls-files as an inventory of a completed build.
export const internalDirectories = new Set([
  '.git', '.github', '.claude', '.next', '.codex-backup', '_internal', '_debug',
  '_site', 'admin', 'components', 'content', 'data', 'docs', 'export', 'lib',
  'manifest', 'node_modules', 'outputs', 'ops', 'public', 'reports', 'scripts',
  'source-assets', 'src', 'templates', 'tests', 'tiktok_archive', 'tiktok_library',
  'tools', 'woek-akademie-app', 'woek-institut-app', 'woek-parlament-app',
]);

export function publicHtmlFiles(root = process.cwd()) {
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      if (entry.isSymbolicLink()) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && !internalDirectories.has(entry.name)) walk(file);
      } else if (entry.name.endsWith('.html')) files.push(file);
    }
  }
  walk(root);
  return files.sort();
}
