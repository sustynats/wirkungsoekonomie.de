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
