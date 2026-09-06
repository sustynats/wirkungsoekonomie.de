import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAnalysisPrompt } from "../../scripts/news/lib.mjs";
import { backfillMediaImpact } from "../../scripts/news/backfill-media-impact.mjs";
import { MEDIA_ANALYSIS_VERSION, MEDIA_PROMPT_RULES, applySelfFrameRewrites, detectMediaImpactTrigger, effectiveMediaImpactTrigger, mediaImpactValidationErrors, mediaTriggerForAnalysis, mediaTriggerRecord, sanitizeMediaImpact } from "../../scripts/news/media-impact.mjs";
import { sanitizeAnalysisMediaImpact } from "../../scripts/news/run.mjs";
import { storyPage } from "../../scripts/news/build.mjs";

const source = (title, summary = title, extra = {}) => ({ source_id: "medium-a", publisher: "Testmedium", title, summary, url: "https://example.org/a", published_at: "2026-09-05T06:00:00Z", ...extra });
const story = (title, summary = title, sources = [source(title, summary)]) => ({ story_id: "wt-media-test", title, source_summary: `${summary}\n\nWeitere Einzelheiten bleiben offen.`, sources, claims: [{ claim_id: "c1", source_id: sources[0].source_id, claim: summary }], analysis: { summary, detail_summary: summary } });

function validMedia(overrides = {}) {
  return {
    relevant: true, relevance_level: "high", reason: "Eine politisch aufgeladene Bezeichnung steht prominent in der Vermittlung.",
    factual_core: "Nach Sabotageversuchen an Umspannwerken laufen Ermittlungen zu Tätern und Motiv weiter.",
    epistemic_status: { confirmed: ["Sabotageversuche und laufende Ermittlungen sind belegt."], actor_claims: ["Der Minister verwendet eine politische Bezeichnung für die mutmaßliche Motivation."], open: ["Täter, Motiv und Zusammenhänge sind nicht abschließend geklärt."] },
    attribution: { frame_source: "Bundesinnenminister", speaker: "Bundesinnenminister", original_term: "Klimaextremismus", usage_type: "direct_quote", placement: ["headline", "body"], attribution_quality: "clear_but_prominent" },
    speaker_statement: { present: true, speaker: "Bundesinnenminister", statement: "Der Minister verwendet eine politische Bezeichnung für die mutmaßliche Motivation.", status: "interpretation" },
    framing: { detected: true, term: "Klimaextremismus", origin_in_story: "Bundesinnenminister", media_usage: "headline", attribution_quality: "eindeutig attribuiert", factual_status: "Aussage eines Akteurs", frame_type: ["Bedrohung", "Polarisierung"], political_history_relevant: false, political_history: "", political_history_evidence: [] },
    frame_analysis: { frame_detected: true, frame_term: "Klimaextremismus", frame_type: ["Bedrohung", "Polarisierung"], problem_definition: "Die mutmaßliche Tatmotivation wird als ideologisch begründete Sicherheitsbedrohung eingeordnet.", implied_cause: "Eine politische Motivation wird als mögliche Ursache benannt.", implied_responsibility: "Die Verantwortung bleibt einer noch nicht abschließend ermittelten Person zugeschrieben.", implied_threat: "Der Begriff verknüpft die Vorfälle mit einer weiter gefassten Bedrohung.", implied_solution_space: "Sicherheits- und Strafverfolgungsmaßnahmen können dadurch näherliegend erscheinen.", material_omissions: ["Der abschließende Ermittlungsstand fehlt."] },
    political_context: { relevant: false, classification: "", evidence_based: false, evidence: [], uncertainty: "Eine politische Verwendungsgeschichte ist mit den gelieferten Quellen nicht belegt." },
    resonance: { resonance_space: "Die Verbindung kann unter bestimmten Bedingungen einen politischen Resonanzraum öffnen.", resonance_risk: "Die Wiederholung kann ein Zuordnungsrisiko verstärken.", normalization_potential: "Eine Normalisierung ist möglich, aber nicht belegt.", repetition_effect: "Wiederholung kann die Verfügbarkeit der Bezeichnung erhöhen.", trust_effect: "Eine Vertrauenswirkung bleibt offen.", polarization_potential: "Polarisierung ist ein mögliches Risiko.", discourse_effect: "Die Formulierung kann die Debatte verengen." },
    discourse_effect: { impact_status: "risk", resonance_space: "Die Verbindung kann unter bestimmten Bedingungen einen politischen Resonanzraum öffnen.", normalization_potential: "medium", repetition_risk: "medium", polarization_potential: "Polarisierung ist ein mögliches Risiko.", trust_effect_potential: "Eine Vertrauenswirkung bleibt offen.", discourse_effect_potential: "Die Formulierung kann die Debatte verengen." },
    impact_path: { first_order: "Der Begriff wird mit dem Ereignis verbunden.", second_order: "Wiederholung kann Deutungsmuster verstärken.", third_order: "Diskursnormen könnten sich bei großer Wiederholung verändern." },
    evidence: { status: "medium", level: "medium", what_is_known: "Belegt sind Ereignis, Zitat und Platzierung.", what_is_inferred: "Der mögliche Resonanzpfad ist eine analytische Inferenz.", what_is_open: "Eine eingetretene gesellschaftliche Wirkung ist nicht belegt.", facts: ["Ereignis, Zitat und Platzierung sind belegt."], observations: ["Die Bezeichnung steht in der Überschrift."], inferences: ["Der mögliche Resonanzpfad ist eine analytische Inferenz."], impact_potentials: ["Die Verbindung kann leichter verfügbar werden."], impact_risks: ["Eine politische Zuschreibung kann verengt werden."], observed_impacts: [], limitations: ["Eine konkrete gesellschaftliche Wirkung ist nicht nachgewiesen."] },
    observed_impact: { present: false, description: null, evidence: [] },
    public_explanation: "Die politisch aufgeladene Bezeichnung stammt in dieser Meldung vom Bundesinnenminister und ist keine eigenständige Tatsachenfeststellung des Mediums. Das Medium übernimmt sie jedoch prominent in der Überschrift und ordnet sie dort klar dem Minister zu. Der Begriff verbindet die noch nicht abschließend geklärte Motivation sprachlich mit einer weiter gefassten politischen Bedrohung. Durch wiederholte Verwendung kann diese Verbindung im öffentlichen Resonanzraum leichter verfügbar werden und Sicherheitsreaktionen als besonders naheliegend erscheinen lassen. Das ist ein kommunikatives Wirkungspotenzial und ein mögliches Normalisierungs- oder Polarisierungsrisiko. Belegt sind das Ereignis, die Akteursaussage und ihre Platzierung. Nicht belegt sind bislang eine bestimmte Absicht des Sprechers oder des Mediums sowie eine tatsächlich eingetretene gesellschaftliche Wirkung.",
    editorial_assessment: "Unabhängig von der Absicht besitzt die prominente Platzierung kommunikatives Wirkungspotenzial.",
    fact_first_alternative: "Nach Sabotageversuchen laufen die Ermittlungen weiter; Täter und Motiv sind nicht abschließend geklärt. Der Minister verwendet anschließend eine politische Bezeichnung.",
    fact_first_reframe: { title: "Ermittlungen nach Sabotageversuchen an Umspannwerken dauern an", source_summary: "Nach Sabotageversuchen an deutschen Umspannwerken laufen Ermittlungen zu Tätern und Motiv weiter. Nach dem verfügbaren Bericht geht die Polizei derzeit von einem Einzeltäter aus; die Fahndung nach einem Verdächtigen dauert an. Außerdem wird ein Einsatz am Hambacher Forst beschrieben, bei dem Spezialkräfte einen auffälligen Lastwagen kontrollierten, die gesuchte Person jedoch nicht antrafen.\n\nBundesinnenminister Dobrindt verwendet für die mutmaßliche Motivation eine politisch aufgeladene Bezeichnung. Der Bericht nennt weitere Vorfälle in Brandenburg, Nordrhein-Westfalen und Sachsen sowie Funde von Spreng- oder Brandvorrichtungen in der Nähe von Umspannwerken. Ob die Ereignisse zusammenhängen, wer dafür verantwortlich ist und welches Motiv zugrunde liegt, ist nach dem vorliegenden Quellenstand nicht abschließend amtlich festgestellt. Umspannwerke zählen zur kritischen Infrastruktur.", summary: "Nach Sabotageversuchen laufen Ermittlungen; Täter und Motiv sind nicht abschließend geklärt. Die politische Bezeichnung wird dem Minister zugeschrieben.", detail_summary: "Nach Sabotageversuchen an Umspannwerken laufen die Ermittlungen weiter. Täter und Motiv sind nicht abschließend geklärt. Die politische Bezeichnung wird dem Minister zugeschrieben. Mögliche kommunikative Folgen bleiben analytische Inferenz. Eine gesellschaftlich eingetretene Wirkung ist nicht belegt." },
    self_frame_warning: true, self_frame_check: { problem_detected: true, problems: ["Der Frame steht in der Ausgangsüberschrift zu prominent."], frame_repetition_count: 1, rewrite_required: true, recommended_title: "Ermittlungen nach Sabotageversuchen an Umspannwerken dauern an", recommended_summary: "Nach Sabotageversuchen laufen Ermittlungen; Täter und Motiv sind nicht abschließend geklärt. Die politische Bezeichnung wird dem Minister zugeschrieben.", recommended_meta_description: "Nach Sabotageversuchen laufen Ermittlungen. Täter und Motiv sind offen; die politische Bezeichnung stammt vom Bundesinnenminister." }, source_comparison: { sufficient_basis: false, finding: "" }, ...overrides,
  };
}

test("neutrales Ereignis löst keinen Mediencheck aus", () => {
  assert.equal(detectMediaImpactTrigger(story("Bund veröffentlicht Monatsbericht", "Der Bericht enthält neue Daten zur Verwaltung.")).relevant, false);
  assert.equal(detectMediaImpactTrigger(story("Nach Gefahrengut-Alarm läuft der Flugverkehr wieder", "Eine Frau meldete einen gefährlichen Stoff; laut Polizei bestand zu keinem Zeitpunkt eine Gefahr.")).relevant, false);
});

for (const title of [
  "Seelze: Elektro-Rollstuhl löst Großbrand in Sonderpostenmarkt aus",
  "Dieselbus brennt in Betriebshof", "Benzinauto brennt auf Parkplatz",
  "Wasserstoffbus nach Unfall zerstört", "Impfstoff verursacht Erkrankungen",
  "Electric wheelchair causes fire in shop",
]) test(`implizite Technik-Schaden-Verknüpfung wird geprüft: ${title}`, () => {
  const item = story(title);
  const trigger = detectMediaImpactTrigger(item);
  assert.equal(trigger.relevant, true);
  assert.ok(trigger.reasons.includes("technology_harm_association_review"));
  assert.ok(!trigger.reasons.includes("loaded_headline_without_clear_attribution"));
  assert.equal(sanitizeMediaImpact({ relevant: false }, item, trigger).media_impact.relevant, false);
  assert.equal(detectMediaImpactTrigger(item).fingerprint, trigger.fingerprint);
});

test("bloße Elektrik, Brandschutz und getrennte Texte sind kein Assoziationsnachweis", () => {
  for (const title of ["Elektro-Rollstuhl erhält neue Steuerung", "Elektrogeschäft öffnet nach Großbrand", "Feuerwehr übt Brandschutz", "Elektrische Prüfung des Brandschutzes", "Elektroauto neu zugelassen. Brand im Nachbarort", "Dieselpreise im Monatsbericht"]) {
    assert.equal(detectMediaImpactTrigger(story(title)).relevant, false, title);
  }
  const item = story("Elektroauto erhält Zulassung", "Neue Daten zur Zulassung.", [source("Elektroauto erhält Zulassung"), source("Großbrand in Lagerhalle", "Eine Lagerhalle brennt.", { url: "https://example.org/b" })]);
  assert.equal(detectMediaImpactTrigger(item).relevant, false);
});

test("abgesicherte Ursachenangabe bleibt Prüfhinweis, nicht automatisch Manipulation", () => {
  const trigger = detectMediaImpactTrigger(story("Laut Polizei: Dieselbus verursacht Brand", "Die technische Ursache ist geprüft."));
  assert.ok(trigger.reasons.includes("technology_harm_association_review"));
  assert.ok(!trigger.reasons.includes("causal_certainty_gap_review"));
});

test("Kausalverkürzung funktioniert unabhängig von Technik und Medium", () => {
  const item = story("Reform verursacht Betriebsschließung", "Die Ursache ist laut Bericht noch unklar.");
  assert.ok(detectMediaImpactTrigger(item).reasons.includes("causal_certainty_gap_review"));
  item.title = "Betrieb schließt nach Reform";
  assert.ok(detectMediaImpactTrigger(item).reasons.includes("causal_certainty_gap_review"), "Originaltitel bleibt auch nach eigener Umformulierung Prüfgrundlage");
  assert.ok(!detectMediaImpactTrigger(story("Reform könnte Betriebsschließung verursachen", "Die Ursache bleibt unklar.")).reasons.includes("causal_certainty_gap_review"));
});

test("Prompt trennt Assoziation, Narrative, Wiederholung und Wahrheitsurteil", () => {
  const prompt = MEDIA_PROMPT_RULES.join(" ");
  for (const pattern of [/implizite Assoziationen und Narrative/, /Wortkombination allein/, /Illusory Truth/, /repetition_risk:open/, /Agenturkopien/, /Einzelfall belegt keine vergleichende Häufigkeit/]) assert.match(prompt, pattern);
});

test("beobachtet ohne Wirkungsbeleg wird auch ohne present-Flag zurückgestuft", () => {
  const item = story("Minister bezeichnet Protest als Klimaextremismus");
  const media = validMedia({ discourse_effect: { ...validMedia().discourse_effect, impact_status: "observed" }, observed_impact: { present: false, evidence: [] } });
  const result = sanitizeMediaImpact(media, item);
  assert.equal(result.media_impact.discourse_effect.impact_status, "potential");
  assert.equal(result.media_impact.observed_impact.present, false);
  assert.ok(result.dropped.includes("MEDIA_OBSERVED_IMPACT_EVIDENCE_INSUFFICIENT"));
});

test("Illusory-Truth-Effekt darf nicht ohne Beobachtungsbeleg behauptet werden", () => {
  const item = story("Nach Sabotage laufen Ermittlungen", "Der Minister spricht von Klimaextremismus.");
  const media = sanitizeMediaImpact(validMedia(), item).media_impact;
  const analysis = { ...item.analysis, media_impact: media, media_analysis_version: MEDIA_ANALYSIS_VERSION };
  media.editorial_assessment = "Ein Illusory-Truth-Effekt ist hier nachgewiesen.";
  assert.ok(mediaImpactValidationErrors(analysis, item).includes("MEDIA_REPETITION_EFFECT_OVERCLAIM"));
  media.editorial_assessment = "Ein Illusory-Truth-Effekt ist hier nicht nachgewiesen.";
  assert.ok(!mediaImpactValidationErrors(analysis, item).includes("MEDIA_REPETITION_EFFECT_OVERCLAIM"));
});

test("vollständiger KI-Befund darf einen zu engen lokalen Trigger abgesichert ergänzen", () => {
  const item = story("Bund veröffentlicht Monatsbericht", "Der Bericht enthält neue Daten zur Verwaltung.");
  const local = detectMediaImpactTrigger(item);
  assert.equal(local.relevant, false);
  const promoted = effectiveMediaImpactTrigger(local, validMedia(), item);
  assert.equal(promoted.relevant, true);
  assert.equal(promoted.basis, "analysis_finding");
  assert.ok(promoted.reasons.includes("analysis_substantive_finding"));
  assert.equal(effectiveMediaImpactTrigger(local, { relevant: true, reason: "bloße Behauptung" }, item).relevant, false);
  const analysis = { media_impact: validMedia() };
  const report = {};
  sanitizeAnalysisMediaImpact(analysis, { ...item, media_trigger: local }, report, "2026-09-05T11:00:00Z");
  assert.equal(analysis.media_trigger.basis, "analysis_finding");
  assert.equal(report.media_checks_ai_promoted, 1);
});

test("Trigger aus kontrolliertem Artikeltext bleibt nach flüchtigem Abruf prüfbar", () => {
  const enriched = story("Bund veröffentlicht Monatsbericht", "Der Bericht enthält neue Daten zur Verwaltung.", [source("Bund veröffentlicht Monatsbericht", "Der Bericht enthält neue Daten zur Verwaltung.", {
    article_excerpt: "Ein Minister bezeichnet die Entwicklung als extremistisch und warnt vor einer Bedrohung.",
    content_hash: "source-v1",
  })]);
  enriched.content_hash = "story-v1";
  const trigger = detectMediaImpactTrigger(enriched);
  assert.equal(trigger.relevant, true);
  const persisted = structuredClone(enriched);
  delete persisted.sources[0].article_excerpt;
  assert.equal(detectMediaImpactTrigger(persisted).relevant, false);
  const analysis = {
    media_impact: validMedia(),
    source_summary: persisted.source_summary,
    summary: "Der Bericht enthält neue Daten. Die Einordnung bleibt offen.",
    detail_summary: "Der Bericht enthält neue Daten. Die Einordnung bleibt offen.",
  };
  sanitizeAnalysisMediaImpact(analysis, { ...enriched, media_trigger: trigger }, {}, "2026-09-05T11:00:00Z");
  assert.equal(analysis.media_trigger.basis, "controlled_source_text");
  assert.equal(mediaTriggerForAnalysis(analysis, persisted).relevant, true);
  assert.ok(!mediaImpactValidationErrors(analysis, persisted).includes("MEDIA_IMPACT_UNTRIGGERED"));
  persisted.sources[0].content_hash = "source-v2";
  assert.equal(mediaTriggerForAnalysis(analysis, persisted).relevant, false);
  assert.ok(mediaImpactValidationErrors(analysis, persisted).includes("MEDIA_IMPACT_UNTRIGGERED"));
});

test("englischsprachige politisch aufgeladene Meldungen nutzen dieselbe Vorprüfung", () => {
  assert.equal(detectMediaImpactTrigger(story("Minister calls protesters extremists", "The investigation is ongoing and the motive remains unknown.")).relevant, true);
});

test("sauber attribuiertes politisches Zitat bleibt Akteursaussage", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus", "Der Minister verwendet den Begriff; die Ermittlungen dauern an.");
  const trigger = detectMediaImpactTrigger(item);
  assert.equal(trigger.relevant, true);
  const media = sanitizeMediaImpact(validMedia(), item, trigger).media_impact;
  assert.equal(media.speaker_statement.status, "interpretation");
  assert.equal(media.framing.attribution_quality, "eindeutig attribuiert");
});

test("Begriff in der Überschrift korrigiert eine widersprüchliche Nutzungsangabe deterministisch", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus", "Die Ermittlungen dauern an.");
  const media = validMedia({ framing: { ...validMedia().framing, media_usage: "body" } });
  const result = sanitizeMediaImpact(media, item);
  assert.equal(result.media_impact.framing.media_usage, "headline");
  assert.ok(result.dropped.includes("MEDIA_USAGE_DERIVED_FROM_HEADLINE"));
});

test("inhaltlich vollständige Self-Frame-Fassung erhält deterministisch zwei Absätze", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus", "Der Minister verwendet den Begriff; die Ermittlungen dauern an.");
  const media = validMedia();
  media.fact_first_reframe.source_summary = media.fact_first_reframe.source_summary.replace(/\n\n/g, " ");
  const sanitized = sanitizeMediaImpact(media, item).media_impact;
  assert.equal(sanitized.fact_first_reframe.source_summary.split(/\n\s*\n/).length, 2);
});

test("politischer Begriff ohne Attribution erhält höhere Warnsignale", () => {
  const attributed = detectMediaImpactTrigger(story("Minister bezeichnet Sabotage als Klimaextremismus"));
  const unattributed = detectMediaImpactTrigger(story("Klimaextremismus bedroht die Stromversorgung"));
  assert.ok(unattributed.score > attributed.score);
  assert.ok(unattributed.reasons.includes("loaded_headline_without_clear_attribution"));
});

test("unklarer Ermittlungsstand wird als Auslassungssignal erkannt", () => {
  const trigger = detectMediaImpactTrigger(story("Täter verantwortlich für Angriff", "Die Ermittlungen laufen; Täter und Motiv sind noch unklar."));
  assert.ok(trigger.reasons.includes("uncertain_status_omitted_in_headline"));
});

test("eigene Überschrift beginnt nach Self-Frame-Rewrite mit dem Sachverhalt", () => {
  const item = story("Klimaextremismus bedroht Deutschland");
  const analysis = { source_summary: "Bundesinnenminister Dobrindt bezeichnet die Sabotageversuche als Klimaextremismus.", summary: "Klimaextremismus bedroht die Versorgung. Die Wirkung bleibt offen.", detail_summary: "Klimaextremismus bedroht die Versorgung. Weitere Fakten bleiben offen.", media_impact: validMedia() };
  const report = {};
  applySelfFrameRewrites(analysis, item, report);
  assert.match(item.title, /^Ermittlungen nach Sabotageversuchen/);
  assert.match(analysis.source_summary, /^Nach Sabotageversuchen/);
  assert.equal(report.self_frame_rewrites, 4);
});

test("korrekt attribuierter, aber akteurszentrierter Einstieg wird sachverhaltszentriert", () => {
  const item = story("Anschläge auf Umspannwerke – Dobrindt geht von Klimaextremismus aus");
  const analysis = { source_summary: "Bundesinnenminister Dobrindt hat die Sabotageversuche als Klimaextremismus bezeichnet.", summary: "Dobrindt ordnet die Sabotageversuche als Klimaextremismus ein.", detail_summary: "Nach den Sabotageversuchen laufen die Ermittlungen weiter.", media_impact: validMedia() };
  applySelfFrameRewrites(analysis, item, {});
  assert.match(analysis.source_summary, /^Nach Sabotageversuchen/);
  assert.match(analysis.summary, /^Nach Sabotageversuchen/);
  assert.match(item.title, /^Anschläge auf Umspannwerke/);
});

for (const [label, title] of [
  ["ideologisch linker Frame", "Aktivisten sprechen von Profitgier der Konzerne"],
  ["ideologisch rechter Frame", "Partei warnt vor linksgrüner Öko-Diktatur"],
  ["Regierungsframe", "Minister bezeichnet Protest als Klimaextremismus"],
  ["wirtschaftlicher Lobbyframe", "Verband warnt vor Jobvernichtung durch die Reform"],
]) test(`${label} nutzt dieselbe symmetrische Triggerlogik`, () => assert.equal(detectMediaImpactTrigger(story(title)).relevant, true));

test("fehlende Evidenz entfernt eine behauptete politische Herkunft", () => {
  const item = story("Klimaextremismus bedroht die Stromversorgung");
  const result = sanitizeMediaImpact(validMedia({ framing: { ...validMedia().framing, political_history_relevant: true, political_history: "Seit Jahren einer Strömung zuzurechnen.", political_history_evidence: ["https://unknown.example/history"] } }), item);
  assert.equal(result.media_impact.framing.political_history_relevant, false);
  assert.equal(result.media_impact.framing.political_history, "");
  assert.ok(result.dropped.includes("MEDIA_HISTORY_EVIDENCE_UNAVAILABLE"));
});

test("bekannte Verwendungsgeschichte bleibt nur mit gelieferter Quellenreferenz", () => {
  const item = story("Klimaextremismus bedroht die Stromversorgung");
  const media = validMedia({ framing: { ...validMedia().framing, political_history_relevant: true, political_history: "Die Verwendung ist in der gelieferten Originalaussage dokumentiert.", political_history_evidence: ["https://example.org/a"] } });
  const result = sanitizeMediaImpact(media, item);
  assert.equal(result.media_impact.framing.political_history_relevant, true);
  assert.deepEqual(result.media_impact.framing.political_history_evidence, ["https://example.org/a"]);
});

test("direkte und indirekte Zitate werden als prominente Akteursaussagen erkannt", () => {
  assert.ok(detectMediaImpactTrigger(story("Minister: „Klimaextremismus bedroht uns“")).relevant);
  assert.ok(detectMediaImpactTrigger(story("Minister bezeichnet Sabotage als Klimaextremismus")).relevant);
});

test("stärkere Überschrift als Teaser wird erkannt", () => {
  const trigger = detectMediaImpactTrigger(story("Klimaextremismus bedroht Deutschland", "Die Ermittlungen zu einer Sabotage dauern an."));
  assert.ok(trigger.reasons.includes("headline_body_gap"));
});

test("Self-Frame-Gate sperrt unsichere eigene Formulierung", () => {
  const item = story("Klimaextremismus bedroht Deutschland");
  const analysis = { media_analysis_version: MEDIA_ANALYSIS_VERSION, media_impact: validMedia(), source_summary: item.source_summary, summary: "Sachverhalt bleibt offen. Weitere Prüfung läuft.", detail_summary: "Sachverhalt bleibt offen." };
  assert.ok(mediaImpactValidationErrors(analysis, item).includes("MEDIA_SELF_FRAME_UNSAFE:title"));
});

test("Absichtszuschreibung wird abgewiesen", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus");
  const media = validMedia({ editorial_assessment: "Das Medium will mit der Überschrift manipulieren." });
  const analysis = { media_analysis_version: MEDIA_ANALYSIS_VERSION, media_impact: media, source_summary: item.source_summary, summary: "Die Ermittlungen dauern an.", detail_summary: "Die Ermittlungen dauern an." };
  assert.ok(mediaImpactValidationErrors(analysis, item).includes("MEDIA_INTENT_ATTRIBUTION_NOT_ALLOWED"));
});

test("Wirkungspotenzial darf nicht als sichere Wirkung formuliert werden", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus");
  const media = validMedia(); media.resonance.discourse_effect = "Die Überschrift schwächt die Demokratie.";
  const analysis = { media_analysis_version: MEDIA_ANALYSIS_VERSION, media_impact: media, source_summary: item.source_summary, summary: "Die Ermittlungen dauern an.", detail_summary: "Die Ermittlungen dauern an." };
  assert.ok(mediaImpactValidationErrors(analysis, item).includes("MEDIA_EFFECT_OVERCLAIM"));
});

test("Personen- und Medienhaus-Scores sind ausgeschlossen", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus");
  const media = validMedia({ editorial_assessment: "Das Medium erhält einen Score von 25 Prozent." });
  const analysis = { media_analysis_version: MEDIA_ANALYSIS_VERSION, media_impact: media, source_summary: item.source_summary, summary: "Die Ermittlungen dauern an.", detail_summary: "Die Ermittlungen dauern an." };
  assert.ok(mediaImpactValidationErrors(analysis, item).includes("MEDIA_OUTLET_SCORE_NOT_ALLOWED"));
});

test("Medienvergleich braucht mindestens zwei Quellen", () => {
  const item = story("Klimaextremismus bedroht die Stromversorgung");
  const result = sanitizeMediaImpact(validMedia({ source_comparison: { sufficient_basis: true, finding: "Darstellungen weichen ab." } }), item);
  assert.equal(result.media_impact.source_comparison.sufficient_basis, false);
});

test("Medienvergleich bleibt bei zwei verschiedenen Darstellungen möglich", () => {
  const sources = [source("Klimaextremismus bedroht die Stromversorgung", "Die Ermittlungen laufen.", { publisher: "Medium A", publisher_id: "a" }), source("Ermittlungen nach Sabotage", "Ein Minister verwendet eine politische Bezeichnung.", { source_id: "medium-b", publisher: "Medium B", publisher_id: "b", url: "https://example.org/b" })];
  const item = story(sources[0].title, sources[0].summary, sources);
  const result = sanitizeMediaImpact(validMedia({ source_comparison: { sufficient_basis: true, finding: "Die Überschriften setzen unterschiedliche Schwerpunkte." } }), item);
  assert.equal(result.media_impact.source_comparison.sufficient_basis, true);
});

test("Prompt behandelt externe Texte als untrusted input und fordert Sachverhalt vor Frame", () => {
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus");
  item.preanalysis = { filter_version: "4.0" };
  const prompt = buildAnalysisPrompt([item]);
  assert.match(prompt, /UNTRUSTED_SOURCE_DATA_BEGIN/);
  assert.match(prompt, /Sachverhalt vor Frame/);
  assert.match(prompt, /media_impact/);
});

test("Backfill ist idempotent, versioniert und protokolliert reale Nutzung", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-media-backfill-"));
  fs.mkdirSync(path.join(root, "data/news"), { recursive: true });
  const production = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url), "utf8"));
  const climate = structuredClone(production.stories.find((entry) => entry.slug.includes("klimaextremismus")));
  delete climate.analysis.media_impact;
  delete climate.analysis.media_analysis_version;
  delete climate.analysis.media_checked_at;
  delete climate.analysis.media_trigger_fingerprint;
  climate.source_summary = "Bundesinnenminister Dobrindt bezeichnet die Vorfälle als Klimaextremismus. Die Ermittlungen laufen weiter und die Hintergründe sind noch offen. Diese Ausgangsfassung dient ausschließlich dem Test der automatischen Sachverhalt-zuerst-Korrektur.\n\nWeitere Einzelheiten bleiben offen; die vorhandenen Quellen und Claims werden durch den Medien-Backfill nicht verändert.";
  fs.writeFileSync(path.join(root, "data/news/stories.json"), JSON.stringify({ schema_version: "1.1", stories: [climate] }));
  fs.writeFileSync(path.join(root, "data/news/usage.json"), JSON.stringify({ schema_version: "1.0", runs: [] }));
  fs.writeFileSync(path.join(root, "data/news/state.json"), JSON.stringify({ budget_fx: { rate_usd_per_eur: 1.1, rate_date: "2026-09-05", checked_at: "2026-09-05T06:00:00Z" } }));
  let calls = 0;
  const callAiImpl = async () => {
    calls += 1;
    const media = calls === 1 ? validMedia({ fact_first_reframe: { ...validMedia().fact_first_reframe, source_summary: "Zu kurz." } }) : validMedia();
    return { analyses: [{ story_id: climate.story_id, media_impact: media }], provider: "test", model: "gpt-5.4-mini", mode: "test", method_sources: [], prompt_chars: 3000, answer_chars: 3000, reported_usage: { input_tokens: 900, output_tokens: 700 }, request_attempts: 1 };
  };
  const first = await backfillMediaImpact({ root, limit: 2, dryRun: false, now: "2026-09-05T07:00:00Z", callAiImpl, build: () => {} });
  assert.equal(first.completed, 1, JSON.stringify(first));
  assert.equal(first.quality_retries, 1);
  assert.equal(first.ai_requests, 2);
  const saved = JSON.parse(fs.readFileSync(path.join(root, "data/news/stories.json"))).stories[0];
  assert.equal(saved.current_version, climate.current_version + 1);
  assert.equal(saved.analysis.media_analysis_version, MEDIA_ANALYSIS_VERSION);
  assert.ok(saved.analysis.media_impact.relevant);
  const second = await backfillMediaImpact({ root, limit: 2, dryRun: false, now: "2026-09-05T07:05:00Z", callAiImpl, build: () => {} });
  assert.equal(second.candidates, 0, JSON.stringify({ second, stored: saved.analysis.media_trigger_fingerprint, current: detectMediaImpactTrigger(saved).fingerprint }));
  assert.equal(calls, 2);
  const logged = JSON.parse(fs.readFileSync(path.join(root, "data/news/usage.json"))).runs[0];
  assert.ok(logged.counts.media_check_tokens > 0);
  assert.ok(logged.ai.media_check_cost_usd > 0);
  assert.equal(logged.ai.requests, 2);
});

test("bestehende Legacy-Akten bleiben bis zum selektiven Backfill gültig", () => {
  const item = story("Klimaextremismus bedroht die Stromversorgung");
  assert.deepEqual(mediaImpactValidationErrors({ source_summary: item.source_summary }, item), []);
});

test("verschärfte Trigger entfernen einen nicht mehr relevanten Mediencheck ohne KI-Aufruf", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-media-cleanup-"));
  fs.mkdirSync(path.join(root, "data/news"), { recursive: true });
  const item = story("Nach Gefahrengut-Alarm läuft der Flugverkehr wieder", "Die technische Prüfung ist abgeschlossen.");
  item.published = true;
  item.listed = true;
  item.current_version = 1;
  item.versions = [];
  item.analysis = { ...item.analysis, media_analysis_version: MEDIA_ANALYSIS_VERSION, media_trigger_fingerprint: "alter-trigger", media_impact: validMedia() };
  fs.writeFileSync(path.join(root, "data/news/stories.json"), JSON.stringify({ schema_version: "1.1", stories: [item] }));
  fs.writeFileSync(path.join(root, "data/news/usage.json"), JSON.stringify({ schema_version: "1.0", runs: [] }));
  fs.writeFileSync(path.join(root, "data/news/state.json"), JSON.stringify({ budget_fx: { rate_usd_per_eur: 1.1, rate_date: "2026-09-05", checked_at: "2026-09-05T06:00:00Z" } }));
  let calls = 0;
  const result = await backfillMediaImpact({ root, dryRun: false, now: "2026-09-05T08:00:00Z", callAiImpl: async () => { calls += 1; }, build: () => {} });
  const saved = JSON.parse(fs.readFileSync(path.join(root, "data/news/stories.json"))).stories[0];
  assert.equal(result.cleaned, 1);
  assert.equal(calls, 0);
  assert.equal(saved.analysis.media_impact, null);
  assert.equal(saved.current_version, 2);
});

test("bestehende Medienchecks werden ohne KI-Aufruf deterministisch normalisiert", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "woek-media-normalize-"));
  fs.mkdirSync(path.join(root, "data/news"), { recursive: true });
  const item = story("Minister bezeichnet Sabotage als Klimaextremismus", "Die Ermittlungen dauern an.");
  item.published = true;
  item.listed = true;
  item.current_version = 1;
  item.versions = [];
  item.analysis = { ...item.analysis, media_analysis_version: MEDIA_ANALYSIS_VERSION, media_trigger_fingerprint: detectMediaImpactTrigger(item).fingerprint, media_impact: validMedia({ framing: { ...validMedia().framing, media_usage: "body" } }) };
  fs.writeFileSync(path.join(root, "data/news/stories.json"), JSON.stringify({ schema_version: "1.1", stories: [item] }));
  fs.writeFileSync(path.join(root, "data/news/usage.json"), JSON.stringify({ schema_version: "1.0", runs: [] }));
  fs.writeFileSync(path.join(root, "data/news/state.json"), JSON.stringify({ budget_fx: { rate_usd_per_eur: 1.1, rate_date: "2026-09-05", checked_at: "2026-09-05T06:00:00Z" } }));
  let calls = 0;
  const result = await backfillMediaImpact({ root, dryRun: false, now: "2026-09-05T08:05:00Z", callAiImpl: async () => { calls += 1; }, build: () => {} });
  const saved = JSON.parse(fs.readFileSync(path.join(root, "data/news/stories.json"))).stories[0];
  assert.equal(result.normalized, 1);
  assert.equal(calls, 0);
  assert.equal(saved.analysis.media_impact.framing.media_usage, "headline");
  assert.equal(saved.current_version, 2);
});

test("Detailseite zeigt den Check nur bei Relevanz und nach der Ereignisanalyse", () => {
  const production = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url), "utf8"));
  const item = structuredClone(production.stories.find((entry) => entry.slug.includes("klimaextremismus")));
  item.analysis.media_impact = validMedia();
  const html = storyPage(item);
  assert.ok(html.includes("Medien- &amp; Sprachwirkung"));
  assert.ok(html.indexOf('id="medienwirkung"') > html.indexOf('id="folgencheck"'));
  assert.ok(html.indexOf("Belegter Sachverhalt") < html.indexOf("Sprachlicher Befund"));
  delete item.analysis.media_impact;
  assert.ok(!storyPage(item).includes('id="medienwirkung"'));
});

test("Medienanzeige trennt redaktionelle Framequelle und Sprecher der Akteursaussage", () => {
  const production = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url), "utf8"));
  const item = structuredClone(production.stories.find((entry) => entry.slug.includes("klimaextremismus")));
  const media = validMedia();
  media.attribution = { ...media.attribution, speaker: "Redaktionelle Frage", frame_source: "Überschrift des Testmediums", usage_type: "editorial", attribution_quality: "editorial" };
  media.speaker_statement = { present: true, speaker: "Sprecherin des Verbands", statement: "Die Entscheidung soll nach der Abstimmung fallen.", status: "claim" };
  item.analysis.media_impact = media;
  const rendered = () => storyPage(item).match(/<article class="news-story-section news-media-impact".*?<\/article>/s)[0];
  const html = rendered();
  assert.ok(html.includes("Quelle der Formulierung ist Überschrift des Testmediums"));
  assert.ok(html.includes("<strong>Sprecherin des Verbands:</strong> Die Entscheidung soll nach der Abstimmung fallen."));
  assert.ok(!html.includes("<strong>Redaktionelle Frage:</strong>"));
  assert.ok(html.includes("Überschrift · Fließtext · redaktionelle Formulierung"));
  assert.ok(html.includes("<strong>Normalisierungspotenzial:</strong> mittel"));
  assert.ok(html.includes("<strong>Wiederholungsrisiko:</strong>"));
  assert.ok(!html.includes("Wiederholung / Illusory-Truth-Risiko"));
  media.speaker_statement.speaker = "";
  assert.ok(rendered().includes("<strong>Akteur nicht eindeutig benannt:</strong>"));
  media.speaker_statement.present = false;
  assert.ok(!rendered().includes("<h3>Akteursaussage</h3>"));
});

test("Medienanzeige übersetzt Zuordnungscodes und zeigt keine unbekannten internen Kategorien", () => {
  const production = JSON.parse(fs.readFileSync(new URL("../../data/news/stories.json", import.meta.url), "utf8"));
  const item = structuredClone(production.stories.find((entry) => entry.slug.includes("klimaextremismus")));
  const media = validMedia();
  item.analysis.media_impact = media;
  for (const [code, label] of Object.entries({ clear: "klar zugeordnet", clear_but_prominent: "klar zugeordnet, aber stark hervorgehoben", late: "Zuordnung erst im weiteren Text erkennbar", unclear: "unklare Zuordnung", editorial: "redaktionelle Formulierung", unknown: "Zuordnung nicht ausreichend feststellbar", unsupported_internal_code: "Zuordnung nicht ausreichend feststellbar" })) {
    media.attribution.attribution_quality = code;
    const html = storyPage(item).match(/<article class="news-story-section news-media-impact".*?<\/article>/s)[0];
    assert.ok(html.includes(`Überschrift · Fließtext · ${label}.`));
    assert.ok(!html.includes(`· ${code}.`));
  }
});
