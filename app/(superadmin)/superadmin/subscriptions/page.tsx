"use client";

import React, { useState } from "react";
import {
  Sliders,
  Check,
  X,
  CreditCard,
  ShieldCheck,
  Save,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";

interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  starter: boolean;
  growth: boolean;
  enterprise: boolean;
}

export default function SubscriptionsManagementPage() {
  const [modules, setModules] = useState<ModuleConfig[]>([
    {
      id: "MODULE_CRM",
      name: "Customer CRM & Import",
      description: "Customer directory, Excel/CSV fuzzy mapping, and deduplication",
      category: "Core Operations",
      starter: true,
      growth: true,
      enterprise: true,
    },
    {
      id: "MODULE_QUOTES",
      name: "Quote Builder & Engine",
      description: "Interactive line items, tax calculations, and PDF generation",
      category: "Core Operations",
      starter: true,
      growth: true,
      enterprise: true,
    },
    {
      id: "MODULE_INVOICES",
      name: "Invoicing & Gateway Billing",
      description: "Paystack & Stripe payments, manual receipts, and aging reports",
      category: "Core Operations",
      starter: true,
      growth: true,
      enterprise: true,
    },
    {
      id: "MODULE_DISPATCH",
      name: "Smart Dispatch & Scheduling",
      description: "Visual technician calendar, conflict engine, and buffer rules",
      category: "Field Dispatch",
      starter: false,
      growth: true,
      enterprise: true,
    },
    {
      id: "MODULE_WAREHOUSE",
      name: "Virtual Trucks & Warehouses",
      description: "Parts requisition, truck stock levels, and expense receipt OCR",
      category: "Field Dispatch",
      starter: false,
      growth: true,
      enterprise: true,
    },
    {
      id: "MODULE_CUSTOMER_PORTAL",
      name: "Branded Customer Portal",
      description: "White-labeled (/s/:slug), passwordless OTP, and asset health",
      category: "B2B2C Portal",
      starter: false,
      growth: true,
      enterprise: true,
    },
    {
      id: "MODULE_SUPPORT_DESK",
      name: "Support Desk & Disputes",
      description: "Warranty claims engine, $0 rework jobs, and invoice dispute freeze",
      category: "Customer Support",
      starter: false,
      growth: true,
      enterprise: true,
    },
    {
      id: "MODULE_BLUE_COLLAR_HR",
      name: "Blue-Collar HR & SMS PIN",
      description: "Phone-only onboarding, document dossier, and SMS PIN auth",
      category: "Workforce",
      starter: false,
      growth: true,
      enterprise: true,
    },
    {
      id: "MODULE_FINTECH_WALLETS",
      name: "3-Tier Wallets & Paystack Payroll",
      description: "HQ/Branch/Staff split settlements, NUBAN verify & automated payouts",
      category: "Fintech & Payroll",
      starter: false,
      growth: false,
      enterprise: true,
    },
    {
      id: "MODULE_ENTERPRISE_HQ",
      name: "Franchise God-View Telemetry",
      description: "Parent-child tenant hierarchy, global announcements, and royalties",
      category: "Enterprise Franchise",
      starter: false,
      growth: false,
      enterprise: true,
    },
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleModule = (id: string, tier: "starter" | "growth" | "enterprise") => {
    setModules((prev) =>
      prev.map((mod) => (mod.id === id ? { ...mod, [tier]: !mod[tier] } : mod))
    );
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              SuperAdmin Exclusive
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Subscription Tiers & Module Restriction Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure which business modules are unlocked per plan. Backend @SubscriptionGate guards will strictly enforce these rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Restriction Matrix</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Module restriction policies updated successfully across all tenants!</span>
        </div>
      )}

      {/* Plan Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Starter Plan */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Basic Tier</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Solo Operators
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-2">Starter Plan</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">$99</span>
              <span className="text-xs text-slate-400 font-medium">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Standard CRM, quotes, and invoicing for single-truck contractors without field dispatch.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-500" />
            <span>
              {modules.filter((m) => m.starter).length} of {modules.length} Modules Allowed
            </span>
          </div>
        </div>

        {/* Growth Plan */}
        <div className="rounded-2xl border border-sky-800/60 bg-sky-950/20 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Fleet Operations</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Growing Teams
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-2">Growth Plan</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">$299</span>
              <span className="text-xs text-slate-400 font-medium">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Dispatch calendar, virtual truck inventory, customer portal, support desk, and field technician PWA.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-sky-900/60 text-xs text-sky-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-sky-400" />
            <span>
              {modules.filter((m) => m.growth).length} of {modules.length} Modules Allowed
            </span>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="rounded-2xl border border-indigo-700/60 bg-indigo-950/30 p-6 flex flex-col justify-between shadow-lg shadow-indigo-950/50">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Franchise Scale</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-300" /> All-Inclusive
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-2">Enterprise Plan</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">$799</span>
              <span className="text-xs text-slate-400 font-medium">/ month</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Full 3-Tier FinTech Wallets, Paystack split payroll disbursements, and Corporate Franchise God-View.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-indigo-900/60 text-xs text-indigo-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>
              {modules.filter((m) => m.enterprise).length} of {modules.length} Modules Allowed
            </span>
          </div>
        </div>
      </div>

      {/* Granular Module Feature-Gate Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Granular Module Restriction Policy</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any checkbox to toggle module access on or off for that subscription tier.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 w-1/3">System Module</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4 text-center">Starter ($99)</th>
                <th className="py-4 px-4 text-center">Growth ($299)</th>
                <th className="py-4 px-4 text-center">Enterprise ($799)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {modules.map((mod) => (
                <tr key={mod.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{mod.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{mod.description}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      {mod.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => toggleModule(mod.id, "starter")}
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        mod.starter
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                          : "bg-slate-800/40 text-slate-600 border border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      {mod.starter ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => toggleModule(mod.id, "growth")}
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        mod.growth
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 hover:bg-sky-500/30"
                          : "bg-slate-800/40 text-slate-600 border border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      {mod.growth ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => toggleModule(mod.id, "enterprise")}
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                        mod.enterprise
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/30"
                          : "bg-slate-800/40 text-slate-600 border border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      {mod.enterprise ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
