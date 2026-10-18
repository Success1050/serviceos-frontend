"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTechAuth } from "@/components/tech";
import apiClient from "@/lib/api/client";
import {
  Wrench,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Delete,
  CheckCircle2,
  Lock,
  Zap,
  Phone,
  RotateCcw,
} from "lucide-react";

export default function TechnicianLoginPage() {
  const router = useRouter();
  const { loginSession, isAuthenticated } = useTechAuth();

  // If already authenticated, redirect to job queue
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/tech/jobs");
    }
  }, [isAuthenticated, router]);

  // Screen flow: "phone" -> "pin"
  const [step, setStep] = useState<"phone" | "pin">("phone");

  // Step 1: Phone input state
  const [phone, setPhone] = useState("");
  const [requestingPin, setRequestingPin] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Step 2: PIN input state
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);

  // Countdown timer for PIN resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "pin" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // Clean and format phone number
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (phoneError) setPhoneError(null);
  };

  const handleUseDemoTech = () => {
    setPhone("+2348012345678");
    if (phoneError) setPhoneError(null);
  };

  // Step 1: Request SMS 4-Digit PIN
  const handleRequestPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPhoneError(null);

    const cleaned = phone.trim().replace(/[\s\-\(\)]/g, "");
    if (!cleaned || cleaned.length < 8) {
      setPhoneError("Please enter a valid field technician phone number.");
      return;
    }

    setRequestingPin(true);
    try {
      const res = await apiClient.post("/auth/tech/request-pin", {
        phone: cleaned,
      });

      if (res.data?.debugPin) {
        setDemoCodeHint(res.data.debugPin);
      }

      setStep("pin");
      setPinDigits(["", "", "", ""]);
      setResendCountdown(60);
    } catch (err: any) {
      console.error("Failed to request SMS PIN:", err);
      const msg =
        err.response?.data?.message ||
        "Technician profile not found or inactive. Verify your registered phone number.";
      setPhoneError(msg);
    } finally {
      setRequestingPin(false);
    }
  };

  // Step 2: Keypad entry handlers
  const handleKeypadPress = (val: string) => {
    if (pinError) setPinError(null);

    // Find the first empty digit slot
    const nextIndex = pinDigits.findIndex((d) => d === "");
    if (nextIndex !== -1) {
      const updated = [...pinDigits];
      updated[nextIndex] = val;
      setPinDigits(updated);

      // If this was the 4th digit, automatically trigger verification
      if (nextIndex === 3) {
        const fullPin = updated.join("");
        handleVerifyPin(fullPin);
      }
    }
  };

  const handleBackspace = () => {
    if (pinError) setPinError(null);

    // Find last filled digit slot
    const lastFilledIndex = [...pinDigits].reverse().findIndex((d) => d !== "");
    if (lastFilledIndex !== -1) {
      const actualIndex = 3 - lastFilledIndex;
      const updated = [...pinDigits];
      updated[actualIndex] = "";
      setPinDigits(updated);
    }
  };

  // Step 2: Verify 4-Digit PIN
  const handleVerifyPin = async (codeToVerify?: string) => {
    const pin = codeToVerify || pinDigits.join("");
    if (pin.length < 4) {
      setPinError("Please enter the complete 4-digit code.");
      return;
    }

    setVerifyingPin(true);
    setPinError(null);

    const cleaned = phone.trim().replace(/[\s\-\(\)]/g, "");

    try {
      const res = await apiClient.post("/auth/tech/verify-pin", {
        phone: cleaned,
        pin,
      });

      const { accessToken, user, requiresTermsAcknowledgment } = res.data;

      // Hydrate technician session
      loginSession(accessToken, user, !!requiresTermsAcknowledgment);
    } catch (err: any) {
      console.error("Failed to verify SMS PIN:", err);
      const msg = err.response?.data?.message || "Invalid or expired 4-digit PIN.";
      setPinError(msg);
      // Reset digit boxes on error
      setPinDigits(["", "", "", ""]);
    } finally {
      setVerifyingPin(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 md:p-10 bg-slate-900/80 md:border md:border-slate-800/90 md:rounded-3xl md:shadow-2xl text-white select-none my-auto relative">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header & Identity */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight text-white uppercase">
                ServiceOS
              </h2>
              <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                Field Technician PWA
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted SMS</span>
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-2">
            {step === "phone" ? "Field Technician Sign In" : "Enter 4-Digit PIN"}
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {step === "phone"
              ? "Passwordless mobile login for dispatched field technicians, electricians, and solar installers."
              : `We sent a 4-digit SMS login PIN to ${phone}. Enter code below to access your active jobs.`}
          </p>
        </div>
      </div>

      {/* STEP 1: PHONE NUMBER INPUT */}
      {step === "phone" ? (
        <form onSubmit={handleRequestPin} className="space-y-6 my-auto py-6">
          {phoneError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs font-semibold text-rose-300 flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{phoneError}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Registered Technician Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+234 801 234 5678"
                autoFocus
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-base font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-500">
              Accepts Nigerian standard numbers (e.g., 08012345678 or +2348012345678)
            </p>
          </div>

          {/* Quick Demo Fill Button */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2">
            <div className="text-xs text-slate-400 truncate">
              <span className="font-bold text-slate-300">Quick Test:</span> Emeka Eze (+234 801 234 5678)
            </div>
            <button
              type="button"
              onClick={handleUseDemoTech}
              className="px-2.5 py-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 rounded-lg border border-emerald-800/60 shrink-0"
            >
              Fill Demo Tech
            </button>
          </div>

          <button
            type="submit"
            disabled={requestingPin || !phone.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all text-sm font-extrabold text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {requestingPin ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending 4-Digit SMS PIN...</span>
              </>
            ) : (
              <>
                <span>Get 4-Digit PIN via SMS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* STEP 2: 4-DIGIT PIN KEYPAD ENTRY */
        <div className="space-y-6 my-auto py-2">
          {pinError && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs font-semibold text-rose-300 flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          {/* Local Development Hint Banner */}
          {demoCodeHint && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-xs font-medium text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Development SMS Code: <strong>{demoCodeHint}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const digits = demoCodeHint.split("");
                  setPinDigits(digits);
                  handleVerifyPin(demoCodeHint);
                }}
                className="text-[11px] font-bold underline text-emerald-200 hover:text-white"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* 4 Digit Boxes Display */}
          <div className="flex justify-center items-center gap-3.5">
            {[0, 1, 2, 3].map((idx) => {
              const val = pinDigits[idx];
              const isCurrent = pinDigits.findIndex((d) => d === "") === idx;
              return (
                <div
                  key={idx}
                  className={`w-14 h-16 rounded-2xl flex items-center justify-center text-2xl font-black font-mono transition-all duration-200 ${
                    val
                      ? "bg-slate-900 border-2 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20 scale-105"
                      : isCurrent
                      ? "bg-slate-900 border-2 border-slate-600 text-white animate-pulse"
                      : "bg-slate-900/60 border border-slate-800 text-slate-600"
                  }`}
                >
                  {val || "•"}
                </div>
              );
            })}
          </div>

          {/* Custom Large Mobile Keypad (1-9, Backspace, 0) */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                disabled={verifyingPin}
                className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-emerald-600 active:scale-95 text-xl font-extrabold text-white border border-slate-800 transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {num}
              </button>
            ))}

            {/* Back to Phone Screen */}
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setPinDigits(["", "", "", ""]);
                setPinError(null);
              }}
              className="h-14 rounded-2xl bg-slate-900/40 hover:bg-slate-800 active:scale-95 text-xs font-bold text-slate-400 border border-slate-800/60 transition-all flex items-center justify-center cursor-pointer"
              title="Change phone number"
            >
              <RotateCcw className="w-5 h-5 text-slate-500" />
            </button>

            {/* Digit 0 */}
            <button
              type="button"
              onClick={() => handleKeypadPress("0")}
              disabled={verifyingPin}
              className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-emerald-600 active:scale-95 text-xl font-extrabold text-white border border-slate-800 transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              onClick={handleBackspace}
              disabled={verifyingPin}
              className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 border border-slate-800 transition-all shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-50"
              title="Backspace"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>

          {/* Verification Status / Resend Countdown */}
          <div className="text-center pt-2 space-y-2">
            {verifyingPin ? (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying 4-digit PIN...</span>
              </div>
            ) : resendCountdown > 0 ? (
              <p className="text-xs text-slate-500">
                Resend SMS code in <strong className="text-slate-300">{resendCountdown}s</strong>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => handleRequestPin()}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                Resend 4-Digit SMS PIN
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer / Offline & Security Note */}
      <div className="pt-6 border-t border-slate-900/80 text-center space-y-1">
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Stage 27 Blue-Collar HR & Cryptographic OTP Protocol</span>
        </p>
        <p className="text-[10px] text-slate-600">
          Hardware-independent mobile shell for smartphone and field feature phones
        </p>
      </div>
    </div>
  );
}
