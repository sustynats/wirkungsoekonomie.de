import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { z } from "zod";
import { normalizeExternalCommitmentRegister } from "@/lib/commitments/external-register-adapter";
import { commitmentLinkImportSchema, commitmentRegisterSchema } from "@/lib/commitments/contracts";
import { importCommitmentDecisionLink, importCommitmentRegister } from "@/lib/editorial/commitment-comparisons";
import { importReviewResult } from "@/lib/editorial/review-results";
import { importStateTargetRegister, stateTargetRegisterSchema } from "@/lib/editorial/state-target-registers";
import { supabaseRest } from "@/lib/database/supabase-admin";
import { normalizeExternalReviewResult, reviewResultIdentity } from "@/lib/review/external-result-adapter";
import { reviewCasePackageSchema } from "@/lib/review/contracts";
import { assertExternalReviewSafe, sha256, stableJson } from "@/lib/review/privacy";

type BatchCaseRow = { review_batch_id: string; case_id: string; package_payload: unknown; package_hash: string };
type SourceRow = { source_key: string };

const releaseSummarySchema = z.object({
  schema_version: z.string().min(1).max(80),
  publisher: z.literal("Institut für Wirkungsökonomie"),
  coverage: z.record(z.unknown()),
  publication_readiness: z.string().min(1).max(160),
  reference_snapshot: z.union([z.string().max(300), z.record(z.unknown())]),
  methodology_notes: z.array(z.unknown()).max(200),
  source_conflicts: z.array(z.unknown()).max(200),
  data_gaps: z.array(z.unknown()).max(500),
  public_key_messages: z.array(z.string().min(1).max(2_000)).max(60),
  next_verifiable_steps: z.array(z.string().min(1).max(2_000)).max(60)
}).passthrough();

function loadLocalEnvironment() {
  try {
    for (const line of readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
      if (!line || line.startsWith("#")) continue;
      const separator = line.indexOf("=");
      if (separator < 1) continue;
      const name = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      if (name && process.env[name] === undefined) process.env[name] = value;
    }
  } catch {
    // Hosted environments supply their own configuration.
  }
}

function prefixFor(zip: JSZip) {
  const roots = new Set(Object.values(zip.files).filter((entry) => !entry.dir).map((entry) => entry.name.split("/")[0]).filter(Boolean));
  return roots.size === 1 ? `${[...roots][0]}/` : "";
}

function logicalName(entry: JSZip.JSZipObject, prefix: string) {
  return prefix && entry.name.startsWith(prefix) ? entry.name.slice(prefix.length) : entry.name;
}

function matchingEntries(zip: JSZip, prefix: string, expression: RegExp) {
  return Object.values(zip.files).filter((entry) => !entry.dir && expression.test(logicalName(entry, prefix)));
}

function required(zip: JSZip, prefix: string, filename: string) {
  const entry = zip.file(`${prefix}${filename}`);
  if (!entry) throw new Error(`Missing ${filename}.`);
  return entry;
}

async function json(entry: JSZip.JSZipObject) {
  return JSON.parse(await entry.async("string")) as unknown;
}

async function preflightReviewResult(resultInput: unknown) {
  assertExternalReviewSafe(resultInput, "review-result");
  const identity = reviewResultIdentity(resultInput);
  const rows = await supabaseRest<BatchCaseRow[]>(`parliament.review_batch_cases?select=review_batch_id,case_id,package_payload,package_hash&case_id=eq.${encodeURIComponent(identity.caseId)}&package_hash=eq.${identity.inputPackageHash}&limit=1`);
  const batchCase = rows[0];
  if (!batchCase) throw new Error(`No matching exported review package was found for case ${identity.caseId}.`);
  const reviewPackage = reviewCasePackageSchema.parse(batchCase.package_payload);
  const result = normalizeExternalReviewResult(resultInput, reviewPackage);
  if (result.case_id !== reviewPackage.case_id || result.review_type !== reviewPackage.review_type || result.input_package_hash !== reviewPackage.package_hash) {
    throw new Error(`Review result does not match its exported package for case ${result.case_id}.`);
  }
  if (stableJson(result.woek_reference_snapshot) !== stableJson(reviewPackage.woek_reference_snapshot)) {
    throw new Error(`Reference snapshot does not match its exported package for case ${result.case_id}.`);
  }
  return { caseId: result.case_id, reviewId: result.review_id };
}

async function main() {
  loadLocalEnvironment();
  const argument = process.argv.find((item) => item.startsWith("--input="));
  if (!argument) throw new Error("Usage: review:import-final-release -- --input=/path/to/release.zip");
  const stageArgument = process.argv.find((item) => item.startsWith("--stage="));
  const stage = stageArgument ? stageArgument.slice("--stage=".length) : "all";
  if (!["all", "preflight", "reviews", "commitments", "links", "targets", "delivery"].includes(stage)) {
    throw new Error("Stage must be all, preflight, reviews, commitments, links, targets or delivery.");
  }
  const input = path.resolve(argument.slice("--input=".length));
  const raw = await readFile(input);
  if (raw.byteLength === 0 || raw.byteLength > 60 * 1024 * 1024) throw new Error("Final release archive has an invalid size.");
  const zip = await JSZip.loadAsync(raw);
  if (Object.values(zip.files).some((entry) => entry.name.startsWith("/") || entry.name.split("/").includes(".."))) throw new Error("Final release archive contains an unsafe entry.");
  const prefix = prefixFor(zip);
  const releaseSummary = releaseSummarySchema.parse(await json(required(zip, prefix, "release-summary.json")));
  const manifestEntry = zip.file(`${prefix}manifest.json`);
  const manifest = manifestEntry ? await json(manifestEntry) : {
    schema_version: "1.0.0",
    release_id: releaseSummary.release_id ?? null,
    publisher: releaseSummary.publisher,
    manifest_status: "DERIVED_FROM_RELEASE_SUMMARY",
    archive_layout: prefix ? "SINGLE_TOP_LEVEL_DIRECTORY" : "ROOT_FILES",
    archive_entry_count: Object.values(zip.files).filter((entry) => !entry.dir).length
  };
  const publicReport = await required(zip, prefix, "RELEASE-REPORT.md").async("string");
  if (publicReport.trim().length < 200) throw new Error("Release report is too short.");
  assertExternalReviewSafe({ manifest, releaseSummary, publicReport }, "release-delivery");

  const rawStateTargets = await json(required(zip, prefix, "state-target-register.json"));
  assertExternalReviewSafe(rawStateTargets, "state-target-register");
  const stateTargets = stateTargetRegisterSchema.parse(rawStateTargets);
  const reviewEntries = matchingEntries(zip, prefix, /(^|\/)review-result\.json$/i);
  const commitmentEntries = matchingEntries(zip, prefix, /^commitment-registers\/[^/]+\/commitment-register\.json$/i);
  if (reviewEntries.length !== 28) throw new Error(`Expected 28 review results, found ${reviewEntries.length}.`);
  if (commitmentEntries.length !== 7) throw new Error(`Expected 7 commitment registers, found ${commitmentEntries.length}.`);
  const reviews = await Promise.all(reviewEntries.map(json));
  const commitmentRegisters = await Promise.all(commitmentEntries.map(json));
  const validatedRegisters = commitmentRegisters.map((register) => {
    assertExternalReviewSafe(register, "commitment-register");
    return commitmentRegisterSchema.parse(normalizeExternalCommitmentRegister(register));
  });
  if (new Set(validatedRegisters.map((register) => register.source_key)).size !== 7) throw new Error("Commitment registers must cover seven distinct source keys.");
  const registeredSources = await Promise.all(validatedRegisters.map(async (register) => {
    const sources = await supabaseRest<SourceRow[]>(`parliament.political_source_documents?source_key=eq.${encodeURIComponent(register.source_key)}&select=source_key&limit=1`);
    return sources[0]?.source_key ?? null;
  }));
  if (registeredSources.some((key) => !key)) throw new Error("A political source document is missing from the protected registry.");

  const linkPayload = await json(required(zip, prefix, "commitment-links.json"));
  const links = Array.isArray(linkPayload) ? linkPayload : (linkPayload && typeof linkPayload === "object" && Array.isArray((linkPayload as { links?: unknown }).links) ? (linkPayload as { links: unknown[] }).links : []);
  if (links.length > 2_000) throw new Error("Too many commitment links.");
  const validatedLinks = links.map((link) => {
    assertExternalReviewSafe(link, "commitment-decision-link");
    return commitmentLinkImportSchema.parse(link);
  });

  // Complete the matching checks before the first write.  Source-reference
  // inconsistencies are retained by the review importer as explicit review
  // conflicts; mismatched packages, however, stop the import here.
  const reviewPreflight = await Promise.all(reviews.map(preflightReviewResult));
  if (new Set(reviewPreflight.map((review) => review.caseId)).size !== reviewPreflight.length) throw new Error("The delivery contains duplicate case reviews.");
  if (stage === "preflight") {
    console.log(JSON.stringify({ archive: path.basename(input), stage, status: "READY", reviews: reviewPreflight.length, commitmentRegisters: validatedRegisters.length, commitmentLinks: validatedLinks.length, stateTargets: stateTargets.targets.length }, null, 2));
    return;
  }

  const importedReviews = [];
  if (stage === "all" || stage === "reviews") {
    for (const review of reviews) importedReviews.push(await importReviewResult(review));
  }
  const importedRegisters = [];
  if (stage === "all" || stage === "commitments") {
    for (const register of validatedRegisters) importedRegisters.push(await importCommitmentRegister(register));
  }
  const importedLinks = [];
  if (stage === "all" || stage === "links") {
    for (const link of validatedLinks) importedLinks.push(await importCommitmentDecisionLink(link));
  }
  const importedStateTargets = stage === "all" || stage === "targets" ? await importStateTargetRegister(stateTargets) : null;
  const deliveryHash = sha256({ manifest, releaseSummary, publicReport, reviews, commitmentRegisters, links, stateTargets });
  if (stage === "all" || stage === "delivery") {
    await supabaseRest("parliament.release_deliveries?on_conflict=delivery_hash", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        delivery_hash: deliveryHash,
        publisher: releaseSummary.publisher,
        manifest,
        release_summary: releaseSummary,
        public_report_markdown: publicReport,
        import_status: "REVIEW_PROPOSAL"
      })
    });
  }
  console.log(JSON.stringify({
    archive: path.basename(input), stage, importStatus: "REVIEW_PROPOSAL", deliveryHash,
    reviewsImported: importedReviews.length, commitmentRegistersImported: importedRegisters.length,
    commitmentLinksImported: importedLinks.length, stateTargetsImported: importedStateTargets?.targetsImported ?? 0
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Could not import final release delivery.");
  process.exit(1);
});
