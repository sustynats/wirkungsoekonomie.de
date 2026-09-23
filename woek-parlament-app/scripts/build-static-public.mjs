import { spawn } from "node:child_process";
import { createServer } from "node:https";
import {
  cp,
  link,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readlink,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const sourceRoot = process.cwd();
const packageJson = JSON.parse(await readFile(path.join(sourceRoot, "package.json"), "utf8"));
if (packageJson.name !== "woek-parlament-app") {
  throw new Error("Run the static public build from woek-parlament-app.");
}

const outputRoot = path.join(sourceRoot, "_static-public-site");
const workRoot = await mkdtemp(path.join(os.tmpdir(), "woek-parlament-static-"));
const buildRoot = path.join(workRoot, "app");
const certificateRoot = path.join(workRoot, "certificate");
const excludedTopLevel = new Set([
  ".git",
  ".next",
  ".vercel",
  "_static-public-site",
  "node_modules",
  "out",
  "tmp",
]);

const serverOnlyTargets = [
  // A static publication target has no API runtime. The website consumes its
  // public source data during the build; every mutable endpoint remains in a
  // separate server target instead of being imitated on GitHub Pages.
  "app/api",
  // These detail routes are projections of the protected database. Their
  // static index remains public and explicitly reports that no profiles are
  // available, but an empty database must not invent placeholder identities.
  "app/abgeordnete/[slug]",
  "app/abstimmungen/[voteId]",
  "app/autopilot/status",
  "app/monitor/abstimmungen/[voteId]",
  "app/monitor/abstimmungen/abgeordnete",
  "app/pruefstandard/transparenz/datenbetrieb",
  "proxy.ts",
];

// Canonical pages currently re-export legacy route implementations. In the
// isolated static build the implementation files are renamed so Next renders
// each object only once. Tiny client-side compatibility redirects are written
// after export instead of shipping a second complete copy of every document.
const canonicalRouteImplementations = [
  ["app/regierung/akte/[id]/page.tsx", "@/app/regierung/akte/[id]/page"],
  ["app/regierung/ministerien/[id]/page.tsx", "@/app/regierung/ministerien/[id]/page"],
  ["app/regierung/ressorts/[id]/page.tsx", "@/app/regierung/ressorts/[id]/page"],
  ["app/regierung/wirkungsanalysen/[id]/page.tsx", "@/app/regierung/wirkungsanalysen/[id]/page"],
  ["app/regierung/wirkungsanalysen/[id]/quellen/[source]/page.tsx", "@/app/regierung/wirkungsanalysen/[id]/quellen/[source]/page"],
  ["app/eu/wirkungsfaelle/[id]/page.tsx", "@/app/eu/wirkungsfaelle/[id]/page"],
  ["app/laender/[slug]/page.tsx", "@/app/laender/[slug]/page"],
  ["app/laender/[slug]/wahl/page.tsx", "@/app/laender/[slug]/wahl/page"],
  ["app/laender/[slug]/regierung/page.tsx", "@/app/laender/[slug]/regierung/page"],
  ["app/laender/[slug]/mandat-und-praxis/page.tsx", "@/app/laender/[slug]/mandat-und-praxis/page"],
  ["app/laender/sachsen-anhalt/wahlprogramme/[sourceKey]/page.tsx", "@/app/laender/sachsen-anhalt/wahlprogramme/[sourceKey]/page"],
  ["app/mandat-und-praxis/[sourceKey]/page.tsx", "@/app/mandat-und-praxis/[sourceKey]/page"],
  ["app/quellen/[slug]/page.tsx", "@/app/quellen/[slug]/page"],
  ["app/methodik/wirkindikatoren/[indicatorId]/page.tsx", "@/app/methodik/wirkindikatoren/[indicatorId]/page"],
  ["app/fachanalysen/[slug]/page.tsx", "@/app/fachanalysen/[slug]/page"],
  ["app/wirkungsfaelle/[id]/page.tsx", "@/app/wirkungsfaelle/[id]/page"],
  ["app/fachakten/[id]/route.ts", "@/app/fachakten/[id]/route"],
];

const compatibilityRedirectTrees = [
  ["regierung", "ebenen/bundesregierung"],
  ["laender", "ebenen/laender"],
  ["eu", "ebenen/eu"],
  ["mandat-und-praxis", "monitor/mandat-und-praxis"],
  ["quellen", "pruefstandard/quellen"],
  ["methodik/wirkindikatoren", "pruefstandard/wirkindikatoren"],
  ["fachanalysen", "wirkungsakten/fachanalysen"],
  ["wirkungsfaelle", "wirkungsakten/faelle"],
  ["fachakten", "wirkungsakten/fachakten"],
];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? signal}`));
    });
  });
}

async function startEmptyDatabaseMock() {
  await mkdir(certificateRoot, { recursive: true });
  const keyPath = path.join(certificateRoot, "key.pem");
  const certificatePath = path.join(certificateRoot, "certificate.pem");
  await run("openssl", [
    "req", "-x509", "-newkey", "rsa:2048", "-nodes",
    "-keyout", keyPath,
    "-out", certificatePath,
    "-days", "1",
    "-subj", "/CN=127.0.0.1",
    "-addext", "subjectAltName=IP:127.0.0.1",
  ], { stdio: "ignore" });
  const server = createServer({
    key: await readFile(keyPath),
    cert: await readFile(certificatePath),
  }, (_request, response) => {
    const body = "[]";
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "content-length": Buffer.byteLength(body),
    });
    response.end(body);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not start the build-only database mock.");
  return { server, url: `https://127.0.0.1:${address.port}` };
}

async function hardlinkTree(source, destination) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const sourceEntry = path.join(source, entry.name);
    const destinationEntry = path.join(destination, entry.name);
    if (entry.isDirectory()) await hardlinkTree(sourceEntry, destinationEntry);
    else if (entry.isSymbolicLink()) await symlink(await readlink(sourceEntry), destinationEntry);
    else if (entry.isFile()) await link(sourceEntry, destinationEntry);
  }
}

async function sourceFilesBelow(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFilesBelow(target));
    else if (entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name)) files.push(target);
  }
  return files;
}

async function deduplicateCanonicalRoutes() {
  for (const [relativeFile, importPath] of canonicalRouteImplementations) {
    const source = path.join(buildRoot, relativeFile);
    const implementation = source.replace(/\.(tsx|ts)$/, ".impl.$1");
    await rename(source, implementation);
    const replacement = `${importPath}.impl`;
    for (const filename of await sourceFilesBelow(path.join(buildRoot, "app"))) {
      const contents = await readFile(filename, "utf8");
      if (contents.includes(importPath)) await writeFile(filename, contents.replaceAll(importPath, replacement));
    }
  }
}

function redirectDocument(legacyPrefix, canonicalPrefix) {
  const legacy = `/${legacyPrefix}`;
  const canonical = `/${canonicalPrefix}`;
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0; url=${canonical}"><link rel="canonical" href="${canonical}"><title>Weiterleitung</title></head><body><p>Diese Adresse ist umgezogen. <a href="${canonical}">Zur neuen Adresse</a></p><script>const p=${JSON.stringify(legacy)},t=${JSON.stringify(canonical)};location.replace(t+(location.pathname.startsWith(p)?location.pathname.slice(p.length):"")+location.search+location.hash);</script></body></html>`;
}

async function writeCompatibilityRedirectTree(legacyPrefix, canonicalPrefix) {
  const canonicalRoot = path.join(outputRoot, canonicalPrefix);
  const legacyRoot = path.join(outputRoot, legacyPrefix);
  await rm(legacyRoot, { recursive: true, force: true });
  const document = redirectDocument(legacyPrefix, canonicalPrefix);

  async function mirror(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const source = path.join(current, entry.name);
      if (entry.isDirectory()) await mirror(source);
      else if (entry.isFile() && (entry.name.endsWith(".html") || !path.extname(entry.name))) {
        const destination = path.join(legacyRoot, path.relative(canonicalRoot, source));
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, document);
      }
    }
  }
  await mirror(canonicalRoot);
}

async function inventory(directory) {
  const files = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(target);
      else if (entry.isFile()) files.push({
        path: path.relative(directory, target),
        bytes: (await lstat(target)).size,
      });
    }
  }
  await visit(directory);
  files.sort((left, right) => right.bytes - left.bytes || left.path.localeCompare(right.path));
  return files;
}

async function removeReactServerNavigationPayloads(directory) {
  let removedFiles = 0;
  let removedBytes = 0;
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(target);
      else if (entry.isFile() && entry.name.endsWith(".txt") && entry.name !== "robots.txt") {
        removedBytes += (await lstat(target)).size;
        removedFiles += 1;
        await rm(target);
      }
    }
  }
  await visit(directory);
  return { removedFiles, removedBytes };
}

let databaseMock;
try {
  await cp(sourceRoot, buildRoot, {
    recursive: true,
    filter(source) {
      const relative = path.relative(sourceRoot, source);
      if (!relative) return true;
      const [topLevel] = relative.split(path.sep);
      if (excludedTopLevel.has(topLevel)) return false;
      return !path.basename(source).startsWith(".env");
    },
  });
  await hardlinkTree(path.join(sourceRoot, "node_modules"), path.join(buildRoot, "node_modules"));
  await Promise.all(serverOnlyTargets.map((target) => rm(path.join(buildRoot, target), { recursive: true, force: true })));
  await deduplicateCanonicalRoutes();

  databaseMock = await startEmptyDatabaseMock();
  console.log(`STATIC_PUBLIC_BUILD_ROOT=${buildRoot}`);
  await run(process.execPath, [path.join(buildRoot, "node_modules", "next", "dist", "bin", "next"), "build"], {
    cwd: buildRoot,
    env: {
      ...process.env,
      NODE_TLS_REJECT_UNAUTHORIZED: "0",
      NEXT_PUBLIC_PORTAL_URL: "https://parlament.wirkungsoekonomie.de",
      NEXT_PUBLIC_WOEK_STATIC_HOST: "1",
      SUPABASE_URL: databaseMock.url,
      NEXT_PUBLIC_SUPABASE_URL: databaseMock.url,
      SUPABASE_SERVICE_ROLE_KEY: "static-public-build-no-production-access",
      WIRKUNGSRADAR_PUBLIC_SIGNUP_ENABLED: "false",
      WIRKUNGSRADAR_DAILY_DIGEST_ENABLED: "false",
      WIRKUNGSRADAR_EMAIL_SEND_MODE: "disabled",
      WOEK_STATIC_PUBLIC_EXPORT: "1",
    },
  });

  const buildOutput = path.join(buildRoot, "out");
  await rm(outputRoot, { recursive: true, force: true });
  await cp(buildOutput, outputRoot, { recursive: true });
  await run(process.execPath, [path.join(buildRoot, "node_modules", "tsx", "dist", "cli.mjs"), path.join(buildRoot, "scripts", "materialize-static-programme-indexes.ts"), outputRoot], {
    cwd: buildRoot,
    env: { ...process.env, NODE_OPTIONS: "--conditions=react-server" },
  });
  for (const [legacyPrefix, canonicalPrefix] of compatibilityRedirectTrees) {
    await writeCompatibilityRedirectTree(legacyPrefix, canonicalPrefix);
  }
  await run(process.execPath, [path.join(buildRoot, "scripts", "normalize-static-html-routes.mjs"), outputRoot], { cwd: buildRoot });
  const removedNavigationPayloads = await removeReactServerNavigationPayloads(outputRoot);
  await writeFile(path.join(outputRoot, "CNAME"), "parlament.wirkungsoekonomie.de\n");
  await writeFile(path.join(outputRoot, ".nojekyll"), "");

  const files = await inventory(outputRoot);
  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  const maximumBytes = 900 * 1024 * 1024;
  if (totalBytes > maximumBytes) {
    throw new Error(`Static site is ${(totalBytes / 1024 / 1024).toFixed(1)} MiB; the release guard is 900 MiB.`);
  }
  const oversized = files.filter((file) => file.bytes > 75 * 1024 * 1024);
  if (oversized.length) {
    throw new Error(`Static files above 75 MiB: ${oversized.map((file) => file.path).join(", ")}`);
  }
  const parliamentState = JSON.parse(await readFile(path.join(buildRoot, "data", "generated", "parliament-daily-state.json"), "utf8"));
  const governmentState = JSON.parse(await readFile(path.join(buildRoot, "data", "government", "impact-cases", "public-impact-cases-meta.json"), "utf8"));
  const manifest = {
    schema_version: "woek-static-public-build-v1",
    generated_at: new Date().toISOString(),
    canonical_origin: "https://parlament.wirkungsoekonomie.de",
    source_commit: process.env.WOEK_SOURCE_COMMIT ?? null,
    source_fingerprint: process.env.WOEK_SOURCE_FINGERPRINT ?? null,
    parliament_public_hash: parliamentState.source_hash ?? null,
    government_public_hash: governmentState.source_hash ?? null,
    file_count: files.length,
    total_bytes: totalBytes,
    largest_files: files.slice(0, 20),
    removed_react_server_navigation_files: removedNavigationPayloads.removedFiles,
    removed_react_server_navigation_bytes: removedNavigationPayloads.removedBytes,
    server_runtime_included: false,
  };
  await writeFile(path.join(outputRoot, "_woek-build-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await run(process.execPath, [path.join(buildRoot, "scripts", "quality", "validate-static-public-output.mjs"), outputRoot], { cwd: buildRoot });
  console.log(`STATIC_PUBLIC_EXPORT=PASS`);
  console.log(`STATIC_PUBLIC_FILES=${files.length}`);
  console.log(`STATIC_PUBLIC_MIB=${(totalBytes / 1024 / 1024).toFixed(1)}`);
  console.log(`STATIC_PUBLIC_OUTPUT=${outputRoot}`);
} finally {
  if (databaseMock) await new Promise((resolve) => databaseMock.server.close(resolve));
  await rm(workRoot, { recursive: true, force: true });
}
