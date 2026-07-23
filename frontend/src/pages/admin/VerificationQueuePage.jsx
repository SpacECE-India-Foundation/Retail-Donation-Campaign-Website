import React, { useState, useMemo, useCallback, useEffect, useRef, useId } from "react";
import {
  Search,
  ClipboardCheck,
  AlertTriangle,
  Clock3,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  X,
  FileText,
  UserCircle,
  Check,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import {
  fetchAdminPendingDonations,
  verifyDonationRequest,
  rejectDonationRequest,
} from "../../services/donationService";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};

const PAGE_SIZE = 6;
const TOAST_DURATION_MS = 2500;
const SEARCH_DEBOUNCE_MS = 300;
const SORT_KEYS = { DONOR: "donor", AMOUNT: "amount", DATE: "date" };

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  return `₹${Number(amount).toLocaleString("en-IN")}`;
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

function sortDonations(rows, sortConfig) {
  if (!sortConfig?.key) return rows;
  const { key, direction } = sortConfig;
  const factor = direction === "asc" ? 1 : -1;

  return [...rows].sort((a, b) => {
    if (key === SORT_KEYS.AMOUNT) {
      return (a.amount - b.amount) * factor;
    }
    if (key === SORT_KEYS.DATE) {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
    }
    return String(a.donorName ?? "").localeCompare(String(b.donorName ?? "")) * factor;
  });
}

/* ------------------------------------------------------------------ */
/* Shared hooks                                                        */
/* ------------------------------------------------------------------ */

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

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
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

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-6 top-6 z-[70] flex items-center gap-2 rounded-2xl border border-white/10 bg-brand-dark/95 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur animate-[fadeSlideIn_0.2s_ease-out]"
    >
      <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
      {message}
    </div>
  );
}

function SortableHeader({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey;
  const Icon = isActive ? (sortConfig.direction === "asc" ? ChevronUp : ChevronDown) : ArrowUpDown;
  return (
    <th scope="col" className="py-4">
      <button
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 text-left text-sm font-medium transition hover:text-brand-dark ${
          isActive ? "text-brand-dark" : "text-gray-500"
        }`}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <Icon size={14} aria-hidden="true" />
      </button>
    </th>
  );
}

const DonationRow = React.memo(function DonationRow({ donation, index, onReview }) {
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
          onClick={() => onReview(donation)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition duration-150 hover:-translate-y-0.5 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Eye size={16} aria-hidden="true" />
          Review
        </button>
      </td>
    </tr>
  );
});

function Pagination({ currentPage, totalPages, rangeStart, rangeEnd, totalRecords, onPageChange }) {
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);
  return (
    <nav aria-label="Verification queue pagination" className="flex flex-col items-center gap-4 sm:flex-row">
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
/* Modal shell + detail panel                                          */
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

function DonationDetailModal({ donation, onClose, onVerify, onReject, actionLoading }) {
  const [remark, setRemark] = useState("");
  const hasPreviousRemark = Boolean(donation.verificationRemarks?.trim());
  const wasResubmitted = (donation.resubmissionCount ?? 0) > 0;

  const handleReject = () => {
    if (!remark.trim()) return;
    onReject(donation._id, remark.trim());
  };

  return (
    <ModalShell
      title="Donation Request Details"
      onClose={onClose}
      icon={FileText}
      iconAccent="bg-purple-50 text-purple-600"
      headerExtra={
        <span className="flex items-center gap-2 text-sm text-gray-500">
          Current Status <StatusBadge status={donation.status} />
        </span>
      }
    >
      <div className="grid gap-5 md:grid-cols-3">
        {/* Donor info */}
        <div className="rounded-2xl border border-gray-100 p-4 md:col-span-1">
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
            <div>
              <dt className="text-xs text-gray-400">Message</dt>
              <dd className="font-medium text-brand-dark">{donation.donorMessage || "—"}</dd>
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
          </div>
        </div>

        {/* Screenshot */}
        <div className="rounded-2xl border border-gray-100 p-4 md:col-span-1">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-dark">
            <FileText size={16} aria-hidden="true" />
            Payment Screenshot{wasResubmitted ? " (Updated)" : ""}
          </p>
          {donation.screenshot?.url ? (
            <img
              src={donation.screenshot.url}
              alt="Payment screenshot"
              className="w-full rounded-xl border border-gray-100 object-contain"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-xs text-gray-400">
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
          <p className="mt-3 text-xs text-gray-400">
            Transaction ID{wasResubmitted ? " (Updated)" : ""}
          </p>
          <p className="break-all text-sm font-semibold text-brand-dark">{donation.transactionId}</p>
        </div>

        {/* Remarks + actions */}
        <div className="space-y-4 md:col-span-1">
          {hasPreviousRemark && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-red-600">
                Previous Verification Remark
              </p>
              <p className="text-sm text-red-700">{donation.verificationRemarks}</p>
            </div>
          )}

          <div>
            <label htmlFor="admin-remark" className="mb-1 block text-sm font-medium text-gray-600">
              Add new rejection reason
            </label>
            <textarea
              id="admin-remark"
              value={remark}
              onChange={(event) => setRemark(event.target.value.slice(0, 250))}
              maxLength={250}
              rows={4}
              placeholder="Enter reason for rejection..."
              className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-brand-orange"
            />
            <p className="mt-1 text-right text-xs text-gray-400">{remark.length}/250</p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => onVerify(donation._id)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
              Verify &amp; Approve
            </button>
            <button
              type="button"
              disabled={actionLoading || !remark.trim()}
              onClick={handleReject}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
              {donation.status === "Rejected" ? "Reject Again" : "Reject Donation"}
            </button>
          </div>

          {wasResubmitted && (
            <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
              <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              Donor has updated the details. Please review and take action.
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

export default function VerificationQueuePage() {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [tab, setTab] = useState("Pending"); // "Pending" | "Rejected"
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  const [activeDonationId, setActiveDonationId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const loadDonations = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const response = await fetchAdminPendingDonations();
      setDonations(response.data?.data?.newPendingDonations ?? []);
    } catch (error) {
      setFetchError(error?.response?.data?.message || "Failed to load the verification queue.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const pendingDonations = useMemo(() => donations.filter((d) => d.status === "Pending"), [donations]);
  const rejectedDonations = useMemo(() => donations.filter((d) => d.status === "Rejected"), [donations]);

  const tabDonations = tab === "Pending" ? pendingDonations : rejectedDonations;

  const filteredDonations = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return tabDonations;
    return tabDonations.filter(
      (d) =>
        (d.donorName ?? "").toLowerCase().includes(query) ||
        (d.donorEmail ?? "").toLowerCase().includes(query) ||
        (d.transactionId ?? "").toLowerCase().includes(query) ||
        (d.campaign?.campaignName ?? "").toLowerCase().includes(query)
    );
  }, [tabDonations, debouncedSearch]);

  const sortedDonations = useMemo(() => sortDonations(filteredDonations, sortConfig), [filteredDonations, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedDonations.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedDonations = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedDonations.slice(start, start + PAGE_SIZE);
  }, [sortedDonations, safePage]);

  const rangeStart = sortedDonations.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, sortedDonations.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, tab, sortConfig]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  }, []);

  const activeDonation = useMemo(
    () => donations.find((d) => d._id === activeDonationId) ?? null,
    [donations, activeDonationId]
  );

  const openReview = useCallback((donation) => setActiveDonationId(donation._id), []);
  const closeModal = useCallback(() => setActiveDonationId(null), []);

  const handleVerify = useCallback(
    async (donationId) => {
      setActionLoading(true);
      try {
        await verifyDonationRequest(donationId);
        setDonations((prev) => prev.filter((d) => d._id !== donationId));
        showToast("Donation verified successfully");
        closeModal();
      } catch (error) {
        showToast(error?.response?.data?.message || "Failed to verify donation");
      } finally {
        setActionLoading(false);
      }
    },
    [showToast, closeModal]
  );

  const handleReject = useCallback(
    async (donationId, remark) => {
      setActionLoading(true);
      try {
        await rejectDonationRequest(donationId, remark);
        setDonations((prev) =>
          prev.map((d) => (d._id === donationId ? { ...d, status: "Rejected", verificationRemarks: remark } : d))
        );
        showToast("Donation rejected, donor notified");
        closeModal();
      } catch (error) {
        showToast(error?.response?.data?.message || "Failed to reject donation");
      } finally {
        setActionLoading(false);
      }
    },
    [showToast, closeModal]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.96) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Toast message={toast} />

      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange">
          <ClipboardCheck size={14} aria-hidden="true" />
          Donations
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">Verification Queue</h1>
        <p className="mt-2 text-gray-500">Review pending and recently rejected donations that need action.</p>
      </div>

      <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("Pending")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "Pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Pending ({pendingDonations.length})
            </button>
            <button
              onClick={() => setTab("Rejected")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === "Rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              Recently Rejected ({rejectedDonations.length})
            </button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
            <label htmlFor="queue-search" className="sr-only">
              Search donor, email, transaction ID or campaign
            </label>
            <input
              id="queue-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search donor, email, transaction ID, campaign..."
              className="w-72 rounded-xl border border-gray-200 bg-gray-50/60 py-3 pl-11 pr-4 outline-none transition focus:border-brand-orange focus:bg-white focus:shadow-sm"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
            <Loader2 size={20} className="animate-spin" aria-hidden="true" />
            Loading verification queue...
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
                <caption className="sr-only">Verification queue</caption>
                <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <SortableHeader label="Donor" sortKey={SORT_KEYS.DONOR} sortConfig={sortConfig} onSort={handleSort} />
                    <th scope="col">Campaign</th>
                    <SortableHeader label="Amount" sortKey={SORT_KEYS.AMOUNT} sortConfig={sortConfig} onSort={handleSort} />
                    <th scope="col">Transaction ID</th>
                    <th scope="col">Payment Mode</th>
                    <SortableHeader label="Submitted At" sortKey={SORT_KEYS.DATE} sortConfig={sortConfig} onSort={handleSort} />
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDonations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                            <Search size={20} className="text-gray-300" aria-hidden="true" />
                          </span>
                          <p className="font-medium text-gray-500">
                            No {tab.toLowerCase()} donations match your search.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {paginatedDonations.map((donation, index) => (
                    <DonationRow key={donation._id} donation={donation} index={index} onReview={openReview} />
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
                totalRecords={sortedDonations.length}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </Card>

      {activeDonation && (
        <DonationDetailModal
          donation={activeDonation}
          onClose={closeModal}
          onVerify={handleVerify}
          onReject={handleReject}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}