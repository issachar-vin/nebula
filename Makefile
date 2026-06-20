.DEFAULT_GOAL := help
.PHONY: help install dev build preview clean reinstall

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
