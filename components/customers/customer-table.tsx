"use client";

import React, { useState } from "react";
import { CustomerRecord, PortalStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
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
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Wrench,
  FileText,
  CreditCard,
  Briefcase,
  Send,
  Eye,
} from "lucide-react";

interface CustomerTableProps {
  customers: CustomerRecord[];
  isLoading: boolean;
  onSelectCustomer: (customer: CustomerRecord) => void;
  onInviteCustomer: (customer: CustomerRecord) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export function CustomerTable({
  customers,
  isLoading,
  onSelectCustomer,
  onInviteCustomer,
  currentPage,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: CustomerTableProps) {
  const allSelected = customers.length > 0 && selectedIds.length === customers.length;

  const renderStatusBadge = (status: PortalStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Portal Active
          </span>
        );
      case "INVITATION_PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Invite Pending
          </span>
        );
      case "NOT_ACTIVATED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Not Activated
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="h-6 bg-slate-100 rounded-md w-48 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#006937] flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Customers Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No records match your active search filters. Add a new customer or import a spreadsheet to populate your directory.
        </p>
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
                Customer Name
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Contact & Phone
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Location
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Portal Status
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                Linked Assets & Activity
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {customers.map((cust) => {
              const isChecked = selectedIds.includes(cust.id);
              const initials = cust.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const assetCount = cust.assets?.length ?? cust._count?.assets ?? 0;
              const jobCount = cust.jobs?.length ?? cust._count?.jobs ?? 0;
              const quoteCount = cust.quotes?.length ?? cust._count?.quotes ?? 0;
              const invoiceCount = cust.invoices?.length ?? cust._count?.invoices ?? 0;

              return (
                <TableRow
                  key={cust.id}
                  className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                    isChecked ? "bg-emerald-50/30" : ""
                  }`}
                  onClick={() => onSelectCustomer(cust)}
                >
                  <TableCell
                    className="text-center py-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(cust.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSelect(cust.id)}
                      className="rounded border-slate-300 text-[#006937] focus:ring-[#006937]"
                    />
                  </TableCell>

                  {/* Customer Identity */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006937]/10 to-[#10B981]/20 text-[#006937] flex items-center justify-center font-bold text-xs shrink-0 border border-[#006937]/10">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-[#006937] transition-colors truncate block">
                          {cust.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Added {formatDate(cust.createdAt, "short")}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact Info */}
                  <TableCell className="py-4 text-xs">
                    <div className="space-y-0.5">
                      {cust.phone ? (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{cust.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No phone</span>
                      )}
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{cust.email}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Location */}
                  <TableCell className="py-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {cust.city || cust.address || "Unassigned"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Portal Status */}
                  <TableCell className="py-4">
                    {renderStatusBadge(cust.portalStatus)}
                  </TableCell>

                  {/* Activity & Equipment Counters */}
                  <TableCell className="py-4 text-center">
                    <div className="inline-flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                      <span
                        className="flex items-center gap-1 text-slate-600"
                        title={`${assetCount} Installed Assets`}
                      >
                        <Wrench className="w-3 h-3 text-emerald-600" />
                        <span className="font-semibold">{assetCount}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className="flex items-center gap-1 text-slate-600"
                        title={`${jobCount} Field Jobs`}
                      >
                        <Briefcase className="w-3 h-3 text-sky-600" />
                        <span className="font-semibold">{jobCount}</span>
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className="flex items-center gap-1 text-slate-600"
                        title={`${invoiceCount} Invoices`}
                      >
                        <CreditCard className="w-3 h-3 text-amber-600" />
                        <span className="font-semibold">{invoiceCount}</span>
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onInviteCustomer(cust)}
                        className="h-8 text-xs font-semibold text-[#006937] hover:text-[#004D28] hover:bg-emerald-50 border-emerald-200"
                        title="Generate Single-Use Portal Invite"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {cust.portalStatus === "ACTIVE" ? "Re-invite" : "Invite"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectCustomer(cust)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Showing page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
          <span className="font-bold text-slate-800">{Math.max(totalPages, 1)}</span>
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 text-xs"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
