import React from "react";
import { TrendingUp, TrendingDown, Utensils, DollarSign, BarChart2, Users, Brain, CheckCircle, XCircle, MapPin } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { CoversChart } from "@/components/charts/CoversChart";
import { DEMO_RESTAURANT_KPI_SUMMARY, DEMO_RESTAURANT_PROPERTIES, DEMO_RESTAURANT_SIGNALS, DEMO_RESTAURANT_RECOMMENDATIONS } from "@/lib/demo-data";
import Link from "next/link";

function Delta({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {positive ? "+" : ""}{value.toFixed(1)}% vs last month
    </span>
  );
}

function KpiCard({ label, value, delta, icon: Icon, format = "number" }: {
  label: string; value: number; delta: number; icon: React.ComponentType<{ className?: string }>; format?: "percent" | "currency" | "number"
}) {
  const formatted = format === "percent"
    ? `${value.toFixed(1)}%`
    : format === "currency"
    ? `€${value.toLocaleString("de-DE", { minimumFractionDigits: 0 })}`
    : value.toFixed(2);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-emerald-600" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-slate-900 mb-1">{formatted}</div>
      <Delta value={delta} />
    </div>
  );
}

function RestaurantSignalsPanel() {
  const impactColor: Record<string, string> = {
    high: "bg-emerald-50 text-emerald-700 border-emerald-100",
    medium: "bg-amber-50 text-amber-700 border-amber-100",
    low: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Demand Signals</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{DEMO_RESTAURANT_SIGNALS.length} active</span>
      </div>
      <div className="space-y-3">
        {DEMO_RESTAURANT_SIGNALS.map(signal => (
          <div key={signal.id} className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${impactColor[signal.impact]}`}>
              <Utensils className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-800 leading-tight">{signal.title}</div>
              <div className="text-xs text-slate-500 mt-0.5 leading-tight">{signal.description}</div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${impactColor[signal.impact]}`}>{signal.impact} impact</span>
                {signal.direction === "positive"
                  ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                  : <TrendingDown className="w-3 h-3 text-red-400" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RestaurantRecommendations() {
  const riskColor: Record<string, string> = {
    low: "text-emerald-600 bg-emerald-50 border-emerald-100",
    medium: "text-amber-600 bg-amber-50 border-amber-100",
    high: "text-red-600 bg-red-50 border-red-100",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-900">AI Decision Centre</h3>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{DEMO_RESTAURANT_RECOMMENDATIONS.length} pending</span>
      </div>
      <div className="space-y-3">
        {DEMO_RESTAURANT_RECOMMENDATIONS.map(rec => (
          <div key={rec.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${riskColor[rec.risk_level]}`}>{rec.risk_level} risk</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded capitalize">{rec.category}</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mt-1.5 leading-tight">{rec.title}</h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rec.description}</p>
                <div className="mt-2 bg-emerald-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-emerald-800 mb-1">Suggested action</div>
                  <p className="text-xs text-emerald-700">{rec.suggested_action}</p>
                </div>
                {rec.expected_revenue_impact !== null && (
                  <div className="mt-2 text-xs text-slate-600">
                    <span className="font-medium">Estimated impact: </span>
                    <span className={rec.expected_revenue_impact >= 0 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                      {rec.expected_revenue_impact >= 0 ? "+" : ""}€{Math.abs(rec.expected_revenue_impact).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors">
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RestaurantsGrid() {
  const coverUtil: Record<string, number> = {
    "demo-mitte": 72.1,
    "demo-harbour": 68.5,
    "demo-bavarian": 64.6,
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Restaurants</h3>
        <Link href="/properties" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">View all</Link>
      </div>
      <div className="space-y-3">
        {DEMO_RESTAURANT_PROPERTIES.map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Utensils className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">{p.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                <span className="text-xs text-slate-400">{p.city}</span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-400">{p.total_covers} covers</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold text-slate-900">{coverUtil[p.id]}%</div>
              <div className="text-xs text-slate-400">util.</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CustomerPage() {
  const d = DEMO_RESTAURANT_KPI_SUMMARY;
  return (
    <div className="flex flex-col h-full">
      <Header title="Customer Dashboard" subtitle="Gastro Berlin Group — restaurant performance" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="rounded-xl bg-emerald-600 text-white px-5 py-3 flex items-center gap-3">
          <Utensils className="w-5 h-5 text-emerald-200 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold">Restaurant Demo — Gastro Berlin Group</span>
            <span className="text-xs text-emerald-200 ml-2">3 restaurants · Berlin, Hamburg, Munich</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Cover Utilisation" value={d.portfolio_covers} delta={d.covers_vs_lm} icon={Users} format="percent" />
          <KpiCard label="Avg Check" value={d.portfolio_avg_check} delta={d.avg_check_vs_lm} icon={DollarSign} format="currency" />
          <KpiCard label="RevPASH" value={d.portfolio_revpash} delta={d.revpash_vs_lm} icon={BarChart2} format="currency" />
          <KpiCard label="Revenue MTD" value={d.portfolio_revenue_mtd} delta={d.revenue_vs_lm} icon={Utensils} format="currency" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <CoversChart />
          </div>
          <div className="col-span-1">
            <RestaurantSignalsPanel />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <RestaurantRecommendations />
          </div>
          <div className="col-span-1">
            <RestaurantsGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
