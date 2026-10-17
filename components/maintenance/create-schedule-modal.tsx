"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  X,
  Calendar,
  RotateCcw,
  Sparkles,
  Users,
  Wrench,
  Clock,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { CreateMaintenanceSchedulePayload } from "@/lib/types";

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateScheduleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateScheduleModalProps) {
  const queryClient = useQueryClient();

  // Form State
  const [title, setTitle] = useState("");
  const [customerRecordId, setCustomerRecordId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [intervalMonths, setIntervalMonths] = useState<number>(3);
  const [firstDueDate, setFirstDueDate] = useState<string>("");
  const [formError, setFormError] = useState("");

  // Default firstDueDate to 1 month from now on open
  useEffect(() => {
    if (isOpen) {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      setFirstDueDate(d.toISOString().split("T")[0]);
      setFormError("");
    }
  }, [isOpen]);

  // Fetch Customers for dropdown
  const { data: customers = [], isLoading: loadingCustomers } = useQuery<any[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await apiClient.get("/customers");
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: isOpen,
  });

  // Fetch Assets for selected customer
  const { data: assets = [], isLoading: loadingAssets } = useQuery<any[]>({
    queryKey: ["assets", customerRecordId],
    queryFn: async () => {
      if (!customerRecordId) return [];
      const res = await apiClient.get("/assets");
      const list = Array.isArray(res.data) ? res.data : [];
      return list.filter((a: any) => a.customerRecordId === customerRecordId);
    },
    enabled: isOpen && !!customerRecordId,
  });

  // Reset asset selection when customer changes
  useEffect(() => {
    setAssetId("");
  }, [customerRecordId]);

  const quickPresets = [
    "Quarterly Solar Array & Inverter Inspection",
    "Biannual PV Panel Cleaning & Thermal Imaging",
    "Annual Full Battery Storage & Inverter Overhaul",
    "Monthly Commercial HVAC Filter & Coil Inspection",
  ];

  const intervals = [
    { months: 1, label: "Monthly", desc: "Every 30 days" },
    { months: 3, label: "Quarterly", desc: "Every 3 months (Standard)", popular: true },
    { months: 6, label: "Bi-Annual", desc: "Every 6 months" },
    { months: 12, label: "Annual", desc: "Once a year" },
  ];

  const createMutation = useMutation({
    mutationFn: async (payload: CreateMaintenanceSchedulePayload) => {
      const res = await apiClient.post("/maintenance/schedules", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to create maintenance schedule.";
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Please enter a maintenance contract title.");
      return;
    }
    if (!customerRecordId) {
      setFormError("Please select a customer for this contract.");
      return;
    }
    if (!firstDueDate) {
      setFormError("Please select the initial servicing due date.");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      customerRecordId,
      assetId: assetId || undefined,
      intervalMonths,
      firstDueDate: new Date(firstDueDate).toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-200">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#006937]/10 text-[#006937] flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  New Recurring Maintenance Contract
                </h3>
                <p className="text-xs text-slate-500">
                  Establish preventative maintenance cycles & automated job dispatch
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Contract Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Contract / SLA Title <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Descriptive work title</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Quarterly Solar Array & Inverter Inspection"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
                required
              />

              {/* Fast Presets */}
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                  Fast presets:
                </span>
                {quickPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTitle(preset)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-[#006937] text-slate-600 border border-slate-200 transition-colors whitespace-nowrap shrink-0"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer & Asset Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Customer & Property <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={customerRecordId}
                    onChange={(e) => setCustomerRecordId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
                    required
                  >
                    <option value="">
                      {loadingCustomers ? "Loading customers..." : "Select customer..."}
                    </option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Installed Asset Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Installed Asset
                  </label>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </div>
                <select
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  disabled={!customerRecordId || loadingAssets}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {!customerRecordId
                      ? "Select a customer first"
                      : assets.length === 0
                      ? "No registered hardware (Entire Site)"
                      : "Entire Site / General Equipment"}
                  </option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.manufacturer ? `(${a.manufacturer})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recurrence Frequency Cards */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-2 block">
                Recurrence Frequency <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {intervals.map((item) => (
                  <button
                    key={item.months}
                    type="button"
                    onClick={() => setIntervalMonths(item.months)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      intervalMonths === item.months
                        ? "border-[#006937] bg-emerald-50/40 ring-1 ring-[#006937]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-2 right-2 text-[9px] font-bold bg-[#006937] text-white px-1.5 py-0.2 rounded-full shadow-xs">
                        Popular
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-900 block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* First Servicing Due Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Initial Servicing Due Date <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setFirstDueDate(d.toISOString().split("T")[0]);
                    }}
                    className="text-[10px] font-medium text-[#006937] hover:underline"
                  >
                    +1 Week
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 1);
                      setFirstDueDate(d.toISOString().split("T")[0]);
                    }}
                    className="text-[10px] font-medium text-[#006937] hover:underline"
                  >
                    +1 Month
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={firstDueDate}
                  onChange={(e) => setFirstDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
                  required
                />
              </div>
            </div>

            {/* Intelligent Automation Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#006937] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">
                  Automated preventative cycle configured
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ServiceOS will automatically generate a scheduled dispatch work order{" "}
                  <strong>7 days prior</strong> to{" "}
                  <strong>
                    {firstDueDate
                      ? new Date(firstDueDate).toLocaleDateString("en-NG", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "the initial due date"}
                  </strong>
                  . Completing the service cycle will mathematically advance the contract by{" "}
                  <strong>{intervalMonths} months</strong>.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#006937] hover:bg-[#00512a] transition-all shadow-sm hover:shadow disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {createMutation.isPending ? "Creating Contract..." : "Create Maintenance Contract"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateScheduleModal;
