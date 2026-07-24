import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  UserCircle,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Save,
  Pencil,
  IdCard,
  BadgeCheck,
  BadgeX,
  FolderKanban,
  ClipboardCheck,
  ArrowRight,
  Zap,
  ChevronDown,
  Crop,
  Trash2,
  Check,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import { getCurrentAdmin, updateAdminProfile } from "../../services/authService";
import { fetchAdminCampaigns } from "../../services/campaignService";

/* ------------------------------------------------------------------ */
/* Constants + utilities                                               */
/* ------------------------------------------------------------------ */

const TOAST_DURATION_MS = 3000;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white";

// Just resizes for a smaller download — no cropping, no auto-zoom. c_limit only
// scales the image down if it's bigger than size x size; it never cuts any of the
// photo off, so whatever the admin uploaded shows exactly as they framed it. Freshly
// selected local files (blob: URLs from URL.createObjectURL) aren't Cloudinary URLs, so
// this leaves those untouched and only applies to already-uploaded photos.
function getAvatarUrl(url, size = 200) {
  if (!url) return url;
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const insertAt = idx + marker.length;
  return `${url.slice(0, insertAt)}w_${size},h_${size},c_limit/${url.slice(insertAt)}`;
}

function getInitials(name) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const initials = parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return initials.toUpperCase();
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

function FormField({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-brand-dark">{value}</span>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-6 top-6 z-[70] flex items-center gap-2 rounded-2xl border border-white/10 bg-brand-dark/95 px-5 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur"
    >
      <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Photo actions menu — "Change Photo" now opens Upload / Adjust /     */
/* Remove instead of immediately opening a file picker.                */
/* ------------------------------------------------------------------ */

function PhotoActionsMenu({ onUploadNew, onAdjust, onRemove, hasPhoto }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        <Upload size={15} aria-hidden="true" />
        Change Photo
        <ChevronDown size={14} className="text-gray-400" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onUploadNew();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <Upload size={14} aria-hidden="true" />
            Upload New Photo
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onAdjust();
            }}
            disabled={!hasPhoto}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Crop size={14} aria-hidden="true" />
            Adjust Photo
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onRemove();
            }}
            disabled={!hasPhoto}
            className="flex w-full items-center gap-3 border-t border-gray-50 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={14} aria-hidden="true" />
            Remove Photo
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Photo adjust modal — drag to reposition, slider to zoom, then bakes */
/* the crop into a real image (canvas) instead of relying on CSS, so   */
/* the framing the admin picks is exactly what gets uploaded.          */
/* ------------------------------------------------------------------ */

const CROP_VIEWPORT_SIZE = 280;
const CROP_OUTPUT_SIZE = 500;

function PhotoAdjustModal({ sourceUrl, onCancel, onApply }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const imgRef = useRef(null);
  const dragRef = useRef(null);

  const baseScale = naturalSize ? CROP_VIEWPORT_SIZE / Math.min(naturalSize.width, naturalSize.height) : 1;
  const displayScale = baseScale * zoom;
  const displayWidth = naturalSize ? naturalSize.width * displayScale : CROP_VIEWPORT_SIZE;
  const displayHeight = naturalSize ? naturalSize.height * displayScale : CROP_VIEWPORT_SIZE;
  const maxOffsetX = Math.max(0, (displayWidth - CROP_VIEWPORT_SIZE) / 2);
  const maxOffsetY = Math.max(0, (displayHeight - CROP_VIEWPORT_SIZE) / 2);

  const clampOffset = useCallback(
    (x, y) => ({
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, x)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, y)),
    }),
    [maxOffsetX, maxOffsetY]
  );

  useEffect(() => {
    setOffset((prev) => clampOffset(prev.x, prev.y));
  }, [clampOffset]);

  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event) => {
    event.preventDefault();
    dragRef.current = { startX: event.clientX, startY: event.clientY, startOffset: offset };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    setOffset(clampOffset(dragRef.current.startOffset.x + dx, dragRef.current.startOffset.y + dy));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleApply = () => {
    if (!naturalSize || !imgRef.current) return;
    setIsSaving(true);
    try {
      // Step 1 — reproduce the exact on-screen framing (same left/top/width/height
      // math as the <img> style below) onto a canvas the same size as the viewport.
      // Using the destination-only drawImage(img, x, y, w, h) form here is
      // deliberate: it always draws the WHOLE source image scaled into that
      // rectangle, with no ambiguity about what happens at the edges. The
      // previous version asked drawImage to also crop a *source* rectangle
      // (drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)), and whenever that
      // source rectangle extended past the photo's actual pixel bounds (which
      // happens any time you zoom out below "fill"), the browser silently
      // clipped and rescaled it — producing a smaller, off-proportion result
      // that didn't match what the guide showed. Filling white first also
      // avoids transparent regions turning black when exported as JPEG.
      const viewportCanvas = document.createElement("canvas");
      viewportCanvas.width = CROP_VIEWPORT_SIZE;
      viewportCanvas.height = CROP_VIEWPORT_SIZE;
      const vctx = viewportCanvas.getContext("2d");
      vctx.fillStyle = "#ffffff";
      vctx.fillRect(0, 0, CROP_VIEWPORT_SIZE, CROP_VIEWPORT_SIZE);

      const topLeftX = (CROP_VIEWPORT_SIZE - displayWidth) / 2 + offset.x;
      const topLeftY = (CROP_VIEWPORT_SIZE - displayHeight) / 2 + offset.y;
      vctx.drawImage(imgRef.current, topLeftX, topLeftY, displayWidth, displayHeight);

      // Step 2 — scale that exact composition up to the final output size.
      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = CROP_OUTPUT_SIZE;
      outputCanvas.height = CROP_OUTPUT_SIZE;
      const octx = outputCanvas.getContext("2d");
      octx.drawImage(viewportCanvas, 0, 0, CROP_VIEWPORT_SIZE, CROP_VIEWPORT_SIZE, 0, 0, CROP_OUTPUT_SIZE, CROP_OUTPUT_SIZE);

      outputCanvas.toBlob(
        (blob) => {
          setIsSaving(false);
          if (blob) onApply(blob);
        },
        "image/jpeg",
        0.92
      );
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="mb-1 text-lg font-semibold text-brand-dark">Adjust Photo</h3>
        <p className="mb-4 text-sm text-gray-400">
          Drag to reposition, use the slider to zoom in or out. The circle shows what will actually be visible.
        </p>

        <div
          className="relative mx-auto touch-none select-none overflow-hidden rounded-2xl bg-gray-100"
          style={{ width: CROP_VIEWPORT_SIZE, height: CROP_VIEWPORT_SIZE, cursor: "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <img
            ref={imgRef}
            src={sourceUrl}
            alt="Adjust preview"
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              position: "absolute",
              left: `${(CROP_VIEWPORT_SIZE - displayWidth) / 2 + offset.x}px`,
              top: `${(CROP_VIEWPORT_SIZE - displayHeight) / 2 + offset.y}px`,
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
              maxWidth: "none",
            }}
          />
          {/* Circular guide — dims everything outside the circle so it's clear what
              will actually show once this photo is used as a round avatar. Purely
              visual, doesn't affect the exported crop. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 0 0 9999px rgba(17,17,17,0.55)" }}
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-gray-400">Zoom out</span>
          <input
            type="range"
            min="0.4"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-gray-400">Zoom in</span>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!naturalSize || isSaving}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Check size={15} aria-hidden="true" />}
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile section — moved here from SettingsPage.jsx                  */
/* ------------------------------------------------------------------ */

function ProfileSection({ admin, onUpdated, showToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(admin.fullName ?? "");
  const [phone, setPhone] = useState(admin.phone ?? "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(admin.profileImage ?? "");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [cropSource, setCropSource] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  const startEditing = () => {
    // re-sync editable fields to the current admin values each time editing opens,
    // so a previous cancel (or a save elsewhere) is always reflected correctly
    setFullName(admin.fullName ?? "");
    setPhone(admin.phone ?? "");
    setImageFile(null);
    setImagePreview(admin.profileImage ?? "");
    setRemovePhoto(false);
    setCropSource(null);
    setError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setError("");
    setIsEditing(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Every photo goes through Adjust before it's committed — that's what
    // guarantees the circular-guide preview and the actual saved image always
    // match. Committing a raw upload directly used to let Cloudinary's own
    // face-detection crop pick a different framing than what was shown here.
    setCropSource(URL.createObjectURL(file));
    // allow selecting the exact same file again later without this being a no-op
    event.target.value = "";
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview("");
    setRemovePhoto(true);
  };

  const handleCropApplied = (blob) => {
    const file = new File([blob], "avatar.jpg", { type: blob.type || "image/jpeg" });
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemovePhoto(false);
    setCropSource(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (fullName.trim().length < 3) {
      setError("Full name should be at least 3 characters.");
      return;
    }
    if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = { fullName: fullName.trim(), phone: phone.trim() };
      if (imageFile) {
        payload.profileImage = imageFile;
      } else if (removePhoto) {
        payload.removeProfileImage = true;
      }
      const response = await updateAdminProfile(payload);
      showToast("Profile updated successfully");
      onUpdated(response.data?.data);
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={UserCircle}
            iconBg="bg-brand-orange/10"
            iconText="text-brand-orange"
            title="Profile"
            subtitle="Your name, phone, and profile photo."
          />
          <button
            onClick={startEditing}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Pencil size={14} aria-hidden="true" />
            Edit Profile
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {admin.profileImage ? (
              <img src={getAvatarUrl(admin.profileImage, 200)} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-gray-400">{getInitials(admin.fullName)}</span>
            )}
          </div>
          <div className="w-full space-y-1 text-center sm:text-left">
            <InfoRow label="Full Name" value={admin.fullName || "—"} />
            <InfoRow label="Email" value={admin.email || "—"} />
            <InfoRow label="Phone" value={admin.phone || "Not added yet"} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={UserCircle}
        iconBg="bg-brand-orange/10"
        iconText="text-brand-orange"
        title="Edit Profile"
        subtitle="Update your name, phone, and profile photo."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
            {imagePreview ? (
              <img src={getAvatarUrl(imagePreview, 160)} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-gray-400">{getInitials(fullName)}</span>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <PhotoActionsMenu
            hasPhoto={Boolean(imagePreview)}
            onUploadNew={() => fileInputRef.current?.click()}
            onAdjust={() => setCropSource(imagePreview)}
            onRemove={handleRemovePhoto}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full Name">
            <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </FormField>
          <FormField label="Email" hint="Email can't be changed here">
            <input className={`${inputClass} cursor-not-allowed opacity-60`} value={admin.email ?? ""} disabled />
          </FormField>
        </div>

        <FormField label="Phone" hint="10-digit mobile number, optional">
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
        </FormField>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={cancelEditing}
            disabled={isSaving}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
            Save Changes
          </button>
        </div>
      </form>
    </Card>
    {cropSource && (
      <PhotoAdjustModal sourceUrl={cropSource} onCancel={() => setCropSource(null)} onApply={handleCropApplied} />
    )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Account Overview section — moved here from SettingsPage.jsx         */
/* ------------------------------------------------------------------ */

function AccountOverviewSection({ admin }) {
  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={IdCard}
        iconBg="bg-blue-50"
        iconText="text-blue-600"
        title="Account Overview"
        subtitle="Basic details about this admin account."
      />

      <div>
        <InfoRow label="Admin ID" value={admin._id ?? "—"} />
        <InfoRow label="Account Created" value={formatDateTime(admin.createdAt)} />
        <InfoRow
          label="Verification Status"
          value={
            admin.isVerified ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <BadgeCheck size={14} aria-hidden="true" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600">
                <BadgeX size={14} aria-hidden="true" /> Not Verified
              </span>
            )
          }
        />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Campaign stats section — derived from this admin's own campaigns,   */
/* no separate endpoint needed since fetchAdminCampaigns is already    */
/* scoped to campaigns createdBy this admin.                           */
/* ------------------------------------------------------------------ */

function formatINR(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

function CampaignStatsSection({ campaigns, isLoading }) {
  const stats = useMemo(() => {
    const count = campaigns.length;
    const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.campaignRaisedAmt ?? 0), 0);
    const activeCount = campaigns.filter((c) => c.campaignStatus === "Active").length;
    return { count, totalRaised, activeCount };
  }, [campaigns]);

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={FolderKanban}
        iconBg="bg-purple-50"
        iconText="text-purple-600"
        title="Your Campaigns"
        subtitle="A quick look at what you've created."
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-gray-400">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-brand-dark">{stats.count}</p>
            <p className="mt-1 text-xs text-gray-400">Campaigns Created</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-brand-dark">{stats.activeCount}</p>
            <p className="mt-1 text-xs text-gray-400">Currently Active</p>
          </div>
          <div className="rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-brand-dark">{formatINR(stats.totalRaised)}</p>
            <p className="mt-1 text-xs text-gray-400">Total Raised</p>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Quick links section                                                 */
/* ------------------------------------------------------------------ */

function QuickLinksSection() {
  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={Zap}
        iconBg="bg-amber-50"
        iconText="text-amber-600"
        title="Quick Links"
        subtitle="Jump back into your work."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/admin/campaigns"
          className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition hover:border-brand-orange/40 hover:bg-orange-50/60"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <FolderKanban size={16} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-brand-dark">Your Campaigns</span>
          </span>
          <ArrowRight size={15} className="text-gray-400" aria-hidden="true" />
        </Link>
        <Link
          to="/admin/verification-queue"
          className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 transition hover:border-brand-orange/40 hover:bg-orange-50/60"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ClipboardCheck size={16} aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-brand-dark">Pending Verifications</span>
          </span>
          <ArrowRight size={15} className="text-gray-400" aria-hidden="true" />
        </Link>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function MyProfilePage() {
  const [admin, setAdmin] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const loadAdmin = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const response = await getCurrentAdmin();
      setAdmin(response.data?.data?.admin ?? null);
    } catch (err) {
      setFetchError(err?.response?.data?.message || "Failed to load your profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    setIsLoadingCampaigns(true);
    try {
      const response = await fetchAdminCampaigns();
      setCampaigns(response.data?.data?.campaigns ?? []);
    } catch {
      // backend returns an error when the admin simply has zero campaigns yet —
      // same pattern used on CampaignsPage.jsx, treat as an empty state
      setCampaigns([]);
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    loadAdmin();
    loadCampaigns();
  }, [loadAdmin, loadCampaigns]);

  const handleProfileUpdated = useCallback((updated) => {
    if (updated) {
      setAdmin((prev) => ({ ...prev, ...updated }));
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Toast message={toast} />

      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange">
          <UserCircle size={14} aria-hidden="true" />
          My Profile
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">My Profile</h1>
        <p className="mt-2 text-gray-500">Your admin identity — name, photo, and account details.</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-400">
          <Loader2 size={20} className="animate-spin" aria-hidden="true" />
          Loading...
        </div>
      )}

      {!isLoading && fetchError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="text-red-400" size={28} aria-hidden="true" />
          <p className="font-medium text-gray-600">{fetchError}</p>
          <button onClick={loadAdmin} className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !fetchError && admin && (
        <>
          <ProfileSection admin={admin} onUpdated={handleProfileUpdated} showToast={showToast} />
          <CampaignStatsSection campaigns={campaigns} isLoading={isLoadingCampaigns} />
          <QuickLinksSection />
          <AccountOverviewSection admin={admin} />
        </>
      )}
    </div>
  );
}