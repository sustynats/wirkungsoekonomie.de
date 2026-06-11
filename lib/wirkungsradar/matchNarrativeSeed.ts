import { RawRightWingNarrativeSeeds } from "../../content/wirkungsradar/narrative-seeds/raw-right-wing-narratives-de";
import { normalizeNarrativeSeed } from "../../content/wirkungsradar/narrative-seeds/narrative-seed-normalizer";
import type { NarrativeFamily, RiskDimension } from "../../content/wirkungsradar/narrative-seeds/narrative-seed-types";

export type NarrativeSeedMatch = {
  seedId: string | null;
  similarityScore: number;
  existingDossier?: string;
  narrativeFamily?: NarrativeFamily;
  publicDisplay: false;
  disposition: "duplicate_or_variant" | "candidate_new_dossier" | "needs_editorial_review" | "no_seed_match";
  riskFlags: string[];
  riskDimensions: RiskDimension[];
  humanTopicReview: boolean;
  conspiracyReview: boolean;
};

const normalizedSeeds = RawRightWingNarrativeSeeds.map(normalizeNarrativeSeed);

export function matchSeedClaim(claim: string): NarrativeSeedMatch {
  const queryTokens = tokenize(claim);
  let best = { score: 0, seed: normalizedSeeds[0] };

  for (const seed of normalizedSeeds) {
    const seedText = [seed.rawClaim, seed.rawDescription, ...seed.searchSynonyms].filter(Boolean).join(" ");
    const score = similarity(queryTokens, tokenize(seedText));
    if (score > best.score) best = { score, seed };
  }

  if (!best.seed || best.score < 0.38) {
    return {
      seedId: null,
      similarityScore: Number(best.score.toFixed(3)),
      publicDisplay: false,
      disposition: "no_seed_match",
      riskFlags: ["manual_triage"],
      riskDimensions: [],
      humanTopicReview: false,
      conspiracyReview: false,
    };
  }

  const riskFlags = ["never_public_raw"];
  if (best.score > 0.82) riskFlags.push("duplicate_or_variant");
  if (best.seed.publicHandling === "never_public_raw") riskFlags.push("toxic_raw_claim");
  if (best.seed.riskDimensions.includes("minderheitenschutz")) riskFlags.push("human_topic_review");
  if (best.seed.narrativeFamily === "elitenverschwoerung") riskFlags.push("conspiracy_review");

  return {
    seedId: best.seed.id,
    similarityScore: Number(best.score.toFixed(3)),
    existingDossier: best.seed.matchedDossierSlug,
    narrativeFamily: best.seed.narrativeFamily,
    publicDisplay: false,
    disposition: best.score > 0.82
      ? "duplicate_or_variant"
      : best.seed.suggestedDossierSlug
        ? "candidate_new_dossier"
        : "needs_editorial_review",
    riskFlags,
    riskDimensions: best.seed.riskDimensions,
    humanTopicReview: best.seed.riskDimensions.includes("minderheitenschutz"),
    conspiracyReview: best.seed.narrativeFamily === "elitenverschwoerung",
  };
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9äöüß]+/gi, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  return intersection / Math.sqrt(a.size * b.size);
}
