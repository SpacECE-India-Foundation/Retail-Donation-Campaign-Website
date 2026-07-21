import { formatINR } from "../../../utils/donationForm";
import { cn } from "../../../utils/cn";

export default function CampaignProgress({ stats }) {
  const { raised, goal, remaining, progressPercent } = stats;

  return (
    <section
      className={cn(
        "animate-fade-in-up rounded-2xl border border-brand-border/70 bg-white p-5 sm:p-8",
        "shadow-[0_4px_20px_-8px_rgba(26,26,26,0.1)] transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(26,26,26,0.12)]",
      )}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-brand-dark">
            Fundraising Progress
          </h2>
          <p className="mt-2 text-sm text-brand-muted sm:text-base">
            Track how close we are to reaching our goal
          </p>
        </div>
        <p className="font-display text-3xl font-bold text-brand-orange sm:text-4xl">
          {progressPercent}%
        </p>
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
          className="relative h-full rounded-full bg-gradient-to-r from-brand-orange via-brand-orange to-brand-orange-hover transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        >
          <div className="absolute inset-0 animate-pulse rounded-full bg-white/20" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { label: "Raised", value: formatINR(raised), accent: false },
          { label: "Goal", value: formatINR(goal), accent: false },
          { label: "Remaining", value: formatINR(remaining), accent: true },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-xl border border-brand-border/50 bg-brand-cream/50 p-4 transition-all duration-300 hover:border-brand-orange/20 hover:bg-brand-cream"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              {label}
            </p>
            <p
              className={cn(
                "mt-1.5 text-xl font-bold tracking-tight sm:text-2xl",
                accent ? "text-brand-teal" : "text-brand-dark",
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
