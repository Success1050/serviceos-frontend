"use client";

import React from "react";
import Link from "next/link";
import { useTenantPortal } from "./portal-context";
import {
  MapPin,
  Phone,
  Mail,
  Shield,
  Clock,
  CheckCircle2,
  ExternalLink,
  Zap,
} from "lucide-react";

export function PortalFooter() {
  const { tenant, theme } = useTenantPortal();
  const slug = tenant?.slug || "";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {theme.logoUrl ? (
                <img
                  src={theme.logoUrl}
                  alt={theme.companyName}
                  className="w-9 h-9 rounded-lg object-cover bg-white/10 p-0.5"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
                  style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                >
                  {theme.companyName.charAt(0)}
                </div>
              )}
              <span className="text-lg font-bold text-white tracking-tight">
                {theme.companyName}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {theme.welcomeMessage ||
                "Certified field engineering, renewable energy installations, and round-the-clock maintenance operations."}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified ServiceOS Service Contractor</span>
            </div>
          </div>

          {/* Quick Portal Services */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Customer Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link
                  href={`/s/${slug}#request`}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Request Solar Inspection / Repair</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/s/${slug}#maintenance`}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>Schedule Periodic Servicing</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/s/${slug}/login`}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Review Active Quotes & Invoices</span>
                </Link>
              </li>
              <li>
                <Link
                  href={`/s/${slug}/login`}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Warranty Dossier & Asset Logs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Direct Contact
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              {theme.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {theme.address}
                    {theme.city ? `, ${theme.city}` : ""}
                    {theme.state ? `, ${theme.state}` : ""}
                  </span>
                </div>
              )}

              {theme.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`tel:${theme.phone}`}
                    className="hover:text-white transition-colors font-medium text-slate-300"
                  >
                    {theme.phone}
                  </a>
                </div>
              )}

              {theme.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${theme.email}`}
                    className="hover:text-white transition-colors font-medium text-slate-300"
                  >
                    {theme.email}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Mon – Sat: 8:00 AM – 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Customer Self-Serve Notice */}
          <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Customer Portal Security
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Log in via your verified phone number or email using secure SMS one-time PIN authentication. No passwords to remember.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-700/80">
              <Link
                href={`/s/${slug}/login`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all shadow-xs"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                Access Account
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Platform Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {currentYear} {theme.companyName}. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <span>Powered by</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[9px]">
                S
              </div>
              <span>ServiceOS Enterprise</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PortalFooter;
