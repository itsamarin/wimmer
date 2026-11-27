import React from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Info } from "lucide-react";
import { DEMO_COMPETITIVE_ALERTS } from "@/lib/demo-data";

const severityStyle: Record<string, string> = {
  high: "border-red-100 bg-red-50",
  medium: "border-amber-100 bg-amber-50",
  low: "border-emerald-100 bg-emerald-50",
};

const severityIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  high: AlertTriangle,
  medium: TrendingDown,
  low: TrendingUp,
};

const severityText: Record<string, string> = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-emerald-600",
};

export function CompetitiveAlertsPanel() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-slate-900">Competitive Intelligence</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {DEMO_COMPETITIVE_ALERTS.filter(a => a.severity === "high").length} high priority
        </span>
      </div>
      <div className="space-y-3">
        {DEMO_COMPETITIVE_ALERTS.map(alert => {
          const Icon = severityIcon[alert.severity];
          return (
            <div key={alert.id} className={`rounded-xl border p-4 ${severityStyle[alert.severity]}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 ${severityText[alert.severity]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${severityText[alert.severity]}`}>{alert.metric}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${severityText[alert.severity]} bg-white bg-opacity-60`}>{alert.severity}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 leading-tight">{alert.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.description}</p>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-slate-700">Action: </span>
                    <span className="text-xs text-slate-600">{alert.action}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
