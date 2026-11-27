# Wimmer — Team Structure

## Founding Team

Wimmer is built by a five-person founding team with deep operational experience across the industries the platform serves. Each founder brings specific domain knowledge that directly informs the product: they are not advisors — they are practitioners who have experienced the problem first-hand.

The team is deliberately cross-functional. Technical decisions are made collaboratively with input from domain experts. Product decisions are made with input from the technical co-founder.

---

## Team Members

### Person 1 — Hospitality Lead / Co-Founder

**Background:** Hospitality and AI. Operational experience in hotel management, revenue management, and digital transformation in the hospitality sector. Deep understanding of hotel performance metrics, demand drivers, and the gap between available technology and operator needs.

**Primary responsibilities:**
- Define the hospitality product vision and feature requirements
- Validate product decisions with hotel operator network
- Lead customer discovery interviews in the hotel sector
- Own the revenue management and intelligence module specifications
- Review and approve AI recommendation categories and evidence standards for hospitality
- Represent hospitality user perspective in sprint planning and design reviews

**Product workstream ownership:**
- Wimmer Intelligence (seasonal signals, demand drivers)
- Wimmer Forecast (occupancy, ADR, RevPAR forecasting UX)
- Wimmer Revenue (performance monitoring, RevPAR analysis)
- AI Decision Centre (recommendation categories: revenue, pricing, operations for hotels)
- `docs/INDUSTRY_DISCOVERY.md` — Hotel / Hospitality section
- `docs/PRODUCT_SPEC.md`
- `docs/ROADMAP.md`

**GitHub:** [TBD — to be assigned]

---

### Person 2 — Restaurant Operations Lead / Co-Founder

**Background:** Restaurant operations. Experience managing daily restaurant operations including kitchen management, FOH staffing, supplier relationships, food cost control, and seasonal menu planning. Understands the practical constraints of daily service planning and the cost of poor demand forecasting (food waste, overstaffing, stockouts).

**Primary responsibilities:**
- Define restaurant module requirements (Milestone 3)
- Identify key operational metrics and decision workflows for restaurant operators
- Lead customer discovery in the restaurant sector
- Validate forecasting approaches against real restaurant demand patterns
- Define F&B-specific data import templates and performance metrics
- Review AI recommendations for restaurant applicability

**Product workstream ownership:**
- Wimmer Operations — restaurant scope (covers forecasting, F&B demand, staffing)
- Restaurant module design (Milestone 3)
- `docs/INDUSTRY_DISCOVERY.md` — Restaurant Operations section

**GitHub:** [TBD — to be assigned]

---

### Person 3 — Supply Chain Lead / Co-Founder

**Background:** Warehouse and supply chain. Operational experience in warehouse management, inventory control, demand planning, and supplier management under seasonal demand variation. Understands the cost of stockouts, the working capital impact of overstock, and the difficulty of aligning procurement timing with demand forecasts.

**Primary responsibilities:**
- Define supply chain and procurement module requirements (Milestone 4)
- Specify stock management data models and import formats
- Lead customer discovery in the warehouse and logistics sector
- Validate reorder point and safety stock calculation approaches
- Define supplier management workflows
- Oversee idealo MCP integration for procurement use cases

**Product workstream ownership:**
- Procurement and supply chain module (Milestone 4)
- idealo MCP integration for procurement research
- `docs/INDUSTRY_DISCOVERY.md` — Warehouse & Supply Chain section

**GitHub:** [TBD — to be assigned]

---

### Person 4 — Retail Lead / Co-Founder

**Background:** Retail. Operational experience in retail buying, merchandise planning, seasonal stock management, and margin optimisation. Understands seasonal peaks (Christmas, back-to-school), the markdown decision process, range planning under uncertainty, and the impact of poor demand forecasting on working capital.

**Primary responsibilities:**
- Define retail module requirements (Milestone 5)
- Specify retail data models (product, category, SKU-level)
- Lead customer discovery in the retail sector
- Validate sales forecasting approaches for retail demand patterns
- Define stock optimisation and markdown recommendation specifications

**Product workstream ownership:**
- Retail module (Milestone 5)
- `docs/INDUSTRY_DISCOVERY.md` — Retail section

**GitHub:** [TBD — to be assigned]

---

### Person 5 — Technical Lead / Co-Founder

**Background:** Technology. Engineering experience in full-stack product development, data systems, machine learning, and cloud infrastructure. Responsible for the technical architecture, development workflows, and engineering quality standards.

**Primary responsibilities:**
- Architect and implement the core platform (FastAPI, Next.js, PostgreSQL)
- Own the forecasting engine design and implementation
- Design and maintain the AI/LLM integration layer
- Implement security model and data isolation controls
- Define and maintain development workflow and code quality standards
- Code review for all technical pull requests
- Infrastructure, CI/CD, deployment

**Product workstream ownership:**
- `apps/api/` — Full API codebase
- `apps/web/` — Frontend codebase
- `ml/` — Forecasting research and model development
- `docs/ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_SPEC.md`
- `docs/AI_AGENT_DESIGN.md`
- `docs/FORECASTING_DESIGN.md`
- `docs/SECURITY.md`
- `docs/MCP_INTEGRATION.md`
- `docs/DEVELOPMENT_WORKFLOW.md`

**GitHub:** [TBD — to be assigned]

---

## Working Principles

### Async-First Communication

The team operates across different schedules and may not always be online simultaneously. The default communication mode is asynchronous:

- Decisions are written down in GitHub issues or pull request descriptions, not locked in Slack messages or verbal conversations
- Meeting outcomes are summarised as GitHub issues or comment threads before the meeting ends
- "I'll check with X" is not an action — the check must be documented in writing

### Documented Decisions

Every significant product or technical decision is documented. The standard format is an ADR (Architecture Decision Record) in the relevant doc or as a GitHub issue:

- **What** was decided
- **Why** — the context and alternatives considered
- **Trade-offs** — what is accepted and what is deferred
- **Who** made the decision and when

This is especially important for decisions that non-technical founders need to understand (e.g., why the forecasting engine cannot use the LLM for predictions).

### Pull Request Reviews

- All changes to `main` require at least 1 approval from another team member
- Technical PRs are reviewed by Person 5 (Technical Lead)
- Product-facing PRs (feature changes visible to users) are reviewed by the relevant domain co-founder
- PRs touching `docs/INDUSTRY_DISCOVERY.md` require review from all relevant domain leads
- Review means reading the diff and understanding the change — rubber-stamp approvals are not acceptable

---

## Decision-Making Framework

| Decision type | Who decides | Input required from |
|---------------|-------------|---------------------|
| Core architecture (data models, API design, tech choices) | Person 5 | All co-founders for context |
| Product feature prioritisation | Person 1 (hospitality MVP) | All co-founders |
| Forecasting methodology | Person 5 | Domain co-founder for affected vertical |
| Hospitality product spec | Person 1 | Person 5 for feasibility |
| Restaurant module spec | Person 2 | Person 5 for feasibility |
| Supply chain module spec | Person 3 | Person 5 for feasibility |
| Retail module spec | Person 4 | Person 5 for feasibility |
| External tool integrations | Person 5 + relevant domain lead | — |
| Commercial/pricing | Shared decision | All co-founders |

**Tie-breaking:** For decisions with no clear owner, the person closest to the customer need has the tie-breaking vote. In technical disputes, Person 5 has the final decision after consulting affected domain co-founders.

---

## Communication Guidelines

**GitHub Issues** — The primary coordination tool. Use for:
- Bug reports
- Feature requests and specifications
- Discovery questions and hypotheses
- Technical tasks

**GitHub Discussions** — For open-ended conversations and product questions that do not yet have a clear outcome.

**Pull Requests** — For all code and documentation changes. The PR description must explain the why, not just the what.

**Slack / async chat** — For ephemeral communication only. If a decision is made in Slack, it must be documented in a GitHub issue or PR before being considered final.

**Video calls** — For demos, complex discussions, and onboarding. Always produce a written summary.

---

## How Non-Technical Co-Founders Can Contribute

Domain expertise is as valuable as code contributions. Non-technical co-founders contribute directly through:

**Issue creation:** Create GitHub issues for:
- Specific operational questions from your industry (formatted per `INDUSTRY_DISCOVERY.md` template)
- User feedback from discovery interviews
- Feature ideas with business rationale ("a hotel GM I spoke to needs X because Y")
- Bug reports from using the product ("when I do X, Y happens, but I expected Z")

**Product discovery documentation:** Update `docs/INDUSTRY_DISCOVERY.md` with new hypotheses, validated assumptions, or invalidated assumptions from customer interviews. Include the interview date and organisation type (without names unless permitted).

**User research:** Conduct structured discovery interviews using the interview guide in `INDUSTRY_DISCOVERY.md`. Document findings as GitHub issues with the `discovery` label.

**Recommendation review:** Review AI-generated recommendations in the AI Decision Centre and provide feedback on whether they reflect real operational decisions.

**Documentation review:** Review domain-specific sections of product documentation for accuracy. The best documentation is written by people who have done the work.

**Demo testing:** Test the product against real-world scenarios from your operational experience. The best quality assurance comes from someone who knows what the product *should* produce.
