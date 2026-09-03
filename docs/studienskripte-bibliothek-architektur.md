# Studienskripte in der Bibliothek

**Stand:** 2026-07-03  
**Status:** Architekturentscheidung

## Entscheidung

Die ausfuehrlichen Vorlesungs- und Studienskripte sind keine rein internen Student:innen-Unterlagen. Sie sind
oeffentliche Wissensdokumente der Wirkungsökonomie und bekommen einen eigenen Bereich in der Bibliothek.

Die zentrale Master-Ablage liegt deshalb im Website-Root:

- `content/studienskripte/<slug>.md`
- `content/studienskripte/assets/<slug>/...`

Die Akademie-App nutzt diese Inhalte als Spiegel:

- `woek-akademie-app/content/lehrgaenge/<slug>.md`
- `woek-akademie-app/content/lehrgaenge/assets/<slug>/...`

Fuer Claude entsteht zusaetzlich eine interne Word-Rohfassung:

- `docs/studienskripte/word-rohfassungen/<slug>.docx`

Diese Word-Datei ist Uebergabe- und Finalisierungsformat, nicht die fuehrende oeffentliche Quelle.

## Warum

- Studienskripte sind zitierbare Grundlagen- und Vertiefungstexte.
- Zugang darf nicht nur an Studierendenstatus haengen.
- Die Bibliothek ist der richtige Ort fuer langfristige Auffindbarkeit, Suche, Quellenlogik und öffentliche Verlinkung.
- Die Akademie-App bleibt Lernraum: Fortschritt, Reader, Notizen, PDF, Zertifikat, Prüfungen.

## Oeffentlich vs. nicht oeffentlich

Oeffentlich:

- Skripte
- Lernziele
- Mini-Quiz/Verstaendnisfragen
- Glossar
- Quellen
- Tabellen, Bilder, Formeln
- Rueckfluss-Hinweise

Nicht oeffentlich:

- Zertifikatsprüfungen
- Prüfungsfragen mit Antwortlogik
- `CorrectAnswer`, Scoring-Regeln, Punkte-Logik
- Fallrubrics fuer echte Zertifikatsbewertungen

Diese bleiben in `woek-akademie-app/content/pruefungen/` bzw. spaeter in geschuetzten DB-Tabellen.

## Zielbild Bibliothek

Oeffentlicher Bereich:

- `/bibliothek/studienskripte/`
- `/bibliothek/studienskripte/<slug>/`

Filter/Metadaten:

- Dokumenttyp: `Studienskript`
- Track: Grundstudium, Wirkungsmanagement, Impact-Controlling
- Status: Pilot, Arbeitsfassung, Studienskript V1, freigegeben
- Themen: WÖk-Begriffe, Wirkungsfelder, Methoden

## Produktionsregel

Codex schreibt kuenftig zuerst die Masterfassung in `content/studienskripte/`. Danach wird die App-Spiegelfassung
erzeugt oder aktualisiert und eine Word-Rohfassung fuer Claude exportiert. Claude kann den Online-Reader/PDF-Export
aus der App-Spiegelfassung bauen und die Word-Fassung in CI/CD finalisieren, aber die Bibliothek bleibt der
oeffentliche Wissensort.

## Offene technische Folgeaufgaben

1. Generator fuer `bibliothek/studienskripte/` aus `content/studienskripte/index.json` bauen.
2. `Studienskript` als Bibliothekstyp im Library-Registry-Build ergaenzen.
3. App-Sync-Skript bauen: `content/studienskripte/*.md` -> `woek-akademie-app/content/lehrgaenge/*.md`.
4. Suchindex/Pagefind und Bibliotheksfilter um Studienskripte erweitern.
