import Link from "next/link";
import type { ReactNode } from "react";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import type { PublicFullReview } from "@/data/cases";
import { humanizeSystemValue } from "@/lib/presentation/labels";

const sectionLabels: Record<string, string> = {
  decision: "Entscheidungsgegenstand und amtliche Grundlage",
  source_completeness: "Quellenvollständigkeit",
  ex_ante: "Ex-ante-Wirkungsanalyse",
  ex_post: "Beobachtete Entwicklung und Ex-post-Perspektive",
  impact_paths: "Wirkpfade",
  impact_domains: "Wirkungsräume und betroffene Bereiche",
  normative_mapping: "Normativer Referenzrahmen",
  calculation_requirements: "Berechnungen und erforderliche Eingaben",
  risks: "Wirkungsrisiken und Nebenwirkungen",
  non_compensable_boundaries: "Schutzgrenzen und Nichtkompensation",
  counterarguments: "Gegenargumente und Gegenprüfung",
  counterfactuals: "Gegenfakta und Vergleichsfragen",
  data_gaps: "Datenlücken",
  source_conflicts: "Quellenkonflikte",
  retrospective: "Historische Rückkopplung und Lernen",
  cross_case_links: "Querverbindungen zu anderen Fällen",
  provenance: "Fassung, Herkunft und Vollständigkeitsnachweis",
  woek_reference_snapshot: "Referenzsnapshot der Wirkungsökonomie",
  release_1_0: "Freigabestand",
  public_summary: "Freigegebene Orientierungsebene"
};

const fieldLabels: Record<string, string> = {
  review_id: "Review-ID",
  review_type: "Prüftyp",
  input_package_hash: "Prüfhash der Eingabe",
  previous_review_id: "Vorheriger Review",
  analysis_version: "Analyseversion",
  generated_at: "Analyse- und Prüfstand",
  review_status: "Fachlicher Bearbeitungsstand",
  source_refs_used: "Verwendete Quellen-IDs",
  review_generated_at: "Fachlicher Prüfstand",
  source_id: "Quellen-ID",
  document_date: "Veröffentlichungsdatum",
  retrieved_at: "Abgerufen bzw. geprüft",
  document_type: "Dokumenttyp",
  temporal_class: "Zeitliche Klasse",
  relevant_locations: "Relevante Fundstellen",
  official_objective: "Amtlich benanntes Ziel",
  scope_statement: "Prüfgegenstand und Abgrenzung",
  overall_potential: "Wirkungspotenzial",
  evidence_boundary: "Evidenzgrenze",
  evidence_status: "Evidenzstatus",
  affected_groups: "Betroffene Gruppen",
  affected_mpd_dimensions: "Mensch – Planet – Demokratie",
  risks_and_side_effects: "Risiken und Nebenwirkungen",
  prerequisites: "Voraussetzungen",
  change_lever_for_positive_net_impact: "Stellschraube für positive Netto-Wirkung",
  causal_rule: "Regel für die Zurechnung",
  gate_status: "Status der Schutzgrenze",
  source_refs: "Quellen-IDs",
  impact_path_refs: "Wirkpfad-Referenzen",
  woek_ids: "WÖk-IDs",
  sdgs: "SDGs",
  sdg_plus: "SDG+",
  human: "Mensch",
  planet: "Planet",
  democracy: "Demokratie"
};

function readableKey(value: string) {
  return fieldLabels[value] ?? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("de-DE"));
}

function populated(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.some(populated);
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(populated);
  return true;
}

function InlineValue({ value }: { value: string }) {
  const parts = value.split(/(https:\/\/[^\s]+)/g);
  return <>{parts.map((part, index) => /^https:\/\//.test(part)
    ? <Link key={`${part}-${index}`} href={sourceDetailHrefForUrl(part)}>{part}</Link>
    : humanizeSystemValue(part))}</>;
}

function ContentValue({ value, level = 0 }: { value: unknown; level?: number }): ReactNode {
  if (!populated(value)) return <span className="full-review-empty">Nicht ausgewiesen</span>;
  if (typeof value === "string") return <InlineValue value={value} />;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    const primitive = value.every((item) => typeof item === "string" || typeof item === "number" || typeof item === "boolean");
    if (primitive) return <ul className="full-review-list">{value.map((item, index) => <li key={`${String(item)}-${index}`}><ContentValue value={item} level={level + 1} /></li>)}</ul>;
    return <ol className="full-review-record-list">{value.map((item, index) => <li key={`record-${index}`}><ContentValue value={item} level={level + 1} /></li>)}</ol>;
  }
  const entries = Object.entries(value as Record<string, unknown>).filter(([, nested]) => populated(nested));
  return <dl className={`full-review-fields full-review-fields--level-${Math.min(level, 3)}`}>{entries.map(([key, nested]) => <div key={key}><dt>{readableKey(key)}</dt><dd><ContentValue value={nested} level={level + 1} /></dd></div>)}</dl>;
}

function SourceManifest({ sources }: { sources: PublicFullReview["sourceManifest"] }) {
  if (sources.length === 0) return null;
  return <section className="full-review-section" id="vollstaendige-quellen" aria-labelledby="vollstaendige-quellen-title">
    <p className="eyebrow">Vollständige Quellenliste</p><h3 id="vollstaendige-quellen-title">Quellen, Fundstellen und zeitliche Einordnung</h3>
    <div className="full-review-source-list">{sources.map((source, index) => {
      const url = typeof source.url === "string" ? source.url : "";
      const title = typeof source.title === "string" ? source.title : "Amtliche bzw. fachliche Quelle";
      return <article key={`${String(source.source_id)}-${index}`}><h4>{url ? <Link href={sourceDetailHrefForUrl(url)}>{title}</Link> : title}</h4><ContentValue value={source} /></article>;
    })}</div>
  </section>;
}

/**
 * This is the source-fidelity layer for a reviewed parliamentary case. The
 * orientation components above it may reorganise content, but this component
 * recursively renders every nonempty approved review field in the DOM.
 */
export function FullReviewRecord({ review }: { review: PublicFullReview }) {
  const sectionEntries = Object.entries(review.result).filter(([key, value]) => populated(value) && !["schema_version", "review_id", "case_id", "review_type", "input_package_hash", "previous_review_id", "analysis_version", "generated_at", "review_status"].includes(key));
  const provenanceEntries = Object.fromEntries(Object.entries(review.result).filter(([key, value]) => populated(value) && ["schema_version", "review_id", "case_id", "review_type", "input_package_hash", "previous_review_id", "analysis_version", "generated_at", "review_status"].includes(key)));
  return <section className="full-review" aria-labelledby="full-review-title">
    <header><div><p className="eyebrow">Vollständige Fachakte</p><h2 id="full-review-title">Schnell orientieren. Vollständig nachprüfen.</h2><p>Diese Ebene übernimmt alle freigegebenen, inhaltstragenden Felder der Fachakte. Sie ergänzt die Orientierung und Visualisierungen; sie kürzt, glättet oder ersetzt keine fachliche Aussage.</p></div><p className="full-review-hash"><strong>Fachakten-Hash</strong><br /><span>{review.sourceHash.slice(0, 16)}…</span></p></header>
    <nav className="full-review-toc" aria-label="Inhaltsverzeichnis der vollständigen Fachakte"><strong>Direkt zu einem Abschnitt</strong><ol>{sectionEntries.map(([key]) => <li key={key}><a href={`#fachakte-${key}`}>{sectionLabels[key] ?? readableKey(key)}</a></li>)}<li><a href="#vollstaendige-quellen">Quellen und Fundstellen</a></li><li><a href="#fachakte-provenienz">Fassung und Vollständigkeit</a></li></ol></nav>
    <div className="full-review-body">{sectionEntries.map(([key, value]) => <section className="full-review-section" id={`fachakte-${key}`} key={key} aria-labelledby={`fachakte-${key}-title`}><h3 id={`fachakte-${key}-title`}>{sectionLabels[key] ?? readableKey(key)}</h3><ContentValue value={value} /></section>)}</div>
    <SourceManifest sources={review.sourceManifest} />
    <section className="full-review-section" id="fachakte-provenienz" aria-labelledby="fachakte-provenienz-title"><p className="eyebrow">Nachweis der Fassung</p><h3 id="fachakte-provenienz-title">Fassung und Vollständigkeitsprüfung</h3><ContentValue value={provenanceEntries} /><dl className="full-review-fields"><div><dt>Quell-Hash</dt><dd>{review.sourceHash}</dd></div><div><dt>Hash inklusive Quellenmanifest</dt><dd>{review.sourceDocumentHash}</dd></div><div><dt>Inhaltspfad-Abdeckung</dt><dd>{review.renderedContentPaths.length} von {review.requiredContentPaths.length} inhaltstragenden Pfaden dargestellt</dd></div><div><dt>Nicht dargestellte Pfade</dt><dd>{review.unrenderedContentPaths.length === 0 ? "Keine" : review.unrenderedContentPaths.join(" · ")}</dd></div></dl></section>
  </section>;
}
