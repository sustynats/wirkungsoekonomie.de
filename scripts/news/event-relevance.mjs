// Cheap review signals, not a factual verdict, MPD direction or publication gate.
// Event properties are intentionally independent of party, person and outlet names.
import { evidenceGroups } from './newsroom.mjs';

export const EVENT_RELEVANCE_VERSION = '2026-09-09.1';
export const EVENT_EDITORIAL_POLICY_VERSION = '2026-09-09.2';
export const COVERAGE_CATEGORIES = ['politics_de', 'economy', 'society', 'environment', 'health', 'science', 'technology', 'europe', 'international', 'security'];
export const normalizeEventText = text => String(text || '').normalize('NFKD').replace(/\p{M}/gu, '').replace(/ß/g, 'ss').toLowerCase();
const ms = value => Date.parse(value || '') || 0;
const bounded = value => Math.max(0, Math.min(100, Math.round(value)));

// Revisit only recent, unpublished materiality rejections when the editorial
// definition changes. Evidence rejections and published history are untouched.
export function needsEventPolicyReview(story, now) {
  if (story.published || story.rejection?.editorial_policy_version === EVENT_EDITORIAL_POLICY_VERSION
    || !story.rejection?.quality_errors?.includes('AI_MATERIALITY_TOO_LOW')) return false;
  const newest = Math.max(0, ...(story.sources || []).map(s => ms(s.published_at)));
  if (!newest || newest > ms(now) + 600000 || ms(now) - newest > 48 * 3600000) return false;
  const score = scoreEvent(story, now);
  return score.signals.length > 0 && score.total_relevance_score >= 30;
}
const material = /\b(infrastruktur\w*|infrastructure|arbeitsplatz\w*|arbeitsplatze|beschaftigt\w*|jobs|workers|versorgung\w*|supply|bildung\w*|gesundheit\w*|grundrecht\w*|energy|energie\w*|emission\w*|investition\w*|investment\w*|haushalt\w*|budget\w*|inflation\w*)/;
const institutions = /\b(bundestag|bundesrat|bundesregierung|bundeskanzler\w*|landtag\w*|parlament\w*|minister\w*|polizei\w*|staatsanwaltschaft\w*|gericht\w*|rechnungshof\w*|zentralbank\w*|bundesbank|statistikamt|behorde\w*|regulator\w*|central bank|parliament|government|court|police|auditors)\b/;

export function eventSignals(item = {}) {
  const t = normalizeEventText(`${item.title || ''} ${String(item.summary || '').slice(0, 1800)}`);
  const signals = [];
  const add = (name, condition) => { if (condition) signals.push(name); };
  const courtRetrospective = /\b(prozess\w*|gerichtsverhandlung\w*|angeklagt\w*|gesteht|gestand|verurteilt\w*|vor gericht)\b/.test(t)
    && !/\b(evakuierung|evakuiert|akute gefahr|aktuelle warnung|laufender einsatz)\b/.test(t);
  add('plenary_debate', /\b(generaldebatte|regierungserklarung|haushaltsdebatte|general debate|budget debate)\b/.test(t)
    && /\b(bundestag|parlament\w*|plenum|kanzler\w*|parliament)\b/.test(t));
  add('public_budget', /\b(bundeshaushalt\w*|haushaltsentwurf\w*|etatentwurf\w*|federal budget)\b/.test(t)
    && /\b(berat\w*|debatte\w*|lesung|beschluss\w*|beschliess\w*|plant|vorleg\w*|legt|vorgestellt|milliard\w*|billion\w*)\b/.test(t));
  add('political_position', /\b(?:[a-z]+[- ]chef|minister\w*|parteivorsitz\w*|fraktions\w*|regierungs\w*)\b/.test(t)
    && /\b(?:[a-z]+[- ]verbot|verbotsverfahren|parteiverbot|koalition\w*|regierungsbildung|minderheitsregierung|zusammenarbeit|kandidatur|brandmauer)\b/.test(t)
    && /\b(gegen|lehnt|ablehn\w*|fordert|will|schliesst|offen|gescheitert|befurwort\w*)\b/.test(t));
  add('political_poll', /\b(umfrage\w*|trendbarometer|befragt\w*|poll\w*)\b/.test(t)
    && /\b(wahl\w*|bundestag\w*|partei\w*|parteipraferenz\w*|voting)\b/.test(t) && /\d+\s*(?:%|prozent|punkte|percent)/.test(t));
  add('acute_safety', /\b(messer(?:angriff|attacke)|schuss\w*|sprengstoff\w*|bomben\w*|explosion\w*|evakuier\w*|stabbing|shooting|explosives?)\b/.test(t)
    && !courtRetrospective
    && /\b(polizei\w*|police|sperr\w*|gesperrt|grenz\w*|supermarkt\w*|tote\w*|todes\w*|getotet\w*|verletzt\w*|evakuier\w*|hospital|border|killed|injured)\b/.test(t));
  add('cross_border_disruption', /\b(grenz\w*|border|flughafen\w*|airport)\b/.test(t)
    && /\b(gesperrt|sperr\w*|geschlossen|sprengstoff\w*|evakuier\w*|closed|closure|explosives?)\b/.test(t));
  add('employment_location', /\b(?:filial\w*|standort\w*|werk\w*|unternehmen\w*|betrieb\w*|beschaftigt\w*|arbeitsplatz\w*|arbeitsplatze|factory|factories|jobs|workers|stores)\b/.test(t)
    && /\b(?:schliess\w*|schliesst|schliessen|geschlossen|stillleg\w*|stillgelegt|abbau\w*|entlass\w*|insolvenz\w*|investorensuche|sanierung|closures?|closing|layoffs?)\b/.test(t));
  add('large_investment', /\b(investier\w*|invest\w*|steckt|finanzier\w*|funding|ausbau\w*)\b/.test(t)
    && /\b(milliard\w*|billion\w*|million\w*)\b/.test(t)
    && /\b(infrastruktur\w*|infrastructure|fabrik\w*|factory|kapazitat\w*|rechenzentr\w*|data cent\w*|energie\w*|ki|ai|arbeitsplatz\w*|arbeitsplatze|jobs|produktion\w*)\b/.test(t));
  add('technology_market_entry', /\b(erst\w*|first|neuartig\w*|einstieg|markteintritt)\b/.test(t)
    && /\b(?:[a-z]*faltbar\w*|fold\w*|quanten\w*|quantum|chiparchitektur\w*)\b/.test(t)
    && /\b(smartphone\w*|phone\w*|iphone\w*|computer\w*|prozessor\w*|processor\w*|chip\w*)\b/.test(t));
  add('technology_conflict', /\b(ki|ai|technolog\w*|halbleiter\w*|chip\w*)\b/.test(t)
    && /\b(vorwurf\w*|vorwurfe|vorwerfen|werfen|beschuldig\w*|sanktion\w*|exportkontroll\w*|exportverbot\w*|abschopf\w*|distillation|theft|accus\w*|sanctions?)\b/.test(t)
    && /\b(behorde\w*|regierung\w*|usa|china|peking|eu|bundes\w*|government|regulator\w*)\b/.test(t));
  add('market_shock', /\b(?:[a-z]*olpreis\w*|brent|rohstoffpreis\w*|inflation\w*|dax|oil|markets?)\b/.test(t)
    && /\b(springt|sprang|steigt|steigen|gestiegen|sturz\w*|rutsch\w*|druck|durchbrach|durchbricht|erstmals|rekord\w*|breach\w*|surge\w*|slip\w*)\b/.test(t)
    && /\b(100|hundert|rekord\w*|krieg\w*|liefer\w*|inflation\w*|versorgung\w*|iran|hormus|war|mideast)\b/.test(t));
  add('public_audit', /\b(rechnungshof\w*|auditors?|evaluation|prufbericht)\b/.test(t) && material.test(t));
  const routine = /\b(kaufberatung|produkttest|gewinnspiel|rabatt|gutschein|horoskop|lotto|hands-on|preisvergleich)\b/.test(t);
  return { signals: routine ? [] : signals, institutional: institutions.test(t), material: material.test(t),
    routine, agenda_only: /\b(terminhinweis|einladung|vorschau|wird.{0,30}erwartet|erwartet|expected|soll.{0,35}vorstellen)\b/.test(t),
    national: /\b(bundestag|bundesrat|bundesregierung|bundeshaushalt|deutschland|bundesweit|bundeskanzler\w*)\b/.test(t), text: t };
}

export function eventCategories(sources = []) {
  const t = normalizeEventText(sources.map(s => `${s.title || ''} ${s.summary || ''}`).join(' '));
  const tests = {
    politics_de: /\b(bundestag|bundesrat|bundesregierung|bundeskanzler\w*|landtag\w*|ministerprasident\w*|parteiverbot|verbotsverfahren|brandmauer|wahl\w*)\b/,
    economy: /\b(wirtschaft\w*|unternehmen\w*|konzern\w*|invest\w*|arbeitsplatz\w*|arbeitsplatze|beschaftigt\w*|finanz\w*|filial\w*|insolvenz\w*|sanierung\w*|[a-z]*olpreis\w*|brent|dax|inflation\w*|econom\w*|jobs|markets?)\b/,
    society: /\b(gesellschaft\w*|soziale?\w*|bildung\w*|schule\w*|armut\w*|pflege\w*|rente\w*|wohnen|familie\w*)\b/,
    environment: /\b(klima\w*|umwelt\w*|emission\w*|energ\w*|natur\w*|biodivers\w*|strom\w*|climate)\b/,
    health: /\b(gesund\w*|medizin\w*|kranken\w*|pandemie\w*|health\w*|disease\w*)\b/,
    science: /\b(wissenschaft\w*|forschung\w*|studie\w*|research\w*|science)\b/,
    technology: /\b(technolog\w*|digital\w*|ki|ai|smartphone\w*|iphone\w*|chip\w*|quanten\w*|computer\w*)\b/,
    europe: /\b(eu|europa\w*|europais\w*|europe\w*|ezb|ecb|binnenmarkt)\b/,
    international: /\b(international\w*|aussenpolit\w*|geopolit\w*|usa|china|russland|ukraine|iran|nato|un|global\w*)\b/,
    security: /\b(polizei\w*|gericht\w*|justiz\w*|sicherheit\w*|sprengstoff\w*|messerangriff|messerattacke|sabotage\w*|cyberangriff\w*|security|police|attack\w*)\b/,
  };
  return COVERAGE_CATEGORIES.filter(category => tests[category].test(t));
}

export function scoreEvent(story, now, baseScore = 0) {
  const sources = story.sources || [];
  const features = sources.map(eventSignals);
  const signals = [...new Set(features.flatMap(f => f.signals))];
  const groups = evidenceGroups(sources);
  const origins = groups.possible_independent_origins;
  const primary = sources.filter(s => s.primary_source && !s.discovery_only);
  const dates = sources.map(s => ms(s.source_published_at || s.published_at)).filter(d => d > 0 && d <= ms(now) + 600000);
  const latest = Math.max(0, ...dates);
  const recent = latest > 0 && ms(now) - latest <= 3 * 3600000;
  const recentOrigins = evidenceGroups(sources.filter(s => ms(s.published_at) > ms(now) - 3600000 && ms(s.published_at) <= ms(now))).possible_independent_origins;
  const has = name => signals.includes(name);
  const acute = has('acute_safety') || has('cross_border_disruption');
  const economic = signals.some(s => ['large_investment', 'employment_location', 'market_shock', 'technology_market_entry'].includes(s));
  const political = signals.some(s => ['plenary_debate', 'public_budget', 'political_position', 'political_poll'].includes(s));
  const institutional_score = features.some(f => f.institutional) ? 80 : primary.length ? 55 : 10;
  const impact_score = bounded(Math.max(baseScore, has('large_investment') || has('market_shock') ? 78 : acute ? 72 : has('plenary_debate') || has('public_budget') ? 76 : economic || political || has('technology_conflict') ? 60 : has('public_audit') ? 58 : 0));
  const source_diversity_score = bounded(Math.max(0, origins - 1) * 20);
  const national_relevance_score = features.some(f => f.national) ? 85 : has('cross_border_disruption') ? 75 : political ? 65 : 0;
  const novelty_score = signals.length && recent ? 75 : signals.length ? 45 : 0;
  const velocity_score = bounded(Math.max(0, recentOrigins - 1) * 20);
  const confidence_score = bounded(primary.length ? 70 : origins >= 2 ? 50 : sources.length ? 25 : 0);
  const woek_impact_score = features.some(f => f.material) ? 75 : acute || political ? 65 : economic ? 50 : 0;
  const breaking_score = recent && acute ? 90 : recent && signals.length && recentOrigins >= 3 ? 70 : 0;
  // Diversity/velocity can strengthen a concrete event, never manufacture one.
  const eventScore = signals.length ? bounded(impact_score * .55 + institutional_score * .1
    + national_relevance_score * .08 + novelty_score * .08 + woek_impact_score * .09
    + source_diversity_score * .05 + velocity_score * .05 + (acute ? 8 : 0)) : 0;
  const total_relevance_score = Math.max(bounded(baseScore), eventScore);
  const priority = total_relevance_score >= 75 || (acute && recent && total_relevance_score >= 65) ? 'TOP'
    : total_relevance_score >= 50 ? 'HIGH' : total_relevance_score >= 30 ? 'NORMAL' : 'LOW';
  const categories = eventCategories(sources);
  const breaking_status = breaking_score >= 85 ? 'breaking' : recent && signals.length && (origins >= 2 || primary.length) ? 'developing'
    : priority === 'TOP' ? 'major' : features.length && features.every(f => f.agenda_only) ? 'background' : 'standard';
  return { version: EVENT_RELEVANCE_VERSION, signals, category: categories[0] || 'other', categories,
    region: national_relevance_score >= 65 ? 'DE' : 'not_established',
    independent_source_count: origins, independence_verified: false, primary_sources: primary.map(s => s.source_id),
    impact_score, breaking_score, source_diversity_score, institutional_score, national_relevance_score,
    economic_relevance_score: economic ? impact_score : 0, political_relevance_score: political ? impact_score : 0,
    novelty_score, confidence_score, velocity_score, woek_impact_score, total_relevance_score, priority, breaking_status,
    reasons: signals, score_scope: 'editorial_review_priority_not_truth_or_MPD_direction', checked_at: now };
}

export function categoryCoverage(stories, now, hours = 6) {
  const counts = Object.fromEntries(COVERAGE_CATEGORIES.map(c => [c, 0]));
  for (const story of stories) {
    if (!story.published || story.listed === false || ms(story.updated_at || story.last_updated || story.published_at) < ms(now) - hours * 3600000) continue;
    for (const category of eventCategories(story.sources)) counts[category] += 1;
  }
  return counts;
}

export function balanceEventQueue(candidates, coverage = {}) {
  const remaining = [...candidates];
  const selected = [];
  const counts = { ...coverage };
  const tier = candidate => ({ TOP: 3, HIGH: 2, NORMAL: 1, LOW: 0 }[candidate.preanalysis?.event_score?.priority] ?? 1);
  while (remaining.length) {
    let best = 0, bestValue = -Infinity;
    const highestTier = Math.max(...remaining.map(tier));
    remaining.forEach((candidate, index) => {
      if (tier(candidate) !== highestTier) return;
      const category = candidate.preanalysis?.event_score?.category || 'other';
      const value = Number(candidate.selection_base_priority ?? candidate.preanalysis?.internal_relevance_score ?? 0)
        + (counts[category] ? 0 : 16) - Math.min(36, (counts[category] || 0) * 8);
      if (value > bestValue) { best = index; bestValue = value; }
    });
    const [candidate] = remaining.splice(best, 1);
    selected.push(candidate);
    const category = candidate.preanalysis?.event_score?.category || 'other';
    counts[category] = (counts[category] || 0) + 1;
  }
  return selected;
}

// Lifecycle records the current editorial state, never infers confirmation
// from source counts or resolution from silence. Publication gates own facts.
export function updateEventLifecycle(event = {}, story, score, now) {
  const prior = event.lifecycle?.status;
  const verified = story?.published && story?.analysis?.news_status === 'confirmed';
  const version = story?.current_version || 0;
  const status = story?.resolution?.status === 'resolved' && story.resolution.evidence?.length ? 'resolved'
    : story?.published && event.lifecycle?.published_version && version > event.lifecycle.published_version ? 'major_update'
      : verified ? 'confirmed'
        : score?.breaking_status === 'breaking' ? 'breaking'
          : score?.breaking_status === 'developing' || story?.published ? 'developing' : 'detected';
  const history = [...(event.lifecycle?.history || [])];
  if (prior !== status) history.push({ status, at: now });
  return { ...event, lifecycle: { status, changed_at: prior === status ? event.lifecycle.changed_at : now,
    published_version: version, history: history.slice(-12), confirmation_basis: verified ? 'published_quality_checked_news_status' : null } };
}
