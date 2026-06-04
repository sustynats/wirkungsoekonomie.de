export type NormalizedTheme =
  | "migration"
  | "religion"
  | "gender_kulturkampf"
  | "klima"
  | "energie"
  | "europa"
  | "medien"
  | "wissenschaft"
  | "demokratie"
  | "sicherheit"
  | "bildung"
  | "gesundheit"
  | "wirtschaft"
  | "sozialstaat"
  | "nationalismus"
  | "verschwoerung"
  | "parteien_eliten"
  | "kultur_identitaet"
  | "sonstiges";

export type NarrativeFamily =
  | "bedrohung"
  | "suendenbock"
  | "opfer"
  | "wir_gegen_die"
  | "kontrollverlust"
  | "niedergang"
  | "kulturkampf"
  | "wissenschaftsdelegitimierung"
  | "medienfeindbild"
  | "elitenverschwoerung"
  | "souveraenitaetsverlust"
  | "freiheitsangst"
  | "verzoegerung"
  | "ohnmacht"
  | "spottbild"
  | "sicherheitsframe"
  | "werteverfall"
  | "delegitimierung"
  | "sonstiges";

export type LogicalPattern =
  | "falsche_kausalitaet"
  | "pauschalisierung"
  | "strohmann"
  | "falsche_dichotomie"
  | "uebertreibung"
  | "ad_hominem"
  | "zirkelschluss"
  | "verschwörung"
  | "scheinargument"
  | "whataboutism"
  | "rosinenpickerei"
  | "unbelegt"
  | "unklar";

export type EmotionalTrigger =
  | "angst"
  | "wut"
  | "kraenkung"
  | "ekel_abwertung"
  | "ohnmacht"
  | "kontrollverlust"
  | "statusverlust"
  | "schutzinstinkt"
  | "misstrauen"
  | "zugehoerigkeit"
  | "trotz"
  | "spott";

export type RiskDimension =
  | "mensch"
  | "planet"
  | "demokratie"
  | "rechtsstaat"
  | "medienqualitaet"
  | "wissenschaft"
  | "institutionelles_vertrauen"
  | "diskursfaehigkeit"
  | "minderheitenschutz"
  | "gesellschaftlicher_zusammenhalt"
  | "quellenklarheit"
  | "gewaltpotenzial";

export type PublicHandling =
  | "never_public_raw"
  | "public_only_contextualized"
  | "safe_as_claim_variant"
  | "needs_legal_review"
  | "needs_editorial_review";

export type NarrativeSeedStatus =
  | "raw_imported"
  | "normalized"
  | "duplicate"
  | "mapped_to_existing"
  | "candidate_new_dossier"
  | "candidate_new_narrative"
  | "blocked_toxic_raw"
  | "needs_review";

export type NarrativeSeed = {
  id: string;
  rawClaim: string;
  rawDescription?: string;
  rawCategory?: string;
  rawErrorType?: string;
  normalizedTheme: NormalizedTheme;
  narrativeFamily: NarrativeFamily;
  logicalPattern: LogicalPattern;
  logicalPatternNeedsReview?: boolean;
  emotionalTrigger: EmotionalTrigger;
  riskDimensions: RiskDimension[];
  publicHandling: PublicHandling;
  matchedDossierSlug?: string;
  suggestedDossierSlug?: string;
  matchedNarrativeSlug?: string;
  searchSynonyms: string[];
  hostGuidance?: {
    doNotSay: string[];
    betterQuestion: string;
    positiveExampleIdea: string;
  };
  status: NarrativeSeedStatus;
};

export type RawNarrativeSeed = {
  id: string;
  rawClaim: string;
  rawDescription?: string;
  rawCategory?: string;
  rawErrorType?: string;
  matchedDossierSlug?: string;
  suggestedDossierSlug?: string;
  matchedNarrativeSlug?: string;
  priority?: "P1" | "P2" | "P3";
  searchSynonyms?: string[];
};
