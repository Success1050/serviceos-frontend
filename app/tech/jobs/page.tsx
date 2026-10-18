"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTechAuth } from "@/components/tech";
import {
  Wrench,
  Clock,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Navigation,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  User,
  ChevronRight,
  BatteryCharging,
  Truck,
  TrendingUp,
  Star,
} from "lucide-react";

export default function TechnicianJobsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useTechAuth();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "completed">("today");

  // Protect route
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/tech/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div className="w-10 h-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
        <p className="mt-3 text-xs font-semibold text-slate-400">Loading technician dispatch queue...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white w-full">
      {/* 1. Technician Duty & Profile Banner */}
      <section className="p-4 sm:p-6 bg-gradient-to-b from-slate-900 to-slate-950 border-b md:border md:rounded-3xl border-slate-800/80 md:mt-4 md:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${
                  isOnDuty ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
                title={isOnDuty ? "Live On-Duty status active" : "Off-Duty"}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{user.rating ?? "4.95"}</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Engineer
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {user.tenantName || "Sunshine Solar Ltd"} • Field Operations & Installations
              </p>
            </div>
          </div>

          {/* On Duty Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                isOnDuty
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnDuty ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              <span>{isOnDuty ? "Status: Active On Duty" : "Status: Off Duty"}</span>
            </button>
          </div>
        </div>

        {/* Duty Metrics Strip (Responsive 3 col mobile / 4 col desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-5 pt-4 border-t border-slate-800/60">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">Today's Jobs</span>
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-base sm:text-lg font-black text-white">2 Dispatched</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">Virtual Truck</span>
              <Truck className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <span className="text-base sm:text-lg font-black text-emerald-400">Restocked (100%)</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">Commission</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-base sm:text-lg font-black text-amber-400">15.0% Split</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">Total Completed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-base sm:text-lg font-black text-white">{user.jobsCompletedCount ?? 148} Site Visits</span>
          </div>
        </div>
      </section>

      {/* 2. Job Queue Section Tabs & Dispatches */}
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Assigned Field Work Orders
            </h2>
            <p className="text-xs text-slate-400">
              Live dispatches synchronized with Sunshine Solar corporate logistics
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("today")}
              className={`px-4 py-2 rounded-lg text-center transition-all ${
                activeTab === "today"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Today (2)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-lg text-center transition-all ${
                activeTab === "upcoming"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Upcoming (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-2 rounded-lg text-center transition-all ${
                activeTab === "completed"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* 3. Dispatched Work Orders (Responsive Grid: 1 col on mobile, 2 cols on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Work Order Card 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Next Immediate Priority
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1.5 leading-snug">
                    10kVA Victron Hybrid Solar Turnkey Commissioning
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Client: <strong className="text-slate-200">Chief John Okafor</strong>
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shrink-0">
                  11:30 AM
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <p className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>24 Admiralty Way, Lekki Phase 1, Lagos</span>
                </p>
                <p className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>+234 800 111 2222</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
              <a
                href="https://maps.google.com/?q=24+Admiralty+Way+Lekki+Phase+1+Lagos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Navigate Site</span>
              </a>

              <button
                type="button"
                onClick={() => router.push("/tech/jobs")}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-md shadow-emerald-950 transition-all cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>En Route (Day 20)</span>
              </button>
            </div>
          </div>

          {/* Work Order Card 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                    Scheduled Afternoon
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1.5 leading-snug">
                    Quarterly Inverter Cleaning & Cable Torque Inspection
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Client: <strong className="text-slate-200">Homie blessing</strong>
                  </p>
                </div>

                <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg shrink-0">
                  3:00 PM
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <p className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>NO.2 Ademola Adetokunbo street, Victoria Island</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
              <a
                href="https://maps.google.com/?q=NO.2+Ademola+Adetokunbo+street+Victoria+Island"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>View Directions</span>
              </a>
            </div>
          </div>
        </div>

        {/* Day 18 Verification Notice */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-white text-sm">Day 18 Verification Complete</p>
            <p className="text-xs text-emerald-400/80 leading-relaxed">
              Responsive PWA container (auto-adapting across mobile screens & full desktop displays) and passwordless 4-digit SMS PIN authentication established active technician session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
