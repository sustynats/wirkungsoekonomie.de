#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "Fehlt: .env" >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  compose() { docker compose "$@"; }
elif command -v docker-compose >/dev/null; then
  compose() { docker-compose "$@"; }
else
  echo "Fehlt: Docker Compose" >&2
  exit 1
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
backup_dir="${BACKUP_DIR:-$PWD/backups/$timestamp}"
mkdir -p "$backup_dir"
umask 077

compose exec -T crm-db sh -ec 'exec mysqldump --single-transaction --routines --triggers -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  | gzip > "$backup_dir/civicrm.sql.gz"
compose exec -T survey-db sh -ec 'exec mariadb-dump --single-transaction --routines --triggers -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"' \
  | gzip > "$backup_dir/limesurvey.sql.gz"

compose exec -T crm tar -C /var/www/civicrm -czf - private ext \
  > "$backup_dir/civicrm-files.tar.gz"
compose exec -T survey tar -C /var/www/html -czf - application/config plugins upload \
  > "$backup_dir/limesurvey-files.tar.gz"

if compose --profile analytics ps --status running -q analytics-db | rg -q .; then
  compose --profile analytics exec -T analytics-db sh -ec 'exec pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
    | gzip > "$backup_dir/analytics.sql.gz"
else
  echo "Analytics-Datenbank läuft nicht; kein Analytics-Backup erstellt." >&2
fi

sha256sum "$backup_dir"/* > "$backup_dir/SHA256SUMS"
echo "Backup erstellt: $backup_dir"
