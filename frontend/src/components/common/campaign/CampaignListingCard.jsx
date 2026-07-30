import {
  ArrowRight,
  Clock,
  GraduationCap,
  HandHeart,
  HeartPulse,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "../Button";
import { formatINR } from "../../../utils/donationForm";
import { cn } from "../../../utils/cn";

// Shared with CampaignPage.jsx (the full campaigns listing) and SolutionPage.jsx
// (the Featured Campaigns section) so every campaign card on the site — whatever
// page it appears on — renders from the same real campaign data with identical
// premium styling instead of a bespoke one-off per page.

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

export function getCategoryConfig(category) {
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

export function CampaignListingCard({ campaign, onNavigate }) {
  const { style: categoryStyle, icon: CategoryIcon } = getCategoryConfig(campaign.category);
  const isUrgent = campaign.daysLeft > 0 && campaign.daysLeft <= 15;

  const goToDetails = () => {
    onNavigate(`/campaign/${campaign.campaignId}`);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToDetails();
    }
  };

  const handleDonateClick = (event) => {
    event.stopPropagation();
    onNavigate(`/donate/${campaign.campaignId}`);
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleCardKeyDown}
      aria-label={`View details for ${campaign.campaignName}`}
      className={cn(
        "group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-brand-border/70 bg-white",
        "shadow-[0_4px_16px_-8px_rgba(26,26,26,0.12)]",
        "transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-xl",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2",
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

        <div className="mt-3.5">
          <Button
            size="sm"
            className="h-11 w-full rounded-full text-sm font-semibold shadow-md shadow-brand-orange/20"
            onClick={handleDonateClick}
          >
            Donate Now
            <ArrowRight size={15} className="ml-1.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
