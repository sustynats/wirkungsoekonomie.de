import { createHash } from "node:crypto";

const ROOT = "/WOEK";
const EXPECTED_BRANCH = "automation/common-targets-finalize-20260819";
const ANALYSIS_ROOT = `${ROOT}/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis`;
const CONTROL_ROOT = `${ROOT}/WOEK-AUTOPILOT/CONTROL`;
const SOURCE_RECOMMENDATIONS = `${ANALYSIS_ROOT}/GOVERNMENT-RECOMMENDATIONS-2026-08-19-FINAL-R1.jsonl`;
const TARGET_JSONL = `${ANALYSIS_ROOT}/GOVERNMENT-EDITORIAL-EVIDENCE-BACKFILL-2026-08-19-FINAL-B03.jsonl`;
const TARGET_VALIDATION = `${CONTROL_ROOT}/GOVERNMENT-EDITORIAL-EVIDENCE-BACKFILL-2026-08-19-FINAL-B03-VALIDATION.json`;
const TARGET_HANDOFF = `${CONTROL_ROOT}/BRIDGE/WOEK-GOVERNMENT-EDITORIAL-EVIDENCE-B03-20260819-FINAL.json`;

const records = [
  {
    impact_case_id: "WOEK-IMPACT-BUND-MIGRATION-DIGITAL-2026",
    title: "Weiterentwicklung der Digitalisierung in der Migrationsverwaltung",
    source_analysis_version: "2.0-W2",
    editorial_backfill_version: "2.3-E1-2026-08-19-FINAL-B03",
    overview_assessment_label: "UEBERWIEGEND_POSITIVES_WIRKUNGSPOTENZIAL_MIT_SEPARAT_SICHTBAREN_RISIKEN",
    impact_core_summary: "Weniger Mehrfacherhebung und Medienbrüche können Migrationsverfahren beschleunigen, zugleich vergrößert eine zentralere Datenarchitektur die Folgen falscher Identitätsdaten, unberechtigter Zugriffe und Zweckausweitung.",
    editorial_summary: "Once-Only-Logik kann echte Verwaltungsblindleistung beseitigen, wenn Menschen dieselben Angaben nicht immer wieder einreichen müssen. Zentral gepflegte Fehler skalieren dafür stärker durch mehrere Behörden. Positive Wirkung verlangt deshalb nicht nur schnelleren Datenaustausch, sondern einfache Korrektur, klare Zweckbindung, Zugriffskontrolle und messbar weniger Fehlentscheidungen aufgrund falscher Stammdaten.",
    key_finding: "WENIGER DOPPELDATEN SIND GUT - ZENTRALE FEHLER MUESSEN ABER SCHNELL KORRIGIERBAR SEIN",
    evidence_summary: "Amtliche Regelung und Fachakten belegen den Ausbau des Datenaustauschs und den Mechanismus, mit dem Mehrfacherhebungen und Medienbrüche sinken können. Mittlere Evidenz trägt dieses Prozesspotenzial. Noch nicht belegt sind die reale Netto-Zeitersparnis, die Entwicklung von Identitäts- und Zuordnungsfehlern, die Geschwindigkeit behördenübergreifender Korrekturen sowie Datenschutz- und Sicherheitsfolgen. Eine positive Netto-Wirkung bleibt deshalb bis zu diesen Outcome-Daten offen.",
    reality_check_summary: "Nach sechs und zwölf Monaten sind Bearbeitungszeit und vermiedene Mehrfacherhebungen gemeinsam mit Datenkorrekturen, Identitätsfehlern, Zugriffsvorfällen, Datenschutzbeschwerden und Fallback-Nutzung zu prüfen. Eine sinkende Bearbeitungszeit allein ist kein positiver Netto-Wirkungsnachweis.",
    public_evidence_explanation: "Die Evidenz trägt die Prozesslogik, nicht bereits den späteren Nettoeffekt. Effizienzgewinne werden nur dann positiv eingeordnet, wenn Datenrichtigkeit, Zweckbindung, Korrekturmöglichkeit und Sicherheit mindestens stabil bleiben.",
    boundary_review_note: "Datenrichtigkeit, Zweckbindung, informationelle Selbstbestimmung, wirksame Korrektur, Least-Privilege-Zugriffe und ein funktionsfähiger manueller Fallback bleiben nicht kompensierbare Schutzbedingungen.",
    recommendation_record_created: false,
    editorial_quality_gate: "PASS",
    fach_status: "APPROVED_FOR_PUBLIC_IMPORT",
    source_record_ref: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-2.jsonl",
    editorial_source_ref: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-EDITORIAL-LAYER-MANIFEST-2.0-2026-08-18.json",
    recommendation_source_ref: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-RECOMMENDATIONS-2026-08-19-FINAL-R1.jsonl#WOEK-REC-BUND-MIGRATION-DIGITAL-2026-R1",
    official_fact_sources: ["https://www.bundesregierung.de/breg-de/aktuelles/digitalisierung-migrationsverwaltung-2399874"],
    review_reason_before: "BLOCKED_PUBLIC_EDITORIAL_QUALITY_EVIDENCE_SUMMARY_TOO_SHORT",
    review_resolution: "Process evidence, open outcome evidence and non-compensable data-governance conditions are separated explicitly and case-specifically."
  },
  {
    impact_case_id: "WOEK-IMPACT-BUND-KI-MIGRATION-2026",
    title: "KI-Migrationsverwaltungsgesetz",
    source_analysis_version: "2.0-W2",
    editorial_backfill_version: "2.3-E1-2026-08-19-FINAL-B03",
    overview_assessment_label: "AMBIVALENTES_WIRKUNGSPOTENZIAL",
    impact_core_summary: "KI kann Migrationsverfahren konsistenter vorbereiten und Personal entlasten, darf grundrechtsintensive Entscheidungen aber weder faktisch vorprägen noch durch Bias, fehlerhafte Quellenabgleiche oder Automation Bias der menschlichen Kontrolle entziehen.",
    editorial_summary: "Der sinnvolle Hebel liegt in Entscheidungsunterstützung, Recherche und Priorisierung - nicht in einer automatisierten Letztentscheidung über Schutz, Aufenthalt oder Eingriffe. Zeitgewinn wäre nur positive Wirkung, wenn Fehler- und Korrekturraten mindestens stabil bleiben oder sinken. Subgruppenbezogene Genauigkeit, Human Overrides, Erklärbarkeit und Beschwerdemöglichkeiten sind deshalb Schutzbedingungen, keine Zusatzoptionen.",
    key_finding: "KI DARF VERFAHREN UNTERSTUETZEN - NICHT GRUNDRECHTE AUTOMATISIEREN",
    evidence_summary: "Kabinetts- und Fachunterlagen belegen den geplanten KI-Einsatz als Entscheidungsunterstützung und die vorgesehene menschliche Letztverantwortung. Mittlere Evidenz trägt die allgemeinen Mechanismen möglicher Zeit- und Konsistenzgewinne ebenso wie Risiken durch Automation Bias, Daten- und Quellenfehler. Für die konkreten deutschen Module fehlen vor Feldbetrieb belastbare Outcome-, Gruppen- und Korrekturdaten. Deshalb ist die Netto-Wirkung ex ante offen.",
    reality_check_summary: "Vor produktiver Ausweitung ist ein begrenzter Shadow-Mode-Pilot gegen eine menschliche Baseline zu prüfen. Zu messen sind Bearbeitungs- und Prüfzeit, Human Overrides, Fehler- und gerichtliche Korrekturquoten, False-positive- und False-negative-Raten nach relevanten Gruppen, Quellenfehler, Beschwerden, Datenschutzvorfälle und Modellversionsdrift.",
    public_evidence_explanation: "Weder die Existenz eines KI-Systems noch ein schnellerer Prozess gilt als Wirkungserfolg. Der positive Pfad muss im Pilot zeigen, dass Zeit- oder Konsistenzgewinne nicht durch gruppenspezifische Fehler, faktische Automatisierung oder schwächere Korrektur erkauft werden.",
    boundary_review_note: "Keine faktisch automatisierte Letztentscheidung, wirksame menschliche Aufsicht, Diskriminierungsschutz, Datenminimierung, nachvollziehbare Quellenbasis und effektiver Rechtsschutz bleiben harte Grenzen.",
    recommendation_record_created: false,
    editorial_quality_gate: "PASS",
    fach_status: "APPROVED_FOR_PUBLIC_IMPORT",
    source_record_ref: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-IMPACT-CASES-WAVE-2.jsonl",
    editorial_source_ref: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-EDITORIAL-LAYER-MANIFEST-2.0-2026-08-18.json",
    recommendation_source_ref: "/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/GOVERNMENT-RECOMMENDATIONS-2026-08-19-FINAL-R1.jsonl#WOEK-REC-BUND-KI-MIGRATION-2026-R1",
    official_fact_sources: [
      "https://www.bundesregierung.de/breg-de/aktuelles/kuenstliche-intelligenz-asylverfahren-2448638",
      "https://www.bundesregierung.de/breg-de/aktuelles/regierungspressekonferenz-vom-29-juli-2026-2448716"
    ],
    review_reason_before: "BLOCKED_PUBLIC_EDITORIAL_QUALITY_REALITY_CHECK_SUMMARY_EMPTY",
    review_resolution: "Ex-ante evidence boundary, concrete Shadow-Mode reality check and fundamental-rights safeguards are stated case-specifically without claiming observed outcome."
  }
] as const;

function sha256(value: Uint8Array | string) { return createHash("sha256").update(value).digest("hex"); }
function dropboxContentHash(bytes: Uint8Array) {
  const size = 4 * 1024 * 1024; const parts: Buffer[] = [];
  for (let i = 0; i < bytes.length; i += size) parts.push(createHash("sha256").update(bytes.slice(i, Math.min(bytes.length, i + size))).digest());
  return createHash("sha256").update(Buffer.concat(parts)).digest("hex");
}
function assertPath(value: string) { if (!value.startsWith("/WOEK/") || /[^\x00-\x7F]/.test(value) || value.includes("..")) throw new Error(`PATH_NAMING_VIOLATION: ${value}`); }
function validateRecord(record: any) {
  for (const key of ["impact_case_id","title","source_analysis_version","editorial_backfill_version","overview_assessment_label","impact_core_summary","editorial_summary","key_finding","evidence_summary","reality_check_summary","public_evidence_explanation","boundary_review_note","source_record_ref","editorial_source_ref","recommendation_source_ref","review_reason_before","review_resolution"]) {
    if (typeof record[key] !== "string" || record[key].trim().length < 3) throw new Error(`EDITORIAL_BACKFILL_SCHEMA_FAIL: ${record.impact_case_id}:${key}`);
  }
  if (record.recommendation_record_created !== false || record.editorial_quality_gate !== "PASS" || record.fach_status !== "APPROVED_FOR_PUBLIC_IMPORT") throw new Error(`EDITORIAL_BACKFILL_GATE_FAIL: ${record.impact_case_id}`);
  if (!Array.isArray(record.official_fact_sources) || !record.official_fact_sources.length) throw new Error(`EDITORIAL_BACKFILL_SOURCE_FAIL: ${record.impact_case_id}`);
  for (const key of ["impact_core_summary","editorial_summary","evidence_summary","reality_check_summary","public_evidence_explanation","boundary_review_note"]) if (record[key].trim().length < 100) throw new Error(`EDITORIAL_BACKFILL_TOO_SHORT: ${record.impact_case_id}:${key}`);
}
async function token() {
  for (const key of ["DROPBOX_APP_KEY","DROPBOX_APP_SECRET","DROPBOX_REFRESH_TOKEN"]) if (!process.env[key]) throw new Error(`TECHNICAL_WRITE_RETRY: missing ${key}`);
  const form = new URLSearchParams({grant_type:"refresh_token",refresh_token:process.env.DROPBOX_REFRESH_TOKEN!});
  const r = await fetch("https://api.dropboxapi.com/oauth2/token", {method:"POST",headers:{authorization:`Basic ${Buffer.from(`${process.env.DROPBOX_APP_KEY}:${process.env.DROPBOX_APP_SECRET}`).toString("base64")}`,"content-type":"application/x-www-form-urlencoded"},body:form,signal:AbortSignal.timeout(15000)});
  if(!r.ok) throw new Error(`TECHNICAL_WRITE_RETRY: token ${r.status}`); const j=await r.json() as {access_token?:string}; if(!j.access_token) throw new Error("TECHNICAL_WRITE_RETRY: token missing"); return j.access_token;
}
async function download(t:string,p:string,missing=false){assertPath(p);const r=await fetch("https://content.dropboxapi.com/2/files/download",{method:"POST",headers:{authorization:`Bearer ${t}`,"dropbox-api-arg":JSON.stringify({path:p})},signal:AbortSignal.timeout(30000)});if(r.status===409&&missing)return null;if(!r.ok)throw new Error(`TECHNICAL_WRITE_RETRY: download ${r.status} ${p}`);const bytes=Buffer.from(await r.arrayBuffer());const h=r.headers.get("dropbox-api-result");return{bytes,metadata:h?JSON.parse(h):{}};}
async function verify(t:string,p:string,expected:Buffer,outcome:string){const got=await download(t,p);if(!got)throw new Error(`READBACK_MISSING:${p}`);const local=sha256(expected),read=sha256(got.bytes),db=dropboxContentHash(expected),actual=String(got.metadata.content_hash??"");if(!expected.equals(got.bytes)||local!==read||db!==actual||Number(got.metadata.size)!==expected.length)throw new Error(`READBACK_MISMATCH:${p}`);return{path:p,file_id:String(got.metadata.id),rev:String(got.metadata.rev),dropbox_content_hash:actual,bytes:expected.length,local_sha256:local,readback_sha256:read,byte_equal:true,outcome};}
async function writeHistory(t:string,p:string,bytes:Buffer){const old=await download(t,p,true);if(old){if(!old.bytes.equals(bytes))throw new Error(`HISTORY_CONFLICT:${p}`);return verify(t,p,bytes,"IDEMPOTENT_IDENTICAL");}const r=await fetch("https://content.dropboxapi.com/2/files/upload",{method:"POST",headers:{authorization:`Bearer ${t}`,"content-type":"application/octet-stream","dropbox-api-arg":JSON.stringify({path:p,mode:"add",autorename:false,mute:true,strict_conflict:true})},body:bytes,signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`TECHNICAL_WRITE_RETRY: upload ${r.status} ${p} ${(await r.text()).slice(0,200)}`);return verify(t,p,bytes,"WRITTEN");}

async function main(){
  if(process.env.VERCEL_ENV!=="preview")throw new Error("P0_FAIL_CLOSED: editorial writer only in Vercel preview");
  if(process.env.VERCEL_GIT_COMMIT_REF!==EXPECTED_BRANCH)throw new Error(`P0_FAIL_CLOSED: unexpected branch ${process.env.VERCEL_GIT_COMMIT_REF??"MISSING"}`);
  [SOURCE_RECOMMENDATIONS,TARGET_JSONL,TARGET_VALIDATION,TARGET_HANDOFF].forEach(assertPath); records.forEach(validateRecord);
  const t=await token(); const recRead=await download(t,SOURCE_RECOMMENDATIONS); if(!recRead)throw new Error("P0_RECOMMENDATIONS_MISSING");
  const recs=recRead.bytes.toString("utf8").split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line));
  for(const record of records){const recId=record.recommendation_source_ref.split("#")[1];const rec=recs.find((x:any)=>x.recommendation_id===recId);if(!rec||rec.impact_case_id!==record.impact_case_id||!["APPROVED","APPROVED_WITH_OPEN_DATA"].includes(rec.fach_status))throw new Error(`P0_RECOMMENDATION_JOIN_FAIL:${record.impact_case_id}`);}
  const jsonl=Buffer.from(`${records.map(r=>JSON.stringify(r)).join("\n")}\n`,"utf8");
  const validation={schema_version:"woek-government-editorial-evidence-backfill-validation-1.0",canonical_root:ROOT,created_at:"2026-08-19T19:20:00+02:00",status:"PASS_2_OF_2",records:records.map(r=>({impact_case_id:r.impact_case_id,editorial_quality_gate:r.editorial_quality_gate,fach_status:r.fach_status,review_reason_before:r.review_reason_before})),gates:{case_specific:true,evidence_vs_outcome_separated:true,recommendation_not_generated:true,non_compensation_visible:true,reality_check_specific:true},source_recommendations:{path:SOURCE_RECOMMENDATIONS,file_id:String(recRead.metadata.id),rev:String(recRead.metadata.rev),dropbox_content_hash:String(recRead.metadata.content_hash),sha256:sha256(recRead.bytes),bytes:recRead.bytes.length}};
  const valBytes=Buffer.from(`${JSON.stringify(validation,null,2)}\n`,"utf8");const checks=[];checks.push(await writeHistory(t,TARGET_JSONL,jsonl));checks.push(await writeHistory(t,TARGET_VALIDATION,valBytes));
  const handoff={schema_version:"woek-government-editorial-evidence-b03-handoff-1.0",canonical_root:ROOT,created_at:"2026-08-19T19:20:00+02:00",status:"READY_FOR_PUBLIC_IMPORT",records:2,impact_case_ids:records.map(r=>r.impact_case_id),editorial_backfill:TARGET_JSONL,validation:TARGET_VALIDATION,verified_artifacts:checks,recommendations_changed:false,recommendations_generated:false,historical_files_overwritten:false,source_vs_view_required:true,coordinator_instruction:"Import B03 as additive editorial/evidence overlay for exactly these two cases, then rerun government editorial quality and exact source-vs-view. No other excluded case is implicitly approved."};
  const handoffBytes=Buffer.from(`${JSON.stringify(handoff,null,2)}\n`,"utf8");const handoffCheck=await writeHistory(t,TARGET_HANDOFF,handoffBytes);
  console.log(JSON.stringify({status:"EDITORIAL_EVIDENCE_B03_READY",records:2,jsonl:checks[0],handoff:handoffCheck},null,2));
}
main().catch(e=>{console.error(e instanceof Error?e.stack??e.message:String(e));process.exit(1);});
