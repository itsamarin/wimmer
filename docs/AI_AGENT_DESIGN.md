# Wimmer — AI Agent Design

## Overview

Wimmer's AI layer is designed around a single, non-negotiable principle: **the LLM interprets validated statistical outputs, it never generates them.** The AI Decision Centre is not an autonomous agent. It is a human-in-the-loop advisory system that generates evidence-backed recommendations requiring explicit human approval before any action is taken.

The pipeline is named DISCOVER → VERIFY → PREDICT → RECOMMEND → ACT.

---

## Pipeline: DISCOVER → VERIFY → PREDICT → RECOMMEND → ACT

### Stage 1: DISCOVER

**Purpose:** Gather the recent historical performance record for the property.

**Implementation:** `RecommendationService.generate_for_property()` queries `daily_performance` for all validated rows from the last 90 days for the given property.

**What is gathered:**
- All rows where `is_validated = true` and `date >= today - 90 days`
- Ordered by date ascending

**Output:** A list of validated `DailyPerformance` ORM objects.

**Edge case:** If fewer than 7 validated rows exist, the pipeline returns an empty list immediately with a warning log. The minimum threshold (7 days) is a hardcoded constant representing the minimum required to say anything meaningful about recent performance.

---

### Stage 2: VERIFY

**Purpose:** Check data quality and compute aggregate statistics for the LLM context.

**Implementation:** In-memory aggregation over the DISCOVER results.

**Computed statistics:**
- Average occupancy rate (decimal)
- Average ADR (€)
- Average RevPAR (€)
- Total room revenue (€)
- Number of data points

**What is verified:**
- Minimum data threshold: ≥7 rows required to proceed
- Data quality issues (zero ADR with positive occupancy, etc.) are flagged during import by `DataImportService`, not at this stage

**Output:** Aggregate statistics passed as text context to the LLM.

**Key invariant:** The verified statistics are computed from `is_validated = true` rows only. The import process sets `is_validated = true` only for rows that pass the import validation checks. This ensures the LLM never receives unvalidated data as evidence.

---

### Stage 3: PREDICT

**Purpose:** Generate statistical forecasts to inform the LLM's recommendations.

**Implementation:** Calls `ForecastingEngine.generate()` twice — once for `occupancy` metric, once for `revenue` metric. Both run with a 90-day horizon.

**Output:** Two `ForecastResponse` objects. A text summary is built from these:

```
30-day average predicted occupancy: 74.2%
(model: seasonal_naive, WAPE: 0.0538)
Forecast horizon: 90 days.
```

**Separation principle:** The forecasting engine is called here as a pure function and its output is converted to a text string before being passed to the LLM. The LLM never receives the raw forecast data structure — it receives a human-readable summary. This prevents the LLM from reasoning about forecast uncertainty in ways that could be misleading.

If the forecast returns `model_name = "insufficient_data"`, the summary is: "Insufficient historical data for statistical forecast." The LLM must handle this gracefully (the system prompt instructs it not to invent numbers when data is unavailable).

---

### Stage 4: RECOMMEND

**Purpose:** Generate commercially actionable, evidence-backed recommendations using an LLM.

**Implementation:** Builds a structured text prompt combining VERIFY outputs and PREDICT outputs, sends to the configured LLM provider, parses the structured JSON response, and persists recommendations.

#### System Prompt Design

The system prompt establishes the LLM's role and hard constraints:

```
You are Wimmer Intelligence, an expert hospitality revenue and operations analyst.

RULES:
- Base ALL recommendations on the validated data and forecast figures provided.
  Never invent data.
- Never claim specific occupancy percentages, revenue figures, or ADR values
  unless taken directly from the provided context.
- Each recommendation must cite specific evidence from the data.
- Distinguish between statistical forecast uncertainty and business risk.
- Recommendations must be commercially actionable, not generic.
- Do not recommend automatic price changes without human approval.
- Output valid JSON only.
```

#### User Prompt Structure

```
Property: {name} ({city}, {country})
Hotel type: {property_type}, {total_rooms} rooms, {stars} stars.
Analysis date: {today}

HISTORICAL PERFORMANCE (last {N} days):
- Average occupancy: {avg_occupancy}%
- Average ADR: €{avg_adr}
- Average RevPAR: €{avg_revpar}
- Total room revenue: €{total_revenue}

STATISTICAL FORECAST:
{forecast_summary}

Generate 2–4 specific, evidence-backed commercial recommendations for this property.
Only recommend actions that are directly supported by the data above.
```

**What is NOT included in the prompt:**
- Individual guest data
- Booking details
- Personal names
- Email addresses or contact information
- Payment information

#### Expected JSON Response Schema

```json
{
  "recommendations": [
    {
      "title": "string (max 80 chars)",
      "description": "string — detailed analysis paragraph",
      "category": "revenue|operations|staffing|procurement|marketing",
      "suggested_action": "string — specific, actionable instruction",
      "expected_impact_description": "string — natural language impact",
      "expected_revenue_impact": number_or_null,
      "expected_occupancy_impact": number_or_null,
      "confidence_score": number_0_to_1,
      "risk_level": "low|medium|high",
      "evidence_summary": "string — cite specific data points from context"
    }
  ],
  "reasoning": "string — overall analytical reasoning for this set of recommendations"
}
```

**Output validation:** The JSON is parsed with `json.loads()`. If parsing fails, an error is logged and an empty list is returned. Individual recommendation fields are accessed with `.get()` with defaults, so a partially malformed response does not crash the pipeline.

**Number of recommendations:** The prompt requests 2–4 recommendations. The system does not enforce this limit beyond the prompt instruction.

---

### Stage 5: ACT

**Purpose:** Persist recommendations with `status = "pending"` and present them to the user for approval.

**What is persisted per recommendation:**
- All LLM-generated fields (title, description, category, suggested_action, etc.)
- `evidence` JSONB: summary string, data_points count, forecast model name used
- `forecast_references` JSONB: array of forecast_date strings
- `llm_reasoning`: the full top-level reasoning string from the LLM response
- `status = "pending"`

**Human approval step:**

The user reviews recommendations in the AI Decision Centre and calls:
```
PATCH /organisations/{org_id}/properties/{property_id}/recommendations/{recommendation_id}
{
  "status": "approved" | "rejected",
  "notes": "Optional reviewer notes"
}
```

Status transitions:

```
pending ──► approved ──► (completed — future feature, manual action required)
       └──► rejected
```

No action is taken automatically on approval. Approval records the reviewer's decision and stores their notes. In future milestones, approval may trigger downstream actions (rate update suggestions, procurement requests) but these will always require a final human confirmation.

---

## Confidence and Uncertainty

Wimmer distinguishes two separate forms of uncertainty:

### 1. Statistical Forecast Uncertainty

This is quantified by the forecasting engine and represents the range of likely outcomes based on historical variance.

- **Expressed as:** prediction intervals (lower_bound, upper_bound) in `demand_forecasts`
- **Computed as:** ±1.96 × historical standard deviation (approximate 95% interval)
- **Evaluated by:** backtest metrics — MAE (mean absolute error), RMSE (root mean squared error), WAPE (weighted absolute percentage error)
- **Meaning:** "Based on the statistical pattern in historical data, the true value is likely to fall within this range 95% of the time under stable conditions."

This is an objective, reproducible statistical statement about the model's historical performance.

### 2. LLM Reasoning Confidence

This is the LLM's self-reported confidence in its recommendation.

- **Expressed as:** `confidence_score` (0.0–1.0) in the recommendation
- **Computed by:** the LLM, based on how well the available evidence supports the recommendation
- **Meaning:** "Given the evidence provided, this recommendation is supported to this degree."

This is a subjective assessment and should be treated as an indicator, not a precise probability. High confidence does not mean the action will produce the expected outcome — it means the evidence strongly supports taking the action.

**How these interact:** The LLM receives the WAPE figure in its context. This allows it to factor model accuracy into its confidence scoring (a recommendation based on a forecast with WAPE=0.40 should have lower confidence than one based on WAPE=0.05).

---

## Evidence Management

Each recommendation stores an `evidence` JSONB object:

```json
{
  "summary": "LLM-generated citation of data points from context",
  "data_points": 87,
  "forecast_model": "seasonal_naive"
}
```

This provides a lightweight audit trail connecting each recommendation to:
- The number of historical data points that informed it
- The forecast model that generated the predictions
- A natural language summary of which specific data supported the recommendation

Future evidence enrichment (Milestone 2+):
- Include specific date ranges of historical data used
- Include WAPE and backtest period
- Include market signal IDs that influenced the recommendation

---

## LLM Provider Abstraction

The LLM provider is configured via the `LLM_PROVIDER` environment variable. The abstraction layer (`llm_provider.py`) exposes a single interface:

```python
class LLMProvider(ABC):
    def complete(self, system: str, user: str, response_schema: dict | None = None) -> str:
        ...
```

**Available providers:**

| Provider | Config value | Use case |
|----------|-------------|----------|
| `MockLLMProvider` | `mock` | Development and testing. Returns deterministic structured JSON. No API calls. |
| `NebiusLLMProvider` | `nebius` | Nebius AI platform. Uses OpenAI-compatible SDK. Model: `meta-llama/Meta-Llama-3.1-70B-Instruct`. |
| `OpenAILLMProvider` | `openai` | OpenAI API. Model: `gpt-4o-mini` (default, configurable). |

**Selection logic:**
1. If `LLM_PROVIDER=nebius` and `NEBIUS_API_KEY` is set → use Nebius
2. If `LLM_PROVIDER=openai` and `OPENAI_API_KEY` is set → use OpenAI
3. Otherwise → fall back to Mock

**Parameters:** All providers use `temperature=0.3` and `max_tokens=2048`. Lower temperature reduces hallucination and produces more consistent structured output.

---

## Human Approval Workflow

```
                     ┌─────────────────────────────────────┐
                     │  POST /recommendations               │
                     │  Trigger: user clicks "Generate"     │
                     └─────────────────┬───────────────────┘
                                       │
                     ┌─────────────────▼───────────────────┐
                     │  DISCOVER → VERIFY → PREDICT         │
                     │  → RECOMMEND pipeline runs           │
                     └─────────────────┬───────────────────┘
                                       │
                     ┌─────────────────▼───────────────────┐
                     │  status: "pending"                   │
                     │  Recommendation stored in DB        │
                     └─────────────────┬───────────────────┘
                                       │
                     ┌─────────────────▼───────────────────┐
                     │  User reviews in AI Decision Centre │
                     │  Reads evidence, reasoning, impact  │
                     └────────────┬──────────────┬─────────┘
                                  │              │
                    ┌─────────────▼──┐  ┌────────▼────────┐
                    │ APPROVE        │  │ REJECT           │
                    │ + optional     │  │ + optional notes │
                    │   notes        │  └─────────────────┘
                    └───────────────┘
```

The approval decision is recorded with:
- `status`: approved or rejected
- `approved_by_id`: UUID of the reviewing user
- `approval_notes`: optional free-text notes
- `updated_at`: timestamp of the decision

**Who can approve?** Any member of the organisation (viewer through owner). In a future release, approval may be restricted to `analyst`, `admin`, or `owner` roles.

**What happens after approval?** In the MVP, approval is a recording decision only. No automated action is triggered. The recommendation becomes a task for the appropriate team member to execute manually.

---

## Audit Trail

The `audit_logs` table captures all consequential actions. The recommendation approval flow should log:

```json
{
  "action": "recommendation.approved",
  "resource_type": "recommendation",
  "resource_id": "<recommendation_uuid>",
  "details": {
    "status": "approved",
    "notes": "Pricing team to action by Friday",
    "property_id": "<property_uuid>"
  }
}
```

**Current state:** Audit logging is defined in the schema but not yet wired into the service layer. This is a known MVP gap to be addressed in Milestone 2.

---

## Security: What the LLM Never Sees

The following data is never included in LLM prompts:

| Data type | Reason excluded |
|-----------|----------------|
| Guest names | PII |
| Guest email/phone | PII |
| Booking references | PII / commercially sensitive |
| Individual room allocations | PII |
| Payment data | Regulated data |
| Staff personal details | PII |
| Other tenants' data | Tenant isolation |

The LLM context contains only: property name, city, country, aggregate statistics (averages, totals), and forecast summaries. No row-level detail. No personal identifiers.

LLM output is treated as untrusted input: it is parsed, validated against the expected schema, and stored. It is never executed as code or used to modify data directly.

---

## Future: Tool-Calling and Multi-Step Agent Workflows

The current system is a single-turn, single-call pipeline. Future evolution will introduce:

**Milestone 4–5: Tool-calling**

The LLM will be able to call tools such as:
- `get_property_performance(property_id, days)` — retrieve recent data
- `get_competitor_pricing()` — retrieve market rate signals
- `get_weather_forecast(location, days)` — retrieve weather signals

Tool calls will be mediated through the Wimmer internal MCP server (Milestone 6), ensuring all tool calls are authenticated and tenant-scoped.

**Milestone 6: Multi-step agent workflows**

For complex decision scenarios (e.g., procurement planning for a seasonal peak), the system will support multi-turn agent workflows where the LLM can iteratively gather evidence before generating a recommendation. All intermediate steps will be persisted for auditability.

**Invariant that never changes:** Human approval is required before any action is taken in the real world. The AI is advisory. The human decides.
