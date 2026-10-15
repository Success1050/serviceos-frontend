"use client";

import React, { useState } from "react";
import { Warehouse, ProductCatalog, InventoryItem } from "@/lib/types";
import { Button, Input, Badge } from "@/components/ui";
import {
  Package,
  Building2,
  Search,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";

interface WarehouseStockViewProps {
  products: ProductCatalog[];
  masterWarehouse: Warehouse | null;
  regionalWarehouse: Warehouse | null;
  masterItems: InventoryItem[];
  regionalItems: InventoryItem[];
  onRequestEquipment: () => void;
  onAddStock: (warehouseId: string, productId: string) => void;
}

export function WarehouseStockView({
  products,
  masterWarehouse,
  regionalWarehouse,
  masterItems,
  regionalItems,
  onRequestEquipment,
  onAddStock,
}: WarehouseStockViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Map inventory by productId
  const masterStockMap = new Map<string, number>();
  masterItems.forEach((i) => masterStockMap.set(i.productId, i.quantity));

  const regionalStockMap = new Map<string, number>();
  regionalItems.forEach((i) => regionalStockMap.set(i.productId, i.quantity));

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterLowStockOnly) {
      const masterQty = masterStockMap.get(p.id) || 0;
      const regionalQty = regionalStockMap.get(p.id) || 0;
      return masterQty < 15 || regionalQty < 5;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Enterprise Multi-Warehouse Inventory Comparison
            </h2>
            <Badge variant="neutral" className="text-[10px] bg-slate-100 text-slate-700">
              {filteredProducts.length} Catalog Items
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-facility inventory visibility: Central Logistics Master Hub vs Regional Branch Depots.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={onRequestEquipment}
            className="bg-[#006937] hover:bg-[#004D28] text-white text-xs font-bold gap-1.5 h-8 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Requisition from HQ</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006937]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              filterLowStockOnly
                ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filterLowStockOnly ? "text-amber-700" : "text-slate-400"}`} />
            <span>Low Stock Alert</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Equipment & SKU</th>
              <th className="py-3 px-4">Unit Value</th>
              <th className="py-3 px-4 text-center">
                <span className="flex items-center justify-center gap-1 text-emerald-800">
                  <Building2 className="w-3 h-3 text-[#006937]" />
                  <span>Central Master Hub</span>
                </span>
              </th>
              <th className="py-3 px-4 text-center">
                <span className="flex items-center justify-center gap-1 text-blue-800">
                  <Package className="w-3 h-3 text-blue-600" />
                  <span>Regional Branch Depot</span>
                </span>
              </th>
              <th className="py-3 px-4 text-center">Stock Health</th>
              <th className="py-3 px-4 text-right">Quick Restock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                  No matching inventory found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const masterQty = masterStockMap.get(p.id) || 0;
                const regionalQty = regionalStockMap.get(p.id) || 0;
                const totalStock = masterQty + regionalQty;

                let healthStatus: "healthy" | "low" | "critical" = "healthy";
                if (masterQty === 0 && regionalQty === 0) healthStatus = "critical";
                else if (masterQty < 15 || regionalQty < 5) healthStatus = "low";

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium">
                      <span className="font-bold text-slate-900 block">{p.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{p.sku || "NO-SKU"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold">
                      ₦{Number(p.price || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-black text-sm text-slate-900">{masterQty}</span>
                        <span className="text-[10px] text-slate-400">units in Hub</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-black text-sm text-slate-900">{regionalQty}</span>
                        <span className="text-[10px] text-slate-400">units in Branch</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {healthStatus === "healthy" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Optimal Stock</span>
                        </span>
                      )}
                      {healthStatus === "low" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Reorder Warning</span>
                        </span>
                      )}
                      {healthStatus === "critical" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Depleted</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {masterWarehouse && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAddStock(masterWarehouse.id, p.id)}
                          className="h-7 text-[11px] px-2.5 gap-1 font-semibold hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                        >
                          <Plus className="w-3 h-3 text-[#006937]" />
                          <span>Restock +10</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
