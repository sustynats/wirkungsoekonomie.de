import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

function loadEnvironment() {
  const values = {};
  return readFile(path.resolve(process.cwd(), ".env.local"), "utf8").then((contents) => {
    for (const line of contents.split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key) values[key] = value;
    }
    return values;
  });
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function hash(value) {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

function rootPrefix(zip) {
  const roots = new Set(Object.values(zip.files).filter((entry) => !entry.dir).map((entry) => entry.name.split("/")[0]).filter(Boolean));
  return roots.size === 1 ? `${[...roots][0]}/` : "";
}

function logicalName(entry, prefix) {
  return prefix && entry.name.startsWith(prefix) ? entry.name.slice(prefix.length) : entry.name;
}

function entries(zip, prefix, expression) {
  return Object.values(zip.files).filter((entry) => !entry.dir && expression.test(logicalName(entry, prefix)));
}

function required(zip, prefix, filename) {
  const entry = zip.file(`${prefix}${filename}`);
  if (!entry) throw new Error(`Missing ${filename}.`);
  return entry;
}

async function json(entry) {
  return JSON.parse(await entry.async("string"));
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRegister(input) {
  const register = input && typeof input === "object" ? input : {};
  const commitments = Array.isArray(register.commitments) ? register.commitments.map((inputCommitment) => {
    const commitment = inputCommitment && typeof inputCommitment === "object" ? inputCommitment : {};
    const key = text(commitment.commitment_key);
    const location = text(commitment.source_location);
    const page = typeof commitment.source_page === "number" || typeof commitment.source_page === "string" ? String(commitment.source_page) : null;
    const domains = Array.isArray(commitment.policy_domains) ? commitment.policy_domains.map(text).filter(Boolean) : [];
    return {
      commitment_key: key,
      title: (text(commitment.title) || location || `Zusage ${key}`).replace(/\s+/g, " ").slice(0, 500),
      commitment_text: text(commitment.commitment_text) || text(commitment.exact_text),
      policy_domain: text(commitment.policy_domain) || text(commitment.policy_field) || domains[0] || null,
      source_location: { ...(page ? { page } : {}), ...(location ? { section: location.slice(0, 500) } : {}) },
      temporal_scope: text(commitment.temporal_scope) || null
    };
  }) : [];
  return {
    source_key: text(register.source_key),
    source_hash: text(register.source_hash) || text(register.source_sha256),
    commitments
  };
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function main() {
  const argument = process.argv.find((item) => item.startsWith("--input="));
  if (!argument) throw new Error("Usage: node scripts/import-final-release-delivery.mjs --input=/path/to/release.zip");
  const environment = await loadEnvironment();
  const baseUrl = environment.SUPABASE_URL ?? environment.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = environment.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) throw new Error("Protected database configuration is unavailable.");
  const restBase = `${baseUrl.replace(/\/$/, "")}/rest/v1/`;
  const rest = async (resource, init = {}) => {
    const response = await fetch(`${restBase}${resource}`, {
      ...init,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Accept-Profile": "parliament",
        ...(init.method && init.method !== "GET" ? { "Content-Profile": "parliament", "Content-Type": "application/json" } : {}),
        ...(init.headers ?? {})
      }
    });
    const payload = await response.text();
    if (!response.ok) throw new Error(`Protected import failed at ${resource}: ${response.status} ${payload.slice(0, 500)}`);
    return payload ? JSON.parse(payload) : null;
  };

  const input = path.resolve(argument.slice("--input=".length));
  const archive = await readFile(input);
  const zip = await JSZip.loadAsync(archive);
  const prefix = rootPrefix(zip);
  const releaseSummary = await json(required(zip, prefix, "release-summary.json"));
  const publicReport = await required(zip, prefix, "RELEASE-REPORT.md").async("string");
  const rawReviews = await Promise.all(entries(zip, prefix, /(^|\/)review-result\.json$/i).map(json));
  const rawRegisters = await Promise.all(entries(zip, prefix, /^commitment-registers\/[^/]+\/commitment-register\.json$/i).map(json));
  const normalizedRegisters = rawRegisters.map(normalizeRegister);
  const linksEnvelope = await json(required(zip, prefix, "commitment-links.json"));
  const links = Array.isArray(linksEnvelope) ? linksEnvelope : linksEnvelope.links;
  const stateTargets = await json(required(zip, prefix, "state-target-register.json"));
  if (rawReviews.length !== 28 || normalizedRegisters.length !== 7 || !Array.isArray(links) || links.length > 2_000 || !Array.isArray(stateTargets.targets) || stateTargets.targets.length !== 28) {
    throw new Error("The delivery no longer matches the validated release structure.");
  }

  // The final review proposals were preflighted and stored before this
  // continuation. Confirm their exact package identity before importing any
  // dependent register data.
  for (const review of rawReviews) {
    const rows = await rest(`external_review_results?case_id=eq.${encodeURIComponent(review.case_id)}&review_id=eq.${encodeURIComponent(review.review_id)}&input_package_hash=eq.${encodeURIComponent(review.input_package_hash)}&select=id&limit=1`);
    if (!Array.isArray(rows) || rows.length !== 1) throw new Error(`Missing protected review proposal for case ${review.case_id}.`);
  }

  const sourceRows = await Promise.all(normalizedRegisters.map(async (register) => {
    const rows = await rest(`political_source_documents?source_key=eq.${encodeURIComponent(register.source_key)}&select=id,source_key&limit=1`);
    if (!Array.isArray(rows) || rows.length !== 1) throw new Error(`Political source ${register.source_key} is not registered.`);
    return { register, sourceId: rows[0].id };
  }));
  const commitmentKeys = new Set(normalizedRegisters.flatMap((register) => register.commitments.map((commitment) => commitment.commitment_key)));
  for (const link of links) {
    if (!commitmentKeys.has(link.commitment_key)) throw new Error(`A commitment link refers to an unknown commitment key.`);
  }

  for (const { register, sourceId } of sourceRows) {
    const rows = register.commitments.map((commitment) => ({
      source_document_id: sourceId,
      ...commitment,
      extraction_status: "SOURCE_EXTRACTED",
      source_hash: register.source_hash,
      updated_at: new Date().toISOString()
    }));
    for (const batch of chunks(rows, 100)) {
      await rest("policy_commitments?on_conflict=commitment_key", { method: "POST", headers: { Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(batch) });
    }
    await rest(`political_source_documents?id=eq.${encodeURIComponent(sourceId)}`, {
      method: "PATCH",
      body: JSON.stringify({ source_hash: register.source_hash, publication_status: "STRUCTURED", updated_at: new Date().toISOString() })
    });
  }

  // PostgREST deliberately caps a single response at 1,000 rows. Fetch both
  // pages so every source-bound commitment can be resolved before links are
  // written.
  const commitmentRows = [];
  for (let offset = 0; offset < commitmentKeys.size; offset += 1_000) {
    const page = await rest(`policy_commitments?select=id,commitment_key&offset=${offset}&limit=1000`);
    commitmentRows.push(...page);
    if (page.length < 1_000) break;
  }
  const commitmentIdByKey = new Map(commitmentRows.map((row) => [row.commitment_key, row.id]));
  if (commitmentIdByKey.size < commitmentKeys.size) throw new Error("Not every structured commitment could be retrieved after import.");
  const existingLinks = await rest("commitment_decision_links?select=id&limit=1");
  if (Array.isArray(existingLinks) && existingLinks.length > 0) throw new Error("Commitment links already exist; automatic duplicate insertion was stopped.");
  const linkRows = links.map((link) => ({
    commitment_id: commitmentIdByKey.get(link.commitment_key),
    case_id: link.case_id,
    decision_unit_id: link.decision_unit_id,
    relationship_status: link.relationship_status,
    factual_rationale: link.factual_rationale,
    source_refs: link.source_refs,
    implementation_scope: link.implementation_scope,
    impact_path_refs: Array.isArray(link.impact_path_refs) ? link.impact_path_refs : [],
    official_status_check: typeof link.official_status_check === "string" ? link.official_status_check : null,
    effect_assessment: typeof link.effect_assessment === "string" ? link.effect_assessment : null,
    verification_status: "PROPOSED",
    updated_at: new Date().toISOString()
  }));
  for (const batch of chunks(linkRows, 100)) await rest("commitment_decision_links", { method: "POST", body: JSON.stringify(batch) });

  const targetRegisterRows = await rest(`state_target_registers?register_key=eq.${encodeURIComponent(stateTargets.register_id)}&source_sha256=eq.${encodeURIComponent(stateTargets.source.source_sha256)}&select=id&limit=1`);
  const targetRegisterPayload = {
    register_key: stateTargets.register_id,
    parliament_id: "landtag-st-2026",
    jurisdiction_id: stateTargets.jurisdiction_id,
    title: stateTargets.source.title,
    source_url: stateTargets.source.source_url,
    source_sha256: stateTargets.source.source_sha256,
    source_published_at: stateTargets.source.published_at,
    declared_target_count: stateTargets.source.declared_target_count,
    register_status: "STRUCTURED_AND_VALIDATED",
    imported_payload: { ...stateTargets, payload_hash: hash(stateTargets) }
  };
  const targetRegisterId = targetRegisterRows[0]?.id ?? (await rest("state_target_registers", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(targetRegisterPayload) }))[0]?.id;
  if (!targetRegisterId) throw new Error("State target register could not be stored.");
  if (targetRegisterRows[0]) {
    await rest(`state_target_registers?id=eq.${encodeURIComponent(targetRegisterId)}`, { method: "PATCH", body: JSON.stringify(targetRegisterPayload) });
    await rest(`state_targets?register_id=eq.${encodeURIComponent(targetRegisterId)}`, { method: "DELETE" });
  }
  const targetRows = stateTargets.targets.map((target) => ({
    register_id: targetRegisterId,
    target_key: target.id,
    label: target.label,
    source_quote: target.source_quote,
    source_page: target.source_location.page,
    source_section: target.source_location.section,
    sdg_codes: target.sdg_codes,
    indicator_refs: target.indicator_refs,
    target_type: target.target_type,
    target_value: target.target_value,
    measurement_boundary: target.measurement_boundary,
    effect_space: target.effect_space,
    valid_from: target.valid_from,
    valid_to: target.valid_to,
    source_ref: target.source_ref,
    imported_payload: target
  }));
  await rest("state_targets", { method: "POST", body: JSON.stringify(targetRows) });

  const manifest = zip.file(`${prefix}manifest.json`) ? await json(required(zip, prefix, "manifest.json")) : {
    schema_version: "1.0.0", release_id: releaseSummary.release_id ?? null, publisher: releaseSummary.publisher,
    manifest_status: "DERIVED_FROM_RELEASE_SUMMARY", archive_layout: prefix ? "SINGLE_TOP_LEVEL_DIRECTORY" : "ROOT_FILES",
    archive_entry_count: Object.values(zip.files).filter((entry) => !entry.dir).length
  };
  const deliveryHash = hash({ manifest, releaseSummary, publicReport, reviews: rawReviews, commitmentRegisters: rawRegisters, links, stateTargets });
  await rest("release_deliveries?on_conflict=delivery_hash", {
    method: "POST", headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ delivery_hash: deliveryHash, publisher: releaseSummary.publisher, manifest, release_summary: releaseSummary, public_report_markdown: publicReport, import_status: "REVIEW_PROPOSAL" })
  });
  console.log(JSON.stringify({ archive: path.basename(input), importStatus: "REVIEW_PROPOSAL", reviewsConfirmed: rawReviews.length, commitmentRegistersImported: normalizedRegisters.length, commitmentLinksImported: linkRows.length, stateTargetsImported: targetRows.length }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not complete protected release import.");
  process.exit(1);
});
