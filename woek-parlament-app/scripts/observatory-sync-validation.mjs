export function parseValidRecords(content, validate, sourceName, onReject = () => {}) {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const candidates = sourceName.endsWith(".json")
    ? [{ line: 1, raw: trimmed }]
    : trimmed.split(/\r?\n/).map((raw, index) => ({ line: index + 1, raw })).filter(({ raw }) => raw.trim());
  const valid = [];

  for (const candidate of candidates) {
    let record;
    try {
      record = JSON.parse(candidate.raw);
    } catch (error) {
      onReject({
        sourceName,
        line: candidate.line,
        reason: `invalid JSON: ${error instanceof Error ? error.message : "parse failed"}`,
      });
      continue;
    }

    if (!validate(record)) {
      const details = (validate.errors ?? []).slice(0, 5).map((entry) =>
        `${entry.instancePath || "/"} ${entry.message ?? entry.keyword}`
      ).join("; ");
      onReject({
        sourceName,
        line: candidate.line,
        reason: `schema mismatch: ${details || "validation failed"}`,
      });
      continue;
    }
    valid.push(record);
  }

  return valid;
}

export function mergeByIdPreservingPublished(existing, incoming, idField, onConflict = () => {}) {
  const result = new Map(existing.map((entry) => [entry[idField], entry]));
  for (const entry of incoming) {
    const id = entry[idField];
    const prior = result.get(id);
    if (prior && JSON.stringify(prior) !== JSON.stringify(entry)) {
      onConflict({ id, prior, incoming: entry });
      continue;
    }
    result.set(id, entry);
  }
  return [...result.values()].sort((a, b) => String(a[idField]).localeCompare(String(b[idField])));
}
