# Ticker-Datenteile in GitHub Releases

Die grossen unveraenderlichen Teile von `stories.json` und `newsroom.json`
koennen in den vorhandenen GitHub-Releases liegen. Ihre kleinen Manifeste,
Pruefsummen und die Zuordnung zum Datenstand bleiben in Git. Dies verhindert
neue grosse Git-Blobs; bereits vorhandene Git-Historie wird dadurch nicht
entfernt. Die Umstellung ist standardmaessig nicht aktiviert.

## Datenvertrag

Das bestehende Format `woek-newsroom-parts-1` beziehungsweise `-2` bleibt erhalten.
Jeder physische Teil behaelt seinen SHA-256 und seine unkomprimierte Bytezahl.
Eine optionale `release`-Referenz nennt zusaetzlich den unveraenderlichen
Gzip-Assetnamen, dessen SHA-256 und dessen Bytezahl. Erlaubt ist ausschliesslich
das vorhandene Repository `sustynats/wirkungsoekonomie.de` und ein Release
`wirkungsticker-data-JJJJ-MM`, gegebenenfalls mit `-part-N`.

Leser verwenden zuerst vorhandene lokale Teile. Nur ein fehlender Teil mit
vollstaendig gepinnter Release-Referenz wird ohne Zugangsdaten heruntergeladen,
vor und nach der Dekompression geprueft und lokal materialisiert. Ein
beschaedigter lokaler Teil bleibt ein Fehler. Ein fehlender alter Git-Teil ohne
Release-Referenz bleibt ebenfalls ein Fehler. Es gibt keinen leeren Ersatz und
keine neue Modellanfrage.

Der Worker und der Monitor laden fehlende Teile vorab mit hoechstens vier
gleichzeitigen oeffentlichen Downloads. `npm run news:build` verwendet denselben
Vorabruf. Verifizierte lokale Teile werden wiederverwendet. Bei direkten
Skriptaufrufen kann `node scripts/news/release-hydrate.mjs` vorgeschaltet werden.

Texte, Quellen, bezahlte Journale, Reihenfolge, Versionen und Freigabebindungen
werden nicht neu serialisiert oder fachlich veraendert. Private
Redaktionsentwuerfe, private Manuskripte und rohe Providerantworten sind von
diesem oeffentlichen Transport ausgeschlossen. Die bestehende Oracle-Ablage
und deren Schluessel bleiben unveraendert.

## Vorbereitung und Wiederherstellung

Die Vorbereitung liest die beiden vollstaendigen aktuellen Datenbestaende und
prueft ihre bestehenden Manifeste. Sie erzeugt nur ein lokales Paket:

```
node scripts/news/release-data.mjs prepare --out=outputs/ticker-release-data
node scripts/news/release-data.mjs restore --out=outputs/ticker-release-data --destination=outputs/ticker-restore-test
```

Das Ziel fuer die Wiederherstellung muss neu sein. Pruefung von Manifesten,
komprimierten und rohen Teilen erfolgt vor dem Schreiben. Dieses Paket ist
eine Sicherung dieser beiden aktuellen Stores, keine vollstaendige
Git-Historiensicherung. Fuer die Betriebswiederherstellung werden zusaetzlich
`state.json`, `usage.json`, die anderen kanonischen Ticker-Dateien und die
getrennten privaten Sicherungen benoetigt.

Vor einer Umstellung den genauen Ausgangscommit sowie alle kanonischen Dateien
mit Git-Blob, Bytezahl und SHA-256 sichern. Das aktuelle komplette
`data/news`-Archiv samt Wiederherstellungsanleitung gehoert nach geprueftem
Upload und serverseitiger Pruefsummenpruefung in das vereinbarte Dropbox-Archiv.
Vor einer spaeteren Historienbereinigung ist eine zusaetzliche vollstaendige
Git-Sicherung erforderlich. Ein flacher oder partieller Klon reicht nicht.

## Veroeffentlichung und Aktivierung

Erst nach den bestehenden Quellen-, Inhalts-, Privacy- und Budgetpruefungen
die vorbereiteten, oeffentlich zulaessigen Teile veroeffentlichen. Ziel ist
der exakte bereits vorhandene Ausgangscommit, keine bewegliche Branchangabe:

```
node scripts/news/release-data.mjs publish --out=outputs/ticker-release-data --tag=wirkungsticker-data-JJJJ-MM --commit=EXAKTER_40STELLIGER_COMMIT
```

Bereits gespeicherte unveraenderte Referenzen werden ohne erneuten Upload
behalten. Vorhandene Assetnamen werden nie ueberschrieben. Neue Uploads werden
anschliessend unabhaengig heruntergeladen und an beiden Pruefsummen geprueft.
Ein unklarer Schreibausgang stoppt sofort. Es gibt keine automatische
Schreibwiederholung, keine Loeschung und kein `--clobber`. Ein spaeterer Lauf
liest zuerst den vorhandenen Namen und prueft ihn, bevor etwas neu hochgeladen
wird. Die 1000-Asset-Grenze bleibt bestehen; neue Teile gehen in begrenzte
Fortsetzungsreleases desselben Monats. Nicht mehr benoetigte alte Assets
werden nicht automatisch geloescht.

Der Befehl ersetzt die kleinen lokalen Manifeste erst nach vollstaendig
verifizierten Uploads. Fuer den eigentlichen Wechsel sind diese Manifeste,
die Entfernung der verifizierten physischen Teile aus dem Git-Index und die
passenden `.gitignore`-Eintraege gemeinsam in einem geprueften PR erforderlich.
Die lokalen Originalteile bleiben bis zur bestaetigten Wiederherstellung
erhalten. Ohne diesen separaten Wechsel wird keine Speicherersparnis behauptet.
Keine Historienumschreibung oder Force-Push als Nebenwirkung.

Der normale serielle Worker ruft `persist` nach seinen bestehenden Pruefungen
und vor dem atomaren Commit auf. Solange `parts_storage` nicht explizit auf
`github-release-parts-1` steht, ist dieser Schritt ohne Netzwerk- oder
Schreibwirkung. Bei einer geprueften Zusammenfuehrung disjunkter Geschichten
werden Release-Bindungen aus den exakten Git-Fassungen gelesen und neu
entstandene Teile vor dem Commit gesichert. Ueberlappende Aenderungen bleiben
blockiert. Locks, Quoten, Einmalversuche und Freigaberegeln gelten unveraendert.

Nach Merge nur den normalen Release und Worker verwenden und die wirkliche
Live-Auslieferung sowie die nachgelagerte Quittierung pruefen. Eine bestehende
GitHub-Groessensperre kann die Code- und Pointer-PRs weiterhin verhindern;
ein erfolgreicher Asset-Upload hebt diese Sperre nicht auf.
