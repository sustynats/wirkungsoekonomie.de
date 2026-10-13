# Codex-Auftrag: Navigation und Auffindbarkeit, Phase 0 und 1

Stand 2026-10-09 · von Claude (Design/UX-Lane) · Grundlage: `docs/navigation/navigationskonzept-v1.html`, Messung auf main `469f84d` (20.210 HTML-Dateien, 18.659 ohne Weiterleitungen).

## Ziel

Der Zugang zu allen Inhalten wird leichter, ohne dass eine Seite oder URL verloren geht. Phase 0 und 1 hängen nicht von Natalies offenen Entscheidungen ab und können sofort starten. Inhalte werden hier nicht geändert; das läuft separat (Marktmechanismus-Seite, Bereinigung der Inkonsistenzen).

## Was noch wartet (bitte nicht anfassen)

Diese Punkte entscheidet Natalie noch. Bis dahin bleiben sie, wie sie sind:

- Menüpunkte und Labels (Vorschlag: sieben Räume plus Ökosystem-Leiste). Phase 0 baut die eine Quelle mit den **heutigen** Punkten aus `assets/data/navigation.json`.
- Portale als Querschnittsthemen in die Wirkungsfelder einhängen.
- Interne Release-Schicht archivieren (`website-1-0-release/`, Rang-Pakete in `downloads/`, `fachbibliothek/`).
- Die 2.249 Spiegelkarten (`bibliothek/eintraege/online-version-*`) aus dem Katalog nehmen.
- Gemeinsame Rubrik „Meinung & Analyse" für Journal und Ticker-Analysen.
- Staatsarchitektur- und GGO/BHO-Abschnitte von der Startseite umziehen.
- Das sichtbare Desktop-Menü mit Mega-Menü (Phase 2, Claude). Die CSS-Regel, die die Navigation auf allen Breiten ausblendet (`style.css` Z. 17915–18024), bleibt vorerst.

## Leitplanken

- **Keine URL entfernen.** Die Prüfung gegen `reports/url-baseline.txt` bleibt das Tor. Zusammenführen heißt Weiterleitungsseite plus Canonical.
- **Gebaute Seiten vergleichen:** Vor und nach jedem Teilauftrag die Verweise der gebauten Seite gegen den Bestand prüfen. Ein gescheiterter Build blockiert die Veröffentlichung.
- **Größenlimit Pages:** Die Bilanz je Teilauftrag messen und im PR nennen.
- **Keine privaten Pfade** in Repo oder PR.
- **Ein PR pro Teilauftrag**, mit Vorher/Nachher-Zahlen aus dem Navigationsbericht (P1.5).

---

## Phase 0: Fundament

### P0.1 Eine Quelle für den Header

**Heute:** mindestens 10 deutsche Header-Varianten. `assets/data/navigation.json` (faktisch aktuell, Variante A, 13.965 Seiten) widerspricht `templates/header.html` (veraltet, ohne „Institut", mit „Start", „Wirkungssteuerung", „KI", „WÖk-App"). Rund 20 Generatoren lesen die veraltete Vorlage, rund 79 Skripte schreiben eigenes Markup. Beispiele: `scripts/news/build.mjs`, `scripts/lib/content-page.mjs`, `build-glossary-pages.mjs`, `build-institut-teaser.mjs`, `build-site-updates.mjs`, `build-podcast-pages.mjs`, `scripts/methods/build-methodenraum-pages.mjs`, `scripts/tools/build-woek-id-register-public-explorer.py`, `scripts/i18n/*`. Teil-Pipelines ohne Normalisierung: Ticker (`news:build`), `build:parlament-info`.

**Auftrag:**
- Eine gemeinsame Render-Funktion aus `navigation.json`, die alle Generatoren nutzen.
- `templates/header.html` aus dieser Quelle erzeugen oder abschaffen.
- Normalisierung in allen Teil-Pipelines.
- `SITE-INVENTORY.md` und `README.md` nachziehen.

**Bewusst so:** Alle Seiten bekommen die Punkte aus `navigation.json`. Der Ticker verliert damit „Start" und „Wirkungssteuerung" und bekommt „Institut". Seine eigene App-Leiste bleibt als lokale Navigation **unter** dem globalen Header.

**Wichtig für später:** Wenn Natalie die sieben Räume freigibt, soll der Wechsel eine reine Datenänderung in `navigation.json` sein.

**Abnahme:** Der Hash-Zensus ergibt genau eine deutsche Header-Variante und eine englische aus derselben Quelle.

### P0.2 Footer überall, eine Variante

**Heute:** rund 4.000 Inhaltsseiten haben keinen Footer: alle 3.103 `bibliothek/eintraege/*`, `bibliothek/index.html` und weitere Bibliotheksseiten, 681 `woek-id-register/*`, 157 `methodenraum/*` und `404.html`. `scripts/site/normalize-site-footer.mjs` schließt `methodenraum` und `en/` aus (Z. 77–78). Live sind die Footer-Varianten f1, f2, f3, f4 und f7. Journal, Impressum und Datenschutz stehen doppelt drin.

**Auftrag:** Ein Footer aus `navigation.json` auf allen Seiten. Doppelte Links entfernen.

**Abnahme:** 0 Inhaltsseiten ohne Footer; genau eine Footer-Variante.

### P0.3 Keine Links auf Weiterleitungen

**Heute:**
- `journal/` (Footer, rund 14.500 Seiten) leitet auf `blog.html` weiter.
- `akademie/` (Footer) leitet auf `akademie.html` weiter.
- `glossar.html#…` wird 243-mal verlinkt und leitet auf `begriffe/` weiter.
- `downloads.html` (Legacy-Bibliothek) hat 74 eingehende Links.
- Weitere Stub-Ziele, etwa auf der Startseite.

**Auftrag:**
- Interne Links direkt auf das Ziel setzen.
- Neue Build-Prüfung: keine internen Links auf Meta-Refresh-Seiten.

**Abnahme:** Header und Footer verlinken keine Weiterleitung mehr; der Rest steht als Liste im PR.

### P0.4 Barrierefreiheits-Brüche

- **Skip-Link:** zeigt auf 557 Seiten ins Leere. `main.js` Z. 103–114 setzt `#main-content`, `<main>` trägt dort aber eine andere `id` (wirkungsradar 512, blog 25, podcast 9 u. a.).
- **`aria-current`** (`main.js` Z. 209–231, 268–281): `page` nur für die aktuelle Seite, `true` für den aktiven Bereich. Keine Mehrfachmarkierung durch überlappende Muster (z. B. `fuer/wirkungssteuer.html`, `woek-ki/`).
- **Mobiles Panel:** als Dialog mit `aria-modal`. Die Schnellzugriffe nicht doppelt im Accessibility-Tree.
- **Seiten ohne `main.js`** haben gar keine Navigation: `werkzeuge/faktencheck/` und `umfragen/stadtvergleich-bundestagswahl-2025/`.
- **Breadcrumb-Landmarks** ohne Label vereinheitlichen auf `aria-label="Brotkrumen"`. In `wirkungssteuerung/*` steht der Breadcrumb heute als `<p>`.

**Abnahme:** 0 kaputte Skip-Links; höchstens eine Markierung mit `aria-current="page"` pro Seite.

### P0.5 Englischer Link zu „Frag die WÖk"

In `scripts/site/normalize-site-header.mjs` (`renderEnglishUtilityLink`, Z. 55–65) steht noch der alte Schlüssel „WÖk-KI". Der englische Link führt deshalb auf `/en/` statt auf `/en/woek-ai/`.

### P0.6 Kleine Brüche

- 18 Finder-Dubletten „index 2.html", 14 davon in Inhaltsbereichen: noindex setzen und Ursache im Build abstellen (siehe `scripts/quality/archive-macos-duplicate-routes.mjs`).
- `werkzeuge/wirkungswahl-kompass/`: Die H1 zeigt den ungerenderten Platzhalter `${esc(DATA.meta.claim)}`.
- `erleben/` verlinkt eine rohe `.md`-Datei.

---

## Phase 1: Finden

### P1.1 Eine Routenliste

Ein Build-Artefakt mit allen öffentlichen, indexierbaren HTML-Seiten. Ausgeschlossen sind noindex-Seiten, Meta-Refresh-Seiten und interne Pfade. Diese Liste speist Sitemap, Suchindex und die Zahlen für Menü und Bereichs-Startseiten. Damit gibt es eine Wahrheit statt vieler Einzelgeneratoren.

### P1.2 Sitemap

**Heute:** 5.093 URLs, das sind 29 % der indexierbaren Seiten.

**Fehlt fast ganz:**

| Bereich | in der Sitemap |
|---|---|
| referenz | 1 von 1.663 |
| bibliothek | 4 von 9.178 |
| wirkungsradar | 0 von 468 |
| woek-id-register | 2 von 681 |
| methodenraum | 0 von 157 |
| blog | 28 von 175 |
| dokumente | 0 |
| podcast | 0 |

Es fehlen außerdem die Bereichs-Startseiten `oeffentlicher-wirkungsraum/`, `woek-ki/`, `bibliothek/`, `institut/` und `verstehen/`. Gleichzeitig stehen `anwendungen.html` und `verstehen.html` in der Sitemap, obwohl ihr Canonical woanders hinzeigt. `robots.txt` sperrt `/quellen/`, die Seiten sind aber in der internen Suche.

**Auftrag:** Die Sitemap entsteht aus der Routenliste, als Sitemap-Index mit einer Datei pro Bereich. Den Widerspruch bei `/quellen/` klären.

**Abnahme:** 100 % der Routenliste in der Sitemap.

### P1.3 Suche mit voller Abdeckung

**Heute:** Gut 5.265 echte Seiten sind durchsuchbar, rund 30 %. Die Ursachen:
- `scripts/search/build-woek-search-index.mjs` nutzt eine feste Liste `contentFiles` (Z. 633).
- `scripts/search/build-browser-search-index.mjs` (`isArchiveDetail`) verwirft alle Unterseiten von Bibliothek und Quellenarchiv.
- 676 Weiterleitungs-Hüllen stehen im Index.
- 45 Titel enthalten doppelt maskierte Entities.
- 924 Ticker-Meldungen mit Priorität 70 verdrängen Kerninhalte.
- Die Filter laufen leer, weil die Metadaten praktisch nur zwei Werte kennen: Begriff und Referenz.
- 17 von 61 kuratierten Routen zeigen auf nicht indexierte Seiten.
- Es gibt einen Fallback auf die 75 MB große Indexdatei.

**Auftrag:**
- Der Index entsteht aus der Routenliste minus Ausschlussliste.
- Archiv-Unterseiten kommen als nachladbarer Teil dazu, statt verworfen zu werden.
- Weiterleitungen raus, Entities decodieren.
- Ticker als eigene, niedrig gewichtete Gruppe.
- `section` und `type` aus der URL-Taxonomie ableiten; Filterwerte dynamisch, mit Trefferzahlen.
- Kuratierte Routen in der Build-Prüfung gegen den Index prüfen.
- Den 75-MB-Fallback entfernen.

**Architektur:** Bitte kurz entscheiden, ob Pagefind passt (`data-pagefind-body` steht schon auf 13.224 Seiten) oder ob die eigene Suche mit Aufteilung erweitert wird. Kriterien:
- Indexgröße und Ladeverhalten
- Rechenlast auf dem Handy
- Facetten
- deutsche Wortformen
- Weiterverwendung von `search-dictionary.json` und `search-associations.json`

Die Entscheidung bitte als kurze Notiz in `docs/navigation/` ablegen.

**Schnittstelle für Claude:** Die Oberfläche baut Claude, also Feld in der Kopfzeile, Vorschläge, Ergebnisseite und Umgang mit leeren Treffern. Damit wir parallel arbeiten können, bitte zwei Funktionen bereitstellen:
- `suggest(prefix, { limit })` liefert `[{ title, url, type, raum, snippet }]` aus einem kleinen Vorschlags-Index (Ziel rund 150 KB: Titel, Begriffe, Aliase).
- `search(query, { raum, typ, thema, rolle, page })` liefert `{ total, results, groups, facets: { <name>: [{ value, count }] } }`.

**Abnahme:**
- Suchabdeckung mindestens 98 % der Routenliste.
- 0 Weiterleitungen im Index.
- Jeder angebotene Filterwert hat mindestens einen Treffer.

### P1.4 Bereichs-Startseiten verlinken alle Kinder (statisch, crawlbar)

| Bereich | Heute | Auftrag |
|---|---|---|
| `wirkungsradar/` | 6 von 31 Unterbereichen verlinkt, 386 Seiten verwaist, darunter detail 125/139, narrative 63 | alle öffentlichen Module verlinken. `studio/` (91) und `embed/` (41) sind Produktionsseiten: klären, ob öffentlich, sonst noindex |
| `woek-id-register/` | 621 Einträge nur per JavaScript, ohne eingehenden Link | statische, blätterbare Liste aller Einträge |
| `wirkungsticker/` | Archiv nur über eine Blätterkette (Median 6, maximal 16 Klicks), 64 Lagen verwaist | Lage-Archiv `lage/` nach Datum; Meldungen und Analysen als blätterbare Listen |
| `erleben/` | 4 von 22 Demos verlinkt | alle verlinken |
| `wirkungssteuerung/` | 11 von 19 Bausteinen | alle verlinken, auch wstg, wustg, westg, csrd, dpp |
| `bibliothek/studienskripte/` | 49 Skripte, nicht erreichbar | in Bibliothek und Lernen einhängen |
| `quellenarchiv/` | 1.333 von 1.485 verlinkt | alle verlinken |
| `methodenraum/` | keine `index.html` | Bereichs-Startseite anlegen |
| `wirkungsfelder/`, `verstehen/`, `fuer/` | `wirkungsfinanzpolitik`, `ausgangslage` und einzelne Rollen fehlen | ergänzen |
| `tools/` | 25 Karten ohne einen einzigen Link | Weiterleitung auf `werkzeuge/` |

Lange Listen werden auf statische Folgeseiten verteilt (`…/seite/2/`, 50 pro Seite). Ziel für die erste Ladung jeder Bereichs-Startseite: unter 300 KB. Heute: `begriffe/` 4,25 MB, `bibliothek/` 3,9 MB, `woek-id-register/` 2,4 MB, `quellenarchiv/` 1,5 MB.

**Abnahme:** Der Linkgraph zeigt 0 nicht erreichbare Seiten, außer bewusst noindex oder Archiv. Jede Bereichs-Startseite verlinkt 100 % ihrer Unterbereiche.

### P1.5 Navigationsbericht als Build-Prüfung

`scripts/quality/check-navigation-discovery.mjs` erweitern. Als Vorlage dient `docs/navigation/linkgraph-referenz.py`, das Messskript dieser Analyse, das in rund einer Minute über alle Seiten läuft.

Kennzahlen je Bereich:
- Klicktiefe ab der Startseite (Ziel: mindestens 95 % in höchstens drei Klicks)
- nicht erreichbare Seiten
- Header- und Footer-Varianten
- Seiten ohne Footer
- Breadcrumb vorhanden
- Abdeckung in Sitemap und Suche
- Vollständigkeit der Bereichs-Startseiten
- Skip-Link-Ziele

Der Bericht erscheint in jedem PR. Zunächst als Warnung, nach Phase 1 als Tor gegen Rückschritte.

---

## Ausgangswerte (main `469f84d`)

| Kennzahl | Heute | Ziel nach Phase 1 |
|---|---|---|
| Seiten in höchstens 3 Klicks ab Start | 56 % | ≥ 95 % (Endziel nach Phase 2) |
| Über keinen Link erreichbar | 2.157 (12 %) | 0, außer Archiv |
| Suchabdeckung (indexierbar) | ≈ 30 % | ≥ 98 % |
| Sitemap-Abdeckung | 29 % | 100 % |
| Header-Varianten (deutsch) | ≥ 10 | 1 |
| Inhaltsseiten ohne Footer | ≈ 4.000 | 0 |
| Kaputte Skip-Links | 557 | 0 |
| Größte Bereichs-Startseite | 4,25 MB | < 300 KB |

Nicht erreichbar je Bereich (echte Seiten ohne Weiterleitungen):

| Bereich | nicht erreichbar | Gesamt |
|---|---|---|
| woek-id-register | 679 | 681 |
| wirkungsradar | 386 | 633 |
| bibliothek | 795 | 9.795 |
| quellenarchiv | 152 | 1.486 |
| wirkungsticker | 76 | 963 |

## Was Claude parallel macht

- **Header- und Footer-Bauteil** (Markup, CSS, Barrierefreiheit) als Referenz für das spätere sichtbare Menü. Es wird in die eine Render-Funktion aus P0.1 eingesetzt. Für Codex entsteht dadurch keine doppelte Arbeit.
- **Such-Oberfläche** auf Basis der Schnittstelle aus P1.3.
- Sobald Natalie entschieden hat: Phase 2 (Menü, Seitenrahmen, Muster für Bereichs-Startseiten) und die Aufträge für Phase 3.

Bitte nach jedem Teilauftrag einen Eintrag in `docs/claude-codex-worklog.md`.
