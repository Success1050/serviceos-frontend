"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import Header from "@/components/layout/header";
import { Asset, AssetStatus, WarrantyStatus } from "@/lib/types";
import { getWarrantyStatus } from "@/lib/utils";
import {
  Button,
  Input,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import {
  AssetTable,
  AddAssetModal,
  EditAssetModal,
  AssetDetailsDrawer,
} from "@/components/assets";
import {
  Wrench,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Clock,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

// Demo Solar & Hardware Assets for presentation and offline resilience
const MOCK_ASSETS: Asset[] = [
  {
    id: "asset-1",
    tenantId: "tenant-1",
    customerRecordId: "cust-1",
    name: "Deye 12kW 3-Phase Hybrid Inverter",
    manufacturer: "Deye",
    modelNumber: "SUN-12K-SG04LP3",
    serialNumber: "DEYE-2025-A8991",
    installDate: new Date(Date.now() - 180 * 86400000).toISOString(),
    warrantyExpiresAt: new Date(Date.now() + 1640 * 86400000).toISOString(),
    warrantyDocumentUrl: "https://example.com/docs/deye-warranty.pdf",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    customerRecord: {
      id: "cust-1",
      name: "Chief Adeleke Babatunde",
      email: "adeleke.b@sunshineenergy.ng",
      phone: "+2348031234567",
      address: "Plot 14 Admiralty Way Lekki Phase 1",
      city: "Lagos",
    },
  },
  {
    id: "asset-2",
    tenantId: "tenant-1",
    customerRecordId: "cust-2",
    name: "Felicity Solar 15kWh LiFePO4 Storage Bank",
    manufacturer: "Felicity Solar",
    modelNumber: "LPBF48300-15KWH",
    serialNumber: "FEL-2024-B4102",
    installDate: new Date(Date.now() - 90 * 86400000).toISOString(),
    warrantyExpiresAt: new Date(Date.now() + 3560 * 86400000).toISOString(),
    warrantyDocumentUrl: "https://example.com/docs/felicity-warranty.pdf",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    customerRecord: {
      id: "cust-2",
      name: "Dr. Ngozi Okonjo",
      email: "ngozi@horizonconsult.org",
      phone: "+2348029876543",
      address: "12 Maitama Crescent, Wuse 2",
      city: "Abuja",
    },
  },
  {
    id: "asset-3",
    tenantId: "tenant-1",
    customerRecordId: "cust-3",
    name: "Jinko Tiger Pro 550W Mono Bifacial Array (18 Panels)",
    manufacturer: "Jinko Solar",
    modelNumber: "JKM550M-72HL4-BDVP",
    serialNumber: "JK-2024-C7821",
    installDate: new Date(Date.now() - 120 * 86400000).toISOString(),
    warrantyExpiresAt: new Date(Date.now() + 9000 * 86400000).toISOString(),
    warrantyDocumentUrl: "https://example.com/docs/jinko-warranty.pdf",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    customerRecord: {
      id: "cust-3",
      name: "Green Valley Estate Facility Ops",
      email: "facilities@greenvalley.ng",
      phone: "+2348105556677",
      address: "Km 42 Lekki-Epe Expressway, Sangotedo",
      city: "Lagos",
    },
  },
  {
    id: "asset-4",
    tenantId: "tenant-1",
    customerRecordId: "cust-4",
    name: "Mikano 30kVA Soundproof Backup Diesel Generator",
    manufacturer: "Mikano",
    modelNumber: "Perkins 1103A-33G",
    serialNumber: "MIK-2023-D9901",
    installDate: new Date(Date.now() - 710 * 86400000).toISOString(),
    warrantyExpiresAt: new Date(Date.now() + 18 * 86400000).toISOString(),
    warrantyDocumentUrl: "https://example.com/docs/mikano-warranty.pdf",
    status: "MAINTENANCE",
    createdAt: new Date(Date.now() - 710 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    customerRecord: {
      id: "cust-4",
      name: "Victoria Island Business Towers",
      email: "manager@vitowers.com",
      phone: "+2348074443322",
      address: "Ahmadu Bello Way, Victoria Island",
      city: "Lagos",
    },
  },
  {
    id: "asset-5",
    tenantId: "tenant-1",
    customerRecordId: "cust-5",
    name: "Victron Quattro 10kVA Inverter/Charger",
    manufacturer: "Victron Energy",
    modelNumber: "QUA48/10000/140-100/100",
    serialNumber: "VIC-2020-E1204",
    installDate: new Date(Date.now() - 1500 * 86400000).toISOString(),
    warrantyExpiresAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    status: "INACTIVE",
    createdAt: new Date(Date.now() - 1500 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    customerRecord: {
      id: "cust-5",
      name: "Alhaji Farouk Danjuma",
      email: "f.danjuma@kkano-grain.com",
      phone: "+2348091112233",
      address: "Bompai Industrial Area",
      city: "Kano",
    },
  },
];

function filterMockAssets(search: string, status: string, warranty: string): Asset[] {
  let list = [...MOCK_ASSETS];
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.manufacturer && a.manufacturer.toLowerCase().includes(q)) ||
        (a.modelNumber && a.modelNumber.toLowerCase().includes(q)) ||
        (a.serialNumber && a.serialNumber.toLowerCase().includes(q)) ||
        (a.customerRecord?.name && a.customerRecord.name.toLowerCase().includes(q))
    );
  }
  if (status !== "ALL") {
    list = list.filter((a) => a.status === status);
  }
  if (warranty !== "ALL") {
    list = list.filter((a) => {
      const w = getWarrantyStatus(a.warrantyExpiresAt);
      return w.status === warranty;
    });
  }
  return list;
}

export default function AssetsPage() {
  const queryClient = useQueryClient();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AssetStatus>("ALL");
  const [warrantyFilter, setWarrantyFilter] = useState<"ALL" | WarrantyStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeAssetForDrawer, setActiveAssetForDrawer] = useState<Asset | null>(null);
  const [activeAssetForEdit, setActiveAssetForEdit] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch Assets from API
  const { data, isLoading, refetch, isFetching } = useQuery<{
    items: Asset[];
    meta: { total: number; page: number; totalPages: number };
  }>({
    queryKey: ["assets", searchTerm, statusFilter, warrantyFilter, currentPage],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        params.append("page", currentPage.toString());
        params.append("limit", pageSize.toString());

        const res = await apiClient.get(`/assets?${params.toString()}`);
        if (res.data?.items && res.data.items.length > 0) {
          return res.data;
        }
        if (Array.isArray(res.data) && res.data.length > 0) {
          return {
            items: res.data,
            meta: { total: res.data.length, page: 1, totalPages: 1 },
          };
        }
        return {
          items: filterMockAssets(searchTerm, statusFilter, warrantyFilter),
          meta: { total: MOCK_ASSETS.length, page: 1, totalPages: 1 },
        };
      } catch (err) {
        console.warn("Backend assets API unavailable, rendering offline registry:", err);
        return {
          items: filterMockAssets(searchTerm, statusFilter, warrantyFilter),
          meta: { total: MOCK_ASSETS.length, page: 1, totalPages: 1 },
        };
      }
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  // Client-side filtering across live fetched items
  const filteredAssets = useMemo(() => {
    let list = data?.items || [];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.manufacturer && a.manufacturer.toLowerCase().includes(q)) ||
          (a.modelNumber && a.modelNumber.toLowerCase().includes(q)) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q)) ||
          (a.customerRecord?.name && a.customerRecord.name.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (warrantyFilter !== "ALL") {
      list = list.filter((a) => {
        const w = getWarrantyStatus(a.warrantyExpiresAt);
        return w.status === warrantyFilter;
      });
    }

    return list;
  }, [data, searchTerm, statusFilter, warrantyFilter]);

  // Overall Metrics Calculations
  const metrics = useMemo(() => {
    const list = data?.items || [];
    const total = list.length;
    let activeWarranties = 0;
    let expiringSoon = 0;
    let maintenanceOrExpired = 0;

    list.forEach((a) => {
      const w = getWarrantyStatus(a.warrantyExpiresAt);
      if (w.status === "ACTIVE") activeWarranties++;
      if (w.status === "EXPIRING_SOON") expiringSoon++;
      if (a.status === "MAINTENANCE" || w.status === "EXPIRED") {
        maintenanceOrExpired++;
      }
    });

    return { total, activeWarranties, expiringSoon, maintenanceOrExpired };
  }, [data]);

  // Bulk Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAssets.map((a) => a.id));
    }
  };

  // Handlers for Add, Edit, Delete
  const handleAssetCreated = (newAsset: Asset) => {
    queryClient.invalidateQueries({ queryKey: ["assets"] });
    setActionNotice(`Asset "${newAsset.name}" successfully registered!`);
    setTimeout(() => setActionNotice(null), 4000);
    setActiveAssetForDrawer(newAsset);
  };

  const handleAssetUpdated = (updatedAsset: Asset) => {
    queryClient.invalidateQueries({ queryKey: ["assets"] });
    setActionNotice(`Asset "${updatedAsset.name}" updated successfully.`);
    setTimeout(() => setActionNotice(null), 4000);
    if (activeAssetForDrawer?.id === updatedAsset.id) {
      setActiveAssetForDrawer(updatedAsset);
    }
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/assets/${assetToDelete.id}`);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setActionNotice(`Asset "${assetToDelete.name}" was removed.`);
      setTimeout(() => setActionNotice(null), 4000);
      if (activeAssetForDrawer?.id === assetToDelete.id) {
        setActiveAssetForDrawer(null);
      }
      setAssetToDelete(null);
    } catch (err: any) {
      console.error("Delete asset error:", err);
      alert(err.response?.data?.message || "Failed to delete asset. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Asset & Equipment Registry
              </h1>
              <Badge variant="success" className="text-xs bg-emerald-50 text-[#006937] border-emerald-200">
                Phase 2 Core Operations
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Track solar systems, inverters, storage batteries, and automated warranty expiration cycles across your customer base.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="bg-white hover:bg-slate-50 border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs gap-1.5 h-9 px-3.5 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isFetching ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#006937] hover:bg-[#004D28] text-white text-xs font-semibold shadow-xs gap-2 h-9 px-4 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Asset</span>
            </Button>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Hardware Units"
            value={metrics.total.toString()}
            icon={<Cpu className="w-5 h-5 text-[#006937]" />}
            subtitle="Active field hardware units"
          />
          <StatCard
            title="Active Warranty Shield"
            value={metrics.activeWarranties.toString()}
            icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            subtitle="Under valid OEM guarantee"
          />
          <StatCard
            title="Expiring Within 30 Days"
            value={metrics.expiringSoon.toString()}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            subtitle="Immediate extension candidate"
          />
          <StatCard
            title="Maintenance / Lapsed"
            value={metrics.maintenanceOrExpired.toString()}
            icon={<ShieldAlert className="w-5 h-5 text-rose-500" />}
            subtitle="Requiring review or servicing"
          />
        </div>


        {/* Controls & Filter Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, S/N, model, or customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
            {/* Operational Status */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006937]"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">In Maintenance</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Warranty Status */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Warranty:</span>
              <select
                value={warrantyFilter}
                onChange={(e) => {
                  setWarrantyFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006937]"
              >
                <option value="ALL">All Warranties</option>
                <option value="ACTIVE">Protected</option>
                <option value="EXPIRING_SOON">Expiring Soon (30d)</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(searchTerm || statusFilter !== "ALL" || warrantyFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setWarrantyFilter("ALL");
                  setCurrentPage(1);
                }}
                className="text-xs h-8 text-slate-500 hover:text-slate-800"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Main Asset Table */}
        <AssetTable
          assets={filteredAssets}
          isLoading={isLoading}
          onSelectAsset={(asset) => setActiveAssetForDrawer(asset)}
          onEditAsset={(asset) => {
            setActiveAssetForEdit(asset);
            setIsEditModalOpen(true);
          }}
          onDeleteAsset={(asset) => setAssetToDelete(asset)}
          onAddNew={() => setIsAddModalOpen(true)}
          currentPage={currentPage}
          totalPages={data?.meta?.totalPages || 1}
          onPageChange={setCurrentPage}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </main>

      {/* Modals & Slide-over Drawer */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAssetCreated={handleAssetCreated}
      />

      <EditAssetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setActiveAssetForEdit(null);
        }}
        asset={activeAssetForEdit}
        onAssetUpdated={handleAssetUpdated}
      />

      <AssetDetailsDrawer
        isOpen={Boolean(activeAssetForDrawer)}
        onClose={() => setActiveAssetForDrawer(null)}
        asset={activeAssetForDrawer}
        onEdit={(asset) => {
          setActiveAssetForEdit(asset);
          setIsEditModalOpen(true);
        }}
        onDelete={(asset) => setAssetToDelete(asset)}
      />

      {/* Delete Confirmation Modal */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setAssetToDelete(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Decommission Asset?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-800">{assetToDelete.name}</span> (S/N:{" "}
                {assetToDelete.serialNumber || "N/A"})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setAssetToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Asset"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
