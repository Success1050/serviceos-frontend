"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/lib/api/client";
import { Asset, CustomerRecord, AssetStatus } from "@/lib/types";
import { formatDate, getWarrantyStatus } from "@/lib/utils";
import { Button, Input, Dialog } from "@/components/ui";
import {
  Wrench,
  Cpu,
  Sun,
  BatteryCharging,
  Zap,
  Wind,
  ShieldCheck,
  Calendar,
  Barcode,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building,
} from "lucide-react";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetCreated: (asset: Asset) => void;
  customers?: CustomerRecord[];
  preselectedCustomerId?: string;
}

const SYSTEM_TYPE_PRESETS = [
  { label: "Hybrid Solar Inverter", defaultManufacturer: "Deye", defaultWarrantyYears: 5 },
  { label: "Solar PV Rooftop Array", defaultManufacturer: "Jinko Solar", defaultWarrantyYears: 25 },
  { label: "Lithium Battery Storage (BESS)", defaultManufacturer: "Felicity Solar", defaultWarrantyYears: 10 },
  { label: "Diesel / Gas Backup Generator", defaultManufacturer: "Mikano", defaultWarrantyYears: 2 },
  { label: "Commercial HVAC / Chiller", defaultManufacturer: "Daikin", defaultWarrantyYears: 3 },
  { label: "Industrial UPS & Conditioner", defaultManufacturer: "Schneider Electric", defaultWarrantyYears: 3 },
];

const MANUFACTURER_PRESETS = [
  "Deye",
  "Victron Energy",
  "Growatt",
  "Felicity Solar",
  "Jinko Solar",
  "Huawei FusionSolar",
  "Schneider Electric",
  "Daikin",
  "Carrier",
  "Mikano",
  "Custom / Other",
];

const WARRANTY_OPTIONS = [
  { label: "6 Months", months: 6 },
  { label: "1 Year", months: 12 },
  { label: "2 Years", months: 24 },
  { label: "3 Years", months: 36 },
  { label: "5 Years", months: 60 },
  { label: "10 Years", months: 120 },
  { label: "25 Years", months: 300 },
  { label: "No Warranty", months: 0 },
];

export function AddAssetModal({
  isOpen,
  onClose,
  onAssetCreated,
  customers: initialCustomers,
  preselectedCustomerId,
}: AddAssetModalProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers || []);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || "");
  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("Deye");
  const [customManufacturer, setCustomManufacturer] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [installDate, setInstallDate] = useState(new Date().toISOString().split("T")[0]);
  const [warrantyMonths, setWarrantyMonths] = useState<number>(60);
  const [warrantyExpiresAt, setWarrantyExpiresAt] = useState<string>("");
  const [warrantyDocumentUrl, setWarrantyDocumentUrl] = useState("");
  const [status, setStatus] = useState<AssetStatus>("ACTIVE");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Fetch customers if not provided
  useEffect(() => {
    if (isOpen && (!customers || customers.length === 0)) {
      setLoadingCustomers(true);
      apiClient
        .get("/customers?limit=100")
        .then((res) => {
          const list = res.data?.items || (Array.isArray(res.data) ? res.data : []);
          setCustomers(list);
          if (list.length > 0 && !selectedCustomerId) {
            setSelectedCustomerId(list[0].id);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch customers for asset modal:", err);
        })
        .finally(() => setLoadingCustomers(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedCustomerId) {
      setSelectedCustomerId(preselectedCustomerId);
    }
  }, [preselectedCustomerId]);

  // Auto-calculate expiration date based on installDate and warrantyMonths
  useEffect(() => {
    if (warrantyMonths === 0) {
      setWarrantyExpiresAt("");
      return;
    }
    const baseDate = installDate ? new Date(installDate) : new Date();
    if (isNaN(baseDate.getTime())) return;

    const expiry = new Date(baseDate);
    expiry.setMonth(expiry.getMonth() + warrantyMonths);
    setWarrantyExpiresAt(expiry.toISOString().split("T")[0]);
  }, [installDate, warrantyMonths]);

  const handleApplyPreset = (preset: typeof SYSTEM_TYPE_PRESETS[0]) => {
    setName(preset.label);
    setManufacturer(preset.defaultManufacturer);
    setWarrantyMonths(preset.defaultWarrantyYears * 12);
  };

  const handleSimulateBarcodeScan = () => {
    const prefix = (manufacturer || "EQ").slice(0, 4).toUpperCase();
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const simulated = `${prefix}-${year}-${randomHex}`;
    setSerialNumber(simulated);
    setScanSuccess(true);
    setTimeout(() => setScanSuccess(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError("Please select a customer to link this hardware equipment to.");
      return;
    }

    if (!name.trim()) {
      setError("Please specify the equipment or system name.");
      return;
    }

    setLoading(true);

    try {
      const finalManufacturer =
        manufacturer === "Custom / Other" ? customManufacturer.trim() : manufacturer;

      const payload = {
        name: name.trim(),
        manufacturer: finalManufacturer || undefined,
        modelNumber: modelNumber.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        installDate: installDate ? new Date(installDate).toISOString() : undefined,
        warrantyExpiresAt: warrantyExpiresAt ? new Date(warrantyExpiresAt).toISOString() : undefined,
        warrantyDocumentUrl: warrantyDocumentUrl.trim() || undefined,
        status,
        customerRecordId: selectedCustomerId,
      };

      const res = await apiClient.post("/assets", payload);
      const createdAsset = res.data;

      onAssetCreated(createdAsset);
      onClose();
      // Reset form
      setName("");
      setModelNumber("");
      setSerialNumber("");
      setWarrantyDocumentUrl("");
    } catch (err: any) {
      console.error("Failed to create asset:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to register hardware asset. Please check the fields and try again."
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
      title="Register Hardware Asset"
      description="Add an inverter, solar array, battery bank, or generator with automated warranty tracking."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* System Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Quick System Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SYSTEM_TYPE_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  name === p.label
                    ? "bg-[#006937] text-white border-[#006937] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Linkage */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Assigned Customer & Installation Site <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              disabled={loadingCustomers}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
            >
              <option value="">-- Choose a customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.city ? `(${c.city})` : ""} {c.phone ? `· ${c.phone}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hardware Name & Manufacturer */}
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
            <select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
            >
              {MANUFACTURER_PRESETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {manufacturer === "Custom / Other" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Specify Brand Name
            </label>
            <Input
              value={customManufacturer}
              onChange={(e) => setCustomManufacturer(e.target.value)}
              placeholder="Enter brand name"
            />
          </div>
        )}

        {/* Model & Serial with Barcode Scanner Simulator */}
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Serial Number
              </label>
              <button
                type="button"
                onClick={handleSimulateBarcodeScan}
                className="text-[11px] font-semibold text-[#006937] hover:underline flex items-center gap-1"
              >
                <Barcode className="w-3.5 h-3.5" />
                {scanSuccess ? "Scanned!" : "Simulate QR/Barcode Scan"}
              </button>
            </div>
            <div className="relative">
              <Input
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. DEYE-2026-88192"
                className="font-mono text-xs"
              />
              {scanSuccess && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 flex items-center gap-1 bg-white pl-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Scanned
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Installation Date & Warranty Period */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#006937]" />
              Warranty Life-Cycle Configuration
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
                Standard Warranty Period
              </label>
              <select
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937]"
              >
                {WARRANTY_OPTIONS.map((w) => (
                  <option key={w.label} value={w.months}>
                    {w.label} {w.months > 0 ? `(${w.months} Months)` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {warrantyMonths > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Calculated Expiration Date (editable)
              </label>
              <Input
                type="date"
                value={warrantyExpiresAt}
                onChange={(e) => setWarrantyExpiresAt(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Warranty Certificate URL & Operational Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Warranty Document / Certificate URL
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={warrantyDocumentUrl}
                onChange={(e) => setWarrantyDocumentUrl(e.target.value)}
                placeholder="https://cloud.storage/warranty.pdf"
                className="pl-9"
              />
            </div>
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

        {/* Modal Action Buttons Sticky Footer */}
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
            className="min-w-[150px] text-xs font-semibold bg-[#006937] hover:bg-[#004D28] text-white shadow-sm h-9"
          >
            {loading ? "Registering..." : "Register Asset"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

