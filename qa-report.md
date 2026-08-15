# QA-Bericht

Stand: 2026-05-19

## Umfang

Geprueft wurde die statische Website `wirkungsoekonomie.de` nach den redaktionellen, strukturellen, SEO-, Accessibility- und Performance-Aenderungen.

Lokale Pruefung:
- Server: `python3 -m http.server 8017`
- Einstieg: `http://localhost:8017/`
- HTML-Dateien im statischen Check: 155
- Sitemap-URLs: 137 eindeutige URLs

## Ergebnis

| Bereich | Ergebnis | Hinweis |
| --- | --- | --- |
| Hauptnavigation | bestanden | Alle zentralen Navigationsziele sind vorhanden und lokal aufloesbar. |
| Blogartikel-Links | bestanden | Statischer Linkcheck ohne tote interne Artikel-Links. |
| Interne Links und Assets | bestanden | 0 defekte interne Links/Assets, 0 fehlende Ankerziele. |
| Bildlinks | bestanden | Keine toten lokalen Bildreferenzen im statischen Check gefunden. |
| Redirect-Dokumentation | bestanden | `redirect-map.md` vorhanden; dokumentierte Ziel-URLs validiert. |
| Blogfilter | bestanden | Suche aktualisiert Status und Kartenliste ohne Konsolenfehler. |
| Mobile Navigation | bestanden | Menue-Toggle oeffnet Navigation, `aria-expanded` wechselt korrekt. |
| Canonical URLs | bestanden | Keine lokalen Canonical-Abweichungen gefunden. |
| robots.txt | bestanden | `Allow: /` und Sitemap-Verweis auf `https://wirkungsoekonomie.de/sitemap.xml`. |
| sitemap.xml | bestanden | 137 eindeutige non-www URLs, keine `www`-Canonical-Ziele. |
| Platzhalter-Indexierung | bestanden mit Hinweis | Keine eigenstaendigen indexierbaren Platzhalterseiten gefunden; Hinweise auf `blog.html` und `downloads.html` sind redaktionelle Abschnitte/Karten. |
| JavaScript-Syntax | bestanden | `assets/js/main.js`, `assets/js/erleben.js`, `assets/js/scorecard-dashboard.js` per `node --check` geprueft. |
| Lighthouse | nicht ausgefuehrt | Lighthouse CLI ist lokal nicht installiert; es gibt kein Node-Projekt/keine lokale Lighthouse-Abhaengigkeit. |

## Details

### Navigation und Mobile

Die Hauptnavigation wurde im Browser auf der Startseite geprueft:
- 10 Navigationslinks sichtbar/verfuegbar
- aktive Seite wird markiert
- Mobile Toggle vorhanden
- Toggle oeffnet das Menue
- `aria-controls="site-nav"`
- `aria-expanded` wechselt von `false` auf `true`
- keine Konsolenfehler waehrend der Pruefung

### Blogfilter

Die Blogseite wurde im Browser geprueft:
- Suche nach `Demokratie` filtert die Beitragskarten
- Ergebnisstatus aktualisiert sich: `12 von 33 Beiträgen werden angezeigt`
- Reset-Button ist vorhanden
- Herkunfts- und Texttypfilter sind vorhanden
- keine Konsolenfehler waehrend der Pruefung

### Links, Assets und Anchors

Statischer Site-Check:
- 155 HTML-Dateien geprueft
- 0 defekte interne Links oder Asset-Referenzen
- 0 fehlende lokale Ankerziele
- externe Links wurden nicht als Fehler gewertet, da sie ausserhalb des statischen Deployments liegen

### Redirects und Audit-Dokumente

Die dokumentierten URLs in `redirect-map.md` und `blog-audit.md` wurden gegen die lokalen HTML-Dateien validiert.

Korrektur im Rahmen der QA:
- Eine veraltete dokumentierte AFD-Ziel-URL wurde in `redirect-map.md` und `blog-audit.md` auf die existierende kanonische Artikelseite korrigiert.
- Danach: 0 dokumentierte URL-Zielprobleme.

### Platzhalter

Gefunden wurden nur redaktionelle Hinweise auf:
- `blog.html`: Abschnitt `Kommende Analysen`
- `downloads.html`: Downloadkarte mit ausstehendem Handbuch

Diese sind keine eigenstaendigen indexierbaren Blogartikel. Die Regel bleibt dokumentiert: Platzhalterseiten werden nicht als normale Artikel angezeigt und muessen, falls eigene Seiten entstehen, `noindex` erhalten.

### robots.txt und sitemap.xml

`robots.txt`:
```txt
User-agent: *
Allow: /
Sitemap: https://wirkungsoekonomie.de/sitemap.xml
```

`sitemap.xml`:
- 137 URLs
- 137 eindeutig
- 0 `www`-URLs

## Rest-Risiko

Lighthouse wurde nicht ausgefuehrt, weil das CLI lokal nicht vorhanden ist und fuer diese statische Seite keine Node/Lighthouse-Abhaengigkeit eingerichtet ist. Die Basispruefung wurde stattdessen ueber statische Link-/SEO-Checks, Browser-Interaktion, JavaScript-Syntaxpruefung und mobile Navigation abgedeckt.
