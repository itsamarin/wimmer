import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Reports"
        subtitle="Scheduled and on-demand performance reports"
      />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-wimmer-50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-wimmer-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              Report generation is coming in a future release
            </h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              You will be able to generate, schedule, and export reports covering
              occupancy, revenue, operational KPIs, and market intelligence across
              any date range and property selection. Outputs will be available as
              PDF, CSV, and direct email delivery.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
