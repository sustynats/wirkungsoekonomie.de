// Read-only network prefetch before processing/building. Bounded parallelism
// avoids serial cold downloads in the existing synchronous JSON readers.
import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {newsroomParts} from './newsroom-store.mjs';
import {RELEASE_STORE_FORMAT, releasePartUrl, assertRawPart, decodeReleasePart} from './release-part.mjs';

const exec = promisify(execFile);
const download = async (url, maxBytes) => (await exec('curl', ['--fail', '--silent', '--show-error', '--location',
  '--proto', '=https', '--proto-redir', '=https', '--connect-timeout', '10', '--max-time', '45',
  '--max-filesize', String(maxBytes), '--url', url], {timeout: 50000, maxBuffer: maxBytes + 1024, encoding: 'buffer'})).stdout;

export async function hydrateReleaseData({root = process.cwd(), downloadPart = download, concurrency = 4} = {}) {
  if (!Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 4) throw Error('RELEASE_HYDRATE_CONCURRENCY_INVALID');
  const pending = new Map(); let stores = 0;
  for (const relative of ['data/news/stories.json', 'data/news/newsroom.json']) {
    const file = path.join(root, relative);
    if (!fs.existsSync(file)) continue;
    const manifest = JSON.parse(fs.readFileSync(file));
    if (manifest.parts_storage !== RELEASE_STORE_FORMAT) continue;
    stores++;
    for (const part of newsroomParts(manifest)) {
      const physical = `${file}.parts/${part.sha256}.json`;
      if (fs.existsSync(physical)) { assertRawPart(fs.readFileSync(physical), part); continue; }
      releasePartUrl(part);
      const task = pending.get(part.sha256);
      if (task && task.part.bytes !== part.bytes) throw Error('RELEASE_HYDRATE_PART_CONFLICT');
      if (task) task.files.push(physical);
      else pending.set(part.sha256, {part, files: [physical]});
    }
  }
  const tasks = [...pending.values()]; let cursor = 0, fetched = 0, rawBytes = 0, failure;
  const worker = async () => {
    while (!failure && cursor < tasks.length) {
      const {part, files} = tasks[cursor++];
      try {
        const bytes = decodeReleasePart(await downloadPart(releasePartUrl(part), part.release.bytes), part);
        for (const file of files) {
          if (fs.existsSync(file)) { assertRawPart(fs.readFileSync(file), part); continue; }
          fs.mkdirSync(path.dirname(file), {recursive: true});
          const temporary = `${file}.tmp-${process.pid}`;
          try { fs.writeFileSync(temporary, bytes, {mode: 0o600}); fs.renameSync(temporary, file); }
          finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
        }
        fetched++; rawBytes += bytes.length;
      } catch (error) { failure ||= error; }
    }
  };
  await Promise.all(Array.from({length: Math.min(concurrency, tasks.length)}, worker));
  if (failure) throw failure;
  return {status: stores ? 'verified' : 'not_enabled', stores, fetched_parts: fetched, raw_bytes: rawBytes};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = process.argv.slice(2).find(arg => arg.startsWith('--root='))?.slice(7);
    console.log(JSON.stringify(await hydrateReleaseData({...(root ? {root} : {})})));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
