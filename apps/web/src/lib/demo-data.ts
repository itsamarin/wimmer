/**
 * Demo data for development and onboarding.
 * All data is clearly simulated — not real hotel performance.
 */

export const DEMO_PROPERTIES = [
  {
    id: "demo-berlin",
    name: "Wimmer Berlin Central",
    city: "Berlin",
    country: "DE",
    total_rooms: 142,
    stars: 4,
    is_demo: true,
    property_type: "hotel",
    slug: "wimmer-berlin-central",
  },
  {
    id: "demo-hamburg",
    name: "Wimmer Hamburg Harbour",
    city: "Hamburg",
    country: "DE",
    total_rooms: 98,
    stars: 4,
    is_demo: true,
    property_type: "hotel",
    slug: "wimmer-hamburg-harbour",
  },
  {
    id: "demo-munich",
    name: "Wimmer Munich Residence",
    city: "Munich",
    country: "DE",
    total_rooms: 76,
    stars: 5,
    is_demo: true,
    property_type: "hotel",
    slug: "wimmer-munich-residence",
  },
];

export function generateDemoOccupancyData(months = 12) {
  const data = [];
  const base = new Date();
  base.setDate(1);

  const seasonalBase = [0.52, 0.55, 0.65, 0.72, 0.78, 0.82, 0.88, 0.85, 0.80, 0.75, 0.62, 0.70];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    const monthIdx = d.getMonth();
    const occ = seasonalBase[monthIdx] + (Math.random() - 0.5) * 0.08;
    const adr = 110 + seasonalBase[monthIdx] * 60 + (Math.random() - 0.5) * 15;
    data.push({
      month: d.toLocaleDateString("en-DE", { month: "short", year: "2-digit" }),
      occupancy: Math.round(occ * 1000) / 10,
      adr: Math.round(adr),
      revpar: Math.round(occ * adr),
      isForecast: false,
    });
  }

  for (let i = 1; i <= 3; i++) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + i);
    const monthIdx = d.getMonth();
    const occ = seasonalBase[monthIdx] + (Math.random() - 0.5) * 0.05;
    const adr = 110 + seasonalBase[monthIdx] * 60;
    data.push({
      month: d.toLocaleDateString("en-DE", { month: "short", year: "2-digit" }),
      occupancy: Math.round(occ * 1000) / 10,
      adr: Math.round(adr),
      revpar: Math.round(occ * adr),
      isForecast: true,
    });
  }

  return data;
}

export const DEMO_KPI_SUMMARY = {
  portfolio_occupancy: 72.4,
  portfolio_adr: 148.50,
  portfolio_revpar: 107.52,
  portfolio_revenue_mtd: 892_400,
  occupancy_vs_lm: +3.2,
  adr_vs_lm: +1.8,
  revpar_vs_lm: +5.1,
  revenue_vs_lm: +4.9,
};

export const DEMO_SIGNALS = [
  {
    id: "s1",
    type: "public_holiday",
    date: "2025-12-25",
    title: "Christmas Day",
    impact: "high",
    direction: "positive",
    description: "Major leisure travel demand. Extended stays across portfolio.",
  },
  {
    id: "s2",
    type: "seasonal_trend",
    date: "2025-12-01",
    title: "Christmas Market Season",
    impact: "high",
    direction: "positive",
    description: "December market season drives elevated leisure demand across Berlin, Hamburg and Munich.",
  },
  {
    id: "s3",
    type: "weather",
    date: "2025-11-27",
    title: "Cold Snap — Berlin",
    impact: "low",
    direction: "negative",
    description: "Cold weather forecast. Minor impact on leisure arrivals.",
  },
];

export const DEMO_RESTAURANT_PROPERTIES = [
  {
    id: "demo-mitte",
    name: "Mitte Fine Dining",
    city: "Berlin",
    total_covers: 90,
    cuisine: "Modern European",
  },
  {
    id: "demo-harbour",
    name: "Hamburg Harbour Bistro",
    city: "Hamburg",
    total_covers: 160,
    cuisine: "Seafood & Grill",
  },
  {
    id: "demo-bavarian",
    name: "Munich Bavarian Kitchen",
    city: "Munich",
    total_covers: 240,
    cuisine: "Traditional Bavarian",
  },
];

export const DEMO_RESTAURANT_KPI_SUMMARY = {
  portfolio_covers: 68.4,
  portfolio_avg_check: 42.80,
  portfolio_revpash: 29.28,
  portfolio_revenue_mtd: 312_600,
  covers_vs_lm: +4.1,
  avg_check_vs_lm: +2.3,
  revpash_vs_lm: +6.5,
  revenue_vs_lm: +5.8,
};

export function generateDemoCoversData(months = 12) {
  const data = [];
  const base = new Date();
  base.setDate(1);
  const seasonalBase = [0.52, 0.58, 0.64, 0.70, 0.74, 0.76, 0.80, 0.78, 0.75, 0.72, 0.68, 0.76];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    const idx = d.getMonth();
    const utilRate = seasonalBase[idx] + (Math.random() - 0.5) * 0.08;
    const avgCheck = 36 + seasonalBase[idx] * 18 + (Math.random() - 0.5) * 4;
    data.push({
      month: d.toLocaleDateString("en-DE", { month: "short", year: "2-digit" }),
      covers: Math.round(utilRate * 1000) / 10,
      avg_check: Math.round(avgCheck * 10) / 10,
      revpash: Math.round(utilRate * avgCheck * 10) / 10,
      isForecast: false,
    });
  }
  for (let i = 1; i <= 3; i++) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + i);
    const idx = d.getMonth();
    const utilRate = seasonalBase[idx] + (Math.random() - 0.5) * 0.05;
    const avgCheck = 36 + seasonalBase[idx] * 18;
    data.push({
      month: d.toLocaleDateString("en-DE", { month: "short", year: "2-digit" }),
      covers: Math.round(utilRate * 1000) / 10,
      avg_check: Math.round(avgCheck * 10) / 10,
      revpash: Math.round(utilRate * avgCheck * 10) / 10,
      isForecast: true,
    });
  }
  return data;
}

export const DEMO_RESTAURANT_SIGNALS = [
  {
    id: "rs1",
    type: "seasonal_event",
    date: "2025-12-24",
    title: "Christmas Eve Bookings",
    impact: "high",
    direction: "positive",
    description: "Full bookings expected across all venues. Christmas tasting menus drive 2.4× avg check vs standard nights.",
  },
  {
    id: "rs2",
    type: "public_holiday",
    date: "2026-02-14",
    title: "Valentine's Day",
    impact: "high",
    direction: "positive",
    description: "Historically highest avg check night of the year (+38% vs baseline). Set menus recommended.",
  },
  {
    id: "rs3",
    type: "seasonal_trend",
    date: "2026-01-01",
    title: "Post-Holiday Lull",
    impact: "medium",
    direction: "negative",
    description: "January covers typically drop 22% below December peak. Adjust staffing and procurement accordingly.",
  },
];

export const DEMO_RESTAURANT_RECOMMENDATIONS = [
  {
    id: "rr1",
    title: "Launch Valentine's Set Menu",
    description: "Cover utilisation on Valentine's Day reaches 98% historically. A fixed set menu at €85pp would increase per-cover revenue by 42% vs carte average.",
    category: "revenue",
    suggested_action: "Create 3-course set menu at €85pp for 14 Feb. Open reservations by 15 Jan. Apply 2-cover minimum booking rule.",
    expected_revenue_impact: 9800,
    confidence_score: 0.85,
    risk_level: "low",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "rr2",
    title: "Scale Direct (idealo) Channel — It's Now Your #1 Revenue Driver",
    description: "Direct orders via idealo.de generated €86,912 GMV this month — 2.7× Lieferando — with only 8% commission vs 30%. Investing in idealo.de listing upgrades (featured placement, premium badge) is projected to add 400 orders/month.",
    category: "procurement",
    suggested_action: "Upgrade to idealo.de Premium Restaurant listing (€180/month). Add direct-order loyalty incentive: 5% off next order for customers who book direct. Target: 2,640 direct orders by February.",
    expected_revenue_impact: 14200,
    confidence_score: 0.84,
    risk_level: "low",
    status: "pending",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function generateDemoIdealoData(months = 12) {
  const data = [];
  const base = new Date();
  base.setDate(1);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    const drift = i * 0.3;
    data.push({
      month: d.toLocaleDateString("en-DE", { month: "short", year: "2-digit" }),
      your_index: Math.round((108 + drift + (Math.random() - 0.5) * 4) * 10) / 10,
      market_avg: Math.round((105 + drift * 0.6 + (Math.random() - 0.5) * 3) * 10) / 10,
      lieferando: Math.round((112 + drift * 0.8 + (Math.random() - 0.5) * 5) * 10) / 10,
      wolt: Math.round((109 + drift * 0.5 + (Math.random() - 0.5) * 4) * 10) / 10,
    });
  }
  return data;
}

// Delivery platforms (sell side) — where the restaurant sells food to end customers
export const DEMO_PLATFORM_COMMISSIONS = [
  {
    platform: "Lieferando",
    commission_pct: 30,
    avg_basket: 32.5,
    monthly_orders: 1240,
    monthly_gmv: 40300,
    color: "#ef4444",
  },
  {
    platform: "Wolt",
    commission_pct: 25,
    avg_basket: 28.8,
    monthly_orders: 680,
    monthly_gmv: 19584,
    color: "#f59e0b",
  },
  {
    platform: "Direct (own website)",
    commission_pct: 2,
    avg_basket: 36.0,
    monthly_orders: 420,
    monthly_gmv: 15120,
    color: "#6366f1",
  },
];

// idealo.de procurement summary (buy side) — what Wimmer POS spends via idealo.de
export const DEMO_IDEALO_PROCUREMENT_SUMMARY = {
  total_spend_mtd: 8_240,
  total_saved_mtd: 1_682,
  avg_saving_pct: 16.9,
  orders_placed: 47,
  best_saving_product: "Extra Virgin Olive Oil 5L (−19.9%)",
  spend_vs_lm: +12.4,
  saved_vs_lm: +18.6,
};

export function generateDemoProcurementSavings(months = 12) {
  const data = [];
  const base = new Date();
  base.setDate(1);
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setMonth(d.getMonth() - i);
    const baseSpend  = 5800 + (months - i) * 180 + (Math.random() - 0.5) * 400;
    const savingPct  = 0.13 + (months - i) * 0.003 + (Math.random() - 0.5) * 0.02;
    const saved      = Math.round(baseSpend * savingPct);
    data.push({
      month: d.toLocaleDateString("en-DE", { month: "short", year: "2-digit" }),
      spend:  Math.round(baseSpend),
      saved,
      orders: Math.round(28 + (months - i) * 1.2 + (Math.random() - 0.5) * 4),
    });
  }
  return data;
}

// Procurement market alerts — price intelligence from idealo.de
export const DEMO_PROCUREMENT_ALERTS = [
  {
    id: "pa1",
    severity: "high",
    title: "Olive oil prices rising — bulk buy window closing",
    description: "idealo.de price index for Extra Virgin Olive Oil 5L has risen 8% over the past 3 weeks due to Mediterranean harvest shortage. Current idealo.de price of €9.45/unit is forecast to reach €11.20 by mid-December. Wimmer POS recommends ordering now.",
    metric: "+8% trend",
    action: "Order 24 units now via idealo.de",
  },
  {
    id: "pa2",
    severity: "medium",
    title: "Callebaut chocolate bulk deal — 3 days remaining",
    description: "idealo.de is showing a limited-time bulk promotion on Callebaut 70% 2.5kg blocks at €35.20 (normally €41.20). The deal expires in 3 days. Your POS forecasts Christmas dessert demand requiring 15 blocks — this order would save €90.",
    metric: "−14.6% limited",
    action: "Lock in 15 units before deal expires",
  },
  {
    id: "pa3",
    severity: "low",
    title: "Riesling Kabinett case price at 6-month low",
    description: "The Riesling Kabinett case price on idealo.de has dropped to a 6-month low of €36.00/case. POS demand forecast shows December wine volume up 66%. This is an ideal time to stock up at the lowest available market price.",
    metric: "6-month low",
    action: "Pre-order 32 cases for December",
  },
];

// Delivery market competitive alerts (sell side)
export const DEMO_COMPETITIVE_ALERTS = [
  {
    id: "ca1",
    severity: "high",
    title: "Lieferando commission at 30% — highest cost channel",
    description: "Lieferando charges 30% commission on €40,300 GMV this month — costing €12,090 in fees. Your own direct website (2% processing) generates €15,120 GMV at only €302 in fees. Shifting 20% of Lieferando volume to direct would save €2,358/month.",
    metric: "€12,090 fees",
    action: "Drive direct website orders",
  },
  {
    id: "ca2",
    severity: "medium",
    title: "Wolt competitor added 3 new listings in 1km radius",
    description: "Three new restaurant listings within 1km on Wolt since last month. Market share pressure expected in the €25–35 avg basket segment.",
    metric: "3 new rivals",
    action: "Monitor Wolt basket size trend",
  },
  {
    id: "ca3",
    severity: "low",
    title: "Direct website orders up 18% MoM",
    description: "Own-website orders grew 18% this month vs last — the lowest-commission channel. At 2% processing fee vs 30% on Lieferando, every order shifted to direct saves €9.12 in fees on a €32 basket.",
    metric: "+18% direct",
    action: "Continue direct channel investment",
  },
];

export const DEMO_PROCUREMENT_DECISIONS = [
  // ── Proteins & Seafood ──────────────────────────────────────
  {
    id: "pd1",
    category: "Proteins & Seafood",
    urgency: "critical",
    product: "Fresh Atlantic Salmon Fillet (1kg portions)",
    reason: "Stock depletion — 2 days remaining",
    stock_days_remaining: 2,
    current_stock: "4 kg portions",
    consumption_rate: "2 kg/day at current 68% cover utilisation",
    recommended_qty: "30 kg (15 × 2kg packs)",
    qty_number: 15,
    estimated_cost: 318,
    current_supplier_price: 24.80,
    idealo_best_price: 21.20,
    idealo_saving_pct: 14.5,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=lachs+filet+frisch+1kg",
    covers_impact: "Affects 38 covers/day — salmon is on 2 of 3 set menu options",
    ai_reasoning: [
      "At 68% cover utilisation across Hamburg Harbour Bistro and Mitte Fine Dining, salmon consumption is running at 2.1kg/day based on last 14-day POS data.",
      "Current stock of 4kg portions will be exhausted by end of service tomorrow. No reorder has been placed with current supplier (Nordsee Großhandel GmbH) in the last 7 days.",
      "idealo.de shows Frischfisch-Direktversand at €21.20/kg — a 14.5% saving vs current contract rate of €24.80. Same-day delivery available for Berlin and Hamburg.",
    ],
    status: "pending",
  },
  {
    id: "pd2",
    category: "Proteins & Seafood",
    urgency: "high",
    product: "Beef Tenderloin A4 Grade (500g portions)",
    reason: "Low stock — 6 days remaining",
    stock_days_remaining: 6,
    current_stock: "12 × 500g portions",
    consumption_rate: "2 portions/day average; 4–5 on weekends",
    recommended_qty: "40 portions (20kg)",
    qty_number: 40,
    estimated_cost: 760,
    current_supplier_price: 21.50,
    idealo_best_price: 19.00,
    idealo_saving_pct: 11.6,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=rinderfilet+a4+500g+restaurant",
    covers_impact: "Main course at Mitte Fine Dining — 22% of table orders, highest margin dish at €38 plate cost",
    ai_reasoning: [
      "POS data shows beef tenderloin accounts for 22% of Mitte Fine Dining main courses. Weekend uplift averages +110% vs weekday demand — two Saturdays in the 6-day window means effective stock will run out by Friday.",
      "Christmas menu (launching 20 Dec) includes tenderloin as one of two mains. The forecast cover increase of +34% for Christmas period requires 48 portions/week vs the current 28.",
      "idealo.de Fleisch-Direktversand lists certified A4 grade at €19.00/portion — €2.50 cheaper than current butcher contract (Fleischerei Schreiber). Ordering 40 portions saves €100 and locks in pre-Christmas price before seasonal uplift.",
    ],
    status: "pending",
  },
  {
    id: "pd3",
    category: "Proteins & Seafood",
    urgency: "high",
    product: "Free-Range Chicken Whole (1.4–1.8kg)",
    reason: "Low stock — 8 days remaining",
    stock_days_remaining: 8,
    current_stock: "9 birds",
    consumption_rate: "1.1 birds/day — rotisserie is a daily special",
    recommended_qty: "35 birds",
    qty_number: 35,
    estimated_cost: 332,
    current_supplier_price: 10.80,
    idealo_best_price: 9.50,
    idealo_saving_pct: 12.0,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=freiland+huhn+ganz+1.5kg",
    covers_impact: "Munich Bavarian Kitchen daily rotisserie special — 15% of lunch covers",
    ai_reasoning: [
      "Munich Bavarian Kitchen runs a daily rotisserie chicken as the lunch special, consuming 1.1 birds/day on average. The 9 birds in stock cover only 8 days at this rate.",
      "The upcoming Nikolaustag (6 Dec) and pre-Christmas period historically increase rotisserie orders by 28% at the Munich venue. Factoring this uplift, effective stock runs out in 6 days.",
      "idealo.de Geflügel-Markt lists free-range birds from Bayern Bio at €9.50/bird — €1.30 cheaper per bird than current contract with Metzgerei Huber. Ordering 35 saves €45.50.",
    ],
    status: "pending",
  },
  {
    id: "pd4",
    category: "Proteins & Seafood",
    urgency: "medium",
    product: "Tiger Prawns 16/20 (1kg frozen)",
    reason: "Valentine's menu — pre-order required",
    stock_days_remaining: 22,
    current_stock: "8 kg",
    consumption_rate: "0.4 kg/day standard; 2.5 kg on event nights",
    recommended_qty: "25 kg (25 × 1kg packs)",
    qty_number: 25,
    estimated_cost: 487,
    current_supplier_price: 22.40,
    idealo_best_price: 19.50,
    idealo_saving_pct: 12.9,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=tiger+garnelen+1kg+tiefgefroren+16/20",
    covers_impact: "Valentine's starter across all 3 venues — planned for 14 Feb, 290 covers",
    ai_reasoning: [
      "Valentine's Day (14 Feb) is forecast at 98% cover utilisation across the portfolio — 290 covers total. The planned menu uses tiger prawns as the starter (8 prawns per cover = 290 × 8 = 2,320 prawns, ~16kg of 16/20 grade).",
      "Current stock of 8kg is insufficient. Lead time from frozen seafood supplier is 5–7 business days. Ordering by 7 Feb at the latest is required; ordering now captures pre-Valentine's pricing.",
      "idealo.de Meeresfrüchte lists Frozen Tiger Prawns at €19.50/kg (SeeFood GmbH) vs current supplier rate of €22.40 — saving €2.90/kg. On 25kg order that's €72.50 saved. Same quality 16/20 grade confirmed in product spec.",
    ],
    status: "pending",
  },

  // ── Fresh Produce ────────────────────────────────────────────
  {
    id: "pd5",
    category: "Fresh Produce",
    urgency: "critical",
    product: "Microgreens Mixed (100g tray)",
    reason: "Stock depletion — 3 days remaining",
    stock_days_remaining: 3,
    current_stock: "6 trays",
    consumption_rate: "2 trays/day — used as garnish on all starters and mains",
    recommended_qty: "30 trays (weekly standing order)",
    qty_number: 30,
    estimated_cost: 180,
    current_supplier_price: 7.50,
    idealo_best_price: 6.00,
    idealo_saving_pct: 20.0,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=microgreens+gemischt+100g",
    covers_impact: "Plating garnish on 100% of starters and mains at Mitte Fine Dining",
    ai_reasoning: [
      "Microgreens are used on every starter and main plate at Mitte Fine Dining — an average of 2 trays/day at current cover volume. 6 trays remaining covers only 3 days.",
      "The current supplier (Stadtgärtnerei Berlin) has a 48-hour lead time. Ordering today ensures no service gap. idealo.de lists Bio-Microgreens from UrbanFarm at €6.00/tray — 20% cheaper than the Stadtgärtnerei rate of €7.50.",
      "Consider switching to the weekly standing order at €6.00/tray — at 14 trays/week this saves €21/week (€1,092/year) for identical spec product.",
    ],
    status: "pending",
  },
  {
    id: "pd6",
    category: "Fresh Produce",
    urgency: "high",
    product: "Fresh Black Truffle Melanosporum (100g)",
    reason: "Christmas menu essential — not stocked",
    stock_days_remaining: 0,
    current_stock: "Not stocked",
    consumption_rate: "Est. 300g/week during Christmas menu (20 Dec – 6 Jan)",
    recommended_qty: "20 × 100g units",
    qty_number: 20,
    estimated_cost: 900,
    current_supplier_price: 54.00,
    idealo_best_price: 45.00,
    idealo_saving_pct: 16.7,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=schwarzer+trüffel+melanosporum+frisch+100g",
    covers_impact: "Christmas tasting menu (€145pp) — featured in 4 of 7 courses at Mitte Fine Dining",
    ai_reasoning: [
      "The planned Christmas tasting menu at Mitte Fine Dining (launching 20 Dec, 90-cover venue) features black truffle in the amuse-bouche, risotto, main, and cheese course. Estimated consumption: 15g/cover × 90 covers × 4 service days = 5,400g over the Christmas period.",
      "Fresh Melanosporum truffle season peaks in December and prices rise 25–35% after 10 Dec due to supply constraint. Ordering 20 × 100g units now locks in current market pricing before the peak. idealo.de lists certified Périgord origin at €45/100g vs current specialty supplier rate of €54.",
      "Saving of €9/unit × 20 units = €180 saved. At the Christmas menu price of €145pp, truffles account for ~€18 of food cost per cover — ordering now keeps food cost % within the 29% target.",
    ],
    status: "pending",
  },
  {
    id: "pd7",
    category: "Fresh Produce",
    urgency: "medium",
    product: "White Asparagus (500g bundles) — Spring Pre-Order",
    reason: "Seasonal pre-order — price locks in 31% below in-season rate",
    stock_days_remaining: 90,
    current_stock: "Pre-order window open",
    consumption_rate: "Est. 8 bundles/day during asparagus season (Apr–Jun)",
    recommended_qty: "200 bundles (pre-order for April delivery)",
    qty_number: 200,
    estimated_cost: 1180,
    current_supplier_price: 9.80,
    idealo_best_price: 5.90,
    idealo_saving_pct: 39.8,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=weißer+spargel+500g+frisch",
    covers_impact: "German asparagus season is highest-margin produce period — Spargel menu drives +18% covers vs baseline",
    ai_reasoning: [
      "German Spargel season (Spargelzeit) runs April–June and historically drives the single largest covers uplift of the year at Munich Bavarian Kitchen — +18% covers in May vs April baseline. Last year's asparagus menu contributed €42,000 in additional revenue.",
      "Pre-ordering 200 bundles from Spargelhof Schwetzingen for April delivery locks in the November contract price of €5.90/bundle vs an estimated in-season market price of €9.80. The €3.90/bundle saving on 200 units = €780 saved.",
      "idealo.de Spargel-Direktversand shows the current contract rate is competitive — this pre-order opportunity is flagged because the booking window closes 15 January and the price guarantee expires then.",
    ],
    status: "pending",
  },

  // ── Dairy & Chilled ──────────────────────────────────────────
  {
    id: "pd8",
    category: "Dairy & Chilled",
    urgency: "critical",
    product: "Heavy Cream 35% Fat (1L cartons)",
    reason: "Stock depletion — 4 days remaining",
    stock_days_remaining: 4,
    current_stock: "8 × 1L cartons",
    consumption_rate: "2L/day for sauces, desserts, and coffee service",
    recommended_qty: "48 × 1L cartons (3-week supply)",
    qty_number: 48,
    estimated_cost: 115,
    current_supplier_price: 2.80,
    idealo_best_price: 2.40,
    idealo_saving_pct: 14.3,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=sahne+35%+fett+1l+gastro",
    covers_impact: "Used in all cream sauces, panna cotta, and espresso service — 3 venues",
    ai_reasoning: [
      "Heavy cream is a base ingredient in 7 current menu dishes across the portfolio (beurre blanc, mushroom sauce, panna cotta, velouté, crème brûlée, café crème, and truffle risotto). Daily consumption of 2L means 8 cartons = 4 days stock.",
      "Christmas menu launches 20 Dec — the dessert component (crème brûlée and panna cotta) increases cream consumption by an estimated 65%. Ordering 48 cartons covers 3 weeks at standard pace or approximately 10 days through the Christmas period.",
      "idealo.de Molkerei-Direktversand offers Schärdinger Professional 35% at €2.40/L vs current Metro contract of €2.80. Ordering 48 units saves €19.20 — small per-unit saving but cream is consumed continuously so the annual saving compounds to ~€240.",
    ],
    status: "pending",
  },
  {
    id: "pd9",
    category: "Dairy & Chilled",
    urgency: "high",
    product: "Unsalted Cultured Butter (250g blocks)",
    reason: "Christmas baking demand spike — 10 days remaining",
    stock_days_remaining: 10,
    current_stock: "20 × 250g blocks",
    consumption_rate: "2 blocks/day standard; 5–6 blocks/day during Christmas baking",
    recommended_qty: "80 × 250g blocks",
    qty_number: 80,
    estimated_cost: 192,
    current_supplier_price: 2.90,
    idealo_best_price: 2.40,
    idealo_saving_pct: 17.2,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=butter+ungesalzen+250g+gastro",
    covers_impact: "Christmas pastry programme at all 3 venues — Stollen, Lebkuchen, and petit fours",
    ai_reasoning: [
      "The Christmas pastry and petit fours programme across all 3 venues launches 1 Dec. Last year's programme consumed 5.8 blocks/day in December vs the standard 2.0 blocks/day — a 190% uplift. Current 20-block stock covers only 3.5 days at Christmas pace.",
      "Butter prices historically spike 15–22% in December due to European dairy demand. Ordering 80 blocks now vs waiting 10 days is estimated to save an additional €0.30–0.45/block on top of the idealo.de saving.",
      "idealo.de shows Kerrygold Unsalted Professional at €2.40/block vs Metro price of €2.90. On 80 blocks that's €40 saved on this order alone. Cultured butter spec is equivalent or superior to current product.",
    ],
    status: "pending",
  },
  {
    id: "pd10",
    category: "Dairy & Chilled",
    urgency: "medium",
    product: "Parmigiano Reggiano 24 Months (1kg wedge)",
    reason: "Price opportunity — 22% below contract rate on idealo.de",
    stock_days_remaining: 28,
    current_stock: "4 × 1kg wedges",
    consumption_rate: "0.15 kg/day across all venues (pasta, risotto, boards)",
    recommended_qty: "12 × 1kg wedges",
    qty_number: 12,
    estimated_cost: 326,
    current_supplier_price: 34.80,
    idealo_best_price: 27.20,
    idealo_saving_pct: 21.8,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=parmigiano+reggiano+24+monate+1kg",
    covers_impact: "Pasta, risotto, and cheese boards across Mitte Fine Dining and Hamburg Harbour Bistro",
    ai_reasoning: [
      "Parmigiano Reggiano features in 4 current menu items across two venues. At 150g/day consumption, 4 wedges = 27 days stock — adequate, but idealo.de has flagged an unusually low price from an Italian DOP specialist.",
      "idealo.de currently shows DOP-certified 24-month Parmigiano from Formaggeria Milano at €27.20/kg — 21.8% below the current contract rate of €34.80 from Käsehaus Weber. Same certification, same grade, 2-day delivery.",
      "Stocking 12 wedges (80-day supply at current pace) locks in this price before the seasonal uplift that typically hits in January as Christmas demand unwinds and cheese merchants reprice. Total saving on this order: €91.20.",
    ],
    status: "pending",
  },

  // ── Beverages & Wine ─────────────────────────────────────────
  {
    id: "pd11",
    category: "Beverages & Wine",
    urgency: "high",
    product: "Riesling Kabinett 0.75L (case of 6)",
    reason: "December forecast demand — 21 days stock",
    stock_days_remaining: 21,
    current_stock: "12 cases",
    consumption_rate: "4.2 cases/week standard; 7+ cases/week in December",
    recommended_qty: "32 cases",
    qty_number: 32,
    estimated_cost: 1152,
    current_supplier_price: 42.00,
    idealo_best_price: 36.00,
    idealo_saving_pct: 14.3,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=riesling+kabinett+0.75l+weinkarton+6er",
    covers_impact: "Best-selling wine list item — 34% of all wine orders across the portfolio",
    ai_reasoning: [
      "Riesling Kabinett is the highest-selling wine across the portfolio, accounting for 34% of all wine orders by volume. December forecasts show a 66% uplift in wine covers (Christmas parties, festive dining) bringing weekly consumption to an estimated 7.2 cases/week.",
      "At 7.2 cases/week, the 12 cases in stock run out in 11.7 days — well inside the 7-day delivery window from current wine merchant (Weingut Hofmann). The apparent 21-day figure uses the standard consumption rate and is misleading.",
      "idealo.de Weinversand lists the identical Mosel Riesling Kabinett at €36.00/case vs the current contract of €42.00 — €6.00 saving per case. Ordering 32 cases covers the entire December period and saves €192.",
    ],
    status: "pending",
  },
  {
    id: "pd12",
    category: "Beverages & Wine",
    urgency: "high",
    product: "Champagne Brut NV 0.75L (case of 6)",
    reason: "New Year's Eve pre-order — price rises 28% after 15 Dec",
    stock_days_remaining: 35,
    current_stock: "5 cases",
    consumption_rate: "0.5 cases/week standard; 8–12 cases on NYE alone",
    recommended_qty: "20 cases",
    qty_number: 20,
    estimated_cost: 2240,
    current_supplier_price: 132.00,
    idealo_best_price: 112.00,
    idealo_saving_pct: 15.2,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=champagne+brut+nv+0.75l+6er+karton",
    covers_impact: "New Year's Eve gala across all 3 venues — 100% of NYE tables receive a Champagne toast",
    ai_reasoning: [
      "New Year's Eve service (31 Dec) across all 3 venues is projected at 290 covers with a mandatory Champagne toast included in the €185pp NYE gala menu. At 1 flute per cover (5 flutes/bottle, 6 bottles/case) the event alone requires 10+ cases.",
      "Champagne distributor pricing typically increases 25–30% after 15 December due to end-of-year demand spike. Ordering 20 cases before 15 Dec at the current idealo.de rate of €112/case vs post-15 Dec rate of ~€155 represents a saving of €860.",
      "idealo.de Schaumwein-Versand lists Champagne Collet Brut NV at €112/case — €20 below current wine merchant contract. This is a reputable NV Champagne at the same quality tier currently on the wine list.",
    ],
    status: "pending",
  },
  {
    id: "pd13",
    category: "Beverages & Wine",
    urgency: "medium",
    product: "San Pellegrino Sparkling 1L (case of 12)",
    reason: "Event season stock-up — 18% below standard case price",
    stock_days_remaining: 30,
    current_stock: "14 cases",
    consumption_rate: "3 cases/week standard; 5+ cases/week in December",
    recommended_qty: "24 cases",
    qty_number: 24,
    estimated_cost: 403,
    current_supplier_price: 19.80,
    idealo_best_price: 16.80,
    idealo_saving_pct: 15.2,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=san+pellegrino+1l+kiste+12",
    covers_impact: "Table water for all 3 venues — 72% of covers order sparkling over still",
    ai_reasoning: [
      "San Pellegrino is the standard sparkling water across all venues and accounts for 72% of water orders. December's increased covers push consumption to ~5 cases/week, meaning 14 cases on hand covers only 20 days — not through Christmas week.",
      "idealo.de Getränke-Direktversand currently shows a promotional price on 12-packs of €16.80/case vs the Metro contract rate of €19.80 — a 15.2% saving. The promotion is flagged as ending on 30 Nov.",
      "Ordering 24 cases secures the promotional price, covers through January, and saves €72 vs buying 24 cases at Metro rate. Minimum 24-case order applies for delivery to all 3 venues in one consolidated delivery.",
    ],
    status: "pending",
  },

  // ── Dry Goods & Pantry ───────────────────────────────────────
  {
    id: "pd14",
    category: "Dry Goods & Pantry",
    urgency: "critical",
    product: "Extra Virgin Olive Oil 5L (Sicilian DOP)",
    reason: "Stock depletion — 3 days remaining",
    stock_days_remaining: 3,
    current_stock: "2 × 5L tins",
    consumption_rate: "3.3L/day across all venues for cooking and dressings",
    recommended_qty: "24 × 5L tins",
    qty_number: 24,
    estimated_cost: 227,
    current_supplier_price: 11.80,
    idealo_best_price: 9.45,
    idealo_saving_pct: 19.9,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=olivenöl+extra+vergine+5l+sizilien+dop",
    covers_impact: "Base cooking oil and dressing for 100% of savoury dishes across all 3 venues",
    ai_reasoning: [
      "EVOO is the base cooking medium for all savoury cooking at all 3 venues. Combined consumption across the portfolio is 3.3L/day (Hamburg Harbour Bistro 1.5L, Mitte Fine Dining 1.2L, Munich Bavarian 0.6L). 2 tins = 10L = approximately 3 days.",
      "The current supplier (Feinkost-Import Müller) has a 3–5 business day lead time. Given stock runs out in 3 days, any delay creates a service gap. idealo.de shows a same-day Berlin delivery option for Sicilian DOP at €9.45/tin vs €11.80 contract rate.",
      "Ordering 24 tins (120L — approximately 36-day supply) locks in the idealo.de price, saves €56.40, and avoids a repeat emergency reorder. AI suggests moving to a standing bi-monthly order at this supplier to prevent recurrence.",
    ],
    status: "pending",
  },
  {
    id: "pd15",
    category: "Dry Goods & Pantry",
    urgency: "high",
    product: "Dark Chocolate Callebaut 70% (2.5kg blocks)",
    reason: "Christmas dessert demand — 7 days remaining",
    stock_days_remaining: 7,
    current_stock: "3 × 2.5kg blocks",
    consumption_rate: "1 block/week standard; 2.5 blocks/week during Christmas pastry programme",
    recommended_qty: "15 × 2.5kg blocks",
    qty_number: 15,
    estimated_cost: 528,
    current_supplier_price: 41.20,
    idealo_best_price: 35.20,
    idealo_saving_pct: 14.6,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=callebaut+70+prozent+2.5kg+schokolade+gastro",
    covers_impact: "Christmas petit fours, chocolate fondant, Yule log — all 3 venues starting 1 Dec",
    ai_reasoning: [
      "The Christmas pastry programme launches 1 Dec and features chocolate as a central element: Yule log, chocolate fondant (Mitte), and chocolate-dipped petit fours (all venues). Programme consumption estimate is 2.5 blocks/week vs standard 1 block/week.",
      "At 2.5 blocks/week, 3 blocks on hand = 8.4 days. Christmas programme runs until 6 Jan — requiring approximately 14 blocks over the period. Ordering 15 blocks covers the season plus a small buffer for January.",
      "idealo.de Backzutaten-Versand lists Callebaut 70% 2.5kg (identical product, same batch code range) at €35.20 vs Metro catering price of €41.20. Saving of €6.00/block × 15 blocks = €90 on this order.",
    ],
    status: "pending",
  },
  {
    id: "pd16",
    category: "Dry Goods & Pantry",
    urgency: "high",
    product: "Semolina Pasta Assorted 5kg (bulk catering packs)",
    reason: "Price opportunity + Christmas menu restocking",
    stock_days_remaining: 14,
    current_stock: "8 × 5kg packs",
    consumption_rate: "2.8 kg/day across pasta dishes — 3 current menu items",
    recommended_qty: "30 × 5kg packs",
    qty_number: 30,
    estimated_cost: 127,
    current_supplier_price: 5.20,
    idealo_best_price: 4.24,
    idealo_saving_pct: 18.5,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=pasta+5kg+semolina+hartweizen+gastro",
    covers_impact: "3 pasta dishes across Hamburg and Mitte venues — includes Christmas menu truffle tagliatelle",
    ai_reasoning: [
      "Pasta is used in 3 menu items: linguine alle vongole (Hamburg), fettuccine al tartufo (Mitte Christmas menu), and a pasta del giorno. Combined consumption is 2.8kg/day. 8 packs = 40kg = 14 days stock, but the Christmas menu tagliatelle launches 20 Dec and will push daily consumption to 4.1kg.",
      "At 4.1kg/day during the Christmas period, existing stock lasts only 10 days from today — running out 7 Dec, two weeks before the truffle tagliatelle launches.",
      "idealo.de Lebensmittel-Großhandel lists De Cecco semolina 5kg catering packs at €4.24 vs current supplier rate of €5.20 — 18.5% saving. On 30 packs that's €28.80 saved. Bulk delivery in 2–3 days to all venues.",
    ],
    status: "pending",
  },
  {
    id: "pd17",
    category: "Dry Goods & Pantry",
    urgency: "medium",
    product: "Arborio Risotto Rice 1kg (catering grade)",
    reason: "Valentine's risotto menu — pre-stock required",
    stock_days_remaining: 45,
    current_stock: "12 × 1kg packs",
    consumption_rate: "0.3 kg/day standard; 1.8 kg/day on risotto special nights",
    recommended_qty: "40 × 1kg packs",
    qty_number: 40,
    estimated_cost: 136,
    current_supplier_price: 4.10,
    idealo_best_price: 3.40,
    idealo_saving_pct: 17.1,
    idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=arborio+reis+1kg+risotto+gastro",
    covers_impact: "Valentine's Day (14 Feb) truffle risotto set menu — planned for all 290 covers",
    ai_reasoning: [
      "Valentine's Day menu (14 Feb) plans a truffle and saffron risotto as the centrepiece main. At 90g dry rice per cover × 290 Valentine's covers, the event alone requires 26kg of Arborio. Current stock of 12kg is insufficient for the event.",
      "Standard consumption between now and 14 Feb will consume a further ~18kg at 0.3kg/day, bringing total stock needed to ~44kg. Ordering 40 × 1kg packs provides exactly the right buffer.",
      "idealo.de lists Riso Gallo Arborio at €3.40/kg vs current Metro rate of €4.10 — 17.1% saving. Ordering 40kg now saves €28.00 and locks in pre-Valentine's pricing before restaurant demand spikes in late January.",
    ],
    status: "pending",
  },
];

export const DEMO_RECOMMENDATIONS = [
  {
    id: "r1",
    title: "Increase ADR for Christmas Period",
    description: "Forecast data indicates occupancy will exceed 85% in the Christmas week across all three properties. Historical patterns confirm this is a consistent peak.",
    category: "revenue",
    suggested_action: "Review room rate strategy for 20–28 December. Consider minimum length-of-stay restrictions of 2 nights.",
    expected_revenue_impact: 18400,
    confidence_score: 0.78,
    risk_level: "low",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "r2",
    title: "Staffing Review — January Low Season",
    description: "Forecast shows occupancy dropping below 55% in the first three weeks of January. Operational staffing adjustment may reduce costs.",
    category: "operations",
    suggested_action: "Review housekeeping and F&B staffing rotas for January. Align schedules with predicted occupancy.",
    expected_revenue_impact: -3200,
    confidence_score: 0.65,
    risk_level: "medium",
    status: "pending",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// POS Tables
export const DEMO_TABLES = [
  // Main Floor
  { id: "t1",  name: "T1",  section: "Main Floor",    capacity: 2, status: "occupied",  covers_seated: 2, seated_at: "18:45", server: "Anna S.",   order_value: 68,  order_status: "mains" },
  { id: "t2",  name: "T2",  section: "Main Floor",    capacity: 4, status: "occupied",  covers_seated: 4, seated_at: "19:00", server: "Max K.",    order_value: 196, order_status: "starters" },
  { id: "t3",  name: "T3",  section: "Main Floor",    capacity: 4, status: "available", covers_seated: 0, seated_at: null,    server: null,        order_value: 0,   order_status: null },
  { id: "t4",  name: "T4",  section: "Main Floor",    capacity: 6, status: "reserved",  covers_seated: 0, seated_at: null,    server: null,        order_value: 0,   order_status: null, reserved_at: "20:00", reserved_name: "Müller" },
  { id: "t5",  name: "T5",  section: "Main Floor",    capacity: 2, status: "occupied",  covers_seated: 2, seated_at: "19:20", server: "Anna S.",   order_value: 112, order_status: "dessert" },
  { id: "t6",  name: "T6",  section: "Main Floor",    capacity: 4, status: "needs_cleaning", covers_seated: 0, seated_at: null, server: null,      order_value: 0,   order_status: null },
  { id: "t7",  name: "T7",  section: "Main Floor",    capacity: 2, status: "available", covers_seated: 0, seated_at: null,    server: null,        order_value: 0,   order_status: null },
  { id: "t8",  name: "T8",  section: "Main Floor",    capacity: 8, status: "occupied",  covers_seated: 7, seated_at: "18:30", server: "Max K.",    order_value: 420, order_status: "mains" },
  // Terrace
  { id: "t9",  name: "T9",  section: "Terrace",       capacity: 2, status: "available", covers_seated: 0, seated_at: null,    server: null,        order_value: 0,   order_status: null },
  { id: "t10", name: "T10", section: "Terrace",       capacity: 4, status: "occupied",  covers_seated: 3, seated_at: "19:35", server: "Lena B.",   order_value: 134, order_status: "starters" },
  { id: "t11", name: "T11", section: "Terrace",       capacity: 4, status: "reserved",  covers_seated: 0, seated_at: null,    server: null,        order_value: 0,   order_status: null, reserved_at: "20:30", reserved_name: "Schmidt" },
  { id: "t12", name: "T12", section: "Terrace",       capacity: 2, status: "available", covers_seated: 0, seated_at: null,    server: null,        order_value: 0,   order_status: null },
  // Private Dining
  { id: "t13", name: "PDR", section: "Private Dining", capacity: 12, status: "occupied", covers_seated: 10, seated_at: "18:00", server: "Lena B.", order_value: 980, order_status: "mains" },
  { id: "t14", name: "Bar", section: "Bar",             capacity: 8,  status: "occupied", covers_seated: 5,  seated_at: "19:50", server: "Tom H.",   order_value: 210, order_status: "drinks" },
];

// POS Live Orders
export const DEMO_LIVE_ORDERS = [
  {
    id: "o1", table: "T2", covers: 4, server: "Max K.", status: "new",
    ordered_at: "19:28", elapsed_min: 3,
    items: [
      { name: "Salmon Tartare", qty: 2, price: 18, course: "starter" },
      { name: "Beef Tenderloin", qty: 1, price: 38, course: "main" },
      { name: "Truffle Tagliatelle", qty: 1, price: 28, course: "main" },
    ],
    special_notes: "1× gluten-free pasta",
    total: 102,
  },
  {
    id: "o2", table: "T10", covers: 3, server: "Lena B.", status: "new",
    ordered_at: "19:40", elapsed_min: 1,
    items: [
      { name: "Burrata & Prosciutto", qty: 3, price: 16, course: "starter" },
    ],
    special_notes: "",
    total: 48,
  },
  {
    id: "o3", table: "T8", covers: 7, server: "Max K.", status: "kitchen",
    ordered_at: "18:52", elapsed_min: 24,
    items: [
      { name: "Beef Tenderloin", qty: 3, price: 38, course: "main" },
      { name: "Sea Bass en Papillote", qty: 2, price: 34, course: "main" },
      { name: "Mushroom Risotto", qty: 2, price: 24, course: "main" },
    ],
    special_notes: "2× medium-rare, 1× well done",
    total: 262,
  },
  {
    id: "o4", table: "PDR", covers: 10, server: "Lena B.", status: "kitchen",
    ordered_at: "18:35", elapsed_min: 41,
    items: [
      { name: "Truffle Tagliatelle", qty: 4, price: 28, course: "main" },
      { name: "Beef Tenderloin", qty: 3, price: 38, course: "main" },
      { name: "Sea Bass en Papillote", qty: 3, price: 34, course: "main" },
    ],
    special_notes: "Pre-paid event — invoice to Siemens AG",
    total: 328,
  },
  {
    id: "o5", table: "T1", covers: 2, server: "Anna S.", status: "ready",
    ordered_at: "19:05", elapsed_min: 36,
    items: [
      { name: "Crème Brûlée", qty: 1, price: 12, course: "dessert" },
      { name: "Tiramisu", qty: 1, price: 11, course: "dessert" },
    ],
    special_notes: "",
    total: 23,
  },
  {
    id: "o6", table: "T5", covers: 2, server: "Anna S.", status: "ready",
    ordered_at: "19:38", elapsed_min: 3,
    items: [
      { name: "Chocolate Fondant", qty: 2, price: 13, course: "dessert" },
      { name: "Espresso", qty: 2, price: 4, course: "drinks" },
    ],
    special_notes: "",
    total: 34,
  },
  {
    id: "o7", table: "Bar", covers: 5, server: "Tom H.", status: "kitchen",
    ordered_at: "19:52", elapsed_min: 2,
    items: [
      { name: "Charcuterie Board", qty: 2, price: 22, course: "starter" },
      { name: "Truffle Fries", qty: 1, price: 9, course: "sides" },
    ],
    special_notes: "",
    total: 53,
  },
];

// POS Menu
export const DEMO_MENU_CATEGORIES = ["Starters", "Pasta", "Mains", "Sides", "Desserts", "Beverages"];

export const DEMO_MENU_ITEMS = [
  // Starters
  { id: "mi1",  category: "Starters",   name: "Salmon Tartare",           price: 18, allergens: ["fish"],               active: true,  sold_today: 24, food_cost_pct: 28 },
  { id: "mi2",  category: "Starters",   name: "Burrata & Prosciutto",     price: 16, allergens: ["dairy"],              active: true,  sold_today: 18, food_cost_pct: 32 },
  { id: "mi3",  category: "Starters",   name: "Wild Mushroom Velouté",    price: 12, allergens: ["dairy", "celery"],    active: true,  sold_today: 11, food_cost_pct: 22 },
  { id: "mi4",  category: "Starters",   name: "Beef Carpaccio",           price: 20, allergens: ["beef", "mustard"],    active: true,  sold_today: 9,  food_cost_pct: 35 },
  { id: "mi5",  category: "Starters",   name: "Charcuterie Board",        price: 22, allergens: ["pork", "mustard"],    active: true,  sold_today: 14, food_cost_pct: 30 },
  // Pasta
  { id: "mi6",  category: "Pasta",      name: "Truffle Tagliatelle",      price: 28, allergens: ["gluten", "eggs", "dairy"], active: true, sold_today: 31, food_cost_pct: 29 },
  { id: "mi7",  category: "Pasta",      name: "Linguine alle Vongole",    price: 26, allergens: ["gluten", "shellfish"], active: true, sold_today: 19, food_cost_pct: 31 },
  { id: "mi8",  category: "Pasta",      name: "Pappardelle Ragu",         price: 24, allergens: ["gluten", "eggs"],      active: true, sold_today: 16, food_cost_pct: 27 },
  // Mains
  { id: "mi9",  category: "Mains",      name: "Beef Tenderloin",          price: 38, allergens: ["beef", "dairy"],      active: true,  sold_today: 28, food_cost_pct: 36 },
  { id: "mi10", category: "Mains",      name: "Sea Bass en Papillote",    price: 34, allergens: ["fish", "dairy"],      active: true,  sold_today: 22, food_cost_pct: 33 },
  { id: "mi11", category: "Mains",      name: "Mushroom Risotto (v)",     price: 24, allergens: ["dairy"],              active: true,  sold_today: 15, food_cost_pct: 24 },
  { id: "mi12", category: "Mains",      name: "Rack of Lamb",             price: 42, allergens: ["lamb", "dairy"],      active: true,  sold_today: 12, food_cost_pct: 38 },
  { id: "mi13", category: "Mains",      name: "Rotisserie Chicken",       price: 28, allergens: ["poultry"],            active: true,  sold_today: 20, food_cost_pct: 28 },
  // Sides
  { id: "mi14", category: "Sides",      name: "Truffle Fries",            price: 9,  allergens: ["gluten"],             active: true,  sold_today: 38, food_cost_pct: 18 },
  { id: "mi15", category: "Sides",      name: "Seasonal Vegetables",      price: 7,  allergens: [],                     active: true,  sold_today: 24, food_cost_pct: 20 },
  { id: "mi16", category: "Sides",      name: "Creamed Spinach",          price: 8,  allergens: ["dairy"],              active: false, sold_today: 0,  food_cost_pct: 22 },
  // Desserts
  { id: "mi17", category: "Desserts",   name: "Crème Brûlée",             price: 12, allergens: ["dairy", "eggs"],      active: true,  sold_today: 20, food_cost_pct: 20 },
  { id: "mi18", category: "Desserts",   name: "Chocolate Fondant",        price: 13, allergens: ["gluten", "dairy", "eggs"], active: true, sold_today: 18, food_cost_pct: 24 },
  { id: "mi19", category: "Desserts",   name: "Tiramisu",                 price: 11, allergens: ["dairy", "eggs", "gluten"], active: true, sold_today: 15, food_cost_pct: 22 },
  { id: "mi20", category: "Desserts",   name: "Cheese Board (3 types)",   price: 16, allergens: ["dairy", "nuts"],      active: true,  sold_today: 10, food_cost_pct: 35 },
  // Beverages
  { id: "mi21", category: "Beverages",  name: "Riesling Kabinett 0.75L",  price: 38, allergens: ["sulphites"],          active: true,  sold_today: 22, food_cost_pct: 28 },
  { id: "mi22", category: "Beverages",  name: "Champagne Brut NV 0.75L",  price: 68, allergens: ["sulphites"],          active: true,  sold_today: 8,  food_cost_pct: 32 },
  { id: "mi23", category: "Beverages",  name: "San Pellegrino 1L",        price: 6,  allergens: [],                     active: true,  sold_today: 48, food_cost_pct: 15 },
  { id: "mi24", category: "Beverages",  name: "Espresso",                 price: 4,  allergens: [],                     active: true,  sold_today: 62, food_cost_pct: 10 },
];

// POS Inventory
export const DEMO_INVENTORY = [
  { id: "inv1",  name: "Atlantic Salmon (1kg)",         category: "Proteins",    stock: 4,    par: 20,  unit: "kg",    daily_usage: 2.1,  status: "critical", idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=lachs+filet+frisch+1kg" },
  { id: "inv2",  name: "Beef Tenderloin (500g)",        category: "Proteins",    stock: 12,   par: 30,  unit: "pcs",   daily_usage: 3.2,  status: "low",      idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=rinderfilet+500g" },
  { id: "inv3",  name: "Free-Range Chicken (whole)",    category: "Proteins",    stock: 9,    par: 20,  unit: "pcs",   daily_usage: 1.1,  status: "low",      idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=freiland+huhn+ganz" },
  { id: "inv4",  name: "Sea Bass Fillet (1kg)",         category: "Proteins",    stock: 18,   par: 15,  unit: "kg",    daily_usage: 1.4,  status: "ok",       idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=wolfsbarsch+filet+1kg" },
  { id: "inv5",  name: "Lamb Rack (French trimmed)",    category: "Proteins",    stock: 8,    par: 10,  unit: "pcs",   daily_usage: 1.0,  status: "low",      idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=lammracks+französisch" },
  { id: "inv6",  name: "Microgreens Mixed (100g)",      category: "Produce",     stock: 6,    par: 20,  unit: "trays", daily_usage: 2.0,  status: "critical", idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=microgreens+gemischt+100g" },
  { id: "inv7",  name: "Black Truffle (100g)",          category: "Produce",     stock: 0,    par: 15,  unit: "units", daily_usage: 0,    status: "critical", idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=schwarzer+trüffel+frisch+100g" },
  { id: "inv8",  name: "Seasonal Vegetables (mixed)",   category: "Produce",     stock: 12,   par: 10,  unit: "kg",    daily_usage: 1.2,  status: "ok",       idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=gemüse+gemischt+kg" },
  { id: "inv9",  name: "Heavy Cream 35% (1L)",          category: "Dairy",       stock: 8,    par: 24,  unit: "pcs",   daily_usage: 2.0,  status: "critical", idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=sahne+35+prozent+1l" },
  { id: "inv10", name: "Parmigiano Reggiano (1kg)",     category: "Dairy",       stock: 4,    par: 8,   unit: "kg",    daily_usage: 0.15, status: "low",      idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=parmigiano+reggiano+24+monate+1kg" },
  { id: "inv11", name: "Unsalted Butter (250g)",        category: "Dairy",       stock: 20,   par: 40,  unit: "pcs",   daily_usage: 2.0,  status: "low",      idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=butter+ungesalzen+250g" },
  { id: "inv12", name: "Extra Virgin Olive Oil (5L)",   category: "Dry Goods",   stock: 2,    par: 12,  unit: "tins",  daily_usage: 0.67, status: "critical", idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=olivenöl+extra+vergine+5l" },
  { id: "inv13", name: "Callebaut Dark Choc 70% (2.5kg)", category: "Dry Goods", stock: 3,    par: 8,   unit: "blocks",daily_usage: 0.14, status: "low",      idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=callebaut+70+prozent+2.5kg" },
  { id: "inv14", name: "Truffle Tagliatelle 5kg",       category: "Dry Goods",   stock: 8,    par: 10,  unit: "packs", daily_usage: 0.56, status: "ok",       idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=pasta+5kg+semolina" },
  { id: "inv15", name: "Arborio Rice (1kg)",            category: "Dry Goods",   stock: 12,   par: 10,  unit: "packs", daily_usage: 0.3,  status: "ok",       idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=arborio+reis+1kg" },
  { id: "inv16", name: "Riesling Kabinett (case/6)",    category: "Beverages",   stock: 12,   par: 20,  unit: "cases", daily_usage: 0.6,  status: "low",      idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=riesling+kabinett+weinkarton" },
  { id: "inv17", name: "Champagne Brut NV (case/6)",    category: "Beverages",   stock: 5,    par: 12,  unit: "cases", daily_usage: 0.07, status: "low",      idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=champagne+brut+nv+weinkarton" },
  { id: "inv18", name: "San Pellegrino 1L (case/24)",   category: "Beverages",   stock: 14,   par: 10,  unit: "cases", daily_usage: 0.43, status: "ok",       idealo_url: "https://www.idealo.de/preisvergleich/MainSearchProductCategory.html?q=san+pellegrino+1l+kiste" },
];

// POS Staff
export const DEMO_STAFF = [
  { id: "st1", name: "Anna Schmidt",  role: "Head Waiter",  status: "on_shift", tables: ["T1", "T5"],        sales_today: 1840, covers_today: 32, shift: "16:00–00:00" },
  { id: "st2", name: "Max König",     role: "Waiter",       status: "on_shift", tables: ["T2", "T8"],        sales_today: 2140, covers_today: 44, shift: "16:00–00:00" },
  { id: "st3", name: "Lena Bauer",    role: "Waiter",       status: "on_shift", tables: ["T10", "T11", "PDR"], sales_today: 3280, covers_today: 56, shift: "17:00–01:00" },
  { id: "st4", name: "Tom Huber",     role: "Bartender",    status: "on_shift", tables: ["Bar"],             sales_today: 940,  covers_today: 28, shift: "17:00–02:00" },
  { id: "st5", name: "Sara Meier",    role: "Host",         status: "on_shift", tables: [],                  sales_today: 0,    covers_today: 0,  shift: "17:00–23:00" },
  { id: "st6", name: "Klaus Weber",   role: "Head Chef",    status: "kitchen",  tables: [],                  sales_today: 0,    covers_today: 0,  shift: "14:00–00:00" },
  { id: "st7", name: "Petra Lang",    role: "Sous Chef",    status: "kitchen",  tables: [],                  sales_today: 0,    covers_today: 0,  shift: "15:00–23:00" },
  { id: "st8", name: "Jonas Roth",    role: "Waiter",       status: "off_shift", tables: [],                 sales_today: 820,  covers_today: 18, shift: "11:00–17:00" },
];

// POS Z-Report (today)
export const DEMO_Z_REPORT = {
  date: "2026-11-27",
  venue: "Mitte Fine Dining",
  shift: "Evening",
  covers: 94,
  avg_check: 51.28,
  total_revenue: 4820,
  food_revenue: 3140,
  beverage_revenue: 1240,
  other_revenue: 440,
  payments: {
    card: 3890,
    cash: 420,
    voucher: 510,
  },
  vat: {
    vat_7_base: 3429, vat_7_amount: 240,
    vat_19_base: 4014, vat_19_amount: 762,
  },
  discounts: 180,
  voids: 24,
  refunds: 0,
  table_turns: 2.1,
  avg_cover_time_min: 68,
};

// Hourly sales today
export const DEMO_HOURLY_SALES = [
  { hour: "11:00", revenue: 180,  covers: 4  },
  { hour: "12:00", revenue: 620,  covers: 18 },
  { hour: "13:00", revenue: 840,  covers: 22 },
  { hour: "14:00", revenue: 420,  covers: 10 },
  { hour: "15:00", revenue: 140,  covers: 4  },
  { hour: "16:00", revenue: 80,   covers: 2  },
  { hour: "17:00", revenue: 220,  covers: 6  },
  { hour: "18:00", revenue: 980,  covers: 24 },
  { hour: "19:00", revenue: 1240, covers: 28 },
  { hour: "20:00", revenue: 1180, covers: 26 },
  { hour: "21:00", revenue: 820,  covers: 18 },
  { hour: "22:00", revenue: 420,  covers: 10 },
];
