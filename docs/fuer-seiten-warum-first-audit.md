# Audit: /fuer/-Seiten nach dem Warum-first-Prinzip

Stand: 2026-05-22

## 1. Ueberarbeitete /fuer/-Seiten

Ueberarbeitet wurden:

- `/fuer/`
- `/fuer/politik.html`
- `/fuer/unternehmen.html`
- `/fuer/buergerinnen.html`
- `/fuer/mieter.html`
- `/fuer/rente.html`
- `/fuer/wirkungseinkommen.html`
- `/fuer/journalismus.html`
- `/fuer/investoren.html`
- `/fuer/kommunen.html`
- `/fuer/akademie.html`

Die Seiten werden zentral ueber `tools/generate_fuer_pages.py` erzeugt. Dadurch ist die neue Struktur nicht als manuelle Einzelkorrektur umgesetzt, sondern als wiederholbares Seitenmuster.

## 2. Warum direkt nach dem Hero

Auf allen Zielgruppen-Seiten folgt direkt nach dem Hero ein Warum-Abschnitt:

- generische Zielgruppen-Seiten: `Warum diese Seite wichtig ist`
- Politik-Seite: `Warum Politik Wirkung braucht`
- Hub-Seite: `Was bedeutet die Wirkungsökonomie für mich?`

Der Abschnitt beantwortet jeweils:

- Was laeuft heute falsch?
- Warum reichen die bisherigen Antworten nicht?
- Warum braucht diese Zielgruppe die WÖk?
- Was aendert sich durch die WÖk?

## 3. /fuer/politik.html

`/fuer/politik.html` wurde vollstaendig nach dem neuen Aufbau strukturiert:

- Hero mit Titel `Politik mit Wirkung`
- Untertitel `Vom Reparaturstaat zur Wirkungsarchitektur`
- Kurzformel: alte Politik repariert Folgen, wirkungsorientierte Politik veraendert Anreize
- Abschnitt `Warum Politik Wirkung braucht`
- Abschnitt `Was heute falsch läuft`
- Abschnitt `Warum die WÖk für Politik der bessere Rahmen ist`
- Vergleich `Alte politische Logik vs. Wirkungslogik`
- Wirkungspfad `Wie Politik in der WÖk wirkt`
- Beispiel `Wohnen, Klima und soziale Stabilität`
- Abschnitt `Was die WÖk nicht macht`
- Abschnitt `Warum demokratische Parteien hier anschließen können`
- CTA `Politik mit Wirkung beginnen`
- Evidenzpanel `Grundlage dieser Seite`

## 4. Kacheln mit Problem / WÖk-Verschiebung / Nutzen

Der Hub `/fuer/` wurde von einer reinen Zielgruppenuebersicht zu einem Einstieg mit Problem, WÖk-Verschiebung und Nutzen umgebaut.

Auch die Zielgruppen-Seiten verwenden keine reinen Schlagwortkacheln mehr. Die Karten erklaeren jeweils:

- Problem heute
- WÖk-Verschiebung
- konkreter Nutzen

## 5. Vorher/Nachher-Vergleiche

Alle Zielgruppen-Seiten enthalten einen Vergleich zwischen heutiger Logik und WÖk-Logik.

Auf `/fuer/politik.html` ist der Vergleich als eigene Tabelle mit sechs Feldern umgesetzt:

- Gesetzgebung
- Haushalt
- Markt
- Buerokratie
- Demokratie
- Verantwortung

Auf den weiteren Zielgruppen-Seiten ist der Vergleich zielgruppenspezifisch verdichtet.

## 6. Konkrete Beispiele

Jede Zielgruppen-Seite enthaelt ein eigenes Beispiel:

- Politik: Wohnen, Klima und soziale Stabilitaet
- Unternehmen: Lieferant mit verdecktem Wasser-, Arbeits- und Regulierungsrisiko
- Buerger:innen: Produktpreis ohne sichtbare Folgekosten
- Mieter:innen: energetische Sanierung vs. Luxusmodernisierung mit Verdraengung
- Rente: Pflege, Bildung und Care als Stabilitaetsleistung
- Wirkungseinkommen: automatisierte Produktivitaet und gesellschaftliche Wirkung
- Journalismus: Aussage mit Fakten- und Wirkungsanalyse
- Investor:innen: scheinbar rentable Anlage mit Transformationsrisiken
- Kommunen: Stadtbaum als Mehrfachwirkung
- Akademie: Lernmodul zu Produkt, Aussage und Wirkungspfad

## 7. Wirkungspfade

Alle Zielgruppen-Seiten enthalten einen Wirkungspfad.

Auf `/fuer/politik.html` lautet der Pfad:

Politisches Ziel -> Maßnahme / Gesetz / Haushalt -> betroffene Wirkungsräume -> Datenbasis und Wirkungsindikatoren -> Zielkonflikte und Nebenwirkungen -> Wirkungsbewertung -> Wirkungshaushalt / Steuer / Beschaffung / Verwaltung -> Rückkopplung -> Evaluation -> Anpassung

Der entscheidende Unterschied wird zusaetzlich erklaert: Wirkung bleibt nicht im Bericht, sondern veraendert Haushalt, Recht, Beschaffung, Steuern, Foerderung und Verwaltung.

## 8. Missverstaendnisboxen

Alle Zielgruppen-Seiten enthalten den Abschnitt `Was nicht passiert`.

Die sensiblen Seiten Politik, Rente, Wirkungseinkommen und Investor:innen enthalten zusaetzlich Statushinweise, dass die Inhalte keine Rechts-, Steuer-, Anlage- oder Politikberatung ersetzen und konkrete Zahlen nur als freigegebener Modellstand gelten.

## 9. Kompass-/Scanner-CTAs

Alle Zielgruppen-Seiten enthalten eine Vertiefungsbox mit Links zu:

- WÖk-Kompass
- Scanner
- Glossar
- Evidenz
- passenden Dossiers oder Anschlussseiten

`/fuer/politik.html` hat zusaetzlich die Handlungsbox `Politik mit Wirkung beginnen`.

## 10. Evidenzpanels

Alle Zielgruppen-Seiten enthalten unten ein dezentes, einklappbares Evidenz-/Stand-Panel `Grundlage dieser Seite`.

Das Evidenzpanel auf `/fuer/politik.html` nennt:

- Fuehrender Begriffsleitfaden der Wirkungsökonomie
- Die neue Ordnung des Wohlstands, Kapitel zu Staat, Recht, Wirkungshaushalt, Politik und Demokratie
- Working-Paper Wirkungssteuergesetz (WStG), Stand Oktober 2025
- Systemmodell der Wirkungsökonomie
- Wirkungsrat-Konzept
- Nachhaltigkeit als Systemarchitektur

## 11. Mobile

Die neue Struktur ist mobil stapelbar angelegt:

- Warum-Bloecke bleiben sichtbar und werden nicht ausgeblendet.
- Nutzenkarten und Problemkarten stapeln.
- Vergleiche sind in schmalen Ansichten lesbar, da Tabellen umbrechen und mit `overflow-x` innerhalb des bestehenden Layouts funktionieren.
- Wirkungspfade laufen vertikal.
- Evidenzpanels sind `details`-Elemente und damit einklappbar.

Zusaetzlich wurde im vorherigen Navigationsdurchlauf der mobile Fehler bei stark zusammengedrueckten Wirkungspfad-Karten korrigiert.

## 12. Needs review

Inhaltlich als `needs_review` zu behandeln sind vor allem:

- `/fuer/rente.html`
- `/fuer/wirkungseinkommen.html`
- `/fuer/investoren.html`
- `/fuer/politik.html`

Grund: Diese Seiten beruehren sensible Felder wie Alterssicherung, Einkommen, Kapitalanlage, Steuern, Recht und politische Steuerung. Deshalb wurden Statushinweise ergaenzt und konkrete Zahlen oder Leistungsversprechen vermieden.

Offene Punkte:

- Fachliche Modellstaende fuer Rente, Wirkungseinkommen und Wirkungssteuern koennen spaeter ergaenzt werden, sobald sie freigegeben sind.
- Externe Quellenlisten koennen je Zielgruppe noch weiter ausdifferenziert werden.
- Fuer `/wissen/wohnen.html` wurde kein Link gesetzt, weil die vorhandene Struktur aktuell ueber Blog-/Dossier- und Ordnungsseiten besser anschlussfaehig ist.
