"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function GlobalInviteRedirectPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams?.token || "";

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    apiClient
      .get(`/invitations/${token}`)
      .then((res) => {
        if (res.data?.tenantSlug) {
          // Seamlessly route to the branded tenant contextual invitation page
          router.replace(`/s/${res.data.tenantSlug}/invite/${token}`);
        } else {
          setError("Invalid invitation data received from server");
        }
      })
      .catch((err) => {
        console.error("Failed to resolve invitation token:", err);
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "This invitation link has expired or is invalid."
        );
      });
  }, [token, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Invitation Link Invalid</h2>
          <p className="text-xs text-slate-600">{error}</p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center animate-pulse">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">Resolving Your Client Portal...</h3>
      <p className="text-xs text-slate-500">Connecting you to your verified service contractor...</p>
    </div>
  );
}
