# Wimmer — Industry Discovery

## Purpose and Methodology

This document is the founding team's operational knowledge base. It captures the specific, concrete questions that hospitality, restaurant, warehouse, and retail operators ask on a daily basis — questions that existing tools answer poorly, expensively, or not at all.

The goal is to build a product grounded in real operational problems, not theoretical use cases. Each team member has contributed questions from their direct professional experience.

This is a living document. It will be updated as we conduct customer interviews, validate assumptions, and invalidate hypotheses. The validation status of each section is tracked explicitly.

---

## How to Use This Document

**For product decisions:** When prioritising features, check whether the feature addresses a question marked HYPOTHESIS or VALIDATED here. ASSUMPTION-status items should not drive major feature investments until validated.

**For customer interviews:** Use the questions here as an interview guide. Ask "how do you currently answer this question?" before "would you want software to answer it?" The current solution is as important as the problem.

**For engineering:** Use the specific data requirements implied by each question to inform data model design. If a question requires data we do not collect, note it.

**Updating this document:**
- Add new questions as GitHub issues with label `discovery`
- Change validation status when evidence is gathered
- Include date and organisation type (never names without permission) for any VALIDATED item

---

## Validation Status Definitions

| Status | Meaning |
|--------|---------|
| ASSUMPTION | No direct operational experience or customer evidence. Logical inference only. |
| HYPOTHESIS | Based on direct operational experience of a founding team member. Not yet externally validated with other operators. |
| VALIDATED | Confirmed through customer interview(s) with operators outside the founding team. Must note date and organisation type. |

---

## Hotel / Hospitality (Person 1)

### Category: Demand Forecasting

**Q1. What is my occupancy going to be over the next 30 days?**
- Context: Revenue managers and GMs run occupancy projections manually every morning. The process involves pulling a report from the PMS, checking open vs. cancelled bookings, and applying experience-based adjustments for local events.
- Current solution: Manual PMS report + spreadsheet + gut instinct. Some larger hotels use dedicated RMS (revenue management system) tools, but these are expensive (€500–€2,000/month) and require dedicated revenue managers to operate.
- What Wimmer provides: Statistical occupancy forecast with prediction intervals. No RMS required.
- Validation status: HYPOTHESIS

**Q2. When is my next demand peak, and how strong will it be?**
- Context: Identifying demand peaks 4–8 weeks ahead determines pricing strategy, staffing levels, and procurement decisions. Missing a peak means underselling inventory at low rates. Anticipating a trough means proactively filling rooms with promotions.
- Current solution: Experience, local event calendars checked manually, STR data (expensive).
- What Wimmer provides: Seasonal signal feed with upcoming holidays, events, and seasonal patterns.
- Validation status: HYPOTHESIS

**Q3. How does my current pick-up compare to the same period last year?**
- Context: "Pick-up" is the rate of new bookings being made. If a hotel is behind last year's pick-up at 30 days out, it may need to adjust rates or marketing spend. This requires comparing the current booking pace to historical booking pace.
- Current solution: Manual year-over-year comparison in PMS reports.
- What Wimmer provides: Pick-up comparison analysis. Currently out of scope (requires booking window data, not just daily actuals). Planned for Milestone 2+.
- Validation status: HYPOTHESIS

**Q4. What is my optimal ADR for the next 2 weeks given current demand signals?**
- Context: Setting room rates is a daily decision. Hotels price by room type, booking channel, and length of stay. Getting ADR wrong in either direction is costly.
- Current solution: RMS, channel manager, or manual rate setting based on experience and OTA rate shopper tools.
- What Wimmer provides: AI recommendations on pricing strategy based on forecast occupancy and market signals. Does not set rates automatically — requires human approval.
- Validation status: HYPOTHESIS

**Q5. How much is the upcoming public holiday worth to me in additional revenue?**
- Context: German public holidays create demand spikes of 10–30% in many city hotels. Quantifying the expected uplift helps justify rate increases and staffing decisions.
- Current solution: Historical experience. No systematic calculation.
- What Wimmer provides: Holiday signal with impact level and direction. Revenue forecast comparison with/without holiday effect (future feature).
- Validation status: HYPOTHESIS

### Category: Revenue and Pricing

**Q6. Am I leaving revenue on the table on high-demand nights?**
- Context: If a hotel hits 95% occupancy at an ADR of €110 when competitors are at €165, the revenue opportunity cost is significant. Identifying this in real-time is difficult.
- Current solution: Manual OTA rate shopping. STR benchmarking (expensive subscription).
- What Wimmer provides: AI recommendation triggered when occupancy is high and ADR appears below market potential (based on historical patterns).
- Validation status: HYPOTHESIS

**Q7. How does my RevPAR this month compare to the same month last year?**
- Context: RevPAR (Revenue Per Available Room) is the standard KPI for hotel performance. YoY comparison is the most common performance conversation with ownership/management.
- Current solution: PMS monthly reports, manual comparison.
- What Wimmer provides: RevPAR trend analysis with YoY comparison (Milestone 2).
- Validation status: HYPOTHESIS

**Q8. What is my cancellation rate trend, and is it getting worse?**
- Context: Rising cancellation rates are an early warning signal of demand softness or booking system issues. Hotels track this but rarely get automated alerts.
- Current solution: Monthly PMS report review.
- What Wimmer provides: Cancellation rate trend tracked in `daily_performance`. AI recommendation if trend is worsening.
- Validation status: ASSUMPTION

### Category: Operations

**Q9. How many housekeeping staff do I need this week?**
- Context: Housekeeping is the largest labour cost in most hotels. Under-staffing leads to rooms not being cleaned on time. Over-staffing wastes money. The optimal headcount depends on expected occupancy and checkout volumes.
- Current solution: Housekeeper roster based on the GM's experience and manually checked occupancy.
- What Wimmer provides: Occupancy forecast → staffing recommendation. Category: `staffing`.
- Validation status: HYPOTHESIS

**Q10. What is the busiest check-in day next week?**
- Context: Check-in peaks require more front desk coverage and may require additional porter support. Knowing the peak days 7–14 days ahead allows optimal scheduling.
- Current solution: Manual review of arrivals report from PMS.
- What Wimmer provides: Day-level occupancy forecast. Specific staffing recommendations for peak arrival days.
- Validation status: HYPOTHESIS

**Q11. How much linen do I need to order for next month?**
- Context: Linen procurement depends on expected occupancy (high occupancy = more laundry cycles = faster wear). Over-ordering ties up cash; under-ordering risks running out during a peak.
- Current solution: Reorder when stock gets low. No demand-based planning.
- What Wimmer provides: Occupancy forecast → procurement recommendation (MVP: in recommendation text. Milestone 4: linked to procurement module).
- Validation status: ASSUMPTION

**Q12. Are my operational costs in line with revenue performance?**
- Context: Cost per occupied room (CPOR) needs to be tracked against ADR to maintain margins. When ADR drops or costs increase, the margin impact is rapid.
- Current solution: Monthly P&L review.
- What Wimmer provides: Out of scope for MVP. Planned as a revenue management enhancement.
- Validation status: ASSUMPTION

### Category: Staffing

**Q13. How many reception staff do I need on New Year's Eve?**
- Context: Public holidays and event nights create arrival/departure peaks that are predictable from the demand calendar but require specific staffing decisions weeks in advance.
- Current solution: Experience-based headcount decision.
- What Wimmer provides: Holiday signal feed + occupancy forecast + staffing recommendation.
- Validation status: HYPOTHESIS

**Q14. Am I over-staffed on low-occupancy Sundays?**
- Context: Many hotels maintain minimum staffing regardless of occupancy, leading to wasted labour costs on predictably low-demand days.
- Current solution: Gut-feel scheduling.
- What Wimmer provides: Day-of-week occupancy pattern identification + staffing recommendation.
- Validation status: HYPOTHESIS

**Q15. When should I schedule my annual deep-clean if it means closing rooms temporarily?**
- Context: Annual maintenance or refurbishment requires taking rooms offline. The timing should minimise revenue impact — ideally during the annual demand trough.
- Current solution: Based on experience and calendar knowledge.
- What Wimmer provides: Seasonal demand pattern identification. Recommendation on optimal low-demand windows.
- Validation status: ASSUMPTION

---

## Restaurant Operations (Person 2)

### Category: Daily Demand Planning

**Q1. How many covers will I do tonight?**
- Context: Every restaurant GM asks this before each service. It drives prep quantities, staffing decisions, and opening times. Getting it wrong means wasted food or disappointed customers.
- Current solution: Looking at the reservation book and applying experience. No data-driven baseline.
- What Wimmer provides: Daily covers forecast based on day-of-week patterns, historical actuals, and upcoming events.
- Validation status: HYPOTHESIS

**Q2. What is the variance in covers between a typical Tuesday and a typical Friday?**
- Context: Day-of-week patterns are the most predictable demand signal in restaurants. Understanding the magnitude of weekly variation is fundamental to consistent prep and staffing.
- Current solution: Gut-feel, possibly informal tracking.
- What Wimmer provides: Day-of-week covers pattern analysis. Visualised as average covers by day of week.
- Validation status: HYPOTHESIS

**Q3. How will the upcoming local festival affect my bookings next weekend?**
- Context: Local events (markets, festivals, sporting events) create demand spikes that savvy operators can capitalise on with extended hours, special menus, or promotional pricing.
- Current solution: GM checks local event calendar manually. No systematic signal.
- What Wimmer provides: Local event signals (Milestone 2+). MVP surfaces public holidays and seasonal patterns.
- Validation status: HYPOTHESIS

**Q4. What is my average revenue per cover this month vs. last month?**
- Context: Revenue per cover (total revenue / covers served) is the core margin KPI for a restaurant. Tracking it over time reveals upselling effectiveness and menu pricing impact.
- Current solution: Manual calculation from POS report.
- What Wimmer provides: Performance monitoring for restaurant metric (Milestone 3).
- Validation status: HYPOTHESIS

**Q5. How do my covers compare to the same week last year?**
- Context: YoY comparison is the most useful performance benchmark for seasonal businesses. It removes seasonal noise and shows genuine business growth or decline.
- Current solution: Manual historical report comparison.
- What Wimmer provides: YoY performance comparison (Milestone 2+).
- Validation status: HYPOTHESIS

### Category: Ingredient and Inventory Management

**Q6. How much of each core ingredient do I need to prep tomorrow?**
- Context: Over-prepping wastes ingredients and labour. Under-prepping leads to 86s (dishes taken off the menu mid-service) and unhappy customers. The optimal prep quantity depends on the expected covers and menu mix.
- Current solution: Head chef experience and gut feeling. Some operations use a prep list updated daily.
- What Wimmer provides: Covers forecast → prep quantity recommendation based on historical menu mix (Milestone 3).
- Validation status: HYPOTHESIS

**Q7. Which ingredients am I consistently over-ordering?**
- Context: Over-ordering is the primary driver of food waste. Identifying which SKUs are systematically over-ordered requires tracking order quantities vs. usage over time.
- Current solution: No systematic tracking. Waste noted informally, not analysed.
- What Wimmer provides: Ingredient consumption tracking vs. orders (Milestone 3).
- Validation status: ASSUMPTION

**Q8. What is my food cost percentage this week, and is it trending up?**
- Context: Food cost percentage is a critical margin KPI. When it rises above target (typically 28–35% for restaurants), it signals waste, theft, over-portioning, or supplier price changes.
- Current solution: Weekly manual calculation from invoices and POS data.
- What Wimmer provides: Food cost tracking and trend analysis (Milestone 3).
- Validation status: HYPOTHESIS

### Category: Food Waste

**Q9. How much did I throw away yesterday, and what did it cost?**
- Context: Food waste is both a financial loss and an operational indicator. Tracking waste daily requires a process (logging waste at close) that few restaurants have.
- Current solution: Most restaurants have no systematic waste tracking. Some use a waste log sheet.
- What Wimmer provides: Waste tracking interface (Milestone 3). AI recommendations when waste trends suggest over-ordering.
- Validation status: ASSUMPTION

**Q10. Can I predict which nights will produce the most waste?**
- Context: If you can predict that Sunday nights have the highest waste (due to full weekend prep and low Sunday covers), you can adjust prep strategy accordingly.
- Current solution: Experience.
- What Wimmer provides: Day-of-week waste pattern analysis + prep recommendation adjustment (Milestone 3).
- Validation status: ASSUMPTION

### Category: Staffing

**Q11. How many kitchen staff do I need this Saturday?**
- Context: Saturday kitchen staffing must balance against predicted covers, menu complexity, and lead time for recruiting or booking agency staff.
- Current solution: Fixed rota with adjustments based on reservation book.
- What Wimmer provides: Covers forecast → kitchen staffing recommendation (Milestone 3).
- Validation status: HYPOTHESIS

**Q12. Am I overstaffing slow lunch services?**
- Context: Lunch services often run below capacity, especially mid-week. Over-staffing these services is a hidden labour cost.
- Current solution: Fixed split of FOH/BOH staff regardless of covers.
- What Wimmer provides: Time-of-day covers pattern analysis → staffing recommendations for specific services.
- Validation status: ASSUMPTION

### Category: Supplier Management

**Q13. Which of my suppliers has the best on-time delivery record?**
- Context: Unreliable suppliers cause operational disruptions. Tracking delivery performance over time enables supplier management conversations.
- Current solution: Informal tracking or no tracking.
- What Wimmer provides: Supplier performance tracking (Milestone 4).
- Validation status: ASSUMPTION

**Q14. When should I place my Christmas stock order?**
- Context: Christmas demand peaks require forward purchasing of key ingredients and beverages. Ordering too late means missing products; too early means cash tied up and storage costs.
- Current solution: Experience and supplier lead time knowledge.
- What Wimmer provides: Seasonal demand forecast → procurement timing recommendation.
- Validation status: HYPOTHESIS

**Q15. Are my produce prices increasing faster than my revenue?**
- Context: Commodity price inflation hits restaurant margins directly. Tracking whether cost increases are eroding margins requires systematic data.
- Current solution: Manual review of invoices. No systematic tracking.
- What Wimmer provides: Cost trend tracking vs. revenue per cover (Milestone 3).
- Validation status: ASSUMPTION

---

## Warehouse and Supply Chain (Person 3)

### Category: Inventory Levels

**Q1. What is my current stock level for each SKU, and how many days of cover does it represent?**
- Context: Days of cover (stock on hand / daily consumption rate) is the fundamental stock management KPI. Getting it right requires knowing both current stock and forecast consumption.
- Current solution: Manual WMS report or spreadsheet. Consumption rate calculated monthly or quarterly.
- What Wimmer provides: Days of cover calculation based on current stock and forecast consumption (Milestone 4).
- Validation status: HYPOTHESIS

**Q2. Which SKUs are at risk of stockout in the next 14 days?**
- Context: Stockout risk is the most urgent stock management problem. Identifying at-risk SKUs before they run out allows proactive reordering.
- Current solution: Safety stock buffers set manually. Reorder alerts when stock crosses a fixed threshold, regardless of seasonal demand variation.
- What Wimmer provides: Stockout risk forecast: predicted demand over lead time vs. projected stock level (Milestone 4).
- Validation status: HYPOTHESIS

**Q3. Which SKUs am I overstocked on relative to seasonal demand?**
- Context: Overstock ties up working capital and incurs storage costs. Products that move slowly relative to seasonal demand are prime targets for order reduction.
- Current solution: Periodic manual review. No systematic comparison against seasonal demand pattern.
- What Wimmer provides: Overstock detection based on forecast vs. stock level (Milestone 4).
- Validation status: HYPOTHESIS

**Q4. What is my inventory turnover rate by SKU category?**
- Context: Inventory turnover (cost of goods sold / average inventory value) is a core efficiency KPI. Low turnover categories are candidates for range rationalisation.
- Current solution: Monthly or quarterly calculation in finance system.
- What Wimmer provides: Turnover analysis by SKU category (Milestone 4).
- Validation status: ASSUMPTION

### Category: Replenishment

**Q5. What should I order today to cover next month's demand?**
- Context: Calculating optimal order quantities requires forecasting demand over the replenishment lead time, adding safety stock, and subtracting current stock on hand. This is calculated manually or with overly simplistic fixed reorder points.
- Current solution: Fixed reorder points and quantities set once and rarely updated for seasonal variation.
- What Wimmer provides: Dynamic reorder point calculation based on seasonal demand forecast + lead time + safety stock (Milestone 4).
- Validation status: HYPOTHESIS

**Q6. How much earlier should I place my seasonal peak order than my normal reorder cycle?**
- Context: Seasonal peaks (Christmas, summer, back-to-school) require ordering further ahead than normal because supplier lead times stretch during peak demand periods, and because safety stock requirements increase.
- Current solution: Experience-based estimate.
- What Wimmer provides: Seasonal demand forecast → procurement timing recommendation (advance order trigger).
- Validation status: HYPOTHESIS

**Q7. What is my forecast consumption for the next 30/60/90 days by SKU?**
- Context: Procurement planning at 30/60/90-day horizons requires forward consumption forecasts. Without these, procurement teams order based on trailing history, which lags behind seasonal trends.
- Current solution: Trailing average consumption. No forward-looking forecast.
- What Wimmer provides: Consumption forecast at 30/60/90-day horizons using the same forecasting engine as hotel occupancy (Milestone 4).
- Validation status: HYPOTHESIS

### Category: Stockouts

**Q8. What was the revenue impact of my last stockout event?**
- Context: Stockouts have both direct costs (lost sales) and indirect costs (customer attrition, emergency sourcing at premium prices). Quantifying the cost builds the business case for better planning.
- Current solution: Not tracked systematically.
- What Wimmer provides: Stockout event tracking with estimated lost revenue (Milestone 4).
- Validation status: ASSUMPTION

**Q9. Which stockouts were predictable from the demand forecast?**
- Context: If a stockout occurs during a predicted demand peak, it represents a planning failure. If it occurs due to an unpredicted event, it represents model failure. Distinguishing these drives improvement.
- Current solution: Post-mortem analysis, if any.
- What Wimmer provides: Stockout analysis vs. forecast (actual demand vs. forecasted demand at time of stockout).
- Validation status: ASSUMPTION

### Category: Seasonal Demand

**Q10. How does my Q4 demand differ from Q2 demand by SKU category?**
- Context: Seasonal demand patterns vary significantly by product category. Understanding which categories are most seasonal guides both procurement planning and range decisions.
- Current solution: Manual historical analysis. Not systematically documented.
- What Wimmer provides: Seasonal demand pattern analysis by SKU category (Milestone 4).
- Validation status: HYPOTHESIS

**Q11. When does my seasonal peak start and end for each major category?**
- Context: Seasonal peaks are not calendar-aligned — they vary by product category and geography. Identifying the start and end of each peak allows precise procurement and staffing planning.
- Current solution: Experience.
- What Wimmer provides: Seasonal peak detection from consumption history (Milestone 4).
- Validation status: HYPOTHESIS

### Category: Supplier Management

**Q12. Which of my suppliers has the longest and most variable lead time?**
- Context: Long and variable lead times require more safety stock. Identifying which suppliers have the worst lead time performance allows procurement teams to either negotiate or dual-source.
- Current solution: Informal tracking or no tracking.
- What Wimmer provides: Supplier lead time tracking and variability analysis (Milestone 4).
- Validation status: ASSUMPTION

**Q13. Can I get a better price on this product from an alternative supplier?**
- Context: Procurement teams often lack market price benchmarks. Without a comparison, there is no leverage in supplier negotiations.
- Current solution: Manual price comparison when negotiating. No systematic benchmarking.
- What Wimmer provides: idealo MCP integration for product price comparison (Milestone 4).
- Validation status: HYPOTHESIS

**Q14. What is the optimal order frequency for each supplier given their MOQ and my consumption rate?**
- Context: Order frequency affects both transaction costs and carrying costs. Too frequent small orders increase administrative overhead; too infrequent large orders increase carrying costs.
- Current solution: Informal or legacy ERP logic.
- What Wimmer provides: Order frequency optimisation recommendation (Milestone 4).
- Validation status: ASSUMPTION

**Q15. Am I over-reliant on a single supplier for a critical SKU?**
- Context: Single-supplier dependency is a supply chain risk. Identifying which critical SKUs have no alternative source enables risk management conversations.
- Current solution: Not tracked.
- What Wimmer provides: Supplier concentration analysis per SKU (Milestone 4).
- Validation status: ASSUMPTION

---

## Retail (Person 4)

### Category: Seasonal Sales

**Q1. What are my forecast sales by product category for the Christmas trading period?**
- Context: Christmas is the highest-stakes trading period for most retailers. Forecast accuracy determines how much stock to buy, how many staff to hire, and how much marketing to invest.
- Current solution: Last year's actuals + gut-feel growth rate. Some retailers use spreadsheet-based models.
- What Wimmer provides: Category-level sales forecast for Christmas trading (Milestone 5).
- Validation status: HYPOTHESIS

**Q2. When does my seasonal peak start and end, and what is its magnitude?**
- Context: The start and end of seasonal peaks vary by category and geography. Knowing the exact shape of the demand curve guides when to bring stock in and when to start markdowns.
- Current solution: Experience.
- What Wimmer provides: Seasonal peak detection and magnitude estimation from historical sales (Milestone 5).
- Validation status: HYPOTHESIS

**Q3. Which product categories have the most predictable seasonal patterns?**
- Context: Some categories (gift, decorations, seasonal food) have highly predictable seasonal patterns. Others (fashion, electronics) are more trend-driven. Knowing which categories are forecastable with confidence guides where to invest in demand planning.
- Current solution: Experience.
- What Wimmer provides: Forecast accuracy by category (Milestone 5).
- Validation status: ASSUMPTION

### Category: Product Demand

**Q4. Which SKUs are tracking above plan for the season?**
- Context: SKUs trading above plan are candidates for reorder. Identifying them early enough to get a reorder in before stockout requires comparing actuals against a seasonal plan.
- Current solution: Manual weekly trading review.
- What Wimmer provides: Plan vs. actual tracking with recommended reorder triggers (Milestone 5).
- Validation status: HYPOTHESIS

**Q5. Which SKUs are tracking below plan and are at risk of becoming end-of-season stock?**
- Context: Underperforming SKUs will require markdown to clear before the end of season. Identifying them early allows smaller, timely markdowns rather than large clearance discounts.
- Current solution: Manual review at end-of-season or when clearance is obvious.
- What Wimmer provides: Underperformance detection with recommended markdown timing (Milestone 5).
- Validation status: HYPOTHESIS

**Q6. How does my conversion rate change during peak vs. off-peak periods?**
- Context: Conversion rate (transactions / footfall) is a key productivity metric. Understanding how it varies seasonally helps staff and display planning.
- Current solution: If footfall data is available, manual analysis.
- What Wimmer provides: Conversion rate trend analysis if footfall data is provided (Milestone 5).
- Validation status: ASSUMPTION

### Category: Purchasing Decisions

**Q7. How much open-to-buy do I have left for the season, and how should I allocate it?**
- Context: Open-to-buy (OTB) is the purchasing budget remaining for a trading period. Allocating OTB across categories requires knowing which categories are tracking above vs. below plan.
- Current solution: Spreadsheet-based OTB management.
- What Wimmer provides: OTB recommendation based on plan vs. actual by category (Milestone 5).
- Validation status: HYPOTHESIS

**Q8. Should I place a repeat order on this SKU, or will it overstock me for the rest of the season?**
- Context: Repeat order decisions require comparing remaining sell-through weeks against the forecast weeks of remaining stock. Getting this wrong creates clearance problems or stockouts.
- Current solution: Experience-based calculation or manual model.
- What Wimmer provides: Remaining sell-through weeks vs. remaining stock weeks comparison (Milestone 5).
- Validation status: HYPOTHESIS

**Q9. What is the optimal intake timing for my summer range?**
- Context: Receiving summer stock too early ties up space and cash. Too late means missing early-season demand. The optimal intake timing depends on the demand curve shape.
- Current solution: Experience and supplier lead time knowledge.
- What Wimmer provides: Seasonal demand curve → intake timing recommendation (Milestone 5).
- Validation status: HYPOTHESIS

### Category: Stock Management

**Q10. What is my weeks of cover by SKU category?**
- Context: Weeks of cover (current stock / average weekly sales) is the core stock position KPI in retail. It needs to be monitored against target weeks of cover for each category and season stage.
- Current solution: Retail management system report or manual calculation.
- What Wimmer provides: Weeks of cover calculation against target, with alerts for over/under positions (Milestone 5).
- Validation status: HYPOTHESIS

**Q11. Which stores are holding significantly more stock than others for the same SKU?**
- Context: Uneven stock distribution across stores leaves some stores with stockouts while others have excess. This is addressable through inter-store transfers.
- Current solution: Stock reports by store. No automatic transfer recommendations.
- What Wimmer provides: Stock distribution analysis and inter-store transfer recommendations (Milestone 5+).
- Validation status: ASSUMPTION

**Q12. What is my size run analysis for apparel — which sizes are out of stock?**
- Context: In apparel, the value of a SKU degrades rapidly as the size run breaks (when common sizes sell out but fringe sizes remain). Tracking size run integrity is essential for apparel retailers.
- Current solution: Manual review of size-level stock reports.
- What Wimmer provides: Size run analysis and depth recommendation (Milestone 5, apparel-specific feature).
- Validation status: ASSUMPTION

### Category: Margin Optimisation

**Q13. What is the optimal markdown depth and timing to clear my end-of-season stock?**
- Context: Taking too deep a markdown too early leaves money on the table. Taking too shallow a markdown too late leaves stock unsold. The optimal strategy depends on the remaining sell-through weeks and historical price elasticity.
- Current solution: Buyer experience and gut-feel. Some retailers use markdown tools in their retail management systems.
- What Wimmer provides: Markdown timing and depth recommendation based on weeks of cover and seasonal pattern (Milestone 5).
- Validation status: HYPOTHESIS

**Q14. Which supplier offers the best margin after accounting for returns and markdown risk?**
- Context: Initial margin (cost vs. sell price) is only part of the picture. A supplier with a generous returns policy or low markdown rates may deliver better realised margin than a cheaper supplier.
- Current solution: Initial margin calculation only. Returns and markdown contribution rarely quantified.
- What Wimmer provides: Realised margin analysis by supplier (Milestone 5).
- Validation status: ASSUMPTION

**Q15. How does promotional activity affect my sell-through rate?**
- Context: Promotions drive volume but erode margin. Understanding the trade-off requires comparing sell-through during and outside promotional periods.
- Current solution: Post-promotion review in some retailers. Often not tracked systematically.
- What Wimmer provides: Promotion effectiveness analysis (sell-through uplift vs. margin cost) (Milestone 5).
- Validation status: ASSUMPTION

---

## Cross-Industry Patterns

After mapping questions across all four verticals, the following patterns appear consistently:

### 1. Seasonal Demand Cycles Are Universal

Every industry operates on seasonal demand cycles. The cycle structure varies (weekly for restaurants, monthly/quarterly for retail, event-driven for hospitality, quarterly for supply chain) but the core problem is the same: allocating resources and inventory in advance of demand that is predictable but not certain.

**Wimmer insight:** The same forecasting engine — with appropriate data inputs and feature engineering — serves all four verticals. This is a fundamental platform advantage.

---

### 2. Procurement Timing Is Universally Under-Served

In all four verticals, the question of *when* to procure (order stock, hire staff, place supplier orders) relative to the demand peak is poorly answered. Current tools optimise for cost or convenience, not demand-adjusted timing.

**Wimmer insight:** A procurement timing recommendation that says "based on your occupancy forecast, begin linen orders by [date]" is immediately actionable and not available from any existing affordable tool.

---

### 3. Staffing Decisions Are Made on Gut Feel

Hotel GMs, restaurant managers, and retail floor managers all make staffing decisions based on experience and intuition rather than demand-data-driven forecasts. The staffing decision is made daily or weekly; the data to support it is rarely available in time.

**Wimmer insight:** The same occupancy/covers forecast that drives revenue recommendations can directly power staffing recommendations. This is a high-value, low-incremental-cost extension of the core forecasting output.

---

### 4. Year-on-Year Comparison Is the Default Mental Model

In every vertical, operators instinctively think in YoY terms: "How am I doing compared to this time last year?" This is the most natural benchmark for seasonal businesses because it eliminates the seasonal effect. All tools need to support YoY comparison as a primary view.

**Wimmer insight:** YoY comparison should be a first-class feature, not an afterthought. The database schema's date-based design supports this naturally.

---

### 5. The Cost of Poor Forecasting Is Visible but Not Measured

Every operator knows intuitively that poor forecasting costs them money. But almost none of them have a systematic way to measure how much. Food waste is thrown away without being costed. Stockouts are recorded as supply problems, not planning failures. Over-staffed shifts are not traced to forecast errors.

**Wimmer insight:** Giving operators a way to measure the cost of forecast errors (missed revenue from stockouts, waste costs from over-ordering) creates a powerful ROI narrative for the platform. This is a future feature but should be kept in mind during data model design.

---

### 6. Human Approval Is Preferred for Consequential Actions

None of the operators we have talked to (anecdotally, within the founding team's networks) would want software to automatically change room rates, place purchase orders, or modify staff rosters without a human check. The risk of error is too high and the trust in AI is not there yet.

**Wimmer insight:** The human approval workflow is not a limitation — it is a feature. The AI Decision Centre's pending → approved → acted architecture reflects how operators actually want to work with AI tools.

---

### 7. Data Is Available But Not Connected

In every vertical, relevant operational data exists but is locked in PMS reports, POS systems, WMS exports, or spreadsheets. The data is not automatically connected to forecasting or decision tools. The act of uploading a CSV to Wimmer is itself a productivity improvement for many operators.

**Wimmer insight:** The import-first strategy (CSV/Excel upload before any direct system integration) is the right MVP approach. It unblocks operators who cannot or will not connect their PMS immediately.

---

### 8. Confidence in Recommendations Requires Transparency

Operators are sceptical of black-box recommendations. When an AI tool tells them to change their room rates, they want to know *why*. The evidence chain (forecast → signal → recommendation) must be visible.

**Wimmer insight:** The evidence field on every recommendation is not a nice-to-have — it is what creates operator trust. The LLM's instruction to cite specific data points reinforces this.

---

## Validation Framework

### Interview Guide Template

For each customer interview, capture:

1. **Context:** Role, type of operation (number of rooms/covers/SKUs/stores), how long in operation
2. **Current tools:** What systems do they use? What do they hate about them?
3. **Top 3 daily decisions:** What decisions do they make every day that require data?
4. **Current process:** Walk through how they make each decision today. What data do they look at? How long does it take?
5. **Pain points:** Where does the current process break down? What decisions do they get wrong most often?
6. **Willingness to pay:** "If a tool could give you X 15 minutes before you need it, what would that be worth to you?"

### What Good Evidence Looks Like

**To move a question from ASSUMPTION → HYPOTHESIS:**
- At least one founding team member has experienced this problem directly in their career

**To move a question from HYPOTHESIS → VALIDATED:**
- At least 2 customer interviews with operators outside the founding team confirm the problem exists
- The operator describes their current solution (even if bad) — confirming they care enough to have tried solving it
- The operator can articulate what a better solution would look like
- The operator indicates some willingness to pay or change their workflow

**To invalidate a hypothesis:**
- Multiple interviews reveal operators do not recognise the problem as significant
- Current tools already solve the problem adequately at acceptable cost
- The decision the question describes is not actually made by the target persona

### Tracking Validation Progress

Validation status changes should be recorded in this document as a git commit to `docs/INDUSTRY_DISCOVERY.md` with:
- Interview date
- Organisation type (never names without explicit permission)
- What was confirmed, invalidated, or nuanced
- Updated status tag
