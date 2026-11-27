import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { OccupancyChart } from "@/components/charts/OccupancyChart";
import { Info } from "lucide-react";

const MODEL_METRICS = [
  { label: "Model", value: "Seasonal Naïve", mono: false },
  { label: "MAE", value: "4.2%", mono: true },
  { label: "RMSE", value: "5.8%", mono: true },
  { label: "WAPE", value: "6.1%", mono: true },
  { label: "Training days", value: "365", mono: true },
];

export default function ForecastPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Demand Forecast"
        subtitle="Occupancy and RevPAR projections across the portfolio"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        <OccupancyChart />

        {/* Forecast accuracy card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Forecast accuracy
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Back-tested against the last 90 days of actuals — demo values.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {MODEL_METRICS.map(({ label, value, mono }) => (
              <div
                key={label}
                className="flex flex-col gap-1 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100"
              >
                <span className="text-xs text-slate-500">{label}</span>
                <span
                  className={`text-sm font-semibold text-slate-900 ${
                    mono ? "font-mono" : ""
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              These metrics are illustrative demo values. Accuracy will update
              automatically once real property data is connected.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
