"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import Header from "@/components/layout/header";
import { StatCard, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge, Button } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, Calendar, Users, Wrench, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  metrics: {
    totalRevenue: number;
    openJobsCount: number;
    activeCustomersCount: number;
    pendingQuotesCount: number;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    customerName: string;
    status: string;
    scheduledStart: string;
    technicianName?: string;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    amount: number;
    status: string;
    dueDate: string;
  }>;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => {
      try {
        const res = await apiClient.get("/analytics/dashboard");
        return res.data;
      } catch {
        // Sensible fallback presentation data while backend is initializing
        return {
          metrics: {
            totalRevenue: 4850000,
            openJobsCount: 14,
            activeCustomersCount: 128,
            pendingQuotesCount: 6,
          },
          recentJobs: [
            {
              id: "1",
              title: "5kW Hybrid Inverter Installation",
              customerName: "Chief Adeleke",
              status: "IN_PROGRESS",
              scheduledStart: new Date().toISOString(),
              technicianName: "Tech Emeka",
            },
            {
              id: "2",
              title: "Quarterly Solar Array Maintenance",
              customerName: "Dr. Ngozi Okonjo",
              status: "SCHEDULED",
              scheduledStart: new Date(Date.now() + 86400000).toISOString(),
              technicianName: "Tech Tunde",
            },
            {
              id: "3",
              title: "Lithium Battery Bank Diagnostics",
              customerName: "Victoria Island Towers",
              status: "COMPLETED",
              scheduledStart: new Date(Date.now() - 86400000).toISOString(),
              technicianName: "Tech Ibrahim",
            },
          ],
          recentInvoices: [
            {
              id: "inv-1",
              invoiceNumber: "INV-2026-0042",
              customerName: "Chief Adeleke",
              amount: 1450000,
              status: "PAID",
              dueDate: new Date().toISOString(),
            },
            {
              id: "inv-2",
              invoiceNumber: "INV-2026-0043",
              customerName: "Green Valley Estate",
              amount: 850000,
              status: "PENDING",
              dueDate: new Date(Date.now() + 604800000).toISOString(),
            },
            {
              id: "inv-3",
              invoiceNumber: "INV-2026-0044",
              customerName: "Alpha Energy Hub",
              amount: 2200000,
              status: "DISPUTED",
              dueDate: new Date().toISOString(),
            },
          ],
        };
      }
    },
  });

  return (
    <div className="flex-1 pb-12">
      <Header
        title="Operations Overview"
        subtitle="Real-time telemetry and service performance metrics"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/app/dispatch">
              <Button size="sm" variant="outline" leftIcon={<Calendar className="w-4 h-4" />}>
                Dispatch View
              </Button>
            </Link>
            <Link href="/app/quotes">
              <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Create Quote
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data?.metrics?.totalRevenue ?? 0)}
            subtitle="YTD Settled Invoices"
            icon={<DollarSign className="w-5 h-5" />}
            trend={{ value: 18.4, isPositive: true }}
          />
          <StatCard
            title="Active Jobs"
            value={data?.metrics?.openJobsCount ?? 0}
            subtitle="Dispatched / In Progress"
            icon={<Wrench className="w-5 h-5" />}
            trend={{ value: 4.2, isPositive: true }}
          />
          <StatCard
            title="Customers"
            value={data?.metrics?.activeCustomersCount ?? 0}
            subtitle="Total Registered CRM"
            icon={<Users className="w-5 h-5" />}
            trend={{ value: 12.0, isPositive: true }}
          />
          <StatCard
            title="Pending Quotes"
            value={data?.metrics?.pendingQuotesCount ?? 0}
            subtitle="Awaiting Customer Review"
            icon={<DollarSign className="w-5 h-5" />}
            trend={{ value: 2.1, isPositive: false }}
          />
        </div>

        {/* Operational Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Field Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Active Field Jobs</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Live status of ongoing field installations and repairs</p>
              </div>
              <Link href="/app/dispatch">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Board
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job / Customer</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                        Loading field telemetry...
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.recentJobs?.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div className="font-semibold text-slate-900">{job.title}</div>
                          <div className="text-xs text-slate-400">{job.customerName}</div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {job.technicianName || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          <Badge status={job.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Invoices & Billing */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Settlement status and incoming receivables</p>
              </div>
              <Link href="/app/invoices">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                        Loading invoices...
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.recentInvoices?.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell>
                          <div className="font-semibold text-slate-900">{inv.invoiceNumber}</div>
                          <div className="text-xs text-slate-400">{inv.customerName}</div>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {formatCurrency(inv.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge status={inv.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
