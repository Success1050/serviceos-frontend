/**
 * ServiceOS Core TypeScript Domain Interfaces
 */

export type Role =
  | 'PLATFORM_ADMIN'
  | 'TENANT_OWNER'
  | 'TENANT_ADMIN'
  | 'HQ_ADMIN'
  | 'MANAGER'
  | 'SALES'
  | 'TECHNICIAN'
  | 'ACCOUNTANT'
  | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: Role;
  permissions?: string[];
  tenantId?: string;
  createdAt: string;
  avatarUrl?: string;
  isSuperAdmin?: boolean;
  isFieldTech?: boolean;
}

export interface TenantSettings {
  id?: string;
  businessName?: string;
  industry?: string;
  currency?: string;
  taxRate?: number;
  timezone?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  portalSettings?: {
    allowQuotes?: boolean;
    allowInvoices?: boolean;
    allowPayments?: boolean;
    allowServiceRequests?: boolean;
    allowWarranties?: boolean;
  };
  franchiseRoyaltyRate?: number;
  royaltyType?: 'PERCENTAGE' | 'FLAT';
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentTenantId?: string | null;
  children?: Array<{ id: string; name: string; slug: string }>;
  settings?: TenantSettings;
  createdAt: string;
}

export type PortalStatus = 'NOT_ACTIVATED' | 'INVITATION_PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

export interface CustomerRecord {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  portalStatus: PortalStatus;
  createdAt: string;
  updatedAt?: string;
  relationshipId?: string;
  _count?: {
    quotes?: number;
    jobs?: number;
    invoices?: number;
    assets?: number;
  };
  quotes?: any[];
  jobs?: any[];
  invoices?: any[];
  assets?: any[];
}

export enum DuplicateRule {
  SKIP = 'SKIP',
  UPDATE = 'UPDATE',
  CREATE_NEW = 'CREATE_NEW',
}

export interface AnalyzeImportResponse {
  headers: string[];
  suggestedMapping: Record<string, string>;
  rowCount: number;
}

export interface PreviewImportResponse {
  metrics: {
    totalProcessed: number;
    validCount: number;
    duplicateCount: number;
    invalidCount: number;
  };
  valid: any[];
  duplicates: Array<{
    imported: any;
    existing: any;
    _reason: string;
  }>;
  invalid: any[];
}

export interface ExecuteImportResponse {
  message: string;
  created: number;
  updated: number;
  skipped: number;
  invalid: number;
}


export type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type WarrantyStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'NO_WARRANTY';

export interface Asset {
  id: string;
  tenantId: string;
  customerRecordId: string;
  customerRecord?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
  };
  name: string;
  manufacturer?: string | null;
  modelNumber?: string | null;
  serialNumber?: string | null;
  installDate?: string | null;
  warrantyExpiresAt?: string | null;
  warrantyDocumentUrl?: string | null;
  status: AssetStatus;
  specifications?: Record<string, any>;
  _count?: {
    serviceRequests?: number;
    maintenanceSchedules?: number;
    supportTickets?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssetInput {
  name: string;
  customerRecordId: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiresAt?: string;
  warrantyDocumentUrl?: string;
  status?: AssetStatus;
}

export interface UpdateAssetInput {
  name?: string;
  customerRecordId?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiresAt?: string;
  warrantyDocumentUrl?: string;
  status?: AssetStatus;
}


export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
export type BillingType = 'FIXED' | 'AUTH_AND_CAPTURE' | 'MILESTONE';

export interface QuoteMilestone {
  id?: string;
  quoteId?: string;
  title: string;
  percentage: number;
  amount: number;
  order?: number;
  dueDate?: string | null;
  status?: 'PENDING' | 'INVOICED' | 'PAID';
}

export interface QuoteLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: 'EQUIPMENT' | 'LABOR' | 'MATERIALS' | 'PERMIT';
}

export interface Quote {
  id: string;
  tenantId: string;
  customerRecordId: string;
  customerRecord?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
  };
  title: string;
  amount: number | string;
  status: QuoteStatus;
  billingType: BillingType;
  termsAndConditions?: string | null;
  signedTermsAt?: string | null;
  signerName?: string | null;
  signatureData?: string | null;
  milestones?: QuoteMilestone[];
  items?: QuoteLineItem[];
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  validUntil?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    jobs?: number;
  };
}

export type QuoteItem = QuoteLineItem;

export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'DISPUTED';

export interface Invoice {
  id: string;
  tenantId: string;
  title: string;
  amount: number;
  status: InvoiceStatus;
  customerRecordId: string;
  customerRecord?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
  };
  jobId?: string | null;
  job?: {
    id: string;
    title: string;
    status: string;
  } | null;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    settings?: any;
  };
  paymentTransactions?: PaymentTransaction[];
  dueDate?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  // Legacy aliases
  customerId?: string;
  customer?: CustomerRecord;
  invoiceNumber?: string;
  balanceDue?: number;
  items?: QuoteItem[];
}

export interface Job {
  id: string;
  tenantId: string;
  customerId: string;
  customer?: CustomerRecord;
  assetId?: string;
  asset?: Asset;
  assignedTechnicianId?: string;
  technician?: User;
  title: string;
  description?: string;
  status: 'SCHEDULED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  completionOtpHashed?: string;
  photos?: string[];
  signatureUrl?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  tenantId?: string;
  userId?: string;
  type: 'HQ' | 'BRANCH' | 'STAFF';
  availableBalance: number;
  lockedBalance: number;
  lifetimeEarnings: number;
  currency: string;
  updatedAt: string;
}

export interface PayoutRequest {
  id: string;
  tenantId: string;
  userId: string;
  user?: Partial<User>;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'PAID';
  bankDetail?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  rejectionReason?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  customerId: string;
  customer?: CustomerRecord;
  assetId?: string;
  asset?: Asset;
  invoiceId?: string;
  title: string;
  category: 'GENERAL' | 'WARRANTY' | 'BILLING_DISPUTE' | 'TECHNICAL';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export interface RealtimeEventPayload<T = any> {
  type: string;
  tenantId?: string;
  userId?: string;
  data: T;
  timestamp: string;
}

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  customerRecordId?: string | null;
  invoiceId?: string | null;
  gateway: 'PAYSTACK' | 'STRIPE' | 'FLUTTERWAVE';
  transactionReference: string;
  gatewayReference?: string | null;
  amount: number;
  currency: string;
  type: string;
  paymentMethod?: string | null;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface InvoiceMetrics {
  totalBilled: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueCount: number;
  paidCount: number;
}
