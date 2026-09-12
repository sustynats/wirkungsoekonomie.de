import fs from 'node:fs';
import { createBridgeRuntime } from './runtime.mjs';
import { processingMode } from '../processing-mode.mjs';
import { finalizeCommittedBridge } from './finalization.mjs';
if (processingMode() !== 'dropbox_chatgpt_bridge') throw new Error('BRIDGE_MODE_REQUIRED');
const bridge = createBridgeRuntime();
const now = new Date().toISOString();
await bridge.store.acquire(now, process.env.WOEK_NEWS_BRIDGE_PHASE || 'combined');
// The workflow invokes this only after its atomic canonical-data push succeeded.
const stories = JSON.parse(fs.readFileSync(new URL('../../../data/news/stories.json', import.meta.url))).stories;
const editorialFile = new URL('../../../data/news/editorial-analyses.json', import.meta.url);
const editorials = fs.existsSync(editorialFile) ? JSON.parse(fs.readFileSync(editorialFile)).analyses : [];
await finalizeCommittedBridge(bridge, { stories, editorials, now, committed: true });
