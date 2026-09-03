#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Fehlt: .env. Zuerst ./scripts/create-local-env.sh ausführen." >&2
  exit 1
fi

for key in \
  ANALYTICS_DB_NAME \
  ANALYTICS_DB_USER \
  ANALYTICS_DB_PASSWORD \
  ANALYTICS_STUDY_ID \
  ANALYTICS_WAVE_ID \
  ANALYTICS_SURVEY_VERSION \
  ANALYTICS_RAW_TTL_HOURS \
  MIN_ANALYTICS_COHORT_SIZE \
  ENABLE_PARTY_RESEARCH_ANALYTICS \
  ANALYTICS_ALLOWED_ORIGINS; do
  if rg -q "^${key}=" .env; then
    continue
  fi

  if [[ "$key" == "ANALYTICS_DB_PASSWORD" ]]; then
    value="$(openssl rand -hex 32)"
  else
    value="$(rg "^${key}=" .env.example | cut -d= -f2-)"
  fi
  printf '\n%s=%s\n' "$key" "$value" >> .env
done

chmod 600 .env
echo "Die lokalen Analytics-Werte wurden ergänzt. Keine Produktionsgeheimnisse wurden erzeugt."
