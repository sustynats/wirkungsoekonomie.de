// Dieselbe Nachricht, andere Worte.
//
// Natalie am 17.09.2026: „Irgendwie kommen keine neuen Nachrichten." Vier der
// sechs neuesten waren dasselbe Ereignis, und 190 bezahlte Aufrufe endeten im
// Befund AI_DUPLICATE_WITHOUT_UPDATE - das Modell erkannte die Dublette, nachdem
// sie bezahlt war. Ein Wortvergleich kann das nicht leisten:
//
//   „US-Repräsentantenhaus verabschiedet Sanktionspaket"        (Deutschlandfunk)
//   „US-Kongress beschließt Gesetz für Russland-Sanktionen"     (Tagesspiegel)
//   „US-Kongress stimmt für Sanktionsgesetz gegen Russland"     (stern)
//
// Titelähnlichkeit 0,25 bis 0,37 - lexikalisch drei verschiedene Meldungen,
// tatsächlich eine. Verglichen werden deshalb die Fakten des Ereignisses:
// Handlungsart, Gegenstand und Tag. Alle drei müssen übereinstimmen.
//
// Die Regel ist bewusst eng. Eine falsche Zusammenführung löscht eine echte
// Nachricht aus dem Ticker und ist schlimmer als eine Dublette, die nur Geld
// kostet. Deshalb: ohne erkannte Handlungsart, ohne Gegenstand oder ohne Tag
// gibt es kein Urteil, und dann bleibt es bei zwei Meldungen.
const normalize = (text) => String(text || '').normalize('NFKD').replace(/\p{M}/gu, '')
  .toLowerCase().replace(/ß/g, 'ss').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// Handlungsarten: verschiedene Verben fuer denselben Vorgang.
const ACTIONS = [
  ['beschluss', /\b(?:verabschied\w*|beschliess\w*|beschloss\w*|billigt\w*|stimmt\w*\s+fur|votiert\w*|zugestimmt|angenommen|nimmt\s+an)\b/],
  ['urteil', /\b(?:urteil\w*|entscheid\w*|verurteilt\w*|haftet\w*|untersagt\w*|verpflichtet\w*|gibt\s+recht)\b/],
  ['ruecktritt', /\b(?:tritt\s+zuruck|rucktritt\w*|raumt\s+\w+\s+posten|entlassen\w*|abberufen\w*)\b/],
  ['festnahme', /\b(?:festgenommen|festnahme\w*|verhaftet\w*|in\s+gewahrsam)\b/],
  ['angriff', /\b(?:angriff\w*|attack\w*|anschlag\w*|explosion\w*|sabotage\w*)\b/],
  ['warnung', /\b(?:warnt\w*|warnung\w*|ruft\s+auf|mahnt\w*|fordert\w*)\b/],
  ['vorlage', /\b(?:legt\s+vor|vorgelegt|kundigt\s+an|angekundigt|plant\w*|entwurf\w*)\b/],
  ['zahl', /\b(?:steigt\w*|sinkt\w*|gestiegen|gesunken|erreicht\w*|meldet\w*)\b/],
];

// Gegenstand: die tragenden Sachwoerter, zusammengesetzte Woerter auf ihren
// Kern zurueckgefuehrt. „Sanktionspaket", „Sanktionsgesetz" und
// „Russland-Sanktionen" tragen denselben Kern.
const STOPWORDS = new Set(('laut der die das den dem des ein eine einen einem eines und oder aber fur gegen mit ohne nach vor bei uber unter '
  + 'im in am an auf aus zu zum zur von vom ist sind wird werden wurde wurden hat haben hatte sich als auch noch nur mehr schon wieder '
  + 'heute gestern morgen jahr jahre prozent millionen milliarden euro dollar neue neuer neues erste ersten').split(/\s+/));
const CORES = [
  [/\bsanktion\w*/, 'sanktion'], [/\bhaushalt\w*|\bbudget\w*/, 'haushalt'], [/\bzoll\w*|\btarif\w*/, 'zoll'],
  [/\brente\w*/, 'rente'], [/\bmiete\w*|\bwohnung\w*|\bwohnen\b/, 'wohnen'], [/\bstrom\w*|\benergie\w*/, 'energie'],
  [/\bklima\w*/, 'klima'], [/\bsteuer\w*/, 'steuer'], [/\bmigra\w*|\basyl\w*|\bfluchtling\w*/, 'migration'],
  [/\bwahl\w*/, 'wahl'], [/\bstreik\w*|\btarifverhandl\w*/, 'streik'], [/\bimpf\w*|\bpandemi\w*/, 'gesundheit'],
  [/\bki\b|\bkunstliche\s+intelligenz\b/, 'ki'], [/\bdatenschutz\w*/, 'datenschutz'],
];

export function eventFacts(item = {}) {
  const title = normalize(item.title);
  const text = `${title} ${normalize(item.summary).slice(0, 400)}`;
  const action = ACTIONS.find(([, pattern]) => pattern.test(text))?.[0] || null;
  const core = CORES.find(([pattern]) => pattern.test(text))?.[1] || null;
  // Ohne bekannten Kern: die laengsten Sachwoerter des Titels als Gegenstand.
  const words = title.split(' ').filter((word) => word.length >= 6 && !STOPWORDS.has(word));
  const object = core || (words.length ? [...words].sort((a, b) => b.length - a.length)[0].slice(0, 10) : null);
  const stamp = Date.parse(item.event_date || item.published_at || item.source_published_at || '');
  const day = Number.isFinite(stamp) ? new Date(stamp).toISOString().slice(0, 10) : null;
  return { action, object, day, key: action && object && day ? `${action}|${object}|${day}` : null };
}

// Nur Handlungsarten, die einen einzelnen, abgeschlossenen Vorgang bezeichnen.
//
// Am Bestand vom 17.09.2026 gemessen: mit allen Handlungsarten erkannte die
// Regel 57 Paare - darunter aber die Lage um die Stromnetz-Sabotage vom 04.09.
// als ein einziges Ereignis. „Polizei findet zwoelf Sprengsaetze",
// „Polizei stuermt Fahrzeug des Verdaechtigen" und „Brandenburg plant
// Sicherheitszentrum" sind verschiedene Entwicklungen derselben Lage, keine
// Dubletten. Sie zusammenzufuehren haette echte Nachrichten geloescht.
//
// Ein Parlament, das an einem Tag ein Gesetz beschliesst, und ein Gericht, das
// an einem Tag urteilt, sind dagegen je ein Vorgang: dort bedeutet gleicher
// Gegenstand am gleichen Tag wirklich dieselbe Nachricht. Rollende Lagen
// (Angriff, Festnahme, Warnung, Zahlen) bleiben ausgenommen - fuer die ist die
// Lageakte da, nicht die Dublettenpruefung.
export const SINGLE_DECISION_ACTIONS = new Set(['beschluss', 'urteil']);

// Dasselbe Ereignis? Nur bei vollstaendigen, gleichen Fakten, einer
// Handlungsart mit einem einzelnen Vorgang und innerhalb eines engen
// Zeitfensters. Kein Urteil bedeutet: zwei Meldungen.
export function sameEventByFacts(a, b, { windowHours = 36 } = {}) {
  const left = eventFacts(a), right = eventFacts(b);
  if (!left.key || !right.key) return false;
  if (left.action !== right.action || left.object !== right.object) return false;
  if (!SINGLE_DECISION_ACTIONS.has(left.action)) return false;
  const first = Date.parse(a.event_date || a.published_at || '');
  const second = Date.parse(b.event_date || b.published_at || '');
  if (!Number.isFinite(first) || !Number.isFinite(second)) return false;
  return Math.abs(first - second) <= Math.max(1, windowHours) * 3600000;
}
