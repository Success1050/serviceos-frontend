"use client";

import React, { useState } from "react";
import apiClient from "@/lib/api/client";
import {
  Receipt,
  AlertCircle,
  Briefcase,
  User,
  DollarSign,
  Building2,
  FileText,
  Tag,
  CheckCircle2,
  X,
  Info,
} from "lucide-react";

interface SubmitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function SubmitExpenseModal({
  isOpen,
  onClose,
  onSubmitted,
}: SubmitExpenseModalProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedTechId, setSelectedTechId] = useState("");
  const [category, setCategory] = useState("MATERIALS_PARTS");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [receiptPhotoUrl, setReceiptPhotoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [billToClient, setBillToClient] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(false);
      fetchPrerequisites();
    }
  }, [isOpen]);

  const fetchPrerequisites = async () => {
    try {
      setLoadingInitial(true);
      const [jobsRes, techsRes] = await Promise.allSettled([
        apiClient.get("/jobs"),
        apiClient.get("/jobs/technicians"),
      ]);

      if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data)) {
        setJobs(jobsRes.value.data);
        if (jobsRes.value.data.length > 0 && !selectedJobId) {
          setSelectedJobId(jobsRes.value.data[0].id);
        }
      }

      if (techsRes.status === "fulfilled" && Array.isArray(techsRes.value.data)) {
        setTechnicians(techsRes.value.data);
        if (techsRes.value.data.length > 0 && !selectedTechId) {
          setSelectedTechId(techsRes.value.data[0].id);
        }
      }
    } catch (err) {
      console.warn("Prerequisites error:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const sampleReceipts = [
    {
      title: "Alaba Market Electrical Parts",
      url: "https://images.unsplash.com/photo-1554415707-9e49fe83083f?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Schneider Circuit Breaker Bill",
      url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Fuel & Generator Refuel Slip",
      url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJobId) {
      setError("Please link this expense to an active Work Order / Job.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please input a valid expense amount greater than 0.");
      return;
    }
    if (!receiptPhotoUrl) {
      setError("A physical receipt photo is mandatory for audit fraud prevention.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await apiClient.post("/expenses", {
        jobId: selectedJobId,
        technicianId: selectedTechId || undefined,
        amount: parsedAmount,
        receiptPhotoUrl,
        category,
        vendor: vendor.trim() || "Local Vendor",
        notes: notes.trim() || undefined,
        billToClient,
      });

      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
        setAmount("");
        setVendor("");
        setNotes("");
        setReceiptPhotoUrl("");
      }, 900);
    } catch (err: any) {
      console.error("Submit expense error:", err);
      setError(err?.response?.data?.message || "Failed to submit field expense.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#006937] text-white shadow-xs">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Log Field Expense (Over-the-Desk)
              </h2>
              <p className="text-xs text-slate-500">
                Log technician paper receipts or WhatsApp claims into the manager audit queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Callout */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#006937] shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900">Staff Entry Mode:</strong> Field technicians can submit claims directly from their mobile app (<code className="text-[#006937] font-semibold">/tech</code>). Use this modal when technicians drop off paper slips at the depot or send receipts via SMS/WhatsApp.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 font-semibold">
              <CheckCircle2 className="h-4 w-4 text-[#006937] shrink-0" />
              <span>Claim logged successfully! Routing to manager approval queue...</span>
            </div>
          )}

          {/* Job & Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Linked Work Order / Job <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
                required
              >
                {jobs.length === 0 ? (
                  <option value="">No active jobs found</option>
                ) : (
                  jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.status})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchasing Field Technician
              </label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
              >
                <option value="">Select Technician (or Job Default)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.tradeSpecialty || "Electrician"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
              >
                <option value="MATERIALS_PARTS">Materials & Extra Cabling</option>
                <option value="TOOLS_HARDWARE">Emergency Tools & Breakers</option>
                <option value="TRANSPORT_FUEL">Fuel & Site Transit</option>
                <option value="EMERGENCY_PERMIT">Local Permits & Site Fees</option>
                <option value="OTHER">Other Operational Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt Amount (₦ NGN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="15000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
                required
              />
            </div>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vendor / Supplier Store Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alaba International Electrical Depot"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
            />
          </div>

          {/* Receipt Photo URL & Sample Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Receipt Photo URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://... Cloudinary or image URL"
              value={receiptPhotoUrl}
              onChange={(e) => setReceiptPhotoUrl(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
              required
            />
            {/* Quick Test Presets */}
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400">Quick Test Samples:</span>
              {sampleReceipts.map((samp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setReceiptPhotoUrl(samp.url);
                    if (!vendor) setVendor(samp.title);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-[#006937] border border-slate-200 transition-colors"
                >
                  {samp.title.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Justification Notes
            </label>
            <textarea
              rows={2}
              placeholder="Explain why this item was purchased off-site rather than taken from warehouse inventory..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
            />
          </div>

          {/* Bill-to-Client */}
          <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={billToClient}
                onChange={(e) => setBillToClient(e.target.checked)}
                className="h-4 w-4 rounded-sm border-slate-300 text-[#006937] focus:ring-[#006937]"
              />
              <span className="text-xs font-semibold text-slate-800">
                Bill to customer on final job invoice (recommended)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#006937] hover:bg-[#004D28] text-white shadow-xs transition-all"
            >
              {submitting ? "Logging Claim..." : "Log Claim for Audit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
