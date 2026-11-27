# Wimmer — Development Workflow

## Branch Strategy

Wimmer uses a simplified GitFlow model with three branch types:

```
main          Production-ready code. Direct pushes prohibited.
develop       Integration branch. PRs merged here before main.
feature/xxx   New features. Branched from develop.
fix/xxx       Bug fixes. Branched from develop (or main for hotfixes).
docs/xxx      Documentation-only changes. Branched from develop.
```

**Branch naming examples:**
```
feature/lightgbm-forecasting
feature/restaurant-module-schema
fix/occupancy-clamping-negative-values
fix/import-service-duplicate-date-handling
docs/api-spec-forecast-endpoint
docs/industry-discovery-restaurant
```

**Branch lifecycle:**
1. Branch from `develop` (or `main` for hotfixes)
2. Develop locally, commit often
3. Open a PR to `develop`
4. 1 approval required + CI passing
5. Merge to `develop`
6. When `develop` is release-ready: open PR from `develop` → `main`, tagged with version

---

## Commit Conventions

Wimmer uses [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must follow this format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | Use for |
|------|---------|
| `feat` | A new feature visible to users or API consumers |
| `fix` | A bug fix |
| `docs` | Documentation changes only (no code change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Build system, CI, dependency updates, config changes |
| `perf` | Performance improvements |
| `style` | Formatting, whitespace — no logic changes |

**Scope (optional but encouraged):**

| Scope | Covers |
|-------|--------|
| `auth` | Authentication and authorisation |
| `api` | API endpoints |
| `forecasting` | Forecasting engine |
| `ai` | LLM and recommendation service |
| `import` | Data import service |
| `db` | Database models and migrations |
| `web` | Frontend changes |
| `mcp` | MCP integration |
| `docs` | Documentation |
| `ci` | GitHub Actions and CI/CD |

**Examples:**
```
feat(forecasting): add seasonal naive model with 7-day seasonality
fix(import): reject rows where rooms_sold exceeds rooms_available
docs(api): document forecast endpoint response schema
refactor(ai): extract LLM provider into separate abstraction class
test(auth): add tests for JWT token expiry edge cases
chore(deps): update fastapi to 0.110
```

**Breaking changes:** Add `!` after the type or include `BREAKING CHANGE:` in the footer:
```
feat(db)!: rename occupancy column from occupancy_pct to occupancy_rate
```

---

## Pull Request Process

### Opening a PR

1. Use the PR template (`.github/pull_request_template.md`)
2. Fill in all sections — the description should explain *why*, not just *what*
3. Link to the relevant GitHub issue: `Closes #123`
4. Add appropriate labels

**PR title format:** Match the conventional commit format for the primary change:
```
feat(forecasting): add LightGBM model for high-data properties
fix(auth): handle expired refresh tokens gracefully
```

### PR Checklist (required before requesting review)

- [ ] Added or updated tests for changed behaviour
- [ ] Ran `pytest tests/ -v` (backend) — all passing
- [ ] Ran `npm run type-check` and `npm run lint` (frontend) — no errors
- [ ] Ran `ruff check wimmer/` (backend Python) — no errors
- [ ] Tested locally with Docker Compose for end-to-end changes
- [ ] Updated documentation if the change affects API, database schema, or architecture
- [ ] Migration created if database schema changed (`alembic revision --autogenerate`)

### Review Requirements

- **1 approval required** to merge to `develop`
- **2 approvals required** to merge to `main`
- Technical Lead (Person 5) must approve changes to: `apps/api/wimmer/`, `apps/web/src/`, `ml/`, database migrations
- Relevant domain co-founder must approve changes to: `docs/INDUSTRY_DISCOVERY.md` (their section), product-visible feature changes

### Merge Strategy

- **Feature branches → develop:** Squash merge (clean history)
- **develop → main:** Merge commit (preserves integration history)
- Do not use rebase-merge for `develop → main` (preserves context)

---

## Local Development Setup

### Option A: Docker Compose (Recommended)

Requires Docker 24+ and Docker Compose v2+.

```bash
# 1. Clone and configure
git clone https://github.com/wimmer/wimmer.git
cd wimmer
cp .env.example .env
# Edit .env — set SECRET_KEY to output of: openssl rand -hex 32

# 2. Start all services
docker compose up --build

# 3. Run migrations (first time only, or after schema changes)
docker compose exec api alembic upgrade head

# 4. Access
# Web:  http://localhost:3000
# API:  http://localhost:8000
# Docs: http://localhost:8000/api/docs
```

### Option B: Manual (Backend + Frontend separately)

**Prerequisites:** Python 3.11+, Node.js 20+, PostgreSQL 16, Redis 7

**Backend:**
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt

# Configure environment
cp ../../.env.example .env
# Edit .env with your local PostgreSQL and Redis connection strings

# Run migrations
alembic upgrade head

# Start API (with hot reload)
uvicorn wimmer.main:app --reload --port 8000
```

**Frontend:**
```bash
cd apps/web
npm install

# Configure environment
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

---

## Environment Management

### .env File Structure

```bash
# .env — never commit this file

# Application
ENVIRONMENT=development
SECRET_KEY=<generate with: openssl rand -hex 32>
DEBUG=false

# Database
DATABASE_URL=postgresql+psycopg2://wimmer:wimmer@localhost:5432/wimmer

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ORIGINS=http://localhost:3000

# LLM (set to "mock" for local dev without an API key)
LLM_PROVIDER=mock
NEBIUS_API_KEY=
OPENAI_API_KEY=

# Forecasting
MIN_TRAINING_DAYS=30
FORECAST_HORIZON_DAYS=90
```

**Rules:**
- `.env` is in `.gitignore` — never commit it
- `.env.example` is committed with placeholder values only
- Use `LLM_PROVIDER=mock` locally unless specifically testing LLM behaviour
- Never use production database credentials locally

### Multiple Environments

| Environment | Description |
|-------------|-------------|
| `development` | Local development. `DEBUG=true`, mock LLM, permissive CORS. |
| `staging` | Pre-production. Real LLM, production-like config, restricted CORS. |
| `production` | Live. All security controls enabled. |

---

## Database Migrations

Wimmer uses Alembic for database schema management. All schema changes must have a migration.

```bash
# Apply all pending migrations
alembic upgrade head

# Check current migration state
alembic current

# Generate a new migration (review the auto-generated file before committing)
alembic revision --autogenerate -m "add_lightgbm_model_name_to_demand_forecasts"

# Rollback the most recent migration
alembic downgrade -1

# Rollback to a specific revision
alembic downgrade 0001
```

**Migration rules:**
- Always review auto-generated migrations before committing — Alembic sometimes misses changes or generates incorrect DDL
- Never modify an existing migration that has been applied to any shared environment (develop, staging, production)
- Always write a `downgrade()` function — migrations must be reversible
- Test both `upgrade()` and `downgrade()` locally before opening a PR
- Migration filenames use the format: `{revision_id}_{description}.py`

---

## Testing Requirements

### Backend (Python)

**Run tests:**
```bash
cd apps/api
pytest tests/ -v --cov=wimmer --cov-report=term-missing
```

Tests use SQLite in-memory — no PostgreSQL required.

**Requirements before PR:**
- All existing tests must pass
- New features must have tests covering the happy path and primary error cases
- Bug fixes must include a test that would have caught the bug

**Coverage:** No hard coverage gate in the MVP. Aim to test all service layer methods and API route handlers.

**Test organisation:**
```
tests/
  test_auth.py          Auth service and endpoint tests
  test_organisations.py Organisation service tests
  test_properties.py    Property service tests
  test_forecasting.py   Forecasting engine tests (pure unit tests)
  test_import.py        Data import service tests
  test_recommendations.py Recommendation service tests (mock LLM)
  conftest.py           Shared fixtures (in-memory DB session, test client)
```

### Frontend (TypeScript)

```bash
cd apps/web
npm run type-check   # TypeScript compiler check (tsc --noEmit)
npm run lint         # ESLint
```

**Requirements before PR:**
- No TypeScript type errors
- No ESLint errors (warnings acceptable with justification)

---

## Code Style

### Python

**Formatter and linter:** `ruff`

```bash
cd apps/api
ruff check wimmer/        # Lint
ruff check wimmer/ --fix  # Auto-fix safe issues
ruff format wimmer/       # Format
```

**Configuration:** `pyproject.toml`

**Key rules:**
- Line length: 120 characters
- Import sorting: `ruff` manages this (isort-compatible)
- Type annotations: required for all public function signatures
- Docstrings: required for public classes and non-obvious functions

### TypeScript / JavaScript

**Formatter:** Prettier  
**Linter:** ESLint

```bash
cd apps/web
npm run lint          # ESLint
npm run format        # Prettier (if configured)
```

**Key rules:**
- Strict TypeScript: `"strict": true` in `tsconfig.json`
- No `any` types (prefer `unknown` with type guards)
- Use React Server Components for data-fetching pages
- API calls go through the typed API client, not raw `fetch`

---

## Documentation Requirements

### When documentation must be updated

| Change | Required documentation update |
|--------|-------------------------------|
| New API endpoint | `docs/API_SPEC.md` |
| New database table or column | `docs/DATABASE_SCHEMA.md` |
| New forecasting model | `docs/FORECASTING_DESIGN.md` |
| Architectural change | `docs/ARCHITECTURE.md` |
| New security control or known gap | `docs/SECURITY.md` |
| New MCP integration | `docs/MCP_INTEGRATION.md` |
| New industry discovery finding | `docs/INDUSTRY_DISCOVERY.md` |
| New milestone deliverable | `docs/ROADMAP.md` |

Documentation PRs require the same review process as code PRs. A code change that affects documented behaviour without updating the docs will not be approved.

---

## Release Process

### Versioning

Wimmer uses [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

| Version component | When incremented |
|-------------------|-----------------|
| `MAJOR` | Breaking API change or major architecture change |
| `MINOR` | New feature added in a backwards-compatible manner |
| `PATCH` | Bug fix or documentation update |

The version is set in `apps/api/wimmer/core/config.py` (`APP_VERSION`).

### Release Steps

1. All features for the milestone are merged to `develop`
2. Create a release PR: `develop → main`
3. Update `APP_VERSION` in `config.py`
4. Update `ROADMAP.md` to reflect milestone completion
5. 2 approvals required for the release PR
6. Merge to `main`
7. Tag the release: `git tag v0.2.0`
8. Push tag: `git push origin v0.2.0`
9. GitHub Actions CI runs on the tag (build, test, optionally deploy)

### Hotfixes

For critical production bugs:
1. Branch from `main`: `fix/critical-auth-bypass`
2. Fix and test
3. PR directly to `main` with 2 approvals
4. After merging to `main`, immediately cherry-pick or merge to `develop`
