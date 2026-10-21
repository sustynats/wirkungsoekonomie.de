// Source-bound routing for the 21 October BMF commencement-date error.
// DLF -102 and Tagesspiegel article 16181949 describe the same reported
// publication on Tuesday / unintended commencement on Wednesday. This is
// event identity, not a legal verdict or independent source corroboration.
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { sourceReviewFingerprint } from './evidence-packets.mjs';

const bindings = [
  { id: 'wt-09a10505ad0c0424', version: 1,
    slug: 'zigaretten-nach-ministeriumspatzer-gesetz-tritt-aus-versehen-in-kraft-0c0424',
    at: '2026-10-21T03:29:25.792Z',
    content: 'c6c5c07feb3b01a92c653be7d7b8ad2616ed478f5140167d258c7bee93cf0ba1',
    sources: [
      ['https://www.stern.de/wirtschaft/news/zigaretten--nach-ministeriumspatzer--gesetz-tritt-aus-versehen-in-kraft-38427596.html',
        '38c155d2b3d6f885bde07c224f6d0f9f9334805083c8000132bf6d7d9f1dc30e'],
      ['https://www.tagesspiegel.de/wirtschaft/dpa-zigaretten-nach-ministeriumspatzer-gesetz-tritt-aus-versehen-in-kraft-16181949.html',
        '8d20bed1663cccba6d5cab25bbd44e87c0adfd408d72253fb1399a924d1ef8d4'],
    ] },
  { id: 'wt-120df3585dc5796e', version: 1,
    slug: 'fehler-des-ministeriums-neues-tabaksteuer-gesetz-tritt-aus-versehen-bereits-in-kraft-c5796e',
    at: '2026-10-21T06:43:25.525Z',
    content: 'dbbb5ccb9623d2dc95a6a620161c03dedef913040b67bda408b3d230a8d0dde6',
    sources: [
      ['https://www.deutschlandfunk.de/neues-tabaksteuer-gesetz-tritt-aus-versehen-bereits-in-kraft-102.html',
        'fcdc01c915644867975196299182a0c5ae712d95357f79846cb8bf193eaa0330'],
    ] },
];
// Later coverage of that same commencement error, not a second law or a
// completed correction. Admit only the paid edition actually observed.
const ltoBinding = { id: 'wt-40b9f5e44ed9b503', version: 1,
  slug: 'nach-panne-im-bundesfinanzministerium-tabaksteuergesetz-tritt-versehentlich-fruher-in-kr-d9b503',
  at: '2026-10-21T16:45:34.517Z',
  content: '5bf031a2a8d8b9531ee468d7593f190b042c9b898e9bb5dce31c547991e58b6d',
  sources: [['https://www.lto.de/recht/nachrichten/n/tabaksteuer-gesetz-aenderung-versehentlich-bundesfinanzministerium?r=rss',
    'f901d8cf966ce933d76e97dbe1d4c7745d01478bd4a9c845db0b4f1605eea2b7']] };
const pendingSources = [...bindings[0].sources,
  ['https://www.stern.de/politik/deutschland/gesetz-zur-tabaksteuer-tritt-aus-versehen-zu-frueh-in-kraft-38427596.html',
    '6eb6b7b0368169faa89e700aabdf31eccac2ce5ea74bd7c144aa5686a88642bc'],
  ['https://www.tagesspiegel.de/politik/dpa-zigaretten-nach-ministeriumspatzer-gesetz-tritt-aus-versehen-in-kraft-16181949.html',
    'ecca60be2c9e65c1df58de68867a71600a0b1098d0ef29c2810b93a705022be2'],
];
const pendingContent = '226657b4a5dc2a2720340644b3b14a7c90ea9423662a0f6bd5e03d3db294b146';
const before = (value, at) => Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.parse(at);
const sourcesMatch = (sources, expected) => Array.isArray(sources) && sources.length === expected.length
  && expected.every(([url, hash]) => sources.filter(s => s?.url === url && s.content_hash === hash).length === 1);
const editionMatches = (s, b) => s?.published && !s.manual_only && !s.editorial_approval_hash
  && s.current_version === b.version && s.slug === b.slug && s.content_hash === b.content
  && s.published_at === b.at && s.updated_at === b.at && sourcesMatch(s.sources, b.sources);
const routed = (a, b, ids = [b?.story_id]) => a?.published && a.listed !== false && !a.retirement
  && isDeepStrictEqual(a.living_file?.merged_story_ids, ids)
  && b?.published && !b.living_file && b.listed === false && b.retirement?.reason_code === 'MERGED_INTO_LIVING_FILE'
  && b.retirement.preserve_full_publication === true && b.retirement.canonical_story_ids?.length === 1
  && b.retirement.canonical_story_ids[0] === a.story_id;
const ltoRouted = (a, b, lto) => Boolean(lto)
  && routed(a, b, [bindings[1].id, ltoBinding.id])
  && routed(a, lto, [bindings[1].id, ltoBinding.id]);
const paidFingerprint = source => sourceReviewFingerprint({ ...source, published_at: null, source_published_at: null });
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

// The failed four-source packet is real pending work, not a completed review.
// Only that exact packet with its reproducible paid-input receipt may survive
// routing. Unknown instructions, fresh evidence and other failed gates hold.
function retainedFailedPending(story, at) {
  const p = story.pending_update, receipt = story.ai_retry;
  const allowed = ['detected_at', 'content_hash', 'sources', 'reason', 'quality_errors', 'quality_retry_count',
    'quality_retry_after', 'reassessment', 'fresh', 'consolidation', 'impact_reassessment', 'source_integrity'];
  if (!p || Object.keys(p).some(k => !allowed.includes(k)) || p.content_hash !== pendingContent
    || !['QUALITY_GATE_FAILED', 'AI_ATTEMPT_LIMIT_REACHED'].includes(p.reason)
    || !isDeepStrictEqual(p.quality_errors, ['AI_SOURCE_SUMMARY_LENGTH']) || p.quality_retry_count !== 1
    || p.quality_retry_after !== null || p.reassessment !== false || p.fresh !== true || p.consolidation !== false
    || p.impact_reassessment || !before(p.detected_at, at) || !sourcesMatch(p.sources, pendingSources)
    || p.sources.some(s => s.article_excerpt || s.evidence_segments || !before(s.ingested_at, at))) return false;
  const integrity = p.source_integrity;
  if (integrity?.version !== '1.2' || integrity.status !== 'verified' || integrity.publication_status !== 'eligible'
    || !isDeepStrictEqual(integrity.issue_codes, []) || !isDeepStrictEqual(integrity.warning_codes, [])
    || !before(integrity.checked_at, at)) return false;
  if (receipt?.version !== '2026-09-15-direct-3' || receipt.retry_count !== 1
    || receipt.failed_at !== '2026-10-21T05:44:43.778Z'
    || receipt.first_failed_at !== receipt.failed_at || !/^[a-f0-9]{64}$/.test(receipt.fingerprint || '')
    || Object.keys(receipt).some(k => !['version', 'fingerprint', 'evidence_fingerprint_version',
      'evidence_fingerprint', 'first_failed_at', 'failed_at', 'retry_after', 'retry_count'].includes(k))
    || receipt.evidence_fingerprint_version !== 'paid-input-evidence-1'
    || !isDeepStrictEqual(story.ai_retry_history, [receipt])) return false;
  return receipt.evidence_fingerprint === hash({ version: 'paid-input-evidence-1', title: story.title,
    published_version: story.current_version, sources: p.sources.map(paidFingerprint).sort() });
}

export function consolidateTabaksteuerDuplicates(stories, at) {
  if (!Number.isFinite(Date.parse(at))) throw Error('INVALID_CONSOLIDATION_TIME');
  const pair = bindings.map(b => stories.find(s => s.story_id === b.id));
  if (pair.some(s => !s)) return { status: 'not_present', changes: [] };
  if (bindings.some(b => stories.filter(s => s.story_id === b.id).length !== 1)) {
    return { status: 'held', reason: 'STORY_ID_AMBIGUOUS', changes: [] };
  }
  const [canonical, duplicate] = pair;
  const later = stories.filter(s => s.story_id === ltoBinding.id);
  if (later.length > 1) return { status: 'held', reason: 'STORY_ID_AMBIGUOUS', changes: [] };
  const lto = later[0];
  if (ltoRouted(canonical, duplicate, lto)) return { status: 'already_applied', changes: [] };
  if (routed(canonical, duplicate)) {
    if (!lto) return { status: 'already_applied', changes: [] };
    if (!pair.every((s, i) => editionMatches(s, bindings[i]) && before(s.updated_at, at)
        && (s.pending_update == null || i === 0 && retainedFailedPending(s, at)))
      || !editionMatches(lto, ltoBinding) || !before(lto.updated_at, at)
      || lto.listed === false || lto.retirement || lto.living_file || lto.pending_update != null
      || lto.sources.some(s => s.article_excerpt || s.evidence_segments || !before(s.ingested_at, at))
      || !Array.isArray(canonical.living_file.consolidations)
      || canonical.living_file.consolidations.length !== 1
      || canonical.living_file.consolidations[0].story_id !== duplicate.story_id) {
      return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
    }
    // Extend only the existing exact two-member route. Keep its notice and
    // timestamp, all three paid readers, and the failed review verbatim.
    canonical.living_file.merged_story_ids.push(lto.story_id);
    canonical.living_file.consolidations.push({ at, story_id: lto.story_id, slug: lto.slug, title: lto.title,
      reason: 'Spaetere LTO-Berichterstattung zum selben berichteten Inkrafttretensfehler der Tabaksteuer am 21. Oktober 2026; offene Rechtsfragen bleiben offen',
    });
    lto.listed = false;
    lto.retired_at = at;
    lto.retirement = { at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [canonical.story_id],
      preserve_full_publication: true,
      canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
      note: 'Diese spaetere LTO-basierte Fassung betrifft denselben berichteten Inkrafttretensfehler wie die verlinkte Wirkungsakte. Alle vollstaendigen bezahlten Fassungen und ihre jeweiligen Quellen bleiben erhalten. Die zusaetzlichen offenen Rechtsfragen werden nicht als geklaert oder gemeinsam neu geprueft ausgegeben; auch die bisher offene Nachpruefung bleibt offen.' };
    return { status: 'applied', changes: [{ story_id: lto.story_id, canonical_story_id: canonical.story_id,
      reason: 'source_bound_tabaksteuer_lto_duplicate_2026_10_21' }] };
  }
  // Do not partially rewrite an unexpected three-edition routing state.
  if (lto) return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  if (!pair.every((s, i) => editionMatches(s, bindings[i]) && s.listed !== false && !s.retirement && !s.living_file
    && before(s.updated_at, at) && (s.pending_update == null || i === 0 && retainedFailedPending(s, at)))) {
    return { status: 'held', reason: 'SOURCE_EDITION_OR_ROUTING_CHANGED', changes: [] };
  }
  // Listing/routing only: preserve every paid field, history and failed marker.
  canonical.living_file = { merged_story_ids: [duplicate.story_id], consolidations: [{
    at, story_id: duplicate.story_id, slug: duplicate.slug, title: duplicate.title,
    reason: 'Derselbe berichtete Inkrafttretensfehler des Bundesfinanzministeriums zur Tabaksteuer am 21. Oktober 2026',
  }] };
  duplicate.listed = false;
  duplicate.retired_at = at;
  duplicate.retirement = { at, reason_code: 'MERGED_INTO_LIVING_FILE', canonical_story_ids: [canonical.story_id],
    preserve_full_publication: true,
    canonical_stories: [{ story_id: canonical.story_id, slug: canonical.slug, title: canonical.title }],
    note: 'Diese separat vorbereitete Fassung berichtet denselben Vorgang wie die verlinkte Wirkungsakte. Beide vollstaendigen bezahlten Fassungen und ihre Quellen bleiben erhalten. Die technische Zusammenfuehrung ist keine neue fachliche oder rechtliche Pruefung; eine offene Nachpruefung bleibt offen.' };
  return { status: 'applied', changes: [{ story_id: duplicate.story_id,
    canonical_story_id: canonical.story_id, reason: 'source_bound_tabaksteuer_duplicate_2026_10_21' }] };
}

// A known union of already paid packets is not permission for another call.
// The failed packet remains pending; it is never labeled approved/published.
export function retainedTabaksteuerPaidInput(candidate, stories, at) {
  const canonical = candidate.existing_story;
  if (!before(bindings[1].at, at) || candidate.story_id !== bindings[0].id
    || canonical?.story_id !== bindings[0].id || !editionMatches(canonical, bindings[0])
    || candidate.reassessment || candidate.impact_reassessment || candidate.followup_due
    || candidate.deepening_due || candidate.consolidation) return false;
  const peers = stories.filter(s => s.story_id === bindings[1].id);
  const later = stories.filter(s => s.story_id === ltoBinding.id);
  if (peers.length !== 1 || later.length > 1 || !editionMatches(peers[0], bindings[1])) return false;
  if (later.length) {
    if (!editionMatches(later[0], ltoBinding) || !ltoRouted(canonical, peers[0], later[0])) return false;
  } else if (!routed(canonical, peers[0])) return false;
  const sources = candidate.sources;
  const archivedUrls = [...peers, ...later].flatMap(s => s.sources.map(source => source.url));
  if (!Array.isArray(sources) || !sources.some(s => archivedUrls.includes(s?.url))
    || sources.some(s => !s || s.article_excerpt || s.evidence_segments)) return false;
  const retainedFailure = retainedFailedPending(canonical, at);
  if (canonical.pending_update != null && !retainedFailure) return false;
  const failed = retainedFailure ? canonical.pending_update.sources : [];
  const paid = new Set([...canonical.sources, ...peers[0].sources, ...later.flatMap(s => s.sources), ...failed].map(paidFingerprint));
  return sources.every(s => paid.has(paidFingerprint(s)));
}
