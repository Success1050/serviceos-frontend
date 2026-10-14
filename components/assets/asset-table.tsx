"use client";

import React, { useState } from "react";
import { Asset, AssetStatus } from "@/lib/types";
import { formatDate, getWarrantyStatus } from "@/lib/utils";
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
  Wrench,
  Cpu,
  Sun,
  BatteryCharging,
  Zap,
  Wind,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  User,
  PlusCircle,
} from "lucide-react";

interface AssetTableProps {
  assets: Asset[];
  isLoading: boolean;
  onSelectAsset: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (asset: Asset) => void;
  onAddNew: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export function AssetTable({
  assets,
  isLoading,
  onSelectAsset,
  onEditAsset,
  onDeleteAsset,
  onAddNew,
  currentPage,
  totalPages,
  onPageChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: AssetTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allSelected = assets.length > 0 && selectedIds.length === assets.length;

  const handleCopySerial = (e: React.MouseEvent, serial: string, id: string) => {
    e.stopPropagation();
    if (!serial) return;
    navigator.clipboard.writeText(serial);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getHardwareIcon = (name: string, manufacturer?: string | null) => {
    const text = `${name} ${manufacturer || ""}`.toLowerCase();
    if (text.includes("solar") || text.includes("panel") || text.includes("pv") || text.includes("jinko")) {
      return <Sun className="w-4 h-4 text-amber-500" />;
    }
    if (text.includes("battery") || text.includes("storage") || text.includes("lithium") || text.includes("bess")) {
      return <BatteryCharging className="w-4 h-4 text-emerald-500" />;
    }
    if (text.includes("generator") || text.includes("diesel") || text.includes("genset")) {
      return <Zap className="w-4 h-4 text-orange-500" />;
    }
    if (text.includes("hvac") || text.includes("ac") || text.includes("air") || text.includes("chiller")) {
      return <Wind className="w-4 h-4 text-sky-500" />;
    }
    return <Cpu className="w-4 h-4 text-[#006937]" />;
  };

  const renderStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            In Maintenance
          </span>
        );
      case "INACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Inactive
          </span>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const renderWarrantyBadge = (expiryDate?: string | null) => {
    const warranty = getWarrantyStatus(expiryDate);

    switch (warranty.status) {
      case "ACTIVE":
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              {warranty.label}
            </span>
            <span className="text-[10px] text-slate-400 pl-1">
              Until {formatDate(expiryDate, "short")}
            </span>
          </div>
        );
      case "EXPIRING_SOON":
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
              {warranty.label}
            </span>
            <span className="text-[10px] text-amber-600/80 pl-1">
              Expires {formatDate(expiryDate, "short")}
            </span>
          </div>
        );
      case "EXPIRED":
        return (
          <div className="flex flex-col items-start gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
              {warranty.label}
            </span>
            <span className="text-[10px] text-rose-400 pl-1">
              Lapsed {formatDate(expiryDate, "short")}
            </span>
          </div>
        );
      default:
        return (
          <span className="text-[11px] text-slate-400 italic">
            No Warranty
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-700">Loading hardware assets...</p>
        <p className="text-xs text-slate-400 mt-1">Retrieving system components and warranty records</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#006937] flex items-center justify-center mb-4">
          <Wrench className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Hardware Assets Found</h3>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          Register solar inverters, PV modules, battery energy storage systems, and generators to track lifetime warranties and dispatch maintenance.
        </p>
        <Button onClick={onAddNew} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Register First Asset
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
                Equipment & System
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Manufacturer / Model
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Serial Number
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Assigned Customer & Site
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Installed
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Warranty Protection
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Status
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-600 uppercase tracking-wider text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {assets.map((asset) => {
              const isChecked = selectedIds.includes(asset.id);
              const customerName = asset.customerRecord?.name || "Unassigned";
              const siteAddress = asset.customerRecord?.address
                ? `${asset.customerRecord.address}${asset.customerRecord.city ? `, ${asset.customerRecord.city}` : ""}`
                : asset.customerRecord?.city || "No site specified";

              return (
                <TableRow
                  key={asset.id}
                  className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${
                    isChecked ? "bg-emerald-50/30" : ""
                  }`}
                  onClick={() => onSelectAsset(asset)}
                >
                  <TableCell
                    className="text-center py-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(asset.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-[#006937] focus:ring-[#006937]"
                    />
                  </TableCell>

                  {/* Equipment Name */}
                  <TableCell className="py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {getHardwareIcon(asset.name, asset.manufacturer)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-[#006937] transition-colors truncate">
                          {asset.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          ID: {asset.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Manufacturer & Model */}
                  <TableCell className="py-4">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-800 block">
                        {asset.manufacturer || "Generic"}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                        {asset.modelNumber || "Model unspecified"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Serial Number */}
                  <TableCell className="py-4">
                    {asset.serialNumber ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/80 border border-slate-200 font-mono text-xs text-slate-700">
                        <span>{asset.serialNumber}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopySerial(e, asset.serialNumber!, asset.id)}
                          className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded"
                          title="Copy Serial Number"
                        >
                          {copiedId === asset.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No S/N</span>
                    )}
                  </TableCell>

                  {/* Customer & Location */}
                  <TableCell className="py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{customerName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{siteAddress}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Installed Date */}
                  <TableCell className="py-4 text-xs text-slate-600">
                    {formatDate(asset.installDate, "medium")}
                  </TableCell>

                  {/* Warranty Status */}
                  <TableCell className="py-4">
                    {renderWarrantyBadge(asset.warrantyExpiresAt)}
                  </TableCell>

                  {/* Operational Status */}
                  <TableCell className="py-4">
                    {renderStatusBadge(asset.status)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelectAsset(asset)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-[#006937] hover:bg-emerald-50 rounded-lg"
                        title="View Asset Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditAsset(asset)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                        title="Edit Asset"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteAsset(asset)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Asset"
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
          Showing <span className="font-semibold text-slate-700">{assets.length}</span> hardware units
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
