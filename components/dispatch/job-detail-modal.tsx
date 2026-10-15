"use client";

import React, { useState } from "react";
import { Job, JobStatus, Technician } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import apiClient from "@/lib/api/client";
import { Dialog, Button } from "@/components/ui";
import {
  Clock,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Send,
  Wrench,
  KeyRound,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Phone,
} from "lucide-react";

interface JobDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  technicians: Technician[];
  onJobUpdated: (updatedJob: Job) => void;
  onJobDeleted?: (jobId: string) => void;
  onTriggerConflict?: (conflictData: any, proposedData: any) => void;
}

export function JobDetailModal({
  isOpen,
  onClose,
  job,
  technicians,
  onJobUpdated,
  onJobDeleted,
  onTriggerConflict,
}: JobDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [statusVal, setStatusVal] = useState<JobStatus>("SCHEDULED");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !job) return null;

  const currentStart = job.scheduledAt ? new Date(job.scheduledAt) : null;
  const currentEnd = currentStart
    ? new Date(currentStart.getTime() + (job.estimatedDuration || 60) * 60000)
    : null;

  const handleStartEditing = () => {
    setSelectedTechId(job.assignedTechnicianId || "");
    setScheduledDateTime(
      job.scheduledAt
        ? new Date(job.scheduledAt).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    );
    setDurationMinutes(job.estimatedDuration || 60);
    setStatusVal(job.status);
    setIsEditing(true);
    setError(null);
  };

  const handleSaveReschedule = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const payload: any = {
        assignedTechnicianId: selectedTechId || null,
        scheduledAt: scheduledDateTime ? new Date(scheduledDateTime).toISOString() : null,
        estimatedDuration: durationMinutes,
        status: statusVal,
      };

      const res = await apiClient.patch(`/jobs/${job.id}`, payload);
      onJobUpdated(res.data);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to update job:", err);
      if (err?.response?.status === 409 || err?.response?.data?.conflictingJob) {
        const conflict = err.response.data.conflictingJob || {
          title: "Existing Appointment",
          scheduledAt: scheduledDateTime,
        };
        const techObj = technicians.find((t) => t.id === selectedTechId);
        if (onTriggerConflict) {
          onClose();
          onTriggerConflict(conflict, {
            title: job.title,
            scheduledAt: scheduledDateTime,
            estimatedDuration: durationMinutes,
            technicianName: techObj ? `${techObj.firstName} ${techObj.lastName}` : "Technician",
            jobId: job.id,
          });
          return;
        }
      }
      setError(err?.response?.data?.message || "Failed to reschedule job.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusQuickChange = async (newStatus: JobStatus) => {
    try {
      setSubmitting(true);
      const res = await apiClient.patch(`/jobs/${job.id}`, { status: newStatus });
      onJobUpdated(res.data);
    } catch (err: any) {
      console.error("Failed status change:", err);
      alert(err?.response?.data?.message || "Failed to update job status.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (st: JobStatus) => {
    switch (st) {
      case "SCHEDULED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            Scheduled
          </span>
        );
      case "EN_ROUTE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            En Route
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            In Progress
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-50 text-slate-600 border border-slate-200">
            {st}
          </span>
        );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Field Service Job Dossier"
      description={`Work order inspection for ID: JOB-${job.id.slice(0, 8).toUpperCase()}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs text-slate-800">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Info Banner */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {renderStatusBadge(job.status)}
              <span className="text-slate-400 font-mono text-[11px]">
                ID: {job.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{job.title}</h3>
          </div>

          {!isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartEditing}
              className="text-xs h-8 px-3 font-semibold"
            >
              Reschedule / Reassign
            </Button>
          )}
        </div>

        {/* Editing Mode */}
        {isEditing ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
            <h4 className="font-bold text-xs text-slate-800">Reschedule Work Order</h4>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Assigned Field Technician
              </label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
              >
                <option value="">Unassigned (Send to Queue)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.tradeSpecialty || "Field Tech"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
              <select
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="EN_ROUTE">EN_ROUTE</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="text-xs h-8 px-3"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveReschedule}
                disabled={submitting}
                className="text-xs h-8 px-4 bg-[#006937] hover:bg-[#004D28] text-white font-bold"
              >
                {submitting ? "Checking & Saving..." : "Save Reschedule"}
              </Button>
            </div>
          </div>
        ) : (
          /* Read View */
          <div className="space-y-4">
            {/* Grid 2-cols: Customer & Technician */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Customer & Site Premises
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {job.customerRecord?.name || "Client Name"}
                </p>
                {job.customerRecord?.address && (
                  <p className="text-slate-600 flex items-start gap-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{job.customerRecord.address}</span>
                  </p>
                )}
                {job.customerRecord?.phone && (
                  <p className="text-slate-500 flex items-center gap-1 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.customerRecord.phone}</span>
                  </p>
                )}
              </div>

              {/* Technician Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Assigned Field Technician
                </span>
                {job.assignedTechnician ? (
                  <>
                    <p className="font-bold text-slate-900 text-sm">
                      {job.assignedTechnician.firstName} {job.assignedTechnician.lastName}
                    </p>
                    <p className="text-emerald-700 font-semibold text-[11px]">
                      {job.assignedTechnician.tradeSpecialty || "Field Engineering Specialist"}
                    </p>
                    {job.assignedTechnician.phone && (
                      <p className="text-slate-500 text-[11px]">{job.assignedTechnician.phone}</p>
                    )}
                  </>
                ) : (
                  <div className="py-2 text-amber-700 text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>No technician assigned yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Time & Duration */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100/50 text-[#006937] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Scheduled Time Window
                  </span>
                  <p className="font-bold text-slate-900">
                    {currentStart
                      ? `${formatDate(job.scheduledAt!, "medium")} • ${currentStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${currentEnd?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : "Unscheduled"}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                {job.estimatedDuration || 60} mins
              </span>
            </div>

            {/* Description */}
            {job.description && (
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Work Order Description
                </span>
                <p className="text-slate-700 leading-relaxed">{job.description}</p>
              </div>
            )}

            {/* Quick Status Action Controls */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Lifecycle State Transition
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusQuickChange("SCHEDULED")}
                  className={`text-[11px] h-7 px-2.5 ${job.status === "SCHEDULED" ? "border-blue-500 bg-blue-50 text-blue-700 font-bold" : ""}`}
                >
                  Scheduled
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusQuickChange("EN_ROUTE")}
                  className={`text-[11px] h-7 px-2.5 ${job.status === "EN_ROUTE" ? "border-amber-500 bg-amber-50 text-amber-700 font-bold" : ""}`}
                >
                  En Route
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusQuickChange("IN_PROGRESS")}
                  className={`text-[11px] h-7 px-2.5 ${job.status === "IN_PROGRESS" ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold" : ""}`}
                >
                  In Progress
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusQuickChange("COMPLETED")}
                  className={`text-[11px] h-7 px-2.5 ${job.status === "COMPLETED" ? "border-slate-500 bg-slate-200 text-slate-800 font-bold" : ""}`}
                >
                  Completed
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          {job.completionOtp ? (
            <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Customer OTP: {job.completionOtp}</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400">
              Created {formatDate(job.createdAt, "short")}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs h-8 px-4 font-semibold"
          >
            Close Dossier
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
