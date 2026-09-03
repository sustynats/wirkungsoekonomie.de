/* eslint-disable @next/next/no-img-element -- Fachanalyse-Abbildungen sind statische Quellenbestandteile und werden nicht über einen externen Bilddienst verarbeitet. */
import Link from "next/link";
import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import { humanizeSystemValue, isMarkdownSeparatorOnly, publicControlText } from "@/lib/presentation/labels";

type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; depth: 2 | 3; text: string; id: string }
  | { kind: "quote"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "figure"; src: string; alt: string; caption?: string };

export type FullAnalysisSource = {
  title: string;
  releasedAt: string;
  sourceHash: string;
  sourceDocumentHash?: string;
  markdown?: string;
  blocks?: Block[];
};

function slug(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Every source line becomes a public text block. The parser structures the
 * released source; it never summarizes or omits it. */
function toBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split("\n");
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flushParagraph = () => {
    if (paragraph.length > 0) blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push({ kind: "list", ...list });
    list = null;
  };
  for (const rawLine of lines.slice(1)) {
    const line = rawLine.trim();
    const heading = line.match(/^(##|###)\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    const unordered = line.match(/^-\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      blocks.push({ kind: "heading", depth: heading[1].length as 2 | 3, text: heading[2], id: slug(heading[2]) });
    } else if (line.startsWith("> ")) {
      flushParagraph(); flushList(); blocks.push({ kind: "quote", text: line.slice(2) });
    } else if (ordered || unordered) {
      flushParagraph();
      const orderedList = Boolean(ordered);
      if (!list || list.ordered !== orderedList) { flushList(); list = { ordered: orderedList, items: [] }; }
      list.items.push((ordered ?? unordered)![1]);
    } else if (!line || isMarkdownSeparatorOnly(line)) {
      flushParagraph(); flushList();
    } else {
      flushList(); paragraph.push(line);
    }
  }
  flushParagraph(); flushList();
  return blocks;
}

function InlineText({ value }: { value: string }) {
  const parts = value.split(/(https:\/\/[^\s]+|\*\*[^*]+\*\*|`[^`]+`)/g);
  return <>{parts.map((part, index) => {
    if (/^https:\/\//.test(part)) return <Link key={`${part}-${index}`} href={sourceDetailHrefForUrl(part)}>{part}</Link>;
    const controlValue = part.match(/^`([^`]+)`$/);
    if (controlValue) return <span key={`${part}-${index}`}>{publicControlText(controlValue[1])}</span>;
    const emphasis = part.match(/^\*\*(.+)\*\*$/);
    return emphasis
      ? <strong key={`${part}-${index}`}>{humanizeSystemValue(emphasis[1])}</strong>
      : humanizeSystemValue(part);
  })}</>;
}

export function FullAnalysisText({ source }: { source: FullAnalysisSource }) {
  const blocks = source.blocks ?? toBlocks(source.markdown ?? "");
  const chapters = blocks.filter((block): block is Extract<Block, { kind: "heading" }> => block.kind === "heading" && block.depth === 2);
  const firstChapterIndex = blocks.findIndex((block) => block.kind === "heading" && block.depth === 2);
  return <section className="full-analysis-text" aria-labelledby="full-analysis-title">
    <header>
      <div><p className="eyebrow">Vollständige Fachanalyse</p><h2 id="full-analysis-title">Der freigegebene Ausgangstext – vollständig dokumentiert</h2><p>Die Kapitel unten entsprechen dem veröffentlichten Fachtext. Diese Darstellung ordnet ihn nur für die Webansicht; sie ersetzt oder verkürzt ihn nicht.</p></div>
      <p className="full-analysis-hash"><strong>Quellfassung:</strong> {new Intl.DateTimeFormat("de-DE", { dateStyle: "long" }).format(new Date(`${source.releasedAt}T12:00:00Z`))}<br /><span>Prüfhash: {source.sourceHash.slice(0, 16)}…</span></p>
    </header>
    <nav className="full-analysis-toc" aria-label="Inhaltsverzeichnis der vollständigen Fachanalyse"><strong>Direkt zu einem Kapitel</strong><ol>{chapters.map((chapter) => <li key={chapter.id}><a href={`#${chapter.id}`}>{humanizeSystemValue(chapter.text)}</a></li>)}</ol></nav>
    <div className="full-analysis-body">{blocks.map((block, index) => {
      if (block.kind === "heading") {
        // Some released Fachakten start with an H3 metadata section before
        // their first H2 chapter. In the embedded web document that opening
        // section is promoted by one visual level to avoid a semantic jump;
        // wording and source order remain unchanged.
        const Heading = block.depth === 2 || (block.depth === 3 && (firstChapterIndex === -1 || index < firstChapterIndex)) ? "h3" : "h4";
        return <Heading id={block.id} key={`${block.id}-${index}`}>{humanizeSystemValue(block.text)}</Heading>;
      }
      if (block.kind === "quote") return <blockquote key={`quote-${index}`}><InlineText value={block.text} /></blockquote>;
      if (block.kind === "list") {
        const List = block.ordered ? "ol" : "ul";
        return <List key={`list-${index}`}>{block.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}><InlineText value={item} /></li>)}</List>;
      }
      if (block.kind === "table") {
        if (block.headers.length === 1 && block.rows.length === 0) return <blockquote key={`table-callout-${index}`}><InlineText value={block.headers[0]} /></blockquote>;
        return <div className="full-analysis-table" role="region" aria-label="Tabelle aus der vollständigen Fachanalyse" tabIndex={0} key={`table-${index}`}><table><thead><tr>{block.headers.map((header, headerIndex) => <th key={`${header}-${headerIndex}`} scope="col"><InlineText value={header} /></th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={`row-${rowIndex}`}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th key={`${cell}-${cellIndex}`} scope="row"><InlineText value={cell} /></th> : <td key={`${cell}-${cellIndex}`}><InlineText value={cell} /></td>)}</tr>)}</tbody></table></div>;
      }
      if (block.kind === "figure") return <figure className="full-analysis-figure" key={`figure-${index}`}><img src={block.src} alt={humanizeSystemValue(block.alt)} />{block.caption ? <figcaption>{humanizeSystemValue(block.caption)}</figcaption> : null}</figure>;
      if (isMarkdownSeparatorOnly(block.text)) return null;
      const technicalControl = block.text.match(/^`([^`]+)`$/);
      if (technicalControl && !publicControlText(technicalControl[1])) return null;
      return <p key={`paragraph-${index}`}><InlineText value={block.text} /></p>;
    })}</div>
  </section>;
}
