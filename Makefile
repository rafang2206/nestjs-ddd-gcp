COMPOSE=docker compose
SERVICE=api

.PHONY: help build up up-build down restart logs ps shell lint test

help:
	@echo "Available commands:"
	@echo "  make build      Build Docker image"
	@echo "  make up         Start services in detached mode"
	@echo "  make up-build   Build and start services in detached mode"
	@echo "  make down       Stop and remove services"
	@echo "  make restart    Restart services"
	@echo "  make logs       Follow API logs"
	@echo "  make ps         Show compose services status"
	@echo "  make shell      Open shell inside API container"
	@echo "  make lint       Run lint inside API container"
	@echo "  make test       Run tests inside API container"

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

up-build:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f $(SERVICE)

ps:
	$(COMPOSE) ps

shell:
	$(COMPOSE) exec $(SERVICE) sh

lint:
	$(COMPOSE) exec $(SERVICE) pnpm run lint

test:
	$(COMPOSE) exec $(SERVICE) pnpm test
