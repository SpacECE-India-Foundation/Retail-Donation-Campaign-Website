import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa6";
import { cn } from "../../utils/cn";
import logo4 from "../../assets/logo4.png";

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
      { label: "Newsletter", to: "/newsletter" },
    ],
  },
];

// Real org accounts (verified via web search — there are lookalike/sister-org
// pages under spacece.co, so these are specifically the SpacECE India
// Foundation ones matching the .in branding used across this app). No X/
// Twitter account currently exists for the org, so that icon was dropped
// rather than link somewhere uncertain.
const socialLinks = [
  { label: "LinkedIn", icon: FaLinkedin, href: "https://www.linkedin.com/company/spacecein/" },
  { label: "Instagram", icon: FaInstagram, href: "https://www.instagram.com/spacece.in/" },
  { label: "Facebook", icon: FaFacebook, href: "https://www.facebook.com/SpacECEIn/" },
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
      {/* Clean white background — the CTA card below carries all the warm
          orange shading on its own, so it stands out clearly against a plain
          backdrop instead of blending into a tinted page. Note: this is now
          white, not the #FFF8F2 cream it used to be — if the page just above
          the footer (e.g. ImpactPage's wave) still ends in #FFF8F2, there may
          be a visible seam at the boundary now where there wasn't one before. */}
      <div className="relative bg-white">
        <div className="relative mx-auto max-w-6xl px-6 py-7 sm:px-8 sm:py-9 lg:py-10">
          {/* CTA banner — NOT a white glass card. This is a warm
              orange-tinted frosted glass panel: a layered cream-to-peach
              fill plus internal radial glows (top-center, center, and
              bottom-right), so the card itself reads as softly illuminated
              rather than a plain white pane sitting on the background. */}
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
            {/* Internal ambient lighting — soft and contained, not a heavy
                overall wash */}
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(650px 300px at 50% 0%, rgba(255,195,145,0.25), transparent 68%), " +
                  "radial-gradient(750px 450px at 50% 55%, rgba(255,175,120,0.16), transparent 70%), " +
                  "radial-gradient(500px 350px at 100% 100%, rgba(255,205,160,0.16), transparent 68%)",
              }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -inset-8 -z-20 rounded-[46px] opacity-55 blur-3xl"
              style={{ background: "radial-gradient(circle at 50% 40%, rgba(232,116,26,0.14), transparent 70%)" }}
              aria-hidden="true"
            />

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

          {/* Footer columns */}
          <div className="mt-7 grid gap-7 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4 lg:gap-9">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-4">
                {/* Bigger badge (h-12 → h-16) with a soft inner highlight and a
                    thin white ring, so it reads as a proper mark rather than
                    a small flat icon tile. */}
                <span
                  className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[22px] text-white shadow-[0_10px_28px_-8px_rgba(232,116,26,0.45)] ring-2 ring-white"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-teal))",
                  }}
                >
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.35), transparent 55%)" }}
                    aria-hidden="true"
                  />
                  <img
                    src={logo4}
                    alt="SpacECE India Foundation"
                    className="relative h-12 w-12 object-contain"
                  />
                </span>
                <div className="leading-tight">
                  <p className="font-display text-2xl font-bold text-[#0D4A52]">SpacECE</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9CA3AF]">
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