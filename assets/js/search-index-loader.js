// Shared by site search, the debate compass and personal knowledge collections.
// The manifest is revalidated; content-addressed indexes can be reused safely.
const pending = new Map();

async function checkedFetch(url, cache = 'default') {
  const controller = new AbortController();
  // A progressing download may take longer than 30 seconds on mobile links.
  // Keep a short stall deadline and a separate bound for the whole request.
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

export function loadBrowserSearchIndex(baseUrl) {
  const base = new URL(baseUrl, globalThis.location?.href);
  const key = base.href;
  if (pending.has(key)) return pending.get(key);
  const request = (async () => {
    let manifest;
    try {
      manifest = JSON.parse(new TextDecoder().decode(await checkedFetch(new URL('browser-index-manifest.json', base), 'no-cache')));
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      // Compatibility for a locally served source checkout or an older release.
      return JSON.parse(new TextDecoder().decode(await checkedFetch(new URL('search-index.json', base))));
    }
    if (manifest.schemaVersion !== 1 || manifest.json !== 'search-index.json' || !/^[a-f0-9]{16}$/.test(manifest.version)) throw new Error('Invalid search manifest');
    let bytes;
    if (typeof DecompressionStream !== 'undefined' && manifest.gzip === `browser-index-${manifest.version}.json.gz`) {
      try {
        const compressed = await checkedFetch(new URL(manifest.gzip, base));
        bytes = await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      } catch (error) {
        // A stalled connection will not improve by downloading a larger file.
        if (error?.name === 'AbortError') throw error;
        bytes = await checkedFetch(new URL(`${manifest.json}?v=${manifest.version}`, base));
      }
    } else bytes = await checkedFetch(new URL(`${manifest.json}?v=${manifest.version}`, base));
    const entries = JSON.parse(new TextDecoder().decode(bytes));
    if (!Array.isArray(entries) || entries.length !== manifest.entries) throw new Error('Incomplete search index');
    return entries;
  })().catch(error => { pending.delete(key); throw error; });
  pending.set(key, request);
  return request;
}
