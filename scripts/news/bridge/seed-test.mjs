import fs from 'node:fs';
import { bridgeSession } from './remote.mjs';
import { DropboxChatGPTBridgeProvider } from './provider.mjs';
import { fetchArticleExcerpt } from '../lib.mjs';
import { loadNewsRegistry } from '../registry.mjs';
import { sourceAccess } from '../access-policy.mjs';

const { store, transport } = bridgeSession();
const now = new Date().toISOString();
await store.acquire(now, 'test');
try {
  const stories = JSON.parse(fs.readFileSync(new URL('../../../data/news/stories.json', import.meta.url))).stories;
  const registry = loadNewsRegistry(new URL('../../../', import.meta.url).pathname);
  const requested = process.argv.find(a => a.startsWith('--story='))?.slice(8);
  const candidates = stories.filter(s => !s.published && !s.retired && s.listed !== false && s.sources?.length
    && s.source_integrity?.status === 'verified' && s.event_id && s.preanalysis?.internal_relevance_score >= 50
    && (!requested || requested === s.story_id)).sort((a,b) => Date.parse(b.first_seen) - Date.parse(a.first_seen));
  const candidate = structuredClone(candidates[0]);
  if (!candidate) throw new Error('NO_REAL_TEST_CANDIDATE');
  for (const source of candidate.sources.slice(0,3)) {
    const registered = registry.sources.find(s => s.source_id === source.source_id);
    if (!registered || !sourceAccess(registered,'article').allowed) continue;
    try { source.article_excerpt = (await fetchArticleExcerpt(source, registered, registry.policy)).excerpt; source.retrieved_at = now; }
    catch { /* Retain lawful feed excerpt and explicit limited source context. */ }
  }
  const provider = new DropboxChatGPTBridgeProvider({ store, transport, stageOnly: true, maxJobs: 1 });
  const result = await provider.enqueue([candidate], stories, now, { testOnly: true });
  console.log(JSON.stringify({ test_only: true, title: candidate.title, result }));
} finally { await store.release(true); }
