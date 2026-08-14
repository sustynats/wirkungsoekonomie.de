# Deployment

Deployment-Ziel ist ein eigenes Hosting-Projekt für `parlament.wirkungsoekonomie.de`, getrennt von GitHub Pages und der Akademie. Vor DNS-Umschaltung: Preview, TLS, Umgebungsvariablen, Healthcheck, RLS/Migration und Import-Worker prüfen.

Erforderliche Laufzeitwerte: `DIP_API_KEY`, `DIP_LOOKAHEAD_DAYS=10`, Supabase-URL, serverseitiger Service-Role-Key sowie ein Cron-Secret für den privaten Worker. Kein Schlüssel gelangt in `NEXT_PUBLIC_*`, Git oder eine öffentliche API.

DNS wird erst beim gewählten Hosting-Anbieter gesetzt, weil Ziel-CNAME/ALIAS und Verifikationsrecord davon abhängen. Danach wird die Live-URL, Zertifikat, CSP/HSTS, Read-API und Navigation geprüft.
