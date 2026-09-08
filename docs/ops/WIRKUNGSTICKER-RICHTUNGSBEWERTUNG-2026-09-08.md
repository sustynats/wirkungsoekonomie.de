# Richtungsbewertung und Chrome-Scrollen: Korrektur vom 8. September 2026

## Gegenstand und Befund

Leserfeedback: Die Sammelkennzeichnung `Richtung offen` vermischte fehlende Richtungsdaten, fehlende Wirkpfade und tatsächlich unklare Richtung. `Gemischt` konnte wie ein ausgeglichenes Urteil erscheinen, obwohl der gespeicherte Text nur Unsicherheit beschrieb. Im Folgencheck fehlte zudem der Bezugsraum.

Audit auf `fbc795232b`: 161 aktive veröffentlichte Einzelakten, 483 MPD-Felder. 102 fehlende Richtungsfelder in 34 Akten wurden als offen dargestellt. 258 Felder erschienen insgesamt offen (102 Fallbacks, 83 explizite Basiswerte, 73 Legacy-Werte); 118 gemischt. Im Validator bestanden fehlende/ungültige Tendenzen, leere Begründungen und ein nur mit Unsicherheit begründetes `gemischt` den Test. Diese Zahlen sind eine Momentaufnahme, keine Medienqualitätsbewertung.

## Umsetzung

- Gemeinsame Darstellung für Übersicht und Detail: `Noch nicht eingeordnet`, `Kein belastbarer Wirkpfad`, `Wirkungsrichtung unklar` und `Keine belastbare Gesamtbilanz` sind unterscheidbar. Keine dieser Kennzeichnungen bedeutet neutral oder unbedenklich.
- Begründete gegenläufige Pfade erscheinen als solche, ausdrücklich ohne Verrechnung. Vorliegende positive und negative Richtungen werden nicht aus Thema, Partei oder Relevanz umgedeutet.
- Neues versioniertes Kurzformat `direction_assessment_version: 1.0`. MPD-Felder enthalten Tendenz, `direction_basis` und substanzielle Begründung. Gemischt verlangt getrennte `positive_path` und `negative_path` mit Mechanismus und gültigen Quellen-IDs. Quellenbindung belegt den Ausgangspunkt, nicht automatisch die Kausalität des Wirkpfads.
- Frische akzeptierte Nachrichtenantworten müssen den Vertrag erfüllen. Fehler gehen in den vorhandenen begrenzten Qualitäts-Retry, nicht in eine neue kostenpflichtige Verarbeitungsschleife. Redaktionelle Ablehnungen bleiben Ablehnungen. Der Vertrag verhindert Formfehler; die inhaltliche Richtigkeit kann ein Schema allein nicht garantieren.
- Eintritt, Ausmaß, Evidenz und Richtung werden in Nachrichten- und Analyseprompts getrennt. Schutzplanken, Unsicherheit und formale Verfahren sind keine automatisch positiven Gegenpfade. Auch ein gemischtes Autorenurteil benötigt konkrete positive Pfade im vorhandenen Qualitätsgate.
- Neue Einzelpfad-Metadaten benennen betroffene MPD-Dimensionen. Der Folgencheck erklärt positiv/negativ anhand der konkreten Zustandsveränderung; Wirkungsordnungen 1 bis 3 sind keine MPD-Dimensionen. Fehlenden historischen Einzelurteilen wird kein `Richtung: Offen`-Badge mehr untergeschoben.
- Doppelte Promptbeschreibungen wurden gestrafft. Das 39.000-Zeichen-Gate, Quellenbestand und Kostenlimits bleiben unverändert. Der Regressionstest mit 21 realen Quellen und wachsendem Vergleichskontext besteht weiterhin, bei Bedarf ohne optionale neue Visuals.

## Konkrete Leserfälle

### Huthi-/Saudi-Arabien-Meldung (`d4f421`)

Die gespeicherte MPD-Gesamtbewertung ist negativ. Einzelpfadbewertungen fehlten dagegen; der Renderer zeigte dort ungeprüfte Offen-Badges. Korrektur: keine erfundenen Einzelurteile, verständlicher Bezug auf konkrete Folgen und ein gemeinsamer Hinweis auf noch nicht gesondert bewertete Einzelpfade.

### Westjordanland/Sanktionen (`1a5ae1`)

Ein einzelner taz-Beitrag beschreibt eine Eilantragsentscheidung zum E1-Projekt und britische Sanktionspläne. Kein vom Ticker verursachter Cluster-Merge. Die gespeicherten gemischten MPD-Begründungen trennen positive und negative Mechanismen nicht belastbar; die Darstellung behauptet deshalb keine ausgeglichene Bilanz. Maßnahme und Gegenmaßnahme sind getrennt zu bewerten; eine Ankündigung ist noch kein wirksamer Ausgleich. Keine automatische Aufspaltung oder neue Tatsachenbewertung ohne gesonderte redaktionelle Quellenprüfung.

## Chrome-Scrollfehler

Reproduziert mit echten Mausrad-Ereignissen in Chromium auf der Huthi-Detailseite. Bei aktivem Pull-to-refresh lag `overscroll-behavior-y: contain` sowohl auf `html` als auch `body`. Zusammen mit dem vorhandenen `overflow-x:hidden` erzeugt Chromium einen Body-Scrollcontainer ohne eigenen vertikalen Scrollbereich. Die Body-Regel blockierte die Weiterleitung zum Viewport: 600 Pixel Mausraddelta, Scrollposition weiterhin 0. Nur die Body-Regel auf `auto` geändert: gleiche Seite, gleiches Ereignis, Scrollposition 600. Zurück auf `contain`: wieder 0.

Korrektur: Overscroll-Begrenzung bleibt am Wurzelscroller; der Body leitet Scrollen weiter. Kein neuer Wheel-Handler, kein Eingriff in die Gestenerkennung. Pull-to-refresh, Tastatur-/Schaltflächenalternative, Abbruch, Offline-Schutz und Touch-Schutzregeln werden weiterhin getestet. Das konkrete Gerät der meldenden Person war bei diesem Test nicht bekannt.

## Historische Daten, Betrieb und Prüfung

Die Änderung betrifft Darstellung, Prompt und Gates, nicht die gespeicherten Urteile oder Artikeltexte. Keine KI-Neuanalyse, keine neuen Quellen, keine Budgetänderung, kein Stoppen des Nachrichtenworkers. Quelldaten auf Implementierungsbasis `f846d9bbf77daf7bc9956eb4198f884ee514f9a4` unverändert:

- `data/news/stories.json`: SHA-256 `d2ed269c998c6ce274b8ad68c67ea0d976069b05c1243a320bdc636bf6cd912c`
- `data/news/editorial-analyses.json`: SHA-256 `42dea0efaee540c609d38721d15bb220c4c750f12613c1bc2c1efeaacbc27f11`

Automatisierte Prüfungen: Nachrichten-/Betriebsmonitor-Suite, Syntaxprüfung, Registry-/Nachrichtenvalidierung, Artikelgenerator, vorhandener Language-Lint (25 bereits bestehende Befunde, keine neuen). Browserprüfung: betroffene Detailseiten, Übersicht, Standard-/Sonderanalyse, Desktop und 320/390-Pixel-Mobile, interne Navigation und echtes Mausrad. Öffentliche Generierung über den bestehenden Pages-Releaseweg, keine Vercel-Builds.

## Technische Nachkontrolle: Ausgabevorlage am selben Tag

Der Produktionslauf vom 08.09.2026, 14:52 UTC, meldete unter anderem `AI_DIRECTION_MIXED_PATHS_REQUIRED`. Die Nachprüfung zeigte eine Diskrepanz: Der Regeltext und das Gate verlangten getrennte Pfade, die tatsächliche JSON-Ausgabevorlage enthielt aber weder `positive_path` noch `negative_path`. Das ist ein vermeidbarer Schemahinweisfehler, nicht der Nachweis, dass jede zurückgestellte Antwort inhaltlich veröffentlichungsfähig war. In denselben Antworten fehlten zum Teil weiterhin Zahlenbelege oder passende Textlängen.

Die gemeinsame `NEWS_DIMENSION_SCHEMA` zeigt jetzt beide Pfade samt `mechanism` und `source_ids` für alle drei Dimensionen. Nur bei `gemischt` sind diese auszufüllen; sonst bleiben beide `null`. Es werden keine positiven Gegenargumente erzwungen. Das Qualitätsgate, der Quellenbezug und die Behandlung historischer Texte bleiben unverändert.

Zwei neue Regressionstests prüfen die tatsächliche JSON-Vorlage mit und ohne optionale Visuals; beide scheiterten vor der Korrektur und bestehen danach. Prüfung insgesamt: 618 Nachrichtentests und 26 Betriebsmonitortests, Syntaxprüfung, Nachrichten-/Registryvalidierung und Ticker-Build erfolgreich. Der Language-Lint zeigt dieselben 25 bestehenden Befunde. Eine gleichbedeutende Straffung des Materialitäts-Regeltextes hält auch die 21-Quellen-Regression unter 39.000 Zeichen; kein Quellen-, Evidenz-, Sicherheits- oder Kostengate wurde reduziert. Keine zusätzliche kostenpflichtige Testanfrage, kein manueller Backfill, keine Änderung an Queue oder Kostendaten. Da ausschließlich die künftige Modell-Ausgabevorlage geändert wurde, bleibt die zuvor visuell geprüfte Darstellung unverändert.

### Nachprüfung der tatsächlichen Antwortform

Die regulären Folgeläufe scheiterten weiter an `AI_DIRECTION_PATH_SOURCE_INVALID`, auch bei nicht gemischten Dimensionen. Eine ausschließlich auf Feldtypen, Längen und Anzahlen begrenzte Diagnose wurde mit `165d6d61f4` ergänzt. Sie speichert keine Modelltexte, Quellen-IDs oder frei benannten Modellfelder. Der reguläre Lauf `34248903834` (Beginn der Nachrichtenprüfung 16:06:50 UTC) zeigte zwei Formen: leere Objekte `{mechanism:"",source_ids:[]}` für nicht benötigte Pfade und substanzielle Mechanismen mit nicht als Quellen-ID erkannten Referenzen. Die erste Diagnose beweist noch nicht, welche Referenzart hinter diesen Kennungen steht.

Die Verarbeitung normalisiert ausschließlich exakt leere Pfadobjekte bei nicht gemischten, aktuellen Bewertungen zu `null`. Gemischte Bewertungen benötigen weiterhin beide substanziellen Pfade. Nichtleere Mechanismen, Verweise, Zusatzfelder, unvollständige Objekte und historische Bewertungen werden dabei nicht entfernt oder umgedeutet.

Der vorhandene Belegresolver kann nun auch eine Pfadreferenz auf ihre Quelle zurückführen, wenn die Kennung im tatsächlich gesendeten Paket enthalten war und im Katalog genau dieser Story auflösbar ist. Keine Zuordnung aus Präfix, Quellennamen, geratenem Index oder fremder Story. Bei nur teilweise bekannten Referenzen bleibt der gesamte Pfad unverändert fehlerhaft. Mehrere Textstellen derselben Quelle ergeben weiterhin nur eine Quelle; Mechanismus, Richtung und Evidenzgrad bleiben unverändert. Die Vorlage benennt beide zulässigen Referenzformen. Die unveränderte Quellen-/Richtungsvalidierung entscheidet anschließend erneut.

`direction_transport` protokolliert nur normalisierte Feldnamen und Anzahlen tatsächlich gelieferter, aufgelöster und unbekannter Verweise. Damit muss der nächste reguläre Produktionslauf bestätigen, ob dieser exakt gebundene Transportfall die beobachteten Verweisfehler erklärt. Ein erfolgreicher lokaler Test ist noch keine Entwarnung für den Publikationsbetrieb. Vier weitere Regressionstests sichern leere optionale Felder, unveränderte Pflichtbelege, requestgebundene Auflösung, Unbekanntes, nicht gesendete und fremde Verweise ab. Keine zusätzlichen bezahlten Probeaufrufe, kein manueller Retry-Reset und keine Änderung an Budget, Queue oder Artikeldaten.

Prüfung dieses Korrekturschritts: 649 Nachrichten-/Betriebsmonitortests bestanden, einschließlich der 21-Quellen-Paketgrenze; Syntax-/Typecheck, Registry-/Nachrichtenvalidierung und Ticker-Build erfolgreich. Language-Lint: unverändert 25 bestehende Befunde. Der Generator erzeugt keine Änderung an den öffentlichen Seiten; keine erneute Bildgenerierung oder inhaltliche Umschreibung.
