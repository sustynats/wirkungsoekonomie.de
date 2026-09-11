import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildCaseFiles } from '../news/case-files.mjs';
import { reportOperationallyHealthy, sourceCoverageDegraded } from '../news/check-run-health.mjs';
import { summarizeSourceFunnel } from '../news/source-funnel.mjs';
import { operatingCostSummary, isImmediateNewsCostRun, usageCostStartedAt } from '../news/operating-cost.mjs';
import { bridgeSession } from '../news/bridge/remote.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MINUTE = 60_000;
export const STATE_BRANCH = 'codex/ops-monitor-state';
export const TARGETS = [
  { id: 'main', name: 'Hauptseite', url: 'https://wirkungsoekonomie.de/', marker: /Wirkungsökonomie/i },
  { id: 'news', name: 'Wirkungsticker', url: 'https://wirkungsoekonomie.de/wirkungsticker/', marker: /Wirkungsticker/i },
  { id: 'rss', name: 'Ticker-RSS', url: 'https://wirkungsoekonomie.de/wirkungsticker/feed.xml', marker: /<rss[\s>]/ },
  { id: 'academy', name: 'Akademie', url: 'https://akademie.wirkungsoekonomie.de/', marker: /Akademie/i },
  { id: 'parliament', name: 'Parlament', url: 'https://parlament.wirkungsoekonomie.de/', marker: /Parlament/i },
  { id: 'institute', name: 'Institut', url: 'https://institut.wirkungsoekonomie.de/', marker: /Institut/i },
  { id: 'api', name: 'Oracle-API', url: 'https://130.162.217.58.sslip.io/healthz', json: body => body.ok === true },
  { id: 'push', name: 'Push-Konfiguration', url: 'https://130.162.217.58.sslip.io/api/news-push/config', json: body => body.ok === true && body.enabled === true },
];

export function berlinParts(now) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(now)).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}
const age = (value, now) => value && Number.isFinite(Date.parse(value)) ? (Date.parse(now) - Date.parse(value)) / MINUTE : Infinity;
const uniqueRuns = usage => [...new Map((usage?.runs || []).map(run => [run.run_id, run])).values()];
const money = value => Number.isFinite(value) ? value.toFixed(2) : 'nicht verfügbar';
const merged = story => story.retirement?.reason_code === 'MERGED_INTO_LIVING_FILE';

export function publicationFlow(usage, report, now) {
  // Background enrichments and deep dives cannot prove that the immediate
  // news queue is progressing. Ordinary news updates/rejections still can.
  const rows = uniqueRuns(usage).filter(run => isImmediateNewsCostRun(run)
    && !String(run.run_id).startsWith('media-backfill-') && age(run.started_at, now) >= 0
    && age(run.started_at, now) <= 180 && age(run.completed_at, now) >= 0
    && Number.isFinite(Date.parse(run.completed_at))).sort((a, b) => Date.parse(a.started_at) - Date.parse(b.started_at));
  const observedMinutes = rows.length ? (Date.parse(rows.at(-1).completed_at) - Date.parse(rows[0].started_at)) / MINUTE : 0;
  const actions = rows.reduce((sum, run) => sum + Number(run.counts?.published_stories || 0) + Number(run.counts?.updated_stories || 0), 0);
  // Closing a queued candidate with a valid rejection/merge is progress too.
  // Older reports have no per-ID completion count; a shrinking queue is evidence.
  const completions = rows.reduce((sum, run) => sum + Math.max(Number(run.counts?.queue_completed || 0),
    Math.max(0, Number(run.queue?.before || 0) - Number(run.queue?.after ?? run.queue?.before ?? 0))), 0);
  const capacity = Number(report?.queue?.capacity || 0);
  const oldest = Number(report?.queue?.oldest_minutes || 0);
  const stalled = rows.length >= 3 && observedMinutes >= 120 && capacity > 0 && oldest >= 120
    && actions === 0 && completions === 0;
  return { stalled, observed_runs: rows.length, observed_minutes: observedMinutes, publication_actions: actions, queue_completed: completions, capacity };
}

export function summarizeNews({ report, usage, stories, liveFeed }, now) {
  const today = berlinParts(now).date;
  const yesterday = new Date(Date.parse(`${today}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  const rows = uniqueRuns(usage);
  const period = prefix => rows.filter(r => Number.isFinite(Date.parse(usageCostStartedAt(r))) && berlinParts(usageCostStartedAt(r)).date.startsWith(prefix));
  const costs = list => list.reduce((sum, r) => sum + (Number.isFinite(r.ai?.estimated_cost_usd) ? r.ai.estimated_cost_usd : 0), 0);
  const published = (date) => stories.filter(s => s.published_at && berlinParts(s.published_at).date === date).length;
  const todayRuns = period(today);
  const newsTodayRuns = todayRuns.filter(isImmediateNewsCostRun);
  const monthRuns = period(today.slice(0, 7));
  const fx = report?.budget_policy?.fx;
  const fxValid = Number.isFinite(fx?.rate_usd_per_eur) && fx.rate_usd_per_eur > 0 && age(fx.rate_date, now) >= 0 && age(fx.rate_date, now) <= 7 * 1440;
  // Display the worker's actual authorization, not a second budget policy.
  // A report from a previous UTC billing month cannot extend an exception.
  const sameBudgetMonth = Number.isFinite(Date.parse(report?.completed_at))
    && age(report.completed_at, now) >= 0
    && new Date(report.completed_at).toISOString().slice(0, 7) === new Date(now).toISOString().slice(0, 7);
  const authorizedBudgetEur = sameBudgetMonth && Number.isFinite(report?.budget_policy?.authorized_eur)
    && report.budget_policy.authorized_eur >= 0 ? report.budget_policy.authorized_eur : null;
  const underlyingActive = stories.filter(s => s.published && s.listed !== false && !merged(s));
  const caseState = buildCaseFiles(underlyingActive);
  // The public feeds intentionally expose only the current representative of
  // a multi-story case. Older members remain public on their detail URLs and
  // in the case timeline, so they are not publication failures.
  const active = underlyingActive.filter(story => {
    const caseFile = caseState.caseByStory.get(story.story_id);
    return !caseFile || caseFile.representative_id === story.story_id;
  });
  const live = new Map((liveFeed?.items || []).map(item => [item.url, item.date_modified || item.date_published]));
  const pendingPublication = active.filter(s => {
    const modified = s.last_updated || s.published_at;
    if (age(modified, now) < 45) return false;
    const url = `https://wirkungsoekonomie.de/wirkungsticker/${s.slug}/`;
    return !live.has(url) || Date.parse(live.get(url)) < Date.parse(modified);
  });
  const updatesToday = todayRuns.reduce((n, r) => n + Number(r.counts?.updated_stories || 0), 0);
  const newToday = published(today);
  const usdToday = costs(todayRuns);
  const newsActionsToday = newToday + newsTodayRuns.reduce((n, r) => n + Number(r.counts?.updated_stories || 0), 0);
  const pendingTotal = stories.filter(s => !merged(s) && (s.pending_update || (!s.published && s.listed !== false))).length;
  const legacyHolds = report?.quality_holds || [];
  const legacyCapacity = legacyHolds.filter(hold => /BUDGET|LIMIT|DISABLED|RUN_TIME/.test(hold.reason || '')).length;
  const legacyTechnical = (report?.input_holds?.length || 0) + legacyHolds.filter(hold => /PROVIDER_UNAVAILABLE|OUTPUT_INVALID/.test(hold.reason || '')).length;
  const legacyEditorial = legacyHolds.length - legacyCapacity - legacyHolds.filter(hold => /PROVIDER_UNAVAILABLE|OUTPUT_INVALID/.test(hold.reason || '')).length + (report?.source_integrity_holds?.length || 0);
  const queue = report?.queue ? { ...report.queue, total: report.queue.total ?? report.queue.after ?? pendingTotal } : {
    status: legacyTechnical ? 'draining' : pendingTotal ? 'draining' : legacyEditorial ? 'editorial_holds' : 'clear',
    total: pendingTotal,
    capacity: legacyCapacity + Math.max(0, pendingTotal - legacyCapacity - legacyTechnical - legacyEditorial),
    technical: legacyTechnical,
    editorial: legacyEditorial,
    oldest_minutes: null,
    oldest_technical_minutes: null,
  };
  // Older reports called every retryable queue "draining", even when the
  // authenticated service had refused all further budget reservations.
  if ((report?.budget_blocked || report?.budget_stage >= 3)
    && Number(queue.capacity || 0) + Number(queue.technical || 0) > 0) {
    queue.status = 'budget_blocked';
    queue.budget_blocked = true;
  }
  const dailySourceFunnel = summarizeSourceFunnel(newsTodayRuns.flatMap(run => run.source_funnel || []));
  const latestSourceFunnel = summarizeSourceFunnel(report?.source_funnel || []);
  const dailyPipeline = newsTodayRuns.reduce((total, run) => {
    const counts = run.counts || {};
    total.feedItems += Number(counts.feed_entries_fetched || 0);
    total.changedItems += Number(counts.feed_entries_new || 0) + Number(counts.feed_entries_updated || 0) + Number(counts.feed_entries_backfilled || 0);
    total.candidates += Number(counts.story_clusters || 0);
    if (Number.isFinite(counts.eligible_stories)) {
      total.eligibleKnown = true;
      total.eligible += Number(counts.eligible_stories);
    }
    total.aiSelected += Number(counts.ai_stories || 0);
    total.localRejections += Number(counts.locally_rejected || 0);
    total.publicationActions += Number(counts.published_stories || 0) + Number(counts.updated_stories || 0);
    return total;
  }, { feedItems: 0, changedItems: 0, candidates: 0, eligible: 0, eligibleKnown: false, aiSelected: 0, localRejections: 0, publicationActions: 0 });
  return {
    today, yesterday, active: active.length, underlyingActive: underlyingActive.length,
    caseCount: caseState.cases.length, live: liveFeed?.items?.length ?? null,
    newToday, newYesterday: published(yesterday), updatesToday, newsActionsToday,
    usdToday, usdYesterday: costs(period(yesterday)), usdMonth: costs(monthRuns),
    usdPerNewsAction: newsActionsToday ? costs(newsTodayRuns) / newsActionsToday : null,
    authorizedBudgetEur,
    eurMonthWithTaxReserve: fxValid ? costs(monthRuns) / fx.rate_usd_per_eur * 1.19 : null,
    missingCostRuns: monthRuns.filter(r => Number(r.counts?.ai_requests ?? r.counts?.ai_stories ?? 0) > 0 && !Number.isFinite(r.ai?.estimated_cost_usd)).length,
    runCompleted: report?.completed_at || null, runAgeMinutes: age(report?.completed_at, now),
    pendingCount: stories.filter(s => !merged(s) && (s.pending_update || (!s.published && s.listed !== false))).length,
    pendingPublication: pendingPublication.length,
    sourceFailures: Number(report?.source_failures || 0),
    activeSources: (report?.source_health || []).filter(s => s.status === 'active').length,
    queue,
    publicationFlow: publicationFlow(usage, report, now),
    operatingCosts: operatingCostSummary(usage, report?.cost_monitoring?.started_at, fx, now),
    dailyPipeline,
    dailySourceFunnel,
    latestSourceFunnel,
    coverageAudit: report?.event_coverage || null,
  };
}

export function aiFailureReason(report = {}) {
  const error = String(report.ai_error || '');
  const http = /^AI_PROVIDER_ERROR:(\d{3})(?:\b|$)/.exec(error);
  let reason = error === 'AI_BUDGET_EXHAUSTED'
    ? 'Die freigegebene KI-Budgetgrenze ist erreicht. Keine weitere Anbieteranfrage; Nachrichten bleiben vorgemerkt. Kein Anbieterausfall.'
    : error === 'AI_INPUT_TOO_LARGE'
    ? 'Eine Akte überschreitet das lokale KI-Eingabelimit; dafür wurde keine KI-Anfrage gesendet. Dies belegt keinen Anbieterausfall.'
    : http
      ? `Die KI-Schnittstelle antwortete mit HTTP ${http[1]}; die Ursache ist noch nicht bestimmt.`
      : 'Die KI-Verarbeitung meldet einen Fehler; ein Anbieterausfall ist damit nicht nachgewiesen.';
  if (Number.isFinite(Date.parse(report.completed_at))) reason += ` Laufbericht: ${new Date(report.completed_at).toISOString()}.`;
  return reason;
}

export function evaluateChecks(data, now) {
  const summary = summarizeNews(data, now);
  const bridgeMode = data.processing_mode === 'dropbox_chatgpt_bridge' || data.report?.processing_mode === 'dropbox_chatgpt_bridge';
  const checks = (data.probes || []).map(p => ({ id: p.id, name: p.name, ok: p.ok, reason: p.ok ? 'erreichbar' : p.error, immediate: false }));
  const runOk = summary.runAgeMinutes >= 0 && summary.runAgeMinutes <= 45 && reportOperationallyHealthy(data.report);
  checks.push({ id: 'run', name: 'Automatische Nachrichtenläufe', ok: runOk, reason: runOk ? 'letzter Lauf betrieblich gesund' : summary.runAgeMinutes > 45 ? 'Seit über 45 Minuten kein abgeschlossener Laufbericht.' : 'Letzter Lauf meldet einen Betriebsfehler oder einen ungültigen Zeitstempel.', immediate: true });
  const providerDegraded = Boolean(data.report?.ai_provider_degraded || data.report?.ai_error);
  checks.push({ id: 'provider', name: 'KI-Verarbeitung', ok: !providerDegraded, reason: providerDegraded ? aiFailureReason(data.report) : 'kein Anbieterfehler im letzten Lauf', immediate: false });
  const technicalQueueDelay = summary.queue.status === 'technical_delay'
    || (Number(summary.queue.technical) > 0 && Number(summary.queue.oldest_technical_minutes) >= 90);
  const queueBudgetBlocked = summary.queue.status === 'budget_blocked' || Boolean(data.report?.budget_blocked || data.report?.budget_stage >= 3);
  checks.push({ id: 'queue', name: 'Nachrichten-Warteschlange', ok: !technicalQueueDelay, reason: technicalQueueDelay ? `${summary.queue.technical || 0} technisch blockierte Akte(n); älteste technische Blockade seit ${Math.round(summary.queue.oldest_technical_minutes || 0)} Minuten. Kapazitätswarteschlange: ${summary.queue.capacity || 0}; redaktionelle Ablehnungen: ${summary.queue.editorial || 0}.` : queueBudgetBlocked ? 'Die KI-Verarbeitung wartet auf Budgetfreigabe; ein laufender Abbau ist nicht nachgewiesen. Vorgemerkte Nachrichten bleiben erhalten.' : 'Keine überfällige technische Blockade; der tatsächliche Abbau wird separat geprüft.', immediate: false });
  const flow = summary.publicationFlow;
  checks.push({ id: 'publication-flow', name: 'Fortschritt der Nachrichtenverarbeitung', ok: !flow.stalled, reason: flow.stalled
    ? `${flow.observed_runs} gespeicherte Läufe über mindestens zwei Stunden ohne Veröffentlichung, Aktualisierung oder abgeschlossene Warteschlangenprüfung; ${flow.capacity} Kandidaten warten auf Verarbeitung. Budget- und Auswahlsteuerung prüfen; dies belegt keinen Anbieterausfall.`
    : 'Kein belegter Stillstand einer wartenden Nachrichtenverarbeitung.', immediate: false });
  const imageErrors = new Set(['HIGGSFIELD_RETRY_EXHAUSTED', 'HIGGSFIELD_AUTH_UNAVAILABLE', 'HIGGSFIELD_NOT_CONFIGURED', 'HIGGSFIELD_PROVIDER_UNAVAILABLE']);
  const failedImages = data.stories.filter(s => s.published && s.listed !== false && imageErrors.has(s.title_image?.refresh_failure || s.title_image?.fallback_reason)).length;
  checks.push({ id: 'images', name: 'Titelbilder', ok: failedImages === 0, reason: `${failedImages} ${failedImages === 1 ? 'Symbolbild' : 'Symbolbilder'} mit technischem Fehler; vorhandene Bilder oder Wirkungskarten bleiben sichtbar. Nachrichten werden dadurch nicht zurückgehalten.`, immediate: false });
  checks.push({ id: 'sources', name: 'Quellenabruf', ok: !sourceCoverageDegraded(data.report), reason: `${summary.sourceFailures} fehlgeschlagene Quellenabrufe im letzten Lauf.`, immediate: false });
  const gaps = (summary.coverageAudit?.alerts || []).filter(item => item.severity === 'warning' && /CATEGORY_COVERAGE_GAP|BREAKING_PUBLICATION_GAP/.test(item.code));
  const freshCoverage = age(summary.coverageAudit?.checked_at, now) >= 0 && age(summary.coverageAudit?.checked_at, now) <= 45;
  checks.push({ id: 'editorial-coverage', name: 'Redaktionelle Themenabdeckung', ok: !freshCoverage || !gaps.length, kind: 'editorial',
    reason: gaps.length ? `${gaps.length} Hinweise auf überfällige Themen-/Ereignislücken im beobachteten Quellenbestand. Nachprüfungen laufen in der bestehenden Queue; hohe Relevanz ersetzt keine Belege. Kein Nachweis eines KI-Ausfalls.` : 'Keine belegte überfällige Abdeckungslücke im aktuellen Beobachtungsausschnitt.', immediate: false });
  checks.push({ id: 'publication', name: 'Veröffentlichung', ok: data.liveFeed !== null && summary.pendingPublication === 0, reason: data.liveFeed === null ? 'Live-Feed nicht lesbar.' : `${summary.pendingPublication} sichtbare Lagen oder Einzelakten seit über 45 Minuten nicht im Live-Feed.`, immediate: false });
  const budgetBlocked = Boolean(data.report?.budget_blocked || data.report?.budget_stage >= 3 || data.report?.budget_policy?.status !== 'ok' || summary.usdMonth >= Number(data.report?.monthly_budget_usd));
  checks.push({ id: 'budget', name: 'KI-Monatsbudget', ok: !budgetBlocked, reason: budgetBlocked ? 'Monatslimit oder Wechselkurs-Sicherheitsgate hält neue KI-Anfragen an; die Warteschlange bleibt erhalten.' : 'innerhalb der technischen Budgetgrenze', immediate: false });
  if (bridgeMode) {
    summary.processing_mode = 'dropbox_chatgpt_bridge'; summary.bridge = data.bridge;
    // Retire obsolete API incidents silently, including pending old notifications.
    for (const check of checks) if (['run','provider','queue','publication-flow','images','sources','editorial-coverage','budget'].includes(check.id)) Object.assign(check,{ok:true,retired:true});
    const b=data.bridge || {}, paused=data.discovery_enabled===false;
    summary.queue={total:Number(b.open_count||0),capacity:0,technical:Number(b.errors||0),editorial:0,status:b.status||'unbekannt'};
    summary.runCompleted=b.poll_at||null;
    checks.push(
      {id:'bridge-access',name:'Dropbox-Bridge',ok:b.reachable===true,reason:'Der private Oracle-Bridge-Dienst ist nicht erreichbar.',immediate:false},
      {id:'bridge-poll',name:'Dropbox-Ausgabeprüfung',ok:b.reachable!==true || age(b.poll_at,now)<=15 && !(b.poll_error?.consecutive_failures>=2),reason:'Seit über 15 Minuten keine erfolgreiche Ausgabeprüfung oder wiederholter Dropbox-Verbindungsfehler.',immediate:false},
      {id:'bridge-discovery',name:'Bridge-Quellenlauf',ok:paused || b.reachable!==true || age(b.discovery_last_success,now)<=120,reason:'Seit über zwei Stunden kein erfolgreicher Bridge-Quellenlauf.',immediate:false},
      {id:'bridge-sources',name:'Bridge-Quellenabdeckung',ok:paused || !sourceCoverageDegraded({...b.discovery,sources_scheduled:Number(b.discovery?.source_successes||0)+Number(b.discovery?.source_failures||0)}),reason:'Der aktuelle Discovery-Lauf meldet erhebliche Ausfälle beim Quellenabruf.',immediate:false},
      {id:'bridge-queue',name:'Bridge-Verarbeitung',ok:b.reachable!==true || Number(b.oldest_claim_minutes||0)<=120,reason:'Ein tatsächlich übernommener Bridge-Auftrag wartet seit über zwei Stunden auf Rückgabe.',immediate:false},
      {id:'bridge-queue-size',name:'Redaktionsrückstau',ok:b.reachable!==true || Number(b.open_count||0)<=10,reason:`${Number(b.open_count||0)>20?'QUEUE_CRITICAL':'QUEUE_WARNING'}: ${Number(b.open_count||0)} offene Bridge-Aufträge. Historischen Backfill zurückstellen; aktuelle Meldungen und Updates weiter erfassen.`,immediate:false},
      {id:'bridge-processor',name:'ChatGPT-Redaktionsworker',ok:b.reachable!==true || !Number(b.open_count||0) || b.processor_health?.processor_available===true && age(b.processor_health.checked_at,now)<=45,reason:'Offene Aufträge, aber kein frischer Lese-/Schreibnachweis eines tatsächlichen Automation-Workers. Ein erreichbarer Dropbox-Server ist kein Worker-Nachweis.',immediate:false},
      {id:'bridge-throughput',name:'Redaktionsdurchsatz',ok:b.reachable!==true || !b.processor_health?.alerts?.includes('PROCESSING_CAPACITY_INSUFFICIENT'),reason:'In zwei vollständig beobachteten Stunden kamen mehr Aufträge hinzu als abgeschlossen wurden.',immediate:false},
      {id:'bridge-review',name:'Fachliche Nachprüfung',ok:b.reachable!==true || !Number(b.review_required_count||0),reason:`${Number(b.review_required_count||0)} Wirkungsanalyse(n) benötigen nach dem zweiten Prüfpass redaktionelle Klärung. Die anderen Aufträge laufen weiter.`,immediate:false},
      {id:'bridge-import',name:'Übernahme fertiger Meldungen',ok:b.reachable!==true || Number(b.output_wait_minutes||0)<=10,reason:'Ein bereits erkanntes Ergebnis wartet seit über zehn Minuten auf Übernahme.',immediate:false},
      {id:'bridge-errors',name:'Bridge-Quarantäne',ok:!Number(b.errors||0),reason:`${Number(b.errors||0)} Bridge-Auftrag/Aufträge benötigen Prüfung. Keine erneute automatische KI-Verarbeitung.`,immediate:false},
      {id:'bridge-cost',name:'Bridge-Kostenschutz',ok:data.report?.processing_mode!=='dropbox_chatgpt_bridge' || Number(data.report.ai_calls||0)===0,reason:'Ein Bridge-Lauf meldet entgegen der Sperre einen KI-API-Aufruf.',immediate:true}
    );
  }
  return { checks, summary };
}

export function dailyReport(summary, checks) {
  const funnel = summary.dailyPipeline || {};
  const sourceTotals = summary.dailySourceFunnel?.totals || {};
  const productive = (summary.latestSourceFunnel?.productive || []).map(source => source.name).join(', ') || 'keine im letzten Lauf';
  const operating = summary.operatingCosts;
  const unit = operating?.news?.cost_per_first_publication_eur;
  return [
    `WÖk Tagesbericht · ${summary.today} · Europe/Berlin`,
    ...(summary.processing_mode==='dropbox_chatgpt_bridge' ? ['Betrieb: ChatGPT-Dropbox-Bridge für Redaktion und Analyse; Higgsfield ausschließlich für freigegebene Bilder. Keine Text-KI-API. Normale Verarbeitungs- und Prüfwartezeiten bleiben ohne Störungsmeldung.',`Bridge: ${summary.bridge?.status||'Status nicht verfügbar'}; Quellenlauf ${summary.bridge?.discovery_last_success||'noch nicht gestartet'}.`] : []),
    ...checks.filter(c => TARGETS.some(t => t.id === c.id)).map(c => `${c.ok ? '✓' : '⚠'} ${c.name}: ${c.ok ? 'erreichbar' : c.reason}`),
    `Ticker: ${summary.live ?? 'nicht verfügbar'} live · ${summary.active} aktuelle Lagen und Einzelakten aus ${summary.underlyingActive} aktiven Wirkungsakten${summary.caseCount ? ` · ${summary.caseCount} ${summary.caseCount === 1 ? 'Lageakte' : 'Lageakten'}` : ''}.`,
    `Erstveröffentlichungen gestern (${summary.yesterday}): ${summary.newYesterday}; heute bisher: ${summary.newToday} (inkl. später archivierter/zusammengeführter Akten).`,
    `Letzter Lauf: ${summary.runCompleted || 'nicht verfügbar'}; ${summary.pendingCount} offene Prüfungen, ${summary.activeSources} aktive Quellen.`,
    `Queue: ${summary.queue.total || 0} offen (${summary.queue.capacity || 0} Kapazität · ${summary.queue.technical || 0} technisch · ${summary.queue.editorial || 0} redaktionell); Status ${summary.queue.status || 'unbekannt'}.`,
    `Quellen-Funnel heute: ${funnel.feedItems || 0} Feed-Einträge → ${funnel.changedItems || 0} neu/aktualisiert → ${funnel.candidates || 0} Story-Kandidaten → ${funnel.eligibleKnown ? funnel.eligible : 'noch nicht historisch erfasst'} geeignet → ${funnel.aiSelected || 0} KI → ${funnel.publicationActions || 0} Veröffentlichungen/Aktualisierungen. Lokal verworfen: ${funnel.localRejections || 0}; redaktionelle Quellenbeiträge: ${sourceTotals.editorial_rejections || 0}.`,
    `Produktive Quellen im letzten Lauf: ${productive}.`,
    ...(summary.coverageAudit ? [`Ereignischeck (begrenzter Quellenbestand): ${summary.coverageAudit.counts.clustered_major} größere Ereignisse · ${summary.coverageAudit.counts.published} mit Veröffentlichung · ${summary.coverageAudit.counts.potential_missed} nachzuprüfen (einschließlich berechtigter Qualitätsvorbehalte).`] : []),
    `KI-Gesamtschätzung inkl. offener Reserven: gestern $${money(summary.usdYesterday)} · heute $${money(summary.usdToday)} · Monat $${money(summary.usdMonth)}.`,
    ...(operating ? [
      `Direkte Nachrichtenverarbeitung seit ${operating.started_at}: ${operating.news.first_publications} Erstveröffentlichungen · ${operating.news.updates} Aktualisierungen · ${operating.news.ai_requests} KI-Anfragen, inklusive Ablehnungen und Wiederholungen.`,
      unit !== null ? `KI-Kosten je Erstveröffentlichung inkl. Prüf-/Updateaufwand: geschätzt ${(unit * 100).toFixed(2)} Cent inkl. Steuerreserve; Ziel unter 4 Cent. ${operating.news.fallback_estimate_runs} Läufe mit Ersatzschätzung.` : 'KI-Kosten je Erstveröffentlichung noch nicht bestimmbar: keine Erstveröffentlichung oder unvollständige Kostendaten.',
      `WÖk-Analysen separat: ${operating.editorial.first_publications} neu · ${operating.editorial.updates} aktualisiert · $${money(operating.editorial.estimated_cost_usd)} geschätzter KI-Aufwand. Keine Anbieterabrechnung; Einrichtungsverbrauch bleibt im Monatsbudget enthalten.`,
      ...(operating.batch ? [`Batch-Hintergrundjobs separat im Messfenster: ${operating.batch.settled_jobs} abgeglichen · ${operating.batch.applied_jobs} angewendet · $${operating.batch.settled_cost_usd.toFixed(3)} nach Anbieter-Nutzungsdaten; $${operating.batch.reserved_cost_usd.toFixed(3)} für ${operating.batch.reserved_jobs} Aufträge reserviert. Enthält auch bezahlte Qualitätsablehnungen; keine neuen Nachrichten durch reine Nachprüfungen.`] : []),
    ] : []),
    summary.usdPerNewsAction !== null ? `Direkte Nachrichtenverarbeitung: geschätzte KI-Kosten je heutiger Erstveröffentlichung/Aktualisierung $${summary.usdPerNewsAction.toFixed(3)}; WÖk-Analysen und Batch separat.` : 'Heute noch keine veröffentlichte oder aktualisierte Akte für eine Kostenquote.',
    summary.eurMonthWithTaxReserve !== null ? `Monat umgerechnet inkl. 19 % Steuerreserve: ca. €${money(summary.eurMonthWithTaxReserve)} (${Number.isFinite(summary.authorizedBudgetEur) ? `Limit €${money(summary.authorizedBudgetEur)}` : 'Limit im aktuellen Monatsbericht nicht verfügbar'}).` : 'Euro-Umrechnung: kein ausreichend aktueller Kurs verfügbar.',
    `Kosten ohne Higgsfield-Abo/Bildcredits und Hosting; ${summary.missingCostRuns} KI-Läufe ohne verwertbaren Kostenwert. Keine Abrechnung.`,
    'Besucher/Besuche, Installationen, aktive Push-Nutzer und RSS-Nutzung: noch nicht in diesen Bericht integriert; nicht als null gezählt.',
    ...checks.filter(c => !c.ok && !TARGETS.some(t => t.id === c.id)).map(c => `⚠ ${c.name}: ${c.reason}`),
    'https://wirkungsoekonomie.de/wirkungsticker/',
  ].join('\n');
}

const eventId = value => createHash('sha256').update(value).digest('hex').slice(0, 24);
function enqueue(state, key, content) {
  const id = eventId(key);
  if (!state.outbox.some(e => e.id === id)) state.outbox.push({ id, content });
}

export function advanceState(previous, checks, summary, now, { reportNow = false } = {}) {
  const state = structuredClone(previous || { schema: 1, incidents: {}, outbox: [], dailyDate: null });
  if (state.schema !== 1 || !state.incidents || !Array.isArray(state.outbox)) throw new Error('MONITOR_STATE_INVALID');
  const stamp = new Date(now).toISOString();
  for (const check of checks) {
    let incident = state.incidents[check.id];
    if (check.retired) {
      if (incident) {
        const obsolete=new Set(['failed','recovered'].map(kind=>eventId(`${check.id}:${incident.firstSeen}:${kind}`)));
        state.outbox=state.outbox.filter(event=>!obsolete.has(event.id));
      }
      delete state.incidents[check.id]; continue;
    }
    if (check.ok) {
      if (incident?.active) enqueue(state, `${check.id}:${incident.firstSeen}:recovered`, `✓ WÖk-Störung behoben\n${check.name}\nPrüfung: ${stamp}`);
      delete state.incidents[check.id];
      continue;
    }
    if (!incident) incident = state.incidents[check.id] = { firstSeen: stamp, active: false };
    // A second independent observation (at least 5 min apart), or already aged run/budget failure.
    if (!incident.active && (check.immediate || age(incident.firstSeen, stamp) >= 5)) {
      incident.active = true;
      enqueue(state, `${check.id}:${incident.firstSeen}:failed`, `⚠ ${check.kind === 'editorial' ? 'WÖk-Abdeckungshinweis' : 'WÖk-Betriebsstörung'}\n${check.name}: ${check.reason}\nSeit: ${incident.firstSeen}\nhttps://github.com/sustynats/wirkungsoekonomie.de/actions/workflows/ops-discord-monitor.yml`);
    }
  }
  const date = berlinParts(now);
  if ((date.hour >= 8 || reportNow) && state.dailyDate !== date.date) {
    enqueue(state, `daily:${date.date}`, dailyReport(summary, checks));
    state.dailyDate = date.date;
  }
  return state;
}

export async function probe(target, fetchImpl = fetch) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchImpl(target.url, { signal: AbortSignal.timeout(12_000), headers: { 'user-agent': 'WOeK-Operations-Monitor/1.0', 'cache-control': 'no-cache' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const valid = target.json ? target.json(await response.json()) : target.marker.test(await response.text());
      if (!valid) throw new Error('Erwarteter Seiteninhalt fehlt');
      return { id: target.id, name: target.name, ok: true };
    } catch (error) {
      if (attempt === 1) return { id: target.id, name: target.name, ok: false, error: /^HTTP \d+$/.test(error.message) || error.message === 'Erwarteter Seiteninhalt fehlt' ? error.message : 'Zeitüberschreitung oder Verbindungsfehler' };
    }
  }
}

function discordParts(content) {
  if (typeof content !== 'string' || !content.length) throw new Error('MONITOR_DM_CONTENT_MISSING');
  const parts = [];
  let remaining = content;
  while (remaining.length > 1950) {
    let end = remaining.lastIndexOf('\n', 1949) + 1 || 1950;
    // A long individual line may need splitting, but never through an icon.
    if (/[\uD800-\uDBFF]/u.test(remaining[end - 1]) && /[\uDC00-\uDFFF]/u.test(remaining[end])) end--;
    parts.push(remaining.slice(0, end));
    remaining = remaining.slice(end);
  }
  if (remaining) parts.push(remaining);
  return parts;
}

export async function sendDiscord(event, { token, recipient, fetchImpl = fetch }) {
  if (!token || !/^\d{15,22}$/.test(recipient || '')) throw new Error('MONITOR_DM_CONFIGURATION_MISSING');
  const parts = discordParts(event.content);
  const headers = { authorization: `Bot ${token}`, 'content-type': 'application/json' };
  const channelResponse = await fetchImpl('https://discord.com/api/v10/users/@me/channels', { method: 'POST', headers, body: JSON.stringify({ recipient_id: recipient }), signal: AbortSignal.timeout(12_000) });
  if (!channelResponse.ok) throw new Error(`MONITOR_DM_CHANNEL_HTTP_${channelResponse.status}`);
  const channel = await channelResponse.json();
  if (!/^\d{15,22}$/.test(channel.id || '')) throw new Error('MONITOR_DM_CHANNEL_INVALID');
  // Keep the outbox event until every part succeeds. Stable per-part nonces
  // limit duplicates on retry; do not silently cut off final costs/warnings.
  for (const [index, content] of parts.entries()) {
    const nonce = index === 0 ? event.id : eventId(`${event.id}:part:${index}`);
    const response = await fetchImpl(`https://discord.com/api/v10/channels/${channel.id}/messages`, { method: 'POST', headers, body: JSON.stringify({ content, nonce, enforce_nonce: true, allowed_mentions: { parse: [] } }), signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error(`MONITOR_DM_SEND_HTTP_${response.status}`);
  }
}

export async function main() {
  const now = new Date().toISOString();
  const read = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  const repo = process.env.GITHUB_REPOSITORY || 'sustynats/wirkungsoekonomie.de';
  if (repo !== 'sustynats/wirkungsoekonomie.de') throw new Error('MONITOR_REPOSITORY_NOT_ALLOWED');
  const dryRun = process.argv.includes('--dry-run');
  const api = async (route, options = {}) => {
    const response = await fetch(`https://api.github.com/repos/${repo}/${route}`, { ...options, signal: AbortSignal.timeout(15_000), headers: { authorization: `Bearer ${process.env.GH_TOKEN}`, accept: 'application/vnd.github+json', 'content-type': 'application/json', 'x-github-api-version': '2022-11-28', ...options.headers } });
    if (options.allow404 && response.status === 404) return null;
    if (!response.ok) throw new Error(`MONITOR_STATE_HTTP_${response.status}`);
    return response.status === 204 ? null : response.json();
  };
  const probes = await Promise.all(TARGETS.map(t => probe(t)));
  let liveFeed = null;
  try {
    const response = await fetch('https://wirkungsoekonomie.de/wirkungsticker/feed.json', { signal: AbortSignal.timeout(12_000), cache: 'no-store' });
    if (response.ok) { const body = await response.json(); if (Array.isArray(body.items)) liveFeed = body; }
  } catch { /* Evaluated explicitly as unavailable, never a zero count. */ }
  const data = { probes, liveFeed, report: read('reports/wirkungsticker-latest-run.json'), usage: read('data/news/usage.json'), stories: read('data/news/stories.json').stories };
  data.processing_mode=process.env.WIRKUNGSTICKER_PROCESSING_MODE || data.report.processing_mode;
  data.discovery_enabled=process.env.WOEK_NEWS_BRIDGE_DISCOVERY_ENABLED!=='false';
  if(data.processing_mode==='dropbox_chatgpt_bridge') {
    try { data.bridge=await bridgeSession().monitor(); }
    catch { data.bridge={reachable:false}; }
  }
  const { checks, summary } = evaluateChecks(data, now);
  if (dryRun) { console.log(JSON.stringify({ checks, summary, report: dailyReport(summary, checks) }, null, 2)); return; }
  if (!process.env.GH_TOKEN || !process.env.WOEK_MONITOR_DISCORD_BOT_TOKEN || !/^\d{15,22}$/.test(process.env.WOEK_MONITOR_DISCORD_USER_ID || '')) throw new Error('MONITOR_DM_CONFIGURATION_MISSING');
  const statePath = 'monitor-state.json';
  const stored = await api(`contents/${statePath}?ref=${STATE_BRANCH}`, { allow404: true });
  let state = stored ? JSON.parse(Buffer.from(stored.content, 'base64').toString('utf8')) : null;
  let sha = stored?.sha;
  let persisted = JSON.stringify(state);
  const save = async () => {
    if (JSON.stringify(state) === persisted) return;
    const result = await api(`contents/${statePath}`, { method: 'PUT', body: JSON.stringify({ branch: STATE_BRANCH, message: 'Persist operations monitor delivery state', content: Buffer.from(`${JSON.stringify(state, null, 2)}\n`).toString('base64'), ...(sha ? { sha } : {}) }) });
    sha = result.content.sha;
    persisted = JSON.stringify(state);
  };
  if (!stored) {
    const branch = await api(`git/ref/heads/${STATE_BRANCH}`, { allow404: true });
    if (!branch) {
      // Dedicated state branch: never write monitor state, user identifiers or secrets to main.
      const head = await api('git/ref/heads/main');
      await api('git/refs', { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${STATE_BRANCH}`, sha: head.object.sha }) });
    }
  }
  state = advanceState(state, checks, summary, now, { reportNow: process.argv.includes('--report-now') });
  await save(); // Persist outbox BEFORE attempting delivery.
  let delivered = 0;
  while (state.outbox.length) {
    await sendDiscord(state.outbox[0], { token: process.env.WOEK_MONITOR_DISCORD_BOT_TOKEN, recipient: process.env.WOEK_MONITOR_DISCORD_USER_ID });
    state.outbox.shift();
    await save();
    delivered++;
  }
  console.log(JSON.stringify({ checked: checks.length, healthy: checks.filter(c => c.ok).length, activeIncidents: Object.keys(state.incidents).filter(k => state.incidents[k].active).length, delivered, dailyDate: state.dailyDate }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => { console.error(/^MONITOR_[A-Z0-9_]+$/.test(error.message) ? error.message : 'MONITOR_EXECUTION_FAILED'); process.exitCode = 1; });
