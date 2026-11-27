"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { AIReorderReminder } from "@/components/dashboard/AIReorderReminder";
import { DEMO_INVENTORY } from "@/lib/demo-data";
import { ExternalLink } from "lucide-react";

type FilterKey = "all" | "critical" | "low" | "ok";

const CATEGORIES = ["All Categories", "Proteins", "Produce", "Dairy", "Dry Goods", "Beverages"];

function daysRemaining(item: { stock: number; daily_usage: number; status: string }): string {
  if (item.stock === 0) return "OUT";
  if (item.daily_usage === 0) return "—";
  return `${(item.stock / item.daily_usage).toFixed(1)}d`;
}

function stockRatio(item: { stock: number; par: number }): number {
  if (item.par === 0) return 1;
  return Math.min(item.stock / item.par, 1);
}

function barColor(ratio: number): string {
  if (ratio < 0.3) return "bg-red-500";
  if (ratio < 0.7) return "bg-amber-400";
  return "bg-emerald-500";
}

function statusDot(status: string): string {
  if (status === "critical") return "bg-red-500";
  if (status === "low")      return "bg-amber-400";
  return "bg-emerald-500";
}

function statusBadge(status: string): string {
  if (status === "critical") return "bg-red-100 text-red-700";
  if (status === "low")      return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export default function InventoryPage() {
  const [filter, setFilter]   = useState<FilterKey>("all");
  const [catFilter, setCatFilter] = useState("All Categories");

  const critical = DEMO_INVENTORY.filter(i => i.status === "critical").length;
  const low      = DEMO_INVENTORY.filter(i => i.status === "low").length;
  const ok       = DEMO_INVENTORY.filter(i => i.status === "ok").length;

  const filtered = DEMO_INVENTORY.filter(item => {
    const statusMatch = filter === "all" || item.status === filter;
    const catMatch    = catFilter === "All Categories" || item.category === catFilter;
    return statusMatch && catMatch;
  });

  return (
    <div className="flex flex-col h-full">
      <Header title="Inventory & Stock" subtitle="Real-time stock levels with idealo.de ordering" />
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <DemoBanner />

        <AIReorderReminder />

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={() => setFilter("critical")}
            className={`rounded-xl border p-4 flex flex-col gap-1 text-left transition-all ${filter === "critical" ? "border-red-400 ring-1 ring-red-400" : "border-red-200 bg-red-50 hover:border-red-300"}`}
          >
            <span className="text-xs text-red-600 uppercase tracking-wide font-medium">Critical</span>
            <span className="text-2xl font-bold text-red-700">{critical}</span>
            <span className="text-xs text-red-500">order immediately</span>
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`rounded-xl border p-4 flex flex-col gap-1 text-left transition-all ${filter === "low" ? "border-amber-400 ring-1 ring-amber-400" : "border-amber-200 bg-amber-50 hover:border-amber-300"}`}
          >
            <span className="text-xs text-amber-600 uppercase tracking-wide font-medium">Low Stock</span>
            <span className="text-2xl font-bold text-amber-700">{low}</span>
            <span className="text-xs text-amber-500">order this week</span>
          </button>
          <button
            onClick={() => setFilter("ok")}
            className={`rounded-xl border p-4 flex flex-col gap-1 text-left transition-all ${filter === "ok" ? "border-emerald-400 ring-1 ring-emerald-400" : "border-emerald-200 bg-emerald-50 hover:border-emerald-300"}`}
          >
            <span className="text-xs text-emerald-600 uppercase tracking-wide font-medium">OK</span>
            <span className="text-2xl font-bold text-emerald-700">{ok}</span>
            <span className="text-xs text-emerald-500">adequately stocked</span>
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl border p-4 flex flex-col gap-1 text-left transition-all ${filter === "all" ? "border-wimmer-400 ring-1 ring-wimmer-400 bg-wimmer-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
          >
            <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Items</span>
            <span className="text-2xl font-bold text-slate-900">{DEMO_INVENTORY.length}</span>
            <span className="text-xs text-slate-400">tracked ingredients</span>
          </button>
        </div>

        {/* Category + status filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                catFilter === cat
                  ? "bg-wimmer-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 w-10"></th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Item</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 w-28">Category</th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-3 w-32">Stock / Par</th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-3 w-24">Days Left</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 w-40">Level</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 w-44">Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(item => {
                const ratio = stockRatio(item);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusDot(item.status)}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">{item.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      <span className={`font-bold ${item.stock === 0 ? "text-red-600" : item.stock / item.par < 0.3 ? "text-red-600" : "text-slate-800"}`}>
                        {item.stock}
                      </span>
                      <span className="text-slate-400"> / {item.par} {item.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusBadge(item.status)}`}>
                        {daysRemaining(item)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${barColor(ratio)} transition-all`}
                          style={{ width: `${Math.round(ratio * 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{Math.round(ratio * 100)}% of par</div>
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={item.idealo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span className="font-black text-xs">i</span>
                        Order via idealo.de
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
