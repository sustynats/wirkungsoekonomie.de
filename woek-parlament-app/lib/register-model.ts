import type { ImpactSignatureData } from "./presentation/impact-signature";

export type RegisterObject = {
  id: string;
  sourceId: string;
  href: string;
  title: string;
  typeLabel: string;
  relevance?: string;
  finding: string;
  status: string;
  date: string | null;
  signature: ImpactSignatureData;
  /** Published collection context, not a claim of causal responsibility. */
  level: "bund" | "land" | "eu" | "offen";
  organ: "bundestag" | "bundesregierung" | "land" | "eu" | "offen";
  fields: string[];
  collections: string[];
};

export const registerFacets = [
  { key: "ebene", label: "Ebene" }, { key: "organ", label: "Organ" },
  { key: "wirkungsfeld", label: "Wirkungsfeld" }, { key: "richtung", label: "Richtung" },
  { key: "evidenz", label: "Evidenz" }, { key: "reifegrad", label: "Reifegrad" },
] as const;
export type RegisterFacet = typeof registerFacets[number]["key"];
export type RegisterFilters = Partial<Record<RegisterFacet | "bestand" | "q", string>>;

export const directionCategories = [
  { value: "positiv", label: "Positives Potenzial", symbol: "↗", kind: "positive" },
  { value: "gegenlaeufig", label: "Negatives Potenzial / Risiko", symbol: "↘", kind: "risk" },
  { value: "ambivalent", label: "Gegenläufige Pfade", symbol: "↙↗", kind: "ambivalent" },
  { value: "bedingt", label: "Bedingte Einordnung", symbol: "◇", kind: "conditional" },
  { value: "schutz", label: "Schutzgrenzen-Einordnung", symbol: "!", kind: "protection" },
  { value: "neutral", label: "Explizit neutral", symbol: "=", kind: "neutral" },
  { value: "offen", label: "Offen / nicht aggregierbar", symbol: "?", kind: "open" },
] as const;

export function directionCategory(item: RegisterObject) {
  return directionCategories.find((category) => category.kind === item.signature.direction.kind) ?? directionCategories.at(-1)!;
}

export function facetValues(item: RegisterObject, facet: RegisterFacet): string[] {
  switch (facet) {
    case "ebene": return [item.level];
    case "organ": return [item.organ];
    case "wirkungsfeld": return item.fields.length ? item.fields : ["offen"];
    case "richtung": return [directionCategory(item).value];
    case "evidenz": return [item.signature.evidence.grade === null ? "offen" : `stufe-${item.signature.evidence.grade}`];
    case "reifegrad": return [item.signature.maturity.phase ?? "offen"];
  }
}

const labels: Record<string, string> = {
  bund: "Bund", land: "Länder", eu: "Europäische Union", bundestag: "Bundestag",
  bundesregierung: "Bundesregierung", offen: "Offen / nicht zugeordnet",
  mensch: "Mensch", planet: "Planet", demokratie: "Demokratie",
  EX_ANTE: "Ex ante", IMPLEMENTATION: "In Umsetzung", OBSERVED: "Beobachtet", ATTRIBUTED: "Zugerechnet",
};

export function facetLabel(facet: RegisterFacet, value: string) {
  if (facet === "richtung") return directionCategories.find((category) => category.value === value)?.label ?? value;
  if (facet === "evidenz") return value === "offen" ? "Offen / nicht eingestuft" : `Stufe ${value.slice(-1)} von 4`;
  if (facet === "organ" && value === "land") return "Landesbezogener Bestand";
  if (facet === "organ" && value === "eu") return "EU-Bestand (organeübergreifend)";
  return labels[value] ?? value;
}

export function readRegisterFilters(query: Record<string, string | string[] | undefined>): RegisterFilters {
  return Object.fromEntries([...registerFacets.map((facet) => facet.key), "bestand", "q"].flatMap((key) => {
    const value = query[key];
    return typeof value === "string" && value.trim() ? [[key, value.trim()]] : [];
  }));
}

export function filterRegister(objects: RegisterObject[], filters: RegisterFilters) {
  return objects.filter((item) => (!filters.bestand || item.collections.includes(filters.bestand))
    && (!filters.q || `${item.title} ${item.finding}`.toLocaleLowerCase("de").includes(filters.q.toLocaleLowerCase("de")))
    && registerFacets.every(({ key }) => !filters[key] || facetValues(item, key).includes(filters[key]!)));
}

/** Absolute object counts, never a mean of effects, parties or evidence. */
export function directionDistribution(objects: RegisterObject[]) {
  return directionCategories.map((category) => ({ ...category, count: objects.filter((item) => directionCategory(item).value === category.value).length }));
}

export function registerFacetOptions(objects: RegisterObject[], filters: RegisterFilters, facet: RegisterFacet) {
  const { [facet]: ignored, ...otherFilters } = filters;
  void ignored;
  const candidates = filterRegister(objects, otherFilters);
  const values = new Set(["offen", ...objects.flatMap((item) => facetValues(item, facet))]);
  if (filters[facet]) values.add(filters[facet]!); // Invalid shared filters remain visible, never silently broadened.
  return [...values].sort((a, b) => facetLabel(facet, a).localeCompare(facetLabel(facet, b), "de"))
    .map((value) => ({ value, label: facetLabel(facet, value), count: candidates.filter((item) => facetValues(item, facet).includes(value)).length }));
}

/** Only exact pre-existing MPD labels; no prose/keyword inference. */
export function explicitRegisterFields(values: string[]) {
  const exact: Record<string, string> = { Mensch: "mensch", MENSCH: "mensch", Planet: "planet", PLANET: "planet", Demokratie: "demokratie", DEMOKRATIE: "demokratie" };
  return [...new Set(values.flatMap((value) => exact[value] ? [exact[value]] : []))];
}
