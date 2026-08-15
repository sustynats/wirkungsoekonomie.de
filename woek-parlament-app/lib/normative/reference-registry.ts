/**
 * The public normative reference registry is deliberately finite and
 * versioned in code. It is a lookup and validation aid, not a scoring table:
 * a mapping can make a relevant target or legal anchor visible, but never
 * creates an additional impact value.
 *
 * Source basis: SDG-/SDG+-Referenzrahmen v0.3 and the WÖk implementation
 * standard for the multi-level normative framework (2026-07-18).
 */

export const normativeFrameworks = ["SDG", "SDG_PLUS", "CONSTITUTIONAL_ANCHOR"] as const;
export type NormativeFramework = (typeof normativeFrameworks)[number];

export const constitutionalAnchorTypes = [
  "FUNDAMENTAL_RIGHT",
  "STATE_STRUCTURE_PRINCIPLE",
  "STATE_OBJECTIVE",
  "PROTECTION_DUTY",
  "EU_PRIMARY_LAW",
  "HUMAN_RIGHTS",
  "STATE_CONSTITUTION"
] as const;
export type ConstitutionalAnchorType = (typeof constitutionalAnchorTypes)[number];

export type NormativeReference = {
  id: string;
  framework: NormativeFramework;
  code: string;
  label: string;
  shortDescription: string;
  sourceSlug: string;
  constitutionalAnchorType?: ConstitutionalAnchorType;
  legalReference?: string;
};

const sdgs: NormativeReference[] = [
  ["SDG_01", "SDG 1", "Keine Armut"],
  ["SDG_02", "SDG 2", "Kein Hunger"],
  ["SDG_03", "SDG 3", "Gesundheit und Wohlergehen"],
  ["SDG_04", "SDG 4", "Hochwertige Bildung"],
  ["SDG_05", "SDG 5", "Geschlechtergleichstellung"],
  ["SDG_06", "SDG 6", "Sauberes Wasser und Sanitäreinrichtungen"],
  ["SDG_07", "SDG 7", "Bezahlbare und saubere Energie"],
  ["SDG_08", "SDG 8", "Menschenwürdige Arbeit und nachhaltige wirtschaftliche Entwicklung"],
  ["SDG_09", "SDG 9", "Industrie, Innovation und Infrastruktur"],
  ["SDG_10", "SDG 10", "Weniger Ungleichheiten"],
  ["SDG_11", "SDG 11", "Nachhaltige Städte und Gemeinden"],
  ["SDG_12", "SDG 12", "Nachhaltiger Konsum und Produktion"],
  ["SDG_13", "SDG 13", "Klimaschutz"],
  ["SDG_14", "SDG 14", "Leben unter Wasser"],
  ["SDG_15", "SDG 15", "Leben an Land"],
  ["SDG_16", "SDG 16", "Frieden, Gerechtigkeit und starke Institutionen"],
  ["SDG_17", "SDG 17", "Partnerschaften zur Erreichung der Ziele"]
].map(([id, code, label]) => ({
  id,
  framework: "SDG" as const,
  code,
  label,
  shortDescription: "Global vereinbartes Ziel der Agenda 2030.",
  sourceSlug: "agenda-2030-sdgs"
}));

const sdgPlus: NormativeReference[] = [
  ["SDG_PLUS_DEMOCRACY", "SDG+", "Demokratie", "Demokratische Teilhabe, Machtbegrenzung und öffentliche Korrektur."],
  ["SDG_PLUS_MEDIA_QUALITY", "SDG+", "Medienqualität", "Überprüfbare, vielfältige und kontextualisierte öffentliche Information."],
  ["SDG_PLUS_RULE_OF_LAW", "SDG+", "Rechtsstaatlichkeit", "Rechtliche Begrenzung von Macht, wirksame Grundrechte und zugänglicher Rechtsschutz."],
  ["SDG_PLUS_DISCOURSE_CAPACITY", "SDG+", "Diskursfähigkeit", "Fähigkeit, Widerspruch und Zielkonflikte offen sowie korrekturfähig zu verhandeln."],
  ["SDG_PLUS_INSTITUTIONAL_TRUST", "SDG+", "Institutionelles Vertrauen", "Begründete Erwartung kompetenten, fairen, transparenten und rechenschaftspflichtigen Handelns."],
  ["SDG_PLUS_SOCIAL_COHESION", "SDG+", "Gesellschaftlicher Zusammenhalt", "Pluraler Zusammenhalt, Zugehörigkeit, Sicherheit, Teilhabe und faire Behandlung."],
  ["SDG_PLUS_DIGITAL_SELF_DETERMINATION", "SDG+", "Digitale Selbstbestimmung", "Digitale Räume, Daten und automatisierte Entscheidungen verstehen, nutzen, kontrollieren und sich gegen Ausschluss schützen können."]
].map(([id, code, label, shortDescription]) => ({
  id,
  framework: "SDG_PLUS" as const,
  code,
  label,
  shortDescription,
  sourceSlug: "sdg-plus-referenzrahmen"
}));

const constitutionalAnchors: NormativeReference[] = [
  {
    id: "GG_FUNDAMENTAL_RIGHTS",
    framework: "CONSTITUTIONAL_ANCHOR",
    code: "Grundrechte",
    label: "Menschenwürde, Freiheit, Gleichheit und Rechtsschutz",
    shortDescription: "Schutz- und Abwägungsgrenzen für staatliches Handeln; keine zusätzliche Wirkungspunktzahl.",
    sourceSlug: "grundgesetz-bundesrepublik-deutschland",
    constitutionalAnchorType: "FUNDAMENTAL_RIGHT"
  },
  {
    id: "GG_ART_20_STATE_STRUCTURE",
    framework: "CONSTITUTIONAL_ANCHOR",
    code: "GG Art. 20",
    label: "Demokratischer und sozialer Rechtsstaat",
    shortDescription: "Staatsstrukturprinzipien: Demokratie, Sozialstaat, Rechtsstaat und Bundesstaat.",
    sourceSlug: "grundgesetz-bundesrepublik-deutschland",
    constitutionalAnchorType: "STATE_STRUCTURE_PRINCIPLE",
    legalReference: "Art. 20 GG"
  },
  {
    id: "GG_ART_3_2_EQUALITY",
    framework: "CONSTITUTIONAL_ANCHOR",
    code: "GG Art. 3 Abs. 2",
    label: "Tatsächliche Gleichberechtigung",
    shortDescription: "Ausdrücklicher Verfassungsauftrag zur Förderung der tatsächlichen Durchsetzung der Gleichberechtigung.",
    sourceSlug: "grundgesetz-bundesrepublik-deutschland",
    constitutionalAnchorType: "STATE_OBJECTIVE",
    legalReference: "Art. 3 Abs. 2 Satz 2 GG"
  },
  {
    id: "GG_ART_20A_NATURAL_FOUNDATIONS",
    framework: "CONSTITUTIONAL_ANCHOR",
    code: "GG Art. 20a",
    label: "Natürliche Lebensgrundlagen",
    shortDescription: "Generationenbezogener Schutzauftrag für die natürlichen Lebensgrundlagen.",
    sourceSlug: "grundgesetz-bundesrepublik-deutschland",
    constitutionalAnchorType: "PROTECTION_DUTY",
    legalReference: "Art. 20a GG"
  },
  {
    id: "GG_ART_20A_ANIMAL_PROTECTION",
    framework: "CONSTITUTIONAL_ANCHOR",
    code: "GG Art. 20a",
    label: "Tierschutz und Tierwohl",
    shortDescription: "Tiere sind ausdrücklich geschützt. Tierwohl wird getrennt von Biodiversität geführt und nie als deren bloße Unterkategorie behandelt.",
    sourceSlug: "grundgesetz-bundesrepublik-deutschland",
    constitutionalAnchorType: "PROTECTION_DUTY",
    legalReference: "Art. 20a GG"
  },
  {
    id: "GG_ART_23_EUROPEAN_INTEGRATION",
    framework: "CONSTITUTIONAL_ANCHOR",
    code: "GG Art. 23",
    label: "Europäische Einigung",
    shortDescription: "Verfassungsauftrag im Rahmen der europäischen Zusammenarbeit und Integration.",
    sourceSlug: "grundgesetz-bundesrepublik-deutschland",
    constitutionalAnchorType: "STATE_OBJECTIVE",
    legalReference: "Art. 23 Abs. 1 GG"
  },
  {
    id: "GG_ART_109_2_MACROECONOMIC_BALANCE",
    framework: "CONSTITUTIONAL_ANCHOR",
    code: "GG Art. 109 Abs. 2",
    label: "Gesamtwirtschaftliches Gleichgewicht",
    shortDescription: "Orientierungsauftrag für die Haushaltswirtschaft im gesamtwirtschaftlichen Gleichgewicht.",
    sourceSlug: "grundgesetz-bundesrepublik-deutschland",
    constitutionalAnchorType: "STATE_OBJECTIVE",
    legalReference: "Art. 109 Abs. 2 GG"
  },
  {
    id: "AEUV_ART_13_ANIMAL_WELFARE",
    framework: "CONSTITUTIONAL_ANCHOR",
    code: "AEUV Art. 13",
    label: "Tiere als fühlende Wesen",
    shortDescription: "Für EU-bezogene Fälle: Anerkennung von Tieren als fühlende Wesen und Berücksichtigung ihres Wohlergehens.",
    sourceSlug: "eu-vertraege-und-grundrechte",
    constitutionalAnchorType: "EU_PRIMARY_LAW",
    legalReference: "Art. 13 AEUV"
  }
];

export const normativeReferenceRegistry = [...sdgs, ...sdgPlus, ...constitutionalAnchors] as const;

const referenceById = new Map(normativeReferenceRegistry.map((entry) => [entry.id, entry]));

export function getNormativeReference(id: string) {
  return referenceById.get(id);
}

export function isNormativeReferenceId(value: string) {
  return referenceById.has(value);
}

export function normativeReferencesForFramework(framework: NormativeFramework) {
  return normativeReferenceRegistry.filter((reference) => reference.framework === framework);
}
