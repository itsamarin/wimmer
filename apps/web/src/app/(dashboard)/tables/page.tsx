import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { DEMO_TABLES } from "@/lib/demo-data";

const CURRENT_TIME = "19:41";

function parseMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function elapsedLabel(seated_at: string | null): string {
  if (!seated_at) return "";
  const diff = parseMinutes(CURRENT_TIME) - parseMinutes(seated_at);
  if (diff < 0) return "0m";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  starters: "bg-blue-100 text-blue-700",
  mains:    "bg-orange-100 text-orange-700",
  dessert:  "bg-purple-100 text-purple-700",
  drinks:   "bg-teal-100 text-teal-700",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  starters: "Starters",
  mains:    "Mains",
  dessert:  "Dessert",
  drinks:   "Drinks",
};

const TABLE_STATUS_BG: Record<string, string> = {
  occupied:       "bg-red-50 border-red-200",
  available:      "bg-emerald-50 border-emerald-200",
  reserved:       "bg-amber-50 border-amber-200",
  needs_cleaning: "bg-slate-100 border-slate-200",
};

const TABLE_STATUS_BADGE: Record<string, string> = {
  occupied:       "bg-red-100 text-red-700",
  available:      "bg-emerald-100 text-emerald-700",
  reserved:       "bg-amber-100 text-amber-700",
  needs_cleaning: "bg-slate-200 text-slate-600",
};

const TABLE_STATUS_LABEL: Record<string, string> = {
  occupied:       "Occupied",
  available:      "Available",
  reserved:       "Reserved",
  needs_cleaning: "Needs Cleaning",
};

const SECTIONS = ["Main Floor", "Terrace", "Private Dining", "Bar"];

export default function TablesPage() {
  const counts = {
    occupied:       DEMO_TABLES.filter(t => t.status === "occupied").length,
    available:      DEMO_TABLES.filter(t => t.status === "available").length,
    reserved:       DEMO_TABLES.filter(t => t.status === "reserved").length,
    needs_cleaning: DEMO_TABLES.filter(t => t.status === "needs_cleaning").length,
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Table Management" subtitle="Real-time floor view — Mitte Fine Dining" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        {/* Summary chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-red-700">{counts.occupied} Occupied</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-emerald-700">{counts.available} Available</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-amber-700">{counts.reserved} Reserved</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-600">{counts.needs_cleaning} Needs Cleaning</span>
          </div>
          <div className="ml-auto text-xs text-slate-400 font-medium">Updated {CURRENT_TIME}</div>
        </div>

        {/* Sections */}
        {SECTIONS.map(section => {
          const tables = DEMO_TABLES.filter(t => t.section === section);
          if (tables.length === 0) return null;
          return (
            <div key={section}>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{section}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tables.map(table => (
                  <div
                    key={table.id}
                    className={`rounded-xl border p-4 flex flex-col gap-3 ${TABLE_STATUS_BG[table.status]}`}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">{table.name}</span>
                        <span className="text-xs text-slate-500">{table.capacity} seats</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TABLE_STATUS_BADGE[table.status]}`}>
                        {TABLE_STATUS_LABEL[table.status]}
                      </span>
                    </div>

                    {/* Occupied detail */}
                    {table.status === "occupied" && (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>{table.covers_seated} of {table.capacity} covers</span>
                          <span className="font-medium text-slate-800">{elapsedLabel(table.seated_at as string)}</span>
                        </div>
                        <div className="text-slate-500">Server: <span className="font-medium text-slate-700">{table.server}</span></div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-slate-900 text-sm">€{table.order_value}</span>
                          {table.order_status && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[table.order_status] ?? "bg-slate-100 text-slate-600"}`}>
                              {ORDER_STATUS_LABELS[table.order_status] ?? table.order_status}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reserved detail */}
                    {table.status === "reserved" && (
                      <div className="space-y-1 text-xs text-slate-600">
                        <div>Reserved at <span className="font-semibold text-slate-800">{(table as { reserved_at?: string }).reserved_at}</span></div>
                        <div>Name: <span className="font-semibold text-slate-800">{(table as { reserved_name?: string }).reserved_name}</span></div>
                      </div>
                    )}

                    {/* Available */}
                    {table.status === "available" && (
                      <div className="text-xs text-emerald-600 font-medium">Ready to seat</div>
                    )}

                    {/* Needs cleaning */}
                    {table.status === "needs_cleaning" && (
                      <button className="w-full text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg py-1.5 transition-colors">
                        Mark as Clean
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
