import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import berlinCurrentSourceRegister from "../../data/state-programmes/current-source-registers/berlin-2026.json";
import mvCurrentSourceRegister from "../../data/state-programmes/current-source-registers/mecklenburg-vorpommern-2026.json";

export type StateReviewArea = "regierung" | "wahl";

export type StateReviewMeta = {
  area: StateReviewArea;
  statusLabel: string;
  shortLabel: string;
  approvedAt: string;
  sourcePath: string;
  repoPath: string;
  caseCount: number;
};

export type StateMandateMeta = {
  title: string;
  period: string;
  partners: string;
  presentedAt: string;
  approvedAt: string;
  signedAt: string;
  governmentStart: string;
  sourceUrl: string;
  status: string;
};

export type ElectionFieldMeta = {
  electionDate: string;
  officialFieldLabel: string;
  officialFieldDetail: string;
  officialSourceUrl: string;
  sourceAsOf: string;
};

export type StateProgrammeSourceEntry = {
  party: string;
  field_scope: string;
  artifact_class: string;
  source_status: string;
  public_status_label: string;
  public_status_detail: string;
  source_urls: Array<{ label: string; url: string }>;
  final_election_programme_verified: boolean;
  source_available_for_election_corpus: boolean;
  canonicalization_pending: boolean;
  assessment_maturity: string;
};

export type StateProgrammeSourceRegister = {
  source_as_of: string;
  status: string;
  official_field: {
    admitted_party_count: number;
    official_source_url: string;
    official_source_date: string;
  };
  coverage: {
    classified_party_count: number;
    final_election_programme_verified_count: number;
    election_source_available_canonicalization_pending_count: number;
    final_election_programme_not_verified_count: number;
    source_available_for_election_corpus_count: number;
    full_final_election_programme_corpus_available: boolean;
    assessment_maturity: string;
  };
  preserved_fach_review: {
    materiality_theme_count: number;
  };
  parties: StateProgrammeSourceEntry[];
  descriptor_sha256: string;
};

export type StatePublicContent = {
  review?: StateReviewMeta;
  mandate?: StateMandateMeta;
  electionField?: ElectionFieldMeta;
  programmeSources?: StateProgrammeSourceRegister;
};

export const statePublicContent: Record<string, StatePublicContent> = {
  "baden-wuerttemberg": {
    review: {
      area: "regierung",
      statusLabel: "FACHANALYSE VORHANDEN",
      shortLabel: "5 initial freigegebene Wirkungsfälle der neuen Landesregierung",
      approvedAt: "18.08.2026",
      sourcePath: "/WOEK/WOEK-LAENDER-DAILY/FACHREVIEW/baden-wuerttemberg/INITIAL-IMPACT-CASES-2026-08-18.md",
      repoPath: "data/states/baden-wuerttemberg/approved-review-2026-08-18.md",
      caseCount: 5,
    },
    mandate: {
      title: "Aus Verantwortung fürs Land - Gemeinsam stark in stürmischen Zeiten",
      period: "2026-2031",
      partners: "BÜNDNIS 90/DIE GRÜNEN + CDU",
      presentedAt: "06.05.2026",
      approvedAt: "09.05.2026",
      signedAt: "11.05.2026",
      governmentStart: "13.05.2026",
      sourceUrl: "https://www.baden-wuerttemberg.de/de/regierung/koalitionsvertrag-fuer-baden-wuerttemberg",
      status: "Alle 15 Kapitel sind hochmaterial geprüft; 1.577 atomare Zusagen sind vollständig fundstellengebunden erfasst. Kapitel 1 bis 3 liegen vertieft vor.",
    },
  },
  "rheinland-pfalz": {
    review: {
      area: "regierung",
      statusLabel: "FACHANALYSE VORHANDEN",
      shortLabel: "5 freigegebene Wirkungsfälle der neuen Landesregierung",
      approvedAt: "20.08.2026",
      sourcePath: "/WOEK/WOEK-LAENDER-DAILY/FACHREVIEW/rheinland-pfalz/INITIAL-IMPACT-CASES-2026-08-18.md + Issue #240 Fachreview 5362806111",
      repoPath: "data/states/rheinland-pfalz/approved-review-2026-08-18.md",
      caseCount: 5,
    },
    mandate: {
      title: "Gemeinsame Verantwortung für ein starkes Rheinland-Pfalz",
      period: "2026-2031",
      partners: "CDU + SPD",
      presentedAt: "nicht separat nachgewiesen",
      approvedAt: "nicht separat nachgewiesen",
      signedAt: "nicht byte-stabil nachgewiesen",
      governmentStart: "18.05.2026",
      sourceUrl: "https://www.spd-rlp.de/wp-content/uploads/sites/1649/2026/04/KoaV_2026-2031.pdf",
      status: "Alle neun Kapitel sind hochmaterial geprüft. 1.254 explizit fachlich übergebene Zusagen aus allen neun Kapiteln sind fundstellengebunden erfasst; die Quellenabdeckung ist vollständig, Einzelwirkungsanalysen bleiben davon getrennt.",
    },
  },
  berlin: {
    review: {
      area: "wahl",
      statusLabel: "WAHLPROGRAMME IN ANALYSE",
      shortLabel: "6 materialitätsstarke Themenfelder fachlich eingeordnet",
      approvedAt: "18.08.2026",
      sourcePath: "/WOEK/WOEK-LAENDER-DAILY/FACHREVIEW/berlin/INITIAL-PROGRAMME-IMPACT-REVIEW-2026-08-18.md",
      repoPath: "data/states/berlin/approved-review-2026-08-18.md",
      caseCount: 6,
    },
    electionField: {
      electionDate: "20.09.2026",
      officialFieldLabel: "17 Parteien mit zugelassenen Landes- oder Bezirkslisten",
      officialFieldDetail: "Alle 17 zugelassenen Parteien sind im aktuellen Quellenstand klassifiziert: 9 finale Wahlprogramme sind verifiziert, 3 Wahlprogramm-/Manifestquellen warten noch auf exakte Kanonisierung und für 5 Parteien ist kein finales Berlin-2026-Vollprogramm verifiziert. Das ist vollständige Quellenklassifikation, kein Vollreview aller Programme.",
      officialSourceUrl: "https://www.berlin.de/wahlen/pressemitteilungen/2026/pressemitteilung.1697177.php",
      sourceAsOf: "24.07.2026",
    },
    programmeSources: berlinCurrentSourceRegister,
  },
  "mecklenburg-vorpommern": {
    review: {
      area: "wahl",
      statusLabel: "WAHLPROGRAMME IN ANALYSE",
      shortLabel: "8 materialitätsstarke Themenfelder fachlich eingeordnet",
      approvedAt: "18.08.2026",
      sourcePath: "/WOEK/WOEK-LAENDER-DAILY/FACHREVIEW/mecklenburg-vorpommern/INITIAL-PROGRAMME-IMPACT-REVIEW-2026-08-18.md",
      repoPath: "data/states/mecklenburg-vorpommern/approved-review-2026-08-18.md",
      caseCount: 8,
    },
    electionField: {
      electionDate: "20.09.2026",
      officialFieldLabel: "19 Landeslisten endgültig zugelassen",
      officialFieldDetail: "Alle 19 zugelassenen Landeslisten sind im aktuellen Quellenstand klassifiziert: 10 finale Wahlprogramme sind verifiziert, 3 Wahlprogrammquellen warten noch auf exakte Kanonisierung und für 6 Listen ist kein finales MV-2026-Vollprogramm verifiziert. Das ist vollständige Quellenklassifikation, kein Vollreview aller Programme.",
      officialSourceUrl: "https://www.laiv-mv.de/Wahlen/Pressemitteilungen/?id=222342&processor=processor.sa.pressemitteilung",
      sourceAsOf: "14.08.2026",
    },
    programmeSources: mvCurrentSourceRegister,
  },
};

const approvedReviewMarkdownBySlug: Record<string, string> = {
  "baden-wuerttemberg": readFileSync(resolve(process.cwd(), "data/states/baden-wuerttemberg/approved-review-2026-08-18.md"), "utf8"),
  "rheinland-pfalz": [
    readFileSync(resolve(process.cwd(), "data/states/rheinland-pfalz/approved-review-2026-08-18.md"), "utf8"),
    readFileSync(resolve(process.cwd(), "data/states/rheinland-pfalz/approved-review-hitzeschutz-2026-08-20.md"), "utf8"),
  ].join("\n\n"),
  berlin: readFileSync(resolve(process.cwd(), "data/states/berlin/approved-review-2026-08-18.md"), "utf8"),
  "mecklenburg-vorpommern": readFileSync(resolve(process.cwd(), "data/states/mecklenburg-vorpommern/approved-review-2026-08-18.md"), "utf8"),
};

export function statePublicContentBySlug(slug: string) {
  return statePublicContent[slug];
}

export function loadApprovedStateReview(slug: string) {
  const review = statePublicContent[slug]?.review;
  const markdown = approvedReviewMarkdownBySlug[slug];
  if (!review || !markdown) return null;
  return { meta: review, markdown };
}
