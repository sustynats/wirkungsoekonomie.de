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
  'Vollständigkeit ist Pflicht: Jeder Eintrag in analyses enthält ALLE Schlüssel des Schemas. Checkliste je Eintrag: story_id, publication_recommendation, headline, news_status, publication_depth, event_claims, followups, source_summary, summary, detail_summary, why_relevant, status, analysis_type, impact_assessment (mit dimensions.human/planet/democracy), importance, impact_potential, impact_risks, mechanisms, first_order, second_order, third_order, systemic_relevance, transformation_potential, resilience, side_effects, uncertainties, evidence_level, attribution, watch_next, reference_frameworks, publication_gate, visuals, media_impact. Ein fehlender Schlüssel macht die gesamte Antwort unbrauchbar.',
  'Zahlen (magnitude, magnitude_factors.*.value, magnitude_range.lower/upper) sind JSON-Zahlen, keine Strings. Wahrheitswerte (publication_recommendation, same_target, same_baseline, protection_boundary.decisive, attribution_required, headline_claim) sind JSON-Booleans.',
  'Jeder Pfad in primary_paths und secondary_paths trägt magnitude_factors mit allen sechs Faktoren reach, intensity, duration, irreversibility, vulnerability, system_depth, jeweils mit value 0..5, rationale (mindestens 12 Zeichen) und source_ids aus den gelieferten Quellen, sowie protection_boundary mit decisive und rationale.',
  'Antworte ausschließlich mit einem einzigen JSON-Objekt {"analyses":[...]} gemäß Schema, ohne Markdown und ohne Kommentar.',
].join('\n');

// Ausgabebudget: ein vollständiges Paket braucht typisch 8k–12k, selten über 20k
// Antwort-Token; Reasoning-Token zählen mit. 40k deckt das ab und begrenzt die Kosten.
export function buildOpenAiRequest(prompt, { model, maxOutputTokens = 40000, reasoningEffort = 'low' } = {}) {
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

// Deterministic post-processing of the model output. Nothing editorial is
// invented: magnitudes are recomputed from the model's own factors, and the
// plausible range is only snapped to include that recomputed point value.
export function normalizeAnalysisOutput(analysis) {
  if (analysis && typeof analysis === 'object') {
    analysis.publication_recommendation = coerceBoolean(analysis.publication_recommendation);
    for (const claim of Array.isArray(analysis.event_claims) ? analysis.event_claims : []) {
      if (!claim || typeof claim !== 'object') continue;
      for (const key of ['attribution_required', 'headline_claim']) if (key in claim) claim[key] = coerceBoolean(claim[key]);
    }
  }
  const assessment = analysis?.impact_assessment;
  if (!assessment || assessment.version !== IMPACT_VERSION) return analysis;
  coerceAssessmentTypes(assessment);
  deriveAssessmentCalculations(assessment);
  for (const dimension of Object.values(assessment.dimensions || {})) {
    for (const path of [...(dimension.primary_paths || []), ...(dimension.secondary_paths || [])]) {
      const range = path.magnitude_range;
      if (!Number.isInteger(path.magnitude) || !range || typeof range !== 'object') continue;
      if (Number.isInteger(range.lower) && range.lower > path.magnitude) range.lower = path.magnitude;
      if (Number.isInteger(range.upper) && range.upper < path.magnitude) range.upper = path.magnitude;
    }
  }
  return analysis;
}

const retryable = (status) => status === 429 || status >= 500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function callOpenAiDirect(stories, options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('OPENAI_API_KEY_MISSING'), { requestAttempts: 0, providerNotCalled: true, localRefusal: true });
  const model = options.model || newsModel();
  const prompt = options.prompt || buildAnalysisPrompt(stories, { transport: 'api' });
  const body = JSON.stringify(buildOpenAiRequest(prompt, { model,
    maxOutputTokens: Number(options.maxOutputTokens || process.env.WOEK_NEWS_MAX_OUTPUT_TOKENS || 40000),
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
  result.analyses = result.analyses.map(normalizeAnalysisOutput);
  result.rates = modelRates(reportedModel);
  return result;
}
