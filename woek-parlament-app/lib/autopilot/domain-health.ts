export type DomainStatus = "OK" | "DEGRADED" | "BLOCKED";
export type DomainHealth = { status: DomainStatus; last_run_at: string; detail: string };

export function resultBlockers(result: unknown) {
  if (!result || typeof result !== "object") return [];
  const report = (result as { report?: unknown }).report;
  if (!report || typeof report !== "object") return [];
  const blockers = (report as { blockers?: unknown }).blockers;
  return Array.isArray(blockers) ? blockers.filter((entry): entry is string => typeof entry === "string") : [];
}

export function normalizedDomainStatus(result: unknown): DomainStatus {
  if (!result || typeof result !== "object") return "BLOCKED";
  const blockers = resultBlockers(result);
  if (blockers.some((entry) => /^(DIP-Synchronisierung|Namentliche Abstimmungen):/.test(entry))) return "BLOCKED";
  if (blockers.length > 0) return "DEGRADED";
  const status = String((result as { status?: unknown }).status ?? "");
  if (/^(OK|COMPLETED|ALREADY_PROCESSED)$/.test(status)) return "OK";
  if (/^(NOT_CONFIGURED|BLOCKED|FAILED)$/.test(status)) return "BLOCKED";
  return "DEGRADED";
}

export function resultDetail(label: string, result: unknown) {
  const status = result && typeof result === "object" ? String((result as { status?: unknown }).status ?? "unbekannt") : "unbekannt";
  const blockerCount = resultBlockers(result).length;
  const blockerDetail = blockerCount === 1 ? "1 technischer Hinweis" : `${blockerCount} technische Hinweise`;
  return `${label}: ${status}${blockerCount > 0 ? ` (${blockerDetail})` : ""}`;
}
