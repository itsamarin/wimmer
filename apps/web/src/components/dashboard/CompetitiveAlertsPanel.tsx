import React from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Info, ExternalLink } from "lucide-react";

type Alert = {
  id: string;
  severity: string;
  title: string;
  description: string;
  metric: string;
  action: string;
  idealo_url?: string;
};

const severityStyle: Record<string, string> = {
  high:   "border-red-100 bg-red-50",
  medium: "border-amber-100 bg-amber-50",
  low:    "border-emerald-100 bg-emerald-50",
};

const severityIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  high:   AlertTriangle,
  medium: TrendingDown,
  low:    TrendingUp,
};

const severityText: Record<string, string> = {
  high:   "text-red-600",
  medium: "text-amber-600",
  low:    "text-emerald-600",
};

export function AlertsPanel({ alerts, title }: { alerts: Alert[]; title: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {alerts.filter(a => a.severity === "high").length} high priority
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map(alert => {
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
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600">
                      <span className="font-medium">Action: </span>{alert.action}
                    </span>
                    {alert.idealo_url && (
                      <a
                        href={alert.idealo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        <div className="w-3 h-3 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs leading-none">i</div>
                        idealo.de <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
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

// Legacy export for pages that import the old name
export { AlertsPanel as CompetitiveAlertsPanel };
