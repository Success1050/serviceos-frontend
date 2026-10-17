"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  Search,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  ArrowUpRight,
  Filter,
  MoreVertical,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import { MaintenanceSchedule, MaintenanceScheduleStatus } from "@/lib/types";

interface MaintenanceTableProps {
  schedules: MaintenanceSchedule[];
  isLoading: boolean;
  onOpenCreate: () => void;
  onOpenCompleteModal: (schedule: MaintenanceSchedule) => void;
}

export function MaintenanceTable({
  schedules,
  isLoading,
  onOpenCreate,
  onOpenCompleteModal,
}: MaintenanceTableProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Status toggle mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MaintenanceScheduleStatus }) => {
      const res = await apiClient.patch(`/maintenance/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
    },
  });

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerRecord?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customerRecord?.phone?.includes(searchTerm) ||
        s.asset?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "DUE_SOON") {
        const diffDays = Math.ceil(
          (new Date(s.nextDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return s.status === "ACTIVE" && diffDays <= 30;
      }
      return s.status === statusFilter;
    });
  }, [schedules, searchTerm, statusFilter]);

  const getFrequencyBadge = (intervalMonths: number) => {
    switch (intervalMonths) {
      case 1:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">Monthly</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Quarterly</span>;
      case 6:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Bi-Annual</span>;
      case 12:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Annual</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200">{intervalMonths}m Cycle</span>;
    }
  };

  const formatDueDate = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let countdownBadge = null;
    if (diffDays < 0) {
      countdownBadge = (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
          Overdue by {Math.abs(diffDays)}d
        </span>
      );
    } else if (diffDays === 0) {
      countdownBadge = (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
          Due Today
        </span>
      );
    } else if (diffDays <= 7) {
      countdownBadge = (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
          In {diffDays} days
        </span>
      );
    } else if (diffDays <= 30) {
      countdownBadge = (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700">
          In {diffDays} days
        </span>
      );
    }

    return (
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {due.toLocaleDateString("en-NG", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        {countdownBadge && <div className="mt-1">{countdownBadge}</div>}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contracts, customers, hardware..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "All" },
            { id: "ACTIVE", label: "Active" },
            { id: "DUE_SOON", label: "Due Soon (≤30d)" },
            { id: "PAUSED", label: "Paused" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-[#006937] text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 sm:px-6">Contract & Cadence</th>
              <th className="py-3 px-4">Client / Property</th>
              <th className="py-3 px-4">Target Hardware</th>
              <th className="py-3 px-4">Next Due Date</th>
              <th className="py-3 px-4">Auto-Dispatch</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-4 px-6">
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : filteredSchedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-6 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <RotateCcw className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    No maintenance contracts found
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    {searchTerm || statusFilter !== "ALL"
                      ? "No contracts match your search and filter criteria."
                      : "Establish preventative maintenance contracts to automate recurring technician dispatches."}
                  </p>
                  <button
                    type="button"
                    onClick={onOpenCreate}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#006937] hover:bg-[#00512a] transition-all"
                  >
                    + Create First Maintenance Contract
                  </button>
                </td>
              </tr>
            ) : (
              filteredSchedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Contract Title & Cadence */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-bold text-slate-900 group-hover:text-[#006937] transition-colors">
                      {schedule.title}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      {getFrequencyBadge(schedule.intervalMonths)}
                    </div>
                  </td>

                  {/* Client / Property */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900">
                      {schedule.customerRecord?.name || "Client Property"}
                    </div>
                    {schedule.customerRecord?.address && (
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {schedule.customerRecord.address}
                      </div>
                    )}
                    {schedule.customerRecord?.phone && (
                      <div className="text-[11px] text-slate-400">
                        {schedule.customerRecord.phone}
                      </div>
                    )}
                  </td>

                  {/* Target Hardware */}
                  <td className="py-4 px-4">
                    {schedule.asset ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                        <Wrench className="w-3 h-3 text-slate-500" />
                        <span>{schedule.asset.name}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Whole Site / All Systems
                      </span>
                    )}
                  </td>

                  {/* Next Due Date */}
                  <td className="py-4 px-4">
                    {formatDueDate(schedule.nextDueDate)}
                  </td>

                  {/* Auto-Dispatch Job */}
                  <td className="py-4 px-4">
                    {schedule.currentJobId ? (
                      <Link
                        href="/app/dispatch"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold hover:bg-indigo-100 transition-colors"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Job Active</span>
                        <ArrowUpRight className="w-3 h-3 ml-0.5" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending cycle
                      </span>
                    )}
                  </td>

                  {/* Status Pill */}
                  <td className="py-4 px-4">
                    {schedule.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : schedule.status === "PAUSED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Paused
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Cancelled
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Complete Cycle Button */}
                      <button
                        type="button"
                        onClick={() => onOpenCompleteModal(schedule)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#006937] hover:bg-emerald-50 border border-emerald-200/80 transition-colors inline-flex items-center gap-1 shadow-xs"
                        title="Complete service cycle & calculate next due date"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Complete Cycle</span>
                      </button>

                      {/* Pause / Resume Toggle */}
                      {schedule.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={() =>
                            statusMutation.mutate({ id: schedule.id, status: "PAUSED" })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Pause Contract"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : schedule.status === "PAUSED" ? (
                        <button
                          type="button"
                          onClick={() =>
                            statusMutation.mutate({ id: schedule.id, status: "ACTIVE" })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Resume Contract"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
        <span>Showing {filteredSchedules.length} contracts</span>
        <span className="text-[11px] text-slate-400">
          Automated engine scans every night at 00:00 UTC
        </span>
      </div>
    </div>
  );
}

export default MaintenanceTable;
