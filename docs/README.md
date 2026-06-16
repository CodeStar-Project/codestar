# Codestar

Open-source &amp; self-hosted e-learning platform

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
