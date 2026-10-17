"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTenantPortal } from "@/components/portal";
import apiClient from "@/lib/api/client";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Mail,
  Phone,
  Zap,
  FileCheck,
  Clock,
  Sparkles,
} from "lucide-react";

interface InvitationData {
  valid: boolean;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  primaryColor?: string;
  logoUrl?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  expiresAt: string;
}

interface InvitePageProps {
  params: Promise<{ tenantSlug: string; token: string }>;
}

export default function ContextualInvitePage({ params }: InvitePageProps) {
  const router = useRouter();
  const routeParams = useParams();
  const resolvedParams = use(params);

  const slug = resolvedParams?.tenantSlug || (routeParams?.tenantSlug as string) || "";
  const token = resolvedParams?.token || (routeParams?.token as string) || "";
  const basePath = `/s/${slug}`;

  const { theme } = useTenantPortal();

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Validate Invitation Token
  const {
    data: invite,
    isLoading,
    isError,
    error,
  } = useQuery<InvitationData>({
    queryKey: ["portal-invite", slug, token],
    queryFn: async () => {
      const res = await apiClient.get<InvitationData>(
        `/portal/${slug}/invitations/${token}`
      );
      return res.data;
    },
    enabled: !!slug && !!token,
    retry: 0,
  });

  const handleClaimInvitation = async () => {
    setIsClaiming(true);
    setClaimError(null);

    try {
      const res = await apiClient.post(`/portal/${slug}/invitations/${token}/claim`, {});
      const { accessToken, customerName } = res.data;

      // Save customer session
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

      setClaimSuccess(true);
      setTimeout(() => {
        router.push(basePath);
      }, 1200);
    } catch (err: any) {
      console.error("Failed to claim invitation", err);
      setClaimError(
        err?.response?.data?.message ||
          "Failed to claim invitation. The link may have expired or already been accepted."
      );
    } finally {
      setIsClaiming(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-slate-200 flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">
          Verifying Customer Invitation...
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Validating single-use security token
        </p>
      </div>
    );
  }

  // Error / Invalid Token State
  if (isError || !invite) {
    const errorMsg =
      (error as any)?.response?.data?.message ||
      "This invitation link is invalid or has expired.";

    return (
      <div className="flex-1 w-full flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Invitation Expired or Invalid
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {errorMsg}
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href={`${basePath}/login`}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white shadow-sm"
              style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
            >
              Sign In with Phone Number Instead
            </Link>
            <Link
              href={basePath}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50"
            >
              Back to Portal Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-200/40">
      {/* Background ambient light */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] rounded-full blur-[140px] pointer-events-none -z-10 opacity-25"
        style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
      />

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden my-8">
        {/* Top badge */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Portal Invitation</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Single-Use Token
          </span>
        </div>

        {/* Company and Greeting */}
        <div className="mt-6 text-center">
          {theme.logoUrl ? (
            <img
              src={theme.logoUrl}
              alt={invite.tenantName}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs mx-auto mb-4"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl text-white font-bold text-xl flex items-center justify-center shadow-xs mx-auto mb-4"
              style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
            >
              {invite.tenantName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {invite.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-md mx-auto">
            <strong className="text-slate-900 font-semibold">{invite.tenantName}</strong> has invited you to access your personal Customer Care Portal.
          </p>
        </div>

        {/* Invitation Perks */}
        <div className="mt-8 space-y-3 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/60">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Included in your customer portal
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Live Solar & Asset Monitoring
              </div>
              <div className="text-[11px] text-slate-500">
                Track inverter health, battery state-of-charge, and warranty certificates.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: "var(--tenant-secondary, #004d28)" }}
            >
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Digital Quotes & Escrow Approvals
              </div>
              <div className="text-[11px] text-slate-500">
                Review milestone estimates and sign terms with 1-click legal compliance.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Priority Field Dispatch & SMS PIN
              </div>
              <div className="text-[11px] text-slate-500">
                Instant emergency repair requests and passwordless SMS verification.
              </div>
            </div>
          </div>
        </div>

        {/* Claim Error if any */}
        {claimError && (
          <div className="mt-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {claimError}
          </div>
        )}

        {/* Success animation or Button */}
        <div className="mt-8">
          {claimSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-scaleIn">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-emerald-950">
                Invitation Accepted!
              </div>
              <div className="text-xs text-emerald-800 mt-1">
                Entering your customer care portal...
              </div>
            </div>
          ) : (
            <button
              onClick={handleClaimInvitation}
              disabled={isClaiming}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white shadow-lg transition-all duration-200 hover:brightness-95 active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: "var(--tenant-primary, #006937)",
                boxShadow: "0 6px 20px -4px var(--tenant-primary-glow, rgba(0,105,55,0.4))",
              }}
            >
              {isClaiming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <span>Accept Invitation & Open Portal</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400">
          This invitation is linked to your registered profile ({invite.customerEmail || invite.customerPhone}).
        </div>
      </div>
    </div>
  );
}
