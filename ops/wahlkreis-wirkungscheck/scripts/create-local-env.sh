#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -e .env ]]; then
  echo ".env existiert bereits; es wurde nichts verändert." >&2
  exit 1
fi

cp .env.example .env
for key in CRM_DB_PASSWORD CRM_DB_ROOT_PASSWORD SURVEY_DB_PASSWORD SURVEY_DB_ROOT_PASSWORD SURVEY_ADMIN_PASSWORD ANALYTICS_DB_PASSWORD; do
  value="$(openssl rand -hex 32)"
  perl -0pi -e "s/^${key}=CHANGE_ME\$/$(printf '%s' "$key=$value" | sed 's/[&/]/\\\\&/g')/m" .env
done
chmod 600 .env

echo ".env wurde mit lokalen Zufallsgeheimnissen angelegt. Vor Produktion Domains und Kontaktadresse prüfen."
