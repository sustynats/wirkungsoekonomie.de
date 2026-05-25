# Release Browser Check

Stand: 2026-05-25T21:30:32.395Z

Lokale Stichprobe ueber HTTP-Server `http://127.0.0.1:8765`. Geprueft wurden ausgelieferter HTML-Output, H1, Sperrbegriffe und generische CTAs. Mobile wurde grob ueber responsive Struktur und eingeklappte Filter/Inhaltsbereiche statisch geprueft; der finale Live-Check folgt erst nach Deploy.

| Seite | H1 | sichtbar okay | keine verbotenen Begriffe | keine falschen CTAs | Mobile grob |
| --- | --- | --- | --- | --- | --- |
| `/` | Gewinn und Wachstum reichen als Maßstab nicht. | ja | ja | ja | ja |
| `/wirkungsfelder/` | Wirkungsfelder | ja | ja | ja | ja |
| `/wirkungsfelder/bildung/` | Bildung als Wirkungsinfrastruktur | ja | ja | ja | ja |
| `/wirkungsfelder/gesundheit-pflege/` | Gesundheit & Pflege | ja | ja | ja | ja |
| `/wirkungsfelder/arbeit-einkommen/` | Arbeit & Einkommen | ja | ja | ja | ja |
| `/wirkungsfelder/produkte-konsum/` | Produkte &amp; Konsum | ja | ja | ja | ja |
| `/wirkungsfelder/wirtschaft-unternehmen/` | Wirtschaft &amp; Unternehmen | ja | ja | ja | ja |
| `/werkzeuge/impact-controlling/` | Impact Controlling | ja | ja | ja | ja |
| `/erleben.html` | Die Wirkungsökonomie erleben | ja | ja | ja | ja |
| `/anwendungen/scanner.html` | WÖk-Scanner | ja | ja | ja | ja |
| `/erleben/automatisierungs-wirkungseinkommensrechner/` | Automatisierungs- und Wirkungseinkommensrechner | ja | ja | ja | ja |
| `/suche.html` | Finde den richtigen Einstieg. | ja | ja | ja | ja |
| `/downloads.html` | Bücher, Whitepaper und Working Papers | ja | ja | ja | ja |
| `/akademie.html` | Wirkung verstehen lernen | ja | ja | ja | ja |

Hinweis: Der finale Live-Check kann erst nach Merge/Deploy erfolgen.
