"use client";

import React, { useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api/client";
import { CustomerRecord, PortalStatus } from "@/lib/types";
import { formatCurrency, formatDate, getWarrantyStatus } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";

import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Clock,
  AlertCircle,
  Wrench,
  FileText,
  CreditCard,
  Briefcase,
  ExternalLink,
  Send,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface CustomerDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord | null;
  onInviteGenerated: (plainToken: string) => void;
}

export function CustomerDetailsDrawer({
  isOpen,
  onClose,
  customer,
  onInviteGenerated,
}: CustomerDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "assets" | "activity">("overview");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleGenerateInvite = async () => {
    setInviting(true);
    setInviteError(null);
    try {
      const res = await apiClient.post(`/customers/${customer.id}/invite`);
      if (res.data?.plainToken) {
        onInviteGenerated(res.data.plainToken);
      }
    } catch (err: any) {
      console.error("Invite error:", err);
      setInviteError(
        err.response?.data?.message || err.message || "Failed to generate invite token"
      );
    } finally {
      setInviting(false);
    }
  };

  const getStatusBadge = (status: PortalStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Portal Active
          </Badge>
        );
      case "INVITATION_PENDING":
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 gap-1 font-semibold">
            <Clock className="w-3 h-3 text-amber-600" />
            Invitation Pending
          </Badge>
        );
      case "NOT_ACTIVATED":
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 border border-slate-200 gap-1 font-semibold">
            <AlertCircle className="w-3 h-3 text-slate-500" />
            Not Activated
          </Badge>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          {/* Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Customer Dossier
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006937] to-[#10B981] flex items-center justify-center text-white text-lg font-bold shadow-md shadow-emerald-900/10 shrink-0">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">{customer.name}</h2>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  {getStatusBadge(customer.portalStatus)}
                  <span className="text-xs text-slate-400">
                    Joined {formatDate(customer.createdAt, "short")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center gap-2">
              <Button
                size="sm"
                isLoading={inviting}
                onClick={handleGenerateInvite}
                className="flex-1 bg-[#006937] hover:bg-[#004D28] text-white text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                {customer.portalStatus === "ACTIVE" ? "Regenerate Portal Token" : "Send Portal Invite"}
              </Button>
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center justify-center"
                  title="Call Customer"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
            </div>

            {inviteError && (
              <p className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                {inviteError}
              </p>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-white px-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-colors ${
                activeTab === "overview"
                  ? "border-[#006937] text-[#006937]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("assets")}
              className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-colors ${
                activeTab === "assets"
                  ? "border-[#006937] text-[#006937]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Solar & Equipment ({customer.assets?.length || customer._count?.assets || 0})
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "activity"
                  ? "border-[#006937] text-[#006937]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Billing & Jobs
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-5">
                {/* Contact Information */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Contact & Address
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Phone</p>
                        <p className="text-xs font-semibold text-slate-800">
                          {customer.phone || "Not recorded"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Email</p>
                        <p className="text-xs font-semibold text-slate-800">
                          {customer.email || "Not recorded"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">
                          Installation Location
                        </p>
                        <p className="text-xs font-semibold text-slate-800">
                          {customer.address
                            ? `${customer.address}${customer.city ? `, ${customer.city}` : ""}`
                            : customer.city || "No address assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Stats */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Engagement Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Wrench className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Assets</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {customer.assets?.length || customer._count?.assets || 0}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Jobs</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {customer.jobs?.length || customer._count?.jobs || 0}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Quotes</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {customer.quotes?.length || customer._count?.quotes || 0}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Invoices</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {customer.invoices?.length || customer._count?.invoices || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Internal ID Info */}
                <div className="p-3 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-[11px] text-slate-400 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-600">Customer ID:</span>{" "}
                    <code className="text-slate-500 font-mono">{customer.id}</code>
                  </p>
                  <p>
                    <span className="font-semibold text-slate-600">Created:</span>{" "}
                    {formatDate(customer.createdAt, "full")}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "assets" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Equipment ({customer.assets?.length || 0})
                  </span>
                  <Link
                    href="/app/assets"
                    className="text-[11px] font-semibold text-[#006937] hover:underline flex items-center gap-1"
                  >
                    Open Asset Registry <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {customer.assets && customer.assets.length > 0 ? (
                  customer.assets.map((asset: any) => {
                    const warranty = getWarrantyStatus(asset.warrantyExpiresAt);
                    return (
                      <div
                        key={asset.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{asset.name}</h4>
                            <p className="text-[11px] text-slate-500">
                              {asset.manufacturer || "Generic"} · Model: {asset.modelNumber || "N/A"}
                            </p>
                          </div>
                          <Badge
                            variant={asset.status === "ACTIVE" ? "success" : "neutral"}
                            className="text-[10px]"
                          >
                            {asset.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          {asset.serialNumber ? (
                            <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              S/N: {asset.serialNumber}
                            </span>
                          ) : (
                            <span />
                          )}
                          {asset.warrantyExpiresAt && (
                            <span
                              className={`font-semibold px-2 py-0.5 rounded-full ${
                                warranty.variant === "success"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : warranty.variant === "warning"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {warranty.shortLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200">
                    <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No Assets Registered</p>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3">
                      Solar arrays, hybrid inverters, or battery storage will appear here once
                      assigned.
                    </p>
                    <Link
                      href="/app/assets"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#006937] text-white hover:bg-[#004D28] transition-colors"
                    >
                      Go to Asset Registry
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Invoices</h4>
                  {customer.invoices && customer.invoices.length > 0 ? (
                    <div className="space-y-2">
                      {customer.invoices.map((inv: any) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs border border-slate-100"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {inv.invoiceNumber || inv.id.slice(0, 8)}
                            </p>
                            <p className="text-[10px] text-slate-400">{formatDate(inv.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">{formatCurrency(inv.total)}</p>
                            <Badge className="text-[9px]">{inv.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No invoices recorded yet</p>
                  )}
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Jobs</h4>
                  {customer.jobs && customer.jobs.length > 0 ? (
                    <div className="space-y-2">
                      {customer.jobs.map((job: any) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs border border-slate-100"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">{job.title}</p>
                            <p className="text-[10px] text-slate-400">{formatDate(job.createdAt)}</p>
                          </div>
                          <Badge className="text-[9px]">{job.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No field jobs logged yet</p>
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
