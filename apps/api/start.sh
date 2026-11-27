#!/bin/bash
set -e

echo "==> Running Alembic migrations..."
alembic upgrade head

if [ "${SEED_DEMO:-false}" = "true" ]; then
  echo "==> Seeding demo data..."
  python scripts/seed_demo.py
fi

echo "==> Starting Wimmer API..."
exec uvicorn wimmer.main:app --host 0.0.0.0 --port "${PORT:-8000}"
