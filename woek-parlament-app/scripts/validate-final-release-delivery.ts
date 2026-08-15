import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { normalizeExternalCommitmentRegister } from "@/lib/commitments/external-register-adapter";
import { commitmentLinkImportSchema, commitmentRegisterSchema } from "@/lib/commitments/contracts";
import { normalizeExternalReviewResult } from "@/lib/review/external-result-adapter";
import { assertExternalReviewSafe } from "@/lib/review/privacy";
import { reviewResultSchema, type ReviewCasePackage } from "@/lib/review/contracts";
import { stateTargetRegisterSchema } from "@/lib/editorial/state-target-registers";

function rootPrefix(zip: JSZip) {
  const roots = new Set(Object.values(zip.files).filter((entry) => !entry.dir).map((entry) => entry.name.split("/")[0]).filter(Boolean));
  return roots.size === 1 ? `${[...roots][0]}/` : "";
}

async function json(entry: JSZip.JSZipObject) {
  return JSON.parse(await entry.async("string")) as unknown;
}

function required(zip: JSZip, prefix: string, filename: string) {
  const entry = zip.file(`${prefix}${filename}`);
  if (!entry) throw new Error(`Missing ${filename}.`);
  return entry;
}

function files(zip: JSZip, prefix: string, expression: RegExp) {
  return Object.values(zip.files).filter((entry) => !entry.dir && expression.test(prefix && entry.name.startsWith(prefix) ? entry.name.slice(prefix.length) : entry.name));
}

async function main() {
  const inputArgument = process.argv.find((argument) => argument.startsWith("--input="));
  if (!inputArgument) throw new Error("Usage: validate:final-release -- --input=/path/to/release.zip");
  const input = path.resolve(inputArgument.slice("--input=".length));
  const raw = await readFile(input);
  if (raw.byteLength === 0 || raw.byteLength > 60 * 1024 * 1024) throw new Error("Release archive has an invalid size.");
  const zip = await JSZip.loadAsync(raw);
  const unsafe = Object.values(zip.files).find((entry) => entry.name.startsWith("/") || entry.name.split("/").includes(".."));
  if (unsafe) throw new Error("Release archive contains an unsafe entry.");

  const prefix = rootPrefix(zip);
  const report = await required(zip, prefix, "RELEASE-REPORT.md").async("string");
  assertExternalReviewSafe(report, "release-report");
  const summary = await json(required(zip, prefix, "release-summary.json"));
  assertExternalReviewSafe(summary, "release-summary");
  const stateTargets = await json(required(zip, prefix, "state-target-register.json"));
  assertExternalReviewSafe(stateTargets, "state-target-register");
  stateTargetRegisterSchema.parse(stateTargets);

  const reviewEntries = files(zip, prefix, /(^|\/)review-result\.json$/i);
  const commitmentEntries = files(zip, prefix, /^commitment-registers\/[^/]+\/commitment-register\.json$/i);
  if (reviewEntries.length !== 28) throw new Error(`Expected 28 review results, found ${reviewEntries.length}.`);
  if (commitmentEntries.length !== 7) throw new Error(`Expected 7 commitment registers, found ${commitmentEntries.length}.`);

  const reviews = await Promise.all(reviewEntries.map(json));
  const reviewIds = new Set<string>();
  for (const review of reviews) {
    assertExternalReviewSafe(review, "review-result");
    // This delivery already uses the canonical result shape. A dummy package
    // is intentionally sufficient: the adapter will only consult it when a
    // legacy result needs conversion, which this validator reports as an
    // error rather than masking.
    const normalized = normalizeExternalReviewResult(review, {} as ReviewCasePackage);
    const parsed = reviewResultSchema.parse(normalized);
    if (reviewIds.has(parsed.review_id)) throw new Error(`Duplicate review ID: ${parsed.review_id}.`);
    reviewIds.add(parsed.review_id);
  }

  const registerKeys = new Set<string>();
  for (const entry of commitmentEntries) {
    const rawRegister = await json(entry);
    assertExternalReviewSafe(rawRegister, "commitment-register");
    const register = commitmentRegisterSchema.parse(normalizeExternalCommitmentRegister(rawRegister));
    if (registerKeys.has(register.source_key)) throw new Error(`Duplicate commitment register: ${register.source_key}.`);
    registerKeys.add(register.source_key);
  }

  const linksPayload = await json(required(zip, prefix, "commitment-links.json"));
  const links = Array.isArray(linksPayload) ? linksPayload : (linksPayload && typeof linksPayload === "object" && Array.isArray((linksPayload as { links?: unknown }).links) ? (linksPayload as { links: unknown[] }).links : []);
  if (links.length > 2_000) throw new Error("Too many commitment links.");
  for (const link of links) {
    assertExternalReviewSafe(link, "commitment-decision-link");
    commitmentLinkImportSchema.parse(link);
  }

  console.log(JSON.stringify({
    archive: path.basename(input),
    status: "VALID",
    layout: prefix ? "SINGLE_TOP_LEVEL_DIRECTORY" : "ROOT_FILES",
    manifest: zip.file(`${prefix}manifest.json`) ? "SUPPLIED" : "DERIVED_AT_PROTECTED_IMPORT",
    reviews: reviewEntries.length,
    commitmentRegisters: commitmentEntries.length,
    commitmentLinks: links.length,
    stateTargets: 28
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not validate the final release delivery.");
  process.exit(1);
});
