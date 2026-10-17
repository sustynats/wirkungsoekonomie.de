// Explicit, hash-bound correction of a documented provenance overstatement.
// No provider calls, source changes, reassessment or historical replacement.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readRepositoryJson, writeRepositoryJson} from './newsroom-store.mjs';
import {sourceIndependenceTextErrors} from './newsroom.mjs';
import {validateAnalysis} from './lib.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const TYPE = 'source_independence_clarification';
const PREFIX = 'Zwei voneinander unabhängige journalistische Quellen berichten';
const REVIEWED = Object.freeze({
  story_id: 'wt-d2fbe3584eaf2016', version: 1,
  summary_sha256: '30be4f7a1c8d026295e29049204b30411e731fa831fe47fce52b18c0a25da163',
  analysis_sha256: '660419b32d50cdc7842de695e5570126a859061974f0d06d1816637cf8c06ff7',
  content_hash: 'd6b97728ef9bf0eba714565ee926cbe5915d4cbb06367a6af182be980ef56d32',
});
export function clarifySourceIndependence(existing, {expectedSummaryHash, at}) {
  if (!existing?.published || !existing.analysis || existing.manual_only || existing.editorial_approval_hash) throw Error('REGULAR_PUBLISHED_STORY_REQUIRED');
  if (!Number.isFinite(Date.parse(at)) || Date.parse(at) < Date.parse(existing.published_at)) throw Error('CORRECTION_DATE_INVALID');
  if (existing.corrections?.some(c => c.type === TYPE && c.original_summary_sha256 === expectedSummaryHash)) return {record: existing, unchanged: true};
  if (hash(existing.source_summary || '') !== expectedSummaryHash) throw Error('CORRECTION_INPUT_CHANGED');
  if (!existing.source_summary.startsWith(PREFIX) || !sourceIndependenceTextErrors({source_summary: existing.source_summary}, existing.sources).length) throw Error('CORRECTION_NOT_APPLICABLE');
  const summary = existing.source_summary.replace(PREFIX, 'Zwei journalistische Quellen berichten');
  const record = structuredClone(existing);
  record.source_summary = summary;
  const errors = validateAnalysis({...record.analysis, source_summary: summary}, record, {validateSourceSummaryNumbers: false, persisted: true});
  if (errors.length) throw Object.assign(Error('CORRECTION_VALIDATION_FAILED'), {issues: errors});
  record.current_version = Number(existing.current_version || 0) + 1;
  record.updated_at = record.last_updated = at;
  record.versions.push({version: record.current_version, analyzed_at: at, content_hash: record.content_hash,
    title: record.title, source_summary: summary, analysis: structuredClone(record.analysis), claims: structuredClone(record.claims),
    source_versions: record.sources.map(({source_id, url, content_hash}) => ({source_id, url, content_hash})),
    provider: null, model: null, mode: 'source_provenance_clarification_no_generation',
    original_summary_sha256: expectedSummaryHash, method_sources: []});
  record.corrections = [...(existing.corrections || []), {at, type: TYPE, original_summary_sha256: expectedSummaryHash,
    note: 'Die erste Fassung bezeichnete die beiden journalistischen Quellen als voneinander unabhängig. Ihre Unabhängigkeit ist im dokumentierten Quellenbestand jedoch nicht nachgewiesen; unterschiedliche Verlagsseiten allein reichen dafür nicht aus. Diese Formulierung wurde zurückgenommen. Ereignisangaben und Wirkungsmodell bleiben unverändert; die Erstfassung bleibt im Versionsverlauf erhalten.'}];
  record.publication_history = [...(existing.publication_history || []), {version: record.current_version, published_at: at,
    source_count: record.sources.length, change: TYPE}];
  return {record, unchanged: false};
}

// Only the documented, byte-bound first edition is eligible for the normal
// serial worker. A changed input is a hold, not permission to regenerate it.
export function applyReviewedSourceIndependenceClarification(existing, reviewed, at) {
  if (existing?.story_id !== reviewed.story_id) return {record: existing, status: 'not_applicable'};
  if (existing.corrections?.some(c => c.type === TYPE && c.original_summary_sha256 === reviewed.summary_sha256)) return {record: existing, status: 'already_applied'};
  if (existing.current_version !== reviewed.version || existing.content_hash !== reviewed.content_hash
    || hash(JSON.stringify(existing.analysis ?? null)) !== reviewed.analysis_sha256) return {record: existing, status: 'input_changed'};
  try {
    const result = clarifySourceIndependence(existing, {expectedSummaryHash: reviewed.summary_sha256, at});
    return {...result, status: result.unchanged ? 'already_applied' : 'applied'};
  } catch (error) {
    return {record: existing, status: 'held', reason: error.message};
  }
}

export function applyDocumentedSourceIndependenceClarifications(stories, at) {
  const index = stories.findIndex(story => story.story_id === REVIEWED.story_id);
  if (index < 0) return [];
  const result = applyReviewedSourceIndependenceClarification(stories[index], REVIEWED, at);
  if (result.status === 'applied') stories[index] = result.record;
  return [{story_id: REVIEWED.story_id, status: result.status, ...(result.reason ? {reason: result.reason} : {})}];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const arg = name => process.argv.find(v => v.startsWith(`--${name}=`))?.slice(name.length + 3);
  const id = arg('story'), expectedSummaryHash = arg('expected-summary-sha256'), at = arg('at');
  if (!id || !/^[a-f0-9]{64}$/.test(expectedSummaryHash || '') || !at) throw Error('EXPLICIT_STORY_HASH_AND_DATE_REQUIRED');
  const file = fileURLToPath(new URL('../../data/news/stories.json', import.meta.url));
  const store = readRepositoryJson(file), index = store.stories.findIndex(s => s.story_id === id);
  const result = clarifySourceIndependence(store.stories[index], {expectedSummaryHash, at});
  if (process.argv.includes('--write') && !result.unchanged) {
    store.stories[index] = result.record;
    store.updated_at = store.public_updated_at = at;
    writeRepositoryJson(file, store);
  }
  console.log(JSON.stringify({story_id: id, unchanged: result.unchanged, written: process.argv.includes('--write') && !result.unchanged,
    version: result.record.current_version, published_at: result.record.published_at, original_summary_sha256: expectedSummaryHash}));
}
