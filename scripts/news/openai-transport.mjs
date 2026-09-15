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
  'Nur gelieferte Quellen und deren source_id/evidence_id verwenden. Keine Zahlen, Quellen oder Zitate erfinden. Alle Lesertexte auf Deutsch, ohne URLs, IDs oder HTML.',
  'Antworte ausschließlich mit einem einzigen JSON-Objekt {"analyses":[...]} gemäß Schema, ohne Markdown und ohne Kommentar.',
].join('\n');

export function buildOpenAiRequest(prompt, { model, maxOutputTokens = 24000, reasoningEffort = 'medium' } = {}) {
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

// Deterministic post-processing of the model output. Nothing editorial is
// invented: magnitudes are recomputed from the model's own factors, and the
// plausible range is only snapped to include that recomputed point value.
export function normalizeAnalysisOutput(analysis) {
  const assessment = analysis?.impact_assessment;
  if (!assessment || assessment.version !== IMPACT_VERSION) return analysis;
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
    maxOutputTokens: Number(options.maxOutputTokens || process.env.WOEK_NEWS_MAX_OUTPUT_TOKENS || 24000),
    reasoningEffort: options.reasoningEffort || process.env.WOEK_NEWS_REASONING_EFFORT || 'medium' }));
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
