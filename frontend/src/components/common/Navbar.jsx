import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HandHeart, Menu, X } from "lucide-react";
import { Button } from "./Button";

export const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Mission", path: "/about" },
    { name: "Solutions", path: "/solution" },
    { name: "Impact", path: "/impact" },
    { name: "Campaign", path: "/campaign" },
    { name: "Achievements", path: "/achievements" },
    { name: "Founders", path: "/founders" },
    { name: "Documents", path: "/documents" },
  ];

  return (
    <div className="fixed inset-x-0 top-0 z-50 w-full px-3 pt-3 lg:px-6 lg:pt-4">
      <nav
        className="mx-auto max-w-[1300px] overflow-hidden rounded-[1.75rem] backdrop-blur-xl backdrop-saturate-150 transition-shadow"
        style={{
          background: "rgba(255,255,255,0.45)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 8px 32px -12px rgba(0,0,0,0.12)",
        }}
      >
      <div className="mx-auto flex h-[68px] max-w-[1300px] items-center justify-between px-5 lg:px-7">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
            style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-teal))" }}
          >
            <HandHeart size={20} aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[17px] font-bold tracking-tight" style={{ color: "var(--color-brand-dark)" }}>
              SpacECE
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              India Foundation
            </span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex lg:items-center lg:gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="rounded-full px-4 py-2 text-[14px] font-semibold transition-colors"
                style={
                  isActive
                    ? { background: "rgba(230,126,34,0.12)", color: "var(--color-brand-orange)" }
                    : { color: "var(--color-brand-dark)", opacity: 0.65 }
                }
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.color = "var(--color-brand-orange)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.opacity = "0.65";
                    e.currentTarget.style.color = "var(--color-brand-dark)";
                  }
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Donate + mobile menu toggle */}
        <div className="flex items-center gap-3">
          <Link to="/donate" className="hidden sm:block">
            <Button
              variant="primary"
              size="md"
              className="rounded-full px-7 shadow-lg"
              style={{ boxShadow: "0 10px 24px -8px rgba(230,126,34,0.5)" }}
            >
              Donate now
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-dark transition hover:bg-black/5 lg:hidden"
            style={{ color: "var(--color-brand-dark)" }}
          >
            {isMobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div
          className="px-6 pb-6 pt-4 lg:hidden"
          style={{ borderTop: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.25)" }}
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors"
                  style={
                    isActive
                      ? { background: "rgba(230,126,34,0.12)", color: "var(--color-brand-orange)" }
                      : { color: "var(--color-brand-dark)" }
                  }
                >
                  {link.name}
                </Link>
              );
            })}
            <Link to="/donate" onClick={() => setIsMobileMenuOpen(false)} className="mt-2 sm:hidden">
              <Button variant="primary" size="md" className="w-full rounded-full shadow-lg">
                Donate now
              </Button>
            </Link>
          </div>
        </div>
      )}
      </nav>
    </div>
  );
};