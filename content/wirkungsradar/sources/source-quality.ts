import type { ReliabilityTier, SourceCard } from "./source-types";

export const ReliabilityTierRules: Record<ReliabilityTier, string> = {
  A: "Primärquelle, amtliche Statistik, offizielle Institution, Peer-Review oder robuste Forschungsquelle.",
  B: "Etabliertes Forschungsinstitut, Fachagentur, internationale Organisation oder gut dokumentierte Sekundärquelle.",
  C: "Interessenakteur, Branchenquelle, NGO, Thinktank oder Medienquelle mit klarer Perspektive.",
  D: "Meinung, Debattenbeitrag oder unsichere Quelle; nur als Frame- oder Diskursbeleg nutzbar.",
};

export function sourceCanSupportFact(source: SourceCard): boolean {
  return source.reliabilityTier === "A" || source.reliabilityTier === "B";
}

export function requiresCompanionSource(source: SourceCard): boolean {
  return source.reliabilityTier === "C" || source.reliabilityTier === "D";
}
