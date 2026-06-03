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
    title: "„Deutschland ist nur für 2 % verantwortlich“",
    slug: "deutschland-nur-zwei-prozent",
    shortJudgement: "Wahrer Kern, falsche Schlussfolgerung.",
    narrativeFamilies: ["Ohnmacht", "Verzögerung", "Whataboutism"],
    riskLevel: "hoch",
    themes: ["Klimawandel", "Politik", "Industrie"],
    sdgs: ["SDG 7", "SDG 9", "SDG 12", "SDG 13"],
    sdgPlus: ["Handlungsfähigkeit", "institutionelles Vertrauen"],
    subtitle: "Wahrer Kern, falsche Schlussfolgerung",
    abstract:
      "Die Aussage enthält einen wahren Kern: Deutschland ist nicht der größte aktuelle Emittent der Welt, und Klimaschutz braucht internationale Kooperation. Irreführend wird sie, wenn daraus folgt, deutsches Handeln sei wirkungslos. Wirkungsökonomisch verwechselt die Aussage Anteil mit Hebelwirkung. Ein Land wirkt nicht nur über direkte Emissionen, sondern auch über Technologie, Industrie, Standards, Lieferketten, Kapitalflüsse, EU-Politik und internationale Glaubwürdigkeit.",
    summary: {
      judgement: "Wahrer Kern, falsche Schlussfolgerung.",
      true_core: "Deutschland ist nicht der größte aktuelle Emittent.",
      problem: "Aus kleinerem Anteil wird Wirkungslosigkeit abgeleitet.",
      narrative: "Ohnmacht / Verzögerung / Whataboutism.",
      risk: "Klimaschutz erscheint nutzlos, Investitionen und Infrastruktur werden verzögert.",
      host_answer: "Wirkung entsteht nicht nur durch Größe, sondern durch Hebel.",
    },
    answers: {
      ten_seconds: "Der Zahlenkern kann stimmen, aber die Schlussfolgerung ist falsch: Wirkung entsteht nicht nur durch Größe, sondern durch Hebel.",
      thirty_seconds:
        "Ja, Deutschland ist nicht der größte Emittent. Aber daraus folgt nicht, dass Handeln wirkungslos ist. Wir wirken über Technologie, Märkte, Standards, Lieferketten, EU-Politik und Investitionen. Wenn jedes Land sagt, es sei zu klein, handelt am Ende niemand.",
      two_minutes:
        "Der Satz vermischt einen Zahlenkern mit einer falschen politischen Folgerung. Klimawirkung entsteht nicht nur proportional zum nationalen Anteil. Ein Industrieland wirkt über Technologieentwicklung, Regulierung, Märkte, Standards, Kapital, Lieferketten und internationale Glaubwürdigkeit. Die wirkungsökonomische Frage lautet daher nicht: Sind wir allein verantwortlich? Sondern: Welche Hebelwirkung können wir erzeugen, und welche Folgen hat es, wenn wir nicht handeln?",
    },
    effectPath: [
      ["Aussage", "Deutschland ist nur für 2 % verantwortlich."],
      ["Wirkstoff", "Zahlenargument als Ohnmachtsimpuls."],
      ["Resonanz", "Entlastung, Veränderungsmüdigkeit, Kostenangst."],
      ["Wirkmechanismus", "Anteil wird mit Wirkungslosigkeit verwechselt."],
      ["Wirkungspotenzial", "Handlungsfähigkeit sinkt."],
      ["Folgen", "Fossile Pfade bleiben länger bestehen, Innovation verlangsamt sich, Klimafolgekosten steigen."],
    ],
    frameKey: "ohnmacht",
    redirectQuestion: "Ziehst du daraus Nicht-Handeln ab - oder dass wir unsere Hebel besser nutzen müssen?",
    dontDo: ["Nicht in eine endlose Prozentdiskussion rutschen.", "Nicht den Frame übernehmen: Deutschland ist zu klein.", "Nicht so tun, als könne Deutschland allein das Klima retten."],
    facts: ["Anteil ist nicht dasselbe wie Hebelwirkung.", "Technologie, EU-Politik, Standards und Kapitalflüsse können Wirkung über Grenzen hinaus erzeugen."],
    consequences: ["Handlungsfähigkeit sinkt.", "Investitionen und Infrastruktur werden verzögert.", "Internationale Glaubwürdigkeit leidet."],
    woekSolution: ["Hebelwirkung in Scorecards sichtbar machen.", "Industrie-, Lieferketten- und Kapitalwirkung rückkoppeln.", "Nicht nur nationale Menge, sondern Systemwirkung bewerten."],
    mpd: {
      mensch: "Klimafolgekosten und Transformationsunsicherheit steigen.",
      planet: "Emissionen und fossile Lock-ins bleiben länger bestehen.",
      demokratie: "Institutionelles Vertrauen und Handlungsfähigkeit sinken.",
    },
    sources: ["Umweltbundesamt - Treibhausgas-Emissionen in Deutschland", "IEA - Renewables"],
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

function sentence(value) {
  const text = String(value ?? "");
  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
}

function words(value) {
  return String(value || "").split(/\s+/).filter(Boolean).length;
}

function answerText(claim, key) {
  const base = claim.answers[key];
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
              .map(
                (item) => `<article class="card">
              <p class="card-kicker">Wirkungsökonomische Lösung</p>
              <h3 class="card-title">${escapeHtml(item)}</h3>
            </article>`
              )
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
          </div>
          <p class="card-text"><strong>Nichtkompensation:</strong> Das kritischste Wirkungsfeld begrenzt die Gesamtbewertung; gute Klimawerte verdecken keine sozialen, ökologischen oder demokratischen Schäden.</p>
        </div>
      </section>`;
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

function renderLiveCard(claim) {
  const sources = claim.sources.map(slugSource);
  const answers = expandedAnswers(claim);
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
      ${summaryGrid(summaryItems, `${claim.title} Summary`)}
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
writeFile("content/wirkungsradar/climate-energy-mapping.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(mapping).trim()}\n`);
writeFile("content/wirkungsradar/climate-energy.yml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(dataModel()).trim()}\n`);
writeFile("wirkungsradar/themen/index.html", renderThemesIndex());
writeFile("wirkungsradar/themen/klima-energie/index.html", renderClusterPage());
for (const topic of subtopics) {
  writeFile(`wirkungsradar/themen/klima-energie/${topic.slug}/index.html`, renderSubtopic(topic));
}
for (const claim of claims) {
  writeFile(`wirkungsradar/live/${claim.slug}/index.html`, renderLiveCard(claim));
}

console.log(`Built climate-energy cluster: ${subtopics.length} subtopics, ${claims.length} live cards.`);
