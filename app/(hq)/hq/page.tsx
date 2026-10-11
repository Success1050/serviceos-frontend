"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  DollarSign,
  Users,
  Wrench,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Package,
  Megaphone,
  Ticket,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge, Button } from "@/components/ui";

export default function HQDashboardPage() {
  const networkMetrics = {
    totalNetworkRevenue: 28450000,
    activeBranchesCount: 3,
    totalTechnicians: 34,
    openNetworkJobs: 42,
    franchiseRoyaltiesAccumulated: 1422500, // 5% royalty
  };

  const branches = [
    {
      id: "branch-lagos",
      name: "Lagos Island Regional Branch",
      city: "Lagos, Nigeria",
      manager: "Babatunde Lawal",
      monthlyRevenue: 14800000,
      activeJobs: 21,
      techs: 16,
      royaltyPaid: 740000,
      status: "HEALTHY",
    },
    {
      id: "branch-abuja",
      name: "Abuja Capital Branch",
      city: "Abuja, FCT",
      manager: "Hadiza Bello",
      monthlyRevenue: 8900000,
      activeJobs: 14,
      techs: 11,
      royaltyPaid: 445000,
      status: "HEALTHY",
    },
    {
      id: "branch-ph",
      name: "Port Harcourt Industrial Branch",
      city: "Port Harcourt, Rivers",
      manager: "Kelechi Amadi",
      monthlyRevenue: 4750000,
      activeJobs: 7,
      techs: 7,
      royaltyPaid: 237500,
      status: "NEEDS_ATTENTION",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Corporate God-View
            </span>
            <span className="text-xs text-slate-400">• System-Wide Franchise Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Enterprise Franchise Command</h1>
          <p className="text-sm text-slate-400 mt-1">
            Aggregate revenue, branch footprint, supply chain requisitions, and regional performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/hq/branches">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/30">
              <Building2 className="w-4 h-4 mr-2" />
              Manage Sub-Companies
            </Button>
          </Link>
        </div>
      </div>

      {/* Network Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Network Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {formatCurrency(networkMetrics.totalNetworkRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.8% vs last month</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Franchise Footprint</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {networkMetrics.activeBranchesCount}{" "}
            <span className="text-xs text-slate-400 font-normal">Active Branches</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">100% Brand & Settings Inherited</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Technicians</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {networkMetrics.totalTechnicians}
          </div>
          <div className="text-xs text-emerald-400 mt-2">Across 3 regional hubs</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>HQ Royalties Accumulated</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {formatCurrency(networkMetrics.franchiseRoyaltiesAccumulated)}
          </div>
          <div className="text-xs text-slate-400 mt-2">Automatic 5% split settlements</div>
        </div>
      </div>

      {/* Sub-Companies Overview Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Regional Sub-Companies & Branches</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live operational metrics and revenue generated across all child branches
            </p>
          </div>
          <Link
            href="/hq/branches"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            <span>View All Sub-Companies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5">Sub-Company Branch</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Branch Manager</th>
                <th className="py-3 px-4 text-center">Techs / Jobs</th>
                <th className="py-3 px-4 text-right">Monthly Revenue</th>
                <th className="py-3 px-4 text-right">Royalty to HQ</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white">{b.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{b.id}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-300">{b.city}</td>
                  <td className="py-4 px-4 text-slate-300">{b.manager}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-semibold text-white">{b.techs}</span> techs •{" "}
                    <span className="font-semibold text-emerald-400">{b.activeJobs}</span> jobs
                  </td>
                  <td className="py-4 px-4 text-right font-extrabold text-white">
                    {formatCurrency(b.monthlyRevenue)}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-400">
                    {formatCurrency(b.royaltyPaid)}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Link
                      href={`/hq/branches?branch=${b.id}`}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors"
                    >
                      Branch Details →
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
