# Wirkungsticker RSS

Der bestehende öffentliche News-Build erzeugt zwei getrennte RSS-2.0-Kanäle:

- News: `/wirkungsticker/feed.xml`
- Analysen und Nachbesprechungen: `/wirkungsticker/analyse/feed.xml`

Der zweite Kanal enthält Meinung & Analyse, Nachgehört, Nachgesehen sowie
Buch & Wirkung. Grundlage ist dieselbe veröffentlichte Auswahl wie in der
Website, keine separate Inhaltsablage und kein Zugriff auf Redaktionsentwürfe.
Freigabegates und manuell kuratierte Artikel bleiben unverändert.

Bestehende Abos von `/wirkungsticker/feed.xml` erhalten künftig nur News.
`/news/feed.xml` bleibt als Legacy-Alias des News-Kanals erhalten.
Artikel-URLs und GUIDs bleiben stabil. Beide Abos sind in News, Analysen,
Mehr und der Feed-Übersicht auffindbar; die Ticker-Seiten deklarieren beide
RSS-Kanäle zur automatischen Erkennung.

Der kombinierte JSON-Feed bleibt für App und Benachrichtigungen unverändert.
Auch der bestehende Atom-Gesamtfeed bleibt kompatibel.

Kanalmetadaten: `scripts/news/rss-channels.mjs`.
Erzeugung: `scripts/news/build.mjs` (im normalen `npm run news:build`).
Regressionstests: `tests/news/rss-channels.test.mjs`.
