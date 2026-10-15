"use client";

import React, { useState } from "react";
import { EquipmentRequest, Warehouse } from "@/lib/types";
import { Button, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Package, Truck, ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";

interface EquipmentRequestsTableProps {
  requests: EquipmentRequest[];
  onOpenApproveModal: (request: EquipmentRequest) => void;
  onRequestEquipment: () => void;
}

export function EquipmentRequestsTable({
  requests,
  onOpenApproveModal,
  onRequestEquipment,
}: EquipmentRequestsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Sub-Company & Branch Equipment Requisitions
            </h2>
            <Badge variant="neutral" className="text-[10px] bg-slate-100 text-slate-700">
              {requests.length} Total Requests
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal transfer requisitions submitted by regional branches and field supervisors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/70 text-xs font-semibold">
            {["ALL", "PENDING", "APPROVED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                  statusFilter === status
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {status.toLowerCase()}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={onRequestEquipment}
            className="bg-[#006937] hover:bg-[#004D28] text-white text-xs font-bold gap-1 h-8 shadow-2xs shrink-0 cursor-pointer"
          >
            <span>+ New Requisition</span>
          </Button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Requisition ID</th>
              <th className="py-3 px-4">Requested Equipment</th>
              <th className="py-3 px-4 text-center">Quantity</th>
              <th className="py-3 px-4">Origin / Central Hub</th>
              <th className="py-3 px-4">Submitted Date</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-slate-500">
                  No equipment requests found for this filter.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const isPending = req.status === "PENDING";
                const isApproved = req.status === "APPROVED";

                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      REQ-{req.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{req.product?.name || "Equipment"}</span>
                      <span className="font-mono text-[11px] text-slate-400">{req.product?.sku || "SKU-N/A"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-sm text-slate-900">{req.quantity} units</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {req.hqWarehouse?.name || "Central Logistics Hub"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {formatDate(req.createdAt, "short")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending HQ Review</span>
                        </span>
                      ) : isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Approved & Transferred</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {req.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isPending ? (
                        <Button
                          size="sm"
                          onClick={() => onOpenApproveModal(req)}
                          className="h-7 text-[11px] px-2.5 gap-1.5 font-bold bg-[#006937] hover:bg-[#004D28] text-white shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>Approve & Transfer</span>
                        </Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 italic">
                          Transferred
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
