"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import Header from "@/components/layout/header";
import { Quote, QuoteStatus, BillingType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Button,
  Input,
  StatCard,
  Badge,
} from "@/components/ui";
import {
  QuoteTable,
  QuoteBuilderModal,
  QuotePreviewModal,
} from "@/components/quotes";
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
  Send,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const MOCK_QUOTES: Quote[] = [
  {
    id: "q-101-sunshine",
    tenantId: "tenant-sunshine",
    customerRecordId: "cust-adeleke-01",
    customerRecord: {
      id: "cust-adeleke-01",
      name: "Chief Babatunde Adeleke",
      email: "babatunde.adeleke@lagosproperties.ng",
      phone: "+234 803 444 8899",
      address: "18 Admiralty Way, Lekki Phase 1",
      city: "Lagos",
    },
    title: "10kVA Commercial Solar Hybrid System Proposal",
    amount: 2500000,
    status: "DRAFT",
    billingType: "FIXED",
    termsAndConditions: `1. Pricing validity: 14 days from issue date.
2. Inverter carries a 5-year OEM warranty; Solar PV modules carry a 25-year performance warranty.
3. Client must grant roof and electrical distribution board access during the installation window.
4. Final grid handover subject to sign-off and safety testing.`,
    validUntil: "2026-11-01",
    items: [
      { description: "10kVA Hybrid Solar Inverter (Deye 48V High-Yield)", quantity: 1, unitPrice: 1850000, total: 1850000, category: "EQUIPMENT" },
      { description: "550W Tier-1 Mono Solar Panels (Pack of 10 - Jinko)", quantity: 1, unitPrice: 1250000, total: 1250000, category: "EQUIPMENT" },
      { description: "15kWh Lithium FePO4 Storage Bank (Felicity 300Ah)", quantity: 1, unitPrice: 2400000, total: 2400000, category: "EQUIPMENT" },
      { description: "Certified Installation, Grounding & Commissioning Labor", quantity: 1, unitPrice: 350000, total: 350000, category: "LABOR" },
    ],
    subtotal: 5850000,
    discountAmount: 292500,
    taxAmount: 416813,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-102-amina",
    tenantId: "tenant-sunshine",
    customerRecordId: "cust-amina-02",
    customerRecord: {
      id: "cust-amina-02",
      name: "Dr. Amina Bello",
      email: "dr.amina@greenenergy.ng",
      phone: "+234 802 333 4455",
      address: "Plot 8, Bishop Oluwole St, Victoria Island",
      city: "Lagos",
    },
    title: "5kVA Residential Solar Hybrid Backup System",
    amount: 1850000,
    status: "SENT",
    billingType: "MILESTONE",
    termsAndConditions: `1. Pricing validity: 14 days from issue date.
2. Inverter carries a 5-year OEM warranty; Lithium storage carries 10-year cycle warranty.`,
    validUntil: "2026-10-28",
    milestones: [
      { title: "Upfront Hardware Procurement & Mobilization", percentage: 60, amount: 1110000, order: 1 },
      { title: "Roof Mounting & Inverter Wall Rigging", percentage: 30, amount: 555000, order: 2 },
      { title: "Grid Synchronisation & Safety Handover", percentage: 10, amount: 185000, order: 3 },
    ],
    items: [
      { description: "5kVA Off-Grid Solar Inverter (Growatt SPF)", quantity: 1, unitPrice: 980000, total: 980000, category: "EQUIPMENT" },
      { description: "550W Tier-1 Mono Solar Panels (Pack of 6)", quantity: 1, unitPrice: 750000, total: 750000, category: "EQUIPMENT" },
      { description: "Certified Electrician Installation Labor", quantity: 1, unitPrice: 200000, total: 200000, category: "LABOR" },
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-103-emeka",
    tenantId: "tenant-sunshine",
    customerRecordId: "cust-emeka-03",
    customerRecord: {
      id: "cust-emeka-03",
      name: "Engr. Emeka Okafor",
      email: "emeka.okafor@transcorp.ng",
      phone: "+234 805 111 2233",
      address: "14 Isaac John Street, Ikeja GRA",
      city: "Lagos",
    },
    title: "15kWh Lithium Storage & Smart Microinverter Retrofit",
    amount: 3750000,
    status: "ACCEPTED",
    billingType: "MILESTONE",
    termsAndConditions: `Standard commercial EPC terms agreed and signed digitally via Customer Portal.`,
    validUntil: "2026-11-10",
    milestones: [
      { title: "Mobilization & Battery Bank Delivery", percentage: 50, amount: 1875000, order: 1 },
      { title: "Panel Wiring & Microinverter Integration", percentage: 30, amount: 1125000, order: 2 },
      { title: "Final Inspection & Commissioning Sign-off", percentage: 20, amount: 750000, order: 3 },
    ],
    items: [
      { description: "15kWh Lithium FePO4 Storage Bank (Felicity 300Ah)", quantity: 1, unitPrice: 2400000, total: 2400000, category: "EQUIPMENT" },
      { description: "10kWh Wall-Mount Lithium Storage (Deye Powerwall)", quantity: 1, unitPrice: 1950000, total: 1950000, category: "EQUIPMENT" },
      { description: "DC Combiner Box & Heavy-Duty Cabling", quantity: 1, unitPrice: 250000, total: 250000, category: "MATERIALS" },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q-104-coolair",
    tenantId: "tenant-sunshine",
    customerRecordId: "cust-plaza-04",
    customerRecord: {
      id: "cust-plaza-04",
      name: "CoolAir Commercial Plaza",
      email: "management@coolairplaza.ng",
      phone: "+234 809 777 9900",
      address: "Central Business District",
      city: "Abuja",
    },
    title: "Quarterly Solar Array Preventative Maintenance Contract",
    amount: 450000,
    status: "SENT",
    billingType: "FIXED",
    termsAndConditions: `Bi-annual and quarterly thermal imaging, array degreasing, and inverter firmware calibration.`,
    validUntil: "2026-10-31",
    items: [
      { description: "Quarterly Thermal Drone Inspection & String Testing", quantity: 4, unitPrice: 75000, total: 300000, category: "LABOR" },
      { description: "Specialized Solar Panel Chemical Degreasing & Wash", quantity: 1, unitPrice: 150000, total: 150000, category: "MATERIALS" },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function filterMockQuotes(search: string, status: string, billing: string) {
  let list = [...MOCK_QUOTES];
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.customerRecord?.name && item.customerRecord.name.toLowerCase().includes(q))
    );
  }
  if (status !== "ALL") {
    list = list.filter((item) => item.status === status);
  }
  if (billing !== "ALL") {
    list = list.filter((item) => item.billingType === billing);
  }
  return list;
}

export default function QuotesPage() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | QuoteStatus>("ALL");
  const [billingFilter, setBillingFilter] = useState<"ALL" | BillingType>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected IDs
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);
  const [activeQuoteForPreview, setActiveQuoteForPreview] = useState<Quote | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch Quotes from Backend
  const { data, isLoading, refetch, isFetching } = useQuery<{
    items: Quote[];
    meta: { total: number; page: number; totalPages: number };
  }>({
    queryKey: ["quotes", searchTerm, statusFilter, billingFilter, currentPage],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        params.append("page", currentPage.toString());
        params.append("limit", pageSize.toString());

        const res = await apiClient.get(`/quotes?${params.toString()}`);
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
          items: filterMockQuotes(searchTerm, statusFilter, billingFilter),
          meta: { total: MOCK_QUOTES.length, page: 1, totalPages: 1 },
        };
      } catch (err) {
        console.warn("Backend quotes API unavailable, rendering offline pipeline:", err);
        return {
          items: filterMockQuotes(searchTerm, statusFilter, billingFilter),
          meta: { total: MOCK_QUOTES.length, page: 1, totalPages: 1 },
        };
      }
    },
    staleTime: 1000 * 30,
  });


  // Client-side filtering
  const filteredQuotes = useMemo(() => {
    let list = data?.items || [];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (quote) =>
          quote.title.toLowerCase().includes(q) ||
          quote.id.toLowerCase().includes(q) ||
          (quote.customerRecord?.name && quote.customerRecord.name.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      list = list.filter((quote) => quote.status === statusFilter);
    }

    if (billingFilter !== "ALL") {
      list = list.filter((quote) => quote.billingType === billingFilter);
    }

    return list;
  }, [data, searchTerm, statusFilter, billingFilter]);

  // Overall Financial & Proposal Metrics
  const metrics = useMemo(() => {
    const list = data?.items || [];
    const totalCount = list.length;

    let pipelineAmount = 0;
    let acceptedCount = 0;
    let pendingCount = 0;

    list.forEach((q) => {
      const num = typeof q.amount === "number" ? q.amount : parseFloat(String(q.amount)) || 0;
      pipelineAmount += num;
      if (q.status === "ACCEPTED") acceptedCount++;
      if (q.status === "DRAFT" || q.status === "SENT") pendingCount++;
    });

    const winRate = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;

    return { totalCount, pipelineAmount, acceptedCount, pendingCount, winRate };
  }, [data]);

  // Bulk Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredQuotes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuotes.map((q) => q.id));
    }
  };

  // Actions
  const handleQuoteCreatedOrUpdated = (quote: Quote) => {
    queryClient.invalidateQueries({ queryKey: ["quotes"] });
    setActionNotice(`Proposal "${quote.title}" successfully saved!`);
    setTimeout(() => setActionNotice(null), 4000);
    setActiveQuoteForPreview(quote);
  };

  const handleSendQuote = async (quote: Quote) => {
    try {
      await apiClient.post(`/quotes/${quote.id}/send`);
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      setActionNotice(`Proposal "${quote.title}" was officially sent to the client.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.error("Send error:", err);
      alert(err.response?.data?.message || "Failed to send proposal. Please try again.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!quoteToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/quotes/${quoteToDelete.id}`);
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      setActionNotice(`Quote "${quoteToDelete.title}" deleted.`);
      setTimeout(() => setActionNotice(null), 4000);
      setQuoteToDelete(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete quote.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConvertToInvoice = async (quote: Quote) => {
    try {
      const res = await apiClient.post(`/invoices/from-quote/${quote.id}`);
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setActionNotice(
        `Commercial Quote "${quote.title}" converted! Invoice INV-${res.data.id.slice(0, 8).toUpperCase()} has been issued.`
      );
      setTimeout(() => setActionNotice(null), 5000);
      setActiveQuoteForPreview(null);
    } catch (err: any) {
      console.error("Convert to invoice error:", err);
      alert(err.response?.data?.message || "Failed to convert quote to invoice.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Quote Builder & Pricing Engine
              </h1>
              <Badge variant="success" className="text-xs bg-emerald-50 text-[#006937] border-emerald-200 shrink-0">
                Phase 2 Core Operations
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Draft professional solar equipment line items, configure discounts and VAT, and issue digital proposals with milestone tranches.
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
              onClick={() => {
                setQuoteToEdit(null);
                setIsBuilderOpen(true);
              }}
              className="bg-[#006937] hover:bg-[#004D28] text-white text-xs font-semibold shadow-xs gap-2 h-9 px-4 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Quote</span>
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

        {/* Top 4 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Active Pipeline"
            value={formatCurrency(metrics.pipelineAmount)}
            icon={<TrendingUp className="w-5 h-5 text-[#006937]" />}
            subtitle="Combined commercial proposal value"
          />
          <StatCard
            title="Total Proposals Created"
            value={metrics.totalCount.toString()}
            icon={<FileText className="w-5 h-5 text-indigo-600" />}
            subtitle="Drafted & published quotes"
          />
          <StatCard
            title="Accepted & Won Deals"
            value={metrics.acceptedCount.toString()}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            subtitle={`${metrics.winRate}% proposal conversion rate`}
          />
          <StatCard
            title="Awaiting Client Sign-Off"
            value={metrics.pendingCount.toString()}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            subtitle="In draft or client review"
          />
        </div>

        {/* Filter & Controls Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by title, client name, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
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
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent to Client</option>
                <option value="ACCEPTED">Accepted / Signed</option>
                <option value="REJECTED">Declined</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Billing Model:</span>
              <select
                value={billingFilter}
                onChange={(e) => {
                  setBillingFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006937]"
              >
                <option value="ALL">All Billing Models</option>
                <option value="FIXED">Fixed Scope</option>
                <option value="MILESTONE">Milestone Tranches</option>
                <option value="AUTH_AND_CAPTURE">Hold & Capture</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== "ALL" || billingFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setBillingFilter("ALL");
                  setCurrentPage(1);
                }}
                className="text-xs h-8 text-slate-500 hover:text-slate-800"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Quotes Table */}
        <QuoteTable
          quotes={filteredQuotes}
          isLoading={isLoading}
          onSelectQuote={(quote) => setActiveQuoteForPreview(quote)}
          onEditQuote={(quote) => {
            setQuoteToEdit(quote);
            setIsBuilderOpen(true);
          }}
          onSendQuote={handleSendQuote}
          onDeleteQuote={(quote) => setQuoteToDelete(quote)}
          onConvertToInvoice={handleConvertToInvoice}
          onAddNew={() => {
            setQuoteToEdit(null);
            setIsBuilderOpen(true);
          }}
          currentPage={currentPage}
          totalPages={data?.meta?.totalPages || 1}
          onPageChange={setCurrentPage}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </main>

      {/* Quote Builder Modal */}
      <QuoteBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          setQuoteToEdit(null);
        }}
        initialQuote={quoteToEdit}
        onQuoteCreated={handleQuoteCreatedOrUpdated}
      />

      {/* Quote Proposal Document Preview Modal */}
      <QuotePreviewModal
        isOpen={Boolean(activeQuoteForPreview)}
        onClose={() => setActiveQuoteForPreview(null)}
        quote={activeQuoteForPreview}
        onQuoteSent={(updated) => {
          queryClient.invalidateQueries({ queryKey: ["quotes"] });
          setActiveQuoteForPreview(updated);
        }}
        onConvertToInvoice={handleConvertToInvoice}
      />

      {/* Delete Quote Confirmation Dialog */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setQuoteToDelete(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Commercial Proposal?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-slate-800">{quoteToDelete.title}</span> (
                {formatCurrency(Number(quoteToDelete.amount))})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setQuoteToDelete(null)}
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
                {isDeleting ? "Deleting..." : "Delete Quote"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
