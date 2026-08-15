import JSZip from "jszip";
import { NextResponse } from "next/server";
import { z } from "zod";
import { EditorialAuthorizationError, requireEditorialRequest } from "@/lib/editorial/auth";
import { DatabaseConfigurationError, supabaseRest } from "@/lib/database/supabase-admin";
import { importCommitmentDecisionLink, importCommitmentRegister } from "@/lib/editorial/commitment-comparisons";
import { commitmentLinkImportSchema, commitmentRegisterSchema } from "@/lib/commitments/contracts";
import { normalizeExternalCommitmentRegister } from "@/lib/commitments/external-register-adapter";
import { importReviewResult } from "@/lib/editorial/review-results";
import { reviewResultIdentity } from "@/lib/review/external-result-adapter";
import { importStateTargetRegister, stateTargetRegisterSchema } from "@/lib/editorial/state-target-registers";
import { assertExternalReviewSafe, sha256 } from "@/lib/review/privacy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxArchiveBytes = 60 * 1024 * 1024;
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

function sharedArchivePrefix(zip: JSZip) {
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const roots = new Set(entries.map((entry) => entry.name.split("/")[0]).filter(Boolean));
  return roots.size === 1 ? `${[...roots][0]}/` : "";
}

function logicalName(entry: JSZip.JSZipObject, prefix: string) {
  return prefix && entry.name.startsWith(prefix) ? entry.name.slice(prefix.length) : entry.name;
}

function matchingEntries(zip: JSZip, prefix: string, expression: RegExp) {
  return Object.values(zip.files).filter((entry) => !entry.dir && expression.test(logicalName(entry, prefix)));
}

function resultEntries(zip: JSZip, prefix: string) {
  return matchingEntries(zip, prefix, /(^|\/)review-result\.json$/i);
}

function singleFile(zip: JSZip, prefix: string, filename: string) {
  const entry = zip.file(`${prefix}${filename}`);
  if (!entry) throw new Error(`Missing ${filename}.`);
  return entry;
}

async function parseJson(entry: JSZip.JSZipObject) {
  return JSON.parse(await entry.async("string")) as unknown;
}

async function parseCommitmentLinks(zip: JSZip, prefix: string) {
  const entry = zip.file(`${prefix}commitment-links.json`);
  if (!entry) return [];
  const payload = await parseJson(entry);
  const links = Array.isArray(payload) ? payload : (payload && typeof payload === "object" && Array.isArray((payload as { links?: unknown }).links) ? (payload as { links: unknown[] }).links : []);
  if (links.length > 2_000) throw new Error("Too many commitment links.");
  return links;
}

function derivedManifest(releaseSummary: z.infer<typeof releaseSummarySchema>, prefix: string, zip: JSZip) {
  return {
    schema_version: "1.0.0",
    release_id: releaseSummary.release_id ?? null,
    publisher: releaseSummary.publisher,
    manifest_status: "DERIVED_FROM_RELEASE_SUMMARY",
    archive_layout: prefix ? "SINGLE_TOP_LEVEL_DIRECTORY" : "ROOT_FILES",
    archive_entry_count: Object.values(zip.files).filter((entry) => !entry.dir).length
  };
}

export async function POST(request: Request) {
  try {
    requireEditorialRequest(request);
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".zip")) return NextResponse.json({ error: "A final release ZIP is required." }, { status: 400 });
    if (file.size === 0 || file.size > maxArchiveBytes) return NextResponse.json({ error: "Final release ZIP has an invalid size." }, { status: 400 });

    const raw = new Uint8Array(await file.arrayBuffer());
    const zip = await JSZip.loadAsync(raw);
    const unsafeEntry = Object.values(zip.files).find((entry) => entry.name.split("/").some((part) => part === "..") || entry.name.startsWith("/"));
    if (unsafeEntry) return NextResponse.json({ error: "ZIP contains an unsafe entry." }, { status: 400 });

    const prefix = sharedArchivePrefix(zip);
    const releaseSummary = releaseSummarySchema.parse(await parseJson(singleFile(zip, prefix, "release-summary.json")));
    const manifestEntry = zip.file(`${prefix}manifest.json`);
    const manifest = manifestEntry ? await parseJson(manifestEntry) : derivedManifest(releaseSummary, prefix, zip);
    const publicReport = await singleFile(zip, prefix, "RELEASE-REPORT.md").async("string");
    if (publicReport.trim().length < 200) return NextResponse.json({ error: "Release report is too short." }, { status: 400 });
    assertExternalReviewSafe({ manifest, releaseSummary, publicReport }, "release-delivery");

    const stateTargetEntry = zip.file(`${prefix}state-target-register.json`);
    const rawStateTargets = stateTargetEntry ? await parseJson(stateTargetEntry) : null;
    if (rawStateTargets) assertExternalReviewSafe(rawStateTargets, "state-target-register");
    const stateTargets = rawStateTargets ? stateTargetRegisterSchema.parse(rawStateTargets) : null;
    const commitmentEntries = matchingEntries(zip, prefix, /^commitment-registers\/[^/]+\/commitment-register\.json$/i);
    if (commitmentEntries.length > 7) return NextResponse.json({ error: "Too many commitment registers." }, { status: 400 });
    const commitmentRegisters = await Promise.all(commitmentEntries.map(parseJson));
    const links = await parseCommitmentLinks(zip, prefix);
    const reviews = await Promise.all(resultEntries(zip, prefix).map(parseJson));
    if (reviews.length !== 28) return NextResponse.json({ error: "The final delivery must contain exactly 28 review results." }, { status: 400 });
    if (!stateTargets) return NextResponse.json({ error: "The Saxony-Anhalt target register is required." }, { status: 400 });
    if (commitmentRegisters.length !== 7) return NextResponse.json({ error: "Seven commitment registers are required." }, { status: 400 });

    // Validate the complete delivery before the first protected write. This
    // makes malformed archives fail as a whole instead of leaving a surprise
    // mixture of imported and non-imported material behind.
    reviews.forEach((review) => {
      assertExternalReviewSafe(review, "review-result");
      reviewResultIdentity(review);
    });
    const validatedRegisters = commitmentRegisters.map((register) => {
      assertExternalReviewSafe(register, "commitment-register");
      return commitmentRegisterSchema.parse(normalizeExternalCommitmentRegister(register));
    });
    if (new Set(validatedRegisters.map((register) => register.source_key)).size !== 7) {
      return NextResponse.json({ error: "Commitment registers must cover seven distinct source keys." }, { status: 400 });
    }
    const validatedLinks = links.map((link) => {
      assertExternalReviewSafe(link, "commitment-decision-link");
      return commitmentLinkImportSchema.parse(link);
    });

    const importedReviews = [];
    for (const review of reviews) importedReviews.push(await importReviewResult(review));
    const importedRegisters = [];
    for (const register of validatedRegisters) importedRegisters.push(await importCommitmentRegister(register));
    const importedLinks = [];
    for (const link of validatedLinks) importedLinks.push(await importCommitmentDecisionLink(link));
    const importedStateTargets = await importStateTargetRegister(stateTargets);
    const deliveryHash = sha256({ manifest, releaseSummary, publicReport, reviews, commitmentRegisters, links, stateTargets });
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
    return NextResponse.json({
      deliveryHash,
      reviewsImported: importedReviews.length,
      commitmentRegistersImported: importedRegisters.length,
      commitmentLinksImported: importedLinks.length,
      stateTargetsImported: importedStateTargets.targetsImported
    }, { status: 201 });
  } catch (error) {
    if (error instanceof EditorialAuthorizationError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof DatabaseConfigurationError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "The final release delivery is invalid.", details: error.flatten() }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not import the final delivery." }, { status: 422 });
  }
}
