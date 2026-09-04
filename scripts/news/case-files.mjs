import { createHash } from "node:crypto";

// A case file is a presentation layer above evidence-bound stories. It never
// merges claims, sources, event IDs or publication histories. The same rules
// run over the whole corpus on every build, so existing and future stories are
// treated alike.
const DAY = 86_400_000;
const CASE_WINDOW = 7 * DAY;
const STRONG_CASE_WINDOW = 90 * DAY;
const MIN_MEMBERS = 3;
const STOPWORDS = new Set(`aber alle allem allen aller alles also andere anderen anderer anderes auch auf aus bei beim bereits bericht berichtet bis dann das dass dem den der des die dies diese diesem diesen dieser dieses doch dort durch eine einem einen einer eines für gegen habe haben hat hier im in ist kann kein keine mit nach neue neuen neuer neues nicht noch nun oder ohne seit sich sie sind so sowie über um und unter vom von vor war waren was wegen weiter werden wie wird wo zu zum zur
about after against also and are been before being between could from have into its more most new news not only other over said says than that their them then there these they this those through under upon was were what when where which while who will with would
aktuell aktuelle aktueller meldung meldungen nachricht nachrichten quelle quellen politik wirtschaft gesellschaft energie gesundheit europa deutschland bundesregierung bundestag minister polizei angabe angaben anhand bericht berichte berichtet darin demnach grundlage heisst heißt mehrere mehreren nennt nennen sowie text texte vorliegend vorliegenden wurde wurden worden zudem weitere weiteren weiterer weiteres ausserdem außerdem zusammenhang
attack attacks attacked angriff angriffe according report reports reported reporting several source sources statement statements text texts`.split(/\s+/));

const ACUTE = /\b(?:anschl\w*|angriff\w*|attack\w*|sabotag\w*|fahnd\w*|ermittl\w*|verdacht\w*|bekenn\w*|durchsuch\w*|festnahm\w*|sek|prozess\w*|verfahren\w*|wahl\w*|verhandlung\w*|streik\w*|protest\w*|brand\w*|feuer\w*|hochwasser\w*|flut\w*|erdbeben\w*|ausbruch\w*|epidem\w*|krieg\w*|waffenstillstand\w*|insolven\w*|übernahme\w*|fusion\w*|rückruf\w*|störung\w*|ausfall\w*)\b/i;
const UPDATE_KIND = [
  ["Ermittlungsstand", /\b(?:polizei|staatsanwaltschaft|ermittl\w*|fahnd\w*|verdächtig\w*|bekenn\w*|sek|durchsuch\w*|festnahm\w*|beweis\w*)\b/i],
  ["Entscheidung oder Reaktion", /\b(?:beschliess\w*|beschließ\w*|gesetz\w*|verordnung\w*|genehmig\w*|schutzmassnahm\w*|schutzmaßnahm\w*|sicherheitszentrum|reagier\w*|verschärf\w*)\b/i],
  ["Neues Ereignis", /\b(?:anschl\w*|angriff\w*|attack\w*|sabotageversuch\w*|brand\w*|hochwasser\w*|flut\w*|erdbeben\w*|ausbruch\w*|ausfall\w*)\b/i],
  ["Kontext oder Einordnung", /\b(?:interview\w*|analyse\w*|kommentar\w*|hintergrund\w*|einordnung\w*)\b/i],
];

const normalize = value => String(value || "").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
const stamp = story => Date.parse(story.last_updated || story.updated_at || story.published_at || story.first_seen || "") || 0;
const firstStamp = story => Date.parse(story.first_seen || story.published_at || story.last_updated || "") || 0;
const text = story => `${story.title || ""} ${String(story.source_summary || "").slice(0, 1200)}`;
const stem = word => word.length >= 9 ? word.replace(/(?:ungen|ischen|licher|liche|liches|enden|ender|endes|ern|en|er|es|e|s)$/u, "") : word;
const tokens = story => new Set([
  ...(String(story.title || "").match(/\b[A-ZÄÖÜ]{3,6}\b/g) || []).map(normalize).filter(word => !STOPWORDS.has(word)),
  ...(normalize(text(story)).match(/[a-z0-9äöüß]{5,}/g) || []).map(word => [word, stem(word)]).filter(([word, root]) => root.length >= 5 && !STOPWORDS.has(word) && !STOPWORDS.has(root)).map(([, root]) => root),
]);
const topics = story => new Set((story.topic || []).map(normalize));
const overlap = (left, right) => [...left].filter(value => right.has(value));
const hash = value => createHash("sha256").update(value).digest("hex").slice(0, 14);

function compatible(left, right, frequency, total) {
  if (!overlap(topics(left), topics(right)).length) return false;
  const shared = overlap(tokens(left), tokens(right));
  const rare = shared.filter(token => (frequency.get(token) || total) <= Math.max(4, Math.ceil(total * 0.2)));
  const titleLeft = tokens({ title: left.title }), titleRight = tokens({ title: right.title });
  const titleShared = overlap(titleLeft, titleRight);
  const gap = Math.abs(firstStamp(left) - firstStamp(right));
  const timely = gap <= CASE_WINDOW || (gap <= STRONG_CASE_WINDOW && rare.length >= 3 && titleShared.length >= 2);
  // The headline itself must identify an unfolding case. This prevents a
  // background explainer that merely mentions the same words from swallowing
  // a concrete news file through graph transitivity.
  const acute = ACUTE.test(left.title) && ACUTE.test(right.title);
  return timely && acute && rare.length >= 2 && titleShared.length >= 1 && (shared.length >= 3 || titleShared.length >= 2);
}

function kind(story) {
  const value = text(story);
  return UPDATE_KIND.find(([, pattern]) => pattern.test(value))?.[0] || "Weitere Entwicklung";
}

function uniquePublishers(members) {
  return new Set(members.flatMap(story => (story.sources || []).map(source => source.publisher_id || source.publisher).filter(Boolean))).size;
}

function caseTopics(members, representative) {
  const frequency = new Map();
  for (const story of members) for (const topic of story.topic || []) frequency.set(topic, (frequency.get(topic) || 0) + 1);
  const threshold = Math.max(2, Math.ceil(members.length * 0.25));
  return [...new Set([
    ...(representative.topic || []),
    ...[...frequency].filter(([, count]) => count >= threshold).map(([topic]) => topic),
  ])];
}

export function buildCaseFiles(stories, { minMembers = MIN_MEMBERS } = {}) {
  const active = stories.filter(story => story.published && story.analysis && story.listed !== false);
  const frequency = new Map();
  for (const story of active) for (const token of tokens(story)) frequency.set(token, (frequency.get(token) || 0) + 1);
  const edges = new Map(active.map(story => [story.story_id, []]));
  for (let i = 0; i < active.length; i += 1) for (let j = i + 1; j < active.length; j += 1) {
    if (!compatible(active[i], active[j], frequency, active.length)) continue;
    edges.get(active[i].story_id).push(active[j].story_id);
    edges.get(active[j].story_id).push(active[i].story_id);
  }
  const byId = new Map(active.map(story => [story.story_id, story]));
  const visited = new Set(), cases = [];
  for (const story of active) {
    if (visited.has(story.story_id)) continue;
    const queue = [story.story_id], component = [];
    visited.add(story.story_id);
    while (queue.length) {
      const id = queue.shift(); component.push(byId.get(id));
      for (const next of edges.get(id) || []) if (!visited.has(next)) { visited.add(next); queue.push(next); }
    }
    if (component.length < minMembers) continue;
    const members = component.sort((a, b) => stamp(b) - stamp(a) || a.story_id.localeCompare(b.story_id));
    const representative = members[0];
    const oldest = [...members].sort((a, b) => firstStamp(a) - firstStamp(b) || a.story_id.localeCompare(b.story_id))[0];
    const caseId = `case-${hash(oldest.story_id)}`;
    cases.push({
      case_id: caseId,
      representative_id: representative.story_id,
      representative_slug: representative.slug,
      title: representative.title,
      updated_at: representative.last_updated,
      member_count: members.length,
      publisher_count: uniquePublishers(members),
      topics: caseTopics(members, representative),
      members: members.map(item => ({ story_id: item.story_id, slug: item.slug, title: item.title, summary: item.analysis?.summary || "", updated_at: item.last_updated, published_at: item.published_at, kind: kind(item), current: item.story_id === representative.story_id })),
    });
  }
  const caseByStory = new Map();
  for (const caseFile of cases) for (const member of caseFile.members) caseByStory.set(member.story_id, caseFile);
  const visibleStories = active.filter(story => !caseByStory.has(story.story_id) || caseByStory.get(story.story_id).representative_id === story.story_id)
    .map(story => {
      const caseFile = caseByStory.get(story.story_id);
      return caseFile ? { ...story, topic: caseFile.topics, case_file: caseFile } : story;
    })
    .sort((a, b) => stamp(b) - stamp(a) || a.story_id.localeCompare(b.story_id));
  return { cases, caseByStory, visibleStories };
}

export const caseFileInternals = { compatible, kind, tokens };
