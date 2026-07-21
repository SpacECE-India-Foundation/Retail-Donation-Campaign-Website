import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  ArrowRight,
  Heart,
  Sparkles,
  Wallet,
  Target,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  HeartPulse,
  UtensilsCrossed,
  LifeBuoy,
  HandHeart,
  Flame,
  Inbox,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { CAMPAIGNS, getCampaignStats } from "../data/donation.mock";
import { formatINR } from "../utils/donationForm";
import { cn } from "../utils/cn";

const CATEGORY_CONFIG = {
  Education: {
    style: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
    icon: GraduationCap,
  },
  Learning: {
    style: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
    icon: BookOpen,
  },
  Health: {
    style: "bg-red-50 text-red-700 border-red-200",
    icon: HeartPulse,
  },
  Healthcare: {
    style: "bg-red-50 text-red-700 border-red-200",
    icon: HeartPulse,
  },
  "Food Security": {
    style: "bg-amber-50 text-amber-800 border-amber-200",
    icon: UtensilsCrossed,
  },
  Relief: {
    style: "bg-orange-50 text-brand-orange border-brand-orange/30",
    icon: LifeBuoy,
  },
  "Disaster Relief": {
    style: "bg-orange-50 text-brand-orange border-brand-orange/30",
    icon: LifeBuoy,
  },
  Community: {
    style: "bg-brand-teal/10 text-brand-teal border-brand-teal/20",
    icon: Users,
  },
};

const DEFAULT_CATEGORY_CONFIG = {
  style: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  icon: HandHeart,
};

function getCategoryConfig(category) {
  return CATEGORY_CONFIG[category] ?? DEFAULT_CATEGORY_CONFIG;
}

// Display-only imagery keyed by category. This does not touch campaign data —
// it simply picks a more realistic, on-theme photo to render on the listing
// card in place of whatever banner URL the campaign record happens to have.
const CATEGORY_IMAGE = {
  Education:
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop&q=80",
  Learning:
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&q=80",
  Health:
    "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop&q=80",
  Healthcare:
    "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop&q=80",
  "Food Security":
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop&q=80",
  Relief:
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=600&fit=crop&q=80",
  "Disaster Relief":
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&h=600&fit=crop&q=80",
  Community:
    "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800&h=600&fit=crop&q=80",
};

const DEFAULT_CATEGORY_IMAGE = CATEGORY_IMAGE.Education;

function getCategoryImage(campaign) {
  return CATEGORY_IMAGE[campaign.category] ?? campaign.banner ?? DEFAULT_CATEGORY_IMAGE;
}

function CampaignListingCard({ campaign, onNavigate }) {
  const stats = getCampaignStats(campaign);
  const { style: categoryStyle, icon: CategoryIcon } = getCategoryConfig(
    campaign.category,
  );
  const isUrgent = stats.daysLeft <= 15;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border/70 bg-white",
        "shadow-[0_4px_16px_-8px_rgba(26,26,26,0.12)]",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-xl",
      )}
    >
      <div className="relative h-44 shrink-0 overflow-hidden rounded-t-2xl bg-brand-cream">
        <img
          src={getCategoryImage(campaign)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-brand-dark/5 to-transparent" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-md",
              categoryStyle,
            )}
          >
            <CategoryIcon size={11} aria-hidden="true" />
            {campaign.category}
          </span>
        </div>

        {isUrgent && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-500/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg shadow-red-500/30 backdrop-blur-md">
            <Flame size={11} aria-hidden="true" />
            Ending Soon
          </span>
        )}

        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-dark shadow-md backdrop-blur-sm">
            <Sparkles size={11} className="text-brand-orange" aria-hidden="true" />
            {stats.progressPercent}% funded
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-teal">
          <ShieldCheck size={12} aria-hidden="true" />
          Verified Campaign
        </div>

        <h3 className="font-display text-sm font-bold leading-snug text-brand-dark transition-colors group-hover:text-brand-orange">
          {campaign.campaignName}
        </h3>

        <p className="mt-1 line-clamp-2 flex-1 text-[11px] leading-relaxed text-brand-muted">
          {campaign.shortDescription}
        </p>

        <div className="mt-3 space-y-2.5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                Raised
              </p>
              <p className="font-display text-base font-extrabold tracking-tight text-brand-teal">
                {formatINR(stats.raised)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                Goal
              </p>
              <p className="text-xs font-bold text-brand-dark">
                {formatINR(stats.goal)}
              </p>
            </div>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-brand-cream shadow-inner"
            role="progressbar"
            aria-valuenow={stats.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${campaign.campaignName} fundraising progress`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-hover transition-all duration-700"
              style={{ width: `${Math.min(stats.progressPercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between border-t border-brand-border/60 pt-2.5 text-[11px] text-brand-muted">
            <span className="inline-flex items-center gap-1 font-medium">
              <Users size={12} className="text-brand-orange" aria-hidden="true" />
              {stats.contributors.toLocaleString("en-IN")} donors
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock size={12} className="text-brand-teal" aria-hidden="true" />
              {stats.daysLeft} days left
            </span>
          </div>
        </div>

        <Button
          size="sm"
          className={cn(
            "mt-3 h-8 w-full rounded-xl text-[11px] font-semibold shadow-md shadow-brand-orange/20",
            "transition-all duration-300 group-hover:shadow-lg group-hover:shadow-brand-orange/30",
          )}
          onClick={() => onNavigate(campaign.campaignId)}
        >
          Donate Now
          <ArrowRight size={13} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </div>
    </article>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-brand-border bg-white/60 px-6 py-16 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
        <Inbox size={24} aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-bold text-brand-dark">
        No campaigns in this category
      </h3>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">
        Try a different category, or browse all active campaigns currently
        accepting donations.
      </p>
      <Button variant="outline" className="mt-5 rounded-xl" onClick={onReset}>
        View All Campaigns
      </Button>
    </div>
  );
}

export default function CampaignPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set(CAMPAIGNS.map((c) => c.category))],
    [],
  );

  const filteredCampaigns = useMemo(
    () =>
      activeCategory === "All"
        ? CAMPAIGNS
        : CAMPAIGNS.filter((c) => c.category === activeCategory),
    [activeCategory],
  );

  const aggregateStats = useMemo(() => getCampaignStats(), []);

  const handleNavigate = (campaignId) => {
    navigate(`/donate/${campaignId}`);
  };

  const heroStats = [
    {
      key: "raised",
      label: "Total Raised",
      value: formatINR(aggregateStats.raised),
      icon: Wallet,
    },
    {
      key: "campaigns",
      label: "Active Campaigns",
      value: CAMPAIGNS.length,
      icon: Target,
    },
    {
      key: "donors",
      label: "Total Donors",
      value: aggregateStats.contributors.toLocaleString("en-IN"),
      icon: Users,
    },
    {
      key: "progress",
      label: "Funded",
      value: `${aggregateStats.progressPercent}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-brand-border/60 bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 30%, #E8741A 0%, transparent 45%), radial-gradient(circle at 85% 15%, #0D4A52 0%, transparent 40%)",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-[1440px] px-6 py-16 sm:py-20 lg:px-8 lg:py-24 xl:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-orange">
                <Heart size={14} aria-hidden="true" />
                Active Campaigns
              </div>
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-brand-dark sm:text-5xl lg:text-6xl">
                Campaigns That{" "}
                <span className="text-brand-orange">Change Lives</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-muted sm:text-lg">
                Explore verified fundraising campaigns across education,
                health, and disaster relief. Every contribution is tracked
                through transparent milestones, from first rupee to final
                impact.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-medium text-brand-muted">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} className="text-brand-teal" aria-hidden="true" />
                  100% Verified
                </span>
                <span className="h-1 w-1 rounded-full bg-brand-border" />
                <span className="inline-flex items-center gap-2">
                  <Target size={16} className="text-brand-orange" aria-hidden="true" />
                  Milestone Tracked
                </span>
                <span className="h-1 w-1 rounded-full bg-brand-border" />
                <span className="inline-flex items-center gap-2">
                  <HandHeart size={16} className="text-brand-orange" aria-hidden="true" />
                  Tax Exempt (80G)
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[28px] border border-brand-border/70 bg-brand-dark p-6 shadow-[0_20px_60px_-16px_rgba(26,26,26,0.35)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Community Impact So Far
                </p>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  {heroStats.map(({ key, label, value, icon: Icon }) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                    >
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-orange/20 text-brand-orange">
                        <Icon size={16} aria-hidden="true" />
                      </div>
                      <p className="font-display text-xl font-bold text-white">
                        {value}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-white/50">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Grid */}
      <section className="mx-auto max-w-[1440px] px-6 py-14 sm:py-16 lg:px-8 lg:py-20 xl:px-10">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-brand-dark sm:text-2xl">
                All Campaigns
              </h2>
              <p className="mt-2 text-sm text-brand-muted sm:text-base">
                {filteredCampaigns.length} of {CAMPAIGNS.length} campaigns
                accepting donations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filter campaigns by category">
            {categories.map((category) => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={isActive}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300",
                    isActive
                      ? "border-brand-orange bg-brand-orange text-white shadow-md shadow-brand-orange/25"
                      : "border-brand-border bg-white text-brand-muted hover:border-brand-orange/40 hover:text-brand-orange",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {filteredCampaigns.length === 0 ? (
          <EmptyState onReset={() => setActiveCategory("All")} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCampaigns.map((campaign, index) => (
              <div
                key={campaign.campaignId}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <CampaignListingCard
                  campaign={campaign}
                  onNavigate={handleNavigate}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Policy Section */}
      <section className="border-t border-brand-border/60 bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-brand-dark sm:text-3xl">
              Our Donation Policy
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
              We believe in complete transparency. Every rupee donated is
              tracked, verified, and allocated to specific campaign milestones.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              {
                title: "100% Transparent",
                desc: "Every donation is tracked and reported with full accountability.",
                icon: ShieldCheck,
              },
              {
                title: "Verified Milestones",
                desc: "Funds are released only when campaign milestones are achieved.",
                icon: Target,
              },
              {
                title: "Tax Benefits",
                desc: "Eligible donations qualify for 80G tax exemption certificates.",
                icon: Sparkles,
              },
              {
                title: "Direct Impact",
                desc: "Your contribution reaches beneficiaries without middlemen.",
                icon: HandHeart,
              },
            ].map((item) => (
              <div
                key={item.title}
                className={cn(
                  "rounded-[24px] border border-brand-border/70 bg-brand-cream/50 p-6",
                  "transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/25 hover:bg-white hover:shadow-[0_16px_40px_-16px_rgba(26,26,26,0.15)]",
                )}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                  <item.icon size={20} aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-bold text-brand-dark">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-brand-dark sm:text-3xl">
              Campaign Roadmap
            </h2>
            <p className="mt-3 text-sm text-brand-muted sm:text-base">
              How your donation creates lasting change
            </p>
          </div>

          <div className="relative mt-12">
            <div
              className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-brand-border lg:block"
              aria-hidden="true"
            />

            <div className="space-y-8 lg:space-y-12">
              {[
                {
                  step: "01",
                  title: "Choose a Campaign",
                  desc: "Browse verified campaigns and select one that resonates with you.",
                },
                {
                  step: "02",
                  title: "Make a Donation",
                  desc: "Complete the secure donation form with your preferred payment method.",
                },
                {
                  step: "03",
                  title: "Track Progress",
                  desc: "Follow milestone updates as the campaign reaches its goals.",
                },
                {
                  step: "04",
                  title: "See the Impact",
                  desc: "Receive confirmation and witness the direct impact of your contribution.",
                },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className={cn(
                    "relative flex flex-col items-center gap-4 lg:flex-row",
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse",
                  )}
                >
                  <div className="hidden flex-1 lg:block" />

                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-orange text-lg font-bold text-white shadow-lg shadow-brand-orange/30">
                    {item.step}
                  </div>

                  <div
                    className={cn(
                      "flex-1 rounded-[24px] border border-brand-border/70 bg-white p-6 shadow-sm",
                      "transition-all duration-300 hover:border-brand-orange/20 hover:shadow-[0_16px_40px_-16px_rgba(26,26,26,0.15)]",
                      index % 2 === 0 ? "lg:text-left" : "lg:text-right",
                    )}
                  >
                    <h3 className="font-display text-lg font-bold text-brand-dark">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                      {item.desc}
                    </p>
                  </div>

                  <div className="hidden flex-1 lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
