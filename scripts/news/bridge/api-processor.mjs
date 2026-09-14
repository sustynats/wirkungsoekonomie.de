import {needsMediaReview} from './media-review.mjs';
import { randomUUID } from 'node:crypto';
import { hash, JOB_ID, bridgePath, parsePacket, outputSchema } from './contract.mjs';
import { semanticOutputSchema } from './semantic-review.mjs';
import { reviewResponseFormat } from './review-response-schema.mjs';
import { expandReviewConfirmation } from './review-confirmation.mjs';
import { deriveAssessmentCalculations } from '../impact-assessment.mjs';
import { EDITORIAL_REQUEST_CONTRACT_V4 } from './intake-processing.mjs';
import { validateEditorialPreview } from './editorial-approval.mjs';
import { apiRequestKey, API_EDITORIAL_PROTOCOL, validateApiRequest } from './api-service.mjs';
import { processorPriority, isHistoricalJob } from './processor.mjs';
import { latestEvidenceTime } from '../discovery-admission.mjs';
import { newsInputReadiness, NEWS_INPUT_READINESS_VERSION } from '../news-input-readiness.mjs';
import { POTENTIAL_RESEARCH_RULE } from '../impact-potential.mjs';

export const API_VALIDATION_REVISION = 'single-paid-attempt-6';

function reviewAssignment(original) {
  const assignment = structuredClone(original);
  delete assignment.requested_output;
  // The proposal is already included, bound by the original packet hash.
  // Preserve a differing profile: it can be relevant to the review.
  if (assignment.record?.analysis?.impact_assessment
    && hash(assignment.record.analysis.impact_assessment) === hash(assignment.proposed_assessment)) {
    delete assignment.record.analysis.impact_assessment;
  }
  // Keep the original job unchanged; this replaces only its obsolete transport
  // instruction for a full response, not any substantive review requirement.
  if (typeof assignment.instructions === 'string') assignment.instructions = assignment.instructions.replace(
    'Gib das vollständige geprüfte impact_assessment zurück.',
    'Bestätige das unveränderte proposed_assessment über assessment_result mit action:confirm, oder liefere bei notwendigen Korrekturen action:replace und das vollständige impact_assessment.');
  if (needsMediaReview(original.record) && typeof assignment.instructions === 'string') assignment.instructions = assignment.instructions.replace('Korrigiere ausschließlich impact_assessment, keine Originalnachricht oder persönliche Meinung.', 'Korrigiere impact_assessment und vervollständige den fehlenden Mediencheck. Originalnachricht und persönliche Meinung bleiben unverändert.');
  return assignment;
}

// Keep the deep MPD schema last so it cannot swallow the remaining article
// fields. Reordering preserves every field, rule and immutable source byte.
export function orderNativePrompt(prompt) {
  let untrusted = false;
  return prompt.split('\n').map(line => {
    if (line === 'UNTRUSTED_SOURCE_DATA_BEGIN') untrusted = true;
    if (untrusted) return line;
    if (!line.startsWith('{"analyses":')) return line;
    const schema = JSON.parse(line);
    schema.analyses = schema.analyses.map(({ impact_assessment, ...article }) => ({ ...article, impact_assessment }));
    return JSON.stringify(schema);
  }).join('\n');
}

export function apiJobKind(packet) {
  const original = packet.original_input || packet;
  if (['new_story', 'story_update', 'correction'].includes(original.job_type)) return 'news';
  if (original.job_type === 'impact_semantic_review') return 'review';
  if (original.job_type === 'editorial_request') return 'personal';
  // The old editorial_analysis importer publishes directly. Never route
  // personal topics there. They must use the existing approval intake first.
  throw Error('API_EDITORIAL_JOB_UNSUPPORTED');
}
export function prepareApiJob(packet, knowledge, { priorOutput = null } = {}) {
  const original = packet.original_input || packet, kind = apiJobKind(packet);
  const contract = kind === 'news' ? { output_schema: outputSchema }
    : kind === 'review' ? { output_schema: semanticOutputSchema, requested_output: original.requested_output }
      : EDITORIAL_REQUEST_CONTRACT_V4;
  const prompt = kind === 'news' && original.wirkungsticker?.analysis_prompt ? [
    orderNativePrompt(original.wirkungsticker.analysis_prompt),
    ...(original.wirkungsticker.analysis_prompt.includes(POTENTIAL_RESEARCH_RULE) ? [] : [POTENTIAL_RESEARCH_RULE]),
    'TRANSPORT: Nur das oben definierte native Objekt {analyses:[...]} zurückgeben. Keine Bridge-Hülle, keine zusätzlichen facts/story/editorial/wirkungsticker-Felder. Die Software verpackt die Analyse nachträglich. Ablehnungen im oben definierten kurzen rejection-Format.',
    'NESTING: publication_gate, importance, impact_potential, mechanisms, first_order, second_order, third_order, transformation_potential, resilience, side_effects, uncertainties, evidence_level, attribution, watch_next, reference_frameworks, visuals und media_impact sind Geschwister von impact_assessment im analyses-Eintrag. Sie gehören NICHT in impact_assessment.',
    'PRÜFUNG: analyses[0].systemic_relevance ist ein eigener begründender String, zusätzlich zum strukturierten impact_assessment.systemic_relevance. publication_recommendation:true ist mit news_value:context_only unvereinbar. Ein neues belegtes Ereignis kann new_evidence sein; reine Einordnung ohne neue Tatsachen wird kurz abgelehnt. summary genau zwei Sätze. Ex-ante-Folgen als bedingtes Potenzial formulieren und vom beobachteten Anlass trennen.',
    'QUELLENGATE: Zwei unabhängige Quellen sind KEINE allgemeine Veröffentlichungsvoraussetzung. Eine verlässliche Einzelquelle kann einen klar zugeschriebenen neuen Ereigniskern als initial/preliminary und single_source_claim tragen. Bestätigt/confirmed_claim ist etwas anderes. Nicht nur wegen fehlender unabhängiger Bestätigung ablehnen; benenne bei HOLD die konkret unzureichend belegte Kernbehauptung oder den fehlenden materiellen Nachrichtenwert. Bei strittigen schweren Vorwürfen und requires_corroboration bleiben Originalbeleg und unabhängige Prüfung erforderlich. Keine fehlenden Tatsachen ergänzen, nur um eine Textlänge zu erreichen.',
    ...(packet.original_input ? ['VALIDATOR_FEEDBACK: ' + JSON.stringify({ validation_errors: packet.validation_errors, attempt: packet.correction_attempt, prior_output: priorOutput })] : []),
  ].join('\n\n') : JSON.stringify({
    transport_revision: 'final-review-completion-9',
    ...(kind === 'review' ? {potential_research_rule:POTENTIAL_RESEARCH_RULE} : {}),
    task: 'Erzeuge eine vollständige neue Ausgabe für diesen unveränderten Rechercheauftrag. Keine Veröffentlichung oder Freigabe ausführen.' + (kind === 'review' ? ' Du darfst höchstens zwei Web-Suchzugriffe für konkret fehlende Wirkungs-/Kontextbelege verwenden. Primärquellen bevorzugen, keine Paywall/Login-Umgehung. Nur tatsächlich gelesene kurze Belege mit exakter URL und Originalauszug als höchstens zwei research_sources ausweisen. Prüfe aktiv mindestens einen tatsächlich fehlenden Ereignis- oder Mechanismusbeleg, bevor du fehlende unabhängige Belege als Sperrgrund nennst. Die nachgelagerte Software prüft jeden zusätzlichen Beleg.' : ' Keine Tools aufrufen.'),
    ...(kind === 'review' ? { readiness_definition: 'ready bedeutet: Die vorliegende Darstellung einschließlich ihrer ausdrücklich vorläufigen Zuschreibung besteht die fachliche Prüfung. ready ist weder confirmed_claim noch die unabhängige Bestätigung jeder Ereignisbehauptung. Ein initial/preliminary-Artikel kann deshalb ready sein. evidence bewertet, ob Text und Pfade die belastbare Quellenbasis korrekt wiedergeben, ohne mehr Gewissheit vorzutäuschen. Fehlende Primärbestätigung einer offen zugeschriebenen Aussage ist allein kein Sperrgrund. Bei unzuverlässiger Quelle, widersprüchlicher Darstellung, Überzeichnung, schwerem strittigem Vorwurf oder requires_corroboration gelten weiterhin die strengeren Gates. Benenne bei fail die konkret unbelegte Behauptung, die der Artikel selbst als gesichert ausgibt.' } : {}),
    ...(kind === 'review' ? { review_scope: 'Zahlen wie magnitude, magnitude_range.lower/upper und magnitude_factors.*.value sind JSON-Zahlen, keine Strings. Alle 6 Faktoren selbst am Pfad begründen; die Software berechnet daraus die Tragweite. Keinen bisherigen Faktorenfehler übernehmen. Für low/high_uncertainty-Pfade den tatsächlichen Recherchepass dokumentieren. Prüfe das modellierte Wirkungspotenzial, nicht ob eine vorgeschlagene Maßnahme bereits umgesetzt wurde. Unabhängiger Fachpass bedeutet unabhängiges Prüfurteil; es ist keine pauschale Zwei-Quellen-Pflicht. Eine korrekt zugeschriebene vorläufige Meldung kann auf einer verlässlichen Einzelquelle beruhen. confirmed_claim und schwere strittige Vorwürfe brauchen die jeweils strengeren Belege. Fehlender Beschluss, unbekannte Konditionen oder fehlende gemessene Folgen dürfen eine korrekt als Vorschlag und ex ante bezeichnete Analyse nicht allein blockieren. institutional_status prüft die zutreffende Bezeichnung des realen Status, nicht das Vorliegen einer endgültigen Entscheidung. magnitude prüft Faktoren, Wirkungsraum und Berechnung; geringe Evidenz gehört nach evidence und darf nicht mit Tragweite vermischt werden. Keine Quellen erfinden. Echte Beleglücken, unbedingte Behauptungen oder fehlerhafte Pfade bleiben Sperrgründe; korrigiere den Assessment-Entwurf nur quellengebunden.' } : {}),
    ...(kind === 'review' ? {final_version_rule:'Erst Quellen prüfen, dann zulässige Korrekturen vollständig ausarbeiten, zuletzt alle 14 Checks auf die ENDVERSION anwenden: unveränderter Artikeltext plus das von Dir bestätigte oder korrigierte Assessment und gegebenenfalls der vervollständigte Mediencheck. Ein in dieser Antwort vollständig behobener Erstfassungsfehler gehört in findings; er ist allein kein fail der Endfassung. Bleibt eine falsche Textbehauptung, Beleglücke oder ein sonstiger Pflichtteil ungelöst, bleibt der entsprechende Check fail und der Status needs_review/blocked. Keine automatische Freigabe, keine bloße Absichtserklärung einer Korrektur.'} : {}),
    ...(kind === 'review' && needsMediaReview(original.record) ? {media_completion:'Prüfe die kommunikative Relevanz eigenständig; der lokale Trigger ist nur ein Prüfhinweis. Gib unter media_applicability entweder {relevant:false,reason:konkrete Begründung} zurück oder bei relevant:true den VOLLSTÄNDIGEN Mediencheck gemäß dem Antwortschema. Dieser wird Teil der geprüften Endfassung. Belegter Sachverhalt, Akteursaussagen, Vermittlung, Inferenz und mögliche Wirkung strikt trennen; beobachtete Kommunikationswirkung benötigt eigene Evidenz, mindestens zwei gelieferte Belege. Keine Absichts- oder Manipulationszuschreibung. public_explanation 100–180 deutsche Wörter. source/evidence nur mit vorhandenen oder tatsächlich verifizierbaren neuen Quellen. Ist der nötige Check nicht abschließbar oder müsste der unveränderbare Artikeltext korrigiert werden, HOLD. Nicht zur Freigabe wegklassifizieren.'} : {}),
    output_contract: kind === 'review' ? {response_format:reviewResponseFormat(original.proposed_assessment,{mediaRequired:needsMediaReview(original.record)}),
      confirmation_rule:'Prüfe jeden Faktor und jeden der 14 Checks unabhängig. Wenn die fachlichen Werte, Pfade und Belegbindungen richtig sind, assessment_result:{action:confirm,confirmation:{research_check,path_research}} liefern. path_research ist ein Objekt mit den vorgegebenen Schlüsseln für ALLE Haupt- und Nebenpfade: jeweils tatsächlich geprüfte Suchindizes sowie konkretes Ergebnis. Auch erfolglose Recherche kann abgeschlossen sein. Nicht durchgeführte notwendige Recherche bleibt needs_research; dann keine Bestätigung. Bei echten Korrekturen assessment_result:{action:replace,impact_assessment:vollständiges korrigiertes Profil}. Kein Wortlaut muss umformuliert werden, nur weil Du der zweite Prüfer bist. second_pass bedeutet tatsächlich durchgeführte erneute Prüfung, nicht erfolgreiche Suche nach einer zweiten Quelle. Kurze konkrete deutsche Prüfbegründungen. Keine Markdown-Zitationen oder Toolmarker im JSON; in source_ids nur die konkreten gelieferten oder neu vergebenen research-source_ids, keine URLs. Bereits gelieferte Quellenauszüge nicht als neue research_sources duplizieren. Neue Quellen: quote exakt aus einem tatsächlich gelesenen Original kopieren, vorzugsweise eine kurze zusammenhängende Passage von 40–240 Zeichen. Originalsprache, Wortfolge und Zeichensetzung erhalten. Keine Übersetzung, Paraphrase, Auslassungszeichen oder Zusammenziehung mehrerer Textstellen. Die deutschsprachige Paraphrase gehört ausschließlich in supports. Kannst Du keinen exakten Auszug belegen, Quelle nicht aufnehmen; tatsächliches Suchergebnis und Grenze dokumentieren. Ein Suchtreffer-Snippet ist kein garantiert wörtlicher Originalbeleg.',
      calculation_rule:'Nur die redaktionell begründeten Faktoren und einzelnen Pfadrichtungen liefern. magnitude, magnitude_calculation und die aggregierte Dimensionsrichtung/Dominanz berechnet die Software. Keine Berechnung ersetzen, indem ein Faktor oder eine Pfadrichtung passend gemacht wird. primary_paths nur main_path/counter_path desselben Gegenstands und Vergleichs; Nebenrisiken in secondary_paths. Alle Schutzgrenzen ausdrücklich mit Begründung prüfen. Eine abgeschlossene erfolglose Recherche bleibt completed mit dokumentierten Wissensgrenzen; keine Quelle erfinden. Bei echter nicht abgeschlossener Prüfung needs_research und needs_review.'} : contract,
    ...(kind === 'review' ? { research_access: knowledge.research_access || null } : {}),
    assignment: kind === 'review' ? reviewAssignment(original) : original,
    ...(packet.original_input ? { repair: { validation_errors: packet.validation_errors, attempt: packet.correction_attempt, prior_output: priorOutput } } : {}),
    binding_rule: 'job_id, input_hash, schema_version und processed_at setzt der Server. Keine anderen Bindungen oder Quellen-IDs verändern. Eine native News-Analyse steht einmal unter wirkungsticker.analysis, nicht in einem analyses-Array. Keine technischen Zusatzfelder im Output.',
  });
  const request = { protocol: API_EDITORIAL_PROTOCOL, job_id: original.job_id, input_hash: original.input_hash,
    packet_hash: hash(packet), kind, attempt: packet.correction_attempt || 0, profile_hash: knowledge.hash,
    instructions: kind === 'review' ? knowledge.instructions.replace(
      'Du hast in diesem Aufruf keine Browser-, Such-, Bild- oder Dateitools. Verwende als Tatsachenbelege nur tatsächlich mitgelieferte Textauszüge.',
      'In diesem Fachpass steht ausschließlich das begrenzte Web-Suchtool zur Verfügung. Verwende als Tatsachenbelege mitgelieferte Textauszüge oder tatsächlich durch dieses Tool gelesene Belege. Keine Bilder oder Dateien erzeugen.') : knowledge.instructions, prompt };
  request.key = apiRequestKey(request);
  return validateApiRequest(request);
}
export function validateApiOutput(output, packet, now) {
  const original = packet.original_input || packet, kind = apiJobKind(packet);
  if (kind === 'news' && Array.isArray(output.analyses)) output = wrapNativeNewsOutput(output, original);
  const schema = kind === 'news' ? outputSchema : kind === 'review' ? semanticOutputSchema
    : output.disposition === 'hold' ? EDITORIAL_REQUEST_CONTRACT_V4.hold_output_schema : EDITORIAL_REQUEST_CONTRACT_V4.output_schema;
  output = structuredClone(output);
  if (kind === 'review') expandReviewConfirmation(output, original);
  canonicalResearchIdentifiers(output,original.record?.sources || original.sources || []);
  parsePacket(JSON.stringify(output), schema);
  canonicalAssessmentNumbers(output.impact_assessment || output.wirkungsticker?.analysis?.impact_assessment);
  deriveAssessmentCalculations(output.impact_assessment || output.wirkungsticker?.analysis?.impact_assessment);
  if (output.job_id !== original.job_id || output.input_hash !== original.input_hash) throw Error('BRIDGE_JOB_BINDING_MISMATCH');
  if (!Number.isFinite(Date.parse(output.processed_at)) || Date.parse(output.processed_at) < Date.parse(original.created_at)
    || Date.parse(output.processed_at) > Date.parse(now) + 300000) throw Error('BRIDGE_OUTPUT_TIME_INVALID');
  if (kind === 'personal' && output.preview) {
    if (output.preview.format !== original.request.kind) throw Error('EDITORIAL_PREVIEW_INPUT_CHANGED');
    // News intake has a separate factual preparation gate before its preview.
    if (output.preview.format !== 'news') validateEditorialPreview(output.preview);
  }
  return output;
}

// A research source sometimes uses an informal local ID. Give that same
// source a protocol ID and update only explicit identifier fields. The
// URL, quotation, judgment and immutable provider response are not changed.
export function canonicalResearchIdentifiers(output, originalSources=[]) {
  const replacements=new Map();
  const seen=new Set();
  for(const source of output.research_sources || []) {
    if(seen.has(source.source_id))return output; // ambiguous duplicate stays invalid
    seen.add(source.source_id);
    const original=originalSources.find(s=>s.source_id===source.source_id);
    if(original && original.url!==source.url)return output; // cannot retarget an existing identifier
    if(typeof source.source_id==='string' && source.source_id.trim() && !/^research-[a-z0-9-]{3,100}$/.test(source.source_id) && /^https:\/\//.test(source.url)) {
      replacements.set(source.source_id,'research-'+hash(source.url).slice(0,32));
    }
  }
  // Some reviewers use an exact supplied URL in a source-ID field. Resolve
  // only a unique, already-declared binding; never invent or merge sources.
  const urls=new Map();
  for(const source of [...originalSources,...(output.research_sources || [])]) {
    if(typeof source.url!=='string' || typeof source.source_id!=='string')continue;
    const ids=urls.get(source.url) || new Set();
    ids.add(replacements.get(source.source_id) || source.source_id);urls.set(source.url,ids);
  }
  for(const [url,ids] of urls) if(ids.size===1 && !originalSources.some(s=>s.source_id===url && s.url!==url)) {
    replacements.set(url,[...ids][0]);
  }
  const visit=value=>{
    if(!value || typeof value!=='object')return;
    if(typeof value.source_id==='string' && replacements.has(value.source_id))value.source_id=replacements.get(value.source_id);
    if(Array.isArray(value.source_ids))value.source_ids=value.source_ids.map(id=>replacements.get(id)||id);
    Object.values(value).forEach(visit);
  };
  visit(output);return output;
}

// Lossless transport typing only: an explicitly supplied "3" is the number 3.
// Never derive scores, fill nulls, alter source IDs or adjust a method judgment.
export function canonicalAssessmentNumbers(assessment) {
  const numeric = (object, key) => { if (object && typeof object[key] === 'string' && /^[0-5]$/.test(object[key])) object[key] = Number(object[key]); };
  const path = p => {
    numeric(p, 'magnitude'); numeric(p?.magnitude_range, 'lower'); numeric(p?.magnitude_range, 'upper');
    for (const key of ['reach','intensity','duration','irreversibility','vulnerability','system_depth']) numeric(p?.magnitude_factors?.[key], 'value');
  };
  for (const key of ['human','planet','democracy']) {
    const dimension = assessment?.dimensions?.[key]; numeric(dimension, 'magnitude');
    for (const p of [...(dimension?.primary_paths || []), ...(dimension?.secondary_paths || [])]) path(p);
  }
  for (const effect of assessment?.observed_effects || []) path(effect);
  return assessment;
}

// The established analysis prompt returns {analyses:[...]}. Convert that native
// result into the existing transport envelope without asking a model to repeat
// every fact and paragraph. All editorial values are copied, never re-scored.
// The unchanged importer still validates the native analysis and second pass.
export function wrapNativeNewsOutput(output, original) {
  if (output.analyses.length !== 1 || output.analyses[0]?.story_id !== original.wirkungsticker?.story_id) throw Error('BRIDGE_ANALYSIS_BINDING_MISMATCH');
  const a = structuredClone(output.analyses[0]), publish = a.publication_recommendation;
  // These fields belong only to the impact assessment. Some complete native
  // responses close that object before emitting its final fields. Relocate
  // supplied values only when the destination is absent; never merge or infer
  // conflicting assessments. The original provider response stays immutable.
  if(a.impact_assessment?.version==='2.1') {
    for(const field of ['dimensions','research_check','observed_effects']) {
      if(!(field in a.impact_assessment) && field in a) {
        a.impact_assessment[field]=a[field];delete a[field];
      }
    }
  }
  // Recognize only unambiguous native siblings sometimes placed one level too
  // deep by the model. No score, source, text or review decision is invented.
  // Keep the original raw response and nested copy as audit evidence.
  for (const field of ['publication_gate','importance','impact_potential','impact_risks','mechanisms','first_order','second_order','third_order','transformation_potential','resilience','side_effects','uncertainties','evidence_level','attribution','watch_next','reference_frameworks','visuals','media_impact']) {
    if (!(field in a) && a.impact_assessment && field in a.impact_assessment) a[field] = structuredClone(a.impact_assessment[field]);
  }
  if (typeof publish !== 'boolean') throw Error('API_EDITORIAL_NATIVE_DECISION_REQUIRED');
  const reason = publish ? a.publication_gate?.rationale : a.rejection?.reason || a.publication_gate?.rationale;
  if (typeof reason !== 'string' || !reason.trim()) throw Error('API_EDITORIAL_NATIVE_REASON_REQUIRED');
  const string = v => typeof v === 'string' ? v : '';
  const list = v => Array.isArray(v) ? v : [];
  const claims = list(a.event_claims);
  const dimensions = Object.fromEntries(['human','planet','democracy'].map(key => {
    const d = a.impact_assessment?.dimensions?.[key];
    return [key, { direction: string(d?.direction) || 'not_assessed', analysis: string(d?.rationale) || reason,
      evidence: string(d?.evidence) || 'not_assessable' }];
  }));
  return {
    schema_version: output.schema_version, job_id: output.job_id, input_hash: output.input_hash, processed_at: output.processed_at,
    decision: { status: publish ? 'publish' : !a.rejection?.code || a.rejection.code === 'insufficient_evidence' ? 'hold' : 'reject', reason, merge_into: null, priority: 50 },
    story: { headline: string(a.headline).trim() || original.event?.canonical_title || '', subheadline: '', short_summary: string(a.summary),
      detailed_summary: string(a.source_summary), what_happened: string(a.source_summary), why_it_matters: string(a.why_relevant) },
    facts: { confirmed: claims.filter(c => c.status === 'confirmed_claim'), uncertain: claims.filter(c => c.status === 'uncertain_claim'), contradictions: [], missing_information: list(a.uncertainties) },
    fact_check: { status: string(a.news_status) || 'not_assessed', summary: string(a.attribution), claims },
    consequence_check: { direct: list(a.first_order), second_order: list(a.second_order), third_order: list(a.third_order), time_horizon: [] },
    impact: { ...dimensions, net_assessment: string(a.impact_potential), uncertainty: list(a.uncertainties).join(' ') || reason },
    frame_check: { relevant: Boolean(a.media_impact), frames: [], resonance_risks: [], notes: '' },
    sources: original.sources.map(s => ({ source_id: s.source_id, url: s.url })),
    editorial: { category: original.event?.category || '', tags: [], location: null, people: [], organisations: [], publishable: publish },
    quality: { source_quality: string(a.publication_gate?.evidence_basis) || 'not_assessed', evidence_strength: string(a.evidence_level) || 'not_assessed', needs_human_review: false, warnings: [] },
    wirkungsticker: { analysis: a },
    ...(output.research_sources ? { research_sources: output.research_sources } : {}),
  };
}

export function selectApiJobs(jobs, now, { maxJobs = 5, maxNewsAgeHours = 6, newsNotBefore = null, excludedIds = [], onlyJobId = null } = {}) {
  if(onlyJobId !== null && !JOB_ID.test(onlyJobId))throw Error('API_EDITORIAL_TARGET_INVALID');
  // Finish the independent gate for current prepared news before opening more
  // new drafts. Otherwise a constant inflow can starve actual publication.
  const priority = job => job.input?.job_type === 'impact_semantic_review' ? 595 : job.status === 'correction_pending' ? 585 : processorPriority(job, now);
  return jobs.filter(job => {
    const input = job.input || job;
    if(onlyJobId !== null && input.job_id !== onlyJobId)return false;
    if (job.ack || job.accepted || ['quarantined', 'archive_failed'].includes(job.status)
      || !JOB_ID.test(input.job_id || '') || excludedIds.includes(input.job_id) || isHistoricalJob(job)) return false;
    let kind; try { kind = apiJobKind(input); } catch { return false; }
    if (kind === 'personal') return true;
    const evidence = latestEvidenceTime(job.candidate || input.record || input, now);
    return Number.isFinite(evidence) && evidence <= Date.parse(now) + 300000
      && (newsNotBefore === null || evidence >= Date.parse(newsNotBefore))
      && evidence >= Date.parse(now) - maxNewsAgeHours * 3600000;
  }).sort((a, b) => priority(b) - priority(a)
    || latestEvidenceTime(b.candidate || b.input, now) - latestEvidenceTime(a.candidate || a.input, now)
    || a.input.job_id.localeCompare(b.input.job_id)).slice(0, maxJobs);
}

// Unlike ChatGPT's connector attestation this explicitly attests an Oracle API
// producer. Read/write proof cannot be reused to pretend a chat has Dropbox.
export async function apiProcessorPreflight(transport, api, now) {
  const capability = await api.health();
  if (capability.protocol !== API_EDITORIAL_PROTOCOL || capability.enabled !== true || capability.budget_guards !== true) throw Error('API_EDITORIAL_ENDPOINT_UNAVAILABLE');
  if (capability.execution_policy?.max_paid_attempts_per_job !== 1 || capability.execution_policy?.automatic_rewrites !== false
    || capability.execution_policy?.input_readiness_version !== NEWS_INPUT_READINESS_VERSION) throw Error('API_EDITORIAL_EXECUTION_POLICY_UNAVAILABLE');
  const runId = randomUUID();
  const receipt = { actor: 'oracle_api', run_id: runId, at: now, status: 'UNAVAILABLE', reads: {}, write_ok: false };
  for (const folder of ['98_CONFIG', '00_INBOX', '10_CLAIMED', '20_OUTPUT_READY', '30_ACK']) {
    if (!Array.isArray(await transport.list(folder))) throw Error('API_EDITORIAL_BRIDGE_UNAVAILABLE');
    receipt.reads[folder] = true;
  }
  const probePath = bridgePath('20_OUTPUT_READY', `preflight-api-${runId}.probe.json`);
  const probe = { actor: 'oracle_api', run_id: runId, purpose: 'transport_preflight_only', at: now };
  await transport.writeAtomic(probePath, probe);
  if (hash(JSON.parse(await transport.read(probePath))) !== hash(probe)) throw Error('API_EDITORIAL_PREFLIGHT_READBACK_FAILED');
  // Keep immutable proof, but do not let daily probes fill the live output
  // folder until its bounded listing stops the entire publication pipeline.
  await transport.move(probePath, bridgePath('95_LOGS', `preflight-api-${runId}.probe.json`));
  receipt.write_ok = true;
  receipt.execution_policy = capability.execution_policy;
  receipt.status = 'PASS';
  await transport.writeAtomic(bridgePath('95_LOGS', `processor-api-preflight-${runId}.json`), receipt);
  return receipt;
}

export class ApiEditorialProcessor {
  constructor({ store, transport, api, knowledge, preflightOutput = () => {}, now = () => new Date().toISOString() }) {
    Object.assign(this, { store, transport, api, knowledge, preflightOutput, now });
  }
  async process(job, receipt) {
    const at = this.now(), age = Date.parse(at) - Date.parse(receipt?.at);
    if (receipt?.actor !== 'oracle_api' || receipt.status !== 'PASS' || !receipt.write_ok || age < 0 || age > 1800000) throw Error('API_EDITORIAL_PREFLIGHT_REQUIRED');
    const id = job.input.job_id;
    // Access-blocked ChatGPT files/outputs are not eligible for retransmission.
    // The exclusion is persisted by operators in the private observation log.
    if (this.store.observation(`api-excluded:${id}`)) return { status: 'excluded', job_id: id };
    const current = this.store.get(id);
    if (!current || current.ack || current.accepted) return { status: 'already_processed', job_id: id };
    const outputPath = bridgePath('20_OUTPUT_READY', `${id}.output.json`);
    if (await this.transport.metadata(outputPath) || await this.transport.metadata(bridgePath('30_ACK', `${id}.ack.json`))) return { status: 'already_delivered', job_id: id };
    const repair = current.corrections?.at(-1);
    const name = current.status === 'correction_pending' && repair ? `${id}.repair-${repair.attempt}.json` : `${id}.input.json`;
    const sourcePath = bridgePath('00_INBOX', name), claimPath = bridgePath('10_CLAIMED', name);
    let ownership = this.store.observation(`api-claim:${name}`);
    if (await this.transport.metadata(claimPath) && ownership?.state !== 'claimed') return { status: 'claimed_elsewhere', job_id: id };
    const packet = JSON.parse(await this.transport.read(await this.transport.metadata(claimPath) ? claimPath : sourcePath));
    if (packet.job_id !== id || packet.input_hash !== current.input.input_hash) throw Error('BRIDGE_JOB_BINDING_MISMATCH');
    const priorOutput = packet.original_output_path ? JSON.parse(await this.transport.read(packet.original_output_path)) : null;
    let request;
    try { request = prepareApiJob(packet, this.knowledge, { priorOutput }); }
    catch (error) {
      if (error.message !== 'API_EDITORIAL_REVIEW_INPUT_INVALID') throw error;
      this.store.observe(`api-attention:${id}`,{job_id:id,at:this.now(),validation_revision:API_VALIDATION_REVISION,status:'preparation_failed',error:error.message});
      return {status:'preparation_failed',job_id:id,provider_attempts:0,error:error.message};
    }
    // A previously completed response remains recoverable after a transport
    // encoder update, but source packet and leading methodology must match.
    let recovered;
    if (ownership && ownership.key !== request.key) {
      recovered = await this.api.get(ownership.key);
      const sameBinding = recovered?.packet_hash === request.packet_hash
        && [request.profile_hash, ...(this.knowledge.compatibleHashes || [])].includes(recovered.profile_hash);
      if (sameBinding && recovered.pre_execution_rejected) recovered = null;
      else if (recovered?.status !== 'completed' || !sameBinding) return { status: 'legacy_claim_attention', job_id: id };
    }
    // Corrections can recover existing paid output, but never create a new
    // paid request or claim an unprocessed repair as if it were fresh news.
    if (packet.original_input && !ownership && !await this.api.get(request.key)) {
      this.store.observe(`api-attention:${id}`,{job_id:id,at:this.now(),validation_revision:API_VALIDATION_REVISION,status:'automatic_rewrite_disabled'});
      return {status:'automatic_rewrite_disabled',job_id:id,provider_attempts:0};
    }
    if (!ownership) {
      // Preparation failure must not claim an input or consume a paid slot.
      const existingResult = recovered || await this.api.get(request.key);
      if (request.kind === 'news' && (!existingResult || existingResult.status === 'budget_blocked' && existingResult.provider_called === false)) {
        const preparation = newsInputReadiness(request.prompt);
        this.store.observe(`api-input-preparation:${id}`, {job_id:id,at:this.now(),packet_hash:request.packet_hash,...preparation});
        if (preparation.status !== 'READY_FOR_DRAFT') return {status:'preparation_failed',job_id:id,provider_attempts:0,preparation};
      }
      ownership = { job_id: id, key: request.key, packet_hash: hash(packet), claim_path: claimPath, claimed_at: at, actor: 'oracle_api', state: 'intent' };
      this.store.observe(`api-claim:${name}`, ownership);
      try { await this.transport.move(sourcePath, claimPath); }
      catch { return { status: 'claim_unknown', job_id: id }; }
      // Identical content after an ambiguous move does not prove who claimed
      // it. Only the successful atomic MOVE response establishes ownership.
      ownership.state = 'claimed'; this.store.observe(`api-claim:${name}`, ownership);
    }
    if (ownership.state !== 'claimed') return { status: 'claim_unknown', job_id: id };
    if (hash(JSON.parse(await this.transport.read(claimPath))) !== request.packet_hash) throw Error('API_EDITORIAL_CLAIM_CHANGED');
    const attemptRequest = request;
    let result, output, providerAttempts = 0;
    {
      result = recovered || await this.api.get(attemptRequest.key);
      if (!result || result.status === 'budget_blocked' && result.provider_called === false) {
        if (packet.original_input || attemptRequest.attempt > 0) {
          this.store.observe(`api-attention:${id}`,{job_id:id,at:this.now(),validation_revision:API_VALIDATION_REVISION,status:'automatic_rewrite_disabled'});
          return {status:'automatic_rewrite_disabled',job_id:id,provider_attempts:0};
        }
        result = await this.api.submit(attemptRequest);
        if (result.provider_called !== false) providerAttempts++;
      }
      const resultKey = result.key || attemptRequest.key;
      this.store.observe(`api-result:${resultKey}`, { job_id: id, key: resultKey, at: this.now(), status: result.status, usage: result.usage || null });
      let validationError;
      if (result.status === 'completed') {
        if (result.output?.job_id !== id || result.output?.input_hash !== request.input_hash) throw Error('BRIDGE_JOB_BINDING_MISMATCH');
        try {
          output = validateApiOutput(result.output, packet, this.now());
          await this.preflightOutput(output, current, this.now());
        }
        catch (error) {
          // A missing executable or temporary source/network failure cannot be
          // repaired by rewriting an article. Keep the completed paid response
          // for the next validation run; no new key, claim or model call.
          const code = error?.code || error?.cause?.code;
          if (error?.retryable === true || ['ENOENT','EACCES','ENOMEM','ENOSPC','EMFILE','ECONNRESET','ECONNREFUSED','ETIMEDOUT','EAI_AGAIN'].includes(code)
            || /^(?:ARTICLE|ROBOTS|RSL)_HTTP_(?:429|5\d\d)(?::|$)/.test(error?.message || '')) {
            const retry = Object.assign(Error('API_EDITORIAL_VALIDATION_DEPENDENCY_UNAVAILABLE'), { retryable: true, cause: error });
            this.store.observe(`api-validation:${resultKey}`, {job_id:id,key:resultKey,at:this.now(),error:retry.message,retryable:true});
            throw retry;
          }
          validationError = [String(error.message), ...(error.issues || [])].join('\n').slice(0, 6000);
          this.store.observe(`api-validation:${resultKey}`, {job_id:id,key:resultKey,at:this.now(),error:validationError});
        }
      } else if (result.status === 'failed' && ['api_editorial_invalid_json', 'api_editorial_incomplete'].includes(result.error)) validationError = result.error;
      else {
        if(['automatic_rewrite_disabled','failed','unknown','preparation_failed'].includes(result.status))this.store.observe(`api-attention:${id}`,{job_id:id,at:this.now(),validation_revision:API_VALIDATION_REVISION,status:result.status,error:result.error || null});
        return { job_id: id, status: result.status, provider_attempts: providerAttempts };
      }
      if (validationError) {
        this.store.observe(`api-attention:${id}`,{job_id:id,key:resultKey,at:this.now(),validation_revision:API_VALIDATION_REVISION,status:'validation_failed',error:validationError});
        return {job_id:id,status:'validation_failed',provider_attempts:providerAttempts};
      }
    }
    const latest = this.store.get(id);
    if (latest.ack || latest.accepted) return { status: 'already_processed', job_id: id };
    if (await this.transport.metadata(outputPath)) return { status: 'already_delivered', job_id: id };
    await this.transport.writeAtomic(outputPath, output);
    if (hash(JSON.parse(await this.transport.read(outputPath))) !== hash(output)) throw Error('API_EDITORIAL_DELIVERY_READBACK_FAILED');
    await this.transport.writeAtomic(bridgePath('95_LOGS', `processor-api-${result.key || attemptRequest.key}.json`), {
      actor: 'oracle_api', job_id: id, key: result.key || attemptRequest.key, output_hash: hash(output), delivered_at: this.now(),
      profile_hash: result.profile_hash || request.profile_hash, validated_profile_hash: request.profile_hash, usage: result.usage || null, status: 'OUTPUT_DELIVERED_NOT_PUBLISHED',
    });
    return { status: 'output_delivered', job_id: id, provider_attempts: providerAttempts };
  }
}
