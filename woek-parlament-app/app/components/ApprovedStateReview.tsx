import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import type { StateReviewMeta } from "@/lib/states/public-content";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import styles from "./ApprovedStateReview.module.css";

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "rule" };

type Section = { heading: Extract<Block, { type: "heading" }> | null; blocks: Block[] };

const publicReviewTermLabels: Record<string, string> = {
  AMBIVALENT_POSITIVE_POTENTIAL: "Gegenläufige Wirkungsrichtungen mit positivem Potenzial",
  BOUNDARY_REVIEW: "Schutzgrenzen werden geprüft",
  BOUNDARY_WATCH: "Schutzgrenzen besonders beobachten",
  EU_DEPENDENCY: "Abhängigkeit von europäischem Handeln",
  FACT_ONLY_OR_RELATIONSHIP_LAYER: "Fakten- oder Verknüpfungsebene",
  HIGHER_LAW: "Höherrangiges Recht ist zu prüfen",
  IMPACT_POTENTIAL_EX_ANTE: "Wirkungspotenzial vor der Umsetzung",
  INITIAL_FACHREVIEW: "Initialer Fachreview",
  INITIAL_MATERIALITY_REVIEW: "Initiale Materialitätsprüfung",
  LAND_FULL: "Vollständige Landeszuständigkeit",
  LAND_FULL_OR_HIGH: "Vollständige oder weitreichende Landeszuständigkeit",
  LAND_PARTIAL_SHARED: "Geteilte oder teilweise Landeszuständigkeit",
  LAND_ROUTE_WITH_CONSTRAINTS: "Landesweg mit rechtlichen oder praktischen Grenzen",
  LIKELY_NOT_IMPLEMENTABLE_AS_STATED: "In der vorliegenden Form voraussichtlich nicht umsetzbar",
  MUNICIPAL_DEPENDENCY: "Kommunale Mitwirkung erforderlich",
  NO_PROGRAMME_FOUND: "Noch kein Programm aus offizieller Quelle gefunden",
  OBSERVATION_ONLY: "Beobachtungsstand ohne Wirkungszurechnung",
  PORTFOLIO_CASE: "Heterogener Sammelgegenstand",
  POSITIVE_POTENTIAL_WITH_CONDITIONS: "Positives Potenzial unter Bedingungen",
  POSITIVE_POTENTIAL_WITH_MATERIAL_EXECUTION_RISK: "Positives Potenzial mit materiellem Umsetzungsrisiko",
  PROGRAMME_ANALYSIS: "Wahlprogrammanalyse",
  PROGRAMME_ANALYSIS_IN_PROGRESS: "Wahlprogrammanalyse in Arbeit",
  REALITY_CHECK_NOT_MATURE: "Reality Check noch nicht reif",
  REALITY_CHECK_NOT_YET_MATURE: "Reality Check noch nicht reif",
  REALITY_CHECK_PENDING: "Reality Check steht noch aus",
  REQUIRES_FEDERAL_FRAMEWORK: "Bundesrechtlicher Rahmen erforderlich",
  REQUIRES_FEDERAL_OR_EU_ACTION_FOR_GENERAL_BAN: "Für ein allgemeines Verbot ist Bundes- oder EU-Handeln erforderlich",
  SOURCE_NOT_YET_AVAILABLE: "Offizielle Quelle noch nicht verfügbar",
  CURRENT_GOVERNMENT_CONTRIBUTION_TO_INHERITED_POLICY_PATH: "Beitrag der aktuellen Regierung zu einem übernommenen Politikpfad",
  PROBLEM_WELL_SUPPORTED: "Problem durch belastbare Quellen gestützt",
  GOAL_SUPPORTED_WITH_OUTCOME_REFINEMENT: "Ziel plausibel; messbare Ergebnisziele müssen präzisiert werden",
  NOT_ASSESSABLE: "noch nicht bewertbar",
  DISAGGREGATION_REQUIRED: "Einzelmaßnahmen müssen getrennt geprüft werden",
  ASSESSMENT_AVAILABLE_WITH_OPEN_POINTS: "Bewertung mit offenen Prüfpunkten vorhanden",
  DO_NOT_SYNTHESIZE: "nicht technisch ableiten",
  BASELINE: "Ausgangslage",
  OUTCOME: "beobachtetes Ergebnis",
  DISTRIBUTION: "Verteilung",
  CONTEXT: "Kontext",
  REALITY_CHECK: "Reality Check",
  HIGH: "hoch",
  MEDIUM: "mittel",
  OPEN: "offen",
  attribution_status: "Zurechnungsstatus",
  problem_adequacy_status: "Status der Problemprüfung",
  goal_adequacy_status: "Status der Zielprüfung",
  RECOMMENDATION: "WÖk-Handlungsoption",
  RecommendationRecord: "WÖk-Handlungsvorschlag",
  GovernmentTerm: "Regierungszeitraum",
  AnalysisVersion: "Analysefassung",
  EvidenceEvents: "Evidenzereignisse",
  "DNS-Indicator-IDs": "DNS-Indikatoren",
};

function publicReviewText(value: string) {
  let publicValue = value;
  for (const [token, label] of Object.entries(publicReviewTermLabels).sort(([left], [right]) => right.length - left.length)) {
    publicValue = publicValue.replace(new RegExp(`\\b${token}\\b`, "g"), label);
  }
  return publicValue
    .replace(/\b(?:BW|BE|MV|RP|ST)-IMPACT-\d{4}-\d{2}(?:-[A-Z0-9-]+)?\b\s*[-–:]?\s*/g, "")
    .replace(/\b[A-Z][A-Z0-9]+(?:_[A-Z0-9]+)+\b/g, "");
}

function isBlockStart(line: string) {
  return /^#{1,6}\s/.test(line) || /^---+$/.test(line) || /^-\s+/.test(line) || /^\d+\.\s+/.test(line);
}

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const raw = lines[index];
    const line = raw.trim();
    if (!line) { index += 1; continue; }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) { blocks.push({ type: "heading", level: heading[1].length, text: heading[2] }); index += 1; continue; }
    if (/^---+$/.test(line)) { blocks.push({ type: "rule" }); index += 1; continue; }
    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^-\s+/.test(lines[index].trim())) { items.push(lines[index].trim().replace(/^-\s+/, "")); index += 1; }
      blocks.push({ type: "unordered-list", items }); continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) { items.push(lines[index].trim().replace(/^\d+\.\s+/, "")); index += 1; }
      blocks.push({ type: "ordered-list", items }); continue;
    }
    const paragraphLines = [raw.trimEnd()];
    index += 1;
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index].trim())) { paragraphLines.push(lines[index].trimEnd()); index += 1; }
    blocks.push({ type: "paragraph", text: paragraphLines.join("\n") });
  }
  return blocks;
}

function sectionsFrom(blocks: Block[]) {
  const sections: Section[] = [];
  let current: Section = { heading: null, blocks: [] };
  for (const block of blocks) {
    if (block.type === "heading" && block.level === 1) {
      if (current.heading || current.blocks.length) sections.push(current);
      current = { heading: block, blocks: [] };
    } else current.blocks.push(block);
  }
  if (current.heading || current.blocks.length) sections.push(current);
  return sections;
}

function stripTrailingUrlPunctuation(value: string) {
  let url = value;
  let suffix = "";
  while (/[.,;:]$/.test(url)) { suffix = url.slice(-1) + suffix; url = url.slice(0, -1); }
  return { url, suffix };
}

function renderInline(text: string): ReactNode[] {
  const tokens = publicReviewText(text).split(/(`[^`]+`|\*\*[^*]+\*\*|https?:\/\/[^\s]+)/g).filter(Boolean);
  return tokens.map((token, index) => {
    if (token.startsWith("`") && token.endsWith("`")) return <code className={styles.code} key={`${index}-${token}`}>{token.slice(1, -1)}</code>;
    if (token.startsWith("**") && token.endsWith("**")) return <strong key={`${index}-${token}`}>{token.slice(2, -2)}</strong>;
    if (/^https?:\/\//.test(token)) {
      const { url, suffix } = stripTrailingUrlPunctuation(token);
      return <Fragment key={`${index}-${token}`}><Link className={styles.link} href={sourceDetailHrefForUrl(url)}>Quellenakte öffnen</Link>{suffix}</Fragment>;
    }
    return <Fragment key={`${index}-${token}`}>{token}</Fragment>;
  });
}

function renderParagraph(text: string) {
  return text.split("\n").map((line, index) => <Fragment key={`${index}-${line}`}>{index > 0 ? <br /> : null}{renderInline(line)}</Fragment>);
}

function headingId(text: string, index: number) {
  const id = text.replace(/`|\*\*/g, "").toLocaleLowerCase("de-DE").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return `${id || "abschnitt"}-${index + 1}`;
}

function renderBlock(block: Block, index: number) {
  if (block.type === "rule") return <hr className={styles.rule} key={`rule-${index}`} />;
  if (block.type === "unordered-list") return <ul className={styles.list} key={`ul-${index}`}>{block.items.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>)}</ul>;
  if (block.type === "ordered-list") return <ol className={styles.list} key={`ol-${index}`}>{block.items.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}>{renderInline(item)}</li>)}</ol>;
  if (block.type === "paragraph") return <p className={styles.paragraph} key={`p-${index}`}>{renderParagraph(block.text)}</p>;
  const id = headingId(block.text, index);
  if (block.level === 1) return <h2 className={styles.title} id={id} key={`h-${index}`}>{renderInline(block.text)}</h2>;
  if (block.level === 2) return <h3 className={styles.heading} id={id} key={`h-${index}`}>{renderInline(block.text)}</h3>;
  if (block.level === 3) return <h4 className={styles.subheading} id={id} key={`h-${index}`}>{renderInline(block.text)}</h4>;
  return <h4 className={styles.minorHeading} id={id} key={`h-${index}`}>{renderInline(block.text)}</h4>;
}

function teaser(section: Section) {
  const sanitize = (value: string) => publicReviewText(value)
    .replace(/\*\*|`/g, "")
    .replace(/https?:\/\/\S+/g, "Quellenakte")
    .replace(/\s+/g, " ")
    .trim();
  const impactIndex = section.blocks.findIndex((block) => block.type === "heading" && /Wirkungskern|Vorläufige WÖk-Einordnung|Vorläufige Einordnung/i.test(block.text));
  if (impactIndex >= 0) {
    const paragraph = section.blocks.slice(impactIndex + 1).find((block): block is Extract<Block, { type: "paragraph" }> => block.type === "paragraph");
    if (paragraph) return sanitize(paragraph.text).slice(0, 260);
  }
  const firstParagraph = section.blocks.find((block): block is Extract<Block, { type: "paragraph" }> => block.type === "paragraph");
  return firstParagraph ? sanitize(firstParagraph.text).slice(0, 260) : "Fachlich freigegebener Wirkungsgegenstand";
}

export default function ApprovedStateReview({ markdown, meta }: { markdown: string; meta: StateReviewMeta }) {
  const blocks = parseMarkdown(markdown);
  const sections = sectionsFrom(blocks);
  const intro = sections[0] ?? { heading: null, blocks: [] };
  const cases = sections.slice(1).filter((section) => /\b(?:BW|BE|MV|RP|ST)-IMPACT-\d{4}-\d{2}\b/.test(section.heading?.text ?? ""));
  const publicationNotes = sections.slice(1).filter((section) => !cases.includes(section));
  return <section aria-labelledby="vollstaendige-fachanalyse">
    <div className={styles.sourceBox}>
      <p className={styles.eyebrow}>Freigegebener Länder-Fachstand</p>
      <strong id="vollstaendige-fachanalyse">{meta.statusLabel}</strong>
      <div className={styles.metaRow}><span>{meta.caseCount} Wirkungsgegenstände</span><span>Freigabe: {meta.approvedAt}</span></div>
      <p>Die Lesefassung strukturiert den freigegebenen Fachtext für Menschen. Aussage, Quellen und Fachinhalt bleiben unverändert.</p>
      <details className={styles.technical}><summary>Technischen Herkunftsnachweis anzeigen</summary><p><code>{meta.sourcePath}</code></p></details>
    </div>

    {cases.length > 0 && <nav className={styles.jumpNav} aria-label="Sprungnavigation der Länderanalyse">
      {cases.slice(0, 14).map((section, index) => <a key={`${index}-${section.heading?.text}`} href={`#${headingId(section.heading?.text ?? `Fall ${index + 1}`, index + 100)}`}>{renderInline(section.heading?.text ?? `Fall ${index + 1}`)}</a>)}
    </nav>}

    <article className={styles.document}>
      {intro.heading ? renderBlock(intro.heading, 0) : null}
      {intro.blocks.map((block, index) => renderBlock(block, index + 1))}
    </article>

    {cases.length > 0 ? <div className={styles.caseList}>
      {cases.map((section, index) => {
        const id = headingId(section.heading?.text ?? `Fall ${index + 1}`, index + 100);
        return <details className={styles.caseSection} id={id} key={`${index}-${section.heading?.text}`}>
          <summary><span><span className={styles.caseIndex}>{String(index + 1).padStart(2, "0")}</span><strong>{renderInline(section.heading?.text ?? `Wirkungsgegenstand ${index + 1}`)}</strong><small>{teaser(section)}{teaser(section).length >= 260 ? "…" : ""}</small></span></summary>
          <div className={styles.caseBody}>{section.blocks.map((block, blockIndex) => renderBlock(block, blockIndex + 1000 + index * 100))}</div>
        </details>;
      })}
    </div> : null}

    {publicationNotes.map((section, index) => <article className={styles.document} key={`${index}-${section.heading?.text}`}>
      {section.heading ? renderBlock(section.heading, index + 5000) : null}
      {section.blocks.map((block, blockIndex) => renderBlock(block, blockIndex + 5100 + index * 100))}
    </article>)}
  </section>;
}
