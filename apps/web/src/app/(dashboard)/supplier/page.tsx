import { Header } from "@/components/layout/Header";
import { IdealoChart } from "@/components/charts/IdealoChart";
import { ChannelProfitChart } from "@/components/charts/ChannelProfitChart";
import { PlatformCommissionPanel } from "@/components/dashboard/PlatformCommissionPanel";
import { CompetitiveAlertsPanel } from "@/components/dashboard/CompetitiveAlertsPanel";
import { ProcurementDecisionsPanel } from "@/components/dashboard/ProcurementDecisionsPanel";
import { DEMO_PLATFORM_COMMISSIONS } from "@/lib/demo-data";
import { TrendingUp, TrendingDown, ExternalLink, DollarSign, Zap, BarChart2, ShoppingCart } from "lucide-react";

function IdealoProfit() {
  const direct = DEMO_PLATFORM_COMMISSIONS.find(p => p.platform === "Direct (idealo)")!;
  const others = DEMO_PLATFORM_COMMISSIONS.filter(p => p.platform !== "Direct (idealo)");

  const directNet        = Math.round(direct.monthly_gmv * (1 - direct.commission_pct / 100));
  const directNetIfLiefe = Math.round(direct.monthly_gmv * 0.70);
  const extraProfit      = directNet - directNetIfLiefe;
  const profitPerOrder   = Math.round(directNet / direct.monthly_orders);
  const lieferandoPerOrd = Math.round((others[0].monthly_gmv * 0.70) / others[0].monthly_orders);
  const totalFees        = others.reduce((s, p) => s + p.monthly_gmv * p.commission_pct / 100, 0);

  return (
    <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white bg-opacity-20 flex items-center justify-center font-black text-lg">i</div>
          <div>
            <div className="font-bold text-base leading-tight">Wimmer POS always orders via idealo.de</div>
            <div className="text-emerald-200 text-xs mt-0.5">Every POS-triggered reorder goes through idealo.de — guaranteed best market price</div>
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
          <div className="text-xs text-emerald-100 mb-1 font-medium">Monthly profit from idealo</div>
          <div className="text-2xl font-bold">€{directNet.toLocaleString("de-DE")}</div>
          <div className="text-xs text-emerald-200 mt-0.5">net after 8% commission</div>
        </div>
        <div className="bg-white bg-opacity-15 rounded-xl p-4">
          <div className="text-xs text-emerald-100 mb-1 font-medium">Extra vs Lieferando rate</div>
          <div className="text-2xl font-bold">+€{extraProfit.toLocaleString("de-DE")}</div>
          <div className="text-xs text-emerald-200 mt-0.5">€{(extraProfit * 12).toLocaleString("de-DE")} saved annually</div>
        </div>
        <div className="bg-white bg-opacity-15 rounded-xl p-4">
          <div className="text-xs text-emerald-100 mb-1 font-medium">Profit per order</div>
          <div className="text-2xl font-bold">€{profitPerOrder}</div>
          <div className="text-xs text-emerald-200 mt-0.5">vs €{lieferandoPerOrd} on Lieferando</div>
        </div>
        <div className="bg-white bg-opacity-15 rounded-xl p-4">
          <div className="text-xs text-emerald-100 mb-1 font-medium">3rd-party fees avoided</div>
          <div className="text-2xl font-bold">€{Math.round(totalFees).toLocaleString("de-DE")}</div>
          <div className="text-xs text-emerald-200 mt-0.5">Lieferando + Wolt charges</div>
        </div>
      </div>
    </div>
  );
}

function SupplierKpiCards() {
  const direct       = DEMO_PLATFORM_COMMISSIONS.find(p => p.platform === "Direct (idealo)")!;
  const totalOrders  = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_orders, 0);
  const totalGmv     = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_gmv, 0);
  const directNet    = Math.round(direct.monthly_gmv * (1 - direct.commission_pct / 100));
  const directShare  = Math.round((direct.monthly_orders / totalOrders) * 100);
  const directGmvPct = Math.round((direct.monthly_gmv / totalGmv) * 100);

  const cards = [
    {
      label: "idealo.de Net Profit",
      value: `€${directNet.toLocaleString("de-DE")}`,
      sub: `${direct.monthly_orders.toLocaleString()} orders this month`,
      delta: +18.4,
      positive: true,
      icon: DollarSign,
      highlight: true,
    },
    {
      label: "Direct Order Share",
      value: `${directShare}%`,
      sub: "of all delivery orders",
      delta: +12.6,
      positive: true,
      icon: ShoppingCart,
      highlight: false,
    },
    {
      label: "Direct GMV Share",
      value: `${directGmvPct}%`,
      sub: `€${direct.monthly_gmv.toLocaleString("de-DE")} of €${totalGmv.toLocaleString("de-DE")}`,
      delta: +14.8,
      positive: true,
      icon: BarChart2,
      highlight: false,
    },
    {
      label: "Avg Basket — Direct",
      value: `€${direct.avg_basket.toFixed(2)}`,
      sub: `€${(direct.avg_basket - DEMO_PLATFORM_COMMISSIONS[0].avg_basket).toFixed(2)} above Lieferando`,
      delta: +3.2,
      positive: true,
      icon: Zap,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div key={card.label} className={`rounded-xl border p-5 ${card.highlight ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs font-medium uppercase tracking-wide ${card.highlight ? "text-emerald-600" : "text-slate-500"}`}>{card.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.highlight ? "bg-emerald-200" : "bg-orange-50"}`}>
                <Icon className={`w-3.5 h-3.5 ${card.highlight ? "text-emerald-700" : "text-orange-500"}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold mb-0.5 ${card.highlight ? "text-emerald-700" : "text-slate-900"}`}>{card.value}</div>
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
      <Header title="idealo Procurement" subtitle="Wimmer POS reorders always via idealo.de — best price, every time" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">

        <IdealoProfit />

        <SupplierKpiCards />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <ChannelProfitChart />
          </div>
          <div className="col-span-1">
            <PlatformCommissionPanel />
          </div>
        </div>

        <IdealoChart />

        <ProcurementDecisionsPanel />

        <CompetitiveAlertsPanel />
      </div>
    </div>
  );
}
