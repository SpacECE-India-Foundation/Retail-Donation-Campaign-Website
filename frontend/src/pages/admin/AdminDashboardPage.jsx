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
  SquarePen,
  Trash2,
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
  Plus,
  CheckCircle2,
  Clock3,
  FolderPlus,
  FileText,
  LogIn,
  CheckCheck,
  Trash,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { logout } from "../../services/authService";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Rejected: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = ["Pending", "Completed", "Rejected"];
const FILTER_OPTIONS = ["All", "Completed", "Pending", "Rejected"];
const CAMPAIGNS = ["Education Drive", "Food Donation", "Health Support", "Disaster Relief"];
const CAMPAIGN_FILTER_OPTIONS = ["All", ...CAMPAIGNS];
const PAGE_SIZE = 5;
const MAX_DONATION_AMOUNT = 10_000_000;
const TOAST_DURATION_MS = 2500;
const SEARCH_DEBOUNCE_MS = 300;

const AMOUNT_RANGE_OPTIONS = [
  { key: "all", label: "Any amount", min: -Infinity, max: Infinity },
  { key: "under-500", label: "Under ₹500", min: 0, max: 499 },
  { key: "500-1500", label: "₹500 – ₹1,500", min: 500, max: 1500 },
  { key: "1500-3000", label: "₹1,500 – ₹3,000", min: 1500, max: 3000 },
  { key: "above-3000", label: "Above ₹3,000", min: 3000, max: Infinity },
];

const SORT_KEYS = { DONOR: "donor", AMOUNT: "amount", DATE: "date" };

const DEFAULT_FILTERS = { status: "All", campaign: "All", amountRange: "all" };

const INITIAL_DONATIONS = [
  { id: 1, donor: "Rahul Sharma", campaign: "Education Drive", amount: 500, status: "Completed", date: "16 Jul" },
  { id: 2, donor: "Priya Singh", campaign: "Food Donation", amount: 1000, status: "Pending", date: "15 Jul" },
  { id: 3, donor: "Aman Gupta", campaign: "Health Support", amount: 2500, status: "Completed", date: "15 Jul" },
  { id: 4, donor: "Neha Verma", campaign: "Education Drive", amount: 750, status: "Completed", date: "14 Jul" },
  { id: 5, donor: "Kavita Rao", campaign: "Disaster Relief", amount: 1500, status: "Completed", date: "13 Jul" },
  { id: 6, donor: "Suresh Iyer", campaign: "Food Donation", amount: 300, status: "Pending", date: "13 Jul" },
  { id: 7, donor: "Meena Joshi", campaign: "Health Support", amount: 2000, status: "Rejected", date: "12 Jul" },
  { id: 8, donor: "Vikram Nair", campaign: "Education Drive", amount: 600, status: "Completed", date: "11 Jul" },
  { id: 9, donor: "Anjali Desai", campaign: "Disaster Relief", amount: 900, status: "Pending", date: "10 Jul" },
  { id: 10, donor: "Rohit Malhotra", campaign: "Food Donation", amount: 1200, status: "Completed", date: "09 Jul" },
  { id: 11, donor: "Sneha Kapoor", campaign: "Health Support", amount: 450, status: "Completed", date: "08 Jul" },
  { id: 12, donor: "Arjun Reddy", campaign: "Education Drive", amount: 1800, status: "Pending", date: "07 Jul" },
];

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

const INITIAL_NOTIFICATIONS = [
  { id: 1, text: "New donation received from Rahul Sharma", time: "5m ago", read: false },
  { id: 2, text: "Campaign 'Health Support' reached 80% of its goal", time: "1h ago", read: false },
  { id: 3, text: "3 donations pending review", time: "3h ago", read: false },
];

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

function todayLabel() {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildCsv(rows) {
  const header = ["Donor", "Campaign", "Amount", "Status", "Date"];
  const escapeCell = (cell) => `"${String(cell).replace(/"/g, '""')}"`;
  const lines = [header, ...rows.map((r) => [r.donor, r.campaign, r.amount, r.status, r.date])];
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
  const parts = name.trim().split(/\s+/);
  const initials = parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return initials.toUpperCase();
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
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

function matchesAmountRange(amount, rangeKey) {
  const range = AMOUNT_RANGE_OPTIONS.find((r) => r.key === rangeKey) ?? AMOUNT_RANGE_OPTIONS[0];
  return amount >= range.min && amount <= range.max;
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
      return (a.id - b.id) * factor;
    }
    return String(a[key]).localeCompare(String(b[key])) * factor;
  });
}

function validateDonationFields({ donor, campaign, amount, status }) {
  const errors = {};
  const trimmedDonor = donor.trim();
  const numericAmount = Number(amount);

  if (!trimmedDonor || trimmedDonor.length < 2) {
    errors.donor = "Enter a valid donor name (min 2 characters).";
  }
  if (!CAMPAIGNS.includes(campaign)) {
    errors.campaign = "Select a valid campaign.";
  }
  if (amount === "" || amount === null || amount === undefined) {
    errors.amount = "Amount is required.";
  } else if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    errors.amount = "Enter an amount greater than zero.";
  } else if (numericAmount > MAX_DONATION_AMOUNT) {
    errors.amount = `Amount cannot exceed ${formatINR(MAX_DONATION_AMOUNT)}.`;
  }
  if (!STATUS_OPTIONS.includes(status)) {
    errors.status = "Select a valid status.";
  }
  return errors;
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
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
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

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonId = useId();
  const menuId = useId();
  const navigate = useNavigate();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);
  useEscapeKey(close, open);

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
          AD
        </span>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-semibold leading-tight text-brand-dark">Admin</p>
          <p className="text-xs leading-tight text-gray-400">admin@spaceece.org</p>
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
            <p className="text-sm font-semibold text-brand-dark">Admin</p>
            <p className="text-xs text-gray-400">admin@spaceece.org</p>
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

function FilterPanel({ filters, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonId = useId();
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);
  useEscapeKey(close, open);

  const activeCount =
    (filters.status !== "All" ? 1 : 0) +
    (filters.campaign !== "All" ? 1 : 0) +
    (filters.amountRange !== "all" ? 1 : 0);

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
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => onChange({ status: option })}
                  aria-pressed={filters.status === option}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    filters.status === option
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
              value={filters.campaign}
              onChange={(event) => onChange({ campaign: event.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-brand-orange"
            >
              {CAMPAIGN_FILTER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
              Amount range
            </label>
            <select
              id="amount-filter"
              value={filters.amountRange}
              onChange={(event) => onChange({ amountRange: event.target.value })}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-brand-orange"
            >
              {AMOUNT_RANGE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
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

const DonationRow = React.memo(function DonationRow({ donation, index, isSelected, onToggleSelect, onView, onEdit, onDelete }) {
  const avatarStyle = useMemo(() => getAvatarStyle(donation.donor), [donation.donor]);

  return (
    <tr
      className={`border-b border-gray-100 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"} ${
        isSelected ? "bg-orange-50" : "hover:bg-orange-50/70"
      }`}
    >
      <td className="w-10 py-5 pl-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(donation.id)}
          aria-label={`Select donation from ${donation.donor}`}
          className="h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
        />
      </td>
      <td className="py-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarStyle.bg} ${avatarStyle.text}`}
            aria-hidden="true"
          >
            {getInitials(donation.donor)}
          </span>
          <span className="font-medium text-brand-dark">{donation.donor}</span>
        </div>
      </td>
      <td className="text-gray-600">{donation.campaign}</td>
      <td className="font-semibold text-brand-dark">{formatINR(donation.amount)}</td>
      <td>
        <StatusBadge status={donation.status} />
      </td>
      <td className="text-gray-500">{donation.date}</td>
      <td>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(donation)}
            className="rounded-lg bg-blue-50 p-2 text-blue-600 transition duration-150 hover:-translate-y-0.5 hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label={`View donation from ${donation.donor}`}
          >
            <Eye size={18} aria-hidden="true" />
          </button>
          <button
            onClick={() => onEdit(donation)}
            className="rounded-lg bg-orange-50 p-2 text-brand-orange transition duration-150 hover:-translate-y-0.5 hover:bg-orange-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
            aria-label={`Edit donation from ${donation.donor}`}
          >
            <SquarePen size={18} aria-hidden="true" />
          </button>
          <button
            onClick={() => onDelete(donation)}
            className="rounded-lg bg-red-50 p-2 text-red-600 transition duration-150 hover:-translate-y-0.5 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label={`Delete donation from ${donation.donor}`}
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
});

function BulkActionsBar({ count, onClearSelection, onBulkExport, onBulkDelete }) {
  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-brand-orange/30 bg-orange-50/80 px-5 py-3 backdrop-blur sm:flex-row sm:items-center animate-[fadeSlideIn_0.15s_ease-out]">
      <p className="text-sm font-medium text-brand-dark">
        <span className="font-semibold">{count}</span> donation{count === 1 ? "" : "s"} selected
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onBulkExport}
          className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-brand-dark shadow-sm transition hover:shadow-md"
        >
          <Download size={15} aria-hidden="true" />
          Bulk Export
        </button>
        <button
          onClick={onBulkDelete}
          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
        >
          <Trash size={15} aria-hidden="true" />
          Bulk Delete
        </button>
        <button
          onClick={onClearSelection}
          className="rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition hover:text-brand-dark"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

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

function ModalShell({ title, onClose, children, maxWidth = "max-w-md", icon: Icon, iconAccent = "bg-brand-orange/10 text-brand-orange" }) {
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
        className={`w-full ${maxWidth} rounded-3xl bg-white p-6 shadow-2xl outline-none animate-[fadeScaleIn_0.18s_ease-out]`}
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
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donation form                                                       */
/* ------------------------------------------------------------------ */

function DonationForm({ initial, onCancel, onSubmit, submitLabel }) {
  const [donor, setDonor] = useState(initial?.donor ?? "");
  const [campaign, setCampaign] = useState(initial?.campaign ?? CAMPAIGNS[0]);
  const [amount, setAmount] = useState(initial?.amount ?? "");
  const [status, setStatus] = useState(initial?.status ?? "Pending");
  const [errors, setErrors] = useState({});
  const donorErrorId = useId();
  const amountErrorId = useId();

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedDonor = donor.trim();
    const validationErrors = validateDonationFields({ donor: trimmedDonor, campaign, amount, status });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSubmit({ donor: trimmedDonor, campaign, amount: Number(amount), status });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="donor-name" className="mb-1 block text-sm font-medium text-gray-600">
          Donor Name
        </label>
        <input
          id="donor-name"
          value={donor}
          onChange={(event) => setDonor(event.target.value)}
          placeholder="e.g. Kavita Rao"
          aria-invalid={Boolean(errors.donor)}
          aria-describedby={errors.donor ? donorErrorId : undefined}
          className={`w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-brand-orange ${
            errors.donor ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.donor && (
          <p id={donorErrorId} role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle size={12} aria-hidden="true" />
            {errors.donor}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="donor-campaign" className="mb-1 block text-sm font-medium text-gray-600">
          Campaign
        </label>
        <select
          id="donor-campaign"
          value={campaign}
          onChange={(event) => setCampaign(event.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-brand-orange"
        >
          {CAMPAIGNS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="donor-amount" className="mb-1 block text-sm font-medium text-gray-600">
            Amount (₹)
          </label>
          <input
            id="donor-amount"
            type="number"
            min="1"
            max={MAX_DONATION_AMOUNT}
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="500"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? amountErrorId : undefined}
            className={`w-full rounded-xl border px-4 py-2.5 outline-none transition focus:border-brand-orange ${
              errors.amount ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.amount && (
            <p id={amountErrorId} role="alert" className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
              <AlertTriangle size={12} aria-hidden="true" />
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="donor-status" className="mb-1 block text-sm font-medium text-gray-600">
            Status
          </label>
          <select
            id="donor-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none transition focus:border-brand-orange"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl bg-gray-100 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          Cancel
        </button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  const [donations, setDonations] = useState(INITIAL_DONATIONS);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [modal, setModal] = useState({ type: null, donation: null });
  const [toast, setToast] = useState("");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
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

  /* -------------------------- derived data -------------------------- */

  const filteredDonations = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return donations.filter((d) => {
      const matchesSearch =
        !query ||
        d.donor.toLowerCase().includes(query) ||
        d.campaign.toLowerCase().includes(query) ||
        String(d.amount).includes(query) ||
        d.status.toLowerCase().includes(query);

      const matchesStatus = filters.status === "All" || d.status === filters.status;
      const matchesCampaign = filters.campaign === "All" || d.campaign === filters.campaign;
      const matchesAmount = matchesAmountRange(d.amount, filters.amountRange);

      return matchesSearch && matchesStatus && matchesCampaign && matchesAmount;
    });
  }, [donations, debouncedSearch, filters]);

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
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const uniqueDonors = new Set(donations.map((d) => d.donor)).size;
    const activeCampaigns = new Set(donations.map((d) => d.campaign)).size;
    const monthly = donations.filter((d) => d.date.includes("Jul")).reduce((sum, d) => sum + d.amount, 0);

    return [
      { title: "Total Donations", value: formatINR(totalAmount), change: "+18% this month", isPositive: true, icon: IndianRupee, accent: STAT_ACCENTS[0] },
      { title: "Total Donors", value: String(uniqueDonors), change: "+12 new donors", isPositive: true, icon: Users, accent: STAT_ACCENTS[1] },
      { title: "Active Campaigns", value: String(activeCampaigns), change: "2 added this week", isPositive: true, icon: FolderKanban, accent: STAT_ACCENTS[2] },
      { title: "Monthly Revenue", value: formatINR(monthly), change: "+9% growth", isPositive: true, icon: BarChart3, accent: STAT_ACCENTS[3] },
    ];
  }, [donations]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const selectedCount = selectedIds.size;

  /* ---------------------------- handlers ---------------------------- */

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const handleFilterChange = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters, sortConfig]);

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const allOnPageSelected =
    paginatedDonations.length > 0 && paginatedDonations.every((d) => selectedIds.has(d.id));

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const pageIds = paginatedDonations.map((d) => d.id);
      const allSelected = pageIds.length > 0 && pageIds.every((id) => next.has(id));

      pageIds.forEach((id) => {
        if (allSelected) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });
      return next;
    });
  }, [paginatedDonations]);

  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const closeModal = useCallback(() => setModal({ type: null, donation: null }), []);
  const openAddModal = useCallback(() => setModal({ type: "add", donation: null }), []);
  const openViewModal = useCallback((donation) => setModal({ type: "view", donation }), []);
  const openEditModal = useCallback((donation) => setModal({ type: "edit", donation }), []);
  const openDeleteModal = useCallback((donation) => setModal({ type: "delete", donation }), []);
  const openBulkDeleteModal = useCallback(() => setModal({ type: "bulk-delete", donation: null }), []);

  const handleAddDonation = useCallback(
    (form) => {
      const newDonation = { ...form, id: createId(), date: todayLabel() };
      setDonations((prev) => [newDonation, ...prev]);
      closeModal();
      showToast(`Donation from ${form.donor} added`);
    },
    [closeModal, showToast]
  );

  const handleEditDonation = useCallback(
    (form) => {
      setModal((current) => {
        if (current.donation) {
          setDonations((prev) =>
            prev.map((d) => (d.id === current.donation.id ? { ...d, ...form } : d))
          );
        }
        return { type: null, donation: null };
      });
      showToast(`Donation from ${form.donor} updated`);
    },
    [showToast]
  );

  const handleConfirmDelete = useCallback(() => {
    setModal((current) => {
      if (current.donation) {
        setDonations((prev) => prev.filter((d) => d.id !== current.donation.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(current.donation.id);
          return next;
        });
        showToast(`Donation from ${current.donation.donor} deleted`);
      }
      return { type: null, donation: null };
    });
  }, [showToast]);

  const handleConfirmBulkDelete = useCallback(() => {
    setDonations((prev) => prev.filter((d) => !selectedIds.has(d.id)));
    showToast(`${selectedIds.size} donation${selectedIds.size === 1 ? "" : "s"} deleted`);
    setSelectedIds(new Set());
    closeModal();
  }, [selectedIds, showToast, closeModal]);

  const handleExportCsv = useCallback(() => {
    const csvContent = buildCsv(sortedDonations);
    downloadCsv(csvContent, `donation-report-${Date.now()}.csv`);
    showToast("Report exported successfully");
  }, [sortedDonations, showToast]);

  const handleBulkExport = useCallback(() => {
    const rowsToExport = donations.filter((d) => selectedIds.has(d.id));
    downloadCsv(buildCsv(rowsToExport), `donations-selected-${Date.now()}.csv`);
    showToast(`${rowsToExport.length} donation${rowsToExport.length === 1 ? "" : "s"} exported`);
  }, [donations, selectedIds, showToast]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleMarkOneRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
              Welcome back! Monitor donations, campaigns and platform activity.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={handleMarkAllRead}
              onMarkOneRead={handleMarkOneRead}
            />
            <ProfileMenu />
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
              <h2 className="mt-1 text-2xl font-semibold text-brand-dark">Donation Management</h2>
              <p className="text-gray-500">View and manage recent donations.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                  aria-hidden="true"
                />
                <label htmlFor="donation-search" className="sr-only">
                  Search donor, campaign, amount or status
                </label>
                <input
                  id="donation-search"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search donor, campaign, amount..."
                  className="w-64 rounded-xl border border-gray-200 bg-gray-50/60 py-3 pl-11 pr-4 outline-none transition focus:border-brand-orange focus:bg-white focus:shadow-sm"
                />
              </div>

              <FilterPanel filters={filters} onChange={handleFilterChange} onClear={handleClearFilters} />

              <Button className="flex items-center gap-2" onClick={openAddModal}>
                <Plus size={18} aria-hidden="true" />
                Add Donation
              </Button>
            </div>
          </div>

          {selectedCount > 0 && (
            <BulkActionsBar
              count={selectedCount}
              onClearSelection={handleClearSelection}
              onBulkExport={handleBulkExport}
              onBulkDelete={openBulkDeleteModal}
            />
          )}

          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-full">
              <caption className="sr-only">List of recent donations</caption>
              <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
                <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th scope="col" className="w-10 py-4 pl-2">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={handleToggleSelectAll}
                      aria-label="Select all donations on this page"
                      className="h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                    />
                  </th>
                  <SortableHeader label="Donor" sortKey={SORT_KEYS.DONOR} sortConfig={sortConfig} onSort={handleSort} />
                  <th scope="col">Campaign</th>
                  <SortableHeader label="Amount" sortKey={SORT_KEYS.AMOUNT} sortConfig={sortConfig} onSort={handleSort} />
                  <th scope="col">Status</th>
                  <SortableHeader label="Date" sortKey={SORT_KEYS.DATE} sortConfig={sortConfig} onSort={handleSort} />
                  <th scope="col">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedDonations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                          <Search size={20} className="text-gray-300" aria-hidden="true" />
                        </span>
                        <p className="font-medium text-gray-500">No donations match your search or filter.</p>
                        <p className="text-sm text-gray-400">Try adjusting your filters or search term.</p>
                      </div>
                    </td>
                  </tr>
                )}

                {paginatedDonations.map((donation, index) => (
                  <DonationRow
                    key={donation.id}
                    donation={donation}
                    index={index}
                    isSelected={selectedIds.has(donation.id)}
                    onToggleSelect={handleToggleSelect}
                    onView={openViewModal}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              totalRecords={sortedDonations.length}
              onPageChange={handlePageChange}
            />

            <Button className="flex items-center gap-2" onClick={handleExportCsv}>
              <Download size={18} aria-hidden="true" />
              Export Report
            </Button>
          </div>
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

      {modal.type === "add" && (
        <ModalShell title="Add Donation" onClose={closeModal} icon={Plus} iconAccent="bg-brand-orange/10 text-brand-orange">
          <DonationForm onCancel={closeModal} onSubmit={handleAddDonation} submitLabel="Save" />
        </ModalShell>
      )}

      {modal.type === "edit" && modal.donation && (
        <ModalShell title="Edit Donation" onClose={closeModal} icon={SquarePen} iconAccent="bg-blue-50 text-blue-600">
          <DonationForm
            initial={modal.donation}
            onCancel={closeModal}
            onSubmit={handleEditDonation}
            submitLabel="Save Changes"
          />
        </ModalShell>
      )}

      {modal.type === "view" && modal.donation && (
        <ModalShell title="Donation Details" onClose={closeModal} icon={Eye} iconAccent="bg-purple-50 text-purple-600">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500">Donor</span>
              <span className="font-medium text-brand-dark">{modal.donation.donor}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500">Campaign</span>
              <span className="font-medium text-brand-dark">{modal.donation.campaign}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium text-brand-dark">{formatINR(modal.donation.amount)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500">Status</span>
              <StatusBadge status={modal.donation.status} />
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-brand-dark">{modal.donation.date}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={closeModal}>Close</Button>
          </div>
        </ModalShell>
      )}

      {modal.type === "delete" && modal.donation && (
        <ModalShell title="Delete Donation" onClose={closeModal} icon={Trash2} iconAccent="bg-red-50 text-red-600">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-7 w-7 text-red-600" aria-hidden="true" />
            </div>
            <p className="text-brand-dark">
              Are you sure you want to delete the donation from{" "}
              <span className="font-semibold">{modal.donation.donor}</span>?
            </p>
            <p className="mt-1 text-sm text-gray-500">This action cannot be undone.</p>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={closeModal}
              className="rounded-xl bg-gray-100 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Delete
            </button>
          </div>
        </ModalShell>
      )}

      {modal.type === "bulk-delete" && (
        <ModalShell title="Delete Selected Donations" onClose={closeModal} icon={Trash} iconAccent="bg-red-50 text-red-600">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-7 w-7 text-red-600" aria-hidden="true" />
            </div>
            <p className="text-brand-dark">
              Are you sure you want to delete <span className="font-semibold">{selectedIds.size}</span> selected
              donation{selectedIds.size === 1 ? "" : "s"}?
            </p>
            <p className="mt-1 text-sm text-gray-500">This action cannot be undone.</p>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={closeModal}
              className="rounded-xl bg-gray-100 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBulkDelete}
              className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Delete All
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}