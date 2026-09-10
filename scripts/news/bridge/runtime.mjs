import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { bridgeSession } from './remote.mjs';
import { DropboxChatGPTBridgeProvider } from './provider.mjs';
import { ChatGPTBridgeVisualProvider } from './visual.mjs';
export function createBridgeRuntime() {
  const { store, transport } = bridgeSession();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'woek-bridge-images-'));
  return new DropboxChatGPTBridgeProvider({ store, transport,
    visualProvider: new ChatGPTBridgeVisualProvider({ transport, directory }),
    stageOnly: process.env.WOEK_NEWS_BRIDGE_PUBLISH !== 'true',
    maxJobs: Math.min(12, Math.max(1, Number(process.env.WOEK_NEWS_BRIDGE_MAX_JOBS || 6))),
    retentionDays: Number(process.env.WOEK_NEWS_BRIDGE_RETENTION_DAYS || 30),
  });
}
