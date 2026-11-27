#!/bin/bash
set -e

echo "==> Running Alembic migrations..."
alembic upgrade head

if [ "${SEED_DEMO:-false}" = "true" ]; then
  echo "==> Seeding hotel demo data..."
  python scripts/seed_demo.py
  echo "==> Seeding restaurant demo data..."
  python scripts/seed_restaurant_demo.py
fi

echo "==> Starting Wimmer API..."
exec uvicorn wimmer.main:app --host 0.0.0.0 --port "${PORT:-8000}"
