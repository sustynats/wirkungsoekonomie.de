import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import {
  downloadDropboxText,
  downloadDropboxTextIfPresent,
  dropboxAppReady,
  listDropboxFiles,
  normalizeDropboxPath,
  uploadDropboxText,
} from "@/lib/dropbox/app-client";
import { notifyGovernmentDailyIngest } from "@/lib/notifications/discord";
import {
  coverageFromHistory,
  dailyFilePattern,
  emptyDailyIngestState,
  governmentPublicStateHash,
  processDailyBundle,
  reviewTasksFromReport,
  sha256,
  type DailyBundle,
  type DailyIngestState,
  type DailyRunReport,
  type DeploymentGates,
} from "@/lib/government/daily-impact-ingest-core";

const defaultAnalysisPath = "/WÖK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis";
const defaultStatePath = "/WÖK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/technical-ingest";
const productionBaseUrl = "https://parlament.wirkungsoekonomie.de";

type DailyGroup = {
  date: string;
  jsonl?: string;
  markdown?: string;
  sources?: string;
};

function configuration() {
  return {
    analysisPath: normalizeDropboxPath(process.env.DROPBOX_GOVERNMENT_ANALYSIS_PATH ?? defaultAnalysisPath),
    statePath: normalizeDropboxPath(process.env.DROPBOX_GOVERNMENT_INGEST_STATE_PATH ?? defaultStatePath),
    deploymentHook: process.env.GOVERNMENT_DAILY_PRODUCTION_DEPLOY_HOOK,
  };
}

export function governmentDailyIngestReady() {
  return dropboxAppReady();
}

function localGates() {
  return JSON.parse(readFileSync(path.join(process.cwd(), "data", "government", "impact-cases", "deployment-gates.json"), "utf8")) as DeploymentGates;
}

function localBlockers() {
  const value = JSON.parse(readFileSync(path.join(process.cwd(), "data", "government", "impact-cases", "data-quality-blockers.json"), "utf8")) as { blocked_object_ids: string[] };
  return new Set(value.blocked_object_ids);
}

function knownGovernmentActions() {
  const lines = readFileSync(path.join(process.cwd(), "data/government/public/government-actions.jsonl"), "utf8").split(/\r?\n/).filter(Boolean);
  return new Set(lines.map((line) => (JSON.parse(line) as { government_action_id: string }).government_action_id));
}

function knownParliamentCases() {
  const ids = new Set<string>();
  const actions = readFileSync(path.join(process.cwd(), "data/government/public/government-actions.jsonl"), "utf8").split(/\r?\n/).filter(Boolean);
  for (const line of actions) {
    const action = JSON.parse(line) as { parliamentary_case_refs?: string[] };
    for (const id of action.parliamentary_case_refs ?? []) ids.add(id);
  }
  return ids;
}

function factActionCount() {
  return readFileSync(path.join(process.cwd(), "data/government/public/government-actions.jsonl"), "utf8").split(/\r?\n/).filter(Boolean).length;
}

function groupDailyFiles(files: Array<{ name: string; path_display: string }>) {
  const groups = new Map<string, DailyGroup>();
  for (const file of files) {
    let match = file.name.match(dailyFilePattern);
    if (match) {
      const group = groups.get(match[1]) ?? { date: match[1] };
      group.jsonl = file.path_display;
      groups.set(match[1], group);
      continue;
    }
    match = file.name.match(/^GOVERNMENT-DAILY-(\d{4}-\d{2}-\d{2})\.md$/);
    if (match) {
      const group = groups.get(match[1]) ?? { date: match[1] };
      group.markdown = file.path_display;
      groups.set(match[1], group);
      continue;
    }
    match = file.name.match(/^GOVERNMENT-DAILY-SOURCES-(\d{4}-\d{2}-\d{2})\.md$/);
    if (match) {
      const group = groups.get(match[1]) ?? { date: match[1] };
      group.sources = file.path_display;
      groups.set(match[1], group);
    }
  }
  return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date));
}

async function loadState(statePath: string): Promise<DailyIngestState> {
  const remote = await downloadDropboxTextIfPresent(`${statePath}/daily-ingest-state.json`);
  if (!remote) return emptyDailyIngestState();
  const state = JSON.parse(remote) as DailyIngestState;
  if (state.schema_version !== "1.0" || !Array.isArray(state.ledger) || !Array.isArray(state.history)) {
    throw new Error("Dropbox daily ingest state has an unsupported structure.");
  }
  return { ...state, review_queue: Array.isArray(state.review_queue) ? state.review_queue : [] };
}

function addReviewTasks(state: DailyIngestState, report: DailyRunReport, sourceFile: string, now: string) {
  const existing = new Set(state.review_queue.map((task) => task.task_id));
  const additions = reviewTasksFromReport(report, sourceFile, now).filter((task) => !existing.has(task.task_id));
  if (!additions.length) return state;
  return { ...state, updated_at: now, review_queue: [...state.review_queue, ...additions] };
}

function updateLedgerDeployment(state: DailyIngestState, sourceFile: string, deployStatus: "BLOCKED" | "REQUESTED" | "DEPLOYED" | "FAILED", deployCommit: string | null) {
  return {
    ...state,
    ledger: state.ledger.map((entry) => entry.source_file === sourceFile ? { ...entry, deploy_status: deployStatus, deploy_commit: deployCommit } : entry),
  };
}

async function verifyPendingDeployments(state: DailyIngestState) {
  const pending = state.ledger.filter((entry) => entry.deploy_status === "REQUESTED" && entry.expected_public_hash);
  if (!pending.length) return state;
  let publicHash: string | null = null;
  try {
    const response = await fetch(`${productionBaseUrl}/api/autopilot/version`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (response.ok) publicHash = ((await response.json()) as { government_public_hash?: string }).government_public_hash ?? null;
  } catch {
    return state;
  }
  if (!publicHash) return state;
  return {
    ...state,
    ledger: state.ledger.map((entry) => entry.deploy_status === "REQUESTED" && entry.expected_public_hash === publicHash
      ? { ...entry, deploy_status: "DEPLOYED" as const }
      : entry),
  };
}

function publicDigestItems(entries: ReturnType<typeof processDailyBundle>["accepted"]) {
  return entries
    .filter((entry) => entry.classification !== "FACT_ONLY")
    .map((entry) => ({
      title: entry.record.title,
      summary: entry.record.impact_summary.public_summary,
      url: `${productionBaseUrl}/wirkungsfaelle/${encodeURIComponent(entry.record.impact_case_id)}`,
      section: entry.record.analysis_mode === "IMPACT_REALITY_CHECK" ? "REALITY_CHECK" as const : "WIRKUNGSANALYSE" as const,
      topics: ["ALL_UPDATES", "PUBLISHED_CHECKS"] as const,
    }));
}

async function loadBundle(group: Required<DailyGroup>): Promise<DailyBundle> {
  const [jsonl, markdown, sources] = await Promise.all([
    downloadDropboxText(group.jsonl),
    downloadDropboxText(group.markdown),
    downloadDropboxText(group.sources),
  ]);
  return {
    date: group.date,
    jsonl: { name: `GOVERNMENT-DAILY-${group.date}.jsonl`, content: jsonl, hash: sha256(jsonl) },
    markdown: { name: `GOVERNMENT-DAILY-${group.date}.md`, content: markdown, hash: sha256(markdown) },
    sources: { name: `GOVERNMENT-DAILY-SOURCES-${group.date}.md`, content: sources, hash: sha256(sources) },
  };
}

function reportMarkdown(report: DailyRunReport) {
  const lines = [
    `# Government Daily Ingest - ${report.DATE}`,
    "",
    "**Herausgeber:** Institut für Wirkungsökonomie",
    "",
    ...Object.entries(report).filter(([key]) => !["blockers", "validation_errors"].includes(key)).map(([key, value]) => `- ${key}: ${String(value)}`),
    "",
    "## Blocker",
    "",
    ...(report.blockers.length ? report.blockers.map((blocker) => `- ${blocker}`) : ["- keine"]),
    "",
    "## Validierungsfehler",
    "",
    ...(report.validation_errors.length ? report.validation_errors.flatMap((row) => [
      `- Zeile ${row.line}${row.impact_case_id ? ` - ${row.impact_case_id}` : ""}`,
      ...row.errors.map((error) => `  - ${error}`),
    ]) : ["- keine"]),
    "",
  ];
  return lines.join("\n");
}

async function requestDeployment(hook: string | undefined) {
  if (!hook) return { status: "NOT_CONFIGURED" as const, commit: null };
  const response = await fetch(hook, { method: "POST", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Government production deploy hook failed (${response.status}).`);
  const payload = await response.json().catch(() => ({})) as { job?: { id?: string }; id?: string };
  return { status: "REQUESTED" as const, commit: payload.job?.id ?? payload.id ?? null };
}

export async function processGovernmentDailyImpactIngest() {
  if (!governmentDailyIngestReady()) {
    return { status: "NOT_CONFIGURED" as const, reports: [], deployed: false };
  }
  const config = configuration();
  const files = await listDropboxFiles(config.analysisPath);
  const groups = groupDailyFiles(files.map((file) => ({ name: file.name, path_display: file.path_display })));
  let state = await verifyPendingDeployments(await loadState(config.statePath));
  const reports: DailyRunReport[] = [];
  const knownActions = knownGovernmentActions();
  const knownParliament = knownParliamentCases();
  const gates = localGates();
  const blockedIds = localBlockers();
  let deploymentRequested = false;

  for (const group of groups) {
    const present = [group.jsonl, group.markdown, group.sources].filter(Boolean).length;
    if (present !== 3) {
      const now = new Date().toISOString();
      const report: DailyRunReport = {
        DATE: group.date,
        FILES_FOUND: present,
        FILES_NEW: present,
        SCHEMA_VALID: false,
        NEW_IMPACT_CASES: 0,
        UPDATED_IMPACT_CASES: 0,
        LIFECYCLE_UPDATES: 0,
        REALITY_CHECK_UPDATES: 0,
        FACT_ONLY: 0,
        OPEN_DATA_ISSUES: 1,
        OPEN_FACH_REVIEWS: 0,
        DEPLOYED: false,
        DEPLOY_COMMIT: null,
        blockers: ["Tagesübergabe unvollständig: JSONL, Fachakte und SOURCES-Datei müssen gemeinsam vorliegen."],
        validation_errors: [],
      };
      state = addReviewTasks(state, report, `GOVERNMENT-DAILY-${group.date}.jsonl`, now);
      reports.push(report);
      await uploadDropboxText(`${config.statePath}/reports/GOVERNMENT-DAILY-INGEST-REPORT-${group.date}.md`, reportMarkdown(report));
      continue;
    }

    const bundle = await loadBundle(group as Required<DailyGroup>);
    const now = new Date().toISOString();
    const result = processDailyBundle({
      bundle,
      state,
      gates,
      knownGovernmentActionIds: knownActions,
      knownParliamentCaseIds: knownParliament,
      blockedObjectIds: blockedIds,
      now,
    });
    state = result.state;
    state = addReviewTasks(state, result.report, bundle.jsonl.name, now);

    if (!state.ledger.some((entry) => entry.source_file === bundle.jsonl.name)) {
      state = {
        ...state,
        updated_at: new Date().toISOString(),
        ledger: [...state.ledger, {
          date: bundle.date,
          source_file: bundle.jsonl.name,
          source_hash: bundle.jsonl.hash,
          ingested_at: now,
          impact_cases_new: result.report.NEW_IMPACT_CASES,
          impact_cases_updated: result.report.UPDATED_IMPACT_CASES,
          lifecycle_updates: result.report.LIFECYCLE_UPDATES,
          reality_check_updates: result.report.REALITY_CHECK_UPDATES,
          fact_only_objects: result.report.FACT_ONLY,
          open_data_issues: result.report.OPEN_DATA_ISSUES,
          schema_errors: result.report.validation_errors.length,
          deploy_commit: null,
          deploy_status: result.deployAllowed ? "REQUESTED" : (result.accepted.length ? "BLOCKED" : "NOT_REQUIRED"),
          expected_public_hash: result.deployAllowed ? governmentPublicStateHash(result.state.history) : null,
          public_items: result.deployAllowed ? publicDigestItems(result.accepted).map((item) => ({ ...item, topics: [...item.topics] })) : [],
          digest_status: result.deployAllowed && publicDigestItems(result.accepted).length ? "PENDING" : "NOT_APPLICABLE",
        }],
      };
    }

    if (result.deployAllowed) {
      try {
        const deployment = await requestDeployment(config.deploymentHook);
        if (deployment.status === "REQUESTED") {
          result.report.DEPLOY_COMMIT = deployment.commit;
          state = updateLedgerDeployment(state, bundle.jsonl.name, "REQUESTED", deployment.commit);
          deploymentRequested = true;
        } else {
          result.report.blockers.push("Production Deploy Hook ist nicht konfiguriert.");
          state = updateLedgerDeployment(state, bundle.jsonl.name, "BLOCKED", null);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unbekannter Deployment-Fehler";
        result.report.blockers.push(message);
        state = updateLedgerDeployment(state, bundle.jsonl.name, "FAILED", null);
      }
    }
    reports.push(result.report);
    await uploadDropboxText(`${config.statePath}/reports/GOVERNMENT-DAILY-INGEST-REPORT-${group.date}.md`, reportMarkdown(result.report));
  }

  const coverage = coverageFromHistory(state.history, factActionCount());
  await uploadDropboxText(`${config.statePath}/daily-ingest-state.json`, `${JSON.stringify(state, null, 2)}\n`);
  await uploadDropboxText(`${config.statePath}/coverage.json`, `${JSON.stringify(coverage, null, 2)}\n`);
  await uploadDropboxText(`${config.statePath}/review-queue.json`, `${JSON.stringify({ updated_at: state.updated_at, tasks: state.review_queue }, null, 2)}\n`);

  if (reports.some((report) => report.FILES_NEW > 0 || report.blockers.length > 0)) {
    await notifyGovernmentDailyIngest({ reports, deploymentRequested });
  }

  return {
    status: "COMPLETED" as const,
    filesExamined: files.length,
    dailyGroups: groups.length,
    reports,
    deployed: deploymentRequested,
    coverage,
    bestandsquellen: files.filter((file) => /^GOVERNMENT-IMPACT-CASES-WAVE-.*\.(?:jsonl|md)$/.test(file.name)).map((file) => file.name),
  };
}

export async function pendingGovernmentDigestChanges() {
  if (!governmentDailyIngestReady()) return { status: "NOT_CONFIGURED" as const, deploymentIds: [], items: [] };
  const config = configuration();
  let state = await verifyPendingDeployments(await loadState(config.statePath));
  await uploadDropboxText(`${config.statePath}/daily-ingest-state.json`, `${JSON.stringify(state, null, 2)}\n`);
  const deployments = state.ledger.filter((entry) => entry.deploy_status === "DEPLOYED" && entry.digest_status !== "SENT" && (entry.public_items?.length ?? 0) > 0);
  const uniqueItems = new Map(deployments.flatMap((entry) => entry.public_items ?? []).map((item) => [`${item.section}:${item.url}:${item.title}`, item]));
  return { status: "READY" as const, deploymentIds: deployments.map((entry) => `government-deploy-${entry.source_hash}`), items: [...uniqueItems.values()] };
}

export async function markGovernmentDigestDeployments(deploymentIds: string[], status: "SENT" | "FAILED") {
  if (!deploymentIds.length || !governmentDailyIngestReady()) return;
  const config = configuration();
  const state = await loadState(config.statePath);
  const hashes = new Set(deploymentIds.map((id) => id.replace(/^government-deploy-/, "")));
  const next = {
    ...state,
    ledger: state.ledger.map((entry) => hashes.has(entry.source_hash) ? { ...entry, digest_status: status } : entry),
  };
  await uploadDropboxText(`${config.statePath}/daily-ingest-state.json`, `${JSON.stringify(next, null, 2)}\n`);
}
