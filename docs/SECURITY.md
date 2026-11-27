# Wimmer — Security Model

## Overview

This document describes Wimmer's security architecture, controls, known limitations, and roadmap. Wimmer is currently an MVP platform. The controls described here are appropriate for a development and early-access deployment. Additional hardening is required before production launch with paying customers. Known gaps are documented explicitly in the [Known Limitations](#known-limitations-mvp) section.

---

## Authentication

### JWT Token-Based Authentication

All API endpoints (except `/auth/register`, `/auth/login`, and `/health`) require a valid JWT Bearer token.

**Token structure:**
- Algorithm: HS256 (HMAC-SHA256)
- Library: python-jose
- Access token expiry: 8 hours (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)
- Refresh token expiry: 30 days (configurable via `REFRESH_TOKEN_EXPIRE_DAYS`)

**Token claims:**
```json
{
  "sub": "<user_uuid>",
  "exp": <unix_timestamp>,
  "type": "access" | "refresh"
}
```

**Token validation:** Every protected route uses the `CurrentUser` FastAPI dependency (`api/deps.py`). This dependency decodes the token, validates the signature and expiry, and loads the user from the database. Invalid or expired tokens result in a 401 response.

### Password Security

Passwords are hashed using bcrypt via passlib. The plain-text password is never stored and never logged.

- **Scheme:** bcrypt
- **Minimum length:** 8 characters (enforced via Pydantic validator in `UserRegister`)
- **Storage:** `hashed_password` column in `users` table

**Password strength:** The MVP enforces only a minimum length. A production deployment should enforce complexity requirements (uppercase, lowercase, number, special character) and check against known breached password lists.

---

## Authorisation

### Role-Based Access Control

Organisation membership determines access to all organisational resources. Within an organisation, the member's role determines what actions they can perform.

| Role | Description |
|------|-------------|
| `owner` | Full access. Can update organisation settings. Cannot be removed by other members. |
| `admin` | Full access. Can manage members. Cannot transfer ownership. |
| `analyst` | Read and write access to data, forecasts, and recommendations. Cannot manage org settings or members. |
| `viewer` | Read-only access to all organisational data. |

**Enforcement point:** `OrganisationService.assert_member(org_id, user_id)` is called at the beginning of every route handler that accesses organisational data. This queries `organisation_members` and raises HTTP 403 if no active membership exists.

**Role checks for write operations:** Some endpoints additionally check the member's role:
- `PATCH /organisations/{org_id}` — requires `owner` or `admin`
- Recommendation approval — currently open to any member (tightening planned in Milestone 2)

### Membership Deactivation

The `is_active` field on `organisation_members` supports soft deactivation of a member without deleting the record. `assert_member` checks `is_active = True`.

---

## Tenant Isolation

### Primary Control: Service Layer Enforcement

Every database query that accesses tenant-specific data includes an `organisation_id` filter. The service layer is the primary enforcement point.

Pattern:
1. Route handler calls `OrganisationService.assert_member(org_id, user_id)` — verifies the user belongs to the organisation
2. All subsequent queries for that organisation's data are filtered by `organisation_id` or by `property_id` (which is itself scoped to `organisation_id`)

This pattern means a user cannot access another organisation's data even if they guess a valid UUID, because the membership check will fail.

### Database-Level Schema Isolation

Every resource table (`properties`, `daily_performance`, `demand_forecasts`, `recommendations`, `market_signals`, `audit_logs`) carries an `organisation_id` or `property_id` column. There is no resource that is accessible without an explicit tenant scope.

### Planned: PostgreSQL Row-Level Security (Defence-in-Depth)

RLS policies are planned as a defence-in-depth layer. If a service layer bug allows a query to bypass the membership check, RLS ensures the database still returns only rows belonging to the current organisation. See `DATABASE_SCHEMA.md` for the planned RLS design.

---

## API Security

### CORS

CORS is configured via `CORSMiddleware`. The allowed origins are set via `CORS_ORIGINS` in the environment configuration.

**Default (development):** `["http://localhost:3000"]`

**Production requirement:** Set `CORS_ORIGINS` to only the production frontend domain. Never allow `*` in production.

### Input Validation

All request bodies are validated by Pydantic v2 models before reaching any service or database layer. Invalid input returns HTTP 422 with structured error details. This prevents:
- SQL injection via ORM parameterisation (not Pydantic, but defence-in-depth)
- Unexpected data types reaching business logic
- Overly large strings in constrained fields

### File Upload Validation

The import endpoint validates:
- **Content type:** Only `text/csv`, Excel MIME types, or `.csv/.xlsx/.xls` extensions are accepted. Returns HTTP 400 for unsupported types.
- **File size:** Maximum 50 MB (configurable via `MAX_UPLOAD_SIZE_MB`). Returns HTTP 400 if exceeded.
- **Content:** Row-level validation during parsing (negative values, constraint violations)

**What it does not validate (MVP gap):**
- Malicious file content (macro-enabled Excel files, zip bombs)
- File content type spoofing (a `.csv` file with a malicious XML payload)

---

## LLM Security

### No PII to External LLMs

The LLM prompt context contains only:
- Property name, city, country
- Aggregate statistics (averages, totals over a date range)
- Forecast summary (model name, average prediction)

**Never included in LLM prompts:**
- Guest names, emails, phone numbers
- Individual booking details or reservation IDs
- Payment information
- Staff personal details
- Any data from other organisations

### Output Validation

LLM responses are treated as untrusted input:
- Parsed with `json.loads()` — if parsing fails, an empty result is returned (no crash, no raw LLM text surfaces to the user)
- Fields accessed with `.get()` with defaults — a missing or null field does not cause an exception
- Text fields are truncated to column limits before database storage (`title[:255]`)
- Numeric fields are stored as given — the LLM cannot inject SQL or code via numeric values

### Structured Response Format

The system prompt instructs the LLM to output valid JSON only. Combined with `temperature=0.3`, this reduces but does not eliminate the risk of non-JSON output. The fallback `except Exception` catches all LLM failures and returns an empty list.

### Tenant Isolation for LLM

Requests to external LLM providers are made from the backend server, not from the browser. The user's JWT token is never sent to an external LLM provider.

---

## MCP Security

See `MCP_INTEGRATION.md` for the full MCP security model. Summary:

- **Least privilege:** Each MCP server is granted only the access it needs
- **No unrestricted SQL or shell:** No MCP tool exposes raw query execution
- **No PII to external MCP servers:** idealo tool calls contain only product search terms
- **Human approval for write operations:** The planned internal MCP server requires human confirmation before any write operation executes
- **Audit logging:** All tool calls affecting Wimmer data are logged

---

## Audit Logging

The `audit_logs` table is the central audit trail for consequential actions.

**What should be logged:**
- User registration and login (action: `user.registered`, `user.login`)
- Organisation created, updated (action: `organisation.created`, `organisation.updated`)
- Property created, updated (action: `property.created`, `property.updated`)
- Data import (action: `data.imported`, with `imported`, `skipped`, `errors` counts in details)
- Recommendation generated (action: `recommendation.generated`)
- Recommendation approved/rejected (action: `recommendation.approved`, `recommendation.rejected`)
- Member role changes (action: `member.role_changed`)

**Current state (MVP gap):** Audit logging is defined in the schema but not yet wired into service methods. This is a known gap to be closed in Milestone 2 before any external production deployment.

---

## Secret Management

### Environment Variables

All secrets (database credentials, JWT secret key, LLM API keys, Redis URL) are managed via environment variables loaded from a `.env` file using pydantic-settings.

**Rules:**
- `.env` files are listed in `.gitignore` and must never be committed
- `.env.example` is committed with placeholder values only (no real secrets)
- In production, secrets must be injected via the deployment environment (e.g., Docker secrets, cloud secret manager, CI/CD environment variables)
- Rotate the `SECRET_KEY` before any external deployment — the default value in `.env.example` is public

**Secret key generation:**
```bash
openssl rand -hex 32
```

### What Must Never Be Committed

- `.env` files
- Database passwords
- JWT secret keys
- LLM API keys (Nebius, OpenAI)
- OAuth tokens or credentials
- SSL/TLS private keys

---

## Known Limitations (MVP)

The following are known security gaps that are acceptable for a development/early-access environment but must be addressed before a production launch with real customer data.

| Gap | Risk | Planned fix |
|-----|------|-------------|
| Audit logging not wired into services | No audit trail for most actions | Milestone 2: wire all service methods |
| No email verification | Accounts can be created with unverified emails | Milestone 2: email verification flow |
| Weak password strength enforcement | Only minimum length checked | Milestone 2: complexity requirements |
| No rate limiting on auth endpoints | Brute-force password attacks possible | Milestone 2: rate limiting per IP |
| No refresh token rotation | Stolen refresh tokens can be used indefinitely until expiry | Milestone 2: implement token rotation |
| File upload content scanning | Malicious file content not scanned | Milestone 2: content scanning for uploads |
| RLS not implemented | Service layer bug could expose cross-tenant data | Milestone 2: implement RLS |
| No HTTPS enforcement in Docker config | Local dev is HTTP | Production deployment: HTTPS with TLS termination at proxy |
| No secrets manager | Secrets in `.env` files | Production deployment: integrate with cloud secrets manager |
| Recommendation approval open to all roles | Viewers can approve recommendations | Milestone 2: restrict to analyst/admin/owner |
| Mock LLM default | LLM_PROVIDER defaults to mock | Acceptable for development; must be explicit in production config |

---

## Security Roadmap

### Milestone 2

- Wire audit logging into all service methods
- Email verification for new accounts
- Password complexity enforcement
- Rate limiting on `/auth/login` and `/auth/register` (per-IP)
- Refresh token rotation on use
- PostgreSQL RLS implementation
- Restrict recommendation approval to `analyst` role and above

### Milestone 3

- Security review of all endpoints
- Penetration testing or external security assessment
- HTTPS enforcement in deployment configuration
- Secrets manager integration (e.g., AWS Secrets Manager, HashiCorp Vault)
- File upload content scanning

### Milestone 6 (Production Hardening)

- Full security audit before public launch
- OWASP Top 10 review
- SOC 2 readiness assessment
- Subscription and usage limits (DDoS mitigation)
- GDPR data retention and deletion policies
- Security incident response runbook
