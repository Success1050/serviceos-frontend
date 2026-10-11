"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Crown,
  LayoutDashboard,
  Building2,
  CreditCard,
  Sliders,
  ShieldAlert,
  Settings,
  ArrowLeft,
  Activity,
  LogOut,
  Bell,
  Search,
} from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Platform Command",
      href: "/superadmin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Tenants & Organizations",
      href: "/superadmin/tenants",
      icon: <Building2 className="w-5 h-5" />,
      badge: "24",
    },
    {
      label: "Subscription Plans",
      href: "/superadmin/subscriptions",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      label: "Module Feature Gates",
      href: "/superadmin/modules",
      icon: <Sliders className="w-5 h-5" />,
    },
    {
      label: "Platform Audit Logs",
      href: "/superadmin/audit",
      icon: <ShieldAlert className="w-5 h-5" />,
    },
    {
      label: "Global Configuration",
      href: "/superadmin/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* SuperAdmin Dark Sidebar */}
      <aside className="w-68 border-r border-slate-800 bg-slate-900/90 flex flex-col shrink-0 h-screen sticky top-0 select-none">
        {/* Brand Header */}
        <div className="h-18 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-white tracking-wide">ServiceOS</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                SuperAdmin Plane
              </div>
            </div>
          </div>
        </div>

        {/* Global Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Control Plane
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                )}
              >
                <span className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400")}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Switch to Apps Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
          <Link
            href="/app/dashboard"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 text-xs font-medium text-slate-300 hover:text-white transition-all group"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Tenant View</span>
            </span>
          </Link>

          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cluster Healthy</span>
            </span>
            <span className="text-slate-400 font-mono">v2.28-prod</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-950">
        {/* Top Control Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Root Authority
            </span>
            <span className="text-xs text-slate-400">Platform Administrator Session</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenants, users, subscriptions..."
                className="pl-9 pr-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-72"
              />
            </div>

            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500 text-indigo-300 font-bold text-xs flex items-center justify-center">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
