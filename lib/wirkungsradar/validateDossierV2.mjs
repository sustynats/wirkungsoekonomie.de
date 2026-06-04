const SENSITIVE_TOPICS = [
  "migration",
  "flucht",
  "sozialstaat",
  "buergergeld",
  "bürgergeld",
  "armut",
  "arbeitslosigkeit",
  "pflege",
  "religion",
  "gender",
  "queeres leben",
  "behinderung",
  "krankheit",
  "alter",
];

const ENERGY_TOPICS = ["fusion", "kernenergie", "gas", "wasserstoff", "e-fuels", "grundlast", "dunkelflaute", "energiewende"];
const BAD_POSITIVE_EXAMPLE_PHRASES = [
  "Abstract:",
  "Die Aussage enthält",
  "wahrer Kern",
  "wahrer Belastungskern",
  "Kosten und Belastungen",
];
const FEAR_WORDS = ["Angst", "Bedrohung", "Panik", "Untergang", "Katastrophe", "Zwang"];
const JARGON = ["wirkungsökonomisch betrachtet", "positive Netto-Wirkung", "Transformationsarchitektur", "Resonanzraum"];
const HUMAN_AS_BURDEN = ["Kostenstelle", "als Last", "Bedrohung", "Masse", "Sozialschmarotzer", "Belastungskern", "Kostenkern"];

function textOf(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function wordCount(value) {
  return textOf(value).split(/\s+/).filter(Boolean).length;
}

function sentenceAverage(value) {
  const sentences = textOf(value).split(/[.!?]+/).map((item) => item.trim()).filter(Boolean);
  if (!sentences.length) return 0;
  return sentences.reduce((sum, item) => sum + wordCount(item), 0) / sentences.length;
}

function includesAny(value, phrases) {
  const lower = textOf(value).toLowerCase();
  return phrases.some((phrase) => lower.includes(phrase.toLowerCase()));
}

function countOccurrences(value, phrases) {
  const lower = textOf(value).toLowerCase();
  return phrases.reduce((sum, phrase) => {
    const needle = phrase.toLowerCase();
    if (!needle) return sum;
    return sum + (lower.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  }, 0);
}

function appliesTo(dossier, topics) {
  const haystack = [dossier.slug, dossier.title, dossier.claim, ...(dossier.topicCluster || []), ...(dossier.claimVariants || [])].join(" ").toLowerCase();
  return topics.some((topic) => haystack.includes(topic));
}

function firstFailStatus(dossier, errors) {
  if (errors.some((error) => error.startsWith("sensitiveHumanTopicGate"))) return "draft_dehumanization_risk";
  if (errors.some((error) => error.startsWith("positiveExampleGate"))) return "draft_missing_positive_example";
  if (errors.some((error) => error.startsWith("frameAmplificationGate"))) return "draft_example_amplifies_frame";
  if (errors.some((error) => error.startsWith("betterQuestionGate"))) return "draft_bad_counterquestion";
  if (errors.some((error) => error.startsWith("mausModeGate"))) return "draft_not_maus_mode";
  if (errors.some((error) => error.startsWith("energyArchitectureGate"))) return "draft_energy_architecture_error";
  if (errors.some((error) => error.startsWith("systemicGate"))) return "draft_incomplete";
  if (errors.some((error) => error.startsWith("sourceGate"))) return "draft_missing_sources";
  return "checked_v2_positive_examples";
}

export function validateDossierV2(dossier) {
  const errors = [];
  const warnings = [];
  const cockpit = dossier.cockpit || {};
  const positiveExample = cockpit.positiveExample || {};
  const cockpitText = [
    cockpit.shortJudgement,
    cockpit.sayThisNow,
    positiveExample.title,
    positiveExample.text,
    positiveExample.hostLine,
    cockpit.betterQuestion,
    cockpit.frameShift?.betterAnswer,
  ].join(" ");

  if (!positiveExample.text) errors.push("positiveExampleGate: positives Beispiel fehlt");
  if (textOf(positiveExample.text).startsWith("Abstract:")) errors.push("positiveExampleGate: positives Beispiel beginnt mit Abstract");
  if (includesAny(positiveExample.text, BAD_POSITIVE_EXAMPLE_PHRASES)) errors.push("positiveExampleGate: positives Beispiel nutzt Problem-/Abstract-Sprache");
  if (textOf(positiveExample.text).length < 120) errors.push("positiveExampleGate: positives Beispiel ist kuerzer als 120 Zeichen");
  if (!positiveExample.hostLine) errors.push("positiveExampleGate: Host-Line fehlt");
  if (!Array.isArray(positiveExample.whatGetsBetter) || positiveExample.whatGetsBetter.length < 3) {
    errors.push("positiveExampleGate: whatGetsBetter braucht mindestens 3 Chips");
  }

  const hostileTerms = positiveExample.avoidFrameTerms || [dossier.claim, ...(dossier.claimVariants || [])].filter(Boolean);
  const hostileCount = countOccurrences(positiveExample.text, hostileTerms);
  if (hostileCount > 2) errors.push("frameAmplificationGate: positives Beispiel wiederholt den feindlichen Frame zu oft");
  if (includesAny(positiveExample.text.slice(0, 160), FEAR_WORDS)) errors.push("frameAmplificationGate: positives Beispiel startet mit Angst-/Problemworten");
  if (!positiveExample.whatGetsBetter?.length) errors.push("frameAmplificationGate: sichtbare Verbesserung fehlt");

  if (appliesTo(dossier, SENSITIVE_TOPICS)) {
    if (includesAny(cockpit.shortJudgement, ["Belastungskern", "Kostenkern"])) {
      errors.push("sensitiveHumanTopicGate: Kurzurteil rahmt Menschen als Belastung/Kosten");
    }
    if (includesAny(cockpit.sayThisNow, HUMAN_AS_BURDEN) || includesAny(positiveExample.text.slice(0, 220), HUMAN_AS_BURDEN)) {
      errors.push("sensitiveHumanTopicGate: Cockpit rahmt Menschen als Kosten, Last, Masse oder Bedrohung");
    }
    if (/^(migration|flucht|bürgergeld|buergergeld|arbeitslose|arme|pflegebedürftige).{0,40}kostet/i.test(textOf(cockpit.sayThisNow))) {
      errors.push("sensitiveHumanTopicGate: sayThisNow startet mit Gruppen-Kosten-Frame");
    }
  }

  if (!cockpit.betterQuestion) errors.push("betterQuestionGate: bessere Frage fehlt");
  if (cockpit.betterQuestion && !textOf(cockpit.betterQuestion).endsWith("?")) errors.push("betterQuestionGate: bessere Frage endet nicht mit Fragezeichen");
  if (textOf(cockpit.betterQuestion).length > 180) errors.push("betterQuestionGate: bessere Frage ist laenger als 180 Zeichen");
  if (/^Ich beantworte/i.test(textOf(cockpit.betterQuestion))) errors.push("betterQuestionGate: bessere Frage ist Meta-Antwort statt Frage");

  const jargonCount = countOccurrences(cockpitText, JARGON);
  if (jargonCount > 2) errors.push("mausModeGate: zu viele Fachbegriffe im Cockpit");
  if (includesAny(cockpitText, ["wirkungsökonomisch betrachtet", "Transformationsarchitektur"])) errors.push("mausModeGate: Cockpit nutzt abstrakte Methodenbegriffe");
  if (sentenceAverage(cockpit.sayThisNow) > 16) warnings.push("mausModeGate: Sag-das-jetzt hat lange Saetze");

  if (!dossier.impactFan?.dimensions || dossier.impactFan.dimensions.length < 5) errors.push("systemicGate: ImpactFan braucht mindestens 5 Dimensionen");
  if (!dossier.consequenceStack) errors.push("systemicGate: ConsequenceStack fehlt");
  if (!dossier.solution?.plainLanguage || !dossier.solution?.measures?.length) errors.push("systemicGate: Loesung fehlt");
  if (!dossier.trustBlock) errors.push("systemicGate: TrustBlock fehlt");
  if (!dossier.sources?.length) errors.push("sourceGate: Quellen fehlen");

  if (appliesTo(dossier, ENERGY_TOPICS)) {
    const energyText = [dossier.explain?.simpleMechanism, cockpit.sayThisNow, positiveExample.text, dossier.solution?.plainLanguage].join(" ").toLowerCase();
    if (!/(direkt|direkter strom|direktstrom|elektrifizierung)/.test(energyText)) {
      errors.push("energyArchitectureGate: Direktstromvergleich fehlt");
    }
    if (/(wasserstoff|fusion|kernenergie|gas|grundlast|dunkelflaute)/.test(energyText) && !/(reserve|dauerbetrieb|selten|zeitpfad|wärme|waerme|turbine)/.test(energyText)) {
      errors.push("energyArchitectureGate: Reserve, Dauerbetrieb oder thermischer Pfad nicht sauber unterschieden");
    }
    if (/grundlast/.test(energyText) && !/(nicht|kein|kritisch|unflexibel|reserve)/.test(energyText)) {
      errors.push("energyArchitectureGate: Grundlast erscheint unkritisch");
    }
  }

  const status = firstFailStatus(dossier, errors);
  const quality = {
    ...(dossier.quality || {}),
    hasPositiveExample: Boolean(positiveExample.text && positiveExample.hostLine),
    hasFrameShift: Boolean(cockpit.frameShift?.oldFrame && cockpit.frameShift?.betterAnswer),
    hasBetterQuestion: Boolean(cockpit.betterQuestion && textOf(cockpit.betterQuestion).endsWith("?")),
    hasImpactFan: Boolean(dossier.impactFan?.dimensions?.length >= 5),
    hasPsychologyLite: Boolean(dossier.psychologyLite?.items?.length),
    hasConsequenceStack: Boolean(dossier.consequenceStack),
    hasSolution: Boolean(dossier.solution?.plainLanguage),
    hasTrustBlock: Boolean(dossier.trustBlock),
    hasSources: Boolean(dossier.sources?.length),
    jargonCountInCockpit: jargonCount,
    hostileFrameTermCountInExample: hostileCount,
    lastReviewed: dossier.quality?.lastReviewed || dossier.trustBlock?.dataStand || "",
  };

  return { status, errors, warnings, quality };
}

export const P0_BLOCKING_STATUSES = new Set([
  "draft_dehumanization_risk",
  "draft_example_amplifies_frame",
  "draft_missing_positive_example",
  "draft_bad_counterquestion",
]);
