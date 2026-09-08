# Bildungsanalyse Sachsen-Anhalt: Redaktion und Release-Pruefung

Stand: 8. September 2026.

## Inhalt und Architektur

- Neue, eigenstaendige `commentary`-Analyse mit rund 1.620 Woertern und einer klar getrennten persoenlichen Einordnung Natalie Webers (275 Woerter).
- Route: `/wirkungsticker/analyse/was-ein-schulabschluss-noch-wert-ist-wenn-bildung-abgebaut-wird/`.
- Geprueftes Redaktionspaket: `content/news/reviews/2026-09-08-bildung-abschluesse-sachsen-anhalt.json`.
- Bestehender Publisher, Analysenspeicher und Renderer; keine neue Publikationsarchitektur. Die Wahlnachricht bleibt unveraendert und verweist auf den eigenstaendigen Beitrag.
- `evidence_table` ist ein kleiner generischer Visualtyp: vier feste Spalten, quellengebundene Zeilen, explizite Richtung, Evidenz und bedingter Wirkpfad. Auf Mobile werden Tabellenzeilen zu Lesekarten. Semantische Tabellenrollen bleiben erhalten.
- Die bestehende Kaskadenvisualisierung und MPD-Bilanz werden wiederverwendet. Mensch und Demokratie: negativer Risikopfad; Planet: kein ausreichend konkreter Wirkpfad in dieser Untersuchung. Das ist keine neutrale Umweltbewertung des Parteiprogramms.
- Sechs offene Monitoringpunkte. Keine automatische Rueckdatierung, keine behauptete Umsetzung, keine KI-Neuanalyse vorhandener Artikel und keine zusaetzlichen Provideraufrufe.

## Quellen und Abgrenzungen

17 Quellenlinks wurden beim Abruf mit HTTP 200 bestaetigt. Die Originaldokumente wurden inhaltlich und an relevanten PDF-Seiten visuell geprueft. Fremde Volltexte werden nicht oeffentlich gespiegelt.

| Referenz | Gepruefte Fassung / Zweck |
| --- | --- |
| AfD-Regierungsprogramm | Im April 2026 beschlossen; Kapitel IV, insbesondere Einleitung und Nr. 3-5, 8-10, 15, 21-30. Persoenliche Ankuendigungen sind nicht automatisch Programmbeschluss. |
| KMK Oberstufe/Abitur | Fassung vom 6. Juni 2024; Bildungsziele, Qualifikationsphase und gegenseitige Anerkennung. |
| KMK Sekundarstufe I | Fassung vom 7. Oktober 2022; eigene Abschlussanforderungen und externe Pruefungswege. |
| KMK Deutsch ESA/MSA | Beschluss vom 23. Juni 2022, redaktionelle Korrektur 13. April 2023; Regelstandards, Argumentation und Medienkompetenz. |
| Grundsatzband und Geschichte Gymnasium Sachsen-Anhalt | Stand 1. August 2022, im aktuellen Landesportal gefuehrt; Quellenkritik, Perspektiven und Bildungsziele. Keine Behauptung ueber noch nicht veroeffentlichte neue Lehrplaene. |
| Schulgesetz Sachsen-Anhalt | Aktuelle Ministeriumsdatei mit letzter Aenderung vom 2. Dezember 2025; Abgleich mit KMK-Rechtsuebersicht. Foerderung, Schulsozialarbeit, Lehrmittel und Konferenzen. |
| Landesverfassung | Landtagsfassung vom 1. Juni 2026, letzte Aenderung vom 4. Mai 2026; Art. 25-29. |
| GEW, CORRECTIV, ARD, ZDF | Gewerkschaftsperspektive, zugeschriebene Fachbewertungen und dokumentierte Ministeriumsauskuenfte bleiben als solche erkennbar. Keine pauschale Uebernahme ihrer gesamten Bewertung. |
| SDG 4/10 und DNS | Normative Bildungs- und Teilhabereferenzen, kein Kausalitaetsnachweis und keine pauschale Uebertragung von Bundesrecht auf Landeslehrplaene. |

Die Analyse unterscheidet formale Anerkennung, tatsaechliche Gleichwertigkeit und die persoenliche, bedingte Forderung nach einer Anerkennungspruefung. Ein Regierungswechsel macht keine Zeugnisse ungueltig. Eine generell geringere Qualifikation kuenftiger Absolventinnen und Absolventen ist nicht nachgewiesen. Fehlende Unterstuetzung und verengte Lerngelegenheiten werden als begruendete Risiken behandelt.

Offen bleiben konkrete Gesetzes- und Lehrplanaenderungen, die Ausgestaltung des Hausunterrichts einschliesslich Qualifikation/Unterstuetzung/sozialem Lernen sowie spaetere Kompetenz- und Uebergangsbefunde. Halbjaehrliche Pruefungen und die vorgesehene Rueckkehr zur Schule werden ausdruecklich beruecksichtigt.

## Verifikation

- Publisher- und Quellenintegritaetsgate: bestanden; 17 Quellen, null Provideraufrufe.
- Bestehende 23 Analyse-Datensaetze, Kandidatenliste und Retry-State beim Hinzufuegen byteinhaltlich unveraendert.
- Gesamte Nachrichten-/Monitoring-Tests: 670 bestanden. Sechs Tests sichern diesen Beitrag, Quellennachweise, Tabellenvalidierung, HTML-Escaping, Navigation, persoenliche Einordnung und mobile Spaltenbreiten ab.
- Typecheck und Lint: bestanden. Die 25 bereits bestehenden Language-Audit-Hinweise werden durch diesen Beitrag nicht erhoeht.
- Umfragetests: 41 bestanden. Nachrichtenvalidierung nach Integration der parallelen Nachrichtenlaeufe: 76 Quellen, 200 veroeffentlichte Storys, 579 Laufberichte.
- Browserpruefung bei 1440, 390 und 320 Pixeln: Tabellenansicht/Lesekarten, Kaskade, persoenliche Einordnung, Uebersicht-zu-Analyse und Rueckweg zur Ursprungsgeschichte; keine horizontalen Ueberlaeufe, defekten internen Anker oder Browserfehler. Ein dabei gefundener CSS-Spezifitaetsfehler wurde vor dem Release korrigiert und als Regressionstest aufgenommen.
- Vollstaendiger bestehender GitHub-Pages-Artefaktbuild bestanden: 0 defekte interne Links, Methoden-/Versionsindexierung, Datenschutz (19.405 Textdateien), Dateigroesse (829,9 MB) und bestehende Publikationspruefungen. Keine Hosting- oder Budgetregeln geaendert.
- Bestehende Hambacher-Forst-Standardanalyse bei 320 Pixeln als Regression geoeffnet: vollstaendig erreichbar, keine neue Tabellenkomponente eingeschleust, kein horizontaler Ueberlauf und keine Browserfehler.

## Betriebsschutz

Die waehrend der Recherche eingegangenen automatischen Nachrichtencommits werden vor dem Release integriert. Kein Ueberschreiben des Nachrichtenbestands, der Nutzungskosten, der Quellenregistry oder laufender Jobs. Oeffentliche HTML-, Feed- und Suchdateien entstehen ausschliesslich aus den bestehenden Generatoren. Globale Footer-Normalisierung bleibt Teil des bestehenden Artefaktbuilds und ist keine eigenstaendige inhaltliche Aenderung dieses Auftrags.

## Nachtrag: Version 2, professionelle Lehrkompetenz

Die Angaben oben dokumentieren die Erstveroeffentlichung. Der beauftragte Nachtrag vom 8. September ergaenzt den bestehenden Beitrag, ohne die Erstfassung still zu ersetzen.

- Neuer Abschnitt direkt nach den Bildungszielen: Fachwissen, Fachdidaktik und paedagogisch-psychologisches Wissen; ausdruecklich illustriertes Bruchrechenbeispiel, kein Studienfall. Kognitive und methodische Kompetenzen werden als Bestandteil fachlicher Bildung erklaert.
- KMK-Standards, Beschlussfassung 07.10.2022: Kompetenzen 1-3 auf S. 7-8 sowie 7-8 auf S. 12-13 am PDF geprueft. Die aktuelle offizielle Uebersicht verlinkt weiterhin diese Fassung und beschreibt fuer 2026 eine Fortschreibung, nicht deren bereits beschlossene Ersatzfassung.
- Baumert et al. (2010), DOI `10.3102/0002831209345157`: Original-Abstract beim Verlag und bibliografischer Nachweis des Max-Planck-Instituts geprueft; institutseigener Forschungsbericht bestaetigt den Befund. Einjaehriger Laengsschnitt im Mathematikunterricht deutscher zehnter Klassen. Kein Eltern-/Schulunterrichtsvergleich und kein Kausalbeweis fuer formale Abschluesse allein.
- Abschnitt IV.26 des Programms: gleiche Qualitaetsstandards, halbjaehrliche zentrale Pruefungen und Rueckkehr bei Rueckstaenden bleiben erhalten. Nicht ausgefuehrte Qualifikation, Begleitung, laufende Diagnose und soziale Lerngelegenheiten werden nicht als ausdruecklich ausgeschlossene Angebote dargestellt.
- Acht Tabellenzeilen, sieben offene Monitoringpunkte. Qualifikation der Unterrichtenden, Qualitaet/Breite des Lernprozesses und nachgewiesene Schuelerkompetenzen werden getrennt geprueft.
- Wiederholungen gestrafft: rund 1.830 Woerter, neun Minuten berechnete Lesezeit. Die persoenliche Einordnung umfasst weiterhin 250-350 Woerter und lehnt eine unveraenderte Gleichstellung bei nachweislich systematisch unterschrittenen Anforderungen klar ab. Keine pauschale Abwertung heutiger Zeugnisse oder Jugendlicher.
- Bestehender Publisher schreibt Version 2 mit vollstaendigem `previous_content`, identischer Analyse-ID, Route und Erstveroeffentlichungszeit. Vergleich gegen den vorherigen Datensatz bestaetigt unveraenderte weitere Analysen, Kandidaten und Retry-Queues.

### Quellen- und Technikpruefung des Nachtrags

- 20 Quellen insgesamt: 19 antworten bei der erneuten direkten Linkpruefung mit HTTP 200. Der DOI fuehrt zur korrekten SAGE-Publikation, deren direkter automatisierter HEAD-Abruf mit 403 beantwortet wird; der oeffentliche Original-Abstract war ueber die Verlagsindexierung zugaenglich. Kein Volltextzugriff behauptet, keine Sperre umgangen und keine neue automatische Quelle aktiviert.
- Monatsgenaue Zeitschriftenangaben werden jetzt als `März 2010` ausgegeben, nicht mit einem erfundenen ersten Monatstag. `month_only` verlangt einen gueltigen Jahres-/Monatswert; Tagesdaten und undatierte Quellen bleiben kompatibel.
- Zehn beitragsspezifische Tests bestehen: neue Quellen und Abschnittsreihenfolge, Forschungsscope, Hausunterrichtskontrollen, Meinung, Monatsdatum, Versionsarchivierung, Tabellenvalidierung und mobile Semantik. Vollstaendige Nachrichten-/Monitoring- und Umfragetests, Typecheck, Syntaxpruefung der geaenderten Module und Lint bestanden; weiterhin 25 bestehende Language-Audit-Hinweise.
- Vollstaendiger Pages-Artefaktbuild bestanden: 0 defekte interne Links, Publikations-/Methodenpruefungen, Datenschutz (19.407 Textdateien), Groessengate (830,0 MB). Keine Hosting-, Budget- oder Workflow-Aenderung.
- Browserpruefung am fertigen Artefakt: 1440, 390 und 320 Pixel; neuer Abschnitt einschliesslich Bruchzeichen, neue Tabellenzeile, persoenliche Einordnung und Versionshinweis. Bei 320 Pixeln 288 Pixel Tabellenzeile und 286 Pixel Zeilenkopf, kein horizontaler Ueberlauf. Keine Browserfehler oder defekten internen Anker. Uebersicht -> Analyse -> Ursprung -> Analyse-Verweis geprueft.
- Automatische Nachrichtencommits bis `3feb7aaaa2` vor dem Push integriert. Das Produktionsartefakt wird anschliessend von der bestehenden seriellen GitHub-Pages-Pipeline aus dem gepushten Commit gebaut und geprueft. Die globale lokale Build-Normalisierung ist separat wiederherstellbar gesichert, nicht als unbeteiligte Website-Aenderung eingecheckt.

Der angesprochene TTS-Kurzfassungs-Pilot ist eine getrennte Produktueberlegung und nicht Teil dieses Releases. Es wurden weder Audiojobs noch zusaetzliche kostenpflichtige Modellaufrufe gestartet.
