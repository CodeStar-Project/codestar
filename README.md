# Codestar

[![CI](https://github.com/CodeStar-Project/codestar/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeStar-Project/codestar/actions/workflows/ci.yml)
[![Security](https://github.com/CodeStar-Project/codestar/actions/workflows/security.yml/badge.svg)](https://github.com/CodeStar-Project/codestar/actions/workflows/security.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/CodeStar-Project/codestar/badge)](https://scorecard.dev/viewer/?uri=github.com/CodeStar-Project/codestar)
[![License](https://img.shields.io/badge/license-GPLv3-blue.svg)](LICENSE)

Open-source &amp; self-hosted e-learning platform template to build yours easly.

## Backend 

Java

## Frontend

Next.js

## Docker Infrastructure

### Architecture

Three services orchestrated by `docker-compose.yml` at the root :

| Service | Image | Port |
|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 |
| `backend` | Build multi-stage Maven → JRE 17 alpine | 8080 |
| `frontend` | Build multi-stage Next.js standalone | 3000 |

The backend waits for PostgreSQL to be healthy before starting (health check). Data is persisted in a named Docker volume.

### Launching

**1. Configure secrets (one-time setup)**

```bash
cp .env.example .env # Linux
copy .env.example .env # Windows
# Edit .env: fill in secrets
```

**2. Start (Windows / Linux / Mac)**

```bash
docker compose up --build -d
```

The application is accessible at `http://localhost:3000`, and the API at `http://localhost:8080`.

### Commandes utiles

```bash
docker compose logs -f # follow logs in real-time
docker compose ps # service status
docker compose down # stop
docker compose down -v # stop + delete database
```

With `make` (Linux / Mac) :

```bash
make prod # build + strat everything
make dev # development mode (frontend hot-reload, DB Docker)
make logs # real-time logs
make down # stop everything
make clean # stop + delete volumes
```

### Development Mode

Run only the database in Docker, and the apps locally:

```bash
docker compose up postgres -d
# In one terminal: cd apps/backend && .\mvnw.cmd spring-boot:run
# In another: cd apps/frontend && pnpm dev
```

Or with frontend hot-reload via Docker:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

## Monitoring (optional)

An overlay adds Prometheus, Grafana, Loki, Promtail, node-exporter and cAdvisor.
Every container stays on the internal network — no public port is opened.

**1. Generate the Grafana admin password (one-time, on the host)**

```bash
echo "GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 24)" >> .env
```

**2. Start the stack**

```bash
make monitoring
# equivalent to:
# docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d
```

**3. Reach Grafana through an SSH tunnel** (it is never exposed publicly)

```bash
ssh -L 3000:localhost:3001 user@vps   # then open http://localhost:3000
```

Log in with `admin` and the password you generated. Dashboards are provisioned
automatically: Spring/JVM, VPS system, containers, and Loki logs.
