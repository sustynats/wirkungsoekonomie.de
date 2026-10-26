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

// Repeated comparisons usually read the same record. Check every selected
// input before serializing it again; copy array fields so in-place edits also
// invalidate the projection. Weak keys do not retain retired source records.
// Complex field values use the original content-keyed path on every read.
export function recordProjectionCache(limit = 8192) {
  const records = new WeakMap();
  const shared = projectionCache(limit);
  const scalar = value => value == null || ['string', 'number', 'boolean', 'undefined'].includes(typeof value);
  const same = (a, b) => Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((value, index) => Object.is(value, b[index]))
    : Object.is(a, b);
  return (record, fields, compute) => {
    const reusable = record !== null && typeof record === 'object'
      && fields.every(value => scalar(value) || Array.isArray(value) && value.every(scalar));
    const previous = reusable && records.get(record);
    if (previous && previous.fields.length === fields.length
      && fields.every((value, index) => same(value, previous.fields[index]))) return previous.value;
    const key = JSON.stringify(fields);
    const value = shared(key, compute);
    // Preserve the existing large-input retention bound on both paths.
    if (reusable && key.length <= 20000) records.set(record, {
      fields: fields.map(value => Array.isArray(value) ? value.slice() : value), value,
    });
    return value;
  };
}
