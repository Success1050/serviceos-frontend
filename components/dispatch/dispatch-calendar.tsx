"use client";

import React, { useState, useMemo } from "react";
import { Job, Technician, JobStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  Zap,
  Eye,
  Layers,
  SlidersHorizontal,
  CheckCircle2,
  CalendarDays,
  Columns,
  ListFilter,
  Grid,
} from "lucide-react";

export type CalendarViewMode = "SWIMLANES" | "WEEK" | "MONTH" | "LIST";

interface DispatchCalendarProps {
  jobs: Job[];
  technicians: Technician[];
  selectedDate: Date;
  onDateChange: (newDate: Date) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onSelectJob: (job: Job) => void;
  onSlotClick?: (technicianId: string, dateTime: string) => void;
  onAddNewJob?: () => void;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function DispatchCalendar({
  jobs,
  technicians,
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  onSelectJob,
  onSlotClick,
  onAddNewJob,
}: DispatchCalendarProps) {
  // Navigation
  const handlePrev = () => {
    const next = new Date(selectedDate);
    if (viewMode === "MONTH") {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === "WEEK") {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    onDateChange(next);
  };

  const handleNext = () => {
    const next = new Date(selectedDate);
    if (viewMode === "MONTH") {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === "WEEK") {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    onDateChange(next);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Filter jobs for selected date (Swimlanes / Day view)
  const jobsForSelectedDate = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth();
    const d = selectedDate.getDate();

    return jobs.filter((job) => {
      if (!job.scheduledAt) return false;
      const jobDate = new Date(job.scheduledAt);
      return (
        jobDate.getFullYear() === y &&
        jobDate.getMonth() === m &&
        jobDate.getDate() === d
      );
    });
  }, [jobs, selectedDate]);

  // Status badge utility
  const getJobColorClass = (status: JobStatus) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-300";
      case "EN_ROUTE":
        return "bg-amber-50 border-amber-300 text-amber-900 ring-1 ring-amber-200 hover:border-amber-400";
      case "IN_PROGRESS":
        return "bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-200 hover:border-emerald-400";
      case "COMPLETED":
        return "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/60";
      case "CANCELLED":
        return "bg-rose-50 border-rose-200 text-rose-800 line-through opacity-70";
      default:
        return "bg-slate-50 border-slate-200 text-slate-800";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <div className="p-4 border-b border-slate-200/80 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleToday}
            className="h-8 text-xs font-semibold px-3 bg-white hover:bg-slate-50"
          >
            Today
          </Button>

          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              onClick={handlePrev}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 ml-1">
            {viewMode === "MONTH"
              ? selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : viewMode === "WEEK"
                ? `Week of ${formatDate(selectedDate, "short")}`
                : selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
          </h2>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => onViewModeChange("SWIMLANES")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "SWIMLANES"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Columns className="w-3.5 h-3.5 text-[#006937]" />
              <span>Swimlanes</span>
            </button>

            <button
              onClick={() => onViewModeChange("WEEK")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "WEEK"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>Week</span>
            </button>

            <button
              onClick={() => onViewModeChange("MONTH")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "MONTH"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-amber-600" />
              <span>Month</span>
            </button>

            <button
              onClick={() => onViewModeChange("LIST")}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "LIST"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-purple-600" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Board Renderers */}
      {viewMode === "SWIMLANES" && (
        <SwimlanesView
          jobs={jobsForSelectedDate}
          technicians={technicians}
          selectedDate={selectedDate}
          onSelectJob={onSelectJob}
          onSlotClick={onSlotClick}
          getJobColorClass={getJobColorClass}
        />
      )}

      {viewMode === "WEEK" && (
        <WeekGridView
          jobs={jobs}
          technicians={technicians}
          selectedDate={selectedDate}
          onSelectJob={onSelectJob}
          getJobColorClass={getJobColorClass}
        />
      )}

      {viewMode === "MONTH" && (
        <MonthGridView
          jobs={jobs}
          selectedDate={selectedDate}
          onSelectJob={onSelectJob}
          onDayClick={(date) => {
            onDateChange(date);
            onViewModeChange("SWIMLANES");
          }}
          getJobColorClass={getJobColorClass}
        />
      )}

      {viewMode === "LIST" && (
        <ListView
          jobs={jobs}
          technicians={technicians}
          onSelectJob={onSelectJob}
          getJobColorClass={getJobColorClass}
        />
      )}
    </div>
  );
}

/* =========================================================================
   1. TECHNICIAN SWIMLANES VIEW (Day Timeline + Working Hours & Buffers)
========================================================================= */
function SwimlanesView({
  jobs,
  technicians,
  selectedDate,
  onSelectJob,
  onSlotClick,
  getJobColorClass,
}: {
  jobs: Job[];
  technicians: Technician[];
  selectedDate: Date;
  onSelectJob: (job: Job) => void;
  onSlotClick?: (technicianId: string, dateTime: string) => void;
  getJobColorClass: (status: JobStatus) => string;
}) {
  const startHour = 8;
  const endHour = 18;
  const totalMinutes = (endHour - startHour) * 60; // 600 minutes

  return (
    <div className="overflow-x-auto min-w-[900px] flex-1 select-none">
      {/* Time Header Row */}
      <div className="grid grid-cols-[240px_1fr] border-b border-slate-200/80 bg-slate-50 text-slate-500 text-[11px] font-bold sticky top-0 z-10">
        <div className="p-3 border-r border-slate-200/80 uppercase tracking-wider text-slate-600">
          Field Technicians ({technicians.length})
        </div>
        <div className="grid grid-cols-10 divide-x divide-slate-200/80">
          {HOURS.slice(0, 10).map((h) => (
            <div key={h} className="py-2.5 px-2 text-center">
              {h}:00 {h < 12 ? "AM" : "PM"}
            </div>
          ))}
        </div>
      </div>

      {/* Technician Rows */}
      <div className="divide-y divide-slate-100">
        {technicians.map((tech) => {
          const techJobs = jobs.filter((j) => j.assignedTechnicianId === tech.id);

          // Detect overlaps within this technician's lane
          const doJobsOverlap = (a: Job, b: Job): boolean => {
            if (!a.scheduledAt || !b.scheduledAt) return false;
            const sA = new Date(a.scheduledAt).getTime();
            const eA = sA + (a.estimatedDuration || 60) * 60000;
            const sB = new Date(b.scheduledAt).getTime();
            const eB = sB + (b.estimatedDuration || 60) * 60000;
            return sA < eB && eA > sB;
          };

          const hasConflict = techJobs.some((j) =>
            techJobs.some((other) => other.id !== j.id && doJobsOverlap(j, other))
          );

          return (
            <div
              key={tech.id}
              className={`grid grid-cols-[240px_1fr] ${
                hasConflict ? "min-h-[128px]" : "min-h-[96px]"
              } hover:bg-slate-50/50 transition-colors group`}
            >
              {/* Left Column: Tech Info Card */}
              <div className="p-3 border-r border-slate-200/80 flex items-center gap-3 bg-white group-hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006937] to-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {tech.firstName[0]}
                  {tech.lastName[0]}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs text-slate-900 truncate">
                      {tech.firstName} {tech.lastName}
                    </p>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active on duty" />
                  </div>
                  <p className="text-[10px] text-emerald-800 font-semibold truncate">
                    {tech.tradeSpecialty || "Solar Engineer"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-[10px] text-slate-400">
                      {techJobs.length} {techJobs.length === 1 ? "job" : "jobs"} assigned
                    </p>
                    {hasConflict && (
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                        Overlap!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Time Grid Canvas with Relative Positioned Jobs */}
              <div className="relative h-full grid grid-cols-10 divide-x divide-slate-100 bg-white group-hover:bg-slate-50/30">
                {/* Clickable slot backgrounds */}
                {HOURS.slice(0, 10).map((h) => (
                  <div
                    key={h}
                    onClick={() => {
                      if (onSlotClick) {
                        const slotDate = new Date(selectedDate);
                        slotDate.setHours(h, 0, 0, 0);
                        onSlotClick(tech.id, slotDate.toISOString());
                      }
                    }}
                    className="h-full hover:bg-emerald-50/20 cursor-pointer transition-colors relative"
                    title={`Click to schedule job with ${tech.firstName} at ${h}:00`}
                  />
                ))}

                {/* Placed Job Cards with Smart Overlap Staggering & Conflict Highlighting */}
                {techJobs.map((job) => {
                  if (!job.scheduledAt) return null;
                  const jobStart = new Date(job.scheduledAt);
                  const startMins =
                    (jobStart.getHours() - startHour) * 60 + jobStart.getMinutes();
                  const duration = job.estimatedDuration || 60;

                  // Percentage calculations
                  const leftPercent = Math.max(0, Math.min(100, (startMins / totalMinutes) * 100));
                  const widthPercent = Math.max(
                    8,
                    Math.min(100 - leftPercent, (duration / totalMinutes) * 100)
                  );

                  const overlappingGroup = techJobs
                    .filter((other) => doJobsOverlap(job, other))
                    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

                  const isConflict = overlappingGroup.length > 1;
                  const conflictRank = overlappingGroup.findIndex((j) => j.id === job.id);

                  // Staggered vertical geometry when conflicting:
                  const positionStyles: React.CSSProperties = isConflict
                    ? {
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        top: `${6 + conflictRank * 58}px`,
                        height: "54px",
                        zIndex: 10 + conflictRank,
                      }
                    : {
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        top: "8px",
                        bottom: "8px",
                      };

                  return (
                    <div
                      key={job.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectJob(job);
                      }}
                      style={positionStyles}
                      className={`absolute p-2 rounded-xl border shadow-xs flex flex-col justify-between overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:z-30 hover:shadow-md ${
                        isConflict
                          ? "bg-rose-50/95 border-rose-300 ring-2 ring-rose-400/40 text-rose-950"
                          : getJobColorClass(job.status)
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[11px] truncate leading-tight">
                            {job.title}
                          </span>
                          {isConflict ? (
                            <span className="text-[8px] font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse shrink-0">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Conflict</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-white/80 px-1 rounded shrink-0">
                              {job.status}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${isConflict ? "text-rose-800 font-medium" : "text-slate-600"}`}>
                          {job.customerRecord?.name || "Client"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500 pt-1 border-t border-black/5 mt-0.5">
                        <span className={isConflict ? "text-rose-700 font-bold" : ""}>
                          {jobStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span>{duration}m</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   2. WEEK GRID VIEW (Mon - Sun 7 Day Columns)
========================================================================= */
function WeekGridView({
  jobs,
  technicians,
  selectedDate,
  onSelectJob,
  getJobColorClass,
}: {
  jobs: Job[];
  technicians: Technician[];
  selectedDate: Date;
  onSelectJob: (job: Job) => void;
  getJobColorClass: (status: JobStatus) => string;
}) {
  // Compute start of week (Monday)
  const weekDays = useMemo(() => {
    const current = new Date(selectedDate);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-7 divide-x divide-slate-200/80 min-h-[500px] overflow-x-auto min-w-[800px]">
      {weekDays.map((d) => {
        const isToday = d.toDateString() === new Date().toDateString();
        const dayJobs = jobs.filter((j) => {
          if (!j.scheduledAt) return false;
          return new Date(j.scheduledAt).toDateString() === d.toDateString();
        });

        return (
          <div key={d.toISOString()} className="flex flex-col bg-white">
            <div
              className={`p-3 text-center border-b border-slate-200/80 ${
                isToday ? "bg-emerald-50 text-[#006937] font-bold" : "bg-slate-50 text-slate-600"
              }`}
            >
              <span className="text-[11px] uppercase tracking-wider block">
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-base font-bold">{d.getDate()}</span>
            </div>

            <div className="flex-1 p-2 space-y-2 bg-slate-50/30 overflow-y-auto">
              {dayJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className={`p-2.5 rounded-xl border shadow-2xs cursor-pointer transition-all hover:scale-[1.02] ${getJobColorClass(
                    job.status
                  )}`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider block text-slate-500">
                    {job.scheduledAt ? new Date(job.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Unset"}
                  </span>
                  <p className="font-bold text-xs text-slate-900 leading-snug line-clamp-2 mt-0.5">
                    {job.title}
                  </p>
                  <p className="text-[10px] text-slate-600 truncate mt-1">
                    {job.customerRecord?.name || "Client"}
                  </p>
                  {job.assignedTechnician && (
                    <p className="text-[10px] text-emerald-800 font-semibold mt-0.5 truncate">
                      Tech: {job.assignedTechnician.firstName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================================
   3. MONTH GRID VIEW (Full Calendar Grid)
========================================================================= */
function MonthGridView({
  jobs,
  selectedDate,
  onSelectJob,
  onDayClick,
  getJobColorClass,
}: {
  jobs: Job[];
  selectedDate: Date;
  onSelectJob: (job: Job) => void;
  onDayClick: (date: Date) => void;
  getJobColorClass: (status: JobStatus) => string;
}) {
  const monthDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    // Leading days from prev month
    const startOffset = (firstDay.getDay() + 6) % 7;
    for (let i = startOffset; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    // Days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    // Trailing days
    while (days.length % 7 !== 0) {
      days.push(new Date(year, month + 1, days.length - lastDay.getDate() - startOffset + 1));
    }

    return days;
  }, [selectedDate]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50 text-slate-500 text-xs font-bold text-center py-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white">
        {monthDays.map((d, index) => {
          const isCurrentMonth = d.getMonth() === selectedDate.getMonth();
          const isToday = d.toDateString() === new Date().toDateString();
          const dayJobs = jobs.filter((j) => {
            if (!j.scheduledAt) return false;
            return new Date(j.scheduledAt).toDateString() === d.toDateString();
          });

          return (
            <div
              key={index}
              onClick={() => onDayClick(d)}
              className={`min-h-[105px] p-2 flex flex-col justify-between cursor-pointer transition-colors hover:bg-slate-50/80 ${
                !isCurrentMonth ? "bg-slate-50/40 text-slate-300" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday ? "bg-[#006937] text-white" : "text-slate-700"
                  }`}
                >
                  {d.getDate()}
                </span>
                {dayJobs.length > 0 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 rounded-full">
                    {dayJobs.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 mt-1 overflow-hidden">
                {dayJobs.slice(0, 2).map((job) => (
                  <div
                    key={job.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectJob(job);
                    }}
                    className="p-1 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 truncate hover:scale-[1.01]"
                  >
                    {job.title}
                  </div>
                ))}
                {dayJobs.length > 2 && (
                  <span className="text-[9px] text-slate-400 font-bold block">
                    +{dayJobs.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   4. LIST VIEW (Tabular Work Order Inspector)
========================================================================= */
function ListView({
  jobs,
  technicians,
  onSelectJob,
  getJobColorClass,
}: {
  jobs: Job[];
  technicians: Technician[];
  onSelectJob: (job: Job) => void;
  getJobColorClass: (status: JobStatus) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-800">
        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
          <tr>
            <th className="py-3 px-4">Job Scope & ID</th>
            <th className="py-3 px-4">Customer & Site Premises</th>
            <th className="py-3 px-4">Assigned Field Technician</th>
            <th className="py-3 px-4">Scheduled Window</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <tr
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="hover:bg-slate-50/80 cursor-pointer transition-colors"
            >
              <td className="py-3.5 px-4 font-medium">
                <span className="font-bold text-slate-900 block">{job.title}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  JOB-{job.id.slice(0, 8).toUpperCase()}
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span className="font-semibold text-slate-800 block">
                  {job.customerRecord?.name || "Client"}
                </span>
                <span className="text-[11px] text-slate-500">
                  {job.customerRecord?.address || "Address not specified"}
                </span>
              </td>
              <td className="py-3.5 px-4">
                {job.assignedTechnician ? (
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {job.assignedTechnician.firstName} {job.assignedTechnician.lastName}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      {job.assignedTechnician.tradeSpecialty || "Specialist"}
                    </span>
                  </div>
                ) : (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    Unassigned Queue
                  </span>
                )}
              </td>
              <td className="py-3.5 px-4">
                <span className="font-semibold text-slate-800 block">
                  {job.scheduledAt ? formatDate(job.scheduledAt, "short") : "Unscheduled"}
                </span>
                <span className="text-[10px] text-slate-500">
                  {job.estimatedDuration || 60} mins duration
                </span>
              </td>
              <td className="py-3.5 px-4">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getJobColorClass(
                    job.status
                  )}`}
                >
                  {job.status}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectJob(job);
                  }}
                  className="h-7 text-[11px] px-2.5 gap-1 font-semibold"
                >
                  <Eye className="w-3 h-3 text-slate-500" />
                  <span>Inspect</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
