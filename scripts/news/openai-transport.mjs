// Direktbetrieb (seit 15.09.2026): genau ein bezahlter OpenAI-Aufruf je
// Nachricht, ohne Bridge, Dropbox, ChatGPT-Worker oder Zweitprüfung per API.
// Der Aufruf liefert das vollständige veröffentlichungsreife Paket; alles
// danach ist deterministisch (Gate, Ableitung der Tragweite, Build).
import { buildAnalysisPrompt, decodeWoekAiResponse, sanitizeFeedText } from './lib.mjs';
import { deriveAssessmentCalculations, IMPACT_VERSION } from './impact-assessment.mjs';
import { modelRates } from './budget.mjs';

export const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
export const DEFAULT_NEWS_MODEL = 'gpt-5.4-mini';
export const TRANSPORT_VERSION = 'direct-single-call-1';
export const SUPPORTED_MODELS = /^gpt-5\.(?:4-mini|5|6-luna)(?:-|$)/;

export function newsModel(env = process.env) {
  const model = String(env.WOEK_NEWS_MODEL || DEFAULT_NEWS_MODEL).trim();
  if (!SUPPORTED_MODELS.test(model)) throw new Error('NEWS_MODEL_UNSUPPORTED');
  return model;
}

// System instructions for the single pass. The prompt itself (rules, schema,
// UNTRUSTED_SOURCE_DATA) is unchanged and shared with every other transport.
export const SINGLE_CALL_INSTRUCTIONS = [
  'Du bist die quellengebundene Nachrichtenredaktion des Wirkungstickers (Wirkungsökonomie).',
  'Es gibt genau einen Durchgang. Es folgt keine zweite Anfrage, keine Nachfrage und keine Korrekturrunde: Liefere sofort die vollständige, veröffentlichungsreife Fassung.',
  'Wirkungspotenzial, nicht Wirkungsnachweis: Für Mensch, Planet und Demokratie ist jeweils ein bedingter Wirkpfad zu modellieren (path_status modelled, primary_paths nicht leer, sechs Faktoren R/I/D/U/V/S je 0..5 mit Begründung und source_ids). Fehlende Messwerte oder unbekannter Eintritt sind kein Grund für null oder insufficient_basis. Ein begründet vernachlässigbarer Pfad erhält Faktoren 0 mit negligibility_rationale.',
  'Der Server berechnet magnitude, direction und dominance deterministisch aus deinen Faktoren; liefere trotzdem konsistente Werte. magnitude_range muss den Punktwert einschließen.',
  'Der zweite Recherchepass findet in diesem Durchgang statt: Bei evidence low/not_assessable oder path_quality high_uncertainty setze research_pass second_pass und formuliere research_result als konkrete Wissensgrenze. research_check.status completed, mindestens eine gezielte Prüfung in research_check.searches (question, result, source_ids nur aus gelieferten Quellen), source_functions für jede genutzte Quelle.',
  'system_check vollständig ausfüllen (cross_dimension_review für alle drei Dimensionen, first/second/third_order, counter_evidence, source_independence, institutional_status).',
  'Belegte eingetretene Schäden (Tote, Verletzte, Zerstörung) gehören zusätzlich als observed_effects mit eigenen Faktoren; das Potenzial bleibt daneben modelliert.',
  'review_mode impact_potential_reassessment: Eine bereits veröffentlichte, materielle Meldung wird vollständig neu gefasst, damit das Wirkungspotenzial für alle drei Dimensionen modelliert vorliegt. Kein Dublettenvergleich mit sich selbst: publication_recommendation true, publication_gate.duplicate_status material_update, publication_depth wie bisher, Fakten und Quellen unverändert.',
  'Nur gelieferte Quellen und deren source_id/evidence_id verwenden. Keine Zahlen, Quellen oder Zitate erfinden. Alle Lesertexte auf Deutsch, ohne URLs, IDs oder HTML.',
  'Quellenkennungen wörtlich: In source_id und source_ids steht ausschließlich der exakte Wert aus dem Feld source_id der gelieferten sources (z. B. "rbb24-nachrichten", nicht "rbb24"). Keine Kurzformen, keine Kennungen aus Verlagsnamen, keine Quellen aus eigenem Wissen; research_check.searches und source_functions bleiben auf die gelieferten Quellen beschränkt.',
  'Pfadtypen: primary_paths enthalten nur main_path oder counter_path mit same_target true und same_baseline true; side_effect und side_risk gehören in secondary_paths. Bei path_status modelled ist data_status modelled oder estimated, nie missing.',
  'source_summary: 100 bis 180 Wörter in zwei bis drei Absätzen (Leerzeile), unabhängig von publication_depth. Lesertexte enthalten nur Zahlen, Daten und Jahreszahlen, die wörtlich in den gelieferten Quellentexten stehen; das Datum der Berichterstattung wird nicht ergänzt.',
  'Vollständigkeit ist Pflicht: Jeder Eintrag in analyses enthält ALLE Schlüssel des Schemas. Checkliste je Eintrag: story_id, publication_recommendation, headline, news_status, publication_depth, event_claims, followups, source_summary, summary, detail_summary, why_relevant, status, analysis_type, impact_assessment (mit dimensions.human/planet/democracy), importance, impact_potential, impact_risks, mechanisms, first_order, second_order, third_order, systemic_relevance, transformation_potential, resilience, side_effects, uncertainties, evidence_level, attribution, watch_next, reference_frameworks, publication_gate, visuals, media_impact. Ein fehlender Schlüssel macht die gesamte Antwort unbrauchbar.',
  'Reihenfolge: Erst alle Lesertext- und Gate-Felder (headline bis publication_gate, visuals, media_impact), dann impact_assessment mit allen drei Dimensionen, und als allerletzter Schlüssel analysis_complete:true. Ein Eintrag ohne impact_assessment oder ohne analysis_complete ist ungültig und wird verworfen; höre nie vor impact_assessment auf.',
  'Faktoren ohne Ausnahme: JEDER Pfad in JEDER Dimension (human, planet, democracy; primary_paths und secondary_paths) trägt magnitude_factors mit allen sechs Faktoren, protection_boundary, research_pass und research_result. Die letzte Dimension wird genauso vollständig ausgearbeitet wie die erste.',
  'Attribution im Titel: Hat ein event_claim attribution_required:true und headline_claim:true, muss headline_qualifier (z. B. „laut Polizei“, „nach Angaben des Ministeriums“) wörtlich in headline vorkommen. Sonst headline_claim:false setzen und den Titel ohne diese Behauptung formulieren.',
  'Zeitstatus der Pfade: temporal_status ex_ante ist der Regelfall. ongoing nur, wenn ein tatsächlich beobachtetes Signal vorliegt; dann observed_signal.change (Text) und observed_signal.source_ids (gelieferte Quellen) auf demselben Pfad. Ein Beschluss oder eine Ankündigung ist kein beobachtetes Signal.',
  'Zahlen (magnitude, magnitude_factors.*.value, magnitude_range.lower/upper) sind JSON-Zahlen, keine Strings. Wahrheitswerte (publication_recommendation, same_target, same_baseline, protection_boundary.decisive, attribution_required, headline_claim) sind JSON-Booleans.',
  'Jeder Pfad in primary_paths und secondary_paths trägt magnitude_factors mit allen sechs Faktoren reach, intensity, duration, irreversibility, vulnerability, system_depth, jeweils mit value 0..5, rationale (mindestens 12 Zeichen) und source_ids aus den gelieferten Quellen, sowie protection_boundary mit decisive und rationale.',
  'Antworte ausschließlich mit einem einzigen JSON-Objekt {"analyses":[...]} gemäß Schema, ohne Markdown und ohne Kommentar.',
].join('\n');

// Ausgabebudget: ein vollständiges Paket braucht gemessen 6k–8k Antwort-Token;
// Reasoning-Token zählen mit. 24k deckt das mit Reserve ab und begrenzt Laufzeit
// und Kosten einer entgleisten Generierung (Lauf 6: zwei Aufrufe über 240 s).
export function buildOpenAiRequest(prompt, { model, maxOutputTokens = 24000, reasoningEffort = 'low' } = {}) {
  return {
    model, store: false,
    reasoning: { effort: reasoningEffort },
    max_output_tokens: maxOutputTokens,
    instructions: SINGLE_CALL_INSTRUCTIONS,
    input: prompt,
    text: { format: { type: 'json_object' } },
  };
}

// Only the final assistant message counts. Commentary or an aborted draft is
// never stitched together into an answer.
export function finalOutputText(payload) {
  const message = (payload?.output || []).filter(item => item.type === 'message').at(-1);
  if (!message || (message.role && message.role !== 'assistant') || (message.status && message.status !== 'completed')
    || !Array.isArray(message.content) || message.content.some(item => item.type === 'refusal')) return null;
  const chunks = message.content.filter(item => item.type === 'output_text' && typeof item.text === 'string');
  return chunks.length ? chunks.map(item => item.text).join('') : null;
}

export function decodeUsage(payload) {
  const usage = payload?.usage;
  if (!usage || !Number.isSafeInteger(usage.input_tokens) || !Number.isSafeInteger(usage.output_tokens)) return null;
  const cached = usage.input_tokens_details?.cached_tokens;
  return { input_tokens: usage.input_tokens, output_tokens: usage.output_tokens,
    ...(Number.isSafeInteger(cached) ? { cached_input_tokens: Math.min(cached, usage.input_tokens) } : {}) };
}

// Transport-level type coercion: a numeric string "3" is the number 3, a
// boolean string is a boolean. No value, factor or verdict is invented.
const SCORE = /^\s*[0-5]\s*$/;
export function coerceScore(value) { return typeof value === 'string' && SCORE.test(value) ? Number(value) : value; }
export function coerceBoolean(value) { return value === 'true' ? true : value === 'false' ? false : value; }
export function coerceAssessmentTypes(assessment) {
  const path = (p) => {
    if (!p || typeof p !== 'object') return;
    p.magnitude = coerceScore(p.magnitude);
    for (const key of ['same_target', 'same_baseline']) if (key in p) p[key] = coerceBoolean(p[key]);
    if (p.magnitude_range && typeof p.magnitude_range === 'object') { p.magnitude_range.lower = coerceScore(p.magnitude_range.lower); p.magnitude_range.upper = coerceScore(p.magnitude_range.upper); }
    for (const factor of Object.values(p.magnitude_factors || {})) if (factor && typeof factor === 'object') factor.value = coerceScore(factor.value);
    if (p.protection_boundary && typeof p.protection_boundary === 'object') p.protection_boundary.decisive = coerceBoolean(p.protection_boundary.decisive);
  };
  for (const d of Object.values(assessment?.dimensions || {})) {
    if (!d || typeof d !== 'object') continue;
    d.magnitude = coerceScore(d.magnitude);
    [...(d.primary_paths || []), ...(d.secondary_paths || [])].forEach(path);
    if (d.balance && typeof d.balance === 'object') for (const key of ['comparable_material_paths', 'protection_boundary_decisive']) if (key in d.balance) d.balance[key] = coerceBoolean(d.balance[key]);
  }
  (assessment?.observed_effects || []).forEach(path);
  return assessment;
}

// The model abbreviates or reshapes supplied identifiers ("rbb24" for
// "rbb24-nachrichten") and occasionally cites a source it was never given
// (run 7: "tagesschau-access"). One wrong identifier invalidates every binding
// that uses it, so the gate reported missing factors although all six were
// present. Every reference is mapped back to a supplied source_id by exact,
// normalized, unique-prefix or unique-publisher match; an unmappable reference
// is dropped so the gate judges the binding that remains. Nothing the model
// did not cite is ever added.
const slug = (value) => String(value ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export function resolveSourceId(id, sources = []) {
  if (typeof id !== 'string') return null;
  const known = [...new Set(sources.map((s) => s?.source_id).filter((v) => typeof v === 'string' && v))];
  if (known.includes(id)) return id;
  const wanted = slug(id);
  if (!wanted) return null;
  const unique = (list) => { const set = [...new Set(list)]; return set.length === 1 ? set[0] : null; };
  const related = (a, b) => a === b || a.startsWith(`${b}-`) || b.startsWith(`${a}-`);
  const byPublisher = (test) => unique(sources.filter((s) => known.includes(s?.source_id) && [s.publisher, s.outlet].some((name) => name && test(slug(name)))).map((s) => s.source_id));
  return unique(known.filter((k) => slug(k) === wanted))
    ?? unique(known.filter((k) => related(slug(k), wanted)))
    ?? byPublisher((name) => name === wanted)
    ?? byPublisher((name) => related(name, wanted))
    ?? null;
}

export function repairSourceBindings(analysis, sources = [], repairs = []) {
  if (!analysis || typeof analysis !== 'object' || !Array.isArray(sources) || !sources.length) return analysis;
  const note = (where, from, to) => repairs.push(`${where}:${from}->${to ?? 'dropped'}`);
  const mapList = (holder, key, where) => {
    if (!holder || typeof holder !== 'object' || !Array.isArray(holder[key])) return;
    const mapped = [];
    for (const id of holder[key]) {
      const to = resolveSourceId(id, sources);
      if (to !== id) note(where, id, to);
      if (to && !mapped.includes(to)) mapped.push(to);
    }
    holder[key] = mapped;
  };
  const mapOne = (holder, key, where) => {
    if (!holder || typeof holder !== 'object' || typeof holder[key] !== 'string') return;
    const to = resolveSourceId(holder[key], sources);
    if (to && to !== holder[key]) { note(where, holder[key], to); holder[key] = to; }
  };
  const pathRefs = (p, where) => {
    if (!p || typeof p !== 'object') return;
    mapList(p, 'source_ids', where);
    for (const [k, f] of Object.entries(p.magnitude_factors || {})) mapList(f, 'source_ids', `${where}.${k}`);
    mapList(p.protection_boundary, 'source_ids', `${where}.boundary`);
    mapList(p.observed_signal, 'source_ids', `${where}.signal`);
  };
  const rows = (v) => (Array.isArray(v) ? v : []);
  rows(analysis.followups).forEach((f, i) => mapOne(f, 'source_id', `followups[${i}]`));
  rows(analysis.event_claims).forEach((c, i) => mapOne(c, 'source_id', `event_claims[${i}]`));
  const a = analysis.impact_assessment;
  if (!a || typeof a !== 'object') return analysis;
  const research = a.research_check;
  if (research && typeof research === 'object') {
    if (Array.isArray(research.source_functions)) research.source_functions = research.source_functions.filter((sf, i) => {
      if (!sf || typeof sf !== 'object') return false;
      const to = resolveSourceId(sf.source_id, sources);
      if (to !== sf.source_id) note(`source_functions[${i}]`, sf.source_id, to);
      if (!to) return false;
      sf.source_id = to;
      return true;
    });
    rows(research.searches).forEach((s, i) => mapList(s, 'source_ids', `searches[${i}]`));
  }
  for (const [key, d] of Object.entries(a.dimensions || {})) {
    if (!d || typeof d !== 'object') continue;
    mapList(d, 'reviewed_source_ids', `${key}.reviewed`);
    [...rows(d.primary_paths), ...rows(d.secondary_paths)].forEach((p, i) => pathRefs(p, `${key}.paths[${i}]`));
  }
  rows(a.observed_effects).forEach((e, i) => pathRefs(e, `observed[${i}]`));
  return analysis;
}

// The prompt schema lists side_effect and side_risk as path types; the gate
// accepts only main_path and counter_path inside primary_paths, and only
// modelled or estimated as data_status of a modelled dimension. These are
// placement labels, not editorial content: side paths move to secondary_paths,
// and a dimension whose only primary path is a side path keeps it as its main
// path. The aggregate is recomputed afterwards from the model's own factors.
export function repairPathPlacement(assessment, repairs = []) {
  // A derailed answer (run 8) carried strings and one-key fragments where
  // paths belong. Fragments without any path content are discarded; a path
  // that is merely incomplete stays and fails the gate on its own merits.
  const fragment = (p) => !p || typeof p !== 'object' || Array.isArray(p) || !(p.mechanism || p.magnitude_factors || p.label);
  for (const [key, d] of Object.entries(assessment?.dimensions || {})) {
    if (!d || typeof d !== 'object') continue;
    for (const set of ['primary_paths', 'secondary_paths']) {
      const rows = Array.isArray(d[set]) ? d[set] : [];
      const kept = rows.filter((p) => !fragment(p));
      if (!Array.isArray(d[set]) || kept.length !== rows.length) { repairs.push(`${key}.${set}:${Array.isArray(d[set]) ? rows.length - kept.length : 1} fragment(s) discarded`); d[set] = kept; }
    }
    if (d.path_status !== 'modelled') continue;
    if (!['modelled', 'estimated'].includes(d.data_status)) { repairs.push(`${key}.data_status:${d.data_status}->modelled`); d.data_status = 'modelled'; }
    const primary = d.primary_paths;
    const main = primary.filter((p) => ['main_path', 'counter_path'].includes(p.type));
    if (!primary.length || main.length === primary.length) continue;
    if (main.length) {
      const side = primary.filter((p) => !main.includes(p));
      d.primary_paths = main;
      d.secondary_paths = [...side, ...(Array.isArray(d.secondary_paths) ? d.secondary_paths : [])];
      repairs.push(`${key}.primary_paths:${side.map((p) => p.type || 'untyped').join('+')}->secondary_paths`);
    } else {
      for (const p of primary) {
        if (p.same_target !== true || p.same_baseline !== true) continue;
        repairs.push(`${key}.primary_paths:${p.type}->main_path`);
        p.type = 'main_path';
      }
    }
  }
  return assessment;
}

// Deterministic post-processing of the model output. Nothing editorial is
// invented: magnitudes are recomputed from the model's own factors, and the
// plausible range is only snapped to include that recomputed point value.
export function normalizeAnalysisOutput(analysis, story = null) {
  const repairs = [];
  if (analysis && typeof analysis === 'object') {
    delete analysis.analysis_complete;
    delete analysis.transport_repairs;
    analysis.publication_recommendation = coerceBoolean(analysis.publication_recommendation);
    for (const claim of Array.isArray(analysis.event_claims) ? analysis.event_claims : []) {
      if (!claim || typeof claim !== 'object') continue;
      for (const key of ['attribution_required', 'headline_claim']) if (key in claim) claim[key] = coerceBoolean(claim[key]);
    }
  }
  repairSourceBindings(analysis, story?.sources || [], repairs);
  const finish = () => { if (repairs.length && analysis && typeof analysis === 'object') analysis.transport_repairs = repairs; return analysis; };
  const assessment = analysis?.impact_assessment;
  if (!assessment || assessment.version !== IMPACT_VERSION) return finish();
  coerceAssessmentTypes(assessment);
  repairPathPlacement(assessment, repairs);
  deriveAssessmentCalculations(assessment);
  for (const dimension of Object.values(assessment.dimensions || {})) {
    for (const path of [...(dimension.primary_paths || []), ...(dimension.secondary_paths || [])]) {
      const range = path.magnitude_range;
      if (!Number.isInteger(path.magnitude) || !range || typeof range !== 'object') continue;
      if (Number.isInteger(range.lower) && range.lower > path.magnitude) range.lower = path.magnitude;
      if (Number.isInteger(range.upper) && range.upper < path.magnitude) range.upper = path.magnitude;
    }
  }
  return finish();
}

const retryable = (status) => status === 429 || status >= 500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function callOpenAiDirect(stories, options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('OPENAI_API_KEY_MISSING'), { requestAttempts: 0, providerNotCalled: true, localRefusal: true });
  const model = options.model || newsModel();
  const prompt = options.prompt || buildAnalysisPrompt(stories, { transport: 'api' });
  const body = JSON.stringify(buildOpenAiRequest(prompt, { model,
    maxOutputTokens: Number(options.maxOutputTokens || process.env.WOEK_NEWS_MAX_OUTPUT_TOKENS || 24000),
    reasoningEffort: options.reasoningEffort || process.env.WOEK_NEWS_REASONING_EFFORT || 'low' }));
  // A transport failure without any completed model output is not a paid
  // attempt. Two transport tries at most; never a third provider call.
  const transportAttempts = Math.max(1, Math.min(2, Number(options.attempts || 2)));
  const fetchImpl = options.fetchImpl || fetch;
  let response, payload, attempts = 0;
  for (let attempt = 1; attempt <= transportAttempts; attempt += 1) {
    attempts = attempt;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(options.timeoutMs || process.env.WOEK_NEWS_AI_TIMEOUT_MS || 240000));
    try {
      response = await fetchImpl(OPENAI_RESPONSES_URL, { method: 'POST', signal: controller.signal, body,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` } });
      payload = await response.json().catch(() => null);
      if (response.ok) break;
      if (response.status === 401 || response.status === 403) throw Object.assign(new Error('AI_PROVIDER_AUTH_FAILED'), { requestAttempts: attempts, providerNotCalled: attempts === 1 });
      if (attempt < transportAttempts && retryable(response.status)) { await (options.retryDelayImpl || sleep)(attempt * 15000); continue; }
      throw Object.assign(new Error(`AI_PROVIDER_ERROR:${response.status}`), { requestAttempts: attempts });
    } catch (error) {
      if (error.requestAttempts !== undefined) throw error;
      if (attempt < transportAttempts && (error?.name === 'AbortError' || error instanceof TypeError)) { await (options.retryDelayImpl || sleep)(attempt * 15000); continue; }
      error.requestAttempts = attempts;
      throw error;
    } finally { clearTimeout(timer); }
  }
  const usage = decodeUsage(payload);
  const reportedModel = typeof payload?.model === 'string' && payload.model ? payload.model : model;
  const answer = finalOutputText(payload);
  // Private diagnosis copy of the paid answer (never committed; the workflow
  // keeps it as a short-lived run artifact). Gate failures become explainable.
  const rawDir = options.rawOutputDir || process.env.WOEK_NEWS_RAW_OUTPUT_DIR;
  if (rawDir) {
    try {
      const fs = await import('node:fs');
      fs.mkdirSync(rawDir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ids = stories.map(s => s.story_id).join('_').slice(0, 80) || 'call';
      fs.writeFileSync(rawDir + '/' + stamp + '-' + ids + '.json', JSON.stringify({ model: reportedModel, status: payload?.status || null, incomplete: payload?.incomplete_details || null, usage, answer, story_ids: stories.map(s => s.story_id) }, null, 2));
    } catch { /* diagnosis copy is best effort */ }
  }
  if (!answer) {
    const error = Object.assign(new Error('AI_PROVIDER_OUTPUT_INVALID'), { requestAttempts: attempts, promptChars: prompt.length });
    error.billingEvidence = { model: reportedModel, reported_usage: usage };
    if (payload?.status === 'incomplete') error.incompleteReason = sanitizeFeedText(payload.incomplete_details?.reason || 'unknown', 80);
    throw error;
  }
  const result = decodeWoekAiResponse({ ok: true, answer, provider: 'OpenAI Responses API', model: reportedModel,
    mode: TRANSPORT_VERSION, usage, sources: [] }, prompt, attempts);
  result.analyses = result.analyses.map((analysis) => normalizeAnalysisOutput(analysis,
    stories.find((story) => story?.story_id === analysis?.story_id) || (stories.length === 1 ? stories[0] : null)));
  result.rates = modelRates(reportedModel);
  return result;
}
