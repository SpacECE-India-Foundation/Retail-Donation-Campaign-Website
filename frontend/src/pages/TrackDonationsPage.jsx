import React, { useState } from "react";
import {
  Heart,

  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  Loader2,
  Inbox,
} from "lucide-react";
import { findDonationsByEmail, updateDonation } from "../services/donationService";

const STATUS_CONFIG = {
  Verified: {
    label: "VERIFIED",
    icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "border-l-emerald-500",
  },
  Pending: {
    label: "PENDING",
    icon: Clock,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    border: "border-l-amber-500",
  },
  Rejected: {
    label: "REJECTED",
    icon: XCircle,
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    border: "border-l-rose-500",
  },
};


function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.badge}`}
    >
      <Icon className="h-3.5 w-3.5" />
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

function formatAmount(amount) {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-800">{value}</p>
    </div>
  );
}

function ExpandedDetails({ donation, onUpdate, isUpdating }) {
  const isEditable = donation.status === "REJECTED";
  const [transactionId, setTransactionId] = useState(donation.transactionId);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(donation.screenshotUrl);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasChanges =
    transactionId.trim() !== donation.transactionId || screenshotFile !== null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
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
    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Donor Name" value={donation.donorName} />
        {isEditable ? (
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Transaction ID
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <DetailField label="Transaction ID" value={donation.transactionId} />
        )}

        {donation.verificationRemarks && (
  <DetailField label="Remarks" value={donation.verificationRemarks} />
)}
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Payment Screenshot
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <img
            src={previewUrl}
            alt="Payment screenshot"
            className="h-24 w-36 rounded-lg border border-slate-200 object-cover"
          />
          {isEditable && (
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50">
                <Upload className="h-4 w-4" />
                Change File
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-1 text-xs text-slate-400">JPG, PNG (Max 5MB)</p>
            </div>
          )}
        </div>
      </div>

      {isEditable && (
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => {
              setTransactionId(donation.transactionId);
              setScreenshotFile(null);
              setPreviewUrl(donation.screenshotUrl);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!hasChanges || isUpdating}
            onClick={handleUpdateClick}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Donation
          </button>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800">
              Confirm update?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              This will update the Transaction ID and/or Payment Screenshot for
              this donation.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Go back
              </button>
              <button
                onClick={confirmUpdate}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DonationCard({ donation, isExpanded, onToggle, onUpdate, updatingId }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  return (
    <div
      className={`overflow-hidden rounded-xl border-l-4 bg-white shadow-sm transition hover:shadow-md ${cfg.border}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-3 px-5 py-4 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">
            {donation.campaign?.campaignName}
          </p>
          <p className="text-xs text-slate-400">Donation #{donation._id}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <span className="text-sm font-semibold text-slate-700">
            {formatAmount(donation.amount)}
          </span>
          <StatusBadge status={donation.status} />
          <span className="text-xs text-slate-400">
            {formatDate(donation.paymentDate)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
            View Details
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </div>
      </button>

      {isExpanded && (
        <ExpandedDetails
          donation={donation}
          onUpdate={onUpdate}
          isUpdating={updatingId === donation._id}
        />
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border-l-4 border-l-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-100" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-6 w-20 rounded-full bg-slate-100" />
          <div className="h-4 w-20 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <Inbox className="h-10 w-10 text-slate-300" />
      <p className="text-base font-semibold text-slate-700">
        No Donations Found
      </p>
      <p className="max-w-sm text-sm text-slate-400">
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
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        isError ? "bg-rose-600" : "bg-emerald-600"
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
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            <Heart className="h-7 w-7 fill-rose-500 text-rose-500" />
            Track Your Donations
          </div>
          <p className="text-sm text-slate-500">
            Find all your donations using the email used during donation.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <label className="text-sm font-medium text-slate-700">
            Email Address
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="john@gmail.com"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {status === "loading" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <Search className="h-4 w-4" />
              Find My Donations
            </button>
          </div>
          {emailError && (
            <p className="mt-2 text-xs font-medium text-rose-500">
              {emailError}
            </p>
          )}
        </form>

        {status !== "idle" && (
          <div className="mt-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
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