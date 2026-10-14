"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/api/client";
import { Asset, CustomerRecord, AssetStatus } from "@/lib/types";
import { getWarrantyStatus } from "@/lib/utils";
import { Button, Input, Dialog } from "@/components/ui";
import {
  Wrench,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileText,
  User,
  Barcode,
} from "lucide-react";

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onAssetUpdated: (asset: Asset) => void;
  customers?: CustomerRecord[];
}

export function EditAssetModal({
  isOpen,
  onClose,
  asset,
  onAssetUpdated,
  customers = [],
}: EditAssetModalProps) {
  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [installDate, setInstallDate] = useState("");
  const [warrantyExpiresAt, setWarrantyExpiresAt] = useState("");
  const [warrantyDocumentUrl, setWarrantyDocumentUrl] = useState("");
  const [status, setStatus] = useState<AssetStatus>("ACTIVE");
  const [customerRecordId, setCustomerRecordId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (asset) {
      setName(asset.name || "");
      setManufacturer(asset.manufacturer || "");
      setModelNumber(asset.modelNumber || "");
      setSerialNumber(asset.serialNumber || "");
      setInstallDate(asset.installDate ? asset.installDate.split("T")[0] : "");
      setWarrantyExpiresAt(
        asset.warrantyExpiresAt ? asset.warrantyExpiresAt.split("T")[0] : ""
      );
      setWarrantyDocumentUrl(asset.warrantyDocumentUrl || "");
      setStatus(asset.status || "ACTIVE");
      setCustomerRecordId(asset.customerRecordId || "");
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please specify the equipment name.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        manufacturer: manufacturer.trim() || undefined,
        modelNumber: modelNumber.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        installDate: installDate ? new Date(installDate).toISOString() : undefined,
        warrantyExpiresAt: warrantyExpiresAt
          ? new Date(warrantyExpiresAt).toISOString()
          : undefined,
        warrantyDocumentUrl: warrantyDocumentUrl.trim() || undefined,
        status,
        customerRecordId: customerRecordId || undefined,
      };

      const res = await apiClient.patch(`/assets/${asset.id}`, payload);
      onAssetUpdated(res.data);
      onClose();
    } catch (err: any) {
      console.error("Failed to update asset:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update asset. Please check the fields and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentWarranty = getWarrantyStatus(warrantyExpiresAt);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Hardware Asset"
      description={`Update specifications and warranty records for ${asset.name}.`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Assigned Customer */}
        {customers.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Customer / Site
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={customerRecordId}
                onChange={(e) => setCustomerRecordId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937]"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.city ? `(${c.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Name & Manufacturer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Equipment / System Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 10kVA Hybrid Inverter"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Manufacturer / Brand
            </label>
            <Input
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g. Deye, Victron, Growatt"
            />
          </div>
        </div>

        {/* Model & Serial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Model Number
            </label>
            <Input
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              placeholder="e.g. SUN-10K-SG04LP3"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Serial Number
            </label>
            <Input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. DEYE-2026-88192"
              className="font-mono text-xs"
            />
          </div>
        </div>

        {/* Dates & Warranty */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#006937]" />
              Warranty Cycle
            </span>
            {warrantyExpiresAt && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  currentWarranty.variant === "success"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : currentWarranty.variant === "warning"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {currentWarranty.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Installation Date
              </label>
              <Input
                type="date"
                value={installDate}
                onChange={(e) => setInstallDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Warranty Expiration Date
              </label>
              <Input
                type="date"
                value={warrantyExpiresAt}
                onChange={(e) => setWarrantyExpiresAt(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Document URL & Operational Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Warranty Document URL
            </label>
            <Input
              value={warrantyDocumentUrl}
              onChange={(e) => setWarrantyDocumentUrl(e.target.value)}
              placeholder="https://cloud.storage/warranty.pdf"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AssetStatus)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937]"
            >
              <option value="ACTIVE">ACTIVE - Operating Normally</option>
              <option value="MAINTENANCE">MAINTENANCE - In Repair / Servicing</option>
              <option value="INACTIVE">INACTIVE - Decommissioned / Idle</option>
            </select>
          </div>
        </div>

        {/* Action Buttons Sticky Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 -mx-6 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-semibold px-4 h-9"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[130px] text-xs font-semibold bg-[#006937] hover:bg-[#004D28] text-white shadow-sm h-9"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

