import React, { useState, useMemo, useCallback, useEffect, useRef, useId } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart3,
  Users,
  IndianRupee,
  FolderKanban,
  Search,
  Bell,
  SlidersHorizontal,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FolderPlus,
  FileText,
  LogIn,
  CheckCheck,
  Settings,
  LogOut,
  UserCircle,
  Check,
  Loader2,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { logout, getCurrentAdmin } from "../../services/authService";
import {
  fetchAdminPendingDonations,
  verifyDonationRequest,
  rejectDonationRequest,
} from "../../services/donationService";
import { fetchAdminCampaigns } from "../../services/campaignService";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};

const STATUS_FILTER_OPTIONS = ["All", "Pending", "Rejected"];
const PAGE_SIZE = 5;
const TOAST_DURATION_MS = 2500;
const SEARCH_DEBOUNCE_MS = 300;

const SORT_KEYS = { DONOR: "donor", AMOUNT: "amount", DATE: "date" };

const ACTIVITY_FEED = [
  { id: 1, icon: "donation", text: "Rahul Sharma donated ₹500", time: "Today • 10:30 AM", status: "Completed" },
  { id: 2, icon: "campaign", text: "New campaign created", time: "Today • 09:15 AM", status: "Completed" },
  { id: 3, icon: "report", text: "Monthly report generated", time: "Yesterday • 06:40 PM", status: "Completed" },
  { id: 4, icon: "login", text: "Admin logged in", time: "Yesterday • 09:02 AM", status: "Completed" },
];

const ACTIVITY_ICONS = {
  donation: IndianRupee,
  campaign: FolderPlus,
  report: FileText,
  login: LogIn,
};

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

const STAT_ACCENTS = [
  { iconBg: "bg-brand-orange/10", iconText: "text-brand-orange", bar: "bg-brand-orange" },
  { iconBg: "bg-blue-50", iconText: "text-blue-600", bar: "bg-blue-500" },
  { iconBg: "bg-purple-50", iconText: "text-purple-600", bar: "bg-purple-500" },
  { iconBg: "bg-emerald-50", iconText: "text-emerald-600", bar: "bg-emerald-500" },
];

const ACTIVITY_ACCENTS = {
  donation: { bg: "bg-emerald-50", text: "text-emerald-600" },
  campaign: { bg: "bg-blue-50", text: "text-blue-600" },
  report: { bg: "bg-purple-50", text: "text-purple-600" },
  login: { bg: "bg-brand-orange/10", text: "text-brand-orange" },
};

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

function buildCsv(rows) {
  const header = ["Donor", "Email", "Campaign", "Amount", "Transaction ID", "Payment Mode", "Status", "Date"];
  const escapeCell = (cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`;
  const lines = [
    header,
    ...rows.map((r) => [
      r.donorName,
      r.donorEmail,
      r.campaign?.campaignName ?? "",
      r.amount,
      r.transactionId,
      r.paymentMode,
      r.status,
      formatDateTime(r.paymentDate),
    ]),
  ];
  return lines.map((line) => line.map(escapeCell).join(",")).join("\n");
}

function downloadCsv(csvContent, filename) {
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

/** Deterministic pseudo-trend bars for a stat card sparkline, seeded from the title so it stays stable across renders. */
function getSparkline(seed) {
  const base = hashString(seed);
  return Array.from({ length: 7 }, (_, i) => 30 + ((base >> (i * 3)) % 70));
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
      return (new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()) * factor;
    }
    return String(a.donorName ?? "").localeCompare(String(b.donorName ?? "")) * factor;
  });
}

/* ------------------------------------------------------------------ */
/* Shared hooks                                                        */
/* ------------------------------------------------------------------ */

/** Calls onOutside when a pointer event occurs outside the given ref, while active. */
function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return undefined;

    function handlePointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutside(event);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [active, onOutside, ref]);
}

/** Calls onEscape when Escape is pressed, while active. */
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

/** Traps Tab focus within containerRef and focuses the first focusable element on activation. */
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

/** Restores focus to the element that was active before a modal/overlay opened. */
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

/** Returns a debounced copy of `value` that updates only after `delay` ms of inactivity. */
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

const StatCard = React.memo(function StatCard({ title, value, change, isPositive, icon: Icon, accent }) {
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const sparkline = useMemo(() => getSparkline(title), [title]);

  return (
    <Card className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <span className={`absolute inset-x-0 top-0 h-1 ${accent.bar} opacity-0 transition duration-300 group-hover:opacity-100`} aria-hidden="true" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-dark">{value}</h2>
          <div
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            <TrendIcon size={14} aria-hidden="true" />
            <span>{change}</span>
          </div>
        </div>
        <div className={`rounded-2xl ${accent.iconBg} p-4 transition duration-300 group-hover:scale-110`}>
          <Icon className={`h-6 w-6 ${accent.iconText}`} aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 flex h-8 items-end gap-1" aria-hidden="true">
        {sparkline.map((height, i) => (
          <span
            key={i}
            className={`flex-1 rounded-sm ${accent.bar} opacity-20 transition-all duration-300 group-hover:opacity-60`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </Card>
  );
});

function NotificationBell({ notifications, unreadCount, onMarkAllRead, onMarkOneRead }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonId = useId();
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);
  useEscapeKey(close, open);

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={buttonId}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`View notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full bg-white p-3 shadow transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
      >
        <Bell className="h-5 w-5 text-brand-dark" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-white ring-2 ring-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          className="absolute right-0 z-20 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-2xl backdrop-blur animate-[fadeScaleIn_0.15s_ease-out]"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="font-semibold text-brand-dark">Notifications</p>
            <button
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 text-xs font-medium text-brand-orange transition hover:text-brand-orange/70 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              <CheckCheck size={14} aria-hidden="true" />
              Mark all read
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-400">You're all caught up.</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.id}
                role="menuitem"
                onClick={() => onMarkOneRead(n.id)}
                className={`flex w-full items-start gap-2 border-b border-gray-50 px-4 py-3 text-left transition hover:bg-orange-50 ${
                  n.read ? "opacity-60" : ""
                }`}
              >
                {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-orange" aria-hidden="true" />}
                {n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0" aria-hidden="true" />}
                <span>
                  <p className="text-sm text-brand-dark">{n.text}</p>
                  <p className="mt-1 text-xs text-gray-400">{n.time}</p>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileMenu({ adminName, adminEmail }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonId = useId();
  const menuId = useId();
  const navigate = useNavigate();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);
  useEscapeKey(close, open);

  const displayName = adminName || "Admin";
  const displayEmail = adminEmail || "admin@spaceece.org";

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={buttonId}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange sm:pr-4"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-400 text-sm font-bold text-white shadow-inner">
          {getInitials(displayName)}
        </span>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-semibold leading-tight text-brand-dark">{displayName}</p>
          <p className="text-xs leading-tight text-gray-400">{displayEmail}</p>
        </div>
        <ChevronDown size={16} className="hidden text-gray-400 sm:block" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          className="absolute right-0 z-20 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-2xl backdrop-blur animate-[fadeScaleIn_0.15s_ease-out]"
        >
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-brand-dark">{displayName}</p>
            <p className="text-xs text-gray-400">{displayEmail}</p>
          </div>
          <button
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-600 transition hover:bg-orange-50"
          >
            <UserCircle size={16} aria-hidden="true" />
            My Profile
          </button>
          <button
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-600 transition hover:bg-orange-50"
          >
            <Settings size={16} aria-hidden="true" />
            Settings
          </button>
          <button
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 border-t border-gray-50 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} aria-hidden="true" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

function FilterPanel({ status, campaign, campaignOptions, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonId = useId();
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);
  useEscapeKey(close, open);

  const activeCount = (status !== "All" ? 1 : 0) + (campaign !== "All" ? 1 : 0);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        id={buttonId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex items-center gap-2"
        onClick={() => setOpen((o) => !o)}
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        Filter
        {activeCount > 0 && (
          <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white/25 px-1 text-xs font-bold">
            {activeCount}
          </span>
        )}
        <ChevronDown size={16} aria-hidden="true" />
      </Button>

      {open && (
        <div
          id={menuId}
          role="dialog"
          aria-labelledby={buttonId}
          className="absolute right-0 z-20 mt-2 w-72 origin-top-right space-y-4 overflow-hidden rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-2xl backdrop-blur animate-[fadeScaleIn_0.15s_ease-out]"
        >
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTER_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => onChange({ status: option })}
                  aria-pressed={status === option}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    status === option
                      ? "bg-brand-orange text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="campaign-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
              Campaign
            </label>
            <select
              id="campaign-filter"
              value={campaign}
              onChange={(event) => onChange({ campaign: event.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-brand-orange"
            >
              {campaignOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-between border-t border-gray-100 pt-3">
            <button
              onClick={onClear}
              className="text-xs font-medium text-gray-500 transition hover:text-brand-dark"
            >
              Clear all
            </button>
            <button
              onClick={close}
              className="text-xs font-semibold text-brand-orange transition hover:text-brand-orange/70"
            >
              Done
            </button>
          </div>
        </div>
      )}
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
      <td className="text-gray-500">{formatDateTime(donation.paymentDate)}</td>
      <td>
        <StatusBadge status={donation.status} />
      </td>
      <td>
        <button
          onClick={() => onView(donation)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition duration-150 hover:-translate-y-0.5 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Eye size={16} aria-hidden="true" />
          View
        </button>
      </td>
    </tr>
  );
});

function Pagination({ currentPage, totalPages, rangeStart, rangeEnd, totalRecords, onPageChange }) {
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  return (
    <nav aria-label="Donation table pagination" className="flex flex-col items-center gap-4 sm:flex-row">
      <p className="text-sm text-gray-500" aria-live="polite">
        Showing {rangeStart}–{rangeEnd} of {totalRecords} records
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Prev
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`h-9 w-9 rounded-xl text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${
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
          className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
        >
          Next
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

const ActivityItem = React.memo(function ActivityItem({ activity, isLast }) {
  const Icon = ACTIVITY_ICONS[activity.icon];
  const accent = ACTIVITY_ACCENTS[activity.icon] ?? ACTIVITY_ACCENTS.login;

  return (
    <div className="relative flex gap-4 pb-4 last:pb-0">
      {!isLast && (
        <span className="absolute left-[19px] top-10 bottom-0 w-px bg-gray-100" aria-hidden="true" />
      )}

      <div className={`relative z-10 shrink-0 rounded-full ${accent.bg} p-3 ring-4 ring-white`}>
        <Icon size={18} className={accent.text} aria-hidden="true" />
      </div>

      <div className="flex flex-1 items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand-orange/40 hover:bg-orange-50/60 hover:shadow-md">
        <div>
          <p className="font-medium text-brand-dark">{activity.text}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <Clock3 size={12} aria-hidden="true" />
            {activity.time}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          {activity.status}
        </span>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Modal shell                                                         */
/* ------------------------------------------------------------------ */

function ModalShell({ title, onClose, children, maxWidth = "max-w-md", icon: Icon, iconAccent = "bg-brand-orange/10 text-brand-orange", headerExtra }) {
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
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
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

/* ------------------------------------------------------------------ */
/* Donation detail / verify-reject panel                               */
/* ------------------------------------------------------------------ */

function DonationDetailModal({ donation, onClose, onVerify, onReject, actionLoading }) {
  const [remark, setRemark] = useState("");

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
      maxWidth="max-w-3xl"
      headerExtra={
        <span className="text-sm text-gray-500">
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
              <dt className="text-xs text-gray-400">Address</dt>
              <dd className="font-medium text-brand-dark">{donation.address || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Message</dt>
              <dd className="font-medium text-brand-dark">{donation.donorMessage || "—"}</dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
            <div>
              <p className="text-xs text-gray-400">Donation Amount</p>
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
              <p className="text-xs text-gray-400">Payment Date</p>
              <p className="font-semibold text-brand-dark">{formatDateTime(donation.paymentDate)}</p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <div className="rounded-2xl border border-gray-100 p-4 md:col-span-1">
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
        </div>

        {/* Transaction + action panel */}
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs text-gray-400">Transaction ID</p>
            <p className="break-all font-semibold text-brand-dark">{donation.transactionId}</p>
            <p className="mt-3 text-xs text-gray-400">Amount</p>
            <p className="font-semibold text-emerald-600">{formatINR(donation.amount)}</p>
          </div>

          <div>
            <label htmlFor="admin-remark" className="mb-1 block text-sm font-medium text-gray-600">
              Admin Remark (if rejected)
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
              disabled={actionLoading || donation.status !== "Pending"}
              onClick={() => onVerify(donation._id)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
              Verify &amp; Approve
            </button>
            <button
              type="button"
              disabled={actionLoading || donation.status !== "Pending" || !remark.trim()}
              onClick={handleReject}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <X size={16} aria-hidden="true" />}
              Reject Donation
            </button>
            {donation.status !== "Pending" && (
              <p className="text-center text-xs text-gray-400">
                This donation is already {donation.status.toLowerCase()} — no further action needed.
              </p>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [campaignFilter, setCampaignFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  const [activeDonationId, setActiveDonationId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [toast, setToast] = useState("");
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentAdmin()
      .then((response) => {
        if (!cancelled) setAdminProfile(response.data?.data?.admin ?? null);
      })
      .catch(() => {
        // not fatal — profile menu just falls back to generic "Admin" label
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  /* -------------------------- data fetching -------------------------- */

  const loadDonations = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const response = await fetchAdminPendingDonations();
      setDonations(response.data?.data?.newPendingDonations ?? []);
    } catch (error) {
      setFetchError(error?.response?.data?.message || "Failed to load donations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  const loadCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const response = await fetchAdminCampaigns();
      setCampaigns(response.data?.data?.campaigns ?? []);
    } catch (error) {
      // Backend returns an error (not an empty array) when the admin has
      // zero campaigns yet — treat that specific case as "no campaigns",
      // not a failure.
      setCampaigns([]);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  /* -------------------------- derived data -------------------------- */

  const campaignOptions = useMemo(() => {
    const names = new Set(donations.map((d) => d.campaign?.campaignName).filter(Boolean));
    return ["All", ...names];
  }, [donations]);

  const filteredDonations = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return donations.filter((d) => {
      const matchesSearch =
        !query ||
        (d.donorName ?? "").toLowerCase().includes(query) ||
        (d.campaign?.campaignName ?? "").toLowerCase().includes(query) ||
        (d.transactionId ?? "").toLowerCase().includes(query);

      const matchesStatus = statusFilter === "All" || d.status === statusFilter;
      const matchesCampaign = campaignFilter === "All" || d.campaign?.campaignName === campaignFilter;

      return matchesSearch && matchesStatus && matchesCampaign;
    });
  }, [donations, debouncedSearch, statusFilter, campaignFilter]);

  const sortedDonations = useMemo(
    () => sortDonations(filteredDonations, sortConfig),
    [filteredDonations, sortConfig]
  );

  const totalPages = Math.max(1, Math.ceil(sortedDonations.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedDonations = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedDonations.slice(start, start + PAGE_SIZE);
  }, [sortedDonations, safePage]);

  const rangeStart = sortedDonations.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, sortedDonations.length);

  const stats = useMemo(() => {
    const pendingCount = donations.filter((d) => d.status === "Pending").length;

    const totalRaised = campaigns.reduce((sum, c) => sum + (c.campaignRaisedAmt || 0), 0);
    const totalContributors = campaigns.reduce((sum, c) => sum + (c.contributors || 0), 0);
    const activeCampaignsCount = campaigns.filter((c) => c.campaignStatus === "Active").length;

    return [
      { title: "Total Raised", value: formatINR(totalRaised), change: "Across all your campaigns", isPositive: true, icon: IndianRupee, accent: STAT_ACCENTS[0] },
      { title: "Active Campaigns", value: String(activeCampaignsCount), change: `${campaigns.length} total`, isPositive: true, icon: FolderKanban, accent: STAT_ACCENTS[1] },
      { title: "Total Contributors", value: String(totalContributors), change: "Verified donors", isPositive: true, icon: Users, accent: STAT_ACCENTS[2] },
      { title: "Pending Requests", value: String(pendingCount), change: "Awaiting review", isPositive: pendingCount === 0, icon: BarChart3, accent: STAT_ACCENTS[3] },
    ];
  }, [donations, campaigns]);

  const notifications = useMemo(() => {
    const pendingCount = donations.filter((d) => d.status === "Pending").length;
    if (pendingCount === 0) return [];
    return [
      {
        id: "pending-donations",
        text: `${pendingCount} donation${pendingCount === 1 ? "" : "s"} pending review`,
        time: "Just now",
        read: notificationsRead,
      },
    ];
  }, [donations, notificationsRead]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const activeDonation = useMemo(
    () => donations.find((d) => d._id === activeDonationId) ?? null,
    [donations, activeDonationId]
  );

  /* ---------------------------- handlers ---------------------------- */

  const handleSearchChange = useCallback((event) => setSearch(event.target.value), []);

  const handleFilterChange = useCallback((patch) => {
    if (patch.status !== undefined) setStatusFilter(patch.status);
    if (patch.campaign !== undefined) setCampaignFilter(patch.campaign);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStatusFilter("All");
    setCampaignFilter("All");
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  }, []);

  const handlePageChange = useCallback((page) => setCurrentPage(page), []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, campaignFilter, sortConfig]);

  const openViewModal = useCallback((donation) => setActiveDonationId(donation._id), []);
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

  const handleExportCsv = useCallback(() => {
    const csvContent = buildCsv(sortedDonations);
    downloadCsv(csvContent, `donation-requests-${Date.now()}.csv`);
    showToast("Report exported successfully");
  }, [sortedDonations, showToast]);

  const handleMarkAllRead = useCallback(() => {
    setNotificationsRead(true);
  }, []);

  const handleMarkOneRead = useCallback(() => {
    setNotificationsRead(true);
  }, []);

  /* ------------------------------ render ------------------------------ */

  return (
    <div className="min-h-screen bg-brand-cream p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.96) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="h-1 w-full rounded-full bg-gradient-to-r from-brand-orange via-orange-300 to-transparent" aria-hidden="true" />

        <Toast message={toast} />

        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-orange">Overview</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-gray-500">
              Review, verify, and manage incoming donation requests.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={handleMarkAllRead}
              onMarkOneRead={handleMarkOneRead}
            />
            <ProfileMenu adminName={adminProfile?.fullName} adminEmail={adminProfile?.email} />
          </div>
        </header>

        <section aria-label="Key metrics" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </section>

        <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Donations</p>
              <h2 className="mt-1 text-2xl font-semibold text-brand-dark">Donation Requests</h2>
              <p className="text-gray-500">Manage and review all donation requests.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                  aria-hidden="true"
                />
                <label htmlFor="donation-search" className="sr-only">
                  Search donor, campaign or transaction ID
                </label>
                <input
                  id="donation-search"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search donor, campaign, transaction ID..."
                  className="w-64 rounded-xl border border-gray-200 bg-gray-50/60 py-3 pl-11 pr-4 outline-none transition focus:border-brand-orange focus:bg-white focus:shadow-sm"
                />
              </div>

              <FilterPanel
                status={statusFilter}
                campaign={campaignFilter}
                campaignOptions={campaignOptions}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />

              <Button className="flex items-center gap-2" onClick={handleExportCsv} disabled={sortedDonations.length === 0}>
                <Download size={18} aria-hidden="true" />
                Export Report
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
              <Loader2 size={20} className="animate-spin" aria-hidden="true" />
              Loading donation requests...
            </div>
          )}

          {!isLoading && fetchError && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <AlertTriangle className="text-red-400" size={28} aria-hidden="true" />
              <p className="font-medium text-gray-600">{fetchError}</p>
              <button
                onClick={loadDonations}
                className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !fetchError && (
            <>
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="min-w-full">
                  <caption className="sr-only">List of donation requests</caption>
                  <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <SortableHeader label="Donor" sortKey={SORT_KEYS.DONOR} sortConfig={sortConfig} onSort={handleSort} />
                      <th scope="col">Campaign</th>
                      <SortableHeader label="Amount" sortKey={SORT_KEYS.AMOUNT} sortConfig={sortConfig} onSort={handleSort} />
                      <th scope="col">Transaction ID</th>
                      <th scope="col">Payment Mode</th>
                      <SortableHeader label="Date & Time" sortKey={SORT_KEYS.DATE} sortConfig={sortConfig} onSort={handleSort} />
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
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
                            <p className="font-medium text-gray-500">No donation requests match your search or filter.</p>
                            <p className="text-sm text-gray-400">Try adjusting your filters or search term.</p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {paginatedDonations.map((donation, index) => (
                      <DonationRow key={donation._id} donation={donation} index={index} onView={openViewModal} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  totalRecords={sortedDonations.length}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </Card>

        <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Activity</p>
              <h2 className="mt-1 text-2xl font-semibold text-brand-dark">Recent Activity</h2>
            </div>
            <span className="text-sm text-gray-400">Updated just now</span>
          </div>

          <div>
            {ACTIVITY_FEED.map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} isLast={index === ACTIVITY_FEED.length - 1} />
            ))}
          </div>
        </Card>

        <footer className="flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:justify-between">
          <p>© 2026 SpaceECE India Foundation</p>
          <p>Last Updated • Today</p>
        </footer>
      </div>

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