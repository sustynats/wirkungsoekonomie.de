#!/usr/bin/env node

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const FEED_PATH = "feeds/neuigkeiten.xml";
const DEFAULT_FEED_URL = "https://wirkungsoekonomie.de/feeds/neuigkeiten.xml";
const MAX_DESCRIPTION_LENGTH = 500;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const all = args.has("--all");
const feedUrl = process.env.SITE_UPDATES_FEED_URL ?? DEFAULT_FEED_URL;
const webhookUrl = process.env.DISCORD_WEBSITE_UPDATES_WEBHOOK_URL;
const statePath = process.env.SITE_UPDATES_DISCORD_STATE_PATH;
const bootstrap = process.env.SITE_UPDATES_DISCORD_BOOTSTRAP === "1";
const publishLatestOnBootstrap = process.env.SITE_UPDATES_DISCORD_PUBLISH_LATEST_ON_BOOTSTRAP === "1";

if (!dryRun && !webhookUrl && !bootstrap) throw new Error("DISCORD_WEBSITE_UPDATES_WEBHOOK_URL is required.");

const current = await loadFeed(feedUrl);
const state = statePath ? await loadState(statePath) : { seen: [] };
const seenGuids = new Set(state.seen);

if (bootstrap && !publishLatestOnBootstrap) {
  await saveState(statePath, current);
  console.log(`Initialised Discord website updates state with ${current.length} feed entries.`);
  process.exit(0);
}

const newItems = bootstrap && publishLatestOnBootstrap
  ? current.slice(0, 1)
  : current.filter((item) => all || !seenGuids.has(item.guid));

if (newItems.length === 0) {
  console.log("No new website updates to publish.");
  process.exit(0);
}

for (const item of [...newItems].reverse()) {
  const payload = webhookPayload(item);
  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    continue;
  }
  const response = await fetch(webhookUrl, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Discord webhook failed for “${item.title}”: ${response.status} ${await response.text()}`);
  console.log(`Published website update: ${item.title}`);
}

await saveState(statePath, current);

async function loadFeed(url) {
  if (process.env.SITE_UPDATES_FEED_FILE === "1") return parseRss(await readFile(FEED_PATH, "utf8"));
  const response = await fetch(url, { headers: { Accept: "application/rss+xml, application/xml, text/xml" } });
  if (!response.ok) throw new Error(`Could not load website updates feed: ${response.status} ${url}`);
  return parseRss(await response.text());
}

async function loadState(file) {
  if (!file) return { seen: [] };
  try {
    const value = JSON.parse(await readFile(file, "utf8"));
    return { seen: Array.isArray(value.seen) ? value.seen.filter((guid) => typeof guid === "string") : [] };
  } catch {
    return { seen: [] };
  }
}

async function saveState(file, items) {
  if (!file || dryRun) return;
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify({ seen: items.map((item) => item.guid), updatedAt: new Date().toISOString() }, null, 2)}\n`);
}

function parseRss(xml) {
  return Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)).map((match) => {
    const block = match[1];
    const value = (name) => decodeXml((block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] ?? "").replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, ""));
    const link = value("link");
    return { title: value("title"), link, guid: value("guid") || link, description: value("description").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), publishedAt: value("pubDate"), category: value("category") };
  }).filter((item) => item.guid && item.title && item.link);
}

function webhookPayload(item) {
  const embed = {
    title: item.title, url: item.link, description: truncate(item.description, MAX_DESCRIPTION_LENGTH), color: 0xc9a64b,
    footer: { text: `${item.category || "Wirkungsökonomie"} • ${formatDate(item.publishedAt)}` },
    fields: [{ name: "Mehr erfahren", value: item.link }],
  };
  const timestamp = new Date(item.publishedAt);
  if (!Number.isNaN(timestamp.getTime())) embed.timestamp = timestamp.toISOString();
  return { username: "WÖk-Website-Updates", allowed_mentions: { parse: [] }, embeds: [embed] };
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Neuigkeit" : new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(date);
}
function truncate(value, length) { return value.length <= length ? value : `${value.slice(0, length - 1).trimEnd()}…`; }
function decodeXml(value) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'").trim();
}
