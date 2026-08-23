#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';

const repoRoot = resolve(process.cwd());
const lockPath = join(repoRoot, 'content/studienskripte/v4/SOURCE_LOCK.json');
const checkOnly = process.argv.includes('--check');

// Verification of the committed, sanitized Public-Master must remain fully
// reproducible in pull requests and on GitHub Pages CI. The private source repo
// is only needed for an explicitly authorized import/materialization run.
if (checkOnly) {
  await import('./verify-v4-public-master.mjs');
  process.exit(0);
}

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

function headingDisplayCode(content) {
  const firstHeading = /^#\s+([^·\n]+?)(?:\s*·|\s*$)/m.exec(content);
  return firstHeading ? firstHeading[1].trim() : null;
}

function reviewStatusAccepted(actual, required) {
  return actual === required || actual.startsWith(`${required}_`);
}

function offeringStatusAccepted(status) {
  const value = String(status ?? '');
  return value.startsWith('FACH_ENDCONTENT_AND_ASSESSMENT_REVIEWED') || value.startsWith('FACH_ENDCONTENT_REVIEWED');
}

const protectedHeading = /(?:\bquiz\b|prüfungsfragen?|lösungen?(?:\s+mit\s+begründung)?|lösungsschlüssel|musterlösung|answer\s*key|instructor[^\n]*(?:solution|answer|rubric)|dozierenden[^\n]*(?:lösung|korrektur))/i;
const forbiddenPublicPatterns = [
  /\*\*Lösung(?:en)?:\*\*/i,
  /\bCorrectAnswer\b/i,
  /\bcorrect_answer\b/i,
  /\banswer_key\b/i,
  /\bMusterlösung\b/i,
  /\bLösungsschlüssel\b/i,
  /\binstructor[_ -]?(?:answer|solution|rubric)\b/i,
  /\bpassing[_ -]?score[_ -]?key\b/i
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

  const sanitized = output.join('\n').replace(/\n{4,}/g, '\n\n\n').trimEnd() + '\n';
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

const treeByPath = new Map(tree.tree.map((entry) => [entry.path, entry]));
const curriculumManifestEntry = treeByPath.get(lock.source_manifest);
if (!curriculumManifestEntry || curriculumManifestEntry.type !== 'blob') {
  throw new Error(`Curriculum-Manifest fehlt im Source-Lock: ${lock.source_manifest}`);
}
if (curriculumManifestEntry.sha !== lock.source_manifest_git_blob_sha) {
  throw new Error(`Curriculum-Manifest-Blob drift: ${curriculumManifestEntry.sha} != ${lock.source_manifest_git_blob_sha}`);
}
const stateManifestPath = `${lock.source_root}/STATE_SUSTAINABILITY_SOURCE_MANIFEST.json`;
const stateManifestEntry = treeByPath.get(stateManifestPath);
if (!stateManifestEntry || stateManifestEntry.sha !== lock.state_sustainability_manifest_git_blob_sha) {
  throw new Error(`State-Sustainability-Manifest-Blob drift: ${stateManifestEntry?.sha ?? 'missing'} != ${lock.state_sustainability_manifest_git_blob_sha}`);
}

const studyPrefix = `${lock.study_projection.source_path.replace(/\/$/, '')}/`;
const studyEntries = tree.tree
  .filter((entry) => entry.type === 'blob' && entry.path.startsWith(studyPrefix) && entry.path.endsWith('.md'))
  .sort((a, b) => a.path.localeCompare(b.path, 'de'));

if (studyEntries.length !== lock.study_projection.expected_total_lectures) {
  throw new Error(`Study source-count mismatch: ${studyEntries.length} statt ${lock.study_projection.expected_total_lectures}.`);
}

async function buildRecord(entry, { publicPath, offeringId, requiredReviewStatus }) {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${lock.source_sha}/${entry.path}`;
  const source = await fetchText(rawUrl);
  const lectureId = metadata(source, 'lecture_id');
  const displayCode = metadata(source, 'display_code') ?? headingDisplayCode(source);
  const curriculumVersion = metadata(source, 'curriculum_version');
  const reviewStatus = metadata(source, 'status');
  const sourceVersion = metadata(source, 'source_version');
  const reviewedAt = metadata(source, 'reviewed_at');
  const versionSensitive = metadata(source, 'version_sensitive');
  const recheckStatus = metadata(source, 'recheck_status');
  const declaredOfferingId = metadata(source, 'offering_id');

  if (!lectureId || !displayCode || !curriculumVersion || !reviewStatus) {
    throw new Error(`Fehlende Pflichtmetadaten in ${entry.path}.`);
  }
  if (curriculumVersion !== lock.curriculum_version) {
    throw new Error(`Curriculum-Version mismatch in ${entry.path}: ${curriculumVersion}.`);
  }
  if (!reviewStatusAccepted(reviewStatus, requiredReviewStatus)) {
    throw new Error(`Nicht fachfreigegebene Lecture ${entry.path}: ${reviewStatus}.`);
  }
  if (offeringId && declaredOfferingId && declaredOfferingId !== offeringId) {
    throw new Error(`Offering-ID mismatch in ${entry.path}: ${declaredOfferingId} != ${offeringId}.`);
  }

  const publicContent = sanitizePublicMarkdown(source, entry.path, lock.source_sha);
  return {
    lecture_id: lectureId,
    display_code: displayCode,
    offering_id: offeringId ?? 'WOEK-G',
    curriculum_version: curriculumVersion,
    review_status: reviewStatus,
    source_version: sourceVersion,
    reviewed_at: reviewedAt,
    version_sensitive: versionSensitive,
    recheck_status: recheckStatus,
    source_path: entry.path,
    source_blob_sha: entry.sha,
    source_sha: lock.source_sha,
    source_sha256: sha256(source),
    public_path: publicPath,
    public_sha256: sha256(publicContent),
    public_content: publicContent
  };
}

const studyRecords = await mapLimit(studyEntries, 8, async (entry) => {
  const rel = relative(lock.study_projection.source_path, entry.path).replaceAll('\\', '/');
  return buildRecord(entry, {
    publicPath: `${lock.public_projection.target_root}/${rel}`,
    offeringId: 'WOEK-G',
    requiredReviewStatus: lock.study_projection.review_status_required
  });
});

const offeringRecords = [];
for (const [slug, expectedCount] of Object.entries(lock.offering_projection.expected_lecture_counts)) {
  const prefix = `${lock.offering_projection.source_root}/${slug}/lectures/`;
  const entries = tree.tree
    .filter((entry) => entry.type === 'blob' && entry.path.startsWith(prefix) && entry.path.endsWith('.md'))
    .sort((a, b) => a.path.localeCompare(b.path, 'de'));
  if (entries.length !== expectedCount) {
    throw new Error(`Offering source-count mismatch ${slug}: ${entries.length} statt ${expectedCount}.`);
  }
  const statusPath = `${lock.offering_projection.source_root}/${slug}/OFFERING_STATUS.json`;
  const statusEntry = treeByPath.get(statusPath);
  if (!statusEntry || statusEntry.type !== 'blob') throw new Error(`Offering-Status fehlt: ${statusPath}`);
  const statusUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${lock.source_sha}/${statusPath}`;
  const offeringStatus = JSON.parse(await fetchText(statusUrl));
  if (offeringStatus.lecture_count !== expectedCount) {
    throw new Error(`Offering-Status count mismatch ${slug}: ${offeringStatus.lecture_count} statt ${expectedCount}.`);
  }
  if (offeringStatus.v4_endcontent_ready !== true && !offeringStatusAccepted(offeringStatus.status)) {
    throw new Error(`Offering ${slug} ist nicht als fachgeprüfter v4-Endcontent freigegeben: ${offeringStatus.status}.`);
  }
  const offeringId = offeringStatus.offering_id;
  if (!offeringId) throw new Error(`Offering-ID fehlt in ${statusPath}.`);

  const records = await mapLimit(entries, 6, async (entry) => buildRecord(entry, {
    publicPath: `${lock.offering_projection.target_root}/${slug}/${basename(entry.path)}`,
    offeringId,
    requiredReviewStatus: lock.offering_projection.review_status_required
  }));
  offeringRecords.push(...records);
}

const sourceRecords = [...studyRecords, ...offeringRecords];
const ids = new Set();
const scopedCodes = new Set();
for (const record of sourceRecords) {
  if (ids.has(record.lecture_id)) throw new Error(`Doppelte lecture_id: ${record.lecture_id}`);
  const scopedCode = `${record.offering_id}:${record.display_code}`;
  if (scopedCodes.has(scopedCode)) throw new Error(`Doppelter display_code im Offering: ${scopedCode}`);
  ids.add(record.lecture_id);
  scopedCodes.add(scopedCode);
}

const baseCount = studyRecords.filter((record) => record.lecture_id.startsWith('WOEK-G-BASE-')).length;
const govCount = studyRecords.length - baseCount;
if (baseCount !== lock.study_projection.expected_base_lectures) throw new Error(`Base-count mismatch: ${baseCount}.`);
if (govCount !== lock.study_projection.expected_state_architecture_lectures) throw new Error(`State-architecture count mismatch: ${govCount}.`);

const offeringCounts = {};
for (const slug of Object.keys(lock.offering_projection.expected_lecture_counts)) {
  const prefix = `${lock.offering_projection.target_root}/${slug}/`;
  offeringCounts[slug] = offeringRecords.filter((record) => record.public_path.startsWith(prefix)).length;
}

const manifest = {
  schema_version: '1.1',
  status: 'PRE_CUTOVER_PUBLIC_MASTER',
  generated_from: {
    repo: lock.source_repo,
    sha: lock.source_sha,
    curriculum_manifest_path: lock.source_manifest,
    curriculum_manifest_git_blob_sha: lock.source_manifest_git_blob_sha,
    state_sustainability_manifest_git_blob_sha: lock.state_sustainability_manifest_git_blob_sha,
    terminology_baseline: lock.terminology_baseline
  },
  curriculum_version: lock.curriculum_version,
  activation: lock.public_projection.activation,
  counts: {
    study_lectures: studyRecords.length,
    base: baseCount,
    state_architecture: govCount,
    active_offering_lectures: offeringRecords.length,
    active_offerings: Object.keys(offeringCounts).length,
    offering_lectures_by_slug: offeringCounts,
    total_public_lectures: sourceRecords.length
  },
  security: {
    assessment_secrets_included: false,
    quiz_and_solution_sections_removed: true,
    protected_sections_removed: true,
    fail_closed_patterns: forbiddenPublicPatterns.map((pattern) => pattern.source)
  },
  gates: Object.fromEntries(lock.required_gates.map((gate) => [gate, gate === 'ACADEMY_SCRIPT_MASTER_MIRROR_PARITY' ? 'SOURCE_HASH_READY_RUNTIME_PENDING' : 'PENDING_CROSS_REPO_RELEASE_GATE'])),
  lectures: sourceRecords.map(({ public_content, ...record }) => record)
};

const studyTargetRoot = join(repoRoot, lock.public_projection.target_root);
const offeringTargetRoot = join(repoRoot, lock.offering_projection.target_root);
const manifestPath = join(repoRoot, lock.public_projection.manifest_path);

if (!checkOnly) {
  await rm(studyTargetRoot, { recursive: true, force: true });
  await rm(offeringTargetRoot, { recursive: true, force: true });
  for (const record of sourceRecords) {
    const absolute = join(repoRoot, record.public_path);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, record.public_content, 'utf8');
  }
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`Academy v4 public master geschrieben: ${studyRecords.length} Studienlektionen + ${offeringRecords.length} Offering-Lektionen aus ${lock.source_sha}.`);
} else {
  const existingManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (existingManifest.generated_from?.sha !== lock.source_sha) throw new Error('Manifest source SHA drift.');
  if (existingManifest.generated_from?.curriculum_manifest_git_blob_sha !== lock.source_manifest_git_blob_sha) throw new Error('Manifest curriculum-blob drift.');
  if (existingManifest.curriculum_version !== lock.curriculum_version) throw new Error('Manifest curriculum version drift.');
  if (existingManifest.lectures?.length !== sourceRecords.length) throw new Error('Manifest lecture count drift.');

  const byId = new Map(existingManifest.lectures.map((entry) => [entry.lecture_id, entry]));
  for (const expected of sourceRecords) {
    const actual = byId.get(expected.lecture_id);
    if (!actual) throw new Error(`Manifest fehlt ${expected.lecture_id}.`);
    if (actual.source_sha256 !== expected.source_sha256 || actual.public_sha256 !== expected.public_sha256) {
      throw new Error(`Hash-Parität fehlgeschlagen für ${expected.lecture_id}.`);
    }
    if (actual.source_sha !== lock.source_sha || actual.curriculum_version !== lock.curriculum_version) {
      throw new Error(`ID/Version/Source-Parität fehlgeschlagen für ${expected.lecture_id}.`);
    }
    const publicContent = await readFile(join(repoRoot, actual.public_path), 'utf8');
    if (sha256(publicContent) !== actual.public_sha256) throw new Error(`Public file hash drift: ${actual.public_path}.`);
    for (const pattern of forbiddenPublicPatterns) {
      if (pattern.test(publicContent)) throw new Error(`Secret leak in ${actual.public_path}: ${pattern}.`);
    }
  }

  console.log(`ACADEMY_SCRIPT_MASTER_MIRROR_PARITY: PASS (${sourceRecords.length}/${sourceRecords.length}, source ${lock.source_sha}).`);
  console.log('NO_APP_ONLY_PUBLIC_SCRIPT_PARALLEL_TRUTH: PASS for locked public corpus');
  console.log('NO_ASSESSMENT_SECRET_LEAK: PASS');
  console.log('PUBLIC_MASTER_SOURCE_PROVENANCE_PRESENT: PASS');
}
