import { Link } from "react-router-dom";
import { ChevronRight, Share2 } from "lucide-react";
import { Button } from "../Button";
import { cn } from "../../../utils/cn";
import { formatINR } from "../../../utils/donationForm";

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
  const banner = campaign?.banner ?? defaultHero?.banner ?? "";
  const category = campaign?.category ?? "Community Campaign";

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

      <div className="overflow-hidden rounded-3xl shadow-[0_20px_60px_-12px_rgba(26,26,26,0.15)]">
        <div className="relative min-h-[320px] sm:min-h-[420px]">
          {banner ? (
            <img
              src={banner}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-brand-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/70 to-brand-dark/30" />

          <div className="relative flex min-h-[320px] flex-col justify-end p-6 sm:min-h-[420px] sm:p-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
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

              {campaign && stats && (
                <div className="w-full max-w-sm shrink-0 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-xl lg:mb-1 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Raised so far
                    </p>
                    <p className="mt-2 font-display text-3xl font-bold text-white">
                      {formatINR(stats.raised)}
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      of {formatINR(stats.goal)} goal
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Progress</span>
                      <span className="font-bold text-brand-orange">{stats.progressPercent}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-orange to-orange-500 transition-all duration-700"
                        style={{ width: `${Math.min(stats.progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <p className="text-xs text-white/70">
                      <span className="font-semibold text-white">{stats.contributors.toLocaleString("en-IN")}</span> supporters · <span className="font-semibold text-white">{stats.daysLeft}</span> days left
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}