import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

type JsonRecord = Record<string, unknown>;

const outputDirectory = path.resolve(process.cwd(), "data/generated/release-1");
const unsafeArchiveEntry = (name: string) => name.startsWith("/") || name.split("/").includes("..");
const prohibitedPublicValues: Array<{ label: string; pattern: RegExp }> = [
  { label: "local-user-path", pattern: /(?:^|["'\s])\/(?:Users|home)\/[A-Za-z0-9._-]+(?:\/|$)/i },
  { label: "local-volume-path", pattern: /\/Volumes\/[A-Za-z0-9._-]+(?:\/|$)/i },
  { label: "local-file-uri", pattern: /file:\/\/(?:\/|localhost)/i },
  { label: "temporary-path", pattern: /(?:^|["'\s])\/(?:tmp|private|var\/folders)\//i },
  { label: "disallowed-review-system-reference", pattern: new RegExp([["chat", "gpt"].join(""), ["cl", "aude"].join(""), ["open", "ai"].join(""), ["anthro", "pic"].join(""), ["co", "pilot"].join("")].join("|"), "i") },
  { label: "disallowed-machine-assistance-reference", pattern: new RegExp([["sprach", "modell"].join(""), ["language", "model"].join(" "), ["large", "language", "model"].join(" "), ["generative", "ai"].join(" "), ["generative", "ki"].join(" "), ["ai", "assisted"].join("-"), ["ki", "gestützt"].join("-"), ["modell", "generiert"].join("")].join("|"), "i") },
  { label: "internal-editorial-note", pattern: /(?:interne?[nr]?|internal)(?:\s+only)?\s+(?:redaktions?|editorial(?:e[nr]?)?)?\s*(?:notiz|hinweis|kommentar)/i },
  { label: "do-not-publish-marker", pattern: /(?:nicht\s+(?:veröffentlichen|publizieren)|not\s+for\s+publication|do\s+not\s+publish)/i },
  { label: "secret-assignment", pattern: /(?:api[_-]?key|authorization|bearer|service[_-]?role|webhook[_-]?url)\s*[:=]/i }
];

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => [key, canonicalize(nested)]));
  return value;
}

function stableJson(value: unknown) {
  return JSON.stringify(canonicalize(value));
}

function hash(value: unknown) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function ensurePublicSafe(value: unknown, label: string) {
  const serialized = stableJson(value);
  const finding = prohibitedPublicValues.find((candidate) => candidate.pattern.test(serialized));
  if (finding) throw new Error(`${label} cannot be made public: ${finding.label}.`);
}

function archivePrefix(zip: JSZip) {
  const roots = new Set(Object.values(zip.files).filter((entry) => !entry.dir).map((entry) => entry.name.split("/")[0]).filter(Boolean));
  return roots.size === 1 ? `${[...roots][0]}/` : "";
}

function logicalName(entry: JSZip.JSZipObject, prefix: string) {
  return prefix && entry.name.startsWith(prefix) ? entry.name.slice(prefix.length) : entry.name;
}

async function readJson(entry: JSZip.JSZipObject) {
  return JSON.parse(await entry.async("string")) as unknown;
}

function required(zip: JSZip, prefix: string, filename: string) {
  const entry = zip.file(`${prefix}${filename}`);
  if (!entry) throw new Error(`Required archive file is missing: ${filename}.`);
  return entry;
}

function object(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as JsonRecord;
}

function records(value: unknown, label: string) {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
  return value.map((item, index) => object(item, `${label}[${index}]`));
}

async function writeJson(filename: string, value: unknown) {
  await writeFile(path.join(outputDirectory, filename), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  const argument = process.argv.find((item) => item.startsWith("--input="));
  if (!argument) throw new Error("Usage: tsx scripts/import-release-1-public-source.ts --input=/path/to/release.zip");
  const input = path.resolve(argument.slice("--input=".length));
  const buffer = await readFile(input);
  if (buffer.byteLength === 0 || buffer.byteLength > 75 * 1024 * 1024) throw new Error("Release archive has an invalid size.");
  const zip = await JSZip.loadAsync(buffer);
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  if (entries.some((entry) => unsafeArchiveEntry(entry.name))) throw new Error("Release archive contains an unsafe file path.");
  const prefix = archivePrefix(zip);

  const reviewEntries = entries.filter((entry) => /(^|\/)case-results\/[^/]+\/review-result\.json$/i.test(logicalName(entry, prefix)));
  const commitmentEntries = entries.filter((entry) => /^commitment-registers\/[^/]+\/commitment-register\.json$/i.test(logicalName(entry, prefix)));
  if (reviewEntries.length !== 28) throw new Error(`Expected 28 complete case reviews, found ${reviewEntries.length}.`);
  if (commitmentEntries.length !== 7) throw new Error(`Expected 7 commitment registers, found ${commitmentEntries.length}.`);

  const reviews = await Promise.all(reviewEntries.map(readJson));
  const reviewRecords = reviews.map((review, index) => object(review, `review ${index + 1}`));
  const caseIds = reviewRecords.map((review) => String(review.case_id ?? ""));
  if (caseIds.some((caseId) => !caseId) || new Set(caseIds).size !== 28) throw new Error("Case reviews must have 28 unique case IDs.");

  const registers = await Promise.all(commitmentEntries.map(readJson));
  const registerRecords = registers.map((register, index) => object(register, `commitment register ${index + 1}`));
  const sourceKeys = registerRecords.map((register) => String(register.source_key ?? ""));
  if (sourceKeys.some((sourceKey) => !sourceKey) || new Set(sourceKeys).size !== 7) throw new Error("Commitment registers must have seven unique source keys.");
  const commitmentCount = registerRecords.reduce((sum, register) => sum + records(register.commitments, `${String(register.source_key)}.commitments`).length, 0);
  if (commitmentCount !== 1593) throw new Error(`Expected 1,593 commitments, found ${commitmentCount}.`);

  const stateTargetRegister = object(await readJson(required(zip, prefix, "state-target-register.json")), "state-target-register");
  const targets = records(stateTargetRegister.targets, "state-target-register.targets");
  if (targets.length !== 28) throw new Error(`Expected 28 Saxony-Anhalt targets, found ${targets.length}.`);

  const commitmentLinks = object(await readJson(required(zip, prefix, "commitment-links.json")), "commitment-links");
  const links = records(commitmentLinks.links, "commitment-links.links");
  if (links.length !== 347) throw new Error(`Expected 347 documented coalition-to-decision relations, found ${links.length}.`);
  const releaseSummary = object(await readJson(required(zip, prefix, "release-summary.json")), "release-summary");

  const publicationSource = {
    sourceLabel: "Freigegebener Fachbestand Release 1.0",
    publisher: "Institut für Wirkungsökonomie",
    importedAt: new Date().toISOString(),
    archiveHash: createHash("sha256").update(buffer).digest("hex"),
    archiveEntries: entries.length,
    originalPathWithheld: true
  };
  const publicPayloads = { reviews: reviewRecords, registers: registerRecords, stateTargetRegister, commitmentLinks, releaseSummary, publicationSource };
  ensurePublicSafe(publicPayloads, "Release archive");

  const integrity = {
    schemaVersion: "1.0.0",
    publisher: "Institut für Wirkungsökonomie",
    archive: publicationSource,
    coverage: {
      caseReviews: { expected: 28, received: reviewRecords.length, uniqueCaseIds: new Set(caseIds).size },
      commitmentRegisters: { expected: 7, received: registerRecords.length, totalCommitments: commitmentCount, sourceKeys },
      saxonyAnhaltTargets: { expected: 28, received: targets.length },
      documentedCoalitionToDecisionRelations: { received: links.length },
      programmeToCoalitionRelations: {
        received: records(commitmentLinks.programme_to_coalition, "commitment-links.programme_to_coalition").length,
        status: "SOURCE_ANCHORED"
      },
      openOrAmbiguousRelations: {
        received: records(commitmentLinks.open_or_ambiguous_relations, "commitment-links.open_or_ambiguous_relations").length,
        status: "OPEN_AS_DOCUMENTED"
      }
    },
    contentHashes: {
      reviews: hash(reviewRecords),
      commitmentRegisters: hash(registerRecords),
      commitmentLinks: hash(commitmentLinks),
      stateTargetRegister: hash(stateTargetRegister),
      releaseSummary: hash(releaseSummary)
    },
    terminologyShell: {
      currentPublicTerminology: "WÖk-Begriffsleitfaden v1.5",
      sourceSnapshotsPreserved: true
    }
  };

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeJson("case-reviews.json", { ...publicationSource, reviews: reviewRecords }),
    writeJson("commitment-registers.json", { ...publicationSource, registers: registerRecords }),
    writeJson("commitment-links.json", { ...publicationSource, ...commitmentLinks }),
    writeJson("sachsen-anhalt-target-register.json", { ...publicationSource, ...stateTargetRegister }),
    writeJson("release-summary.json", { ...publicationSource, ...releaseSummary }),
    writeJson("content-integrity.json", integrity)
  ]);
  console.log(JSON.stringify({ status: "PUBLIC_SOURCE_IMPORTED", outputDirectory: "data/generated/release-1", ...integrity.coverage }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Release source import failed.");
  process.exit(1);
});
