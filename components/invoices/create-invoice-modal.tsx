"use client";

import React, { useState, useEffect } from "react";
import { Invoice, CustomerRecord, Quote } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import apiClient from "@/lib/api/client";
import {
  Dialog,
  DialogFooter,
  Button,
  Input,
} from "@/components/ui";
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  User,
  Sparkles,
  AlertCircle,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (newInvoice: Invoice) => void;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onInvoiceCreated,
}: CreateInvoiceModalProps) {
  const [mode, setMode] = useState<"MANUAL" | "CONVERT_QUOTE">("MANUAL");

  // Customers & Quotes for Selection
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [title, setTitle] = useState("Commercial Solar Equipment & Installation Service");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );

  // Line items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      description: "10kVA Hybrid Solar Inverter (Deye 48V)",
      quantity: 1,
      unitPrice: 1850000,
      total: 1850000,
    },
    {
      description: "550W Tier-1 Mono Solar Panels (Pack of 10)",
      quantity: 1,
      unitPrice: 1250000,
      total: 1250000,
    },
    {
      description: "Installation, Distribution Board Sync & Safety Handover",
      quantity: 1,
      unitPrice: 350000,
      total: 350000,
    },
  ]);

  const [applyVat, setApplyVat] = useState(true); // 7.5% VAT
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers and quotes when opened
  useEffect(() => {
    if (isOpen) {
      setLoadingData(true);
      setError(null);

      Promise.all([
        apiClient.get("/customers?limit=100").catch(() => ({ data: { items: [] } })),
        apiClient.get("/quotes?limit=50").catch(() => ({ data: { items: [] } })),
      ])
        .then(([custRes, quoteRes]) => {
          const custList = custRes.data?.items || [];
          setCustomers(custList);
          if (custList.length > 0 && !selectedCustomerId) {
            setSelectedCustomerId(custList[0].id);
          }

          const quoteList = quoteRes.data?.items || [];
          setQuotes(quoteList);
          if (quoteList.length > 0 && !selectedQuoteId) {
            setSelectedQuoteId(quoteList[0].id);
          }
        })
        .finally(() => setLoadingData(false));
    }
  }, [isOpen]);

  // Handle Quote Selection for Conversion
  const handleQuoteChange = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    const q = quotes.find((item) => item.id === quoteId);
    if (q) {
      setTitle(`Invoice for ${q.title}`);
      if (q.customerRecordId) {
        setSelectedCustomerId(q.customerRecordId);
      }
    }
  };

  // Line item handlers
  const handleLineItemChange = (
    index: number,
    field: "description" | "quantity" | "unitPrice",
    val: any
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: val };
      if (field === "quantity" || field === "unitPrice") {
        const qty = field === "quantity" ? Number(val) || 0 : item.quantity;
        const price = field === "unitPrice" ? Number(val) || 0 : item.unitPrice;
        item.total = qty * price;
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "New Hardware or Service Item", quantity: 1, unitPrice: 100000, total: 100000 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const vatAmount = applyVat ? subtotal * 0.075 : 0;
  const grandTotal = subtotal + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      let res;
      if (mode === "CONVERT_QUOTE") {
        if (!selectedQuoteId) {
          setError("Please select a quote to convert.");
          return;
        }
        res = await apiClient.post(`/invoices/from-quote/${selectedQuoteId}`);
      } else {
        if (!selectedCustomerId) {
          setError("Please select a customer for this invoice.");
          return;
        }
        if (grandTotal <= 0) {
          setError("Total invoice amount must be greater than zero.");
          return;
        }

        res = await apiClient.post("/invoices", {
          customerRecordId: selectedCustomerId,
          title: title.trim(),
          amount: grandTotal,
          dueDate: new Date(dueDate).toISOString(),
          notes: notes.trim() || undefined,
        });
      }

      onInvoiceCreated(res.data);
      onClose();
    } catch (err: any) {
      console.error("Failed to create invoice:", err);
      setError(err?.response?.data?.message || "Failed to create invoice. Please check fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Commercial Invoice"
      description="Generate professional billing invoices with VAT, due dates, and multi-gateway checkout."
      maxWidth="2xl"
    >

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 gap-4 mb-2">
          <button
            type="button"
            onClick={() => setMode("MANUAL")}
            className={`pb-2 text-xs font-bold transition-colors border-b-2 -mb-[1px] ${
              mode === "MANUAL"
                ? "border-[#006937] text-[#006937]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Manual Tax Invoice
          </button>
          <button
            type="button"
            onClick={() => setMode("CONVERT_QUOTE")}
            className={`pb-2 text-xs font-bold transition-colors border-b-2 -mb-[1px] flex items-center gap-1.5 ${
              mode === "CONVERT_QUOTE"
                ? "border-[#006937] text-[#006937]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Convert from Quote</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === "CONVERT_QUOTE" ? (
            <div className="space-y-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <p className="text-xs text-slate-600 font-medium">
                Select an approved or drafted commercial proposal. All equipment line items, customer details, and pricing will automatically transfer to a formal tax invoice.
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Choose Quote to Convert <span className="text-rose-500">*</span>
                </label>
                {quotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No quotes available to convert.</p>
                ) : (
                  <select
                    value={selectedQuoteId}
                    onChange={(e) => handleQuoteChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006937]"
                  >
                    {quotes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.title} — {formatCurrency(Number(q.amount) || 0)} ({q.customerRecord?.name || "Client"})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Customer Selection & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Billed Client <span className="text-rose-500">*</span>
                  </label>
                  {customers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No customers found.</p>
                  ) : (
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006937]"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email || c.phone || "No contact"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Due Date</label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
              </div>

              {/* Invoice Title */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Invoice Title / Scope <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10kVA Commercial Hybrid Solar Installation"
                  required
                  className="text-xs"
                />
              </div>

              {/* Line Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700">Line Items & Equipment</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddLineItem}
                    className="h-7 text-xs gap-1 px-2 text-[#006937] border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </Button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center gap-2 bg-white">
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                        placeholder="Item Description"
                        className="flex-1 text-xs h-8"
                      />
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                        placeholder="Qty"
                        className="w-16 text-xs h-8 text-center"
                      />
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(idx, "unitPrice", e.target.value)}
                        placeholder="Price"
                        className="w-28 text-xs h-8 text-right font-medium"
                      />
                      <span className="w-24 text-right text-xs font-bold text-slate-800">
                        {formatCurrency(item.total)}
                      </span>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Total Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyVat}
                      onChange={(e) => setApplyVat(e.target.checked)}
                      className="rounded border-slate-300 text-[#006937] focus:ring-[#006937]"
                    />
                    <span>Apply 7.5% Nigerian VAT</span>
                  </label>
                  <span className="font-semibold text-slate-800">{formatCurrency(vatAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">Grand Total Payable</span>
                  <span className="font-black text-[#006937] text-base">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#006937] hover:bg-[#004D28] text-white font-semibold"
            >
              {loading
                ? mode === "CONVERT_QUOTE"
                  ? "Converting..."
                  : "Issuing..."
                : mode === "CONVERT_QUOTE"
                ? "Convert Quote to Invoice"
                : "Create & Issue Invoice"}
            </Button>
          </DialogFooter>
        </form>
    </Dialog>
  );
}
