import fs from "node:fs";
import path from "node:path";
import { renderRadarTopicMapPage } from "./topic-map-template.mjs";

const UPDATED_AT = "2026-06-03";

const sourcePack = {
  id: "democracy-public-sphere-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  sources: {
    gg_art_5: {
      label: "Grundgesetz Artikel 5",
      publisher: "Bundesministerium der Justiz / Gesetze im Internet",
      url: "https://www.gesetze-im-internet.de/gg/art_5.html",
      type: "recht",
      relevance: ["Meinungsfreiheit", "Pressefreiheit", "Zensurverbot"],
    },
    bpb_desinformation: {
      label: "Bundeszentrale für politische Bildung - Desinformation",
      publisher: "bpb",
      url: "https://www.bpb.de/themen/medien-journalismus/desinformation/",
      type: "politische_bildung",
      relevance: ["Desinformation", "Medienkompetenz", "Demokratiebildung"],
    },
    debunking_handbook: {
      label: "The Debunking Handbook 2020",
      publisher: "George Mason University / University of Bristol / Partner",
      url: "https://climatecommunication.gmu.edu/all/the-debunking-handbook-2020/",
      type: "wissenschaft_praxis",
      relevance: ["Debunking", "Fakten-Sandwich", "Fehlinformation"],
    },
    un_sdgs: {
      label: "United Nations - Sustainable Development Goals",
      publisher: "United Nations",
      url: "https://sdgs.un.org/goals",
      type: "internationaler_zielrahmen",
      relevance: ["SDGs", "Agenda 2030"],
    },
    unesco_media_literacy: {
      label: "UNESCO - Media and Information Literacy",
      publisher: "UNESCO",
      url: "https://www.unesco.org/en/media-information-literacy",
      type: "internationale_bildung",
      relevance: ["Medienkompetenz", "Informationskompetenz"],
    },
    eu_dsa: {
      label: "Digital Services Act",
      publisher: "European Commission",
      url: "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act",
      type: "recht_regulierung",
      relevance: ["Plattformregulierung", "Moderation", "Transparenz"],
    },
    reporters_without_borders: {
      label: "Reporter ohne Grenzen - Rangliste der Pressefreiheit",
      publisher: "Reporter ohne Grenzen",
      url: "https://www.reporter-ohne-grenzen.de/rangliste/detail",
      type: "ngo",
      relevance: ["Pressefreiheit", "Medienfreiheit"],
    },
    wissenschaftsrat_open_science: {
      label: "Wissenschaftsrat - Wissenschaftskommunikation",
      publisher: "Wissenschaftsrat",
      url: "https://www.wissenschaftsrat.de/download/2021/9367-21.html",
      type: "wissenschaftspolitik",
      relevance: ["Wissenschaftliche Qualitaet", "Forschung", "Wissenschaftskommunikation"],
    },
  },
};

const clusterSummary = [
  ["Kernfrage", "Welche Aussagen stärken demokratische Klärung - und welche zerstören Vertrauen, Wahrheit oder Diskursfähigkeit?", "neutral"],
  ["Häufige Narrative", "Opferumkehr, Medienfeindbild, Wissenschaftsdelegitimierung, Kontrollverlust, Elitenverschwörung, Zersetzung.", "warning"],
  ["Wirkungsrisiko", "Vertrauen sinkt, Quellenordnung zerfällt, demokratische Korrektur wird geschwächt.", "critical"],
  ["SDG+-Bezug", "Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, Schutz vor Manipulation.", "positive"],
  ["Für wen?", "Hosts, Creator:innen, Medien, Bildung, Politik, Zivilgesellschaft und Bürger:innen.", "neutral"],
  ["WÖk-Ziel", "Freiheit schützen, ohne Desinformation, Abwertung oder autoritäre Frames zu normalisieren.", "positive"],
];

const effectTemplate = [
  ["Aussage", "Ein Satz, Frame, Meme oder wiederkehrendes Narrativ wird öffentlich gesetzt."],
  ["Wirkstoff", "Die Aussage aktiviert Misstrauen, Ohnmacht, Wut, Kränkung oder Kontrollverlust."],
  ["Resonanzraum", "Die Aussage findet Anschluss in bestehenden Sorgen, Erfahrungen oder Gruppenidentitäten."],
  ["Wirkungspotenzial", "Quellenvertrauen, Diskursfähigkeit oder institutionelles Vertrauen können sinken."],
  ["Wirkungsrisiko", "Desinformation, Feindbilder oder autoritäre Lösungsmuster werden anschlussfähiger."],
  ["Wirkung 1. Ordnung", "Menschen reagieren emotional oder übernehmen einen Frame."],
  ["Wirkung 2. Ordnung", "Diskussionen, Medienräume oder Communities verschieben sich."],
  ["Wirkung 3. Ordnung", "Demokratische Korrekturmechanismen und gemeinsame Faktenbasis werden geschwächt."],
];

const subtopics = [
  {
    slug: "demokratie",
    title: "Demokratie",
    subtitle: "Institutionen, Rechtsstaatlichkeit und demokratische Korrekturfähigkeit",
    abstract: "Demokratische Räume brauchen Streit, Kritik und Kontrolle. Problematisch wird öffentliche Sprache, wenn sie Institutionen pauschal delegitimiert, Ohnmacht verstärkt oder autoritäre Lösungsbilder anschlussfähig macht.",
    claims: ["die-da-oben", "das-ist-alles-gesteuert", "das-ist-zensur"],
  },
  {
    slug: "medien",
    title: "Medien",
    subtitle: "Quellenklarheit, Pressefreiheit und Medienkritik",
    abstract: "Medienkritik ist demokratisch notwendig. Pauschale Medienfeindbilder zerstören aber gemeinsame Prüf- und Korrekturräume und machen Desinformation anschlussfähiger.",
    claims: ["mainstreammedien-luegen-alle", "das-ist-zensur"],
  },
  {
    slug: "wissenschaft",
    title: "Wissenschaft",
    subtitle: "Fehlbarkeit, Methode und Wissensinfrastruktur",
    abstract: "Wissenschaft ist nicht unfehlbar, aber sie ist ein Korrektursystem. Delegitimierungsframes ersetzen Methodenkritik durch Verdacht und schwächen die gemeinsame Faktenbasis.",
    claims: ["die-wissenschaft-ist-gekauft"],
  },
  {
    slug: "desinformation",
    title: "Desinformation",
    subtitle: "Stöckchen, Verschwörungslogik und Frame-Verschiebung",
    abstract: "Desinformation wirkt nicht nur über falsche Behauptungen, sondern über Wirkstoffe: Misstrauen, Kontrollverlust, Kränkung, Endlos-Ausweichen und Quellenzerstörung.",
    claims: ["man-wird-doch-wohl-fragen-duerfen", "das-ist-alles-gesteuert", "mainstreammedien-luegen-alle"],
  },
  {
    slug: "sdg-plus",
    title: "SDG+",
    subtitle: "Demokratie, Medienqualität und digitale Selbstbestimmung als Wirkungsdimensionen",
    abstract: "SDG+ macht sichtbar, dass Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen und Schutz vor Manipulation Voraussetzungen guter Wirkung sind.",
    claims: ["sdgs-weltregierung", "wirkungsoekonomie-social-credit"],
  },
  {
    slug: "creator-hosts",
    title: "Creator & Hosts",
    subtitle: "Sprechbare Antworten, Rückfragen und Schutz vor Frame-Übernahme",
    abstract: "Hosts brauchen kurze, faire und präzise Antworten: wahren Kern anerkennen, Denkfehler benennen, Narrativ sichtbar machen und zur demokratischen Wirkungsfrage zurückführen.",
    claims: ["man-darf-ja-nichts-mehr-sagen", "mainstreammedien-luegen-alle", "wirkungsoekonomie-social-credit"],
  },
];

const claims = [
  {
    title: "„Man darf ja nichts mehr sagen“",
    slug: "man-darf-ja-nichts-mehr-sagen",
    subtitle: "Opferumkehr, Sagbarkeitsnarrativ und Diskursverschiebung",
    shortJudgement: "Gefühl teilweise nachvollziehbar, als Frame häufig irreführend.",
    narrativeFamilies: ["Opferumkehr", "Normalisierung", "Sagbarkeitsnarrativ"],
    riskLevel: "hoch",
    themes: ["Meinungsfreiheit", "Diskurskultur"],
    sdgs: ["SDG 16"],
    sdgPlus: ["Diskursfähigkeit", "Minderheitenschutz", "Medienqualität"],
    abstract: "Die Aussage beschreibt manchmal echte Unsicherheit in überhitzten Debatten. Irreführend wird sie, wenn Kritik, Widerspruch, Moderation oder Faktencheck als Zensur umgedeutet werden. Die wirkungsökonomische Antwort lautet: Meinungsfreiheit schützt vor staatlicher Unterdrückung, aber nicht vor Widerspruch.",
    summary: {
      judgement: "Nicht grundsätzlich falsch als Gefühl, aber häufig irreführend als politischer Frame.",
      true_core: "Debatten können überhitzt sein, und Menschen erleben manchmal sozialen Druck.",
      problem: "Widerspruch, Kritik oder Moderation werden als Zensur umgedeutet.",
      narrative: "Opferumkehr / Sagbarkeitsnarrativ / Normalisierung.",
      risk: "Faktencheck, Moderation und Minderheitenschutz werden delegitimiert.",
      host_answer: "Du darfst das sagen. Andere dürfen widersprechen.",
    },
    answers: {
      ten_seconds: "Du darfst das sagen. Andere dürfen widersprechen. Meinungsfreiheit heißt nicht Widerspruchsfreiheit.",
      thirty_seconds: "Der wahre Kern ist: Debatten können überhitzt sein. Der Denkfehler ist, Widerspruch oder Faktencheck als Zensur zu framen. Meinungsfreiheit schützt vor staatlicher Unterdrückung - nicht vor Kritik.",
      two_minutes: "Ich ordne das kurz ein. Viele Menschen sind unsicher, was sie noch sagen können. Das ist als Gefühl ernst zu nehmen. Aber der Satz wird oft als Stöckchen benutzt: Plötzlich geht es nicht mehr um die ursprüngliche Aussage, sondern um angebliche Unterdrückung. Meinungsfreiheit schützt vor staatlicher Zensur, nicht vor Widerspruch, Kritik oder Moderation. Wirkungsökonomisch zählt: Wenn jede Kritik als Zensur gilt, werden Faktenkorrektur, Minderheitenschutz und demokratische Gesprächsfähigkeit geschwächt. Die bessere Frage lautet: Wie streiten wir offen, ohne Desinformation, Abwertung oder Einschüchterung zu normalisieren?",
    },
    redirectQuestion: "Was genau durftest du nicht sagen - und wer hat es staatlich verboten?",
    trueText: "Debatten können überhitzt sein. Menschen können sozialen Druck, Missverständnisse oder harte Kritik erleben.",
    missingItems: ["Meinungsfreiheit ist keine Widerspruchsfreiheit.", "Kritik ist nicht automatisch Zensur.", "Moderation und Plattformregeln sind nicht dasselbe wie staatliche Unterdrückung."],
    sources: ["gg_art_5", "eu_dsa", "debunking_handbook"],
  },
  {
    title: "„Mainstreammedien lügen alle“",
    slug: "mainstreammedien-luegen-alle",
    subtitle: "Medienkritik oder Medienfeindbild?",
    shortJudgement: "Pauschal irreführend.",
    narrativeFamilies: ["Medienfeindbild", "Zersetzung"],
    riskLevel: "hoch",
    themes: ["Medien", "Desinformation"],
    sdgs: ["SDG 16"],
    sdgPlus: ["Medienqualität", "Quellenklarheit", "Schutz vor Manipulation"],
    abstract: "Medien können Fehler machen, einseitig berichten oder blinde Flecken haben. Irreführend wird die Aussage, wenn aus berechtigter Medienkritik die pauschale Behauptung wird, alle professionellen Medien seien Teil einer Lügenstruktur.",
    summary: {
      judgement: "Pauschal irreführend.",
      true_core: "Medien können Fehler machen und müssen kritisiert werden.",
      problem: "Einzelne Fehler werden zur Gesamtdelegitimierung aller Medien genutzt.",
      narrative: "Medienfeindbild / Quellenzerstörung / Zersetzung.",
      risk: "Quellenvertrauen sinkt, Desinformation wird anschlussfähiger.",
      host_answer: "Medienkritik ist wichtig. Aber „alle lügen“ ist kein Argument, sondern ein Vertrauenszerstörer.",
    },
    answers: {
      ten_seconds: "Medienkritik ist wichtig. Aber „alle lügen“ ist kein Argument, sondern ein Vertrauenszerstörer.",
      thirty_seconds: "Der wahre Kern ist: Medien machen Fehler und müssen kritisiert werden. Der Denkfehler ist, daraus zu machen: Alle lügen. Wirkungsökonomisch zählt Quellenklarheit: Welche Quelle sagt was, mit welchen Belegen, und wie wird korrigiert?",
      two_minutes: "Ich ordne das kurz ein. Medienkritik ist demokratisch notwendig. Journalismus kann Fehler machen, blinde Flecken haben oder Perspektiven vernachlässigen. Aber „Mainstreammedien lügen alle“ zerstört pauschal Vertrauen in professionelle Quellen. Dann bleibt oft nicht bessere Information übrig, sondern nur noch Verdacht. Wirkungsökonomisch schwächt das demokratische Korrektur: Wenn niemand mehr irgendeiner überprüfbaren Quelle traut, gewinnen Desinformation, Erregung und Manipulation. Die bessere Frage lautet: Welche konkrete Behauptung prüfen wir, mit welchen Quellen?",
    },
    redirectQuestion: "Welche konkrete Meldung meinst du - und welche bessere Quelle hast du dafür?",
    trueText: "Medien können Fehler machen, ökonomischem Druck unterliegen, Perspektiven vernachlässigen oder unvollständig berichten.",
    missingItems: ["Konkrete Kritik ersetzt pauschale Delegitimierung.", "Professionelle Medien haben Korrekturprozesse, Standards und öffentliche Kritikräume.", "Ohne Quellenordnung wird Desinformation plausibler."],
    sources: ["unesco_media_literacy", "reporters_without_borders", "bpb_desinformation"],
  },
  {
    title: "„Die da oben machen sowieso, was sie wollen“",
    slug: "die-da-oben",
    subtitle: "Ohnmachts- und Institutionenmisstrauensframe",
    shortJudgement: "Ohnmachts- und Institutionenmisstrauensframe.",
    narrativeFamilies: ["Ohnmacht", "Kontrollverlust", "Zersetzung"],
    riskLevel: "hoch",
    themes: ["Demokratie", "Institutionen"],
    sdgs: ["SDG 16"],
    sdgPlus: ["institutionelles Vertrauen", "Beteiligung", "Rechtsstaatlichkeit"],
    abstract: "Der Satz greift reale Erfahrungen von Distanz, Intransparenz oder ungleichem Einfluss auf. Problematisch wird er, wenn demokratische Korrekturmöglichkeiten pauschal als sinnlos dargestellt werden.",
    summary: {
      judgement: "Teilweise nachvollziehbares Gefühl, aber als Totalframe demokratisch schädlich.",
      true_core: "Politische Prozesse können intransparent wirken und ungleiche Einflussmöglichkeiten enthalten.",
      problem: "Aus Kritik wird Ohnmacht: demokratische Beteiligung erscheint zwecklos.",
      narrative: "Ohnmacht / Kontrollverlust / Institutionenmisstrauen.",
      risk: "Beteiligung sinkt, autoritäre Erzählungen werden anschlussfähiger.",
      host_answer: "Machtkritik ist legitim. Aber Ohnmacht ist keine Strategie.",
    },
    answers: {
      ten_seconds: "Machtkritik ist legitim. Aber Ohnmacht ist keine Strategie. Welche konkrete Entscheidung meinst du?",
      thirty_seconds: "Der wahre Kern ist: Politik kann intransparent wirken. Der Denkfehler ist: Daraus zu machen, Beteiligung sei sinnlos. Demokratie lebt von Kritik, Kontrolle, Öffentlichkeit und Korrektur.",
      two_minutes: "Ich ordne das kurz ein. Viele Menschen erleben Politik als weit weg, langsam oder unfair. Das darf man kritisieren. Aber der Satz „die da oben“ macht aus konkreter Machtkritik ein pauschales Ohnmachtsgefühl. Dann verschwinden Zuständigkeiten, Verfahren und Korrekturmöglichkeiten. Wirkungsökonomisch ist das riskant: Wer demokratische Wege für sinnlos hält, sucht schneller nach autoritären Abkürzungen oder zieht sich komplett zurück. Die bessere Frage lautet: Welche Entscheidung war intransparent, welche Kontrolle fehlt, und welcher demokratische Hebel ist nutzbar?",
    },
    redirectQuestion: "Welche konkrete Entscheidung ist intransparent oder unverhältnismäßig?",
    trueText: "Es gibt reale Machtasymmetrien, Lobbyeinfluss, Intransparenz und Enttäuschung über politische Verfahren.",
    missingItems: ["Demokratie hat Korrekturwege: Öffentlichkeit, Gerichte, Wahlen, Parlamente, Medien, Protest, Beteiligung.", "Pauschale Ohnmacht schwächt genau diese Wege.", "Konkrete Zuständigkeit ist stärker als diffuses Feindbild."],
    sources: ["gg_art_5", "bpb_desinformation"],
  },
  {
    title: "„Das ist alles gesteuert“",
    slug: "das-ist-alles-gesteuert",
    subtitle: "Verschwörungsframe gegen demokratische Komplexität",
    shortJudgement: "Verschwörungsframe.",
    narrativeFamilies: ["Elitenverschwörung", "Kontrollverlust"],
    riskLevel: "sehr hoch",
    themes: ["Verschwörung", "Demokratie"],
    sdgs: ["SDG 16"],
    sdgPlus: ["Schutz vor Manipulation", "Quellenklarheit", "institutionelles Vertrauen"],
    abstract: "Der Satz deutet komplexe Prozesse als geheimen Plan. Er bietet emotionale Ordnung, ersetzt aber Belege, Zuständigkeiten und überprüfbare Kritik durch Generalverdacht.",
    summary: {
      judgement: "Verschwörungsframe mit hohem Wirkungsrisiko.",
      true_core: "Macht, Interessen und strategische Kommunikation existieren.",
      problem: "Komplexe Prozesse werden ohne Beleg als geheime Gesamtsteuerung gedeutet.",
      narrative: "Elitenverschwörung / Kontrollverlust.",
      risk: "Belege verlieren Bedeutung, Feindbilder und Desinformation werden plausibler.",
      host_answer: "Machtkritik braucht Belege. Verdacht ersetzt keine Prüfung.",
    },
    answers: {
      ten_seconds: "Machtkritik braucht Belege. Verdacht ersetzt keine Prüfung.",
      thirty_seconds: "Der wahre Kern ist: Es gibt Interessen und Einfluss. Der Denkfehler ist, daraus einen geheimen Gesamtplan zu machen. Die bessere Frage lautet: Wer entscheidet was, mit welchen Belegen?",
      two_minutes: "Ich ordne das kurz ein. Natürlich gibt es Interessen, Lobbyismus und strategische Kommunikation. Aber „alles gesteuert“ ist analytisch zu groß und empirisch zu klein. Es erklärt alles und prüft nichts. Wirkungsökonomisch ist das gefährlich, weil der Satz jedes Gegenargument schon als Teil der Steuerung deuten kann. Dann verlieren Belege, Verfahren und konkrete Zuständigkeiten ihren Wert. Die bessere demokratische Frage lautet: Welche konkrete Entscheidung, welche Quelle, welche Akteure, welche Belege und welche Kontrolle?",
    },
    redirectQuestion: "Welche konkrete Entscheidung meinst du - und welche Belege zeigen Steuerung?",
    trueText: "Es gibt Macht, Interessen, Lobbyismus, Plattformlogik und strategische Kommunikation.",
    missingItems: ["Aus Einfluss folgt nicht automatisch geheime Gesamtsteuerung.", "Verschwörungslogik immunisiert sich oft gegen Gegenbelege.", "Demokratische Kritik braucht konkrete Akteure, Daten und Verfahren."],
    sources: ["bpb_desinformation", "debunking_handbook"],
  },
  {
    title: "„Die Wissenschaft ist gekauft“",
    slug: "die-wissenschaft-ist-gekauft",
    subtitle: "Kritik oder Delegitimierung?",
    shortJudgement: "Pauschale Delegitimierung wissenschaftlicher Korrekturprozesse.",
    narrativeFamilies: ["Wissenschaftsdelegitimierung", "Elitenverschwörung"],
    riskLevel: "hoch",
    themes: ["Wissenschaft", "Faktenbasis"],
    sdgs: ["SDG 4", "SDG 9", "SDG 16"],
    sdgPlus: ["Wissensqualität", "Quellenklarheit", "institutionelles Vertrauen"],
    abstract: "Wissenschaft kann Fehler machen, Interessenkonflikte haben und muss kritisierbar bleiben. Irreführend wird die Aussage, wenn daraus folgt, Wissenschaft sei grundsätzlich korrupt, beliebig oder bloß Meinung.",
    summary: {
      judgement: "Pauschal irreführend.",
      true_core: "Wissenschaft kann Fehler, Interessenbindungen und Bias enthalten.",
      problem: "Aus möglicher Fehlbarkeit wird grundsätzliche Korruption gemacht.",
      narrative: "Wissenschaftsdelegitimierung / Elitenverschwörung.",
      risk: "Gemeinsame Faktenbasis und demokratische Entscheidungsfähigkeit sinken.",
      host_answer: "Wissenschaft ist nicht unfehlbar. Aber Kritik braucht Belege, nicht nur Misstrauen.",
    },
    answers: {
      ten_seconds: "Wissenschaft ist nicht unfehlbar. Aber Kritik braucht Belege, nicht nur Misstrauen.",
      thirty_seconds: "Der wahre Kern ist: Wissenschaft kann Fehler und Interessenkonflikte haben. Der Denkfehler ist: Daraus zu machen, alles sei gekauft. Wissenschaft ist ein Korrektursystem. Man prüft Methode, Daten, Finanzierung, Replikation und Fachkonsens.",
      two_minutes: "Ich ordne das kurz ein. Wissenschaft ist nicht perfekt. Es gibt Fehler, Bias, schlechte Studien und Interessenkonflikte. Aber genau deshalb gibt es Methoden, Peer Review, Replikation, Datenprüfung und Fachdebatten. Der Satz „die Wissenschaft ist gekauft“ macht aus Kritik ein Misstrauenssystem. Dann zählt nicht mehr, welche Daten besser sind, sondern nur noch, wem man glaubt. Wirkungsökonomisch ist das gefährlich, weil Demokratie eine überprüfbare Wissensinfrastruktur braucht. Die bessere Frage lautet: Welche Studie, welche Methode, welche Daten, welche Finanzierung - und was sagt die Fachlage insgesamt?",
    },
    redirectQuestion: "Welche konkrete Studie meinst du - und was genau ist an Methode, Daten oder Finanzierung problematisch?",
    trueText: "Wissenschaft kann Fehler, Bias, Interessenkonflikte, schlechte Studiendesigns und Finanzierungsprobleme enthalten.",
    missingItems: ["Wissenschaft ist ein Korrektursystem, keine einzelne Autorität.", "Kritik braucht Methode, Daten, Replikation, Finanzierung und Fachlage.", "Pauschaler Verdacht ersetzt keine bessere Evidenz."],
    sources: ["wissenschaftsrat_open_science", "debunking_handbook"],
  },
  {
    title: "„SDGs / Agenda 2030 sind Weltregierung“",
    slug: "sdgs-weltregierung",
    detailSlug: "sdgs-weltregierung",
    subtitle: "Verschwörungsframe gegen globale Kooperation",
    shortJudgement: "Verschwörungsframe gegen globale Kooperation.",
    narrativeFamilies: ["Kontrollverlust", "Elitenverschwörung", "Anti-Kooperationsframe"],
    riskLevel: "hoch",
    themes: ["SDGs", "Globale Kooperation", "Wirkungsökonomie"],
    sdgs: ["SDG 17", "SDG 16"],
    sdgPlus: ["Rechtsstaatlichkeit", "Demokratie", "Transparenz"],
    abstract: "Die Aussage deutet einen globalen Zielrahmen in ein Herrschaftsnarrativ um. Der wahre Kern ist: Internationale Ziele brauchen demokratische Kontrolle, transparente Umsetzung und offene Kritik. Irreführend wird die Aussage, wenn Kooperation mit Fremdherrschaft gleichgesetzt wird.",
    summary: {
      judgement: "Irreführend / Verschwörungsframe.",
      true_core: "Globale Ziele brauchen demokratische Kontrolle und transparente Umsetzung.",
      problem: "Kooperation wird als Herrschaft umgedeutet.",
      narrative: "Kontrollverlust / Elitenverschwörung / Anti-Kooperationsframe.",
      risk: "Misstrauen gegen globale Problemlösung und demokratische Institutionen steigt.",
      host_answer: "Globale Ziele sind keine Weltregierung. Die Frage ist demokratische Umsetzung, nicht Fantasie von Fremdherrschaft.",
    },
    answers: {
      ten_seconds: "Globale Ziele sind keine Weltregierung. Die SDGs sind ein Zielrahmen - entscheidend ist demokratische, transparente Umsetzung.",
      thirty_seconds: "Der wahre Kern ist: Globale Ziele brauchen demokratische Kontrolle. Aber daraus folgt keine Weltregierung. Die SDGs sind gemeinsame Ziele gegen Armut, Hunger, Klimaschäden und Ungleichheit. Die WÖk ergänzt sie mit SDG+, damit Demokratie und Rechtsstaatlichkeit sichtbar bleiben.",
      two_minutes: "Ich nehme die Sorge vor Fremdbestimmung ernst. Aber „SDGs sind Weltregierung“ ist ein Verschwörungsframe. Er macht aus globaler Kooperation eine angebliche Herrschaftsstruktur. Viele Probleme sind nicht rein national lösbar: Klima, Lieferketten, Pandemien, Migration, Ernährung, Ressourcen und Frieden. Die richtige Kritik lautet nicht „alles ist Weltregierung“, sondern: Wie werden Ziele demokratisch beschlossen, transparent kontrolliert und lokal gerecht umgesetzt? Genau dafür braucht die Wirkungsökonomie SDG+.",
    },
    redirectQuestion: "Welche konkrete Entscheidung meinst du - und welche demokratische Institution wurde dadurch tatsächlich ersetzt?",
    trueText: "Globale Ziele brauchen demokratische Kontrolle, transparente Umsetzung und offene Kritik.",
    missingItems: ["Ein Zielrahmen ist keine Regierung.", "Nationale Parlamente, Gerichte und Verfahren werden nicht automatisch ersetzt.", "Globale Probleme brauchen Kooperation und demokratische Kontrolle zugleich."],
    sources: ["un_sdgs", "gg_art_5"],
  },
  {
    title: "„Wirkungsökonomie ist Social Credit“",
    slug: "wirkungsoekonomie-social-credit",
    subtitle: "Überwachungsframe gegen Wirkungsmessung",
    shortJudgement: "Irreführender Überwachungsframe.",
    narrativeFamilies: ["Kontrollverlust", "Social-Credit-Frame", "Technokratieangst"],
    riskLevel: "hoch",
    themes: ["Wirkungsökonomie", "Daten", "Freiheit"],
    sdgs: ["SDG 16"],
    sdgPlus: ["digitale Selbstbestimmung", "Rechtsstaatlichkeit", "Schutz vor Überwachung"],
    abstract: "Die Aussage greift eine berechtigte Sorge auf: Wirkungsmessung darf niemals zur Personenbewertung, Überwachung oder politischen Gehorsamskontrolle werden. Irreführend wird sie, wenn Produkt-, Unternehmens-, Investitions- oder Politikwirkung mit Social Credit gleichgesetzt wird.",
    summary: {
      judgement: "Irreführender Überwachungsframe mit berechtigtem Sorgenkern.",
      true_core: "Wirkungsmessung kann missbraucht werden, wenn sie undemokratisch, personenbezogen oder intransparent ist.",
      problem: "Produkt- und Systemwirkung wird mit Personenüberwachung gleichgesetzt.",
      narrative: "Social-Credit-Frame / Kontrollverlust / Technokratieangst.",
      risk: "Notwendige Wirkungsdaten werden delegitimiert, obwohl sie für faire Preise und bessere Rückkopplung nötig sind.",
      host_answer: "Die WÖk bewertet nicht den Menschen als Person, sondern die Wirkung von Produkten, Organisationen, Kapital und Entscheidungen.",
    },
    answers: {
      ten_seconds: "Die WÖk bewertet nicht den Menschen als Person, sondern die Wirkung von Produkten, Organisationen, Kapitalflüssen und Entscheidungen.",
      thirty_seconds: "Der wahre Kern ist: Wirkungsmessung darf nie zu Überwachung oder Gehorsamsscores werden. Der Denkfehler ist, jede Wirkungsbewertung mit Social Credit gleichzusetzen. Die WÖk braucht gerade deshalb Datenschutz, Transparenz, demokratische Kontrolle und klare rote Linien.",
      two_minutes: "Ich ordne das ein. Die Sorge ist wichtig: Kein System darf Menschen nach Gehorsam, Meinung oder Lebensstil bewerten. Genau das wäre eine rote Linie. Aber die Wirkungsökonomie meint etwas anderes. Sie fragt nicht: Ist dieser Mensch gut oder schlecht? Sie fragt: Welche Wirkung hat ein Produkt, ein Unternehmen, ein Kapitalfluss, eine politische Maßnahme oder eine Lieferkette? Das ist eher vergleichbar mit ehrlicheren Preisen, Produktscorecards, Umwelt- und Sozialdaten, nicht mit Personenüberwachung. Wirkungsökonomisch gilt: Wirkungsmessung ohne Demokratie wäre gefährlich. Deshalb gehören SDG+, Datenschutz, Rechtsstaatlichkeit, Transparenz, Wirkungsrat und Missbrauchsschutz zum System.",
    },
    redirectQuestion: "Meinst du Personenbewertung - oder die Bewertung von Produkt-, Unternehmens- und Lieferkettenwirkung?",
    trueText: "Wirkungsmessung kann missbraucht werden, wenn sie personenbezogen, intransparent oder undemokratisch eingesetzt wird.",
    missingItems: ["Die WÖk bewertet keine Menschen als Personen.", "Rote Linien sind keine Gehorsamsscores, Meinungsscores, Lebensstilrankings oder politische Loyalitätsbewertung.", "Bewertet werden Produkt-, Organisations-, Kapital-, Lieferketten- und Maßnahmenwirkungen."],
    sources: ["gg_art_5", "eu_dsa"],
    woekCritical: true,
  },
  {
    title: "„Wirkungsökonomie ist Planwirtschaft“",
    slug: "wirkungsoekonomie-planwirtschaft",
    subtitle: "Falscher Systemvergleich",
    shortJudgement: "Falscher Systemvergleich.",
    narrativeFamilies: ["Planwirtschaftsframe", "Freiheitsangst", "Marktmissverständnis"],
    riskLevel: "hoch",
    themes: ["Wirkungsökonomie", "Markt", "Staat"],
    sdgs: ["SDG 8", "SDG 9", "SDG 12", "SDG 16"],
    sdgPlus: ["Freiheit", "demokratische Kontrolle", "institutionelles Vertrauen"],
    abstract: "Die Aussage enthält einen berechtigten Sorgenkern: Wirkungsmessung darf nicht in zentrale Detailsteuerung, Innovationsfeindlichkeit oder staatliche Bevormundung kippen. Irreführend wird sie, wenn Wirkungsökonomie mit Planwirtschaft gleichgesetzt wird.",
    summary: {
      judgement: "Falscher Systemvergleich mit berechtigtem Sorgenkern.",
      true_core: "Zentrale Steuerung kann Freiheit, Innovation und Marktdynamik beschädigen.",
      problem: "Wirkungsbasierte Rückkopplung wird mit staatlicher Produktionsplanung verwechselt.",
      narrative: "Planwirtschaftsframe / Freiheitsangst / Marktmissverständnis.",
      risk: "Bessere Preis- und Steuerinformationen werden als Freiheitsverlust delegitimiert.",
      host_answer: "Die WÖk ersetzt Märkte nicht. Sie sorgt dafür, dass Märkte Wirkung nicht länger ausblenden.",
    },
    answers: {
      ten_seconds: "Die WÖk ersetzt Märkte nicht. Sie sorgt dafür, dass Märkte Wirkung nicht länger ausblenden.",
      thirty_seconds: "Der wahre Kern ist: Planwirtschaft wäre problematisch. Der Denkfehler ist, Wirkungsrückkopplung mit Planwirtschaft zu verwechseln. Die WÖk lässt Preise, Wettbewerb und Eigentum bestehen - aber sie macht Schäden sichtbar, die heute ausgelagert werden.",
      two_minutes: "Ich ordne das ein. Planwirtschaft bedeutet, dass der Staat Produktion, Mengen und Verteilung zentral vorgibt. Die Wirkungsökonomie tut das nicht. Sie sagt nicht: Der Staat entscheidet, was du kaufst. Sie sagt: Wenn ein Produkt Klima, Gesundheit, Arbeit oder Demokratie beschädigt, darf dieser Schaden nicht unsichtbar bleiben. Preise und Steuern sollen mehr Wahrheit tragen. Wettbewerb bleibt - aber nicht mehr um die größte Externalisierung, sondern um die beste positive Netto-Wirkung. Der Staat ist dabei nicht allmächtiger Planer, sondern Rückkopplungsarchitekt.",
    },
    redirectQuestion: "Meinst du zentrale Produktionsplanung - oder dass Preise künftig Folgeschäden ehrlicher abbilden sollen?",
    trueText: "Zentrale Detailsteuerung kann Freiheit, Innovation, Wettbewerb und Marktdynamik beschädigen.",
    missingItems: ["Die WÖk ersetzt Märkte nicht.", "Sie verändert Rückkopplung, Preise, Standards und Transparenz.", "Nicht Plan statt Markt, sondern Markt mit Wirkungswahrheit."],
    sources: ["gg_art_5"],
    woekCritical: true,
  },
  {
    title: "„Das ist Zensur“",
    slug: "das-ist-zensur",
    subtitle: "Zensur, Kritik, Moderation oder Plattformregel?",
    shortJudgement: "Oft Verwechslung von Zensur, Moderation, Kritik und Plattformregeln.",
    narrativeFamilies: ["Opferumkehr", "Sagbarkeitsnarrativ", "Kontrollverlust"],
    riskLevel: "mittel",
    themes: ["Meinungsfreiheit", "Moderation"],
    sdgs: ["SDG 16"],
    sdgPlus: ["Diskursfähigkeit", "Medienqualität", "Rechtsstaatlichkeit"],
    abstract: "Die Aussage kann berechtigt sein, wenn staatliche Stellen Meinungen unrechtmäßig unterdrücken. Irreführend wird sie, wenn jede Kritik, jeder Faktencheck, jede Moderation oder jede Plattformregel als Zensur bezeichnet wird.",
    summary: {
      judgement: "Kommt auf den Fall an; häufig irreführend.",
      true_core: "Echte Zensur ist demokratisch hochproblematisch.",
      problem: "Kritik, Moderation und Faktencheck werden mit Zensur verwechselt.",
      narrative: "Opferumkehr / Kontrollverlust / Sagbarkeitsnarrativ.",
      risk: "Moderation, Faktencheck und Schutz vor Desinformation werden delegitimiert.",
      host_answer: "Zensur ist ein schwerer Vorwurf. Kritik, Widerspruch und Moderation sind nicht automatisch Zensur.",
    },
    answers: {
      ten_seconds: "Zensur ist ein schwerer Vorwurf. Kritik, Widerspruch und Moderation sind nicht automatisch Zensur.",
      thirty_seconds: "Der wahre Kern ist: Staatliche Zensur wäre gefährlich. Der Denkfehler ist, jeden Widerspruch oder Faktencheck Zensur zu nennen. Meinungsfreiheit schützt vor staatlicher Unterdrückung - nicht vor Kritik oder Moderation.",
      two_minutes: "Ich ordne das ein. Zensur ist ein ernstes Thema. Wenn der Staat unrechtmäßig Meinungen unterdrückt, ist das ein demokratisches Problem. Aber viele nutzen den Begriff, wenn sie Widerspruch bekommen, wenn eine Plattform Regeln anwendet oder wenn eine falsche Behauptung geprüft wird. Das ist nicht automatisch Zensur. Wirkungsökonomisch ist wichtig: Wenn alles Zensur genannt wird, verlieren wir die Fähigkeit, echte Freiheitsverletzungen von notwendiger Diskursmoderation zu unterscheiden.",
    },
    redirectQuestion: "Meinst du staatliche Unterdrückung, Kritik, Faktencheck oder Plattformmoderation?",
    trueText: "Echte staatliche Zensur ist demokratisch hochproblematisch und muss klar benannt werden.",
    missingItems: ["Kritik ist keine Zensur.", "Moderation ist nicht automatisch Zensur.", "Meinungsfreiheit heißt nicht Reichweitengarantie und nicht Widerspruchsfreiheit."],
    sources: ["gg_art_5", "eu_dsa"],
  },
  {
    title: "„Man wird doch wohl fragen dürfen“",
    slug: "man-wird-doch-wohl-fragen-duerfen",
    subtitle: "Frage, Frame oder getarnte Behauptung?",
    shortJudgement: "Frage kann legitim sein, wird aber oft als unbelegte Behauptung getarnt.",
    narrativeFamilies: ["Stöckchen", "Normalisierung", "Frame-Verschiebung"],
    riskLevel: "mittel",
    themes: ["Diskurs", "Framing"],
    sdgs: ["SDG 16"],
    sdgPlus: ["Diskursfähigkeit", "Quellenklarheit"],
    abstract: "Fragen sind legitim und wichtig. Problematisch wird die Formel, wenn sie eine unbelegte Behauptung als bloße Frage tarnt und Kritik an der Prämisse als Denkverbot rahmt.",
    summary: {
      judgement: "Kommt auf die Frage an; häufig Frame-Verschiebung.",
      true_core: "Fragen, Zweifel und Widerspruch sind demokratisch legitim.",
      problem: "Eine unbelegte Behauptung wird als Frage getarnt.",
      narrative: "Stöckchen / Normalisierung / Frame-Verschiebung.",
      risk: "Unbelegte Prämissen wandern in den Diskurs, ohne geprüft zu werden.",
      host_answer: "Fragen ja. Aber dann prüfen wir auch die Prämisse.",
    },
    answers: {
      ten_seconds: "Fragen ja. Aber dann prüfen wir auch die Prämisse.",
      thirty_seconds: "Der wahre Kern ist: Man darf fragen. Der Denkfehler ist, eine Behauptung als Frage zu tarnen und Kritik daran als Denkverbot zu rahmen. Gute Fragen sind prüfbar.",
      two_minutes: "Ich ordne das kurz ein. Fragen sind demokratisch wichtig. Aber manche Formeln sind keine offenen Fragen, sondern Stöckchen: Sie transportieren schon eine Behauptung und verlangen, dass alle im gesetzten Frame antworten. Wirkungsökonomisch ist die bessere Reaktion: Frage ernst nehmen, Prämisse prüfen, Quelle nennen lassen und zur klärbaren Aussage zurückführen. Wer wirklich fragt, hält auch Prüfung aus.",
    },
    redirectQuestion: "Welche Behauptung steckt in der Frage - und welche Quelle spricht dafür?",
    trueText: "Fragen, Zweifel und Kritik sind legitime Bestandteile demokratischer Debatte.",
    missingItems: ["Eine Frage kann eine unbelegte Prämisse transportieren.", "Gute Fragen sind konkret und prüfbar.", "Kritik an der Frage ist nicht automatisch Unterdrückung."],
    sources: ["debunking_handbook", "bpb_desinformation"],
  },
];

const detailSlugs = [
  "man-darf-ja-nichts-mehr-sagen",
  "mainstreammedien-luegen-alle",
  "die-wissenschaft-ist-gekauft",
  "sdgs-weltregierung",
  "wirkungsoekonomie-social-credit",
  "wirkungsoekonomie-planwirtschaft",
];

const existingClimateDetails = [
  ["sdgs-sind-weltregierung/", "Internationale Kooperation", "„Die SDGs sind Weltregierung“", "Kooperationsrahmen, Herrschaftsframe und demokratische Entscheidung."],
  ["deutschland-nur-zwei-prozent/", "Klima & Energie", "„Deutschland ist nur für 2 % verantwortlich“", "Territorialer Anteil, Verantwortung und globale Hebelwirkung."],
  ["energiewende-gescheitert/", "Klima & Energie", "„Die Energiewende ist gescheitert“", "Scheiternsframe statt Engpassanalyse."],
  ["e-autos-schlimmer-als-verbrenner/", "Klima & Energie", "„E-Autos sind schlimmer als Verbrenner“", "Rohstoffangst und Lebenszyklusvergleich."],
  ["batterien-sind-nicht-recyclebar/", "Klima & Energie", "„Batterien sind nicht recyclebar“", "Akku-Faktencheck, Batteriechemie, Recycling und Kreislaufanalyse."],
  ["kernenergie-wieder-in-deutschland/", "Klima & Energie", "„Kernkraft zurück?“", "CO₂-armer Betrieb, Zeitfenster, Kosten, Endlager und Alternativen."],
  ["kernenergie-einfache-loesung/", "Klima & Energie", "„Kernenergie wäre die einfache Lösung“", "Zeit-, Kosten- und Risikooffenheiten."],
  ["fusion-loest-das-energieproblem/", "Klima & Energie", "Fusion löst das Energieproblem?", "Forschung ja, Aufschub nein."],
];

const freedomBox = {
  title: "Freiheit schützen, ohne Wirkungsblindheit",
  text: "Die Wirkungsökonomie ersetzt Freiheit nicht durch Kontrolle. Sie fragt, welche Wirkungen durch Produkte, Unternehmen, Kapitalflüsse, Medienräume und politische Entscheidungen entstehen. Freiheit braucht Wirklichkeitsbindung: falsche Preise, unsichtbare Schäden, manipulierte Öffentlichkeit und systematische Desinformation schränken echte Freiheit ein.",
  bullets: ["Keine Personenbewertung.", "Keine politische Loyalitätsbewertung.", "Keine Lebensstilpolizei.", "Keine zentrale Produktionsplanung.", "Ja zu Transparenz, Datenschutz, demokratischer Kontrolle und Missbrauchsschutz."],
};

const notThisItems = ["kein Wahrheitsministerium", "kein Zensurinstrument", "kein Parteiblog", "keine Personenbewertung", "kein Social-Credit-System", "kein Ersatz für Journalismus", "kein Ersatz für Wissenschaft", "kein Ersatz für demokratischen Streit"];

const responseRows = [
  ["Opferumkehr", "Man darf ja nichts mehr sagen.", "Du darfst das sagen. Andere dürfen widersprechen.", "Meinungsfreiheit ist nicht Widerspruchsfreiheit."],
  ["Medienfeindbild", "Mainstreammedien lügen alle.", "Medienkritik ja, pauschale Quellenzerstörung nein.", "Welche konkrete Quelle und welche konkrete Aussage prüfen wir?"],
  ["Wissenschaftsdelegitimierung", "Die Wissenschaft ist gekauft.", "Wissenschaft ist fehlbar, aber Kritik braucht Belege.", "Welche Methode, Daten oder Finanzierung sind problematisch?"],
  ["Kontrollverlust", "Die da oben wollen uns kontrollieren.", "Machtkritik ist legitim, aber Verdacht ersetzt keine Belege.", "Welche konkrete Entscheidung ist intransparent oder unverhältnismäßig?"],
  ["Social-Credit-Frame", "Wirkungsökonomie bewertet Menschen.", "Nein. Sie bewertet Wirkungen von Produkten, Organisationen und Entscheidungen.", "Wie sichern wir Wirkungsmessung demokratisch gegen Missbrauch?"],
  ["Planwirtschaftsframe", "Wirkungsökonomie ist Planwirtschaft.", "Nein. Märkte bleiben, aber Preise tragen mehr Wirkungswahrheit.", "Was ist der Unterschied zwischen zentralem Plan und ehrlicher Preisrückkopplung?"],
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function words(value) {
  return String(value || "").split(/\s+/).filter(Boolean).length;
}

function sentence(value) {
  const text = String(value || "");
  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
}

function isComplexYaml(value) {
  return value && typeof value === "object";
}

function yamlScalar(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (value == null) return "null";
  return String(value);
}

function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `\n${value
      .map((item) => (isComplexYaml(item) ? `${pad}-${toYaml(item, indent + 2)}` : `${pad}- ${yamlScalar(item)}`))
      .join("\n")}`;
  }
  if (value && typeof value === "object") {
    return `\n${Object.entries(value)
      .map(([key, item]) => (isComplexYaml(item) ? `${pad}${key}:${toYaml(item, indent + 2)}` : `${pad}${key}: ${yamlScalar(item)}`))
      .join("\n")}`;
  }
  return yamlScalar(value);
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function pageShell({ title, description, canonical, base, main, searchType = "Demokratie & Öffentlichkeit", assetVersion = "20260603-democracy-public" }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_section" content="Wirkungsradar">
    <meta name="search_type" content="${escapeHtml(searchType)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260606-nav-cache-fix">
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
          <p><a class="text-link" href="${base}wirkungsradar/narrativ-einreichen/">Narrativ zur Prüfung einreichen</a></p>
        </div>
        <a class="btn btn-primary" href="${base}kompass.html">WÖk-Kompass öffnen</a>
      </div>
    </footer>
    <script src="${base}assets/js/main.js?v=20260606-main-cache-fix"></script>
  </body>
</html>
`;
}

function topicSubnav(current, baseToRadar = "../") {
  const links = [["Überblick", "../"], ["Methode", "../methode/"], ["Wissen", "../wissen/"], ["Live", "../live/"], ["Narrative", "../narrative/"], ["Psychologie", "../psychologie/"], ["Themen", "../themen/"], ["Detail", "../detail/"], ["Was er nicht ist", "../was-der-wirkungsradar-nicht-ist/"]];
  return `<nav class="topic-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude>
${links.map(([label, href]) => `        <a href="${baseToRadar}${href}"${label === current ? ' aria-current="page"' : ""}>${label}</a>`).join("\n")}
      </nav>`;
}

function summaryGrid(items, label, className = "") {
  return `<div class="radar-summary-grid ${className}" aria-label="${escapeHtml(label)}">
${items.map(([itemLabel, value, tone = "neutral"]) => `          <article class="radar-summary-item" data-tone="${escapeHtml(tone)}"><p class="radar-summary-label">${escapeHtml(itemLabel)}</p><p class="radar-summary-value">${escapeHtml(value)}</p></article>`).join("\n")}
        </div>`;
}

function cleanList(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

const psychologyNotice =
  "Psychologische Effekte sind keine Diagnose einzelner Personen. Sie beschreiben allgemeine menschliche Wahrnehmungs- und Kommunikationsmuster. Der Wirkungsradar nutzt sie, um Frames, Resonanzräume und Wirkungsrisiken sichtbar zu machen - nicht um Menschen abzuwerten.";

const hostControlSteps = [
  "Stoppen: nicht sofort auf den Köder reagieren.",
  "Frame markieren: Ich beantworte das, aber ich übernehme nicht den Frame.",
  "Wahren Kern anerkennen.",
  "Denkfehler oder psychologisches Muster benennen.",
  "Zur Wirkungsfrage zurückführen.",
  "Konkrete Lösung verlangen.",
];

const democracyPsychologyBySlug = {
  "man-darf-ja-nichts-mehr-sagen": {
    effects: ["Reaktanz", "Kognitive Dissonanz", "Identitätsschutz-Kognition"],
    triggers: ["Kränkung", "Trotz", "Opfergefühl"],
    patterns: ["Opferumkehr", "Widerspruch als Zensur rahmen", "Beweislastumkehr"],
    why: "Der Satz verwandelt Kritik in Unterdrückung. Dadurch muss nicht mehr über Wirkung, Verantwortung oder konkrete Aussage gesprochen werden.",
  },
  "mainstreammedien-luegen": {
    effects: ["Hostile-Media-Effekt", "Bestätigungsfehler", "Illusory Truth Effect"],
    triggers: ["Misstrauen", "Zugehörigkeit", "Kontrollbedürfnis"],
    patterns: ["Quellenzerstörung", "Pauschaldelegitimierung", "Echokammer-Immunisierung"],
    why: "Wenn alle unbequemen Quellen als Lüge gelten, bleibt nur noch das eigene Lager als Wahrheitsfilter übrig.",
  },
  "die-wissenschaft-irrt-staendig": {
    effects: ["Motivated Reasoning", "Bestätigungsfehler", "Unsicherheitsaversion"],
    triggers: ["Statusschutz", "Komplexitätsstress", "Autoritätsabwehr"],
    patterns: ["Einzelfehler verallgemeinern", "Unsicherheit als Betrug rahmen", "Rosinenpickerei"],
    why: "Wissenschaftliche Korrektur wird als Schwäche gelesen, obwohl sie der eigentliche Qualitätsmechanismus ist.",
  },
  "sdgs-sind-weltregierung": {
    effects: ["Reaktanz", "Kontrollbedürfnis", "Proportionality Bias"],
    triggers: ["Souveränitätsangst", "Kontrollverlust", "Elitenverdacht"],
    patterns: ["Kooperation als Herrschaft umdeuten", "Zuständigkeiten verwischen", "Verschwörungslogik"],
    why: "Globale Koordination wirkt bedrohlich, wenn demokratische Entscheidungswege und Zuständigkeiten ausgeblendet werden.",
  },
  "wirkungsokonomie-ist-social-credit": {
    effects: ["Reaktanz", "Verlustaversion", "Kontrollbedürfnis"],
    triggers: ["Überwachungsangst", "Freiheitsalarm", "Statusbedrohung"],
    patterns: ["Bewertung mit Bestrafung verwechseln", "Transparenz als Kontrolle rahmen", "Dammbruchlogik"],
    why: "Der Social-Credit-Frame aktiviert Freiheitsabwehr, bevor geklärt ist, was gemessen, entschieden und demokratisch kontrolliert wird.",
  },
};

function psychologyForClaim(claim) {
  return democracyPsychologyBySlug[claim.slug] || {
    effects: ["Kognitive Dissonanz", "Bestätigungsfehler", "Ingroup-Outgroup-Bias"],
    triggers: [claim.narrativeFamilies?.[0] || "Narrativdruck", "Kränkung", "Zugehörigkeit"],
    patterns: ["Frame-Übernahme erzwingen", "falsche Voraussetzung setzen", "Themenverschiebung"],
    why: "Der Frame schafft emotionale Orientierung und Lagerbindung, bevor der konkrete Sachverhalt geprüft wird.",
  };
}

function renderPsychologyModule(claim) {
  const profile = psychologyForClaim(claim);
  return `<section class="section section-soft deep-dive-section" id="psychologischer-wirkungscheck">
        <div>
          <div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum der Frame hängen bleibt.</h2><p>${escapeHtml(psychologyNotice)}</p></div>
          <div class="card-grid three">
            <article class="card"><p class="card-kicker">Kognitive Effekte</p>${cleanList(profile.effects)}</article>
            <article class="card"><p class="card-kicker">Emotionale Trigger</p>${cleanList(profile.triggers)}</article>
            <article class="card"><p class="card-kicker">Gesprächsmuster</p>${cleanList(profile.patterns)}</article>
          </div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Warum es wirkt</p><p class="card-text">${escapeHtml(profile.why)}</p></article>
            <article class="card"><p class="card-kicker">Kommunikative Kontrolle zurückgewinnen</p><h3 class="card-title">Gefühl anerkennen. Frame halten. Wirkungsfrage stellen.</h3>${cleanList(hostControlSteps)}<p class="card-text"><strong>Standardsatz:</strong> Ich sehe den emotionalen Punkt. Aber ich trenne Gefühl, Fakt und Folgerung.</p></article>
          </div>
        </div>
      </section>`;
}

function renderHostControlModule() {
  return `<section class="section section-soft" id="kommunikative-kontrolle"><div><div class="section-header"><p class="hero-kicker">Live-Kompetenz</p><h2>Kommunikative Kontrolle zurückgewinnen.</h2><p>Oberhand bedeutet hier nicht Dominanz, sondern Frame-Kontrolle: ruhig bleiben, Mechanismus sichtbar machen und zur prüfbaren Wirkung zurückführen.</p></div><div class="card-grid two"><article class="card"><p class="card-kicker">Ablauf</p>${cleanList(hostControlSteps)}</article><article class="card"><p class="card-kicker">Formel</p><h3 class="card-title">Gefühl anerkennen. Frame halten. Wirkungsfrage stellen.</h3><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Frame.</p><p class="card-text">Ich sehe den emotionalen Punkt. Aber ich trenne Gefühl, Fakt und Folgerung.</p></article></div></div></section>`;
}

function renderPsychologicalStoeckchenChecklist() {
  return `<section class="section" id="psychologische-stoeckchen"><div><div class="section-header"><p class="hero-kicker">Checkliste</p><h2>Woran erkenne ich psychologische Stöckchen?</h2></div>${summaryGrid([["Emotion vor Klärung", "Wut, Angst oder Kränkung soll schneller sein als Prüfung.", "warning"], ["Falsche Voraussetzung", "Die Frage enthält bereits den Frame.", "critical"], ["Beweislastumkehr", "Du sollst endlos widerlegen, statt der Claim belegt wird.", "warning"], ["Themenverschiebung", "Nach jeder Klärung kommt der nächste Vorwurf.", "warning"], ["Identitätsfalle", "Widerspruch soll wie Angriff auf Zugehörigkeit wirken.", "critical"], ["Host-Satz", "Ich reagiere nicht auf den Köder, sondern auf den Mechanismus.", "positive"]], "Psychologische Stöckchen", "stoeckchen-warning-grid")}</div></section>`;
}

function standardBoxes(includeFreedom = true) {
  const freedomMarkup = includeFreedom
    ? `\n          <article class="card freedom-box"><p class="card-kicker">Freiheit schützen</p><h3 class="card-title">${escapeHtml(freedomBox.title)}</h3><p class="card-text">${escapeHtml(freedomBox.text)}</p>${cleanList(freedomBox.bullets)}</article>`
    : "";
  return `<section class="section section-soft democracy-standard-boxes" aria-labelledby="democracy-standards">
        <div>
          <div class="section-header"><p class="hero-kicker">Redaktionelle Leitlinie</p><h2 id="democracy-standards">Legitime Kritik ist kein Problem. Zersetzung ist ein Problem.</h2></div>
          <div class="card-grid three">
            <article class="card"><p class="card-kicker">Legitim ist</p>${cleanList(["Regierungskritik", "Medienkritik", "Wissenschaftskritik", "Kritik an SDGs, EU, Parteien oder Institutionen", "harte Meinung, Satire, Protest, Zweifel und Widerspruch"])}</article>
            <article class="card"><p class="card-kicker">Problematisch wird es</p>${cleanList(["Fakten werden systematisch verzerrt.", "Gruppen werden abgewertet oder entmenschlicht.", "Wissenschaft und Medien werden pauschal delegitimiert.", "Verschwörungslogik ersetzt Belege.", "Gewalt, Hass oder autoritäre Lösungen werden normalisiert."])}</article>
            <article class="card"><p class="card-kicker">Was der Wirkungsradar nicht ist</p>${cleanList(notThisItems)}<p class="card-text">Der Wirkungsradar ist ein Analysewerkzeug für Faktenkern, Narrativ, Wirkungspotenzial und demokratische Klärung.</p></article>
          </div>${freedomMarkup}
        </div>
      </section>`;
}

function hostAnswers(claim) {
  return `<div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(claim.answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(claim.answers.ten_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(claim.answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(claim.answers.thirty_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(claim.answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(claim.answers.two_minutes)}“</p></details>
          </div>`;
}

function effectPath(items = effectTemplate) {
  return `<ol class="timeline radar-flow radar-effect-path">
            ${items.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("\n            ")}
          </ol>`;
}

function sourceCards(sourceKeys) {
  return `<div class="card-grid democracy-source-grid">
            ${sourceKeys.map((key) => sourcePack.sources[key]).filter(Boolean).map((source) => `<article class="card">
              <p class="card-kicker">${escapeHtml(source.type)} · ${escapeHtml(source.publisher)}</p>
              <h3 class="card-title">${escapeHtml(source.label)}</h3>
              <p class="card-text">${escapeHtml(source.relevance.join(" / "))}</p>
              <p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p>
            </article>`).join("\n            ")}
          </div>`;
}

function responseMatrix() {
  return `<section class="section democracy-response-section" aria-labelledby="democracy-response-matrix">
        <div>
          <div class="section-header"><p class="hero-kicker">DemocracyResponseMatrix</p><h2 id="democracy-response-matrix">Antwortmatrix für demokratische Narrative.</h2></div>
          <div class="democracy-response-table-wrap">
            <table class="democracy-response-table">
              <thead><tr><th>Narrativ</th><th>Beispiel</th><th>Antwort</th><th>Redirect</th></tr></thead>
              <tbody>${responseRows.map(([narrative, example, response, redirect]) => `<tr><th scope="row">${escapeHtml(narrative)}</th><td>${escapeHtml(example)}</td><td>${escapeHtml(response)}</td><td>${escapeHtml(redirect)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
        </div>
      </section>`;
}

function renderClusterPage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero democracy-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Themen</a> / Demokratie &amp; Öffentlichkeit</nav>
          <p class="hero-kicker">Themencluster</p>
          <h1 class="hero-title">Demokratie &amp; Öffentlichkeit</h1>
          <p class="hero-subtitle">Narrative, Stöckchen und Wirkungspfade im demokratischen Raum</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Demokratie wird nicht nur durch Gesetze, Wahlen und Institutionen stabilisiert. Sie wird täglich durch Sprache, Medien, Plattformen, Wissenschaft, Vertrauen, Quellenklarheit und Diskurskultur gestärkt oder beschädigt. Dieser Themencluster prüft Aussagen von „Man darf ja nichts mehr sagen“ über „Mainstreammedien lügen“ bis „Wirkungsökonomie ist Social Credit“.</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauen: hoch</span></p>
        </div>
      </section>
      ${summaryGrid(clusterSummary, "Demokratie & Öffentlichkeit Summary")}
      ${topicSubnav("Themen", "../")}
      ${renderHostControlModule()}
      ${renderPsychologicalStoeckchenChecklist()}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Einordnung</p><h2>Öffentliche Aussagen sind gesellschaftliche Wirkstoffe.</h2></div><p class="radar-abstract">Öffentliche Aussagen sind nicht nur Meinungen. Sie können Vertrauen stärken oder zerstören, handlungsfähig machen oder ohnmächtig, Kritik ermöglichen oder Feindbilder erzeugen. Die Wirkungsökonomie betrachtet Demokratie als Wirkungsraum: Wahrheit, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit und institutionelles Vertrauen sind Voraussetzungen dafür, dass Mensch und Planet geschützt werden können.</p></div></section>
      ${standardBoxes()}
      ${claimIndex()}
      ${responseMatrix()}
      ${sourceSection()}
    </main>`;
  return pageShell({
    title: "Demokratie & Öffentlichkeit - Wirkungsradar",
    description: "Narrative, Mythen und Stöckchen zu Medien, Wissenschaft, Meinungsfreiheit, SDGs, Desinformation und Wirkungsökonomie im Wirkungscheck.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/themen/demokratie-oeffentlichkeit/",
    base: "../../../",
    main,
  });
}

function claimIndex() {
  return `<section class="section" id="claim-index" aria-labelledby="claim-index-title">
        <div>
          <div class="section-header"><p class="hero-kicker">ClaimIndex</p><h2 id="claim-index-title">Live-Karten Demokratie &amp; Öffentlichkeit.</h2></div>
          <div class="card-grid climate-claim-grid">
            ${claims.map((claim) => `<a class="card text-link-card climate-claim-card" href="../../live/${claim.slug}/" data-risk="${escapeHtml(claim.riskLevel)}">
              <p class="card-kicker">${escapeHtml(claim.shortJudgement)}</p>
              <h3 class="card-title">${escapeHtml(claim.title)}</h3>
              <p class="card-text">${escapeHtml(claim.narrativeFamilies.join(" / "))}</p>
              <p class="narrative-pill-row"><span data-risk="${escapeHtml(claim.riskLevel)}">Risiko: ${escapeHtml(claim.riskLevel)}</span><span>${escapeHtml(claim.sdgPlus.join(" / "))}</span></p>
            </a>`).join("\n            ")}
          </div>
        </div>
      </section>`;
}

function sourceSection() {
  return `<section class="section section-soft" aria-labelledby="democracy-sources">
        <div>
          <div class="section-header"><p class="hero-kicker">Source-Pack</p><h2 id="democracy-sources">Quellen und Prüfstand.</h2></div>
          ${sourceCards(Object.keys(sourcePack.sources))}
        </div>
      </section>`;
}

function renderSubtopic(topic) {
  const topicClaims = topic.claims.map((slug) => claims.find((claim) => claim.slug === slug)).filter(Boolean);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../../index.html">Start</a> / <a href="../../../">Wirkungsradar</a> / <a href="../../">Themen</a> / <a href="../">Demokratie &amp; Öffentlichkeit</a> / ${escapeHtml(topic.title)}</nav>
          <p class="hero-kicker">Thema</p>
          <h1 class="hero-title">${escapeHtml(topic.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(topic.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(topic.abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauen: hoch</span></p>
        </div>
      </section>
      ${summaryGrid([["Kernfrage", topic.subtitle, "neutral"], ["Claims", `${topicClaims.length} Live-Karten`, "positive"], ["SDG+", "Diskursfähigkeit, Quellenklarheit, institutionelles Vertrauen", "positive"], ["Leitlinie", "Legitime Kritik anerkennen, Zersetzung sichtbar machen.", "warning"]], `${topic.title} Summary`)}
      ${topicSubnav("Themen", "../../")}
      ${renderHostControlModule()}
      ${standardBoxes()}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Live-Karten</p><h2>Aussagen in diesem Thema.</h2></div><div class="card-grid">${topicClaims.map((claim) => `<a class="card text-link-card" href="../../../live/${claim.slug}/"><p class="card-kicker">${escapeHtml(claim.shortJudgement)}</p><h3 class="card-title">${escapeHtml(claim.title)}</h3><p class="card-text">${escapeHtml(claim.summary.host_answer)}</p></a>`).join("")}</div></div></section>
      ${responseMatrix()}
    </main>`;
  return pageShell({
    title: `${topic.title} - Demokratie & Öffentlichkeit - Wirkungsradar`,
    description: sentence(topic.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/themen/demokratie-oeffentlichkeit/${topic.slug}/`,
    base: "../../../../",
    main,
  });
}

function renderLiveCard(claim) {
  const hasDetail = detailSlugs.includes(claim.slug);
  const detailLink = hasDetail
    ? `\n      <section class="section section-soft deep-dive-live-link"><div class="card"><p class="card-kicker">Deep Dive</p><h2 class="card-title">Ausführliche Wirkungsanalyse.</h2><p class="card-text">Die Detailseite trennt Faktenkern, Ausblendungen, Evidenz, Wirkstoff, Wirkungspfad und wirkungsökonomische Lösung.</p><p><a class="btn btn-primary" href="../../detail/${claim.slug}/">Detailanalyse öffnen</a></p></div></section>`
    : "";
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
      ${summaryGrid(summaryItems(claim), `${claim.title} Summary`)}${detailLink}
      <section class="section" id="host-antworten"><div><div class="section-header"><p class="hero-kicker">Host-Antworten</p><h2>10 Sekunden, 30 Sekunden, 2 Minuten.</h2></div>${hostAnswers(claim)}</div></section>
      <section class="section section-soft"><div class="card-grid three"><article class="card"><p class="card-kicker">Frame sichtbar machen</p><h2 class="card-title">Nicht übernehmen.</h2><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Frame. Ich prüfe konkret: Welche Aussage, welche Quelle, welche Wirkung?</p></article><article class="card"><p class="card-kicker">Die bessere Frage</p><h2 class="card-title">Zur Prüfung zurück.</h2><p class="card-text">${escapeHtml(claim.redirectQuestion)}</p></article><article class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p><h2 class="card-title">Ruhig bleiben.</h2><p class="card-text">Wahren Kern anerkennen, Denkfehler benennen, Narrativ sichtbar machen und zur demokratischen Wirkungsfrage zurückführen.</p></article></div></section>
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Wie der Satz wirken kann.</h2></div>${effectPath()}</div></section>
      ${renderPsychologyModule(claim)}
      ${summaryGrid([["Mensch", "Menschen verlieren Orientierung, Vertrauen oder Schutzräume.", "warning"], ["Planet", "Ökologische Fakten und Klimapolitik können leichter delegitimiert werden.", "warning"], ["Demokratie", claim.summary.risk, "critical"]], `${claim.title} MPD`, "mpd-impact-panel")}
      ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Wirkungsrisiko", claim.riskLevel, claim.riskLevel === "sehr hoch" ? "critical" : "warning"]], `${claim.title} SDG`, "climate-sdg-panel")}
      ${standardBoxes(claim.woekCritical)}
      <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">EvidenceStack</p><h2>Quellen und Prüfstand.</h2></div>${sourceCards(claim.sources)}</div></section>
    </main>`;
  return pageShell({
    title: `${claim.title.replace(/[„“]/g, "")} - Wirkungsradar Live | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/live/${claim.slug}/`,
    base: "../../../",
    main,
  });
}

function summaryItems(claim) {
  return [["Kurzurteil", claim.summary.judgement, claim.riskLevel === "sehr hoch" ? "critical" : "warning"], ["Wahrer Kern", claim.summary.true_core, "neutral"], ["Problem", claim.summary.problem, "critical"], ["Narrativ", claim.summary.narrative, "warning"], ["Wirkungsrisiko", claim.summary.risk, "critical"], ["Live-Antwort", claim.summary.host_answer, "positive"]];
}

function renderDetailPage(claim) {
  const detailPath = claim.slug;
  const criticalStandards = claim.woekCritical ? standardBoxes(true) : standardBoxes(false);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero deep-dive-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Detail</a> / ${escapeHtml(claim.title)}</nav>
          <p class="hero-kicker">Deep-Dive-Detailseite</p>
          <h1 class="hero-title">${escapeHtml(claim.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(claim.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)}</p>
          <p class="radar-status-line"><span>Status: Detailanalyse</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauen: hoch</span></p>
        </div>
      </section>
      ${summaryGrid(summaryItems(claim), `${claim.title} Detail Summary`, "deep-dive-summary-grid")}
      ${topicSubnav("Detail", "../")}
      <section class="section">
        <div class="radar-detail-layout">
          <nav class="article-toc" aria-label="Inhaltsverzeichnis" data-search-exclude><p>Inhaltsverzeichnis</p><ol><li><a href="#aussage">Aussage</a></li><li><a href="#kurzurteil">Kurzurteil</a></li><li><a href="#was-stimmt">Was stimmt daran?</a></li><li><a href="#was-fehlt">Was fehlt?</a></li><li><a href="#begriff">Begriffliche Klärung</a></li><li><a href="#faktenlage">Fakten- und Rechtslage</a></li><li><a href="#wirkungspfad">Wirkungspfad</a></li><li><a href="#psychologischer-wirkungscheck">Psychologischer Wirkungscheck</a></li><li><a href="#antwort">WÖk-Antwort</a></li><li><a href="#creator-export">Creator Export</a></li><li><a href="#quellen">Quellen</a></li></ol></nav>
          <article class="article-body deep-dive-body">
            <section class="section deep-dive-section" id="aussage"><div class="section-header"><p class="hero-kicker">ClaimAnatomy</p><h2>Aussage zerlegen.</h2></div><div class="deep-dive-definition-grid"><article class="card"><p class="card-kicker">Originalaussage</p><h3 class="card-title">${escapeHtml(claim.title)}</h3></article><article class="card"><p class="card-kicker">Narrativ</p><h3 class="card-title">${escapeHtml(claim.narrativeFamilies.join(" / "))}</h3></article><article class="card"><p class="card-kicker">Wahrer Kern</p><p class="card-text">${escapeHtml(claim.summary.true_core)}</p></article><article class="card"><p class="card-kicker">Denkfehler</p><p class="card-text">${escapeHtml(claim.summary.problem)}</p></article></div></section>
            <section class="section deep-dive-section deep-dive-text-section" id="kurzurteil"><h2>Kurzurteil</h2><p>${escapeHtml(claim.summary.judgement)}</p></section>
            <section class="section deep-dive-section deep-dive-text-section" id="was-stimmt"><h2>Was stimmt daran?</h2><p>${escapeHtml(claim.trueText)}</p></section>
            <section class="section deep-dive-section deep-dive-text-section" id="was-fehlt"><h2>Was fehlt?</h2>${cleanList(claim.missingItems)}</section>
            <section class="section section-soft deep-dive-section" id="begriff"><div><div class="section-header"><p class="hero-kicker">Begriffliche Klärung</p><h2>Legitime Kritik trennen von demokratiegefährdender Wirkung.</h2></div><p class="radar-abstract">Der Wirkungsradar kontrolliert keine Meinungen. Er macht sichtbar, ob aus berechtigter Kritik eine pauschale Delegitimierung, eine Verschwörungslogik oder ein autoritärer Frame wird.</p></div></section>
            <section class="section deep-dive-section" id="faktenlage"><div class="section-header"><p class="hero-kicker">Fakten- und Rechtslage / wissenschaftliche Einordnung</p><h2>Prüfstand und Quellen.</h2></div>${sourceCards(claim.sources)}</section>
            ${criticalStandards}
            <section class="section deep-dive-section" id="wirkungspfad"><div class="section-header"><p class="hero-kicker">Wirkstoffanalyse und Wirkungspfad</p><h2>Von Aussage zu demokratischem Risiko.</h2></div>${effectPath()}</section>
            ${renderPsychologyModule(claim)}
            <section class="section deep-dive-section"><div class="section-header"><p class="hero-kicker">Wirkungen 1., 2. und 3. Ordnung</p><h2>Wie sich der Frame fortsetzt.</h2></div><div class="card-grid three"><article class="card"><p class="card-kicker">1. Ordnung</p><p class="card-text">Menschen übernehmen einen emotionalen Frame.</p></article><article class="card"><p class="card-kicker">2. Ordnung</p><p class="card-text">Diskussionen und Communities verschieben sich.</p></article><article class="card"><p class="card-kicker">3. Ordnung</p><p class="card-text">Gemeinsame Faktenbasis und Korrekturmechanismen werden geschwächt.</p></article></div></section>
            <section class="section section-soft deep-dive-section"><div><div class="section-header"><p class="hero-kicker">Folgen falschen Handelns</p><h2>Was wahrscheinlicher wird.</h2></div>${cleanList(["Pauschales Misstrauen ersetzt konkrete Prüfung.", "Desinformation wird anschlussfähiger.", "Demokratische Korrektur wird schwieriger.", "Legitime Kritik verliert Schärfe, weil sie in Feindbildern aufgeht."])}</div></section>
            ${summaryGrid([["Mensch", "Orientierung und Schutzräume werden geschwächt.", "warning"], ["Planet", "Wissenschafts- und Klimafakten werden leichter delegitimiert.", "warning"], ["Demokratie", claim.summary.risk, "critical"]], `${claim.title} MPD`, "mpd-impact-panel deep-dive-inline-summary")}
            ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Nichtkompensation", "Gute Wirkung in einem Feld verdeckt keine Schäden an Freiheit, Rechtsstaatlichkeit oder Diskursfähigkeit.", "warning"]], `${claim.title} SDG`, "climate-sdg-panel deep-dive-inline-summary")}
            <section class="section deep-dive-section" id="antwort"><div class="section-header"><p class="hero-kicker">Wirkungsökonomische Antwort</p><h2>${escapeHtml(claim.summary.host_answer)}</h2></div><p class="radar-abstract">Die demokratische Wirkungsfrage lautet: ${escapeHtml(claim.redirectQuestion)}</p></section>
            <section class="section deep-dive-section" id="creator-export"><div class="section-header"><p class="hero-kicker">CreatorExportBox</p><h2>Antworten für Hosts.</h2></div>${hostAnswers(claim)}</section>
            <section class="section section-soft deep-dive-section"><div><div class="section-header"><p class="hero-kicker">Interne Links</p><h2>WÖk-Anschluss.</h2></div><div class="radar-link-cluster"><a href="../../../begriffe/wirkung/">Wirkung</a><a href="../../../begriffe/wirkungspotenzial/">Wirkungspotenzial</a><a href="../../../begriffe/wirkungsrisiko/">Wirkungsrisiko</a><a href="../../../begriffe/wirkstoff/">Wirkstoff</a><a href="../../../begriffe/sdg-plus/">SDG+</a><a href="../../narrative/">Narrative</a><a href="../../live/">Live-Karten</a><a href="../../themen/demokratie-oeffentlichkeit/">Demokratie &amp; Öffentlichkeit</a></div></div></section>
            <section class="section deep-dive-section" id="quellen"><div class="section-header"><p class="hero-kicker">Externe Quellen</p><h2>Datenstand und Update-Regel.</h2></div>${sourceCards(claim.sources)}<p class="radar-status-line"><span>Datenstand: ${UPDATED_AT}</span><span>Update: quartalsweise</span></p></section>
          </article>
        </div>
      </section>
    </main>`;
  return pageShell({
    title: `${claim.title.replace(/[„“]/g, "")} | Wirkungsradar Detail | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/detail/${detailPath}/`,
    base: "../../../",
    main,
  });
}

function renderThemesIndex() {
  return renderRadarTopicMapPage(pageShell);
}

const climateLiveSlugs = [
  "klima-hat-sich-schon-immer-veraendert",
  "co2-ist-nur-ein-spurengas",
  "deutschland-nur-zwei-prozent",
  "co2-preis-oder-fossile-systemkosten",
  "klimaschutz-ist-oekodiktatur",
  "energiewende-gescheitert",
  "windraeder-zerstoeren-natur",
  "windraeder-voegel-wald-beton-rueckbau",
  "e-autos-schlimmer-als-verbrenner",
  "batterien-sind-nicht-recyclebar",
  "kernenergie-wieder-in-deutschland",
  "kernenergie-einfache-loesung",
  "fusion-loest-das-energieproblem",
  "klimaschutz-deindustrialisiert-deutschland",
];

function textFromHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirst(html, pattern, fallback = "") {
  const match = String(html || "").match(pattern);
  return match ? textFromHtml(match[1]) : fallback;
}

function climateLiveCards() {
  return climateLiveSlugs
    .map((slug) => {
      const file = path.join("wirkungsradar", "live", slug, "index.html");
      if (!fs.existsSync(file)) return null;
      const html = fs.readFileSync(file, "utf8");
      return {
        slug,
        title: extractFirst(html, /<h1[^>]*class="hero-title"[^>]*>([\s\S]*?)<\/h1>/, slug),
        kicker: extractFirst(html, /<article class="radar-summary-item"[^>]*>\s*<p class="radar-summary-label">Kurzurteil<\/p>\s*<p class="radar-summary-value">([\s\S]*?)<\/p>/, "Klima & Energie"),
        tenSeconds: extractFirst(html, /<span class="radar-answer-time">10 Sekunden<\/span>[\s\S]*?<p>„([\s\S]*?)“<\/p>/, ""),
      };
    })
    .filter(Boolean);
}

function liveCardGrid(items) {
  return `<div class="card-grid">${items.map((item) => `<a class="card text-link-card radar-live-card" href="${escapeHtml(item.slug)}/"><p class="card-kicker">${escapeHtml(item.kicker)}</p><h3 class="card-title">${escapeHtml(item.title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${escapeHtml(item.tenSeconds)}</p></a>`).join("")}</div>`;
}

const lighthouseLiveSlugs = [
  "deutschland-nur-zwei-prozent",
  "co2-preis-oder-fossile-systemkosten",
  "e-autos-schlimmer-als-verbrenner",
  "kernenergie-wieder-in-deutschland",
  "windraeder-voegel-wald-beton-rueckbau",
  "man-darf-ja-nichts-mehr-sagen",
  "mainstreammedien-luegen-alle",
  "wirkungsoekonomie-social-credit",
];

function renderLiveIndex() {
  const climateCards = climateLiveCards();
  const democracyCards = claims.map((claim) => ({
    slug: claim.slug,
    title: claim.title,
    kicker: claim.narrativeFamilies.join(" / "),
    tenSeconds: claim.answers.ten_seconds,
  }));
  const allCards = [...climateCards, ...democracyCards];
  const lighthouseCards = lighthouseLiveSlugs.map((slug) => allCards.find((card) => card.slug === slug)).filter(Boolean);
  const totalCards = climateCards.length + democracyCards.length;
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Live</nav><p class="hero-kicker">Für TikTok, Panels, Kommentarspalten und Moderation</p><h1 class="hero-title">Wirkungsradar Live</h1><p class="hero-subtitle">Kurze Antworten für Momente, in denen nicht die längste Analyse gewinnt, sondern der ruhigste Rahmen.</p><p class="radar-abstract"><strong>Abstract:</strong> Die Live-Karten übersetzen Wirkungschecks in kurze, sprechbare Antworten. Sie benennen wahren Kern, Denkfehler, Narrativ, Rückfrage und Wirkungspfad.</p><p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauensniveau: hoch</span></p></div></section>
      ${summaryGrid([["Live-Karten", `${totalCards} Karten aus Klima, Energie, Demokratie und Öffentlichkeit.`, "positive"], ["Format", "10 Sekunden, 30 Sekunden und 2 Minuten.", "neutral"], ["Start", "Erst wahren Kern nennen, dann Denkfehler zeigen.", "positive"], ["Frame", "Narrativ benennen, ohne es zu übernehmen.", "warning"], ["Risiko", "Wirkungsrisiko zeigen, wenn man danach handelt.", "critical"], ["Antwort", "Zur demokratisch prüfbaren Frage zurückführen.", "positive"]], "Live Summary")}
      <section class="section section-soft" id="leuchtturm-dossiers"><div><div class="section-header"><p class="hero-kicker">Leuchtturm-Dossiers · v2-Prüfung läuft</p><h2>${lighthouseCards.length} Leuchtturm-Dossiers zuerst.</h2><p>Diese Karten sind die öffentlichen Musterseiten: Faktenkern, Denkfehler, Psychologie, Wirkungspfad, WÖk-Antwort und Quellenlogik.</p></div>${liveCardGrid(lighthouseCards)}</div></section>
      <section class="section section-soft stoeckchen-module" id="stoeckchen-erkennung"><div><div class="section-header"><p class="hero-kicker">Stöckchen-Erkennung</p><h2>Woran erkenne ich ein demokratiebezogenes Stöckchen?</h2></div>${summaryGrid([["Pauschale Delegitimierung", "Alle Medien, Wissenschaftler:innen, Politiker:innen oder Institutionen werden als korrupt dargestellt.", "warning"], ["Falsche Opferrolle", "Kritik, Moderation oder Faktencheck wird als Unterdrückung geframt.", "warning"], ["Verschwörungslogik", "Komplexe Prozesse werden als geheimer Plan gedeutet.", "critical"], ["Frame-Frage", "Die Frage enthält bereits eine unbelegte Behauptung.", "critical"], ["Endlos-Ausweichen", "Sobald ein Punkt geklärt ist, wird zum nächsten Vorwurf gewechselt.", "warning"], ["Host-Satz", "Ich beantworte das, aber ich übernehme nicht den Frame.", "positive"]], "Stöckchen-Erkennung", "stoeckchen-warning-grid")}</div></section>
      ${renderHostControlModule()}
      ${renderPsychologicalStoeckchenChecklist()}
      ${topicSubnav("Live", "")}
      <section class="section" id="startliste"><div><div class="section-header"><p class="hero-kicker">Alle Live-Karten</p><h2>${totalCards} kurze Antworten im Wirkungsradar.</h2></div></div></section>
      <section class="section section-soft" id="klima-energie-live"><div><div class="section-header"><p class="hero-kicker">Klima &amp; Energie</p><h2>${climateCards.length} Live-Karten.</h2></div>${liveCardGrid(climateCards)}</div></section>
      <section class="section" id="demokratie-oeffentlichkeit-live"><div><div class="section-header"><p class="hero-kicker">Demokratie &amp; Öffentlichkeit</p><h2>${democracyCards.length} Live-Karten.</h2></div>${liveCardGrid(democracyCards)}</div></section>
      ${responseMatrix()}
    </main>`;
  return pageShell({ title: "Wirkungsradar Live - Antworten für Hosts und Creator:innen | Wirkungsökonomie", description: "Live-Antworten des Wirkungsradars: 10 Sekunden, 30 Sekunden, 2 Minuten, Rückfragen und Deeskalation für öffentliche Debatten.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/live/", base: "../../", main });
}

function renderDetailIndex() {
  const detailClaims = detailSlugs.map((slug) => claims.find((claim) => claim.slug === slug)).filter(Boolean);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Detail</nav><p class="hero-kicker">Wirkungsradar Detail</p><h1 class="hero-title">Detailanalysen für Aussagen mit hoher Wirkung.</h1><p class="hero-subtitle">Deep Dives mit Faktenkern, Narrativanalyse, Wirkmechanismus, MPD-Bewertung und WÖk-Lösung.</p><p class="radar-abstract"><strong>Abstract:</strong> Die Detailseiten sind die Langform zu Wirkungsradar-Livekarten. Sie zeigen, welche gesellschaftliche Wirkung eine Aussage auslöst und welche bessere Handlungsfrage daraus folgt.</p><p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Format: Deep Dive</span></p></div></section>
      ${summaryGrid([["Demokratie & Öffentlichkeit", `${detailClaims.length} neue Detailanalysen`, "positive"], ["Klima & Energie", "6 Detailanalysen", "positive"], ["Bestehend", "SDGs sind Weltregierung", "neutral"], ["Methode", "Faktencheck plus Wirkungscheck", "positive"], ["Ziel", "Handlungsfähigkeit statt Stöckchen-Reaktion", "positive"], ["Datenstand", UPDATED_AT, "neutral"]], "Detail Index Summary")}
      ${topicSubnav("Detail", "")}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Demokratie &amp; Öffentlichkeit</p><h2>Neue Schutz-Detailseiten.</h2></div><div class="card-grid">${detailClaims.map((claim) => `<a class="card text-link-card" href="${claim.slug}/"><p class="card-kicker">${escapeHtml(claim.subtitle)}</p><h3 class="card-title">${escapeHtml(claim.title)}</h3><p class="card-text">${escapeHtml(claim.redirectQuestion)}</p></a>`).join("")}</div></div></section>
      <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Weitere Detailseiten</p><h2>Bestehende Deep Dives.</h2></div><div class="card-grid">${existingClimateDetails.map(([href, kicker, title, text]) => `<a class="card text-link-card" href="${href}"><p class="card-kicker">${escapeHtml(kicker)}</p><h3 class="card-title">${escapeHtml(title)}</h3><p class="card-text">${escapeHtml(text)}</p></a>`).join("")}</div></div></section>
    </main>`;
  return pageShell({ title: "Wirkungsradar Detailanalysen | Wirkungsökonomie", description: "Detailanalysen im Wirkungsradar mit Faktenkern, Narrativanalyse, Wirkmechanismus, MPD-Bewertung und wirkungsökonomischer Lösung.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/detail/", base: "../../", main });
}

writeFile("content/wirkungsradar/source-packs/democracy-public-sphere-v1.yaml", `# Generated by scripts/wirkungsradar/build-democracy-public-sphere-cluster.mjs\n${toYaml(sourcePack).trim()}\n`);
writeFile("wirkungsradar/themen/index.html", renderThemesIndex());
writeFile("wirkungsradar/live/index.html", renderLiveIndex());
writeFile("wirkungsradar/detail/index.html", renderDetailIndex());
writeFile("wirkungsradar/themen/demokratie-oeffentlichkeit/index.html", renderClusterPage());
for (const topic of subtopics) {
  writeFile(`wirkungsradar/themen/demokratie-oeffentlichkeit/${topic.slug}/index.html`, renderSubtopic(topic));
}
for (const claim of claims) {
  writeFile(`wirkungsradar/live/${claim.slug}/index.html`, renderLiveCard(claim));
}
for (const slug of detailSlugs) {
  const claim = claims.find((item) => item.slug === slug);
  if (claim) writeFile(`wirkungsradar/detail/${claim.slug}/index.html`, renderDetailPage(claim));
}

console.log(`Built democracy-public-sphere cluster: ${subtopics.length} subtopics, ${claims.length} live cards, ${detailSlugs.length} deep dives.`);
