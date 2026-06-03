import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-03";

const sourcePack = {
  id: "climate-energy-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  primary_sources: [
    {
      label: "IPCC AR6 Synthesis Report - Headline Statements",
      publisher: "IPCC",
      url: "https://www.ipcc.ch/report/ar6/syr/resources/spm-headline-statements/",
      type: "wissenschaft",
      use_for: ["Klimawandel Grundlagen", "menschliche Ursache", "Risiken je Erwärmungsgrad", "Dringlichkeit", "Mitigation und Anpassung"],
    },
    {
      label: "Umweltbundesamt - Treibhausgas-Emissionen in Deutschland",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/daten/umweltzustand-trends/klima/treibhausgas-emissionen-in-deutschland",
      type: "amtlich",
      use_for: ["Deutschland Emissionen", "Sektoren", "Trends", "Datenstand Deutschland"],
    },
    {
      label: "EDGAR/JRC - globale Treibhausgasemissionen 2025 Report",
      publisher: "European Commission JRC / EDGAR",
      url: "https://edgar.jrc.ec.europa.eu/report_2025",
      type: "datenbank",
      use_for: ["globale Treibhausgasemissionen", "Vergleichsgröße", "territoriale Anteile"],
    },
    {
      label: "Umweltbundesamt - Treibhausgasemissionen pro Person",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/service/uba-fragen/wie-hoch-sind-die-treibhausgasemissionen-pro-person",
      type: "amtlich",
      use_for: ["Konsumemissionen", "Import-Export-Berücksichtigung", "deutscher Pro-Kopf-Fußabdruck"],
    },
    {
      label: "Eurostat - Greenhouse gas emission footprints",
      publisher: "Eurostat",
      url: "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Greenhouse_gas_emission_footprints",
      type: "datenbank",
      use_for: ["Konsum-Fußabdruck", "produktionsbasierte und konsumbasierte Bilanz", "EU-Länder Vergleich"],
    },
    {
      label: "Umweltbundesamt - Treibhausgas-Projektionen",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/themen/klima-energie/klimaschutz-energiepolitik-in-deutschland/szenarien-projektionen/treibhausgas-projektionen/aktuelle-treibhausgas-projektionen",
      type: "amtlich",
      use_for: ["Zielpfade", "Klimaneutralität 2045", "Sektorale Lücken"],
    },
    {
      label: "Fraunhofer ISE / Energy-Charts",
      publisher: "Fraunhofer ISE",
      url: "https://www.energy-charts.info/",
      type: "datenbank",
      use_for: ["Strommix Deutschland", "Erneuerbare Stromerzeugung", "Energiewende Fakten"],
    },
    {
      label: "IEA - Renewables",
      publisher: "International Energy Agency",
      url: "https://www.iea.org/energy-system/renewables",
      type: "wissenschaft_daten",
      use_for: ["globaler Ausbau erneuerbarer Energien", "Solar und Wind", "Net Zero Pfade"],
    },
    {
      label: "GHG Protocol - Corporate Value Chain Scope 3 Standard",
      publisher: "GHG Protocol",
      url: "https://ghgprotocol.org/corporate-value-chain-scope-3-standard",
      type: "standard",
      use_for: ["Scope 3", "Use of Sold Products", "Wertschöpfungskettenemissionen"],
    },
    {
      label: "Destatis - 3.4 million new cars exported from Germany in 2024",
      publisher: "Statistisches Bundesamt",
      url: "https://www.destatis.de/EN/Press/2025/03/PE25_110_51.html",
      type: "amtlich",
      use_for: ["Autoexporte Deutschland", "exportierte Produktnutzung", "Antriebsarten 2024"],
    },
    {
      label: "Our World in Data - Share of global cumulative CO2 emissions",
      publisher: "Our World in Data",
      url: "https://ourworldindata.org/grapher/share-of-cumulative-co2",
      type: "datenbank",
      use_for: ["historische Emissionen", "kumulative Klimawirkung", "Jahresanteil versus Historie"],
    },
    {
      label: "Umweltbundesamt - Klimavorteil für E-Autos bestätigt",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/presse/pressemitteilungen/klimavorteil-fuer-e-autos-bestaetigt",
      type: "amtlich",
      use_for: ["E-Auto Lebenszyklus", "Batterie und Strommix", "Mobilitätsmythen"],
    },
    {
      label: "ICCT - Life-cycle greenhouse gas emissions from passenger cars in Europe",
      publisher: "ICCT",
      url: "https://theicct.org/publication/electric-cars-life-cycle-analysis-emissions-europe-jul25/",
      type: "wissenschaft",
      use_for: ["Lebenszyklusvergleich E-Auto Verbrenner", "EU-Fahrzeugemissionen"],
    },
    {
      label: "Umweltbundesamt - Windenergie an Land",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/windenergie-an-land",
      type: "amtlich",
      use_for: ["Windkraft", "Artenschutz", "Planung und Genehmigung"],
    },
    {
      label: "BASE - Endlagersuche",
      publisher: "Bundesamt für die Sicherheit der nuklearen Entsorgung",
      url: "https://www.base.bund.de/de/endlager/endlagersuche/endlagersuche_inhalt.html",
      type: "amtlich",
      use_for: ["Kernenergie", "Atommüll", "Endlagerung"],
    },
    {
      label: "ITER - In a Few Lines",
      publisher: "ITER Organization",
      url: "https://www.iter.org/few-lines",
      type: "wissenschaft_technik",
      use_for: ["Fusionsforschung", "ITER Zielsetzung"],
    },
    {
      label: "EUROfusion - DEMO",
      publisher: "EUROfusion",
      url: "https://euro-fusion.org/programme/demo/",
      type: "wissenschaft_technik",
      use_for: ["Fusionskraftwerke", "DEMO", "Technologiereife"],
    },
  ],
};

const deepDiveSourcePack = {
  id: "deep-dive-climate-energy-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  sources: {
    ipcc_ar6_headline: {
      label: "IPCC AR6 Synthesis Report - Headline Statements",
      url: "https://www.ipcc.ch/report/ar6/syr/resources/spm-headline-statements/",
      type: "wissenschaft",
      relevance: ["Klimawissenschaft", "Risiken je Erwärmungsgrad", "menschliche Ursache"],
    },
    ipcc_wg1_headline: {
      label: "IPCC AR6 WGI - Headline Statements",
      url: "https://www.ipcc.ch/report/ar6/wg1/resources/spm-headline-statements/",
      type: "wissenschaft",
      relevance: ["menschlicher Einfluss", "Atmosphäre, Ozean, Land"],
    },
    uba_emissions_germany: {
      label: "Umweltbundesamt - Treibhausgasemissionen Deutschland",
      url: "https://www.umweltbundesamt.de/daten/umweltzustand-trends/klima/treibhausgas-emissionen-in-deutschland",
      type: "amtlich",
      relevance: ["Deutschland Emissionen", "Klimaziele", "Sektortrends"],
    },
    fraunhofer_ise_energy_charts: {
      label: "Fraunhofer ISE / Energy-Charts",
      url: "https://www.energy-charts.info/",
      type: "datenbank",
      relevance: ["Strommix", "erneuerbare Energien", "Energiewende"],
    },
    icct_lca_ev_2025: {
      label: "ICCT - Life-cycle greenhouse gas emissions from passenger cars in Europe, 2025",
      url: "https://theicct.org/publication/electric-cars-life-cycle-analysis-emissions-europe-jul25/",
      type: "wissenschaft",
      relevance: ["E-Auto Lebenszyklus", "Verbrennervergleich", "Batterie und Strommix"],
    },
    base_endlager: {
      label: "BASE - Endlagersuche",
      url: "https://www.base.bund.de/de/endlager/endlagersuche/endlagersuche_inhalt.html",
      type: "amtlich",
      relevance: ["Kernenergie", "Endlagerung", "radioaktive Abfälle"],
    },
    iea_nuclear: {
      label: "IEA - The Path to a New Era for Nuclear Energy",
      url: "https://www.iea.org/reports/the-path-to-a-new-era-for-nuclear-energy/executive-summary",
      type: "wissenschaft_daten",
      relevance: ["Kernenergie", "Kosten", "Bauzeiten", "Energiesicherheit"],
    },
    iter: {
      label: "ITER - In a Few Lines",
      url: "https://www.iter.org/few-lines",
      type: "wissenschaft_technik",
      relevance: ["Fusion", "Fusionsleistung", "Forschungsstatus"],
    },
    eurofusion_demo: {
      label: "EUROfusion - DEMO",
      url: "https://euro-fusion.org/programme/demo/",
      type: "wissenschaft_technik",
      relevance: ["Fusionskraftwerke", "Demonstrationskraftwerk", "Technologiereife"],
    },
  },
};

const mapping = {
  id: "climate-energy-mapping-v1",
  last_updated: UPDATED_AT,
  wok_mapping: {
    dimensions: {
      mensch: [
        "Gesundheit durch Luftqualität, Hitze- und Katastrophenschutz",
        "Energiearmut und soziale Abfederung",
        "Arbeitsplätze, Qualifizierung und regionale Strukturentwicklung",
      ],
      planet: ["Treibhausgasemissionen", "Ressourcenverbrauch", "Biodiversität", "Wasser, Boden und Flächen"],
      demokratie: [
        "Vertrauen in Wissenschaft und Institutionen",
        "Diskursfähigkeit",
        "Beteiligung bei Infrastruktur",
        "Schutz vor Desinformation und Polarisierung",
      ],
    },
    relevant_sdgs: [
      "SDG 3 - Gesundheit",
      "SDG 7 - Bezahlbare und saubere Energie",
      "SDG 8 - Menschenwürdige Arbeit und Wirtschaft",
      "SDG 9 - Industrie, Innovation und Infrastruktur",
      "SDG 11 - Nachhaltige Städte und Gemeinden",
      "SDG 12 - Nachhaltige Produktion und Konsum",
      "SDG 13 - Klimaschutz",
      "SDG 15 - Leben an Land",
      "SDG 16 - Frieden, Gerechtigkeit und starke Institutionen",
    ],
    relevant_sdg_plus: [
      "Wissensqualität",
      "Medienqualität",
      "Diskursfähigkeit",
      "institutionelles Vertrauen",
      "Schutz vor Manipulation",
      "demokratische Beteiligung",
      "digitale Selbstbestimmung",
    ],
    rule:
      "Nichtkompensation / Reverse Merit Order: Gute Klimawerte dürfen soziale Verdrängung, schlechte Arbeitsbedingungen, Biodiversitätsschäden oder demokratische Destabilisierung nicht verdecken.",
  },
};

const factStatus = {
  data_stand: UPDATED_AT,
  update_frequency: "quarterly",
  update_triggers: [
    "Neue UBA-Emissionsdaten",
    "Neue IPCC-/WMO-/Copernicus-Berichte",
    "Neue Strommixdaten Fraunhofer ISE / Energy-Charts",
    "Neue IEA-Berichte",
    "Neue Lebenszyklusanalysen zu E-Mobilität und Batterien",
    "Neue politische Zielpfade oder Gesetzesänderungen",
  ],
  warning: "Zahlen zu Emissionen, Strommix, Preisen, Ausbaupfaden und Technologie-Kosten regelmäßig aktualisieren.",
};

const glossaryLinks = [
  ["wirkung", "Wirkung"],
  ["wirkungspotenzial", "Wirkungspotenzial"],
  ["wirkungsrisiko", "Wirkungsrisiko"],
  ["wirkungspfad", "Wirkungspfad"],
  ["resonanzraum", "Resonanzraum"],
  ["wirkungslenkung", "Wirkungslenkung"],
  ["positive-netto-wirkung", "Positive Netto-Wirkung"],
  ["reverse-merit-order", "Reverse Merit Order"],
  ["sdg-plus", "SDG+"],
  ["t-sroi", "T-SROI"],
  ["woek-id", "WÖk-ID"],
];

const frameResponses = {
  ohnmacht:
    "Ich beantworte das, aber ich übernehme nicht den Frame. Der Frame lautet: Unser Handeln sei wirkungslos. Die bessere Frage ist: Welche Hebel haben wir tatsächlich?",
  verzoegerung:
    "Ich beantworte das, aber ich übernehme nicht den Frame. Der Frame lautet: Erst später handeln sei vernünftiger. Die wirkungsökonomische Frage ist: Welche Kosten und Risiken erzeugt weiteres Warten?",
  scheitern:
    "Ich beantworte das, aber ich übernehme nicht den Totalframe. Probleme sind nicht automatisch Scheitern. Die Frage ist: Welcher Engpass begrenzt die Wirkung?",
  technikwunder:
    "Ich beantworte das, aber ich übernehme nicht den Aufschubframe. Forschung ist wichtig. Aber ungewisse Zukunftstechnik ersetzt keine heute verfügbare Wirkung.",
  verbotsangst:
    "Ich beantworte das, aber ich übernehme nicht den Verbotsframe. Nicht jede Regel ist ein Verbot. Die Frage ist: Welche Freiheit wird geschützt, welche Schäden werden vermieden und wie demokratisch ist die Maßnahme?",
};

const methodChecklist = [
  "Was ist der wahre Kern?",
  "Was fehlt?",
  "Welche Schlussfolgerung ist falsch?",
  "Welches Narrativ wirkt?",
  "Welches Wirkungspotenzial entsteht?",
  "Welche Folgen hätte falsches Handeln?",
  "Welche Lösung erzeugt positive Netto-Wirkung?",
];

const clusterSummary = [
  ["Kernfrage", "Welche Klima- und Energieaussagen erzeugen Handlungsfähigkeit - und welche blockieren sie?", "neutral"],
  ["Häufige Narrative", "Ohnmacht, Verzögerung, Verbotsangst, Scheitern, Technikwunder, Sündenbock.", "warning"],
  ["Wirkungsrisiko", "Falsche Aussagen können Investitionen, Infrastruktur und demokratische Akzeptanz verzögern.", "critical"],
  ["Faktenbasis", "IPCC, UBA, IEA, Fraunhofer ISE, ICCT, BASE, BfN.", "neutral"],
  ["WÖk-Maßstab", "Mensch, Planet und Demokratie.", "positive"],
  ["Lösungslogik", "Wirkung sichtbar machen, in Preise und Entscheidungen rückkoppeln, soziale Abfederung sichern.", "positive"],
];

const subtopics = [
  {
    slug: "klimawandel",
    title: "Klimawandel",
    subtitle: "Fakten, Mythen, Narrative und Wirkungspfade",
    abstract:
      "Der Klimawandel ist nicht nur ein naturwissenschaftliches Thema, sondern ein Wirkungsraum für Gesundheit, Sicherheit, Ernährung, Wasser, Infrastruktur, Wirtschaft und Demokratie. Die zentrale Faktenlage ist klar: Menschliche Treibhausgasemissionen treiben die gegenwärtige Erwärmung. Viele Debatten drehen sich aber nicht um diese Grundlage, sondern um Narrative: Verharmlosung, Ursachenumdeutung, Ohnmacht, Verzögerung oder Wissenschaftsangriff. Der Wirkungsradar trennt deshalb Faktenkern, irreführende Schlussfolgerung und Wirkungspfad. Wirkungsökonomisch geht es nicht nur darum, CO₂ zu senken, sondern darum, Entscheidungen so zu lenken, dass Mensch, Planet und Demokratie zugleich stabilisiert werden.",
    summary: [
      ["Kernfakt", "Menschliche Treibhausgasemissionen sind der Haupttreiber der heutigen Erwärmung.", "neutral"],
      ["Häufiger Denkfehler", "Natürliche Klimaveränderungen werden genutzt, um die heutige Ursache umzudeuten.", "warning"],
      ["Häufiges Narrativ", "Verharmlosung, Ohnmacht, Verzögerung, Wissenschaftsdelegitimierung.", "warning"],
      ["Wirkungsrisiko", "Notwendige Emissionsminderung, Anpassung und Infrastrukturumbau werden verzögert.", "critical"],
      ["WÖk-Lösung", "Emissionen, Ressourcen, Lieferketten, Gesundheit und Demokratie in Preise, Steuern und Investitionen rückkoppeln.", "positive"],
      ["Quellen", "IPCC, UBA, WMO/Copernicus optional, IEA.", "neutral"],
    ],
    claims: ["klima-hat-sich-schon-immer-veraendert", "co2-ist-nur-ein-spurengas", "deutschland-nur-zwei-prozent"],
  },
  {
    slug: "energiewende",
    title: "Energiewende",
    subtitle: "Stromsystem, Netze, Speicher, Preise und Akzeptanz",
    abstract:
      "Die Energiewende ist ein Systemumbau, kein einzelner Schalter. Wirkungsökonomisch zählen Emissionsminderung, Versorgungssicherheit, Kosten, soziale Abfederung, Netze, Speicher, Flexibilität und demokratische Akzeptanz zusammen. Scheiternsframes sind besonders wirksam, weil sie reale Engpässe aufgreifen und daraus ein Totalurteil machen.",
    summary: [
      ["Kernfrage", "Welche Engpässe begrenzen Wirkung im Strom- und Energiesystem?", "neutral"],
      ["Narrative", "Scheiternsframe, Verzögerung, Verbotsangst und Technikaufwand.", "warning"],
      ["Wirkungsrisiko", "Investitionssicherheit und Akzeptanz sinken, wenn Engpässe als Totalversagen gerahmt werden.", "critical"],
      ["WÖk-Lösung", "Von Lagerkampf zu Engpasslogik, Wirkungshaushalten und T-SROI für Infrastruktur.", "positive"],
    ],
    claims: ["energiewende-gescheitert", "windraeder-zerstoeren-natur", "klimaschutz-ist-oekodiktatur"],
  },
  {
    slug: "mobilitaet-batterien",
    title: "Mobilität & Batterien",
    subtitle: "Lebenszyklus, Rohstoffe, Recycling und Mobilitätswirkung",
    abstract:
      "Mobilitätsdebatten kippen schnell in Lagerlogik. Der Wirkungsradar prüft deshalb Produktlebenszyklus, Strommix, Fahrzeuggröße, Nutzung, Rohstoffe, Arbeitsbedingungen, Recycling und Alternativen. Nicht das Symbol E-Auto entscheidet, sondern die positive Netto-Wirkung der Mobilitätslösung.",
    summary: [
      ["Kernfrage", "Welche Mobilitätslösung erzeugt über den Lebenszyklus die bessere Netto-Wirkung?", "neutral"],
      ["Narrative", "Rohstoffangst, Verzögerung, falscher Lebenszyklusvergleich.", "warning"],
      ["Wirkungsrisiko", "Fossile Mobilität bleibt länger bestehen, wenn Herstellung isoliert betrachtet wird.", "critical"],
      ["WÖk-Lösung", "Produktscorecards für CO₂, Ressourcen, Arbeit, Gesundheit, Recycling und Energiequelle.", "positive"],
    ],
    claims: ["e-autos-schlimmer-als-verbrenner", "batterien-sind-nicht-recyclebar"],
  },
  {
    slug: "kernenergie-fusion",
    title: "Kernenergie & Fusion",
    subtitle: "Zeitpfad, Kosten, Endlagerung und Technologiereife",
    abstract:
      "Kernenergie und Fusion sind keine reinen Faktenfragen, sondern Strategie- und Zeitpfadfragen. Wirkungsökonomisch zählt, was im konkreten Land, im relevanten Zeitraum und im Vergleich zu Alternativen Wirkung erzeugt. Forschung bleibt wichtig, darf aber nicht zum Aufschubframe werden.",
    summary: [
      ["Kernfrage", "Was wirkt rechtzeitig, bezahlbar, skalierbar und mit geringster Netto-Negativwirkung?", "neutral"],
      ["Narrative", "Technikwunder, Opportunitätskosten, Scheiternsframe gegen Erneuerbare.", "warning"],
      ["Wirkungsrisiko", "Schnellere Lösungen werden verzögert, wenn Zukunftstechnik heutige Wirkung ersetzt.", "critical"],
      ["WÖk-Lösung", "Technologien nach Zeithorizont, Kosten, Risiken, Alternativen und Systemwirkung bewerten.", "positive"],
    ],
    claims: ["kernenergie-einfache-loesung", "fusion-loest-das-problem"],
  },
  {
    slug: "industrie-wirtschaft",
    title: "Industrie & Wirtschaft",
    subtitle: "Wettbewerbsfähigkeit, Transformation und Wohlstand",
    abstract:
      "Industrie- und Wohlstandsdebatten nutzen oft Verlustframes. Der wahre Kern ist: Transformation verändert Kosten, Geschäftsmodelle und Arbeit. Irreführend wird es, wenn Klimaschutz pauschal als Wohlstandsfeind gerahmt wird und fossile Abhängigkeit, CO₂-Kosten, alte Anlagen, Importabhängigkeit und Innovationschancen ausgeblendet werden.",
    summary: [
      ["Kernfrage", "Welche Industrie ist in einer klimaneutralen Welt zukunftsfähig?", "neutral"],
      ["Narrative", "Angstframe, Statusverlust, Scheiternsframe und Verzögerung.", "warning"],
      ["Wirkungsrisiko", "Zukunftsinvestitionen werden blockiert, alte Abhängigkeiten bleiben bestehen.", "critical"],
      ["WÖk-Lösung", "Industriepolitik nach Zukunftswirkung: Netze, sauberer Strom, Kreislaufwirtschaft und Qualifizierung.", "positive"],
    ],
    claims: ["klimaschutz-deindustrialisiert-deutschland"],
  },
];

const claims = [
  {
    title: "„Klima hat sich schon immer verändert“",
    slug: "klima-hat-sich-schon-immer-veraendert",
    shortJudgement: "Wahrer Kern, falsche Ursache.",
    narrativeFamilies: ["Ursachenumdeutung", "Verharmlosung"],
    riskLevel: "hoch",
    themes: ["Klimawandel"],
    sdgs: ["SDG 13", "SDG 15", "SDG 3"],
    sdgPlus: ["Wissensqualität", "Diskursfähigkeit"],
    subtitle: "Wahrer Kern, falsche Ursache",
    abstract:
      "Die Aussage enthält einen wahren Kern: Das Klima der Erde hat sich in der Erdgeschichte immer wieder verändert. Irreführend wird sie, wenn daraus abgeleitet wird, die heutige Erwärmung sei deshalb natürlich oder harmlos. Wirkungsökonomisch ist die Aussage ein Ursachenumdeutungs-Wirkstoff: Sie verschiebt Verantwortung von fossilen Emissionen auf ein allgemeines „war schon immer so“. Der Denkfehler liegt darin, Möglichkeit mit Ursache zu verwechseln. Die bessere Antwort lautet: Ja, Klima verändert sich - die entscheidende Frage ist, was die heutige Veränderung verursacht und welche Folgen Nicht-Handeln hat.",
    summary: {
      judgement: "Wahrer Kern, falsche Ursache.",
      true_core: "Klima hat sich historisch immer wieder verändert.",
      problem: "Daraus folgt nicht, dass die heutige Erwärmung natürlich verursacht ist.",
      narrative: "Ursachenumdeutung / Verharmlosung.",
      risk: "Verantwortung und Handlungsdruck werden abgeschwächt.",
      host_answer: "Ja, Klima verändert sich. Die Frage ist: Was treibt die heutige Veränderung an?",
    },
    answers: {
      ten_seconds: "Ja, Klima hat sich immer verändert. Die entscheidende Frage ist aber: Was verursacht die heutige schnelle Erwärmung?",
      thirty_seconds:
        "Der wahre Kern ist: Klima war nie statisch. Der Denkfehler ist: Daraus folgt nicht, dass die heutige Erwärmung natürlich ist. Wir wissen, dass menschliche Treibhausgase der Haupttreiber sind. Also geht es nicht um „ob Klima sich ändert“, sondern um Ursache, Geschwindigkeit und Folgen.",
      two_minutes:
        "Ich ordne das kurz ein. Natürlich hat sich Klima in der Erdgeschichte verändert. Aber das ist kein Gegenargument zur heutigen menschengemachten Erwärmung. Auch Feuer gab es schon immer - trotzdem kann ein bestimmter Brand eine bestimmte Ursache haben. Die wirkungsökonomische Frage lautet: Welche Ursache wirkt heute, welche Schäden entstehen, wenn wir sie ignorieren, und welche Maßnahmen reduzieren die negative Wirkung für Mensch, Planet und Demokratie?",
    },
    effectPath: [
      ["Aussage", "Klima hat sich schon immer verändert."],
      ["Wirkstoff", "Historischer Allgemeinsatz als Verantwortungsverschiebung."],
      ["Resonanz", "Entlastung, Verharmlosung, Zweifel."],
      ["Wirkungspotenzial", "Die heutige Ursache wird unscharf."],
      ["Wirkungsrisiko", "Emissionsminderung und Anpassung verlieren Dringlichkeit."],
      ["Folge falschen Handelns", "Klimarisiken, Kosten und Anpassungsdruck steigen."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Was verursacht die heutige schnelle Erwärmung - und was folgt daraus?",
    dontDo: ["Nicht über Erdgeschichte dozieren, bevor die heutige Ursache geklärt ist.", "Nicht den Frame übernehmen, dass Veränderung automatisch Harmlosigkeit bedeutet."],
    facts: ["Natürliche Klimaveränderungen gab es, aber Ursache und Geschwindigkeit müssen konkret geprüft werden.", "Die Seite trennt Möglichkeit, Ursache und Wirkungspfad."],
    consequences: ["Handlungsdruck sinkt.", "Anpassungs- und Klimafolgekosten steigen.", "Wissenschaftsvertrauen wird geschwächt."],
    woekSolution: ["CO₂- und Methanwirkung in Produkt-, Energie- und Lieferkettenscorecards erfassen.", "Fossile Wirkung in Preisen und Steuern abbilden.", "Klimafolgekosten in T-SROI und öffentliche Investitionsentscheidungen integrieren.", "Anpassung als Wirkungsinvestition bewerten, nicht als Reparaturkosten."],
    mpd: {
      mensch: "Hitze, Gesundheit, Sicherheit und Anpassungskosten werden unterschätzt.",
      planet: "Emissionen und ökologische Folgeschäden bleiben länger wirksam.",
      demokratie: "Wissensqualität und Diskursfähigkeit werden geschwächt.",
    },
    sources: ["IPCC AR6 Synthesis Report - Headline Statements", "Umweltbundesamt - Treibhausgas-Emissionen in Deutschland"],
  },
  {
    title: "„CO₂ ist nur ein Spurengas“",
    slug: "co2-ist-nur-ein-spurengas",
    shortJudgement: "Irreführend.",
    narrativeFamilies: ["Scheinfakt", "Wissenschaftsdelegitimierung"],
    riskLevel: "hoch",
    themes: ["Klimawandel"],
    sdgs: ["SDG 13"],
    sdgPlus: ["Wissenschaftsvertrauen"],
    subtitle: "Scheinfakt, falsche Schlussfolgerung",
    abstract:
      "Die Aussage nutzt einen scheinbar sachlichen Zahlenframe: CO₂ macht nur einen kleinen Anteil der Atmosphäre aus. Irreführend wird daraus die Schlussfolgerung, CO₂ könne deshalb keine starke Wirkung haben. Wirkungsökonomisch ist das ein Scheinfakt-Wirkstoff: Eine kleine Konzentration wird mit kleiner Wirkung verwechselt. Entscheidend ist aber nicht der Mengenanteil allein, sondern die physikalische Wirkung auf Wärmestrahlung, Rückkopplungen und den Energiehaushalt der Erde. Die bessere Antwort lautet: Auch kleine Mengen können große Systemwirkung haben, wenn sie an einer wirksamen Stelle im System ansetzen.",
    summary: {
      judgement: "Irreführend.",
      true_core: "CO₂ ist mengenmäßig ein kleiner Bestandteil der Atmosphäre.",
      problem: "Kleine Konzentration wird mit kleiner Wirkung verwechselt.",
      narrative: "Scheinfakt / Wissenschaftsdelegitimierung.",
      risk: "Physikalische Ursache wird verharmlost.",
      host_answer: "Kleine Menge heißt nicht kleine Wirkung. Entscheidend ist der Wirkmechanismus.",
    },
    answers: {
      ten_seconds: "Kleine Menge heißt nicht kleine Wirkung. Entscheidend ist, wie CO₂ im Strahlungshaushalt wirkt.",
      thirty_seconds:
        "Der wahre Kern ist: CO₂ ist ein Spurengas. Der Denkfehler ist: Daraus wird geringe Wirkung abgeleitet. Viele Stoffe wirken in kleinen Mengen stark. Bei CO₂ zählt der physikalische Mechanismus - nicht nur der Prozentanteil.",
      two_minutes:
        "Ich ordne das ein. „Spurengas“ beschreibt nur die Konzentration, nicht die Wirkung. In komplexen Systemen können kleine Größen große Effekte haben, wenn sie an zentralen Hebeln wirken. CO₂ verändert den Strahlungshaushalt der Erde. Wirkungsökonomisch ist die Frage nicht: Ist es viel oder wenig? Sondern: Welche Zustandsveränderung erzeugt es - und welche Schäden entstehen, wenn wir diesen Wirkmechanismus ignorieren?",
    },
    effectPath: [
      ["Aussage", "CO₂ wird über seine geringe Konzentration beschrieben."],
      ["Wirkstoff", "Kleine Menge wird als kleine Wirkung gerahmt."],
      ["Resonanz", "Zweifel, Scheinsachlichkeit und Entlastung."],
      ["Wirkungspotenzial", "Der physikalische Wirkmechanismus wird ausgeblendet."],
      ["Wirkungsrisiko", "Klimawirkung wird unterschätzt."],
      ["Folge falschen Handelns", "Emissionsminderung verliert Plausibilität."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Welche Wirkung hat CO₂ im Strahlungshaushalt - unabhängig vom Prozentanteil?",
    dontDo: ["Nicht nur Prozentzahlen vergleichen.", "Nicht den Scheinfakt als ausreichende Erklärung akzeptieren."],
    facts: ["Spurengas beschreibt Konzentration, nicht Systemwirkung.", "In Wirkungsanalysen zählt der Mechanismus, nicht nur die Menge."],
    consequences: ["Physikalische Ursache wird verharmlost.", "Wissenschaftsvertrauen sinkt.", "Klimaschutz verliert Akzeptanz."],
    woekSolution: ["Wirkmechanismus sichtbar machen.", "Klimawirkung in Energie-, Produkt- und Investitionsentscheidungen rückkoppeln.", "Wissensqualität als SDG+-Dimension stärken."],
    mpd: {
      mensch: "Gesundheits- und Schadensrisiken werden unterschätzt.",
      planet: "Treibhausgaswirkung bleibt länger ungemindert.",
      demokratie: "Scheinfakten schwächen Wissensqualität und Diskursfähigkeit.",
    },
    sources: ["IPCC AR6 Synthesis Report - Headline Statements"],
  },
  {
    title: "Deutschland nur 2 %? Warum diese Zahl Verantwortung verkürzt",
    slug: "deutschland-nur-zwei-prozent",
    claimPhrase: "„Deutschland ist nur für 2 % verantwortlich.“",
    shortJudgement: "Territorial teilweise richtig, wirkungsökonomisch verkürzt.",
    narrativeFamilies: ["Ohnmacht", "Verantwortungsverkürzung", "Verzögerung"],
    riskLevel: "hoch",
    themes: ["Klimawandel", "Politik", "Industrie"],
    sdgs: ["SDG 7", "SDG 9", "SDG 12", "SDG 13"],
    sdgPlus: ["Handlungsfähigkeit", "institutionelles Vertrauen", "Wirkungswahrheit"],
    subtitle: "Territoriale Emissionen sind nicht Gesamtverantwortung.",
    abstract:
      "Die Aussage „Deutschland ist nur für 2 % verantwortlich“ ist nur in einer sehr engen territorialen Jahresbilanz überhaupt sinnvoll. Als Aussage über Verantwortung ist sie irreführend. Sie blendet aus, dass deutsche Wirkung nicht an der Landesgrenze endet: Konsumemissionen, importierte Vorprodukte, ausgelagerte Produktion, exportierte Fahrzeuge und Maschinen, Scope-3-Emissionen, historische Emissionen, Kapitalflüsse, EU-Standards und technologische Pfade gehören zur vollständigen Wirkungsanalyse. Der Denkfehler lautet: Ein enger Emissionsanteil wird mit geringer Verantwortung verwechselt. Wirkungsökonomisch ist die bessere Frage nicht: Wie klein ist unser territorialer Anteil? Sondern: Welche Wirkung lösen deutsche Produkte, Lieferketten, Märkte, Regeln und Investitionen weltweit aus - und wie koppeln wir diese Wirkung in bessere Entscheidungen zurück?",
    summary: {
      judgement: "Territorial teilweise richtig, als Verantwortungsargument irreführend.",
      true_core: "Deutschland ist nicht der größte territoriale Jahresemittent.",
      problem: "Die Aussage verwechselt territoriale Bilanz mit Gesamtverantwortung.",
      narrative: "Ohnmachtsnarrativ / Verantwortungsverkürzung / Verzögerungsframe.",
      risk: "Konsum, Lieferketten, Produktnutzung, Historie und Transformationshebel werden unsichtbar.",
      host_answer: "Die 2-%-Zahl misst höchstens einen engen Inlandsausschnitt. Verantwortung misst sie nicht.",
    },
    answers: {
      ten_seconds: "Die 2-%-Zahl misst höchstens Inlandsemissionen. Verantwortung misst sie nicht. Konsum, Lieferketten, exportierte Produkte, Scope 3 und historische Emissionen fehlen.",
      thirty_seconds:
        "Der Denkfehler ist: Territoriale Emissionen werden mit Verantwortung verwechselt. Deutschland hat nicht nur Emissionen innerhalb seiner Grenzen, sondern auch Konsumemissionen, importierte Produktionswirkung, exportierte Fahrzeuge und Maschinen, Scope-3-Wirkung, historische Verantwortung und starke Technologie- und Standardhebel. Die bessere Frage lautet: Welche Wirkung lösen wir aus - und wie verändern wir sie?",
      two_minutes:
        "Ich ordne das sauber ein. Die 2-%-Behauptung kann nur dann halbwegs stimmen, wenn man sehr eng auf territoriale Jahresemissionen schaut. Aber Verantwortung ist mehr als das. Wenn wir Produkte importieren, deren Emissionen im Ausland entstehen, verschwindet diese Wirkung nicht. Wenn deutsche Unternehmen Verbrenner, Maschinen oder Technologien exportieren, die weltweit über Jahre Emissionen verursachen, ist das Teil der Produkt- und Scope-3-Verantwortung. Wenn wir historisch über Jahrzehnte emittiert haben, ist das nicht durch den Blick auf ein einzelnes Jahr erledigt. Wirkungsökonomisch zählen Wirkungsketten: Rohstoffe, Produktion, Transport, Nutzung, Entsorgung, Kapital, Standards und politische Hebel. Deshalb ist die richtige Frage nicht: Sind wir nur 2 %? Sondern: Wo erzeugen wir Wirkung - und wie drehen wir sie Richtung Mensch, Planet und Demokratie?",
    },
    answersFinal: true,
    effectPath: [
      ["Aussage", "Die 2-%-Behauptung wird als Entlastungsargument gesetzt."],
      ["Wirkstoff", "Territoriale Zahl als Verantwortungsverkürzer."],
      ["Verkürzung", "Inlandsemissionen werden mit Gesamtverantwortung gleichgesetzt."],
      ["Ausblendung", "Konsumemissionen, ausgelagerte Produktion, Scope 3, exportierte Produktnutzung, historische Emissionen sowie Standard- und Kapitalhebel verschwinden."],
      ["Resonanz", "Entlastung, Ohnmacht, Abwehr von Veränderung und Kostenangst."],
      ["Narrativ", "Wir sind zu klein, also müssen wir nicht handeln."],
      ["Wirkungspotenzial", "Handlungsfähigkeit sinkt, Verantwortung wird externalisiert."],
      ["Wirkungsrisiko", "Lieferketten, Produktdesign, Industriepfade und fossile Geschäftsmodelle werden langsamer transformiert."],
      ["Wirkung 3. Ordnung", "Wirkungsblindheit bleibt stabil: Produkte, Preise und Investitionen zeigen nicht, welche globale Wirkung sie auslösen."],
    ],
    frameKey: "ohnmacht",
    redirectQuestion: "Welche Bilanzgrenze meinst du: territorial, konsumbezogen, Scope 3, historisch oder transformativ?",
    dontDo: ["Nicht in eine endlose Prozentdiskussion gehen.", "Nicht „2 % Verantwortung“ wiederholen.", "Nicht so tun, als könne Deutschland allein das Klima retten.", "Nicht Verantwortung moralisieren.", "Nicht unterschiedliche Bilanzgrenzen addieren."],
    facts: [
      "Die territoriale Bilanz misst Emissionen innerhalb deutscher Grenzen, nicht Konsum, Produktnutzung oder historische Wirkung.",
      "Konsumemissionen zeigen, welche Emissionen deutsche Nachfrage auch im Ausland auslöst.",
      "Scope 3 erfasst unter anderem die Nutzung verkaufter Produkte und macht Produktverantwortung sichtbar.",
      "Historische Emissionen beantworten eine andere Verantwortungsfrage als ein einzelnes Emissionsjahr.",
      "Transformationshebel entstehen über Standards, Technologie, Kapital, Beschaffung, EU-Regeln und Industriepfade.",
    ],
    consequences: [
      "Konsum- und Importwirkung bleibt politisch unsichtbar.",
      "Produktdesign, Lieferketten und Scope-3-Emissionen werden schwächer gesteuert.",
      "Fossile Geschäftsmodelle wirken länger, weil ihre globale Nutzung nicht ausreichend rückgekoppelt wird.",
      "Öffentliche Debatten verlieren Handlungsfähigkeit, weil Verantwortung auf einen engen Inlandsausschnitt reduziert wird.",
    ],
    woekSolution: [
      "Territoriale Emissionen weiter senken.",
      "Konsum- und Importemissionen sichtbar machen.",
      "Lieferkettenwirkung über WÖk-IDs, Scorecards und digitale Produktpässe erfassen.",
      "Scope-3-Emissionen verkaufter Produkte einbeziehen, besonders bei Fahrzeugen, Maschinen, Energieanlagen und Chemie.",
      "Öffentliche Beschaffung und Steuern an positive Netto-Wirkung koppeln.",
      "Exportierte Technologien nach Lebenszykluswirkung bewerten.",
      "Kapitalflüsse so lenken, dass sie fossile Pfade nicht verlängern.",
      "Verantwortung nicht moralisieren, sondern in Preise, Steuern, Investitionen, Standards und Produktdesign rückkoppeln.",
    ],
    mpd: {
      mensch: "Klimafolgekosten, Standortunsicherheit und soziale Übergangsrisiken bleiben länger unsichtbar.",
      planet: "Konsum-, Lieferketten-, Produktnutzungs- und historische Klimawirkung werden zu schwach gesteuert.",
      demokratie: "Wirkungsblindheit schwächt Quellenklarheit, Verantwortungsfähigkeit und demokratische Entscheidung.",
    },
    dossier: {
      thesis:
        "Die 2-%-Behauptung ist kein Klimafakt, sondern ein Verantwortungsverkürzer. Sie reduziert Verantwortung auf territoriale Jahresemissionen und blendet Konsum, Importe, Lieferketten, exportierte Produktnutzung, historische Emissionen und Transformationshebel aus. Wirkungsökonomisch gilt: Verantwortung endet nicht an der Landesgrenze und nicht am Fabriktor.",
      missingLayers: "Konsum, Importe, Lieferketten, Scope 3, exportierte Produktnutzung, historische Emissionen, Standardsetzung.",
      variants: [
        "Deutschland ist doch nur für rund 2 % der Emissionen zuständig.",
        "Solange China und die USA mehr ausstoßen, bringt deutsches Handeln nichts.",
        "Unsere Industrie soll leiden, obwohl unser Anteil winzig ist.",
        "Deutsche Klimapolitik ist Symbolpolitik, weil der globale Effekt zu klein sei.",
      ],
      responsibilityMatrix: [
        ["Territorial", "Was wird innerhalb Deutschlands emittiert?", "Kraftwerke, Verkehr, Industrie im Inland.", "Konsum, Importe, Exporte und historische Wirkung."],
        ["Konsum", "Was verursacht deutsche Nachfrage?", "Importierte Kleidung, Elektronik, Lebensmittel, Vorprodukte.", "Produktion im Ausland und ausgelagerte Produktionswirkung."],
        ["Lieferkette", "Was steckt in Vorprodukten?", "Rohstoffe, Energie, Transport, Arbeit, Chemie, Wasser.", "Ausgelagerte ökologische und soziale Schäden."],
        ["Scope 3 / Produktnutzung", "Was bewirken verkaufte Produkte weltweit?", "Exportierte Verbrenner, Maschinen, Anlagen, Chemie, Geräte.", "Nutzungsemissionen außerhalb Deutschlands."],
        ["Historisch", "Was wurde kumulativ verursacht?", "Industrialisierung, lange CO₂-Wirkung, Pfadabhängigkeiten.", "Jahresanteil ist nicht kumulative Klimawirkung."],
        ["Transformativ", "Welche Hebel setzen wir?", "EU-Standards, Technologie, Kapital, Beschaffung, Normung.", "Systemische Steuerungsmacht deutscher Industrie und Politik."],
      ],
      dataFacts: [
        ["Territorial", "Deutschland meldete für 2024 rund 649 Mio. t CO₂-Äquivalente; BMUKN/UBA-Vorabdaten beziffern 2025 auf 648,9 Mio. t CO₂e. Diese Werte sind wichtig für nationale Klimaziele, messen aber nur Inlandsemissionen."],
        ["Global", "EDGAR/JRC weist für 2024 globale Treibhausgasemissionen von rund 53,2 Gt CO₂e ohne LULUCF aus. Das ist die Vergleichsgröße für enge territoriale Anteile."],
        ["Konsum", "Das UBA beziffert deutsche Pro-Kopf-Treibhausgasemissionen bei Berücksichtigung von Import und Export von Gütern mit 10,3 t CO₂e pro Jahr."],
        ["Fußabdruck", "Eurostat weist für 2023 einen deutschen Treibhausgas-Fußabdruck des Konsums von 903 Mio. t CO₂e beziehungsweise 10,8 t pro Kopf aus."],
        ["Scope 3", "Das GHG Protocol führt die Nutzung verkaufter Produkte als Scope-3-Kategorie 11. Für Automobil-, Maschinen- und Energieprodukte ist diese Bilanzgrenze zentral."],
        ["Autoexporte", "Destatis meldete für 2024 rund 3,4 Mio. exportierte neue Pkw aus Deutschland; 25,9 % waren vollelektrisch, der Rest überwiegend Verbrenner oder Hybride."],
        ["Historie", "Our World in Data zeigt kumulative CO₂-Emissionen seit 1750 als eigene Verantwortungsfrage. Ein Jahresanteil ersetzt diese Perspektive nicht."],
      ],
      boundaryNote:
        "Territoriale Emissionen, Konsumemissionen, Unternehmens-Scope-3 und historische Emissionen dürfen nicht zu einer einzigen Zahl addiert werden. Sie müssen nebeneinander sichtbar werden, weil sie unterschiedliche Verantwortungsfragen beantworten.",
    },
    sources: [
      "Umweltbundesamt - Treibhausgas-Emissionen in Deutschland",
      "EDGAR/JRC - globale Treibhausgasemissionen 2025 Report",
      "Umweltbundesamt - Treibhausgasemissionen pro Person",
      "Eurostat - Greenhouse gas emission footprints",
      "GHG Protocol - Corporate Value Chain Scope 3 Standard",
      "Destatis - 3.4 million new cars exported from Germany in 2024",
      "Our World in Data - Share of global cumulative CO2 emissions",
    ],
  },
  {
    title: "„Klimaschutz ist Ökodiktatur“",
    slug: "klimaschutz-ist-oekodiktatur",
    shortJudgement: "Irreführender Kontrollverlustframe.",
    narrativeFamilies: ["Kontrollverlust", "Verbotsnarrativ"],
    riskLevel: "hoch",
    themes: ["Klimapolitik", "Demokratie"],
    sdgs: ["SDG 13", "SDG 16"],
    sdgPlus: ["Demokratische Legitimität", "Diskursfähigkeit"],
    subtitle: "Kontrollverlustframe statt demokratischer Prüfung",
    abstract:
      "Die Aussage greift eine reale demokratische Frage auf: Klimapolitik muss legitimiert, verhältnismäßig, sozial abgefedert und kontrollierbar sein. Irreführend wird sie, wenn jede Regel, jeder Standard oder jedes Preissignal pauschal als Diktatur gerahmt wird. Wirkungsökonomisch ist das ein Kontrollverlust- und Verbotsangst-Wirkstoff: Die konkrete Maßnahme wird nicht mehr geprüft, sondern als Freiheitsbedrohung aufgeladen.",
    summary: {
      judgement: "Irreführender Kontrollverlustframe.",
      true_core: "Klimapolitik muss demokratisch legitimiert und verhältnismäßig sein.",
      problem: "Regeln und Steuerung werden pauschal als Diktatur gerahmt.",
      narrative: "Kontrollverlust / Verbotsnarrativ.",
      risk: "Demokratische Abwägung wird durch Angst und Misstrauen verdrängt.",
      host_answer: "Nicht jede Regel ist Diktatur. Prüfen wir Legitimation, Wirkung und Verhältnismäßigkeit.",
    },
    answers: {
      ten_seconds: "Nicht jede Regel ist Diktatur. Die Frage ist: Ist die Maßnahme demokratisch, verhältnismäßig und wirksam?",
      thirty_seconds:
        "Der wahre Kern ist: Klimapolitik muss demokratisch kontrolliert werden. Der Denkfehler ist, jede Regel als Ökodiktatur zu rahmen. Wirkungsökonomisch prüfen wir konkrete Maßnahmen: Wer entscheidet, wer zahlt, wer profitiert, welche Wirkung entsteht?",
      two_minutes:
        "Ich ordne das ein. In einer Demokratie darf und muss man Klimapolitik kritisieren: Kosten, Freiheit, soziale Verteilung und Nebenwirkungen sind relevante Fragen. Aber der Begriff Ökodiktatur macht aus demokratisch prüfbaren Maßnahmen ein Feindbild. Dann sprechen wir nicht mehr über konkrete Gesetze, Alternativen und Wirkungen, sondern über Angst. Die bessere wirkungsökonomische Frage lautet: Welche Maßnahme schützt Freiheit, Gesundheit, Klima und soziale Stabilität zugleich - und wie wird sie demokratisch kontrolliert?",
    },
    effectPath: [
      ["Aussage", "Klimaschutz wird als Diktatur gerahmt."],
      ["Wirkstoff", "Verbots- und Kontrollverlustimpuls."],
      ["Resonanz", "Freiheitsangst, Trotz und Misstrauen."],
      ["Wirkungspotenzial", "Konkrete Maßnahmen werden nicht mehr differenziert geprüft."],
      ["Wirkungsrisiko", "Akzeptanz für wirksame und demokratische Lösungen sinkt."],
      ["Folge falschen Handelns", "Polarisierung steigt, notwendige Infrastruktur wird verzögert."],
    ],
    frameKey: "verbotsangst",
    redirectQuestion: "Welche konkrete Maßnahme meinst du - und wo genau fehlt demokratische Kontrolle?",
    dontDo: ["Nicht Freiheit gegen Klima ausspielen.", "Nicht echte soziale Härten ignorieren."],
    facts: ["Klimapolitik kann Regeln, Preise, Standards und Förderung enthalten.", "Demokratische Legitimation und Verhältnismäßigkeit müssen konkret geprüft werden."],
    consequences: ["Misstrauen steigt.", "Lösungen werden pauschal delegitimiert.", "Polarisierung blockiert Infrastruktur."],
    woekSolution: ["Maßnahmen nach MPD und Reverse Merit Order prüfen.", "Soziale Rückverteilung und Beteiligung sichtbar machen.", "Freiheitsschutz und Schadensvermeidung zusammen bewerten."],
    mpd: {
      mensch: "Soziale Abfederung und Freiheitsschutz müssen mitgedacht werden.",
      planet: "Wirksame Klimamaßnahmen können durch Pauschalabwehr verzögert werden.",
      demokratie: "Diskursfähigkeit und Vertrauen in demokratische Verfahren sinken.",
    },
    sources: ["Umweltbundesamt - Treibhausgas-Projektionen", "IPCC AR6 Synthesis Report - Headline Statements"],
  },
  {
    title: "„Die Energiewende ist gescheitert“",
    slug: "energiewende-gescheitert",
    shortJudgement: "Pauschaler Scheiternsframe.",
    narrativeFamilies: ["Scheiternsframe", "Rosinenpickerei"],
    riskLevel: "hoch",
    themes: ["Energiewende", "Stromsystem"],
    sdgs: ["SDG 7", "SDG 9", "SDG 13"],
    sdgPlus: ["Quellenklarheit"],
    subtitle: "Scheiternsframe statt Engpassanalyse",
    abstract:
      "Die Aussage enthält oft reale Probleme: Netzausbau, Speicher, Genehmigungen, Strompreise, Industriebelastung oder Akzeptanzkonflikte. Irreführend wird sie, wenn daraus ein pauschales Scheitern der gesamten Energiewende konstruiert wird. Wirkungsökonomisch ist das ein Scheiternsframe: Einzelne Engpässe werden genutzt, um den Transformationspfad insgesamt zu delegitimieren. Die bessere Antwort lautet: Nicht pauschal scheitern oder feiern, sondern Engpässe identifizieren.",
    summary: {
      judgement: "Pauschaler Scheiternsframe.",
      true_core: "Die Energiewende hat reale Engpässe und Zielkonflikte.",
      problem: "Aus Engpässen wird Totalversagen gemacht.",
      narrative: "Scheiternsframe / Verzögerung.",
      risk: "Lernfähigkeit und Investitionssicherheit sinken.",
      host_answer: "Probleme sind nicht automatisch Scheitern. Die Frage ist: Welcher Engpass begrenzt die Wirkung?",
    },
    answers: {
      ten_seconds: "Probleme sind nicht automatisch Scheitern. Wirkungsökonomisch fragen wir: Welcher Engpass begrenzt gerade die Wirkung?",
      thirty_seconds:
        "Der wahre Kern ist: Es gibt reale Probleme bei Netzen, Speichern, Preisen und Tempo. Der Denkfehler ist, daraus ein komplettes Scheitern zu machen. Die Energiewende ist kein einzelner Schalter, sondern ein Systemumbau. Entscheidend ist, welche Engpässe wir lösen.",
      two_minutes:
        "Ich ordne das kurz ein. Die Aussage klingt stark, weil sie reale Frustration aufgreift: Netze dauern, Speicher fehlen, Preise sind komplex, Genehmigungen dauern. Aber ein komplexer Umbau ist nicht gescheitert, nur weil Engpässe sichtbar werden. Wirkungsökonomisch behandeln wir das als Engpassanalyse: Was senkt Emissionen? Was schafft Versorgungssicherheit? Was schützt Haushalte und Industrie? Was stärkt Akzeptanz? Dann lenken wir Investitionen genau dorthin, wo die nächste positive Netto-Wirkung entsteht.",
    },
    effectPath: [
      ["Aussage", "Die Energiewende ist gescheitert."],
      ["Wirkstoff", "Engpass wird als Totalversagen gerahmt."],
      ["Resonanz", "Frust, Ohnmacht und Abbruchimpuls."],
      ["Wirkungspotenzial", "Lernfähigkeit und Investitionssicherheit sinken."],
      ["Wirkungsrisiko", "Notwendige Netze, Speicher und Flexibilität werden verzögert."],
      ["Folge falschen Handelns", "Fossile Pfade bleiben länger bestehen."],
    ],
    frameKey: "scheitern",
    redirectQuestion: "Welcher konkrete Engpass begrenzt die Wirkung - und was müsste angepasst werden?",
    dontDo: ["Nicht reale Engpässe schönreden.", "Nicht in eine Ja/Nein-Lagerfrage über die gesamte Energiewende rutschen."],
    facts: ["Energiewende ist ein Systemumbau aus Erzeugung, Netz, Speicher, Flexibilität und Nachfrage.", "Engpässe sind Korrektursignale, nicht automatisch Scheitern."],
    consequences: ["Investitionen werden unsicherer.", "Infrastruktur wird verzögert.", "Lernfähigkeit sinkt."],
    woekSolution: ["T-SROI für Netze, Speicher, Wärmenetze, Gebäudesanierung und Industrieumstellung.", "Wirkungshaushalte für Energieinfrastruktur.", "Wirkungssteuer auf Energieträger nach Klima-, Gesundheits-, Ressourcen- und Demokratiewirkung.", "Soziale Rückverteilung, damit Transformation nicht als Kontrollverlust erlebt wird."],
    mpd: {
      mensch: "Haushalte und Beschäftigte brauchen verlässliche, sozial abgefederte Übergänge.",
      planet: "Fossile Emissionen bleiben länger wirksam, wenn Infrastruktur stockt.",
      demokratie: "Akzeptanz sinkt, wenn Frust in Totalurteile kippt.",
    },
    sources: ["Fraunhofer ISE / Energy-Charts", "IEA - Renewables", "Umweltbundesamt - Treibhausgas-Projektionen"],
  },
  {
    title: "„Windräder zerstören die Natur“",
    slug: "windraeder-zerstoeren-natur",
    shortJudgement: "Wahrer Konflikt, falsche Pauschalisierung.",
    narrativeFamilies: ["Halbwahrheit", "Angstframe"],
    riskLevel: "mittel",
    themes: ["Windkraft", "Naturschutz"],
    sdgs: ["SDG 7", "SDG 13", "SDG 15"],
    sdgPlus: ["lokale Beteiligung"],
    subtitle: "Realer Zielkonflikt, falsche Pauschalisierung",
    abstract:
      "Die Aussage enthält einen berechtigten Kern: Windenergie kann lokale Konflikte mit Landschaft, Artenschutz, Vögeln, Fledermäusen, Waldstandorten und Anwohner:innen erzeugen. Irreführend wird sie, wenn daraus pauschal folgt, Windkraft sei grundsätzlich naturzerstörend oder klimapolitisch falsch. Wirkungsökonomisch ist das ein Halbwahrheits-Wirkstoff: Ein realer Einzelkonflikt wird gegen den gesamten Transformationspfad gestellt. Die bessere Antwort lautet: Natur- und Klimaschutz dürfen nicht gegeneinander ausgespielt werden.",
    summary: {
      judgement: "Wahrer Konflikt, falsche Pauschalisierung.",
      true_core: "Windenergie kann lokale Natur- und Artenschutzkonflikte erzeugen.",
      problem: "Einzelkonflikte werden zur Ablehnung der gesamten Technologie genutzt.",
      narrative: "Angstframe / Halbwahrheit / Verzögerung.",
      risk: "Klimaschutz und Naturschutz werden gegeneinander ausgespielt.",
      host_answer: "Der Zielkonflikt ist real. Aber die Lösung heißt gute Planung, nicht pauschale Blockade.",
    },
    answers: {
      ten_seconds: "Der Zielkonflikt ist real. Aber daraus folgt nicht: keine Windkraft. Daraus folgt: bessere Standorte, Artenschutz und Beteiligung.",
      thirty_seconds:
        "Ja, Windräder können lokale Konflikte verursachen. Aber fossile Energien zerstören Natur und Klima systemisch. Die wirkungsökonomische Frage lautet: Welche Option erzeugt über den Lebenszyklus die bessere Netto-Wirkung - mit Artenschutz, Standortprüfung und Beteiligung?",
      two_minutes:
        "Ich ordne das kurz ein. Es wäre falsch, Artenschutz kleinzureden. Vögel, Fledermäuse, Wälder und Landschaften sind reale Wirkungsfelder. Aber es wäre ebenso falsch, daraus eine pauschale Ablehnung von Windenergie zu machen. Die WÖk würde nicht sagen: Wind immer gut. Sie würde sagen: Standort, Bauweise, Beteiligung, Biodiversität, Stromwirkung und Alternativen zusammen bewerten. Das schwächste Wirkungsfeld muss verbessert werden - nicht durch andere Vorteile verdeckt.",
    },
    effectPath: [
      ["Aussage", "Windräder zerstören die Natur."],
      ["Wirkstoff", "Realer Einzelkonflikt wird zur Pauschalablehnung."],
      ["Resonanz", "Natursorge, Landschaftsverlust, lokale Betroffenheit."],
      ["Wirkungspotenzial", "Klimaschutz und Naturschutz werden gegeneinander gestellt."],
      ["Wirkungsrisiko", "Planung, Repowering und Beteiligung werden blockiert."],
      ["Folge falschen Handelns", "Fossile Natur- und Klimaschäden bleiben bestehen."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Welcher Standort, welche Art und welche Minderungsmaßnahme sind konkret gemeint?",
    dontDo: ["Artenschutz nicht kleinreden.", "Nicht Windkraft pauschal als immer gut rahmen."],
    facts: ["Windenergie kann lokale Artenschutzkonflikte erzeugen.", "Netto-Wirkung hängt von Standort, Planung, Minderungsmaßnahmen und Alternativen ab."],
    consequences: ["Naturschutz und Klimaschutz werden gegeneinander ausgespielt.", "Repowering und Beteiligung werden schwieriger.", "Fossile Schäden bleiben länger bestehen."],
    woekSolution: ["Standortprüfung, Artenschutz, Beteiligung und Repowering in Scorecards erfassen.", "Nichtkompensation anwenden: Biodiversitätsschäden dürfen nicht durch Klimanutzen verdeckt werden.", "Lokale Wirkungsdaten in Planung und Beschaffung rückkoppeln."],
    mpd: {
      mensch: "Beteiligung und lokale Belastungen müssen ernst genommen werden.",
      planet: "Klima- und Biodiversitätswirkung müssen zusammen bewertet werden.",
      demokratie: "Akzeptanz wächst durch transparente Planung und Beteiligung.",
    },
    sources: ["Umweltbundesamt - Windenergie an Land"],
  },
  {
    title: "„E-Autos sind schlimmer als Verbrenner“",
    slug: "e-autos-schlimmer-als-verbrenner",
    shortJudgement: "Meist irreführender Lebenszyklusvergleich.",
    narrativeFamilies: ["Halbwahrheit", "Rohstoffangst", "Verzögerung"],
    riskLevel: "hoch",
    themes: ["Mobilität", "Batterien"],
    sdgs: ["SDG 9", "SDG 12", "SDG 13"],
    sdgPlus: ["Lieferkettentransparenz"],
    subtitle: "Rohstoffangst und falscher Lebenszyklusvergleich",
    abstract:
      "Die Aussage enthält einen wahren Kern: Batterien verursachen Rohstoff-, Energie-, Lieferketten- und Recyclingwirkungen. Irreführend wird sie, wenn nur die Herstellung betrachtet wird und die dauerhaften Emissionen von Verbrennern ausgeblendet werden. Wirkungsökonomisch ist das ein Lebenszyklus-Fehler: Ein Wirkungsfeld wird isoliert, statt Produktlebenszyklus, Strommix, Fahrzeuggröße, Nutzung, Rohstoffe, Arbeitsbedingungen und Recycling zusammen zu bewerten.",
    summary: {
      judgement: "Meist irreführend.",
      true_core: "Batterien haben relevante Rohstoff- und Herstellungswirkungen.",
      problem: "Herstellung wird isoliert, Nutzungsemissionen des Verbrenners werden ausgeblendet.",
      narrative: "Rohstoffangst / Verzögerung / falscher Lebenszyklusvergleich.",
      risk: "Fossile Mobilität bleibt länger bestehen.",
      host_answer: "Batterien haben Wirkung - aber der Vergleich muss über den gesamten Lebenszyklus gehen.",
    },
    answers: {
      ten_seconds: "Batterien haben Wirkung. Aber der Vergleich muss über den gesamten Lebenszyklus gehen - nicht nur über die Herstellung.",
      thirty_seconds:
        "Der wahre Kern ist: Batterieproduktion ist ressourcenintensiv. Der Denkfehler ist: Verbrenneremissionen während der Nutzung auszublenden. Wirkungsökonomisch zählen Produktion, Energiequelle, Nutzung, Recycling, Fahrzeuggröße und Lieferkette zusammen.",
      two_minutes:
        "Ich ordne das kurz ein. Ein E-Auto ist nicht automatisch perfekt. Batterie, Rohstoffe, Arbeitsbedingungen und Recycling müssen bewertet werden. Aber ein Verbrenner emittiert während seiner gesamten Nutzung fossiles CO₂ und Luftschadstoffe. Deshalb braucht es einen Lebenszyklusvergleich. Die WÖk-Lösung wäre eine Produktscorecard: CO₂, Ressourcen, Arbeit, Gesundheit, Recycling und Energiequelle. Dann gewinnt nicht das ideologische Lager, sondern die Mobilitätslösung mit der besten Netto-Wirkung.",
    },
    effectPath: [
      ["Aussage", "E-Autos seien schlimmer als Verbrenner."],
      ["Wirkstoff", "Herstellungswirkung wird isoliert."],
      ["Resonanz", "Rohstoffangst und Technikmisstrauen."],
      ["Wirkungspotenzial", "Lebenszyklusvergleich wird verzerrt."],
      ["Wirkungsrisiko", "Fossile Mobilität bleibt länger bestehen."],
      ["Folge falschen Handelns", "CO₂-, Luftschadstoff- und Lieferkettenwirkung werden nicht optimiert."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Vergleichen wir Herstellung oder den gesamten Lebenszyklus?",
    dontDo: ["Batterieprobleme nicht wegwischen.", "Nicht nur CO₂ betrachten und Arbeitsbedingungen vergessen."],
    facts: ["Batterieproduktion hat relevante Wirkungen.", "Ein fairer Vergleich braucht Produktion, Nutzung, Energiequelle, Recycling und Lieferkette."],
    consequences: ["Fossile Nutzungsemissionen werden unsichtbar.", "Rohstofffragen werden nicht gelöst, sondern als Aufschub genutzt.", "Mobilitätswende wird polarisiert."],
    woekSolution: ["Produktscorecards für CO₂, Ressourcen, Arbeit, Gesundheit, Recycling und Energiequelle.", "Lieferkettentransparenz und Batteriepass stärken.", "Fahrzeuggröße und Mobilitätsbedarf in die Bewertung einbeziehen."],
    mpd: {
      mensch: "Gesundheit, Arbeitsbedingungen und bezahlbare Mobilität müssen zusammen bewertet werden.",
      planet: "CO₂, Ressourcen und Recycling entscheiden gemeinsam über Netto-Wirkung.",
      demokratie: "Lieferkettentransparenz und Quellenklarheit stärken Vertrauen.",
    },
    sources: ["Umweltbundesamt - Klimavorteil für E-Autos bestätigt", "ICCT - Life-cycle greenhouse gas emissions from passenger cars in Europe"],
  },
  {
    title: "„Batterien sind nicht recyclebar“",
    slug: "batterien-sind-nicht-recyclebar",
    shortJudgement: "Falsch oder veraltet, je nach Batterie- und Recyclingtyp.",
    narrativeFamilies: ["Technikskepsis", "Rohstoffangst"],
    riskLevel: "mittel",
    themes: ["Batterien", "Kreislaufwirtschaft"],
    sdgs: ["SDG 9", "SDG 12", "SDG 13"],
    sdgPlus: ["Lieferkettentransparenz"],
    subtitle: "Rohstoffangst statt Kreislaufanalyse",
    abstract:
      "Die Aussage enthält einen wahren Kern: Batterierecycling ist technisch, ökonomisch und organisatorisch anspruchsvoll. Irreführend wird sie, wenn daraus folgt, Batterien seien grundsätzlich nicht recyclebar oder Kreislaufwirtschaft sei sinnlos. Wirkungsökonomisch zählt nicht ein pauschales Ja oder Nein, sondern welche Materialien, Prozesse, Rücknahmesysteme, Standards und Skalierungen welche Netto-Wirkung erzeugen.",
    summary: {
      judgement: "Falsch oder veraltet, je nach Batterie- und Recyclingtyp.",
      true_core: "Batterierecycling ist anspruchsvoll und braucht Standards.",
      problem: "Aus Herausforderungen wird grundsätzliche Unmöglichkeit gemacht.",
      narrative: "Technikskepsis / Rohstoffangst.",
      risk: "Kreislaufwirtschaft und bessere Batteriepolitik werden verzögert.",
      host_answer: "Recycling ist eine Entwicklungs- und Skalierungsfrage, kein pauschales Unmöglichkeitsargument.",
    },
    answers: {
      ten_seconds: "Batterierecycling ist anspruchsvoll, aber nicht unmöglich. Die Frage ist: Welche Materialien und Prozesse werden zurückgewonnen?",
      thirty_seconds:
        "Der wahre Kern ist: Recycling braucht Standards, Rücknahme und Skalierung. Der Denkfehler ist, daraus Nicht-Recyclebarkeit zu machen. Wirkungsökonomisch zählen Rohstoffe, Rückgewinnung, Arbeitsbedingungen, Design und Zweitnutzung zusammen.",
      two_minutes:
        "Ich ordne das ein. Batterien sind kein wirkungsfreies Produkt: Rohstoffe, Herstellung, Nutzung, Sicherheit und Recycling müssen geprüft werden. Aber der Satz „nicht recyclebar“ ist zu pauschal. Entscheidend ist, welche Batteriechemie, welche Rücknahme, welches Verfahren und welcher Markt gemeint ist. Die WÖk würde Batterien über den Lebenszyklus bewerten: weniger Material, besseres Design, längere Nutzung, Second Life, Rückgewinnung und transparente Lieferketten. So wird aus Rohstoffangst eine Kreislaufstrategie.",
    },
    effectPath: [
      ["Aussage", "Batterien seien nicht recyclebar."],
      ["Wirkstoff", "Rohstoffproblem wird als technischer Endpunkt gerahmt."],
      ["Resonanz", "Technikskepsis und Ressourcenangst."],
      ["Wirkungspotenzial", "Kreislaufstrategien wirken sinnlos."],
      ["Wirkungsrisiko", "Recycling, Design und Rücknahme werden weniger priorisiert."],
      ["Folge falschen Handelns", "Rohstoff- und Lieferkettenprobleme bleiben schlechter steuerbar."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Welche Batteriechemie und welches Recyclingverfahren meinst du konkret?",
    dontDo: ["Nicht behaupten, Recycling löse alle Rohstofffragen allein.", "Nicht Batterieprobleme als Argument gegen jede Elektrifizierung verallgemeinern."],
    facts: ["Batterierecycling braucht Standards, Rücknahme und Skalierung.", "Die Bewertung hängt von Chemie, Verfahren, Design und Nutzung ab."],
    consequences: ["Kreislaufwirtschaft wird delegitimiert.", "Rohstoffpolitik bleibt reaktiv.", "Technikvertrauen sinkt."],
    woekSolution: ["Batteriepass, Rücknahmesysteme und Materialscorecards stärken.", "Design for Recycling und Second-Life-Nutzung bewerten.", "Rohstoff-, Arbeits- und Recyclingwirkung in Produktentscheidungen rückkoppeln."],
    mpd: {
      mensch: "Arbeitsbedingungen und regionale Wertschöpfung müssen sichtbar werden.",
      planet: "Ressourcen, Recycling und Energiequelle entscheiden über Netto-Wirkung.",
      demokratie: "Transparente Produktdaten stärken Vertrauen und Kontrolle.",
    },
    sources: ["Umweltbundesamt - Klimavorteil für E-Autos bestätigt", "ICCT - Life-cycle greenhouse gas emissions from passenger cars in Europe"],
  },
  {
    title: "„Kernenergie wäre die einfache Lösung“",
    slug: "kernenergie-einfache-loesung",
    shortJudgement: "Strategiebehauptung mit hohen Zeit-, Kosten- und Risikooffenheiten.",
    narrativeFamilies: ["Technikwunder", "Opportunitätskosten"],
    riskLevel: "hoch",
    themes: ["Kernenergie", "Stromsystem"],
    sdgs: ["SDG 7", "SDG 9", "SDG 13"],
    sdgPlus: ["Generationenverantwortung", "Transparenz"],
    subtitle: "Strategiebehauptung statt reiner Faktenfrage",
    abstract:
      "Die Aussage ist kein einfacher Mythos, sondern eine politische Strategiebehauptung. Der wahre Kern ist: Kernenergie ist im Betrieb CO₂-arm und kann grundlastfähigen Strom liefern. Irreführend wird sie, wenn Zeitbedarf, Kosten, Endlagerung, Sicherheitsfragen, Fachkräfte, Lieferketten, politische Akzeptanz und Opportunitätskosten gegenüber Netzen, Speichern, Erneuerbaren, Effizienz und Lastmanagement ausgeblendet werden.",
    summary: {
      judgement: "Strategiebehauptung mit offenen Zeit-, Kosten- und Risikofragen.",
      true_core: "Kernenergie ist im Betrieb CO₂-arm.",
      problem: "Zeitbedarf, Endlagerung, Kosten und Opportunitätskosten werden oft ausgeblendet.",
      narrative: "Technikwunder / Scheiternsframe gegen Erneuerbare.",
      risk: "Investitionen in schnellere Lösungen können verzögert werden.",
      host_answer: "Die Frage ist nicht abstrakt Kernenergie ja/nein, sondern: Was wirkt rechtzeitig, bezahlbar und mit geringster Netto-Negativwirkung?",
    },
    answers: {
      ten_seconds: "Die Frage ist nicht abstrakt Kernenergie ja oder nein. Die Frage ist: Was wirkt rechtzeitig, bezahlbar und mit geringster Netto-Negativwirkung?",
      thirty_seconds:
        "Der wahre Kern ist: Kernenergie hat niedrige Betriebsemissionen. Aber als Lösung für Deutschland zählen Zeit, Kosten, Endlagerung, Sicherheit, Fachkräfte und Alternativen. Wirkungsökonomisch prüfen wir nicht Technologie-Image, sondern Wirkung im konkreten Zeitfenster.",
      two_minutes:
        "Ich ordne das ein. Kernenergie ist nicht einfach nur ein Mythos oder eine Lösung. Sie ist eine Strategieoption mit bestimmten Stärken und erheblichen offenen Fragen. Wenn wir sie ernsthaft prüfen, dann mit Zeithorizont, Kosten, Endlager, Sicherheitsarchitektur, gesellschaftlicher Akzeptanz und Opportunitätskosten. Jeder Euro und jedes Jahr, das in eine Option fließt, fehlt an anderer Stelle. Die WÖk-Frage lautet: Welche Investition senkt im relevanten Zeitraum die meisten Risiken für Mensch, Planet und Demokratie?",
    },
    effectPath: [
      ["Aussage", "Kernenergie wäre die einfache Lösung."],
      ["Wirkstoff", "Komplexe Strategie wird als einfache Techniklösung gerahmt."],
      ["Resonanz", "Wunsch nach Stabilität, Grundlast und Eindeutigkeit."],
      ["Wirkungspotenzial", "Zeit-, Kosten- und Endlagerfragen werden zweitrangig."],
      ["Wirkungsrisiko", "Schnellere oder günstigere Alternativen werden verzögert."],
      ["Folge falschen Handelns", "Opportunitätskosten steigen, Systemumbau verlangsamt sich."],
    ],
    frameKey: "technikwunder",
    redirectQuestion: "Welche Option senkt im relevanten Zeitraum die meisten Risiken pro Euro und Jahr?",
    dontDo: ["Nicht Kernenergie als reine Glaubensfrage behandeln.", "Nicht Betriebsemissionen isoliert bewerten."],
    facts: ["Kernenergie ist im Betrieb CO₂-arm.", "Strategisch zählen Zeit, Kosten, Endlagerung, Sicherheit, Fachkräfte und Alternativen."],
    consequences: ["Investitionen können in langsamere Pfade fließen.", "Endlager- und Generationenfragen bleiben offen.", "Lagerkampf verdrängt Systemvergleich."],
    woekSolution: ["Technologien nach Zeithorizont, Kosten, Risiko und Alternativen vergleichen.", "Endlager- und Sicherheitswirkung als nicht kompensierbare Felder prüfen.", "Kapital nach positiver Netto-Wirkung statt Technologie-Image lenken."],
    mpd: {
      mensch: "Sicherheit, Kosten und Generationenverantwortung müssen sichtbar sein.",
      planet: "CO₂-armer Betrieb reicht nicht als Gesamtbewertung.",
      demokratie: "Transparenz über Risiken, Kosten und Zeithorizonte schützt Vertrauen.",
    },
    sources: ["BASE - Endlagersuche", "Fraunhofer ISE / Energy-Charts"],
  },
  {
    title: "„Fusion löst das Problem“",
    slug: "fusion-loest-das-problem",
    shortJudgement: "Forschung wichtig, aber kein Ersatz für heutige Emissionsminderung.",
    narrativeFamilies: ["Technikwunder-Aufschub", "Verzögerung"],
    riskLevel: "hoch",
    themes: ["Fusion", "Energiezukunft"],
    sdgs: ["SDG 7", "SDG 9", "SDG 13"],
    sdgPlus: ["Zeithorizontklarheit"],
    subtitle: "Forschung ja, Aufschub nein",
    abstract:
      "Die Aussage enthält einen hoffnungsvollen Kern: Fusionsforschung kann langfristig eine wichtige Energieoption werden. Irreführend wird sie, wenn ungewisse Zukunftstechnologie als Ersatz für heute verfügbare Emissionsminderung genutzt wird. Wirkungsökonomisch ist das ein Technikwunder-Aufschub: Die Debatte verschiebt Verantwortung aus dem aktuellen Zeitfenster in eine mögliche Zukunft.",
    summary: {
      judgement: "Forschung wichtig, aber kein Ersatz für heutige Emissionsminderung.",
      true_core: "Fusion kann langfristig eine bedeutende Technologie werden.",
      problem: "Ungewisse Zukunftstechnik wird als Aufschubargument genutzt.",
      narrative: "Technikwunder-Aufschub / Verzögerung.",
      risk: "Heute verfügbare Lösungen werden langsamer umgesetzt.",
      host_answer: "Fusion erforschen: ja. Aber sie ersetzt keine Emissionsminderung in diesem Jahrzehnt.",
    },
    answers: {
      ten_seconds: "Fusion erforschen: ja. Aber sie ersetzt keine Emissionsminderung in diesem Jahrzehnt.",
      thirty_seconds:
        "Der wahre Kern ist: Fusion ist wissenschaftlich spannend und langfristig relevant. Der Denkfehler ist, sie als heutige Lösung zu verkaufen. Wirkungsökonomisch zählt der Zeithorizont: Was senkt Emissionen rechtzeitig, skalierbar und bezahlbar?",
      two_minutes:
        "Ich ordne das ein. Fusion ist kein Grund, Forschung kleinzureden - im Gegenteil. Aber Forschung und heutige Klimapolitik haben unterschiedliche Zeithorizonte. Wenn wir eine künftige Technologie als Argument gegen heutige Maßnahmen benutzen, wird sie zum Verzögerungsnarrativ. Die WÖk bewertet Technik nach Wirkung, Zeithorizont, Skalierbarkeit, Kosten, Risiken und Alternativen. Also: Fusion weiterentwickeln, aber Netze, Speicher, Erneuerbare, Effizienz und Industrieumbau jetzt umsetzen.",
    },
    effectPath: [
      ["Aussage", "Fusion löst das Problem."],
      ["Wirkstoff", "Zukunftstechnologie als Aufschubargument."],
      ["Resonanz", "Hoffnung, Entlastung, Technikoptimismus."],
      ["Wirkungspotenzial", "Heute verfügbare Lösungen wirken weniger dringlich."],
      ["Wirkungsrisiko", "Emissionen werden im aktuellen Jahrzehnt nicht ausreichend gesenkt."],
      ["Folge falschen Handelns", "Zeitfenster schließen sich und Folgekosten steigen."],
    ],
    frameKey: "technikwunder",
    redirectQuestion: "Was senkt Emissionen rechtzeitig - und was ist langfristige Forschung?",
    dontDo: ["Fusionsforschung nicht lächerlich machen.", "Nicht ungewisse Zukunftstechnik als heutige Lösung akzeptieren."],
    facts: ["Fusion ist langfristig relevant, aber zeitlich anders als heutige Emissionsminderung.", "Technologiereife und Netzwirkung müssen konkret geprüft werden."],
    consequences: ["Erneuerbare, Netze, Speicher und Effizienz werden langsamer umgesetzt.", "Heute vermeidbare Emissionen bleiben bestehen.", "Technikoptimismus ersetzt Wirkungspfad."],
    woekSolution: ["Forschung weiterführen und gleichzeitig heute skalierbare Lösungen umsetzen.", "Technik nach Zeithorizont, Skalierbarkeit, Kosten und Alternativen bewerten.", "Opportunitätskosten in Investitionsentscheidungen sichtbar machen."],
    mpd: {
      mensch: "Spätere Klimaschäden treffen Menschen heute und in naher Zukunft.",
      planet: "Zeitkritische Emissionsminderung darf nicht verschoben werden.",
      demokratie: "Zeithorizontklarheit verhindert Aufschubframes.",
    },
    sources: ["ITER - In a Few Lines", "EUROfusion - DEMO"],
  },
  {
    title: "„Klimaschutz deindustrialisiert Deutschland“",
    slug: "klimaschutz-deindustrialisiert-deutschland",
    shortJudgement: "Einseitiger Verlustframe.",
    narrativeFamilies: ["Angstframe", "Scheiternsframe", "Statusverlust"],
    riskLevel: "hoch",
    themes: ["Industrie", "Wettbewerbsfähigkeit"],
    sdgs: ["SDG 8", "SDG 9", "SDG 13"],
    sdgPlus: ["soziale Stabilität"],
    subtitle: "Verlustframe statt Transformationsanalyse",
    abstract:
      "Die Aussage enthält einen berechtigten Kern: Klimapolitik kann Branchen, Kostenstrukturen, Standortentscheidungen und Beschäftigung verändern. Irreführend wird sie, wenn Klimaschutz pauschal als Ursache von Deindustrialisierung dargestellt wird und fossile Abhängigkeit, Energiepreisschocks, alte Geschäftsmodelle, globale Konkurrenz, Investitionsstau und Innovationschancen ausgeblendet werden.",
    summary: {
      judgement: "Einseitiger Verlustframe.",
      true_core: "Transformation verändert Industrie, Kosten und Arbeitsmärkte.",
      problem: "Klimaschutz wird pauschal als Wohlstandsfeind gerahmt.",
      narrative: "Statusverlust / Angstframe / Verzögerung.",
      risk: "Zukunftsinvestitionen werden blockiert, alte Abhängigkeiten bleiben bestehen.",
      host_answer: "Die Frage ist nicht Industrie oder Klimaschutz. Die Frage ist: Welche Industrie ist in einer klimaneutralen Welt zukunftsfähig?",
    },
    answers: {
      ten_seconds: "Die Frage ist nicht Industrie oder Klimaschutz. Die Frage ist: Welche Industrie ist in einer klimaneutralen Welt zukunftsfähig?",
      thirty_seconds:
        "Der wahre Kern ist: Transformation verändert Arbeitsplätze und Kosten. Der Denkfehler ist, Klimaschutz pauschal als Deindustrialisierung zu framen. Fossile Abhängigkeit ist selbst ein Standort- und Kostenrisiko. Wirkungsökonomisch brauchen wir Industriepolitik nach Zukunftswirkung.",
      two_minutes:
        "Ich ordne das ein. Natürlich kann schlecht gemachte Transformation Industrie belasten. Aber Nicht-Transformation ist auch keine neutrale Option: fossile Abhängigkeit, CO₂-Kosten, Importabhängigkeit, alte Anlagen und verpasste Innovation können ebenfalls deindustrialisieren. Die WÖk-Frage lautet: Welche Investitionen erhalten Wertschöpfung, gute Arbeit, Versorgungssicherheit und Klimastabilität zugleich? Dazu gehören Netze, günstiger sauberer Strom, Kreislaufwirtschaft, grüne Grundstoffe, Qualifizierung und faire Übergänge.",
    },
    effectPath: [
      ["Aussage", "Klimaschutz deindustrialisiert Deutschland."],
      ["Wirkstoff", "Verlustframe gegen Transformation."],
      ["Resonanz", "Statusangst, Arbeitsplatzsorge, Standortunsicherheit."],
      ["Wirkungspotenzial", "Klimaschutz erscheint als Wohlstandsfeind."],
      ["Wirkungsrisiko", "Zukunftsinvestitionen werden blockiert."],
      ["Folge falschen Handelns", "Alte Abhängigkeiten und Innovationslücken wachsen."],
    ],
    frameKey: "scheitern",
    redirectQuestion: "Welche Industrie ist in einer klimaneutralen Welt zukunftsfähig?",
    dontDo: ["Industriesorgen nicht abtun.", "Nicht Klimaschutz und Industrie als Entweder-oder übernehmen."],
    facts: ["Transformation verändert Kosten, Arbeit und Geschäftsmodelle.", "Fossile Abhängigkeit ist selbst ein Standort- und Kostenrisiko."],
    consequences: ["Investitionen werden verzögert.", "Alte Geschäftsmodelle bleiben länger abhängig.", "Beschäftigte verlieren Planbarkeit."],
    woekSolution: ["Industriepolitik nach Zukunftswirkung.", "Günstiger sauberer Strom, Netze, Kreislaufwirtschaft, grüne Grundstoffe und Qualifizierung.", "Faire Übergänge und regionale Strukturentwicklung als Wirkungsfelder."],
    mpd: {
      mensch: "Gute Arbeit, Qualifizierung und regionale Stabilität müssen gesichert werden.",
      planet: "Industriepfade müssen emissionsarm und ressourceneffizient werden.",
      demokratie: "Soziale Stabilität schützt Akzeptanz und Vertrauen.",
    },
    sources: ["Umweltbundesamt - Treibhausgas-Projektionen", "IEA - Renewables"],
  },
];

const answerExpansions = {
  "klima-hat-sich-schon-immer-veraendert": {
    thirty_seconds:
      "Dazu kommt: Natürliche Veränderung erklärt noch nicht den heutigen Zeitraum. Für eine gute Einordnung brauchen wir Ursache, Tempo, Messdaten und Folgen. Erst dann wird aus einem richtigen Allgemeinsatz eine brauchbare politische Schlussfolgerung.",
    two_minutes:
      "Der entscheidende Unterschied ist der Nachweis des Treibers. In der Erdgeschichte gab es Vulkane, Sonnenzyklen, Umlaufbahnen und andere Faktoren. Heute sehen wir aber ein Muster, das sehr gut zu zusätzlichen Treibhausgasen passt: steigende Konzentrationen, veränderter Strahlungshaushalt, Erwärmung von Ozeanen und Atmosphäre, schmelzendes Eis und zunehmende Extremrisiken. Wer nur sagt, Klima habe sich immer verändert, springt an der entscheidenden Stelle aus der Analyse heraus. Wirkungsökonomisch zählt nicht die Beruhigung durch einen historischen Allgemeinsatz, sondern die Zustandsveränderung, die heute entsteht: Gesundheit, Infrastruktur, Landwirtschaft, Wasser, Versicherbarkeit, öffentliche Haushalte und demokratische Stabilität. Die bessere Debatte fragt deshalb: Was ist die Ursache im aktuellen System, welche Schäden entstehen bei weiterer Verzögerung, und welche Maßnahmen senken die Risiken mit der besten Netto-Wirkung?",
  },
  "co2-ist-nur-ein-spurengas": {
    thirty_seconds:
      "Wenn jemand einen Prozentanteil nennt, ist das noch keine Wirkungsanalyse. Wir müssten fragen: Wo greift der Stoff im System an, wie verändert er Energieflüsse, und welche Rückkopplungen werden ausgelöst?",
    two_minutes:
      "Das Wort Spurengas klingt, als könne etwas Kleines nur eine kleine Rolle spielen. Genau da sitzt der Denkfehler. Wirkung hängt nicht nur von Menge ab, sondern von Ort, Mechanismus und Systemempfindlichkeit. Ein winziger Anteil eines Medikaments kann den Körper verändern, ein kleiner Zinssatz kann über Jahrzehnte große Vermögen verschieben, und ein Stoff in der Atmosphäre kann den Energiehaushalt beeinflussen, wenn er an der richtigen physikalischen Stelle wirkt. Bei CO₂ geht es um Wärmestrahlung, Konzentrationsanstieg und Rückkopplungen im Klimasystem. Wirkungsökonomisch übersetzen wir das in die Frage: Welche reale Zustandsveränderung entsteht für Mensch, Planet und Demokratie? Wenn wir den Mechanismus kleinreden, unterschätzen wir Hitze, Extremwetter, Gesundheitskosten, Anpassungsdruck und Infrastrukturfolgen. Die gute Antwort nimmt den Zahlenkern ernst, aber lässt aus klein nicht automatisch unwichtig werden.",
  },
  "deutschland-nur-zwei-prozent": {
    thirty_seconds:
      "Zusätzlich zählt die Vorbild- und Standardwirkung: Maschinenbau, Chemie, Automobilindustrie, EU-Regeln, Beschaffung und Kapitalmärkte können Wirkung weit über die nationale Emissionsmenge hinaus auslösen.",
    two_minutes:
      "Außerdem steckt in dem Satz eine gefährliche Kopierlogik. Sehr viele Länder können einzeln sagen: Unser Anteil ist nicht groß genug, um allein das Klima zu retten. Wenn alle diese Schlussfolgerung ziehen, entsteht kollektive Untätigkeit. Genau deshalb unterscheidet die WÖk zwischen Anteil und Wirkungspfad. Deutschland hat direkte Emissionen, aber auch indirekte Hebel: Technologieentwicklung, Netze, Industrieprozesse, Normen, Finanzierungsbedingungen, EU-Gesetzgebung, Lieferketten und internationale Glaubwürdigkeit. Wenn ein Industrieland zeigt, dass klimaneutrale Produktion, sichere Energieversorgung und soziale Abfederung zusammen funktionieren, senkt das Risiko und Kosten für andere. Wenn es scheitert oder abwartet, stärkt es Verzögerungsargumente. Die bessere Frage lautet also nicht, ob Deutschland allein die Welt rettet. Die Frage lautet: Welche Hebel sind real, wie stark wirken sie, und welche Folgeschäden entstehen, wenn wir sie nicht nutzen?",
  },
  "klimaschutz-ist-oekodiktatur": {
    thirty_seconds:
      "Eine seriöse Kritik benennt deshalb die konkrete Maßnahme: Gesetz, Preis, Standard, Förderung oder Verbot. Erst dann kann man demokratische Legitimation, soziale Fairness, Alternativen und Wirkung prüfen.",
    two_minutes:
      "Der Begriff Ökodiktatur ist stark, weil er Freiheitsschutz aktiviert. Freiheit ist ein echter demokratischer Wert, und Klimapolitik muss sich daran messen lassen. Aber der Begriff verschiebt die Debatte oft von überprüfbaren Fragen zu einem Feindbild. Dann reden wir nicht mehr darüber, ob ein CO₂-Preis sozial zurückverteilt wird, ob ein Standard verhältnismäßig ist, ob eine Förderung besser wäre oder welche Alternativen es gibt. Wir reden nur noch über Angst vor Kontrolle. Wirkungsökonomisch ist das zu grob. Gute Klimapolitik muss Schäden vermeiden, Gesundheit schützen, soziale Härten abfedern, Beteiligung ermöglichen und demokratisch kontrollierbar bleiben. Schlechte Klimapolitik darf man kritisieren. Aber pauschal jede Steuerung als Diktatur zu rahmen, blockiert genau die Abwägung, die Demokratie leisten soll. Die bessere Frage ist: Welche konkrete Maßnahme schützt Freiheit, Klima, Gesundheit und soziale Stabilität am besten?",
  },
  "energiewende-gescheitert": {
    thirty_seconds:
      "Man muss also unterscheiden zwischen Befund und Schlussfolgerung. Ein Engpass ist ein Steuerungssignal: Wo fehlen Netze, wo Flexibilität, wo Speicher, wo Planungssicherheit, wo soziale Abfederung?",
    two_minutes:
      "Das Wort gescheitert ist politisch bequem, aber analytisch zu grob. Ein Energiesystem besteht aus Erzeugung, Netzen, Speichern, Lastmanagement, Preisen, Genehmigungen, Industrieprozessen, Gebäuden und Verbrauchsverhalten. In so einem System kann ein Teil gut laufen, während andere Teile bremsen. Genau deshalb hilft der Pauschalframe nicht weiter. Wenn der Ausbau erneuerbarer Erzeugung Fortschritte macht, aber Netze oder Flexibilität hinterherlaufen, heißt die Lösung nicht Abbruch, sondern Engpassbeseitigung. Wenn Strompreise Haushalte belasten, braucht es soziale Rückverteilung, Effizienz und bessere Marktdesigns. Wenn Industrie Planungssicherheit braucht, müssen Infrastruktur und Verträge verlässlicher werden. Die WÖk fragt: Wo entsteht positive Netto-Wirkung pro eingesetztem Euro und Jahr? Welche Engpässe verhindern diese Wirkung? Und welche politischen Instrumente koppeln Klima-, Kosten-, Versorgungs- und Demokratieeffekte besser zurück?",
  },
  "windraeder-zerstoeren-natur": {
    thirty_seconds:
      "Die Antwort darf deshalb weder beschwichtigen noch pauschal blockieren. Entscheidend sind Standort, Artenschutzprüfung, Abschaltzeiten, Repowering, Beteiligung und der Vergleich mit fossilen Alternativen.",
    two_minutes:
      "Eine gute Antwort beginnt mit Anerkennung: Ja, Windenergie kann lokal belasten. Es gibt Konflikte mit Landschaft, bestimmten Vogel- und Fledermausarten, Waldstandorten, Schall, Schatten und Beteiligungsfragen. Wer das wegwischt, verliert Vertrauen. Aber der nächste Schritt ist genauso wichtig: Lokaler Zielkonflikt ist nicht dasselbe wie generelle Naturzerstörung. Auch fossile Energien haben Naturwirkungen - über Flächen, Abbau, Luftschadstoffe, Wasser, Klimaerwärmung und Extremereignisse. Wirkungsökonomisch bewerten wir deshalb nicht eine Technologie im Symbolkampf, sondern konkrete Netto-Wirkung. Welche Fläche, welcher Standort, welche Arten, welche Minderungsmaßnahmen, welche Alternativen, welche Beteiligung? Die Reverse Merit Order sagt: Biodiversitätsschäden dürfen nicht durch Klimanutzen verdeckt werden. Das heißt aber nicht Stillstand. Es heißt: planen, messen, verbessern, beteiligen und die schwächsten Wirkungsfelder gezielt stärken.",
  },
  "e-autos-schlimmer-als-verbrenner": {
    thirty_seconds:
      "Fair wird der Vergleich erst, wenn beide Seiten vollständig gerechnet werden: Herstellung, Batterie, Strommix, Nutzung, Wartung, Lebensdauer, Recycling, Fahrzeuggröße und die fossilen Emissionen des Verbrenners. Sonst vergleicht man einen sichtbaren Batterieeffekt mit unsichtbar gemachten Auspuffemissionen.",
    two_minutes:
      "Der Satz funktioniert, weil er ein reales Problem anspricht: Batterien brauchen Rohstoffe, Energie und gute Lieferkettenkontrolle. Das muss in jede seriöse Bewertung hinein. Irreführend wird es, wenn nur dieser Teil gezeigt wird und der Verbrenner so behandelt wird, als sei nach der Herstellung kaum noch Wirkung vorhanden. Tatsächlich entstehen beim Verbrenner über die Nutzung fortlaufend fossile CO₂-Emissionen und Luftschadstoffe. Beim E-Auto verlagert sich ein größerer Teil der Wirkung in Herstellung, Batterie und Stromerzeugung - und genau deshalb verbessern Strommix, Batteriedesign, Recycling, Fahrzeuggröße und Nutzungsdauer die Bilanz. Wirkungsökonomisch ist die Lösung keine Werbung für jedes einzelne E-Auto. Ein schweres Fahrzeug mit schlechter Nutzung bleibt problematisch. Die Lösung ist eine Mobilitätsscorecard: CO₂, Ressourcen, Gesundheit, Arbeit, Lieferketten, Recycling und tatsächlicher Mobilitätsbedarf. Dann gewinnt nicht das Lager, sondern die bessere Netto-Wirkung.",
  },
  "batterien-sind-nicht-recyclebar": {
    thirty_seconds:
      "Die sinnvolle Frage lautet also nicht ja oder nein, sondern: Welche Batteriechemie, welches Sammelsystem, welches Verfahren, welche Rückgewinnungsquote und welche Designstandards sind gemeint? Aus einer schwierigen Skalierung folgt keine grundsätzliche Unmöglichkeit.",
    two_minutes:
      "Der Satz klingt endgültig, aber Batterierecycling ist kein statischer Zustand. Es hängt von Chemie, Bauform, Rücknahme, Sortierung, Prozess, Energiequelle, Regulierung und Marktgröße ab. Es gibt Materialien, die technisch leichter zurückgewonnen werden, andere sind schwieriger oder wirtschaftlich weniger attraktiv. Daraus folgt aber nicht, dass Batterien grundsätzlich nicht recyclebar sind. Wirkungsökonomisch wäre die falsche Reaktion, Rohstoffprobleme als Totschlagargument gegen jede Elektrifizierung zu nutzen. Die richtige Reaktion ist eine Kreislaufstrategie: kleinere und langlebigere Batterien, besseres Design, Reparierbarkeit, Second-Life-Nutzung, verpflichtende Rücknahme, transparente Materialdaten, hohe Recyclingstandards und saubere Energie im Prozess. Gleichzeitig bleiben soziale und ökologische Lieferkettenfragen relevant. Nichtkompensation heißt: Gute Klimawerte dürfen schlechte Arbeitsbedingungen oder Rohstoffschäden nicht verdecken. Genau darum braucht es Produktdaten statt Pauschalsätze.",
  },
  "kernenergie-einfache-loesung": {
    thirty_seconds:
      "Außerdem ist eine Energieoption nur im Vergleich bewertbar. Was kostet sie, wann wirkt sie, welche Risiken bleiben, und welche Alternativen könnten im selben Zeitraum mehr Wirkung erzeugen?",
    two_minutes:
      "Die faire Einordnung ist: Kernenergie hat Stärken, aber einfach ist sie als politische Lösung nicht. Niedrige Betriebsemissionen sind ein relevanter Punkt. Aber ein Energiesystem entscheidet sich nicht allein im Betrieb. Es geht um Neubauzeiten, Finanzierung, Bau- und Kostenrisiken, Endlagerung, Sicherheitsarchitektur, Fachkräfte, Lieferketten, gesellschaftliche Akzeptanz, Versicherung, Regulierung und die Frage, was im gleichen Zeitraum mit Netzen, Speichern, Erneuerbaren, Effizienz, Lastmanagement und Industrieumbau möglich wäre. Wirkungsökonomisch sind Opportunitätskosten zentral: Jeder Euro, jedes politische Mandat und jedes Jahr kann nur einmal eingesetzt werden. Eine Technologie kann also abstrakt funktionieren und trotzdem im konkreten Zeitfenster nicht die beste Netto-Wirkung haben. Die bessere Debatte lautet nicht Kernenergie als Identitätsfrage, sondern: Welche Investition senkt rechtzeitig die meisten Risiken für Mensch, Planet und Demokratie?",
  },
  "fusion-loest-das-problem": {
    thirty_seconds:
      "Deshalb muss man Zeithorizonte trennen: Forschung kann langfristige Optionen schaffen. Klimaschutz braucht aber Wirkung in den nächsten Jahren, nicht erst nach möglicher Industrialisierung. Zukunftsforschung ist Ergänzung, keine Ausrede für heutigen Aufschub.",
    two_minutes:
      "Fusion ist ein gutes Beispiel dafür, wie Hoffnung und Aufschub ineinander rutschen können. Hoffnung ist berechtigt: Forschung an neuen Energiequellen kann langfristig sehr wertvoll sein. Aber daraus folgt nicht, dass heutige Emissionen warten können. Für Klimarisiken zählt der kumulierte Ausstoß. Jede Tonne, die heute zusätzlich in der Atmosphäre landet, erhöht den späteren Druck auf Anpassung, Infrastruktur und Ökosysteme. Wenn Fusion als Ergänzung zu Netzen, Speichern, Erneuerbaren, Effizienz und Industrieumbau diskutiert wird, ist sie Teil einer Zukunftsstrategie. Wenn sie als Ersatz für heutige Maßnahmen verwendet wird, wird sie zum Verzögerungsnarrativ. Die WÖk trennt deshalb Forschungspfad und Wirkungspfad: Was ist wissenschaftlich sinnvoll? Was ist netzrelevant, skalierbar und bezahlbar? Und was senkt in diesem Jahrzehnt real Schäden für Mensch, Planet und Demokratie?",
  },
  "klimaschutz-deindustrialisiert-deutschland": {
    thirty_seconds:
      "Dazu gehört auch: Nicht-Transformation ist keine kostenlose Stabilität. CO₂-Kosten, Importabhängigkeit, fossile Preisschocks und veraltete Anlagen können selbst Wettbewerbsfähigkeit zerstören. Die strategische Frage lautet: Welche Investitionen sichern Zukunftsmärkte?",
    two_minutes:
      "Der Satz trifft einen echten Nerv, weil Industriepolitik über Arbeitsplätze, Regionen, Einkommen und Sicherheit entscheidet. Schlechte Transformation kann Schaden anrichten: zu hohe Kosten, unklare Regeln, langsame Netze, fehlende Fachkräfte, unsichere Förderung oder soziale Härten. Aber daraus folgt nicht, dass Klimaschutz der Gegner von Industrie ist. Eine klimaneutrale Welt verändert Märkte. Wer zu spät investiert, kann ebenso Wertschöpfung verlieren: durch CO₂-Preise, fossile Importabhängigkeit, veraltete Anlagen, technologische Rückstände oder verlorene Exportchancen. Wirkungsökonomisch fragen wir deshalb nach Zukunftswirkung: Welche Industriepfade sichern gute Arbeit, regionale Stabilität, Versorgungssicherheit, Ressourcenproduktivität und Klimastabilität zugleich? Dafür braucht es günstigen sauberen Strom, Netze, Speicher, grüne Grundstoffe, Kreislaufwirtschaft, Qualifizierung und faire Übergänge. Die Alternative ist nicht alter Wohlstand ohne Risiko, sondern ein anderer Risikomix.",
  },
};

const deepDiveSlugs = [
  "deutschland-nur-zwei-prozent",
  "energiewende-gescheitert",
  "e-autos-schlimmer-als-verbrenner",
  "kernenergie-einfache-loesung",
  "fusion-loest-das-problem",
];

const deepDiveDetails = {
  "deutschland-nur-zwei-prozent": {
    title: "„Deutschland ist nur für 2 % verantwortlich“",
    subtitle: "Wahrer Kern, falsche Schlussfolgerung",
    confidence: "hoch",
    readingTime: "12 Minuten",
    leadQuestion: "Welche Hebelwirkung können wir trotz begrenztem Anteil erzeugen?",
    claimAnatomy: {
      original: "Deutschland ist nur für 2 % verantwortlich.",
      extended: "Deutschland ist nur für 2 % verantwortlich, also bringt Klimaschutz hier nichts.",
      trueCore: "Deutschland hat nur einen begrenzten Anteil an den aktuellen globalen Jahresemissionen.",
      missingContext:
        "Aktueller Anteil ist nicht gleich historische Verantwortung, Pro-Kopf-Verantwortung, technologische Hebelwirkung oder politische Systemwirkung.",
      falseConclusion: "Aus einem kleineren Anteil folgt nicht, dass Handeln wirkungslos ist.",
    },
    trueText:
      "Deutschland löst die Klimakrise nicht allein. Klimaschutz ist ein globales Kooperationsproblem, und ohne große Emittenten wie China, USA, Indien, EU und weitere Staaten kann das Ziel nicht erreicht werden.",
    missingItems: [
      "Historische Verantwortung: Industrieländer haben über lange Zeiträume zur CO₂-Konzentration beigetragen.",
      "Pro-Kopf-Perspektive: Ein Land kann bei Gesamtmenge kleiner wirken, aber pro Kopf überdurchschnittlich emittieren.",
      "Technologie- und Markthebel: Standards, Maschinenbau, Netze, Speicher, Verfahren und Regulierung wirken über Grenzen hinaus.",
      "EU-Hebel: Deutschland wirkt als Teil eines großen Binnenmarkts, der internationale Standards prägen kann.",
      "Unterlassungswirkung: Nicht-Handeln verzögert Innovation, Infrastruktur, Planungssicherheit und Glaubwürdigkeit.",
    ],
    evidence: {
      status: "datenbasiert",
      level: "hoch",
      uncertainty:
        "Nationale Anteile variieren je nach Datenquelle, Jahr, Emissionsart und Bilanzgrenze. Die Schlussfolgerung der Wirkungslosigkeit folgt daraus aber logisch nicht.",
      sourceKeys: ["uba_emissions_germany", "ipcc_ar6_headline"],
    },
    wirkstoff: {
      label: "Zahlenargument als Ohnmachtsimpuls",
      description: "Ein scheinbar nüchterner Prozentwert wird genutzt, um Handlungsfähigkeit zu senken.",
      mechanism: "Der Anteil eines Landes wird mit Wirkungslosigkeit verwechselt.",
      resonance: ["Kostenangst", "Veränderungsmüdigkeit", "Entlastungsbedürfnis", "Misstrauen gegen Klimapolitik"],
    },
    narrative: {
      message: "Wir können sowieso nichts ändern.",
      emotional: "Entlastung und Abwehr von Veränderungsdruck.",
      political: "Klimapolitik erscheint nutzlos oder überzogen.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen halten Klimaschutz für nutzlos."],
      ["Wirkung 2. Ordnung", "Politische Unterstützung für Energiewende, Infrastruktur und Industrieumbau sinkt."],
      ["Wirkung 3. Ordnung", "Fossile Pfadabhängigkeiten, alte Geschäftsmodelle und Verzögerungslogiken bleiben länger bestehen."],
    ],
    falseActions: [
      ["Politik", "Maßnahmen werden verschoben, abgeschwächt oder symbolisch."],
      ["Wirtschaft", "Investitionssicherheit für klimafreundliche Technologien sinkt."],
      ["Infrastruktur", "Netze, Speicher, Ladepunkte, Gebäudesanierung und Industrieumbau kommen langsamer voran."],
      ["Demokratie", "Ohnmacht und Zynismus wachsen; kollektive Problemlösung wirkt sinnlos."],
      ["Planet", "Emissionen sinken langsamer, Klimafolgekosten steigen."],
    ],
    solutionLead: "Die wirkungsökonomische Antwort lautet nicht: Deutschland rettet allein das Klima. Sie lautet: Wirkung entsteht über Hebel.",
    clipHook: "Stimmt der 2-Prozent-Satz? Vielleicht. Aber die Schlussfolgerung ist trotzdem falsch.",
    caption: "Wahrer Kern, falsche Folgerung: Klimawirkung entsteht über Hebel, nicht nur über Prozentanteile.",
  },
  "energiewende-gescheitert": {
    title: "„Die Energiewende ist gescheitert“",
    subtitle: "Scheiternsframe statt Engpassanalyse",
    confidence: "hoch",
    readingTime: "14 Minuten",
    leadQuestion: "Welcher Engpass begrenzt die nächste positive Netto-Wirkung?",
    claimAnatomy: {
      original: "Die Energiewende ist gescheitert.",
      extended: "Die Energiewende ist gescheitert, deshalb sollten wir den Kurs stoppen oder zurückdrehen.",
      trueCore: "Es gibt reale Probleme bei Tempo, Kosten, Infrastruktur, Netzen, Speichern, Wärme, Verkehr und Industrie.",
      missingContext: "Ein Systemumbau kann Engpässe haben, ohne gescheitert zu sein.",
      falseConclusion: "Aus Problemen folgt nicht automatisch, dass der gesamte Transformationspfad falsch ist.",
    },
    trueText:
      "Netzausbau, Speicher, Flexibilität, Genehmigungen, Wärmewende, Verkehr, Preise, Industriepolitik und Akzeptanz sind reale Engpässe.",
    missingItems: [
      "Der Stromsektor hat bereits deutliche Transformation erlebt.",
      "Engpässe sind Steuerungsinformationen, kein Beweis des Totalversagens.",
      "Fossile Alternativen haben Kosten, Importabhängigkeiten, Gesundheitsrisiken und Folgeschäden.",
      "Die relevante Frage ist nicht Energiewende ja oder nein, sondern welche Engpässe zuerst gelöst werden.",
    ],
    evidence: {
      status: "datenbasiert",
      level: "hoch",
      uncertainty: "Mittel bei zukünftigen Strompreisen, Speicherpfaden, Industrieeffekten und Importabhängigkeiten.",
      sourceKeys: ["fraunhofer_ise_energy_charts", "uba_emissions_germany"],
    },
    wirkstoff: {
      label: "Scheiternsframe",
      description: "Sichtbare Engpässe werden in ein Totalurteil über einen komplexen Systemumbau verwandelt.",
      mechanism: "Komplexität wird auf gelungen oder gescheitert reduziert.",
      resonance: ["Frust über Kosten", "Misstrauen gegen Politik", "Infrastrukturmüdigkeit", "Angst vor Kontrollverlust"],
    },
    narrative: {
      message: "Der ganze Kurs ist falsch.",
      emotional: "Frust wird in Abbruchlogik übersetzt.",
      political: "Investitionen und Transformation verlieren Legitimität.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen übernehmen den Eindruck, der Umbau sei grundsätzlich gescheitert."],
      ["Wirkung 2. Ordnung", "Politischer Druck gegen Netze, Speicher, Wind, Solar, Wärmepumpen oder Ladeinfrastruktur steigt."],
      ["Wirkung 3. Ordnung", "Die Entscheidungsstruktur kippt von lernender Transformation zurück in fossile Reparaturlogik."],
    ],
    falseActions: [
      ["Stromsystem", "Netz-, Speicher- und Flexibilitätsausbau werden verlangsamt."],
      ["Wirtschaft", "Unternehmen erhalten unsichere Signale und verschieben Investitionen."],
      ["Haushalte", "Kosten bleiben höher, wenn alte fossile Abhängigkeiten fortbestehen."],
      ["Demokratie", "Politik erscheint handlungsunfähig; Populismus erhält Resonanz."],
      ["Planet", "Emissionen sinken langsamer."],
    ],
    solutionLead: "Die wirkungsökonomische Antwort verschiebt die Debatte von der Lagerfrage zur Engpasslogik.",
    clipHook: "Die Energiewende ist nicht gescheitert - sie zeigt Engpässe. Und genau die müssen wir lösen.",
    caption: "Nicht Totalurteil, sondern Engpassanalyse: So denkt der Wirkungsradar.",
  },
  "e-autos-schlimmer-als-verbrenner": {
    title: "„E-Autos sind schlimmer als Verbrenner“",
    subtitle: "Rohstoffangst und falscher Lebenszyklusvergleich",
    confidence: "hoch",
    readingTime: "15 Minuten",
    leadQuestion: "Welche Mobilitätslösung erzeugt über den gesamten Lebenszyklus die beste Netto-Wirkung?",
    claimAnatomy: {
      original: "E-Autos sind schlimmer als Verbrenner.",
      extended: "E-Autos sind wegen Batterie, Rohstoffen und Strommix klimaschädlicher als Verbrenner.",
      trueCore: "Batterieproduktion und Rohstoffabbau verursachen relevante ökologische und soziale Wirkungen.",
      missingContext: "Entscheidend ist der gesamte Lebenszyklus, nicht nur die Herstellung.",
      falseConclusion: "Aus Batterieproblemen folgt nicht automatisch, dass Verbrenner besser sind.",
    },
    trueText:
      "Batterieproduktion benötigt Energie und Rohstoffe. Lieferketten können Wasser-, Biodiversitäts-, Arbeitsrechts- und Governance-Probleme enthalten.",
    missingItems: [
      "Verbrenner emittieren während der gesamten Nutzung fossiles CO₂.",
      "Verbrenner verursachen Luftschadstoffe und fossile Importabhängigkeit.",
      "Der Strommix kann über die Lebensdauer erneuerbarer werden.",
      "Batterien können recycelt, weitergenutzt und technologisch verbessert werden.",
      "Die beste Mobilitätswirkung entsteht nicht automatisch durch Autoersatz, sondern durch bessere Mobilitätssysteme.",
    ],
    evidence: {
      status: "datenbasiert",
      level: "hoch",
      uncertainty: "Mittel bei künftigen Batteriechemien, Recyclingquoten, Strommix, Fahrzeuggröße und Lieferkettenqualität.",
      sourceKeys: ["icct_lca_ev_2025", "uba_emissions_germany"],
    },
    wirkstoff: {
      label: "Rohstoffangst als Verzögerungsimpuls",
      description: "Ein reales Problemfeld wird genutzt, um den gesamten Technologiewechsel zu diskreditieren.",
      mechanism: "Ein Teil der Lebenszykluswirkung wird zum Gesamturteil gemacht.",
      resonance: ["Misstrauen gegen neue Technologien", "Angst vor Ausbeutung", "Sorge um Natur und Ressourcen", "Abwehr gegen Mobilitätswandel"],
    },
    narrative: {
      message: "Die angeblich grüne Lösung ist in Wahrheit schlimmer.",
      emotional: "Moralische Entlastung für fossile Weiterführung.",
      political: "Verzögerung von Ladeinfrastruktur, Flottenumstellung und Mobilitätswende.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen zweifeln an der Klimawirkung von E-Mobilität."],
      ["Wirkung 2. Ordnung", "Investitionen in Ladeinfrastruktur, Batterierecycling und Flottenumstellung sinken."],
      ["Wirkung 3. Ordnung", "Der Mobilitätsmarkt bleibt länger an fossile Pfade und alte Industrieinteressen gebunden."],
    ],
    falseActions: [
      ["Mobilität", "Verbrenner bleiben länger im System."],
      ["Industrie", "Batterie-, Recycling- und Lieferkettenkompetenz wandert ab."],
      ["Klima", "Nutzungsemissionen bleiben höher."],
      ["Gesundheit", "Luftschadstoffbelastungen sinken langsamer."],
      ["Lieferketten", "Echte Rohstoffprobleme werden nicht gelöst, sondern als Abbruchargument missbraucht."],
    ],
    solutionLead: "Die WÖk bewertet nicht Technologie-Lager, sondern Mobilitätswirkung über den Lebenszyklus.",
    clipHook: "E-Autos sind nicht perfekt. Aber der Verbrenner-Vergleich muss ehrlich sein.",
    caption: "Lebenszyklus statt Lagerkampf: Mobilität wirkungsökonomisch prüfen.",
  },
  "kernenergie-einfache-loesung": {
    title: "„Kernenergie wäre die einfache Lösung“",
    subtitle: "Strategiebehauptung mit Zeit-, Kosten- und Risikooffenheiten",
    confidence: "mittel",
    readingTime: "16 Minuten",
    leadQuestion: "Welche Energieinvestition wirkt rechtzeitig, bezahlbar und mit geringster Netto-Negativwirkung?",
    claimAnatomy: {
      original: "Kernenergie wäre die einfache Lösung.",
      extended: "Deutschland hätte mit Kernenergie keine Energieprobleme und könnte Klimaschutz einfacher erreichen.",
      trueCore: "Kernkraftwerke emittieren im Betrieb wenig CO₂ und können steuerbare Leistung bereitstellen.",
      missingContext: "Neue Kernenergie braucht lange Planung, hohe Investitionen, Sicherheits- und Entsorgungsstrukturen sowie Akzeptanz.",
      falseConclusion: "Aus niedrigen Betriebsemissionen folgt nicht automatisch, dass Kernenergie im deutschen Zeitfenster die beste Lösung ist.",
    },
    trueText:
      "Kernenergie ist im Betrieb CO₂-arm und steuerbar. In Ländern mit bestehender Kernenergieflotte kann die Laufzeitfrage anders bewertet werden als in Deutschland.",
    missingItems: [
      "Deutschland hat die Kernenergie politisch, rechtlich, personell und infrastrukturell beendet.",
      "Neue Reaktoren hätten lange Vorlaufzeiten.",
      "Kapitalbindung und Opportunitätskosten sind zentral.",
      "Endlagerung, Sicherheit, Haftung, Rückbau und Kühlwasserfragen gehören zur Netto-Wirkung.",
      "Die relevante Frage lautet: Was wirkt in Deutschland rechtzeitig und am besten?",
    ],
    evidence: {
      status: "teilweise umstritten",
      level: "mittel",
      uncertainty: "Hoch bei Neubaukosten, Bauzeiten, Finanzierung, regulatorischen Pfaden und politischer Akzeptanz in Deutschland.",
      sourceKeys: ["iea_nuclear", "base_endlager"],
    },
    wirkstoff: {
      label: "Falsche Einfachheit",
      description: "Eine komplexe Strategieoption wird als unkomplizierte Lösung dargestellt.",
      mechanism: "Ein positiver Technologieaspekt wird vom Systemkontext getrennt.",
      resonance: ["Sehnsucht nach einfacher Lösung", "Frust über Energiewende", "Misstrauen gegen Erneuerbare", "Kontrollbedürfnis"],
    },
    narrative: {
      message: "Man hätte nur bei Atomkraft bleiben müssen.",
      emotional: "Rückkehr zu scheinbarer Kontrolle.",
      political: "Erneuerbare, Netze, Speicher und Effizienz werden als zweitbeste Lösungen gerahmt.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen unterschätzen Zeit-, Kosten- und Entsorgungsfragen."],
      ["Wirkung 2. Ordnung", "Politischer Druck entsteht, verfügbare Lösungen als unzureichend darzustellen."],
      ["Wirkung 3. Ordnung", "Die Transformationsarchitektur verschiebt sich von lernender Dezentralität zu Großprojekt- und Kontrolllogik."],
    ],
    falseActions: [
      ["Zeit", "Emissionseinsparungen im laufenden Jahrzehnt werden nicht durch Neubauten erreicht."],
      ["Kapital", "Investitionen könnten von Netzen, Speichern, Effizienz, Gebäuden und Industrieumstellung abgezogen werden."],
      ["Entsorgung", "Langfristige Abfall- und Governance-Verantwortung steigt."],
      ["Demokratie", "Konflikte um Standorte, Risiken und Kosten können Akzeptanz belasten."],
      ["System", "Komplexitätsreduktion ersetzt echte Netto-Wirkungsanalyse."],
    ],
    solutionLead: "Die WÖk vergleicht Technologien nach Netto-Wirkung im konkreten Zeitfenster.",
    clipHook: "Atomkraft ist nicht die Frage. Die Frage ist: Welche Option wirkt rechtzeitig?",
    caption: "Technologievergleich nach Wirkung: Zeit, Kosten, Risiko, Alternativen.",
  },
  "fusion-loest-das-problem": {
    title: "„Fusion löst das Problem“",
    subtitle: "Forschung ja, Aufschub nein",
    confidence: "hoch",
    readingTime: "13 Minuten",
    leadQuestion: "Welche Lösung wirkt jetzt - und welche Forschung schafft langfristige Optionen?",
    claimAnatomy: {
      original: "Fusion löst das Problem.",
      extended: "Wir müssen nicht so stark auf heutige Klimaschutzmaßnahmen setzen, weil Fusion das Energieproblem später lösen wird.",
      trueCore: "Fusion ist wissenschaftlich relevant und kann langfristig eine wichtige Energieoption werden.",
      missingContext: "Kommerzielle, skalierte Fusionsstromerzeugung ist nicht kurzfristig verfügbar.",
      falseConclusion: "Aus langfristiger Forschung folgt nicht, dass heutige Emissionsminderung verzichtbar ist.",
    },
    trueText:
      "Fusion ist ein bedeutendes Forschungsfeld. Bei erfolgreicher Entwicklung könnte sie langfristig neue Energieoptionen eröffnen.",
    missingItems: [
      "Klimaschutz hat ein akutes Zeitfenster.",
      "Fusion ist noch keine verfügbare, skalierte Stromquelle.",
      "Netze, Erneuerbare, Speicher, Effizienz, Wärmewende und Industrieumbau wirken jetzt.",
      "Forschung darf nicht gegen Implementierung ausgespielt werden.",
    ],
    evidence: {
      status: "prognose unsicher",
      level: "hoch beim Technologiestatus, offen bei Kommerzialisierung",
      uncertainty: "Hoch bei Zeitpunkt, Kosten, Skalierbarkeit, Materialfragen und Systemintegration künftiger Fusionskraftwerke.",
      sourceKeys: ["iter", "eurofusion_demo"],
    },
    wirkstoff: {
      label: "Zukunftstechnologie als Aufschubimpuls",
      description: "Eine mögliche spätere Lösung wird als Grund genutzt, heutige Lösungen zu verlangsamen.",
      mechanism: "Hoffnung wird von Handlungsenergie in Wartelogik umgewandelt.",
      resonance: ["Technikoptimismus", "Veränderungsvermeidung", "Sehnsucht nach problemloser Lösung", "Misstrauen gegen heutige Transformation"],
    },
    narrative: {
      message: "Wir müssen nur warten, bis die perfekte Lösung kommt.",
      emotional: "Entlastung von unbequemen heutigen Entscheidungen.",
      political: "Heute verfügbare Maßnahmen verlieren Dringlichkeit.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen glauben, heutige Maßnahmen seien weniger dringend."],
      ["Wirkung 2. Ordnung", "Politische Unterstützung für kurzfristig wirksame Infrastruktur sinkt."],
      ["Wirkung 3. Ordnung", "Das System stabilisiert eine Wartelogik statt eine Lern- und Umsetzungskultur."],
    ],
    falseActions: [
      ["Klima", "Emissionen bleiben länger hoch."],
      ["Industrie", "Heute verfügbare Technologien skalieren langsamer."],
      ["Forschung", "Fusion wird politisch überfrachtet und als Heilsversprechen statt Forschungsprogramm kommuniziert."],
      ["Demokratie", "Enttäuschung kann wachsen, wenn versprochene Durchbrüche nicht rechtzeitig eintreten."],
    ],
    solutionLead: "Die WÖk trennt Forschung und Umsetzung, finanziert aber beide wirkungsorientiert.",
    clipHook: "Fusion ist Hoffnung - aber kein Ersatz für Handeln.",
    caption: "Forschung ja. Aufschub nein.",
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugSource(label) {
  return sourcePack.primary_sources.find((source) => source.label === label) || sourcePack.primary_sources[0];
}

const germanyTwoPercentSourceMeta = new Map([
  [
    "Umweltbundesamt - Treibhausgas-Emissionen in Deutschland",
    {
      title: "UBA - territoriale Treibhausgasemissionen",
      shows: "Deutschland emittierte 2024 territorial rund 649 Mio. t CO₂e; BMUKN/UBA-Vorabdaten für 2025 nennen 648,9 Mio. t CO₂e.",
      use_for: "Einordnung der engen territorialen Bilanz.",
      warning: "Territoriale Emissionen sind nicht Gesamtverantwortung.",
    },
  ],
  [
    "EDGAR/JRC - globale Treibhausgasemissionen 2025 Report",
    {
      title: "EDGAR/JRC - globale Treibhausgasemissionen",
      shows: "Globale Treibhausgasemissionen erreichten 2024 rund 53,2 Gt CO₂e ohne LULUCF.",
      use_for: "Vergleichsgröße für territoriale Anteile.",
      warning: "Globaler Anteil sagt nichts über Konsum-, Produkt-, Scope-3- oder historische Verantwortung.",
    },
  ],
  [
    "Umweltbundesamt - Treibhausgasemissionen pro Person",
    {
      title: "UBA - Pro-Kopf-Emissionen mit Import-/Exportberücksichtigung",
      shows: "10,3 t CO₂e pro Person und Jahr, Stand 2021; mehr als 60 Prozent über dem Weltdurchschnitt.",
      use_for: "Konsum- und Nachfrageverantwortung.",
      warning: "Pro-Kopf-Fußabdruck ist eine andere Bilanzlogik als Territorialemissionen.",
    },
  ],
  [
    "Eurostat - Greenhouse gas emission footprints",
    {
      title: "Eurostat - Greenhouse gas emission footprints",
      shows: "Deutschlands Konsum war 2023 mit 903 Mio. t CO₂e verbunden; pro Kopf lag der Fußabdruck bei 10,8 t.",
      use_for: "Konsumemissionen und ausgelagerte Produktionswirkung.",
      warning: "Nicht mit Territorialwerten addieren; Bilanzgrenzen erklären.",
    },
  ],
  [
    "GHG Protocol - Corporate Value Chain Scope 3 Standard",
    {
      title: "GHG Protocol - Use of Sold Products",
      shows: "Die Nutzung verkaufter Produkte ist Scope-3-Kategorie 11; Beispiele sind Automobile, Motoren, Kraftwerke, Gebäude und Geräte.",
      use_for: "Produktnutzung und exportierte Emissionsverantwortung.",
      warning: "Scope 3 ist Unternehmensbilanz, nicht nationale Territorialbilanz.",
    },
  ],
  [
    "Destatis - 3.4 million new cars exported from Germany in 2024",
    {
      title: "Destatis - Pkw-Exporte",
      shows: "Deutschland exportierte 2024 rund 3,4 Mio. neue Pkw; 25,9 Prozent waren reine Elektroautos.",
      use_for: "Beispiel für exportierte Produktnutzung und Scope-3-Relevanz.",
      warning: "Die Exportzahl allein ist keine Emissionsbilanz; sie zeigt den Wirkungsraum.",
    },
  ],
  [
    "Our World in Data - Share of global cumulative CO2 emissions",
    {
      title: "Our World in Data - kumulative CO₂-Emissionen",
      shows: "Kumulative CO₂-Emissionen werden als laufende Summe jährlicher Emissionen seit 1750 ausgewiesen.",
      use_for: "Historische Verantwortung als eigene Bilanzfrage.",
      warning: "Jahresanteil ist nicht kumulative Klimawirkung.",
    },
  ],
]);

function germanyTwoPercentSourceCard(label) {
  const source = slugSource(label);
  const meta = germanyTwoPercentSourceMeta.get(label) || {
    title: source.label,
    shows: source.use_for.join(" / "),
    use_for: "Faktenprüfung und Kontext.",
    warning: "Bilanzgrenze offenlegen.",
  };
  return { ...source, ...meta };
}

function sentence(value) {
  const text = String(value ?? "");
  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
}

function words(value) {
  return String(value || "").split(/\s+/).filter(Boolean).length;
}

function answerText(claim, key) {
  const base = claim.answers[key];
  if (claim.answersFinal) return base;
  const expansion = answerExpansions[claim.slug]?.[key];
  return expansion ? `${base} ${expansion}` : base;
}

function expandedAnswers(claim) {
  return {
    ten_seconds: answerText(claim, "ten_seconds"),
    thirty_seconds: answerText(claim, "thirty_seconds"),
    two_minutes: answerText(claim, "two_minutes"),
  };
}

function deepDiveDetailFor(claim) {
  return deepDiveDetails[claim?.slug];
}

function deepDiveSources(detail) {
  return (detail?.evidence?.sourceKeys || []).map((key) => deepDiveSourcePack.sources[key]).filter(Boolean);
}

function htmlList(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function deepDiveLiveLink(claim) {
  if (!deepDiveDetailFor(claim)) return "";
  return `<section class="section section-soft deep-dive-live-link" aria-labelledby="deep-dive-link-${escapeHtml(claim.slug)}">
        <div class="card">
          <p class="card-kicker">Deep Dive</p>
          <h2 class="card-title" id="deep-dive-link-${escapeHtml(claim.slug)}">Ausführliche Wirkungsanalyse.</h2>
          <p class="card-text">Die Detailseite trennt Faktenkern, Ausblendungen, Evidenz, Wirkstoff, Wirkungspfad und wirkungsökonomische Lösung.</p>
          <p><a class="btn btn-primary" href="../../detail/${escapeHtml(claim.slug)}/">Detailanalyse öffnen</a></p>
        </div>
      </section>`;
}

function isComplexYaml(value) {
  return value && typeof value === "object";
}

function yamlScalar(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "null";
  return JSON.stringify(value);
}

function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `\n${value
      .map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const entries = Object.entries(item);
          const [firstKey, firstValue] = entries[0];
          const first = isComplexYaml(firstValue)
            ? `${pad}- ${firstKey}:${toYaml(firstValue, indent + 4)}`
            : `${pad}- ${firstKey}: ${yamlScalar(firstValue)}`;
          const rest = entries
            .slice(1)
            .map(([key, entryValue]) =>
              isComplexYaml(entryValue)
                ? `${" ".repeat(indent + 2)}${key}:${toYaml(entryValue, indent + 4)}`
                : `${" ".repeat(indent + 2)}${key}: ${yamlScalar(entryValue)}`
            );
          return [first, ...rest].join("\n");
        }
        return isComplexYaml(item) ? `${pad}-${toYaml(item, indent + 2)}` : `${pad}- ${yamlScalar(item)}`;
      })
      .join("\n")}`;
  }
  if (value && typeof value === "object") {
    return `\n${Object.entries(value)
      .map(([key, item]) =>
        isComplexYaml(item) ? `${pad}${key}:${toYaml(item, indent + 2)}` : `${pad}${key}: ${yamlScalar(item)}`
      )
      .join("\n")}`;
  }
  return yamlScalar(value);
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function pageShell({ title, description, canonical, base, main }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_section" content="Wirkungsradar">
    <meta name="search_type" content="Klima & Energie">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260603-climate-energy">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude>
        <a href="${base}index.html" data-nav-match="index.html">Start</a>
        <a href="${base}verstehen.html" data-nav-match="verstehen.html|wirkungsoekonomie.html|wirkungsoekonomie/|verstehen/">Verstehen</a>
        <a href="${base}so-wirkt-wirkungsoekonomie/" data-nav-match="so-wirkt-wirkungsoekonomie/">So wirkt WÖk</a>
        <a href="${base}wirkungsfelder/" data-nav-match="wirkungsfelder/">Wirkungsfelder</a>
        <a href="${base}werkzeuge/" data-nav-match="werkzeuge/">Methoden &amp; Werkzeuge</a>
        <a href="${base}erleben/" data-nav-match="erleben/">Erleben</a>
        <a href="${base}akademie.html" data-nav-match="akademie.html|akademie/">Akademie</a>
        <a href="${base}downloads.html" data-nav-match="downloads.html|downloads/">Bibliothek</a>
        <a href="${base}mitmachen.html" data-nav-match="mitmachen.html|mitmachen/">Mitmachen</a>
        <a href="${base}suche.html" data-nav-match="suche.html">Suche</a>
      </nav>
    </header>
${main}
    <footer class="footer" data-search-exclude>
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Wirkungsökonomie</p>
          <h2>Die neue Ordnung des Wohlstands</h2>
          <p>Website der Wirkungsökonomie: ein Gesellschafts- und Wirtschaftsmodell, das Wirkung auf Mensch, Planet und Demokratie sichtbar macht.</p>
          <p>Kontakt: <a class="text-link" href="mailto:impact@wirkungsoekonomie.org">impact@wirkungsoekonomie.org</a></p>
        </div>
        <a class="btn btn-primary" href="${base}kompass.html">WÖk-Kompass öffnen</a>
      </div>
    </footer>
    <script src="${base}assets/js/main.js?v=20260603-climate-energy"></script>
  </body>
</html>
`;
}

function topicSubnav(current, baseToRadar = "../") {
  const links = [
    ["Überblick", "../"],
    ["Methode", "../methode/"],
    ["Wissen", "../wissen/"],
    ["Live", "../live/"],
    ["Narrative", "../narrative/"],
    ["Themen", "../themen/"],
    ["Detail", "../detail/"],
  ];
  return `<nav class="topic-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude>
${links
  .map(([label, href]) => `        <a href="${baseToRadar}${href}"${label === current ? ' aria-current="page"' : ""}>${label}</a>`)
  .join("\n")}
      </nav>`;
}

function summaryGrid(items, label, className = "") {
  return `<div class="radar-summary-grid ${className}" aria-label="${escapeHtml(label)}">
${items
  .map(([itemLabel, value, tone = "neutral"]) => `          <article class="radar-summary-item" data-tone="${escapeHtml(tone)}"><p class="radar-summary-label">${escapeHtml(itemLabel)}</p><p class="radar-summary-value">${escapeHtml(value)}</p></article>`)
  .join("\n")}
        </div>`;
}

function factStatusBadge() {
  return `<section class="section section-soft fact-status-badge" aria-labelledby="fact-status">
        <div class="card">
          <p class="card-kicker">Faktenstand</p>
          <h2 class="card-title" id="fact-status">Datenstand: ${UPDATED_AT}</h2>
          <p class="card-text"><strong>Update-Frequenz:</strong> quartalsweise. ${escapeHtml(factStatus.warning)}</p>
          <ul class="clean-list">
            ${factStatus.update_triggers.map((trigger) => `<li>${escapeHtml(trigger)}</li>`).join("\n            ")}
          </ul>
        </div>
      </section>`;
}

function methodBox() {
  return `<section class="section section-soft climate-method-box" aria-labelledby="climate-method">
        <div class="card">
          <p class="card-kicker">Methodik</p>
          <h2 class="card-title" id="climate-method">Nicht nur Faktencheck, sondern Wirkungscheck.</h2>
          <ol class="radar-mini-flow">
            ${methodChecklist.map((step) => `<li>${escapeHtml(step)}</li>`).join("\n            ")}
          </ol>
        </div>
      </section>`;
}

function evidenceStack(selectedLabels = []) {
  const sources = selectedLabels.length ? selectedLabels.map(slugSource) : sourcePack.primary_sources.slice(0, 5);
  return `<section class="section evidence-stack" aria-labelledby="evidence-stack">
        <div>
          <div class="section-header"><p class="hero-kicker">EvidenceStack</p><h2 id="evidence-stack">Quellen und Prüfstand.</h2></div>
          <div class="card-grid">
            ${sources
              .map(
                (source) => `<article class="card">
              <p class="card-kicker">${escapeHtml(source.type)} · ${escapeHtml(source.publisher)}</p>
              <h3 class="card-title">${escapeHtml(source.label)}</h3>
              <p class="card-text">${escapeHtml(source.use_for.join(" / "))}</p>
              <p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p>
            </article>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function woekSolutionMatrix(items) {
  return `<section class="section woe-k-solution-matrix" aria-labelledby="woek-solution">
        <div>
          <div class="section-header"><p class="hero-kicker">WÖk-Lösung</p><h2 id="woek-solution">Von Sichtbarkeit zu Rückkopplung.</h2></div>
          <div class="card-grid">
            ${items
              .map((item) => {
                const title = typeof item === "string" ? item : item.title;
                const text = typeof item === "string" ? "" : item.text;
                const textHtml = text ? `\n              <p class="card-text">${escapeHtml(text)}</p>` : "";
                return `<article class="card">
              <p class="card-kicker">Wirkungsökonomische Lösung</p>
              <h3 class="card-title">${escapeHtml(title)}</h3>${textHtml}
            </article>`;
              })
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function internalLinks() {
  return `<section class="section section-soft" aria-labelledby="internal-links">
        <div class="card">
          <p class="card-kicker">Interne Links</p>
          <h2 class="card-title" id="internal-links">Glossar, Narrative und WÖk-Grundlagen.</h2>
          <div class="radar-link-cluster">
            ${glossaryLinks.map(([slug, label]) => `<a href="../../../begriffe/${slug}/" data-glossary-key="${escapeHtml(slug)}">${escapeHtml(label)}</a>`).join("\n            ")}
            <a href="../../narrative/ohnmacht/">Ohnmacht</a>
            <a href="../../narrative/verzoegerung/">Verzögerung</a>
            <a href="../../narrative/scheiternsframe/">Scheiternsframe</a>
            <a href="../../narrative/technikwunder-aufschub/">Technikwunder-Aufschub</a>
            <a href="../../narrative/kontrollverlust/">Kontrollverlust</a>
            <a href="../../narrative/wissenschaftsdelegitimierung/">Wissenschaftsdelegitimierung</a>
            <a href="../../narrative/whataboutism/">Whataboutism</a>
            <a href="../../../werkzeuge/woek-ids/">WÖk-IDs</a>
            <a href="../../../werkzeuge/reverse-merit-order/">Reverse Merit Order</a>
            <a href="../../../werkzeuge/wirkungssteuergesetz/">Wirkungssteuer</a>
            <a href="../../../werkzeuge/wirkungsrat/">Wirkungsrat</a>
            <a href="../../../werkzeuge/t-sroi/">T-SROI</a>
            <a href="../../../begriffe/digitaler-produktpass/">Digitaler Produktpass</a>
          </div>
          <p class="card-text"><strong>Nichtkompensation:</strong> Das kritischste Wirkungsfeld begrenzt die Gesamtbewertung; gute Klimawerte verdecken keine sozialen, ökologischen oder demokratischen Schäden.</p>
        </div>
      </section>`;
}

function renderClaimAnatomy(detail) {
  const anatomy = detail.claimAnatomy;
  return `<section class="section deep-dive-section" id="aussage">
        <div>
          <div class="section-header"><p class="hero-kicker">ClaimAnatomy</p><h2>Aussage zerlegen.</h2></div>
          <div class="deep-dive-definition-grid">
            <article class="card" data-tone="neutral"><p class="card-kicker">Originalaussage</p><h3 class="card-title">${escapeHtml(anatomy.original)}</h3></article>
            <article class="card" data-tone="warning"><p class="card-kicker">Erweiterter Frame</p><h3 class="card-title">${escapeHtml(anatomy.extended)}</h3></article>
            <article class="card" data-tone="positive"><p class="card-kicker">Wahrer Kern</p><p class="card-text">${escapeHtml(anatomy.trueCore)}</p></article>
            <article class="card" data-tone="critical"><p class="card-kicker">Was fehlt?</p><p class="card-text">${escapeHtml(anatomy.missingContext)}</p></article>
            <article class="card deep-dive-wide-card" data-tone="critical"><p class="card-kicker">Falsche Schlussfolgerung</p><h3 class="card-title">${escapeHtml(anatomy.falseConclusion)}</h3></article>
          </div>
        </div>
      </section>`;
}

function renderEvidenceAssessment(detail) {
  const sources = deepDiveSources(detail);
  return `<section class="section section-soft deep-dive-section" id="faktenlage">
        <div>
          <div class="section-header"><p class="hero-kicker">EvidenceAssessment</p><h2>Faktenlage und Unsicherheit.</h2></div>
          ${summaryGrid([
            ["Evidenzstatus", detail.evidence.status, "positive"],
            ["Vertrauensniveau", detail.evidence.level, detail.confidence === "hoch" ? "positive" : "warning"],
            ["Unsicherheit", detail.evidence.uncertainty, "warning"],
          ], "Evidence Assessment", "deep-dive-inline-summary")}
          <div class="card-grid deep-dive-source-mini-grid">
            ${sources
              .map(
                (source) => `<article class="card">
              <p class="card-kicker">${escapeHtml(source.type)}</p>
              <h3 class="card-title">${escapeHtml(source.label)}</h3>
              <p class="card-text">${escapeHtml(source.relevance.join(" / "))}</p>
              <p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p>
            </article>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderWirkungOrders(detail) {
  return `<section class="section deep-dive-section" id="wirkungsordnung">
        <div>
          <div class="section-header"><p class="hero-kicker">WirkungOrders</p><h2>Wirkung erster, zweiter und dritter Ordnung.</h2></div>
          <div class="card-grid three deep-dive-order-grid">
            ${detail.orders
              .map(
                ([label, text], index) => `<article class="card">
              <p class="card-kicker">${String(index + 1).padStart(2, "0")}</p>
              <h3 class="card-title">${escapeHtml(label)}</h3>
              <p class="card-text">${escapeHtml(text)}</p>
            </article>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderFalseActionAnalysis(detail) {
  return `<section class="section section-soft deep-dive-section" id="folgenanalyse">
        <div>
          <div class="section-header"><p class="hero-kicker">FalseActionAnalysis</p><h2>Folgen, wenn man der Aussage folgt.</h2></div>
          <div class="deep-dive-consequence-grid">
            ${detail.falseActions
              .map(
                ([label, text]) => `<article class="card">
              <p class="card-kicker">${escapeHtml(label)}</p>
              <p class="card-text">${escapeHtml(text)}</p>
            </article>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderCreatorExport(claim, detail) {
  const answers = expandedAnswers(claim);
  return `<section class="section deep-dive-section" id="creator-export">
        <div>
          <div class="section-header"><p class="hero-kicker">CreatorExportBox</p><h2>Antworten und Social Hooks.</h2></div>
          <div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.ten_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.thirty_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(answers.two_minutes)}“</p></details>
          </div>
          <div class="card-grid two deep-dive-export-grid">
            <article class="card"><p class="card-kicker">Clip Hook</p><h3 class="card-title">${escapeHtml(detail.clipHook)}</h3></article>
            <article class="card"><p class="card-kicker">Caption</p><p class="card-text">${escapeHtml(detail.caption)}</p></article>
          </div>
        </div>
      </section>`;
}

function renderSourceReliability(detail) {
  const sources = deepDiveSources(detail);
  return `<section class="section section-soft deep-dive-section" id="quellen">
        <div>
          <div class="section-header"><p class="hero-kicker">SourceReliabilityBox</p><h2>Quellen, Reliabilität und Datenstand.</h2></div>
          <div class="card-grid deep-dive-source-grid">
            ${sources
              .map(
                (source) => `<article class="card">
              <p class="card-kicker">${escapeHtml(source.type)}</p>
              <h3 class="card-title">${escapeHtml(source.label)}</h3>
              <p class="card-text"><strong>Geeignet für:</strong> ${escapeHtml(source.relevance.join(" / "))}</p>
              <p><a class="text-link" href="${escapeHtml(source.url)}">Originalquelle öffnen</a></p>
            </article>`
              )
              .join("\n            ")}
          </div>
          ${factStatusBadge()}
        </div>
      </section>`;
}

function renderStandardBox(id, title, text) {
  return `<section class="section section-soft deep-dive-standard-box" id="${escapeHtml(id)}">
        <div class="card">
          <p class="card-kicker">Standardbox</p>
          <h2 class="card-title">${escapeHtml(title)}</h2>
          <p class="card-text">${escapeHtml(text)}</p>
        </div>
      </section>`;
}

function renderDeepDiveDetail(claim) {
  const detail = deepDiveDetailFor(claim);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero deep-dive-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Detail</a> / ${escapeHtml(detail.title)}</nav>
          <p class="hero-kicker">Deep-Dive-Detailseite</p>
          <h1 class="hero-title">${escapeHtml(detail.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(detail.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)}</p>
          <p class="radar-status-line"><span>Status: Detailanalyse</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauen: ${escapeHtml(detail.confidence)}</span><span>Lesezeit: ${escapeHtml(detail.readingTime)}</span></p>
        </div>
      </section>
      ${summaryGrid([
        ["Kurzurteil", claim.summary.judgement, "warning"],
        ["Wahrer Kern", claim.summary.true_core, "neutral"],
        ["Was fehlt?", detail.claimAnatomy.missingContext, "critical"],
        ["Narrativtyp", claim.summary.narrative, "warning"],
        ["Wirkungsrisiko", claim.summary.risk, "critical"],
        ["Leitfrage", detail.leadQuestion, "positive"],
      ], `${claim.title} Detail Summary`, "deep-dive-summary-grid")}
      ${topicSubnav("Detail", "../")}
      <section class="section">
        <div class="radar-detail-layout">
          <nav class="article-toc" aria-label="Inhaltsverzeichnis" data-search-exclude>
            <p>Inhaltsverzeichnis</p>
            <ol>
              <li><a href="#aussage">Aussage</a></li>
              <li><a href="#kurzurteil">Kurzurteil</a></li>
              <li><a href="#was-stimmt">Was stimmt daran?</a></li>
              <li><a href="#was-fehlt">Was fehlt?</a></li>
              <li><a href="#faktenlage">Faktenlage</a></li>
              <li><a href="#wirkstoff">Gesellschaftlicher Wirkstoff</a></li>
              <li><a href="#wirkungspfad">Wirkmechanismus</a></li>
              <li><a href="#wirkungsordnung">Wirkungsordnung</a></li>
              <li><a href="#folgenanalyse">Folgenanalyse</a></li>
              <li><a href="#mpd">Mensch, Planet, Demokratie</a></li>
              <li><a href="#sdg">SDG-/SDG+-Bezug</a></li>
              <li><a href="#woek-loesung">WÖk-Lösung</a></li>
              <li><a href="#creator-export">Creator Export</a></li>
              <li><a href="#quellen">Quellen</a></li>
            </ol>
          </nav>
          <article class="article-body deep-dive-body">
            ${renderClaimAnatomy(detail)}
            <section class="section deep-dive-section deep-dive-text-section" id="kurzurteil"><h2>Kurzurteil</h2><p>${escapeHtml(claim.summary.judgement)} ${escapeHtml(claim.summary.problem)}</p></section>
            <section class="section deep-dive-section deep-dive-text-section" id="was-stimmt"><h2>Was stimmt daran?</h2><p>${escapeHtml(detail.trueText)}</p></section>
            <section class="section deep-dive-section deep-dive-text-section" id="was-fehlt"><h2>Was fehlt?</h2>${htmlList(detail.missingItems)}</section>
            ${renderEvidenceAssessment(detail)}
            ${renderStandardBox("fakten-allein", "Warum Fakten allein nicht reichen", "Die Aussage wirkt nicht nur über ihren Faktenkern, sondern über emotionale Entlastung, Ohnmacht, Scheiternsgefühl oder Technikhoffnung. Deshalb reicht eine Zahl allein nicht: Entscheidend ist, welchen Handlungspfad sie im Publikum aktiviert.")}
            <section class="section deep-dive-section" id="wirkstoff">
              <div class="section-header"><p class="hero-kicker">Gesellschaftlicher Wirkstoff</p><h2>${escapeHtml(detail.wirkstoff.label)}</h2></div>
              <div class="card-grid two">
                <article class="card"><p class="card-kicker">Mechanismus</p><h3 class="card-title">${escapeHtml(detail.wirkstoff.mechanism)}</h3><p class="card-text">${escapeHtml(detail.wirkstoff.description)}</p></article>
                <article class="card"><p class="card-kicker">Resonanzraum</p>${htmlList(detail.wirkstoff.resonance)}</article>
              </div>
            </section>
            <section class="section section-soft deep-dive-section" id="narrativtyp">
              <div>
                <div class="section-header"><p class="hero-kicker">Narrativtyp</p><h2>${escapeHtml(claim.narrativeFamilies.join(" / "))}</h2></div>
                ${summaryGrid([["Botschaft", detail.narrative.message, "warning"], ["Emotion", detail.narrative.emotional, "warning"], ["Politischer Effekt", detail.narrative.political, "critical"]], "Narrativanalyse", "deep-dive-inline-summary")}
              </div>
            </section>
            <section class="section deep-dive-section" id="wirkungspfad">
              <div class="section-header"><p class="hero-kicker">Wirkmechanismus</p><h2>Vom Satz zur Wirkung.</h2></div>
              <ol class="timeline radar-flow radar-effect-path">
                ${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("\n                ")}
              </ol>
            </section>
            ${renderWirkungOrders(detail)}
            ${renderFalseActionAnalysis(detail)}
            <section class="section deep-dive-section" id="mpd">
              <div class="section-header"><p class="hero-kicker">Bewertung nach Mensch, Planet, Demokratie</p><h2>MPD-Wirkungsrisiko.</h2></div>
              ${summaryGrid([["Mensch", claim.mpd.mensch, "warning"], ["Planet", claim.mpd.planet, "warning"], ["Demokratie", claim.mpd.demokratie, "critical"]], `${claim.title} MPD`, "mpd-impact-panel deep-dive-inline-summary")}
            </section>
            <section class="section section-soft deep-dive-section" id="sdg">
              <div>
                <div class="section-header"><p class="hero-kicker">SDG-/SDG+-Bezug</p><h2>Ziele und demokratische Wirkungsqualität.</h2></div>
                ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Nichtkompensation", mapping.wok_mapping.rule, "warning"]], `${claim.title} SDG`, "climate-sdg-panel deep-dive-inline-summary")}
              </div>
            </section>
            <section class="section deep-dive-section" id="woek-loesung">
              <div class="section-header"><p class="hero-kicker">WÖk-Lösung</p><h2>${escapeHtml(detail.solutionLead)}</h2></div>
              ${htmlList(claim.woekSolution)}
            </section>
            ${renderCreatorExport(claim, detail)}
            ${renderStandardBox("nicht-ins-stoeckchen", "Nicht ins Stöckchen springen", claim.dontDo.join(" "))}
            ${renderStandardBox("leitfrage", "Wirkungsökonomische Leitfrage", detail.leadQuestion)}
            ${internalLinks()}
            ${renderSourceReliability(detail)}
          </article>
        </div>
      </section>
    </main>`;
  return pageShell({
    title: `${detail.title.replace(/[„“]/g, "")} | Wirkungsradar Detail | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/detail/${claim.slug}/`,
    base: "../../../",
    main,
  });
}

function renderDetailIndex() {
  const deepDiveClaims = deepDiveSlugs.map((slug) => claims.find((claim) => claim.slug === slug)).filter(Boolean);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Detail</nav>
          <p class="hero-kicker">Wirkungsradar Detail</p>
          <h1 class="hero-title">Detailanalysen für Aussagen mit hoher Wirkung.</h1>
          <p class="hero-subtitle">Deep Dives mit Faktenkern, Narrativanalyse, Wirkmechanismus, MPD-Bewertung und WÖk-Lösung.</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Die Detailseiten sind die Langform zu Wirkungsradar-Livekarten. Sie ordnen nicht nur Fakten, sondern zeigen, welche gesellschaftliche Wirkung eine Aussage auslöst und welche bessere Handlungsfrage daraus folgt.</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Format: Deep Dive</span></p>
        </div>
      </section>
      ${summaryGrid([
        ["Bestehender Deep Dive", "SDGs sind Weltregierung", "neutral"],
        ["Klima & Energie", `${deepDiveClaims.length} neue Detailanalysen`, "positive"],
        ["Methode", "Faktencheck plus Wirkungscheck", "positive"],
        ["Bausteine", "ClaimAnatomy, EvidenceAssessment, WirkungOrders, WÖk-Antwort", "neutral"],
        ["Ziel", "Handlungsfähigkeit statt Stöckchen-Reaktion", "positive"],
        ["Datenstand", UPDATED_AT, "neutral"],
      ], "Detail Index Summary")}
      ${topicSubnav("Detail", "")}
      <section class="section" aria-labelledby="detail-list">
        <div>
          <div class="section-header"><p class="hero-kicker">Detailseiten</p><h2 id="detail-list">Verfügbare Analysen.</h2></div>
          <div class="card-grid">
            <a class="card text-link-card" href="sdgs-sind-weltregierung/"><p class="card-kicker">Internationale Kooperation</p><h3 class="card-title">„Die SDGs sind Weltregierung“</h3><p class="card-text">Kooperationsrahmen, Herrschaftsframe und demokratische Entscheidung.</p></a>
            ${deepDiveClaims
              .map((claim) => {
                const detail = deepDiveDetailFor(claim);
                return `<a class="card text-link-card" href="${escapeHtml(claim.slug)}/">
              <p class="card-kicker">${escapeHtml(detail.subtitle)}</p>
              <h3 class="card-title">${escapeHtml(detail.title)}</h3>
              <p class="card-text">${escapeHtml(detail.leadQuestion)}</p>
            </a>`;
              })
              .join("\n            ")}
          </div>
        </div>
      </section>
    </main>`;
  return pageShell({
    title: "Wirkungsradar Detailanalysen | Wirkungsökonomie",
    description: "Detailanalysen im Wirkungsradar mit Faktenkern, Narrativanalyse, Wirkmechanismus, MPD-Bewertung und wirkungsökonomischer Lösung.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/detail/",
    base: "../../",
    main,
  });
}

function claimIndex() {
  return `<section class="section" id="claim-index" aria-labelledby="claim-index-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">ClaimIndex</p>
            <h2 id="claim-index-title">Live-Karten Klima &amp; Energie.</h2>
          </div>
          <form class="climate-claim-toolbar" data-search-exclude>
            <label><span class="sr-only">Claims suchen</span><input type="search" placeholder="Aussage, Narrativ oder Thema suchen" data-climate-search></label>
            <label><span class="sr-only">Risiko filtern</span><select data-climate-risk><option value="">Risiko: alle</option><option value="mittel">mittel</option><option value="hoch">hoch</option></select></label>
            <label><span class="sr-only">Thema filtern</span><select data-climate-theme><option value="">Thema: alle</option>${Array.from(new Set(claims.flatMap((claim) => claim.themes))).map((theme) => `<option value="${escapeHtml(theme.toLowerCase())}">${escapeHtml(theme)}</option>`).join("")}</select></label>
          </form>
          <p class="narrative-library-count" data-climate-count>${claims.length} Karten</p>
          <div class="card-grid climate-claim-grid" data-climate-grid>
            ${claims
              .map(
                (claim) => `<a class="card text-link-card climate-claim-card" href="../../live/${claim.slug}/" data-risk="${escapeHtml(claim.riskLevel)}" data-theme="${escapeHtml(claim.themes.map((theme) => theme.toLowerCase()).join(" "))}" data-search="${escapeHtml([claim.title, claim.shortJudgement, claim.narrativeFamilies.join(" "), claim.themes.join(" "), claim.sdgs.join(" "), claim.sdgPlus.join(" ")].join(" ").toLowerCase())}">
              <p class="card-kicker">${escapeHtml(claim.shortJudgement)}</p>
              <h3 class="card-title">${escapeHtml(claim.title)}</h3>
              <p class="card-text">${escapeHtml(claim.narrativeFamilies.join(" / "))}</p>
              <p class="narrative-pill-row"><span data-risk="${escapeHtml(claim.riskLevel)}">Risiko: ${escapeHtml(claim.riskLevel)}</span><span>${escapeHtml(claim.sdgs.join(" / "))}</span></p>
            </a>`
              )
              .join("\n            ")}
          </div>
          <p class="narrative-library-empty" data-climate-empty hidden>Keine Karten für diese Filter.</p>
        </div>
      </section>
      <script>
        (() => {
          const cards = Array.from(document.querySelectorAll("[data-climate-grid] [data-search]"));
          const search = document.querySelector("[data-climate-search]");
          const risk = document.querySelector("[data-climate-risk]");
          const theme = document.querySelector("[data-climate-theme]");
          const count = document.querySelector("[data-climate-count]");
          const empty = document.querySelector("[data-climate-empty]");
          const norm = (value) => String(value || "").trim().toLowerCase();
          const update = () => {
            const q = norm(search?.value);
            const selectedRisk = norm(risk?.value);
            const selectedTheme = norm(theme?.value);
            let visible = 0;
            cards.forEach((card) => {
              const match = (!q || card.dataset.search.includes(q)) &&
                (!selectedRisk || norm(card.dataset.risk) === selectedRisk) &&
                (!selectedTheme || String(card.dataset.theme || "").split(/\\s+/).includes(selectedTheme));
              card.hidden = !match;
              if (match) visible += 1;
            });
            if (count) count.textContent = visible === 1 ? "1 Karte" : visible + " Karten";
            if (empty) empty.hidden = visible !== 0;
          };
          [search, risk, theme].forEach((control) => control?.addEventListener("input", update));
          update();
        })();
      </script>`;
}

function debateMap() {
  const clusters = ["Klimawandel", "Energiewende", "Mobilität & Batterien", "Kernenergie & Fusion", "Industrie & Wohlstand"];
  return `<section class="section debate-map" aria-labelledby="debate-map">
        <div>
          <div class="section-header"><p class="hero-kicker">DebateMap</p><h2 id="debate-map">Debattenlandschaft Klima &amp; Energie.</h2></div>
          <div class="climate-debate-map">
            <div class="climate-debate-center">Klima &amp; Energie</div>
            ${clusters.map((cluster) => `<div class="climate-debate-node">${escapeHtml(cluster)}</div>`).join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderThemesIndex() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Themen</nav>
          <p class="hero-kicker">Themencluster</p>
          <h1 class="hero-title">Von einzelnen Stöckchen zu Wirkungsfeldern.</h1>
          <p class="hero-subtitle">Die Themenübersicht bündelt Aussagen nach Demokratie, Medien, Klima, Energie, Wirtschaft und gesellschaftlichem Zusammenhalt.</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Die Themenübersicht verbindet einzelne Aussagen mit größeren Wirkungsfeldern. Dadurch wird sichtbar, ob ein Stöckchen nur eine isolierte Behauptung ist oder Teil eines wiederkehrenden Musters. Der erste ausgebaute Themenraum ist Klima &amp; Energie.</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauensniveau: hoch</span></p>
        </div>
      </section>
      ${summaryGrid([
        ["Demokratie", "Sagbarkeits-, Institutionen- und Medienframes.", "neutral"],
        ["Klima & Energie", "Ohnmacht, Verzögerung, Scheiternsframes und Freiheitsangst.", "critical"],
        ["Wissenschaft", "Delegitimierung, Scheinkausalität und selektive Evidenz.", "warning"],
        ["Kooperation", "Agenda, SDGs, Souveränität und Herrschaftsnarrative.", "warning"],
        ["Technik", "Rohstoffangst, Technikwunder und Zeitpfad-Fragen.", "neutral"],
        ["Antwort", "Vom Einzelframe zur besseren Handlungsfrage.", "positive"],
      ], "Themen Summary")}
      ${topicSubnav("Themen", "")}
      <section class="section">
        <div>
          <div class="section-header"><p class="hero-kicker">Cluster</p><h2>Erste Ordnung der Kartensammlung.</h2></div>
          <div class="card-grid">
            <a class="card text-link-card" href="klima-energie/"><p class="card-kicker">Klima &amp; Energie</p><h3 class="card-title">Mythen, Narrative, Fakten und Wirkungspfade</h3><p class="card-text">Klimawandel, Energiewende, Mobilität, Batterien, Kernenergie, Fusion und Industrie.</p></a>
            <article class="card"><p class="card-kicker">Demokratie und Medien</p><h3 class="card-title">Sagbarkeits-, Medien- und Institutionenframes</h3><p class="card-text">„Man darf ja nichts mehr sagen“, Medienfeindbild und Institutionenmisstrauen.</p></article>
            <article class="card"><p class="card-kicker">Internationale Kooperation</p><h3 class="card-title">Agenda, SDGs und Souveränität</h3><p class="card-text">Kooperationsrahmen werden als Herrschaftsnarrative gedeutet.</p></article>
          </div>
        </div>
      </section>
    </main>`;
  return pageShell({
    title: "Wirkungsradar Themen | Wirkungsökonomie",
    description: "Thematische Einstiege in den Wirkungsradar: Demokratie, Medien, Klima, Energie, Wirtschaft, Migration und internationale Kooperation.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/themen/",
    base: "../../",
    main,
  });
}

function renderClusterPage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Themen</a> / Klima &amp; Energie</nav>
          <p class="hero-kicker">Themencluster</p>
          <h1 class="hero-title">Klima &amp; Energie</h1>
          <p class="hero-subtitle">Mythen, Narrative, Fakten und Wirkungspfade</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Klima- und Energiedebatten sind selten reine Faktendebatten. Viele Aussagen enthalten einen wahren Kern, werden aber durch Narrative zu falschen Schlussfolgerungen: Ohnmacht, Verzögerung, Kontrollverlust, Verbotsangst, Technikwunder-Aufschub oder Scheiternsframes. Dieser Themencluster prüft zentrale Aussagen zu Klimawandel, Energiewende, Elektromobilität, Windkraft, Batterien, Kernenergie, Fusion und Industrie. Jede Aussage wird wirkungsökonomisch analysiert: Was stimmt? Was fehlt? Welcher gesellschaftliche Wirkstoff wird aktiviert? Welche Folgen hätte falsches Handeln? Und welche Lösung erzeugt positive Netto-Wirkung für Mensch, Planet und Demokratie?</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauen: hoch</span></p>
        </div>
      </section>
      ${summaryGrid(clusterSummary, "Klima & Energie Summary")}
      ${methodBox()}
      ${topicSubnav("Themen", "../")}
      ${debateMap()}
      ${claimIndex()}
      ${evidenceStack()}
      ${woekSolutionMatrix(["Wirkungssteuer: schädliche Wirkung wird teurer, positive Wirkung günstiger.", "T-SROI: Folgekosten und Nutzen werden in öffentliche Investitionsentscheidungen integriert.", "Reverse Merit Order: das kritischste Wirkungsfeld begrenzt die Gesamtbewertung.", "Soziale Abfederung und Beteiligung sichern demokratische Akzeptanz."])}
      ${factStatusBadge()}
    </main>`;
  return pageShell({
    title: "Klima & Energie – Wirkungsradar",
    description: "Mythen, Narrative, Fakten und Wirkungspfade zu Klimawandel, Energiewende, Windkraft, E-Mobilität, Batterien, Kernenergie, Fusion und Industrie.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/themen/klima-energie/",
    base: "../../../",
    main,
  });
}

function renderSubtopic(topic) {
  const topicClaims = topic.claims.map((slug) => claims.find((claim) => claim.slug === slug)).filter(Boolean);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../../index.html">Start</a> / <a href="../../../">Wirkungsradar</a> / <a href="../../">Themen</a> / <a href="../">Klima &amp; Energie</a> / ${escapeHtml(topic.title)}</nav>
          <p class="hero-kicker">Thema</p>
          <h1 class="hero-title">${escapeHtml(topic.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(topic.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(topic.abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauen: hoch</span></p>
        </div>
      </section>
      ${summaryGrid(topic.summary, `${topic.title} Summary`)}
      ${methodBox()}
      ${topicSubnav("Themen", "../../")}
      <section class="section" aria-labelledby="topic-claims">
        <div>
          <div class="section-header"><p class="hero-kicker">Live-Karten</p><h2 id="topic-claims">Aussagen in diesem Thema.</h2></div>
          <div class="card-grid">
            ${topicClaims.map((claim) => `<a class="card text-link-card" href="../../../live/${claim.slug}/"><p class="card-kicker">${escapeHtml(claim.shortJudgement)}</p><h3 class="card-title">${escapeHtml(claim.title)}</h3><p class="card-text">${escapeHtml(claim.narrativeFamilies.join(" / "))}</p></a>`).join("\n            ")}
          </div>
        </div>
      </section>
      ${evidenceStack(topicClaims.flatMap((claim) => claim.sources || []).slice(0, 5))}
      ${woekSolutionMatrix(["Wirkung sichtbar machen.", "Engpasslogik statt Durchschnittslogik anwenden.", "Wirkung in Preise, Beschaffung, Kapitalzugang und öffentliche Entscheidungen rückkoppeln."])}
      ${factStatusBadge()}
    </main>`;
  return pageShell({
    title: `${topic.title} – Klima & Energie – Wirkungsradar`,
    description: sentence(topic.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/themen/klima-energie/${topic.slug}/`,
    base: "../../../../",
    main,
  });
}

function renderGermanyTwoPercentDossier(claim) {
  const answers = expandedAnswers(claim);
  const dossier = claim.dossier;
  const summaryItems = [
    ["Kurzurteil", claim.summary.judgement, "warning"],
    ["Wahrer Kern", claim.summary.true_core, "neutral"],
    ["Problem", claim.summary.problem, "critical"],
    ["Fehlende Ebenen", dossier.missingLayers, "critical"],
    ["Narrativ", claim.summary.narrative, "warning"],
    ["Live-Antwort", claim.summary.host_answer, "positive"],
  ];
  const sourceCards = claim.sources.map((label) => germanyTwoPercentSourceCard(label));
  const understandingSections = [
    {
      kicker: "2.1 Territorial",
      title: "Territorial ist nicht falsch - aber eng.",
      text:
        "Territoriale Emissionen messen, was innerhalb der Landesgrenzen entsteht. Diese Bilanz ist wichtig für nationale Klimaziele, aber sie ist nicht identisch mit Verantwortung. Der enge Territorialanteil zeigt einen Ausschnitt, nicht die globale Wirkung deutscher Nachfrage, Produkte, Lieferketten, Kapitalflüsse oder Standards.",
    },
    {
      kicker: "2.2 Konsum",
      title: "Was wir nachfragen, wirkt auch im Ausland.",
      text:
        "Wenn Deutschland Produkte importiert, entstehen Teile der Emissionen im Ausland. Territorial werden sie dort gezählt. Wirkungsökonomisch gehören sie zugleich zur Nachfrage- und Konsumverantwortung Deutschlands: Emissionen verschwinden nicht, wenn sie aus der Territorialbilanz fallen.",
    },
    {
      kicker: "2.3 Lieferkette",
      title: "Ausgelagerte Produktion ist keine ausgelagerte Wirkung.",
      text:
        "Wenn Produktion ins Ausland verlagert wird, sinkt möglicherweise die deutsche Inlandsbilanz. Die Wirkung bleibt real: Energie, Rohstoffe, Wasser, Arbeitsbedingungen, Transport und Emissionen entstehen weiter - nur an einem anderen Ort. Wirkungsökonomischer Satz: Ausgelagerte Produktion ist keine ausgelagerte Verantwortung.",
    },
    {
      kicker: "2.4 Scope 3",
      title: "Die Wirkung endet nicht am Werkstor.",
      text:
        "Scope 3 ist keine nationale Klimabilanz, sondern eine Unternehmens- und Wertschöpfungskettenbilanz. Genau deshalb ist sie wirkungsökonomisch wichtig: Exportierte Fahrzeuge, Maschinen, Anlagen und energieverbrauchende Produkte können über Jahre Nutzungsemissionen außerhalb Deutschlands verursachen.",
    },
    {
      kicker: "2.5 Historisch",
      title: "Jahresanteil ist nicht kumulative Klimawirkung.",
      text:
        "Die 2-%-Behauptung betrachtet meist ein einzelnes Jahr. Klimawirkung entsteht aber kumulativ, weil CO₂ lange in der Atmosphäre bleibt. Die historische Perspektive beantwortet deshalb eine andere Verantwortungsfrage als der aktuelle Jahresanteil. Wirkungsökonomischer Satz: Jahresanteil ist nicht kumulative Klimawirkung.",
    },
    {
      kicker: "2.6 Transformativ",
      title: "Deutschland ist nicht nur Emittent, sondern Pfadsetzer.",
      text:
        "Deutschland wirkt als Industrieland, Exportland, EU-Mitglied, Normsetzer, Maschinenbau-, Chemie- und Automobilland, Kapitalstandort, Beschaffungsmarkt und Technologieanbieter. Produktstandards, Exporttechnologien, Investitionen, öffentliche Beschaffung und EU-Regeln beeinflussen globale Pfade.",
    },
  ];
  const differentiatedBalanceItems = [
    ["Territorial", "Was entsteht im Inland?"],
    ["Konsum", "Was verursacht unsere Nachfrage?"],
    ["Lieferkette", "Was steckt in Vorprodukten?"],
    ["Scope 3", "Was bewirken verkaufte Produkte?"],
    ["Historisch", "Was wurde kumulativ verursacht?"],
    ["Transformativ", "Welche Pfade und Standards setzen wir?"],
  ];
  const falseActionItems = [
    ["Politik", "Klimapolitik wird als symbolisch oder nutzlos gerahmt."],
    ["Industrie", "Produktdesign, Lieferketten, Antriebswende und Maschinenwirkung werden zu langsam umgestellt."],
    ["Konsum", "Importierte Produktionswirkung bleibt unsichtbar."],
    ["Kapital", "Investitionen fließen weiter in Geschäftsmodelle mit ausgelagerter Wirkung."],
    ["Demokratie", "Ohnmacht und Zynismus wachsen: Wir können sowieso nichts ändern."],
    ["Planet", "Emissionen sinken langsamer, weil Verantwortung an Bilanzgrenzen verschwindet."],
  ];
  const woekDossierSolutions = [
    { title: "Territoriale Emissionen senken", text: "Deutschland muss seine Inlandsemissionen weiter senken: Energie, Gebäude, Verkehr, Industrie und Landwirtschaft." },
    { title: "Konsumemissionen sichtbar machen", text: "Konsum- und Importfußabdrücke müssen neben der Territorialbilanz öffentlich sichtbar werden." },
    { title: "Lieferkettenwirkung erfassen", text: "Rohstoffe, Vorprodukte, Energie, Wasser, Arbeit, Transport und Datenqualität werden über Scorecards und WÖk-IDs abgebildet." },
    { title: "Scope-3-Produktnutzung einbeziehen", text: "Fahrzeuge, Maschinen, Anlagen, Chemieprodukte und energieverbrauchende Geräte werden nach Nutzungsemissionen über den Lebenszyklus bewertet." },
    { title: "Digitale Produktpässe nutzen", text: "Der digitale Produktpass wird zum Produktgedächtnis: Herkunft, Materialien, Lieferketten, Nutzung, Reparierbarkeit, Recycling und Wirkungsdaten werden maschinenlesbar." },
    { title: "Reverse Merit Order anwenden", text: "Gute Werte in einem Feld dürfen schwere negative Wirkungen in anderen Feldern nicht verdecken." },
    { title: "Wirkungssteuer und Beschaffung koppeln", text: "Produkte mit negativer Netto-Wirkung werden teurer, Produkte mit positiver Netto-Wirkung günstiger; öffentliche Beschaffung folgt Wirkung." },
    { title: "Verantwortung operationalisieren", text: "Nicht Schuld moralisch verteilen, sondern Wirkung sichtbar machen und in Preise, Steuern, Kapital, Standards und Produktdesign zurückführen." },
  ];
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero dossier-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Live</a> / Deutschland nur 2 %</nav>
          <p class="hero-kicker">Wirkungsradar Dossier</p>
          <h1 class="hero-title">${escapeHtml(claim.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(claim.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)}</p>
          <p class="radar-status-line"><span>Status: Dossier</span><span>Datenstand: ${UPDATED_AT}</span><span>Faktenstatus: datenbasiert</span></p>
        </div>
      </section>
      ${summaryGrid(summaryItems, `${claim.title} Summary`, "dossier-summary-grid")}
      ${deepDiveLiveLink(claim)}
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude>
        <a href="#host-antworten">Live antworten</a>
        <a href="#verantwortung-verstehen">Verantwortung verstehen</a>
        <a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a>
      </nav>
      <section class="section dossier-tab-panel" id="host-antworten">
        <div>
          <div class="section-header"><p class="hero-kicker">Live antworten</p><h2>Kurz reagieren, ohne den Frame zu übernehmen.</h2></div>
          <div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.ten_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.thirty_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(answers.two_minutes)}“</p></details>
          </div>
          <div class="card-grid two dossier-live-support">
            <article class="card"><p class="card-kicker">Frame sichtbar machen</p><h3 class="card-title">Erst die Bilanzgrenze klären.</h3><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Frame. Der Frame lautet: Ein enger Territorialanteil sei gleichbedeutend mit geringer Verantwortung. Genau diese Gleichsetzung ist falsch.</p></article>
            <article class="card"><p class="card-kicker">Gute Rückfrage</p><h3 class="card-title">Zur Wirkungsfrage zurück.</h3><p class="card-text">Meinst du territoriale Jahresemissionen - oder meinst du Verantwortung über Konsum, Lieferketten, Produkte, Exporte und historische Wirkung?</p></article>
          </div>
          <div class="card dossier-dont-card">
            <p class="card-kicker">Nicht ins Stöckchen springen</p>
            <h3 class="card-title">Was man nicht tun sollte.</h3>
            <ul class="clean-list">${claim.dontDo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        </div>
      </section>
      <section class="section section-soft dossier-tab-panel" id="verantwortung-verstehen">
        <div>
          <div class="section-header"><p class="hero-kicker">Verantwortung verstehen</p><h2>Territorialer Anteil ist nicht Gesamtverantwortung.</h2></div>
          <article class="card dossier-thesis-card">
            <p class="card-kicker">Zentrale These</p>
            <h3 class="card-title">Verantwortungsverkürzung erkennen.</h3>
            <p class="card-text">${escapeHtml(dossier.thesis)}</p>
            <p class="card-text"><a class="text-link" href="../../../begriffe/verantwortungsverkuerzung/" data-glossary-key="verantwortungsverkuerzung"><strong>Verantwortungsverkürzung</strong></a>: Eine enge Bilanzgrenze wird benutzt, um größere Wirkungszusammenhänge unsichtbar zu machen.</p>
            <p class="card-text">Verantwortungsverkürzung liegt vor, wenn eine enge Bilanzgrenze benutzt wird, um größere Wirkungszusammenhänge unsichtbar zu machen.</p>
            <p class="card-text">Wirkungsökonomisch entsteht Verantwortung dort, wo Entscheidungen, Produkte, Lieferketten, Kapital, Regeln oder Technologien Zustände verändern - direkt, indirekt, verzögert oder systemisch. Die WÖk unterscheidet dafür Wirkung, Netto-Wirkung und Transformationswirkung.</p>
          </article>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Aussagenvarianten</p><h3 class="card-title">So taucht der Frame auf.</h3><ul class="clean-list">${dossier.variants.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
            <article class="card"><p class="card-kicker">Bilanzgrenzen</p><h3 class="card-title">Nicht addieren, aber sichtbar machen.</h3><p class="card-text">${escapeHtml(dossier.boundaryNote)}</p></article>
          </div>
          <div class="dossier-matrix-wrap">
            <table class="dossier-matrix">
              <caption>Sechs Ebenen deutscher Klimaverantwortung</caption>
              <thead><tr><th>Ebene</th><th>Frage</th><th>Beispiel</th><th>Was der 2-%-Zahlenframe ausblendet</th></tr></thead>
              <tbody>
                ${dossier.responsibilityMatrix.map(([level, question, example, blindSpot]) => `<tr><th scope="row">${escapeHtml(level)}</th><td>${escapeHtml(question)}</td><td>${escapeHtml(example)}</td><td>${escapeHtml(blindSpot)}</td></tr>`).join("\n                ")}
              </tbody>
            </table>
          </div>
          <div class="card-grid two dossier-understanding-grid">
            ${understandingSections.map((section) => `<article class="card">
              <p class="card-kicker">${escapeHtml(section.kicker)}</p>
              <h3 class="card-title">${escapeHtml(section.title)}</h3>
              <p class="card-text">${escapeHtml(section.text)}</p>
            </article>`).join("\n            ")}
          </div>
          <article class="card dossier-boundary-card">
            <p class="card-kicker">Nicht addieren, sondern differenzieren</p>
            <h3 class="card-title">Unterschiedliche Verantwortungsbilanzen dürfen nicht einfach addiert werden.</h3>
            <p class="card-text">Territoriale Emissionen, Konsumemissionen, Unternehmens-Scope-3-Emissionen und historische Emissionen sind verschiedene Bilanzierungslogiken. Man darf sie nicht zu einer einzigen Zahl zusammenwerfen. Aber man muss sie nebeneinander sichtbar machen, weil sie unterschiedliche Verantwortungsfragen beantworten.</p>
            <div class="radar-link-cluster">${differentiatedBalanceItems.map(([label, text]) => `<span><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</span>`).join("\n              ")}</div>
          </article>
          <div class="section-header dossier-subheader"><p class="hero-kicker">Wirkungslogik</p><h2>Von der Zahl zur Wirkungsblindheit.</h2></div>
          <ol class="timeline radar-flow radar-effect-path dossier-effect-path">
            ${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("\n            ")}
          </ol>
        </div>
      </section>
      <section class="section dossier-tab-panel" id="deep-dive-quellen">
        <div>
          <div class="section-header"><p class="hero-kicker">Deep Dive &amp; Quellen</p><h2>Datenlogik, Folgen und Rückkopplung.</h2></div>
          <div class="card-grid dossier-fact-grid">
            ${dossier.dataFacts.map(([label, text]) => `<article class="card"><p class="card-kicker">${escapeHtml(label)}</p><h3 class="card-title">${escapeHtml(text)}</h3></article>`).join("\n            ")}
          </div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Faktenlage</p><h3 class="card-title">Was prüfbar ist.</h3><ul class="clean-list">${claim.facts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
            <article class="card"><p class="card-kicker">Wirkstoffanalyse</p><h3 class="card-title">Territoriale Zahl als Verantwortungsverkürzer.</h3><p class="card-text">Eine enge territoriale Kennzahl wird als scheinbar vollständiger Verantwortungsbeweis benutzt. Die Aussage verschiebt Aufmerksamkeit von Wirkungsketten auf Landesgrenzen.</p><ul class="clean-list"><li>Konsumemissionen</li><li>ausgelagerte Produktion</li><li>importierte Vorprodukte</li><li>Scope 3 / Use of Sold Products</li><li>exportierte Produktnutzung</li><li>historische Emissionen</li><li>Technologie-, Kapital- und Beschaffungshebel</li></ul></article>
          </div>
          <article class="card dossier-thesis-card">
            <p class="card-kicker">Narrativanalyse</p>
            <h3 class="card-title">Ohnmachtsnarrativ / Verantwortungsverkürzung / Verzögerungsframe.</h3>
            <p class="card-text">Typische Botschaft: Wir sind zu klein, also müssen wir nicht handeln. Die emotionale Funktion ist Entlastung, Veränderungsvermeidung und Kostenabwehr; politisch wirkt die Transformation dadurch überzogen, nutzlos oder unfair.</p>
            <p class="card-text">Nebenmuster sind Whataboutism und Territorialframe: Der Blick wird auf Landesgrenzen verengt, während Konsum, Lieferketten, Scope 3, historische Wirkung sowie Technologie- und Kapitalhebel aus der Debatte verschwinden.</p>
          </article>
          <section class="section section-soft dossier-false-action" aria-labelledby="false-action">
            <div>
              <div class="section-header"><p class="hero-kicker">Folgen falschen Handelns</p><h2 id="false-action">Was wahrscheinlicher wird.</h2></div>
              <div class="card-grid">${falseActionItems.map(([dimension, consequence]) => `<article class="card"><p class="card-kicker">${escapeHtml(dimension)}</p><h3 class="card-title">${escapeHtml(consequence)}</h3></article>`).join("\n                ")}</div>
            </div>
          </section>
          <article class="card dossier-thesis-card">
            <p class="card-kicker">Wirkungsökonomische Antwort</p>
            <h3 class="card-title">Aus der 2-%-Behauptung folgt nicht Rückzug, sondern präzisere Bilanzierung und bessere Rückkopplung.</h3>
            <p class="card-text">Die Reverse Merit Order schützt vor Schönrechnen: Negative Wirkung in einem kritischen Feld kann nicht durch positive Werte an anderer Stelle verdeckt werden. Sie wirkt als Firewall gegen Greenwashing, Wirkungsverwässerung und Machtverzerrung.</p>
          </article>
          ${woekSolutionMatrix(woekDossierSolutions)}
          ${summaryGrid([["Mensch", claim.mpd.mensch, "warning"], ["Planet", claim.mpd.planet, "warning"], ["Demokratie", claim.mpd.demokratie, "critical"]], `${claim.title} MPD`, "mpd-impact-panel")}
          ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Wirkungsrisiko", claim.riskLevel, "critical"]], `${claim.title} SDG`, "climate-sdg-panel")}
          <section class="dossier-source-section" aria-labelledby="dossier-sources">
            <div class="section-header"><p class="hero-kicker">Quellenkarten</p><h2 id="dossier-sources">Welche Quelle welche Frage beantwortet.</h2></div>
            <div class="card-grid">
              ${sourceCards.map((source) => `<article class="card">
                <p class="card-kicker">${escapeHtml(source.type)} · ${escapeHtml(source.publisher)}</p>
                <h3 class="card-title">${escapeHtml(source.title)}</h3>
                <p class="card-text"><strong>Zeigt:</strong> ${escapeHtml(source.shows)}</p>
                <p class="card-text"><strong>Nutzen:</strong> ${escapeHtml(source.use_for)}</p>
                <p class="card-text"><strong>Warnung:</strong> ${escapeHtml(source.warning)}</p>
                <p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p>
              </article>`).join("\n              ")}
              <article class="card">
                <p class="card-kicker">WÖk intern</p>
                <h3 class="card-title">Lieferketten, Produktwirkung, WÖk-IDs, Reverse Merit Order und Wirkungssteuer</h3>
                <p class="card-text">Die WÖk-Logik übersetzt sichtbare Wirkung in Scorecards, digitale Produktpässe, Beschaffung, Kapitalzugang, Preise und Steuerung.</p>
                <p><a class="text-link" href="../../../werkzeuge/">WÖk-Werkzeuge öffnen</a></p>
              </article>
            </div>
          </section>
          ${internalLinks()}
          ${factStatusBadge()}
        </div>
      </section>
    </main>`;
  return pageShell({
    title: "Deutschland nur 2 %? Warum diese Zahl Verantwortung verkürzt | Wirkungsökonomie",
    description: sentence(claim.abstract),
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/live/deutschland-nur-zwei-prozent/",
    base: "../../../",
    main,
  });
}

function renderLiveCard(claim) {
  if (claim.slug === "deutschland-nur-zwei-prozent") return renderGermanyTwoPercentDossier(claim);
  const sources = claim.sources.map(slugSource);
  const answers = expandedAnswers(claim);
  const detailLink = deepDiveLiveLink(claim);
  const summaryItems = [
    ["Kurzurteil", claim.summary.judgement, claim.riskLevel === "hoch" ? "warning" : "neutral"],
    ["Wahrer Kern", claim.summary.true_core, "neutral"],
    ["Problem", claim.summary.problem, "critical"],
    ["Narrativ", claim.summary.narrative, "warning"],
    ["Wirkungsrisiko", claim.summary.risk, "critical"],
    ["Live-Antwort", claim.summary.host_answer, "positive"],
  ];
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Live</a> / ${escapeHtml(claim.title)}</nav>
          <p class="hero-kicker">Wirkungsradar Live</p>
          <h1 class="hero-title">${escapeHtml(claim.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(claim.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Faktenstatus: datenbasiert</span></p>
        </div>
      </section>
      ${summaryGrid(summaryItems, `${claim.title} Summary`)}${detailLink ? `\n      ${detailLink}` : ""}
      <section class="section" id="host-antworten">
        <div>
          <div class="section-header"><p class="hero-kicker">Host-Antworten</p><h2>10 Sekunden, 30 Sekunden, 2 Minuten.</h2></div>
          <div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.ten_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.thirty_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(answers.two_minutes)}“</p></details>
          </div>
        </div>
      </section>
      <section class="section section-soft">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Frame sichtbar machen</p><h2 class="card-title">Nicht hineinspringen.</h2><p class="card-text">${escapeHtml(frameResponses[claim.frameKey] || frameResponses.verzoegerung)}</p></article>
          <article class="card"><p class="card-kicker">Gute Rückfrage</p><h2 class="card-title">Zur Wirkung zurück.</h2><p class="card-text">${escapeHtml(claim.redirectQuestion)}</p></article>
        </div>
      </section>
      <section class="section section-soft">
        <div class="card">
          <p class="card-kicker">Nicht ins Stöckchen springen</p>
          <h2 class="card-title">Was man nicht tun sollte.</h2>
          <ul class="clean-list">${claim.dontDo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </section>
      <section class="section">
        <div>
          <div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Von Aussage zu möglicher Folge.</h2></div>
          <ol class="timeline radar-flow radar-effect-path">
            ${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("\n            ")}
          </ol>
        </div>
      </section>
      <section class="section">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Faktenlage</p><h2 class="card-title">Was prüfbar ist.</h2><ul class="clean-list">${claim.facts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
          <article class="card"><p class="card-kicker">Folgen falschen Handelns</p><h2 class="card-title">Was wahrscheinlicher wird.</h2><ul class="clean-list">${claim.consequences.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
        </div>
      </section>
      ${woekSolutionMatrix(claim.woekSolution)}
      ${summaryGrid([["Mensch", claim.mpd.mensch, "warning"], ["Planet", claim.mpd.planet, "warning"], ["Demokratie", claim.mpd.demokratie, "critical"]], `${claim.title} MPD`, "mpd-impact-panel")}
      ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Wirkungsrisiko", claim.riskLevel, claim.riskLevel === "hoch" ? "critical" : "warning"]], `${claim.title} SDG`, "climate-sdg-panel")}
      ${internalLinks()}
      ${evidenceStack(claim.sources)}
      ${factStatusBadge()}
    </main>`;
  return pageShell({
    title: `${claim.title.replace(/[„“]/g, "")} - Wirkungsradar Live | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/live/${claim.slug}/`,
    base: "../../../",
    main,
  });
}

function dataModel() {
  return {
    version: "0.1",
    last_updated: UPDATED_AT,
    type: "climate_energy_cluster",
    source_pack: sourcePack.id,
    fact_status: factStatus,
    frame_responses: frameResponses,
    subtopics,
    claims: claims.map((claim) => ({
      title: claim.title,
      slug: claim.slug,
      shortJudgement: claim.shortJudgement,
      narrativeFamilies: claim.narrativeFamilies,
      riskLevel: claim.riskLevel,
      themes: claim.themes,
      sdgs: claim.sdgs,
      sdgPlus: claim.sdgPlus,
      summary: claim.summary,
      answers: expandedAnswers(claim),
      effect_path: claim.effectPath.map(([label, description]) => ({ label, description })),
      woek_solution: claim.woekSolution,
      sources: claim.sources,
    })),
  };
}

writeFile("content/wirkungsradar/source-packs/climate-energy-v1.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(sourcePack).trim()}\n`);
writeFile("content/wirkungsradar/source-packs/deep-dive-climate-energy-v1.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(deepDiveSourcePack).trim()}\n`);
writeFile("content/wirkungsradar/climate-energy-mapping.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(mapping).trim()}\n`);
writeFile("content/wirkungsradar/climate-energy.yml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(dataModel()).trim()}\n`);
writeFile("wirkungsradar/detail/index.html", renderDetailIndex());
writeFile("wirkungsradar/themen/index.html", renderThemesIndex());
writeFile("wirkungsradar/themen/klima-energie/index.html", renderClusterPage());
for (const topic of subtopics) {
  writeFile(`wirkungsradar/themen/klima-energie/${topic.slug}/index.html`, renderSubtopic(topic));
}
for (const claim of claims) {
  writeFile(`wirkungsradar/live/${claim.slug}/index.html`, renderLiveCard(claim));
}
for (const slug of deepDiveSlugs) {
  const claim = claims.find((item) => item.slug === slug);
  if (claim) writeFile(`wirkungsradar/detail/${claim.slug}/index.html`, renderDeepDiveDetail(claim));
}

console.log(`Built climate-energy cluster: ${subtopics.length} subtopics, ${claims.length} live cards, ${deepDiveSlugs.length} deep dives.`);
