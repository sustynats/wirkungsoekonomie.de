import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { pathToFileURL } from "node:url";

/** Presence only: not a secret export, credential validity test or cutover approval. */
export function assessEnvironmentPresence(requiredKeys, environment) {
  if (!Array.isArray(requiredKeys) || requiredKeys.length === 0 ||
    requiredKeys.some((key) => typeof key !== "string" || !/^[A-Z][A-Z0-9_]*$/.test(key))) {
    throw new Error("A nonempty manifest of environment-variable names is required.");
  }
  const missing = [];
  const placeholders = [];
  for (const key of new Set(requiredKeys)) {
    const value = environment?.[key];
    if (typeof value !== "string" || !value.trim()) missing.push(key);
    else if (/^(?:\[?(?:redacted|encrypted|sensitive|hidden)\]?|\*+|<[^>]+>|(?:replace|change)[_-]?me)$/i.test(value.trim())) {
      placeholders.push(key);
    }
  }
  return { status: missing.length || placeholders.length ? "BLOCKED" : "PRESENT_NOT_YET_VALIDATED",
    missing, placeholders, credentialValidityVerified: false, cutoverApproved: false };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [manifestPath, envPath] = process.argv.slice(2);
    if (!manifestPath || !envPath) throw new Error("Private manifest and environment file required.");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const result = assessEnvironmentPresence(manifest.requiredKeys, parseEnv(readFileSync(envPath, "utf8")));
    // Names and states only; never print secret values, prefixes or value hashes.
    console.log(JSON.stringify(result, null, 2));
    if (result.status === "BLOCKED") process.exitCode = 1;
  } catch {
    console.error("ENVIRONMENT_PRESENCE_CHECK=FAILED: private inputs missing or invalid; no values printed.");
    process.exitCode = 1;
  }
}
