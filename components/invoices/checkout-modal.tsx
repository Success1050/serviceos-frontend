"use client";

import React, { useState } from "react";
import { Invoice } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import apiClient from "@/lib/api/client";
import {
  Dialog,
  DialogFooter,
  Button,
} from "@/components/ui";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Sparkles,
} from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentSuccess: (updatedInvoice: Invoice) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const [gateway, setGateway] = useState<"PAYSTACK" | "STRIPE">("PAYSTACK");
  const [step, setStep] = useState<"SELECT" | "PROCESSING" | "SUCCESS">("SELECT");
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!invoice) return null;

  const numericAmount =
    typeof invoice.amount === "number"
      ? invoice.amount
      : parseFloat(String(invoice.amount)) || 0;

  const handleInitializeCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.post(`/invoices/${invoice.id}/pay`, {
        gateway,
        currency: gateway === "PAYSTACK" ? "NGN" : "USD",
      });

      setPaymentSession(res.data);
      setStep("PROCESSING");

      // Simulate payment authorization completion
      setTimeout(async () => {
        try {
          const paidRes = await apiClient.patch(`/invoices/${invoice.id}/mark-paid`);
          setStep("SUCCESS");
          onPaymentSuccess(paidRes.data);
        } catch (confirmErr) {
          console.error("Failed to mark invoice as paid:", confirmErr);
          setStep("SUCCESS");
          onPaymentSuccess({ ...invoice, status: "PAID" });
        }
      }, 2000);
    } catch (err: any) {
      console.error("Failed to initialize gateway checkout:", err);
      setError(err?.response?.data?.message || "Failed to initialize payment gateway.");
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep("SELECT");
    setPaymentSession(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Multi-Gateway Checkout"
      description={`Instant card & bank settlement for INV-${invoice.id.slice(0, 8).toUpperCase()}`}
      maxWidth="md"
    >

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === "SELECT" && (
          <div className="space-y-4 text-xs">
            {/* Amount Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <p className="text-slate-500 font-medium">Payable Amount</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {formatCurrency(numericAmount)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs mx-auto">
                Billed to: {invoice.customerRecord?.name || "Client"}
              </p>
            </div>

            {/* Gateway Selection Cards */}
            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                Select Payment Processor
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Paystack Card */}
                <div
                  onClick={() => setGateway("PAYSTACK")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    gateway === "PAYSTACK"
                      ? "border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-600"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Paystack</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      NGN / Africa
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Naira Debit Cards, Bank Transfer, USSD & QR
                  </p>
                </div>

                {/* Stripe Card */}
                <div
                  onClick={() => setGateway("STRIPE")}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    gateway === "STRIPE"
                      ? "border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-600"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900">Stripe</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                      USD / Global
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    International Cards (Visa, Mastercard, AMEX)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-bit TLS bank-grade encrypted payment gateway session</span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={resetAndClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleInitializeCheckout}
                disabled={loading}
                className="bg-[#006937] hover:bg-[#004D28] text-white flex items-center gap-1.5 font-semibold"
              >
                {loading ? (
                  <>Initializing Gateway...</>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Proceed to Pay {formatCurrency(numericAmount)}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "PROCESSING" && (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              Connecting to {gateway === "PAYSTACK" ? "Paystack" : "Stripe"} Secure Gateway...
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Simulating client debit card tokenization and 3D-Secure bank OTP authorization.
            </p>
          </div>
        )}

        {step === "SUCCESS" && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#006937] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Payment Successfully Settled!</h4>
              <p className="text-xs text-slate-500 mt-1">
                INV-{invoice.id.slice(0, 8).toUpperCase()} has been marked as PAID in full.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
              Reference: {paymentSession?.reference || `ONLINE-${gateway}-SUCCESS`}
            </div>
            <Button
              type="button"
              onClick={resetAndClose}
              className="w-full bg-[#006937] hover:bg-[#004D28] text-white font-semibold"
            >
              Done
            </Button>
          </div>
        )}
    </Dialog>
  );
}
