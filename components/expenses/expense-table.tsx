"use client";

import React, { useState, useMemo } from "react";
import { ExpenseReceipt } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Briefcase,
  User,
  ExternalLink,
} from "lucide-react";

interface ExpenseTableProps {
  expenses: ExpenseReceipt[];
  isLoading: boolean;
  onSelectExpense: (expense: ExpenseReceipt) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export function ExpenseTable({
  expenses,
  isLoading,
  onSelectExpense,
  selectedStatus,
  onStatusChange,
}: ExpenseTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Status Filter
      if (selectedStatus !== "ALL" && exp.status !== selectedStatus) {
        return false;
      }

      // 2. Category Filter
      if (selectedCategory !== "ALL" && exp.category !== selectedCategory) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const techName = `${exp.technician?.firstName || ""} ${exp.technician?.lastName || ""}`.toLowerCase();
        const jobTitle = (exp.job?.title || "").toLowerCase();
        const vendor = (exp.vendor || "").toLowerCase();
        const customerName = (exp.job?.customerRecord?.name || "").toLowerCase();
        const notes = (exp.notes || "").toLowerCase();

        return (
          techName.includes(query) ||
          jobTitle.includes(query) ||
          vendor.includes(query) ||
          customerName.includes(query) ||
          notes.includes(query) ||
          exp.id.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [expenses, selectedStatus, selectedCategory, searchQuery]);

  const pendingCount = expenses.filter((e) => e.status === "PENDING_APPROVAL").length;
  const approvedCount = expenses.filter((e) => e.status === "APPROVED").length;
  const rejectedCount = expenses.filter((e) => e.status === "REJECTED").length;

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "MATERIALS_PARTS":
        return "bg-emerald-50 text-[#006937] border-emerald-200";
      case "TOOLS_HARDWARE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "TRANSPORT_FUEL":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "EMERGENCY_PERMIT":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls & Filter Bar (Matching Image 1) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search technician, vendor, customer, or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => onStatusChange("ALL")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedStatus === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({expenses.length})
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("PENDING_APPROVAL")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                selectedStatus === "PENDING_APPROVAL"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              <Clock className="w-3 h-3" />
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("APPROVED")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                selectedStatus === "APPROVED"
                  ? "bg-[#006937] text-white shadow-xs"
                  : "text-[#006937] hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("REJECTED")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                selectedStatus === "REJECTED"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              <XCircle className="w-3 h-3" />
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006937]"
            >
              <option value="ALL">All Categories</option>
              <option value="MATERIALS_PARTS">Materials & Extra Cabling</option>
              <option value="TOOLS_HARDWARE">Emergency Tools & Breakers</option>
              <option value="TRANSPORT_FUEL">Fuel & Site Transit</option>
              <option value="EMERGENCY_PERMIT">Local Permits & Fees</option>
              <option value="OTHER">Other Operational Expense</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card (Matching Image 1) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-16">Receipt</th>
                <th className="py-3 px-4">Field Technician</th>
                <th className="py-3 px-4">Work Order & Client</th>
                <th className="py-3 px-4">Category & Supplier</th>
                <th className="py-3 px-4 text-right">Claim Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-200" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 rounded bg-slate-200 mb-1" />
                      <div className="h-3 w-20 rounded bg-slate-100" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-32 rounded bg-slate-200 mb-1" />
                      <div className="h-3 w-24 rounded bg-slate-100" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-24 rounded bg-slate-200" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-5 w-16 ml-auto rounded bg-slate-200" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-20 mx-auto rounded bg-slate-200" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-8 w-24 mx-auto rounded-lg bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Receipt className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-slate-800">
                        No expense claims match this filter
                      </p>
                      <p className="text-xs text-slate-400">
                        Try adjusting search query or log a new technician claim above.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => {
                  const amt = Number(expense.amount) || 0;
                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* 1. Thumbnail Preview */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onSelectExpense(expense)}
                          className="relative group flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shadow-2xs hover:border-[#006937] transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={expense.receiptPhotoUrl}
                            alt="Receipt thumbnail"
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              (e.target as HTMLElement).setAttribute(
                                "src",
                                "https://images.unsplash.com/photo-1554415707-9e49fe83083f?auto=format&fit=crop&w=400&q=80"
                              );
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </button>
                      </td>

                      {/* 2. Field Technician */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {expense.technician
                            ? `${expense.technician.firstName} ${expense.technician.lastName}`
                            : "Field Tech"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {expense.technician?.phone || expense.technician?.email || "Field Service"}
                        </div>
                      </td>

                      {/* 3. Work Order & Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {expense.job?.title || "Field Job Assignment"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 pl-4.5">
                          Client: <span className="text-slate-600 font-medium">{expense.job?.customerRecord?.name || "Asset Owner"}</span>
                        </div>
                      </td>

                      {/* 4. Category & Vendor */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getCategoryBadge(
                              expense.category
                            )}`}
                          >
                            {expense.category ? expense.category.replace("_", " ") : "MATERIALS"}
                          </span>
                          <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                            {expense.vendor || "Hardware Store"}
                          </div>
                        </div>
                      </td>

                      {/* 5. Claim Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatCurrency(amt)}
                        </div>
                        {expense.billToClient && (
                          <span className="text-[10px] font-semibold text-[#006937] bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            Bill to client
                          </span>
                        )}
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${
                            expense.status === "APPROVED"
                              ? "bg-emerald-50 text-[#006937] border-emerald-200"
                              : expense.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {expense.status === "APPROVED" && <CheckCircle2 className="w-3 h-3 text-[#006937]" />}
                          {expense.status === "REJECTED" && <XCircle className="w-3 h-3 text-rose-600" />}
                          {expense.status === "PENDING_APPROVAL" && <Clock className="w-3 h-3 text-amber-600" />}
                          {expense.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* 7. Action Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectExpense(expense)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                            expense.status === "PENDING_APPROVAL"
                              ? "bg-[#006937] hover:bg-[#004D28] text-white shadow-xs"
                              : "border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white"
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {expense.status === "PENDING_APPROVAL" ? "Audit Receipt" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
