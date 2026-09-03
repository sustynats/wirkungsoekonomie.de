# Mobile UX Check

Stand: 2026-05-26

## Geprüfte Regeln

- Header bleibt über `main.js` auf 7 Hauptpunkte begrenzt.
- Inhaltsverzeichnisse für neu generierte Detailkonzeptseiten sind `details` und damit standardmäßig geschlossen.
- Sichtbare `#`-Anker werden auf Mobile ausgeblendet.
- Formularlabels im Automatisierungsrechner stehen oberhalb der Felder.
- FTE ist ersetzt und erklärt.
- Prozessgrafik fällt auf Mobile einspaltig.

## Smoke-Check

Lokaler Server: `http://127.0.0.1:8765`

Geprüfte Seiten:

- `/`
- `/wirkungsfelder/produkte-konsum/`
- `/wirkungsfelder/wirtschaft-unternehmen/`
- `/wirkungsfelder/arbeit-einkommen/arbeit-einkommen-wirkung/`
- `/erleben/automatisierungs-wirkungseinkommensrechner/`
- `/anwendungen/scanner.html`
- `/suche.html`
- `/downloads.html`
- `/begriffe/folgencheck/`
- `/verstehen/sdgs-sdgplus/`
- `/akademie.html`

Ergebnis:

- Alle geprüften Seiten liefern HTTP 200.
- TOC-Elemente sind nicht mit `open` ausgeliefert.
- Mobile CSS blendet `.cite-anchor` aus.
- Detailkonzept Arbeit/Einkommen nutzt Badge `Detailkonzept`, keinen H1 `Zum Detailkonzept`, und verschiebt Transparenzangaben ans Ende.
- Automatisierungsrechner nutzt `Beschäftigte, umgerechnet auf Vollzeitstellen`, `Betroffene Vollzeitstellen` und den erklärenden Hilfetext.
- Begriffseite Folgencheck erklärt die vorsorgende Ex-ante-Logik.
- Bibliothek zeigt `Faktencheck und Folgencheck` mit Primäraktion `Onlinefassung lesen`.
- SDG-/SDG+-Seite enthält den Block `Von Zielen zu Fähigkeiten: IDGs und Wirkungskompetenz`.

## Einschränkung

Die In-App-Browserinstanz war in dieser Umgebung nicht verfügbar (`iab` meldete keine Browser-Instanz). Deshalb wurden keine visuellen Mobile-Screenshots erzeugt. Die Prüfung erfolgte als lokaler DOM-/CSS-Smoke-Check über den laufenden Preview-Server.

## Ergebnis

Code-seitige Mobile-Regeln sind umgesetzt und die Kernseiten wurden lokal erreichbar geprüft. Eine visuelle Screenshot-QA bleibt vor PR/Merge nachzuholen, sobald ein Browser-Backend verfügbar ist.
