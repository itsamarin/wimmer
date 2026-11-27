import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
      <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-medium text-amber-800">Demo mode active.</span>{" "}
        <span className="text-amber-700">You are viewing simulated data for Wimmer Berlin Central, Hamburg Harbour, and Munich Residence. Upload your own data to see real forecasts and recommendations.</span>
      </div>
    </div>
  );
}
