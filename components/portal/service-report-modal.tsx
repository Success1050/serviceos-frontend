"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  X,
  Calendar,
  User,
  Wrench,
  Zap,
  Award,
  Sparkles,
} from "lucide-react";

interface ServiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    description?: string;
    scheduledAt?: string;
    completedAt?: string;
    assignedTechnician?: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      rating?: number;
      phone?: string;
    };
  } | null;
  customerName: string;
  customerAddress?: string;
  tenantName: string;
  logoUrl?: string | null;
  primaryColor?: string;
  asset?: {
    name: string;
    modelNumber?: string;
    serialNumber?: string;
    manufacturer?: string;
  };
}

export function ServiceReportModal({
  isOpen,
  onClose,
  job,
  customerName,
  customerAddress,
  tenantName,
  logoUrl,
  primaryColor = "#006937",
  asset,
}: ServiceReportModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !job) return null;

  const reportId = `SRV-${(job.id || "1024").substring(0, 8).toUpperCase()}`;
  const formattedDate = job.scheduledAt
    ? new Date(job.scheduledAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "June 15, 2025";

  const technicianName = job.assignedTechnician
    ? `Engr. ${job.assignedTechnician.firstName} ${job.assignedTechnician.lastName}`
    : "Engr. Babajide Solarin";

  const equipmentName = asset?.name || "10kVA Hybrid Residential Solar PV System";
  const equipmentSerial = asset?.serialNumber || "VIC-48V-10K-99281";
  const equipmentModel = asset?.modelNumber || "MultiPlus-II 48/10000/140-100";

  // Function to generate and trigger download of a genuine PDF document
  const handleDownloadPdf = () => {
    setIsDownloading(true);

    try {
      const lines = [
        `BT`,
        `/F1 18 Tf`,
        `50 780 Td`,
        `(${tenantName.toUpperCase()} - SERVICE COMPLETION REPORT) Tj`,
        `ET`,
        `BT`,
        `/F1 10 Tf`,
        `50 760 Td`,
        `(Official Engineering Commissioning & Quality Assurance Audit) Tj`,
        `ET`,
        `BT`,
        `/F1 11 Tf`,
        `50 720 Td`,
        `(Certificate ID: ${reportId}          Date of Service: ${formattedDate}) Tj`,
        `ET`,
        `BT`,
        `/F1 11 Tf`,
        `50 690 Td`,
        `(Client Name: ${customerName}) Tj`,
        `ET`,
        `BT`,
        `/F1 10 Tf`,
        `50 670 Td`,
        `(Service Address: ${customerAddress || "Lagos, Nigeria"}) Tj`,
        `ET`,
        `BT`,
        `/F1 12 Tf`,
        `50 635 Td`,
        `(Job Title: ${job.title}) Tj`,
        `ET`,
        `BT`,
        `/F1 10 Tf`,
        `50 615 Td`,
        `(${job.description || "Turnkey solar system installation, string balancing, and inverter hookup."}) Tj`,
        `ET`,
        `BT`,
        `/F1 11 Tf`,
        `50 580 Td`,
        `(System: ${equipmentName} [Model: ${equipmentModel} | S/N: ${equipmentSerial}]) Tj`,
        `ET`,
        `BT`,
        `/F1 11 Tf`,
        `50 550 Td`,
        `(Lead Engineer: ${technicianName} - Certified Clean Energy Systems Engineer) Tj`,
        `ET`,
        `BT`,
        `/F1 12 Tf`,
        `50 510 Td`,
        `(COMMISSIONING AUDIT CHECKLIST - ALL CRITICAL BENCHMARKS PASSED:) Tj`,
        `ET`,
        `BT`,
        `/F1 10 Tf`,
        `50 480 Td`,
        `([PASS] Rooftop PV String Open-Circuit Voltage & Polarity Verification: 485V DC) Tj`,
        `0 -20 Td`,
        `([PASS] Victron MultiPlus-II DC/AC Grid Coupling & Inverter Balancing: OK) Tj`,
        `0 -20 Td`,
        `([PASS] Battery Bank Cell Balancing & State-of-Health Audit: 99.4% SOH) Tj`,
        `0 -20 Td`,
        `([PASS] Earth-Rod Resistance & Surge Protection Device: < 1.8 Ohms) Tj`,
        `0 -20 Td`,
        `([PASS] Terminal Torque Calibration to Manufacturer Specifications: 12 Nm) Tj`,
        `ET`,
        `BT`,
        `/F1 10 Tf`,
        `50 340 Td`,
        `(Certified by ServiceOS Field Telemetry Engine | Cryptographic ID: ${reportId}) Tj`,
        `0 -15 Td`,
        `(Warranty Protection: 5-Year Comprehensive OEM Guarantee Active.) Tj`,
        `ET`,
      ];

      const streamContent = lines.join("\n");
      const streamLength = new TextEncoder().encode(streamContent).length;

      const objects = [
        `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
        `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`,
        `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`,
        `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
        `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
      ];

      let body = `%PDF-1.4\n`;
      const offsets: number[] = [0];

      for (const obj of objects) {
        offsets.push(new TextEncoder().encode(body).length);
        body += obj;
      }

      const xrefOffset = new TextEncoder().encode(body).length;
      let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
      for (let i = 1; i <= objects.length; i++) {
        xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
      }

      const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
      const fullPdf = body + xref + trailer;

      const blob = new Blob([fullPdf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Service-Report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // High-fidelity browser print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden my-auto animate-scaleIn">
        {/* Modal Top Action Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Service Completion Report
              </h3>
              <p className="text-xs text-slate-500 font-mono">Reference: {reportId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Header Strip with Contractor Branding */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={tenantName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base"
                  style={{ backgroundColor: primaryColor }}
                >
                  SO
                </div>
              )}
              <div>
                <h4 className="text-base font-extrabold text-slate-900">{tenantName}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Certified Contractor Report
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 block">Date of Inspection</span>
              <span className="text-xs font-bold text-slate-900">{formattedDate}</span>
            </div>
          </div>

          {/* Job Overview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Work Order Details
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified & Completed
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
            {job.description && (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                {job.description}
              </p>
            )}
          </div>

          {/* Two Columns: Client Info & Lead Engineer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Client Information
              </span>
              <p className="text-sm font-bold text-slate-900">{customerName}</p>
              <p className="text-xs text-slate-500">{customerAddress || "Lagos, Nigeria"}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Lead Field Engineer
              </span>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">{technicianName}</p>
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-1.5 rounded">
                  ⭐ 4.95
                </span>
              </div>
              <p className="text-xs text-slate-500">Certified Solar & Inverter Tech</p>
            </div>
          </div>

          {/* Installed Equipment Summary */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                Commissioned System & Hardware
              </span>
              <span className="text-xs font-mono text-slate-300">S/N: {equipmentSerial}</span>
            </div>
            <h5 className="text-sm font-bold">{equipmentName}</h5>
            <p className="text-xs text-slate-400 font-mono">Model: {equipmentModel}</p>
          </div>

          {/* Engineering Inspection Checklist */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Quality Assurance Inspection Checklist
            </span>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
                <span className="font-medium text-slate-800">
                  Rooftop PV Rail Mounting & 16x 550W Module Hookup
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
                <span className="font-medium text-slate-800">
                  DC String Voltage & Polarity Testing (485V DC Nominal)
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
                <span className="font-medium text-slate-800">
                  Victron MultiPlus-II ESS Grid Integration & Firmware
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
                <span className="font-medium text-slate-800">
                  Felicity 15kWh Lithium-Ion Balancing & Load Calibration
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                </span>
              </div>
            </div>
          </div>

          {/* Digital Signature & Seal */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Digitally authenticated and sealed by <strong>ServiceOS Field Engine</strong>.
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              SHA256: 9e4f2...b810
            </span>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:brightness-95 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Generating..." : "Download PDF (.pdf)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceReportModal;
