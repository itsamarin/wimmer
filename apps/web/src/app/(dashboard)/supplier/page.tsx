import { Header } from "@/components/layout/Header";
import { IdealoChart } from "@/components/charts/IdealoChart";
import { PlatformCommissionPanel } from "@/components/dashboard/PlatformCommissionPanel";
import { CompetitiveAlertsPanel } from "@/components/dashboard/CompetitiveAlertsPanel";
import { ProcurementDecisionsPanel } from "@/components/dashboard/ProcurementDecisionsPanel";
import { DEMO_PLATFORM_COMMISSIONS } from "@/lib/demo-data";
import { TrendingUp, TrendingDown, Package, ExternalLink } from "lucide-react";

function SupplierKpiCards() {
  const totalOrders = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_orders, 0);
  const totalGmv = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_gmv, 0);
  const totalCommission = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_gmv * p.commission_pct / 100, 0);
  const blendedRate = (totalCommission / totalGmv) * 100;
  const directShare = Math.round((DEMO_PLATFORM_COMMISSIONS[2].monthly_orders / totalOrders) * 100);

  const cards = [
    {
      label: "Total Delivery Orders",
      value: totalOrders.toLocaleString("de-DE"),
      delta: +6.4,
      positive: true,
    },
    {
      label: "Delivery GMV",
      value: `€${Math.round(totalGmv).toLocaleString("de-DE")}`,
      delta: +8.1,
      positive: true,
    },
    {
      label: "Blended Commission",
      value: `${blendedRate.toFixed(1)}%`,
      delta: -1.2,
      positive: false,
    },
    {
      label: "Direct Channel Share",
      value: `${directShare}%`,
      delta: +2.8,
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-orange-500" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-slate-900 mb-1">{card.value}</div>
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${card.positive ? "text-emerald-600" : "text-red-500"}`}>
            {card.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {card.positive ? "+" : ""}{Math.abs(card.delta).toFixed(1)}% vs last month
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SupplierPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Supplier Intelligence" subtitle="Delivery platform analytics — powered by idealo.de market data" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="rounded-xl bg-orange-50 border border-orange-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">i</div>
            <div>
              <span className="text-sm font-semibold text-orange-900">idealo.de Market Intelligence</span>
              <span className="text-xs text-orange-600 ml-2">Delivery price comparison · Last updated today</span>
            </div>
          </div>
          <a
            href="https://www.idealo.de"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-orange-700 hover:text-orange-800 transition-colors"
          >
            View on idealo.de <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <SupplierKpiCards />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <IdealoChart />
          </div>
          <div className="col-span-1">
            <PlatformCommissionPanel />
          </div>
        </div>

        <ProcurementDecisionsPanel />

        <CompetitiveAlertsPanel />
      </div>
    </div>
  );
}
