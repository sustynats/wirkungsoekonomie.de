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

Schon davor verwirft der Lauf unveränderte Wiederholungen über kanonische URL,
Artikel-ID und Inhalts-Hash. Gleichlautende Agentur- oder Medienkopien werden zu
einem Recherchecluster mit gekennzeichneter Abhängigkeit, nicht zu mehreren
KI-Aufrufen oder mehreren Belegen unabhängiger Bestätigung. Eine unveränderte
Wiederholung erzeugt keine Kandidatenakte, keine KI-Kosten, keine
Lageakten-Aktualisierung, keine neue Feedposition und keinen Push. Dieses
Verhalten ist ein automatischer Regressionstest und Release-Gate.

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

## Automatische Lageakten oberhalb einzelner Wirkungsakten

`case-files.mjs` ergänzt eine reine Darstellungsebene. Sie verändert keine Story,
keine Quelle, keinen Claim, keine Ereignis-ID und keine Version. Zunächst bleiben
zwei Meldungen getrennt im Feed. Ab drei sicher zusammenhängenden Entwicklungen
bildet der Build rückwirkend eine Lageakte und zeigt im Feed nur noch ihren
aktuellsten Stand. Die bisherigen Detail-URLs bleiben erreichbar und zeigen den
vollständigen chronologischen Verlauf mit Link zum aktuellen Stand.

Die Zuordnung arbeitet über den gesamten veröffentlichten Bestand ohne
handgeschriebene Themenausnahmen: gemeinsame Rubrik, seltene gemeinsame
Schlüsselbegriffe, Titelüberlappung, ein erkennbar fortlaufender Vorgang und ein
enges Zeitfenster sind Pflicht. Bei besonders starker Benennung darf ein Vorgang
auch nach einer ruhigeren Phase fortgesetzt werden. Breite Begriffe wie Angriff,
Energie oder Nachricht genügen nicht. Die Mindestschwelle verhindert, dass eine
einzelne ähnliche Meldung sofort eine Themenakte erzeugt.

Die Lageakte ist keine Ereignisfusion. Mehrere Anschläge oder Entscheidungen
können unter derselben Nachrichtenlage erscheinen, bleiben in der Zeitleiste
aber als eigenständige Meldungen mit eigenen Belegen und Analysen erhalten.
Eine neue materielle Entwicklung übernimmt als aktueller Stand die Karte und
deren Aktualisierungszeit; dadurch rückt genau eine Lageakte im Feed nach oben.
Wiederholungen ohne neue Information ändern weder Position noch Push-Zähler.
RSS, Atom, JSON Feed, Web-App und Push verwenden dieselbe sichtbare
Lageaktenansicht. Alte Meldungen bleiben über ihre URLs nachvollziehbar.

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
- Rückwirkende Korpusprüfung: Die zusammenhängende Stromnetz-/Umspannwerk-Lage
  wird als eine Lageakte dargestellt; allgemeine Cyberangriffe, internationale
  Angriffe und bloße Hintergrundtexte bleiben getrennt. Ein synthetischer,
  anders benannter Insolvenzfall belegt, dass die Regel nicht auf dieses Thema
  zugeschnitten ist.

Die eigenständige Akademie-Analytics-Erweiterung gehört nicht zu dieser Pages-Veröffentlichung. Das Vercel-Kostengate hat am 4. September weiterhin `NO_NEW_VERCEL_BUILD=true` gemeldet (vier Slots verbraucht, laufender Zeitraum bis 19. September). Keine Umgehung, kein Build und keine neue Datenerhebung hierfür.
