"use client";

import React, { useState } from "react";
import {
  Sliders,
  Check,
  X,
  ShieldAlert,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Lock,
  Layers,
  ArrowRight,
  Search,
} from "lucide-react";
import { Badge, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";

interface ModuleGate {
  key: string;
  name: string;
  description: string;
  category: "Core Operations" | "Field Dispatch" | "Customer Experience" | "Fintech & HR" | "Enterprise HQ";
  defaultTier: "STARTER" | "GROWTH" | "ENTERPRISE";
  starterEnabled: boolean;
  growthEnabled: boolean;
  enterpriseEnabled: boolean;
  activeOverridesCount: number;
}

export default function SuperAdminModulesPage() {
  const [search, setSearch] = useState("");
  const [modules, setModules] = useState<ModuleGate[]>([
    {
      key: "MODULE_CRM",
      name: "Customer CRM & Contact Deduplication",
      description: "Customer directory, Excel/CSV fuzzy header mapping, and identity deduplication.",
      category: "Core Operations",
      defaultTier: "STARTER",
      starterEnabled: true,
      growthEnabled: true,
      enterpriseEnabled: true,
      activeOverridesCount: 0,
    },
    {
      key: "MODULE_QUOTES",
      name: "Quote Builder & PDF Engine",
      description: "Dynamic solar & HVAC line items, multi-tier pricing, and customer invitation pipelines.",
      category: "Core Operations",
      defaultTier: "STARTER",
      starterEnabled: true,
      growthEnabled: true,
      enterpriseEnabled: true,
      activeOverridesCount: 0,
    },
    {
      key: "MODULE_INVOICES",
      name: "Invoicing & Multi-Gateway Billing",
      description: "Paystack & Stripe online checkout, partial receipts, and invoice aging tracking.",
      category: "Core Operations",
      defaultTier: "STARTER",
      starterEnabled: true,
      growthEnabled: true,
      enterpriseEnabled: true,
      activeOverridesCount: 1,
    },
    {
      key: "MODULE_DISPATCH",
      name: "Smart Scheduling & Dispatch Calendar",
      description: "Conflict-preventing calendar, technician travel buffer rules, and appointment dispatch.",
      category: "Field Dispatch",
      defaultTier: "GROWTH",
      starterEnabled: false,
      growthEnabled: true,
      enterpriseEnabled: true,
      activeOverridesCount: 3,
    },
    {
      key: "MODULE_WAREHOUSE",
      name: "Virtual Trucks & HQ Inventory Hub",
      description: "Hub-and-spoke supply chain requisitions, virtual truck stock, and expense approvals.",
      category: "Field Dispatch",
      defaultTier: "GROWTH",
      starterEnabled: false,
      growthEnabled: true,
      enterpriseEnabled: true,
      activeOverridesCount: 2,
    },
    {
      key: "MODULE_CUSTOMER_PORTAL",
      name: "White-Labeled Customer Portal (/s/:slug)",
      description: "Dynamic tenant branding, passwordless customer OTP login, and asset health telemetry.",
      category: "Customer Experience",
      defaultTier: "GROWTH",
      starterEnabled: false,
      growthEnabled: true,
      enterpriseEnabled: true,
      activeOverridesCount: 4,
    },
    {
      key: "MODULE_SUPPORT_DESK",
      name: "Customer Support & Dispute Protection",
      description: "Ticketing hub, warranty $0 rework job provisioning, and automated invoice dispute freezing.",
      category: "Customer Experience",
      defaultTier: "GROWTH",
      starterEnabled: false,
      growthEnabled: true,
      enterpriseEnabled: true,
      activeOverridesCount: 1,
    },
    {
      key: "MODULE_BLUE_COLLAR_HR",
      name: "Blue-Collar HR & SMS PIN Login",
      description: "Phone-only field worker onboarding, shadow identities, HR dossiers, and 4-digit SMS PIN.",
      category: "Fintech & HR",
      defaultTier: "ENTERPRISE",
      starterEnabled: false,
      growthEnabled: false,
      enterpriseEnabled: true,
      activeOverridesCount: 5,
    },
    {
      key: "MODULE_FINTECH_WALLETS",
      name: "3-Tier Wallets & Paystack Payroll",
      description: "HQ franchise royalties, branch net operating profits, staff commission wallets, and NUBAN payouts.",
      category: "Fintech & HR",
      defaultTier: "ENTERPRISE",
      starterEnabled: false,
      growthEnabled: false,
      enterpriseEnabled: true,
      activeOverridesCount: 2,
    },
    {
      key: "MODULE_ENTERPRISE_HQ",
      name: "Franchise Hierarchy & God-View",
      description: "Franchisor corporate God-View analytics, branch bulletin announcements, and internal ticketing.",
      category: "Enterprise HQ",
      defaultTier: "ENTERPRISE",
      starterEnabled: false,
      growthEnabled: false,
      enterpriseEnabled: true,
      activeOverridesCount: 0,
    },
  ]);

  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const toggleModule = (key: string, tier: "starter" | "growth" | "enterprise") => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.key === key) {
          const field = `${tier}Enabled` as keyof ModuleGate;
          return { ...mod, [field]: !mod[field] };
        }
        return mod;
      })
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    setSaveStatus("Saving platform gate policies...");
    setTimeout(() => {
      setSaveStatus("Module policies successfully deployed across all tenant nodes!");
      setHasChanges(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }, 800);
  };

  const filtered = modules.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.key.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Stage 29 Control Plane
            </span>
            <span className="text-xs text-slate-400">• NestJS @RequireModule() Guard</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Module Feature Gates</h1>
          <p className="text-sm text-slate-400 mt-1">
            Dynamically gate business modules across subscription tiers and enforce HTTP 402 PaymentRequiredException rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            Publish Gate Policies
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-5 h-5 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Info Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white">How Feature-Gating Operates: </span>
          When a feature is disabled for a subscription tier, the NestJS backend automatically rejects API calls decorated with
          <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px]">
            @RequireModule(ServiceModule.KEY)
          </code>
          with an audited HTTP 402 exception. Individual tenants can also be granted custom contractual overrides without altering global tier policies.
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search module name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-white">{filtered.length}</span> of 10 ServiceOS Modules
        </div>
      </div>

      {/* Modules Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Module & System Key</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Starter ($99)</th>
                <th className="py-3.5 px-4 text-center">Growth ($299)</th>
                <th className="py-3.5 px-4 text-center">Enterprise ($799)</th>
                <th className="py-3.5 px-4 text-right">Tenant Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((mod) => (
                <tr key={mod.key} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{mod.name}</span>
                    </div>
                    <div className="font-mono text-[10px] text-indigo-400 mt-0.5">{mod.key}</div>
                    <div className="text-[11px] text-slate-400 mt-1 max-w-md">{mod.description}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {mod.category}
                    </span>
                  </td>
                  {/* Starter Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => toggleModule(mod.key, "starter")}
                      className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all ${
                        mod.starterEnabled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {mod.starterEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                  {/* Growth Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => toggleModule(mod.key, "growth")}
                      className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all ${
                        mod.growthEnabled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {mod.growthEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                  {/* Enterprise Toggle */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => toggleModule(mod.key, "enterprise")}
                      className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-all ${
                        mod.enterpriseEnabled
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {mod.enterpriseEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                  {/* Active Overrides */}
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-slate-300">
                      {mod.activeOverridesCount}{" "}
                      <span className="text-[10px] text-slate-500 font-normal">tenants</span>
                    </span>
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
