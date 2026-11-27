.PHONY: demo seed api web dev help

API_DIR   := apps/api
WEB_DIR   := apps/web
PYTHON    := $(API_DIR)/.venv/bin/python
UVICORN   := $(API_DIR)/.venv/bin/uvicorn

help:
	@echo ""
	@echo "  make seed   — seed the demo database"
	@echo "  make api    — start the FastAPI backend  (port 8000)"
	@echo "  make web    — start the Next.js frontend (port 3000)"
	@echo "  make demo   — seed + start both servers"
	@echo ""

seed:
	@echo "Seeding demo data..."
	@cd $(API_DIR) && $(PYTHON) scripts/seed_demo.py

api:
	@cd $(API_DIR) && $(UVICORN) wimmer.main:app --reload --port 8000

web:
	@cd $(WEB_DIR) && npm run dev

demo: seed
	@echo "Starting Wimmer demo..."
	@cd $(API_DIR) && $(UVICORN) wimmer.main:app --port 8000 &
	@cd $(WEB_DIR) && npm run dev
