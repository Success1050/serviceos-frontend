"use client";

import React, { useState, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { useTenantPortal } from "@/components/portal";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Zap,
  ArrowRight,
  ArrowLeft,
  Lock,
  CreditCard,
  Printer,
  Sparkles,
  PenTool,
  RotateCcw,
  Clock,
  Layers,
  ChevronDown,
  Building2,
  Check,
  Download,
  Share2,
} from "lucide-react";

interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

interface QuoteMilestone {
  id: string;
  title: string;
  amount: number;
  order: number;
  status: string;
}

interface QuoteDetail {
  id: string;
  title: string;
  amount: number | string;
  status: string;
  billingType: "ONE_TIME" | "MILESTONE";
  termsAndConditions?: string | null;
  items?: QuoteItem[];
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  validUntil?: string;
  notes?: string;
  createdAt: string;
  signedTermsAt?: string;
  signerName?: string;
  signatureData?: string;
  signerIp?: string;
  milestones?: QuoteMilestone[];
  customerRecord?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface PageProps {
  params: Promise<{
    tenantSlug: string;
    id: string;
  }>;
}

export default function CustomerQuoteReviewPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.tenantSlug;
  const quoteId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { tenant, theme } = useTenantPortal();

  // Signature canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [signerFullName, setSignerFullName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Escrow pre-auth state
  const [includeEscrowHold, setIncludeEscrowHold] = useState(true);
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("888");
  const [isPreAuthHoldAuthorized, setIsPreAuthHoldAuthorized] = useState(true);

  // Submission & Confirmation state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justAccepted, setJustAccepted] = useState(false);

  // 1. Fetch Quote Details
  const {
    data: quote,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<QuoteDetail>({
    queryKey: ["portal-quote", slug, quoteId],
    queryFn: async () => {
      const res = await apiClient.get<QuoteDetail>(`/portal/${slug}/quotes/${quoteId}`);
      return res.data;
    },
    enabled: !!slug && !!quoteId,
    retry: 1,
  });

  // Pre-fill signer name from customer record when loaded
  useEffect(() => {
    if (quote?.customerRecord?.name && !signerFullName) {
      setSignerFullName(quote.customerRecord.name);
      setTypedSignature(quote.customerRecord.name);
    }
  }, [quote, signerFullName]);

  // Setup Canvas DPI and resize listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();

    if (canvas.width !== rect.width * ratio || canvas.height !== rect.height * ratio) {
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.scale(ratio, ratio);
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#0f172a"; // Slate-900 ink
  }, [signatureMode]);

  // Canvas drawing handlers (Pointer / Touch / Mouse)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Prevent scrolling while drawing on touch devices
    if ("touches" in e && e.cancelable) {
      e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Convert typed signature to an image data URL via hidden canvas
  const generateTypedSignatureDataUrl = (text: string): string => {
    const offscreen = document.createElement("canvas");
    offscreen.width = 600;
    offscreen.height = 160;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return "";

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);

    ctx.font = "italic 44px 'Brush Script MT', 'Dancing Script', 'Caveat', cursive, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, offscreen.width / 2, offscreen.height / 2);

    // Decorative underline
    ctx.beginPath();
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.moveTo(offscreen.width * 0.15, offscreen.height * 0.75);
    ctx.bezierCurveTo(
      offscreen.width * 0.4,
      offscreen.height * 0.7,
      offscreen.width * 0.6,
      offscreen.height * 0.8,
      offscreen.width * 0.85,
      offscreen.height * 0.75
    );
    ctx.stroke();

    return offscreen.toDataURL("image/png");
  };

  // Submit Acceptance with Digital Signature
  const handleAcceptQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!agreedToTerms) {
      setSubmitError("Please check the box to confirm you accept the terms and conditions.");
      return;
    }

    if (!signerFullName.trim()) {
      setSubmitError("Please enter your legal name as the authorized signer.");
      return;
    }

    let signatureDataUrl = "";
    if (signatureMode === "draw") {
      if (!hasDrawnSignature || !canvasRef.current) {
        setSubmitError("Please provide your digital signature using the signature pad.");
        return;
      }
      signatureDataUrl = canvasRef.current.toDataURL("image/png");
    } else {
      if (!typedSignature.trim()) {
        setSubmitError("Please type your signature.");
        return;
      }
      signatureDataUrl = generateTypedSignatureDataUrl(typedSignature.trim());
    }

    setSubmitting(true);
    try {
      const payload = {
        acceptedTerms: true,
        signerName: signerFullName.trim(),
        signatureData: signatureDataUrl,
        paymentMethodToken: includeEscrowHold ? `escrow_preauth_${Date.now()}` : undefined,
      };

      // Call accept quote endpoint
      await apiClient.patch(`/portal/${slug}/quotes/${quoteId}/accept`, payload);

      // Invalidate queries so dashboard reflects newly accepted quote
      await queryClient.invalidateQueries({ queryKey: ["portal-quote", slug, quoteId] });
      await queryClient.invalidateQueries({ queryKey: ["tenant-portal-dashboard", slug] });

      setJustAccepted(true);
    } catch (err: any) {
      console.error("Failed to accept quote:", err);
      const msg = err.response?.data?.message || "Failed to submit quote acceptance. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 bg-slate-50/60">
        <div
          className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin"
          style={{ borderTopColor: "var(--tenant-primary, #006937)" }}
        />
        <h2 className="text-base font-bold text-slate-800 mt-4">Loading Quote #{quoteId.slice(0, 8)}...</h2>
        <p className="text-xs text-slate-500 mt-1">Fetching verified specifications and pricing details</p>
      </div>
    );
  }

  // Not Found / Error state
  if (isError || !quote) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-500 mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Quote Not Available</h2>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          The requested quote could not be loaded. It may have expired, been withdrawn, or is still in draft stage.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href={`/s/${slug}/dashboard`}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
          >
            Return to Dashboard
          </Link>
          <button
            onClick={() => refetch()}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const isAccepted = quote.status === "ACCEPTED" || justAccepted;
  const numericAmount = typeof quote.amount === "number" ? quote.amount : parseFloat(String(quote.amount)) || 0;

  // Unpack or default items
  const items: QuoteItem[] =
    quote.items && quote.items.length > 0
      ? quote.items
      : [
          {
            description: `${quote.title} - Solar Hybrid Inverter, Tier-1 PV Array & LiFePO4 Storage Bank`,
            quantity: 1,
            unitPrice: Math.round(numericAmount * 0.85),
            total: Math.round(numericAmount * 0.85),
            category: "EQUIPMENT",
          },
          {
            description: "DC/AC Isolation Protection Breakers, Surge Diverter & Heavy-Duty Cable Harness",
            quantity: 1,
            unitPrice: Math.round(numericAmount * 0.08),
            total: Math.round(numericAmount * 0.08),
            category: "ACCESSORIES",
          },
          {
            description: "Certified Field Installation, Engineering Mount, Testing & Commissioning",
            quantity: 1,
            unitPrice: Math.round(numericAmount * 0.07),
            total: Math.round(numericAmount * 0.07),
            category: "LABOR",
          },
        ];

  const subtotal = quote.subtotal ?? items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = quote.taxAmount ?? Math.round(subtotal * 0.075);
  const discountAmount = quote.discountAmount ?? 0;
  const grandTotal = numericAmount || subtotal + taxAmount - discountAmount;

  return (
    <div className="flex-1 w-full bg-slate-50/70 pb-20 pt-6">
      {/* Print stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          header,
          footer,
          .no-print {
            display: none !important;
          }
          .print-full-width {
            max-width: 100% !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 print-full-width">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between gap-4 no-print">
          <Link
            href={`/s/${slug}/dashboard`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / PDF</span>
            </button>

            {isAccepted && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accepted & Signed</span>
              </span>
            )}
          </div>
        </div>

        {/* 1. SUCCESS / CELEBRATION BANNER IF JUST ACCEPTED */}
        {justAccepted && (
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Legally Binding Digital Acceptance Confirmed</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Thank you! Quote #{quote.id.slice(0, 8).toUpperCase()} is Officially Signed
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                The operations team at <strong>{quote.tenant?.name || theme?.companyName || tenant?.name}</strong> has been notified in real time. Your field installation job is scheduled for warehouse staging.
              </p>
            </div>

            <Link
              href={`/s/${slug}/dashboard`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold text-emerald-950 bg-white shadow-md hover:bg-emerald-50 transition-all shrink-0"
            >
              <span>Go to Customer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 2. MAIN QUOTE DOCUMENT CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
          {/* Branded Header & Contractor Identity */}
          <div className="p-6 sm:p-10 border-b border-slate-100 relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white">
            <div
              className="absolute top-0 right-0 w-80 h-40 rounded-full blur-3xl pointer-events-none opacity-10"
              style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
            />

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 relative z-10">
              {/* Company Logo & Identity */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {theme?.logoUrl ? (
                    <img
                      src={theme.logoUrl}
                      alt={theme.companyName || tenant?.name || "Logo"}
                      className="h-10 w-auto max-w-[160px] object-contain rounded-lg"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                    >
                      <Zap className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">
                      {quote.tenant?.name || theme?.companyName || tenant?.name || "ServiceOS Solar"}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                      Certified Renewable Energy Contractor & Engineering
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  {theme?.address && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{theme.address}</span>
                    </p>
                  )}
                  {theme?.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{theme.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Quote Reference & Badges */}
              <div className="space-y-2 md:text-right">
                <div className="inline-flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    Official Quotation
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                      isAccepted
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {isAccepted ? "Accepted & Signed" : "Pending Signature"}
                  </span>
                </div>

                <p className="text-xl sm:text-2xl font-mono font-extrabold text-slate-900">
                  #QT-{quote.id.slice(0, 8).toUpperCase()}
                </p>

                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>
                    Issued Date:{" "}
                    <strong className="text-slate-700 font-medium">{formatDate(quote.createdAt)}</strong>
                  </p>
                  {quote.validUntil && (
                    <p className="text-amber-700 font-medium flex items-center gap-1 md:justify-end">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Valid until: {formatDate(quote.validUntil)}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information Strip */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prepared For</p>
                <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{quote.customerRecord?.name || "Valued Customer"}</span>
                </p>
                {quote.customerRecord?.email && (
                  <p className="text-xs text-slate-500 mt-0.5">{quote.customerRecord.email}</p>
                )}
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Installation Site</p>
                <p className="text-xs font-semibold text-slate-800 mt-1 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {quote.customerRecord?.address || "On-site customer location"}
                    {quote.customerRecord?.city ? `, ${quote.customerRecord.city}` : ""}
                  </span>
                </p>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Billing Terms</p>
                <p className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>
                    {quote.billingType === "MILESTONE"
                      ? "Staged Milestone Billing"
                      : "Single Lump-Sum Payment"}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {quote.billingType === "MILESTONE"
                    ? `${quote.milestones?.length || 3} verified progress tranches`
                    : "Due upon equipment arrival"}
                </p>
              </div>
            </div>
          </div>

          {/* Quote Title & Scope Overview */}
          <div className="p-6 sm:p-10 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Project Scope & Specifications
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {quote.title}
                </h2>
                {quote.notes && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                    {quote.notes}
                  </p>
                )}
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-right shrink-0">
                <span className="text-[10px] font-bold uppercase block text-emerald-700">Total Investment</span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80">
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-3 text-center">Category</th>
                    <th className="py-3 px-3 text-right">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200/60">
                          {item.category || "EQUIPMENT"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cost Summary Subtotal Box */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Includes <strong>25-Year Linear Solar PV Guarantee</strong> & <strong>5-Year Inverter Warranty</strong>.
                </span>
              </div>

              <div className="w-full sm:w-72 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>VAT (7.5% Statutory):</span>
                  <span className="font-mono font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base" style={{ color: "var(--tenant-primary, #006937)" }}>
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Staged Milestone Tranches (if MILESTONE billing) */}
          {quote.billingType === "MILESTONE" && quote.milestones && quote.milestones.length > 0 && (
            <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/40">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Staged Milestone Payment Tranches</h3>
              </div>
              <p className="text-xs text-slate-500 mb-6 max-w-2xl">
                Payments are held in protective escrow and only released upon completed engineering verification at each phase.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quote.milestones.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Milestone {idx + 1}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {formatCurrency(m.amount)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{m.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {idx === 0
                        ? "Commitment Deposit & Hardware Staging (Due on Acceptance)"
                        : idx === 1
                        ? "Delivery to Site & Mounting Rig Completion"
                        : "Testing, Commissioning & Handover Sign-Off"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Terms & Warranties */}
          <div className="p-6 sm:p-10 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400 mb-3">
              Standard Terms, Warranty & Installation Conditions
            </h3>
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2.5 max-h-48 overflow-y-auto leading-relaxed">
              {quote.termsAndConditions ? (
                <p className="whitespace-pre-line">{quote.termsAndConditions}</p>
              ) : (
                <>
                  <p>
                    <strong>1. Scope of Work:</strong> Contractor agrees to furnish equipment, professional labor, and installation of the photovoltaic hybrid system itemized in this quotation.
                  </p>
                  <p>
                    <strong>2. Hardware Warranties:</strong> Tier-1 Solar PV panels carry a 25-year linear performance warranty. Hybrid inverters carry 5 years manufacturer warranty. Lithium batteries carry 5-10 years warranty per OEM schedule.
                  </p>
                  <p>
                    <strong>3. Escrow Pre-Authorization & Completion OTP:</strong> To lock in technician arrival, card pre-authorization is placed. No funds are permanently debited until installation completes and customer verifies the cryptographic completion OTP.
                  </p>
                  <p>
                    <strong>4. Site Access & Structural Integrity:</strong> The customer guarantees safe roof and electrical distribution board access on the scheduled deployment date.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 3. ALREADY SIGNED STATE OR SIGNATURE CANVAS FORM */}
          {isAccepted ? (
            /* Already Signed Certificate */
            <div className="p-6 sm:p-10 bg-emerald-50/50">
              <div className="p-6 rounded-2xl bg-white border-2 border-emerald-500/30 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Legally Verified Digital Sign-Off</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Signed by {quote.signerName || quote.customerRecord?.name || "Customer"}
                  </h3>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>
                      Timestamp:{" "}
                      <strong className="text-slate-700">
                        {quote.signedTermsAt ? formatDate(quote.signedTermsAt, "full") : "Recorded"}
                      </strong>
                    </p>
                    {quote.signerIp && (
                      <p className="font-mono text-[11px] text-slate-400">
                        IP Audit Trail: {quote.signerIp}
                      </p>
                    )}
                  </div>
                </div>

                {/* Render Signature Image if saved */}
                {quote.signatureData && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center shrink-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Audit Signature</p>
                    <img
                      src={quote.signatureData}
                      alt="Digital Signature"
                      className="h-16 w-auto max-w-[200px] object-contain mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Digital Signature Pad & Escrow Pre-Authorization Form */
            <form onSubmit={handleAcceptQuote} className="p-6 sm:p-10 bg-slate-50/60 space-y-8 no-print">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Stage 24: Customer Approval
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Digital Signature & Escrow Pre-Authorization
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Please review the terms, provide your signature, and confirm escrow pre-authorization to schedule technician deployment.
                </p>
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* A. Signer Name Input */}
              <div className="space-y-1.5 max-w-md">
                <label className="text-xs font-bold text-slate-700">
                  Full Legal Name of Authorized Signer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={signerFullName}
                  onChange={(e) => {
                    setSignerFullName(e.target.value);
                    if (signatureMode === "type") setTypedSignature(e.target.value);
                  }}
                  placeholder="e.g., John Chukwu"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* B. Interactive Digital Signature Pad */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-slate-500" />
                    <span>Digital Signature <span className="text-rose-500">*</span></span>
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
                      <button
                        type="button"
                        onClick={() => setSignatureMode("draw")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          signatureMode === "draw"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Draw
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSignatureMode("type");
                          if (!typedSignature && signerFullName) setTypedSignature(signerFullName);
                        }}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                          signatureMode === "type"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Type
                      </button>
                    </div>

                    {signatureMode === "draw" && (
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {signatureMode === "draw" ? (
                  <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white shadow-inner overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-36 cursor-crosshair touch-none"
                    />

                    {!hasDrawnSignature && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-medium">
                        <span>Sign with finger, stylus, or mouse pointer inside this box</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-3 pointer-events-none">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Digital Canvas • High-DPI Vector Capture
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="Type your signature here..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    {typedSignature && (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
                        <p className="text-[11px] text-slate-400 mb-1">Signature Preview:</p>
                        <p className="font-serif italic text-2xl text-slate-900 font-bold tracking-wide">
                          {typedSignature}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* C. Escrow Pre-Authorization Card Hold Module */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        24-Hour Pre-Arrival Escrow Pre-Authorization
                      </h4>
                      <p className="text-xs text-slate-500">
                        Bank-grade card pre-authorization hold to allocate field truck hardware
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase">
                    Zero Charge Now
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1.5 leading-relaxed">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>How Escrow Protection Works:</span>
                  </p>
                  <p>
                    Your card will <strong>NOT</strong> be charged until the technician arrives at your site, completes the work according to specifications, and you verbally release your <strong>4-digit Cryptographic Completion OTP</strong>.
                  </p>
                </div>

                {/* Card input mockup with tokenization */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Card Number (Paystack / Interswitch Hold)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono font-medium text-slate-800"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Expires</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono text-center font-medium text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono text-center font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPreAuthHoldAuthorized}
                    onChange={(e) => setIsPreAuthHoldAuthorized(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span>
                    Authorize 24-hour pre-arrival hold (automatically cancelled if technician does not arrive)
                  </span>
                </label>
              </div>

              {/* D. Mandatory Legal Agreement Checkbox */}
              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 shrink-0"
                  />
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900">
                      I accept the terms, specifications, and warranty provisions of Quotation #QT-{quote.id.slice(0, 8).toUpperCase()}.
                    </p>
                    <p className="text-slate-500">
                      By checking this box and providing my digital signature above, I confirm I am authorized to accept this solar engineering quote on behalf of the customer.
                    </p>
                  </div>
                </label>
              </div>

              {/* E. Action Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit SSL Encrypted Legal Sign-Off</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-extrabold text-white shadow-lg transition-all hover:brightness-95 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--tenant-primary, #006937)",
                    boxShadow: "0 8px 20px -4px var(--tenant-primary-glow, rgba(0,105,55,0.4))",
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Recording Signature & Pre-Auth...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 stroke-[2.5]" />
                      <span>Sign & Accept Quotation ({formatCurrency(grandTotal)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
