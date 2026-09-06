import { createHash } from "node:crypto";
import { fileSubject, namedSubjects, namedSubjectConflict } from "./living-files.mjs";

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

// Theme relevance is not event identity. These rules use the editorial subject,
// not the mere occurrence of attack/police/protection terms in the full text.
const BACKGROUND_SUBJECT = /\b(?:studie\w*|umfrage\w*|befragung\w*|risikobericht\w*|lagebild\w*|hintergrund\w*|analyse\w*|gutachten\w*|wirtschaftsforscher\w*|forschungsbericht\w*|survey\w*|research|risk assessment)\b/i;
const GENERAL_RISK = /\b(?:wachsende\w*|steigende\w*|allgemeine\w*|hybride\w*|systemische\w*|growing|rising|general|systemic)\s+(?:risik\w*|bedroh\w*|gefahr\w*|risks?|threats?)\b|\b(?:risiken|bedrohungen|gefahren)\b.{0,140}\b(?:unternehmen|wirtschaft|branchen|gesellschaft|bevolkerung)\w*\b/i;
const SPECIFIC_FINDING = /\b(?:belegt|bestatigt|widerlegt|identifiziert|rekonstruiert|weist\b.{0,70}\bnach|confirms?|identifies|reconstructs?)\b/i;
const DEMAND = /\b(?:fordert|fordern|verlangt|verlangen|fordert\w*|appelliert|demand\w*|calls? for)\b|\bwill\b.{0,85}\b(?:befugnisse|lockerung|reform|anderung|mehr schutz)\b/i;
const PLANNED = /\b(?:plant|planen|kundigt\b.{0,90}\ban|angekundigt|will\b.{0,70}\b(?:einrichten|vorbereiten|aufbauen|andern)|plans?|announces?)\b/i;
const MEASURE = /\b(?:beschlie(?:ss|ß)t|beschlossen|verabschiedet|genehmigt|erlasst|richtet\b.{0,70}\bein)\b|\b(?:erhoht|verstarkt|verscharft|increases?|strengthens?)\b.{0,70}\b(?:schutz|sicherheit\w*|kontrolle\w*|vorkehrung\w*|security|protection)\b/i;

export function caseContribution(story) {
  const headline = normalize(story.title);
  const lead = normalize(String(story.source_summary || story.summary || "").split(/\n\s*\n/)[0].slice(0, 650));
  const sourceHeadlines = (story.sources || []).map(source => normalize(source.title));
  const concreteFinding = SPECIFIC_FINDING.test(headline) && ACUTE.test(headline);
  const concreteReaction = DEMAND.test(headline) || PLANNED.test(headline) || MEASURE.test(headline);
  const background = GENERAL_RISK.test(headline)
    || (BACKGROUND_SUBJECT.test(headline) && !concreteFinding && !concreteReaction)
    || (!ACUTE.test(headline) && !concreteReaction && sourceHeadlines.some(title => GENERAL_RISK.test(title) || BACKGROUND_SUBJECT.test(title)));
  if (background) return { role: "background", kind: "Hintergrund oder systemische Einordnung", reason: "general_subject_not_case_development" };
  // A concrete action verb is required. A noun such as Schutzmaßnahmen or
  // Gesetz in an explanatory paragraph does not establish a new decision.
  for (const value of [headline, lead]) {
    if (DEMAND.test(value)) return { role: "reaction", kind: "Forderung oder Position", reason: "attributed_demand" };
    if (PLANNED.test(value)) return { role: "reaction", kind: "Angekündigte Maßnahme", reason: "announced_not_implemented" };
    if (MEASURE.test(value)) return { role: "reaction", kind: "Entscheidung oder Maßnahme", reason: "reported_concrete_action" };
    // Prefer a clear headline investigation over unrelated background wording.
    if (value === headline && UPDATE_KIND[0][1].test(story.title || "")) break;
  }
  return { role: "development", kind: UPDATE_KIND.find(([, pattern]) => pattern.test(text(story)))?.[0] || "Weitere Entwicklung", reason: "event_subject" };
}

function compatible(left, right, frequency, total) {
  if (caseContribution(left).role === "background" || caseContribution(right).role === "background") return false;
  if (namedSubjectConflict(left, right)) return false;
  const leftScope = namedSubjects(left).conflicts, rightScope = namedSubjects(right).conflicts;
  // Named conflicts cannot be connected by broad words, a shared mediator or
  // an unscoped bridge article. A cross-conflict comparison stays standalone.
  if (leftScope.length || rightScope.length) {
    if (leftScope.length !== 1 || rightScope.length !== 1 || leftScope[0] !== rightScope[0]) return false;
  }
  const leftSubject = fileSubject(left), rightSubject = fileSubject(right);
  if (leftSubject.elections.length || rightSubject.elections.length) {
    if (leftSubject.elections.length !== 1 || rightSubject.elections.length !== 1 || leftSubject.elections[0] !== rightSubject.elections[0]) return false;
  }
  // A general multi-site investigation may be related, but cannot make two
  // individually identified sites the same case by transitivity.
  if (leftSubject.key && rightSubject.key && leftSubject.key !== rightSubject.key) return false;
  if (leftSubject.recurrence !== rightSubject.recurrence && leftSubject.kind === rightSubject.kind && leftSubject.kind !== "other") return false;
  if (left.event_geography?.length && right.event_geography?.length && !overlap(new Set(left.event_geography), new Set(right.event_geography)).length) return false;
  if (!overlap(topics(left), topics(right)).length) return false;
  const shared = overlap(tokens(left), tokens(right));
  const rare = shared.filter(token => (frequency.get(token) || total) <= Math.max(4, Math.ceil(total * 0.2)));
  const titleLeft = tokens({ title: left.title }), titleRight = tokens({ title: right.title });
  const titleShared = overlap(titleLeft, titleRight);
  if (!firstStamp(left) || !firstStamp(right)) return false;
  const gap = Math.abs(firstStamp(left) - firstStamp(right));
  const namedLeft = namedSubjects(left), namedRight = namedSubjects(right);
  const sameCompany = namedLeft.companies.length === 1 && namedRight.companies.length === 1 && namedLeft.companies[0] === namedRight.companies[0];
  const sameObject = Boolean(leftSubject.key && leftSubject.key === rightSubject.key);
  const sameNamedSubject = sameCompany || sameObject || (leftScope.length === 1 && leftScope[0] === rightScope[0])
    || (leftSubject.elections.length === 1 && leftSubject.elections[0] === rightSubject.elections[0]);
  const timely = gap <= CASE_WINDOW || (gap <= STRONG_CASE_WINDOW && titleShared.length >= 2 && (rare.length >= 3 || sameCompany));
  // The headline itself must identify an unfolding case. This prevents a
  // background explainer that merely mentions the same words from swallowing
  // a concrete news file through graph transitivity.
  const acute = ACUTE.test(left.title) && ACUTE.test(right.title);
  return timely && acute && (rare.length >= 2 || (sameNamedSubject && titleShared.length >= 2)) && titleShared.length >= 1 && (shared.length >= 3 || titleShared.length >= 2);
}

function kind(story) {
  return caseContribution(story).kind;
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
  const active = stories.filter(story => story.published && story.analysis && story.listed !== false)
    .sort((a, b) => firstStamp(a) - firstStamp(b) || a.story_id.localeCompare(b.story_id));
  const frequency = new Map();
  for (const story of active) for (const token of tokens(story)) frequency.set(token, (frequency.get(token) || 0) + 1);
  const edges = new Map(active.map(story => [story.story_id, []]));
  for (let i = 0; i < active.length; i += 1) for (let j = i + 1; j < active.length; j += 1) {
    if (!compatible(active[i], active[j], frequency, active.length)) continue;
    edges.get(active[i].story_id).push(active[j].story_id);
    edges.get(active[j].story_id).push(active[i].story_id);
  }
  const components = [], ambiguous = [], cases = [];
  for (const story of active) {
    const neighbours = new Set(edges.get(story.story_id));
    const candidates = components.filter(component => component.every(member => neighbours.has(member.story_id)));
    // Complete-link, never connected-components: A↔B and B↔C do not prove A↔C.
    // A report fitting two separate groups stays standalone instead of picking
    // a winner by input order or serving as a bridge between those groups.
    if (candidates.length > 1) { ambiguous.push(story.story_id); continue; }
    if (candidates.length === 1) candidates[0].push(story);
    else components.push([story]);
  }
  for (const component of components) {
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
  return { cases, caseByStory, visibleStories, diagnostics: { ambiguous_story_ids: ambiguous, method: "pairwise-case-integrity-v2" } };
}

// Independent publication assertion over every pair, not just the links used
// to construct a group. A later implementation change cannot silently restore
// graph transitivity. Unknown membership is an error; articles are preserved.
export function caseIntegrityErrors(caseFile, stories) {
  const active = stories.filter(story => story.published && story.analysis && story.listed !== false);
  const byId = new Map(active.map(story => [story.story_id, story]));
  const frequency = new Map();
  for (const story of active) for (const token of tokens(story)) frequency.set(token, (frequency.get(token) || 0) + 1);
  const ids = (caseFile.members || []).map(member => member.story_id), errors = [];
  if (new Set(ids).size !== ids.length || ids.length !== caseFile.member_count) errors.push("CASE_MEMBERSHIP_INVALID");
  for (const id of ids) if (!byId.has(id)) errors.push(`CASE_MEMBER_UNKNOWN:${id}`);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    if (byId.has(ids[i]) && byId.has(ids[j]) && !compatible(byId.get(ids[i]), byId.get(ids[j]), frequency, active.length)) errors.push(`CASE_PAIR_INCOMPATIBLE:${ids[i]}:${ids[j]}`);
  }
  return errors;
}

export const caseFileInternals = { compatible, kind, tokens };
