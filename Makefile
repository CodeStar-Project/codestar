.PHONY: setup prod dev down logs ps clean monitoring

## First-time setup: copy env template
setup:
	@test -f .env || (cp .env.example .env && echo ".env created, fill in your secrets before deploying.")

## Production: build images and start all services
prod: setup
	docker compose up --build -d

## Dev mode: hot-reload frontend, live DB, native backend
dev: setup
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

## Stop all services
down:
	docker compose down

## Stop all services and delete volumes
clean:
	docker compose down -v --remove-orphans

## Stream logs (Ctrl-C to quit)
logs:
	docker compose logs -f

## Service status
ps:
	docker compose ps

## Monitoring stack: Prometheus + Grafana + Loki (reach Grafana via SSH tunnel)
monitoring:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d
