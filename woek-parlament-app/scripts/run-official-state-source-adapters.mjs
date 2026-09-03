#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const registryPath = resolve(process.cwd(), "data/state-sources/official-state-source-adapters-v1.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const args = process.argv.slice(2);
const live = args.includes("--live");
const outputArgument = args.find((arg) => arg.startsWith("--output="));
const outputPath = outputArgument ? resolve(outputArgument.slice("--output=".length)) : null;
const userAgent = "Wirkungsoekonomie-State-Source-Monitor/1.0 (+https://parlament.wirkungsoekonomie.de/transparenz)";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assertContract() {
  if (registry.status !== "ACTIVE_DOCUMENT_DISCOVERY_16_OF_16") throw new Error("STATE_ADAPTER_REGISTRY_NOT_ACTIVE");
  if (registry.adapters.length !== 16 || new Set(registry.adapters.map((entry) => entry.jurisdiction_id)).size !== 16) {
    throw new Error("STATE_ADAPTER_REGISTRY_COVERAGE_DRIFT");
  }
  if (registry.coverage.automatic_public_fact_projection_count !== 0 || registry.coverage.automatic_fach_projection_count !== 0) {
    throw new Error("STATE_ADAPTER_AUTOMATIC_PROJECTION_MUST_REMAIN_DISABLED");
  }
  for (const adapter of registry.adapters) {
    const requestUrl = new URL(adapter.request.url);
    if (requestUrl.protocol !== "https:" || requestUrl.hostname !== adapter.request.allowed_host) {
      throw new Error(`STATE_ADAPTER_REQUEST_BOUNDARY_DRIFT:${adapter.jurisdiction_id}`);
    }
    if (adapter.automatic_publication_allowed || !adapter.requires_fact_validation_before_projection || !adapter.requires_fach_review_for_impact_content) {
      throw new Error(`STATE_ADAPTER_PUBLICATION_BOUNDARY_DRIFT:${adapter.jurisdiction_id}`);
    }
    if (!adapter.discovery.marker_pattern || adapter.discovery.minimum_marker_count !== 1) {
      throw new Error(`STATE_ADAPTER_DISCOVERY_CONTRACT_DRIFT:${adapter.jurisdiction_id}`);
    }
  }
  if (Object.values(registry.constraints).some(Boolean)) throw new Error("STATE_ADAPTER_FORBIDDEN_SYNTHESIS_OR_DEPLOYMENT");
}

function requestInit(adapter) {
  const headers = { accept: "text/html,application/xhtml+xml", "user-agent": userAgent };
  if (adapter.transport === "HTTP_GET") return { method: "GET", headers, redirect: "follow" };
  if (adapter.transport === "HTTP_POST_FORM") {
    headers["content-type"] = "application/x-www-form-urlencoded;charset=UTF-8";
    return { method: "POST", headers, body: new URLSearchParams(adapter.request.form), redirect: "follow" };
  }
  throw new Error(`STATE_ADAPTER_UNKNOWN_TRANSPORT:${adapter.jurisdiction_id}`);
}

async function discover(adapter) {
  const response = await fetch(adapter.request.url, { ...requestInit(adapter), signal: AbortSignal.timeout(45_000) });
  const finalUrl = new URL(response.url);
  if (finalUrl.protocol !== "https:" || finalUrl.hostname !== adapter.request.allowed_host) {
    throw new Error(`FINAL_URL_OUTSIDE_ALLOWLIST:${finalUrl.href}`);
  }
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!/^text\/html\b/i.test(contentType)) throw new Error(`UNEXPECTED_CONTENT_TYPE:${contentType || "missing"}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0 || bytes.length > 10_000_000) throw new Error(`RESPONSE_SIZE_OUT_OF_BOUNDS:${bytes.length}`);
  const matches = [...new Set(bytes.toString("utf8").match(new RegExp(adapter.discovery.marker_pattern, "g")) ?? [])];
  if (matches.length < adapter.discovery.minimum_marker_count) throw new Error("NO_OFFICIAL_DOCUMENT_MARKER");
  return {
    adapter_id: adapter.adapter_id,
    jurisdiction_id: adapter.jurisdiction_id,
    jurisdiction_name: adapter.jurisdiction_name,
    status: "HEALTHY_DOCUMENT_DISCOVERY",
    source_authority: adapter.source_authority,
    transport: adapter.transport,
    final_url: finalUrl.href,
    http_status: response.status,
    content_type: contentType,
    response_bytes: bytes.length,
    response_sha256: sha256(bytes),
    marker_semantics: adapter.discovery.marker_semantics,
    candidate_marker_count: matches.length,
    candidate_markers_sample: matches.slice(0, 10),
    automatic_publication_allowed: false,
  };
}

async function discoverWithRetry(adapter) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return { ...(await discover(adapter)), attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000));
    }
  }
  return {
    adapter_id: adapter.adapter_id,
    jurisdiction_id: adapter.jurisdiction_id,
    jurisdiction_name: adapter.jurisdiction_name,
    status: "BLOCKED_FAIL_CLOSED",
    error: lastError instanceof Error ? lastError.message : String(lastError),
    automatic_publication_allowed: false,
    attempts: 2,
  };
}

async function runLive() {
  const results = [];
  for (let index = 0; index < registry.adapters.length; index += 4) {
    results.push(...await Promise.all(registry.adapters.slice(index, index + 4).map(discoverWithRetry)));
  }
  const healthy = results.filter((result) => result.status === "HEALTHY_DOCUMENT_DISCOVERY").length;
  const snapshot = {
    schema_version: "woek-state-official-source-adapter-live-snapshot-1.0",
    checked_at: new Date().toISOString(),
    registry_id: registry.registry_id,
    registry_descriptor_sha256: registry.descriptor_sha256,
    status: healthy === 16 ? "PASS_HEALTHY_DOCUMENT_DISCOVERY_16_OF_16" : "FAIL_CLOSED_STATE_SOURCE_DISCOVERY",
    adapters_expected: 16,
    adapters_healthy: healthy,
    automatic_publication_allowed: false,
    results,
  };
  snapshot.snapshot_sha256 = sha256(Buffer.from(JSON.stringify(snapshot)));
  if (outputPath) writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(snapshot, null, 2)}\n`);
  if (healthy !== 16) process.exitCode = 1;
}

assertContract();
if (live) {
  await runLive();
} else {
  process.stdout.write(`${JSON.stringify({
    gate: "STATE_OFFICIAL_SOURCE_ADAPTER_CONTRACT",
    status: "PASS_ACTIVE_DOCUMENT_DISCOVERY_16_OF_16",
    registry_descriptor_sha256: registry.descriptor_sha256,
    state_adapters: 16,
    automatic_publication_allowed: false,
    live_network_requested: false,
  }, null, 2)}\n`);
}
