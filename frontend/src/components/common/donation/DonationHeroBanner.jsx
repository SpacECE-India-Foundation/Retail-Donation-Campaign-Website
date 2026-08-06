import { Link } from "react-router-dom";
import { ChevronRight, Share2, Users, Calendar, ShieldCheck, Check } from "lucide-react";
import { Button } from "../Button";
import { cn } from "../../../utils/cn";
import { formatINR } from "../../../utils/donationForm";

// One elegant decorative accent in the top-right corner — a thin open arc in
// the brand gradient, not a filled shape. Deliberately singular/restrained,
// dialed back further this round along with the rest of the orange glow.
function HeroCornerAccent() {
  return (
    <svg
      className="pointer-events-none absolute -right-6 -top-6 h-40 w-40"
      viewBox="0 0 160 160"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cornerAccentGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8741A" />
          <stop offset="100%" stopColor="#FFD6AA" />
        </linearGradient>
      </defs>
      <path
        d="M20 140 A120 120 0 0 1 140 20"
        fill="none"
        stroke="url(#cornerAccentGradient)"
        strokeWidth="2"
        opacity="0.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Frosted glassmorphism "Trust & Transparency" panel for the Donate page's
// generic "Support a Campaign" hero (no campaign selected yet). No
// background illustration behind it anymore — flat glass only, per
// feedback that the artwork overlapped and cluttered the card.
function HeroGlassPanel() {
  const items = ["Verified Donations", "Secure UPI Payments", "100% Transparency", "Instant Confirmation"];

  return (
    <div className="relative">
      {/* Soft floating orange glow behind the glass card */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[32px] opacity-40 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(232,116,26,0.1), transparent 70%)" }}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-[260px] overflow-hidden rounded-[22px] p-5"
        style={{
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 18px 40px rgba(10,7,5,0.38)",
        }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-brand-orange" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-wider text-white/90">
            Trust & Transparency
          </p>
        </div>

        <div className="my-3 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />

        <p className="text-[11px] leading-relaxed text-white/60">
          Every contribution is secure, verified and impact-driven.
        </p>

        <div className="mt-3.5 space-y-1.5">
          {items.map((label) => (
            <div key={label} className="flex items-center gap-2">
              <Check size={12} className="shrink-0 text-brand-orange" aria-hidden="true" />
              <p className="text-xs font-medium text-white/75">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Right side for an actual campaign — unchanged from before: soft warm
// gradient blooms with a real floating glass progress card layered on top
// (Raised/Goal, progress bar, Contributors, Days Left).
function HeroVisualPanel({ stats }) {
  // No campaign selected yet (the Donate page's generic "Support a Campaign"
  // state) — the frosted glass trust-chip panel instead of the stats card.
  if (!stats) {
    return (
      <div
        className="relative hidden shrink-0 items-center justify-center lg:flex lg:w-[33%]"
        style={{ transform: "translateX(-48px)" }}
      >
        <HeroGlassPanel />
      </div>
    );
  }

  return (
    <div className="relative hidden shrink-0 items-center justify-center lg:flex lg:w-[38%]">
      <div
        className="pointer-events-none absolute -right-6 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(232,116,26,0.14), transparent 72%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-16 top-6 h-40 w-40 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(255,214,170,0.1), transparent 72%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-2 right-24 h-36 w-36 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(232,116,26,0.08), transparent 72%)" }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 w-full max-w-[300px] rounded-[28px] border p-6 shadow-[0_20px_50px_rgba(20,12,6,0.35)] backdrop-blur-xl"
        style={{ background: "rgba(255,241,224,0.07)", borderColor: "rgba(255,241,224,0.16)" }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Raised</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Goal</p>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-2">
          <p className="font-display text-2xl font-bold text-white">{formatINR(stats.raised)}</p>
          <p className="text-sm font-medium text-white/75">{formatINR(stats.goal)}</p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-orange to-orange-400 transition-all duration-700"
            style={{ width: `${Math.min(stats.progressPercent, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs font-semibold text-brand-orange">
          {stats.progressPercent}% funded
        </p>

        <div
          className="mt-5 flex items-center justify-between border-t pt-4"
          style={{ borderColor: "rgba(255,241,224,0.14)" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "rgba(255,241,224,0.08)" }}
            >
              <Users size={16} className="text-white/70" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">
                {stats.contributors.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-white/55">Contributors</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "rgba(255,241,224,0.08)" }}
            >
              <Calendar size={16} className="text-white/70" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">{stats.daysLeft}</p>
              <p className="text-[11px] text-white/55">Days Left</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DonationHeroBanner({
  campaign,
  defaultHero,
  stats,
  onDonateClick,
  onShare,
  // Optional breadcrumb overrides — default to the public site's own links so this
  // component's behavior is byte-for-byte unchanged for existing (public) callers.
  // The admin Campaign Detail page passes /admin + /admin/campaigns here instead,
  // since sending an admin out to the public site via this breadcrumb was a real bug.
  breadcrumbHomeHref = "/",
  breadcrumbHomeLabel = "Home",
  breadcrumbListHref = "/campaign",
  breadcrumbListLabel = "Campaigns",
}) {
  const title = campaign?.campaignName ?? defaultHero?.title ?? "Support a Campaign";
  const description =
    campaign?.shortDescription ??
    campaign?.description ??
    defaultHero?.description ??
    "Choose a campaign and make a verified contribution.";
  const category = campaign?.category ?? "Community Campaign";
  const showStats = Boolean(campaign && stats);

  // Campaign-specific heroes keep their existing look exactly as before
  // (left untouched, per "already fine"). Only the Donate page's generic
  // no-campaign-selected hero gets this round's premium treatment.
  const heroGradient = showStats
    ? "linear-gradient(135deg, #2C2825 0%, #3A342F 100%)"
    : "linear-gradient(135deg, #1F1C1A 0%, #2B2623 50%, #3A312C 100%)";
  // Slightly more defined "premium" border for the generic hero, plus a
  // top inner highlight (a thin light line along the inside top edge) on
  // top of the existing inset border and a further-softened outer shadow.
  const heroBorderColor = showStats ? "rgba(255,241,224,0.08)" : "rgba(255,255,255,0.1)";
  const heroShadow = showStats
    ? "0 20px 60px rgba(40,25,15,0.25)"
    : "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.04), 0 12px 32px rgba(10,7,5,0.22)";
  // Orange glow intensity — cut ~45-50% for the generic hero only, per
  // feedback that the corners felt too warm. Campaign-specific heroes keep
  // their original values untouched.
  const ambientGlowAlpha = showStats ? 0.06 : 0.03;
  // CTA glow cut a further ~25% this round (0.06 -> 0.045).
  const ctaGlowAlpha = showStats ? 0.12 : 0.045;

  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1 text-sm text-brand-muted"
      >
        <Link to={breadcrumbHomeHref} className="transition-colors hover:text-brand-orange">
          {breadcrumbHomeLabel}
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link to={breadcrumbListHref} className="transition-colors hover:text-brand-orange">
          {breadcrumbListLabel}
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="font-medium text-brand-dark">
          {campaign?.campaignName ?? "Campaign Detail"}
        </span>
      </nav>

      {/* Warm charcoal — not black, no dotted/tech pattern. Same soft-glow,
          soft-shadow, rounded-card language as the footer and the rest of
          the site, just in a dark register instead of cream. */}
      <div
        className="overflow-hidden rounded-[30px] border"
        style={{ borderColor: heroBorderColor, boxShadow: heroShadow }}
      >
        <div className="relative min-h-[260px] sm:min-h-[300px] lg:min-h-[340px]">
          {/* Warm charcoal gradient base */}
          <div className="absolute inset-0" style={{ background: heroGradient }} />
          {/* Very soft warm ambient glow — diffuse, not a spotlight */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(900px 560px at 85% 20%, rgba(232,116,26,${ambientGlowAlpha}), transparent 65%)`,
            }}
            aria-hidden="true"
          />

          {!showStats && (
            <>
              {/* Two extra soft radial layers, generic hero only — depth
                  instead of a flat rectangle, dialed down further this round. */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(700px 420px at 15% 90%, rgba(232,116,26,0.025), transparent 60%)",
                }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(520px 360px at 60% 100%, rgba(255,214,170,0.02), transparent 65%)",
                }}
                aria-hidden="true"
              />
              {/* Very subtle dotted mesh texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "26px 26px",
                }}
                aria-hidden="true"
              />
              {/* Subtle left-to-right vignette for extra depth */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.16) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.12) 100%)",
                }}
                aria-hidden="true"
              />
              <HeroCornerAccent />
            </>
          )}

          {/* Gentle paper-like grain — same technique as the footer's noise
              texture, so the two sections share a visual language. */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
            aria-hidden="true"
          />
          {/* Soft warm highlight behind the CTA area */}
          <div
            className="pointer-events-none absolute bottom-6 left-6 h-32 w-64 opacity-70 blur-3xl sm:left-10"
            style={{ background: `radial-gradient(circle, rgba(232,116,26,${ctaGlowAlpha}), transparent 70%)` }}
            aria-hidden="true"
          />
          {/* Thin orange accent line along the bottom edge — echoes the
              footer's own divider treatment and ties the hero back to the
              site's orange branding. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(232,116,26,0.4) 50%, transparent)",
            }}
            aria-hidden="true"
          />

          <div className="relative flex min-h-[260px] flex-col justify-center p-6 sm:min-h-[300px] sm:p-10 lg:min-h-[340px] lg:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center rounded-full bg-brand-orange px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-brand-orange/30">
                  {category}
                </div>
                <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                  {title}
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                  {description}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    type="button"
                    size="lg"
                    className="rounded-xl px-8 py-3 shadow-lg shadow-brand-orange/40 hover:scale-105 transition-transform font-semibold"
                    onClick={onDonateClick}
                  >
                    Donate Now
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className={cn(
                      "rounded-xl border-white/40 bg-white/15 px-8 py-3 text-white backdrop-blur-md font-semibold",
                      "hover:scale-105 hover:border-white hover:bg-white/25 hover:text-white transition-all",
                    )}
                    onClick={onShare}
                  >
                    <Share2 size={18} className="mr-2" aria-hidden="true" />
                    Share Campaign
                  </Button>
                </div>
              </div>

              <HeroVisualPanel stats={showStats ? stats : null} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
