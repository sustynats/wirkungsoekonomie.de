import { sourceDetailHrefForUrl } from "@/lib/sources/public-registry";

export type PublicationTocEntry = { id: string; level: number; text: string };

/**
 * The authorised source uses JSON field names as Markdown headings. These
 * labels are a presentation-only translation; the values beneath them remain
 * unchanged and complete.
 */
const presentationHeadingLabels: Record<string, string> = {
  programme_profile: "Programmprofil",
  source_summary: "Einordnung der Quelle",
  commitment_assessments: "Zusagen und Folgencheck",
  material_commitments: "Materielle Zusagen und Folgencheck",
  central_impact_paths: "Zentrale Wirkpfade",
  cross_cutting_patterns: "Übergreifende Muster",
  programme_level_communicative_pre_effect: "Kommunikative Vorwirkung",
  methodology_extension: "Methodischer Rahmen",
  declared_objectives: "Genannte Ziele",
  material_policy_domains: "Themenfelder",
  source_refs: "Quellen und Fundstellen",
  decision_readiness: "Entscheidungsreife",
  responsible_actors: "Zuständigkeiten",
  impact_potential: "Wirkungspotenziale",
  impact_risks: "Wirkungsrisiken",
  communicative_pre_effect: "Kommunikative Vorwirkung",
  calculation_requirements: "Berechnungsanforderungen",
  non_compensation: "Nichtkompensierbare Schutzfragen",
  normative_mapping: "Bezug zum Referenzrahmen",
  source_verification: "Quellenprüfung",
  data_gaps: "Offene Datenfragen",
  counterarguments: "Gegenargumente und Alternativerklärungen",
  counterfactuals: "Gegenfaktische Szenarien",
  ex_ante: "Wissensstand vor der Entscheidung",
  ex_post: "Beobachtungen mit heutigem Wissensstand",
  retrospective: "Wirkungsökonomischer Rückblick",
  provenance: "Fassung und Quellenherkunft"
};

const generatedPresentationBoilerplate = new Set([
  "Vollständige, automatisch strukturierte Darstellung der zugrunde liegenden Fachquelle. Kein Inhaltsfeld wurde redaktionell verdichtet."
]);

function presentationHeading(value: string) {
  const normalized = value.trim();
  if (/\s[–-]\s(?:programme-review|commitment-register)\s[–-]\svollständige Darstellung$/i.test(normalized)) return "Vollständige Fachakte";
  if (/^Vollständige Fachakte\s[–-]\s/.test(normalized)) return "Vollständige Fachakte";
  return presentationHeadingLabels[normalized] ?? normalized;
}

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

function inline(value: string) {
  const substitutions: string[] = [];
  const keep = (html: string) => {
    const token = `@@SOURCE_LINK_${substitutions.length}@@`;
    substitutions.push(html);
    return token;
  };
  let output = value.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, (_, label: string, url: string) => keep(safeLink(url, label)));
  output = output.replace(/https:\/\/[^\s<]+/g, (url) => keep(safeLink(url, url)));
  output = escapeHtml(output)
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

/**
 * Renders only a deliberately small, whitelisted Markdown subset. Every source
 * character is escaped first; external URLs resolve to source-detail pages.
 */
export function renderPublicationMarkdown(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  const toc: PublicationTocEntry[] = [];
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
        output.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
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
      const level = Math.min(sourceLevel + 1, 6);
      const sourceTitle = heading[2].trim();
      const title = presentationHeading(sourceTitle);
      const base = slug(sourceTitle);
      const count = (headingCounts.get(base) ?? 0) + 1;
      headingCounts.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;
      output.push(`<h${level} id="${id}">${inline(title)}</h${level}>`);
      if (sourceLevel <= 3) toc.push({ id, level, text: title });
      continue;
    }
    if (/^(---|\*\*\*|___)$/.test(trimmed)) { flush(); output.push("<hr />"); continue; }
    if (trimmed.startsWith(">")) {
      const quoteLine = trimmed.replace(/^>\s?/, "");
      // This generator wrapper is represented by the page header and checksum
      // section. It is not a substantive analytic assertion and is withheld
      // from the public reader to avoid exposing an editorial process note.
      if (generatedPresentationBoilerplate.has(quoteLine)) { flush(); continue; }
      flushParagraph(); flushList(); quote.push(quoteLine); continue;
    }
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
  if (code) output.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  flush();
  return { html: output.join("\n"), toc };
}

export { escapeHtml };
