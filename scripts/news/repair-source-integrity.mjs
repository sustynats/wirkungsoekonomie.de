import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evidenceGroups } from "./newsroom.mjs";
import { loadNewsRegistry } from "./registry.mjs";
import { sha256 } from "./lib.mjs";
import { reconcileSourceIdentity, sourceIntegrityForStory, sourceIntegrityRecord } from "./source-integrity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const file = path.join(root, "data/news/stories.json");
const store = JSON.parse(fs.readFileSync(file, "utf8"));
const registry = loadNewsRegistry(root);
const registryById = new Map(registry.sources.map((source) => [source.source_id, source]));
const now = new Date().toISOString();
const changed = [];
const repairedPublicationDates = new Set([
  "https://www.bundestag.de/presse/hib/kurzmeldungen-1210184",
  "https://www.bundestag.de/presse/hib/kurzmeldungen-1209814",
]);

function sourceSignature(sources = []) {
  return JSON.stringify(sources.map((source) => [source.source_id, source.url, source.title, source.published_at, source.primary_source]));
}

function remapReferences(story, mappings) {
  for (const claim of story.claims || []) {
    for (const proof of claim.evidence || []) {
      const mapping = mappings.find((entry) => entry.oldUrl === proof.url);
      if (mapping) { proof.source_id = mapping.newId; proof.url = mapping.newUrl; }
    }
    const citedIds = [...new Set((claim.evidence || []).map((proof) => proof.source_id).filter(Boolean))];
    if (citedIds.length === 1 && mappings.some((entry) => entry.oldId === claim.source_id)) claim.source_id = citedIds[0];
  }
  for (const followup of story.followups || []) {
    const possibilities = mappings.filter((entry) => entry.oldId === followup.source_id);
    if (possibilities.length === 1) followup.source_id = possibilities[0].newId;
  }
}

for (const story of store.stories.filter((entry) => entry.published && entry.listed !== false)) {
  const before = sourceSignature(story.sources);
  const mappings = [];
  story.sources = (story.sources || []).map((source) => {
    const collection = registryById.get(source.collection_source_id || source.source_id);
    const normalized = reconcileSourceIdentity(source, collection, registry);
    if (source.source_id !== normalized.source_id || source.url !== normalized.url) mappings.push({ oldId: source.source_id, oldUrl: source.url, newId: normalized.source_id, newUrl: normalized.url });
    return normalized;
  });
  remapReferences(story, mappings);
  const previousSources = story.versions?.at(-1)?.source_versions || [];
  const changedSinceVersion = sourceSignature(story.sources) !== before
    || JSON.stringify(story.sources.map((source) => [source.source_id, source.url, source.content_hash])) !== JSON.stringify(previousSources.map((source) => [source.source_id, source.url, source.content_hash]))
    || story.sources.some((source) => repairedPublicationDates.has(source.url) && !(story.source_integrity?.version));
  const integrity = sourceIntegrityForStory(story, registry, store.stories, now);
  if (!changedSinceVersion) continue;
  story.source_integrity = sourceIntegrityRecord(integrity);
  story.evidence_groups = evidenceGroups(story.sources);
  story.content_hash = sha256(story.sources.map((source) => `${source.url}:${source.content_hash}`).sort().join("\n"));
  const version = Number(story.current_version || 0) + 1;
  story.current_version = version;
  story.last_updated = now;
  story.updated_at = now;
  story.versions = [...(story.versions || []), {
    version,
    analyzed_at: now,
    content_hash: story.content_hash,
    source_summary: story.source_summary,
    analysis: story.analysis,
    provider: null,
    model: null,
    mode: "source_integrity_repair",
    method_sources: [],
    claims: story.claims,
    source_versions: story.sources.map((source) => ({ source_id: source.source_id, url: source.url, content_hash: source.content_hash })),
  }];
  story.publication_history = [...(story.publication_history || []), { version, published_at: now, source_count: story.sources.length, change: "source_integrity_correction" }];
  story.corrections = [...(story.corrections || []), {
    at: now,
    type: "source_integrity",
    note: mappings.length
      ? "Die technische Quellenzuordnung wurde anhand der tatsächlichen Zieladresse korrigiert; Inhalt und Belegstatus wurden erneut geprüft."
      : "Eine thematisch fremde Quelle wurde entfernt; die verbleibenden Belege und die Analyse wurden erneut auf Konsistenz geprüft.",
  }];
  changed.push({ story_id: story.story_id, slug: story.slug, mappings, source_count: story.sources.length, integrity: integrity.status });
}

store.updated_at = now;
store.public_updated_at = now;
fs.writeFileSync(file, `${JSON.stringify(store, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ changed: changed.length, stories: changed }, null, 2));
