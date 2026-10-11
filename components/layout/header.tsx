"use client";

import React from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Bell, Search, LogOut, User as UserIcon } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { isConnected } = useSocket();
  const { user, tenant, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        {title && <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Realtime WebSocket Connection Pulse */}
        <div
          title={isConnected ? "Realtime sync active" : "Disconnected - attempting reconnect"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-slate-50 border-slate-200 text-slate-600 select-none"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
            }`}
          />
          <span>{isConnected ? "Realtime Active" : "Connecting..."}</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers, jobs, invoices..."
            className="pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs w-64 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006937] focus:border-[#006937] transition-all"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#006937]" />
        </button>

        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* User Profile Chip */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#006937]/10 text-[#006937] font-bold text-xs flex items-center justify-center shrink-0">
              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email.split("@")[0]}
              </span>
              <span className="text-[10px] text-slate-400">
                {tenant?.name || user.role?.replace(/_/g, " ")}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

