"use client";

import React, { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import apiClient from "@/lib/api/client";
import { DuplicateRule } from "@/lib/types";
import { Button, Dialog, Badge, Switch } from "@/components/ui";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Download,
  Trash2,
  Sparkles,
  Users,
  Copy,
  Check,
  Send,
  ShieldAlert,
  Layers,
  ChevronRight,
  Database,
  RefreshCw,
} from "lucide-react";

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

type Step = "UPLOAD" | "MAPPING" | "PREVIEW" | "ACTIVATE";

interface PreviewData {
  metrics: {
    totalProcessed: number;
    validCount: number;
    duplicateCount: number;
    invalidCount: number;
  };
  valid: any[];
  duplicates: Array<{
    imported: any;
    existing: any;
    _reason: string;
  }>;
  invalid: any[];
}

export function ImportWizardModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  // Preview & Deduplication State
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [duplicateRule, setDuplicateRule] = useState<DuplicateRule>(DuplicateRule.SKIP);
  const [activationChoice, setActivationChoice] = useState<"ALL" | "PHONE_ONLY" | "NONE">("ALL");

  // Background Job Queue State
  const [useBackgroundQueue, setUseBackgroundQueue] = useState<boolean>(true);
  const [backgroundJobId, setBackgroundJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [jobStatusText, setJobStatusText] = useState<string>("");

  // Loading & Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
    invalid: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // System Target Fields for Mapping
  const SYSTEM_FIELDS = [
    { key: "name", label: "Full Name / Business Name", required: true },
    { key: "phone", label: "Mobile / Phone Number", required: false },
    { key: "email", label: "Email Address", required: false },
    { key: "address", label: "Installation Street Address", required: false },
    { key: "city", label: "City / State", required: false },
  ];

  // Reset state on close
  const handleModalClose = () => {
    setCurrentStep("UPLOAD");
    setFile(null);
    setParsedRows([]);
    setHeaders([]);
    setColumnMapping({});
    setPreviewData(null);
    setDuplicateRule(DuplicateRule.SKIP);
    setActivationChoice("ALL");
    setUseBackgroundQueue(true);
    setBackgroundJobId(null);
    setJobProgress(0);
    setJobStatusText("");
    setErrorMessage(null);
    setExecutionResult(null);
    onClose();
  };

  // Canonical backend-supported customer sample template records
  const SAMPLE_CUSTOMER_RECORDS = [
    {
      "Customer Name": "Chief Adeleke Solarin",
      "Phone Number": "08031234567",
      "Email Address": "adeleke@sunshinesolar.ng",
      "Installation Address": "Plot 14 Admiralty Way Lekki Phase 1",
      "City": "Lagos",
    },
    {
      "Customer Name": "Dr. Ngozi Okonjo",
      "Phone Number": "08029876543",
      "Email Address": "ngozi.okonjo@horizonenergy.org",
      "Installation Address": "12 Maitama Crescent",
      "City": "Abuja",
    },
    {
      "Customer Name": "Green Valley Estate Facility Office",
      "Phone Number": "08105556677",
      "Email Address": "operations@greenvalley.ng",
      "Installation Address": "Km 42 Lekki-Epe Expressway",
      "City": "Lagos",
    },
    {
      "Customer Name": "Kano Renewable Cold Storage Ltd",
      "Phone Number": "08098765432",
      "Email Address": "procurement@kanocold.com",
      "Installation Address": "8 Bompai Industrial Area",
      "City": "Kano",
    },
    {
      "Customer Name": "Babatunde Fashola Homes",
      "Phone Number": "08123456789",
      "Email Address": "babatunde@fasholahomes.ng",
      "Installation Address": "25 Isaac John Street GRA Ikeja",
      "City": "Lagos",
    },
  ];

  // Download Sample Template in either Excel (.xlsx) or CSV format
  const handleDownloadTemplate = (format: "xlsx" | "csv" = "xlsx") => {
    if (format === "xlsx") {
      const worksheet = XLSX.utils.json_to_sheet(SAMPLE_CUSTOMER_RECORDS);
      // Auto-set clean column widths for Excel spreadsheet
      worksheet["!cols"] = [
        { wch: 36 }, // Customer Name
        { wch: 20 }, // Phone Number
        { wch: 36 }, // Email Address
        { wch: 42 }, // Installation Address
        { wch: 18 }, // City
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
      XLSX.writeFile(workbook, "serviceos_customer_import_template.xlsx");
    } else {
      const headers = Object.keys(SAMPLE_CUSTOMER_RECORDS[0]);
      const csvRows = [
        headers.join(","),
        ...SAMPLE_CUSTOMER_RECORDS.map((row) =>
          headers
            .map((h) => `"${String(row[h as keyof typeof row] || "").replace(/"/g, '""')}"`)
            .join(",")
        ),
      ];
      const blob = new Blob([csvRows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "serviceos_customer_import_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 1. Handle File Upload and Parse
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    await processFile(droppedFile);
  };

  const processFile = async (rawFile: File) => {
    setFile(rawFile);
    setErrorMessage(null);
    setIsProcessing(true);
    setProgressPct(30);

    try {
      const data = await rawFile.arrayBuffer();
      setProgressPct(60);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: "",
        raw: false,
      });

      if (jsonRows.length === 0) {
        throw new Error("The uploaded file does not contain any data rows.");
      }

      const extractedHeaders = Object.keys(jsonRows[0] || {});
      setHeaders(extractedHeaders);
      setParsedRows(jsonRows);
      setProgressPct(80);

      // Call Backend to analyze and suggest column mapping
      try {
        const analyzeRes = await apiClient.post("/import/analyze", {
          rows: jsonRows.slice(0, 10), // Send first 10 for analysis
        });

        if (analyzeRes.data?.suggestedMapping) {
          setColumnMapping(analyzeRes.data.suggestedMapping);
        } else {
          autoGuessMapping(extractedHeaders);
        }
      } catch (backendErr) {
        console.warn("Backend analyze fallback to local fuzzy matching:", backendErr);
        autoGuessMapping(extractedHeaders);
      }

      setProgressPct(100);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep("MAPPING");
      }, 300);
    } catch (err: any) {
      console.error("File parse error:", err);
      setErrorMessage(err.message || "Failed to read Excel/CSV file");
      setIsProcessing(false);
    }
  };

  const autoGuessMapping = (fileHeaders: string[]) => {
    const initialMapping: Record<string, string> = {};
    for (const header of fileHeaders) {
      const lower = header.toLowerCase().trim();
      // Explicit priority safeguards to prevent substring collisions (e.g., 'email address' vs 'address')
      if (lower.includes("email") || lower.includes("e-mail") || lower === "mail") {
        initialMapping[header] = "email";
      } else if (lower.includes("phone") || lower.includes("mobile") || lower.includes("tel") || lower.includes("contact no")) {
        initialMapping[header] = "phone";
      } else if (lower.includes("name") || lower.includes("client") || lower.includes("customer") || lower.includes("business")) {
        initialMapping[header] = "name";
      } else if (lower.includes("address") || lower.includes("street") || lower.includes("location") || lower.includes("site")) {
        initialMapping[header] = "address";
      } else if (lower.includes("city") || lower.includes("state") || lower.includes("town") || lower.includes("region") || lower.includes("lga")) {
        initialMapping[header] = "city";
      }
    }
    setColumnMapping(initialMapping);
  };

  // 2. Validate Mapping & Request Backend Preview
  const handleProceedToPreview = async () => {
    const hasNameMapped = Object.values(columnMapping).includes("name");
    if (!hasNameMapped) {
      setErrorMessage("You must map at least one column to 'Full Name'");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const previewRes = await apiClient.post("/import/preview", {
        rows: parsedRows,
        mapping: columnMapping,
      });

      setPreviewData(previewRes.data);
      setCurrentStep("PREVIEW");
    } catch (err: any) {
      console.error("Preview error:", err);
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to generate import preview"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Final Execution (Supports Background Queue Worker & Direct Execution)
  const handleExecuteImport = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    // If background queue mode selected or file has > 50 rows
    if (useBackgroundQueue || parsedRows.length > 50) {
      try {
        setJobStatusText("Submitting customer records to Redis Bull queue worker...");
        setJobProgress(5);
        const queueRes = await apiClient.post("/import/queue", {
          rows: parsedRows,
          mapping: columnMapping,
          duplicateRule,
          activationChoice,
        });

        const jobId = queueRes.data.jobId;
        setBackgroundJobId(jobId);
        setJobStatusText("Job queued in Redis. Worker starting batch execution...");

        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await apiClient.get(`/import/status/${jobId}`);
            const { state, progress, result, failedReason } = statusRes.data;
            setJobProgress(progress || 0);

            if (state === "active") {
              setJobStatusText(`Worker processing customer batches... (${progress || 0}%)`);
            } else if (state === "completed") {
              clearInterval(pollInterval);
              setExecutionResult({
                created: result?.created ?? 0,
                updated: result?.updated ?? 0,
                skipped: result?.skipped ?? 0,
                invalid: result?.invalid ?? 0,
              });
              setIsProcessing(false);
              onImportComplete();
            } else if (state === "failed") {
              clearInterval(pollInterval);
              setIsProcessing(false);
              setErrorMessage(failedReason || "Background job failed");
            }
          } catch (pollErr) {
            console.warn("Poll status retry:", pollErr);
          }
        }, 1000);
        return;
      } catch (queueErr: any) {
        console.warn("Background queue unavailable, falling back to direct ingestion:", queueErr);
      }
    }

    try {
      const executeRes = await apiClient.post("/import/execute", {
        rows: parsedRows,
        mapping: columnMapping,
        duplicateRule,
      });

      const resData = executeRes.data;
      setExecutionResult({
        created: resData.created ?? 0,
        updated: resData.updated ?? 0,
        skipped: resData.skipped ?? 0,
        invalid: resData.invalid ?? 0,
      });

      onImportComplete();
    } catch (err: any) {
      console.error("Execute import error:", err);
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to complete customer import"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Intelligent Customer Import Wizard"
      description="Batch onboard solar and commercial client records with deduplication."
      maxWidth="2xl"
    >
      <div className="mt-4">
        {/* Stepper Progress Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {[
              { id: "UPLOAD", label: "1. Upload File" },
              { id: "MAPPING", label: "2. Column Mapping" },
              { id: "PREVIEW", label: "3. Deduplication" },
              { id: "ACTIVATE", label: "4. Activation" },
            ].map((step, idx) => {
              const isCurrent = currentStep === step.id;
              const isPast =
                (step.id === "UPLOAD" && currentStep !== "UPLOAD") ||
                (step.id === "MAPPING" && (currentStep === "PREVIEW" || currentStep === "ACTIVATE")) ||
                (step.id === "PREVIEW" && currentStep === "ACTIVATE");

              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-[#006937] text-white shadow-xs"
                        : isPast
                        ? "bg-emerald-50 text-[#006937] border border-emerald-200"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3 text-[#006937]" /> : null}
                    <span>{step.label}</span>
                  </div>
                  {idx < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">Sample:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownloadTemplate("xlsx")}
              className="text-[11px] font-semibold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100 hover:text-emerald-950 border-emerald-300/80 gap-1 h-7 px-2.5 shadow-2xs"
              title="Download official Excel (.xlsx) customer template"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              Excel (.xlsx)
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadTemplate("csv")}
              className="text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1 h-7 px-2"
              title="Download official CSV (.csv) customer template"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              CSV (.csv)
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

            {/* STEP 1: UPLOAD */}
        {currentStep === "UPLOAD" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#006937] hover:bg-emerald-50/20 rounded-2xl p-9 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 group-hover:bg-emerald-100/80 text-[#006937] flex items-center justify-center transition-colors shadow-xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Click to upload or drag & drop customer spreadsheet
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports Excel (.xlsx, .xls) and Comma-Separated Values (.csv) up to 10MB
                </p>
              </div>
            </div>

            {/* Official Supported Template Download Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/50 via-slate-50 to-slate-50 border border-emerald-100/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#006937] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        Official ServiceOS Customer Import Template
                      </h4>
                      <Badge variant="success" className="text-[10px] py-0 px-1.5 bg-emerald-100 text-[#006937] border-emerald-200 font-semibold">
                        Backend Ready
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Download the official template pre-formatted with all 5 backend-supported fields. Edit it with your customer records and re-upload above.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate("xlsx")}
                    className="text-xs font-semibold border-emerald-600/40 text-emerald-900 bg-white hover:bg-emerald-100/70 h-8 gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    Download Excel (.xlsx)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate("csv")}
                    className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 h-8 gap-1.5 bg-white"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    CSV (.csv)
                  </Button>
                </div>
              </div>

              {/* Supported Columns Guide */}
              <div className="pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="font-semibold text-slate-600 mr-1">Supported Columns:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-[10px] shadow-2xs">
                  <span className="font-semibold">Customer Name</span>
                  <span className="text-[9px] font-sans text-emerald-700 bg-emerald-50 px-1 rounded font-medium">Required</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-[10px] shadow-2xs">
                  <span className="font-semibold">Phone Number</span>
                  <span className="text-[9px] font-sans text-amber-700 bg-amber-50 px-1 rounded font-medium">Phone or Email</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-[10px] shadow-2xs">
                  <span className="font-semibold">Email Address</span>
                  <span className="text-[9px] font-sans text-amber-700 bg-amber-50 px-1 rounded font-medium">Phone or Email</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px] shadow-2xs">
                  <span>Installation Address</span>
                  <span className="text-[9px] font-sans text-slate-400 bg-slate-50 px-1 rounded">Optional</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px] shadow-2xs">
                  <span>City</span>
                  <span className="text-[9px] font-sans text-slate-400 bg-slate-50 px-1 rounded">Optional</span>
                </span>
              </div>
            </div>

            {isProcessing && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Reading and analyzing customer records...</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-[#006937] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {currentStep === "MAPPING" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-semibold text-slate-800 truncate max-w-xs">
                  {file?.name}
                </span>
                <Badge variant="neutral" className="text-[10px]">
                  {parsedRows.length} Rows Detected
                </Badge>
              </div>
              <span className="text-xs text-slate-500">
                Map each file header to ServiceOS Customer attributes
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              <div className="grid grid-cols-12 bg-slate-50/80 p-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-5">File Column Header</div>
                <div className="col-span-4">ServiceOS Target Field</div>
                <div className="col-span-3 text-right">Sample Value (Row 1)</div>
              </div>

              {headers.map((hdr) => {
                const mappedField = columnMapping[hdr] || "";
                const sampleValue = parsedRows[0]?.[hdr] || "—";

                return (
                  <div
                    key={hdr}
                    className="grid grid-cols-12 items-center p-2.5 text-xs hover:bg-slate-50/50"
                  >
                    <div className="col-span-5 font-semibold text-slate-800 truncate pr-2">
                      {hdr}
                    </div>
                    <div className="col-span-4 pr-2">
                      <select
                        value={mappedField}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, [hdr]: e.target.value })
                        }
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#006937]"
                      >
                        <option value="">— Do Not Import (Ignore) —</option>
                        {SYSTEM_FIELDS.map((field) => (
                          <option key={field.key} value={field.key}>
                            {field.label} {field.required ? "(Required)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3 text-right text-slate-400 font-mono text-[11px] truncate">
                      {String(sampleValue)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep("UPLOAD")}
                disabled={isProcessing}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Upload
              </Button>
              <Button
                type="button"
                onClick={handleProceedToPreview}
                isLoading={isProcessing}
                className="bg-[#006937] hover:bg-[#004D28] text-white"
              >
                Validate & Preview
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW & DEDUPLICATION RESOLVER */}
        {currentStep === "PREVIEW" && previewData && (
          <div className="space-y-4">
            {/* KPI Metrics */}
            <div className="grid grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Rows</span>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {previewData.metrics.totalProcessed}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Valid Records</span>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">
                  {previewData.metrics.validCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Duplicates</span>
                <p className="text-xl font-bold text-amber-700 mt-0.5">
                  {previewData.metrics.duplicateCount}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] font-bold text-rose-800 uppercase">Invalid Rows</span>
                <p className="text-xl font-bold text-rose-700 mt-0.5">
                  {previewData.metrics.invalidCount}
                </p>
              </div>
            </div>

            {/* Duplicate Resolver Choice */}
            {previewData.metrics.duplicateCount > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-900">
                    Duplicate Resolution Strategy (Section 12 Deduplication)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDuplicateRule(DuplicateRule.SKIP)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      duplicateRule === DuplicateRule.SKIP
                        ? "bg-white border-[#006937] ring-2 ring-[#006937]/20 shadow-xs"
                        : "bg-white/60 border-amber-200/80 hover:bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-800">[Use Existing]</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Skip duplicate rows and preserve existing customer data.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateRule(DuplicateRule.UPDATE)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      duplicateRule === DuplicateRule.UPDATE
                        ? "bg-white border-[#006937] ring-2 ring-[#006937]/20 shadow-xs"
                        : "bg-white/60 border-amber-200/80 hover:bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-800">[Update Existing]</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Update matching client phone/email with imported rows.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateRule(DuplicateRule.CREATE_NEW)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      duplicateRule === DuplicateRule.CREATE_NEW
                        ? "bg-white border-[#006937] ring-2 ring-[#006937]/20 shadow-xs"
                        : "bg-white/60 border-amber-200/80 hover:bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-800">[Create New]</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Force create new duplicate record alongside existing.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Duplicate Side-by-side inspection sample */}
            {previewData.duplicates.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-amber-200/80 rounded-xl bg-white p-3 space-y-2 text-xs">
                <span className="font-semibold text-slate-700 block">
                  Sample Matched Duplicates ({previewData.duplicates.length} total):
                </span>
                {previewData.duplicates.slice(0, 3).map((dup, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-amber-50/50 border border-amber-100 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{dup.imported.name}</span>
                      <span className="text-slate-500 ml-2">Phone: {dup.imported.phone || "—"}</span>
                    </div>
                    <Badge variant="warning" className="text-[10px] bg-white text-amber-700">
                      Matches: {dup.existing.name}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep("MAPPING")}
                disabled={isProcessing}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Mapping
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep("ACTIVATE")}
                className="bg-[#006937] hover:bg-[#004D28] text-white"
              >
                Next: Activation Choices
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: ACTIVATION & EXECUTION */}
        {currentStep === "ACTIVATE" && (
          <div className="space-y-4">
            {!executionResult ? (
              <>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Customer Portal Activation Decision (Section 13)
                  </label>
                  <p className="text-xs text-slate-500">
                    Choose whether newly imported clients should immediately receive portal
                    invitation tokens.
                  </p>

                  <div className="space-y-2">
                    <label
                      onClick={() => setActivationChoice("ALL")}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        activationChoice === "ALL"
                          ? "bg-emerald-50/60 border-[#006937] ring-2 ring-[#006937]/15"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={activationChoice === "ALL"}
                        onChange={() => setActivationChoice("ALL")}
                        className="mt-0.5 text-[#006937]"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Invite all valid customers now (Recommended)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Generates 24-hour single-use portal tokens so customers can track assets
                          and quotes immediately.
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setActivationChoice("PHONE_ONLY")}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        activationChoice === "PHONE_ONLY"
                          ? "bg-emerald-50/60 border-[#006937] ring-2 ring-[#006937]/15"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={activationChoice === "PHONE_ONLY"}
                        onChange={() => setActivationChoice("PHONE_ONLY")}
                        className="mt-0.5 text-[#006937]"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Invite phone-verified customers only
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Dispatches invites only to accounts possessing a verified Nigerian /
                          international phone number.
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setActivationChoice("NONE")}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        activationChoice === "NONE"
                          ? "bg-emerald-50/60 border-[#006937] ring-2 ring-[#006937]/15"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={activationChoice === "NONE"}
                        onChange={() => setActivationChoice("NONE")}
                        className="mt-0.5 text-[#006937]"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Do not invite yet (CRM Record Creation Only)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Stores customer records in the database with status set to
                          NOT_ACTIVATED. Staff can invite individually later.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Background Queue Switch */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 text-[#006937]">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800">
                          Background Job Queue (Redis BullMQ)
                        </p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Recommended for Large Files
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Offloads import to a background worker in chunks of 250 records to prevent browser timeout.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={useBackgroundQueue}
                    onCheckedChange={(checked) => setUseBackgroundQueue(checked)}
                  />
                </div>

                {/* Progress bar during background processing */}
                {isProcessing && backgroundJobId && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-[#006937] animate-spin" />
                        <span>{jobStatusText}</span>
                      </div>
                      <span>{jobProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#006937] to-[#10B981] transition-all duration-300"
                        style={{ width: `${jobProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">Job ID: #{backgroundJobId}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("PREVIEW")}
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Back to Preview
                  </Button>
                  <Button
                    type="button"
                    onClick={handleExecuteImport}
                    isLoading={isProcessing}
                    className="bg-[#006937] hover:bg-[#004D28] text-white"
                  >
                    <Database className="w-3.5 h-3.5 mr-1.5" />
                    {useBackgroundQueue ? "Enqueue Background Import" : "Execute Direct Import"} (
                    {previewData?.valid.length || 0} Records)
                  </Button>
                </div>
              </>
            ) : (
              /* Success Screen */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#006937] flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Customer Import Completed Successfully
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your customer directory has been updated and synchronized.
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto text-center">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xl font-bold text-emerald-700">
                      {executionResult.created}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-800">Created</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xl font-bold text-slate-700">
                      {executionResult.updated}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-600">Updated</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xl font-bold text-amber-700">
                      {executionResult.skipped}
                    </p>
                    <span className="text-[10px] font-semibold text-amber-800">Skipped</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                    <p className="text-xl font-bold text-rose-700">
                      {executionResult.invalid}
                    </p>
                    <span className="text-[10px] font-semibold text-rose-800">Invalid</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center">
                  <Button
                    type="button"
                    onClick={handleModalClose}
                    className="bg-[#006937] hover:bg-[#004D28] text-white px-8"
                  >
                    View Customer Directory
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}
