import "server-only";
import { createHash } from "node:crypto";
import { buildImportWindows, getDipConfiguration, requestDip, type DipImportWindow, type DipListResponse } from "@/lib/dip";
import { supabaseRest, supabaseRpc } from "@/lib/supabase-rest";

type ImportScope = "BOOTSTRAP" | "LOOKAHEAD" | "BOTH";

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

export type ImportResult = {
  scope: ImportScope;
  imported: number;
  skipped: number;
  windows: Array<Pick<DipImportWindow, "mode" | "from" | "to">>;
  status: "SUCCEEDED";
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

function candidateFrom(position: DipDecision, window: DipImportWindow, legislativeTerm: number): Candidate | null {
  const decision = isDecision(position);
  const future = isFuture(position.datum);

  // The annual baseline consists only of recorded resolutions. The look-ahead
  // consists only of significant, date-stamped procedural steps. Neither is a
  // substantive WÖk verdict.
  if (window.mode === "BOOTSTRAP" && !decision) return null;
  if (window.mode === "LOOKAHEAD" && (!position.gang || !future)) return null;

  const sourceUrl = `https://search.dip.bundestag.de/api/v1/vorgangsposition/${encodeURIComponent(position.id)}?format=json`;
  const originalTitle = position.vorgangsposition;
  return {
    external_id: `vorgang:${position.vorgang_id}`,
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

async function fetchWindow(window: DipImportWindow, maxPages: number, legislativeTerm: number) {
  const all: DipDecision[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < maxPages; page += 1) {
    const response = await requestDip<DipListResponse<DipDecision>>({
      resource: "vorgangsposition",
      params: {
        format: "json",
        "f.datum.start": window.from,
        "f.datum.end": window.to,
        "f.wahlperiode": legislativeTerm,
        cursor
      }
    });
    all.push(...(response.documents ?? []));
    if (!response.cursor || response.cursor === cursor || (response.documents ?? []).length === 0) break;
    cursor = response.cursor;
  }
  return all;
}

function selectWindows(scope: ImportScope, leadDays: number, historicalBackfillStart: string) {
  const windows = buildImportWindows(new Date(), leadDays, historicalBackfillStart);
  if (scope === "BOTH") return windows;
  return windows.filter((window) => window.mode === scope);
}

async function startRun(scope: ImportScope, windows: DipImportWindow[]) {
  const rows = await supabaseRest<ImportRun[]>("import_runs", {
    method: "POST",
    body: [{ scope, status: "RUNNING", metadata: { windows: windows.map(({ mode, from, to }) => ({ mode, from, to })) } }],
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

export async function runDipImport(scope: ImportScope = "BOTH"): Promise<ImportResult> {
  const config = getDipConfiguration();
  if (!config.configured) throw new Error("DIP_API_KEY_MISSING");
  const windows = selectWindows(scope, config.requestedLeadDays, config.historicalBackfillStart);
  const run = await startRun(scope, windows);
  try {
    const positionSets = await Promise.all(windows.map((window) => fetchWindow(window, config.importMaxPages, config.legislativeTerm)));
    const candidates = new Map<string, Candidate>();
    let skipped = 0;
    for (let windowIndex = 0; windowIndex < windows.length; windowIndex += 1) {
      const window = windows[windowIndex];
      // Work from the window itself to retain its scope when a position appears in both requests.
      const windowPositions = positionSets[windowIndex];
      for (const position of windowPositions) {
        const candidate = candidateFrom(position, window, config.legislativeTerm);
        if (!candidate) {
          skipped += 1;
          continue;
        }
        const existing = candidates.get(candidate.external_id);
        if (!existing || (candidate.is_final_voting_version && !existing.is_final_voting_version) || candidate.last_activity_on > existing.last_activity_on) {
          candidates.set(candidate.external_id, candidate);
        }
      }
    }
    const payload = [...candidates.values()];
    if (payload.length > 0) await supabaseRpc("ingest_dip_snapshot", { p_candidates: payload });
    await finishRun(run, "SUCCEEDED", payload.length, skipped);
    return { scope, imported: payload.length, skipped, windows: windows.map(({ mode, from, to }) => ({ mode, from, to })), status: "SUCCEEDED" };
  } catch (error) {
    const errorCode = error instanceof Error ? error.message.slice(0, 120) : "DIP_IMPORT_UNKNOWN_ERROR";
    await finishRun(run, "FAILED", 0, 0, errorCode).catch(() => undefined);
    throw error;
  }
}
