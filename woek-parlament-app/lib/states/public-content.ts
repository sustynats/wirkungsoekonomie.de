import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

export type StatePublicContent = {
  review?: StateReviewMeta;
  mandate?: StateMandateMeta;
  electionField?: ElectionFieldMeta;
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
      status: "Mandatsbasis verifiziert; vollständige Commitment-Zerlegung wird fortlaufend ergänzt.",
    },
  },
  "rheinland-pfalz": {
    review: {
      area: "regierung",
      statusLabel: "FACHANALYSE VORHANDEN",
      shortLabel: "4 initial freigegebene Wirkungsfälle der neuen Landesregierung",
      approvedAt: "18.08.2026",
      sourcePath: "/WOEK/WOEK-LAENDER-DAILY/FACHREVIEW/rheinland-pfalz/INITIAL-IMPACT-CASES-2026-08-18.md",
      repoPath: "data/states/rheinland-pfalz/approved-review-2026-08-18.md",
      caseCount: 4,
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
      officialFieldDetail: "Die Fachanalyse ist materialitätsorientiert und noch nicht deckungsgleich mit dem vollständigen amtlichen Kandidatenfeld. Fehlende finale Programme bleiben sichtbar offen.",
      officialSourceUrl: "https://www.berlin.de/wahlen/pressemitteilungen/2026/pressemitteilung.1697177.php",
      sourceAsOf: "24.07.2026",
    },
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
      officialFieldLabel: "19 Landeslisten zugelassen",
      officialFieldDetail: "Das initiale Fachreview enthält bereits die materialitätsstarken Programme und Themen, erhebt aber noch keinen Vollständigkeitsanspruch für alle 19 zugelassenen Landeslisten.",
      officialSourceUrl: "https://www.laiv-mv.de/Wahlen/Pressemitteilungen/",
      sourceAsOf: "31.07.2026",
    },
  },
};

export function statePublicContentBySlug(slug: string) {
  return statePublicContent[slug];
}

export function loadApprovedStateReview(slug: string) {
  const review = statePublicContent[slug]?.review;
  if (!review) return null;
  const absolutePath = resolve(process.cwd(), review.repoPath);
  return {
    meta: review,
    markdown: readFileSync(absolutePath, "utf8"),
  };
}
