"use client";

import React from "react";
import { Invoice } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Dialog,
  Button,
} from "@/components/ui";
import {
  Building2,
  Printer,
  Download,
  Calendar,
  User,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  CreditCard,
  Banknote,
} from "lucide-react";

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onRecordPayment?: (invoice: Invoice) => void;
  onPayOnline?: (invoice: Invoice) => void;
}

export function InvoicePreviewModal({
  isOpen,
  onClose,
  invoice,
  onRecordPayment,
  onPayOnline,
}: InvoicePreviewModalProps) {
  if (!invoice) return null;

  const numericAmount =
    typeof invoice.amount === "number"
      ? invoice.amount
      : parseFloat(String(invoice.amount)) || 0;

  const successfulPayments = invoice.paymentTransactions
    ? invoice.paymentTransactions.filter((t) => t.status === "SUCCESSFUL")
    : [];

  const totalPaid = successfulPayments.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );
  const balanceDue = Math.max(0, numericAmount - totalPaid);
  const isPaid = invoice.status === "PAID" || balanceDue <= 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Tax Invoice — INV-${invoice.id.slice(0, 8).toUpperCase()}`}
      description="Printable tax invoice document preview and transaction receipts ledger"
      maxWidth="3xl"
    >
        {/* Modal Controls Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#006937]" />
            <span className="font-bold text-sm text-slate-800">
              Tax Invoice Document Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isPaid && onRecordPayment && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="h-8 text-xs font-semibold text-emerald-700 bg-white border-emerald-300 hover:bg-emerald-50 gap-1.5"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </Button>
            )}
            {!isPaid && onPayOnline && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onPayOnline(invoice);
                }}
                className="h-8 text-xs font-semibold bg-[#006937] hover:bg-[#004D28] text-white gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Online</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="h-8 text-xs font-semibold gap-1.5 bg-white"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border border-slate-200 p-8 text-slate-800 text-xs font-sans space-y-6 relative print:shadow-none print:border-none print:p-0">
            {/* PAID / WATERMARK STAMP */}
            {isPaid ? (
              <div className="absolute top-20 right-12 border-4 border-emerald-600/30 text-emerald-600/40 font-black text-4xl uppercase px-4 py-1.5 rounded-xl rotate-[-12deg] pointer-events-none select-none tracking-widest">
                PAID IN FULL
              </div>
            ) : invoice.dueDate && new Date(invoice.dueDate).getTime() < Date.now() ? (
              <div className="absolute top-20 right-12 border-4 border-rose-600/30 text-rose-600/40 font-black text-3xl uppercase px-4 py-1.5 rounded-xl rotate-[-12deg] pointer-events-none select-none tracking-widest">
                OVERDUE
              </div>
            ) : null}

            {/* Document Header & Tenant Branding */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#006937] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {invoice.tenant?.name || "ServiceOS Enterprise Partner"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Solar, HVAC & Physical Asset Engineering
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    RC: 1849204 • Tax ID: 22091448-0001
                  </p>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <h1 className="text-xl font-black text-[#006937] tracking-wider uppercase">
                  TAX INVOICE
                </h1>
                <p className="font-mono text-slate-600 font-bold">
                  INV-{invoice.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-[11px] text-slate-500">
                  Issued: {formatDate(invoice.createdAt || new Date().toISOString(), "short")}
                </p>
                <p className="text-[11px] font-semibold text-rose-700">
                  Due: {invoice.dueDate ? formatDate(invoice.dueDate, "short") : "On Receipt"}
                </p>
              </div>
            </div>

            {/* Client & Billing Information */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Billed To
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {invoice.customerRecord?.name || "Valued Client"}
                </p>
                {invoice.customerRecord?.address && (
                  <p className="text-slate-600 mt-0.5 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {invoice.customerRecord.address}
                      {invoice.customerRecord.city ? `, ${invoice.customerRecord.city}` : ""}
                    </span>
                  </p>
                )}
                {invoice.customerRecord?.email && (
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{invoice.customerRecord.email}</span>
                  </p>
                )}
                {invoice.customerRecord?.phone && (
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{invoice.customerRecord.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Status
                </span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Current Status:</span>
                    <span className="font-bold text-slate-800 uppercase">{invoice.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Billed:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(numericAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(totalPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <span className="font-bold text-slate-700">Balance Due:</span>
                    <span className="font-black text-[#006937] text-sm">
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Lifecycle Timeline */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Payment Lifecycle Timeline
              </span>
              <div className="grid grid-cols-4 gap-2 relative">
                {/* Connecting track line */}
                <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200 -z-0" />
                <div
                  className="absolute top-3 left-4 h-0.5 bg-emerald-500 transition-all duration-500 -z-0"
                  style={{
                    width: isPaid
                      ? "calc(100% - 2rem)"
                      : invoice.status === "PARTIALLY_PAID" || totalPaid > 0
                        ? "66%"
                        : invoice.status !== "DRAFT"
                          ? "33%"
                          : "0%",
                  }}
                />

                {/* Step 1: Created */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[11px] text-slate-800 mt-1.5">Created</span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(invoice.createdAt || new Date().toISOString(), "short")}
                  </span>
                </div>

                {/* Step 2: Sent */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs transition-colors ${
                      invoice.status !== "DRAFT"
                        ? "bg-emerald-500 text-white"
                        : "bg-white border-2 border-slate-300 text-slate-400"
                    }`}
                  >
                    {invoice.status !== "DRAFT" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      "2"
                    )}
                  </div>
                  <span className={`font-bold text-[11px] mt-1.5 ${invoice.status !== "DRAFT" ? "text-slate-800" : "text-slate-400"}`}>
                    Sent
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {invoice.status !== "DRAFT" ? "Delivered" : "Pending"}
                  </span>
                </div>

                {/* Step 3: Partially Paid */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs transition-colors ${
                      invoice.status === "PARTIALLY_PAID" || isPaid || totalPaid > 0
                        ? "bg-emerald-500 text-white"
                        : "bg-white border-2 border-slate-300 text-slate-400"
                    }`}
                  >
                    {invoice.status === "PARTIALLY_PAID" || isPaid || totalPaid > 0 ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      "3"
                    )}
                  </div>
                  <span
                    className={`font-bold text-[11px] mt-1.5 ${
                      invoice.status === "PARTIALLY_PAID" || isPaid || totalPaid > 0
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    Partially Paid
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {totalPaid > 0 ? formatCurrency(totalPaid) : "Awaiting"}
                  </span>
                </div>

                {/* Step 4: Paid in Full */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs transition-colors ${
                      isPaid
                        ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                        : "bg-white border-2 border-slate-300 text-slate-400"
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      "4"
                    )}
                  </div>
                  <span className={`font-bold text-[11px] mt-1.5 ${isPaid ? "text-emerald-700 font-extrabold" : "text-slate-400"}`}>
                    Paid in Full
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isPaid ? (invoice.paidAt ? formatDate(invoice.paidAt, "short") : "Completed") : "Unpaid"}
                  </span>
                </div>
              </div>
            </div>

            {/* Scope / Title Header */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Invoice Scope of Work
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">{invoice.title}</h3>
            </div>

            {/* Billing Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {invoice.title}
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Commercial engineering, procurement & service execution
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">1</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(numericAmount / 1.075)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-right font-semibold text-slate-500">
                      Subtotal
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                      {formatCurrency(numericAmount / 1.075)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="py-2 px-3 text-right text-slate-500">
                      Value Added Tax (7.5% VAT)
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">
                      {formatCurrency(numericAmount - numericAmount / 1.075)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/40">
                    <td colSpan={2} className="py-3 px-3 text-right font-bold text-slate-900 text-sm">
                      Total Invoice Amount
                    </td>
                    <td className="py-3 px-3 text-right font-black text-[#006937] text-sm">
                      {formatCurrency(numericAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Transaction Receipts Ledger */}
            {successfulPayments.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Receipts & Audit Ledger
                </span>
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                  {successfulPayments.map((p) => (
                    <div key={p.id} className="p-2.5 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-slate-800 font-mono text-[11px]">
                            {p.transactionReference}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {p.paymentMethod || "Direct Payment"} • {formatDate(p.createdAt, "short")}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700">{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wire Transfer & Bank Instructions */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-[10px]">
                Official Bank Remittance Details
              </span>
              <p>
                <strong>Bank Name:</strong> Access Bank Plc • <strong>Account Number:</strong> 0123456789
              </p>
              <p>
                <strong>Account Name:</strong> ServiceOS Clean Energy & Infrastructure Ltd
              </p>
              <p className="text-[10px] text-slate-400">
                Please quote reference <strong>INV-{invoice.id.slice(0, 8).toUpperCase()}</strong> when making transfer deposits.
              </p>
            </div>
          </div>
        </div>
    </Dialog>
  );
}
