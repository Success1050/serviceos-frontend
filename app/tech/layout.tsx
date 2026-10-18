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
} from "lucide-react";

function TechShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isOnline, logout, isAuthenticated } = useTechAuth();

  const isAuthPage = pathname === "/tech/login" || pathname === "/tech/terms";

  const navItems = [
    {
      name: "Jobs",
      href: "/tech/jobs",
      icon: Wrench,
      badge: null,
    },
    {
      name: "Truck",
      href: "/tech/truck",
      icon: Truck,
      badge: null,
    },
    {
      name: "Wallet",
      href: "/tech/wallet",
      icon: Wallet,
      badge: null,
    },
    {
      name: "Profile",
      href: "/tech/profile",
      icon: UserCheck,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900/90 flex justify-center selection:bg-emerald-500 selection:text-white">
      {/* Mobile-Optimized Constrained Container */}
      <div className="w-full max-w-md min-h-screen bg-slate-950 text-slate-100 flex flex-col shadow-2xl relative border-x border-slate-800/80">
        {/* Sticky Mobile Top Field Header */}
        {!isAuthPage && (
          <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
            {/* Branding & Field Status */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs font-black tracking-tight text-white uppercase">
                    ServiceOS Field
                  </h1>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]">
                  {user?.tenantName || "Field Technician"}
                </p>
              </div>
            </div>

            {/* Network Telemetry & Logout */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isOnline
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                    : "bg-amber-950 text-amber-400 border border-amber-800/60"
                }`}
                title={isOnline ? "Cellular telemetry active" : "Operating in offline field cache"}
              >
                {isOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live GPS</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-400" />
                    <span>Offline</span>
                  </>
                )}
              </span>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                  title="Sign out of technician session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>
        )}

        {/* Dynamic Route Content */}
        <main className={`flex-1 flex flex-col ${!isAuthPage ? "pb-20" : ""}`}>
          {children}
        </main>

        {/* Bottom Mobile Navigation Bar */}
        {!isAuthPage && isAuthenticated && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-3 py-2 z-50">
            <div className="grid grid-cols-4 gap-1">
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
                    <span className="text-[11px] tracking-tight">{item.name}</span>
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
