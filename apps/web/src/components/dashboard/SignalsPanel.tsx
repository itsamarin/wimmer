import { TrendingUp, TrendingDown, Calendar, Cloud } from "lucide-react";
import { DEMO_SIGNALS } from "@/lib/demo-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  public_holiday: Calendar,
  seasonal_trend: TrendingUp,
  seasonal_event: TrendingUp,
  weather: Cloud,
};

const impactColor: Record<string, string> = {
  high: "bg-emerald-50 text-emerald-700 border-emerald-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  low: "bg-slate-50 text-slate-600 border-slate-200",
};

export function SignalsPanel() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Seasonal Signals</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{DEMO_SIGNALS.length} active</span>
      </div>
      <div className="space-y-3">
        {DEMO_SIGNALS.map(signal => {
          const Icon = iconMap[signal.type] || Calendar;
          return (
            <div key={signal.id} className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${impactColor[signal.impact]}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-800 leading-tight">{signal.title}</div>
                <div className="text-xs text-slate-500 mt-0.5 leading-tight">{signal.description}</div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${impactColor[signal.impact]}`}>
                    {signal.impact} impact
                  </span>
                  {signal.direction === "positive" ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
