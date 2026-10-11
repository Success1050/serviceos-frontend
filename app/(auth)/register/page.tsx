"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import apiClient from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Sun,
  Wind,
  Zap,
  Wrench,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Network,
} from "lucide-react";

const INDUSTRIES = [
  {
    id: "Solar & Energy",
    title: "Solar & Renewable Energy",
    description: "Inverters, PV arrays, lithium storage & microgrids",
    icon: <Sun className="w-5 h-5 text-amber-500" />,
  },
  {
    id: "HVAC & Cooling",
    title: "HVAC & Climate Control",
    description: "Commercial chillers, VRF systems & ductwork maintenance",
    icon: <Wind className="w-5 h-5 text-sky-500" />,
  },
  {
    id: "Electrical",
    title: "Electrical & Power Systems",
    description: "High-voltage switchgear, backup generators & wiring",
    icon: <Zap className="w-5 h-5 text-yellow-500" />,
  },
  {
    id: "Commercial Maintenance",
    title: "Commercial Facility Maintenance",
    description: "Multi-site facility operations, plumbing & repair contracts",
    icon: <Wrench className="w-5 h-5 text-emerald-500" />,
  },
];

export default function RegisterOnboardingPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: User Account
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Company Profile & Subdomain
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isHq, setIsHq] = useState(false);
  const [initialBranchName, setInitialBranchName] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Step 3: Industry Selection
  const [industry, setIndustry] = useState("Solar & Energy");

  // Step 4: Localization & Tax Defaults
  const [currency, setCurrency] = useState("NGN");
  const [taxRate, setTaxRate] = useState("7.5");
  const [timezone, setTimezone] = useState("Africa/Lagos");

  // Auto-generate slug from business name
  const handleBusinessNameChange = (val: string) => {
    setBusinessName(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generated);
  };

  // Debounced slug uniqueness check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const res = await apiClient.get(`/tenants/check-slug/${slug}`);
        setSlugAvailable(res.data.available);
      } catch {
        // Fallback check against /tenants/s/:slug
        apiClient
          .get(`/tenants/s/${slug}`)
          .then(() => setSlugAvailable(false))
          .catch(() => setSlugAvailable(true));
      } finally {
        setIsCheckingSlug(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  // Validation per step
  const canProceedStep1 = firstName.trim() && lastName.trim() && email.trim() && password.length >= 8;
  const canProceedStep2 = businessName.trim() && slug.trim() && slugAvailable !== false;
  const canProceedStep3 = !!industry;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) setStep(3);
    else if (step === 3 && canProceedStep3) setStep(4);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Register User Profile
      await apiClient.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
      });

      // 2. Authenticate to obtain JWT
      const loginRes = await apiClient.post("/auth/login", {
        email,
        password,
      });
      const { accessToken } = loginRes.data;

      // 3. Provision Tenant linked to this owner
      const tenantRes = await apiClient.post(
        "/tenants",
        {
          name: businessName,
          slug,
          industry,
          phone,
          address,
          currency,
          taxRate: parseFloat(taxRate) || 7.5,
          timezone,
          isHq,
          initialBranchName: isHq && initialBranchName.trim() ? initialBranchName.trim() : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const provisionedTenant = tenantRes.data;

      // 4. Rehydrate Session with Tenant Attached
      const meRes = await apiClient.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      login(accessToken, meRes.data.user, meRes.data.tenant || provisionedTenant);

      // 5. Land on Tenant Dashboard (or HQ God-View if Corporate Franchisor)
      if (isHq) {
        router.push("/hq");
      } else {
        router.push("/app/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to complete company onboarding. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 font-sans">
      <div className="w-full max-w-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-[#006937] items-center justify-center text-white shadow-md mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Register Your Organization</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Set up your multi-tenant ServiceOS workspace in under 3 minutes
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-6 px-4">
          {[
            { num: 1, label: "Account" },
            { num: 2, label: "Company" },
            { num: 3, label: "Industry" },
            { num: 4, label: "Defaults" },
          ].map((item, idx) => {
            const isCompleted = step > item.num;
            const isCurrent = step === item.num;

            return (
              <React.Fragment key={item.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-[#006937] text-white"
                        : isCurrent
                        ? "bg-emerald-100 text-[#006937] ring-4 ring-emerald-50 border-2 border-[#006937]"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : item.num}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-1 tracking-wider uppercase ${
                      isCurrent ? "text-[#006937]" : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors ${
                      step > idx + 1 ? "bg-[#006937]" : "bg-slate-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Wizard Form Card */}
        <Card className="shadow-xl border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle>
              {step === 1 && "Step 1: Administrator Account"}
              {step === 2 && "Step 2: Company Profile & Subdomain"}
              {step === 3 && "Step 3: Industry & Field Specialties"}
              {step === 4 && "Step 4: Regional Localization & Tax Defaults"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter your credentials as the primary tenant administrator"}
              {step === 2 && "Choose your company name and unique white-label customer portal slug"}
              {step === 3 && "Tailor dispatch calendars and hardware registries to your trade"}
              {step === 4 && "Configure default billing currency, VAT rate, and timezone"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: ACCOUNT DETAILS */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    placeholder="e.g. Babajide"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="e.g. Solarin"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Work Email Address"
                  type="email"
                  placeholder="admin@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Master Password (Min. 8 characters)"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                />

                <Button type="submit" disabled={!canProceedStep1} className="w-full mt-4">
                  <span>Continue to Company Profile</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}

            {/* STEP 2: COMPANY PROFILE & SLUG */}
            {step === 2 && (
              <form onSubmit={handleNext} className="space-y-4">
                <Input
                  label="Legal Company Name"
                  placeholder="e.g. EcoPower Energy Solutions Ltd"
                  value={businessName}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" />}
                  required
                />

                <div>
                  <Input
                    label="Subdomain / Customer Portal Slug"
                    placeholder="ecopower-energy"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    helperText="Your white-labeled customer portal will be hosted at /s/:slug"
                    required
                  />

                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    {isCheckingSlug ? (
                      <span className="text-slate-400">Checking availability...</span>
                    ) : slugAvailable === true ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Portal slug &quot;{slug}&quot; is available!
                      </span>
                    ) : slugAvailable === false ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Slug &quot;{slug}&quot; is already taken. Try another name.
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Primary Business Phone"
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                  <Input
                    label="Head Office City"
                    placeholder="Lagos, Nigeria"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                </div>

                {/* Operating Structure Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Organization Operating Structure
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsHq(false)}
                      className={cn(
                        "flex flex-col text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer",
                        !isHq
                          ? "border-emerald-600 bg-emerald-50/40 text-slate-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          Single Location
                        </span>
                        {!isHq && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Independent enterprise or local branch fleet. Standard backoffice operations.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsHq(true)}
                      className={cn(
                        "flex flex-col text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer",
                        isHq
                          ? "border-emerald-600 bg-emerald-50/40 text-slate-900 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900">
                          <Network className="w-4 h-4 text-emerald-600" />
                          Franchise / Multi-Branch HQ
                        </span>
                        {isHq && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Parent HQ managing multiple regional subsidiaries or branches. Unlocks HQ God-View.
                      </p>
                    </button>
                  </div>
                </div>

                {isHq && (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <Network className="w-4 h-4 text-emerald-600" />
                      <span>Franchise HQ God-View Access</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Your master administrator will receive the <strong>HQ_ADMIN</strong> role to view aggregated metrics across all child units. You may optionally enter your first regional branch name now:
                    </p>
                    <Input
                      label="First Regional Branch / Sub-Company Name (Optional)"
                      placeholder="e.g. Abuja Central Flagship"
                      value={initialBranchName}
                      onChange={(e) => setInitialBranchName(e.target.value)}
                      helperText="You can also add more child companies later from your HQ God-View command center."
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" disabled={!canProceedStep2} className="flex-1">
                    <span>Continue to Industry</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: INDUSTRY SELECTION */}
            {step === 3 && (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-1 gap-2.5">
                  {INDUSTRIES.map((ind) => {
                    const isSelected = industry === ind.id;

                    return (
                      <div
                        key={ind.id}
                        onClick={() => setIndustry(ind.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-50/60 border-[#006937] ring-2 ring-[#006937]/20 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            {ind.icon}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{ind.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{ind.description}</div>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "bg-[#006937] border-[#006937] text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    <span>Configure Localization</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 4: LOCALIZATION & FINAL LAUNCH */}
            {step === 4 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Operational Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-[#006937]"
                    >
                      <option value="NGN">Nigerian Naira (₦ / NGN)</option>
                      <option value="USD">US Dollar ($ / USD)</option>
                      <option value="GBP">British Pound (£ / GBP)</option>
                      <option value="EUR">Euro (€ / EUR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Default VAT / Sales Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-[#006937]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Operations Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:border-[#006937]"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                    <option value="America/New_York">America/New_York (EST, UTC-5)</option>
                    <option value="Europe/London">Europe/London (GMT/BST)</option>
                  </select>
                </div>

                {/* Summary Pill */}
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#006937]" />
                    Ready to launch: {businessName}
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    Industry: <span className="font-semibold">{industry}</span> • Portal:{" "}
                    <span className="font-mono">/s/{slug}</span> • Currency: {currency}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(3)}
                    disabled={isLoading}
                    className="border-slate-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" isLoading={isLoading} className="flex-1">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Complete Setup & Launch Backoffice
                  </Button>
                </div>
              </form>
            )}

            {/* Footer Back to Login */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an enterprise account?{" "}
              <Link href="/login" className="font-semibold text-[#006937] hover:underline">
                Sign in to your tenant →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
