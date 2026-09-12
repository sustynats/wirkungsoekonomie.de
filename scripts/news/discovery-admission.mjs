// Metadata admission to editorial review only. Never a publication or MPD score.
import { eventCategories, normalizeEventText } from './event-relevance.mjs';

export const DISCOVERY_ADMISSION_VERSION = '2026-09-12.1';
const service = /\b(horoskop|lotto|gewinnspiel|gutschein|rabattcode|kaufberatung|produkttest|preisvergleich|streaming.tipps|wetterbericht|patchnotes?|firmware.update)\b/;
const context = /\b(kommentar|kolumne|podcast|historisch\w* liveticker|serien\w*|promi\w*)\b/;
const change = /\b(steig\w*|sink\w*|wach\w*|schrumpf\w*|stop\w*|schalt\w*|sperr\w*|verzoger\w*|[a-z]*schliess\w*|schliesst|[a-z]*abbau\w*|entlass\w*|invest\w*|stornier\w*|fusion\w*|ubernimm\w*|ubernehm\w*|ubernahm\w*|insolven\w*|verklag\w*|verurteil\w*|verbiet\w*|verbot\w*|regulier\w*|zulass\w*|reform\w*|beschliess\w*|beschloss\w*|beschluss\w*|fordert|will|plant|erhalt\w*|erober\w*|identifizier\w*|eroffn\w*|einfuhr\w*|beginnt|verhandel\w*|debattier\w*|droh\w*|ermittel\w*|ausfall\w*|datenleck\w*|ruckruf\w*|engpass\w*|sanktion\w*|starts?|closes?|cuts?|delays?|approves?|bans?|acquires?)\b/;
const materialDomain = /\b(infrastruktur\w*|pipeline\w*|meerenge\w*|lieferkette\w*|versorgung\w*|arbeit\w*|miet\w*|gesund\w*|arzt\w*|facharzt\w*|grundrecht\w*|wahl\w*|partei\w*|regierung\w*|gericht\w*|parlament\w*|energie\w*|strom\w*|emission\w*|kapazitat\w*|produktion\w*|technolog\w*|software\w*|cloud\w*|rechenzentr\w*|markt\w*|forschung\w*|effizienz\w*)\b/;
const publicSection = /\/(politik|politics|wirtschaft|economy|business|finanzen|wissenschaft|science|technologie|technology|internationales|ausland|netzwelt|security|gesundheit|umwelt)\//;

export function discoveryAdmission(sources = []) {
  const categories = eventCategories(sources);
  for (const source of sources) {
    const title = normalizeEventText(source.title), text = normalizeEventText(`${source.title || ''} ${source.summary || ''}`);
    const url = normalizeEventText(source.url);
    if (service.test(title) || context.test(title) || /\/(leute|sport|ratgeber|deals|tests)\//.test(url)
      || /\b(bundesliga|tennis|emmys|goldenen lowen|filmfestspiele|festival der|streaming.tipps)\b/.test(title)
      || /^(schlagzeilen|latest news bulletin|wetter)\b/.test(title)) continue;
    const section = normalizeEventText(`${source.section || ''} ${source.source_topic || ''}`);
    const domain = categories.length > 0 || materialDomain.test(text) || publicSection.test(url)
      || /\b(politik|wirtschaft|gesundheit|wissenschaft|technologie|energie|geopolitik|demokratie)\b/.test(section);
    if (domain && (change.test(text) || /\bhalt\b.{0,160}\bmoglich\b/.test(text))) return { version: DISCOVERY_ADMISSION_VERSION, review: true,
      reason: 'state_change_in_relevant_domain', categories, basis: ['title', 'description', 'section'], score_scope: 'discovery_only' };
  }
  return { version: DISCOVERY_ADMISSION_VERSION, review: false, reason: 'no_additional_metadata_basis', categories, score_scope: 'discovery_only' };
}

export function latestEvidenceTime(candidate, now = new Date().toISOString()) {
  const limit = Date.parse(now);
  return Math.max(0, ...(candidate.sources || []).map(s => Date.parse(s.source_published_at || s.published_at))
    .filter(t => Number.isFinite(t) && t <= limit));
}

export function currentEvidence(candidate, now, hours = 3) {
  const latest = latestEvidenceTime(candidate, now);
  return latest > 0 && Date.parse(now) - latest <= hours * 3600000;
}
