import React, { useState, useMemo, useCallback, useEffect, useRef, useId } from "react";
import {
  Search,
  History,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileText,
  UserCircle,
  Loader2,
  Download,
  Filter,
  RotateCcw,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import { fetchDonations } from "../../services/donationService";
import { fetchAdminCampaigns } from "../../services/campaignService";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Verified: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = ["All", "Pending", "Verified", "Rejected"];
const PAYMENT_MODE_OPTIONS = ["All", "UPI", "Bank Transfer", "Cash", "Cheque"];

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;
const EXPORT_LIMIT = 5000;

const AVATAR_PALETTE = [
  { bg: "bg-orange-100", text: "text-brand-orange" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-pink-100", text: "text-pink-600" },
  { bg: "bg-cyan-100", text: "text-cyan-600" },
];

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function formatINR(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

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

function getInitials(name) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const initials = parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return initials.toUpperCase();
}

function hashString(value) {
  let hash = 0;
  const str = String(value ?? "");
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getAvatarStyle(name) {
  return AVATAR_PALETTE[hashString(name) % AVATAR_PALETTE.length];
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(rows, filename) {
  const csvContent = rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Shared hooks (duplicated locally, matching existing project convention) */
/* ------------------------------------------------------------------ */

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return undefined;
    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) onOutside(event);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [active, onOutside, ref]);
}

function useEscapeKey(onEscape, active) {
  useEffect(() => {
    if (!active) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onEscape(event);
      }
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [active, onEscape]);
}

function useFocusTrap(containerRef, active) {
  const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  useEffect(() => {
    if (!active || !containerRef.current) return undefined;
    const container = containerRef.current;
    const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    (first || container).focus();

    function handleKeyDown(event) {
      if (event.key !== "Tab" || focusables.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef]);
}

function useRestoreFocus(active) {
  const previouslyFocused = useRef(null);
  useEffect(() => {
    if (active) {
      previouslyFocused.current = document.activeElement;
    } else if (previouslyFocused.current) {
      previouslyFocused.current.focus?.();
      previouslyFocused.current = null;
    }
  }, [active]);
}

/* ------------------------------------------------------------------ */
/* Presentational subcomponents                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

const DonationRow = React.memo(function DonationRow({ donation, index, onView }) {
  const avatarStyle = useMemo(() => getAvatarStyle(donation.donorName), [donation.donorName]);

  return (
    <tr className={`border-b border-gray-100 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"} hover:bg-orange-50/70`}>
      <td className="py-5 pl-2">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarStyle.bg} ${avatarStyle.text}`}
            aria-hidden="true"
          >
            {getInitials(donation.donorName)}
          </span>
          <div>
            <p className="font-medium text-brand-dark">{donation.donorName}</p>
            <p className="text-xs text-gray-400">{donation.donorEmail}</p>
          </div>
        </div>
      </td>
      <td className="text-gray-600">{donation.campaign?.campaignName ?? "—"}</td>
      <td className="font-semibold text-brand-dark">{formatINR(donation.amount)}</td>
      <td className="text-gray-500">{donation.transactionId}</td>
      <td className="text-gray-500">{donation.paymentMode}</td>
      <td className="text-gray-500">{formatDateTime(donation.createdAt)}</td>
      <td>
        <StatusBadge status={donation.status} />
      </td>
      <td>
        <button
          onClick={() => onView(donation)}
          className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition duration-150 hover:-translate-y-0.5 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          <Eye size={16} aria-hidden="true" />
          View
        </button>
      </td>
    </tr>
  );
});

function Pagination({ currentPage, totalPages, rangeStart, rangeEnd, totalRecords, onPageChange }) {
  const pages = useMemo(() => {
    // keep the pager compact even with many pages: show up to 7 page buttons around the current page
    const maxButtons = 7;
    if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(currentPage - 3, totalPages - maxButtons + 1));
    return Array.from({ length: maxButtons }, (_, i) => start + i);
  }, [totalPages, currentPage]);

  return (
    <nav aria-label="Donation history pagination" className="flex flex-col items-center gap-4 sm:flex-row">
      <p className="text-sm text-gray-500" aria-live="polite">
        Showing {rangeStart}–{rangeEnd} of {totalRecords} records
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Prev
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`h-9 w-9 rounded-xl text-sm font-medium transition ${
              page === currentPage ? "bg-brand-orange text-white shadow-md" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Modal shell + read-only detail panel                                */
/* ------------------------------------------------------------------ */

function ModalShell({ title, onClose, children, maxWidth = "max-w-3xl", icon: Icon, iconAccent = "bg-brand-orange/10 text-brand-orange", headerExtra }) {
  const containerRef = useRef(null);
  const titleId = useId();

  useFocusTrap(containerRef, true);
  useEscapeKey(onClose, true);
  useRestoreFocus(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl outline-none animate-[fadeScaleIn_0.18s_ease-out]`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconAccent}`}>
                <Icon size={18} aria-hidden="true" />
              </span>
            )}
            <h3 id={titleId} className="text-xl font-semibold text-brand-dark">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {headerExtra}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function DonationViewModal({ donation, onClose }) {
  const hasRemark = Boolean(donation.verificationRemarks?.trim());

  return (
    <ModalShell
      title="Donation Details"
      onClose={onClose}
      icon={FileText}
      iconAccent="bg-purple-50 text-purple-600"
      headerExtra={
        <span className="flex items-center gap-2 text-sm text-gray-500">
          Status <StatusBadge status={donation.status} />
        </span>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-dark">
            <UserCircle size={16} aria-hidden="true" />
            Donor Information
          </p>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-gray-400">Donor Name</dt>
              <dd className="font-medium text-brand-dark">{donation.donorName}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Email</dt>
              <dd className="font-medium text-brand-dark">{donation.donorEmail}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Phone</dt>
              <dd className="font-medium text-brand-dark">{donation.donorPhone || "—"}</dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Amount</p>
              <p className="font-semibold text-brand-dark">{formatINR(donation.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payment Mode</p>
              <p className="font-semibold text-brand-dark">{donation.paymentMode}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Campaign</p>
              <p className="font-semibold text-brand-dark">{donation.campaign?.campaignName ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Submitted At</p>
              <p className="font-semibold text-brand-dark">{formatDateTime(donation.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Transaction ID</p>
              <p className="break-all font-semibold text-brand-dark">{donation.transactionId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Resubmissions</p>
              <p className="font-semibold text-brand-dark">{donation.resubmissionCount ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-dark">
              <FileText size={16} aria-hidden="true" />
              Payment Screenshot
            </p>
            {donation.screenshot?.url ? (
              <img
                src={donation.screenshot.url}
                alt="Payment screenshot"
                className="w-full rounded-xl border border-gray-100 object-contain"
              />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-xs text-gray-400">
                No screenshot available
              </div>
            )}
            {donation.screenshot?.url && (
              <a
                href={donation.screenshot.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-xs font-medium text-brand-orange hover:underline"
              >
                View Full Size
              </a>
            )}
          </div>

          {(donation.status === "Verified" || donation.status === "Rejected") && (
            <div className="rounded-2xl border border-gray-100 p-4 text-sm">
              <p className="text-xs text-gray-400">
                {donation.status === "Verified" ? "Verified At" : "Rejected At"}
              </p>
              <p className="font-semibold text-brand-dark">{formatDateTime(donation.verifiedAt)}</p>
            </div>
          )}

          {hasRemark && (
            <div className={`rounded-2xl border p-4 ${donation.status === "Rejected" ? "border-red-100 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
              <p className={`mb-1 text-xs font-semibold uppercase tracking-wide ${donation.status === "Rejected" ? "text-red-600" : "text-gray-500"}`}>
                Verification Remark
              </p>
              <p className={`text-sm ${donation.status === "Rejected" ? "text-red-700" : "text-gray-600"}`}>
                {donation.verificationRemarks}
              </p>
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_FILTERS = {
  search: "",
  campaign: "All",
  status: "All",
  paymentMode: "All",
  fromDate: "",
  toDate: "",
};

export default function DonationHistoryPage() {
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState({ totalDonations: 0, totalPages: 1, currentPage: 1 });
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDonationId, setActiveDonationId] = useState(null);

  const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);

  // load the admin's own campaigns once, for the campaign filter dropdown
  useEffect(() => {
    let cancelled = false;
    fetchAdminCampaigns()
      .then((response) => {
        if (!cancelled) setCampaigns(response.data?.data?.campaigns ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const buildParams = useCallback(
    (page) => {
      const params = { page, limit: PAGE_SIZE };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filters.campaign !== "All") params.campaign = filters.campaign;
      if (filters.status !== "All") params.status = filters.status;
      if (filters.paymentMode !== "All") params.paymentMode = filters.paymentMode;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      return params;
    },
    [debouncedSearch, filters.campaign, filters.status, filters.paymentMode, filters.fromDate, filters.toDate]
  );

  const loadDonations = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const response = await fetchDonations(buildParams(currentPage));
      const data = response.data?.data;
      setDonations(data?.donations ?? []);
      setPagination(
        data?.pagination ?? { totalDonations: 0, totalPages: 1, currentPage: 1 }
      );
    } catch (error) {
      setFetchError(error?.response?.data?.message || "Failed to load donation history.");
    } finally {
      setIsLoading(false);
    }
  }, [buildParams, currentPage]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  // reset to page 1 whenever a filter (other than the page itself) changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters.campaign, filters.status, filters.paymentMode, filters.fromDate, filters.toDate]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.campaign !== "All" ||
    filters.status !== "All" ||
    filters.paymentMode !== "All" ||
    filters.fromDate !== "" ||
    filters.toDate !== "";

  const totalPages = Math.max(1, pagination.totalPages ?? 1);
  const safePage = Math.min(currentPage, totalPages);
  const rangeStart = pagination.totalDonations === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, pagination.totalDonations ?? 0);

  const activeDonation = useMemo(
    () => donations.find((d) => d._id === activeDonationId) ?? null,
    [donations, activeDonationId]
  );
  const openView = useCallback((donation) => setActiveDonationId(donation._id), []);
  const closeModal = useCallback(() => setActiveDonationId(null), []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportError("");
    try {
      const response = await fetchDonations({ ...buildParams(1), page: 1, limit: EXPORT_LIMIT });
      const rows = response.data?.data?.donations ?? [];

      const header = [
        "Donor Name",
        "Donor Email",
        "Campaign",
        "Amount",
        "Transaction ID",
        "Payment Mode",
        "Status",
        "Submitted At",
        "Verified/Rejected At",
        "Remarks",
      ];
      const csvRows = rows.map((d) => [
        d.donorName ?? "",
        d.donorEmail ?? "",
        d.campaign?.campaignName ?? "",
        d.amount ?? "",
        d.transactionId ?? "",
        d.paymentMode ?? "",
        d.status ?? "",
        formatDateTime(d.createdAt),
        d.verifiedAt ? formatDateTime(d.verifiedAt) : "",
        d.verificationRemarks ?? "",
      ]);

      downloadCsv([header, ...csvRows], `donation-history-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      setExportError(error?.response?.data?.message || "Failed to export donation history.");
    } finally {
      setIsExporting(false);
    }
  }, [buildParams]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.96) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange">
            <History size={14} aria-hidden="true" />
            Donations
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">Donation History</h1>
          <p className="mt-2 text-gray-500">Full donation records across all your campaigns, with filters and export.</p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 self-start rounded-xl bg-brand-dark px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
          Export Report
        </button>
      </div>

      {exportError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle size={16} aria-hidden="true" />
          {exportError}
        </div>
      )}

      <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
        {/* Filters bar */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
            <label htmlFor="history-search" className="sr-only">
              Search donor, email, or transaction ID
            </label>
            <input
              id="history-search"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search donor, email, or transaction ID..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-3 pl-11 pr-4 outline-none transition focus:border-brand-orange focus:bg-white focus:shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <Filter size={13} aria-hidden="true" />
              Filters
            </span>

            <select
              value={filters.campaign}
              onChange={(event) => updateFilter("campaign", event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
            >
              <option value="All">All Campaigns</option>
              {campaigns.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.campaignName}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Statuses" : s}
                </option>
              ))}
            </select>

            <select
              value={filters.paymentMode}
              onChange={(event) => updateFilter("paymentMode", event.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
            >
              {PAYMENT_MODE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m === "All" ? "All Payment Modes" : m}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-500">
              From
              <input
                type="date"
                value={filters.fromDate}
                onChange={(event) => updateFilter("fromDate", event.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              To
              <input
                type="date"
                value={filters.toDate}
                onChange={(event) => updateFilter("toDate", event.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white"
              />
            </label>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <RotateCcw size={14} aria-hidden="true" />
                Reset
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            Loading donation history...
          </div>
        )}

        {!isLoading && fetchError && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="text-red-400" size={28} aria-hidden="true" />
            <p className="font-medium text-gray-600">{fetchError}</p>
            <button onClick={loadDonations} className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
              Retry
            </button>
          </div>
        )}

        {!isLoading && !fetchError && (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="min-w-full">
                <caption className="sr-only">Donation history</caption>
                <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <th scope="col" className="py-4">Donor</th>
                    <th scope="col">Campaign</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Transaction ID</th>
                    <th scope="col">Payment Mode</th>
                    <th scope="col">Submitted At</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                            <Search size={20} className="text-gray-300" aria-hidden="true" />
                          </span>
                          <p className="font-medium text-gray-500">No donations match your filters.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {donations.map((donation, index) => (
                    <DonationRow key={donation._id} donation={donation} index={index} onView={openView} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                totalRecords={pagination.totalDonations ?? 0}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </Card>

      {activeDonation && <DonationViewModal donation={activeDonation} onClose={closeModal} />}
    </div>
  );
}