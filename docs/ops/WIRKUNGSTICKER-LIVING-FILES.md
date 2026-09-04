# Lebende Wirkungsakten und Themenverweise

Stand: 4. September 2026. Betriebsregel für die automatische Aktenzuordnung.

Der atomare Git-Publisher integriert zwischenzeitliche `main`-Änderungen vor jedem
von höchstens drei Push-Versuchen erneut. Rebase-Konflikte bleiben ein Fehler;
kein Force-Push und keine automatische Wahl einer Konfliktseite. So wird ein
normaler paralleler Release während des Uploads nicht sofort zum verlorenen Lauf.

Große KI-Eingaben referenzieren doppelte Quelltexte zusätzlich verlustfrei über
`claim_from_source` (Quellenindex) und `claim_text_length`. Die Rekonstruktion ist
exakt `title + ': ' + abstract`, auf die ursprüngliche Claim-Länge begrenzt.
Keine Quelle, Beleg-ID, Provenienz oder Aussage wird dafür aus dem Datenbestand
entfernt. Die Eingabegrenze und das Fakten-/Relevanzgate bleiben unverändert.

## Vor dem KI-Aufruf

`living-files.mjs` trennt Dokumentidentität, konkreten Vorgang und bloßen Themenbezug. `clusterItems()` löst bekannte Akten zuerst auf, bevor unbekannte Feedmeldungen neue Cluster bilden. Quellenpriorität und Reihenfolge dürfen eine bekannte Aktenidentität nicht übergehen. Historische Alias-Quellen führen zur fortgeführten Akte.

- Trackingparameter und Fragmente ändern die Dokumentidentität nicht. Bei Stern, Spiegel und Tagesspiegel wird die stabile Artikel-ID auch bei geänderter URL-Überschrift erkannt; sonst bleiben bedeutungstragende URL-Parameter erhalten.
- Konkreter Ort, Gegenstand und Zeitfenster begrenzen die Zuordnung. Herausgeberregionen sind keine Ereignisorte. Die Herkunft eines Bekennerschreibens ist ebenfalls nicht automatisch Tatort.
- Besonders abgesichert ist die aktuelle Sabotage-Berichterstattung: ein Umspannwerk-Vorgang am selben expliziten Ort innerhalb von sieben Tagen kann dieselbe Akte fortsetzen. Andere Orte, erkennbare weitere Angriffe, ortsübergreifende Sammelmeldungen und Schutzentscheidungen bilden keine automatische Ereignisunion.
- Ein ausdrücklich mehrere Anschläge behandelnder Ermittlungsbericht wird nicht in die Akte eines einzelnen Tatorts einsortiert, auch nicht bei einer wiederverwendeten Artikel-URL. Jänschwalde und NRW bleiben getrennt; ein übergreifender Bericht kann beide als Themenverweis verknüpfen. Solche Links übertragen keine Fakten, Echtheitsurteile, Quellenrollen oder Versionen zwischen Akten. Die konkreten Nutzerbeispiele vom 4. September sind als Regressionstests enthalten.
- Politische Verfahrensschritte können über spezifische Dokument-/Gesetzesbezüge dieselbe Akte aktualisieren. Ein allgemeines Stichwort wie Offshore-Wind genügt nicht. Erkannte unterschiedliche Jurisdiktionen werden getrennt.
- Unsichere Zuordnung ist weiterhin möglich. Diese Regeln behaupten weder perfekte Ereigniserkennung noch vollständige Medienabdeckung. Eine falsche Zuordnung braucht eine transparente Korrektur.

## Zusammenführung ohne stilles Umschreiben

Jeder headless Lauf sucht vor Analyse und Retry nach hochsicheren Doppelakten. Die bevorzugte Akte bleibt nach einer Zusammenführung stabil; andernfalls wird der jüngste geprüfte Stand bevorzugt. Quellen werden nicht ungeprüft zu veröffentlichten Claims erklärt: Die Vereinigung geht als `pending_update` durch dasselbe Relevanz- und Evidenzgate.

Frühere Daten bleiben vollständig in `data/news/stories.json` und Git erhalten, einschließlich Quellen, Claims, Versionen und noch offener Aktualisierung. Die alte URL zeigt einen `noindex,follow`-Transparenzhinweis mit Link zur Fortführung. In der fortgeführten Akte werden Datum und Herkunft der Zusammenführungen verlinkt. Historische Belege werden nicht umnummeriert. Folgeprüfungen werden mit Herkunft übertragen; zusammengeführte IDs sind aus Retry, Pending-Liste und fälligen Folgeprüfungen ausgeschlossen.

Eine Zusammenführung erhöht weder `current_version` noch `last_updated` oder den Neunachrichten-Zähler. Erst ein tatsächlich erfolgreich geprüftes materielles Update erhält eine neue Version, rückt nach vorn und erreicht den vorhandenen Push-Pfad nach erfolgreichem Pages-Deployment. Das Push-Publikationskennzeichen bleibt Akten-URL plus Änderungsdatum. Wiederholte Deployments versenden keine neue identische Nachricht.

Eine separate öffentliche Revision im JSON Feed und in der Übersichtsseite aktualisiert geänderte Auswahllisten auch ohne neue Nachricht. Diese Revision fließt nicht in Push oder Badge-Zählung ein. Der vorhandene „Aktualisieren“-Knopf bleibt als sofortiger manueller Weg erhalten.

`report.living_file_merges` protokolliert ID, Ziel und Zuordnungsgrund. Manuelle Bestandskontrolle:

```sh
node scripts/news/consolidate-living-files.mjs          # nur anzeigen
node scripts/news/consolidate-living-files.mjs --apply  # geprüfte Migration
npm run news:test
npm run news:build
npm run news:validate
```

Die Migration ist idempotent. Vor dem Release wird sie auf dem jeweils neuesten kanonischen Stand ausgeführt, nicht durch Zurückkopieren älterer kompletter Datensätze.

## Verwandte Nachrichten

Push verwendet den Feed des erfolgreich veröffentlichten Artefakts, nicht die
Zähler des zuletzt abgeschlossenen Importlaufs: Ein späterer unveränderter Lauf
darf die Benachrichtigung einer noch wartenden Veröffentlichung nicht unterdrücken.
Oracle speichert bereits gesendete Publikationskennzeichen und Teilzustellungen.
Bild-/App-Revisionen ändern dieses Kennzeichen nicht. Ein fehlendes Nachrichtendatum
wird nicht durch die aktuelle Uhrzeit ersetzt.

Detailseiten zeigen höchstens fünf passende aktive Akten. Spezifische Gegenstandsgruppen oder mehrere seltene gemeinsame Begriffe mit Titelüberlappung sind nötig. Eine gemeinsame Oberrubrik wie Energie genügt nicht. Es gibt keine Mindestfüllung: bei fehlenden passenden Akten entfällt der Block. Historische, zurückgestellte und eigene Akten sind ausgeschlossen. Verweise werden bei jedem regulären Build neu berechnet, ohne zusätzliche KI-Kosten; der Block ist vom Suchvolltext ausgeschlossen, damit fremde Überschriften nicht die Akte in der Suche verfälschen.

## Abnahme dieses Backlogs

- Dormagen: drei ältere Dubletten zur fortgeführten Akte `wt-4fb94d2cebfca746`.
- Jänschwalde: frühere Polizei-Meldung zur jüngeren Akte `wt-f3d585eac14dec76`; abweichende Belege bleiben zur erneuten gemeinsamen Prüfung erhalten.
- Übergreifender WDR-Bericht zu mehreren Orten sowie separate Schutzentscheidungen bleiben eigenständige Akten.
- Regressionstests prüfen Reihenfolge, Orts- und Ländergrenzen, geänderte Artikel-URLs, Wiederholbarkeit, Erhalt historischer Daten, serverseitige Retry-Sperre und Versionierung.
- Browserabnahme prüft mobile/desktop Darstellung und Leseweg über Themenverweise.

Die eigenständige Akademie-Analytics-Erweiterung gehört nicht zu dieser Pages-Veröffentlichung. Das Vercel-Kostengate hat am 4. September weiterhin `NO_NEW_VERCEL_BUILD=true` gemeldet (vier Slots verbraucht, laufender Zeitraum bis 19. September). Keine Umgehung, kein Build und keine neue Datenerhebung hierfür.
