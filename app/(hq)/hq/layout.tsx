"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import {
  Network,
  LayoutDashboard,
  Building2,
  Package,
  UserCheck,
  Coins,
  Megaphone,
  Ticket,
  ChevronDown,
  ArrowLeft,
  LogOut,
  Bell,
  Search,
  ShieldAlert,
} from "lucide-react";

export default function HQLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, tenant, logout, isLoading } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  // Strict boundary: Sub-companies (tenant.parentId !== null) can NEVER access or see Franchise HQ God-View!
  const isSubCompany = Boolean(tenant?.parentId || tenant?.parentTenantId);
  const isHqAuthorized =
    !isSubCompany &&
    (user?.role === "HQ_ADMIN" ||
      user?.isSuperAdmin ||
      (user?.role === "TENANT_OWNER" && (tenant?.children?.length ?? 0) > 0));

  useEffect(() => {
    if (!isLoading && user && !isHqAuthorized) {
      router.replace("/app/dashboard");
    }
  }, [isLoading, user, isHqAuthorized, router]);

  if (!isLoading && user && !isHqAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-100 p-6">
        <div className="text-center max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Franchise HQ God-View is strictly restricted to Corporate HQ Executives and Platform Admins. Sub-company branch accounts and non-HQ tenants cannot access this view.
          </p>
          <Link
            href="/app/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
          >
            Return to Branch Backoffice
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      label: "God-View Command",
      href: "/hq",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Sub-Companies & Branches",
      href: "/hq/branches",
      icon: <Building2 className="w-5 h-5" />,
      badge: "3",
    },
    {
      label: "Supply Chain & Warehouses",
      href: "/hq/supply-chain",
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: "Staff & Tech Approvals",
      href: "/hq/proxy-verification",
      icon: <UserCheck className="w-5 h-5" />,
      badge: "2",
    },
    {
      label: "Franchise Royalties",
      href: "/hq/royalties",
      icon: <Coins className="w-5 h-5" />,
    },
    {
      label: "Corporate Bulletin",
      href: "/hq/announcements",
      icon: <Megaphone className="w-5 h-5" />,
    },
    {
      label: "Escalation Tickets",
      href: "/hq/escalation-tickets",
      icon: <Ticket className="w-5 h-5" />,
      badge: "1",
    },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* HQ Navigation Sidebar */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/95 flex flex-col shrink-0 h-screen sticky top-0 select-none">
        {/* Brand Header */}
        <div className="h-18 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-white tracking-wide truncate max-w-[150px]">
                {tenant?.name || "Corporate HQ"}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                Franchise God-View
              </div>
            </div>
          </div>
        </div>

        {/* Global Branch Filter Dropdown */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Network View Filter
          </label>
          <div className="relative">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full appearance-none bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-emerald-500 pr-8 cursor-pointer"
            >
              <option value="ALL">🌐 All Branches (Network Aggregate)</option>
              <option value="abuja">🏛️ Abuja Capital Branch</option>
              <option value="lagos-island">🌴 Lagos Island Regional Branch</option>
              <option value="ph">⚡ Port Harcourt Industrial Branch</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Corporate Operations
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/hq" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                )}
              >
                <span className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400")}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                      isActive ? "bg-white text-emerald-800" : "bg-emerald-500/20 text-emerald-300"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer: Return to Backoffice & Session */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <Link
            href="/app/dashboard"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all border border-slate-700/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Branch Backoffice</span>
          </Link>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.firstName?.[0] || "HQ"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Franchise Executive"}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Corporate God-View Active
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Managing 3 regional sub-companies
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search branches, inventory, tickets..."
                className="pl-9 pr-4 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs w-64 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
