import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { coverageAudit, observedMajorEvents } from './coverage-audit.mjs';
import { loadNewsRegistry } from './registry.mjs';
import { sourceAccess } from './access-policy.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const berlinDay = value => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
const validTime = value => Number.isFinite(Date.parse(value));
export const berlinDayEnd = date => {
  const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Berlin',hour:'2-digit',hourCycle:'h23'}).format(new Date(`${date}T12:00:00Z`)));
  return new Date(Date.parse(date)+86400000-(hour-12)*3600000-1).toISOString();
};
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const cell = value => String(value ?? '–').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');

export function auditDay({ date, now, newsroom, stories, report, registry }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !validTime(date) || new Date(date).toISOString().slice(0,10) !== date) throw new Error('AUDIT_DATE_INVALID');
  const allowed = new Set(registry.sources.filter(source => source.enabled && sourceAccess(source).allowed).map(source => source.source_id));
  // The canonical store may include reviewed publications/recoveries after the
  // last automatic run. Its report is pipeline context, not an audit cutoff.
  const snapshotTime = now;
  const items = Object.values(newsroom.source_items || {}).filter(item => allowed.has(item.source_id) && validTime(item.published_at) && berlinDay(item.published_at) === date);
  const recordedDecisions = (newsroom.decisions || []).filter(item => validTime(item.at) && Date.parse(item.at)<=Date.parse(snapshotTime));
  const decisions = recordedDecisions.filter(item => berlinDay(item.at) === date);
  const observed = observedMajorEvents(items, snapshotTime, { limit: 1000, hours: 48 });
  const selectedIds = new Set(decisions.filter(item => item.decision === 'selected_for_verification').map(item => item.story_id));
  const result = coverageAudit({ items, stories:stories.filter(story=>!story.published_at || Date.parse(story.published_at)<=Date.parse(snapshotTime)), decisions: recordedDecisions, selectedIds, now: snapshotTime, observed,
    sourceFunnel: validTime(report?.started_at) && berlinDay(report.started_at) === date ? report.source_funnel : [] });
  return { ...result, requested_date: date, snapshot_at: snapshotTime, read_only: true, model_calls: 0,
    historical_caveat: 'Source records retain the latest observed version. This is a dated input/decision audit, not a reconstruction of deleted source versions or the whole web.',
    discovery_sources: registry.sources.filter(source => allowed.has(source.source_id)).map(source => ({ source_id: source.source_id, publisher_id: source.publisher_id, name: source.name, feed_url: source.feed_url, cadence_minutes: source.poll_minutes || null })),
    daily_decisions: { recorded: decisions.length, selected: selectedIds.size, local_rejections: decisions.filter(item => item.decision === 'local_relevance_below_threshold').length },
    pipeline_latest: report ? { started_at: report.started_at, completed_at: report.completed_at, ai_calls: report.ai_calls, prompt_chars_sent: report.prompt_chars_sent, estimated_cost_usd: report.estimated_cost_usd, budget_blocked: report.budget_blocked, queue: report.queue } : null };
}

export function auditMarkdown(audit) {
  const counts = audit.counts;
  return [`# Wirkungsticker-Audit · ${audit.requested_date}`, '', `Datenstand: ${audit.snapshot_at}. Nur freigegebene Quellen. Kein KI-Aufruf.`, '',
    `Rohdokumente: ${counts.discovered} · größere Ereignisse: ${counts.clustered_major} · veröffentlicht: ${counts.published} · nachzuprüfen: ${counts.potential_missed}.`, '',
    '„Nachzuprüfen“ umfasst auch berechtigte Evidenzvorbehalte. Ein Relevanzwert ist keine Publikationsfreigabe. Historische Rohdatensätze enthalten ihre zuletzt gespeicherte Fassung.', '',
    '| Ereignis | Wert / Priorität | Quellenursprünge¹ | Status | Ursache / Klasse |', '| --- | --- | --- | --- | --- |',
    ...audit.top_events.map(row => `| ${cell(row.canonical_title)} | ${row.total_relevance_score} / ${row.priority} | ${row.independent_source_count} | ${cell(row.selection_status)} | ${cell(row.rejection_reason || row.selection_reason)} / ${row.failure_class || '–'} |`), '',
    '¹ Mögliche Ursprünge nach Herausgeber-/Agentur-/Textabgleich, keine bestätigte Unabhängigkeit.', '',
    '## Themenabdeckung (letzte sechs Stunden)', '', ...Object.entries(audit.category_coverage).map(([key,value]) => `- ${key}: ${value}`), '',
    '## Nachprüfung', '', ...audit.potential_missed_news.map(row => `- ${row.event_id}: ${cell(row.canonical_title)} — ${row.failure_class || 'offen'}; ${cell(row.rejection_reason || row.selection_reason)}`), '',
    '## Warnungen', '', ...audit.alerts.map(row => `- ${row.code}: ${row.category || row.source_id || row.event_id || row.publisher_id}`), '',
    'Detailwerte, Original-URLs, Zeitstempel und Quellenfunnel stehen im gleichnamigen JSON-Bericht.', ''].join('\n');
}

export function main(args = process.argv.slice(2)) {
  const value = name => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length+3);
  const date = value('date') || berlinDay(new Date());
  const report = read(path.join(ROOT, 'reports/wirkungsticker-latest-run.json'));
  const now = date === berlinDay(new Date()) ? new Date().toISOString() : berlinDayEnd(date);
  const audit = auditDay({ date, now, newsroom: read(path.join(ROOT,'data/news/newsroom.json')), stories: read(path.join(ROOT,'data/news/stories.json')).stories, report, registry: loadNewsRegistry(ROOT) });
  const markdown = auditMarkdown(audit);
  if (value('out')) {
    const dir = path.resolve(value('out')); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `wirkungsticker-audit-${date}.json`), JSON.stringify(audit, null, 2)+'\n');
    fs.writeFileSync(path.join(dir, `wirkungsticker-audit-${date}.md`), markdown);
  }
  process.stdout.write(args.includes('--json') ? JSON.stringify(audit,null,2)+'\n' : markdown);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
