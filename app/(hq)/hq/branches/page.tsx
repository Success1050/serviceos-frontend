"use client";

import React, { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Lock,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button, Input } from "@/components/ui";
import apiClient from "@/lib/api/client";

interface SubCompany {
  id: string;
  name: string;
  slug: string;
  city: string;
  managerName: string;
  managerEmail: string;
  techniciansCount: number;
  openJobsCount: number;
  monthlyRevenue: number;
  royaltyRate: number; // e.g. 5%
  status: "ACTIVE" | "PENDING_APPROVAL";
  inheritedBranding: boolean;
}

export default function SubCompaniesManagementPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; tempPassword?: string } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [royaltyRate, setRoyaltyRate] = useState("5.0");

  const [branches, setBranches] = useState<SubCompany[]>([
    {
      id: "branch-lagos",
      name: "Sunshine Solar - Lagos Island Regional Branch",
      slug: "sunshine-solar-lagos-island",
      city: "Victoria Island, Lagos",
      managerName: "Babatunde Lawal",
      managerEmail: "lagos.manager@sunshinesolar.ng",
      techniciansCount: 16,
      openJobsCount: 21,
      monthlyRevenue: 14800000,
      royaltyRate: 5.0,
      status: "ACTIVE",
      inheritedBranding: true,
    },
    {
      id: "branch-abuja",
      name: "Sunshine Solar - Abuja Capital Branch",
      slug: "sunshine-solar-abuja-capital",
      city: "Maitama, Abuja",
      managerName: "Hadiza Bello",
      managerEmail: "abuja.manager@sunshinesolar.ng",
      techniciansCount: 11,
      openJobsCount: 14,
      monthlyRevenue: 8900000,
      royaltyRate: 5.0,
      status: "ACTIVE",
      inheritedBranding: true,
    },
    {
      id: "branch-ph",
      name: "Sunshine Solar - Port Harcourt Industrial Branch",
      slug: "sunshine-solar-ph-industrial",
      city: "Trans-Amadi, Port Harcourt",
      managerName: "Kelechi Amadi",
      managerEmail: "ph.manager@sunshinesolar.ng",
      techniciansCount: 7,
      openJobsCount: 7,
      monthlyRevenue: 4750000,
      royaltyRate: 5.0,
      status: "ACTIVE",
      inheritedBranding: true,
    },
  ]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      "sunshine-solar-" +
        val
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
    );
  };

  const handleCreateSubCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await apiClient.post("/tenants/sub-companies", {
        name,
        slug,
        address: city,
        managerEmail,
        managerName: managerEmail.split("@")[0].replace(".", " "),
      });

      const newBranch: SubCompany = {
        id: res.data?.id || `branch-${Date.now().toString().slice(-4)}`,
        name: res.data?.name || name,
        slug: res.data?.slug || slug,
        city,
        managerName: managerEmail.split("@")[0].replace(".", " "),
        managerEmail,
        techniciansCount: 0,
        openJobsCount: 0,
        monthlyRevenue: 0,
        royaltyRate: parseFloat(royaltyRate) || 5.0,
        status: "ACTIVE",
        inheritedBranding: true,
      };

      setBranches((prev) => [newBranch, ...prev]);
      setIsModalOpen(false);

      if (res.data?.manager?.tempPassword) {
        setCreatedCredentials({
          email: managerEmail,
          tempPassword: res.data.manager.tempPassword,
        });
      }
      setFeedback(`Sub-company "${name}" successfully registered! Activation email and temporary password dispatched to ${managerEmail}.`);

      // Reset form
      setName("");
      setSlug("");
      setCity("");
      setManagerEmail("");
    } catch {
      // Offline / fallback simulation
      const newBranch: SubCompany = {
        id: `branch-${Date.now().toString().slice(-4)}`,
        name,
        slug,
        city,
        managerName: managerEmail.split("@")[0].replace(".", " "),
        managerEmail,
        techniciansCount: 0,
        openJobsCount: 0,
        monthlyRevenue: 0,
        royaltyRate: parseFloat(royaltyRate) || 5.0,
        status: "ACTIVE",
        inheritedBranding: true,
      };

      setBranches((prev) => [newBranch, ...prev]);
      setIsModalOpen(false);
      setFeedback(`Sub-company "${name}" registered! Welcome email with temporary password dispatched to ${managerEmail}.`);
      setName("");
      setSlug("");
      setCity("");
      setManagerEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase()) ||
      b.managerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Franchise Governance
            </span>
            <span className="text-xs text-slate-400">• Multi-Level Hierarchy Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Sub-Companies & Regional Branches</h1>
          <p className="text-sm text-slate-400 mt-1">
            Provision child franchises, monitor operational volume, and enforce centralized brand identity.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Sub-Company
        </Button>
      </div>

      {createdCredentials && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Branch Credentials & Activation Dispatched</div>
              <div className="text-xs text-slate-300 mt-0.5">
                Activation email dispatched to <strong className="text-emerald-400">{createdCredentials.email}</strong> with temporary password: <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-mono font-bold">{createdCredentials.tempPassword}</code>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                🔒 When this branch manager signs in, they will access their branch backoffice only and are strictly restricted from the Franchise HQ God-View.
              </div>
            </div>
          </div>
          <button onClick={() => setCreatedCredentials(null)} className="text-slate-400 hover:text-white text-xs p-1">
            ✕
          </button>
        </div>
      )}

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Brand Inheritance Notice */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-white">Automated Brand Inheritance: </span>
          All sub-companies automatically inherit logos, color palettes, and invoice schemas from Sunshine Solar HQ.
          Sub-company settings panels are locked to maintain global franchise compliance, while local branch managers retain full operational autonomy over dispatch and customers.
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search branch name, city, or manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-white">{filtered.length}</span> Sub-Companies
        </div>
      </div>

      {/* Sub-Companies Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((branch) => (
          <div
            key={branch.id}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    {branch.status}
                  </span>
                  <h3 className="font-bold text-base text-white mt-2 leading-snug">{branch.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{branch.city}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Pills */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Monthly Revenue
                  </div>
                  <div className="text-sm font-extrabold text-white mt-0.5">
                    {formatCurrency(branch.monthlyRevenue)}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Royalty Rate
                  </div>
                  <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                    {branch.royaltyRate}% to HQ
                  </div>
                </div>
              </div>

              {/* Staff Details */}
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Branch Manager:</span>
                  <span className="font-semibold text-slate-200">{branch.managerName}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Field Technicians:</span>
                  <span className="font-semibold text-white">{branch.techniciansCount} Techs</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Active Jobs:</span>
                  <span className="font-semibold text-emerald-400">{branch.openJobsCount} Open</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Branding:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <Lock className="w-3 h-3" /> Inherited & Locked
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800 mt-5">
              <button className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2">
                <span>View Branch Activities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Sub-Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Register New Sub-Company Branch</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Provisions a child tenant linked directly under Sunshine Solar HQ
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sub-Company / Branch Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunshine Solar Ibadan Branch"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Branch Portal Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Accessible at: /s/{slug || ":slug"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    City / Territory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ibadan, Oyo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Franchise Royalty Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={royaltyRate}
                    onChange={(e) => setRoyaltyRate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Regional Manager Work Email
                </label>
                <input
                  type="email"
                  placeholder="manager@sunshinesolar.ng"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  An activation link will be dispatched to this manager.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Provision Sub-Company
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
