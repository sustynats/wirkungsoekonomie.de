# Studienskripte

Zentrale Master-Ablage fuer die ausfuehrlichen Studienskripte der WÖk-Akademie.

Diese Skripte sind **Bibliotheks- und Akademiematerial zugleich**:

- In der Website-Bibliothek sollen sie oeffentlich lesbar und zitierbar sein.
- In der Akademie-App werden sie als Reader-/PDF-/Lernfortschrittsinhalt gespiegelt.
- Die App-Slots unter `woek-akademie-app/content/lehrgaenge/` sind nicht die fuehrende Quelle.

## Ablageregel

- Master-Skript: `content/studienskripte/<slug>.md`
- Master-Assets: `content/studienskripte/assets/<slug>/<datei>.svg|png|jpg`
- App-Spiegel: `woek-akademie-app/content/lehrgaenge/<slug>.md`
- App-Assets: `woek-akademie-app/content/lehrgaenge/assets/<slug>/<datei>.svg|png|jpg`

## Produktionssprints

Die Studienskripte werden in Sprints produziert. Ein Sprint ist erst abgeschlossen, wenn fuer jedes Skript im Sprint
alle drei Arbeitsartefakte vorliegen:

1. Markdown-Master in `content/studienskripte/`
3. App-Spiegel in `woek-akademie-app/content/lehrgaenge/`

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


- Markdown-Master in `content/studienskripte/`
- App-Spiegel in `woek-akademie-app/content/lehrgaenge/`
- geschuetzter Fragepool in `woek-akademie-app/content/pruefungen/question-pools/`

Qualitaetssicherung und Freigabe als `published`.
