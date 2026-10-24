// Exact registered RSS editions describe the same 24 October Stuttgart demo,
// not the earlier Ulm attack. No generic city, protest or person matching rule.
// Both paid publications remain readable; this is routing, not a new review.
import { isDeepStrictEqual } from 'node:util';
import { sourceReviewFingerprint } from './evidence-packets.mjs';

const bindings = [
  { id: 'wt-a6658440baf04b0d', event: 'event-29b5b691ef3670a83909',
    slug: 'nach-angriff-auf-israelische-firma-in-ulm-hunderte-bei-free-the-ulm-5-demo-f04b0d',
    at: '2026-10-24T19:45:25.452Z',
    content: '5307b7ac0232f3cb5bff2fc71a7749185343aa8ffd946a9a9e6ce06799a6ab34',
    url: 'https://www.swr.de/swraktuell/baden-wuerttemberg/demo-free-the-ulm-5-in-stuttgart-100.html',
    hash: '223f1cb06973c62517a6e7fbaf32ad2caceb049eb89ef4f6e65ca47d2669ef4a' },
  { id: 'wt-71236d6e6263c885', event: 'event-029ee7167a0853c71bd9',
    slug: 'angriff-auf-israelische-firma-mehrere-hundert-menschen-bei-free-the-ulm-5-demo-63c885',
    at: '2026-10-24T20:56:57.175Z',
    content: '57c0b85054e07c7c0f208f0d9c30409a0ed4603159d9f71903bdd7bd9c63530b',
    url: 'https://www.stern.de/gesellschaft/regional/baden-wuerttemberg/angriff-auf-israelische-firma--mehrere-hundert-menschen-bei--free-the-ulm-5---demo-38446666.html',
    hash: 'ebe3960eaf40e5f5857b04c3515019ebd08b6b605dd3648d05929192869c953f' },
];
const before = (value, at) => Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.parse(at);
const editionMatches = (s, b) => s?.published === true && !s.manual_only && !s.editorial_approval_hash
  && s.provider_request_hold == null && s.current_version === 1 && s.event_id === b.event
  && s.slug === b.slug && s.content_hash === b.content && s.published_at === b.at && s.updated_at === b.at
  && Array.isArray(s.sources) && s.sources.length === 1
  && s.sources[0]?.url === b.url && s.sources[0]?.content_hash === b.hash;

function route(a, b, at) {
  return {
    living: { merged_story_ids: [b.story_id], consolidations: [{ at, story_id: b.story_id,
      slug: b.slug, title: b.title,
      reason: 'Dieselbe am 24. Oktober 2026 berichtete Solidaritaetskundgebung in Stuttgart unter dem Motto Free the Ulm 5' }] },
    retirement: { at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [a.story_id],
      preserve_full_publication: true,
      canonical_stories: [{ story_id: a.story_id, slug: a.slug, title: a.title }],
      note: 'Diese separat vorbereitete Fassung beschreibt dieselbe Kundgebung wie die verlinkte Wirkungsakte. Beide vollstaendigen Texte, Quellen und historischen Bewertungen bleiben erhalten. Die technische Zusammenfuehrung ist keine neue fachliche Pruefung und klaert weder die strafrechtliche Verantwortung noch unterschiedliche Teilnehmer- oder Vorfallsangaben.' },
  };
}
function routed(a, b) {
  const at = b?.retired_at;
  if (!before(a?.updated_at, at) || !before(b?.updated_at, at)) return false;
  const expected = route(a, b, at);
  return a.listed !== false && !a.retirement && b.listed === false && !b.living_file
    && isDeepStrictEqual(a.living_file, expected.living) && isDeepStrictEqual(b.retirement, expected.retirement);
}
const pairOf = stories => bindings.map(b => stories.filter(s => s.story_id === b.id));

export function consolidateUlm5Duplicates(stories, at) {
  if (!Number.isFinite(Date.parse(at))) throw Error('INVALID_CONSOLIDATION_TIME');
  const pair = pairOf(stories);
  if (pair.some(items => !items.length)) return { status: 'not_present', changes: [] };
  if (pair.some(items => items.length !== 1)) return { status: 'held', reason: 'STORY_ID_AMBIGUOUS', changes: [] };
  const [a, b] = pair.map(items => items[0]);
  const held = () => ({ status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] });
  if (![a, b].every((s, i) => editionMatches(s, bindings[i]) && before(s.updated_at, at))) return held();
  if (routed(a, b)) return before(b.retired_at, at) ? { status: 'already_applied', changes: [] } : held();
  // Preflight both records atomically. No open review or unknown provider write
  // is completed, removed or inferred to be safe by a routing correction.
  if ([a, b].some(s => s.listed === false || s.retirement || s.living_file || s.pending_update != null)) return held();
  const expected = route(a, b, at);
  a.living_file = expected.living;
  b.listed = false;
  b.retired_at = at;
  b.retirement = expected.retirement;
  return { status: 'applied', changes: [{ story_id: b.story_id, canonical_story_id: a.story_id,
    reason: 'source_bound_ulm5_demonstration_duplicate_2026_10_24' }] };
}

// Merely unioning two already paid packets must not buy a replacement answer.
// Changed evidence and explicit followups still pass through the ordinary gates.
export function retainedUlm5PaidInput(candidate, stories) {
  if (candidate.story_id !== bindings[0].id || candidate.existing_story?.story_id !== bindings[0].id
    || candidate.reassessment || candidate.impact_reassessment || candidate.followup_due
    || candidate.deepening_due || candidate.consolidation) return false;
  const pair = pairOf(stories);
  if (pair.some(items => items.length !== 1)) return false;
  const [a, b] = pair.map(items => items[0]);
  if (!editionMatches(a, bindings[0]) || !editionMatches(b, bindings[1]) || !routed(a, b)
    || !editionMatches(candidate.existing_story, bindings[0])) return false;
  const sources = candidate.sources;
  if (!Array.isArray(sources) || !sources.length || !sources.some(s => s?.url === bindings[1].url)
    || sources.some(s => !s || s.article_excerpt || s.evidence_segments)) return false;
  const fingerprint = s => sourceReviewFingerprint({ ...s, published_at: null, source_published_at: null });
  const paid = new Set([...a.sources, ...b.sources].map(fingerprint));
  return sources.every(s => paid.has(fingerprint(s)));
}
