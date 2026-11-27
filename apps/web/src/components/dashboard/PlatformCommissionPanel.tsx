import { DEMO_PLATFORM_COMMISSIONS } from "@/lib/demo-data";

export function PlatformCommissionPanel() {
  const total_gmv = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_gmv, 0);
  const total_commission = DEMO_PLATFORM_COMMISSIONS.reduce((s, p) => s + p.monthly_gmv * p.commission_pct / 100, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Platform Commission Breakdown</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">This month</span>
      </div>

      <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
        <div className="text-xs text-red-600 font-medium mb-0.5">Total commission paid</div>
        <div className="text-xl font-bold text-red-700">€{Math.round(total_commission).toLocaleString("de-DE")}</div>
        <div className="text-xs text-red-500 mt-0.5">on €{Math.round(total_gmv).toLocaleString("de-DE")} GMV ({((total_commission / total_gmv) * 100).toFixed(1)}% blended rate)</div>
      </div>

      <div className="space-y-3">
        {DEMO_PLATFORM_COMMISSIONS.map(p => {
          const commission = Math.round(p.monthly_gmv * p.commission_pct / 100);
          const share = Math.round((p.monthly_orders / DEMO_PLATFORM_COMMISSIONS.reduce((s, x) => s + x.monthly_orders, 0)) * 100);
          return (
            <div key={p.platform} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-xs font-medium text-slate-800">{p.platform}</span>
                  <span className="text-xs text-slate-400">{p.monthly_orders} orders</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-900">€{commission.toLocaleString("de-DE")}</span>
                  <span className="text-xs text-slate-400 ml-1">({p.commission_pct}%)</span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: p.color }} />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{share}% of orders</span>
                <span>Avg basket €{p.avg_basket.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
