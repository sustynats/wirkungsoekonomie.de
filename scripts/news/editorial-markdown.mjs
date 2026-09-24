import { PROCESS_NOTE_PATTERN } from './reader-copy.mjs';
import { parseAuthoredVisual, renderAuthoredVisual } from '../../assets/js/editorial-authored-visuals.js';
import { renderArrowDiagram, renderTableDiagram, renderTextDiagram, labeledArrowItem, renderLabeledArrowDiagram } from './editorial-diagrams.mjs';
// Deliberately small, deterministic editorial Markdown subset. No HTML, scripts,
// images or embedded instructions execute. Unsupported blocks fail closed.
// Uses the site's existing table-wrap/data-table and text-link conventions.
export const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
const slugify = value => value.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function inlineEditorialMarkdown(text) {
  const pattern = /\[([^\]\n]+)\]\(([^\s)]+)\)|(https:\/\/[^\s<>]+)|\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`/g;
  let html = "", cursor = 0;
  for (const match of text.matchAll(pattern)) {
    html += escape(text.slice(cursor, match.index));
    const [, label, href, bare, strong, emphasis, code] = match;
    if (href || bare) {
      const url = new URL(href || bare, "https://wirkungsoekonomie.de");
      if (url.protocol !== "https:" || url.username || url.password) throw new Error("EDITORIAL_MARKDOWN_UNSAFE_LINK");
      html += `<a class="text-link" href="${escape(href || bare)}" target="_blank" rel="noopener noreferrer">${escape(label || bare)}</a>`;
    } else if (strong) html += `<strong>${inlineEditorialMarkdown(strong)}</strong>`;
    else if (emphasis) html += `<em>${inlineEditorialMarkdown(emphasis)}</em>`;
    else html += `<code>${escape(code)}</code>`;
    cursor = match.index + match[0].length;
  }
  return html + escape(text.slice(cursor));
}

// Der Freigabevorbehalt ist Werkstattnotiz, nicht Lesertext. Er steht im
// Entwurf, damit Natalie sieht, dass sie entscheidet - auf der veröffentlichten
// Seite ist er falsch, weil sie dann längst entschieden hat (16.09.: vier
// Ausgaben standen mit "Vorschlag zur Bestätigung durch Natalie" live).
// Entfernt wird ausschließlich der Vorbehalt selbst: eine Zeile, die nur aus ihm
// besteht, oder ein einzelner Satz in einem Absatz. Alles andere - Inhalt,
// Transparenzhinweise, Prüfvermerke - bleibt unangetastet.
// Das Muster gehoert zur Grenze "Lesertext" und steht deshalb in
// reader-copy.mjs - eine Definition fuer beide Welten: die Nachrichten-Analysen
// pruefen dort gegen dieselbe Klasse (EDITORIAL_PUBLIC_EDITORIAL_RESIDUE).
const APPROVAL_PHRASE = PROCESS_NOTE_PATTERN;

const bareLine = line => line.replace(/^#{1,6}\s+/, '').replace(/\*\*|\*|_/g, '').replace(/[:.\s]+$/, '').trim();

export function withoutProcessNotes(markdown, { removed = [] } = {}) {
  if (typeof markdown !== 'string' || !APPROVAL_PHRASE.test(markdown)) return markdown;
  // Ein Rest ohne eigene Aussage ist kein Lesertext, sondern Schutt.
  const tragfaehig = (text) => text.replace(/[^\p{L}]/gu, '').length >= 12 && /\p{L}{3,}/u.test(text);
  const kept = [];
  for (const line of markdown.split('\n')) {
    if (!APPROVAL_PHRASE.test(line)) { kept.push(line); continue; }
    // Zuerst der Vermerk als Etikett vor der Aussage ("Vorschlag zur
    // Bestätigung: Die Sendung ist dann stark, wenn ..."): nur das Etikett geht,
    // die Aussage trägt sich selbst. Diese Regel steht vor der naechsten, weil
    // eine solche Zeile aus einem einzigen Satz besteht und sonst ganz fiele.
    let rumpf = line;
    const etikett = /^([#*_\s]*[^:\n]{0,140}?:\s*(?:\*\*|\*|_)?\s*)(\S.*)$/.exec(line);
    if (etikett && APPROVAL_PHRASE.test(etikett[1]) && tragfaehig(etikett[2])) {
      removed.push(etikett[1].replace(/[#*_\s]+$/, '').trim());
      rumpf = etikett[2];
      if (!APPROVAL_PHRASE.test(rumpf)) { kept.push(rumpf); continue; }
    } else {
      const bare = bareLine(line);
      // Eine Zeile, die nur den Vorbehalt trägt (auch als Überschrift oder
      // fett), fällt ganz weg; der nachfolgende Abschnittstext trägt sich selbst.
      if (/^(?:Vorschlag|Hinweis|Anmerkung|Redaktioneller Hinweis)?[^.!?]*$/.test(bare)) { removed.push(bare); continue; }
    }
    // Sonst steht der Vorbehalt als Satz in einem Absatz: nur dieser Satz geht.
    const sentences = rumpf.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [rumpf];
    const rest = sentences.filter(s => { const hit = APPROVAL_PHRASE.test(s); if (hit) removed.push(s.trim()); return !hit; }).join('').replace(/\s+$/, '');
    if (rest.trim() && tragfaehig(rest)) kept.push(rest);
    else if (rest.trim()) removed.push(rest.trim());
  }
  // Durch den Wegfall entstandene Leerzeilenpaare zusammenziehen.
  return kept.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '').replace(/\s+$/, '');
}

// Der Filter allein reicht nicht: was er nicht trifft, erscheint stumm. Diese
// Pruefung verwandelt einen Durchrutscher in eine verweigerte Veroeffentlichung
// mit Grund - an jeder Stelle, die einen Beitrag annimmt oder baut.
export function processNoteFindings(markdown) {
  const treffer = [];
  for (const zeile of String(markdown || '').split('\n')) {
    const fund = APPROVAL_PHRASE.exec(zeile);
    if (fund) treffer.push(fund[0].trim().slice(0, 80));
  }
  return [...new Set(treffer)];
}

export function assertWithoutProcessNotes(markdown) {
  const treffer = processNoteFindings(markdown);
  if (treffer.length) throw Object.assign(Error('EDITORIAL_PROCESS_NOTE_IN_TEXT'), { detail: treffer.join(' | ') });
}

export function renderEditorialMarkdown(markdown, { tableDiagrams = {}, sectionDiagrams = [], authoredVisualLabels = {}, automaticArrowDiagrams = !markdown.includes('<!-- WÖK_VISUAL') } = {}) {
  // Authored markers define the visual scope. Other arrows may be a rejected
  // example, not an endorsed causal model; preserve them as ordinary prose.
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = [], headings = [], blocks = [];
  let current = { id: "einstieg", title: "", blocks: [] }, tableIndex = 0;
  const renderedSectionDiagrams = new Set();
  const authoredVisualIds = new Set();
  const add = html => { current.blocks.push(html); blocks.push(html); };
  const endSection = () => {
    for (const diagram of sectionDiagrams.filter(d => d.sectionId ? d.sectionId === current.id : d.section === current.title)) {
      if (diagram.items.some(item => !markdown.includes(item))) throw Error('EDITORIAL_DIAGRAM_EXCERPT_CHANGED');
      add(renderTextDiagram(diagram, inlineEditorialMarkdown));
      renderedSectionDiagrams.add(diagram);
    }
    sections.push({ ...current, html: current.blocks.join("\n") });
  };
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line === '<!-- WÖK_VISUAL') {
      const end = lines.indexOf('-->', i + 1);
      if (end < 0) throw Error('EDITORIAL_VISUAL_UNCLOSED');
      const visual = parseAuthoredVisual(lines.slice(i, end + 1).join('\n'));
      if (authoredVisualIds.has(visual.id)) throw Error('EDITORIAL_VISUAL_DUPLICATE_ID');
      authoredVisualIds.add(visual.id);
      add(renderAuthoredVisual(visual, { label: Object.hasOwn(authoredVisualLabels, visual.id) ? authoredVisualLabels[visual.id] : undefined })); i = end + 1; continue;
    }
    if (automaticArrowDiagrams && labeledArrowItem(lines.slice(i,i+2).join('\n'))) {
      const items = []; let cursor = i;
      while (labeledArrowItem(lines.slice(cursor,cursor+2).join('\n'))) {
        items.push(lines.slice(cursor,cursor+2).join('\n')); cursor += 2;
        while (cursor < lines.length && !lines[cursor].trim()) cursor++;
      }
      if (items.length >= 3 && items.length <= 9) { add(renderLabeledArrowDiagram(items, inlineEditorialMarkdown)); i = cursor; continue; }
    }
    if (/^\s*(?:<|!\[|```|~~~|\[.+\]:)/.test(line) || /^ {4}\S/.test(line)) throw new Error("EDITORIAL_MARKDOWN_UNSUPPORTED_BLOCK");
    const heading = /^(#{2,6}) (.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length, title = heading[2];
      const baseId = slugify(title) || "abschnitt";
      let id = baseId, n = 2;
      while (headings.some(h => h.id === id)) id = `${baseId}-${n++}`;
      headings.push({ id, level, title });
      const appendix = level === 3 && /^(?:Wirkungskaskade für die Visualisierung|Quellen und Dokumente)$/.test(title);
      if (level === 2 || appendix) { endSection(); current = { id, title, blocks: [] }; }
      add(`<h${level}${level !== 2 && !appendix ? ` id="${id}"` : ""}>${inlineEditorialMarkdown(title)}</h${level}>`);
      i++; continue;
    }
    if (/^# /.test(line)) throw new Error("EDITORIAL_MARKDOWN_DUPLICATE_TITLE");
    if (/^---\s*$/.test(line)) { add("<hr>"); i++; continue; }
    if (/^>/.test(line)) {
      const quoted = [];
      while (i < lines.length && /^>/.test(lines[i])) quoted.push(lines[i++].replace(/^> ?/, ""));
      add((automaticArrowDiagrams && renderArrowDiagram(quoted.join("\n"), inlineEditorialMarkdown)) || `<blockquote>${renderEditorialMarkdown(quoted.join("\n"), { automaticArrowDiagrams }).html}</blockquote>`); continue;
    }
    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++].trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
      if (rows.length < 3 || rows[1].some(c => !/^:?-+:?$/.test(c)) || rows.some(r => r.length !== rows[0].length)) throw new Error("EDITORIAL_MARKDOWN_TABLE_INVALID");
      const diagram = tableDiagrams[tableIndex++];
      if (diagram) { add(renderTableDiagram(rows, diagram, inlineEditorialMarkdown)); continue; }
      add(`<div class="table-wrap news-manual-table${rows[0].length > 2 ? " news-manual-table--wide" : ""}" role="region" aria-label="Wirkungsketten: Tabelle horizontal scrollbar" tabindex="0"><table class="data-table"><thead><tr>${rows[0].map(c => `<th scope="col">${inlineEditorialMarkdown(c)}</th>`).join("")}</tr></thead><tbody>${rows.slice(2).map(r => `<tr>${r.map(c => `<td>${inlineEditorialMarkdown(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`); continue;
    }
    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2));
      add(`<ul>${items.map(item => `<li>${inlineEditorialMarkdown(item)}</li>`).join("")}</ul>`); continue;
    }
    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !/^(?:#{1,6} |>|\||- |<!-- WÖK_VISUAL|---\s*$)/.test(lines[i])) paragraph.push(lines[i++]);
    // Authors sometimes separate individual arrow steps by blank lines. Join
    // only explicit continuations; do not turn ordinary paragraphs into paths.
    let next = i;
    while (next < lines.length) {
      while (next < lines.length && !lines[next].trim()) next++;
      if (!/^→\s+/.test(lines[next] || '')) break;
      paragraph.push(lines[next++]); i = next;
    }
    add((automaticArrowDiagrams && renderArrowDiagram(paragraph.join("\n"), inlineEditorialMarkdown)) || `<p>${paragraph.map(l => inlineEditorialMarkdown(l.replace(/ {2}$/, "")) + (l.endsWith("  ") ? "<br>" : "")).join("\n")}</p>`);
  }
  endSection();
  if (renderedSectionDiagrams.size !== sectionDiagrams.length) throw Error('EDITORIAL_DIAGRAM_SECTION_NOT_FOUND');
  return { html: blocks.join("\n"), sections: sections.filter(s => s.html), headings };
}

// Signed manuscripts may use named footnotes. Keep their text and source order;
// only the reference syntax becomes linked, accessible HTML.
export function renderEditorialMarkdownWithFootnotes(markdown) {
  const notes = new Map();
  if (markdown.includes('WOEKFOOTNOTEREFERENCE')) throw new Error('EDITORIAL_MARKDOWN_RESERVED_TOKEN');
  let body = markdown.replace(/^\[\^([A-Za-z0-9_-]+)\]: (.+)$/gm, (_, id, text) => {
    if (notes.has(id)) throw new Error('EDITORIAL_MARKDOWN_DUPLICATE_FOOTNOTE');
    notes.set(id, { number: notes.size + 1, text });
    return '';
  });
  body = body.replace(/\[\^([A-Za-z0-9_-]+)\]/g, (_, id) => {
    if (!notes.has(id)) throw new Error('EDITORIAL_MARKDOWN_MISSING_FOOTNOTE');
    return `WOEKFOOTNOTEREFERENCE${notes.get(id).number}END`;
  });
  const rendered = renderEditorialMarkdown(body);
  const references = html => html.replace(/WOEKFOOTNOTEREFERENCE(\d+)END/g, (_, n) => `<sup><a href="#source-${n}" aria-label="Quelle ${n}">${n}</a></sup>`);
  for (const section of rendered.sections) {
    section.html = references(section.html);
    section.blocks = section.blocks.map(references);
  }
  if (notes.size) {
    const blocks = [...notes.values()].map(({ number, text }) => `<p id="source-${number}"><strong>${number}.</strong> ${inlineEditorialMarkdown(text)}</p>`);
    rendered.sections.push({ id: 'quellennachweise', title: 'Quellennachweise', blocks, html: blocks.join('\n') });
  }
  rendered.html = rendered.sections.map(section => section.html).join('\n');
  return rendered;
}
