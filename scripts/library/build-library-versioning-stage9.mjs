import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "assets/data/library-version-registry.json");
const DOWNLOADS_PAGE = path.join(ROOT, "downloads.html");
const STAGE_DOC = path.join(ROOT, "docs/stage-9-library-versioning.md");
const CURATED_PUBLICATIONS = path.join(ROOT, "content/publications/grundlagenpublikationen.json");

const START = "<!-- stage9-library-versioning:start -->";
const END = "<!-- stage9-library-versioning:end -->";

const DOCUMENT_EXTENSIONS = new Set([".pdf", ".xlsx", ".pptx"]);
const ONLINE_EXTENSIONS = new Set([".html"]);
const NON_PUBLIC_FILE_EXTENSIONS = new Set([".docx", ".md", ".zip"]);
const INTERNAL_REFERENCE_ROUTE_PATTERNS = [
  /^referenz\/version(?:en|-)/,
  /^referenz\/export\//
];
// macOS-Duplikat-Artefakte ("… 2.html"). Ihr kanonisches Geschwister
// (…/index.html bzw. ….html) trägt denselben Inhalt und wird ohnehin erfasst;
// die " 2.html"-Route bleibt als archivierter Redirect-Stub erreichbar, gehört
// aber nicht als eigener Eintrag ins Versions-/Bibliotheksregister.
const MACOS_DUPLICATE_HTML = / \d+\.html$/i;
const SKIP_DIRS = new Set([
  ".git",
  ".codex-backup",
  "node_modules",
  "outputs",
  "__pycache__",
  ".next",
  "dist",
  "build"
]);

const DOCUMENT_ROOTS = [
  "assets/downloads",
  "assets/pdf",
  "public/downloads",
  "docs",
  "content",
  "dokumente"
];

const ONLINE_ROOTS = [
  "referenz",
  "dokumente",
  "werkstatt",
  "verstehen",
  "wirkungsfelder",
  "downloads",
  "fachbibliothek",
  "portale"
];

const TYPE_LABELS = [
  "Buch",
  "Grundlagenwerk",
  "Dossier",
  "Whitepaper",
  "Arbeitspapier",
  "Gesetzesentwurf",
  "Beispiel",
  "Methodik",
  "Leitbild",
  "Glossar",
  "Präsentation"
];

const STATUS_LABELS = [
  "führend",
  "aktuell",
  "Arbeitsfassung",
  "ältere Fassung",
  "ersetzt",
  "in Überarbeitung"
];

const READING_PATHS = [
  {
    id: "einstieg-30-minuten",
    title: "Einstieg in 30 Minuten",
    audience: "Neue Leser:innen",
    summary: "Schneller Weg vom Leitbild zur Gesamtlogik und zum Glossar.",
    links: [
      ["Leitbild Mensch, Planet, Demokratie", "dokumente/leitbild-mensch-planet-demokratie/"],
      ["WÖk auf einer Seite", "verstehen/woek-auf-einer-seite/"],
      ["Glossar", "glossar.html"]
    ]
  },
  {
    id: "unternehmen",
    title: "Für Unternehmen",
    audience: "Strategie, Controlling, Nachhaltigkeit",
    summary: "Unternehmen als Wirkungssysteme, operative Kennzahlen und Produkt-/Lieferkettenwirkung.",
    links: [
      ["Wirtschaft & Unternehmen", "fuer/unternehmen.html"],
      ["Impact Controlling", "werkzeuge/impact-controlling/"],
      ["Wirkungsfelder Wirtschaft", "wirkungsfelder/wirtschaft-unternehmen/"]
    ]
  },
  {
    id: "politik-verwaltung",
    title: "Für Politik/Verwaltung",
    audience: "Kommunen, Verwaltung, Gesetzgebung",
    summary: "Wirkungshaushalt, Beschaffung, Rechtsschutz und demokratische Steuerung.",
    links: [
      ["Politik/Verwaltung", "fuer/politik.html"],
      ["Wirkungshaushalt", "werkzeuge/wirkungshaushalt/"],
      ["Staat & Demokratie", "wirkungsfelder/staat-recht-demokratie/"]
    ]
  },
  {
    id: "wissenschaft-bildung",
    title: "Für Wissenschaft/Bildung",
    audience: "Forschung, Lehre, Schulen",
    summary: "Begriffe, Methoden, SDG-/SDG+-Referenzrahmen und Wirkungskompetenz.",
    links: [
      ["Wissenschaft & Forschung", "fuer/wissenschaft-forschung.html"],
      ["Akademie", "akademie.html"],
      ["SDGs & SDG+", "verstehen/sdgs-sdgplus/"]
    ]
  },
  {
    id: "medien-creator",
    title: "Für Medien/Creator",
    audience: "Journalismus, Plattformen, Kommunikation",
    summary: "Faktencheck, Folgencheck, Wirkungsräume und demokratische Schutzlinien.",
    links: [
      ["Journalismus", "fuer/journalismus.html"],
      ["Einwände & Schutzgrenzen", "einwaende/"],
      ["Medienwirkungscheck", "erleben/medienwirkungscheck/"]
    ]
  },
  {
    id: "kapital-investorinnen",
    title: "Für Kapital/Investor:innen",
    audience: "Kapital, Finanzierung, Risiko",
    summary: "NWI, T-SROI, Wirkungsfonds und Kapitalrückkopplung getrennt lesen.",
    links: [
      ["Investor:innen", "fuer/investoren.html"],
      ["Methoden & Werkzeuge", "werkzeuge/"],
      ["Finanzierung & Kapital", "wirkungsfelder/finanzsystem-kapital/"]
    ]
  },
  {
    id: "pilotierung",
    title: "Für Pilotierung",
    audience: "Pilotprojekte, Werkstatt, Mitgestaltung",
    summary: "Von Einwänden und Schutzlinien zu Demos, Methoden und Mitgestaltung.",
    links: [
      ["Mitmachen", "mitmachen.html"],
      ["Erleben", "erleben/"],
      ["Werkstatt", "werkstatt/"]
    ]
  },
  {
    id: "methodik-daten",
    title: "Methodik & Daten",
    audience: "Methodik, Datenqualität, Assurance",
    summary: "Daten, Bewertung, Qualität, rote Linien und methodische Vertiefung.",
    links: [
      ["Methodik", "methodik/"],
      ["Datenqualität & Assurance", "werkzeuge/datenqualitaet-assurance/"],
      ["Methoden & Werkzeuge", "werkzeuge/"]
    ]
  }
];

const LEADING_REFERENCE_PATHS = new Set([
  "buch.html",
  "assets/pdf/die-neue-ordnung-des-wohlstands.pdf",
  "assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_1.pdf",
  "glossar.html",
  "verstehen/sdgs-sdgplus/index.html",
  "bibliothek/woek-begriffsleitfaden-fuehrend/index.html",
  "public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.5.pdf",
  "public/downloads/originals/Wirkungssteuer_WStG_3.0_Gesamtneufassung_2026.pdf",
  "assets/downloads/woek-register/v1.4/WOeK_Masterregister_v1.4_FINAL_2026-08-16.xlsx"
]);

// Neu erzeugte, öffentliche Rechenstandards werden vor dem Commit bewusst in
// das Versionsregister aufgenommen. Das Register bleibt ansonsten strikt auf
// versionierte Dateien beschränkt und ignoriert zufällige Arbeitsartefakte.
const EXPLICIT_PUBLIC_DOCUMENTS = new Set([
  "assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_1.pdf",
  "assets/downloads/woek_gesundheit_pflege_einzeldossier_set_v0_3.pdf"
]);

// Kuratierte Dokumentseiten aus dem Dokument-Generator dürfen nicht zusätzlich
// als technisch abgeleitete Download-Einträge im Vollregister erscheinen.
// Sonst entstünde neben der redaktionellen Studienseite ein zweiter Eintrag mit
// einem aus dem Dateinamen abgeleiteten Titel.
const CURATED_DOCUMENT_PATHS = new Set([
  "assets/downloads/woek_gesamtstudie_wirkungsdilemmata_kooperation_sdgplus_v2_0.pdf"
]);

const LEADING_REFERENCE_PATTERNS = [
  /assets\/downloads\/woek_sdg_sdgplus_referenzrahmen_vertiefungskonzept_lesefassung_v0_3\.(docx|pdf)$/i,
  /referenz\/version-1-1\/index\.html$/i
];

const LEADING_OVERRIDES = new Map([
  ["public/downloads/originals/Wirkungssteuer_WStG_3.0_Gesamtneufassung_2026.pdf", {
    title: "Wirkungssteuer 3.0 und Wirkungssteuergesetz (WStG) 3.0",
    type: "Gesetzesentwurf",
    status: "führend",
    dateOrStand: "2026-08-17 · Version 3.0",
    shortDescription: "Führende Gesamtneufassung der steuerlichen Säule: modulare Rückkopplung über bestehende Steuerarten, parlamentarische Tarifhoheit, Wirkungsnachweiskonto, Schutzregeln, Rechtsschutz und EU-Pfad."
  }],
  ["docs/gesetze/WStG_2.0_Wirkungssteuerrahmengesetz_Entwurf.pdf", {
    title: "WStG 2.0 - historische Zwischenfassung",
    type: "Gesetzesentwurf",
    status: "ersetzt",
    shortDescription: "Zitierfähige historische Zwischenfassung. Für den aktuellen fachlichen Stand gilt die Gesamtneufassung WStG 3.0.",
    historicalNotice: "Historische Quellenfassung; ersetzt durch die Gesamtneufassung 3.0 vom 17. August 2026.",
    successorUrl: "bibliothek/wirkungssteuer-wstg-3-0/",
    successorLabel: "WStG 3.0 öffnen"
  }],
  ["public/downloads/originals/WStG_Oktober2025.pdf", {
    title: "WStG Oktober 2025 - historische Fassung",
    type: "Gesetzesentwurf",
    status: "ersetzt",
    shortDescription: "Zitierfähiger historischer Entwicklungsstand. Für den aktuellen fachlichen Stand gilt die Gesamtneufassung WStG 3.0.",
    historicalNotice: "Historische Quellenfassung; nicht still überschrieben und durch WStG 3.0 ersetzt.",
    successorUrl: "bibliothek/wirkungssteuer-wstg-3-0/",
    successorLabel: "WStG 3.0 öffnen"
  }],
  ["assets/pdf/wirkungssteuergesetz-wstg-oktober-2025.pdf", {
    title: "WStG Oktober 2025 - historische Fassung",
    type: "Gesetzesentwurf",
    status: "ersetzt",
    shortDescription: "Historische PDF-Fassung; für den aktuellen fachlichen Stand gilt WStG 3.0.",
    historicalNotice: "Historische Quellenfassung; ersetzt durch die Gesamtneufassung 3.0.",
    successorUrl: "bibliothek/wirkungssteuer-wstg-3-0/",
    successorLabel: "WStG 3.0 öffnen"
  }],
  ["dokumente/wstg-oktober-2025/index.html", {
    title: "WStG Oktober 2025 - historische Onlinefassung",
    type: "Gesetzesentwurf",
    status: "ersetzt",
    shortDescription: "Historische Onlinefassung; für den aktuellen fachlichen Stand gilt WStG 3.0.",
    historicalNotice: "Historische Quellenfassung; ersetzt durch die Gesamtneufassung 3.0.",
    successorUrl: "bibliothek/wirkungssteuer-wstg-3-0/",
    successorLabel: "WStG 3.0 öffnen"
  }],
  ["dokumente/dossier-wirkungswissenschaften-wirkungsforschung-wirkungsoekonomie/index.html", {
    title: "Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie",
    shortDescription: "Grundlagendossier von Natalie Weber: systemische Einordnung der Disziplinen, Begriffsarchitektur der Wirkung und Glossarbasis für Wirkungswissenschaften, Wirkungsforschung und Wirkungsökonomie.",
    type: "Dossier",
    status: "aktuell"
  }],
  ["buch.html", {
    title: "Die neue Ordnung des Wohlstands",
    shortDescription: "Grundlagenwerk der Wirkungsökonomie und führende Gesamtreferenz für die Systemlogik."
  }],
  ["dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html", {
    title: "Von der Wissensgesellschaft zur Wirkungsgesellschaft",
    shortDescription: "Erweiterte Dossierfassung v2.0 zum Übergang von der Wissensgesellschaft zur Wirkungsgesellschaft: Wissen, Labels, Zertifikate, Scores, Faktenchecks und Berichte werden erst wirksam, wenn sie in Bewertung, Rückkopplung und positive Netto-Wirkung übersetzt werden.",
    type: "Dossier",
    status: "aktuell"
  }],
  ["public/downloads/originals/von-der-wissensgesellschaft-zur-wirkungsgesellschaft-dossier.pdf", {
    title: "Von der Wissensgesellschaft zur Wirkungsgesellschaft",
    shortDescription: "Erweiterte Dossierfassung v2.0 zum Übergang von der Wissensgesellschaft zur Wirkungsgesellschaft: Wissen, Labels, Zertifikate, Scores, Faktenchecks und Berichte werden erst wirksam, wenn sie in Bewertung, Rückkopplung und positive Netto-Wirkung übersetzt werden.",
    type: "Dossier",
    status: "aktuell"
  }],
  ["assets/pdf/die-neue-ordnung-des-wohlstands.pdf", {
    title: "Die neue Ordnung des Wohlstands (PDF)",
    shortDescription: "Downloadfassung des Grundlagenwerks; führend für die Gesamtargumentation."
  }],
  ["glossar.html", {
    title: "Glossar der Wirkungsökonomie",
    shortDescription: "Öffentliche Begriffskarte für zentrale WÖk-Begriffe und Abkürzungen."
  }],
  ["bibliothek/woek-begriffsleitfaden-fuehrend/index.html", {
    title: "WÖk-Begriffsleitfaden führend v1.5",
    type: "Glossar",
    status: "führend",
    shortDescription: "Maßgebliche Sprach- und Methodenreferenz: IOOI ist eine externe, optionale Results Chain; die WÖk-Wirkungsarchitektur verbindet Vorwirkung, Evidenz, Bewertung, Schutz, Rückkopplung und Lernen."
  }],
  ["public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.5.pdf", {
    title: "WÖk-Begriffsleitfaden führend v1.5",
    type: "Glossar",
    status: "führend",
    shortDescription: "PDF-Fassung der maßgeblichen Sprach- und Methodenreferenz der Wirkungsökonomie, Version 1.5."
  }],
  ["public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.4.pdf", {
    title: "WÖk-Begriffsleitfaden führend v1.4",
    type: "Glossar",
    status: "archiviert",
    shortDescription: "Zitierfähige historische PDF-Fassung; für den aktuellen Begriffsstand gilt Version 1.5."
  }],
  ["public/downloads/originals/WOeK_Begriffsleitfaden_fuehrend_v1.0.pdf", {
    title: "WÖk-Begriffsleitfaden führend v1.0",
    type: "Glossar",
    status: "archiviert",
    shortDescription: "Zitierfähige historische PDF-Fassung; für den aktuellen Begriffsstand gilt Version 1.5."
  }],
  ["assets/downloads/woek-register/v1.4/WOeK_Masterregister_v1.4_FINAL_2026-08-16.xlsx", {
    title: "WÖk-Masterregister v1.4",
    type: "Methodik",
    status: "führend",
    shortDescription: "Führendes technisches Register mit 621 WÖk-IDs, 28 Regeln, getrennten Schwellen- und Benchmarkstatus sowie sichtbaren offenen Prüfbedarfen."
  }],
  ["assets/downloads/woek-register/WOeK_Master_Items_v1.3_geprueft.xlsx", {
    title: "WÖk Master Items v1.3 (historische Fassung)",
    type: "Methodik",
    status: "ersetzt",
    shortDescription: "Historische Registerfassung. Für den aktuellen technischen Stand gilt das WÖk-Masterregister v1.4.",
    historicalNotice: "Historische Quellenfassung. Die führende technische Registerquelle ist v1.4.",
    successorUrl: "bibliothek/woek-master-items-register/",
    successorLabel: "WÖk-Masterregister v1.4 öffnen"
  }],
  ["assets/pdf/woek-master-items-v1-2.pdf", {
    title: "WÖk Master Items v1.2 (historische Fassung)",
    type: "Methodik",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung des WÖk-Master-Items-Registers. Für den aktuellen Stand gilt das WÖk-Masterregister v1.4.",
    historicalNotice: "Historische Quellenfassung. Schwellenstatus, Quellenfunktion und Prüfprotokoll werden in v1.4 getrennt ausgewiesen.",
    successorUrl: "bibliothek/woek-master-items-register/",
    successorLabel: "WÖk-Masterregister v1.4 öffnen"
  }],
  ["assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_1.pdf", {
    title: "T-SROI-Rechenstandard v1.1",
    type: "Methodik",
    status: "führend",
    shortDescription: "Maßgeblicher Rechenstandard für T-SROI: kausal begrenzte und diskontierte Netto-Nutzenrechnung mit Schutz-Gate, ohne freie Multiplikatoren."
  }],
  ["assets/downloads/woek_gesundheit_pflege_einzeldossier_set_v0_3.pdf", {
    title: "Einzeldossiers Gesundheit & Pflege - Korrekturfassung v0.3",
    type: "Dossier",
    status: "aktuell",
    shortDescription: "Aktuelle Lesefassung mit getrennter monetärer Bilanz und nichtmonetärem Wirkungsprofil; eine positive Geldbilanz ersetzt kein Schutz-Gate."
  }],
  ["assets/downloads/woek_gesundheit_pflege_einzeldossier_set_v0_2.pdf", {
    title: "Einzeldossiers Gesundheit & Pflege v0.2 (historische Fassung)",
    type: "Dossier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung mit einer früheren Mischrechnung. Für die aktuelle Lesefassung und Rechenlogik gilt die Korrekturfassung v0.3."
  }],
  ["assets/downloads/woek_gesundheit_pflege_einzeldossier_set_v0_2 2.pdf", {
    title: "Einzeldossiers Gesundheit & Pflege v0.2 (historische Fassung)",
    type: "Dossier",
    status: "ersetzt",
    shortDescription: "Historische Duplikatfassung. Für die aktuelle Lesefassung und Rechenlogik gilt die Korrekturfassung v0.3."
  }],
  ["assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_0.pdf", {
    title: "T-SROI und Impact Controlling v1.0",
    type: "Methodik",
    status: "ersetzt",
    shortDescription: "Historische T-SROI-Darstellung mit multiplikativer Rechenlogik. Für Berechnungen gilt ausschließlich der führende T-SROI-Rechenstandard v1.1.",
    historicalNotice: "Historische Quellenfassung: Die frühere multiplikative T-SROI-Logik mit Transformations-, Resilienz- oder Datenqualitätsaufschlägen ist verworfen. Im führenden Rechenstandard ist transformative Wirkung kein Multiplikator, sondern ein separat belegter und diskontierter Nettonutzenstrom. Schäden werden innerhalb der Bilanzgrenze separat abgezogen; Datenqualität und Unsicherheit sind Prüf- und Sensitivitätsbedingungen. Ein positiver T-SROI setzt ein offenes Schutz-Gate voraus.",
    successorUrl: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
    successorLabel: "Führenden T-SROI-Rechenstandard v1.1 öffnen"
  }],
  ["assets/downloads/23_woek_impact_controlling_t_sroi_transformationsmessung_methodenpapier_v1_0 2.pdf", {
    title: "T-SROI und Impact Controlling v1.0",
    type: "Methodik",
    status: "ersetzt",
    shortDescription: "Historische T-SROI-Darstellung mit multiplikativer Rechenlogik. Für Berechnungen gilt ausschließlich der führende T-SROI-Rechenstandard v1.1.",
    historicalNotice: "Historische Duplikatfassung: Die frühere multiplikative T-SROI-Logik mit Transformations-, Resilienz- oder Datenqualitätsaufschlägen ist verworfen. Im führenden Rechenstandard ist transformative Wirkung kein Multiplikator, sondern ein separat belegter und diskontierter Nettonutzenstrom. Schäden werden innerhalb der Bilanzgrenze separat abgezogen; Datenqualität und Unsicherheit sind Prüf- und Sensitivitätsbedingungen. Ein positiver T-SROI setzt ein offenes Schutz-Gate voraus.",
    successorUrl: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
    successorLabel: "Führenden T-SROI-Rechenstandard v1.1 öffnen"
  }],
  // Diese drei macOS-Duplikate enthalten Verweise auf die frühere
  // Multiplikatorlogik. Sie bleiben ausschließlich als zitierfähige
  // Quellenfassungen erreichbar; die gleichnamigen aktuellen Kapitel werden
  // dadurch ausdrücklich nicht pauschal archiviert.
  ["assets/downloads/08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0 2.pdf", {
    title: "Wirkungsorientiertes Risikomanagement, Resilienz und Finanzmarktanforderungen (historische Duplikatfassung)",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Duplikatfassung mit Verweisen auf eine überholte multiplikative T-SROI-Logik. Für Berechnungen gilt der führende T-SROI-Rechenstandard v1.1.",
    historicalNotice: "Historische Duplikatfassung: Verweise auf einen Transformationsmultiplikator sind keine aktuelle Rechenregel. Im aktuellen Standard ist transformative Wirkung kein Aufschlagsfaktor, sondern ein separat belegter und diskontierter Nettonutzenstrom. Datenqualität, Resilienz und Unsicherheit sind Prüf- und Sensitivitätsbedingungen; bei geschlossenem Schutz-Gate wird kein positiver T-SROI ausgewiesen.",
    successorUrl: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
    successorLabel: "Aktuellen T-SROI-Rechenstandard öffnen"
  }],
  ["assets/downloads/30_woek_finanzsystem_kapital_kapitalwirkung_statt_kapitalrendite_detailkonzept_v1_0 2.pdf", {
    title: "Kapital als Wirkungskraft und Kapitalwirkung statt Kapitalrendite (historische Duplikatfassung)",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Duplikatfassung mit Verweisen auf eine überholte multiplikative T-SROI-Logik. Für Berechnungen gilt der führende T-SROI-Rechenstandard v1.1.",
    historicalNotice: "Historische Duplikatfassung: Verweise auf einen Transformationsmultiplikator sind keine aktuelle Rechenregel. Im aktuellen Standard ist transformative Wirkung kein Aufschlagsfaktor, sondern ein separat belegter und diskontierter Nettonutzenstrom. Datenqualität, Resilienz und Unsicherheit sind Prüf- und Sensitivitätsbedingungen; bei geschlossenem Schutz-Gate wird kein positiver T-SROI ausgewiesen.",
    successorUrl: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
    successorLabel: "Aktuellen T-SROI-Rechenstandard öffnen"
  }],
  ["assets/downloads/31_woek_finanzsystem_kapital_wirkungsfonds_dacharchitektur_detailkonzept_v1_0 2.pdf", {
    title: "Wirkungsfonds als Dacharchitektur (historische Duplikatfassung)",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Duplikatfassung mit Verweisen auf eine überholte multiplikative T-SROI-Logik. Für Berechnungen gilt der führende T-SROI-Rechenstandard v1.1.",
    historicalNotice: "Historische Duplikatfassung: Verweise auf einen Transformationsmultiplikator sind keine aktuelle Rechenregel. Im aktuellen Standard ist transformative Wirkung kein Aufschlagsfaktor, sondern ein separat belegter und diskontierter Nettonutzenstrom. Datenqualität, Resilienz und Unsicherheit sind Prüf- und Sensitivitätsbedingungen; bei geschlossenem Schutz-Gate wird kein positiver T-SROI ausgewiesen.",
    successorUrl: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
    successorLabel: "Aktuellen T-SROI-Rechenstandard öffnen"
  }],
  ["assets/downloads/impact-controlling-einfach-erklaert.pdf", {
    title: "Impact Controlling einfach erklärt",
    type: "Präsentation",
    status: "ersetzt",
    shortDescription: "Historische Einführung mit einer multiplikativen T-SROI-Darstellung. Für Berechnungen gilt ausschließlich der führende T-SROI-Rechenstandard v1.1.",
    historicalNotice: "Historische Quellenfassung: Die gezeigte multiplikative T-SROI-Logik ist verworfen. Der führende Rechenstandard verwendet keine Transformations-, Resilienz- oder Datenqualitätsaufschläge. Transformative Wirkung ist dort ein separat belegter und diskontierter Nettonutzenstrom; Schäden werden separat abgezogen. Datenqualität und Unsicherheit sind Prüf- und Sensitivitätsbedingungen, und ein positiver T-SROI setzt ein offenes Schutz-Gate voraus.",
    successorUrl: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
    successorLabel: "Führenden T-SROI-Rechenstandard v1.1 öffnen"
  }],
  ["assets/downloads/wirkungscontrolling_detailkonzept_dossier_v1_0.pdf", {
    title: "Wirkungscontrolling - Detailkonzept v1.0",
    type: "Dossier",
    status: "ersetzt",
    shortDescription: "Historische Dossierfassung mit einer überholten multiplikativen T-SROI-Formel. Für Berechnungen gilt ausschließlich der führende T-SROI-Rechenstandard v1.1.",
    historicalNotice: "Historische Quellenfassung: Die frühere multiplikative T-SROI-Formel ist verworfen. Der führende Rechenstandard verwendet keine Transformations-, Resilienz- oder Datenqualitätsaufschläge. Transformative Wirkung ist dort ein separat belegter und diskontierter Nettonutzenstrom; Schäden werden innerhalb der Bilanzgrenze separat abgezogen. Datenqualität und Unsicherheit sind Prüf- und Sensitivitätsbedingungen, und ein positiver T-SROI setzt ein offenes Schutz-Gate voraus.",
    successorUrl: "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/",
    successorLabel: "Führenden T-SROI-Rechenstandard v1.1 öffnen"
  }],
  ["public/downloads/originals/Whitepaper-T-SROI.pdf", {
    title: "Whitepaper T-SROI (historische Fassung)",
    type: "Whitepaper",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung mit multiplikativer T-SROI-Logik. Für Berechnungen gilt der führende T-SROI-Rechenstandard v1.1."
  }],
  ["assets/pdf/working-paper-wohnungsmarkt.pdf", {
    title: "Working Paper Wohnungsmarkt (historische Fassung)",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung mit vereinfachter T-SROI-Darstellung. Für T-SROI-Berechnungen gilt der führende T-SROI-Rechenstandard v1.1."
  }],
  ["public/downloads/originals/WP_Wohnungsmarkt.pdf", {
    title: "Working Paper Wohnungsmarkt (historische Fassung)",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung mit vereinfachter T-SROI-Darstellung. Für T-SROI-Berechnungen gilt der führende T-SROI-Rechenstandard v1.1."
  }],
  ["assets/pdf/wenn-maschinen-arbeiten.pdf", {
    title: "Wenn Maschinen arbeiten",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung zu Automatisierung und Einkommen. Personenbezogene Wirkungswerte sowie automatische individuelle Steuer-, Transfer- oder Leistungsfolgen gehören nicht zum aktuellen WÖk-Modell.",
    historicalNotice: "Historische Quellenfassung: Personen-Scoring, persönliche Wirkungskonten und automatische Individualentscheidungen sind verworfen. Wirkung wird an Angeboten, Entscheidungen und Systemen geprüft, nicht am sozialen Wert von Menschen.",
    successorUrl: "wirkungsfelder/arbeit-einkommen/",
    successorLabel: "Aktuelle Einordnung zu Arbeit & Einkommen öffnen"
  }],
  ["public/downloads/originals/Wenn-Maschinen-arbeiten.pdf", {
    title: "Wenn Maschinen arbeiten",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung zu Automatisierung und Einkommen. Personenbezogene Wirkungswerte sowie automatische individuelle Steuer-, Transfer- oder Leistungsfolgen gehören nicht zum aktuellen WÖk-Modell.",
    historicalNotice: "Historische Quellenfassung: Personen-Scoring, persönliche Wirkungskonten und automatische Individualentscheidungen sind verworfen. Wirkung wird an Angeboten, Entscheidungen und Systemen geprüft, nicht am sozialen Wert von Menschen.",
    successorUrl: "wirkungsfelder/arbeit-einkommen/",
    successorLabel: "Aktuelle Einordnung zu Arbeit & Einkommen öffnen"
  }],
  ["dokumente/wenn-maschinen-arbeiten/index.html", {
    title: "Wenn Maschinen arbeiten",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung zu Automatisierung und Einkommen. Personenbezogene Wirkungswerte sowie automatische individuelle Steuer-, Transfer- oder Leistungsfolgen gehören nicht zum aktuellen WÖk-Modell.",
    historicalNotice: "Historische Quellenfassung: Personen-Scoring, persönliche Wirkungskonten und automatische Individualentscheidungen sind verworfen. Wirkung wird an Angeboten, Entscheidungen und Systemen geprüft, nicht am sozialen Wert von Menschen.",
    successorUrl: "wirkungsfelder/arbeit-einkommen/",
    successorLabel: "Aktuelle Einordnung zu Arbeit & Einkommen öffnen"
  }],
  ["assets/pdf/working-paper-produktbesteuerung-durch-wirkung.pdf", {
    title: "Produktbesteuerung durch Wirkung",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung zur Produktsteuerung. Eine Wirkungseinstufung erzeugt im aktuellen WÖk-Modell weder automatisch eine Steuerklasse noch einen Preis und wird nie auf Personen übertragen.",
    historicalNotice: "Historische Quellenfassung: Automatische Score-zu-Steuer-/Preis-Zuordnungen und jede Ausdehnung auf Personen oder Einkommen sind verworfen. Produktprüfung braucht Rechtsgrundlage, Datenqualität, Prüfung und demokratische Kontrolle.",
    successorUrl: "wirkungsfelder/produkte-konsum/dossier/",
    successorLabel: "Aktuelles Dossier Produkte & Konsum öffnen"
  }],
  ["public/downloads/originals/WP_Produkte.pdf", {
    title: "Produktbesteuerung durch Wirkung",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung zur Produktsteuerung. Eine Wirkungseinstufung erzeugt im aktuellen WÖk-Modell weder automatisch eine Steuerklasse noch einen Preis und wird nie auf Personen übertragen.",
    historicalNotice: "Historische Quellenfassung: Automatische Score-zu-Steuer-/Preis-Zuordnungen und jede Ausdehnung auf Personen oder Einkommen sind verworfen. Produktprüfung braucht Rechtsgrundlage, Datenqualität, Prüfung und demokratische Kontrolle.",
    successorUrl: "wirkungsfelder/produkte-konsum/dossier/",
    successorLabel: "Aktuelles Dossier Produkte & Konsum öffnen"
  }],
  ["dokumente/wp-produkte/index.html", {
    title: "Produktbesteuerung durch Wirkung",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung zur Produktsteuerung. Eine Wirkungseinstufung erzeugt im aktuellen WÖk-Modell weder automatisch eine Steuerklasse noch einen Preis und wird nie auf Personen übertragen.",
    historicalNotice: "Historische Quellenfassung: Automatische Score-zu-Steuer-/Preis-Zuordnungen und jede Ausdehnung auf Personen oder Einkommen sind verworfen. Produktprüfung braucht Rechtsgrundlage, Datenqualität, Prüfung und demokratische Kontrolle.",
    successorUrl: "wirkungsfelder/produkte-konsum/dossier/",
    successorLabel: "Aktuelles Dossier Produkte & Konsum öffnen"
  }],
  ["public/downloads/originals/WP_Rente.pdf", {
    title: "Working-Paper Rente",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung zu Rente und sozialer Sicherung. Individuelle Wirkungsfaktoren und automatische Rentenfolgen gehören nicht zum aktuellen WÖk-Modell.",
    historicalNotice: "Historische Quellenfassung: Die Verrechnung persönlicher Biografien, Wirkungsfaktoren und Rentenhöhen ist verworfen. Die WÖk bewertet keine Personen und automatisiert keine individuellen Leistungsansprüche.",
    successorUrl: "wirkungsfelder/rente-soziale-sicherung/",
    successorLabel: "Aktuelle Einordnung zu Rente & sozialer Sicherung öffnen"
  }],
  ["dokumente/wp-rente/index.html", {
    title: "Working-Paper Rente",
    type: "Arbeitspapier",
    status: "ersetzt",
    shortDescription: "Historische Quellenfassung zu Rente und sozialer Sicherung. Individuelle Wirkungsfaktoren und automatische Rentenfolgen gehören nicht zum aktuellen WÖk-Modell.",
    historicalNotice: "Historische Quellenfassung: Die Verrechnung persönlicher Biografien, Wirkungsfaktoren und Rentenhöhen ist verworfen. Die WÖk bewertet keine Personen und automatisiert keine individuellen Leistungsansprüche.",
    successorUrl: "wirkungsfelder/rente-soziale-sicherung/",
    successorLabel: "Aktuelle Einordnung zu Rente & sozialer Sicherung öffnen"
  }],
  ["verstehen/sdgs-sdgplus/index.html", {
    title: "SDGs & SDG+",
    type: "Methodik",
    shortDescription: "Führende Onlinefassung des Referenzrahmens: SDGs, Agenda 2030 und SDG+."
  }],
  ["assets/downloads/woek_sdg_sdgplus_referenzrahmen_vertiefungskonzept_lesefassung_v0_3.docx", {
    title: "SDG-/SDG+-Referenzrahmen (Lesefassung)",
    shortDescription: "Führende Dokumentfassung des Referenzrahmens für SDGs, Agenda 2030 und SDG+."
  }],
  ["assets/downloads/woek_sdg_sdgplus_referenzrahmen_vertiefungskonzept_lesefassung_v0_3.pdf", {
    title: "SDG-/SDG+-Referenzrahmen (Lesefassung)",
    shortDescription: "Führende Dokumentfassung des Referenzrahmens für SDGs, Agenda 2030 und SDG+."
  }],
  ["assets/pdf/imported/nachhaltiges-marketing-mix.pdf", {
    title: "Nachhaltiges Marketing-Mix",
    type: "Buch",
    status: "aktuell",
    shortDescription: "Frühe Buchfassung zur Frage, wie Agenda 2030 und SDGs im Marketing-Mix von Industrie und Handel praktisch verankert werden können."
  }],
  ["bibliothek/nachhaltiges-marketing-mix/index.html", {
    title: "Nachhaltiges Marketing-Mix",
    type: "Buch",
    status: "aktuell",
    shortDescription: "Online lesbare Buchfassung zur Frage, wie Agenda 2030 und SDGs im Marketing-Mix von Industrie und Handel praktisch verankert werden können."
  }],
  ["assets/pdf/imported/nachhaltiger-einzelhandel.pdf", {
    title: "Nachhaltiger Einzelhandel",
    type: "Buch",
    status: "aktuell",
    shortDescription: "Frühe Ausarbeitung zur Frage, wie Einzelhandel Nachhaltigkeit, Verantwortung, Kreislaufwirtschaft und konkrete Best Practices in Geschäftsmodelle übersetzen kann."
  }],
  ["bibliothek/nachhaltiger-einzelhandel/index.html", {
    title: "Nachhaltiger Einzelhandel",
    type: "Buch",
    status: "aktuell",
    shortDescription: "Online lesbare Ausarbeitung zur Frage, wie Einzelhandel Nachhaltigkeit, Verantwortung, Kreislaufwirtschaft und konkrete Best Practices in Geschäftsmodelle übersetzen kann."
  }],
  ["assets/pdf/imported/nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen.pdf", {
    title: "Nachhaltigkeitsstrategie für mittelständische Beratungsunternehmen",
    type: "Buch",
    status: "aktuell",
    shortDescription: "Frühe Ausarbeitung zur Umsetzung von Agenda 2030, SDGs und ESG-Anforderungen in mittelständischen Beratungsunternehmen."
  }],
  ["bibliothek/nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen/index.html", {
    title: "Nachhaltigkeitsstrategie für mittelständische Beratungsunternehmen",
    type: "Buch",
    status: "aktuell",
    shortDescription: "Online lesbare Ausarbeitung zur Umsetzung von Agenda 2030, SDGs und ESG-Anforderungen in mittelständischen Beratungsunternehmen."
  }],
  ["assets/pdf/imported/nachhaltigkeitstransformation-im-handwerk.pdf", {
    title: "Nachhaltigkeitstransformation im Handwerk",
    type: "Buch",
    status: "aktuell",
    shortDescription: "Frühe Ausarbeitung zur Nachhaltigkeitstransformation kleiner Handwerksbetriebe mit Blick auf gesetzliche Vorgaben, Kundenanforderungen, Lieferanten und betriebliche Umsetzung."
  }],
  ["bibliothek/nachhaltigkeitstransformation-im-handwerk/index.html", {
    title: "Nachhaltigkeitstransformation im Handwerk",
    type: "Buch",
    status: "aktuell",
    shortDescription: "Online lesbare Ausarbeitung zur Nachhaltigkeitstransformation kleiner Handwerksbetriebe mit Blick auf gesetzliche Vorgaben, Kundenanforderungen, Lieferanten und betriebliche Umsetzung."
  }],
  ["werkstatt/arbeitsbibliothek/whitepaper/faktencheck-folgencheck/index.html", {
    title: "Faktencheck und Folgencheck - Methodenseite",
    type: "Methodik",
    status: "aktuell",
    shortDescription: "Methodischer Kurzüberblick. Die führende vollständige Arbeitsfassung steht unter Folgencheck statt Faktencheck in der Bibliothek."
  }]
]);

function loadTrackedFiles() {
  try {
    const output = execFileSync("git", ["ls-files", "-z"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return new Set(output.split("\0").filter(Boolean));
  } catch {
    return null;
  }
}

const TRACKED_FILES = loadTrackedFiles();

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function walk(dir, extensions, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    const relative = path.relative(ROOT, abs).split(path.sep).join("/");
    if (relative.startsWith("content/internal-documents/")) continue;
    if (entry.isDirectory()) {
      walk(abs, extensions, acc);
      continue;
    }
    if (!entry.isFile()) continue;
    if (TRACKED_FILES && !TRACKED_FILES.has(relative) && !EXPLICIT_PUBLIC_DOCUMENTS.has(relative)) continue;
    if (CURATED_DOCUMENT_PATHS.has(relative)) continue;
    if (INTERNAL_REFERENCE_ROUTE_PATTERNS.some((pattern) => pattern.test(relative))) continue;
    if (MACOS_DUPLICATE_HTML.test(entry.name)) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (NON_PUBLIC_FILE_EXTENSIONS.has(ext)) continue;
    if (extensions.has(ext)) acc.push(abs);
  }
  return acc;
}

function rel(abs) {
  return path.relative(ROOT, abs).split(path.sep).join("/");
}

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function titleFromRel(relativePath) {
  const parsed = path.parse(relativePath);
  const parent = path.basename(path.dirname(relativePath));
  const raw = parsed.name === "index" ? parent : parsed.name;
  const parentTitle = parent
    .replace(/^rang[_-]?/i, "Rang ")
    .replace(/[_-]+/g, " ")
    .replace(/\bki\b/gi, "KI")
    .replace(/\bsdgplus\b/gi, "SDG+")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
  if (/^00[_-]portalstartseite/i.test(raw)) return `${parentTitle}: Portalstartseite und Online-Einstieg`;
  if (/^01[_-]konzeptpapier/i.test(raw)) return `${parentTitle}: Konzeptpapier`;
  if (/^02[_-]gesamtdossier/i.test(raw)) return `${parentTitle}: Gesamtdossier`;
  return raw
    .replace(/^\d{1,2}[_-]+/, "")
    .replace(/^woek[_-]/i, "WÖk ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+v\d+(?:[._-]\d+)*\b/gi, "")
    .replace(/\s+\d+$/, "")
    .replace(/\bwoek\b/gi, "WÖk")
    .replace(/\bsdgs\b/gi, "SDGs")
    .replace(/\bsdgplus\b/gi, "SDG+")
    .replace(/\bwstg\b/gi, "WStG")
    .replace(/\bwustg\b/gi, "WUStG")
    .replace(/\bki\b/gi, "KI")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function xmlText(xml = "") {
  return xml
    .replace(/<w:tab\/>/g, " ")
    .replace(/<w:br\/>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function paragraphsFromDocx(relativePath) {
  const abs = path.join(ROOT, relativePath);
  if (!fs.existsSync(abs)) return [];
  try {
    const xml = execFileSync("unzip", ["-p", abs, "word/document.xml"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 1024 * 1024 * 20
    });
    return xml
      .split(/<\/w:p>/)
      .map((part) => xmlText(part))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function docxSibling(relativePath) {
  if (relativePath.endsWith(".pdf")) {
    const sameStem = relativePath.replace(/\.pdf$/i, ".docx");
    if (fs.existsSync(path.join(ROOT, sameStem))) return sameStem;
  }
  return relativePath.endsWith(".docx") ? relativePath : "";
}

function cleanInsightLine(line = "") {
  return line
    .replace(/\s+/g, " ")
    .replace(/^[-–-]\s*/, "")
    .trim();
}

function isGenericInsightLine(line = "") {
  return /^(wirkungsökonomie|inhaltsverzeichnis|tabelle|seite \d+|autor(?:in)?:|referenz:|version:|stand:|status:|dokumentenstatus|hinweis: dieses dokument|©|\d+\.\s)/i.test(line)
    || line.length < 8;
}

function documentInsight(relativePath) {
  const source = docxSibling(relativePath);
  const paragraphs = source ? paragraphsFromDocx(source).map(cleanInsightLine).filter(Boolean) : [];
  if (!paragraphs.length) return {};
  const meaningful = paragraphs.filter((line) => !isGenericInsightLine(line));
  const titleParts = [];
  const rangLine = meaningful.find((line) => /^rang\s+\d+\s*[-–]/i.test(line));
  const conceptLine = meaningful.find((line) => /^(konzeptpapier|gesamtdossier|detailkonzept|einzeldossier|whitepaper|working paper|manifest|kurzfassung)/i.test(line));
  if (rangLine) {
    titleParts.push(rangLine);
    const afterRang = meaningful[meaningful.indexOf(rangLine) + 1];
    if (afterRang && !/^(portalstartseite|online-einstieg|autor|referenz|version|status)/i.test(afterRang) && afterRang.length < 110) titleParts.push(afterRang);
  } else if (conceptLine) {
    titleParts.push(conceptLine);
    const afterConcept = meaningful[meaningful.indexOf(conceptLine) + 1];
    if (afterConcept && afterConcept.length < 120) titleParts.push(afterConcept);
  } else if (meaningful[0]) {
    titleParts.push(meaningful[0]);
    if (meaningful[1] && titleParts.join(" ").length < 70 && meaningful[1].length < 120) titleParts.push(meaningful[1]);
  }
  const title = titleParts
    .join(": ")
    .replace(/\s*:\s*:\s*/g, ": ")
    .replace(/\bWIRKUNGSÖKONOMIE\b\s*:?\s*/i, "")
    .trim();
  const summary = meaningful.find((line) => line.length >= 90 && !title.includes(line.slice(0, 40)));
  return {
    title: title || "",
    shortDescription: summary ? `${summary.slice(0, 260).replace(/\s+\S*$/, "")}.` : ""
  };
}

function typeFor(relativePath, title) {
  const s = `${relativePath} ${title}`.toLowerCase();
  if (/\.(pptx)$/.test(s)) return "Präsentation";
  if (/glossar|begriff|language-rules|sprach/.test(s)) return "Glossar";
  if (/leitbild|manifest|minifest/.test(s)) return "Leitbild";
  if (/gesetz|wstg|westg|wustg|rechtsrahmen/.test(s)) return "Gesetzesentwurf";
  if (/whitepaper|white-paper/.test(s)) return "Whitepaper";
  if (/beispiel|use-case|use_case|fallstudie/.test(s)) return "Beispiel";
  if (/method|scorecard|indikator|datenqualitaet|assurance|referenzrahmen|standard|master-items|toolkarten/.test(s)) return "Methodik";
  if (/grundlagen|wohlstand|referenz\/version|buch/.test(s)) return "Grundlagenwerk";
  // Dossierfassungen wurden bisher pauschal als Arbeitspapiere geführt, weil
  // die Dokumentart nur aus Titel-/Dateimustern abgeleitet wurde. Hubs bleiben
  // außen vor; Einzeldossiers, Feld-Dossiers und Gesamtdossiers werden gezählt.
  const isDossierPublication =
    !/detailkonzept/.test(s) &&
    (/(?:^|\/)dossier(?:s)?\/(?:index\.html|[^/]+\/index\.html)$/.test(relativePath.toLowerCase()) ||
      /(?:^|\/)gesamtdossier\/index\.html$/.test(relativePath.toLowerCase()) ||
      /(?:^|\/)[^/]*dossier[^/]*\.pdf$/.test(relativePath.toLowerCase()));
  if (isDossierPublication) return "Dossier";
  return "Arbeitspapier";
}

function statusFor(relativePath, type) {
  const s = relativePath.toLowerCase();
  if (LEADING_REFERENCE_PATHS.has(relativePath) || LEADING_REFERENCE_PATTERNS.some((pattern) => pattern.test(relativePath))) return "führend";
  if (/ersetzt|superseded/.test(s)) return "ersetzt";
  if (/ueberarbeitung|überarbeitung|review/.test(s)) return "in Überarbeitung";
  if (/arbeitsfassung|draft|entwurf|v0[_-]?\d/.test(s)) return "Arbeitsfassung";
  if (/archiv|historisch|alt|backup|\s2\.|\s3\.|index 2\.html|version-1-0/.test(s)) return "ältere Fassung";
  if (type === "Grundlagenwerk" || type === "Leitbild" || type === "Glossar") return "aktuell";
  return "aktuell";
}

function standFor(relativePath) {
  const s = relativePath.toLowerCase();
  const date = s.match(/20\d{2}[-_]\d{2}[-_]\d{2}|20\d{2}[-_]\d{2}/);
  if (date) return date[0].replaceAll("_", "-");
  const version = s.match(/v\d+(?:[_.-]\d+)*/);
  if (version) return version[0].replaceAll("_", ".");
  const year = s.match(/20\d{2}/);
  if (year) return year[0];
  return "";
}

function topicsFor(relativePath) {
  const s = relativePath.toLowerCase();
  const topics = [];
  const add = (condition, value) => { if (condition) topics.push(value); };
  add(/sdg|agenda|referenzrahmen/.test(s), "SDGs, Agenda 2030 & SDG+");
  add(/produkt|konsum|lieferkette|beschaffung/.test(s), "Produkte, Konsum & Beschaffung");
  add(/unternehmen|wirtschaft|impact-controlling|governance|kmu/.test(s), "Wirtschaft & Unternehmen");
  add(/kapital|finanz|invest|fonds|rente/.test(s), "Kapital & Finanzierung");
  add(/staat|recht|demokratie|politik|verwaltung|kommune|steuer|wstg|wustg/.test(s), "Staat & Demokratie");
  add(/medien|kommunikation|journalismus|creator|faktencheck|folgencheck/.test(s), "Öffentlichkeit & Wissen");
  add(/wohnen|miete|quartier|stadt|sanierung|energie/.test(s), "Alltag & Grundbedürfnisse");
  add(/bildung|schule|wissenschaft|innovation|kompetenz/.test(s), "Wissenschaft, Bildung & Lernen");
  add(/daten|ki|digital|produktpass|register|assurance/.test(s), "Daten & Infrastruktur");
  add(/gesundheit|pflege|resilienz|planet|klima/.test(s), "Planet & Resilienz");
  return topics.length ? [...new Set(topics)] : ["Grundlagen & Orientierung"];
}

function methodsFor(relativePath) {
  const s = relativePath.toLowerCase();
  const methods = [];
  const add = (condition, value) => { if (condition) methods.push(value); };
  add(/nwi|netto/.test(s), "NWI");
  add(/t-sroi|tsroi|transformation/.test(s), "T-SROI");
  add(/scorecard|indikator|kii|wirkungsindikator/.test(s), "Wirkungsindikatoren");
  add(/daten|assurance|audit|register|produktpass/.test(s), "Datenqualität & Assurance");
  add(/steuer|preis|wustg|wstg|westg/.test(s), "Wirkungssteuerung");
  add(/haushalt|beschaffung|foerder|förder/.test(s), "Wirkungshaushalt & Beschaffung");
  add(/faktencheck|folgencheck|medien/.test(s), "Faktencheck & Folgencheck");
  add(/kompass|glossar|sprach|leitbild/.test(s), "Begriffliche Orientierung");
  return [...new Set(methods)];
}

function fieldsFor(relativePath) {
  const s = relativePath.toLowerCase();
  const fields = [];
  const add = (condition, value) => { if (condition) fields.push(value); };
  add(/wohnen|miete|quartier|stadt|gesundheit|pflege|bildung|arbeit|einkommen/.test(s), "Alltag & Grundbedürfnisse");
  add(/wirtschaft|unternehmen|produkt|konsum|kapital|finanz|rente/.test(s), "Wirtschaft & Kapital");
  add(/staat|recht|demokratie|politik|verwaltung|steuer|beschaffung/.test(s), "Staat & Demokratie");
  add(/medien|wissen|wissenschaft|bildung|kommunikation/.test(s), "Öffentlichkeit & Wissen");
  add(/planet|klima|energie|resilienz|lieferkette/.test(s), "Planet & Resilienz");
  return [...new Set(fields)];
}

function urlFor(relativePath) {
  if (relativePath.endsWith("/index.html")) return `${relativePath.slice(0, -"index.html".length)}`;
  if (relativePath.endsWith(".html")) return relativePath;
  return relativePath;
}

function summaryFor(type, status, topics) {
  const topicText = topics.slice(0, 2).join(", ");
  return `${type} im Bibliotheks- und Versionssystem; Status: ${status}${topicText ? `; Themen: ${topicText}` : ""}.`;
}

function collectFiles(roots, extensions) {
  return roots
    .filter(exists)
    .flatMap((root) => walk(path.join(ROOT, root), extensions))
    .map(rel)
    .sort((a, b) => a.localeCompare(b, "de"));
}

function documentFor(relativePath, source) {
  const title = titleFromRel(relativePath);
  const type = typeFor(relativePath, title);
  const status = statusFor(relativePath, type);
  const topics = topicsFor(relativePath);
  const methods = methodsFor(relativePath);
  const fields = fieldsFor(relativePath);
  const ext = path.extname(relativePath).replace(".", "").toUpperCase() || "HTML";
  const overrides = LEADING_OVERRIDES.get(relativePath) || {};
  const effectiveStatus = overrides.status || status;
  const insight = documentInsight(relativePath);
  const isPortalStart = /\/00[_-]portalstartseite(?:\s\d+)?\.(pdf|docx)$/i.test(relativePath);
  const contentTitle = isPortalStart && !/rang\s+\d+|portalstartseite/i.test(insight.title || "") ? "" : insight.title;
  return {
    id: slugify(`${source}-${relativePath}`),
    title: overrides.title || contentTitle || title,
    shortDescription: overrides.shortDescription || insight.shortDescription || summaryFor(type, status, topics),
    type: overrides.type || type,
    status: effectiveStatus,
    dateOrStand: standFor(relativePath),
    topics,
    relatedMethods: methods,
    relatedImpactFields: fields,
    formats: [ext],
    urls: {
      primary: urlFor(relativePath),
      sourcePath: relativePath
    },
    source,
    isLeadingReference: effectiveStatus === "führend",
    historicalNotice: overrides.historicalNotice || "",
    successorUrl: overrides.successorUrl || "",
    successorLabel: overrides.successorLabel || ""
  };
}

function mergeDocuments(documents) {
  const byKey = new Map();
  for (const doc of documents) {
    const key = doc.urls.sourcePath.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, doc);
      continue;
    }
    const existing = byKey.get(key);
    existing.formats = [...new Set([...existing.formats, ...doc.formats])].sort();
  }
  return [...byKey.values()].sort((a, b) => {
    const statusA = STATUS_LABELS.indexOf(a.status);
    const statusB = STATUS_LABELS.indexOf(b.status);
    if (statusA !== statusB) return statusA - statusB;
    return a.title.localeCompare(b.title, "de");
  });
}

function buildRegistry() {
  const fileDocuments = collectFiles(DOCUMENT_ROOTS, DOCUMENT_EXTENSIONS).map((file) => documentFor(file, "download-or-document"));
  const onlineDocuments = collectFiles(ONLINE_ROOTS, ONLINE_EXTENSIONS).map((file) => documentFor(file, "online-version"));
  const requiredReferences = [
    "buch.html",
    "glossar.html",
    "begriffe/index.html",
    "bibliothek/woek-begriffsleitfaden-fuehrend/index.html",
    "bibliothek/nachhaltiges-marketing-mix/index.html",
    "bibliothek/nachhaltiger-einzelhandel/index.html",
    "bibliothek/nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen/index.html",
    "bibliothek/nachhaltigkeitstransformation-im-handwerk/index.html"
  ].filter(exists).map((file) => documentFor(file, "leading-reference"));
  const curatedPublications = fs.existsSync(CURATED_PUBLICATIONS)
    ? JSON.parse(fs.readFileSync(CURATED_PUBLICATIONS, "utf8")).publications.map((publication) => ({
        ...publication,
        source: "curated-publication"
      }))
    : [];
  const documents = mergeDocuments([...curatedPublications, ...requiredReferences, ...fileDocuments, ...onlineDocuments]);
  const counts = documents.reduce((acc, doc) => {
    acc.total += 1;
    acc.byStatus[doc.status] = (acc.byStatus[doc.status] || 0) + 1;
    acc.byType[doc.type] = (acc.byType[doc.type] || 0) + 1;
    acc.bySource[doc.source] = (acc.bySource[doc.source] || 0) + 1;
    return acc;
  }, { total: 0, byStatus: {}, byType: {}, bySource: {} });
  counts.downloadFiles = fileDocuments.length + curatedPublications.length;
  counts.onlineVersions = onlineDocuments.length;
  return {
    generatedAt: new Date().toISOString(),
    purpose: "Stage 9: kuratiertes Quellen- und Versionssystem der Wirkungsökonomie-Bibliothek.",
    schema: {
      type: TYPE_LABELS,
      status: STATUS_LABELS,
      fields: ["title", "shortDescription", "type", "status", "dateOrStand", "topics", "relatedMethods", "relatedImpactFields", "formats", "urls"]
    },
    leadingLanguageReference: {
      title: "Glossar und WÖk-Begriffsleitfaden",
      status: "führend",
      url: "bibliothek/woek-begriffsleitfaden-fuehrend/",
      note: "Öffentliche Sprachreferenz über Begriffsleitfaden, Glossar-Hub und Begriffsdetailseiten. Die Markdown-Quelle bleibt intern; veröffentlicht sind Webfassung und PDF."
    },
    readingPaths: READING_PATHS,
    counts,
    documents
  };
}

function cardLinks(links) {
  return links
    .map(([label, href]) => `<a class="text-link" href="${href}">${label}</a>`)
    .join(" ");
}

function statusLegend() {
  return STATUS_LABELS
    .map((status) => `<li><span class="status-badge status-badge--${slugify(status)}">${status}</span></li>`)
    .join("\n              ");
}

function buildDownloadsBlock(registry) {
  const leading = registry.documents
    .filter((doc) => doc.isLeadingReference)
    .slice(0, 6);
  const leadingCards = leading.map((doc) => `
            <article class="card library-lead-card">
              <p class="card-kicker">${doc.type} · ${doc.status}${doc.dateOrStand ? ` · ${doc.dateOrStand}` : ""}</p>
              <h3 class="card-title">${doc.title}</h3>
              <p class="card-text">${doc.shortDescription}</p>
              <a class="text-link" href="${doc.urls.primary}">Zur Referenz</a>
            </article>`).join("");
  const pathCards = registry.readingPaths.map((pathItem) => `
            <article class="card library-path-card">
              <p class="card-kicker">${pathItem.audience}</p>
              <h3 class="card-title">${pathItem.title}</h3>
              <p class="card-text">${pathItem.summary}</p>
              <p class="library-path-links">${cardLinks(pathItem.links)}</p>
            </article>`).join("");
  return `${START}
      <section class="section section-muted" id="lesepfade">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Kuratierte Bibliothek</p>
            <h2>Quellen, Versionen und Lesepfade.</h2>
            <p>Die Bibliothek bleibt vollständig verfügbar und macht künftig sichtbarer, welche Dokumente führend, aktuell, in Arbeit oder ältere Fassungen sind.</p>
          </div>
          <div class="library-count-grid">
            <div><strong>${registry.counts.total}</strong><span>inventarisierte Einträge</span></div>
            <div><strong>${registry.counts.downloadFiles}</strong><span>öffentliche Dateien</span></div>
            <div><strong>${registry.counts.onlineVersions}</strong><span>Onlinefassungen</span></div>
          </div>
          <div class="card-grid three library-leading-grid">
            <article class="card library-lead-card library-lead-card--primary">
              <p class="card-kicker">Maßgebliche Sprachreferenz · führend</p>
              <h3 class="card-title">Glossar und WÖk-Sprachregelwerk</h3>
              <p class="card-text">Öffentliche Referenz für Wirkung als neutralen relationalen Begriff, SDG+, positive Netto-Wirkung sowie Demo- und Beratungshinweise.</p>
              <a class="text-link" href="begriffe/">Glossar öffnen</a>
            </article>${leadingCards}
          </div>
          <div class="library-version-meta">
            <h3>Statuslogik</h3>
            <ul class="library-status-legend">
              ${statusLegend()}
            </ul>
            <p>Ältere Fassungen und Arbeitsfassungen werden nicht versteckt. Sie bleiben auffindbar, werden aber gegenüber führenden und aktuellen Referenzen eingeordnet.</p>
            <p><a class="text-link" href="assets/data/library-version-registry.json">Maschinenlesbares Versionsregister öffnen</a></p>
          </div>
        </div>
      </section>

      <section class="section" id="kuratierte-lesepfade">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Lesepfade</p>
            <h2>Der passende Einstieg nach Rolle und Frage.</h2>
            <p>Die Pfade führen zu bestehenden Seiten und Dokumenten. Wo Inhalte noch wachsen, bleibt der Status sichtbar.</p>
          </div>
          <div class="card-grid four library-path-grid">${pathCards}
          </div>
        </div>
      </section>
${END}`;
}

function injectBlock(html, block) {
  const existing = new RegExp(`${START}[\\s\\S]*?${END}`);
  if (existing.test(html)) return html.replace(existing, block);
  const insertionPoint = html.indexOf("      <section class=\"section section-muted\">");
  if (insertionPoint === -1) {
    const mainPoint = html.indexOf("    </main>");
    if (mainPoint === -1) throw new Error("Could not find insertion point in downloads.html");
    return `${html.slice(0, mainPoint)}${block}\n${html.slice(mainPoint)}`;
  }
  return `${html.slice(0, insertionPoint)}${block}\n\n${html.slice(insertionPoint)}`;
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function writeDoc(registry) {
  const statusRows = STATUS_LABELS
    .map((status) => `| ${status} | ${registry.counts.byStatus[status] || 0} |`)
    .join("\n");
  const typeRows = TYPE_LABELS
    .map((type) => `| ${type} | ${registry.counts.byType[type] || 0} |`)
    .join("\n");
  const content = `# Stage 9: Bibliothek, Quellen und Versionen

Stand: automatisch erzeugt durch \`scripts/library/build-library-versioning-stage9.mjs\`

## Ziel

Die Bibliothek wird als kuratiertes Quellen- und Versionssystem vorbereitet. Dokumente, Downloads und Onlinefassungen bleiben erhalten; ältere oder ersetzte Fassungen werden eingeordnet statt versteckt. Markdown-, Word- und ZIP-Dateien sind keine öffentlichen Bibliotheksformate.

## Inventar

- Inventarisierte Einträge gesamt: ${registry.counts.total}
- Öffentliche Download-/Dokumentdateien: ${registry.counts.downloadFiles}
- Onlinefassungen: ${registry.counts.onlineVersions}
- Maschinenlesbares Register: \`assets/data/library-version-registry.json\`
- Sichtbare Kuratierung: \`downloads.html#lesepfade\`

## Statuszählung

| Status | Anzahl |
| --- | ---: |
${statusRows}

## Typzählung

| Typ | Anzahl |
| --- | ---: |
${typeRows}

## Maßgebliche Sprachreferenz

Das öffentliche Glossar und seine Begriffsdetailseiten sind als führende Sprachreferenz markiert. Interne Markdown-Quellen bleiben intern und werden nicht als öffentliche Dokumente verlinkt. Die verbindliche Referenz für die WÖk-Sprache umfasst: Wirkung neutral und relational, SDG+ als transparente WÖk-Erweiterung, positive Netto-Wirkung für Mensch, Planet und Demokratie, Demo-Schutzlinien und keine Personenbewertung.

## Lesepfade

${READING_PATHS.map((item) => `- ${item.title}: ${item.summary}`).join("\n")}

## Nicht-destruktive Umsetzung

Es wurden keine Dokumente gelöscht, keine bestehenden Download-URLs entfernt und keine Bibliotheksroute umbenannt. Die Stage ergänzt ein Register, eine kuratierte Statuslogik und Lesepfade.
`;
  fs.writeFileSync(STAGE_DOC, content);
}

const registry = buildRegistry();
writeJson(OUTPUT, registry);
const page = fs.readFileSync(DOWNLOADS_PAGE, "utf8");
fs.writeFileSync(DOWNLOADS_PAGE, injectBlock(page, buildDownloadsBlock(registry)));
writeDoc(registry);

console.log(`Stage 9 library registry written: ${registry.counts.total} entries (${registry.counts.downloadFiles} files, ${registry.counts.onlineVersions} online versions).`);
