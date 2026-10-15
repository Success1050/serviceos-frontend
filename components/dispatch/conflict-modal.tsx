"use client";

import React, { useState } from "react";
import { Job } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Dialog, Button } from "@/components/ui";
import {
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictingJob: Partial<Job> | null;
  proposedJob: {
    title: string;
    scheduledAt: string;
    estimatedDuration: number;
    technicianName?: string;
  } | null;
  onConfirmOverride: () => void;
  isOverriding?: boolean;
}

export function ConflictModal({
  isOpen,
  onClose,
  conflictingJob,
  proposedJob,
  onConfirmOverride,
  isOverriding = false,
}: ConflictModalProps) {
  const [overrideAuthorized, setOverrideAuthorized] = useState(false);

  if (!isOpen || !proposedJob) return null;

  const proposedStart = new Date(proposedJob.scheduledAt);
  const proposedEnd = new Date(
    proposedStart.getTime() + (proposedJob.estimatedDuration || 60) * 60000
  );

  const existingStart = conflictingJob?.scheduledAt
    ? new Date(conflictingJob.scheduledAt)
    : null;
  const existingEnd = existingStart
    ? new Date(existingStart.getTime() + (conflictingJob?.estimatedDuration || 60) * 60000)
    : null;

  const handleClose = () => {
    setOverrideAuthorized(false);
    onClose();
  };

  const handleOverride = () => {
    if (!overrideAuthorized) return;
    onConfirmOverride();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Double-Booking Conflict Warning"
      description="Smart scheduling engine detected an overlapping technician assignment."
      maxWidth="lg"
    >
      <div className="space-y-5 text-slate-800 text-xs">
        {/* Banner Alert */}
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-amber-900 leading-tight">
              Technician Schedule Overlap Detected
            </h4>
            <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
              <strong>{proposedJob.technicianName || "The selected technician"}</strong> is
              already committed to another field job during this time window. Dispatching
              simultaneous jobs causes delayed arrivals and customer SLA breaches.
            </p>
          </div>
        </div>

        {/* Comparison: Proposed vs Existing Conflict */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Conflicting Existing Job */}
          <div className="p-3.5 rounded-xl border-2 border-rose-200 bg-rose-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                <XCircle className="w-3 h-3 text-rose-600" />
                Active Commitment
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                ID: {conflictingJob?.id ? conflictingJob.id.slice(0, 8).toUpperCase() : "EXISTING"}
              </span>
            </div>

            <p className="font-bold text-slate-900 text-sm leading-snug">
              {conflictingJob?.title || "Field Maintenance & Solar Survey"}
            </p>

            {conflictingJob?.customerRecord?.name && (
              <p className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                <User className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{conflictingJob.customerRecord.name}</span>
              </p>
            )}

            <div className="pt-2 border-t border-rose-100 flex items-center gap-1.5 text-rose-700 font-semibold text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {existingStart
                  ? `${existingStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${
                      existingEnd?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    } (${conflictingJob?.estimatedDuration || 60}m)`
                  : "09:30 AM – 11:30 AM (120m)"}
              </span>
            </div>
          </div>

          {/* Proposed Conflicting Slot */}
          <div className="p-3.5 rounded-xl border-2 border-amber-300 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                Proposed Booking
              </span>
              <span className="text-[10px] font-mono text-slate-400">NEW REQUEST</span>
            </div>

            <p className="font-bold text-slate-900 text-sm leading-snug">
              {proposedJob.title}
            </p>

            <p className="text-slate-600 flex items-center gap-1.5 text-[11px]">
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{proposedJob.technicianName || "Assigned Technician"}</span>
            </p>

            <div className="pt-2 border-t border-amber-100 flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {proposedStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                {proposedEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (
                {proposedJob.estimatedDuration}m)
              </span>
            </div>
          </div>
        </div>

        {/* Transit Buffer Warning */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span className="text-[11px]">
              Minimum mandatory transit buffer between jobs: <strong>30 minutes</strong>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
            Enforced Rule
          </span>
        </div>

        {/* Supervisor / Admin Override Checkbox */}
        <div className="pt-2 border-t border-slate-200">
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={overrideAuthorized}
              onChange={(e) => setOverrideAuthorized(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#006937] focus:ring-[#006937] h-4 w-4"
            />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 text-xs block">
                Supervisor Override Authority
              </span>
              <p className="text-[11px] text-slate-500 leading-normal">
                I possess dispatcher override credentials and acknowledge this technician will be
                double-booked for overlapping physical service appointments.
              </p>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="text-xs font-semibold px-4 h-9"
          >
            Cancel / Select Another Slot
          </Button>

          <Button
            type="button"
            disabled={!overrideAuthorized || isOverriding}
            onClick={handleOverride}
            className={`text-xs font-bold h-9 px-4 transition-all gap-1.5 ${
              overrideAuthorized
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20 cursor-pointer"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isOverriding ? "Overriding & Saving..." : "Authorize Double-Booking"}</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
