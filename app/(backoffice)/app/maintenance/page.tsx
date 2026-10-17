"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  RotateCcw,
  Plus,
  Play,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  MaintenanceStats,
  MaintenanceTable,
  CreateScheduleModal,
  CompleteCycleModal,
} from "@/components/maintenance";
import { MaintenanceSchedule, MaintenanceMetrics } from "@/lib/types";

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completingSchedule, setCompletingSchedule] = useState<MaintenanceSchedule | null>(null);
  const [engineNotification, setEngineNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch all maintenance schedules
  const { data: schedules = [], isLoading } = useQuery<MaintenanceSchedule[]>({
    queryKey: ["maintenance-schedules"],
    queryFn: async () => {
      try {
        const res = await apiClient.get<MaintenanceSchedule[]>("/maintenance/schedules");
        return Array.isArray(res.data) ? res.data : [];
      } catch {
        return [];
      }
    },
    staleTime: 10000,
  });

  // Calculate Metrics
  const metrics: MaintenanceMetrics = useMemo(() => {
    const now = new Date().getTime();
    let totalActive = 0;
    let dueSoon = 0;
    let paused = 0;
    let activeJobs = 0;

    schedules.forEach((s) => {
      if (s.status === "ACTIVE") {
        totalActive++;
        const diffDays = Math.ceil((new Date(s.nextDueDate).getTime() - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) dueSoon++;
      } else if (s.status === "PAUSED") {
        paused++;
      }
      if (s.currentJobId) {
        activeJobs++;
      }
    });

    return {
      totalActiveContracts: totalActive,
      dueWithin30Days: dueSoon,
      pausedContracts: paused,
      activeDispatchedJobs: activeJobs,
    };
  }, [schedules]);

  // Manual Trigger for Automated Job Generation Engine
  const generateJobsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post("/maintenance/generate-due-jobs");
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setEngineNotification({
        type: "success",
        message:
          data?.processed > 0
            ? `Engine processed successfully! Generated ${data.processed} maintenance work order(s) for upcoming due schedules.`
            : "Engine checked all schedules. No new jobs required generation at this time.",
      });
      setTimeout(() => setEngineNotification(null), 6000);
    },
    onError: (err: any) => {
      setEngineNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to trigger automated job generation.",
      });
      setTimeout(() => setEngineNotification(null), 6000);
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Page Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recurring Maintenance & SLA Contracts
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#006937] border border-emerald-200">
                Phase 3 Field Operations
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Automate preventative service cycles, warranty upkeep, and recurring field job dispatch without manual oversight.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Auto-Dispatch Manual Trigger */}
            <button
              type="button"
              onClick={() => generateJobsMutation.mutate()}
              disabled={generateJobsMutation.isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-2xs disabled:opacity-50"
              title="Run automated job generation engine immediately"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#006937]" />
              <span>
                {generateJobsMutation.isPending ? "Scanning Schedules..." : "Run Auto-Dispatch"}
              </span>
            </button>

            {/* Create Schedule Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#006937] hover:bg-[#004D28] transition-all shadow-xs hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>New Contract</span>
            </button>
          </div>
        </div>
        {/* Banner Alert for Engine Trigger */}
        {engineNotification && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs animate-fadeIn ${
              engineNotification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {engineNotification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{engineNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setEngineNotification(null)}
              className="text-xs font-semibold opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Metric Cards */}
        <MaintenanceStats metrics={metrics} />

        {/* Maintenance Contracts Table */}
        <MaintenanceTable
          schedules={schedules}
          isLoading={isLoading}
          onOpenCreate={() => setIsCreateOpen(true)}
          onOpenCompleteModal={(schedule) => setCompletingSchedule(schedule)}
        />
      </main>

      {/* Modal: Create Contract */}
      <CreateScheduleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Modal: Complete Cycle Confirmation */}
      <CompleteCycleModal
        schedule={completingSchedule}
        isOpen={!!completingSchedule}
        onClose={() => setCompletingSchedule(null)}
      />
    </div>
  );
}
