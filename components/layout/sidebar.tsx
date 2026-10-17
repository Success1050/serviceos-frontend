"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Wrench,
  Package,
  Receipt,
  RotateCcw,
  Headphones,
  UserCheck,
  Wallet,
  Settings,
  Building2,
  LogOut,
  Network,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
  badge?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, tenant, logout } = useAuth();
  const {
    isDesktopCollapsed,
    isMobileOpen,
    toggleDesktopCollapse,
    closeMobileMenu,
  } = useSidebar();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/app/dashboard",
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Customers",
      href: "/app/customers",
      icon: <Users className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Dispatch Board",
      href: "/app/dispatch",
      icon: <Calendar className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Quotes",
      href: "/app/quotes",
      icon: <FileText className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Invoices & Billing",
      href: "/app/invoices",
      icon: <CreditCard className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Asset Registry",
      href: "/app/assets",
      icon: <Wrench className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Inventory & Warehouses",
      href: "/app/inventory",
      icon: <Package className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Field Expenses",
      href: "/app/expenses",
      icon: <Receipt className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Maintenance",
      href: "/app/maintenance",
      icon: <RotateCcw className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Support Desk",
      href: "/app/support",
      icon: <Headphones className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Blue-Collar HR",
      href: "/app/hr",
      icon: <UserCheck className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Wallet & Payroll",
      href: "/app/wallet",
      icon: <Wallet className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Franchise HQ God-View",
      href: "/hq",
      icon: <Network className="w-5 h-5 shrink-0" />,
    },
    {
      label: "Settings",
      href: "/app/settings",
      icon: <Settings className="w-5 h-5 shrink-0" />,
    },
  ];

  // Strict boundary: Sub-companies (tenant.parentId !== null) can NEVER see or access the HQ God-View!
  const isSubCompany = Boolean(tenant?.parentId || tenant?.parentTenantId);
  const canAccessHq =
    !isSubCompany &&
    (user?.role === "HQ_ADMIN" ||
      user?.isSuperAdmin ||
      (user?.role === "TENANT_OWNER" && (tenant?.children?.length ?? 0) > 0));

  const visibleNavItems = navItems.filter((item) => {
    if (item.href === "/hq") {
      return canAccessHq;
    }
    return true;
  });

  return (
    <>
      {/* 1. Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* 2. Mobile Drawer Navigation (Completely collapsed unless toggled) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col shadow-2xl lg:hidden transition-transform duration-300 ease-in-out select-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header with Close Button */}
        <div className="min-h-[72px] h-[72px] px-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-xl bg-[#006937] flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="font-bold text-sm text-slate-900 leading-tight line-clamp-2 break-words"
                title={tenant?.name || "ServiceOS Enterprise"}
              >
                {tenant?.name || "ServiceOS Enterprise"}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit uppercase tracking-wider mt-1">
                {user?.role?.replace(/_/g, " ") || "Tenant"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeMobileMenu}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-50/80 text-[#006937] font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                )}
              >
                <span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-[#006937]" : "text-slate-400 group-hover:text-slate-600"
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-[#006937]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile User Profile Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#006937]/10 text-[#006937] font-bold text-xs flex items-center justify-center shrink-0">
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.email}
                </span>
                <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                logout();
              }}
              title="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Desktop Persistent Collapsible/Retractable Sidebar (hidden on mobile) */}
      <aside
        className={cn(
          "hidden lg:flex border-r border-slate-200 bg-white flex-col shrink-0 h-screen sticky top-0 select-none transition-all duration-300 ease-in-out",
          isDesktopCollapsed ? "w-20" : "w-72 sm:w-[280px]"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "min-h-[72px] h-[72px] border-b border-slate-200 flex items-center transition-all",
            isDesktopCollapsed ? "px-3 justify-center" : "px-4.5 sm:px-5 justify-between"
          )}
        >
          {isDesktopCollapsed ? (
            <button
              type="button"
              onClick={toggleDesktopCollapse}
              className="w-10 h-10 rounded-xl bg-[#006937] flex items-center justify-center text-white font-bold shadow-xs hover:bg-[#005a2f] transition-transform hover:scale-105"
              title="Expand sidebar (shows icons + labels)"
            >
              <Building2 className="w-5 h-5" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0 pr-1">
                <div className="w-10 h-10 rounded-xl bg-[#006937] flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className="font-bold text-sm text-slate-900 leading-tight line-clamp-2 break-words"
                    title={tenant?.name || "ServiceOS Enterprise"}
                  >
                    {tenant?.name || "ServiceOS Enterprise"}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit uppercase tracking-wider mt-1">
                    {user?.role?.replace(/_/g, " ") || "Tenant"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDesktopCollapse}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0 ml-1"
                title="Retract sidebar (shows icons only)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 sm:px-3.5 py-4 space-y-1.5 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            if (isDesktopCollapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "flex items-center justify-center h-11 w-full rounded-xl transition-all group relative",
                    isActive
                      ? "bg-emerald-50/90 text-[#006937] font-semibold shadow-xs"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/70"
                  )}
                >
                  <span
                    className={cn(
                      "transition-colors",
                      isActive ? "text-[#006937]" : "text-slate-400 group-hover:text-slate-700"
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.badge && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#006937]" />
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-50/80 text-[#006937] font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                )}
              >
                <span
                  className={cn(
                    "transition-colors shrink-0",
                    isActive ? "text-[#006937]" : "text-slate-400 group-hover:text-slate-600"
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-[#006937]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Retracted Expand Bar */}
        {isDesktopCollapsed && (
          <div className="p-2 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={toggleDesktopCollapse}
              className="p-2 text-slate-400 hover:text-[#006937] hover:bg-emerald-50 rounded-lg transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Desktop Footer / User Session */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50/60">
          {isDesktopCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-9 h-9 rounded-full bg-[#006937]/10 text-[#006937] font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200"
                title={user?.firstName ? `${user.firstName} (${user?.email})` : user?.email}
              >
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#006937]/10 text-[#006937] font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.email}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
