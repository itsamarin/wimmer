# Wimmer

**Intelligence Beyond Seasons.**

Wimmer is an AI-powered seasonal business intelligence and decision platform for hospitality businesses. It helps hotel operators anticipate market changes, forecast demand, optimise revenue, and make better operational decisions throughout the year.

> **Note:** This is an early MVP. All demo data is simulated. See [ROADMAP](docs/ROADMAP.md) for planned capabilities.

---

## Product overview

Wimmer is not a PMS, RMS, booking engine, or channel manager replacement.

It is an **intelligence and decision layer** that connects to existing hospitality systems and transforms fragmented data into actionable business insights.

**Core value proposition:** Anticipate seasonal demand. Optimise commercial performance. Make better business decisions.

---

## Features (MVP)

| Module | Status | Description |
|--------|--------|-------------|
| **Wimmer Intelligence** | ✅ MVP | Seasonal signals, public holidays, demand drivers |
| **Wimmer Forecast** | ✅ MVP | Occupancy, revenue, ADR forecasting with uncertainty |
| **Wimmer Revenue** | ✅ MVP | ADR, RevPAR, occupancy performance monitoring |
| **Wimmer Operations** | 🔜 Planned | Staffing, housekeeping, procurement, F&B |
| **AI Decision Centre** | ✅ MVP | Evidence-backed recommendations with approval workflow |
| **Data Import** | ✅ MVP | CSV/Excel hotel performance upload and validation |
| **Multi-property** | ✅ MVP | Organisations, properties, role-based access |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js Frontend (apps/web)                            │
│  TypeScript · React · Tailwind · shadcn/ui · Recharts  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│  FastAPI Backend (apps/api)                             │
│  Python · Pydantic · SQLAlchemy · JWT Auth             │
│                                                         │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────┐ │
│  │ Forecasting  │  │ AI Decision    │  │ Data       │ │
│  │ Engine       │  │ Centre         │  │ Import     │ │
│  │ (statistical)│  │ (LLM + rules)  │  │ (CSV/XLSX) │ │
│  └──────────────┘  └────────────────┘  └────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   PostgreSQL 16                       Redis 7
   (primary store)                    (cache / queues)
```

**Key architectural principles:**
- Forecasting engine is **independent of the LLM**. The LLM interprets validated statistical outputs — it never generates numerical predictions.
- Multi-tenant with organisation-level isolation enforced at the service layer.
- All consequential AI actions require human approval before execution.

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts |
| Backend | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2 |
| Database | PostgreSQL 16, Alembic migrations |
| Cache | Redis 7 |
| Forecasting | Pandas, NumPy, Scikit-learn, Statsmodels |
| AI | Configurable LLM provider (Nebius AI / OpenAI / Mock) |
| Auth | JWT (python-jose), bcrypt |
| Infrastructure | Docker, Docker Compose, GitHub Actions |

---

## Repository structure

```
wimmer/
├── apps/
│   ├── web/           # Next.js frontend
│   └── api/           # FastAPI backend
│       ├── wimmer/    # Application package
│       │   ├── api/   # Route handlers
│       │   ├── core/  # Config, security, logging
│       │   ├── db/    # Models, migrations, session
│       │   ├── schemas/
│       │   └── services/
│       │       ├── forecasting/   # Statistical engine
│       │       ├── ai/            # LLM + recommendations
│       │       └── integrations/
│       └── tests/
├── ml/                # ML research and notebooks
├── integrations/      # External data connectors
├── infrastructure/    # Docker, scripts
├── docs/              # Architecture and design docs
└── .github/           # CI/CD, issue templates
```

---

## Quick start

### Prerequisites

- Docker 24+ and Docker Compose v2+
- (Optional) Node.js 20+ for frontend development without Docker
- (Optional) Python 3.11+ for backend development without Docker

### 1. Clone and configure

```bash
git clone https://github.com/itsamarin/wimmer.git
cd wimmer
cp .env.example .env
```

Edit `.env` and set a strong `SECRET_KEY`:

```bash
# Generate a secure key
openssl rand -hex 32
```

### 2. Start with Docker Compose

```bash
docker compose up --build
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- API on `http://localhost:8000`
- Frontend on `http://localhost:3000`

### 3. Run database migrations

```bash
docker compose exec api alembic upgrade head
```

### 4. Access the application

| Service | URL |
|---------|-----|
| Web application | http://localhost:3000 |
| API documentation | http://localhost:8000/api/docs |
| API health check | http://localhost:8000/health |

### 5. Create your account

1. Open http://localhost:3000/register
2. Create an account
3. Create an organisation — demo properties are automatically seeded
4. Explore the dashboard with simulated data

---

## Local development (without Docker)

### Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt

# Configure environment
cp ../../.env.example .env
# Edit .env with your local PostgreSQL connection

# Run migrations
alembic upgrade head

# Start API
uvicorn wimmer.main:app --reload --port 8000
```

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

---

## Running tests

### Backend tests

```bash
cd apps/api
pytest tests/ -v --cov=wimmer
```

Tests use SQLite in-memory — no PostgreSQL required for testing.

### Frontend type checking and linting

```bash
cd apps/web
npm run type-check
npm run lint
```

---

## Database migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"

# Check current state
alembic current

# Rollback one step
alembic downgrade -1
```

---

## Data import

Upload hotel performance data via the API or the Properties page.

### Required CSV columns

| Column | Type | Required |
|--------|------|----------|
| `date` | YYYY-MM-DD | Yes |
| `rooms_available` | integer | Yes |
| `rooms_sold` | integer | No |
| `room_revenue` | decimal | No |
| `adr` | decimal | No |
| `revpar` | decimal | No |
| `cancellations` | integer | No |
| `new_bookings` | integer | No |

Download the template: `infrastructure/scripts/import_template.csv`

---

## MCP integration

Wimmer includes an optional [idealo MCP](docs/MCP_INTEGRATION.md) integration for procurement research.

This integration requires separate OAuth authentication and does not affect core application functionality if unavailable.

See [docs/MCP_INTEGRATION.md](docs/MCP_INTEGRATION.md) for setup instructions.

---

## API documentation

The full API is documented at `http://localhost:8000/api/docs` (Swagger UI) when running locally.

Key endpoint groups:

- `POST /api/v1/auth/register` — Create account
- `POST /api/v1/auth/login` — Authenticate
- `GET/POST /api/v1/organisations` — Organisation management
- `GET/POST /api/v1/organisations/{id}/properties` — Property management
- `POST /api/v1/organisations/{id}/properties/{id}/import` — Upload performance data
- `POST /api/v1/organisations/{id}/properties/{id}/forecasts` — Generate forecasts
- `POST /api/v1/organisations/{id}/properties/{id}/recommendations` — Generate AI recommendations
- `PATCH /api/v1/organisations/{id}/properties/{id}/recommendations/{id}` — Approve / reject
- `GET /api/v1/organisations/{id}/intelligence/signals` — Seasonal signals

---

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full product roadmap.

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and design decisions |
| [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Database design and tenant isolation |
| [API_SPEC.md](docs/API_SPEC.md) | API endpoint reference |
| [AI_AGENT_DESIGN.md](docs/AI_AGENT_DESIGN.md) | AI workflow and decision pipeline |
| [FORECASTING_DESIGN.md](docs/FORECASTING_DESIGN.md) | Forecasting methodology |
| [MCP_INTEGRATION.md](docs/MCP_INTEGRATION.md) | MCP server configuration |
| [SECURITY.md](docs/SECURITY.md) | Security model and controls |
| [TEAM_STRUCTURE.md](docs/TEAM_STRUCTURE.md) | Founding team and workstreams |
| [INDUSTRY_DISCOVERY.md](docs/INDUSTRY_DISCOVERY.md) | Product discovery hypotheses |
| [ROADMAP.md](docs/ROADMAP.md) | Product roadmap |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## Licence

MIT — see [LICENSE](LICENSE).
