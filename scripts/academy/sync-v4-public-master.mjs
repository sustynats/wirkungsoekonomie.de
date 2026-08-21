#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';

const repoRoot = resolve(process.cwd());
const lockPath = join(repoRoot, 'content/studienskripte/v4/SOURCE_LOCK.json');
const checkOnly = process.argv.includes('--check');
const lock = JSON.parse(await readFile(lockPath, 'utf8'));

function sha256(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function githubCoordinates(fullName) {
  const [owner, repo] = fullName.split('/');
  if (!owner || !repo) throw new Error(`Ungültiges source_repo: ${fullName}`);
  return { owner, repo };
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'woek-academy-v4-public-master-sync'
    }
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${url}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'woek-academy-v4-public-master-sync' } });
  if (!response.ok) throw new Error(`Source fetch ${response.status}: ${url}`);
  return response.text();
}

function metadata(content, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*\\x60([^\\x60]+)\\x60`, 'i');
  const match = content.match(regex);
  if (match) return match[1].trim();
  const plain = new RegExp(`\\*\\*${escaped}:\\*\\*\\s*([^\\n]+)`, 'i').exec(content);
  return plain ? plain[1].replace(/\\s{2,}$/, '').trim() : null;
}

const protectedHeading = /(?:quiz[^\n]*lös|lösungen?(?:\s+mit\s+begründung)?|lösungsschlüssel|musterlösung|answer\s*key|instructor[^\n]*(?:solution|answer|rubric)|dozierenden[^\n]*(?:lösung|korrektur))/i;
const forbiddenPublicPatterns = [
  /\*\*Lösung(?:en)?:\*\*/i,
  /\bCorrectAnswer\b/i,
  /\bcorrect_answer\b/i,
  /\banswer_key\b/i,
  /\bMusterlösung\b/i,
  /\bLösungsschlüssel\b/i,
  /\binstructor[_ -]?(?:answer|solution|rubric)\b/i
];

function sanitizePublicMarkdown(source, sourcePath, sourceSha) {
  const lines = source.split(/\r?\n/);
  const output = [];
  let skipLevel = null;
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (skipLevel !== null) {
      if (heading && heading[1].length <= skipLevel) {
        skipLevel = null;
      } else {
        continue;
      }
    }
    if (heading && protectedHeading.test(heading[2])) {
      skipLevel = heading[1].length;
      continue;
    }
    output.push(line);
  }

  let sanitized = output.join('\n').replace(/\n{4,}/g, '\n\n\n').trimEnd() + '\n';
  for (const pattern of forbiddenPublicPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error(`Fail closed: geschützter Prüfungs-/Lösungsinhalt blieb in ${sourcePath} (${pattern})`);
    }
  }

  const provenance = `<!-- WOEK_PUBLIC_MASTER source=${lock.source_repo}@${sourceSha} path=${sourcePath} curriculum=${lock.curriculum_version} sanitized=true -->\n`;
  return provenance + sanitized;
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

const { owner, repo } = githubCoordinates(lock.source_repo);
const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${lock.source_sha}?recursive=1`;
const tree = await fetchJson(treeUrl);
if (tree.truncated) throw new Error('GitHub source tree ist truncated; kein sicherer Public-Master-Sync möglich.');

const sourcePrefix = `${lock.study_projection.source_path.replace(/\/$/, '')}/`;
const sourceEntries = tree.tree
  .filter((entry) => entry.type === 'blob' && entry.path.startsWith(sourcePrefix) && entry.path.endsWith('.md'))
  .sort((a, b) => a.path.localeCompare(b.path, 'de'));

if (sourceEntries.length !== lock.study_projection.expected_total_lectures) {
  throw new Error(`Source-count mismatch: ${sourceEntries.length} statt ${lock.study_projection.expected_total_lectures}.`);
}

const sourceRecords = await mapLimit(sourceEntries, 8, async (entry) => {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${lock.source_sha}/${entry.path}`;
  const source = await fetchText(rawUrl);
  const lectureId = metadata(source, 'lecture_id');
  const displayCode = metadata(source, 'display_code');
  const curriculumVersion = metadata(source, 'curriculum_version');
  const reviewStatus = metadata(source, 'status');
  if (!lectureId || !displayCode || !curriculumVersion || !reviewStatus) {
    throw new Error(`Fehlende Pflichtmetadaten in ${entry.path}.`);
  }
  if (curriculumVersion !== lock.curriculum_version) {
    throw new Error(`Curriculum-Version mismatch in ${entry.path}: ${curriculumVersion}.`);
  }
  if (reviewStatus !== lock.study_projection.review_status_required) {
    throw new Error(`Nicht fachfreigegebene Lecture ${entry.path}: ${reviewStatus}.`);
  }
  const publicContent = sanitizePublicMarkdown(source, entry.path, lock.source_sha);
  const rel = relative(lock.study_projection.source_path, entry.path).replaceAll('\\', '/');
  const publicPath = `${lock.public_projection.target_root}/${rel}`;
  return {
    lecture_id: lectureId,
    display_code: displayCode,
    curriculum_version: curriculumVersion,
    review_status: reviewStatus,
    source_path: entry.path,
    source_blob_sha: entry.sha,
    source_sha: lock.source_sha,
    source_sha256: sha256(source),
    public_path: publicPath,
    public_sha256: sha256(publicContent),
    public_content: publicContent
  };
});

const ids = new Set();
const codes = new Set();
for (const record of sourceRecords) {
  if (ids.has(record.lecture_id)) throw new Error(`Doppelte lecture_id: ${record.lecture_id}`);
  if (codes.has(record.display_code)) throw new Error(`Doppelter display_code: ${record.display_code}`);
  ids.add(record.lecture_id);
  codes.add(record.display_code);
}

const baseCount = sourceRecords.filter((record) => record.lecture_id.startsWith('WOEK-G-BASE-')).length;
const govCount = sourceRecords.length - baseCount;
if (baseCount !== lock.study_projection.expected_base_lectures) {
  throw new Error(`Base-count mismatch: ${baseCount}.`);
}
if (govCount !== lock.study_projection.expected_state_architecture_lectures) {
  throw new Error(`State-architecture count mismatch: ${govCount}.`);
}

const manifest = {
  schema_version: '1.0',
  status: 'PRE_CUTOVER_PUBLIC_MASTER',
  generated_from: {
    repo: lock.source_repo,
    sha: lock.source_sha,
    root: lock.study_projection.source_path,
    terminology_baseline: lock.terminology_baseline
  },
  curriculum_version: lock.curriculum_version,
  activation: lock.public_projection.activation,
  counts: {
    lectures: sourceRecords.length,
    base: baseCount,
    state_architecture: govCount
  },
  security: {
    assessment_secrets_included: false,
    protected_sections_removed: true,
    fail_closed_patterns: forbiddenPublicPatterns.map((pattern) => pattern.source)
  },
  gates: Object.fromEntries(lock.required_gates.map((gate) => [gate, gate === 'ACADEMY_SCRIPT_MASTER_MIRROR_PARITY' ? 'SOURCE_HASH_READY_RUNTIME_PENDING' : 'PENDING_CROSS_REPO_RELEASE_GATE'])),
  lectures: sourceRecords.map(({ public_content, ...record }) => record)
};

const targetRoot = join(repoRoot, lock.public_projection.target_root);
const manifestPath = join(repoRoot, lock.public_projection.manifest_path);

if (!checkOnly) {
  await rm(targetRoot, { recursive: true, force: true });
  for (const record of sourceRecords) {
    const absolute = join(repoRoot, record.public_path);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, record.public_content, 'utf8');
  }
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`Academy v4 public master geschrieben: ${sourceRecords.length} Lectures aus ${lock.source_sha}.`);
} else {
  const existingManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (existingManifest.generated_from?.sha !== lock.source_sha) throw new Error('Manifest source SHA drift.');
  if (existingManifest.curriculum_version !== lock.curriculum_version) throw new Error('Manifest curriculum version drift.');
  if (existingManifest.lectures?.length !== sourceRecords.length) throw new Error('Manifest lecture count drift.');
  const byId = new Map(existingManifest.lectures.map((entry) => [entry.lecture_id, entry]));
  for (const expected of sourceRecords) {
    const actual = byId.get(expected.lecture_id);
    if (!actual) throw new Error(`Manifest fehlt ${expected.lecture_id}.`);
    if (actual.source_sha256 !== expected.source_sha256 || actual.public_sha256 !== expected.public_sha256) {
      throw new Error(`Hash-Parität fehlgeschlagen für ${expected.lecture_id}.`);
    }
    const publicContent = await readFile(join(repoRoot, actual.public_path), 'utf8');
    if (sha256(publicContent) !== actual.public_sha256) throw new Error(`Public file hash drift: ${actual.public_path}.`);
    for (const pattern of forbiddenPublicPatterns) {
      if (pattern.test(publicContent)) throw new Error(`Secret leak in ${actual.public_path}: ${pattern}.`);
    }
  }
  console.log(`ACADEMY_SCRIPT_MASTER_MIRROR_PARITY: PASS (${sourceRecords.length}/${sourceRecords.length}, source ${lock.source_sha}).`);
  console.log('NO_ASSESSMENT_SECRET_LEAK: PASS');
  console.log('PUBLIC_MASTER_SOURCE_PROVENANCE_PRESENT: PASS');
}
