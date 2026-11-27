"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { DEMO_MENU_ITEMS, DEMO_MENU_CATEGORIES } from "@/lib/demo-data";

const ALLERGEN_COLORS: Record<string, string> = {
  gluten:    "bg-yellow-100 text-yellow-700",
  dairy:     "bg-blue-100 text-blue-700",
  eggs:      "bg-orange-100 text-orange-700",
  fish:      "bg-cyan-100 text-cyan-700",
  shellfish: "bg-teal-100 text-teal-700",
  beef:      "bg-red-100 text-red-700",
  lamb:      "bg-red-100 text-red-700",
  pork:      "bg-red-100 text-red-700",
  poultry:   "bg-orange-100 text-orange-700",
  nuts:      "bg-amber-100 text-amber-700",
  mustard:   "bg-lime-100 text-lime-700",
  celery:    "bg-green-100 text-green-700",
  sulphites: "bg-purple-100 text-purple-700",
};

function foodCostColor(pct: number) {
  if (pct < 25) return "text-emerald-700 bg-emerald-50";
  if (pct < 34) return "text-amber-700 bg-amber-50";
  return "text-red-700 bg-red-50";
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("Starters");

  const totalItems  = DEMO_MENU_ITEMS.length;
  const activeItems = DEMO_MENU_ITEMS.filter(i => i.active).length;
  const avgCost     = Math.round(DEMO_MENU_ITEMS.reduce((s, i) => s + i.food_cost_pct, 0) / DEMO_MENU_ITEMS.length);

  const filtered = DEMO_MENU_ITEMS.filter(i => i.category === activeCategory);

  return (
    <div className="flex flex-col h-full">
      <Header title="Menu & Items" subtitle="Manage your menu, pricing, and food cost" />
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <DemoBanner />

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1">
            <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Items</span>
            <span className="text-2xl font-bold text-slate-900">{totalItems}</span>
            <span className="text-xs text-slate-400">across all categories</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1">
            <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Active Items</span>
            <span className="text-2xl font-bold text-emerald-600">{activeItems}</span>
            <span className="text-xs text-slate-400">{totalItems - activeItems} inactive</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1">
            <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Avg Food Cost</span>
            <span className={`text-2xl font-bold ${avgCost < 30 ? "text-amber-600" : "text-red-600"}`}>{avgCost}%</span>
            <span className="text-xs text-slate-400">target &lt;30%</span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {DEMO_MENU_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeCategory === cat
                    ? "border-wimmer-500 text-wimmer-700 bg-wimmer-50"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {cat}
                <span className="ml-2 text-xs font-normal text-slate-400">
                  ({DEMO_MENU_ITEMS.filter(i => i.category === cat).length})
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3 w-16">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Item</th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-3 w-20">Price</th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-3 w-28">Food Cost</th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-3 w-24">Sold Today</th>
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Allergens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {item.active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">€{item.price}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${foodCostColor(item.food_cost_pct)}`}>
                      {item.food_cost_pct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-slate-800">{item.sold_today}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.allergens.length === 0 ? (
                        <span className="text-xs text-slate-300">none</span>
                      ) : item.allergens.map(a => (
                        <span
                          key={a}
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${ALLERGEN_COLORS[a] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
