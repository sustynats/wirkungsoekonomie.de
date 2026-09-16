# Claude ↔ Codex - Gemeinsames Arbeitslog

Kurzlog für die Zwei-Agenten-Arbeit an der WÖk (Website / Akademie / Institut / Kern).
**Format je Eintrag:** Datum · Rolle · Was gemacht · Commit/Pfad · Geprüft · Offen für den anderen.
**Lanes:** Codex = QS / Kern / Daten / CI / Generatoren / Deploy / wissenschaftliche Skripte · Claude = Design / UI-UX / Folien / TTS / Audio / Video.
**Prozess:** kein direkter `main`-Push für live-relevante Änderungen → Branch + PR + Preview + grüne Checks + Abnahme.

---

### 2026-09-04 · Codex · Automatische rückwirkende Lageakten
- **Was:** Generische Darstellungsebene oberhalb der unveränderten Wirkungsakten. Zwei Entwicklungen bleiben einzeln; ab drei sicher verbundenen Meldungen entsteht beim Build rückwirkend eine Lageakte. Der neueste materielle Stand repräsentiert die Lage und rückt im Feed nach oben. Wiederholungen ohne neue Information tun das nicht.
- **Trennung:** Ereignisse, Quellen, Claims, Analysen, Versionen und alte URLs bleiben getrennt und vollständig nachvollziehbar. Die Zeitleiste ordnet nur den gemeinsamen Nachrichtenverlauf; es gibt keine Faktenübertragung zwischen Ereignissen.
- **Automatik:** Gesamtbestand und zukünftige Meldungen werden mit denselben Regeln geprüft. Enges Zeitfenster, seltene gemeinsame Begriffe, Titelüberlappung und Fallcharakter sind Pflicht; stark benannte Vorgänge können nach ruhigerer Phase fortgeführt werden. Feed, RSS/Atom/JSON, Web-App und Push sehen genau einen aktuellen Lageaktenstand.
- **Dubletten vor KI:** Unveränderte Feedwiederholungen werden über URL/Artikel-ID/Inhalts-Hash vor Clustering und KI verworfen; abhängige Agenturkopien bilden einen Recherchecluster. Regressionstest fordert null Kandidaten, null KI-Aufrufe, null Kosten, null Publikation und null Push für unveränderte Wiederholungen.
- **Bestandsprobe:** 14 zusammenhängende Stromnetz-/Umspannwerk-Entwicklungen bilden eine Lageakte. Allgemeine Cyber-, internationale Angriffs- und Hintergrundmeldungen bleiben getrennt. Fremdthemen-Regressionsprobe mit einem synthetischen Insolvenzfall.
- **Pfade:** `scripts/news/case-files.mjs`, `scripts/news/build.mjs`, `scripts/news/validate.mjs`, `tests/news/case-files.test.mjs`, `docs/ops/WIRKUNGSTICKER-LIVING-FILES.md`.

### 2026-09-04 · Codex · Eingabegrenzen und reale Tokenbudgetierung
- **Ursachen:** 325 identische Abhängigkeitsvermerke aus 26 Dokumenten; gemeinsame 8-Cent-Pauschale zusätzlich zum tokenbasierten Nachrichtenjournal.
- **Fix:** Exakte Abhängigkeitsvermerke mit Anzahl statt Wiederholungen; zweite verlustfreie Transportstufe für große Eingaben. Alle Dokumente, Claims, Rollen und Widersprüche bleiben erhalten. Keine neuen KI-Stufen mit zusätzlichen Kosten.
- **Oracle:** Tokenbasierte gemeinsame Reserve mit UUID/atomarem Journal; beide Budgetgrenzen erhalten. Geprüfte Migration entfernt nur 531 nachgewiesene Pauschalbuchungen, übernimmt das vollständige Newsjournal und behält unklare Altkosten als Reserve. Patch und Rückfallplan: `docs/ops/WIRKUNGSTICKER-TOKEN-BUDGET-REPAIR.md`.
- **QS:** 204 Nachrichtentests, 12 Monitortests; 47 Server-Tests, TypeScript und Build. Offline-Wiederlauf aller 29 anstehenden Kandidaten: keine Größenblockade, maximal 36.374 Zeichen, null Anbieteraufrufe. Server-Budgetfix 17:32 UTC aktiv; Worker-/Live-Abnahme separat.

### 2026-09-04 · Codex · Allgemeine Eingabe- und Wiederholungsprüfung
- **Was:** Verlustfreie Textreferenzen und Metadaten-Defaults für alle KI-Anfragen; Größenprüfung vor Slotvergabe; geänderte Artikelauszüge zuerst; dauerhafter, begrenzter Prüfstand für bereits geprüfte Updates. Keine Quellenzahlgrenze, keine abgesenkten Publikationsgates, keine Scheinversionen/Pushs für unveränderte Akten. Lokale Größenfehler getrennt von Providerfehlern und echten kostenpflichtigen Anfragen.
- **Pfade:** `scripts/news/evidence-packets.mjs`, `lib.mjs`, `run.mjs`, `check-run-health.mjs`, Discord-Monitor und Regressionstests; Betriebsvertrag `docs/ops/WIRKUNGSTICKER-EVIDENCE-PACKETS.md`.
- **Prüfung:** Offline-Wiederholung aller 37 prüffähigen Queue-Kandidaten des Stands `5ae5af8f`, keine lokale Größenblockade; größte Akte 15 Quellen. Reine Tests, keine KI-Kosten oder redaktionelle Bestandsänderung. Volltests, Build/Validator und echte automatische Lauf-/Release-Abnahme separat durchführen.
- **Kosten/Hosting:** unverändertes 25-EUR-KI-Budget; bestehende GitHub-/Oracle-Verarbeitung, kein Vercel-Build. Einsparbetrag erst anhand realer Verbrauchsdaten bewerten.

### 2026-09-04 · Codex · Lebende Akten, Bestandsdubletten und Themenverweise
- **Aktenzuordnung:** Bekannte Dokumente werden vor unbekannten Batch-Clustern aufgelöst. Dokument-IDs überstehen geänderte Publisher-Slugs; konkrete Orts-/Gegenstandsgrenzen verhindern reine Themenfusionen. Automatische hochsichere Konsolidierung läuft vor KI und Retry.
- **Bestand:** Drei ältere Dormagen-Meldungen und eine Jänschwalde-Meldung transparent archiviert und mit den fortgeführten Akten verlinkt. Keine historischen Inhalte, Belege oder Versionen gelöscht; Quellvereinigung wird erneut geprüft. Keine künstlich neuen Nachrichten-/Versionsdaten.
- **Lesen:** Höchstens fünf konkrete Themenverweise pro Detailseite, keine Auffüllung durch bloße Rubrikgleichheit, keine Archiv-/Selbstverweise. Mobile/desktop Browserkontrolle und Leseweg über Themenlinks bestanden.
- **QS:** 164 News-Tests grün, darunter headless Konsolidierung/Retry, Orts- und Ländertrennung, URL-Aliase, historische Erhaltung und nächste Versionspublikation. Gleichheit von Akteuren oder Gericht allein ist kein Themenverweis. Eine separate Feed-/Seitenrevision aktualisiert auch archivierte Auswahllisten, ohne neue Nachrichten oder Push zu erfinden. News-Build, Validierung, Suchindex und Taxonomie lokal geprüft; PR-/Live-Abnahme folgen.
- **Betrieb:** `docs/ops/WIRKUNGSTICKER-LIVING-FILES.md`. Kein Vercel-Build: erneutes Kostengate rot (vier Slots verbraucht). Akademie-Analytics bleibt separat offen, keine neue Datenerhebung und keine Umgehung des Budgets.

## 2026-09-03

### 2026-09-04 · Codex · Bildabnahme und halbtransparenter MPD-Overlay (PR #348)
- **Abnahme:** Neun freigegebene Bestandsmotive genau einmal mit Nano Banana Pro angefragt (18 Credits reserviert). Sechs konkrete Motive nach Hash-, OCR- und Sichtprüfung übernommen. Zwei Anbieterfehler bleiben ohne neue kostenpflichtige Wiederholung; ein Motiv mit erfundenen Beschriftungen wurde zusätzlich manuell gesperrt. Bei diesen drei Akten bleibt das bisherige Original erhalten; private Journale/Originale sind gesichert.
- **Overlay:** Alle neun aktuellen Editorials in OG/Wide/Square mit `woek-title-3-glass` neu gerendert: Panel 62 % deckend, Hintergrund 38 % sichtbar, Beschriftung und Meter vollständig deckend. Die sechs freigegebenen Originale wurden lokal wiederverwendet, keine zweite Generierungsrunde. Unveränderliche Medien liegen in GitHub Releases.
- **Oracle:** Adapter und konkrete Promptvorgaben ausgerollt, OCR auf einen Thread und 30 Sekunden je Durchgang begrenzt; Qualitätsanforderungen unverändert. Backup `backups-title-20260904-CTsfZ6/adapter-before.tgz`, Healthcheck 200, unberechtigter Bildaufruf 403. Temporäre SSH-Regel nach Wartung entfernt, übrige Netzwerkregeln unverändert. Ein 502 während des Neustarts blieb als degradierter Nachrichtenlauf mit erhaltener Queue sichtbar; kein stiller Erfolgsstatus.
- **Geprüft:** 152 News-Tests und echte PNG-Sichtprüfung. Finale Main-Synchronisierung, PR-/Pages-Gates und öffentliche Release-Verifikation folgen. Keine Änderung an Quellenfiltern, KI-/Credit-Limits oder Vercel.

### 2026-09-04 · Codex · Freigegebene Erneuerung vorhandener Symbolbilder
- **Auftrag:** Nach ausdrücklicher Nutzerfreigabe bestehende abstrakte Motive durch konkrete, nachrichtenbezogene Symbolbilder ersetzen; sensible Themen bleiben Wirkungskarten.
- **Umsetzung:** Begrenzter opt-in `--refresh-editorial`, persistente Restqueue, revisionsgebundene Oracle-Journale und unveränderte Credit-Limits. Alte Bilder bleiben bis zum vollständigen Erfolg sichtbar; alte Originale und Journalhistorie erhalten. Keine neue Meldung/Push allein durch Bildwechsel.
- **Geprüft:** 151 News-Tests inklusive einmaliger Ersatzgenerierung, Wiederholungen ohne Doppelzahlung, unklarer Submit, Erhalt alter Bilder bei Fehlern und begrenzter/dry-run-sicherer Auswahl. Reale Generierung und Release-Verifikation folgen.
- **Oracle:** Nutzer bestätigt temporäre SSH-/32-Freigabe für den Rollout, nach Abschluss entfernen. A1-Free-Tier-Hinweis betrifft die vorhandene E2.1.Micro nicht; kein Tarif-/Shape-Wechsel.

### 2026-09-04 · Codex · Wirkungsticker: Installation, Bild-Overlay und Quellenlinks
- **Was:** Prominenter Installationshinweis zwischen Hero und Suche, mit bestehendem Installationsweg verknüpft. iPhone/iPad-Anleitung, native Chromium-Installation nur nach Klick, ausblendbar für 30 Tage, keine Werbung im Standalone-Modus. Service-Worker-/Asset-Version `20260904-reader2`; keine Neuinstallation erforderlich.
- **Bilder:** Identisches „Wirkung auf“-Panel auch auf Editorials, in allen drei Formaten; dunkler Kontrasthintergrund, reservierter Titelbereich. Zehn vorhandene Motive render-only neu gerahmt und 30 unveränderliche PNGs in GitHub Releases abgelegt, null Higgsfield-Aufrufe. Quellen, Nachrichtentexte, Datumswerte und Versionen unverändert. Original-Promptprovenienz bleibt v2. Neue Promptvorgabe v3: konkrete gegenständliche Motive statt pauschaler abstrakter Netzwerke; sensible Themen weiterhin Wirkungskarte.
- **Belege:** Im geprüften Stand 25/45 aktive Akten mit mehreren Textstellen derselben URL (71 Claims). Darstellung jetzt pro Claim und Quellartikel ein benannter Link mit Zahl unterschiedlicher Textstellen. Interne Belege/Einzelquellenstatus bleiben unverändert; keine zusätzliche Unabhängigkeit suggeriert.
- **Geprüft:** 146 News-Tests, Build/Validator, echte Chrome-Rasterisierung OG/Wide/Square; Mobile 320/390 px ohne horizontalen Überlauf, Beispiel Bundeswehr mit genau einem Link je Aussage. Vor Freigabe zusätzlich PR-CI und Live-Prüfung.
- **Offen:** Neue Bildvorgaben müssen auch in der Oracle-Adapterkopie ausgerollt werden; SSH derzeit Timeout, Browseranmeldung abgelaufen, Nutzer um erneute Anmeldung gebeten. Akademie-Analytics: getrenntes Vorhaben, Vercel-Buildkostengate rot; kein Umgehen, kein Vercel-Build ausgelöst.

### 2026-09-04 · Codex · Wirkungsticker: Merken und Wisch-Leseweg
- **Was:** Merken direkt auf jeder Nachrichtenkarte und zusätzlich am Detailseitenende; dieselben `WoekUserSpace`-Einträge, Konto-Synchronisierung und Entfernen-aus-Sammlungen wie bisher. Gemeinsamer Buttonzustand und Link zur bestehenden Merkliste, keine zweite Datensammlung.
- **Navigation:** Links wischen öffnet die nächste Meldung, rechts den tatsächlichen vorherigen Lese-Schritt (Übersicht → A → B → A → Übersicht). Direkteinstieg fällt sicher auf die Übersicht zurück. Browser-History bleibt erhalten; Abschnittslinks erzeugen keine Schein-Seiten. Rückkehr stellt Filter, nachgeladene Karten und Scrollposition wieder her.
- **Schutz:** Vertikal-/Mehrfinger-/Zoom-Gesten, Textauswahl, Formulare, Links, horizontale Scrollbereiche und sichtbare Dialoge bleiben unbeeinträchtigt; Bildschirmränder bleiben nativen Browsergesten vorbehalten. Sichtbare Navigation bleibt als Alternative vorhanden.
- **Geprüft:** 135 News-Tests einschließlich 10 neuer Leseweg-/Merken-Tests; News-Build/Validator, Suchindex/Taxonomie, 390px-Browser ohne Überlauf/JS-Fehler. Karten-Merken → Detailzustand → bestehende Merkliste und Wischfolge mit Wiederherstellung von Scrollposition 5057 geprüft. Keine Filter-, Quellen-, Budget- oder Hostingänderung.
- **Kostenbeobachtung:** Zusätzliche tägliche Codex-Beobachtung um 09:00 eingerichtet (braucht laufende Desktop-App); serverseitige Kostenerfassung und 25-EUR-KI-Grenze bleiben unabhängig davon. Richtwert 1 EUR/Tag, kein stilles Anheben auf 30 EUR.

### 2026-09-04 · Codex · Automatische Titelbilder und App-Abschluss
- **Was:** Claudes Titelbildsystem unverändert als Basis, offizielle Higgsfield-CLI 1.1.24/Nano Banana Pro auf Oracle; persistente Originale/Job-ID/Creditreservierung; konservative Moduswahl, OCR, Fallback; drei Größen über gepinntes Chrome/DevTools; immutable GitHub-Releases, sichere öffentliche Metadaten. Einmalig beauftragter Backfill mit dauerhafter Restqueue.
- **App:** freiwilliger Erstbesuch-Push-Hinweis, keine generischen Begriffsfragen im Ticker, Leserinformation statt öffentlicher Kostenregeln. Teilen und Rückkehrposition bleiben erhalten.
- **Nachrichten:** 12 Kandidaten/Lauf, 48 Aufrufe/Stunde innerhalb des bisherigen Monatsbudgets; begrenzte Laufzeit; Statuskonsistenzgate. Einkommensteuerreform als Regierungsentwurf berichtigt, frühere Fassung erhalten, sichtbarer Korrekturhinweis.
- **Geprüft:** 115 News-Tests, Build/Validator, vier Backend-API-Tests/Typecheck/Build; echte OG/Wide/Square-PNGs; 390px-Browseransicht ohne Überlauf, zwei Teilen-Buttons, drei Rücklinks, keine Begriffsfragen. Release-Abnahme wird nach dem Merge protokolliert.
- **Grenze:** kein Versprechen 100-prozentiger Nachrichtenabdeckung/Faktenfehlerfreiheit oder unbegrenzter Higgsfield-OAuth-Laufzeit. Details und reproduzierbarer Backend-Patch: `docs/ops/WIRKUNGSTICKER-TITELBILD-PIPELINE.md`.

### Codex · Wirkungsticker: 503-Resilienz und verlässliche Aktualisierung
- **Was:** Vier versetzte Laufchancen pro Stunde mit genau einem KI-Aufruf pro Lauf; persistentes rollendes Limit von vier Aufrufen in 60 Minuten; frische Meldungen und materielle Aktenupdates vor alten Filter-Neubewertungen. Reports unterscheiden `ok` und `degraded`, erfolgreiche und versuchte Läufe werden getrennt geführt, und der abschließende Health-Check macht 503 sowie Quellenlücken sichtbar rot, ohne Queue oder bereits erfolgreiche Teilresultate zu verlieren. Pages wird nur bei einer echten öffentlichen Story-Änderung ausgelöst; Queue-Commits allein führen nicht zu App-Neuladungen oder Releases.
- **Pfade:** `.github/workflows/wirkungsticker.yml`, `scripts/news/run.mjs`, `scripts/news/build.mjs`, `scripts/news/check-run-health.mjs`, `tests/news/wirkungsticker.test.mjs`, `docs/ops/WIRKUNGSTICKER.md`.
- **Geprüft:** Ticker-Tests, Generator, Validator und Health-Check; anschließend manueller Ticker-only-Release und Live-Prüfung.
- **Offen:** Serverseitige Ursache des Oracle-503 separat anhand der Instanzdiagnose beheben. Auftrag B (Titelbildpipeline/Higgsfield) bleibt bis zur stabilen Nachrichtenversorgung zurückgestellt.

### Codex · Wirkungsticker: KI-Visuals aktiviert und mobiler Lesefluss ergänzt
- **Was:** `VISUALS_SCHEMA` und `VISUALS_PROMPT_RULES` in den bestehenden WÖk-KI-Prompt eingebunden; `sanitizeVisuals()` läuft vor dem allgemeinen Qualitätsgate und schreibt verworfene Elemente in `report.visuals_dropped`. Detailseiten erhalten einen zweiten Teilen-Button am Seitenende, Navigation zu neuerer/nächster Meldung und Rücklinks zur Übersicht. Die Übersicht merkt Filter, Suche, Nachladeumfang und Scrollposition lokal im Sitzungsspeicher und stellt die vorige Leseposition wieder her.
- **Pfade:** `scripts/news/lib.mjs`, `scripts/news/run.mjs`, `scripts/news/validate.mjs`, `tests/news/wirkungsticker.test.mjs`; nutzerbeauftragte Ergänzung in Claudes UX-Lane: `scripts/news/build.mjs`, `assets/js/news.js`, `assets/css/news.css`.
- **Geprüft:** Pipeline- und UX-Tests, Generator, Validator sowie mobiler Browserfluss einschließlich Rückkehrposition, Blättern und beider Teilen-Schaltflächen.
- **Offen:** Auftrag B (automatische Titelbildwahl, Higgsfield und CI-Rasterizer) bleibt bewusst ein eigener späterer Schritt.

### Claude · Wirkungsticker: visuelle Anker, UX-Umbau, Titelbildsystem (Branch `claude/wirkungsticker-visual-ux`)
- **Was:** Neues Modul `scripts/news/visuals.mjs` (Icons, Dimensionsmeter, Verfahrensstand, Wirkpfad-Grafik, Auf-einen-Blick, Vertrag + Sanitizer für KI-Visuals). Übersicht: Meldungen direkt nach dem Hero, Toolbar mit Suche/Aktualisieren, gruppierte Filter mit Zählern, Karten mit Quelle/Status/Metern, ganzflächig klickbar; Filterleiste klebt jetzt unter dem sticky Header (lag vorher dahinter). Detailseite: Primärquelle als Button, Auf-einen-Blick, Abschnittsnavigation, Codex-Abschnitt „Worum geht es?“ integriert, Wirkpfad als Grafik, Risiken, Bedeutung als Kacheln, Quellenakte mit Herausgeber-Badges, Versionsverlauf als Zeitleiste. Titelbildsystem `scripts/news/title-image/` mit zwei Modi (Editorial Symbolbild, Wirkungskarte), SVG-Renderer ohne Abhängigkeiten, Rasterizer-Adapter, Vorschauen in `scripts/news/title-image/previews/`.
- **Pfade:** `scripts/news/visuals.mjs`, `scripts/news/build.mjs`, `assets/css/news.css`, `assets/js/news.js`, `assets/js/news-pwa.js`, `scripts/news/title-image/*`, `tests/news/visuals.test.mjs`, `tests/news/title-image.test.mjs`, `docs/ops/WIRKUNGSTICKER.md`, `docs/ops/WIRKUNGSTICKER-TITELBILD.md`, `docs/handoff-wirkungsticker-visuals-codex.md`.
- **Geprüft:** `npm run news:test` (alle Tests grün), `npm run news:build`, `npm run news:validate` grün; Screenshots Desktop/Mobile lokal; Titelbild-Vorschauen in beiden Modi und drei Größen.
- **Offen für Codex:** Auftrag A (KI-Visuals im Prompt + Sanitizer vor dem Gate) und später Auftrag B (Titelbilder, Higgsfield, Moduswahl, CI-Rasterizer) laut `docs/handoff-wirkungsticker-visuals-codex.md`. Keine Pipeline-, Workflow- oder Cron-Änderungen durch Claude.

---

## 2026-08-05

### Codex · Finales PDF der kooperativen Wirkungsordnung (Release)
- **Was:** Finales 331-seitiges PDF unter `/assets/downloads/woek_grundlagenstudie_kooperative_wirkungsordnung_v0_1.pdf` als separaten, additiven Release veröffentlicht; bestehende Kurse, Reader und Akademie-Assets bleiben unverändert.
- **Geprüft:** SHA-256 der Übergabe stimmt; vollständiger `npm run build` erfolgreich; Release-Diff und `git diff --check` grün.

---

## 2026-07-25

### Codex · Freigegebene Studienskripte als Lesefassungen (Release vorbereitet)
- **Was:** 49 ausschließlich von Claude freigegebene Master sind als verlinkte öffentliche Lesefassungen unter `bibliothek/studienskripte/` erzeugt. Nicht freigegebene Skripte bleiben unveröffentlicht; PDF, Video und Präsentationen sind kein Release-Gate.
- **Geprüft:** vollständiger `npm run build` erfolgreich; alle 49 Freigaben haben Master und Leseseite; `git diff --check` grün.
- **Offen für Claude/Codex:** Finale Medienassets bei eigener Übergabe einzeln ergänzen.

## 2026-07-03

### Codex → Claude · Video-Skripte-Handoff (offen für Claude)
- Video-Handoff: `docs/CODEX-HANDOFF-videoskripte.md`
- Tier-1-Video-Skripte: `docs/video-skripte/`
- **Offen für Claude:** Sprechertext, Audio-QS, Video-Rendering, Ablage unter `assets/video/<slug>.mp4`.

### Codex · Website Content-QS + Deploy-Wurzelfix (live)
- WS3: interne Redaktions-/Spec-Reste entfernt (werkzeuge-Stubs, Apfel-Doku „interne Dokumentation", „8. Online-Darstellung"-Produktionsspec) - generatorbasiert, URL-erhaltend. Audit: `reports/content-cleanup-findings.md`.
- **Deploy-Wurzelfix:** GitHub Pages von `legacy` → **`build_type: workflow`**. Jetzt liefert `deploy.yml`/`_site` aus; reine Quellen-/Generator-Fixes gehen automatisch live (kein Output-HTML-Commit nötig). Der ~324-Dateien-Rückstand (Legacy servierte veraltetes committetes HTML) ist aufgelöst.
- **Geprüft:** `bash scripts/quality/url-baseline-diff.sh` = 0 removed (4624/4624); Live-Stichproben HTTP 200; Fonts/Fixes live.
- **Offen (Codex):** CI-Gates noch aufsetzen - Website-PR-Check mit Suchindex-Build, Privacy-/Leak-Scan, `url-baseline-diff` als Gate.

### Codex · Institut-Teaser-Seite (live via PR)
- Neue öffentliche Seite `/institut/` + Footer-Link „Wirkungsinstitut" (Gruppe Lernen). Generatorbasiert.
- **Pfade:** `scripts/site/build-institut-teaser.mjs` (neu), `assets/data/navigation.json`, `package.json`.
- **Commit:** PR #70 → squash-merged auf `main` (`dda16982f5`). CTA „Am Institut mitwirken" → `institut.wirkungsoekonomie.de/bewerbung`.
- **Geprüft:** Generator läuft, Preview ok, additiv (nur neue URL `/institut/`, keine entfernt). Live-Verifikation nach Deploy.
- **Offen für Claude:** optionaler Ton-/Design-Feinschliff der Teaser-Copy (bewusst faktisch gehalten).

### Codex (in Claudes Lane, hiermit übergeben) · Design-Refresh (live)
- Selbst-gehostete Schriften **Inter + Source Serif 4** (woff2, DSGVO-konform) + Typo-/Responsive-Layer als reversibler Override-Block am Ende von `assets/css/style.css`; Fonts in `assets/fonts/`.
- **Commit:** `19fb09f664`. Vorher waren die im CSS referenzierten Fonts nicht geladen (System-Fallback).
- **Hinweis:** Das ist Claudes Design-Lane - von Codex nur committet, weil vom Nutzer direkt beauftragt.
- **Offen für Claude:** Design gehört ab jetzt Claude; kann darauf aufsetzen oder anpassen. Codex fasst Design-/App-UX-/Folien-/TTS-/Video-Dateien nicht mehr an.

### Codex · Website-Release PR #71/#69/#67 (live)
- **Veröffentlicht:** PR #71 `feat/akademie-zwei-zugaenge` (`b1ee3a4`), PR #69 `ci/website-gates` (`523c5c9`), PR #67 `glossary-relations` (`e599087`).
- **Inhalt:** Akademie-Seite mit zwei klaren Zugängen; CI-/Privacy-/URL-Gates für Website-PRs; zentrales Glossar-Beziehungsnetz als `assets/data/glossary-relations.json`.
- **Deploy:** GitHub Pages Workflow `deploy.yml` grün, Run `28674403646`.
- **Geprüft:** `npm run build && npm run build:artifact && bash scripts/quality/url-baseline-diff.sh`; URL-Baseline `4622`, aktuelle URLs `4623`, `removed = 0`, neu/erlaubt: `/institut/`.
- **Live-Smoke:** `/`, `/akademie.html`, `/institut/`, `/begriffe/output/` jeweils HTTP 200; alte Akademie-Metaphrase `0` Treffer; `assets/data/glossary-relations.json` HTTP 200.
- **Privacy:** statische personenbezogene Zertifikats-Detailseiten sind nicht öffentlich erreichbar; Zertifikatsdaten bleiben ueber Backend/geschuetzte Quelle zu verifizieren bzw. berechtigt auszuliefern, nicht aus dem oeffentlichen GitHub-Artefakt.
- **Nicht gemerged:** PR #65 bleibt Claudes Design-Lane; PR #68 ist durch #69 ueberholt; alte/unklare PRs #2/#9/#13/#14/#16 bleiben separat zu triagieren.

### Claude · Hauptdomain-Redesign P1: erleben.html + akademie.html aufgeteilt (Worktree, uncommitted)
- **Branch:** `claude/hauptdomain-redesign-p1` (Worktree `woek-redesign-p1`), noch nicht committet.
- **erleben.html** 83K → 51K: Landing mit Intro, 4 Teaser-Karten, Kompass, Quiz- und Mini-Werkzeugkasten. Große Simulatoren verbatim verschoben auf neue Unterseiten `erleben/produktwirkung.html` (#simulator + #alltag + #scanner + Abschlusskarten), `erleben/medienwirkung.html` (#medienwirkung + #scorecard-demos), `erleben/plattformen.html` (#plattformwirkung), `erleben/risiko.html` (#risikolabor).
- **akademie.html** 82K → 29,7K: Übersicht mit Modul-Karten; Details verbatim auf `akademie/lernpfad.html` (+Video, Was-ist, Zielgruppen), `akademie/studienstruktur.html` (Studium + Curriculum + Vertiefungen v3.2), `akademie/pruefungen.html` (Prüfungstabelle + FAQ + FAQPage-Schema + App-Sektion), `akademie/weiterbildung.html` (Weiterbildung + Aufbaupfade WÖk-A + Meisterstufe).
- **Deep-Links:** Anker-Weiterleitungs-Skript im Head beider Landings (hash → Unterseite, Query bleibt erhalten) + Stub-IDs auf Teaser-Karten. Extern verlinkte Anker (#simulator ×20, #medienwirkung, #risikolabor, #scanner, `akademie.html#studienstruktur` aus main.js, `#lernpfad` aus glossary-model.json) funktionieren weiter.
- **erleben.js:** unverändert - alle 17 Modul-Inits sind bereits mit `if (!root) return;` geguardet, top-level Konstanten null-sicher; `node --check` grün.
- **Geprüft:** JSON-LD-Parsing, Tag-Balance, Anker-Integrität, alle 10 Seiten HTTP 200 via lokalem http.server, keine relativen Link-Fehler in Unterseiten.
- **Hinweis:** `erleben/index.html` ist KEIN Redirect-Stub, sondern 88K-Vollduplikat von erleben.html (kanonisches `/erleben/`) - unangetastet; sollte später mit der neuen Landing-Struktur synchronisiert werden (Codex/Generator?). `akademie/index.html` ist Redirect-Stub auf akademie.html (unangetastet). Sitemap-Einträge für die 8 neuen URLs offen.

### 2026-07-05 - Claude - Hauptdomain P1+P2 komplett: Sanierung + Stranded-Assets (PR #91, abnahmebereit)
- Status: abnahmebereit. Branch claude/hauptdomain-redesign-p1, PR #91 (8 Commits). Alle PR-Gates lokal gruen (search-Artefakte committet, privacy, url-baseline, size, public-language); voller Build-Testlauf fehlerfrei.
- P1: Gold-Kontrastsystem + 35 Mobile-Grid-Fixes + Heading-Beruhigung (style.css); blog.html 213K->103K + sitemap -13 Stubs; Google-Fonts-CDN aus 94 Blogseiten (DSGVO); Lernpfad verstehen->wirkungsoekonomie->modell->vergleich; index 19->12 Sektionen; erleben/akademie in 8 Unterseiten (Anker-Weiterleitungen); fuer/investoren+gesundheit+wissenschaft ausgebaut; 137 CTAs konkretisiert.
- P2: /stranded-assets/ (Dossier + clientseitiger Rechner Auto/Haus/Unternehmen mit Schwaechstes-Feld-Logik + Erklaervideo 4,5 Min XTTS-QS-bestanden + Transkript); /verstehen/ausgangslage/ (Systemdiagnose); Verlinkung aus 5 Seiten. Positionierung: Resilienz/Risiko-Register (Natalie 04.07.), Nachhaltigkeit nur Fremdreferenz.
- Uebergabe an Codex: docs/claude-codex-arbeitsauftrag-deploy-p1p2.md (Merge+Smoke-Test; nicht blockierend: API-Domain statt Oracle-IP-Fallback, sdg-plus/downloads-Duplikate, generate_fuer_pages-Drift, CTA-Rest in wirkungsfelder-Tiefe, url-baseline neu einfrieren).
- Hinweis: Agenten-Limit (monthly spend) schlug waehrend P2 zu; Stranded-Assets-Teil daher von Claude direkt gebaut und browser-getestet (6 Proberechnungen monoton ueber Szenarien).
- Nachtrag 2026-07-05: 5-Block-Startseite ebenfalls in PR #91 (Commit 953833ca8a): Diagnose/Loesung/Entscheidungsgrid/Vertrauen/Weiterfuehrend, 51K->42K, Link-Check + Gates erneut gruen, Suchindex aktualisiert. Deploy-Freigabe Natalie: P1+P2 komplett.

### 2026-07-25 · Codex · Nachtrag zu PR #171: Suchindex synchronisiert

- Die freigegebenen Studienskript-Lesefassungen aus PR #171 waren bereits in `main`; der PR-Gate meldete ausschließlich fehlende generierte Suchartefakte.
- Nachgeneriert und separat nachzureichen: `assets/search/search-index.json` sowie `public/data/woek-search-meta.json` (nur die neuen öffentlichen Studienskript-Routen und -Abschnitte).
- Vollbuild, Taxonomie-, Privacy-, URL-, Link- und Größenchecks sowie `git diff --check` liefen im frischen Worktree erfolgreich. Keine Reader-, Kurs- oder PDF-Datei wird durch diesen Nachtrag geändert.

### 2026-07-08 · Claude · Presse-/Öffentlichkeitsbereich Natalie Weber strategisch umgebaut
- **Was:** `/w/natalie-weber/` Presse-Bereich weg von „Person buchen" hin zu institutioneller Kommunikation. Presse-Unterseite komplett neu (Öffentliche Kommunikation / Keine personenbezogene Auftrittslogik · Kurzprofil · Institutionelle Kommunikation · Zitate & Statements zur Verwendung · Materialien für Medien · Multiplikator:innen statt Personenkult · Akademie für Multiplikator:innen mit 10-Modul-Raster). Hauptseite: Kontaktsektion → „Öffentliche Kommunikation" + „Presse & Anfragen" (souverän, nicht defensiv, keine privaten Gründe). FAQ +3 (Interviews/Vorträge, Medienanfragen, Multiplikator:innen).
- **Pfad/Quelle:** `scripts/natalie/build-natalie-pages.mjs` (einzige Quelle; neue CSS-Bausteine `.quote/.notice/.modules`), regeneriert 8 `w/natalie-weber/*`-Seiten. Konzept: `docs/akademie-multiplikatoren-konzept.md`.
- **Geprüft:** voller `npm run build` EXIT 0; alle 7 Presse-Sektionen + neue FAQ vorhanden; alte Auftrittsformeln (`Vorträge & Panels`, `Interviews & Gespräche`, `Für Interviews, Vorträge…`) = 0 Treffer; Browser-Sichtprüfung aller Blöcke (Zitate, Materialien, dunkles Vertretungs-Band, 01-10-Modulraster) sauber.
- **Offen für Codex/Kern:** Akademie-App-Integration „Multiplikator:innen für Wirkungsökonomie" (Rollen multiplikator/trainer/fachpartner, Zertifikatsausgabe, Personenverzeichnis über Akademie-API); Rollen-/Rechteverwaltung von Discord auf Plattform holen (Snowflake-ID-Fehler). Claude-Folge-PR: öffentliche Landingpage `/akademie/multiplikatoren/` im Akademie-Farbraum nach Abnahme des Konzepts.

## 2026-08-14 - Claude: Phase 0 „WÖk Knowledge Bootstrap" - Wissensbasis docs/woek-knowledge/ angelegt

- Vollinventur über Website-Repo (origin/main a88d2941), Akademie-App-Repo (`woek-akademie-app`) und Wirkungscheck-Stände; Live-Check der drei Domains (alle 200; parlament.* existiert noch nicht). 28 Dateien unter `docs/woek-knowledge/` (README, SOURCE_HIERARCHY + reference-manifest.yaml, TERMINOLOGY(+yaml, Basis Begriffsleitfaden **v1.3**), NORMATIVE_FRAMEWORK (SDG/SDG+-Referenzrahmen v0.3), INDICATOR_REGISTRY (Master Items **v1.3**, 621 IDs/28 Regeln), TOOLS(+yaml), PORTALS(+yaml, Rang 0-24), INTEGRATIONS(+yaml), REGIONAL_DATA, WOEK_AI, INSTITUTE, ACADEMY, CONTENT_REGISTRY, SYSTEM_ARCHITECTURE, CAPABILITY_GRAPH(+json), CAPABILITY_MATRIX, DUPLICATION_AND_TECH_DEBT, KNOWLEDGE_GAPS, PARLIAMENT_REUSE_MAP, UX_ECOSYSTEM_MAP, CHANGELOG, CROSSCHECK, TECHNICAL_CAPABILITY_MAP-Rahmen).
- Versionssicherheit verbindlich verankert: Bibliotheks-Statusregister (`assets/data/library-version-registry.json`, 11× führend) schlägt lokale Dateien; v1.2-Master-Items/v1.0-Begriffsleitfaden/T-SROI-Whitepaper als ersetzt/archiviert geführt.
- **Offen für Codex** (Details `docs/woek-knowledge/CROSSCHECK.md`): A) Endpoint-Verifikationen (Oracle, Akademie-KWI vermutl. broken - SDG-Portal seit 30.06. abgeschaltet; Zertifikats-API der Prüfseite existiert im Akademie-Repo nicht!), B) 6 Registry-Metadaten-Fixes (u.a. v1.0-Archivhinweis „gilt v1.2"→v1.3, llms.txt Master-Items-Link v1.2→v1.3), C) Architekturentscheidungen (kanonischer WoekAiService, Analytics-Kanonisierung, KWI-Quellen-Migration, DIP-Ingestion, territoriale Zuordnungsschicht), D) TECHNICAL_CAPABILITY_MAP füllen. Kontextdossier v1.0 liegt nur im ungemergten Codex-Arbeitsbaum.
- Kein Release/Deployment über die Docs hinaus; Branch `claude/woek-knowledge-bootstrap`, PR folgt. Nächster Claude-Block: Wirkungsportal Parlament - UX/CD-Aufbau auf Basis PARLIAMENT_REUSE_MAP.

## 2026-08-14 - Claude: Wirkungsportal Parlament - UX-Fundament + klickbarer Prototyp (Stand 1)

- `docs/parlament/ux/`: PRODUCT_EXPERIENCE.md, INFORMATION_ARCHITECTURE.md, DESIGN_SYSTEM.md, UX_HANDOFF_TO_CODEX.md (Stand 1) + Prototyp `prototype/` (Portalstart + vollständige Entscheidungsseite, WÖk-CD Navy/Ivory/Gold, Source Serif 4/Inter, responsive, A11y-Grundausstattung). Alle Fallinhalte synthetisch und als Demonstrationsfall gekennzeichnet; redaktionelle Platzhalter als CONTENT_REQUIRED markiert.
- Komponenten implementiert: Trust-Band, Decision Card, Verfahrens-Stepper (inkl. STATUS_UNVERIFIED), 60-Sekunden-Block, Wirkpfad mit Evidenz-Badges/Bruchstellen + Linearfassung, Ebenen-Marken (Sachverhalt/Analyse/Bewertung), Claim+Quellen-Drawer, Nichtkompensations-Kasten, Empfehlungs-Block mit Falsifizierbarkeit, Szenario-Sofortreaktionen (deterministisch, Registry-Prinzip), Regional-DATA_GAP-Zustand, kontextueller Werkzeugkasten (Bestands-Links), KI-Opt-in-Box, Versions-Timeline, Trust-Card, Modus-Schalter Public/Parlament.
- Desktop + Mobile im Browser verifiziert (Erste-Viewport-Regel §56 erfüllt). Offen für Stand 2: Historie/Monitor/Dialog/Methodik-Screens, Parlament-Modus-Zusatzblöcke, Wirkungsnetz.
- Branch `claude/parlament-ux` (baut auf `claude/woek-knowledge-bootstrap`/PR #219 auf), PR folgt. Codex bitte erst `docs/parlament/CODEX_AUFTRAG_2026-08-14.md` + `docs/woek-knowledge/CROSSCHECK.md`, vor Frontend-Implementierung dieses Handoff.

## 2026-08-14 - Claude: Parlament-Prototyp Stand 2 + Antwort auf Codex-Rückfragen

- Neue Prototypseiten: `rueckblick-beispiel.html` (Route /monitor/ mit Erwartung→Indikator→Beobachtung→Einordnung inkl. Status-Set NOT_YET_OBSERVABLE/ON_TRACK/MIXED/OFF_TRACK/BOUNDARY_RISK/DATA_GAP und Korrekturtrigger; Route /historie/ mit strikt getrennten Wissensständen damals/heute + Lernpunkt) und `dialog-beispiel.html` (Trennungskasten „was Umfragen dürfen/nicht dürfen", zwei Fragerunden, Ergebnisbalken mit Pflicht-Metazeile n/Zeitraum/Auswahlverfahren/Mindestkohorte n≥10, Prozesskette). Desktop+Mobile geprüft.
- UX_HANDOFF auf Stand 2: 24 Komponenten mit Datenfeldern/Zuständen, ausführliche Responsive-Regeln (Breakpoint 640/760, Erste-Viewport-Regel, Touch) und WCAG-2.2-AA-Anforderungen inkl. Testpflicht. Rückschaufehler-Schutz (Quellenfilterung nach Entscheidungsdatum) als Datenmodell-Anforderung markiert.
- Antwort an Codex: `docs/parlament/CLAUDE_ANTWORT_AN_CODEX_2026-08-14.md` - Import-Status je führender Referenz (WÖMS 2.0/Master Items v1.3/SDG v0.3 = FULL; Begriffsleitfaden v1.3, T-SROI v1.1, WÖMM 2.0 = nur TEXT mit benannten Lücken), Auflösung der „zwei fehlenden" führenden Referenzen (11 Registry-Einträge = 8 Werke, registry_id_map ergänzt), Korrektur /api/v1/methods = 152 statt 84 Methoden.
- Neue Codex-Punkte A12-A14 in CROSSCHECK (Build-Kette WÖMS, fehlende WÖMM-Registry, T-SROI-Parametrisierung). Keine Backend-/DB-Arbeit in der Claude-Lane; woek-parlament-app bleibt unberührt.

## 2026-08-14 - Codex: Wirkungsportal Parlament - Tech-MVP und Importvorbereitung

- **Was:** Eigenständige Next.js-Anwendung unter `woek-parlament-app/` angelegt; UX-Handoff Stand 2 umgesetzt (Start, Karten, Entscheidungsseite, Monitor, Historie, Dialog, Trust-/Versionszustände). Alle sichtbaren Falldaten sind explizit synthetisch bzw. `CONTENT_REQUIRED`/`DATA_GAP`.
- **Daten/Sicherheit:** Öffentliche Read-API, CSP/HSTS/Frame-Policy, Opt-in-KI ohne Votumsänderung, Supabase-Migration mit `ParliamentaryCase ≠ DecisionUnit`, Dokumenthash/Fassung und serverseitig erzwungener Damals/Heute-Grenze für Retrospektiven.
- **DIP:** Adapter und Importfenster implementiert: laufendes Jahr als Bootstrap, Radar heute + 10 Tage (konfigurierbar 7-14), Importstatus immer `IMPORTED_UNREVIEWED`. Keine automatische Veröffentlichung oder Fachbewertung.
- **Dokumentation:** Architektur- und Launch-Dokumente unter `docs/parlament/tech/`; führende WÖk-Referenzen und Reuse-Map übernommen.
- **Geprüft:** `npm run lint`, `npm run typecheck`, `npm run build`; lokale Read-API und Security-Header getestet.
- **Offen:** personalisierten DIP-Schlüssel, private Import-Worker/Supabase-Workbench mit RBAC+MFA, formelle Materialitäts- und Freigaberegeln, Hosting/DNS/TLS und Live-Gates.
- **Nachtrag DIP:** Der offiziell veröffentlichte Schlüssel ist laut Hilfeseite bis Ende Mai 2027 gültig und funktionsgleich mit einem eigenen Schlüssel; einmaliger serverseitiger Lesetest `GET /api/v1/vorgang` am 2026-08-14: HTTP 200. Nutzung bis Ablauf nur als Hosting-Secret, mit 401-Rotationsalarm; personalisierter Schlüssel ist kein MVP-Gate.

## 2026-09-05 - Codex: Wirkungsticker Medien- & Sprachwirkung

- Bestehende Analysepipeline um einen lokalen, politisch symmetrischen Medien-/Sprachtrigger und das separate `analysis.media_impact`-Modell erweitert; keine zweite Datenbank und kein zweiter regulärer KI-Aufruf.
- Ereignis, Akteursaussage und mediale Vermittlung werden getrennt; Attribution, Wissensstatus, Resonanzrisiko, Wirkungsordnungen, Herkunftsevidenz und Mehrquellenbasis haben serverseitige Sanitizer und Qualitätsgates.
- Self-Frame-Check schützt Titel, Kurz-/Detailfassung sowie die daraus abgeleiteten SEO-, OG-, Feed-, Share- und Push-Texte nach „Sachverhalt vor Frame“. Keine Absichtszuschreibung, keine Personen-/Outlet-Scores, kein Wirkungsnachweis aus bloßem Potenzial.
- Detailseite zeigt „Medien- & Sprachwirkung“ nur bei substanzieller Relevanz und verknüpft bestehende Glossarbegriffe. Die Übersicht erklärt die neue Ebene knapp.
- Selektiver, budgetgebundener und idempotenter Backfill samt Workflow-Inputs sowie Usage-Feldern für Trigger, Skip, Token, Kostenanteil und Rewrites ergänzt.
- Dokumentation: `docs/ops/WIRKUNGSTICKER-MEDIEN-SPRACHWIRKUNG.md`. Tests: `tests/news/media-impact.test.mjs` plus vollständige Wirkungsticker-Suite.
# 2026-09-05 - Codex: Quellenintegrität, Frame-/Diskurscheck v2 und WÖK-Analysen

- Falsche Berliner Wahlquelle in der Sachsen-Anhalt-Akte entfernt; Root Cause als fehlende Wahljurisdiktionsgrenze identifiziert und generisch behoben.
- Dauerhaftes Source-Integrity-Gate vor KI und strikter Vollbestandsaudit vor Veröffentlichung ergänzt.
- Medien- und Sprachwirkung auf strukturierten Frame-/Diskurscheck v2 mit vier Ebenen, Attribution, beobachteter Wirkung, Evidenzlisten und Self-Frame-Check erweitert.
- Eigenständiges Format WÖK-ANALYSE mit lokalem Relevanz-/Analysegewinn-Trigger, Recherche-/Evidenzgate, Claim Ledger, Gegenbefund, Versionierung, Kostenlogging, Rückverlinkung, RSS/SEO/WebApp und gemischtem Feed umgesetzt.
- Rückwirkende Scans sind idempotent; technische Batchgrößen sind keine redaktionellen Stückquoten.
- Offene Analyse-Kandidaten werden gegen den registrierten stündlichen Recherchepool nachrecherchiert; Legal Tribune Online und die öffentliche Jurafuchs-Presse-/Primärquelle ergänzen die kostenlose Rechts- und Justizrecherche. Nahezu identische Meldungen erzeugen nur einen Deep Dive.

## 2026-09-05 - Codex: Nachrichtenbetrieb, Queue und Quellen-Funnel finalisiert

- Warteschlange in Kapazitäts-, technische und redaktionelle Fälle getrennt; ältere technische Wiederholungen erhalten bei normaler Kapazität reservierte Slots, ohne frische Meldungen zu verdrängen.
- Formell fehlerhafte KI-Ausgaben werden als `AI_OUTPUT_INVALID` verlustfrei gespeichert und mit gestaffeltem Backoff erneut verarbeitet. Erwartbare Relevanz-, Evidenz- und Source-Integrity-Ablehnungen machen den Workflow nicht mehr fälschlich rot.
- Laufberichte führen getrennte Zustände für Betrieb, Redaktion und Queue sowie Anbieter-Erfolge/-Fehler. Discord meldet erst echte technische Verzögerungen; der Tagesbericht enthält Queue, Quellen-Funnel, Monats-/Tageskosten und Kosten je Veröffentlichung/Aktualisierung.
- Heise Wirtschaft, Netzpolitik und Security als kostenlose Metadatenfeeds ergänzt; lokale Systemrelevanz-Vorfilterung hält Produkttests, Deals, Kaufberatung und Routineupdates vor der KI zurück. Telepolis dient nur als bestätigungspflichtige Kontext-/Discovery-Quelle.
- Legacy-HTTP-Links desselben HTTPS-Herausgebers werden sicher kanonisiert; Drittanbieter-Hosts bleiben unverändert. Dunkle WÖK-Analyse-Headlines erhalten den bereits getesteten hellen Kontraststil.

## 2026-09-15 - Claude: Wirkungsticker auf Direktbetrieb umgestellt

- **Was:** Bridge-Kette (Oracle → Dropbox → ChatGPT-Worker → Zweitprüfung) durch eine gerade Linie ersetzt: ein Workflow alle 15 Minuten, Import → lokale Bewertung (LIFO, Horizont 24 h) → genau ein OpenAI-Aufruf je Meldung → deterministisches Gate → Build → Pages. Altwarteschlange (759 Kandidaten) geschlossen, 19 jüngste Online-Meldungen ohne vollständiges Wirkungspotenzial zur Neubewertung eingereiht.
- **Pfade:** `scripts/news/openai-transport.mjs`, `scripts/news/impact-gate.mjs`, `scripts/news/run-api.mjs`, `scripts/news/retire-backlog.mjs`, `scripts/news/queue-reassessment.mjs`, `.github/workflows/wirkungsticker.yml`, Änderungen in `run.mjs`/`lib.mjs`/`budget.mjs`; Doku `docs/ops/WIRKUNGSTICKER-DIREKTBETRIEB.md`, Übergabe `docs/handoff-wirkungsticker-direktbetrieb-codex.md`.
- **Geprüft:** `tests/news/direct-operation.test.mjs` (12 Tests), `npm run news:test`, Probelauf gegen Live-Feeds (133 s, 0 Aufrufe), `news:validate`.
- **Offen für Codex:** Erste Live-Läufe auswerten, Gate-Fehlercodes sammeln, Oracle-Bridge-Timer abschalten, Bridge-PRs #771/#772/#774 schließen. Private Redaktion (Meinung & Analyse, Nachgehört/Nachgesehen, Buch & Wirkung) unverändert.

## 2026-09-15 - Claude: ZDF-Sendungslogos gebunden, Redaktionsfreigaben im Direktbetrieb

- **Was:** Die am 14.09. freigegebenen ZDF-Logos (Markus Lanz, maybrit illner, MAITHINK X, Terra X Lesch & Co, Lanz + Precht) wurden am 15.09. über die Presseportal-Bildanfrage 118949 geliefert, proportional auf 800 px skaliert, mit SHA-256, Credit und Sendungsseite in `data/news/show-visual-identities.json` gebunden (`asset_delivery_status = DELIVERED`). Originale und Schriftwechsel im privaten Rechtearchiv. Zusätzlich übernimmt der Nachrichtenworkflow jetzt in jedem Lauf die in der privaten Redaktion freigegebenen Fassungen (`scripts/news/import-approved-editorials.mjs`, Claim vor Build, Finalize nach Push).
- **Geprüft:** `tests/news/app-pages.test.mjs`, `tests/news/import-approved-editorials.test.mjs`, Workflow-Invarianten.
- **Offen für Codex:** Oracle-seitige Entwurfserzeugung ohne ChatGPT (`bridge/run-api-processor.mjs` aktivieren), siehe Übergabe.

## 2026-09-15 - Claude: Redaktionsworker in GitHub (Meinung & Analyse, Nachgehört, Nachgesehen, Buch)

- **Was:** Die Rolle der ChatGPT-Worker übernimmt ein GitHub-Workflow (`redaktionsworker.yml`, alle 15 Minuten versetzt): offene Redaktionsaufträge über die Oracle-Schnittstelle lesen, Eingabepaket atomar claimen, genau ein OpenAI-Aufruf mit dem unveränderten Vertrag V4, Prüfung mit `validateApiOutput`, Ablage als Entwurf in `20_OUTPUT_READY`; die Redaktionsapp legt ihn Natalie zur Freigabe vor. Zusätzlich `redaktions-kandidaten.mjs`: stark relevante Meldungen werden als regulärer Auftrag für Meinung & Analyse eingereiht (höchstens 1 je Lauf, 2 je Tag, je Meldung einmal; `author_notes` leer).
- **Geprüft:** `tests/news/redaktionsworker.test.mjs` (5 Tests: Auswahl, Claim/Entwurf/Ablage, Ein-Versuch-Regel, Tagesdeckel und Sperre, Kandidaten).
- **Offen:** Erste echte Aufträge beobachten; Natalie bestätigt einmal, dass Entwürfe in der App erscheinen. Oracle-Prozessor nicht aktivieren.

## 2026-09-16 - Claude: Redaktionsworker mit begrenzter Web-Suche, liegengebliebene Übernahmen, Platzvergabe

- **Was:** Die ersten beiden echten Aufträge des Worker-Laufs kamen als HOLD `SOURCE_VERIFICATION_REQUIRED` zurück: Das Wissensprofil verbietet dem Modell, verlinkte Quellen als gelesen zu behandeln, und der API-Aufruf hatte keine Werkzeuge. Der Worker gibt dem Modell jetzt im selben einen Aufruf das gehostete Web-Suchwerkzeug mit Obergrenze (`WOEK_EDITORIAL_WEB_SEARCH`, `WOEK_EDITORIAL_MAX_SEARCHES`), ersetzt den Profilsatz durch die Werkzeugregel und verbucht Suchzugriffe (1 Cent je Zugriff). Übernahmen abgeschalteter ChatGPT-Worker in `10_CLAIMED` werden nach sechs Stunden adoptiert statt jeden Lauf als `claimed_elsewhere` übersprungen. Aufträge ohne Aufruf belegen keinen bezahlten Platz mehr. 4xx-Ablehnungen sind kein bezahlter Versuch. Diagnoseordner nur im Worker-Schritt gesetzt (die Tests schrieben eine Fixture-Antwort hinein).
- **Geprüft:** `tests/news/redaktionsworker.test.mjs` 9/9 (3 neu), Workflow-Invarianten.
- **Offen:** Ersten Lauf mit Web-Suche beobachten (Entwurf statt HOLD? Kosten je Auftrag); Natalie bestätigt, dass Entwürfe in der App erscheinen.
## 2026-09-16 - Claude: Reparaturschlange der alten Online-Meldungen hält jetzt

- **Was:** Natalie sah eine Meldung vom 14.09. ohne Balken. Die 30 jüngsten Online-Meldungen ohne vollständiges Profil waren am 15.09. eingereiht, doch null trugen noch die Markierung: `pendingRecord` schreibt bei jedem Vertagungsvermerk einer veröffentlichten Meldung den Aktualisierungsvermerk neu, und `impact_reassessment` hing daran. Jetzt überlebt die Markierung jeden Vermerk, `queue-reassessment` läuft als fester Schritt in jedem Lauf (Limit `WOEK_NEWS_REASSESS_LIMIT`, Standard 30), und `partitionAiQueue` reserviert je Lauf einen Platz für eine wartende Neufassung.
- **Geprüft:** `tests/news/budget-throughput.test.mjs` (Platzreservierung), `tests/news/direct-operation.test.mjs` (Markierung überlebt Vertagung), Workflow-Invarianten, `wirkungsticker.test.mjs`.
- **Offen:** Beobachten, dass je Lauf eine alte Meldung neu gefasst wird und Balken bekommt (Catania war die erste neue Meldung mit vollständigem Profil).
## 2026-09-15 - Claude: Erste Meldung mit vollständigem Wirkungspotenzial live, Transport repariert Etikettfehler

- **Was:** Lauf 7 (21:31 UTC, `gpt-5.6-luna`) brachte die erste Meldung des Direktbetriebs mit drei modellierten Dimensionen live (Flughafen Catania). Zwei weitere fielen im Gate an einer Kaskade: das Modell schrieb `rbb24` statt `rbb24-nachrichten` und erfand `tagesschau-access`; damit galten Quellenfunktionen, Pfadbindungen und alle sechs Faktoren als fehlend. Der Oracle-Takt löste um 21:35 und 21:50 beide Workflows ohne manuellen Eingriff aus; der Takt-Lauf (4 Aufrufe) zeigte zusätzlich Nebenpfade in `primary_paths`, `data_status: missing` und bei zwei Antworten entgleiste JSON-Struktur (Planet/Demokratie als Fragmente). Der Transport bildet Kennungen jetzt deterministisch auf die gelieferten `source_id` ab (verwirft Nichtzuordenbares, ergänzt nie), verschiebt Nebenpfade nach `secondary_paths`, setzt `data_status` einer modellierten Dimension auf `modelled`, verwirft Textfragmente an Pfadstellen und protokolliert alles unter `transport_repairs`. Systemanweisung: Kennungen wörtlich, Pfadtypen, `source_summary` 100–180 Wörter, keine ergänzten Daten/Zahlen. Reasoning-Standard auf `medium` (Variable bleibt übersteuerbar). Schema-Hinweis `data_status` ohne `missing`.
- **Nachgerechnet:** Mit dem neuen Transport wären aus Lauf 7 alle drei Antworten strukturell gate-fähig (29 → 1 bzw. 37 → 5 Fehler, Rest Textregeln), aus dem Takt-Lauf zwei von vier; die zwei entgleisten brauchen den zweiten bezahlten Versuch.
- **Geprüft:** `tests/news/direct-operation.test.mjs` (17 Tests, davon 3 neu), Workflow-Invarianten, `npm run news:test`.
- **Offen:** Mehrere Takt-Zyklen mit `medium` beobachten (Kosten je Meldung, Anteil vollständiger Antworten), dann Selektionsgewichte mit Daten nachziehen.

## 2026-09-16 - Claude: Gezielte Nachlieferung des Wirkungspotenzials im selben Lauf

- **Was:** Auch mit mittlerem Denkaufwand ließ das Modell in zwei von drei Antworten das `impact_assessment` weg oder halb geschrieben (Lauf 22:35 UTC). Der Transport macht jetzt bei deterministischem Befund genau einen kleinen Folgeaufruf, der nur `impact_assessment` mit den konkreten Prüfbefunden nachliefert (`assessmentIssues`, `repairAddendum`, `repair_calls` im Stundendeckel, Rohkopie `-nachlieferung.json`); Ablehnungen werden nie nachgefordert. Zusätzlich deterministisch: Nebenpfade ohne sechs Faktoren werden verworfen, `decisive` auf nicht negativen Pfaden zurückgesetzt. Nachgerechnet über die 14 Rohantworten der Nacht: alle verbliebenen Strukturfehler sind genau die Fälle, die die Nachlieferung abdeckt.
- **Nachtrag (Lauf 22:50 UTC):** Zwei Antworten ließen je Dimension `rationale` und `balance` weg (deckt die Nachlieferung ab; zusätzlich Anweisung), eine Überschrift trug die Zuordnung nicht im Titel obwohl `attributed_to` vorlag: `repairHeadlineAttribution` stellt „Laut …:“ aus den Worten des Modells voran; eine `source_summary` kopierte über 24 Wörter wörtlich (Anweisung). Beobachtet, nicht behoben: eine zweite Catania-Meldung mit gleicher Ereignis-ID und gleicher Quellen-URL wurde als neue Datei geführt (Clusterung, `existingStoryMatch`).
- **Geprüft:** `tests/news/direct-operation.test.mjs` (21 Tests, 3 neu), Budget-, Ticker- und Ring-Tests.
- **Offen:** Ausbeute je Lauf nach Merge messen; wenn die Nachlieferung selbst häufig scheitert, Structured Outputs (json_schema strict) für `impact_assessment` prüfen.
## 2026-09-16 - Claude: Nachgesehen/Nachgehört automatisch aus den Sendungsfeeds, Analysekandidaten standardmäßig an

- **Was:** Natalie: Meinung & Analyse, Nachgesehen und Nachgehört müssen automatisiert laufen. Neu `scripts/news/sendungs-kandidaten.mjs` mit `data/news/show-feeds.json`: neue Folgen von maybrit illner, Markus Lanz, MAITHINK X, Terra X Lesch & Co, Lanz + Precht und NEU DENKEN werden als reguläre Redaktionsaufträge (watched/listened) eingereiht, mit offiziellem Transkript im Auftragspaket, wo der Feed eines liefert (Lanz + Precht, NEU DENKEN: VTT mit Zeitmarken); bereits beauftragte oder veröffentlichte Folgen werden über die URL erkannt. Worker-Workflow: Sendungsschritt neu, Analysekandidaten standardmäßig an, Tagesdeckel 16. Nebenbei: Feed-Titel trugen das Formatlabel doppelt („Nachgesehen: Nachgesehen: …“), `labelledTitle` in build.mjs.
- **Geprüft:** `tests/news/sendungs-kandidaten.test.mjs` (7 Tests: drei Feedformen, Auswahl, Auftragsbau mit/ohne Transkript, bekannte URLs, Transkriptabruf mit Deckel, Vorschlagslauf mit Dublettenschutz und Tagesdeckel, Feed-Label), Live-Trockenlauf gegen alle sechs Feeds (NEU DENKEN 15.09. mit 79k Zeichen Transkript, Lanz + Precht #262 mit 82k, Lanz 09.09. ohne).
- **Offen:** Ersten automatischen Sendungsauftrag im Worker beobachten; ZDF-Sendungen ohne Transkript: Option automatische Transkription (OpenAI, ca. 0,20 USD je Stunde) nur mit Natalies Freigabe.
## 2026-09-16 - Claude: Wirkungspotenzial führt jede Dimension, beobachtete Wirkung als eigene Zeile

- **Was:** Bei der Catania-Meldung wirkten die Mensch-Balken doppelt: Die Ansicht setzte die belegte, bereits eingetretene Wirkung (Flüge abgesagt) an die erste Stelle und das modellierte Potenzial darunter als „Weiteres Potenzial“; beide waren Stufe 2 und laufend. Jetzt führt in jeder Dimension das Wirkungspotenzial (Ring, Balken, Richtung, Pfadtitel), und eine beobachtete Wirkung folgt klar beschriftet als „Beobachtet:“ mit eigenem Ring und eigenen Balken (`scripts/news/visuals.mjs`). Die Ableitung (`deriveImpactPresentation`) ist unverändert; nur die Ansicht wechselt die Reihenfolge und die Beschriftung.
- **Geprüft:** `tests/news/impact-status-ring.test.mjs` (Potenzial vor Beobachtet, keine „Weiteres Potenzial“-Zeile mehr), Ansichts- und Ticker-Tests 182/182, lokale Renderprobe der Catania-Meldung.
- **Offen:** Live-Sichtprüfung nach dem Deploy.

## 2026-09-16 - Claude: Worker: Web-Suche-Variante bei Ablehnung, Fehlertext im Lauf

- **Was:** Der erste Takt-Lauf mit Web-Suche (23:05 UTC) wurde vom Anbieter mit 400 abgelehnt (nicht bezahlt, Auftrag bleibt offen); der Lauf zeigte nur den Statuscode. Der Worker versucht bei 400 jetzt genau einmal die ältere Werkzeugschreibweise `web_search_preview` ohne optionale Parameter und hält den (bereinigten) Fehlertext des Anbieters im Ergebnis und Vermerk fest. Die adoptierte liegengebliebene Übernahme wurde wie vorgesehen bearbeitet (kein `claimed_elsewhere` mehr).
- **Geprüft:** `tests/news/redaktionsworker.test.mjs` 10/10 (1 neu).
- **Offen:** Nächsten Takt-Lauf lesen: Variante 0 oder 1 erfolgreich, sonst Fehlertext.
## 2026-09-16 - Claude: Clusterung: Verlagsname ist keine Ereignisgeografie

- **Was:** Die zweite Catania-Meldung (gleiche Ereignis-ID, dieselbe Deutschlandfunk-Artikel-URL in neuer Revision) wurde als neue Datei geführt und kostete einen eigenen Aufruf. Ursache: `fileSubject` erkannte im gespeicherten `source_summary` „Deutschlandfunk“ als Deutschland (`deutsch\w*`), die neue Meldung dagegen Italien; `subjectConflict` trennte die Länder. Medien-Namen (Deutschlandfunk, Deutschlandradio, Deutsche Welle, dpa, Deutsche Bahn u. a.) werden vor der Länderprüfung entfernt; echte deutsche Bezüge zählen weiter.
- **Geprüft:** `tests/news/living-files.test.mjs` (31 Tests, 1 neu mit dem Catania-Fall), Reproduktion gegen den Datenbestand: Ähnlichkeit 0 → 1.
- **Offen:** Die bereits angelegte Dublette `wt-17d4a13881b167db` bleibt unveröffentlicht; beim nächsten Import wird sie als Aktualisierung der veröffentlichten Meldung geführt.

## 2026-09-16 - Claude: Worker-Schritte mit eigenem Bridge-Slot

- **Was:** Seit #791 laufen im Worker drei Schritte (Analysekandidaten, Sendungen, Entwürfe); alle holten die Import-Sperre mit derselben manuellen Lauf-ID. Nach dem ersten Schritt galt der Slot als abgeschlossen, Sendungen und Entwürfe wurden übersprungen (`BRIDGE_SLOT_ALREADY_COMPLETED`, Takt 23:35 UTC). Jeder Schritt hängt jetzt eine Schrittziffer an die Versuchsnummer (`<run>:<attempt><schritt>`, bleibt im Format Ziffern:Ziffern).
- **Geprüft:** Worker-, Sendungs- und Workflow-Tests.

## 2026-09-16 - Claude: Gate: zweiter Recherchepass im selben Aufruf zählt; Zeitstatus und Fragmente

- **Was:** Lauf 00:07 UTC: eine Meldung mit hoher Systemrelevanz hielt an `IMPACT_CENTRAL_DIMENSION_UNRESOLVED`, obwohl Planet und Demokratie nach zweitem Pass ausdrücklich offen modelliert waren; das Gate kannte den zweiten Pass nur aus der früheren Zweitprüfung per Job. `secondPassComplete` (`impact-gate.mjs`, Gate-Version 2) leitet ihn jetzt aus dem Bewertungsobjekt ab (research_check completed, jeder Hauptpfad second_pass mit research_result); Transport-Befunde nutzen dieselbe Regel. Deterministisch zusätzlich: fehlender `temporal_status` je Dimension wird aus den Pfaden abgeleitet (ongoing nur mit beobachtetem Signal), ein Hauptpfad-Fragment ohne Faktoren weicht, wenn ein bewerteter Hauptpfad bleibt. Anweisung: ex-ante-Wirkungen als Möglichkeit formulieren (`AI_EX_ANTE_CAUSAL_OVERCLAIM`).
- **Geprüft:** `tests/news/direct-operation.test.mjs` (23 Tests, 2 neu), Ticker- und Ring-Tests.
## 2026-09-16 - Claude: Worker: Web-Suche ohne JSON-Modus

- **Was:** Der erste Takt-Lauf mit vollständigem Stand (00:05 UTC) nannte den Grund der Ablehnung: „Web Search cannot be used with JSON mode.“ Mit Suchwerkzeug wird die Anfrage jetzt ohne `text.format` gestellt; das Profil verlangt ohnehin genau ein JSON-Objekt, und die Antwort wird tolerant gelesen (`extractJsonObject`: Markdown-Zaun und Umtext werden entfernt, sonst `AI_MALFORMED_JSON`). Ohne Suchwerkzeug bleibt der JSON-Modus an. Derselbe Lauf reihte den ersten automatischen Sendungsauftrag ein (NEU DENKEN, 15.09., 79k Zeichen Transkript).
- **Geprüft:** `tests/news/redaktionsworker.test.mjs` 10/10 (erweitert: kein `text.format` mit Werkzeug, JSON-Modus ohne Werkzeug, eingezäunte Antwort lesbar, Nicht-JSON abgelehnt).
## 2026-09-16 - Claude: Nachlieferung mit 24k Ausgabebudget und Diagnosekopie

- **Was:** Erster Lauf mit Nachlieferung (00:07 UTC): vier Meldungen, sieben Aufrufe, eine veröffentlicht (Ukraine-Meldung nach drei vergeblichen Läufen, diesmal durch die deterministischen Reparaturen). Die drei Folgeaufrufe erzeugten je rund 9k Antwort-Token plus Reasoning und liefen in die 16k-Grenze: keine Endnachricht, bezahlt, keine Wirkung, und keine Rohkopie, weil nur Antworten mit Text gesichert wurden. Grenze auf 24k, Rohkopie auch ohne Endnachricht (Status, incomplete, Ausgabetypen).
- **Geprüft:** `tests/news/direct-operation.test.mjs` 21/21.

## 2026-09-16 - Claude: Quellenintegrität vor der Veröffentlichung, Audit nur bei neuen Findings hart

- **Was:** Der Lauf 03:50 UTC scheiterte komplett am strikten Bestandsaudit (`held: 1`): kein Commit, kein Deploy, die Arbeit des Zyklus verworfen. Ursache: Der Kandidatencheck vergleicht die Quelle mit dem Feed-Titel, das Audit später mit der Modell-Überschrift und der eigenen Quellenzusammenfassung; die semantische Passung kann dadurch nach der KI-Fassung kippen. Jetzt prüft der Lauf die veröffentlichungsreife Fassung erneut (`publicationIntegrityIssues`) und hält genau diese Meldung (`SOURCE_INTEGRITY_OPEN:<code>`), statt dass das Audit hinterher alles verwirft. Das Audit unterscheidet zusätzlich neue von bekannten Findings (`newlyHeldStories`, Bezugspunkt ist der committete Bericht): `--strict` scheitert an einer Regression dieses Laufs, ein bereits öffentliches Altfinding wird dokumentiert (`known_findings_before`) und blockiert nicht jeden weiteren Zyklus; `--strict-all` bleibt für manuelle Audits.
- **Geprüft:** `tests/news/source-integrity.test.mjs` (2 neu), Ticker-Tests.
## 2026-09-16 - Claude: Worker liefert Quellenauszüge selbst, wartet auf die Lane

- **Was:** Alle Entwürfe der Nacht (00:50–03:20 UTC) kamen als HOLD zurück, meist `SOURCE_VERIFICATION_REQUIRED`: Auch mit Web-Suche behandelte das Modell verlinkte Quellen nicht als gelesen. Der Worker ruft die verlinkten Artikel jetzt selbst ab (https, keine privaten Hosts, bis sechs Links, je 7 000 Zeichen, HTML/VTT/Text) und legt sie als `origin.source_excerpts` in die Prompt-Kopie des Pakets; das gebundene Paket und sein `input_hash` bleiben unverändert. Das Profil akzeptiert genau solche Auszüge als Tatsachenbelege. Zudem: beide Workflows starten auf denselben Oracle-Push, der Nachrichtenlauf hält die Import-Lane; die drei Redaktionsschritte warten jetzt bis zu zehn Minuten (`acquireLane` mit `retries`/`waitMs`) statt den Zyklus zu verlieren. Vermerk trägt `disposition`, `hold_code`, `source_excerpts`.
- **Geprüft:** `tests/news/redaktionsworker.test.mjs` 12/12 (2 neu), Sendungs- und Workflow-Tests.
- **Offen:** Die 16 HOLD-Aufträge der Nacht haben ihren einen Versuch verbraucht; Natalie kann sie in der App mit Kommentar zurückgeben (neue Fassung), oder wir reihen sie einmalig neu ein. Tagesdeckel für heute bereits erreicht (16); Variable `WOEK_EDITORIAL_MAX_JOBS_PER_DAY` nach dem Merge anheben.

## 2026-09-16 - Claude: Wortlaut der Sendungen aus der Barrierefreiheit

- **Was:** Natalie: „gibt es keine barrierefreiheit beim ZDF? … Das gilt grundsätzlich für alle Sendungen.“ Genau das war die Lücke. Der Lanz vom 15.09. wurde automatisch beauftragt und kam mit `SOURCE_VERIFICATION_REQUIRED` zurück, weil ohne Wortlaut keine Zitate und Zeitmarken belegbar sind (alle bisherigen Nachgesehen-Ausgaben arbeiten mit Zeitmarken). Mediathek-Sendungen laufen jetzt über die MediathekViewWeb-Abfrage statt über RSS, weil nur sie `url_subtitle` liefert: die amtlichen Untertitel für Hörgeschädigte. EBU-TT/TTML, WebVTT und SRT werden zu Zeilen „HH:MM:SS Text“ gelesen; Lanz vom 10.09. ergibt 904 Abschnitte mit 48 000 Zeichen samt Sprecherkürzeln, kostenlos. Gebärdensprach- und Hörfassungen werden als dieselbe Folge erkannt, die Fassung mit Untertiteln gewinnt. Reihenfolge: Podcast-Transkript, Untertitel, eigene Spracherkennung (`whisper-1` über ffmpeg-Tonspur, rund 0,45 USD je Sendung, Deckel zwei je Tag). Ohne Wortlaut wartet eine Folge 18 Stunden, statt in eine Rückfrage zu laufen.
- **Geprüft:** `tests/news/sendungs-kandidaten.test.mjs` 11/11 (4 neu), Trockenlauf gegen alle sechs Sendungen: Untertitel für illner 10.09. (50 189 Zeichen) und Lanz 10.09./09.09., Podcast-Transkripte für NEU DENKEN und Lanz + Precht, Lanz vom 15.09. wartet noch.
- **Offen:** Ersten Entwurf mit Untertitelgrundlage beobachten.
## 2026-09-16 - Claude: Worker muss vor einem Belege-HOLD suchen

- **Was:** Erster Lauf mit Quellenauszügen (04:50 UTC): Die Auszüge wirken, das Modell bestätigt sie wörtlich („durch den mitgelieferten Tagesschau-Auszug belegt“), hielt aber mit `SOURCE_VERIFICATION_REQUIRED` wegen fehlender Mechanismusbelege, ohne das Suchwerkzeug ein einziges Mal zu nutzen (`web_searches: 0`). Die Werkzeugregel verlangt jetzt: Fehlen tragende Tatsachen oder Mechanismusbelege, ist gezielt danach zu suchen; ein Belege-HOLD ist erst zulässig, wenn die Suche keine belastbaren Quellen ergab, und nennt die durchgeführten Suchen.
- **Geprüft:** `tests/news/redaktionsworker.test.mjs`.
- **Offen:** Ein Auftrag besteht nur aus vier Screenshots ohne Links; dort ist der HOLD sachlich richtig. Bildeingabe für solche Aufträge ist der nächste Schritt (Dropbox-Binärabruf liegt in der Bridge bereit).
## 2026-09-16 - Claude: Nachlieferung schemagebunden (Structured Outputs)

- **Was:** Die Nachlieferung wirkt (Lauf 04:25 UTC: drei von vier Meldungen live, zweimal „nachgeliefert (1 Befund, danach 0)“), aber sie erbt die Schwäche des ersten Aufrufs: weggelassene Schlüssel (`rationale`, `balance`, ganze Dimensionen). Der Folgeaufruf ist jetzt an ein striktes JSON-Schema gebunden (`scripts/news/impact-json-schema.mjs`, 90 Objekte, alle Schlüssel Pflicht, keine Zusatzfelder, Verschachtelung 9 von erlaubten 10, Enums aus den Vertragsmodulen). Lehnt der Anbieter das Schema ab, folgt genau ein Versuch im einfachen JSON-Modus. Abschaltbar über `WOEK_NEWS_REPAIR_SCHEMA=false`.
- **Geprüft:** `tests/news/direct-operation.test.mjs` 25/25 (2 neu: Schema deckt den Vertrag und erfüllt die Strict-Regeln inklusive Verschachtelungsgrenze; Schema zuerst, ein Fallback im JSON-Modus, abschaltbar).
- **Offen:** Erste Läufe beobachten, ob `nachgeliefert mit Schema` die Restfehler beseitigt.
## 2026-09-16 - Claude: Redaktionsvertrag nennt die Ablagefelder

- **Was:** Der erste vollautomatische Entwurf ist da: Die NEU-DENKEN-Folge vom 15.09. wurde selbst beauftragt, mit offiziellem Transkript bearbeitet und als Nachgehört-Vorschau geliefert („Was meinen wir, wenn wir vom ‚Westen' sprechen?“, drei Quellen, 12 000 Zeichen, 1,1 Cent). Die Ablage verwarf sie mit `EDITORIAL_PREVIEW_SOURCE_INVALID`: Die Freigabeprüfung verlangt je Quelle `publisher` und bei Nachgehört/Nachgesehen `source_media` mit `show`, `episode_title`, `original_release_date`, `original_url`; der Vertrag beschrieb `sources` dagegen nur als Objektliste, und das Modell lieferte `episode`/`published_at`. Der Vertrag nennt die Pflichtfelder jetzt im Schema und in einer Anweisung.
- **Geprüft:** `tests/news/redaktionsworker.test.mjs` (neu: vollständige Folge besteht, fehlender `publisher` und alte Schlüsselnamen werden abgelehnt, Schema und Anweisung nennen die Felder).

## 2026-09-16 - Claude: Textlängen als harte Grenzen in der Anweisung

- **Was:** Nach den Strukturreparaturen sind die verbliebenen Gate-Fehler Textregeln. Gemessen am Lauf 05:22 UTC: `source_summary` 77 Wörter bei verlangten 100 (publication_depth deepened), `detail_summary` 458 Zeichen und 4 Sätze bei verlangten 500 und 5 bis 7. Beide Grenzen stehen jetzt mit der Tiefenunterscheidung (initial 60/300, deepened 100/500) in der Systemanweisung, mit dem ausdrücklichen Hinweis, dass zu kurz genauso ungültig ist wie zu lang.
- **Geprüft:** `tests/news/direct-operation.test.mjs`.

## 2026-09-16 - Claude: Folge ohne Wortlaut darf einmal nachrücken

- **Was:** Der Lanz vom 15.09. war um 05:25 UTC beauftragt worden, bevor die amtlichen Untertitel erschienen, und lief vertragsgemäß in eine Rückfrage. Sein Auftrag ist damit verbraucht, und der Dublettenschutz hätte die Folge dauerhaft ausgeschlossen: die Sendung wäre verloren. Eine Folge, deren Vermerk `transcript_origin: null` trägt, wird deshalb genau einmal erneut eingereiht, sobald ein Wortlaut vorliegt (eigene Kennung, nichts wird überschrieben, der Auftragstext nennt den Grund). Nebenbei tragen Anbietertranskripte jetzt ebenfalls eine Herkunft (`provider_transcript`), damit der Vermerk eindeutig ist.
- **Geprüft:** `tests/news/sendungs-kandidaten.test.mjs` 12/12 (neu: erster Auftrag ohne Wortlaut, Warten ohne zweiten Auftrag, genau ein zweiter Auftrag mit Untertiteln, kein dritter).

## 2026-09-16 - Claude: Meinung & Analyse zu Sydney Sweeney direkt veröffentlicht

- **Was:** Natalie sah in der Redaktionsapp keine Freigabemöglichkeit für diesen Auftrag (die erste Ausgabe war an `EDITORIAL_MARKDOWN_DUPLICATE_TITLE` gescheitert) und beauftragte die Direktveröffentlichung: „mach einfach Meinung und Analyse komplett fertig und stell's live“. Fassung 2 trägt ihre politische Ebene (drei Frauenbilder, Normierung als Wirkpfad, Trump-Vorgang von 2025 ausdrücklich als andere Kampagne gekennzeichnet), ihren Titelvorschlag und ihre Einordnung. Zwei Belege habe ich an der Primärquelle korrigiert: das Shirin-David-Zitat stammt aus „Wetten, dass..?“ vom 10.12.2023, nicht aus dem Vogue-Interview; die wörtlich belegbare AfD-Position ist „traditionelle Familie als Leitbild“ und die Ablehnung der „ideologischen Beeinflussung durch das ‚Gender-Mainstreaming‘“ aus dem Grundsatzprogramm. Die Ausgabe wurde mit `publicPersonalEdition` gebaut, also identisch zum Freigabeweg der App, und mit `validatePersonalEdition` geprüft; eigene Kennung (`direct-publication:<job>`), damit eine späte App-Freigabe desselben Auftrags nicht mit abweichendem Inhalt kollidiert.
- **Geprüft:** `loadPersonalEditorials` (13 Ausgaben, Inhaltsprüfsumme, Quellen, Portrait, Renderer), `npm run news:build` (45 WÖk-Analysen), Faktorenrechnung der drei Dimensionen gegen die Methodik.
- **Offen:** Natalies Wunsch, in der App jederzeit Informationen nachzuliefern und jede Ergänzung erneut zur Freigabe vorgelegt zu bekommen; Server- und App-Teil liegen im Repo, die Aktivierung auf Oracle braucht Codex.
## 2026-09-16 - Claude: Hotfix, der Nachrichtenlauf stand 50 Minuten

- **Was:** Ab 06:50 UTC scheiterten fünf Läufe in Folge am Testschritt, der alle weiteren Schritte sperrt. Zwei Ursachen, beide aus meinen letzten Änderungen: (1) Ein Test benutzte einen absoluten Pfad dieser Maschine (`loadShows('/Users/…')`), der lokal existiert und in der Werkbank nicht; (2) die verschärften Pflichtfelder im Redaktionsvertrag (`publisher` je Quelle, vier Schlüssel in `source_media`) brachen einen bestehenden Intake-Test, weil Nachrichten-Vorschauen dort Quellen ohne Verlagsnamen führen. Der Pfad ist jetzt aus dem Repository-Wurzelverzeichnis abgeleitet, die Felder stehen im Schema und in der Anweisung, sind aber keine Pflicht mehr: Fehlendes ergänzt `normalizeEditorialPreview`, und was die Software nicht ableiten kann, hält weiterhin die Freigabeprüfung. Neu ist eine Sicherung gegen die Fehlerklasse: ein Test scannt `tests/`, `scripts/news/` und die Workflows nach absoluten Pfaden dieser Maschine und schlägt an; das deckt zugleich die Regel, dass keine privaten Pfade ins Repository gehören.
- **Geprüft:** `npm run news:test` ohne neue Fehler gegenüber dem bekannten Stand (verbleibende lokale Fehler sind die bekannten Font-/Chrome-Artefakte des Sparse-Checkouts), betroffene Dateien einzeln grün.
- **Lehre:** Der Testschritt sperrt den ganzen Lauf. Ein Test, der von der Umgebung abhängt, ist damit ein Produktionsrisiko und keine Testfrage.

## 2026-09-16 - Claude: Lanz rückt nach; Wartefenster auf zwölf Stunden

- **Was:** Natalie wartet auf die Nachbesprechung zum Lanz vom 15.09. Das ZDF hat dafür zwölf Stunden nach der Sendung noch keine Untertitel veröffentlicht (die Folgen vom 08./09./10.09. haben sie). Zusätzlich griff meine Nachrück-Regel nicht: Der Vermerk der ersten Einreihung stammt aus der Zeit davor und kennt das Feld `transcript_origin` nicht; `undefined === null` ist falsch, also galt die Folge als erledigt. Ein fehlendes Feld bedeutet jetzt ebenfalls „ohne Wortlaut eingereiht“. Das Wartefenster steht über die Variable auf zwölf Stunden, damit bei ausbleibenden Untertiteln die eigene Abschrift greift und die Folge heute bearbeitet wird.
- **Geprüft:** `tests/news/sendungs-kandidaten.test.mjs` 12/12 (neu: Altvermerk ohne Feld gilt als ohne Wortlaut).

## 2026-09-16 - Claude: Nachrichten-Testsuite in die PR-Prüfung

- **Was:** Die Suite `npm run news:test` lief bisher nur im Nachrichtenlauf, wo der Testschritt jeden weiteren Schritt sperrt. Ein gebrochener Test nahm damit die Produktion herunter statt einen Merge zu verhindern (16.09.: fünf Läufe, 50 Minuten). Sie läuft jetzt auch im PR-Gate (`pr-quality.yml`), also vor dem Merge.
- **Geprüft:** Der Schritt braucht in der Werkbank rund 40 Sekunden.
- **Lehre:** Was die Produktion sperren kann, muss vor dem Merge laufen.

## 2026-09-16 - Claude: Nichts Unvollständiges kommt zurück; ein Aufruf soll reichen

- **Was:** Natalie: „Dann müssen wir das so machen, dass eben von vornherein die Anfrage so ist, dass eben nichts Unvollständiges zurückkommt" und später „ohne Nachbesserung, dass wir quasi nur einen Lauf brauchen". Vier Stufen, von der Anfrage her gedacht. (1) Der erste Aufruf ist schemagebunden: `scripts/news/analysis-json-schema.mjs` beschreibt die ganze Antwort als strenges JSON-Schema (42 303 Zeichen, 583 Eigenschaften, Verschachtelung 10 von 10, 787 Enum-Werte von 1000; ein Test wacht über alle vier Grenzen, weil der Anbieter sonst still in den freien Modus zurückfällt). Ein fehlender Schlüssel ist damit technisch ausgeschlossen; bei Ablehnung folgt genau ein Versuch im JSON-Modus. (2) `publication_depth` kommt vom Server, nicht vom Modell: davon hängen die erlaubten Textlängen ab, und das Modell wählte „vertieft" und schrieb dann Erstbericht-Länge (Lauf 09:35 UTC: drei Meldungen, drei zusätzliche Aufrufe). (3) Der Aufruf trägt die aus dem Aktenstand berechneten Vorgaben voran: eine Zielspanne je Textfeld komfortabel innerhalb der Prüfgrenzen, genau drei Absätze, und für Zahlen der Mechanismus der Prüfung (jede Zahl einer Aussage muss wörtlich im zitierten Beleg-Ausschnitt dieser Aussage stehen). Die Vorgaben stehen in der Anweisung, nicht im Meldungsteil, das gesendete Paket wächst also nicht. (4) Die eine erlaubte Nachlieferung bleibt als Netz und deckt jetzt auch Textfelder ab, schemagebunden auf genau die betroffenen Felder; Befunde, die ihr Feld selbst nennen, bestimmen sie ohne Tabelle.
- **Gemessen:** Alle 44 Laufberichte seit Direktbetrieb ausgezählt: 576 Befunde auf 40 gehaltenen Meldungen, davon 412 über die Bewertung nachlieferbar, 123 über Felder, 2 echte redaktionelle Ablehnungen. Auf Meldungsebene 40 von 40 mit einem Weg zurück. Vor dem Schema: 113 Aufrufe, 14 live (12 %), rund 11 Cent je veröffentlichte Meldung. Danach: ein Aufruf kostet rund 1 Cent; mit Nachbesserung rund 1,9 Cent je Meldung. Der Bericht nennt jetzt `ai_schema_calls` und `ai_repair_calls`, damit der Unterschied zwischen „kann nichts fehlen" und „hoffentlich fehlt nichts" messbar ist. Ziel für die Nachlieferungen ist null.
- **Geprüft:** `tests/news/direct-operation.test.mjs` 31/31, `tests/news/evidence-packets.test.mjs` 22/22, `npm run news:test` ohne neue Fehler gegenüber dem bekannten lokalen Stand. PRs #810, #812, #817, #819.
- **Lehre:** Eine bedingte Regel in der Anweisung („bei X so, bei Y so") ist eine Einladung zum Fehler, wenn das Modell X und Y selbst wählen darf. Was der Server weiß, gehört als Tatsache in die Anfrage, nicht als Frage.

## 2026-09-16 - Claude: Formfehler heilen sich selbst; kein Auftrag bleibt liegen; Nachliefern in der App

- **Was:** Natalie: „ich sehe nichts zum Freigeben" und „setze das Gesamtsystem so auf, dass alle Hänger und Blocker und Fehler automatisch behoben werden". Der Befund war zutreffend: sechs offene Aufträge, alle auf „Versuch verbraucht, nichts geliefert", einer seit dem 13.09. Jeder war an einer Formregel gescheitert, keiner an einer redaktionellen Entscheidung. Drei Stufen greifen jetzt ineinander. (1) `normalizeEditorialPreview` gleicht Mechanisches an, bevor die Ablage prüft: doppelte Hauptüberschrift, Verlagsname aus der Adresse, Schlüsselnamen und Datumsform in `source_media`, Sendungsseite aus den Auftragslinks, und neu ein Bild ohne belegte Freigabe wird entfernt statt den Text zu verwerfen (`visual: null` ist im Vertrag ausdrücklich erlaubt). (2) Eine von der Ablage abgewiesene Ausgabe bekommt genau eine Nachlieferung im selben Lauf, mit den Befunden im Klartext und den Formatregeln; neue Aussagen sind ausdrücklich nicht erwünscht. (3) Erst danach greift der eine Nachlauf je Workerversion für alles, was liegen geblieben ist; ein geliefertes Ergebnis, auch ein begründeter HOLD, wird nie wiederholt. Dazu die von Natalie gewünschte Nachliefer-Funktion in der Redaktionsapp: jeder noch nicht veröffentlichte Auftrag hat einen Knopf, der Zusatz wird ein eigener Auftrag mit der Bindung in der ersten Zeile des Auftragstexts, der Worker legt den früheren Auftrag und eine bereits gelieferte Fassung als Material bei und verlangt eine vollständige neue Fassung. Der fortgeschriebene Auftrag läuft nicht mehr allein.
- **Gemessen:** Nach der Ausspielung lieferten die Läufe 09:20 bis 10:05 UTC vier Entwürfe aus, darunter der Auftrag vom 13.09. und die Nachgehört-Folge „Den Westen NEU DENKEN", die zuvor zweimal an Formregeln gescheitert war.
- **Geprüft:** `tests/news/redaktionsworker.test.mjs` 22/22, `tests/news/editorial-supplement.test.mjs` 6/6; die App lokal im Browser gefahren. Dabei ein echter Fehler im ersten Wurf gefunden: ein gesperrtes Eingabefeld liefert FormData nicht mit, `kind` war `null`. PRs #805, #813.
- **Lehre:** Jede Klasse von Formfehlern, die einen fertigen Text verwirft, kostet einen Menschen. Erst die Angleichung, dann eine Nachfrage im selben Lauf, dann ein Nachlauf je Korrektur — in dieser Reihenfolge braucht keine neue Fehlerklasse einen Eingriff.

## 2026-09-16 - Claude: Sendungen: Stichtag statt Stundenzahl, zwei Wege zur eigenen Abschrift

- **Was:** Natalie: „Die Lanz-Sendung habe ich beispielsweise auch noch nicht zur Freigabe gesehen" und später „Lanz sollten wir immer Zeit geben mit 14:00 am Folgetag". Drei Fehler lagen dazwischen. (1) Die Nachrück-Regel griff nicht, weil der Altvermerk das Feld `transcript_origin` nicht kennt und `undefined === null` falsch ist. (2) Die Warteklausel lautete `!transcript && (retry || ageHours < wait)` und war für einen Wiederholungsversuch immer wahr: der Zweig zur eigenen Spracherkennung war unerreichbar, die Folge hätte ohne ZDF-Untertitel endlos gewartet. (3) `MEDIA_TRANSCODE_FAILED` beim direkten ffmpeg-Zugriff auf die Mediathek, obwohl die Datei erreichbar ist (390 MB MP4, 77 Minuten, HTTP 200 mit Bereichsunterstützung) — und der Bericht nannte nur den Code, nicht den Grund. Jetzt: ein Stichtag der Sendung (Berliner Wanduhrzeit, `transcript_deadline` in der Senderliste) schlägt das allgemeine Stundenfenster, ffmpeg bekommt Browser-Kennung und Wiederverbindung, und scheitert der direkte Zugriff, wird die Datei geholt und lokal umgewandelt. Der Fehlerbericht trägt das Detail.
- **Geprüft:** `tests/news/sendungs-kandidaten.test.mjs` 15/15, neu darunter Sommer- und Winterzeit des Stichtags, kein bezahlter Aufruf davor, die eigene Abschrift danach, der Rückfall auf den Download mit Aufräumen und beide Gründe im Fehler. Im Lauf 10:05 UTC wartet die Folge sichtbar mit `deadline: 2026-09-16T12:00:00.000Z`. PRs #809, #811, #815, #818.
- **Lehre:** Eine Kurzschlussbedingung mit `||` kann einen ganzen Zweig unerreichbar machen. Und ein Fehlercode ohne Detail ist von außen nicht auffindbar.

## 2026-09-16 - Claude: Betrieb: Redaktionslauf in der Selbstheilung, rote Prüfung im Protokoll, Taktung folgt der Freigabe

- **Was:** Der Betriebsmonitor läuft alle 15 Minuten und kann Läufe selbst neu anstoßen (reserviert vor dem Anstoß, höchstens vier am Tag, genau einer je Lauf und Quellstand). Beobachtet hat er bisher nur Nachrichtenimport und Website-Auslieferung; der Redaktionslauf fehlte, also genau die Spur für Meinung & Analyse, Nachgehört und Nachgesehen. Fällt er aus, läuft die Nachrichtenspur weiter und in der App erscheint nichts zur Freigabe. Jetzt bekommt ein gescheiterter oder überfälliger Lauf genau einen erneuten Anlauf je Quellstand; ein hängender Lauf wird gemeldet, aber nie doppelt gestartet. Zweitens nennt die Zusammenfassung im Lauf-Protokoll die rote Prüfung beim Namen (nur Kennung, Name, Sofortkennzeichen — Inhalte bleiben draußen, weil die Läufe eines öffentlichen Repositoriums öffentlich sind); vorher stand das nur in Natalies Discord, und drei offene Störungen ohne Bezeichnung sind von außen nicht diagnostizierbar. Drittens folgt die Taktung der Monatsfreigabe: Natalie am 16.09. „Bis Monatsende sollten wir mit EUR 100 hinkommen. So könnten wir es festlegen." Der Rest der Freigabe wird auf die restlichen Stunden des Kalendermonats verteilt; ist in der letzten Stunde mehr bezahlt worden als diese Stunde kostet, pausiert der Lauf und die nächste Viertelstunde prüft neu. Keine Preisschätzung, nur gebuchte Kosten; eine höhere Freigabe hebt die Taktung von selbst, der Monatswechsel setzt sie zurück.
- **Gemessen:** 55,61 von 75,63 Dollar verbraucht (EUR 100 abzüglich Steuer- und Wechselkursreserve), 20,02 Dollar Rest auf 350 Stunden, also knapp 6 Cent je Stunde. Bei einem Aufruf je Meldung zu rund 1 Cent sind das etwa fünf Meldungen pro Stunde bis Monatsende — genau Natalies Zielgröße. Mit Nachbesserung wären es knapp drei. Nach der Ausspielung nennt der erste Monitorlauf die beiden roten Prüfungen: Titelbilder (vier veröffentlichte Meldungen mit Anbieterfehler, nicht blockierend, Kartenfallback greift) und redaktionelle Themenabdeckung.
- **Geprüft:** `tests/ops/news-recovery.test.mjs` 8/8, `tests/ops/discord-monitor.test.mjs` 35/35, `tests/news/evidence-packets.test.mjs` 22/22. PRs #814, #816.
- **Lehre:** Eine Zahl, die den Durchsatz bestimmt und die jemand nachstellen muss, ist eine Fehlerquelle. Der Rest der Freigabe geteilt durch die restliche Zeit braucht keine Pflege.

## 2026-09-16 - Claude: Ein Aufruf je Meldung: die Anfrage traegt die Vorgaben, nicht die Bitte

- **Was:** Natalie: „Wir müssen die Nachricht schon so weit vorbereitet haben, die wir hingeben, dass auch was Vernünftiges zurückkommt, ohne Nachbesserung, dass wir quasi nur einen Lauf brauchen. … das wäre dann eine Lizenz zum Drucken für OpenAI." Gemessen an den Läufen 09:35 bis 10:50 UTC brauchte praktisch jede Meldung eine Nachlieferung, also den doppelten Preis. Die Ursachen waren dreimal dieselbe Sorte: eine bedingte Regel in der Anweisung, über deren Bedingung das Modell selbst entschied. (1) `publication_depth` bestimmt die erlaubten Textlängen und war Modellwahl; jetzt setzt der Server sie aus dem Aktenstand, und `requiredPublicationDepth` ist die eine Ableitung für Vorgabe und Korrektur. (2) Statt „bei initial 60 bis 180, bei deepened 100 bis 180" nennt der Aufruf genau eine Zielspanne, komfortabel innerhalb der Prüfgrenzen (90 bis 160 bzw. 120 bis 170 Wörter, genau drei Absätze, Satz- und Zeichenspannen für `detail_summary`), und die Nachlieferung dieselbe. (3) Für Zahlen bekommt das Modell die Liste der belegbaren Zahlen je Quellenkennung, erzeugt mit demselben Auszug, den die Prüfung anwendet, statt einer Ermahnung. Dazu: „bestätigt" ist eine Tatsache über den Quellenbestand, keine Einschätzung; die Vorgabe nennt die Zahl der unabhängigen Herkünfte, und eine trotzdem unbelegbare Aussage wird deterministisch herabgestuft (`primary_source_claim`, `single_source_claim` oder `uncertain_claim`) statt die Meldung zu verwerfen. Alle Vorgaben stehen in der Anweisung, nicht im Meldungsteil: das gesendete Paket wächst kein Byte.
- **Gemessen:** Ein Aufruf bei gpt-5.6-luna kostet rund 1 Cent; mit Nachlieferung rund 1,9 Cent je Meldung. Fünf Meldungen pro Stunde ohne Nachlieferung sind rund 36 USD im Monat und passen damit in Natalies EUR 100. Nach der servergesetzten Tiefe waren die Längenbefunde aus den Halte-Gründen verschwunden; die Zahlen- und Unabhängigkeitsbefunde blieben und sind jetzt adressiert. `ai_repair_calls` je Lauf ist die Messgröße, Ziel null.
- **Geprüft:** `tests/news/direct-operation.test.mjs` 34/34, `npm run news:test` ohne neue Fehler. PRs #817, #819, #824.
- **Lehre:** Eine bedingte Regel ist eine Einladung zum Fehler, wenn das Modell über die Bedingung entscheidet. Was der Server weiß, gehört als Tatsache in die Anfrage; was er ableiten kann, korrigiert er selbst statt zu verwerfen.

## 2026-09-16 - Claude: Eine Folge bleibt dieselbe, auch wenn die Mediathek-Kennung wechselt

- **Was:** Die amtlichen Untertitel zum Lanz vom 15.09. erschienen um 10:50 UTC, rund 14 Stunden nach der Sendung — und genau in diesem Lauf verschwand die Folge aus der Kandidatenliste (`fresh_episodes` von 1 auf 0). Die untertitelte Fassung ist eine eigene Zeile der Mediathek mit eigener Kennung; die Entdopplung wählt sie zu Recht, damit wechselt aber `episode.guid`, an dem der Vermerk der ersten Einreihung hing. Die Folge galt als neu, und die Dublettenprüfung über die Sendungsseite verwarf sie, weil der eigene erste Auftrag dieselbe Seite als Link trägt. Ohne diesen Fund hätte die Nachbesprechung nie stattgefunden. Jetzt hängt der Vermerk an der Folge selbst (Titel ohne Fassungszusatz plus Sendezeit) und zusätzlich an der Sendungsseite; Altvermerke an der Mediathek-Kennung gelten weiter. Die Dublettenprüfung unterscheidet die Herkunft: ein Auftrag der Redaktion blockiert weiterhin, der eigene nicht, weil dafür der Vermerk zuständig ist.
- **Gemessen:** Lauf 11:23 UTC: Folge eingereiht mit `transcript_origin: accessibility_subtitles`, 59 737 Zeichen, 0 USD, und im selben Lauf als Entwurf ausgeliefert („Wenn politische Unruhe selbst zum Thema wird", sechs Zeitmarken im Text). Von der Sendung bis zum Entwurf zwölf Stunden, davon drei Minuten Bearbeitung.
- **Geprüft:** `tests/news/sendungs-kandidaten.test.mjs` 16/16, neu darunter dieselbe Folge mit und ohne Untertitel mit unterschiedlicher Mediathek-Kennung. PR #823.
- **Lehre:** Ein Vermerk gehört an die Sache, nicht an die Zeile, in der die Sache gerade steht.

## 2026-09-16 - Claude: Titelbilder: gemessen wird, was die Leserin sieht

- **Was:** Die Prüfung „Titelbilder" war rot und meldete vier veröffentlichte Meldungen mit technischem Fehler. Nachgesehen: alle vier haben eine vollständige Wirkungskarte; gemeldet wurde der Zustand eines Bildanbieters, den wir nach Natalies Entscheidung vom 15.09. gar nicht verwenden (kein generisches KI-Titelfoto, sondern Karte oder gekennzeichnetes Motiv, nie blockierend). Die Prüfung misst jetzt, ob eine veröffentlichte, gelistete Meldung ein nutzbares Titelbild (OG und quadratisch) hat. Damit wurde der Fehlalarm zum echten Fund: vier andere Meldungen haben gar kein Bild. Grund war eine Lücke in der Schlange, nicht im Bildbau — die Nachrüstung nahm nur Meldungen mit fälligem `retry_after`, und wer nie ein Bild hatte, hat auch keinen Vermerk. `pendingTitleImageQueue` nimmt jetzt zusätzlich jede veröffentlichte Meldung ohne Bild, fehlende zuerst; Obergrenze je Lauf und Zeitbudget bleiben, zusätzliche Kosten entstehen nicht, weil die Karte lokal gerendert wird.
- **Geprüft:** `tests/ops/discord-monitor.test.mjs` 35/35, `tests/news/evidence-packets.test.mjs` 23/23. PRs #821, #822.
- **Lehre:** Eine Prüfung, die den Zustand eines Zulieferers meldet statt das Ergebnis für die Leserin, erzeugt Fehlalarme und verdeckt echte Lücken.

