"use client";

import React, { useState } from "react";
import apiClient from "@/lib/api/client";
import { Quote } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button, Dialog, Badge } from "@/components/ui";
import {
  FileText,
  Printer,
  Send,
  Building2,
  User,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Download,
} from "lucide-react";

interface QuotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  onQuoteSent?: (quote: Quote) => void;
}

export function QuotePreviewModal({
  isOpen,
  onClose,
  quote,
  onQuoteSent,
}: QuotePreviewModalProps) {
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  if (!isOpen || !quote) return null;

  const numericAmount =
    typeof quote.amount === "number" ? quote.amount : parseFloat(String(quote.amount)) || 0;

  const handlePrint = () => {
    window.print();
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await apiClient.post(`/quotes/${quote.id}/send`);
      const updated = res.data || { ...quote, status: "SENT" };
      setSendSuccess(true);
      if (onQuoteSent) onQuoteSent(updated);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to send quote:", err);
      alert(err.response?.data?.message || "Failed to send quote to customer.");
    } finally {
      setSending(false);
    }
  };

  // Simulated line items if not present
  const items = quote.items || [
    { description: `${quote.title} - Full System Components & Hardware`, quantity: 1, unitPrice: Math.round(numericAmount * 0.85), total: Math.round(numericAmount * 0.85) },
    { description: "Installation, Commissioning & Safety Grid Certification", quantity: 1, unitPrice: Math.round(numericAmount * 0.15), total: Math.round(numericAmount * 0.15) },
  ];

  const subtotal = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const vat = Math.round(subtotal * 0.075);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Commercial Quote & Proposal Preview"
      description={`Official proposal document for ${quote.customerRecord?.name || "Client"}.`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Printable Proposal Canvas */}
        <div id="printable-quote" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6 text-slate-900">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#006937] text-white flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  ServiceOS Enterprise Solar
                </span>
              </div>
              <p className="text-xs text-slate-500">Commercial & Residential Field Engineering</p>
              <p className="text-[11px] text-slate-400">Lekki Phase 1, Lagos, Nigeria · support@serviceos.ng</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                Commercial Proposal
              </span>
              <p className="text-xs font-mono font-bold text-slate-800">
                ID: Q-{quote.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-slate-500">
                Issued: {formatDate(quote.createdAt, "medium")}
              </p>
              <p className="text-[11px] text-amber-600 font-semibold">
                Valid for 14 Days from Issue
              </p>
            </div>
          </div>

          {/* Client Recipient & Site Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Prepared Exclusively For:
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {quote.customerRecord?.name || "Client Name"}
              </p>
              {quote.customerRecord?.phone && (
                <p className="text-slate-600 mt-0.5">{quote.customerRecord.phone}</p>
              )}
              {quote.customerRecord?.email && (
                <p className="text-slate-600">{quote.customerRecord.email}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Project Installation Site:
              </span>
              <p className="font-semibold text-slate-800">
                {quote.customerRecord?.address
                  ? `${quote.customerRecord.address}${
                      quote.customerRecord.city ? `, ${quote.customerRecord.city}` : ""
                    }`
                  : quote.customerRecord?.city || "Customer Designated Location"}
              </p>
              <p className="text-slate-500 mt-0.5">Nigeria</p>
            </div>
          </div>

          {/* Project Title Banner */}
          <div className="px-4 py-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
            <span className="text-[10px] font-bold text-[#006937] uppercase tracking-wider block">
              Project Scope & Objective
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{quote.title}</p>
          </div>

          {/* Itemized Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 font-bold">Scope / Equipment Description</th>
                  <th className="py-2.5 font-bold text-center w-16">Qty</th>
                  <th className="py-2.5 font-bold text-right w-28">Unit Price</th>
                  <th className="py-2.5 font-bold text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-4 font-medium text-slate-800">{item.description}</td>
                    <td className="py-3 text-center text-slate-600 font-mono">{item.quantity}</td>
                    <td className="py-3 text-right text-slate-600 font-mono">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div className="flex justify-end pt-3 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency(numericAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT (7.5% Included):</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatCurrency(Math.round(numericAmount * 0.075))}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span className="text-[#006937]">Grand Total:</span>
                <span className="font-mono text-base text-[#006937]">{formatCurrency(numericAmount)}</span>
              </div>
            </div>
          </div>

          {/* Milestone Tranches (if any) */}
          {quote.milestones && quote.milestones.length > 0 && (
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2.5">
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Staged Milestone Tranches
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {quote.milestones.map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase block">
                      Tranche {idx + 1} ({m.percentage}%)
                    </span>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1 mt-0.5">{m.title}</p>
                    <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                      {formatCurrency(m.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          {quote.termsAndConditions && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700 uppercase tracking-wider block">
                Terms & Acceptance Criteria
              </span>
              <p className="whitespace-pre-line font-mono leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {quote.termsAndConditions}
              </p>
            </div>
          )}

          {/* Digital Signature Acceptance Box */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                Authorized Engineering Officer
              </span>
              <div className="h-10 border-b border-slate-300 flex items-end pb-1 font-serif text-sm italic text-slate-700">
                ServiceOS Certified Master Electrician
              </div>
              <span className="text-[10px] text-slate-400">Date: {formatDate(quote.createdAt, "short")}</span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                Client Signature / Acceptance
              </span>
              <div className="h-10 border-b border-dashed border-slate-300 flex items-end pb-1 text-slate-400 italic text-[11px]">
                {quote.status === "ACCEPTED" ? "Digitally Signed & Accepted via Portal" : "Awaiting Client Digital Signature"}
              </div>
              <span className="text-[10px] text-slate-400">
                Status: {quote.status}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 -mx-6 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs font-semibold px-4 h-9">
            Close
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="text-xs font-semibold h-9 px-4 gap-1.5 bg-white hover:bg-slate-50"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print / Export PDF</span>
          </Button>

          {quote.status === "DRAFT" && (
            <Button
              type="button"
              disabled={sending}
              onClick={handleSend}
              className="text-xs font-semibold bg-[#006937] hover:bg-[#004D28] text-white h-9 px-5 shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? "Sending..." : sendSuccess ? "Sent Successfully!" : "Send Proposal to Client"}</span>
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
}
