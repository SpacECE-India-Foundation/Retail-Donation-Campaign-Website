import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  LogOut,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

import { Card } from "../../components/common/Card";
import { getCurrentAdmin, changePassword, logout } from "../../services/authService";

/* ------------------------------------------------------------------ */
/* Constants + utilities                                               */
/* ------------------------------------------------------------------ */

const SIDEBAR_PREF_KEY = "adminSidebarDefaultExpanded";
const TOAST_DURATION_MS = 3000;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-brand-orange focus:bg-white";

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
/* Security & Sessions section                                        */
/* ------------------------------------------------------------------ */

function SecuritySection({ admin }) {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // cookies are likely already invalid; proceed to login regardless
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={ShieldCheck}
        iconBg="bg-emerald-50"
        iconText="text-emerald-600"
        title="Security & Sessions"
        subtitle="A quick look at your account's login activity."
      />

      <div>
        <InfoRow label="Last Login" value={formatDateTime(admin.lastLogin)} />
        <InfoRow label="Password Last Changed" value={formatDateTime(admin.passwordChangedAt)} />
        <InfoRow label="Failed Login Attempts" value={String(admin.loginAttempts ?? 0)} />
        <InfoRow
          label="Account Lock"
          value={admin.lockUntil && new Date(admin.lockUntil).getTime() > Date.now() ? `Locked until ${formatDateTime(admin.lockUntil)}` : "Not locked"}
        />
      </div>

      <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <LogOut size={15} aria-hidden="true" />}
          Log Out From This Device
        </button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* App Preferences section                                             */
/* ------------------------------------------------------------------ */

function PreferencesSection({ showToast }) {
  const [sidebarDefaultExpanded, setSidebarDefaultExpanded] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_PREF_KEY);
    return stored === null ? true : stored === "true";
  });

  const handleToggle = () => {
    const next = !sidebarDefaultExpanded;
    setSidebarDefaultExpanded(next);
    localStorage.setItem(SIDEBAR_PREF_KEY, String(next));
    showToast("Preference saved");
  };

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={SlidersHorizontal}
        iconBg="bg-purple-50"
        iconText="text-purple-600"
        title="App Preferences"
        subtitle="Personalize how the admin panel behaves for you."
      />

      <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
            {sidebarDefaultExpanded ? <PanelLeft size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
          </span>
          <div>
            <p className="text-sm font-medium text-brand-dark">Sidebar starts expanded</p>
            <p className="text-xs text-gray-400">Applies the next time you open the admin panel.</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={sidebarDefaultExpanded}
          onClick={handleToggle}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${sidebarDefaultExpanded ? "bg-brand-orange" : "bg-gray-200"}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              sidebarDefaultExpanded ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Password section                                                    */
/* ------------------------------------------------------------------ */

function PasswordSection({ showToast }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const startEditing = () => {
    resetFields();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    resetFields();
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password should be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast("Password changed. Please log in again.");
      setTimeout(async () => {
        try {
          await logout();
        } catch {
          // cookies are likely already cleared server-side; ignore failures here
        }
        navigate("/admin/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to change password.");
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            icon={KeyRound}
            iconBg="bg-red-50"
            iconText="text-red-600"
            title="Change Password"
            subtitle="Update the password used to sign in to this admin account."
          />
          <button
            onClick={startEditing}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <KeyRound size={14} aria-hidden="true" />
            Change Password
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        icon={KeyRound}
        iconBg="bg-red-50"
        iconText="text-red-600"
        title="Change Password"
        subtitle="You'll be logged out after changing your password."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle size={15} aria-hidden="true" />
            {error}
          </div>
        )}

        <FormField label="Current Password">
          <input
            type="password"
            className={inputClass}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="New Password" hint="At least 8 characters">
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm New Password">
            <input
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>
        </div>

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
            className="flex items-center gap-2 rounded-xl bg-brand-dark px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <KeyRound size={15} aria-hidden="true" />}
            Change Password
          </button>
        </div>
      </form>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Toast message={toast} />

      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-orange">
          <SettingsIcon size={14} aria-hidden="true" />
          Settings
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">Settings</h1>
        <p className="mt-2 text-gray-500">Security, app preferences, and your password. Looking for your profile info? That moved to My Profile in the account menu.</p>
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
          <SecuritySection admin={admin} />
          <PreferencesSection showToast={showToast} />
          <PasswordSection showToast={showToast} />
        </>
      )}
    </div>
  );
}