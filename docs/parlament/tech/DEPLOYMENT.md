# Deployment

Das oeffentliche Deployment-Ziel ist das bestehende Hosting-Projekt
`woek-parlament` fuer `parlament.wirkungsoekonomie.de`, sofern der kostenlose
Vercel-Tarif fuer den tatsaechlichen Nutzungszweck zulaessig ist. Vercel dient
dort ausschliesslich als statisches CDN. Oeffentliche Seiten, Quellenakten,
Regierungsakten, Fachakten, Suchindizes und Read-APIs werden beim Release
vorgerendert; normale Seitenaufrufe duerfen keine Function ausloesen.

GitHub baut und prueft den Golden State aus einem exakten Commit. Hintergrund-
und Cron-Arbeit laeuft direkt in GitHub Actions oder auf Oracle/OCI und ruft
keine Vercel-Cron-Route auf. Vercel ist weder kanonischer Source-, Daten- noch
Artefaktspeicher. Der verbindliche Ablauf und die Prebuilt-/Build-Output-
Evaluation stehen in
[`RELEASE_PIPELINE.md`](./RELEASE_PIPELINE.md).

Die konfigurierte Vercel Root Directory bleibt `woek-parlament-app`.
Automatische Git- und Preview-Deployments sind deaktiviert. Production wird nur
durch Promotion eines bereits vollstaendig getesteten RC ohne Rebuild gesetzt.
Ein Team-Softblock, ein rotes Verbrauchsgate oder eine nicht geklaerte
Tarifeignung sperrt jeden Vercel-Build und jede Promotion.

## Laufzeitgrenze

- `app/layout.tsx` und alle oeffentlichen Seiten bleiben statisch. Ein globales
  `force-dynamic`, `connection()` oder `no-store` ist verboten.
- Der Request-Proxy ist ausschliesslich fuer die internen Pfade
  `/autopilot/status/:path*` und
  `/pruefstandard/transparenz/datenbetrieb/:path*` zulaessig; er darf keine
  oeffentliche Route matchen.
- Die oeffentliche Suche filtert vorab erzeugte JSON-Indizes im Browser.
- Dynamische Endpunkte sind auf ausdrueckliche Schreib-/Bestaetigungs- und
  Redaktionsfaelle begrenzt. Sie sind kein Hintergrund-Worker.
- `.github/workflows/political-autopilot.yml` und
  `.github/workflows/political-daily-digest.yml` starten die Runner direkt.
  `WOEK_AUTOPILOT_RUNTIME_MODE=INITIAL_BOOTSTRAP_2_3` haelt alle wiederkehrenden
  Writer bis zur vollstaendigen Secret-Migration fail-closed.

Vor einer erstmaligen DNS-Umschaltung oder einer Aenderung der Laufzeitgrenzen:
TLS, Umgebungsvariablen, Healthcheck, RLS/Migration und Import-Worker pruefen.

Erforderliche Worker-Werte: `DIP_API_KEY`, `DIP_LOOKAHEAD_DAYS=10`,
`DIP_WAHLPERIODE=21`, Supabase-URL, serverseitiger Service-Role-Key sowie die
Dropbox-OAuth-Werte. Sie liegen in der Worker-Umgebung, nicht im statischen
Vercel-Frontend. Der bis Ende Mai 2027 veroeffentlichte DIP-Schluessel ist als
Uebergangssecret zulaessig; 401-Antworten alarmieren den Betrieb. Kein
Schluessel gelangt in `NEXT_PUBLIC_*`, Git oder eine oeffentliche API.

Der taegliche Worker ruft ausschliesslich den 7-14-Tage-Vorlauf ab. Der
einmalige Jahres-Backfill wird bewusst manuell als `scope=BOOTSTRAP` ausgeloest.
Beide Wege schreiben nur `DRAFT`, amtliche Metadaten, Hash und einen
`SOURCE_REQUIRED`-Pruefauftrag. Sie koennen weder einen freigegebenen
Workflowstatus noch eine veroeffentlichte WÖk-Einordnung ueberschreiben.

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
2. die statische `/api/health`-Antwort mit `delivery: static-cdn` und den
   erwarteten Publikationsstaenden;
3. dass die GitHub-/Oracle-Worker-Umgebung die erforderlichen Secrets besitzt,
   ohne einen Vercel-Deploy-Hook zu konfigurieren;
4. zuerst einen begrenzten `BOOTSTRAP`-Lauf und danach dessen Cursorfortsetzung
   bis `SUCCEEDED`;
5. eine extrahierte, maßgebliche amtliche Schlussfassung an einem Testfall.

Erst dann kann der Redaktionsbereich einen Review-Batch als ZIP exportieren.
Ein bloßes DIP-Metadatenobjekt bleibt `SOURCE_INCOMPLETE`: Das System exportiert
keine Platzhalter für fachliche historische Bewertungen. Reimportierte
`review-result.json` werden als Vorschlag validiert und erzeugen Aufgaben;
sie berechnen oder veröffentlichen nie direkt.

DNS wird erst beim gewählten Hosting-Anbieter gesetzt, weil Ziel-CNAME/ALIAS und Verifikationsrecord davon abhängen. Danach wird die Live-URL, Zertifikat, CSP/HSTS, Read-API und Navigation geprüft.
