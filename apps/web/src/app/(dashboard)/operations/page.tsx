import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { Users, Sparkles, ShoppingCart, UtensilsCrossed } from "lucide-react";

const SECTIONS = [
  {
    icon: Users,
    label: "Staffing",
    desc: "Optimise shift scheduling and headcount based on forecast occupancy and arrival patterns.",
  },
  {
    icon: Sparkles,
    label: "Housekeeping",
    desc: "Automated room-cleaning schedules, linen turnover, and inspection routing.",
  },
  {
    icon: ShoppingCart,
    label: "Procurement",
    desc: "Demand-driven purchase orders for consumables, amenities, and F&B inventory.",
  },
  {
    icon: UtensilsCrossed,
    label: "F&B",
    desc: "Covers forecasting, menu engineering, and waste reduction for restaurant and bar operations.",
  },
];

export default function OperationsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Operations"
        subtitle="Operational intelligence across departments"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Operational modules
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Each module will surface AI-driven recommendations and automated
            workflows once connected to your property management system.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {SECTIONS.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-5 flex gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className="w-4 h-4 text-wimmer-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-800">
                      {label}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-500 whitespace-nowrap">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
