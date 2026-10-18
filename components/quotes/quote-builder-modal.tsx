"use client";

import React, { useState, useEffect, useMemo } from "react";
import apiClient from "@/lib/api/client";
import { Quote, CustomerRecord, BillingType, QuoteLineItem, QuoteMilestone } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button, Input, Dialog } from "@/components/ui";
import {
  FileText,
  Plus,
  Trash2,
  Percent,
  Receipt,
  Layers,
  Sparkles,
  User,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Send,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Tag,
} from "lucide-react";

interface QuoteBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuoteCreated: (quote: Quote) => void;
  customers?: CustomerRecord[];
  preselectedCustomerId?: string;
  initialQuote?: Quote | null;
}

const CATALOG_PRESETS: Array<{
  description: string;
  unitPrice: number;
  category: QuoteLineItem["category"];
  badge: string;
}> = [
  { description: "10kVA Hybrid Solar Inverter (Deye 48V)", unitPrice: 1850000, category: "EQUIPMENT", badge: "Inverter" },
  { description: "5kVA Off-Grid Solar Inverter (Growatt SPF)", unitPrice: 980000, category: "EQUIPMENT", badge: "Inverter" },
  { description: "550W Tier-1 Mono Solar Panels (Pack of 10 - Jinko)", unitPrice: 1250000, category: "EQUIPMENT", badge: "Solar PV" },
  { description: "15kWh Lithium FePO4 Storage Bank (Felicity 300Ah)", unitPrice: 2400000, category: "EQUIPMENT", badge: "Battery" },
  { description: "10kWh Wall-Mount Lithium Storage (Deye Powerwall)", unitPrice: 1950000, category: "EQUIPMENT", badge: "Battery" },
  { description: "DC Combiner Box, Surge Protectors & AC Breakers", unitPrice: 180000, category: "MATERIALS", badge: "Switchgear" },
  { description: "Aluminum Rail Mounting Racks & 16mm Grounding Cabling", unitPrice: 220000, category: "MATERIALS", badge: "Mounting" },
  { description: "Certified Installation, Grounding & Commissioning Labor", unitPrice: 350000, category: "LABOR", badge: "Labor" },
  { description: "Preventative Bi-Annual Service Plan (1 Year Coverage)", unitPrice: 150000, category: "LABOR", badge: "Maintenance" },
];

const DEFAULT_TERMS = `1. Pricing validity: 14 days from issue date.
2. Inverter carries a 5-year OEM warranty; Solar PV modules carry a 25-year performance warranty; Lithium batteries carry a 10-year cycle warranty.
3. Client must grant roof and electrical distribution board access during the installation window.
4. Final grid handover and commissioning certificate issued subject to digital sign-off and safety testing.`;

export function QuoteBuilderModal({
  isOpen,
  onClose,
  onQuoteCreated,
  customers: initialCustomers,
  preselectedCustomerId,
  initialQuote,
}: QuoteBuilderModalProps) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers || []);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(preselectedCustomerId || "");
  const [siteAddress, setSiteAddress] = useState<string>("");
  const [title, setTitle] = useState("Complete 10kVA Commercial Solar Installation Proposal");
  const [billingType, setBillingType] = useState<BillingType>("FIXED");
  const [validityDays, setValidityDays] = useState<"7" | "14" | "30" | "CUSTOM">("14");
  const [customValidDate, setCustomValidDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [scopeNotes, setScopeNotes] = useState<string>(
    "Standard roof-mounted array with dedicated AC isolator switch and surge protection at main distribution panel."
  );
  const [terms, setTerms] = useState(DEFAULT_TERMS);

  // Line Items
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([
    { description: "10kVA Hybrid Solar Inverter (Deye 48V)", quantity: 1, unitPrice: 1850000, total: 1850000, category: "EQUIPMENT" },
    { description: "550W Tier-1 Mono Solar Panels (Pack of 10 - Jinko)", quantity: 1, unitPrice: 1250000, total: 1250000, category: "EQUIPMENT" },
    { description: "15kWh Lithium FePO4 Storage Bank (Felicity 300Ah)", quantity: 1, unitPrice: 2400000, total: 2400000, category: "EQUIPMENT" },
    { description: "Certified Installation, Grounding & Commissioning Labor", quantity: 1, unitPrice: 350000, total: 350000, category: "LABOR" },
  ]);

  // Discounts & Tax
  const [discountType, setDiscountType] = useState<"NONE" | "PERCENT" | "FLAT">("PERCENT");
  const [discountValue, setDiscountValue] = useState<number>(5); // 5% promotional discount
  const [applyVat, setApplyVat] = useState<boolean>(true); // 7.5% VAT

  // Milestone Schedule
  const [milestones, setMilestones] = useState<QuoteMilestone[]>([
    { title: "Upfront Procurement & Hardware Mobilization", percentage: 60, amount: 0, order: 1 },
    { title: "On-Site Delivery & Roof Array Mounting", percentage: 30, amount: 0, order: 2 },
    { title: "Inverter Grid Sync & Safety Handover", percentage: 10, amount: 0, order: 3 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active selected customer details
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Update siteAddress when customer changes
  useEffect(() => {
    if (selectedCustomer && !siteAddress) {
      const addr = [selectedCustomer.address, selectedCustomer.city].filter(Boolean).join(", ");
      setSiteAddress(addr);
    }
  }, [selectedCustomer, siteAddress]);

  // Fetch customers if not provided
  useEffect(() => {
    if (isOpen && (!customers || customers.length === 0)) {
      setLoadingCustomers(true);
      apiClient
        .get("/customers?limit=100")
        .then((res) => {
          const list = res.data?.items || (Array.isArray(res.data) ? res.data : []);
          setCustomers(list);
          if (list.length > 0 && !selectedCustomerId) {
            setSelectedCustomerId(list[0].id);
          }
        })
        .catch((err) => {
          console.warn("Failed to load customers for quote builder:", err);
        })
        .finally(() => setLoadingCustomers(false));
    }
  }, [isOpen]);

  // Prepopulate if editing existing quote
  useEffect(() => {
    if (initialQuote) {
      setTitle(initialQuote.title);
      setSelectedCustomerId(initialQuote.customerRecordId);
      setBillingType(initialQuote.billingType || "FIXED");
      if (initialQuote.termsAndConditions) setTerms(initialQuote.termsAndConditions);
      if (initialQuote.items && initialQuote.items.length > 0) {
        setLineItems(initialQuote.items);
      }
      if (initialQuote.validUntil) {
        setCustomValidDate(initialQuote.validUntil.split("T")[0]);
        setValidityDays("CUSTOM");
      }
      if (initialQuote.milestones && initialQuote.milestones.length > 0) {
        setMilestones(initialQuote.milestones);
      }
    }
  }, [initialQuote]);

  // Expiration calculation
  const calculatedValidUntil = useMemo(() => {
    if (validityDays === "CUSTOM") {
      return customValidDate;
    }
    const days = parseInt(validityDays, 10) || 14;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }, [validityDays, customValidDate]);

  // Pricing Calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [lineItems]);

  const discountAmount = useMemo(() => {
    if (discountType === "PERCENT") {
      return Math.round((subtotal * discountValue) / 100);
    }
    if (discountType === "FLAT") {
      return Math.min(subtotal, discountValue);
    }
    return 0;
  }, [subtotal, discountType, discountValue]);

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const vatAmount = applyVat ? Math.round(taxableBase * 0.075) : 0;
  const grandTotal = taxableBase + vatAmount;

  // Auto-calculate milestone amounts whenever grandTotal changes
  useEffect(() => {
    setMilestones((prev) =>
      prev.map((m) => ({
        ...m,
        amount: Math.round((grandTotal * m.percentage) / 100),
      }))
    );
  }, [grandTotal]);

  const milestoneTotalPct = milestones.reduce((sum, m) => sum + Number(m.percentage), 0);

  // Line Item Handlers
  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        description: "Custom Solar Equipment / Service Item",
        quantity: 1,
        unitPrice: 100000,
        total: 100000,
        category: "EQUIPMENT",
      },
    ]);
  };

  const handleApplyCatalogPreset = (preset: (typeof CATALOG_PRESETS)[0]) => {
    setLineItems((prev) => [
      ...prev,
      {
        description: preset.description,
        quantity: 1,
        unitPrice: preset.unitPrice,
        total: preset.unitPrice,
        category: preset.category,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof QuoteLineItem, value: any) => {
    setLineItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        item.total = Number(item.quantity) * Number(item.unitPrice);
      }
      copy[index] = item;
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent, shouldSend: boolean = false) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError("Please select a customer for this proposal.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a quote title.");
      return;
    }

    if (lineItems.length === 0) {
      setError("Please include at least one equipment or labor item.");
      return;
    }

    if (billingType === "MILESTONE" && Math.round(milestoneTotalPct) !== 100) {
      setError(`Milestone percentages must total exactly 100%. Currently: ${milestoneTotalPct}%`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        amount: grandTotal,
        customerRecordId: selectedCustomerId,
        billingType,
        termsAndConditions: terms,
        items: lineItems,
        subtotal,
        discountAmount,
        taxAmount: vatAmount,
        validUntil: calculatedValidUntil,
        notes: scopeNotes.trim()
          ? `${scopeNotes.trim()}${siteAddress ? `\nSite Location: ${siteAddress}` : ""}`
          : siteAddress
          ? `Site Location: ${siteAddress}`
          : undefined,
        milestones:
          billingType === "MILESTONE"
            ? milestones.map((m, idx) => ({
                title: m.title,
                percentage: Number(m.percentage),
                amount: Math.round((grandTotal * Number(m.percentage)) / 100),
                order: idx + 1,
              }))
            : undefined,
      };

      let res;
      if (initialQuote) {
        res = await apiClient.patch(`/quotes/${initialQuote.id}`, payload);
      } else {
        res = await apiClient.post("/quotes", payload);
      }

      let createdQuote = res.data;

      // If user chose "Save & Send", trigger send immediately
      if (shouldSend && createdQuote?.id) {
        try {
          const sendRes = await apiClient.post(`/quotes/${createdQuote.id}/send`);
          createdQuote = sendRes.data || createdQuote;
        } catch (sendErr) {
          console.warn("Auto-send failed, but quote was saved:", sendErr);
        }
      }

      onQuoteCreated(createdQuote);
      onClose();
    } catch (err: any) {
      console.error("Quote save error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save quote. Please verify details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialQuote ? "Edit Commercial Proposal & Quote" : "Interactive Solar Quote Builder & Pricing Engine"}
      description="Draft customized hardware line items, configure discounts & 7.5% VAT, set validity cycles, and structure milestone payment tranches."
      maxWidth="3xl"
    >
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Client Selection & Project Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Client / Asset Owner <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  const c = customers.find((cust) => cust.id === e.target.value);
                  if (c) {
                    setSiteAddress([c.address, c.city].filter(Boolean).join(", "));
                  }
                }}
                disabled={loadingCustomers}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
              >
                <option value="">-- Choose a registered customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.city ? `(${c.city})` : ""} {c.phone ? `· ${c.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Proposal / Project Title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 10kVA Commercial Solar Hybrid Package"
              required
            />
          </div>
        </div>

        {/* Selected Customer & Site Location Preview */}
        {selectedCustomer && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{selectedCustomer.name}</span>
                {selectedCustomer.phone && (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {selectedCustomer.phone}
                  </span>
                )}
                {selectedCustomer.email && (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> {selectedCustomer.email}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-[#006937] shrink-0" />
                <span className="font-medium">Site Address:</span>
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  placeholder="Installation address (e.g. Plot 14, Admiralty Way, Lekki)"
                  className="bg-white px-2 py-1 rounded border border-slate-200 text-xs text-slate-800 w-72 focus:outline-none focus:ring-1 focus:ring-[#006937]"
                />
              </div>
            </div>

            <div className="text-[11px] font-semibold text-[#006937] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
              ✓ CRM Linked
            </div>
          </div>
        )}

        {/* Catalog Quick Insertion Presets */}
        <div>
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Solar Equipment Catalog Presets (Click to insert item)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {CATALOG_PRESETS.map((preset) => (
              <button
                key={preset.description}
                type="button"
                onClick={() => handleApplyCatalogPreset(preset)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-[#006937] hover:border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3 text-[#006937]" />
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                  {preset.badge}
                </span>
                <span className="truncate max-w-[170px]">{preset.description.split("(")[0]}</span>
                <span className="text-[10px] text-slate-500 font-mono font-semibold">
                  {formatCurrency(preset.unitPrice)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Line Items Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-[#006937]" />
              Proposal Line Items ({lineItems.length})
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLineItem}
              className="text-xs h-7 gap-1 bg-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Item
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {lineItems.map((item, index) => (
              <div
                key={index}
                className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 hover:bg-slate-50/50 transition-colors"
              >
                {/* Category selector */}
                <div className="w-28 shrink-0">
                  <select
                    value={item.category || "EQUIPMENT"}
                    onChange={(e) => handleUpdateItem(index, "category", e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006937]"
                  >
                    <option value="EQUIPMENT">Hardware</option>
                    <option value="MATERIALS">Materials</option>
                    <option value="LABOR">Labor</option>
                    <option value="PERMIT">Permits/Fees</option>
                  </select>
                </div>

                {/* Description */}
                <div className="flex-1 w-full">
                  <Input
                    value={item.description}
                    onChange={(e) => handleUpdateItem(index, "description", e.target.value)}
                    placeholder="Item description or service scope"
                    className="text-xs h-8"
                  />
                </div>

                {/* Quantity × Unit Price = Total */}
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <div className="w-16">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(index, "quantity", parseInt(e.target.value, 10) || 1)}
                      className="text-xs h-8 text-center"
                      title="Quantity"
                    />
                  </div>

                  <span className="text-slate-400 text-xs">×</span>

                  <div className="w-28">
                    <Input
                      type="number"
                      min="0"
                      step="500"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="text-xs h-8 text-right font-mono"
                      title="Unit Price in NGN"
                    />
                  </div>

                  <div className="w-28 text-right font-mono font-bold text-xs text-slate-900 pr-1">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary, Discounts & Validity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          {/* Discount Controls & Validity */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Discounts, Tax & Validity Cycle
            </span>

            {/* Discount selector */}
            <div className="flex items-center gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
              >
                <option value="NONE">No Discount</option>
                <option value="PERCENT">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₦)</option>
              </select>

              {discountType !== "NONE" && (
                <div className="w-28">
                  <Input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="text-xs h-8"
                    placeholder={discountType === "PERCENT" ? "5%" : "₦50,000"}
                  />
                </div>
              )}
            </div>

            {/* Tax Checkbox */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={applyVat}
                onChange={(e) => setApplyVat(e.target.checked)}
                className="rounded border-slate-300 text-[#006937] focus:ring-[#006937]"
              />
              <span>Apply Standard Value Added Tax (VAT @ 7.5%)</span>
            </label>

            {/* Expiration date picker */}
            <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Quote Expiration Cycle (Validity)
              </label>
              <div className="flex items-center gap-1.5">
                {(["7", "14", "30", "CUSTOM"] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setValidityDays(opt)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      validityDays === opt
                        ? "bg-[#006937] text-white border-[#006937]"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {opt === "CUSTOM" ? "Custom Date" : `${opt} Days`}
                  </button>
                ))}
              </div>
              {validityDays === "CUSTOM" ? (
                <input
                  type="date"
                  value={customValidDate}
                  onChange={(e) => setCustomValidDate(e.target.value)}
                  className="mt-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                />
              ) : (
                <p className="text-[11px] text-slate-500 font-medium">
                  Valid until: <strong className="text-slate-800">{calculatedValidUntil}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Real-time Financial Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-600 divide-y divide-slate-200/60 flex flex-col justify-center">
            <div className="flex justify-between py-1">
              <span>Items Subtotal:</span>
              <span className="font-mono font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between py-1 text-emerald-700">
                <span>Commercial Discount:</span>
                <span className="font-mono font-semibold">- {formatCurrency(discountAmount)}</span>
              </div>
            )}

            {applyVat && (
              <div className="flex justify-between py-1">
                <span>Value Added Tax (7.5%):</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency(vatAmount)}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 text-sm font-bold text-slate-900">
              <span className="text-[#006937]">Grand Total (Payable):</span>
              <span className="font-mono text-base text-[#006937]">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Billing Model & Milestone Tranches */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Billing Model & Payment Structure
              </span>
              <span className="text-[11px] text-slate-500">
                Choose between single lump-sum completion or staged project tranche disbursements.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBillingType("FIXED")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  billingType === "FIXED"
                    ? "bg-[#006937] text-white border-[#006937] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Fixed Lump-Sum
              </button>
              <button
                type="button"
                onClick={() => setBillingType("MILESTONE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingType === "MILESTONE"
                    ? "bg-[#006937] text-white border-[#006937] shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Milestone Tranches
              </button>
            </div>
          </div>

          {billingType === "MILESTONE" && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600">
                  Project Tranche Breakdown
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    Math.round(milestoneTotalPct) === 100
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  Sum: {milestoneTotalPct}% {milestoneTotalPct === 100 ? "✓ Balanced" : "≠ 100%"}
                </span>
              </div>

              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <Input
                        value={m.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMilestones((prev) => {
                            const c = [...prev];
                            c[idx].title = val;
                            return c;
                          });
                        }}
                        className="text-xs h-7"
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={m.percentage}
                        onChange={(e) => {
                          const pct = parseFloat(e.target.value) || 0;
                          setMilestones((prev) => {
                            const c = [...prev];
                            c[idx].percentage = pct;
                            c[idx].amount = Math.round((grandTotal * pct) / 100);
                            return c;
                          });
                        }}
                        className="text-xs h-7 text-center font-bold"
                      />
                    </div>
                    <span className="text-slate-400 font-bold">%</span>
                    <span className="w-28 text-right font-mono font-bold text-slate-800 pr-1">
                      {formatCurrency(m.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scope Notes & Technical Specifications */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Engineering Scope Notes & Installation Site Requirements
          </label>
          <textarea
            rows={2}
            value={scopeNotes}
            onChange={(e) => setScopeNotes(e.target.value)}
            placeholder="e.g. Roof tilt angle, DB changeover switch capacity, earth resistance target (<5 ohms)"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
          />
        </div>

        {/* Terms & Conditions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Commercial Terms, Warranties & Conditions
          </label>
          <textarea
            rows={3}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006937]/20 focus:border-[#006937] transition-all"
          />
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-3 -mx-6 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="text-xs font-semibold px-4 h-9 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white h-9 px-4 shadow-sm cursor-pointer"
          >
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, true)}
            className="text-xs font-semibold bg-[#006937] hover:bg-[#004D28] text-white h-9 px-5 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Save & Send to Client</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
