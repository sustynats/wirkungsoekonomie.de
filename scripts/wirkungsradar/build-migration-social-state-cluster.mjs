import fs from "node:fs";
import path from "node:path";

const UPDATED_AT = "2026-06-04";

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
  judgement: "Echter Startaufwand. Falsches Lastbild.",
  abstract:
    "Die Aussage „Migration kostet nur“ enthält einen wahren Kern: Migration erzeugt reale kurzfristige Kosten und Belastungen für Kommunen, Verwaltung, Unterbringung, Bildung, Gesundheit, Sprachkurse, Integration und Sozialleistungen. Irreführend wird sie, wenn Migration pauschal als reine Last oder Menschen als „Sozialschmarotzer“ gerahmt werden. Dann verschwinden Arbeitsmarktbeiträge, Sozialversicherungsbeiträge, Fachkräftebedarf, demografische Stabilisierung, Care-Arbeit, Unternehmertum, langfristige Teilhabe, Qualifikationsanerkennung und Integrationsinfrastruktur.",
  heroNote:
    "Kein Pauschalurteil. Wirkung hängt von Status, Zeit, Zugang, Arbeit, Bildung, Qualifikation, Aufenthaltsrecht, Kommune und Integrationsinfrastruktur ab.",
  keyPoints: [
    ["Integration braucht Startorganisation", "Sprache, Schule, Wohnen, Anmeldung, Arbeit und Anerkennung müssen schnell zusammenkommen."],
    ["Migration erzeugt auch Beiträge", "Viele Zugewanderte arbeiten, zahlen Steuern und Sozialabgaben, gründen Unternehmen, übernehmen Care-Arbeit und stabilisieren Fachkräftebereiche."],
    ["Status entscheidet stark", "EU-Freizügigkeit, Arbeitsmigration, Flucht, Familiennachzug, Studium, Ausbildung und Schutzstatus haben sehr unterschiedliche Wirkungsprofile."],
    ["„Nie eingezahlt“ ist eine verkürzte Bilanz", "Sozialstaat ist nicht nur Sparkonto. Er ist Schutz-, Integrations-, Arbeitsmarkt-, Familien-, Gesundheits- und Stabilitätsinfrastruktur."],
    ["Sündenbocklogik verhindert Lösungen", "Wohnungsnot, Schulprobleme, kommunale Überlastung und Sozialausgaben haben mehrere Ursachen. Wer alles einer Gruppe zuschreibt, blockiert wirksame Politik."],
    ["WÖk-Lösung: Integration als Infrastruktur", "Sprache, Arbeit, Qualifikationsanerkennung, Wohnen, Bildung, Gesundheit, Kinderbetreuung, Rechtsklarheit und Antidiskriminierung müssen zusammenwirken."],
  ],
  answers: {
    ten: "Ankommen braucht Organisation. Gute Integration macht daraus Sprache, Schule, Arbeit, Wohnen, Anerkennung und Teilhabe.",
    thirty:
      "Am Anfang braucht Ankommen gute Organisation. Entscheidend ist, ob daraus Teilhabe wird: Sprache, Schule, Arbeit, Wohnen, Anerkennung und klare Regeln. Wenn Abschlüsse schneller geprüft werden, Betriebe Sprachlernen ermöglichen und Kommunen gute Verfahren haben, entstehen Arbeit, Pflege, Steuern und Nachbarschaft.",
    two:
      "Ich würde den Startaufwand nicht leugnen. Kommunen brauchen Geld, Personal und gute Verfahren. Unterbringung, Schule, Sprache und Verwaltung müssen funktionieren. Aber Menschen sind keine Kostenstelle. Entscheidend ist, ob Integration gelingt. Ein Abschluss muss schneller geprüft werden. Deutsch muss dort gelernt werden können, wo Menschen arbeiten. Kinder brauchen Kita und Schule. Wohnungen, Anmeldung und klare Regeln müssen zusammenpassen. Dann wird aus Ankommen Teilhabe: Pflege, Handwerk, Gründung, Busverkehr, Gastronomie, Wissenschaft, Nachbarschaft, Steuern und Sozialbeiträge. Schlechte Steuerung erzeugt Folgekosten. Gute Integration macht das Problem kleiner. Die faire Frage lautet deshalb nicht: Was kostet eine Gruppe? Sondern: Welche Integration macht aus Ankommen Sprache, Arbeit, Sicherheit und Zusammenhalt?",
  },
  redirectQuestion:
    "Welche Integration macht aus Ankommen Teilhabe?",
};

const workSourcePack = {
  id: "work-citizens-income-incentives-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  sources: {
    bundesregierung_buergergeld_2026: {
      label: "Bundesregierung - Regelsätze der Sozialleistungen bleiben 2026 unverändert",
      url: "https://www.bundesregierung.de/breg-de/aktuelles/nullrunde-buergergeld-2383676",
      use_for: ["Bürgergeld-Regelsatz 2026", "563 Euro für Alleinstehende", "Nullrunde 2026"],
      warning: "Regelsatz ist nicht Gesamthaushaltslage; Unterkunft und Lebenslage gesondert betrachten.",
    },
    bmas_regelbedarfe_2026: {
      label: "BMAS - Fortschreibung der Regelbedarfe für 2026",
      url: "https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/verordnung-zur-fortschreibung-der-regelbedarfe-fuer-das-jahr-2026.html",
      use_for: ["gesetzliche Fortschreibung", "Regelbedarfe SGB II/SGB XII"],
      warning: "Regelbedarfe erklären nicht automatisch Arbeitsanreize.",
    },
    bundesregierung_mindestlohn_2026: {
      label: "Bundesregierung - Fragen und Antworten zum Mindestlohn",
      url: "https://www.bundesregierung.de/breg-de/aktuelles/mindestlohn-faq-1688186",
      use_for: ["Mindestlohn 13,90 Euro ab 1. Januar 2026", "14,60 Euro ab 1. Januar 2027"],
      warning: "Mindestlohn ist Bruttostundenlohn; Haushaltsnetto hängt von Lebenslage ab.",
    },
    bmas_mindestlohn_2026: {
      label: "BMAS - Anhebung des gesetzlichen Mindestlohns",
      url: "https://www.bmas.de/DE/Service/Presse/Pressemitteilungen/2025/anhebung-gesetzlicher-mindestlohn-zum-1-1-2026.html",
      use_for: ["Beschluss Mindestlohnkommission", "13,90 Euro / 14,60 Euro"],
      warning: "Pressemitteilung mit politischem Kontext; Verordnung/Rechtsstand prüfen.",
    },
    ba_grundsicherung_in_zahlen_2025: {
      label: "Bundesagentur für Arbeit - Grundsicherung für Arbeitsuchende in Zahlen",
      url: "https://statistik.arbeitsagentur.de/Statistikdaten/Detail/202507/iiia7/grusi-in-zahlen/grusi-in-zahlen-d-0-202507-pdf.pdf",
      use_for: ["54 % erwerbsfähige Leistungsberechtigte nicht arbeitslos", "Aufstocker, Ausbildung, Kinderbetreuung, Angehörigenpflege", "Haushaltsbetroffenheit"],
      warning: "Monats-/Datenstand beachten und regelmäßig aktualisieren.",
    },
    ba_grundsicherung_2026: {
      label: "Bundesagentur für Arbeit - Grundsicherung 2026",
      url: "https://statistik.arbeitsagentur.de/Statistikdaten/Detail/202601/iiia7/grusi-in-zahlen/grusi-in-zahlen-d-0-202601-pdf.pdf",
      use_for: ["aktualisierte Grundsicherungsdaten", "erwerbstätige Leistungsberechtigte", "Beschäftigungsformen"],
      warning: "Vorläufigkeit und Datenstand sichtbar machen.",
    },
    iab_buergergeld_arbeit_unattraktiv: {
      label: "IAB - Macht Bürgergeld Arbeit unattraktiv?",
      url: "https://iab-forum.de/macht-buergergeld-arbeit-unattraktiv/",
      use_for: ["wissenschaftliche Einordnung", "Komplexität der Arbeitsanreizdebatte", "Bürgergeld-Serie"],
      warning: "Artikel verdichtet Studienlage; Primärstudien bei Bedarf ergänzen.",
    },
    iab_totalverweigerer: {
      label: "IAB - 100-Prozent-Sanktionen werden sehr selten verhängt",
      url: "https://iab-forum.de/100-prozent-sanktionen-gegen-erwerbsfaehige-leistungsberechtigte-die-nachhaltig-arbeit-verweigern-werden-nur-sehr-selten-verhaengt/",
      use_for: ["Totalverweigerer-Frame", "Seltenheit 100-Prozent-Sanktionen", "empirische Einordnung"],
      warning: "Sanktionen nicht mit allen Pflichtverletzungen verwechseln.",
    },
    iab_totalverweigerer_forschungsbericht: {
      label: "IAB - Totalverweigerer: Viel Lärm um Nichts?",
      url: "https://iab.de/totalverweigerer-viel-laerm-um-nichts/",
      use_for: ["Herkunft und Wirkung des Begriffs Totalverweigerer", "Diskursanalyse"],
      warning: "Frameanalyse ergänzend zu quantitativen Daten nutzen.",
    },
    wsi_lohnt_sich_arbeit_2025: {
      label: "WSI / Hans-Böckler-Stiftung - Lohnt sich Arbeit in Deutschland noch?",
      url: "https://www.boeckler.de/fpdf/HBS-009197/p_wsi_pb_90_2025.pdf",
      use_for: ["Lohnabstand", "Mindestlohn vs Bürgergeld", "regionale Unterschiede"],
      warning: "Annahmen prüfen; Gegenpositionen und methodische Kritik fair darstellen.",
    },
    wsi_presse_lohnabstand: {
      label: "WSI - Einkommen bei Mindestlohnbeschäftigung höher als Bürgergeld",
      url: "https://www.wsi.de/de/pressemitteilungen-15991-einkommen-bei-mindestlohnbeschaeftigung-deutlich-hoeher-als-buergergeld-70666.htm",
      use_for: ["öffentliche Kurzfassung der Studie", "Lohnabstandsdebatte"],
      warning: "Pressefassung nicht allein verwenden.",
    },
    iw_aufstocker_2025: {
      label: "IW Köln - Bürgergeld-Aufstocker",
      url: "https://www.iwkoeln.de/fileadmin/user_upload/Studien/Kurzberichte/PDF/2025/IW-Kurzbericht_2025-B%C3%BCrgergeld-Aufstocker.pdf",
      use_for: ["Gegenperspektive Aufstocker", "Niedriglohn und ergänzende Leistungen", "kritische Einordnung"],
      warning: "Arbeitgebernahes Institut; als Gegenperspektive, nicht alleinige Wahrheit.",
    },
    sozialpolitik_aktuell_buergergeld: {
      label: "Sozialpolitik aktuell - Kontrovers Bürgergeld / SGB II",
      url: "https://www.sozialpolitik-aktuell.de/kontrovers-sgbii-buergergeld.html",
      use_for: ["Debattenüberblick", "Grundsicherung und Arbeitseinkommen"],
      warning: "Sekundärportal; Primärquellen ergänzen.",
    },
  },
};

const workDossier = {
  slug: "arbeit-lohnt-sich-nicht-mehr",
  title: "Arbeit lohnt sich nicht mehr?",
  subtitle: "Warum die eigentliche Frage nicht Bürgergeld, sondern gute Arbeit, Wohnen und Anreize ist.",
  judgement: "Wahrer Lohnabstands- und Frustkern, falsches Faulheitsnarrativ.",
  abstract:
    "Die Aussage „Arbeit lohnt sich nicht mehr“ enthält einen wahren Kern: Viele Menschen erleben, dass niedrige Löhne, hohe Mieten, steigende Preise, Kinderbetreuungskosten, Pendeln, unsichere Arbeitszeiten, geringe Aufstiegschancen und Bürokratie Arbeit zu wenig spürbar belohnen. Irreführend wird die Aussage, wenn daraus ein Pauschalurteil über Bürgergeldbeziehende wird. Bürgergeld ist keine Komfortprämie, sondern eine existenzsichernde Grundsicherung. Viele Leistungsberechtigte sind nicht arbeitslos, sondern arbeiten aufstockend, sind in Ausbildung, kümmern sich um Kinder oder Angehörige oder haben gesundheitliche Einschränkungen. Wirkungsökonomisch lautet die bessere Frage nicht: Sind Bürgergeldbeziehende zu faul? Sondern: Welche Arbeit, welche Löhne, welche Wohnkosten, welche Betreuung, welche Qualifikation und welche Transferregeln erzeugen echte Teilhabe und positive Netto-Wirkung?",
  heroNote:
    "Lohnabstand, Lebenslage und Würde getrennt betrachten: berechtigter Frust, reale Fehlanreize und abwertende Faulheitsnarrative sind nicht dasselbe.",
  keyPoints: [
    ["Der Frust ist real", "Viele Menschen erleben, dass Arbeit bei niedrigen Löhnen, hohen Mieten, Kinderbetreuungskosten und Pendelaufwand zu wenig spürbar bleibt."],
    ["Bürgergeld ist keine Wohlstandsleistung", "Der Regelsatz für Alleinstehende liegt 2026 weiterhin bei 563 Euro im Monat. Unterkunft wird nur in angemessenem Umfang berücksichtigt."],
    ["Viele Leistungsberechtigte sind nicht arbeitslos", "Ein großer Teil arbeitet aufstockend, ist in Ausbildung, betreut Kinder oder Angehörige oder steht aus anderen Gründen nicht sofort dem Arbeitsmarkt zur Verfügung."],
    ["Arbeit lohnt sich oft finanziell, aber nicht immer ausreichend spürbar", "Lohnabstände können regional, familiär und durch Transferentzug, Miete, Betreuung und Bürokratie stark unterschiedlich wirken."],
    ["Faulheitsframes verhindern Lösungen", "Wer das Problem auf Charakter reduziert, übersieht Niedriglöhne, Wohnkosten, Betreuung, Gesundheit, Qualifikation, Arbeitsbedingungen und Vermittlungsqualität."],
    ["WÖk-Lösung: Arbeit wirksam machen", "Living Wages, bezahlbares Wohnen, Kinderbetreuung, Qualifizierung, Mobilität, einfache Transfers und wirksame Vermittlung erhöhen Erwerbsanreize ohne Entwürdigung."],
  ],
  answers: {
    one: "Arbeit muss sich stärker lohnen. Aber die Lösung ist bessere Arbeit, Wohnen und Anreize - nicht Menschen im Bürgergeld arm oder würdelos zu machen.",
    ten: "Der Frust ist real: Niedrige Löhne, Mieten, Betreuung und Pendeln können Arbeit zu wenig spürbar machen. Der Denkfehler ist, daraus zu schließen, Bürgergeld sei Luxus oder Menschen seien faul.",
    thirty:
      "Der wahre Kern ist: Arbeit muss sich klar lohnen. Aber das Problem liegt oft nicht beim Bürgergeld, sondern bei Niedriglohn, Miete, Kinderbetreuung, Pendelkosten und Transferentzug. Beispiel: Wenn jemand 40 Stunden arbeitet, aber hohe Miete, Kita, Bus und Bürokratie den Vorteil auffressen, entsteht Frust. Dann ist die Lösung nicht, die Grundsicherung zu drücken, sondern Löhne, Wohnen, Betreuung und Anreize so zu bauen, dass Arbeit wirklich Lebensqualität schafft.",
    two:
      "Die Aussage „Arbeit lohnt sich nicht mehr“ trifft einen echten Nerv. Viele Menschen arbeiten hart und haben trotzdem das Gefühl, kaum voranzukommen. Das liegt an niedrigen Löhnen, hohen Mieten, steigenden Preisen, Pendelkosten, Kinderbetreuung, Minijobfallen, Teilzeitfallen, unsicheren Arbeitszeiten und komplizierten Sozialleistungen. Dieser Frust darf nicht weggewischt werden. Der Denkfehler beginnt dort, wo dieser Frust gegen Bürgergeldbeziehende gelenkt wird. Bürgergeld ist kein Luxusleben. Es ist eine Grundsicherung. Viele Menschen im Bürgergeld sind außerdem gar nicht einfach arbeitslos: Sie arbeiten aufstockend, sind in Ausbildung, betreuen Kinder, pflegen Angehörige oder haben gesundheitliche Probleme. Wer daraus pauschal „die wollen nicht arbeiten“ macht, verwandelt ein Strukturproblem in ein Charakterurteil. Ein Beispiel: Eine alleinerziehende Mutter nimmt mehr Arbeitsstunden an. Auf dem Papier steigt ihr Einkommen. Gleichzeitig steigen Betreuungskosten, Fahrtkosten, Stress und vielleicht fällt ein Teil von Leistungen weg. Am Ende hat sie mehr Arbeit, aber kaum mehr Ruhe, Sicherheit oder echte Lebensqualität. Dann ist nicht sie das Problem. Das System ist schlecht abgestimmt. Wirkungsökonomisch lautet die Frage deshalb nicht: Wie machen wir Bürgergeld unattraktiver? Sondern: Wie machen wir Arbeit wirksamer? Dazu gehören gute Löhne, bezahlbares Wohnen, Kinderbetreuung, Qualifizierung, einfache Übergänge, bessere Jobcenter, weniger Bürokratie und klare Anreize, bei denen mehr Arbeit wirklich spürbar mehr Teilhabe bringt. Wer Arbeit stärken will, muss Arbeit aufwerten - nicht Armut verschärfen.",
  },
  redirectQuestion:
    "Meinst du, dass Bürgergeld zu hoch ist - oder dass Löhne, Mieten, Kinderbetreuung, Pendeln und Transferentzug Arbeit zu wenig spürbar machen?",
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
    <link rel="stylesheet" href="${base}assets/css/style.css?v=20260604-menu-fix">
  </head>
  <body>
    <a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
    <header class="site-header" data-search-exclude><a class="brand" href="${base}index.html"><span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span><span class="brand-name">Wirkungsökonomie</span></a><button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button><nav id="site-nav" class="site-nav" aria-label="Hauptnavigation"><a href="${base}kompass.html">Kompass</a><a href="${base}wirkungsradar/">Wirkungsradar</a><a href="${base}begriffe/">Begriffe</a></nav></header>
${main}
    <footer class="footer" data-search-exclude><div class="footer-grid"><div><p class="hero-kicker">Wirkungsökonomie</p><h2>Die neue Ordnung des Wohlstands</h2><p>Wirkungsradar: Faktenkern, Narrativ, Psychologie, Wirkungspfad und bessere Handlungsfrage.</p></div><a class="btn btn-primary" href="${base}wirkungsradar/">Wirkungsradar öffnen</a></div></footer>
    <script src="${base}assets/js/main.js?v=20260605-wirkungsraum-stage2"></script>
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
  return `<div class="dossier-matrix-wrap"><table class="dossier-matrix"><thead><tr><th>Ebene</th><th>Leitfrage</th><th>Was verkürzte Narrative ausblenden</th></tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function sourcesHtml() {
  return `<div class="card-grid">${Object.values(sourcePack.sources).map((source) => `<article class="card"><p class="card-kicker">Quelle vorbereiten</p><h3 class="card-title">${esc(source.label)}</h3><p class="card-text">${esc(source.use_for.join(" / "))}</p><p class="card-text"><strong>Hinweis:</strong> ${esc(source.warning)}</p><p><a class="text-link" href="${esc(source.url)}">Quelle öffnen</a></p></article>`).join("")}</div>`;
}

function sourceCards(pack) {
  return `<div class="card-grid">${Object.values(pack.sources).map((source) => `<article class="card"><p class="card-kicker">Quelle vorbereiten</p><h3 class="card-title">${esc(source.label)}</h3><p class="card-text">${esc(source.use_for.join(" / "))}</p><p class="card-text"><strong>Hinweis:</strong> ${esc(source.warning)}</p><p><a class="text-link" href="${esc(source.url)}">Quelle öffnen</a></p></article>`).join("")}</div>`;
}

function accordion() {
  return `<div class="radar-answer-accordion migration-subclaim-accordion">${subclaims.map(([title, slug, judgement, text, question], index) => `<details class="radar-answer-item" id="${esc(slug)}"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(title)}</span> <span class="radar-answer-label">${esc(judgement)}</span></summary><p>${esc(text)}</p><p><strong>Bessere Wirkungsfrage:</strong> ${esc(question)}</p></details>`).join("")}</div>`;
}

function livePage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Live</nav><p class="hero-kicker">Migration, Sozialstaat &amp; Zusammenhalt · positives Erklärbild</p><h1 class="hero-title">${esc(dossier.title)}</h1><p class="hero-subtitle">${esc(dossier.subtitle)}</p><p class="radar-abstract"><strong>Ein gutes Bild:</strong> Eine Frau kommt nach Deutschland. Ihr Abschluss wird schnell geprüft. Sie lernt Deutsch im Betrieb. Die Kommune hilft bei Wohnung, Kita und Anmeldung. Ein Jahr später arbeitet sie in der Pflege. Ein Team ist entlastet. Menschen werden versorgt. Sie zahlt Steuern und ist Teil der Nachbarschaft.</p><p class="radar-abstract"><strong>Host-Line:</strong> Ein Sprachkurs ist kein verlorenes Geld. Er kann der Anfang von Pflege, Arbeit, Steuern und Nachbarschaft sein.</p><p class="radar-status-line"><span>Kurzurteil: ${esc(dossier.judgement)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Keine Pauschalisierung</span></p></div></section>
      ${summaryGrid([["Kurzurteil", dossier.judgement, "warning"], ["Kurzclaim", "Ankommen braucht Organisation. Gute Integration macht daraus Teilhabe.", "positive"], ["Hinweis", dossier.heroNote, "neutral"], ["Redaktionelle Regel", "Nicht das Lastbild wiederholen. Den gelingenden Pfad zeigen.", "positive"]], "Migration Summary")}
      ${nav("../../../")}
      <section class="section" id="sechs-punkte"><div><div class="section-header"><p class="hero-kicker">Das Wichtigste</p><h2>Sechs Punkte für eine faire Einordnung.</h2></div>${cardGrid(dossier.keyPoints, "Kernpunkt")}</div></section>
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude><a href="#live-antworten">Live antworten</a><a href="#sozialstaat-migration-verstehen">Sozialstaat &amp; Migration verstehen</a><a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a></nav>
      <section class="section dossier-tab-panel" id="live-antworten"><div><div class="section-header"><p class="hero-kicker">Tab 1</p><h2>Live antworten.</h2></div><div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge"><details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">${words(dossier.answers.ten)} Wörter</span></summary><p>„${esc(dossier.answers.ten)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">${words(dossier.answers.thirty)} Wörter</span></summary><p>„${esc(dossier.answers.thirty)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">${words(dossier.answers.two)} Wörter</span></summary><p>„${esc(dossier.answers.two)}“</p></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Die bessere Frage</p><h3 class="card-title">${esc(dossier.redirectQuestion)}</h3></article><article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Frame, dass Menschen pauschal eine Last seien. Der reale Punkt ist gute Integration. Der falsche Sprung ist, Menschen zur Kostenstelle zu machen.</p></article></div><article class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p>${list(["Nicht sagen: Migration kostet nichts.", "Nicht kommunale Aufgaben kleinreden.", "Nicht Menschen als Kostenstelle bezeichnen.", "Nicht abwertende Begriffe wiederholen oder in Überschriften setzen.", "Nicht alle Migrant:innen, Geflüchteten, EU-Bürger:innen und Arbeitsmigrant:innen zusammenwerfen.", "Nicht Sozialleistungsbezug mit Unwilligkeit gleichsetzen.", "Nicht Einzelfälle zur Gruppenbewertung machen.", "Nicht in Ausländer gegen Deutsche gehen."])}</article></div></section>
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

function workNarrativePage([slug, title, subtitle, risk, abstract]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Narrative</nav><p class="hero-kicker">Narrativfamilie</p><h1 class="hero-title">${esc(title)}</h1><p class="hero-subtitle">${esc(subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(abstract)}</p><p class="radar-status-line"><span>Risiko: ${esc(risk)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Kontext: Arbeit, Leistung &amp; soziale Sicherung</span></p></div></section>
      ${nav("../../../")}
      <section class="section"><div><article class="card"><p class="card-kicker">Redaktionelle Regel</p><h2 class="card-title">Frust anerkennen. Faulheitsframe stoppen. Arbeitsarchitektur öffnen.</h2><p class="card-text">Diese Narrativseite dient nicht der Abwertung von Leistungsberechtigten. Sie markiert psychologische Mechanik und führt zu Lohn, Wohnen, Betreuung, Qualifikation, Transferregeln und guter Arbeit zurück.</p><p><a class="btn btn-primary" href="../../live/${workDossier.slug}/">Arbeits-/Bürgergeld-Dossier öffnen</a></p></article></div></section>
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

function writeGlossaryTerm(term) {
  const [slug] = term;
  const file = `begriffe/${slug}/index.html`;
  if (slug === "living-wage" && fs.existsSync(file)) return;
  writeFile(file, glossaryPage(term));
}

const workSubclaims = [
  ["Bürgergeld macht faul", "buergergeld-macht-faul", "Abwertungsframe, kein Lösungsbegriff.", "Die Aussage macht aus einer komplexen sozialen und arbeitsmarktpolitischen Lage ein Charakterurteil. Natürlich gibt es Pflichtverletzungen, Missbrauch und Einzelfälle von Arbeitsverweigerung. Aber daraus folgt nicht, dass Bürgergeld insgesamt Faulheit erzeugt. Viele Leistungsberechtigte arbeiten, sind Kinder, Alleinerziehende, in Ausbildung, krank, pflegen Angehörige oder stehen wegen Betreuung, Sprache, Qualifikation, Gesundheit oder regionalem Arbeitsmarkt nicht sofort für jede Stelle zur Verfügung. Wer pauschal „faul“ sagt, verhindert die eigentliche Analyse: Welche Hürden verhindern Arbeit - und welche Maßnahmen erhöhen Teilhabe?", "Welche Barriere verhindert Erwerbsarbeit - und welche Maßnahme beseitigt sie wirksam?"],
  ["Wer arbeitet, ist der Dumme", "wer-arbeitet-ist-der-dumme", "Wahrer Anerkennungskern, falsches Gegeneinander.", "Der Satz drückt reale Kränkung aus: Menschen arbeiten viel und erleben trotzdem wenig Aufstieg, wenig Sicherheit und wenig Anerkennung. Das ist ernst. Falsch wird es, wenn Bürgergeldbeziehende als Gegner dargestellt werden. Das Problem ist nicht, dass das Existenzminimum existiert. Das Problem ist, wenn Arbeit zu wenig Einkommen, Planbarkeit, Gesundheit, Sinn und Teilhabe erzeugt. Wer Erwerbstätige und Bedürftige gegeneinanderstellt, lenkt von Niedriglohn, Wohnkosten, Tarifbindung, Kinderbetreuung und Steuer-/Transfersystem ab.", "Wie wird aus Arbeit wieder spürbarer Aufstieg, statt aus Armut ein politisches Feindbild zu machen?"],
  ["Totalverweigerer", "totalverweigerer", "Politisch lauter Frame, empirisch kleiner Kern.", "Der Begriff „Totalverweigerer“ wirkt stark, weil er Empörung bündelt: Da sei jemand, der nichts beiträgt und trotzdem Geld erhält. Es gibt Fälle von Pflichtverletzung und Arbeitsverweigerung, und diese müssen rechtsstaatlich bearbeitet werden. Aber der Begriff wird häufig genutzt, um ein Randphänomen zum Hauptproblem des Sozialstaats zu machen. Dadurch verschwinden größere Hebel: bessere Vermittlung, Qualifizierung, Kinderbetreuung, Gesundheit, Wohnkosten, Tarifbindung und einfache Transferregeln.", "Welche Reform bringt viele Menschen tatsächlich in gute Arbeit - und welche bedient nur Empörung?"],
  ["Bürgergeld ist zu hoch", "buergergeld-ist-zu-hoch", "Regelsatz ohne Lebenslage ist keine Wirkungsmessung.", "Der Regelsatz muss transparent diskutiert werden. Aber Lebenslage, Wohnkosten, Kinder, Gesundheit, Schulden, regionale Preise und Erwerbsfähigkeit gehören in dieselbe Bilanz.", "Vergleichen wir einen Regelsatz oder eine reale Haushaltslage?"],
  ["Aufstocker: Wenn Arbeit nicht reicht", "aufstocker", "Aufstocker sind kein Missbrauchsbeweis, sondern ein Wirkungsproblem des Arbeits- und Wohnsystems.", "Aufstocker sind Menschen, die arbeiten und trotzdem ergänzende Leistungen benötigen. Das kann an Teilzeit, niedrigen Stundenlöhnen, hohen Mieten, Kindern, Alleinerziehung, Krankheit, unsicheren Arbeitszeiten oder fehlender Betreuung liegen. Wer Aufstocker als Beweis für Sozialmissbrauch deutet, verdreht die Ursache. Aufstockung zeigt oft: Arbeit ist vorhanden, aber sie reicht nicht für den Bedarf des Haushalts. Wirkungsökonomisch ist das ein Signal: Löhne, Wohnkosten, Betreuung und Arbeitszeit müssen besser zusammenwirken.", "Was muss sich ändern, damit Erwerbsarbeit ohne ergänzende Grundsicherung zum Leben reicht?"],
  ["Sanktionen lösen das Problem", "sanktionen-loesen-das-problem", "Sanktionen können Pflichtverletzungen adressieren, ersetzen aber keine Arbeitsarchitektur.", "Sanktionen können im Einzelfall rechtsstaatlich nötig sein. Als Hauptlösung verdecken sie Qualifikation, Jobqualität, Betreuung, Gesundheit, Mobilität und gute Vermittlung.", "Welche Kombination aus Pflicht, Unterstützung und guter Arbeit senkt Leistungsbezug nachhaltig?"],
  ["Mehr Arbeit muss sich mehr lohnen", "mehrarbeit-muss-sich-lohnen", "Richtiger Grundsatz, der systemisch gebaut werden muss.", "Mehr Arbeit soll spürbar mehr Teilhabe bringen. Dafür müssen Löhne, Transferentzugsraten, Wohnen, Kinderbetreuung, Mobilität und Bürokratie zusammen betrachtet werden.", "Welche Regel sorgt dafür, dass zusätzliche Arbeit im echten Haushalt ankommt?"],
  ["Mindestlohn zerstört Jobs", "mindestlohn-zerstoert-jobs", "Wahrer Kostenkern, aber zu einfache Arbeitsmarktlogik.", "Ein Mindestlohn verändert Kosten. Gleichzeitig stabilisiert er Einkommen, Nachfrage und Fairness. Wirkung hängt von Branche, Produktivität, Preisen, Nachfrage und Ausgestaltung ab.", "Welche Höhe stärkt Teilhabe, ohne Beschäftigung und kleine Betriebe unnötig zu belasten?"],
];

const workRows = [
  ["Regelsatz", "Wie hoch ist Bürgergeld?", "Grundsicherung, Existenzminimum", "Miete, Arbeit, Betreuung, Lebenslage"],
  ["Nettoarbeitseinkommen", "Was bleibt nach Steuern und Abgaben?", "finanzieller Arbeitsanreiz", "Pendeln, Zeit, Gesundheit, Care"],
  ["Haushaltslage", "Wie lebt ein Haushalt konkret?", "Kinder, Alleinerziehende, Miete, Wohngeld", "pauschale Single-Vergleiche"],
  ["Transferentzug", "Wie viel bleibt von Mehrarbeit?", "Grenzbelastung und Anreizstruktur", "Würde, Sinn, Aufstieg"],
  ["Wohnkosten", "Wie stark frisst Miete Einkommen?", "regionale Unterschiede", "Arbeitsmotivation und Qualifikation"],
  ["Care-Arbeit", "Wer betreut Kinder oder Angehörige?", "reale Arbeitshemmnisse", "simple Arbeitswilligkeit"],
  ["Arbeitsqualität", "Welche Arbeit wird angeboten?", "Lohn, Arbeitszeit, Gesundheit, Planbarkeit", "reine Beschäftigungsquote"],
  ["Vermittlung", "Wie gut funktioniert Jobcenter/Qualifizierung?", "Systemleistung", "Charakterurteile"],
  ["Demokratie", "Welche Wirkung hat Sprache?", "Vertrauen, Spaltung, Sündenbocklogik", "fiskalische Engführung"],
];

const workFacts = [
  "Der Bürgergeld-Regelsatz für Alleinstehende bleibt 2026 nach Bundesregierung/BMAS bei 563 Euro im Monat; das ist keine Wohlstandsleistung.",
  "Der gesetzliche Mindestlohn steigt nach Bundesregierung/BMAS ab 1. Januar 2026 auf 13,90 Euro und ab 1. Januar 2027 auf 14,60 Euro.",
  "Die BA-Grundsicherungsdaten zeigen, dass Leistungsbezug nicht einfach mit Arbeitslosigkeit gleichzusetzen ist: Aufstockung, Ausbildung, Kinderbetreuung, Pflege und gesundheitliche Einschränkungen gehören zur Wirkungsbilanz.",
  "IAB und WSI ordnen die Lohnabstandsdebatte differenziert ein: Arbeit lohnt sich häufig finanziell, aber die spürbare Haushaltswirkung hängt stark von Miete, Kindern, Region, Transfers und Arbeitsqualität ab.",
  "Totalverweigerung und harte Sanktionen sind politisch stark sichtbar, empirisch aber keine tragfähige Erklärung für das gesamte Bürgergeldsystem.",
];

const workPsychology = [
  ["Relative Deprivation", "Menschen vergleichen sich mit ähnlichen Haushalten. Wenn Arbeit kaum spürbar mehr Sicherheit bringt, entsteht Kränkung.", "Frust anerkennen und reale Haushaltsrechnung öffnen."],
  ["Fundamentaler Attributionsfehler", "Strukturelle Hürden werden als Charakterfehler gedeutet: faul, bequem, unwillig.", "Von Personeneigenschaft zu Barriere wechseln: Gesundheit, Betreuung, Qualifikation, Mobilität, Jobqualität."],
  ["Zero-Sum-Bias", "Die Unterstützung der einen wirkt wie Verlust der anderen.", "Zeigen, dass gute Arbeit, Wohnpolitik und einfache Transfers beide Seiten stärken können."],
  ["Loss Aversion", "Gefühlter Statusverlust wiegt stärker als abstrakte Systemdaten.", "Konkrete Verlustpunkte benennen: Miete, Zeit, Pendeln, Bürokratie, Unsicherheit."],
  ["Sündenbockmechanik", "Wut über Lohn, Miete und Staat wird auf Leistungsbeziehende verschoben.", "Frame stoppen: Nicht Armut bekämpfen, indem man Arme bekämpft."],
];

const workManipulationPatterns = [
  ["Extremfall als Systembeweis", "Ein Fall von Arbeitsverweigerung wird als Beweis für Millionen Leistungsberechtigte genutzt.", "Einzelfall prüfen, Grundgesamtheit und Datenlage zeigen."],
  ["Lohnproblem wird Sozialstaatsproblem", "Zu niedrige Löhne und hohe Kosten werden als zu hohe Grundsicherung gedeutet.", "Lohn, Miete, Betreuung, Pendeln und Transfers sichtbar machen."],
  ["Armut als Charakterfehler", "Leistungsbezug wird als moralisches Versagen erzählt.", "Lebenslage, Barrieren und Arbeitsmarktbedingungen prüfen."],
  ["Regelsatz ohne Lebenslage", "Bürgergeld wird als Geldbetrag isoliert betrachtet.", "Haushalt, Miete, Kinder, Gesundheit und Region mitbilanzieren."],
  ["Sozialneid gegen unten", "Frust wird auf Bedürftige gelenkt statt auf Fehlanreize im System.", "Fairness nach oben und unten prüfen: Löhne, Mieten, Vermögen, Steuern, Arbeit."],
  ["Sanktionen als Scheinlösung", "Druck wird als Haupthebel verkauft, obwohl Strukturbarrieren bestehen bleiben.", "Sanktionen für Pflichtverletzungen trennen von Qualifizierung, Betreuung, Wohnen und Jobqualität."],
];

const workEffectPath = [
  ["Aussage", "„Arbeit lohnt sich nicht mehr. Bürgergeld macht faul.“"],
  ["Wirkstoff", "Leistungsfrust als Sündenbockverstärker."],
  ["Verkürzung", "Strukturprobleme werden als Charakterproblem von Leistungsbeziehenden erzählt."],
  ["Ausblendung", "Niedriglohn, Miete, Kinderbetreuung, Pendeln, Gesundheit, Qualifikation, Transferentzug, Jobqualität und Vermittlung verschwinden."],
  ["Resonanz", "Kränkung, Wut, Sozialneid, Statusangst, Gerechtigkeitsgefühl."],
  ["Narrativ", "„Die Fleißigen zahlen für die Faulen.“"],
  ["Wirkung erster Ordnung", "Abwertung von Bürgergeldbeziehenden und Frust bei Erwerbstätigen steigen."],
  ["Wirkung zweiter Ordnung", "Sozialstaatsdebatten verschieben sich von wirksamer Arbeit zu Druck und Kürzung."],
  ["Wirkung dritter Ordnung", "Demokratischer Zusammenhalt sinkt, während die tatsächlichen Anreiz- und Arbeitsmarktprobleme bestehen bleiben."],
];

const workFalseActions = [
  ["Arbeit", "Niedriglöhne, schlechte Arbeitsbedingungen und geringe Tarifbindung bleiben bestehen."],
  ["Sozialstaat", "Grundsicherung wird verschärft, ohne Menschen wirksam in gute Arbeit zu bringen."],
  ["Wohnung", "Hohe Mieten treiben Bedürftigkeit weiter, werden aber nicht als Ursache adressiert."],
  ["Familie und Care", "Alleinerziehende und pflegende Angehörige werden moralisiert statt unterstützt."],
  ["Arbeitsmarkt", "Qualifizierung, Vermittlung, Sprache, Gesundheit und Mobilität werden vernachlässigt."],
  ["Demokratie", "Erwerbstätige und Bedürftige werden gegeneinander gestellt; Vertrauen sinkt."],
  ["Haushalt", "Druckpolitik kann kurzfristig hart wirken, aber strukturell wenig sparen oder sogar Folgekosten erhöhen."],
];

const workMpd = [
  ["Mensch", "Abwertung, Armut, Stress, Gesundheitsbelastung, schlechte Arbeit und fehlende Teilhabe können sich verstärken.", "Living Wages, Qualifizierung, Betreuung, Wohnen, Gesundheit, Mobilität und einfache Transfers."],
  ["Planet", "Arbeitsmarkt- und Sozialdebatten können ökologische Transformation blockieren, wenn Beschäftigte Angst vor Verlust statt Perspektive erleben.", "Transformationsjobs, Qualifizierung, regionale Industriepolitik, grüne Wertschöpfung und soziale Abfederung."],
  ["Demokratie", "Faulheitsframes spalten Gesellschaft und stärken autoritäre Sündenbockpolitik.", "Quellenklarheit, Fairness, Wirkungshaushalt, wirksame Vermittlung, transparente Arbeits- und Sozialindikatoren."],
];

const workSdgMapping = [
  ["SDG 1 - Keine Armut", "Armutsprävention und Grundsicherung"],
  ["SDG 3 - Gesundheit und Wohlergehen", "Gesundheitliche Belastung durch Armut, Stress und schlechte Arbeit"],
  ["SDG 4 - Hochwertige Bildung", "Qualifizierung, Future Skills und Beschäftigungsfähigkeit"],
  ["SDG 5 - Geschlechtergleichstellung", "Care, Alleinerziehende und Erwerbschancen"],
  ["SDG 8 - Menschenwürdige Arbeit", "Living Wage, Arbeitsqualität, Sicherheit und Aufstieg"],
  ["SDG 10 - Weniger Ungleichheiten", "Transfer- und Teilhabegerechtigkeit"],
  ["SDG 11 - Nachhaltige Städte und Gemeinden", "Mietbelastung und Wohnsicherheit"],
  ["SDG 16 - Frieden, Gerechtigkeit und starke Institutionen", "Diskursfähigkeit, Vertrauen und Schutz vor Sündenbocklogik"],
  ["SDG+", "Menschenwürde, gesellschaftlicher Zusammenhalt, soziale Resilienz und demokratische Konfliktfähigkeit"],
];

const workClaimIndex = [
  ["„Arbeit lohnt sich nicht mehr?“", "v2-Prüfung läuft", "Wahrer Frust- und Lohnabstandskern, falsches Faulheitsnarrativ.", "Faulheitsnarrativ, Wer arbeitet ist der Dumme, Sozialneid gegen unten, Totalverweigerer-Frame, Lohnproblem als Sozialstaatsproblem", "Relative Deprivation, Zero-Sum Bias, Fundamentaler Attributionsfehler, Statusbedrohung, Sündenbockmechanismus", "../../live/arbeit-lohnt-sich-nicht-mehr/"],
  ["„Bürgergeld macht faul“", "subclaim", "Abwertungsframe: Einzelfälle werden zum Gruppenurteil.", "Faulheitsnarrativ, Armut als Charakterfehler", "Fundamentaler Attributionsfehler, moralische Emotion", "../../live/arbeit-lohnt-sich-nicht-mehr/#buergergeld-macht-faul"],
  ["„Wer arbeitet, ist der Dumme“", "subclaim", "Wahrer Anerkennungskern, falsches Gegeneinander.", "Wer arbeitet ist der Dumme, Sozialneid gegen unten", "Relative Deprivation, Statusbedrohung", "../../live/arbeit-lohnt-sich-nicht-mehr/#wer-arbeitet-ist-der-dumme"],
  ["„Totalverweigerer leben auf unsere Kosten“", "subclaim", "Empirisch kleiner Kern, politisch stark überhöhter Frame.", "Totalverweigerer-Frame, Extremfall als Systembeweis", "Verfügbarkeitsheuristik, Empörungsheuristik", "../../live/arbeit-lohnt-sich-nicht-mehr/#totalverweigerer"],
  ["„Aufstocker beweisen Sozialmissbrauch“", "subclaim", "Falsch: Aufstocker zeigen oft, dass Arbeit nicht genug trägt.", "Lohnproblem als Sozialstaatsproblem, Niedriglohn-Verdeckung", "Zero-Sum Bias, Sündenbockmechanismus", "../../live/arbeit-lohnt-sich-nicht-mehr/#aufstocker"],
];

const workMeasures = [
  ["Living-Wage-Logik stärken", "Arbeit muss im realen Haushalt Teilhabe schaffen, nicht nur rechnerisch ein paar Euro mehr."],
  ["Transferentzugsraten glätten", "Mehrarbeit soll sichtbar ankommen; harte Sprungstellen, Bürokratie und Unsicherheit reduzieren."],
  ["Wohnen als Arbeitsanreiz behandeln", "Hohe Mieten können Erwerbsanreize zerstören. Wohnpolitik ist deshalb Arbeitsmarktpolitik."],
  ["Kinderbetreuung und Care sichern", "Ohne verlässliche Betreuung bleibt Erwerbsarbeit für viele Haushalte theoretisch."],
  ["Aufstocker als Warnsignal lesen", "Aufstockung zeigt oft schlechte Löhne, geringe Stunden, hohe Mieten oder Familienlasten."],
  ["Jobcenter als Wirkungszentren", "Beratung, Qualifikation, Gesundheit, Matching und Arbeitgeberkontakte wichtiger machen als Symbolkontrolle."],
  ["Sanktionen präzise halten", "Pflichtverletzungen rechtsstaatlich bearbeiten, aber nicht zum Ersatz für Arbeitsmarktpolitik machen."],
  ["Qualifikation als Investition", "Sprache, Ausbildung, Weiterbildung und Anerkennung schaffen dauerhafte Beitragsfähigkeit."],
  ["Arbeitszeitfallen entfernen", "Minijob-, Teilzeit- und Übergangsfallen so abbauen, dass Mehrarbeit planbar lohnt."],
  ["Diskurs entgiften", "Faulheitsframes markieren, nicht übernehmen; Würde, Wirkung und Fairness verbinden."],
];

const workNarrativePages = [
  ["faulheitsnarrativ", "Faulheitsnarrativ", "Wenn Arbeitslosigkeit als Charakterfehler erzählt wird.", "hoch", "Das Faulheitsnarrativ macht aus Lohn-, Wohn-, Gesundheits-, Betreuungs- und Qualifikationsfragen ein moralisches Urteil über Menschen."],
  ["wer-arbeitet-ist-der-dumme", "Wer arbeitet, ist der Dumme", "Wenn berechtigter Leistungsfrust gegen Arme gelenkt wird.", "hoch", "Der Frame trifft einen echten Frust, verschiebt ihn aber von Arbeitsqualität, Lohn und Wohnkosten auf Leistungsbeziehende."],
  ["totalverweigerer-frame", "Totalverweigerer-Frame", "Wenn ein Extremfall zum Systembeweis wird.", "hoch", "Der Frame nutzt seltene Extremfälle, um Grundsicherung insgesamt als Missbrauchssystem erscheinen zu lassen."],
  ["sozialneid-gegen-unten", "Sozialneid gegen unten", "Wenn Knappheit nach unten abgeleitet wird.", "hoch", "Menschen mit wenig werden gegen Menschen mit noch weniger gestellt; strukturelle Ursachen verschwinden."],
  ["lohnproblem-als-sozialstaatsproblem", "Lohnproblem als Sozialstaatsproblem", "Wenn schlechte Arbeit als zu guter Sozialstaat erzählt wird.", "hoch", "Niedriglohn, Mieten, Betreuung und Transferentzug werden verdeckt, indem Bürgergeld zum Hauptproblem erklärt wird."],
  ["leistungstraeger-gegen-sozialstaat", "Leistungsträger gegen Sozialstaat", "Wenn Solidarität als Gegnerschaft erzählt wird.", "mittel", "Der Sozialstaat wird nicht als gemeinsame Risikoinfrastruktur, sondern als Belastung der Fleißigen gerahmt."],
];

const workGlossaryTerms = [
  ["lohnabstand", "Lohnabstand", "Abstand zwischen Arbeitseinkommen und Grundsicherungsbezug. Wirkungsökonomisch zählt nicht nur Brutto oder Regelsatz, sondern die reale Haushaltslage nach Miete, Betreuung, Transferentzug und Arbeitskosten.", "Lohnabstand ist eine Haushaltsfrage, kein Bauchgefühl."],
  ["transferentzugsrate", "Transferentzugsrate", "Anteil zusätzlichen Erwerbseinkommens, der durch sinkende Sozialleistungen, Steuern, Abgaben oder Kosten nicht im Haushalt ankommt.", "Wenn Mehrarbeit kaum ankommt, entsteht Fehlanreiz."],
  ["aufstocker", "Aufstocker", "Erwerbstätige, deren Einkommen nicht reicht und die ergänzende Grundsicherung beziehen.", "Aufstockung ist oft Warnsignal für Lohn, Stunden, Miete oder Lebenslage."],
  ["living-wage", "Living Wage", "Arbeitslohn, der in einer konkreten Region und Haushaltslage echte Teilhabe, Sicherheit und Würde ermöglicht.", "Arbeit soll Lebensqualität tragen, nicht nur Beschäftigung zählen."],
  ["totalverweigerer-frame", "Totalverweigerer-Frame", "Politischer Frame, der seltene oder extreme Pflichtverletzungen als Erklärung für das gesamte Grundsicherungssystem nutzt.", "Extremfall ist nicht Systembeweis."],
  ["arbeitsanreiz", "Arbeitsanreiz", "Zusammenspiel aus Lohn, Nettoeffekt, Wohnkosten, Betreuung, Mobilität, Gesundheit, Arbeitsqualität und Transferregeln, das Erwerbsarbeit attraktiv oder unattraktiv macht.", "Arbeitsanreiz ist Systemarchitektur."],
  ["wirksame-arbeit", "Wirksame Arbeit", "Arbeit, die Einkommen, Würde, Gesundheit, Teilhabe, Zukunftsperspektive und gesellschaftliche Beiträge stärkt.", "Nicht jeder Job erzeugt automatisch positive Netto-Wirkung."],
  ["sozialstaats-suendenbock", "Sozialstaats-Sündenbock", "Narrativ, das reale Sozialausgaben oder Frust nutzt, um Leistungsberechtigte als Ursache gesellschaftlicher Probleme darzustellen.", "Der wahre Kern sind reale Kosten. Der Denkfehler ist Gruppenschuld."],
];

function workAccordion() {
  return `<div class="radar-answer-accordion work-subclaim-accordion">${workSubclaims.map(([title, slug, judgement, text, question], index) => `<details class="radar-answer-item" id="${esc(slug)}"${index === 0 ? " open" : ""}><summary><span class="radar-answer-time">${esc(title)}</span> <span class="radar-answer-label">${esc(judgement)}</span></summary><p>${esc(text)}</p><p><strong>Bessere Wirkungsfrage:</strong> ${esc(question)}</p></details>`).join("")}</div>`;
}

function workMatrixTable() {
  return `<div class="dossier-matrix-wrap"><table class="dossier-matrix"><thead><tr><th>Bilanzgrenze</th><th>Leitfrage</th><th>Was sie zeigt</th><th>Was sie ausblenden kann</th></tr></thead><tbody>${workRows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function workPatternCards() {
  return `<div class="card-grid">${workManipulationPatterns.map(([label, description, counter]) => `<article class="card"><p class="card-kicker">Muster</p><h3 class="card-title">${esc(label)}</h3><p class="card-text">${esc(description)}</p><p class="card-text"><strong>Gegenmove:</strong> ${esc(counter)}</p></article>`).join("")}</div>`;
}

function workEffectPathHtml() {
  return `<ol class="timeline radar-flow radar-effect-path">${workEffectPath.map(([label, text], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${esc(label)}</strong><p>${esc(text)}</p></div></li>`).join("")}</ol>`;
}

function workPage(kind = "live") {
  const isDetail = kind === "detail";
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / ${isDetail ? "Detail" : "Live"}</nav><p class="hero-kicker">Arbeit, Leistung &amp; soziale Sicherung</p><h1 class="hero-title">${esc(workDossier.title)}</h1><p class="hero-subtitle">${esc(workDossier.subtitle)}</p><p class="radar-abstract"><strong>Abstract:</strong> ${esc(workDossier.abstract)}</p><p class="radar-status-line"><span>Status: Leuchtturm-Dossier</span><span>Datenstand: ${UPDATED_AT}</span><span>Lohnabstand, Lebenslage und Würde getrennt betrachten</span></p></div></section>
      ${summaryGrid([["Kurzurteil", workDossier.judgement, "warning"], ["Leitsatz", "Wer Arbeit attraktiver machen will, muss Arbeit verbessern - nicht Armut verschärfen.", "positive"], ["Hinweis", workDossier.heroNote, "neutral"], ["Host-Regel", "Frust anerkennen. Faulheitsframe nicht übernehmen. Arbeitsarchitektur öffnen.", "positive"]], "Arbeit Bürgergeld Summary")}
      ${nav("../../../")}
      <section class="section" id="sechs-punkte"><div><div class="section-header"><p class="hero-kicker">Das Wichtigste</p><h2>Sechs Punkte für eine faire Einordnung.</h2></div>${cardGrid(workDossier.keyPoints, "Kernpunkt")}</div></section>
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude><a href="#live-antworten">Live antworten</a><a href="#arbeit-buergergeld-anreize-verstehen">Arbeit, Bürgergeld &amp; Anreize verstehen</a><a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a></nav>
      <section class="section dossier-tab-panel" id="live-antworten"><div><div class="section-header"><p class="hero-kicker">Tab 1</p><h2>Live antworten.</h2></div><div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge"><details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">${words(workDossier.answers.ten)} Wörter</span></summary><p>„${esc(workDossier.answers.ten)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">${words(workDossier.answers.thirty)} Wörter</span></summary><p>„${esc(workDossier.answers.thirty)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">${words(workDossier.answers.two)} Wörter</span></summary><p>„${esc(workDossier.answers.two)}“</p></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Die bessere Frage</p><h3 class="card-title">${esc(workDossier.redirectQuestion)}</h3></article><article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich beantworte den Frust, aber ich übernehme nicht den Frame „Bürgergeld macht faul“. Der reale Punkt ist: Arbeit, Wohnen, Betreuung, Mobilität, Qualifikation und Transferregeln müssen besser zusammenspielen.</p></article></div><article class="card"><p class="card-kicker">Nicht sagen</p>${list(["Bürgergeld ist zu hoch.", "Arbeiten lohnt sich immer problemlos.", "Alle wollen nicht arbeiten.", "Es gibt keinen Lohnabstandsfrust.", "Sanktionen lösen das schon.", "Wer arm ist, ist selbst schuld.", "Aufstocker beweisen Missbrauch."])}</article></div></section>
      <section class="section section-soft dossier-tab-panel" id="arbeit-buergergeld-anreize-verstehen"><div><div class="section-header"><p class="hero-kicker">Tab 2</p><h2>Arbeit, Bürgergeld &amp; Anreize verstehen.</h2><p>Die Debatte wird oft so geführt, als stünden zwei Gruppen gegeneinander: die Fleißigen und die Faulen. Wirkungsökonomisch ist das falsch. Die reale Frage lautet: Wie gut verwandelt unser System Arbeit in Teilhabe, Sicherheit, Sinn, Aufstieg und gesellschaftliche Wirkung?</p><p>Arbeit lohnt sich nicht nur über Geld. Arbeit lohnt sich, wenn sie Sicherheit, Würde, Selbstwirksamkeit, Gesundheit, Zeit und Zukunftsperspektive stärkt. Ein Sozialstaat ist kein Gegner der Arbeit. Er soll verhindern, dass schlechte Arbeit, Krankheit, Care-Arbeit oder Krisen Menschen aus der Gesellschaft werfen.</p></div><article class="card"><p class="card-kicker">Warnhinweis</p><h3 class="card-title">Ein Regelsatzvergleich allein erklärt nicht, ob Arbeit sich lohnt.</h3><p class="card-text">Entscheidend sind der ganze Haushalt, die Region, Wohnkosten, Betreuung, Pendeln, Gesundheit, Transfers, Arbeitsqualität und Lebenslage.</p></article><div class="section-header"><p class="hero-kicker">Bilanzgrenzen-Matrix</p><h2>Welche Bilanzgrenze wird falsch gesetzt?</h2></div>${workMatrixTable()}<div class="card-grid two"><article class="card"><p class="card-kicker">Was stimmt?</p><h3 class="card-title">Der Leistungsfrust hat reale Anker.</h3>${list(["Arbeit muss finanziell spürbar mehr bringen als Nicht-Erwerbstätigkeit.", "Niedriglöhne können trotz Vollzeit zu wenig für ein gutes Leben reichen.", "Hohe Mieten verringern den Lohnabstand.", "Transferentzug kann zusätzliche Arbeit weniger attraktiv machen.", "Kinderbetreuungskosten und Betreuungszeiten können Arbeit erschweren.", "Pendeln kostet Geld, Zeit und Energie.", "Bürokratie bei Wohngeld, Kinderzuschlag und ergänzenden Leistungen kann abschrecken.", "Manche Jobcenter arbeiten nicht ausreichend wirksam.", "Es gibt Einzelfälle von Missbrauch oder Arbeitsverweigerung.", "Erwerbstätige haben ein legitimes Bedürfnis nach Fairness und Anerkennung."])}<p class="formula-note"><strong>Redaktioneller Hinweis:</strong> Diese Punkte anerkennen. Sonst wirkt die Seite wie Beschwichtigung oder Bürgergeld-Verteidigung.</p></article><article class="card"><p class="card-kicker">Was fehlt?</p><h3 class="card-title">Faulheitsframes verdecken die Lösung.</h3>${list(["Bürgergeld ist Grundsicherung, kein Wohlstand.", "Viele Leistungsberechtigte sind Kinder, Alleinerziehende, Aufstocker, Menschen in Ausbildung, Kranke oder Menschen mit Care-Verantwortung.", "Erwerbsfähigkeit heißt nicht sofortige Arbeitsmarktfähigkeit.", "Arbeit hängt von Gesundheit, Qualifikation, Sprache, Betreuung, Mobilität, Wohnort und verfügbaren Stellen ab.", "Viele Menschen arbeiten und brauchen trotzdem ergänzende Leistungen.", "Sanktionen treffen nur einen kleinen Teil der Debatte und lösen keine Strukturprobleme.", "Der Niedriglohnsektor ist ein Arbeitsmarktproblem, kein Bürgergeldproblem.", "Wohnungsnot und Mieten treiben Bedürftigkeit.", "Komplizierte Transfers können Erwerbsanreize schwächen.", "Wer Menschen pauschal als faul markiert, zerstört Vertrauen und verhindert Lösungen.", "Arbeit muss nicht nur erzwungen, sondern wirksam ermöglicht werden."])}<p class="formula-note"><strong>Kernsatz:</strong> Der Denkfehler ist nicht, Arbeitsanreize zu fordern. Der Denkfehler ist, Anreizprobleme in Menschenverachtung zu übersetzen.</p></article></div></div></section>
      <section class="section dossier-tab-panel" id="unterclaims"><div><div class="section-header"><p class="hero-kicker">Unterclaims</p><h2>Aufklappbare Varianten und Gegenfragen.</h2></div>${workAccordion()}</div></section>
      <section class="section section-soft dossier-tab-panel" id="wirkstoffanalyse"><div><div class="section-header"><p class="hero-kicker">Wirkstoffanalyse</p><h2>Leistungsfrust als Sündenbockverstärker.</h2><p>Das Narrativ verwandelt reale Belastung in ein Urteil über Menschen: Aus Lohn, Miete, Betreuung, Gesundheit und Transferentzug wird „die wollen nicht“.</p></div>${cardGrid([["Lohn-Eimer mit Löchern", "Mehr Arbeit füllt den Eimer. Miete, Kita, Pendeln, wegfallende Leistungen, Bürokratie und Stress können ihn wieder leeren."], ["Alleinerziehend und mehr Stunden", "Mehr Brutto kann durch Betreuung, Wege, Stress und wegfallende Leistungen kaum als Sicherheit ankommen."], ["Kernsatz", "Nicht das Netz zerschneiden, sondern die Löcher im Arbeits-Eimer schließen."]], "Hostbild")}</div></section>
      <section class="section dossier-tab-panel" id="psychologie"><div><div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Welche Effekte betroffen sind.</h2></div><div class="card-grid">${workPsychology.map(([title, text, move]) => `<article class="card"><p class="card-kicker">Effekt</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(text)}</p><p class="card-text"><strong>Host-Move:</strong> ${esc(move)}</p></article>`).join("")}</div></div></section>
      <section class="section section-soft dossier-tab-panel" id="manipulationsmuster"><div><div class="section-header"><p class="hero-kicker">Manipulationsmuster</p><h2>Wie der Frame aus Frust ein Feindbild macht.</h2><p>Diese Muster markieren den rhetorischen Sprung von berechtigter Fairnessfrage zu abwertender Sündenbocklogik.</p></div>${workPatternCards()}</div></section>
      <section class="section dossier-tab-panel" id="wirkungspfad"><div><div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Vom Satz zur Systemwirkung.</h2></div>${workEffectPathHtml()}</div></section>
      <section class="section section-soft dossier-tab-panel" id="folgen-falschen-handelns"><div><div class="section-header"><p class="hero-kicker">Folgenanalyse</p><h2>Was falsches Handeln verschärft.</h2></div>${cardGrid(workFalseActions, "Dimension")}</div></section>
      <section class="section dossier-tab-panel" id="mpd-sdg"><div><div class="section-header"><p class="hero-kicker">MPD &amp; SDG+</p><h2>Bewertung nach Mensch, Planet und Demokratie.</h2></div><div class="card-grid">${workMpd.map(([title, risk, solution]) => `<article class="card"><p class="card-kicker">MPD</p><h3 class="card-title">${esc(title)}</h3><p class="card-text"><strong>Risiko:</strong> ${esc(risk)}</p><p class="card-text"><strong>Lösung:</strong> ${esc(solution)}</p></article>`).join("")}</div><div class="section-header"><p class="hero-kicker">Mapping</p><h2>Relevante SDG-/SDG+-Bezüge und Indikatorfamilien.</h2></div>${cardGrid(workSdgMapping, "Indikatorfamilie")}</div></section>
      <section class="section section-soft dossier-tab-panel" id="woek-loesung"><div><div class="section-header"><p class="hero-kicker">WÖk-Lösung</p><h2>Arbeit wirksam machen.</h2><p>Die Lösung ist nicht weniger Würde, sondern bessere Arbeits-, Wohn-, Betreuungs-, Qualifikations- und Transferarchitektur.</p></div>${cardGrid(workMeasures, "Maßnahme")}</div></section>
      <section class="section dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Tab 3</p><h2>Deep Dive &amp; Quellen.</h2><p>Datenstand: ${UPDATED_AT}. Quellen prüfen Regelsätze, Mindestlohn, Grundsicherung, Lohnabstand, Aufstockung und Totalverweigerer-Frame.</p></div>${list(workFacts)}${sourceCards(workSourcePack)}</div></section>
    </main>`;
  return shell({ title: `${workDossier.title} | Wirkungsradar ${isDetail ? "Detail" : "Live"}`, description: workDossier.subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/${isDetail ? "detail" : "live"}/${workDossier.slug}/`, base: "../../../", main });
}

function workClusterPage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero"><div class="radar-hero-copy"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / Themen</nav><p class="hero-kicker">Themencluster</p><h1 class="hero-title">Arbeit, Leistung &amp; soziale Sicherung</h1><p class="hero-subtitle">Wirkungsradar zu Lohnabstand, Bürgergeld, Aufstockung, Arbeitsanreizen, Wohnkosten, Betreuung, Qualifikation und Würde.</p><p class="radar-abstract"><strong>Abstract:</strong> Dieses Cluster trennt berechtigten Leistungsfrust von Faulheits- und Sündenbocknarrativen. Es fragt nicht, wie man Armut verschärft, sondern welche Architektur gute Arbeit, Teilhabe und faire Anreize erzeugt.</p><p class="radar-status-line"><span>Status: Cluster angelegt</span><span>Datenstand: ${UPDATED_AT}</span><span>Leuchtturm: Arbeit lohnt sich nicht mehr?</span></p></div></section>
      ${summaryGrid([["Kurzclaim", "Arbeit wirksam machen, Armut nicht verschärfen.", "positive"], ["Primäre Narrative", "Faulheitsnarrativ, Wer arbeitet ist der Dumme, Sozialneid gegen unten", "warning"], ["Regel", "Lohnabstand, Lebenslage und Würde getrennt betrachten.", "positive"], ["Priorität", "Leuchtturm fertig; Unterclaims vorbereitet.", "neutral"]], "Arbeit Cluster")}
      ${nav("../../../")}
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Leuchtturm</p><h2>Erstes Dossier.</h2></div><div class="card-grid"><a class="card text-link-card" href="../../live/${workDossier.slug}/"><p class="card-kicker">${esc(workDossier.judgement)}</p><h3 class="card-title">${esc(workDossier.title)}</h3><p class="card-text">${esc(workDossier.subtitle)}</p></a></div></div></section>
      <section class="section section-soft"><div><div class="section-header"><p class="hero-kicker">Claimindex</p><h2>Geprüfte Aussage und Unterclaims.</h2></div><div class="card-grid">${workClaimIndex.map(([title, status, judgement, narratives, psychology, href]) => `<a class="card text-link-card" href="${esc(href)}"><p class="card-kicker">${esc(status)}</p><h3 class="card-title">${esc(title)}</h3><p class="card-text">${esc(judgement)}</p><p class="card-text"><strong>Narrative:</strong> ${esc(narratives)}</p><p class="card-text"><strong>Psychologie:</strong> ${esc(psychology)}</p></a>`).join("")}</div></div></section>
      <section class="section"><div><div class="section-header"><p class="hero-kicker">Narrative</p><h2>Narrativfamilien.</h2></div><div class="radar-link-cluster">${workNarrativePages.map(([slug, title]) => `<a href="../../narrative/${slug}/">${esc(title)}</a>`).join("")}</div></div></section>
    </main>`;
  return shell({ title: "Arbeit, Leistung & soziale Sicherung | Wirkungsradar", description: "Wirkungsradar-Themencluster zu Arbeit, Bürgergeld, Lohnabstand und Arbeitsanreizen.", canonical: "https://wirkungsoekonomie.de/wirkungsradar/themen/arbeit-leistung-soziale-sicherung/", base: "../../../", main });
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
  injectBeforeMainEnd("wirkungsradar/themen/index.html", "arbeit-leistung-soziale-sicherung", `<section class="section section-soft" id="arbeit-leistung-soziale-sicherung"><div><div class="section-header"><p class="hero-kicker">Arbeit &amp; soziale Sicherung</p><h2>Neuer Themencluster.</h2></div><div class="card-grid"><a class="card text-link-card" href="arbeit-leistung-soziale-sicherung/"><p class="card-kicker">Arbeit wirksam machen</p><h3 class="card-title">Arbeit, Leistung &amp; soziale Sicherung</h3><p class="card-text">Lohnabstand, Bürgergeld, Aufstockung, Wohnkosten, Betreuung, Arbeitsanreize und Würde sauber trennen.</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/live/index.html", "migration-kostet-nur", `<section class="section section-soft" id="migration-sozialstaat-live"><div><div class="section-header"><p class="hero-kicker">Migration, Sozialstaat &amp; Zusammenhalt</p><h2>Neues Leuchtturm-Dossier.</h2></div><div class="card-grid"><a class="card text-link-card" href="migration-kostet-nur/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${esc(dossier.answers.ten)}</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/live/index.html", "arbeit-lohnt-sich-nicht-mehr", `<section class="section section-soft" id="arbeit-leistung-live"><div><div class="section-header"><p class="hero-kicker">Arbeit, Leistung &amp; soziale Sicherung</p><h2>Neues Leuchtturm-Dossier.</h2></div><div class="card-grid"><a class="card text-link-card" href="arbeit-lohnt-sich-nicht-mehr/"><p class="card-kicker">${esc(workDossier.judgement)}</p><h3 class="card-title">${esc(workDossier.title)}</h3><p class="card-text"><strong>10 Sekunden:</strong> ${esc(workDossier.answers.ten)}</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/detail/index.html", "migration-kostet-nur", `<section class="section section-soft" id="migration-sozialstaat-detail"><div><div class="section-header"><p class="hero-kicker">Migration, Sozialstaat &amp; Zusammenhalt</p><h2>Neuer Deep Dive.</h2></div><div class="card-grid"><a class="card text-link-card" href="migration-kostet-nur/"><p class="card-kicker">${esc(dossier.judgement)}</p><h3 class="card-title">${esc(dossier.title)}</h3><p class="card-text">${esc(dossier.subtitle)}</p></a></div></div></section>`);
  injectBeforeMainEnd("wirkungsradar/detail/index.html", "arbeit-lohnt-sich-nicht-mehr", `<section class="section section-soft" id="arbeit-leistung-detail"><div><div class="section-header"><p class="hero-kicker">Arbeit, Leistung &amp; soziale Sicherung</p><h2>Neuer Deep Dive.</h2></div><div class="card-grid"><a class="card text-link-card" href="arbeit-lohnt-sich-nicht-mehr/"><p class="card-kicker">${esc(workDossier.judgement)}</p><h3 class="card-title">${esc(workDossier.title)}</h3><p class="card-text">${esc(workDossier.subtitle)}</p></a></div></div></section>`);
  updateLiveIndexCount();
}

writeFile("content/wirkungsradar/source-packs/migration-social-state-v1.yaml", `# Generated by scripts/wirkungsradar/build-migration-social-state-cluster.mjs\n${toYaml(sourcePack).trim()}\n`);
writeFile("content/wirkungsradar/source-packs/work-citizens-income-incentives-v1.yaml", `# Generated by scripts/wirkungsradar/build-migration-social-state-cluster.mjs\n${toYaml(workSourcePack).trim()}\n`);
writeFile("wirkungsradar/themen/migration-sozialstaat-zusammenhalt/index.html", clusterPage());
writeFile("wirkungsradar/live/migration-kostet-nur/index.html", livePage());
writeFile("wirkungsradar/detail/migration-kostet-nur/index.html", detailPage());
writeFile("wirkungsradar/themen/arbeit-leistung-soziale-sicherung/index.html", workClusterPage());
writeFile(`wirkungsradar/live/${workDossier.slug}/index.html`, workPage("live"));
writeFile(`wirkungsradar/detail/${workDossier.slug}/index.html`, workPage("detail"));
for (const page of narrativePages) writeFile(`wirkungsradar/narrative/${page[0]}/index.html`, narrativePage(page));
for (const page of workNarrativePages) writeFile(`wirkungsradar/narrative/${page[0]}/index.html`, workNarrativePage(page));
for (const term of [
  ["sozialstaats-suendenbock", "Sozialstaats-Sündenbock", "Narrativ, das reale Sozialausgaben oder Missbrauchsfälle nutzt, um eine ganze Gruppe als Belastung oder Gefahr für den Sozialstaat darzustellen.", "Der wahre Kern sind reale Kosten. Der Denkfehler ist Gruppenschuld."],
  ["nie-eingezahlt-narrativ", "Nie-eingezahlt-Narrativ", "Frame, der Sozialleistungen nur an vorherige individuelle Einzahlung bindet und den Sozialstaat als gemeinsame Risikoinfrastruktur verkürzt.", "Einzahlung ist wichtig. Aber der Sozialstaat ist mehr als ein Sparkonto."],
  ["integration-als-infrastruktur", "Integration als Infrastruktur", "Wirkungsökonomische Sicht auf Integration als Zusammenspiel von Sprache, Bildung, Arbeit, Wohnen, Gesundheit, Rechten, Schutz, Anerkennung und Zugehörigkeit.", "Integration gelingt nicht durch Appelle, sondern durch funktionierende Wirkungsräume."],
  ["sozialtourismus-frame", "Sozialtourismus-Frame", "Politischer Kampfbegriff, der Migration pauschal als Einwanderung in Sozialleistungen deutet.", "Nur als analysierter Frame verwenden, nicht als neutrale Beschreibung."],
  ["entmenschlichender-kampfbegriff", "Entmenschlichender Kampfbegriff", "Begriff, der Menschen nicht als Personen mit Rechten und Würde beschreibt, sondern als Schädlinge, Masse, Last oder Bedrohung.", "Solche Begriffe ersetzen Analyse durch Abwertung."],
  ["kommunale-integrationskapazitaet", "Kommunale Integrationskapazität", "Fähigkeit einer Kommune, Unterbringung, Sprache, Bildung, Gesundheit, Wohnen, Arbeit, Verwaltung und Begegnung wirksam zu organisieren.", "Kommunale Überlastung ist ein Infrastrukturproblem, kein Beweis für Gruppenschuld."],
  ["qualifikationsverlust", "Qualifikationsverlust", "Wirkungsverlust, wenn Menschen unterhalb ihrer Fähigkeiten arbeiten, weil Abschlüsse nicht anerkannt, Sprache nicht gefördert oder Verfahren blockiert sind.", "Ein Ingenieur als Hilfskraft ist keine erfolgreiche Integration, sondern ungenutzte Wirkleistung."],
  ...workGlossaryTerms,
]) writeGlossaryTerm(term);
augmentIndexes();

console.log("Built migration-social-state/work clusters: 2 live dossiers, 2 detail pages, 12 narratives, 15 glossary pages.");
