"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  X,
  CheckCircle2,
  Calendar,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { MaintenanceSchedule } from "@/lib/types";

interface CompleteCycleModalProps {
  schedule: MaintenanceSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CompleteCycleModal({
  schedule,
  isOpen,
  onClose,
  onSuccess,
}: CompleteCycleModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const currentDue = schedule ? new Date(schedule.nextDueDate) : new Date();
  const nextDue = new Date(currentDue);
  if (schedule) {
    nextDue.setMonth(nextDue.getMonth() + schedule.intervalMonths);
  }

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!schedule) return;
      const res = await apiClient.patch(`/maintenance/${schedule.id}/complete-cycle`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to complete maintenance cycle.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Complete Maintenance Cycle
                </h3>
                <p className="text-xs text-slate-500">
                  Record servicing completion & advance next due date
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Contract Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Contract
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                {schedule.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Customer: <strong>{schedule.customerRecord?.name || "Client Site"}</strong>
                {schedule.asset && ` • Hardware: ${schedule.asset.name}`}
              </p>
            </div>

            {/* Cycle Advance Progression */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-2">
                Mathematical Cycle Advance ({schedule.intervalMonths} Months)
              </span>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 p-2.5 rounded-lg bg-white border border-emerald-100 text-center">
                  <span className="text-[10px] font-medium text-slate-400 block">Current Cycle</span>
                  <span className="text-xs font-bold text-slate-800">
                    {currentDue.toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />

                <div className="flex-1 p-2.5 rounded-lg bg-emerald-600 text-white text-center shadow-xs">
                  <span className="text-[10px] font-medium text-emerald-100 block">Next Servicing Due</span>
                  <span className="text-xs font-bold text-white">
                    {nextDue.toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {schedule.currentJobId && (
              <p className="text-xs text-slate-500">
                Linked Work Order: <span className="font-mono text-slate-700 font-medium">#{schedule.currentJobId.slice(0, 8)}</span> will be archived from this cycle.
              </p>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#006937] hover:bg-[#00512a] transition-all shadow-sm hover:shadow disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {completeMutation.isPending ? "Advancing Cycle..." : "Complete Cycle & Advance"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompleteCycleModal;
