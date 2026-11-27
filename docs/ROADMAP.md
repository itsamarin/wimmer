# Wimmer — Product Roadmap

## Roadmap Philosophy

Wimmer is built in vertical slices: each milestone delivers real, usable value to a specific user before moving to the next. We do not build infrastructure speculatively. We do not add complexity until the simpler version has been validated with real users.

The sequence of industries (hospitality → restaurant → supply chain → retail) is intentional: each vertical reuses the same core platform (auth, organisations, properties, forecasting engine, AI recommendations) while adding domain-specific modules.

---

## Milestone 1 — MVP: Foundation (Current)

**Goal:** A working end-to-end system that a hotel operator can use to upload their data, see forecasts, and receive AI-generated recommendations with an approval workflow.

**Status:** In development

### Delivered

**Infrastructure and platform:**
- Next.js 15 + FastAPI application with Docker Compose local development
- PostgreSQL 16 with Alembic migrations
- JWT authentication (register, login, refresh)
- Multi-tenant organisation model with role-based access (owner, admin, analyst, viewer)
- Multi-property management within organisations

**Data:**
- CSV and Excel import for hotel daily performance data
- Row-level validation with detailed import result reporting
- Demo property seeding on organisation creation
- Download template CSV (`infrastructure/scripts/import_template.csv`)

**Forecasting:**
- Statistical forecasting engine (seasonal naïve with 7-day seasonality, moving average)
- Automatic model selection based on data availability
- 95% prediction intervals (1.96 × std)
- Backtest evaluation: MAE, RMSE, WAPE (last 14-day holdout)
- Support for 5 metrics: occupancy, revenue, ADR, RevPAR, rooms_sold
- Forecast persistence to database

**AI Decision Centre:**
- DISCOVER → VERIFY → PREDICT → RECOMMEND → ACT pipeline
- LLM provider abstraction (Nebius AI, OpenAI, Mock)
- Structured JSON prompt/response design
- Human approval workflow (pending → approved / rejected)
- Evidence stored with every recommendation

**Intelligence:**
- Seasonal signals and German public holidays (hardcoded demo data)
- 180-day forward lookahead

**Dashboard:**
- Performance monitoring (occupancy, ADR, RevPAR trends)
- Forecast visualisation with confidence intervals
- AI recommendations with approval UI

---

## Milestone 2 — Real Data Integrations and Forecasting Improvements

**Goal:** Replace demo data with live external signals. Improve forecast accuracy for properties with sufficient history. Close MVP security gaps.

### Planned features

**External data integrations:**
- Open-Meteo weather API integration (temperature, precipitation, 7-day forecast)
- German public holidays API (live, replacing hardcoded data)
- School holiday calendar (German state-level, Ferien API or equivalent)
- Market signals storage in `market_signals` table (replacing in-memory demo data)

**Forecasting:**
- LightGBM model for properties with ≥180 days of validated data
- Feature engineering: day-of-week, month, public holiday flags, weather features, lag features
- Walk-forward cross-validation for LightGBM accuracy evaluation
- Forecast accuracy dashboard (track forecast vs. actuals over time)

**Multi-property analysis:**
- Portfolio comparison view (compare occupancy, ADR, RevPAR across all properties)
- Portfolio-level aggregated forecast

**Revenue module:**
- Room revenue trend analysis and YoY comparison
- Revenue by channel (manual input initially)
- Cancellation rate trend analysis

**Security improvements:**
- Audit logging wired into all service methods
- Email verification for new accounts
- Rate limiting on authentication endpoints
- Refresh token rotation
- PostgreSQL RLS implementation
- Restrict recommendation approval to analyst/admin/owner roles

---

## Milestone 3 — Restaurant Module

**Goal:** Extend Wimmer to restaurant operators with daily covers forecasting, F&B demand planning, and staffing recommendations.

### Planned features

**Restaurant data model:**
- New `restaurant_performance` table: daily_covers, revenue_per_cover, food_cost, beverage_cost, staff_hours
- Restaurant property type (`property_type = "restaurant"`)
- Menu and covers import template

**Covers forecasting:**
- Covers forecasting using the same forecasting engine (metric: `covers`)
- Day-of-week and holiday patterns as primary signals
- Confidence intervals for staffing planning

**F&B demand planning:**
- Ingredient demand forecasting based on predicted covers and menu mix
- Waste reduction tracking
- Prep list generation based on forecast

**Staffing recommendations:**
- Front-of-house and kitchen staffing recommendations based on covers forecast
- Shift planning guidance for peak and off-peak periods
- Labour cost optimisation recommendations

**AI Decision Centre for restaurants:**
- Restaurant-specific recommendation categories (food_waste, staffing, menu_pricing, supplier)
- Same approval workflow as hotel recommendations

---

## Milestone 4 — Procurement and Supply Chain Module

**Goal:** Extend Wimmer to warehouse and supply chain operators. Connect procurement decisions to seasonal demand forecasts. Integrate idealo MCP for supplier research.

### Planned features

**Supply chain data model:**
- `inventory_performance` table: product SKUs, stock levels, consumption rates, reorder points
- `purchase_orders` table: orders, suppliers, quantities, delivery dates
- Stock level import template

**Demand forecasting for stock:**
- Product consumption forecasting based on historical usage
- Reorder point calculation: forecast demand over lead time + safety stock
- Stockout risk alerts (predicted demand exceeds projected stock)

**Procurement recommendations:**
- Seasonal procurement timing recommendations (order before demand spike)
- Quantity optimisation to minimise holding costs vs. stockout risk
- Supplier recommendations using idealo MCP price comparison

**idealo MCP active integration:**
- Procurement research tools integrated into AI workflow
- Supplier price benchmarking as evidence in recommendations
- Price history analysis for seasonal procurement timing

**Supplier management:**
- Supplier directory with lead times and minimum order quantities
- Supplier performance tracking (on-time delivery rates)

---

## Milestone 5 — Retail Module

**Goal:** Extend Wimmer to retail operators with seasonal sales forecasting, product demand planning, and stock optimisation.

### Planned features

**Retail data model:**
- `retail_performance` table: product_id, units_sold, revenue, stock_level, markdowns
- Retail property type with floor space and product range attributes
- POS data import template (CSV)

**Sales forecasting:**
- Product-level and category-level demand forecasting
- Seasonal pattern detection (Christmas, back-to-school, summer peaks)
- Markdown timing recommendations

**Stock optimisation:**
- Overstock detection (high stock relative to forecast sales rate)
- Understock / lost sales risk detection
- Replenishment recommendations with quantity and timing

**Margin optimisation:**
- Dynamic markdown timing to clear seasonal stock profitably
- Product mix recommendations based on margin contribution

**AI Decision Centre for retail:**
- Retail-specific recommendation categories (replenishment, markdown, supplier, range_planning)

---

## Milestone 6 — Platform Maturity

**Goal:** Wimmer becomes a production-grade, commercially deployable SaaS platform.

### Planned features

**Commercial:**
- Subscription billing (Stripe integration)
- Usage limits by subscription tier (max properties, forecast history, recommendations per month)
- Organisation usage dashboard
- Trial-to-paid conversion flow

**Platform:**
- Audit log dashboard (view all organisational actions)
- Data retention policies (GDPR compliance)
- Data export and deletion (right to erasure)
- Organisation admin panel

**Internal Wimmer MCP server:**
- MCP server exposing Wimmer data as tools for AI agents
- Tools: get_property_performance, get_occupancy_forecast, get_revenue_forecast, list_market_signals, get_pending_recommendations
- Read/write separation with human approval for write tools
- Full authentication and tenant isolation
- Audit logging for all tool calls

**Third-party API:**
- Public REST API for third-party integrations (PMS, channel manager data push)
- API key management per organisation
- Webhook support for real-time event notifications

**Security hardening:**
- Full security audit
- Penetration testing
- OWASP Top 10 review
- SOC 2 readiness assessment

---

## Backlog (Unscheduled)

The following items are captured but not yet assigned to a milestone:

- PMS direct integration (Mews, Apaleo, Oracle Opera)
- Channel manager data feed (SiteMinder, Cloudbeds)
- OTA rate parity monitoring
- Competitor benchmarking (STR data integration)
- Mobile app (React Native)
- Multi-language support (German, French, Spanish)
- WhatsApp/Slack recommendation notifications
- Advanced analytics (cohort analysis, booking window analysis)
- Custom report builder
