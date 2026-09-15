# Wirkungspotenzial-Recovery vom 15.09.2026

## Anlass

Ein Zwischenstand der Impact-2.1-Pipeline ließ bei einzelnen bereits veröffentlichten Meldungen `insufficient_basis` bzw. `magnitude: null` bis in die öffentliche Darstellung gelangen. Das widersprach der späteren, führenden Produktentscheidung: Wirkung ist eine eingetretene Zustandsänderung; Wirkungspotenzial wird ex ante modelliert. Fehlende Outcome-Messung ist für eine neue reguläre Veröffentlichung kein Grund für leere Potenzialbalken.

## Wiederherstellung ohne neuen Provider-Lauf

Die Recovery verwendete ausschließlich bereits vorhandene und unabhängig geprüfte Impact-2.1-Profile aus dem fest gepinnten Review-Stand von PR #771. Es wurden keine neuen Wirkungswerte erzeugt und kein Textanbieter-, LLM- oder Scoring-API-Aufruf gestartet.

- 13 vorhandene Kandidaten wurden konservativ gegen den aktuellen Datenstand geprüft.
- 10 konfliktfreie, bereits unabhängig geprüfte Profile wurden übernommen.
- 3 Profile wurden wegen konkurrierender bzw. geschützter Daten nicht überschrieben.
- Die gemeldete KI-Meldung `wt-aa6a91f8546c7299` ist mit Mensch 3/5, Planet 2/5 und Demokratie 2/5 wiederhergestellt.
- 17 weitere frisch veröffentlichte Impact-2.1-Datensätze ohne vollständiges bereits geprüftes MPD-Potenzial wurden fail-closed aus der öffentlichen Ausgabe gehalten, statt Werte zu erfinden. Die Datensätze bleiben für eine spätere reguläre Prüfung erhalten; der Hold dokumentiert `provider_call: false`.

## Validierung

Der isolierte Recovery-Lauf bestand 1.375/1.375 News- und Betriebstests sowie 41/41 Poll-Tests. `news:build`, `build:search`, `taxonomy:build` und `news:validate` liefen erfolgreich. Der Build änderte die kanonischen Wirkungsbewertungen nicht. Für alle zehn wiederhergestellten Profile wurden in den erzeugten Artikelseiten mindestens drei numerische `data-magnitude`-Balken geprüft; die KI-Meldung zusätzlich explizit auf 3/2/2 und Impact-Modell 2.1.

## Dauerhafte Prozessregel

PR #773 macht die vollständige MPD-Potenzialmodellierung zur zentralen Publikationsinvariante. Neue bzw. fachlich neu freigegebene Impact-2.1-Meldungen dürfen nur veröffentlicht werden, wenn Mensch, Planet und Demokratie jeweils einen begründeten modellierten Pfad und eine numerische Tragweite von 0 bis 5 besitzen. Historische Nullprofile bleiben nur im historischen bzw. Reassessment-Kontext lesbar. Der Produktionsrelease gilt erst nach erfolgreichem Deployment und commitgebundenem Live-Readback von Artikelseite, News-Feed und Merkzettel als abgeschlossen.
