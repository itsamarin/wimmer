import { TrendingUp } from "lucide-react";
import { DEMO_PLATFORM_COMMISSIONS } from "@/lib/demo-data";

export function PlatformCommissionPanel() {
  const total_gmv        = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_gmv, 0);
  const total_commission = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_gmv * p.commission_pct / 100, 0);
  const total_orders     = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_orders, 0);
  const direct           = DEMO_PLATFORM_COMMISSIONS.find(p => p.platform === "Direct (idealo)")!;
  const direct_net       = Math.round(direct.monthly_gmv * (1 - direct.commission_pct / 100));
  const direct_gmv_share = Math.round((direct.monthly_gmv / total_gmv) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Platform Revenue Breakdown</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">This month</span>
      </div>

      {/* Direct (idealo) hero card */}
      <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">i</div>
          <span className="text-xs font-semibold text-emerald-800">Direct (idealo) — #1 Revenue Channel</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 ml-auto" />
        </div>
        <div className="text-xl font-bold text-emerald-700">€{direct_net.toLocaleString("de-DE")} net</div>
        <div className="text-xs text-emerald-600 mt-0.5">
          €{direct.monthly_gmv.toLocaleString("de-DE")} GMV · only {direct.commission_pct}% commission · {direct_gmv_share}% of total GMV
        </div>
      </div>

      {/* Commission cost summary */}
      <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
        <div className="text-xs text-red-600 font-medium mb-0.5">Total third-party commission paid</div>
        <div className="text-base font-bold text-red-700">€{Math.round(total_commission - direct.monthly_gmv * direct.commission_pct / 100).toLocaleString("de-DE")}</div>
        <div className="text-xs text-red-500 mt-0.5">Lieferando + Wolt fees — {((total_commission - direct.monthly_gmv * direct.commission_pct / 100) / (total_gmv - direct.monthly_gmv) * 100).toFixed(1)}% blended on non-direct orders</div>
      </div>

      <div className="space-y-3">
        {DEMO_PLATFORM_COMMISSIONS.map(p => {
          const commission = Math.round(p.monthly_gmv * p.commission_pct / 100);
          const net_rev    = Math.round(p.monthly_gmv * (1 - p.commission_pct / 100));
          const order_share = Math.round((p.monthly_orders / total_orders) * 100);
          const isDirect   = p.platform === "Direct (idealo)";
          return (
            <div key={p.platform} className={`space-y-1.5 p-2 rounded-lg ${isDirect ? "bg-emerald-50 border border-emerald-100" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className={`text-xs font-semibold ${isDirect ? "text-emerald-800" : "text-slate-800"}`}>{p.platform}</span>
                  <span className="text-xs text-slate-400">{p.monthly_orders.toLocaleString()} orders</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold ${isDirect ? "text-emerald-700" : "text-slate-900"}`}>
                    €{net_rev.toLocaleString("de-DE")} net
                  </span>
                  <span className="text-xs text-slate-400 ml-1">({p.commission_pct}% fee)</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${order_share}%`, backgroundColor: p.color }} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{order_share}% of orders · avg basket €{p.avg_basket.toFixed(2)}</span>
                <span className={isDirect ? "text-emerald-600 font-medium" : "text-red-400"}>
                  {isDirect ? `saves €${(commission).toLocaleString()} vs 30% rate` : `−€${commission.toLocaleString()} fees`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
