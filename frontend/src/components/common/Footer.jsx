import { Link } from "react-router-dom";
import { HandHeart, Heart, ArrowRight } from "lucide-react";
import { FaLinkedin, FaInstagram, FaFacebook, FaXTwitter } from "react-icons/fa6";
import { cn } from "../../utils/cn";

const linkColumns = [
  {
    title: "Explore",
    links: [
      { label: "Mission", to: "/about" },
      { label: "Solutions", to: "/solution" },
      { label: "Our Impact", to: "/impact" },
      { label: "Campaigns", to: "/campaign" },
      { label: "Achievements", to: "/achievements" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { label: "Donate Now", to: "/donate" },
      { label: "Track a Donation", to: "/track-donations" },
      { label: "Founders", to: "/founders" },
      { label: "Documents", to: "/documents" },
    ],
  },
];

const socialLinks = [
  { label: "LinkedIn", icon: FaLinkedin, href: "https://www.linkedin.com/" },
  { label: "Instagram", icon: FaInstagram, href: "https://www.instagram.com/" },
  { label: "Facebook", icon: FaFacebook, href: "https://www.facebook.com/" },
  { label: "X", icon: FaXTwitter, href: "https://x.com/" },
];

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group/link relative inline-flex text-sm text-[#6B7280] transition-all duration-300 hover:translate-x-1 hover:text-[#E8741A]"
    >
      {children}
      <span
        className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#E8741A] transition-all duration-300 ease-out group-hover/link:w-full"
        aria-hidden="true"
      />
    </Link>
  );
}

export const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden">
      {/* No hard divider line here — the page above (e.g. ImpactPage's wave)
          already ends in this exact color (#FFF8F2), so the two blend with
          no visible seam instead of a stray line marking the boundary. */}

      {/* Off-white footer background — first stop stays #FFF8F2 so it still
          blends seamlessly with the page above (e.g. ImpactPage's wave);
          the second stop is pulled way down from the original warm peach
          so the footer itself reads clean and quiet, letting the CTA card
          stay the one warm focal point. */}
      <div
        className="relative"
        style={{ background: "linear-gradient(180deg, #FFF8F2 0%, #FDFBF9 100%)" }}
      >
        {/* Ambient lighting — orange glow top-right, accent glow bottom-left,
            trimmed down further to just a faint warm hint rather than any
            visible haze. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute -right-24 -top-20 h-[260px] w-[260px] rounded-full blur-[70px]"
            style={{ background: "rgba(232,116,26,0.02)" }}
          />
          <div
            className="absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full blur-[80px]"
            style={{ background: "#FFD8B5", opacity: 0.05 }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              background:
                "radial-gradient(600px 400px at 95% 8%, rgba(232,116,26,0.08), transparent 60%)",
            }}
          />
          {/* Very subtle grain/noise texture */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-7 sm:px-8 sm:py-9 lg:py-10">
          {/* CTA banner — soft cream-to-peach card with its own border and
              shadow only; the internal orange glow layers have been removed
              so this stays a clean, quiet card rather than a lit-up panel. */}
          <div
            className="animate-fade-in-up relative mx-auto max-w-4xl overflow-hidden rounded-[34px] px-8 py-7 text-center sm:px-12 sm:py-9"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,250,245,0.95) 0%, rgba(255,242,230,0.92) 50%, rgba(255,232,212,0.9) 100%)",
              border: "1px solid rgba(255,255,255,0.45)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              boxShadow:
                "0 35px 80px rgba(232,116,26,0.1), 0 12px 40px rgba(255,180,110,0.08), inset 0 1px 0 rgba(255,255,255,0.65)",
            }}
          >
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[#E8741A] sm:text-3xl lg:text-[36px] lg:leading-tight">
              Together, Every Contribution Creates Change
            </h2>
            <p className="mx-auto mt-2.5 max-w-lg text-sm leading-relaxed text-[#6B7280] sm:text-base">
              Your support helps transform early childhood education across communities.
            </p>

            <div className="mt-5 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4">
              <Link
                to="/donate"
                className={cn(
                  "group relative inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-sm font-bold text-white",
                  "shadow-[0_10px_28px_-8px_rgba(232,116,26,0.55)] transition-all duration-300",
                  "hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-8px_rgba(232,116,26,0.6)]",
                )}
                style={{ backgroundImage: "linear-gradient(135deg, #E8741A, #D86712)" }}
              >
                <span
                  className="pointer-events-none absolute -inset-1 -z-10 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50"
                  style={{ background: "rgba(232,116,26,0.5)" }}
                  aria-hidden="true"
                />
                <Heart size={15} aria-hidden="true" />
                Donate Now
              </Link>

              <Link
                to="/impact"
                className={cn(
                  "group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#ECE6DD]/90 bg-white/80 px-8 text-sm font-bold text-[#1F2937] backdrop-blur-sm",
                  "shadow-[0_2px_12px_-4px_rgba(31,41,55,0.06)] transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-[#E8741A]/35 hover:text-[#E8741A]",
                )}
              >
                Explore Impact
                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          {/* Footer columns — more breathing room above (mt-7/8 → mt-14/20)
              so this reads as its own section instead of running straight
              on from the CTA card. Column layout/gaps themselves untouched. */}
          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-9">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3.5">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_6px_20px_-6px_rgba(232,116,26,0.35)]"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-teal))",
                  }}
                >
                  <HandHeart size={21} aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-xl font-bold text-[#0D4A52]">SpacECE</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9CA3AF]">
                    India Foundation
                  </p>
                </div>
              </div>

              <span
                className="mt-5 block h-[3px] w-16 rounded-full"
                style={{
                  background: "linear-gradient(90deg, #E8741A, rgba(232,116,26,0.35))",
                }}
                aria-hidden="true"
              />

              <p className="mt-5 max-w-xs text-[15px] leading-[1.7] text-[#6B7280]">
                Creating meaningful change through transparent campaigns, community support,
                and measurable impact.
              </p>

              <div className="mt-6 flex items-center gap-3">
                {socialLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F0E6DA] bg-[#FFFCF7] text-[#E8741A] shadow-[0_2px_8px_-4px_rgba(31,41,55,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E8741A]/30 hover:bg-[#E8741A] hover:text-white hover:shadow-[0_8px_24px_-8px_rgba(232,116,26,0.45)]"
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Link columns */}
            {linkColumns.map((column) => (
              <div key={column.title}>
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[#0D4A52]">
                  {column.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink to={link.to}>{link.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Support Us */}
            <div>
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[#0D4A52]">
                Support Us
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-[#6B7280]">
                Your contribution funds real, verified campaigns with measurable outcomes.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 sm:mt-10">
            <span
              className="mb-4 block h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(232,116,26,0.25) 50%, transparent)",
              }}
              aria-hidden="true"
            />
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF]">
              © 2026 SpacECE India Foundation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
