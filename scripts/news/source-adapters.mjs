import { createHash } from "node:crypto";

const text = (value, limit = 1600) => String(value || "").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim().slice(0, limit);
const hash = (value) => createHash("sha256").update(value).digest("hex");
function record(source, { title, summary = "", url, published_at = null, ...metadata }) {
  if (!title || !url) return null;
  const target = new URL(url, source.url);
  if (target.protocol !== "https:") return null;
  const published = Date.parse(published_at || "");
  return { source_id: source.source_id, publisher: source.name, source_type: source.source_type, primary_source: Boolean(source.primary_source), source_priority: 0, source_topic: source.topic, title: text(title, 220), summary: text(summary), url: target.href, guid: target.href, published_at: Number.isFinite(published) ? new Date(published).toISOString() : null, categories: [], item_id: hash(target.href), content_hash: hash(`${title}:${summary}:${published_at}`), ...metadata };
}

export function datedSource(source, now) {
  const today = new Date(now).toISOString().slice(0, 10);
  const since = new Date(Date.parse(now) - Number(source.lookback_days || 3) * 86400000).toISOString().slice(0, 10);
  return { ...source, feed_url: source.feed_url?.replaceAll("{today}", today).replaceAll("{since_date}", since) };
}

export function parseResearchApi(raw, source) {
  const payload = JSON.parse(raw);
  if (!Array.isArray(payload?.resultList?.result)) throw new Error("RESEARCH_API_SCHEMA_CHANGED");
  return payload.resultList.result.filter((item) => item.isOpenAccess === "Y").slice(0, source.max_items || 25).map((item) => record(source, {
    title: item.title, summary: item.abstractText,
    url: `https://europepmc.org/article/${encodeURIComponent(item.source)}/${encodeURIComponent(item.id)}`,
    published_at: item.firstPublicationDate,
    research_metadata: { doi: item.doi || null, journal: item.journalInfo?.journal?.title || item.journalTitle || null, publication_types: item.pubTypeList?.pubType || [], is_open_access: true, verification_scope: "public metadata and abstract, not a full methodology review", author_list: item.authorString || null },
  })).filter(Boolean);
}

export function parseNewsSitemap(raw, source) {
  if (/<!DOCTYPE|<!ENTITY/i.test(raw)) throw new Error("FEED_DTD_NOT_ALLOWED");
  return [...String(raw).matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)].slice(0, source.max_items || 60).map((match) => {
    const field = (key) => match[1].match(new RegExp(`<${key}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${key}>`, "i"))?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
    // lastmod is not publication time. Generic sitemaps are discovery-only.
    return record(source, { title: field("news:title"), url: field("loc"), published_at: field("news:publication_date") });
  }).filter(Boolean);
}

export function parseHtmlIndex(raw, source) {
  if (source.access?.html_index !== true) throw new Error("HTML_INDEX_NOT_AUTHORIZED");
  if (source.html_layout === "berlin_press_table") {
    // The public Berlin press portal is an explicitly offered, robots-allowed
    // index. Read only date, title, authority and link from its result table.
    return [...String(raw).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].slice(0, source.max_items || 30).map((match) => {
      const cells = [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cell[1]);
      const titleLink = cells[1]?.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
      const date = text(cells[0], 20).match(/(\d{2})\.(\d{2})\.(\d{4})/);
      return record(source, {
        title: titleLink?.[2], url: titleLink?.[1],
        published_at: date ? `${date[3]}-${date[2]}-${date[1]}T00:00:00+02:00` : null,
        authority: text(cells[2], 180) || null,
      });
    }).filter(Boolean);
  }
  if (source.html_layout === "pressroom_article_list") {
    // Explicit adapter for the provider's public press-room listing. No images,
    // login, search endpoint or forbidden Atom endpoint is requested.
    return String(raw).split(/<li\b[^>]*class=["'][^"']*\barticle__item\b[^"']*["'][^>]*>/i).slice(1, (source.max_items || 30) + 1).map((block) => {
      const titleLink = block.match(/<h3\b[^>]*>[\s\S]*?<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
      return record(source, { title: titleLink?.[2], url: titleLink?.[1], summary: block.match(/<p\b[^>]*class=["'][^"']*article__paragraph-text[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1], published_at: block.match(/<time\b[^>]*datetime=["']([^"']+)["']/i)?.[1] });
    }).filter(Boolean);
  }
  if (source.html_layout === "framer_press_cards") {
    // Explicit adapter for a public, robots-allowed press index rendered by
    // Framer. Only date, headline, short teaser and the original press URL are
    // retained; repeated responsive variants are collapsed by URL.
    const byUrl = new Map();
    for (const match of String(raw).matchAll(/<a\b[^>]*href=["']([^"']*\/presse\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
      const block = match[2];
      const rawDate = text(block, 400).match(/\b(\d{2})\/(\d{2})\/(\d{2,4})\b/);
      const year = rawDate ? (rawDate[3].length === 2 ? `20${rawDate[3]}` : rawDate[3]) : null;
      const summary = [...block.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((entry) => text(entry[1], 1200)).sort((left, right) => right.length - left.length)[0] || "";
      const item = record(source, {
        title: block.match(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/i)?.[1],
        summary,
        url: match[1],
        published_at: rawDate ? `${year}-${rawDate[2]}-${rawDate[1]}T08:00:00+02:00` : null,
      });
      if (item) byUrl.set(item.url, item);
    }
    return [...byUrl.values()].slice(0, source.max_items || 30);
  }
  const entries = [];
  function visit(value) {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!value || typeof value !== "object") return;
    const types = [value["@type"]].flat();
    if (types.some((type) => ["NewsArticle", "Article", "ReportageNewsArticle"].includes(type))) {
      const item = record(source, { title: value.headline || value.name, summary: value.description, url: value.url || value.mainEntityOfPage?.["@id"], published_at: value.datePublished });
      if (item) entries.push(item);
    }
    if (value["@graph"]) visit(value["@graph"]);
    if (value.itemListElement) visit(value.itemListElement);
    if (value.item) visit(value.item);
  }
  for (const match of String(raw).matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(match[1])); } catch { /* malformed page metadata is not evidence */ }
  }
  return entries.slice(0, source.max_items || 60);
}
