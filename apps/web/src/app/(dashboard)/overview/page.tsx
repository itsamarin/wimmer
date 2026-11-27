import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { OccupancyChart } from "@/components/charts/OccupancyChart";
import { SignalsPanel } from "@/components/dashboard/SignalsPanel";
import { RecommendationsPanel } from "@/components/dashboard/RecommendationsPanel";
import { PropertiesGrid } from "@/components/dashboard/PropertiesGrid";

export default function OverviewPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Portfolio Overview" subtitle="Performance across all properties" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />
        <KpiCards />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <OccupancyChart />
          </div>
          <div className="col-span-1">
            <SignalsPanel />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <RecommendationsPanel />
          </div>
          <div className="col-span-1">
            <PropertiesGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
