"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTenantPortal } from "./portal-context";
import { CompanySwitcher, CustomerCompany } from "./company-switcher";
import apiClient from "@/lib/api/client";
import {
  PhoneCall,
  LogIn,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Building2,
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  User,
} from "lucide-react";

export function PortalHeader() {
  const { tenant, theme } = useTenantPortal();
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [customerSession, setCustomerSession] = useState<{
    customerName: string;
    token: string;
  } | null>(null);
  const [companies, setCompanies] = useState<CustomerCompany[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const slug = tenant?.slug || "";
  const basePath = `/s/${slug}`;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync customer session from localStorage on mount and path changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("serviceos_customer_token");
    const rawContext = localStorage.getItem("serviceos_customer_context");

    if (token && rawContext) {
      try {
        const parsed = JSON.parse(rawContext);
        setCustomerSession({
          customerName: parsed.customerName || "Customer",
          token,
        });

        // Fetch linked companies for this customer
        if (slug) {
          apiClient
            .get(`/portal/${slug}/auth/companies`)
            .then((res) => {
              if (Array.isArray(res.data?.companies)) {
                setCompanies(res.data.companies);
              }
            })
            .catch((err) => {
              console.warn("Could not fetch customer companies:", err?.message);
            });
        }
      } catch (e) {
        console.error("Error parsing customer context", e);
      }
    } else {
      setCustomerSession(null);
      setCompanies([]);
    }
  }, [slug, pathname]);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("serviceos_customer_token");
      localStorage.removeItem("serviceos_customer_context");
    }
    setCustomerSession(null);
    setCompanies([]);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push(`${basePath}/login`);
  };

  // Two-letter initials fallback for brand
  const initials =
    theme.companyName
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SO";

  // Two-letter initials for customer avatar
  const customerInitials =
    customerSession?.customerName
      ?.split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CU";

  const navLinks = [
    { label: "Home", href: basePath },
    ...(customerSession ? [{ label: "Dashboard", href: `${basePath}/dashboard` }] : []),
    { label: "Services & Systems", href: `${basePath}#services` },
    { label: "Book Maintenance", href: `${basePath}#maintenance` },
    { label: "Contact & Support", href: `${basePath}#contact` },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      {/* Top micro announcement / hotline banner */}
      <div
        className="w-full text-white text-[11px] font-medium py-1.5 px-4 sm:px-6 flex items-center justify-between"
        style={{ backgroundColor: "var(--tenant-secondary, #004d28)" }}
      >
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-3 h-3" />
              Verified Contractor
            </span>
            <span className="hidden sm:inline text-white/90 truncate">
              {theme.industry} • Certified Field Engineering & Solar Support
            </span>
          </div>

          {theme.phone && (
            <a
              href={`tel:${theme.phone}`}
              className="flex items-center gap-1.5 text-white/95 hover:text-white transition-colors shrink-0 font-medium"
            >
              <PhoneCall className="w-3 h-3" />
              <span className="hidden md:inline">24/7 Hotline:</span>
              <span>{theme.phone}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Name */}
          <Link
            href={basePath}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg"
            style={{ outlineColor: "var(--tenant-primary)" }}
          >
            {theme.logoUrl ? (
              <img
                src={theme.logoUrl}
                alt={theme.companyName}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shadow-xs group-hover:scale-105 transition-transform"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-xs group-hover:scale-105 transition-transform"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                {initials}
              </div>
            )}

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg group-hover:text-slate-700 transition-colors">
                  {theme.companyName}
                </span>
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">
                Customer Care Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-slate-950 font-semibold"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/70"
                  }`}
                  style={
                    isActive
                      ? {
                          color: "var(--tenant-primary)",
                          backgroundColor: "var(--tenant-primary-light, rgba(0,105,55,0.08))",
                        }
                      : {}
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {customerSession ? (
              <div className="flex items-center gap-2.5">
                {/* Multi-Company Switcher Trigger */}
                {companies.length > 1 && (
                  <button
                    onClick={() => setIsSwitcherOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-all border border-slate-200"
                    title="Switch active organization portal"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Businesses</span>
                    <span
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                    >
                      {companies.length}
                    </span>
                  </button>
                )}

                {/* Customer Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-all text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs"
                      style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                    >
                      {customerInitials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-900 leading-tight max-w-[120px] truncate">
                        {customerSession.customerName}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">Logged In</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200/90 py-1.5 z-50 animate-fadeIn">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-medium text-slate-500">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {customerSession.customerName}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href={`${basePath}/dashboard`}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-500" />
                          <span>Customer Dashboard</span>
                        </Link>

                        {companies.length > 1 && (
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              setIsSwitcherOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                          >
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <span>Switch Business ({companies.length})</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href={`${basePath}/login`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--tenant-primary, #006937)",
                  boxShadow: "0 2px 10px -2px var(--tenant-primary-glow, rgba(0,105,55,0.3))",
                }}
              >
                <LogIn className="w-4 h-4" />
                <span>Customer Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {customerSession ? (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                {customerInitials}
              </button>
            ) : (
              <Link
                href={`${basePath}/login`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-xs"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-lg">
          {customerSession && (
            <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                  style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                >
                  {customerInitials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">{customerSession.customerName}</p>
                  <p className="text-[11px] text-emerald-600 font-medium">Logged In</p>
                </div>
              </div>

              {companies.length > 1 && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsSwitcherOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700 bg-white border border-slate-200"
                >
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span>Switch</span>
                </button>
              )}
            </div>
          )}

          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>{link.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {customerSession ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Portal</span>
              </button>
            ) : (
              <Link
                href={`${basePath}/login`}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                <LogIn className="w-4 h-4" />
                <span>Customer Account Login</span>
              </Link>
            )}

            {theme.phone && (
              <a
                href={`tel:${theme.phone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Call Hotline ({theme.phone})</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Multi-Company Switcher Modal */}
      <CompanySwitcher
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        companies={companies}
        currentSlug={slug}
      />
    </header>
  );
}

export default PortalHeader;
