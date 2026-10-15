"use client";

import React, { useState } from "react";
import { Job, Technician } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button, Input } from "@/components/ui";
import {
  X,
  Clock,
  User,
  MapPin,
  Calendar,
  Send,
  Zap,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight,
} from "lucide-react";

interface UnassignedQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unassignedJobs: Job[];
  technicians: Technician[];
  onDispatchJob: (
    jobId: string,
    technicianId: string,
    scheduledAt: string,
    estimatedDuration: number
  ) => Promise<void>;
  onSelectJobForDetail: (job: Job) => void;
  isLoading?: boolean;
}

export function UnassignedQueueDrawer({
  isOpen,
  onClose,
  unassignedJobs,
  technicians,
  onDispatchJob,
  onSelectJobForDetail,
  isLoading = false,
}: UnassignedQueueDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dispatchingJobId, setDispatchingJobId] = useState<string | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>("");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(
    new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredJobs = unassignedJobs.filter((job) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      (job.customerRecord?.name && job.customerRecord.name.toLowerCase().includes(q)) ||
      (job.customerRecord?.address && job.customerRecord.address.toLowerCase().includes(q))
    );
  });

  const handleStartDispatch = (job: Job) => {
    setDispatchingJobId(job.id);
    setDurationMinutes(job.estimatedDuration || 60);
    setScheduledDateTime(
      job.scheduledAt
        ? new Date(job.scheduledAt).toISOString().slice(0, 16)
        : new Date(Date.now() + 3600000).toISOString().slice(0, 16)
    );
    if (technicians.length > 0 && !selectedTechId) {
      setSelectedTechId(technicians[0].id);
    }
    setDispatchError(null);
  };

  const handleConfirmDispatch = async (jobId: string) => {
    if (!selectedTechId) {
      setDispatchError("Please select an available technician.");
      return;
    }
    try {
      setSubmitting(true);
      setDispatchError(null);
      await onDispatchJob(jobId, selectedTechId, new Date(scheduledDateTime).toISOString(), durationMinutes);
      setDispatchingJobId(null);
    } catch (err: any) {
      console.error("Dispatch error:", err);
      setDispatchError(err?.response?.data?.message || err?.message || "Failed to dispatch job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200 z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006937] border border-emerald-200 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Unassigned Jobs Queue</h3>
              <p className="text-[11px] text-slate-500">
                {unassignedJobs.length} {unassignedJobs.length === 1 ? "job" : "jobs"} awaiting technician dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by customer, job title, or location..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006937]"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-xs text-slate-700">All Jobs Dispatched!</p>
              <p className="text-[11px]">There are no unassigned field service jobs in the queue.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isDispatchingThis = dispatchingJobId === job.id;

              return (
                <div
                  key={job.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDispatchingThis
                      ? "border-[#006937] bg-white ring-2 ring-emerald-100 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                      Unassigned
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {job.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <h4
                    onClick={() => onSelectJobForDetail(job)}
                    className="font-bold text-xs text-slate-900 mt-2 hover:text-[#006937] cursor-pointer"
                  >
                    {job.title}
                  </h4>

                  <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                    <p className="flex items-center gap-1.5 font-medium text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.customerRecord?.name || "Customer not set"}</span>
                    </p>
                    {job.customerRecord?.address && (
                      <p className="flex items-start gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{job.customerRecord.address}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Est. Duration: {job.estimatedDuration || 60} mins</span>
                    </p>
                  </div>

                  {/* Inline 1-Click Dispatch Panel */}
                  {isDispatchingThis ? (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                      {dispatchError && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                          <span>{dispatchError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Select Technician to Dispatch
                        </label>
                        <select
                          value={selectedTechId}
                          onChange={(e) => setSelectedTechId(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#006937]"
                        >
                          {technicians.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.firstName} {tech.lastName} ({tech.tradeSpecialty || "General Field Tech"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Scheduled Start
                          </label>
                          <input
                            type="datetime-local"
                            value={scheduledDateTime}
                            onChange={(e) => setScheduledDateTime(e.target.value)}
                            className="w-full px-2 py-1.5 rounded border border-slate-200 text-xs text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Duration (min)
                          </label>
                          <input
                            type="number"
                            min="15"
                            step="15"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(Number(e.target.value))}
                            className="w-full px-2 py-1.5 rounded border border-slate-200 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDispatchingJobId(null)}
                          className="flex-1 text-xs h-8"
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleConfirmDispatch(job.id)}
                          disabled={submitting}
                          className="flex-1 text-xs h-8 bg-[#006937] hover:bg-[#004D28] text-white font-bold gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>{submitting ? "Dispatching..." : "Confirm Dispatch"}</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => onSelectJobForDetail(job)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      <Button
                        size="sm"
                        onClick={() => handleStartDispatch(job)}
                        className="h-7 text-[11px] font-bold bg-[#006937] hover:bg-[#004D28] text-white px-3 gap-1 shadow-2xs"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>1-Click Dispatch</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
