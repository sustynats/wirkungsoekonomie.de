import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const packageDir = "/private/tmp/woek-wu-gesamt-v11/woek_wirtschaft_unternehmen_gesamtpaket_go5_go6_go7_v1_1";

const docs = [
  {
    number: "06",
    slug: "unternehmen-als-wirkungssysteme",
    title: "Unternehmen als Wirkungssysteme",
    subtitle: "Unternehmenszweck, Geschäftsmodell, Wertschöpfung und Rückkopplung in der Wirkungsökonomie",
    source: "website/online_volltext_06_unternehmen_als_wirkungssysteme_detailkonzept_v1_0.md",
    docx: "06_woek_wirtschaft_unternehmen_unternehmen_als_wirkungssysteme_detailkonzept_v1_0.docx",
    pdf: "06_woek_wirtschaft_unternehmen_unternehmen_als_wirkungssysteme_detailkonzept_v1_0.pdf",
    baseDir: packageDir,
    docxSubdir: "word",
    pdfSubdir: "pdf",
    description:
      "Echtes Detailkonzept zu Unternehmen als Wirkungssysteme: Zweck, Geschäftsmodell, Wertschöpfung, WÖk-IDs, Steuerung und Rückkopplung.",
    bookFocus: ["kapitel-042-unternehmen-als-wirkungssysteme", "kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung"],
  },
  {
    number: "07",
    slug: "wirkungsorientierte-unternehmensfuehrung",
    title: "Wirkungsorientierte Unternehmensführung inkl. Mitarbeiterführung",
    subtitle: "Führung, Mitarbeitendenverantwortung, Governance und Anreizsysteme wirkungsökonomisch ausrichten",
    source: "website/online_volltext_07_wirkungsorientierte_unternehmensfuehrung_detailkonzept_v1_0.md",
    docx: "07_woek_wirtschaft_unternehmen_wirkungsorientierte_unternehmensfuehrung_detailkonzept_v1_0.docx",
    pdf: "07_woek_wirtschaft_unternehmen_wirkungsorientierte_unternehmensfuehrung_detailkonzept_v1_0.pdf",
    baseDir: packageDir,
    docxSubdir: "word",
    pdfSubdir: "pdf",
    description:
      "Echtes Detailkonzept zu wirkungsorientierter Unternehmensführung inklusive Mitarbeiterführung, Governance, Kultur und Anreizsystemen.",
    bookFocus: ["kapitel-043-wirkungsorientierte-unternehmensfuehrung", "kapitel-045-organisation-kultur-und-verantwortung"],
  },
  {
    number: "08",
    slug: "risikomanagement-resilienz-finanzmarkt",
    title: "Wirkungsorientiertes Risikomanagement, Resilienz und Finanzmarktanforderungen",
    subtitle: "ESG-Risiken, Finanzmarktanforderungen, Versicherbarkeit und Resilienz in eine Wirkungslogik übersetzen",
    source: "website/online_volltext_08_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0.md",
    docx: "08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0.docx",
    pdf: "08_woek_wirtschaft_unternehmen_risikomanagement_resilienz_finanzmarkt_detailkonzept_v1_0.pdf",
    baseDir: packageDir,
    docxSubdir: "word",
    pdfSubdir: "pdf",
    description:
      "Echtes Detailkonzept zu Risikomanagement, Resilienz, Finanzmarktanforderungen, EBA/ESG-Anschluss und Wirkungsrisiko.",
    bookFocus: ["kapitel-047-unternehmensrisiko-und-transformation", "kapitel-044-wirkungscontrolling-im-unternehmen"],
  },
  {
    number: "09",
    slug: "wertschoepfungsketten-einkauf",
    title: "Resiliente Wertschöpfungsketten und Einkauf nach Wirkung",
    subtitle: "Lieferketten, Einkauf, Supplier Scorecards und Resilienz als Unternehmenswirkung steuern",
    source: "website/online_volltext_09_resiliente-wertschoepfungsketten-und-einkauf-nach-wirkung_detailkonzept_v1_0.md",
    docx: "09_woek_wirtschaft_unternehmen_resiliente_wertschoepfungsketten_einkauf_detailkonzept_v1_0.docx",
    pdf: "09_woek_wirtschaft_unternehmen_resiliente_wertschoepfungsketten_einkauf_detailkonzept_v1_0.pdf",
    baseDir: packageDir,
    docxSubdir: "word",
    pdfSubdir: "pdf",
    description:
      "Echtes Detailkonzept zu resilienten Wertschöpfungsketten, Lieferantenbewertung und wirkungsorientiertem Einkauf.",
    bookFocus: ["kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung", "kapitel-047-unternehmensrisiko-und-transformation"],
    tools: [
      ["Lieferketten-Wirkungscheck", "", "Demo in Vorbereitung", "Lieferkettenwirkung, Risiken, Datenqualität und Lieferantenentwicklung strukturiert prüfen."],
      ["Supplier Scorecard Generator", "", "Demo in Vorbereitung", "Lieferanten entlang sozialer, ökologischer, demokratischer und Resilienz-Kriterien bewerten."],
      ["Sourcing-Szenario-Rechner", "", "Demo in Vorbereitung", "Beschaffungsoptionen nach Kosten, Wirkung, Risiko und Zukunftsfähigkeit vergleichen."],
      ["Vorsteuer-/WUStG-Lieferkettenmodul", "/werkzeuge/wirkungsumsatzsteuer/", "Werkzeugseite vorhanden", "Lieferkettenwirkung mit Produktwirkung und Wirkungsumsatzsteuer verbinden."],
      ["Critical Supplier Radar", "", "Demo in Vorbereitung", "Abhängigkeiten, Engpässe und kritische Lieferanten früh sichtbar machen."],
      ["WÖk-IDs", "/werkzeuge/woek-ids/", "Werkzeugseite vorhanden", "Indikatoren, Quellen und Datenlogik der Lieferkettenwirkung strukturieren."],
    ],
  },
  {
    number: "10",
    slug: "wirkungscontrolling",
    title: "Wirkungscontrolling im Unternehmen",
    subtitle: "KII, NWI, T-SROI, Scorecards und Assurance als Steuerungskreislauf im Unternehmen",
    source: "website/online_volltext_10_wirkungscontrolling-im-unternehmen_detailkonzept_v1_0.md",
    docx: "10_woek_wirtschaft_unternehmen_wirkungscontrolling_detailkonzept_v1_0.docx",
    pdf: "10_woek_wirtschaft_unternehmen_wirkungscontrolling_detailkonzept_v1_0.pdf",
    baseDir: packageDir,
    docxSubdir: "word",
    pdfSubdir: "pdf",
    description:
      "Echtes Detailkonzept zu Wirkungscontrolling, KII statt KPI, NWI, T-SROI, Scorecards, CapEx-Prüfung und Assurance.",
    bookFocus: ["kapitel-044-wirkungscontrolling-im-unternehmen", "kapitel-031-woek-ids-und-indikatorenarchitektur"],
    tools: [
      ["KII-Dashboard", "", "Demo in Vorbereitung", "Kernwirkungsindikatoren statt nur klassische KPI im Management sichtbar machen."],
      ["NWI-Rechner", "/werkzeuge/netto-wirkungs-index/", "Werkzeugseite vorhanden", "Positive, negative und neutrale Wirkung zu einer steuerbaren Netto-Wirkung verdichten."],
      ["T-SROI-Rechner", "/werkzeuge/impact-controlling/t-sroi/", "Methodenseite vorhanden", "Transformationsnutzen, Kosten, Risiken und systemische Wirkung vergleichen."],
      ["CapEx-Wirkungscheck", "", "Demo in Vorbereitung", "Investitionen nach Zukunftsfähigkeit, Wirkungsrisiko und Resilienz bewerten."],
      ["Scorecard-Generator", "/werkzeuge/scorecards/", "Werkzeugseite vorhanden", "Bewertungsraster für Unternehmens- und Produktwirkung aufbauen."],
      ["Assurance-Check", "/werkzeuge/datenqualitaet-assurance/", "Werkzeugseite vorhanden", "Datenqualität, Prüfpfade und Vertrauensstufen sichtbar machen."],
    ],
  },
  {
    number: "11",
    slug: "produktentwicklung-produktscorecards-produktpaesse",
    title: "Produktentwicklung, Produktscorecards und digitale Produktpässe",
    subtitle: "Produktwirkung in Entwicklung, Scorecards, DPP und Verbraucherinformation rückkoppeln",
    source: "website/online_volltext_11_produktentwicklung-produktscorecards-und-digitale-produktpaesse_detailkonzept_v1_0.md",
    docx: "11_woek_wirtschaft_unternehmen_produktentwicklung_produktscorecards_dpp_detailkonzept_v1_0.docx",
    pdf: "11_woek_wirtschaft_unternehmen_produktentwicklung_produktscorecards_dpp_detailkonzept_v1_0.pdf",
    baseDir: packageDir,
    docxSubdir: "word",
    pdfSubdir: "pdf",
    description:
      "Echtes Detailkonzept zu Produktentwicklung, Produktscorecards, digitalen Produktpässen, DPP-Reifegrad und Design for Impact.",
    bookFocus: ["kapitel-048-produkte-als-wirkungstraeger", "kapitel-050-produktscorecards"],
    tools: [
      ["Produktscorecard-Generator", "/werkzeuge/produktscorecards/", "Werkzeugseite vorhanden", "Produktwirkung nach Material, Nutzung, Reparatur, Kreislauf, Lieferkette und SDG-Bezug strukturieren."],
      ["DPP-Reifegradcheck", "/werkzeuge/digitale-produktpaesse-wirkungsdatenraeume/", "Werkzeugseite vorhanden", "Digitale Produktpässe und Wirkungsdatenräume schrittweise anschlussfähig machen."],
      ["Produktwirkungsrechner", "/erleben/produktwirkungsrechner/", "Demo vorhanden", "Produktbeispiele, FinalScore und Wirkungsumsatzsteuer modellhaft ausprobieren."],
      ["Design-for-Impact-Check", "", "Demo in Vorbereitung", "Produktentscheidungen früh an positiver Netto-Wirkung ausrichten."],
      ["Reverse-Merit-Order-Modul", "/werkzeuge/reverse-merit-order/", "Werkzeugseite vorhanden", "Schlechtere Wirkung systematisch nach hinten sortieren und bessere Wirkung bevorzugen."],
      ["Kreislauf-/Reparatur-Score", "", "Demo in Vorbereitung", "Reparierbarkeit, Langlebigkeit und Kreislauffähigkeit in Produktentscheidungen sichtbar machen."],
    ],
  },
  {
    number: "12",
    slug: "marketing-vertrieb-fuenftes-p-planet",
    title: "Marketing, Vertrieb und das fünfte P: Planet",
    subtitle: "Marketing, Vertrieb, Produktkommunikation und Green Claims an Wirkung ausrichten",
    source: "website/online_volltext_12_marketing-vertrieb-fuenftes-p-planet_detailkonzept_v1_0.md",
    docx: "12_woek_wirtschaft_unternehmen_marketing_vertrieb_fuenftes_p_planet_detailkonzept_v1_0.docx",
    pdf: "12_woek_wirtschaft_unternehmen_marketing_vertrieb_fuenftes_p_planet_detailkonzept_v1_0.pdf",
    baseDir: packageDir,
    docxSubdir: "word",
    pdfSubdir: "pdf",
    description:
      "Echtes Detailkonzept zu Marketing, Vertrieb, dem fünften P Planet, Green Claims, Resonanzrisiken und verantwortlicher Produktkommunikation.",
    bookFocus: ["kapitel-048-produkte-als-wirkungstraeger", "kapitel-052-konsumwirkung-und-verbraucherinformation"],
    tools: [
      ["5P-Wirkungscheck", "", "Demo in Vorbereitung", "Marketingentscheidungen um das fünfte P Planet erweitern und Wirkung sichtbar machen."],
      ["Green-Claims-Check", "", "Demo in Vorbereitung", "Umwelt- und Wirkungsversprechen auf Nachvollziehbarkeit, Datenbasis und Risiko prüfen."],
      ["Resonanzrisiko-Check", "", "Demo in Vorbereitung", "Reputations-, Vertrauens- und Diskursrisiken in Kommunikation und Vertrieb erkennen."],
      ["Responsible-Sales-Check", "", "Konzept", "Vertriebslogiken auf Druck, Fehlanreize, Fairness und langfristige Wirkung prüfen."],
      ["Produktkommunikations-Scorecard", "/werkzeuge/scorecards/", "Werkzeugseite vorhanden", "Produktkommunikation in eine Scorecard- und WÖk-ID-Logik einordnen."],
    ],
    publications: [
      ["Nachhaltiges Marketing-Mix", "/bibliothek/nachhaltiges-marketing-mix/", "Buch / Praxisleitfaden", "Frühe Buchfassung zu Agenda 2030, SDGs und dem fünften P Planet im Marketing-Mix."],
      ["Nachhaltiger Einzelhandel", "/bibliothek/nachhaltiger-einzelhandel/", "Buch / Praxisleitfaden", "Anwendungsperspektive für Handel, Kreislaufwirtschaft und Kund:innenbeziehung."],
      ["Nachhaltigkeitsstrategie für mittelständische Beratungsunternehmen", "/bibliothek/nachhaltigkeitsstrategie-mittelstaendische-beratungsunternehmen/", "Buch / Praxisleitfaden", "Umsetzung von Agenda 2030, SDGs und ESG-Anforderungen in Beratungsunternehmen."],
      ["Nachhaltigkeitstransformation im Handwerk", "/bibliothek/nachhaltigkeitstransformation-im-handwerk/", "Buch / Praxisleitfaden", "Leitfaden für kleine Betriebe mit Fokus auf Vorgaben, Kund:innen, Lieferanten und Umsetzung."],
    ],
  },
  {
    number: "13",
    slug: "bilanz-finanzierung-finanzkommunikation",
    title: "Bilanz, Finanzierung und Finanzkommunikation nach Wirkung",
    subtitle: "CapEx, Finanzierung, Kapitalzugang und Finanzkommunikation wirkungsökonomisch einordnen",
    source: "website/online_volltext_13_bilanz-finanzierung-finanzkommunikation-nach-wirkung_detailkonzept_v1_0.md",
    docx: "13_woek_wirtschaft_unternehmen_bilanz_finanzierung_finanzkommunikation_nach_wirkung_detailkonzept_v1_0.docx",
    pdf: "13_woek_wirtschaft_unternehmen_bilanz_finanzierung_finanzkommunikation_nach_wirkung_detailkonzept_v1_0.pdf",
    baseDir: packageDir,
    docxSubdir: "word",
    pdfSubdir: "pdf",
    description:
      "Echtes Detailkonzept zu Bilanz, Finanzierung, Finanzkommunikation, CapEx-Wirkung, Stranded Assets, Wirkungskreditprofil und Kapitalzugang.",
    bookFocus: ["kapitel-044-wirkungscontrolling-im-unternehmen", "kapitel-047-unternehmensrisiko-und-transformation"],
    tools: [
      ["CapEx-Wirkungscheck", "", "Demo in Vorbereitung", "Investitionen nach Zukunftsfähigkeit, Wirkung, Risiko und Resilienz bewerten."],
      ["Wirkungsbilanz-Canvas", "", "Konzept", "Bilanzlogik, immaterielle Wirkung, Risiken und Kapitalzugang systematisch verbinden."],
      ["Stranded-Asset-Radar", "", "Demo in Vorbereitung", "Übergangsrisiken und Vermögenswerte mit sinkender Zukunftsfähigkeit sichtbar machen."],
      ["Wirkungskreditprofil", "/wirkungsfelder/finanzsystem-kapital/banken-wirkungskredite/", "Kontextseite vorhanden", "Kreditfähigkeit, Transformationsdaten und Finanzmarktanforderungen zusammenführen."],
      ["Finanzkommunikations-Check", "", "Demo in Vorbereitung", "Finanzkommunikation auf Datenklarheit, Greenwashing-Risiken und Wirkungskonsistenz prüfen."],
    ],
  },
  {
    number: "14",
    slug: "transformation-kmu-uebergangspfade",
    title: "Transformation, KMU-Tauglichkeit und Übergangspfade",
    subtitle: "Unternehmenswandel, KMU-Schutz und realistische Übergangspfade wirkungsökonomisch gestalten",
    source: "website/online_volltext_14_transformation-kmu-tauglichkeit-uebergangspfade_detailkonzept_v1_0.md",
    docx: "14_woek_wirtschaft_unternehmen_transformation_kmu_tauglichkeit_uebergangspfade_detailkonzept_v1_0.docx",
    pdf: "14_woek_wirtschaft_unternehmen_transformation_kmu_tauglichkeit_uebergangspfade_detailkonzept_v1_0.pdf",
    baseDir: packageDir,
    docxSubdir: "word",
    pdfSubdir: "pdf",
    description:
      "Echtes Detailkonzept zu Transformation, KMU-Tauglichkeit, Übergangspfaden, Konversions-CapEx, Datenanforderungen und Pilotierung.",
    bookFocus: ["kapitel-047-unternehmensrisiko-und-transformation", "kapitel-098-pilotierung-und-kommunen"],
    tools: [
      ["KMU-Wirkungscheck", "/werkzeuge/unternehmens-wirkungscheck/", "Werkzeugseite vorhanden", "Niederschwelliger Einstieg in Wirkung, Risiken und Transformationsprioritäten."],
      ["Transformations-Reifegradmodell", "", "Konzept", "Reifegrade für Strategie, Daten, Governance, Finanzierung und Umsetzung sichtbar machen."],
      ["Übergangspfad-Generator", "", "Demo in Vorbereitung", "Kurz-, mittel- und langfristige Transformationspfade vergleichbar strukturieren."],
      ["Konversions-CapEx-Rechner", "", "Demo in Vorbereitung", "Investitionsbedarf, Risikoabbau und Wirkung von Umstellungspfaden modellieren."],
      ["Datenanforderungs-Mapper", "/werkzeuge/woek-ids/", "Werkzeugseite vorhanden", "Datenpflichten, WÖk-IDs, CSRD/ESRS und Scorecards anschlussfähig ordnen."],
    ],
  },
];

const sdgs = [
  ["SDG 8 Menschenwürdige Arbeit", "sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum", "Gute Arbeit, faire Wertschöpfung und tragfähige Unternehmensentwicklung."],
  ["SDG 9 Industrie, Innovation und Infrastruktur", "sdg-9-industrie-innovation-infrastruktur", "Innovation, Infrastruktur und industrielle Transformation als Wirkungsträger."],
  ["SDG 10 Weniger Ungleichheiten", "sdg-10-weniger-ungleichheiten", "Ungleichheitswirkungen in Beschäftigung, Lieferketten, Kapitalzugang und Märkten sichtbar machen."],
  ["SDG 12 Nachhaltiger Konsum und Produktion", "sdg-12-nachhaltiger-konsum-produktion", "Produktportfolios, Beschaffung und Kreisläufe an realer Wirkung ausrichten."],
  ["SDG 13 Klimaschutz", "sdg-13-klimaschutz", "Klimarisiken, Emissionen und Transformationspfade in Unternehmensentscheidungen rückkoppeln."],
  ["SDG 16 Frieden, Gerechtigkeit und starke Institutionen", "sdg-16-frieden-gerechtigkeit-starke-institutionen", "Governance, Rechtsstaatlichkeit, Antikorruption und Vertrauen als Unternehmenswirkung."],
  ["SDG 17 Partnerschaften", "sdg-17-partnerschaften", "Branchenstandards, Lieferketten, Datenräume und Kooperationsfähigkeit stärken."],
];

const sdgPlus = [
  ["SDG+ Demokratie", "#sdgplus-demokratie", "Demokratische Stabilität, Teilhabe, Streitfähigkeit und Korrekturfähigkeit als Wirkungsbedingung."],
  ["SDG+ Medienqualität", "#sdgplus-medienqualitaet", "Quellenklarheit, öffentliche Information und Schutz vor Desinformation als Unternehmens- und Marktbedingung."],
  ["SDG+ Rechtsstaatlichkeit", "#sdgplus-rechtsstaatlichkeit", "Grundrechte, Verfahren, Rechtsschutz und Verhältnismäßigkeit als Schutz vor Willkür."],
  ["SDG+ institutionelles Vertrauen", "#sdgplus-institutionelles-vertrauen", "Vertrauen in faire, transparente und korrigierbare Institutionen."],
  ["SDG+ gesellschaftlicher Zusammenhalt", "#sdgplus-gesellschaftlicher-zusammenhalt", "Teilhabe, Fairness, Sicherheit und Zugehörigkeit in Märkten und Organisationen."],
  ["SDG+ digitale Selbstbestimmung", "#sdgplus-digitale-selbstbestimmung", "Datenrechte, digitale Souveränität und algorithmische Verantwortung."],
];

const bookAnchors = [
  ["Kapitel 42 - Unternehmen als Wirkungssysteme", "/referenz/kapitel-042-unternehmen-als-wirkungssysteme/"],
  ["Kapitel 43 - Wirkungsorientierte Unternehmensführung", "/referenz/kapitel-043-wirkungsorientierte-unternehmensfuehrung/"],
  ["Kapitel 44 - Wirkungscontrolling im Unternehmen", "/referenz/kapitel-044-wirkungscontrolling-im-unternehmen/"],
  ["Kapitel 45 - Organisation, Kultur und Verantwortung", "/referenz/kapitel-045-organisation-kultur-und-verantwortung/"],
  ["Kapitel 46 - Interne Wertschöpfung und Lieferkettensteuerung", "/referenz/kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung/"],
  ["Kapitel 47 - Unternehmensrisiko und Transformation", "/referenz/kapitel-047-unternehmensrisiko-und-transformation/"],
  ["Kapitel 31 - WÖk-IDs und Indikatorenarchitektur", "/referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/"],
  ["Kapitel 32 - Benchmarks, Skalen und Scorecards", "/referenz/kapitel-032-benchmarks-skalen-und-scorecards/"],
];

const crossLinks = [
  ["Wirtschaft & Unternehmen", "/wirkungsfelder/wirtschaft-unternehmen/", "Portal-Grundkonzept, Themenlandkarte und alle Detailkonzepte im Unternehmensbereich."],
  ["Unternehmen als Wirkungssysteme", "/wirkungsfelder/wirtschaft-unternehmen/unternehmen-als-wirkungssysteme/", "Zweck, Geschäftsmodell, Wertschöpfung und Rückkopplung."],
  ["Wirkungsorientierte Unternehmensführung", "/wirkungsfelder/wirtschaft-unternehmen/wirkungsorientierte-unternehmensfuehrung/", "Führung, Governance, Kultur und Anreizsysteme wirkungsorientiert ausrichten."],
  ["Risikomanagement, Resilienz und Finanzmarkt", "/wirkungsfelder/wirtschaft-unternehmen/risikomanagement-resilienz-finanzmarkt/", "Wirkungsrisiko, Finanzmarktanforderungen und Versicherbarkeit."],
  ["Resiliente Wertschöpfungsketten und Einkauf", "/wirkungsfelder/wirtschaft-unternehmen/wertschoepfungsketten-einkauf/", "Lieferketten, Einkauf, Supplier Scorecards und Resilienz."],
  ["Wirkungscontrolling", "/wirkungsfelder/wirtschaft-unternehmen/wirkungscontrolling/", "KII, NWI, T-SROI, Scorecards und Assurance im Unternehmen."],
  ["Produktentwicklung, Produktscorecards und Produktpässe", "/wirkungsfelder/wirtschaft-unternehmen/produktentwicklung-produktscorecards-produktpaesse/", "Produktwirkung, digitale Produktpässe und Verbraucherinformation."],
  ["Produkte & Konsum", "/wirkungsfelder/produkte-konsum/", "Produktwirkung, Wirkungsumsatzsteuer, Scorecards und Konsumentscheidungen."],
  ["Wirkungsumsatzsteuer", "/werkzeuge/wirkungsumsatzsteuer/", "Produktwirkung an Preis- und Steuerlogik rückkoppeln."],
  ["WÖk-IDs", "/werkzeuge/woek-ids/", "Indikatoren, Quellen, SDGs, SDG+ und Bewertungslogik verbinden."],
  ["Scorecards", "/werkzeuge/scorecards/", "Bewertungsraster für Unternehmen, Produkte, Risiken und Portfolios."],
  ["T-SROI", "/werkzeuge/impact-controlling/t-sroi/", "Transformationswirkung im Verhältnis zum Ressourceneinsatz bewerten."],
  ["Finanzsystem & Kapital", "/wirkungsfelder/finanzsystem-kapital/", "Kapitalwirkung, Banken, Versicherungen und Wirkungsfonds."],
  ["Arbeit & Einkommen", "/wirkungsfelder/arbeit-einkommen/", "Automatisierung, Maschinenleistung, Beschäftigung und Wirkungseinkommen."],
  ["Wissenschaft, Innovation & Digitalisierung", "/wirkungsfelder/wissenschaft-innovation-digitalisierung/", "Innovation, Datenräume, KI und digitale Infrastruktur."],
  ["Medien & Öffentlichkeit", "/wirkungsfelder/medien-oeffentlichkeit/", "Medienqualität, Plattformen, Diskurs und öffentliche Wirkung."],
  ["SDG-/SDG+-Referenzrahmen", "/verstehen/sdgs-sdgplus/", "Öffentlicher Bewertungsrahmen für positive, negative und neutrale Wirkung."],
  ["Online-Buch", "/referenz/", "Kapitel und Systemlogik der Wirkungsökonomie."],
];

const toolCards = [
  ["Unternehmens-Wirkungscheck", "/werkzeuge/unternehmens-wirkungscheck/", "Werkzeugseite vorhanden", "Erste Standortbestimmung für Zweck, Geschäftsmodell, Governance, Risiko und Wirkung."],
  ["KII-Dashboard", "", "Demo in Vorbereitung", "Kernwirkungsindikatoren statt nur klassische KPI im Management sichtbar machen."],
  ["T-SROI-Rechner", "/werkzeuge/impact-controlling/t-sroi/", "Methodenseite vorhanden", "Transformationsnutzen, Kosten, Risiken und systemische Wirkung vergleichen."],
  ["Lieferketten-Scorecard", "", "Demo in Vorbereitung", "Lieferantenentwicklung, Resilienz und negative Externalitäten strukturiert bewerten."],
  ["Produktpass-/Produktscorecard-Demo", "/werkzeuge/produktscorecards/", "Werkzeugseite vorhanden", "Produktwirkung, Datenräume und Verbraucherinformation verbinden."],
  ["Wirkungsrisiko-Check", "", "Demo in Vorbereitung", "Wirkungsrisiken in Enterprise Risk Management und Strategieprozesse integrieren."],
  ["EBA-Kreditdaten-Check", "", "Demo in Vorbereitung", "Bankfähige ESG- und Transformationsdaten für Kreditgespräche vorbereiten."],
  ["Versicherbarkeitscheck", "/wirkungsfelder/finanzsystem-kapital/versicherungen-resilienz/", "Kontextseite vorhanden", "Resilienz, Schutzlücken und Versicherbarkeit wirkungsökonomisch einordnen."],
  ["Stranded-Asset-Screener", "", "Demo in Vorbereitung", "Übergangsrisiken und Vermögenswerte mit sinkender Zukunftsfähigkeit sichtbar machen."],
  ["KMU-Wirkungsstart", "", "Demo in Vorbereitung", "Ein niederschwelliger Einstieg für kleine und mittlere Unternehmen."],
];

function htmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeMarkdown(markdown) {
  let cleaned = markdown
    .replace(
      /Enthält keine internen CodeX-\/Repository-Anweisungen/g,
      "Öffentliche Webfassung ohne technische Arbeitsnotizen"
    )
    .replace(/CodeX-\/Repository-Anweisungen/g, "technische Arbeitsnotizen")
    .replace(/CodeX/g, "redaktionelle Arbeitsnotizen")
    .replace(/Codex/g, "redaktionelle Arbeitsnotizen")
    .replace(/Repository/g, "Projektarchiv");
  while (/\|\s*\n\s*\n\s*\|/.test(cleaned)) {
    cleaned = cleaned.replace(/\|\s*\n\s*\n\s*\|/g, "|\n|");
  }
  return cleaned;
}

function inlineMarkdown(text) {
  let out = htmlEscape(text);
  out = out.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label, href) => {
    const safeHref = htmlEscape(href);
    const external = /^https?:\/\//.test(href);
    return `<a class="text-link" href="${safeHref}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  return out;
}

function parseTable(lines) {
  const rows = lines.map((line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
  );
  const header = rows[0] ?? [];
  const body = rows.slice(2);
  return `<div class="table-wrap"><table class="data-table"><thead><tr>${header
    .map((cell) => `<th>${inlineMarkdown(cell)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table></div>`;
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headings = [];
  const blocks = [];
  let paragraph = [];
  let list = null;
  let table = [];

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }
  function flushList() {
    if (list) {
      blocks.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`);
      list = null;
    }
  }
  function flushTable() {
    if (table.length) {
      blocks.push(parseTable(table));
      table = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    if (/^\|/.test(line)) {
      flushParagraph();
      flushList();
      table.push(line);
      continue;
    }
    flushTable();

    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(line);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const depth = headingMatch[1].length;
      const text = headingMatch[2].replace(/\s+#+$/, "");
      if (depth === 1) {
        continue;
      }
      const level = Math.min(depth, 3);
      const idBase = slugify(text.replace(/^\d+\.\s*/, ""));
      let id = idBase || `abschnitt-${headings.length + 1}`;
      let suffix = 2;
      while (headings.some((heading) => heading.id === id)) {
        id = `${idBase}-${suffix}`;
        suffix += 1;
      }
      headings.push({ level, text, id });
      blocks.push(`<h${level} id="${id}">${inlineMarkdown(text)} <a class="cite-anchor no-print" href="#${id}" aria-label="Zitierlink zu diesem Abschnitt">#</a></h${level}>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    const unordered = /^[-*]\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      flushParagraph();
      const type = ordered ? "ol" : "ul";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((ordered || unordered)[1]);
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushTable();

  return { headings, html: blocks.join("\n") };
}

function sitePathExists(sitePath) {
  if (!sitePath) return false;
  const local = path.join(root, sitePath.replace(/^\//, ""), "index.html");
  return fs.existsSync(local);
}

function renderToolCards(docTools = toolCards) {
  return docTools
    .map(([title, href, status, text]) => {
      const activeHref = sitePathExists(href) ? href : "";
      return `<article class="card">
        <p class="card-kicker">${status}</p>
        <h3 class="card-title">${htmlEscape(title)}</h3>
        <p class="card-text">${htmlEscape(text)}</p>
        <div class="portal-card-actions">${activeHref ? `<a class="text-link" href="${activeHref}">Öffnen</a>` : `<span class="prototype-badge">Demo in Vorbereitung</span>`}</div>
      </article>`;
    })
    .join("\n");
}

function renderLinkCards(items) {
  return items
    .filter(([, href]) => sitePathExists(href))
    .map(
      ([title, href, text]) => `<article class="card">
        <h3 class="card-title">${htmlEscape(title)}</h3>
        <p class="card-text">${htmlEscape(text)}</p>
        <div class="portal-card-actions"><a class="text-link" href="${href}">Öffnen</a></div>
      </article>`
    )
    .join("\n");
}

function renderPublicationCards(items = []) {
  const cards = items
    .filter(([, href]) => sitePathExists(href))
    .map(
      ([title, href, type, text]) => `<article class="card">
        <p class="card-kicker">${htmlEscape(type)}</p>
        <h3 class="card-title">${htmlEscape(title)}</h3>
        <p class="card-text">${htmlEscape(text)}</p>
        <div class="portal-card-actions"><a class="text-link" href="${href}">Onlinefassung und PDF öffnen</a></div>
      </article>`
    )
    .join("\n");
  if (!cards) return "";
  return `<section class="section" aria-labelledby="publikationen">
        <div class="section-header">
          <p class="hero-kicker">Bücher & Praxisleitfäden</p>
          <h2 id="publikationen">Vertiefende Publikationen <a class="cite-anchor no-print" href="#publikationen" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
          <p>Diese öffentlichen Fassungen sind online lesbar und ergänzend als PDF verfügbar.</p>
        </div>
        <div class="card-grid two">${cards}</div>
      </section>`;
}

function renderSdgRefs() {
  let index = 1;
  const sdgHtml = sdgs
    .map(([label, slug, text]) => {
      const id = `go5-sdg-${index++}`;
      return `<span class="sdg-ref"><a class="sdg-ref-link" href="/verstehen/sdgs-sdgplus/${slug}/" aria-label="${htmlEscape(`${label}: ${text}`)}" aria-describedby="${id}">${htmlEscape(label)}</a><button class="sdg-ref-info" type="button" aria-label="${htmlEscape(`Kurzbeschreibung zu ${label}: ${text}`)}" aria-describedby="${id}">i</button><span class="sdg-ref-popover" id="${id}" role="tooltip">${htmlEscape(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
    })
    .join("");
  const plusHtml = sdgPlus
    .map(([label, anchor, text]) => {
      const id = `go5-sdgplus-${index++}`;
      return `<span class="sdg-ref"><a class="sdg-ref-link" href="/verstehen/sdgs-sdgplus/${anchor}" aria-label="${htmlEscape(`${label}: ${text}`)}" aria-describedby="${id}">${htmlEscape(label)}</a><button class="sdg-ref-info" type="button" aria-label="${htmlEscape(`Kurzbeschreibung zu ${label}: ${text}`)}" aria-describedby="${id}">i</button><span class="sdg-ref-popover" id="${id}" role="tooltip">${htmlEscape(text)} <span class="sdg-ref-more">Details öffnen</span></span></span>`;
    })
    .join("");
  return `<div class="model-strip">${sdgHtml}${plusHtml}</div>`;
}

function renderToc(headings) {
  return `<nav class="toc-links" aria-label="Inhaltsverzeichnis">${headings
    .filter((heading) => heading.level <= 3)
    .map((heading) => `<a class="toc-level-${heading.level}" href="#${heading.id}">${inlineMarkdown(heading.text)}</a>`)
    .join("")}</nav>`;
}

function renderDownloads(doc) {
  const docxHref = `/assets/downloads/${doc.docx}`;
  const pdfHref = `/assets/downloads/${doc.pdf}`;
  return `<div class="card-grid two">
    <article class="card">
      <p class="card-kicker">DOCX · Detailkonzept · ${doc.number}</p>
      <h3 class="card-title">Word-Download</h3>
      <p class="card-text">Version ${doc.number} / v1.0, öffentliche Exportfassung.</p>
      <div class="portal-card-actions"><a class="text-link" href="${docxHref}">DOCX herunterladen</a></div>
    </article>
    <article class="card">
      <p class="card-kicker">PDF · Detailkonzept · ${doc.number}</p>
      <h3 class="card-title">PDF-Download</h3>
      <p class="card-text">Archiv- und Lesefassung. Online-Volltext bleibt der Hauptzugang.</p>
      <div class="portal-card-actions"><a class="text-link" href="${pdfHref}">PDF öffnen</a></div>
    </article>
  </div>`;
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell);
  return cells;
}

function writeCsvLine(cells) {
  return cells
    .map((cell) => {
      const value = String(cell);
      return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
    })
    .join(",");
}

function renderPage(doc, body, toc) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${htmlEscape(doc.title)} | Wirkungsökonomie</title>
    <meta name="description" content="${htmlEscape(doc.description)}">
    <meta name="search_title" content="${htmlEscape(doc.title)}">
    <meta name="search_description" content="${htmlEscape(doc.description)}">
    <meta name="search_section" content="Wirkungsfelder">
    <meta name="search_type" content="Detailkonzept">
    <link rel="canonical" href="https://wirkungsoekonomie.de/wirkungsfelder/wirtschaft-unternehmen/${doc.slug}/">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="de_DE">
    <meta property="og:site_name" content="Wirkungsökonomie">
    <meta property="og:title" content="${htmlEscape(doc.title)}">
    <meta property="og:description" content="${htmlEscape(doc.description)}">
    <meta property="og:url" content="https://wirkungsoekonomie.de/wirkungsfelder/wirtschaft-unternehmen/${doc.slug}/">
    <meta property="og:image" content="https://wirkungsoekonomie.de/assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png">
    <link rel="icon" href="/assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="/assets/css/style.css?v=20260604-menu-fix">
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="/assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation">
        <a href="/">Start</a>
        <a href="/verstehen.html">Verstehen</a>
        <a href="/wirkungsfelder/">Wirkungsfelder</a>
        <a href="/werkzeuge/">Werkzeuge</a>
        <a href="/erleben.html">Erleben</a>
        <a href="/werkstatt/">Werkstatt</a>
        <a href="/akademie.html">Akademie</a>
        <a href="/blog.html">Journal</a>
        <a href="/suche.html">Suche</a>
      </nav>
    </header>
    <main>
      <p class="print-meta">Wirkungsökonomie · ${htmlEscape(doc.title)} · https://wirkungsoekonomie.de/wirkungsfelder/wirtschaft-unternehmen/${doc.slug}/ · Druckdatum: 24.05.2026</p>
      <section class="hero portal-hero">
        <div class="hero-content">
          <nav class="breadcrumb"><a href="/">Start</a> / <a href="/wirkungsfelder/">Wirkungsfelder</a> / <a href="/wirkungsfelder/wirtschaft-unternehmen/">Wirtschaft &amp; Unternehmen</a></nav>
          <p class="hero-kicker">Wirtschaft &amp; Unternehmen · echtes Detailkonzept ${doc.number}</p>
          <h1>${htmlEscape(doc.title)}</h1>
          <p class="hero-subtitle">${htmlEscape(doc.subtitle)}</p>
          <p>${htmlEscape(doc.description)}</p>
          <div class="hero-actions no-print">
            <button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button>
            <a class="btn btn-primary" href="#online-volltext">Online-Volltext lesen</a>
            <a class="btn btn-secondary" href="#downloads">Downloads</a>
          </div>
        </div>
      </section>
      <section class="section" aria-labelledby="toc">
        <div class="section-header">
          <p class="hero-kicker">Online-Volltext</p>
          <h2 id="toc">Inhaltsverzeichnis <a class="cite-anchor no-print" href="#toc" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        ${toc}
      </section>
      <section class="section" aria-labelledby="tools">
        <div class="section-header">
          <p class="hero-kicker">Kontext</p>
          <h2 id="tools">Werkzeuge in diesem Bereich <a class="cite-anchor no-print" href="#tools" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        <div class="card-grid three">${renderToolCards(doc.tools || toolCards)}</div>
      </section>
      <section class="section" aria-labelledby="sdg-bezug">
        <div class="portal-reference-block">
          <p class="hero-kicker">Referenzrahmen</p>
          <h2 id="sdg-bezug">SDG-/SDG+-Bezug <a class="cite-anchor no-print" href="#sdg-bezug" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
          ${renderSdgRefs()}
          <p>Wirkung ist neutral und relational. Bewertet wird sie am Referenzrahmen der SDGs, der Agenda 2030 und SDG+. SDG+ ist keine offizielle UN-Kategorie, sondern eine transparente Erweiterung der Wirkungsökonomie.</p>
        </div>
      </section>
      ${renderPublicationCards(doc.publications)}
      <section class="section" aria-labelledby="buchanker">
        <div class="section-header">
          <p class="hero-kicker">Online-Buch</p>
          <h2 id="buchanker">Anker im Online-Buch <a class="cite-anchor no-print" href="#buchanker" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        <div class="model-strip">${bookAnchors
          .filter(([, href]) => sitePathExists(href))
          .map(([label, href]) => `<a href="${href}">${htmlEscape(label)}</a>`)
          .join("")}</div>
      </section>
      <section class="section" aria-labelledby="querverweise">
        <div class="section-header">
          <p class="hero-kicker">Vernetzung</p>
          <h2 id="querverweise">Querverlinkungen <a class="cite-anchor no-print" href="#querverweise" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        <div class="card-grid three">${renderLinkCards(crossLinks)}</div>
      </section>
      <section class="section prose-section" aria-labelledby="online-volltext">
        <div class="section-header">
          <p class="hero-kicker">Volltext</p>
          <h2 id="online-volltext">Online lesen <a class="cite-anchor no-print" href="#online-volltext" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
        </div>
        <article class="card longform-content">
          ${body}
        </article>
      </section>
      <section class="section" aria-labelledby="downloads">
        <div class="section-header">
          <p class="hero-kicker">Export</p>
          <h2 id="downloads">Downloads und Druck <a class="cite-anchor no-print" href="#downloads" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
          <p>Online-Volltext ist der Hauptzugang. Word und PDF sind ergänzende Export- und Archivfassungen.</p>
        </div>
        ${renderDownloads(doc)}
        <div class="portal-card-actions no-print"><button class="btn btn-secondary" type="button" onclick="window.print()" aria-label="Diese Seite drucken">Seite drucken</button></div>
      </section>
      <section class="section" aria-labelledby="quellenblock">
        <div class="card">
          <p class="hero-kicker">Quellen</p>
          <h2 id="quellenblock">Quellen und Referenzen <a class="cite-anchor no-print" href="#quellenblock" aria-label="Zitierlink zu diesem Abschnitt">#</a></h2>
          <p>Die Detailkonzepte nennen Quellen und Datenbezüge im Online-Volltext. Externe Regulierungs- und Methodenanschlüsse werden in den verlinkten Werkzeug- und Wirkungsfeldseiten fortgeführt.</p>
          <div class="model-strip">
            <a href="https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en" target="_blank" rel="noopener noreferrer">EU CSRD <span class="sr-only">(externe Quelle)</span></a>
            <a href="https://www.efrag.org/en/sustainability-reporting" target="_blank" rel="noopener noreferrer">EFRAG ESRS <span class="sr-only">(externe Quelle)</span></a>
            <a href="https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/sustainable-finance/guidelines-management-esg-risks" target="_blank" rel="noopener noreferrer">EBA ESG Risk Guidelines <span class="sr-only">(externe Quelle)</span></a>
            <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer">UN SDGs <span class="sr-only">(externe Quelle)</span></a>
          </div>
        </div>
      </section>
    </main>
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Wirkungsökonomie</p>
          <h2>Die neue Ordnung des Wohlstands</h2>
          <p>Wirkung sichtbar machen, bewerten und in Entscheidungen zurückführen.</p>
        </div>
        <nav class="footer-nav" aria-label="Footer Navigation">
          <div class="footer-nav-group"><h3>Wirkungsfelder</h3><div class="footer-nav-links"><a href="/wirkungsfelder/wirtschaft-unternehmen/">Wirtschaft &amp; Unternehmen</a><a href="/wirkungsfelder/produkte-konsum/">Produkte &amp; Konsum</a><a href="/wirkungsfelder/finanzsystem-kapital/">Finanzsystem &amp; Kapital</a></div></div>
          <div class="footer-nav-group"><h3>Werkzeuge</h3><div class="footer-nav-links"><a href="/werkzeuge/woek-ids/">WÖk-IDs</a><a href="/werkzeuge/scorecards/">Scorecards</a><a href="/werkzeuge/impact-controlling/t-sroi/">T-SROI</a></div></div>
          <div class="footer-nav-group"><h3>Referenz</h3><div class="footer-nav-links"><a href="/verstehen/sdgs-sdgplus/">SDG-/SDG+-Referenzrahmen</a><a href="/referenz/">Online-Buch</a><a href="/suche.html">Suche</a></div></div>
        </nav>
      </div>
    </footer>
    <script src="/assets/js/main.js?v=20260604-wirkungsraum" defer></script>
  </body>
</html>`;
}

fs.mkdirSync(path.join(root, "assets/downloads"), { recursive: true });
fs.mkdirSync(path.join(root, "data/wirtschaft-unternehmen"), { recursive: true });
fs.copyFileSync(path.join(packageDir, "data/go5_detailkonzepte_index_v1_0.json"), path.join(root, "data/wirtschaft-unternehmen/go5_detailkonzepte_index_v1_0.json"));
fs.writeFileSync(
  path.join(root, "data/wirtschaft-unternehmen/go5_detailkonzepte_index_v1_0.csv"),
  fs.readFileSync(path.join(packageDir, "data/go5_detailkonzepte_index_v1_0.csv"), "utf8").replace(/\r\n/g, "\n")
);
fs.copyFileSync(path.join(packageDir, "data/wirtschaft_unternehmen_detailkonzepte_gesamtindex_v1_1.json"), path.join(root, "data/wirtschaft-unternehmen/wirtschaft_unternehmen_detailkonzepte_gesamtindex_v1_1.json"));
fs.writeFileSync(
  path.join(root, "data/wirtschaft-unternehmen/wirtschaft_unternehmen_detailkonzepte_gesamtindex_v1_1.csv"),
  fs.readFileSync(path.join(packageDir, "data/wirtschaft_unternehmen_detailkonzepte_gesamtindex_v1_1.csv"), "utf8").replace(/\r\n/g, "\n")
);
if (fs.existsSync(path.join(packageDir, "data/go6_detailkonzepte_index_v1_0.json"))) {
  const indexJson = JSON.parse(fs.readFileSync(path.join(packageDir, "data/go6_detailkonzepte_index_v1_0.json"), "utf8"));
  const publicIndexJson = indexJson.map(({ codex_url_hint: _internal, ...entry }) => entry);
  fs.writeFileSync(
    path.join(root, "data/wirtschaft-unternehmen/go6_detailkonzepte_index_v1_0.json"),
    `${JSON.stringify(publicIndexJson, null, 2)}\n`
  );

  const csv = fs.readFileSync(path.join(packageDir, "data/go6_detailkonzepte_index_v1_0.csv"), "utf8").trimEnd();
  const [headerLine, ...rows] = csv.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  const internalIndex = headers.indexOf("codex_url_hint");
  const publicHeaders = headers.filter((_header, index) => index !== internalIndex);
  const publicRows = rows.map((row) => writeCsvLine(parseCsvLine(row).filter((_cell, index) => index !== internalIndex)));
  fs.writeFileSync(
    path.join(root, "data/wirtschaft-unternehmen/go6_detailkonzepte_index_v1_0.csv"),
    `${[writeCsvLine(publicHeaders), ...publicRows].join("\n")}\n`
  );
}
if (fs.existsSync(path.join(packageDir, "data/go7_detailkonzepte_index_v1_0.json"))) {
  const indexJson = JSON.parse(fs.readFileSync(path.join(packageDir, "data/go7_detailkonzepte_index_v1_0.json"), "utf8"));
  const publicIndexJson = indexJson.map(({ codex_url_hint: _internal, url_vorschlag: _internalUrl, ...entry }) => entry);
  fs.writeFileSync(
    path.join(root, "data/wirtschaft-unternehmen/go7_detailkonzepte_index_v1_0.json"),
    `${JSON.stringify(publicIndexJson, null, 2)}\n`
  );

  const csv = fs.readFileSync(path.join(packageDir, "data/go7_detailkonzepte_index_v1_0.csv"), "utf8").trimEnd();
  const [headerLine, ...rows] = csv.split(/\r?\n/);
  const headers = parseCsvLine(headerLine);
  const internalIndexes = new Set(["codex_url_hint", "url_vorschlag"].map((name) => headers.indexOf(name)).filter((index) => index >= 0));
  const publicHeaders = headers.filter((_header, index) => !internalIndexes.has(index));
  const publicRows = rows.map((row) => writeCsvLine(parseCsvLine(row).filter((_cell, index) => !internalIndexes.has(index))));
  fs.writeFileSync(
    path.join(root, "data/wirtschaft-unternehmen/go7_detailkonzepte_index_v1_0.csv"),
    `${[writeCsvLine(publicHeaders), ...publicRows].join("\n")}\n`
  );
}

for (const doc of docs) {
  const sourceBase = doc.baseDir || packageDir;
  fs.copyFileSync(path.join(sourceBase, doc.docxSubdir || "", doc.docx), path.join(root, "assets/downloads", doc.docx));
  fs.copyFileSync(path.join(sourceBase, doc.pdfSubdir || "", doc.pdf), path.join(root, "assets/downloads", doc.pdf));

  const markdown = sanitizeMarkdown(fs.readFileSync(path.join(sourceBase, doc.source), "utf8"));
  const { headings, html } = renderMarkdown(markdown);
  const page = renderPage(doc, html, renderToc(headings));
  const targetDir = path.join(root, "wirkungsfelder/wirtschaft-unternehmen", doc.slug);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), page);
}

const publicPages = docs.map((doc) => path.join(root, "wirkungsfelder/wirtschaft-unternehmen", doc.slug, "index.html"));
const forbidden = [/CodeX/i, /Codex/i, /Repository/i, /Sitemap aktualisieren/i, /Dateien anlegen/i, /bitte prüfen/i, /ChatGPT/i, /interne Aufgabe/i, /Abschlussbericht/i];
for (const file of publicPages) {
  const text = fs.readFileSync(file, "utf8");
  const hit = forbidden.find((pattern) => pattern.test(text));
  if (hit) {
    throw new Error(`Öffentlicher Inhalt enthält internen Begriff (${hit}) in ${file}`);
  }
}
