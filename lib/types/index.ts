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

export interface CustomerRecord {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  portalStatus: 'NOT_ACTIVATED' | 'INVITATION_PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface Asset {
  id: string;
  tenantId: string;
  customerRecordId: string;
  customerRecord?: CustomerRecord;
  name: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiresAt?: string;
  warrantyDocumentUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  specifications?: Record<string, any>;
}

export interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  tenantId: string;
  customerId: string;
  customer?: CustomerRecord;
  quoteNumber: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  items: QuoteItem[];
  validUntil: string;
  terms?: string;
  signedAt?: string;
  signatureUrl?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  customerId: string;
  customer?: CustomerRecord;
  invoiceNumber: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'DISPUTED' | 'CANCELLED';
  amount: number;
  balanceDue: number;
  dueDate: string;
  paidAt?: string;
  escrowHeld?: boolean;
  items?: QuoteItem[];
  createdAt: string;
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
