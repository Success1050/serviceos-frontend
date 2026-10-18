"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TechAuthProvider, useTechAuth } from "@/components/tech";
import {
  Wrench,
  Truck,
  Wallet,
  UserCheck,
  Wifi,
  WifiOff,
  LogOut,
  Zap,
  Shield,
  Layers,
  ChevronRight,
} from "lucide-react";

function TechShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isOnline, logout, isAuthenticated } = useTechAuth();

  const isAuthPage = pathname === "/tech/login" || pathname === "/tech/terms";

  const navItems = [
    {
      name: "Jobs Queue",
      href: "/tech/jobs",
      icon: Wrench,
    },
    {
      name: "Truck Inventory",
      href: "/tech/truck",
      icon: Truck,
    },
    {
      name: "Earnings & Wallet",
      href: "/tech/wallet",
      icon: Wallet,
    },
    {
      name: "HR Dossier",
      href: "/tech/profile",
      icon: UserCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* 1. TOP HEADER (Responsive for both Mobile & Desktop) */}
      {!isAuthPage && (
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Left: Branding & Tenant Identity */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 shrink-0">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black tracking-tight text-white uppercase">
                    ServiceOS Field
                  </h1>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Operations
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                  {user?.tenantName || "Field Technician"}
                </p>
              </div>
            </div>

            {/* Middle: Desktop Navigation Bar (Visible on md: and above) */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400 stroke-[2.5]" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right: Telemetry, Technician Profile & Logout */}
            <div className="flex items-center gap-3">
              {/* Telemetry Indicator */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  isOnline
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                    : "bg-amber-950 text-amber-400 border border-amber-800/60"
                }`}
                title={isOnline ? "Cellular telemetry & GPS active" : "Operating in offline field cache"}
              >
                {isOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Telemetry</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>Offline Cache</span>
                  </>
                )}
              </span>

              {/* Technician User Badge (Desktop) */}
              {isAuthenticated && user && (
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-xs font-black text-white">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              )}

              {/* Logout Button */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Sign out of technician session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 2. MAIN CONTENT AREA (Responsive Container) */}
      <main className={`flex-1 flex flex-col ${!isAuthPage ? "pb-20 md:pb-8" : ""}`}>
        {/* On mobile: centered container; on desktop: max-w-7xl desktop container */}
        <div className={isAuthPage ? "w-full max-w-md md:max-w-xl mx-auto flex-1 flex flex-col p-4 sm:p-6" : "w-full max-w-7xl mx-auto flex-1 flex flex-col"}>
          {children}
        </div>
      </main>

      {/* 3. BOTTOM MOBILE NAVIGATION BAR (Only visible on mobile screens < md) */}
      {!isAuthPage && isAuthenticated && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-3 py-2 z-50">
          <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                    isActive
                      ? "text-emerald-400 font-bold bg-emerald-500/10"
                      : "text-slate-400 hover:text-slate-200 font-medium"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                  <span className="text-[11px] tracking-tight">{item.name.split(" ")[0]}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 w-6 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

export default function TechnicianRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TechAuthProvider>
      <TechShellInner>{children}</TechShellInner>
    </TechAuthProvider>
  );
}
