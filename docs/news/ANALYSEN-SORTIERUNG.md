# Reihenfolge der Analysen

Stand: 28.09.2026. Von Natalie beauftragte Trennung von neuer Veröffentlichung,
Originalfolge und späterer Aktualisierung.

- Gesamtübersicht, Meinung & Analyse und Bücher: erste Veröffentlichung der
  Einordnung (`published_at`), neueste zuerst. `updated_at` ist ausschließlich
  ein Aktualisierungshinweis und verschiebt den Beitrag nicht.
- Nachgehört/Nachgesehen sowie die Medienauswahl auf der Startseite: Datum der
  Originalfolge, neueste zuerst. Bei fehlendem gültigem Folgendatum gilt die
  erste Veröffentlichung der Einordnung. Der Sortierhinweis nennt diese Regel.
- Bei gleichem Folgendatum folgt die neuere Veröffentlichung der Einordnung.
  Bei anschließend gleichen Zeitpunkten entscheidet die unveränderte URL.
- Die Suche behält ihre wählbare Relevanzsortierung. Bei gleichem Suchrang und
  bei „Neueste zuerst“ gelten dieselben Datums- und Zweitsortierregeln wie in
  der gewählten Formatliste. Ohne Medienfilter zählt die Veröffentlichung.
- Ressortfilter und Nachladen dürfen die Reihenfolge nicht ändern.
- Nachrichten behalten ihren bisherigen Ereignis-/Nachrichtenzeitbezug.
  Der Merkzettel bleibt nach Speicherzeit sortiert.

Die einzige gemeinsame Vergleichsfunktion liegt in `assets/js/ticker-order.js`.
Der vorhandene App-Generator liefert Veröffentlichung (`date`), optionales
Folgendatum (`episode_date`) und die URL an Listen, Suchindex und Browser.
Die Datumsangaben in den redaktionellen Quelldaten werden nicht verändert.
RSS/Atom behalten unverfälschte Veröffentlichungs- und Aktualisierungsmetadaten;
die gemischte Reihenfolge richtet sich bei Analysen nach Erstveröffentlichung.

Regressionstests: `tests/news/episode-chronology.test.mjs`,
`tests/news/feed-order.test.mjs`, `tests/news/app-pages.test.mjs` und
`tests/news/ticker-search.test.mjs`.
