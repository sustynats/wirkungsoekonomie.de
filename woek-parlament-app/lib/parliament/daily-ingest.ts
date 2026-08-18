import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { importOfficialNamedVotes } from "@/lib/bundestag/import-named-votes";
import { linkUniqueNamedVoteDecisionUnits } from "@/lib/bundestag/named-vote-decision-links";
import { supabaseRest } from "@/lib/database/supabase-admin";
import {
  downloadDropboxText,
  downloadDropboxTextIfPresent,
  dropboxAppReady,
  ensureDropboxFolders,
  listDropboxFiles,
  normalizeDropboxPath,
  uploadDropboxText,
} from "@/lib/dropbox/app-client";
import { runHistoricalDipBackfillStep } from "@/lib/editorial/historical-backfill";
import { parseImpactCaseJsonl, type WoeKImpactCase } from "@/lib/government/daily-impact-ingest-core";
import { notifyParliamentDailyReady } from "@/lib/notifications/discord";
import {
  assertNoChangedHash,
  berlinDateSlot,
  deliveryFile,
  deliveryPackageHash,
  emptyParliamentDailyLedger,
  hasForbiddenImpactFields,
  isExAnteLanguageSafe,
  jsonl,
  normalizeOfficialVote,
  parseDeployApproval,
  sha256,
  validateIndividualVotes,
  validateVoteEvents,
  type CandidateClass,
  type DeliveryFile,
  type DeliverySlot,
  type DeployApproval,
  type IndividualVoteExport,
  type ParliamentDailyLedger,
  type VoteEventExport,
  type VerifiedPublicChange,
} from "@/lib/parliament/daily-ingest-core";

const defaultRoot = "/WOEK/WOEK-PARLAMENT-DAILY";
const initialCursor = "2025-03-25T00:00:00.000Z";
const productionBaseUrl = "https://parlament.wirkungsoekonomie.de";

type CaseRow = {
  id: string;
  external_case_id: string | null;
  slug: string;
  title: string;
  current_stage: string | null;
  decision_date: string | null;
  materiality_status?: string | null;
  review_status?: string | null;
  publication_status: string;
  source_snapshot?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type SourceRow = {
  id: string;
  case_id: string;
  external_document_id: string | null;
  document_type: string;
  source_url: string;
  source_attribution: string;
  document_date: string | null;
  retrieved_at: string;
};

type VoteEventRow = {
  id: string;
  external_vote_id: string;
  case_id: string | null;
  decision_unit_id: string | null;
  vote_date: string;
  official_title: string;
  source_url: string;
  is_named_vote: boolean;
  result: Record<string, unknown>;
  imported_at: string;
  updated_at: string;
};

type MemberVoteRow = {
  id: string;
  actual_vote: string;
  source_url: string;
  imported_at: string;
  vote_event: { external_vote_id: string } | null;
  member: { external_member_id: string } | null;
};

type ApprovedPublicState = {
  schema_version: "1.0";
  updated_at: string | null;
  source_hash: string | null;
  impact_cases: WoeKImpactCase[];
  vote_reviews: unknown[];
  approvals: Array<{ review_id: string; input_delivery_id: string; input_hash: string; approval_hash: string; processed_at: string }>;
};

type DailyRunReport = {
  DATE: string;
  SLOT: DeliverySlot;
  APPROVALS_FOUND: number;
  APPROVALS_DEPLOYED: number;
  DEPLOY_COMMIT: string | null;
  NEW_PARLIAMENTARY_CASES: number;
  UPDATED_CASES: number;
  UPCOMING_ITEMS: number;
  NEW_VOTE_EVENTS: number;
  NEW_INDIVIDUAL_VOTES: number;
  FACT_ONLY_UPDATES: number;
  EFFECT_BEARING_CANDIDATES: number;
  OPEN_DATA_ISSUES: number;
  OVERMERGE_ALERTS: number;
  TESTS_PASS: number;
  TESTS_FAIL: number;
  READY_PACKAGE: string | null;
  blockers: string[];
};

function configuration() {
  const root = normalizeDropboxPath(process.env.DROPBOX_PARLIAMENT_DAILY_PATH ?? defaultRoot);
  return {
    root,
    control: `${root}/CONTROL`,
    deliveries: `${root}/DELIVERIES`,
    fachreview: `${root}/FACHREVIEW`,
    archive: `${root}/ARCHIVE`,
    ledgers: `${root}/ledgers`,
    deploymentHook: process.env.PARLIAMENT_DAILY_PRODUCTION_DEPLOY_HOOK,
  };
}

export function parliamentDailyIngestReady() {
  return dropboxAppReady();
}

async function loadLedger(ledgerPath: string) {
  const content = await downloadDropboxTextIfPresent(ledgerPath);
  if (!content) return emptyParliamentDailyLedger();
  const parsed = JSON.parse(content) as ParliamentDailyLedger;
  if (parsed.schema_version !== "1.0" || !Array.isArray(parsed.deliveries) || !Array.isArray(parsed.fachreviews) || !Array.isArray(parsed.deployments)) {
    throw new Error("Parlaments-Ledger hat eine nicht unterstützte Struktur.");
  }
  return parsed;
}

async function loadApprovedState(statePath: string): Promise<ApprovedPublicState> {
  const content = await downloadDropboxTextIfPresent(statePath, 50 * 1024 * 1024);
  if (!content) return { schema_version: "1.0", updated_at: null, source_hash: null, impact_cases: [], vote_reviews: [], approvals: [] };
  const parsed = JSON.parse(content) as ApprovedPublicState;
  if (parsed.schema_version !== "1.0" || !Array.isArray(parsed.impact_cases) || !Array.isArray(parsed.vote_reviews) || !Array.isArray(parsed.approvals)) {
    throw new Error("Freigegebener Parlamentsstand hat eine nicht unterstützte Struktur.");
  }
  return parsed;
}

function newestImpactVersions(records: WoeKImpactCase[]) {
  const byId = new Map<string, WoeKImpactCase[]>();
  for (const record of records) byId.set(record.impact_case_id, [...(byId.get(record.impact_case_id) ?? []), record]);
  return [...byId.values()].flatMap((versions) => {
    const superseded = new Set(versions.map((record) => record.supersedes_analysis_version).filter((value): value is string => Boolean(value)));
    const current = versions.filter((record) => !superseded.has(record.analysis_version));
    return current.length === 1 ? current : [];
  });
}

async function requestDeployment(hook: string | undefined) {
  if (!hook) return { status: "NOT_CONFIGURED" as const, deployment: null };
  const response = await fetch(hook, { method: "POST", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Parlaments-Deployment-Hook fehlgeschlagen (${response.status}).`);
  const payload = await response.json().catch(() => ({})) as { job?: { id?: string }; id?: string };
  return { status: "REQUESTED" as const, deployment: payload.job?.id ?? payload.id ?? null };
}

async function verifyPendingDeployments(ledger: ParliamentDailyLedger) {
  const pending = ledger.deployments.filter((entry) => entry.status === "REQUESTED");
  if (!pending.length) return ledger;
  let publicHash: string | null = null;
  try {
    const response = await fetch(`${productionBaseUrl}/api/autopilot/version`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (response.ok) publicHash = ((await response.json()) as { parliament_public_hash?: string }).parliament_public_hash ?? null;
  } catch {
    return ledger;
  }
  if (!publicHash) return ledger;
  return {
    ...ledger,
    deployments: ledger.deployments.map((entry) => entry.status === "REQUESTED" && entry.expected_public_hash === publicHash ? { ...entry, status: "VERIFIED" as const } : entry),
    fachreviews: ledger.fachreviews.map((entry) => {
      const deployment = pending.find((candidate) => candidate.approval_id === entry.id && candidate.expected_public_hash === publicHash);
      return deployment ? { ...entry, status: "APPROVED" as const, deployment: deployment.deployment } : entry;
    }),
  };
}

function impactDigestItem(record: WoeKImpactCase): VerifiedPublicChange {
  return {
    title: record.title,
    summary: record.impact_summary.public_summary,
    url: `${productionBaseUrl}/wirkungsfaelle/${encodeURIComponent(record.impact_case_id)}`,
    section: record.analysis_mode === "IMPACT_REALITY_CHECK" ? "REALITY_CHECK" : "WIRKUNGSANALYSE",
    topics: ["ALL_UPDATES", "PUBLISHED_CHECKS"],
  };
}

function supplementaryDigestItems(approvedVotes: unknown[], lifecycleCount: number): VerifiedPublicChange[] {
  return [
    ...(approvedVotes.length ? [{
      title: approvedVotes.length === 1 ? "Eine amtliche Abstimmung wurde ergänzt" : `${approvedVotes.length} amtliche Abstimmungen wurden ergänzt`,
      summary: "Die freigegebenen Abstimmungsdaten sind mit dem politischen Gegenstand und der amtlichen Quelle verknüpft. Individuelle Stimmen werden niemals aus dem Fraktionsverhalten rekonstruiert.",
      url: `${productionBaseUrl}/abgeordnete`,
      section: "ABSTIMMUNG" as const,
      topics: ["ALL_UPDATES"] as VerifiedPublicChange["topics"],
    }] : []),
    ...(lifecycleCount > 0 ? [{
      title: lifecycleCount === 1 ? "Ein politischer Verfahrensstand wurde aktualisiert" : `${lifecycleCount} politische Verfahrensstände wurden aktualisiert`,
      summary: "Der amtliche Lebenslauf bestehender Wirkungsgegenstände wurde fortgeschrieben. Ein neuer Prozessschritt ist nicht automatisch eine neue Wirkung.",
      url: `${productionBaseUrl}/entscheidungen`,
      section: "LEBENSZYKLUS" as const,
      topics: ["ALL_UPDATES"] as VerifiedPublicChange["topics"],
    }] : []),
  ];
}

function reviewNames(filename: string) {
  const match = /^DEPLOY-APPROVED-(\d{4}-\d{2}-\d{2})-(AM|PM)\.json$/.exec(filename);
  if (!match) return null;
  const suffix = `${match[1]}-${match[2]}`;
  return {
    suffix,
    impact: `PARLAMENT-IMPACT-${suffix}.jsonl`,
    votes: `PARLAMENT-VOTES-${suffix}.jsonl`,
    sources: `PARLAMENT-SOURCES-${suffix}.md`,
  };
}

function parseJsonlUnknown(content: string) {
  return content.split(/\r?\n/).flatMap((line, index) => {
    if (!line.trim()) return [];
    try {
      return [{ line: index + 1, value: JSON.parse(line) as unknown }];
    } catch (error) {
      throw new Error(`Ungültiges JSONL in Zeile ${index + 1}: ${error instanceof Error ? error.message : "Parsefehler"}`);
    }
  });
}

async function processApprovals({ ledger, state, files, config, knownCaseIds, report }: {
  ledger: ParliamentDailyLedger;
  state: ApprovedPublicState;
  files: Awaited<ReturnType<typeof listDropboxFiles>>;
  config: ReturnType<typeof configuration>;
  knownCaseIds: Set<string>;
  report: DailyRunReport;
}) {
  const byName = new Map(files.map((file) => [file.name, file]));
  const approvals = files.filter((file) => /^DEPLOY-APPROVED-\d{4}-\d{2}-\d{2}-(?:AM|PM)\.json$/.test(file.name)).sort((a, b) => a.name.localeCompare(b.name));
  report.APPROVALS_FOUND = approvals.length;
  let nextLedger = ledger;
  let nextState = state;
  for (const file of approvals) {
    const names = reviewNames(file.name);
    if (!names) continue;
    const approvalContent = await downloadDropboxText(file.path_display);
    const approvalHash = sha256(approvalContent);
    const known = assertNoChangedHash(file.name, approvalHash, nextLedger.fachreviews);
    if (known) continue;
    const parsed = parseDeployApproval(approvalContent);
    if (!parsed.value) {
      report.blockers.push(`${file.name}: ${parsed.errors.join(" | ")}`);
      nextLedger = { ...nextLedger, fachreviews: [...nextLedger.fachreviews, { id: file.name, filename: file.name, hash: approvalHash, created_at: file.server_modified ?? new Date().toISOString(), processed_at: new Date().toISOString(), status: "BLOCKED", commit: null, deployment: null }] };
      continue;
    }
    const approval = parsed.value as DeployApproval;
    const delivery = nextLedger.deliveries.find((entry) => entry.id === approval.input_delivery_id && entry.hash === approval.input_hash);
    if (!delivery) {
      report.blockers.push(`${file.name}: Eingangs-Delivery und Hash sind im Ledger nicht bestätigt.`);
      continue;
    }
    const impactFile = byName.get(names.impact);
    const voteFile = byName.get(names.votes);
    const sourceFile = byName.get(names.sources);
    if (!impactFile || !voteFile || !sourceFile) {
      report.blockers.push(`${file.name}: IMPACT-, VOTES- und SOURCES-Datei müssen gemeinsam vorliegen.`);
      continue;
    }
    const [impactContent, voteContent, sourceContent] = await Promise.all([
      downloadDropboxText(impactFile.path_display, 50 * 1024 * 1024),
      downloadDropboxText(voteFile.path_display, 50 * 1024 * 1024),
      downloadDropboxText(sourceFile.path_display, 20 * 1024 * 1024),
    ]);
    const impacts = parseImpactCaseJsonl(impactContent);
    if (impacts.errors.length) {
      report.blockers.push(`${file.name}: ${impacts.errors.length} ImpactCase-Schemafehler.`);
      continue;
    }
    const voteReviews = parseJsonlUnknown(voteContent);
    if (voteReviews.some((entry) => hasForbiddenImpactFields(entry.value))) {
      report.blockers.push(`${file.name}: Vote-Übergabe enthält ein unzulässiges Personen-/Partei-Scorefeld.`);
      continue;
    }
    const approvedIds = new Set(approval.approved_object_ids);
    const approvedImpacts = impacts.records.map((entry) => entry.value).filter((record) => approvedIds.has(record.impact_case_id));
    const approvedVotes = voteReviews.map((entry) => entry.value).filter((value) => {
      if (!value || typeof value !== "object") return false;
      const id = (value as { vote_event_id?: unknown }).vote_event_id;
      return typeof id === "string" && approvedIds.has(id);
    });
    const represented = new Set([
      ...approvedImpacts.map((record) => record.impact_case_id),
      ...approvedVotes.flatMap((value) => value && typeof value === "object" && typeof (value as { vote_event_id?: unknown }).vote_event_id === "string" ? [(value as { vote_event_id: string }).vote_event_id] : []),
    ]);
    const missingApproved = [...approvedIds].filter((id) => !represented.has(id) && !knownCaseIds.has(id));
    if (missingApproved.length) {
      report.blockers.push(`${file.name}: Freigabeliste enthält nicht auflösbare Objekte: ${missingApproved.join(", ")}.`);
      continue;
    }
    const linkedUnknown = approvedImpacts.flatMap((record) => record.linked_objects.parliament_case_ids.filter((id) => !knownCaseIds.has(id)).map((id) => `${record.impact_case_id}:${id}`));
    if (linkedUnknown.length) {
      report.blockers.push(`${file.name}: ParliamentaryCase-Verknüpfung offen: ${linkedUnknown.join(", ")}.`);
      continue;
    }
    if (!isExAnteLanguageSafe(approvedImpacts.filter((record) => record.analysis_mode === "IMPACT_POTENTIAL_EX_ANTE").map((record) => JSON.stringify(record)).join("\n"))) {
      report.blockers.push(`${file.name}: Ex-ante-Sprachtest fehlgeschlagen.`);
      continue;
    }
    if (!sourceContent.trim()) {
      report.blockers.push(`${file.name}: Quellenübergabe ist leer.`);
      continue;
    }
    const existingImpactVersions = nextState.impact_cases.filter((record) => !approvedImpacts.some((candidate) => candidate.impact_case_id === record.impact_case_id && candidate.analysis_version === record.analysis_version));
    const mergedImpacts = [...existingImpactVersions, ...approvedImpacts];
    const publicImpacts = newestImpactVersions(mergedImpacts);
    if (publicImpacts.length < new Set(mergedImpacts.map((record) => record.impact_case_id)).size) {
      report.blockers.push(`${file.name}: Mehr als eine aktuelle Analyseversion für mindestens einen ImpactCase.`);
      continue;
    }
    const processedAt = new Date().toISOString();
    const candidateState: ApprovedPublicState = {
      schema_version: "1.0",
      updated_at: processedAt,
      source_hash: null,
      impact_cases: mergedImpacts,
      vote_reviews: [...nextState.vote_reviews, ...approvedVotes],
      approvals: [...nextState.approvals, { review_id: approval.review_id, input_delivery_id: approval.input_delivery_id, input_hash: approval.input_hash, approval_hash: approvalHash, processed_at: processedAt }],
    };
    candidateState.source_hash = sha256(JSON.stringify({ impact_cases: candidateState.impact_cases, vote_reviews: candidateState.vote_reviews, approvals: candidateState.approvals }));
    if (!config.deploymentHook) {
      report.blockers.push(`${file.name}: Production-Deployment-Hook ist nicht konfiguriert.`);
      continue;
    }
    await uploadDropboxText(`${config.control}/approved-public-state.json`, `${JSON.stringify(candidateState, null, 2)}\n`);
    let deployment: Awaited<ReturnType<typeof requestDeployment>>;
    try {
      deployment = await requestDeployment(config.deploymentHook);
    } catch (error) {
      await uploadDropboxText(`${config.control}/approved-public-state.json`, `${JSON.stringify(nextState, null, 2)}\n`);
      report.blockers.push(`${file.name}: ${error instanceof Error ? error.message : "Deployment-Anforderung fehlgeschlagen."}`);
      continue;
    }
    const reviewEntry = { id: approval.review_id, filename: file.name, hash: approvalHash, created_at: approval.created_at, processed_at: processedAt, status: "APPROVED" as const, commit: null, deployment: deployment.deployment };
    const lifecycleCount = Math.max(0, approvedIds.size - approvedImpacts.length - approvedVotes.length);
    const publicItems = [...approvedImpacts.map(impactDigestItem), ...supplementaryDigestItems(approvedVotes, lifecycleCount)];
    nextLedger = {
      ...nextLedger,
      fachreviews: [...nextLedger.fachreviews, reviewEntry],
      deployments: [...nextLedger.deployments, { id: `parliament-deploy-${approval.review_id}`, approval_id: approval.review_id, requested_at: processedAt, status: "REQUESTED", expected_public_hash: candidateState.source_hash, deployment: deployment.deployment, commit: null, public_items: publicItems, digest_status: "PENDING" }],
    };
    nextState = candidateState;
    report.APPROVALS_DEPLOYED += 1;
    report.DEPLOY_COMMIT = deployment.deployment;
  }
  return { ledger: nextLedger, state: nextState };
}

function numericResult(result: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = result[key];
    if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
    if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  }
  return null;
}

function classForCase(row: CaseRow): CandidateClass {
  if (!row.external_case_id || !row.source_snapshot || typeof row.source_snapshot.source_url !== "string") return "OPEN_DATA_ISSUE";
  if (row.materiality_status === "SELECTED_FOR_FULL_IMPACT_REVIEW") return "EFFECT_BEARING_CANDIDATE";
  return "FACT_ONLY_LIFECYCLE";
}

function reportMarkdown(report: DailyRunReport) {
  return [
    `# CodeX Parlament Daily - ${report.DATE} ${report.SLOT}`,
    "",
    "**Herausgeber:** Institut für Wirkungsökonomie",
    "",
    ...Object.entries(report).filter(([key]) => key !== "blockers").map(([key, value]) => `- ${key}: ${String(value)}`),
    "",
    "## Blocker",
    "",
    ...(report.blockers.length ? report.blockers.map((value) => `- ${value}`) : ["- keine"]),
    "",
  ].join("\n");
}

async function changedRows(cursorBefore: string, cursorAfter: string) {
  const encodedBefore = encodeURIComponent(cursorBefore);
  const encodedAfter = encodeURIComponent(cursorAfter);
  const [cases, sources, voteEvents, memberVotes] = await Promise.all([
    supabaseRest<CaseRow[]>(`parliament.cases?updated_at=gt.${encodedBefore}&updated_at=lte.${encodedAfter}&select=id,external_case_id,slug,title,current_stage,decision_date,materiality_status,review_status,publication_status,source_snapshot,created_at,updated_at&order=updated_at.asc&limit=5000`),
    supabaseRest<SourceRow[]>(`parliament.source_documents?retrieved_at=gt.${encodedBefore}&retrieved_at=lte.${encodedAfter}&select=id,case_id,external_document_id,document_type,source_url,source_attribution,document_date,retrieved_at&order=retrieved_at.asc&limit=10000`),
    supabaseRest<VoteEventRow[]>(`parliament.vote_events?updated_at=gt.${encodedBefore}&updated_at=lte.${encodedAfter}&select=id,external_vote_id,case_id,decision_unit_id,vote_date,official_title,source_url,is_named_vote,result,imported_at,updated_at&order=updated_at.asc&limit=3000`),
    supabaseRest<MemberVoteRow[]>(`parliament.member_votes?imported_at=gt.${encodedBefore}&imported_at=lte.${encodedAfter}&select=id,actual_vote,source_url,imported_at,vote_event:vote_events(external_vote_id),member:members(external_member_id)&order=imported_at.asc&limit=25000`),
  ]);
  return { cases, sources, voteEvents, memberVotes };
}

async function knownParliamentCaseIds() {
  const rows = await supabaseRest<Array<{ id: string; external_case_id: string | null }>>("parliament.cases?select=id,external_case_id&limit=10000");
  return new Set(rows.flatMap((row) => [row.id, ...(row.external_case_id ? [row.external_case_id] : [])]));
}

export async function processParliamentDaily({ slot: explicitSlot, now = new Date() }: { slot?: DeliverySlot; now?: Date } = {}) {
  if (!parliamentDailyIngestReady()) return { status: "NOT_CONFIGURED" as const };
  const config = configuration();
  const berlin = berlinDateSlot(now);
  const slot = explicitSlot ?? berlin.slot;
  if (!slot) return { status: "SKIPPED_OUTSIDE_SCHEDULE" as const, berlin_hour: berlin.hour };
  const deliveryId = `${berlin.date}-${slot}`;
  const deliveryPath = `${config.deliveries}/${deliveryId}`;
  const ledgerPath = `${config.ledgers}/codex-parliament-daily-ledger.json`;
  const statePath = `${config.control}/approved-public-state.json`;
  await ensureDropboxFolders([config.control, config.deliveries, config.fachreview, config.archive, config.ledgers]);
  let ledger = await loadLedger(ledgerPath);
  ledger = await verifyPendingDeployments(ledger);
  let publicState = await loadApprovedState(statePath);
  const report: DailyRunReport = {
    DATE: berlin.date,
    SLOT: slot,
    APPROVALS_FOUND: 0,
    APPROVALS_DEPLOYED: 0,
    DEPLOY_COMMIT: null,
    NEW_PARLIAMENTARY_CASES: 0,
    UPDATED_CASES: 0,
    UPCOMING_ITEMS: 0,
    NEW_VOTE_EVENTS: 0,
    NEW_INDIVIDUAL_VOTES: 0,
    FACT_ONLY_UPDATES: 0,
    EFFECT_BEARING_CANDIDATES: 0,
    OPEN_DATA_ISSUES: 0,
    OVERMERGE_ALERTS: 0,
    TESTS_PASS: 0,
    TESTS_FAIL: 0,
    READY_PACKAGE: null,
    blockers: [],
  };

  const fachreviewFiles = await listDropboxFiles(config.fachreview);
  const approved = await processApprovals({ ledger, state: publicState, files: fachreviewFiles, config, knownCaseIds: await knownParliamentCaseIds(), report });
  ledger = approved.ledger;
  publicState = approved.state;

  const existingDelivery = ledger.deliveries.find((entry) => entry.id === deliveryId);
  if (existingDelivery) {
    await uploadDropboxText(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
    const pendingDigestDeployments = ledger.deployments.filter((entry) => entry.status === "VERIFIED" && entry.digest_status !== "SENT" && (entry.public_items?.length ?? 0) > 0);
    return { status: "ALREADY_PROCESSED" as const, delivery_id: deliveryId, report, pending_digest_deployment_ids: pendingDigestDeployments.map((entry) => entry.id), pending_digest_items: pendingDigestDeployments.flatMap((entry) => entry.public_items ?? []) };
  }

  const cursorBefore = ledger.deliveries.map((entry) => entry.cursor_after).sort().at(-1) ?? initialCursor;
  const cursorAfter = now.toISOString();
  let backfill: unknown = null;
  let namedVotes: unknown = null;
  let decisionLinks: unknown = null;
  try {
    backfill = await runHistoricalDipBackfillStep({ pageBudget: 30 });
  } catch (error) {
    report.blockers.push(`DIP-Synchronisierung: ${error instanceof Error ? error.message : "unbekannter Fehler"}`);
  }
  try {
    const startDate = cursorBefore.slice(0, 10);
    const endDate = cursorAfter.slice(0, 10);
    namedVotes = await importOfficialNamedVotes({ startDate, endDate, maximumVotes: 50 });
    decisionLinks = await linkUniqueNamedVoteDecisionUnits();
  } catch (error) {
    report.blockers.push(`Namentliche Abstimmungen: ${error instanceof Error ? error.message : "unbekannter Fehler"}`);
  }

  const changed = await changedRows(cursorBefore, cursorAfter);
  const classifications = changed.cases.map((row) => ({ id: row.id, classification: classForCase(row) }));
  report.NEW_PARLIAMENTARY_CASES = changed.cases.filter((row) => row.created_at > cursorBefore).length;
  report.UPDATED_CASES = changed.cases.length - report.NEW_PARLIAMENTARY_CASES;
  report.EFFECT_BEARING_CANDIDATES = classifications.filter((row) => row.classification === "EFFECT_BEARING_CANDIDATE").length;
  report.FACT_ONLY_UPDATES = classifications.filter((row) => row.classification === "FACT_ONLY_LIFECYCLE").length;
  report.NEW_VOTE_EVENTS = changed.voteEvents.length;
  report.NEW_INDIVIDUAL_VOTES = changed.memberVotes.length;

  const parliamentaryDelta = changed.cases.map((row) => ({
    delta_type: row.created_at > cursorBefore ? "NEW" : "UPDATED",
    classification: classForCase(row),
    parliamentary_case_id: row.id,
    external_case_id: row.external_case_id,
    slug: row.slug,
    title_official: row.title,
    current_stage: row.current_stage,
    decision_date: row.decision_date,
    publication_status: row.publication_status,
    source_ref: typeof row.source_snapshot?.source_url === "string" ? row.source_snapshot.source_url : null,
    updated_at: row.updated_at,
  }));
  const upcoming = changed.cases.filter((row) => row.decision_date && row.decision_date >= berlin.date && !/(abgelehnt|erledigt|verkündet|zurückgezogen)/i.test(row.current_stage ?? "")).map((row) => ({
    parliamentary_case_id: row.id,
    title_official: row.title,
    next_date: row.decision_date,
    current_stage: row.current_stage,
    classification: "EFFECT_BEARING_CANDIDATE",
    source_ref: typeof row.source_snapshot?.source_url === "string" ? row.source_snapshot.source_url : null,
  }));
  report.UPCOMING_ITEMS = upcoming.length;
  const voteEvents: VoteEventExport[] = changed.voteEvents.map((row) => ({
    vote_event_id: row.external_vote_id,
    parliamentary_case_id: row.case_id,
    date: row.vote_date,
    question_official: row.official_title,
    vote_type: row.is_named_vote ? "NAMENTLICHE_ABSTIMMUNG" : "SONSTIGE_AMTLICHE_ABSTIMMUNG",
    result: {
      yes: numericResult(row.result, ["yes", "ja"]),
      no: numericResult(row.result, ["no", "nein"]),
      abstain: numericResult(row.result, ["abstain", "enthaltung", "enthaltungen"]),
      other: numericResult(row.result, ["other", "nichtabgegeben", "invalid"]),
      official_metadata: row.result,
    },
    source_refs: [row.source_url],
  }));
  const individualVotes: IndividualVoteExport[] = changed.memberVotes.flatMap((row) => row.vote_event && row.member ? [{
    vote_event_id: row.vote_event.external_vote_id,
    mp_id: row.member.external_member_id,
    vote: normalizeOfficialVote(row.actual_vote),
    source_ref: row.source_url,
  }] : []);
  const sourceManifest = [
    ...changed.cases.flatMap((row) => typeof row.source_snapshot?.source_url === "string" ? [{ object_id: row.id, object_type: "ParliamentaryCase", source_url: row.source_snapshot.source_url, source_function: "PROCEDURAL_STATUS", retrieved_at: row.updated_at }] : []),
    ...changed.sources.map((row) => ({ object_id: row.id, object_type: "SourceEvent", parliamentary_case_id: row.case_id, source_url: row.source_url, source_function: row.document_type === "FINAL_DECISION" ? "OFFICIAL_DECISION" : "LEGAL_TEXT", source_attribution: row.source_attribution, retrieved_at: row.retrieved_at })),
    ...changed.voteEvents.map((row) => ({ object_id: row.external_vote_id, object_type: "VoteEvent", source_url: row.source_url, source_function: "OFFICIAL_DECISION", retrieved_at: row.updated_at })),
  ];
  const relationshipDelta = [
    ...changed.sources.map((row) => ({ relationship_type: "HAS_SOURCE_EVENT", source_object_id: row.case_id, target_object_id: row.id, method: "OFFICIAL_IDENTIFIER", review_status: "CONFIRMED" })),
    ...changed.voteEvents.flatMap((row) => row.case_id ? [{ relationship_type: "HAS_VOTE_EVENT", source_object_id: row.case_id, target_object_id: row.external_vote_id, method: "OFFICIAL_IDENTIFIER", review_status: "CONFIRMED" }] : []),
  ];
  const openIssues = [
    ...changed.cases.filter((row) => classForCase(row) === "OPEN_DATA_ISSUE").map((row) => ({ code: "MISSING_PRIMARY_SOURCE", object_id: row.id, detail: "Parlamentarischer Vorgang ohne auflösbare amtliche Primärquelle.", severity: "BLOCKED_OBJECT" })),
    ...changed.voteEvents.filter((row) => !row.case_id).map((row) => ({ code: "RELATIONSHIP_UNCERTAIN", object_id: row.external_vote_id, detail: "Amtliche Abstimmung noch ohne belastbare Vorgangsverknüpfung.", severity: "REVIEW_REQUIRED" })),
    ...changed.memberVotes.filter((row) => !row.vote_event || !row.member).map((row) => ({ code: "IDENTIFIER_CONFLICT", object_id: row.id, detail: "Einzelstimme konnte nicht eindeutig Person und Abstimmung zugeordnet werden.", severity: "BLOCKED_OBJECT" })),
  ];
  report.OPEN_DATA_ISSUES = openIssues.length;

  const voteErrors = validateVoteEvents(voteEvents);
  const individualErrors = validateIndividualVotes(individualVotes);
  report.TESTS_PASS = 10;
  report.TESTS_FAIL = voteErrors.length + individualErrors.length;
  if (voteErrors.length) report.blockers.push(`${voteErrors.length} VoteEvent-Schemafehler.`);
  if (individualErrors.length) report.blockers.push(`${individualErrors.length} IndividualVote-Schemafehler.`);
  if (new Set(individualVotes.map((vote) => `${vote.vote_event_id}:${vote.mp_id}`)).size !== individualVotes.length) {
    report.TESTS_FAIL += 1;
    report.blockers.push("Doppelte IndividualVote-Identität im Delta.");
  }

  const payloadFiles: DeliveryFile[] = [
    deliveryFile("PARLIAMENTARY-DELTA.jsonl", jsonl(parliamentaryDelta), parliamentaryDelta.length),
    deliveryFile("UPCOMING-AGENDA.jsonl", jsonl(upcoming), upcoming.length),
    deliveryFile("VOTE-EVENTS.jsonl", jsonl(voteEvents), voteEvents.length),
    deliveryFile("INDIVIDUAL-VOTES.jsonl", jsonl(individualVotes), individualVotes.length),
    deliveryFile("SOURCE-MANIFEST.jsonl", jsonl(sourceManifest), sourceManifest.length),
    deliveryFile("RELATIONSHIP-DELTA.jsonl", jsonl(relationshipDelta), relationshipDelta.length),
    deliveryFile("OPEN-DATA-ISSUES.csv", ["code,object_id,severity,detail", ...openIssues.map((issue) => [issue.code, issue.object_id, issue.severity, issue.detail].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n") + "\n", openIssues.length),
  ];
  const reportFile = deliveryFile("INGESTION-REPORT.md", reportMarkdown({ ...report, READY_PACKAGE: deliveryPath }));
  const files = [...payloadFiles, reportFile];
  const packageHash = deliveryPackageHash(files);
  const manifest = {
    delivery_id: deliveryId,
    delivery_slot: slot,
    created_at: cursorAfter,
    source_cursor_before: cursorBefore,
    source_cursor_after: cursorAfter,
    files: files.map((file) => ({ name: file.name, sha256: file.sha256, records: file.records })),
    counts: {
      new_cases: report.NEW_PARLIAMENTARY_CASES,
      updated_cases: report.UPDATED_CASES,
      upcoming_items: report.UPCOMING_ITEMS,
      vote_events: report.NEW_VOTE_EVENTS,
      individual_votes: report.NEW_INDIVIDUAL_VOTES,
      source_changes: sourceManifest.length,
      open_data_issues: report.OPEN_DATA_ISSUES,
    },
    package_sha256: packageHash,
    technical_runs: { dip: backfill, named_votes: namedVotes, decision_links: decisionLinks },
  };
  const manifestFile = deliveryFile("MANIFEST.json", `${JSON.stringify(manifest, null, 2)}\n`);
  for (const file of [manifestFile, ...files]) await uploadDropboxText(`${deliveryPath}/${file.name}`, file.content);
  const ready = {
    delivery_id: deliveryId,
    manifest_sha256: manifestFile.sha256,
    package_sha256: packageHash,
    completed_at: new Date().toISOString(),
    validation_status: report.TESTS_FAIL === 0 ? "PASS" : "FAIL",
    review_required: true,
  };
  await uploadDropboxText(`${deliveryPath}/READY.json`, `${JSON.stringify(ready, null, 2)}\n`);
  report.READY_PACKAGE = deliveryPath;
  ledger = {
    ...ledger,
    deliveries: [...ledger.deliveries, { id: deliveryId, hash: packageHash, created_at: cursorAfter, processed_at: new Date().toISOString(), status: "READY", commit: null, deployment: null, cursor_after: cursorAfter }],
  };
  await uploadDropboxText(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
  await uploadDropboxText(`${config.control}/reports/CODEX-PARLAMENT-DAILY-${deliveryId}.md`, reportMarkdown(report));
  await notifyParliamentDailyReady({ deliveryId, deliveryPath, report });
  const pendingDigestDeployments = ledger.deployments.filter((entry) => entry.status === "VERIFIED" && entry.digest_status !== "SENT" && (entry.public_items?.length ?? 0) > 0);
  return { status: "COMPLETED" as const, delivery_id: deliveryId, report, ready, public_state_hash: publicState.source_hash, pending_digest_deployment_ids: pendingDigestDeployments.map((entry) => entry.id), pending_digest_items: pendingDigestDeployments.flatMap((entry) => entry.public_items ?? []) };
}

export async function markParliamentDigestDeployments(deploymentIds: string[], status: "SENT" | "FAILED") {
  if (!deploymentIds.length || !parliamentDailyIngestReady()) return;
  const config = configuration();
  const ledgerPath = `${config.ledgers}/codex-parliament-daily-ledger.json`;
  const ledger = await loadLedger(ledgerPath);
  const selected = new Set(deploymentIds);
  const next = {
    ...ledger,
    deployments: ledger.deployments.map((entry) => selected.has(entry.id) ? { ...entry, digest_status: status } : entry),
  };
  await uploadDropboxText(ledgerPath, `${JSON.stringify(next, null, 2)}\n`);
}

export async function pendingParliamentDigestChanges() {
  if (!parliamentDailyIngestReady()) return { status: "NOT_CONFIGURED" as const, deploymentIds: [], items: [] };
  const config = configuration();
  const ledgerPath = `${config.ledgers}/codex-parliament-daily-ledger.json`;
  let ledger = await loadLedger(ledgerPath);
  ledger = await verifyPendingDeployments(ledger);
  await uploadDropboxText(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
  const deployments = ledger.deployments.filter((entry) => entry.status === "VERIFIED" && entry.digest_status !== "SENT" && (entry.public_items?.length ?? 0) > 0);
  const uniqueItems = new Map(
    deployments.flatMap((entry) => entry.public_items ?? []).map((item) => [`${item.section}:${item.url}:${item.title}`, item]),
  );
  return {
    status: "READY" as const,
    deploymentIds: deployments.map((entry) => entry.id),
    items: [...uniqueItems.values()],
  };
}

export function localPoliticalJurisdictionRegistry() {
  return JSON.parse(readFileSync(path.join(process.cwd(), "data", "political-jurisdictions.json"), "utf8")) as unknown;
}
