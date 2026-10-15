"use client";

import React, { useState } from "react";
import { Invoice, InvoiceStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
} from "@/components/ui";
import {
  Receipt,
  FileText,
  Send,
  CreditCard,
  Banknote,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  PlusCircle,
  Calendar,
} from "lucide-react";

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
  onSelectInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onPayOnline: (invoice: Invoice) => void;
  onSendInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoice: Invoice) => void;
  onAddNew: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export function InvoiceTable({
  invoices,
  isLoading,
  onSelectInvoice,
  onRecordPayment,
  onPayOnline,
  onSendInvoice,
  onDeleteInvoice,
  onAddNew,
  currentPage,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: InvoiceTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`INV-${id.slice(0, 8).toUpperCase()}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderStatusBadge = (status: InvoiceStatus, dueDate?: string | null) => {
    const isOverdue =
      status !== "PAID" &&
      status !== "CANCELLED" &&
      dueDate &&
      new Date(dueDate).getTime() < Date.now();

    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Overdue
        </span>
      );
    }

    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" />
            Draft
          </span>
        );
      case "SENT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3 h-3 text-blue-500" />
            Sent to Client
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Partially Paid
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid in Full
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Overdue
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-400" />
            Cancelled
          </span>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-700">Loading commercial invoices...</p>
        <p className="text-xs text-slate-400 mt-1">Retrieving billing statements and payment records</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#006937] flex items-center justify-center mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Commercial Invoices Found</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          Issue tax invoices with due dates, accept bank transfers with teller slips, or initiate Paystack/Stripe online card checkouts.
        </p>
        <Button onClick={onAddNew} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Create First Invoice
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 border-b border-slate-200/80 hover:bg-slate-50/70">
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  checked={invoices.length > 0 && selectedIds.length === invoices.length}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-[#006937] focus:ring-[#006937]"
                />
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Invoice & Code
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Billed Client
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider text-right">
                Total Billed
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Due Date
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const isChecked = selectedIds.includes(inv.id);
              const customerName = inv.customerRecord?.name || "Unassigned Customer";
              const siteAddress = inv.customerRecord?.address
                ? `${inv.customerRecord.address}${inv.customerRecord.city ? `, ${inv.customerRecord.city}` : ""}`
                : inv.customerRecord?.city || "Site not specified";

              const numericAmount =
                typeof inv.amount === "number"
                  ? inv.amount
                  : parseFloat(String(inv.amount)) || 0;

              const isPaid = inv.status === "PAID";

              return (
                <TableRow
                  key={inv.id}
                  className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                    isChecked ? "bg-emerald-50/30" : ""
                  }`}
                  onClick={() => onSelectInvoice(inv)}
                >
                  <TableCell
                    className="text-center py-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(inv.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-[#006937] focus:ring-[#006937]"
                    />
                  </TableCell>

                  {/* Title & Reference Code */}
                  <TableCell className="py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006937] border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#006937] transition-colors truncate max-w-[240px]">
                          {inv.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <span>INV-{inv.id.slice(0, 8).toUpperCase()}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(e, inv.id)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                            title="Copy Invoice ID"
                          >
                            {copiedId === inv.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Customer & Location */}
                  <TableCell className="py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[190px]">{customerName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[190px]">{siteAddress}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Total Amount */}
                  <TableCell className="py-4 text-right">
                    <span className="text-sm font-bold text-slate-900 block">
                      {formatCurrency(numericAmount)}
                    </span>
                    {inv.paymentTransactions && inv.paymentTransactions.length > 0 && (
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {inv.paymentTransactions.length} payment records
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">
                    {renderStatusBadge(inv.status, inv.dueDate)}
                  </TableCell>

                  {/* Due Date */}
                  <TableCell className="py-4 text-xs text-slate-600">
                    {inv.dueDate ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(inv.dueDate, "short")}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Immediate</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {!isPaid && (
                        <>
                          {/* Record Manual Payment (Bank Transfer) */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRecordPayment(inv)}
                            className="h-8 text-xs font-semibold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200 gap-1.5 px-2.5 whitespace-nowrap"
                            title="Record Bank Transfer / Offline Payment"
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Record Pay</span>
                          </Button>

                          {/* Pay Online (Gateway Checkout) */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPayOnline(inv)}
                            className="h-8 text-xs font-semibold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border-indigo-200 gap-1.5 px-2.5 whitespace-nowrap"
                            title="Initiate Paystack / Stripe Checkout"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Online</span>
                          </Button>
                        </>
                      )}

                      {/* View / Print Proposal Tax Invoice */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectInvoice(inv)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-[#006937] hover:bg-emerald-50 rounded-lg"
                        title="View & Print Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {/* Send Invoice to Client */}
                      {inv.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSendInvoice(inv)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Send to Client"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}

                      {/* Delete (Draft only) */}
                      {!isPaid && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteInvoice(inv)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{invoices.length}</span> commercial invoices
          {selectedIds.length > 0 && (
            <span className="ml-2 font-medium text-[#006937] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {selectedIds.length} selected
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <span className="text-xs font-semibold text-slate-700 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 text-xs font-semibold"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
