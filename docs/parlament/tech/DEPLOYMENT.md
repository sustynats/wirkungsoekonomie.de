# Deployment

Deployment-Ziel ist ein eigenes Hosting-Projekt für `parlament.wirkungsoekonomie.de`, getrennt von GitHub Pages und der Akademie. Vor DNS-Umschaltung: Preview, TLS, Umgebungsvariablen, Healthcheck, RLS/Migration und Import-Worker prüfen.

Erforderliche Laufzeitwerte: `DIP_API_KEY`, `DIP_LOOKAHEAD_DAYS=10`, `DIP_WAHLPERIODE=21`, `DIP_IMPORT_MAX_PAGES=10`, Supabase-URL, serverseitiger Service-Role-Key sowie `IMPORT_CRON_SECRET` für den privaten Worker. Der bis Ende Mai 2027 veröffentlichte DIP-Schlüssel ist als Übergangssecret zulässig; 401-Antworten alarmieren den Betrieb. Kein Schlüssel gelangt in `NEXT_PUBLIC_*`, Git oder eine öffentliche API.

Der tägliche Vercel-Cron ruft ausschließlich den 7–14-Tage-Vorlauf ab. Der einmalige Jahres-Backfill wird bewusst manuell und mit demselben privaten Secret als `scope=BOOTSTRAP` ausgelöst. Beide Wege schreiben nur `DRAFT`, amtliche Metadaten, Hash und einen `SOURCE_REQUIRED`-Prüfauftrag. Sie können weder einen freigegebenen Workflowstatus noch eine veröffentlichte WÖk-Einordnung überschreiben.

DNS wird erst beim gewählten Hosting-Anbieter gesetzt, weil Ziel-CNAME/ALIAS und Verifikationsrecord davon abhängen. Danach wird die Live-URL, Zertifikat, CSP/HSTS, Read-API und Navigation geprüft.
