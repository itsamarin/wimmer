import { Zap } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-start gap-3 bg-gradient-to-r from-orange-50 to-emerald-50 border border-orange-200 rounded-xl p-4">
      <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 mt-0.5">i</div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold text-slate-900">Wimmer POS — Live Demo</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" /> idealo.de connected
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your POS is monitoring sales in real time. When stock runs low or demand is forecast to spike,{" "}
          <span className="font-semibold text-orange-700">Wimmer always reorders via idealo.de</span>{" "}
          — automatically comparing prices across suppliers so you get the best deal, every time.
        </p>
      </div>
    </div>
  );
}
