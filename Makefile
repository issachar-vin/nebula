.DEFAULT_GOAL := help
.PHONY: help install dev build preview clean reinstall docker-build docker-run

IMAGE ?= nebula:local

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start the Vite dev server (http://localhost:5173)
	npm run dev

build: ## Type-check and build for production into dist/
	npm run build

preview: ## Serve the production build locally
	npm run preview

clean: ## Remove build output and installed dependencies
	rm -rf dist node_modules

reinstall: clean install ## Clean then reinstall from scratch

docker-build: ## Build the production Docker image (override with IMAGE=...)
	docker build -t $(IMAGE) .

docker-run: ## Run the image locally on http://localhost:8080
	docker run --rm -p 8080:80 $(IMAGE)
