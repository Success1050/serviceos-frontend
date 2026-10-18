"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTechAuth } from "@/components/tech";

export default function TechnicianRootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useTechAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/tech/jobs");
      } else {
        router.replace("/tech/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-white text-center">
      <div className="w-10 h-10 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin" />
      <p className="mt-4 text-xs font-bold text-slate-400">Loading ServiceOS Field PWA...</p>
    </div>
  );
}
