import { Header } from "@/components/layout/Header";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { AIReorderReminder } from "@/components/dashboard/AIReorderReminder";
import { DEMO_INVENTORY, DEMO_TABLES, DEMO_MENU_ITEMS } from "@/lib/demo-data";
import { AlertTriangle, Clock, TrendingDown, ExternalLink } from "lucide-react";

const CURRENT_TIME_MIN = 19 * 60 + 41;

function seatedMinutes(seated_at: string | null): number {
  if (!seated_at) return 0;
  const [h, m] = seated_at.split(":").map(Number);
  return CURRENT_TIME_MIN - (h * 60 + m);
}

// Critical / low inventory items
const criticalItems = DEMO_INVENTORY.filter(i => i.status === "critical" || i.status === "low").slice(0, 5);

// Tables occupied too long (>90 min)
const longOccupiedTables = DEMO_TABLES.filter(t => {
  if (t.status !== "occupied" || !t.seated_at) return false;
  return seatedMinutes(t.seated_at as string) > 90;
});

// Slow-moving items (sold < 12 today)
const slowItems = DEMO_MENU_ITEMS.filter(i => i.active && i.sold_today < 12);

export default function DecisionsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Smart Orders" subtitle="AI-driven decisions for procurement, menu, and floor management" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        <AIReorderReminder />

        <div className="grid grid-cols-3 gap-6 items-start">

          {/* Left: recommendations + POS alerts */}
          <div className="col-span-2 space-y-5">
            <RecommendationsPanel />

            {/* POS Alerts */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900">POS Alerts</h3>
                <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {criticalItems.length + longOccupiedTables.length + (slowItems.length > 0 ? 1 : 0)} active
                </span>
              </div>

              <div className="space-y-3">
                {/* Low inventory alerts */}
                {criticalItems.map(item => (
                  <div key={item.id} className={`rounded-lg border p-3.5 flex items-start gap-3 ${item.status === "critical" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.status === "critical" ? "bg-red-100" : "bg-amber-100"}`}>
                      <AlertTriangle className={`w-3 h-3 ${item.status === "critical" ? "text-red-600" : "text-amber-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={`text-xs font-semibold ${item.status === "critical" ? "text-red-700" : "text-amber-700"}`}>
                            {item.status === "critical" ? "Critical stock" : "Low stock"}
                          </span>
                          <span className="text-xs text-slate-500 ml-1.5">— {item.name}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
                          {item.stock} / {item.par} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-600">
                          {item.daily_usage > 0 ? `${(item.stock / item.daily_usage).toFixed(1)} days remaining` : "OUT of stock"}
                        </span>
                        <a
                          href={item.idealo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto flex items-center gap-1 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <span className="font-black text-xs">i</span>
                          Order via idealo.de
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Long-occupied tables */}
                {longOccupiedTables.length > 0 && longOccupiedTables.map(table => {
                  const mins = seatedMinutes(table.seated_at as string);
                  const h = Math.floor(mins / 60);
                  const m = mins % 60;
                  return (
                    <div key={table.id} className="rounded-lg border bg-slate-50 border-slate-200 p-3.5 flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-3 h-3 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-slate-700">Long sitting</span>
                        <span className="text-xs text-slate-500 ml-1.5">
                          Table {table.name} has been occupied for {h}h {m}m ({table.server})
                        </span>
                        <div className="text-xs text-slate-500 mt-1">
                          Order value: <span className="font-semibold text-slate-700">€{table.order_value}</span> · {table.covers_seated} covers
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Slow-moving items */}
                {slowItems.length > 0 && (
                  <div className="rounded-lg border bg-blue-50 border-blue-200 p-3.5 flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-blue-700">Slow-moving items today</span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {slowItems.map(item => (
                          <span key={item.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            {item.name} ({item.sold_today} sold)
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 mt-1.5">
                        Consider pushing these to servers as upsells or running a special.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: AI workflow */}
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">How it works</h3>
              <ol className="space-y-3">
                {[
                  { step: "1", label: "Discover",   desc: "Wimmer monitors POS sales, stock levels, and external signals continuously." },
                  { step: "2", label: "Verify",     desc: "Data quality and freshness are assessed before analysis begins." },
                  { step: "3", label: "Predict",    desc: "Statistical forecasts are generated from your POS transaction history." },
                  { step: "4", label: "Recommend",  desc: "AI analyses validated data and generates evidence-backed suggestions with idealo.de pricing." },
                  { step: "5", label: "Approve",    desc: "You review and approve or reject each recommendation before any action is taken." },
                ].map(item => (
                  <li key={item.step} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-wimmer-100 text-wimmer-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{item.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* idealo.de procurement badge */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs">i</div>
                <span className="text-xs font-bold text-orange-800">idealo.de Procurement</span>
              </div>
              <p className="text-xs text-orange-700 leading-relaxed">
                All reorder recommendations link directly to idealo.de — Wimmer automatically compares prices across suppliers so you always get the best deal. No manual price searching required.
              </p>
              <a
                href="https://www.idealo.de"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-800 transition-colors"
              >
                Open idealo.de
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
