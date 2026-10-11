"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Key,
  Globe,
  Bell,
  Save,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";

export default function SuperAdminSettingsPage() {
  const [platformName, setPlatformName] = useState("ServiceOS Platform");
  const [supportEmail, setSupportEmail] = useState("root@serviceos.platform");
  const [jwtExpirationHours, setJwtExpirationHours] = useState("24");
  const [impersonationTokenMinutes, setImpersonationTokenMinutes] = useState("30");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Global Environment
          </span>
          <span className="text-xs text-slate-400">• Root Authority</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Global Platform Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure network-wide parameters, cryptographic token lifetimes, and platform security boundaries.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Global platform configuration successfully updated and broadcast to all nodes!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Globe className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Platform Identity</h2>
              <p className="text-xs text-slate-400">Master branding for platform notifications and landing page</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Platform Brand Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Root Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Security & Token Lifetimes */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <Key className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Cryptographic Token Lifetimes</h2>
              <p className="text-xs text-slate-400">Expiration rules for JWT session issuance and impersonation access</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Standard User Session TTL (Hours)</label>
              <input
                type="number"
                value={jwtExpirationHours}
                onChange={(e) => setJwtExpirationHours(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Default: 24 hours before re-authentication</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Audited Impersonation TTL (Minutes)</label>
              <input
                type="number"
                value={impersonationTokenMinutes}
                onChange={(e) => setImpersonationTokenMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Short-lived to strictly limit impersonation window</p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30">
            <Save className="w-4 h-4 mr-2" />
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
