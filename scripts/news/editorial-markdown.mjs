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

export function renderEditorialMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections = [], headings = [], blocks = [];
  let current = { id: "einstieg", title: "", blocks: [] };
  const add = html => { current.blocks.push(html); blocks.push(html); };
  const endSection = () => { sections.push({ ...current, html: current.blocks.join("\n") }); };
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (/^\s*(?:<|!\[|```|~~~|\[.+\]:)/.test(line) || /^ {4}\S/.test(line)) throw new Error("EDITORIAL_MARKDOWN_UNSUPPORTED_BLOCK");
    const heading = /^(#{2,6}) (.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length, title = heading[2];
      const baseId = slugify(title) || "abschnitt";
      let id = baseId, n = 2;
      while (headings.some(h => h.id === id)) id = `${baseId}-${n++}`;
      headings.push({ id, level, title });
      if (level === 2) { endSection(); current = { id, title, blocks: [] }; }
      add(`<h${level}${level !== 2 ? ` id="${id}"` : ""}>${inlineEditorialMarkdown(title)}</h${level}>`);
      i++; continue;
    }
    if (/^# /.test(line)) throw new Error("EDITORIAL_MARKDOWN_DUPLICATE_TITLE");
    if (/^---\s*$/.test(line)) { add("<hr>"); i++; continue; }
    if (/^>/.test(line)) {
      const quoted = [];
      while (i < lines.length && /^>/.test(lines[i])) quoted.push(lines[i++].replace(/^> ?/, ""));
      add(`<blockquote>${renderEditorialMarkdown(quoted.join("\n")).html}</blockquote>`); continue;
    }
    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++].trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
      if (rows.length < 3 || rows[1].some(c => !/^:?-+:?$/.test(c)) || rows.some(r => r.length !== rows[0].length)) throw new Error("EDITORIAL_MARKDOWN_TABLE_INVALID");
      add(`<div class="table-wrap news-manual-table${rows[0].length > 2 ? " news-manual-table--wide" : ""}" role="region" aria-label="Wirkungsketten: Tabelle horizontal scrollbar" tabindex="0"><table class="data-table"><thead><tr>${rows[0].map(c => `<th scope="col">${inlineEditorialMarkdown(c)}</th>`).join("")}</tr></thead><tbody>${rows.slice(2).map(r => `<tr>${r.map(c => `<td>${inlineEditorialMarkdown(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`); continue;
    }
    if (/^- /.test(line)) {
      const items = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2));
      add(`<ul>${items.map(item => `<li>${inlineEditorialMarkdown(item)}</li>`).join("")}</ul>`); continue;
    }
    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !/^(?:#{1,6} |>|\||- |---\s*$)/.test(lines[i])) paragraph.push(lines[i++]);
    add(`<p>${paragraph.map(l => inlineEditorialMarkdown(l.replace(/ {2}$/, "")) + (l.endsWith("  ") ? "<br>" : "")).join("\n")}</p>`);
  }
  endSection();
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
