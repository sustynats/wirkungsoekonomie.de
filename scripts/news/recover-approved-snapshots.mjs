// Explicit offline recovery only. Never generates, rewrites or approves text.
// Each snapshot must come from a retained, completed runner artifact. A later
// editor's version on main is protected; snapshots are not full-store rollbacks.
import { isDeepStrictEqual as equal } from 'node:util';

const byId = rows => new Map(rows.map(row => [row.story_id, row]));
const privateFormat = row => row?.manual_only === true || row?.automation_policy === 'manual_only'
  || row?.format === 'book_and_impact' || row?.content_type === 'book_and_impact';

export function recoverApprovedSnapshots({ baseline, current, snapshots, now, validate }) {
  if (!Number.isFinite(Date.parse(now)) || typeof validate !== 'function') throw Error('RECOVERY_ARGUMENTS_INVALID');
  const old = byId(baseline.stories), present = byId(current.stories), merged = byId(current.stories);
  const accepted = new Map(), held = [];
  for (const snapshot of [...snapshots].sort((a, b) => a.at.localeCompare(b.at))) {
    if (!Number.isFinite(Date.parse(snapshot.at)) || !snapshot.run_id) throw Error('RECOVERY_SNAPSHOT_INVALID');
    for (const row of snapshot.stories) {
      if (!row?.story_id || !row.published || row.listed === false || !row.analysis
          || row.analysis.publication_recommendation !== true) continue;
      if (privateFormat(row) || privateFormat(present.get(row.story_id))) continue;
      const before = old.get(row.story_id), live = present.get(row.story_id);
      // A repeated unchanged baseline from a later runner is NOT a new edition.
      if (equal(row.analysis, before?.analysis) && row.published === before?.published) continue;
      if (!equal(live, before)) { held.push({ story_id: row.story_id, run_id: snapshot.run_id, reason: 'CURRENT_EDITORIAL_CHANGE' }); continue; }
      const errors = validate(row);
      if (errors.length) { held.push({ story_id: row.story_id, run_id: snapshot.run_id, reason: 'QUALITY_GATE', errors }); continue; }
      merged.set(row.story_id, { ...structuredClone(row), publication_recovery: {
        recovered_at: now, prepared_at: row.publish_ready_at || row.updated_at,
        github_run_id: snapshot.run_id, artifact_id: snapshot.artifact_id,
      } });
      accepted.set(row.story_id, { story_id: row.story_id, title: row.title, slug: row.slug,
        run_id: snapshot.run_id, artifact_id: snapshot.artifact_id, updated_existing: Boolean(before?.published) });
    }
  }
  return { store: { ...current, stories: [...merged.values()],
    ...(accepted.size ? { updated_at: now, public_updated_at: now } : {}) }, accepted: [...accepted.values()], held };
}

export function recoverSnapshotUsage(current, snapshots, now) {
  const runs = new Map(current.runs.map(row => [row.run_id, row]));
  const starts = new Set(current.runs.map(row => row.started_at));
  const recovered = [];
  for (const snapshot of snapshots) for (const row of snapshot.usage || []) {
    if (!row.run_id || !Number.isFinite(Date.parse(row.started_at))) throw Error('RECOVERY_USAGE_INVALID');
    if (runs.has(row.run_id) || starts.has(row.started_at)) continue;
    const noCall = row.ai === null && row.counts?.ai_requests === 0;
    if (!noCall && (!Number.isFinite(row.ai?.estimated_cost_usd) || row.ai.estimated_cost_usd < 0)) throw Error('RECOVERY_COST_INVALID');
    const copy = structuredClone(row);
    // The failed runner prepared articles; it did not publish them. Accounting
    // for that paid work must not claim it was already delivered to readers.
    copy.recovery = { recovered_at: now, github_run_id: snapshot.run_id, artifact_id: snapshot.artifact_id,
      publication_committed: false, report_published_stories: copy.counts?.published_stories || 0,
      report_updated_stories: copy.counts?.updated_stories || 0 };
    copy.counts = { ...copy.counts, published_stories: 0, updated_stories: 0 };
    runs.set(row.run_id, copy); starts.add(row.started_at); recovered.push(row.run_id);
  }
  return { usage: { ...current, runs: [...runs.values()] }, recovered };
}
