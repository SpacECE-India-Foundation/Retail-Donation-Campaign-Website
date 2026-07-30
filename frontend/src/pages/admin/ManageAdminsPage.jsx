import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ShieldCheck,
  UserPlus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Users,
  Trash2,
  Mail,
  Phone,
  ArrowRightLeft,
  FolderKanban,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import {
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  getAllCampaignsForTransfer,
  transferCampaignManagement,
} from "../../services/superAdminService";
import { getCurrentAdmin } from "../../services/authService";

const TOAST_DURATION_MS = 3000;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatINR(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
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

function RoleBadge({ role }) {
  const isSuper = role === "SUPER_ADMIN";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isSuper ? "bg-brand-orange/10 text-brand-orange" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isSuper && <ShieldCheck size={12} aria-hidden="true" />}
      {isSuper ? "Super Admin" : "Admin"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Create Admin form                                                   */
/* ------------------------------------------------------------------ */

function CreateAdminSection({ onCreated, showToast }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (fullName.trim().length < 3) {
      setError("Full name should be at least 3 characters.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSaving(true);
    try {
      await createAdmin({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() });
      showToast(`Admin created — temporary password emailed to ${email.trim()}`);
      setFullName("");
      setEmail("");
      setPhone("");
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create admin.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={UserPlus}
        iconBg="bg-brand-orange/10"
        iconText="text-brand-orange"
        title="Create Admin"
        subtitle="They'll receive a temporary password by email."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Full Name">
            <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </FormField>
          <FormField label="Phone" hint="10-digit mobile number">
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
          </FormField>
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <UserPlus size={15} aria-hidden="true" />}
            Create Admin
          </button>
        </div>
      </form>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Admins table — delete only (backend has no deactivate/role-change)  */
/* ------------------------------------------------------------------ */

function AdminRow({ admin, currentAdminId, onDelete, busyId }) {
  const isSelf = String(admin._id) === String(currentAdminId);
  const isBusy = busyId === admin._id;

  return (
    <tr className="border-b border-gray-50 last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium text-brand-dark">{admin.fullName}</p>
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <Mail size={11} aria-hidden="true" /> {admin.email}
        </p>
        {admin.phone && (
          <p className="flex items-center gap-1 text-xs text-gray-400">
            <Phone size={11} aria-hidden="true" /> {admin.phone}
          </p>
        )}
      </td>
      <td className="py-3 pr-4">
        <RoleBadge role={admin.role} />
      </td>
      <td className="py-3 pr-4 text-sm text-gray-400">{formatDateTime(admin.createdAt)}</td>
      <td className="py-3">
        {isSelf ? (
          <span className="text-xs italic text-gray-300">This is you</span>
        ) : (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onDelete(admin)}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isBusy ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Trash2 size={14} aria-hidden="true" />}
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}

function AdminsListSection({ admins, isLoading, currentAdminId, onDelete, busyId }) {
  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={Users}
        iconBg="bg-blue-50"
        iconText="text-blue-600"
        title="All Admins"
        subtitle={`${admins.length} admin account${admins.length === 1 ? "" : "s"}. Deleting one hands their campaigns to you.`}
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          Loading...
        </div>
      ) : admins.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No admins found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="pb-2 pr-4 font-medium">Admin</th>
                <th className="pb-2 pr-4 font-medium">Role</th>
                <th className="pb-2 pr-4 font-medium">Created</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <AdminRow key={admin._id} admin={admin} currentAdminId={currentAdminId} onDelete={onDelete} busyId={busyId} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Transfer Campaigns — pick campaigns (grouped by current owner),     */
/* pick a target admin, hand over ownership.                           */
/* ------------------------------------------------------------------ */

function TransferCampaignsSection({ campaigns, admins, isLoading, currentAdminId, onTransferred, showToast }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetAdminId, setTargetAdminId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const grouped = useMemo(() => {
    const map = {};
    campaigns.forEach((campaign) => {
      const owner = campaign.createdBy;
      const ownerId = owner?._id || "unowned";
      if (!map[ownerId]) {
        map[ownerId] = { owner, campaigns: [] };
      }
      map[ownerId].campaigns.push(campaign);
    });
    return Object.values(map);
  }, [campaigns]);

  const toggleCampaign = (campaignId) => {
    setSelectedIds((prev) =>
      prev.includes(campaignId) ? prev.filter((id) => id !== campaignId) : [...prev, campaignId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (selectedIds.length === 0) {
      setError("Select at least one campaign.");
      return;
    }
    if (!targetAdminId) {
      setError("Choose an admin to transfer ownership to.");
      return;
    }

    setIsSubmitting(true);
    try {
      await transferCampaignManagement({ campaignIds: selectedIds, adminId: targetAdminId });
      showToast(`${selectedIds.length} campaign${selectedIds.length === 1 ? "" : "s"} transferred.`);
      setSelectedIds([]);
      setTargetAdminId("");
      onTransferred();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to transfer campaigns.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={ArrowRightLeft}
        iconBg="bg-purple-50"
        iconText="text-purple-600"
        title="Transfer Campaign Management"
        subtitle="Hand ownership of one or more campaigns to a different admin."
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          Loading...
        </div>
      ) : campaigns.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">No campaigns found.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertTriangle size={15} aria-hidden="true" />
              {error}
            </div>
          )}

          <div>
            <span className="mb-2 block text-sm font-medium text-gray-600">Select Campaigns</span>
            <div className="max-h-72 space-y-4 overflow-y-auto rounded-2xl border border-gray-100 p-4">
              {grouped.map(({ owner, campaigns: ownerCampaigns }) => (
                <div key={owner?._id || "unowned"}>
                  <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <FolderKanban size={12} aria-hidden="true" />
                    Owned by {owner?.fullName || "Unassigned"}
                  </p>
                  <div className="space-y-1.5">
                    {ownerCampaigns.map((campaign) => (
                      <label
                        key={campaign._id}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm transition hover:bg-gray-50"
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(campaign._id)}
                            onChange={() => toggleCampaign(campaign._id)}
                            className="h-4 w-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                          />
                          <span className="text-brand-dark">{campaign.campaignName}</span>
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatINR(campaign.campaignRaisedAmt)} / {formatINR(campaign.campaignGoalAmt)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <FormField label="Assign To">
            <select
              className={inputClass}
              value={targetAdminId}
              onChange={(e) => setTargetAdminId(e.target.value)}
            >
              <option value="">Select an admin...</option>
              {admins
                .filter((admin) => String(admin._id) !== String(currentAdminId))
                .map((admin) => (
                  <option key={admin._id} value={admin._id}>
                    {admin.fullName} ({admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"})
                  </option>
                ))}
              <option value={currentAdminId}>Myself (Super Admin)</option>
            </select>
          </FormField>

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRightLeft size={15} aria-hidden="true" />
              )}
              Transfer Management
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState({ message: "", isError: false });
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast({ message: "", isError: false }), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const loadAdmins = useCallback(async () => {
    setIsLoadingAdmins(true);
    setFetchError("");
    try {
      const response = await getAllAdmins();
      setAdmins(response.data?.data?.admins ?? []);
    } catch (err) {
      setFetchError(err?.response?.data?.message || "Failed to load admins.");
    } finally {
      setIsLoadingAdmins(false);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    setIsLoadingCampaigns(true);
    try {
      const response = await getAllCampaignsForTransfer();
      setCampaigns(response.data?.data?.campaigns ?? []);
    } catch {
      setCampaigns([]);
    } finally {
      setIsLoadingCampaigns(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
    loadCampaigns();
    getCurrentAdmin()
      .then((res) => setCurrentAdminId(res.data?.data?.admin?._id ?? null))
      .catch(() => {});
  }, [loadAdmins, loadCampaigns]);

  const handleDelete = async (admin) => {
    if (!window.confirm(`Delete ${admin.fullName}? Their campaigns will be transferred to you.`)) {
      return;
    }
    setBusyId(admin._id);
    try {
      await deleteAdmin(admin._id);
      showToast(`${admin.fullName} deleted. Their campaigns are now yours.`);
      loadAdmins();
      loadCampaigns();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to delete admin.", true);
    } finally {
      setBusyId(null);
    }
  };

  const handleTransferred = () => {
    loadCampaigns();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Toast message={toast.message} isError={toast.isError} />

      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange">
          <ShieldCheck size={14} aria-hidden="true" />
          Super Admin
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">Manage Admins</h1>
        <p className="mt-2 text-gray-500">Create admins, remove access, and reassign campaign ownership.</p>
      </div>

      <CreateAdminSection onCreated={loadAdmins} showToast={showToast} />

      {fetchError ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <AlertTriangle className="text-red-400" size={26} aria-hidden="true" />
          <p className="font-medium text-gray-600">{fetchError}</p>
          <button onClick={loadAdmins} className="rounded-xl bg-brand-orange px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Retry
          </button>
        </div>
      ) : (
        <AdminsListSection
          admins={admins}
          isLoading={isLoadingAdmins}
          currentAdminId={currentAdminId}
          onDelete={handleDelete}
          busyId={busyId}
        />
      )}

      <TransferCampaignsSection
        campaigns={campaigns}
        admins={admins}
        isLoading={isLoadingCampaigns}
        currentAdminId={currentAdminId}
        onTransferred={handleTransferred}
        showToast={showToast}
      />
    </div>
  );
}