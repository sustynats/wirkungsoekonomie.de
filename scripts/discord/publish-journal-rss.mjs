#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const FEED_PATH = "feeds/journal.xml";
const DEFAULT_FEED_URL = "https://wirkungsoekonomie.de/feeds/journal.xml";
const MAX_DESCRIPTION_LENGTH = 350;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const all = args.has("--all");
const after = parseAfter(process.argv.slice(2));
const feedUrl = process.env.JOURNAL_FEED_URL ?? DEFAULT_FEED_URL;
const webhookUrl = process.env.DISCORD_JOURNAL_WEBHOOK_URL;
const statePath = process.env.JOURNAL_DISCORD_STATE_PATH;
const bootstrap = process.env.JOURNAL_DISCORD_BOOTSTRAP === "1";

if (!dryRun && !webhookUrl && !bootstrap) {
  throw new Error("DISCORD_JOURNAL_WEBHOOK_URL is required.");
}

const current = await loadFeed(feedUrl);
const state = statePath ? await loadState(statePath) : { seen: [] };
const seenGuids = new Set(state.seen);
const candidates = after ? current.filter((item) => dateValue(item.publishedAt) > after) : current;

if (bootstrap) {
  await saveState(statePath, current);
  console.log(`Initialised Discord journal state with ${current.length} feed entries.`);
  process.exit(0);
}

const newItems = candidates.filter((item) => all || !seenGuids.has(item.guid));

if (newItems.length === 0) {
  console.log("No new journal entries to publish.");
  process.exit(0);
}

for (const item of [...newItems].reverse()) {
  const payload = webhookPayload(item);
  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    continue;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`Discord webhook failed for “${item.title}”: ${response.status} ${await response.text()}`);
  }
  console.log(`Published: ${item.title}`);
}

await saveState(statePath, current);

async function loadFeed(url) {
  if (process.env.JOURNAL_FEED_FILE === "1") {
    try {
      return parseRss(await readFile(FEED_PATH, "utf8"));
    } catch {
      throw new Error(`Could not read local journal feed: ${FEED_PATH}`);
    }
  }
  const response = await fetch(url, { headers: { Accept: "application/rss+xml, application/xml, text/xml" } });
  if (!response.ok) throw new Error(`Could not load journal feed: ${response.status} ${url}`);
  return parseRss(await response.text());
}

async function loadState(path) {
  if (!path) return { seen: [] };
  try {
    const value = JSON.parse(await readFile(path, "utf8"));
    return { seen: Array.isArray(value.seen) ? value.seen.filter((guid) => typeof guid === "string") : [] };
  } catch {
    return { seen: [] };
  }
}

async function saveState(path, items) {
  if (!path || dryRun) return;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify({ seen: items.map((item) => item.guid), updatedAt: new Date().toISOString() }, null, 2)}\n`);
}

function parseRss(xml) {
  return Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi))
    .map((match) => parseItem(match[1]))
    .filter((item) => item.guid && item.title && item.link);
}

function parseItem(block) {
  const value = (name) => decodeXml((block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] ?? "").replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, ""));
  const categories = Array.from(block.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/gi))
    .map((match) => decodeXml(match[1]).trim())
    .filter(Boolean);
  const image = block.match(/<media:(?:content|thumbnail)\b[^>]*\burl=["']([^"']+)["']/i)?.[1];
  const link = value("link");
  return {
    title: value("title"),
    link,
    guid: value("guid") || link,
    description: value("description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    publishedAt: value("pubDate"),
    categories,
    image
  };
}

function webhookPayload(item) {
  const categories = item.categories.slice(0, 6).map((value) => `• ${value}`).join("\n");
  const embed = {
    title: item.title,
    url: item.link,
    description: truncate(item.description, MAX_DESCRIPTION_LENGTH),
    color: 0x176b5b,
    footer: { text: `Journal der Wirkungsökonomie • ${formatDate(item.publishedAt)}` },
    timestamp: new Date(item.publishedAt).toISOString(),
    fields: [{ name: "Auf der Website lesen", value: item.link }]
  };
  if (categories) embed.fields.unshift({ name: "Schlagworte", value: categories });
  if (item.image) embed.thumbnail = { url: item.image };

  return {
    username: "WÖk-Wirkungscheck",
    allowed_mentions: { parse: [] },
    embeds: [embed]
  };
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Journal" : new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(date);
}

function truncate(value, length) {
  return value.length <= length ? value : `${value.slice(0, length - 1).trimEnd()}…`;
}

function parseAfter(values) {
  const input = values.find((value) => value.startsWith("--after="));
  if (!input) return null;
  const timestamp = Date.parse(input.slice("--after=".length));
  if (Number.isNaN(timestamp)) throw new Error("--after requires an ISO date, for example --after=2026-07-10T18:18:00Z");
  return timestamp;
}

function dateValue(value) {
  const date = Date.parse(value);
  return Number.isNaN(date) ? 0 : date;
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
