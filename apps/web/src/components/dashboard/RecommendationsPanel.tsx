"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { DEMO_RECOMMENDATIONS } from "@/lib/demo-data";

const riskColor: Record<string, string> = {
  low: "text-emerald-600 bg-emerald-50 border-emerald-100",
  medium: "text-amber-600 bg-amber-50 border-amber-100",
  high: "text-red-600 bg-red-50 border-red-100",
};

const categoryLabel: Record<string, string> = {
  revenue: "Revenue",
  operations: "Operations",
  staffing: "Staffing",
  procurement: "Procurement",
};

export function RecommendationsPanel() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  function approve(id: string) { setStatuses(s => ({ ...s, [id]: "approved" })); }
  function reject(id: string) { setStatuses(s => ({ ...s, [id]: "rejected" })); }

  const pending = DEMO_RECOMMENDATIONS.filter(r => !statuses[r.id]);
  const actioned = DEMO_RECOMMENDATIONS.filter(r => statuses[r.id]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-wimmer-600" />
          <h3 className="text-sm font-semibold text-slate-900">AI Decision Centre</h3>
        </div>
        {pending.length > 0 && (
          <span className="text-xs bg-wimmer-100 text-wimmer-700 px-2 py-0.5 rounded-full font-medium">{pending.length} pending</span>
        )}
      </div>

      <div className="space-y-3">
        {DEMO_RECOMMENDATIONS.map(rec => {
          const status = statuses[rec.id] || rec.status;
          const isOpen = expanded === rec.id;
          const done = status !== "pending";

          return (
            <div key={rec.id} className={`rounded-xl border p-4 transition-all ${done ? "opacity-60 border-slate-100 bg-slate-50" : "border-slate-200"}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${riskColor[rec.risk_level]}`}>
                      {rec.risk_level} risk
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {categoryLabel[rec.category] || rec.category}
                    </span>
                    {done && (
                      <span className={`text-xs font-medium ${status === "approved" ? "text-emerald-600" : "text-red-500"}`}>
                        {status === "approved" ? "✓ Approved" : "✗ Rejected"}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mt-1.5 leading-tight">{rec.title}</h4>

                  {isOpen && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                      <div className="bg-wimmer-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-wimmer-800 mb-1">Suggested action</div>
                        <p className="text-xs text-wimmer-700">{rec.suggested_action}</p>
                      </div>
                      {rec.expected_revenue_impact !== null && (
                        <div className="text-xs text-slate-600">
                          <span className="font-medium">Estimated impact:</span>{" "}
                          <span className={rec.expected_revenue_impact >= 0 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                            {rec.expected_revenue_impact >= 0 ? "+" : ""}€{Math.abs(rec.expected_revenue_impact).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button onClick={() => setExpanded(isOpen ? null : rec.id)} className="text-slate-400 hover:text-slate-600 p-0.5 flex-shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {!done && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => approve(rec.id)} className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => reject(rec.id)} className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-lg transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
