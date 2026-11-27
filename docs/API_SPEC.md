# Wimmer — API Specification

## Base URL

```
http://localhost:8000/api/v1   (development)
https://api.wimmer.app/api/v1  (production, planned)
```

Interactive documentation (Swagger UI) is available at `/api/docs` when running locally.

## Authentication

All endpoints except `/auth/register`, `/auth/login`, and `/health` require a Bearer token:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via `POST /auth/login`. Access tokens expire after 8 hours. Refresh tokens expire after 30 days.

## Common Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad request — validation error or business logic violation |
| 401 | Unauthenticated — missing or invalid token |
| 403 | Forbidden — authenticated but not authorised (not an org member, or insufficient role) |
| 404 | Resource not found |
| 422 | Unprocessable entity — Pydantic validation failure (request body schema error) |
| 500 | Internal server error |

Error response body:
```json
{
  "detail": "Human-readable error message"
}
```

---

## Auth Endpoints

### POST /auth/register

Create a new user account.

**Auth required:** No

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "minlength8chars",
  "full_name": "Anna Schmidt"
}
```

**Validation:**
- `email`: valid email format
- `password`: minimum 8 characters
- `full_name`: non-empty string

**Response: 201 Created**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Anna Schmidt",
  "is_active": true,
  "is_verified": false
}
```

**Errors:**
- `400` — email already registered

---

### POST /auth/login

Authenticate and receive tokens.

**Auth required:** No

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response: 200 OK**
```json
{
  "access_token": "<JWT>",
  "refresh_token": "<JWT>",
  "token_type": "bearer"
}
```

**Errors:**
- `401` — invalid credentials

---

### GET /auth/me

Return the authenticated user's profile.

**Auth required:** Yes

**Response: 200 OK**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Anna Schmidt",
  "is_active": true,
  "is_verified": false
}
```

---

## Organisation Endpoints

### POST /organisations

Create a new organisation. The creating user is automatically assigned the `owner` role. Demo properties are automatically seeded.

**Auth required:** Yes

**Request body:**
```json
{
  "name": "Grand Hotel Group",
  "slug": "grand-hotel-group",
  "description": "Optional description"
}
```

**Validation:**
- `slug`: lowercase letters, numbers, hyphens only (`^[a-z0-9-]+$`)

**Response: 201 Created**
```json
{
  "id": "uuid",
  "name": "Grand Hotel Group",
  "slug": "grand-hotel-group",
  "description": "Optional description",
  "subscription_tier": "trial",
  "is_active": true,
  "max_properties": 5
}
```

**Errors:**
- `400` — slug already taken

---

### GET /organisations

List all organisations the authenticated user is a member of.

**Auth required:** Yes

**Response: 200 OK** — Array of organisation objects (same schema as POST response)

---

### GET /organisations/{org_id}

Get a single organisation by ID.

**Auth required:** Yes — must be a member of the organisation

**Path parameters:**
- `org_id` — UUID

**Response: 200 OK** — Organisation object

**Errors:**
- `403` — not a member
- `404` — organisation not found

---

### PATCH /organisations/{org_id}

Update organisation details.

**Auth required:** Yes — must have role `owner` or `admin`

**Path parameters:**
- `org_id` — UUID

**Request body (all fields optional):**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response: 200 OK** — Updated organisation object

**Errors:**
- `403` — not a member, or insufficient role

---

## Property Endpoints

All property endpoints are scoped to an organisation: `/organisations/{org_id}/properties/...`

### POST /organisations/{org_id}/properties

Create a new property within an organisation.

**Auth required:** Yes — must be a member of the organisation

**Path parameters:**
- `org_id` — UUID

**Request body:**
```json
{
  "name": "Hotel Zentralpark Berlin",
  "slug": "hotel-zentralpark-berlin",
  "property_type": "hotel",
  "address": "Kurfürstendamm 42, 10707 Berlin",
  "city": "Berlin",
  "country": "DE",
  "latitude": 52.5027,
  "longitude": 13.3321,
  "total_rooms": 142,
  "stars": 4,
  "timezone": "Europe/Berlin"
}
```

**Defaults:** `property_type = "hotel"`, `country = "DE"`, `timezone = "Europe/Berlin"`, `total_rooms = 0`

**Response: 201 Created**
```json
{
  "id": "uuid",
  "organisation_id": "uuid",
  "name": "Hotel Zentralpark Berlin",
  "slug": "hotel-zentralpark-berlin",
  "property_type": "hotel",
  "address": "Kurfürstendamm 42, 10707 Berlin",
  "city": "Berlin",
  "country": "DE",
  "latitude": 52.5027,
  "longitude": 13.3321,
  "total_rooms": 142,
  "stars": 4,
  "is_active": true,
  "is_demo": false,
  "timezone": "Europe/Berlin"
}
```

**Errors:**
- `400` — max_properties limit reached for subscription tier
- `403` — not a member

---

### GET /organisations/{org_id}/properties

List all properties for an organisation.

**Auth required:** Yes — must be a member

**Response: 200 OK** — Array of property objects

---

### GET /organisations/{org_id}/properties/{property_id}

Get a single property.

**Auth required:** Yes — must be a member

**Response: 200 OK** — Property object

**Errors:**
- `404` — property not found or not in this organisation

---

### PATCH /organisations/{org_id}/properties/{property_id}

Update property details.

**Auth required:** Yes — must be a member

**Request body (all fields optional):**
```json
{
  "name": "Updated Hotel Name",
  "address": "New address",
  "city": "Hamburg",
  "total_rooms": 180,
  "stars": 5
}
```

**Response: 200 OK** — Updated property object

---

### POST /organisations/{org_id}/properties/{property_id}/import

Import hotel performance data from a CSV or Excel file.

**Auth required:** Yes — must be a member

**Request:** Multipart form upload. Field name: `file`.

**Accepted formats:** `.csv`, `.xlsx`, `.xls`

**Maximum file size:** 50 MB

**Required CSV columns:**
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

**Response: 200 OK**
```json
{
  "total_rows": 90,
  "imported": 87,
  "skipped": 2,
  "errors": ["Row 14: rooms_sold (155) exceeds rooms_available (142)"],
  "warnings": ["Row 22: adr is 0, occupancy > 0 — check data"]
}
```

**Errors:**
- `400` — unsupported file type or file too large

---

## Forecast Endpoints

### POST /organisations/{org_id}/properties/{property_id}/forecasts

Generate a statistical forecast for a property metric.

**Auth required:** Yes — must be a member

**Path parameters:**
- `org_id` — UUID
- `property_id` — UUID

**Request body:**
```json
{
  "metric": "occupancy",
  "horizon_days": 90,
  "model": "auto"
}
```

**Metric options:**
| Metric | Description | Unit |
|--------|-------------|------|
| `occupancy` | Occupancy rate | Decimal 0–1 |
| `revenue` | Total room revenue | Currency (€) |
| `adr` | Average Daily Rate | Currency (€) |
| `revpar` | Revenue Per Available Room | Currency (€) |
| `rooms_sold` | Rooms sold | Integer |

**Defaults:** `metric = "occupancy"`, `horizon_days = 90`, `model = "auto"`

**Model selection (`model: "auto"`):**
- `seasonal_naive` — used when ≥14 days of validated data are available
- `moving_average` — used when <14 days of validated data are available
- `insufficient_data` — returned when <30 days of validated data are available (no forecast points generated)

**Response: 200 OK**
```json
{
  "property_id": "uuid",
  "metric": "occupancy",
  "model_name": "seasonal_naive",
  "forecast_date": "2026-11-27",
  "horizon_days": 90,
  "points": [
    {
      "date": "2026-11-28",
      "predicted_value": 0.7421,
      "lower_bound": 0.6802,
      "upper_bound": 0.8040,
      "confidence_level": 0.95
    }
  ],
  "mae": 0.0423,
  "rmse": 0.0561,
  "wape": 0.0538,
  "training_data_days": 92
}
```

**When `model_name = "insufficient_data"`:**
```json
{
  "property_id": "uuid",
  "metric": "occupancy",
  "model_name": "insufficient_data",
  "forecast_date": "2026-11-27",
  "horizon_days": 90,
  "points": [],
  "training_data_days": 12
}
```

**Notes:**
- `mae`, `rmse`, `wape` are null if fewer than 28 days of data were available for backtesting
- Results are persisted to the `demand_forecasts` table (previous forecast for the same property/metric/date is replaced)
- Prediction intervals use 1.96 × historical standard deviation (approximate 95% interval)

**Errors:**
- `400` — unsupported metric
- `404` — property not found

---

## Recommendation Endpoints

### POST /organisations/{org_id}/properties/{property_id}/recommendations

Generate AI recommendations for a property. Triggers the full DISCOVER → VERIFY → PREDICT → RECOMMEND pipeline.

**Auth required:** Yes — must be a member

**Request body:** Empty (`{}` or omit)

**Response: 201 Created** — Array of recommendation objects

```json
[
  {
    "id": "uuid",
    "property_id": "uuid",
    "organisation_id": "uuid",
    "title": "Adjust pricing for high-demand weekend ahead",
    "description": "Forecast data indicates elevated occupancy...",
    "category": "revenue",
    "suggested_action": "Review and adjust room rates for the identified window...",
    "expected_impact_description": "Potential uplift in RevPAR through improved price positioning",
    "expected_revenue_impact": 4800.00,
    "expected_occupancy_impact": 0.03,
    "confidence_score": 0.72,
    "risk_level": "low",
    "status": "pending",
    "evidence": {
      "summary": "Seasonal naive forecast shows occupancy above 85%...",
      "data_points": 87,
      "forecast_model": "seasonal_naive"
    },
    "created_at": "2026-11-27T10:00:00Z"
  }
]
```

**Returns:** Empty array `[]` if fewer than 7 days of validated data are available, or if the LLM call fails.

**Category values:** `revenue`, `operations`, `staffing`, `procurement`, `marketing`

**Risk level values:** `low`, `medium`, `high`

---

### GET /organisations/{org_id}/properties/{property_id}/recommendations

List all recommendations for a property, ordered by most recent first.

**Auth required:** Yes — must be a member

**Response: 200 OK** — Array of recommendation objects (same schema as POST response)

---

### PATCH /organisations/{org_id}/properties/{property_id}/recommendations/{recommendation_id}

Approve or reject a pending recommendation.

**Auth required:** Yes — must be a member

**Path parameters:** `org_id`, `property_id`, `recommendation_id` — all UUIDs

**Request body:**
```json
{
  "status": "approved",
  "notes": "Agreed — pricing team to action by Friday"
}
```

**Status values:**
| Value | Meaning |
|-------|---------|
| `approved` | Recommendation accepted by the reviewer |
| `rejected` | Recommendation declined by the reviewer |

**Notes field:** Optional free-text from the reviewer.

**Response: 200 OK** — Updated recommendation object with `status`, `approved_by_id`, and `approval_notes` populated.

**Errors:**
- `400` — recommendation is not in `pending` status (cannot re-approve or re-reject)
- `400` — invalid status value (must be `approved` or `rejected`)
- `404` — recommendation not found

---

## Intelligence Endpoints

### GET /organisations/{org_id}/intelligence/signals

Retrieve upcoming demand signals and seasonal intelligence for the organisation's location context.

**Auth required:** Yes — must be a member

**Response: 200 OK** — Array of signal objects, ordered by date ascending

```json
[
  {
    "id": "holiday-2025-12-25",
    "signal_type": "public_holiday",
    "signal_date": "2025-12-25",
    "title": "1. Weihnachtstag",
    "description": "German public holiday. Expected positive demand impact.",
    "impact_level": "high",
    "impact_direction": "positive",
    "source": "German Federal Holiday Calendar",
    "is_demo": true
  },
  {
    "id": "seasonal-12-2025",
    "signal_type": "seasonal_event",
    "signal_date": "2025-12-01",
    "title": "Christmas Market Season",
    "description": "Major tourism driver across German cities...",
    "impact_level": "high",
    "impact_direction": "positive",
    "source": "Wimmer Seasonal Intelligence (Demo)",
    "is_demo": true
  }
]
```

**Signal type values:** `public_holiday`, `seasonal_event`, `seasonal_trend`, `local_event`

**Impact level values:** `low`, `medium`, `high`

**Impact direction values:** `positive`, `negative`, `neutral`

**Coverage:** Returns signals from 30 days in the past through 180 days in the future. MVP uses hardcoded German public holidays and seasonal patterns. Milestone 2 will integrate Open-Meteo and a live German holiday API.

---

## Health Endpoint

### GET /health

Health check endpoint. No authentication required.

**Response: 200 OK**
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "environment": "development"
}
```

**Notes:** This endpoint does not check database connectivity in the MVP. A production-grade health check should verify database, Redis, and any external service dependencies.

---

## Request / Response Conventions

- All request and response bodies are JSON
- Dates are ISO 8601 format: `YYYY-MM-DD`
- Timestamps are ISO 8601 with UTC timezone: `2026-11-27T10:00:00Z`
- Monetary values are decimal numbers, not strings: `4800.00`
- Occupancy rates are decimal fractions (0–1), not percentages: `0.7421` = 74.21%
- UUIDs are lowercase strings with hyphens: `"3fa85f64-5717-4562-b3fc-2c963f66afa6"`
