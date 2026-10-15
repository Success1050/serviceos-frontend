"use client";

import React, { useState, useEffect } from "react";
import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import apiClient from "@/lib/api/client";
import {
  Dialog,
  DialogFooter,
  Button,
  Input,
} from "@/components/ui";
import {
  Banknote,
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentRecorded: (updatedInvoice: Invoice) => void;
}

const NIGERIAN_BANKS = [
  "Access Bank",
  "Zenith Bank",
  "Guaranty Trust Bank (GTBank)",
  "First Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Stanbic IBTC",
  "Fidelity Bank",
  "Sterling Bank",
  "Kuda Bank",
  "Moniepoint MFB",
  "OPay",
  "Other / International Bank",
];

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");
  const [bankName, setBankName] = useState<string>("Access Bank");
  const [reference, setReference] = useState<string>("");
  const [paidAt, setPaidAt] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState<string>("");
  const [tellerSlipUrl, setTellerSlipUrl] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute total and previous payments
  const totalAmount = invoice ? Number(invoice.amount) || 0 : 0;
  const previousPaid = invoice?.paymentTransactions
    ? invoice.paymentTransactions
        .filter((t) => t.status === "SUCCESSFUL")
        .reduce((sum, t) => sum + Number(t.amount), 0)
    : 0;

  const balanceDue = Math.max(0, totalAmount - previousPaid);

  useEffect(() => {
    if (invoice) {
      setAmount(balanceDue.toString());
      setReference(`DEP-${Date.now().toString(36).toUpperCase()}`);
      setPaidAt(new Date().toISOString().split("T")[0]);
      setError(null);
    }
  }, [invoice, balanceDue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please specify a valid payment amount greater than zero.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.post(`/invoices/${invoice.id}/record-payment`, {
        amount: numAmount,
        paymentMethod,
        bankName: paymentMethod === "BANK_TRANSFER" ? bankName : undefined,
        reference: reference.trim(),
        paidAt: new Date(paidAt).toISOString(),
        notes: notes.trim() || undefined,
        tellerSlipUrl: tellerSlipUrl.trim() || undefined,
      });

      onPaymentRecorded(res.data);
      onClose();
    } catch (err: any) {
      console.error("Failed to record manual payment:", err);
      setError(err?.response?.data?.message || "Failed to record payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Record Manual Bank Payment"
      description={`Acknowledge bank wire, cash deposit, or POS slip for INV-${invoice.id.slice(0, 8).toUpperCase()}`}
      maxWidth="lg"
    >

        {/* Invoice Summary Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-400 font-medium">Billed Client</p>
            <p className="font-bold text-slate-800 truncate max-w-[200px]">
              {invoice.customerRecord?.name || "Client"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 font-medium">Balance Outstanding</p>
            <p className="font-bold text-[#006937] text-sm">{formatCurrency(balanceDue)}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Amount Paid */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Amount Paid (₦) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min="1"
              max={balanceDue}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500000"
              required
              className="text-sm font-semibold"
            />
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>Full Balance: {formatCurrency(balanceDue)}</span>
              <button
                type="button"
                onClick={() => setAmount(balanceDue.toString())}
                className="text-[#006937] hover:underline font-semibold"
              >
                Set to Full Balance
              </button>
            </div>
          </div>

          {/* Payment Method & Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006937]"
              >
                <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                <option value="CASH">Cash Deposit</option>
                <option value="POS">POS Terminal</option>
                <option value="CHEQUE">Corporate Cheque</option>
              </select>
            </div>

            {paymentMethod === "BANK_TRANSFER" && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receiving Bank</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006937]"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Transaction Reference & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reference / Deposit Slip #
              </label>
              <Input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. GTB-TRF-992144"
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
              <Input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                required
                className="text-xs"
              />
            </div>
          </div>

          {/* Teller Slip URL */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Teller Slip / Receipt Document URL (Optional)
            </label>
            <Input
              type="url"
              value={tellerSlipUrl}
              onChange={(e) => setTellerSlipUrl(e.target.value)}
              placeholder="https://storage.serviceos.ng/slips/deposit-10492.pdf"
              className="text-xs font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Narration</label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via mobile app transfer from client corporate account"
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#006937] hover:bg-[#004D28] text-white flex items-center gap-1.5"
            >
              {loading ? (
                <>Recording...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Record Payment</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
    </Dialog>
  );
}
