import { useState, useEffect, useRef, useId, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Image as ImageIcon,
  Pencil,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Upload,
  Info,
  X,
  CheckCircle2,
  GripVertical,
} from "lucide-react";

// Reused as-is from the public site (Priya's design) — do NOT restyle these.
// The admin-only controls (edit/upload/add/delete) are layered around them below.
import CampaignOverview from "../../components/common/donation/CampaignOverview";
import CampaignMilestones from "../../components/common/donation/CampaignMilestones";
import DonationHeroBanner from "../../components/common/donation/DonationHeroBanner";

import { Card } from "../../components/common/Card";
import {
  fetchCampaignDetail,
  updateCampaign,
  updateCampaignImage,
  normalizeCampaign,
  calculateCampaignStats,
  normalizeMilestone,
  withMilestoneProgress,
} from "../../services/campaignService";
import { addMilestone, updateMilestone, deleteMilestone } from "../../services/milestoneService";

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

function formatINR(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* Shared hooks / shell (duplicated locally, matching existing project convention) */
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

function ModalShell({ title, onClose, children, maxWidth = "max-w-lg", icon: Icon, iconAccent = "bg-brand-orange/10 text-brand-orange" }) {
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
/* Edit campaign details modal                                         */
/* ------------------------------------------------------------------ */

function EditDetailsModal({ campaign, onClose, onUpdated, showToast }) {
  const [form, setForm] = useState({
    campaignName: campaign.campaignName ?? "",
    campaignDescription: campaign.campaignDescription ?? "",
    startDate: toDateInputValue(campaign.startDate),
    endDate: toDateInputValue(campaign.endDate),
    campaignGoalAmount: campaign.campaignGoalAmt ?? "",
    campaignStatus: ["Active", "inActive"].includes(campaign.campaignStatus) ? campaign.campaignStatus : "Active",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startDateLocked = campaign.campaignStatus === "Active";

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await updateCampaign(campaign._id, {
        campaignName: form.campaignName.trim(),
        campaignDescription: form.campaignDescription.trim(),
        campaignGoalAmount: Number(form.campaignGoalAmount),
        startDate: form.startDate,
        endDate: form.endDate,
        campaignStatus: form.campaignStatus,
      });
      showToast("Campaign details updated");
      onUpdated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell title="Edit Campaign Details" onClose={onClose} icon={Pencil} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}
        <FormField label="Campaign Name">
          <input className={inputClass} value={form.campaignName} onChange={(e) => updateField("campaignName", e.target.value)} required />
        </FormField>
        <FormField label="Description">
          <textarea
            rows={3}
            className={inputClass}
            value={form.campaignDescription}
            onChange={(e) => updateField("campaignDescription", e.target.value)}
            required
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date" hint={startDateLocked ? "Locked while campaign is Active" : undefined}>
            <input
              type="date"
              className={inputClass}
              value={form.startDate}
              disabled={startDateLocked}
              onChange={(e) => updateField("startDate", e.target.value)}
            />
          </FormField>
          <FormField label="End Date">
            <input type="date" className={inputClass} value={form.endDate} onChange={(e) => updateField("endDate", e.target.value)} />
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
/* Change cover image modal                                            */
/* ------------------------------------------------------------------ */

function ChangeCoverModal({ campaign, onClose, onUpdated, showToast }) {
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
      showToast("Cover image updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update cover image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell title="Change Cover Image" onClose={onClose} icon={ImageIcon}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}
        <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-200 bg-gray-50">
          {preview ? (
            <img src={preview} alt="Cover preview" className="h-full w-full object-cover" />
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
/* Add / edit milestone modal                                         */
/* ------------------------------------------------------------------ */

function MilestoneFormModal({ mode, campaign, milestone, milestoneCount, onClose, onSaved, showToast }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    milestoneTitle: milestone?.milestoneTitle ?? "",
    description: milestone?.description ?? "",
    targetAmount: milestone?.targetAmount ?? "",
    displayOrder: milestone?.displayOrder ?? milestoneCount + 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateMilestone(campaign._id, milestone._id, {
          milestoneTitle: form.milestoneTitle.trim(),
          description: form.description.trim(),
          targetAmount: Number(form.targetAmount),
          displayOrder: Number(form.displayOrder),
        });
        showToast("Milestone updated");
      } else {
        await addMilestone(campaign._id, {
          milestoneTitle: form.milestoneTitle.trim(),
          description: form.description.trim(),
          targetAmount: Number(form.targetAmount),
          displayOrder: Number(form.displayOrder),
          mileStoneImage: imageFile ?? undefined,
        });
        showToast("Milestone added");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${isEdit ? "update" : "add"} milestone.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell title={isEdit ? "Edit Milestone" : "Add Milestone"} onClose={onClose} icon={isEdit ? Pencil : Plus} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}
        <FormField label="Milestone Title">
          <input
            className={inputClass}
            value={form.milestoneTitle}
            onChange={(e) => updateField("milestoneTitle", e.target.value)}
            required
            minLength={3}
          />
        </FormField>
        <FormField label="Description" hint="At least 10 characters">
          <textarea
            rows={3}
            className={inputClass}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
            minLength={10}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Target Amount (₹)">
            <input
              type="number"
              min="1"
              className={inputClass}
              value={form.targetAmount}
              onChange={(e) => updateField("targetAmount", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Display Order" hint={isEdit ? `1 to ${milestoneCount}` : undefined}>
            <input
              type="number"
              min="1"
              className={inputClass}
              value={form.displayOrder}
              onChange={(e) => updateField("displayOrder", e.target.value)}
              required
            />
          </FormField>
        </div>
        {!isEdit && (
          <FormField label="Milestone Image (optional)">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
              <Upload size={15} aria-hidden="true" />
              {imageFile ? imageFile.name : "Choose Image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </label>
          </FormField>
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
            {isSubmitting ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={15} aria-hidden="true" />}
            {isEdit ? "Save Changes" : "Add Milestone"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Delete milestone confirm modal                                      */
/* ------------------------------------------------------------------ */

function DeleteMilestoneModal({ campaign, milestone, onClose, onDeleted, showToast }) {
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);
    try {
      await deleteMilestone(campaign._id, milestone._id);
      showToast("Milestone deleted");
      onDeleted();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete milestone.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ModalShell title="Delete Milestone" onClose={onClose} icon={Trash2} iconAccent="bg-red-50 text-red-600" maxWidth="max-w-md">
      <div className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}
        <p className="text-sm text-gray-600">
          Delete <span className="font-semibold text-brand-dark">{milestone.milestoneTitle}</span>? Milestones after it will shift up to fill
          the gap. This can't be undone.
        </p>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Trash2 size={15} aria-hidden="true" />}
            Delete
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/* Admin milestone manager panel                                       */
/* ------------------------------------------------------------------ */

function MilestoneManagerPanel({ campaign, milestones, onAdd, onEdit, onDelete }) {
  const goal = Number(campaign.campaignGoalAmt ?? 0);
  const sorted = [...milestones].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin Controls</p>
          <h2 className="mt-1 text-xl font-semibold text-brand-dark">Manage Milestones</h2>
          {/* Each milestone's target is an absolute checkpoint on total raised (not a
              slice of the goal), so there's no "unallocated budget" concept anymore —
              just show the goal for reference. */}
          <p className="mt-1 text-xs text-gray-400">Campaign goal: {formatINR(goal)}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus size={15} aria-hidden="true" />
          Add Milestone
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-6 text-center text-sm text-gray-500">
          No milestones created for this campaign yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((milestone) => (
            <li
              key={milestone._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3 transition hover:border-brand-orange/30"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                  <GripVertical size={14} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-brand-dark">{milestone.milestoneTitle}</p>
                  <p className="text-xs text-gray-400">
                    Order {milestone.displayOrder} · Target {formatINR(milestone.targetAmount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(milestone)}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
                >
                  <Pencil size={12} aria-hidden="true" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(milestone)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={12} aria-hidden="true" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function AdminCampaignDetailPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [rawCampaign, setRawCampaign] = useState(null);
  const [rawMilestones, setRawMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const [showEditDetails, setShowEditDetails] = useState(false);
  const [showChangeCover, setShowChangeCover] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [deletingMilestone, setDeletingMilestone] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2500);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const response = await fetchCampaignDetail(campaignId);
      const data = response.data?.data ?? {};
      setRawCampaign(data.campaign ?? null);
      setRawMilestones(data.milestones ?? []);
      if (!data.campaign) setFetchError("Campaign not found.");
    } catch (err) {
      setFetchError(err?.response?.data?.message || "Failed to load campaign.");
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // normalizeCampaign already handles the admin raw shape (campaignBanner.url,
  // campaignGoalAmt, campaignDescription, etc.) — same normalization the public
  // page uses, so this stays in sync with whatever campaignService does elsewhere.
  const displayCampaign = useMemo(() => (rawCampaign ? normalizeCampaign(rawCampaign) : null), [rawCampaign]);
  const stats = useMemo(() => (displayCampaign ? calculateCampaignStats(displayCampaign) : null), [displayCampaign]);
  // withMilestoneProgress overlays a live raisedAmount per milestone (fully covered for
  // completed ones, partial overflow for the current one) so the timeline shows real
  // progress instead of sitting at 0% until it snaps to 100%.
  const displayMilestones = useMemo(
    () => withMilestoneProgress((rawMilestones ?? []).map(normalizeMilestone), stats?.raised ?? 0),
    [rawMilestones, stats],
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: displayCampaign?.campaignName || "Campaign", url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      /* user cancelled share */
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-gray-400">
        <Loader2 size={20} className="animate-spin" aria-hidden="true" />
        Loading campaign...
      </div>
    );
  }

  if (fetchError || !rawCampaign) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <AlertTriangle className="text-red-400" size={28} aria-hidden="true" />
        <p className="font-medium text-gray-600">{fetchError || "Campaign not found."}</p>
        <button onClick={() => navigate("/admin/campaigns")} className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-4">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.96) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Toast message={toast} />

      {/* Admin-only action bar — sits above the reused public design, doesn't touch it */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-sm">
        <Link
          to="/admin/campaigns"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-brand-dark"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to Campaigns
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowChangeCover(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-200"
          >
            <ImageIcon size={14} aria-hidden="true" />
            Change Cover Image
          </button>
          <button
            onClick={() => setShowEditDetails(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-orange/10 px-3.5 py-2 text-sm font-medium text-brand-orange transition hover:bg-brand-orange/20"
          >
            <Pencil size={14} aria-hidden="true" />
            Edit Details
          </button>
        </div>
      </div>

      {/* Everything below this line reuses Priya's public campaign-detail visual design as-is */}
      <DonationHeroBanner
        campaign={displayCampaign}
        stats={stats}
        onDonateClick={() => navigate(`/donate/${displayCampaign.campaignId}`)}
        onShare={handleShare}
        breadcrumbHomeHref="/admin"
        breadcrumbHomeLabel="Dashboard"
        breadcrumbListHref="/admin/campaigns"
        breadcrumbListLabel="Campaigns"
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-12 sm:px-6 lg:px-8">
        <CampaignOverview stats={stats} />

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-brand-border/70 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(26,26,26,0.1)] sm:p-6 lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-brand-dark">About This Campaign</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-brand-muted sm:text-base">
              {displayCampaign.description || "No description is available for this campaign."}
            </p>
          </div>

          <aside className="rounded-2xl border border-brand-border/70 bg-white p-5 shadow-[0_4px_20px_-8px_rgba(26,26,26,0.1)] sm:p-6">
            <h2 className="font-display text-xl font-bold text-brand-dark">Campaign Details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="rounded-xl bg-brand-cream/70 px-4 py-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Status</dt>
                <dd className="mt-1 font-semibold text-brand-dark">{displayCampaign.status || "Not available"}</dd>
              </div>
            </dl>
          </aside>
        </section>

        <CampaignMilestones milestones={displayMilestones} />

        <MilestoneManagerPanel
          campaign={rawCampaign}
          milestones={rawMilestones}
          onAdd={() => setShowAddMilestone(true)}
          onEdit={setEditingMilestone}
          onDelete={setDeletingMilestone}
        />
      </div>

      {showEditDetails && (
        <EditDetailsModal campaign={rawCampaign} onClose={() => setShowEditDetails(false)} onUpdated={loadDetail} showToast={showToast} />
      )}

      {showChangeCover && (
        <ChangeCoverModal campaign={rawCampaign} onClose={() => setShowChangeCover(false)} onUpdated={loadDetail} showToast={showToast} />
      )}

      {showAddMilestone && (
        <MilestoneFormModal
          mode="add"
          campaign={rawCampaign}
          milestoneCount={rawMilestones.length}
          onClose={() => setShowAddMilestone(false)}
          onSaved={loadDetail}
          showToast={showToast}
        />
      )}

      {editingMilestone && (
        <MilestoneFormModal
          mode="edit"
          campaign={rawCampaign}
          milestone={editingMilestone}
          milestoneCount={rawMilestones.length}
          onClose={() => setEditingMilestone(null)}
          onSaved={loadDetail}
          showToast={showToast}
        />
      )}

      {deletingMilestone && (
        <DeleteMilestoneModal
          campaign={rawCampaign}
          milestone={deletingMilestone}
          onClose={() => setDeletingMilestone(null)}
          onDeleted={loadDetail}
          showToast={showToast}
        />
      )}
    </div>
  );
}