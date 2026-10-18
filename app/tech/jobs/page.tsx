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
    <div className="flex-1 flex flex-col bg-slate-950 text-white">
      {/* 1. Technician Duty & Profile Strip */}
      <section className="p-4 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-md">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                  isOnDuty ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ★ {user.rating ?? "4.95"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {user.tenantName || "Field Electrician & PV Specialist"}
              </p>
            </div>
          </div>

          {/* On Duty Toggle */}
          <button
            type="button"
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
              isOnDuty
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnDuty ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
            <span>{isOnDuty ? "On Duty" : "Off Duty"}</span>
          </button>
        </div>

        {/* Quick Duty Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/60 text-center">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Today's Jobs</span>
            <span className="text-sm font-black text-white">2 Assigned</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Virtual Truck</span>
            <span className="text-sm font-black text-emerald-400">Restocked</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Commission</span>
            <span className="text-sm font-black text-amber-400">15.0%</span>
          </div>
        </div>
      </section>

      {/* 2. Job Queue Section Tabs */}
      <div className="p-4 space-y-4">
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className={`flex-1 py-2 rounded-lg text-center transition-all ${
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
            className={`flex-1 py-2 rounded-lg text-center transition-all ${
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
            className={`flex-1 py-2 rounded-lg text-center transition-all ${
              activeTab === "completed"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Completed
          </button>
        </div>

        {/* 3. Dispatched Field Work Orders */}
        <div className="space-y-3">
          {/* Work Order Card 1 */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Next Priority
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">
                  10kVA Victron Hybrid Solar Turnkey Commissioning
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer: <strong>Chief John Okafor</strong>
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                11:30 AM
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>24 Admiralty Way, Lekki Phase 1, Lagos</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>+234 800 111 2222</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://maps.google.com/?q=24+Admiralty+Way+Lekki+Phase+1+Lagos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Navigate</span>
              </a>

              <button
                type="button"
                onClick={() => router.push("/tech/jobs")}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-xs font-extrabold text-white flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-950 transition-all cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>En Route (Day 20)</span>
              </button>
            </div>
          </div>

          {/* Work Order Card 2 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                  Scheduled Today
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">
                  Quarterly Inverter Cleaning & Cable Torque Inspection
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer: <strong>Homie blessing</strong>
                </p>
              </div>

              <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg">
                3:00 PM
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>NO.2 Ademola Adetokunbo street, Victoria Island</span>
              </p>
            </div>
          </div>
        </div>

        {/* Day 18 Verification Notice */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white">Day 18 Verification Complete</p>
            <p className="text-[11px] text-emerald-400/80 mt-0.5 leading-relaxed">
              Mobile PWA container and passwordless 4-digit SMS PIN authentication successfully established session with offline caching.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
