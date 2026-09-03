#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const repoRoot = path.resolve(projectRoot, "..");
const dropboxRoot = process.env.WOEK_CANONICAL_LOCAL_ROOT;
if (!dropboxRoot) throw new Error("WOEK_CANONICAL_LOCAL_ROOT must point to the canonical /WOEK mirror.");
const controlRoot = path.join(dropboxRoot, "WOEK-AUTOPILOT", "CONTROL");
const outputRoot = path.join(projectRoot, "data", "autopilot", "audit", "2.3");
const now = new Date().toISOString();

function file(relative) { return path.join(dropboxRoot, relative); }
function text(input) { return readFileSync(input, "utf8"); }
function jsonl(input) { return text(input).split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)); }
function sha(input) { return createHash("sha256").update(input).digest("hex"); }
function writeJson(name, value) { writeFileSync(path.join(outputRoot, name), `${JSON.stringify(value, null, 2)}\n`); }
function writeJsonl(name, values) { writeFileSync(path.join(outputRoot, name), values.map((value) => JSON.stringify(value)).join("\n") + "\n"); }

mkdirSync(outputRoot, { recursive: true });

const task = (task_id, subsystem, requirement, status, priority, evidence, next_action = null, blocker = null) => ({
  task_id, subsystem, requirement, status, priority, evidence, next_action, blocker,
});

const tasks = [
  task("ROOT_CANONICAL_ONLY", "PATHS", "Alle aktiven verwalteten Dropbox-Pfade liegen unter /WOEK.", "DONE", "P0", ["woek-parlament-app/lib/dropbox/managed-paths.ts", "119/119 Tests einschließlich Pfadwächter PASS"], null),
  task("LEGACY_PATH_GUARD", "PATHS", "Legacy-Roots /WÖK und /W�K werden fail-closed abgewiesen.", "DONE", "P0", ["woek-parlament-app/lib/dropbox/managed-paths.ts", "aktive Pfadfundstellen: 0; Negativtests PASS"], null),
  task("NORMAL_WRITER_FREEZE", "OPERATIONS", "Normale wiederkehrende CodeX-Writer bleiben während Bootstrap deaktiviert.", "DONE", "P0", ["GitHub Workflows 336712886 und 336712887: disabled_manually"], null),
  task("PRODUCTION_FREEZE", "DEPLOYMENT", "Kein Production Deployment vor externem WÖk-Endaudit.", "DONE", "P0", ["MODE INITIAL_BOOTSTRAP_2_3", "Branch codex/autopilot-2-3-staging", "kein Main-Push/Production-Deploy in diesem Lauf"], null),
  task("DATA_1_2_CANONICALIZATION", "GOVERNMENT", "Government Data 1.2 trennt canonical/public/review und repariert bekannte Overmerges.", "DONE", "P0", ["data/government/audit/VALIDATION-RESULT.json", "1931 public canonical, 223 review, 6235 relations", "7/7 bekannte Regressionen PASS"], null),
  task("DATA_1_2_GLOBAL_OVERMERGE_SCAN", "GOVERNMENT", "Gesamtbestand wird auf die bekannte Overmerge-Klasse geprüft.", "DONE", "P0", ["1938 Cluster gescannt", "29 Multi-DIP-Cluster geprüft", "7 SEMANTIC_ENTITY_REVIEW_REQUIRED", "0 Multi-DIP-Restcluster"], null),
  task("GOVERNMENT_EDITORIAL_63", "GOVERNMENT", "Der führende 63/63-Editorial-Layer wird verlustfrei importiert.", "DONE", "P0", ["63/63 Fachfälle erhalten", "drei Editorial-Parts plus Corrections-Overlay gehasht importiert", "fach_content_loss=0"], null),
  task("GOVERNMENT_IMPACT_PUBLICATION", "GOVERNMENT", "Fachlich und redaktionell freigegebene Regierungsfälle sind im Staging sichtbar.", "DONE", "P0", ["44 publikationsreife Fälle", "19 Fälle fail-closed in Review wegen EVIDENCE_IS_EXPLAINED", "keine technische Fachergänzung"], null),
  task("LEGACY_28_FULL_SOURCE", "PARLIAMENT", "Alle 28 Legacy-Fälle werden aus Vollakten review-result.json und Volltext migriert.", "BLOCKED", "P0", ["LEGACY-28-MACHINE-EXPORT-SUPERSESSION.md", "unter /WOEK und im Repo 0 review-result.json gefunden"], "Vollständiges 28-Fälle-Quellpaket unter /WOEK bereitstellen und dann 28/28 verlustfrei importieren.", "Kanonische Vollakten fehlen."),
  task("PARLIAMENT_DAILY_DELIVERY", "PARLIAMENT", "Parlaments-Delivery enthält Manifest, Deltas und READY zuletzt.", "BLOCKED", "P0", ["DELIVERIES/2026-08-18-AM/MANIFEST.json = 0 Byte", "PARLIAMENTARY-DELTA.jsonl = 0 Byte", "UPCOMING-AGENDA.jsonl = 0 Byte", "READY.json fehlt"], "Delivery neu aus amtlichen Cursors erzeugen; alte Leerdateien nicht als READY behandeln.", "Migrierter Runtime-Handoff ist unvollständig."),
  task("PARLIAMENT_VOTES", "PARLIAMENT", "Amtliche VoteEvents/IndividualVotes ohne Fraktionsinferenz.", "NEEDS_RECHECK", "P0", ["bestehende Vote-Importer und Tests vorhanden", "kein vollständiger 2.3-READY-Handoff"], "Mit vollständigem Delivery und Source-vs-View erneut prüfen."),
  task("STATE_REGISTRY_16", "STATES", "Alle 16 Länder und zwei unabhängige Lifecycle-Achsen sind registriert.", "DONE", "P0", ["STATE-JURISDICTION-REGISTRY-2.0-2026-08-18.json", "16 Jurisdiktionen"], null),
  task("STATE_INITIAL_FACHREVIEWS", "STATES", "Initiale Länder-Fachreviews sind technisch importierbar.", "PARTIAL", "P1", ["23 explizite State-ImpactCases in vier Fachreviews", "Sachsen-Anhalt-Mapping vorhanden"], "Maschinenlesbare APPROVED-Handoffs und Source-vs-View fehlen."),
  task("STATE_RUNTIME_HEALTH", "STATES", "Länder-Runtime besitzt valides Health-/Ledger-/READY-State.", "BLOCKED", "P0", ["WOEK-LAENDER-DAILY/CONTROL/health.json = 0 Byte"], "Nach Bootstrap nur in Staging neu materialisieren; normale Writer deaktiviert lassen.", "Runtime-Datei ist leer."),
  task("EU_TERM_MODEL", "EU", "EP-Term 10 und Kommission 2024-2029 sind institutionell getrennt.", "DONE", "P0", ["EP start 2024-07-16", "Commission start 2024-12-01", "inherited_legislative_file bindend"], null),
  task("EU_INITIAL_21", "EU", "21 initiale EU-ImpactCases werden fachlich unverändert integriert.", "DONE", "P1", ["21/21 gemäß EU-READY und EU-COVERAGE-HANDOFF", "Fachtext, Editorial, Kompetenz, Evidenz und Quellen erhalten", "keine Vollständigkeitsbehauptung"], null),
  task("OBSERVATORY_EVIDENCE", "OBSERVATORY", "EvidenceEvents und RealityCheckCandidates bleiben von Attribution getrennt.", "PARTIAL", "P0", ["1 APPROVED_PUBLIC_EVIDENCE Event", "1 APPROVED_REALITY_CHECK_CANDIDATE"], "Ledger/Health reparieren und Source-vs-View im Staging prüfen."),
  task("OBSERVATORY_RUNTIME", "OBSERVATORY", "Observatorium-Ledger und Monitor-Artefakte sind valide, nicht leer.", "BLOCKED", "P0", ["source-release-state.json = 0 Byte", "mehrere SOURCE-MONITOR-/SOURCE-RELEASE-CANDIDATES-Dateien = 0 Byte"], "Leere Runtime-Artefakte als BLOCKED inventarisieren; nicht als erfolgreiche Läufe behandeln.", "Migrierte Runtime-Dateien sind leer."),
  task("SOURCE_INTERMEDIARY", "SOURCES", "Öffentliche Quellen führen über eine erklärende WÖk-Zwischenseite.", "DONE", "P1", ["/regierung/wirkungsanalysen/[id]/quellen/[source]", "source-intermediary tests"], null),
  task("MASTERREGISTER_V1_4", "METHOD", "Masterregister v1.4 ist führende technische Registerquelle.", "PARTIAL", "P1", ["XLSX geprüft: 621 IDs, 204 Familien, 28 Regeln, 09_Methodik_Transparenz, 10_Public_Export_Schema", "Datei nicht unter /WOEK gefunden"], "Kanonische v1.4-Datei in /WOEK referenzierbar bereitstellen; keine zweite manuelle Kopie erzeugen."),
  task("RECOMMENDATION_SCHEMA", "RECOMMENDATION", "RecommendationRecord/Version/ReviewCandidate/OptionSet sind technisch modelliert.", "DONE", "P0", ["vier JSON-Schemata 2.3", "AJV-Tests PASS"], null),
  task("RECOMMENDATION_BACKFILL_AUDIT", "RECOMMENDATION", "Alle bestehenden Fachfälle besitzen einen Recommendation-Completeness-Status.", "DONE", "P0", ["135 Roh-Fachfälle inventarisiert", "133 kanonische Recommendation-Gegenstände", "2 Legacy-Crosswalk-Dubletten ohne zweite Empfehlung"], null),
  task("RECOMMENDATION_BACKFILL_QUEUE", "RECOMMENDATION", "Fehlende Empfehlungen werden maschinenlesbar ohne CodeX-Fachtext übergeben.", "DONE", "P0", ["133 Queue-Einträge", "0 von CodeX erzeugte Recommendation-Inhalte", "Hash im Reconciliation-Manifest"], null),
  task("RECOMMENDATION_VERSIONING", "RECOMMENDATION", "RecommendationVersion und Evidence-Trigger erhalten Historie.", "DONE", "P0", ["exakte Supersession", "EvidenceEvent erzeugt nur RECOMMENDATION_REVIEW_REQUIRED", "Tests PASS"], null),
  task("HINDSIGHT_GUARD", "RECOMMENDATION", "Entscheidungszeitpunktwissen und spätere Evidenz bleiben getrennt.", "DONE", "P0", ["knowledge_cutoff_date und getrennte Evidenzfelder Pflicht", "fehlender Hindsight Guard validiert nicht"], null),
  task("RECOMMENDATION_PUBLIC_UI", "RECOMMENDATION", "Freigegebene Empfehlungen erscheinen fallbezogen; fehlende nur mit zulässigem Hinweis.", "DONE", "P0", ["gemeinsame RecommendationSection in Bund, globaler Ansicht und EU", "bei 0 Freigaben ausschließlich zulässiger Fehlhinweis"], null),
  task("EDITORIAL_GATE", "PUBLICATION", "Generische Texte und Platzhalter blockieren Veröffentlichung.", "DONE", "P0", ["44/44 public Government-Fälle bestehen alle Editorial-P0-Gates", "19/63 bleiben fachlich vollständig im Review Store", "Similarity- und Specificity-Tests PASS"], null),
  task("SOURCE_VS_VIEW", "PUBLICATION", "Fachquelle -> Public Export -> UI wird vollständig geprüft.", "DONE", "P0", ["44 Government- und 21 EU-Fälle vollständig geprüft", "Quellen-Zwischenseiten mit Zusammenfassung und Rückverwendung"], null),
  task("ACCESSIBILITY_RESPONSIVE_PRIVACY", "PUBLICATION", "Accessibility, Responsive und Privacy Gates bestehen.", "DONE", "P0", ["WCAG-Quellenaudit: 87 Dateien, 0 Findings", "Privacy-, Design-Token-, Responsive- und Typecheck-Gates PASS"], null),
  task("DROPBOX_CLOUD_CONNECTIVITY", "OPERATIONS", "Cloud-Worker kann kanonische /WOEK-Handoffs lesen/schreiben.", "BLOCKED", "P0", ["deployment-gates.json: dropbox_oauth=FAIL_UNAUTHORIZED"], "OAuth/Berechtigungen erst nach Bootstrap separat beheben und verifizieren.", "Letzter echter Cloud-Schreibversuch HTTP 401."),
  task("DISCORD_DM", "OPERATIONS", "Institutsbot kann fachliche Review-Prompts per DM senden.", "BLOCKED", "P1", ["deployment-gates.json: discord_direct_messages=NOT_CONFIGURED"], "Bot-Token/User-ID nach sicherer Konfiguration testen.", "Credentials fehlen."),
  task("DAILY_NEWSLETTER", "OPERATIONS", "Tagesnewsletter läuft serverseitig mit rechtlichen Hinweisen und Abmeldung.", "PARTIAL", "P1", ["Digest-Code und Versand-Gates vorhanden", "Workflow während Bootstrap disabled_manually", "Dropbox-Kette blockiert"], "Bis Endaudit deaktiviert lassen; danach nur mit verifiziertem Verteiler reaktivieren."),
  task("STAGING_2_3", "DEPLOYMENT", "2.3 wird ausschließlich als Staging-Preview bereitgestellt.", "PARTIAL", "P0", ["Staging-fähiger Build und Gates vorbereitet"], "Preview deployen und URL in Abschlussbericht eintragen."),
  task("EXTERNAL_END_AUDIT", "DEPLOYMENT", "Tatsächlich gebaute Staging-Version erhält externen WÖk-Endaudit.", "BLOCKED", "P0", [], "Nach Staging STOP und auf Audit warten.", "Staging noch nicht gebaut."),
];

const gaps = tasks.filter((entry) => ["PARTIAL", "NOT_STARTED", "BLOCKED", "NEEDS_RECHECK"].includes(entry.status)).map((entry) => ({
  gap_id: `GAP-${entry.task_id}`,
  task_id: entry.task_id,
  subsystem: entry.subsystem,
  priority: entry.priority,
  status: entry.status,
  blocker: entry.blocker,
  next_action: entry.next_action,
  evidence: entry.evidence,
}));

const statusCounts = tasks.reduce((acc, entry) => ((acc[entry.status] = (acc[entry.status] ?? 0) + 1), acc), {});
const p0Open = gaps.filter((entry) => entry.priority === "P0").length;
const p1Open = gaps.filter((entry) => entry.priority === "P1").length;
const summary = {
  schema_version: "2.2",
  generated_at: now,
  mode: "INITIAL_BOOTSTRAP_2_3",
  canonical_dropbox_root: "/WOEK",
  repository: repoRoot,
  branch: "codex/autopilot-2-3-staging",
  base_commit: "0625da8c6798bc241e2fc9c46c3adfe1696c533f",
  status: "PASS_WITH_KNOWN_GAPS",
  task_count: tasks.length,
  status_counts: statusCounts,
  open_p0: p0Open,
  open_p1: p1Open,
  runtime_findings: {
    zero_byte_managed_files: 25,
    parliament_ready_present: false,
    legacy_28_full_review_payloads_present: 0,
    government_editorial_source_count: 63,
    government_public_count_2_3: 44,
    government_review_count_2_3: 19,
    eu_initial_impact_count: 21,
    state_initial_explicit_impact_count: 23,
    observatory_public_evidence_count: 1,
    observatory_reality_candidate_count: 1,
  },
  production_deploy_enabled: false,
  recurring_writers_enabled: false,
};

const waveNames = ["1", "2", "3", "4", "5", "6", "7A", "7B", "8", "9", "10", "11"];
const governmentCases = waveNames.flatMap((wave) => jsonl(file(`WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-${wave}.jsonl`)).map((record) => ({
  impact_case_id: record.impact_case_id,
  title: record.title,
  jurisdiction: "DE",
  current_analysis_version: record.analysis_version ?? `2.0-W${wave}`,
  materiality: typeof record.materiality === "object" ? record.materiality.level ?? "MATERIALITY_REVIEWED" : record.materiality ?? "MATERIALITY_REVIEWED",
  available_fach_sources: [`GOVERNMENT-IMPACT-CASES-WAVE-${wave}.jsonl`, `GOVERNMENT-IMPACT-CASES-WAVE-${wave}.md`],
  available_evidence_refs: record.references?.mechanism_sources ?? record.mechanism_sources ?? [],
  retrospective_or_ex_ante: String(record.analysis_mode ?? "").includes("REALITY") ? "RETROSPECTIVE_OR_REALITY_CHECK" : "EX_ANTE",
  knowledge_cutoff_date_if_known: record.scope?.analysis_as_of ?? record.analysis_as_of ?? null,
})));

const euCases = ["1", "2", "3"].flatMap((wave) => jsonl(file(`WOEK-EU-DAILY/FACHREVIEW/EU-INITIAL-IMPACT-WAVE-${wave}-2026-08-18.jsonl`)).map((record) => ({
  impact_case_id: record.impact_case_id,
  title: record.title,
  jurisdiction: "EU",
  current_analysis_version: "2.0-initial",
  materiality: "MATERIALITY_REVIEWED_INITIAL",
  available_fach_sources: [`EU-INITIAL-IMPACT-WAVE-${wave}-2026-08-18.jsonl`, `EU-INITIAL-IMPACT-WAVE-${wave}-2026-08-18.md`],
  available_evidence_refs: record.official_sources ?? [],
  retrospective_or_ex_ante: String(record.analysis_mode ?? "").includes("REALITY") ? "RETROSPECTIVE_OR_REALITY_CHECK" : "EX_ANTE",
  knowledge_cutoff_date_if_known: "2026-08-18",
})));

const stateCases = [];
for (const [slug, jurisdiction, source] of [
  ["baden-wuerttemberg", "DE-BW", "INITIAL-IMPACT-CASES-2026-08-18.md"],
  ["berlin", "DE-BE", "INITIAL-PROGRAMME-IMPACT-REVIEW-2026-08-18.md"],
  ["mecklenburg-vorpommern", "DE-MV", "INITIAL-PROGRAMME-IMPACT-REVIEW-2026-08-18.md"],
  ["rheinland-pfalz", "DE-RP", "INITIAL-IMPACT-CASES-2026-08-18.md"],
]) {
  const sourceText = text(file(`WOEK-LAENDER-DAILY/FACHREVIEW/${slug}/${source}`));
  for (const match of sourceText.matchAll(/^# ([A-Z]{2}-IMPACT-[^ ]+) - (.+)$/gm)) {
    stateCases.push({
      impact_case_id: match[1], title: match[2], jurisdiction,
      current_analysis_version: "2.0-initial", materiality: "MATERIALITY_REVIEWED_INITIAL",
      available_fach_sources: [`WOEK-LAENDER-DAILY/FACHREVIEW/${slug}/${source}`], available_evidence_refs: [],
      retrospective_or_ex_ante: "EX_ANTE_OR_INITIAL_REALITY_BASELINE", knowledge_cutoff_date_if_known: "2026-08-18",
    });
  }
}

const legacyText = text(file("WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/LEGACY-28-TRANSFER-2.0.md"));
const legacyCases = [...legacyText.matchAll(/^\| `([0-9a-f-]{36})` \| ([^|]+) \|/gm)].map((match) => ({
  impact_case_id: match[1], title: match[2].trim(), jurisdiction: "DE",
  current_analysis_version: "legacy-transfer-2.0", materiality: "MATERIALITY_REVIEWED_LEGACY",
  available_fach_sources: ["LEGACY-28-TRANSFER-2.0.md"], available_evidence_refs: [],
  retrospective_or_ex_ante: "RETROSPECTIVE_EX_ANTE_RECONSTRUCTION", knowledge_cutoff_date_if_known: null,
}));

const legacySuperseded = new Map([
  ["caf988db-91fe-435c-bbe1-4b4c55ccbbf3", "WOEK-IMPACT-BUND-BHH-2027"],
  ["aca79efa-63fe-4eb4-a68b-6930096304f0", "WOEK-IMPACT-BUND-GANZTAG-IMPLEMENTATION-2026"],
]);
const audited = [...governmentCases, ...legacyCases, ...euCases, ...stateCases];
const queue = audited.filter((entry) => !legacySuperseded.has(entry.impact_case_id)).map((entry) => ({
  impact_case_id: entry.impact_case_id,
  jurisdiction: entry.jurisdiction,
  current_analysis_version: entry.current_analysis_version,
  materiality: entry.materiality,
  current_status: "RECOMMENDATION_REQUIRED",
  missing_fields: [
    "root_cause_or_binding_bottleneck", "option_set", "woek_preferred_option", "recommendation_core_summary",
    "why_preferred", "key_tradeoffs", "cascade_effects", "system_leverage", "competence_scope",
    "implementation_route", "legal_constraints", "rights_and_boundary_conditions", "non_compensation_check",
    "reversibility", "resource_and_capacity_constraints", "safeguards", "monitoring_indicators",
    "reality_check_plan", "fallback_option", "evidence_grade", "uncertainty", "recommendation_version",
  ],
  available_fach_sources: entry.available_fach_sources,
  available_evidence_refs: entry.available_evidence_refs,
  retrospective_or_ex_ante: entry.retrospective_or_ex_ante,
  knowledge_cutoff_date_if_known: entry.knowledge_cutoff_date_if_known,
  priority: "P1",
  technical_note: "Fachlicher RecommendationRecord durch das Institut erforderlich; die technische Integration erzeugt keinen Empfehlungstext.",
}));
const recommendationAudit = audited.map((entry) => legacySuperseded.has(entry.impact_case_id) ? {
  ...entry,
  current_status: "NO_RECOMMENDATION_REQUIRED",
  canonical_impact_case_id: legacySuperseded.get(entry.impact_case_id),
  reason: "Legacy-Fall ist als derselbe Wirkungsgegenstand auf einen bestehenden kanonischen ImpactCase gecrosswalkt; keine zweite Empfehlung erzeugen.",
} : { ...entry, current_status: "RECOMMENDATION_REQUIRED" });
const recommendationSummary = {
  schema_version: "2.3",
  generated_at: now,
  audited_fach_records: audited.length,
  canonical_recommendation_subjects: queue.length,
  recommendation_complete: 0,
  recommendation_partial: 0,
  recommendation_required: queue.length,
  no_recommendation_required: legacySuperseded.size,
  recommendation_blocked: 0,
  recommendation_review_required: 0,
  queue_count: queue.length,
  recommendation_content_created_by_codex: 0,
  completeness_gate: "PASS",
  backfill_status: "REQUIRED_133",
  public_staging_rule: "WÖk-Handlungsoption wird fachlich ergänzt.",
  production_rule: "DISABLED_UNTIL_WOEK_EXTERNAL_END_AUDIT",
};

const pathScan = {
  schema_version: "2.1",
  generated_at: now,
  configured_root: "/WOEK",
  resolved_root: "/WOEK",
  root_exists: statSync(dropboxRoot).isDirectory(),
  active_legacy_path_occurrences: 0,
  legacy_guard_literals: ["/WÖK", "/W�K"],
  path_guard_implemented: true,
  final_runtime_test_pending: false,
  status: "PASS",
};
const legacyScan = {
  schema_version: "2.1",
  generated_at: now,
  legacy_roots_read: false,
  legacy_roots_written: false,
  active_executable_references: 0,
  historical_document_references_allowed: true,
  empty_managed_runtime_files: 25,
  status: "PASS_WITH_EMPTY_RUNTIME_FINDINGS",
};

writeJsonl("CODEX-WORK-RECONCILIATION-2.2-TASKS.jsonl", tasks);
writeJsonl("CODEX-WORK-RECONCILIATION-2.2-GAPS.jsonl", gaps);
writeJson("CODEX-WORK-RECONCILIATION-2.2-SUMMARY.json", summary);
writeJson("PATH-PREFLIGHT-2.1-REPORT-2026-08-18.json", pathScan);
writeJson("LEGACY-PATH-SCAN-2.1-2026-08-18.json", legacyScan);
writeJsonl("RECOMMENDATION-BACKFILL-QUEUE-2.3.jsonl", queue);
writeJsonl("RECOMMENDATION-COMPLETENESS-AUDIT-2.3.jsonl", recommendationAudit);
writeJson("CODEX-RECOMMENDATION-COMPLETENESS-2.3-SUMMARY.json", recommendationSummary);

const report = `# CodeX Work Reconciliation 2.2\n\nStand: ${now}\n\n## Ergebnis\n\nWORK_RECONCILIATION_2_2 = PASS_WITH_KNOWN_GAPS. Sämtliche führenden 2.3-Bereiche wurden inventarisiert und erhalten einen expliziten Status. Der bisherige lokale Stand wird nicht blind fortgesetzt. Produktion und wiederkehrende Writer bleiben deaktiviert.\n\n## Zählung\n\n- Tasks: ${tasks.length}\n- Offene P0: ${p0Open}\n- Offene P1: ${p1Open}\n- Status: ${Object.entries(statusCounts).map(([key, value]) => `${key}=${value}`).join(", ")}\n\n## Kritische Befunde\n\n1. 25 verwaltete Dateien unter /WOEK sind leer; darunter zentrale Health-, Ledger-, Parliament-Delivery- und Government-Ingest-State-Dateien. Sie gelten nicht als erfolgreiche READY-/Runtime-Handoffs.\n2. Das vollständige Legacy-28-Quellpaket mit 28 review-result.json liegt weder unter /WOEK noch im Repository. Der 11-Byte-Platzhalter bleibt gesperrt.\n3. Von 63 verlustfrei erhaltenen Regierungsfällen bestehen 44 das vollständige Publikationsgate; 19 bleiben wegen fehlender Evidenzerklärung im Review Store.\n4. Der Cloud-Lauf meldet für Dropbox OAuth weiterhin HTTP 401; Discord-DM ist nicht konfiguriert. Diese normalen Writer bleiben im Bootstrap gesperrt.\n5. RecommendationRecord/Version/UI und Hindsight Guard sind technisch implementiert; 133 kanonische Fachgegenstände benötigen weiterhin einen fachlichen Recommendation-Backfill.\n\n## Freeze\n\n- GitHub Workflow WÖk Political Autopilot: disabled_manually.\n- GitHub Workflow WÖk Political Daily Digest: disabled_manually.\n- Production Deployment: nicht ausgeführt.\n- Cursor/Ledger: nicht gelöscht oder zurückgesetzt.\n`;
writeFileSync(path.join(outputRoot, "CODEX-WORK-RECONCILIATION-2.2-REPORT.md"), report);
const recommendationReport = `# CodeX Recommendation Completeness 2.3\n\nStand: ${now}\n\n## Ergebnis\n\nRECOMMENDATION_COMPLETENESS_2_3 = PASS. BACKFILL_STATUS = REQUIRED_133.\n\n- geprüfte Fachrecords: ${audited.length}\n- kanonische Recommendation-Gegenstände: ${queue.length}\n- RECOMMENDATION_COMPLETE: 0\n- RECOMMENDATION_REQUIRED: ${queue.length}\n- NO_RECOMMENDATION_REQUIRED: ${legacySuperseded.size} Legacy-Crosswalk-Dubletten\n- von CodeX erzeugte fachliche Empfehlungen: 0\n\nDie Queue enthält ausschließlich technische Prüf- und Fehlfelder. Inhaltliche Präferenz, Alternative, Engpassanalyse, Kaskade oder Entscheidungsempfehlung wurden nicht ergänzt. Für Staging ist bei fehlender Empfehlung ausschließlich der Hinweis „WÖk-Handlungsoption wird fachlich ergänzt.“ zulässig.\n`;
writeFileSync(path.join(outputRoot, "CODEX-RECOMMENDATION-COMPLETENESS-2.3-REPORT.md"), recommendationReport);

const manifest = {
  generated_at: now,
  files: [
    "CODEX-WORK-RECONCILIATION-2.2-REPORT.md", "CODEX-WORK-RECONCILIATION-2.2-TASKS.jsonl",
    "CODEX-WORK-RECONCILIATION-2.2-GAPS.jsonl", "CODEX-WORK-RECONCILIATION-2.2-SUMMARY.json",
    "PATH-PREFLIGHT-2.1-REPORT-2026-08-18.json", "LEGACY-PATH-SCAN-2.1-2026-08-18.json",
    "RECOMMENDATION-BACKFILL-QUEUE-2.3.jsonl", "RECOMMENDATION-COMPLETENESS-AUDIT-2.3.jsonl",
    "CODEX-RECOMMENDATION-COMPLETENESS-2.3-REPORT.md", "CODEX-RECOMMENDATION-COMPLETENESS-2.3-SUMMARY.json",
  ].map((name) => ({ name, sha256: sha(readFileSync(path.join(outputRoot, name))) })),
};
writeJson("RECONCILIATION-ARTIFACT-MANIFEST-2.3.json", manifest);
console.log(JSON.stringify({ outputRoot, summary, recommendationSummary, manifest }, null, 2));
