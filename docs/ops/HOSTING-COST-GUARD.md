# Hosting Cost Guard

## Verbindliche Obergrenze

Vercel darf brutto hoechstens 25 EUR pro Monat kosten. Eine hoehere Obergrenze braucht eine ausdrueckliche Entscheidung der Projektinhaberin. Die normale Zielkonfiguration ist der Pro-Grundpreis ohne zusaetzlichen verbrauchsabhaengigen Build-Aufwand.

## Zielarchitektur

- GitHub ist die kanonische Quelle fuer Code, Historie und oeffentliche Inhalte.
- GitHub Releases speichert grosse, unveraenderliche oeffentliche Medien- und Publikationsartefakte.
- Oracle/OCI ist das Zielsystem fuer private Nutzerdaten und private Objektablagen. Bestehende Altsysteme werden erst nach Backup und Source-vs-Target-Pruefung migriert; nichts wird still geloescht.
- Vercel dient nur als schlanke Web-Laufzeit und fuer ausdruecklich freigegebene Release Candidates. Vercel ist kein kanonischer Daten- oder Artefaktspeicher.

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

## Zulässige Vercel-Laufzeit fuer natsalexandre.com

`natsalexandre.com` bleibt bewusst als kleines dynamisches Projekt auf Vercel. Zulässig und erforderlich sind:

- Hosting und CDN fuer die Next.js-Oberflaeche,
- Serverfunktionen fuer Login-/Freigabepruefung, Mitglieder- und Adminbereiche, Chat, Buchungen, Feedback, Analytics und Benachrichtigungen,
- die geschuetzte Vermittlung privater Oracle-Medien nach erfolgreicher Zugriffspruefung,
- die beiden geplanten Aufgaben fuer Verfuegbarkeit und Feedback-Bereinigung,
- verschluesselte Production-Umgebungsvariablen fuer die angebundenen Dienste.

Die Systemgrenzen bleiben dabei verbindlich: Supabase fuehrt Datenbank und Login-Identitaeten, Oracle Object Storage fuehrt Bild-, Video- und sonstige Mediendateien, GitHub fuehrt das private Repository. Vercel speichert diese Bestaende nicht kanonisch. Nach Codeaenderungen wird nur ein bewusst ausgeloestes, geprueftes Production-Deployment gebaut; automatische Git- und Pull-Request-Previews bleiben aus.

Fuer dieses Projekt werden insbesondere Function-Ausfuehrung, CDN-/Transferverbrauch, die geschuetzten Medienrouten und Cron-Ausfuehrungen beobachtet. Sie duerfen innerhalb des gemeinsamen 25-EUR-Bruttobudgets laufen.

## Release-Ablauf

1. Tests und Build laufen lokal oder in GitHub Actions.
2. Oeffentliche Grossartefakte werden einmalig in GitHub Releases publiziert und ueber stabile Release-URLs referenziert.
3. Nur ein tatsaechlicher Release Candidate wird bei Bedarf manuell zu Vercel uebergeben.
4. Vor dem Build wird `npm run reserve:vercel-build -- --project=<name> --commit=<sha> --release=<id>` ausgefuehrt und die Ledger-Aenderung versioniert.
5. Nach bestandenem Audit wird exakt dieses Artefakt nach Production promotet.
6. Nach dem Smoke-Test werden Deployment-ID und Commit dokumentiert.

## Kostenkontrolle

- Das Vercel-Dashboard erhaelt zum Beginn eines neuen Abrechnungszeitraums eine harte Ausgabenaktion fuer Zusatzverbrauch. Eine Grenze darf nie unter den bereits im laufenden Zeitraum angefallenen Betrag gesetzt werden, weil dies die laufenden Production-Projekte sofort pausieren koennte.
- Ab dem naechsten Zeitraum gilt 0 USD zusaetzlicher Verbrauch, soweit Vercel diesen Wert akzeptiert, ansonsten maximal 1 USD. Bei Erreichen greift `Pause all projects`. Damit bleibt selbst der technische Fallback innerhalb des gemeinsamen Bruttoziels.
- `npm run check:hosting-cost` ist vor jeder Aenderung der Hostingkonfiguration auszufuehren.
- `npm run check:hosting-cost:vercel` gleicht bei bestehender Vercel-Anmeldung alle tatsaechlichen Projekteinstellungen mit `ops/vercel-project-baseline.json` ab.
- `npm run check:vercel-release-budget` liest den tatsaechlichen Teamverbrauch aus Vercel. Im bereits ueberzogenen Zeitraum blockiert es weitere Builds; nach dem Periodenreset gibt es nur innerhalb der reservierten Verbrauchsgrenzen frei.
- Jede Reaktivierung automatischer Vercel-Deployments oder einer groesseren Buildmaschine ist ein Gate-FAIL.

## Verbleibende Laufzeitdienste

- `natsalexandre.com`: Next.js/CDN, die erforderlichen Serverfunktionen, die geschuetzte Oracle-Medienvermittlung und genau zwei taegliche Wartungs-Crons bleiben aktiv.
- Parlament, Akademie und Institut: Vercel dient nur der oeffentlichen Web-Laufzeit; Fachimporte, Datengenerierung, Tests und Automatisierung laufen ausserhalb von Vercel. Zwei historische Parliament-Deploy-Hooks sind durch `exit 0` und deaktivierte Git-Deployments build-inert und duerfen nicht erweitert werden; sie werden bei der naechsten authentifizierten Dashboard-Wartung widerrufen.
- Dateieingang: Der bestehende kleine Vercel-Blob-Bestand bleibt vorerst als Altsystem erhalten. Er wird weder ausgebaut noch ohne Backup und Zielpruefung geloescht. Neue private Nutzerdaten werden nach Oracle/OCI ausgerichtet.
- Web Analytics, Speed Insights, Observability Plus und kostenpflichtige Zusatzplaetze bleiben ohne ausdrueckliche Freigabe deaktiviert.

## Wiederherstellung

Die Sperren betreffen nur neue Builds. Bestehende Domains, Production-Deployments, GitHub Releases, Oracle/OCI-Daten und bestehende Datenbanken werden dadurch weder geloescht noch veraendert. Ein manuelles Deployment bleibt fuer einen geprueften Release weiterhin moeglich.
