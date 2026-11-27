import { TrendingUp, TrendingDown, Bed, DollarSign, BarChart2, Building2 } from "lucide-react";
import { DEMO_KPI_SUMMARY } from "@/lib/demo-data";

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
        <div className="w-7 h-7 rounded-lg bg-wimmer-50 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-wimmer-600" />
        </div>
      </div>
      <div className="text-2xl font-semibold text-slate-900 mb-1">{formatted}</div>
      <Delta value={delta} />
    </div>
  );
}

export function KpiCards() {
  const d = DEMO_KPI_SUMMARY;
  return (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard label="Occupancy" value={d.portfolio_occupancy} delta={d.occupancy_vs_lm} icon={Bed} format="percent" />
      <KpiCard label="ADR" value={d.portfolio_adr} delta={d.adr_vs_lm} icon={DollarSign} format="currency" />
      <KpiCard label="RevPAR" value={d.portfolio_revpar} delta={d.revpar_vs_lm} icon={BarChart2} format="currency" />
      <KpiCard label="Revenue MTD" value={d.portfolio_revenue_mtd} delta={d.revenue_vs_lm} icon={Building2} format="currency" />
    </div>
  );
}
