import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  GraduationCap,
  HandHeart,
  Heart,
  HeartPulse,
  Inbox,
  LifeBuoy,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { calculateCampaignStats, fetchCampaigns } from "../services/campaignService";
import { formatINR } from "../utils/donationForm";
import { cn } from "../utils/cn";

const CATEGORY_CONFIG = {
  Education: {
    style: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
    icon: GraduationCap,
  },
  Health: {
    style: "bg-red-50 text-red-700 border-red-200",
    icon: HeartPulse,
  },
  Relief: {
    style: "bg-orange-50 text-brand-orange border-brand-orange/30",
    icon: LifeBuoy,
  },
  "Community Campaign": {
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

function CampaignImage({ campaign }) {
  if (campaign.banner) {
    return (
      <img
        src={campaign.banner}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-brand-orange/10 text-brand-orange">
      <HandHeart size={42} aria-hidden="true" />
    </div>
  );
}

function CampaignListingCard({ campaign, onNavigate }) {
  const { style: categoryStyle, icon: CategoryIcon } = getCategoryConfig(campaign.category);
  const isUrgent = campaign.daysLeft > 0 && campaign.daysLeft <= 15;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border/70 bg-white",
        "shadow-[0_4px_16px_-8px_rgba(26,26,26,0.12)]",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-xl",
      )}
    >
      <div className="relative h-44 shrink-0 overflow-hidden rounded-t-2xl bg-brand-cream">
        <CampaignImage campaign={campaign} />
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
            Ending Soon
          </span>
        )}

        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-dark shadow-md backdrop-blur-sm">
            <Sparkles size={11} className="text-brand-orange" aria-hidden="true" />
            {campaign.progressPercent}% funded
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-teal">
          <ShieldCheck size={12} aria-hidden="true" />
          {campaign.status || "Verified Campaign"}
        </div>

        <h3 className="font-display text-sm font-bold leading-snug text-brand-dark transition-colors group-hover:text-brand-orange">
          {campaign.campaignName}
        </h3>

        <p className="mt-1 line-clamp-2 flex-1 text-[11px] leading-relaxed text-brand-muted">
          {campaign.shortDescription || campaign.description}
        </p>

        <div className="mt-3 space-y-2.5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                Raised
              </p>
              <p className="font-display text-base font-extrabold tracking-tight text-brand-teal">
                {formatINR(campaign.raised)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
                Goal
              </p>
              <p className="text-xs font-bold text-brand-dark">
                {formatINR(campaign.goal)}
              </p>
            </div>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-brand-cream shadow-inner"
            role="progressbar"
            aria-valuenow={campaign.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${campaign.campaignName} fundraising progress`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-hover transition-all duration-700"
              style={{ width: `${Math.min(campaign.progressPercent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between border-t border-brand-border/60 pt-2.5 text-[11px] text-brand-muted">
            <span className="inline-flex items-center gap-1 font-medium">
              <Users size={12} className="text-brand-orange" aria-hidden="true" />
              {campaign.contributors.toLocaleString("en-IN")} donors
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock size={12} className="text-brand-teal" aria-hidden="true" />
              {campaign.daysLeft} days left
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-xl text-[11px] font-semibold"
            onClick={() => onNavigate(`/campaign/${campaign.campaignId}`)}
          >
            Details
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-xl text-[11px] font-semibold shadow-md shadow-brand-orange/20"
            onClick={() => onNavigate(`/donate/${campaign.campaignId}`)}
          >
            Donate
            <ArrowRight size={13} className="ml-1.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function StateMessage({ type, title, message, onRetry }) {
  const isError = type === "error";
  const Icon = isError ? AlertCircle : Inbox;

  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-brand-border bg-white/60 px-6 py-16 text-center shadow-sm">
      <div
        className={cn(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl",
          isError ? "bg-brand-danger/10 text-brand-danger" : "bg-brand-orange/10 text-brand-orange",
        )}
      >
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-bold text-brand-dark">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5 rounded-xl" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export default function CampaignPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCampaigns = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchCampaigns();
      setCampaigns(data);
    } catch (err) {
      setCampaigns([]);
      setError(err?.response?.data?.message || "Unable to load campaigns right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(campaigns.map((c) => c.category).filter(Boolean))],
    [campaigns],
  );

  const filteredCampaigns = useMemo(
    () =>
      activeCategory === "All"
        ? campaigns
        : campaigns.filter((c) => c.category === activeCategory),
    [activeCategory, campaigns],
  );

  const aggregateStats = useMemo(() => calculateCampaignStats(campaigns), [campaigns]);

  const heroStats = [
    {
      key: "raised",
      label: "Total Raised",
      value: formatINR(aggregateStats.raised),
      icon: Wallet,
    },
    {
      key: "campaigns",
      label: "Campaigns",
      value: campaigns.length,
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
      <section className="relative overflow-hidden border-b border-brand-border/60 bg-white">
        <div className="relative mx-auto max-w-[1440px] px-6 py-16 sm:py-20 lg:px-8 lg:py-24 xl:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
            <div className="lg:col-span-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-orange">
                <Heart size={14} aria-hidden="true" />
                Campaigns
              </div>
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-brand-dark sm:text-5xl lg:text-6xl">
                Campaigns That{" "}
                <span className="text-brand-orange">Change Lives</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-muted sm:text-lg">
                Explore active fundraising campaigns and support the causes that matter to you.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-[28px] border border-brand-border/70 bg-brand-dark p-6 shadow-[0_20px_60px_-16px_rgba(26,26,26,0.35)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Campaign Totals
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

      <section className="mx-auto max-w-[1440px] px-6 py-14 sm:py-16 lg:px-8 lg:py-20 xl:px-10">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-brand-dark sm:text-2xl">
                All Campaigns
              </h2>
              <p className="mt-2 text-sm text-brand-muted sm:text-base">
                {isLoading
                  ? "Loading campaigns..."
                  : `${filteredCampaigns.length} of ${campaigns.length} campaigns`}
              </p>
            </div>
          </div>

          {categories.length > 1 && (
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
          )}
        </div>

        {isLoading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-brand-border bg-white/70">
            <Loader2 className="mr-3 animate-spin text-brand-orange" size={24} />
            <span className="text-sm font-semibold text-brand-muted">Loading campaigns</span>
          </div>
        ) : error ? (
          <StateMessage
            type="error"
            title="Campaigns could not be loaded"
            message={error}
            onRetry={loadCampaigns}
          />
        ) : filteredCampaigns.length === 0 ? (
          <StateMessage
            title="No campaigns available"
            message={
              activeCategory === "All"
                ? "No campaigns are accepting donations right now."
                : "No campaigns match this category."
            }
          />
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
                  onNavigate={navigate}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-brand-border/60 bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-brand-dark sm:text-3xl">
              Our Donation Policy
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted sm:text-base">
              Every rupee donated is tracked, verified, and allocated to campaign work with clear accountability.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {[
              { title: "Transparent", desc: "Campaign amounts are shown from the latest available records.", icon: ShieldCheck },
              { title: "Milestone Aware", desc: "Campaign milestones appear whenever they are available.", icon: Target },
              { title: "Secure Flow", desc: "Donation submissions are handled through the public donation flow.", icon: Sparkles },
              { title: "Direct Impact", desc: "Supporters can donate directly to a selected campaign.", icon: HandHeart },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-brand-border/70 bg-brand-cream/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/25 hover:bg-white hover:shadow-[0_16px_40px_-16px_rgba(26,26,26,0.15)]"
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
    </div>
  );
}
