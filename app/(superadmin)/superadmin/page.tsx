"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CreditCard,
  Sliders,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  UserCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState([
    {
      id: "ten-1",
      name: "Sunshine Solar Ltd",
      slug: "sunshine-solar",
      industry: "Solar & Energy",
      plan: "ENTERPRISE",
      mrr: 799,
      status: "ACTIVE",
      enabledModules: 10,
      totalModules: 10,
      ownerEmail: "owner@sunshinesolar.com",
      createdDate: "Aug 12, 2026",
    },
    {
      id: "ten-2",
      name: "GreenPower Energy West",
      slug: "greenpower-west",
      industry: "Solar & Wind",
      plan: "GROWTH",
      mrr: 299,
      status: "ACTIVE",
      enabledModules: 7,
      totalModules: 10,
      ownerEmail: "admin@greenpower.ng",
      createdDate: "Aug 19, 2026",
    },
    {
      id: "ten-3",
      name: "CoolAir HVAC Solutions",
      slug: "coolair-hvac",
      industry: "HVAC & Cooling",
      plan: "STARTER",
      mrr: 99,
      status: "ACTIVE",
      enabledModules: 4,
      totalModules: 10,
      ownerEmail: "ops@coolair.com",
      createdDate: "Sep 02, 2026",
    },
    {
      id: "ten-4",
      name: "Nexus Solar Franchise Group",
      slug: "nexus-solar",
      industry: "Solar & Energy",
      plan: "ENTERPRISE",
      mrr: 799,
      status: "ACTIVE",
      enabledModules: 10,
      totalModules: 10,
      ownerEmail: "hq@nexussolar.com",
      createdDate: "Sep 15, 2026",
    },
    {
      id: "ten-5",
      name: "Apex Generator Maintenance",
      slug: "apex-power",
      industry: "Generators & Power",
      plan: "STARTER",
      mrr: 99,
      status: "SUSPENDED",
      enabledModules: 4,
      totalModules: 10,
      ownerEmail: "billing@apexpower.com",
      createdDate: "Sep 22, 2026",
    },
  ]);

  const toggleTenantStatus = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId
          ? { ...t, status: t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
          : t
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Platform Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global multi-tenant governance, subscription billing & granular module restriction control
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/subscriptions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>Configure Module Gates</span>
          </Link>
        </div>
      </div>

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Platform MRR</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white tracking-tight">$34,820</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Recurring subscription billings</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Total Tenants</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white tracking-tight">{tenants.length}</span>
            <span className="text-xs font-semibold text-indigo-400">4 Active / 1 Suspended</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Contractor enterprises onboarded</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Active Subscriptions</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white tracking-tight">100%</span>
            <span className="text-xs font-semibold text-sky-400">Paystack & Stripe</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero delinquent payment dunning</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Module Restrictions</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white tracking-tight">Active</span>
            <span className="text-xs font-semibold text-amber-400">RBAC Enforced</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">SuperAdmin feature-gating live</p>
        </div>
      </div>

      {/* Subscription Tier Module Restriction Summary Card */}
      <div className="rounded-2xl border border-indigo-900/40 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-900/40 p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SuperAdmin Module-Gating Architecture
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Dynamic Subscription Plans & Feature Restrictions
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              SuperAdmins control which business modules are accessible per subscription tier.
              If a tenant tries to access a restricted module (e.g. 3-Tier Wallets on Starter plan),
              the backend returns an HTTP 402 Payment Required block and the frontend prompts an instant upgrade.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400">Starter Plan</div>
              <div className="text-sm font-bold text-white mt-0.5">$99/mo</div>
              <div className="text-[10px] text-emerald-400 mt-1">CRM + Quotes + Invoices</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400">Growth Plan</div>
              <div className="text-sm font-bold text-white mt-0.5">$299/mo</div>
              <div className="text-[10px] text-sky-400 mt-1">+ Dispatch & Portal & HR</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-left">
              <div className="text-[10px] uppercase font-bold text-indigo-300">Enterprise Plan</div>
              <div className="text-sm font-bold text-white mt-0.5">$799/mo</div>
              <div className="text-[10px] text-indigo-300 mt-1">+ Wallets & Franchise HQ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Directory & Governance Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Tenant Registry & Subscription Governance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Manage contractor tenants, change subscription tiers, or override modules</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{tenants.length} Total Registered Organizations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Company / Slug</th>
                <th className="py-3.5 px-4">Subscription Plan</th>
                <th className="py-3.5 px-4">MRR</th>
                <th className="py-3.5 px-4">Module Gates</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">SuperAdmin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{t.name}</div>
                    <div className="text-[11px] text-indigo-400 font-mono">/s/{t.slug}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        t.plan === "ENTERPRISE"
                          ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                          : t.plan === "GROWTH"
                          ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                          : "bg-slate-700/40 text-slate-300 border-slate-700"
                      }`}
                    >
                      {t.plan}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-white">${t.mrr}/mo</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${(t.enabledModules / t.totalModules) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {t.enabledModules}/{t.totalModules}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        t.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.status === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      {t.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => toggleTenantStatus(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        t.status === "ACTIVE"
                          ? "border-rose-800 text-rose-300 hover:bg-rose-950/50"
                          : "border-emerald-800 text-emerald-300 hover:bg-emerald-950/50"
                      }`}
                    >
                      {t.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </button>

                    <Link
                      href="/superadmin/subscriptions"
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 transition-all"
                    >
                      Override Modules
                    </Link>
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
