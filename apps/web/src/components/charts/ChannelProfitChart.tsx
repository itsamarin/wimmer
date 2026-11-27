"use client";

import { DEMO_PLATFORM_COMMISSIONS } from "@/lib/demo-data";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, LabelList,
} from "recharts";

const data = DEMO_PLATFORM_COMMISSIONS.map(p => ({
  name: p.platform,
  gmv: p.monthly_gmv,
  net: Math.round(p.monthly_gmv * (1 - p.commission_pct / 100)),
  fees: Math.round(p.monthly_gmv * p.commission_pct / 100),
  profit_per_order: Math.round((p.monthly_gmv * (1 - p.commission_pct / 100)) / p.monthly_orders),
  color: p.color,
}));

const direct = DEMO_PLATFORM_COMMISSIONS.find(p => p.platform === "Direct (idealo)")!;
const directNet = Math.round(direct.monthly_gmv * (1 - direct.commission_pct / 100));
const directNetIfLieferando = Math.round(direct.monthly_gmv * 0.70);
const extraProfit = directNet - directNetIfLieferando;

export function ChannelProfitChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Net Revenue by Channel</h3>
          <p className="text-xs text-slate-500 mt-0.5">After platform commission — what you actually keep</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">idealo.de extra profit vs Lieferando rate</div>
          <div className="text-lg font-bold text-emerald-600">+€{extraProfit.toLocaleString("de-DE")}/mo</div>
          <div className="text-xs text-emerald-500">€{(extraProfit * 12).toLocaleString("de-DE")}/year</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 20, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
            formatter={(value: number, name: string) => [
              `€${value.toLocaleString("de-DE")}`,
              name === "net" ? "Net revenue (kept)" : "Platform fees (lost)",
            ]}
          />
          <Bar dataKey="fees" name="fees" stackId="a" radius={[0, 0, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.name === "Direct (idealo)" ? "#d1fae5" : "#fee2e2"} />
            ))}
          </Bar>
          <Bar dataKey="net" name="net" stackId="a" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
            <LabelList
              dataKey="net"
              position="top"
              formatter={(v: number) => `€${(v / 1000).toFixed(1)}k`}
              style={{ fontSize: 11, fontWeight: 600, fill: "#374151" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Per-order profit comparison */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
        {data.map(d => (
          <div key={d.name} className={`rounded-lg p-3 text-center ${d.name === "Direct (idealo)" ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50 border border-slate-100"}`}>
            <div className={`text-xs font-medium mb-1 ${d.name === "Direct (idealo)" ? "text-emerald-700" : "text-slate-500"}`}>
              {d.name === "Direct (idealo)" ? "✦ " : ""}{d.name}
            </div>
            <div className={`text-base font-bold ${d.name === "Direct (idealo)" ? "text-emerald-700" : "text-slate-700"}`}>
              €{d.profit_per_order}
            </div>
            <div className="text-xs text-slate-400">profit / order</div>
          </div>
        ))}
      </div>
    </div>
  );
}
