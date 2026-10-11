"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  status?: string;
  size?: "sm" | "md";
}

export function Badge({ className, variant, status, size = "md", children, ...props }: BadgeProps) {
  // Infer variant automatically from common domain status strings if not explicitly provided
  let effectiveVariant = variant || "default";

  if (!variant && status) {
    const s = status.toUpperCase();
    if (["ACTIVE", "PAID", "COMPLETED", "APPROVED", "ACCEPTED", "RESOLVED"].includes(s)) {
      effectiveVariant = "success";
    } else if (["PENDING", "DRAFT", "IN_PROGRESS", "EN_ROUTE", "ARRIVED", "PROCESSING"].includes(s)) {
      effectiveVariant = "warning";
    } else if (["OVERDUE", "DISPUTED", "REJECTED", "CANCELLED", "URGENT", "EXPIRED", "LOCKED"].includes(s)) {
      effectiveVariant = "danger";
    } else if (["SENT", "INVITATION_PENDING", "SCHEDULED"].includes(s)) {
      effectiveVariant = "info";
    } else {
      effectiveVariant = "neutral";
    }
  }

  const variantStyles = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-0.75 font-semibold",
  };

  const displayContent = children || status?.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border tracking-wide uppercase font-medium select-none",
        variantStyles[effectiveVariant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          effectiveVariant === "success" && "bg-emerald-500",
          effectiveVariant === "warning" && "bg-amber-500",
          effectiveVariant === "danger" && "bg-rose-500",
          effectiveVariant === "info" && "bg-blue-500",
          effectiveVariant === "neutral" && "bg-gray-400",
          effectiveVariant === "default" && "bg-slate-500"
        )}
      />
      {displayContent}
    </span>
  );
}

export default Badge;
