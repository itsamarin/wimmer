# Contributing to Wimmer

Thank you for contributing to Wimmer. This document covers everything you need to get started: environment setup, code style, testing, the PR process, and how each team member can contribute most effectively.

---

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Code Style Requirements](#code-style-requirements)
3. [Testing Requirements](#testing-requirements)
4. [Pull Request Process](#pull-request-process)
5. [Issue Reporting](#issue-reporting)
6. [Documentation Requirements](#documentation-requirements)
7. [Founding Team Workstream Assignments](#founding-team-workstream-assignments)

---

## Development Environment Setup

### Prerequisites

| Tool | Minimum version | Installation |
|------|----------------|-------------|
| Docker | 24.0 | https://docs.docker.com/get-docker/ |
| Docker Compose | v2 | Included with Docker Desktop |
| Git | 2.40 | https://git-scm.com/ |
| Node.js | 20.0 | https://nodejs.org/ (for frontend dev without Docker) |
| Python | 3.11 | https://python.org/ (for backend dev without Docker) |

### Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/wimmer/wimmer.git
cd wimmer

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum, set a unique SECRET_KEY:
# openssl rand -hex 32

# 3. Build and start all services
docker compose up --build

# 4. Apply database migrations (first run only)
docker compose exec api alembic upgrade head

# 5. Open the application
# Frontend: http://localhost:3000
# API docs: http://localhost:8000/api/docs
# Health:   http://localhost:8000/health
```

### Backend Development (without Docker)

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt -r requirements-dev.txt

# Configure
cp ../../.env.example .env
# Edit .env — set DATABASE_URL to your local PostgreSQL

# Apply migrations
alembic upgrade head

# Start API with hot reload
uvicorn wimmer.main:app --reload --port 8000
```

### Frontend Development (without Docker)

```bash
cd apps/web
npm install

# Configure
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

### Environment Variables

All secrets are managed via `.env` files. Never commit a `.env` file. Use `.env.example` as the template.

Key variables:

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing key — generate with `openssl rand -hex 32` |
| `DATABASE_URL` | PostgreSQL connection string |
| `LLM_PROVIDER` | `mock` for local development (no API key required) |
| `NEBIUS_API_KEY` | Only needed if testing with real Nebius LLM |
| `OPENAI_API_KEY` | Only needed if testing with real OpenAI LLM |

---

## Code Style Requirements

### Python

Wimmer uses `ruff` for both linting and formatting.

```bash
cd apps/api

# Lint
ruff check wimmer/

# Auto-fix safe issues
ruff check wimmer/ --fix

# Format
ruff format wimmer/
```

**Key conventions:**
- Line length: 120 characters
- Type annotations required on all public function signatures
- Docstrings required for public classes and non-obvious functions
- Imports sorted by ruff (isort-compatible)

**CI will reject PRs with ruff errors.**

### TypeScript / JavaScript

Wimmer uses ESLint and TypeScript strict mode.

```bash
cd apps/web
npm run type-check   # TypeScript compiler (tsc --noEmit)
npm run lint         # ESLint
```

**Key conventions:**
- Strict TypeScript: no implicit `any`
- Use React Server Components for data-fetching pages
- No raw `fetch` in components — all API calls go through the typed API client
- Component files: PascalCase (`PropertyCard.tsx`)
- Utility files: camelCase (`formatCurrency.ts`)

**CI will reject PRs with TypeScript errors or ESLint errors.**

### Commit Messages

Wimmer uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`

Examples:
```
feat(forecasting): add LightGBM model for high-data properties
fix(auth): handle expired refresh token without 500 error
docs(api): document forecast endpoint query parameters
test(import): add test for duplicate date row handling
```

---

## Testing Requirements

### Backend

```bash
cd apps/api
pytest tests/ -v --cov=wimmer --cov-report=term-missing
```

**Requirements:**
- All existing tests must pass before opening a PR
- New features must include tests for the happy path and primary error cases
- Bug fixes must include a regression test
- Tests use SQLite in-memory — no PostgreSQL required

### Frontend

```bash
cd apps/web
npm run type-check
npm run lint
```

Frontend unit tests are planned but not yet required for MVP contributions. TypeScript compilation and lint must pass.

### Manual Testing Checklist

For any change that affects user-visible behaviour, test locally with Docker Compose:

- [ ] The changed feature works end-to-end
- [ ] The existing features adjacent to your change still work
- [ ] The API returns the expected response shapes
- [ ] Error cases produce appropriate error messages (not 500)

---

## Pull Request Process

### Before Opening a PR

1. Branch from `develop`: `git checkout -b feature/your-feature-name develop`
2. Make your changes with clean, conventional commits
3. Run tests and linting (see above)
4. Update documentation if your change affects documented behaviour

### Opening a PR

1. Use the PR template (`.github/pull_request_template.md`)
2. Fill in all sections — the description must explain *why*, not just *what*
3. Link to the GitHub issue: `Closes #123`
4. Add appropriate labels

### Review Requirements

- **Target branch:** `develop` (not `main`)
- **Approvals required:** 1 for `develop`, 2 for `main`
- Technical changes: Technical Lead review required
- Product-visible changes: Relevant domain co-founder review required
- `docs/INDUSTRY_DISCOVERY.md`: Relevant domain lead review required

### After Merge

Your branch will be merged using squash merge (clean history on `develop`). You can delete your branch after merge.

---

## Issue Reporting

### Bug Reports

Use the bug report issue template. Include:
- Steps to reproduce
- Expected behaviour
- Actual behaviour
- Environment (OS, browser, Docker version if relevant)
- Logs if available (remove any secrets before pasting)

### Feature Requests

Use the feature request issue template. Include:
- The problem you are trying to solve (not just the solution you want)
- Who experiences this problem (which user type)
- Current workaround, if any
- Why existing features do not cover this case

### Industry Discovery Questions

If you have a specific operational question from your industry experience, open an issue with:
- Label: `discovery`
- The question (specific and concrete, not generic)
- Context: who asks this, in what situation
- Current solution: how is it answered today?
- What Wimmer could provide

This directly feeds `docs/INDUSTRY_DISCOVERY.md`.

---

## Documentation Requirements

Documentation changes are as important as code changes. If your PR changes behaviour that is documented, update the relevant documentation in the same PR.

| Change type | Document to update |
|-------------|-------------------|
| New API endpoint | `docs/API_SPEC.md` |
| New database column or table | `docs/DATABASE_SCHEMA.md` |
| New forecasting model | `docs/FORECASTING_DESIGN.md` |
| Architectural change | `docs/ARCHITECTURE.md` |
| New security control | `docs/SECURITY.md` |
| New MCP integration | `docs/MCP_INTEGRATION.md` |
| New product feature | `docs/PRODUCT_SPEC.md` |
| New milestone deliverable | `docs/ROADMAP.md` |

Documentation-only changes use the `docs/xxx` branch prefix.

---

## Founding Team Workstream Assignments

Each co-founder owns specific areas of the codebase and documentation. PRs touching these areas should request review from the relevant owner.

### Person 1 — Hospitality Lead

**Documentation ownership:**
- `docs/PRODUCT_SPEC.md` — primary author
- `docs/ROADMAP.md` — primary author
- `docs/INDUSTRY_DISCOVERY.md` — Hotel / Hospitality section

**Code review:**
- Product-facing features in `apps/web/` (hospitality-specific UX)
- AI recommendation categories and prompt design for hospitality

**GitHub:** [TBD — to be assigned]

---

### Person 2 — Restaurant Operations Lead

**Documentation ownership:**
- `docs/INDUSTRY_DISCOVERY.md` — Restaurant Operations section

**Code review:**
- Restaurant module features (Milestone 3)
- F&B-specific data import templates and validation

**GitHub:** [TBD — to be assigned]

---

### Person 3 — Supply Chain Lead

**Documentation ownership:**
- `docs/INDUSTRY_DISCOVERY.md` — Warehouse & Supply Chain section

**Code review:**
- Supply chain module features (Milestone 4)
- idealo MCP procurement integration

**GitHub:** [TBD — to be assigned]

---

### Person 4 — Retail Lead

**Documentation ownership:**
- `docs/INDUSTRY_DISCOVERY.md` — Retail section

**Code review:**
- Retail module features (Milestone 5)
- Retail-specific data import templates

**GitHub:** [TBD — to be assigned]

---

### Person 5 — Technical Lead

**Code ownership:**
- `apps/api/` — full API codebase
- `apps/web/` — full frontend codebase
- `ml/` — forecasting research and models
- `infrastructure/` — Docker, scripts, CI/CD

**Documentation ownership:**
- `docs/ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_SPEC.md`
- `docs/AI_AGENT_DESIGN.md`
- `docs/FORECASTING_DESIGN.md`
- `docs/SECURITY.md`
- `docs/MCP_INTEGRATION.md`
- `docs/DEVELOPMENT_WORKFLOW.md`

**GitHub:** [TBD — to be assigned]
