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

function writeFilePreservingEditorialPage(relativePath, content) {
  const filePath = path.join(ROOT, relativePath);
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf8");
    const isWirkungssteuerungEditorial =
      existing.includes('meta name="search_section" content="Wirkungssteuerung"') &&
      existing.includes('class="article-body"');

    if (isWirkungssteuerungEditorial) {
      console.log(`preserved ${relPath(filePath)}`);
      return;
    }
  }

  writeFile(relativePath, content);
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

Object.assign(steuerungDetails, {
  ueberblick: {
    ...steuerungDetails.ueberblick,
    plain:
      "Stell dir ein Armaturenbrett vor. Ein normales Armaturenbrett zeigt Geschwindigkeit, Tank und Temperatur. Die Wirkungssteuerung fragt zusätzlich: Was passiert mit Menschen, Natur, Infrastruktur und Vertrauen, wenn wir so weiterfahren? Der Überblick sortiert diese Anzeigen, damit aus Wissen auch bessere Entscheidungen werden.",
    case: {
      title: "Aus einem Bericht wird erst Wirkung, wenn er Entscheidungen verändert.",
      text:
        "Ein Unternehmen kann Nachhaltigkeitsdaten sammeln, eine Kommune kann Zielwerte veröffentlichen, ein Ministerium kann Förderprogramme evaluieren. Solange daraus keine veränderte Beschaffung, kein anderer Haushalt, kein besserer Preis und keine überprüfbare Verantwortung folgt, bleibt Wirkung dekorativ. Wirkungssteuerung beginnt dort, wo Daten zurück in Regeln, Preise und Prioritäten gehen.",
    },
    questions: [
      "Welche Entscheidung soll durch die Wirkungsinformation besser werden?",
      "Welche Wirkung wird nur berichtet und welche wirklich zurückgekoppelt?",
      "Welche Schutzlinie verhindert Personenbewertung, Scheingenauigkeit oder politische Willkür?",
      "Wer kann die Daten, Annahmen und Gewichtungen prüfen oder widersprechen?",
    ],
    mpd: {
      Mensch: "Lebensqualität, Gesundheit, Bildung, Teilhabe und Arbeit werden als reale Zustände betrachtet, nicht nur als Kennzahlen.",
      Planet: "Klima, Wasser, Biodiversität, Ressourcen und Reparaturfähigkeit werden Teil der Entscheidungslogik.",
      Demokratie: "Wirkung braucht Transparenz, Zuständigkeit, Rechtsweg und öffentliche Kritikfähigkeit.",
    },
    sources: [
      ["Begriff: Wirkung", "begriffe/wirkung/", "Grundunterscheidung von Absicht, Output und Zustandsveränderung"],
      ["Positive Netto-Wirkung", "begriffe/positive-netto-wirkung/", "Maßstab für bessere Wirkung über Zielkonflikte hinweg"],
      ["Scorecards", "wirkungssteuerung/scorecards/", "praktische Übersetzung in prüfbare Kriterien"],
      ["Bibliothek", "bibliothek/", "vertiefende Dokumente und Veröffentlichungen"],
    ],
  },
  produktpreise: {
    ...steuerungDetails.produktpreise,
    what:
      "Produktpreise fragt, was ein Preis zeigen müsste, wenn Schäden, Nutzen, Lieferketten, Nutzung und Entsorgung nicht ausgeblendet werden. Ein Preis bleibt ein Marktzeichen, aber er soll weniger blind sein.",
    why:
      "Ein Produkt kann an der Kasse günstig wirken und trotzdem teuer sein: durch schlechte Haltbarkeit, Schadstoffe, Reparaturunfähigkeit, Entsorgung, Gesundheitsfolgen oder Rohstoffrisiken. Dann zahlt jemand anderes später einen Teil der Rechnung.",
    plain:
      "Ein billiger Wasserkocher kostet vielleicht 12 Euro. Wenn er nach zwei Jahren kaputt ist und nicht repariert werden kann, war er im Alltag nicht unbedingt billig. Ein haltbarer Wasserkocher für 35 Euro kann über die Nutzungszeit günstiger und wirksamer sein. Produktpreise sollen solche verdeckten Rechnungen nicht perfekt, aber besser sichtbar machen.",
    case: {
      title: "Der Kassenpreis ist nur der Anfang der Rechnung.",
      text:
        "Bei Lebensmitteln, Kleidung, Elektronik oder Baustoffen entstehen Wirkungen vor dem Kauf, während der Nutzung und nach der Entsorgung. Produktpreise werden professionell, wenn sie diese Stationen nicht behaupten, sondern über Daten, Produktpass, Scorecard und Schutzlinien nachvollziehbar machen.",
    },
    questions: [
      "Welche Folgekosten liegen außerhalb des heutigen Preises?",
      "Wie lange hält das Produkt und kann es repariert oder wiederverwendet werden?",
      "Welche Daten stammen aus Lieferkette, Nutzung und Entsorgung?",
      "Wird der Preis sozial abgefedert, damit bessere Wirkung nicht nur Luxus wird?",
    ],
    mpd: {
      Mensch: "Leistbarkeit, Gesundheit, Arbeitsbedingungen und Alltagstauglichkeit gehören in die Preisfrage.",
      Planet: "Rohstoffe, Energie, Emissionen, Reparatur und Abfall werden entlang des Lebenswegs betrachtet.",
      Demokratie: "Preissignale müssen begründet, prüfbar und politisch kontrollierbar bleiben.",
    },
    sources: [
      ["Scorecards", "wirkungssteuerung/scorecards/", "Kriterien und Datenqualität für Produktbewertungen"],
      ["Digitaler Produktpass", "wirkungssteuerung/digitaler-produktpass/", "Produktdaten entlang des Lebenswegs"],
      ["Produkte & Konsum", "wirkungsfelder/produkte-konsum/", "Wirkungsfeld für Produkt- und Konsumentscheidungen"],
      ["Apfelbeispiel", "wirkungsfelder/produkte-konsum/apfelbeispiel-produktwirkungsrechnung/", "alltagsnahes Beispiel für Produktwirkung"],
    ],
  },
  wustg: {
    ...steuerungDetails.wustg,
    plain:
      "Heute kann dieselbe Umsatzsteuer auf Produkte liegen, die sehr unterschiedliche Folgekosten verursachen. Das WUStG fragt: Was wäre, wenn die Steuer nicht nur den Verkaufsvorgang sieht, sondern auch die belegte Produktwirkung? Nicht als Automat, sondern als demokratisch geregeltes Pilotmodell.",
    case: {
      title: "Gleicher Steuersatz kann ungleiche Wirklichkeit verstecken.",
      text:
        "Ein reparierbares, langlebiges Produkt und ein schnell kaputtes Wegwerfprodukt können steuerlich gleich behandelt werden. Das WUStG prüft, ob Wirkungsklassen, Datenqualität und Schutzlinien eine bessere Differenzierung erlauben, ohne Menschen zu bewerten oder heimliche Straflogik einzuführen.",
    },
    questions: [
      "Welche Produktgruppen eignen sich überhaupt für eine Pilotierung?",
      "Welche Datenqualität ist nötig, bevor ein Steuersignal verändert wird?",
      "Wie werden soziale Härten und Übergangsfristen geregelt?",
      "Wer kontrolliert Wirkungsklassen, Rechtsweg und demokratische Zuständigkeit?",
    ],
    mpd: {
      Mensch: "Alltagsprodukte müssen bezahlbar bleiben; Wirkungssignale dürfen soziale Belastung nicht verschärfen.",
      Planet: "Ressourcen, Reparaturfähigkeit, Emissionen und Entsorgung werden steuerlich sichtbar.",
      Demokratie: "Das WUStG braucht Gesetzesform, Transparenz, Rechtsweg und parlamentarische Kontrolle.",
    },
    sources: [
      ["Technische Leitlinien WUStG", "bibliothek/technische-leitlinien-wustg/", "Leitlinien für Daten, Wirkungsklassen und Schutzregeln"],
      ["WÖk-Leitlinien WUStG", "werkstatt/leitlinien/wustg/", "Werkstattfassung der rechtlichen und methodischen Logik"],
      ["Referenzkapitel WUStG", "referenz/kapitel-038-das-wustg-und-die-produktwirkungssteuer/", "Grundlagenkapitel zur Produktwirkungssteuer"],
      ["Produktpreise", "wirkungssteuerung/produktpreise/", "Preissignal und ausgelagerte Folgekosten"],
    ],
  },
  wstg: {
    ...steuerungDetails.wstg,
    plain:
      "Ein Steuergesetz ist wie eine Spielregel für das gemeinsame Wirtschaften. Das WStG fragt nicht: Wer ist gut oder schlecht? Es fragt: Welche Regeln sorgen dafür, dass schädliche Wirkung nicht billiger bleibt als bessere Wirkung?",
    case: {
      title: "Wirkung braucht eine Regel, bevor sie steuern darf.",
      text:
        "Wenn Wirkung in Steuern einfließt, darf sie nicht aus Bauchgefühl, Marketing oder politischer Stimmung entstehen. Das WStG ist deshalb vor allem ein Schutzrahmen: Zuständigkeit, Datenqualität, Rechtsweg, Pilotierung, Widerspruch und demokratische Kontrolle müssen vor jeder Lenkung stehen.",
    },
    questions: [
      "Welche Wirkung darf überhaupt steuerlich relevant werden?",
      "Welche Institution prüft Daten und Methode, ohne Politik zu ersetzen?",
      "Wie wird verhindert, dass aus Wirkungssteuerung Personenbewertung wird?",
      "Welche Teile sind Gesetz, welche Verordnung, welche Pilotierung und welche Forschung?",
    ],
    mpd: {
      Mensch: "Steuerung darf nicht Menschen sortieren, sondern Wirkungen von Produkten, Regeln und Organisationen prüfen.",
      Planet: "Umweltfolgen werden rechtlich anschlussfähig, ohne fachliche Unsicherheit zu verschweigen.",
      Demokratie: "Das Gesetz muss Macht begrenzen: Öffentlichkeit, Parlament, Gerichte und Widerspruch bleiben zentral.",
    },
    sources: [
      ["WStG Oktober 2025", "bibliothek/wstg-oktober-2025/", "Gesetzesentwurf und Schutzlinien"],
      ["Wirkungsrat", "wirkungssteuerung/wirkungsrat/", "Prüfinstanz für Datenqualität und Zielkonflikte"],
      ["Wirkungshaushalt", "wirkungssteuerung/wirkungshaushalt/", "öffentliche Mittel und demokratische Priorisierung"],
      ["Staat, Recht & Demokratie", "wirkungsfelder/staat-recht-demokratie/", "politische und rechtliche Anschlussfähigkeit"],
    ],
  },
  westg: {
    ...steuerungDetails.westg,
    plain:
      "Viele Menschen leisten etwas, das nicht sauber auf dem Lohnzettel steht: Pflege in der Familie, Nachbarschaftshilfe, Bildungsarbeit, Prävention, Integration oder das Stabilisieren eines Quartiers. Das WEStG fragt, wie solche Beiträge sichtbar werden können, ohne daraus eine moralische Punktetabelle zu machen.",
    case: {
      title: "Nicht jede gesellschaftliche Leistung erscheint als Erwerbseinkommen.",
      text:
        "Wenn Pflege, Sorgearbeit oder Prävention nicht bezahlt oder nur schlecht bezahlt werden, sieht das heutige System oft weniger Leistung, als tatsächlich entsteht. Das WEStG denkt Einkommen, Automatisierungsgewinne und gesellschaftliche Stabilisierung zusammen, bleibt aber ein Prüfmodell mit hohen Schutzanforderungen.",
    },
    questions: [
      "Welche Beiträge sind messbar genug und welche dürfen nicht bürokratisiert werden?",
      "Wie wird verhindert, dass Care-Arbeit romantisiert statt fair abgesichert wird?",
      "Welche Finanzierung trägt das Modell und welche Zielkonflikte entstehen?",
      "Wie bleiben Würde, Freiwilligkeit, Datenschutz und Rechtsanspruch geschützt?",
    ],
    mpd: {
      Mensch: "Sorgearbeit, Prävention, Bildung und Integration werden als Lebensgrundlagen sichtbar.",
      Planet: "Indirekt relevant, wenn nachhaltige Tätigkeiten, Reparatur, lokale Kreisläufe und Vorsorge gestärkt werden.",
      Demokratie: "Anerkennung gesellschaftlicher Beiträge darf nicht zu Überwachung, Zwang oder Klientelpolitik werden.",
    },
    sources: [
      ["Wirkungseinkommensteuergesetz WEStG", "bibliothek/wirkungseinkommensteuergesetz-westg/", "Dossier und Gesetzeslogik"],
      ["Wirkungseinkommen", "wirkungssteuerung/wirkungseinkommen/", "konzeptionelle Grundlage"],
      ["Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/", "Wirkungsfeld für Arbeit, Care und Automatisierung"],
      ["Referenzkapitel Wirkungseinkommen", "referenz/kapitel-057-wirkungseinkommen/", "Grundlagen der Einkommenslogik"],
    ],
  },
  wirkungseinkommen: {
    ...steuerungDetails.wirkungseinkommen,
    plain:
      "Wenn jemand ein krankes Elternteil pflegt, Jugendliche begleitet oder ein Quartier stabil hält, entsteht Wirkung. Oft erscheint sie aber nicht als normales Einkommen. Wirkungseinkommen fragt: Wie kann eine Gesellschaft solche Beiträge anerkennen, ohne Menschen in gute und schlechte Bürger:innen einzuteilen?",
    case: {
      title: "Wirkungseinkommen ist kein Applaus, sondern eine Finanzierungsfrage.",
      text:
        "Anerkennung reicht nicht, wenn Menschen durch Care, Prävention oder Gemeinwesenarbeit Zeit, Einkommen und Sicherheit verlieren. Wirkungseinkommen prüft, welche Beiträge gesellschaftlich nötig sind, wie sie finanziert werden könnten und welche Schutzlinien gegen Missbrauch nötig sind.",
    },
    questions: [
      "Welche Tätigkeiten stabilisieren nachweislich Lebensbedingungen?",
      "Wo endet Anerkennung und wo beginnt problematische Bewertung von Menschen?",
      "Wie wird Finanzierung dauerhaft, fair und unbürokratisch organisiert?",
      "Welche Rolle spielen Automatisierungsgewinne, Steuern und öffentliche Haushalte?",
    ],
    mpd: {
      Mensch: "Care, Bildung, Gesundheit, Integration und lokale Stabilisierung werden nicht als unsichtbare Privatleistung behandelt.",
      Planet: "Wirkungseinkommen kann Tätigkeiten stärken, die Reparatur, Vorsorge, lokale Resilienz und Ressourcenbewusstsein fördern.",
      Demokratie: "Die Debatte wird gerechter, wenn systemrelevante Arbeit nicht nur nach Marktpreis sichtbar wird.",
    },
    sources: [
      ["Für wen: Wirkungseinkommen", "fuer/wirkungseinkommen.html", "zielgruppennaher Einstieg"],
      ["Referenzkapitel Wirkungseinkommen", "referenz/kapitel-057-wirkungseinkommen/", "Begriffs- und Systemgrundlage"],
      ["Wirkungseinkommen-Dossier", "bibliothek/wirkungseinkommensteuergesetz-westg/", "Anschluss an Gesetzesmodell und Finanzierung"],
      ["Arbeit & Einkommen", "wirkungsfelder/arbeit-einkommen/", "Wirkungsfeld für Arbeit und Automatisierung"],
    ],
  },
  wirkungsrente: {
    ...steuerungDetails.wirkungsrente,
    plain:
      "Viele Rentenbiografien erzählen nur, wie viel Erwerbslohn eingezahlt wurde. Sie erzählen weniger darüber, wer Kinder erzogen, Angehörige gepflegt, Vereine getragen, Nachbarschaften stabilisiert oder Prävention geleistet hat. Die Wirkungsrente fragt, wie solche Lebensleistung fairer sichtbar werden kann.",
    case: {
      title: "Lebensleistung passt nicht immer in Beitragsjahre.",
      text:
        "Eine Person kann jahrzehntelang arbeiten und zusätzlich pflegen. Eine andere kann wegen Sorgearbeit weniger Erwerbsjahre sammeln, aber viel gesellschaftliche Stabilität erzeugen. Die Wirkungsrente prüft, wie Rentenlogik ergänzt werden könnte, ohne Ansprüche willkürlich zu verteilen.",
    },
    questions: [
      "Welche Beiträge lassen sich rechtssicher und fair anerkennen?",
      "Wie wird verhindert, dass unbezahlte Arbeit weiter selbstverständlich ausgelagert wird?",
      "Welche Finanzierung ist tragfähig und generationengerecht?",
      "Wie bleiben bestehende Rentenansprüche, Rechtsweg und Gleichbehandlung geschützt?",
    ],
    mpd: {
      Mensch: "Sorgearbeit, Lebensleistung und Altersabsicherung werden zusammen betrachtet.",
      Planet: "Indirekt relevant, wenn Prävention, lokale Resilienz und Reparaturarbeit gesellschaftlich aufgewertet werden.",
      Demokratie: "Die Anerkennung von Lebensleistung muss transparent, rechtsstaatlich und nicht klientelistisch sein.",
    },
    sources: [
      ["Referenzkapitel Wirkungsrente", "referenz/kapitel-058-wirkungsrente/", "Grundlagen und Abgrenzung"],
      ["Finanzsystem & Kapital", "wirkungsfelder/finanzsystem-kapital/", "Kapitalteilhabe und Alterssicherung"],
      ["Wirkungseinkommen", "wirkungssteuerung/wirkungseinkommen/", "verwandte Einkommenslogik"],
      ["Für Bürger:innen", "fuer/buergerinnen.html", "alltagsnaher Zugang"],
    ],
  },
  "woek-ids": {
    ...steuerungDetails["woek-ids"],
    plain:
      "Eine Bibliothek braucht Signaturen, sonst findet niemand etwas wieder. WÖk-IDs sind solche Signaturen für Wirkungsbegriffe, Indikatoren, Dokumente und Bausteine. Sie sagen nicht, ob etwas gut ist. Sie sorgen dafür, dass klar bleibt, worüber gesprochen wird.",
    case: {
      title: "Ohne stabile IDs entstehen Dubletten, Missverständnisse und Scheinvergleiche.",
      text:
        "Wenn ein Bericht von Wirkung spricht, ein Tool von Impact, ein Glossar von Netto-Wirkung und eine Scorecard von Wirkungsklasse, muss erkennbar bleiben, ob dasselbe gemeint ist. WÖk-IDs schaffen Verknüpfung, damit Daten, Quellen und Begriffe nicht auseinanderlaufen.",
    },
    questions: [
      "Welche Begriffe, Dokumente oder Indikatoren brauchen eine stabile ID?",
      "Wie werden Änderungen versioniert, ohne alte Quellen zu brechen?",
      "Wie wird verhindert, dass IDs wie Bewertungen oder Ranglisten wirken?",
      "Welche Verbindung besteht zu Glossar, Bibliothek, Scorecards und Produktdaten?",
    ],
    mpd: {
      Mensch: "Menschen werden nicht identifiziert oder bewertet; identifiziert werden Begriffe, Dokumente, Wirkpfade und Datenobjekte.",
      Planet: "Umwelt- und Produktdaten werden zuverlässiger verknüpfbar.",
      Demokratie: "Transparenz steigt, weil Quellen, Begriffe und Versionen prüfbar bleiben.",
    },
    sources: [
      ["WÖk-ID Register", "woek-id-register/", "öffentliche Registerstruktur"],
      ["Arbeitsbibliothek WÖk-IDs", "werkstatt/arbeitsbibliothek/instrumente/woek-ids/", "Instrumenten- und Architekturkontext"],
      ["Begriff: WÖk-ID", "begriffe/woek-id/", "Definition und Abgrenzung"],
      ["Scorecards", "wirkungssteuerung/scorecards/", "praktische Nutzung in Bewertungslogik"],
    ],
  },
  "csrd-esrs-gri": {
    ...steuerungDetails["csrd-esrs-gri"],
    plain:
      "Reporting ist wie ein Kassenbon der Wirkung: Es zeigt, was berichtet wurde. Aber ein Kassenbon kocht kein Essen und repariert kein Produkt. CSRD, ESRS und GRI sind wichtig, wenn ihre Daten später Entscheidungen verändern: Einkauf, Finanzierung, Produktentwicklung, Risiko und Strategie.",
    case: {
      title: "Berichtspflicht ist noch keine Wirkungssteuerung.",
      text:
        "Ein Unternehmen kann formal sauber berichten und trotzdem kaum etwas an Produkten, Lieferketten oder Investitionen ändern. Wirkungsökonomie liest CSRD, ESRS und GRI als Anschlussstelle: Welche Daten werden entscheidungsfähig, welche bleiben Berichtsroutine?",
    },
    questions: [
      "Welche berichteten Daten verändern tatsächlich Investitionen, Produkte oder Beschaffung?",
      "Welche Wesentlichkeit wird gesetzt und welche Wirkung bleibt außerhalb der Berichtspflicht?",
      "Wie gut sind Datenqualität, Vergleichbarkeit und Prüfspur?",
      "Wo ersetzt Reporting echte Steuerung nur scheinbar?",
    ],
    mpd: {
      Mensch: "Arbeitsbedingungen, Gesundheit, Teilhabe und Lieferkettenrisiken müssen aus Berichten in Entscheidungen kommen.",
      Planet: "Klima-, Ressourcen- und Biodiversitätsdaten werden nur relevant, wenn sie Investitionen und Geschäftsmodelle verändern.",
      Demokratie: "Berichtspflichten schaffen Transparenz, brauchen aber verständliche, prüfbare und nicht nur formale Offenlegung.",
    },
    sources: [
      ["Impact Controlling", "werkzeuge/impact-controlling/", "Übergang von Reporting zu Steuerung"],
      ["Datenqualität", "begriffe/datenqualitaet/", "Prüflogik für belastbare Wirkungsdaten"],
      ["Konzernbeispiel CSRD Produktscorecard", "assets/downloads/20_woek_produkte_konsum_konzernbeispiel_csrd_produktscorecard_detailkonzept_v1_0.pdf", "Beispiel für Anschluss an Produkt- und Scorecardlogik"],
      ["Kapital, Banken und ESG", "wirkungssteuerung/kapital-banken-esg/", "Finanz- und ESG-Kontext"],
    ],
  },
  "digitaler-produktpass": {
    ...steuerungDetails["digitaler-produktpass"],
    plain:
      "Ein Produktpass ist wie ein besseres Etikett, das nicht beim Werbespruch endet. Er kann zeigen, woraus ein Produkt besteht, woher Materialien kommen, wie es repariert wird, welche Teile austauschbar sind und was am Ende mit ihm passiert.",
    case: {
      title: "Ohne Produktdaten bleibt Reparatur oft Glückssache.",
      text:
        "Wer ein Gerät reparieren, ein Bauteil wiederverwenden oder ein Material recyceln will, braucht Informationen. Der digitale Produktpass kann diese Informationen zugänglich machen. Wirkungsökonomisch zählt aber, ob daraus tatsächlich bessere Reparatur, Kreisläufe und Kaufentscheidungen entstehen.",
    },
    questions: [
      "Welche Produktdaten sind für Nutzung, Reparatur und Recycling wirklich nötig?",
      "Wie werden Geschäftsgeheimnisse und öffentliches Interesse austariert?",
      "Wie wird Datenqualität geprüft und aktualisiert?",
      "Wer profitiert: Verbraucher:innen, Reparaturbetriebe, Recycling, Behörden oder nur Plattformen?",
    ],
    mpd: {
      Mensch: "Verbraucher:innen, Reparaturbetriebe und Beschäftigte bekommen bessere Information und weniger Abhängigkeit.",
      Planet: "Materialien, Reparatur, Wiederverwendung und Recycling werden über den Lebensweg sichtbar.",
      Demokratie: "Datenzugang und Standards müssen fair geregelt sein, damit Produktwissen nicht nur bei Herstellern bleibt.",
    },
    sources: [
      ["Lieferketten", "wirkungssteuerung/lieferketten/", "Lebensweg und Materiallogik"],
      ["Scorecards", "wirkungssteuerung/scorecards/", "Bewertung mit Produktdaten"],
      ["Produktpreise", "wirkungssteuerung/produktpreise/", "Rückkopplung in Preissignale"],
      ["Produkte & Konsum", "wirkungsfelder/produkte-konsum/", "Wirkungsfeld für Produkte und Nutzung"],
    ],
  },
  "kapital-banken-esg": {
    ...steuerungDetails["kapital-banken-esg"],
    plain:
      "Kapital ist wie Wasser in einem Bewässerungssystem. Es lässt wachsen, was Zugang bekommt. Wenn Geld nur dorthin fließt, wo kurzfristig Rendite winkt, können Schäden mitwachsen. Wenn Kapital Wirkung mitprüft, kann es Infrastruktur, Innovation und Resilienz stärken.",
    case: {
      title: "ESG ist ein Etikett. Wirkung ist die Rückfrage.",
      text:
        "Ein Fonds kann ESG-Kriterien erfüllen und trotzdem unklar lassen, welche reale Zustandsveränderung entsteht. Die Wirkungsökonomie fragt: Welche Investition senkt Risiken, stärkt Versorgung, vermeidet Schäden oder baut Zukunftsfähigkeit auf?",
    },
    questions: [
      "Welche Wirkung entsteht durch das Kapital, nicht nur durch das Reporting?",
      "Welche Risiken werden ausgelagert: Klima, Lieferkette, Demokratie, Gesundheit oder soziale Stabilität?",
      "Wie wird Greenwashing, Impact Washing oder reine Etikettierung vermieden?",
      "Welche Daten sind für Banken, Versicherungen, Investor:innen und Öffentlichkeit prüfbar?",
    ],
    mpd: {
      Mensch: "Kapitalentscheidungen wirken auf Arbeit, Wohnen, Gesundheit, Preise und Teilhabe.",
      Planet: "Investitionen können Transformation ermöglichen oder fossile und ressourcenintensive Pfade verlängern.",
      Demokratie: "Finanzmacht braucht Transparenz, Regeln und Verantwortung, damit Kapital Werkzeug bleibt und nicht Kompass wird.",
    },
    sources: [
      ["Finanzsystem & Kapital", "wirkungsfelder/finanzsystem-kapital/", "Wirkungsfeld für Kapitalflüsse"],
      ["T-SROI", "werkzeuge/t-sroi/", "Transformationsrendite als Bewertungslogik"],
      ["Risikomanagement", "wirkungssteuerung/risikomanagement/", "Risiko- und Resilienzbezug"],
      ["Risikomanagement Detailkonzept", "assets/downloads/08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0.pdf", "Vertiefung zu Finanz- und Risikologik"],
    ],
  },
  risikomanagement: {
    ...steuerungDetails.risikomanagement,
    plain:
      "Risiko ist nicht nur die Frage, ob ein Projekt teurer wird. Risiko ist auch: Wer wird krank? Welche Lieferkette bricht? Welche Region verliert Wasser? Welche Regel ändert sich? Welches Vertrauen geht verloren? Wirkungsrisiken sind oft die Kosten, die erst später auf der Rechnung stehen.",
    case: {
      title: "Ausgelagerte Schäden kommen als Risiko zurück.",
      text:
        "Ein Unternehmen kann heute Kosten sparen, wenn es Lieferketten, Energie, Wasser oder Arbeitsbedingungen eng kalkuliert. Später kann daraus ein Lieferstopp, ein Reputationsschaden, ein Versicherungsproblem oder ein Rechtsrisiko werden. Risikomanagement macht diese Rückkopplung früher sichtbar.",
    },
    questions: [
      "Welche Schäden werden heute nicht bilanziert, können aber später zurückkehren?",
      "Welche Annahmen gelten nur bei stabilem Klima, stabilen Lieferketten oder stabilem Vertrauen?",
      "Welche Risiken sind versicherbar, welche nicht?",
      "Wie werden Menschenrechte, Umwelt, Lieferketten und Demokratie als echte Risikofelder behandelt?",
    ],
    mpd: {
      Mensch: "Arbeits-, Gesundheits- und Versorgungsschäden werden als reale Risiken gelesen.",
      Planet: "Klima, Wasser, Biodiversität und Ressourcen sind keine externen Randbedingungen, sondern Risikotreiber.",
      Demokratie: "Vertrauen, Rechtsstaatlichkeit und soziale Stabilität werden als Standort- und Systemrisiken sichtbar.",
    },
    sources: [
      ["Risikomanagement Detailkonzept", "assets/downloads/08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0.pdf", "Vertiefung zu Wirkungsrisiko und Resilienz"],
      ["Kapital, Banken und ESG", "wirkungssteuerung/kapital-banken-esg/", "Finanz- und ESG-Anschluss"],
      ["Lieferketten", "wirkungssteuerung/lieferketten/", "Risiken entlang von Rohstoffen, Arbeit und Transport"],
      ["Datenqualität", "begriffe/datenqualitaet/", "Datenbasis für Risikobewertung"],
    ],
  },
  lieferketten: {
    ...steuerungDetails.lieferketten,
    plain:
      "Ein Produkt steht im Regal, aber seine Wirkung beginnt viel früher: Rohstoff, Arbeit, Energie, Transport, Verpackung, Nutzung und Entsorgung. Lieferketten sind die unsichtbaren Wege, auf denen diese Wirkung entsteht.",
    case: {
      title: "Der Ladenpreis endet nicht an der Ladentür.",
      text:
        "Ein günstiges Produkt kann auf billiger Energie, schlechten Arbeitsbedingungen, unsicheren Rohstoffen oder langer Transportabhängigkeit beruhen. Lieferkettensteuerung fragt nicht nur, wo etwas herkommt, sondern welche Zustände auf dem Weg erzeugt oder stabilisiert werden.",
    },
    questions: [
      "Welche Stufen der Lieferkette sind bekannt und welche bleiben blind?",
      "Wo entstehen Arbeits-, Umwelt-, Rohstoff- oder Abhängigkeitsrisiken?",
      "Welche Daten werden geprüft und welche nur von Lieferanten übernommen?",
      "Welche Alternative wäre resilienter, reparierbarer oder fairer?",
    ],
    mpd: {
      Mensch: "Arbeitsbedingungen, Gesundheit, Löhne und Sicherheit entlang der Kette werden sichtbar.",
      Planet: "Rohstoffe, Energie, Wasser, Emissionen, Transport und Entsorgung gehören zur Bilanz.",
      Demokratie: "Lieferketten berühren Macht, Transparenz, Rechte, Abhängigkeiten und öffentliche Beschaffung.",
    },
    sources: [
      ["Lieferketten Detailkonzept", "assets/downloads/19_woek_produkte_konsum_lieferketten_importlogik_wirkungsvorsteuer_detailkonzept_v1_0.pdf", "Vertiefung zu Importlogik und Wirkungsvorsteuer"],
      ["Digitaler Produktpass", "wirkungssteuerung/digitaler-produktpass/", "Daten entlang des Produktlebenswegs"],
      ["Beschaffung & Förderung", "wirkungssteuerung/beschaffung-foerderung/", "Hebel öffentlicher Nachfrage"],
      ["Wirtschaft & Unternehmen", "wirkungsfelder/wirtschaft-unternehmen/", "unternehmerische Verantwortung und Steuerung"],
    ],
  },
  "beschaffung-foerderung": {
    ...steuerungDetails["beschaffung-foerderung"],
    plain:
      "Wenn eine Stadt Busse kauft, Schulen saniert oder Essen für Kantinen ausschreibt, prägt sie Märkte. Beschaffung ist deshalb nicht nur Einkauf. Sie entscheidet, welche Produkte, Anbieter und Wirkungen eine Chance bekommen.",
    case: {
      title: "Öffentliches Geld ist ein Marktsignal.",
      text:
        "Wenn der billigste Anbieter immer gewinnt, werden Haltbarkeit, Reparatur, Arbeitsbedingungen, Klima, regionale Resilienz und Folgekosten oft zu spät gesehen. Gute Beschaffung macht Wirkung vorher prüfbar und setzt klare, rechtssichere Kriterien.",
    },
    questions: [
      "Welche Wirkung soll mit der Beschaffung oder Förderung erreicht werden?",
      "Welche Kriterien sind rechtssicher, überprüfbar und nicht nur Wunschliste?",
      "Wie werden kleine Anbieter, Kommunen und Verwaltungskapazitäten berücksichtigt?",
      "Wie wird verhindert, dass Wirkungskriterien zu Bürokratie ohne Wirkung werden?",
    ],
    mpd: {
      Mensch: "Öffentliche Nachfrage kann bessere Arbeit, Gesundheit, Bildung, Teilhabe und Versorgung stärken.",
      Planet: "Beschaffung beeinflusst Energie, Bau, Mobilität, Materialien, Kreisläufe und Klimaresilienz.",
      Demokratie: "Vergabe und Förderung brauchen Transparenz, Wettbewerb, Rechtsweg und nachvollziehbare Kriterien.",
    },
    sources: [
      ["Wirkungshaushalt", "wirkungssteuerung/wirkungshaushalt/", "öffentliche Mittel und Unterlassungskosten"],
      ["Scorecards", "wirkungssteuerung/scorecards/", "Kriterien und Prüflogik"],
      ["Öffentliche Beschaffung", "begriffe/oeffentliche-beschaffung/", "Begriffs- und Rechtskontext"],
      ["Produkt- und Beschaffungspiloten", "portale/transformation-uebergaenge-implementierung/produkt-und-beschaffungspiloten/", "Pilot- und Umsetzungskontext"],
    ],
  },
});

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
  writeFilePreservingEditorialPage("wirkungssteuerung/index.html", renderWirkungssteuerungPortal());
  for (const [slug, title, text] of steuerungPages) {
    writeFilePreservingEditorialPage(`wirkungssteuerung/${slug}/index.html`, renderSteuerungDetail(slug, title, text));
  }
}

updateNavigation();
updateArchitectureRegistry();
buildPages();
updateStartPage();
updateBibliothek();
