import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names with Tailwind CSS collision resolution
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with internationalization support (defaults to Nigerian Naira NGN)
 */
export function formatCurrency(amount: number | null | undefined, currency: string = "NGN"): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency === "NGN" ? "₦" : "$"}0.00`;
  }

  const symbol = currency === "NGN" ? "₦" : currency === "USD" ? "$" : `${currency} `;
  return `${symbol}${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format date string to readable display
 */
export function formatDate(dateString: string | Date | null | undefined, formatType: "short" | "medium" | "full" = "medium"): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  if (formatType === "short") {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  if (formatType === "full") {
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Normalizes Nigerian phone numbers (+234 standard)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "+234" + cleaned.substring(1);
  } else if (cleaned.startsWith("234") && !cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

/**
 * Truncate long string with ellipsis
 */
export function truncate(str: string, length: number = 30): string {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

/**
 * Calculates warranty countdown and status variant
 */
export function getWarrantyStatus(warrantyExpiresAt: string | Date | null | undefined) {
  if (!warrantyExpiresAt) {
    return {
      status: "NO_WARRANTY" as const,
      label: "No Warranty",
      shortLabel: "None",
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: false,
      variant: "neutral" as const,
    };
  }

  const expiry = new Date(warrantyExpiresAt).getTime();
  if (isNaN(expiry)) {
    return {
      status: "NO_WARRANTY" as const,
      label: "Invalid Date",
      shortLabel: "Invalid",
      daysRemaining: 0,
      isExpiringSoon: false,
      isExpired: false,
      variant: "neutral" as const,
    };
  }

  const now = Date.now();
  const diffMs = expiry - now;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    const daysAgo = Math.abs(daysRemaining);
    return {
      status: "EXPIRED" as const,
      label: `Expired (${daysAgo}d ago)`,
      shortLabel: "Expired",
      daysRemaining,
      isExpiringSoon: false,
      isExpired: true,
      variant: "danger" as const,
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: "EXPIRING_SOON" as const,
      label: `Expiring Soon (${daysRemaining}d left)`,
      shortLabel: `${daysRemaining}d left`,
      daysRemaining,
      isExpiringSoon: true,
      isExpired: false,
      variant: "warning" as const,
    };
  }

  let durationText = `${daysRemaining}d left`;
  if (daysRemaining > 365) {
    const years = (daysRemaining / 365).toFixed(1);
    durationText = `${years.replace(/\.0$/, "")}y left`;
  } else if (daysRemaining > 60) {
    const months = Math.round(daysRemaining / 30);
    durationText = `${months}mo left`;
  }

  return {
    status: "ACTIVE" as const,
    label: `Protected (${durationText})`,
    shortLabel: durationText,
    daysRemaining,
    isExpiringSoon: false,
    isExpired: false,
    variant: "success" as const,
  };
}

