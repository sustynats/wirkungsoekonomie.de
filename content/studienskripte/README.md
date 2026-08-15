# Studienskripte

Zentrale Master-Ablage fuer die ausfuehrlichen Studienskripte der WÖk-Akademie.

Diese Skripte sind **Bibliotheks- und Akademiematerial zugleich**:

- In der Website-Bibliothek sollen sie oeffentlich lesbar und zitierbar sein.
- In der Akademie-App werden sie als Reader-/PDF-/Lernfortschrittsinhalt gespiegelt.
- Die App-Spiegel sind nicht die fuehrende Quelle; die konkrete Zuordnung steht im Skriptindex.

## Ablageregel

- Master-Skript: fuehrende Markdown-Datei je Slug.
- Master-Assets: skriptbezogene Bild- und Grafikdateien je Slug.
- Word-Rohfassung fuer Claude: eine DOCX-Datei je Slug.
- App-Spiegel: Reader-Markdown je Slug, abgeleitet aus dem Master.
- App-Assets: gespiegelte App-Assets je Slug.

## Produktionssprints

Die Studienskripte werden in Sprints produziert. Ein Sprint ist erst abgeschlossen, wenn fuer jedes Skript im Sprint
alle drei Arbeitsartefakte vorliegen:

1. Markdown-Master.
2. Word-Rohfassung fuer Claude.
3. App-Spiegel.

Claude finalisiert danach CI/CD, Reader, PDF und Veroeffentlichungsstatus. Die Word-Datei ist deshalb keine
oeffentliche Quelle, sondern die handhabbare Rohfassung fuer Lektorat, Satz, Design-Feinschliff und Freigabe.

## Was oeffentlich ist

Oeffentlich in die Bibliothek gehoeren:

- Studienskript
- Lernziele
- Verstaendnisfragen/Mini-Quiz
- Glossar
- Quellen
- Bilder, Tabellen, Formeln
- Rueckfluss-Notizen in den WÖk-Korpus

Nicht oeffentlich in die Bibliothek gehoeren:

- Zertifikatspruefungen
- Pruefungsfragen mit `CorrectAnswer`
- Scoring-Regeln und Antwortlogik
- nicht freigegebene Fallaufgaben/Rubrics

Diese Pruefungsartefakte bleiben in der App-/Admin-Lane.

## Status

Aktueller V1-Bestand:

- 36 Grundstudium-Vorlesungen
- 10 Wirkungsmanagement-Vorlesungen
- 10 Impact-Controlling-Vorlesungen

Alle 56 V1-Vorlesungen sind als fachlich finale Codex-V1-Fassung vorhanden:

- Markdown-Master.
- Word-Rohfassung fuer Claude.
- App-Spiegel.
- geschuetzter Fragepool in der App-/Admin-Lane.

Status: `studienskript-v1`. Offen bleibt die Claude-CI/CD-Finalisierung fuer Reader, PDF, Satz, visuelle
Qualitaetssicherung und Freigabe als `published`.
