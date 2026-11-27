import { Header } from "@/components/layout/Header";
import { IdealoChart } from "@/components/charts/IdealoChart";
import { AlertsPanel } from "@/components/dashboard/CompetitiveAlertsPanel";
import { ProcurementDecisionsPanel } from "@/components/dashboard/ProcurementDecisionsPanel";
import { DEMO_IDEALO_PROCUREMENT_SUMMARY, DEMO_PROCUREMENT_ALERTS } from "@/lib/demo-data";
import { TrendingUp, TrendingDown, ExternalLink, ShoppingCart, PiggyBank, Package, BarChart2 } from "lucide-react";

function ProcurementHero() {
  const d = DEMO_IDEALO_PROCUREMENT_SUMMARY;
  return (
    <div className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 p-5 text-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center font-black text-lg flex-shrink-0">i</div>
          <div>
            <div className="font-bold text-base leading-tight">Wimmer POS buys via idealo.de</div>
            <div className="text-orange-100 text-xs mt-0.5">
              Your POS detects what you need — idealo.de finds the best supplier price, every time
            </div>
          </div>
        </div>
        <a
          href="https://www.idealo.de"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white bg-opacity-20 hover:bg-opacity-30 border border-white border-opacity-30 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          Open idealo.de <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white bg-opacity-15 rounded-xl p-4">
          <div className="text-xs text-orange-100 mb-1 font-medium">Procurement spend MTD</div>
          <div className="text-2xl font-bold">€{d.total_spend_mtd.toLocaleString("de-DE")}</div>
          <div className="text-xs text-orange-200 mt-0.5">{d.orders_placed} orders placed via idealo.de</div>
        </div>
        <div className="bg-white bg-opacity-15 rounded-xl p-4">
          <div className="text-xs text-orange-100 mb-1 font-medium">Saved vs other suppliers</div>
          <div className="text-2xl font-bold">€{d.total_saved_mtd.toLocaleString("de-DE")}</div>
          <div className="text-xs text-orange-200 mt-0.5">avg {d.avg_saving_pct}% below market rate</div>
        </div>
        <div className="bg-white bg-opacity-15 rounded-xl p-4">
          <div className="text-xs text-orange-100 mb-1 font-medium">Annual savings projection</div>
          <div className="text-2xl font-bold">€{(d.total_saved_mtd * 12).toLocaleString("de-DE")}</div>
          <div className="text-xs text-orange-200 mt-0.5">if savings hold at current pace</div>
        </div>
        <div className="bg-white bg-opacity-15 rounded-xl p-4">
          <div className="text-xs text-orange-100 mb-1 font-medium">Best saving this month</div>
          <div className="text-sm font-bold leading-tight mt-1">{d.best_saving_product}</div>
          <div className="text-xs text-orange-200 mt-1">found automatically by Wimmer POS</div>
        </div>
      </div>
    </div>
  );
}

function ProcurementKpiCards() {
  const d = DEMO_IDEALO_PROCUREMENT_SUMMARY;
  const cards = [
    {
      label: "Spend via idealo.de",
      value: `€${d.total_spend_mtd.toLocaleString("de-DE")}`,
      sub: "total procurement this month",
      delta: d.spend_vs_lm,
      positive: true,
      icon: ShoppingCart,
    },
    {
      label: "Total Saved",
      value: `€${d.total_saved_mtd.toLocaleString("de-DE")}`,
      sub: "vs buying from other suppliers",
      delta: d.saved_vs_lm,
      positive: true,
      icon: PiggyBank,
    },
    {
      label: "Avg Saving Rate",
      value: `${d.avg_saving_pct}%`,
      sub: "below alternative supplier prices",
      delta: +2.1,
      positive: true,
      icon: BarChart2,
    },
    {
      label: "Orders Placed",
      value: `${d.orders_placed}`,
      sub: "POS-triggered reorders this month",
      delta: +14.9,
      positive: true,
      icon: Package,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</span>
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-orange-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{card.value}</div>
            <div className="text-xs text-slate-400 mb-1">{card.sub}</div>
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${card.positive ? "text-emerald-600" : "text-red-500"}`}>
              {card.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {card.positive ? "+" : ""}{Math.abs(card.delta).toFixed(1)}% vs last month
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function SupplierPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="idealo Procurement" subtitle="Wimmer POS reorders always via idealo.de — best supplier price, every time" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        <ProcurementHero />

        <ProcurementKpiCards />

        <IdealoChart />

        <ProcurementDecisionsPanel />

        <AlertsPanel alerts={DEMO_PROCUREMENT_ALERTS} title="Procurement Market Alerts" />

      </div>
    </div>
  );
}
