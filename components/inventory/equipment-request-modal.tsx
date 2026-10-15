"use client";

import React, { useState } from "react";
import { Dialog, Button, Input } from "@/components/ui";
import { ProductCatalog, Warehouse } from "@/lib/types";
import apiClient from "@/lib/api/client";
import { Package, Truck, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

interface EquipmentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductCatalog[];
  warehouses: Warehouse[];
  onRequestSubmitted: () => void;
}

export function EquipmentRequestModal({
  isOpen,
  onClose,
  products,
  warehouses,
  onRequestSubmitted,
}: EquipmentRequestModalProps) {
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState<number>(2);
  const [hqWarehouseId, setHqWarehouseId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Filter HQ warehouses
  const hqWarehouses = warehouses.filter((w) => w.type === "HQ_WAREHOUSE");

  // Default selection
  React.useEffect(() => {
    if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
    if (hqWarehouses.length > 0 && !hqWarehouseId) {
      setHqWarehouseId(hqWarehouses[0].id);
    }
  }, [products, hqWarehouses, productId, hqWarehouseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setError("Please select an equipment item from the catalog.");
      return;
    }
    if (quantity <= 0) {
      setError("Quantity must be at least 1 unit.");
      return;
    }
    if (!hqWarehouseId) {
      setError("Please select a supplying HQ master warehouse.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await apiClient.post("/warehouses/requests", {
        productId,
        quantity: Number(quantity),
        hqWarehouseId,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onRequestSubmitted();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Equipment request error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to submit equipment request.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === productId);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Sub-Company Equipment Requisition"
      description="Request solar panels, inverters, or battery storage from Central Logistics Hub for upcoming jobs."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Equipment requisition submitted to HQ Logistics Hub!</span>
          </div>
        )}

        {/* Item Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Equipment / Product Catalog Item <span className="text-rose-500">*</span>
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.sku ? `(${p.sku})` : ""} {p.price ? `• ₦${Number(p.price).toLocaleString()}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Requested Quantity <span className="text-rose-500">*</span>
          </label>
          <Input
            type="number"
            min={1}
            max={500}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            required
            className="text-xs font-bold"
          />
          {selectedProduct?.price && (
            <p className="text-[11px] text-slate-500 mt-1">
              Estimated Value: <span className="font-bold text-slate-800">₦{(Number(selectedProduct.price) * quantity).toLocaleString()}</span>
            </p>
          )}
        </div>

        {/* Supplying Master Warehouse */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Supplying Central Logistics Hub <span className="text-rose-500">*</span>
          </label>
          <select
            value={hqWarehouseId}
            onChange={(e) => setHqWarehouseId(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
          >
            {hqWarehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} (Central Hub)
              </option>
            ))}
          </select>
        </div>

        {/* Transfer Path Summary Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#006937]" />
            <span className="font-semibold text-slate-700">Central Hub Stock</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700">Branch Virtual Fleet</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={submitting || success}
            className="bg-[#006937] hover:bg-[#004D28] text-white font-bold gap-1 shadow-xs"
          >
            <span>{submitting ? "Submitting..." : "Submit Requisition to HQ"}</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
