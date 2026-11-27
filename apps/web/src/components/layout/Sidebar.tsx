"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, BarChart3,
  DollarSign, Users2, Brain, FileText, Settings, ChevronRight,
  Utensils, ShoppingCart, ShoppingBag, Zap, TableProperties,
  ClipboardList, CalendarDays, BookOpen, Package, Truck, Building2,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  stub?: boolean;
};

type NavSection = {
  heading: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    heading: "Front of House",
    items: [
      { label: "POS Dashboard",   href: "/overview",      icon: LayoutDashboard },
      { label: "Tables",          href: "/tables",        icon: TableProperties },
      { label: "Live Orders",     href: "/orders",        icon: ClipboardList },
      { label: "Reservations",    href: "/reservations",  icon: CalendarDays, stub: true },
    ],
  },
  {
    heading: "Kitchen & Menu",
    items: [
      { label: "Menu & Items",    href: "/menu",          icon: BookOpen },
      { label: "Inventory & Stock", href: "/inventory",  icon: Package },
    ],
  },
  {
    heading: "Sales & Delivery",
    items: [
      { label: "Restaurant View", href: "/customer",     icon: Utensils },
      { label: "Deliveries",      href: "/deliveries",   icon: Truck, stub: true },
    ],
  },
  {
    heading: "Procurement",
    items: [
      { label: "idealo Procurement", href: "/supplier",  icon: ShoppingBag },
    ],
  },
  {
    heading: "Analytics",
    items: [
      { label: "Sales Analytics", href: "/intelligence", icon: TrendingUp },
      { label: "Demand Forecast", href: "/forecast",     icon: BarChart3 },
      { label: "Revenue",         href: "/revenue",      icon: DollarSign },
    ],
  },
  {
    heading: "Management",
    items: [
      { label: "Smart Orders",    href: "/decisions",    icon: Brain },
      { label: "Staff",           href: "/operations",   icon: Users2 },
      { label: "Reports",         href: "/reports",      icon: FileText },
      { label: "Settings",        href: "/settings",     icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-slate-200 flex flex-col z-30">
      {/* Logo */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-wimmer-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">W</div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">Wimmer POS</div>
            <div className="text-xs text-slate-400 leading-tight">Smart Procurement</div>
          </div>
        </div>
        {/* idealo.de badge */}
        <div className="mt-3 flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1.5">
          <div className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">i</div>
          <span className="text-xs font-semibold text-orange-700">idealo.de</span>
          <Zap className="w-3 h-3 text-orange-500 ml-auto" />
          <span className="text-xs text-orange-500 font-medium">live</span>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading}>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              {section.heading}
            </div>
            <ul className="space-y-0.5">
              {section.items.map(({ label, href, icon: Icon, stub }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                const isIdealo = href === "/supplier";
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                        active
                          ? isIdealo
                            ? "bg-orange-50 text-orange-700"
                            : "bg-wimmer-50 text-wimmer-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${
                        active
                          ? isIdealo ? "text-orange-600" : "text-wimmer-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`} />
                      <span className="flex-1 truncate">{label}</span>
                      {isIdealo && !active && (
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full leading-none">i</span>
                      )}
                      {stub && !active && (
                        <span className="text-xs text-slate-300 font-normal">soon</span>
                      )}
                      {active && (
                        <ChevronRight className={`w-3 h-3 ml-auto ${isIdealo ? "text-orange-400" : "text-wimmer-400"}`} />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* idealo.de CTA */}
      <div className="px-3 pb-2">
        <a
          href="https://www.idealo.de"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          <div className="w-4 h-4 rounded bg-white bg-opacity-25 flex items-center justify-center font-black text-xs flex-shrink-0">i</div>
          Order via idealo.de
          <ShoppingCart className="w-3.5 h-3.5 ml-auto" />
        </a>
      </div>

      {/* User */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-wimmer-100 flex items-center justify-center text-xs font-semibold text-wimmer-700">G</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-700 truncate">Gastro Berlin Group</div>
            <div className="text-xs text-slate-400">Wimmer POS · Pro</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
