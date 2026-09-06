# Release-QA-Checkliste - Wirkungsportal Parlament

**Geltung:** Jeder Produktions-Deploy. Der [Ökosystem-Vertrag](../../docs/ECOSYSTEM_PUBLICATION_AND_RELEASE_STANDARD.md) gilt ergänzend. Kein Punkt wird allein durch HTTP 200 als erfüllt betrachtet.

**Abnahme:** Institut für Wirkungsökonomie.

## P0 - unverzichtbare Release-Gates

| Prüfung | Abnahmebedingung | Nachweis |
| --- | --- | --- |
| Vollständigkeit | Jede als Fachakte, Wirkungscheck oder Analyse veröffentlichte Seite erfüllt den [Veröffentlichungsvertrag](PUBLICATION_CONTRACT.md). | Inhaltspfad-Prüfung und fachliche Sichtprüfung. |
| Keine Attrappen | Keine Platzhalter, allgemeinen Ankündigungstexte oder nichtssagenden Analyseabschnitte anstelle einer Fachakte. | Stichprobe aller neuen und geänderten Seiten. |
| Quellen | Jede entscheidungstragende Aussage, Zahl, Visualisierung und Formel ist erreichbar belegt; externe Links führen zunächst über eine Quellen-Detailseite. | Linktest und Quellenstichprobe. |
| Fachliche Trennung | Fakt, Wirkungspotenzial, Wirkungsrisiko, Beobachtung und normative Einordnung sind sichtbar getrennt. | Sichtprüfung je Seitentyp. |
| Faire Positionierung | Keine Seite suggeriert, Politik prüfe Folgen grundsätzlich nicht. Die WÖk wird als verbindende und erweiternde Wirkungsarchitektur neben bestehenden Fach-, Rechts- und Parlamentsverfahren erklärt. | `npm run check:positioning` und Sichtprüfung Startseite, Methodik, Transparenz. |
| Feststellung vor Bewertung | Zustandsveränderung, Gegenfaktum und Zurechnung sind von der normativen Bewertung getrennt; SDGs werden nicht als Messmethode dargestellt. | Sichtprüfung Methodik, Transparenz und Fallseiten. |
| Referenzrahmen | SDGs, SDG+ als WÖk-Erweiterung (nicht UN-Kategorie), Mensch - Planet - Demokratie und Recht sind getrennt erklärt. | `npm run check:positioning` und Referenzrahmen-Sichtprüfung. |
| Entscheidungsreife | „wirkungsbezogen noch nicht hinreichend entscheidungsreif“ wird nicht mit rechtlicher oder parlamentarischer Entscheidbarkeit verwechselt. | Komponenten- und Fallseitenprüfung. |
| Schutz vor Scheingenauigkeit | Keine frei geschätzten Werte, Gewichte, Zurechnungen oder quantitative Wirkungen ohne belastbaren Rechenweg. | Fachprüfung und Berechnungstest. |
| Nichtkompensation | Relevante Schutzgrenzen sind vor einer Gesamtbetrachtung sichtbar und können nicht weggerechnet werden. | Daten- und Seitentest. |
| Datenschutz und Veröffentlichungsreinheit | Keine lokalen Pfade, Zugangsdaten, internen Hinweise, nicht öffentliche Kommentare oder Hinweise auf Erstellungswerkzeuge in Inhalt, Metadaten, Downloads, HTML oder Assets. Die datensparsame Reichweitenmessung entspricht der Datenschutzerklärung. | `npm run privacy:check` und Release-Sicherheitsprüfung. |
| Funktion | Keine Client-Fehler, keine leere Seite nach Hydration, keine verdeckte Blockade durch CSP oder überlagernde Elemente. | Browsercheck: Body-Text vorhanden, Konsole fehlerfrei, Interaktionen getestet. |
| Barrierefreiheit | Automatischer WCAG-2.2-AA-Baselinecheck ist grün; Fokus, Tastatur, Namen/Rollen/Zustände und Textalternativen sind manuell geprüft. | `npm run check:accessibility` plus manuelle Stichprobe. |
| Build | Typen, Linting, Tests und Produktions-Build sind erfolgreich. | `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. |

## P1 - Seiten- und Nutzungstest

### Inhalt und Informationsarchitektur

- [ ] Die Startseite erklärt in der ersten Ansicht ohne Vorwissen: Was ist Wirkungsökonomie, was leistet das Portal, was ist der Nutzen und woran wird gemessen?
- [ ] Die aktuellste bzw. nächste relevante Entscheidung steht vor älteren Inhalten; die jüngsten abgeschlossenen Fälle führen verständlich in die Historie.
- [ ] Jede Fallseite beantwortet klar: Worum geht es? Was wird entschieden? Was soll erreicht werden? Was könnte sich verändern? Was bleibt offen?
- [ ] Bei noch veränderbaren Vorhaben sind Verbesserungspunkte und Bedingungen sichtbar, ohne eine Wirkung als sicher auszugeben.
- [ ] Historische Fälle trennen Wissen zum Entscheidungszeitpunkt von späteren Beobachtungen.
- [ ] Wahlprogramme und Koalitionsvertrag werden als eigene Wirkungsakten dargestellt - nicht als bloße Quellenregister und nicht als Partei-Ranking.
- [ ] Profile zeigen ausschließlich amtlich belegte Abstimmungsdaten; keine Personenwertung und keine rekonstruierten Stimmen bei nicht namentlichen Abstimmungen.
- [ ] Fachanalysen haben eine eindeutige Heimat, eine verständliche Einordnung, alle zugehörigen Visuals und einen geprüften Download.
- [ ] Jeder Glossarbegriff ist beim ersten Auftreten verständlich oder verlinkt erklärt.

### Gestaltung und Interaktion

- [ ] Design-Tokens sind die alleinige Quelle für Typografie, Farbwerte, Abstände, Raster, Komponenten- und Zustandsfarben (`npm run tokens:check`; Spezifikation unter `docs/parlament/design-tokens/`).
- [ ] Die aktuelle Token-Spezifikation wurde angewandt; keine lokalen Ausnahmen ohne dokumentierten Grund.
- [ ] Überschriften sind lesbar proportioniert; lange Amtstitel stehen als Metazeile, nicht als ungebrochene Hauptüberschrift.
- [ ] Navigation ist auf Desktop und Mobil vollständig erreichbar; es gibt kein abgeschnittenes, scrollbar verschachteltes oder iframe-artiges Mehr-Menü.
- [ ] „Mein Wirkungsraum“, Suche, Merken, Moduswechsel und Rückweg zwischen Unterportalen funktionieren erwartbar.
- [ ] Karten, Diagramme, SDG-/SDG+-Kacheln und Icons ergänzen den Inhalt; sie duplizieren nicht unlesbar denselben Text.
- [ ] Ein geöffnetes Detailpanel nutzt die verfügbare Breite, bleibt bei 200 % Zoom lesbar und erzeugt keine horizontale Scrollleiste.
- [ ] Jede Visualisierung hat Alternativtext, Datenquelle und eine Textdarstellung desselben Inhalts.

### Responsivität und Zugänglichkeit

- [ ] Geprüft bei mindestens 375 px, 768 px und 1440 px Breite.
- [ ] Geprüft bei 200 % Browser-Zoom und ohne Hover.
- [ ] Alle Bedienelemente sind per Tastatur erreichbar, haben sichtbaren Fokus und ein Ziel von mindestens 44 × 44 CSS-Pixeln, soweit die Komponente dies zulässt.
- [ ] Keine Information ist ausschließlich über Farbe, Position, Animation oder ein Icon vermittelt.
- [ ] Kontrast, Überschriftenhierarchie, Landmarks, Formularbeschriftungen, Fehlermeldungen und ARIA-Zustände sind geprüft.
- [ ] Bewegte Inhalte respektieren reduzierte Bewegung.

### Recht, Daten und E-Mail

- [ ] Impressum und Datenschutz sind im Footer erreichbar und bilden die tatsächlich eingesetzten Funktionen ab.
- [ ] Registrierung für Wirkungsradar-Updates nutzt bestätigte Anmeldung, dokumentierte Einwilligung und einen einfachen Abmeldelink.
- [ ] Eingabedaten werden nur für den ausdrücklich genannten Zweck verarbeitet; keine politische Profilbildung.
- [ ] Namentliche Abstimmungen werden ausschließlich aus amtlichen Daten dargestellt; bei anderen Abstimmungen keine Individualzuordnung.
- [ ] Bildrechte, Lizenzen, Quellenrechte und Alternativtexte sind je Bild oder Grafik dokumentiert.

## P2 - technische Regression und Produktionsabnahme

- [ ] Suchindex und Suchfilter enthalten neue öffentliche Seiten und Quellen.
- [ ] Neue Seiten sind in Navigation, Sitemap, Footer und internen Querverweisen erreichbar.
- [ ] Alle Links, Downloads, Quellen-Detailseiten, RSS-Links und Formular-Endpunkte liefern erwartete Ergebnisse.
- [ ] Die strenge CSP lässt alle notwendigen Seiteninhalte laden und blockiert keine notwendige Hydration.
- [ ] Caches und Versionsstände führen nach Deploy zu der geprüften Fassung.
- [ ] Der Produktionscheck prüft mindestens Startseite, Navigation, Suche, eine anstehende Entscheidung, eine historische Entscheidung, einen Quellensteckbrief, eine Fachanalyse, eine Länder-Startseite und Datenschutz.
- [ ] Browser-Konsole dieser Seiten enthält keine Fehler; sichtbarer Body-Text ist größer als null.
- [ ] Die öffentlich ausgelieferten Dateien werden erneut auf Veröffentlichungsreinheit geprüft.

## Freigabeprotokoll

Ein Release wird mit folgenden Angaben dokumentiert:

| Feld | Eintrag |
| --- | --- |
| Release-Version |  |
| Prüfdatum |  |
| Geprüfte Produktions-URL |  |
| Fachliche Freigabe |  |
| Technische Freigabe |  |
| P0-Befunde |  |
| P1-Befunde und Frist |  |
| Durchgeführte Kommandos |  |
| Geprüfte Seitentypen |  |

**Freigaberegel:** P0 = 0. P1-Befunde dürfen nur mit sichtbarer, dokumentierter Entscheidung und Termin bestehen bleiben. Andernfalls wird nicht veröffentlicht.
