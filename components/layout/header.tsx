"use client";

import React from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useNotifications } from "@/components/providers/notification-provider";
import { Bell, Search, LogOut, Menu } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { isConnected } = useSocket();
  const { user, tenant, logout } = useAuth();
  const { toggleMobileMenu } = useSidebar();
  const { unreadCount, openDrawer, isDrawerOpen } = useNotifications();

  return (
    <header className="min-h-[72px] h-[72px] border-b border-slate-200 bg-white/85 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 gap-3 sm:gap-6">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors lg:hidden shrink-0"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div className="min-w-0 pr-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* Realtime WebSocket Connection Pulse */}
        <div
          title={isConnected ? "Realtime sync active" : "Disconnected - attempting reconnect"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border bg-slate-50 border-slate-200 text-slate-600 select-none shrink-0"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
            }`}
          />
          <span className="hidden xl:inline">
            {isConnected ? "Realtime Active" : "Connecting..."}
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers, jobs, invoices..."
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs w-40 lg:w-48 xl:w-60 focus:w-64 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
          />
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={openDrawer}
          className={`relative p-2 rounded-xl transition-all ${
            isDrawerOpen
              ? "bg-[#006937]/10 text-[#006937]"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
          title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "Notifications"}
          aria-label="Open notifications drawer"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full bg-[#006937] text-white text-[10px] font-bold flex items-center justify-center shadow-sm border-2 border-white ring-1 ring-[#006937]/20">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : (
            <span className="sr-only">No unread notifications</span>
          )}
        </button>

        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* User Profile Chip */}
        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-[#006937]/10 text-[#006937] font-bold text-xs flex items-center justify-center shrink-0 border border-[#006937]/20 shadow-2xs">
              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight whitespace-nowrap">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.email.split("@")[0]}
              </span>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                {tenant?.name || user.role?.replace(/_/g, " ")}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-0.5"
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
