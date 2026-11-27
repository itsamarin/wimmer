"use client";

import { useState } from "react";
import { Brain, ExternalLink, CheckCircle, TrendingDown, ChevronDown, ChevronUp, Zap, X } from "lucide-react";
import { DEMO_PROCUREMENT_DECISIONS } from "@/lib/demo-data";

const urgentItems = DEMO_PROCUREMENT_DECISIONS.filter(d => d.urgency === "critical" || d.urgency === "high").slice(0, 5);

export function AIReorderReminder() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [approved, setApproved] = useState<Set<string>>(new Set());

  const visible = urgentItems.filter(d => !dismissed.has(d.id));
  const totalSavings = visible.reduce((s, d) => s + Math.round((d.current_supplier_price - d.idealo_best_price) * d.qty_number), 0);

  if (visible.length === 0) return null;

  const criticalCount = visible.filter(d => d.urgency === "critical").length;

  return (
    <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-orange-900">AI Reorder Reminders</span>
                {criticalCount > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
                    <Zap className="w-3 h-3" /> {criticalCount} critical
                  </span>
                )}
              </div>
              <p className="text-xs text-orange-600 mt-0.5">
                Wimmer POS has identified {visible.length} items you should reorder — save <span className="font-bold text-emerald-700">€{totalSavings.toLocaleString("de-DE")}</span> by buying via idealo.de
              </p>
            </div>
          </div>
        </div>

        {/* idealo badge + approve all */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://www.idealo.de"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-white border border-orange-300 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <div className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">i</div>
            idealo.de
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setApproved(new Set(visible.map(d => d.id)))}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approve all via idealo.de
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-orange-100">
        {visible.map(item => {
          const saving = Math.round((item.current_supplier_price - item.idealo_best_price) * item.qty_number);
          const isExpanded = expanded === item.id;
          const isApproved = approved.has(item.id);
          const isCritical = item.urgency === "critical";

          return (
            <div key={item.id} className={`px-5 py-4 ${isApproved ? "opacity-50" : ""}`}>
              <div className="flex items-start gap-3">
                {/* Urgency dot */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${isCritical ? "bg-red-500" : "bg-amber-400"}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium capitalize ${
                          isCritical
                            ? "text-red-700 bg-red-100 border-red-200"
                            : "text-amber-700 bg-amber-100 border-amber-200"
                        }`}>
                          {item.urgency}
                        </span>
                        <span className="text-xs text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                          {item.reason}
                        </span>
                        {isApproved && (
                          <span className="text-xs font-semibold text-emerald-600">✓ Order placed via idealo.de</span>
                        )}
                      </div>

                      {/* Product name */}
                      <h4 className="text-sm font-semibold text-slate-900 leading-tight">{item.product}</h4>

                      {/* Quick stats */}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500">
                          {item.stock_days_remaining > 0 ? `${item.stock_days_remaining}d remaining` : "⚠ Out of stock"}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">
                          Reorder: <span className="font-medium text-slate-700">{item.recommended_qty}</span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-slate-800">~€{item.estimated_cost.toLocaleString()}</span>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-700">
                          <TrendingDown className="w-3 h-3" />
                          save €{saving} via idealo
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!isApproved && (
                        <>
                          <button
                            onClick={() => setExpanded(isExpanded ? null : item.id)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title="Show AI reasoning"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={item.idealo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                            onClick={() => setApproved(s => new Set([...s, item.id]))}
                          >
                            <div className="w-3.5 h-3.5 rounded bg-white bg-opacity-25 flex items-center justify-center font-black text-xs flex-shrink-0">i</div>
                            Order via idealo.de
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => setDismissed(s => new Set([...s, item.id]))}
                            className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded AI reasoning */}
                  {isExpanded && !isApproved && (
                    <div className="mt-3 bg-white rounded-lg border border-orange-200 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Brain className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-semibold text-slate-700">AI Analysis</span>
                        <div className="ml-auto flex items-center gap-1 text-xs text-orange-600 font-medium">
                          <div className="w-3.5 h-3.5 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs leading-none">i</div>
                          idealo.de: €{item.idealo_best_price.toFixed(2)}/unit
                          <span className="text-slate-400 line-through ml-1">€{item.current_supplier_price.toFixed(2)}</span>
                          <span className="font-bold text-emerald-600 ml-1">−{item.idealo_saving_pct.toFixed(1)}%</span>
                        </div>
                      </div>
                      {item.ai_reasoning.map((point, i) => (
                        <div key={i} className="flex gap-2 mb-1.5">
                          <span className="text-xs font-bold text-orange-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                          <p className="text-xs text-slate-600 leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-orange-100 border-t border-orange-200 flex items-center justify-between">
        <span className="text-xs text-orange-700 font-medium">
          Powered by Wimmer POS AI · procurement always via{" "}
          <a href="https://www.idealo.de" target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-2 hover:text-orange-900">
            idealo.de
          </a>
        </span>
        <span className="text-xs text-emerald-700 font-semibold">
          Total potential savings: €{totalSavings.toLocaleString("de-DE")} vs current supplier contracts
        </span>
      </div>
    </div>
  );
}
