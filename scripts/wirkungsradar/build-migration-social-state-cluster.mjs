import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-03";

const sourcePack = {
  id: "migration-social-state-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  sources: {
    destatis_einwanderungsgeschichte_2025: {
      label: "Destatis - 21,8 Mio. Menschen mit Einwanderungsgeschichte 2025",
      url: "https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_128_125.html",
      use_for: ["Einwanderungsgesellschaft", "Bevölkerungsstruktur", "26,3 % Anteil 2025"],
      warning: "Einwanderungsgeschichte ist nicht identisch mit Staatsangehörigkeit, Fluchtstatus oder Sozialleistungsbezug.",
    },
    destatis_wanderungen_2025: {
      label: "Destatis - Nettozuwanderung 2025",
      url: "https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/06/PD26_184_12411.html",
      use_for: ["Wanderungssaldo", "Zuzüge/Fortzüge", "Migrationsdynamik"],
      warning: "Nettozuwanderung sagt nichts über Qualifikation, Rechtsstatus oder Sozialstaatswirkung.",
    },
    ba_migration_arbeitsmarkt: {
      label: "Bundesagentur für Arbeit - Personen nach Staatsangehörigkeiten",
      url: "https://statistik.arbeitsagentur.de/DE/Navigation/Statistiken/Themen-im-Fokus/Migration/Personen-nach-Staatsangehoerigkeiten/Personen-nach-Staatsangehoerigkeiten-Nav.html",
      use_for: ["Arbeitsmarkt", "Beschäftigung", "Arbeitslosigkeit", "SGB-II-Daten nach Staatsangehörigkeit"],
      warning: "Staatsangehörigkeit ist nicht identisch mit Einwanderungsgeschichte.",
    },
    iab_fluchtmigration_10_jahre: {
      label: "IAB - 10 Jahre Fluchtmigration, Beschäftigungsquote",
      url: "https://iab.de/presseinfo/10-jahre-fluchtmigration-beschaeftigungsquote-von-gefluechteten-naehert-sich-dem-durchschnitt-in-deutschland-an/",
      use_for: ["Arbeitsmarktintegration Geflüchteter", "Zeithorizont Integration", "sozialversicherungspflichtige Beschäftigung"],
      warning: "Geflüchtete sind eine Teilgruppe; Ergebnisse nicht auf alle Migration übertragen.",
    },
    iab_zuwanderungsmonitor: {
      label: "IAB - Migration und Integration",
      url: "https://iab.de/category/fokusthemen/migration-und-integration/",
      use_for: ["laufende Arbeitsmarktdaten", "Beschäftigung, Arbeitslosigkeit, Hilfequoten", "Migration und Integration"],
      warning: "Daten regelmäßig aktualisieren.",
    },
    oecd_international_migration_outlook_germany: {
      label: "OECD - International Migration Outlook, Germany",
      url: "https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/11/international-migration-outlook-2025_355ae9fd/ae26c893-en.pdf",
      use_for: ["internationaler Vergleich", "Migrationskategorien", "Arbeits-, Familien- und humanitäre Migration"],
      warning: "OECD-Kategorien und deutsche Rechtskategorien unterscheiden.",
    },
    bpb_asylkosten: {
      label: "bpb - Asylbedingte Kosten und Ausgaben",
      url: "https://www.bpb.de/themen/migration-integration/zahlen-zu-asyl/265776/asylbedingte-kosten-und-ausgaben/",
      use_for: ["Asylkosten", "Kostenarten", "Asylbewerberleistungsgesetz"],
      warning: "Asylkosten nicht mit allen Sozialleistungen oder allen Migrant:innen gleichsetzen.",
    },
    svr_fakten_einwanderung: {
      label: "SVR - Fakten zur Einwanderung in Deutschland",
      url: "https://www.svr-migration.de/publikationen/",
      use_for: ["Faktenübersicht", "Bevölkerung, Migration, Integration"],
      warning: "Konkrete PDF-Version jährlich prüfen.",
    },
    mediendienst_sozialleistungen_eu: {
      label: "Mediendienst Integration - EU-Bürger:innen und Sozialleistungen",
      url: "https://mediendienst-integration.de/ein-und-auswanderung/einwanderung-aus-der-eu/wie-viele-eu-buerger-bekommen-sozialleistungen-in-deutschland/",
      use_for: ["Einordnung von EU-Bürger:innen und Sozialleistungen", "Mythen zu Sozialtourismus"],
      warning: "Primärdaten der BA/IAB zusätzlich verlinken.",
    },
  },
};

const dossier = {
  slug: "migration-kostet-nur",
  title: "Migration kostet nur?",
  subtitle: "Warum diese Aussage Sozialstaat, Arbeit und Wirkung verkürzt.",
  judgement: "Wahrer Belastungskern, falsche Sündenbocklogik.",
  abstract:
    "Die Aussage „Migration kostet nur“ enthält einen wahren Kern: Migration erzeugt reale kurzfristige Kosten und Belastungen für Kommunen, Verwaltung, Unterbringung, Bildung, Gesundheit, Sprachkurse, Integration und Sozialleistungen. Irreführend wird sie, wenn Migration pauschal als reine Last oder Menschen als „Sozialschmarotzer“ gerahmt werden. Dann verschwinden Arbeitsmarktbeiträge, Sozialversicherungsbeiträge, Fachkräftebedarf, demografische Stabilisierung, Care-Arbeit, Unternehmertum, langfristige Teilhabe, Qualifikationsanerkennung und Integrationsinfrastruktur.",
  heroNote:
    "Kein Pauschalurteil. Wirkung hängt von Status, Zeit, Zugang, Arbeit, Bildung, Qualifikation, Aufenthaltsrecht, Kommune und Integrationsinfrastruktur ab.",
  keyPoints: [
    ["Migration erzeugt kurzfristige Kosten", "Unterbringung, Verwaltung, Sprachkurse, Bildung, Gesundheit und Integration kosten Geld und belasten Kommunen, wenn Infrastruktur fehlt."],
    ["Migration erzeugt auch Beiträge", "Viele Zugewanderte arbeiten, zahlen Steuern und Sozialabgaben, gründen Unternehmen, übernehmen Care-Arbeit und stabilisieren Fachkräftebereiche."],
    ["Status entscheidet stark", "EU-Freizügigkeit, Arbeitsmigration, Flucht, Familiennachzug, Studium, Ausbildung und Schutzstatus haben sehr unterschiedliche Wirkungsprofile."],
    ["„Nie eingezahlt“ ist eine verkürzte Bilanz", "Sozialstaat ist nicht nur Sparkonto. Er ist Schutz-, Integrations-, Arbeitsmarkt-, Familien-, Gesundheits- und Stabilitätsinfrastruktur."],
    ["Sündenbocklogik verhindert Lösungen", "Wohnungsnot, Schulprobleme, kommunale Überlastung und Sozialausgaben haben mehrere Ursachen. Wer alles einer Gruppe zuschreibt, blockiert wirksame Politik."],
    ["WÖk-Lösung: Integration als Infrastruktur", "Sprache, Arbeit, Qualifikationsanerkennung, Wohnen, Bildung, Gesundheit, Kinderbetreuung, Rechtsklarheit und Antidiskriminierung müssen zusammenwirken."],
  ],
  answers: {
    ten: "Migration kostet kurzfristig Geld. Aber „Migration kostet nur“ ist falsch verkürzt. Entscheidend ist, ob Menschen Zugang zu Sprache, Arbeit, Bildung, Wohnen und Teilhabe bekommen.",
    thirty:
      "Der wahre Kern ist: Kommunen, Schulen, Wohnungsmarkt und Sozialstaat können durch Migration belastet werden. Der Denkfehler ist: daraus eine ganze Gruppe zum Problem zu machen. Viele Zugewanderte arbeiten, zahlen Steuern und Sozialabgaben, pflegen, bauen, gründen, lernen und stabilisieren Fachkräftebereiche. Die bessere Frage lautet: Welche Integrationsarchitektur macht aus Migration Teilhabe statt Dauerabhängigkeit?",
    two:
      "Ich ordne das sauber ein. Ja, Migration kann kurzfristig erhebliche Kosten verursachen: Unterbringung, Verwaltung, Sprachkurse, Schulen, Kitas, Gesundheit, soziale Unterstützung und kommunale Infrastruktur. Diese Belastungen darf man nicht kleinreden. Aber die Aussage „Migration kostet nur“ ist eine falsche Gesamtbilanz. Sie blendet aus, dass viele Menschen arbeiten, Steuern zahlen, Sozialbeiträge leisten, Betriebe gründen, Pflege und Handwerk stabilisieren und in einer alternden Gesellschaft Fachkräftebereiche tragen. Außerdem hängt die Wirkung stark davon ab, ob Menschen schnell Zugang zu Sprache, Arbeit, Qualifikationsanerkennung, Kinderbetreuung, Wohnen, Gesundheit und Rechtsklarheit bekommen. Wirkungsökonomisch ist Migration deshalb weder automatisch Last noch automatisch Lösung. Die Frage ist: Welche Politik verwandelt Ankunft in Teilhabe, Arbeit, Sicherheit und Zusammenhalt - und welche Politik erzeugt Dauerabhängigkeit, Konflikt und Misstrauen?",
  },
  redirectQuestion:
    "Meinst du kurzfristige Sozialausgaben - oder die Gesamtwirkung über Arbeit, Beiträge, Demografie, Kommunen, Bildung, Integration und Zusammenhalt?",
};

const subclaims = [
  ["„Die haben nie eingezahlt“", "nie-eingezahlt", "Wahrer Beitragskern, falscher Sozialstaatsbegriff.", "Einzahlung ist ein wichtiger Teil der Sozialstaatslogik. Aber der Sozialstaat ist mehr als ein Kontoauszug. Er ist gesellschaftliche Risikoinfrastruktur für Arbeitslosigkeit, Krankheit, Alter, Pflege, Behinderung, Kindheit, Flucht, Krisen und Übergänge.", "Welche Regelung erhöht Erwerbsbeteiligung, Qualifikationsnutzung, Beitragszahlung und soziale Stabilität am schnellsten?"],
  ["„Ausländer plündern den Sozialstaat“", "auslaender-pluendern-sozialstaat", "Sündenbockframe: reale Sozialausgaben werden zur Gruppenabwertung vergrößert.", "Reale Sozialausgaben müssen geprüft werden. Der Denkfehler entsteht, wenn daraus eine ganze Gruppe als Schaden für das Gemeinwesen konstruiert wird.", "Welche Leistung, welcher Rechtsstatus, welche Datenlage und welche Ursache liegen konkret vor?"],
  ["„Sozialtourismus“", "sozialtourismus-frame", "Kampfbegriff: muss nach Rechtsstatus, Daten und Ursachen differenziert werden.", "Der Begriff legt Absicht und Missbrauch nahe, bevor Rechtsstatus, Freizügigkeit, Arbeitsmarktlage, Familienlage und Daten geprüft wurden.", "Welche Fälle sind rechtswidrig, welche sind rechtmäßige Freizügigkeit, und welche Regeln wirken besser?"],
  ["„Sozialschmarotzer“", "sozialschmarotzer-frame", "Abwertungsframe, kein Faktenbegriff.", "Der Begriff entwertet Menschen, bevor Ursachen, Status, Rechte, Arbeitsmarktzugang, Gesundheitslage, Sprache, Qualifikation, Kinderbetreuung, Anerkennung oder Diskriminierung geprüft wurden.", "Welche Ursachen führen zu Leistungsbezug - und welche Maßnahme senkt ihn wirksam, rechtsstaatlich und menschenwürdig?"],
  ["„Integration ist gescheitert“", "integration-ist-gescheitert", "Scheiternsframe: reale Engpässe werden zum Totalurteil.", "Integration kann an Sprache, Wohnen, Bildung, Arbeit, Gesundheit, Anerkennung und Verwaltung scheitern. Daraus folgt aber nicht, dass Integration grundsätzlich unmöglich ist.", "Welche Infrastruktur fehlt konkret, und welcher Hebel verbessert Teilhabe?"],
  ["„Fachkräftemangel kann ohne Zuwanderung gelöst werden“", "fachkraeftemangel-ohne-zuwanderung", "Teilweise richtig bei Aktivierung inländischer Potenziale, aber meist demografisch verkürzt.", "Inländische Potenziale sind wichtig: Ausbildung, Frauenarbeitszeit, Weiterbildung, bessere Arbeit und Automatisierung. In einer alternden Gesellschaft ersetzt das Zuwanderung aber nicht automatisch.", "Welche Kombination aus Ausbildung, Arbeitsqualität, Automatisierung und Zuwanderung deckt den Bedarf?"],
  ["„Grenzen dicht löst das Problem“", "grenzen-dicht", "Falsche Einfachheit: ignoriert Recht, Wirtschaft, Schutzpflichten, irreguläre Wege und globale Ursachen.", "Grenzsteuerung ist ein reales Politikfeld. Als Alleinlösung blendet der Frame Rechtsstaat, Schutzpflichten, Arbeitsmigration, Familiennachzug, Fluchtursachen und europäische Koordination aus.", "Welche Steuerung ist rechtsstaatlich, wirksam und menschenwürdig?"],
  ["„Kriminalität ist vor allem Migration“", "kriminalitaet-und-migration", "Sicherheitsframe: echte Sicherheitsfragen brauchen Daten, Einzelfallprinzip und Ursachenanalyse.", "Sicherheit muss ernst genommen werden. Pauschalverdacht ersetzt aber keine Delikt-, Alters-, Sozialstruktur-, Aufenthaltsstatus- und Präventionsanalyse.", "Welche konkrete Kriminalitätsform, welche Datenbasis und welche Prävention wirken?"],
  ["„Wohnungsnot kommt durch Migranten“", "wohnungsnot-und-migration", "Sündenbockverkürzung: Migration erhöht Nachfrage, aber Wohnungsnot hat Strukturursachen.", "Zuwanderung kann lokale Nachfrage erhöhen. Wohnungsnot entsteht aber auch durch Baukosten, Boden, Leerstand, Spekulation, Planung, Sanierung und soziale Wohnraumpolitik.", "Welche Wohnungsmarktmaßnahme senkt Knappheit tatsächlich?"],
  ["„Kinder statt Einwanderer“", "kinder-statt-einwanderer", "Falsches Gegeneinander: Familienpolitik und Migration sind keine Entweder-oder-Option.", "Gute Familienpolitik ist wichtig. Sie ersetzt aber kurzfristig nicht Fachkräftebedarf, Pflegebedarf, Altersstruktur und internationale Mobilität.", "Welche Kombination stärkt Familien, Arbeit, Pflege und demografische Stabilität?"],
];

const systemRows = [
  ["Rechtsstatus", "Wer ist EU-Bürger:in, Arbeitsmigrant:in, Geflüchtete:r, Studierende:r, Familienangehörige:r, Schutzsuchende:r?", "Unterschiedliche Rechte, Pflichten und Arbeitsmarktzugänge"],
  ["Zeithorizont", "Geht es um kurzfristige Kosten oder langfristige Beiträge?", "Integration braucht Zeit; Wirkung verändert sich über Jahre"],
  ["Arbeitsmarkt", "Wer darf arbeiten, wer arbeitet, welche Qualifikation wird genutzt?", "Anerkennung, Sprache, Kinderbetreuung, Diskriminierung"],
  ["Sozialstaat", "Welche Leistung, welches System, welche Finanzierung?", "Bürgergeld, AsylbLG, Krankenversicherung, Rente, Steuern nicht vermischen"],
  ["Kommunen", "Wo entstehen Belastungen konkret?", "Schulen, Kitas, Wohnen, Unterbringung, Verwaltung, Gesundheit"],
  ["Demografie", "Wie wirkt Zuwanderung auf alternde Gesellschaft?", "Pflege, Rente, Fachkräfte, regionale Stabilität"],
  ["Sicherheit", "Welche Daten, welche Delikte, welche Alters-/Sozialstruktur?", "Einzelfallprinzip, Prävention, Rechtsstaat, Polizeistatistikgrenzen"],
  ["Demokratie", "Welche Wirkung hat Sprache auf Zusammenhalt?", "Feindbilder, Misstrauen, Ingroup/Outgroup, institutionelles Vertrauen"],
];

const truePoints = [
  "Kommunen können durch schnelle Zuwanderung überfordert werden.",
  "Unterbringung, Kitas, Schulen, Sprachkurse, Gesundheitsversorgung und Verwaltung kosten Geld.",
  "Sozialleistungsbezug ist bei bestimmten Gruppen und in bestimmten Phasen höher.",
  "Aufenthaltsunsicherheit, fehlende Sprachkenntnisse und nicht anerkannte Abschlüsse erschweren Arbeit.",
  "Wohnungsnot und lokale Verteilungskonflikte können durch zusätzliche Nachfrage sichtbarer werden.",
  "Integration kann scheitern, wenn Infrastruktur, Sprache, Arbeit, Bildung, Gesundheit und Wohnen nicht zusammenwirken.",
  "Missbrauch einzelner Personen kann vorkommen und muss rechtsstaatlich verfolgt werden.",
  "Sicherheitsfragen müssen ernst genommen werden.",
];

const missingPoints = [
  "Unterschied zwischen kurzfristiger Aufnahmebelastung und langfristiger Arbeitsmarkt- und Beitragswirkung.",
  "Unterschied zwischen EU-Freizügigkeit, Arbeitsmigration, Flucht, Familiennachzug, Studium und Ausbildung.",
  "Beiträge von Zugewanderten in Pflege, Bau, Logistik, Gastronomie, Reinigung, Gesundheit, Handwerk, Industrie, IT, Wissenschaft und Selbstständigkeit.",
  "Demografischer Kontext: alternde Gesellschaft, Renteneintritte, Fachkräftebedarf.",
  "Ursachen von Sozialleistungsbezug: Sprachzugang, Anerkennung, Kinderbetreuung, Gesundheit, Trauma, Diskriminierung, rechtlicher Status.",
  "Kommunale Unterfinanzierung und Wohnungsmarktprobleme als eigene Systemfragen.",
  "Integration als Infrastruktur: Sprache, Arbeit, Bildung, Wohnen, Gesundheit, Rechte und Zugehörigkeit.",
  "Missbrauchsbekämpfung ist etwas anderes als Gruppenabwertung.",
];

const manipulationPatterns = [
  ["Kosten ohne Beiträge", "Sozialausgaben werden sichtbar gemacht, Beiträge durch Arbeit, Steuern, Pflege, Gründung und demografische Stabilisierung verschwinden.", "Kosten und Beiträge getrennt nach Status und Zeitverlauf darstellen."],
  ["Sozialstaat als Sparkonto", "Der Sozialstaat wird so dargestellt, als dürfe nur erhalten, wer vorher individuell eingezahlt hat.", "Sozialstaat als gesellschaftliche Risikoinfrastruktur erklären."],
  ["Gruppe als Kostenstelle", "Menschen werden nicht als Personen mit Rechten, Pflichten und Potenzialen gesehen, sondern als Belastung.", "Personenstatus, Rechte, Ursachen und Teilhabepfade sichtbar machen."],
  ["Einzelfall als Systembeweis", "Ein Missbrauchsfall wird als Beweis für eine ganze Gruppe genutzt.", "Einzelfall prüfen, Grundgesamtheit und Datenlage klären."],
  ["Statusvermischung", "EU-Bürger:innen, Arbeitsmigrant:innen, Geflüchtete, Schutzsuchende, Studierende und Eingebürgerte werden zusammengeworfen.", "Rechtsstatus und Leistungssysteme trennen."],
  ["Abwertungsbegriff als Analyseersatz", "Begriffe wie „Sozialschmarotzer“ ersetzen Ursachenanalyse durch moralische Entwertung.", "Begriff markieren, nicht übernehmen; zur konkreten Wirkungsfrage wechseln."],
];

const effectPath = [
  ["Aussage", "„Ausländer kosten uns nur / die haben nie eingezahlt / Sozialtourismus / Sozialschmarotzer.“"],
  ["Wirkstoff", "Sozialkosten als Sündenbockverstärker."],
  ["Verkürzung", "Kurzfristige oder sichtbare Sozialausgaben werden mit Gesamtwirkung einer Gruppe verwechselt."],
  ["Ausblendung", "Arbeit, Beiträge, Steuern, Pflege, Unternehmertum, Demografie, Qualifikation, Status, Integrationsbarrieren und kommunale Infrastruktur verschwinden."],
  ["Resonanz", "Wut, Sozialneid, Statusangst, Verlustaversion, Kontrollbedürfnis."],
  ["Narrativ", "„Die anderen nehmen uns etwas weg.“"],
  ["Wirkungspotenzial", "Abwertung, Misstrauen und Zustimmung zu Ausschlusslogiken steigen."],
  ["Wirkungsrisiko", "Integration, Arbeitsmarktzugang, Teilhabe und Rechtsstaatlichkeit werden geschwächt."],
  ["Wirkung dritter Ordnung", "Der Sozialstaat wird nicht mehr als gemeinsame Risikoinfrastruktur erlebt, sondern als ethnisierter Verteilungskampf."],
];

const facts = [
  "Deutschland ist strukturell eine Einwanderungsgesellschaft: 2025 lebten laut Destatis 21,8 Millionen Menschen mit Einwanderungsgeschichte in Deutschland; das entsprach 26,3 % der Bevölkerung.",
  "Die Nettozuwanderung sank 2025 laut Destatis auf rund 235.000 Personen; 1,48 Mio. Zuzügen standen 1,25 Mio. Fortzüge gegenüber.",
  "Die BA bietet eine eigene Migrationsberichterstattung nach Staatsangehörigkeiten mit Zeitreihen zu Arbeitsmarkt und Grundsicherung.",
  "Das IAB berichtet für 2015 Zugezogene/Geflüchtete nach zehn Jahren eine deutliche Annäherung an die Beschäftigungsquote der Gesamtbevölkerung; Integrationswirkung braucht Zeit.",
  "OECD-Daten unterscheiden Migrationsarten wie Freizügigkeit, Arbeitsmigration, Familiennachzug und humanitäre Migration; diese Kategorien dürfen nicht vermischt werden.",
];

const woekMeasures = [
  ["Integration als Infrastruktur", "Sprache, Arbeit, Bildung, Wohnen, Gesundheit, Kinderbetreuung, Anerkennung und Rechtsklarheit müssen zusammen geplant werden."],
  ["Status und Systeme trennen", "EU-Freizügigkeit, Arbeitsmigration, Flucht, Schutz, Familiennachzug, Studium, Ausbildung, Bürgergeld, AsylbLG, Rente und Krankenversicherung dürfen nicht vermischt werden."],
  ["Schnelle Qualifikationsanerkennung", "Abschlüsse und Berufserfahrung schneller prüfen; Brückenqualifikationen und Arbeit plus Sprache verbinden."],
  ["Arbeitsmarktzugang nach Wirkung", "Arbeitserlaubnis, Beratung, Matching, Ausbildung, Kinderbetreuung und Sprachförderung so koppeln, dass Abhängigkeit sinkt."],
  ["Kommunen wirkungsbasiert finanzieren", "Kommunen brauchen Mittel nach tatsächlicher Aufnahme-, Bildungs-, Wohnungs-, Gesundheits- und Integrationslast."],
  ["Sozialmissbrauch präzise bekämpfen", "Missbrauch wird rechtsstaatlich geprüft und sanktioniert - ohne Gruppenabwertung und ohne Pauschalverdacht."],
  ["Wohnungsmarkt nicht ethnisieren", "Wohnungsnot durch Bau, Bestand, Leerstand, Bodenpolitik, Sanierung, kommunale Planung und soziale Wohnraumwirkung lösen."],
  ["Diskurs schützen", "Abwertungsbegriffe nicht amplifizieren; Mechanismus markieren; Menschenwürde, Rechtsstaat und Lösungspfad verbinden."],
];

const narrativePages = [
  ["sozialstaats-suendenbock", "Sozialstaats-Sündenbock", "Wenn Sozialausgaben zur Gruppenabwertung werden.", "hoch", "Reale Kosten oder Missbrauchsfälle werden benutzt, um eine ganze Gruppe als Last für den Sozialstaat darzustellen."],
  ["nie-eingezahlt", "Nie-eingezahlt-Narrativ", "Wenn der Sozialstaat als individuelles Sparkonto missverstanden wird.", "hoch", "Einzahlung ist wichtig. Problematisch wird der Frame, wenn Schutz, Würde und Teilhabe nur noch als vorherige Einzahlung behandelt werden."],
  ["sozialtourismus-frame", "Sozialtourismus-Frame", "Wenn Mobilität pauschal als Missbrauch gedeutet wird.", "hoch", "Ein Kampfbegriff, der Rechtsstatus, Freizügigkeit, Arbeitsmarkt und Einzelfälle vermischt."],
  ["integration-gescheitert", "Integrations-Scheiternsframe", "Wenn reale Engpässe zum Totalurteil werden.", "hoch", "Reale Integrationsprobleme werden nicht als Infrastrukturaufgabe, sondern als Beweis grundsätzlichen Scheiterns gedeutet."],
  ["migration-als-bedrohung", "Migration als Bedrohung", "Wenn Steuerungsaufgaben als existenzielle Gefahr gerahmt werden.", "hoch", "Aus realen Steuerungsfragen wird ein Angst- und Kontrollverlustframe."],
  ["grenzen-dicht-frame", "Grenzen-dicht-Frame", "Wenn komplexe Migration auf eine einfache Kontrollgeste reduziert wird.", "hoch", "Rechtsstaat, Schutzpflichten, Arbeitsmigration, Familiennachzug und Fluchtursachen verschwinden hinter einer scheinbar einfachen Geste."],
];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function words(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "object" && item !== null) return `${pad}- ${toYaml(item, indent + 2).trimStart()}`;
      return `${pad}- ${JSON.stringify(item)}`;
    }).join("\n");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).map(([key, item]) => {
      if (typeof item === "object" && item !== null) return `${pad}${key}:\n${toYaml(item, indent + 2)}`;
      return `${pad}${key}: ${JSON.stringify(item)}`;
    }).join("\n");
  }
  return `${pad}${JSON.stringify(value)}`;
}

function nav(base) {
  const links = [["Überblick", `${base}wirkungsradar/`], ["Live", `${base}wirkungsradar/live/`], ["Themen", `${base}wirkungsradar/themen/`], ["Narrative", `${base}wirkungsradar/narrative/`], ["Psychologie", `${base}wirkungsradar/psychologie/`]];
  return `<nav class="radar-subnav" aria-label="Wirkungsradar Navigation">${links.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</nav>`;
}

function shell({ title, description, canonical, base, main }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <link rel="canonical" href="${esc(canonical)}">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260603-migration-radar">
  </head>
  <body>
    <a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
    <header class="site-header" data-search-exclude><a class="brand" href="${base}index.html"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a><button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button><nav id="site-nav" class="site-nav" aria-label="Hauptnavigation"><a href="${base}kompass.html">Kompass</a><a href="${base}wirkungsradar/">Wirkungsradar</a><a href="${base}begriffe/">Begriffe</a></nav></header>
${main}
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Wirkungsökonomie</p><h2>Die neue Ordnung des Wohlstands</h2><p>Wirkungsradar: Faktenkern, Narrativ, Psychologie, Wirkungspfad und bessere Handlungsfrage.</p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Wirkungsradar öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=20260603-migration-radar"></script>
  </body>
</html>
`;
}

function summaryGrid(items, label) {
  return `<div class="radar-summary-grid" aria-label="${esc(label)}">${items.map(([k, v, tone = "neutral"]) => `<article class="radar-summary-item" data-tone="${tone}"><p class="radar-summary-label">${esc(k)}</p><p class="radar-summary-value">${esc(v)}</p></article>`).join("")}</div>`;
}

function cardGrid(items, kicker = "Prüfpunkt") {
  return `<div class="card-grid">${items.map(([title, text]) => `<article class="card"><p class="card-kicker">${esc(kicker)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p></article>`).join("")}</div>`;
}

function list(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function table(rows) {
  return `<div class="matrix-wrap"><table class="dossier-matrix"><thead><tr><th>Ebene</th><th>Leitfrage</th><th>Was verkürzte Narrative ausblenden</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function sourcesHtml() {
  return `<div class="card-grid">${Object.values(sourcePack.sources).map((source) => `<article class="card"><p class="card-kicker">Quelle vorbereiten</p><h3 class="card-title">${esc(source.label)}</h3><p class="card-text">${esc(source.use_for.join(" / "))}</p><p class="card-text"><strong>Hinweis:</strong> ${esc(source.warning)}</p><p><a class="text-link" href="${esc(source.url)}">Quelle öffnen</a></p></article>`).join("")}</div>`;
}

function accordion() {
  return `<div class="radar-answer-accordion migration-subclaim-accordion">${subclaims.map(([title, slug, judgement, text, question], index) => `<details class="radar-answer-item" id="${esc(slug)}"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(title)}</span> <span class="radar-answer-label">${esc(judgement)}</span></summary><p>${esc(text)}</p><p><strong>Bessere Wirkungsfrage:</strong> ${esc(question)}</p></details>`).join("")}</div>`;
}

function livePage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Live</nav><p class="hero-kicker">Migration, Sozialstaat &amp; Zusammenhalt</p><h1 class="hero-title">${esc(dossier.title)}</h1><p class="hero-subtitle">${esc(dossier.subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(dossier.abstract)}</p><p class="radar-status-line"><span>Status: Leuchtturm-Dossier</span><span>Datenstand: ${UPDATED_AT}</span><span>Keine Pauschalisierung</span></p></div></section>
      ${summaryGrid([["Kurzurteil", dossier.judgement, "warning"], ["Kurzclaim", "Migration nicht als Feindbild. Migration als Wirkungsraum.", "positive"], ["Hinweis", dossier.heroNote, "neutral"], ["Redaktionelle Regel", "Problem anerkennen. Sündenbocklogik trennen. Wirkung sichtbar machen. Lösung anbieten.", "positive"]], "Migration Summary")}
      ${nav("../../../")}
      <section class="section" id="sechs-punkte"><div><div class="section-header"><p class="hero-kicker">Das Wichtigste</p><h2>Sechs Punkte für eine faire Einordnung.</h2></div>${cardGrid(dossier.keyPoints, "Kernpunkt")}</div></section>
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude><a href="#live-antworten">Live antworten</a><a href="#sozialstaat-migration-verstehen">Sozialstaat &amp; Migration verstehen</a><a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a></nav>
      <section class="section dossier-tab-panel" id="live-antworten"><div><div class="section-header"><p class="hero-kicker">Tab 1</p><h2>Live antworten.</h2></div><div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge"><details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">${words(dossier.answers.ten)} Wörter</span></summary><p>„${esc(dossier.answers.ten)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">${words(dossier.answers.thirty)} Wörter</span></summary><p>„${esc(dossier.answers.thirty)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">${words(dossier.answers.two)} Wörter</span></summary><p>„${esc(dossier.answers.two)}“</p></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Gute Rückfrage</p><h3 class="card-title">${esc(dossier.redirectQuestion)}</h3></article><article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Frame, dass Menschen pauschal eine Last seien. Der reale Punkt ist kommunale und soziale Steuerung. Der falsche Sprung ist, daraus eine Gruppe zum Sündenbock zu machen.</p></article></div><article class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p>${list(["Nicht sagen: Migration kostet nichts.", "Nicht kommunale Belastungen kleinreden.", "Nicht Menschen als Kostenstelle bezeichnen.", "Nicht abwertende Begriffe wiederholen oder in Überschriften setzen.", "Nicht alle Migrant:innen, Geflüchteten, EU-Bürger:innen und Arbeitsmigrant:innen zusammenwerfen.", "Nicht Sozialleistungsbezug mit Unwilligkeit gleichsetzen.", "Nicht Einzelfälle zur Gruppenbewertung machen.", "Nicht in Ausländer gegen Deutsche gehen."])}</article></div></section>
      <section class="section section-soft dossier-tab-panel" id="sozialstaat-migration-verstehen"><div><div class="section-header"><p class="hero-kicker">Tab 2</p><h2>Sozialstaat &amp; Migration verstehen.</h2><p>Migration wirkt auf verschiedene Systeme gleichzeitig. Wer nur eine Zahl betrachtet, setzt fast immer eine falsche Bilanzgrenze.</p></div>${table(systemRows)}<div class="card-grid two"><article class="card"><p class="card-kicker">Was stimmt?</p><h3 class="card-title">Viele Sorgen haben reale Anker.</h3>${list(truePoints)}</article><article class="card"><p class="card-kicker">Was fehlt?</p><h3 class="card-title">Pauschale Behauptungen blenden Wirkung aus.</h3>${list(missingPoints)}<p class="formula-note"><strong>Kernsatz:</strong> Der Denkfehler ist nicht, Kosten zu benennen. Der Denkfehler ist, aus Kosten ein Feindbild zu machen.</p></article></div></div></section>
      <section class="section dossier-tab-panel" id="unterclaims"><div><div class="section-header"><p class="hero-kicker">Unterclaims</p><h2>Kampfbegriffe markieren, nicht amplifizieren.</h2><p>Diese Unterclaims sind als Akkordeons vorbereitet. Sie werden erst als eigene Seiten veröffentlicht, wenn Quellenlage, Rechtsstatus und Datenabgrenzung sauber geprüft sind.</p></div>${accordion()}</div></section>
      <section class="section section-soft dossier-tab-panel" id="wirkstoffanalyse"><div><div class="section-header"><p class="hero-kicker">Wirkstoffanalyse</p><h2>Sozialkosten als Sündenbockverstärker.</h2><p>Reale Sozialausgaben oder kommunale Belastungen werden als Beweis genutzt, dass eine ganze Gruppe dem Gemeinwesen schade.</p></div>${cardGrid([["Mechanismus", "Die Aussage verschiebt Aufmerksamkeit von Status, Arbeit, Integration, Demografie und Infrastruktur auf Gruppenschuld."], ["Verdeckte Ebenen", "Arbeitsmarktbeiträge, Steuern, Fachkräftebedarf, Pflege, Qualifikationsanerkennung, Kinderbetreuung, Sprachzugang, Rechtsstatus, Wohnen, Demografie, Unternehmertum, Diskriminierung und Gesundheit."], ["Kernsatz", "Migration ist weder automatisch Last noch automatisch Lösung. Sie ist ein Wirkungsraum, der gute Architektur braucht."]], "Wirkstoff")}</div></section>
      <section class="section dossier-tab-panel" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum der Frame wirkt.</h2><p>Das Narrativ aktiviert Verlustaversion und Nullsummendenken. Einzelne Missbrauchsfälle oder sichtbare Ausgaben bleiben emotional stärker hängen als langfristige Beiträge oder Integrationsverläufe.</p></div>${summaryGrid([["Primäre Effekte", "Ingroup-Outgroup-Bias, Zero-Sum-Bias, Verlustaversion, Statusbedrohung, Verfügbarkeitsheuristik", "warning"], ["Sekundär", "Fundamentaler Attributionsfehler, Negativity Bias, Bestätigungsfehler, moralische Emotion, Scapegoating", "warning"], ["Trigger", "Sozialneid, Kostenangst, Wut, Kränkung, Ungerechtigkeitsgefühl, Sorge um Wohnraum und Sicherheit", "critical"], ["Host-Kontrolle", "Kosten, Beiträge, Status und Zeithorizont trennen; Menschen nicht als Gruppe bewerten.", "positive"]], "Psychologie Migration")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="manipulationsmuster"><div><div class="section-header"><p class="hero-kicker">Manipulationsmuster</p><h2>Wie das Stöckchen funktioniert.</h2></div><div class="card-grid">${manipulationPatterns.map(([label, description, counter]) => `<article class="card"><p class="card-kicker">Muster</p><h3 class="card-title">${esc(label)}</h3><p class="card-text">${esc(description)}</p><p class="card-text"><strong>Gegenmove:</strong> ${esc(counter)}</p></article>`).join("")}</div></div></section>
      <section class="section dossier-tab-panel" id="wirkungspfad"><div><div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Vom Satz zur Systemwirkung.</h2></div><ol class="timeline radar-flow radar-effect-path">${effectPath.map(([label, text], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(label)}</strong><p>${esc(text)}</p></div></li>`).join("")}</ol></div></section>
      <section class="section section-soft dossier-tab-panel" id="woek-loesung"><div><div class="section-header"><p class="hero-kicker">WÖk-Lösung</p><h2>Integration als Wirkungsarchitektur.</h2><p>Aus Sozialstaatsbelastungen folgt nicht Gruppenabwertung, sondern bessere Infrastruktur: Sprache, Arbeit, Bildung, Wohnen, Gesundheit, Rechtsklarheit und Teilhabe.</p></div>${cardGrid(woekMeasures, "Maßnahme")}</div></section>
      <section class="section dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Tab 3</p><h2>Deep Dive &amp; Quellen.</h2><p>Datenstand: ${UPDATED_AT}. Faktenbox nicht als endgültige Gesamtbilanz lesen; Statusgruppen, Leistungssysteme und Zeithorizonte bleiben getrennt.</p></div>${list(facts)}${sourcesHtml()}</div></section>
    </main>`;
  return shell({ title: "Migration kostet nur? | Wirkungsradar Live", description: "Wirkungsradar-Dossier zu Migration, Sozialstaat, Arbeit, Integration und Zusammenhalt.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/live/migration-kostet-nur/", base: "../../../", main });
}

function clusterPage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Themen</nav><p class="hero-kicker">Themencluster</p><h1 class="hero-title">Migration, Sozialstaat &amp; Zusammenhalt</h1><p class="hero-subtitle">Fakten, Narrative und Wirkungspfade zu Einwanderung, Arbeit, sozialen Sicherungssystemen, Integration und demokratischem Zusammenhalt.</p><p class="radar-abstract"><strong>Abstract:</strong> Migration ist kein einzelnes Problem und keine einfache Lösung. Sie ist ein Wirkungsraum: Schutz, Arbeit, Bildung, Wohnen, Gesundheit, Kommunen, Sicherheit, Sozialstaat, Fachkräfte, Identität, Vertrauen und Demokratie. Der Wirkungsradar prüft deshalb Bilanzgrenzen, Narrative, psychologische Trigger, Folgen falschen Handelns und die wirkungsökonomische Antwort.</p><p class="radar-status-line"><span>Status: Cluster angelegt</span><span>Datenstand: ${UPDATED_AT}</span><span>Leuchtturm: Migration kostet nur?</span></p></div></section>
      ${summaryGrid([["Kurzclaim", "Migration nicht als Feindbild. Migration als Wirkungsraum.", "positive"], ["Regel", "Nicht beschwichtigen. Nicht spiegeln. Nicht entwerten. Sondern entwirren.", "positive"], ["Primäres Narrativ", "Sündenbocklogik, Sozialneid-Frame, Nie-eingezahlt-Narrativ", "warning"], ["Priorität", "Leuchtturm fertig; Unterclaims vorbereitet.", "neutral"]], "Migration Cluster")}
      ${nav("../../../")}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Leuchtturm</p><h2>Erstes Dossier.</h2></div><div class="card-grid"><a class="card text-link-card" href="../../live/migration-kostet-nur/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text">${esc(dossier.subtitle)}</p></a></div></div></section>
      <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Nächste Unterdossiers</p><h2>Prioritäten im Cluster.</h2></div>${cardGrid(subclaims.slice(0, 6).map(([title, slug, judgement]) => [title, `${judgement} Route geplant: /wirkungsradar/live/${slug}/`]), "Backlog")}</div></section>
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Narrative</p><h2>Neue Narrativfamilien.</h2></div><div class="radar-link-cluster">${narrativePages.map(([slug, title]) => `<a href="../../narrative/${slug}/">${esc(title)}</a>`).join("")}</div></div></section>
    </main>`;
  return shell({ title: "Migration, Sozialstaat & Zusammenhalt | Wirkungsradar", description: "Wirkungsradar-Themencluster zu Migration, Sozialstaat, Integration und Zusammenhalt.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/themen/migration-sozialstaat-zusammenhalt/", base: "../../../", main });
}

function detailPage() {
  return livePage()
    .replaceAll("/wirkungsradar/live/migration-kostet-nur/", "/wirkungsradar/detail/migration-kostet-nur/")
    .replace("<title>Migration kostet nur? | Wirkungsradar Live</title>", "<title>Migration kostet nur? | Wirkungsradar Detail</title>")
    .replace(" / Live</nav>", " / Detail</nav>");
}

function narrativePage([slug, title, subtitle, risk, abstract]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Narrative</nav><p class="hero-kicker">Narrativfamilie</p><h1 class="hero-title">${esc(title)}</h1><p class="hero-subtitle">${esc(subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(abstract)}</p><p class="radar-status-line"><span>Risiko: ${esc(risk)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Kontext: Migration &amp; Sozialstaat</span></p></div></section>
      ${nav("../../../")}
      <section class="section"><div><article class="card"><p class="card-kicker">Redaktionelle Regel</p><h2 class="card-title">Problem anerkennen. Sündenbocklogik trennen. Wirkung sichtbar machen.</h2><p class="card-text">Diese Narrativseite dient nicht der Amplifikation von Kampfbegriffen. Sie markiert den Mechanismus und führt zur prüfbaren Wirkungsfrage zurück.</p><p><a class="btn btn-primary" href="../../live/migration-kostet-nur/">Leuchtturm-Dossier öffnen</a></p></article></div></section>
    </main>`;
  return shell({ title: `${title} | Wirkungsradar Narrative`, description: subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/narrative/${slug}/`, base: "../../../", main });
}

function glossaryPage([slug, label, definition, hover]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero term-hero"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Begriffe</a></nav><p class="hero-kicker">Glossar · Migration &amp; Sozialstaat</p><h1>${esc(label)}</h1><p class="hero-subtitle">${esc(hover)}</p></div></section>
      <section class="section"><div><article class="article-shell glossary-detail"><h2>Definition</h2><p>${esc(definition)}</p><p><a class="btn btn-primary" href="../../wirkungsradar/live/migration-kostet-nur/">Migration-Dossier öffnen</a></p></article></div></section>
    </main>`;
  return shell({ title: `${label} | Glossar`, description: definition, canonical: `https://wirkungsoekonomie.de/begriffe/${slug}/`, base: "../../", main });
}

function injectBeforeMainEnd(file, marker, section) {
  if (!fs.existsSync(file)) return;
  const html = fs.readFileSync(file, "utf8");
  if (html.includes(marker)) return;
  fs.writeFileSync(file, html.replace(/\s*<\/main>/, `\n${section}\n    </main>`));
}

function currentLiveCardCount() {
  const dir = path.join("wirkungsradar", "live");
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(dir, entry.name, "index.html")))
    .length;
}

function updateLiveIndexCount() {
  const file = path.join("wirkungsradar", "live", "index.html");
  if (!fs.existsSync(file)) return;
  const count = currentLiveCardCount();
  if (!count) return;
  const html = fs.readFileSync(file, "utf8")
    .replace(
      /<p class="radar-summary-value">\d+ Karten aus Klima, Energie, Demokratie und Öffentlichkeit\.<\/p>/,
      `<p class="radar-summary-value">${count} Karten im Wirkungsradar.</p>`
    )
    .replace(
      /<h2>\d+ kurze Antworten im Wirkungsradar\.<\/h2>/,
      `<h2>${count} kurze Antworten im Wirkungsradar.</h2>`
    );
  fs.writeFileSync(file, html);
}

function augmentIndexes() {
  injectBeforeMainEnd("wirkungsradar/themen/index.html", "migration-sozialstaat-zusammenhalt", `<section class="section section-soft" id="migration-sozialstaat-zusammenhalt"><div><div class="section-header"><p class="hero-kicker">Migration &amp; Sozialstaat</p><h2>Neuer Themencluster.</h2></div><div class="card-grid"><a class="card text-link-card" href="migration-sozialstaat-zusammenhalt/"><p class="card-kicker">Migration nicht als Feindbild</p><h3 class="card-title">Migration, Sozialstaat &amp; Zusammenhalt</h3><p class="card-text">Fakten, Narrative und Wirkungspfade zu Einwanderung, Arbeit, sozialen Sicherungssystemen und demokratischem Zusammenhalt.</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/live/index.html", "migration-kostet-nur", `<section class="section section-soft" id="migration-sozialstaat-live"><div><div class="section-header"><p class="hero-kicker">Migration, Sozialstaat &amp; Zusammenhalt</p><h2>Neues Leuchtturm-Dossier.</h2></div><div class="card-grid"><a class="card text-link-card" href="migration-kostet-nur/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${esc(dossier.answers.ten)}</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/detail/index.html", "migration-kostet-nur", `<section class="section section-soft" id="migration-sozialstaat-detail"><div><div class="section-header"><p class="hero-kicker">Migration, Sozialstaat &amp; Zusammenhalt</p><h2>Neuer Deep Dive.</h2></div><div class="card-grid"><a class="card text-link-card" href="migration-kostet-nur/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text">${esc(dossier.subtitle)}</p></a></div></div></section>`);
  updateLiveIndexCount();
}

writeFile("content/wirkungsradar/source-packs/migration-social-state-v1.yaml", `# Generated by scripts/wirkungsradar/build-migration-social-state-cluster.mjs\n${toYaml(sourcePack).trim()}\n`);
writeFile("wirkungsradar/themen/migration-sozialstaat-zusammenhalt/index.html", clusterPage());
writeFile("wirkungsradar/live/migration-kostet-nur/index.html", livePage());
writeFile("wirkungsradar/detail/migration-kostet-nur/index.html", detailPage());
for (const page of narrativePages) writeFile(`wirkungsradar/narrative/${page[0]}/index.html`, narrativePage(page));
for (const term of [
  ["sozialstaats-suendenbock", "Sozialstaats-Sündenbock", "Narrativ, das reale Sozialausgaben oder Missbrauchsfälle nutzt, um eine ganze Gruppe als Belastung oder Gefahr für den Sozialstaat darzustellen.", "Der wahre Kern sind reale Kosten. Der Denkfehler ist Gruppenschuld."],
  ["nie-eingezahlt-narrativ", "Nie-eingezahlt-Narrativ", "Frame, der Sozialleistungen nur an vorherige individuelle Einzahlung bindet und den Sozialstaat als gemeinsame Risikoinfrastruktur verkürzt.", "Einzahlung ist wichtig. Aber der Sozialstaat ist mehr als ein Sparkonto."],
  ["integration-als-infrastruktur", "Integration als Infrastruktur", "Wirkungsökonomische Sicht auf Integration als Zusammenspiel von Sprache, Bildung, Arbeit, Wohnen, Gesundheit, Rechten, Schutz, Anerkennung und Zugehörigkeit.", "Integration gelingt nicht durch Appelle, sondern durch funktionierende Wirkungsräume."],
  ["sozialtourismus-frame", "Sozialtourismus-Frame", "Politischer Kampfbegriff, der Migration pauschal als Einwanderung in Sozialleistungen deutet.", "Nur als analysierter Frame verwenden, nicht als neutrale Beschreibung."],
  ["entmenschlichender-kampfbegriff", "Entmenschlichender Kampfbegriff", "Begriff, der Menschen nicht als Personen mit Rechten und Würde beschreibt, sondern als Schädlinge, Masse, Last oder Bedrohung.", "Solche Begriffe ersetzen Analyse durch Abwertung."],
  ["kommunale-integrationskapazitaet", "Kommunale Integrationskapazität", "Fähigkeit einer Kommune, Unterbringung, Sprache, Bildung, Gesundheit, Wohnen, Arbeit, Verwaltung und Begegnung wirksam zu organisieren.", "Kommunale Überlastung ist ein Infrastrukturproblem, kein Beweis für Gruppenschuld."],
  ["qualifikationsverlust", "Qualifikationsverlust", "Wirkungsverlust, wenn Menschen unterhalb ihrer Fähigkeiten arbeiten, weil Abschlüsse nicht anerkannt, Sprache nicht gefördert oder Verfahren blockiert sind.", "Ein Ingenieur als Hilfskraft ist keine erfolgreiche Integration, sondern ungenutzte Wirkleistung."],
]) writeFile(`begriffe/${term[0]}/index.html`, glossaryPage(term));
augmentIndexes();

console.log("Built migration-social-state cluster: 1 live dossier, 1 detail page, 6 narratives, 7 glossary pages.");
