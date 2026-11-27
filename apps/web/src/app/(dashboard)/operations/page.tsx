import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { DEMO_STAFF, DEMO_LIVE_ORDERS } from "@/lib/demo-data";
import { Clock, Users, ChefHat, CheckCircle } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  on_shift:  "bg-emerald-100 text-emerald-700",
  kitchen:   "bg-blue-100 text-blue-700",
  off_shift: "bg-slate-100 text-slate-500",
};

const STATUS_LABEL: Record<string, string> = {
  on_shift:  "On Shift",
  kitchen:   "In Kitchen",
  off_shift: "Off Shift",
};

export default function OperationsPage() {
  const ordersInKitchen = DEMO_LIVE_ORDERS.filter(o => o.status === "kitchen").length;
  const ordersReady     = DEMO_LIVE_ORDERS.filter(o => o.status === "ready").length;
  const avgElapsed      = Math.round(
    DEMO_LIVE_ORDERS.filter(o => o.status === "kitchen").reduce((s, o) => s + o.elapsed_min, 0) /
    Math.max(ordersInKitchen, 1)
  );

  const onShiftStaff = DEMO_STAFF.filter(s => s.status !== "off_shift");
  const topServer    = [...DEMO_STAFF].sort((a, b) => b.sales_today - a.sales_today)[0];

  return (
    <div className="flex flex-col h-full">
      <Header title="Staff & Operations" subtitle="Live shift overview — Mitte Fine Dining" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <DemoBanner />

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">On Shift</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{onShiftStaff.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">{DEMO_STAFF.filter(s => s.status === "off_shift").length} off shift</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Avg Ticket</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{avgElapsed}m</div>
            <div className="text-xs text-slate-400 mt-0.5">avg kitchen time</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <ChefHat className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">In Kitchen</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{ordersInKitchen}</div>
            <div className="text-xs text-slate-400 mt-0.5">orders being prepared</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Ready</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">{ordersReady}</div>
            <div className="text-xs text-slate-400 mt-0.5">waiting to be served</div>
          </div>
        </div>

        {/* Staff table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Staff on Shift</h3>
            <span className="text-xs text-slate-400">27 Nov 2026 · Evening Service</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Tables</th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Covers</th>
                <th className="text-right text-xs font-medium text-slate-500 px-4 py-3">Sales Today</th>
                <th className="text-right text-xs font-medium text-slate-500 px-5 py-3">Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {DEMO_STAFF.map(staff => (
                <tr key={staff.id} className={`hover:bg-slate-50 transition-colors ${staff.status === "off_shift" ? "opacity-60" : ""}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-wimmer-100 flex items-center justify-center text-xs font-bold text-wimmer-700 flex-shrink-0">
                        {staff.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 leading-tight">{staff.name}</div>
                        {staff.id === topServer.id && (
                          <div className="text-xs text-amber-600 font-medium">Top earner today</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{staff.role}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_BADGE[staff.status]}`}>
                      {STATUS_LABEL[staff.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {staff.tables.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {staff.tables.map(t => (
                          <span key={t} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{t}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700">{staff.covers_today}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-slate-800">
                    {staff.sales_today > 0 ? `€${staff.sales_today.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-slate-500 font-mono">{staff.shift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Kitchen performance + table turns */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Kitchen Performance</h3>
            <div className="space-y-3">
              {DEMO_LIVE_ORDERS.filter(o => o.status === "kitchen").map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm">Table {order.table}</span>
                    <span className="text-xs text-slate-500 ml-2">{order.items.length} items · {order.server}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    order.elapsed_min > 20 ? "bg-red-100 text-red-700" :
                    order.elapsed_min > 10 ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {order.elapsed_min}m
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Table Turn Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-600">Table Turns Today</span>
                <span className="font-bold text-slate-900">2.1</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-600">Avg Cover Time</span>
                <span className="font-bold text-slate-900">68 min</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-600">Covers Served Today</span>
                <span className="font-bold text-slate-900">94</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-600">Revenue per Cover</span>
                <span className="font-bold font-mono text-slate-900">€51.28</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-xs text-emerald-700 font-medium">Orders Ready — Waiting</span>
                <span className="font-bold text-emerald-700">{ordersReady} tables</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
