# Finaler UX/UI- und Content-Hotfix Audit

Stand: 22. Mai 2026

## 1. Wo wurde "Kapital misst Bewegung" entfernt?

- Aus den Einstiegsebenen entfernt:
  - `index.html`
  - `verstehen.html`
  - `wirkungsoekonomie.html`
  - `kompass.html`
  - Audio-Transkripthinweise und Hero-Zusammenfassungen
  - Kompass-Antworttemplates
- In der lokalen Stichprobe erscheint die alte Formel auf den geprüften Einstiegsseiten nicht mehr.
- Die Formulierung bleibt nur als tiefere Modellformel in `modell.html`, wo sie direkt erklärt wird.

## 2. Welche Ersatzformulierungen wurden eingesetzt?

- "Gewinn und Wachstum zeigen nicht, ob etwas Menschen stärkt, den Planeten schützt oder Demokratie stabilisiert."
- "Kapital bleibt Werkzeug. Markt bleibt. Aber die entscheidende Frage lautet: Welche Wirkung entsteht wirklich?"
- "Die WÖk fragt nicht zuerst: Was bringt Gewinn? Sondern: Was verändert sich wirklich?"
- "Schädliche Wirkung darf nicht länger billig bleiben. Positive Netto-Wirkung muss sich lohnen."

## 3. Welche Startseiten-Elemente wurden verschoben?

- Im oberen Bereich der Startseite stehen keine Modellposter oder Prozessgrafiken.
- Die Startseite folgt jetzt: Hero, neuer Kompass, 5-Minuten-Einstieg, Für wen, Modell kurz, Anwendungen, Natalie/Buch/Akademie/Blog, Mitmachen.
- Weitere Modellgrafiken bleiben auf Vertiefungsseiten wie `modell.html`, `verstehen.html` und `kompass.html`.

## 4. Welche Diagramme wurden neu erklärt?

- `verstehen.html`: Wirkungsflussgrafik mit Vorlauf-Satz und Caption "Was zeigt diese Grafik?"
- `wirkungsoekonomie.html`: einfache Wirkungslogik mit Vorlauf-Satz und klarer Caption.
- `kompass.html`: Modellgrafiken als "zweiter Blick", nicht als Einstieg, mit erklärenden Captions.
- `evidenz/index.html`: Evidenzgrafik bleibt mit Quellenarchitektur-Caption.

## 5. Welche /fuer/-Standardblöcke wurden zielgruppenspezifisch ersetzt?

Alle Zielgruppen-Seiten verwenden zielgruppenspezifische "Warum ... nicht reicht"-Abschnitte:

- Unternehmen: ESG und Reporting
- Politik: Reparaturpolitik und Ressortlogik
- Bürger:innen: moralische Appelle
- Mieter:innen: Mietrecht, Förderung und Sanierungspflichten
- Investor:innen: ESG-Ratings und Renditelogik
- Kommunen: Ressortsilos und Projektförderung
- Journalismus: Faktencheck allein
- Akademie: Wissen allein
- Wissenschaft & Forschung: Publikationen und Drittmittel
- Gesundheit: Reparaturmedizin allein
- Rente: Beitragssätze, Lebensarbeitszeit und klassische Kapitaldeckung
- Wirkungseinkommen: Erwerbsarbeit als alleinige Einkommensbasis

Die Generatorvorlage wurde ebenfalls angepasst, damit spätere Regenerierungen die alte Standardformulierung nicht zurückbringen.

## 6. Welche Statuslabels wurden professionalisiert?

- Öffentlich sichtbare rohe Labels wie `needs_review` wurden nicht auf den geprüften Kernseiten gefunden.
- Sensible Seiten nutzen professionelle Hinweise:
  - Konzeptstand
  - Modellrechnung / keine Leistungszusage
  - Fachliche Prüfung läuft
  - keine Anlageberatung
  - keine finale Bewertung

## 7. Welche Rechner-UI wurde korrigiert?

### Wirkungsrente

- Hinweisbox ergänzt.
- Formelbox klar gesetzt.
- Eingaben in drei Feldgruppen:
  - Einkommen
  - Wirkungsparameter
  - Rentenbausteine
- Ergebnisbox mit Einkommenspunkten, Wirkungspunkten, Wirkungsdividende und Modellrente.
- Beispielkarte "Pflegekraft Anna" ergänzt.
- Stichprobe: Modellrente wird berechnet (`2.309 €`).

### Wirkungseinkommen

- Hinweisbox ergänzt.
- Bruttovolumen und Finanzierungsstack als zwei Rechnerbereiche markiert.
- Finanzierungsbausteine behalten Datenstatus: offizielle Quelle, Modellwert, Annahme, noch zu prüfen.
- Stichprobe: Bruttovolumen wird berechnet (`1.992.000.000.000 €`).

## 8. Welche Scanner-UI wurde korrigiert?

- Scanner-Modi werden als 8 Karten dargestellt.
- Status sichtbar: `MVP / wirkungsökonomische Ersteinschätzung`.
- Nach Auswahl erscheint die passende Demo-Ausgabe mit Datenqualität, Wirkungspfad, Datenlücken, WÖk-Gegenfrage und Quellenpanel.
- Stichprobe: Produktmodus aktiviert korrekt die Produkt-Demo.

## 9. Welche Kompass-UI wurde korrigiert?

- Oben stehen drei echte Antwortkarten:
  - Was bedeutet Wirkung?
  - Was ist positive Netto-Wirkung?
  - Warum ist die WÖk keine Planwirtschaft?
- Jede Karte enthält Kurzantwort, Ein-Satz-Formel, Wirkungspfad, Begriffe, Quellenbasis und Links.
- Tiefe-Ebenen `Einfach`, `Fachlich`, `Systemisch` wurden sichtbar ergänzt.
- Modellgrafiken wurden als Vertiefung nach den Antwortkarten eingeordnet.

## 10. Welche Suche wurde vereinfacht?

- Filter sind standardmäßig eingeklappt.
- `Top-Treffer` ist als reduzierte Standardansicht sichtbar.
- Suchindex wurde neu gebaut: 217 HTML-Seiten plus 47 kuratierte Einträge.

## 11. Welche Audiohinweise wurden angepasst?

- Prominente oder interne Transkriptstatus-Texte wurden ersetzt durch:
  - "Audio verfügbar. Transkript folgt."
  - "Audio verfügbar. Transkript in Bearbeitung."
- Audio-Dateien und Player wurden nicht entfernt.

## 12. Welche politischen Sprachformulierungen wurden geschärft?

- Die Seite bleibt erhalten und öffentlich erreichbar.
- Formulierungen wurden stärker auf Wirkungspotenzial, Resonanzrisiko und Wirkungsnachweis ausgerichtet.
- Der alte Fallback `Narrativdaten werden geladen` ist nicht mehr sichtbar.
- Die Stichprobe zeigt keine Wahlempfehlung, keine Parteibeschimpfung und keine automatische Wirkungsbehauptung.

## 13. Welche Evidenzkarten wurden ergänzt?

Der Evidenz-Hub enthält jetzt konkrete Quellenkarten nach Funktion, jeweils mit Rolle, gestützter Aussage und Grenze:

- Systemtheorie / Kybernetik: Wiener, Beer, Meadows
- Ökonomie / Innovation: Smith, Schumpeter, Drucker
- Nachhaltigkeit / Agenda 2030: UN Agenda 2030, Planetary Boundaries, Doughnut Economics
- Demokratie / Medien: Habermas, Reuters Institute, OECD Trust
- Regulierung / Standards: CSRD, ESRS, EU-Taxonomie
- Datenquellen: Eurostat, UBA, Open Food Facts

Insgesamt zeigt die Stichprobe 22 konkrete Evidenzkarten.

## 14. Welche mobilen Probleme bleiben?

- Lokale Browser-Stichprobe zeigte auf den geprüften Seiten keinen horizontalen Overflow.
- Noch offen bleibt eine vollständige visuelle QA aller Diagramme auf sehr kleinen Geräten.
- Breite historische Bloggrafiken wurden nicht in diesem Hotfix überarbeitet, da keine Inhalte gelöscht oder archiviert werden sollten.

## 15. UX/UI Bewertung

Status: `approved` für den gezielten Hotfix.

Begründung:

- Einstieg beginnt mit einem verständlichen Problem, nicht mit einer abstrakten Formel.
- Hero und erste Abschnitte funktionieren ohne WÖk-ID, Scorecard, T-SROI oder Wirkungsrat.
- Kompass, Scanner, Rechner und Suche wirken als nutzbare Oberflächen.
- Keine sichtbaren Rohlabels in der geprüften Kernstichprobe.
- Politische Sprachseite bleibt erhalten und methodisch sauberer.

Offene Feinarbeit:

- Vollständige Diagramm-Legendenprüfung auf allen Archiv- und Blogseiten.
- Vollständige Transkripte für alle Audios.
- Weitere redaktionelle Glättung historischer Blogtexte, ohne Substanz zu verlieren.

