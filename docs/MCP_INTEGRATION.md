# Wimmer — MCP Integration

## Overview

Wimmer uses the Model Context Protocol (MCP) to extend its AI capabilities with external tools and data sources. MCP allows AI assistants (such as Claude) to call tools exposed by external servers as part of an analysis or workflow.

Wimmer's MCP strategy has two parts:

1. **External MCP servers** — third-party MCP servers that Wimmer connects to for data and research. Currently: idealo MCP for procurement research.

2. **Internal Wimmer MCP server** — a planned MCP server that exposes Wimmer's own data and decision capabilities as tools, enabling AI assistants to query property performance, retrieve forecasts, and (with human approval) trigger actions.

---

## idealo MCP Integration

### Purpose

idealo is Europe's leading price comparison platform. The idealo MCP server exposes tools for searching products, comparing prices, and viewing price history. In the Wimmer context, this integration is used for:

- **Hospitality equipment research:** Comparing prices for FF&E (furniture, fixtures, and equipment), kitchen equipment, linen, and consumables
- **Procurement planning:** Identifying cost-effective suppliers for seasonal procurement decisions
- **Supplier research:** Benchmarking supplier pricing against market alternatives

**Important:** idealo prices are product retail prices, not hotel room prices. This integration is for procurement research, not competitive room rate analysis.

---

### Connection Details

| Property | Value |
|----------|-------|
| MCP server URL | `https://mcp.idealo.com/mcp` |
| Transport type | Streamable HTTP (HTTP+SSE) |
| Authentication | OAuth 2.0 with Dynamic Client Registration (DCR) + PKCE |
| Callback port | 6274 (local) |

---

### Configuration: .mcp.json

The `.mcp.json` file at the repository root configures MCP servers for Claude Code. The idealo configuration:

```json
{
  "mcpServers": {
    "idealo": {
      "type": "url",
      "url": "https://mcp.idealo.com/mcp",
      "oauth": {
        "callbackPort": 6274
      }
    }
  }
}
```

**File location:** `/wimmer/.mcp.json`

**Notes:**
- `type: "url"` enables Streamable HTTP transport (the modern MCP transport)
- `callbackPort: 6274` is the local port Claude Code listens on for the OAuth callback
- No API keys are stored in this file — authentication is handled via OAuth flow
- This file is committed to the repository so all team members use the same MCP configuration

---

### Authentication Setup

idealo uses OAuth 2.0 with Dynamic Client Registration (DCR) and PKCE. This means:
- No static API keys
- Each client dynamically registers with idealo's authorization server
- PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks
- Tokens are stored locally by Claude Code and refreshed automatically

**First-time setup:**

1. Ensure Claude Code is installed and updated to a recent version
2. Open the Wimmer project in Claude Code: `claude` from the `/wimmer` directory
3. Attempt to use any idealo tool (Claude will prompt for authentication if not authenticated)
4. Claude Code will open your browser to the idealo OAuth authorization page
5. Log in with your idealo developer account credentials
6. Grant the requested permissions
7. The browser redirects to `http://localhost:6274/callback` — Claude Code captures this
8. Authentication is complete; tokens are stored locally

**Subsequent sessions:** Claude Code stores and refreshes the OAuth tokens automatically. Re-authentication is only required if tokens expire or are revoked.

---

### Available Tools

The following tools are available via the idealo MCP server:

#### search_products

Search for products by name or keyword.

```
search_products(query: string, market: string, limit?: int)
```

Returns a list of products matching the query in the specified market, with product IDs, names, and category information.

#### get_product_details

Get detailed information about a specific product.

```
get_product_details(product_id: string, market: string)
```

Returns product name, description, category, specifications, and available offers.

#### get_product_offers

Get current offers (prices and sellers) for a specific product.

```
get_product_offers(product_id: string, market: string)
```

Returns a list of current offers including seller name, price, delivery cost, and availability.

#### get_product_price_history

Get historical price data for a specific product.

```
get_product_price_history(product_id: string, market: string, days?: int)
```

Returns the price history for a product over the specified period, useful for identifying seasonal price patterns in procurement items.

---

### Supported Markets

| Market code | Country |
|-------------|---------|
| `DE` | Germany |
| `GB` | United Kingdom |
| `FR` | France |
| `IT` | Italy |
| `ES` | Spain |
| `AT` | Austria |

For Wimmer's German hotel operator focus, `DE` is the primary market.

---

### Use Cases for Wimmer

| Scenario | How to use |
|----------|-----------|
| Seasonal linen procurement | Search for hotel linen sets, compare prices across suppliers, check price history to time purchases |
| Kitchen equipment replacement | Find specific equipment models, compare offers from multiple sellers |
| FF&E for room renovation | Research furniture and equipment options with price comparison |
| Consumables bulk purchasing | Search for cleaning products, toiletries, and compare unit pricing |
| Supplier benchmarking | Use price history to understand whether a supplier's quote is market-competitive |

**Example workflow:**

> "I need to procure 50 pillow protectors for a room refresh. What's the best price available in Germany?"
>
> Claude calls `search_products(query="hotel pillow protector waterproof", market="DE")`, then `get_product_offers(product_id=..., market="DE")` to compare current offers.

---

### Rate Limits

| Tier | Request rate | Daily limit |
|------|-------------|-------------|
| Trial / Developer | 3 requests/second | 500 requests/day |
| Partner | 10 requests/second | 10,000 requests/day |

For development and research workflows, the trial tier is sufficient. For production automation (e.g., automated procurement research triggered by forecasts), a partner tier agreement with idealo would be required.

**Rate limit handling:** If the rate limit is exceeded, the idealo server returns an HTTP 429 response. Claude Code will surface this as a tool error. Wait a few seconds before retrying.

---

### Authentication Troubleshooting

**Problem:** "Authentication required" or OAuth flow does not complete

- Ensure port 6274 is not blocked by a firewall
- Ensure no other process is using port 6274: `lsof -i :6274`
- Try refreshing authentication by running the OAuth flow again from Claude Code

**Problem:** "Token expired" or unexpected 401 errors

- Claude Code should refresh tokens automatically
- If not: restart Claude Code and attempt re-authentication

**Problem:** Browser does not open automatically

- Claude Code prints the authorization URL to the terminal
- Copy and open it manually in a browser

**Problem:** Tools return empty results

- Check that the market code is correct (must be uppercase: `DE`, not `de`)
- Verify the product query uses terms relevant to the idealo catalogue (European product naming conventions)

---

## Internal Wimmer MCP Server (Planned — Milestone 6)

### Purpose

The internal Wimmer MCP server will expose Wimmer's own business intelligence data and decision capabilities as MCP tools. This will allow AI assistants (and future AI agents) to query Wimmer data as part of multi-step analysis workflows, without requiring direct database access.

**Status:** Planned. Not yet implemented. Implementation is scheduled for Milestone 6, after the core backend, access controls, and production deployment are stable.

### Why an Internal MCP Server?

- **Composability:** AI agents can combine Wimmer data with external tools (weather, idealo, market data) in a single analysis workflow
- **Abstraction:** Tools provide a stable interface that hides database schema complexity
- **Security:** Authentication and organisation isolation are enforced at the tool layer, not the database layer
- **Auditability:** Every tool call can be logged in `audit_logs`

### Planned Tools

#### get_property_performance

```
get_property_performance(
  organisation_id: string,
  property_id: string,
  days: int = 30
) → { daily_data: [...], summary: {...} }
```

Returns recent validated daily performance data and summary statistics for a property.

#### get_occupancy_forecast

```
get_occupancy_forecast(
  organisation_id: string,
  property_id: string,
  horizon_days: int = 30
) → { forecast: [...], model: string, accuracy: {...} }
```

Returns the latest occupancy forecast with prediction intervals and accuracy metrics.

#### get_revenue_forecast

```
get_revenue_forecast(
  organisation_id: string,
  property_id: string,
  horizon_days: int = 30
) → { forecast: [...], model: string, accuracy: {...} }
```

Returns the latest revenue forecast.

#### list_market_signals

```
list_market_signals(
  organisation_id: string,
  property_id?: string,
  days_ahead: int = 90
) → { signals: [...] }
```

Returns upcoming demand signals and seasonal events.

#### get_pending_recommendations

```
get_pending_recommendations(
  organisation_id: string,
  property_id: string
) → { recommendations: [...] }
```

Returns recommendations awaiting human approval.

#### approve_recommendation (write tool)

```
approve_recommendation(
  organisation_id: string,
  recommendation_id: string,
  status: "approved" | "rejected",
  notes?: string
) → { recommendation: {...} }
```

Approve or reject a pending recommendation. This is a write tool and will require explicit human confirmation via the approval workflow before execution.

### Security Requirements for Internal MCP Server

**Authentication:**
- Every tool call must include a valid JWT access token
- Token must correspond to an active user with membership in the requested organisation

**Tenant isolation:**
- `organisation_id` is a required parameter for all tools
- The server verifies organisation membership before returning any data
- No cross-tenant data access is possible via tool calls

**Read/write separation:**
- Read tools (get_*, list_*) can be called in automated workflows
- Write tools (approve_*) require the human approval workflow — the tool surfaces the pending action for human confirmation, it does not execute immediately

**Input validation:**
- All tool parameters are validated against strict schemas
- SQL injection is impossible (ORM layer, parameterised queries)
- UUIDs are validated as valid UUID format before any database query

**Rate limiting:**
- Per-organisation rate limits will be enforced
- Excessive tool calls will trigger a 429 response

**Audit logging:**
- Every tool call (read and write) is logged to `audit_logs`
- Write tool calls include the full parameter set in the details field

### Implementation Timeline

The internal MCP server will be implemented in Milestone 6. Prerequisites:

1. Core backend APIs stable and tested (Milestone 1 — in progress)
2. Access control model validated in production (Milestone 2)
3. Subscription and usage limits implemented (Milestone 6)
4. MCP server framework and tool definitions specified
5. Security review before any external exposure

---

## MCP Security Principles

The following principles apply to all MCP integrations in Wimmer:

**Least privilege:** Each MCP server is granted access only to what it needs. The idealo server has no access to Wimmer data. The internal Wimmer MCP server has no access to idealo or external systems.

**Untrusted input:** Tool responses from external MCP servers (including idealo) are treated as untrusted input. They are never executed as code, never used to modify data directly, and always validated before use.

**No unrestricted SQL or shell:** No MCP tool exposes unrestricted SQL queries or shell commands. All database access goes through the ORM with parameterised queries.

**No PII to external servers:** Tool calls to external MCP servers (idealo) never include personal data, booking information, or guest identifiers.

**Auditing:** All tool calls that affect Wimmer data are logged to `audit_logs` with the calling user, action, and parameters.

**Human approval for consequential actions:** Write operations on business-critical data (recommendations, pricing suggestions) require human approval and are not automated.
