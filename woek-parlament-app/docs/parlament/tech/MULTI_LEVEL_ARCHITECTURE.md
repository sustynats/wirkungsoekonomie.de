# Mehr-Ebenen-Architektur: Bund, Länder und Europa

Das Wirkungsportal Parlament ist ein Produkt für parlamentarische Politik auf
mehreren Ebenen. Der aktuelle öffentliche Startbereich ist der Deutsche
Bundestag. Das ist eine inhaltliche Startentscheidung, keine technische oder
methodische Begrenzung.

## Grundmodell

Jeder Fall gehört genau zu einem konkreten Parlament (`parliament_id`). Die
fachliche Prüfung bleibt überall gleich:

```text
amtliche Quelle → Entscheidungsgegenstand → Wirkungspotenzial und Risiken
→ Evidenz und Berechnung → normative Einordnung → Rückkopplung
```

Dadurch werden Bundes-, Landes- und EU-Fälle weder vermischt noch nach
unterschiedlichen Maßstäben bewertet. Unterschiede liegen in Zuständigkeit,
Verfahrensweg, Quellen und verfügbaren Daten – nicht in der Transparenz der
Prüfung.

| Ebene | Jurisdiction | Beispiele |
| --- | --- | --- |
| Bund | `federal` | Deutscher Bundestag, Bundestagswahl, Koalitionsvertrag |
| Länder | `state` | Landtage, Abgeordnetenhaus, Bürgerschaft, Landtagswahlen |
| Europa | `european_union` | Europäisches Parlament, EU-Gesetzgebungsverfahren |

`parliament.elections` bildet die Wahl als eigenen Kontext ab. Wahlprogramme
und spätere Koalitionsvereinbarungen sind damit eindeutig dem Parlament und der
Wahl zugeordnet. So kann die Kette **Programm → Vereinbarung → Entscheidung →
Umsetzung → Wirkung** auf jeder Ebene nachvollzogen werden.

## Navigation und öffentliche Sichtbarkeit

Die Portalmarke und die Datenstruktur sind mehrstufig. Die öffentliche
Navigation zeigt jedoch nur Ebenen mit überprüften, veröffentlichten Inhalten.
Leere Bereiche für Länder oder Europa werden nicht als scheinbar fertige
Wirkungschecks veröffentlicht.

Sobald die erste Ebene neben dem Bund Inhalte trägt, verwendet die Navigation
eine Ebene-Auswahl:

```text
Bund | Länder | Europa
```

Sie filtert dieselben Bereiche – Radar, Entscheidungen, Historie, Mandat &
Praxis, Monitor und Fachanalysen – nach Ebene. Bestehende URLs bleiben als
Bund-Standard erhalten; scoped URLs werden zusätzlich eingeführt. Eine
Ebenenauswahl verändert nie die Methodik oder das Ergebnis.

## Wahlprogramme: faire Abdeckung

Für eine anstehende Wahl beginnt die Arbeit mit einem geschützten
Primärquellenregister. Jeder Programmeintrag erhält Quelle, Fassung,
Abrufzeitpunkt, Hash und konkrete Fundstelle. Er wird erst nach
Quellen-/Fassungsprüfung veröffentlicht.

Umfragen dürfen nur die **interne Arbeitsreihenfolge** steuern. Sie sind weder
ein Parameter der Wirkungsbewertung noch ein Kriterium für öffentliche
Vollständigkeit. Öffentlich vollständig ist ein Wahlprogrammvergleich erst,
wenn alle amtlich zugelassenen Wahlvorschläge nach derselben Regel berücksichtigt
oder ihr Quellenstatus transparent ausgewiesen sind.

Wahlprogramme werden getrennt betrachtet als:

1. dokumentierte Zusagen und Ziele;
2. Wirkungspotenzial und Wirkungsrisiken der jeweiligen Zusage;
3. nach der Wahl: faktische Verbindung zu Koalitionsvereinbarung,
   Entscheidungen, Umsetzung und beobachteten Veränderungen.

Eine Zusage, eine Mehrheitschance oder eine umgesetzte Maßnahme ist nie für
sich ein Nachweis positiver Netto-Wirkung.

## Quelladapter

Alle Adapter liefern dieselben Kernobjekte: Fall, Entscheidungseinheit,
Dokument und -version, Zeitbezug, Quelle, Abstimmung sowie Verfahrensereignis.
Sie kapseln die Eigenheiten ihrer Ebene.

| Adapter | Führende Quellen | Zweck |
| --- | --- | --- |
| `DipAdapter` | DIP, Bundestag | Vorgänge, Drucksachen, Positionen, namentliche Abstimmungen |
| `SachsenAnhaltAdapter` | Landeswahlleitung, PADOKA, Landtag | Wahlprogramme, Dokumente, Plenum, Gesetzgebung |
| `LandParliamentAdapter` | jeweilige Landeswahlleitung und Landtagsdokumentation | wiederverwendbarer Rahmen für weitere Länder |
| `EuropeanParliamentAdapter` | European Parliament Open Data API, OEIL, EUR-Lex/CELLAR | Verfahren, Dokumente, Termine, Beschlüsse und Rechtsakte |

Eine Rechercheplattform kann als Hinweisgeber dienen; entscheidungstragende
Fakten werden vorrangig an der zuständigen amtlichen Quelle geprüft.

## Startreihenfolge für die Länder

Der Wahlkalender liegt im geschützten Wahlregister. Für den Aufbau werden
zunächst die nächsten Wahlen vorbereitet: Sachsen-Anhalt, Berlin und
Mecklenburg-Vorpommern 2026; danach Schleswig-Holstein, Saarland,
Nordrhein-Westfalen, Bremen und Niedersachsen 2027. Für jede Wahl entstehen
getrennte Review-Pakete. Noch nicht veröffentlichte Programme werden nicht
ersetzt oder geschätzt, sondern als `SOURCE_PENDING` geführt.

## EU

EU-Fälle werden nicht unter Bundespolitik einsortiert. Ein EU-Fall hält
zusätzlich die Rolle des Europäischen Parlaments, der Europäischen Kommission
und des Rates fest, damit eine einzelne Abstimmung nicht fälschlich als
vollständige EU-Entscheidung erscheint. Verbindliche Rechtsfassungen stammen
aus den offiziellen EU-Quellen; der gleiche Rechen-, Evidenz- und
Nichtkompensationsstandard gilt unverändert.

## Schutzregeln

Auch auf allen neuen Ebenen gelten die Veröffentlichungs-Gates unverändert:

- keine Personen- oder Parteienbewertung;
- keine aus Umfragen abgeleitete fachliche Einordnung;
- Fakten, Wirkungspotenzial, Wirkungsrisiken, beobachtete Wirkung und
  normative Einordnung sichtbar trennen;
- Quellen zunächst über die interne Quellendetailseite erklären;
- keine lokalen Pfade, Zugangsdaten, internen Hinweise oder nicht öffentliche
  Metadaten in öffentlichen Ausgaben.
