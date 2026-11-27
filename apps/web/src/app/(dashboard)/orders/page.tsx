"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { DEMO_LIVE_ORDERS } from "@/lib/demo-data";
import { Clock, ChevronRight, AlertCircle, Users } from "lucide-react";

type Order = typeof DEMO_LIVE_ORDERS[number];
type Status = "new" | "kitchen" | "ready";

const COLUMNS: { key: Status; label: string; action: string; nextStatus: Status | null }[] = [
  { key: "new",     label: "New Orders",      action: "Send to Kitchen", nextStatus: "kitchen" },
  { key: "kitchen", label: "In Kitchen",      action: "Mark Ready",      nextStatus: "ready" },
  { key: "ready",   label: "Ready to Serve",  action: "Mark Served",     nextStatus: null },
];

function elapsedColor(min: number) {
  if (min < 5)  return "text-emerald-600 bg-emerald-50";
  if (min < 15) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function elapsedBorder(min: number) {
  if (min < 5)  return "border-l-emerald-400";
  if (min < 15) return "border-l-amber-400";
  return "border-l-red-400";
}

export default function OrdersPage() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  function getStatus(order: Order): Status {
    return (statuses[order.id] as Status) ?? (order.status as Status);
  }

  function advance(id: string, next: Status | null) {
    if (!next) return;
    setStatuses(s => ({ ...s, [id]: next }));
  }

  const ordersByColumn = (key: Status) =>
    DEMO_LIVE_ORDERS.filter(o => getStatus(o) === key);

  return (
    <div className="flex flex-col h-full">
      <Header title="Live Orders" subtitle="Real-time kitchen ticket board — Mitte Fine Dining" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-5">
          <DemoBanner />
        </div>

        <div className="grid grid-cols-3 gap-5 items-start">
          {COLUMNS.map(col => {
            const orders = ordersByColumn(col.key);
            const columnBg =
              col.key === "new"     ? "bg-blue-50 border-blue-200" :
              col.key === "kitchen" ? "bg-amber-50 border-amber-200" :
                                      "bg-emerald-50 border-emerald-200";
            const headerText =
              col.key === "new"     ? "text-blue-700" :
              col.key === "kitchen" ? "text-amber-700" :
                                      "text-emerald-700";
            const countBadge =
              col.key === "new"     ? "bg-blue-100 text-blue-700" :
              col.key === "kitchen" ? "bg-amber-100 text-amber-700" :
                                      "bg-emerald-100 text-emerald-700";
            const actionBtn =
              col.key === "new"     ? "bg-blue-600 hover:bg-blue-700 text-white" :
              col.key === "kitchen" ? "bg-amber-500 hover:bg-amber-600 text-white" :
                                      "bg-emerald-600 hover:bg-emerald-700 text-white";

            return (
              <div key={col.key} className={`rounded-xl border ${columnBg} p-4`}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-semibold text-sm ${headerText}`}>{col.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${countBadge}`}>{orders.length}</span>
                </div>

                {/* Order cards */}
                <div className="space-y-3">
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">No orders</div>
                  )}
                  {orders.map(order => {
                    const elapsed = statuses[order.id] ? order.elapsed_min : order.elapsed_min;
                    return (
                      <div
                        key={order.id}
                        className={`bg-white rounded-xl border border-l-4 ${elapsedBorder(elapsed)} border-slate-200 p-4 shadow-sm`}
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">Table {order.table}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Users className="w-3 h-3" /> {order.covers} covers
                              </span>
                              <span className="text-xs text-slate-400">· {order.server}</span>
                            </div>
                          </div>
                          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${elapsedColor(elapsed)}`}>
                            <Clock className="w-3 h-3" />
                            {elapsed}m
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-1 mb-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-slate-700">
                                <span className="font-semibold text-slate-900">{item.qty}×</span> {item.name}
                              </span>
                              <span className="text-slate-500 font-mono">€{item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>

                        {/* Notes */}
                        {order.special_notes && (
                          <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mb-2">
                            <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-amber-700">{order.special_notes}</span>
                          </div>
                        )}

                        {/* Total + action */}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-bold text-slate-900">€{order.total}</span>
                          {col.nextStatus && (
                            <button
                              onClick={() => advance(order.id, col.nextStatus)}
                              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${actionBtn}`}
                            >
                              {col.action}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {!col.nextStatus && (
                            <span className="text-xs font-semibold text-emerald-600">Served</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
