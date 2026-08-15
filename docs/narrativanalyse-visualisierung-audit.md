# Narrativanalyse Visualisierung Audit

Stand: 2026-05-21

## Umgesetzte Narrative

Die Seite `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` wurde von 5 auf 10 Pilotanalysen erweitert:

- Altparteien
- Angst vor AfD-Wahlsieg
- Diktatur der Altparteien / Altparteiendiktatur
- Illegale / kulturfremde / inländerfeindliche Massenmigration
- Remigration / Remigrationslotsen
- Kehrtwende um 180 Grad
- Planwirtschaftliche Energiewende
- Klimadiktatur / Klimaextremismus / Klimapropaganda
- Genderismus / Regenbogenkult / politische Indoktrination
- Zensurbehörden / betreute Meinung / ÖRR-Frame

## Quellen und Abrufdaten

Alle Pilotanalysen verweisen auf das öffentliche AfD-Regierungsprogramm Sachsen-Anhalt unter `https://www.afd-regierungsprogramm.de/`.

Abrufdatum in der Datenstruktur: `2026-05-21`.

Die Originalauszüge sind bewusst kurz gehalten und als Begriffsauszüge dokumentiert. Die Seite enthält keine langen Programmzitate und keine Vollzitationen.

## Wirkungsradare

Für alle 10 Narrative wurden Radarwerte auf einer Skala von 0 bis 5 hinterlegt.

Achsen:

- Angst
- Wut
- Misstrauen
- Feindbild
- Kontrollsehnsucht
- Vereinfachung
- Autoritarismuspotenzial
- Diskursverengung
- Demokratierisiko
- Entsolidarisierung

Die Radare werden als SVG erzeugt. Zusätzlich gibt es eine Tabelle als barrierearmen Fallback mit Achse, Wert und Erklärung.

## Wirkungsnetze und Wirkungspfade

Das bisherige spaltenartige Wirkungsnetz wurde ersetzt durch:

- einen linearen Wirkungspfad für Mobile und schnelles Verständnis
- ein kuratiertes SVG-Wirkungsnetz auf Desktop
- beschriftete Kanten mit Wirkverben wie `rahmt`, `aktiviert`, `verschiebt`, `verdeckt`, `delegitimiert`, `verengt`
- Knotentypen für Narrativ, Sprachmechanik, Resonanzraum, Wahrnehmungsverschiebung, demokratische Wirkung, Systemfrage und WÖk-Gegenfrage

Zusätzlich wurde eine Gesamtansicht ergänzt: `Wie die Narrative zusammenwirken`.

## Mobile

Auf Mobile werden kleine interne Scrollboxen vermieden. Die Seite nutzt:

- filterbare Karten
- Tabs im Fokusbereich
- vertikale Wirkungspfade
- Radare mit Tabellenfallback
- kein kleines Force-Graph-Netz als Standard

Touch-Flächen für Filter, Tabs und Achsenbuttons sind mindestens 44px hoch.

## Barrierefreiheit

Umgesetzt:

- SVGs mit `role="img"` und beschreibenden Labels
- Radarwerte zusätzlich als Tabelle
- Wirkungspfade als lesbare Textkarten
- Netzverbindungen zusätzlich als klickbare Textpfade
- Fokuszustände für interaktive Elemente
- `prefers-reduced-motion` berücksichtigt
- keine Information nur über Farbe

## Nicht-JS-Fallback

Die Seite enthält statische Kurzanalysen mit eigenen IDs:

- `#narrativ-altparteien`
- `#narrativ-angst-vor-afd-wahlsieg`
- `#narrativ-altparteiendiktatur`
- `#narrativ-masseneinwanderung`
- `#narrativ-remigration`
- `#narrativ-kehrtwende-180-grad`
- `#narrativ-planwirtschaftliche-energiewende`
- `#narrativ-klimadiktatur`
- `#narrativ-genderismus`
- `#narrativ-medien-zensur`

Bei aktivem JavaScript wird der statische Fallback ausgeblendet, bleibt aber für Suchmaschinen und No-JS-Nutzung vorhanden.

## Sprachliche Überarbeitung

Die Seite wurde stärker auf klare Wirkungslogik formuliert:

- `aktiviert`
- `rahmt`
- `verstärkt`
- `verschiebt`
- `delegitimiert`
- `normalisiert`
- `verengt`
- `verdeckt`

Absichten werden nicht behauptet. Die Analyse bleibt bei Wirkungspotenzialen und demokratischen Folgen.

## Suche

Der Suchindex wurde um die neuen Narrative und Anker erweitert:

- Altparteiendiktatur
- Remigration
- Klimadiktatur
- Genderismus
- Zensurbehörden / ÖRR

## Offene redaktionelle Prüfungen

- Die Begriffsauszüge sollten bei redaktioneller Veröffentlichung noch einmal direkt gegen die Originalquelle geprüft werden.
- Die Radarwerte sind heuristische Pilotwerte und können später durch ein redaktionelles Reviewverfahren versioniert werden.
- Ein echter Vergleichsmodus mit überlagerten Radaren ist vorbereitet, aber im MVP bewusst einfach gehalten.
