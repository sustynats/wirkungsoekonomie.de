// Two exact registered Stern RSS editions describe the same attributed Musk
// allegation, not two separate events. The newer edition adds his claim about
// a closed loophole; preserve that full paid text, without certifying the claim.
import { isDeepStrictEqual } from 'node:util';
import { sourceReviewFingerprint } from './evidence-packets.mjs';

const bindings = [
  { id: 'wt-a083782d5fd928e5', event: 'event-c6df71c141872248e840',
    slug: 'ukrainekrieg-elon-musk-ukraine-nutzte-starlink-fur-todliche-drohnenangriffe-d928e5',
    at: '2026-10-25T01:35:37.456Z',
    content: '6c104d48fb0c3c557d55bcc1bae5fee6649e081914b1347e806c769f1581de58',
    url: 'https://www.stern.de/politik/ausland/elon-musk--ukraine-nutzte-starlink-fuer-toedliche-drohnenangriffe-38447346.html',
    hash: '2fdf659cee85abf3374d4446b7a7d2ffbd94120a36ca03c03123f8856f500ab2' },
  { id: 'wt-bb275c9f8adec8d7', event: 'event-11956bedcade08650702',
    slug: 'musk-wirft-ukrainischem-militar-verstoss-gegen-starlink-nutzungsbedingungen-vor-dec8d7',
    at: '2026-10-25T06:01:48.266Z',
    content: '44be0e4b64385a708de06b842bef3479c04fcad4478a8dc17ce2c9af6711833b',
    url: 'https://www.stern.de/news/musk-wirft-ukrainischem-militaer-verstoss-gegen-starlink-nutzungsbedingungen-vor-38447638.html',
    hash: '3d0632fa62a0e18a2df463b895dc0caf4f5bd63f73f5eaf7dfefada48451198a' },
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
      reason: 'Derselbe am 25. Oktober 2026 berichtete Vorwurf Elon Musks zur ukrainischen Starlink-Nutzung fuer Drohnenangriffe' }] },
    retirement: { at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [a.story_id],
      preserve_full_publication: true,
      canonical_stories: [{ story_id: a.story_id, slug: a.slug, title: a.title }],
      note: 'Diese separat angelegte Fassung beschreibt denselben zugeschriebenen Musk-Vorwurf wie die verlinkte Wirkungsakte. Ihre ergaenzenden Angaben zur behaupteten Lueckenschliessung sowie beide vollstaendigen Texte, Quellen und historischen Bewertungen bleiben erhalten. Die technische Zusammenfuehrung ist keine neue fachliche Pruefung und bestaetigt weder den Vorwurf noch eine tatsaechliche Zugangsaenderung.' },
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

export function consolidateStarlinkDuplicates(stories, at) {
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
    reason: 'source_bound_starlink_allegation_duplicate_2026_10_25' }] };
}

// Merely unioning two already paid packets must not buy a replacement answer.
// Changed evidence and explicit followups still pass through the ordinary gates.
export function retainedStarlinkPaidInput(candidate, stories) {
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
