import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-03";
const ASSET_VERSION = "20260603-narrative-template";

const tags = {
  themes: [
    "klima",
    "energie",
    "mobilitaet",
    "migration",
    "demokratie",
    "medien",
    "wissenschaft",
    "wirtschaft",
    "sdgs",
    "wirkungsoekonomie",
    "europa",
    "technologie",
  ],
  resonance: [
    "angst",
    "ohnmacht",
    "wut",
    "kraenkung",
    "kontrollverlust",
    "statusverlust",
    "kostenangst",
    "misstrauen",
    "identitaet",
    "trotz",
  ],
  risk_dimensions: [
    "mensch",
    "planet",
    "demokratie",
    "medienqualitaet",
    "rechtsstaat",
    "institutionelles_vertrauen",
    "diskursfaehigkeit",
    "minderheitenschutz",
    "quellenklarheit",
  ],
  claim_types: [
    "falsch",
    "irrefuehrend",
    "wahrer_kern_falsche_folgerung",
    "unbelegt",
    "wertefrage",
    "prognose_unsicher",
    "scheinargument",
    "verzoegerungsnarrativ",
    "verschwoerungsframe",
  ],
};

const externalSources = [
  {
    label: "Debunking Handbook",
    url: "https://www.climatechangecommunication.org/debunking-handbook-2020/",
    use_for: ["Debunking-Methode", "Fakten-Sandwich", "Fehlinformation"],
  },
  {
    label: "Bundeszentrale fuer politische Bildung",
    url: "https://www.bpb.de/themen/medien-journalismus/desinformation/",
    use_for: ["Desinformation", "Demokratiebildung", "Medienkompetenz"],
  },
  {
    label: "IPCC",
    url: "https://www.ipcc.ch/report/ar6/syr/resources/spm-headline-statements/",
    use_for: ["Klimawissenschaft", "Klimarisiken"],
  },
  {
    label: "United Nations SDGs",
    url: "https://sdgs.un.org/goals",
    use_for: ["SDGs", "Agenda 2030"],
  },
  {
    label: "Grundgesetz Art. 5",
    url: "https://www.gesetze-im-internet.de/gg/art_5.html",
    use_for: ["Meinungsfreiheit", "Pressefreiheit"],
  },
];

const claimUrlByTitle = new Map(
  [
    ["CO₂-Preis oder fossile Systemkosten?", "../../live/co2-preis-oder-fossile-systemkosten/"],
    ["Das ist Zensur", "../../live/das-ist-zensur/"],
    ["Das ist alles gesteuert", "../../live/das-ist-alles-gesteuert/"],
    ["Deutschland ist nur für 2 % verantwortlich", "../../live/deutschland-nur-zwei-prozent/"],
    ["Die da oben", "../../live/die-da-oben/"],
    ["Die Medien spalten das Land", "../../live/mainstreammedien-luegen-alle/"],
    ["Die Wissenschaft ist gekauft", "../../live/die-wissenschaft-ist-gekauft/"],
    ["E-Autos sind schlimmer als Verbrenner", "../../live/e-autos-schlimmer-als-verbrenner/"],
    ["E-Fuels retten den Verbrenner?", "../../live/e-fuels-retten-den-verbrenner/"],
    ["E-Fuels retten den Verbrenner", "../../live/e-fuels-retten-den-verbrenner/"],
    ["Weiter tanken wie bisher", "../../live/e-fuels-retten-den-verbrenner/"],
    ["Energiewende gescheitert", "../../live/energiewende-gescheitert/"],
    ["Fusion löst das später", "../../live/fusion-loest-das-energieproblem/"],
    ["Fusion löst das Energieproblem?", "../../live/fusion-loest-das-energieproblem/"],
    ["Arbeit lohnt sich nicht mehr?", "../../live/arbeit-lohnt-sich-nicht-mehr/"],
    ["Arbeit lohnt sich nicht mehr", "../../live/arbeit-lohnt-sich-nicht-mehr/"],
    ["Bürgergeld macht faul", "../../live/arbeit-lohnt-sich-nicht-mehr/#buergergeld-macht-faul"],
    ["Wer arbeitet, ist der Dumme", "../../live/arbeit-lohnt-sich-nicht-mehr/#wer-arbeitet-ist-der-dumme"],
    ["Totalverweigerer leben auf unsere Kosten", "../../live/arbeit-lohnt-sich-nicht-mehr/#totalverweigerer-frame"],
    ["Wasserstoff für alles?", "../../live/wasserstoff-fuer-alles/"],
    ["Wasserstoff macht alles klimaneutral", "../../live/wasserstoff-fuer-alles/"],
    ["Kernenergie wäre die einfache Lösung", "../../live/kernenergie-einfache-loesung/"],
    ["Klimaschutz bringt nichts, solange China nicht handelt", "../../live/deutschland-nur-zwei-prozent/"],
    ["Klimaschutz ist Ökodiktatur", "../../live/klimaschutz-ist-oekodiktatur/"],
    ["Mainstreammedien lügen alle", "../../live/mainstreammedien-luegen-alle/"],
    ["Man darf ja nichts mehr sagen", "../../live/man-darf-ja-nichts-mehr-sagen/"],
    ["Nur alternative Medien sagen die Wahrheit", "../../live/mainstreammedien-luegen-alle/"],
    ["SDGs sind Weltregierung", "../../detail/sdgs-sind-weltregierung/"],
    ["Wirkungsökonomie ist Planwirtschaft", "../../live/wirkungsoekonomie-planwirtschaft/"],
    ["Wirkungsökonomie ist Social Credit", "../../live/wirkungsoekonomie-social-credit/"],
  ].map(([title, url]) => [title.toLowerCase(), url])
);

const glossary = [
  ["wirkung", "Wirkung"],
  ["wirkungspotenzial", "Wirkungspotenzial"],
  ["wirkungsrisiko", "Wirkungsrisiko"],
  ["wirkstoff", "Wirkstoff"],
  ["wirkmechanismus", "Wirkmechanismus"],
  ["wirkungspfad", "Wirkungspfad"],
  ["resonanzraum", "Resonanzraum"],
  ["sdg-plus", "SDG+"],
  ["positive-netto-wirkung", "Positive Netto-Wirkung"],
  ["wirkungslenkung", "Wirkungslenkung"],
  ["wirkungsblindheit", "Wirkungsblindheit"],
  ["wirkungswahrheit", "Wirkungswahrheit"],
  ["frame", "Frame"],
  ["narrativ", "Narrativ"],
  ["sprachlicher-trigger", "Sprachlicher Trigger"],
  ["feindbild", "Feindbild"],
  ["polarisierung", "Polarisierung"],
  ["opferumkehr", "Opferumkehr"],
  ["demokratie-umdeutung", "Demokratie-Umdeutung"],
  ["gegenframe", "Gegenframe"],
  ["folgencheck", "Folgencheck"],
  ["wirkungsanalyse-von-sprache", "Wirkungsanalyse von Sprache"],
];

const hostSchema = [
  "Ich ordne das kurz ein.",
  "Der wahre Kern ist ...",
  "Der Denkfehler ist ...",
  "Das Narrativ dahinter ist ...",
  "Die wirkungsökonomische Frage lautet ...",
];

const narratives = [
  {
    slug: "ohnmacht",
    id: "ohnmachtsnarrativ",
    title: "Ohnmachtsnarrativ",
    shortName: "Ohnmacht",
    subtitle: "„Wir können sowieso nichts ändern.“",
    riskLevel: "hoch",
    themes: ["klima", "energie", "demokratie", "migration"],
    resonance: ["ohnmacht", "kostenangst", "misstrauen"],
    riskDimensions: ["mensch", "planet", "demokratie"],
    abstract:
      "Das Ohnmachtsnarrativ verwandelt begrenzte Einzelwirkung in allgemeine Wirkungslosigkeit. Es enthält oft einen wahren Kern: Kein Mensch, keine Kommune und kein Land löst komplexe Probleme allein. Irreführend wird es, wenn daraus folgt, dass Handeln sinnlos sei. Als gesellschaftlicher Wirkstoff senkt dieses Narrativ Selbstwirksamkeit, Vertrauen und politische Handlungsbereitschaft. Wirkungsökonomisch ist die bessere Frage nicht: Können wir allein alles lösen? Sondern: Welche Hebel haben wir, welche Wirkung können sie auslösen, und welche Folgen hätte Unterlassen?",
    summary: {
      definition:
        "Ein Narrativ, das Handeln als sinnlos darstellt, weil einzelne Akteure nicht alles allein lösen können.",
      typical_message: "Es bringt sowieso nichts.",
      emotional_hook: "Entlastung, Resignation, Veränderungsmüdigkeit.",
      risk: "Kollektive Handlungsfähigkeit sinkt.",
      host_principle: "Begrenztheit anerkennen, Wirkungslosigkeit zurückweisen.",
    },
    table: {
      kurzform: "„Bringt nichts“",
      hauptwirkung: "Handlungsfähigkeit sinkt",
      live_prinzip: "Hebel sichtbar machen",
    },
    definition:
      "Das Ohnmachtsnarrativ leitet aus begrenzter Einzelwirkung eine allgemeine Wirkungslosigkeit ab. Es macht aus einer realen Grenze eine pauschale Absage an Handlungsfähigkeit.",
    phrases: [
      "Deutschland rettet das Klima nicht allein.",
      "Meine Stimme ändert sowieso nichts.",
      "Die da oben machen doch, was sie wollen.",
      "Solange China nichts macht, bringt das alles nichts.",
      "Das ist alles zu spät.",
    ],
    wirkstoff: "Satz oder Frame, der Handlungsfähigkeit senkt.",
    resonanceText: "Müdigkeit, Entlastung, Frust und Veränderungserschöpfung.",
    effectSteps: [
      ["Aussage", "Begrenzte Einzelwirkung wird betont."],
      ["Wirkstoff", "Ohnmachtsimpuls: Aus Begrenztheit wird Nutzlosigkeit."],
      ["Resonanz", "Müdigkeit, Entlastung und Frust werden aktiviert."],
      ["Wirkungspotenzial", "Handlungsbereitschaft und Selbstwirksamkeit sinken."],
      ["Wirkungsrisiko", "Notwendige Veränderung wird verzögert."],
      ["Mögliche Wirkung", "Der Status quo stabilisiert sich."],
    ],
    mpd: {
      mensch: "Selbstwirksamkeit sinkt, Zukunftsangst steigt.",
      planet: "Notwendige Transformation wird verzögert.",
      demokratie: "Vertrauen in kollektive Problemlösung sinkt.",
    },
    answers: {
      ten_seconds:
        "Das ist ein Ohnmachtsnarrativ. Niemand löst alles allein - aber daraus folgt nicht, dass Handeln wirkungslos ist.",
      thirty_seconds:
        "Der wahre Kern ist: Ein einzelner Akteur löst komplexe Probleme nicht allein. Der Denkfehler ist: Aus begrenzter Wirkung wird Wirkungslosigkeit gemacht. Die wirkungsökonomische Frage lautet: Welche Hebel haben wir trotzdem - politisch, technologisch, wirtschaftlich und gesellschaftlich?",
      two_minutes:
        "Ich ordne das kurz ein. Der wahre Kern ist: Natürlich kann niemand allein das Klima, die Demokratie oder soziale Ungleichheit retten. Aber das heißt nicht, dass Handeln keine Wirkung hat. Wirkung entsteht in vernetzten Systemen: durch Standards, Märkte, Infrastruktur, Vorbilder, politische Mehrheiten, Investitionen und Institutionen. Wenn alle sagen „ich bin zu klein“, handelt niemand. Wirkungsökonomisch fragen wir deshalb nicht: Können wir allein alles lösen? Sondern: Welche Wirkung können unsere Hebel auslösen - und welche Folgekosten entstehen, wenn wir nichts tun?",
    },
    dontDo: [
      "Nicht so tun, als könne eine Person oder ein Land allein alles lösen.",
      "Nicht in moralische Beschämung rutschen.",
    ],
    redirectQuestion: "Welche Hebel haben wir trotzdem?",
    related: ["verzoegerung", "whataboutism", "scheiternsframe"],
    claims: [
      { title: "Deutschland ist nur für 2 % verantwortlich", url: "../../live/deutschland-nur-zwei-prozent/" },
      { title: "Meine Stimme bringt nichts" },
      { title: "Klimaschutz bringt nichts, solange China nicht handelt" },
    ],
  },
  {
    slug: "verzoegerung",
    id: "verzoegerungsnarrativ",
    title: "Verzögerungsnarrativ",
    shortName: "Verzögerung",
    subtitle: "„Noch nicht. Später. Erst brauchen wir die perfekte Lösung.“",
    riskLevel: "hoch",
    themes: ["klima", "energie", "wirtschaft", "technologie"],
    resonance: ["kostenangst", "trotz", "ohnmacht"],
    riskDimensions: ["planet", "demokratie", "institutionelles_vertrauen"],
    abstract:
      "Das Verzögerungsnarrativ akzeptiert ein Problem oft scheinbar, verschiebt aber die Handlung. Es sagt nicht unbedingt „das Problem existiert nicht“, sondern: Jetzt sei der falsche Zeitpunkt, die Lösung sei noch nicht perfekt, andere müssten zuerst handeln oder neue Technologien würden später alles lösen. Als gesellschaftlicher Wirkstoff senkt es Dringlichkeit, ohne eine bessere Alternative zu liefern. Wirkungsökonomisch ist entscheidend, ob Verzögerung selbst negative Wirkung erzeugt: durch Lock-ins, steigende Folgekosten, verlorene Zeitfenster und sinkende Transformationsfähigkeit.",
    summary: {
      definition: "Ein Narrativ, das notwendiges Handeln durch Warten, Perfektionsanspruch oder Zuständigkeitsverschiebung blockiert.",
      typical_message: "Später ist vernünftiger.",
      emotional_hook: "Sicherheitsbedürfnis, Kostenangst, Veränderungsmüdigkeit.",
      risk: "Zeitfenster schließen sich, Folgekosten steigen.",
      host_principle: "Kosten des Wartens sichtbar machen.",
    },
    table: {
      kurzform: "„Später“",
      hauptwirkung: "Dringlichkeit sinkt",
      live_prinzip: "Kosten des Wartens zeigen",
    },
    definition:
      "Verzögerung wirkt wie Zustimmung ohne Konsequenz: Das Problem wird anerkannt, aber die Entscheidung wird in die Zukunft, zu anderen Akteuren oder zu ungewissen Technologien verschoben.",
    phrases: [
      "Erst muss die Technik besser werden.",
      "Wir dürfen nichts überstürzen.",
      "Das ist noch nicht marktreif.",
      "Wir sollten warten, bis alle anderen mitmachen.",
      "Fusion löst das später.",
    ],
    wirkstoff: "Scheinbar vernünftiger Aufschub, der Dringlichkeit senkt.",
    resonanceText: "Kostenangst, Vorsicht, Status-quo-Schutz und Erschöpfung.",
    effectSteps: [
      ["Aussage", "Handeln wird auf später verschoben."],
      ["Wirkstoff", "Aufschub erscheint vernünftig und risikoarm."],
      ["Resonanz", "Kostenangst und Veränderungsmüdigkeit bekommen Entlastung."],
      ["Wirkungspotenzial", "Dringlichkeit und Investitionsbereitschaft sinken."],
      ["Wirkungsrisiko", "Lock-ins, Pfadabhängigkeiten und Folgekosten wachsen."],
      ["Mögliche Wirkung", "Transformation wird teurer, später oder unmöglich."],
    ],
    mpd: {
      mensch: "Belastungen werden in die Zukunft verschoben und treffen später oft härter.",
      planet: "Ökologische Kipppunkte und Emissionsbudgets werden ignoriert.",
      demokratie: "Politik verliert Lernfähigkeit und Glaubwürdigkeit.",
    },
    answers: {
      ten_seconds:
        "Das ist ein Verzögerungsnarrativ. Die Frage ist, ob weiteres Warten mehr Schaden erzeugt als lernfähiges Handeln.",
      thirty_seconds:
        "Der wahre Kern ist: Lösungen müssen geprüft werden. Der Denkfehler ist: Perfektion wird zur Ausrede gegen verfügbare Verbesserung. Wirkungsökonomisch fragen wir: Welche Kosten, Lock-ins und Risiken entstehen durch weiteres Warten?",
      two_minutes:
        "Ich ordne das kurz ein. Vorsicht kann sinnvoll sein, und nicht jede Lösung ist automatisch gut. Aber Verzögerung ist nicht neutral. Wenn wir heute nicht handeln, entstehen trotzdem Wirkungen: Infrastruktur altert, Investitionen bleiben aus, Emissionen laufen weiter, Menschen verlieren Vertrauen und spätere Lösungen werden teurer. Das Narrativ dahinter lautet: Später ist sicherer. Die wirkungsökonomische Frage lautet: Welche Maßnahme ist jetzt ausreichend wirksam, korrigierbar und verhältnismäßig - und welche Schäden entstehen, wenn wir gar nichts tun?",
    },
    dontDo: ["Nicht behaupten, jede sofortige Maßnahme sei automatisch richtig.", "Nicht den Perfektionsanspruch übernehmen."],
    redirectQuestion: "Was kostet weiteres Warten - finanziell, sozial, ökologisch und demokratisch?",
    related: ["ohnmacht", "technikwunder-aufschub", "scheiternsframe"],
    claims: [
      { title: "Deutschland ist nur für 2 % verantwortlich", url: "../../live/deutschland-nur-zwei-prozent/" },
      { title: "Erst muss die Technik besser werden" },
      { title: "Fusion löst das später" },
    ],
  },
  {
    slug: "suendenbock",
    id: "suendenbocknarrativ",
    title: "Sündenbocknarrativ",
    shortName: "Sündenbock",
    subtitle: "„Die sind schuld.“",
    riskLevel: "sehr hoch",
    themes: ["migration", "demokratie", "wirtschaft", "medien"],
    resonance: ["wut", "statusverlust", "misstrauen"],
    riskDimensions: ["mensch", "demokratie", "minderheitenschutz"],
    abstract:
      "Das Sündenbocknarrativ reduziert komplexe Probleme auf eine angeblich schuldige Gruppe. Es bietet einfache emotionale Entlastung: Statt Ursachen, Systeme, Anreize und Entscheidungen zu analysieren, wird Verantwortung auf Migrant:innen, Minderheiten, politische Gegner:innen, Medien, Wissenschaft oder „die da oben“ verschoben. Als gesellschaftlicher Wirkstoff erzeugt es Feindbilder und senkt die Bereitschaft zur sachlichen Problemlösung. Wirkungsökonomisch ist es besonders riskant, weil es reale Ursachen verdeckt, Gruppen abwertet und demokratische Korrekturfähigkeit schwächt.",
    summary: {
      definition: "Ein Narrativ, das komplexe Ursachen durch Schuldzuweisung an eine Gruppe ersetzt.",
      typical_message: "Die sind schuld.",
      emotional_hook: "Wut, Entlastung, Zugehörigkeit, Statusschutz.",
      risk: "Feindbilder wachsen, echte Ursachen bleiben bestehen.",
      host_principle: "Ursache von Schuld trennen.",
    },
    table: {
      kurzform: "„Die sind schuld“",
      hauptwirkung: "Feindbilder wachsen",
      live_prinzip: "Ursache von Schuld trennen",
    },
    definition:
      "Das Sündenbocknarrativ vereinfacht komplexe Probleme, indem es eine Gruppe als Hauptursache markiert und damit Systemanalyse durch Abwertung ersetzt.",
    phrases: [
      "Die Migranten kosten uns alles.",
      "Die Grünen zerstören Deutschland.",
      "Die Woken sind schuld.",
      "Die Medien spalten das Land.",
      "Die Arbeitslosen leben auf unsere Kosten.",
    ],
    wirkstoff: "Schuldzuweisung, die emotionale Entlastung erzeugt.",
    resonanceText: "Wut, Kränkung, Statusangst und Zugehörigkeit zu einer bedrohten Gruppe.",
    effectSteps: [
      ["Komplexes Problem", "Viele Ursachen, Anreize und Entscheidungen wirken zusammen."],
      ["Wirkstoff", "Eine Gruppe wird zur einfachen Ursache erklärt."],
      ["Resonanz", "Emotionale Entlastung und Feindbildbildung entstehen."],
      ["Wirkungspotenzial", "Abwertung und Ausgrenzung werden wahrscheinlicher."],
      ["Wirkungsrisiko", "Politische Scheinlösungen verdrängen Ursachenanalyse."],
      ["Mögliche Wirkung", "Echte Ursachen bleiben bestehen und Gruppen werden geschädigt."],
    ],
    mpd: {
      mensch: "Betroffene Gruppen werden abgewertet, bedroht oder ausgeschlossen.",
      planet: "Sachlösungen werden blockiert, wenn ökologische Probleme personalisiert werden.",
      demokratie: "Minderheitenschutz und demokratische Korrekturfähigkeit werden geschwächt.",
    },
    answers: {
      ten_seconds:
        "Das ist ein Sündenbocknarrativ. Es ersetzt Ursachenanalyse durch Schuldzuweisung.",
      thirty_seconds:
        "Der wahre Kern kann sein, dass es reale Probleme gibt. Der Denkfehler ist, eine ganze Gruppe dafür verantwortlich zu machen. Wirkungsökonomisch fragen wir: Welche Strukturen erzeugen das Problem - und welche Lösung verbessert die Lage, ohne Menschen abzuwerten?",
      two_minutes:
        "Ich ordne das kurz ein. Es kann reale Probleme geben: Wohnkosten, Verteilungskonflikte, Sicherheitsfragen, überforderte Verwaltungen oder ungerechte Lasten. Aber daraus folgt nicht, dass eine ganze Gruppe schuld ist. Das Sündenbocknarrativ bietet emotionale Entlastung, weil es Komplexität reduziert und Wut bündelt. Wirkungsökonomisch ist das riskant: Es verdeckt Ursachen, beschädigt Menschenwürde, schwächt Minderheitenschutz und führt zu Scheinlösungen. Die bessere Frage lautet: Welche Struktur erzeugt das Problem, wer entscheidet darüber, welche Anreize wirken - und welche Lösung verbessert die Wirkung für alle Betroffenen?",
    },
    dontDo: ["Nicht pauschal zurückbeschuldigen.", "Nicht reale Probleme leugnen, die das Narrativ ausnutzt."],
    redirectQuestion: "Welche Struktur erzeugt das Problem - und welche Lösung hilft ohne Abwertung?",
    related: ["kontrollverlust", "elitenverschwoerung", "normalisierung", "zersetzung"],
    claims: [{ title: "Migration kostet nur" }, { title: "Die Medien spalten das Land" }, { title: "Die Grünen zerstören Deutschland" }],
  },
  {
    slug: "kontrollverlust",
    id: "kontrollverlustnarrativ",
    title: "Kontrollverlustnarrativ",
    shortName: "Kontrollverlust",
    subtitle: "„Die da oben wollen uns kontrollieren.“",
    riskLevel: "hoch",
    themes: ["demokratie", "sdgs", "technologie", "europa"],
    resonance: ["kontrollverlust", "angst", "misstrauen"],
    riskDimensions: ["demokratie", "rechtsstaat", "institutionelles_vertrauen"],
    abstract:
      "Das Kontrollverlustnarrativ deutet politische, wissenschaftliche oder internationale Koordination als Angriff auf Freiheit und Selbstbestimmung. Es funktioniert besonders stark in Situationen, in denen Menschen ohnehin Unsicherheit, Kostenangst oder Vertrauensverlust erleben. Als gesellschaftlicher Wirkstoff verschiebt es die Debatte: Nicht mehr die konkrete Maßnahme wird geprüft, sondern eine angebliche verborgene Kontrollabsicht. Wirkungsökonomisch muss man hier berechtigte Fragen nach Transparenz und Machtbegrenzung ernst nehmen, ohne in Verschwörungslogik zu rutschen.",
    summary: {
      definition: "Ein Narrativ, das Regeln, Kooperation oder Koordination als verborgene Kontrolle deutet.",
      typical_message: "Die wollen uns steuern.",
      emotional_hook: "Angst, Misstrauen, Souveränitätsgefühl.",
      risk: "Transparenzfragen kippen in pauschale Verdachtslogik.",
      host_principle: "Transparenz statt Verdacht.",
    },
    table: {
      kurzform: "„Die kontrollieren uns“",
      hauptwirkung: "Misstrauen steigt",
      live_prinzip: "Transparenz statt Verdacht",
    },
    definition:
      "Das Kontrollverlustnarrativ übersetzt Unsicherheit in eine unterstellte Kontrollabsicht. Aus prüfbarer Maßnahme wird eine angebliche verborgene Herrschaftslogik.",
    phrases: [
      "Die da oben wollen uns steuern.",
      "Das ist alles Kontrolle.",
      "Die wollen uns enteignen.",
      "Die wollen unser Leben bestimmen.",
      "Das ist der Weg in die Diktatur.",
    ],
    wirkstoff: "Bedrohungsframe, der Regeln als Freiheitsangriff deutet.",
    resonanceText: "Souveränitätsangst, Kostenangst, Vertrauensverlust und Machtmisstrauen.",
    effectSteps: [
      ["Aussage", "Eine Maßnahme wird als Kontrollabsicht gerahmt."],
      ["Wirkstoff", "Unsicherheit wird in Fremdbestimmung übersetzt."],
      ["Resonanz", "Misstrauen und Souveränitätsangst steigen."],
      ["Wirkungspotenzial", "Prüfbare Sachfragen werden durch Verdacht verdrängt."],
      ["Wirkungsrisiko", "Demokratische Institutionen verlieren Vertrauen."],
      ["Mögliche Wirkung", "Kooperation und Problemlösung werden blockiert."],
    ],
    mpd: {
      mensch: "Angst vor Fremdbestimmung kann Handlungsfähigkeit senken.",
      planet: "Globale und ökologische Kooperation wird erschwert.",
      demokratie: "Institutionelles Vertrauen und rechtsstaatliche Abwägung werden geschwächt.",
    },
    answers: {
      ten_seconds:
        "Machtkontrolle ist wichtig. Aber aus jeder Regel automatisch Diktatur zu machen, ist ein Kontrollverlustframe.",
      thirty_seconds:
        "Die Sorge vor Machtmissbrauch kann berechtigt sein. Der Denkfehler ist, aus jeder Regel oder Kooperation eine verborgene Kontrollabsicht abzuleiten. Die bessere Frage lautet: Ist die Maßnahme demokratisch beschlossen, transparent, überprüfbar und verhältnismäßig?",
      two_minutes:
        "Ich ordne das kurz ein. Demokratien müssen Macht begrenzen, Regeln kontrollieren und Eingriffe begründen. Das ist der wahre Kern. Aber das Kontrollverlustnarrativ springt von dieser berechtigten Frage zu einer pauschalen Unterstellung: Alles sei Kontrolle, alles sei Diktatur, alles sei von oben gesteuert. Dadurch verschiebt sich die Debatte weg von der konkreten Maßnahme. Wirkungsökonomisch prüfen wir deshalb: Wer entscheidet, auf welcher Rechtsgrundlage, mit welcher Kontrolle, welchen Kosten, welchen Nebenwirkungen und welcher Korrekturmöglichkeit? So bleibt Kritik demokratisch stark, ohne in Verdachtslogik zu rutschen.",
    },
    dontDo: ["Nicht jede Sorge vor Machtmissbrauch lächerlich machen.", "Nicht die konkrete Maßnahme aus dem Blick verlieren."],
    redirectQuestion: "Welche konkrete Entscheidung meinst du - und wie ist sie demokratisch kontrollierbar?",
    related: ["elitenverschwoerung", "verbotsnarrativ", "wissenschaftsdelegitimierung"],
    claims: [
      { title: "SDGs sind Weltregierung", url: "../../detail/sdgs-sind-weltregierung/" },
      { title: "Klimaschutz ist Ökodiktatur" },
      { title: "Digitale Produktpässe sind Überwachung" },
    ],
  },
  {
    slug: "verbotsnarrativ",
    id: "verbotsnarrativ",
    title: "Verbotsnarrativ",
    shortName: "Verbotsnarrativ",
    subtitle: "„Die wollen uns alles verbieten.“",
    riskLevel: "mittel",
    themes: ["klima", "energie", "mobilitaet", "wirtschaft"],
    resonance: ["trotz", "identitaet", "statusverlust"],
    riskDimensions: ["mensch", "demokratie", "diskursfaehigkeit"],
    abstract:
      "Das Verbotsnarrativ rahmt politische Steuerung als Angriff auf persönliche Freiheit. Es übersetzt Standards, Preissignale, Sicherheitsregeln oder Transformationspolitik in ein Gefühl von Verlust: Auto, Fleisch, Heizung, Meinung, Eigentum oder Lebensstil würden angeblich weggenommen. Als gesellschaftlicher Wirkstoff aktiviert es Trotz, Abwehr und Identitätsschutz. Wirkungsökonomisch ist wichtig, zwischen echten Verboten, Preissignalen, Transparenzpflichten, Schutzregeln und demokratisch legitimierter Lenkung zu unterscheiden.",
    summary: {
      definition: "Ein Narrativ, das unterschiedliche Formen politischer Steuerung pauschal als Verbot rahmt.",
      typical_message: "Alles wird verboten.",
      emotional_hook: "Freiheitsangst, Trotz, Identitätsschutz.",
      risk: "Sachliche Abwägung wird zu Kulturkampf.",
      host_principle: "Regel, Preis, Schutz und Zwang unterscheiden.",
    },
    table: {
      kurzform: "„Alles wird verboten“",
      hauptwirkung: "Freiheitsangst steigt",
      live_prinzip: "Regel, Preis, Schutz unterscheiden",
    },
    definition:
      "Das Verbotsnarrativ verdichtet sehr unterschiedliche Instrumente zu einem Freiheitsangriff und verhindert dadurch die Prüfung von Zweck, Verhältnismäßigkeit und Alternativen.",
    phrases: [
      "Die verbieten uns das Auto.",
      "Die verbieten uns Fleisch.",
      "Die verbieten unsere Heizungen.",
      "Die wollen uns vorschreiben, wie wir leben.",
      "Das ist Bevormundung.",
    ],
    wirkstoff: "Freiheitsbedrohung als Sammelframe.",
    resonanceText: "Trotz, Statusschutz, kulturelle Identität und Verlustangst.",
    effectSteps: [
      ["Aussage", "Eine Regel wird als Verbot gedeutet."],
      ["Wirkstoff", "Freiheitsangst und Trotz werden aktiviert."],
      ["Resonanz", "Lebensstil und Identität fühlen sich bedroht an."],
      ["Wirkungspotenzial", "Instrumente werden nicht mehr differenziert geprüft."],
      ["Wirkungsrisiko", "Demokratische Lenkung wird pauschal delegitimiert."],
      ["Mögliche Wirkung", "Wirksame Schutzregeln oder Alternativen werden blockiert."],
    ],
    mpd: {
      mensch: "Schutz- und Entlastungswirkungen werden durch Freiheitsangst überdeckt.",
      planet: "Transformationsinstrumente verlieren Akzeptanz.",
      demokratie: "Abwägung über Regeln, Preise und Schutz kippt in Pauschalabwehr.",
    },
    answers: {
      ten_seconds: "Nicht jede Regel ist ein Verbot. Entscheidend ist, ob es um Zwang, Schutz, faire Preise oder bessere Alternativen geht.",
      thirty_seconds:
        "Der wahre Kern ist: Freiheit muss bei jeder Maßnahme geprüft werden. Der Denkfehler ist: Standards, Preise, Schutzregeln und echte Verbote in einen Topf zu werfen. Die bessere Frage lautet: Welche Wirkung soll die Regel erzeugen, und ist sie verhältnismäßig?",
      two_minutes:
        "Ich ordne das kurz ein. Freiheit ist ein wichtiger Maßstab, gerade in Transformationen. Aber das Verbotsnarrativ macht aus jeder Form von Steuerung sofort Bevormundung. Wirkungsökonomisch müssen wir genauer sein: Ein Verbot ist etwas anderes als ein Preissignal, eine Kennzeichnungspflicht, ein Sicherheitsstandard, ein Förderprogramm oder der Ausbau einer Alternative. Dann kann man fair prüfen: Ist der Eingriff demokratisch beschlossen, verhältnismäßig, sozial abgefedert und wirksam? So schützen wir Freiheit besser als mit dem pauschalen Satz „die wollen alles verbieten“.",
    },
    dontDo: ["Nicht mit „Stell dich nicht so an“ reagieren.", "Nicht echte Freiheitseingriffe kleinreden."],
    redirectQuestion: "Ist das ein echtes Verbot - oder eine Regel, ein Preis, ein Schutzstandard oder eine Alternative?",
    related: ["kontrollverlust", "normalisierung", "scheiternsframe"],
    claims: [{ title: "Klimaschutz ist Ökodiktatur" }, { title: "Die verbieten unsere Heizungen" }, { title: "Die verbieten uns das Auto" }],
  },
  {
    slug: "elitenverschwoerung",
    id: "elitenverschwoerung",
    title: "Elitenverschwörung",
    shortName: "Elitenverschwörung",
    subtitle: "„Das ist alles von Eliten geplant.“",
    riskLevel: "sehr hoch",
    themes: ["demokratie", "sdgs", "wirtschaft", "medien"],
    resonance: ["misstrauen", "kontrollverlust", "wut"],
    riskDimensions: ["demokratie", "quellenklarheit", "institutionelles_vertrauen"],
    abstract:
      "Die Elitenverschwörung verwandelt reale Machtfragen in ein geschlossenes Weltbild. Der wahre Kern ist: Macht, Lobbyismus, Kapitalinteressen und Intransparenz existieren tatsächlich. Irreführend und gefährlich wird es, wenn daraus eine allumfassende geheime Steuerung konstruiert wird, gegen die Fakten, Institutionen und demokratische Verfahren angeblich machtlos seien. Als gesellschaftlicher Wirkstoff zerstört dieses Narrativ Vertrauen in überprüfbare Quellen und demokratische Korrektur. Wirkungsökonomisch braucht es deshalb doppelte Klarheit: Machtkritik ja, Verschwörungslogik nein.",
    summary: {
      definition: "Ein Narrativ, das reale Machtfragen in eine allumfassende geheime Steuerung verwandelt.",
      typical_message: "Alles ist geplant.",
      emotional_hook: "Misstrauen, Kontrollverlust, Erklärungsbedürfnis.",
      risk: "Belege werden durch Verdacht ersetzt.",
      host_principle: "Konkrete Belege verlangen.",
    },
    table: {
      kurzform: "„Alles geplant“",
      hauptwirkung: "Quellenvertrauen sinkt",
      live_prinzip: "konkrete Belege verlangen",
    },
    definition:
      "Elitenverschwörung nimmt reale Machtasymmetrien auf, schließt sie aber zu einem Weltbild, in dem alles Teil eines geheimen Plans ist.",
    phrases: [
      "Das ist alles vom WEF geplant.",
      "Die Globalisten steuern das.",
      "Die Eliten wollen uns austauschen.",
      "Die UN übernimmt die Kontrolle.",
      "Das ist Teil eines großen Plans.",
    ],
    wirkstoff: "Verdachtslogik, die jede Gegeninformation in den angeblichen Plan integriert.",
    resonanceText: "Misstrauen, Kontrollverlust, Wut und das Bedürfnis nach eindeutiger Erklärung.",
    effectSteps: [
      ["Aussage", "Eine komplexe Entwicklung wird als geheimer Plan erklärt."],
      ["Wirkstoff", "Verdacht ersetzt überprüfbare Belege."],
      ["Resonanz", "Misstrauen und Kontrollverlust finden ein Feindbild."],
      ["Wirkungspotenzial", "Quellen, Institutionen und Fakten verlieren Bindungskraft."],
      ["Wirkungsrisiko", "Demokratische Korrektur erscheint wirkungslos."],
      ["Mögliche Wirkung", "Radikalisierung und institutionelle Delegitimierung nehmen zu."],
    ],
    mpd: {
      mensch: "Menschen geraten in Angst- und Misstrauensspiralen.",
      planet: "Globale Kooperation wird als Herrschaftsprojekt blockiert.",
      demokratie: "Vertrauen in Quellen, Rechtsstaat und Verfahren wird geschädigt.",
    },
    answers: {
      ten_seconds: "Machtkritik ist wichtig. Aber eine geheime Totalsteuerung zu behaupten, ersetzt Belege durch Verdacht.",
      thirty_seconds:
        "Der wahre Kern ist: Macht, Lobbyismus und Intransparenz gibt es. Der Denkfehler ist, daraus einen allumfassenden geheimen Plan zu machen. Die bessere Frage lautet: Welche konkreten Interessen, Daten, Geldflüsse und Entscheidungen sind nachweisbar?",
      two_minutes:
        "Ich ordne das kurz ein. Wer Demokratie schützen will, muss Macht kritisieren können: Lobbyismus, Kapitalinteressen, Drehtüren, Intransparenz und ungleiche Einflusschancen sind reale Themen. Aber Verschwörungslogik macht daraus ein geschlossenes Weltbild. Dann gilt jede Quelle als Teil des Plans, jeder Widerspruch als Beweis und jede Institution als gesteuert. Wirkungsökonomisch zerstört das die Möglichkeit demokratischer Korrektur. Die bessere Antwort ist: Machtkritik präzisieren. Wer hat entschieden? Wer profitiert? Welche Daten gibt es? Welche Kontrolle greift? So bleibt Kritik überprüfbar und handlungsfähig.",
    },
    dontDo: ["Nicht reale Machtfragen abtun.", "Nicht in endlose Beweislastumkehr geraten."],
    redirectQuestion: "Welche konkrete Entscheidung, Quelle oder Geldspur meinst du?",
    related: ["kontrollverlust", "wissenschaftsdelegitimierung", "medienfeindbild", "zersetzung"],
    claims: [
      { title: "SDGs sind Weltregierung", url: "../../detail/sdgs-sind-weltregierung/" },
      { title: "Das ist alles vom WEF geplant" },
      { title: "Die UN übernimmt die Kontrolle" },
    ],
  },
  {
    slug: "wissenschaftsdelegitimierung",
    id: "wissenschaftsdelegitimierung",
    title: "Wissenschaftsdelegitimierung",
    shortName: "Wissenschaftsdelegitimierung",
    subtitle: "„Die Wissenschaft ist gekauft.“",
    riskLevel: "sehr hoch",
    themes: ["wissenschaft", "klima", "demokratie", "medien"],
    resonance: ["misstrauen", "trotz", "kontrollverlust"],
    riskDimensions: ["quellenklarheit", "demokratie", "medienqualitaet"],
    abstract:
      "Wissenschaftsdelegitimierung greift nicht nur einzelne Studien an, sondern das öffentliche Vertrauen in wissenschaftliche Korrekturprozesse. Der wahre Kern ist: Wissenschaft kann Fehler machen, Interessenkonflikte kennen und muss kritisiert werden dürfen. Irreführend wird es, wenn daraus folgt, Wissenschaft sei grundsätzlich korrupt oder beliebig. Als gesellschaftlicher Wirkstoff schwächt dieses Narrativ eine zentrale Infrastruktur demokratischer Entscheidungen: überprüfbares Wissen. Wirkungsökonomisch geht es nicht um blinden Wissenschaftsglauben, sondern um Quellenklarheit, Methodenprüfung und transparente Unsicherheit.",
    summary: {
      definition: "Ein Narrativ, das Kritik an Studien in pauschales Misstrauen gegen Wissenschaft verwandelt.",
      typical_message: "Experten sind gekauft.",
      emotional_hook: "Misstrauen, Trotz, Anti-Autoritätsgefühl.",
      risk: "Die gemeinsame Wissensbasis bricht.",
      host_principle: "Methode statt Autorität erklären.",
    },
    table: {
      kurzform: "„Gekaufte Experten“",
      hauptwirkung: "Wissensbasis bricht",
      live_prinzip: "Methode statt Autorität erklären",
    },
    definition:
      "Wissenschaftsdelegitimierung greift den Korrekturprozess selbst an und macht aus möglicher Fehlbarkeit angebliche Beliebigkeit.",
    phrases: [
      "Die Experten sind gekauft.",
      "Studien kann man doch alle fälschen.",
      "Wissenschaft ist auch nur Meinung.",
      "Die ändern ständig ihre Meinung.",
      "Das ist politisierte Wissenschaft.",
    ],
    wirkstoff: "Pauschales Quellenmisstrauen gegenüber Expertise und Methode.",
    resonanceText: "Misstrauen, Trotz gegenüber Autoritäten und Wunsch nach einfacher Gegenwahrheit.",
    effectSteps: [
      ["Aussage", "Wissenschaft wird pauschal als korrupt gerahmt."],
      ["Wirkstoff", "Einzelne Fehler werden zum Systemurteil."],
      ["Resonanz", "Misstrauen und Anti-Autoritätsgefühl steigen."],
      ["Wirkungspotenzial", "Methoden, Unsicherheit und Korrekturprozesse verlieren Bedeutung."],
      ["Wirkungsrisiko", "Entscheidungen verlieren ihre Wissensbasis."],
      ["Mögliche Wirkung", "Desinformation und Scheinexpertise gewinnen Raum."],
    ],
    mpd: {
      mensch: "Gesundheits-, Bildungs- und Sicherheitsentscheidungen werden riskanter.",
      planet: "Klimarisiken und ökologische Evidenz werden verdrängt.",
      demokratie: "Überprüfbares Wissen als demokratische Infrastruktur wird geschwächt.",
    },
    answers: {
      ten_seconds: "Wissenschaft ist nicht unfehlbar. Aber sie hat Methoden, Fehler zu finden und Wissen zu korrigieren.",
      thirty_seconds:
        "Der wahre Kern ist: Wissenschaft kann Fehler machen und Interessenkonflikte haben. Der Denkfehler ist, daraus pauschal Korruption oder Beliebigkeit abzuleiten. Kritik braucht Belege: Methode, Daten, Finanzierung, Peer Review und Korrektur.",
      two_minutes:
        "Ich ordne das kurz ein. Wissenschaft ist kein Glaubenssystem und keine unfehlbare Autorität. Sie ist ein Verfahren, mit dem Aussagen überprüft, Fehler gefunden und Unsicherheit sichtbar gemacht werden. Natürlich gibt es schlechte Studien, Interessenkonflikte und politische Deutungen. Genau deshalb sind Methode, Daten, Replikation, Peer Review und transparente Kritik so wichtig. Das Narrativ „alles gekauft“ zerstört diesen Unterschied. Dann zählt nicht mehr, was belegt ist, sondern nur noch, ob eine Quelle ins eigene Misstrauen passt. Wirkungsökonomisch ist überprüfbares Wissen eine Infrastruktur der Demokratie. Die bessere Frage lautet: Welche konkrete Studie, welche Methode und welcher Interessenkonflikt sind gemeint?",
    },
    dontDo: ["Nicht mit Autorität allein antworten.", "Nicht Unsicherheit verstecken."],
    redirectQuestion: "Welche konkrete Studie oder Methode kritisierst du - und mit welchen Belegen?",
    related: ["medienfeindbild", "elitenverschwoerung", "kontrollverlust"],
    claims: [{ title: "Klimawissenschaft ist gekauft" }, { title: "Studien kann man alle fälschen" }, { title: "Experten liegen immer falsch" }],
  },
  {
    slug: "medienfeindbild",
    id: "medienfeindbild",
    title: "Medienfeindbild",
    shortName: "Medienfeindbild",
    subtitle: "„Mainstreammedien lügen alle.“",
    riskLevel: "sehr hoch",
    themes: ["medien", "demokratie", "wissenschaft"],
    resonance: ["misstrauen", "wut", "identitaet"],
    riskDimensions: ["medienqualitaet", "quellenklarheit", "demokratie"],
    abstract:
      "Das Medienfeindbild macht aus berechtigter Medienkritik eine pauschale Delegitimierung journalistischer Öffentlichkeit. Der wahre Kern ist: Medien können Fehler machen, einseitig berichten, ökonomischen Anreizen folgen oder wichtige Perspektiven vernachlässigen. Irreführend wird es, wenn daraus folgt, alle professionellen Medien seien Teil einer Lügenstruktur. Als gesellschaftlicher Wirkstoff zerstört dieses Narrativ Quellenvertrauen und öffnet Räume für Desinformation. Wirkungsökonomisch ist Medienqualität Teil demokratischer Infrastruktur, nicht bloß ein Meinungsthema.",
    summary: {
      definition: "Ein Narrativ, das Medienkritik in pauschales Feindbild gegen journalistische Öffentlichkeit verwandelt.",
      typical_message: "Alle lügen.",
      emotional_hook: "Misstrauen, Wut, Gegenöffentlichkeitsgefühl.",
      risk: "Quellenordnung zerfällt.",
      host_principle: "Medienkritik präzisieren.",
    },
    table: {
      kurzform: "„Alle lügen“",
      hauptwirkung: "Quellenordnung zerfällt",
      live_prinzip: "Medienkritik präzisieren",
    },
    definition:
      "Das Medienfeindbild richtet sich nicht gegen einen konkreten Fehler, sondern gegen die Vertrauensfunktion journalistischer Öffentlichkeit.",
    phrases: [
      "Mainstreammedien lügen alle.",
      "Das steht doch sowieso alles fest.",
      "Journalisten schreiben nur, was sie sollen.",
      "Das Kartell verschweigt die Wahrheit.",
      "Nur alternative Medien sagen noch die Wahrheit.",
    ],
    wirkstoff: "Pauschale Delegitimierung professioneller Öffentlichkeit.",
    resonanceText: "Misstrauen, Wut, Zugehörigkeit zu einer Gegenöffentlichkeit.",
    effectSteps: [
      ["Aussage", "Medien werden pauschal als Lügenstruktur gerahmt."],
      ["Wirkstoff", "Quellenvertrauen wird entwertet."],
      ["Resonanz", "Wut und Gegenöffentlichkeitsidentität werden aktiviert."],
      ["Wirkungspotenzial", "Korrektur, Recherche und Quellenvergleich verlieren Wirkung."],
      ["Wirkungsrisiko", "Desinformation findet leichter Resonanz."],
      ["Mögliche Wirkung", "Demokratische Öffentlichkeit fragmentiert."],
    ],
    mpd: {
      mensch: "Menschen verlieren Orientierung in Krisen und Konflikten.",
      planet: "Klimawissen und Transformationsdaten werden leichter diskreditiert.",
      demokratie: "Medienqualität, Quellenklarheit und Diskursfähigkeit sinken.",
    },
    answers: {
      ten_seconds: "Medienkritik ist wichtig. Aber „alle lügen“ ist kein Argument, sondern ein Vertrauenszerstörer.",
      thirty_seconds:
        "Der wahre Kern ist: Medien machen Fehler und brauchen Kritik. Der Denkfehler ist, daraus eine pauschale Lügenstruktur zu machen. Die bessere Frage lautet: Welche Quelle sagt was, mit welchen Belegen, und wie wird korrigiert?",
      two_minutes:
        "Ich ordne das kurz ein. Medienkritik gehört zur Demokratie. Redaktionen können Fehler machen, Perspektiven übersehen, ökonomischen Druck spüren oder unausgewogen berichten. Aber das ist etwas anderes als die Behauptung, alle professionellen Medien würden lügen. Dieses Narrativ zerstört Quellenvertrauen insgesamt. Dann wird nicht mehr geprüft, welche Recherche, welche Belege und welche Korrekturmechanismen vorliegen. Wirkungsökonomisch ist Öffentlichkeit ein Wirkungsraum: Ohne Quellenklarheit, Medienqualität und Korrektur sinkt demokratische Entscheidungsfähigkeit. Die bessere Frage lautet: Welche konkrete Berichterstattung meinst du - und was zeigt der Quellenvergleich?",
    },
    dontDo: ["Nicht pauschal alle Medien verteidigen.", "Nicht konkrete Medienfehler kleinreden."],
    redirectQuestion: "Welche konkrete Quelle meinst du - und welche Belege oder Korrekturen gibt es?",
    related: ["wissenschaftsdelegitimierung", "elitenverschwoerung", "opferumkehr"],
    claims: [{ title: "Mainstreammedien lügen alle" }, { title: "Die Medien spalten das Land" }, { title: "Nur alternative Medien sagen die Wahrheit" }],
  },
  {
    slug: "opferumkehr",
    id: "opferumkehr",
    title: "Opferumkehr",
    shortName: "Opferumkehr",
    subtitle: "„Man darf ja nichts mehr sagen.“",
    riskLevel: "hoch",
    themes: ["demokratie", "medien", "migration"],
    resonance: ["kraenkung", "trotz", "identitaet"],
    riskDimensions: ["diskursfaehigkeit", "minderheitenschutz", "demokratie"],
    abstract:
      "Opferumkehr verschiebt den Fokus von der Wirkung einer Aussage auf die angebliche Unterdrückung der sprechenden Person. Der wahre Kern ist: Debatten können überhitzt sein, und Menschen erleben manchmal sozialen Druck. Irreführend wird es, wenn Kritik, Widerspruch, Moderation oder Faktencheck als Zensur umgedeutet werden. Als gesellschaftlicher Wirkstoff kann Opferumkehr Abwertung normalisieren und demokratische Gesprächsregeln verschieben. Wirkungsökonomisch lautet die Antwort: Meinungsfreiheit schützt vor staatlicher Unterdrückung, aber nicht vor Widerspruch.",
    summary: {
      definition: "Ein Narrativ, das Kritik an einer Aussage als Unterdrückung der sprechenden Person rahmt.",
      typical_message: "Man darf nichts sagen.",
      emotional_hook: "Kränkung, Trotz, Opfergefühl.",
      risk: "Kritik wird als Zensur delegitimiert.",
      host_principle: "Meinungsfreiheit von Widerspruchsfreiheit trennen.",
    },
    table: {
      kurzform: "„Man darf nichts sagen“",
      hauptwirkung: "Kritik wird Zensur",
      live_prinzip: "Meinungsfreiheit ≠ Widerspruchsfreiheit",
    },
    definition:
      "Opferumkehr lenkt vom Inhalt und der Wirkung einer Aussage auf die angebliche Benachteiligung der Person, die sie äußert.",
    phrases: [
      "Man darf ja nichts mehr sagen.",
      "Sofort wird man gecancelt.",
      "Das ist Zensur.",
      "Kritik ist heute verboten.",
      "Nur weil ich meine Meinung sage.",
    ],
    wirkstoff: "Verschiebung von Aussagewirkung zu Sprecher-Opferrolle.",
    resonanceText: "Kränkung, Trotz, Statusschutz und das Gefühl moralischer Überlegenheit.",
    effectSteps: [
      ["Aussage", "Eine problematische Aussage wird kritisiert."],
      ["Wirkstoff", "Kritik wird als Unterdrückung umgedeutet."],
      ["Resonanz", "Kränkung und Trotz werden aktiviert."],
      ["Wirkungspotenzial", "Der ursprüngliche Inhalt wird nicht mehr geprüft."],
      ["Wirkungsrisiko", "Moderation, Faktencheck und Minderheitenschutz werden delegitimiert."],
      ["Mögliche Wirkung", "Abwertung kann als mutige Meinung normalisiert werden."],
    ],
    mpd: {
      mensch: "Betroffene von Abwertung verschwinden hinter dem Opfergefühl der sprechenden Person.",
      planet: "Sachfragen können in Kulturkampf ausweichen.",
      demokratie: "Diskursregeln, Moderation und Widerspruchsfähigkeit werden geschwächt.",
    },
    answers: {
      ten_seconds: "Du darfst das sagen. Und andere dürfen widersprechen. Meinungsfreiheit heißt nicht Widerspruchsfreiheit.",
      thirty_seconds:
        "Der wahre Kern ist: Debatten können überhitzt sein. Der Denkfehler ist, Kritik oder Faktencheck mit Zensur gleichzusetzen. Meinungsfreiheit schützt vor staatlicher Unterdrückung - nicht vor Widerspruch, Einordnung oder Moderation.",
      two_minutes:
        "Ich ordne das kurz ein. Es stimmt: Debatten können hart sein, und manchmal wird zu schnell moralisch verurteilt. Aber daraus folgt nicht, dass Widerspruch Zensur ist. Meinungsfreiheit bedeutet, dass der Staat eine Meinung nicht einfach unterdrückt. Sie bedeutet nicht, dass andere Menschen nicht widersprechen, Fakten prüfen, moderieren oder die Wirkung einer Aussage kritisieren dürfen. Opferumkehr verschiebt die Debatte: Nicht mehr der Inhalt steht im Zentrum, sondern die angebliche Unterdrückung der sprechenden Person. Wirkungsökonomisch fragen wir: Was wurde gesagt, welche Wirkung kann es entfalten, und welche Gesprächsregel schützt Freiheit und Menschenwürde zugleich?",
    },
    dontDo: ["Nicht selbst in Beschämung eskalieren.", "Nicht Meinungsfreiheit kleinreden."],
    redirectQuestion: "Was genau durftest du nicht sagen - und wer hat es staatlich verboten?",
    related: ["normalisierung", "medienfeindbild", "zersetzung"],
    claims: [{ title: "Man darf ja nichts mehr sagen", url: "../../live/man-darf-ja-nichts-mehr-sagen/" }, { title: "Das ist Zensur" }, { title: "Cancel Culture verbietet Kritik" }],
  },
  {
    slug: "whataboutism",
    id: "whataboutism",
    title: "Whataboutism",
    shortName: "Whataboutism",
    subtitle: "„Aber was ist mit ...?“",
    riskLevel: "mittel",
    themes: ["klima", "demokratie", "migration", "wirtschaft"],
    resonance: ["trotz", "wut", "misstrauen"],
    riskDimensions: ["diskursfaehigkeit", "demokratie"],
    abstract:
      "Whataboutism lenkt von einer konkreten Aussage oder Verantwortung ab, indem ein anderes Problem ins Zentrum geschoben wird. Der wahre Kern ist: Oft gibt es tatsächlich weitere relevante Probleme. Irreführend wird es, wenn der Verweis nicht zur Erweiterung der Analyse dient, sondern zur Vermeidung der ursprünglichen Frage. Als gesellschaftlicher Wirkstoff zerstreut Whataboutism Aufmerksamkeit und verhindert Verantwortungszuordnung. Wirkungsökonomisch gilt: Mehrere Probleme können gleichzeitig wahr sein. Ein anderes Problem hebt die Wirkung des ersten nicht auf.",
    summary: {
      definition: "Ein Narrativ, das die Ausgangsfrage durch Verweis auf ein anderes Thema ausweicht.",
      typical_message: "Aber was ist mit ...?",
      emotional_hook: "Trotz, Entlastung, Gegenangriff.",
      risk: "Fokus und Verantwortungszuordnung zerfallen.",
      host_principle: "Zur Ausgangsfrage zurückführen.",
    },
    table: {
      kurzform: "„Aber was ist mit…“",
      hauptwirkung: "Fokus zerstreut",
      live_prinzip: "zurück zur Ausgangsfrage",
    },
    definition:
      "Whataboutism kann relevante Vergleichsfragen enthalten, dient aber oft dazu, eine konkrete Verantwortung nicht beantworten zu müssen.",
    phrases: ["Aber China!", "Aber die USA!", "Aber Migration!", "Aber früher war das auch so!", "Aber die anderen machen es auch!"],
    wirkstoff: "Themenwechsel, der Verantwortung und Aufmerksamkeit zerstreut.",
    resonanceText: "Trotz, Gegenangriff, Entlastung von der ursprünglichen Frage.",
    effectSteps: [
      ["Aussage", "Eine konkrete Frage steht im Raum."],
      ["Wirkstoff", "Ein anderes Thema wird als Ausweichbewegung gesetzt."],
      ["Resonanz", "Trotz und Gegenangriff werden aktiviert."],
      ["Wirkungspotenzial", "Die Ausgangsfrage wird nicht mehr beantwortet."],
      ["Wirkungsrisiko", "Verantwortung und Wirkung bleiben ungeklärt."],
      ["Mögliche Wirkung", "Debatten drehen sich, ohne zu lernen."],
    ],
    mpd: {
      mensch: "Konkrete Betroffenheit wird relativiert.",
      planet: "Ökologische Verantwortung kann durch Vergleichsausweichen blockiert werden.",
      demokratie: "Diskursfähigkeit sinkt, weil Fragen nicht mehr abgeschlossen werden.",
    },
    answers: {
      ten_seconds: "Das andere Thema kann wichtig sein. Aber es beantwortet die ursprüngliche Frage nicht.",
      thirty_seconds:
        "Der wahre Kern ist: Es gibt oft mehrere relevante Probleme. Der Denkfehler ist, ein anderes Problem zu nutzen, um die erste Frage zu vermeiden. Bleiben wir kurz bei der Wirkung dieser Aussage.",
      two_minutes:
        "Ich ordne das kurz ein. Vergleiche können sinnvoll sein, und oft gibt es tatsächlich weitere Probleme. Aber Whataboutism verschiebt den Fokus, bevor die Ausgangsfrage geklärt ist. Dann wird aus Analyse ein Themenkarussell: China, USA, Migration, früher, die anderen. Wirkungsökonomisch gilt: Mehrere Probleme können gleichzeitig wahr sein. Die Existenz eines zweiten Problems hebt die Wirkung des ersten nicht auf. Die bessere Gesprächsregel lautet: Wir notieren das zweite Thema - und beantworten zuerst die konkrete Frage, die gerade im Raum steht.",
    },
    dontDo: ["Nicht dem nächsten Thema sofort hinterherlaufen.", "Nicht so tun, als sei das andere Thema automatisch irrelevant."],
    redirectQuestion: "Können wir das zweite Thema gleich nehmen - und zuerst diese konkrete Wirkung klären?",
    related: ["ohnmacht", "verzoegerung", "scheiternsframe"],
    claims: [{ title: "Aber China!" }, { title: "Aber die USA!" }, { title: "Die anderen machen es auch" }],
  },
  {
    slug: "scheiternsframe",
    id: "scheiternsframe",
    title: "Scheiternsframe",
    shortName: "Scheiternsframe",
    subtitle: "„Das ist alles gescheitert.“",
    riskLevel: "hoch",
    themes: ["klima", "energie", "demokratie", "migration"],
    resonance: ["ohnmacht", "wut", "misstrauen"],
    riskDimensions: ["demokratie", "planet", "institutionelles_vertrauen"],
    abstract:
      "Der Scheiternsframe bewertet komplexe Transformationen pauschal als Misserfolg. Er nutzt einzelne Probleme, Verzögerungen oder Kostensteigerungen, um eine ganze Richtung zu delegitimieren. Der wahre Kern ist: Transformationen haben reale Probleme, Zielkonflikte und Fehlsteuerungen. Irreführend wird es, wenn aus einzelnen Schwierigkeiten ein vollständiges Scheitern konstruiert wird. Als gesellschaftlicher Wirkstoff kann der Scheiternsframe Lernfähigkeit zerstören. Wirkungsökonomisch ist entscheidend: Scheitert eine Lösung wirklich - oder zeigt sich ein Engpass, der korrigiert werden muss?",
    summary: {
      definition: "Ein Narrativ, das reale Probleme in ein pauschales Totalurteil verwandelt.",
      typical_message: "Alles ist gescheitert.",
      emotional_hook: "Frust, Ohnmacht, Abbruchimpuls.",
      risk: "Lernfähigkeit wird blockiert.",
      host_principle: "Engpass statt Totalurteil.",
    },
    table: {
      kurzform: "„Alles gescheitert“",
      hauptwirkung: "Lernen wird blockiert",
      live_prinzip: "Engpass statt Totalurteil",
    },
    definition:
      "Der Scheiternsframe verwechselt Engpässe, Fehler oder Zielkonflikte mit dem endgültigen Scheitern eines gesamten Transformationspfads.",
    phrases: [
      "Die Energiewende ist gescheitert.",
      "Integration ist gescheitert.",
      "Klimapolitik ist gescheitert.",
      "Die Demokratie funktioniert nicht mehr.",
    ],
    wirkstoff: "Pauschales Abbruchurteil, das Lernen entwertet.",
    resonanceText: "Frust, Ohnmacht, Wut über Fehler und Kosten.",
    effectSteps: [
      ["Aussage", "Ein Problem wird als Gesamtversagen gedeutet."],
      ["Wirkstoff", "Aus Engpass wird Totalurteil."],
      ["Resonanz", "Frust und Abbruchimpuls steigen."],
      ["Wirkungspotenzial", "Korrektur und Lernen werden unattraktiver."],
      ["Wirkungsrisiko", "Wirksame Teile werden zusammen mit Fehlern delegitimiert."],
      ["Mögliche Wirkung", "Transformation wird abgebrochen statt verbessert."],
    ],
    mpd: {
      mensch: "Verbesserungen bleiben aus, weil Probleme nicht differenziert gelöst werden.",
      planet: "Ökologische Transformation wird durch Totalurteile blockiert.",
      demokratie: "Demokratische Lern- und Korrekturfähigkeit sinkt.",
    },
    answers: {
      ten_seconds: "Probleme sind nicht automatisch Scheitern. Entscheidend ist: Was funktioniert, was nicht, und welcher Engpass begrenzt die Wirkung?",
      thirty_seconds:
        "Der wahre Kern ist: Transformationen haben echte Probleme. Der Denkfehler ist, aus einzelnen Schwierigkeiten ein vollständiges Scheitern zu machen. Wirkungsökonomisch fragen wir: Was muss korrigiert werden, damit die Wirkung besser wird?",
      two_minutes:
        "Ich ordne das kurz ein. Große Veränderungen haben Probleme: Kosten, Planungsfehler, Engpässe, Zielkonflikte, soziale Härten. Diese Kritik ist wichtig. Aber der Scheiternsframe macht daraus ein Totalurteil: Alles gescheitert, also zurück oder gar nichts mehr tun. Wirkungsökonomisch ist das zu grob. Wir müssen unterscheiden: Funktioniert das Ziel? Funktioniert das Instrument? Wo liegt der Engpass? Welche Nebenwirkung muss korrigiert werden? Lernen heißt nicht Schönreden, sondern präzise verbessern. Die bessere Frage lautet: Welche Anpassung erhöht die positive Netto-Wirkung?",
    },
    dontDo: ["Nicht reale Fehler beschönigen.", "Nicht in Ja/Nein über die ganze Transformation rutschen."],
    redirectQuestion: "Welcher konkrete Engpass zeigt sich - und was müsste angepasst werden?",
    related: ["ohnmacht", "verzoegerung", "technikwunder-aufschub"],
    claims: [{ title: "Die Energiewende ist gescheitert" }, { title: "Integration ist gescheitert" }, { title: "Klimapolitik ist gescheitert" }],
  },
  {
    slug: "technikwunder-aufschub",
    id: "technikwunder-aufschub",
    title: "Technikwunder-Aufschub",
    shortName: "Technikwunder-Aufschub",
    subtitle: "„Die neue Technologie löst das später.“",
    riskLevel: "hoch",
    themes: ["technologie", "klima", "energie", "wirtschaft"],
    resonance: ["ohnmacht", "kostenangst", "trotz"],
    riskDimensions: ["planet", "demokratie", "mensch"],
    abstract:
      "Das Technikwunder-Aufschubnarrativ verschiebt heutige Verantwortung auf eine künftige Lösung. Es ist nicht technikfeindlich, neue Technologien ernst zu nehmen. Problematisch wird es, wenn ungewisse Zukunftstechnologien als Ausrede genutzt werden, verfügbare Lösungen nicht umzusetzen. Als gesellschaftlicher Wirkstoff senkt dieses Narrativ Dringlichkeit und stärkt Lock-ins. Wirkungsökonomisch wird Technik nach Zeithorizont, Skalierbarkeit, Nebenwirkungen, Opportunitätskosten und Transformationswirkung bewertet.",
    summary: {
      definition: "Ein Narrativ, das heutiges Handeln durch Hoffnung auf künftige Technologie ersetzt.",
      typical_message: "Technik löst es später.",
      emotional_hook: "Entlastung, Fortschrittsglaube, Aufschub.",
      risk: "Handeln wird verschoben, Lock-ins wachsen.",
      host_principle: "Zeithorizont und Skalierung prüfen.",
    },
    table: {
      kurzform: "„Technik löst es später“",
      hauptwirkung: "Handeln wird verschoben",
      live_prinzip: "Zeithorizont und Skalierung prüfen",
    },
    definition:
      "Technikwunder-Aufschub ist nicht Technikoptimismus, sondern die Nutzung ungewisser Zukunftstechnik als Ausrede gegen verfügbare Wirkung heute.",
    phrases: ["Fusion löst das.", "CO₂-Filter lösen das später.", "Wasserstoff für alles?", "KI wird das schon regeln."],
    wirkstoff: "Zukunftsversprechen, das heutige Dringlichkeit senkt.",
    resonanceText: "Entlastung, Technikvertrauen und Abwehr unbequemer Gegenwartsentscheidungen.",
    effectSteps: [
      ["Aussage", "Eine spätere Technologie wird als Lösung gesetzt."],
      ["Wirkstoff", "Ungewisse Zukunft ersetzt konkrete Gegenwartswirkung."],
      ["Resonanz", "Entlastung und Aufschub fühlen sich vernünftig an."],
      ["Wirkungspotenzial", "Verfügbare Lösungen werden weniger attraktiv."],
      ["Wirkungsrisiko", "Lock-ins, Zeitverlust und Opportunitätskosten steigen."],
      ["Mögliche Wirkung", "Technik kommt zu spät, zu klein oder mit neuen Nebenwirkungen."],
    ],
    mpd: {
      mensch: "Spätere Schäden und Kosten werden auf kommende Generationen verschoben.",
      planet: "Zeitkritische ökologische Wirkung wird verfehlt.",
      demokratie: "Politik verkauft Hoffnung statt überprüfbarer Pfade.",
    },
    answers: {
      ten_seconds: "Forschung ist wichtig. Aber ungewisse Zukunftstechnik ersetzt keine verfügbare Lösung heute.",
      thirty_seconds:
        "Der wahre Kern ist: Neue Technologien können helfen. Der Denkfehler ist, daraus einen Aufschub für heutige Lösungen zu machen. Wirkungsökonomisch prüfen wir: Wirkt die Technik rechtzeitig, skalierbar, bezahlbar und mit positiver Netto-Wirkung?",
      two_minutes:
        "Ich ordne das kurz ein. Technik ist zentral, und Forschung kann enorme Wirkung entfalten. Aber das Technikwunder-Narrativ nutzt zukünftige Möglichkeiten, um heutige Verantwortung zu verschieben. Das ist riskant, weil Zeit, Infrastruktur und Investitionen selbst Wirkfaktoren sind. Eine Technologie kann vielversprechend sein und trotzdem zu spät kommen, zu teuer bleiben, nicht skalieren oder neue Nebenwirkungen erzeugen. Wirkungsökonomisch vergleichen wir deshalb nicht Traum gegen Gegenwart, sondern Pfad gegen Pfad: Was wirkt bis wann, in welcher Größenordnung, mit welchen Kosten und welchen Opportunitätskosten?",
    },
    dontDo: ["Nicht technikfeindlich klingen.", "Nicht Forschung gegen Umsetzung ausspielen."],
    redirectQuestion: "Bis wann skaliert diese Technik - und was tun wir bis dahin?",
    related: ["verzoegerung", "scheiternsframe", "ohnmacht"],
    claims: [{ title: "Fusion löst das später" }, { title: "Wasserstoff für alles?" }, { title: "CO₂-Filter lösen das" }],
  },
  {
    slug: "normalisierung",
    id: "normalisierungsnarrativ",
    title: "Normalisierungsnarrativ",
    shortName: "Normalisierung",
    subtitle: "„Das wird man ja wohl noch sagen dürfen.“",
    riskLevel: "hoch",
    themes: ["demokratie", "medien", "migration"],
    resonance: ["trotz", "identitaet", "kraenkung"],
    riskDimensions: ["diskursfaehigkeit", "minderheitenschutz", "demokratie"],
    abstract:
      "Normalisierungsnarrative verschieben Grenzen des Sagbaren, indem problematische Aussagen als bloß normale Meinung oder Tabubruch dargestellt werden. Der wahre Kern ist: Demokratien brauchen offene Debatte und müssen auch unbequeme Positionen aushalten. Problematisch wird es, wenn Abwertung, Desinformation oder Entmenschlichung als mutige Ehrlichkeit inszeniert werden. Als gesellschaftlicher Wirkstoff kann Normalisierung Diskursstandards senken und Radikalisierung vorbereiten. Wirkungsökonomisch zählt nicht nur, ob etwas gesagt werden darf, sondern welche Wirkung es im öffentlichen Raum entfaltet.",
    summary: {
      definition: "Ein Narrativ, das problematische Aussagen als bloß normale Meinung oder mutigen Tabubruch rahmt.",
      typical_message: "Das wird man ja wohl noch sagen dürfen.",
      emotional_hook: "Trotz, Identität, Provokation.",
      risk: "Grenzen verschieben sich, Abwertung wird anschlussfähiger.",
      host_principle: "Erlaubt, wahr und wirkungsarm unterscheiden.",
    },
    table: {
      kurzform: "„Wird man sagen dürfen“",
      hauptwirkung: "Grenzen verschieben sich",
      live_prinzip: "erlaubt ≠ wahr ≠ wirkungsarm",
    },
    definition:
      "Normalisierung macht aus einer Aussage, deren Wahrheit und Wirkung geprüft werden müsste, einen Streit über bloße Sagbarkeit.",
    phrases: [
      "Das wird man ja wohl noch sagen dürfen.",
      "Ich sage nur, was viele denken.",
      "Endlich spricht es jemand aus.",
      "Das ist doch nur gesunder Menschenverstand.",
      "Man muss auch mal provozieren dürfen.",
    ],
    wirkstoff: "Sagbarkeitsframe, der Inhalt und Wirkung zweitrangig macht.",
    resonanceText: "Trotz, Identitätsgefühl, Lust am Tabubruch und Abwehr von Kritik.",
    effectSteps: [
      ["Aussage", "Eine problematische Aussage wird als Tabubruch inszeniert."],
      ["Wirkstoff", "Sagbarkeit verdrängt Wahrheits- und Wirkungsprüfung."],
      ["Resonanz", "Trotz und Zugehörigkeit werden aktiviert."],
      ["Wirkungspotenzial", "Diskursgrenzen verschieben sich."],
      ["Wirkungsrisiko", "Abwertung und Desinformation werden normaler."],
      ["Mögliche Wirkung", "Radikalisierung wird vorbereitet oder enthemmt."],
    ],
    mpd: {
      mensch: "Abgewertete Gruppen tragen die Kosten verschobener Grenzen.",
      planet: "Desinformation kann als Tabubruch normalisiert werden.",
      demokratie: "Diskursstandards und Minderheitenschutz werden geschwächt.",
    },
    answers: {
      ten_seconds: "Man darf viel sagen. Die Frage ist nicht nur, ob es erlaubt ist, sondern ob es wahr ist und welche Wirkung es hat.",
      thirty_seconds:
        "Der wahre Kern ist: Offene Debatte ist wichtig. Der Denkfehler ist, Sagbarkeit mit Wahrheit oder Unschädlichkeit gleichzusetzen. Wirkungsökonomisch fragen wir: Was wird normalisiert - und welche Wirkung hat das auf Menschen und Demokratie?",
      two_minutes:
        "Ich ordne das kurz ein. Demokratie braucht offene Debatte, auch unbequeme Kritik. Aber der Satz „das wird man ja wohl noch sagen dürfen“ verschiebt oft die Frage. Es geht dann nicht mehr darum, ob die Aussage stimmt, wen sie trifft oder welche Wirkung sie entfaltet, sondern nur noch darum, ob sie gesagt werden darf. Das ist zu wenig. Viele Dinge sind rechtlich erlaubt und trotzdem falsch, entmenschlichend oder demokratisch schädlich. Wirkungsökonomisch prüfen wir deshalb drei Ebenen: Ist es erlaubt? Ist es wahr? Und welche Wirkung entfaltet es im öffentlichen Raum?",
    },
    dontDo: ["Nicht die rechtliche Sagbarkeit bestreiten.", "Nicht nur moralisch reagieren."],
    redirectQuestion: "Okay, es darf gesagt werden - aber stimmt es, und welche Wirkung hat es?",
    related: ["opferumkehr", "suendenbock", "zersetzung"],
    claims: [{ title: "Das wird man ja wohl noch sagen dürfen" }, { title: "Ich sage nur, was viele denken" }, { title: "Man darf ja nichts mehr sagen", url: "../../live/man-darf-ja-nichts-mehr-sagen/" }],
  },
  {
    slug: "co2-preis-abzocke",
    id: "co2-preis-abzocke",
    title: "CO₂-Preis-Abzocke",
    shortName: "CO₂-Preis",
    subtitle: "Wenn ein Lenkungsinstrument als reine Belastung geframt wird",
    riskLevel: "hoch",
    themes: ["klima", "energie", "wirtschaft", "demokratie"],
    resonance: ["kostenangst", "misstrauen", "kontrollverlust"],
    riskDimensions: ["mensch", "planet", "demokratie", "institutionelles_vertrauen"],
    abstract:
      "Das CO₂-Preis-Abzocke-Narrativ stellt CO₂-Bepreisung als willkürliche Belastung der Bürger:innen dar. Der wahre Kern ist: Fossile Energie wird durch CO₂-Bepreisung zunächst sichtbar teurer und kann Haushalte belasten, wenn soziale Rückverteilung und Alternativen fehlen. Irreführend wird das Narrativ, wenn es die unsichtbaren fossilen Systemkosten ausblendet: Klimaschäden, Gesundheitskosten durch Luftschadstoffe, Importabhängigkeit, Preisschocks und geopolitische Risiken. Wirkungsökonomisch ist entscheidend: Nicht der Preis allein ist das Problem, sondern ob die Einnahmen gerecht rückverteilt, wirksam investiert und fossile Abhängigkeiten tatsächlich reduziert werden.",
    summary: {
      definition: "Ein Narrativ, das CO₂-Bepreisung als reine Abzocke rahmt und fossile Folgekosten ausblendet.",
      typical_message: "Der CO₂-Preis ist nur Abzocke.",
      emotional_hook: "Kostenangst, Misstrauen gegen Staat, Kontrollverlust.",
      risk: "Akzeptanz für wirksame Rückkopplung und Transformation sinkt.",
      host_principle: "Belastung anerkennen, fossile Systemkosten sichtbar machen.",
    },
    table: {
      kurzform: "„Abzocke“",
      hauptwirkung: "Akzeptanz sinkt",
      live_prinzip: "sichtbare und unsichtbare Rechnung vergleichen",
    },
    definition:
      "Das CO₂-Preis-Abzocke-Narrativ macht aus einem Lenkungs- und Finanzierungsinstrument eine reine Belastungserzählung. Es erkennt sichtbare Kosten, blendet aber fossile Systemkosten aus.",
    phrases: [
      "Der CO₂-Preis ist nur Abzocke.",
      "Klimaschutz macht alles unbezahlbar.",
      "Der Staat will nur kassieren.",
      "Die Bürger zahlen für Ideologie.",
      "CO₂-Steuer bringt dem Klima nichts.",
      "Ohne CO₂-Preis wäre Energie billig.",
    ],
    wirkstoff:
      "Sichtbarer Preis wird als Zusatzbelastung gerahmt, während unsichtbare fossile Folgekosten ausgeblendet werden.",
    resonanceText: "Kostenangst, Misstrauen gegen Staat, Kontrollverlust und Entlastungswunsch.",
    effectSteps: [
      ["Aussage", "Der CO₂-Preis ist Abzocke."],
      ["Wirkstoff", "Sichtbarer Preis als Empörungsimpuls."],
      ["Ausblendung", "Klimaschäden, Luftschadstoffe, Importabhängigkeit, Krisenkosten und fossile Preisrisiken verschwinden."],
      ["Resonanz", "Kostenangst, Misstrauen gegen Staat, Kontrollverlust."],
      ["Narrativ", "Klimapolitik nimmt uns Geld weg."],
      ["Wirkungspotenzial", "Unterstützung für CO₂-Bepreisung, Klimaschutz und Transformation sinkt."],
      ["Wirkungsrisiko", "Fossile Abhängigkeit bleibt länger bestehen und spätere Systemkosten steigen."],
      ["Wirkung dritter Ordnung", "Der Markt bleibt wirkungsblind: Fossile Nutzung wirkt billig, obwohl ihre Folgekosten real sind."],
    ],
    mpd: {
      mensch: "Soziale Härten können real sein; ohne Steuerung steigen aber Gesundheits-, Schadens- und Krisenkosten.",
      planet: "Fossile Nutzung bleibt länger attraktiv, wenn ihre Folgekosten unsichtbar bleiben.",
      demokratie: "Misstrauen wächst, wenn Rückverteilung, Einnahmen und Wirkung nicht transparent sind.",
    },
    answers: {
      ten_seconds:
        "Der CO₂-Preis ist sichtbar. Die fossilen Folgekosten sind oft unsichtbar - Klimaschäden, Krankheit, Importe und Krisen zahlen wir trotzdem.",
      thirty_seconds:
        "Der wahre Kern ist: CO₂-Bepreisung kann Haushalte belasten. Der Denkfehler ist: Daraus wird reine Abzocke, während fossile Systemkosten verschwinden. Wirkungsökonomisch fragen wir: Wird sozial zurückverteilt, wirksam investiert und fossile Abhängigkeit wirklich reduziert?",
      two_minutes:
        "Ich ordne das sauber ein. Ein CO₂-Preis kann eine Belastung sein, vor allem wenn Menschen keine Alternativen haben oder Rückverteilung fehlt. Das darf man nicht kleinreden. Aber daraus folgt nicht, dass fossile Energie ohne CO₂-Preis billig wäre. Die Kosten entstehen trotzdem: Klimaschäden, Luftschadstoffe, Gesundheitskosten, fossile Importabhängigkeit, Preisschocks und Sicherheitsrisiken. Der CO₂-Preis macht einen Teil dieser Wirkung sichtbar und kann Einnahmen schaffen, die für Entlastung, Infrastruktur und Transformation genutzt werden. Die entscheidende Frage ist also nicht: Preis oder keine Kosten? Sondern: Wie gestalten wir die Rückkopplung fair, wirksam und transparent?",
    },
    dontDo: [
      "Nicht sagen: CO₂-Preis ist keine Belastung.",
      "Nicht soziale Härten kleinreden.",
      "Nicht CO₂-Preis und Klimaschäden als identische Kostenart behandeln.",
    ],
    redirectQuestion:
      "Vergleichst du den sichtbaren CO₂-Preis mit null Kosten - oder mit den realen fossilen Folgekosten?",
    related: ["verbotsnarrativ", "kontrollverlust", "ohnmacht", "verzoegerung", "scheiternsframe"],
    claims: [
      { title: "CO₂-Preis oder fossile Systemkosten?", url: "../../live/co2-preis-oder-fossile-systemkosten/" },
      { title: "Deutschland ist nur für 2 % verantwortlich", url: "../../live/deutschland-nur-zwei-prozent/" },
      { title: "Klimaschutz ist Ökodiktatur" },
    ],
  },
  {
    slug: "zersetzung",
    id: "zersetzungsnarrativ",
    title: "Zersetzungsnarrativ",
    shortName: "Zersetzung",
    subtitle: "„Dieses System ist am Ende.“",
    riskLevel: "sehr hoch",
    themes: ["demokratie", "medien", "wirtschaft"],
    resonance: ["ohnmacht", "wut", "misstrauen"],
    riskDimensions: ["demokratie", "rechtsstaat", "institutionelles_vertrauen"],
    abstract:
      "Das Zersetzungsnarrativ stellt demokratische Institutionen, Rechtsstaat, Medien oder Wissenschaft als grundsätzlich kaputt dar. Der wahre Kern ist: Demokratien haben reale Schwächen, Institutionen brauchen Kritik und Reform. Gefährlich wird es, wenn Kritik nicht auf Verbesserung zielt, sondern auf Delegitimierung des gesamten demokratischen Korrektursystems. Als gesellschaftlicher Wirkstoff erzeugt das Narrativ Misstrauen, Zynismus und autoritäre Sehnsucht. Wirkungsökonomisch ist die entscheidende Unterscheidung: Reformkritik stärkt Demokratie. Zersetzung schwächt sie.",
    summary: {
      definition: "Ein Narrativ, das Reformkritik in pauschale Delegitimierung demokratischer Institutionen verwandelt.",
      typical_message: "Das System ist am Ende.",
      emotional_hook: "Zynismus, Wut, Ohnmacht.",
      risk: "Demokratisches Vertrauen sinkt.",
      host_principle: "Reformkritik von Delegitimierung trennen.",
    },
    table: {
      kurzform: "„System am Ende“",
      hauptwirkung: "demokratisches Vertrauen sinkt",
      live_prinzip: "Reformkritik von Delegitimierung trennen",
    },
    definition:
      "Zersetzung richtet Kritik nicht auf bessere Verfahren, sondern auf die Delegitimierung des demokratischen Korrektursystems selbst.",
    phrases: [
      "Diese Demokratie funktioniert nicht mehr.",
      "Alle Parteien sind gleich.",
      "Der Rechtsstaat ist nur Fassade.",
      "Wahlen bringen nichts.",
      "Das System muss weg.",
    ],
    wirkstoff: "Zynismusframe, der demokratische Korrektur für sinnlos erklärt.",
    resonanceText: "Ohnmacht, Wut, Misstrauen und Sehnsucht nach radikaler Vereinfachung.",
    effectSteps: [
      ["Aussage", "Institutionen werden als grundsätzlich kaputt dargestellt."],
      ["Wirkstoff", "Reformkritik kippt in Delegitimierung."],
      ["Resonanz", "Zynismus und autoritäre Sehnsucht werden wahrscheinlicher."],
      ["Wirkungspotenzial", "Beteiligung, Vertrauen und Korrekturbereitschaft sinken."],
      ["Wirkungsrisiko", "Rechtsstaat und demokratische Verfahren verlieren Bindungskraft."],
      ["Mögliche Wirkung", "Autoritäre oder destruktive Lösungen werden normalisiert."],
    ],
    mpd: {
      mensch: "Rechte, Teilhabe und Schutzmechanismen werden fragiler.",
      planet: "Langfristige Problemlösung verliert institutionelle Grundlage.",
      demokratie: "Rechtsstaat, Vertrauen und Korrekturfähigkeit werden geschwächt.",
    },
    answers: {
      ten_seconds: "Kritik an Institutionen ist wichtig. Aber Reformkritik und Zersetzung sind nicht dasselbe.",
      thirty_seconds:
        "Der wahre Kern ist: Demokratien haben reale Schwächen. Der Denkfehler ist, daraus die Nutzlosigkeit des gesamten Systems abzuleiten. Die bessere Frage lautet: Welche konkrete Veränderung stärkt Rechtsstaat, Teilhabe und Vertrauen?",
      two_minutes:
        "Ich ordne das kurz ein. Demokratien sind nicht perfekt. Parteien, Medien, Gerichte, Verwaltung und Parlamente brauchen Kritik, Kontrolle und Reform. Aber das Zersetzungsnarrativ geht einen Schritt weiter: Es erklärt das gesamte demokratische Korrektursystem für kaputt oder sinnlos. Dann erscheinen Wahlen, Rechtsstaat, Faktencheck und Kompromiss nur noch als Fassade. Wirkungsökonomisch ist das hochriskant, weil Demokratie gerade von Korrekturfähigkeit lebt. Die bessere Unterscheidung lautet: Reformkritik benennt konkrete Fehler und verbessert Verfahren. Zersetzung nimmt Menschen das Vertrauen, dass Verbesserung überhaupt möglich ist.",
    },
    dontDo: ["Nicht reale Demokratieprobleme wegwischen.", "Nicht den Systemframe übernehmen."],
    redirectQuestion: "Welche konkrete Reform würde Rechtsstaat, Teilhabe und Vertrauen stärken?",
    related: ["normalisierung", "elitenverschwoerung", "medienfeindbild", "suendenbock"],
    claims: [{ title: "Diese Demokratie funktioniert nicht mehr" }, { title: "Alle Parteien sind gleich" }, { title: "Wahlen bringen nichts" }],
  },
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripQuotes(value) {
  return String(value ?? "").replace(/[„“"]/g, "");
}

function words(value) {
  return String(value ?? "").split(/\s+/).filter(Boolean).length;
}

function sentence(value) {
  const text = String(value ?? "");
  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
}

function attrList(values) {
  return escapeHtml((values || []).join(" "));
}

const psychologyNotice =
  "Psychologische Effekte sind keine Diagnose einzelner Personen. Sie beschreiben allgemeine menschliche Wahrnehmungs- und Kommunikationsmuster. Der Wirkungsradar nutzt sie, um Frames, Resonanzräume und Wirkungsrisiken sichtbar zu machen - nicht um Menschen abzuwerten.";

const hostControlSteps = [
  "Stoppen: nicht sofort in den Köder springen.",
  "Frame markieren: Ich beantworte das, aber ich übernehme nicht den Frame.",
  "Wahren Kern anerkennen.",
  "Denkfehler oder psychologisches Muster benennen.",
  "Zur Wirkungsfrage zurückführen.",
  "Konkrete Lösung verlangen.",
];

function renderHostControlCard() {
  return `<article class="card">
                <p class="card-kicker">Kommunikative Kontrolle</p>
                <h3 class="card-title">Gefühl anerkennen. Frame halten. Wirkungsfrage stellen.</h3>
                <ul class="clean-list">${hostControlSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ul>
                <p class="card-text"><strong>Standardsatz:</strong> Ich sehe den emotionalen Punkt. Aber ich trenne Gefühl, Fakt und Folgerung.</p>
              </article>`;
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
    <meta name="search_type" content="Narrativbibliothek">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260605-wirkungsraum-stage7}">
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
        <a href="${base}so-wirkt-wirkungsoekonomie/" data-nav-match="so-wirkt-wirkungsoekonomie/|so-wirkt-wirkungsoekonomie.html">So wirkt WÖk</a>
        <a href="${base}wirkungsfelder/" data-nav-match="wirkungsfelder/|anwendungen.html">Wirkungsfelder</a>
        <a href="${base}werkzeuge/" data-nav-match="werkzeuge/|tools/|methodik/|workflow.html">Methoden &amp; Werkzeuge</a>
        <a href="${base}erleben/" data-nav-match="erleben.html|erleben/|ausprobieren/">Erleben</a>
        <a href="${base}akademie.html" data-nav-match="akademie.html|akademie/">Akademie</a>
        <a href="${base}downloads.html" data-nav-match="werkstatt/|downloads.html|downloads/|dokumente/|referenz/|buch.html|buch/|evidenz/|quellen/|fachbibliothek/">Bibliothek</a>
        <a href="${base}mitmachen.html" data-nav-match="mitmachen.html|mitmachen/|fuer/">Mitmachen</a>
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
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage7"></script>
  </body>
</html>
`;
}

function topicSubnav(current, baseToRadar) {
  const links = [
    ["Überblick", "../"],
    ["Methode", "../methode/"],
    ["Wissen", "../wissen/"],
    ["Live", "../live/"],
    ["Narrative", "../narrative/"],
    ["Psychologie", "../psychologie/"],
    ["Themen", "../themen/"],
    ["Detail", "../detail/"],
    ["Was er nicht ist", "../was-der-wirkungsradar-nicht-ist/"],
  ];
  return `<nav class="topic-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude>
${links
  .map(([label, href]) => {
    const active = label === current ? ' aria-current="page"' : "";
    return `        <a href="${baseToRadar}${href}"${active}>${label}</a>`;
  })
  .join("\n")}
      </nav>`;
}

function summaryGrid(items, label, className = "narrative-summary-grid") {
  return `<div class="radar-summary-grid ${className}" aria-label="${escapeHtml(label)}">
${items
  .map(
    (item) =>
      `          <article class="radar-summary-item" data-tone="${escapeHtml(item.tone || "neutral")}"><p class="radar-summary-label">${escapeHtml(item.label)}</p><p class="radar-summary-value">${item.value}</p></article>`
  )
  .join("\n")}
        </div>`;
}

function stoeckchenModule() {
  return `<section class="section section-soft stoeckchen-module" id="stoeckchen-erkennung">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Stöckchen-Erkennung</p>
            <h2>Woran erkenne ich ein Stöckchen?</h2>
            <p>Ein Stöckchen ist eine Aussage, die weniger auf Klärung als auf Frame-Übernahme zielt. Wer hineinspringt, diskutiert oft nicht mehr über das eigentliche Problem, sondern über den vom Gegenüber gesetzten Deutungsrahmen.</p>
          </div>
          ${summaryGrid(
            [
              { label: "Frame-Verschiebung", value: "Plötzlich geht es nicht mehr um die Sache, sondern um angebliche Zensur, Verrat oder Kontrolle.", tone: "warning" },
              { label: "Endlose Ausweichbewegung", value: "Sobald ein Punkt geklärt ist, wird ein neues Thema aufgemacht.", tone: "warning" },
              { label: "Falsche Voraussetzung", value: "Die Frage enthält bereits eine unbelegte Behauptung.", tone: "critical" },
              { label: "Emotion vor Klärung", value: "Die Aussage ist so gebaut, dass sie Wut, Trotz oder Abwehr aktiviert.", tone: "critical" },
              { label: "Host-Satz", value: "Ich beantworte das, aber ich übernehme nicht den Frame.", tone: "positive" },
              { label: "Ziel", value: "Einordnen, zurückführen und handlungsfähig bleiben.", tone: "positive" },
            ],
            "Stöckchen-Erkennung",
            "stoeckchen-warning-grid"
          )}
        </div>
      </section>`;
}

const languageMechanismCards = [
  ["Frame", "Ein Frame ist ein Deutungsrahmen, der entscheidet, wie ein Thema wahrgenommen wird."],
  ["Trigger", "Bestimmte Wörter aktivieren Angst, Wut, Kränkung, Trotz, Kontrollverlust oder Zugehörigkeit."],
  ["Wirkung", "Sprache kann Vertrauen stärken oder untergraben, Feindbilder erzeugen oder abbauen, Handlungsfähigkeit öffnen oder blockieren."],
  ["Gegenstrategie", "Nicht spiegeln, nicht beschämen, nicht eskalieren - sondern entwirren, einordnen und in Richtung Lösung zurückführen."],
];

const languagePatterns = [
  {
    name: "Bedrohungsnarrativ",
    definition: "Ein Sprachmuster, das gesellschaftliche Veränderungen als existenzielle Gefahr rahmt.",
    triggers: "Überfremdung, Masseneinwanderung, Bevölkerungsaustausch, Remigration, Identitätsverlust, kulturelle Verdrängung, unkontrollierte Migration, Asylmissbrauch, Parallelgesellschaften",
    emotion: "Angst, Abwehr, Schutzbedürfnis",
    risk: "Migration erscheint nicht mehr als politische Gestaltungsaufgabe, sondern als Bedrohungserzählung.",
    families: [["Sündenbock", "suendenbock"], ["Kontrollverlust", "kontrollverlust"], ["Zersetzung", "zersetzung"]],
    answer: "Probleme benennen, aber Feindbildlogik trennen. Migration als Steuerungs-, Integrations- und Rechtsstaatsfrage erklären statt als Untergangserzählung.",
  },
  {
    name: "Opfer-Narrativ",
    definition: "Ein Sprachmuster, das die eigene Gruppe als mutige, unterdrückte Wahrheitssprecherin inszeniert.",
    triggers: "Altparteien, Kartellparteien, Meinungsdiktatur, Gesinnungskontrolle, politische Korrektheit, Unterdrückung abweichender Meinungen",
    emotion: "Kränkung, Selbstaufwertung, Trotz",
    risk: "Kritik erscheint als Zensur, Widerspruch als Verfolgung.",
    families: [["Opferumkehr", "opferumkehr"], ["Medienfeindbild", "medienfeindbild"], ["Zersetzung", "zersetzung"]],
    answer: "Meinungsfreiheit von Widerspruchsfreiheit trennen. Kritik ist keine Zensur.",
  },
  {
    name: "Wir-gegen-die-Narrativ",
    definition: "Ein Sprachmuster, das die Gesellschaft in ein gutes, echtes Wir und ein bedrohliches oder korrumpiertes Sie aufteilt.",
    triggers: "Volk, Eliten, Establishment, Patrioten, Ideologen, deutsche Interessen, deutsche Leitkultur, kulturelle Identität",
    emotion: "Gruppenbindung, Abgrenzung, Feindbildbildung",
    risk: "Pluralismus wird zum Lagerkampf, Kompromiss erscheint als Verrat.",
    families: [["Sündenbock", "suendenbock"], ["Elitenverschwörung", "elitenverschwoerung"], ["Normalisierung", "normalisierung"]],
    answer: "Demokratie als Raum legitimer Unterschiede und fairer Konkurrenz erklären, nicht als Kampf zwischen echten und falschen Bürgern.",
  },
  {
    name: "Niedergangs-Narrativ",
    definition: "Ein Sprachmuster, das Gegenwart als Verfall und Vergangenheit als verlorene Ordnung erzählt.",
    triggers: "Verfall, Niedergang, Krise der Identität, Selbsthass, Identitätsstörung, kulturelle Dekadenz",
    emotion: "Verlustangst, Nostalgie, Radikalisierungsbereitschaft",
    risk: "Radikale Gegenmaßnahmen erscheinen plausibel.",
    families: [["Scheiternsframe", "scheiternsframe"], ["Zersetzung", "zersetzung"], ["Ohnmacht", "ohnmacht"]],
    answer: "Probleme konkret machen, aber Totalurteile vermeiden. Engpässe, Ursachen und Verbesserungen benennen statt Untergang zu verstärken.",
  },
  {
    name: "Kulturkampf-Narrativ",
    definition: "Ein Sprachmuster, das gesellschaftliche Vielfalt als ideologischen Angriff auf Normalität, Familie oder Kinder deutet.",
    triggers: "Gender-Ideologie, Frühsexualisierung, woke, linke Ideologie, Umerziehung",
    emotion: "Empörung, Ekel, Schutzinstinkt",
    risk: "Pluralismus wird als Feindbild gerahmt, Minderheiten werden symbolisch unter Druck gesetzt.",
    families: [["Normalisierung", "normalisierung"], ["Medienfeindbild", "medienfeindbild"], ["Wissenschaftsdelegitimierung", "wissenschaftsdelegitimierung"]],
    answer: "Nicht jede Provokation spiegeln. Sachlich erklären, welche realen Fragen verhandelt werden, und Angstbilder von tatsächlichem Kinderschutz oder Bildungsfragen trennen.",
  },
  {
    name: "Sicherheits-Narrativ",
    definition: "Ein Sprachmuster, das Unsicherheit emotional stark mit Migration, Ordnung und hartem Durchgreifen verknüpft.",
    triggers: "Task Force Abschiebungen, Null-Toleranz, starker Staat, Law and Order, Grenzschutz",
    emotion: "Kontrollsehnsucht, Härtebereitschaft",
    risk: "Rechtsstaatliche Verfahren erscheinen als Hindernis, nicht als Schutz.",
    families: [["Kontrollverlust", "kontrollverlust"], ["Verbotsnarrativ", "verbotsnarrativ"], ["Zersetzung", "zersetzung"]],
    answer: "Sicherheit ernst nehmen, aber Ursachen differenzieren. Rechtsstaat und Wirksamkeit zusammendenken statt autoritäre Vereinfachung zu übernehmen.",
  },
  {
    name: "Demokratie-Umdeutungs-Narrativ",
    definition: "Ein Sprachmuster, das Demokratie fast nur noch als unmittelbaren Mehrheitswillen darstellt und Sicherungen als Störung markiert.",
    triggers: "Volkswille als einzige Legitimation, Mehrheit gegen Eliten, Medien und Gerichte als Blockierer",
    emotion: "Wut auf Institutionen, Vereinfachungssehnsucht",
    risk: "Liberale Demokratie wird auf Mehrheitsdurchsetzung reduziert.",
    families: [["Zersetzung", "zersetzung"], ["Elitenverschwörung", "elitenverschwoerung"], ["Medienfeindbild", "medienfeindbild"]],
    answer: "Demokratie nicht nur als Mehrheit, sondern als Zusammenspiel von Rechten, Kontrolle, Opposition, Gewaltenteilung und Schutz vor Machtmissbrauch erklären.",
  },
];

const triggerRows = [
  ["Altparteien", "alle anderen als Block", "Misstrauen, Wut", "demokratische Konkurrenz wirkt illegitim", "Welche konkrete Entscheidung kritisieren wir - und welche Kontrolle gibt es?"],
  ["Remigration", "Rückführung als Ordnungserzählung", "Härtebereitschaft", "Menschenrechte und Verfahren werden ausgeblendet", "Welche rechtsstaatliche Maßnahme ist gemeint und wen betrifft sie?"],
  ["Identitätsverlust", "Kultur als bedrohtes Eigentum", "Verlustangst", "Pluralismus wirkt wie Gefahr", "Welche konkrete Praxis soll geschützt werden - ohne andere abzuwerten?"],
  ["Überfremdung", "Fremde als Bedrohung", "Angst, Abwehr", "Gruppen werden pauschal problematisiert", "Welche konkrete Aufgabe liegt vor: Wohnen, Schule, Verwaltung, Integration?"],
  ["Meinungsdiktatur", "Widerspruch als Unterdrückung", "Kränkung, Trotz", "Kritik wird mit Zensur verwechselt", "Was darf nicht gesagt werden - oder wird nur widersprochen?"],
  ["Gender-Ideologie", "Vielfalt als Umerziehung", "Empörung, Schutzinstinkt", "Minderheiten werden zum Symbolfeind", "Welche reale Bildungs- oder Schutzfrage wird verhandelt?"],
  ["politische Korrektheit", "Rücksicht als Sprachkontrolle", "Trotz, Abwehr", "Respekt wird als Zwang gerahmt", "Geht es um Verbot oder um Verantwortung für Wirkung?"],
  ["Bevölkerungsaustausch", "Verschwörung statt Migration", "Angst, Feindbildbindung", "demokratische Debatte kippt in Entmenschlichung", "Welche belegbare Entwicklung wird behauptet?"],
  ["Leitkultur", "Zugehörigkeit über Norm", "Stolz, Abgrenzung", "Gleichheit vor dem Recht wird kulturell verengt", "Welche gemeinsamen Regeln gelten für alle?"],
  ["patriotische Kulturpolitik", "Kultur als Besitzstand", "Zugehörigkeit, Statusschutz", "Kunst und Bildung werden politisch sortiert", "Wie bleibt Kultur frei, vielfältig und zugänglich?"],
  ["man wird ja wohl noch sagen dürfen", "Tabubruch als Mut", "Kränkung, Selbstaufwertung", "Widerspruch erscheint als Verfolgung", "Ja - und welche Folgen hat diese Formulierung?"],
  ["wir dürfen nichts mehr sagen", "Schweigen trotz Öffentlichkeit", "Opfergefühl", "Diskursregeln werden delegitimiert", "Wer hindert wen konkret - und was ist nur Widerspruch?"],
];

const emotionRows = [
  ["Angst", "Kontrollverlust, Masseneinwanderung, letzte Chance", "Schutzbedürfnis, Härtebereitschaft"],
  ["Wut", "Altparteien, verraten, bevormundet", "Feindbildbindung, Kompromissverlust"],
  ["Kränkung", "man darf nichts mehr sagen, Meinungsdiktatur", "Opferidentität, Immunisierung gegen Kritik"],
  ["Ekel / Abwertung", "pervers, kulturfremd, entartet, versifft", "Distanz, Entmenschlichungstendenz"],
  ["Stolz / Zugehörigkeit", "Volk, Heimat, unsere Kultur, normale Bürger", "Gruppenbindung, moralische Selbstaufwertung"],
];

const democraticPrinciples = [
  ["Nicht jeden Trigger amplifizieren", "Rechte Kommunikation lebt von Provokation, Empörung und Wiederholung. Nicht jeder Begriff gehört in Überschrift, Caption oder Aufmacher."],
  ["Nicht den Frame verneinen, sondern ersetzen", "Nicht: Wir leben nicht in einer Diktatur. Besser: Demokratische Verfahren sind langsam, kontrollierbar und verbesserbar - genau das unterscheidet sie von autoritärer Macht."],
  ["Nicht Wähler beschämen, sondern Mechanismen offenlegen", "Pauschale Abwertung stärkt den Opferframe. Besser: Diese Sprache nimmt reale Sorgen auf, lenkt sie aber auf Sündenböcke statt auf Lösungen."],
  ["Reale Probleme nicht leugnen", "Wohnungsnot, Schulprobleme, Bürokratie, Überforderung, Sicherheitsfragen und Abstiegsangst müssen ernst genommen werden."],
  ["Von Alarm zu Handlungsfähigkeit wechseln", "Nicht beschwichtigen. Sondern zeigen: Was verbessert sich konkret? Für wen? Bis wann? Woran messbar?"],
  ["Grenzen klar ziehen, aber ohne Gegenverachtung", "Menschenwürde, Rechtsstaat und Gewaltfreiheit sind nicht verhandelbar. Aber Gegenkommunikation darf selbst nicht entmenschlichen."],
  ["Zwischen Strategie, Kadern und Publikum unterscheiden", "Nicht alle Menschen, die auf rechte Sprache reagieren, sind ideologische Kader. Unterschiedliche Zielgruppen brauchen unterschiedliche Ansprache."],
  ["Vom Feindbild zur Wirkungsfrage wechseln", "Nicht: Wer ist schuld? Sondern: Welche Maßnahme verbessert den Zustand messbar - ohne Menschen gegeneinanderzustellen?"],
];

const avoidCounterCommunication = [
  "Frame endlos wiederholen",
  "nur empört reagieren",
  "reale Probleme wegreden",
  "Menschen pauschal beschämen",
  "alle in einen Topf werfen",
  "nur moralisch, aber nicht lösungsorientiert argumentieren",
  "Provokationen mit Reichweite belohnen",
  "rechte Kampfbegriffe prominent übernehmen",
];

const counterFrames = [
  ["Gegen Altparteien", "Demokratie besteht aus Konkurrenz, Kontrolle und Abwahl - nicht aus der Erzählung, alle anderen seien ein Block."],
  ["Gegen man darf nichts mehr sagen", "Man darf sehr viel sagen. Aber andere dürfen widersprechen. Widerspruch ist keine Zensur."],
  ["Gegen Migration ist die Ursache aller Probleme", "Migration erzeugt Aufgaben. Aber Wohnungsnot, Schulprobleme, Fachkräftemangel und Verwaltungsversagen haben mehrere Ursachen. Wer alles einer Gruppe zuschiebt, verhindert Lösungen."],
  ["Gegen Klimadiktatur", "Klimapolitik muss sozial gerecht und demokratisch kontrolliert sein. Aber Risiken verschwinden nicht, wenn man sie Kulturkampf nennt."],
  ["Gegen Gender-Ideologie", "Kinder brauchen Schutz, Bildung und stabile Beziehungen. Dafür brauchen wir Sachlichkeit statt Angstbilder."],
  ["Gegen nur wir vertreten das Volk", "Kein Teil der Demokratie besitzt das Volk. Demokratie heißt, dass verschiedene Bürger verschiedene Parteien wählen dürfen."],
];

function languageWirkstoffSection() {
  return `<section class="section section-soft narrative-language-section" id="sprache-als-wirkstoff" aria-labelledby="sprache-als-wirkstoff-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Sprachmuster und emotionale Trigger</p>
            <h2 id="sprache-als-wirkstoff-title">Sprache als politischer Wirkstoff</h2>
            <p>Politische Sprache beschreibt nicht nur Wirklichkeit. Sie sortiert Wirklichkeit. Sie entscheidet mit darüber, was als Problem erscheint, wer als Ursache gilt, wer als Opfer wahrgenommen wird und welche Lösungen plausibel wirken. Deshalb reicht ein reiner Faktencheck oft nicht aus. Ein Folgencheck fragt zusätzlich: Welche Wirkung hat diese Sprache auf Angst, Vertrauen, Zugehörigkeit, demokratische Gesprächsfähigkeit und gesellschaftlichen Zusammenhalt?</p>
          </div>
          <div class="card-grid four narrative-language-grid">
            ${languageMechanismCards.map(([title, text]) => `<article class="card"><p class="card-kicker">Mechanismus</p><h3 class="card-title">${escapeHtml(title)}</h3><p class="card-text">${escapeHtml(text)}</p></article>`).join("\n            ")}
          </div>
          <div class="card narrative-rule-card">
            <p class="card-kicker">Kernsatz</p>
            <h3 class="card-title">Nicht beschwichtigen. Nicht spiegeln. Nicht entwerten. Sondern entwirren.</h3>
            <p class="card-text">Rechte Emotionalisierung macht aus Problemen Gegner. Demokratische Kommunikation macht aus Problemen gemeinsame Aufgaben.</p>
            <p><a class="btn btn-primary" href="sprachmuster-und-emotionalisierung/">Sprachmuster vertiefen</a></p>
          </div>
        </div>
      </section>`;
}

function narrativePsychologyBridgeSection() {
  const rows = [
    ["Ohnmacht", "gelernte Ohnmacht, Verantwortungsdiffusion", "Hebel sichtbar machen"],
    ["Verzögerung", "Status-quo-Bias, Unsicherheitsaversion", "Kosten des Wartens zeigen"],
    ["Sündenbock", "Ingroup/Outgroup, Nullsummendenken", "Problem anerkennen, Gruppenschuld trennen"],
    ["Kontrollverlust", "Reaktanz, Kontrollbedürfnis", "Transparenz und Verfahren prüfen"],
    ["Verbotsnarrativ", "Reaktanz, Verlustaversion", "Regel, Preis, Schutz und Verbot unterscheiden"],
    ["Elitenverschwörung", "Mustererkennung, Intentionalitätsbias", "konkrete Belege verlangen"],
    ["Wissenschaftsdelegitimierung", "Bestätigungsfehler, motiviertes Denken", "Methode und Korrektursystem erklären"],
    ["Medienfeindbild", "Hostile-Media-Effekt, Wahrheitsillusion", "konkrete Quelle prüfen"],
    ["Opferumkehr", "Reaktanz, Identitätsschutz", "Meinungsfreiheit von Widerspruch trennen"],
    ["Whataboutism", "Aufmerksamkeitsverschiebung", "zurück zur Ausgangsfrage"],
    ["Scheiternsframe", "Negativity Bias, Verfügbarkeitsheuristik", "Engpass statt Totalurteil"],
    ["Technikwunder-Aufschub", "Optimismusbias, moral licensing", "Forschung ja, Aufschub nein"],
    ["Normalisierung", "Wahrheitsillusion, Desensibilisierung", "erlaubt, wahr und wirkungsarm trennen"],
    ["Zersetzung", "Zynismusspirale, gelernte Ohnmacht", "Reformkritik von Delegitimierung trennen"],
  ];
  return `<section class="section section-soft" id="psychologische-hebel" aria-labelledby="psychologische-hebel-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Psychologie-Bibliothek</p>
            <h2 id="psychologische-hebel-title">Psychologische Hebel hinter Narrativen</h2>
            <p>Narrative wirken, weil sie nicht nur Informationen liefern. Sie aktivieren psychologische Bedürfnisse: Sicherheit, Kontrolle, Zugehörigkeit, Status, Entlastung und Sinn. Ein Ohnmachtsnarrativ nutzt gelernte Hilflosigkeit. Ein Verbotsnarrativ nutzt Reaktanz. Ein Sündenbocknarrativ nutzt Ingroup/Outgroup und Nullsummendenken. Ein Medienfeindbild nutzt Bestätigungsfehler und Quellenzerstörung. Wer diese Hebel erkennt, kann ruhiger reagieren und die Debatte zur Wirkungsfrage zurückführen.</p>
          </div>
          <div class="democracy-response-table-wrap">
            <table class="democracy-response-table">
              <thead><tr><th>Narrativ</th><th>psychologische Haupthebel</th><th>Antwortprinzip</th></tr></thead>
              <tbody>${rows.map(([narrative, levers, response]) => `<tr><th scope="row">${escapeHtml(narrative)}</th><td>${escapeHtml(levers)}</td><td>${escapeHtml(response)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
          <p><a class="btn btn-primary" href="../psychologie/">Psychologie-Bibliothek öffnen</a></p>
        </div>
      </section>`;
}

function renderIndex() {
  const cards = narratives
    .map((item) => {
      const profile = psychologyProfile(item);
      const search = [
        item.title,
        item.shortName,
        item.subtitle,
        item.abstract,
        item.summary.definition,
        item.table.kurzform,
        item.table.hauptwirkung,
        item.table.live_prinzip,
        ...profile.effects.map(([label]) => label),
        ...profile.games,
        ...item.phrases,
      ].join(" ");
      return `<a class="card text-link-card narrative-library-card" href="${item.slug}/" data-theme="${attrList(item.themes)}" data-resonance="${attrList(item.resonance)}" data-risk="${escapeHtml(item.riskLevel)}" data-psychology="${escapeHtml(profile.effects.map(([label]) => label).join(" ").toLowerCase())}" data-pattern="${escapeHtml(profile.games.join(" ").toLowerCase())}" data-search="${escapeHtml(search.toLowerCase())}">
              <p class="card-kicker">${escapeHtml(item.shortName)}</p>
              <h3 class="card-title">${escapeHtml(item.subtitle)}</h3>
              <p class="card-text">${escapeHtml(item.summary.definition)}</p>
              <dl class="narrative-card-facts">
                <div><dt>Hauptwirkung</dt><dd>${escapeHtml(item.table.hauptwirkung)}</dd></div>
                <div><dt>Live-Prinzip</dt><dd>${escapeHtml(item.table.live_prinzip)}</dd></div>
              </dl>
              <p class="narrative-pill-row"><span data-risk="${escapeHtml(item.riskLevel)}">Risiko: ${escapeHtml(item.riskLevel)}</span><span>${escapeHtml(item.themes.slice(0, 2).join(" / "))}</span></p>
            </a>`;
    })
    .join("\n");

  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Narrative</nav>
          <p class="hero-kicker">Wirkungsradar</p>
          <h1 class="hero-title">Narrativbibliothek</h1>
          <p class="hero-subtitle">Wiederkehrende Muster erkennen, bevor man ins Stöckchen springt.</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Viele öffentliche Debatten drehen sich nicht nur um Fakten, sondern um Narrative. Narrative verbinden einzelne Aussagen mit Emotionen, Deutungen und Handlungsimpulsen. Sie können Orientierung geben, aber auch Ohnmacht, Misstrauen, Feindbilder oder Verzögerung erzeugen. Die Narrativbibliothek des Wirkungsradars macht diese Muster sichtbar. Sie zeigt, wie ein Satz zum gesellschaftlichen Wirkstoff werden kann, welches Wirkungspotenzial entsteht, welche Risiken für Mensch, Planet und Demokratie folgen können - und wie man ruhig, faktenbasiert und wirkungsökonomisch antwortet.</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Version: v1</span></p>
        </div>
      </section>

      <section class="section radar-summary-section" aria-labelledby="narrative-summary">
        <div class="radar-section-intro">
          <p class="hero-kicker">Schnellüberblick</p>
          <h2 id="narrative-summary">Was die Narrativbibliothek klärt.</h2>
        </div>
        ${summaryGrid(
          [
            { label: "Was ist ein Narrativ?", value: "Ein Deutungsmuster, das Fakten, Emotionen und Handlungsvorschläge verbindet." },
            { label: "Warum wichtig?", value: "Narrative prägen, was Menschen für möglich, wahr, bedrohlich oder sinnlos halten.", tone: "warning" },
            { label: "WÖk-Fokus", value: "Nicht nur Wahrheit, sondern Wirkungspotenzial und Wirkungsrisiko werden analysiert.", tone: "positive" },
            { label: "Sprache und Trigger", value: "Narrative wirken nicht nur über Aussagen, sondern über wiederkehrende Begriffe, Feindbilder, Kränkungsangebote und Bedrohungsframes.", tone: "warning" },
            { label: "Für wen?", value: "Hosts, Creator:innen, Medien, Bildung, Politik, Moderation, Debattenformate und interessierte Bürger:innen." },
            { label: "Maßstab", value: "Mensch, Planet und Demokratie.", tone: "positive" },
            { label: "Ziel", value: "Nicht eskalieren, sondern einordnen, zurückführen und handlungsfähig bleiben.", tone: "positive" },
          ],
          "Narrativbibliothek Summary"
        )}
      </section>

      ${topicSubnav("Narrative", "")}

      <section class="section section-soft" id="narrativ-modi" aria-labelledby="narrativ-modi-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Arbeitsmodus</p>
            <h2 id="narrativ-modi-title">Narrative erkennen. Hebel verstehen. Souverän reagieren.</h2>
            <p><strong>Nicht beschwichtigen. Nicht spiegeln. Nicht entwerten. Sondern entwirren.</strong></p>
            <p><strong>Gefühl anerkennen. Frame halten. Wirkungsfrage stellen.</strong></p>
          </div>
          <div class="card-grid three">
            <article class="card"><p class="card-kicker">1. Narrative erkennen</p><h3 class="card-title">Welches Muster sortiert die Aussage?</h3><p class="card-text">Ohnmacht, Sündenbock, Kontrollverlust, Verzögerung, Opferumkehr oder Quellenzerstörung werden als wiederkehrende Wirkstoffe sichtbar.</p></article>
            <article class="card"><p class="card-kicker">2. Psychologische Hebel verstehen</p><h3 class="card-title">Warum bleibt der Satz hängen?</h3><p class="card-text">Reaktanz, Verlustaversion, Bestätigungsfehler, Wahrheitsillusion oder Ingroup/Outgroup erklären Anschlussfähigkeit ohne Diagnosesprache.</p></article>
            <article class="card"><p class="card-kicker">3. Souverän reagieren</p><h3 class="card-title">Wie kommt die Debatte zurück zur Wirkung?</h3><p class="card-text">Frame markieren, wahren Kern anerkennen, Denkfehler zeigen und die bessere Wirkungsfrage stellen.</p></article>
          </div>
        </div>
      </section>

      <section class="section section-soft" id="psychologische-effekte" aria-labelledby="psychologische-effekte-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Psychologischer Wirkungscheck</p>
            <h2 id="psychologische-effekte-title">Psychologie ist keine Schwäche - sie ist Teil des Wirkungsraums.</h2>
            <p>Menschen reagieren nicht nur auf Fakten. Sie reagieren auf Sicherheit, Zugehörigkeit, Status, Vertrauen, Angst, Kontrolle, Kränkung, Hoffnung und Sinn. Narrative wirken deshalb nicht nur über ihren Wahrheitsgehalt, sondern über psychologische Anschlussfähigkeit. Der Wirkungsradar analysiert diese Effekte nicht, um Menschen abzuwerten, sondern um Wirkmechanismen sichtbar zu machen. Wer sie erkennt, springt nicht mehr in jedes Stöckchen, übernimmt nicht jeden Frame und kann zur besseren Wirkungsfrage zurückführen.</p>
            <p><strong>Kernsatz:</strong> Nicht manipulieren. Mechanismus erkennen. Frame halten. Wirkung zurückführen.</p>
            <p class="formula-note">${psychologyNotice}</p>
          </div>
          <div class="card-grid four radar-psychology-grid">
            <a class="card text-link-card radar-psychology-card" href="../psychologie/">
              <p class="card-kicker">Dissonanz</p>
              <h3 class="card-title">Kognitive Dissonanz</h3>
              <p class="card-text">Unbequeme Fakten werden abgewehrt, wenn sie Identität, Status oder frühere Entscheidungen infrage stellen.</p>
            </a>
            <a class="card text-link-card radar-psychology-card" href="../psychologie/">
              <p class="card-kicker">Freiheit</p>
              <h3 class="card-title">Reaktanz</h3>
              <p class="card-text">Ein Vorschlag wirkt wie Bevormundung. Dann wird nicht mehr die Maßnahme geprüft, sondern die gefühlte Kränkung verteidigt.</p>
            </a>
            <a class="card text-link-card radar-psychology-card" href="../psychologie/">
              <p class="card-kicker">Kosten</p>
              <h3 class="card-title">Verlustaversion</h3>
              <p class="card-text">Sichtbare Kosten, Verbote oder Einschränkungen wirken stärker als vermiedene Schäden, langfristige Gewinne oder Systemrisiken.</p>
            </a>
            <a class="card text-link-card radar-psychology-card" href="../psychologie/">
              <p class="card-kicker">Weltbild</p>
              <h3 class="card-title">Bestätigungsfehler</h3>
              <p class="card-text">Informationen werden bevorzugt, wenn sie das eigene Lager bestätigen, und abgewertet, wenn sie Korrektur verlangen.</p>
            </a>
          </div>
          <div class="card-grid two radar-psychology-practice">
            <article class="card">
              <p class="card-kicker">Psychologisches Spielchen</p>
              <h3 class="card-title">Der Trigger zieht die Debatte vom Mechanismus weg.</h3>
              <p class="card-text">Typisch sind Kränkung, Feindbild, falscher Freiheitsalarm, selektive Beispiele, moralische Umkehr oder der Satz: Das bringt doch alles nichts. So wird nicht mehr gefragt, was wirkt, sondern wer schuld, naiv oder bevormundend ist.</p>
            </article>
            <article class="card">
              <p class="card-kicker">Oberhand gewinnen</p>
              <h3 class="card-title">Nicht spiegeln, sondern entwirren.</h3>
              <p class="card-text">Wahren Kern retten, Denkfehler trennen, den psychologischen Trigger benennen und zur Wirkungsfrage zurückführen: Welche Maßnahme senkt realen Schaden, stärkt Handlungsfähigkeit und bleibt demokratisch verantwortbar?</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="narrative-intro">
        <div class="article-body radar-method-body">
          <h2 id="narrative-intro">Narrative als gesellschaftliche Wirkstoffe lesen.</h2>
          <p>Narrative sind keine bloßen Meinungen. Sie sind Deutungsrahmen. Sie entscheiden mit darüber, ob Menschen ein Problem als lösbar oder aussichtslos erleben, ob sie Institutionen vertrauen oder ablehnen, ob sie Gruppen als Mitmenschen oder als Bedrohung sehen, ob sie Wissenschaft als Korrektursystem oder als Feindbild verstehen.</p>
          <p>Der Wirkungsradar behandelt Narrative deshalb als gesellschaftliche Wirkstoffe: nicht als Wirkung selbst, sondern als Auslöser mit Wirkungspotenzial. Ein Narrativ kann Emotionen aktivieren, Resonanzräume verschieben, politische Handlungsschwellen verändern und langfristig demokratische, soziale oder ökologische Entscheidungen beeinflussen.</p>
          <p>Die Narrativbibliothek hilft dabei, Muster früh zu erkennen. Wer das Muster erkennt, muss nicht jedem Stöckchen hinterherlaufen. Er oder sie kann den Frame sichtbar machen, den wahren Kern benennen, den Denkfehler erklären und zur wirkungsökonomischen Leitfrage zurückführen.</p>
        </div>
      </section>

      ${stoeckchenModule()}

      <section class="section" id="narrativ-grid" aria-labelledby="narrativ-grid-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Bibliothek v1</p>
            <h2 id="narrativ-grid-title">${narratives.length} Narrativfamilien im Überblick.</h2>
          </div>
          <form class="narrative-library-toolbar" data-search-exclude>
            <label>
              <span class="sr-only">Narrative durchsuchen</span>
              <input type="search" name="q" placeholder="Narrativ, Satz oder Wirkung suchen" data-narrative-search>
            </label>
            <label>
              <span class="sr-only">Nach Thema filtern</span>
              <select name="theme" data-narrative-theme>
                <option value="">Thema: alle</option>
                ${tags.themes.map((theme) => `<option value="${escapeHtml(theme)}">${escapeHtml(theme)}</option>`).join("")}
              </select>
            </label>
            <label>
              <span class="sr-only">Nach Resonanz filtern</span>
              <select name="resonance" data-narrative-resonance>
                <option value="">Resonanz: alle</option>
                ${tags.resonance.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}
              </select>
            </label>
            <label>
              <span class="sr-only">Nach Risiko filtern</span>
              <select name="risk" data-narrative-risk>
                <option value="">Risiko: alle</option>
                <option value="mittel">mittel</option>
                <option value="hoch">hoch</option>
                <option value="sehr hoch">sehr hoch</option>
              </select>
            </label>
            <label>
              <span class="sr-only">Nach psychologischem Effekt filtern</span>
              <select name="psychology" data-narrative-psychology>
                <option value="">Psychologie: alle</option>
                ${["Kognitive Dissonanz", "Bestätigungsfehler", "Reaktanz", "Verlustaversion", "Verfügbarkeitsheuristik", "Identitätsschutz", "Ingroup-Outgroup-Bias", "Kontrollillusion", "Status-quo-Bias", "Optimismusbias"].map((value) => `<option value="${escapeHtml(value.toLowerCase())}">${escapeHtml(value)}</option>`).join("")}
              </select>
            </label>
            <label>
              <span class="sr-only">Nach Gesprächsmuster filtern</span>
              <select name="pattern" data-narrative-pattern>
                <option value="">Spielchen: alle</option>
                ${["wahrer kern", "verteidigungsrolle", "verantwortung", "feindbild", "verschoben", "zensur", "herrschaft", "beweise", "kosten"].map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}
              </select>
            </label>
          </form>
          <p class="narrative-library-count" data-narrative-count>${narratives.length} Narrative</p>
          <div class="card-grid narrative-library-grid" data-narrative-grid>
            ${cards}
          </div>
          <p class="narrative-library-empty" data-narrative-empty hidden>Keine Narrative für diese Filter.</p>
        </div>
      </section>

      ${narrativePsychologyBridgeSection()}

      ${languageWirkstoffSection()}

      <section class="section section-soft" aria-labelledby="redaktionsregel">
        <div class="card narrative-rule-card">
          <p class="card-kicker">Redaktionelle Leitlinie</p>
          <h2 class="card-title" id="redaktionsregel">Nicht jedes Narrativ ist automatisch falsch.</h2>
          <p class="card-text">Nicht jede rechte oder konservative Aussage ist demokratiefeindlich. Nicht jede Kritik an Regierung, Medien, Wissenschaft, SDGs oder EU ist Desinformation.</p>
          <p class="card-text">Problematisch wird ein Narrativ, wenn es Fakten systematisch verzerrt, Gruppen abwertet, demokratische Institutionen pauschal delegitimiert, Wissenschaft und Medien als Korrektursystem zerstört, Gewalt oder Entmenschlichung normalisiert oder notwendiges Handeln ohne bessere Lösung blockiert.</p>
        </div>
      </section>

      <script>
        (() => {
          const cards = Array.from(document.querySelectorAll("[data-narrative-grid] [data-search]"));
          const search = document.querySelector("[data-narrative-search]");
          const theme = document.querySelector("[data-narrative-theme]");
          const resonance = document.querySelector("[data-narrative-resonance]");
          const risk = document.querySelector("[data-narrative-risk]");
          const psychology = document.querySelector("[data-narrative-psychology]");
          const pattern = document.querySelector("[data-narrative-pattern]");
          const count = document.querySelector("[data-narrative-count]");
          const empty = document.querySelector("[data-narrative-empty]");
          const normalize = (value) => String(value || "").trim().toLowerCase();
          const includesToken = (value, token) => !token || String(value || "").split(/\\s+/).includes(token);
          const update = () => {
            const q = normalize(search?.value);
            const selectedTheme = normalize(theme?.value);
            const selectedResonance = normalize(resonance?.value);
            const selectedRisk = normalize(risk?.value);
            const selectedPsychology = normalize(psychology?.value);
            const selectedPattern = normalize(pattern?.value);
            let visible = 0;
            cards.forEach((card) => {
              const match =
                (!q || card.dataset.search.includes(q)) &&
                includesToken(card.dataset.theme, selectedTheme) &&
                includesToken(card.dataset.resonance, selectedResonance) &&
                (!selectedRisk || normalize(card.dataset.risk) === selectedRisk) &&
                (!selectedPsychology || normalize(card.dataset.psychology).includes(selectedPsychology)) &&
                (!selectedPattern || normalize(card.dataset.pattern).includes(selectedPattern));
              card.hidden = !match;
              if (match) visible += 1;
            });
            if (count) count.textContent = visible === 1 ? "1 Narrativ" : visible + " Narrative";
            if (empty) empty.hidden = visible !== 0;
          };
          [search, theme, resonance, risk, psychology, pattern].forEach((control) => control?.addEventListener("input", update));
          update();
        })();
      </script>
    </main>`;

  return pageShell({
    title: "Narrativbibliothek – Muster öffentlicher Aussagen im Wirkungscheck",
    description:
      "Die Narrativbibliothek des Wirkungsradars erklärt Ohnmachtsnarrative, Sündenbockmuster, Kontrollverlustframes, Wissenschaftsangriffe, Medienfeindbilder und andere Wirkungsmuster öffentlicher Debatten.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/narrative/",
    base: "../../",
    main,
  });
}

function detailHref(slug) {
  return `../${slug}/`;
}

function narrativeLink(label, slug) {
  const exists = narratives.some((item) => item.slug === slug);
  return exists ? `<a href="../${escapeHtml(slug)}/">${escapeHtml(label)}</a>` : `<span class="narrative-static-link" aria-disabled="true">${escapeHtml(label)}</span>`;
}

function claimLink(claim) {
  const url = claim.url || claimUrlByTitle.get(claim.title.toLowerCase());
  return url
    ? `<a href="${escapeHtml(url)}">${escapeHtml(claim.title)}</a>`
    : `<span class="narrative-static-link" aria-disabled="true">${escapeHtml(claim.title)}</span>`;
}

function renderLanguagePatternsPage() {
  const patternAccordions = languagePatterns
    .map(
      (pattern, index) => `<details class="radar-answer-item narrative-pattern-item"${index === 0 ? " open" : ""}>
                <summary><span class="radar-answer-time">${escapeHtml(pattern.name)}</span> <span class="radar-answer-label">${escapeHtml(pattern.emotion)}</span></summary>
                <div class="narrative-pattern-body">
                  <p><strong>Kurzdefinition:</strong> ${escapeHtml(pattern.definition)}</p>
                  <p><strong>Typische Wörter / Trigger:</strong> ${escapeHtml(pattern.triggers)}</p>
                  <p><strong>Emotionale Hauptwirkung:</strong> ${escapeHtml(pattern.emotion)}</p>
                  <p><strong>Demokratisches Risiko:</strong> ${escapeHtml(pattern.risk)}</p>
                  <p><strong>Demokratische Antwort:</strong> ${escapeHtml(pattern.answer)}</p>
                  <div class="radar-link-cluster">${pattern.families.map(([label, slug]) => narrativeLink(label, slug)).join("\n                    ")}</div>
                </div>
              </details>`
    )
    .join("\n              ");

  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Narrative</a> / Sprachmuster</nav>
          <p class="hero-kicker">Narrativbibliothek</p>
          <h1 class="hero-title">Sprachmuster und emotionale Trigger</h1>
          <p class="hero-subtitle">Wie politische Sprache Angst, Feindbilder und Handlungsimpulse erzeugt</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Diese Seite zeigt, wie Sprache als politischer Wirkstoff funktioniert. Sie untersucht nicht nur, ob Aussagen wahr oder falsch sind, sondern welche emotionale, soziale und demokratische Wirkung sie entfalten. Im Zentrum stehen wiederkehrende Muster wie Bedrohung, Opferinszenierung, Wir-gegen-die, Niedergang, Kulturkampf, Kontrollversprechen und Demokratie-Umdeutung. Ziel ist nicht moralische Empörung, sondern Wirkungskompetenz.</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Fokus: Folgencheck politischer Sprache</span></p>
        </div>
      </section>

      ${topicSubnav("Narrative", "../")}

      <section class="section">
        <div class="radar-detail-layout narrative-detail-layout">
          <aside class="article-toc" data-search-exclude>
            <p class="hero-kicker">Inhaltsverzeichnis</p>
            <ol>
              <li><a href="#warum-sprache">Warum Sprache mehr ist als Information</a></li>
              <li><a href="#sieben-muster">Sieben zentrale Sprachmuster</a></li>
              <li><a href="#triggerwoerter">Triggerwörter und Wirkung</a></li>
              <li><a href="#emotionen">Emotionen und Resonanzräume</a></li>
              <li><a href="#strategie">Demokratische Wirkungsstrategie</a></li>
              <li><a href="#vermeiden">Was Gegenkommunikation vermeiden muss</a></li>
              <li><a href="#gegenframes">Praktische Gegenframes</a></li>
              <li><a href="#verknuepfung">Verknüpfung zur Narrativbibliothek</a></li>
              <li><a href="#glossar">Glossar und weiterführende Inhalte</a></li>
            </ol>
          </aside>

          <article class="article-body">
            <h2 id="warum-sprache">Warum Sprache mehr ist als Information</h2>
            <p>Nicht jedes starke Wort ist problematisch. Problematisch wird Sprache, wenn sie Komplexität in Feindbilder verwandelt, Angst organisiert oder demokratische Institutionen pauschal delegitimiert. Worte wirken nicht isoliert, sondern in Frames, Resonanzräumen und Gegensätzen. Dieselben Grundmechanismen können in unterschiedlichen politischen Lagern auftreten.</p>
            <p><strong>Nicht beschwichtigen. Nicht spiegeln. Nicht entwerten. Sondern entwirren.</strong> Rechte Emotionalisierung macht aus Problemen Gegner. Demokratische Kommunikation macht aus Problemen gemeinsame Aufgaben.</p>

            <div class="card narrative-rule-card">
              <p class="card-kicker">Warum dieses Beispiel?</p>
              <h3 class="card-title">Pilotkorpus statt Parteibashing</h3>
              <p class="card-text">Das AfD-Regierungsprogramm Sachsen-Anhalt eignet sich als Pilotkorpus, weil dort viele typische Muster emotionalisierter, polarisierender und delegitimierender Sprache verdichtet vorkommen. Entscheidend ist nicht die Parteibezeichnung, sondern die Wirkungsanalyse der Sprache.</p>
            </div>

            <h2 id="sieben-muster">Sieben zentrale Sprachmuster</h2>
            <p>Die folgenden Muster werden als Analyseinstrumente gelesen. Die Triggerwörter werden hier nicht inszeniert, sondern eingeordnet: Welche Emotion wird aktiviert, welches demokratische Risiko entsteht, und welche Antwort führt zurück in Wirkung, Lösung und Rechtsstaat?</p>
            <div class="radar-answer-accordion narrative-pattern-accordion" aria-label="Sieben zentrale Sprachmuster">
              ${patternAccordions}
            </div>

            <h2 id="triggerwoerter">Typische Triggerwörter und ihre Wirkung</h2>
            <div class="table-scroll">
              <table class="dossier-matrix narrative-trigger-table">
                <thead><tr><th>Wort / Trigger</th><th>Typischer Frame</th><th>Emotionale Wirkung</th><th>Demokratisches Risiko</th><th>Bessere Rückfrage / Einordnung</th></tr></thead>
                <tbody>
                  ${triggerRows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("\n                  ")}
                </tbody>
              </table>
            </div>

            <h2 id="emotionen">Welche Gefühle werden typischerweise aktiviert?</h2>
            <div class="table-scroll">
              <table class="dossier-matrix narrative-emotion-table">
                <thead><tr><th>Gefühl</th><th>Sprachlicher Trigger</th><th>Wirkung</th></tr></thead>
                <tbody>
                  ${emotionRows.map((row) => `<tr><th scope="row">${escapeHtml(row[0])}</th><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td></tr>`).join("\n                  ")}
                </tbody>
              </table>
            </div>
            <p>Emotionalisierung ist nicht an sich schlecht. Demokratie braucht Mitgefühl, Empörung über Unrecht, Hoffnung und Zugehörigkeit. Problematisch wird Emotionalisierung, wenn sie Angst, Verachtung, Kränkung und Feindbildlogik verstärkt, ohne lösungsfähig zu machen.</p>

            <h2 id="strategie">Demokratische Wirkungsstrategie</h2>
            <p>Wie man rechte Wirkung nicht unfreiwillig verstärkt.</p>
            <ol class="timeline radar-flow narrative-effect-chain">
              ${democraticPrinciples.map(([title, text], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p></div></li>`).join("\n              ")}
            </ol>

            <h2 id="vermeiden">Was rechte Wirkung oft ungewollt verstärkt</h2>
            <div class="card">
              <p class="card-kicker">Negativ-Checkliste</p>
              <ul class="clean-list">${avoidCounterCommunication.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
              <p class="card-text"><strong>Host-Satz:</strong> Ich markiere den Mechanismus, aber ich übernehme nicht den Frame.</p>
            </div>

            <h2 id="gegenframes">Praktische Gegenframes</h2>
            <div class="card-grid two">
              ${counterFrames.map(([title, text]) => `<article class="card"><p class="card-kicker">Gegenframe</p><h3 class="card-title">${escapeHtml(title)}</h3><p class="card-text">${escapeHtml(text)}</p></article>`).join("\n              ")}
            </div>

            <h2 id="verknuepfung">Verknüpfung zur Narrativbibliothek</h2>
            <div class="card-grid two">
              ${languagePatterns.map((pattern) => `<article class="card"><p class="card-kicker">${escapeHtml(pattern.name)}</p><h3 class="card-title">Verwandte Narrativfamilien</h3><div class="radar-link-cluster">${pattern.families.map(([label, slug]) => narrativeLink(label, slug)).join("\n                ")}</div></article>`).join("\n              ")}
            </div>

            <h2 id="glossar">Glossar und weiterführende Inhalte</h2>
            <div class="radar-link-cluster narrative-glossary-links">
              ${[
                ["frame", "Frame"],
                ["narrativ", "Narrativ"],
                ["resonanzraum", "Resonanzraum"],
                ["wirkstoff", "Wirkstoff"],
                ["sprachlicher-trigger", "Sprachlicher Trigger"],
                ["feindbild", "Feindbild"],
                ["polarisierung", "Polarisierung"],
                ["opferumkehr", "Opferumkehr"],
                ["demokratie-umdeutung", "Demokratie-Umdeutung"],
                ["gegenframe", "Gegenframe"],
                ["folgencheck", "Folgencheck"],
                ["wirkungsanalyse-von-sprache", "Wirkungsanalyse von Sprache"],
              ].map(([slug, label]) => `<a href="../../../begriffe/${slug}/">${escapeHtml(label)}</a>`).join("\n              ")}
            </div>
            <div class="card-grid two">
              <article class="card"><p class="card-kicker">Vertiefung</p><h3 class="card-title">Sprache als politischer Wirkstoff</h3><p class="card-text">Wer tiefer einsteigen will, findet hier eine ausführliche Analyse zu Sprache, Triggern, Emotionalisierung, Gegenstrategien und demokratischer Kommunikation.</p><p><a class="text-link" href="../../../blog/sprache-als-politischer-wirkstoff-wie-rechte-narrative-emotionalisieren/">Longread öffnen</a></p></article>
              <article class="card"><p class="card-kicker">Arbeitspapier</p><h3 class="card-title">Folgencheck statt Faktencheck</h3><p class="card-text">Sprache, Narrative und demokratische Gegenkommunikation als vorbereitendes Dossier.</p></article>
            </div>
          </article>
        </div>
      </section>
    </main>`;

  return pageShell({
    title: "Sprachmuster und emotionale Trigger – Wirkungsradar",
    description:
      "Wie politische Sprache Angst, Feindbilder und Handlungsimpulse erzeugt - und wie demokratische Kommunikation darauf reagiert, ohne problematische Frames zu verstärken.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/narrative/sprachmuster-und-emotionalisierung/",
    base: "../../../",
    main,
  });
}

function renderLanguageLongread() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Blog</a> / Sprache als Wirkstoff</nav>
          <p class="hero-kicker">Longread</p>
          <h1 class="hero-title">Sprache als politischer Wirkstoff</h1>
          <p class="hero-subtitle">Wie rechte Narrative emotionalisieren - und wie demokratische Kommunikation damit umgehen sollte</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Politische Sprache erzeugt nicht nur Aussagen, sondern Wirkung. Sie kann Probleme klären, Vertrauen stärken und Handlungsfähigkeit öffnen. Sie kann aber auch Angst organisieren, Feindbilder stabilisieren, demokratische Institutionen delegitimieren und reale Probleme in Gegner verwandeln. Dieser Longread ordnet die zentralen Mechanismen ein und zeigt, wie demokratische Kommunikation antworten kann, ohne problematische Frames zu verstärken.</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Format: Longread</span></p>
        </div>
      </section>

      <section class="section">
        <article class="article-body">
          <h2>Folgencheck statt nur Faktencheck</h2>
          <p>Ein Faktencheck fragt, ob eine Aussage stimmt. Ein Folgencheck fragt zusätzlich, welche Wirkung die Aussage entfaltet: Welche Gefühle werden aktiviert? Welche Gruppen werden markiert? Welche Institutionen werden delegitimiert? Welche Handlung erscheint plausibel, unmöglich oder zwingend?</p>
          <p>Gerade emotionalisierte rechte Kommunikation arbeitet häufig nicht nur mit falschen Einzelaussagen, sondern mit wiederkehrenden Deutungsmustern: Bedrohung, Opferinszenierung, Wir-gegen-die, Niedergang, Kulturkampf, Kontrollversprechen und Demokratie-Umdeutung.</p>

          <h2>Die demokratische Aufgabe</h2>
          <p>Demokratische Gegenkommunikation muss reale Probleme ernst nehmen, ohne die Feindbildlogik zu übernehmen. Sie muss Sicherheit, Wohnen, Schule, Bürokratie, Abstiegsangst und Zugehörigkeit besprechbar machen, aber Ursachen differenzieren und Lösungen messbar halten.</p>
          <div class="card narrative-rule-card">
            <p class="card-kicker">Kernsatz</p>
            <h3 class="card-title">Nicht beschwichtigen. Nicht spiegeln. Nicht entwerten. Sondern entwirren.</h3>
            <p class="card-text">Rechte Emotionalisierung macht aus Problemen Gegner. Demokratische Kommunikation macht aus Problemen gemeinsame Aufgaben.</p>
          </div>

          <h2>Praktische Leitlinie</h2>
          <ul class="clean-list">
            <li>Trigger nicht unnötig wiederholen.</li>
            <li>Den problematischen Frame nicht nur verneinen, sondern ersetzen.</li>
            <li>Menschen nicht pauschal beschämen, sondern Mechanismen offenlegen.</li>
            <li>Reale Probleme nicht wegreden.</li>
            <li>Von Alarm zu Handlungsfähigkeit wechseln.</li>
            <li>Grenzen klar ziehen, aber ohne Gegenverachtung.</li>
          </ul>
          <p><a class="btn btn-primary" href="../../wirkungsradar/narrative/sprachmuster-und-emotionalisierung/">Zur Analyse der Sprachmuster</a></p>
        </article>
      </section>
    </main>`;

  return pageShell({
    title: "Sprache als politischer Wirkstoff – Wirkungsökonomie",
    description:
      "Longread zu Sprache, Triggern, Emotionalisierung, Gegenstrategien und demokratischer Kommunikation.",
    canonical: "https://wirkungsoekonomie.de/blog/sprache-als-politischer-wirkstoff-wie-rechte-narrative-emotionalisieren/",
    base: "../../",
    main,
  });
}

const defaultPsychologyProfile = {
  effects: [
    ["Bestätigungsfehler", "Menschen nehmen vor allem Informationen auf, die zum bestehenden Weltbild passen."],
    ["Verfügbarkeitsheuristik", "Einprägsame Beispiele wirken größer als die tatsächliche Datenlage."],
    ["Kognitive Dissonanz", "Widersprechende Fakten werden abgewehrt, wenn sie Identität, Status oder bisherige Entscheidungen bedrohen."],
  ],
  games: [
    "Aus einem wahren Kern wird eine zu große Schlussfolgerung gemacht.",
    "Die Debatte wird vom überprüfbaren Sachverhalt auf Gefühl, Verdacht oder Gruppenloyalität verschoben.",
    "Wer widerspricht, soll in eine Verteidigungsrolle geraten.",
  ],
  counter:
    "Nicht den Frame nachsprechen. Erst den wahren Kern anerkennen, dann die falsche Folgerung trennen und mit einer konkreten Wirkungsfrage zur Sache zurückführen.",
};

const psychologyProfiles = {
  ohnmacht: {
    effects: [
      ["Erlernte Hilflosigkeit", "Wiederholte Ohnmachtserzählungen senken Selbstwirksamkeit: Menschen glauben, Handeln bringe ohnehin nichts."],
      ["Verantwortungsdiffusion", "Verantwortung wird an größere Akteure abgegeben, bis niemand mehr zuständig wirkt."],
      ["Gegenwartsbias", "Kurzfristige Entlastung fühlt sich besser an als anstrengende, aber wirksame Veränderung."],
    ],
    games: [
      "Begrenzte Einzelwirkung wird in völlige Wirkungslosigkeit verwandelt.",
      "Wer handeln will, soll naiv wirken.",
      "Unterlassen wird als realistisch, Handeln als moralischer Aktionismus gerahmt.",
    ],
    counter:
      "Begrenztheit anerkennen und sofort auf Hebel wechseln: Wer kann was beeinflussen, bis wann, mit welcher Rückkopplung? So gewinnt man die Oberhand über die Ohnmacht.",
  },
  verzoegerung: {
    effects: [
      ["Status-quo-Bias", "Das Bestehende wirkt sicherer, auch wenn es weiter Schäden erzeugt."],
      ["Verlustaversion", "Mögliche Kosten der Veränderung werden stärker gewichtet als sichere Kosten des Nichtstuns."],
      ["Ambiguitätsaversion", "Unsicherheit über Lösungen wird genutzt, um bekannte Risiken zu verlängern."],
    ],
    games: [
      "Zustimmung ohne Konsequenz: Das Problem wird anerkannt, aber Handlung verschoben.",
      "Perfektion wird verlangt, damit ausreichende Lösungen blockiert werden.",
      "Die Kosten des Wartens werden unsichtbar gemacht.",
    ],
    counter:
      "Nicht über Idealzustände streiten. Nach den Kosten des Wartens fragen: Was passiert, wenn wir ein Jahr, fünf Jahre oder zehn Jahre nichts ändern?",
  },
  suendenbock: {
    effects: [
      ["Sündenbockmechanismus", "Komplexe Ursachen werden emotional auf eine Gruppe verengt."],
      ["Ingroup-Outgroup-Bias", "Die eigene Gruppe wirkt moralisch sauber, die andere als Ursache des Problems."],
      ["Fundamentaler Attributionsfehler", "Systemprobleme werden als Charakterfehler bestimmter Menschen erzählt."],
    ],
    games: [
      "Reale Belastung wird aufgenommen und auf eine Zielgruppe umgeleitet.",
      "Komplexität wird durch Schuld ersetzt.",
      "Wer differenziert, soll als Verteidiger der angeblich Schuldigen erscheinen.",
    ],
    counter:
      "Problem ernst nehmen, Zielgruppe entkoppeln, Ursachen sortieren: Welche konkrete Wirkung soll verbessert werden und welche Maßnahme wirkt nachweisbar?",
  },
  kontrollverlust: {
    effects: [
      ["Kontrollillusion", "Eine einfache Erklärung gibt Gefühl von Kontrolle, auch wenn sie falsch ist."],
      ["Bedrohungsbias", "Unklare Koordination wird schneller als Gefahr wahrgenommen."],
      ["Verschwörungsdenken", "Zufall, Komplexität und Interessen werden zu einem geheimen Plan verdichtet."],
    ],
    games: [
      "Kooperation wird als Herrschaft umgedeutet.",
      "Unklare Zuständigkeiten werden als Beweis für geheime Steuerung genutzt.",
      "Gegenbelege gelten als Teil des Plans.",
    ],
    counter:
      "Zuständigkeiten konkretisieren: Wer entscheidet rechtlich? Wer kontrolliert? Welche demokratische Korrektur ist möglich? Konkretion schlägt Kontrollpanik.",
  },
  verbotsnarrativ: {
    effects: [
      ["Reaktanz", "Menschen wehren sich stärker, wenn sie Freiheit bedroht sehen."],
      ["Verlustaversion", "Der mögliche Verlust wirkt größer als der Nutzen der Regel."],
      ["Identitätsschutz", "Alltagspraktiken werden als Angriff auf die eigene Lebensweise erlebt."],
    ],
    games: [
      "Jede Steuerung wird als Verbot gerahmt.",
      "Regeln werden emotional personalisiert: Die wollen dir etwas wegnehmen.",
      "Verhältnismäßigkeit verschwindet aus der Debatte.",
    ],
    counter:
      "Nicht das Wort Verbot spiegeln. Nach Freiheit, Schutz und Wirkung fragen: Welche Regel schützt wen, vor welchem Schaden, mit welcher mildesten wirksamen Maßnahme?",
  },
  elitenverschwoerung: {
    effects: [
      ["Mustererkennung unter Unsicherheit", "Komplexe Ereignisse werden zu absichtsvollen Mustern verbunden."],
      ["Misstrauensspirale", "Jede Quelle wird nach Zugehörigkeit statt nach Belegqualität bewertet."],
      ["Immunisierung gegen Gegenbeweise", "Widerspruch wird als Beweis für die Verschwörung gelesen."],
    ],
    games: [
      "Reale Machtfragen werden in ein geschlossenes Weltbild überführt.",
      "Belege werden durch Verdacht ersetzt.",
      "Die Gegenseite soll endlos beweisen, dass es keinen geheimen Plan gibt.",
    ],
    counter:
      "Machtkritik behalten, Verschwörungslogik stoppen: Welche konkrete Entscheidung, welches Dokument, welcher Geldfluss, welche Kontrolle?",
  },
  wissenschaftsdelegitimierung: {
    effects: [
      ["Motivated Reasoning", "Daten werden danach bewertet, ob sie zur gewünschten Schlussfolgerung passen."],
      ["Bestätigungsfehler", "Einzelne Fehler werden als Beweis gegen das gesamte Verfahren gelesen."],
      ["Dunning-Kruger-Effekt", "Komplexe Methoden werden unterschätzt, einfache Gegenbehauptungen überschätzt."],
    ],
    games: [
      "Aus Fehlerfähigkeit wird Beliebigkeit gemacht.",
      "Einzelne Studienkritik wird zur pauschalen Korruptionsbehauptung.",
      "Unsicherheit wird als Nichtwissen oder Betrug gerahmt.",
    ],
    counter:
      "Nicht Wissenschaft als Autorität verteidigen, sondern Verfahren erklären: Welche Studie, welche Methode, welche Daten, welche Replikation, welcher Interessenkonflikt?",
  },
  medienfeindbild: {
    effects: [
      ["Feindbildbindung", "Misstrauen wird an eine ganze Berufsgruppe geknüpft."],
      ["Selektive Wahrnehmung", "Fehler bestätigen das Feindbild, Korrekturen werden ignoriert."],
      ["Hostile-Media-Effekt", "Berichterstattung wirkt parteiisch, wenn sie der eigenen Haltung widerspricht."],
    ],
    games: [
      "Medienkritik wird in Medienverachtung verwandelt.",
      "Alle Quellen werden pauschal delegitimiert, außer die eigene Echokammer.",
      "Korrekturverfahren werden als Tarnung abgewertet.",
    ],
    counter:
      "Medienkritik konkret machen: Welcher Artikel, welche Quelle, welcher Fehler, welche Korrektur? Pauschalurteile verlassen, Quellenqualität prüfen.",
  },
  opferumkehr: {
    effects: [
      ["Reaktanz", "Widerspruch wird als Freiheitsbedrohung erlebt."],
      ["Moral Licensing", "Die eigene Provokation wirkt legitim, weil man sich als Opfer sieht."],
      ["Kränkungsabwehr", "Kritik wird nicht sachlich geprüft, sondern als Angriff auf die Person erlebt."],
    ],
    games: [
      "Kritik wird zu Unterdrückung umgedeutet.",
      "Die Wirkung der eigenen Aussage verschwindet hinter dem verletzten Selbstbild.",
      "Andere sollen sich für Widerspruch rechtfertigen.",
    ],
    counter:
      "Ruhig trennen: Du darfst das sagen, andere dürfen widersprechen. Meinungsfreiheit schützt vor staatlicher Unterdrückung, nicht vor Kritik.",
  },
  whataboutism: {
    effects: [
      ["Aufmerksamkeitsumlenkung", "Die konkrete Frage wird durch einen anderen Missstand verdrängt."],
      ["Moralischer Ausgleich", "Eigene Verantwortung wirkt kleiner, weil andere ebenfalls Probleme haben."],
      ["Kognitive Entlastung", "Ein unbequemer Handlungsdruck wird durch Vergleich reduziert."],
    ],
    games: [
      "Vom konkreten Hebel wird auf ein anderes Problem ausgewichen.",
      "Vergleich ersetzt Verantwortung.",
      "Wer beim Thema bleibt, soll einseitig wirken.",
    ],
    counter:
      "Vergleich anerkennen, Thema halten: Ja, auch dort gibt es Verantwortung. Welche Verantwortung liegt hier, heute, bei uns?",
  },
  scheiternsframe: {
    effects: [
      ["Negativitätsbias", "Fehler und Rückschläge werden stärker erinnert als Fortschritte."],
      ["Selbsterfüllende Erwartung", "Wer Scheitern erwartet, investiert weniger in Lösung und Korrektur."],
      ["Demoralisierung", "Komplexe Lernprozesse wirken wie endgültiges Versagen."],
    ],
    games: [
      "Jeder Fehler wird zum Beweis für das Scheitern des ganzen Pfads.",
      "Lernen, Nachsteuern und Korrektur werden ausgeblendet.",
      "Die Alternative muss nicht denselben Prüfmaßstab erfüllen.",
    ],
    counter:
      "Nicht Erfolg behaupten, sondern Lernstand prüfen: Was funktioniert, was nicht, was wird korrigiert, und was kostet der alte Pfad?",
  },
  "technikwunder-aufschub": {
    effects: [
      ["Optimismusbias", "Künftige Lösungen werden wahrscheinlicher und schneller angenommen, als sie sind."],
      ["Present Bias", "Heute nichts ändern fühlt sich leichter an als verfügbare, aber unbequeme Maßnahmen."],
      ["Magisches Denken", "Technologie wird als Erlösung erzählt, nicht als Pfad mit Zeit, Kosten und Nebenwirkungen."],
    ],
    games: [
      "Zukunftstechnologie wird genutzt, um Gegenwartspflichten zu verschieben.",
      "Potenzial wird mit realer Wirkung verwechselt.",
      "Opportunitätskosten der Wartezeit verschwinden.",
    ],
    counter:
      "Technik ernst nehmen, aber nach Pfad fragen: Was wirkt bis wann, in welcher Größenordnung, mit welchen Kosten und Nebenwirkungen?",
  },
  normalisierung: {
    effects: [
      ["Desensibilisierung", "Wiederholung senkt die Empfindlichkeit für Grenzverschiebungen."],
      ["Normverschiebung", "Was gestern extrem war, wirkt morgen normaler."],
      ["Pluralistische Ignoranz", "Menschen unterschätzen, wie viele andere die Grenzverschiebung ablehnen."],
    ],
    games: [
      "Grenzüberschreitungen werden als bloße Meinung gerahmt.",
      "Wiederholung macht die Aussage vertraut.",
      "Kritik wirkt überempfindlich, weil die Grenze langsam verschoben wurde.",
    ],
    counter:
      "Grenze ruhig benennen, ohne Drama zu inszenieren: Welche Norm wird verschoben, wen trifft das, und welche demokratische Regel schützt hier?",
  },
  "co2-preis-abzocke": {
    effects: [
      ["Verlustaversion", "Sichtbare Kosten wirken stärker als vermiedene Schäden."],
      ["Salienz-Bias", "Der Preis an der Rechnung ist sichtbar, fossile Folgekosten sind verstreut."],
      ["Fairness-Heuristik", "Belastung wird als ungerecht erlebt, wenn Rückverteilung und Systemkosten fehlen."],
    ],
    games: [
      "Nur neue Kosten werden gezeigt, alte externe Kosten verschwinden.",
      "Politik wird als Abzocker erzählt statt als Rückkopplung von Folgekosten.",
      "Verteilungsfragen werden gegen Klimawirkung ausgespielt.",
    ],
    counter:
      "Kostenbild vollständig machen: Welche Kosten sind sichtbar, welche wurden bisher ausgelagert, wer zahlt sie, und wie wird sozial rückverteilt?",
  },
  zersetzung: {
    effects: [
      ["Zynismusspirale", "Wenn alles als korrupt gilt, erscheint demokratische Korrektur sinnlos."],
      ["Institutionelles Misstrauen", "Fehler werden nicht als korrigierbar, sondern als Systembeweis gelesen."],
      ["Radikalisierungsbereitschaft", "Wenn Institutionen illegitim wirken, erscheinen härtere Mittel plausibler."],
    ],
    games: [
      "Kritik wird nicht zur Verbesserung genutzt, sondern zur pauschalen Delegitimierung.",
      "Institutionelle Verfahren werden als Fassade erzählt.",
      "Kompromiss und Korrektur wirken wie Schwäche.",
    ],
    counter:
      "Kritik konkretisieren und Korrekturwege zeigen: Welcher Fehler, welche Kontrolle, welche Reform, welches rechtsstaatliche Verfahren?",
  },
};

function psychologyProfile(item) {
  return psychologyProfiles[item.slug] || defaultPsychologyProfile;
}

function renderPsychologySection(item) {
  const profile = psychologyProfile(item);
  return `<h2 id="psychologie">Psychologischer Wirkungscheck</h2>
            <p>Dieses Narrativ wirkt nicht nur über Fakten, sondern über psychologische Abkürzungen, emotionale Trigger und Gesprächsmuster. Entscheidend ist, den Mechanismus sichtbar zu machen, ohne ihn unnötig zu verstärken.</p>
            <p class="formula-note">${psychologyNotice}</p>
            <div class="card-grid radar-psychology-grid">
              ${profile.effects
                .map(
                  ([label, text]) => `<article class="card radar-psychology-card">
                <p class="card-kicker">Psychologischer Effekt</p>
                <h3 class="card-title">${escapeHtml(label)}</h3>
                <p class="card-text">${escapeHtml(text)}</p>
              </article>`
                )
                .join("\n              ")}
            </div>
            <div class="card-grid two radar-psychology-practice">
              <article class="card">
                <p class="card-kicker">Psychologisches Spielchen</p>
                <h3 class="card-title">So wird die Debatte verschoben</h3>
                <ul class="clean-list">${profile.games.map((game) => `<li>${escapeHtml(game)}</li>`).join("")}</ul>
              </article>
              <article class="card">
                <p class="card-kicker">Frame-Kontrolle</p>
                <h3 class="card-title">So umgehst du den Trigger</h3>
                <p class="card-text">${escapeHtml(profile.counter)}</p>
                <p class="card-text"><strong>Merksatz:</strong> Nicht spiegeln, nicht beschämen, nicht ausweichen. Mechanismus markieren, wahren Kern retten, Wirkungspfad zurückholen.</p>
              </article>
              ${renderHostControlCard()}
            </div>`;
}

function renderDetail(item) {
  const related = item.related
    .map((slug) => narratives.find((candidate) => candidate.slug === slug))
    .filter(Boolean);

  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Narrative</a> / ${escapeHtml(item.shortName)}</nav>
          <p class="hero-kicker">Narrativfamilie</p>
          <h1 class="hero-title">${escapeHtml(item.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(item.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(item.abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Wirkungsrisiko: ${escapeHtml(item.riskLevel)}</span></p>
        </div>
      </section>

      <section class="section radar-summary-section" aria-labelledby="summary-${escapeHtml(item.slug)}">
        <div class="radar-section-intro">
          <p class="hero-kicker">Schnellüberblick</p>
          <h2 id="summary-${escapeHtml(item.slug)}">Definition, Wirkung und Live-Prinzip.</h2>
        </div>
        ${summaryGrid(
          [
            { label: "Definition", value: escapeHtml(item.summary.definition) },
            { label: "Typische Botschaft", value: escapeHtml(item.summary.typical_message), tone: "warning" },
            { label: "Emotionaler Haken", value: escapeHtml(item.summary.emotional_hook), tone: "warning" },
            { label: "Wirkungsrisiko", value: escapeHtml(item.summary.risk), tone: item.riskLevel === "sehr hoch" ? "critical" : "warning" },
            { label: "Host-Prinzip", value: escapeHtml(item.summary.host_principle), tone: "positive" },
            { label: "Resonanzraum", value: escapeHtml(item.resonance.join(" / ")), tone: "neutral" },
          ],
          `${item.title} Summary`
        )}
      </section>

      ${topicSubnav("Narrative", "../")}

      <section class="section">
        <div class="radar-detail-layout narrative-detail-layout">
          <aside class="article-toc" data-search-exclude>
            <p class="hero-kicker">Inhaltsverzeichnis</p>
            <ol>
              <li><a href="#definition">Definition</a></li>
              <li><a href="#typische-saetze">Typische Sätze</a></li>
              <li><a href="#wirkungspfad">Wirkungspfad</a></li>
              <li><a href="#psychologie">Psychologischer Wirkungscheck</a></li>
              <li><a href="#mpd">Mensch, Planet, Demokratie</a></li>
              <li><a href="#host-antworten">Host-Antworten</a></li>
              <li><a href="#stoeckchen">Nicht ins Stöckchen springen</a></li>
              <li><a href="#verwandt">Verwandte Narrative und Checks</a></li>
              <li><a href="#glossar-quellen">Glossar und Quellenstruktur</a></li>
            </ol>
          </aside>

          <article class="article-body">
            <h2 id="definition">Definition</h2>
            <p>${escapeHtml(item.definition)}</p>
            <p>Als <a href="../../../begriffe/wirkstoff/" data-glossary-key="wirkstoff">gesellschaftlicher Wirkstoff</a> wirkt hier: ${escapeHtml(item.wirkstoff)} Der typische <a href="../../../begriffe/resonanzraum/" data-glossary-key="resonanzraum">Resonanzraum</a> ist: ${escapeHtml(item.resonanceText)}</p>

            <h2 id="typische-saetze">Typische Sätze</h2>
            <ul class="typical-phrases narrative-phrase-grid" aria-label="Typische Sätze für ${escapeHtml(item.title)}">
              ${item.phrases.map((phrase) => `<li class="narrative-phrase"><p>„${escapeHtml(stripQuotes(phrase))}“</p></li>`).join("\n              ")}
            </ul>

            <h2 id="wirkungspfad">Wirkungspfad</h2>
            <ol class="timeline radar-flow effect-chain narrative-effect-chain">
              ${item.effectSteps
                .map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`)
                .join("\n              ")}
            </ol>

            ${renderPsychologySection(item)}

            <h2 id="mpd">Bewertung nach Mensch, Planet und Demokratie</h2>
            ${summaryGrid(
              [
                { label: "Mensch", value: escapeHtml(item.mpd.mensch), tone: "warning" },
                { label: "Planet", value: escapeHtml(item.mpd.planet), tone: "warning" },
                { label: "Demokratie", value: escapeHtml(item.mpd.demokratie), tone: "critical" },
              ],
              `${item.title} MPD`,
              "mpd-impact-panel"
            )}

            <h2 id="host-antworten">Host-Antworten</h2>
            <div class="radar-answer-accordion host-response-box host-answer-tabs" aria-label="Host-Antworten nach Länge">
              <details class="radar-answer-item" open>
                <summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(item.answers.ten_seconds)} Wörter</span></summary>
                <p>„${escapeHtml(item.answers.ten_seconds)}“</p>
              </details>
              <details class="radar-answer-item">
                <summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(item.answers.thirty_seconds)} Wörter</span></summary>
                <p>„${escapeHtml(item.answers.thirty_seconds)}“</p>
              </details>
              <details class="radar-answer-item">
                <summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(item.answers.two_minutes)} Wörter</span></summary>
                <p>„${escapeHtml(item.answers.two_minutes)}“</p>
              </details>
            </div>

            <h2 id="stoeckchen">Nicht ins Stöckchen springen</h2>
            <div class="narrative-host-schema">
              <div>
                <h3>5-Satz-Schema</h3>
                <ol>
                  ${hostSchema.map((step) => `<li>${escapeHtml(step)}</li>`).join("\n                  ")}
                </ol>
              </div>
              <div>
                <h3>Nicht tun</h3>
                <ul>
                  ${item.dontDo.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("\n                  ")}
                </ul>
                <p><strong>Die bessere Frage:</strong> ${escapeHtml(item.redirectQuestion)}</p>
              </div>
            </div>

            <h2 id="verwandt">Verwandte Narrative und Wirkungschecks</h2>
            <div class="related-claims narrative-related-grid">
              <div class="card">
                <p class="card-kicker">Verwandte Narrative</p>
                <div class="radar-link-cluster">
                  ${related.map((relatedItem) => `<a href="${detailHref(relatedItem.slug)}">${escapeHtml(relatedItem.title)}</a>`).join("\n                  ")}
                </div>
              </div>
              <div class="card">
                <p class="card-kicker">Verwandte Wirkungschecks</p>
                <div class="radar-link-cluster">
                  ${item.claims
                    .map((claim) => claimLink(claim))
                    .join("\n                  ")}
                </div>
              </div>
            </div>

            <h2 id="glossar-quellen">Glossar und externe Quellenstruktur</h2>
            <div class="radar-link-cluster narrative-glossary-links">
              ${glossary.map(([slug, label]) => `<a href="../../../begriffe/${slug}/" data-glossary-key="${slug}">${escapeHtml(label)}</a>`).join("\n              ")}
            </div>
            <div class="card-grid narrative-source-grid">
              ${externalSources
                .map(
                  (source) => `<article class="card">
                <p class="card-kicker">Quelle vorbereiten</p>
                <h3 class="card-title">${escapeHtml(source.label)}</h3>
                <p class="card-text">${escapeHtml(source.use_for.join(" / "))}</p>
                <p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p>
              </article>`
                )
                .join("\n              ")}
            </div>
          </article>
        </div>
      </section>
    </main>`;

  return pageShell({
    title: `${item.title} – Wirkungsradar`,
    description: sentence(item.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/narrative/${item.slug}/`,
    base: "../../../",
    main,
  });
}

function yamlScalar(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "null";
  return JSON.stringify(value);
}

function isComplexYaml(value) {
  return value && typeof value === "object";
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

function dataModel() {
  return {
    version: "0.1",
    last_updated: UPDATED_AT,
    type: "narrative_library",
    tags,
    external_sources: externalSources,
    glossary_terms: glossary.map(([slug, label]) => ({ slug, label })),
    narratives: narratives.map((item) => ({
      id: item.id,
      type: "narrative",
      status: "published",
      version: "0.1",
      last_updated: UPDATED_AT,
      slug: item.slug,
      seo: {
        title: `${item.title} - Wirkungsradar`,
        description: sentence(item.abstract),
      },
      hero: {
        eyebrow: "Narrativfamilie",
        title: item.title,
        subtitle: item.subtitle,
        abstract: item.abstract,
        riskLevel: item.riskLevel,
      },
      summary: item.summary,
      narrative: {
        definition: item.definition,
        typical_phrases: item.phrases,
        wirkstoff: item.wirkstoff,
        resonance: item.resonance,
        mechanism: item.effectSteps[1]?.[1],
        effect_path: item.effectSteps.map(([label, description]) => ({ label, description })),
      },
      mpd: item.mpd,
      answers: {
        ...item.answers,
        dont_do: item.dontDo,
        redirect_question: item.redirectQuestion,
      },
      psychology: psychologyProfile(item),
      links: {
        self: `/wirkungsradar/narrative/${item.slug}/`,
        related: item.related.map((slug) => `/wirkungsradar/narrative/${slug}/`),
        claims: item.claims,
      },
      tags: {
        themes: item.themes,
        resonance: item.resonance,
        risk_dimensions: item.riskDimensions,
      },
    })),
  };
}

writeFile("content/wirkungsradar/narratives.yml", `# Generated by scripts/wirkungsradar/build-narrative-library.mjs\n${toYaml(dataModel()).trim()}\n`);
writeFile("wirkungsradar/narrative/index.html", renderIndex());
writeFile("wirkungsradar/narrative/sprachmuster-und-emotionalisierung/index.html", renderLanguagePatternsPage());
writeFile("blog/sprache-als-politischer-wirkstoff-wie-rechte-narrative-emotionalisieren/index.html", renderLanguageLongread());
for (const item of narratives) {
  writeFile(`wirkungsradar/narrative/${item.slug}/index.html`, renderDetail(item));
}

console.log(`Built narrative library: ${narratives.length} detail pages.`);
