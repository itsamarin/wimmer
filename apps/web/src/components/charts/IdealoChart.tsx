"use client";

import { generateDemoProcurementSavings } from "@/lib/demo-data";
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";

const data = generateDemoProcurementSavings(12);

export function IdealoChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Procurement Spend &amp; Savings via idealo.de</h3>
          <p className="text-xs text-slate-500 mt-0.5">Monthly ingredient &amp; supply purchases — what Wimmer POS bought via idealo.de</p>
        </div>
        <a
          href="https://www.idealo.de"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg hover:bg-orange-100 transition-colors whitespace-nowrap"
        >
          <div className="w-3.5 h-3.5 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs leading-none">i</div>
          idealo.de
        </a>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(1)}k`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
            formatter={(v: number, name: string) => [
              name === "orders" ? `${v} orders` : `€${v.toLocaleString("de-DE")}`,
              name === "spend" ? "Total spend" : name === "saved" ? "Saved vs alternatives" : "Orders placed",
            ]}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          <Bar yAxisId="left" dataKey="spend" name="spend" fill="#fed7aa" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="left" dataKey="saved" name="saved" fill="#6ee7b7" radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="orders" name="orders" stroke="#f97316" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
