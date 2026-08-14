import "server-only";
import { createHash } from "node:crypto";
import { buildImportWindows, getDipConfiguration, requestDip, type DipImportWindow, type DipListResponse } from "@/lib/dip";
import { supabaseRest, supabaseRpc } from "@/lib/supabase-rest";

export type ImportScope = "BOOTSTRAP" | "LOOKAHEAD" | "BOTH";
type WindowScope = Exclude<ImportScope, "BOTH">;

type DipDecision = {
  id: string;
  vorgangsposition: string;
  gang: boolean;
  fortsetzung: boolean;
  nachtrag: boolean;
  vorgangstyp: string;
  titel: string;
  vorgang_id: string;
  datum: string;
  aktualisiert: string;
  beschlussfassung?: unknown[];
};

type Candidate = {
  external_id: string;
  legislative_term: string;
  case_kind: "RADAR" | "RETROSPECTIVE_CASE";
  decision_date: string | null;
  last_activity_on: string;
  next_confirmed_event_on: string | null;
  title: string;
  original_title: string;
  source_url: string;
  source_published_on: string;
  content_sha256: string;
  raw_payload: DipDecision;
  decision_unit_key: string;
  decision_unit_title: string;
  version_label: string;
  is_final_voting_version: boolean;
  screening_key: string;
  screening_criteria: Record<string, unknown>;
  evidence_gaps: string[];
};

type ImportRun = { id: string };

type ImportJob = {
  id: string;
  job_key: string;
  scope: WindowScope;
  legislative_term: number;
  window_from: string;
  window_to: string;
  next_cursor: string | null;
  status: "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";
  pages_completed: number;
  imported_count: number;
  skipped_count: number;
};

type WindowProgress = {
  mode: WindowScope;
  from: string;
  to: string;
  jobId: string;
  imported: number;
  skipped: number;
  pagesProcessed: number;
  totalPagesProcessed: number;
  complete: boolean;
  nextCursorPresent: boolean;
};

export type ImportResult = {
  scope: ImportScope;
  imported: number;
  skipped: number;
  windows: Array<Pick<DipImportWindow, "mode" | "from" | "to">>;
  progress: WindowProgress[];
  status: "SUCCEEDED" | "PARTIAL";
};

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function isFuture(date: string) {
  return date > isoToday();
}

function isDecision(position: DipDecision) {
  return Array.isArray(position.beschlussfassung) && position.beschlussfassung.length > 0;
}

/**
 * Metadata-only screening deliberately errs toward keeping a decision in the
 * register. It can identify only unmistakable routine/procedural events;
 * everything else remains POTENTIAL_MATERIAL until a source-backed review.
 * Neither proposer nor any party metadata participates in this function.
 */
export function deterministicMaterialityScreen(position: Pick<DipDecision, "titel" | "vorgangsposition" | "vorgangstyp">) {
  const searchable = `${position.titel} ${position.vorgangsposition} ${position.vorgangstyp}`.toLocaleLowerCase("de-DE");
  const routinePatterns = [
    /\bwahl\b.*\b(ausschuss|gremium|mitglied|vorsitz|richter|beauftrag)/,
    /\büberweisung\b/,
    /\bgeschäftsordnung\b/,
    /\bprotokoll\b/,
    /\bkenntnisnahme\b/,
    /\beinsetzung\b.*\b(ausschuss|kommission|gremium)/,
    /\bpersonalangelegenheit\b/
  ];
  if (routinePatterns.some((pattern) => pattern.test(searchable))) {
    return {
      status: "NOT_MATERIAL" as const,
      reason: "Amtliche Metadaten kennzeichnen einen eindeutig routinemäßigen Personal-, Geschäftsordnungs- oder Verfahrensvorgang; keine Vollanalyse vorab ausgewählt."
    };
  }
  return {
    status: "POTENTIAL_MATERIAL" as const,
    reason: "Amtliche Beschlussmetadaten reichen nicht für eine materielle WÖk-Einordnung aus; der Vorgang bleibt ohne politische Vorauswahl für die Quellen- und Materialitätsprüfung im Register."
  };
}

function candidateFrom(position: DipDecision, window: DipImportWindow, legislativeTerm: number): Candidate | null {
  const decision = isDecision(position);
  const future = isFuture(position.datum);

  // The historical register consists only of recorded resolutions. The
  // look-ahead contains only significant, date-stamped procedural steps.
  // Neither condition is a substantive WÖk conclusion.
  if (window.mode === "BOOTSTRAP" && !decision) return null;
  if (window.mode === "LOOKAHEAD" && (!position.gang || !future)) return null;

  const sourceUrl = `https://search.dip.bundestag.de/api/v1/vorgangsposition/${encodeURIComponent(position.id)}?format=json`;
  const originalTitle = position.vorgangsposition;
  const materiality = deterministicMaterialityScreen(position);
  return {
    // A parliamentary procedure can contain multiple material resolutions.
    // The position, rather than the umbrella procedure, is therefore the
    // stable import identity. This avoids silently losing later decisions.
    external_id: `vorgang:${position.vorgang_id}:position:${position.id}`,
    legislative_term: String(legislativeTerm),
    case_kind: decision ? "RETROSPECTIVE_CASE" : "RADAR",
    decision_date: decision ? position.datum : null,
    last_activity_on: position.datum,
    next_confirmed_event_on: future ? position.datum : null,
    title: position.titel,
    original_title: originalTitle,
    source_url: sourceUrl,
    source_published_on: position.datum,
    content_sha256: createHash("sha256").update(JSON.stringify(position)).digest("hex"),
    raw_payload: position,
    decision_unit_key: `dip-vorgangsposition:${position.id}`,
    decision_unit_title: originalTitle,
    version_label: `DIP-Vorgangsposition-${position.id}`,
    is_final_voting_version: decision,
    screening_key: `dip-vorgangsposition:${position.id}:v1`,
    screening_criteria: {
      source: "Deutscher Bundestag/Bundesrat – DIP",
      procedure_type: position.vorgangstyp,
      event_kind: decision ? "RECORDED_RESOLUTION" : "CONFIRMED_FUTURE_PROCEDURAL_STEP",
      event_date: position.datum,
      deterministic_materiality: materiality.status,
      deterministic_materiality_reason: materiality.reason,
      requires_original_text: true,
      requires_sdgs_sdgplus_mapping: true,
      requires_noncompensation_gate: true,
      requires_reverse_merit_order_check: true,
      automated_conclusion: null
    },
    evidence_gaps: [
      "Amtliche Ausgangsmetadaten liegen vor; die relevante Originalfassung ist noch nicht fachlich extrahiert.",
      "Keine freigegebene Zuordnung zu SDG-/SDG+-Referenzen.",
      "Kein veröffentlichungsfähiger Wirkpfad, kein Fachvotum und keine Empfehlung automatisch erzeugt."
    ]
  };
}

function selectWindows(scope: ImportScope, leadDays: number, historicalBackfillStart: string) {
  const windows = buildImportWindows(new Date(), leadDays, historicalBackfillStart);
  if (scope === "BOTH") return windows;
  return windows.filter((window) => window.mode === scope);
}

function jobKey(window: DipImportWindow, legislativeTerm: number) {
  // The historical job is intentionally stable. Once complete, the normal
  // look-ahead importer keeps the register current without restarting the
  // entire government-term import every day.
  return window.mode === "BOOTSTRAP"
    ? `DIP:BOOTSTRAP:${legislativeTerm}:${window.from}`
    : `DIP:LOOKAHEAD:${legislativeTerm}:${window.from}:${window.to}`;
}

async function getOrCreateJob(window: DipImportWindow, legislativeTerm: number): Promise<ImportJob> {
  const key = jobKey(window, legislativeTerm);
  const jobs = await supabaseRest<ImportJob[]>(
    `parliament_import_jobs?job_key=eq.${encodeURIComponent(key)}&select=id,job_key,scope,legislative_term,window_from,window_to,next_cursor,status,pages_completed,imported_count,skipped_count&limit=1`
  );
  if (jobs[0]) return jobs[0];

  const created = await supabaseRest<ImportJob[]>("parliament_import_jobs", {
    method: "POST",
    body: [{
      job_key: key,
      scope: window.mode,
      legislative_term: legislativeTerm,
      window_from: window.from,
      window_to: window.to,
      metadata: { review_state: window.reviewState, created_by: "DIP_IMPORTER" }
    }],
    prefer: "return=representation"
  });
  if (created[0]) return created[0];

  // A competing invocation may have inserted the unique job between the read
  // and insert. Re-read rather than starting a second cursor chain.
  const retried = await supabaseRest<ImportJob[]>(
    `parliament_import_jobs?job_key=eq.${encodeURIComponent(key)}&select=id,job_key,scope,legislative_term,window_from,window_to,next_cursor,status,pages_completed,imported_count,skipped_count&limit=1`
  );
  if (!retried[0]) throw new Error("DIP_IMPORT_JOB_CREATE_FAILED");
  return retried[0];
}

async function updateJob(job: ImportJob, patch: Record<string, unknown>) {
  await supabaseRest(`parliament_import_jobs?id=eq.${encodeURIComponent(job.id)}`, {
    method: "PATCH",
    body: { ...patch, updated_at: new Date().toISOString() },
    prefer: "return=minimal"
  });
}

async function startRun(scope: ImportScope, windows: DipImportWindow[], jobs: ImportJob[]) {
  const rows = await supabaseRest<ImportRun[]>("import_runs", {
    method: "POST",
    body: [{
      scope,
      status: "RUNNING",
      metadata: {
        windows: windows.map(({ mode, from, to }) => ({ mode, from, to })),
        import_job_ids: jobs.map((job) => job.id)
      }
    }],
    prefer: "return=representation"
  });
  const run = rows[0];
  if (!run) throw new Error("SUPABASE_IMPORT_RUN_CREATE_FAILED");
  return run;
}

async function finishRun(run: ImportRun, status: "SUCCEEDED" | "FAILED", imported: number, skipped: number, errorCode?: string) {
  await supabaseRest(`import_runs?id=eq.${encodeURIComponent(run.id)}`, {
    method: "PATCH",
    body: {
      status,
      finished_at: new Date().toISOString(),
      imported_count: imported,
      skipped_count: skipped,
      ...(errorCode ? { error_code: errorCode } : {})
    },
    prefer: "return=minimal"
  });
}

async function fetchAndIngestPage(window: DipImportWindow, job: ImportJob, legislativeTerm: number) {
  const response = await requestDip<DipListResponse<DipDecision>>({
    resource: "vorgangsposition",
    params: {
      format: "json",
      "f.datum.start": job.window_from,
      "f.datum.end": job.window_to,
      "f.wahlperiode": legislativeTerm,
      cursor: job.next_cursor ?? undefined
    }
  });
  const documents = response.documents ?? [];
  const candidates = new Map<string, Candidate>();
  let skipped = 0;
  for (const position of documents) {
    const candidate = candidateFrom(position, window, legislativeTerm);
    if (!candidate) {
      skipped += 1;
      continue;
    }
    candidates.set(candidate.external_id, candidate);
  }
  const payload = [...candidates.values()];
  if (payload.length > 0) await supabaseRpc("ingest_dip_snapshot", { p_candidates: payload });

  const nextCursor = response.cursor;
  if (nextCursor && (nextCursor === job.next_cursor || documents.length === 0)) {
    throw new Error("DIP_CURSOR_STALLED");
  }
  return { imported: payload.length, skipped, nextCursor: nextCursor ?? null, complete: !nextCursor };
}

async function processWindow(window: DipImportWindow, job: ImportJob, pageLimit: number): Promise<WindowProgress> {
  if (job.status === "SUCCEEDED") {
    return {
      mode: window.mode,
      from: job.window_from,
      to: job.window_to,
      jobId: job.id,
      imported: 0,
      skipped: 0,
      pagesProcessed: 0,
      totalPagesProcessed: job.pages_completed,
      complete: true,
      nextCursorPresent: false
    };
  }

  let current = job;
  let imported = 0;
  let skipped = 0;
  let pagesProcessed = 0;
  try {
    while (pagesProcessed < pageLimit) {
      const page = await fetchAndIngestPage(window, current, current.legislative_term);
      imported += page.imported;
      skipped += page.skipped;
      pagesProcessed += 1;
      const complete = page.complete;
      await updateJob(current, {
        status: complete ? "SUCCEEDED" : "RUNNING",
        next_cursor: page.nextCursor,
        pages_completed: current.pages_completed + 1,
        imported_count: current.imported_count + page.imported,
        skipped_count: current.skipped_count + page.skipped,
        last_error: null,
        ...(complete ? { finished_at: new Date().toISOString() } : {})
      });
      current = {
        ...current,
        status: complete ? "SUCCEEDED" : "RUNNING",
        next_cursor: page.nextCursor,
        pages_completed: current.pages_completed + 1,
        imported_count: current.imported_count + page.imported,
        skipped_count: current.skipped_count + page.skipped
      };
      if (complete) break;
    }
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 180) : "DIP_IMPORT_UNKNOWN_ERROR";
    await updateJob(current, { status: "FAILED", last_error: code }).catch(() => undefined);
    throw error;
  }

  return {
    mode: window.mode,
    from: current.window_from,
    to: current.window_to,
    jobId: current.id,
    imported,
    skipped,
    pagesProcessed,
    totalPagesProcessed: current.pages_completed,
    complete: current.status === "SUCCEEDED",
    nextCursorPresent: Boolean(current.next_cursor)
  };
}

/**
 * Processes a bounded number of DIP pages and stores the next cursor after
 * every page. A partial result is successful work, not a truncated import:
 * call the same scope again until `status` is `SUCCEEDED`.
 */
export async function runDipImport(scope: ImportScope = "BOTH"): Promise<ImportResult> {
  const config = getDipConfiguration();
  if (!config.configured) throw new Error("DIP_API_KEY_MISSING");
  const windows = selectWindows(scope, config.requestedLeadDays, config.historicalBackfillStart);
  const jobs = await Promise.all(windows.map((window) => getOrCreateJob(window, config.legislativeTerm)));
  const run = await startRun(scope, windows, jobs);
  try {
    const progress: WindowProgress[] = [];
    for (let index = 0; index < windows.length; index += 1) {
      progress.push(await processWindow(windows[index], jobs[index], config.importPagesPerInvocation));
    }
    const imported = progress.reduce((total, item) => total + item.imported, 0);
    const skipped = progress.reduce((total, item) => total + item.skipped, 0);
    await finishRun(run, "SUCCEEDED", imported, skipped);
    return {
      scope,
      imported,
      skipped,
      windows: windows.map(({ mode, from, to }) => ({ mode, from, to })),
      progress,
      status: progress.every((item) => item.complete) ? "SUCCEEDED" : "PARTIAL"
    };
  } catch (error) {
    const errorCode = error instanceof Error ? error.message.slice(0, 120) : "DIP_IMPORT_UNKNOWN_ERROR";
    await finishRun(run, "FAILED", 0, 0, errorCode).catch(() => undefined);
    throw error;
  }
}
