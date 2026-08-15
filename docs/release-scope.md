## In Scope

- Website-UX-/IA-Cleanup fuer die gemeldeten Restfehler.
- Wirkungsfeld-Generator fuer Arbeit & Einkommen als Landingpage statt Volltext-/Download-Einstieg.
- Wirtschaft-&-Unternehmen-Generatoren und Detailkonzept-Korrekturen fuer oeffentliche Sprache statt Portal-/Arbeitsfassungslogik.
- CTA-Vertrag: generische Oeffnen-CTAs und falsche Tool-/Methodiklabels entfernen.
- Tool-Defaultzustaende auf /erleben.html und im Automatisierungsrechner ohne leere Ergebniswerte.
- Suche: Filter im Einstieg eingeklappt und Suchfeld/Top-Ergebnisse zuerst.
- Scanner-Seite als bestehende interaktive Anwendung im Release-Scope erhalten.
- Audit- und Linkcheck-Scripte fuer Public Language, CTA-Vertrag und lokale Links.

## Out of Scope

- Word-/Pandoc-/Dokumentenstandardisierung.
- Neue Rang-Portale oder weitere Content-Importe.
- Unfertige Experimente, Akademie-App, alte Migrationspakete und unklare untracked Dateien.
- Direkter Deploy nach main ohne Review.

## Nicht Uebernommen

- Der gesamte Arbeitsbaum des Branches `standardize-dossier-layouts` mit rund 1000 geaenderten getrackten Dateien.
- Untracked Altartefakte, Exportordner, PDF-/DOCX-Zwischenstaende und Dokumentstandardisierungsausgaben.
- Nicht release-relevante Blog-, Download-, Rangpaket- und Archivdateien.

## Risiken

- Der Release-Branch basiert sauber auf `origin/main`; nach dem Build koennen Generatoren weitere HTML-/Indexdateien aktualisieren.
- GitHub Pages deployed nur nach Merge/Push auf `main` oder manuellem Workflow-Dispatch.
- Live-Pruefung ist erst nach PR/Merge und Deploy sinnvoll.

## Pruefseiten

- /
- /wirkungsfelder/
- /wirkungsfelder/bildung/
- /wirkungsfelder/gesundheit-pflege/
- /wirkungsfelder/arbeit-einkommen/
- /wirkungsfelder/produkte-konsum/
- /wirkungsfelder/wirtschaft-unternehmen/
- /wirkungsfelder/wirtschaft-unternehmen/konzeptpapier/
- /werkzeuge/impact-controlling/
- /erleben.html
- /anwendungen/scanner.html
- /erleben/automatisierungs-wirkungseinkommensrechner/
- /suche.html
- /downloads.html
- /akademie.html
