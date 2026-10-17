"use client";

import React from "react";
import Link from "next/link";
import { Building2, ArrowLeft, ArrowRight, Compass, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

interface TenantNotFoundProps {
  slug?: string;
  customMessage?: string;
}

export function TenantNotFound({ slug, customMessage }: TenantNotFoundProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-200/40 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Decorative top brand bar */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="font-semibold text-slate-900 tracking-tight text-base">
            Service<span className="text-emerald-600">OS</span>
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60 ml-1">
            Gateway
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Platform
        </Link>
      </header>

      {/* Main card */}
      <main className="w-full max-w-xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10 relative overflow-hidden mt-12">
        {/* Subtle decorative radial background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Warning Badge & Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-inner">
              <Building2 className="w-10 h-10 stroke-[1.6]" />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md">
              <ShieldAlert className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-800 border border-amber-200 mb-3">
            <Compass className="w-3.5 h-3.5" />
            404 • Dynamic Tenant Resolution
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            ServiceOS Business Not Found
          </h1>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-md">
            {customMessage || (
              <>
                No active company portal was found matching{" "}
                <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  /s/{slug || "unknown"}
                </span>
                . The slug may be misspelled or the organization may not yet have activated their customer portal.
              </>
            )}
          </p>
        </div>

        {/* Troubleshooting suggestions */}
        <div className="mt-8 bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/70 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            What can you do?
          </div>
          <ul className="text-xs text-slate-600 space-y-2 leading-normal">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <span>Double check the web link provided by your service contractor or technician.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <span>Ensure hyphens and capital letters match the official tenant handle.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <span>Explore active demo tenant portals below to see the white-label customer experience in action.</span>
            </li>
          </ul>
        </div>

        {/* Quick Demo Links */}
        <div className="mt-6 space-y-2.5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider text-center">
            Explore Active Portals
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href="/s/sunshine-solar"
              className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#006937] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  SS
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-800">
                    Sunshine Solar
                  </div>
                  <div className="text-[11px] text-slate-500">/s/sunshine-solar</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/s/greenpower"
              className="flex items-center justify-between p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  GP
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-sky-800">
                    GreenPower Energy
                  </div>
                  <div className="text-[11px] text-slate-500">/s/greenpower</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium text-center transition-colors shadow-xs"
          >
            Go to Platform Homepage
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            Staff & Technician Login
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        ServiceOS Multi-Tenant Architecture • Safe Tenant Isolation
      </footer>
    </div>
  );
}

export default TenantNotFound;
