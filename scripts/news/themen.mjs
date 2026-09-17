// Ein Ressortverzeichnis fuer die ganze Anwendung: Navigation der App und
// reservierte Plaetze der redaktionellen Lage lesen dasselbe Verzeichnis.
//
// Warum ueberhaupt: die Zuordnung sah bisher nur dann in Titel und Anriss,
// wenn KEIN Etikett passte (app-pages.mjs, Entweder-Oder). Eine Meldung mit
// dem Etikett "Energie" und dem Titel "Kuenstliche Intelligenz: Warnungen
// schicken Aktien ... auf Talfahrt" traf ueber das Etikett schon Wirtschaft
// und Klima - der Titel wurde nie gelesen, Technik nie gesetzt. Gemessen am
// 17.09.2026: 49 von 363 Meldungen hatten Technikbezug im Text, 13 trugen ein
// Techniketikett. Deshalb Vereinigung statt Entweder-Oder.
//
// Natalie am 17.09.2026: "Es duerfen aber insbesondere bei Technologie
// spannende Themen nicht unter den Tisch fallen, nur weil nicht alle Medien
// darueber berichten." Das Muster fuer Technik nennt darum auch die Begriffe,
// die im Bestand vorkommen, ohne das Wort "Technik" zu enthalten: Halbleiter,
// Chip, Rechenzentrum, Plattform, Sprachmodell, ausgeschriebene "kuenstliche
// Intelligenz" (\bki\b trifft nur die Abkuerzung).
//
// Dieses Modul ist absichtlich rein und importfrei.

// Bewusst NICHT im Technikmuster: "Drohne". Im Bestand sind das ueberwiegend
// Kriegs- und Sicherheitsmeldungen (Angriffe auf Kiew, Drohne nahe Mekka);
// gemessen waeren 4 von 9 neuen Techniktreffern Fehltreffer gewesen.
export const TECHNIK_MUSTER = /technik|technolog|digital|\bki\b|\bai\b|k(?:ü|ue)nstliche[rn]? intelligenz|sprachmodell|algorithm|cyber|software|hacker|ransomware|schadsoftware|verschl(?:ü|ue)sselung|it-sicherheit|halbleiter|\bchips?\b|mikroelektronik|rechenzentrum|\bcloud\b|plattform|roboti|roboter|automatisier|autonomes fahren|selbstfahrend|quanten|glasfaser|mobilfunk|breitband|smartphone|\bapps?\b|datenschutz/;

export const THEMEN_MUSTER = {
  politik: /politik|demokratie|recht|partei|wahl|regierung|bundestag|bundeswehr/,
  wirtschaft: /wirtschaft|finanz|arbeit|energie|industrie|handel|unternehmen|etat|investition|kapital/,
  gesellschaft: /gesellschaft|sozial|bildung|kultur|sicherheit|schule|zusammenhalt/,
  technik: TECHNIK_MUSTER,
  klima: /klima|umwelt|energie|planet/,
  gesundheit: /gesundheit|medizin/,
  wissenschaft: /wissenschaft|forschung/,
  // "Europaeische Union" traf das Muster nie: "europa" ist in "Europäische"
  // nicht enthalten. Bei Meldungen fiel das nicht auf, weil ein Etikett
  // einsprang - aber alle 46 Analysen (Meinung & Analyse, Nachgehoert,
  // Nachgesehen) tragen ueberhaupt kein Etikett. Dort entscheidet allein
  // Titel und Anriss, und dort fehlten "EU-Waldbrandsaison" und
  // "EU-Genehmigung" im Ressort International.
  international: /international|europa|europä|\beu\b|geopolitik/,
};

const kleinschrift = (teile) => teile.filter((teil) => typeof teil === 'string' && teil).join(' ').toLowerCase();

export function themenEtiketten(value) {
  return kleinschrift([...(Array.isArray(value?.topic) ? value.topic : []), ...(Array.isArray(value?.tags) ? value.tags : [])]);
}

// Nur Felder, die auch im veroeffentlichten Beitrag stehen - nie redaktionelle
// Vermerke.
export function themenText(value) {
  return kleinschrift([value?.title, value?.subtitle, value?.teaser, value?.book?.title]);
}

// Vereinigung: Etiketten UND oeffentlicher Text. Keine Meldung verliert dadurch
// ein Thema (gegen den Bestand geprueft), einige gewinnen das fehlende.
export function themenVon(value) {
  const etiketten = themenEtiketten(value), text = themenText(value);
  return Object.entries(THEMEN_MUSTER)
    .filter(([, muster]) => muster.test(etiketten) || muster.test(text))
    .map(([schluessel]) => schluessel);
}

// Reserviert sind die Felder, die im Bestand strukturell untergehen: Technik
// und Wissenschaft. "Infrastruktur" steht bewusst nur noch in der
// Etikettenliste - als Muster holte es Kriegsschaeden an Energieanlagen
// herein, was kein Technikthema ist.
export const RESERVIERTE_MUSTER = new RegExp(`${TECHNIK_MUSTER.source}|wissenschaft|forschung`);

// Der alte Pfad bleibt: was die Redaktion ausdruecklich so etikettiert, bleibt
// reserviert, auch wenn kein Muster greift.
export const RESERVIERTE_ETIKETTEN = ['Technologie', 'KI', 'Digitalisierung', 'Wissenschaft', 'Forschung', 'Infrastruktur', 'Bildung'];

export function istReserviertesThema(value) {
  if ((Array.isArray(value?.topic) ? value.topic : []).some((thema) => RESERVIERTE_ETIKETTEN.includes(thema))) return true;
  return RESERVIERTE_MUSTER.test(themenEtiketten(value)) || RESERVIERTE_MUSTER.test(themenText(value));
}
