"use client";

import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { DEMO_Z_REPORT, DEMO_HOURLY_SALES } from "@/lib/demo-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Euro, Users, TrendingUp, CreditCard } from "lucide-react";

const KPI_CARDS = [
  {
    label: "Total Revenue Today",
    value: `€${DEMO_Z_REPORT.total_revenue.toLocaleString()}`,
    sub: "vs yesterday +4.2%",
    positive: true,
    icon: Euro,
    iconBg: "bg-wimmer-50",
    iconColor: "text-wimmer-600",
  },
  {
    label: "Food Revenue",
    value: `€${DEMO_Z_REPORT.food_revenue.toLocaleString()}`,
    sub: `${Math.round((DEMO_Z_REPORT.food_revenue / DEMO_Z_REPORT.total_revenue) * 100)}% of total`,
    positive: true,
    icon: TrendingUp,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    label: "Beverage Revenue",
    value: `€${DEMO_Z_REPORT.beverage_revenue.toLocaleString()}`,
    sub: `${Math.round((DEMO_Z_REPORT.beverage_revenue / DEMO_Z_REPORT.total_revenue) * 100)}% of total`,
    positive: true,
    icon: CreditCard,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    label: "Avg Check",
    value: `€${DEMO_Z_REPORT.avg_check.toFixed(2)}`,
    sub: `${DEMO_Z_REPORT.covers} covers today`,
    positive: true,
    icon: Users,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

const PAYMENT_TOTAL = DEMO_Z_REPORT.payments.card + DEMO_Z_REPORT.payments.cash + DEMO_Z_REPORT.payments.voucher;

const PAYMENTS = [
  { label: "Card",    value: DEMO_Z_REPORT.payments.card,    color: "bg-wimmer-500",  pct: Math.round((DEMO_Z_REPORT.payments.card / PAYMENT_TOTAL) * 100) },
  { label: "Cash",    value: DEMO_Z_REPORT.payments.cash,    color: "bg-emerald-500", pct: Math.round((DEMO_Z_REPORT.payments.cash / PAYMENT_TOTAL) * 100) },
  { label: "Voucher", value: DEMO_Z_REPORT.payments.voucher, color: "bg-purple-500",  pct: Math.round((DEMO_Z_REPORT.payments.voucher / PAYMENT_TOTAL) * 100) },
];

export default function RevenuePage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Revenue" subtitle="Daily revenue breakdown — Mitte Fine Dining" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {KPI_CARDS.map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
                <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Hourly revenue chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Hourly Revenue Today</h3>
          <p className="text-xs text-slate-500 mb-4">Revenue (€) and covers by hour</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_HOURLY_SALES} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `€${v}`}
                />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "revenue" ? [`€${value}`, "Revenue"] : [value, "Covers"]
                  }
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Payment breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Payment Methods</h3>
            <div className="space-y-3">
              {PAYMENTS.map(p => (
                <div key={p.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-800">€{p.value.toLocaleString()}</span>
                      <span className="text-xs text-slate-400">{p.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VAT summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">VAT Summary</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">7% VAT (Food)</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">7%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>Net base: <span className="font-mono font-semibold text-slate-800">€{DEMO_Z_REPORT.vat.vat_7_base.toLocaleString()}</span></div>
                  <div>Tax: <span className="font-mono font-semibold text-slate-800">€{DEMO_Z_REPORT.vat.vat_7_amount.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">19% VAT (Beverages)</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">19%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>Net base: <span className="font-mono font-semibold text-slate-800">€{DEMO_Z_REPORT.vat.vat_19_base.toLocaleString()}</span></div>
                  <div>Tax: <span className="font-mono font-semibold text-slate-800">€{DEMO_Z_REPORT.vat.vat_19_amount.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Total VAT Collected</span>
                <span className="font-mono font-bold text-slate-900">
                  €{(DEMO_Z_REPORT.vat.vat_7_amount + DEMO_Z_REPORT.vat.vat_19_amount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
