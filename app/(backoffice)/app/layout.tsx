"use client";

import React from "react";
import Sidebar from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/providers/sidebar-provider";

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
