// Einmalige Umstellung auf den Direktbetrieb (Entscheidung Natalie, 15.09.2026):
// Die alte Warteschlange wird nicht nachgeliefert. Alle unveröffentlichten
// Kandidaten werden sichtbar als "Warteschlange geschlossen" abgelegt; offene
// Aktualisierungen veröffentlichter Meldungen werden verworfen. Ab jetzt gilt
// LIFO für neue Meldungen. Veröffentlichte Texte bleiben unverändert.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVENT_RELEVANCE_VERSION, EVENT_EDITORIAL_POLICY_VERSION } from './event-relevance.mjs';
import { isMerged } from './living-files.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const files = { stories: path.join(ROOT, 'data/news/stories.json'), state: path.join(ROOT, 'data/news/state.json') };
export const BACKLOG_RETIREMENT_CODE = 'BACKLOG_RETIRED_DIRECT_OPERATION_2026_09_15';

export function retireBacklog(store, state, now) {
  const report = { retired_candidates: 0, dropped_pending_updates: 0, kept_published: 0 };
  store.stories = store.stories.map((story) => {
    if (isMerged(story)) return story;
    if (story.published) {
      report.kept_published += 1;
      if (!story.pending_update) return story;
      report.dropped_pending_updates += 1;
      const { pending_update: _pendingUpdate, ai_retry: _aiRetry, ...preserved } = story;
      return preserved;
    }
    if (story.listed === false) return story;
    report.retired_candidates += 1;
    const { pending_update: _p, pending_reason: _r, quality_retry_count: _c, quality_retry_after: _a, reassessment: _re, ai_retry: _ai, ...preserved } = story;
    return { ...preserved, listed: false, analysis_status: 'Warteschlange am 15.09.2026 geschlossen; Neustart im Direktbetrieb', rejected_at: now,
      rejection: { at: now, filter_version: EVENT_RELEVANCE_VERSION, editorial_policy_version: EVENT_EDITORIAL_POLICY_VERSION, reason_code: BACKLOG_RETIREMENT_CODE, quality_errors: [] } };
  });
  state.pending_story_ids = store.stories.filter((story) => !isMerged(story) && ((!story.published && story.listed !== false) || story.pending_update)).map((story) => story.story_id);
  store.updated_at = now;
  report.pending_after = state.pending_story_ids.length;
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const now = new Date().toISOString();
  const store = JSON.parse(fs.readFileSync(files.stories, 'utf8'));
  const state = JSON.parse(fs.readFileSync(files.state, 'utf8'));
  const report = retireBacklog(store, state, now);
  if (!process.argv.includes('--dry-run')) {
    fs.writeFileSync(files.stories, JSON.stringify(store, null, 2) + '\n');
    fs.writeFileSync(files.state, JSON.stringify(state, null, 2) + '\n');
  }
  console.log(JSON.stringify({ dry_run: process.argv.includes('--dry-run'), ...report }, null, 2));
}
