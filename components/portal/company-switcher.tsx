"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ArrowRight, Shield, X, Sparkles } from "lucide-react";
import apiClient from "@/lib/api/client";

export interface CustomerCompany {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  customerName: string;
  primaryColor?: string;
  logoUrl?: string | null;
  isCurrentTenant?: boolean;
}

interface CompanySwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  companies: CustomerCompany[];
  currentSlug: string;
  onSwitch?: (newCompany: CustomerCompany) => void;
}

export function CompanySwitcher({
  isOpen,
  onClose,
  companies,
  currentSlug,
  onSwitch,
}: CompanySwitcherProps) {
  const router = useRouter();
  const [switchingSlug, setSwitchingSlug] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectCompany = async (targetCompany: CustomerCompany) => {
    if (targetCompany.tenantSlug === currentSlug) {
      onClose();
      return;
    }

    setSwitchingSlug(targetCompany.tenantSlug);
    setErrorMessage(null);

    try {
      // Call switch-tenant endpoint to get updated JWT scoped to target company
      const res = await apiClient.post(`/portal/${currentSlug}/auth/switch-tenant`, {
        targetSlug: targetCompany.tenantSlug,
      });

      if (res.data?.accessToken) {
        localStorage.setItem("serviceos_customer_token", res.data.accessToken);
        localStorage.setItem(
          "serviceos_customer_context",
          JSON.stringify({
            tenantSlug: targetCompany.tenantSlug,
            tenantName: targetCompany.tenantName,
            customerName: targetCompany.customerName,
          })
        );
      }

      if (onSwitch) {
        onSwitch(targetCompany);
      }

      onClose();
      // Navigate to selected company's portal dashboard
      const isDashboard = typeof window !== "undefined" && window.location.pathname.includes("/dashboard");
      router.push(`/s/${targetCompany.tenantSlug}${isDashboard ? "/dashboard" : ""}`);
      router.refresh();
    } catch (err: any) {
      console.error("Failed to switch company context", err);
      setErrorMessage(err?.response?.data?.message || "Failed to switch organization");
    } finally {
      setSwitchingSlug(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Businesses & Portals</h3>
              <p className="text-[11px] text-slate-500">
                You have active equipment & services across multiple companies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Company List */}
        <div className="p-6 space-y-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Select Active Organization
          </div>

          <div className="space-y-2">
            {companies.map((company) => {
              const isCurrent = company.tenantSlug === currentSlug;
              const isSwitching = switchingSlug === company.tenantSlug;
              const primaryColor = company.primaryColor || "#006937";

              return (
                <button
                  key={company.tenantId}
                  onClick={() => handleSelectCompany(company)}
                  disabled={isSwitching}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? "border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                      <img
                        src={company.logoUrl}
                        alt={company.tenantName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl text-white font-bold text-xs flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {company.tenantName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{company.tenantName}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        /s/{company.tenantSlug}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrent ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>ServiceOS Verified Identity</span>
          </div>
          <button
            onClick={onClose}
            className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Stay on this Portal
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompanySwitcher;
