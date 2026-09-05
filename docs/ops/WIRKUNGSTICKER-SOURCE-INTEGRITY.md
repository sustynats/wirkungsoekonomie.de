# Wirkungsticker: Quellenintegrität

## Anlass und Root Cause

Die Story `wt-06476c6e980f5f47` zur Landtagswahl in Sachsen-Anhalt enthielt fälschlich einen rbb24-BerlinTrend zur Berliner Abgeordnetenhauswahl. Korrekte Ausgangsquelle war der frei zugängliche Stern-Bericht „CDU-Kandidat: Keine Koalition mit Links oder AfD“, ergänzt um weitere Berichte zur Wahl in Sachsen-Anhalt.

Die Ursache lag im Ereignis-Clustering: Allgemeine Wörter wie „Wahl“ und „Stimmung“ konnten innerhalb des Zeitfensters eine Ähnlichkeit erzeugen, während die Wahljurisdiktion nicht als hartes Konfliktmerkmal behandelt wurde. Hinzu kam, dass die technische Feed-Quelle gelegentlich auf Artikel eines anderen registrierten Publishers weiterleitete; der Sammlername war dann nicht der tatsächliche Herausgeber der Ziel-URL.

## Dauerhafte Sicherung

`scripts/news/source-integrity.mjs` läuft vor jedem KI-Aufruf und erneut als strikter Bestandsaudit vor Veröffentlichung. Es prüft:

- Zielhost und registrierten Publisher;
- tatsächlichen Publisher bei Feed-Weiterleitungen;
- Titel, URL, Datum und Quellenrolle;
- zentrale Entitäten, Thema, Ort und Wahljurisdiktion;
- Story-Cluster und offensichtliche Reste einer anderen Story;
- doppelte oder veränderliche URLs;
- Primär-/Sekundärquellenrolle.

Nicht ausreichend passende Quellen führen zu `publication_status = hold` und `source_integrity = open`. Das System rät nicht. Eine bereits veröffentlichte Akte wird bei einer Korrektur versioniert, ihr Quellen- und Claim-Bezug neu berechnet und ihre Einordnung erneut geprüft.

## Bestandsaudit

`npm run news:source-integrity:audit -- --strict` prüft alle aktiven Akten. Der Korrekturlauf entfernte die Berliner Wahlquelle, normalisierte vier Feed-Weiterleitungen auf den tatsächlichen Publisher tagesschau/ARD, ergänzte zwei belegte Bundestagsdaten und stellte drei Euronews-Links auf HTTPS um. Veränderliche Liveblog- oder Fortschreibungs-URLs bleiben als Warnung sichtbar und werden bei künftigen Abrufen erneut inhaltlich geprüft; sie werden nicht still als unabhängige neue Quelle gezählt.

Regressionstests decken insbesondere verschiedene Landtagswahlen, Publisher-Weiterleitungen, semantische Fehlmatches und Bestandsaudits ab.
