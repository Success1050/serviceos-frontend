"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import {
  Building2,
  Smartphone,
  Users,
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  Crown,
  Activity,
} from "lucide-react";

export default function RootHomePage() {
  const experiences = [
    {
      title: "Tenant Operations Backoffice",
      badge: "Tenant Hub",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      iconColor: "bg-emerald-600 text-white shadow-emerald-200 shadow-md",
      icon: <Building2 className="w-5 h-5" />,
      audience: "Business Owners, Operations Managers, Dispatchers & Accountants",
      features: [
        "Customer CRM with Smart CSV/Excel Deduplication",
        "Quote Builder & Invoicing with Paystack / Stripe",
        "Visual Dispatch Calendar & Conflict Engine",
        "Virtual Truck Inventories & Expense OCR",
        "Branch Profit Wallet & Automated Payroll Payouts",
      ],
      href: "/app/dashboard",
      cta: "Launch Backoffice",
      accentBorder: "hover:border-emerald-500",
      primaryAction: true,
    },
    {
      title: "Customer Portal",
      badge: "B2B2C White-Labeled",
      badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
      iconColor: "bg-sky-600 text-white shadow-sky-200 shadow-md",
      icon: <Globe className="w-5 h-5" />,
      audience: "Homeowners & Commercial Asset Owners",
      features: [
        "Dynamic Tenant Branding (/s/:tenantSlug)",
        "Passwordless Phone & Email OTP Authentication",
        "Interactive Solar System Health & Spec Sheets",
        "Digital Quote Review & T&C Signature Canvas",
        "Warranty Claims Engine & Dispute Protection",
      ],
      href: "/s/sunshine-solar",
      cta: "View Customer Portal",
      accentBorder: "hover:border-sky-500",
      primaryAction: false,
    },
    {
      title: "Technician Mobile PWA",
      badge: "Field Worker App",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      iconColor: "bg-amber-600 text-white shadow-amber-200 shadow-md",
      icon: <Smartphone className="w-5 h-5" />,
      audience: "Blue-Collar Technicians & Field Installers",
      features: [
        "Passwordless 4-Digit SMS PIN Authentication",
        "The 'Big Button' Legal Compensation Agreement",
        "Live GPS Tracking ('En Route' & 'Arrived')",
        "Cryptographic Customer OTP Job Completion",
        "Personal Commission Wallet & NUBAN Withdrawals",
      ],
      href: "/tech",
      cta: "Open Mobile PWA",
      accentBorder: "hover:border-amber-500",
      primaryAction: false,
    },
    {
      title: "Corporate Franchise HQ",
      badge: "God-View Telemetry",
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
      iconColor: "bg-purple-600 text-white shadow-purple-200 shadow-md",
      icon: <Users className="w-5 h-5" />,
      audience: "Franchise Executives & Corporate Directors",
      features: [
        "Multi-Branch Hierarchy with Drill-down Filters",
        "System-Wide Revenue & Volume Leaderboards",
        "HQ Announcements Bulletin Board",
        "HQ Proxy Verification Queue for Field Hires",
        "Corporate Royalty Wallet Accumulation",
      ],
      href: "/hq",
      cta: "Explore God-View",
      accentBorder: "hover:border-purple-500",
      primaryAction: false,
    },
    {
      title: "Platform SuperAdmin",
      badge: "SaaS Control Plane",
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
      iconColor: "bg-indigo-600 text-white shadow-indigo-200 shadow-md",
      icon: <Crown className="w-5 h-5" />,
      audience: "ServiceOS Platform Operators & SuperAdmins",
      features: [
        "Tenant Provisioning, Suspension & Impersonation",
        "Subscription Tier Plans & Pricing Configurator",
        "Granular Module Feature-Gating (CRM, Wallets, etc.)",
        "Platform-Wide Financial & Payment Telemetry",
        "Global Audit Logs & System Health Surveillance",
      ],
      href: "/superadmin",
      cta: "Enter SuperAdmin",
      accentBorder: "hover:border-indigo-500",
      primaryAction: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Brand Navigation */}
      <header className="h-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#006937] to-[#059669] flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-950 tracking-tight">ServiceOS</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-[#006937] border border-emerald-200">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Multi-Tenant Field Operations OS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm" className="font-semibold text-slate-700">
              Staff Sign In
            </Button>
          </Link>
          <Link href="/app/dashboard">
            <Button size="sm" className="shadow-sm font-semibold">
              Launch App
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-20 px-6 lg:px-12 bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC]">
        {/* Subtle decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-200/40 via-sky-100/30 to-purple-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200/80 text-slate-800 shadow-xs hover:border-emerald-300 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Architecture V2 & Stage 28 Engine Active</span>
            <span className="text-slate-300">|</span>
            <span className="text-[#006937] font-bold">Multi-Tenant B2B2C</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
            The Operating System for{" "}
            <span className="bg-gradient-to-r from-[#006937] via-[#059669] to-[#10B981] bg-clip-text text-transparent">
              Field Service Enterprises
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Unified management for Solar, Energy & HVAC contractors. End-to-end telemetry across Customer CRM, Smart Dispatch,
            Virtual Truck Inventories, Warranty Protection, and Paystack 3-Tier Split Settlements.
          </p>

          {/* Metrics Pill Grid */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero-Email SMS PIN Auth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Uber-Style OTP Job Sign-off</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automated Paystack Split Payroll</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>SuperAdmin Subscription Gating</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Portals Interactive Experience Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-24 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#006937]">
              <Layers className="w-4 h-4" /> Multi-Experience Workspaces
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Select Your Portal Experience
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-2 md:mt-0 max-w-md">
            All 5 dedicated client portals operate on the same unified backend database with strict tenant isolation and role-scoped permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <div
              key={exp.title}
              className={`rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${exp.accentBorder} flex flex-col justify-between group`}
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${exp.iconColor} transition-transform group-hover:scale-105`}>
                    {exp.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${exp.badgeColor}`}>
                    {exp.badge}
                  </span>
                </div>

                {/* Title & Audience */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#006937] transition-colors">
                  {exp.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1 mb-4 leading-normal">
                  {exp.audience}
                </p>

                {/* Feature Bullet List */}
                <div className="space-y-2 py-3 border-t border-slate-100 text-xs text-slate-700">
                  {exp.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-4 border-t border-slate-100">
                <Link href={exp.href} className="w-full block">
                  <Button
                    variant={exp.primaryAction ? "primary" : "outline"}
                    className="w-full font-semibold group-hover:shadow-xs"
                    rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                  >
                    {exp.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global Platform Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-6 lg:px-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#006937] flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="font-bold text-slate-800">ServiceOS Platform</span>
            <span>— Enterprise Multi-Tenant Architecture</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span>Next.js 16 (Turbopack)</span>
            <span>React 19</span>
            <span>Tailwind v4</span>
            <span>TanStack Query</span>
            <span>Socket.io</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
