"use client";

import React, { useEffect } from "react";
import { useTenantPortal } from "./portal-context";
import { PortalHeader } from "./portal-header";
import { PortalFooter } from "./portal-footer";

interface PortalShellProps {
  children: React.ReactNode;
}

export function PortalShell({ children }: PortalShellProps) {
  const { theme } = useTenantPortal();

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    try {
      let cleanHex = hex.replace("#", "");
      if (cleanHex.length === 3) {
        cleanHex = cleanHex
          .split("")
          .map((c) => c + c)
          .join("");
      }
      const num = parseInt(cleanHex, 16);
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch {
      return `rgba(0, 105, 55, ${alpha})`;
    }
  };

  const primary = theme.primaryColor || "#006937";
  const secondary = theme.secondaryColor || "#004d28";
  const primaryLight = hexToRgba(primary, 0.08);
  const primaryGlow = hexToRgba(primary, 0.25);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${theme.companyName} | Customer Portal • ServiceOS`;
    }
  }, [theme.companyName]);

  return (
    <div
      className="tenant-portal-root min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-200"
      style={
        {
          "--tenant-primary": primary,
          "--tenant-secondary": secondary,
          "--tenant-primary-light": primaryLight,
          "--tenant-primary-glow": primaryGlow,
        } as React.CSSProperties
      }
    >
      <PortalHeader />

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <PortalFooter />
    </div>
  );
}

export default PortalShell;
