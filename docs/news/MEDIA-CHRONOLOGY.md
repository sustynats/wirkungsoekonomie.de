# Chronologie von Nachgehoert und Nachgesehen

Stand: 24.09.2026

- Medienbesprechungen (`listened`, `watched`) stehen absteigend nach dem
  Datum der Originalfolge in `source_media.original_release_date`.
- ISO-Zeitstempel werden dem Kalendertag in Europe/Berlin zugeordnet.
  ISO-Datumsangaben und historische deutsche Datumsangaben werden ebenfalls
  gelesen. Unmoegliche oder unbekannte Daten werden nicht geraten.
- Ohne gueltiges Originaldatum gilt ersatzweise die erste Veroeffentlichung
  der Einordnung; die Karte benennt das fehlende Originaldatum.
- Import, Freigabe, Korrektur und spaetere persoenliche Einordnung machen eine
  alte Folge nicht zu einer neuen. Bei gleichem Folgentag entscheidet die
  stabile Beitragskennung, nicht die Reihenfolge in der Quelldatei.
- Startseite, Analysenliste, Formatfilter, Seitenwechsel, Nachladen, Suche nach
  Neueste zuerst und die Reihenfolge der Feed-Eintraege verwenden dieselbe
  Ableitung aus `scripts/news/feed-order.mjs`. Relevanzsuche und Merkzettel
  behalten ihre explizite Such- bzw. Speicherreihenfolge.
- Die Karte zeigt Folge/Sendung samt Originaldatum und Episodentitel sowie
  separat die Veroeffentlichung der Einordnung. Korrekturhinweise bleiben am
  Beitrag. Die Darstellung aendert keine freigegebenen Texte, Hashes,
  Publikationsdaten, Freigaben oder Push-Herausgabezeiten.
- Der technische Sortierschluessel verwendet Mitternacht UTC fuer einen
  Kalendertag; das ist keine behauptete Sendezeit. SEO und RSS/Atom behalten
  die tatsaechlichen Veroeffentlichungs-/Aenderungsdaten der Einordnung.
  JSON Feed liefert das Originaldatum separat als `_woek_original_episode_date`.
- Nachrichten, normale Meinung & Analyse und Buch & Wirkung behalten ihre
  bisherigen Datumsregeln.

Regression: Lanz + Precht #263 (18.09.) vor #262 (11.09.) vor #261 (04.09.),
auch nach einer spaeteren Korrektur der aelteren Folge. Automatische Tests
pruefen Datumserkennung, Rueckfall, Pagination, Suche, Metadaten und die
Unveraendertheit freigegebener Inhalte.
