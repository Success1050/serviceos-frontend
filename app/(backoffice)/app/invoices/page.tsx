"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { Invoice, InvoiceStatus, InvoiceMetrics } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/layout/header";
import {
  InvoiceTable,
  CreateInvoiceModal,
  RecordPaymentModal,
  CheckoutModal,
  InvoicePreviewModal,
} from "@/components/invoices";
import {
  Button,
  Input,
  Badge,
  Dialog,
  DialogFooter,
} from "@/components/ui";
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Banknote,
  DollarSign,
} from "lucide-react";

export default function InvoicesPage() {
  const queryClient = useQueryClient();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | InvoiceStatus>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeInvoiceForPreview, setActiveInvoiceForPreview] = useState<Invoice | null>(null);
  const [activeInvoiceForPayment, setActiveInvoiceForPayment] = useState<Invoice | null>(null);
  const [activeInvoiceForCheckout, setActiveInvoiceForCheckout] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch Invoices from Live Backend
  const { data, isLoading, refetch, isFetching } = useQuery<{
    items: Invoice[];
    meta: { total: number; page: number; totalPages: number };
    metrics?: InvoiceMetrics;
  }>({
    queryKey: ["invoices", searchTerm, statusFilter, currentPage],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append("search", searchTerm.trim());
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        params.append("page", currentPage.toString());
        params.append("limit", pageSize.toString());

        const res = await apiClient.get(`/invoices?${params.toString()}`);
        if (res.data?.items) {
          return res.data;
        }
        if (Array.isArray(res.data)) {
          return {
            items: res.data,
            meta: { total: res.data.length, page: 1, totalPages: 1 },
          };
        }
        return {
          items: [],
          meta: { total: 0, page: 1, totalPages: 1 },
        };
      } catch (err) {
        console.error("Backend invoices API error:", err);
        return {
          items: [],
          meta: { total: 0, page: 1, totalPages: 1 },
        };
      }
    },
    staleTime: 1000 * 30,
  });


  // Client-side filtering
  const filteredInvoices = useMemo(() => {
    let list = data?.items || [];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.title.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q) ||
          (inv.customerRecord?.name && inv.customerRecord.name.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "ALL") {
      list = list.filter((inv) => inv.status === statusFilter);
    }

    return list;
  }, [data, searchTerm, statusFilter]);

  // Overall Financial Metrics
  const metrics = useMemo(() => {
    if (data?.metrics) {
      return data.metrics;
    }

    const list = data?.items || [];
    let totalBilled = 0;
    let paidAmount = 0;
    let outstandingAmount = 0;
    let overdueCount = 0;
    let paidCount = 0;

    const now = Date.now();
    list.forEach((inv) => {
      const num = typeof inv.amount === "number" ? inv.amount : parseFloat(String(inv.amount)) || 0;
      totalBilled += num;

      if (inv.status === "PAID") {
        paidAmount += num;
        paidCount++;
      } else if (inv.status === "SENT" || inv.status === "PARTIALLY_PAID") {
        outstandingAmount += num;
        if (inv.dueDate && new Date(inv.dueDate).getTime() < now) {
          overdueCount++;
        }
      } else if (inv.status === "OVERDUE") {
        outstandingAmount += num;
        overdueCount++;
      }
    });

    return { totalBilled, paidAmount, outstandingAmount, overdueCount, paidCount };
  }, [data]);

  // Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map((inv) => inv.id));
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await apiClient.post(`/invoices/${invoice.id}/send`);
      setActionNotice(`Invoice INV-${invoice.id.slice(0, 8).toUpperCase()} sent to client successfully.`);
      refetch();
    } catch (err: any) {
      console.error("Failed to send invoice:", err);
      setActionNotice("Failed to send invoice. Please try again.");
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      setIsDeleting(true);
      await apiClient.delete(`/invoices/${invoiceToDelete.id}`);
      setActionNotice("Invoice removed successfully.");
      setInvoiceToDelete(null);
      refetch();
    } catch (err: any) {
      console.error("Failed to delete invoice:", err);
      setActionNotice("Failed to delete invoice. Paid invoices cannot be removed.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Header />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Invoices & Multi-Gateway Billing
              </h1>
              <Badge variant="success" className="text-xs bg-emerald-50 text-[#006937] border-emerald-200">
                Phase 2 Core Operations
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Issue commercial tax invoices, record manual bank transfers with teller slips, and initiate Paystack/Stripe checkout.
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
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#006937] hover:bg-[#004D28] text-white text-xs font-semibold shadow-xs gap-2 h-9 px-4 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue New Invoice</span>
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

        {/* Top 4 Financial Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Billed Revenue"
            value={formatCurrency(metrics.totalBilled)}
            icon={<TrendingUp className="w-5 h-5 text-[#006937]" />}
            subtitle="Cumulative gross invoiced volume"
          />
          <StatCard
            title="Collected Collections"
            value={formatCurrency(metrics.paidAmount)}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            subtitle={`${metrics.paidCount} invoices settled in full`}
          />
          <StatCard
            title="Outstanding Receivables"
            value={formatCurrency(metrics.outstandingAmount)}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            subtitle="Awaiting client bank transfer/card"
          />
          <StatCard
            title="Overdue Receivables"
            value={metrics.overdueCount.toString()}
            icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
            subtitle="Past payment due date threshold"
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
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid in Full</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                  setCurrentPage(1);
                }}
                className="text-xs h-8 text-slate-500 hover:text-slate-800"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Invoices Table */}
        <InvoiceTable
          invoices={filteredInvoices}
          isLoading={isLoading}
          onSelectInvoice={(inv) => setActiveInvoiceForPreview(inv)}
          onRecordPayment={(inv) => setActiveInvoiceForPayment(inv)}
          onPayOnline={(inv) => setActiveInvoiceForCheckout(inv)}
          onSendInvoice={handleSendInvoice}
          onDeleteInvoice={(inv) => setInvoiceToDelete(inv)}
          onAddNew={() => setIsCreateOpen(true)}
          currentPage={currentPage}
          totalPages={data?.meta?.totalPages || 1}
          onPageChange={setCurrentPage}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      </main>

      {/* Create / Convert Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onInvoiceCreated={(newInv) => {
          setActionNotice(`Invoice INV-${newInv.id.slice(0, 8).toUpperCase()} issued successfully.`);
          refetch();
        }}
      />

      {/* Record Manual Payment Modal (Bank Transfer) */}
      <RecordPaymentModal
        isOpen={Boolean(activeInvoiceForPayment)}
        onClose={() => setActiveInvoiceForPayment(null)}
        invoice={activeInvoiceForPayment}
        onPaymentRecorded={(updatedInv) => {
          setActionNotice(`Payment recorded on INV-${updatedInv.id.slice(0, 8).toUpperCase()}.`);
          refetch();
        }}
      />

      {/* Online Gateway Checkout Modal (Paystack & Stripe) */}
      <CheckoutModal
        isOpen={Boolean(activeInvoiceForCheckout)}
        onClose={() => setActiveInvoiceForCheckout(null)}
        invoice={activeInvoiceForCheckout}
        onPaymentSuccess={(updatedInv) => {
          setActionNotice(`Online payment successful for INV-${updatedInv.id.slice(0, 8).toUpperCase()}!`);
          refetch();
        }}
      />

      {/* Printable Tax Invoice Document Preview Modal */}
      <InvoicePreviewModal
        isOpen={Boolean(activeInvoiceForPreview)}
        onClose={() => setActiveInvoiceForPreview(null)}
        invoice={activeInvoiceForPreview}
        onRecordPayment={(inv) => setActiveInvoiceForPayment(inv)}
        onPayOnline={(inv) => setActiveInvoiceForCheckout(inv)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(invoiceToDelete)}
        onClose={() => setInvoiceToDelete(null)}
        title="Delete Draft Invoice?"
        description={`Are you sure you want to permanently delete "${invoiceToDelete?.title || ""}"? This action cannot be reversed.`}
        maxWidth="md"
      >
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setInvoiceToDelete(null)}
            disabled={isDeleting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteInvoice}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            {isDeleting ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">{icon}</div>
      </div>
      <div className="mt-2">
        <span className="text-xl font-bold text-slate-900 tracking-tight">{value}</span>
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
