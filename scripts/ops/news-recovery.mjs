import { createHash } from 'node:crypto';

const MINUTE = 60_000;
const elapsed = (date, now) => (Date.parse(now) - Date.parse(date)) / MINUTE;
export const RECOVERY_WORKFLOWS = ['wirkungsticker.yml', 'deploy.yml'];
const active = runs => runs.some(run => run.status !== 'completed');

// Source dates control reader ordering. First visibility is measured separately;
// neither a fresh import ACK nor an old article's correction is a new article.
export function observeLiveNews(previous, feed, now) {
  if (!Array.isArray(feed?.items)) return { state: previous || null, summary: { verified: false } };
  const state = structuredClone(previous || { started_at: now, entries: {}, last_new_at: null });
  const baseline = !previous;
  const visible = feed.items.filter(item => item._woek_type === 'Wirkungsakte'
    && /^https:\/\/wirkungsoekonomie\.de\/wirkungsticker\/[a-z0-9-]+\/$/.test(item.url));
  for (const item of visible) {
    if (!state.entries[item.url]) {
      state.entries[item.url] = { first_seen_at: baseline ? null : now,
        source_at: item.date_published || null };
      if (!baseline) state.last_new_at = now;
    }
  }
  state.checked_at = now;
  const recent = Object.values(state.entries).filter(entry => entry.first_seen_at
    && elapsed(entry.first_seen_at, now) >= 0 && elapsed(entry.first_seen_at, now) <= 60);
  return { state, summary: { verified: true, observed_since: state.started_at,
    checked_at: now, visible_news: visible.length, last_new_at: state.last_new_at,
    new_visible_last_hour: recent.length,
    current_new_visible_last_hour: recent.filter(entry => elapsed(entry.source_at, now) >= 0
      && elapsed(entry.source_at, now) <= 360).length,
    observation_minutes: elapsed(state.started_at, now) } };
}

export function workflowChecks(snapshot, now) {
  if (!snapshot) return [{ id: 'delivery-workflows', name: 'Auslieferungsläufe', ok: false,
    reason: 'Der Zustand der Import- und Veröffentlichungsläufe ist nicht prüfbar.', immediate: false }];
  return RECOVERY_WORKFLOWS.map(workflow => {
    const runs = snapshot[workflow] || [];
    const latest = [...runs].filter(run => run.status === 'completed'
      && !['cancelled', 'skipped', 'neutral'].includes(run.conclusion))
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
    const stuck = runs.some(run => run.status !== 'completed' && elapsed(run.created_at, now) > 65);
    const failed = latest?.status === 'completed' && ['failure', 'timed_out', 'action_required'].includes(latest.conclusion);
    return { id: `delivery-${workflow}`, name: workflow === 'deploy.yml' ? 'Website-Auslieferung' : 'Nachrichtenimport',
      ok: !stuck && !failed, immediate: Boolean(failed),
      reason: stuck ? 'Ein Auslieferungslauf wartet oder arbeitet seit über 65 Minuten.'
        : failed ? 'Der letzte Lauf ist fehlgeschlagen. Fertige Ergebnisse sind damit nicht als ausgeliefert bestätigt.'
          : 'Kein fehlgeschlagener oder überfälliger Lauf.' };
  });
}

export function planRecovery({ head, snapshot, pendingPublication, bridge, bridgeMode, state, now }) {
  if (!/^[a-f0-9]{40}$/.test(head || '') || !snapshot
    || RECOVERY_WORKFLOWS.some(key => !Array.isArray(snapshot[key]))) return [];
  const attempts = state?.recovery_attempts || [];
  // One attempt per workflow and source commit, at most four/day. A failed or
  // ambiguous request remains consumed. No escalating retries or paid repairs.
  if (attempts.filter(attempt => elapsed(attempt.at, now) >= 0 && elapsed(attempt.at, now) < 1440).length >= 4) return [];
  const needs = [
    ['deploy.yml', Number(pendingPublication) > 0],
    ['wirkungsticker.yml', bridgeMode && bridge?.reachable === true
      && elapsed(bridge.poll_at, now) >= 0 && elapsed(bridge.poll_at, now) <= 15
      && Number(bridge.output_wait_minutes) > 10],
  ];
  for (const [workflow, needed] of needs) {
    if (!needed || active(snapshot[workflow])) continue;
    const key = createHash('sha256').update(`${workflow}:${head}`).digest('hex');
    if (attempts.some(attempt => attempt.key === key || elapsed(attempt.at, now) < 30)) continue;
    return [{ key, workflow, head, at: now, status: 'reserved' }];
  }
  return [];
}

export async function recoverDelivery({ state, actions, save, refresh, dispatch }) {
  for (const action of actions) {
    if (!RECOVERY_WORKFLOWS.includes(action.workflow)) throw new Error('MONITOR_RECOVERY_WORKFLOW_INVALID');
    const fresh = await refresh(action.workflow);
    // Never run a stale plan after main moved, or compete with a real writer.
    if (fresh.head !== action.head || !Array.isArray(fresh.runs) || active(fresh.runs)) continue;
    state.recovery_attempts ||= [];
    if (state.recovery_attempts.some(attempt => attempt.key === action.key)) continue;
    const attempt = { ...action };
    state.recovery_attempts.push(attempt);
    await save(); // Must succeed BEFORE the remote side effect.
    try {
      await dispatch(action.workflow, action.workflow === 'wirkungsticker.yml'
        ? { ref: 'main', inputs: { bridge_phase: 'import', request_id: `recovery-${action.key.slice(0, 16)}` } }
        : { ref: 'main' }); // Full normal deployment; every release gate remains.
      attempt.status = 'dispatched';
    } catch {
      attempt.status = 'dispatch_uncertain';
    }
    await save();
  }
}
