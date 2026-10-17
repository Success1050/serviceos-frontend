"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTenantPortal } from "@/components/portal";
import { CompanySwitcher, CustomerCompany } from "@/components/portal/company-switcher";
import apiClient from "@/lib/api/client";
import {
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Building2,
} from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const { tenant, theme } = useTenantPortal();
  const slug = tenant?.slug || "";
  const basePath = `/s/${slug}`;

  // Step State: 'INPUT_PHONE' | 'VERIFY_OTP' | 'SUCCESS'
  const [step, setStep] = useState<"INPUT_PHONE" | "VERIFY_OTP" | "SUCCESS">("INPUT_PHONE");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [detectedCompanies, setDetectedCompanies] = useState<CustomerCompany[]>([]);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [verifiedCustomerName, setVerifiedCustomerName] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "VERIFY_OTP" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim()) {
      setErrorMessage("Please enter your registered phone number or email.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post(`/portal/${slug}/auth/request-otp`, {
        phone: phone.trim(),
      });

      setStep("VERIFY_OTP");
      setResendTimer(60);
      setCanResend(false);
      // Focus first OTP input on next render
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      console.error("Failed to request OTP", err);
      setErrorMessage(
        err?.response?.data?.message ||
          "Could not send verification code. Please check that this phone number is registered with this contractor."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP input change with auto-advance
  const handleOtpChange = (index: number, val: string) => {
    // If multiple digits pasted
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, "").slice(0, 6);
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || "";
      }
      setOtpDigits(newDigits);
      if (pasted.length === 6) {
        inputRefs.current[5]?.focus();
        submitOtp(newDigits.join(""));
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
      return;
    }

    const cleanChar = val.replace(/\D/g, "");
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto-advance
    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits entered, auto-submit
    if (cleanChar && index === 5 && newDigits.every((d) => d !== "")) {
      submitOtp(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP submission
  const submitOtp = async (codeToSubmit: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post(`/portal/${slug}/auth/verify-otp`, {
        phone: phone.trim(),
        code: codeToSubmit,
      });

      const { accessToken, customerName, companies } = res.data;

      // Store authenticated session
      if (typeof window !== "undefined") {
        localStorage.setItem("serviceos_customer_token", accessToken);
        localStorage.setItem(
          "serviceos_customer_context",
          JSON.stringify({
            tenantSlug: slug,
            tenantName: theme.companyName,
            customerName,
          })
        );
      }

      setVerifiedCustomerName(customerName);
      setStep("SUCCESS");

      // Check if customer belongs to multiple organizations
      if (Array.isArray(companies) && companies.length > 1) {
        setDetectedCompanies(companies);
        // Show multi-company switcher modal after a brief pause
        setTimeout(() => {
          setIsSwitcherOpen(true);
        }, 800);
      } else {
        // Redirect to customer self-serve dashboard
        setTimeout(() => {
          router.push(`${basePath}/dashboard`);
        }, 1200);
      }
    } catch (err: any) {
      console.error("OTP verification failed", err);
      setErrorMessage(
        err?.response?.data?.message || "Invalid or expired OTP code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Autofill Demo Helper
  const handleAutofillDemo = (demoPhone: string) => {
    setPhone(demoPhone);
    setErrorMessage(null);
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-200/40">
      {/* Background brand ambient light */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[140px] pointer-events-none -z-10 opacity-25"
        style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
      />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/80 p-7 sm:p-9 relative overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-100">
          <Link
            href={basePath}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal Home</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Passwordless OTP</span>
          </div>
        </div>

        {/* Company Identity */}
        <div className="flex flex-col items-center text-center mb-6">
          {theme.logoUrl ? (
            <img
              src={theme.logoUrl}
              alt={theme.companyName}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs mb-3.5"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl text-white font-bold text-lg flex items-center justify-center shadow-xs mb-3.5"
              style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
            >
              {theme.companyName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {theme.companyName}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Customer Care & Self-Service Portal
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* STEP 1: PHONE / EMAIL INPUT */}
        {step === "INPUT_PHONE" && (
          <form onSubmit={handleRequestOtp} className="space-y-5 animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Registered Phone or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 0800 111 2222 or +234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ outlineColor: "var(--tenant-primary, #006937)" }}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                We will send a 6-digit SMS code to verify your customer account.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !phone.trim()}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md transition-all duration-200 hover:brightness-95 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--tenant-primary, #006937)",
                boxShadow: "0 4px 14px -3px var(--tenant-primary-glow, rgba(0,105,55,0.3))",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Demo Quick-Autofill Pills */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Demo Test Accounts (Click to Fill)
              </div>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleAutofillDemo("08001112222")}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-xs text-slate-700 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="font-semibold">Chief John Okafor</span>
                    <span className="text-slate-400 text-[10px]">(Multi-Company)</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">08001112222</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAutofillDemo("+2348145556677")}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left text-xs text-slate-700 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="font-semibold">Dr. Olumide Adeleke</span>
                    <span className="text-slate-400 text-[10px]">(Sunshine Solar)</span>
                  </div>
                  <span className="font-mono text-slate-500 text-[11px]">08145556677</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === "VERIFY_OTP" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <span>Code sent to:</span>
                <strong className="font-bold text-slate-900">{phone}</strong>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Enter the 6-digit verification code below.
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div className="flex justify-center gap-2 sm:gap-3">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 text-center text-xl font-bold text-slate-900 focus:outline-none transition-all shadow-xs"
                  style={{
                    borderColor: digit
                      ? "var(--tenant-primary, #006937)"
                      : "#e2e8f0",
                    outlineColor: "var(--tenant-primary, #006937)",
                  }}
                />
              ))}
            </div>

            {/* Test Mode Notification */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-center">
              <span className="text-xs font-semibold text-amber-800">
                Demo Code Hint: <code className="font-mono font-bold">123456</code>
              </span>
            </div>

            {/* Submit button */}
            <button
              onClick={() => submitOtp(otpDigits.join(""))}
              disabled={isLoading || otpDigits.some((d) => d === "")}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-md transition-all duration-200 hover:brightness-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--tenant-primary, #006937)",
                boxShadow: "0 4px 14px -3px var(--tenant-primary-glow, rgba(0,105,55,0.3))",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Verify & Log In</span>
                </>
              )}
            </button>

            {/* Resend & Change Phone */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setStep("INPUT_PHONE");
                  setOtpDigits(["", "", "", "", "", ""]);
                  setErrorMessage(null);
                }}
                className="hover:underline font-medium text-slate-600"
              >
                Change Number
              </button>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Code</span>
                </button>
              ) : (
                <span className="text-slate-400">
                  Resend code in <strong className="font-mono">{resendTimer}s</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === "SUCCESS" && (
          <div className="py-8 text-center space-y-4 animate-scaleIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Welcome back, {verifiedCustomerName}!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your customer session has been verified. Redirecting to your {theme.companyName} portal...
            </p>
            <div className="pt-2">
              <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
            </div>
          </div>
        )}
      </div>

      {/* Multi-Company Switcher Modal if applicable */}
      <CompanySwitcher
        isOpen={isSwitcherOpen}
        onClose={() => {
          setIsSwitcherOpen(false);
          router.push(basePath);
        }}
        companies={detectedCompanies}
        currentSlug={slug}
        onSwitch={(selected) => {
          router.push(`/s/${selected.tenantSlug}`);
        }}
      />
    </div>
  );
}
