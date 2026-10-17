"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Bell,
  CheckCircle2,
  FileCheck,
  CreditCard,
  Wrench,
  AlertTriangle,
  Package,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { AppNotification } from "@/lib/types";

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onOpenDrawer?: () => void;
}

export function NotificationToast({
  notification,
  onDismiss,
  onOpenDrawer,
}: NotificationToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 6500);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [notification, onDismiss]);

  if (!notification && !visible) return null;

  const getIconAndStyle = (type: string = "INFO") => {
    const t = type.toUpperCase();
    if (t.includes("PAY") || t.includes("SETTLE") || t.includes("INVOICE")) {
      return {
        icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
        bg: "bg-emerald-50 border-emerald-200 text-emerald-950",
        badge: "Payment",
        accent: "bg-emerald-500",
      };
    }
    if (t.includes("QUOTE")) {
      return {
        icon: <FileCheck className="w-5 h-5 text-teal-600" />,
        bg: "bg-teal-50 border-teal-200 text-teal-950",
        badge: "Quote",
        accent: "bg-teal-500",
      };
    }
    if (t.includes("JOB") || t.includes("DISPATCH") || t.includes("TRUCK")) {
      return {
        icon: <Wrench className="w-5 h-5 text-indigo-600" />,
        bg: "bg-indigo-50 border-indigo-200 text-indigo-950",
        badge: "Field Ops",
        accent: "bg-indigo-500",
      };
    }
    if (t.includes("SUPPORT") || t.includes("DISPUTE") || t.includes("WARRANTY")) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        bg: "bg-amber-50 border-amber-200 text-amber-950",
        badge: "Support",
        accent: "bg-amber-500",
      };
    }
    if (t.includes("EXPENSE") || t.includes("RECEIPT")) {
      return {
        icon: <Receipt className="w-5 h-5 text-purple-600" />,
        bg: "bg-purple-50 border-purple-200 text-purple-950",
        badge: "Expense",
        accent: "bg-purple-500",
      };
    }
    if (t.includes("INVENTORY") || t.includes("WAREHOUSE")) {
      return {
        icon: <Package className="w-5 h-5 text-sky-600" />,
        bg: "bg-sky-50 border-sky-200 text-sky-950",
        badge: "Inventory",
        accent: "bg-sky-500",
      };
    }
    return {
      icon: <Bell className="w-5 h-5 text-[#006937]" />,
      bg: "bg-slate-50 border-slate-200 text-slate-900",
      badge: "Update",
      accent: "bg-[#006937]",
    };
  };

  const style = getIconAndStyle(notification?.type);

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ease-out transform ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-4 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-4 overflow-hidden relative group">
        {/* Top Accent Strip */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${style.accent}`} />

        <div className="flex items-start gap-3">
          {/* Icon Badge */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 shadow-sm">
            {style.icon}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {style.badge}
              </span>
              <span className="text-[11px] text-slate-400">Just now</span>
            </div>

            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-1">
              {notification?.title || "Real-time Notification"}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
              {notification?.message}
            </p>

            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
              {notification?.linkUrl && (
                <Link
                  href={notification.linkUrl}
                  onClick={() => {
                    setVisible(false);
                    setTimeout(onDismiss, 300);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006937] hover:text-[#004D28] transition-colors"
                >
                  View Details
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {onOpenDrawer && (
                <button
                  type="button"
                  onClick={() => {
                    setVisible(false);
                    onOpenDrawer();
                    setTimeout(onDismiss, 300);
                  }}
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Open Drawer
                </button>
              )}
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationToast;
