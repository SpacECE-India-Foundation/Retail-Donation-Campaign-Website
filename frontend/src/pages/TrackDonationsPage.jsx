import React, { useState, useEffect } from "react";
import {
  Heart,
  Search,
  Mail,
  Lock,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Inbox,
  User,
  CreditCard,
  Hash,
  MessageSquare,
  ImagePlus,
  ImageOff,
  IndianRupee,
  CalendarDays,
  ClipboardList,
  Maximize2,
  X,
  GraduationCap,
  BookOpen,
  Gift,
  Users,
} from "lucide-react";
import { findDonationsByEmail, updateDonation } from "../services/donationService";
import { Button } from "../components/common/Button";
import { cn } from "../utils/cn";

const STATUS_CONFIG = {
  Verified: {
    label: "VERIFIED",
    icon: CheckCircle2,
    badge: "bg-green-50 text-green-700 ring-1 ring-green-200",
    accent: "border-l-green-500",
    dot: "bg-green-100 text-green-600",
  },
  Pending: {
    label: "PENDING",
    icon: Clock,
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    accent: "border-l-amber-500",
    dot: "bg-amber-100 text-amber-600",
  },
  Rejected: {
    label: "REJECTED",
    icon: XCircle,
    badge: "bg-red-50 text-red-700 ring-1 ring-red-200",
    accent: "border-l-red-500",
    dot: "bg-red-100 text-red-600",
  },
};

// Purely presentational — a small set of icon + color combinations used to
// visually distinguish donation cards, deterministically chosen from data
// that already exists on the donation (no new fields, nothing invented).
const CATEGORY_VISUALS = [
  { icon: GraduationCap, chip: "bg-green-50 text-green-600" },
  { icon: BookOpen, chip: "bg-amber-50 text-amber-600" },
  { icon: Gift, chip: "bg-green-50 text-green-600" },
  { icon: Users, chip: "bg-red-50 text-red-600" },
];

function hashString(value) {
  let hash = 0;
  const str = String(value ?? "");
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getCategoryVisual(donation) {
  const seed = donation.campaign?.campaignName || donation._id;
  return CATEGORY_VISUALS[hashString(seed) % CATEGORY_VISUALS.length];
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide ${cfg.badge}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart}, ${timePart}`;
}

function formatAmount(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** A single labelled row used inside the grouped information panels below. */
function InfoRow({ icon: Icon, label, value, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
          {label}
        </p>
        {children ?? (
          <p className="mt-0.5 break-words text-sm font-semibold text-brand-dark">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

/** Small section wrapper used to group related information rows. Stretches to fill its
 * grid row and distributes its rows evenly across that height, instead of clumping at
 * the top and leaving dead space when a sibling card in the same row is taller. */
function InfoSection({ icon: Icon, accentClassName = "text-brand-orange", title, children }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-brand-border/60 bg-white/70 p-6 sm:p-7">
      <div className="mb-5 flex shrink-0 items-center gap-2">
        <Icon size={16} className={`shrink-0 ${accentClassName}`} aria-hidden="true" />
        <h4 className={`text-xs font-bold uppercase tracking-wide leading-snug ${accentClassName}`}>
          {title}
        </h4>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-6">{children}</div>
    </div>
  );
}

/** Fullscreen preview of the payment screenshot — closes on ESC, backdrop click, or the close button. */
function ScreenshotLightbox({ src, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Payment screenshot preview"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-dark/70 p-4 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <div className="relative max-h-[85vh] w-full max-w-2xl animate-[scaleIn_0.2s_ease-out]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close image preview"
          className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-dark shadow-lg transition-transform duration-200 hover:scale-110"
        >
          <X size={18} aria-hidden="true" />
        </button>
        <img
          src={src}
          alt="Payment screenshot full preview"
          className="max-h-[85vh] w-full rounded-2xl bg-white object-contain shadow-2xl"
        />
      </div>
    </div>
  );
}

/** Screenshot preview area — shows the image with a proper aspect ratio, or a clean empty state if none exists / it fails to load. */
function ScreenshotPreview({ url, onOpen }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  if (!url || hasError) {
    return (
      <div className="mt-3 flex h-32 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand-border bg-brand-cream/40 text-center">
        <ImageOff size={20} className="text-brand-muted" aria-hidden="true" />
        <p className="px-4 text-xs font-medium text-brand-muted">
          No screenshot available
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open full payment screenshot"
      className="group mt-3 block w-full overflow-hidden rounded-xl border border-brand-border bg-brand-cream/40"
    >
      <img
        src={url}
        alt="Payment screenshot"
        onError={() => setHasError(true)}
        className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </button>
  );
}

function ExpandedDetails({ donation, donorEmail, onUpdate, isUpdating }) {
  const isEditable = donation.status === "Rejected";
  const [transactionId, setTransactionId] = useState(donation.transactionId);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(donation.screenshotUrl);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const statusCfg = STATUS_CONFIG[donation.status] || STATUS_CONFIG.Pending;
  const StatusIcon = statusCfg.icon;

  const hasChanges =
    transactionId.trim() !== donation.transactionId || screenshotFile !== null;

  // Screenshot upload/replace is only ever allowed once a donation has been
  // rejected. Pending and Verified donations are always view-only, even if
  // no screenshot exists yet.
  const canAddScreenshot = isEditable;

  const applyFile = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Please upload a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }
    setScreenshotFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    applyFile(e.target.files?.[0] ?? null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    applyFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleUpdateClick = () => {
    if (!transactionId.trim()) {
      alert("Transaction ID cannot be empty.");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmUpdate = () => {
    setConfirmOpen(false);
    onUpdate(donation._id, { transactionId: transactionId.trim(), screenshotFile });
  };

  return (
    <div className="border-t border-brand-border/60 bg-brand-cream/50 px-6 py-7 sm:px-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Donor Information */}
        <InfoSection icon={User} accentClassName="text-green-600" title="Donor Information">
          <InfoRow icon={User} label="Donor Name" value={donation.donorName} />
          {donorEmail && <InfoRow icon={Mail} label="Email" value={donorEmail} />}
        </InfoSection>

        {/* Donation Details */}
        <InfoSection icon={Heart} accentClassName="text-brand-orange" title="Donation Details">
          <InfoRow
            icon={Heart}
            label="Campaign"
            value={donation.campaign?.campaignName ?? "—"}
          />
          <InfoRow
            icon={IndianRupee}
            label="Amount"
            value={formatAmount(donation.amount)}
          />
          <InfoRow
            icon={CalendarDays}
            label="Payment Date"
            value={formatDate(donation.paymentDate)}
          />
        </InfoSection>

        {/* Payment Information */}
        <InfoSection icon={CreditCard} accentClassName="text-purple-600" title="Payment Information">
          <InfoRow icon={Hash} label="Transaction ID">
            {isEditable ? (
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm text-brand-dark outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
              />
            ) : (
              <p className="mt-0.5 break-words text-sm font-semibold text-brand-dark">
                {donation.transactionId}
              </p>
            )}
          </InfoRow>

          {donation.verificationRemarks && (
            <InfoRow
              icon={MessageSquare}
              label="Remarks"
              value={donation.verificationRemarks}
            />
          )}
        </InfoSection>

        {/* Payment Screenshot */}
        <div className="flex h-full flex-col rounded-2xl border border-brand-border/60 bg-white/70 p-6 sm:p-7">
          <div className="mb-5 flex shrink-0 items-center gap-2">
            <ImagePlus size={16} className="shrink-0 text-blue-600" aria-hidden="true" />
            <h4 className="text-xs font-bold uppercase tracking-wide leading-snug text-blue-600">
              Payment Screenshot
            </h4>
          </div>

          <div className="rounded-xl border border-brand-border/70 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-brand-dark">Payment</p>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${statusCfg.dot}`}
              >
                <StatusIcon size={13} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold text-brand-dark">
              {formatAmount(donation.amount)}
            </p>
            <p className="mt-0.5 text-xs text-brand-muted">
              {formatDateTime(donation.paymentDate)}
            </p>

            <ScreenshotPreview url={previewUrl} onOpen={() => setIsLightboxOpen(true)} />

            {previewUrl && (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange transition-colors duration-200 hover:text-brand-orange/80"
              >
                <Maximize2 size={12} aria-hidden="true" />
                View Full Image
              </button>
            )}
          </div>

          {canAddScreenshot && (
            <div className="mt-4">
              <label
                htmlFor={`screenshot-upload-${donation._id}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200",
                  isDragging
                    ? "scale-[1.01] border-brand-orange bg-brand-orange/10"
                    : "border-brand-orange/30 bg-brand-orange/5 hover:border-brand-orange/50 hover:bg-brand-orange/10"
                )}
              >
                <Upload className="h-5 w-5 text-brand-orange" aria-hidden="true" />
                <span className="text-sm font-semibold text-brand-orange">
                  {isDragging
                    ? "Drop to add screenshot"
                    : donation.screenshotUrl
                      ? "Change Screenshot"
                      : "Add Screenshot"}
                </span>
                <span className="text-xs text-brand-muted">
                  Drag & drop or click to browse · JPG, PNG (Max 5MB)
                </span>
                <input
                  id={`screenshot-upload-${donation._id}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {canAddScreenshot && (
        <div className="mt-6 flex flex-col-reverse justify-end gap-3 border-t border-brand-border/60 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setTransactionId(donation.transactionId);
              setScreenshotFile(null);
              setPreviewUrl(donation.screenshotUrl);
            }}
            className="rounded-full border border-brand-border px-5 py-2.5 text-sm font-semibold text-brand-dark transition-colors duration-200 hover:bg-brand-border/20"
          >
            Cancel
          </button>
          <Button
            type="button"
            disabled={!hasChanges || isUpdating}
            isLoading={isUpdating}
            onClick={handleUpdateClick}
            className="shadow-md shadow-brand-orange/20 hover:shadow-lg hover:shadow-brand-orange/30"
          >
            Update Donation
          </Button>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-brand-dark">
              Confirm update?
            </h3>
            <p className="mt-2 text-sm text-brand-muted">
              This will update the Transaction ID and/or Payment Screenshot for
              this donation.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold text-brand-dark transition-colors duration-200 hover:bg-brand-border/20"
              >
                Go back
              </button>
              <Button onClick={confirmUpdate}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {isLightboxOpen && previewUrl && (
        <ScreenshotLightbox src={previewUrl} onClose={() => setIsLightboxOpen(false)} />
      )}
    </div>
  );
}

function DonationCard({ donation, donorEmail, isExpanded, onToggle, onUpdate, updatingId }) {
  const cfg = STATUS_CONFIG[donation.status] || STATUS_CONFIG.Pending;
  const visual = getCategoryVisual(donation);
  const CategoryIcon = visual.icon;

  return (
    <div
      className={`overflow-hidden rounded-[20px] border-y border-r border-brand-border/60 border-l-4 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${cfg.accent}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full flex-col gap-4 px-6 py-6 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${visual.chip}`}
          >
            <CategoryIcon size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-brand-dark">
              {donation.campaign?.campaignName}
            </p>
            <p className="mt-0.5 truncate text-xs text-brand-muted">
              Donation ID: #{donation._id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="text-xl font-extrabold tracking-tight text-brand-dark">
            {formatAmount(donation.amount)}
          </span>
          <StatusBadge status={donation.status} />
          <span className="text-xs text-brand-muted">
            {formatDate(donation.paymentDate)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-orange">
            View Details
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </span>
        </div>
      </button>

      {isExpanded && (
        <ExpandedDetails
          donation={donation}
          donorEmail={donorEmail}
          onUpdate={onUpdate}
          isUpdating={updatingId === donation._id}
        />
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-[20px] border border-brand-border/60 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-brand-border/50" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded-full bg-brand-border/60" />
            <div className="h-3 w-24 rounded-full bg-brand-border/40" />
          </div>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <div className="h-4 w-16 rounded-full bg-brand-border/60" />
          <div className="h-6 w-20 rounded-full bg-brand-border/40" />
          <div className="h-4 w-20 rounded-full bg-brand-border/40" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-brand-border bg-white px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/10">
        <Inbox className="h-7 w-7 text-brand-orange" aria-hidden="true" />
      </span>
      <p className="text-base font-bold text-brand-dark">No Donations Found</p>
      <p className="max-w-sm text-sm text-brand-muted">
        We couldn't find any donation associated with this email address.
      </p>
    </div>
  );
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-xl ${
        isError ? "bg-red-600" : "bg-green-600"
      }`}
      onAnimationEnd={onClose}
    >
      {toast.message}
    </div>
  );
}

export default function TrackDonationsPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [donations, setDonations] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    setStatus("loading");
    setExpandedId(null);
    try {
      const results = await findDonationsByEmail(email);
      setDonations(results);
      setStatus("done");
    } catch {
      setStatus("done");
      setToast({ type: "error", message: "Couldn't fetch donations. Try again." });
    }
  };

  const handleUpdate = async (id, payload) => {
    setUpdatingId(id);
    try {
      const res = await updateDonation(id, payload);
      setDonations((prev) =>
        prev.map((d) =>
          d._id === id
            ? {
                ...d,
                transactionId: payload.transactionId,
              }
            : d
        )
      );

      setToast({ type: "success", message: "Donation updated successfully." });
    } catch {
      setToast({ type: "error", message: "Update failed. Please try again." });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-brand-orange/[0.07] via-brand-cream to-brand-cream px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
    >
      <div className="mx-auto max-w-4xl">
        <div className="relative text-center">
          {/* Decorative background accents — purely visual, no layout impact */}
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            {/* Layer 2: large blurred orange glow behind the hero illustration */}
            <div
              className="absolute -right-10 -top-16 h-72 w-72 rounded-full sm:h-80 sm:w-80"
              style={{
                backgroundColor: "#E8741A",
                opacity: 0.1,
                filter: "blur(60px)",
              }}
            />

            {/* Layer 3: thin decorative curved lines — left + bottom-right */}
            <svg
              className="absolute -left-6 bottom-2 h-28 w-28 sm:h-36 sm:w-36"
              viewBox="0 0 100 100"
              fill="none"
            >
              <path d="M96,96 A90,90 0 0 1 4,4" stroke="#F6C7A5" strokeWidth="1.5" opacity="0.5" />
            </svg>
            <svg
              className="absolute -right-4 bottom-0 h-24 w-24 sm:h-32 sm:w-32"
              viewBox="0 0 100 100"
              fill="none"
            >
              <path d="M4,60 A80,80 0 0 0 60,4" stroke="#F6C7A5" strokeWidth="1.5" opacity="0.5" />
            </svg>

            {/* Layer 4: subtle dot-grid patterns — top-left + bottom-left */}
            <div
              className="absolute -left-4 top-0 h-24 w-24 opacity-60 sm:h-32 sm:w-32"
              style={{
                backgroundImage: "radial-gradient(#F2C7A8 1px, transparent 1px)",
                backgroundSize: "14px 14px",
                maskImage: "radial-gradient(circle, black, transparent 70%)",
                WebkitMaskImage: "radial-gradient(circle, black, transparent 70%)",
              }}
            />
            <div
              className="absolute -left-4 bottom-0 h-32 w-32 opacity-60 sm:h-40 sm:w-40"
              style={{
                backgroundImage: "radial-gradient(#F2C7A8 1px, transparent 1px)",
                backgroundSize: "14px 14px",
                maskImage: "radial-gradient(circle, black, transparent 70%)",
                WebkitMaskImage: "radial-gradient(circle, black, transparent 70%)",
              }}
            />

            {/* Layer 5: tiny floating hearts scattered across the hero backdrop */}
            <svg className="absolute left-1/4 top-2 h-3 w-3 text-brand-orange/25" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,21 C12,21 3,14.5 3,8.5 C3,5 5.5,3 8.5,3 C10.2,3 11.5,3.8 12,5 C12.5,3.8 13.8,3 15.5,3 C18.5,3 21,5 21,8.5 C21,14.5 12,21 12,21 Z" />
            </svg>
            <svg className="absolute right-1/3 top-16 h-2.5 w-2.5 text-brand-orange/20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,21 C12,21 3,14.5 3,8.5 C3,5 5.5,3 8.5,3 C10.2,3 11.5,3.8 12,5 C12.5,3.8 13.8,3 15.5,3 C18.5,3 21,5 21,8.5 C21,14.5 12,21 12,21 Z" />
            </svg>
            <svg className="absolute bottom-16 left-10 h-3.5 w-3.5 text-brand-orange/15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,21 C12,21 3,14.5 3,8.5 C3,5 5.5,3 8.5,3 C10.2,3 11.5,3.8 12,5 C12.5,3.8 13.8,3 15.5,3 C18.5,3 21,5 21,8.5 C21,14.5 12,21 12,21 Z" />
            </svg>
            <svg className="absolute bottom-4 right-1/4 h-2 w-2 text-brand-orange/20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,21 C12,21 3,14.5 3,8.5 C3,5 5.5,3 8.5,3 C10.2,3 11.5,3.8 12,5 C12.5,3.8 13.8,3 15.5,3 C18.5,3 21,5 21,8.5 C21,14.5 12,21 12,21 Z" />
            </svg>

            {/* right hand + heart illustration — hand-authored inline SVG, no icon library used */}
            <div className="absolute -right-2 -top-8 hidden h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange/20 via-brand-orange/8 to-transparent sm:flex lg:-right-6 lg:h-48 lg:w-48">
              <svg viewBox="0 0 200 200" className="h-32 w-32 lg:h-36 lg:w-36">
                {/* small floating hearts */}
                <g transform="rotate(-15 34 50)" fill="none" stroke="var(--color-brand-orange)" strokeWidth="2" strokeLinejoin="round" opacity="0.35">
                  <path d="M34,45 C31,40 24,40 24,48 C24,55 34,63 34,63 C34,63 44,55 44,48 C44,40 37,40 34,45 Z" />
                </g>
                <g transform="rotate(12 172 135)" fill="none" stroke="var(--color-brand-orange)" strokeWidth="2" strokeLinejoin="round" opacity="0.3">
                  <path d="M172,130 C169,125 162,125 162,133 C162,140 172,148 172,148 C172,148 182,140 182,133 C182,125 175,125 172,130 Z" />
                </g>

                {/* open hand, line-art */}
                <g fill="none" stroke="var(--color-brand-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
                  <g transform="translate(100,150) rotate(-32)">
                    <rect x="-7" y="-62" width="14" height="55" rx="7" />
                  </g>
                  <g transform="translate(100,150) rotate(-16)">
                    <rect x="-7" y="-72" width="14" height="65" rx="7" />
                  </g>
                  <g transform="translate(100,150) rotate(0)">
                    <rect x="-7" y="-76" width="14" height="70" rx="7" />
                  </g>
                  <g transform="translate(100,150) rotate(16)">
                    <rect x="-7" y="-72" width="14" height="65" rx="7" />
                  </g>
                  <g transform="translate(100,150) rotate(32)">
                    <rect x="-7" y="-62" width="14" height="55" rx="7" />
                  </g>
                  <path d="M55,150 Q100,190 145,150 L145,118 Q100,95 55,118 Z" />
                </g>

                {/* solid heart hovering above the palm */}
                <path
                  d="M100,72 C93,60 74,60 74,80 C74,98 100,118 100,118 C100,118 126,98 126,80 C126,60 107,60 100,72 Z"
                  fill="var(--color-brand-orange)"
                  opacity="0.9"
                />
              </svg>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-orange">
            <Heart size={12} aria-hidden="true" />
            Transparency • Trust • Impact
          </span>

          <h1 className="mt-4 font-display text-3xl font-bold text-brand-dark sm:text-4xl lg:text-5xl">
            Track Your Donations
          </h1>
          <p className="mt-3 text-sm text-brand-muted sm:text-base">
            Find all your donations using the email used during donation.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-8 rounded-[20px] border border-brand-border/60 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(26,26,26,0.15)]"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-orange/10">
              <Mail className="h-6 w-6 text-brand-orange" aria-hidden="true" />
            </span>

            <div className="min-w-0 flex-1">
              <label htmlFor="track-email" className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Email Address
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="track-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="john@gmail.com"
                  className="flex-1 rounded-2xl border border-brand-border bg-white px-4 py-3.5 text-sm text-brand-dark outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
                />
                <Button
                  type="submit"
                  size="lg"
                  isLoading={status === "loading"}
                  disabled={status === "loading"}
                  className="gap-2 shadow-md shadow-brand-orange/20 hover:shadow-lg hover:shadow-brand-orange/30 sm:w-auto"
                >
                  {status !== "loading" && <Search className="h-4 w-4" aria-hidden="true" />}
                  Find My Donations
                </Button>
              </div>
              {emailError && (
                <p className="mt-2 text-xs font-semibold text-brand-danger">
                  {emailError}
                </p>
              )}
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-brand-muted">
            <Lock size={12} aria-hidden="true" />
            We respect your privacy. Your data is safe with us.
          </p>
        </form>

        {status !== "idle" && (
          <div className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-muted">
              <ClipboardList size={14} className="text-brand-orange" aria-hidden="true" />
              Donation History
            </h2>

            {status === "loading" && (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            )}

            {status === "done" && donations.length === 0 && <EmptyState />}

            {status === "done" && donations.length > 0 && (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    donorEmail={email}
                    isExpanded={expandedId === donation._id}
                    onToggle={() =>
                      setExpandedId((prev) =>
                        prev === donation._id ? null : donation._id
                      )
                    }
                    onUpdate={handleUpdate}
                    updatingId={updatingId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
