# Parliament release pipeline

## Verbindliche Architektur

GitHub ist die kanonische Quelle fuer Commit, Historie, Golden-State-Gates und
Release-Artefakte. Vercel erhaelt nur den fuer Parliament benoetigten Build- und
Laufzeitumfang. Das Monorepo ist kein Vercel-Artefaktspeicher.

```text
exakter GitHub-Commit
  -> Golden-State- und Public-Projection-Gates
  -> deterministisches minimales Parliament-Artefakt
  -> GitHub-Actions-Artefakt mit Manifest und Pruefsummen
  -> ein ausdruecklich autorisierter Vercel-RC
  -> Smoke gegen genau diesen RC
  -> Promotion desselben Deployments ohne Rebuild
```

Automatische Git- und Preview-Deployments bleiben deaktiviert. Weder der
Artifact-Workflow noch die optionale Prebuilt-Evaluation fuehren `vercel deploy`
oder `vercel promote` aus.

## Deterministischer Eingabegraph

`ops/parliament-deployment-artifact-policy.json` erlaubt genau zwei
Top-Level-Eintraege:

- `woek-parlament-app/` als bestehende Build- und Runtime-Root;
- `datenschutz.html` als einzige nachgewiesene Abhaengigkeit ausserhalb der App.

`datenschutz.html` wird vom bestehenden Gate
`woek-parlament-app/scripts/quality/check-privacy-governance.mjs` gelesen. Eine
weitere externe Abhaengigkeit muss zuerst in der Policy mit Consumer und Rolle
dokumentiert werden. Der Artifact-Builder scheitert, wenn das Archiv andere
Top-Level-Baeume, Links oder nicht von Git gelieferte Dateien enthaelt.

Der Builder liest ausschliesslich Git-Objekte des angegebenen Commits. Dadurch
koennen unversionierte Arbeitsdateien, `.next`, `node_modules`, Hauptseiten-,
Academy-, Institute-, Source-History- oder lokale Audit-Bestaende nicht in das
Artefakt gelangen.

## Lokaler Check

```bash
python3 tools/build_parliament_deployment_artifact.py check \
  --commit HEAD \
  --require-clean
```

Ein persistentes Audit-Paket entsteht mit:

```bash
python3 tools/build_parliament_deployment_artifact.py build \
  --commit HEAD \
  --output-dir outputs/parliament-deployment \
  --require-clean \
  --verify-reproducible
```

Das Ergebnis besteht aus:

- einem deterministisch komprimierten `*.tgz` im Repository-Root-Layout;
- einem `*.manifest.json` mit Commit, Tree, Datei- und Bytezaehlern sowie
  SHA-256 fuer jede Datei und das Archiv;
- einer `*.sha256`-Datei fuer Archiv und Manifest.

Das Git-Archiv bettet die exakte Commit-ID ein. `verify` prueft diese Identitaet,
den Manifest-Hash, den Archiv-Hash, jede enthaltene Datei und die erlaubten
Top-Level-Eintraege erneut.

## GitHub Golden build

`.github/workflows/parliament-minimal-deployment-artifact.yml` baut das Archiv
zweimal und verlangt identische Bytes. Danach wird nur dieses Archiv in ein
leeres temporaeres Verzeichnis entpackt. `npm ci`, die Laender-, Same-Page- und
TypeScript-Gates sowie der vollstaendige Parliament-Build laufen aus diesem
minimalen Verzeichnis. Repository-Orchestrierungstests, die absichtlich
`.github/workflows/**` lesen, gehoeren in die normale GitHub-Checkout-Lane und
sind keine Vercel-Eingabe. Damit ist eine versehentliche, echte Build-Abhaengigkeit
ein GitHub-Gate-Fehler und kein spaeter Vercel-Fehler.

Das commitgebundene TGZ, Manifest und die Pruefsummen werden als
GitHub-Actions-Artefakt gespeichert. Fuer eine oeffentliche Release-Version
werden genau diese bereits geprueften Dateien unter einem neuen, commitgebundenen
GitHub-Release-Tag publiziert. Ein vorhandenes Asset darf nicht ueberschrieben
werden; abweichende Bytes sind ein harter Fehler.

## Prebuilt- und Build-Output-Evaluation

Der Workflow besitzt eine ausschliesslich manuell ausloesbare Option
`evaluate_prebuilt`. Sie bindet das bestehende Projekt `woek-parlament`, ruft
die Production-Build-Einstellungen ab und erzeugt mit `vercel build --prod`
lokal auf dem GitHub-Runner `.vercel/output`. Dieses Build-Output-API-Verzeichnis
wird nur als Audit-Artefakt hochgeladen. Ein zweites Manifest bindet jede
Build-Output-Datei und deren SHA-256 an das bereits gepruefte Source-Manifest
und den exakten Commit. Es wird nicht deployt.

Vor einer produktiven Prebuilt-Einfuehrung muessen fuer dasselbe Commit
mindestens folgende Nachweise vorliegen:

1. Golden State, Source-vs-View, Navigation, Suche, Sitemap, Accessibility und
   Responsive sind gruen;
2. der lokale Build Output ist an dasselbe Source-Manifest gebunden;
3. `vercel deploy --prebuilt` erzeugt unter einer neuen, ausdruecklichen
   Owner-Autorisierung genau einen RC;
4. Build CPU und Gesamtverbrauch werden vor und nach dem RC gemessen;
5. Production promotet nur dieses bereits getestete Deployment.

Bis dieser Vergleich abgeschlossen ist, bleibt das deterministische minimale
Source-TGZ der fail-closed Fallback. Der Workflow selbst autorisiert keinen
Vercel-Build und keinen Deploy.

## Release-Gates

Vor jeder externen Vercel-Aktion bleiben folgende Regeln verbindlich:

- `npm run check:vercel-release-budget` muss ohne dokumentierte
  Owner-Ausnahme PASS liefern;
- ein Build-Slot ist commit-, projekt- und releasegebunden zu reservieren;
- maximal ein RC-Build pro autorisiertem Aenderungspaket;
- kein Retry oder Rebuild ohne neue Owner-Autorisierung;
- Production nur als Promotion desselben getesteten RC;
- danach Production-Smoke, Kosten-Snapshot und
  `NO_NEW_VERCEL_BUILD=true` fuer den restlichen gesperrten Zeitraum.
