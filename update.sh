#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Codestar — instance updater (day-N).
#
# Pulls the latest code, rebuilds the stack and verifies health.
# Safe by design: backs up the database first, and on a failed
# health check it rolls back BOTH the code and the database.
#
# Run as the repo owner (so git uses the deploy key) with Docker
# access (add the user to the "docker" group: usermod -aG docker <user>).
#
# Usage:
#   ./update.sh              interactive (asks before applying)
#   ./update.sh --yes        non-interactive (for systemd timer / CI)
#   ./update.sh --no-backup  skip the pre-update DB dump
#   ./update.sh --help
#
# Exit codes: 0 = updated or already up to date · 1 = error/rolled back
# ─────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")"

# ── options ──────────────────────────────────────────────────
ASSUME_YES=0
DO_BACKUP=1
for arg in "$@"; do
  case "$arg" in
    --yes|-y)     ASSUME_YES=1 ;;
    --no-backup)  DO_BACKUP=0 ;;
    --help|-h)    sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; exit 1 ;;
  esac
done

# ── logging ──────────────────────────────────────────────────
c_blue=$'\033[1;34m'; c_green=$'\033[1;32m'; c_yellow=$'\033[1;33m'; c_red=$'\033[1;31m'; c_reset=$'\033[0m'
log()  { printf '%s==>%s %s\n' "$c_blue"   "$c_reset" "$*"; }
ok()   { printf '%s✓%s %s\n'   "$c_green"  "$c_reset" "$*"; }
warn() { printf '%s!%s %s\n'   "$c_yellow" "$c_reset" "$*"; }
err()  { printf '%s✗%s %s\n'   "$c_red"    "$c_reset" "$*" >&2; }

# ── single-instance lock (avoid concurrent updates) ──────────
exec 9>/tmp/codestar-update.lock
if ! flock -n 9; then err "Another update is already running."; exit 1; fi

# ── prerequisites ────────────────────────────────────────────
[ -f .env ] || { err "No .env found — is this an installed instance?"; exit 1; }
command -v docker >/dev/null || { err "docker not found."; exit 1; }
docker info >/dev/null 2>&1 || { err "Cannot talk to Docker. Add your user to the 'docker' group."; exit 1; }

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

# DB credentials (read from .env without sourcing arbitrary content)
DB_USER="$(grep -E '^DB_USER='     .env | head -1 | cut -d= -f2-)"
DB_NAME="$(grep -E '^DB_NAME='     .env | head -1 | cut -d= -f2-)"
DB_CONTAINER="codestar-db"
BACKUP_DIR="./backups"
KEEP_BACKUPS=7

# ── helpers ──────────────────────────────────────────────────
wait_healthy() {
  local name="$1" tries="${2:-60}" status
  for _ in $(seq 1 "$tries"); do
    status="$(docker inspect -f '{{.State.Health.Status}}' "$name" 2>/dev/null || echo missing)"
    [ "$status" = "healthy" ] && return 0
    sleep 5
  done
  return 1
}

backup_db() {
  mkdir -p "$BACKUP_DIR"
  local f="$BACKUP_DIR/db-$(date +%Y%m%d-%H%M%S).sql.gz"
  log "Backing up database → $f"
  if docker exec "$DB_CONTAINER" pg_dump --clean --if-exists -U "$DB_USER" "$DB_NAME" | gzip > "$f"; then
    ok "Backup done"
    echo "$f"
    # rotation: keep the most recent $KEEP_BACKUPS
    ls -1t "$BACKUP_DIR"/db-*.sql.gz 2>/dev/null | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f
  else
    rm -f "$f"; err "Backup failed — aborting (no update applied)."; exit 1
  fi
}

restore_db() {
  local f="$1"
  [ -n "$f" ] && [ -f "$f" ] || { warn "No backup to restore."; return 1; }
  log "Restoring database from $f"
  gunzip -c "$f" | docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" >/dev/null
  ok "Database restored"
}

# ── 1. is there anything new? ────────────────────────────────
log "Checking for updates…"
git fetch --quiet
OLD_COMMIT="$(git rev-parse HEAD)"
NEW_COMMIT="$(git rev-parse '@{u}')"
if [ "$OLD_COMMIT" = "$NEW_COMMIT" ]; then
  ok "Already up to date ($(git rev-parse --short HEAD)). Nothing to do."
  exit 0
fi

log "New version available:"
git --no-pager log --oneline "$OLD_COMMIT..$NEW_COMMIT" | sed 's/^/   /'

if [ "$ASSUME_YES" -ne 1 ]; then
  read -rp "Apply this update? [y/N] " a
  [ "$a" = "y" ] || [ "$a" = "Y" ] || { warn "Cancelled."; exit 0; }
fi

# ── 2. backup ────────────────────────────────────────────────
BACKUP_FILE=""
[ "$DO_BACKUP" -eq 1 ] && BACKUP_FILE="$(backup_db)"

# ── 3. apply ─────────────────────────────────────────────────
log "Pulling new code…"
git merge --ff-only "$NEW_COMMIT"

log "Rebuilding and restarting…"
$COMPOSE up --build -d

# ── 4. verify, else rollback ─────────────────────────────────
log "Waiting for backend health…"
if wait_healthy codestar-backend 60; then
  ok "Update applied successfully → $(git rev-parse --short HEAD)"
  docker image prune -f >/dev/null 2>&1 || true
  exit 0
fi

err "Backend unhealthy after update. Rolling back to $(git rev-parse --short "$OLD_COMMIT")…"
git reset --hard "$OLD_COMMIT"
$COMPOSE up --build -d
[ -n "$BACKUP_FILE" ] && restore_db "$BACKUP_FILE" || warn "No DB restore (backup was skipped)."
if wait_healthy codestar-backend 60; then
  warn "Rolled back successfully. The update was NOT applied."
else
  err "Rollback finished but backend still unhealthy. Check: $COMPOSE logs backend"
fi
exit 1
