import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const methods = JSON.parse(fs.readFileSync(path.join(ROOT, "content/methods/woems-methoden.json"), "utf8"));
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/term-registry.json"), "utf8"));
const out = path.join(ROOT, "content/glossary/imports/woems-woemm-2.0.json");

function slug(value) {
  return String(value).toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function norm(value) {
  return String(value).toLowerCase().replace(/\([^)]*\)/g, " ")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

const known = registry.terms.map((term) => ({
  slug: term.slug || term.id,
  labels: [term.label, term.canonicalLabel, ...(term.aliases || []), ...(term.synonyms || [])].filter(Boolean)
}));
const explicitExistingSlugs = new Map([
  ["netto wirkungs index", "nwi"],
  ["t sroi transformational social return on investment", "t-sroi"]
]);

function existingSlug(label) {
  const target = norm(label);
  if (explicitExistingSlugs.has(target)) return explicitExistingSlugs.get(target);
  const exact = known.find((item) => item.labels.some((candidate) => norm(candidate) === target));
  if (exact) return exact.slug;
  return slug(label);
}

const byId = new Map(methods.methods.map((method) => [method.id, method]));
const methodTerms = methods.methods.map((method) => {
  const related = [...method.schnittstellen.bautAuf, ...method.schnittstellen.fuehrtZu]
    .map((id) => byId.get(id)?.name)
    .filter(Boolean);
  return {
    title: method.name,
    slug: existingSlug(method.name),
    action: "Neu anlegen oder fachlich synchronisieren | Priorität A",
    section: `WÖMS 2.0 · Kernmethoden · Kategorie ${method.kategorie}`,
    Kurzdefinition: method.zweck,
    "WÖk-Verwendung": `${method.id} gehört zur Kategorie „${method.kategorieName}“. Verbindlicher Output: ${method.outputs.join(" ")}`,
    Abgrenzung: method.schutzregeln.slice(0, 2).join(" ") || "Die Methode ist eine versionierte Entscheidungsgrundlage und kein automatischer Wirkungsnachweis.",
    Querverweise: [...new Set([...related, "Wirkungsökonomisches Methodensystem", "Wirkungsökonomisches Managementmodell"])],
    Quellenhinweise: `Natalie Weber: Wirkungsökonomisches Methodensystem (WÖMS) 2.0, Methode ${method.id}, DOCX-Seite ${method.docxSeite}.`
  };
});

const coreTerms = [
  {
    title: "Wirkungsökonomisches Methodensystem",
    aliases: ["WÖMS", "WOEMS"],
    section: "WÖMS 2.0 · Methodensystem",
    Kurzdefinition: "Das Wirkungsökonomische Methodensystem (WÖMS) ist die methodische Säule der Wirkungsökonomie mit 152 Kernmethoden, 56 spezialisierten Canvas und 20 Workshop-Journeys.",
    "WÖk-Verwendung": "Das WÖMS operationalisiert das vorgelagerte WÖMM für Diagnose, Modellierung, Bewertung, Gestaltung, Entscheidung, Umsetzung und Lernen.",
    Abgrenzung: "Nicht als lose Werkzeugbibliothek oder als Ersatz fachlicher Analyse verwenden; Methodenwahl, Grenzen, Evidenz und Governance bleiben verbindlich.",
    Querverweise: "Wirkungsökonomisches Managementmodell, WÖMS-Methodenkreislauf, WÖMS-Methodenkarte, WÖMS-Workshop-Journey, Canvas-Mindeststandard"
  },
  {
    title: "Wirkungsökonomisches Managementmodell",
    aliases: ["WÖMM", "WOEMM"],
    section: "WÖMM 2.0 · Managementmodell",
    Kurzdefinition: "Das Wirkungsökonomische Managementmodell (WÖMM) ist die integrierte Management- und Steuerungsarchitektur für Organisationen als lernende Wirkungssysteme.",
    "WÖk-Verwendung": "Das WÖMM verbindet Wirkungskompass, Systemlandkarte, Managementarchitektur, Wirkungsrealisierungsarchitektur, Wirkungsrad und Betriebssystem und ist die vorgelagerte Grundlage für das WÖMS.",
    Abgrenzung: "Kein Nachhaltigkeitszusatz, keine Personenbewertung, keine Zentralplanung und kein Ein-Zahlen-System.",
    Querverweise: "Wirkungsökonomisches Methodensystem, Wirkungskompass, Systemlandkarte, Wirkungsökonomische Managementarchitektur, WÖMM-Betriebssystem"
  },
  {
    title: "Wirkungskompass",
    section: "WÖMM 2.0 · Managementmodell",
    Kurzdefinition: "Der Wirkungskompass richtet Entscheidungen an Mensch, Planet und Demokratie sowie SDGs, Agenda 2030, SDG+, Wirkungsgrenzen und positiver Netto-Wirkung aus.",
    "WÖk-Verwendung": "Er legt Richtung und Schutzrahmen fest, bevor Optionen auf Preis, Geschwindigkeit, Marge oder Skalierung optimiert werden.",
    Abgrenzung: "SDG-Symbole oder allgemeine Nachhaltigkeitsziele ersetzen keine begründete Priorisierung und Grenzprüfung.",
    Querverweise: "Wirkungsökonomisches Managementmodell, Wirkungskompass-Ausrichtung, positive Netto-Wirkung, Wirkungsgrenze"
  },
  {
    title: "Systemlandkarte",
    section: "WÖMM 2.0 · Managementmodell",
    Kurzdefinition: "Die Systemlandkarte erfasst Wirkungsempfänger, Wirkungsräume, Wirkpfade, Wirkungsordnungen, Zeit, Risiken und Interdependenzen eines Wirkungssystems.",
    "WÖk-Verwendung": "Sie macht sichtbar, wer oder was betroffen ist und wie Ressourcen-, Daten-, Geld-, Macht- und Wirkungsbeziehungen zusammenhängen.",
    Abgrenzung: "Nicht mit einer statischen Stakeholderliste oder einer vollständigen Vorhersage komplexer Systeme verwechseln.",
    Querverweise: "Wirkungsökonomisches Managementmodell, Wirkungssystem-Landkarte, Wirkungsnetz, Wirkungsraum"
  },
  {
    title: "Wirkungsökonomische Managementarchitektur",
    section: "WÖMM 2.0 · Managementmodell",
    Kurzdefinition: "Die wirkungsökonomische Managementarchitektur ordnet zwölf Managementfelder von Zweck und Strategie bis Governance, Lernen und Transformation.",
    "WÖk-Verwendung": "Sie verbindet Managemententscheidungen mit positiver Netto-Wirkung, Tragfähigkeit, Resilienz und Lernfähigkeit.",
    Abgrenzung: "Keine zusätzliche Nachhaltigkeitssäule neben klassischem Management, sondern dessen übergreifende Wirkungsordnung.",
    Querverweise: "Wirkungsökonomisches Managementmodell, Wirkungsökonomische Erfolgslogik, WÖMM-Betriebssystem"
  },
  {
    title: "Wirkungsökonomische Erfolgslogik",
    section: "WÖMM 2.0 · Managementmodell",
    Kurzdefinition: "Die wirkungsökonomische Erfolgslogik verbindet positive Netto-Wirkung, wirtschaftliche Tragfähigkeit, Resilienz und Lernfähigkeit als gemeinsam notwendige Bedingungen.",
    "WÖk-Verwendung": "Die Bedingungen werden nicht beliebig gegeneinander aufgerechnet; eine fehlende Grundbedingung begrenzt den dauerhaften Managementerfolg.",
    Abgrenzung: "Nicht als additiver Durchschnittsscore oder reine Finanzkennzahl verwenden.",
    Querverweise: "positive Netto-Wirkung, wirtschaftliche Tragfähigkeit, Resilienz, Wirkungsrückkopplung"
  },
  {
    title: "WÖMM-Betriebssystem",
    section: "WÖMM 2.0 · Managementmodell",
    Kurzdefinition: "Das WÖMM-Betriebssystem verankert Rollen, Daten, Entscheidungstore, Gremien, Assurance, Managementrhythmen, Kompetenzen und Beteiligung im Organisationsalltag.",
    "WÖk-Verwendung": "Es macht aus der Managementarchitektur eine institutionell wirksame, prüfbare und lernende Praxis.",
    Abgrenzung: "Kein IT-Betriebssystem und kein zentralistisches Kontrollsystem.",
    Querverweise: "Wirkungsökonomisches Managementmodell, Wirkungsgovernance, Wirkungsassurance, Wirkungsrückkopplung"
  },
  {
    title: "WÖMS-Methodenkreislauf",
    section: "WÖMS 2.0 · Methodensystem",
    Kurzdefinition: "Der WÖMS-Methodenkreislauf strukturiert Wahrnehmen, Abgrenzen, Verstehen, Modellieren, Bewerten, Gestalten, Entscheiden, Umsetzen, Beobachten und Lernen.",
    "WÖk-Verwendung": "Er führt eine Wirkungsfrage von Mandat und Systemgrenze bis zur beobachteten Wirkung und methodischen Korrektur.",
    Abgrenzung: "Keine starre lineare Checkliste; Schleifen, Rücksprünge und risikoproportionale Methodenauswahl bleiben möglich.",
    Querverweise: "Wirkungsökonomisches Methodensystem, WÖMS-Methodenkarte, Wirkungsrückkopplung"
  },
  {
    title: "WÖMS-Methodenkarte",
    section: "WÖMS 2.0 · Methodensystem",
    Kurzdefinition: "Eine WÖMS-Methodenkarte dokumentiert Zweck, Einsatzrahmen, Inputs, Schritte, Output, Schnittstellen, Canvas-Spezifikation, Qualitäts- und Schutzregeln einer Methode.",
    "WÖk-Verwendung": "Sie ist der standardisierte, versionierbare Datensatz für Anwendung, Ausbildung, Prüfung und Assurance.",
    Abgrenzung: "Keine bloße Moderationskarte und kein Ersatz fachlicher Evidenz.",
    Querverweise: "Wirkungsökonomisches Methodensystem, WÖMS-Methodenregister, Canvas-Mindeststandard"
  },
  {
    title: "WÖMS-Workshop-Journey",
    section: "WÖMS 2.0 · Methodensystem",
    Kurzdefinition: "Eine WÖMS-Workshop-Journey verbindet ausgewählte Kernmethoden zu einem vollständigen Arbeitsprozess mit Vorbereitung, Vertiefung, Entscheidung und Review.",
    "WÖk-Verwendung": "20 Standard-Journeys decken die Grundanwendung sowie Foresight, Capabilities, Operating Model, Change, Delivery, Daten, KI, Resilienz und Assurance ab.",
    Abgrenzung: "Kein fertiges Workshop-Skript ohne Kontext-, Betroffenen-, Schutz- und Datenprüfung.",
    Querverweise: "Wirkungsökonomisches Methodensystem, WÖMS-Moderation, WÖMS-Methodenkreislauf"
  },
  {
    title: "WÖMS-Moderation",
    section: "WÖMS 2.0 · Methodensystem",
    Kurzdefinition: "WÖMS-Moderation sichert Mandat, Begriffe, Betroffenenperspektiven, Grenzen, Evidenztrennung, Widerspruch, Entscheidungsfähigkeit und Dokumentation.",
    "WÖk-Verwendung": "Sie trägt prozedurale und wirkungsbezogene Verantwortung; Fachentscheidungen bleiben bei legitimierten Rollen.",
    Abgrenzung: "Moderator:innen sind weder neutrale Protokollierende noch inhaltliche Alleinentscheider:innen.",
    Querverweise: "WÖMS-Workshop-Journey, Beteiligungs- und Repräsentationsdesign, Wirkungsassurance"
  },
  {
    title: "Canvas-Mindeststandard",
    section: "WÖMS 2.0 · Canvas-Mindeststandard",
    Kurzdefinition: "Der Canvas-Mindeststandard verlangt ID, Version, Datum, Fall, verantwortliche Moderation sowie Felder für Evidenzstatus, Unsicherheit, negative Wirkung, Wirkungsgrenzen und offene Fragen.",
    "WÖk-Verwendung": "Er hält Informationsarchitektur, Barrierearmut, Versionierung und Nichtkompensation über Web-, Druck-, Miro- und Präsentationsvarianten stabil.",
    Abgrenzung: "Farbe darf Bedeutung nie allein tragen; aggregierte Werte dürfen Grenzverletzungen oder betroffene Gruppen nicht verdecken.",
    Querverweise: "WÖMS-Methodenkarte, Wirkungsgrenze, Nichtkompensation, Datenqualität"
  },
  {
    title: "WÖMS-Methodenregister",
    section: "WÖMS 2.0 · Methodensystem",
    Kurzdefinition: "Das WÖMS-Methodenregister führt stabile Methoden-IDs, Version, Herkunft, Evidenzstatus, Änderungsanträge, Konsultation, Freigabe und Release Notes.",
    "WÖk-Verwendung": "Es ist die Governance- und Versionierungsgrundlage für 152 Kernmethoden, 56 spezialisierte Canvas und ihre Schnittstellen.",
    Abgrenzung: "Kein bloßes Inhaltsverzeichnis; Änderungen an Methodenlogik und Schutzregeln müssen nachvollziehbar freigegeben werden.",
    Querverweise: "Wirkungsökonomisches Methodensystem, WÖMS-Methodenkarte, Wirkungsassurance"
  },
  {
    title: "Wirkungssystem-Landkarte",
    section: "WÖMM 2.0 · Managementmodell",
    Kurzdefinition: "Die Wirkungssystem-Landkarte visualisiert Wirkungsempfänger, Wirkungsräume, Ressourcen-, Daten-, Geld- und Informationsflüsse sowie Macht, Abhängigkeiten und Wirkungsordnungen.",
    "WÖk-Verwendung": "Sie übersetzt die Systemlandkarte des WÖMM in eine bearbeitbare methodische Arbeitsfläche.",
    Abgrenzung: "Nicht als vollständige oder objektive Abbildung eines komplexen Systems behandeln; Annahmen und Datenlücken bleiben sichtbar.",
    Querverweise: "Systemlandkarte, Wirkungsnetz, Wirkungsraum, Datenqualität"
  },
  {
    title: "Wirtschaftliche Tragfähigkeit",
    section: "WÖMM 2.0 · Managementmodell",
    Kurzdefinition: "Wirtschaftliche Tragfähigkeit bezeichnet die dauerhafte organisatorische und finanzielle Fähigkeit, positive Wirkung zu tragen.",
    "WÖk-Verwendung": "Sie ist eine notwendige Erfolgsbedingung neben positiver Netto-Wirkung, Resilienz und Lernfähigkeit, aber nicht der letzte Wirkungsmaßstab.",
    Abgrenzung: "Profitabilität oder Rendite sind weder Wirkungsnachweis noch Freigabe für Grenzverletzungen.",
    Querverweise: "Wirkungsökonomische Erfolgslogik, positive Netto-Wirkung, Resilienz, Nichtkompensation"
  },
  {
    title: "Wirkungsrealisierungsarchitektur",
    section: "WÖMM 2.0 · Wirkungsrealisierung",
    Kurzdefinition: "Die Wirkungsrealisierungsarchitektur verbindet Wirkungsziele mit Capabilities, Wertströmen, Prozessen, Operating Model, Daten, Technologie, Delivery, Change und Adoption.",
    "WÖk-Verwendung": "Sie schließt die Managementkette zwischen strategischer Wirkungsabsicht und tatsächlich eingetretener, dauerhaft verfügbarer Zustandsveränderung.",
    Abgrenzung: "Weder Projektplan noch Organigramm; Outputs und installierte Systeme gelten ohne Nutzung, Adoption, Benefit und Wirkungsrückkopplung nicht als realisierte Wirkung.",
    Querverweise: "Wirkungsökonomisches Managementmodell, Wirkungs-Capability, Wirkungswertstrom, Impact & Benefits Realization, Wirkungsrückkopplung"
  },
  {
    title: "WÖMS-Realisierungs- und Betriebsmethoden",
    section: "WÖMS 2.0 · Methodensystem",
    Kurzdefinition: "Die 68 WÖMS-Realisierungs- und Betriebsmethoden der Kategorien I bis P operationalisieren Foresight, Capabilities, Prozesse, Produktbetrieb, Change, Delivery, Daten, KI, Resilienz, Kontrollen und Assurance.",
    "WÖk-Verwendung": "Sie ergänzen die 84 Grundmethoden und führen Wirkung von Diagnose und Gestaltung bis in Realisierung, Betrieb und unabhängige Prüfung.",
    Abgrenzung: "Keine zweite, losgelöste Methodenbibliothek; die Methoden bleiben an Wirkungskompass, Wirkungsgrenzen, Nichtkompensation und die Grundmethoden A bis H gebunden.",
    Querverweise: "Wirkungsökonomisches Methodensystem, Wirkungsrealisierungsarchitektur, WÖMS-Methodenregister, integrierte Assurance"
  },
  {
    title: "WÖMM-Managementfunktion",
    section: "WÖMM 2.0 · Funktionsarchitektur",
    Kurzdefinition: "Eine WÖMM-Managementfunktion bezeichnet eine notwendige Fähigkeit des Managementsystems von Ausrichtung und Strategie bis Betrieb, Kontrolle, Lernen und Erneuerung.",
    "WÖk-Verwendung": "Das WÖMM 2.0 unterscheidet 17 Managementfunktionen und ordnet ihnen Ergebnisse, Entscheidungstore, Rollen und Methoden zu.",
    Abgrenzung: "Nicht mit einer Abteilung oder einzelnen Stelle gleichsetzen; eine Funktion kann verteilt, rekursiv und durch mehrere Rollen erfüllt werden.",
    Querverweise: "Wirkungsökonomisches Managementmodell, Wirkungsrealisierungsarchitektur, WÖMM-Betriebssystem"
  },
  {
    title: "Wirkungs-Capability",
    section: "WÖMM 2.0 · Wirkungsrealisierung",
    Kurzdefinition: "Eine Wirkungs-Capability ist die dauerhaft verfügbare Fähigkeit einer Organisation, einen begründeten Beitrag zu einer angestrebten Zustandsveränderung zu leisten.",
    "WÖk-Verwendung": "Sie verbindet Wirkungsziel und Strategie mit Menschen, Prozessen, Daten, Technologie, Governance, Partnern und Investitionen.",
    Abgrenzung: "Nicht mit einer einmaligen Aktivität, Ressource oder organisatorischen Einheit verwechseln.",
    Querverweise: "Wirkungsrealisierungsarchitektur, Wirkungs-Capability-Map, Capability-to-Impact-Matrix, Wirkungswertstrom"
  },
  {
    title: "Wirkungswertstrom",
    section: "WÖMM 2.0 · Wirkungsrealisierung",
    Kurzdefinition: "Ein Wirkungswertstrom beschreibt die Ende-zu-Ende-Abfolge, durch die Fähigkeiten, Leistungen, Übergaben und Entscheidungen Zustände bei Wirkungsempfängern verändern.",
    "WÖk-Verwendung": "Er macht neben Fluss und Leistung auch Wartezeiten, Externalitäten, Wirkungsgrenzen, KII und Rückkopplungspunkte sichtbar.",
    Abgrenzung: "Effizienter Wertfluss ist kein Wirkungsnachweis; auch schädliche Wirkung kann effizient erzeugt werden.",
    Querverweise: "Wirkungsrealisierungsarchitektur, Wirkungswertstrom-Karte, Wirkungs-Capability, Wirkungsrückkopplung"
  },
  {
    title: "Wirkungs-Product-Operating-Model",
    section: "WÖMM 2.0 · Wirkungsrealisierung",
    Kurzdefinition: "Das Wirkungs-Product-Operating-Model organisiert dauerhafte Produktverantwortung für Outcome, Betrieb, Nebenwirkungen, Lernen und Wirkungsempfänger.",
    "WÖk-Verwendung": "Es verbindet empowered Teams, Discovery und Delivery mit Wirkungsgrenzen, Produktlebenszyklus, Plattformen, Enablern und KII.",
    Abgrenzung: "Kunden- oder Unternehmensoutcomes allein genügen nicht; gesellschaftliche, ökologische und demokratische Systemwirkungen bleiben Teil der Verantwortung.",
    Querverweise: "Wirkungsrealisierungsarchitektur, Wirkungs-Product-Operating-Model-Canvas, Wirkungsorientierte Teamtopologie"
  },
  {
    title: "Impact & Benefits Realization",
    section: "WÖMM 2.0 · Wirkungsrealisierung",
    Kurzdefinition: "Impact & Benefits Realization verfolgt die Kette von Deliverables über Nutzung, Verhalten und Capabilities zu Benefits, Netto-Wirkung und Verstetigung.",
    "WÖk-Verwendung": "Sie verankert Benefit- und Impact-Owner, Zeitbezug, Handover, KII und Review im Portfolio- und Deliverysystem.",
    Abgrenzung: "Projektabschluss, Output oder organisationsinterner Nutzen sind noch keine positive Netto-Wirkung.",
    Querverweise: "Wirkungsrealisierungsarchitektur, Impact-and-Benefits-Realization-Map, Wirkungstransformations-Portfolio, positive Netto-Wirkung"
  },
  {
    title: "integrierte Assurance",
    section: "WÖMM 2.0 · Governance und Assurance",
    Kurzdefinition: "Integrierte Assurance koordiniert operative Kontrollen, Second Line, interne Revision und externe Prüfung entlang gemeinsamer Wirkungsrisiken und Nachweise.",
    "WÖk-Verwendung": "Sie macht Kontrollabdeckung, Unabhängigkeit, Lücken, Prüfpfade und Verbesserungsmaßnahmen über das Managementsystem hinweg sichtbar.",
    Abgrenzung: "Viele Kontrollen oder Prüfungen beweisen weder Kontrollwirksamkeit noch positive Wirkung; Unabhängigkeit und Wirkungsbezug bleiben erforderlich.",
    Querverweise: "Wirkungsassurance, Integrierte Assurance Map und Three Lines, Wirkungsgrenze, WÖMM-Betriebssystem"
  }
].map((term) => ({
  ...term,
  slug: existingSlug(term.title),
  action: "Neu anlegen oder fachlich synchronisieren | Priorität A",
  Quellenhinweise: `${term.section}. Quellen: Wirkungsoekonomisches_Methodensystem_WOEMS_2.0.docx und Wirkungsoekonomisches_Managementmodell_WOEMM_2.0.docx.`
}));

const payload = {
  sourceDocument: "WÖMS 2.0 und WÖMM 2.0",
  supersedesSourceDocuments: ["WÖMS 1.0 und WÖMM 1.0"],
  sourcePath: "content/methods/woems-methoden.json",
  stand: "2026-07-10",
  note: "Methodennamen werden aus der kanonischen WÖMS-Registry abgeleitet; Definitionen und Einordnungen speisen die term-registry.",
  terms: [...coreTerms, ...methodTerms]
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Glossar-Import geschrieben: ${payload.terms.length} Begriffe.`);
