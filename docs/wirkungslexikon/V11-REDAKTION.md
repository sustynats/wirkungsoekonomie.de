# V11: versionierte private Leserfassungen

Die 94 ausgearbeiteten Ziele werden als `redaktionelle_ergaenzung_v11` an vorhandene Kandidatensnapshots angefügt. Die 95 Herkunfts-IDs bleiben erhalten; eine zusätzliche Aliasreferenz führt auf ein gemeinsames Ziel. Es entstehen 74 Wortkarten und 20 eigenständige Analysen. Der V3-Master und die 180 veröffentlichten Karten werden nicht neu importiert oder verändert.

Die vorhandenen Register `research_candidates` und `editorial_narrative_candidates` bleiben maßgeblich. Neue Quellen werden als Quellenobjekte im vorhandenen Forschungsregister geführt; historische Inlinequellen des älteren Nachtrags bleiben erhalten. CSV, Leserfassungen und Quellenregister der Übergabe sind datierte Exporte, keine weitere Masterdatenbank.

## Import und Revisionen

```sh
node scripts/wirkungslexikon/v11-intake.mjs --source <privates-paketverzeichnis> --audit <privater-audit-patch.json> --archive <unveraendertes-paket.zip>
```

Der Standardlauf schreibt nichts. Er prüft die neun Manifestdateien, Paket- und Auditbezug, alle erwarteten Snapshot-Revisionen, die zusätzliche Aliasrevision, Quellenbindungen, IDs, Slugs und Darstellungsformen. `--apply` führt denselben geprüften Plan in temporären Kopien der vorhandenen Register aus. Erst nach einer erneuten Versionsprüfung werden die Register installiert. Historische Snapshots und Ereignisse bleiben erhalten. Währenddessen verweigert der geschützte Server Zugriffe mit 503. Bei einem Fehler werden die vorherigen Register wiederhergestellt.

Ein unveränderter Import kann wiederholt werden. Spätere redaktionelle Änderungen führen dagegen zu einem Versionskonflikt. Nicht zurücksetzen: Lieferrevision, aktuelle Revision und eingehende Ergänzung müssen dann im Dreiwegevergleich geprüft werden. Beim vorliegenden Eingang stimmten alle 94 Entwurfsrevisionen und die Aliasrevision überein.

Die Lieferung ergänzt unter anderem konkrete Betroffene, individuelle Gedankenbeispiele und bedingte Wirkpfade erster bis dritter Ordnung. Originalverwendung, kritische Wiedergabe, institutionelle Antwort und eigene Analyse bleiben getrennt. Ein HTTP-200-Abruf gilt nicht automatisch als gelesener Originalbeleg. Zugriffsprüfungen mit KI-Unterstützung sind keine behaupteten menschlichen Prüfhandlungen.

## Geschützte Vorschau

```sh
node scripts/wirkungslexikon/v9-build.mjs
WL_VERSION=9 WL_PORT=8806 node scripts/wirkungslexikon/serve.mjs
```

Die Vorschau liegt unter `/wirkungslexikon/redaktion/v11/`. Sie nutzt das bestehende Design, Seitentemplate, Redaktions-API und Versionsarchiv. Suche, Darstellungsform-, Themen- und Quellenstandsfilter arbeiten über alle 94 Fassungen. Ohne JavaScript bleiben die vollständige Liste und alle Erklärungen lesbar. Alte Herkunftsseiten verweisen auf die aktuelle Fassung.

Der bestehende lokale Zugang schützt HTML, Daten, Assets und API. `noindex`, `noarchive`, `no-store`, Herkunftsprüfung und Rollentrennung bleiben aktiv. Zugangsdaten stehen ausschließlich in der bestehenden privaten `access.json`; sie gehören nicht in Exporte, Git oder Dropbox-Übergaben. Die lokale Vorschau ist nur auf dem jeweiligen Mac erreichbar und kein Internet-Staging.

## Sieben getrennte Prüfstände

Jede konkrete Fassung zeigt: ausgearbeiteten Inhalt, Originalverwendung, Quellen-/Kontextprüfung, offene Einzelbehauptungen, technische Integration, aktuelle Revision für Natalie Weber und eine gesonderte Veröffentlichungsentscheidung. Historische SOURCE_NEEDED-Flags werden nicht als heutiger Quellenbericht ausgegeben oder nachträglich als menschliche Prüfung umgeschrieben.

Die grundsätzliche Aufnahmeentscheidung wird nicht erneut verlangt. Eine Entscheidung über neue Aussagen und ihre konkrete Revision steht davon getrennt. `v11-release-plan.mjs --prepare` erzeugt einen privaten Release-Plan mit Inhalts- und Quellenrevisionen und einer leeren Entscheidungsvorlage. `--validate-decisions <datei>` prüft dokumentierte Entscheidungen, Versionsgleichheit und gegebenenfalls ausdrücklich akzeptierte Beleggrenzen. Es schreibt weder Freigaben noch Publikationszustände. Das Modul hat keinen Publish-Befehl. Merge, öffentlicher Release-Build und Deployment bleiben separate nachfolgende Schritte.

## Prüfungen

```sh
node --test scripts/wirkungslexikon/v11-test.mjs
node --test scripts/wirkungslexikon/private-addenda-test.mjs scripts/wirkungslexikon/inventory-test.mjs scripts/wirkungslexikon/examples-test.mjs scripts/wirkungslexikon/intake-test.mjs scripts/wirkungslexikon/deployment-test.mjs
npm run build:wirkungslexikon
npm run check:wirkungslexikon
WL_V11_BASELINE=<private-sicherung-vor-import> node scripts/wirkungslexikon/v11-private-test.mjs
WL_PLAYWRIGHT=<installiertes-playwright> node scripts/wirkungslexikon/v11-browser-test.mjs
```

Die generischen Importtests erzeugen ausschließlich synthetische temporäre Daten. Browseränderungen finden in einer isolierten Kopie statt. Der private Bestandstest vergleicht sämtliche bisherigen Bestands- und Freigabedateien mit der Sicherung und prüft den Ausschluss der neuen Revisionen aus öffentlicher Suche und Ausgaben. Bestandszahlen werden aus den vorhandenen Registern abgeleitet: 274 insgesamt, 180 veröffentlicht, 94 zusätzliche Ziele; 23 Suchansätze, 20 Familien und 21 Dossiers bleiben ausgenommen.

Historische V9-Fortsetzungstests benötigen ihre damaligen privaten Eingangs- und Negativartefakte. Der alte V9-Abschlusstest erwartet außerdem Freigaberevisionen vor der bereits freigegebenen V10-Ergänzung. Solche Voraussetzungen nicht durch eine Rücknahme aktueller Freigaben erfüllen. Der aktuelle Bytevergleich und die V10-Regression prüfen den tatsächlich weiterbetriebenen Stand.

Alle neuen Daten, Prüflisten, Quellenabrufe und Einzelberichte bleiben privat. Der Review-PR enthält Implementierung, generische Tests, diese Betriebsbeschreibung und die aktualisierte undurchsichtige Bestandsprüfsumme. Es wurde kein Hosting ergänzt; lokale Prüfungen verursachen keine Vercel-Builds oder kostenpflichtigen Dienste.
