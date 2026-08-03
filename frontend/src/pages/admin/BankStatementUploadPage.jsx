import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShieldCheck,
  UploadCloud,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Landmark,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import { uploadBankStatement, getBankStatementHistory } from "../../services/bankStatementService";

const TOAST_DURATION_MS = 4000;

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Toast({ message, isError }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-6 top-6 z-[70] flex items-center gap-2 rounded-2xl border border-white/10 bg-brand-dark/95 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur"
    >
      {isError ? (
        <AlertTriangle size={16} className="text-red-400" aria-hidden="true" />
      ) : (
        <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
      )}
      {message}
    </div>
  );
}

function SectionHeader({ icon: Icon, iconBg, iconText, title, subtitle }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconText}`}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-brand-dark">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

/** Green if every parsed transaction from this file matched a donation, amber otherwise. */
function StatusPill({ total, matched }) {
  if (total === 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
        No transactions
      </span>
    );
  }
  const fullyMatched = matched === total;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        fullyMatched ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {matched} of {total} matched
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Upload section                                                      */
/* ------------------------------------------------------------------ */

function UploadSection({ onUploaded, showToast }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Choose a bank statement file first.");
      return;
    }

    setIsUploading(true);
    setError("");
    try {
      const response = await uploadBankStatement(selectedFile);
      const summary = response.data?.data;
      showToast(
        `Statement processed — ${summary?.importedCount ?? 0} imported, ${summary?.duplicateCount ?? 0} duplicate, ${summary?.failedCount ?? 0} failed.`
      );
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploaded();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload bank statement.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={Landmark}
        iconBg="bg-brand-orange/10"
        iconText="text-brand-orange"
        title="Upload Bank Statement"
        subtitle="Parses transactions and reconciles them against donations automatically."
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle size={15} aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 px-4 py-3 text-sm text-gray-500 transition hover:border-brand-orange hover:bg-orange-50/40">
          <FileSpreadsheet size={18} className="shrink-0 text-gray-400" aria-hidden="true" />
          <span className="truncate">{selectedFile ? selectedFile.name : "Choose a file..."}</span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>

        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <UploadCloud size={15} aria-hidden="true" />
          )}
          Upload the Bank Statement
        </button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* History table                                                       */
/* ------------------------------------------------------------------ */

function HistorySection({ uploads, isLoading, fetchError, onRetry }) {
  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={FileSpreadsheet}
        iconBg="bg-blue-50"
        iconText="text-blue-600"
        title="Upload History"
        subtitle={`${uploads.length} statement${uploads.length === 1 ? "" : "s"} uploaded so far.`}
      />

      {fetchError ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertTriangle className="text-red-400" size={26} aria-hidden="true" />
          <p className="font-medium text-gray-600">{fetchError}</p>
          <button
            onClick={onRetry}
            className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          Loading...
        </div>
      ) : uploads.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No bank statements uploaded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="pb-2 pr-4 font-medium">File Name</th>
                <th className="pb-2 pr-4 font-medium">Uploaded By</th>
                <th className="pb-2 pr-4 font-medium">Uploaded At</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload, index) => (
                <tr key={`${upload.fileName}-${index}`} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-2 font-medium text-brand-dark">
                      <FileSpreadsheet size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
                      <span className="truncate">{upload.fileName || "—"}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{upload.uploadedByName}</td>
                  <td className="py-3 pr-4 text-gray-400">{formatDateTime(upload.uploadedAt)}</td>
                  <td className="py-3">
                    <StatusPill total={upload.totalTransactions} matched={upload.matchedTransactions} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function BankStatementUploadPage() {
  const [uploads, setUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [toast, setToast] = useState({ message: "", isError: false });
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast({ message: "", isError: false }), TOAST_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    []
  );

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const response = await getBankStatementHistory();
      setUploads(response.data?.data?.uploads ?? []);
    } catch (err) {
      setFetchError(err?.response?.data?.message || "Failed to load upload history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Toast message={toast.message} isError={toast.isError} />

      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange">
          <ShieldCheck size={14} aria-hidden="true" />
          Super Admin
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">Bank Statements</h1>
        <p className="mt-2 text-gray-500">Upload bank statements to auto-reconcile transactions against donations.</p>
      </div>

      <UploadSection onUploaded={loadHistory} showToast={showToast} />

      <HistorySection uploads={uploads} isLoading={isLoading} fetchError={fetchError} onRetry={loadHistory} />
    </div>
  );
}