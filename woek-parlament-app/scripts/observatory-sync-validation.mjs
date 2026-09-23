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
      onReject({
        sourceName,
        line: candidate.line,
        reason: `schema mismatch: ${JSON.stringify(validate.errors ?? [])}`,
      });
      continue;
    }
    valid.push(record);
  }

  return valid;
}
