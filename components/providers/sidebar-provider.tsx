"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isDesktopCollapsed: boolean;
  isMobileOpen: boolean;
  toggleDesktopCollapse: () => void;
  setDesktopCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Restore desktop collapsed preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("serviceos_sidebar_collapsed");
      if (saved !== null) {
        setIsDesktopCollapsed(saved === "true");
      }
    } catch {
      // localStorage may fail in private browsing
    }
  }, []);

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("serviceos_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const setDesktopCollapsed = (collapsed: boolean) => {
    setIsDesktopCollapsed(collapsed);
    try {
      localStorage.setItem("serviceos_sidebar_collapsed", String(collapsed));
    } catch {}
  };

  const toggleMobileMenu = () => setIsMobileOpen((prev) => !prev);
  const openMobileMenu = () => setIsMobileOpen(true);
  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isDesktopCollapsed,
        isMobileOpen,
        toggleDesktopCollapse,
        setDesktopCollapsed,
        toggleMobileMenu,
        openMobileMenu,
        closeMobileMenu,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
