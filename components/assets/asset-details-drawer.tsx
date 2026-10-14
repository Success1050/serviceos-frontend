"use client";

import React, { useState } from "react";
import { Asset, AssetStatus } from "@/lib/types";
import { formatDate, getWarrantyStatus } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";
import {
  X,
  Wrench,
  Cpu,
  Sun,
  BatteryCharging,
  Zap,
  Wind,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
} from "lucide-react";

interface AssetDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export function AssetDetailsDrawer({
  isOpen,
  onClose,
  asset,
  onEdit,
  onDelete,
}: AssetDetailsDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "warranty" | "site">("specs");

  if (!isOpen || !asset) return null;

  const handleCopySerial = () => {
    if (!asset.serialNumber) return;
    navigator.clipboard.writeText(asset.serialNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getHardwareIcon = (name: string, manufacturer?: string | null) => {
    const text = `${name} ${manufacturer || ""}`.toLowerCase();
    if (text.includes("solar") || text.includes("panel") || text.includes("pv") || text.includes("jinko")) {
      return <Sun className="w-5 h-5 text-amber-500" />;
    }
    if (text.includes("battery") || text.includes("storage") || text.includes("lithium") || text.includes("bess")) {
      return <BatteryCharging className="w-5 h-5 text-emerald-500" />;
    }
    if (text.includes("generator") || text.includes("diesel") || text.includes("genset")) {
      return <Zap className="w-5 h-5 text-orange-500" />;
    }
    if (text.includes("hvac") || text.includes("ac") || text.includes("air") || text.includes("chiller")) {
      return <Wind className="w-5 h-5 text-sky-500" />;
    }
    return <Cpu className="w-5 h-5 text-[#006937]" />;
  };

  const warranty = getWarrantyStatus(asset.warrantyExpiresAt);

  // Calculate elapsed warranty progress
  let progressPct = 0;
  if (asset.installDate && asset.warrantyExpiresAt) {
    const start = new Date(asset.installDate).getTime();
    const end = new Date(asset.warrantyExpiresAt).getTime();
    const now = Date.now();
    if (end > start) {
      progressPct = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
    }
  }

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
                Hardware Asset Dossier
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-lg font-bold shadow-xs shrink-0">
                {getHardwareIcon(asset.name, asset.manufacturer)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-slate-900 truncate">{asset.name}</h2>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      asset.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : asset.status === "MAINTENANCE"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        asset.status === "ACTIVE"
                          ? "bg-emerald-500 animate-pulse"
                          : asset.status === "MAINTENANCE"
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {asset.status}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {asset.manufacturer || "Generic"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(asset)}
                className="flex-1 text-xs h-8 border-slate-200 hover:bg-slate-100 text-slate-700"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1 text-sky-600" />
                Edit Asset
              </Button>
              {asset.warrantyDocumentUrl && (
                <a
                  href={asset.warrantyDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-3 h-8 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Warranty Doc
                </a>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(asset)}
                className="text-xs h-8 px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                title="Delete Asset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 px-6 bg-white">
            <button
              onClick={() => setActiveTab("specs")}
              className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-all ${
                activeTab === "specs"
                  ? "border-[#006937] text-[#006937]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Hardware Specs
            </button>
            <button
              onClick={() => setActiveTab("warranty")}
              className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-all flex items-center gap-1.5 ${
                activeTab === "warranty"
                  ? "border-[#006937] text-[#006937]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Warranty Cycle
              {warranty.isExpiringSoon && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("site")}
              className={`py-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === "site"
                  ? "border-[#006937] text-[#006937]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Assigned Site
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === "specs" && (
              <div className="space-y-4">
                {/* Serial Number Banner */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Serial Number
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {asset.serialNumber || "None recorded"}
                    </span>
                  </div>
                  {asset.serialNumber && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopySerial}
                      className="h-8 px-2.5 text-xs text-slate-600 hover:text-[#006937] hover:bg-emerald-50"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copy S/N
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Technical Specifications */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Specifications
                  </h4>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white overflow-hidden text-xs">
                    <div className="px-3.5 py-2.5 flex justify-between">
                      <span className="text-slate-500">Manufacturer</span>
                      <span className="font-semibold text-slate-900">
                        {asset.manufacturer || "Generic"}
                      </span>
                    </div>
                    <div className="px-3.5 py-2.5 flex justify-between">
                      <span className="text-slate-500">Model Number</span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {asset.modelNumber || "N/A"}
                      </span>
                    </div>
                    <div className="px-3.5 py-2.5 flex justify-between">
                      <span className="text-slate-500">Installed Date</span>
                      <span className="font-semibold text-slate-900">
                        {formatDate(asset.installDate, "medium")}
                      </span>
                    </div>
                    <div className="px-3.5 py-2.5 flex justify-between">
                      <span className="text-slate-500">System Asset ID</span>
                      <span className="font-mono text-[11px] text-slate-600">
                        {asset.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operational Counts */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    Service Record Activity
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-xs text-slate-400 block font-medium">Requests</span>
                      <span className="text-base font-bold text-slate-900">
                        {asset._count?.serviceRequests || 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-xs text-slate-400 block font-medium">Schedules</span>
                      <span className="text-base font-bold text-slate-900">
                        {asset._count?.maintenanceSchedules || 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-xs text-slate-400 block font-medium">Tickets</span>
                      <span className="text-base font-bold text-slate-900">
                        {asset._count?.supportTickets || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "warranty" && (
              <div className="space-y-4">
                {/* Hero Warranty Card */}
                <div
                  className={`p-4 rounded-xl border ${
                    warranty.variant === "success"
                      ? "bg-emerald-50/60 border-emerald-200"
                      : warranty.variant === "warning"
                      ? "bg-amber-50/60 border-amber-200"
                      : warranty.variant === "danger"
                      ? "bg-rose-50/60 border-rose-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {warranty.variant === "success" ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ) : warranty.variant === "warning" ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      )}
                      Warranty Status
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        warranty.variant === "success"
                          ? "bg-emerald-600 text-white"
                          : warranty.variant === "warning"
                          ? "bg-amber-600 text-white"
                          : warranty.variant === "danger"
                          ? "bg-rose-600 text-white"
                          : "bg-slate-400 text-white"
                      }`}
                    >
                      {warranty.label}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 mt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Installation Date:</span>
                      <span className="font-semibold text-slate-900">
                        {formatDate(asset.installDate, "medium")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expiration Date:</span>
                      <span className="font-semibold text-slate-900">
                        {formatDate(asset.warrantyExpiresAt, "medium")}
                      </span>
                    </div>
                  </div>

                  {asset.installDate && asset.warrantyExpiresAt && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-medium">
                        <span>Elapsed Lifespan</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            progressPct >= 90
                              ? "bg-rose-500"
                              : progressPct >= 75
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Certificate Attachment */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Warranty Certificate & Documents
                  </h4>
                  {asset.warrantyDocumentUrl ? (
                    <a
                      href={asset.warrantyDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#006937] flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#006937] transition-colors">
                            Warranty Certificate PDF
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[220px]">
                            {asset.warrantyDocumentUrl}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#006937]" />
                    </a>
                  ) : (
                    <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-200">
                      <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-700">No Document Attached</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Edit this asset to attach a PDF warranty deed or installation sign-off.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "site" && (
              <div className="space-y-4">
                {asset.customerRecord ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#006937] flex items-center justify-center font-bold text-sm">
                        {asset.customerRecord.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {asset.customerRecord.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Customer ID: {asset.customerRecord.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                      {asset.customerRecord.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a
                            href={`tel:${asset.customerRecord.phone}`}
                            className="hover:underline text-slate-800"
                          >
                            {asset.customerRecord.phone}
                          </a>
                        </div>
                      )}
                      {asset.customerRecord.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a
                            href={`mailto:${asset.customerRecord.email}`}
                            className="hover:underline text-slate-800"
                          >
                            {asset.customerRecord.email}
                          </a>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {asset.customerRecord.address
                            ? `${asset.customerRecord.address}${
                                asset.customerRecord.city ? `, ${asset.customerRecord.city}` : ""
                              }`
                            : asset.customerRecord.city || "No street address recorded"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl border border-dashed border-slate-200">
                    <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Unassigned Hardware</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      This component is not currently assigned to any customer installation site.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
