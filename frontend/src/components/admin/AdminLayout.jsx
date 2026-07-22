import { useState, useEffect, useRef, useCallback, useId } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  History,
  FolderKanban,
  BarChart3,
  Settings,
  LogOut,
  UserCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HandHeart,
} from "lucide-react";

import { logout, getCurrentAdmin } from "../../services/authService";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/verification-queue", label: "Verification Queue", icon: ClipboardCheck },
  { to: "/admin/donation-history", label: "Donation History", icon: History },
  { to: "/admin/campaigns", label: "Campaigns", icon: FolderKanban },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

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

function getInitials(name) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const initials = parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return initials.toUpperCase();
}

function ProfileMenu({ adminName, adminEmail, collapsed }) {
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
        title={collapsed ? displayName : undefined}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center rounded-xl py-2.5 text-left transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange ${
          collapsed ? "justify-center px-0" : "gap-3 px-3"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-orange to-orange-400 text-sm font-bold text-white shadow-inner">
          {getInitials(displayName)}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight text-brand-dark">{displayName}</p>
              <p className="truncate text-xs leading-tight text-gray-400">{displayEmail}</p>
            </span>
            <ChevronDown size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
          </>
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          className={`absolute z-20 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl ${
            collapsed ? "bottom-0 left-full ml-2" : "bottom-full left-0 mb-2 w-full min-w-[14rem]"
          }`}
        >
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

const SIDEBAR_PREF_KEY = "adminSidebarDefaultExpanded";

export default function AdminLayout() {
  const [adminProfile, setAdminProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // respects the "Sidebar starts expanded" preference set on the Settings page
    const stored = localStorage.getItem(SIDEBAR_PREF_KEY);
    return stored === null ? true : stored === "true";
  });

  useEffect(() => {
    let cancelled = false;
    getCurrentAdmin()
      .then((response) => {
        if (!cancelled) setAdminProfile(response.data?.data?.admin ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-cream">
      {/* Sidebar — fixed in place, never scrolls with the page. Collapses to an icon-only rail. */}
      <aside
        className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-gray-100 bg-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div
          className={`flex items-center border-b border-gray-100 py-6 ${
            sidebarOpen ? "gap-3 px-5" : "justify-center px-2"
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
            <HandHeart size={20} aria-hidden="true" />
          </span>
          {sidebarOpen && (
            <div>
              <p className="text-sm font-bold leading-tight text-brand-dark">Donation</p>
              <p className="text-sm font-bold leading-tight text-brand-dark">Management</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={sidebarOpen ? undefined : label}
              className={({ isActive }) =>
                `flex items-center rounded-xl py-2.5 text-sm font-medium transition ${
                  sidebarOpen ? "gap-3 px-3" : "justify-center px-0"
                } ${
                  isActive
                    ? "bg-brand-orange text-white shadow-sm"
                    : "text-gray-600 hover:bg-orange-50 hover:text-brand-dark"
                }`
              }
            >
              <Icon size={18} className="shrink-0" aria-hidden="true" />
              {sidebarOpen && label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <ProfileMenu
            adminName={adminProfile?.fullName}
            adminEmail={adminProfile?.email}
            collapsed={!sidebarOpen}
          />
        </div>
      </aside>

      {/* Toggle tab — sits on the sidebar/content border, slides with it */}
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        className={`fixed top-0 z-30 flex h-screen w-6 items-center justify-center border-r border-gray-100 bg-white text-brand-dark transition-all duration-300 ease-in-out hover:bg-orange-50 ${
          sidebarOpen ? "left-64" : "left-20"
        }`}
      >
        {sidebarOpen ? <ChevronLeft size={22} aria-hidden="true" /> : <ChevronRight size={22} aria-hidden="true" />}
      </button>

      {/* Main content — this is the only part that scrolls */}
      <main className="h-full min-w-0 flex-1 overflow-y-auto p-4 pl-9 sm:p-6 sm:pl-11 lg:p-8 lg:pl-14">
        <Outlet />
      </main>
    </div>
  );
}