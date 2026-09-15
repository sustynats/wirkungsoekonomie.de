// Beauftragt die vollständige Neubewertung des Wirkungspotenzials für die
// jüngsten veröffentlichten Meldungen ohne komplettes, freigegebenes Profil.
// Je Meldung entsteht genau ein bezahlter Aufruf im nächsten regulären Lauf;
// Fakten, Quellen und Veröffentlichungsdatum bleiben erhalten.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { modelledPublicationIssues } from './impact-scope.mjs';
import { isMerged } from './living-files.mjs';
import { assessmentBasis } from './migrate-impact-assessments.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const files = { stories: path.join(ROOT, 'data/news/stories.json'), state: path.join(ROOT, 'data/news/state.json') };

export function needsPotentialRepair(story) {
  if (!story.published || story.listed === false || isMerged(story) || story.manual_authority || story.book) return false;
  const assessment = story.impact_assessment;
  return !assessment || assessment.version !== '2.1' || modelledPublicationIssues(assessment).length > 0
    || story.impact_semantic_review?.status !== 'ready' || assessment.publication_status !== 'ready';
}

// Ein als freigegeben markiertes 2.1-Profil mit leeren Dimensionen ist kein
// vollständiges Profil. Es wird auf "unvollständig" zurückgestuft: Artikel und
// Texte bleiben online, Ring und Balken zeigen "offen", bis die Neubewertung
// das Gate passiert. Beide Kopien werden gleich behandelt, die Basis neu gebunden.
export function normalizeIncompleteReleases(store, now) {
  const changed = [];
  for (const story of store.stories) {
    if (!story.published || isMerged(story) || story.manual_authority || story.book) continue;
    const assessment = story.impact_assessment;
    if (assessment?.version !== '2.1' || !modelledPublicationIssues(assessment).length) continue;
    if (assessment.publication_status !== 'ready' && story.impact_semantic_review?.status !== 'ready') continue;
    for (const copy of [assessment, story.analysis?.impact_assessment, story.versions?.at(-1)?.analysis?.impact_assessment]) {
      if (copy && copy.version === '2.1') copy.publication_status = 'needs_reassessment';
    }
    if (story.impact_semantic_review) story.impact_semantic_review = { ...story.impact_semantic_review, status: 'incomplete', downgraded_at: now, downgrade_reason: 'BLANK_DIMENSIONS_DIRECT_OPERATION' };
    story.impact_assessment_basis = assessmentBasis(story);
    changed.push(story.story_id);
  }
  return changed;
}

export function queueReassessment(store, state, now, { limit = 30 } = {}) {
  const newest = store.stories.filter((story) => story.published && story.listed !== false && !isMerged(story))
    .sort((a, b) => String(b.published_at || '').localeCompare(String(a.published_at || ''))).slice(0, Math.max(0, limit));
  const queued = [];
  for (const story of newest) {
    if (!needsPotentialRepair(story) || story.pending_update?.impact_reassessment) continue;
    delete story.ai_retry; delete story.review_checkpoint;
    story.pending_update = { detected_at: now, content_hash: story.content_hash, sources: story.sources, reason: 'IMPACT_REASSESSMENT_REQUESTED',
      quality_errors: [], quality_retry_count: 0, quality_retry_after: null, reassessment: false, fresh: false, impact_reassessment: true,
      consolidation: false, source_integrity: story.source_integrity };
    queued.push({ story_id: story.story_id, published_at: story.published_at, title: story.title });
  }
  state.pending_story_ids = [...new Set([...(state.pending_story_ids || []), ...queued.map((item) => item.story_id)])];
  store.updated_at = now;
  return { checked: newest.length, queued };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const limit = Number((process.argv.find((arg) => arg.startsWith('--limit=')) || '--limit=30').slice('--limit='.length));
  const now = new Date().toISOString();
  const store = JSON.parse(fs.readFileSync(files.stories, 'utf8'));
  const state = JSON.parse(fs.readFileSync(files.state, 'utf8'));
  const downgraded = normalizeIncompleteReleases(store, now);
  const report = queueReassessment(store, state, now, { limit });
  report.downgraded = downgraded;
  if (!process.argv.includes('--dry-run') && (report.queued.length || downgraded.length)) {
    fs.writeFileSync(files.stories, JSON.stringify(store, null, 2) + '\n');
    fs.writeFileSync(files.state, JSON.stringify(state, null, 2) + '\n');
  }
  console.log(JSON.stringify({ dry_run: process.argv.includes('--dry-run'), limit, checked: report.checked, downgraded_incomplete_releases: downgraded.length, queued_count: report.queued.length, queued: report.queued }, null, 2));
}
