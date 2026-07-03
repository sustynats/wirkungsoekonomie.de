# Codex-Handoff: Video-Skripte (Erklärvideos)

Grundlage: `docs/VIDEO-BACKLOG.md`. Ziel: Codex liefert je Video ein **inhaltliches Skript
mit Folien-/Chart-Vorgaben**, Claude macht daraus **Sprechertext + Audio (QS) + Video**.

## Aufgabenteilung
- **Codex:** Skript je Video = Kernaussage + 5–10 Folien mit On-Screen-Inhalt und (falls nötig)
  Chart-Beschreibung. Inhaltlich, aus Buch/Glossar/Website. **Keinen** finalen Sprechertext.
- **Claude:** TTS-sicherer Sprechertext, Audio in Natalies Stimme mit QS, Video-Rendering, Einbindung.

## Ablageort (Website-Repo)
Ein File pro Video: `docs/video-skripte/<slug>.md`
- `<slug>` = späterer Videoname → `assets/video/<slug>.mp4`
- Konvention wie bestehende Videos: `wirkungsfeld-<feld>`, `einwand-<thema>`, `fallstudie-<sache>`, `werkzeug-<tool>`, `begriff-<term>`, `institut-<thema>`, `akademie-<block>`.

## Format je Skript (verbindlich)
```
# Video: <Titel>
slug: <kebab-slug>
tier: <1–4 aus dem Backlog>
zielseite: <wo eingebunden, z. B. wirkungsfelder/bildung/index.html>
laenge: ~90–180 Sek   (Kernbegriffe: 30–45 Sek)
zielgruppe: <z. B. interessierte Laien / Unternehmen / Politik>

## Kernaussage (1 Satz)
<die eine Botschaft>

## Folien
### Folie 1 — <Folientitel>
- On-Screen: <Stichpunkte, die auf der Folie stehen>
- Chart/Visual: <nur falls nötig: Beschreibung ODER Verweis auf vorhandenes Asset in assets/…>
- Substanz für Narration: <2–4 Sätze Inhalt, aus denen Claude den Sprechertext formt>
### Folie 2 — …
(…5–10 Folien; Intro-Folie + Kernfolien + Abschluss/CTA)

## Quellen
<Buch-Kapitel, Glossar-Begriffe, Website-Seiten>

## Terminologie
<WÖk-Begriffe, die korrekt vorkommen müssen>
```

## Inhaltliche Leitplanken
- **Terminologie strikt WÖk:** Wirkung neutral; Zielgröße positive Netto-Wirkung; Mensch/Planet/Demokratie; SDG+; Reverse Merit Order; Nichtkompensation; NWI, IOI, T-SROI; Scorecard. Rote Linie: keine Bewertung einzelner Menschen.
- **Tonalität:** klar, sachlich, keine Marketing-/KI-Sprache (Brand Guide).
- **Charts wiederverwenden:** vorhandene Grafiken/PNGs nutzen, wo möglich (Vorbild: die 6 bestehenden Wirkungsfeld-Videos + `impact-controlling-einfach-erklaert`).
- **Kurz halten:** ein Gedanke pro Folie; die Folie zeigt Stichpunkte, die Narration erklärt.

## Startbatch (Tier 1 — bitte zuerst)
**A) Wirkungsfelder – 9 fehlende** (Zielseite je `wirkungsfelder/<feld>/index.html`):
`wirkungsfeld-bildung`, `wirkungsfeld-finanzsystem-kapital`, `wirkungsfeld-klima-energie-ressourcen`, `wirkungsfeld-kultur-identitaet-resonanz`, `wirkungsfeld-medien-oeffentlichkeit`, `wirkungsfeld-produkte-konsum`, `wirkungsfeld-staat-recht-demokratie`, `wirkungsfeld-wirtschaft-unternehmen`, `wirkungsfeld-gesundheit` (falls von gesundheit-pflege getrennt).

**B) Einwände widerlegt** (Zielseite `einwaende/`): `einwand-planwirtschaft`, `einwand-social-credit`, `einwand-gegen-kapital`, `einwand-bevormundung`.

**C) Fallstudien** (greifbar): `fallstudie-apfel`, `fallstudie-t-shirt`, `fallstudie-kraftwerk`.

## Übergabe zurück an Claude
Nach jedem Batch kurze Rückmeldung an Natalie („wirkungsfeld-bildung … stehen in docs/video-skripte/").
Claude erstellt dann Sprechertext + Audio (QS) + Video und legt es unter `assets/video/<slug>.mp4` ab.

## Nicht Codex' Aufgabe
Kein Sprechertext, kein Audio, kein Video-Rendering, keine Vertonung (alles Claude, wegen Audio-QS).
