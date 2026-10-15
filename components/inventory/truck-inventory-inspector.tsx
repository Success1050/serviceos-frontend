"use client";

import React, { useState } from "react";
import { Warehouse, InventoryItem } from "@/lib/types";
import { Button, Badge } from "@/components/ui";
import { Truck, Package, PlusCircle, Wrench, ShieldCheck, AlertCircle } from "lucide-react";

interface TruckInventoryInspectorProps {
  trucks: Warehouse[];
  truckInventories: Record<string, InventoryItem[]>;
  onRequestEquipment: (truckId?: string) => void;
}

export function TruckInventoryInspector({
  trucks,
  truckInventories,
  onRequestEquipment,
}: TruckInventoryInspectorProps) {
  const [activeTruckId, setActiveTruckId] = useState<string>(trucks[0]?.id || "");

  const activeTruck = trucks.find((t) => t.id === activeTruckId) || trucks[0];
  const items = (activeTruck && truckInventories[activeTruck.id]) || [];

  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * Number(item.product?.price || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Virtual Truck Fleet & Vehicle Stock
            </h2>
            <p className="text-xs text-slate-500">
              Live mobile inventory loaded on field service vans & technician vehicles.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => onRequestEquipment(activeTruck?.id)}
          className="bg-[#006937] hover:bg-[#004D28] text-white text-xs font-bold gap-1.5 h-8 shadow-2xs shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Requisition Stock to Truck</span>
        </Button>
      </div>

      {/* Truck Selection Tabs */}
      <div className="bg-slate-50/70 p-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        {trucks.length === 0 ? (
          <span className="text-xs text-slate-500 italic py-1 px-2">No virtual trucks provisioned yet.</span>
        ) : (
          trucks.map((truck) => {
            const isSelected = truck.id === (activeTruck?.id || "");
            const count = (truckInventories[truck.id] || []).reduce((sum, i) => sum + i.quantity, 0);
            return (
              <button
                key={truck.id}
                onClick={() => setActiveTruckId(truck.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent"
                }`}
              >
                <Truck className={`w-3.5 h-3.5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                <span>{truck.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-blue-50 text-blue-700" : "bg-slate-200/70 text-slate-600"
                  }`}
                >
                  {count} items
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Selected Truck Dashboard */}
      {activeTruck ? (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Vehicle Metadata & Live Summary Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center font-bold shrink-0">
                <Truck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black tracking-tight">{activeTruck.name}</h3>
                  <Badge variant="success" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                    Deployed in Field
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                  <span>Assigned Specialist:</span>
                  <span className="font-bold text-white">
                    {activeTruck.assignedTechnician
                      ? `${activeTruck.assignedTechnician.firstName} ${activeTruck.assignedTechnician.lastName}`
                      : "Unassigned Vehicle"}
                  </span>
                  {activeTruck.assignedTechnician?.tradeSpecialty && (
                    <span className="text-[11px] text-blue-300">
                      • {activeTruck.assignedTechnician.tradeSpecialty}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Units Loaded</span>
                <span className="text-lg font-black text-white">{totalUnits} units</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Mobile Stock Valuation</span>
                <span className="text-lg font-black text-emerald-400">₦{totalValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Truck Parts Inventory Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#006937]" />
                <span>Cargo Manifest & Loaded Parts</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-semibold">{items.length} distinct items on board</span>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-xs text-slate-700">No Parts Loaded on this Vehicle</p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                  This technician's truck currently has 0 inventory items. Requisition equipment from the Central Hub to load parts.
                </p>
                <Button
                  size="sm"
                  onClick={() => onRequestEquipment(activeTruck.id)}
                  className="mt-3 bg-[#006937] hover:bg-[#004D28] text-white text-xs font-bold h-7 gap-1"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Transfer First Parts</span>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4">Loaded Equipment Item</th>
                      <th className="py-2.5 px-4">Part / SKU</th>
                      <th className="py-2.5 px-4 text-center">Quantity on Truck</th>
                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                      <th className="py-2.5 px-4 text-right">Subtotal Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-emerald-50 text-[#006937] flex items-center justify-center shrink-0">
                            <Wrench className="w-3 h-3" />
                          </div>
                          <span>{item.product?.name || "Equipment Item"}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {item.product?.sku || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full font-black text-xs bg-blue-50 text-blue-800 border border-blue-200">
                            {item.quantity} units
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-700 font-medium">
                          ₦{Number(item.product?.price || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          ₦{(item.quantity * Number(item.product?.price || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-500">
          No virtual trucks available.
        </div>
      )}
    </div>
  );
}
