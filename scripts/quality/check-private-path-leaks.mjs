#!/usr/bin/env node
import { spawnSync } from "node:child_process";

// Do not permit machine-specific user paths in tracked text files. Secrets
// belong in ignored environment files; local input files are supplied as CLI
// arguments or environment variables.
const LOCAL_USER_PATH = "(^|[^[:alnum:]/:])/(Users|home)/[[:alnum:]_.-]+/|[A-Za-z]:\\\\Users\\\\";
const SOURCE_PATHS = [
  ":(glob)**/*.md",
  ":(glob)**/*.mjs",
  ":(glob)**/*.js",
  ":(glob)**/*.cjs",
  ":(glob)**/*.ts",
  ":(glob)**/*.tsx",
  ":(glob)**/*.py",
  ":(glob)**/*.sh",
  ":(glob)**/*.yaml",
  ":(glob)**/*.yml",
  ":(glob)**/*.toml",
  ":(glob)**/*.html",
  ":(top)*.md",
  ":(top)*.mjs",
  ":(top)*.js",
  ":(top)*.json",
];

const result = spawnSync("git", ["grep", "-I", "-n", "-E", LOCAL_USER_PATH, "--", ...SOURCE_PATHS], {
  encoding: "utf8",
});

if (result.error) {
  throw result.error;
}

if (result.status === 0) {
  console.error("Private local user path found in a tracked file:");
  console.error(result.stdout.trim());
  process.exit(1);
}

if (result.status !== 1) {
  console.error(result.stderr.trim() || "Could not scan tracked files for private local paths.");
  process.exit(result.status || 1);
}

console.log("Private-path check passed.");
