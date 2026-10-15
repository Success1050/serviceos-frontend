"use client";

import React, { useState } from "react";
import { Dialog, Button } from "@/components/ui";
import { EquipmentRequest, Warehouse } from "@/lib/types";
import apiClient from "@/lib/api/client";
import { Package, Truck, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface ApproveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EquipmentRequest | null;
  trucks: Warehouse[];
  onApproved: () => void;
}

export function ApproveRequestModal({
  isOpen,
  onClose,
  request,
  trucks,
  onApproved,
}: ApproveRequestModalProps) {
  const [selectedTruckId, setSelectedTruckId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transferringAnimation, setTransferringAnimation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  React.useEffect(() => {
    if (trucks.length > 0 && !selectedTruckId) {
      setSelectedTruckId(trucks[0].id);
    }
  }, [trucks, selectedTruckId]);

  if (!request) return null;

  const handleApprove = async () => {
    if (!selectedTruckId) {
      setError("Please designate a target Virtual Truck to receive these goods.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setTransferringAnimation(true);

      // Perform backend stock transfer: HQ inventory decreases, Virtual Truck inventory increases
      await apiClient.patch(`/warehouses/requests/${request.id}/approve`, {
        virtualTruckId: selectedTruckId,
      });

      // Keep animation running briefly for delightful visual feedback
      setTimeout(() => {
        setTransferringAnimation(false);
        setCompleted(true);
        setTimeout(() => {
          setCompleted(false);
          onApproved();
          onClose();
        }, 1200);
      }, 1000);
    } catch (err: any) {
      console.error("Approve request error:", err);
      setTransferringAnimation(false);
      setError(err?.response?.data?.message || err?.message || "Failed to approve and transfer equipment.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTruck = trucks.find((t) => t.id === selectedTruckId);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Approve & Dispatch Equipment Transfer"
      description="Authorize inventory transfer from Central Logistics Hub into a field technician's virtual truck."
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {completed && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Inventory successfully transferred into technician's truck!</span>
          </div>
        )}

        {/* Transfer Visual Card & Live Animation */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-blue-50/70 border border-slate-200/80 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Origin HQ Hub */}
            <div className="flex-1 bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                <Package className="w-3.5 h-3.5" />
                <span>Central Hub</span>
              </div>
              <p className="font-bold text-slate-800 line-clamp-1">{request.hqWarehouse?.name || "Master Hub"}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Deducting -{request.quantity} units</p>
            </div>

            {/* Animation Beam */}
            <div className="flex flex-col items-center justify-center shrink-0 px-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${
                  transferringAnimation
                    ? "bg-[#006937] text-white scale-110 shadow-md animate-pulse"
                    : "bg-slate-200/80 text-slate-600"
                }`}
              >
                <ArrowRight className={`w-4 h-4 ${transferringAnimation ? "animate-bounce" : ""}`} />
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase mt-1">
                {transferringAnimation ? "Transferring..." : "Requisition"}
              </span>
            </div>

            {/* Destination Virtual Truck */}
            <div className="flex-1 bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider mb-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Virtual Truck</span>
              </div>
              <p className="font-bold text-slate-800 line-clamp-1">{selectedTruck?.name || "Target Vehicle"}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">+{request.quantity} units loaded</p>
            </div>
          </div>

          {/* Requested Item Tag */}
          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Requisitioned Equipment:</span>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              {request.quantity}x {request.product?.name}
            </span>
          </div>
        </div>

        {/* Destination Virtual Truck Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Designate Destination Virtual Truck <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedTruckId}
            onChange={(e) => setSelectedTruckId(e.target.value)}
            disabled={submitting || transferringAnimation}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
          >
            {trucks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.assignedTechnician ? `(Tech: ${t.assignedTechnician.firstName} ${t.assignedTechnician.lastName})` : ""}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">
            Approved stock will immediately register on the technician's mobile inventory audit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting || transferringAnimation}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApprove}
            disabled={submitting || transferringAnimation || completed}
            className="bg-[#006937] hover:bg-[#004D28] text-white font-bold gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {transferringAnimation
                ? "Authorizing & Transferring Stock..."
                : completed
                  ? "Transfer Complete!"
                  : "Approve & Transfer Stock"}
            </span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
