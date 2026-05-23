import { spawnSync } from "node:child_process";

const steps = [
  ["node", ["scripts/import/inventory.mjs"]],
  ["node", ["scripts/glossary/build-glossary-registry.mjs"]],
  ["node", ["scripts/glossary/build-term-links.mjs"]],
  ["node", ["scripts/glossary/build-glossary-candidates.mjs"]],
  ["node", ["scripts/import/build-relationships.mjs"]],
  ["node", ["scripts/import/build-content-manifest.mjs"]],
  ["node", ["scripts/search/build-woek-search-index.mjs"]],
];

for (const [cmd, args] of steps) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

