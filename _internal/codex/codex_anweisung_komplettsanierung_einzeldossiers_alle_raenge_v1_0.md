# CodeX-Anweisung: Komplettsanierung aller Detailkonzepte und Einzeldossiers

Du arbeitest im Repository von wirkungsoekonomie.de.

## Anlass und Korrekturentscheidung

Die bisher erzeugten „Detailkonzepte“ und „Einzeldossiers“ vieler Wirkungsfelder sind zu kurz und erfüllen nicht den vereinbarten Veröffentlichungsstandard. Dokumente mit 1-3 Seiten dürfen nicht mehr als Detailkonzept oder Dossier veröffentlicht werden. Sie gelten nur noch als Kurznotiz, Platzhalter oder Portalintro.

Verbindliche Referenz für Umfang, Tiefe und Struktur ist das Dokument:
`woek_wohnen_investoren_vermieter_detailkonzept_v0_3.docx`

Dieses Dokument ist der neue Mindeststandard für alle Unterbereiche: ausführliche öffentliche Ausarbeitung, klare Kapitelstruktur, Akteursperspektiven, Tabellen, rechtliche Anschlussstellen, wirkungsökonomische Einordnung, Anreize, Risiken, politische Anschlussfähigkeit und Website-Integration.

## Grundsatz

Für jeden Rang, jedes Wirkungsfeld, jedes Werkzeug und jeden Unterbereich gilt künftig:

> Portaltext ist Überblick. Detailkonzept ist fachliche Ausarbeitung. Dossier ist praxisbezogene Anwendung. Online-Volltext ist Hauptzugang. Download ist Ergänzung.

## Sofortiger Produktionsstopp für unvollständige Seiten

Bis die Sanierung abgeschlossen ist:

- Keine weiteren kurzen Detailkonzepte als „Detailkonzept“ ausgeben.
- Keine weiteren 2-Seiten-Dossiers als „Dossier“ ausgeben.
- Keine Webseiten veröffentlichen, die nur Teaser oder Stichpunkte enthalten, wenn dazu bereits umfangreiche Konzepte/Dossiers vorgesehen sind.
- Bestehende kurze Dokumente umbenennen in `kurzueberblick`, `notiz`, `intro` oder `platzhalter` - oder aus den öffentlichen Downloadbereichen entfernen.
- Bereits veröffentlichte Unterseiten mit schwachem Inhalt vorläufig als `Entwurf / Ausbau folgt` kennzeichnen, sofern keine vollständige Fassung vorliegt.

## Neuer Mindeststandard für Detailkonzepte

Ein öffentliches Detailkonzept muss mindestens diese Struktur enthalten:

1. Cover mit Wirkungsökonomie-CD, Autorin Natalie Weber, Version, Status, Stand
2. Kurzprofil mit Dokumenttyp, Portal, Unterbereich, Öffentlichkeitshinweis, Disclaimer
3. Inhaltsübersicht
4. Executive Summary
5. Ausgangsdiagnose / Problemthese
6. Alte Logik / bisheriger Maßstab / Markt- oder Staatsversagen
7. Wirkungsökonomischer Perspektivwechsel
8. Begriffsdefinitionen und Abgrenzungen
9. Akteursgruppen und Interessenlage
10. Wirkungsmodell: Mensch, Planet, Demokratie
11. SDG-/SDG+-Bezug mit Unterziel-/Indikatorbezug
12. WÖk-ID-/Scorecard-/NWI-/T-SROI-Bezug
13. Datenquellen, Messlogik und Datenqualität
14. Beispiele und Falllogiken
15. Finanzierungs-, Steuer-, Fonds- oder Anreizbezug
16. Rechtliche und regulatorische Anschlussstellen heute
17. Politische Anschlussfähigkeit und Umsetzungsoptionen
18. Risiken, Zielkonflikte und Missbrauchsschutz
19. Tool-/Rechner-/Demo-Konzept
20. Website- und Portalintegration
21. Fazit
22. Quellen / Referenzen / weiterführende Links

Mindesttiefe:
- keine 2-Seiten-Texte;
- in der Regel 15-30 Seiten je Detailkonzept;
- bei komplexen Themen 30+ Seiten möglich;
- mindestens 4.500 Wörter pro Detailkonzept, wenn kein bereits vorhandenes umfangreiches Ausgangspaper eingebunden ist;
- Tabellen und Fallbeispiele sind Pflicht, wo sinnvoll.

## Neuer Mindeststandard für Einzeldossiers

Ein Dossier ist nicht dasselbe wie ein Detailkonzept. Das Dossier ist praktischer, anwendungsnäher und beispielorientierter. Es muss mindestens enthalten:

1. Cover und Kurzprofil
2. Was ist das Problem?
3. Warum ist es wirkungsökonomisch relevant?
4. Was bedeutet es für Bürger:innen, Unternehmen, Verwaltung, Politik und Kapital?
5. Konkrete Beispiele
6. Datenquellen und Indikatoren
7. Berechnungslogik / Scorecard / T-SROI / NWI / Wirkungsfondsbezug, falls relevant
8. Beispielrechnung oder Anwendungsszenario
9. Politische Anschlussfähigkeit
10. Umsetzungspfade: kurzfristig, mittelfristig, langfristig
11. Tool-/Rechner-Anwendung
12. Fragen und Einwände
13. Quellen und weiterführende Links

Mindesttiefe:
- in der Regel 10-20 Seiten je Dossier;
- mindestens 3.000 Wörter je Dossier;
- mindestens ein konkretes Beispiel oder Anwendungsszenario;
- mindestens eine Tabelle, Matrix, Scorecard oder Umsetzungsübersicht.

## Öffentliche Website-Inhalte

Für jedes Detailkonzept und jedes Dossier müssen erzeugt werden:

- DOCX-Download
- optional PDF-Download
- vollständige HTML-/MDX-Online-Version
- Inhaltsverzeichnis mit Ankern
- mobile-taugliche Abschnitte
- responsive Tabellen oder Karten
- Quellenblock
- Druckfunktion
- Verlinkung zu Portal, Buchanker, Glossar, SDG-/SDG+, Werkzeugen und verwandten Wirkungsfeldern

Nicht erlaubt:
- CodeX-Anweisungen in öffentlichen Dokumenten oder Webseiten
- Repository-Interna in öffentlichen Texten
- Fake-Links zu Tools, die nicht existieren
- reine Stichpunktlisten als Online-Volltext
- Tabellen, die mobil abgeschnitten sind
- Inhaltsverzeichnisse, die mobil zusammenlaufen

## Pflicht: Status- und Qualitätsregister

Lege ein öffentlich nicht sichtbares Register an:

`/data/content_quality/detaildossier_sanierung_status.json`

Pflichtfelder je Unterbereich:

- rang
- portal
- unterbereich
- slug
- detailkonzept_status: fehlt / kurzfassung / in_arbeit / vollständig / geprüft
- detailkonzept_docx
- detailkonzept_html
- dossier_status: fehlt / kurzfassung / in_arbeit / vollständig / geprüft
- dossier_docx
- dossier_html
- tool_status
- website_status
- qa_mobile
- qa_downloads
- qa_no_internal_instructions
- last_reviewed

Keine Seite darf als vollständig gelten, solange Detailkonzept und Dossier nicht beide vollständig online lesbar und downloadbar sind.

## Bestehende kurze Dokumente behandeln

Bestehende kurze Dokumente bleiben nicht verloren, werden aber anders genutzt:

- als Portal-Intro
- als Kurzüberblick
- als Executive Summary
- als Teaserkarte
- als Ausgangspunkt für Vollausarbeitung

Sie dürfen nicht mehr alleiniger Inhalt eines Detailkonzepts oder Dossiers sein.

## Ränge und Unterbereiche

Nutze die Datei `sanierungsmatrix_raenge_0_bis_13_v1_0.csv` als Arbeitsliste. Für jede Zeile müssen mindestens erstellt oder ersetzt werden:

- ein umfangreiches Detailkonzept
- ein umfangreiches Einzeldossier
- eine vollständige Online-Volltextfassung des Detailkonzepts
- eine vollständige Online-Volltextfassung des Dossiers
- Downloadlinks
- Quellenblock
- Toolkarten, falls relevant
- politische Anschlussfähigkeit
- SDG-/SDG+-Bezug

## Priorisierung

Sanierungsreihenfolge:

1. Rang 0 SDG-/SDG+-Referenz, weil alle Seiten darauf verlinken.
2. Rang 1 Produkte & Konsum / Wirkungsumsatzsteuer.
3. Rang 2 Impact Controlling / T-SROI / WÖk-IDs / Scorecards.
4. Rang 3 Staat, Recht & Demokratie / WStG / Wirkungsrat.
5. Rang 4 Wirtschaft & Unternehmen.
6. Rang 5 Wohnen & Stadt.
7. Rang 6 Arbeit & Einkommen / Automatisierung.
8. Rang 7 Rente & soziale Sicherung.
9. Rang 8 Bildung / Wirkungsschule.
10. Rang 9 Medien, Social Media, Journalismus & Öffentlichkeit.
11. Rang 10 Gesundheit & Pflege.
12. Rang 11 Wissenschaft, Innovation & Digitalisierung.
13. Rang 12 Finanzsystem & Kapital.
14. Rang 13 Klima, Energie & Ressourcen.

## Website-Qualitätsgate

Jede sanierte Seite muss vor Freigabe bestehen:

- Downloads öffnen korrekt.
- Online-Volltext ist vollständig.
- Inhaltsverzeichnis ist mobil lesbar.
- Tabellen sind responsiv.
- Toolkarten sind verlinkt oder mit Status `Demo in Vorbereitung` versehen.
- Keine internen CodeX-/Repository-Anweisungen öffentlich.
- Seiten enthalten ausreichend Substanz und keine bloßen Stichpunkte.
- Quellen sind sichtbar.
- Buchanker, Glossar, SDG-/SDG+, Werkzeuge und verwandte Portale sind verlinkt.
- Druckfunktion funktioniert.
- Sitemap und Suchindex sind aktualisiert.

## Benennung

Dateien künftig so benennen:

`woek_<portal_slug>_detailkonzept_<unterbereich_slug>_v0_4.docx`
`woek_<portal_slug>_dossier_<unterbereich_slug>_v0_4.docx`
`/wirkungsfelder/<portal_slug>/detailkonzepte/<unterbereich_slug>/`
`/wirkungsfelder/<portal_slug>/dossiers/<unterbereich_slug>/`

Für übergreifende Werkzeuge:

`woek_werkzeug_<tool_slug>_detailkonzept_v0_4.docx`
`woek_werkzeug_<tool_slug>_dossier_v0_4.docx`
`/werkzeuge/<tool_slug>/konzept/`
`/werkzeuge/<tool_slug>/dossier/`

## Schlussregel

Ein Dokument heißt nur dann Detailkonzept oder Dossier, wenn es den oben genannten Standard erfüllt. Alles andere ist Kurzfassung, Notiz oder Entwurf.
