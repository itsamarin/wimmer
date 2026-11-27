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
    title: "Reduce Lieferando Commission Exposure",
    description: "Current delivery orders via Lieferando carry a 30% commission. Direct orders via idealo.de carry 8%. Shifting 20% of delivery volume to direct would save €1,840/month.",
    category: "procurement",
    suggested_action: "Run a direct-order incentive campaign (5% discount for direct orders). Update idealo.de listing with direct booking link.",
    expected_revenue_impact: 1840,
    confidence_score: 0.72,
    risk_level: "medium",
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
    platform: "Direct (idealo)",
    commission_pct: 8,
    avg_basket: 35.2,
    monthly_orders: 320,
    monthly_gmv: 11264,
    color: "#10b981",
  },
];

export const DEMO_COMPETITIVE_ALERTS = [
  {
    id: "ca1",
    severity: "high",
    title: "Lieferando prices 14% above market average",
    description: "Your delivery prices on Lieferando are indexed 14 points above the Berlin Mitte restaurant average. Consider a direct-order discount to shift volume.",
    metric: "+14 pts",
    action: "Review delivery pricing",
  },
  {
    id: "ca2",
    severity: "medium",
    title: "Wolt competitor added 3 new listings in 1km radius",
    description: "Three new restaurant listings within 1km on Wolt since last month. Market share pressure expected in the €25–35 avg basket segment.",
    metric: "3 new rivals",
    action: "Monitor basket size trend",
  },
  {
    id: "ca3",
    severity: "low",
    title: "Direct order conversion up 8% MoM",
    description: "idealo.de direct-link traffic converted at 8% higher rate this month. Reinforcing direct channel is cost-effective.",
    metric: "+8% conversion",
    action: "Increase direct channel visibility",
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
