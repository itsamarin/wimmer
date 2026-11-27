"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, TrendingUp, BarChart3,
  DollarSign, Users2, Brain, FileText, Settings, ChevronRight
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Intelligence", href: "/intelligence", icon: TrendingUp },
  { label: "Forecast", href: "/forecast", icon: BarChart3 },
  { label: "Revenue", href: "/revenue", icon: DollarSign },
  { label: "Operations", href: "/operations", icon: Users2 },
  { label: "AI Decisions", href: "/decisions", icon: Brain },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-slate-200 flex flex-col z-30">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-wimmer-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">W</div>
          <div>
            <div className="font-semibold text-slate-900 text-sm leading-tight">Wimmer</div>
            <div className="text-xs text-slate-400 leading-tight">Intelligence</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                    active
                      ? "bg-wimmer-50 text-wimmer-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-wimmer-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                  {label}
                  {active && <ChevronRight className="w-3 h-3 ml-auto text-wimmer-400" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-wimmer-100 flex items-center justify-center text-xs font-semibold text-wimmer-700">D</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-700 truncate">Demo Organisation</div>
            <div className="text-xs text-slate-400">Trial</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
