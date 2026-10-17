/**
 * Tenant Customer Portal Types & Interfaces (Phase 4 / Day 14)
 */

export interface TenantBusinessProfile {
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  currency?: string;
  industry?: string;
  taxRate?: number;
  website?: string;
  timezone?: string;
  isHq?: boolean;
  entityType?: string;
  registrationNumber?: string;
}

export interface TenantBranding {
  logoUrl?: string;
  faviconUrl?: string;
  darkLogoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface TenantPortalConfig {
  enabled?: boolean;
  welcomeMessage?: string;
  allowQuotes?: boolean;
  allowInvoices?: boolean;
  allowPayments?: boolean;
  allowWarranties?: boolean;
  allowServiceRequests?: boolean;
  supportEmail?: string;
  supportPhone?: string;
}

export interface TenantPublicSettings {
  id?: string;
  tenantId?: string;
  businessProfile?: TenantBusinessProfile;
  branding?: TenantBranding;
  portal?: TenantPortalConfig;
  // Flattened legacy or direct fallbacks
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  businessName?: string;
}

export interface TenantPublicData {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  settings?: TenantPublicSettings | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortalTheme {
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  industry?: string;
  welcomeMessage: string;
  portalConfig: TenantPortalConfig;
}
