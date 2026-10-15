"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import Header from "@/components/layout/header";
import { Button, Badge } from "@/components/ui";
import {
  Warehouse,
  ProductCatalog,
  InventoryItem,
  EquipmentRequest,
} from "@/lib/types";
import {
  WarehouseStockView,
  TruckInventoryInspector,
  EquipmentRequestModal,
  ApproveRequestModal,
  EquipmentRequestsTable,
} from "@/components/inventory";
import {
  Package,
  Building2,
  Truck,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  Boxes,
} from "lucide-react";

type InventoryTab = "WAREHOUSES" | "TRUCKS" | "REQUESTS";

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<InventoryTab>("WAREHOUSES");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState<EquipmentRequest | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // 1. Fetch Warehouses
  const {
    data: warehouses = [],
    isLoading: loadingWarehouses,
    refetch: refetchWarehouses,
    isFetching: fetchingWarehouses,
  } = useQuery<Warehouse[]>({
    queryKey: ["warehouses"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/warehouses");
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.warn("Warehouses query notice:", err);
        return [];
      }
    },
    staleTime: 1000 * 30,
  });

  // 2. Fetch Product Catalog
  const {
    data: products = [],
    isLoading: loadingProducts,
  } = useQuery<ProductCatalog[]>({
    queryKey: ["warehouse-products"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/warehouses/products");
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.warn("Products query notice:", err);
        return [];
      }
    },
    staleTime: 1000 * 60,
  });

  // 3. Fetch Equipment Requests
  const {
    data: requests = [],
    isLoading: loadingRequests,
    refetch: refetchRequests,
  } = useQuery<EquipmentRequest[]>({
    queryKey: ["equipment-requests"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/warehouses/requests");
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.warn("Equipment requests query notice:", err);
        return [];
      }
    },
    staleTime: 1000 * 15,
  });

  // Separate warehouses by type with stable memoization
  const hqWarehouses = useMemo(
    () => warehouses.filter((w) => w.type === "HQ_WAREHOUSE"),
    [warehouses]
  );
  const masterWarehouse = useMemo(
    () =>
      hqWarehouses.find(
        (w) =>
          w.name.toLowerCase().includes("master") ||
          w.name.toLowerCase().includes("central")
      ) ||
      hqWarehouses[0] ||
      null,
    [hqWarehouses]
  );
  const regionalWarehouse = useMemo(
    () => hqWarehouses.find((w) => w.id !== masterWarehouse?.id) || null,
    [hqWarehouses, masterWarehouse]
  );
  const truckWarehouses = useMemo(
    () => warehouses.filter((w) => w.type === "VIRTUAL_TRUCK"),
    [warehouses]
  );

  // 4. Fetch Master Warehouse Inventory
  const { data: masterItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["warehouse-inventory", masterWarehouse?.id],
    enabled: Boolean(masterWarehouse?.id),
    queryFn: async () => {
      if (!masterWarehouse?.id) return [];
      try {
        const res = await apiClient.get(`/warehouses/${masterWarehouse.id}/inventory`);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    },
    staleTime: 1000 * 30,
  });

  // 5. Fetch Regional Warehouse Inventory
  const { data: regionalItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["warehouse-inventory", regionalWarehouse?.id],
    enabled: Boolean(regionalWarehouse?.id),
    queryFn: async () => {
      if (!regionalWarehouse?.id) return [];
      try {
        const res = await apiClient.get(`/warehouses/${regionalWarehouse.id}/inventory`);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        return [];
      }
    },
    staleTime: 1000 * 30,
  });

  // 6. Fetch Truck Inventories with React Query (cached & stable key)
  const truckIdsKey = useMemo(
    () => truckWarehouses.map((t) => t.id).sort().join(","),
    [truckWarehouses]
  );

  const { data: truckInventories = {} } = useQuery<Record<string, InventoryItem[]>>({
    queryKey: ["truck-inventories", truckIdsKey],
    enabled: truckWarehouses.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        truckWarehouses.map((t) =>
          apiClient
            .get(`/warehouses/${t.id}/inventory`)
            .then((res) => ({ id: t.id, items: Array.isArray(res.data) ? res.data : [] }))
            .catch(() => ({ id: t.id, items: [] }))
        )
      );
      const map: Record<string, InventoryItem[]> = {};
      results.forEach((r) => {
        map[r.id] = r.items;
      });
      return map;
    },
    staleTime: 1000 * 30,
  });

  // Aggregate Metrics
  const masterTotalUnits = masterItems.reduce((sum, item) => sum + item.quantity, 0);
  const masterTotalValue = masterItems.reduce(
    (sum, item) => sum + item.quantity * Number(item.product?.price || 0),
    0
  );

  const regionalTotalUnits = regionalItems.reduce((sum, item) => sum + item.quantity, 0);
  const regionalTotalValue = regionalItems.reduce(
    (sum, item) => sum + item.quantity * Number(item.product?.price || 0),
    0
  );

  const pendingRequestsCount = requests.filter((r) => r.status === "PENDING").length;

  // Handlers
  const handleRestock = async (warehouseId: string, productId: string) => {
    try {
      await apiClient.post(`/warehouses/${warehouseId}/stock`, {
        productId,
        quantity: 10,
      });
      queryClient.invalidateQueries({ queryKey: ["warehouse-inventory", warehouseId] });
      setActionNotice("Successfully restocked +10 units to warehouse.");
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.error("Restock failed:", err);
      alert(err?.response?.data?.message || "Restock failed.");
    }
  };

  const handleRefreshAll = () => {
    refetchWarehouses();
    refetchRequests();
    queryClient.invalidateQueries({ queryKey: ["warehouse-inventory"] });
    queryClient.invalidateQueries({ queryKey: ["truck-inventories"] });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header & Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#006937] text-white flex items-center justify-center font-bold shadow-xs">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Supply Chain, Warehouses & Virtual Trucks
                  </h1>
                  <Badge variant="success" className="text-xs bg-emerald-50 text-[#006937] border-emerald-200">
                    Day 10 Active Operations
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  HQ master stock catalogs, sub-company equipment requisitions & field technician virtual truck inventories.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={fetchingWarehouses}
              className="bg-white hover:bg-slate-50 border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs gap-1.5 h-9 px-3 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${fetchingWarehouses ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-[#006937] hover:bg-[#004D28] text-white text-xs font-semibold shadow-xs gap-1.5 h-9 px-4 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Equipment</span>
            </Button>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Operations Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Master Central Hub */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Central Master Hub
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                ₦{masterTotalValue.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                {masterTotalUnits} units in stock
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#006937] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* 2. Regional Branch Depot */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Regional Branch Depot
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                ₦{regionalTotalValue.toLocaleString()}
              </p>
              <span className="text-[11px] text-blue-700 font-semibold mt-0.5 block">
                {regionalTotalUnits} units stationed
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
          </div>

          {/* 3. Virtual Trucks Deployed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Virtual Fleet Deployed
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {truckWarehouses.length} Active Vans
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                Mobile cargo manifest tracking
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          {/* 4. Equipment Requisitions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                HQ Requisitions
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">
                {pendingRequestsCount} Pending
              </p>
              <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                {pendingRequestsCount > 0 ? "Awaiting HQ fulfillment" : "All requests approved"}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <ArrowRightLeft className={`w-5 h-5 ${pendingRequestsCount > 0 ? "animate-bounce" : ""}`} />
            </div>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("WAREHOUSES")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "WAREHOUSES"
                ? "bg-[#006937] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-slate-200/80"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Master & Regional Warehouses</span>
          </button>

          <button
            onClick={() => setActiveTab("TRUCKS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "TRUCKS"
                ? "bg-[#006937] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-slate-200/80"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Virtual Truck Fleet</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === "TRUCKS" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {truckWarehouses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("REQUESTS")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "REQUESTS"
                ? "bg-[#006937] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-slate-200/80"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Branch Equipment Requisitions</span>
            {pendingRequestsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Master & Regional Comparison View */}
        {activeTab === "WAREHOUSES" && (
          <WarehouseStockView
            products={products}
            masterWarehouse={masterWarehouse}
            regionalWarehouse={regionalWarehouse}
            masterItems={masterItems}
            regionalItems={regionalItems}
            onRequestEquipment={() => setIsRequestModalOpen(true)}
            onAddStock={handleRestock}
          />
        )}

        {/* Tab 2: Virtual Truck Fleet Inspector */}
        {activeTab === "TRUCKS" && (
          <TruckInventoryInspector
            trucks={truckWarehouses}
            truckInventories={truckInventories}
            onRequestEquipment={() => setIsRequestModalOpen(true)}
          />
        )}

        {/* Tab 3: Equipment Requisitions Table */}
        {activeTab === "REQUESTS" && (
          <EquipmentRequestsTable
            requests={requests}
            onOpenApproveModal={(req) => setSelectedRequestForApproval(req)}
            onRequestEquipment={() => setIsRequestModalOpen(true)}
          />
        )}

        {/* Requisition Modal */}
        <EquipmentRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          products={products}
          warehouses={warehouses}
          onRequestSubmitted={() => {
            refetchRequests();
            setActionNotice("Equipment requisition submitted to HQ Logistics Hub.");
            setTimeout(() => setActionNotice(null), 4000);
          }}
        />

        {/* Approve & Transfer Modal with Live Animation */}
        <ApproveRequestModal
          isOpen={Boolean(selectedRequestForApproval)}
          onClose={() => setSelectedRequestForApproval(null)}
          request={selectedRequestForApproval}
          trucks={truckWarehouses}
          onApproved={() => {
            handleRefreshAll();
            setActionNotice("Equipment approved and transferred into destination truck inventory.");
            setTimeout(() => setActionNotice(null), 4000);
          }}
        />
      </main>
    </div>
  );
}
