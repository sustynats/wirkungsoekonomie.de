import fs from "node:fs";
import path from "node:path";
import { sourceAccess } from "./access-policy.mjs";

export function loadNewsRegistry(root) {
  const base = JSON.parse(fs.readFileSync(path.join(root, "content/news/source-registry.json"), "utf8"));
  const extensionPath = path.join(root, "content/news/media-registry.json");
  const extension = fs.existsSync(extensionPath) ? JSON.parse(fs.readFileSync(extensionPath, "utf8")) : { sources: [] };
  const sources = [...base.sources, ...extension.sources].map((source) => ({
    publisher_id: source.source_id.startsWith("bundesregierung-") ? "bundesregierung" : source.source_id.startsWith("bundestag-") ? "bundestag" : source.source_id,
    publisher_kind: "institution", research_lane: "primary", language: "de", geography: ["DE"],
    frequency_class: "high_frequency",
    access: { status: "public", cost_usd: 0, requires_payment: false, requires_login: false, article: "bounded_public_text" },
    ...source,
    ...(extension.source_overrides?.[source.source_id] || {}),
  })).map((source) => source.source_type.startsWith("woek_") ? { ...source, publisher_kind: "own_publication", source_role: "own_publication", research_lane: "primary" } : source).map((source) => (extension.public_article_sources || []).includes(source.source_id) ? { ...source, access: { ...source.access, article: "bounded_public_text", note: "RSS-Metadaten zur Erkennung; bei ausgewählten relevanten Ereignissen begrenzten frei zugänglichen Originaltext flüchtig prüfen. Robots-Regeln, Login- und Paywall-Sperren gelten weiterhin. Keine Bilder oder Artikelkopien veröffentlichen." } } : source);
  return { ...base, sources, policy: { ...base.policy, ...extension.policy, news_access_budget_usd: 0, free_public_sources_only: true, paywall_bypass: false } };
}

export function registryErrors(registry) {
  const errors = [];
  const ids = new Set(), feeds = new Set();
  for (const source of registry.sources) {
    if (!/^[a-z0-9-]+$/.test(source.source_id || "") || !/^[a-z0-9-]+$/.test(source.publisher_id || "") || !source.name) errors.push(`SOURCE_INVALID:${source.source_id}`);
    if (ids.has(source.source_id)) errors.push(`SOURCE_ID_DUPLICATE:${source.source_id}`);
    ids.add(source.source_id);
    if (source.enabled) {
      if (!source.feed_url) errors.push(`SOURCE_FEED_MISSING:${source.source_id}`);
      else if (feeds.has(source.feed_url)) errors.push(`SOURCE_FEED_DUPLICATE:${source.source_id}`);
      feeds.add(source.feed_url);
      const access = sourceAccess(source);
      if (!access.allowed) errors.push(`SOURCE_ACCESS_INVALID:${source.source_id}:${access.reason}`);
    }
    for (const url of [source.url, source.feed_url].filter(Boolean)) {
      try { if (new URL(url).protocol !== "https:") throw new Error(); } catch { errors.push(`SOURCE_HTTPS_REQUIRED:${source.source_id}`); }
    }
  }
  return errors;
}
