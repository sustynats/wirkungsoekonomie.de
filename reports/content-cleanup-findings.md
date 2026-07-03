# Content-Cleanup Findings

Stand: 2026-07-03

## Scope

Audit fuer WS3 auf Branch `content-cleanup`, Basis `origin/main` (`4465b1f398`). Gescannt wurden
oeffentliche HTML-/Markdown-/Include-Dateien und die relevanten Generatoren. Bestehende Reports,
Downloads, PDFs, Suchindex-JSON und interne Arbeitsarchive wurden ausgefiltert, damit keine
Alt-Audit- oder Binaer-Treffer die Bereinigung treiben.

## Befunde

| Kategorie | Befund | Bewertung | Umsetzung |
|---|---:|---|---|
| Oeffentliche Platzhalterformulierung | 5 Werkzeugseiten enthalten die sichtbare Formulierung `Diese Seite ist als Platzhalter vorbereitet`. | P1, weil oeffentlich und suchindexrelevant; Inhalt ist als vorbereiteter Arbeitsstand korrekt, aber das Wort `Platzhalter` wirkt unfertig. | Generator `scripts/portal/build-portal-architecture.mjs` anpassen; keine Einzel-HTML-Handpflege. |
| `[[...]]`-Reste | 0 oeffentliche Treffer. Die Rohsuche fand nur JavaScript-Arrayliterale in Generatoren. | Kein Fix noetig. | Beobachten. |
| TODO/TBD/FIXME/Lorem | 2 Treffer in `data/uwp/TODO.md` und `data/wirkungskompass/TODO.md`; nicht als oeffentliche Seite verlinkt. | Kein Public-Cleanup in diesem Sprint. | Nicht anfassen. |
| `Entwurf:` sichtbar | 5 Treffer, davon 3 in Apfel-Wirkungssteuer-Onlinefassungen und 2 LinkedIn-Entwurfsdateien. | Inhaltlich teilweise korrekt, weil modellhafte Rechts-/Steuerentwuerfe. Nicht blind entfernen. | Im Audit belassen; braucht redaktionelle Entscheidung statt automatischer Bereinigung. |
| Sichtbarer Markdown-Heading-Rest | 1 Treffer: `bibliothek/kommunaler-wirkungsindex-kwi-diskussionspapier/index.html` rendert den Pseudocode mit `# KWI 1.0 ...` in einem Absatz. | P1, weil oeffentlich und optisch falsch. | Build-stabil ueber `scripts/quality/apply-publication-qa-normalization.mjs` in einen Codeblock normalisieren. |
| Kaputte/flattened Tabellen | 16 oeffentliche Dateien mit Verdacht, besonders Apfel-/Produktwirkungssteuer-Beispiele. | P2/P3, weil mehrere Treffer echte Tabellen aus PDF/Docx-Extraktion sind. Risiko fuer Inhaltsveraenderung hoch. | Nicht pauschal fixen; eigenes Dokumenten-Extraktionspaket noetig. |
| Inhaltsverzeichnisse | 274 oeffentliche HTML-Treffer, u. a. Referenzkapitel und Toolseiten. | Meist gewollte TOC-Struktur, kein Dedupe-Autofix. | Kein Eingriff. |

## Bearbeiteter erster Cleanup

- Vorbereitete Werkzeugseiten behalten Status `In Vorbereitung`, verwenden aber oeffentlich keinen
  `Platzhalter`-Text mehr.
- KWI-Pseudocode wird als `<pre><code>`-Block gerendert, statt als Absatz mit sichtbarer
  Markdown-Ueberschrift.
- Kleine CSS-Regel fuer `.document-code-block`, damit der Codeblock mobil scrollbar und lesbar bleibt.

## Verifikation

- `npm run build` lief am 2026-07-03 in der isolierten Worktree `/tmp/woek-content-cleanup` gruen durch.
- Muster-Smoke nach Build: die 5 vorbereiteten Werkzeugseiten enthalten nicht mehr
  `Diese Seite ist als Platzhalter vorbereitet`; die KWI-Bibliotheksseite enthaelt
  `.document-code-block`.
- URL-Diff gegen `/Users/hagen/Documents/New project/reports/url-baseline.txt` (4624 URLs):
  0 verlorene Baseline-URLs, 12 zusaetzliche `docs/wirtschaft-unternehmen/source-html/*`-HTML-Routen.
  Die Zusatzrouten sind kein Verlust und wurden nicht durch diesen Cleanup geloescht oder umgeleitet.

## Nicht blind bereinigt

`Redaktion`, `Entwurf`, Inhaltsverzeichnisse und extrahierte Tabellen wurden bewusst nicht pauschal
entfernt. In diesem Bestand sind diese Begriffe teils rechtlich/redaktionell sinnvoll oder stammen aus
umfangreichen Dokumentimporten, bei denen ein automatischer Textgriff zu inhaltlichen Verlusten fuehren
kann.
