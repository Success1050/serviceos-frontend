"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Wrench,
  Headphones,
  UserCheck,
  Wallet,
  Settings,
  Building2,
  LogOut,
  Network,
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
  const { user, tenant, logout, hasPermission } = useAuth();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/app/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Customers",
      href: "/app/customers",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Dispatch Board",
      href: "/app/dispatch",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: "Quotes",
      href: "/app/quotes",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      label: "Invoices & Billing",
      href: "/app/invoices",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      label: "Asset Registry",
      href: "/app/assets",
      icon: <Wrench className="w-5 h-5" />,
    },
    {
      label: "Support Desk",
      href: "/app/support",
      icon: <Headphones className="w-5 h-5" />,
    },
    {
      label: "Blue-Collar HR",
      href: "/app/hr",
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      label: "Wallet & Payroll",
      href: "/app/wallet",
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      label: "Franchise HQ God-View",
      href: "/hq",
      icon: <Network className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "/app/settings",
      icon: <Settings className="w-5 h-5" />,
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
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#006937] flex items-center justify-center text-white font-bold shadow-xs">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-slate-900 truncate">
            {tenant?.name || "ServiceOS Enterprise"}
          </span>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded w-fit uppercase tracking-wider">
            {user?.role?.replace(/_/g, " ") || "Tenant"}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

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

      {/* Footer / User Session */}
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
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
