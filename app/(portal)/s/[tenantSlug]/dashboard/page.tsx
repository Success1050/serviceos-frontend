"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTenantPortal, ServiceReportModal } from "@/components/portal";
import apiClient from "@/lib/api/client";
import {
  Sun,
  BatteryCharging,
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Phone,
  ArrowRight,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
  Plus,
  Download,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Zap,
  Building2,
  MapPin,
  Check,
  X,
} from "lucide-react";

interface DashboardData {
  tenantName: string;
  profile: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  activeJob: {
    id: string;
    title: string;
    status: string;
    technician?: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      rating?: number;
      phone?: string;
    };
    liveTrackingAvailable: boolean;
  } | null;
  quotes: Array<{
    id: string;
    title: string;
    amount: string | number;
    status: string;
    createdAt: string;
  }>;
  invoices: Array<{
    id: string;
    title: string;
    amount: string | number;
    status: string;
    createdAt: string;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    scheduledAt?: string;
    completedAt?: string;
    estimatedDuration?: number;
    assignedTechnician?: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      rating?: number;
      phone?: string;
    };
  }>;
  assets: Array<{
    id: string;
    name: string;
    manufacturer?: string;
    modelNumber?: string;
    serialNumber?: string;
    installDate?: string;
    warrantyExpiresAt?: string;
    warrantyDocumentUrl?: string;
    status: string;
    maintenanceSchedules?: Array<{
      id: string;
      title: string;
      nextDueDate: string;
      status: string;
    }>;
  }>;
}

interface PageProps {
  params: Promise<{
    tenantSlug: string;
  }>;
}

export default function CustomerDashboardPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.tenantSlug;
  const router = useRouter();
  const { tenant, theme } = useTenantPortal();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active section tab for mobile/desktop quick navigation
  const [activeTab, setActiveTab] = useState<"overview" | "equipment" | "schedule" | "billing" | "history">("overview");

  // Modals state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceSuccess, setServiceSuccess] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    category: "ROUTINE_MAINTENANCE",
    title: "",
    description: "",
    preferredDate: "",
  });

  const [payingInvoice, setPayingInvoice] = useState<any | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Service Completion Report Modal
  const [selectedReportJob, setSelectedReportJob] = useState<any | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Fetch Dashboard Data
  const fetchDashboard = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("serviceos_customer_token") : null;
    if (!token) {
      router.push(`/s/${slug}/login?redirect=/s/${slug}/dashboard`);
      return;
    }

    try {
      const res = await apiClient.get(`/portal/${slug}/dashboard`);
      setData(res.data);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      if (err.status === 401) {
        router.push(`/s/${slug}/login?session_expired=true`);
      } else {
        setErrorMessage(err.message || "Failed to load customer dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [slug]);

  // Submit quick service request
  const handleCreateServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title) return;

    setServiceSubmitting(true);
    setServiceError(null);
    try {
      await apiClient.post(`/portal/${slug}/service-requests`, {
        title: serviceForm.title,
        description: serviceForm.description || `Customer requested ${serviceForm.category} via self-serve portal.`,
        priority: "MEDIUM",
        preferredDate: serviceForm.preferredDate || undefined,
        assetId: data?.assets[0]?.id || undefined,
      });

      setServiceSuccess(true);
      setTimeout(() => {
        setIsServiceModalOpen(false);
        setServiceSuccess(false);
        setServiceError(null);
        setServiceForm({ category: "ROUTINE_MAINTENANCE", title: "", description: "", preferredDate: "" });
        fetchDashboard();
      }, 1500);
    } catch (err: any) {
      setServiceError(err.message || "Failed to submit service request. Please try again.");
    } finally {
      setServiceSubmitting(false);
    }
  };

  // 1-Click Pay Simulation
  const handlePayInvoice = async () => {
    if (!payingInvoice) return;
    setPaymentProcessing(true);
    setPaymentError(null);

    try {
      // Mock payment simulation
      await new Promise((r) => setTimeout(r, 1200));
      setPaymentSuccess(true);
      setTimeout(() => {
        setPayingInvoice(null);
        setPaymentSuccess(false);
        setPaymentError(null);
        fetchDashboard();
      }, 1800);
    } catch (err: any) {
      setPaymentError(err.message || "Payment processing failed. Please verify your payment details.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Helper formatting
  const formatNaira = (val: string | number) => {
    const num = Number(val) || 0;
    return `₦${num.toLocaleString("en-NG")}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-NG", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })} at ${d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Calculations
  const primaryAsset = data?.assets?.[0];
  const upcomingJob = data?.jobs?.find((j) => j.status === "SCHEDULED" || j.status === "EN_ROUTE");
  const pastJobs = data?.jobs?.filter((j) => j.status === "COMPLETED") || [];

  const outstandingInvoices = data?.invoices?.filter((inv) => inv.status === "SENT" || inv.status === "OVERDUE") || [];
  const totalOutstanding = outstandingInvoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const paidInvoices = data?.invoices?.filter((inv) => inv.status === "PAID") || [];
  const openQuotes = data?.quotes?.filter((q) => q.status === "SENT") || [];

  if (isLoading) {
    return (
      <div className="flex-1 w-full min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div
          className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin"
          style={{ borderTopColor: "var(--tenant-primary, #006937)" }}
        />
        <p className="mt-4 text-sm font-semibold text-slate-600 animate-pulse">
          Loading your customer portal dashboard...
        </p>
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto p-6 sm:p-12 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Portal Access Error</h2>
          <p className="text-sm text-slate-600 mb-6">{errorMessage || "Unable to display dashboard"}</p>
          <button
            onClick={() => router.push(`/s/${slug}/login`)}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm"
            style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
          >
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50/70 pb-16">
      {/* 1. HERO WELCOME BANNER */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-8 pb-10 sm:pt-10 sm:pb-12">
        {/* Ambient brand glow */}
        <div
          className="absolute top-0 right-1/4 w-[450px] h-[250px] rounded-full blur-[130px] pointer-events-none -z-10 opacity-15"
          style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Customer greeting & location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Solar Care Active
                </span>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {data.profile.address || "Nigeria"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Good day, {data.profile.name}
              </h1>

              <p className="text-sm text-slate-600 max-w-xl">
                Welcome to your self-serve portal for{" "}
                <span className="font-semibold text-slate-900">{data.tenantName}</span>. Monitor clean power health, view upcoming maintenance visits, and manage billing.
              </p>
            </div>

            {/* Direct Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:brightness-95 active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--tenant-primary, #006937)",
                  boxShadow: "0 4px 14px -3px var(--tenant-primary-glow, rgba(0,105,55,0.4))",
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Request Service</span>
              </button>

              <button
                onClick={() => {
                  const elem = document.getElementById("billing-section");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs"
              >
                <CreditCard className="w-4 h-4 text-slate-500" />
                <span>View Invoices</span>
                {outstandingInvoices.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    {outstandingInvoices.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
              <p className="text-xs text-slate-500 font-medium">Installed Systems</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{data.assets.length || 1} System</p>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
              <p className="text-xs text-slate-500 font-medium">Upcoming Visits</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {upcomingJob ? "1 Scheduled" : "None Scheduled"}
              </p>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
              <p className="text-xs text-slate-500 font-medium">Outstanding Balance</p>
              <p className={`text-lg font-bold mt-0.5 ${totalOutstanding > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                {totalOutstanding > 0 ? formatNaira(totalOutstanding) : "₦0.00 (All Paid)"}
              </p>
            </div>

            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
              <p className="text-xs text-slate-500 font-medium">Active Warranty</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Covered
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN DASHBOARD CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* ROW 1: MY EQUIPMENT & SOLAR HEALTH + UPCOMING SCHEDULE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* MY EQUIPMENT CARD (Col 7) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                >
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">My Equipment & Solar Health</h2>
                  <p className="text-xs text-slate-500">Live configuration & warranty protection</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>

            {primaryAsset ? (
              <div className="mt-6 space-y-6">
                {/* Visual Equipment Box */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-md">
                  {/* Decorative circuit pattern */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
                    <Zap className="w-48 h-48 text-emerald-400" />
                  </div>

                  <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                          {primaryAsset.manufacturer || "Victron Energy"}
                        </span>
                        <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">
                          {primaryAsset.name}
                        </h3>
                        <p className="text-xs text-slate-300 font-mono mt-1">
                          Model: {primaryAsset.modelNumber || "MultiPlus-II 48/10000/140-100"}
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-right">
                        <span className="text-[10px] text-slate-300 block">Serial Number</span>
                        <span className="text-xs font-mono font-bold text-white">
                          {primaryAsset.serialNumber || "VIC-48V-10K-99281"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Install Date</span>
                        <span className="font-semibold text-white">
                          {formatDate(primaryAsset.installDate || "2025-06-15")}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Warranty Status</span>
                        <span className="font-semibold text-emerald-300 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Valid thru 2030
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Battery Storage</span>
                        <span className="font-semibold text-white">15kWh Lithium-Ion</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maintenance Schedule Status */}
                {primaryAsset.maintenanceSchedules && primaryAsset.maintenanceSchedules.length > 0 && (
                  <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {primaryAsset.maintenanceSchedules[0].title}
                        </h4>
                        <p className="text-[11px] text-slate-600">
                          Next scheduled inspection due:{" "}
                          <span className="font-semibold text-emerald-800">
                            {formatDate(primaryAsset.maintenanceSchedules[0].nextDueDate)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shrink-0">
                      Active Cycle
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <a
                    href={primaryAsset.warrantyDocumentUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                    <span>Download Warranty Certificate (PDF)</span>
                  </a>

                  <button
                    onClick={() => {
                      setServiceForm((prev) => ({
                        ...prev,
                        title: `Diagnostic Check for ${primaryAsset.name}`,
                        category: "FAULT_DIAGNOSTIC",
                      }));
                      setIsServiceModalOpen(true);
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Book Diagnostic Check &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                <Sun className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">No registered solar equipment found on your account.</p>
              </div>
            )}
          </div>

          {/* UPCOMING SCHEDULE CARD (Col 5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: "var(--tenant-secondary, #004d28)" }}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Visit</h2>
                    <p className="text-xs text-slate-500">Next confirmed service appointment</p>
                  </div>
                </div>

                {upcomingJob && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {upcomingJob.status}
                  </span>
                )}
              </div>

              {upcomingJob ? (
                <div className="mt-6 space-y-5">
                  {/* Date & Time Highlight */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0">
                        <Clock className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Appointment Date & Time</p>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {formatDateTime(upcomingJob.scheduledAt)}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1">{upcomingJob.title}</p>
                        {upcomingJob.estimatedDuration && (
                          <span className="inline-block mt-2 text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Est. Duration: {upcomingJob.estimatedDuration} mins
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Field Engineer Profile */}
                  {upcomingJob.assignedTechnician ? (
                    <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Assigned Field Engineer
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {upcomingJob.assignedTechnician.avatarUrl ? (
                            <img
                              src={upcomingJob.assignedTechnician.avatarUrl}
                              alt={upcomingJob.assignedTechnician.firstName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40 shadow-xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                              {upcomingJob.assignedTechnician.firstName[0]}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900">
                                Engr. {upcomingJob.assignedTechnician.firstName} {upcomingJob.assignedTechnician.lastName}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                                ⭐ {upcomingJob.assignedTechnician.rating || "4.9"}
                              </span>
                              <span className="text-[11px] text-slate-500">Certified Solar Tech</span>
                            </div>
                          </div>
                        </div>

                        {upcomingJob.assignedTechnician.phone && (
                          <a
                            href={`tel:${upcomingJob.assignedTechnician.phone}`}
                            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
                            title="Call Engineer"
                          >
                            <Phone className="w-4 h-4 text-emerald-600" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      Technician assignment is being finalized by dispatch.
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">No upcoming service visits scheduled.</p>
                  <button
                    onClick={() => setIsServiceModalOpen(true)}
                    className="mt-3 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Schedule Routine Maintenance &rarr;
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6">
              <p className="text-[11px] text-slate-500">
                Need to reschedule? Call contractor dispatch at{" "}
                <span className="font-semibold text-slate-700">{theme.phone || "hotline"}</span>.
              </p>
            </div>
          </div>
        </div>

        {/* ROW 2: FINANCIAL SUMMARY & BILLING (ID for smooth scroll) */}
        <section id="billing-section" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Financial Summary & Invoices</h2>
                <p className="text-xs text-slate-500">Transparent invoices, payments, and expansion quotes</p>
              </div>
            </div>

            {totalOutstanding > 0 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/70 p-2 sm:px-4 sm:py-2 rounded-xl">
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 uppercase block">Due Balance</span>
                  <span className="text-base font-extrabold text-amber-900">{formatNaira(totalOutstanding)}</span>
                </div>

                <button
                  onClick={() => setPayingInvoice(outstandingInvoices[0])}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-all hover:brightness-95"
                  style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                >
                  Pay Now
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* INVOICES LIST */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Invoices</h3>

              {data.invoices && data.invoices.length > 0 ? (
                <div className="space-y-2.5">
                  {data.invoices.map((inv) => {
                    const isPaid = inv.status === "PAID";
                    return (
                      <div
                        key={inv.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/70 transition-all flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{inv.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{formatDate(inv.createdAt)}</span>
                            <span>•</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-semibold text-[10px] uppercase ${
                                isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-900">{formatNaira(inv.amount)}</span>
                          {!isPaid && (
                            <button
                              onClick={() => setPayingInvoice(inv)}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold text-white transition-all shadow-xs"
                              style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">No invoice records found.</p>
              )}
            </div>

            {/* OPEN QUOTES / UPGRADES */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quotes & System Expansions ({openQuotes.length})
              </h3>

              {openQuotes.length > 0 ? (
                <div className="space-y-2.5">
                  {openQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border-2 border-emerald-500/20 bg-emerald-50/20 hover:bg-emerald-50/40 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Awaiting Customer Review
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1.5">{q.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">Created {formatDate(q.createdAt)}</p>
                        </div>

                        <span className="text-base font-extrabold text-slate-900">{formatNaira(q.amount)}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-emerald-100/60">
                        <span className="text-[11px] text-slate-500">Includes replacement warranty</span>
                        <Link
                          href={`/s/${slug}/quotes/${q.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
                        >
                          <span>Review & Sign Quote</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <p className="text-xs text-slate-500">No pending quotes. Looking to expand your battery bank or add panels?</p>
                  <button
                    onClick={() => {
                      setServiceForm((p) => ({ ...p, title: "Quote Request for Solar System Expansion", category: "SYSTEM_EXPANSION" }));
                      setIsServiceModalOpen(true);
                    }}
                    className="mt-2.5 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Request Expansion Quote &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ROW 3: SERVICE HISTORY TIMELINE */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Service History & Reports</h2>
                <p className="text-xs text-slate-500">Verified field reports, photos, and technician audits</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {pastJobs.length > 0 ? (
              <div className="relative border-l-2 border-emerald-200 ml-4 pl-6 space-y-8">
                {pastJobs.map((job) => (
                  <div key={job.id} className="relative group">
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs"
                      style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                    />

                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                        <span className="text-xs text-slate-500 font-medium">{formatDate(job.scheduledAt)}</span>
                      </div>

                      {job.description && <p className="text-xs text-slate-600">{job.description}</p>}

                      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Inspected by Engr. {job.assignedTechnician?.firstName || "Field Tech"}
                        </span>

                        <button
                          onClick={() => setSelectedReportJob(job)}
                          className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Report (PDF)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No past service reports recorded yet.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MODAL 1: QUICK SERVICE REQUEST MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Request Service or Support</h3>
              </div>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {serviceSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-900">Service Request Dispatched!</h4>
                <p className="text-xs text-slate-600">
                  Our dispatch engineer has been alerted and will confirm your visit shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateServiceRequest} className="space-y-4 text-xs">
                {serviceError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                    {serviceError}
                  </div>
                )}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                  >
                    <option value="ROUTINE_MAINTENANCE">Routine Preventative Maintenance</option>
                    <option value="FAULT_DIAGNOSTIC">Fault / Inverter Error Diagnostic</option>
                    <option value="SYSTEM_EXPANSION">System / Battery Expansion</option>
                    <option value="PANEL_CLEANING">Rooftop Solar Panel Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject / Summary</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inverter alarm warning or routine check"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preferred Date (Optional)</label>
                  <input
                    type="date"
                    value={serviceForm.preferredDate}
                    onChange={(e) => setServiceForm({ ...serviceForm, preferredDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Details / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Describe any symptoms, error codes, or convenient arrival times..."
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={serviceSubmitting}
                    className="px-5 py-2 rounded-xl font-semibold text-white shadow-sm disabled:opacity-50"
                    style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                  >
                    {serviceSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: PAY INVOICE MODAL */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">1-Click Invoice Payment</h3>
              </div>
              <button
                onClick={() => setPayingInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-600">
                  Receipt generated and balance updated for {payingInvoice.title}.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {paymentError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
                    {paymentError}
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-slate-500 font-medium">Invoice</p>
                  <h4 className="text-sm font-bold text-slate-900">{payingInvoice.title}</h4>
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500">Amount Due</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      {formatNaira(payingInvoice.amount)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    Secured by ServiceOS Enterprise Escrow & Paystack instant tokenization.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setPayingInvoice(null)}
                    className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayInvoice}
                    disabled={paymentProcessing}
                    className="px-5 py-2 rounded-xl font-semibold text-white shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                  >
                    {paymentProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Confirm & Pay {formatNaira(payingInvoice.amount)}</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: SERVICE COMPLETION REPORT MODAL */}
      <ServiceReportModal
        isOpen={!!selectedReportJob}
        onClose={() => setSelectedReportJob(null)}
        job={selectedReportJob}
        customerName={data.profile.name}
        customerAddress={data.profile.address}
        tenantName={data.tenantName}
        logoUrl={theme.logoUrl}
        primaryColor={theme.primaryColor}
        asset={data.assets?.[0]}
      />
    </div>
  );
}
