// Only deterministic read-only projections belong here, never editorial
// decisions or mutable source records. Callers key every field they read.
export function projectionCache(limit = 8192) {
  const entries = new Map();
  const freeze = value => {
    if (value && typeof value === 'object') {
      for (const child of Object.values(value)) freeze(child);
      Object.freeze(value);
    }
    return value;
  };
  return (key, compute) => {
    if (entries.has(key)) return entries.get(key);
    // Never retain unusually large source strings. Eviction changes only
    // performance; a miss recomputes exactly the same projection.
    if (key.length > 20000) return compute();
    const value = freeze(structuredClone(compute()));
    if (entries.size >= limit) entries.delete(entries.keys().next().value);
    entries.set(key, value);
    return value;
  };
}
