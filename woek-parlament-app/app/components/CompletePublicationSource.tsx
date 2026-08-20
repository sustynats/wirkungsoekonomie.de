import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";
import type { CompletePublicationSource as PublicationSource } from "@/lib/publication/fachakten";
import { publicArchiveText } from "@/lib/presentation/labels";

type TocEntry = { id: string; level: number; text: string };

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

function slug(value: string) {
  return value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("de-DE")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "abschnitt";
}

function safeLink(url: string, label: string) {
  const clean = url.replace(/[),.;:]+$/g, "");
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return escapeHtml(label);
    return `<a href="${escapeHtml(sourceDetailHrefForUrl(parsed.toString()))}">${escapeHtml(label)}</a>`;
  } catch {
    return escapeHtml(label);
  }
}

/**
 * The input is untrusted Markdown.  We deliberately escape every character
 * before adding a small, whitelisted Markdown presentation layer.  It keeps
 * the complete authorised text in the DOM without ever executing source HTML.
 */
function inline(value: string) {
  const substitutions: string[] = [];
  const keep = (html: string) => {
    const token = `@@SOURCE_LINK_${substitutions.length}@@`;
    substitutions.push(html);
    return token;
  };
  let output = value.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, (_, label: string, url: string) => keep(safeLink(url, label)));
  output = output.replace(/https:\/\/[^\s<]+/g, (url) => keep(safeLink(url, url)));
  output = escapeHtml(publicArchiveText(output))
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return output.replace(/@@SOURCE_LINK_(\d+)@@/g, (_, index: string) => substitutions[Number(index)] ?? "");
}

function tableCells(line: string) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
}

function isTableRule(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function renderMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  const toc: TocEntry[] = [];
  const headingCounts = new Map<string, number>();
  let paragraph: string[] = [];
  let list: { type: "ol" | "ul"; items: string[] } | null = null;
  let quote: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    output.push(`<${list.type}>${list.items.map((item) => `<li>${inline(item)}</li>`).join("")}</${list.type}>`);
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) output.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
    quote = [];
  };
  const flush = () => { flushParagraph(); flushList(); flushQuote(); };

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const trimmed = raw.trim();
    if (code) {
      if (/^```/.test(trimmed)) {
        output.push(`<pre><code>${escapeHtml(publicArchiveText(code.join("\n")))}</code></pre>`);
        code = null;
      } else {
        code.push(raw);
      }
      continue;
    }
    if (/^```/.test(trimmed)) { flush(); code = []; continue; }
    const heading = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      flush();
      const sourceLevel = heading[1].length;
      // The surrounding page owns the single document H1. The complete source
      // remains unchanged in wording; only its presentation hierarchy shifts.
      const level = Math.min(sourceLevel + 1, 6);
      const title = heading[2].trim();
      const base = slug(title);
      const count = (headingCounts.get(base) ?? 0) + 1;
      headingCounts.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      output.push(`<h${level} id="${id}">${inline(title)}</h${level}>`);
      if (sourceLevel <= 3) toc.push({ id, level, text: title });
      continue;
    }
    if (/^(---|\*\*\*|___)$/.test(trimmed)) { flush(); output.push("<hr />"); continue; }
    if (trimmed.startsWith(">")) { flushParagraph(); flushList(); quote.push(trimmed.replace(/^>\s?/, "")); continue; }
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
    if (ordered || unordered) {
      flushParagraph(); flushQuote();
      const type = ordered ? "ol" : "ul";
      if (!list || list.type !== type) { flushList(); list = { type, items: [] }; }
      list.items.push((ordered ?? unordered)?.[1] ?? "");
      continue;
    }
    if (trimmed.includes("|") && isTableRule(lines[index + 1] ?? "")) {
      flush();
      const headers = tableCells(trimmed);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().includes("|")) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      index -= 1;
      output.push(`<div class="complete-publication-table" role="region" tabindex="0" aria-label="Tabelle aus der vollständigen Fachakte"><table><thead><tr>${headers.map((cell) => `<th scope="col">${inline(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell, cellIndex) => cellIndex === 0 ? `<th scope="row">${inline(cell)}</th>` : `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    if (!trimmed) { flush(); continue; }
    flushList(); flushQuote();
    paragraph.push(trimmed);
  }
  if (code) output.push(`<pre><code>${escapeHtml(publicArchiveText(code.join("\n")))}</code></pre>`);
  flush();
  return { html: output.join("\n"), toc };
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" }).format(date);
}

export function CompletePublicationSource({ source, idPrefix = "vollstaendige-fachakte" }: { source: PublicationSource; idPrefix?: string }) {
  const rendered = renderMarkdown(source.markdown);
  const titleId = `${idPrefix}-titel`;
  // The source is rendered from an immutable, checksum-verified server file.
  // Keeping hydration out of this large read-only boundary avoids React trying
  // to reconcile thousands of presentation-only source nodes.
  return <section className="complete-publication-source" id={idPrefix} aria-labelledby={titleId} suppressHydrationWarning>
    <header>
      <div>
        <p className="eyebrow">Vollständige Fachakte</p>
        <h2 id={titleId}>Die freigegebene Fachanalyse – vollständig einsehbar</h2>
        <p>Diese Webansicht strukturiert den autorisierten Fachtext für die Lektüre. Sie lässt keine fachliche Aussage, Datenlücke, Quelle oder Einschränkung weg.</p>
      </div>
      <dl className="complete-publication-provenance">
        <div><dt>Fachstand</dt><dd>{formatDate(source.verifiedAt)}</dd></div>
        <div><dt>Referenzstand</dt><dd>WÖk-Begriffsleitfaden v{source.terminologyVersion}</dd></div>
        <div><dt>Inhaltspfad-Abdeckung</dt><dd>{source.suppliedContentPathsCount.toLocaleString("de-DE")} von {source.suppliedContentPathsCount.toLocaleString("de-DE")}</dd></div>
      </dl>
    </header>
    {rendered.toc.length > 0 && <nav className="complete-publication-toc" aria-label="Inhaltsverzeichnis der vollständigen Fachakte"><strong>Direkt zu einem Kapitel</strong><ol>{rendered.toc.map((entry) => <li key={entry.id} className={entry.level === 3 ? "complete-publication-toc--nested" : undefined}><a href={`#${entry.id}`}>{publicArchiveText(entry.text)}</a></li>)}</ol></nav>}
    <div className="complete-publication-body" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: rendered.html }} />
    <footer className="complete-publication-footer">
      <p><strong>Nachweis der Fassung:</strong> SHA-256 {source.markdownSha256}</p>
      <ul>{source.sourceRecords.map((record) => <li key={`${record.kind}-${record.sha256}`}><strong>{publicArchiveText(record.kind)}</strong>: {record.sha256}</li>)}</ul>
    </footer>
  </section>;
}
