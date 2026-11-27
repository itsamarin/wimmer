"use client";

import React, { useState } from "react";
import {
  Brain, CheckCircle, XCircle, ExternalLink, AlertTriangle,
  TrendingDown, ChevronDown, ChevronUp, ShoppingCart, Zap,
} from "lucide-react";
import { DEMO_PROCUREMENT_DECISIONS } from "@/lib/demo-data";

type Urgency = "critical" | "high" | "medium";

const urgencyStyle: Record<Urgency, { badge: string; border: string; dot: string }> = {
  critical: { badge: "text-red-700 bg-red-100 border-red-200",     border: "border-red-200 bg-red-50",   dot: "bg-red-500" },
  high:     { badge: "text-amber-700 bg-amber-100 border-amber-200", border: "border-amber-100 bg-amber-50", dot: "bg-amber-400" },
  medium:   { badge: "text-blue-700 bg-blue-100 border-blue-200",    border: "border-slate-200 bg-white",  dot: "bg-blue-400" },
};

const categoryOrder = [
  "Proteins & Seafood",
  "Fresh Produce",
  "Dairy & Chilled",
  "Beverages & Wine",
  "Dry Goods & Pantry",
];

function idealoSaving(item: typeof DEMO_PROCUREMENT_DECISIONS[number]) {
  return Math.round((item.current_supplier_price - item.idealo_best_price) * item.qty_number);
}

export function ProcurementDecisionsPanel() {
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [statuses, setStatuses]   = useState<Record<string, "approved" | "rejected">>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const approve = (id: string) => setStatuses(s => ({ ...s, [id]: "approved" }));
  const reject  = (id: string) => setStatuses(s => ({ ...s, [id]: "rejected" }));
  const approveCategory = (cat: string) => {
    const ids = DEMO_PROCUREMENT_DECISIONS
      .filter(d => d.category === cat && !statuses[d.id])
      .map(d => d.id);
    setStatuses(s => Object.fromEntries([...Object.entries(s), ...ids.map(id => [id, "approved" as const])]));
  };

  const pending = DEMO_PROCUREMENT_DECISIONS.filter(d => !statuses[d.id]);
  const totalPendingSpend = pending.reduce((s, d) => s + d.estimated_cost, 0);
  const totalIdealoSaving = pending.reduce((s, d) => s + idealoSaving(d), 0);
  const criticalCount = pending.filter(d => d.urgency === "critical").length;
  const approvedCount = Object.values(statuses).filter(v => v === "approved").length;
  const approvedSpend = DEMO_PROCUREMENT_DECISIONS
    .filter(d => statuses[d.id] === "approved")
    .reduce((s, d) => s + d.estimated_cost, 0);

  const grouped = categoryOrder.map(cat => ({
    cat,
    items: DEMO_PROCUREMENT_DECISIONS.filter(d => d.category === cat),
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-slate-900">POS-Triggered Reorders via idealo.de</h3>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                <AlertTriangle className="w-3 h-3" /> {criticalCount} critical
              </span>
            )}
            {pending.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                {pending.length} pending
              </span>
            )}
          </div>
        </div>

        {/* Summary banner */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
            <div className="text-xs text-slate-500 mb-0.5">Pending spend</div>
            <div className="text-lg font-bold text-slate-900">€{totalPendingSpend.toLocaleString("de-DE")}</div>
            <div className="text-xs text-slate-400">{pending.length} items across {grouped.filter(g => g.items.some(i => !statuses[i.id])).length} categories</div>
          </div>
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <div className="flex items-center gap-1 text-xs text-emerald-600 mb-0.5">
              <div className="w-3.5 h-3.5 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs leading-none flex-shrink-0">i</div>
              idealo.de savings
            </div>
            <div className="text-lg font-bold text-emerald-700">€{totalIdealoSaving.toLocaleString("de-DE")}</div>
            <div className="text-xs text-emerald-600">vs current supplier contracts</div>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <div className="flex items-center gap-1 text-xs text-blue-600 mb-0.5">
              <ShoppingCart className="w-3 h-3" /> Approved
            </div>
            <div className="text-lg font-bold text-blue-700">€{approvedSpend.toLocaleString("de-DE")}</div>
            <div className="text-xs text-blue-500">{approvedCount} orders placed this session</div>
          </div>
        </div>
      </div>

      {/* Category sections */}
      <div className="divide-y divide-slate-100">
        {grouped.map(({ cat, items }) => {
          const pendingInCat = items.filter(i => !statuses[i.id]);
          const isCollapsed = collapsed[cat];
          const catCritical = pendingInCat.some(i => i.urgency === "critical");

          return (
            <div key={cat}>
              {/* Category header */}
              <div
                className="flex items-center justify-between px-5 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => setCollapsed(c => ({ ...c, [cat]: !c[cat] }))}
              >
                <div className="flex items-center gap-2">
                  {catCritical && <Zap className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                  <span className="text-xs font-semibold text-slate-700">{cat}</span>
                  <span className="text-xs text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full">
                    {pendingInCat.length} pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {pendingInCat.length > 0 && (
                    <button
                      onClick={e => { e.stopPropagation(); approveCategory(cat); }}
                      className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Approve all
                    </button>
                  )}
                  {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>

              {/* Items */}
              {!isCollapsed && (
                <div className="p-3 space-y-2">
                  {items.map(item => {
                    const status  = statuses[item.id];
                    const isDone  = !!status;
                    const isOpen  = expanded === item.id;
                    const style   = urgencyStyle[item.urgency as Urgency];
                    const saving  = idealoSaving(item);

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-4 transition-all ${isDone ? "opacity-50 border-slate-100 bg-slate-50" : style.border}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${style.dot}`} />

                          <div className="flex-1 min-w-0">
                            {/* Badges row */}
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${style.badge}`}>
                                {item.urgency}
                              </span>
                              <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.reason}
                              </span>
                              {isDone && (
                                <span className={`text-xs font-semibold ${status === "approved" ? "text-emerald-600" : "text-red-500"}`}>
                                  {status === "approved" ? "✓ Order placed" : "✗ Dismissed"}
                                </span>
                              )}
                            </div>

                            {/* Product name */}
                            <h4 className="text-sm font-semibold text-slate-900 leading-tight">{item.product}</h4>

                            {/* Quick stats */}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-slate-500">
                                {item.stock_days_remaining > 0 ? `${item.stock_days_remaining}d stock` : "⚠ Out of stock"}
                              </span>
                              <span className="text-xs text-slate-300">·</span>
                              <span className="text-xs text-slate-500">
                                Order <span className="font-medium text-slate-700">{item.recommended_qty}</span>
                              </span>
                              <span className="text-xs text-slate-300">·</span>
                              <span className="text-xs font-semibold text-slate-800">~€{item.estimated_cost}</span>
                              <span className="text-xs text-slate-300">·</span>
                              <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                                <TrendingDown className="w-3 h-3" /> save €{saving} on idealo
                              </span>
                            </div>

                            {/* Expanded detail */}
                            {isOpen && (
                              <div className="mt-4 space-y-3">
                                {/* Consumption rate */}
                                <div className="text-xs text-slate-500">
                                  <span className="font-medium text-slate-700">Consumption: </span>{item.consumption_rate}
                                </div>
                                <div className="text-xs text-slate-500">
                                  <span className="font-medium text-slate-700">Covers impact: </span>{item.covers_impact}
                                </div>

                                {/* AI reasoning bullets */}
                                <div className="bg-slate-50 rounded-lg border border-slate-100 p-3 space-y-2">
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <Brain className="w-3 h-3 text-orange-500" />
                                    <span className="text-xs font-semibold text-slate-700">AI Analysis</span>
                                  </div>
                                  {item.ai_reasoning.map((point, i) => (
                                    <div key={i} className="flex gap-2">
                                      <span className="text-xs font-bold text-orange-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                                      <p className="text-xs text-slate-600 leading-relaxed">{point}</p>
                                    </div>
                                  ))}
                                </div>

                                {/* idealo price card */}
                                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">i</div>
                                        <span className="text-xs font-semibold text-orange-900">idealo.de best price</span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-base font-bold text-orange-800">€{item.idealo_best_price.toFixed(2)}/unit</span>
                                        <span className="text-xs text-slate-400 line-through">€{item.current_supplier_price.toFixed(2)} contract</span>
                                        <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                          <TrendingDown className="w-3 h-3" /> −{item.idealo_saving_pct.toFixed(1)}%
                                        </span>
                                      </div>
                                      <div className="text-xs text-emerald-700 font-semibold mt-1">
                                        Saves €{saving} on this order ({item.recommended_qty})
                                      </div>
                                    </div>
                                    <a
                                      href={item.idealo_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-white border border-orange-300 hover:bg-orange-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
                                    >
                                      Compare on idealo.de <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Expand toggle */}
                          <button
                            onClick={() => setExpanded(isOpen ? null : item.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 flex-shrink-0 mt-0.5"
                          >
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Action buttons */}
                        {!isDone && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            <button
                              onClick={() => approve(item.id)}
                              className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Place Order
                            </button>
                            <button
                              onClick={() => reject(item.id)}
                              className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Dismiss
                            </button>
                            <a
                              href={item.idealo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                            >
                              <div className="w-3.5 h-3.5 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs leading-none">i</div>
                              idealo.de <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {approvedCount > 0 && (
        <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between">
          <span className="text-xs text-emerald-700 font-medium">
            {approvedCount} order{approvedCount > 1 ? "s" : ""} placed · €{approvedSpend.toLocaleString("de-DE")} committed
          </span>
          <span className="text-xs text-emerald-600">
            idealo.de savings vs current contracts: €{DEMO_PROCUREMENT_DECISIONS
              .filter(d => statuses[d.id] === "approved")
              .reduce((s, d) => s + idealoSaving(d), 0)
              .toLocaleString("de-DE")} via idealo.de
          </span>
        </div>
      )}
    </div>
  );
}
