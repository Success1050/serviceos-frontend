"use client";

import React, { useState } from "react";
import { Quote, QuoteStatus, BillingType } from "@/lib/types";
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
  FileText,
  Send,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  PlusCircle,
  Layers,
  Sparkles,
  Printer,
  Receipt,
} from "lucide-react";

interface QuoteTableProps {
  quotes: Quote[];
  isLoading: boolean;
  onSelectQuote: (quote: Quote) => void;
  onEditQuote: (quote: Quote) => void;
  onSendQuote: (quote: Quote) => void;
  onDeleteQuote: (quote: Quote) => void;
  onConvertToInvoice?: (quote: Quote) => void;
  onAddNew: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export function QuoteTable({
  quotes,
  isLoading,
  onSelectQuote,
  onEditQuote,
  onSendQuote,
  onDeleteQuote,
  onConvertToInvoice,
  onAddNew,
  currentPage,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: QuoteTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allSelected = quotes.length > 0 && selectedIds.length === quotes.length;

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderStatusBadge = (status: QuoteStatus) => {
    switch (status) {
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
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
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted / Signed
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Declined
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Expired
          </span>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const renderBillingTypeBadge = (type: BillingType) => {
    switch (type) {
      case "MILESTONE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Layers className="w-3 h-3" />
            Milestone (Tranches)
          </span>
        );
      case "AUTH_AND_CAPTURE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Hold & Capture
          </span>
        );
      case "FIXED":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Fixed Scope
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-700">Loading commercial quotes...</p>
        <p className="text-xs text-slate-400 mt-1">Retrieving system proposals and pricing line items</p>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#006937] flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Proposals or Quotes Found</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          Generate professional solar and service installation quotes with line items, milestone tranches, VAT calculations, and digital acceptance.
        </p>
        <Button onClick={onAddNew} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Create First Quote
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
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-300 text-[#006937] focus:ring-[#006937]"
                />
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Quote & Proposal Title
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Client & Site Location
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider text-right">
                Grand Total
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Billing Model
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Date Issued
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {quotes.map((quote) => {
              const isChecked = selectedIds.includes(quote.id);
              const customerName = quote.customerRecord?.name || "Unassigned Customer";
              const siteAddress = quote.customerRecord?.address
                ? `${quote.customerRecord.address}${quote.customerRecord.city ? `, ${quote.customerRecord.city}` : ""}`
                : quote.customerRecord?.city || "Site not specified";

              const numericAmount =
                typeof quote.amount === "number"
                  ? quote.amount
                  : parseFloat(String(quote.amount)) || 0;

              return (
                <TableRow
                  key={quote.id}
                  className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                    isChecked ? "bg-emerald-50/30" : ""
                  }`}
                  onClick={() => onSelectQuote(quote)}
                >
                  <TableCell
                    className="text-center py-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(quote.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-[#006937] focus:ring-[#006937]"
                    />
                  </TableCell>

                  {/* Quote Title & ID */}
                  <TableCell className="py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#006937] border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#006937] transition-colors truncate max-w-[240px]">
                          {quote.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                          <span>Q-{quote.id.slice(0, 8).toUpperCase()}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(e, quote.id)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                            title="Copy Quote ID"
                          >
                            {copiedId === quote.id ? (
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

                  {/* Grand Total Amount */}
                  <TableCell className="py-4 text-right">
                    <span className="text-sm font-bold text-slate-900 block">
                      {formatCurrency(numericAmount)}
                    </span>
                    {quote.milestones && quote.milestones.length > 0 && (
                      <span className="text-[10px] text-indigo-600 font-medium">
                        {quote.milestones.length} Tranches
                      </span>
                    )}
                  </TableCell>

                  {/* Billing Model */}
                  <TableCell className="py-4">
                    {renderBillingTypeBadge(quote.billingType)}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="py-4">
                    {renderStatusBadge(quote.status)}
                  </TableCell>

                  {/* Date Issued */}
                  <TableCell className="py-4 text-xs text-slate-500">
                    {formatDate(quote.createdAt, "medium")}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectQuote(quote)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-[#006937] hover:bg-emerald-50 rounded-lg"
                        title="View Proposal & Print PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {onConvertToInvoice && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onConvertToInvoice(quote)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          title="Convert Quote to Invoice"
                        >
                          <Receipt className="w-4 h-4 text-emerald-600" />
                        </Button>
                      )}

                      {quote.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onSendQuote(quote)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Send Proposal to Client"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditQuote(quote)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                        title="Edit Quote"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteQuote(quote)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Quote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
          Showing <span className="font-semibold text-slate-700">{quotes.length}</span> commercial quotes
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
            className="h-8 px-3 text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Previous
          </Button>
          <span className="text-xs text-slate-600 font-medium px-2">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 px-3 text-xs"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
