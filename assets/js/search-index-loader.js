// Shared by the site search, the header suggestions and personal collections.
// Search data is content-addressed; the small manifest is always revalidated.
const pendingManifests = new Map();
const pendingFiles = new Map();

async function checkedFetch(url, cache = "default") {
  const controller = new AbortController();
  let idleTimeout;
  const resetIdleTimeout = () => {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => controller.abort(), 30000);
  };
  const totalTimeout = setTimeout(() => controller.abort(), 180000);
  resetIdleTimeout();
  try {
    const response = await fetch(url, { cache, signal: controller.signal });
    if (!response.ok) throw new Error(`Search data: HTTP ${response.status}`);
    if (!response.body) return new ArrayBuffer(0);
    const reader = response.body.getReader();
    const chunks = [];
    let length = 0;
    resetIdleTimeout();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value.byteLength) {
        chunks.push(value);
        length += value.byteLength;
        resetIdleTimeout();
      }
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return bytes.buffer;
  } finally {
    clearTimeout(idleTimeout);
    clearTimeout(totalTimeout);
  }
}

function checkedPart(part, expectedPrefix) {
  if (!part || !Number.isInteger(part.entries) || part.entries < 0) throw new Error("Invalid search index part");
  const prefix = expectedPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(`^${prefix}-[a-f0-9]{16}\\.json$`).test(part.json)) throw new Error("Invalid search index filename");
  if (part.gzip !== `${part.json}.gz`) throw new Error("Invalid compressed search index filename");
  return part;
}

export function loadSearchManifest(baseUrl) {
  const base = new URL(baseUrl, globalThis.location?.href);
  const key = base.href;
  if (pendingManifests.has(key)) return pendingManifests.get(key);
  const request = (async () => {
    const manifest = JSON.parse(new TextDecoder().decode(
      await checkedFetch(new URL("browser-index-manifest.json", base), "no-cache"),
    ));
    if (manifest.schemaVersion !== 2 || !/^[a-f0-9]{16}$/.test(manifest.version)) throw new Error("Invalid search manifest");
    checkedPart(manifest.core, "search-core");
    for (const archive of manifest.archives || []) checkedPart(archive, `search-archive-${archive.area}`);
    checkedPart(manifest.suggestions, "search-suggestions");
    const total = manifest.core.entries + (manifest.archives || []).reduce((sum, item) => sum + item.entries, 0);
    if (total !== manifest.entries || manifest.coverage?.searchable !== manifest.entries) throw new Error("Incomplete search manifest");
    return manifest;
  })().catch((error) => {
    pendingManifests.delete(key);
    throw error;
  });
  pendingManifests.set(key, request);
  return request;
}

export function loadSearchPart(baseUrl, part) {
  const base = new URL(baseUrl, globalThis.location?.href);
  const key = new URL(part.json, base).href;
  if (pendingFiles.has(key)) return pendingFiles.get(key);
  const request = (async () => {
    let bytes;
    if (typeof DecompressionStream !== "undefined") {
      try {
        const compressed = await checkedFetch(new URL(part.gzip, base));
        bytes = await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
      } catch (error) {
        if (error?.name === "AbortError") throw error;
        bytes = await checkedFetch(new URL(part.json, base));
      }
    } else {
      bytes = await checkedFetch(new URL(part.json, base));
    }
    const entries = JSON.parse(new TextDecoder().decode(bytes));
    if (!Array.isArray(entries) || entries.length !== part.entries) throw new Error("Incomplete search index part");
    return entries;
  })().catch((error) => {
    pendingFiles.delete(key);
    throw error;
  });
  pendingFiles.set(key, request);
  return request;
}

export async function loadBrowserSearchIndex(baseUrl, { includeArchives = true } = {}) {
  const manifest = await loadSearchManifest(baseUrl);
  const parts = includeArchives ? [manifest.core, ...(manifest.archives || [])] : [manifest.core];
  const groups = await Promise.all(parts.map((part) => loadSearchPart(baseUrl, part)));
  const entries = groups.flat();
  const expected = parts.reduce((sum, part) => sum + part.entries, 0);
  if (entries.length !== expected) throw new Error("Incomplete search index");
  return entries;
}

export async function loadSearchSuggestions(baseUrl) {
  const manifest = await loadSearchManifest(baseUrl);
  return loadSearchPart(baseUrl, manifest.suggestions);
}
