# =============================================================================
# FHIR 3D 互動式教學手冊 — common developer tasks
#
#   make install   install dependencies
#   make dev       start the dev server on http://localhost:5173
#   make check     typecheck + production build + static-site preflight
# =============================================================================

SHELL := /bin/bash
.DEFAULT_GOAL := help

NPM          ?= npm
NODE         ?= node
PYTHON       ?= python3
DEV_PORT     ?= 5173
PREVIEW_PORT ?= 4173
SERVE_PORT   ?= 8080
DIST_DIR     ?= dist
SITE_CHECK   ?= scripts/check-site.sh

.PHONY: help install dev build preview serve typecheck check audit clean distclean

help: ## Show this help
	@printf '\nFHIR 3D 互動式教學手冊 — available targets\n\n'
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
	@printf '\n'

install: ## Install dependencies from package-lock.json
	$(NPM) ci

dev: ## Start the Vite dev server on http://localhost:5173
	$(NPM) run dev -- --port $(DEV_PORT) --host 127.0.0.1

typecheck: ## Type-check the project with TypeScript
	$(NODE) ./node_modules/typescript/bin/tsc --noEmit

build: ## Build the production single-file site into $(DIST_DIR)/
	$(NPM) run build

preview: build ## Build, then serve the output on http://localhost:4173
	$(NPM) run preview -- --port $(PREVIEW_PORT) --host 127.0.0.1

serve: ## Serve an existing dist/ over HTTP on http://localhost:8080
	@test -d $(DIST_DIR) || { printf 'No %s/ yet — run "make build" first.\n' "$(DIST_DIR)" >&2; exit 1; }
	cd $(DIST_DIR) && $(PYTHON) -m http.server $(SERVE_PORT) --bind 127.0.0.1

check: typecheck build ## Type-check, build, then run the static-site preflight
	bash $(SITE_CHECK) $(DIST_DIR)

audit: ## Report known vulnerabilities in the dependency tree
	$(NPM) audit

clean: ## Remove the build output
	rm -rf $(DIST_DIR)

distclean: clean ## Remove the build output and installed dependencies
	rm -rf node_modules
