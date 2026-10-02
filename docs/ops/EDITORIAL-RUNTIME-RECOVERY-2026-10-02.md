# Redaktionsrueckmeldung und Nachrichtenfilter: 2. Oktober 2026

## Belegter Ausgangszustand

Der Diagnose-Lauf [36966010163](https://github.com/sustynats/wirkungsoekonomie.de/actions/runs/36966010163)
meldete am 02.10.2026 gegen 04:46 UTC `BRIDGE_RUN_LOCKED` fuer die Importspur.
Die Bridge meldete gleichzeitig `process_holds_lock=false`, `owner=null` und
`acquired_at=null`. Damit ist der haltende Prozess noch nicht identifiziert;
eine Freigabe nach Alter oder ein Loeschen der SQLite-Sperrdatei waere unzulaessig.

Der Redaktionslauf 36965222155 uebersprang die Verarbeitung deswegen. Auch die
Publikationsquittung in Nachrichtenlauf 36963037347 wurde uebersprungen. Beide
Workflows konnten dennoch gruen enden. Die im alten Bridge-Monitor aufgefuehrte
historische Nachrichtenwarteschlange ist nicht die Warteschlange des heutigen
API-Direktbetriebs und darf nicht als aktueller Rueckstau ausgegeben werden.

Die beiden beanstandeten Sendungsanalysen sind bereits oeffentlich erreichbar:

- `/wirkungsticker/analyse/nachgesehen-zwischen-rentenstreit-parteikrise-und-kriegsalltag-1331ef/`
- `/wirkungsticker/analyse/maischberger-berliner-regierungsfahigkeit-wirtschaft-und-der-kriegswinter-5fa572/`

HTTP 200 und die zur gespeicherten Publikationsfassung passenden Inhaltshashes
wurden am 02.10.2026 geprueft. Die Anzeige "Wird veroeffentlicht" belegt hier
eine fehlende Rueckmeldung an die private App, nicht eine fehlende Live-Seite.
Diese Texte werden durch die Prozesskorrektur nicht umgeschrieben.

## Korrekturen im bestehenden Prozess

- Der Betriebsmonitor liest und schreibt seine Beobachtungen unter einer eigenen
  kurzen Import-Sperre. Bisherige Zugriffe ohne Eigentuemerschaft konnten scheitern
  und wurden als leere, gesunde Warteschlange behandelt. Ein nicht lesbares Journal
  ist jetzt ein eigener, entprellter Betriebsfehler. Es gibt dabei keine falschen
  Nullmeldungen zu haengenden Freigaben oder erschoepften Auftraegen.
- Die Sperre wird nicht ueber externe Erreichbarkeitspruefungen oder den Versand
  von Statusmeldungen gehalten. Fehler geben nur die eigene Spur frei.
- Ein wegen technischer Blockade uebersprungener Redaktionslauf endet mit Fehler.
  Die unabhaengige Kandidatensuche darf vorher fertiglaufen. Ein bereits erledigter
  identischer Laufplatz bleibt eine harmlose, idempotente Wiederholung.
- Ausbleibende Publikationsquittungen erscheinen als Workflow-Warnung. Sie stoppen
  nicht den hiervon unabhaengigen normalen Nachrichtenlauf.

## Drohnenregiment als beobachteter Nachrichtenfall

Im geprueften Stand `33bc75829445cd709e1c88845d288d1f51548831` lagen vier
unveroeffentlichte Kandidaten zur gleichen Ankuendigung vom 01.10.2026 vor.
Der fuehrende Kandidat wartete mit `AI_HOURLY_CALL_LIMIT`; drei Fragmente standen
unter `EDITORIAL_RELEVANCE_BELOW_THRESHOLD`. Das ist kein fehlender Quellenabruf.

Die Ankuendigung betrifft eine geplante Aufstellung im Jahr 2027, nicht eine
bereits einsatzbereite neue Einheit. Die bestehende Quellen-/Claimpruefung bleibt
fuer die Ausarbeitung verbindlich.

Der allgemeine Filter erkennt jetzt konkrete Aenderungen oeffentlicher
Kapazitaeten auch ohne Schadensereignis, Preisschild oder viele Berichte. Er
beruecksichtigt zuvor fehlende deutsche Institutionen und zusammengesetzte
Ministerbezeichnungen. Das erhoeht die Pruefprioritaet, nicht den Beweisstatus.
Besuche, Festakte und Rueckblicke erhalten diesen Kapazitaetsbonus nicht.

Die Ereignisidentitaet verbindet eine eindeutig benannte neue Formation mit
Institution und Ereignis-/Quellentag. Die vier Ankuendigungsfragmente koennen so
vor einer bezahlten Pruefung in der vorhandenen Ereignisakte zusammenlaufen.
Andere Formationen, Nummern, spaetere Stationierung, Einsatz, Kommentar und
Rueckblick bleiben getrennt. Die Originalquellen und bisherige Historie bleiben
erhalten. Eine neue Version des Relevanzfilters nutzt die bestehende begrenzte
Neupruefung, keinen zusaetzlichen Ingest oder kostenpflichtigen Sonderlauf.

Budgets, Stundenkontingente, Modelle, Freigaben, Lockregeln und Hosting sind
unveraendert. Die noch nicht produktiv freigegebene Cloud-Auswahl wird nicht
aktiviert.

## Offener operativer Abschluss

Der lesende Hostcheck hat den bisherigen Redaktionsserver als tatsaechlichen
Sperrhalter identifiziert (seit 14.09. laufende Fassung). Am 02.10.2026 um
05:38 UTC wurde ein privates konsistentes SQLite-/Konfigurationsbackup erstellt;
Integritaetspruefung und Wiederherstellung in eine zweite Datenbank waren erfolgreich.
Ein gezielter Neustart nur des Redaktionsservers um 05:39 UTC gab dessen eigene
Sperre frei. Die nachfolgenden Import-/Discovery-Slots wurden wieder abgeschlossen.
Keine Lockdatei wurde geloescht, kein fremder Besitzer enteignet, keine Freigabe erteilt.

Der gemeinsame Dropbox-Transport begrenzt nun die komplette Antwort einschliesslich
Body mit einer echten Deadline. Ein nicht reagierendes Fetch-/Body-Promise kann
die besitzende Spur nicht dauerhaft festhalten. Transportausfaelle erzeugen keine
redaktionelle Korrektur und verbrauchen keinen neuen bezahlten Versuch. Vorhandene
Antworten werden unveraendert erneut eingelesen. Mehrdeutige Schreibversuche werden
nicht automatisch wiederholt. Bestehende unveraenderliche Transportvertraege
bleiben bei einem Runtime-Upgrade erhalten; nur fehlende Versionen werden angelegt.
Der lokale Betriebsstatus zeigt Pollbeginn, Ende, Phase und den eigenen Lockbesitz.

Ein Merge ist noch kein Runtime-Deployment. Die aktualisierte Fassung muss als
commitgebundenes Artefakt mit ihren Abhaengigkeiten geprueft werden. Rueckfallziel
bleibt die vorherige Laufzeit; private Datenbanken und Zugangswerte werden nicht
mit Code ueberschrieben. Der temporaere, auf eine Quell-IP begrenzte SSH-Zugang
wird nach dem Eingriff wieder entfernt.

Danach muessen der normale Quittungslauf, die private Entwurfsbereitstellung,
die App-Vorschau und der weitere planmaessige Lauf tatsaechlich nachgewiesen
werden. Keine persoenliche Freigabe erteilen. Bereits oeffentliche Fassungen
werden lediglich quittiert; neu vorbereitete Entwuerfe warten auf die Autorin.

Der normale lokale Finalisierungs-Endpunkt hat anschliessend genau die zwei
bereits ausgelieferten Fassungen anhand ihrer HTML-Inhaltshashes quittiert
(`published: 2`, danach `pending: 0`). In der angemeldeten Redaktionsapp sind
beide Karten als "Veroeffentlicht" sichtbar. Das ist keine neue Textpublikation.

## Nachrichtenlauf: wachsender Einzelrecord

Der Lauf 36968509294 brach beim Speichern mit `NEWSROOM_RECORD_TOO_LARGE:stories`
ab. Die Geschichte `wt-0eb1ca5aac1439a2` hatte bereits vor diesem Lauf rund
8,33 MB inklusive 136 Versionen und 135 historischen Potenzialbewertungen.
Die naechste Fortschreibung ueberschritt das 8-MiB-Dateilimit. Dieses Limit
war faelschlich zugleich eine Grenze fuer den gesamten einzelnen Datensatz.

Der bestehende verlustfreie Part-Speicher kann jetzt auch einen grossen
Einzelrecord auf mehrere pruefsummengebundene JSON-Dateien aufteilen. Die
Speicherformatversion 2 wird nur dafuer verwendet; alte Manifeste bleiben lesbar.
Jede Datei bleibt unter 8 MiB. Rekonstruierte Records werden zusaetzlich mit
Gesamtlaenge und SHA-256 geprueft; ein 128-MiB-Leselimit verhindert unbegrenzte
Einzelallokationen. Exakte Git-Revisionswiederherstellung verwendet denselben
Decoder. Historien, Freigabehashes und oeffentliche Datenmodelle aendern sich nicht.
Keine Historie wird abgeschnitten und kein Artikel erneut generiert. Das ist
keine Erhoehung des Git-Dateilimits und kein neues Speichersystem.

Die neuen Regressionen pruefen echte Einzelrecords oberhalb 8 MiB, geteiltes UTF-8,
Reihenfolge, Objekt-/Arrayfelder, Wiederholbarkeit, beschaedigte/fehlende Teile und
Wiederherstellung aus genau einer Git-Revision. Erzeugte Testdateien bleiben lokal.

## Lokale Pruefungen

Am 02.10.2026 ausgefuehrt: `npm run news:test` mit 1768 bestandenen Tests,
`npm run typecheck`, `npm run lint` (Audit bestanden, vorhandene Befunde bleiben
ausgewiesen) sowie `git diff --check`. Die Regressionen decken Sperrenbesitz,
unlesbare Journale, Workflowfehler, Einzelquellenrelevanz, konservative
Zusammenfuehrung und Erhalt der Originaldaten ab. Diese Testdaten erzeugen keine
API-Kosten, Freigabe oder Publikation. `npm run news:build`, `npm run news:validate`
und `npm run check:hosting-cost` wurden ebenfalls erfolgreich ausgefuehrt.
Der Validator nennt weiterhin bestehende redaktionelle Hinweise zu Primaerbelegen
und einzelnen Ueberschriften; sie werden nicht als behoben ausgegeben. Der Build
ist lokal, kein Produktionsnachweis. Seine erzeugten Bestandsartefakte werden
nicht als inhaltliche Aenderungen in diesen Reparatur-Commit aufgenommen.

Nach den Transport- und Speicherergaenzungen erneut ausgefuehrt:
`npm run news:test` mit 1774 bestandenen Tests, gezielte Syntaxpruefungen und
`git diff --check`. Die vier gezielten Bridge-Testdateien bestanden mit 121
Tests, Speicher-/Publikationswiederherstellung mit 23 Tests. Kein bezahlter
Modellaufruf ist Bestandteil dieser Tests.
