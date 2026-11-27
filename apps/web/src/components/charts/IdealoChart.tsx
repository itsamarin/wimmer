"use client";

import { generateDemoIdealoData } from "@/lib/demo-data";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts";

const data = generateDemoIdealoData(12);

export function IdealoChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Delivery Price Index</h3>
          <p className="text-xs text-slate-500 mt-0.5">Your prices vs market — indexed to 100 (Jan baseline)</p>
        </div>
        <a
          href="https://www.idealo.de"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg hover:bg-orange-100 transition-colors"
        >
          idealo.de
        </a>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} domain={[95, 125]} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }} />
          <ReferenceLine y={105} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Market avg baseline", position: "right", fontSize: 9, fill: "#94a3b8" }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          <Line type="monotone" dataKey="your_index" name="Your portfolio" stroke="#10b981" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="market_avg" name="Market avg" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="lieferando" name="Lieferando avg" stroke="#ef4444" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="wolt" name="Wolt avg" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
