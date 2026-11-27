import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { DEMO_PROPERTIES } from "@/lib/demo-data";
import { Building2, MapPin, Star } from "lucide-react";

export default function PropertiesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Properties" subtitle="All hotel properties in your portfolio" />
      <div className="flex-1 p-6 space-y-6">
        <DemoBanner />
        <div className="grid grid-cols-3 gap-5">
          {DEMO_PROPERTIES.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-wimmer-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-wimmer-600" />
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-medium">Demo</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-1">{p.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                <MapPin className="w-3 h-3" /> {p.city}, {p.country}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-slate-400">Rooms</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{p.total_rooms}</div>
                </div>
                <div>
                  <div className="text-slate-400">Rating</div>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />{p.stars}★
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
