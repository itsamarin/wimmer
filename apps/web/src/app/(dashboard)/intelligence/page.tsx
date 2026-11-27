import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { SignalsPanel } from "@/components/dashboard/SignalsPanel";
import {
  CalendarDays,
  TrendingUp,
  CloudSun,
  MapPin,
  Plane,
} from "lucide-react";

const monitored = [
  {
    icon: CalendarDays,
    label: "Public Holidays",
    desc: "School and bank holidays across all regions your properties operate in, including local and national observances.",
  },
  {
    icon: TrendingUp,
    label: "Seasonal Trends",
    desc: "Long-run occupancy and ADR patterns derived from historical data, adjusted for year-over-year drift.",
  },
  {
    icon: CloudSun,
    label: "Weather Patterns",
    desc: "Seasonal weather signals and anomaly forecasts that correlate with booking pace for leisure properties.",
  },
  {
    icon: MapPin,
    label: "Local Events",
    desc: "Conferences, concerts, sports fixtures, and festivals within a configurable radius of each property.",
  },
  {
    icon: Plane,
    label: "Tourism Data",
    desc: "Destination-level visitor indices and forward-looking flight search volume for inbound demand estimation.",
  },
];

export default function IntelligencePage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Market Intelligence"
        subtitle="Seasonal signals, events, and demand drivers"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        <div className="grid grid-cols-3 gap-6">
          {/* Left column – live signals feed */}
          <div className="col-span-2">
            <SignalsPanel />
          </div>

          {/* Right column – what Wimmer monitors */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-5 h-full">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                What Wimmer monitors
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Wimmer continuously ingests the following external data sources
                and blends them into the demand forecast for each property.
              </p>

              <ul className="space-y-4">
                {monitored.map(({ icon: Icon, label, desc }) => (
                  <li key={label} className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-wimmer-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-wimmer-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        {label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Signal coverage and refresh frequency depend on your connected
                  integrations. Configure them in{" "}
                  <a
                    href="/settings"
                    className="text-wimmer-600 hover:underline"
                  >
                    Settings → Integrations
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
