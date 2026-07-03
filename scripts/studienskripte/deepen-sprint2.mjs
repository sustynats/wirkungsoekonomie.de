#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const APP = join(ROOT, "woek-akademie-app");
const MASTER_DIR = join(ROOT, "content", "studienskripte");
const WORD_DIR = join(ROOT, "docs", "studienskripte", "word-rohfassungen");
const EXPORTER = join(ROOT, "scripts", "studienskripte", "export-word-rohfassung.py");
const PYTHON = existsSync("/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
  ? "/Users/hagen/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"
  : "python3";

const lectures = [
  {
    slug: "woek-g-v21",
    sprint: 2,
    code: "V21",
    title: "Produkte, Technologien und Institutionen als Auslöser",
    thesis:
      "Produkte, Technologien und Institutionen sind in der WÖk keine neutralen Kulissen. Sie setzen Wirkpfade in Gang, verändern Möglichkeitsräume und stabilisieren oder blockieren Rückkopplung.",
    pages: [
      "referenz/kapitel-048-produkte-als-wirkungstraeger/index.html",
      "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/index.html",
      "referenz/kapitel-042-unternehmen-als-wirkungssysteme/index.html",
      "referenz/kapitel-080-digitalisierung-als-infrastruktur-der-wirkungsoekonomie/index.html",
      "referenz/kapitel-098-pilotprojekte/index.html",
    ],
    matrix: [
      ["Produkt", "Lebenszyklus, Nutzung, Reparierbarkeit, Entsorgung, Lieferkette", "Produktimage oder Preis mit Wirkung verwechseln", "Produkt als Wirkungsträger mit Daten- und Rückkopplungspflicht lesen"],
      ["Technologie", "Möglichkeitsraum, Skalierung, Daten, Abhängigkeiten, neue Routinen", "Technikoptimismus oder Technikangst als Bewertung ausgeben", "Wirkmechanismus, Zugang, Macht, Risiken und Lernfähigkeit trennen"],
      ["Institution", "Regeln, Zuständigkeiten, Vertrauen, Verfahren, Rechte, Standards", "Institution als Gebäude oder Behörde verkürzen", "Institution als stabilisierten Wirkungsraum analysieren"],
      ["Infrastruktur", "Dauerhafte Bedingungen des Handelns", "Infrastruktur nur als Kostenblock sehen", "Infrastruktur als Träger von Prävention, Resilienz und Rückkopplung bewerten"],
    ],
    cases: [
      "Ein digitales Lernsystem ist kein Wirkungsnachweis. Es kann Zugang verbessern, Lehrkräfte entlasten und Lernstände sichtbar machen. Es kann aber auch Datenrisiken, Abhängigkeit von Plattformen, soziale Spaltung oder didaktische Verarmung erzeugen. Die WÖk fragt deshalb nicht, ob das System modern ist, sondern welche Zustände es bei Lernenden, Lehrenden, Schulen und demokratischer Bildungsfähigkeit verändert.",
      "Ein reparierbares Haushaltsgerät kann teurer wirken als ein kurzlebiges Billigprodukt. Wirkungsökonomisch verschiebt sich der Vergleich, wenn Haltbarkeit, Ersatzteile, Energieverbrauch, Elektroschrott, Lieferkettenrisiken und soziale Zugänglichkeit einbezogen werden. Der Auslöser ist nicht der Kauf, sondern die Produktarchitektur über den Lebenszyklus.",
    ],
    formula: "A_{wirk} = f(P_{daten}, T_{zugang}, I_{regeln}, R_{resonanz}, K_{korrektur})",
    formulaNote:
      "Das Wirkungspotenzial eines Auslösers steigt nur dann in Richtung tatsächlicher Wirkung, wenn Produktdaten, technologischer Zugang, institutionelle Regeln, gesellschaftliche Resonanz und Korrekturfähigkeit zusammenkommen.",
    backflow: [
      "Produktwirkung stärker als Brücke zwischen DPP, WÖk-ID und öffentlicher Beschaffung erklären.",
      "Technologie in Glossar und Akademie konsequent als Möglichkeitsraum statt als Selbstzweck führen.",
      "Institutionen als Wirkungsräume in späteren Management- und Controlling-Skripten wieder aufnehmen.",
    ],
  },
  {
    slug: "woek-g-v22",
    sprint: 2,
    code: "V22",
    title: "Wirkungssprache und Quellenklarheit",
    thesis:
      "Wirkungssprache ist eine Schutztechnik gegen Impact-Washing: Sie trennt Zustandsveränderung, Potenzial, Risiko, Annahme und Quelle, ohne die WÖk in Sprachpolizei zu verwandeln.",
    pages: [
      "referenz/kapitel-016-das-begriffssystem-der-wirkungsoekonomie/index.html",
      "referenz/kapitel-030-von-wirkung-zu-messung/index.html",
      "referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/index.html",
      "referenz/kapitel-076-framing-sprache-und-tonalitaet/index.html",
      "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html",
    ],
    matrix: [
      ["Wirkung", "belegte oder plausibel nachgewiesene Zustandsveränderung", "\"Wir wirken\" ohne Zustandsdaten", "\"Die Maßnahme veränderte Zustand X bei Gruppe Y im Zeitraum Z.\""],
      ["Wirkungspotenzial", "Möglichkeit künftiger Wirkung unter Bedingungen", "Potenzial als Ergebnis verkaufen", "\"Die Maßnahme kann unter Bedingungen A/B zu X beitragen.\""],
      ["Wirkungsrisiko", "mögliche negative oder unbeabsichtigte Zustandsveränderung", "Risiken aus der Kommunikation entfernen", "\"Das Risiko liegt in Verdrängung, Rebound oder Vertrauensverlust.\""],
      ["Quelle", "Daten, Studie, Modell, Erfahrungswissen oder begründete Annahme", "alle Evidenzarten gleich stark behandeln", "\"Diese Aussage beruht auf Modellannahmen; empirische Prüfung steht aus.\""],
    ],
    cases: [
      "Die Aussage \"Unser Projekt rettet Demokratie\" ist wirkungsökonomisch zu groß. Sauberer ist: Das Projekt kann demokratische Teilhabe stärken, wenn es Zugang, Verständlichkeit, Moderation und Rückkopplung sichert; belegt sind bislang Teilnahmezahlen und qualitative Rückmeldungen, offen bleiben dauerhafte Vertrauens- und Beteiligungseffekte.",
      "Ein Unternehmen, das \"klimapositiv\" kommuniziert, muss zeigen, ob reale Emissionen sinken, ob Kompensation verwendet wird, welche Scope-Grenzen gelten, welche Datenqualität vorliegt und welche Wirkungsrisiken verbleiben. Sonst wird Sprache zum Ersatz für Wirkung.",
    ],
    formula: "Aussagestaerke = Evidenzgrad \\times Begriffspräzision \\times Quellenklarheit \\times Unsicherheitsklarheit",
    formulaNote:
      "Eine Wirkungsaussage wird nicht dadurch stärker, dass sie lauter formuliert wird. Sie wird stärker, wenn Evidenz, Begriff, Quelle und Unsicherheit zusammenpassen.",
    backflow: [
      "Website-weite Formulierungsregel ergänzen: Wirkung behaupten nur mit Zustandsveränderung, sonst Wirkungspotenzial oder Wirkungsrisiko.",
      "Glossarverweise zu Impact-Washing, Wirkungspotenzial und Quellenklarheit verdichten.",
      "Journal- und Dossiertexte auf Reichweite-als-Wirkung-Verwechslung prüfen.",
    ],
  },
  {
    slug: "woek-g-v23",
    sprint: 2,
    code: "V23",
    title: "Unsicherheit, Ambivalenz und transparente Bewertung",
    thesis:
      "Ambivalenz ist kein Defekt der Wirkungsbewertung. Sie ist der Normalfall komplexer Systeme und muss durch Profile, Datenqualitätsklassen, Nichtkompensation und Rückkopplung entscheidungsfähig werden.",
    pages: [
      "referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/index.html",
      "referenz/kapitel-030-von-wirkung-zu-messung/index.html",
      "referenz/kapitel-032-benchmarks-skalen-und-scorecards/index.html",
      "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/index.html",
      "referenz/kapitel-106-die-fehlbarkeit-der-wirkungsoekonomie/index.html",
    ],
    matrix: [
      ["Datenunsicherheit", "Daten fehlen, sind alt, indirekt oder schwer vergleichbar", "Score als exakte Wahrheit ausgeben", "Datenqualitätsklasse und Annahmen ausweisen"],
      ["Wirkungsambivalenz", "positive und negative Zustandsveränderungen treten gleichzeitig auf", "eine Seite rhetorisch unsichtbar machen", "Profil statt Einzahlwert, Zielkonflikt offenlegen"],
      ["Modellunsicherheit", "Gewichtungen, Benchmarks und Kausalannahmen sind begründet, aber vorläufig", "Modell als Naturgesetz behandeln", "Version, Quelle und Korrekturweg nennen"],
      ["Entscheidungsunsicherheit", "Handeln ist nötig, obwohl Erkenntnis unvollständig bleibt", "Unsicherheit als Stillstandsargument nutzen", "Vorsorge, Pilot, Monitoring und Rückkopplung verbinden"],
    ],
    cases: [
      "Energetische Sanierung kann Klima und Gesundheit verbessern, aber Verdrängung auslösen. Eine transparente Bewertung muss Emissionsminderung, Heizkosten, Mieten, Sozialschutz, Gebäudezustand, Förderlogik und Beteiligung getrennt ausweisen. Erst dann wird der Konflikt steuerbar.",
      "Eine KI-Anwendung in der Verwaltung kann Wartezeiten senken, aber Fehler, Diskriminierung oder Intransparenz erzeugen. Die WÖk darf weder den Effizienzgewinn romantisieren noch die Technologie pauschal verwerfen; sie braucht Prüfpfad, Datenqualität, Beschwerdewege und Audit.",
    ],
    formula: "Bewertbarkeit = Datenqualitaet + Profilklarheit + Risikotransparenz + Rueckkopplungsfaehigkeit",
    formulaNote:
      "Unsicherheit wird nicht wegaddiert. Sie wird als Eigenschaft der Bewertung sichtbar gemacht und über Lernschleifen reduziert.",
    backflow: [
      "Datenqualitätsklassen und Unsicherheitsampel in Scorecard-Dokumente einheitlich übernehmen.",
      "Nichtkompensation nicht nur als Bewertungsregel, sondern als Kommunikationsschutz erklären.",
      "Fehlbarkeit der WÖk in Prüfungsfällen explizit abfragen: Korrektur ist Stärke, nicht Schwäche.",
    ],
  },
  {
    slug: "woek-g-v24",
    sprint: 2,
    code: "V24",
    title: "Deeskalierende und demokratiestärkende Kommunikation",
    thesis:
      "WÖk-Kommunikation muss Wirkung klar benennen und zugleich Würde, Lernfähigkeit und demokratische Konfliktfähigkeit schützen. Deeskalation bedeutet Klarheit ohne Entmenschlichung.",
    pages: [
      "referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/index.html",
      "referenz/kapitel-075-plattformlogik-und-algorithmen/index.html",
      "referenz/kapitel-076-framing-sprache-und-tonalitaet/index.html",
      "referenz/kapitel-077-desinformation-und-hybride-kriegsfuehrung/index.html",
      "referenz/kapitel-079-diskurskultur/index.html",
      "referenz/kapitel-103-technokratie-ueberwachung-und-die-angst-vor-steuerung/index.html",
    ],
    matrix: [
      ["Person", "Würde, Lernfähigkeit, Rechte", "Menschen moralisch sortieren", "Keine Personenbewertung, kein Social Credit"],
      ["Handlung", "konkreter Auslöser mit möglichem Wirkpfad", "Handlung sofort mit Charakter gleichsetzen", "Handlung und Wirkfolge beschreiben"],
      ["Struktur", "Regel, Plattform, Institution, Marktlogik", "nur individuelle Schuld suchen", "Fehlanreiz und Rückkopplung analysieren"],
      ["Öffentlichkeit", "Resonanzraum für Vertrauen, Konflikt und Entscheidung", "Aufmerksamkeit mit Wirkung verwechseln", "Orientierung, Quellenklarheit und Beteiligung stärken"],
    ],
    cases: [
      "In der Verkehrspolitik eskaliert die Aussage \"Autofahrer sind das Problem\". Wirkungssprache verschiebt die Analyse: Der aktuelle Verkehrsraum erzeugt Emissionen, Unfallrisiken, Flächenkonkurrenz und Ungleichheit der Bewegungsfreiheit. Die Lösung liegt in sicheren Alternativen, Preis- und Raumlogik, Beteiligung und Übergängen.",
      "In Debatten über Desinformation reicht es nicht, falsche Inhalte zu korrigieren. Entscheidend ist, welche Resonanzräume, Plattformanreize, Vertrauensverluste und Feindbilder entstehen. Demokratiestärkende Kommunikation muss Korrektur, Quellenklarheit, Würde und Konfliktfähigkeit verbinden.",
    ],
    formula: "D_{kom} = Klarheit_{Sache} + Wuerde_{Person} + Quelle + Handlungspfad - Eskalationsrisiko",
    formulaNote:
      "Die Formel ist eine didaktische Merkhilfe: Demokratische Kommunikation wird stärker, wenn sachliche Klarheit, Personenwürde, Quellen und Handlungspfade sichtbar sind und unnötige Eskalation sinkt.",
    backflow: [
      "Die rote Linie 'keine Personenbewertung' in allen öffentlichen WÖk-Erklärseiten prominent halten.",
      "Medienwirkungscheck und Sprach-/Framing-Analyse mit deeskalierenden Formulierungsbeispielen ergänzen.",
      "Einwände gegen Technokratie und Social Credit in Video- und Studienskript-Lane konsistent verknüpfen.",
    ],
  },
  {
    slug: "woek-g-v25",
    sprint: 3,
    code: "V25",
    title: "SDGs und Agenda 2030 als globaler Konsens der 193 Staaten",
    thesis:
      "Die SDGs sind für die WÖk kein Heilsversprechen und kein Weltregierungscode, sondern ein global verhandelter Mindestkompass, der positive Wirkung anschlussfähig macht und zugleich sauber in Zustandsveränderungen übersetzt werden muss.",
    pages: [
      "verstehen/sdgs-sdgplus/index.html",
      "verstehen/sdgs-sdgplus/agenda-2030/index.html",
      "verstehen/sdgs-sdgplus/detailkonzepte/sdgs-und-agenda-2030-als-globaler-referenzrahmen/index.html",
      "verstehen/sdgs-sdgplus/geschichte/index.html",
      "verstehen/sdgs-sdgplus/unterziele/index.html",
      "verstehen/sdgs-sdgplus/risiko-resilienzregister/index.html",
      "referenz/kapitel-102-die-sdgs-zwischen-globaler-kooperation-und-verschwoerungsnarrativ/index.html",
      "referenz/kapitel-096-wirkungsoekonomie-als-weltfaehige-ordnung/index.html",
    ],
    matrix: [
      ["Agenda 2030", "gemeinsamer politischer Referenzrahmen", "Agenda als direktes Weltgesetz missverstehen", "Mindestkompass, national und demokratisch umzusetzen"],
      ["SDG-Zuordnung", "Anschluss an ein Ziel oder Unterziel", "Icon als Wirkungsnachweis behandeln", "Zustandsveränderung, Betroffene und Datenpflicht ergänzen"],
      ["SDG-Indikator", "statistische Beobachtungsebene", "Indikator als vollständige Bewertung lesen", "Datenquelle, Systemgrenze und Kontext ausweisen"],
      ["WÖk-Bewertung", "Übersetzung in positive Netto-Wirkung", "SDGs mechanisch addieren", "Zielkonflikte, Nichtkompensation und Rückkopplung prüfen"],
    ],
    cases: [
      "Ein Bildungsprojekt kann SDG 4 plausibel berühren. Wirkung entsteht aber nicht durch das SDG-Icon, sondern durch belegbare Veränderungen bei Zugang, Kompetenzen, Übergängen, Teilhabe und Selbstwirksamkeit.",
      "Ein kommunales Klimaprojekt kann SDG 13, 11 und 3 verbinden. Die WÖk fragt zusätzlich, ob soziale Belastungen, Beteiligung, Hitzeresilienz, Gesundheit und Finanzierung so gestaltet sind, dass positive Netto-Wirkung entsteht.",
    ],
    formula: "SDG\\text{-}Bezug \\neq Wirkung;\\quad Wirkung = \\Delta Zustand + Empfaenger + Quelle + Bewertung + Rueckkopplung",
    formulaNote:
      "Der SDG-Bezug ist ein Anschluss an einen Referenzrahmen. Wirkung entsteht erst, wenn eine tatsächliche oder belastbar plausibilisierte Zustandsveränderung beschrieben, bewertet und rückgekoppelt wird.",
    externalNotes: [
      "UN Sustainable Development Goals Knowledge Platform: Die Agenda 2030 benennt 17 Sustainable Development Goals und 169 Targets als integrierten und unteilbaren Zielrahmen. Quelle: https://sdgs.un.org/2030agenda",
      "UN SDG Goals overview: Die 17 SDGs werden als gemeinsamer Handlungsaufruf aller Länder in globaler Partnerschaft beschrieben. Quelle: https://sdgs.un.org/goals",
    ],
    backflow: [
      "SDG-Seiten konsequent um den Satz ergänzen: SDG-Bezug ist kein Wirkungsnachweis.",
      "Agenda-2030-Einwände in Video- und Studienskript-Lane mit der Schutzlinie 'Kooperation ist keine Weltregierung' verbinden.",
      "In Scorecard-Dokumenten zwischen SDG-Zuordnung, SDG-Indikator und WÖk-Bewertung unterscheiden.",
    ],
  },
  {
    slug: "woek-g-v26",
    sprint: 3,
    code: "V26",
    title: "SDG+: Warum die SDGs für offene Gesellschaften nicht reichen",
    thesis:
      "SDG+ ergänzt den globalen SDG-Mindestkompass dort, wo offene Gesellschaften besondere Schutz- und Wirkungsdimensionen brauchen: Demokratiequalität, Rechtsstaatlichkeit, Medienqualität, Diskursfähigkeit, institutionelles Vertrauen und digitale Selbstbestimmung.",
    pages: [
      "verstehen/sdgs-sdgplus/sdgplus/index.html",
      "verstehen/sdgs-sdgplus/sdgplus-demokratie/index.html",
      "verstehen/sdgs-sdgplus/sdgplus-rechtsstaatlichkeit/index.html",
      "verstehen/sdgs-sdgplus/sdgplus-medienqualitaet/index.html",
      "verstehen/sdgs-sdgplus/sdgplus-diskursfaehigkeit/index.html",
      "verstehen/sdgs-sdgplus/sdgplus-institutionelles-vertrauen/index.html",
      "verstehen/sdgs-sdgplus/sdgplus-gesellschaftlicher-zusammenhalt/index.html",
      "verstehen/sdgs-sdgplus/sdgplus-digitale-selbstbestimmung/index.html",
      "referenz/kapitel-028-demokratie-als-wirkungsraum/index.html",
      "referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/index.html",
      "referenz/kapitel-079-diskurskultur/index.html",
    ],
    matrix: [
      ["Demokratiequalität", "Beteiligung, Korrekturfähigkeit, legitimer Konflikt", "Mehrheitsentscheidung mit demokratischer Wirkung verwechseln", "Verfahren, Rechte und Resonanzräume prüfen"],
      ["Rechtsstaatlichkeit", "Grundrechte, Rechtsschutz, Verhältnismäßigkeit", "Wirkungssteuerung als technokratische Abkürzung nutzen", "jede Rückkopplung rechtlich begrenzen"],
      ["Medienqualität", "Orientierung, Quellen, Diskursfähigkeit", "Reichweite als demokratische Wirkung ausgeben", "Wirkung auf Vertrauen, Wahrheitsbindung und Konfliktfähigkeit analysieren"],
      ["Digitale Selbstbestimmung", "Datenrechte, Transparenz, algorithmische Fairness", "Datenverfügbarkeit mit Legitimität verwechseln", "Privacy, Kontrolle und Beschwerdewege einbauen"],
    ],
    cases: [
      "Eine Plattform kann politische Information verbreiten und zugleich Empörung belohnen. SDG+ fragt nicht nur nach Zugang zu Information, sondern nach Medienqualität, Diskursfähigkeit, Transparenz, algorithmischer Verantwortung und Schutz vor Manipulation.",
      "Ein Wirkungsdatenraum kann Steuerung verbessern. Ohne Rechtsstaatlichkeit, Datenschutz, Beschwerdewege und Transparenz kann dieselbe Infrastruktur Vertrauen beschädigen.",
    ],
    formula: "SDG+ = SDG_{Mindestkompass} + Demokratie + Recht + Medien + Datenrechte + Vertrauen",
    formulaNote:
      "SDG+ ist keine offizielle UN-Kategorie und keine Konkurrenz zu den SDGs. Es ist die WÖk-Erweiterung für Wirkungen, die offene Gesellschaften stabilisieren oder schwächen.",
    backflow: [
      "SDG+-Begriffe stärker in Medien-, Digital- und Demokratie-Wirkungsfelder verlinken.",
      "In Einwände-Texten klarstellen: SDG+ erweitert demokratische Schutzlinien, statt globale Vorgaben zu verschärfen.",
      "Prüfungsfälle zu SDG+ mit Plattform-, Datenraum- und Rechtsstaatsbeispielen anlegen.",
    ],
  },
  {
    slug: "woek-g-v27",
    sprint: 3,
    code: "V27",
    title: "Kernfelder, Wirkungsgrenzen und rote Linien",
    thesis:
      "Kernfelder und rote Linien schützen die Wirkungsbewertung vor Schönrechnung: Bestimmte Schäden dürfen nicht durch gute Einzelwerte verdeckt werden, weil positive Netto-Wirkung sonst zur Rechenkosmetik würde.",
    pages: [
      "begriffe/wirkungsgrenze/index.html",
      "begriffe/rote-linien/index.html",
      "referenz/kapitel-027-planet-koexistenz-statt-extraktion/index.html",
      "referenz/kapitel-033-reverse-merit-order/index.html",
      "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/index.html",
      "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html",
    ],
    matrix: [
      ["Kernfeld", "wesentliche Wirkungsebene mit hoher Schutzrelevanz", "Kernfeld als Themenliste behandeln", "Bedeutung für Zustandsveränderung und Risiko begründen"],
      ["Wirkungsgrenze", "rote Linie für nicht akzeptable Schäden", "Grenze in Durchschnittswerten verstecken", "nichtkompensierend ausweisen"],
      ["Nichtkompensation", "Schutz gegen Wegrechnen schwerer Schäden", "positive Werte gegen Grundschäden aufrechnen", "kritisches Feld begrenzt Gesamtbewertung"],
      ["Reverse Merit Order", "kritischstes relevantes Feld setzt Bewertungsobergrenze", "besten Einzelwert hervorheben", "schwächste zentrale Wirkung zuerst prüfen"],
    ],
    cases: [
      "Ein Textilprodukt mit gutem Recyclinganteil bleibt problematisch, wenn Zwangsarbeit oder schwere Chemikalienrisiken in der Lieferkette vorliegen. Der gute Einzelwert darf die rote Linie nicht neutralisieren.",
      "Ein Wohnprojekt kann energetisch stark sein und trotzdem negative Netto-Wirkung erzeugen, wenn Verdrängung, Barrierefreiheit oder demokratische Beteiligung missachtet werden.",
    ],
    formula: "FinalScore \\leq min(Kernfeld_{kritisch})\\quad wenn\\quad Wirkungsgrenze = verletzt",
    formulaNote:
      "Die Formel zeigt didaktisch die Sperrlogik: Eine verletzte Wirkungsgrenze oder ein kritisch schwaches Kernfeld begrenzt die Gesamtbewertung.",
    backflow: [
      "Rote Linien als Schutzlogik in Produkt-, Wohnungs-, Lieferketten- und Medienseiten konsistenter verlinken.",
      "Reverse Merit Order im Grundstudium früher als Schutz gegen Greenwashing vorbereiten.",
      "Prüfungsfälle mit absichtlich verführerischen guten Einzelwerten bauen, damit Nichtkompensation geübt wird.",
    ],
  },
  {
    slug: "woek-g-v28",
    sprint: 3,
    code: "V28",
    title: "CSRD, ESRS, GRI, EU-Taxonomie, NACE und DPP",
    thesis:
      "CSRD, ESRS, GRI, EU-Taxonomie, NACE und DPP liefern keine fertige WÖk-Bewertung. Sie liefern Daten-, Berichts-, Klassifikations- und Produktinfrastruktur, die erst durch Wirkpfad, Datenqualität, Scorecard und Rückkopplung steuerungsfähig wird.",
    pages: [
      "referenz/kapitel-030-von-wirkung-zu-messung/index.html",
      "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/index.html",
      "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/index.html",
      "referenz/kapitel-085-dpp-infrastruktur-und-technische-umsetzung/index.html",
      "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html",
    ],
    matrix: [
      ["CSRD/ESRS", "europäische Nachhaltigkeitsberichterstattung", "Berichtspflicht als Wirkung behandeln", "Datenquelle für Wesentlichkeit, Indikatoren und Audit nutzen"],
      ["GRI", "international verbreitete Impact-Reporting-Standards", "GRI-Offenlegung als WÖk-Score ausgeben", "Offenlegungen als Evidenzbaustein einordnen"],
      ["EU-Taxonomie", "Klassifikation ökologisch nachhaltiger Wirtschaftstätigkeiten", "Taxonomie-Konformität als positive Netto-Wirkung setzen", "ökologischen Hinweis mit Mensch/Demokratie und Risiken verbinden"],
      ["NACE", "statistische Klassifikation wirtschaftlicher Tätigkeiten", "Branche mit Wirkung gleichsetzen", "Benchmark- und Archetypenlogik branchenspezifisch aufbauen"],
      ["DPP", "Produktdatencontainer über Lebenszyklus", "Datenpass als Bewertung verwechseln", "Daten mit WÖk-ID, Scorecard, Prüfung und Rückkopplung verbinden"],
    ],
    cases: [
      "Ein Chemieunternehmen berichtet nach ESRS Emissionen, Wasser, Arbeitsbedingungen und Lieferkettenrisiken. Die WÖk nutzt diese Daten nicht als fertiges Urteil, sondern ordnet sie WÖk-IDs, Benchmarks, Datenqualität und Wirkungsgrenzen zu.",
      "Ein Textil-DPP kann Material, Herkunft und Kreislauffähigkeit enthalten. Für positive Netto-Wirkung fehlen dennoch Arbeitsbedingungen, Wasserstress, Nutzungsdauer, Reparierbarkeit, Entsorgung und Nichtkompensation bei schweren Schäden.",
    ],
    formula: "WÖk\\text{-}Bewertung = Reportingdaten + Klassifikation + Produktdaten + Wirkpfad + Datenqualitaet + Rueckkopplung",
    formulaNote:
      "Die Formel macht die WÖk-Übersetzung sichtbar: vorhandene Rahmenwerke sind Eingänge, nicht der Ausgang des Bewertungsprozesses.",
    externalNotes: [
      "European Commission CSRD: Unternehmen im CSRD-Anwendungsbereich berichten nach European Sustainability Reporting Standards; EFRAG entwickelt Entwürfe für die Standards. Quelle: https://finance.ec.europa.eu/financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en",
      "EFRAG ESRS: Set 1 wurde als Delegated Act im Amtsblatt vom 22. Dezember 2023 übernommen; vereinfachte ESRS-Entwürfe werden als separater Reformstand geführt. Quelle: https://www.efrag.org/en/draft-simplified-esrs",
      "European Commission EU Taxonomy: Die Taxonomie schafft eine gemeinsame Definition wirtschaftlicher Tätigkeiten, die als ökologisch nachhaltig gelten können. Quelle: https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en",
      "Eurostat NACE Rev. 2.1: Die 2025er Ausgabe beschreibt die statistische Klassifikation wirtschaftlicher Tätigkeiten in der EU. Quelle: https://ec.europa.eu/eurostat/web/nace",
      "European data portal / ESPR-DPP: Der Digitale Produktpass ist Teil der Ecodesign-for-Sustainable-Products-Regulation-Logik und soll Produktinformationen entlang der Wertschöpfung zugänglich machen. Quelle: https://data.europa.eu/en/news-events/news/eus-digital-product-passport-advancing-transparency-and-sustainability",
      "GRI: Die GRI Standards unterstützen Organisationen dabei, Auswirkungen auf Umwelt, Menschen und Wirtschaft zu verstehen und zu berichten. Quelle: https://www.globalreporting.org/",
    ],
    backflow: [
      "V28 muss laufend mit EU-/EFRAG-Stand abgeglichen werden; Omnibus-/ESRS-Simplifizierung nicht statisch behandeln.",
      "DPP-Seiten stärker mit WÖk-ID, Produktwirkung, Scorecards und Beschaffung verknüpfen.",
      "NACE/Branchenlogik als Grundlage für Archetypen und Benchmarks in G3.2/G3.3 konsistent halten.",
    ],
  },
  {
    slug: "woek-g-v29",
    sprint: 4,
    code: "V29",
    title: "WÖk-IDs, Benchmarks und Archetypen",
    thesis:
      "WÖk-IDs machen Wirkung adressierbar, Benchmarks machen sie vergleichbar, Archetypen machen Vergleich fair. Ohne diese drei Ebenen bleiben Wirkungsdaten entweder sprachlich, beliebig oder ungerecht.",
    pages: [
      "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/index.html",
      "referenz/kapitel-032-benchmarks-skalen-und-scorecards/index.html",
      "referenz/kapitel-050-produktscorecards/index.html",
      "werkzeuge/woek-ids/index.html",
      "werkzeuge/benchmarks-archetypen/index.html",
      "dokumente/woek-master-items-final-v1-2/index.html",
    ],
    matrix: [
      ["WÖk-ID", "eindeutige Adresse eines Wirkungsindikators", "ID als Score oder Urteil lesen", "Indikator, Einheit, Quelle, Version und Prüfstatus trennen"],
      ["Benchmark", "Vergleichsmaßstab für eine Branche, Produktgruppe oder Maßnahme", "alle Akteure am selben Wert messen", "Vergleichsgruppe und Systemgrenze offenlegen"],
      ["Archetyp", "typischer Fall oder Strukturtyp für faire Bewertung", "Einzelfälle über einen Kamm scheren", "passende Vergleichsfamilie bilden"],
      ["Skala", "Übersetzung von Messwerten in Bewertungsstufen", "Skala als Naturgesetz behandeln", "Skala begründen, versionieren und korrigierbar halten"],
    ],
    cases: [
      "Wasserverbrauch ist kein einziger Indikator. Relevant sind Standort, Wasserstress, Wiederverwendung, Lieferkettenbezug, Produktgruppe und Zeit. Eine WÖk-ID ordnet, welcher Wasseraspekt gemeint ist.",
      "Ein Krankenhaus, eine Schule und ein Chemiewerk können Energieverbrauch nicht mit derselben Erwartung bewerten. Archetypen schützen davor, notwendige Funktionen mit schlechter Wirkung zu verwechseln.",
    ],
    formula: "Bewertung_{fair} = Messwert(WÖk\\text{-}ID) \\; im \\; Kontext(Benchmark, Archetyp, Datenqualitaet)",
    formulaNote:
      "Der Messwert wird erst fair bewertbar, wenn klar ist, welcher Indikator gemeint ist, welche Vergleichsgruppe gilt und wie belastbar die Daten sind.",
    backflow: [
      "WÖk-ID-Seiten stärker mit Datenqualität, Versionierung und Prüfstatus verbinden.",
      "Archetypen als Schutz gegen falsche Vergleiche in Produkt-, Unternehmens- und Kommunalbewertung ausbauen.",
      "Prüfungsfälle mit absichtlich falscher Vergleichsgruppe anlegen.",
    ],
  },
  {
    slug: "woek-g-v30",
    sprint: 4,
    code: "V30",
    title: "Datenqualität, Audit und Unsicherheit",
    thesis:
      "Datenqualität ist keine Fußnote der WÖk, sondern Teil der Wirkungswahrheit. Audit und Unsicherheitsausweis verhindern, dass scheinbar präzise Zahlen mehr Sicherheit behaupten, als die Daten tragen.",
    pages: [
      "referenz/kapitel-030-von-wirkung-zu-messung/index.html",
      "referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/index.html",
      "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/index.html",
      "werkzeuge/datenqualitaet-assurance/index.html",
      "begriffe/wirkungsaudit/index.html",
      "begriffe/wirkungsassurance/index.html",
    ],
    matrix: [
      ["Datenquelle", "woher die Aussage stammt", "Quelle verschweigen", "amtliche Daten, Audit, Studie, Modell oder Schätzung markieren"],
      ["Datenqualität", "Passung, Aktualität, Vollständigkeit, Prüfbarkeit", "Zahl als automatisch belastbar lesen", "Qualitätsklasse ausweisen"],
      ["Audit", "unabhängige oder strukturierte Prüfung", "Audit als inhaltliche Wirkung verwechseln", "Prüfung stärkt Aussage, ersetzt aber nicht Bewertung"],
      ["Unsicherheit", "Grenze der Aussage", "Unsicherheit verstecken", "Bandbreite, Annahme und Korrekturweg nennen"],
    ],
    cases: [
      "Ein Lieferant meldet CO2-Daten selbst. Das kann ein Anfang sein, aber Datenqualität hängt von Methode, Systemgrenze, Aktualität, Prüfstatus und Vergleichbarkeit ab.",
      "Eine Kommune nutzt Hitzeindikatoren aus Wetterdaten, Gesundheitsdaten und Sozialraumanalyse. Die WÖk muss Datenschutz, Aggregation, Aktualität und Handlungsbezug zusammen denken.",
    ],
    formula: "Aussagekraft = Datenqualitaet \\times Quellenklarheit \\times Pruefstatus \\times Kontextpassung",
    formulaNote:
      "Eine Zahl mit niedriger Datenqualität kann für Lernen nützlich sein, darf aber nicht als harte Steuerungsgrundlage behandelt werden.",
    backflow: [
      "Datenqualitätsklassen als Pflichtfeld in Scorecard- und DPP-Templates vorsehen.",
      "Audit-Begriffe auf Website klar von Wirkung und Bewertung abgrenzen.",
      "Unsicherheitsampel in Prüfungsfällen und Reader-PDF sichtbar machen.",
    ],
  },
  {
    slug: "woek-g-v31",
    sprint: 4,
    code: "V31",
    title: "Von Einzelwirkung zu Netto-Wirkung",
    thesis:
      "Netto-Wirkung entsteht nicht durch simple Addition guter und schlechter Einzelwirkungen. Sie entsteht durch profilierte Bewertung, Zielkonfliktprüfung, Nichtkompensation und Rückkopplung.",
    pages: [
      "referenz/kapitel-010-wirkung/index.html",
      "referenz/kapitel-014-systemischer-wert-und-normativer-wert/index.html",
      "referenz/kapitel-030-von-wirkung-zu-messung/index.html",
      "referenz/kapitel-033-reverse-merit-order/index.html",
      "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/index.html",
      "begriffe/positive-netto-wirkung/index.html",
    ],
    matrix: [
      ["Einzelwirkung", "eine konkrete Zustandsveränderung", "Einzelwert als Gesamtwirkung verkaufen", "Wirkungsfeld, Empfänger und Richtung markieren"],
      ["Wirkungsprofil", "mehrere Wirkungen nebeneinander", "Profil sofort zu einer Zahl glätten", "positive, negative und ambivalente Felder zeigen"],
      ["Netto-Wirkung", "bewertetes Gesamtbild unter Schutzlogiken", "alles verrechnen", "Nichtkompensation und kritische Felder beachten"],
      ["Rückkopplung", "Konsequenz aus Bewertung", "Bewertung als Bericht beenden", "Preis, Beschaffung, Management oder Regel anpassen"],
    ],
    cases: [
      "Ein Produkt senkt Emissionen, erhöht aber Wasserstress und enthält Arbeitsrechtsrisiken. Die WÖk darf nicht nur den Klimaeffekt feiern, sondern muss das Profil lesen.",
      "Eine Maßnahme verbessert Teilhabe kurzfristig, erzeugt aber langfristige Abhängigkeit von einer Plattform. Netto-Wirkung verlangt den Blick über den ersten Nutzen hinaus.",
    ],
    formula: "NW_{pos} = Profil(\\Delta Z^+, \\Delta Z^-, Risiko, Grenze, Zeit, Empfaenger)",
    formulaNote:
      "Die Formel vermeidet Scheingenauigkeit: Positive Netto-Wirkung ist ein bewertetes Profil, nicht bloß eine mechanische Summe.",
    backflow: [
      "Begriff Netto-Wirkung und positive Netto-Wirkung im Glossar stärker unterscheiden.",
      "Scorecard-Visuals als Profil vor Einzahlwert zeigen.",
      "Prüfungsfälle mit scheinbar guter Einzelwirkung und kritischer Nebenwirkung bauen.",
    ],
  },
  {
    slug: "woek-g-v32",
    sprint: 4,
    code: "V32",
    title: "Scorecards und Bewertungsprofile",
    thesis:
      "Scorecards übersetzen Wirkungsdaten in entscheidungsfähige Profile. Sie sind dann gut, wenn sie sichtbar machen, was stark, schwach, unsicher, kritisch und nicht kompensierbar ist.",
    pages: [
      "referenz/kapitel-032-benchmarks-skalen-und-scorecards/index.html",
      "referenz/kapitel-050-produktscorecards/index.html",
      "referenz/kapitel-051-das-apfelbeispiel/index.html",
      "werkzeuge/scorecards/index.html",
      "werkzeuge/impact-controlling/methodenpapiere/scorecards-benchmarks-nwi/index.html",
      "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html",
    ],
    matrix: [
      ["Dimension", "Mensch, Planet, Demokratie oder spezifisches Wirkungsfeld", "Dimensionen beliebig wählen", "Referenzrahmen und Wesentlichkeit begründen"],
      ["Indikator", "mess- oder belegbare Einheit", "Indikator ohne Quelle nutzen", "WÖk-ID, Einheit, Datenqualität ausweisen"],
      ["Bewertungsstufe", "Skalenwert oder Profilfarbe", "Ampel als Wahrheit behandeln", "Skala und Benchmark erklären"],
      ["Sperrlogik", "rote Linie oder kritisches Feld", "gute Felder kompensieren alles", "Nichtkompensation und Reverse Merit Order anwenden"],
    ],
    cases: [
      "Das Apfelbeispiel zeigt, warum Herkunft, Wasser, Klima, Arbeit, Biodiversität, Gesundheit und Transport gemeinsam gelesen werden müssen. Ein regionaler Apfel ist nicht automatisch besser, wenn Wasserstress oder Pestizidrisiken schwer wiegen.",
      "Eine Unternehmensscorecard muss Produktwirkung, Lieferkette, Arbeit, Daten, Governance und Transformationspfad verbinden. Einzelne ESG-Kennzahlen reichen nicht.",
    ],
    formula: "Scorecard = \\{Indikator, Benchmark, Skala, Datenqualitaet, Grenze, Rueckkopplung\\}_{n}",
    formulaNote:
      "Eine Scorecard ist kein hübsches Dashboard. Sie ist eine begründete Übersetzung von Daten in ein Bewertungsprofil mit Konsequenzen.",
    backflow: [
      "Scorecard-Seiten mit Pflichtfeldern für Datenqualität und Sperrlogik ergänzen.",
      "Apfelbeispiel als durchgehenden Lernfall für V32-V36 verwenden.",
      "Reader/PDF sollte Scorecards tabellarisch und als Profilgrafik abbilden.",
    ],
  },
  {
    slug: "woek-g-v33",
    sprint: 5,
    code: "V33",
    title: "NWI und T-SROI unterscheiden",
    thesis:
      "NWI und T-SROI beantworten unterschiedliche Fragen: Der Netto-Wirkungs-Index verdichtet ein Wirkungsprofil, T-SROI beschreibt Transformationswirkung im Verhältnis zu eingesetzten Ressourcen und langfristigen Systemeffekten.",
    pages: [
      "referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/index.html",
      "werkzeuge/netto-wirkungs-index/index.html",
      "werkzeuge/t-sroi/index.html",
      "werkzeuge/impact-controlling/t-sroi/index.html",
      "werkzeuge/impact-controlling/index.html",
      "werkzeuge/impact-controlling/detailkonzepte/t-sroi/index.html",
      "werkzeuge/impact-controlling/dossiers/t-sroi/index.html",
      "werkzeuge/impact-controlling/methodenpapiere/t-sroi-transformationsmessung/index.html",
      "werkzeuge/impact-controlling/methodenpapiere/scorecards-benchmarks-nwi/index.html",
      "dokumente/whitepaper-t-sroi/index.html",
      "wirkungsfelder/gesundheit-pflege/tools/t-sroi-praevention-gesundheitsinvestitionen/index.html",
    ],
    matrix: [
      ["NWI", "verdichtetes Bewertungsprofil positiver Netto-Wirkung", "Index als absolute Wahrheit lesen", "Profil, Datenqualität, Grenzen und Sperrlogik mitlesen"],
      ["T-SROI", "Verhältnis von Transformationswirkung zu Ressourceneinsatz", "klassischen ROI mit Wirkung verwechseln", "langfristige Systemwirkung und vermiedene Schäden berücksichtigen"],
      ["Scorecard", "mehrdimensionales Vorprofil", "Scorecard und Index gleichsetzen", "Scorecard erklärt, NWI verdichtet"],
      ["Entscheidung", "Rückkopplung in Budget, Beschaffung, Kapital oder Strategie", "Kennzahl als Bericht beenden", "Kennzahl muss Steuerung verändern"],
    ],
    cases: [
      "Ein Präventionsprogramm kann kurzfristig teuer wirken, aber über vermiedene Krankheit, Pflegebedarf, Arbeitsausfall und familiäre Belastung hohe Transformationswirkung entfalten. Hier hilft T-SROI.",
      "Ein Produktvergleich mit mehreren Wirkungsfeldern braucht zuerst Scorecard und NWI, bevor über Preis-, Beschaffungs- oder Kapitalrückkopplung entschieden wird.",
    ],
    formula: "T\\text{-}SROI = \\frac{Transformationswirkung + vermiedene\\;Schadenskosten + Systemlernen}{Ressourceneinsatz}",
    formulaNote:
      "T-SROI ist didaktisch als Verhältnis gedacht. Entscheidend ist, welche Wirkungen, Zeiträume und Systemeffekte begründet einbezogen werden.",
    backflow: [
      "NWI und T-SROI in Werkzeugseiten konsequent als unterschiedliche Kennzahltypen erklären.",
      "Präventions-, Bildungs- und Gesundheitsfälle als T-SROI-Lernfälle markieren.",
      "Prüfungsfragen bauen, in denen Studierende entscheiden müssen, ob NWI oder T-SROI passend ist.",
    ],
  },
  {
    slug: "woek-g-v34",
    sprint: 5,
    code: "V34",
    title: "Reverse Merit Order",
    thesis:
      "Reverse Merit Order dreht die Aufmerksamkeit auf das kritischste zentrale Wirkungsfeld. Sie verhindert, dass gute Einzelwerte die schlechteste relevante Wirkung verdecken.",
    pages: [
      "referenz/kapitel-033-reverse-merit-order/index.html",
      "werkzeuge/reverse-merit-order/index.html",
      "referenz/kapitel-050-produktscorecards/index.html",
      "referenz/kapitel-051-das-apfelbeispiel/index.html",
      "begriffe/reverse-merit-order/index.html",
      "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html",
    ],
    matrix: [
      ["Merit Order klassisch", "bestes oder günstigstes Kriterium priorisiert", "positive Highlights dominieren", "für WÖk nur begrenzt geeignet"],
      ["Reverse Merit Order", "kritischstes relevantes Feld begrenzt Bewertung", "als Straflogik missverstehen", "Schutzlogik gegen Schönrechnung"],
      ["Kritisches Feld", "schwere negative Wirkung oder rote Linie", "kritisches Feld nebenbei erwähnen", "zuerst prüfen und begründen"],
      ["Gesamtbewertung", "durch schwächstes zentrales Feld begrenzt", "Durchschnitt bildet alles ab", "Profil plus Sperrlogik verwenden"],
    ],
    cases: [
      "Ein Lebensmittel kann regional, lecker und klimatisch ordentlich sein. Wenn sein Anbau in einer Wasserstressregion schwere Belastungen erzeugt, darf der Regionalvorteil diese Wirkung nicht neutralisieren.",
      "Ein digitales Angebot kann Bildungszugang verbessern. Wenn es Kinder umfassend trackt und Datenrechte verletzt, muss die digitale Selbstbestimmung als kritisches Feld zuerst geprüft werden.",
    ],
    formula: "FinalScore = min(Score_{kritische\\;Kernfelder}) \\quad bevor \\quad Durchschnittswerte\\;gebildet\\;werden",
    formulaNote:
      "Die Formel ist eine Sperrlogik: Das kritischste relevante Feld setzt eine Obergrenze, bevor gute Einzelwerte eine falsche Gesamtglättung erzeugen.",
    backflow: [
      "Reverse Merit Order als Standardbaustein in Produkt- und Scorecard-Seiten verwenden.",
      "Visual: Bewertungsprofil mit kritischem Feld als Obergrenze produzieren.",
      "Prüfungsfälle mit bewusst verführerischen Durchschnittswerten erstellen.",
    ],
  },
  {
    slug: "woek-g-v35",
    sprint: 5,
    code: "V35",
    title: "Nichtkompensation gegen Greenwashing",
    thesis:
      "Nichtkompensation ist die harte Kante der WÖk gegen Greenwashing, Impact-Washing und SDG-Washing: Schwere Schäden dürfen nicht durch gute Einzelwerte, Kompensationsnarrative oder schöne Icons verschwinden.",
    pages: [
      "begriffe/nichtkompensationsprinzip/index.html",
      "begriffe/greenwashing/index.html",
      "begriffe/impact-washing/index.html",
      "begriffe/sdg-washing/index.html",
      "begriffe/wirkungswashing/index.html",
      "begriffe/labelwashing/index.html",
      "begriffe/purpose-washing/index.html",
      "begriffe/wirkungswahrheit/index.html",
      "referenz/kapitel-104-wirkungsmessung-manipulation-und-wirkungssimulation/index.html",
      "referenz/kapitel-105-freiheit-markt-und-der-vorwurf-der-planwirtschaft/index.html",
      "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html",
    ],
    matrix: [
      ["Greenwashing", "ökologische Behauptung ohne tragfähige Wirkung", "grünes Merkmal als Gesamturteil", "Lebenszyklus, Grenzen, Daten prüfen"],
      ["Impact-Washing", "übertriebene Wirkungsaussage", "Potenzial als Wirkung verkaufen", "Wirkung, Potenzial, Risiko trennen"],
      ["SDG-Washing", "SDG-Symbole ohne Zustandsnachweis", "Icon als Beleg verwenden", "SDG-Zuordnung plus Daten und Rückkopplung verlangen"],
      ["Nichtkompensation", "Schutz vor Wegrechnen schwerer Schäden", "Kompensation als moralische Reinigung", "rote Linie nicht verrechnen"],
    ],
    cases: [
      "Ein Unternehmen pflanzt Bäume und bewirbt Klimapositivität, ohne Emissionen im Kerngeschäft zu senken. Nichtkompensation fragt, welche Schäden real vermieden werden und welche nur ausgelagert oder erzählt werden.",
      "Ein Produkt trägt mehrere SDG-Icons, während eine Lieferkette schwere Arbeitsrechtsrisiken enthält. SDG-Washing entsteht, wenn der positive Rahmen die rote Linie unsichtbar macht.",
    ],
    formula: "Schwere\\;Schaden \\nRightarrow keine\\;Kompensation\\;durch\\;Nebenplus",
    formulaNote:
      "Die Formel ist absichtlich einfach: Nichtkompensation schützt vor der Erzählung, ein guter Teil könne einen schweren Schaden einfach aufheben.",
    backflow: [
      "Greenwashing-/Impact-Washing-Begriffe mit Nichtkompensation und Reverse Merit Order verknüpfen.",
      "Öffentliche Beispiele vorsichtig modellhaft formulieren, ohne Personen- oder Unternehmenspranger.",
      "Prüfungsfälle zu SDG-Washing und Kompensationsnarrativen geschuetzt ausarbeiten.",
    ],
  },
  {
    slug: "woek-g-v36",
    sprint: 5,
    code: "V36",
    title: "Scorecard lesen und begründen",
    thesis:
      "Eine Scorecard lesen heißt nicht, Farben abzulesen. Es heißt, Indikatoren, Datenqualität, Benchmarks, rote Linien, Unsicherheit und Rückkopplung so zu begründen, dass eine Entscheidung nachvollziehbar wird.",
    pages: [
      "referenz/kapitel-032-benchmarks-skalen-und-scorecards/index.html",
      "referenz/kapitel-050-produktscorecards/index.html",
      "referenz/kapitel-051-das-apfelbeispiel/index.html",
      "werkzeuge/scorecards/index.html",
      "werkzeuge/impact-controlling/methodenpapiere/scorecards-benchmarks-nwi/index.html",
      "werkzeuge/impact-controlling/dossiers/impact-of-investment/index.html",
    ],
    matrix: [
      ["Lesen", "Profil, Felder, Skalen und Datenqualität erkennen", "Ampel intuitiv deuten", "jede Stufe mit Quelle und Benchmark verbinden"],
      ["Begründen", "warum eine Bewertung gilt", "Wert behaupten", "Wirkpfad, Daten, Unsicherheit und Grenze nennen"],
      ["Entscheiden", "Konsequenz aus Profil ziehen", "Score nur dokumentieren", "Beschaffung, Preis, Budget oder Strategie rückkoppeln"],
      ["Kommunizieren", "verständlich und nicht übertreibend erklären", "Score als Wahrheit verkaufen", "Aussagegrenzen sichtbar machen"],
    ],
    cases: [
      "Beim Apfel wird die Scorecard erst verständlich, wenn Studierende Klima, Wasser, Boden, Arbeit, Gesundheit, Transport, Verpackung und Datenqualität getrennt lesen und danach das kritische Feld begründen.",
      "Eine Investment-Scorecard kann hohe Transformationswirkung zeigen, aber schlechte Datenqualität enthalten. Dann ist die Entscheidung vielleicht ein Pilot, nicht eine harte Kapitalallokation.",
    ],
    formula: "Begruendung = Score + Quelle + Benchmark + Datenqualitaet + Grenze + Rueckkopplung",
    formulaNote:
      "Eine Scorecard ist erst begründet, wenn nicht nur der Wert, sondern auch Herkunft, Vergleich, Unsicherheit, Grenze und Konsequenz sichtbar sind.",
    backflow: [
      "Reader sollte Scorecard-Lesehilfe als wiederverwendbaren Kasten bekommen.",
      "Apfelbeispiel als Abschlussfall von G3.4 in Quiz und Prüfung aufnehmen.",
      "PDF-CI sollte Scorecards nicht nur als Tabellen, sondern als Bewertungsprofile setzen.",
    ],
  },
];

lectures.push(
  ...[
    ["woek-g-v01", 6, "V01", "Die Maßstabskrise", ["referenz/kapitel-002-die-massstabskrise/index.html", "referenz/kapitel-003-kapital-als-werkzeug-und-falscher-kompass/index.html", "referenz/kapitel-004-die-entstehung-des-falschen-kompasses/index.html", "referenz/kapitel-005-wohlstand-auf-kosten-kuenftiger-stabilitaet/index.html"]],
    ["woek-g-v02", 6, "V02", "Wirkung statt Kapital", ["referenz/kapitel-003-kapital-als-werkzeug-und-falscher-kompass/index.html", "referenz/kapitel-009-die-einfache-idee/index.html", "referenz/kapitel-010-wirkung/index.html", "referenz/kapitel-015-leistung-neu-definieren/index.html"]],
    ["woek-g-v03", 6, "V03", "Die Wirkungsökonomie als neue Steuerungslogik", ["referenz/kapitel-009-die-einfache-idee/index.html", "referenz/kapitel-016-das-begriffssystem-der-wirkungsoekonomie/index.html", "referenz/kapitel-021-das-wirkungsrad/index.html", "referenz/kapitel-022-wirkungslenkung/index.html"]],
    ["woek-g-v04", 6, "V04", "Gewinn, Wachstum und Reichweite als unvollständige Erfolgsgrößen", ["referenz/kapitel-015-leistung-neu-definieren/index.html", "referenz/kapitel-042-unternehmen-als-wirkungssysteme/index.html", "referenz/kapitel-053-markttransformation/index.html", "referenz/kapitel-055-wachstum-innovation-und-transformation-innerhalb-planetarer-grenzen/index.html"]],
    ["woek-g-v05", 6, "V05", "Wirkleistung, Scheinleistung, Blindleistung und Verlustleistung", ["referenz/kapitel-007-buerokratie-als-reparaturmaschine/index.html", "referenz/kapitel-015-leistung-neu-definieren/index.html", "referenz/kapitel-021-das-wirkungsrad/index.html", "referenz/kapitel-022-wirkungslenkung/index.html"]],
    ["woek-g-v06", 6, "V06", "Zukunftsfähigkeit, Risiko und Resilienz", ["referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/index.html", "referenz/kapitel-065-resilienzstaat/index.html", "referenz/kapitel-095-globale-resilienz-sicherheit-und-kooperation/index.html", "referenz/kapitel-106-die-fehlbarkeit-der-wirkungsoekonomie/index.html"]],
    ["woek-g-v07", 6, "V07", "Mensch als Wirkungsdimension", ["referenz/kapitel-024-der-mensch-im-system/index.html", "referenz/kapitel-025-angst-status-zugehoerigkeit-und-macht/index.html", "referenz/kapitel-026-sinn-selbstwirksamkeit-und-beziehung/index.html", "referenz/kapitel-071-kindheit-familie-und-fruehes-leben/index.html"]],
    ["woek-g-v08", 6, "V08", "Planet als Wirkungsdimension", ["referenz/kapitel-027-planet-koexistenz-statt-extraktion/index.html", "referenz/kapitel-048-produkte-als-wirkungstraeger/index.html", "referenz/kapitel-055-wachstum-innovation-und-transformation-innerhalb-planetarer-grenzen/index.html", "wirkungsfelder/klima-energie-ressourcen/index.html"]],
    ["woek-g-v09", 6, "V09", "Demokratie als Wirkungsdimension", ["referenz/kapitel-028-demokratie-als-wirkungsraum/index.html", "referenz/kapitel-061-politik-als-wirkungsraum/index.html", "referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/index.html", "referenz/kapitel-079-diskurskultur/index.html"]],
    ["woek-g-v10", 7, "V10", "Wirkung ist nicht Absicht", ["referenz/kapitel-010-wirkung/index.html", "referenz/kapitel-011-wirkungspotenzial/index.html", "referenz/kapitel-012-handlung-unterlassen-und-rueckkopplung/index.html", "referenz/kapitel-013-wirkungstraeger-wirkungsempfaenger-wirkungsraeume/index.html"]],
    ["woek-g-v11", 7, "V11", "Positive, negative und neutrale Wirkung", ["referenz/kapitel-010-wirkung/index.html", "referenz/kapitel-014-systemischer-wert-und-normativer-wert/index.html", "referenz/kapitel-016-das-begriffssystem-der-wirkungsoekonomie/index.html", "referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/index.html"]],
    ["woek-g-v12", 7, "V12", "Wirkungsempfänger und Wirkungsräume", ["referenz/kapitel-013-wirkungstraeger-wirkungsempfaenger-wirkungsraeume/index.html", "referenz/kapitel-018-wirkungsordnungen/index.html", "referenz/kapitel-019-nichttriviale-systeme/index.html", "referenz/kapitel-020-systemhebel-engpaesse-und-interdependenzen/index.html"]],
    ["woek-g-v13", 7, "V13", "Handlung, Unterlassen und Zustandsveränderung", ["referenz/kapitel-012-handlung-unterlassen-und-rueckkopplung/index.html", "referenz/kapitel-013-wirkungstraeger-wirkungsempfaenger-wirkungsraeume/index.html", "referenz/kapitel-036-wirkung-als-rechtsprinzip/index.html", "referenz/kapitel-039-wirkungshaushalt-und-oeffentliche-mittel/index.html"]],
    ["woek-g-v14", 7, "V14", "Wirkung erster, zweiter und dritter Ordnung", ["referenz/kapitel-018-wirkungsordnungen/index.html", "referenz/kapitel-019-nichttriviale-systeme/index.html", "referenz/kapitel-020-systemhebel-engpaesse-und-interdependenzen/index.html", "referenz/kapitel-021-das-wirkungsrad/index.html"]],
    ["woek-g-v15", 7, "V15", "Nebenwirkungen, Rebound und Zielkonflikte", ["referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/index.html", "referenz/kapitel-047-unternehmensrisiko-und-transformation/index.html", "referenz/kapitel-104-wirkungsmessung-manipulation-und-wirkungssimulation/index.html", "begriffe/rebound-effekt/index.html"]],
    ["woek-g-v16", 7, "V16", "Märkte, Produkte und Lieferketten als Wirkungsräume", ["referenz/kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung/index.html", "referenz/kapitel-048-produkte-als-wirkungstraeger/index.html", "referenz/kapitel-092-handel-lieferketten-und-globale-wirkung/index.html", "dokumente/wirkungsoekonomie-in-der-lieferkette/index.html"]],
    ["woek-g-v17", 7, "V17", "Medien, Sprache und Öffentlichkeit als Wirkungsräume", ["referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/index.html", "referenz/kapitel-075-plattformlogik-und-algorithmen/index.html", "referenz/kapitel-076-framing-sprache-und-tonalitaet/index.html", "referenz/kapitel-077-desinformation-und-hybride-kriegsfuehrung/index.html"]],
    ["woek-g-v18", 7, "V18", "Zeit, Generationen und unsichtbare Betroffene", ["referenz/kapitel-029-zeit-endlichkeit-und-generationenverantwortung/index.html", "referenz/kapitel-055-wachstum-innovation-und-transformation-innerhalb-planetarer-grenzen/index.html", "referenz/kapitel-060-verteilung-eigentum-und-wohlstand/index.html", "referenz/kapitel-071-kindheit-familie-und-fruehes-leben/index.html"]],
    ["woek-g-v19", 7, "V19", "Wirkstoff, Wirkmechanismus und Wirkungspotenzial", ["referenz/kapitel-011-wirkungspotenzial/index.html", "referenz/kapitel-020-systemhebel-engpaesse-und-interdependenzen/index.html", "referenz/kapitel-021-das-wirkungsrad/index.html", "referenz/kapitel-022-wirkungslenkung/index.html"]],
    ["woek-g-v20", 7, "V20", "Gesellschaftliche Resonanzfaktoren", ["referenz/kapitel-074-oeffentlichkeit-als-wirkungsraum/index.html", "referenz/kapitel-076-framing-sprache-und-tonalitaet/index.html", "referenz/kapitel-079-diskurskultur/index.html", "referenz/kapitel-102-die-sdgs-zwischen-globaler-kooperation-und-verschwoerungsnarrativ/index.html"]],
  ].map(([slug, sprint, code, title, pages]) => ({
    slug,
    sprint,
    code,
    title,
    thesis: `${title} markiert im Grundstudium eine Grundentscheidung der Wirkungsökonomie: Entscheidend ist nicht, was plausibel klingt, sondern welche Zustände sich bei welchen Wirkungsempfängern in welchem Wirkungsraum tatsächlich verändern.`,
    pages,
    matrix: [
      ["Begriff", "Was muss präzise getrennt werden?", "Typischer Fehler", "Saubere WÖk-Lesart"],
      ["Wirkung", "tatsächliche Zustandsveränderung", "Absicht, Aktivität oder Reichweite als Wirkung ausgeben", "Zustand, Empfänger, Wirkpfad und Quelle nennen"],
      ["Potenzial", "mögliche künftige Wirkung", "Möglichkeit als Ergebnis verkaufen", "Bedingungen, Unsicherheit und Resonanzraum markieren"],
      ["Risiko", "mögliche negative Wirkung oder Nebenwirkung", "positive Geschichte ohne Schattenseite erzählen", "Nebenwirkungen, Rebound und Zielkonflikte offenlegen"],
      ["Rückkopplung", "Konsequenz aus beobachteter oder bewerteter Wirkung", "Reporting als Abschluss behandeln", "Lernen und Steuerungsänderung einbauen"],
    ],
    cases: [
      `Ein Projekt kann im Themenfeld ${title} überzeugend kommunizieren und trotzdem nur Wirkungspotenzial erzeugen. Die WÖk-Prüfung beginnt erst, wenn klar wird, welcher Zustand sich bei wem verändert.`,
      `Eine Organisation kann im Themenfeld ${title} gute Absichten haben und zugleich Wirkungsrisiken übersehen. Das Skript trainiert deshalb die Trennung von Absicht, Auslöser, Wirkmechanismus, Empfänger, Datenlage und Bewertung.`,
    ],
    formula: "Wirkung = \\Delta Zustand(Empfaenger, Raum, Zeit) \\; durch \\; Wirkpfad(Ausloeser, Mechanismus, Resonanz, Rueckkopplung)",
    formulaNote:
      "Die Formel ist ein didaktisches Raster: Sie schützt davor, Wirkung auf Absicht, Output, Symbolik oder Reichweite zu verkürzen.",
    backflow: [
      `Glossar und Reader sollten ${title} mit Wirkung, Wirkungspotenzial, Wirkungsrisiko und Rückkopplung verlinken.`,
      "Fallbeispiele aus Website und Journal als Prüfungsfälle ohne öffentliche Antwortlogik markieren.",
      "Wo Begriffe noch unscharf sind, Rückfluss in zentrale Begriffsseiten und Erklärseiten anlegen.",
    ],
  })),
);

lectures.push(
  ...[
    ["wirkungsmanagement-v1", 8, "WM-V1", "Was ist Wirkungsmanagement?", ["referenz/kapitel-042-unternehmen-als-wirkungssysteme/index.html", "referenz/kapitel-043-wirkungsorientierte-unternehmensfuehrung/index.html", "referenz/kapitel-022-wirkungslenkung/index.html", "werkzeuge/impact-controlling/dossiers/wirkungscontrolling/index.html"]],
    ["wirkungsmanagement-v2", 8, "WM-V2", "Wirkungsräume, Wirkungsempfänger, Stakeholder und Wirkpfade", ["referenz/kapitel-013-wirkungstraeger-wirkungsempfaenger-wirkungsraeume/index.html", "referenz/kapitel-042-unternehmen-als-wirkungssysteme/index.html", "referenz/kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung/index.html", "referenz/kapitel-092-handel-lieferketten-und-globale-wirkung/index.html"]],
    ["wirkungsmanagement-v3", 8, "WM-V3", "Wirkungsziele und Wirkungslogik in Organisationen", ["referenz/kapitel-021-das-wirkungsrad/index.html", "referenz/kapitel-043-wirkungsorientierte-unternehmensfuehrung/index.html", "referenz/kapitel-044-wirkungscontrolling-im-unternehmen/index.html", "werkzeuge/kii-statt-kpi/index.html"]],
    ["wirkungsmanagement-v4", 8, "WM-V4", "Wesentlichkeit & Priorisierung", ["referenz/kapitel-030-von-wirkung-zu-messung/index.html", "referenz/kapitel-032-benchmarks-skalen-und-scorecards/index.html", "referenz/kapitel-047-unternehmensrisiko-und-transformation/index.html", "dokumente/arbeitspapier-doppelte-wesentlichkeit-impact-controlling/index.html"]],
    ["wirkungsmanagement-v5", 8, "WM-V5", "Wirkungspotenziale und Wirkungsrisiken analysieren", ["referenz/kapitel-011-wirkungspotenzial/index.html", "referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/index.html", "referenz/kapitel-047-unternehmensrisiko-und-transformation/index.html", "werkzeuge/unternehmens-wirkungscheck/index.html"]],
    ["wirkungsmanagement-v6", 8, "WM-V6", "Nebenwirkungen, Rebound, Zielkonflikte und Wirkungsgrenzen", ["referenz/kapitel-023-wirkungsrisiko-und-wirkungsresilienz/index.html", "referenz/kapitel-033-reverse-merit-order/index.html", "begriffe/wirkungsgrenze/index.html", "begriffe/rebound-effekt/index.html"]],
    ["wirkungsmanagement-v7", 8, "WM-V7", "Wirkungskompetenz, Führung und Organisationskultur", ["referenz/kapitel-024-der-mensch-im-system/index.html", "referenz/kapitel-026-sinn-selbstwirksamkeit-und-beziehung/index.html", "referenz/kapitel-045-organisation-kultur-und-verantwortung/index.html", "referenz/kapitel-043-wirkungsorientierte-unternehmensfuehrung/index.html"]],
    ["wirkungsmanagement-v8", 8, "WM-V8", "Wirkungsstrategie im Unternehmen", ["referenz/kapitel-042-unternehmen-als-wirkungssysteme/index.html", "referenz/kapitel-043-wirkungsorientierte-unternehmensfuehrung/index.html", "referenz/kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung/index.html", "referenz/kapitel-047-unternehmensrisiko-und-transformation/index.html"]],
    ["wirkungsmanagement-v9", 8, "WM-V9", "Kommunikation ohne Impact-Washing", ["referenz/kapitel-076-framing-sprache-und-tonalitaet/index.html", "referenz/kapitel-104-wirkungsmessung-manipulation-und-wirkungssimulation/index.html", "begriffe/impact-washing/index.html", "begriffe/wirkungswahrheit/index.html"]],
    ["wirkungsmanagement-v10", 8, "WM-V10", "90-Tage-Umsetzungsplan (Abschlussprojekt)", ["referenz/kapitel-097-der-umsetzungspfad/index.html", "referenz/kapitel-098-pilotprojekte/index.html", "referenz/kapitel-100-transformationspfade/index.html", "werkzeuge/unternehmens-wirkungscheck/index.html"]],
  ].map(([slug, sprint, code, title, pages]) => ({
    slug,
    sprint,
    code,
    title,
    thesis: `${title} übersetzt die Wirkungsökonomie in Führungs-, Strategie- und Organisationspraxis. Wirkungsmanagement heißt: Wirkung nicht nur berichten, sondern Ziele, Rollen, Entscheidungen, Kultur und Rückkopplung danach ausrichten.`,
    pages,
    matrix: [
      ["Managementebene", "WÖk-Frage", "Typischer Fehler", "Praxisanforderung"],
      ["Strategie", "Welche positive Netto-Wirkung wird angestrebt?", "Purpose-Satz ohne Steuerung", "Ziel, Wirkpfad und Entscheidung koppeln"],
      ["Organisation", "Wer trägt welche Wirkung?", "Verantwortung diffus lassen", "Rollen, Routinen und Eskalationswege definieren"],
      ["Risiko", "Welche Nebenwirkungen und Zielkonflikte entstehen?", "nur positive Wirkung erzählen", "Wirkungsrisiken eigenständig analysieren"],
      ["Lernen", "Wie verändert Bewertung die Praxis?", "Reporting als Abschluss", "Rückkopplung in Budget, Prozesse und Führung"],
    ],
    cases: [
      `Ein Unternehmen kann ${title} als Workshop-Thema behandeln und danach unverändert weiterarbeiten. Wirkungsmanagement beginnt erst, wenn Entscheidungen, Verantwortlichkeiten und Budgets tatsächlich angepasst werden.`,
      "Ein Team erkennt eine negative Nebenwirkung seines Produkts. Die WÖk-Frage lautet nicht, wer schuld ist, sondern welcher Wirkpfad korrigiert werden muss und welche Trägerstruktur Lernen ermöglicht.",
    ],
    formula: "Managementwirkung = Zielklarheit + Verantwortlichkeit + Daten + Entscheidung + Rueckkopplung",
    formulaNote:
      "Die Formel ist ein Arbeitsmodell: Management wirkt, wenn Ziel, Verantwortung, Daten, Entscheidung und Rückkopplung zusammenkommen.",
    backflow: [
      `${title} als Organisationsfall mit Rollen, Routinen und Entscheidungspunkten in die Management-Lane zurückspielen.`,
      "Prüfungsfälle ohne öffentliche Antwortlogik als Managementszenarien anlegen.",
      "Glossarverweise zu Wirkungsmanagement, Wirkungsstrategie und Rückkopplung verdichten.",
    ],
  })),
);

lectures.push(
  ...[
    ["wirkungscontrolling-wc-v1", 9, "WC-V1", "Von KPI zu KII und der Kennzahlen-Stack", ["referenz/kapitel-044-wirkungscontrolling-im-unternehmen/index.html", "werkzeuge/kii-statt-kpi/index.html", "werkzeuge/impact-controlling/index.html", "werkzeuge/impact-controlling/detailkonzepte/kii-statt-kpi/index.html", "werkzeuge/impact-controlling/dossiers/wirkungscontrolling/index.html", "werkzeuge/impact-controlling/detailkonzepte/impact-controlling-als-system/index.html", "werkzeuge/impact-controlling/methodenpapiere/index.html"]],
    ["wirkungscontrolling-wc-v2", 9, "WC-V2", "Wirkungsdaten & Rahmenwerke", ["referenz/kapitel-030-von-wirkung-zu-messung/index.html", "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/index.html", "referenz/kapitel-085-dpp-infrastruktur-und-technische-umsetzung/index.html", "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html"]],
    ["wirkungscontrolling-wc-v3", 9, "WC-V3", "WÖk-IDs und Indikatorenarchitektur", ["referenz/kapitel-031-woek-ids-und-indikatorenarchitektur/index.html", "werkzeuge/woek-ids/index.html", "werkzeuge/impact-controlling/methodenpapiere/woek-ids-indikatorenarchitektur/index.html", "werkzeuge/impact-controlling/dossiers/woek-ids/index.html", "referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/index.html", "dokumente/woek-master-items-final-v1-2/index.html"]],
    ["wirkungscontrolling-wc-v4", 9, "WC-V4", "Scorecards, Benchmarks und Bewertungslogik", ["referenz/kapitel-032-benchmarks-skalen-und-scorecards/index.html", "referenz/kapitel-050-produktscorecards/index.html", "referenz/kapitel-051-das-apfelbeispiel/index.html", "werkzeuge/scorecards/index.html", "werkzeuge/impact-controlling/methodenpapiere/scorecards-benchmarks-nwi/index.html", "werkzeuge/impact-controlling/dossiers/scorecards/index.html", "dokumente/von-der-wissensgesellschaft-zur-wirkungsgesellschaft/index.html"]],
    ["wirkungscontrolling-wc-v5", 9, "WC-V5", "Reverse Merit Order und Nichtkompensation (operativ)", ["referenz/kapitel-033-reverse-merit-order/index.html", "werkzeuge/reverse-merit-order/index.html", "begriffe/nichtkompensationsprinzip/index.html", "werkzeuge/impact-controlling/detailkonzepte/reverse-merit-order/index.html", "referenz/kapitel-050-produktscorecards/index.html", "begriffe/wirkungsgrenze/index.html", "begriffe/greenwashing/index.html", "referenz/kapitel-104-wirkungsmessung-manipulation-und-wirkungssimulation/index.html"]],
    ["wirkungscontrolling-wc-v6", 9, "WC-V6", "Wirkungsmonitoring und Wirkungsdatenräume", ["referenz/kapitel-035-digitale-produktpaesse-und-wirkungsdatenraeume/index.html", "referenz/kapitel-080-digitalisierung-als-infrastruktur-der-wirkungsoekonomie/index.html", "referenz/kapitel-081-wirkungsdatenraeume/index.html", "werkzeuge/datenraum-reifegradcheck/index.html"]],
    ["wirkungscontrolling-wc-v7", 9, "WC-V7", "T-SROI und IoI", ["referenz/kapitel-034-t-sroi-und-systemische-transformationsmessung/index.html", "werkzeuge/t-sroi/index.html", "werkzeuge/impact-controlling/t-sroi/index.html", "werkzeuge/impact-controlling/dossiers/impact-of-investment/index.html", "werkzeuge/impact-controlling/dossiers/t-sroi/index.html", "dokumente/whitepaper-t-sroi/index.html", "wirkungsfelder/gesundheit-pflege/tools/t-sroi-praevention-gesundheitsinvestitionen/index.html", "begriffe/t-sroi/index.html"]],
    ["wirkungscontrolling-wc-v8", 9, "WC-V8", "Wirkung in CAPEX, OPEX, Portfolio und Einkauf", ["referenz/kapitel-046-interne-wertschoepfung-und-lieferkettensteuerung/index.html", "referenz/kapitel-048-produkte-als-wirkungstraeger/index.html", "referenz/kapitel-049-ehrliche-preise/index.html", "referenz/kapitel-059-kapitalmaerkte-und-fonds/index.html", "werkzeuge/impact-controlling/impact-of-investment/index.html", "werkzeuge/impact-controlling/dossiers/impact-of-investment/index.html", "werkzeuge/portfolio-wirkungsrating/index.html", "dokumente/impact-strategie-controlling-marketing-management-einkauf-chemieindustrie/index.html"]],
    ["wirkungscontrolling-wc-v9", 9, "WC-V9", "Wirkungsaudit, Datenqualität, Assurance und Missbrauchsschutz", ["werkzeuge/datenqualitaet-assurance/index.html", "werkzeuge/impact-controlling/detailkonzepte/datenqualitaet-assurance/index.html", "werkzeuge/impact-controlling/dossiers/datenqualitaet-assurance/index.html", "begriffe/wirkungsaudit/index.html", "begriffe/wirkungsassurance/index.html", "referenz/kapitel-104-wirkungsmessung-manipulation-und-wirkungssimulation/index.html", "referenz/kapitel-106-die-fehlbarkeit-der-wirkungsoekonomie/index.html"]],
    ["wirkungscontrolling-wc-v10", 9, "WC-V10", "Fallstudie – Vom Wirkungsdatensatz zur Steuerungsentscheidung (Abschlussfall)", ["referenz/kapitel-098-pilotprojekte/index.html", "referenz/kapitel-099-wirkungsoekonomie-im-alltag/index.html", "referenz/kapitel-100-transformationspfade/index.html", "werkzeuge/impact-controlling/dossiers/impact-of-investment/index.html", "werkzeuge/impact-controlling/dossiers/beispielrechnungen/index.html", "dokumente/beispiel-konzern/index.html", "werkzeuge/unternehmens-wirkungscheck/index.html"]],
  ].map(([slug, sprint, code, title, pages]) => ({
    slug,
    sprint,
    code,
    title,
    thesis: `${title} macht die WÖk prüfbar: Impact-Controlling übersetzt Wirkungslogik in Indikatoren, Datenqualität, Bewertungsprofile, Audits und Steuerungsentscheidungen.`,
    pages,
    matrix: [
      ["Controllingebene", "Funktion", "Typischer Fehler", "Saubere WÖk-Anwendung"],
      ["Kennzahl", "Zustand sichtbar machen", "KPI als Wirkung ausgeben", "KII mit Wirkpfad und Empfänger verknüpfen"],
      ["Datenqualität", "Aussagekraft begrenzen", "Zahl ohne Quelle nutzen", "Quelle, Einheit, Aktualität und Prüfstatus ausweisen"],
      ["Bewertung", "Daten in Profil übersetzen", "Score als Wahrheit behandeln", "Benchmark, Archetyp und Sperrlogik offenlegen"],
      ["Steuerung", "Entscheidung verändern", "Dashboard ohne Konsequenz", "CAPEX, OPEX, Einkauf, Portfolio oder Audit rückkoppeln"],
    ],
    cases: [
      `Ein Dashboard zu ${title} ist erst dann Impact-Controlling, wenn die Kennzahl eine Zustandsveränderung adressiert und eine Entscheidung auslöst.`,
      "Ein Datensatz mit guter Optik, aber schwacher Datenqualität darf nicht als harte Steuerungsgrundlage dienen. Die WÖk verlangt Unsicherheitsausweis, Auditpfad und Korrektur.",
    ],
    formula: "Impact\\text{-}Controlling = KII + Datenqualitaet + Bewertung + Audit + Steuerungsentscheidung",
    formulaNote:
      "Die Formel zeigt die operative Kette: Erst aus Kennzahlen, Datenqualität, Bewertung, Audit und Entscheidung entsteht steuerungsfähige Wirkung.",
    backflow: [
      `${title} als Controllingfall mit Datenfeldern, Qualitätsklassen und Entscheidungslogik weiter ausarbeiten.`,
      "Geschützte Prüfungslogik mit Datensatz, Rubric und CorrectAnswer separat in der App-Lane pflegen.",
      "Reader/PDF sollte Tabellen, Formeln und Auditpfad für Controlling-Lektionen besonders sauber setzen.",
    ],
  })),
);

function decode(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß");
}

function cleanText(text) {
  return decode(text)
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s+/g, " ")
    .trim();
}

function textFromHtml(path, maxBlocks = 38) {
  if (!existsSync(path)) return [];
  let html = readFileSync(path, "utf8");
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  const raw = [...main.matchAll(/<(h[23]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) =>
      cleanText(
        match[2]
          .replace(/<a[^>]+class="source-chip"[^>]*>[\s\S]*?<\/a>/gi, "")
          .replace(/<[^>]+>/g, " ")
      ),
    )
    .filter(Boolean);

  const skip = /^(Inhaltsverzeichnis|Stand dieser Onlinefassung|Live-Reference-Hinweis|Changelog|Betroffene Begriffe|Quelle der Aktualisierung|Aktualisierung der lebenden Online-Referenz|Teil |Kapitel \d+$)/;
  const useful = raw.filter((line) => !skip.test(line) && !line.includes("Diese Seite ist Teil der lebenden Online-Referenz"));
  const start = useful.findIndex((line) => /^Kapitel \d+ - /.test(line));
  const blocks = (start >= 0 ? useful.slice(start) : useful).filter((line) => !/^Quellen\b/i.test(line));
  return blocks.slice(0, maxBlocks);
}

function blockToMarkdown(path) {
  const blocks = textFromHtml(path);
  if (!blocks.length) return "";
  const rel = path.replace(`${ROOT}/`, "");
  const [heading, ...rest] = blocks;
  const body = rest
    .map((line) => {
      if (/^\d+\.\d+/.test(line)) return `### ${line}`;
      if (/^Kapitel \d+ - /.test(line)) return `### ${line}`;
      return line;
    })
    .join("\n\n");
  return `### Quellenanker: ${heading}\n\n*Interne Quelle:* \`${rel}\`\n\n${body}`;
}

function matrixMarkdown(rows) {
  return [
    "| Analyseobjekt | Woran es wirkt | Typischer Fehler | Saubere WÖk-Lesart |",
    "|---|---|---|---|",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function buildDeepening(lecture) {
  const sprint = lecture.sprint ?? 2;
  const sourceBlocks = lecture.pages.map(blockToMarkdown).filter(Boolean).join("\n\n");
  const externalNotes = lecture.externalNotes?.length
    ? `\n### 7.8 Extern geprüfte Primärquellen und aktueller Stand\n\n${lecture.externalNotes.map((item) => `- ${item}`).join("\n")}\n`
    : "";
  return `## 7. Tiefenskript-Erweiterung Sprint ${sprint}

**Status dieser Erweiterung:** V1-finalisierte Codex-Erweiterung fuer Markdown-Master, Word-Rohfassung und Reader-Spiegel. Satz, Medienintegration, Lektorat und PDF-Freigabe bleiben der Claude-CI/CD-Lane vorbehalten.

### 7.1 Leitthese

${lecture.thesis}

Die Vorlesung bleibt dabei an die Grundregel gebunden: Wirkung ist neutral und relational. Erst die Bewertung im Referenzrahmen Mensch, Planet, Demokratie, SDGs, Agenda 2030 und SDG+ entscheidet, ob eine Veränderung positiv, negativ oder ambivalent einzuordnen ist. Wenn eine Zielgröße gemeint ist, sprechen wir von positiver Netto-Wirkung.

### 7.2 Didaktische Einordnung im Studiengang

${lecture.code} liegt an der Schwelle zwischen begrifflicher Grundlegung und Bewertungsarchitektur. Die Studierenden sollen nicht nur Begriffe wiedergeben, sondern an Fällen erkennen, welche Aussage schon Wirkung behauptet, welche nur Wirkungspotenzial beschreibt und wo ein Wirkungsrisiko offenliegt. Der Tiefensinn dieser Vorlesung liegt deshalb nicht in zusätzlicher Komplexität, sondern in besserer Unterscheidungsfähigkeit.

Für die spätere Praxis ist entscheidend, dass jede Analyse vier Ebenen getrennt hält:

1. **Beschreibung:** Was geschieht tatsächlich oder soll geschehen?
2. **Kausalannahme:** Über welchen Mechanismus könnte daraus eine Zustandsveränderung entstehen?
3. **Bewertung:** Welche Richtung hat diese Veränderung im Referenzrahmen?
4. **Rückkopplung:** Welche Entscheidung, Regel, Ressource oder Kommunikation wird dadurch verändert?

Wo diese Ebenen vermischt werden, entstehen typische WÖk-Fehler: Aktivität wird als Wirkung ausgegeben, Reichweite ersetzt Zustandsveränderung, gute Absicht verdeckt Nebenwirkungen oder Reporting wird mit Lernen verwechselt.

### 7.3 Analysemodell

${matrixMarkdown(lecture.matrix)}

### 7.4 Modellformel

Die folgende Formel ist ein didaktisches Denkmodell, kein amtlicher Bewertungsstandard:

$$
${lecture.formula}
$$

${lecture.formulaNote}

Die Formel soll gerade keine Scheingenauigkeit erzeugen. Sie zwingt dazu, die Faktoren offen zu legen, die eine Aussage tragen. In einem echten Bewertungsprozess müssten Datenquelle, Aktualität, Datenqualitätsklasse, Unsicherheitsgrad und Rückkopplungsregel ergänzt werden.

### 7.5 Fallfenster

${lecture.cases.map((text, idx) => `**Fall ${idx + 1}.** ${text}`).join("\n\n")}

### 7.6 Prüfungsnahe Fallfragen ohne geschützte Antwortlogik

Diese Fragen sind öffentlich und dienen dem Lernen. Die geschützte Antwortlogik, Scoring-Regeln und CorrectAnswer-Felder bleiben in der Prüfungs-Lane der App.

1. Beschreibe den Auslöser im Fall und trenne ihn von Absicht, Image oder Reichweite.
2. Formuliere einen plausiblen Wirkpfad mit Wirkungsempfängern, Zustandsveränderung und Rückkopplung.
3. Benenne mindestens ein Wirkungspotenzial und ein Wirkungsrisiko.
4. Zeige, welche Quelle oder Datenart nötig wäre, um von Potenzial zu belastbarer Wirkungsaussage zu kommen.
5. Prüfe, ob Nichtkompensation oder Reverse Merit Order einschlägig sein könnten.
6. Formuliere eine saubere Wirkungsaussage in einem Satz: Was wissen wir, was nehmen wir an, was bleibt offen?

### 7.7 Auswertung aus der lebenden Website-Referenz

${sourceBlocks}

${externalNotes}
### 7.9 Konsequenzen für die WÖk-Architektur

Aus dieser Vorlesung fließen drei Punkte zurück in den WÖk-Korpus:

${lecture.backflow.map((item) => `- ${item}`).join("\n")}

### 7.10 Kurzfazit

${lecture.title} ist kein Randthema. Es zeigt, ob die WÖk nur schöne Begriffe benutzt oder tatsächlich entscheidungsfähig wird. Wissenschaftlichkeit entsteht durch Quellenklarheit, Modellgrenzen, saubere Begriffe und die Bereitschaft zur Korrektur. Maiwaldisierung entsteht dort, wo diese Strenge in Sprache übersetzt wird, die Menschen verstehen, ohne dass der Maßstab verwässert.
`;
}

function replaceOrInsert(markdown, lecture) {
  const sprint = lecture.sprint ?? 2;
  let next = markdown
    .replace(/\*\*Status:\*\* Rohfassung V0 · Sprint-Produktionslauf · muss im nächsten Tiefensprint auf 40-50 Seiten erweitert werden/, `**Status:** Tiefenskript-Sprint ${sprint} · substanzielle Arbeitsfassung, Claude-CI/CD-Finalisierung offen`)
    .replace(/\*\*Status:\*\* Tiefenskript-Sprint \d+ · [^\n]+/, `**Status:** Tiefenskript-Sprint ${sprint} · substanzielle Arbeitsfassung, Claude-CI/CD-Finalisierung offen`)
    .replace(/\*\*Status:\*\* Pilot-Arbeitsfassung · [^\n]+/, `**Status:** Tiefenskript-Sprint ${sprint} · substanzielle Arbeitsfassung, Claude-CI/CD-Finalisierung offen`)
    .replace(/\*\*Lesezeit:\*\* ca\. 45–60 Minuten/, "**Lesezeit:** ca. 120–180 Minuten");

  const deepening = buildDeepening(lecture).trim();
  const marker = `## 7. Tiefenskript-Erweiterung Sprint ${sprint}`;
  if (next.includes(marker)) {
    next = next.replace(new RegExp(`${marker}[\\s\\S]*?(?=\\n## 8\\. Prüfungsrelevanz|\\n## 7\\. Prüfungsrelevanz)`), deepening + "\n\n");
  } else {
    if (/\n## 7\. Prüfungsrelevanz/.test(next)) {
      next = next.replace(/\n## 7\. Prüfungsrelevanz/, `\n${deepening}\n\n## 8. Prüfungsrelevanz`);
    } else if (/\n## 17\. Mini-Quiz/.test(next)) {
      next = next.replace(/\n## 17\. Mini-Quiz/, `\n${deepening}\n\n## 17. Mini-Quiz`);
    } else {
      next = `${next.trim()}\n\n${deepening}\n`;
    }
  }
  next = next
    .replace(/\n## 8\. Quellen/g, "\n## 9. Quellen")
    .replace(/\n## 9\. Rückfluss/g, "\n## 10. Rückfluss");
  return next;
}

function updateIndex(slugs) {
  const indexPath = join(MASTER_DIR, "index.json");
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  for (const item of index.scripts) {
    if (slugs.includes(item.slug)) {
      item.status = "studienskript-v1";
      item.notes =
        "Studienskript V1: fachlich finale Codex-Fassung; Markdown-Master, Word-Rohfassung, App-Spiegel und geschuetzter Pruefungspool vorhanden. Claude-CI/CD-Satzfreigabe offen.";
    }
  }
  writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");
}

function main() {
  const touched = [];
  for (const lecture of lectures) {
    const master = join(MASTER_DIR, `${lecture.slug}.md`);
    const appMirror = join(APP, "content", "lehrgaenge", `${lecture.slug}.md`);
    const word = join(WORD_DIR, `${lecture.slug}.docx`);
    const markdown = readFileSync(master, "utf8");
    const next = replaceOrInsert(markdown, lecture);
    writeFileSync(master, next, "utf8");
    mkdirSync(dirname(appMirror), { recursive: true });
    copyFileSync(master, appMirror);
    mkdirSync(dirname(word), { recursive: true });
    execFileSync(PYTHON, [EXPORTER, master, "--out", word], { stdio: "inherit" });
    touched.push(lecture.slug);
  }
  updateIndex(touched);
  console.log(JSON.stringify({ deepened: touched }, null, 2));
}

main();
