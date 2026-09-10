import fs from 'node:fs';
import { createBridgeRuntime } from './runtime.mjs';
import { processingMode } from '../processing-mode.mjs';
if (processingMode() !== 'dropbox_chatgpt_bridge') throw new Error('BRIDGE_MODE_REQUIRED');
const bridge = createBridgeRuntime();
const now = new Date().toISOString();
await bridge.store.acquire(now, process.env.WOEK_NEWS_BRIDGE_PHASE || 'combined');
// The workflow invokes this only after its atomic canonical-data push succeeded.
const stories = JSON.parse(fs.readFileSync(new URL('../../../data/news/stories.json', import.meta.url))).stories;
await bridge.finalize(stories, now, { committed: true });
console.log(JSON.stringify(await bridge.monitor(now)));
