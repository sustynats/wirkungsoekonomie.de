import { humanizeSystemValue } from "@/lib/presentation/labels";

type Value = string | number | boolean | null | Value[] | { [key: string]: Value };

const labels: Record<string, string> = {
  commitment_key: "Kennung der Zusage",
  source_page: "Seite in der Originalquelle",
  source_location: "Fundstelle in der Originalquelle",
  exact_text: "Vollständiger Wortlaut",
  commitment_type: "Art der Zusage",
  temporal_scope: "Genannter Zeitraum",
  policy_domains: "Politikfelder",
  implementation_level: "Umsetzungsebene",
  dependencies: "Genannte Voraussetzungen",
  source_ref: "Quellenkennung",
  impact_paths: "Dokumentierte Wirkpfade",
  normative_mapping: "Zuordnung zum Referenzrahmen",
  mpd_dimensions: "Wirkungsräume Mensch · Planet · Demokratie",
  protection_gates: "Schutz- und Prüfgrenzen",
  data_and_method_gaps: "Daten- und Methodenlücken",
  commitment_text: "Wortlaut der Zusage",
  policy_fields: "Politikfelder",
  policy_field: "Primäres Politikfeld",
  conditions: "Bedingungen",
  time_horizon: "Zeithorizont",
  impact_path_id: "Kennung des Wirkpfads",
  lever: "Ausgangspunkt / Instrument",
  mechanism: "Möglicher Wirkmechanismus",
  expected_change: "Erwartete Zustandsveränderung",
  direction: "Richtung",
  evidence_status: "Evidenzstatus",
  risks: "Risiken",
  counterfactual: "Vergleich ohne diese Zusage",
  sdg_mappings: "Zuordnung zu SDGs",
  sdg_plus_mappings: "Zuordnung zu SDG+",
  constitutional_anchor_mappings: "Verfassungsrechtliche Prüfanker"
};

function populated(value: Value | undefined): value is Value {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function labelFor(key: string) {
  return labels[key] ?? key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("de-DE"));
}

function displayPrimitive(value: string | number | boolean) {
  if (typeof value === "boolean") return value ? "Ja" : "Nein";
  if (typeof value === "number") return new Intl.NumberFormat("de-DE").format(value);
  return humanizeSystemValue(value);
}

function ContentValue({ value, level = 0 }: { value: Value; level?: number }) {
  if (!populated(value)) return <span className="full-review-empty">Nicht ausgewiesen</span>;
  if (typeof value !== "object") return <>{displayPrimitive(value)}</>;
  if (Array.isArray(value)) {
    const primitive = value.every((item) => item === null || typeof item !== "object");
    if (primitive) return <ul className="full-review-list">{value.filter(populated).map((item, index) => <li key={`${String(item)}-${index}`}><ContentValue value={item} level={level + 1} /></li>)}</ul>;
    return <ol className="full-review-record-list">{value.filter(populated).map((item, index) => <li key={`record-${index}`}><ContentValue value={item} level={level + 1} /></li>)}</ol>;
  }
  const entries = Object.entries(value as Record<string, Value>).filter(([, nested]) => populated(nested));
  return <dl className={`full-review-fields full-review-fields--level-${Math.min(level, 3)}`}>{entries.map(([key, nested]) => <div key={key}><dt>{labelFor(key)}</dt><dd><ContentValue value={nested} level={level + 1} /></dd></div>)}</dl>;
}

export function CompleteSourceRecord({ record }: { record: Record<string, unknown> }) {
  return <ContentValue value={record as Value} />;
}
