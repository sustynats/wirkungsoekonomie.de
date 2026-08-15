# Audit: Evidenz statt Quellen

Stand: 2026-05-22

## 1. Architekturentscheidung

`Quellen` ist nicht mehr der oeffentliche Einstieg in der Navigation. Der sichtbare Navigationspunkt heisst jetzt `Evidenz`.

Begruendung:

- Nutzer:innen brauchen zuerst Orientierung, Relevanz, Problemverstaendnis und Nutzen.
- Quellen sind wichtig fuer Glaubwuerdigkeit, aber nicht der erste Nutzerpfad.
- Die WÖk wird als Denkraum, Navigationssystem, Wirkungsatlas, Transformationsplattform und Bildungsraum positioniert.
- Die wissenschaftliche Tiefe bleibt erhalten, wird aber kontextualisiert.

## 2. Neue Seitenlogik

Neu angelegt wurde:

- `/evidenz/`

Diese Seite ist der Evidenz-Hub mit:

- Einordnung `Warum die WÖk wissenschaftlich anschlussfähig ist`
- visueller Anschlussarchitektur von SDGs, CSRD, ESRS, GRI, EU-Taxonomie, DPP, ESG und T-SROI zur WÖk
- Ebenen fuer Standards, wissenschaftliche Grundlagen, Datenbasis, Beispiele, Whitepaper und Quellenregister
- Erklaerung der Datenarchitektur und Auditierbarkeit
- Link in das weiterhin vorhandene Quellenregister unter `/quellen/`

## 3. Quellenregister bleibt erhalten

`/quellen/` bleibt als Tiefenebene bestehen und wurde sprachlich als `Quellenregister der Wirkungsökonomie` nachgeordnet.

Die Quellen-Seiten bleiben fachlich wichtig fuer:

- konkrete Werke
- Rechtsakte
- Studien
- Datenquellen
- Qualitaetsstufen
- Grenzen
- WÖk-Bezug

## 4. Navigation

Die zentrale Navigation liegt weiterhin in:

- `assets/data/navigation.json`

Der letzte Eintrag im Mehr-Menue lautet jetzt:

- `Evidenz` -> `/evidenz/`

Der Footer fuehrt ebenfalls:

- `Evidenz` -> `/evidenz/`

`data-nav-match` markiert sowohl `/evidenz/` als auch `/quellen/` aktiv als `Evidenz`.

## 5. Zielgruppen-Seiten

Alle Zielgruppen-CTAs zeigen jetzt nicht mehr direkt auf `Quellen ansehen`, sondern auf:

- `Evidenz ansehen` -> `/evidenz/`

Die Panels heissen weiterhin `Grundlage dieser Seite`, verwenden aber den Kicker `Evidenz / Stand`.

## 6. Suche

Die Suche kennt jetzt eigene Assoziationen fuer:

- `Evidenz`
- `Grundlagen & Evidenz`

Der Suchindex enthaelt `/evidenz/` als Bereich `Evidenz`.

## 7. Mobile

Mobile nutzt dieselbe zentrale Navigation. `Evidenz` bleibt im Mehr-Menue unten und ist damit sichtbar, aber nicht frueher Hauptpfad.

## 8. Ergebnis

Die Website fuehrt Nutzer:innen jetzt zuerst ueber Modell, Kompass, Zielgruppen, Anwendungen und Akademie. Die wissenschaftliche Tiefe bleibt stark auffindbar, wirkt aber nicht mehr wie der Einstieg in eine Dokumentensammlung.
