# Hosting Cost Guard

## Ziel und verbindliche Obergrenze

Stand 9. September 2026: Ziel sind **0 EUR Vercel-Kosten**, nicht der Pro-Grundpreis. Die fruehere Zielkonfiguration ist damit abgeloest. Vercel ist ausschliesslich die letzte technisch zwingende Ausnahme. Bestehende Nutzung, Komfort oder ein bereits bezahlter Tarif belegen keine technische Notwendigkeit. GitHub und Oracle/OCI sind vorher auf Funktionsumfang, Kapazitaet und Kosten zu pruefen.

Die bisherige absolute Obergrenze von brutto 25 EUR pro Monat ueber alle Projekte bleibt ein zusaetzlicher Schutz, keine Ausgabenerlaubnis. Neue kostenpflichtige Ausnahmen und eine hoehere Obergrenze brauchen eine ausdrueckliche Entscheidung der Projektinhaberin. Der kostenlose Tarif hat nur dann Vorrang, wenn die Nutzung seine Bedingungen und Limits tatsaechlich erfuellt. Kein automatisches Upgrade oder Downgrade, keine Tarifumgehung.

Die Umstellung erfolgt **backup-first und ohne ungepruefte Abschaltung**. Ein Kostengate verhindert neue kostenverursachende Aktionen; es darf nicht selbst laufende Seiten, Nachrichten, Logins oder Datenbestaende abschalten. Vollstaendige Sicherung, gepruefter Restore, Funktions- und Berechtigungsvergleich, ausreichende Betriebsreserve und Rueckfallweg gehen einer Umschaltung voraus.

## Zielarchitektur

- GitHub ist die kanonische Quelle fuer Code, Historie und oeffentliche Inhalte.
- GitHub Releases speichert grosse, unveraenderliche oeffentliche Medien- und Publikationsartefakte.
- Oracle/OCI ist das Zielsystem fuer private Nutzerdaten und private Objektablagen. Bestehende Altsysteme werden erst nach Backup und Source-vs-Target-Pruefung migriert; nichts wird still geloescht.
- Vercel ist ein abzulösender Bestandsbetrieb oder eine einzeln nachgewiesene technische Ausnahme. Die Zielarchitektur begruendet keine dauerhafte Bindung an Vercel. Vercel ist kein kanonischer Daten- oder Artefaktspeicher.

## Harte Vercel-Regeln

1. Git- und Pull-Request-Deployments sind in allen Projekten deaktiviert.
2. `vercel.json` setzt zusaetzlich `git.deploymentEnabled=false`.
3. Die Buildmaschine bleibt `standard`, die Auswahl `fixed`, elastische Parallelitaet bleibt aus und die Queue seriell.
4. Normale Fach-, Daten-, Bot-, RSS- und Dokumenten-Commits erzeugen keine Vercel-Preview.
5. Production wird nur aus einem geprueften exakten Commit manuell deployt oder ein bereits geprueftes Artefakt wird commitgebunden promotet.
6. Deploy Hooks duerfen nur nach ausdruecklicher Release-Autorisierung aufgerufen werden.
7. Vor jeder Production-Aktion werden Kostenstatus, Buildumfang, Commit, Gates und Smoke-Test dokumentiert.
8. Vor jedem Vercel-Build muss `npm run check:vercel-release-budget` PASS liefern. Direkte `vercel`, `vercel deploy`, Redeploy- oder Deploy-Hook-Aufrufe ohne dieses Gate sind untersagt.
9. Ueber alle fuenf Projekte zusammen sind hoechstens vier Vercel-Builds pro Abrechnungszeitraum zulaessig. Ein Aenderungspaket erzeugt hoechstens einen Release-Candidate-Build; Production wird durch Promotion desselben Artefakts ohne zweiten Build aktualisiert.
10. Der Live-Kostengate blockiert einen weiteren Build spaetestens bei 15 USD effektivem Messverbrauch, 10 USD effektivem Build-CPU-Verbrauch oder 0,50 USD bereits berechnetem Zusatzverbrauch im laufenden Zeitraum.
11. Jeder zulaessige Build reserviert vorher commit- und projektgebunden einen Slot in `ops/vercel-build-ledger.jsonl`. Wiederverwendung einer Release-ID fuer einen anderen Commit ist ein hartes FAIL.

## Abhaengigkeiten des Bestandsbetriebs natsalexandre.com

Die folgenden bestehenden Funktionen muessen beim Umzug erhalten bleiben. Ihre Existenz ist kein Nachweis, dass sie Vercel benoetigen:

- Hosting und CDN fuer die Next.js-Oberflaeche,
- Serverfunktionen fuer Login-/Freigabepruefung, Mitglieder- und Adminbereiche, Chat, Buchungen, Feedback, Analytics und Benachrichtigungen,
- die geschuetzte Vermittlung privater Oracle-Medien nach erfolgreicher Zugriffspruefung,
- die beiden geplanten Aufgaben fuer Verfuegbarkeit und Feedback-Bereinigung,
- verschluesselte Production-Umgebungsvariablen fuer die angebundenen Dienste.

Die Systemgrenzen bleiben dabei verbindlich: Supabase fuehrt Datenbank und Login-Identitaeten, Oracle Object Storage fuehrt Bild-, Video- und sonstige Mediendateien, GitHub fuehrt das private Repository. Vercel speichert diese Bestaende nicht kanonisch. Nach Codeaenderungen wird nur ein bewusst ausgeloestes, geprueftes Production-Deployment gebaut; automatische Git- und Pull-Request-Previews bleiben aus.

Function-Ausfuehrung, CDN-/Transferverbrauch, geschuetzte Medienrouten und Cron-Ausfuehrungen sind in die Bestandsaufnahme einzubeziehen. Ein reiner statischer Export ersetzt diese Funktionen nicht. Nutzungsbedingungen des Hobby-Tarifs sind fuer dieses Projekt eigenstaendig zu pruefen; die Nichtkommerzialitaet der WÖk gilt nicht automatisch fuer jedes andere Projekt desselben Kontos.

## Release-Ablauf

1. Tests und Build laufen lokal oder in GitHub Actions.
2. Fuer Parliament erzeugt `tools/build_parliament_deployment_artifact.py` aus
   dem exakten Git-Commit ein reproduzierbares Minimal-TGZ samt Manifest und
   Pruefsummen. Der GitHub-Workflow baut und prueft aus dem entpackten Artefakt,
   nicht aus dem vollen Monorepo-Checkout.
3. Oeffentliche Grossartefakte werden einmalig in GitHub Releases publiziert und ueber stabile Release-URLs referenziert.
4. Nur ein tatsaechlicher Release Candidate wird bei Bedarf manuell zu Vercel uebergeben.
5. Vor dem Build wird `npm run reserve:vercel-build -- --project=<name> --commit=<sha> --release=<id>` ausgefuehrt und die Ledger-Aenderung versioniert.
6. Nach bestandenem Audit wird exakt dieses Artefakt nach Production promotet.
7. Nach dem Smoke-Test werden Deployment-ID und Commit dokumentiert.

Der manuelle Prebuilt-Versuch im Parliament-Artifact-Workflow erzeugt nur
`.vercel/output` auf dem GitHub-Runner und darf keinen Deploy ausloesen. Eine
spaetere `vercel deploy --prebuilt`-Verwendung braucht dieselbe ausdrueckliche
Release-Autorisierung und Kostenpruefung wie jeder andere RC.

## Kostenkontrolle

- Das Vercel-Dashboard erhaelt zum Beginn eines neuen Abrechnungszeitraums eine harte Ausgabenaktion fuer Zusatzverbrauch. Eine Grenze darf nie unter den bereits im laufenden Zeitraum angefallenen Betrag gesetzt werden, weil dies die laufenden Production-Projekte sofort pausieren koennte.
- Ab dem naechsten Zeitraum gilt 0 USD zusaetzlicher Verbrauch, soweit Vercel diesen Wert akzeptiert, ansonsten maximal 1 USD. Bei Erreichen greift `Pause all projects`. Damit bleibt selbst der technische Fallback innerhalb des gemeinsamen Bruttoziels.
- `npm run check:hosting-cost` ist vor jeder Aenderung der Hostingkonfiguration auszufuehren.
- `npm run check:hosting-cost:vercel` gleicht bei bestehender Vercel-Anmeldung alle tatsaechlichen Projekteinstellungen mit `ops/vercel-project-baseline.json` ab.
- Das Live-Gate prueft ausserdem, ob der aktuelle Tarif das 0-EUR-Ziel erreicht. Ein noch laufender Pro-Bestand bleibt bis zum gesicherten Umzug aktiv, wird aber nicht mehr als erfuelltes Kostenziel ausgegeben. Aktuelle Observability-Entitlements und `observabilityBase` zaehlen ebenfalls; das Fehlen des historischen Felds `observabilityPlus` beweist keine Deaktivierung.
- Die Team-/Projekt-API dieser Pruefung belegt keinen vollstaendigen anbieterseitigen Spend-Management-Schutz. Dieser Umfang wird ausdruecklich als nicht verifiziert ausgewiesen. Rechnungsbetrag, gemessener Verbrauch und Spend-Management-Anzeige nicht ungeprueft gleichsetzen. Private Rechnungshistorie und Kontoauszuege gehoeren nicht in das oeffentliche Repository.
- `npm run check:vercel-release-budget` prueft zuerst Tarif und Richtlinie und danach den tatsaechlichen Teamverbrauch. Ein Periodenreset hebt die 0-EUR-Zielpruefung nicht auf. Erst bei erfuellter Tarif-/Richtlinienpruefung koennen die reservierten Verbrauchsgrenzen einen Build zulassen.
- Jede Reaktivierung automatischer Vercel-Deployments oder einer groesseren Buildmaschine ist ein Gate-FAIL.

## Verbleibende Laufzeitdienste

- `natsalexandre.com`: Next.js/CDN, Serverfunktionen, geschuetzte Oracle-Medienvermittlung und Wartungs-Crons bleiben bis zum geprueften Ersatz aktiv.
- Parlament, Akademie und Institut: Vercel dient nur der oeffentlichen Web-Laufzeit; Fachimporte, Datengenerierung, Tests und Automatisierung laufen ausserhalb von Vercel. Zwei historische Parliament-Deploy-Hooks sind durch `exit 0` und deaktivierte Git-Deployments build-inert und duerfen nicht erweitert werden; sie werden bei der naechsten authentifizierten Dashboard-Wartung widerrufen.
- Dateieingang: Der bestehende kleine Vercel-Blob-Bestand bleibt vorerst als Altsystem erhalten. Er wird weder ausgebaut noch ohne Backup und Zielpruefung geloescht. Neue private Nutzerdaten werden nach Oracle/OCI ausgerichtet.
- Web Analytics, Speed Insights, Observability Plus und kostenpflichtige Zusatzplaetze bleiben ohne ausdrueckliche Freigabe deaktiviert.

## Migrationsabnahme

1. Produktionsrelease und alle aktiven Funktionen statt nur den neuesten Git-Stand inventarisieren.
2. Daten, Uploads, Domains, Konfiguration und benoetigte Zugangswerte im privaten Betriebsbestand sichern. Nicht exportierbare sensible Werte sind offene Abhaengigkeiten, keine leeren Ersatzwerte.
3. Neue Laufzeit mit unveraenderter Datenbank zu testen ist ein moeglicher Zwischenschritt. Eine gleichzeitig geplante Datenbankmigration braucht eine eigene Restore- und Konsistenzabnahme.
4. Bestehende kostenlose Oracle-Ressourcen zuerst pruefen. Ein Always-Free-Label ersetzt weder Kapazitaetsmessung noch Kontingent- und Nebenkostenpruefung. Kein neuer kostenpflichtiger Dienst als Ausweichweg.
5. Login, Rollen, Schreibvorgaenge, Upload/Download, Hintergrundauftraege, Zertifikate, Domain/TLS und Rueckleitungen gegen den Ersatz pruefen. Vorherige Releases und DNS-Werte fuer den Rueckfall erhalten.
6. Erst nach bestandener Abnahme umschalten. Bei weiterlaufenden Schreibvorgaengen nie eine veraltete Datenkopie zurueckspielen.
7. Vor Hobby-Downgrade alle Projekte, Stores, Domains, Teamrechte, Nutzungsbedingungen und kostenlosen Limits pruefen. Keine aktive App loeschen, um einen Tarifdialog zu umgehen.

Konkrete Konto-, Rechnungs-, Backup- und Migrationsnachweise bleiben privat und werden nicht in Institutsdiskurs, Suchindex oder oeffentliche Seiten uebernommen.

Ein Export kann statt Zugangswerten lediglich Platzhalter enthalten. Der lokale Vorabtest
`node scripts/ops/check-hosting-env-parity.mjs <privates-key-manifest.json> <private-env-datei>`
prueft die im Manifest unter `requiredKeys` erfassten Namen. Er gibt weder Werte noch
Wert-Hashes aus. Leere Werte und bekannte Redaktions-/Verschluesselungsplatzhalter
blockieren die Migration. `PRESENT_NOT_YET_VALIDATED` bestaetigt nur Vorhandensein,
niemals Gueltigkeit, vollstaendige Funktionsparitaet oder eine Umschaltfreigabe.

## Wiederherstellung

Die Sperren betreffen nur neue Builds. Bestehende Domains, Production-Deployments, GitHub Releases, Oracle/OCI-Daten und bestehende Datenbanken werden dadurch weder geloescht noch veraendert. Ein manuelles Deployment bleibt fuer einen geprueften Release weiterhin moeglich.
