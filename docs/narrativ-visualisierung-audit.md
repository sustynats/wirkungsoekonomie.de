# Narrativ-Visualisierung - Audit

Stand: 21. Mai 2026

## Visualisierte Narrative

Die Seite `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` wurde als interaktive Wirkungsanalyse politischer Sprache erweitert. Die Daten liegen zentral in `assets/data/narrative-cases.json`.

Visualisiert wurden:

- Altparteien
- Angst vor AfD-Wahlsieg
- Illegale Masseneinwanderung
- Planwirtschaftliche Energiewende
- Kehrtwende um 180 Grad

Alle Einträge sind als Pilotanalyse gekennzeichnet.

## Radarwerte

Für jedes Narrativ wurde ein Wirkungsradar mit zehn Achsen umgesetzt:

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

Die Werte folgen der vorgegebenen Skala von 0 bis 5. Jede Achse besitzt eine Kurzbeschreibung. Die Werte werden ausdrücklich als Demo-Werte ausgewiesen:

> Demo - wirkungsanalytische Einordnung, keine amtliche Bewertung.

## Netzwerkdaten

Jedes Narrativ besitzt ein eigenes Wirkungsnetz mit:

- zentralem Narrativknoten
- direkten Resonanzräumen
- ausgeblendeten Systemursachen oder möglichen Folgen
- kurzen Erklärtexten
- Systemfrage
- WÖk-Gegenfrage

Die Netzwerke sind datengetrieben aus `network_nodes` und `network_links` vorbereitet. Im MVP werden die Knoten als interaktive, fokussierbare Ebenen dargestellt.

## Interaktionen

Umgesetzt wurden:

- interaktive Themencluster-Karten mit Mini-Radar
- Auswahl über Dropdown
- Klick auf Karte scrollt zur Detailanalyse
- großes Wirkungsradar je Narrativ
- klick- und fokussierbare Radarachsen mit Erklärung
- interaktives Wirkungsnetz je Narrativ
- klick- und fokussierbare Netzwerkknoten mit Erklärungskarte
- Gesamtansicht der gemeinsamen Resonanzräume

## Gesamtansicht

Die Gesamtansicht zeigt, wie die fünf Narrative über gemeinsame Resonanzräume verbunden sind:

- Misstrauen
- Kontrolle
- Angst
- Systemdelegitimierung
- Vereinfachung
- Medien
- Demokratie
- Vertrauen
- Spaltung

Die Ansicht ist als MVP angelegt und kann später zu einem filterbaren Graphen ausgebaut werden.

## Mobile

Die Visualisierungen sind responsiv umgesetzt:

- Karten wechseln auf kleinere Grid-Spalten
- Radar und Wirkungsnetz stapeln sich auf Mobile
- Netzwerkspalten werden einspaltig
- Buttons bleiben per Tap bedienbar

## Barrierefreiheit

Umgesetzt wurden:

- SVG-Radare mit `role="img"` und Textalternative
- Tabelle unter jedem Radar mit Achse, Wert und Erklärung
- Netzwerkknoten als echte Buttons
- Radarachsen als echte Buttons
- Fokuszustände für Tastaturbedienung
- Interaktion nicht nur über Hover, sondern auch über Klick und Fokus
- keine reine Farbcodierung
- reduzierte Animation bei `prefers-reduced-motion`

## Redaktionelle Hinweise

Die Seite enthält klare Hinweise:

- keine amtliche Bewertung
- keine Wahrheitsprüfung
- keine juristische Bewertung
- Analyse von Wirkungspotenzialen
- Pilot-/Demo-Charakter

Standardhinweis:

> Die Visualisierung zeigt Wirkungspotenziale. Sie ersetzt keinen Faktencheck und keine juristische Bewertung.

## Suche und Auffindbarkeit

Die Suchdaten wurden erweitert. Die Hauptseite und alle fünf Detailanker sind im Suchindex mit passenden Tags und Aliases eingetragen, unter anderem:

- politische Sprache
- Narrative
- Wirkungspotenzial
- Medien
- Demokratie
- SDG+
- AfD
- Populismus
- Framing
- Systemdelegitimierung
- Vertrauen
- Diskursfähigkeit
- Autoritarismuspotenzial

## Offene Punkte

- Originalstellen vor Veröffentlichung jeder Detailanalyse redaktionell einzeln prüfen.
- Radarwerte später durch redaktionelles Review oder methodische Bewertungsmatrix kalibrieren.
- `network_links` können in einer späteren Version als echte SVG-Verbindungslinien gerendert werden.
- Vergleichsansicht kann später als Tab- oder Overlay-Funktion erweitert werden.
- Weitere Parteien, Medienbeiträge, Talkshow-Aussagen und Social-Media-Clips können über die JSON-Struktur ergänzt werden.
