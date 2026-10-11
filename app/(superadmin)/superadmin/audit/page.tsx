"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Calendar,
  Filter,
  Eye,
  UserCheck,
  AlertTriangle,
  Lock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";

interface AuditEntry {
  id: string;
  action: string;
  category: "IMPERSONATION" | "TENANT_SUSPENSION" | "PLAN_OVERRIDE" | "SECURITY";
  actorEmail: string;
  targetTenant: string;
  details: string;
  ipAddress: string;
  timestamp: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export default function SuperAdminAuditPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  const [logs] = useState<AuditEntry[]>([
    {
      id: "aud-901",
      action: "TENANT_IMPERSONATION_STARTED",
      category: "IMPERSONATION",
      actorEmail: "superadmin@serviceos.platform",
      targetTenant: "Sunshine Solar Ltd (parent-1)",
      details: "Generated short-lived cryptographically audited token to debug dispatch calendar.",
      ipAddress: "197.210.54.12",
      timestamp: "Today, 19:42",
      severity: "WARNING",
    },
    {
      id: "aud-902",
      action: "TENANT_MODULE_OVERRIDE_GRANTED",
      category: "PLAN_OVERRIDE",
      actorEmail: "superadmin@serviceos.platform",
      targetTenant: "GreenPower Energy West (ten-2)",
      details: "Granted direct contract override for MODULE_CUSTOMER_PORTAL on GROWTH tier.",
      ipAddress: "197.210.54.12",
      timestamp: "Today, 18:15",
      severity: "INFO",
    },
    {
      id: "aud-903",
      action: "TENANT_STATUS_SUSPENDED",
      category: "TENANT_SUSPENSION",
      actorEmail: "superadmin@serviceos.platform",
      targetTenant: "Rogue HVAC Franchise (ten-8)",
      details: "Emergency suspension enacted. Reason: Unresolved charge dispute dunning failure.",
      ipAddress: "197.210.54.12",
      timestamp: "Yesterday, 14:30",
      severity: "CRITICAL",
    },
    {
      id: "aud-904",
      action: "LEGAL_TERMS_COMPENSATION_ACKNOWLEDGED",
      category: "SECURITY",
      actorEmail: "tech.chidi@sunshinesolar.ng",
      targetTenant: "Sunshine Solar Ltd",
      details: "Technician signed legal commission disclosure via Big Button (15% rate). Audit snapshot logged.",
      ipAddress: "102.89.33.19",
      timestamp: "Yesterday, 11:20",
      severity: "INFO",
    },
  ]);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.targetTenant.toLowerCase().includes(search.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === "ALL" || log.category === filter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Audit & Compliance
            </span>
            <span className="text-xs text-slate-400">• Immutable Security Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Platform Audit Logs</h1>
          <p className="text-sm text-slate-400 mt-1">
            Cryptographic audit trail tracking all SuperAdmin actions, impersonations, suspensions, and legal acknowledgments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 hover:bg-slate-800">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
            Export Audit Trail (CSV)
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, tenant, or admin email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "IMPERSONATION", "TENANT_SUSPENSION", "PLAN_OVERRIDE", "SECURITY"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                filter === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat === "ALL" ? "All Events" : cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5">Event & Severity</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Target Organization</th>
                <th className="py-3.5 px-4">Description & Context</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.severity === "CRITICAL"
                            ? "bg-rose-500 ring-4 ring-rose-500/20"
                            : log.severity === "WARNING"
                            ? "bg-amber-500 ring-4 ring-amber-500/20"
                            : "bg-indigo-500 ring-4 ring-indigo-500/20"
                        }`}
                      />
                      <span className="font-mono text-[11px] font-bold text-white">{log.action}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-slate-300">{log.actorEmail}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-white">{log.targetTenant}</span>
                  </td>
                  <td className="py-4 px-4 max-w-sm">
                    <span className="text-slate-400 text-[11px] leading-relaxed">{log.details}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                  <td className="py-4 px-5 text-right text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
