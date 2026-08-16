import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoreDirs = new Set([
  ".git",
  ".github",
  ".claude",
  ".next",
  ".vercel",
  "node_modules",
  "source-assets",
  ".codex-backup",
  "outputs",
  "woek-akademie-app",
  "woek-institut-app"
]);
const htmlFiles = [];
const allowedSpreadsheetPattern = /assets\/downloads\/woek-register\/(?:WOeK_Master_Items_Public_Research_Register_v2\.1|WOeK_Master_Items_v1\.3_geprueft)\.(xlsx|xls)(?:[#?][^"']*)?$|assets\/downloads\/woek-register\/v1\.4\/WOeK_Masterregister_v1\.4_FINAL_2026-08-16\.xlsx(?:[#?][^"']*)?$/i;
const allowedRegisterExportPattern = /assets\/downloads\/woek-register\/v1\.4\/(?:register-v1\.4\.(?:csv|json)|manifest\.json)(?:[#?][^"']*)?$/i;
const allowedPublicDataPattern = /public\/data\/(?:en-document-translation-manifest|en-route-coverage)\.json(?:[#?][^"']*)?$/i;
const allowedStudyScriptRawPattern = /^docs\/studienskripte\/word-rohfassungen\/[a-z0-9-]+\.docx$/i;
const publicDownloadDirPattern = /^(assets\/downloads|downloads|public\/downloads)\//i;
const forbiddenDownloadPattern = /(?:href|src)=["'](?!https?:\/\/)(?!(?:[^"']*assets\/downloads\/woek-register\/(?:WOeK_Master_Items_Public_Research_Register_v2\.1|WOeK_Master_Items_v1\.3_geprueft)\.(?:xlsx|xls)(?:[#?][^"']*)?["']))(?!(?:[^"']*assets\/downloads\/woek-register\/v1\.4\/(?:WOeK_Masterregister_v1\.4_FINAL_2026-08-16\.xlsx|register-v1\.4\.(?:csv|json)|manifest\.json)(?:[#?][^"']*)?["']))(?!(?:[^"']*public\/data\/(?:en-document-translation-manifest|en-route-coverage)\.json(?:[#?][^"']*)?["']))[^"']*\.(docx|dotx|pages|key|numbers|zip|wav|csv|json|xlsx|xls)(?:[#?][^"']*)?["']/i;
const forbiddenAnchorPattern = /<a\b([^>]*?)\bhref=(["'])([^"']*\.(?:docx|dotx|pages|key|numbers|zip|wav|csv|json|xlsx|xls)(?:[#?][^"']*)?)\2([^>]*)>([\s\S]*?)<\/a>/gi;
const forbiddenSrcPattern = /<source\b([^>]*?)\bsrc=(["'])([^"']*\.(?:docx|dotx|pages|key|numbers|zip|wav|csv|json|xlsx|xls)(?:[#?][^"']*)?)\2([^>]*)>\s*<\/source>/gi;
const forbiddenFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    if (entry.name.startsWith(".wt-")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (!entry.isFile()) continue;
    if (entry.name.endsWith(".html")) htmlFiles.push(full);
    const rel = path.relative(root, full);
    if (/\.(docx|dotx|pages|key|numbers|zip|wav)$/i.test(entry.name)) {
      if (allowedSpreadsheetPattern.test(rel)) continue;
      if (allowedStudyScriptRawPattern.test(rel)) continue;
      forbiddenFiles.push(path.relative(root, full));
      continue;
    }
    if (/\.(csv|json|xlsx|xls)$/i.test(entry.name) && publicDownloadDirPattern.test(rel)) {
      if (allowedSpreadsheetPattern.test(rel)) continue;
      if (allowedRegisterExportPattern.test(rel)) continue;
      forbiddenFiles.push(path.relative(root, full));
    }
  }
}

walk(root);

function replacementLabel(innerHtml) {
  const text = innerHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "Nicht öffentlich";
  return `${text} nicht öffentlich`;
}

let sanitizedFiles = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const sanitized = html
    .replace(forbiddenAnchorPattern, (match, before, _quote, hrefValue, after, inner) => {
      if (/^https?:\/\//i.test(hrefValue) || allowedSpreadsheetPattern.test(hrefValue) || allowedRegisterExportPattern.test(hrefValue) || allowedPublicDataPattern.test(hrefValue)) return match;
      const attrs = `${before || ""} ${after || ""}`;
      const classMatch = attrs.match(/\bclass=(["'])([^"']*)\1/i);
      const classAttr = classMatch ? ` class=${classMatch[1]}${classMatch[2]}${classMatch[1]}` : ' class="badge"';
      return `<span${classAttr}>${replacementLabel(inner)}</span>`;
    })
    .replace(forbiddenSrcPattern, (match, _before, _quote, srcValue) => (allowedSpreadsheetPattern.test(srcValue) ? match : ""));

  if (sanitized !== html) {
    fs.writeFileSync(file, sanitized);
    sanitizedFiles += 1;
  }
}

const findings = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  if (forbiddenDownloadPattern.test(html)) findings.push(path.relative(root, file));
}

if (findings.length || forbiddenFiles.length) {
  if (findings.length) {
    console.error(`Public download policy violation: ${findings.length} HTML files still contain non-public download links after sanitization.`);
    console.error(findings.slice(0, 80).join("\n"));
  }
  if (forbiddenFiles.length) {
    console.error(`Public download policy violation: ${forbiddenFiles.length} non-public download files are still inside the website tree.`);
    console.error(forbiddenFiles.slice(0, 80).join("\n"));
  }
  process.exit(1);
}

console.log(`Public download policy check OK: only public PDFs and the allowed WÖK-ID spreadsheet remain. Sanitized ${sanitizedFiles} HTML files.`);
