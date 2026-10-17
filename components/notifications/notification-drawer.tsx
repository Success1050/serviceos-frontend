"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  X,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  CheckCheck,
  Check,
  Sparkles,
  ArrowUpRight,
  CreditCard,
  FileCheck,
  Wrench,
  AlertTriangle,
  Receipt,
  Package,
  Clock,
  Filter,
} from "lucide-react";
import { AppNotification, NotificationCategory } from "@/lib/types";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  isLoading: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSendTestNotification?: () => void;
  isSendingTest?: boolean;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  isLoading,
  soundEnabled,
  onToggleSound,
  onMarkAsRead,
  onMarkAllAsRead,
  onSendTestNotification,
  isSendingTest = false,
}: NotificationDrawerProps) {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("ALL");
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Map notification type to Category
  const categorizeType = (type: string = ""): NotificationCategory => {
    const t = type.toUpperCase();
    if (t.includes("PAY") || t.includes("SETTLE") || t.includes("INVOICE")) return "PAYMENT";
    if (t.includes("QUOTE")) return "QUOTE";
    if (t.includes("JOB") || t.includes("DISPATCH") || t.includes("TRUCK")) return "JOB";
    if (t.includes("SUPPORT") || t.includes("DISPUTE") || t.includes("WARRANTY")) return "SUPPORT";
    return "SYSTEM";
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (unreadOnly && n.isRead) return false;
      if (activeCategory === "ALL") return true;
      return categorizeType(n.type) === activeCategory;
    });
  }, [notifications, activeCategory, unreadOnly]);

  const formatRelativeTime = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 45) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return past.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const getCategoryBadge = (type: string = "INFO") => {
    const cat = categorizeType(type);
    switch (cat) {
      case "PAYMENT":
        return {
          label: "Payment",
          icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
          chipBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          iconBg: "bg-emerald-100/60 text-emerald-700",
        };
      case "QUOTE":
        return {
          label: "Quote",
          icon: <FileCheck className="w-4 h-4 text-teal-600" />,
          chipBg: "bg-teal-50 text-teal-700 border-teal-200",
          iconBg: "bg-teal-100/60 text-teal-700",
        };
      case "JOB":
        return {
          label: "Dispatch",
          icon: <Wrench className="w-4 h-4 text-indigo-600" />,
          chipBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          iconBg: "bg-indigo-100/60 text-indigo-700",
        };
      case "SUPPORT":
        return {
          label: "Support",
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          chipBg: "bg-amber-50 text-amber-700 border-amber-200",
          iconBg: "bg-amber-100/60 text-amber-700",
        };
      default:
        return {
          label: "System",
          icon: <Bell className="w-4 h-4 text-slate-600" />,
          chipBg: "bg-slate-50 text-slate-700 border-slate-200",
          iconBg: "bg-slate-100 text-slate-700",
        };
    }
  };

  const categories: { key: NotificationCategory; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "QUOTE", label: "Quotes" },
    { key: "PAYMENT", label: "Payments" },
    { key: "JOB", label: "Jobs" },
    { key: "SUPPORT", label: "Support" },
    { key: "SYSTEM", label: "System" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform duration-300 ease-out animate-slideLeft">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#006937]/10 text-[#006937] flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Notifications
                    </h2>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#006937] text-white">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Real-time operational alerts & updates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Audio Chime Mute/Unmute */}
                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`p-2 rounded-lg transition-colors ${
                    soundEnabled
                      ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  }`}
                  title={soundEnabled ? "Audio chimes: ON" : "Audio chimes: MUTED"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Close Drawer (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/80">
              {/* Send Test Notification Button */}
              {onSendTestNotification && (
                <button
                  type="button"
                  onClick={onSendTestNotification}
                  disabled={isSendingTest}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#006937] bg-[#006937]/10 hover:bg-[#006937]/20 transition-all disabled:opacity-50"
                  title="Trigger a real-time test event via WebSocket"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isSendingTest ? "Sending..." : "Test Event"}
                </button>
              )}

              {/* Mark All As Read Button */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors ml-auto"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#006937]" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    activeCategory === cat.key
                      ? "bg-[#006937] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Unread Only Toggle */}
            <div className="flex items-center justify-between mt-2 pt-2 text-[11px] text-slate-500">
              <span>Showing {filteredNotifications.length} items</span>
              <button
                type="button"
                onClick={() => setUnreadOnly((prev) => !prev)}
                className={`inline-flex items-center gap-1 font-medium transition-colors ${
                  unreadOnly ? "text-[#006937] font-semibold" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Filter className="w-3 h-3" />
                {unreadOnly ? "Unread only (Active)" : "Filter unread"}
              </button>
            </div>
          </div>

          {/* Notifications Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
            {isLoading ? (
              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 animate-pulse flex gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-5/6" />
                      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-center mb-3 text-slate-400">
                  <BellOff className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">
                  All caught up!
                </h4>
                <p className="text-xs text-slate-500 max-w-[220px]">
                  {unreadOnly
                    ? "No unread alerts in this category."
                    : "You do not have any alerts in this category right now."}
                </p>
                {unreadOnly && (
                  <button
                    type="button"
                    onClick={() => setUnreadOnly(false)}
                    className="mt-3 text-xs font-semibold text-[#006937] hover:underline"
                  >
                    Show all notifications
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const badge = getCategoryBadge(n.type);
                return (
                  <div
                    key={n.id}
                    className={`pt-2.5 first:pt-0 group transition-all`}
                  >
                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        !n.isRead
                          ? "bg-emerald-50/20 border-emerald-200/80 shadow-xs hover:border-emerald-300"
                          : "bg-white border-slate-200/70 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${badge.iconBg}`}
                        >
                          {badge.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.chipBg}`}
                            >
                              {badge.label}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>{formatRelativeTime(n.createdAt)}</span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#006937] animate-pulse" />
                              )}
                            </div>
                          </div>

                          <h4
                            className={`text-xs sm:text-sm font-semibold leading-snug truncate ${
                              !n.isRead ? "text-slate-900" : "text-slate-700"
                            }`}
                          >
                            {n.title}
                          </h4>

                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {n.message}
                          </p>

                          {/* Action Footer */}
                          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100">
                            {n.linkUrl ? (
                              <Link
                                href={n.linkUrl}
                                onClick={onClose}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006937] hover:text-[#004D28] transition-colors"
                              >
                                View Details
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </Link>
                            ) : (
                              <span />
                            )}

                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={() => onMarkAsRead(n.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px]">
              Connected to ServiceOS Realtime Mesh
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              Done
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default NotificationDrawer;
