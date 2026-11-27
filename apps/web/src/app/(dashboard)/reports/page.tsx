import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { DEMO_Z_REPORT } from "@/lib/demo-data";
import { FileText, Download, FileSpreadsheet, Database, Shield } from "lucide-react";

const REVENUE_TOTAL = DEMO_Z_REPORT.total_revenue;

function pct(value: number) {
  return `${Math.round((value / REVENUE_TOTAL) * 100)}%`;
}

const PAYMENT_TOTAL =
  DEMO_Z_REPORT.payments.card +
  DEMO_Z_REPORT.payments.cash +
  DEMO_Z_REPORT.payments.voucher;

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Reports & Z-Report" subtitle="Daily Z-report and export — Mitte Fine Dining" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        {/* Quick comparison */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Today</div>
            <div className="text-2xl font-bold text-slate-900 font-mono">€{REVENUE_TOTAL.toLocaleString()}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">+4.2% vs yesterday</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Yesterday</div>
            <div className="text-2xl font-bold text-slate-500 font-mono">€{Math.round(REVENUE_TOTAL / 1.042).toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">{DEMO_Z_REPORT.date}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">This Week</div>
            <div className="text-2xl font-bold text-slate-900 font-mono">€{(REVENUE_TOTAL * 5.3).toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">Mon–Fri (est.)</div>
          </div>
        </div>

        {/* Z-Report card */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-white" />
              <div>
                <div className="font-bold text-white text-sm">Z-Report — {DEMO_Z_REPORT.date}</div>
                <div className="text-xs text-slate-400">{DEMO_Z_REPORT.venue} · {DEMO_Z_REPORT.shift} Service</div>
              </div>
            </div>
            <span className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-semibold">Closed</span>
          </div>

          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Revenue by category */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Revenue Breakdown</h4>
              <div className="space-y-2">
                {[
                  { label: "Food",      value: DEMO_Z_REPORT.food_revenue,      color: "bg-wimmer-500" },
                  { label: "Beverage",  value: DEMO_Z_REPORT.beverage_revenue,  color: "bg-purple-500" },
                  { label: "Other",     value: DEMO_Z_REPORT.other_revenue,     color: "bg-slate-300" },
                ].map(r => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-700">{r.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-800">€{r.value.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 w-10 text-right">{pct(r.value)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${r.color}`} style={{ width: pct(r.value) }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-100 flex justify-between">
                  <span className="text-xs font-semibold text-slate-700">Total</span>
                  <span className="text-xs font-bold font-mono text-slate-900">€{REVENUE_TOTAL.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payments */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Payment Methods</h4>
              <div className="space-y-2">
                {[
                  { label: "Card",    value: DEMO_Z_REPORT.payments.card },
                  { label: "Cash",    value: DEMO_Z_REPORT.payments.cash },
                  { label: "Voucher", value: DEMO_Z_REPORT.payments.voucher },
                ].map(p => (
                  <div key={p.label} className="flex justify-between items-center py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-600">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{Math.round((p.value / PAYMENT_TOTAL) * 100)}%</span>
                      <span className="text-xs font-mono font-semibold text-slate-800">€{p.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-1 flex justify-between">
                  <span className="text-xs font-semibold text-slate-700">Total</span>
                  <span className="text-xs font-bold font-mono text-slate-900">€{PAYMENT_TOTAL.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Operational stats */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Operational Stats</h4>
              <div className="space-y-1.5">
                {[
                  { label: "Covers",           value: DEMO_Z_REPORT.covers },
                  { label: "Avg Check",         value: `€${DEMO_Z_REPORT.avg_check.toFixed(2)}` },
                  { label: "Table Turns",       value: DEMO_Z_REPORT.table_turns },
                  { label: "Avg Cover Time",    value: `${DEMO_Z_REPORT.avg_cover_time_min} min` },
                  { label: "Discounts",         value: `€${DEMO_Z_REPORT.discounts}` },
                  { label: "Voids",             value: `€${DEMO_Z_REPORT.voids}` },
                  { label: "Refunds",           value: `€${DEMO_Z_REPORT.refunds}` },
                ].map(s => (
                  <div key={s.label} className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-xs text-slate-600">{s.label}</span>
                    <span className="text-xs font-semibold text-slate-800 font-mono">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* VAT */}
          <div className="px-6 pb-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">VAT Summary (Umsatzsteuer)</h4>
            <div className="grid grid-cols-2 gap-4">
              {[
                { rate: "7%",  label: "Food & non-alcoholic",  base: DEMO_Z_REPORT.vat.vat_7_base,  amount: DEMO_Z_REPORT.vat.vat_7_amount },
                { rate: "19%", label: "Beverages & alcohol",   base: DEMO_Z_REPORT.vat.vat_19_base, amount: DEMO_Z_REPORT.vat.vat_19_amount },
              ].map(v => (
                <div key={v.rate} className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-800">{v.rate}</span>
                    <span className="text-xs text-slate-500">{v.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="text-slate-500">Net base</div>
                    <div className="font-mono font-semibold text-slate-800 text-right">€{v.base.toLocaleString()}</div>
                    <div className="text-slate-500">Tax amount</div>
                    <div className="font-mono font-semibold text-slate-800 text-right">€{v.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between items-center px-1">
              <span className="text-xs font-semibold text-slate-700">Total VAT</span>
              <span className="font-mono font-bold text-slate-900">
                €{(DEMO_Z_REPORT.vat.vat_7_amount + DEMO_Z_REPORT.vat.vat_19_amount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Export buttons */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Export & Compliance</h3>
          <p className="text-xs text-slate-500 mb-4">Download the Z-report or export for accounting and regulatory systems.</p>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export PDF
            </button>
            <button className="flex items-center gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button className="flex items-center gap-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Database className="w-3.5 h-3.5" />
              DATEV Export
            </button>
            <button className="flex items-center gap-2 text-xs font-semibold bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors">
              <Shield className="w-3.5 h-3.5" />
              TSE Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
