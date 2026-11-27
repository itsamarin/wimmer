# Wimmer — Product Specification

## Product Identity

**Name:** Wimmer

**Tagline:** Intelligence Beyond Seasons.

**One-line description:** Wimmer is an AI-powered seasonal business intelligence and decision platform that helps operators in hospitality, food service, supply chain, and retail anticipate demand, optimise commercial performance, and make better business decisions throughout the year.

**Positioning:** Wimmer is not another reporting tool. It is the intelligence layer that sits above your existing operational systems and translates fragmented data into forecasts, signals, and evidence-backed recommendations — all reviewed and acted upon by humans.

---

## Target Market

### Initial: Hospitality

**Ideal Customer Profile (ICP) — MVP:**

- Independent or small-group hotel operators (1–10 properties)
- 50–300 rooms per property
- Primarily Germany, Austria, and other German-speaking markets (initial focus)
- Currently managing revenue and operations without a dedicated revenue manager or expensive RMS subscription
- Revenue responsibility sits with the GM or owner-operator
- Willing to upload CSV performance data; not yet ready for direct PMS integration

**Who Wimmer is NOT for (MVP):**

- Large hotel chains with dedicated revenue management teams and existing RMS
- OTA-dependent hotels with no interest in internal data analysis
- Hotels with no historical performance data

### Multi-Industry Vision

Wimmer is built on a universal platform. The same forecasting engine, AI recommendation system, and human approval workflow that serves hotel operators can be adapted for:

| Industry | Metric | Decision |
|----------|--------|---------|
| Hotel / Hospitality | Occupancy, ADR, RevPAR | Rate strategy, staffing, procurement |
| Restaurant | Daily covers, food cost | Prep quantities, staffing, supplier orders |
| Warehouse / Supply Chain | Consumption rate, stock level | Reorder timing, quantities, supplier selection |
| Retail | Sales units, sell-through | Replenishment, markdown timing, range planning |

The vertical expansion is sequenced: hospitality is validated first, then restaurant, then supply chain, then retail. Each vertical reuses the platform while adding domain-specific data models and recommendation logic.

---

## Product Modules

### 1. Wimmer Intelligence

**Purpose:** Surface upcoming demand signals so operators can anticipate, not react.

**Capabilities:**
- Upcoming public holiday feed with impact level and direction (German holidays, expanding to other markets)
- Seasonal event signals: Oktoberfest, Christmas market season, summer peaks, school holiday periods
- Market signal timeline: 180-day forward view of known demand drivers
- Each signal includes: date, title, description, impact level (low/medium/high), impact direction (positive/negative/neutral), source

**Future capabilities (Milestone 2+):**
- Live weather forecast integration (Open-Meteo) — temperature and precipitation as demand signals
- Local event signals (concerts, trade fairs, sports events)
- Property-specific signal tuning based on historical correlation with demand

**Value proposition:** An operator looking at the signal feed for the next 90 days can immediately identify demand spikes and troughs, and begin planning proactively.

---

### 2. Wimmer Forecast

**Purpose:** Quantitative prediction of key performance metrics with explicit uncertainty ranges.

**Supported metrics:**
- Occupancy rate (0–100%)
- Room revenue (€)
- Average Daily Rate / ADR (€/room)
- Revenue Per Available Room / RevPAR (€/room)
- Rooms sold (count)

**Capabilities:**
- 90-day forward forecast for any supported metric
- Automatic model selection based on data availability
- 95% prediction intervals (confidence bands) on every forecast
- Backtest accuracy metrics: MAE, RMSE, WAPE (displayed with every forecast)
- Model transparency: forecast always shows the model name and training data days used
- Forecast persistence: results stored and queryable by date

**Current models:**
- Seasonal naïve (7-day seasonality) — primary model for ≥14 days of data
- Moving average (28-day window) — fallback for <14 days of data

**Future models (Milestone 2):**
- LightGBM for properties with ≥180 days of data, incorporating weather and calendar features

**What forecasting is NOT:** Wimmer's forecasting engine never uses an LLM to generate numbers. All predictions are statistical, traceable, and reproducible.

---

### 3. Wimmer Revenue

**Purpose:** Monitor and analyse financial performance of properties.

**Capabilities:**
- Daily performance dashboard: occupancy, ADR, RevPAR, room revenue, cancellations, new bookings
- Trend visualisation over selectable date ranges
- Multi-property comparison (Milestone 2)
- Year-over-year comparison (Milestone 2)

**Data input:**
- CSV or Excel file upload (daily performance data)
- Required columns: date, rooms_available
- Optional columns: rooms_sold, room_revenue, adr, revpar, cancellations, new_bookings
- Import validation with detailed error/warning reporting
- Download CSV template from `/infrastructure/scripts/import_template.csv`

---

### 4. Wimmer Operations

**Purpose:** Translate demand forecasts into operational decisions for staffing and procurement.

**MVP scope:**
- Staffing recommendations included in AI Decision Centre recommendations (`category: staffing`)
- Procurement guidance included in AI Decision Centre recommendations (`category: procurement`)

**Milestone 3+ scope:**
- Restaurant module: covers forecasting, F&B demand planning, prep list generation
- Procurement module: reorder point calculation, procurement timing recommendations
- Supplier research via idealo MCP integration

---

### 5. Wimmer AI Decision Centre

**Purpose:** Transform validated data and forecasts into specific, evidence-backed commercial recommendations, reviewed and approved by humans.

**Pipeline:** DISCOVER → VERIFY → PREDICT → RECOMMEND → ACT

**Capabilities:**
- One-click recommendation generation for any property
- Each recommendation includes: title, full analysis, specific suggested action, expected impact (revenue and occupancy), confidence score, risk level
- Evidence is stored with every recommendation (data points used, forecast model, evidence summary)
- LLM reasoning text accessible for transparency
- Human approval workflow: pending → approved / rejected
- Reviewer notes stored with every decision
- Recommendation categories: revenue, operations, staffing, procurement, marketing

**Human-in-the-loop design:**
- No recommendation is automatically executed
- Every recommendation requires explicit human approval before the team acts on it
- Approval records: who approved, when, with what notes

**AI provider flexibility:**
- Mock provider for development (deterministic, no API cost)
- Nebius AI (Llama 3.1 70B) for cost-effective production deployment
- OpenAI (GPT-4o Mini) as an alternative

**What the AI never does:**
- Generate or modify numerical forecasts
- Automatically change room rates, prices, or operational parameters
- Access guest personal data, booking details, or payment information
- Cross-tenant data access of any kind

---

## Non-Goals

Wimmer is not, and does not intend to become:

| What | Why |
|------|-----|
| A Property Management System (PMS) | There are established PMS providers. Wimmer connects to them. |
| A Revenue Management System (RMS) | Wimmer provides intelligence; operators still set rates in their channel manager or PMS. |
| A Booking Engine | Wimmer does not handle customer-facing reservations. |
| A Channel Manager | Wimmer does not manage OTA rate parity or distribution. |
| A Point-of-Sale System | Wimmer receives data from POS; it does not replace it. |
| A Warehouse Management System (WMS) | Wimmer receives data from WMS; it does not replace it. |

---

## Competitive Differentiation

| Capability | Wimmer | Traditional RMS | BI Tools | Spreadsheets |
|-----------|--------|----------------|----------|-------------|
| Statistical forecasting | Yes | Yes | Limited | Manual |
| AI recommendations with approval | Yes | No | No | No |
| Multi-industry (hotel + restaurant + retail) | Yes (roadmap) | No | Partially | Manual |
| Evidence-based AI transparency | Yes | No | N/A | N/A |
| Human approval workflow | Yes | No | N/A | N/A |
| Affordable for independent operators | Yes | No (€500–2k/month) | Varies | Free (but costly in time) |
| No PMS integration required | Yes | Usually required | Usually required | N/A |
| Seasonal signal feed | Yes | Partial | No | No |
| MCP / AI agent ready (roadmap) | Yes | No | No | No |

**Core differentiators:**

1. **Evidence-backed AI:** Every recommendation cites specific data. The LLM cannot invent numbers. This is a trust and reliability differentiator.

2. **Human approval workflow:** AI handles the analysis; humans handle the decisions. This is not a limitation — it is what operators want.

3. **Forecasting transparency:** The forecast always shows what model was used, how much data it was trained on, and what the backtest accuracy was. No black-box numbers.

4. **Affordable for independent operators:** No enterprise pricing, no long-term contracts, no requirement for a dedicated revenue manager to operate it.

5. **Multi-industry roadmap:** The platform architecture generalises across industries. As the product matures, operators in adjacent industries (restaurant, retail) can use the same interface and workflow.
