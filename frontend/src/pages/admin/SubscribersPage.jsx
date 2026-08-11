import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShieldCheck,
  UploadCloud,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  Search,
  X,
  Mail,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import { previewSubscriberImport, commitSubscriberImport, getSubscribers } from "../../services/subscriberService";

const TOAST_DURATION_MS = 4000;
const SEARCH_DEBOUNCE_MS = 350;

// Status values returned by POST /super-admin/subscribers/import/preview.
const STATUS_META = {
  READY: { label: "Ready", badgeClass: "bg-emerald-50 text-emerald-700" },
  INVALID: { label: "Invalid", badgeClass: "bg-red-50 text-red-600" },
  DUPLICATE_IN_FILE: { label: "Duplicate in file", badgeClass: "bg-amber-50 text-amber-700" },
  ALREADY_SUBSCRIBED: { label: "Already subscribed", badgeClass: "bg-gray-100 text-gray-500" },
};

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

/* ------------------------------------------------------------------ */
/* Upload section                                                      */
/* ------------------------------------------------------------------ */

function UploadSection({ onPreview, showToast }) {
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
      setError("Choose a subscriber sheet first.");
      return;
    }

    setIsUploading(true);
    setError("");
    try {
      const response = await previewSubscriberImport(selectedFile);
      onPreview(response.data?.data);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to process the subscriber sheet.";
      setError(message);
      showToast(message, true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={Users}
        iconBg="bg-brand-orange/10"
        iconText="text-brand-orange"
        title="Import Subscribers"
        subtitle="Upload an Excel sheet (donorName, donorEmail columns) to add new subscribers in bulk."
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
          <span className="truncate">{selectedFile ? selectedFile.name : "Choose a .xlsx file..."}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
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
          Upload &amp; Preview
        </button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Preview popup — shown after upload, before anything is stored       */
/* ------------------------------------------------------------------ */

function PreviewModal({ preview, onClose, onConfirmed, showToast }) {
  const [isSaving, setIsSaving] = useState(false);
  // Removed rows are tracked by rowNumber so the admin can drop rows
  // (typically READY ones they don't want) before committing.
  const [removedRowNumbers, setRemovedRowNumbers] = useState(() => new Set());

  const allRows = preview?.rows ?? [];
  const summary = preview?.summary;

  const handleRemove = (rowNumber) => {
    setRemovedRowNumbers((prev) => {
      const next = new Set(prev);
      next.add(rowNumber);
      return next;
    });
  };

  const remainingReadyRows = allRows.filter(
    (row) => row.status === "READY" && !removedRowNumbers.has(row.rowNumber)
  );

  const handleConfirm = async () => {
    if (remainingReadyRows.length === 0) return;
    setIsSaving(true);
    try {
      const response = await commitSubscriberImport(
        remainingReadyRows.map((row) => ({
          rowNumber: row.rowNumber,
          donorName: row.donorName,
          donorEmail: row.donorEmail,
        }))
      );
      const result = response.data?.data;
      showToast(
        `Imported ${result?.importedCount ?? 0} subscriber${result?.importedCount === 1 ? "" : "s"}` +
          `${result?.duplicateCount ? `, ${result.duplicateCount} already existed` : ""}` +
          `${result?.invalidCount ? `, ${result.invalidCount} invalid` : ""}` +
          `${result?.failedCount ? `, ${result.failedCount} failed` : ""}.`
      );
      onConfirmed();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to import subscribers.", true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-brand-dark">Review before importing</h3>
            <p className="text-sm text-gray-400">
              {summary?.totalRows ?? allRows.length} row{(summary?.totalRows ?? allRows.length) === 1 ? "" : "s"} found,{" "}
              {remainingReadyRows.length} ready to import.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-brand-dark"
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {allRows.length > 0 ? (
            <PreviewTable rows={allRows} removedRowNumbers={removedRowNumbers} onRemove={handleRemove} />
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">No rows found in the uploaded sheet.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving || remainingReadyRows.length === 0}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={15} aria-hidden="true" />}
            Import {remainingReadyRows.length || ""} Subscriber{remainingReadyRows.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Non-editable preview table: name, email, status/reason, and a Remove
// button per row (removed rows are struck through and excluded from commit).
function PreviewTable({ rows, removedRowNumbers, onRemove }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase tracking-wide text-gray-400">
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Email</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium text-right">Remove</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isRemoved = removedRowNumbers.has(row.rowNumber);
            const meta = STATUS_META[row.status] ?? { label: row.status, badgeClass: "bg-gray-100 text-gray-500" };
            return (
              <tr
                key={row.rowNumber}
                className={`border-b border-gray-50 last:border-0 ${isRemoved ? "opacity-40" : ""}`}
              >
                <td className={`px-4 py-2.5 text-brand-dark ${isRemoved ? "line-through" : ""}`}>
                  {row.donorName || "—"}
                </td>
                <td className={`px-4 py-2.5 text-gray-500 ${isRemoved ? "line-through" : ""}`}>
                  {row.donorEmail || "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${meta.badgeClass}`}>
                    {meta.label}
                  </span>
                  {row.reason && <p className="mt-1 text-xs text-gray-400">{row.reason}</p>}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(row.rowNumber)}
                    disabled={isRemoved}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Remove row ${row.rowNumber}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subscribers table with search                                       */
/* ------------------------------------------------------------------ */

function SubscribersTable({ subscribers, isLoading, fetchError, onRetry, search, onSearchChange, pagination, onPageChange }) {
  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SectionHeader
          icon={Mail}
          iconBg="bg-blue-50"
          iconText="text-blue-600"
          title="Subscribers"
          subtitle={`${pagination?.totalSubscribers ?? subscribers.length} subscriber${(pagination?.totalSubscribers ?? subscribers.length) === 1 ? "" : "s"} in total.`}
        />

        <div className="relative w-full sm:w-64">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm text-brand-dark outline-none transition focus:border-brand-orange"
          />
        </div>
      </div>

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
      ) : subscribers.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          {search ? "No subscribers match your search." : "No subscribers yet."}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-brand-dark">{subscriber.donorName || "—"}</td>
                    <td className="py-3 pr-4 text-gray-500">{subscriber.donorEmail}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          subscriber.subscribed ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {subscriber.subscribed ? "Subscribed" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{formatDateTime(subscriber.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between text-sm text-gray-500">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [preview, setPreview] = useState(null);
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

  // Debounce search input so we're not firing a request on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadSubscribers = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const response = await getSubscribers({ page, limit: 20, search: debouncedSearch });
      setSubscribers(response.data?.data?.subscribers ?? []);
      setPagination(response.data?.data?.pagination ?? null);
    } catch (err) {
      setFetchError(err?.response?.data?.message || "Failed to load subscribers.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Toast message={toast.message} isError={toast.isError} />

      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange">
          <ShieldCheck size={14} aria-hidden="true" />
          Super Admin
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">Subscribers</h1>
        <p className="mt-2 text-gray-500">
          Bulk-import subscribers from an Excel sheet, or browse and search everyone already subscribed.
        </p>
      </div>

      <UploadSection onPreview={setPreview} showToast={showToast} />

      <SubscribersTable
        subscribers={subscribers}
        isLoading={isLoading}
        fetchError={fetchError}
        onRetry={loadSubscribers}
        search={search}
        onSearchChange={setSearch}
        pagination={pagination}
        onPageChange={setPage}
      />

      {preview && (
        <PreviewModal
          preview={preview}
          onClose={() => setPreview(null)}
          onConfirmed={() => {
            setPreview(null);
            loadSubscribers();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}