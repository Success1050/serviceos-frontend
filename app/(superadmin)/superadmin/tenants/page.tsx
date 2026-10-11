"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Search,
  Sliders,
  ExternalLink,
  Shield,
  Layers,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  CreditCard,
  Crown,
  Network,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SubCompany {
  id: string;
  name: string;
  slug: string;
  city: string;
  managerName: string;
  managerEmail: string;
  techniciansCount: number;
  activeJobsCount: number;
  monthlyRevenue: number;
  status: "ACTIVE" | "SUSPENDED";
}

interface ParentTenant {
  id: string;
  name: string;
  slug: string;
  industry: string;
  ownerName: string;
  ownerEmail: string;
  plan: "ENTERPRISE" | "GROWTH" | "STARTER";
  status: "ACTIVE" | "SUSPENDED";
  createdDate: string;
  subCompanies: SubCompany[];
}

export default function SuperAdminTenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTenants, setExpandedTenants] = useState<Record<string, boolean>>({
    "parent-1": true,
    "parent-2": false,
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    industry: "Solar & Energy",
    ownerName: "",
    ownerEmail: "",
    entityType: "FRANCHISE_HQ" as "STANDALONE" | "FRANCHISE_HQ" | "SUB_COMPANY",
    parentHqId: "parent-1",
    plan: "GROWTH" as "STARTER" | "GROWTH" | "ENTERPRISE",
    city: "Lagos, Nigeria",
  });

  const [tenants, setTenants] = useState<ParentTenant[]>([
    {
      id: "parent-1",
      name: "Sunshine Solar Global Corp (Franchise HQ)",
      slug: "sunshine-solar",
      industry: "Solar & Energy",
      ownerName: "Chief Adeyemi Solar",
      ownerEmail: "owner@sunshinesolar.com",
      plan: "ENTERPRISE",
      status: "ACTIVE",
      createdDate: "Aug 12, 2026",
      subCompanies: [
        {
          id: "sub-1-1",
          name: "Sunshine Solar — Lagos Island Branch",
          slug: "sunshine-lagos-island",
          city: "Lagos, Nigeria",
          managerName: "Engr. Babatunde Fash",
          managerEmail: "lagos@sunshinesolar.com",
          techniciansCount: 14,
          activeJobsCount: 8,
          monthlyRevenue: 12500000,
          status: "ACTIVE",
        },
        {
          id: "sub-1-2",
          name: "Sunshine Solar — Abuja Central Branch",
          slug: "sunshine-abuja",
          city: "Abuja, FCT",
          managerName: "Amina Yusuf",
          managerEmail: "abuja@sunshinesolar.com",
          techniciansCount: 9,
          activeJobsCount: 5,
          monthlyRevenue: 8900000,
          status: "ACTIVE",
        },
        {
          id: "sub-1-3",
          name: "Sunshine Solar — Port Harcourt Industrial",
          slug: "sunshine-ph",
          city: "Port Harcourt, Rivers",
          managerName: "Tamuno Briggs",
          managerEmail: "ph@sunshinesolar.com",
          techniciansCount: 11,
          activeJobsCount: 6,
          monthlyRevenue: 10400000,
          status: "ACTIVE",
        },
      ],
    },
    {
      id: "parent-2",
      name: "GreenPower Energy West (Franchise HQ)",
      slug: "greenpower-west",
      industry: "Solar & Wind",
      ownerName: "Dr. Ngozi Eze",
      ownerEmail: "admin@greenpower.ng",
      plan: "GROWTH",
      status: "ACTIVE",
      createdDate: "Aug 19, 2026",
      subCompanies: [
        {
          id: "sub-2-1",
          name: "GreenPower Energy — Ibadan Branch",
          slug: "greenpower-ibadan",
          city: "Ibadan, Oyo",
          managerName: "Segun Obafemi",
          managerEmail: "ibadan@greenpower.ng",
          techniciansCount: 6,
          activeJobsCount: 3,
          monthlyRevenue: 4200000,
          status: "ACTIVE",
        },
        {
          id: "sub-2-2",
          name: "GreenPower Energy — Abeokuta Hub",
          slug: "greenpower-abeokuta",
          city: "Abeokuta, Ogun",
          managerName: "Kemi Adeleke",
          managerEmail: "abeokuta@greenpower.ng",
          techniciansCount: 4,
          activeJobsCount: 2,
          monthlyRevenue: 2800000,
          status: "ACTIVE",
        },
      ],
    },
    {
      id: "parent-3",
      name: "CoolAir HVAC Solutions (Single Branch)",
      slug: "coolair-hvac",
      industry: "Commercial HVAC",
      ownerName: "Marcus Sterling",
      ownerEmail: "ops@coolair.com",
      plan: "STARTER",
      status: "ACTIVE",
      createdDate: "Sep 02, 2026",
      subCompanies: [],
    },
    {
      id: "parent-4",
      name: "Apex Generator Power Systems",
      slug: "apex-power",
      industry: "Generators & Power",
      ownerName: "Alhaji Bello Kano",
      ownerEmail: "bello@apexpower.com",
      plan: "STARTER",
      status: "SUSPENDED",
      createdDate: "Sep 22, 2026",
      subCompanies: [],
    },
  ]);

  const toggleExpand = (id: string) => {
    setExpandedTenants((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalSubCompanies = tenants.reduce((acc, t) => acc + t.subCompanies.length, 0);
  const totalTechs = tenants.reduce(
    (acc, t) => acc + t.subCompanies.reduce((subAcc, s) => subAcc + s.techniciansCount, 0),
    0
  );

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subCompanies.some((sub) => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Network className="w-3.5 h-3.5" /> Platform Hierarchy Explorer
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5">
            Enterprise Tenants & Sub-Companies Tree
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            As the Platform Owner / SuperAdmin, inspect all primary parent enterprises and every child sub-company operating within ServiceOS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/superadmin/subscriptions"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Module Restrictions</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Tenant</span>
          </button>
        </div>
      </div>

      {/* Global Roll-up KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
            Parent Enterprises (HQ)
          </div>
          <div className="mt-2 text-3xl font-black text-white">{tenants.length}</div>
          <p className="text-[11px] text-indigo-400 mt-1">Franchisors & Primary Accounts</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
            Sub-Companies (Branches)
          </div>
          <div className="mt-2 text-3xl font-black text-white">{totalSubCompanies}</div>
          <p className="text-[11px] text-emerald-400 mt-1">Regional Franchisee Child Tenants</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
            Active Field Techs
          </div>
          <div className="mt-2 text-3xl font-black text-white">{totalTechs}</div>
          <p className="text-[11px] text-sky-400 mt-1">Across all nested child companies</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xs">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
            Tenant Isolation Engine
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-400 flex items-center gap-1.5">
            <Shield className="w-6 h-6" /> 100%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Row-Level Security & Scoped JWTs</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by parent tenant name, branch title, slug, or manager email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/70 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Hierarchy Tree Accordion List */}
      <div className="space-y-4">
        {filteredTenants.map((parent) => {
          const isExpanded = !!expandedTenants[parent.id];
          const hasChildren = parent.subCompanies.length > 0;

          return (
            <div
              key={parent.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xs transition-all hover:border-slate-700"
            >
              {/* Parent Tenant Header Row */}
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border-b border-slate-800/80">
                <div className="flex items-center gap-4 min-w-0">
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(parent.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-500 text-xs">
                      •
                    </div>
                  )}

                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-extrabold text-base text-white truncate">{parent.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-indigo-400 border border-slate-700">
                        /s/{parent.slug}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          parent.plan === "ENTERPRISE"
                            ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                            : parent.plan === "GROWTH"
                            ? "bg-sky-500/10 text-sky-300 border-sky-500/30"
                            : "bg-slate-700/40 text-slate-300 border-slate-700"
                        }`}
                      >
                        {parent.plan}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          parent.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {parent.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-4 flex-wrap">
                      <span>Owner: <strong className="text-slate-300">{parent.ownerName}</strong> ({parent.ownerEmail})</span>
                      <span>•</span>
                      <span>Industry: <strong className="text-slate-300">{parent.industry}</strong></span>
                      <span>•</span>
                      <span className="text-indigo-400 font-semibold">
                        {parent.subCompanies.length} Sub-Company Branches
                      </span>
                    </div>
                  </div>
                </div>

                {/* Parent Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                  <Link
                    href={`/superadmin/subscriptions`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                  >
                    Module Gates
                  </Link>

                  <button
                    onClick={() => alert(`Impersonating ${parent.name} as SuperAdmin...`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Impersonate Owner</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sub-Companies / Branches Nested Table */}
              {hasChildren && isExpanded && (
                <div className="bg-slate-950/60 p-6 pl-14 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                    <span className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Sub-Companies & Regional Branches under this Franchise:</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">Inherits Global Brand Identity & Policies</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {parent.subCompanies.map((sub) => (
                      <div
                        key={sub.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 hover:border-indigo-500/40 transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                              {sub.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">/s/{sub.slug}</div>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {sub.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500" /> Location:
                            </span>
                            <span className="text-slate-300 font-medium">{sub.city}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Manager:</span>
                            <span className="text-slate-300 font-medium">{sub.managerName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Field Techs:</span>
                            <span className="text-indigo-400 font-bold">{sub.techniciansCount} Active</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Monthly Volume:</span>
                            <span className="text-emerald-400 font-bold">{formatCurrency(sub.monthlyRevenue)}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <button
                            onClick={() => alert(`Impersonating ${sub.name} branch manager...`)}
                            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Branch</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          <span className="text-[10px] text-slate-400">Child Tenant ID: {sub.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Provision New Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Provision Enterprise Organization</h3>
                  <p className="text-xs text-slate-400">Configure tenant hierarchy, access roles & subscription tier</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!formData.name || !formData.slug || !formData.ownerEmail) return;

                if (formData.entityType === "SUB_COMPANY") {
                  const newSub: SubCompany = {
                    id: `sub-${Date.now()}`,
                    name: formData.name,
                    slug: formData.slug,
                    city: formData.city,
                    managerName: formData.ownerName || "Branch Manager",
                    managerEmail: formData.ownerEmail,
                    techniciansCount: 1,
                    activeJobsCount: 0,
                    monthlyRevenue: 0,
                    status: "ACTIVE",
                  };

                  setTenants((prev) =>
                    prev.map((t) =>
                      t.id === formData.parentHqId
                        ? { ...t, subCompanies: [...t.subCompanies, newSub] }
                        : t
                    )
                  );
                  setExpandedTenants((prev) => ({ ...prev, [formData.parentHqId]: true }));
                } else {
                  const newTenant: ParentTenant = {
                    id: `tenant-${Date.now()}`,
                    name: formData.name + (formData.entityType === "FRANCHISE_HQ" ? " (Franchise HQ)" : ""),
                    slug: formData.slug,
                    industry: formData.industry,
                    ownerName: formData.ownerName || "Owner",
                    ownerEmail: formData.ownerEmail,
                    plan: formData.plan,
                    status: "ACTIVE",
                    createdDate: "Just now",
                    subCompanies: [],
                  };

                  setTenants((prev) => [newTenant, ...prev]);
                }

                setIsModalOpen(false);
                setFormData({
                  name: "",
                  slug: "",
                  industry: "Solar & Energy",
                  ownerName: "",
                  ownerEmail: "",
                  entityType: "FRANCHISE_HQ",
                  parentHqId: "parent-1",
                  plan: "GROWTH",
                  city: "Lagos, Nigeria",
                });
              }}
              className="p-6 space-y-4 overflow-y-auto flex-1"
            >
              {/* Hierarchy Tier */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  1. Organization Hierarchy & Role Assignment
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      id: "STANDALONE" as const,
                      title: "Stand-Alone Single Business",
                      desc: "Isolated single branch or contractor fleet. Assigns TENANT_OWNER role. Cannot access HQ God-View.",
                      icon: <Building2 className="w-4 h-4 text-emerald-400" />,
                    },
                    {
                      id: "FRANCHISE_HQ" as const,
                      title: "Corporate Franchise HQ",
                      desc: "Parent organization managing child branches/franchisees. Assigns HQ_ADMIN role. Unlocks Franchise God-View.",
                      icon: <Network className="w-4 h-4 text-indigo-400" />,
                    },
                    {
                      id: "SUB_COMPANY" as const,
                      title: "Sub-Company / Branch Office",
                      desc: "Child subsidiary under an existing Corporate HQ. Assigns TENANT_OWNER role. Strictly blocked from HQ God-View.",
                      icon: <Layers className="w-4 h-4 text-amber-400" />,
                    },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.entityType === option.id
                          ? "border-indigo-500 bg-indigo-500/10 text-white"
                          : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="entityType"
                        value={option.id}
                        checked={formData.entityType === option.id}
                        onChange={() => setFormData((prev) => ({ ...prev, entityType: option.id }))}
                        className="mt-1 accent-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-bold text-xs text-white">
                          {option.icon}
                          <span>{option.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sub-Company Parent Selector */}
              {formData.entityType === "SUB_COMPANY" && (
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Select Parent Corporate HQ
                  </label>
                  <select
                    value={formData.parentHqId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parentHqId: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.slug})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-amber-400/80">
                    This branch will roll up revenue and tickets to the selected Corporate HQ, while branch staff will be locked out of the HQ God-View.
                  </p>
                </div>
              )}

              {/* Company Details */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Company / Branch Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Solar Abuja Hub"
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          name: val,
                          slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                        }));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Portal Slug (/s/:slug)</label>
                    <input
                      type="text"
                      required
                      placeholder="apex-abuja"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Solar & Energy">Solar & Renewable Energy</option>
                      <option value="Commercial HVAC">Commercial HVAC</option>
                      <option value="Electrical Systems">Electrical & Power</option>
                      <option value="Facility Maintenance">Facility Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">City / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Abuja, FCT"
                      value={formData.city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Administrator Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Engr. Kolawole"
                      value={formData.ownerName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@tenant.com"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ownerEmail: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Provision Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
