# Asset Selection

Quelle: `assets/img/ASSET-INVENTORY.md`

Stand: 2026-05-17

Ziel dieser Auswahl ist eine ruhige, eigenständige Website-Ästhetik. Die Buchgrafiken bleiben Quellenpool. Für die erste Website-Version werden nur wenige Assets direkt eingesetzt; textdichte Diagramme werden als Webgrafiken neu gebaut.

## Kuratierte Auswahl für Version 1

| Asset | Entscheidung | Begründung | Geplanter Einsatz |
| --- | --- | --- | --- |
| `book/cover.jpg` | direkt verwenden | Zentrales Buchcover, visuell hochwertig, markenprägend und notwendig für die Buch-Landingpage. | Buch-Landingpage Hero, Buchkarte auf Startseite, Downloadkarte |
| `book/image10.png` | ggf. direkt verwenden | Ruhige, markennahe Übersichtsabbildung „Die einfache Idee“; trotz Text noch editorial brauchbar, wenn groß dargestellt. | Optional auf Startseite oder Buch-Landingpage als große Abbildung |
| `book/image11.png` | ggf. direkt verwenden | Mensch-Planet-Demokratie-Dreieck ist visuell klarer als viele andere Buchgrafiken und passt zum Kernmodell. | Optional auf Wirkungsökonomie-Seite, nur groß und nicht als kleine Karte |
| `book/image24.jpeg` | nur archivieren, Text separat nutzen | Rückcover ist stimmungsvoll, aber als Bild auf der Website weniger nützlich als der extrahierte Text. | Archiv; Zitat und Klappentext später als HTML-Text setzen |
| `book/image2.png` | als Vorlage für Webgrafik nachbauen | Inhaltlich wichtig, aber extrem dicht und nicht mobil geeignet. | Vorlage für Modellübersicht „Das Modell auf einen Blick“ |
| `book/image4.png` | als Vorlage für Webgrafik nachbauen | Starkes Anwendungsbeispiel, aber für Web besser in einzelne Vergleichs- und Scorecard-Komponenten zerlegen. | Vorlage für Anwendungen/Produkte und Preise |
| `book/image22.png` | als Vorlage für Webgrafik nachbauen | Zentrales Wirkungsrad, aber direkt als Bild zu komplex. | Vorlage für Modellseite, ggf. später interaktiv/abschnittsweise |
| `book/image23.png` | als Vorlage für Webgrafik nachbauen | Sehr geeignete Prozesslogik von Daten zu Transformation, aber visuell besser als responsive Webgrafik. | Vorlage für Modellseite und Anwendungen |

## Empfohlene direkte Assets

Direkt verwenden:

- `assets/img/book/cover.jpg`

Optional direkt verwenden, wenn die Abbildung groß, ruhig und mit ausreichend Weißraum eingebettet wird:

- `assets/img/book/image10.png`
- `assets/img/book/image11.png`

Nicht direkt als kleine Cards, Thumbnails oder dekorative Streubilder verwenden.

## Assets nur als Vorlage

Diese Assets sind fachlich wertvoll, sollen aber für die Website neu als responsive Webgrafiken aufgebaut werden:

- `assets/img/book/image2.png` - Gesamtmodell der Wirkungsökonomie
- `assets/img/book/image3.png` - Alter Kompass vs. neuer Kompass
- `assets/img/book/image4.png` - Apfelbeispiel, Scorecard, Steuerklassen
- `assets/img/book/image5.png` - Alte vs. neue Ordnung
- `assets/img/book/image6.png` - Maßstabskrise
- `assets/img/book/image8.png` - Entstehung des falschen Kompasses
- `assets/img/book/image12.png` - Definition und Dimensionen von Wirkung
- `assets/img/book/image13.png` - Wirkungspotential-Skala
- `assets/img/book/image14.png` - Handlung, Unterlassen und Rückkopplung
- `assets/img/book/image15.png` - Wirkungsträger, Wirkungsempfänger und Wirkungsräume
- `assets/img/book/image16.png` - Systemischer und normativer Wert
- `assets/img/book/image17.png` - Scheinleistung, Blindleistung, Verlustleistung, Wirkleistung
- `assets/img/book/image18.png` - Begriffssystem der Wirkungsökonomie
- `assets/img/book/image19.jpeg` - Abgrenzung zu anderen Modellen
- `assets/img/book/image20.png` - Wirkungsordnungen
- `assets/img/book/image21.png` - Nichttriviale Systeme
- `assets/img/book/image22.png` - Wirkungsrad
- `assets/img/book/image23.png` - Wirkungslenkung

## Nicht verwenden / archivieren

Diese Dateien bleiben im Archiv, sollen aber nicht als sichtbare Website-Grafiken eingeplant werden:

- `assets/img/book/image1.jpeg` - Duplikat von `cover.jpg`
- `assets/img/book/image7.jpeg` - ähnliche Aussage wie `image3.png`, als Buchgrafik brauchbar, aber für Website besser neu bauen
- `assets/img/book/image9.png` - Variante der Maßstabskrise, redundant zu `image6.png`
- `assets/img/book/image24.jpeg` - Rückcover, Text später als HTML statt als Bild verwenden

## Fehlende neue Webgrafiken

Für die erste hochwertige Website-Version sollten diese neuen Webgrafiken in `assets/img/generated/` entstehen:

1. `generated/hero-compass.svg` oder `.png`  
   Ruhige Hero-Grafik: Wirkung als Kompass, Mensch, Planet und Demokratie als drei Bezugspunkte. Keine Textwand.

2. `generated/mpd-triangle.svg`  
   Reduzierte Webfassung des Mensch-Planet-Demokratie-Dreiecks für Startseite und Wirkungsökonomie.

3. `generated/model-overview.svg`  
   Vereinfachte Modellübersicht mit Wirkungsrad, WÖk-ID, Scorecards, T-SROI, Wirkungssteuer, Wirkungsrat.

4. `generated/impact-feedback-loop.svg`  
   Rückkopplungsdiagramm: Wirkung sichtbar machen, bewerten, lenken, lernen.

5. `generated/old-vs-new-compass.svg`  
   Reduzierter Vergleich: Kapital als alter Kompass, Wirkung als neuer Kompass.

6. `generated/effect-scale.svg`  
   Wirkungspotential-Skala von -3 bis +3 als klare, responsive Webgrafik.

7. `generated/applications-matrix.svg`  
   Anwendungsmatrix für Unternehmen, Produkte, Staat, Wohnen, Arbeit, Medien, KI, Bildung und Lieferketten.

8. `generated/academy-path.svg`  
   Lernpfad der Akademie mit 6 bis 9 Modulen, ruhig und modular.

## Leitentscheidung

Die Website soll nicht wie ein Bilder-Export des Buchs wirken. Das Buchcover ist das zentrale direkte Asset. Alle komplexen Buchdiagramme dienen als inhaltliche und visuelle Vorlage für eigene, reduzierte Webgrafiken.
