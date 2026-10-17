"use client";

import React from "react";
import { MaintenanceMetrics } from "@/lib/types";
import { RotateCcw, AlertTriangle, Wrench, PauseCircle } from "lucide-react";

interface MaintenanceStatsProps {
  metrics: MaintenanceMetrics;
}

export function MaintenanceStats({ metrics }: MaintenanceStatsProps) {
  const stats = [
    {
      label: "Active SLA Contracts",
      value: metrics.totalActiveContracts,
      icon: <RotateCcw className="w-5 h-5 text-emerald-600" />,
      accent: "border-emerald-200 bg-emerald-50/50",
      iconBg: "bg-emerald-100/70",
      description: "Preventative upkeep schedules running",
    },
    {
      label: "Due in Next 30 Days",
      value: metrics.dueWithin30Days,
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      accent: "border-amber-200 bg-amber-50/50",
      iconBg: "bg-amber-100/70",
      description: "Requires upcoming technician dispatch",
    },
    {
      label: "Auto-Dispatched Jobs",
      value: metrics.activeDispatchedJobs,
      icon: <Wrench className="w-5 h-5 text-indigo-600" />,
      accent: "border-indigo-200 bg-indigo-50/50",
      iconBg: "bg-indigo-100/70",
      description: "Active work orders generated this cycle",
    },
    {
      label: "Paused / On-Hold",
      value: metrics.pausedContracts,
      icon: <PauseCircle className="w-5 h-5 text-slate-600" />,
      accent: "border-slate-200 bg-slate-50/50",
      iconBg: "bg-slate-200/70",
      description: "Temporarily suspended by customer/admin",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md ${stat.accent}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {stat.label}
            </span>
            <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
              {stat.icon}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stat.value}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 truncate">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
}

export default MaintenanceStats;
