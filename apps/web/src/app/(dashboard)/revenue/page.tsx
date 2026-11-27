import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { TrendingUp, BedDouble, Euro, Users } from "lucide-react";

const KPI_CARDS = [
  {
    label: "ADR",
    value: "€148.50",
    description: "Average Daily Rate",
    icon: Euro,
    change: "+3.2%",
    positive: true,
  },
  {
    label: "RevPAR",
    value: "€107.52",
    description: "Revenue per Available Room",
    icon: TrendingUp,
    change: "+1.8%",
    positive: true,
  },
  {
    label: "TRevPAR",
    value: "€142.00",
    description: "Total Revenue per Available Room",
    icon: BedDouble,
    change: "+2.5%",
    positive: true,
  },
  {
    label: "Occupancy",
    value: "72.4%",
    description: "Portfolio average",
    icon: Users,
    change: "-0.6pp",
    positive: false,
  },
];

export default function RevenuePage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Revenue Intelligence"
        subtitle="Key revenue metrics and pricing insights"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        {/* KPI grid */}
        <div className="grid grid-cols-4 gap-4">
          {KPI_CARDS.map(({ label, value, description, icon: Icon, change, positive }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {label}
                </span>
                <div className="w-7 h-7 rounded-lg bg-wimmer-50 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-wimmer-600" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{description}</div>
              </div>
              <div
                className={`text-xs font-medium ${
                  positive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {change} vs last month
              </div>
            </div>
          ))}
        </div>

        {/* Coming-soon placeholder */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-wimmer-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-wimmer-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            Detailed revenue analytics and pricing recommendations coming soon
          </h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Rate-shop comparisons, demand-based pricing suggestions, length-of-stay
            optimisation, and channel contribution analysis will appear here once
            your PMS and channel manager are connected.
          </p>
        </div>
      </div>
    </div>
  );
}
