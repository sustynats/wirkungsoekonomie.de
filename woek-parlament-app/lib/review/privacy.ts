import { createHash } from "node:crypto";

const forbiddenValuePatterns: Array<{ label: string; pattern: RegExp }> = [
  { label: "local-user-path", pattern: /(?:^|["'\s])\/(?:Users|home)\/[A-Za-z0-9._-]+(?:\/|$)/i },
  { label: "local-volume-path", pattern: /\/Volumes\/[A-Za-z0-9._-]+(?:\/|$)/i },
  { label: "local-file-uri", pattern: /file:\/\/(?:\/|localhost)/i },
  { label: "temporary-path", pattern: /(?:^|["'\s])\/(?:tmp|private|var\/folders)\//i },
  { label: "secret-assignment", pattern: /(?:api[_-]?key|authorization|bearer|service[_-]?role|webhook[_-]?url)\s*[:=]/i }
];

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => [key, canonicalize(nestedValue)]));
  }
  return value;
}

export function stableJson(value: unknown) {
  return JSON.stringify(canonicalize(value));
}

export function sha256(value: unknown) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

export function assertExternalReviewSafe<T>(value: T, label = "review-package"): T {
  const serialized = stableJson(value);
  const match = forbiddenValuePatterns.find((candidate) => candidate.pattern.test(serialized));
  if (match) throw new Error(`${label} rejected by privacy gate: ${match.label}.`);
  return value;
}
