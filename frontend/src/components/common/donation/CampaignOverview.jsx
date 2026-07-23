import { Users, TrendingUp, Target, Clock, Percent } from "lucide-react";
import { formatINR } from "../../../utils/donationForm";
import { cn } from "../../../utils/cn";

const OVERVIEW_METRICS = [
  { key: "raised", label: "Total Raised", icon: TrendingUp, format: formatINR },
  { key: "goal", label: "Goal Amount", icon: Target, format: formatINR },
  { key: "progressPercent", label: "Progress", icon: Percent, format: (v) => `${v}%` },
  { key: "contributors", label: "Contributors", icon: Users, format: (v) => v.toLocaleString("en-IN") },
  { key: "daysLeft", label: "Days Left", icon: Clock, format: (v) => `${v} days` },
];

export default function CampaignOverview({ stats }) {
  const { raised, goal, progressPercent } = stats;

  return (
    <section
      id="campaign-overview"
      className={cn(
        "animate-fade-in-up rounded-2xl border border-brand-border/70 bg-white p-5 sm:p-8",
        "shadow-[0_4px_20px_-8px_rgba(26,26,26,0.1)]",
      )}
    >
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
          Campaign Overview
        </h2>
        <p className="mt-2 text-sm text-brand-muted sm:text-base">
          Track fundraising progress and campaign momentum
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {OVERVIEW_METRICS.map(({ key, label, icon: Icon, format }) => (
          <div
            key={key}
            className="rounded-xl border border-brand-border/50 bg-brand-cream/40 p-4 transition-all duration-300 hover:border-brand-orange/20 hover:bg-brand-cream/70"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange">
              <Icon size={16} aria-hidden="true" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              {label}
            </p>
            <p
              className={cn(
                "mt-1 text-lg font-bold tracking-tight text-brand-dark sm:text-xl",
                key === "progressPercent" && "text-brand-orange",
              )}
            >
              {format(stats[key])}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-medium text-brand-dark">
            {formatINR(raised)} raised of {formatINR(goal)}
          </span>
          <span className="font-bold text-brand-orange">{progressPercent}% funded</span>
        </div>
        <div
          className="relative h-3 overflow-hidden rounded-full bg-brand-cream sm:h-4"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Campaign fundraising progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-hover transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
