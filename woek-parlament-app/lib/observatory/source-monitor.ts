import "server-only";

import { createHash } from "node:crypto";
import registryJson from "@/data/observatory/source-registry.json";
import {
  downloadDropboxText,
  downloadDropboxTextIfPresent,
  ensureDropboxFolders,
  listDropboxFiles,
  uploadDropboxText,
} from "@/lib/dropbox/app-client";

const observatoryRoot = "/WÖK/WOEK-WIRKUNGSOBSERVATORIUM";

type Source = {
  source_id: string;
  impact_spaces: string[];
  name: string;
  release_url: string;
  adapter_status: "ACTIVE_RELEASE_MONITOR" | "DEFINED_NOT_AUTOMATED" | "BLOCKED";
};

type SourceState = {
  schema_version: "1.0";
  updated_at: string | null;
  sources: Record<string, { content_hash: string; checked_at: string; http_status: number; source_url: string }>;
};

type HandoffState = {
  schema_version: "1.0";
  files: Record<string, { content_hash: string; processed_at: string; deploy_status: "REQUESTED" | "BLOCKED" }>;
};

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function loadState(): Promise<SourceState> {
  const content = await downloadDropboxTextIfPresent(`${observatoryRoot}/LEDGERS/source-release-state.json`);
  if (!content) return { schema_version: "1.0", updated_at: null, sources: {} };
  const parsed = JSON.parse(content) as SourceState;
  if (parsed.schema_version !== "1.0" || !parsed.sources) throw new Error("Unsupported observatory source ledger.");
  return parsed;
}

async function inspectSource(source: Source, now: string) {
  const response = await fetch(source.release_url, {
    cache: "no-store",
    headers: { "user-agent": "Institut-fuer-Wirkungsoekonomie-Release-Monitor/1.0 (+https://parlament.wirkungsoekonomie.de/transparenz)" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  const body = await response.text();
  return { content_hash: digest(body), checked_at: now, http_status: response.status, source_url: source.release_url };
}

async function processApprovedHandoffs(now: string) {
  const ledgerPath = `${observatoryRoot}/LEDGERS/fachupdate-state.json`;
  const remote = await downloadDropboxTextIfPresent(ledgerPath);
  const state: HandoffState = remote ? JSON.parse(remote) as HandoffState : { schema_version: "1.0", files: {} };
  if (state.schema_version !== "1.0" || !state.files) throw new Error("Unsupported observatory handoff ledger.");
  const files = (await listDropboxFiles(`${observatoryRoot}/FACHUPDATES`)).filter((entry) => /^(APPROVED_PUBLIC_EVIDENCE_EVENTS|APPROVED_ANALYSIS_UPDATES|APPROVED_REALITY_CHECKS)-.*\.jsonl$/.test(entry.name));
  const additions: Array<{ name: string; hash: string }> = [];
  for (const file of files) {
    const content = await downloadDropboxText(file.path_display, 20 * 1024 * 1024);
    const hash = digest(content);
    const previous = state.files[file.name];
    if (previous && previous.content_hash !== hash) throw new Error(`CONTENT_CHANGED_AFTER_HANDOFF: ${file.name}`);
    if (!previous) additions.push({ name: file.name, hash });
  }
  if (!additions.length) return { new_files: 0, deployment: "NOT_REQUIRED" as const };
  const hook = process.env.GOVERNMENT_DAILY_PRODUCTION_DEPLOY_HOOK;
  let deployment: "REQUESTED" | "BLOCKED" = "BLOCKED";
  if (hook) {
    const response = await fetch(hook, { method: "POST", signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Observatory deployment hook failed (${response.status}).`);
    deployment = "REQUESTED";
  }
  for (const entry of additions) state.files[entry.name] = { content_hash: entry.hash, processed_at: now, deploy_status: deployment };
  await uploadDropboxText(ledgerPath, `${JSON.stringify(state, null, 2)}\n`);
  return { new_files: additions.length, deployment };
}

/**
 * Detects source releases only. A changed page is a review trigger, never an
 * EvidenceEvent, attribution, or impact assessment.
 */
export async function processObservatorySourceMonitor(now = new Date()) {
  await ensureDropboxFolders([
    `${observatoryRoot}/OBSERVATIONS`, `${observatoryRoot}/PUBLIC-EVIDENCE`,
    `${observatoryRoot}/REALITY-CANDIDATES`, `${observatoryRoot}/FACHUPDATES`,
    `${observatoryRoot}/SOURCES`, `${observatoryRoot}/LEDGERS`, `${observatoryRoot}/CONTROL`,
  ]);
  const checkedAt = now.toISOString();
  const prior = await loadState();
  const sources = (registryJson.sources as Source[]).filter((entry) => entry.adapter_status === "ACTIVE_RELEASE_MONITOR");
  const results = await Promise.all(sources.map(async (source) => {
    try {
      const current = await inspectSource(source, checkedAt);
      const previous = prior.sources[source.source_id];
      return { source, current, changed: Boolean(previous && previous.content_hash !== current.content_hash), error: null };
    } catch (error) {
      return { source, current: null, changed: false, error: error instanceof Error ? error.message : "UNKNOWN_SOURCE_FAILURE" };
    }
  }));
  const next: SourceState = { schema_version: "1.0", updated_at: checkedAt, sources: { ...prior.sources } };
  for (const result of results) if (result.current) next.sources[result.source.source_id] = result.current;
  const changes = results.filter((entry) => entry.changed).map((entry) => ({
    candidate_type: "SOURCE_RELEASE_CHANGED",
    source_id: entry.source.source_id,
    source_name: entry.source.name,
    source_url: entry.source.release_url,
    impact_spaces: entry.source.impact_spaces,
    detected_at: checkedAt,
    review_status: "FACH_REVIEW_REQUIRED",
    attribution_status: "OPEN",
    note: "Die amtliche Veröffentlichungsquelle hat sich verändert. Dies ist nur ein Prüfhinweis und noch kein EvidenceEvent.",
  }));
  const failures = results.filter((entry) => entry.error).map((entry) => ({ source_id: entry.source.source_id, source_url: entry.source.release_url, error: entry.error }));
  const handoffs = await processApprovedHandoffs(checkedAt);
  const runId = checkedAt.replace(/[:.]/g, "-");
  await Promise.all([
    uploadDropboxText(`${observatoryRoot}/LEDGERS/source-release-state.json`, `${JSON.stringify(next, null, 2)}\n`),
    uploadDropboxText(`${observatoryRoot}/REALITY-CANDIDATES/SOURCE-RELEASE-CANDIDATES-${runId}.json`, `${JSON.stringify({ generated_at: checkedAt, candidates: changes }, null, 2)}\n`),
    uploadDropboxText(`${observatoryRoot}/CONTROL/SOURCE-MONITOR-${runId}.json`, `${JSON.stringify({ generated_at: checkedAt, sources_checked: sources.length, changes_detected: changes.length, source_failures: failures, approved_handoffs: handoffs }, null, 2)}\n`),
  ]);
  return { status: failures.length === sources.length ? "BLOCKED" as const : failures.length ? "DEGRADED" as const : "OK" as const, sources_checked: sources.length, changes_detected: changes.length, failures, approved_handoffs: handoffs };
}
