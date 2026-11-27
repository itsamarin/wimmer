# Wimmer — System Architecture

## Overview

Wimmer is an AI-powered seasonal business intelligence platform for hospitality businesses. The system is structured as a **modular monolith** — a single deployable FastAPI application with clearly separated internal modules — backed by a Next.js frontend and PostgreSQL database.

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Frontend                                          │
│  Next.js 15 · React 19 · TypeScript · Tailwind · Recharts  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST (JSON)
┌────────────────────────▼────────────────────────────────────┐
│  Layer 2: API                                               │
│  FastAPI · Pydantic v2 · JWT Auth · CORS                   │
│  /api/v1/auth  /organisations  /properties  /forecasts      │
│  /recommendations  /intelligence                            │
└──────────┬────────────────────┬───────────────┬────────────┘
           │                    │               │
┌──────────▼──────┐  ┌──────────▼──────┐  ┌───▼────────────┐
│  Layer 3:       │  │  Layer 3:        │  │  Layer 3:      │
│  Services       │  │  AI Decision     │  │  Data Import   │
│  Auth, Org,     │  │  Centre          │  │  CSV / XLSX    │
│  Property       │  │  LLM + rules     │  │  validation    │
└─────────────────┘  └──────────┬──────┘  └────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  Layer 4: Forecasting  │
                    │  Engine               │
                    │  Statistical methods  │
                    │  only — no LLM        │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────▼──────────────────────┐
        │  Layer 5: Database                           │
        │  PostgreSQL 16 (primary)  Redis 7 (cache)   │
        └──────────────────────────────────────────────┘
```

---

## Layer Descriptions

### Layer 1 — Frontend (apps/web)

**Technology:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Recharts

**Responsibilities:**
- Render dashboards for performance monitoring, forecasts, and intelligence signals
- Manage authentication state (JWT tokens stored in memory/httpOnly cookies)
- Present AI recommendations and collect human approval decisions
- Handle CSV/XLSX file upload UX
- Multi-property navigation within an organisation

**Key design decisions:**
- Server components used for data-fetching pages; client components for interactive UI
- All API calls go through a typed API client layer, never raw fetch scattered across components
- No business logic in the frontend — the frontend is a display layer

### Layer 2 — API (apps/api)

**Technology:** FastAPI, Pydantic v2, python-jose (JWT), SQLAlchemy 2

**Responsibilities:**
- Authenticate and authorise every request via JWT Bearer tokens
- Route requests to the appropriate service layer
- Validate request and response shapes via Pydantic schemas
- Enforce tenant isolation: every route that accesses organisational data checks organisation membership before proceeding
- CORS policy enforcement

**Route structure:**
```
/api/v1/auth/              Auth endpoints
/api/v1/organisations/     Org management
/api/v1/organisations/{org_id}/properties/              Properties
/api/v1/organisations/{org_id}/properties/{id}/import   Data import
/api/v1/organisations/{org_id}/properties/{id}/forecasts   Forecasts
/api/v1/organisations/{org_id}/properties/{id}/recommendations  AI
/api/v1/organisations/{org_id}/intelligence/signals     Market signals
/health                    Health check
```

### Layer 3 — Services

Services are Python classes injected with a database session. They contain all business logic.

| Service | Responsibility |
|---------|---------------|
| `AuthService` | Register, login, token issuance, bcrypt password handling |
| `OrganisationService` | Create/update orgs, membership checks (`assert_member`) |
| `PropertyService` | Create/update properties, demo seeding |
| `DataImportService` | Parse CSV/XLSX, validate rows, persist to `daily_performance` |
| `RecommendationService` | DISCOVER→VERIFY→PREDICT→RECOMMEND→ACT pipeline |

### Layer 4 — Forecasting Engine

**Location:** `apps/api/wimmer/services/forecasting/engine.py`

The forecasting engine is **completely separate from the LLM**. It is a pure Python statistical module.

**Responsibilities:**
- Load validated historical data from `daily_performance`
- Select the appropriate model based on data availability
- Generate point forecasts and 95% prediction intervals
- Evaluate forecast accuracy (MAE, RMSE, WAPE) via backtesting
- Persist results to `demand_forecasts` table

**What it does not do:** The engine never calls an LLM. It never receives LLM output as input. This is a hard architectural boundary.

### Layer 5 — Database

**Primary:** PostgreSQL 16 — all persistent data

**Cache:** Redis 7 — planned for session caching and background task queues

**ORM:** SQLAlchemy 2 with Alembic migrations

---

## Key Design Decisions

### 1. Modular Monolith, Not Microservices

**Decision:** Single FastAPI application with internal module separation.

**Rationale:** At MVP stage, the team is small and the product is evolving rapidly. Microservices would add significant operational overhead (service discovery, inter-service auth, distributed tracing) with no meaningful benefit. The internal module boundaries (services, forecasting engine, AI layer) are defined clearly enough to extract individual services later if warranted.

**Future:** If the forecasting workload grows substantially, the forecasting engine can be extracted into a separate worker service consuming a task queue (Redis/Celery).

### 2. Forecasting Engine Completely Separate from LLM

**Decision:** The numerical forecasting pipeline and the LLM pipeline are architecturally isolated.

**Rationale:** Mixing LLMs with numerical forecasting is a common failure mode. LLMs are not reliable for quantitative time-series prediction — they hallucinate numbers. By keeping forecasting purely statistical, results are reproducible, explainable, and auditable. The LLM receives statistical outputs as text context and interprets them; it does not generate or modify them.

**Enforcement:** `ForecastingEngine` has no LLM dependency. `RecommendationService` calls `ForecastingEngine` first, receives a typed `ForecastResponse` object, and then passes a text summary of that response to the LLM.

### 3. LLM Interprets Validated Statistical Outputs Only

**Decision:** The LLM system prompt explicitly prohibits the LLM from inventing numerical predictions. It must cite evidence from the provided context.

**Rationale:** Prevents hallucinated forecasts from reaching the user. The LLM's role is analytical reasoning and language generation, not quantitative prediction. This distinction is fundamental to Wimmer's trustworthiness.

**Enforcement:** The recommendation system prompt includes the rule: "Never claim specific occupancy percentages, revenue figures, or ADR values unless taken directly from the provided context." Output is validated before persistence.

### 4. Multi-Tenant via organisation_id Isolation

**Decision:** Every resource table (properties, daily_performance, demand_forecasts, recommendations, market_signals) carries an `organisation_id` foreign key. The service layer enforces membership before any data access.

**Rationale:** Multi-tenancy at the service layer is the primary isolation mechanism. It is explicit, testable, and does not rely on database features that may not be available in all environments.

**Pattern:** Every API route that accesses tenant data calls `OrganisationService.assert_member(org_id, user_id)` before proceeding. This raises an HTTP 403 if the authenticated user is not a member of the requested organisation.

### 5. Row-Level Security as Defence-in-Depth (Planned)

**Decision:** PostgreSQL RLS policies are planned as a defence-in-depth layer, not the primary isolation mechanism.

**Rationale:** The service layer is the first and primary enforcement point. RLS ensures that even if a service layer bug bypasses `assert_member`, the database itself will not return cross-tenant rows. This is defence-in-depth, not the main control.

**Status:** Documented as planned. Not yet implemented in the initial schema migration. See `DATABASE_SCHEMA.md` for the planned RLS policy design.

---

## Data Flow: Request Lifecycle

The following describes the lifecycle of a forecast generation request:

```
1. User clicks "Generate Forecast" in Next.js frontend

2. Frontend sends:
   POST /api/v1/organisations/{org_id}/properties/{property_id}/forecasts
   Authorization: Bearer <access_token>
   Body: { "metric": "occupancy", "horizon_days": 90 }

3. FastAPI route handler (forecasts.py):
   a. Extracts JWT from Authorization header via CurrentUser dependency
   b. Decodes and validates token (python-jose)
   c. Loads user from database

4. Route handler calls OrganisationService.assert_member(org_id, user_id)
   - Queries organisation_members table
   - Raises HTTP 403 if no active membership found

5. Route handler calls PropertyService.get(property_id, org_id)
   - Returns 404 if property not found or belongs to a different org

6. Route handler validates metric against allowed values
   - Returns HTTP 400 if unsupported metric requested

7. ForecastingEngine.generate(property_id, metric, horizon_days):
   a. Loads validated daily_performance rows for this property
   b. Checks data availability against MIN_TRAINING_DAYS (default: 30)
   c. Selects model: seasonal_naive (≥14 days) or moving_average (<14 days)
   d. Generates predictions and 95% prediction intervals
   e. Backtests on last 14 days if ≥28 days of data available
   f. Computes MAE, RMSE, WAPE
   g. Persists results to demand_forecasts table (upsert by property+metric+date)
   h. Returns ForecastResponse

8. FastAPI serialises ForecastResponse via Pydantic to JSON

9. Frontend receives JSON, renders forecast chart with confidence intervals
```

---

## Security Architecture

Full details in `SECURITY.md`. Summary:

**Authentication:**
- JWT Bearer tokens (HS256, python-jose)
- Access tokens: 8-hour expiry
- Refresh tokens: 30-day expiry
- Passwords: bcrypt hashing via passlib

**Authorisation:**
- Role-based: `owner`, `admin`, `analyst`, `viewer`
- Organisation membership checked on every resource-scoped request
- Role checked for write operations (e.g., PATCH organisation requires owner/admin)

**Tenant Isolation:**
- `organisation_id` on all resource tables
- `assert_member` called in every service method that touches tenant data
- PostgreSQL RLS planned as defence-in-depth layer

**Audit Logs:**
- `audit_logs` table captures action, resource_type, resource_id, user_id, organisation_id, IP address, and JSONB details
- Every consequential action (recommendation approval/rejection, data import) should be logged

**LLM Security:**
- No PII sent to external LLM providers
- LLM context is limited to: property name, city, country, aggregate statistics, forecast summary
- Individual guest data, booking details, and personal information are never included
- LLM output is validated before persistence

---

## AI Decision Layer

```
DISCOVER
  │  Load recent validated daily_performance rows (last 90 days)
  ▼
VERIFY
  │  Check minimum data requirements (≥7 rows)
  │  Compute aggregate statistics (avg occupancy, ADR, RevPAR, total revenue)
  ▼
PREDICT
  │  Run ForecastingEngine for occupancy and revenue (90-day horizon)
  │  Receive typed ForecastResponse objects
  ▼
RECOMMEND
  │  Build text context from verified data and forecast summary
  │  Call LLM provider with structured system prompt
  │  Parse JSON response
  │  Validate and persist Recommendation records (status: pending)
  ▼
ACT
     Human reviews recommendation in AI Decision Centre
     Human approves or rejects via PATCH endpoint
     Status transitions: pending → approved | rejected → completed
```

---

## MCP Integration Layer

Wimmer uses the Model Context Protocol (MCP) to extend its AI capabilities with external tools.

**Current:** idealo MCP server (`https://mcp.idealo.com/mcp`) for hospitality procurement research. Configured via `.mcp.json`. Used by Claude Code during development and analysis workflows.

**Planned — Wimmer Internal MCP Server:**

An internal Wimmer MCP server is planned for Milestone 6. This server will expose Wimmer's own data and actions as MCP tools, enabling AI agents (including Claude) to query forecasts, retrieve performance data, and (with human approval) trigger actions.

Planned tools:
- `get_property_performance` — retrieve recent daily performance for a property
- `get_occupancy_forecast` — retrieve the latest occupancy forecast
- `get_revenue_forecast` — retrieve the latest revenue forecast
- `list_market_signals` — retrieve upcoming demand signals for a property
- `get_pending_recommendations` — retrieve recommendations awaiting approval

The internal MCP server will require the same JWT authentication and organisation isolation as the REST API. Write operations will be gated behind the human approval workflow. See `MCP_INTEGRATION.md` for the full design.

---

## Future Extensibility

The architecture is designed to accommodate additional vertical modules without structural change:

| Module | Location | Reuses |
|--------|----------|--------|
| Restaurant (Milestone 3) | New service, new DB tables | Auth, org/tenant isolation, forecasting engine |
| Procurement / Supply Chain (Milestone 4) | New service, idealo MCP integration | Auth, org/tenant isolation, recommendations pipeline |
| Retail (Milestone 5) | New service, new DB tables | Auth, org/tenant isolation, forecasting engine |

The forecasting engine's metric-agnostic design (`metric` parameter) means it can be adapted to daily covers, ingredient consumption, stock levels, or sales volumes with schema additions and new data import handlers.

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Recharts | Next.js 15, React 19 |
| API | FastAPI, Pydantic, SQLAlchemy | Python 3.11+, Pydantic v2 |
| Auth | python-jose (JWT), passlib (bcrypt) | — |
| Forecasting | Pandas, NumPy, Scikit-learn | — |
| AI | Configurable LLM provider (Nebius / OpenAI / Mock) | — |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Migrations | Alembic | — |
| Infrastructure | Docker, Docker Compose, GitHub Actions | — |
