function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusLabel(status) {
  if (status === "pilot-arbeitsfassung") return "Pilot-Arbeitsfassung";
  if (status === "rohfassung-v0") return "Rohfassung V0";
  if (status === "studienskript-v1-rohfassung") return "V1-Rohfassung";
  if (status === "studienskript-v1") return "Studienskript V1";
  return status;
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "abschnitt";
}

function inlineHtml(value) {
  const text = String(value ?? "");
  const parts = [];
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;
  let offset = 0;
  let match;
  const emphasis = (part) => esc(part)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  while ((match = linkPattern.exec(text))) {
    parts.push(emphasis(text.slice(offset, match.index)));
    const href = match[2].trim();
    const external = /^https?:\/\//i.test(href);
    parts.push(`<a class="text-link" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${emphasis(match[1])}</a>`);
    offset = linkPattern.lastIndex;
  }
  parts.push(emphasis(text.slice(offset)));
  return parts.join("");
}

export function renderReader(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").replace(/^---[\s\S]*?---\s*/, "").split("\n");
  const toc = [];
  const html = [];
  const used = new Set();
  let paragraph = [];
  let list = [];
  let table = [];
  let paragraphCount = 0;
  const uniqueId = (value) => {
    const base = slugify(value);
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    return id;
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    paragraphCount += 1;
    html.push(`<p id="${uniqueId(`absatz-${paragraphCount}`)}">${inlineHtml(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</ul>`);
    list = [];
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .map((row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()))
      .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
    if (rows.length > 1) {
      const [head, ...body] = rows;
      html.push(`<div class="table-wrap"><table class="data-table"><thead><tr>${head.map((cell) => `<th>${inlineHtml(cell)}</th>`).join("")}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inlineHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  const heading = (level, text) => {
    flushParagraph();
    flushList();
    flushTable();
    const plain = String(text).replace(/[*`]/g, "").trim();
    const id = uniqueId(plain);
    toc.push({ level, text: plain, id });
    html.push(`<h${level} id="${id}">${inlineHtml(plain)}</h${level}>`);
  };
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      heading(Math.max(2, match[1].length), match[2]);
    } else if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      flushList();
      table.push(line);
    } else if (/^(?:[-*]|\d+\.)\s+/.test(line)) {
      flushParagraph();
      flushTable();
      list.push(line.replace(/^(?:[-*]|\d+\.)\s+/, ""));
    } else {
      flushList();
      flushTable();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  flushTable();
  return { toc, html: html.join("\n") };
}


export { esc, statusLabel };
