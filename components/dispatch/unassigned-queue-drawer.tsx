"use client";

import React, { useState } from "react";
import { Job, Technician } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  X,
  Clock,
  User,
  MapPin,
  Calendar,
  Send,
  Zap,
  Search,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  BellRing,
  Sun,
} from "lucide-react";

export interface ServiceRequestItem {
  id: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  urgency: "LOW" | "NORMAL" | "URGENT" | "EMERGENCY";
  preferredDate?: string;
  preferredTimeSlot?: string;
  customerRecordId: string;
  createdAt: string;
  updatedAt: string;
  customerRecord?: {
    id?: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  asset?: {
    id: string;
    name: string;
    serialNumber?: string;
  } | null;
  job?: {
    id: string;
    title: string;
    status: string;
    scheduledAt?: string;
  } | null;
}

interface UnassignedQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unassignedJobs: Job[];
  serviceRequests?: ServiceRequestItem[];
  technicians: Technician[];
  onDispatchJob: (
    jobId: string,
    technicianId: string,
    scheduledAt: string,
    estimatedDuration: number
  ) => Promise<void>;
  onDispatchServiceRequest?: (
    request: ServiceRequestItem,
    technicianId: string,
    scheduledAt: string,
    estimatedDuration: number
  ) => Promise<void>;
  onSelectJobForDetail: (job: Job) => void;
  isLoading?: boolean;
}

const getLocalDatetimeString = (dateInput?: string | Date) => {
  const d = dateInput ? new Date(dateInput) : new Date(Date.now() + 3600000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
};

export function UnassignedQueueDrawer({
  isOpen,
  onClose,
  unassignedJobs,
  serviceRequests = [],
  technicians,
  onDispatchJob,
  onDispatchServiceRequest,
  onSelectJobForDetail,
  isLoading = false,
}: UnassignedQueueDrawerProps) {
  const openRequests = serviceRequests.filter((r) => r.status === "OPEN");

  const [activeTab, setActiveTab] = useState<"requests" | "jobs">(
    openRequests.length > 0 ? "requests" : "jobs"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [dispatchingJobId, setDispatchingJobId] = useState<string | null>(null);
  const [dispatchingRequestId, setDispatchingRequestId] = useState<string | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>("");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>(
    getLocalDatetimeString()
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

  const filteredRequests = openRequests.filter((req) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      req.description.toLowerCase().includes(q) ||
      (req.customerRecord?.name && req.customerRecord.name.toLowerCase().includes(q)) ||
      (req.customerRecord?.phone && req.customerRecord.phone.includes(q))
    );
  });

  const handleStartDispatchJob = (job: Job) => {
    setDispatchingJobId(job.id);
    setDispatchingRequestId(null);
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

  const handleConfirmDispatchJob = async (jobId: string) => {
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

  const handleStartDispatchServiceRequest = (req: ServiceRequestItem) => {
    setDispatchingRequestId(req.id);
    setDispatchingJobId(null);
    setDurationMinutes(60);
    setScheduledDateTime(
      req.preferredDate
        ? new Date(req.preferredDate).toISOString().slice(0, 16)
        : new Date(Date.now() + 3600000).toISOString().slice(0, 16)
    );
    if (technicians.length > 0 && !selectedTechId) {
      setSelectedTechId(technicians[0].id);
    }
    setDispatchError(null);
  };

  const handleConfirmDispatchServiceRequest = async (req: ServiceRequestItem) => {
    if (!selectedTechId) {
      setDispatchError("Please select an available technician.");
      return;
    }
    if (!onDispatchServiceRequest) return;
    try {
      setSubmitting(true);
      setDispatchError(null);
      await onDispatchServiceRequest(req, selectedTechId, new Date(scheduledDateTime).toISOString(), durationMinutes);
      setDispatchingRequestId(null);
    } catch (err: any) {
      console.error("Dispatch error:", err);
      setDispatchError(err?.response?.data?.message || err?.message || "Failed to dispatch service request.");
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
              <h3 className="font-bold text-sm text-slate-900">Unassigned Dispatch Queue</h3>
              <p className="text-[11px] text-slate-500">
                {openRequests.length} customer {openRequests.length === 1 ? "inquiry" : "inquiries"} • {unassignedJobs.length} work {unassignedJobs.length === 1 ? "order" : "orders"}
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-3 pt-2.5 pb-2 border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => {
              setActiveTab("requests");
              setDispatchingJobId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "requests"
                ? "bg-[#006937] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Customer Inquiries</span>
            {openRequests.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === "requests" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"
                }`}
              >
                {openRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("jobs");
              setDispatchingRequestId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "jobs"
                ? "bg-[#006937] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Work Orders</span>
            {unassignedJobs.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === "jobs" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {unassignedJobs.length}
              </span>
            )}
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
              placeholder={
                activeTab === "requests"
                  ? "Search by customer name, request notes..."
                  : "Filter by customer, job title, or location..."
              }
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006937]"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {activeTab === "requests" ? (
            /* TAB 1: CUSTOMER SERVICE REQUESTS */
            filteredRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-xs text-slate-700">All Requests Answered!</p>
                <p className="text-[11px]">No pending customer service requests in the queue.</p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isDispatchingThis = dispatchingRequestId === req.id;
                const isUrgent = req.urgency === "URGENT" || req.urgency === "EMERGENCY";

                return (
                  <div
                    key={req.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isDispatchingThis
                        ? "border-[#006937] bg-white ring-2 ring-emerald-100 shadow-md"
                        : isUrgent
                        ? "border-amber-300 bg-amber-50/20 hover:border-amber-400 shadow-2xs"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Awaiting Response
                      </span>
                      {req.urgency === "EMERGENCY" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          🚨 Emergency
                        </span>
                      )}
                      {req.urgency === "URGENT" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                          ⚡ Urgent
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 mt-2">
                      "{req.description}"
                    </h4>

                    <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                      <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{req.customerRecord?.name || "Customer"}</span>
                        {req.customerRecord?.phone && (
                          <span className="text-[10px] font-normal text-slate-500 font-mono">
                            ({req.customerRecord.phone})
                          </span>
                        )}
                      </p>

                      {req.preferredDate && (
                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Requested Date: {formatDate(req.preferredDate)}</span>
                        </p>
                      )}

                      {req.asset && (
                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Sun className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Asset: {req.asset.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Inline Dispatch Panel */}
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
                            Assign Field Technician
                          </label>
                          <select
                            value={selectedTechId}
                            onChange={(e) => setSelectedTechId(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#006937]"
                          >
                            {technicians.map((tech) => (
                              <option key={tech.id} value={tech.id}>
                                Engr. {tech.firstName} {tech.lastName} ({tech.tradeSpecialty || "Solar Tech"})
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
                          <button
                            type="button"
                            onClick={() => setDispatchingRequestId(null)}
                            className="flex-1 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleConfirmDispatchServiceRequest(req)}
                            className="flex-1 py-1.5 text-xs font-bold text-white bg-[#006937] hover:bg-[#00552c] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submitting ? "Dispatching..." : "Confirm & Dispatch"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleStartDispatchServiceRequest(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#006937] hover:bg-[#00552c] transition-all shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Accept & Dispatch</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : (
            /* TAB 2: UNASSIGNED WORK ORDERS */
            filteredJobs.length === 0 ? (
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
                          <button
                            type="button"
                            onClick={() => setDispatchingJobId(null)}
                            className="flex-1 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleConfirmDispatchJob(job.id)}
                            className="flex-1 py-1.5 text-xs font-bold text-white bg-[#006937] hover:bg-[#00552c] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{submitting ? "Dispatching..." : "Confirm & Dispatch"}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => onSelectJobForDetail(job)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          View Dossier &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartDispatchJob(job)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#006937] hover:bg-[#00552c] transition-all shadow-xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default UnassignedQueueDrawer;
