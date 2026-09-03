# Zielgruppen-Content-Master Umsetzung Audit

Stand: 22. Mai 2026

## 1. Welche Seiten wurden ersetzt?

Die folgenden Zielgruppen-Seiten werden jetzt zentral aus `tools/generate_fuer_pages.py` erzeugt und inhaltlich auf den WÖk Zielgruppen-Content-Master v1.0 ausgerichtet:

- `/fuer/journalismus.html`
- `/fuer/unternehmen.html`
- `/fuer/politik.html`
- `/fuer/buergerinnen.html`
- `/fuer/mieter.html`
- `/fuer/investoren.html`
- `/fuer/kommunen.html`
- `/fuer/akademie.html`
- `/fuer/rente.html`
- `/fuer/wirkungseinkommen.html`
- `/fuer/index.html`

Die Unternehmensseite ist nicht mehr als separate handkuratierte Sonderseite geführt, sondern folgt derselben Master-Dramaturgie wie die übrigen Zielgruppen-Seiten.

## 2. Welche neuen Seiten wurden angelegt?

- `/fuer/wissenschaft-forschung.html`
- `/fuer/gesundheit.html`

Beide Seiten sind im Zielgruppen-Hub verlinkt und mit `needs_review` sowie `noindex` gekennzeichnet, weil sie konzeptionelle, wissenschaftliche beziehungsweise gesundheitliche Modellbestandteile enthalten.

## 3. Welche Rechner wurden eingebaut?

- `/fuer/wirkungseinkommen.html`: Bruttovolumen-Rechner mit Bevölkerung, Grunddividende und Finanzierungsstack.
- `/fuer/rente.html`: Wirkungsrenten-Rechner mit Einkommen, Durchschnittseinkommen, Basisrente, Wirkungsfaktor, Wirkungsjahren, Gewichtung, Lernfaktor und optionalem Fondsanteil.

Beide Rechner sind als Modellrechner gekennzeichnet und erzeugen keine Leistungszusage.

## 4. Welche Visuals wurden erstellt?

Es wurden keine neuen KI-Bildvisuals erzeugt. Jede Seite enthält ein markenkonformes Visual-Briefing als ruhige WÖk-Modellvorgabe. Damit bleiben komplexe Modellgrafiken kontrolliert und können später als SVG/HTML-Visuals umgesetzt werden.

## 5. Welche Statushinweise wurden ergänzt?

Status- und Beratungshinweise erscheinen bei sensiblen Seiten:

- `/fuer/politik.html`
- `/fuer/investoren.html`
- `/fuer/wissenschaft-forschung.html`
- `/fuer/gesundheit.html`
- `/fuer/wirkungseinkommen.html`
- `/fuer/rente.html`

Zusätzlich enthält jede Seite unten ein Quellen- und Statuspanel `Grundlage dieser Seite`.

## 6. Welche internen Links wurden gesetzt?

Alle Seiten enthalten CTA-Links zu passenden Bereichen, darunter:

- Kompass, Scanner, Glossar und Evidenzraum
- Politik, Kommunen, Wohnen, Bürger:innen
- Wirkungseinkommen und Wirkungsrente gegenseitig
- T-SROI, Wirkungsfonds, Daten und Standards
- Akademie und Praxisprojekt

Der Zielgruppen-Hub verlinkt alle zwölf Perspektiven.

## 7. Welche Inhalte wurden gekürzt und wohin ausgelagert?

Der Master wurde nicht inhaltlich neu erfunden. Lange Abschnitte wurden auf Website-Lesbarkeit verdichtet, aber die Kernlogik bleibt erhalten:

- Maßstabskrise
- Fehlsteuerung
- WÖk-Verschiebung
- konkreter Gewinn
- Was nicht passiert
- Wirkungspfad
- Beispiel
- Visual-Vorschlag
- Quellenbasis / Status
- CTA

Die Langlogik ist im Generator strukturiert hinterlegt und kann bei Bedarf in Akkordeons oder Vertiefungen weiter ausgebaut werden.

## 8. Welche Seiten brauchen noch fachliche Freigabe?

Needs-review / noindex:

- `/fuer/wissenschaft-forschung.html`
- `/fuer/gesundheit.html`
- `/fuer/rente.html`
- `/fuer/wirkungseinkommen.html`

Veröffentlicht:

- `/fuer/journalismus.html`
- `/fuer/unternehmen.html`
- `/fuer/politik.html`
- `/fuer/buergerinnen.html`
- `/fuer/mieter.html`
- `/fuer/investoren.html`
- `/fuer/kommunen.html`
- `/fuer/akademie.html`

## 9. Suchindex und Suchbegriffe

Die Suchassoziationen wurden um die Master-Begriffe erweitert:

- wirkungsorientiertes Management
- Unternehmen als Wirkungssystem
- Wirkungsmanagement
- Wirkungsrente
- Wirkungsbiografie
- Wirkungseinkommen
- Grunddividende
- Automatisierungsdividende
- Wirkungsfonds
- Journalismus Wirkung
- Faktencheck Folgencheck
- Gesundheit als Systemwirkung
- Prävention statt Reparatur
- Wissenschaft Wirkungsinfrastruktur
- Kommunen Wirkungshaushalt
- Kapitalwirkung
- Wohnen Wirkungsraum

Der Suchindex wurde nach der Generierung neu aufgebaut.

## 10. Wichtigster Leitsatz

Die Zielgruppen-Seiten erklären nicht, wie Menschen, Unternehmen oder Institutionen nachhaltiger werden. Sie erklären, warum die alte Steuerungslogik diese Probleme erzeugt und wie die Wirkungsökonomie die Logik selbst verändert.
