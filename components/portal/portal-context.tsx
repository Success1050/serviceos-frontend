"use client";

import React, { createContext, useContext, useMemo } from "react";
import { TenantPublicData, PortalTheme } from "@/lib/types/portal";

interface TenantPortalContextValue {
  tenant: TenantPublicData | null;
  theme: PortalTheme;
  isLoading: boolean;
  isInvalid: boolean;
  error?: string | null;
  refetch?: () => void;
}

const defaultTheme: PortalTheme = {
  primaryColor: "#006937",
  secondaryColor: "#004d28",
  companyName: "ServiceOS Portal",
  logoUrl: undefined,
  phone: undefined,
  email: undefined,
  address: undefined,
  city: undefined,
  state: undefined,
  country: undefined,
  industry: "Field Service & Energy",
  welcomeMessage: "Welcome to our customer portal. Track your services, quotes, and active installations.",
  portalConfig: {
    enabled: true,
    allowQuotes: true,
    allowInvoices: true,
    allowPayments: true,
    allowServiceRequests: true,
    allowWarranties: true,
  },
};

const TenantPortalContext = createContext<TenantPortalContextValue>({
  tenant: null,
  theme: defaultTheme,
  isLoading: false,
  isInvalid: false,
  error: null,
});

export function TenantPortalProvider({
  children,
  tenant,
  isLoading = false,
  isInvalid = false,
  error = null,
  refetch,
}: {
  children: React.ReactNode;
  tenant: TenantPublicData | null;
  isLoading?: boolean;
  isInvalid?: boolean;
  error?: string | null;
  refetch?: () => void;
}) {
  const theme = useMemo<PortalTheme>(() => {
    if (!tenant) return defaultTheme;

    const bp = tenant.settings?.businessProfile || {};
    const br = tenant.settings?.branding || {};
    const pt = tenant.settings?.portal || {};

    const primaryColor =
      br.primaryColor ||
      tenant.settings?.primaryColor ||
      defaultTheme.primaryColor;

    const secondaryColor =
      br.secondaryColor ||
      tenant.settings?.secondaryColor ||
      defaultTheme.secondaryColor;

    const companyName =
      bp.companyName ||
      tenant.settings?.businessName ||
      tenant.name ||
      defaultTheme.companyName;

    const logoUrl = br.logoUrl || tenant.settings?.logoUrl;

    const welcomeMessage =
      pt.welcomeMessage ||
      `Welcome to ${companyName}. Manage services, quotes, and solar installations seamlessly.`;

    return {
      primaryColor,
      secondaryColor,
      companyName,
      logoUrl,
      phone: bp.phone,
      email: bp.email || pt.supportEmail,
      address: bp.address,
      city: bp.city,
      state: bp.state,
      country: bp.country,
      industry: bp.industry || "Field Services & Solar",
      welcomeMessage,
      portalConfig: {
        enabled: pt.enabled ?? true,
        allowQuotes: pt.allowQuotes ?? true,
        allowInvoices: pt.allowInvoices ?? true,
        allowPayments: pt.allowPayments ?? true,
        allowServiceRequests: pt.allowServiceRequests ?? true,
        allowWarranties: pt.allowWarranties ?? true,
        supportEmail: pt.supportEmail || bp.email,
        supportPhone: pt.supportPhone || bp.phone,
      },
    };
  }, [tenant]);

  return (
    <TenantPortalContext.Provider
      value={{
        tenant,
        theme,
        isLoading,
        isInvalid,
        error,
        refetch,
      }}
    >
      {children}
    </TenantPortalContext.Provider>
  );
}

export function useTenantPortal() {
  const context = useContext(TenantPortalContext);
  if (!context) {
    throw new Error("useTenantPortal must be used within a TenantPortalProvider");
  }
  return context;
}

export default TenantPortalContext;
