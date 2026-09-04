import { createHash } from "node:crypto";

export const EVIDENCE_PACKET_VERSION = "evidence-packet-1";
const hash = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const text = value => String(value || "").replace(/\s+/g, " ").trim();

// Lossless transport references, not editorial source selection. Every source,
// contrary passage, provenance record and evidence_id remains addressable.
export function compactEvidenceSegments(stories) {
  for (const story of stories) {
    const counts = new Map();
    for (const source of story.sources || []) for (const segment of source.evidence_segments || []) {
      if (segment.excerpt) counts.set(segment.excerpt, (counts.get(segment.excerpt) || 0) + 1);
    }
    const shared = new Map();
    for (const source of story.sources || []) for (const segment of source.evidence_segments || []) {
      const excerpt = segment.excerpt;
      if (!excerpt || excerpt.length < 50) continue;
      const field = ["title", "abstract"].find(key => typeof source[key] === "string" && source[key].includes(excerpt));
      if (field) {
        segment.excerpt_from = [field, source[field].indexOf(excerpt), excerpt.length];
        delete segment.excerpt;
      } else if (counts.get(excerpt) > 1) {
        if (!shared.has(excerpt)) shared.set(excerpt, shared.size);
        segment.excerpt_text = shared.get(excerpt);
        delete segment.excerpt;
      }
    }
    if (shared.size) story.evidence_texts = [...shared.keys()];
  }
  return stories;
}

// Optional excerpt selection may remove the last reference to a shared string.
// Serialize only live dictionary entries without mutating the reusable catalog.
export function serializeEvidencePackets(stories) {
  return JSON.stringify(stories.map(story => {
    if (!story.evidence_texts) return story;
    const used = [...new Set(story.sources.flatMap(source => source.evidence_segments || []).map(segment => segment.excerpt_text).filter(index => index !== undefined))];
    const { evidence_texts, ...rest } = story;
    return { ...rest, ...(used.length ? { evidence_texts: used.map(index => evidence_texts[index]) } : {}),
      sources: story.sources.map(source => ({ ...source, evidence_segments: source.evidence_segments.map(segment => segment.excerpt_text === undefined ? segment : { ...segment, excerpt_text: used.indexOf(segment.excerpt_text) }) })) };
  }));
}

// Used by contract tests/audits. Never silently repair a malformed reference.
export function expandEvidenceSegments(story) {
  return (story.sources || []).map(source => ({ ...source, evidence_segments: (source.evidence_segments || []).map(segment => {
    const { excerpt_from, excerpt_text, ...rest } = segment;
    if (excerpt_from) {
      const [field, start, length] = excerpt_from;
      if (!["title", "abstract"].includes(field) || typeof source[field] !== "string" || !Number.isInteger(start) || !Number.isInteger(length) || start < 0 || length < 12 || start + length > source[field].length) throw new Error("EVIDENCE_REFERENCE_INVALID");
      rest.excerpt = source[field].slice(start, start + length);
    } else if (excerpt_text !== undefined) {
      if (!Number.isInteger(excerpt_text) || typeof story.evidence_texts?.[excerpt_text] !== "string") throw new Error("EVIDENCE_REFERENCE_INVALID");
      rest.excerpt = story.evidence_texts[excerpt_text];
    }
    return rest;
  }) }));
}

// Excludes ingestion/check timestamps and mutable ordering, never substantive
// source text, date, role or provenance. Changed evidence invalidates the cache.
export function sourceReviewFingerprint(source) {
  return hash({ source_id: source.source_id, url: source.url, content_hash: source.content_hash, title: text(source.title), summary: text(source.summary),
    published_at: source.source_published_at || source.published_at, primary_source: Boolean(source.primary_source),
    source_role: source.source_role, requires_corroboration: Boolean(source.requires_corroboration),
    provenance: source.provenance || null, research_metadata: source.research_metadata || null });
}

export function reviewFingerprint(candidate) {
  return hash({ version: EVIDENCE_PACKET_VERSION, title: text(candidate.title), reassessment: Boolean(candidate.reassessment),
    sources: (candidate.sources || []).map(sourceReviewFingerprint).sort(),
    published_version: candidate.existing_story?.current_version || 0,
    related: (candidate.related_ticker_history || []).map(item => [item.story_id, text(item.title), text(item.summary), item.source_published_at, item.source_urls]).sort((a,b) => a[0].localeCompare(b[0])) });
}

export function reviewCheckpoint(candidate, now, outcome) {
  return { version: EVIDENCE_PACKET_VERSION, fingerprint: reviewFingerprint(candidate), checked_at: now, outcome,
    // A bounded refresh is still allowed for publisher changes outside the feed.
    expires_at: new Date(Date.parse(now) + 6 * 3600000).toISOString(),
    // Keep examined additions available for future comparisons without changing
    // published evidence or creating a new public version. Never store full text.
    sources: (candidate.sources || []).map(({ article_excerpt, ...source }) => source) };
}

export function canReuseReview(candidate, now) {
  const checkpoint = candidate.existing_story?.review_checkpoint;
  return Boolean(checkpoint && checkpoint.version === EVIDENCE_PACKET_VERSION &&
    ["no_material_update", "input_too_large"].includes(checkpoint.outcome) &&
    !candidate.followup_due && !candidate.deepening_due &&
    Date.parse(checkpoint.expires_at) > Date.parse(now) && checkpoint.fingerprint === reviewFingerprint(candidate));
}

export function articleSourceOrder(candidate) {
  const old = new Map((candidate.existing_story?.sources || []).map(source => [source.url, sourceReviewFingerprint(source)]));
  const changed = source => old.get(source.url) !== sourceReviewFingerprint(source);
  const seen = new Set();
  return [...candidate.sources].sort((a,b) => Number(changed(b)) - Number(changed(a)) || Number(b.primary_source) - Number(a.primary_source) || Date.parse(b.published_at || 0) - Date.parse(a.published_at || 0))
    .filter(source => {
      // Another publisher, a changed number or a negation is never a duplicate.
      const key = hash([source.provenance || source.publisher_id || source.source_id, source.source_role, source.primary_source, source.requires_corroboration, text(source.title), text(source.summary)]);
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
}
