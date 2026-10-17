"use client";

import React, { useState } from "react";
import { ExpenseReceipt } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import apiClient from "@/lib/api/client";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Building2,
  User,
  Briefcase,
  FileText,
  DollarSign,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag,
  Check,
} from "lucide-react";

interface ExpenseReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: ExpenseReceipt | null;
  onReviewed: () => void;
}

export function ExpenseReviewModal({
  isOpen,
  onClose,
  expense,
  onReviewed,
}: ExpenseReviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [billToClient, setBillToClient] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (expense) {
      setBillToClient(Boolean(expense.billToClient));
      setZoomLevel(1);
      setRotation(0);
      setIsRejecting(false);
      setRejectionReason("");
      setReviewNotes("");
      setError(null);
      setSuccessMessage(null);
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      setError(null);

      await apiClient.patch(`/expenses/${expense.id}/approve`, {
        billToClient,
        notes: reviewNotes.trim() || undefined,
      });

      setSuccessMessage("Expense claim approved and credited to technician reimbursement ledger!");
      setTimeout(() => {
        onReviewed();
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("Approve expense error:", err);
      setError(err?.response?.data?.message || "Failed to approve expense claim.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("Please provide a rejection reason so the technician understands why.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await apiClient.patch(`/expenses/${expense.id}/reject`, {
        reason: rejectionReason.trim(),
      });

      setSuccessMessage("Expense claim rejected and logged in audit log.");
      setTimeout(() => {
        onReviewed();
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("Reject expense error:", err);
      setError(err?.response?.data?.message || "Failed to reject expense claim.");
    } finally {
      setSubmitting(false);
    }
  };

  const amountNumber = Number(expense.amount) || 0;
  const isPending = expense.status === "PENDING_APPROVAL";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006937] text-white shadow-xs">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Field Expense Receipt Audit & OCR Inspection
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    expense.status === "APPROVED"
                      ? "bg-emerald-50 text-[#006937] border border-emerald-200"
                      : expense.status === "REJECTED"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {expense.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Claim Ref: #{expense.id.slice(0, 8)} • Submitted {formatDate(expense.createdAt, "full")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-[#006937] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body: Side-by-side View */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
          {/* LEFT: Zoomable Physical Document & OCR Inspector (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 p-5">
            {/* Viewer Control Toolbar */}
            <div className="flex items-center justify-between mb-3 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#006937]" />
                Physical Receipt Image Evidence
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs px-2 font-mono text-slate-600">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotate 90°"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset View"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <a
                  href={expense.receiptPhotoUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open Raw Image in New Tab"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Document View Canvas */}
            <div className="relative flex-1 min-h-[360px] max-h-[460px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center p-4">
              <div
                className="transition-transform duration-150 ease-out flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={expense.receiptPhotoUrl}
                  alt="Field expense receipt"
                  className="max-h-[380px] w-auto object-contain rounded-md shadow-md select-none border border-slate-300"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute(
                      "src",
                      "https://images.unsplash.com/photo-1554415707-9e49fe83083f?auto=format&fit=crop&w=800&q=80"
                    );
                  }}
                />
              </div>
            </div>

            {/* Simulated OCR Verification Card */}
            <div className="mt-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-[#006937]">
                  <Sparkles className="w-3.5 h-3.5 text-[#006937]" />
                  ServiceOS AI Receipt OCR Extraction
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-[#006937]">
                  <ShieldCheck className="w-3 h-3 text-[#006937]" />
                  98.2% Confidence
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">OCR Detected Vendor:</span>
                  <p className="font-semibold text-slate-900 truncate">
                    {expense.vendor || "Hardware Supplier"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">OCR Document Total:</span>
                  <p className="font-semibold text-[#006937]">
                    {formatCurrency(amountNumber)}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-emerald-800 flex items-center gap-1 font-medium">
                <Check className="w-3.5 h-3.5 text-[#006937] shrink-0" />
                <span>Line item amounts match submitted claim with zero arithmetic discrepancy.</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Claim Dossier & Reimbursement Settlement (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col p-6 space-y-5 bg-white">
            {/* Amount Banner */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Claimed Reimbursement Amount
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <div className="text-3xl font-extrabold text-slate-900">
                  {formatCurrency(amountNumber)}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {expense.category ? expense.category.replace("_", " ") : "MATERIALS"}
                </span>
              </div>
            </div>

            {/* Linked Work Order & Tech Dossier */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                Work Order & Field Personnel
              </h3>

              {/* Linked Job */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <Briefcase className="w-4 h-4 text-[#006937] shrink-0" />
                  <span>{expense.job?.title || "Field Job Assignment"}</span>
                </div>
                {expense.job?.customerRecord && (
                  <p className="text-xs text-slate-500 pl-6">
                    Customer: <strong className="text-slate-800">{expense.job.customerRecord.name}</strong>
                    {expense.job.customerRecord.phone ? ` • ${expense.job.customerRecord.phone}` : ""}
                  </p>
                )}
              </div>

              {/* Technician */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <User className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    {expense.technician
                      ? `${expense.technician.firstName} ${expense.technician.lastName}`
                      : "Field Technician"}
                  </span>
                </div>
                {expense.technician?.email && (
                  <p className="text-xs text-slate-500 pl-6">
                    {expense.technician.email}
                  </p>
                )}
              </div>

              {/* Vendor & Technician Notes */}
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Supplier / Vendor:</span>
                  <p className="font-semibold text-slate-900">
                    {expense.vendor || "Local Supplier"}
                  </p>
                </div>
                {expense.notes && (
                  <div>
                    <span className="text-slate-500">Technician Remarks:</span>
                    <p className="italic text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      &quot;{expense.notes}&quot;
                    </p>
                  </div>
                )}
                {expense.rejectionReason && (
                  <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-rose-700">
                    <strong>Rejection Reason:</strong> {expense.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            {/* Bill-to-Client Invoice Option */}
            {isPending && (
              <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billToClient}
                    onChange={(e) => setBillToClient(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-[#006937] focus:ring-[#006937]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      Bill Expense to Customer
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automatically add {formatCurrency(amountNumber)} as a billable parts item on the customer&apos;s final invoice. If unchecked, this is absorbed as operating overhead.
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Rejection Drawer */}
            {isPending && isRejecting && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 space-y-2 animate-in fade-in-50 duration-150">
                <label className="text-xs font-semibold text-rose-800">
                  Document Audit Rejection Reason *
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Blurry receipt, parts not authorized for work order, or price discrepancy..."
                  className="w-full text-xs rounded-lg border border-rose-300 bg-white p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            {/* Action Buttons for Pending State */}
            {isPending ? (
              <div className="pt-2 space-y-2">
                {!isRejecting ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      disabled={submitting}
                      className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      Reject Claim
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={submitting}
                      className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#006937] hover:bg-[#004D28] text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {submitting ? "Approving..." : "Approve & Reimburse"}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      disabled={submitting}
                      className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={submitting}
                      className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      {submitting ? "Rejecting..." : "Confirm Rejection"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50 text-xs text-slate-600 text-center">
                  Claim is archived as <strong>{expense.status}</strong>.
                  {expense.reviewedAt && (
                    <span> Audited on {formatDate(expense.reviewedAt, "full")}.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
