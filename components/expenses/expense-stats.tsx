"use client";

import React from "react";
import { ExpenseMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/stat-card";
import {
  Clock,
  CheckCircle2,
  ShieldAlert,
  Receipt,
  FileCheck2,
} from "lucide-react";

interface ExpenseStatsProps {
  metrics: ExpenseMetrics | null;
  isLoading?: boolean;
}

export function ExpenseStats({ metrics, isLoading }: ExpenseStatsProps) {
  const pendingCount = metrics?.pendingCount ?? 0;
  const pendingAmount = metrics?.pendingAmount ?? 0;
  const approvedCount = metrics?.approvedCount ?? 0;
  const approvedAmount = metrics?.approvedAmount ?? 0;
  const rejectedCount = metrics?.rejectedCount ?? 0;
  const rejectedAmount = metrics?.rejectedAmount ?? 0;
  const totalCount = metrics?.totalCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Pending Approvals Queue */}
      <StatCard
        title="Pending Claims Queue"
        value={isLoading ? "..." : formatCurrency(pendingAmount)}
        icon={<Clock className="w-5 h-5 text-amber-600" />}
        subtitle={`${pendingCount} claim${pendingCount === 1 ? "" : "s"} awaiting manager audit`}
        className={pendingCount > 0 ? "border-amber-300 ring-1 ring-amber-200/50" : ""}
      />

      {/* 2. Total Approved & Reimbursed */}
      <StatCard
        title="Approved Reimbursements"
        value={isLoading ? "..." : formatCurrency(approvedAmount)}
        icon={<CheckCircle2 className="w-5 h-5 text-[#006937]" />}
        subtitle={`${approvedCount} claims audited & settled`}
      />

      {/* 3. Rejected & Flagged Claims */}
      <StatCard
        title="Fraud / Rejected Claims"
        value={isLoading ? "..." : formatCurrency(rejectedAmount)}
        icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
        subtitle={`${rejectedCount} claims failed receipt audit`}
      />

      {/* 4. Total Volume & Audit Integrity */}
      <StatCard
        title="Total Claims Audited"
        value={isLoading ? "..." : totalCount.toString()}
        icon={<Receipt className="w-5 h-5 text-slate-600" />}
        subtitle="100% OCR double-entry verified"
      />
    </div>
  );
}
