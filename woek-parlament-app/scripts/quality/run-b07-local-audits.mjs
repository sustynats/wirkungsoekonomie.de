#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const port = 3018;
const baseUrl = `http://127.0.0.1:${port}`;
const auditRoot = path.join(process.cwd(), "data", "autopilot", "audit", "2.3-remediated");
mkdirSync(auditRoot, { recursive: true });

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env: { ...process.env, ...env } });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} exited ${code}`)));
  });
}

async function waitReady() {
  const deadline = Date.now() + 30_000;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
      lastError = new Error(`health ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw lastError ?? new Error("B07 local server did not become ready");
}

const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port), "-H", "127.0.0.1"], {
  stdio: "inherit",
  env: { ...process.env, PORT: String(port) },
});

try {
  await waitReady();
  await run(process.execPath, ["scripts/quality/check-government-source-vs-view.mjs"], {
    WOEK_SOURCE_VS_VIEW_BASE_URL: baseUrl,
    WOEK_SOURCE_VS_VIEW_REPORT: path.join(auditRoot, "SOURCE-VS-VIEW-B07.json"),
  });
  await run(process.execPath, ["scripts/quality/check-fachvollstaendigkeit-source-vs-view.mjs"], {
    WOEK_SOURCE_VS_VIEW_BASE_URL: baseUrl,
    WOEK_FACHVOLLSTAENDIGKEIT_SOURCE_VS_VIEW_REPORT: path.join(auditRoot, "FACHVOLLSTAENDIGKEIT-SOURCE-VS-VIEW-B07.json"),
  });
  await run(process.execPath, ["scripts/quality/check-eu-source-vs-view.mjs"], {
    WOEK_SOURCE_VS_VIEW_BASE_URL: baseUrl,
    WOEK_EU_SOURCE_VS_VIEW_REPORT: path.join(auditRoot, "EU-SOURCE-VS-VIEW-B07.json"),
  });
  console.log(JSON.stringify({ status: "B07_RENDERED_SOURCE_VIEW_AUDITS_PASS", base_url: baseUrl }, null, 2));
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    const timer = setTimeout(() => { server.kill("SIGKILL"); resolve(); }, 3_000);
    server.once("exit", () => { clearTimeout(timer); resolve(); });
  });
}
