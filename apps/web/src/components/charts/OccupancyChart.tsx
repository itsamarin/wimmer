"use client";

import { generateDemoOccupancyData } from "@/lib/demo-data";
import {
  ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts";

const data = generateDemoOccupancyData(12);

export function OccupancyChart() {
  const today = data.findIndex(d => d.isForecast);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Occupancy & RevPAR</h3>
          <p className="text-xs text-slate-500 mt-0.5">Historical and forecast — portfolio average</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-wimmer-500 inline-block rounded" /> Actual</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-wimmer-300 inline-block rounded border-dashed border border-wimmer-300" /> Forecast (demo)</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="€" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" }}
            formatter={(v: number, name: string) => [
              name === "occupancy" ? `${v}%` : `€${v}`,
              name === "occupancy" ? "Occupancy" : "RevPAR"
            ]}
          />
          {today > 0 && (
            <ReferenceLine yAxisId="left" x={data[today]?.month} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Today", position: "top", fontSize: 10, fill: "#94a3b8" }} />
          )}
          <Area yAxisId="left" type="monotone" dataKey="occupancy" stroke="#6373f5" strokeWidth={2} fill="#f0f4ff" dot={false} />
          <Bar yAxisId="right" dataKey="revpar" fill="#e0eaff" radius={[2, 2, 0, 0]} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
