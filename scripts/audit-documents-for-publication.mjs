import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const DOC_MODEL = path.join(ROOT, "content/documents/documents.json");
const INVENTORY_DOC = path.join(ROOT, "docs/document-inventory.md");
const AUDIT_DOC = path.join(ROOT, "docs/document-publication-audit.md");
const PUBLIC_DATA = path.join(ROOT, "assets/data/document-library.json");
const DOWNLOADS_PAGE = path.join(ROOT, "downloads.html");
const BIB_INDEX = path.join(ROOT, "bibliothek/index.html");
const BIB_DIR = path.join(ROOT, "bibliothek");

const DOCUMENT_EXTENSIONS = new Set([".pdf", ".docx", ".xlsx", ".pptx", ".md"]);
const NON_PUBLIC_FILE_EXTENSIONS = new Set([".docx", ".md", ".zip"]);
const PUBLIC_VISIBILITIES = new Set(["public", "expert_public"]);
const ARCHIVE_VISIBILITIES = new Set(["archive"]);
const NON_PUBLIC_VISIBILITIES = new Set(["review_required", "internal", "hidden"]);

const SKIP_PARTS = [
  ".git/",
  ".codex-backup/",
  "node_modules/",
  "woek-akademie-app/.next/",
  "woek-akademie-app/node_modules/",
  "outputs/"
];

const EXISTING_DOCUMENT_META = (() => {
  if (!fs.existsSync(DOC_MODEL)) return new Map();
  try {
    const current = JSON.parse(fs.readFileSync(DOC_MODEL, "utf8"));
    return new Map((current.documents || []).map((doc) => [doc.id, {
      fileSize: doc.fileSize,
      pageCount: doc.pageCount,
      estimatedReadingTime: doc.estimatedReadingTime,
    }]));
  } catch {
    return new Map();
  }
})();

const AUDIT_PATTERNS = [
  { id: "soll-ich", label: "Arbeitsprozess-Satz: Soll ich", pattern: /Soll ich/i },
  { id: "moechtest-du", label: "Arbeitsprozess-Satz: Möchtest du", pattern: /Möchtest du|Moechtest du/i },
  { id: "chatgpt", label: "ChatGPT-Hinweis", pattern: /ChatGPT/i },
  { id: "utm-chatgpt", label: "Tracking-URL chatgpt", pattern: /utm_source=chatgpt/i },
  { id: "interne-dokumentation", label: "Interne Dokumentation", pattern: /interne Dokumentation/i },
  { id: "interner-entwurf", label: "Interner Entwurf", pattern: /interner Entwurf/i },
  { id: "todo", label: "TODO", pattern: /\bTODO\b/i },
  { id: "tbd", label: "TBD", pattern: /\bTBD\b/i },
  { id: "platzhalter", label: "Platzhalter", pattern: /Platzhalter/i },
  { id: "stand-offen", label: "Genauer Stand offen", pattern: /genauer Stand offen/i },
  { id: "nicht-final", label: "Nicht final", pattern: /nicht final/i },
  { id: "arbeitsfassung", label: "Arbeitsfassung", pattern: /Arbeitsfassung/i },
  { id: "entwurf", label: "Entwurf", pattern: /Entwurf/i },
  { id: "interne-quelle", label: "Direkter Hinweis auf interne Quellen", pattern: /interne (Quelle|Quellen|WÖk-Quellen|WOeK-Quellen)/i }
];

const REQUIRED_FIELDS = [
  "id",
  "slug",
  "title",
  "subtitle",
  "fileName",
  "filePath",
  "fileType",
  "fileSize",
  "pageCount",
  "estimatedReadingTime",
  "documentType",
  "status",
  "visibility",
  "audience",
  "level",
  "summaryShort",
  "whatToExpect",
  "keyQuestions",
  "topics",
  "methods",
  "impactFields",
  "relatedDocuments",
  "version",
  "date",
  "replaces",
  "replacedBy",
  "legalNotice",
  "editorialNote",
  "internalNote",
  "downloadAllowed",
  "previewAllowed"
];

const RESTORED_PUBLIC_BOOK_IDS = new Set([
  "nachhaltiges-marketing-mix",
  "nachhaltiger-einzelhandel",
  "nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen",
  "nachhaltigkeitstransformation-im-handwerk"
]);

const DOCUMENTS = [
  {
    id: "minifest-wirkungsoekonomie",
    slug: "minifest-wirkungsoekonomie",
    title: "Minifest Wirkungsökonomie",
    subtitle: "Sehr kurzer Einstieg in die Grundidee",
    fileName: "Minifest_Wirkungsoekonomie.pdf",
    filePath: "public/downloads/originals/Minifest_Wirkungsoekonomie.pdf",
    documentType: "kurzfassung",
    status: "aktuell",
    visibility: "public",
    audience: ["Einsteiger:innen", "Bürger:innen"],
    level: "einsteiger",
    summaryShort: "Sehr kurzer Einstieg in die Grundidee der Wirkungsökonomie.",
    whatToExpect: "Ein kompakter Einstieg in den Maßstabswechsel von Kapital zu Wirkung.",
    keyQuestions: ["Was meint Wirkung statt Kapital?", "Warum braucht es einen anderen Maßstab?"],
    topics: ["Grundlagen", "Customer Journey", "Wirkung statt Kapital"],
    methods: ["Begriffliche Orientierung"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["leitbild-mensch-planet-demokratie", "grundlagenpapier-wirkungsoekonomie"],
    version: "v1.0",
    date: "2026-05",
    editorialNote: "Als schneller Einstieg geeignet.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Empfohlener Einstieg",
    order: 10
  },
  {
    id: "leitbild-mensch-planet-demokratie",
    slug: "leitbild-mensch-planet-demokratie",
    title: "Leitbild für Mensch, Planet und Demokratie",
    subtitle: "Normativer Kompass der Wirkungsökonomie",
    fileName: "Leitbild für Mensch Planet und Demokratie.pdf",
    filePath: "public/downloads/originals/Leitbild für Mensch Planet und Demokratie.pdf",
    documentType: "leitbild",
    status: "aktuell",
    visibility: "public",
    audience: ["Einsteiger:innen", "Politik", "Bildung"],
    level: "einsteiger",
    summaryShort: "Verständliches Leitbild für die Ausrichtung auf Mensch, Planet und Demokratie.",
    whatToExpect: "Eine kurze normative Einordnung, warum Mensch, Planet und Demokratie gemeinsam betrachtet werden.",
    keyQuestions: ["Warum diese drei Bezugspunkte?", "Was heißt positive Netto-Wirkung?"],
    topics: ["Mensch-Planet-Demokratie", "Leitbild", "Positive Netto-Wirkung"],
    methods: ["Begriffliche Orientierung"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["minifest-wirkungsoekonomie", "woek-manifest"],
    version: "v1.0",
    date: "2026-05",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Grundlagen & Leitbild",
    order: 20
  },
  {
    id: "woek-manifest",
    slug: "woek-manifest",
    title: "WÖk-Manifest",
    subtitle: "Wirkung statt Kapital als programmatischer Aufruf",
    fileName: "WÖk-Manifest.pdf",
    filePath: "public/downloads/originals/WÖk-Manifest.pdf",
    documentType: "manifest",
    status: "aktuell",
    visibility: "public",
    audience: ["Einsteiger:innen", "Mitgestalter:innen"],
    level: "einsteiger",
    summaryShort: "Programmatischer Aufruf zur neuen Ordnung „Wirkung statt Kapital“.",
    whatToExpect: "Ein pointierter, normativer Text für Menschen, die die Grundidee schnell erfassen wollen.",
    keyQuestions: ["Warum reicht Kapital als Leitgröße nicht?", "Welche neue Richtung schlägt die WÖk vor?"],
    topics: ["Manifest", "Wirkung statt Kapital", "Mitgestaltung"],
    methods: ["Begriffliche Orientierung"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["minifest-wirkungsoekonomie", "leitbild-mensch-planet-demokratie"],
    version: "v1.0",
    date: "2026-05",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Grundlagen & Leitbild",
    order: 30
  },
  {
    id: "grundlagenpapier-wirkungsoekonomie",
    slug: "grundlagenpapier-wirkungsoekonomie",
    title: "Grundlagenpapier Wirkungsökonomie",
    subtitle: "Systematische Einführung in Prinzipien und Grundmodell",
    fileName: "Grundlagenpapier-Wirkungsökonomie WÖk.pdf",
    filePath: "public/downloads/originals/Grundlagenpapier-Wirkungsökonomie WÖk.pdf",
    documentType: "grundlagenpapier",
    status: "aktuell",
    visibility: "public",
    audience: ["Einsteiger:innen", "Fachöffentlichkeit", "Politik"],
    level: "fortgeschritten",
    summaryShort: "Systematische Einführung in Notwendigkeit, Prinzipien und Grundmodell der Wirkungsökonomie.",
    whatToExpect: "Eine längere Einführung, die die Grundlogik, Begriffe und Systemannahmen zusammenführt.",
    keyQuestions: ["Was ist die WÖk?", "Wie entstehen Bewertung und Rückkopplung?", "Wo liegen Schutzlinien?"],
    topics: ["Grundlagen", "Rückkopplung", "SDGs & SDG+"],
    methods: ["Scorecards", "Wirkungsrückkopplung"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["leitbild-mensch-planet-demokratie", "whitepaper-t-sroi"],
    version: "v1.0",
    date: "2026-05",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Grundlagen & Leitbild",
    order: 40
  },
  {
    id: "standardwerk-neue-ordnung-wohlstands-2026",
    slug: "standardwerk-neue-ordnung-wohlstands-2026",
    title: "Die neue Ordnung des Wohlstands",
    subtitle: "Standardwerk und Langfassung der Wirkungsökonomie",
    fileName: "Natalie-Weber_Die neue Ordnung des Wohlstands_2026.pdf",
    filePath: "assets/pdf/die-neue-ordnung-des-wohlstands.pdf",
    documentType: "standardwerk",
    status: "führend",
    visibility: "public",
    audience: ["Fachöffentlichkeit", "Wissenschaft", "Politik"],
    level: "expert",
    summaryShort: "Umfassendes Standardwerk und Langfassung der Wirkungsökonomie.",
    whatToExpect: "Eine fachlich dichte Langfassung mit Systemarchitektur, Begriffen, Wirkungsfeldern und politischer Einordnung.",
    keyQuestions: ["Wie hängt das Gesamtmodell zusammen?", "Welche Ordnungsidee steht hinter Wirkung statt Kapital?"],
    topics: ["Standardwerk", "Systemarchitektur", "Referenzfassung"],
    methods: ["Wirkungsarchitektur", "Wirkungsrückkopplung"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["grundlagenpapier-wirkungsoekonomie", "systemmodell-wirkungsoekonomie"],
    version: "2026",
    date: "2026",
    editorialNote: "Eigene Standardwerk-Seite verwenden; nicht als kleine Normalkachel behandeln.",
    internalNote: "Formale QA, Quellenstatus und Tracking-URLs prüfen.",
    downloadAllowed: true,
    previewAllowed: true,
    onlinePath: "referenz/",
    section: "Empfohlener Einstieg",
    order: 5
  },
  {
    id: "nachhaltiges-marketing-mix",
    slug: "nachhaltiges-marketing-mix",
    title: "Nachhaltiges Marketing-Mix",
    subtitle: "Agenda 2030 und SDGs im Marketing-Mix von Industrie und Handel",
    fileName: "nachhaltiges-marketing-mix.pdf",
    filePath: "assets/pdf/imported/nachhaltiges-marketing-mix.pdf",
    contentHtmlPath: "assets/data/document-online/nachhaltiges-marketing-mix.html",
    documentType: "buch",
    status: "aktuell",
    visibility: "public",
    audience: ["Unternehmen", "Marketing", "Handel", "Industrie"],
    level: "fortgeschritten",
    summaryShort: "Frühe Buchfassung zur Frage, wie Agenda 2030 und SDGs im Marketing-Mix von Industrie und Handel praktisch verankert werden können.",
    whatToExpect: "Online lesbarer Praxisleitfaden zu Produktentwicklung, Preisgestaltung, Platzierung, Promotion und dem fünften P Planet.",
    keyQuestions: ["Wie erweitert Planet den klassischen Marketing-Mix?", "Wie werden SDGs in Produkt-, Preis-, Vertriebs- und Kommunikationsentscheidungen übersetzt?"],
    topics: ["Marketing", "Nachhaltigkeit", "SDGs & SDG+", "5. P Planet", "Kreislaufwirtschaft"],
    methods: ["Scorecards", "Wirkungsrückkopplung", "SDGs & SDG+"],
    impactFields: ["Wirtschaft & Kapital", "Planet & Resilienz", "Öffentlichkeit & Wissen"],
    relatedDocuments: ["standardwerk-neue-ordnung-wohlstands-2026", "grundlagenpapier-wirkungsoekonomie", "wirkungsoekonomie-lieferkette"],
    version: "frühe Buchfassung",
    date: "2024",
    legalNotice: "Keine Rechts-, Steuer-, Anlage-, Kredit-, Versicherungs-, Förder- oder Unternehmensberatung.",
    editorialNote: "Wiederhergestellte öffentliche Online- und PDF-Fassung aus dem Bibliotheksbestand.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Bücher & Praxisleitfäden",
    order: 55
  },
  {
    id: "nachhaltiger-einzelhandel",
    slug: "nachhaltiger-einzelhandel",
    title: "Nachhaltiger Einzelhandel",
    subtitle: "Nachhaltigkeit, Verantwortung und Kreislaufwirtschaft im Handel",
    fileName: "nachhaltiger-einzelhandel.pdf",
    filePath: "assets/pdf/imported/nachhaltiger-einzelhandel.pdf",
    contentHtmlPath: "assets/data/document-online/nachhaltiger-einzelhandel.html",
    documentType: "buch",
    status: "aktuell",
    visibility: "public",
    audience: ["Handel", "Unternehmen", "Mittelstand"],
    level: "fortgeschritten",
    summaryShort: "Frühe Ausarbeitung dazu, wie Einzelhandel Nachhaltigkeit, Verantwortung, Kreislaufwirtschaft und konkrete Best Practices in Geschäftsmodelle übersetzen kann.",
    whatToExpect: "Online lesbarer Praxisleitfaden mit Schwerpunkt Handel, Kund:innenbeziehung, Kreislaufwirtschaft und Umsetzung.",
    keyQuestions: ["Wie kann Einzelhandel Nachhaltigkeit praktisch verankern?", "Welche Rolle spielen Sortiment, Lieferketten, Rücknahme und Kommunikation?"],
    topics: ["Einzelhandel", "Nachhaltigkeit", "Kreislaufwirtschaft", "Produkte & Konsum"],
    methods: ["Scorecards", "Wirkungsrückkopplung", "Produktwirkung"],
    impactFields: ["Wirtschaft & Kapital", "Produkte & Konsum", "Planet & Resilienz"],
    relatedDocuments: ["nachhaltiges-marketing-mix", "wirkungsoekonomie-lieferkette", "standardwerk-neue-ordnung-wohlstands-2026"],
    version: "frühe Buchfassung",
    date: "2023",
    legalNotice: "Keine Rechts-, Steuer-, Anlage-, Kredit-, Versicherungs-, Förder- oder Unternehmensberatung.",
    editorialNote: "Wiederhergestellte öffentliche Online- und PDF-Fassung aus dem Bibliotheksbestand.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Bücher & Praxisleitfäden",
    order: 56
  },
  {
    id: "nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen",
    slug: "nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen",
    title: "Nachhaltigkeitsstrategie für mittelständische Beratungsunternehmen",
    subtitle: "Agenda 2030, SDGs und ESG-Anforderungen in Beratungsunternehmen",
    fileName: "nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen.pdf",
    filePath: "assets/pdf/imported/nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen.pdf",
    contentHtmlPath: "assets/data/document-online/nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen.html",
    documentType: "buch",
    status: "aktuell",
    visibility: "public",
    audience: ["Beratungsunternehmen", "Mittelstand", "Unternehmen"],
    level: "fortgeschritten",
    summaryShort: "Frühe Ausarbeitung zur Umsetzung von Agenda 2030, SDGs und ESG-Anforderungen in mittelständischen Beratungsunternehmen.",
    whatToExpect: "Online lesbarer Praxisleitfaden zu Strategie, Organisation, Kund:innenanforderungen, Lieferanten, Berichtswesen und Umsetzung.",
    keyQuestions: ["Wie wird Nachhaltigkeit in Beratungsunternehmen organisatorisch verankert?", "Wie lassen sich SDGs und ESG-Anforderungen praktisch strukturieren?"],
    topics: ["Beratungsunternehmen", "Mittelstand", "SDGs & SDG+", "ESG", "Unternehmensstrategie"],
    methods: ["SDGs & SDG+", "Wirkungscontrolling", "Wirkungsrückkopplung"],
    impactFields: ["Wirtschaft & Kapital", "Öffentlichkeit & Wissen", "Planet & Resilienz"],
    relatedDocuments: ["nachhaltiges-marketing-mix", "grundlagenpapier-wirkungsoekonomie", "systemmodell-wirkungsoekonomie"],
    version: "frühe Buchfassung",
    date: "2023",
    legalNotice: "Keine Rechts-, Steuer-, Anlage-, Kredit-, Versicherungs-, Förder- oder Unternehmensberatung.",
    editorialNote: "Wiederhergestellte öffentliche Online- und PDF-Fassung aus dem Bibliotheksbestand.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Bücher & Praxisleitfäden",
    order: 57
  },
  {
    id: "nachhaltigkeitstransformation-im-handwerk",
    slug: "nachhaltigkeitstransformation-im-handwerk",
    title: "Nachhaltigkeitstransformation im Handwerk",
    subtitle: "Ein Leitfaden für kleine Betriebe",
    fileName: "nachhaltigkeitstransformation-im-handwerk.pdf",
    filePath: "assets/pdf/imported/nachhaltigkeitstransformation-im-handwerk.pdf",
    contentHtmlPath: "assets/data/document-online/nachhaltigkeitstransformation-im-handwerk.html",
    documentType: "buch",
    status: "aktuell",
    visibility: "public",
    audience: ["Handwerk", "Mittelstand", "Kleine Betriebe"],
    level: "fortgeschritten",
    summaryShort: "Frühe Ausarbeitung zur Nachhaltigkeitstransformation kleiner Handwerksbetriebe mit Blick auf gesetzliche Vorgaben, Kundenanforderungen, Lieferanten und betriebliche Umsetzung.",
    whatToExpect: "Online lesbarer Praxisleitfaden für Holz-, Elektro-, Bau- und Sanitärhandwerk mit Umsetzungs- und Checklistenlogik.",
    keyQuestions: ["Welche Nachhaltigkeitsanforderungen betreffen kleine Handwerksbetriebe?", "Wie können Betrieb, Kund:innenbeziehung und Lieferanten praktisch umgestellt werden?"],
    topics: ["Handwerk", "Mittelstand", "SDGs & SDG+", "Nachhaltigkeit", "Kleine Betriebe"],
    methods: ["SDGs & SDG+", "Wirkungsrückkopplung", "Datenqualität & Assurance"],
    impactFields: ["Wirtschaft & Kapital", "Alltag & Grundbedürfnisse", "Planet & Resilienz"],
    relatedDocuments: ["nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen", "nachhaltiges-marketing-mix", "leitbild-mensch-planet-demokratie"],
    version: "frühe Buchfassung",
    date: "2023",
    legalNotice: "Keine Rechts-, Steuer-, Anlage-, Kredit-, Versicherungs-, Förder- oder Unternehmensberatung.",
    editorialNote: "Wiederhergestellte öffentliche Online- und PDF-Fassung aus dem Bibliotheksbestand.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Bücher & Praxisleitfäden",
    order: 58
  },
  {
    id: "whitepaper-t-sroi",
    slug: "whitepaper-t-sroi",
    title: "Whitepaper T-SROI",
    subtitle: "Transformationswirkung und Systemhebel bewerten",
    fileName: "Whitepaper-T-SROI.pdf",
    filePath: "public/downloads/originals/Whitepaper-T-SROI.pdf",
    documentType: "whitepaper",
    status: "aktuell",
    visibility: "expert_public",
    audience: ["Unternehmen", "Wissenschaft", "Impact Controlling"],
    level: "fortgeschritten",
    summaryShort: "Fachliche Einführung in T-SROI als Transformationskennzahl und Impact-Controlling-Instrument.",
    whatToExpect: "Methodische Einordnung von T-SROI als Transformationswirkung und Systemhebel.",
    keyQuestions: ["Was unterscheidet T-SROI von operativen Kennzahlen?", "Wie werden Systemhebel sichtbar?"],
    topics: ["T-SROI", "Impact Controlling", "Transformationswirkung"],
    methods: ["T-SROI", "Impact Controlling"],
    impactFields: ["Wirtschaft & Kapital", "Demokratie"],
    relatedDocuments: ["grundlagenpapier-wirkungsoekonomie", "technische-leitlinien-wustg"],
    version: "v1.0",
    date: "2026-05",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Methoden & Werkzeuge",
    order: 110
  },
  {
    id: "arbeitspapier-doppelte-wesentlichkeit-impact-controlling",
    slug: "arbeitspapier-doppelte-wesentlichkeit-impact-controlling",
    title: "Doppelte Wesentlichkeit, Impact-Controlling und Wirkungsökonomie",
    subtitle: "Arbeitspapier zur Verbindung von CSRD/ESRS, IRO-Logik, Wirkungsdaten und Steuerung",
    fileName: "Arbeitspapier_Doppelte_Wesentlichkeit_Impact_Controlling_Wirkungsoekonomie.pdf",
    filePath: "public/downloads/originals/Arbeitspapier_Doppelte_Wesentlichkeit_Impact_Controlling_Wirkungsoekonomie.pdf",
    documentType: "working-paper",
    status: "arbeitsfassung",
    visibility: "expert_public",
    audience: ["Fachöffentlichkeit", "Unternehmen", "Nachhaltigkeit", "Controlling", "Marketing"],
    level: "expert",
    summaryShort: "Arbeitspapier zur doppelten Wesentlichkeit als Brücke von Berichtspflichten zu Impact-Controlling, Wirkungsdaten und wirkungsorientierter Steuerung.",
    whatToExpect: "Eine fachliche Einordnung, wie CSRD/ESRS, IROs, Impact Materiality, Financial Materiality, Key Impact Indicators und Impact-Marketing in eine steuerbare Wirkungsarchitektur übersetzt werden.",
    keyQuestions: [
      "Wie wird doppelte Wesentlichkeit von einer Berichtspflicht zu einer Steuerungslogik?",
      "Welche Rolle spielen Impact-Controlling, Impact-Management und Key Impact Indicators?",
      "Wie schützt Wirkungsökonomie vor Impact-Washing und bloßer Wirkungssimulation?"
    ],
    topics: ["Doppelte Wesentlichkeit", "Impact-Controlling", "Impact-Management", "Impact-Marketing", "CSRD", "ESRS", "IRO", "Wirkungsdaten"],
    methods: ["Wesentlichkeitsanalyse", "Impact-Controlling", "Key Impact Indicators", "Wirkungsdatenraum"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["whitepaper-t-sroi", "grundlagenpapier-wirkungsoekonomie", "woek-begriffsleitfaden-fuehrend"],
    version: "Arbeitsfassung 2026-06",
    date: "2026-06",
    legalNotice: "Keine Rechts-, Steuer-, Prüfungs-, Nachhaltigkeits-, Anlage- oder Unternehmensberatung.",
    editorialNote: "Als Arbeitspapier für PDF-Download, Website-Verankerung und Glossar-Erweiterung bereitgestellt.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Methoden & Werkzeuge",
    order: 112
  },
  {
    id: "technische-leitlinien-wustg",
    slug: "technische-leitlinien-wustg",
    title: "Technische Leitlinien WUStG",
    subtitle: "WÖk-IDs, Archetypen, Benchmarks, Scorecards und Assurance",
    fileName: "Technische_Leitlinien_WUStG_Vollversion_Extended_v2.pdf",
    filePath: "public/downloads/originals/Technische_Leitlinien_WUStG_Vollversion_Extended_v2.pdf",
    documentType: "technische-leitlinie",
    status: "fachoeffentlich",
    visibility: "expert_public",
    audience: ["Methodik", "Daten", "Pilotierung"],
    level: "technisch",
    summaryShort: "Technische Leitlinien zu WÖk-IDs, Archetypen, Benchmarks, Scorecards, Datenquellen und Assurance.",
    whatToExpect: "Technische Methodik für Datenquellen, Bewertungslogik und Qualitätssicherung.",
    keyQuestions: ["Welche Daten braucht die WÖk?", "Wie werden Scorecards methodisch abgesichert?"],
    topics: ["WÖk-IDs", "Datenqualität", "WUStG"],
    methods: ["WÖk-IDs", "Scorecards", "Datenqualität & Assurance"],
    impactFields: ["Daten & Infrastruktur", "Staat & Demokratie"],
    relatedDocuments: ["whitepaper-t-sroi", "woek-master-items-register"],
    version: "v2",
    date: "2026-05",
    legalNotice: "Fachliche Methodik. Nicht amtlich. Keine Rechts-, Steuer- oder Anlageberatung.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Technische Anlagen",
    order: 410
  },
  {
    id: "wirkungsrat-konzept",
    slug: "wirkungsrat-konzept",
    title: "Wirkungsrat Konzept",
    subtitle: "Institutionelle Verankerung von Prüfung, Lernen und Korrektur",
    fileName: "Wirkungsrat_Konzept.pdf",
    filePath: "public/downloads/originals/Wirkungsrat_Konzept.pdf",
    documentType: "konzept",
    status: "aktuell",
    visibility: "public",
    audience: ["Politik", "Verwaltung", "Fachöffentlichkeit"],
    level: "fortgeschritten",
    summaryShort: "Konzept zur institutionellen Verankerung des Wirkungsrats.",
    whatToExpect: "Ein Modell für demokratisch legitimierte Prüfung, Evaluation und Korrektur.",
    keyQuestions: ["Wer prüft Wirkung?", "Wie bleibt Bewertung lernfähig und rechtsstaatlich?"],
    topics: ["Wirkungsrat", "Evaluation", "Rechtsschutz"],
    methods: ["Wirkungsrat", "Evaluation"],
    impactFields: ["Staat & Demokratie"],
    relatedDocuments: ["grundlagenpapier-wirkungsoekonomie", "wstg-oktober-2025"],
    version: "v1.0",
    date: "2026-05",
    legalNotice: "Konzeptpapier. Nicht amtlich. Keine Rechts-, Steuer- oder Anlageberatung.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Recht & Steuerung",
    order: 210
  },
  {
    id: "wirkungsoekonomie-lieferkette",
    slug: "wirkungsoekonomie-lieferkette",
    title: "Wirkungsökonomie in der Lieferkette",
    subtitle: "Scorecards, Lieferkettenwirkung und Vorsteuerlogik",
    fileName: "Wirkungsökonomie in der Lieferkette.pdf",
    filePath: "public/downloads/originals/Wirkungsökonomie in der Lieferkette.pdf",
    documentType: "working-paper",
    status: "diskussionsfassung",
    visibility: "expert_public",
    audience: ["Unternehmen", "Beschaffung", "Lieferketten"],
    level: "fortgeschritten",
    summaryShort: "Anwendung der Wirkungsökonomie auf globale Lieferketten, Scorecards und Vorsteuerlogik.",
    whatToExpect: "Ein Working Paper zu Produkt- und Lieferkettenwirkung mit methodischen Annahmen.",
    keyQuestions: ["Wie wird Lieferkettenwirkung sichtbar?", "Welche Daten und Scorecards werden gebraucht?"],
    topics: ["Lieferkette", "Produktwirkung", "WUStG"],
    methods: ["Scorecards", "WÖk-IDs", "Wirkungsumsatzsteuer"],
    impactFields: ["Wirtschaft & Kapital", "Planet & Resilienz"],
    relatedDocuments: ["technische-leitlinien-wustg", "beispiel-apfel-wirkungssteuer"],
    version: "v1.0",
    date: "2026-05",
    legalNotice: "Diskussionsfassung. Nicht amtlich. Keine Rechts-, Steuer- oder Anlageberatung.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Wirkungsfelder",
    order: 320
  },
  {
    id: "beispiel-apfel-wirkungssteuer",
    slug: "beispiel-apfel-wirkungssteuer",
    title: "Beispiel Apfel Wirkungssteuer Bonusregel",
    subtitle: "Didaktisches Fallbeispiel zu Produktwirkung",
    fileName: "Beispiel_Apfel_Wirkungssteuer_Bonusregel.pdf",
    filePath: "content/internal-documents/originals/Beispiel_Apfel_Wirkungssteuer_Bonusregel.pdf",
    documentType: "fallbeispiel",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Einsteiger:innen", "Produktteams"],
    level: "einsteiger",
    summaryShort: "Fallbeispiel zur Wirkungssteuer anhand regionaler und importierter Äpfel.",
    whatToExpect: "Ein einfaches Produktbeispiel, das vor Veröffentlichung redaktionell bereinigt werden muss.",
    keyQuestions: ["Wie kann Produktwirkung modellhaft erklärt werden?"],
    topics: ["Produktwirkung", "Fallbeispiel", "Wirkungssteuer"],
    methods: ["Scorecards", "Wirkungsumsatzsteuer"],
    impactFields: ["Alltag & Grundbedürfnisse", "Planet & Resilienz"],
    relatedDocuments: ["wirkungsoekonomie-lieferkette"],
    version: "v1.0",
    date: "2026-05",
    internalNote: "Interne Referenzen entfernen oder durch öffentliche Quellen ersetzen.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Anwendungen & Fallbeispiele",
    order: 310
  },
  {
    id: "beispiel-konzern",
    slug: "beispiel-konzern",
    title: "Beispiel Konzern",
    subtitle: "Illustratives Modellbeispiel zu Produktscorecards",
    fileName: "Beispiel-Konzern.pdf",
    filePath: "content/internal-documents/originals/Beispiel-Konzern.pdf",
    documentType: "fallbeispiel",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Unternehmen", "Fachöffentlichkeit"],
    level: "fortgeschritten",
    summaryShort: "Beispiel zur Ableitung einer Produktscorecard aus CSRD-Daten.",
    whatToExpect: "Ein Modellbeispiel, das erst mit deutlichem Disclaimer öffentlich werden darf.",
    keyQuestions: ["Wie könnte aus CSRD-Daten eine Scorecard entstehen?"],
    topics: ["CSRD", "Produktscorecard", "Fallbeispiel"],
    methods: ["Scorecards", "Impact Controlling"],
    impactFields: ["Wirtschaft & Kapital"],
    relatedDocuments: ["technische-leitlinien-wustg"],
    version: "v1.0",
    date: "2026-05",
    internalNote: "Disclaimer ergänzen: illustratives Modellbeispiel, keine tatsächliche Unternehmensbewertung.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Anwendungen & Fallbeispiele",
    order: 315
  },
  {
    id: "systemmodell-wirkungsoekonomie",
    slug: "systemmodell-wirkungsoekonomie",
    title: "Systemmodell der Wirkungsökonomie",
    subtitle: "Umfangreiche Systemarchitektur Mensch-Planet-Demokratie",
    fileName: "Systemmodell-der-Wirkungsökonomie.pdf",
    filePath: "public/downloads/originals/Systemmodell-der-Wirkungsökonomie.pdf",
    documentType: "konzept",
    status: "fachoeffentlich",
    visibility: "expert_public",
    audience: ["Wissenschaft", "Methodik", "Pilotierung"],
    level: "expert",
    summaryShort: "Umfangreiches Systemmodell und Ordnungskarte Mensch-Planet-Demokratie.",
    whatToExpect: "Eine dichte Systemarchitektur mit vielen Querverbindungen, nicht als Einstieg gedacht.",
    keyQuestions: ["Wie ist die Wirkungsökonomie als Gesamtsystem aufgebaut?"],
    topics: ["Systemmodell", "Mensch-Planet-Demokratie", "Wirkungsarchitektur"],
    methods: ["Wirkungsarchitektur", "Evaluation"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["grundlagenpapier-wirkungsoekonomie", "standardwerk-neue-ordnung-wohlstands-2026"],
    version: "v1.0",
    date: "2026-05",
    editorialNote: "Eigene Landingpage mit Legende und Warnung umfangreiche Systemarchitektur.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Methoden & Werkzeuge",
    order: 120
  },
  {
    id: "wstg-oktober-2025",
    slug: "wstg-oktober-2025",
    title: "WStG Oktober 2025",
    subtitle: "Diskussionsfassung eines Wirkungssteuergesetzes",
    fileName: "WStG_Oktober2025.pdf",
    filePath: "public/downloads/originals/WStG_Oktober2025.pdf",
    documentType: "gesetzesentwurf",
    status: "diskussionsfassung",
    visibility: "expert_public",
    audience: ["Politik", "Verwaltung", "Jurist:innen"],
    level: "juristisch",
    summaryShort: "Working Paper zum Wirkungssteuergesetz mit Kommentaren und Begründungen.",
    whatToExpect: "Ein juristisch geprägtes Diskussionspapier, kein amtlicher Gesetzestext.",
    keyQuestions: ["Wie könnte Wirkung steuerlich geregelt werden?", "Welche Schutzlinien braucht ein Gesetz?"],
    topics: ["WStG", "Recht", "Steuerung"],
    methods: ["Wirkungssteuerung", "Wirkungsrat"],
    impactFields: ["Staat & Demokratie"],
    relatedDocuments: ["wirkungsrat-konzept", "technische-leitlinien-wustg"],
    version: "Oktober 2025",
    date: "2025-10",
    legalNotice: "Diskussionsfassung. Nicht amtlich. Keine Rechts-, Steuer- oder Anlageberatung.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Recht & Steuerung",
    order: 205
  },
  {
    id: "wp-produkte",
    slug: "wp-produkte",
    title: "WP Produkte",
    subtitle: "Arbeitspapier zur Produktbesteuerung durch Wirkung",
    fileName: "WP_Produkte.pdf",
    filePath: "content/internal-documents/originals/WP_Produkte.pdf",
    documentType: "working-paper",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Produktteams", "Fachöffentlichkeit"],
    level: "fortgeschritten",
    summaryShort: "Arbeitspapier zur Produktbesteuerung durch Wirkung.",
    whatToExpect: "Ein wichtiges Arbeitspapier, das vor Veröffentlichung bereinigt werden muss.",
    keyQuestions: ["Wie kann Produktwirkung in Preis- und Steuerlogik übersetzt werden?"],
    topics: ["Produktwirkung", "Wirkungssteuer", "Digitale Produktpässe"],
    methods: ["Scorecards", "WÖk-IDs"],
    impactFields: ["Wirtschaft & Kapital", "Planet & Resilienz"],
    relatedDocuments: ["wirkungsoekonomie-lieferkette"],
    version: "v1.0",
    date: "2025",
    internalNote: "Kritischer Cleanup: sichtbaren Satz „Soll ich jetzt den nächsten Abschnitt schreiben ...“ entfernen.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 900
  },
  {
    id: "wp-einkommen",
    slug: "wp-einkommen",
    title: "WP Einkommen",
    subtitle: "Arbeitspapier zur Wirkungseinkommensteuer",
    fileName: "WP_Einkommen.pdf",
    filePath: "content/internal-documents/originals/WP_Einkommen.pdf",
    documentType: "working-paper",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Politik", "Soziales", "Fachöffentlichkeit"],
    level: "juristisch",
    summaryShort: "Arbeitspapier zur Wirkungseinkommensteuer.",
    whatToExpect: "Ein fachliches Arbeitspapier, das redaktionelle Prüfung und rechtlichen Disclaimer braucht.",
    keyQuestions: ["Wie könnten Einkommen, Automatisierung und Wirkung gekoppelt werden?"],
    topics: ["Wirkungseinkommen", "Soziale Sicherung", "Recht"],
    methods: ["Wirkungssteuerung"],
    impactFields: ["Alltag & Grundbedürfnisse", "Staat & Demokratie"],
    relatedDocuments: ["wstg-oktober-2025"],
    version: "v1.0",
    date: "2025",
    legalNotice: "Entwurf. Keine Rechts-, Steuer- oder Sozialberatung.",
    internalNote: "Redaktionelle Prüfung und rechtlicher Disclaimer erforderlich.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 901
  },
  {
    id: "wp-wohnungsmarkt",
    slug: "wp-wohnungsmarkt",
    title: "WP Wohnungsmarkt",
    subtitle: "Working Paper zum Wohnungsmarkt aus Wirkungsperspektive",
    fileName: "WP_Wohnungsmarkt_.pdf",
    filePath: "content/internal-documents/originals/WP_Wohnungsmarkt_.pdf",
    documentType: "working-paper",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Wohnungswirtschaft", "Politik", "Fachöffentlichkeit"],
    level: "fortgeschritten",
    summaryShort: "Working Paper zum Wohnungsmarkt aus Wirkungsperspektive.",
    whatToExpect: "Ein Arbeitspapier, dessen Quellen, Zahlen und Status vor Veröffentlichung geprüft werden müssen.",
    keyQuestions: ["Wie wird Wohnwirkung sichtbar?"],
    topics: ["Wohnen", "Stadt", "Wohnwirkung"],
    methods: ["Wirkungsbewertung"],
    impactFields: ["Alltag & Grundbedürfnisse"],
    relatedDocuments: ["grundlagenpapier-wirkungsoekonomie"],
    version: "v1.0",
    date: "2025",
    internalNote: "Quellen, Zahlen und Status prüfen.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 902
  },
  {
    id: "wenn-maschinen-arbeiten",
    slug: "wenn-maschinen-arbeiten",
    title: "Wenn Maschinen arbeiten",
    subtitle: "Arbeitspapier zu Automatisierung und Wirkungseinkommen",
    fileName: "Wenn Maschinen arbeiten.pdf",
    filePath: "content/internal-documents/originals/Wenn Maschinen arbeiten.pdf",
    documentType: "working-paper",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Politik", "Arbeit", "Soziales"],
    level: "fortgeschritten",
    summaryShort: "Arbeitspapier zu Automatisierung, Wirkungseinkommen und gesellschaftlicher Sicherung.",
    whatToExpect: "Ein Arbeitspapier, das vor Veröffentlichung sichtbare Arbeitsprozess-Sätze bereinigen muss.",
    keyQuestions: ["Was passiert, wenn Maschinen Wertschöpfung übernehmen?"],
    topics: ["Automatisierung", "Wirkungseinkommen", "Arbeit"],
    methods: ["Automatisierungsdividende"],
    impactFields: ["Alltag & Grundbedürfnisse", "Wirtschaft & Kapital"],
    relatedDocuments: ["wp-einkommen"],
    version: "v1.0",
    date: "2025",
    internalNote: "Kritischer Cleanup: sichtbaren Satz „Möchtest du, dass ich jetzt Abschnitt ... schreibe“ entfernen.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 903
  },
  {
    id: "nats-woek-allgemein",
    slug: "nats-woek-allgemein",
    title: "NATS WÖk allgemein",
    subtitle: "Foliensatz zur Einführung in die Wirkungsökonomie",
    fileName: "NATS_WÖk@allgemein.pdf",
    filePath: "content/internal-documents/originals/NATS_WÖk@allgemein.pdf",
    documentType: "vortrag",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Einsteiger:innen", "Akademie"],
    level: "einsteiger",
    summaryShort: "Foliensatz zur Einführung in die Wirkungsökonomie.",
    whatToExpect: "Eine Präsentation, die nur nach visueller und redaktioneller Prüfung veröffentlicht werden sollte.",
    keyQuestions: ["Wie kann die WÖk vorgestellt werden?"],
    topics: ["Einführung", "Vortrag", "Akademie"],
    methods: ["Begriffliche Orientierung"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["minifest-wirkungsoekonomie"],
    version: "v1.0",
    date: "2026-05",
    internalNote: "Nur veröffentlichen, wenn als Vortrag/Folienseite kuratiert und visuell geprüft.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 904
  },
  {
    id: "woek-master-items-register",
    slug: "woek-master-items-register",
    title: "WÖk Master Items final v1.2",
    subtitle: "Technisches WÖk-ID- und Indikatorenregister",
    fileName: "WOeK_Master_Items_final_v1.2.pdf",
    filePath: "content/internal-documents/originals/WOeK_Master_Items_final_v1.2.pdf",
    documentType: "datenregister",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Methodik", "Daten", "Technik"],
    level: "technisch",
    summaryShort: "Technisches WÖk-ID- und Indikatorenregister.",
    whatToExpect: "Ein technisches Register, das nicht als normale Kachel veröffentlicht werden sollte.",
    keyQuestions: ["Welche Items und Indikatoren liegen der WÖk zugrunde?"],
    topics: ["WÖk-IDs", "Indikatoren", "Register"],
    methods: ["WÖk-IDs", "Datenqualität & Assurance"],
    impactFields: ["Daten & Infrastruktur"],
    relatedDocuments: ["technische-leitlinien-wustg"],
    version: "v1.2",
    date: "2025",
    internalNote: "Wenn öffentlich, eigene technische Register-Seite mit Einführung.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Technische Anlagen",
    order: 420
  },
  {
    id: "woek-master-items-xlsx",
    slug: "woek-master-items-xlsx",
    title: "WÖk Master Items final v1.2 XLSX",
    subtitle: "Interne technische Arbeits- und Datenfassung",
    fileName: "WOeK_Master_Items_final_v1.2.xlsx",
    filePath: "content/internal-documents/originals/WOeK_Master_Items_final_v1.2.xlsx",
    documentType: "datenregister",
    status: "intern",
    visibility: "internal",
    audience: ["Intern", "Methodik"],
    level: "technisch",
    summaryShort: "Interne technische Arbeits-/Datenfassung des WÖk-ID-Registers.",
    whatToExpect: "Interne Quelle für Datenimport und Methodik, nicht als öffentlicher Download.",
    keyQuestions: ["Welche Rohdaten liegen intern zugrunde?"],
    topics: ["WÖk-IDs", "Datenregister"],
    methods: ["WÖk-IDs"],
    impactFields: ["Daten & Infrastruktur"],
    relatedDocuments: ["woek-master-items-register"],
    version: "v1.2",
    date: "2025",
    internalNote: "Nicht öffentlich bereitstellen.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 905
  },
  {
    id: "woek-begriffsleitfaden-fuehrend",
    slug: "woek-begriffsleitfaden-fuehrend",
    title: "WÖk Begriffsleitfaden führend v1.0",
    subtitle: "Maßgebliche Sprachreferenz der Wirkungsökonomie",
    fileName: "WÖk_Begriffsleitfaden_fuehrend_v1.0.md",
    filePath: "content/internal-documents/originals/WÖk_Begriffsleitfaden_fuehrend_v1.0.md",
    documentType: "glossar",
    status: "führend",
    visibility: "review_required",
    audience: ["Redaktion", "Fachöffentlichkeit", "Akademie"],
    level: "fortgeschritten",
    summaryShort: "Führende Sprachreferenz für Begriffe wie Wirkung, positive Netto-Wirkung, SDG+ und MPD.",
    whatToExpect: "Ein redaktioneller Referenzrahmen für konsistente WÖk-Sprache; als Datei im aktuellen öffentlichen Bestand nicht freigegeben.",
    keyQuestions: ["Welche Begriffe sind maßgeblich?", "Welche Formulierungen sind zu vermeiden?"],
    topics: ["Begriffe", "Glossar", "Sprachregelwerk"],
    methods: ["Begriffliche Orientierung"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["grundlagenpapier-wirkungsoekonomie", "leitbild-mensch-planet-demokratie"],
    version: "v1.0",
    date: "2026-05-21",
    editorialNote: "Als führende Sprachreferenz markiert; öffentliche Dateifreigabe separat prüfen.",
    internalNote: "Im Release-/Fachbibliotheksregister genannt, aber nicht als freigegebene öffentliche Datei gefunden.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Technische Anlagen",
    order: 430
  },
  {
    id: "sexarbeit-als-soziale-infrastruktur",
    slug: "sexarbeit-als-soziale-infrastruktur",
    title: "Sexarbeit als soziale Infrastruktur",
    subtitle: "Grundlagen für eine funktionale und realitätsnahe Regulierung",
    fileName: "Sexarbeit als soziale Infrastruktur.docx",
    filePath: "/Users/hagen/Desktop/Nats/Sexarbeit als soziale Infrastruktur.docx",
    documentType: "konzept",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Politik", "Verwaltung", "Wissenschaft", "Sozialpolitik", "Gesundheit", "Recht", "Zivilgesellschaft"],
    level: "fortgeschritten / sensibel",
    summaryShort: "Reviewpflichtige interne Konzeptquelle zur funktionalen Perspektive auf Sexarbeit als ambivalente soziale Infrastruktur beziehungsweise soziale Versorgungsstruktur.",
    whatToExpect: "Executive Summary, Ausgangslage, Analyse, zentrale These, politische Konsequenzen und Fazit zur realitätsnahen Regulierung von Sexarbeit.",
    keyQuestions: ["Welche soziale Funktion kann Sexarbeit unter bestimmten Bedingungen erfüllen?", "Wie lassen sich Schutz vor Ausbeutung und Selbstbestimmung zugleich denken?", "Welche gesellschaftlichen Ursachen wie Einsamkeit, Isolation und ökonomische Ungleichheit müssen mitbetrachtet werden?"],
    topics: ["Sexarbeit", "soziale Infrastruktur", "soziale Versorgungsstruktur", "Nähe", "Intimität", "Einsamkeit", "Selbstbestimmung", "Schutz", "Regulierung"],
    methods: ["funktionale Wirkungsanalyse", "Schutzlinien", "Nichtkompensation"],
    impactFields: ["Mensch", "Demokratie", "Soziale Infrastruktur", "Arbeit, Körper & Selbstbestimmung"],
    relatedDocuments: ["standardwerk-neue-ordnung-wohlstands-2026", "systemmodell-wirkungsoekonomie"],
    version: "Reviewfassung",
    date: "2026-06-01",
    legalNotice: "Keine Rechts-, Sozial- oder Gesundheitsberatung.",
    editorialNote: "Nicht als roher DOCX-Download veröffentlichen. Vor öffentlicher Sichtbarkeit Metadaten, Status, Autorin, Stand, redaktionelle Freigabe und PDF/HTML-Fassung prüfen.",
    internalNote: "Primäre interne Konzeptquelle für die Erweiterung des Glossarbegriffs Sexarbeit.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Reviewpflichtige Konzepte",
    order: 431
  },
  {
    id: "illusionmaschine-buerokratieabbau",
    slug: "illusionmaschine-buerokratieabbau",
    title: "IllusionMaschine Bürokratieabbau",
    subtitle: "Projektgrundlage zu Bürokratie, Automatisierung und Steuerungslogik",
    fileName: "IllusionMaschine-Bürokratieabbau.pdf",
    filePath: "content/internal-documents/originals/IllusionMaschine-Bürokratieabbau.pdf",
    documentType: "working-paper",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Verwaltung", "Politik", "Fachöffentlichkeit"],
    level: "fortgeschritten",
    summaryShort: "Projektgrundlage zu Bürokratieabbau und Wirkungssteuerung.",
    whatToExpect: "Ein Alt-/Projektgrundlagen-Dokument, das vor Veröffentlichung fachlich und redaktionell geprüft werden muss.",
    keyQuestions: ["Welche Verwaltungslogik soll vereinfacht werden?", "Welche Schutzlinien braucht Automatisierung?"],
    topics: ["Bürokratie", "Verwaltung", "Automatisierung"],
    methods: ["Wirkungsrat", "Evaluation"],
    impactFields: ["Staat & Demokratie", "Öffentlichkeit & Wissen"],
    relatedDocuments: ["wirkungsrat-konzept", "systemmodell-wirkungsoekonomie"],
    version: "",
    date: "",
    internalNote: "Im Release-/Fachbibliotheksregister genannt, aber nicht als freigegebene öffentliche Datei gefunden.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 908
  },
  {
    id: "wp-rente",
    slug: "wp-rente",
    title: "WP Rente",
    subtitle: "Arbeitspapier zu Rente und sozialer Sicherung",
    fileName: "WP_Rente.pdf",
    filePath: "content/internal-documents/originals/WP_Rente.pdf",
    documentType: "working-paper",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Politik", "Soziales", "Fachöffentlichkeit"],
    level: "fortgeschritten",
    summaryShort: "Arbeitspapier zur wirkungsökonomischen Einordnung von Rente und sozialer Sicherung.",
    whatToExpect: "Ein größeres Arbeitspapier, dessen Quellen, Status und Schutzlinien vor Veröffentlichung geprüft werden müssen.",
    keyQuestions: ["Wie können Rente, Automatisierung und Wirkung zusammen gedacht werden?"],
    topics: ["Rente", "Soziale Sicherung", "Wirkungseinkommen"],
    methods: ["Wirkungsrente", "Wirkungseinkommen"],
    impactFields: ["Alltag & Grundbedürfnisse", "Staat & Demokratie"],
    relatedDocuments: ["wp-einkommen", "wstg-oktober-2025"],
    version: "",
    date: "",
    legalNotice: "Keine Rechts-, Steuer-, Förder- oder Anlageberatung.",
    internalNote: "Im Release-/Fachbibliotheksregister genannt, aber nicht als freigegebene öffentliche Datei gefunden.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 909
  },
  {
    id: "nachhaltigkeit-systemarchitektur",
    slug: "nachhaltigkeit-systemarchitektur",
    title: "Nachhaltigkeit Systemarchitektur",
    subtitle: "Projektgrundlage zur Nachhaltigkeit als Systemarchitektur",
    fileName: "Nachhaltigkeit-Systemarchitektur.pdf",
    filePath: "content/internal-documents/originals/Nachhaltigkeit-Systemarchitektur.pdf",
    documentType: "working-paper",
    status: "review-erforderlich",
    visibility: "review_required",
    audience: ["Fachöffentlichkeit", "Wissenschaft", "Methodik"],
    level: "expert",
    summaryShort: "Projektgrundlage zur systemischen Einordnung von Nachhaltigkeit.",
    whatToExpect: "Ein umfangreiches Grundlagenpapier, das vor Veröffentlichung kuratiert und statusklar eingeordnet werden muss.",
    keyQuestions: ["Wie wird Nachhaltigkeit als Systemarchitektur verstanden?", "Wie grenzt sich die WÖk davon ab?"],
    topics: ["Nachhaltigkeit", "Systemarchitektur", "Transformation"],
    methods: ["Wirkungsarchitektur", "SDGs & SDG+"],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["systemmodell-wirkungsoekonomie", "grundlagenpapier-wirkungsoekonomie"],
    version: "",
    date: "",
    internalNote: "Im Release-/Fachbibliotheksregister genannt, aber nicht als freigegebene öffentliche Datei gefunden.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 910
  },
  {
    id: "woek-partei",
    slug: "woek-partei",
    title: "WÖK-Partei",
    subtitle: "Politisches Programm, nicht Teil der neutralen Bibliothek",
    fileName: "WÖK-Partei.pdf",
    filePath: "content/internal-documents/originals/WÖK-Partei.pdf",
    documentType: "intern",
    status: "intern",
    visibility: "hidden",
    audience: ["Intern"],
    level: "fortgeschritten",
    summaryShort: "Grundsatzprogramm einer Partei.",
    whatToExpect: "Nicht in der neutralen Bibliothek der Wirkungsökonomie anzeigen.",
    keyQuestions: ["Nur separater politischer Kontext, falls gewollt."],
    topics: ["Politischer Kontext"],
    methods: [],
    impactFields: ["Staat & Demokratie"],
    relatedDocuments: [],
    version: "v1.0",
    date: "2026-05",
    internalNote: "Nicht in der neutralen Bibliothek anzeigen.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 906
  },
  {
    id: "faz-beitrag",
    slug: "faz-beitrag",
    title: "FAZ-Beitrag",
    subtitle: "Artikelentwurf Wirkung statt Kapital",
    fileName: "FAZ-Beitrag.docx",
    filePath: "content/internal-documents/originals/FAZ-Beitrag.docx",
    documentType: "essay",
    status: "intern",
    visibility: "internal",
    audience: ["Intern", "Redaktion"],
    level: "fortgeschritten",
    summaryShort: "Artikelentwurf „Wirkung statt Kapital“.",
    whatToExpect: "Interner Entwurf, nicht als DOCX-Download veröffentlichen.",
    keyQuestions: ["Soll später ein öffentlicher Journalartikel entstehen?"],
    topics: ["Debatte", "Essay"],
    methods: ["Begriffliche Orientierung"],
    impactFields: ["Öffentlichkeit & Wissen"],
    relatedDocuments: ["woek-manifest"],
    version: "Entwurf",
    date: "2026-05",
    internalNote: "Bei Freigabe als Journalartikel in HTML oder PDF finalisieren.",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 907
  },
  {
    id: "folgencheck-wirkungspolitische-sprache",
    slug: "folgencheck-wirkungspolitische-sprache",
    title: "Folgencheck statt Faktencheck",
    subtitle: "Wirkungsökonomische Analyse politischer Sprache am Beispiel des AfD-Regierungsprogramms Sachsen-Anhalt",
    fileName: "arbeitspapier_folgencheck_wirkungspolitische_sprache_v0_1.pdf",
    filePath: "assets/downloads/arbeitspapier_folgencheck_wirkungspolitische_sprache_v0_1.pdf",
    contentHtmlPath: "content/documents/online/folgencheck-wirkungspolitische-sprache.inc",
    documentType: "working-paper",
    status: "arbeitsfassung",
    visibility: "public",
    audience: ["Journalismus", "Politik", "Bildung", "Fachöffentlichkeit"],
    level: "fortgeschritten",
    summaryShort: "Arbeitspapier zum Folgencheck politischer Sprache: Es zeigt, warum Faktenprüfung durch eine vorsorgende Wirkungsprüfung von Frames, Narrativen und Resonanzräumen ergänzt werden muss.",
    whatToExpect: "Eine ausführliche Online- und PDF-Fassung mit Methode, Pilotkorpus, Frame-Analyse, Wirkungskarte, Gegenstrategien, Forschungsprogramm und Schutzlinien.",
    keyQuestions: [
      "Warum reicht ein Faktencheck bei politischer Sprache nicht aus?",
      "Welche Wirkungspotenziale öffnen Frames, Narrative und Feindbildkommunikation?",
      "Wie kann demokratische Sprache wirken, ohne problematische Frames zu spiegeln?"
    ],
    topics: ["Folgencheck", "Faktencheck", "Politische Sprache", "Frames", "Narrative", "AfD-Regierungsprogramm Sachsen-Anhalt", "Medien & Demokratie", "SDG+"],
    methods: ["Folgencheck", "Wirkungsanalyse", "Resonanzraumanalyse", "Wirkungspfad-Analyse"],
    impactFields: ["Demokratie", "Öffentlichkeit & Wissen", "Mensch"],
    relatedDocuments: ["faktencheck-folgencheck-v1-1", "grundlagenpapier-wirkungsoekonomie", "leitbild-mensch-planet-demokratie"],
    version: "v0.1",
    date: "2026-06-01",
    isLeadingReference: true,
    legalNotice: "Keine Wahlempfehlung, kein Rechtsgutachten, keine psychologische Diagnose und keine Bewertung einzelner Wähler:innen, Parteimitglieder oder Personen.",
    editorialNote: "Arbeitsfassung; Wirkungspotenziale politischer Sprache werden modellhaft und vorsorgend geprüft.",
    downloadAllowed: true,
    previewAllowed: true,
    section: "Essays & Debatte",
    order: 805
  }
];

const EXTRA_ARCHIVE = [
  {
    id: "die-neue-ordnung-des-wohlstands-2",
    slug: "die-neue-ordnung-des-wohlstands-2",
    title: "Die neue Ordnung des Wohlstands 2",
    subtitle: "Ältere Fassung des Standardwerks",
    fileName: "Die neue Ordnung des Wohlstands_2.pdf",
    filePath: "content/internal-documents/originals/Die neue Ordnung des Wohlstands_2.pdf",
    documentType: "standardwerk",
    status: "ersetzt",
    visibility: "archive",
    audience: ["Fachöffentlichkeit"],
    level: "expert",
    summaryShort: "Ältere Fassung, ersetzt durch die Fassung 2026.",
    whatToExpect: "Archivhinweis, nicht Hauptbibliothek.",
    keyQuestions: ["Welche ältere Fassung wurde ersetzt?"],
    topics: ["Archiv", "Standardwerk"],
    methods: [],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["standardwerk-neue-ordnung-wohlstands-2026"],
    version: "alt",
    date: "",
    replaces: [],
    replacedBy: "standardwerk-neue-ordnung-wohlstands-2026",
    legalNotice: "",
    editorialNote: "Nicht in Hauptbibliothek zeigen.",
    internalNote: "",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 950
  },
  {
    id: "whitepaper20",
    slug: "whitepaper20",
    title: "Whitepaper20",
    subtitle: "Ältere oder ersetzte Leitbild-/Whitepaper-Fassung",
    fileName: "Whitepaper20.pdf",
    filePath: "content/internal-documents/originals/Whitepaper20.pdf",
    documentType: "whitepaper",
    status: "ersetzt",
    visibility: "archive",
    audience: ["Fachöffentlichkeit"],
    level: "fortgeschritten",
    summaryShort: "Ältere Fassung, vermutlich durch aktuelles Leitbild ersetzt.",
    whatToExpect: "Archivhinweis, nicht Hauptbibliothek.",
    keyQuestions: ["Welche ältere Fassung wurde ersetzt?"],
    topics: ["Archiv", "Leitbild"],
    methods: [],
    impactFields: ["Mensch", "Planet", "Demokratie"],
    relatedDocuments: ["leitbild-mensch-planet-demokratie"],
    version: "alt",
    date: "",
    replaces: [],
    replacedBy: "leitbild-mensch-planet-demokratie",
    legalNotice: "",
    editorialNote: "Prüfen, ob durch aktuelles Leitbild ersetzt.",
    internalNote: "",
    downloadAllowed: false,
    previewAllowed: false,
    section: "Archiv",
    order: 951
  }
];

function ensureFields(doc) {
  const normalized = { ...doc };
  normalized.fileType = normalized.fileType || path.extname(normalized.fileName || normalized.filePath).replace(".", "").toLowerCase();
  normalized.fileSize = normalized.fileSize || "";
  normalized.pageCount = normalized.pageCount ?? null;
  normalized.estimatedReadingTime = normalized.estimatedReadingTime || "";
  normalized.replaces = normalized.replaces || [];
  normalized.replacedBy = normalized.replacedBy || "";
  normalized.legalNotice = normalized.legalNotice || "";
  normalized.editorialNote = normalized.editorialNote || "";
  normalized.internalNote = normalized.internalNote || "";
  for (const field of REQUIRED_FIELDS) {
    if (!(field in normalized)) {
      normalized[field] = Array.isArray(DOCUMENTS[0]?.[field]) ? [] : "";
    }
  }
  return normalized;
}

function rel(abs) {
  return path.relative(ROOT, abs).split(path.sep).join("/");
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function mkdir(fileOrDir) {
  fs.mkdirSync(fileOrDir, { recursive: true });
}

function write(file, content) {
  mkdir(path.dirname(file));
  fs.writeFileSync(file, content.replace(/[ \t]+$/gm, ""));
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function escapeHtml(input = "") {
  return String(input)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const relative = rel(abs);
    if (SKIP_PARTS.some((part) => `${relative}/`.includes(part))) continue;
    if (entry.isDirectory()) walk(abs, acc);
    if (entry.isFile() && DOCUMENT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) acc.push(abs);
  }
  return acc;
}

function fileSize(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) return "";
  const bytes = fs.statSync(abs).size;
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function pdfPageCount(relPath) {
  if (!relPath.toLowerCase().endsWith(".pdf") || !exists(relPath)) return null;
  try {
    const buffer = fs.readFileSync(path.join(ROOT, relPath));
    const text = buffer.toString("latin1");
    const matches = text.match(/\/Type\s*\/Page\b/g);
    return matches ? matches.length : null;
  } catch {
    return null;
  }
}

function readingTime(pageCount, fileType) {
  if (!pageCount) return fileType === "xlsx" ? "technisches Register" : "";
  const minutes = Math.max(5, Math.round(pageCount * 1.7));
  return `${minutes} Min.`;
}

function titleFromPath(relPath) {
  return path.basename(relPath, path.extname(relPath)).replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function inferType(relPath) {
  const s = relPath.toLowerCase();
  if (/manifest|minifest/.test(s)) return "manifest";
  if (/leitbild/.test(s)) return "leitbild";
  if (/gesetz|wstg|wustg|westg/.test(s)) return "gesetzesentwurf";
  if (/whitepaper/.test(s)) return "whitepaper";
  if (/register|master_items|master-items|xlsx|items/.test(s)) return "datenregister";
  if (/beispiel|fall/.test(s)) return "fallbeispiel";
  if (/leitlinie|method|scorecard|indikator|datenqualitaet|assurance/.test(s)) return "technische-leitlinie";
  if (/grundlagen|wohlstand|systemmodell/.test(s)) return "grundlagenpapier";
  if (/vortrag|folie|nats|pptx/.test(s)) return "vortrag";
  if (/essay|beitrag/.test(s)) return "essay";
  return "working-paper";
}

function inferStatus(relPath) {
  const s = relPath.toLowerCase();
  if (/intern/.test(s)) return "intern";
  if (/ersetzt|alt|archive|archiv|index 2| 2\.| 3\./.test(s)) return "archiv";
  if (/arbeitsfassung|entwurf|draft|v0/.test(s)) return "arbeitsfassung";
  if (/gesetz|wstg|wustg|westg/.test(s)) return "diskussionsfassung";
  return "review-erforderlich";
}

function inferVisibility(relPath, status) {
  if (/content\/internal-documents\//.test(relPath)) return "internal";
  if (status === "archiv" || status === "ersetzt") return "archive";
  if (status === "intern") return "internal";
  if (status === "arbeitsfassung" || status === "review-erforderlich") return "review_required";
  return "review_required";
}

function collectAllDocuments() {
  const files = walk(ROOT).map(rel).sort((a, b) => a.localeCompare(b, "de"));
  const curatedByFile = new Map([...DOCUMENTS, ...EXTRA_ARCHIVE].map((doc) => [doc.filePath, doc]));
  return files.map((relative) => {
    const curated = curatedByFile.get(relative);
    const fileType = path.extname(relative).replace(".", "").toLowerCase();
    const pageCount = pdfPageCount(relative);
    const base = curated ? ensureFields(curated) : {
      id: slugify(relative),
      slug: slugify(relative),
      title: titleFromPath(relative),
      subtitle: "",
      fileName: path.basename(relative),
      filePath: relative,
      fileType,
      fileSize: fileSize(relative),
      pageCount,
      estimatedReadingTime: readingTime(pageCount, fileType),
      documentType: inferType(relative),
      status: inferStatus(relative),
      visibility: inferVisibility(relative, inferStatus(relative)),
      audience: [],
      level: "fortgeschritten",
      summaryShort: "Inventarisierte Datei ohne redaktionelle Freigabe.",
      whatToExpect: "",
      keyQuestions: [],
      topics: [],
      methods: [],
      impactFields: [],
      relatedDocuments: [],
      version: "",
      date: "",
      replaces: [],
      replacedBy: "",
      legalNotice: "",
      editorialNote: "",
      internalNote: "Automatisch inventarisiert; redaktionelle Metadatenkarte fehlt.",
      downloadAllowed: false,
      previewAllowed: false
    };
    base.fileSize = fileSize(relative);
    base.pageCount = base.pageCount || pageCount;
    base.estimatedReadingTime = base.estimatedReadingTime || readingTime(base.pageCount, base.fileType);
    return base;
  });
}

function collectLinkRefs(paths) {
  const curatedPaths = new Set(model.map((doc) => doc.filePath));
  const pathsToCheck = paths.filter((p) =>
    curatedPaths.has(p) ||
    p.startsWith("public/downloads/originals/") ||
    p.startsWith("assets/pdf/")
  );
  const wanted = new Map(paths.map((p) => [p, []]));
  const basenameToPaths = new Map();
  for (const p of pathsToCheck) {
    const base = path.basename(p);
    if (!basenameToPaths.has(base)) basenameToPaths.set(base, []);
    basenameToPaths.get(base).push(p);
  }
  const scanExts = new Set([".html", ".md", ".js", ".mjs", ".json", ".yml", ".yaml"]);
  const scanFiles = [];
  function walkScan(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      const relative = rel(abs);
      if (SKIP_PARTS.some((part) => `${relative}/`.includes(part))) continue;
      if (relative.startsWith("assets/search/") || relative.startsWith("public/data/") || relative === "docs/site-inventory.md") continue;
      if (entry.isDirectory()) walkScan(abs);
      if (entry.isFile() && scanExts.has(path.extname(entry.name).toLowerCase())) scanFiles.push(abs);
    }
  }
  walkScan(ROOT);
  for (const abs of scanFiles) {
    const relative = rel(abs);
    const text = read(abs);
    for (const [base, matchingPaths] of basenameToPaths.entries()) {
      if (!text.includes(base) && !text.includes(encodeURI(base))) continue;
      for (const p of matchingPaths) {
        if (text.includes(base) || text.includes(p) || text.includes(encodeURI(p))) {
          const refs = wanted.get(p);
          if (refs.length < 12) refs.push(relative);
        }
      }
    }
  }
  return wanted;
}

function extractText(relPath) {
  if (!exists(relPath)) return "";
  const abs = path.join(ROOT, relPath);
  const ext = path.extname(relPath).toLowerCase();
  try {
    if (ext === ".md" || ext === ".html" || ext === ".json" || ext === ".txt") return read(abs);
    if (ext === ".docx") {
      return execFileSync("unzip", ["-p", abs, "word/document.xml"], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 })
        .replace(/<[^>]+>/g, " ");
    }
    if (ext === ".pdf") {
      return execFileSync("strings", [abs], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
    }
  } catch {
    return "";
  }
  return "";
}

function auditDocuments(curatedDocs) {
  const findings = [];
  for (const doc of curatedDocs) {
    if (!PUBLIC_VISIBILITIES.has(doc.visibility) && !ARCHIVE_VISIBILITIES.has(doc.visibility)) continue;
    const text = extractText(doc.filePath);
    const haystack = `${doc.title}\n${doc.subtitle}\n${doc.summaryShort}\n${doc.whatToExpect}\n${doc.legalNotice}\n${text}`;
    for (const rule of AUDIT_PATTERNS) {
      const match = haystack.match(rule.pattern);
      if (match) {
        findings.push({
          documentId: doc.id,
          title: doc.title,
          filePath: doc.filePath,
          issue: rule.label,
          excerpt: haystack.slice(Math.max(0, match.index - 60), match.index + 140).replace(/\s+/g, " ").trim()
        });
      }
    }
    if (!/Natalie Weber|Autorin|Weber, Natalie/i.test(haystack)) {
      findings.push({ documentId: doc.id, title: doc.title, filePath: doc.filePath, issue: "fehlende Autorin", excerpt: "Keine Autorin-Angabe im extrahierten Text/Metadaten gefunden." });
    }
    if (!/(Stand|Datum|202[0-9]|Version|v\d)/i.test(haystack)) {
      findings.push({ documentId: doc.id, title: doc.title, filePath: doc.filePath, issue: "fehlender Stand / Datum", excerpt: "Kein Stand, Datum oder Version im extrahierten Text/Metadaten gefunden." });
    }
    if (!/(Status|aktuell|führend|fuehrend|fachoeffentlich|Diskussionsfassung|Arbeitsfassung)/i.test(haystack)) {
      findings.push({ documentId: doc.id, title: doc.title, filePath: doc.filePath, issue: "fehlender Status", excerpt: "Kein Statushinweis im extrahierten Text/Metadaten gefunden." });
    }
    const needsDisclaimer = doc.documentType === "gesetzesentwurf" || /(steuer|recht|kredit|anlage|finanz|versicherung|förder|foerder)/i.test(`${doc.title} ${doc.topics.join(" ")} ${doc.methods.join(" ")}`);
    if (needsDisclaimer && !/Keine Rechts-|Keine Steuer|Nicht amtlich|keine Anlageberatung|Keine .*beratung/i.test(haystack)) {
      findings.push({ documentId: doc.id, title: doc.title, filePath: doc.filePath, issue: "fehlender Disclaimer bei Rechts-/Steuer-/Finanzthema", excerpt: "Erforderlicher Disclaimer fehlt oder ist nicht eindeutig auffindbar." });
    }
  }
  return findings;
}

function applyAuditGate(curatedDocs, findings) {
  const blockingIssues = new Set([
    "Arbeitsprozess-Satz: Soll ich",
    "Arbeitsprozess-Satz: Möchtest du",
    "ChatGPT-Hinweis",
    "Tracking-URL chatgpt",
    "Interne Dokumentation",
    "Interner Entwurf",
    "TODO",
    "TBD",
    "Platzhalter",
    "Genauer Stand offen",
    "Nicht final",
    "Direkter Hinweis auf interne Quellen",
    "fehlender Disclaimer bei Rechts-/Steuer-/Finanzthema"
  ]);
  const affected = new Set(findings.filter((finding) => blockingIssues.has(finding.issue)).map((finding) => finding.documentId));
  return curatedDocs.map((doc) => {
    const next = ensureFields(doc);
    if (next.id === "standardwerk-neue-ordnung-wohlstands-2026") {
      next.status = "führend";
      next.visibility = "public";
      next.downloadAllowed = true;
      next.previewAllowed = true;
      next.onlinePath = next.onlinePath || "referenz/";
      return next;
    }
    if (RESTORED_PUBLIC_BOOK_IDS.has(next.id)) {
      next.status = next.status || "aktuell";
      next.visibility = "public";
      next.downloadAllowed = true;
      next.previewAllowed = true;
      return next;
    }
    if (affected.has(next.id) && next.visibility !== "archive") {
      next.status = "review-erforderlich";
      next.visibility = "review_required";
      next.downloadAllowed = false;
      next.previewAllowed = next.id === "standardwerk-neue-ordnung-wohlstands-2026";
      next.editorialNote = `${next.editorialNote ? `${next.editorialNote} ` : ""}Automatischer Red-Flag-Audit verlangt Review vor Download-Freigabe.`.trim();
    }
    return next;
  });
}

function chips(items, limit = 4) {
  return (items || []).slice(0, limit).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

function badge(value, prefix = "") {
  return `<span class="status-badge status-badge--${slugify(value)}">${escapeHtml(prefix ? `${prefix}: ${value}` : value)}</span>`;
}

function documentUrl(doc, prefix = "") {
  return `${prefix}bibliothek/${doc.slug}/`;
}

function downloadHref(doc, prefix = "") {
  if (!doc.downloadAllowed || !PUBLIC_VISIBILITIES.has(doc.visibility)) return "";
  const ext = path.extname(doc.filePath || doc.fileName || "").toLowerCase();
  if (NON_PUBLIC_FILE_EXTENSIONS.has(ext)) return "";
  return `${prefix}${doc.filePath}`;
}

function onlineHref(doc, prefix = "") {
  if (doc.contentHtmlPath && fs.existsSync(path.join(ROOT, doc.contentHtmlPath))) return "#onlinefassung";
  if (doc.onlinePath) return `${prefix}${doc.onlinePath}`;
  const candidate = path.join(ROOT, "dokumente", doc.slug || "", "index.html");
  if (fs.existsSync(candidate)) return `${prefix}dokumente/${doc.slug}/`;
  return "";
}

function card(doc, prefix = "") {
  return `<article class="document-card" data-document-card data-type="${escapeHtml(doc.documentType)}" data-status="${escapeHtml(doc.status)}" data-level="${escapeHtml(doc.level)}" data-audience="${escapeHtml(doc.audience.join(" "))}" data-topics="${escapeHtml(doc.topics.join(" "))}" data-methods="${escapeHtml(doc.methods.join(" "))}" data-fields="${escapeHtml(doc.impactFields.join(" "))}" data-order="${Number(doc.order || 999)}" data-date="${escapeHtml(doc.date || "")}" data-pages="${Number(doc.pageCount || 0)}">
    <div class="document-card-badges">${badge(doc.documentType)}${badge(doc.status)}${badge(doc.level, "Niveau")}</div>
    <h3>${escapeHtml(doc.title)}</h3>
    <p>${escapeHtml(doc.summaryShort)}</p>
    <dl class="document-card-meta"><dt>Umfang</dt><dd>${escapeHtml([doc.pageCount ? `${doc.pageCount} Seiten` : "", doc.estimatedReadingTime, doc.fileType?.toUpperCase()].filter(Boolean).join(" · ") || "Umfang offen")}</dd></dl>
    <div class="document-chip-row">${chips(doc.audience, 4)}</div>
    <div class="document-chip-row muted">${chips(doc.topics, 4)}</div>
    <a class="btn btn-primary" href="${documentUrl(doc, prefix)}">Dokument ansehen</a>
  </article>`;
}

function layout({ title, description, body, prefix = "" }) {
  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_title" content="${escapeHtml(title)}">
    <meta name="search_description" content="${escapeHtml(description)}">
    <meta name="search_section" content="Bibliothek">
    <meta name="search_type" content="Dokument">
    <link rel="stylesheet" href="${prefix}assets/css/style.css?v=20260603-library-reader-wide">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${prefix}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${prefix}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude>
        <a href="${prefix}index.html" data-nav-match="index.html">Start</a>
        <a href="${prefix}verstehen.html" data-nav-match="verstehen.html|wirkungsoekonomie.html|wirkungsoekonomie/|verstehen/">Verstehen</a>
        <a href="${prefix}wirkungsfelder/" data-nav-match="wirkungsfelder/|anwendungen.html">Wirkungsfelder</a>
        <a href="${prefix}werkzeuge/" data-nav-match="werkzeuge/|tools/|methodik/|workflow.html">Methoden &amp; Werkzeuge</a>
        <a href="${prefix}erleben/" data-nav-match="erleben.html|erleben/|ausprobieren/">Erleben</a>
        <a href="${prefix}akademie.html" data-nav-match="akademie.html|akademie/">Akademie</a>
        <a href="${prefix}downloads.html" data-nav-match="bibliothek/|downloads.html|dokumente/|referenz/|buch.html">Bibliothek</a>
        <a href="${prefix}mitmachen.html" data-nav-match="mitmachen.html|mitmachen/|fuer/">Mitmachen</a>
        <a href="${prefix}suche.html" data-nav-match="suche.html">Suche</a>
      </nav>
    </header>
    <main data-pagefind-body>
${body}
    </main>
    <script src="${prefix}assets/js/main.js"></script>
  </body>
</html>
`;
}

function libraryPage(publicDocs, archiveDocs, prefix = "") {
  const sections = [
    "Empfohlener Einstieg",
    "Grundlagen & Leitbild",
    "Methoden & Werkzeuge",
    "Recht & Steuerung",
    "Anwendungen & Fallbeispiele",
    "Wirkungsfelder",
    "Essays & Debatte",
    "Technische Anlagen"
  ];
  const options = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "de")).map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("");
  const allTopics = publicDocs.flatMap((doc) => doc.topics);
  const allMethods = publicDocs.flatMap((doc) => doc.methods);
  const allFields = publicDocs.flatMap((doc) => doc.impactFields);
  const sectionHtml = sections.map((section) => {
    const docs = publicDocs.filter((doc) => doc.section === section);
    if (!docs.length) return "";
    return `<section class="section document-library-section" id="${slugify(section)}">
      <div class="section-header">
        <p class="hero-kicker">${escapeHtml(section)}</p>
        <h2>${escapeHtml(section)}</h2>
      </div>
      <div class="document-card-grid">${docs.map((doc) => card(doc, prefix)).join("\n")}</div>
    </section>`;
  }).join("\n");
  const path = (title, summary, ids) => {
    const docs = ids.map((id) => publicDocs.find((doc) => doc.id === id)).filter(Boolean);
    return `<article class="document-reading-path"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(summary)}</p><ol>${docs.map((doc) => `<li><a href="${documentUrl(doc, prefix)}">${escapeHtml(doc.title)}</a></li>`).join("")}</ol></article>`;
  };
  const body = `
      <section class="hero compact-hero document-library-hero">
        <p class="hero-kicker">Geführte Wissensbibliothek</p>
        <h1>Dokumente nach Art, Status und Reifegrad</h1>
        <p class="hero-subtitle">Jede Kachel sagt vor dem Klick, ob du eine Kurzfassung, ein Manifest, ein Whitepaper, ein Working Paper, ein technisches Register, ein Fallbeispiel oder einen Gesetzesentwurf öffnest und welchen Veröffentlichungsstatus das Dokument hat.</p>
      </section>
      <section class="section document-library-controls" data-search-exclude>
        <div class="document-filter-grid">
          <label>Dokumentart<select data-document-filter="type"><option value="">Alle</option>${options(publicDocs.map((doc) => doc.documentType))}</select></label>
          <label>Status<select data-document-filter="status"><option value="">Alle</option>${options(publicDocs.map((doc) => doc.status))}</select></label>
          <label>Zielgruppe<select data-document-filter="audience"><option value="">Alle</option>${options(publicDocs.flatMap((doc) => doc.audience))}</select></label>
          <label>Niveau<select data-document-filter="level"><option value="">Alle</option>${options(publicDocs.map((doc) => doc.level))}</select></label>
          <label>Thema<select data-document-filter="topic"><option value="">Alle</option>${options(allTopics)}</select></label>
          <label>Methode<select data-document-filter="method"><option value="">Alle</option>${options(allMethods)}</select></label>
          <label>Wirkungsfeld<select data-document-filter="field"><option value="">Alle</option>${options(allFields)}</select></label>
          <label>Sortierung<select data-document-sort><option value="editorial">Redaktionelle Reihenfolge</option><option value="date">Datum</option><option value="pages">Umfang</option><option value="level">Niveau</option></select></label>
        </div>
      </section>
      <section class="section section-muted">
        <div class="section-header">
          <p class="hero-kicker">Lesepfade</p>
          <h2>Kuratierte Wege statt Dateiablage</h2>
        </div>
        <div class="document-reading-path-grid">
          ${path("Einstieg in 30 Minuten", "Vom schnellen Einstieg zum Leitbild und Grundmodell.", ["minifest-wirkungsoekonomie", "leitbild-mensch-planet-demokratie", "grundlagenpapier-wirkungsoekonomie"])}
          ${path("Für Unternehmen", "Von Grundlagen über T-SROI und Lieferketten zu technischer Methodik.", ["grundlagenpapier-wirkungsoekonomie", "whitepaper-t-sroi", "wirkungsoekonomie-lieferkette", "technische-leitlinien-wustg"])}
          ${path("Für Politik und Verwaltung", "Recht, Wirkungshaushalt, Wirkungsrat und Schutzlinien.", ["grundlagenpapier-wirkungsoekonomie", "wstg-oktober-2025", "wirkungsrat-konzept"])}
          ${path("Für Wissenschaft und Methodik", "Systemarchitektur, T-SROI und technische Leitlinien.", ["systemmodell-wirkungsoekonomie", "whitepaper-t-sroi", "technische-leitlinien-wustg"])}
          ${path("Für Bürger:innen", "Kurz und verständlich starten.", ["minifest-wirkungsoekonomie", "leitbild-mensch-planet-demokratie", "woek-manifest"])}
        </div>
      </section>
      ${sectionHtml}
      <section class="section document-library-section" id="archiv">
        <div class="section-header">
          <p class="hero-kicker">Archiv</p>
          <h2>Ältere und ersetzte Fassungen</h2>
          <p>Archivdokumente werden nicht in der Hauptbibliothek beworben. Sie bleiben als Statusnachweis eingeordnet, aber nicht als aktueller Einstieg.</p>
        </div>
        <div class="document-card-grid">${archiveDocs.map((doc) => card(doc, prefix)).join("\n")}</div>
      </section>`;
  const script = `<script data-search-exclude>
(() => {
  const cards = Array.from(document.querySelectorAll("[data-document-card]"));
  const filters = Array.from(document.querySelectorAll("[data-document-filter]"));
  const sort = document.querySelector("[data-document-sort]");
  const matches = (card, key, value) => {
    if (!value) return true;
    if (key === "type") return card.dataset.type === value;
    if (key === "status") return card.dataset.status === value;
    if (key === "level") return card.dataset.level === value;
    if (key === "audience") return (card.dataset.audience || "").includes(value);
    if (key === "topic") return (card.dataset.topics || "").includes(value);
    if (key === "method") return (card.dataset.methods || "").includes(value);
    if (key === "field") return (card.dataset.fields || "").includes(value);
    return true;
  };
  const apply = () => {
    const active = Object.fromEntries(filters.map((input) => [input.dataset.documentFilter, input.value]));
    cards.forEach((card) => {
      card.hidden = !Object.entries(active).every(([key, value]) => matches(card, key, value));
    });
    const sorter = sort?.value || "editorial";
    document.querySelectorAll(".document-card-grid").forEach((grid) => {
      const local = Array.from(grid.querySelectorAll("[data-document-card]"));
      local.sort((a, b) => {
        if (sorter === "date") return (b.dataset.date || "").localeCompare(a.dataset.date || "");
        if (sorter === "pages") return Number(a.dataset.pages || 0) - Number(b.dataset.pages || 0);
        if (sorter === "level") return (a.dataset.level || "").localeCompare(b.dataset.level || "");
        return Number(a.dataset.order || 999) - Number(b.dataset.order || 999);
      }).forEach((card) => grid.appendChild(card));
    });
  };
  filters.forEach((input) => input.addEventListener("change", apply));
  sort?.addEventListener("change", apply);
  apply();
})();
</script>`;
  return layout({
    title: "Bibliothek | Geführte Wissensbibliothek der Wirkungsökonomie",
    description: "Kuratierte Dokumentenbibliothek der Wirkungsökonomie mit Dokumentart, Status, Niveau, Zielgruppe, Lesepfaden und Schutzlinien.",
    body: `${body}${script}`,
    prefix
  });
}

function detailPage(doc, prefix = "../../") {
  const href = downloadHref(doc, prefix);
  const online = onlineHref(doc, prefix);
  const related = (doc.relatedDocuments || []).map((id) => model.find((item) => item.id === id)).filter(Boolean);
  const onlineContent = doc.contentHtmlPath && fs.existsSync(path.join(ROOT, doc.contentHtmlPath))
    ? read(path.join(ROOT, doc.contentHtmlPath))
    : "";
  const statusNotice = ["diskussionsfassung", "arbeitsfassung"].includes(doc.status)
    ? `<div class="callout"><strong>Statushinweis:</strong> Dieses Dokument ist eine Arbeits- bzw. Diskussionsfassung und kann sich ändern.</div>`
    : "";
  const expertNotice = doc.level === "expert"
    ? `<div class="callout"><strong>Hinweis:</strong> Dieses Dokument ist fachlich dicht und nicht als Einstieg gedacht.</div>`
    : "";
  const legalNotice = doc.legalNotice
    ? `<div class="callout warning"><strong>Schutzlinie:</strong> ${escapeHtml(doc.legalNotice)}</div>`
    : "";
  const leadingNotice = doc.id === "folgencheck-wirkungspolitische-sprache"
    ? `<div class="callout"><strong>Führende Dokumentseite:</strong> Diese Bibliotheksseite ist die vollständige Arbeitsfassung zum Folgencheck politischer Sprache. Die ältere Seite <a class="text-link" href="../../werkstatt/arbeitsbibliothek/whitepaper/faktencheck-folgencheck/">Faktencheck und Folgencheck - Methodenseite</a> dient als methodischer Kurzüberblick und verweist hierher.</div>`
    : "";
  const actionLinks = [
    online ? `<a class="btn btn-secondary" href="${online}">Onlinefassung lesen</a>` : "",
    href ? `<a class="btn btn-primary" href="${href}">PDF öffnen</a>` : ""
  ].filter(Boolean);
  const downloadBlock = actionLinks.length
    ? `<div class="document-action-row">${actionLinks.join("")}</div>`
    : `<p class="document-restricted">Kein öffentlicher Download: Dieses Dokument ist ${escapeHtml(doc.status)} und wird nicht direkt verlinkt.</p>`;
  const body = `
      <section class="hero compact-hero document-detail-hero">
        <p class="hero-kicker">${doc.isLeadingReference ? "führende dokumentseite · " : ""}${escapeHtml(doc.documentType)} · ${escapeHtml(doc.status)}</p>
        <h1>${escapeHtml(doc.title)}</h1>
        <p class="hero-subtitle">${escapeHtml(doc.subtitle)}</p>
        <div class="document-card-badges">${badge(doc.documentType)}${badge(doc.status)}${badge(doc.level, "Niveau")}</div>
      </section>
      <section class="section document-detail-grid">
        <article class="document-detail-main">
          ${statusNotice}
          ${expertNotice}
          ${leadingNotice}
          ${legalNotice}
          <h2>Kurz gesagt</h2>
          <p>${escapeHtml(doc.summaryShort)}</p>
          <h2>Was dich erwartet</h2>
          <p>${escapeHtml(doc.whatToExpect || "Redaktionelle Einordnung folgt.")}</p>
          <h2>Welche Fragen beantwortet das Dokument?</h2>
          <ul>${(doc.keyQuestions || []).map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
          <h2>Für wen geeignet?</h2>
          <p>${escapeHtml((doc.audience || []).join(", ") || "Fachöffentlichkeit")}</p>
          <h2>Was dieses Dokument nicht ist</h2>
          <p>Dieses Dokument ist keine Personenbewertung, keine automatische Entscheidung und keine Rechts-, Steuer-, Kredit-, Förder-, Versicherungs- oder Anlageberatung. Modellhafte Aussagen sind nicht amtlich.</p>
          <h2>Inhaltsüberblick</h2>
          <p>${escapeHtml((doc.topics || []).join(", ") || "Inhaltsüberblick in Vorbereitung.")}</p>
          ${onlineContent ? `<section id="onlinefassung" class="document-online-section"><h2>Onlinefassung</h2><div class="readable-prose document-online-text">${onlineContent}</div></section>` : ""}
          <h2>Verwandte Inhalte</h2>
          <ul>${related.map((item) => `<li><a href="../${item.slug}/">${escapeHtml(item.title)}</a></li>`).join("") || "<li>Keine verwandten Dokumente hinterlegt.</li>"}</ul>
        </article>
        <aside class="document-detail-aside" data-search-exclude>
          <dl>
            <dt>Dokumentart</dt><dd>${escapeHtml(doc.documentType)}</dd>
            <dt>Status</dt><dd>${escapeHtml(doc.status)}</dd>
            <dt>Umfang</dt><dd>${escapeHtml([doc.pageCount ? `${doc.pageCount} Seiten` : "", doc.estimatedReadingTime, doc.fileType?.toUpperCase()].filter(Boolean).join(" · ") || "offen")}</dd>
            <dt>Stand / Version</dt><dd>${escapeHtml([doc.date, doc.version].filter(Boolean).join(" · ") || "offen")}</dd>
            <dt>Zielgruppe</dt><dd>${escapeHtml((doc.audience || []).join(", "))}</dd>
            <dt>Niveau</dt><dd>${escapeHtml(doc.level)}</dd>
          </dl>
          <div class="document-chip-row">${chips(doc.topics, 8)}</div>
          ${downloadBlock}
          <a class="text-link" href="../">Zur Bibliothek</a>
        </aside>
      </section>`;
  return layout({
    title: `${doc.title} | Bibliothek der Wirkungsökonomie`,
    description: doc.summaryShort,
    body,
    prefix
  });
}

function sanitizePublicPages(curatedDocs) {
  const nonPublic = curatedDocs.filter((doc) => NON_PUBLIC_VISIBILITIES.has(doc.visibility) || !doc.downloadAllowed);
  const files = [];
  function walkHtml(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      const relative = rel(abs);
      if (SKIP_PARTS.some((part) => `${relative}/`.includes(part))) continue;
      if (entry.isDirectory()) walkHtml(abs);
      if (entry.isFile() && /\.(html|json)$/i.test(entry.name) && /^(public\/data|assets\/data|dokumente|referenz|downloads|bibliothek)\//.test(relative)) files.push(abs);
    }
  }
  walkHtml(ROOT);
  const replacements = [];
  for (const abs of files) {
    let html = read(abs);
    const before = html;
    for (const doc of nonPublic) {
      const publicOriginal = `public/downloads/originals/${doc.fileName}`;
      const escaped = publicOriginal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const encoded = encodeURI(publicOriginal).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const replacement = `/bibliothek/${doc.slug}/`;
      html = html
        .replace(new RegExp(`(\\.\\./)*${escaped}`, "g"), replacement)
        .replace(new RegExp(`(\\.\\./)*${encoded}`, "g"), replacement);
    }
    if (html !== before) {
      fs.writeFileSync(abs, html);
      replacements.push(rel(abs));
    }
  }
  return replacements;
}

function writeInventory(allDocs, linkRefs) {
  const rows = allDocs.map((doc) => {
    const refs = linkRefs.get(doc.filePath) || [];
    const publicPath = /^(assets|public|dokumente)\//.test(doc.filePath) ? doc.filePath : "";
    const cleanup = doc.downloadAllowed ? "Keine unmittelbare Cleanup-Maßnahme." : (doc.internalNote || "Redaktionelle Metadatenkarte und Sichtbarkeitsentscheidung erforderlich.");
    return `| ${escapeHtml(doc.fileName)} | ${escapeHtml(doc.title)} | ${escapeHtml(doc.fileType)} | ${escapeHtml(doc.pageCount || doc.estimatedReadingTime || "offen")} | ${escapeHtml(doc.fileSize)} | ${escapeHtml(publicPath || "-")} | ${escapeHtml(refs.slice(0, 6).join("<br>") || "-")} | ${escapeHtml(doc.documentType)} | ${escapeHtml(doc.status)} | ${escapeHtml(doc.visibility)} | ${escapeHtml(doc.editorialNote || doc.internalNote || "automatisch eingeordnet")} | ${escapeHtml(cleanup)} |`;
  }).join("\n");
  write(INVENTORY_DOC, `# Dokumenteninventar

Stand: automatisch erzeugt durch \`scripts/audit-documents-for-publication.mjs\`

Dieses Inventar listet Dokumentdateien aus dem Repository mit redaktioneller Ersteinstufung. Eine Datei ist noch kein öffentliches Dokument; öffentliche Sichtbarkeit entsteht erst durch Metadatenkarte, Status und Freigabe.

| Dateiname | Dokumenttitel | Dateityp | Seitenzahl / Umfang | Dateigröße | Aktueller öffentlicher Pfad | Website-Verlinkungen | Vorgeschlagene Dokumentart | Vorgeschlagener Status | Sichtbarkeit | Begründung | Erforderliche Cleanup-Maßnahmen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows}
`);
}

function writeAudit(findings, gatedDocs, replacements) {
  const blockingIssues = new Set([
    "Arbeitsprozess-Satz: Soll ich",
    "Arbeitsprozess-Satz: Möchtest du",
    "ChatGPT-Hinweis",
    "Tracking-URL chatgpt",
    "Interne Dokumentation",
    "Interner Entwurf",
    "TODO",
    "TBD",
    "Platzhalter",
    "Genauer Stand offen",
    "Nicht final",
    "Direkter Hinweis auf interne Quellen",
    "fehlender Disclaimer bei Rechts-/Steuer-/Finanzthema"
  ]);
  const rows = findings.map((finding) => {
    const recommendation = blockingIssues.has(finding.issue)
      ? "review-erforderlich, nicht downloadbar"
      : "Metadaten/Datei bei nächster redaktioneller Prüfung ergänzen";
    return `| ${escapeHtml(finding.title)} | ${escapeHtml(finding.filePath)} | ${escapeHtml(finding.issue)} | ${escapeHtml(finding.excerpt)} | ${escapeHtml(recommendation)} |`;
  }).join("\n");
  const nonPublic = gatedDocs.filter((doc) => NON_PUBLIC_VISIBILITIES.has(doc.visibility));
  write(AUDIT_DOC, `# Dokumenten-Publikationsaudit

Stand: automatisch erzeugt durch \`scripts/audit-documents-for-publication.mjs\`

## Ergebnis

- Kuratierte Metadatenkarten: ${gatedDocs.length}
- Öffentliche / fachöffentliche Dokumente in normaler Bibliothek: ${gatedDocs.filter((doc) => PUBLIC_VISIBILITIES.has(doc.visibility)).length}
- Archivdokumente nur im Archiv: ${gatedDocs.filter((doc) => doc.visibility === "archive").length}
- Review/interne/hidden Dokumente nicht als Kachel und nicht als Download: ${nonPublic.length}
- Red-Flag-Treffer: ${findings.length}
- Sanitized HTML-Dateien mit entfernten direkten Non-Public-Downloadlinks: ${replacements.length}

## Red-Flag-Treffer

| Dokument | Datei | Fund | Fundstelle | Empfehlung |
| --- | --- | --- | --- | --- |
${rows || "| - | - | Keine Treffer in freigegebenen öffentlichen Dokumenten. | - | - |"}

## Nicht öffentliche Dokumente

${nonPublic.map((doc) => `- \`${doc.id}\`: ${doc.status}, ${doc.visibility}, downloadAllowed=${doc.downloadAllowed}`).join("\n")}

## Sanitized HTML

${replacements.length ? replacements.map((file) => `- ${file}`).join("\n") : "- Keine direkten Non-Public-Downloadlinks in HTML ersetzt."}
`);
}

function writeModel(gatedDocs) {
  write(DOC_MODEL, `${JSON.stringify({
    schemaVersion: "2026-05-document-library-redesign",
    allowedValues: {
      documentType: ["kurzfassung", "manifest", "leitbild", "grundlagenpapier", "standardwerk", "buch", "whitepaper", "working-paper", "konzept", "fallbeispiel", "technische-leitlinie", "gesetzesentwurf", "datenregister", "essay", "vortrag", "redaktionsgrundlage", "intern"],
      status: ["fuehrend", "aktuell", "fachoeffentlich", "diskussionsfassung", "arbeitsfassung", "in-pruefung", "archiv", "ersetzt", "intern", "review-erforderlich"],
      visibility: ["public", "expert_public", "archive", "review_required", "internal", "hidden"]
    },
    visibilityRule: "Nur public und expert_public erscheinen in der normalen Bibliothek. Archive erscheint nur im Archiv. review_required, internal und hidden erscheinen nicht als Kachel und nicht als direkter Download.",
    documents: gatedDocs
  }, null, 2)}\n`);
  write(PUBLIC_DATA, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    documents: gatedDocs.filter((doc) => PUBLIC_VISIBILITIES.has(doc.visibility) || ARCHIVE_VISIBILITIES.has(doc.visibility)).map((doc) => ({
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      subtitle: doc.subtitle,
      documentType: doc.documentType,
      status: doc.status,
      visibility: doc.visibility,
      audience: doc.audience,
      level: doc.level,
      summaryShort: doc.summaryShort,
      topics: doc.topics,
      methods: doc.methods,
      impactFields: doc.impactFields,
      pageCount: doc.pageCount,
      estimatedReadingTime: doc.estimatedReadingTime,
      downloadAllowed: doc.downloadAllowed,
      url: `/bibliothek/${doc.slug}/`
    }))
  }, null, 2)}\n`);
}

function writePages(gatedDocs) {
  const publicDocs = gatedDocs
    .filter((doc) => PUBLIC_VISIBILITIES.has(doc.visibility))
    .sort((a, b) => (a.order || 999) - (b.order || 999));
  const archiveDocs = gatedDocs
    .filter((doc) => ARCHIVE_VISIBILITIES.has(doc.visibility))
    .sort((a, b) => (a.order || 999) - (b.order || 999));
  write(DOWNLOADS_PAGE, libraryPage(publicDocs, archiveDocs, ""));
  write(BIB_INDEX, libraryPage(publicDocs, archiveDocs, "../"));
  for (const doc of [...publicDocs, ...archiveDocs, ...gatedDocs.filter((item) => item.id === "standardwerk-neue-ordnung-wohlstands-2026")]) {
    const dir = path.join(BIB_DIR, doc.slug);
    write(path.join(dir, "index.html"), detailPage(doc, "../../"));
  }
}

function moveNonPublicOriginals(gatedDocs) {
  const moved = [];
  const targetDir = path.join(ROOT, "content/internal-documents/originals");
  mkdir(targetDir);
  for (const doc of gatedDocs) {
    if (!NON_PUBLIC_VISIBILITIES.has(doc.visibility)) continue;
    const publicPath = `public/downloads/originals/${doc.fileName}`;
    const from = path.join(ROOT, publicPath);
    const to = path.join(targetDir, doc.fileName);
    if (fs.existsSync(from) && !fs.existsSync(to)) {
      fs.renameSync(from, to);
      moved.push(`${publicPath} -> content/internal-documents/originals/${doc.fileName}`);
    }
  }
  return moved;
}

const initialModel = [...DOCUMENTS, ...EXTRA_ARCHIVE].map(ensureFields);
for (const doc of initialModel) {
  const existing = EXISTING_DOCUMENT_META.get(doc.id) || {};
  doc.fileSize = fileSize(doc.filePath) || doc.fileSize || existing.fileSize || "";
  doc.pageCount = doc.pageCount || pdfPageCount(doc.filePath) || existing.pageCount || null;
  doc.estimatedReadingTime = doc.estimatedReadingTime || readingTime(doc.pageCount, doc.fileType) || existing.estimatedReadingTime || "";
}

const preliminaryFindings = auditDocuments(initialModel);
const model = applyAuditGate(initialModel, preliminaryFindings);
const moved = moveNonPublicOriginals(model);
for (const doc of model) {
  if (doc.filePath.startsWith("content/internal-documents/")) {
    const existing = EXISTING_DOCUMENT_META.get(doc.id) || {};
    doc.fileSize = fileSize(doc.filePath) || doc.fileSize || existing.fileSize || "";
    doc.pageCount = doc.pageCount || pdfPageCount(doc.filePath) || existing.pageCount || null;
    doc.estimatedReadingTime = doc.estimatedReadingTime || readingTime(doc.pageCount, doc.fileType) || existing.estimatedReadingTime || "";
  }
}
const finalFindings = auditDocuments(model);
const replacements = sanitizePublicPages(model);
const allDocs = collectAllDocuments();
const linkRefs = collectLinkRefs(allDocs.map((doc) => doc.filePath));
writeInventory(allDocs, linkRefs);
writeAudit(finalFindings, model, replacements);
writeModel(model);
writePages(model);

console.log(JSON.stringify({
  curatedDocuments: model.length,
  inventoryDocuments: allDocs.length,
  findings: finalFindings.length,
  movedNonPublicOriginals: moved.length,
  sanitizedHtmlFiles: replacements.length,
  publicCards: model.filter((doc) => PUBLIC_VISIBILITIES.has(doc.visibility)).length,
  archiveCards: model.filter((doc) => doc.visibility === "archive").length
}, null, 2));
