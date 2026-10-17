"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import Header from "@/components/layout/header";
import { ExpenseReceipt, ExpenseMetrics } from "@/lib/types";
import { Button, Badge } from "@/components/ui";
import {
  ExpenseStats,
  ExpenseTable,
  ExpenseReviewModal,
  SubmitExpenseModal,
} from "@/components/expenses";
import {
  Receipt,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedExpense, setSelectedExpense] = useState<ExpenseReceipt | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // 1. Fetch Expenses List
  const {
    data: expenses = [],
    isLoading: loadingExpenses,
    refetch: refetchExpenses,
    isFetching: fetchingExpenses,
  } = useQuery<ExpenseReceipt[]>({
    queryKey: ["expenses", selectedStatus],
    queryFn: async () => {
      try {
        const queryParam = selectedStatus !== "ALL" ? `?status=${selectedStatus}` : "";
        const res = await apiClient.get(`/expenses${queryParam}`);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.warn("Expenses fetch notice:", err);
        return [];
      }
    },
    staleTime: 1000 * 30,
  });

  // 2. Fetch Expense Metrics
  const {
    data: metrics = null,
    isLoading: loadingMetrics,
    refetch: refetchMetrics,
  } = useQuery<ExpenseMetrics>({
    queryKey: ["expense-metrics"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/expenses/metrics");
        return res.data;
      } catch (err) {
        console.warn("Expense metrics notice:", err);
        return {
          totalCount: 0,
          pendingCount: 0,
          pendingAmount: 0,
          approvedCount: 0,
          approvedAmount: 0,
          rejectedCount: 0,
          rejectedAmount: 0,
        };
      }
    },
    staleTime: 1000 * 30,
  });

  const handleRefresh = async () => {
    await Promise.all([refetchExpenses(), refetchMetrics()]);
    setActionNotice("Expense data refreshed with live database records.");
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleExpenseReviewed = () => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["expense-metrics"] });
    setActionNotice("Expense audit completed successfully!");
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleExpenseSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["expense-metrics"] });
    setActionNotice("New field expense submitted and routed to manager approval queue!");
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header & Actions (Matching Image 1) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Field Expenses & Receipt Audit
              </h1>
              <Badge variant="success" className="text-xs bg-emerald-50 text-[#006937] border-emerald-200">
                Phase 3 Field Operations
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Verify technician off-site part purchases with physical receipt evidence, OCR cross-match, and reimbursement controls.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={fetchingExpenses}
              className="bg-white hover:bg-slate-50 border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs gap-1.5 h-9 px-3.5 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${fetchingExpenses ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-[#006937] hover:bg-[#004D28] text-white text-xs font-semibold shadow-xs gap-2 h-9 px-4 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Field Expense</span>
            </Button>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Stat Summary Cards */}
        <ExpenseStats metrics={metrics} isLoading={loadingMetrics} />

        {/* 2. Interactive Data Table */}
        <ExpenseTable
          expenses={expenses}
          isLoading={loadingExpenses}
          onSelectExpense={(exp) => setSelectedExpense(exp)}
          selectedStatus={selectedStatus}
          onStatusChange={(status) => setSelectedStatus(status)}
        />
      </main>

      {/* 3. Side-by-side Document & OCR Review Modal */}
      <ExpenseReviewModal
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        onReviewed={handleExpenseReviewed}
      />

      {/* 4. Submit Expense Claim Modal (Over-the-Desk) */}
      <SubmitExpenseModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitted={handleExpenseSubmitted}
      />
    </div>
  );
}
