"use client";

import React, { useState, useEffect } from "react";
import { Job, CustomerRecord, Technician, Quote } from "@/lib/types";
import apiClient from "@/lib/api/client";
import { Dialog, Button, Input } from "@/components/ui";
import {
  Calendar,
  Clock,
  User,
  Wrench,
  FileText,
  AlertCircle,
  PlusCircle,
  Zap,
} from "lucide-react";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  technicians: Technician[];
  onJobCreated: (newJob: Job) => void;
  onConflictDetected?: (conflictData: any, proposedData: any) => void;
  initialDate?: string;
  initialTechnicianId?: string;
}

export function CreateJobModal({
  isOpen,
  onClose,
  technicians,
  onJobCreated,
  onConflictDetected,
  initialDate,
  initialTechnicianId,
}: CreateJobModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customerRecordId, setCustomerRecordId] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [assignedTechnicianId, setAssignedTechnicianId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60);

  // Loaded Data
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize dates and fields
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoadingData(true);

      const defaultTime = initialDate
        ? new Date(initialDate).toISOString().slice(0, 16)
        : new Date(Date.now() + 3600000).toISOString().slice(0, 16);
      setScheduledAt(defaultTime);

      if (initialTechnicianId) {
        setAssignedTechnicianId(initialTechnicianId);
      } else if (technicians.length > 0) {
        setAssignedTechnicianId(technicians[0].id);
      }

      Promise.all([
        apiClient.get("/customers?limit=100").catch(() => ({ data: { items: [] } })),
        apiClient.get("/quotes?limit=50").catch(() => ({ data: { items: [] } })),
      ])
        .then(([custRes, quoteRes]) => {
          const custList = custRes.data?.items || custRes.data || [];
          setCustomers(custList);
          if (custList.length > 0 && !customerRecordId) {
            setCustomerRecordId(custList[0].id);
          }

          const quoteList = quoteRes.data?.items || quoteRes.data || [];
          setQuotes(quoteList);
        })
        .finally(() => setLoadingData(false));
    }
  }, [isOpen, initialDate, initialTechnicianId, technicians]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerRecordId) {
      setError("Please select a customer for this field job.");
      return;
    }
    if (!title.trim()) {
      setError("Please provide a job title.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        customerRecordId,
        quoteId: quoteId || undefined,
        assignedTechnicianId: assignedTechnicianId || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        estimatedDuration: Number(estimatedDuration) || 60,
      };

      const res = await apiClient.post("/jobs", payload);
      onJobCreated(res.data);
      onClose();
    } catch (err: any) {
      console.error("Failed to create job:", err);
      // Conflict detection (409 Conflict)
      if (err?.response?.status === 409 || err?.response?.data?.conflictingJob) {
        const conflictData = err.response.data.conflictingJob || {
          title: "Existing Scheduled Appointment",
          scheduledAt,
          estimatedDuration,
        };
        const techObj = technicians.find((t) => t.id === assignedTechnicianId);
        if (onConflictDetected) {
          onClose();
          onConflictDetected(conflictData, {
            title,
            scheduledAt,
            estimatedDuration,
            technicianName: techObj ? `${techObj.firstName} ${techObj.lastName}` : "Assigned Technician",
            customerRecordId,
            description,
          });
          return;
        }
      }
      setError(err?.response?.data?.message || "Failed to schedule job. Please check fields.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Field Service Job"
      description="Dispatch a field technician with conflict checking and duration buffer."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-800">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Job Title */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Job Scope / Service Title <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 10kVA Hybrid Solar Inverter Commissioning"
            required
            className="text-xs font-semibold"
          />
        </div>

        {/* Customer & Site Selection */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Client & Site Location <span className="text-rose-500">*</span>
          </label>
          {loadingData ? (
            <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500 animate-pulse">
              Loading client records...
            </div>
          ) : customers.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold block">No customer records found.</span>
                <span className="text-[11px] text-amber-700">A customer and site address is required to dispatch field service.</span>
              </div>
              <a
                href="/app/customers"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 text-[11px] font-bold rounded border border-amber-300 shadow-2xs shrink-0 inline-flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3 text-[#006937]" />
                <span>Add Customer</span>
              </a>
            </div>
          ) : (
            <select
              value={customerRecordId}
              onChange={(e) => setCustomerRecordId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
            >
              <option value="" disabled>-- Select Client & Site Location --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.address ? `• ${c.address}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Technician Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assigned Field Technician
            </label>
            <select
              value={assignedTechnicianId}
              onChange={(e) => setAssignedTechnicianId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
            >
              <option value="">Leave Unassigned (Send to Queue)</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.tradeSpecialty || "Field Tech"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Link Commercial Quote (Optional)
            </label>
            <select
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
            >
              <option value="">No Linked Quote</option>
              {quotes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scheduled Start & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Estimated Duration
            </label>
            <select
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
            >
              <option value={30}>30 Minutes</option>
              <option value={60}>1 Hour (Standard)</option>
              <option value={90}>1.5 Hours</option>
              <option value={120}>2 Hours (Full Installation)</option>
              <option value={180}>3 Hours</option>
              <option value={240}>4 Hours (Half Day)</option>
            </select>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Job Scope / Work Order Instructions
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add detailed site instructions, gate pass requirements, or technical checklists..."
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9 px-4">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="text-xs font-bold bg-[#006937] hover:bg-[#004D28] text-white h-9 px-5 shadow-xs gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{submitting ? "Checking Schedule & Saving..." : "Confirm & Dispatch Job"}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
