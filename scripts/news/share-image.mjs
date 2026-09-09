// Small first-party link cards, derived only from public article metadata.
// Generated during the existing static build, never by a paid image/model API.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fontFaceStyle, PALETTE, categoryIcon } from "./title-image/index.mjs";
import { fitText } from "./title-image/text.mjs";
import { iconMarkup } from "./visuals.mjs";
import { findChrome } from "./title-image/rasterize.mjs";
import { chromeRenderBatch } from "./title-image/chrome-render.mjs";
import { inspectImage } from "./title-image/image-file.mjs";

const SITE = "https://wirkungsoekonomie.de";
const PREFIX = "/assets/img/news-share/";
const VERSION = "news-share-v2";
const escape = value => String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const clean = value => String(value || "").replace(/[\u2010-\u2015\u2212]/g, "-").replace(/\s+/g, " ").trim();

export function articleShareCard(article) {
  if (!article || !["Article", "AnalysisNewsArticle"].includes(article["@type"])) return null;
  if (!/^https:\/\/wirkungsoekonomie\.de\/wirkungsticker\/(?:analyse\/)?[a-z0-9-]+\/$/.test(article.url || "")) throw new Error("SHARE_CARD_CANONICAL_INVALID");
  const opinion = article["@type"] === "Article";
  const topic = clean(Array.isArray(article.articleSection) ? article.articleSection.join(" · ") : article.articleSection);
  const input = {
    canonical: article.url,
    headline: clean(article.headline),
    kind: opinion ? (topic || "Meinung & Analyse") : "Nachricht & Folgencheck",
    topic: opinion ? "" : topic,
    author: opinion ? clean(article.author?.name) : "",
  };
  if (!input.headline) throw new Error("SHARE_CARD_HEADLINE_MISSING");
  const hash = crypto.createHash("sha256").update(JSON.stringify({ version: VERSION, input })).digest("hex").slice(0, 24);
  return { input, url: `${SITE}${PREFIX}${hash}.jpg`, width: 1200, height: 630, type: "image/jpeg", alt: `${input.kind}: ${input.headline}` };
}

export function renderShareCard(card) {
  const { input } = card;
  const fit = fitText(input.headline, { fontKey: "serif-700", sizes: [64, 58, 52, 46, 40, 34], maxWidth: 1008, maxLines: 5 });
  const text = (value, x, y, size, { serif = false, color = PALETTE.ivory, weight = 600 } = {}) => `<text x="${x}" y="${y}" font-family="${serif ? "Source Serif 4" : "Inter"}" font-size="${size}" font-weight="${weight}" fill="${color}">${escape(value)}</text>`;
  const kind = fitText(input.kind.toUpperCase(), { fontKey: "sans-600", sizes: [23, 21, 18], maxWidth: 940, maxLines: 1 });
  const foot = [input.author, input.topic].filter(Boolean).join(" · ");
  const footer = fitText(foot || "Mensch · Planet · Demokratie", { fontKey: "sans-600", sizes: [23, 21, 18], maxWidth: 725, maxLines: 1 });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${escape(card.alt)}">${fontFaceStyle()}
<defs><linearGradient id="share-bg" x2="1" y2="1"><stop stop-color="${PALETTE.navyDeep}"/><stop offset="1" stop-color="${PALETTE.greenDeep}"/></linearGradient></defs>
<rect width="1200" height="630" fill="url(#share-bg)"/><rect x="0" y="0" width="12" height="630" fill="${PALETTE.gold}"/>
${text("WIRKUNGSÖKONOMIE · WIRKUNGSTICKER", 72, 77, 24, { color: PALETTE.goldLight })}
<svg x="1070" y="47" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="${PALETTE.goldLight}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconMarkup(input.author ? "diskurs" : categoryIcon(input.topic.split(" · ")))}</svg>
${text(kind.lines[0], 72, 148, kind.size, { color: PALETTE.goldLight })}
${fit.lines.map((line, index) => text(line, 72, 222 + index * fit.size * 1.15, fit.size, { serif: true, weight: 700 })).join("")}
<path d="M72 544H1128" stroke="${PALETTE.gold}" stroke-opacity=".55"/>
${text(footer.lines[0], 72, 587, footer.size)}${text("wirkungsoekonomie.de", 835, 587, 23, { color: PALETTE.goldLight })}</svg>`;
  return { svg, width: 1200, height: 630, format: "jpeg", quality: 88, truncated: fit.truncated };
}

export function articleFromPage(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
  for (const match of head.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const article = JSON.parse(match[1]);
      if (["Article", "AnalysisNewsArticle"].includes(article["@type"])) return article;
    } catch { /* Other JSON-LD is not a ticker article. */ }
  }
  return null;
}

export async function buildArticleShareImages(root, { renderBatch = chromeRenderBatch, chrome = findChrome(), log = console.log } = {}) {
  const ticker = path.join(root, "wirkungsticker");
  if (!fs.existsSync(ticker)) return { cards: 0, rendered: 0 };
  const cards = new Map();
  const visit = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name === "index.html") {
        const html = fs.readFileSync(file, "utf8");
        const card = articleShareCard(articleFromPage(html));
        if (card && html.includes(`${SITE}${PREFIX}`) && !html.includes(`property="og:image" content="${card.url}"`)) throw new Error(`SHARE_CARD_METADATA_MISMATCH:${path.relative(root, file)}`);
        if (card && html.includes(`property="og:image" content="${card.url}"`)) cards.set(card.url, card);
      }
    }
  };
  visit(ticker);
  const valid = file => {
    try { const info = inspectImage(fs.readFileSync(file)); return info.mime === "image/jpeg" && info.width === 1200 && info.height === 630 && info.byte_length < 5 * 1024 * 1024; }
    catch { return false; }
  };
  const missing = [...cards.values()].map(card => ({ ...card, file: path.join(root, new URL(card.url).pathname.slice(1)) })).filter(card => !valid(card.file));
  // Batches bound browser memory. An unchanged file is reused on repeat builds.
  for (let offset = 0; offset < missing.length; offset += 40) {
    const batch = missing.slice(offset, offset + 40);
    const items = batch.map(renderShareCard);
    // Same isolated-runner mode as the existing title-image CI, never a user
    // profile. SVG text is escaped; all remote/file requests are blocked.
    await renderBatch(items, { chrome, noSandbox: process.env.GITHUB_ACTIONS === "true" || process.env.WT_CHROME_NO_SANDBOX === "true", onImage: async (png, index) => {
      const card = batch[index];
      const info = inspectImage(png);
      if (info.mime !== "image/jpeg" || info.width !== 1200 || info.height !== 630 || png.length >= 5 * 1024 * 1024) throw new Error("SHARE_CARD_RASTER_INVALID");
      fs.mkdirSync(path.dirname(card.file), { recursive: true });
      fs.writeFileSync(card.file, png);
    } });
    log(`Linkvorschauen: ${Math.min(offset + batch.length, missing.length)}/${missing.length} erzeugt.`);
  }
  if (missing.some(card => !valid(card.file))) throw new Error("SHARE_CARD_ASSET_MISSING");
  return { cards: cards.size, rendered: missing.length };
}
