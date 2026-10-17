"use client";

import React, { use } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { TenantPublicData } from "@/lib/types/portal";
import {
  TenantPortalProvider,
  PortalShell,
  TenantNotFound,
} from "@/components/portal";
import { Loader2 } from "lucide-react";

interface TenantPortalLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export default function TenantPortalLayout({
  children,
  params,
}: TenantPortalLayoutProps) {
  // Unwrap params using React.use() in Next.js 15/16, with useParams() fallback
  const resolvedParams = use(params);
  const routeParams = useParams();
  const rawSlug = resolvedParams?.tenantSlug || (routeParams?.tenantSlug as string) || "";
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  const {
    data: tenant,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TenantPublicData>({
    queryKey: ["tenant-portal", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No tenant slug specified");
      const res = await apiClient.get<TenantPublicData>(`/tenants/s/${slug}`);
      return res.data;
    },
    enabled: !!slug,
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-slate-200/80 flex items-center justify-center mb-4 animate-pulse">
          <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">
          Loading Customer Portal...
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Resolving /s/{slug || "..."}
        </p>
      </div>
    );
  }

  // Not Found / Invalid Slug state
  if (isError || !tenant) {
    return <TenantNotFound slug={slug} />;
  }

  return (
    <TenantPortalProvider
      tenant={tenant}
      isLoading={isLoading}
      isInvalid={isError}
      error={error ? (error as any).message : null}
      refetch={refetch}
    >
      <PortalShell>{children}</PortalShell>
    </TenantPortalProvider>
  );
}
