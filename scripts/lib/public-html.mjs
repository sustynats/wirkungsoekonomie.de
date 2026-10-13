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
  function walk(directory, depth = 0) {
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      if (entry.isSymbolicLink()) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        // These names describe repository-only directories at the root. The
        // same words can be legitimate public route segments below a public
        // area, for example `/wirkungsfelder/bildung/tools/`.
        if (!entry.name.startsWith('.') && (depth > 0 || !internalDirectories.has(entry.name))) walk(file, depth + 1);
      } else if (entry.name.endsWith('.html')) files.push(file);
    }
  }
  walk(root);
  return files.sort();
}
