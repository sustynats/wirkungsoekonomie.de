# UX Sprint 2 Report

Stand: 2026-05-26

## Umgesetzt

- Neuer Arbeitsstand auf Branch `feature/website-ux-sprint-2`.
- Navigation vereinfacht: Start, Verstehen, Wirkungsfelder, Ausprobieren, Akademie, Bibliothek, Suche.
- Produkte & Konsum und Wirtschaft & Unternehmen geprüft: beide starten als Wirkungsfeld-Landingpages, nicht als Dokumentenlogik.
- Detailkonzeptseiten Arbeit & Einkommen neu generiert: Badge, echter H1, Kurzfassung, Leitfrage, geschlossene Inhaltsübersicht, Detailkonzept/Dossier getrennt, Materialien und Transparenz am Ende.
- Automatisierungs- und Wirkungseinkommensrechner: FTE öffentlich ersetzt/erklärt durch Vollzeitstellen.
- Folgencheck/Faktencheck v1.1 integriert: Begriffseiten, Paper-Onlinefassung, Scanner-Hinweise, Bibliothekskarte, Suchindex.
- SDG-/SDG+-Seite ergänzt um IDGs und Wirkungskompetenz als Kompetenzrahmen.
- Dokumentenregistry angelegt: `assets/data/document-registry.json`.
- Über-uns-Seite um Rolle der Website, Grenzen der Demos, Mitwirkung und Kontakt erweitert.
- Public-language-Check bereinigt.

## Checks

- Build über `npm run build`: nicht direkt, `npm` ist in der Shell nicht verfügbar.
- Alternativer Full Build: ja, `package.json`-Buildkette sequenziell über `node` ausgeführt.
- Direkte Generatoren mit `node`: ja.
- Suchindex neu: ja, Search-Integration für 4.560 Einträge geprüft.
- Linkcheck: ja, 69.894 Links, 0 missing.
- Public-language: ja, 0 sichtbare Blocklist-Treffer.
- CTA-Audit: ja, 0 Fehler, 0 Warnungen.
- Wirkungsfeld-Landing-Audit: ja, 14 Seiten bestanden.
- Document-registry: ja, 6 Einträge, 0 aktuelle öffentliche Dokumente ohne Online-URL.
- Mobile geprüft: eingeschränkt, lokaler DOM-/CSS-Smoke; Browser-Screenshots nicht möglich, weil keine In-App-Browserinstanz verfügbar war.
- PR erstellt: nein.
- Deploy erfolgt: nein.
- Live geprüft: nein.

## Hinweise

Der vorhandene Branch enthielt bereits Teile von Sprint 2. Ich habe bestehende Änderungen nicht zurückgesetzt. Ein voriger lokaler Arbeitsstand vom alten Branch wurde vor dem Wechsel sicher in einem Git-Stash abgelegt.
