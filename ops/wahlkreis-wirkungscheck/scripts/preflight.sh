#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Fehlt: .env. Zuerst ./scripts/create-local-env.sh ausführen." >&2
  exit 1
fi

for command in docker openssl; do
  command -v "$command" >/dev/null || {
    echo "Fehlt: $command" >&2
    exit 1
  }
done

if docker compose version >/dev/null 2>&1; then
  compose() { docker compose "$@"; }
elif command -v docker-compose >/dev/null; then
  compose() { docker-compose "$@"; }
else
  echo "Fehlt: Docker Compose" >&2
  exit 1
fi

if rg -n '=CHANGE_ME$' .env >/dev/null; then
  echo ".env enthält noch Platzhalter. Nicht starten." >&2
  exit 1
fi

if [[ "${1:-}" == "production" ]]; then
  if rg -n 'localhost|example\.org|CHANGE_ME' .env >/dev/null; then
    echo "Produktionskonfiguration enthält lokale oder Beispielwerte." >&2
    exit 1
  fi
  compose --profile production config --quiet
else
  compose -f compose.yml -f compose.local.yml config --quiet
fi

echo "Vorprüfung erfolgreich."
