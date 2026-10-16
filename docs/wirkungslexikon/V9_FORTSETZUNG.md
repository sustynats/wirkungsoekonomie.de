# V9-Fortsetzung vom 16.10.2026

Weiterführung des bestehenden Claude-Layouts und des statischen Content-Systems. Keine neue Hosting-Plattform, kein Production-Deployment. Die frühere allgemeine Zustimmung ersetzt laut neuer Übergabe keine individuelle, fassungsgebundene Freigabe.

## Daten und Redaktion

- `v9-fortsetzung-import.mjs <entpacktes-paket>` importiert neun Prüftabellen, 180 journalistische Arbeitsvorschläge, 137 separate Änderungsvorschläge und einen Entscheidungsentwurf. Vorhandene Kartenrevisionen bleiben erhalten. Wiederholter Import desselben Verzeichnisses überschreibt keine Redaktionsarbeit.
- `review/index.json`, lokale Schemata und Inhalts-Snapshots liegen ausschließlich im privaten, ignorierten Arbeitsverzeichnis. Der V3-Master bleibt bytegleich. 180 Karten, 20 Familien und 21 Dossiers sind weiterhin 221 Bestandsobjekte. Zusatzobjekte werden separat gezählt.
- Quellenregister, historische 48 Sperren, 63 V8-Fälle und 137 Vorschläge sind unterschiedliche Statusachsen. Kein automatisches Zusammenzählen oder Aufheben.
- `/wirkungslexikon/redaktion/pruefungen/` bietet Vergleich, Suche und Entwurfsbearbeitung. `/api/wirkungslexikon/review` verlangt dieselbe Anmeldung wie sämtliche Staging-Seiten. Änderungen verwenden Inhalts-Hashes und Audit-Ereignisse; eine veraltete Revision ergibt 409.
- Normalisierungsregister: 0 reale Ereignisse. Eine chronologische Rubrik benötigt an den Inhalt gebundene Quellen- und Fachreviewmarker. Sie ist keine kausale Pfeilkette. Ohne tatsächliche Prüfungen bleibt sie leer und unsichtbar.
- Remigration-Zusatz: optionaler, privater Prüfentwurf bei der vorhandenen Karte. Akteursziele, Funktionsinterpretation, Potenzial, betroffene Gruppen, Maßnahmenstatus und Attribution werden getrennt angezeigt. Keine neue Karte, keine automatische Absichts- oder Wirkungsbehauptung.

## Prüfungen

`node scripts/wirkungslexikon/v9-build.mjs` und `--public` bauen geschütztes Staging beziehungsweise ein lokales Negativartefakt mit null veröffentlichten Datensätzen. `v9-test.mjs`, `v9-golden-test.mjs`, `v9-fortsetzung-test.mjs`, `v9-browser-test.mjs`, `v9-fortsetzung-browser-test.mjs` und `v9-fortsetzung-http-test.mjs` prüfen Regressionen und die neuen Funktionen. Der HTTP-Test verwendet eine eigene, anschließend entfernte Datenkopie unter `outputs/wirkungslexikon/`.

Quellen-Zugriff und Originalfragmente werden mit `v9-fortsetzung-sources.py` und dem gebündelten Python samt `pypdf` für `v9-fortsetzung-fragments.py` dokumentiert. Netzwerkzugriff oder Texttreffer sind keine menschlichen Reviews.

Die gelieferten Schemata verwenden eine begrenzte, lokal validierte Menge von JSON-Schema-Schlüsselwörtern. Nicht unterstützte Validierungsschlüssel werden abgewiesen. Dies ist kein universeller JSON-Schema-Validator und lädt keine Remote-Schemata.

Vorschauaufbau und Social-Rendering seriell ausführen. `.rendering.lock` verhindert einen gleichzeitigen Neuaufbau. Zugangsdaten und Identitätsschlüssel niemals in Git, Dropbox-Pakete oder öffentliche Releases übernehmen.

## Weiter offen

Das bestehende offizielle Redaktionskonto ist weiterhin nicht zugeordnet. Signierte echte Quellen-/Fachreviews, Natalies konkrete Releasefreigabe und ein daran gebundener Produktionsadapter fehlen. Die neuen Zusatzobjekte sind bewusst nicht öffentlich ausleitbar. Das aktuelle technische Staging ist keine Live-Website. Journal- und LinkedIn-Artikel bleiben gesondert gesperrt.
