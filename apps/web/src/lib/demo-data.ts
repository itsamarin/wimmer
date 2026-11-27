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
