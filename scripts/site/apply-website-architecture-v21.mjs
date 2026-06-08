import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SITE = "https://wirkungsoekonomie.de";
const STYLE_VERSION = "20260606-nav-cache-fix";
const SCRIPT_VERSION = "20260606-main-cache-fix";

const navigationPath = path.join(ROOT, "assets/data/navigation.json");
const architecturePath = path.join(ROOT, "assets/data/website-architecture-v21.json");

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function relPath(filePath) {
  return path.relative(ROOT, filePath);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(relativePath, content) {
  const filePath = path.join(ROOT, relativePath);
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`written ${relPath(filePath)}`);
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function writeJson(relativePath, data) {
  writeFile(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

const header = [
  { label: "Start", href: "index.html", match: ["index.html"] },
  {
    label: "Verstehen",
    href: "verstehen/",
    match: ["verstehen/", "verstehen.html", "wirkungsoekonomie.html", "wirkungsoekonomie/", "modell.html", "ordnung/", "so-wirkt-wirkungsoekonomie/"],
  },
  {
    label: "Für wen?",
    href: "fuer/",
    match: ["fuer/", "fuer-wen/", "fuer/unternehmen.html", "fuer/buergerinnen.html", "fuer/investoren.html", "fuer/kommunen.html"],
  },
  {
    label: "Wirkungsfelder",
    href: "wirkungsfelder/",
    match: ["wirkungsfelder/", "anwendungen.html"],
  },
  {
    label: "Wirkungssteuerung",
    href: "wirkungssteuerung/",
    match: ["wirkungssteuerung/", "fuer/wirkungssteuer.html", "werkstatt/gesetze/wirkungssteuergesetz/", "werkzeuge/scorecards/", "werkzeuge/t-sroi/"],
  },
  {
    label: "Öffentlicher Wirkungsraum",
    href: "oeffentlicher-wirkungsraum/",
    match: ["oeffentlicher-wirkungsraum/", "wirkungsradar/", "woek-ki/"],
  },
  {
    label: "Praxis & Tools",
    href: "werkzeuge/",
    match: [
      "werkzeuge/",
      "tools/",
      "methodik/",
      "workflow.html",
      "scanner.html",
      "anwendungen/scanner.html",
      "scorecard-dashboard.html",
      "erleben/",
      "erleben.html",
      "ausprobieren/",
    ],
  },
  {
    label: "Lernen",
    href: "lernen/",
    match: ["lernen/", "akademie.html", "akademie/"],
  },
  {
    label: "Bibliothek",
    href: "bibliothek/",
    match: ["bibliothek/", "downloads.html", "downloads/", "dokumente/", "referenz/", "buch.html", "buch/", "evidenz/", "quellen/", "fachbibliothek/", "blog.html", "blog/", "begriffe/", "glossar.html"],
  },
  {
    label: "Mitmachen",
    href: "mitmachen.html",
    match: ["mitmachen.html", "mitmachen/"],
  },
];

const utilities = [
  { label: "Suche", href: "suche.html", match: ["suche.html"] },
  { label: "WÖk-KI", href: "woek-ki/", match: ["woek-ki/"] },
  { label: "Mein Wirkungsraum", href: "mein-wirkungsraum/", match: ["mein-wirkungsraum/"] },
];

const wirkungsfelder = [
  {
    title: "Mensch & Lebensqualität",
    text: "Gesundheit, Bildung, Pflege, Teilhabe, Alltag und Lebensqualität werden als reale Zustandsveränderungen sichtbar.",
    links: [
      ["Gesundheit & Pflege", "wirkungsfelder/gesundheit-pflege/"],
      ["Bildung", "wirkungsfelder/bildung/"],
      ["Für Bürger:innen", "fuer/buergerinnen.html"],
    ],
  },
  {
    title: "Planet & Ressourcen",
    text: "Klima, Energie, Biodiversität, Rohstoffe, Wasser und Regeneration bilden die Grenze jeder Wirtschafts- und Soziallogik.",
    links: [
      ["Klima, Energie & Ressourcen", "wirkungsfelder/klima-energie-ressourcen/"],
      ["Produkte & Konsum", "wirkungsfelder/produkte-konsum/"],
      ["Reverse Merit Order", "werkzeuge/reverse-merit-order/"],
    ],
  },
  {
    title: "Wirtschaft, Produkte & Unternehmen",
    text: "Unternehmen, Produkte, Lieferketten, Preise und Geschäftsmodelle werden als Wirkungssysteme gelesen.",
    links: [
      ["Wirtschaft & Unternehmen", "wirkungsfelder/wirtschaft-unternehmen/"],
      ["Produkte & Konsum", "wirkungsfelder/produkte-konsum/"],
      ["Für Unternehmen", "fuer/unternehmen.html"],
    ],
  },
  {
    title: "Arbeit, Einkommen & Soziales",
    text: "Leistung, Care, Automatisierung, Einkommen, Rente und soziale Sicherung werden mit Wirkung rückgekoppelt.",
    links: [
      ["Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/"],
      ["Wirkungseinkommen", "fuer/wirkungseinkommen.html"],
      ["Wirkungsrente", "fuer/rente.html"],
    ],
  },
  {
    title: "Wohnen, Stadt & Infrastruktur",
    text: "Wohnen ist mehr als Quadratmeter: Bezahlbarkeit, Gesundheit, Energie, Quartier, Boden und öffentliche Infrastruktur wirken zusammen.",
    links: [
      ["Wohnen & Stadt", "wirkungsfelder/wohnen-stadt/"],
      ["Für Mieter:innen", "fuer/mieter.html"],
      ["Kommunen", "fuer/kommunen.html"],
    ],
  },
  {
    title: "Staat, Recht & Demokratie",
    text: "Recht, Haushalt, Verwaltung, Beschaffung, Schutzlinien und demokratische Legitimation werden zur Wirkungsarchitektur.",
    links: [
      ["Staat, Recht & Demokratie", "wirkungsfelder/staat-recht-demokratie/"],
      ["Wirkungshaushalt", "wirkungssteuerung/wirkungshaushalt/"],
      ["Wirkungsrat", "wirkungssteuerung/wirkungsrat/"],
    ],
  },
  {
    title: "Öffentlichkeit, Medien & Resonanz",
    text: "Öffentliche Kommunikation wird als Wirkungsraum gelesen: Aufmerksamkeit, Emotion, Deutung, Resonanz und Verschiebung.",
    links: [
      ["Öffentlicher Wirkungsraum", "oeffentlicher-wirkungsraum/"],
      ["Debattenkarten", "wirkungsradar/debattenkarten/"],
      ["Medien & Öffentlichkeit", "wirkungsfelder/medien-oeffentlichkeit/"],
    ],
  },
  {
    title: "Wissen, Bildung, Wissenschaft & Digitalisierung",
    text: "Wissen, Daten, KI, Forschung, Lernfähigkeit und digitale Infrastruktur entscheiden, ob Wirkung prüfbar wird.",
    links: [
      ["Wissenschaft & Digitalisierung", "wirkungsfelder/wissenschaft-innovation-digitalisierung/"],
      ["Akademie", "akademie.html"],
      ["Wirkungsdatenräume", "werkzeuge/wirkungsdatenraeume/"],
    ],
  },
  {
    title: "Kapital, Banken & Risikomanagement",
    text: "Kapital bleibt Werkzeug. Entscheidend ist, welche Wirkung es verstärkt und welche Risiken es auslagert.",
    links: [
      ["Finanzsystem & Kapital", "wirkungsfelder/finanzsystem-kapital/"],
      ["Kapital & ESG", "wirkungssteuerung/kapital-banken-esg/"],
      ["Risikomanagement", "wirkungssteuerung/risikomanagement/"],
    ],
  },
];

const steuerungPages = [
  ["ueberblick", "Überblick", "Warum Preise, Steuern, Kapital und Einkommen Wirkung berücksichtigen müssen."],
  ["wirkungssteuer", "Wirkungssteuer", "Schädliche Wirkung darf sich nicht länger rechnen; positive Netto-Wirkung soll sich lohnen."],
  ["produktpreise", "Produktpreise", "Was wäre ein ehrlicherer Preis, wenn Schäden und Nutzen sichtbar werden?"],
  ["wustg", "Wirkungsumsatzsteuergesetz", "Wie Produktwirkung in eine Umsatzsteuerlogik übersetzt werden kann."],
  ["wstg", "Wirkungssteuergesetz", "Wie Wirkung als Steuerungsgröße rechtlich anschlussfähig wird."],
  ["westg", "Wirkungseinkommensteuergesetz", "Wie Einkommen, Automatisierung und Wirkung neu verbunden werden können."],
  ["wirkungseinkommen", "Wirkungseinkommen", "Warum Einkommen nicht nur Erwerbsarbeit, sondern gesellschaftliche Wirkung berücksichtigen muss."],
  ["wirkungsrente", "Wirkungsrente", "Wie Lebensleistung, Care, Pflege, Bildung und Stabilität sichtbarer werden."],
  ["wirkungshaushalt", "Wirkungshaushalt", "Wie öffentliche Mittel nach tatsächlicher Wirkung priorisiert werden können."],
  ["wirkungsrat", "Wirkungsrat", "Welche demokratische Schutz- und Prüfarchitektur Wirkungspolitik braucht."],
  ["scorecards", "Scorecards", "Wie Wirkung sichtbar, vergleichbar und prüfbar gemacht wird."],
  ["woek-ids", "WÖk-IDs", "Wie Produkte, Organisationen und Wirkpfade auffindbar und rückverfolgbar werden."],
  ["reverse-merit-order", "Reverse Merit Order", "Warum schwere Schäden nicht durch kleine Vorteile kompensiert werden dürfen."],
  ["csrd-esrs-gri", "CSRD, ESRS und GRI", "Wie Berichtssysteme mit Wirkungssteuerung verbunden werden können."],
  ["digitaler-produktpass", "Digitaler Produktpass", "Wie Produktdaten zur Wirkungsrückkopplung beitragen können."],
  ["kapital-banken-esg", "Kapital, Banken und ESG", "Wie Kapitalflüsse Wirkung, Risiko und Resilienz einpreisen können."],
  ["risikomanagement", "Risikomanagement", "Warum ausgelagerte Wirkung ein reales Risiko für Unternehmen, Staat und Gesellschaft ist."],
  ["lieferketten", "Lieferketten", "Wie Wirkung entlang von Rohstoffen, Arbeit, Transport und Nutzung sichtbar wird."],
  ["beschaffung-foerderung", "Beschaffung & Förderung", "Wie öffentliche Nachfrage und Förderung positive Netto-Wirkung wahrscheinlicher machen."],
];

const steuerungPageMap = Object.fromEntries(
  steuerungPages.map(([slug, title, text]) => [slug, { title, text }])
);

const steuerungClusters = [
  {
    title: "Preise & Steuern",
    text: "Wie Preise und Steuerlogiken externe Schäden, positive Netto-Wirkung und politische Schutzlinien sichtbar machen.",
    slugs: ["wirkungssteuer", "produktpreise", "wustg", "wstg"],
  },
  {
    title: "Einkommen & Rente",
    text: "Wie Arbeit, Care, Prävention, Automatisierung und gesellschaftliche Stabilisierung in Einkommens- und Rentenlogiken zurückwirken.",
    slugs: ["wirkungseinkommen", "wirkungsrente", "westg"],
  },
  {
    title: "Staat & Governance",
    text: "Wie öffentliche Mittel, demokratische Kontrolle, Beschaffung und Förderung nach Wirkung statt nur nach Ausgabenstellen gesteuert werden.",
    slugs: ["wirkungshaushalt", "wirkungsrat", "beschaffung-foerderung"],
  },
  {
    title: "Kapital & Märkte",
    text: "Wie Kapital, Banken, ESG, Risiken und Berichtssysteme an reale Wirkungen statt nur an Kennzahlen und Etiketten rückgekoppelt werden.",
    slugs: ["kapital-banken-esg", "risikomanagement", "csrd-esrs-gri"],
  },
  {
    title: "Produkte & Lieferketten",
    text: "Wie Produktdaten, Lieferketten, Scorecards und digitale Produktpässe den Lebensweg von Produkten prüfbar machen.",
    slugs: ["scorecards", "digitaler-produktpass", "lieferketten"],
  },
  {
    title: "Architektur & Prinzipien",
    text: "Welche Grundlogik die Bausteine zusammenhält: Überblick, Schutz vor Schönrechnung und stabile Verknüpfungen.",
    slugs: ["ueberblick", "reverse-merit-order", "woek-ids"],
  },
];

const steuerungDetails = {
  ueberblick: {
    type: "Konzept",
    cluster: "Architektur & Prinzipien",
    what:
      "Der Überblick ordnet die Bausteine der Wirkungssteuerung. Er zeigt, wie Wirkung aus der Beobachtung heraus in Entscheidungen zurückgeführt wird: in Preise, Steuern, Haushalte, Kapital, Beschaffung, Produkte, Einkommen und Regeln.",
    why:
      "Ohne diese Rückkopplung bleibt Wirkung ein Berichtsthema. Organisationen können dann weiter nach Kosten, Output oder Rendite handeln, obwohl Schäden, Risiken oder positive Netto-Wirkung längst sichtbar sind.",
    how: [
      "Wirkung wird als Zustandsveränderung beschrieben, nicht als Absicht.",
      "Bewertung erfolgt für Mensch, Planet und Demokratie.",
      "Die Rückkopplung entscheidet, ob sich bessere Wirkung auch praktisch lohnt.",
    ],
    more: [
      ["Wirkung", "begriffe/wirkung/"],
      ["Positive Netto-Wirkung", "begriffe/positive-netto-wirkung/"],
      ["Scorecards", "wirkungssteuerung/scorecards/"],
    ],
  },
  wirkungssteuer: {
    type: "Konzept / Kernbaustein",
    cluster: "Preise & Steuern",
    what:
      "Die Wirkungssteuer beschreibt eine einfache Grundidee: Wenn eine Entscheidung Schäden verursacht, sollen diese Schäden nicht unsichtbar bleiben. Gute Wirkung soll sich eher lohnen, schlechte Wirkung soll nicht dauerhaft einen Preisvorteil haben.",
    why:
      "Viele Preise wirken niedrig, weil ein Teil der Rechnung woanders bezahlt wird: durch Krankheit, Klimaschäden, kaputte Infrastruktur, schlechte Arbeitsbedingungen oder spätere Sanierungskosten. Eine Wirkungssteuer macht diese verschobene Rechnung sichtbar.",
    plain:
      "Stell dir zwei Produkte vor. Beide kosten an der Kasse gleich viel. Das eine hält lange, lässt sich reparieren und wurde sauber hergestellt. Das andere ist billig, geht schnell kaputt und hinterlässt Entsorgungskosten. Heute behandelt der Preis beide oft fast gleich. Die Wirkungssteuer fragt: Warum soll das schlechtere Produkt dauerhaft den besseren Start haben?",
    how: [
      "Produkte, Leistungen oder Tätigkeiten werden über Wirkungsklassen eingeordnet.",
      "Schutzlinien verhindern Personenbewertung und automatische Sanktionen.",
      "Steuersignale werden als politische, prüfbare Lenkung verstanden, nicht als moralisches Urteil.",
    ],
    more: [
      ["Produktpreise", "wirkungssteuerung/produktpreise/"],
      ["Wirkungsumsatzsteuergesetz", "wirkungssteuerung/wustg/"],
      ["Reverse Merit Order", "wirkungssteuerung/reverse-merit-order/"],
    ],
    case: {
      title: "Ein niedriger Preis ist noch kein guter Preis.",
      text:
        "Wenn ein Produkt billig wirkt, weil Klima-, Gesundheits-, Entsorgungs- oder Infrastrukturkosten ausgelagert werden, ist der Preis unvollständig. Die Wirkungssteuer fragt nicht, ob ein Produkt moralisch gut oder schlecht ist. Sie fragt, ob das Preissignal die reale Netto-Wirkung besser abbildet.",
    },
    questions: [
      "Welche Wirkung wird konkret belegt und welche nur behauptet?",
      "Welche Alternativen sind verfügbar, bezahlbar und wirksam?",
      "Wer legt die Wirkungsklassen demokratisch fest und wie kann die Einordnung angefochten werden?",
      "Wie werden soziale Härten, Übergangsfristen und Datengrenzen berücksichtigt?",
    ],
    mpd: {
      Mensch: "Gesundheit, Arbeitsbedingungen, Leistbarkeit und Verteilung dürfen nicht als Nebensache im Preis verschwinden.",
      Planet: "Emissionen, Ressourcenverbrauch, Reparierbarkeit und Entsorgung werden als reale Folgewirkung betrachtet.",
      Demokratie: "Steuerliche Lenkung braucht Rechtsweg, Transparenz, parlamentarische Zuständigkeit und Schutz vor Personenbewertung.",
    },
    sources: [
      ["Technische Leitlinien WUStG", "bibliothek/technische-leitlinien-wustg/", "Anschluss an Wirkungsklassen, Schutzlinien und Pilotlogik"],
      ["WStG Oktober 2025", "bibliothek/wstg-oktober-2025/", "rechtlicher Rahmen und demokratische Zuständigkeit"],
      ["Produktpreise", "wirkungssteuerung/produktpreise/", "Preislogik und ausgelagerte Folgekosten"],
      ["Begriff: Wirkungssteuer", "begriffe/wirkungssteuer/", "Definition und Begriffsabgrenzung"],
    ],
  },
  produktpreise: {
    type: "Konzept",
    cluster: "Preise & Steuern",
    what:
      "Produktpreise fragt, was ein Preis zeigen müsste, wenn Schäden, Nutzen, Lieferketten, Nutzung und Entsorgung nicht ausgeblendet werden. Es geht nicht um perfekte Wahrheit, sondern um bessere Signale.",
    why:
      "Billige Produkte können teuer sein, wenn Folgekosten bei Umwelt, Gesundheit, Beschäftigten, Kommunen oder künftigen Generationen landen. Dann lügt der Preis nicht absichtlich, aber er bleibt unvollständig.",
    how: [
      "Die Bilanzgrenze wird erweitert: Rohstoffe, Produktion, Nutzung, Reparatur und Entsorgung.",
      "Wirkung wird in Klassen oder Scorecards übersetzt.",
      "Preis-, Steuer- und Beschaffungslogik können auf diese Bewertung reagieren.",
    ],
    more: [
      ["Scorecards", "wirkungssteuerung/scorecards/"],
      ["Digitaler Produktpass", "wirkungssteuerung/digitaler-produktpass/"],
      ["Produkte & Konsum", "wirkungsfelder/produkte-konsum/"],
    ],
  },
  wustg: {
    type: "Gesetzesentwurf",
    cluster: "Preise & Steuern",
    what:
      "Das Wirkungsumsatzsteuergesetz ist ein Modell für eine Umsatzsteuerlogik, die Produktwirkung stärker berücksichtigt. Es fragt, wie positive Netto-Wirkung steuerlich entlastet und schwere Schäden belastet werden könnten.",
    why:
      "Die heutige Umsatzsteuer behandelt sehr unterschiedliche Wirkungen oft gleich. Dadurch bleiben gesundheitliche, ökologische und demokratische Folgekosten außerhalb des Preissignals.",
    how: [
      "Produktgruppen werden nicht moralisch, sondern anhand prüfbarer Wirkungskriterien betrachtet.",
      "Wirkungsklassen verändern die steuerliche Behandlung innerhalb politisch gesetzter Schutzgrenzen.",
      "Pilotierung, Datenqualität und demokratische Kontrolle sind Voraussetzung.",
    ],
    more: [
      ["Wirkungssteuer", "wirkungssteuerung/wirkungssteuer/"],
      ["Produktpreise", "wirkungssteuerung/produktpreise/"],
      ["Staat, Recht & Demokratie", "wirkungsfelder/staat-recht-demokratie/"],
    ],
  },
  wstg: {
    type: "Gesetzesentwurf",
    cluster: "Preise & Steuern",
    what:
      "Das Wirkungssteuergesetz ist ein Rahmenentwurf für die Frage, wie Wirkung als öffentliche Steuerungsgröße rechtlich anschlussfähig werden kann.",
    why:
      "Wenn Wirkung politisch gewollt ist, braucht sie Regeln: Zuständigkeit, Datenqualität, Rechtsweg, Schutzlinien, Transparenz und demokratische Kontrolle.",
    how: [
      "Der Entwurf trennt Bewertungslogik, Datenbasis und politische Entscheidung.",
      "Er legt Schutzlinien gegen Social-Credit-Logik und Personenbewertung fest.",
      "Er macht Wirkung lenkbar, ohne Parlamente, Gerichte oder Verwaltung zu ersetzen.",
    ],
    more: [
      ["Wirkungsrat", "wirkungssteuerung/wirkungsrat/"],
      ["Wirkungshaushalt", "wirkungssteuerung/wirkungshaushalt/"],
      ["Politische Anschlussfähigkeit", "begriffe/politische-anschlussfaehigkeit/"],
    ],
  },
  westg: {
    type: "Gesetzesentwurf",
    cluster: "Einkommen & Rente",
    what:
      "Das Wirkungseinkommensteuergesetz ist ein Modell dafür, Einkommen, Erwerbsarbeit, Care, Automatisierung und gesellschaftliche Wirkung neu zusammenzudenken.",
    why:
      "Viele Beiträge stabilisieren Gesellschaft, erscheinen aber im heutigen Einkommen- und Steuersystem nur schwach: Pflege, Bildung, Sorgearbeit, Prävention, Integration oder lokale Infrastruktur.",
    how: [
      "Einkommen wird nicht nur als Lohn aus Erwerbsarbeit betrachtet.",
      "Wirkungsbeiträge und Schutzlinien werden politisch definierbar gemacht.",
      "Automatisierungsgewinne und gesellschaftliche Stabilisierung können gemeinsam bewertet werden.",
    ],
    more: [
      ["Wirkungseinkommen", "wirkungssteuerung/wirkungseinkommen/"],
      ["Wirkungsrente", "wirkungssteuerung/wirkungsrente/"],
      ["Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/"],
    ],
  },
  wirkungseinkommen: {
    type: "Konzept",
    cluster: "Einkommen & Rente",
    what:
      "Wirkungseinkommen fragt, wie gesellschaftlich notwendige Wirkung anerkannt werden kann, auch wenn sie nicht vollständig über klassische Erwerbsarbeit, Marktpreise oder Rendite sichtbar wird.",
    why:
      "Wenn nur bezahlt wird, was sich unmittelbar rechnet, bleiben Pflege, Prävention, Bildung, Integration, Gemeinwesenarbeit und Stabilisierung systematisch unterbewertet.",
    how: [
      "Wirkungsbeiträge werden über nachvollziehbare Kriterien beschrieben.",
      "Es geht um politische Rückkopplung, nicht um moralische Belohnungslisten.",
      "Pilotierung muss Zielkonflikte, Finanzierung und Missbrauchsschutz offenlegen.",
    ],
    more: [
      ["Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/"],
      ["Wirkungseinkommen-Rechner", "werkzeuge/wirkungseinkommen/"],
      ["Positive Netto-Wirkung", "begriffe/positive-netto-wirkung/"],
    ],
  },
  wirkungsrente: {
    type: "Konzept",
    cluster: "Einkommen & Rente",
    what:
      "Die Wirkungsrente fragt, wie Lebensleistung, Sorgearbeit, Pflege, Bildung, Ehrenamt, Prävention und gesellschaftliche Stabilisierung im Alter sichtbarer werden können.",
    why:
      "Rentenlogiken hängen stark an Erwerbsbiografien. Wer Wirkung erzeugt, die nicht als Lohn erscheint, kann trotz hoher gesellschaftlicher Bedeutung schlechter abgesichert sein.",
    how: [
      "Erwerbsarbeit bleibt wichtig, wird aber um gesellschaftliche Wirkungsbeiträge ergänzt.",
      "Bewertung braucht transparente Kriterien und demokratische Kontrolle.",
      "Die Wirkungsrente ist ein Prüfmodell, kein fertiger Leistungsbescheid.",
    ],
    more: [
      ["Wirkungseinkommen", "wirkungssteuerung/wirkungseinkommen/"],
      ["Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/"],
      ["Für Bürger:innen", "fuer/buergerinnen.html"],
    ],
  },
  wirkungshaushalt: {
    type: "Konzept / Kernbaustein",
    cluster: "Staat & Governance",
    what:
      "Der Wirkungshaushalt fragt bei öffentlichen Ausgaben nicht nur: Was kostet das? Sondern auch: Was verändert diese Ausgabe wirklich, und was kostet es, wenn wir sie nicht machen?",
    why:
      "Ein normaler Haushalt zeigt, wo Geld ausgegeben wird. Er zeigt aber oft nicht, welche Schäden entstehen, wenn notwendige Investitionen verschoben werden. Dadurch kann Sparen im Plan gut aussehen und im Leben teuer werden.",
    plain:
      "Eine Kommune kann sagen: Für Hitzeschutz an Schulen ist gerade kein Geld da. Im Haushalt ist das eine gesparte Ausgabe. In der Wirklichkeit können später Unterrichtsausfälle, Gesundheitsprobleme, Umbauten und Notmaßnahmen entstehen. Der Wirkungshaushalt legt diese zweite Rechnung neben die erste.",
    how: [
      "Mittel werden mit Wirkungszielen, Zielgruppen, Zeitpfad und Nebenfolgen verknüpft.",
      "Unterlassungskosten werden sichtbar: Was kostet es, nicht zu handeln?",
      "Demokratische Entscheidung bleibt zentral; Wirkung verbessert die Entscheidungsgrundlage.",
    ],
    more: [
      ["Staat, Recht & Demokratie", "wirkungsfelder/staat-recht-demokratie/"],
      ["Wirkungsrat", "wirkungssteuerung/wirkungsrat/"],
      ["Wirkungssteuer", "wirkungssteuerung/wirkungssteuer/"],
    ],
    case: {
      title: "Eine gesparte Ausgabe kann eine teure Unterlassung sein.",
      text:
        "Wenn eine Kommune bei Schulsozialarbeit, Hitzeschutz, Pflegeinfrastruktur oder Wohnprävention spart, sinkt kurzfristig der Haushaltsposten. Später können höhere Gesundheits-, Reparatur-, Sicherheits- oder Integrationskosten entstehen. Der Wirkungshaushalt macht diesen Zeitpfad sichtbar, bevor aus Sparsamkeit Blindheit wird.",
    },
    questions: [
      "Welche Kosten entstehen, wenn nicht gehandelt wird?",
      "Welche Wirkung tritt kurzfristig ein und welche erst nach Jahren?",
      "Wer profitiert, wer trägt die Last und wer wird im Haushalt unsichtbar?",
      "Ist die Maßnahme Zuschuss, Kredit, Investition, Vorsorge oder laufender Aufwand?",
    ],
    mpd: {
      Mensch: "Öffentliche Mittel werden daran gemessen, ob Lebensbedingungen, Versorgung, Bildung, Sicherheit oder Teilhabe real verbessert werden.",
      Planet: "Prävention bei Hitze, Wasser, Fläche, Energie und Infrastruktur wird als Haushaltswirkung sichtbar.",
      Demokratie: "Haushaltsdebatten werden nachvollziehbarer, weil Unterlassungskosten und Zielkonflikte offen gelegt werden.",
    },
    sources: [
      ["Werkzeug: Wirkungshaushalt", "werkzeuge/wirkungshaushalt/", "Anwendung und Rechenlogik für öffentliche Mittel"],
      ["Staat, Recht & Demokratie: Wirkungshaushalt", "wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/", "politische und administrative Einordnung"],
      ["Wirkungsrat-Konzept", "bibliothek/wirkungsrat-konzept/", "Governance, Prüfung und Schutzlinien"],
      ["Begriff: Wirkungshaushalt", "begriffe/wirkungshaushalt/", "Definition und Abgrenzung"],
    ],
  },
  wirkungsrat: {
    type: "Governance-Struktur",
    cluster: "Staat & Governance",
    what:
      "Der Wirkungsrat ist als Prüfinstanz gedacht. Er soll nicht entscheiden, was politisch richtig ist. Er soll prüfen, ob Wirkungsdaten, Methoden, Schutzlinien und Zielkonflikte sauber offengelegt sind.",
    why:
      "Sobald Wirkung in Steuern, Förderung, Beschaffung oder Haushalte einfließt, werden Zahlen mächtig. Dann reicht es nicht, eine schöne Kennzahl zu haben. Es muss prüfbar sein, wie sie entstanden ist und wer widersprechen kann.",
    plain:
      "Man kann sich den Wirkungsrat wie eine unabhängige Qualitätskontrolle vorstellen. Nicht wie ein Wahrheitsministerium, sondern wie eine Stelle, die fragt: Sind die Daten offen? Ist die Methode nachvollziehbar? Gibt es Interessenkonflikte? Wurden Betroffene gehört? Am Ende entscheidet weiter die demokratische Institution.",
    how: [
      "Er prüft Methoden, Datenqualität und Zielkonflikte.",
      "Er ersetzt keine Parlamente und keine Gerichte.",
      "Er macht Streitpunkte sichtbar, bevor sie als objektive Zahl missverstanden werden.",
    ],
    more: [
      ["Wirkungshaushalt", "wirkungssteuerung/wirkungshaushalt/"],
      ["Scorecards", "wirkungssteuerung/scorecards/"],
      ["Demokratie", "begriffe/demokratie/"],
    ],
    case: {
      title: "Wirkungsdaten brauchen Widerspruch, nicht Autoritätsglanz.",
      text:
        "Sobald Wirkungsklassen in Förderung, Steuern, Beschaffung oder Haushalte einfließen, entscheidet die Methode mit. Der Wirkungsrat soll deshalb nicht politisch entscheiden, sondern Qualität, Datenbasis, Zielkonflikte und Schutzlinien prüfbar machen.",
    },
    questions: [
      "Welches Mandat hat der Wirkungsrat und wo endet es?",
      "Wie werden Interessenkonflikte, Lobbydruck und Methodenstreit sichtbar gemacht?",
      "Welche Daten, Modelle und Gewichtungen werden veröffentlicht?",
      "Wie bleiben Parlament, Verwaltung, Gerichte und Öffentlichkeit zuständig?",
    ],
    mpd: {
      Mensch: "Betroffene Gruppen müssen sichtbar sein, ohne zu Bewertungsobjekten eines Scores zu werden.",
      Planet: "Langfristige und irreversible Schäden brauchen fachliche Prüfung, nicht nur kurzfristige Mehrheitslogik.",
      Demokratie: "Der Wirkungsrat stärkt demokratische Entscheidung nur, wenn er Transparenz, Anfechtbarkeit und Rechtsweg verbessert.",
    },
    sources: [
      ["Wirkungsrat-Konzept", "bibliothek/wirkungsrat-konzept/", "Grundmodell, Mandat und Schutzarchitektur"],
      ["Werkzeug: Wirkungsrat", "werkzeuge/wirkungsrat/", "operative Einordnung und Anwendungslogik"],
      ["Wirkungsrat Governance", "wirkungsfelder/staat-recht-demokratie/wirkungsrat-governance/", "politische Anschlussfähigkeit"],
      ["Begriff: Wirkungsrat", "begriffe/wirkungsrat/", "Definition und Abgrenzung"],
    ],
  },
  scorecards: {
    type: "Methode",
    cluster: "Produkte & Lieferketten",
    what:
      "Scorecards machen Wirkung vergleichbarer, ohne sie auf eine einzige Scheingenauigkeit zu reduzieren. Sie zeigen Kriterien, Datenqualität, rote Linien und offenen Prüfbedarf.",
    why:
      "Ohne Scorecard gewinnt oft das, was am billigsten, lautesten oder am besten vermarktet ist. Ob es langfristig bessere oder schlechtere Wirkung erzeugt, bleibt dann eine Behauptung.",
    plain:
      "Nimm ein T-Shirt. Ein Preis sagt dir nicht, wie lange es hält, wie es produziert wurde, ob Chemikalien eingesetzt wurden, ob Reparatur möglich ist oder ob Menschen fair bezahlt wurden. Eine Scorecard legt diese Prüfpunkte nebeneinander. Sie sagt nicht: Dieses Produkt ist perfekt. Sie sagt: Hier sieht man genauer hin.",
    how: [
      "Kriterien werden nach Wirkpfad, Datenqualität und Zielkonflikten geordnet.",
      "Scorecards zeigen Richtung und Prüfbedarf, nicht absolute Wahrheit.",
      "Sie müssen transparent, anfechtbar und aktualisierbar bleiben.",
    ],
    more: [
      ["WÖk-IDs", "wirkungssteuerung/woek-ids/"],
      ["Digitaler Produktpass", "wirkungssteuerung/digitaler-produktpass/"],
      ["Impact Controlling", "werkzeuge/impact-controlling/"],
    ],
    case: {
      title: "Eine Scorecard ist eine Prüflandkarte, kein Endurteil.",
      text:
        "Ein T-Shirt, ein Lebensmittel, ein Mobilitätsprodukt oder ein kommunales Projekt kann nicht seriös über einen Einzelwert verstanden werden. Scorecards ordnen Kriterien, Datenqualität, Zielkonflikte und Schutzlinien. Sie zeigen, wo eine Entscheidung besser begründet ist und wo noch Unsicherheit bleibt.",
    },
    questions: [
      "Welche Indikatoren werden genutzt und warum fehlen andere?",
      "Welche Gewichtung ist fachlich, politisch oder normativ gesetzt?",
      "Welche roten Linien dürfen nicht durch Pluspunkte kompensiert werden?",
      "Wie oft werden Daten, Quellen und Bewertung aktualisiert?",
    ],
    mpd: {
      Mensch: "Arbeitsbedingungen, Gesundheit, Leistbarkeit, Teilhabe und Nutzung werden nicht hinter Preis oder Image versteckt.",
      Planet: "Rohstoffe, Emissionen, Reparatur, Nutzung und Entsorgung werden entlang des Lebenswegs geprüft.",
      Demokratie: "Scorecards müssen nachvollziehbar und kritisierbar bleiben, sonst werden sie zu scheinobjektiven Blackboxes.",
    },
    sources: [
      ["Werkzeug: Scorecards", "werkzeuge/scorecards/", "Anwendung und Bewertungslogik"],
      ["Dossier: Scorecards", "werkzeuge/impact-controlling/dossiers/scorecards/", "Vertiefung im Impact Controlling"],
      ["Produktscorecards", "wirkungsfelder/produkte-konsum/detailkonzepte/produktscorecards/", "Produkt- und Konsumkontext"],
      ["Begriff: Scorecards", "begriffe/scorecards/", "Definition und Abgrenzung"],
    ],
  },
  "woek-ids": {
    type: "Technische Infrastruktur",
    cluster: "Architektur & Prinzipien",
    what:
      "WÖk-IDs sind eine Identifikationslogik für Begriffe, Produkte, Wirkpfade, Indikatoren oder Dokumente. Sie helfen, Wirkung nachvollziehbar zu verknüpfen.",
    why:
      "Ohne saubere Identifikation entstehen Dubletten, unklare Quellen, wechselnde Begriffe und schwer prüfbare Aussagen. Das schwächt Vertrauen und Vergleichbarkeit.",
    how: [
      "Begriffe, Dokumente und Wirkungsobjekte bekommen stabile Referenzen.",
      "Verknüpfungen zwischen Glossar, Bibliothek, Scorecards und Werkzeugen werden sichtbar.",
      "IDs dienen der Nachvollziehbarkeit, nicht der Bewertung von Personen.",
    ],
    more: [
      ["Scorecards", "wirkungssteuerung/scorecards/"],
      ["Glossar", "begriffe/"],
      ["Bibliothek", "bibliothek/"],
    ],
  },
  "reverse-merit-order": {
    type: "Prinzip",
    cluster: "Architektur & Prinzipien",
    what:
      "Die Reverse Merit Order ist eine Schutzlogik. Sie sagt: Bevor man Vorteile zusammenrechnet, muss zuerst geprüft werden, ob schwere Schäden oder rote Linien berührt sind.",
    why:
      "Viele Bewertungen machen aus Plus und Minus am Ende eine Zahl. Das kann gefährlich sein, wenn ein kleiner Nutzen einen schweren Schaden scheinbar ausgleicht. Manche Schäden dürfen nicht einfach verrechnet werden.",
    plain:
      "Ein Projekt kann Arbeitsplätze schaffen und trotzdem ein Grundwassergebiet dauerhaft schädigen. Dann reicht es nicht zu sagen: Die Pluspunkte überwiegen. Die Reverse Merit Order fragt zuerst: Gibt es eine rote Linie? Erst wenn diese Frage sauber beantwortet ist, wird Nutzen abgewogen.",
    how: [
      "Zuerst werden Ausschluss- und Schutzkriterien geprüft.",
      "Danach werden Nutzen, Alternativen und Zielkonflikte bewertet.",
      "Das Prinzip schützt vor Kompensation schwerer Schäden durch bequeme Pluspunkte.",
    ],
    more: [
      ["Wirkungsbewertung", "begriffe/wirkungsbewertung/"],
      ["Planetare Grenzen", "begriffe/planetare-grenzen/"],
      ["Risikomanagement", "wirkungssteuerung/risikomanagement/"],
    ],
    case: {
      title: "Schwere Schäden dürfen nicht billig verrechnet werden.",
      text:
        "Ein Projekt kann Beschäftigung, Wachstum oder Bequemlichkeit erzeugen und trotzdem rote Linien überschreiten: irreversible Ökosystemschäden, Grundrechtsrisiken, demokratische Abhängigkeiten oder nicht rückholbare Belastungen. Die Reverse Merit Order prüft solche Grenzen zuerst, bevor Nutzen saldiert wird.",
    },
    questions: [
      "Welche Schäden sind reversibel und welche nicht?",
      "Welche Schutzgrenze wird berührt: Gesundheit, Grundrechte, Klima, Biodiversität oder Demokratie?",
      "Gibt es eine Alternative mit ähnlichem Nutzen und geringerem Risiko?",
      "Wer trägt das Risiko, wer profitiert und wer kann widersprechen?",
    ],
    mpd: {
      Mensch: "Grundrechte, Gesundheit, Sicherheit und Teilhabe werden nicht gegen kleine Effizienzgewinne verrechnet.",
      Planet: "Irreversible Schäden an Klima, Biodiversität, Wasser oder Ressourcen werden vor Nutzenoptimierung geprüft.",
      Demokratie: "Machtkonzentration, Abhängigkeit, Intransparenz und fehlender Rechtsweg gelten als eigene Risikoklasse.",
    },
    sources: [
      ["Werkzeug: Reverse Merit Order", "werkzeuge/reverse-merit-order/", "Prinzip und Anwendung"],
      ["Dossier: Reverse Merit Order", "werkzeuge/impact-controlling/dossiers/reverse-merit-order/", "Vertiefung im Impact Controlling"],
      ["Reverse Merit Order im Produktkontext", "wirkungsfelder/produkte-konsum/detailkonzepte/reverse-merit-order/", "Anwendung auf Produkte und Lieferketten"],
      ["Begriff: Reverse Merit Order", "begriffe/reverse-merit-order/", "Definition und Abgrenzung"],
    ],
  },
  "csrd-esrs-gri": {
    type: "Standards-Anschluss",
    cluster: "Kapital & Märkte",
    what:
      "CSRD, ESRS und GRI sind Berichts- und Nachhaltigkeitsstandards. In der Wirkungsökonomie werden sie als Anschlussstellen gelesen, nicht als vollständige Wirkungssteuerung.",
    why:
      "Reporting kann Transparenz schaffen, aber noch keine bessere Wirkung erzeugen. Entscheidend ist, ob Daten in Entscheidungen, Kapitalflüsse, Produkte und Regeln zurückwirken.",
    how: [
      "Berichtsdaten werden mit Wirkpfaden und Netto-Wirkung verknüpft.",
      "Datenqualität und Wesentlichkeit werden kritisch geprüft.",
      "Reporting wird vom Nachweis zur Rückkopplungsinfrastruktur weitergedacht.",
    ],
    more: [
      ["Kapital, Banken und ESG", "wirkungssteuerung/kapital-banken-esg/"],
      ["Impact Controlling", "werkzeuge/impact-controlling/"],
      ["Datenqualität", "begriffe/datenqualitaet/"],
    ],
  },
  "digitaler-produktpass": {
    type: "Instrument",
    cluster: "Produkte & Lieferketten",
    what:
      "Der digitale Produktpass kann Produktinformationen zu Materialien, Herkunft, Reparatur, Nutzung, Entsorgung und Wirkung besser verfügbar machen.",
    why:
      "Ohne Produktdaten bleiben Lieferketten, Reparierbarkeit, Recyclingfähigkeit und Folgekosten schwer sichtbar. Wirkung kann dann weder verglichen noch gesteuert werden.",
    how: [
      "Produktdaten werden entlang des Lebenswegs gesammelt.",
      "Scorecards und Wirkungsbewertung können auf belastbarere Informationen zugreifen.",
      "Datenschutz, Geschäftsgeheimnisse und Datenqualität müssen sauber geregelt sein.",
    ],
    more: [
      ["Produktpreise", "wirkungssteuerung/produktpreise/"],
      ["Scorecards", "wirkungssteuerung/scorecards/"],
      ["Lieferketten", "wirkungssteuerung/lieferketten/"],
    ],
  },
  "kapital-banken-esg": {
    type: "Konzept",
    cluster: "Kapital & Märkte",
    what:
      "Kapital, Banken und ESG fragt, wie Finanzströme Wirkung und Risiko berücksichtigen können, ohne Kapital zu verteufeln oder ESG als Etikett ausreichen zu lassen.",
    why:
      "Kapital kann Innovation, Infrastruktur und Resilienz ermöglichen. Es kann aber auch Schäden verstärken, Risiken auslagern oder Macht konzentrieren. Entscheidend ist die Rückkopplung an Wirkung.",
    how: [
      "Investitionen werden mit Wirkungspfaden, Transitionsrisiken und Schutzlinien verbunden.",
      "ESG-Daten werden auf reale Netto-Wirkung geprüft.",
      "Kapital bleibt Werkzeug; Wirkung wird Kompass.",
    ],
    more: [
      ["Finanzsystem & Kapital", "wirkungsfelder/finanzsystem-kapital/"],
      ["Risikomanagement", "wirkungssteuerung/risikomanagement/"],
      ["T-SROI", "werkzeuge/t-sroi/"],
    ],
  },
  risikomanagement: {
    type: "Konzept",
    cluster: "Kapital & Märkte",
    what:
      "Risikomanagement liest Wirkung nicht als weiches Zusatzthema, sondern als reales Risiko: regulatorisch, finanziell, reputativ, sozial, ökologisch und demokratisch.",
    why:
      "Ausgelagerte Schäden kehren zurück: als Kosten, Konflikte, Lieferkettenabbrüche, Rechtsrisiken, Vertrauensverlust oder politische Instabilität.",
    how: [
      "Wirkungsrisiken werden entlang von Lieferketten, Produkten, Kapital und Institutionen geprüft.",
      "Kurzfristige Ersparnisse werden gegen langfristige Folgekosten gestellt.",
      "Risikomanagement verbindet Daten, Szenarien, Schutzlinien und Verantwortung.",
    ],
    more: [
      ["Kapital, Banken und ESG", "wirkungssteuerung/kapital-banken-esg/"],
      ["Lieferketten", "wirkungssteuerung/lieferketten/"],
      ["Datenqualität", "begriffe/datenqualitaet/"],
    ],
  },
  lieferketten: {
    type: "Konzept",
    cluster: "Produkte & Lieferketten",
    what:
      "Lieferketten werden in der Wirkungsökonomie als Wirkpfade gelesen: Rohstoffe, Arbeit, Transport, Produktion, Nutzung, Entsorgung und regionale Folgen hängen zusammen.",
    why:
      "Wenn nur der Endpreis zählt, verschwinden Arbeitsbedingungen, Rohstoffrisiken, Emissionen, Abhängigkeiten und Reparierbarkeit aus der Entscheidung.",
    how: [
      "Die Bilanzgrenze wird vom Produkt zum Lebensweg erweitert.",
      "Wirkungsdaten werden mit Beschaffung, Produktpass und Scorecards verknüpft.",
      "Zielkonflikte zwischen Preis, Versorgung, Resilienz und Schutzstandards werden sichtbar.",
    ],
    more: [
      ["Digitaler Produktpass", "wirkungssteuerung/digitaler-produktpass/"],
      ["Beschaffung & Förderung", "wirkungssteuerung/beschaffung-foerderung/"],
      ["Wirtschaft & Unternehmen", "wirkungsfelder/wirtschaft-unternehmen/"],
    ],
  },
  "beschaffung-foerderung": {
    type: "Konzept",
    cluster: "Staat & Governance",
    what:
      "Beschaffung und Förderung sind starke Hebel, weil öffentliche Mittel und öffentliche Nachfrage Märkte prägen. Sie können Wirkung belohnen oder alte Schäden stabilisieren.",
    why:
      "Wenn Zuschläge nur nach niedrigstem Preis oder formaler Erfüllung vergeben werden, bleiben Lebenszykluskosten, soziale Wirkung, Klima, Resilienz und Innovation zu schwach berücksichtigt.",
    how: [
      "Vergabe- und Förderkriterien werden mit Wirkungszielen verbunden.",
      "Transparente Kriterien schützen vor Willkür und Scheingenauigkeit.",
      "Wirkung wird in Pilotprojekten, Beschaffung und Förderung praktisch rückgekoppelt.",
    ],
    more: [
      ["Wirkungshaushalt", "wirkungssteuerung/wirkungshaushalt/"],
      ["Scorecards", "wirkungssteuerung/scorecards/"],
      ["Staat, Recht & Demokratie", "wirkungsfelder/staat-recht-demokratie/"],
    ],
  },
};

const steuerungSubjects = {
  ueberblick: { subject: "Der Überblick", plural: false },
  wirkungssteuer: { subject: "Die Wirkungssteuer", plural: false },
  produktpreise: { subject: "Produktpreise", plural: true },
  wustg: { subject: "Das Wirkungsumsatzsteuergesetz", plural: false },
  wstg: { subject: "Das Wirkungssteuergesetz", plural: false },
  westg: { subject: "Das Wirkungseinkommensteuergesetz", plural: false },
  wirkungseinkommen: { subject: "Das Wirkungseinkommen", plural: false },
  wirkungsrente: { subject: "Die Wirkungsrente", plural: false },
  wirkungshaushalt: { subject: "Der Wirkungshaushalt", plural: false },
  wirkungsrat: { subject: "Der Wirkungsrat", plural: false },
  scorecards: { subject: "Scorecards", plural: true },
  "woek-ids": { subject: "WÖk-IDs", plural: true },
  "reverse-merit-order": { subject: "Die Reverse Merit Order", plural: false },
  "csrd-esrs-gri": { subject: "CSRD, ESRS und GRI", plural: true },
  "digitaler-produktpass": { subject: "Der digitale Produktpass", plural: false },
  "kapital-banken-esg": { subject: "Kapital, Banken und ESG", plural: true },
  risikomanagement: { subject: "Risikomanagement", plural: false },
  lieferketten: { subject: "Lieferketten", plural: true },
  "beschaffung-foerderung": { subject: "Beschaffung und Förderung", plural: true },
};

const anschlussraeume = [
  "Wissenschaft",
  "Politik",
  "Verwaltung & Recht",
  "Praxis & Pilotierung",
  "Wirtschaft & Unternehmen",
  "Finanzsystem, Banken & Versicherungen",
  "Zivilgesellschaft & Bürger:innen",
  "Bildung & Akademie",
  "Medien & Öffentlichkeit",
  "Internationale Standards",
  "Technologie, Daten & Infrastruktur",
  "Kritik, Legitimation & Schutzlinien",
];

function relative(base, href) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  return `${base}${href.replace(/^\/+/, "")}`;
}

function actionLinks(base, items) {
  return `<div class="hero-actions">
${items.map(([label, href, kind = "secondary"]) => `            <a class="btn btn-${kind}" href="${esc(relative(base, href))}">${esc(label)}</a>`).join("\n")}
          </div>`;
}

function contextSearch(base, placeholder, hidden = "") {
  return `<form class="card document-filter-grid" action="${esc(relative(base, "suche.html"))}" method="get" data-search-exclude>
            <label>Kontextsuche
              <input type="search" name="q" placeholder="${esc(placeholder)}">
            </label>
            ${hidden ? `<input type="hidden" name="bereich" value="${esc(hidden)}">` : ""}
            <button class="btn btn-primary" type="submit">Suchen</button>
          </form>`;
}

function linkList(base, links) {
  return links.map(([label, href]) => `<a class="text-link" href="${esc(relative(base, href))}">${esc(label)}</a>`).join(" · ");
}

function cardGrid(base, items) {
  return `<div class="card-grid two">
${items
  .map(
    (item) => `          <article class="card">
            <p class="card-kicker">${esc(item.kicker || "Einstieg")}</p>
            <h3 class="card-title">${esc(item.title)}</h3>
            <p class="card-text">${esc(item.text)}</p>
            ${item.links ? `<div class="portal-card-actions">${linkList(base, item.links)}</div>` : ""}
          </article>`
  )
  .join("\n")}
        </div>`;
}

function shell({ base, route, title, description, kicker, h1, subtitle, actions, content }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)} | Wirkungsökonomie</title>
    <meta name="description" content="${esc(description)}">
    <meta name="search_title" content="${esc(title)}">
    <meta name="search_description" content="${esc(description)}">
    <meta name="search_section" content="${esc(kicker)}">
    <meta name="search_type" content="Portal">
    <link rel="canonical" href="${SITE}/${route}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${STYLE_VERSION}">
  </head>
  <body>
    <header class="site-header" data-search-exclude><a class="brand" href="${base}index.html">Wirkungsökonomie</a><nav class="site-nav" id="site-nav"></nav></header>
    <main data-pagefind-body>
      <section class="hero">
        <div class="hero-copy">
          <p class="hero-kicker">${esc(kicker)}</p>
          <h1 class="hero-title">${esc(h1)}</h1>
          <p class="hero-subtitle">${esc(subtitle)}</p>
          ${actionLinks(base, actions)}
        </div>
      </section>
${content}
    </main>
    <script src="${base}assets/js/main.js?v=${SCRIPT_VERSION}" defer></script>
  </body>
</html>
`;
}

function updateNavigation() {
  const current = JSON.parse(fs.readFileSync(navigationPath, "utf8"));
  const footerGroups = [
    {
      title: "Verstehen",
      items: [
        { label: "Einstieg", href: "verstehen/", match: ["verstehen/"] },
        { label: "WÖk auf einer Seite", href: "verstehen/woek-auf-einer-seite/", match: ["verstehen/woek-auf-einer-seite/"] },
        { label: "So wirkt WÖk", href: "so-wirkt-wirkungsoekonomie/", match: ["so-wirkt-wirkungsoekonomie/"] },
        { label: "Modell", href: "modell.html", match: ["modell.html", "modell/"] },
        { label: "Glossar", href: "begriffe/", match: ["begriffe/", "glossar.html"] },
      ],
    },
    {
      title: "Für wen?",
      items: [
        { label: "Übersicht", href: "fuer/", match: ["fuer/"] },
        { label: "Bürger:innen", href: "fuer/buergerinnen.html", match: ["fuer/buergerinnen.html"] },
        { label: "Unternehmen", href: "fuer/unternehmen.html", match: ["fuer/unternehmen.html"] },
        { label: "Kommunen", href: "fuer/kommunen.html", match: ["fuer/kommunen.html"] },
        { label: "Investor:innen", href: "fuer/investoren.html", match: ["fuer/investoren.html"] },
        { label: "Journalismus", href: "fuer/journalismus.html", match: ["fuer/journalismus.html"] },
        { label: "Wissenschaft", href: "fuer/wissenschaft-forschung.html", match: ["fuer/wissenschaft-forschung.html"] },
      ],
    },
    {
      title: "Wirkungsfelder",
      items: [
        { label: "Alle Wirkungsfelder", href: "wirkungsfelder/", match: ["wirkungsfelder/"] },
        { label: "Mensch & Lebensqualität", href: "wirkungsfelder/gesundheit-pflege/", match: ["wirkungsfelder/gesundheit-pflege/"] },
        { label: "Planet & Ressourcen", href: "wirkungsfelder/klima-energie-ressourcen/", match: ["wirkungsfelder/klima-energie-ressourcen/"] },
        { label: "Wirtschaft & Unternehmen", href: "wirkungsfelder/wirtschaft-unternehmen/", match: ["wirkungsfelder/wirtschaft-unternehmen/"] },
        { label: "Staat, Recht & Demokratie", href: "wirkungsfelder/staat-recht-demokratie/", match: ["wirkungsfelder/staat-recht-demokratie/"] },
        { label: "Öffentlichkeit & Medien", href: "wirkungsfelder/medien-oeffentlichkeit/", match: ["wirkungsfelder/medien-oeffentlichkeit/"] },
      ],
    },
    {
      title: "Wirkungssteuerung",
      items: [
        { label: "Überblick", href: "wirkungssteuerung/", match: ["wirkungssteuerung/"] },
        { label: "Wirkungssteuer", href: "wirkungssteuerung/wirkungssteuer/", match: ["wirkungssteuerung/wirkungssteuer/"] },
        { label: "Produktpreise", href: "wirkungssteuerung/produktpreise/", match: ["wirkungssteuerung/produktpreise/"] },
        { label: "Wirkungshaushalt", href: "wirkungssteuerung/wirkungshaushalt/", match: ["wirkungssteuerung/wirkungshaushalt/"] },
        { label: "Wirkungsrat", href: "wirkungssteuerung/wirkungsrat/", match: ["wirkungssteuerung/wirkungsrat/"] },
        { label: "Scorecards & WÖk-IDs", href: "wirkungssteuerung/scorecards/", match: ["wirkungssteuerung/scorecards/", "wirkungssteuerung/woek-ids/"] },
      ],
    },
    {
      title: "Praxis & Tools",
      items: [
        { label: "Methodenlandkarte", href: "werkzeuge/", match: ["werkzeuge/"] },
        { label: "Öffentlicher Wirkungsraum", href: "oeffentlicher-wirkungsraum/", match: ["oeffentlicher-wirkungsraum/"] },
        { label: "Debattenkarten", href: "wirkungsradar/debattenkarten/", match: ["wirkungsradar/debattenkarten/"] },
        { label: "Tool-Demos", href: "erleben/", match: ["erleben/"] },
        { label: "WÖk-KI", href: "woek-ki/", match: ["woek-ki/"] },
      ],
    },
    {
      title: "Lernen",
      items: [
        { label: "Lernportal", href: "lernen/", match: ["lernen/"] },
        { label: "Akademie", href: "akademie.html", match: ["akademie.html", "akademie/"] },
        { label: "Mein Wirkungsraum", href: "mein-wirkungsraum/", match: ["mein-wirkungsraum/"] },
      ],
    },
    {
      title: "Bibliothek",
      items: [
        { label: "Bibliothek", href: "bibliothek/", match: ["bibliothek/"] },
        { label: "Journal", href: "blog.html", match: ["blog.html", "blog/"] },
        { label: "Online-Buch", href: "referenz/", match: ["referenz/"] },
        { label: "Dokumentenbibliothek", href: "bibliothek/", match: ["bibliothek/", "downloads.html", "downloads/"] },
        { label: "Quellen", href: "quellen/", match: ["quellen/"] },
        { label: "Updates & RSS", href: "updates/", match: ["updates/"] },
      ],
    },
  ];

  const next = {
    ...current,
    header,
    more: utilities,
    footerGroups,
  };

  fs.writeFileSync(navigationPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log("written assets/data/navigation.json");
}

function renderWirkungsfelderPage() {
  const base = "../";
  const cards = wirkungsfelder.map((field) => ({ kicker: "Wirkungsfeld", title: field.title, text: field.text, links: field.links }));
  return shell({
    base,
    route: "wirkungsfelder/",
    title: "Wirkungsfelder der Wirkungsökonomie",
    description: "Neun Suchräume der Wirkungsökonomie: Mensch, Planet, Wirtschaft, Arbeit, Wohnen, Staat, Öffentlichkeit, Wissen und Kapital.",
    kicker: "Wirkungsfelder",
    h1: "Wo wirkt eine Entscheidung?",
    subtitle:
      "Wirkungsfelder sind keine Themenablage. Sie zeigen, in welchem Lebens-, Wirtschafts- oder Institutionenraum Wirkung sichtbar, bewertet und zurückgekoppelt werden muss.",
    actions: [
      ["Wirkungsfeld suchen", "suche.html", "primary"],
      ["Wirkungssteuerung verstehen", "wirkungssteuerung/", "secondary"],
      ["Für wen öffnen", "fuer/", "secondary"],
    ],
    content: `
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Neun Suchräume</p>
          <h2>Die WÖk ordnet nach Wirkung, nicht nach Ressort.</h2>
          <p>Ein Thema kann mehrere Felder berühren. Deshalb führen die Karten nicht in starre Zuständigkeiten, sondern in Anschlussräume: Alltag, Wirtschaft, Staat, Öffentlichkeit, Wissen und Kapital.</p>
        </div>
        ${contextSearch(base, "z. B. Pflege, T-Shirt, Miete, Kapital, Medien, Klima", "wirkungsfelder")}
        ${cardGrid(base, cards)}
      </section>
`,
  });
}

function renderVerstehenPortal() {
  const base = "../";
  return shell({
    base,
    route: "verstehen/",
    title: "Wirkungsökonomie verstehen",
    description: "Ein verständlicher Einstieg in Wirkung, Wirkungspotenzial, positive Netto-Wirkung und Rückkopplung.",
    kicker: "Verstehen",
    h1: "Erst Alltag, dann Fachbegriff.",
    subtitle:
      "Die Wirkungsökonomie beginnt mit einer einfachen Frage: Was verändert sich wirklich - und für wen? Danach kommen Begriffe, Daten, Bewertung und Rückkopplung.",
    actions: [
      ["WÖk auf einer Seite", "verstehen/woek-auf-einer-seite/", "primary"],
      ["So wirkt WÖk", "so-wirkt-wirkungsoekonomie/", "secondary"],
      ["Glossar öffnen", "begriffe/", "secondary"],
    ],
    content: `
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Grundbewegung</p>
          <h2>Vom Preis zur Wirkung.</h2>
          <p>Ein Preis zeigt, was bezahlt wird. Er zeigt nicht automatisch, welche Folgen bei Arbeit, Gesundheit, Klima, Vertrauen oder Demokratie entstehen. Genau diese Blindstelle schließt die Wirkungsökonomie.</p>
        </div>
        ${cardGrid(base, [
          {
            kicker: "Alltag",
            title: "Ein Apfel ist nicht nur ein Apfelpreis.",
            text: "Er enthält Wirkungen auf Boden, Wasser, Arbeit, Transport, Gesundheit, Handel und regionale Versorgung.",
            links: [["Apfelbeispiel öffnen", "wirkungsfelder/produkte-konsum/apfelbeispiel-produktwirkungsrechnung/"]],
          },
          {
            kicker: "System",
            title: "Wirkung ist eine Zustandsveränderung.",
            text: "Eine Absicht, Reichweite oder ein Output ist noch keine Wirkung. Wirkung entsteht, wenn sich reale Zustände verändern.",
            links: [["Begriff Wirkung", "begriffe/wirkung/"]],
          },
          {
            kicker: "Zielgröße",
            title: "Positive Netto-Wirkung.",
            text: "Entscheidend ist, ob Mensch, Planet und Demokratie insgesamt gestärkt werden, ohne schwere Schäden zu verdecken.",
            links: [["Positive Netto-Wirkung", "begriffe/positive-netto-wirkung/"]],
          },
          {
            kicker: "Rückkopplung",
            title: "Wirkung muss Entscheidungen verändern.",
            text: "Sichtbare Wirkung reicht nicht. Sie muss in Preise, Steuern, Kapital, Einkommen, Beschaffung und Regeln zurückfließen.",
            links: [["Wirkungssteuerung", "wirkungssteuerung/"]],
          },
        ])}
      </section>
`,
  });
}

function renderLearningPortal() {
  const base = "../";
  return shell({
    base,
    route: "lernen/",
    title: "Lernen mit der Wirkungsökonomie",
    description: "Lernwege, Akademie, Mein Wirkungsraum, Glossarlernen und Praxispfade der Wirkungsökonomie.",
    kicker: "Lernen",
    h1: "Wirkungskompetenz aufbauen.",
    subtitle:
      "Lernen heißt hier nicht nur Begriffe kennen. Lernen heißt, Wirkpfade zu erkennen, Daten zu prüfen, Zielkonflikte zu verstehen und bessere Rückkopplungen zu entwerfen.",
    actions: [
      ["Akademie öffnen", "akademie.html", "primary"],
      ["Mein Wirkungsraum", "mein-wirkungsraum/", "secondary"],
      ["Glossar lernen", "begriffe/", "secondary"],
    ],
    content: `
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Lernpfade</p>
          <h2>Vom Einstieg zur Anwendung.</h2>
          <p>Die Lernarchitektur verbindet Grundlagen, Glossar, Akademie, Werkzeuge und persönliche Merkliste. Ohne Pflicht-Login, aber mit lokalem Wirkungsraum.</p>
        </div>
        ${cardGrid(base, [
          {
            kicker: "Grundlagen",
            title: "Wirkung verstehen",
            text: "Kurze Einstiege, Begriffe und Beispiele klären den Maßstab.",
            links: [["Verstehen", "verstehen/"], ["WÖk auf einer Seite", "verstehen/woek-auf-einer-seite/"]],
          },
          {
            kicker: "Akademie",
            title: "Strukturiert lernen",
            text: "Akademie-Module bündeln Grundlagen, Methoden, Debattenkompetenz und Praxis.",
            links: [["Akademie", "akademie.html"]],
          },
          {
            kicker: "Persönlich",
            title: "Mein Wirkungsraum",
            text: "Merken, weiterlesen, Notizen, Lernliste und Sammlungen bleiben lokal in deinem Browser.",
            links: [["Mein Wirkungsraum", "mein-wirkungsraum/"]],
          },
          {
            kicker: "Praxis",
            title: "Werkzeuge ausprobieren",
            text: "Demos und Methoden zeigen, wie Wirkung sichtbar und entscheidungsrelevant wird.",
            links: [["Praxis & Tools", "werkzeuge/"], ["Öffentlicher Wirkungsraum", "oeffentlicher-wirkungsraum/"]],
          },
        ])}
      </section>
`,
  });
}

function renderWirkungssteuerungPortal() {
  const base = "../";
  const clusterSections = steuerungClusters
    .map((cluster, index) => {
      const cards = cluster.slugs.map((slug) => {
        const page = steuerungPageMap[slug];
        const detail = steuerungDetails[slug];
        return {
          kicker: `${detail?.type || "Baustein"} · ${cluster.title}`,
          title: page.title,
          text: page.text,
          links: [[`${page.title} öffnen`, `wirkungssteuerung/${slug}/`]],
        };
      });
      return `<section class="section ${index % 2 === 0 ? "section-soft" : ""}">
        <div class="section-header">
          <p class="hero-kicker">Cluster ${index + 1}</p>
          <h2>${esc(cluster.title)}</h2>
          <p>${esc(cluster.text)}</p>
        </div>
        ${cardGrid(base, cards)}
      </section>`;
    })
    .join("\n");
  return shell({
    base,
    route: "wirkungssteuerung/",
    title: "Wirkungssteuerung",
    description: "Wirkungssteuerung übersetzt Wirkung in Preise, Steuern, Kapital, Einkommen, Beschaffung, Produkte, Haushalte und Regeln.",
    kicker: "Wirkungssteuerung",
    h1: "Wirkung muss in Entscheidungen zurück.",
    subtitle:
      "Die zentrale Frage lautet nicht nur, ob Wirkung sichtbar wird. Die zentrale Frage lautet, ob sie Preise, Steuern, Kapital, Einkommen, Beschaffung, Produkte, Unternehmen und Staat verändert.",
    actions: [
      ["Wirkungshaushalt verstehen", "wirkungssteuerung/wirkungshaushalt/", "primary"],
      ["Scorecards öffnen", "wirkungssteuerung/scorecards/", "secondary"],
      ["Apfelbeispiel öffnen", "wirkungsfelder/produkte-konsum/apfelbeispiel-produktwirkungsrechnung/", "secondary"],
    ],
    content: `
      <section class="section">
        <div class="card">
          <p class="card-kicker">Alltag vor Bausteinliste</p>
          <h2 class="card-title">Wirkungssteuerung klingt abstrakt. Fünf Beispiele zeigen, was gemeint ist.</h2>
          <p class="card-text">Ein Stadtbaum kann Hitze, Gesundheit und Aufenthaltsqualität verändern. Ein T-Shirt trägt Wasser, Arbeit, Transport und Entsorgung mit. Eine Kita-Ausgabe kann spätere Bildungs-, Arbeitsmarkt- und Gesundheitskosten senken. Ein Produktpreis kann Schäden ausblenden. Eine Beschaffung kann bessere Lösungen überhaupt erst marktfähig machen.</p>
        </div>
      </section>
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">Kernlogik</p>
          <h2>19 Bausteine, sechs Steuerungsräume.</h2>
          <p>Wirkungssteuerung ist kein einzelnes Instrument. Sie verbindet Preise, Steuern, Einkommen, Haushalte, Kapital, Produkte, Beschaffung und Schutzprinzipien. Die sechs Cluster zeigen, wo eine Entscheidung ansetzt.</p>
        </div>
        ${contextSearch(base, "z. B. Wirkungssteuer, Produktpreis, Rente, Kapital, Beschaffung", "wirkungssteuerung")}
      </section>
      ${clusterSections}
      <section class="section">
        <div class="card">
          <p class="card-kicker">Beispiele</p>
          <h2 class="card-title">Alltagsnah prüfen, dann systemisch steuern.</h2>
          <p class="card-text">Apfel, T-Shirt, Haferdrink und Kuhmilch, BASF Polyamid, Wohnen, Pflegearbeit oder fossile Geschäftsmodelle werden nicht moralisch sortiert. Sie werden danach gelesen, welche Netto-Wirkung sie erzeugen und welche Anreize daraus folgen.</p>
          <div class="portal-card-actions">${linkList(base, [
            ["Apfelbeispiel", "wirkungsfelder/produkte-konsum/apfelbeispiel-produktwirkungsrechnung/"],
            ["Produkte & Konsum", "wirkungsfelder/produkte-konsum/"],
            ["Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/"],
          ])}</div>
        </div>
      </section>
`,
  });
}

function renderSteuerungDetail(slug, title, text) {
  const base = "../../";
  const detail = steuerungDetails[slug] || steuerungDetails.ueberblick;
  const moreLinks = detail.more?.length ? detail.more : [["Wirkungssteuerung", "wirkungssteuerung/"], ["Bibliothek", "bibliothek/"]];
  const subjectMeta = steuerungSubjects[slug] || { subject: title, plural: false };
  const subject = subjectMeta.subject;
  const subjectInSentence = subject.replace(/^Der /, "der ").replace(/^Die /, "die ").replace(/^Das /, "das ");
  const be = subjectMeta.plural ? "sind" : "ist";
  const rateVerb = subjectMeta.plural ? "bewerten" : "bewertet";
  const reachVerb = subjectMeta.plural ? "greifen" : "greift";
  const whyTitle = detail.whyTitle || `${subject}: warum dieser Baustein jetzt zählt.`;
  const howTitle = detail.howTitle || `So ${reachVerb} ${subjectInSentence} in Entscheidungen ein.`;
  const guardTitle = detail.guardTitle || `${subject} ${be} keine Personenbewertung.`;
  const guardText =
    detail.guard ||
    `${subject} ${rateVerb} nicht Menschen, sondern Wirkungen von Regeln, Produkten, Investitionen, Organisationen oder öffentlichen Entscheidungen. Schutzlinien, Rechtsweg und demokratische Zuständigkeit bleiben Voraussetzung.`;
  const nextTitle = detail.nextTitle || `${subject} weiter einordnen.`;
  const nextText =
    detail.next ||
    `Der nächste sinnvolle Schritt ist, ${subjectInSentence} mit verwandten Bausteinen, passenden Wirkungsfeldern und belastbaren Quellen zu verbinden. So bleibt der Baustein kein Schlagwort, sondern wird prüfbare Wirkungslogik.`;
  const logicTitle = detail.logicTitle || `${subject}: Auslöser → Wirkungspotenzial → Bewertung → Lenkung.`;
  const logicText =
    detail.logic ||
    `${subject} ${be} nur dann wirkungsökonomisch sinnvoll, wenn eine reale Zustandsveränderung sichtbar wird: Was löst eine Entscheidung aus, welche Wirkung kann entstehen, wie wird sie für Mensch, Planet und Demokratie bewertet und welche Rückkopplung folgt daraus?`;
  const plainBlock = detail.plain
    ? `<div class="card">
            <p class="card-kicker">Einfach erklärt</p>
            <h3 class="card-title">Woran man den Baustein im Alltag erkennt.</h3>
            <p class="card-text">${esc(detail.plain)}</p>
          </div>`
    : "";
  const caseSection = detail.case
    ? `<section class="section">
        <div class="card">
          <p class="card-kicker">Konkreter Prüfpunkt</p>
          <h2 class="card-title">${esc(detail.case.title)}</h2>
          <p class="card-text">${esc(detail.case.text)}</p>
        </div>
      </section>`
    : "";
  const questionsSection = detail.questions?.length
    ? `<section class="section">
        <div class="card">
          <p class="card-kicker">Berechtigte Kritik</p>
          <h2 class="card-title">Was kritisch gefragt werden darf.</h2>
          <ul class="check-list">
            ${detail.questions.map((item) => `<li>${esc(item)}</li>`).join("\n            ")}
          </ul>
        </div>
      </section>`
    : "";
  const mpdSection = detail.mpd
    ? `<section class="section">
        <div class="card">
          <p class="card-kicker">Mensch, Planet, Demokratie</p>
          <h2 class="card-title">Welche Bilanzgrenze geöffnet wird.</h2>
          <ul class="check-list">
            ${Object.entries(detail.mpd)
              .map(([label, value]) => `<li><strong>${esc(label)}:</strong> ${esc(value)}</li>`)
              .join("\n            ")}
          </ul>
        </div>
      </section>`
    : "";
  const sourcesSection = detail.sources?.length
    ? `<section class="section">
        <div class="card">
          <p class="card-kicker">Quellen & Anschluss</p>
          <h2 class="card-title">${esc(subject)} mit bestehenden Inhalten verbinden.</h2>
          <ul class="check-list">
            ${detail.sources
              .map(
                ([label, href, note]) =>
                  `<li><a class="text-link" href="${esc(relative(base, href))}">${esc(label)}</a> - ${esc(note)}</li>`
              )
              .join("\n            ")}
          </ul>
        </div>
      </section>`
    : "";
  return shell({
    base,
    route: `wirkungssteuerung/${slug}/`,
    title: `${title} | Wirkungssteuerung`,
    description: `${title} als Baustein der Wirkungssteuerung: ${text}`,
    kicker: "Wirkungssteuerung",
    h1: title,
    subtitle: text,
    actions: [
      ["Wirkungssteuerung", "wirkungssteuerung/", "primary"],
      ["Wirkungsfelder", "wirkungsfelder/", "secondary"],
      ["Bibliothek", "bibliothek/", "secondary"],
    ],
    content: `
      <section class="section section-soft">
        <div class="section-header">
          <p class="hero-kicker">${esc(detail.type)} · ${esc(detail.cluster)}</p>
          <h2>Was ist das?</h2>
          <p>${esc(detail.what)}</p>
        </div>
        ${plainBlock}
        <div class="card-grid two">
          <article class="card">
            <p class="card-kicker">Ausgangspunkt</p>
            <h3 class="card-title">${esc(whyTitle)}</h3>
            <p class="card-text">${esc(detail.why)}</p>
          </article>
          <article class="card">
            <p class="card-kicker">Wie funktioniert es?</p>
            <h3 class="card-title">${esc(howTitle)}</h3>
            <ul class="check-list">
              ${detail.how.map((item) => `<li>${esc(item)}</li>`).join("\n              ")}
            </ul>
          </article>
          <article class="card">
            <p class="card-kicker">Schutzlinie</p>
            <h3 class="card-title">${esc(guardTitle)}</h3>
            <p class="card-text">${esc(guardText)}</p>
          </article>
          <article class="card">
            <p class="card-kicker">Wo geht es weiter?</p>
            <h3 class="card-title">${esc(nextTitle)}</h3>
            <p class="card-text">${esc(nextText)}</p>
            <div class="portal-card-actions">${linkList(base, moreLinks)}</div>
          </article>
        </div>
      </section>
      ${caseSection}
      ${questionsSection}
      ${mpdSection}
      <section class="section">
        <div class="card">
          <p class="card-kicker">Wirkungsökonomische Logik</p>
          <h2 class="card-title">${esc(logicTitle)}</h2>
          <p class="card-text">${esc(logicText)}</p>
        </div>
      </section>
      <section class="section">
        <div class="card">
          <p class="card-kicker">Anwendung</p>
          <h2 class="card-title">Von ${esc(title)} zur konkreten Entscheidung.</h2>
          <p class="card-text">Prüfe den Baustein an einem realen Fall: Welche Daten fehlen, welche Wirkung wird verschoben, wer entscheidet demokratisch und welche Schutzlinie verhindert Scheingenauigkeit?</p>
          <div class="portal-card-actions">${linkList(base, [
            ["Glossar", "begriffe/"],
            ["Werkzeuge", "werkzeuge/"],
            ["Bibliothek", "bibliothek/"],
          ])}</div>
        </div>
      </section>
      ${sourcesSection}
`,
  });
}

function renderFuerWenAlias() {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex, follow">
    <meta http-equiv="refresh" content="0; url=/fuer/">
    <link rel="canonical" href="${SITE}/fuer/">
    <title>Weiterleitung - Für wen?</title>
    <script>window.location.replace("/fuer/");</script>
  </head>
  <body><main><h1>Weiterleitung zu Für wen?</h1><p><a href="/fuer/">Weiter zu Für wen?</a></p></main></body>
</html>
`;
}

function markerBlock(name, html) {
  return `<!-- ${name}:start -->\n${html.trim()}\n<!-- ${name}:end -->`;
}

function replaceMarkedBlock(relativePath, name, html, insertionNeedle) {
  const filePath = path.join(ROOT, relativePath);
  let text = fs.readFileSync(filePath, "utf8");
  const block = markerBlock(name, html);
  const pattern = new RegExp(`\\n?<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->\\n?`, "g");
  text = text.replace(pattern, "\n");
  if (!text.includes(insertionNeedle)) {
    console.warn(`needle not found in ${relativePath}: ${insertionNeedle}`);
    return;
  }
  text = text.replace(insertionNeedle, `${block}\n${insertionNeedle}`);
  fs.writeFileSync(filePath, text, "utf8");
  console.log(`updated ${relativePath}`);
}

function updateStartPage() {
  const block = `
<section class="section section-soft" id="wirkungslogik-2-1" aria-labelledby="wirkungslogik-2-1-title">
  <div class="section-header">
    <p class="hero-kicker">Grundlogik</p>
    <h2 id="wirkungslogik-2-1-title">Die Website folgt einer klaren Bewegungslogik.</h2>
    <p>Die Wirkungsökonomie ist nicht zuerst ein Debattentool. Sie ist ein Ordnungsmodell: Wirkung sichtbar machen, bewerten und in Preise, Steuern, Einkommen, Kapital, Produkte, Unternehmen, Staat und Alltag zurückführen.</p>
  </div>
  <div class="card-grid two">
    <article class="card"><p class="card-kicker">1 · Verstehen</p><h3 class="card-title">Was verändert sich wirklich?</h3><p class="card-text">Alltag zuerst: Apfel, T-Shirt, Pflege, Wohnen, Medien, Kapital oder Haushalt. Dann erst Begriffe und Methode.</p><div class="portal-card-actions"><a class="text-link" href="verstehen/">Verstehen öffnen</a></div></article>
    <article class="card"><p class="card-kicker">2 · Wirkungsfelder</p><h3 class="card-title">Wo wirkt es?</h3><p class="card-text">Neun Suchräume ordnen Mensch, Planet, Wirtschaft, Arbeit, Wohnen, Staat, Öffentlichkeit, Wissen und Kapital.</p><div class="portal-card-actions"><a class="text-link" href="wirkungsfelder/">Wirkungsfelder öffnen</a></div></article>
    <article class="card"><p class="card-kicker">3 · Wirkungssteuerung</p><h3 class="card-title">Wie wird Wirkung zurückgekoppelt?</h3><p class="card-text">Wirkungssteuer, Produktpreise, Scorecards, WÖk-IDs, Haushalt, Rente, Einkommen, Kapital und Beschaffung.</p><div class="portal-card-actions"><a class="text-link" href="wirkungssteuerung/">Wirkungssteuerung öffnen</a></div></article>
    <article class="card"><p class="card-kicker">4 · Anschluss finden</p><h3 class="card-title">Wer kann daran weiterarbeiten?</h3><p class="card-text">Wissenschaft, Politik, Verwaltung, Unternehmen, Kapital, Bildung, Medien, Zivilgesellschaft, Standards, Daten und Kritik.</p><div class="portal-card-actions"><a class="text-link" href="bibliothek/#anschluss-finden">Anschlussräume ansehen</a></div></article>
  </div>
</section>
`;
  replaceMarkedBlock("index.html", "architecture-v21-home", block, '<section class="section section-soft maiwald-explainer" data-maiwald-explainer>');
}

function updateBibliothek() {
  const base = "../";
  const block = `
<section class="section section-soft" id="anschluss-finden" aria-labelledby="anschluss-finden-title">
  <div class="section-header">
    <p class="hero-kicker">Anschluss finden</p>
    <h2 id="anschluss-finden-title">Die Bibliothek ist nicht Ablage, sondern Anschlussarchitektur.</h2>
    <p>Jeder Inhalt soll künftig nach Thema, Zielgruppe, Dokumenttyp und Anschlussraum auffindbar sein. Der erste Schritt ist diese Orientierung über die wichtigsten Anschlussräume.</p>
  </div>
  ${contextSearch(base, "z. B. Wissenschaft, Verwaltung, Kapital, Pilotierung, Schutzlinien", "bibliothek")}
  <div class="document-chip-row">
    ${anschlussraeume.map((raum) => `<a class="chip" href="../suche.html?q=${encodeURIComponent(raum)}">${esc(raum)}</a>`).join("\n    ")}
  </div>
</section>
`;
  replaceMarkedBlock("bibliothek/index.html", "architecture-v21-library-anschluss", block, '<section class="section section-muted">');
}

function updateArchitectureRegistry() {
  writeJson("assets/data/website-architecture-v21.json", {
    version: "2.1",
    guidingPrinciple: "Wirkung statt Kapital: Wirkung auf Mensch, Planet und Demokratie sichtbar machen, bewerten und in Entscheidungen zurückkoppeln.",
    navigation: {
      main: header.map((item) => item.label),
      utilities: utilities.map((item) => item.label),
    },
    wirkungsfelder: wirkungsfelder.map((field) => ({ title: field.title, description: field.text })),
    wirkungssteuerung: steuerungPages.map(([slug, title, description]) => ({ slug, title, description })),
    anschlussraeume,
    editorialRules: [
      "Kein Inhalt wird gelöscht; alte URLs bleiben erreichbar oder werden über Alias/Redirect angeschlossen.",
      "Alltag vor Fachbegriff, Beispiel vor System, Orientierung vor Tiefe.",
      "Öffentlicher Wirkungsraum ist ein wichtiger Praxisbereich, aber nicht das Dach der gesamten Website.",
      "Bibliothek, Suche und Portale müssen Anschlussfähigkeit sichtbar machen.",
    ],
  });
}

function buildPages() {
  writeFile("verstehen/index.html", renderVerstehenPortal());
  writeFile("fuer-wen/index.html", renderFuerWenAlias());
  writeFile("lernen/index.html", renderLearningPortal());
  writeFile("wirkungsfelder/index.html", renderWirkungsfelderPage());
  writeFile("wirkungssteuerung/index.html", renderWirkungssteuerungPortal());
  for (const [slug, title, text] of steuerungPages) {
    writeFile(`wirkungssteuerung/${slug}/index.html`, renderSteuerungDetail(slug, title, text));
  }
}

updateNavigation();
updateArchitectureRegistry();
buildPages();
updateStartPage();
updateBibliothek();
