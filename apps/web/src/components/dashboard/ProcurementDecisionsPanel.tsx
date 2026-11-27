"use client";

import React, { useState } from "react";
import { Brain, CheckCircle, XCircle, ExternalLink, AlertTriangle, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { DEMO_PROCUREMENT_DECISIONS } from "@/lib/demo-data";

const urgencyStyle: Record<string, { badge: string; border: string; dot: string }> = {
  critical: { badge: "text-red-700 bg-red-100 border-red-200",   border: "border-red-200 bg-red-50",   dot: "bg-red-500" },
  high:     { badge: "text-amber-700 bg-amber-100 border-amber-200", border: "border-amber-100 bg-amber-50", dot: "bg-amber-500" },
  medium:   { badge: "text-blue-700 bg-blue-100 border-blue-200",  border: "border-slate-200 bg-white",  dot: "bg-blue-400" },
};

export function ProcurementDecisionsPanel() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, "approved" | "rejected">>({});

  const pending = DEMO_PROCUREMENT_DECISIONS.filter(d => !statuses[d.id]);
  const done    = DEMO_PROCUREMENT_DECISIONS.filter(d =>  statuses[d.id]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-slate-900">AI Procurement Decisions</h3>
        </div>
        <div className="flex items-center gap-2">
          {DEMO_PROCUREMENT_DECISIONS.some(d => d.urgency === "critical" && !statuses[d.id]) && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> Critical
            </span>
          )}
          {pending.length > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{pending.length} pending</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {DEMO_PROCUREMENT_DECISIONS.map(item => {
          const status = statuses[item.id];
          const isDone = !!status;
          const isOpen = expanded === item.id;
          const style = urgencyStyle[item.urgency];
          const saving = Math.round((item.current_supplier_price - item.idealo_best_price) * parseInt(item.recommended_qty));

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-4 transition-all ${isDone ? "opacity-55 border-slate-100 bg-slate-50" : style.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${style.badge}`}>
                      {item.urgency}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.reason}</span>
                    {isDone && (
                      <span className={`text-xs font-medium ${status === "approved" ? "text-emerald-600" : "text-red-500"}`}>
                        {status === "approved" ? "✓ Order placed" : "✗ Dismissed"}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 leading-tight">{item.product}</h4>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500">
                      {item.stock_days_remaining > 0
                        ? `${item.stock_days_remaining}d stock remaining`
                        : "Out of stock"}
                    </span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-500">Order: <span className="font-medium text-slate-700">{item.recommended_qty}</span></span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs font-semibold text-slate-700">~€{item.estimated_cost}</span>
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                      <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-5 h-5 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">i</div>
                            <span className="text-xs font-semibold text-orange-900">idealo.de best price</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-orange-800">€{item.idealo_best_price.toFixed(2)}/unit</span>
                            <span className="text-xs text-slate-400 line-through">€{item.current_supplier_price.toFixed(2)}</span>
                            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-700">
                              <TrendingDown className="w-3 h-3" /> −{item.idealo_saving_pct.toFixed(1)}%
                            </span>
                          </div>
                          {saving > 0 && (
                            <div className="text-xs text-emerald-700 mt-0.5 font-medium">
                              Saves ~€{saving} on this order
                            </div>
                          )}
                        </div>
                        <a
                          href={item.idealo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-white border border-orange-300 hover:bg-orange-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
                        >
                          Compare on idealo.de <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 flex-shrink-0"
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {!isDone && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setStatuses(s => ({ ...s, [item.id]: "approved" }))}
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Place Order
                  </button>
                  <button
                    onClick={() => setStatuses(s => ({ ...s, [item.id]: "rejected" }))}
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

      {done.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
          {done.length} decision{done.length > 1 ? "s" : ""} actioned this session
        </div>
      )}
    </div>
  );
}
