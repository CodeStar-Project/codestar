#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Codestar — VPS bootstrap installer (day 0, run once).
#
# What it does:
#   1. Installs Docker + compose plugin (if missing)
#   2. Hardens the host (ufw firewall + fail2ban)
#   3. Creates .env (random secrets + your answers) — never overwrites
#      an existing .env, so your secrets and customization are safe
#   4. Builds and starts the full stack behind Caddy (automatic HTTPS)
#   5. Waits for health and prints the final URL
#
# Interactive:
#   sudo ./install.sh
#
# Non-interactive (CI / repeatable):
#   sudo DOMAIN=codestar.example.com \
#        ADMIN_EMAIL=you@example.com \
#        ADMIN_PASSWORD='a-strong-password' \
#        ADMIN_NAME='Admin' \
#        SIGNUP_OPEN=false \
#        ./install.sh
#
# Re-running is safe: an existing .env is reused as-is; the stack is
# rebuilt and restarted (your data lives in Docker volumes, untouched).
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# ── pretty logging ───────────────────────────────────────────
c_blue=$'\033[1;34m'; c_green=$'\033[1;32m'; c_yellow=$'\033[1;33m'; c_red=$'\033[1;31m'; c_reset=$'\033[0m'
log()  { printf '%s==>%s %s\n' "$c_blue"  "$c_reset" "$*"; }
ok()   { printf '%s✓%s %s\n'  "$c_green" "$c_reset" "$*"; }
warn() { printf '%s!%s %s\n'  "$c_yellow" "$c_reset" "$*"; }
err()  { printf '%s✗%s %s\n'  "$c_red"   "$c_reset" "$*" >&2; }

# Run from the repo root (directory of this script).
cd "$(dirname "$0")"

# ── privilege handling ───────────────────────────────────────
if [ "$(id -u)" -eq 0 ]; then SUDO=""; else SUDO="sudo"; fi
if [ -n "$SUDO" ] && ! command -v sudo >/dev/null 2>&1; then
  err "Please run as root (sudo not available)."; exit 1
fi

# ── helpers ──────────────────────────────────────────────────
# ask VARNAME "prompt" [secret] [default]
# Uses an existing environment value if set; otherwise prompts (TTY required).
ask() {
  local __var="$1" __prompt="$2" __secret="${3:-}" __default="${4:-}"
  local __cur="${!__var:-}"
  if [ -n "$__cur" ]; then return 0; fi
  if [ ! -t 0 ]; then
    if [ -n "$__default" ]; then printf -v "$__var" '%s' "$__default"; return 0; fi
    err "Missing required value '$__var' and no TTY to prompt."; exit 1
  fi
  if [ "$__secret" = "secret" ]; then
    read -rsp "$__prompt: " "$__var"; echo
  else
    local __hint=""; [ -n "$__default" ] && __hint=" [$__default]"
    read -rp "$__prompt$__hint: " "$__var"
    [ -z "${!__var}" ] && [ -n "$__default" ] && printf -v "$__var" '%s' "$__default"
  fi
}

# set_env KEY VALUE [file]  — replace or append KEY=VALUE (literal, no sed pitfalls)
set_env() {
  local key="$1" val="$2" file="${3:-.env}"
  if grep -qE "^${key}=" "$file" 2>/dev/null; then
    grep -vE "^${key}=" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
  printf '%s=%s\n' "$key" "$val" >> "$file"
}

rand_hex() { openssl rand -hex "$1"; }

# wait_healthy CONTAINER [tries]
wait_healthy() {
  local name="$1" tries="${2:-60}" status
  for _ in $(seq 1 "$tries"); do
    status="$(docker inspect -f '{{.State.Health.Status}}' "$name" 2>/dev/null || echo missing)"
    [ "$status" = "healthy" ] && return 0
    [ "$status" = "missing" ] && { sleep 5; continue; }
    printf '   backend health: %s\n' "$status"
    sleep 5
  done
  return 1
}

# ── 1. Docker ────────────────────────────────────────────────
log "Checking Docker…"
if ! command -v docker >/dev/null 2>&1; then
  log "Docker not found — installing via get.docker.com"
  curl -fsSL https://get.docker.com | $SUDO sh
  ok "Docker installed"
else
  ok "Docker present: $(docker --version)"
fi
if ! docker compose version >/dev/null 2>&1; then
  err "Docker Compose v2 plugin missing. Install 'docker-compose-plugin' and re-run."; exit 1
fi

# ── 2. Host hardening (firewall + fail2ban) ──────────────────
log "Hardening host (ufw + fail2ban)…"
if command -v apt-get >/dev/null 2>&1; then
  $SUDO apt-get update -qq
  $SUDO apt-get install -y -qq ufw fail2ban openssl >/dev/null
  $SUDO ufw allow 22/tcp   >/dev/null 2>&1 || true
  $SUDO ufw allow 80/tcp   >/dev/null 2>&1 || true
  $SUDO ufw allow 443/tcp  >/dev/null 2>&1 || true
  $SUDO ufw --force enable >/dev/null 2>&1 || true
  $SUDO systemctl enable --now fail2ban >/dev/null 2>&1 || true
  ok "Firewall (22/80/443) + fail2ban active"
else
  warn "Non-apt system: skipping ufw/fail2ban (configure your firewall manually)."
fi

# ── 3. .env ──────────────────────────────────────────────────
if [ -f .env ]; then
  ok "Existing .env found — reusing it (no secrets overwritten)."
  DOMAIN="$(grep -E '^DOMAIN=' .env | head -1 | cut -d= -f2- || true)"
  [ -z "${DOMAIN:-}" ] && { err "Existing .env has no DOMAIN= line. Add it and re-run."; exit 1; }
else
  log "Creating .env…"
  [ -f .env.example ] || { err ".env.example missing — are you in the repo root?"; exit 1; }
  cp .env.example .env

  ask DOMAIN         "Domain name (e.g. codestar.example.com)"
  ask ADMIN_EMAIL    "Super-admin email"
  ask ADMIN_PASSWORD "Super-admin password" secret
  ask ADMIN_NAME     "Super-admin display name" "" "Admin"
  ask SIGNUP_OPEN    "Open signups without invitation? (true/false)" "" "false"

  set_env DB_USER     "codestar"
  set_env DB_NAME     "codestardb"
  set_env DB_PASSWORD "$(rand_hex 24)"
  set_env JWT_SECRET  "$(rand_hex 48)"          # 96 hex chars (>= 64 required)
  set_env SITE_URL    "https://${DOMAIN}"
  set_env DOMAIN      "${DOMAIN}"
  set_env SIGNUP_OPEN "${SIGNUP_OPEN}"
  set_env CODESTAR_BOOTSTRAP_SUPER_ADMIN_EMAIL        "${ADMIN_EMAIL}"
  set_env CODESTAR_BOOTSTRAP_SUPER_ADMIN_PASSWORD     "${ADMIN_PASSWORD}"
  set_env CODESTAR_BOOTSTRAP_SUPER_ADMIN_DISPLAY_NAME "${ADMIN_NAME}"

  ok ".env created (random DB_PASSWORD & JWT_SECRET generated)"
fi

# ── 4. Build & start ─────────────────────────────────────────
log "Building and starting the stack (this can take a few minutes)…"
$SUDO docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# ── 5. Wait for health ───────────────────────────────────────
log "Waiting for the backend to become healthy…"
if wait_healthy codestar-backend 60; then
  ok "Backend healthy"
else
  warn "Backend not healthy yet. Check logs: docker compose logs -f backend"
fi

cat <<EOF

${c_green}────────────────────────────────────────────────${c_reset}
${c_green} Codestar is deploying.${c_reset}
   URL:      https://${DOMAIN}
   Admin:    ${CODESTAR_BOOTSTRAP_SUPER_ADMIN_EMAIL:-<from .env>}

 First-time HTTPS note:
   Caddy fetches a Let's Encrypt certificate on first request.
   It only works once your DNS A record points ${DOMAIN} -> this server,
   and ports 80/443 are open. First load may take ~30s.

 Useful commands:
   docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
   docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
${c_green}────────────────────────────────────────────────${c_reset}
EOF
