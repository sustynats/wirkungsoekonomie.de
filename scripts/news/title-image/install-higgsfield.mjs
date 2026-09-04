import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { IMAGE_CONFIG as C, digest } from "./policy.mjs";

const platform = `${os.platform()}_${os.arch() === "x64" ? "amd64" : os.arch()}`;
const checksum = C.releases[platform];
if (!checksum) throw new Error("HIGGSFIELD_PLATFORM_UNSUPPORTED");
const output = process.argv.find((arg) => arg.startsWith("--directory="))?.slice(12);
if (!output || !path.isAbsolute(output)) throw new Error("An explicit absolute --directory is required");
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "woek-hf-install-"));
try {
  const url = `https://github.com/higgsfield-ai/cli/releases/download/v${C.cli_version}/hf_${C.cli_version}_${platform}.tar.gz`;
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error("HIGGSFIELD_DOWNLOAD_FAILED");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (digest(bytes) !== checksum) throw new Error("HIGGSFIELD_CHECKSUM_MISMATCH");
  const archive = path.join(directory, "hf.tar.gz");
  fs.writeFileSync(archive, bytes);
  const listing = execFileSync("tar", ["-tzf", archive], { encoding: "utf8" }).trim();
  if (listing !== "hf") throw new Error("HIGGSFIELD_ARCHIVE_INVALID");
  execFileSync("tar", ["-xzf", archive, "-C", directory]);
  fs.mkdirSync(output, { recursive: true });
  fs.copyFileSync(path.join(directory, "hf"), path.join(output, "higgsfield"));
  fs.chmodSync(path.join(output, "higgsfield"), 0o755);
  console.log(execFileSync(path.join(output, "higgsfield"), ["version"], { encoding: "utf8" }).trim());
} finally { fs.rmSync(directory, { recursive: true, force: true }); }
