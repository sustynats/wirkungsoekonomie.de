import type {
  EmotionalTrigger,
  LogicalPattern,
  NarrativeFamily,
  NarrativeSeed,
  NormalizedTheme,
  PublicHandling,
  RawNarrativeSeed,
  RiskDimension,
} from "./narrative-seed-types";

export const ThemeMapping: Record<string, NormalizedTheme> = {
  Migration: "migration",
  Religion: "religion",
  Umwelt: "klima",
  Gesellschaft: "gender_kulturkampf",
  Bildung: "bildung",
  Medienkritik: "medien",
  Europa: "europa",
  Politik: "parteien_eliten",
  Souveränität: "demokratie",
  Souveraenitaet: "demokratie",
  Ideologie: "verschwoerung",
  Sicherheit: "sicherheit",
  Gesundheit: "gesundheit",
  Nationalismus: "nationalismus",
  Wirtschaft: "wirtschaft",
};

export const LogicalPatternMapping: Record<string, LogicalPattern> = {
  "Falsche Kausalität": "falsche_kausalitaet",
  "Falsche Kausalitaet": "falsche_kausalitaet",
  Pauschalisierung: "pauschalisierung",
  "Strohmann-Argument": "strohmann",
  "Falsche Dichotomie": "falsche_dichotomie",
  Übertreibung: "uebertreibung",
  Uebertreibung: "uebertreibung",
  "Ad-hominem": "ad_hominem",
  Zirkelschluss: "zirkelschluss",
  Verschwörung: "verschwörung",
  Verschwoerung: "verschwörung",
  Vereinfachung: "scheinargument",
};

export const ToxicNarrativeSeedTerms = [
  "Überfremdung",
  "Umvolkung",
  "Bevölkerungsaustausch",
  "Volksverräter",
  "Sozialschmarotzer",
  "Gender-Wahn",
  "Lügenpresse",
  "Kulturmarxismus",
  "Great Reset",
  "Corona-Diktatur",
  "Klimadiktatur",
  "EU-Diktatur",
];

export function normalizeNarrativeSeed(seed: RawNarrativeSeed): NarrativeSeed {
  const claim = seed.rawClaim;
  const text = `${claim} ${seed.rawDescription ?? ""} ${seed.rawCategory ?? ""}`.toLowerCase();
  const logicalPattern = LogicalPatternMapping[seed.rawErrorType ?? ""] ?? "unklar";
  const toxic = ToxicNarrativeSeedTerms.some((term) => claim.toLowerCase().includes(term.toLowerCase()));
  const publicHandling: PublicHandling = toxic ? "never_public_raw" : "public_only_contextualized";
  const family = inferNarrativeFamily(text);
  return {
    id: seed.id,
    rawClaim: seed.rawClaim,
    rawDescription: seed.rawDescription,
    rawCategory: seed.rawCategory,
    rawErrorType: seed.rawErrorType,
    normalizedTheme: ThemeMapping[seed.rawCategory ?? ""] ?? inferTheme(text),
    narrativeFamily: family,
    logicalPattern,
    logicalPatternNeedsReview: seed.rawErrorType === "Vereinfachung",
    emotionalTrigger: inferEmotionalTrigger(text, family),
    riskDimensions: inferRiskDimensions(text, family),
    publicHandling,
    matchedDossierSlug: seed.matchedDossierSlug,
    suggestedDossierSlug: seed.suggestedDossierSlug,
    matchedNarrativeSlug: seed.matchedNarrativeSlug,
    searchSynonyms: [seed.rawClaim, ...(seed.searchSynonyms ?? [])],
    hostGuidance: {
      doNotSay: toxic ? [seed.rawClaim, "Menschen als Problem rahmen", "den Seed als Hook nutzen"] : ["den alten Frame als Hook nutzen"],
      betterQuestion: betterQuestionFor(text, family),
      positiveExampleIdea: positiveExampleFor(text, family),
    },
    status: seed.matchedDossierSlug ? "mapped_to_existing" : seed.suggestedDossierSlug ? "candidate_new_dossier" : toxic ? "blocked_toxic_raw" : "needs_review",
  };
}

function inferTheme(text: string): NormalizedTheme {
  if (/migration|islam|wohnungsnot|kriminal/.test(text)) return "migration";
  if (/gender|familie|sprache|kultur/.test(text)) return "gender_kulturkampf";
  if (/klima|öko|oek|grüne|gruene/.test(text)) return "klima";
  if (/eu|europa|zahlmeister/.test(text)) return "europa";
  if (/medien|presse/.test(text)) return "medien";
  if (/wissenschaft|experten|studien/.test(text)) return "wissenschaft";
  if (/souverän|souveraen|staat|parteien/.test(text)) return "demokratie";
  if (/wirtschaft|wohlstand|industrie/.test(text)) return "wirtschaft";
  return "sonstiges";
}

function inferNarrativeFamily(text: string): NarrativeFamily {
  if (/presse|medien/.test(text)) return "medienfeindbild";
  if (/wissenschaft|experten|studien/.test(text)) return "wissenschaftsdelegitimierung";
  if (/reset|umvolkung|bevölkerungsaustausch|bevoelkerungsaustausch|souverän|souveraen/.test(text)) return "elitenverschwoerung";
  if (/eu|fremdbestimmung|zahlmeister/.test(text)) return "souveraenitaetsverlust";
  if (/migration|islam|kriminal|terror|wohnungsnot/.test(text)) return "bedrohung";
  if (/sozial|buergergeld|bürgergeld/.test(text)) return "suendenbock";
  if (/gender|frühsexualisierung|fruehsexualisierung|familie|kultur/.test(text)) return "kulturkampf";
  if (/diktatur|verbot|zensur/.test(text)) return "freiheitsangst";
  if (/klima|wohlstand|deindustrialisierung/.test(text)) return "verzoegerung";
  if (/altparteien|volksverr/.test(text)) return "delegitimierung";
  return "sonstiges";
}

function inferEmotionalTrigger(text: string, family: NarrativeFamily): EmotionalTrigger {
  if (/kind|familie/.test(text)) return "schutzinstinkt";
  if (/verr|schmarotzer|wahn/.test(text)) return "ekel_abwertung";
  if (/diktatur|zensur|verbot/.test(text)) return "trotz";
  if (/kriminal|terror|islam|umvolkung|überfremdung|ueberfremdung/.test(text)) return "angst";
  if (/zahlmeister|wohlstand/.test(text)) return "kraenkung";
  if (family === "medienfeindbild" || family === "elitenverschwoerung") return "misstrauen";
  return "kontrollverlust";
}

function inferRiskDimensions(text: string, family: NarrativeFamily): RiskDimension[] {
  const risks = new Set<RiskDimension>(["diskursfaehigkeit", "gesellschaftlicher_zusammenhalt"]);
  if (/migration|islam|gender|kind|umvolkung|überfremdung|ueberfremdung/.test(text)) risks.add("minderheitenschutz").add("mensch");
  if (/klima|öko|oek/.test(text)) risks.add("planet");
  if (/wissenschaft|experten|studien/.test(text)) risks.add("wissenschaft").add("quellenklarheit");
  if (/presse|medien/.test(text)) risks.add("medienqualitaet").add("quellenklarheit");
  if (/eu|souverän|souveraen|parteien|volksverr|reset/.test(text) || family === "elitenverschwoerung") risks.add("demokratie").add("institutionelles_vertrauen");
  if (/terror|kriminal/.test(text)) risks.add("rechtsstaat").add("gewaltpotenzial");
  return [...risks];
}

function betterQuestionFor(text: string, family: NarrativeFamily): string {
  if (/wohnungsnot/.test(text)) return "Warum bauen und nutzen wir Wohnraum nicht so, dass alle ein Zuhause finden?";
  if (/gender|kind/.test(text)) return "Welche Bildung schützt Kinder wirklich: Angstbilder oder altersgerechte Aufklärung, Respekt und klare Schutzregeln?";
  if (family === "medienfeindbild") return "Welche konkrete Meldung prüfen wir und welche Quellen vergleichen wir?";
  if (family === "wissenschaftsdelegitimierung") return "Welche konkrete Studie, Methode und Korrektur prüfen wir?";
  if (family === "souveraenitaetsverlust") return "Welche Entscheidung liegt wo, wer kontrolliert sie und welche demokratischen Rechte gelten?";
  return "Welche Wirkung entsteht, wenn Menschen diesem Frame folgen, und welche bessere Frage öffnet die Rechnung?";
}

function positiveExampleFor(text: string, family: NarrativeFamily): string {
  if (/wohnungsnot/.test(text)) return "Eine Stadt schafft bezahlbaren, gut angebundenen Wohnraum und verhindert Konkurrenz zwischen Gruppen.";
  if (/gender|kind/.test(text)) return "Eine Schule stärkt Schutz, Respekt, altersgerechte Bildung und Hilfewege.";
  if (family === "medienfeindbild") return "Eine konkrete Meldung wird mit Methode, Quelle, Korrektur und Vergleich geprüft.";
  if (family === "wissenschaftsdelegitimierung") return "Forschung bleibt korrigierbar: Methode prüfen, Gegenstudien lesen, Unsicherheit markieren.";
  return "Ein konkreter Wirkungspfad ersetzt das Feindbild durch überprüfbare Entscheidung, Quelle und bessere Frage.";
}
