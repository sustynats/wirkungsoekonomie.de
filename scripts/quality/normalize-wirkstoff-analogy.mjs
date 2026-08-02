import fs from "node:fs";
import path from "node:path";

// "Wirkstoff" is useful as a teaching image, not as a technical category.
// This pass operates on current editorial pages after their individual
// generators have run.  Source originals, reference readers and cited
// material are intentionally left verbatim: their reader shell supplies the
// terminology note, while titles, URLs and citations remain stable.
const ROOT = process.cwd();
const CHECK_ONLY = process.argv.includes("--check");
const REPORT = path.join(ROOT, "reports", "wirkstoff-analogie-audit.json");

const preservedScopes = new Set([
  ".git",
  "_site",
  "node_modules",
  "api",
  "assets",
  "bibliothek",
  "begriffe",
  "dokumente",
  "quellenarchiv",
  "referenz",
  "reports",
  "tmp",
  "public",
]);

const protectedTags = new Set([
  "a",
  "blockquote",
  "code",
  "h1",
  "pre",
  "script",
  "style",
  "svg",
  "textarea",
  "title",
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || preservedScopes.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file, files);
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(file);
  }
  return files;
}

function isNoindex(html) {
  return /<meta\b[^>]*\bname=["']robots["'][^>]*\bcontent=["'][^"']*\bnoindex\b/i.test(html)
    || /<meta\b[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'][^>]*\bname=["']robots["']/i.test(html);
}

function normalizeText(text) {
  if (!/wirkstoff/i.test(text)) return text;
  let next = text
    .replace(/\bWirkstoffanalyse\b/gi, "Auslöseranalyse")
    .replace(/\bgesellschaftliche\s+Wirkstoffe\b/gi, "Auslöser mit Wirkungspotenzial")
    .replace(/\bgesellschaftlicher\s+Wirkstoff\b/gi, "Auslöser mit Wirkungspotenzial")
    // Retain the prescribed wording when an already explicit definition is
    // being displayed; it is clearer than a doubled "als Analogie" phrase.
    .replace(/Auslöser mit Wirkungspotenzial\s*-\s*als Analogie\.\s*Ein Wirkstoff ist nicht Wirkung/gi, "Gesellschaftlicher Wirkstoff - als Analogie. Ein Wirkstoff ist nicht Wirkung");

  // Keep the established term readable when it is still useful, but always
  // make its status as an analogy explicit.  The negative lookahead keeps
  // the already correct compound "Wirkstoff-Analogie" untouched.
  next = next.replace(/\bWirkstoff(?:en|e)?\b/gi, (term, offset, source) => {
    const context = source.slice(Math.max(0, offset - 48), Math.min(source.length, offset + term.length + 72));
    if (/\b(?:didaktisch(?:e|er|en)?\s+)?analogie\b|Auslöser\s+mit\s+Wirkungspotenzial|medizinisch(?:e|er|en)?\s+Wirkstoff|Medikament|Vorerkrankung|Körper/i.test(context)) return term;
    if (/^wirkstoffen$/i.test(term)) return "Wirkstoffen (als didaktische Analogie)";
    if (/^wirkstoffe$/i.test(term)) return "Wirkstoffe (als didaktische Analogie)";
    return "Wirkstoff (didaktische Analogie)";
  });
  return next;
}

function rewriteHtml(html) {
  const pieces = html.split(/(<[^>]*>)/g);
  const stack = [];
  let changed = false;
  const rewritten = pieces.map((piece) => {
    if (piece.startsWith("<")) {
      const close = piece.match(/^<\/\s*([a-z0-9-]+)/i)?.[1]?.toLowerCase();
      const open = piece.match(/^<\s*([a-z0-9-]+)/i)?.[1]?.toLowerCase();
      if (close) {
        const index = stack.lastIndexOf(close);
        if (index >= 0) stack.splice(index, 1);
      } else if (open && !/\/>\s*$/.test(piece)) {
        stack.push(open);
      }
      return piece;
    }
    if (stack.some((tag) => protectedTags.has(tag))) return piece;
    const next = normalizeText(piece);
    if (next !== piece) changed = true;
    return next;
  }).join("");

  // Accessible image descriptions are public prose as well.  URLs, titles,
  // link text and source citations are deliberately not touched.
  const withAccessibleText = rewritten.replace(/(\b(?:alt|aria-label)=["'])([^"']*)(["'])/gi, (_match, start, value, end) => {
    const next = normalizeText(value);
    if (next !== value) changed = true;
    return `${start}${next}${end}`;
  });
  return { html: withAccessibleText, changed };
}

function visibleViolations(html) {
  const pieces = html.split(/(<[^>]*>)/g);
  const stack = [];
  const violations = [];
  for (const piece of pieces) {
    if (piece.startsWith("<")) {
      const close = piece.match(/^<\/\s*([a-z0-9-]+)/i)?.[1]?.toLowerCase();
      const open = piece.match(/^<\s*([a-z0-9-]+)/i)?.[1]?.toLowerCase();
      if (close) {
        const index = stack.lastIndexOf(close);
        if (index >= 0) stack.splice(index, 1);
      } else if (open && !/\/>\s*$/.test(piece)) {
        stack.push(open);
      }
      continue;
    }
    if (stack.some((tag) => protectedTags.has(tag))) continue;
    for (const match of piece.matchAll(/\bWirkstoff(?:e|en|es)?\b/gi)) {
      const context = piece.slice(Math.max(0, match.index - 100), Math.min(piece.length, match.index + match[0].length + 160));
      if (/\b(?:didaktisch(?:e|er|en)?\s+)?analogie\b|Auslöser\s+mit\s+Wirkungspotenzial|medizinisch(?:e|er|en)?\s+Wirkstoff|Medikament|Vorerkrankung|Körper/i.test(context)) continue;
      violations.push(context.replace(/\s+/g, " ").trim());
    }
  }
  return violations;
}

const findings = [];
let scanned = 0;
let changedFiles = 0;
for (const file of walk(ROOT)) {
  const original = fs.readFileSync(file, "utf8");
  if (isNoindex(original)) continue;
  scanned += 1;
  const result = rewriteHtml(original);
  if (!CHECK_ONLY && result.changed) {
    fs.writeFileSync(file, result.html);
    changedFiles += 1;
  }
  const effective = CHECK_ONLY ? original : result.html;
  const violations = visibleViolations(effective);
  if (violations.length) findings.push({ file: path.relative(ROOT, file), violations });
}

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  mode: CHECK_ONLY ? "check" : "normalize",
  scannedIndexablePages: scanned,
  changedFiles,
  preservedScopes: [...preservedScopes].sort(),
  findings,
}, null, 2)}\n`);

if (findings.length) {
  console.error(`Wirkstoff analogy guardrail failed: ${findings.length} current public page(s) use the term without analogy framing.`);
  for (const finding of findings.slice(0, 20)) console.error(`- ${finding.file}: ${finding.violations.join(" | ")}`);
  process.exit(1);
}

console.log(`Wirkstoff analogy ${CHECK_ONLY ? "guardrail" : "normalizer"} passed (${scanned} current indexable pages; ${changedFiles} changed; archival text preserved).`);
