import { commitmentRegisterSchema, type CommitmentRegister } from "@/lib/commitments/contracts";

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const candidate = text(value);
  return candidate || null;
}

function firstText(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value.map(text).find(Boolean) ?? "";
}

function shortTitle(value: string, fallback: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return (normalized || fallback).slice(0, 500);
}

/**
 * Accepts the source-bound register delivered by the current review process
 * and converts it to the intentionally smaller storage contract.  This is a
 * format adapter only: no commitment, source wording or factual status is
 * invented here.
 */
export function normalizeExternalCommitmentRegister(input: unknown): CommitmentRegister {
  const source = record(input);
  const sourceKey = text(source.source_key);
  const sourceHash = text(source.source_hash) || text(source.source_sha256);
  const commitments = Array.isArray(source.commitments) ? source.commitments.map((raw) => {
    const commitment = record(raw);
    const key = text(commitment.commitment_key);
    const locationText = text(commitment.source_location);
    const sourcePage = commitment.source_page;
    const page = typeof sourcePage === "number" || typeof sourcePage === "string" ? String(sourcePage) : undefined;
    const policyDomain = optionalText(commitment.policy_domain)
      ?? optionalText(commitment.policy_field)
      ?? optionalText(firstText(commitment.policy_domains));
    const commitmentText = text(commitment.commitment_text) || text(commitment.exact_text);
    return {
      commitment_key: key,
      title: shortTitle(text(commitment.title) || locationText, `Zusage ${key}`),
      commitment_text: commitmentText,
      policy_domain: policyDomain,
      source_location: {
        ...(page ? { page } : {}),
        ...(locationText ? { section: locationText.slice(0, 500) } : {})
      },
      temporal_scope: optionalText(commitment.temporal_scope)
    };
  }) : [];

  return commitmentRegisterSchema.parse({
    schema_version: "1.0.0",
    source_key: sourceKey,
    source_hash: sourceHash,
    commitments
  });
}
