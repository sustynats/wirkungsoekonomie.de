# Claude-Codex-Worklog

Stand: 2026-07-03
Status: gemeinsames Arbeitslog fuer Claude und Codex

## Zweck

Dieses Dokument ist der schnelle gemeinsame Blick auf den aktuellen Arbeitsstand:
Was wurde gemacht, wo liegt es, welcher Commit gehoert dazu, was ist offen und wer sollte als
Naechstes schauen.

Es ersetzt keine Architektur- oder Entscheidungspapiere. Dauerhafte Regeln, Datenmodelle und
fachliche Entscheidungen bleiben in den jeweiligen Fachdocs, z. B.:

- `docs/umbau-arbeitsteilung-claude-codex.md`
- `docs/institut-arbeitsteilung-claude-codex.md`
- `docs/institut-entscheidungen.md`
- `docs/woek-kern-architektur.md`
- `docs/woek-id-meine-woek-konzept.md`

## Arbeitsregel

- Jeder abgeschlossene oder bewusst pausierte Arbeitsblock bekommt hier einen kurzen Eintrag.
- Ein Eintrag soll so knapp sein, dass der andere Agent in 60 Sekunden weiss, ob er betroffen ist.
- Keine grossen Specs in dieses Log kopieren; nur Pfad, Status, Commit/Branch und offene Punkte nennen.
- Wenn ein Task ein anderes Repo betrifft, den Repo-Namen explizit nennen.
- Wenn etwas live gehen soll: Status auf `abnahmebereit` setzen; Claude prueft und deployt final.
- Wenn etwas nur vorbereitet ist: Status auf `vorbereitet` oder `wartet auf ...` setzen.

## Eintragsformat

```md
### YYYY-MM-DD HH:MM - Agent - Kurzthema
- Status: vorbereitet | in Arbeit | abnahmebereit | abgeschlossen | blockiert
- Repo/Pfad: ...
- Branch/Commit: ...
- Geaendert: ...
- Pruefung: ...
- Offen fuer Claude/Codex/Natalie: ...
```

## Aktueller Snapshot

| Bereich | Stand | Naechster Blick |
|---|---|---|
| Video-Skripte Tier 1 | Codex hat 16 Skriptdateien unter `docs/video-skripte/` angelegt. | Claude: Sprechertexte, Audio-QS, Video-Rendering (wartet auf Natalies Go). |
| Video-Handoff | `docs/CODEX-HANDOFF-videoskripte.md` liegt im Website-Repo. | Beide: als Formatvorgabe fuer weitere Video-Batches nutzen. |
| Studienskripte | 56/56 V1-Vorlesungen liegen als `tiefensprint-arbeitsfassung` vor: Markdown-Master, Word-Rohfassung, App-Spiegel; geschuetzte Fragepools V1 sind angelegt. | Claude: CI/CD-Finalisierung, Reader, PDF; Codex: bei Bedarf Nachschaerfung einzelner Skripte/Pools. |
| Institut-App | Feature-komplett live auf `main` (Glossar zentral, Auth-Fix, Forum-Struktur, Frag die WÖk + Wirkungscheck/Faktencheck auf Oracle, Board Zoom/Notizzettel, Dashboard, Dev-Login). Letzter Commit `3735c1b`. | Codex: nichts offen; KI-Tools liegen zentral auf Oracle. |
| PR #69 (Website) | Release-Blocker Suchindex behoben, Gate gruen, von Claude QA-abgenommen. | Natalie: mergen (Ready → Squash). |
| Zertifikat WOEK-PH-2026-0002 | Codex nicht angefasst. | Natalie: behalten oder anonymisieren? |
| Umbau-Arbeitsteilung | `docs/umbau-arbeitsteilung-claude-codex.md` beschreibt Owner, Phasen und QA-Gate. | Beide: vor neuen Querschnittsarbeiten pruefen. |
| Institut-Arbeitsteilung | `docs/institut-arbeitsteilung-claude-codex.md` beschreibt Institut-spezifischen Prozess. | Beide: bei Institut-App/Website-Schnittstellen nutzen. |

## Chronologisches Log

### 2026-07-03 - Codex - Studienskripte 56/56 + geschuetzte Pruefungs-Pools
- Status: vorbereitet
- Repo/Pfad: Website-Repo `content/studienskripte/`, `docs/studienskripte/`, `bibliothek/studienskripte/`; Akademie-App `content/lehrgaenge/`, `content/pruefungen/question-pools/`, `content/pruefungen/assessments/`
- Branch/Commit: Website bis `74fbe025ec` plus Pruefungsstatus-Commit; Akademie-App bis `4c63175` plus Pruefungspool-Commit
- Geaendert: alle 56 V1-Vorlesungen auf `tiefensprint-arbeitsfassung`, ca. 474k Woerter Masterbestand, 56 Word-Rohfassungen, 56 App-Spiegel; 56 geschuetzte slug-basierte Fragepools mit je 8 Fragen und Antwortlogik; 5 Assessment-Blueprints.
- Pruefung: JSON ok; App-Typecheck gruen; repraesentative DOCX-Renders fuer V20, V21, V28, V32, V36, WM10 und WC10; 456 `CorrectAnswer`-Eintraege inkl. V20-Pilotpool.
- Offen fuer Claude: CI/CD-Lektorat, Reader-/PDF-Finalisierung, finale Freigabe und ggf. kuratierte Nachschaerfung der Pruefungslogik.
- Offen fuer Codex: keine Massenproduktion offen; nur gezielte Nacharbeit, falls Claude/Natalie beim Finalisieren etwas markiert.

### 2026-07-03 - Codex - Studienskripte Sprint 0 Produktionsschiene
- Status: vorbereitet
- Repo/Pfad: Website-Repo `content/studienskripte/`, `docs/studienskripte/`, `bibliothek/studienskripte/`; Akademie-Repo `woek-akademie-app/docs/`
- Branch/Commit: in Arbeit
- Geaendert: zentrale Markdown-Master-Ablage, Bibliotheksbereich, Sprintplan, Word-Rohfassungsordner und Exporter angelegt; V20 als erste Word-Rohfassung exportiert.
- Pruefung: JSON-Index gueltig; DOCX V20 gerendert und visuell stichprobengeprueft; Exporter kompiliert.
- Offen fuer Codex: V20 auf Tiefen-Umfang ausbauen, dann V21-V24 als Sprint 2.
- Offen fuer Claude: Word-Rohfassungen final im Akademie-CI setzen, Reader/PDF und Freigabe uebernehmen.

### 2026-07-03 - Codex - Studienskripte alle V1-Rohfassungen erzeugt
- Status: vorbereitet
- Repo/Pfad: Website-Repo `content/studienskripte/`, `docs/studienskripte/word-rohfassungen/`, `bibliothek/studienskripte/`; Akademie-App `content/lehrgaenge/woek-g-v21...v36.md`
- Branch/Commit: in Arbeit
- Geaendert: 56 Rohfassungen im Index; 55 neue Markdown-Master plus vorhandener V20-Pilot; 56 Word-Rohfassungen; 16 fehlende Grundstudium-App-Spiegel V21-V36.
- Pruefung: Index-JSON gueltig; App-Typecheck gruen; Word-Rohfassungen exemplarisch gerendert fuer V21, WM-V3 und WC-V3.
- Offen fuer Codex: echte Tiefenfassungen 40-50 Seiten je Skript, beginnend mit V20 und V21-V24.
- Offen fuer Claude: Word-Rohfassungen koennen als CI/CD-Rohmaterial gesehen werden, aber noch nicht als finale Studienskripte.

### 2026-07-03 - Codex - V20 Tiefensprint begonnen
- Status: in Arbeit
- Repo/Pfad: Website-Repo `content/studienskripte/woek-g-v20.md`, `docs/studienskripte/word-rohfassungen/`; Akademie-App `content/lehrgaenge/woek-g-v20.md`
- Branch/Commit: in Arbeit
- Geaendert: V20 deutlich vertieft: Resonanz als Uebergang zwischen Wirkungspotenzial und Wirkung, sozialwissenschaftliche Anschluesse, Diagnoseverfahren, weitere Fallstudien, Daten-/Indikatorenlogik und rote Linien. Word-Exporter verbessert, damit Markdown-Absatzumbrueche in Word nicht als harte Kurzabsatz-Kaskade erscheinen.
- Pruefung: JSON ok; App-Typecheck gruen; V20-DOCX und WC-V3-DOCX erfolgreich gerendert.
- Offen fuer Codex: V20 weiter auf finalen 40-50-Seiten-Umfang bringen, danach V21-V24.

### 2026-07-03 - Codex - Tier-1-Video-Skripte angelegt
- Status: abgeschlossen
- Repo/Pfad: Website-Repo, `docs/video-skripte/`
- Branch/Commit: `9fa3e45634 Add tier 1 video scripts`
- Geaendert: 16 Markdown-Skripte erstellt:
  - 9 Wirkungsfelder
  - 4 Einwaende
  - 3 Fallstudien
- Pruefung: Strukturcheck lokal: 16 Dateien, je 6 Folien, Pflichtfelder vorhanden, lokale Zielseiten/Quellen vorhanden.
- Offen fuer Claude: Sprechertext, Audio-QS, Video-Rendering und spaetere Ablage unter `assets/video/<slug>.mp4`.

### 2026-07-03 - Codex - Video-Skript-Handoff uebernommen
- Status: abgeschlossen
- Repo/Pfad: Website-Repo, `docs/CODEX-HANDOFF-videoskripte.md`
- Branch/Commit: `5b51677680 Add video script handoff`
- Geaendert: Handoff-Dokument fuer Video-Skripte mit Format, Ablageort, Leitplanken und Startbatch angelegt.
- Pruefung: Datei bytegleich zur Vorlage aus `woek-akademie-app/docs/CODEX-HANDOFF-videoskripte.md` uebernommen.
- Offen fuer Claude: Handoff als operative Vorgabe fuer Sprechertext, Audio-QS und Video verwenden.

### 2026-07-03 - Codex - Gemeinsames Worklog angelegt
- Status: vorbereitet
- Repo/Pfad: Website-Repo, `docs/claude-codex-worklog.md`
- Branch/Commit: noch nicht committet
- Geaendert: gemeinsames Arbeitslog mit Zweck, Eintragsformat, aktuellem Snapshot und ersten Codex-Eintraegen angelegt.
- Pruefung: keine Build-Pruefung erforderlich, reine Dokumentation.
- Offen fuer Claude: ab jetzt eigene abgeschlossene oder pausierte Arbeitsbloecke hier ebenfalls kurz eintragen.

### 2026-07-03 16:50 - Claude - Hinweis: Ablageort meiner Handoff-/Backlog-Docs
- Status: Info
- Repo/Pfad: AKADEMIE-Repo `woek-akademie-app/docs/`
- Geaendert: Meine Handoffs/Backlog liegen im Akademie-Repo (PR #5), NICHT im Website-`docs/`: `CODEX-HANDOFF-live.md`, `CODEX-HANDOFF-vorlesungen.md`, `DEPLOY-RUNBOOK.md`, `VIDEO-BACKLOG.md`.
- Offen fuer Codex: bei diesen Themen dort nachsehen.

### 2026-07-03 16:50 - Claude - Erklaervideos Tier 1: Sprechertext + Pipeline
- Status: in Arbeit
- Repo/Pfad: `voice-tts/` (lokal) -> Ausgabe Website-Repo `assets/video/<slug>.mp4`
- Branch/Commit: kein Repo-Commit (Rendering lokal); Folien-Quellen `voice-tts/video-folien/`
- Geaendert: 7/16 Skripte maiwaldisiert vertextet (3 Fallstudien + 4 Einwaende) aus `docs/video-skripte/`; Pipeline `split_folien_texte.py` + `video_render.sh` (nutzt produce_lecture-QS + `build_texte.make_speakable`).
- Pruefung: Split + Germanisierung + Folien-Parse (6 Slides) an `fallstudie-apfel` getestet.
- Offen fuer Claude: 9 Wirkungsfelder noch texten. Rendering laeuft autonom hinter IC+Vorlesungen.
- Offen fuer Codex: fertige `assets/video/<slug>.mp4` spaeter auf den Zielseiten einbinden (Zielseite steht im Skript-Kopf).

### 2026-07-03 16:50 - Claude - Impact-Controlling-Video (Natalies PPTX)
- Status: in Arbeit
- Repo/Pfad: `voice-tts/` -> geplant `assets/video/impact-controlling-einfach-erklaert-v2.mp4`
- Geaendert: TTS-sicherer Sprechertext fuer 32-Folien-PPTX, Folien-PNG-Export + Audio-QS + Video-Bau.
- Offen fuer Codex: nach Fertigstellung auf `werkzeuge/impact-controlling/` einbinden.

### 2026-07-03 16:50 - Claude - Akademie V1 + Deploy-Prep
- Status: abnahmebereit / wartet auf Codex+Natalie
- Repo/Pfad: AKADEMIE-Repo `woek-akademie-app`, PR #5 (sustynats/woek-akademie-app)
- Geaendert: Akademie-Hub `/akademie` (Suche/Glossar/Bibliothek/KI/Wirkungscheck/Karteikarten/Wissens-Tests), zwei Zugaenge, Vorlesungs-Content, globales Design-Update (Playfair/Source Sans, Karten, Umbruch-Bugfix).
- Pruefung: `npm run typecheck` 0 Fehler.
- Offen fuer Codex/Natalie: Migrationen 0017+0019 auf Prod, PR #5 -> main mergen, Audio-Release + `wire-lecture-media.mjs` (siehe `woek-akademie-app/docs/CODEX-HANDOFF-live.md`).

### 2026-07-03 16:50 - Claude - Vorlesungen (Audio+Video mit QS)
- Status: in Arbeit
- Repo/Pfad: `voice-tts/`; Folien-Quellen `woek-akademie-app/docs/lehrgaenge/folien/`
- Geaendert: Grundstudium G1 (V01-V12) fertig (Audio+Video); V13-V19 + WM V1-V2 vertextet, Render laeuft.
- Offen fuer Codex: Quell-Dokumente Grundstudium V20-V36 erstellen (siehe `woek-akademie-app/docs/CODEX-HANDOFF-vorlesungen.md`), Ablage `docs/lehrgaenge/woek-g-vNN-*.md`.

### 2026-07-03 - Claude - Institut-App: Glossar zentral + interne Begriffsseiten + tote Links
- Status: abgeschlossen (live auf main)
- Repo/Pfad: `woek-institut-app` — `lib/institut/glossary-full.ts`, `app/glossar/*`, `app/suche/page.tsx`
- Branch/Commit: `8e57106`, `c46f500`, `6625ad1` (main)
- Geaendert: Glossar zeigt alle 1654 Begriffe aus zentraler `term-registry.json` (oeffentlich), A-Z-Nav/Filter; eigene Begriffsseiten `/glossar/[slug]` (Vollinhalt + verwandte Begriffe) statt Rausverlinkung; tote `/begriffe/`-Links behoben.
- Pruefung: typecheck+build gruen; Live-Datenshape verifiziert; Routen 307.
- Offen fuer Codex: OPTIONAL schlanker Per-Begriff-Abruf statt 17-MB-Registry (kein Blocker). Grundsatz: eine zentrale Datenbasis, Frontends rendern selbst.

### 2026-07-03 - Claude - Institut-App: Auth-Session-Fix + Forum-Struktur (0008)
- Status: abgeschlossen (live)
- Repo/Pfad: `woek-institut-app` — `middleware.ts`, `app/forum/*`, `app/components/DiscussionPanel.tsx`, `supabase/migrations/institut_0008_forum_structure.sql`
- Branch/Commit: `8e57106` (main)
- Geaendert: fehlende `middleware.ts` (@supabase/ssr Token-Refresh) → Nutzer bleiben eingeloggt. Forum: Rubriken + Zielgruppe ("fuer wen") + Diskussion an Dokumenten/Boards. Migration `institut_0008` von Codex angewandt + verifiziert.
- Pruefung: 4 neue Spalten in Supabase per REST bestaetigt; build gruen.
- Offen fuer Codex: —

### 2026-07-03 - Claude - Institut-App: Frag die WÖk + Wirkungscheck auf zentralem KI-Backend
- Status: abgeschlossen (live)
- Repo/Pfad: `woek-institut-app` — `app/api/ki/route.ts`, `app/api/wirkungscheck/route.ts`, `app/frag-die-ki/*`, `app/wirkungscheck/*`
- Branch/Commit: `fc8a4ba` (main)
- Geaendert: "Frag die KI"→"Frag die WÖk" (Proxy auf `/api/woek-ai`); "Wirkungscheck" korrigiert (war faelschlich Kommunal-KWI → jetzt Faktencheck `/api/factcheck`). Beide auf zentralem **Oracle-Backend** `https://130.162.217.58.sslip.io` (env `WOEK_AI_API_BASE`). akademie beantwortet nur OPTIONS, nicht POST → direkt Oracle.
- Pruefung: beide Endpunkte live per POST verifiziert (echte Antworten). maxDuration=60.
- Offen fuer Codex: Info — die KI-Tools liegen zentral auf Oracle; Frontends proxyn nur.

### 2026-07-03 - Claude - Institut-App: Wirkungsboard (Zoom/Notizzettel), Dev-Test-Login, Dashboard
- Status: abgeschlossen (live)
- Repo/Pfad: `woek-institut-app` — `app/wirkungsboard/[boardId]/BoardCanvas.tsx`, `app/dev-login|dev-logout/`, `lib/access.ts`, `lib/institut/dashboard.ts`, `app/dashboard/page.tsx`
- Branch/Commit: `2e6abce`, `3735c1b` (main)
- Geaendert: Board Zoom/auto-Flaeche/Notizzettel; Dev-Test-Login (`/dev-login`, nur `INSTITUT_DEV_TEST_LOGIN=1` UND non-prod); Dashboard "Woran ich arbeite" + "Woran andere arbeiten (oeffentlich)".
- Pruefung: im Browser via Dev-Login verifiziert (Board + Dashboard); Dev-Login in Prod nachweislich deaktiviert.
- Offen fuer Codex: —

### 2026-07-03 - Claude - QA-Abnahme PR #69 (Website-Repo, Release-Blocker Suchindex)
- Status: abnahmebereit — wartet auf Natalies Merge-Klick (Auto-Mode blockiert Merge durch Claude)
- Repo/Pfad: Website-Repo, PR #69 `ci/website-gates` → `main`
- Branch/Commit: PR #69 (Draft, Gate-Check gruen)
- Geaendert (Codex): Builder schliesst `.claude`/Worktrees/App-Repos aus; Guard prueft URL-Leaks; CI-Gate Reproduzierbarkeit/Privacy/URL-Baseline/Size.
- Pruefung (Claude): unabhaengig verifiziert — Guard-Muster korrekt, Builder-Ausschluss vorhanden, URL-Baseline 4624/0 Verseuchung. **QA-GO.**
- Offen fuer Natalie: "Ready for review" → "Squash and merge".

### 2026-07-03 - Claude - Video-Handoff empfangen (naechster Block)
- Status: vorbereitet / wartet auf Natalies Go zum Rendering-Start
- Repo/Pfad: `docs/CODEX-HANDOFF-videoskripte.md`, `docs/video-skripte/` (16 Skripte) → Ziel `assets/video/<slug>.mp4`
- Branch/Commit: —
- Geaendert: —
- Pruefung: Handoff + Skripte gelesen; Ablauf klar (Sprechertext → Audio in Natalies Stimme (Voice-TTS/XTTS) → Video → Ablage).
- Offen fuer Natalie: Start freigeben (Rendering ist ressourcen-/zeitintensiv, laeuft ueber das lokale Voice-Setup) und ggf. Reihenfolge/Batch-Groesse nennen.

### 2026-07-03 17:30 - Claude - Erklaervideos in Produktion + Hintergrundmusik
- Status: in Arbeit
- Repo/Pfad: `voice-tts/` (lokal); Ziel Erklaervideos `assets/video/<slug>.mp4`, Vorlesungen `voice-tts/video-final/`
- Geaendert: 11/16 Tier-1-Skripte maiwaldisiert vertextet (3 Fallstudien + 4 Einwaende + 4 Wirkungsfelder); Rendering laeuft autonom (video_render). Hintergrundmusik eingefuehrt: `add_music.sh` (loopt, 0.12, Fade-out, Ducking) unter ALLE Videos; 14 Vorlesungs-Videos bereits mit Musik in `video-final/`. Musik-Tracks in `voice-tts/music/` (suno).
- Pruefung: add_music an Vorlesung getestet (Stimme klar, Musik leise, Fade-out ok); Natalie hat Lautstaerke 0.12 bestaetigt.
- Offen fuer Claude: 5 restliche Wirkungsfeld-Skripte texten; IC-Video fertig rendern.
- Offen fuer Codex: fertige Videos einbinden — Erklaervideos auf Zielseiten (Skript-Kopf), Vorlesungen via GitHub-Release/videoUrl. Audio-only fuer lecture_media bleibt CLEAN (ohne Musik).

### 2026-07-03 18:20 - Claude - Audio→Video + Podcast-Musik (neue Straenge)
- Status: in Arbeit / Handoff offen
- Repo/Pfad: Handoff `woek-akademie-app/docs/CODEX-HANDOFF-audio-zu-video.md`; Skripte-Ablage `docs/video-skripte/audio-<slug>.md`; Podcast-Musik `voice-tts/podcast-music/`
- Geaendert: (A) 7 reine Audios → Videos: Audio wird wiederverwendet, Codex liefert Folien, Claude baut Video. (B) Podcast-Musik: Website/RSS-Version bekommt dezente Musik (0.08), Spotify bleibt; laeuft (laedt Release woek-podcast-audio-v1 + untermalt).
- Pruefung: add_music_audio.sh + Bett-Bau getestet an Videos; Podcast-Batch laeuft.
- Offen fuer Codex: (A) Folien fuer die 7 Audio-Stuecke schreiben (Ueberschneidungen mit bestehenden Videos pruefen). (B) podcast-music/-Dateien als neue Release-Asset-Version veroeffentlichen + RSS/Seiten aktualisieren.

### 2026-07-03 18:45 - Claude - Mein Wirkungsraum / WÖk-ID: noch nicht ueberall synchron
- Status: Spec fertig (Claude), Umsetzung offen (Codex)
- Repo/Pfad: Spec `docs/woek-id-meine-woek-konzept.md` (vollstaendig); Website hat `/mein-wirkungsraum`
- Befund: Website ✅, Akademie ❌ (nur Begriff, kein synchroner Nutzerbereich), Institut ❌. Also NICHT ueberall synchron.
- Offen fuer Codex (Kern/Auth-Lane): SSO-Cookie auf `.wirkungsoekonomie.de` (einmal einloggen = ueberall) + `woek_`-Datenlayer (woek_profiles/saved_items/notes/progress, Migrationen) gemaess Konzept-Doc.
- Offen fuer Claude: „Mein Wirkungsraum" auf der Akademie-Seite einbinden, sobald der woek_-Layer live ist (UI-Vorgabe steht im Konzept-Doc, Abschnitt 4).

### 2026-07-03 - Claude - Institut-App: Dokument-Mitwirkende (einladen) + Dashboard
- Status: abgeschlossen (Code live auf main) — Migration wartet auf Codex
- Repo/Pfad: `woek-institut-app` — `supabase/migrations/institut_0009_document_collaborators.sql`, `lib/institut/collaborators.ts`, `app/dokumente/[documentId]/CollaboratorInvite.tsx` + `page.tsx`, `app/dokumente/actions.ts`, `lib/institut/dashboard.ts`
- Branch/Commit: `5e7cd18` (main)
- Geaendert: Mitwirkende je Dokument einladen (einer/mehrere/alle per Checkbox+Alle/Keine); Dashboard "Woran ich arbeite" zeigt jetzt auch Dokumente, an denen ich eingeladen bin. Datenschicht degradiert graceful, solange die Tabelle fehlt.
- Pruefung: typecheck+build gruen. Vollstaendiger E2E-Klick braucht Migration 0009 + existierende Mitglieder/Dokumente.
- **Offen fuer Codex:** `npm run db:migrate` im `woek-institut-app`-Repo → bringt `institut_0009_document_collaborators` in Supabase (additiv, idempotent, im Runner ergaenzt). Danach `npm run db:verify`; kurze Notiz genuegt.

### 2026-07-03 - Claude - Tier-1-Erklaervideos: Sprechertext KOMPLETT (16/16)
- Status: abgeschlossen (Text) — Rendering laeuft ueber die bestehende Pipeline
- Repo/Pfad: `voice-tts/video-folien/` (lokal); Quellen `docs/video-skripte/`
- Geaendert: die 5 fehlenden Wirkungsfeld-Sprechertexte getextet (bildung, medien-oeffentlichkeit, produkte-konsum, staat-recht-demokratie, wirtschaft-unternehmen) im etablierten Format (TITEL + je 6× `## S0N` + `SPRECH:`), Armin-Maiwald-Stil. Damit **16/16 Tier-1 vertextet**.
- Pruefung: Struktur ok (je 6 Folien + 6 SPRECH); TTS-Check sauber — Akronyme in der Narration ausgeschrieben (Medienwirkungsindex, Key Impact Indicators, Nichtkompensation …). Rendering NICHT angestossen (batch.py/produce_lecture liefen aktiv auf Vorlesungen — CPU).
- Offen fuer Claude/parallele Voice-Session: die 5 neuen Slugs rendern (`video_render.sh`) und nach `assets/video/<slug>.mp4` ablegen.
- Offen fuer Codex: fertige `.mp4` auf den Zielseiten einbinden (Zielseite steht im Skript-Kopf, `wirkungsfelder/<feld>/`).

### 2026-07-03 19:30 - Claude - KORREKTUR: Website-Videos mit Musik jetzt als PR
- Status: abnahmebereit — wartet auf Merge
- Repo/Pfad: Website-Repo, PR #73 `claude/website-video-musik` → main; `assets/video/*.mp4` (18 Videos)
- Fehler zuvor: Musik-Versionen nur lokal gestaged (`voice-tts/website-videos-music/`), nie deployt → Live-Videos (z. B. /fuer/) hatten keine Musik. Jetzt behoben: 18 Videos im Repo ersetzt (IC-einfach ausgenommen).
- Pruefung: nur assets/video geändert; IC unangetastet; Push ok (2. Versuch).
- Offen fuer Natalie/Codex: PR #73 mergen (Achtung ~112 MB Media-Diff; ggf. Size-Gate pruefen). Perspektivisch Website-Videos auf GitHub-Release umstellen.

### 2026-07-03 - Codex - Studienskripte Sprint 2: V21-V24 ausgebaut
- Status: abgeschlossen als Tiefenskript-Arbeitsfassungen, nicht als Claude/PDF-final.
- Repo/Pfad: Website-Root `content/studienskripte/woek-g-v21.md` ... `woek-g-v24.md`, Word unter `docs/studienskripte/word-rohfassungen/`, App-Spiegel unter `woek-akademie-app/content/lehrgaenge/`.
- Geaendert: V21 Produkte/Technologien/Institutionen, V22 Wirkungssprache/Quellenklarheit, V23 Unsicherheit/Ambivalenz/Bewertung, V24 deeskalierende demokratiestaerkende Kommunikation auf substanzielle Arbeitsfassungen erweitert. Je Skript: Website-Referenzmaterial, Analysemodell, Modellformel, Fallfenster, pruefungsnahe Fallfragen ohne geschuetzte Antwortlogik, Rueckfluss.
- Pruefung: JSON ok, App-Typecheck gruen, V21-DOCX gerendert (27 Seiten) und visuell geprueft. Umfang je Master ca. 7.5k-9.2k Woerter.
- Offen fuer Codex: weitere Sprints V25-V28, V29-V32, V33-V36, danach V01-V19, WM V1-V10, WC V1-V10; Pruefungs-Pools geschuetzt weiter ausbauen.

### 2026-07-03 - Codex - Studienskripte Sprint 3: V25-V28 ausgebaut
- Status: abgeschlossen als Tiefenskript-Arbeitsfassungen, nicht als Claude/PDF-final.
- Repo/Pfad: Website-Root `content/studienskripte/woek-g-v25.md` ... `woek-g-v28.md`, Word unter `docs/studienskripte/word-rohfassungen/`, App-Spiegel unter `woek-akademie-app/content/lehrgaenge/`.
- Geaendert: V25 SDGs/Agenda 2030, V26 SDG+, V27 Kernfelder/Wirkungsgrenzen/rote Linien, V28 CSRD/ESRS/GRI/EU-Taxonomie/NACE/DPP auf substanzielle Arbeitsfassungen erweitert. Je Skript: Website-Referenzmaterial, Analysemodell, Modellformel, Fallfenster, pruefungsnahe Fallfragen ohne geschuetzte Antwortlogik, Rueckfluss.
- Extern geprueft: V25/V28 mit Primaerquellen UN SDG/Agenda 2030, EU-Kommission CSRD/Taxonomie/DPP, EFRAG ESRS, Eurostat NACE Rev. 2.1 und GRI.
- Pruefung: JSON ok; V28-DOCX gerendert (32 Seiten) und visuell geprueft. Umfang je Master ca. 7.3k-9.5k Woerter.
- Offen fuer Codex: Sprint 4 V29-V32, Sprint 5 V33-V36, danach V01-V19, WM V1-V10, WC V1-V10; Pruefungs-Pools geschuetzt weiter ausbauen.

### 2026-07-03 - Codex - Studienskripte Sprint 4: V29-V32 ausgebaut
- Status: abgeschlossen als Tiefenskript-Arbeitsfassungen, nicht als Claude/PDF-final.
- Repo/Pfad: Website-Root `content/studienskripte/woek-g-v29.md` ... `woek-g-v32.md`, Word unter `docs/studienskripte/word-rohfassungen/`, App-Spiegel unter `woek-akademie-app/content/lehrgaenge/`.
- Geaendert: V29 WÖk-IDs/Benchmarks/Archetypen, V30 Datenqualitaet/Audit/Unsicherheit, V31 von Einzelwirkung zu Netto-Wirkung, V32 Scorecards/Bewertungsprofile. Je Skript: Website-Referenzmaterial, Analysemodell, Modellformel, Fallfenster, pruefungsnahe Fallfragen ohne geschuetzte Antwortlogik, Rueckfluss.
- Pruefung: V32-DOCX gerendert (31 Seiten) und visuell geprueft. Umfang je Master ca. 8.0k-8.9k Woerter.
- Offen fuer Codex: Sprint 5 V33-V36, danach V01-V19, WM V1-V10, WC V1-V10; Pruefungs-Pools geschuetzt weiter ausbauen.

### 2026-07-03 - Codex - Studienskripte Sprint 5: V33-V36 ausgebaut
- Status: abgeschlossen als Tiefenskript-Arbeitsfassungen, nicht als Claude/PDF-final.
- Repo/Pfad: Website-Root `content/studienskripte/woek-g-v33.md` ... `woek-g-v36.md`, Word unter `docs/studienskripte/word-rohfassungen/`, App-Spiegel unter `woek-akademie-app/content/lehrgaenge/`.
- Geaendert: V33 NWI/T-SROI unterscheiden, V34 Reverse Merit Order, V35 Nichtkompensation gegen Greenwashing, V36 Scorecard lesen und begruenden. Je Skript: Website-Referenzmaterial, Analysemodell, Modellformel, Fallfenster, pruefungsnahe Fallfragen ohne geschuetzte Antwortlogik, Rueckfluss.
- Pruefung: V36-DOCX gerendert (30 Seiten) und visuell geprueft. Umfang je Master ca. 8.1k-9.6k Woerter.
- Offen fuer Codex: Grundstudium V01-V19, WM V1-V10, WC V1-V10; Pruefungs-Pools geschuetzt weiter ausbauen.

### 2026-07-03 - Codex - Studienskripte Sprint 6/7: Grundstudium V01-V20 ausgebaut
- Status: abgeschlossen als Tiefenskript-Arbeitsfassungen, nicht als Claude/PDF-final.
- Repo/Pfad: Website-Root `content/studienskripte/woek-g-v01.md` ... `woek-g-v20.md`, Word unter `docs/studienskripte/word-rohfassungen/`, App-Spiegel unter `woek-akademie-app/content/lehrgaenge/`.
- Geaendert: V01-V09 Grundlagenblock und V10-V20 Wirkungs-/Wirkungsraeume-Block auf substanzielle Arbeitsfassungen erweitert. Je Skript: Referenzmaterial aus dem aktuellen Website-/Grundlagenwerk-Korpus, Analysemodell, Modellformel, Fallfenster, pruefungsnahe Fallfragen ohne geschuetzte Antwortlogik, Rueckfluss.
- Pruefung: V20-DOCX gerendert (41 Seiten) und visuell geprueft. Grundstudium V01-V36 umfasst jetzt ca. 322k Woerter im Masterbestand.
- Offen fuer Codex: WM V1-V10, WC V1-V10; Pruefungs-Pools geschuetzt weiter ausbauen.

### 2026-07-03 - Codex - Studienskripte Sprint 8/9: WM + WC ausgebaut, 56/56 erreicht
- Status: abgeschlossen als Tiefenskript-Arbeitsfassungen, nicht als Claude/PDF-final.
- Repo/Pfad: Website-Root `content/studienskripte/`, Word unter `docs/studienskripte/word-rohfassungen/`, App-Spiegel unter `woek-akademie-app/content/lehrgaenge/`.
- Geaendert: Wirkungsmanagement V1-V10 und Impact-Controlling WC-V1-WC-V10 auf `tiefensprint-arbeitsfassung` erweitert. Je Skript: Referenzmaterial, Analysemodell, Modellformel, Fallfenster, pruefungsnahe Fallfragen ohne geschuetzte Antwortlogik, Rueckfluss.
- Gesamtstand: 56/56 V1-Vorlesungen im Index auf `tiefensprint-arbeitsfassung`; Masterbestand ca. 474k Woerter.
- Pruefung: WM10-DOCX gerendert (24 Seiten), WC10-DOCX gerendert (31 Seiten), beide visuell geprueft; JSON ok; App-Typecheck gruen.
- Offen fuer Claude: CI/PDF-/Reader-Finalisierung und Lektorat. Offen fuer Codex: geschuetzte Pruefungs-Pools mit Antwortlogik ausbauen.
