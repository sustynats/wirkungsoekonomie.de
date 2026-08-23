# Deployment

Deployment-Ziel ist das bestehende Hosting-Projekt `woek-parlament` fuer
`parlament.wirkungsoekonomie.de`, getrennt von GitHub Pages und der Akademie.
GitHub baut und prueft den Golden State aus einem exakten Commit. Vercel erhaelt
nur das deterministische minimale Parliament-Artefakt und bleibt Laufzeitziel,
nicht kanonischer Source- oder Artefaktspeicher. Der verbindliche Ablauf und die
Prebuilt-/Build-Output-Evaluation stehen in
[`RELEASE_PIPELINE.md`](./RELEASE_PIPELINE.md).

Die konfigurierte Vercel Root Directory bleibt `woek-parlament-app`.
Automatische Git- und Preview-Deployments sind deaktiviert. Production wird nur
durch Promotion eines bereits vollstaendig getesteten RC ohne Rebuild gesetzt.

Vor einer erstmaligen DNS-Umschaltung oder einer Aenderung der Laufzeitgrenzen:
TLS, Umgebungsvariablen, Healthcheck, RLS/Migration und Import-Worker pruefen.

Erforderliche Laufzeitwerte: `DIP_API_KEY`, `DIP_LOOKAHEAD_DAYS=10`, `DIP_WAHLPERIODE=21`, `DIP_IMPORT_MAX_PAGES=10`, Supabase-URL, serverseitiger Service-Role-Key sowie `IMPORT_CRON_SECRET` für den privaten Worker. Der bis Ende Mai 2027 veröffentlichte DIP-Schlüssel ist als Übergangssecret zulässig; 401-Antworten alarmieren den Betrieb. Kein Schlüssel gelangt in `NEXT_PUBLIC_*`, Git oder eine öffentliche API.

Der tägliche Vercel-Cron ruft ausschließlich den 7–14-Tage-Vorlauf ab. Der einmalige Jahres-Backfill wird bewusst manuell und mit demselben privaten Secret als `scope=BOOTSTRAP` ausgelöst. Beide Wege schreiben nur `DRAFT`, amtliche Metadaten, Hash und einen `SOURCE_REQUIRED`-Prüfauftrag. Sie können weder einen freigegebenen Workflowstatus noch eine veröffentlichte WÖk-Einordnung überschreiben.

## Reihenfolge für Historical Backfill und Review-Pipeline

Vor dem ersten echten Import müssen die Supabase-Migrationen in dieser Reihenfolge
in der Zielumgebung ausgeführt sein:

```text
202608140002_editorial_decision_backend.sql
202608140003_calculation_impact_accounting.sql
202608140004_historical_backfill_registry.sql
202608140005_historical_review_pipeline.sql
```

Danach prüfen:

1. geschütztes `/redaktion`-Login und eine aktive `editorial_members`-Rolle;
2. `/api/health` mit `dip: configured` und `supabase: configured`;
3. dass die tägliche Vercel-Cron-Authentifizierung einen gesetzten
   `CRON_SECRET` verwendet (der Route akzeptiert zusätzlich
   `IMPORT_CRON_SECRET` für manuelle, geschützte Aufrufe);
4. zuerst einen begrenzten `BOOTSTRAP`-Lauf und danach dessen Cursorfortsetzung
   bis `SUCCEEDED`;
5. eine extrahierte, maßgebliche amtliche Schlussfassung an einem Testfall.

Erst dann kann der Redaktionsbereich einen Review-Batch als ZIP exportieren.
Ein bloßes DIP-Metadatenobjekt bleibt `SOURCE_INCOMPLETE`: Das System exportiert
keine Platzhalter für fachliche historische Bewertungen. Reimportierte
`review-result.json` werden als Vorschlag validiert und erzeugen Aufgaben;
sie berechnen oder veröffentlichen nie direkt.

DNS wird erst beim gewählten Hosting-Anbieter gesetzt, weil Ziel-CNAME/ALIAS und Verifikationsrecord davon abhängen. Danach wird die Live-URL, Zertifikat, CSP/HSTS, Read-API und Navigation geprüft.
