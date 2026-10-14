"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import apiClient from "@/lib/api/client";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Switch,
} from "@/components/ui";
import {
  Building2,
  Palette,
  Globe,
  Receipt,
  CalendarClock,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Info,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

interface TenantSettingsData {
  id?: string;
  tenantId?: string;
  businessProfile?: {
    companyName?: string;
    registrationNumber?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    currency?: string;
    taxRate?: number;
    timezone?: string;
    entityType?: string;
  };
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    darkLogoUrl?: string;
    faviconUrl?: string;
  };
  portal?: {
    enabled?: boolean;
    welcomeMessage?: string;
    allowQuotes?: boolean;
    allowInvoices?: boolean;
    allowPayments?: boolean;
    allowServiceRequests?: boolean;
    allowWarranties?: boolean;
  };
  quotes?: {
    defaultValidityDays?: number;
    requireDigitalSignature?: boolean;
    defaultTerms?: string;
  };
  invoices?: {
    paymentTerms?: string;
    taxInclusive?: boolean;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    paymentInstructions?: string;
  };
  scheduling?: {
    defaultJobDurationMinutes?: number;
    appointmentBufferMinutes?: number;
    requireCustomerSignature?: boolean;
    requireCompletionPhoto?: boolean;
    requireOtpVerification?: boolean;
    autoAssignTech?: boolean;
  };
  lockedSettings?: string[];
  lockedByHQ?: string[];
}

const DEFAULT_SETTINGS: TenantSettingsData = {
  businessProfile: {
    companyName: "",
    registrationNumber: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    currency: "NGN",
    taxRate: 7.5,
    timezone: "Africa/Lagos",
  },
  branding: {
    primaryColor: "#006937",
    secondaryColor: "#004D28",
    logoUrl: "",
    darkLogoUrl: "",
    faviconUrl: "",
  },
  portal: {
    enabled: true,
    welcomeMessage: "Welcome to our customer portal",
    allowQuotes: true,
    allowInvoices: true,
    allowPayments: true,
    allowServiceRequests: true,
    allowWarranties: true,
  },
  quotes: {
    defaultValidityDays: 30,
    requireDigitalSignature: true,
    defaultTerms: "Quotes are valid for 30 calendar days from issuance. 50% commitment deposit required.",
  },
  invoices: {
    paymentTerms: "Due on Receipt",
    taxInclusive: false,
    bankName: "",
    accountNumber: "",
    accountName: "",
    paymentInstructions: "Please reference the invoice number in transfer descriptions.",
  },
  scheduling: {
    defaultJobDurationMinutes: 120,
    appointmentBufferMinutes: 30,
    requireCustomerSignature: true,
    requireCompletionPhoto: true,
    requireOtpVerification: true,
    autoAssignTech: false,
  },
  lockedSettings: [],
  lockedByHQ: [],
};

const COLOR_PRESETS = [
  { name: "ServiceOS Emerald", primary: "#006937", secondary: "#004D28" },
  { name: "Enterprise Indigo", primary: "#4338CA", secondary: "#312E81" },
  { name: "Nordic Blue", primary: "#0284C7", secondary: "#0369A1" },
  { name: "Solar Amber", primary: "#D97706", secondary: "#B45309" },
  { name: "Slate Corporate", primary: "#0F172A", secondary: "#1E293B" },
];

const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira (₦ / NGN)" },
  { code: "USD", label: "US Dollar ($ / USD)" },
  { code: "GBP", label: "British Pound (£ / GBP)" },
  { code: "EUR", label: "Euro (€ / EUR)" },
  { code: "KES", label: "Kenyan Shilling (KSh / KES)" },
  { code: "GHS", label: "Ghanaian Cedi (GH₵ / GHS)" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const [settings, setSettings] = useState<TenantSettingsData>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<TenantSettingsData>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<"profile" | "branding" | "portal" | "invoicing" | "scheduling">("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hierarchy role detection
  const isSubCompany = Boolean(tenant?.parentId || tenant?.parentTenantId);
  const canManageHqLocks =
    !isSubCompany &&
    (user?.role === "HQ_ADMIN" ||
      user?.isSuperAdmin ||
      (user?.role === "TENANT_OWNER" && (tenant?.children?.length ?? 0) > 0));

  const loadSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsPermissionDenied(false);
    try {
      const res = await apiClient.get("/settings");
      const data = res.data;
      const merged: TenantSettingsData = {
        ...DEFAULT_SETTINGS,
        ...data,
        businessProfile: { ...DEFAULT_SETTINGS.businessProfile, ...(data.businessProfile || {}) },
        branding: { ...DEFAULT_SETTINGS.branding, ...(data.branding || {}) },
        portal: { ...DEFAULT_SETTINGS.portal, ...(data.portal || {}) },
        quotes: { ...DEFAULT_SETTINGS.quotes, ...(data.quotes || {}) },
        invoices: { ...DEFAULT_SETTINGS.invoices, ...(data.invoices || {}) },
        scheduling: { ...DEFAULT_SETTINGS.scheduling, ...(data.scheduling || {}) },
        lockedSettings: data.lockedSettings || [],
        lockedByHQ: data.lockedByHQ || [],
      };
      setSettings(merged);
      setOriginalSettings(JSON.parse(JSON.stringify(merged)));
    } catch (err: any) {
      console.error("Failed to load tenant settings", err);
      const msg = err?.message || err?.response?.data?.message || "";
      const status = err?.status || err?.statusCode || err?.response?.status;
      if (status === 403 || msg.toLowerCase().includes("permission")) {
        setIsPermissionDenied(true);
      } else {
        setErrorMessage(msg || "Failed to load tenant configuration.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Dirty state checking
  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const payload: Record<string, any> = {
        businessProfile: settings.businessProfile,
        branding: settings.branding,
        portal: settings.portal,
        quotes: settings.quotes,
        invoices: settings.invoices,
        scheduling: settings.scheduling,
      };

      // Only include lockedSettings if user is authorized to manage HQ governance
      if (canManageHqLocks) {
        payload.lockedSettings = settings.lockedSettings;
      }

      const res = await apiClient.patch("/settings", payload);
      const updated = res.data;

      const merged: TenantSettingsData = {
        ...settings,
        ...updated,
        lockedByHQ: settings.lockedByHQ, // preserve read-only context
      };
      setSettings(merged);
      setOriginalSettings(JSON.parse(JSON.stringify(merged)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Save settings failed", err);
      setErrorMessage(
        err?.response?.data?.message || "Failed to save settings. Please verify field values."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setErrorMessage(null);
  };

  // Helper to toggle HQ locks
  const toggleHqLock = (sectionKey: string) => {
    setSettings((prev) => {
      const currentLocks = new Set(prev.lockedSettings || []);
      if (currentLocks.has(sectionKey)) {
        currentLocks.delete(sectionKey);
      } else {
        currentLocks.add(sectionKey);
      }
      return { ...prev, lockedSettings: Array.from(currentLocks) };
    });
  };

  // Helper to check if section is locked by parent HQ
  const isLockedByParent = (sectionKey: string) => {
    return Boolean(isSubCompany && settings.lockedByHQ?.includes(sectionKey));
  };

  const isLockedForBranches = (sectionKey: string) => {
    return Boolean(settings.lockedSettings?.includes(sectionKey));
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          <div className="md:col-span-3 h-96 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isPermissionDenied) {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[65vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <Badge variant="warning" className="mb-3 text-[11px] font-semibold">
          Role Restricted: {user?.role ? user.role.replace(/_/g, " ") : "Staff Member"}
        </Badge>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Administrative Privileges Required
        </h2>
        <p className="text-sm text-slate-500 mt-2.5 max-w-md leading-relaxed">
          You don&apos;t have sufficient permissions to view or modify organization settings.
          Access to corporate identity, billing defaults, and dispatch rules is reserved for{" "}
          <strong className="text-slate-700">Tenant Owners</strong> and{" "}
          <strong className="text-slate-700">Franchise HQ Administrators</strong>.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/app/dashboard")}
            className="text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Dashboard
          </Button>
          <Button
            size="sm"
            onClick={loadSettings}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Access
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Settings & Governance
            </h1>
            {isSubCompany ? (
              <Badge variant="warning" className="flex items-center gap-1 text-[11px]">
                <Lock className="w-3 h-3" /> Sub-Company Branch
              </Badge>
            ) : canManageHqLocks ? (
              <Badge variant="success" className="flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3 h-3" /> Corporate Franchisor HQ
              </Badge>
            ) : (
              <Badge variant="neutral" className="text-[11px]">
                Independent Tenant
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure business identity, dynamic branding, customer self-service, and operational defaults.
          </p>
        </div>

        {/* Global Save Controls */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              disabled={isSaving}
              className="text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Discard
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!isDirty || isSaving}
            className="text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isDirty ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Settings successfully updated across your tenant workspace.</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Layout: Tabs + Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Navigation Tabs Sidebar */}
        <Card className="md:col-span-1 p-2 bg-slate-50/50 border-slate-200 shadow-xs">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#006937] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Business Profile</span>
              </div>
              {isLockedByParent("businessProfile") && (
                <Lock className={`w-3.5 h-3.5 ${activeTab === "profile" ? "text-white/80" : "text-amber-500"}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab("branding")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "branding"
                  ? "bg-[#006937] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 shrink-0" />
                <span>Branding & Identity</span>
              </div>
              {isLockedByParent("branding") && (
                <Lock className={`w-3.5 h-3.5 ${activeTab === "branding" ? "text-white/80" : "text-amber-500"}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab("portal")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "portal"
                  ? "bg-[#006937] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 shrink-0" />
                <span>Customer Portal</span>
              </div>
              {isLockedByParent("portal") && (
                <Lock className={`w-3.5 h-3.5 ${activeTab === "portal" ? "text-white/80" : "text-amber-500"}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab("invoicing")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "invoicing"
                  ? "bg-[#006937] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 shrink-0" />
                <span>Tax & Invoicing</span>
              </div>
              {isLockedByParent("invoices") && (
                <Lock className={`w-3.5 h-3.5 ${activeTab === "invoicing" ? "text-white/80" : "text-amber-500"}`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab("scheduling")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === "scheduling"
                  ? "bg-[#006937] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarClock className="w-4 h-4 shrink-0" />
                <span>Dispatch & Scheduling</span>
              </div>
              {isLockedByParent("scheduling") && (
                <Lock className={`w-3.5 h-3.5 ${activeTab === "scheduling" ? "text-white/80" : "text-amber-500"}`} />
              )}
            </button>
          </div>
        </Card>

        {/* Tab Content Panel */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: BUSINESS PROFILE */}
          {activeTab === "profile" && (
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Company Profile & Localization
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Legal business registration, official contact points, and primary jurisdiction.
                    </CardDescription>
                  </div>
                  {/* HQ Lock Toggle Banner */}
                  {canManageHqLocks && (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-900">
                        <span>Lock for Branches</span>
                        <input
                          type="checkbox"
                          checked={isLockedForBranches("businessProfile")}
                          onChange={() => toggleHqLock("businessProfile")}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isLockedByParent("businessProfile") && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Enforced by Corporate HQ:</strong> Your company profile and jurisdiction are locked across all enterprise branches.
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Legal Company Name"
                    value={settings.businessProfile?.companyName || ""}
                    disabled={isLockedByParent("businessProfile")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessProfile: { ...prev.businessProfile, companyName: e.target.value },
                      }))
                    }
                    placeholder="e.g. Sunshine Solar Ltd"
                  />
                  <Input
                    label="Registration Number (CAC / RC / TIN)"
                    value={settings.businessProfile?.registrationNumber || ""}
                    disabled={isLockedByParent("businessProfile")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessProfile: { ...prev.businessProfile, registrationNumber: e.target.value },
                      }))
                    }
                    placeholder="RC-1928472"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Official Support Phone"
                    value={settings.businessProfile?.phone || ""}
                    disabled={isLockedByParent("businessProfile")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessProfile: { ...prev.businessProfile, phone: e.target.value },
                      }))
                    }
                    placeholder="+234 800 000 0000"
                  />
                  <Input
                    label="Official Support Email"
                    type="email"
                    value={settings.businessProfile?.email || ""}
                    disabled={isLockedByParent("businessProfile")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessProfile: { ...prev.businessProfile, email: e.target.value },
                      }))
                    }
                    placeholder="support@company.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Website URL"
                    value={settings.businessProfile?.website || ""}
                    disabled={isLockedByParent("businessProfile")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessProfile: { ...prev.businessProfile, website: e.target.value },
                      }))
                    }
                    placeholder="https://sunshinesolar.com"
                  />
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                      Operating Timezone
                    </label>
                    <select
                      value={settings.businessProfile?.timezone || "Africa/Lagos"}
                      disabled={isLockedByParent("businessProfile")}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          businessProfile: { ...prev.businessProfile, timezone: e.target.value },
                        }))
                      }
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/25 focus:border-[#006937] disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                      <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                      <option value="Africa/Accra">Africa/Accra (GMT, UTC+0)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                      <option value="America/New_York">America/New_York (EST, UTC-5)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                    Physical Headquarters Address
                  </label>
                  <textarea
                    rows={2}
                    value={settings.businessProfile?.address || ""}
                    disabled={isLockedByParent("businessProfile")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessProfile: { ...prev.businessProfile, address: e.target.value },
                      }))
                    }
                    placeholder="Plot 14 Victoria Island, Lagos"
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/25 focus:border-[#006937] disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: BRANDING */}
          {activeTab === "branding" && (
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Brand Identity & Visual Theme
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Customize color tokens and logos injected into customer portals, PDF quotes, and invoice headers.
                    </CardDescription>
                  </div>
                  {canManageHqLocks && (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-900">
                        <span>Lock for Branches</span>
                        <input
                          type="checkbox"
                          checked={isLockedForBranches("branding")}
                          onChange={() => toggleHqLock("branding")}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isLockedByParent("branding") && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Enforced by Corporate HQ:</strong> Brand logos and color systems are globally enforced. Branches cannot alter the brand style.
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Live Preview Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Live Portal & PDF Header Preview
                  </span>
                  <div
                    className="p-4 rounded-lg flex items-center justify-between text-white shadow-xs transition-colors"
                    style={{ backgroundColor: settings.branding?.primaryColor || "#006937" }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center font-bold text-white text-xs">
                        {settings.businessProfile?.companyName?.slice(0, 2).toUpperCase() || "SO"}
                      </div>
                      <div>
                        <div className="font-bold text-sm tracking-tight">
                          {settings.businessProfile?.companyName || "ServiceOS Partner"}
                        </div>
                        <div className="text-[11px] text-white/80">
                          {settings.portal?.welcomeMessage || "Customer Operations Portal"}
                        </div>
                      </div>
                    </div>
                    <div
                      className="px-2.5 py-1 rounded text-xs font-semibold shadow-xs"
                      style={{ backgroundColor: settings.branding?.secondaryColor || "#004D28" }}
                    >
                      Active Theme
                    </div>
                  </div>
                </div>

                {/* Color Pickers & Presets */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                    Enterprise Color Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        disabled={isLockedByParent("branding")}
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            branding: {
                              ...prev.branding,
                              primaryColor: preset.primary,
                              secondaryColor: preset.secondary,
                            },
                          }))
                        }
                        className="p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-400 transition-all text-left flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div
                          className="w-4 h-4 rounded-full shrink-0 border border-white shadow-xs"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="text-[11px] font-medium text-slate-700 truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                      Primary Brand Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.branding?.primaryColor || "#006937"}
                        disabled={isLockedByParent("branding")}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            branding: { ...prev.branding, primaryColor: e.target.value },
                          }))
                        }
                        className="w-10 h-10 rounded border border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <Input
                        value={settings.branding?.primaryColor || "#006937"}
                        disabled={isLockedByParent("branding")}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            branding: { ...prev.branding, primaryColor: e.target.value },
                          }))
                        }
                        placeholder="#006937"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                      Secondary / Accent Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.branding?.secondaryColor || "#004D28"}
                        disabled={isLockedByParent("branding")}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            branding: { ...prev.branding, secondaryColor: e.target.value },
                          }))
                        }
                        className="w-10 h-10 rounded border border-slate-300 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <Input
                        value={settings.branding?.secondaryColor || "#004D28"}
                        disabled={isLockedByParent("branding")}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            branding: { ...prev.branding, secondaryColor: e.target.value },
                          }))
                        }
                        placeholder="#004D28"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primary Logo URL (Light Background)"
                    value={settings.branding?.logoUrl || ""}
                    disabled={isLockedByParent("branding")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, logoUrl: e.target.value },
                      }))
                    }
                    placeholder="https://res.cloudinary.com/.../logo.png"
                  />
                  <Input
                    label="Dark Mode / Inverted Logo URL"
                    value={settings.branding?.darkLogoUrl || ""}
                    disabled={isLockedByParent("branding")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        branding: { ...prev.branding, darkLogoUrl: e.target.value },
                      }))
                    }
                    placeholder="https://res.cloudinary.com/.../dark-logo.png"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: CUSTOMER PORTAL */}
          {activeTab === "portal" && (
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Customer Portal Access & Self-Service
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Control which self-service capabilities your clients can execute on `/s/{tenant?.slug || "portal"}`.
                    </CardDescription>
                  </div>
                  {canManageHqLocks && (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-900">
                        <span>Lock for Branches</span>
                        <input
                          type="checkbox"
                          checked={isLockedForBranches("portal")}
                          onChange={() => toggleHqLock("portal")}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isLockedByParent("portal") && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Enforced by Corporate HQ:</strong> Customer portal permissions are locked centrally. Sub-companies cannot disable core client portal features.
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                <Input
                  label="Portal Welcome Greeting Message"
                  value={settings.portal?.welcomeMessage || ""}
                  disabled={isLockedByParent("portal")}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      portal: { ...prev.portal, welcomeMessage: e.target.value },
                    }))
                  }
                  placeholder="Welcome to Sunshine Solar Customer Portal"
                />

                <div className="divide-y divide-slate-100">
                  <Switch
                    label="Enable Customer Self-Service Portal"
                    description="Allow end-customers to log in via secure OTP or claim invitations."
                    checked={Boolean(settings.portal?.enabled)}
                    disabled={isLockedByParent("portal")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        portal: { ...prev.portal, enabled: checked },
                      }))
                    }
                  />

                  <Switch
                    label="Review & Approve Quotes Online"
                    description="Clients can inspect solar specifications, itemized line items, and sign digital acceptance."
                    checked={Boolean(settings.portal?.allowQuotes)}
                    disabled={isLockedByParent("portal")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        portal: { ...prev.portal, allowQuotes: checked },
                      }))
                    }
                  />

                  <Switch
                    label="Pay Invoices via Payment Gateway"
                    description="Enable integrated checkout (Paystack / Stripe) for instant payment clearance."
                    checked={Boolean(settings.portal?.allowPayments)}
                    disabled={isLockedByParent("portal")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        portal: { ...prev.portal, allowPayments: checked },
                      }))
                    }
                  />

                  <Switch
                    label="Download Official Invoices & Receipts"
                    description="Provide printable PDF statements and official payment clearance vouchers."
                    checked={Boolean(settings.portal?.allowInvoices)}
                    disabled={isLockedByParent("portal")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        portal: { ...prev.portal, allowInvoices: checked },
                      }))
                    }
                  />

                  <Switch
                    label="24/7 Service Request Logging"
                    description="Clients can log inverter fault alerts, system issues, and schedule maintenance tickets."
                    checked={Boolean(settings.portal?.allowServiceRequests)}
                    disabled={isLockedByParent("portal")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        portal: { ...prev.portal, allowServiceRequests: checked },
                      }))
                    }
                  />

                  <Switch
                    label="Hardware Warranty & Asset Dossiers"
                    description="Display serial numbers, battery health logs, and warranty certificate downloads."
                    checked={Boolean(settings.portal?.allowWarranties)}
                    disabled={isLockedByParent("portal")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        portal: { ...prev.portal, allowWarranties: checked },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: TAX & INVOICING */}
          {activeTab === "invoicing" && (
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Tax Defaults & Invoicing Terms
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Establish baseline billing currencies, statutory tax rates, and corporate bank wiring details.
                    </CardDescription>
                  </div>
                  {canManageHqLocks && (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-900">
                        <span>Lock for Branches</span>
                        <input
                          type="checkbox"
                          checked={isLockedForBranches("invoices")}
                          onChange={() => toggleHqLock("invoices")}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isLockedByParent("invoices") && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Enforced by Corporate HQ:</strong> Standard tax policies and official bank wiring coordinates are locked across this franchise network.
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                      Operational Currency
                    </label>
                    <select
                      value={settings.businessProfile?.currency || "NGN"}
                      disabled={isLockedByParent("invoices")}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          businessProfile: { ...prev.businessProfile, currency: e.target.value },
                        }))
                      }
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/25 focus:border-[#006937] disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Default Statutory Tax / VAT Rate (%)"
                    type="number"
                    step="0.1"
                    value={settings.businessProfile?.taxRate ?? 7.5}
                    disabled={isLockedByParent("invoices")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessProfile: {
                          ...prev.businessProfile,
                          taxRate: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    placeholder="7.5"
                  />
                </div>

                <div className="pt-2 pb-2">
                  <Switch
                    label="Tax-Inclusive Pricing by Default"
                    description="When enabled, line item rates already include applicable VAT. When disabled, tax is added as a separate calculated charge."
                    checked={Boolean(settings.invoices?.taxInclusive)}
                    disabled={isLockedByParent("invoices")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        invoices: { ...prev.invoices, taxInclusive: checked },
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <Input
                    label="Official Bank Name"
                    value={settings.invoices?.bankName || ""}
                    disabled={isLockedByParent("invoices")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        invoices: { ...prev.invoices, bankName: e.target.value },
                      }))
                    }
                    placeholder="e.g. First Bank of Nigeria"
                  />
                  <Input
                    label="Account Number (NUBAN)"
                    value={settings.invoices?.accountNumber || ""}
                    disabled={isLockedByParent("invoices")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        invoices: { ...prev.invoices, accountNumber: e.target.value },
                      }))
                    }
                    placeholder="0123456789"
                  />
                  <Input
                    label="Account Name"
                    value={settings.invoices?.accountName || ""}
                    disabled={isLockedByParent("invoices")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        invoices: { ...prev.invoices, accountName: e.target.value },
                      }))
                    }
                    placeholder="Sunshine Solar Ltd"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide">
                    Bank Transfer & Payment Remittance Notes
                  </label>
                  <textarea
                    rows={2}
                    value={settings.invoices?.paymentInstructions || ""}
                    disabled={isLockedByParent("invoices")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        invoices: { ...prev.invoices, paymentInstructions: e.target.value },
                      }))
                    }
                    placeholder="Please include your invoice number in payment description and send receipt to billing@sunshinesolar.com"
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006937]/25 focus:border-[#006937] disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 5: SCHEDULING & DISPATCH */}
          {activeTab === "scheduling" && (
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Field Dispatch & Job Completion Rules
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Standardize technician appointments, travel buffer times, and field sign-off compliance.
                    </CardDescription>
                  </div>
                  {canManageHqLocks && (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0" />
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-indigo-900">
                        <span>Lock for Branches</span>
                        <input
                          type="checkbox"
                          checked={isLockedForBranches("scheduling")}
                          onChange={() => toggleHqLock("scheduling")}
                          className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isLockedByParent("scheduling") && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Enforced by Corporate HQ:</strong> Field job completion protocols and appointment buffer rules are standardized across branches.
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Default Estimated Job Duration (Minutes)"
                    type="number"
                    value={settings.scheduling?.defaultJobDurationMinutes ?? 120}
                    disabled={isLockedByParent("scheduling")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        scheduling: {
                          ...prev.scheduling,
                          defaultJobDurationMinutes: parseInt(e.target.value) || 60,
                        },
                      }))
                    }
                    placeholder="120"
                  />
                  <Input
                    label="Appointment Buffer Window (Minutes)"
                    type="number"
                    value={settings.scheduling?.appointmentBufferMinutes ?? 30}
                    disabled={isLockedByParent("scheduling")}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        scheduling: {
                          ...prev.scheduling,
                          appointmentBufferMinutes: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    placeholder="30"
                  />
                </div>

                <div className="divide-y divide-slate-100 pt-2">
                  <Switch
                    label="Mandatory Customer On-Site Signature"
                    description="Technicians cannot mark jobs complete without capturing customer sign-off on mobile PWA canvas."
                    checked={Boolean(settings.scheduling?.requireCustomerSignature)}
                    disabled={isLockedByParent("scheduling")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        scheduling: { ...prev.scheduling, requireCustomerSignature: checked },
                      }))
                    }
                  />

                  <Switch
                    label="Mandatory Completion Photo Upload"
                    description="Require field technicians to take and upload photos of installed solar equipment before closing the job."
                    checked={Boolean(settings.scheduling?.requireCompletionPhoto)}
                    disabled={isLockedByParent("scheduling")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        scheduling: { ...prev.scheduling, requireCompletionPhoto: checked },
                      }))
                    }
                  />

                  <Switch
                    label="Cryptographic 6-Digit Customer Completion OTP"
                    description="Trigger an SMS/Email OTP to customer which technician must input to certify final project hand-off."
                    checked={Boolean(settings.scheduling?.requireOtpVerification)}
                    disabled={isLockedByParent("scheduling")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        scheduling: { ...prev.scheduling, requireOtpVerification: checked },
                      }))
                    }
                  />

                  <Switch
                    label="Automated Smart Technician Dispatch"
                    description="Suggest optimal technician assignment based on proximity, skills, and current schedule."
                    checked={Boolean(settings.scheduling?.autoAssignTech)}
                    disabled={isLockedByParent("scheduling")}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        scheduling: { ...prev.scheduling, autoAssignTech: checked },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
