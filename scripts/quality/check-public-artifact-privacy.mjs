import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const artifactDir = path.join(root, "_site");

const textExtensions = new Set([
  ".css",
  ".csv",
  ".html",
  ".js",
  ".json",
  ".md",
  ".svg",
  ".txt",
  ".xml",
]);

const scannedPaths = [
  "_site",
  "zertifikat",
  "assets/search/search-index.json",
  "public/data/woek-search-meta.json",
  "public/data/glossary-lookup.json",
  "public/data/glossary-reference-index.json",
  "public/data/glossary.terms.json",
  "data/academy/certificates.json",
];

const blockedContentPatterns = [
  { label: "unreviewed production name", pattern: /\b(?:Claude|ChatGPT)\b/i },
  { label: "local home or temporary directory", pattern: /(?<![\w/.:])\/(?:home|var\/folders)\/|[A-Z]:[\\/]Users[\\/]/i },
  { label: "local macOS home path", pattern: /\/Users\// },
  { label: "local Linux Hagen path", pattern: /\/home\/hagen\//i },
  { label: "local volume path", pattern: /\/Volumes\/[A-Za-z0-9._ -]+\// },
  { label: "private temp path", pattern: /\/private\/(?:tmp|var|folders)\// },
  { label: "temporary build path", pattern: /\/tmp\/[A-Za-z0-9._-]+\// },
  { label: "Claude worktree path", pattern: /(?:^|[/"'])\.claude(?:[/"']|$)/i },
  { label: "local worktree path", pattern: /(?:^|[/"'])worktrees(?:[/"']|$)/i },
  { label: "file URL", pattern: /file:\/\//i },
  { label: "GitHub token", pattern: /\bgh[opsu]_[A-Za-z0-9_]{20,}\b/ },
  { label: "Supabase service key", pattern: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/ },
  { label: "generic secret assignment", pattern: /\b(?:SECRET|TOKEN|PRIVATE_KEY|SERVICE_ROLE_KEY)\b\s*[:=]\s*["'][^"']{12,}["']/i },
];

const binaryPathPatterns = [
  { label: "local macOS home path", pattern: /\/Users\/[A-Za-z0-9._-]+\// },
  { label: "local Hagen home path", pattern: /\/Users\/hagen\//i },
  { label: "local Linux Hagen path", pattern: /\/home\/hagen\//i },
  { label: "local account path segment", pattern: /\/hagen\//i },
  { label: "private temp path", pattern: /\/private\/(?:tmp|var|folders)\// },
  { label: "temporary build path", pattern: /\/tmp\/[A-Za-z0-9._-]+\// },
  { label: "file URL", pattern: /file:\/\//i },
];

const certificateIdentityPatterns = [
  { label: "personal certificate holder name", pattern: /\bHagen\s+(?:Weber|Nats|[A-ZÄÖÜ][A-Za-zÄÖÜäöüß-]+)\b/i },
  { label: "certificate holder field", pattern: /\b(?:holder|recipient|issuedTo)\b\s*[:=]\s*["'][^"']+["']/i },
  { label: "certificate email field", pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
];

const failures = [];
const scannedFiles = [];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function toRepoRelative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function isTextFile(file) {
  return textExtensions.has(path.extname(file).toLowerCase());
}

function assertNoCertificatePdfs() {
  if (!fs.existsSync(artifactDir)) return;
  for (const file of walk(artifactDir)) {
    const relative = toRepoRelative(file);
    if (path.extname(file).toLowerCase() !== ".pdf") continue;
    if (/^_site\/zertifikat\//i.test(relative) || /(?:WOEK|WÖK)-[A-Z]{2}-\d{4}-\d{4}/i.test(path.basename(file))) {
      failures.push(`${relative}: certificate PDF must not be published from the website artifact`);
    }
  }
}

function assertNoStaticPersonCertificatePage(file) {
  const relative = toRepoRelative(file);
  if (/(?:^|\/)(?:_site\/)?zertifikat\/WOEK-[A-Z0-9-]+\/index\.html$/i.test(relative)) {
    failures.push(`${relative}: person-level certificate pages must not be stored in the public repo/artifact`);
  }
}

function assertCertificateRegistryIsNeutral(file, text) {
  const relative = toRepoRelative(file);
  const isCertificateRegistry =
    relative === "data/academy/certificates.json" ||
    relative === "_site/data/academy/certificates.json";
  if (!isCertificateRegistry) return;

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    failures.push(`${relative}: certificate registry is not valid JSON (${error.message})`);
    return;
  }

  if (Array.isArray(parsed.certificates) && parsed.certificates.length > 0) {
    failures.push(`${relative}: certificate registry must not contain person-level certificate rows`);
  }
}

function assertArtifactExists() {
  if (!fs.existsSync(artifactDir)) {
    failures.push("_site: public artifact missing; run npm run build:artifact before npm run check:privacy");
    return;
  }

  const artifactFiles = walk(artifactDir);
  if (!artifactFiles.length) {
    failures.push("_site: public artifact contains no files; privacy gate cannot verify deployment output");
  }
}

function scanBinaryPathLeaks(file) {
  const relative = toRepoRelative(file);
  if (!relative.startsWith("_site/")) return;

  const haystack = fs.readFileSync(file).toString("latin1");
  for (const { label, pattern } of binaryPathPatterns) {
    if (pattern.test(haystack)) failures.push(`${relative}: contains ${label}`);
  }
}

function scanTextFile(file) {
  scanBinaryPathLeaks(file);
  if (!isTextFile(file)) return;
  const text = fs.readFileSync(file, "utf8");
  const relative = toRepoRelative(file);
  scannedFiles.push(relative);
  assertNoStaticPersonCertificatePage(file);

  for (const { label, pattern } of blockedContentPatterns) {
    if (pattern.test(text)) failures.push(`${relative}: contains ${label}`);
  }

  if (/certificate|zertifikat/i.test(relative)) {
    for (const { label, pattern } of certificateIdentityPatterns) {
      if (pattern.test(text)) failures.push(`${relative}: contains ${label}`);
    }
  }

  assertCertificateRegistryIsNeutral(file, text);
}

assertArtifactExists();

for (const relative of scannedPaths) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) continue;
  const stat = fs.statSync(absolute);
  if (stat.isDirectory()) {
    for (const file of walk(absolute)) scanTextFile(file);
  } else if (stat.isFile()) {
    scanTextFile(absolute);
  }
}

assertNoCertificatePdfs();

if (failures.length) {
  console.error("Public artifact privacy gate failed:");
  for (const failure of failures.slice(0, 80)) console.error(`- ${failure}`);
  if (failures.length > 80) console.error(`... ${failures.length - 80} more`);
  process.exit(1);
}

console.log(`Public artifact privacy gate passed (${scannedFiles.length} text files scanned).`);
