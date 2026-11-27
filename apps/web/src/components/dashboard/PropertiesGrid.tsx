import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { DEMO_PROPERTIES } from "@/lib/demo-data";

const propertyOcc: Record<string, number> = {
  "demo-berlin": 74.2,
  "demo-hamburg": 70.8,
  "demo-munich": 72.1,
};

export function PropertiesGrid() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Properties</h3>
        <Link href="/properties" className="text-xs text-wimmer-600 hover:text-wimmer-700 font-medium">View all</Link>
      </div>
      <div className="space-y-3">
        {DEMO_PROPERTIES.map(p => (
          <Link key={p.id} href={`/properties/${p.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-wimmer-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-wimmer-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-wimmer-700">{p.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                <span className="text-xs text-slate-400">{p.city}</span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-400">{p.total_rooms} rooms</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold text-slate-900">{propertyOcc[p.id]}%</div>
              <div className="text-xs text-slate-400">occ.</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
