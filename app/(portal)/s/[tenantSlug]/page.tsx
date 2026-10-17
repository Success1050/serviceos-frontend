"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTenantPortal } from "@/components/portal";
import {
  Sun,
  BatteryCharging,
  ShieldCheck,
  Wrench,
  Clock,
  PhoneCall,
  LogIn,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowRight,
  FileText,
  CreditCard,
  MessageSquare,
  Sparkles,
  Award,
  AlertCircle,
  MapPin,
  Send,
} from "lucide-react";

export default function TenantPortalHomePage() {
  const { tenant, theme } = useTenantPortal();
  const slug = tenant?.slug || "";
  const basePath = `/s/${slug}`;

  // Interactive quick request state
  const [requestServiceType, setRequestServiceType] = useState("routine");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: "",
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("serviceos_customer_token");
      const ctx = localStorage.getItem("serviceos_customer_context");
      if (token && ctx) {
        setIsCustomerLoggedIn(true);
        try {
          const parsed = JSON.parse(ctx);
          setCustomerName(parsed.customerName || "Customer");
        } catch {
          setCustomerName("Customer");
        }
      } else {
        setIsCustomerLoggedIn(false);
      }
    }
  }, []);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setRequestSubmitted(true);
  };

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-slate-200/70 bg-gradient-to-b from-white via-slate-50/70 to-slate-100/50">
        {/* Ambient brand glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[120px] pointer-events-none -z-10 opacity-20"
          style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Verified badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200/80 shadow-xs mb-6 text-slate-700">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--tenant-primary, #006937)" }} />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Service Contractor • {theme.industry}</span>
            </div>

            {/* Dynamic Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              {theme.companyName}
            </h1>

            {/* Welcome message */}
            <p className="mt-5 text-base sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl">
              {theme.welcomeMessage}
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              {isCustomerLoggedIn ? (
                <Link
                  href={`${basePath}/dashboard`}
                  id="portal-hero-dashboard-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white shadow-md transition-all duration-200 hover:brightness-95 active:scale-[0.98] text-sm sm:text-base"
                  style={{
                    backgroundColor: "var(--tenant-primary, #006937)",
                    boxShadow: "0 4px 18px -4px var(--tenant-primary-glow, rgba(0,105,55,0.4))",
                  }}
                >
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Go to My Dashboard ({customerName})</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>
              ) : (
                <Link
                  href={`${basePath}/login`}
                  id="portal-hero-login-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white shadow-md transition-all duration-200 hover:brightness-95 active:scale-[0.98] text-sm sm:text-base"
                  style={{
                    backgroundColor: "var(--tenant-primary, #006937)",
                    boxShadow: "0 4px 18px -4px var(--tenant-primary-glow, rgba(0,105,55,0.4))",
                  }}
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Customer Portal Login</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>
              )}

              <a
                href="#request"
                id="portal-hero-book-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs text-sm sm:text-base"
              >
                <Wrench className="w-4 h-4 text-slate-500" />
                <span>Book Service or Inspection</span>
              </a>
            </div>

            {/* Quick credentials ticker */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 w-full grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-xs text-slate-500 font-medium">Response SLA</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  &lt; 24 Hours
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-xs text-slate-500 font-medium">Warranty Claims</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Direct OEM Support
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-xs text-slate-500 font-medium">Escrow Protection</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  Milestone Secured
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-xs text-slate-500 font-medium">Technicians</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Certified & Insured
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES & ASSET HEALTH PILLARS */}
      <section id="services" className="py-16 sm:py-24 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{
                color: "var(--tenant-primary, #006937)",
                backgroundColor: "var(--tenant-primary-light, rgba(0,105,55,0.08))",
              }}
            >
              Enterprise Capabilities
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Self-Serve Solar & Engineering Management
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Everything you need to monitor, service, and authorize work on your clean power assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-7 hover:border-slate-300 transition-all hover:shadow-lg hover:shadow-slate-100 group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-5 shadow-xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                <Zap className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Inverters & Solar Arrays
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Log warranty serial numbers, inspect string voltages, and schedule thermal imaging scans to prevent cell degradation.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500 border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Hybrid inverter health diagnostics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Automated quarterly array cleaning</span>
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-7 hover:border-slate-300 transition-all hover:shadow-lg hover:shadow-slate-100 group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-5 shadow-xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: "var(--tenant-secondary, #004d28)" }}
              >
                <BatteryCharging className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Lithium Storage & BMS
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Real-time tracking of lithium storage cycles, battery management system firmware health, and proactive capacity alerts.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500 border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Cell balancing & capacity verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Proactive replacement planning</span>
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-7 hover:border-slate-300 transition-all hover:shadow-lg hover:shadow-slate-100 group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-5 shadow-xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                <FileText className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Quotes, Invoices & Escrow
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Approve job estimates digitally with complete legal certainty. Release milestone funds only when work is completed.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-500 border-t border-slate-200/60 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Digital sign-off on detailed estimates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Instant receipt & VAT compliance export</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RECURRING MAINTENANCE SCHEDULE CALLOUT */}
      <section id="maintenance" className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-300 border border-white/10">
                <Calendar className="w-3.5 h-3.5" />
                <span>Automated Maintenance Cycles (SLA Protection)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Never miss scheduled servicing for critical power systems.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Our backend automatically tracks scheduled service dates and dispatches vetted field technicians 7 days prior to expiry. As soon as a maintenance cycle completes, the next window advances automatically.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <div className="text-emerald-400 font-bold text-lg">Quarterly</div>
                  <div className="text-xs text-slate-300 mt-0.5">PV Cleaning & Inverter Thermal Diagnostic</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <div className="text-sky-400 font-bold text-lg">Biannual</div>
                  <div className="text-xs text-slate-300 mt-0.5">BMS Deep Cycle & Battery Balancing</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                  <div className="text-amber-400 font-bold text-lg">Annual</div>
                  <div className="text-xs text-slate-300 mt-0.5">Comprehensive Safety Audit & Recertification</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Ready to review your contracts?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                Log into your customer dashboard to see upcoming service due dates, linked job IDs, and historical maintenance logs for all your properties.
              </p>
              <Link
                href={`${basePath}/login`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                <span>Access Maintenance Records</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUICK BOOKING / SERVICE REQUEST SECTION */}
      <section id="request" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-12">
            <div className="max-w-xl mx-auto text-center mb-8">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-sm"
                style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
              >
                <Wrench className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Request Service or Inspection
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Direct dispatch to {theme.companyName}&apos;s field technicians.
              </p>
            </div>

            {requestSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center animate-fadeIn">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <CheckCircle2 className="w-8 h-8 stroke-[2]" />
                </div>
                <h3 className="text-lg font-bold text-emerald-950">
                  Request Dispatched to Field Operations!
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800 mt-2 max-w-md mx-auto">
                  Thank you, <strong className="font-semibold">{formData.name}</strong>. A service ticket has been created. Our team will reach you on <strong className="font-semibold">{formData.phone}</strong> within 30 minutes.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setRequestSubmitted(false);
                      setFormData({ name: "", phone: "", notes: "" });
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-4 py-2 rounded-lg bg-emerald-100/60"
                  >
                    Submit Another Request
                  </button>
                  <Link
                    href={`${basePath}/login`}
                    className="text-xs font-semibold text-white px-4 py-2 rounded-lg shadow-xs"
                    style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                  >
                    Track in Portal
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* Service Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Service Required
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "routine", title: "Routine Maintenance", desc: "Inspection & Cleaning" },
                      { id: "emergency", title: "Emergency Diagnostic", desc: "Outage or Fault" },
                      { id: "expansion", title: "System Upgrade", desc: "Batteries / More Panels" },
                    ].map((svc) => (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => setRequestServiceType(svc.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          requestServiceType === svc.id
                            ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <div className="text-xs font-bold">{svc.title}</div>
                        <div className={`text-[11px] mt-0.5 ${requestServiceType === svc.id ? "text-slate-300" : "text-slate-500"}`}>
                          {svc.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adebayo Ogunlesi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ outlineColor: "var(--tenant-primary, #006937)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contact Phone (for SMS PIN / Updates) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +234 803 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      style={{ outlineColor: "var(--tenant-primary, #006937)" }}
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Location & Problem Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your equipment model, issue, or address notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ outlineColor: "var(--tenant-primary, #006937)" }}
                  />
                </div>

                <button
                  type="submit"
                  id="portal-submit-service-btn"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-md transition-all duration-200 hover:brightness-95 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Service Ticket to Operations</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 5. DIRECT CONTACT & PHYSICAL PRESENCE */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-3xl p-8 sm:p-12 border border-slate-200/80">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    color: "var(--tenant-primary, #006937)",
                    backgroundColor: "var(--tenant-primary-light, rgba(0,105,55,0.08))",
                  }}
                >
                  Official Company Office
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-3">
                  {theme.companyName}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2">
                  Operating in full compliance with Nigerian Electricity Regulatory Commission (NERC) and local renewable energy codes.
                </p>

                <div className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700">
                  {theme.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <span>{theme.address}{theme.city ? `, ${theme.city}` : ""}{theme.state ? `, ${theme.state}` : ""}</span>
                    </div>
                  )}
                  {theme.phone && (
                    <div className="flex items-center gap-3">
                      <PhoneCall className="w-4 h-4 text-slate-400 shrink-0" />
                      <a href={`tel:${theme.phone}`} className="hover:underline font-semibold text-slate-900">
                        {theme.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <Link
                  href={`${basePath}/login`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white shadow-sm transition-all"
                  style={{ backgroundColor: "var(--tenant-primary, #006937)" }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Enter Customer Portal</span>
                </Link>
                {theme.phone && (
                  <a
                    href={`tel:${theme.phone}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-600" />
                    <span>Call Contractor Hotline</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
