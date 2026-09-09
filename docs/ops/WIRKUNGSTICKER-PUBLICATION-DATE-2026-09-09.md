# Fehlende Datumsangaben aus Bundestags-Themenfeeds

Stand: 9. September 2026. Metadatenkorrektur ohne kostenpflichtige KI-Testaufrufe oder Budgetaenderung.

## Befund

Die offiziellen Themenfeeds `umwelt.rss` und `wirtschaft.rss` liefern HIB-Meldungen ohne `pubDate` oder `dc:date`. Der allgemeine HIB-Feed liefert Datumsangaben, enthaelt aber nicht dauerhaft dieselben Meldungen. Die Originalseiten tragen dagegen ein Datums-Metafeld und eine sichtbare Artikelangabe. Drei wartende Akten waren ausschliesslich deshalb mit `SOURCE_PUBLICATION_DATE_INVALID` gesperrt; eine davon umfasst zwei Originalseiten.

## Begrenzte Nachpruefung

- Ein explizites, validiertes Registerprofil ist nur fuer die drei bestehenden amtlichen Bundestags-RSS-Quellen aktiv. Es erteilt keine neue Artikelzugriffsberechtigung.
- Nur schon entdeckte HTTPS-HIB-Originaladressen werden geprueft. Host, Dokumentpfad, endgueltige Adresse und exakte Artikelueberschrift muessen passen. Datums-Metafeld und sichtbare Artikelangabe muessen eindeutig uebereinstimmen. Abweichende Canonicals, ungueltige Kalenderdaten, zukuenftige Daten, Seitenfuss/Standangaben und Datumsangaben in Skripten oder Kommentaren genuegen nicht.
- Vorhandene Datumsangaben werden nicht ueberschrieben. Kalenderdaten bleiben mit `published_precision: day` ohne erfundene Uhrzeit gespeichert. Sie verwenden beim lokalen Eingang den begrenzten Rueckblick statt eines minutengenauen Feed-Cursors.
- Der vorhandene begrenzte HTML-Zugang wird wiederverwendet: Quellenfreigabe, Robots/RSL, DNS-/Hostpruefung, Weiterleitungs-, Zeit-, Groessen- und Paywallgrenzen bleiben erhalten. HTML wird nicht gespeichert.
- Hoechstens drei Originalseiten je Lauf, wartende Arbeit zuerst. Ein an URL und unveraenderten Quellenstand gebundener Metadatenbeleg wird wiederverwendet; erfolglose Versuche warten mindestens eine Stunde. Andere Fehlertypen und alle Publikationsgates bleiben unveraendert.
- Die Nachpruefung arbeitet auf Kandidatenkopien und einem additiven Cache in `state.source_publication_dates`. Historische Artikel, Quellenfassungen, Veroeffentlichungszeiten und Kostenjournale bleiben unveraendert. Die normale Redaktion entscheidet weiterhin ueber Aktualitaet, Evidenz und Materialitaet.
- `source_date_recovery` protokolliert Abrufe, verifizierte Angaben, Wiederverwendung, Holds und Zurueckstellungen. Ein verifiziertes Datum ist keine Publikation.

## Pruefbelege

Beim schreibfreien Originalseiten-Test lieferten die Dokumente `1210800` und `1210802` den 8. September sowie `1210692` den 7. September 2026. Zwei Akten bestanden danach die Quellenintegritaetspruefung; die weitere Originalseite der dritten Akte blieb nach Erreichen der Drei-Abrufe-Grenze unveraendert vorgemerkt.

Regressionen pruefen Datums-/Titel-/URL-Abgleich, Kalenderfehler, Metadaten in Skripten/Kommentaren, eingeschraenkte Zugaenge, unveraenderte historische Eingaben, Cache-Bindung, beschaedigte Cache-Eintraege, Wiederholungsabstand, Abruflimit, unveraendert wirksame weitere Integritaetsfehler und den gesamten Eingangspfad mit deaktivierter KI. Die bestehende Exzerptfunktion verwendet dieselbe Zugriffskontrolle wie zuvor.

Auslieferung ausschliesslich ueber den bestehenden GitHub-Nachrichtenworkflow, kein Vercel-Build. Die Korrektur loest weder die uebrigen KI-Ausgabe-Holds noch ein ausgeschoepftes separates API-Dienstbudget. Die produktive Anwendung muss im folgenden regulaeren Lauf nachgewiesen werden.

## Nachtrag: Anfuehrungszeichen im Titelabgleich

Am 9. September um 08:57 UTC wurde an der Originalseite `1211026` ein weiterer
technischer Hold reproduziert: Der Feed verwendet gerade Anfuehrungszeichen,
die H1-Ueberschrift typografische. Datums-Metafeld und sichtbares Artikeldatum
stimmen mit dem 9. September 2026 ueberein; der wortgleiche Titel wurde wegen
der Zeichensetzung trotzdem abgelehnt.

Der Identitaetsvergleich normalisiert jetzt nur die Typografie einfacher und
doppelter Anfuehrungszeichen. Woerter, Zahlen, Gross-/Kleinschreibung und das
Vorhandensein der Anfuehrungszeichen bleiben Teil der Pruefung. Es gibt weder
unscharfen Titelvergleich noch eine freie Suche nach einem passenden Datum.
Alle bisherigen URL-, Datum-, Quellen- und Zugriffsgates bleiben wirksam.

Negative Cache-Eintraege erhalten eine Parser-Revision: Ein Fehler des alten
Parsers verhindert nicht den ersten korrigierten Versuch. Weitere Fehlversuche
halten wieder den Stundenabstand ein; das gemeinsame Limit von drei Abrufen
pro Lauf bleibt unveraendert. Bereits verifizierte alte Metadaten werden ohne
erneuten Abruf weiterverwendet. Keine Kostenjournale oder Artikeltexte werden
veraendert.

Die beiden neuen Regressionen schlugen vor der Korrektur fehl und bestehen
danach. Der schreibfreie End-to-End-Test ueber den vorhandenen Artikelzugang
verifizierte das Tagesdatum der betroffenen Originalseite und beseitigte nur
deren Datums-Integritaetshold. Ein solcher Nachweis ersetzt nicht das weitere
journalistische Publikationsgate. Keine kostenpflichtige KI-Testanfrage.

Pruefstand: 696 News-/Monitor-Tests, Typecheck/Syntaxpruefung, Hosting-Kostengate,
News-Build und Bestandsvalidierung erfolgreich. Der Sprach-Lint lief durch;
seine 25 bereits vorhandenen Hinweise blieben unveraendert.
