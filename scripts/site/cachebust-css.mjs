import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Setzt den style.css-Cachebuster (?v=) in allen _site-HTML-Dateien auf einen
// Content-Hash der ausgelieferten style.css. Läuft nach build:artifact.
// Defensiv: bricht den Build NICHT ab, wenn etwas fehlt.
try {
  const SITE = path.join(process.cwd(), "_site");
  const cssPath = path.join(SITE, "assets", "css", "style.css");
  if (!fs.existsSync(cssPath)) {
    console.warn("cachebust-css: _site/assets/css/style.css fehlt - übersprungen.");
    process.exit(0);
  }
  const hash = crypto.createHash("sha256").update(fs.readFileSync(cssPath)).digest("hex").slice(0, 12);
  // Keep the shared Wirkungsraum runtime current on every page, not just the AI page.
  const mainPath = path.join(SITE, "assets", "js", "main.js");
  const questionsPath = path.join(SITE, "assets", "js", "contextual-questions.js");
  const mainHash = fs.existsSync(mainPath) ? crypto.createHash("sha256").update(fs.readFileSync(mainPath)).update(fs.existsSync(questionsPath) ? fs.readFileSync(questionsPath) : '').digest("hex").slice(0, 12) : null;
  const searchPath = path.join(SITE, "assets/js/search.js");
  const searchHash = fs.existsSync(searchPath) ? crypto.createHash("sha256").update(fs.readFileSync(searchPath)).digest("hex").slice(0, 12) : null;
  const re = /assets\/css\/style\.css(?:\?v=[^"'\s>]+)?/g;
  const replacement = `assets/css/style.css?v=${hash}`;
  let changed = 0, scanned = 0;
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name.endsWith(".html")) {
        scanned++;
        const s = fs.readFileSync(full, "utf8");
        let out = s.replace(re, replacement);
        if (mainHash) out = out.replace(/assets\/js\/main\.js(?:\?v=[^"'\s>]+)?/g, `assets/js/main.js?v=${mainHash}`);
        if (searchHash) out = out.replace(/assets\/js\/search\.js(?:\?v=[^"'\s>]+)?/g, `assets/js/search.js?v=${searchHash}`);
        if (out !== s) { fs.writeFileSync(full, out); changed++; }
      }
    }
  };
  walk(SITE);
  console.log(`cachebust-css: style.css?v=${hash} in ${changed}/${scanned} HTML gesetzt.`);
} catch (err) {
  console.warn("cachebust-css: übersprungen wegen Fehler:", err?.message || err);
  process.exit(0);
}
