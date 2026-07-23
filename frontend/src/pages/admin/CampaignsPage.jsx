import React, { useState, useMemo, useCallback, useEffect, useRef, useId } from "react";
import {
  Plus,
  Pencil,
  Eye,
  Image as ImageIcon,
  X,
  Loader2,
  AlertTriangle,
  Calendar,
  Target,
  Users,
  Upload,
  Info,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import {
  fetchAdminCampaigns,
  fetchCampaignDetail,
  createCampaign,
  updateCampaign,
  updateCampaignImage,
} from "../../services/campaignService";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  Active: "bg-emerald-100 text-emerald-700",
  inActive: "bg-gray-100 text-gray-600",
  Upcoming: "bg-blue-100 text-blue-700",
  Completed: "bg-purple-100 text-purple-700",
};

const TOAST_DURATION_MS = 2500;

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function formatINR(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function tomorrowInputValue() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Shared hooks (duplicated locally, matching existing project convention) */
/* ------------------------------------------------------------------ */

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
      {status ?? "Unknown"}
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

function ModalShell({ title, onClose, children, maxWidth = "max-w-2xl", icon: Icon, iconAccent = "bg-brand-orange/10 text-brand-orange" }) {
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
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white";

/* ------------------------------------------------------------------ */
/* Campaign card                                                       */
/* ------------------------------------------------------------------ */

const CampaignCard = React.memo(function CampaignCard({ campaign, onEdit, onView, onChangeBanner }) {
  const goal = Number(campaign.campaignGoalAmt ?? 0);
  const raised = Number(campaign.campaignRaisedAmt ?? 0);
  const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <Card className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-40 w-full bg-gray-100">
        {campaign.campaignBanner?.url ? (
          <img src={campaign.campaignBanner.url} alt={campaign.campaignName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ImageIcon size={32} aria-hidden="true" />
          </div>
        )}
        <button
          onClick={() => onChangeBanner(campaign)}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/75"
        >
          <ImageIcon size={13} aria-hidden="true" />
          Change Banner
        </button>
        <span className="absolute left-3 top-3">
          <StatusBadge status={campaign.campaignStatus} />
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-brand-dark">{campaign.campaignName}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-500">{campaign.campaignDescription}</p>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-brand-dark">{formatINR(raised)}</span>
            <span className="text-gray-400">of {formatINR(goal)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-brand-orange transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Users size={13} aria-hidden="true" />
            {campaign.contributors ?? 0} contributors
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={13} aria-hidden="true" />
            {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
          </span>
        </div>

        <div className="flex gap-2 border-t border-gray-100 pt-4">
          <button
            onClick={() => onView(campaign)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200"
          >
            <Eye size={15} aria-hidden="true" />
            View
          </button>
          <button
            onClick={() => onEdit(campaign)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-orange/10 px-3 py-2 text-sm font-medium text-brand-orange transition hover:bg-brand-orange/20"
          >
            <Pencil size={15} aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    </Card>
  );
});

/* ------------------------------------------------------------------ */
/* Create campaign modal                                              */
/* ------------------------------------------------------------------ */

function CreateCampaignModal({ onClose, onCreated, showToast }) {
  const [form, setForm] = useState({
    campaignName: "",
    campaignDescription: "",
    startDate: "",
    endDate: "",
    campaignGoalAmount: "",
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.campaignName.trim() || !form.campaignDescription.trim()) {
      setError("Campaign name and description are required.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError("Start and end dates are required.");
      return;
    }
    if (new Date(form.endDate).getTime() <= new Date(form.startDate).getTime()) {
      setError("End date must be after the start date.");
      return;
    }
    if (!form.campaignGoalAmount || Number(form.campaignGoalAmount) <= 0) {
      setError("Please enter a valid goal amount.");
      return;
    }
    if (!bannerFile) {
      setError("Campaign banner image is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCampaign({ ...form, campaignBanner: bannerFile });
      showToast("Campaign created successfully");
      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell title="New Campaign" onClose={onClose} icon={Plus}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}

        <FormField label="Campaign Name">
          <input
            className={inputClass}
            value={form.campaignName}
            onChange={(e) => updateField("campaignName", e.target.value)}
            placeholder="e.g. Education Drive"
          />
        </FormField>

        <FormField label="Description">
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={form.campaignDescription}
            onChange={(e) => updateField("campaignDescription", e.target.value)}
            placeholder="What is this campaign for?"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date" hint="Must be a future date">
            <input
              type="date"
              className={inputClass}
              min={tomorrowInputValue()}
              value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
            />
          </FormField>
          <FormField label="End Date">
            <input
              type="date"
              className={inputClass}
              min={form.startDate || tomorrowInputValue()}
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Goal Amount (₹)">
          <input
            type="number"
            min="1"
            className={inputClass}
            value={form.campaignGoalAmount}
            onChange={(e) => updateField("campaignGoalAmount", e.target.value)}
            placeholder="500000"
          />
        </FormField>

        <FormField label="Campaign Banner">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-200 bg-gray-50">
              {bannerPreview ? (
                <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={22} className="text-gray-300" aria-hidden="true" />
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
              <Upload size={15} aria-hidden="true" />
              Choose Image
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        </FormField>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
            Create Campaign
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Edit campaign modal                                                 */
/* ------------------------------------------------------------------ */

function EditCampaignModal({ campaign, onClose, onUpdated, showToast }) {
  const isLocked = campaign.campaignStatus === "Active";
  const [form, setForm] = useState({
    campaignName: campaign.campaignName ?? "",
    campaignDescription: campaign.campaignDescription ?? "",
    campaignGoalAmount: campaign.campaignGoalAmt ?? "",
    startDate: toDateInputValue(campaign.startDate),
    endDate: toDateInputValue(campaign.endDate),
    campaignStatus: ["Active", "inActive"].includes(campaign.campaignStatus) ? campaign.campaignStatus : "Active",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.campaignName.trim().length < 3) {
      setError("Campaign name should be at least 3 characters.");
      return;
    }
    if (form.campaignDescription.trim().length < 20) {
      setError("Campaign description should be at least 20 characters.");
      return;
    }
    if (!form.campaignGoalAmount || Number(form.campaignGoalAmount) <= 0) {
      setError("Please enter a valid goal amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        campaignName: form.campaignName.trim(),
        campaignDescription: form.campaignDescription.trim(),
        campaignGoalAmount: form.campaignGoalAmount,
        endDate: form.endDate,
        campaignStatus: form.campaignStatus,
      };
      if (!isLocked) {
        payload.startDate = form.startDate;
      }
      await updateCampaign(campaign._id, payload);
      showToast("Campaign updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell title="Edit Campaign" onClose={onClose} icon={Pencil}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}

        <FormField label="Campaign Name">
          <input className={inputClass} value={form.campaignName} onChange={(e) => updateField("campaignName", e.target.value)} />
        </FormField>

        <FormField label="Description">
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={form.campaignDescription}
            onChange={(e) => updateField("campaignDescription", e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date" hint={isLocked ? "Locked — campaign is Active" : undefined}>
            <input
              type="date"
              disabled={isLocked}
              className={`${inputClass} ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
              value={form.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
            />
          </FormField>
          <FormField label="End Date">
            <input
              type="date"
              className={inputClass}
              min={form.startDate || undefined}
              value={form.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Goal Amount (₹)">
            <input
              type="number"
              min="1"
              className={inputClass}
              value={form.campaignGoalAmount}
              onChange={(e) => updateField("campaignGoalAmount", e.target.value)}
            />
          </FormField>
          <FormField label="Status" hint="Only Active / Inactive can be set manually">
            <select className={inputClass} value={form.campaignStatus} onChange={(e) => updateField("campaignStatus", e.target.value)}>
              <option value="Active">Active</option>
              <option value="inActive">Inactive</option>
            </select>
          </FormField>
        </div>

        {!["Active", "inActive"].includes(campaign.campaignStatus) && (
          <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            Current status is "{campaign.campaignStatus}". Saving will set it to whatever you pick above.
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Pencil size={15} aria-hidden="true" />}
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Change banner modal                                                 */
/* ------------------------------------------------------------------ */

function ChangeBannerModal({ campaign, onClose, onUpdated, showToast }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(campaign.campaignBanner?.url ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Please choose a new image first.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateCampaignImage(campaign._id, file);
      showToast("Banner updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell title="Change Campaign Banner" onClose={onClose} icon={ImageIcon} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}
        <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-200 bg-gray-50">
          {preview ? (
            <img src={preview} alt="Banner preview" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={28} className="text-gray-300" aria-hidden="true" />
          )}
        </div>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
          <Upload size={15} aria-hidden="true" />
          Choose New Image
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Upload size={15} aria-hidden="true" />}
            Upload
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* View details modal                                                  */
/* ------------------------------------------------------------------ */

function ViewCampaignModal({ campaignId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");
    fetchCampaignDetail(campaignId)
      .then((response) => {
        if (!cancelled) setDetail(response.data?.data ?? null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load campaign details.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const campaign = detail?.campaign;
  const milestones = detail?.milestones ?? [];

  return (
    <ModalShell title="Campaign Details" onClose={onClose} icon={FolderKanban} iconAccent="bg-blue-50 text-blue-600" maxWidth="max-w-2xl">
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
          <Loader2 size={20} className="animate-spin" aria-hidden="true" />
          Loading...
        </div>
      )}
      {!isLoading && error && (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-gray-500">
          <AlertTriangle className="text-red-400" size={24} aria-hidden="true" />
          {error}
        </div>
      )}
      {!isLoading && !error && campaign && (
        <div className="space-y-5">
          {campaign.campaignBanner?.url && (
            <img src={campaign.campaignBanner.url} alt={campaign.campaignName} className="h-40 w-full rounded-xl object-cover" />
          )}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-brand-dark">{campaign.campaignName}</h4>
            <StatusBadge status={campaign.campaignStatus} />
          </div>
          <p className="text-sm text-gray-500">{campaign.campaignDescription}</p>

          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 p-4 text-sm sm:grid-cols-4">
            <div>
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <Target size={12} aria-hidden="true" /> Goal
              </p>
              <p className="font-semibold text-brand-dark">{formatINR(campaign.campaignGoalAmt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Raised</p>
              <p className="font-semibold text-brand-dark">{formatINR(campaign.campaignRaisedAmt)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <Users size={12} aria-hidden="true" /> Contributors
              </p>
              <p className="font-semibold text-brand-dark">{campaign.contributors ?? 0}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={12} aria-hidden="true" /> Duration
              </p>
              <p className="font-semibold text-brand-dark">
                {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-brand-dark">Milestones</p>
            {milestones.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                No milestones added for this campaign yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {milestones.map((milestone, index) => (
                  <li key={milestone._id ?? index} className="flex items-center justify-between rounded-xl border border-gray-100 p-3 text-sm">
                    <span className="font-medium text-brand-dark">
                      {milestone.title ?? milestone.milestoneName ?? milestone.name ?? `Milestone ${index + 1}`}
                    </span>
                    {(milestone.targetAmount ?? milestone.amount) !== undefined && (
                      <span className="text-gray-500">{formatINR(milestone.targetAmount ?? milestone.amount)}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [bannerCampaign, setBannerCampaign] = useState(null);
  const [viewingCampaignId, setViewingCampaignId] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const loadCampaigns = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const response = await fetchAdminCampaigns();
      setCampaigns(response.data?.data?.campaigns ?? []);
    } catch (error) {
      // backend returns an error when the admin simply has zero campaigns yet —
      // treat that as an empty state instead of a real failure
      const message = error?.response?.data?.message || "";
      if (message.toLowerCase().includes("no campaigns")) {
        setCampaigns([]);
      } else {
        setFetchError(message || "Failed to load campaigns.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.96) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Toast message={toast} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange">
            <FolderKanban size={14} aria-hidden="true" />
            Campaigns
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">Campaigns</h1>
          <p className="mt-2 text-gray-500">Manage the fundraising campaigns you've created.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 self-start rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={16} aria-hidden="true" />
          New Campaign
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" aria-hidden="true" />
          Loading campaigns...
        </div>
      )}

      {!isLoading && fetchError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="text-red-400" size={28} aria-hidden="true" />
          <p className="font-medium text-gray-600">{fetchError}</p>
          <button onClick={loadCampaigns} className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !fetchError && campaigns.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-gray-200 py-20 text-center">
          <FolderKanban size={32} className="text-gray-300" aria-hidden="true" />
          <p className="font-medium text-gray-500">You haven't created any campaigns yet.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus size={15} aria-hidden="true" />
            Create your first campaign
          </button>
        </div>
      )}

      {!isLoading && !fetchError && campaigns.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign._id}
              campaign={campaign}
              onEdit={setEditingCampaign}
              onView={(c) => setViewingCampaignId(c._id)}
              onChangeBanner={setBannerCampaign}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCampaignModal onClose={() => setShowCreateModal(false)} onCreated={loadCampaigns} showToast={showToast} />
      )}

      {editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onUpdated={loadCampaigns}
          showToast={showToast}
        />
      )}

      {bannerCampaign && (
        <ChangeBannerModal
          campaign={bannerCampaign}
          onClose={() => setBannerCampaign(null)}
          onUpdated={loadCampaigns}
          showToast={showToast}
        />
      )}

      {viewingCampaignId && <ViewCampaignModal campaignId={viewingCampaignId} onClose={() => setViewingCampaignId(null)} />}
    </div>
  );
}