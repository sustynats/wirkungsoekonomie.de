// Direktbetrieb (seit 15.09.2026): genau ein bezahlter OpenAI-Aufruf je
// Nachricht, ohne Bridge, Dropbox, ChatGPT-Worker oder Zweitprüfung per API.
// Der Aufruf liefert das vollständige veröffentlichungsreife Paket; alles
// danach ist deterministisch (Gate, Ableitung der Tragweite, Build).
import { buildAnalysisPrompt, decodeWoekAiResponse, sanitizeFeedText } from './lib.mjs';
import { deriveAssessmentCalculations, IMPACT_VERSION } from './impact-assessment.mjs';
import { semanticIssues } from './impact-publication.mjs';
import { modelledPublicationIssues } from './impact-scope.mjs';
import { secondPassComplete } from './impact-gate.mjs';
import { impactAssessmentResponseFormat } from './impact-json-schema.mjs';
import { analysisResponseFormat, schemaEligible, ANALYSIS_JSON_SCHEMA } from './analysis-json-schema.mjs';
import { FACTOR_KEYS } from './impact-magnitude.mjs';
import { modelRates } from './budget.mjs';
import { evidenceGroups } from './newsroom.mjs';
import { sourceNumberTokens } from './numeric-evidence.mjs';

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
  'publication_depth ist vorgegeben, nicht zu wählen: already_published false bedeutet initial, true bedeutet deepened. Der Server setzt den Wert ohnehin nach dem Stand der Akte; entscheidend ist, dass die Textlängen zu dieser Tiefe passen.',
  'Textlängen sind harte Grenzen, zähle vor der Antwort: source_summary bei publication_depth initial 60 bis 180 Wörter, bei deepened 100 bis 180 Wörter, immer zwei bis drei Absätze (Leerzeile). detail_summary bei initial mindestens 300 Zeichen und 3 bis 7 Sätze, bei deepened 500 bis 1200 Zeichen und 5 bis 7 Sätze. Zu kurz ist genauso ungültig wie zu lang; im Zweifel einen belegten Satz mehr schreiben. Lesertexte enthalten nur Zahlen, Daten und Jahreszahlen, die wörtlich in den gelieferten Quellentexten stehen; das Datum der Berichterstattung wird nicht ergänzt.',
  'source_summary in eigenen Worten: keine Passage von mehr als 20 Wörtern wörtlich aus einer Quelle übernehmen.',
  'analysis_type ex_ante: Wirkungen als Möglichkeit formulieren (kann, könnte, würde); keine Tatsachenformen wie „führt zu“, „bewirkt“, „hat … erhöht/reduziert/verbessert“ für noch nicht eingetretene Folgen. Jede Dimension trägt temporal_status ex_ante oder ongoing.',
  'Jede Dimension trägt zusätzlich rationale (Begründungstext) und balance (bei direction mixed ein Objekt mit comparable_material_paths, protection_boundary_decisive und rationale; sonst null). Diese beiden Schlüssel fehlten in der Hälfte der Antworten.',
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
// Natalie am 16.09.2026: „Wir müssen die Nachricht schon so weit vorbereitet
// haben, die wir hingeben, dass auch was Vernünftiges zurückkommt, ohne
// Nachbesserung, dass wir quasi nur einen Lauf brauchen." Eine bedingte Regel
// („bei initial 60 bis 180, bei deepened 100 bis 180") ist dafür zu weich: das
// Modell wählte die Tiefe selbst und verfehlte dann die Länge. Der Server kennt
// den Aktenstand, also nennt er genau eine Zielspanne, komfortabel innerhalb
// der Prüfgrenzen, und sagt, wie Zahlen belegt sein müssen.
export function storyBriefing(story) {
  // Dieselbe Ableitung, die die Antwort später korrigiert: Vorgabe und Prüfung
  // dürfen nicht auseinanderlaufen.
  const depth = requiredPublicationDepth(story);
  if (!depth) return '';
  const deepened = depth === 'deepened';
  const origins = independentOrigins(story);
  const numbers = sourceNumberBriefing(story);
  return ['VORGABEN FÜR DIESE MELDUNG (nicht zu wählen, sie folgen dem Aktenstand):',
    `publication_depth: ${depth}.`,
    deepened
      ? 'source_summary: 120 bis 170 Wörter in genau drei Absätzen (Leerzeile zwischen den Absätzen).'
      : 'source_summary: 90 bis 160 Wörter in genau drei Absätzen (Leerzeile zwischen den Absätzen).',
    deepened
      ? 'detail_summary: 5 bis 7 Sätze, 600 bis 1100 Zeichen.'
      : 'detail_summary: 4 bis 6 Sätze, 350 bis 900 Zeichen.',
    'summary: genau zwei Sätze.',
    'Zahlen in event_claims: Jede Zahl einer Aussage muss wörtlich in dem Beleg-Ausschnitt stehen, den du für genau diese Aussage zitierst. Steht sie dort nicht, formuliere die Aussage ohne Zahl.',
    ...(numbers.length ? [`Belegbare Zahlen je Quelle (Schreibweise wie in der Quelle, Dezimalkomma erlaubt): ${numbers.join(' | ')}.`] : []),
    origins >= 2
      ? `Der Quellenbestand hat ${origins} voneinander unabhängige Herkünfte. status confirmed_claim nur, wenn du für diese Aussage zwei davon zitierst; sonst single_source_claim, primary_source_claim oder uncertain_claim.`
      : `Der Quellenbestand hat nur ${origins === 1 ? 'eine' : 'keine'} unabhängige Herkunft. status confirmed_claim ist damit ausgeschlossen: nutze single_source_claim, primary_source_claim (nur bei zitierter Primärquelle) oder uncertain_claim.`,
    'Zähle Wörter, Sätze und Absätze, bevor du antwortest: eine Antwort außerhalb dieser Spannen ist unbrauchbar und die Meldung erscheint nicht.'].join('\n');
}

export function buildOpenAiRequest(prompt, { model, maxOutputTokens = 24000, reasoningEffort = 'low', instructions = SINGLE_CALL_INSTRUCTIONS, responseFormat = { type: 'json_object' } } = {}) {
  return {
    model, store: false,
    reasoning: { effort: reasoningEffort },
    max_output_tokens: maxOutputTokens,
    instructions,
    input: prompt,
    text: { format: responseFormat },
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
    // A side path without its six factors cannot be scored and would fail the
    // whole dimension (run 22:35: one half-written Nebenpfad blocked Mensch).
    // Dropping it loses only optional side information; primary paths stay.
    const scored = (p) => FACTOR_KEYS.every((k) => Number.isInteger(coerceScore(p?.magnitude_factors?.[k]?.value)));
    const unscored = (Array.isArray(d.secondary_paths) ? d.secondary_paths : []).filter((p) => !scored(p));
    if (unscored.length) { repairs.push(`${key}.secondary_paths:${unscored.length} unscored path(s) discarded`); d.secondary_paths = d.secondary_paths.filter((p) => scored(p)); }
    // A protection boundary is a floor for negative paths only; "decisive" on
    // a positive or open path is a label error, not a floor.
    for (const p of [...(Array.isArray(d.primary_paths) ? d.primary_paths : []), ...(Array.isArray(d.secondary_paths) ? d.secondary_paths : [])]) {
      const pb = p?.protection_boundary;
      if (pb && typeof pb === 'object' && coerceBoolean(pb.decisive) === true && p.direction !== 'negative') { repairs.push(`${key}.protection_boundary:decisive on ${p.direction} path cleared`); pb.decisive = false; pb.status = 'not_decisive'; }
    }
    // A primary counter or side path without factors blocks the dimension; if a
    // scored main path remains, the fragment gives way (00:07 UTC, Planet).
    const primaryRows = Array.isArray(d.primary_paths) ? d.primary_paths : [];
    if (primaryRows.some((p) => !scored(p)) && primaryRows.some((p) => scored(p) && p.type === 'main_path')) {
      repairs.push(`${key}.primary_paths:${primaryRows.filter((p) => !scored(p)).length} unscored path(s) discarded`);
      d.primary_paths = primaryRows.filter((p) => scored(p));
    }
    if (d.path_status !== 'modelled') continue;
    if (!['modelled', 'estimated'].includes(d.data_status)) { repairs.push(`${key}.data_status:${d.data_status}->modelled`); d.data_status = 'modelled'; }
    // The dimension's time status is fully determined by its paths: ongoing
    // only with an observed signal on a primary path, otherwise ex_ante.
    if (!['ex_ante', 'ongoing'].includes(d.temporal_status)) {
      const ongoing = d.primary_paths.some((p) => p?.temporal_status === 'ongoing' && typeof p.observed_signal?.change === 'string' && p.observed_signal.change.trim());
      repairs.push(`${key}.temporal_status:${d.temporal_status}->${ongoing ? 'ongoing' : 'ex_ante'}`);
      d.temporal_status = ongoing ? 'ongoing' : 'ex_ante';
    }
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

// A headline that carries an attributed claim must name the attribution
// (editorial-evidence rule). The model regularly sets attribution_required on
// a headline claim, names attributed_to, and still leaves the qualifier out of
// the title. The qualifier is derived from the model's own attribution and
// prefixed once ("Laut Polizei: …"); nothing beyond the model's words is added.
const foldTitle = (value) => String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('de');
export function repairHeadlineAttribution(analysis, repairs = []) {
  if (!analysis || typeof analysis !== 'object' || typeof analysis.headline !== 'string') return analysis;
  for (const claim of Array.isArray(analysis.event_claims) ? analysis.event_claims : []) {
    if (!claim || claim.attribution_required !== true || claim.headline_claim === false) continue;
    let qualifier = typeof claim.headline_qualifier === 'string' ? claim.headline_qualifier.trim() : '';
    if (qualifier.length < 5 && typeof claim.attributed_to === 'string' && claim.attributed_to.trim().length >= 3) qualifier = `laut ${claim.attributed_to.trim().replace(/[.]+$/, '')}`;
    if (qualifier.length < 5) continue;
    if (!foldTitle(analysis.headline).includes(foldTitle(qualifier))) {
      const prefixed = `${qualifier[0].toLocaleUpperCase('de')}${qualifier.slice(1)}: ${analysis.headline.replace(/^Laut [^:]{3,80}:\s*/i, '')}`;
      if (prefixed.length > 260) continue;
      repairs.push(`headline:attribution prefixed (${qualifier})`);
      analysis.headline = prefixed;
    }
    if (claim.headline_qualifier !== qualifier) { repairs.push(`event_claims:headline_qualifier set (${qualifier})`); claim.headline_qualifier = qualifier; }
    break;
  }
  return analysis;
}

// Deterministic post-processing of the model output. Nothing editorial is
// invented: magnitudes are recomputed from the model's own factors, and the
// plausible range is only snapped to include that recomputed point value.
// publication_depth ist keine Ermessensfrage des Modells: Ob eine Meldung zum
// ersten Mal erscheint oder eine bestehende Akte vertieft, weiß der Server. Von
// dieser Angabe hängen die Textlängen ab (initial 60 bis 180 Wörter, vertieft
// 100 bis 180), also entscheidet sie über Annahme oder Halt. 16.09.: drei
// Meldungen wurden gehalten, weil das Modell „deepened" wählte und dann
// initial-lange Texte schrieb. Eine Neubewertung behält ihre bisherige Tiefe.
// „Bestätigt" ist eine Tatsache über den Quellenbestand, keine Einschätzung:
// die Prüfung verlangt zwei voneinander unabhängige Herkünfte in den zitierten
// Belegen. Wählt das Modell den Status trotzdem, ist die Meldung verloren
// (16.09., Lauf 10:35: CLAIM_INDEPENDENCE_NOT_ESTABLISHED). Der Server kennt die
// Abhängigkeiten, also stuft er den Status herab, statt zu verwerfen. Herabstufen
// behauptet weniger, nie mehr.
export function repairClaimIndependence(analysis, story, repairs = []) {
  const claims = Array.isArray(analysis?.event_claims) ? analysis.event_claims : [];
  const sources = Array.isArray(story?.sources) ? story.sources : [];
  if (!claims.length || !sources.length) return analysis;
  for (const claim of claims) {
    if (!claim || typeof claim !== 'object' || claim.status !== 'confirmed_claim') continue;
    const cited = (Array.isArray(claim.evidence) ? claim.evidence : [])
      .map((proof) => sources.find((source) => source.source_id === proof?.source_id && source.url === proof?.url))
      .filter(Boolean);
    if (evidenceGroups(cited).possible_independent_origins >= 2) continue;
    const next = cited.some((source) => source.primary_source) ? 'primary_source_claim'
      : cited.length <= 1 ? 'single_source_claim' : 'uncertain_claim';
    repairs.push(`event_claims:confirmed_claim->${next} (${evidenceGroups(cited).possible_independent_origins} unabhängige Herkunft)`);
    claim.status = next;
  }
  return analysis;
}

// Welche Zahlen in welcher Quelle tatsächlich stehen. Die Prüfung vergleicht je
// Aussage gegen die zitierte Quelle, also bekommt das Modell dieselbe Liste
// vorab statt einer Ermahnung (16.09.: CLAIM_NUMBER_NOT_IN_EVIDENCE in jedem
// zweiten Lauf). Derselbe Auszug wie in der Prüfung, damit nichts auseinanderläuft.
export const BRIEFING_NUMBERS_PER_SOURCE = 25;
export function sourceNumberBriefing(story, limit = BRIEFING_NUMBERS_PER_SOURCE) {
  // Eine Zeile je Kennung: dieselbe Quelle steht oft mehrfach im Bestand (zwei
  // Meldungen desselben Feeds), und die Prüfung vergleicht gegen die Kennung.
  const byId = new Map();
  for (const source of Array.isArray(story?.sources) ? story.sources : []) {
    if (!source?.source_id) continue;
    const numbers = byId.get(source.source_id) || new Set();
    for (const token of sourceNumberTokens(source)) numbers.add(token);
    byId.set(source.source_id, numbers);
  }
  return [...byId.entries()].map(([id, numbers]) => {
    const list = [...numbers].slice(0, limit);
    return `${id}: ${list.length ? list.join(', ') : 'keine Zahlen'}`;
  });
}

// Wie viele voneinander unabhängige Herkünfte der gelieferte Quellenbestand
// überhaupt hergibt. Mehr als das kann keine Aussage belegen.
export function independentOrigins(story) {
  const sources = Array.isArray(story?.sources) ? story.sources : [];
  return sources.length ? evidenceGroups(sources).possible_independent_origins : 0;
}

export function requiredPublicationDepth(story) {
  if (!story || typeof story !== 'object' || story.impact_reassessment) return null;
  const published = story.existing_story?.published;
  return typeof published === 'boolean' ? (published ? 'deepened' : 'initial') : null;
}

export function repairPublicationDepth(analysis, story, repairs = []) {
  if (!analysis || typeof analysis !== 'object') return analysis;
  const required = requiredPublicationDepth(story);
  if (!required || analysis.publication_depth === required) return analysis;
  repairs.push(`publication_depth:${analysis.publication_depth ?? 'fehlt'}->${required}`);
  analysis.publication_depth = required;
  return analysis;
}

export function normalizeAnalysisOutput(analysis, story = null) {
  const repairs = Array.isArray(analysis?.transport_repairs) ? [...analysis.transport_repairs] : [];
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
  repairHeadlineAttribution(analysis, repairs);
  repairPublicationDepth(analysis, story, repairs);
  repairClaimIndependence(analysis, story, repairs);
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

// Everything the deterministic gate would hold against the assessment object
// alone: format errors, semantic checks and the three modelled dimensions.
export function assessmentIssues(analysis, story) {
  const assessment = analysis?.impact_assessment;
  const record = { sources: story?.sources || [], impact_assessment: assessment };
  const issues = [...semanticIssues(assessment, record, { secondPassComplete: secondPassComplete(assessment) }), ...(assessment ? modelledPublicationIssues(assessment) : [])];
  return [...new Set(issues.filter((code) => /^IMPACT_/.test(code)))];
}

// The model completes the reader texts and then leaves the assessment out or
// half-written in roughly half of all answers (measured 15./16.09. at low and
// medium effort). A second full attempt in the next run repeats that. One
// focused follow-up in the same run, carrying the exact gate findings, only
// re-delivers impact_assessment; texts and sources stay as answered.
// 24k: the first three follow-ups (00:07 UTC) generated about 9k answer tokens
// each plus medium reasoning and still ran into the 16k cap (no final message,
// paid for nothing).
export const REPAIR_MAX_OUTPUT_TOKENS = 24000;

// Welche Felder ein Befund betrifft. Nur diese werden nachgefordert, alles
// andere bleibt wie geantwortet. Das Schema erzwingt auch hier Vollständigkeit;
// Längen kann es nicht erzwingen, deshalb nennt die Nachfrage sie im Klartext.
export const FIELD_FINDINGS = [
  [/^AI_SOURCE_SUMMARY_|^AI_EXCESSIVE_SOURCE_SUMMARY_COPY$/, 'source_summary'],
  [/^AI_DETAIL_SUMMARY_/, 'detail_summary'],
  [/^AI_SUMMARY_SENTENCE_COUNT$/, 'summary'],
  [/^CLAIM_|^EDITORIAL_HEADLINE_ATTRIBUTION_REQUIRED$/, 'event_claims'],
  [/^EDITORIAL_HEADLINE_ATTRIBUTION_REQUIRED$|^EDITORIAL_HEADLINE_INVALID$/, 'headline'],
  [/^FOLLOWUP_/, 'followups'],
  [/^AI_REQUIRED_STRING:why_relevant$|^AI_EX_ANTE_CAUSAL_OVERCLAIM$/, 'impact_potential'],
  [/^MEDIA_/, 'media_impact'],
  [/^AI_IMPORTANCE_INVALID$/, 'importance'],
  [/^AI_PUBLICATION_GATE_REQUIRED$/, 'publication_gate'],
  [/^AI_UNCERTAINTY_REQUIRED$/, 'uncertainties'],
  [/^AI_WATCH_NEXT_REQUIRED$/, 'watch_next'],
];
// Viele Befunde nennen ihr Feld selbst (AI_ARRAY_REQUIRED:uncertainties,
// AI_REQUIRED_STRING:resilience). Trägt der Befund ein Feld der Analyse im
// Namen, ist die Nachlieferung damit bestimmt und braucht keine Tabelle. Das
// Bewertungsobjekt bleibt ausgenommen, es hat seinen eigenen Weg.
const FIELD_SUFFIX_CODES = /^AI_(?:ARRAY_REQUIRED|EMPTY_ARRAY|REQUIRED_STRING|INVALID_STRING|STRING_TOO_LONG|LIST_TOO_LONG)$/;
const NOT_SEPARATELY_REPAIRABLE = new Set(['story_id', 'impact_assessment', 'visuals']);
export function fieldFromFinding(issue) {
  const [code, field] = String(issue).split(':');
  if (!FIELD_SUFFIX_CODES.test(code) || !field || NOT_SEPARATELY_REPAIRABLE.has(field)) return null;
  const property = ANALYSIS_JSON_SCHEMA.properties[field];
  return property && property.type !== 'null' ? field : null;
}
export function repairFields(issues = []) {
  const fields = new Set();
  for (const issue of issues) {
    for (const [pattern, field] of FIELD_FINDINGS) if (pattern.test(issue)) fields.add(field);
    const derived = fieldFromFinding(issue);
    if (derived) fields.add(derived);
  }
  return [...fields];
}
export function fieldRepairFormat(fields, name = 'wirkungsticker_nachlieferung_1') {
  const properties = { story_id: { type: 'string' } };
  for (const field of fields) {
    const property = ANALYSIS_JSON_SCHEMA.properties[field];
    // media_impact ist im Analyse-Schema bewusst offen (type null): dafür gibt
    // es kein erzwingbares Schema, also bleibt die Nachlieferung dort frei.
    if (!property || property.type === 'null') return null;
    properties[field] = property;
  }
  return { type: 'json_schema', name, strict: true,
    schema: { type: 'object', additionalProperties: false, required: Object.keys(properties), properties } };
}
export function repairAddendum(storyId, issues, previous, fields = [], depth = null) {
  if (fields.length) {
    // Dieselbe konkrete Spanne wie im ersten Aufruf. Die bedingte Formulierung
    // („bei initial so, bei deepened so") war hier derselbe Fehler: die
    // Nachlieferung traf die Länge dreimal nicht (Lauf 10:20 UTC).
    const deepened = depth === 'deepened';
    const hints = {
      source_summary: depth
        ? `source_summary: ${deepened ? '120 bis 170' : '90 bis 160'} Wörter in genau drei Absätzen, eigene Worte, nur Zahlen die wörtlich in den gelieferten Quellentexten stehen. Zähle die Wörter.`
        : 'source_summary: 60 bis 180 Wörter bei publication_depth initial, 100 bis 180 bei deepened, zwei bis drei Absätze, eigene Worte, nur Zahlen die wörtlich in den gelieferten Quellentexten stehen.',
      detail_summary: depth
        ? `detail_summary: ${deepened ? '5 bis 7 Sätze, 600 bis 1100 Zeichen' : '4 bis 6 Sätze, 350 bis 900 Zeichen'}. Zähle die Sätze und Zeichen.`
        : 'detail_summary: bei initial mindestens 300 Zeichen und 3 bis 7 Sätze, bei deepened 500 bis 1200 Zeichen und 5 bis 7 Sätze.',
      summary: 'summary: genau zwei Sätze.',
      event_claims: 'event_claims: jede Zahl im Claim muss in einem zitierten evidence-Segment derselben Quelle stehen; attribution_required mit headline_claim nur, wenn headline_qualifier wörtlich im Titel steht.',
      headline: 'headline: 10 bis 260 Zeichen; trägt ein Claim attribution_required und headline_claim, dann steht headline_qualifier wörtlich darin.',
      followups: 'followups: claim, source_id aus den gelieferten Quellen und measurable_indicator sind Pflicht.',
      impact_potential: 'impact_potential: Wirkungen als Möglichkeit formulieren, keine Tatsachenform für noch nicht eingetretene Folgen.',
      media_impact: 'media_impact: vollständig nach der Medienwirkungs-Methode, public_explanation 80 bis 200 Wörter, reason, factual_core und editorial_assessment als Text, keine Absichtszuschreibung und keine Bewertung von Medienhäusern.',
    };
    return [`NACHLIEFERUNG für story_id ${storyId}: Deine Antwort ist angekommen, aber einzelne Felder bestehen die Prüfung nicht.`,
      `Prüfbefunde: ${issues.join(', ')}.`,
      `Liefere ausschließlich diese Felder neu: ${fields.join(', ')}. Alles andere bleibt unverändert und wird nicht erneut gesendet.`,
      ...fields.map((field) => hints[field]).filter(Boolean),
      'Inhalt und Aussagen bleiben gleich; korrigiere nur den beanstandeten Punkt. Keine erfundenen Zahlen, Quellen oder Zitate.'].join('\n');
  }
  return [`NACHLIEFERUNG für story_id ${storyId}: Deine Antwort ist angekommen, aber impact_assessment fehlt oder besteht die deterministische Prüfung nicht.`,
    `Prüfbefunde: ${issues.join(', ')}.`,
    previous ? `Bisheriger, unvollständiger Entwurf von impact_assessment (nur als Ausgangspunkt, Befunde beheben): ${JSON.stringify(previous).slice(0, 60000)}` : 'Es lag noch kein impact_assessment vor.',
    'Antworte ausschließlich mit {"analyses":[{"story_id":"…","impact_assessment":{…}}]}: impact_assessment vollständig nach Schema (Version 2.1, alle drei Dimensionen modelled mit primary_paths, sechs Faktoren je Pfad, research_check, system_check, observed_effects), source_ids exakt aus den gelieferten sources. Keine anderen Felder.'].join('\n');
}
const sumUsage = (a, b) => !a ? b : !b ? a : { input_tokens: a.input_tokens + b.input_tokens, output_tokens: a.output_tokens + b.output_tokens,
  ...((a.cached_input_tokens ?? b.cached_input_tokens) !== undefined ? { cached_input_tokens: (a.cached_input_tokens || 0) + (b.cached_input_tokens || 0) } : {}) };

async function requestAssessmentRepair({ prompt, story, analysis, issues, model, apiKey, fetchImpl, timeoutMs, reasoningEffort, rawDir, schema = true, fields = [] }) {
  const addendum = repairAddendum(story.story_id, issues, analysis.impact_assessment || null, fields, requiredPublicationDepth(story));
  // A schema-bound answer cannot omit a key. The provider may reject the
  // schema (unknown model, unsupported keyword); then exactly one further try
  // in plain JSON mode follows, which is the previous behaviour.
  const wanted = fields.length ? fieldRepairFormat(fields) : impactAssessmentResponseFormat();
  const formats = schema && wanted ? [wanted, { type: 'json_object' }] : [{ type: 'json_object' }];
  let payload = null, status = 0, usedSchema = false;
  for (const [index, format] of formats.entries()) {
    const body = JSON.stringify(buildOpenAiRequest(`${prompt}\n\n${addendum}`, { model, maxOutputTokens: REPAIR_MAX_OUTPUT_TOKENS, reasoningEffort, responseFormat: format }));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(OPENAI_RESPONSES_URL, { method: 'POST', signal: controller.signal, body, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` } });
      status = response.status; payload = await response.json().catch(() => null);
      usedSchema = format.type === 'json_schema';
      if (response.ok) break;
      if (status !== 400 || index === formats.length - 1) return { usage: decodeUsage(payload), assessment: null, answerChars: 0, status, schema: usedSchema };
    } catch { return { usage: null, assessment: null, answerChars: 0, status: 0, schema: usedSchema }; }
    finally { clearTimeout(timer); }
  }
  const usage = decodeUsage(payload), answer = finalOutputText(payload);
  // Diagnosis copy also without a final message: an incomplete follow-up must be explainable.
  if (rawDir) { try { fs.mkdirSync(rawDir, { recursive: true }); fs.writeFileSync(`${rawDir}/${new Date().toISOString().replace(/[:.]/g, '-')}-${story.story_id}-nachlieferung.json`, JSON.stringify({ model: payload?.model || model, status: payload?.status || null, incomplete: payload?.incomplete_details || null, usage, issues, schema: usedSchema, answer: answer || null, output_types: (payload?.output || []).map((item) => item?.type), story_ids: [story.story_id] }, null, 2)); } catch { /* best effort */ } }
  let parsed = null;
  try { parsed = answer ? JSON.parse(answer) : null; } catch { parsed = null; }
  const body = parsed?.analyses?.find?.((a) => a?.story_id === story.story_id) || parsed?.analyses?.[0] || parsed;
  if (fields.length) {
    const delivered = {};
    for (const field of fields) if (body && body[field] !== undefined) delivered[field] = body[field];
    return { usage, fields: delivered, assessment: null, answerChars: (answer || '').length, status, schema: usedSchema };
  }
  const assessment = body?.impact_assessment || (parsed?.dimensions && parsed?.version ? parsed : null);
  return { usage, assessment: assessment && typeof assessment === 'object' ? assessment : null, answerChars: (answer || '').length, status, schema: usedSchema };
}

const retryable = (status) => status === 429 || status >= 500;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function callOpenAiDirect(stories, options = {}) {
  const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('OPENAI_API_KEY_MISSING'), { requestAttempts: 0, providerNotCalled: true, localRefusal: true });
  const model = options.model || newsModel();
  // Erzwungenes Antwortschema, wo es möglich ist: dann kann kein Pflichtfeld
  // fehlen. Bei lokal erkanntem Medienanlass bleibt der Aufruf frei, weil
  // media_impact dort ein offenes Objekt ist. Lehnt der Anbieter das Schema ab,
  // folgt genau ein Versuch im einfachen JSON-Modus, also das alte Verhalten.
  const wantSchema = options.schema !== false && process.env.WOEK_NEWS_ANALYSIS_SCHEMA !== 'false' && !options.prompt && schemaEligible(stories);
  const prompt = options.prompt || buildAnalysisPrompt(stories, { transport: 'api', ...(wantSchema ? { includeVisuals: false } : {}) });
  // Ein Aufruf je Meldung ist der Regelfall; dann kann die Anweisung die
  // Vorgaben dieser einen Meldung nennen, ohne den Meldungsteil zu vergrößern.
  const briefing = stories.length === 1 ? storyBriefing(stories[0]) : '';
  const instructions = briefing ? `${SINGLE_CALL_INSTRUCTIONS}\n\n${briefing}` : SINGLE_CALL_INSTRUCTIONS;
  const formats = wantSchema ? [analysisResponseFormat(), { type: 'json_object' }] : [{ type: 'json_object' }];
  const bodyFor = (format) => JSON.stringify(buildOpenAiRequest(prompt, { model, responseFormat: format, instructions,
    maxOutputTokens: Number(options.maxOutputTokens || process.env.WOEK_NEWS_MAX_OUTPUT_TOKENS || 24000),
    reasoningEffort: options.reasoningEffort || process.env.WOEK_NEWS_REASONING_EFFORT || 'low' }));
  let formatIndex = 0;
  let body = bodyFor(formats[formatIndex]);
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
      // Ein abgelehntes Schema erzeugt keine Antwort und ist kein bezahlter
      // Versuch: derselbe Versuch läuft ohne Schemazwang weiter.
      if (response.status === 400 && formatIndex < formats.length - 1) { formatIndex += 1; body = bodyFor(formats[formatIndex]); attempt -= 1; continue; }
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
  // Mit Schema ist die Analyse selbst die Wurzel; der Decoder erwartet analyses.
  let decodable = answer;
  if (formats[formatIndex].type === 'json_schema') {
    try {
      const parsed = JSON.parse(answer);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && !Array.isArray(parsed.analyses)) decodable = JSON.stringify({ analyses: [parsed] });
    } catch { /* der Decoder meldet die unbrauchbare Antwort */ }
  }
  const result = decodeWoekAiResponse({ ok: true, answer: decodable, provider: 'OpenAI Responses API', model: reportedModel,
    mode: TRANSPORT_VERSION, usage, sources: [] }, prompt, attempts);
  result.analysis_schema = formats[formatIndex].type === 'json_schema';
  const storyFor = (analysis) => stories.find((story) => story?.story_id === analysis?.story_id) || (stories.length === 1 ? stories[0] : null);
  result.analyses = result.analyses.map((analysis) => normalizeAnalysisOutput(analysis, storyFor(analysis)));
  result.repair_calls = 0;
  if (options.repair !== false && process.env.WOEK_NEWS_ASSESSMENT_REPAIR !== 'false') {
    for (const analysis of result.analyses) {
      const story = storyFor(analysis);
      // A rejection carries no assessment by design; only a recommended story is completed.
      if (!story || result.repair_calls >= 1 || analysis?.publication_recommendation === false || analysis?.rejection) continue;
      // Das Bewertungsobjekt hat Vorrang; nur wenn es vollständig ist, gehen die
      // Textbefunde in die eine Nachlieferung. Ein Aufruf je Meldung bleibt die
      // Grenze, deshalb wird nicht beides in einem Schema verschachtelt.
      const issues = assessmentIssues(analysis, story);
      const textIssues = typeof options.findIssues === 'function' ? options.findIssues(analysis, story) : [];
      const fields = issues.length ? [] : repairFields(textIssues);
      if (!issues.length && !fields.length) continue;
      result.repair_calls += 1;
      const repaired = await requestAssessmentRepair({ prompt, story, analysis, issues: issues.length ? issues : textIssues, fields, model, apiKey, fetchImpl, rawDir,
        schema: options.repairSchema !== false && process.env.WOEK_NEWS_REPAIR_SCHEMA !== 'false',
        timeoutMs: Number(options.timeoutMs || process.env.WOEK_NEWS_AI_TIMEOUT_MS || 240000), reasoningEffort: options.reasoningEffort || process.env.WOEK_NEWS_REASONING_EFFORT || 'low' });
      if (repaired.usage) result.reported_usage = sumUsage(result.reported_usage, repaired.usage);
      result.answer_chars = Number(result.answer_chars || 0) + repaired.answerChars;
      if (repaired.assessment) {
        analysis.impact_assessment = repaired.assessment;
        normalizeAnalysisOutput(analysis, story);
        const remaining = assessmentIssues(analysis, story);
        (analysis.transport_repairs ||= []).push(`impact_assessment:nachgeliefert${repaired.schema ? ' mit Schema' : ''} (${issues.length} Befunde, danach ${remaining.length})`);
      } else if (repaired.fields && Object.keys(repaired.fields).length) {
        for (const [field, value] of Object.entries(repaired.fields)) analysis[field] = value;
        normalizeAnalysisOutput(analysis, story);
        (analysis.transport_repairs ||= []).push(`${Object.keys(repaired.fields).join('+')}:nachgeliefert${repaired.schema ? ' mit Schema' : ''} (${textIssues.length} Befunde)`);
      } else (analysis.transport_repairs ||= []).push(`${issues.length ? 'impact_assessment' : fields.join('+')}:nachlieferung ohne Ergebnis (HTTP ${repaired.status})`);
    }
  }
  result.rates = modelRates(reportedModel);
  return result;
}
