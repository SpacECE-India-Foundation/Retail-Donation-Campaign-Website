import {
  Users,
  TrendingUp,
  Target,
  Clock,
  Wallet,
  Percent,
} from "lucide-react";
import { formatINR } from "../../../utils/donationForm";
import { cn } from "../../../utils/cn";

const KPI_CONFIG = [
  {
    key: "contributors",
    label: "Total Contributors",
    icon: Users,
    format: (v) => v.toLocaleString("en-IN"),
    accent: "from-brand-orange/15 to-brand-orange/5 text-brand-orange",
  },
  {
    key: "raised",
    label: "Total Raised",
    icon: TrendingUp,
    format: formatINR,
    accent: "from-brand-success/15 to-brand-success/5 text-brand-success",
  },
  {
    key: "goal",
    label: "Campaign Goal",
    icon: Target,
    format: formatINR,
    accent: "from-brand-teal/15 to-brand-teal/5 text-brand-teal",
  },
  {
    key: "remaining",
    label: "Remaining Goal",
    icon: Wallet,
    format: formatINR,
    accent: "from-brand-warning/15 to-brand-warning/5 text-brand-warning",
  },
  {
    key: "progressPercent",
    label: "Progress",
    icon: Percent,
    format: (v) => `${v}%`,
    accent: "from-brand-orange/15 to-brand-orange/5 text-brand-orange",
  },
  {
    key: "daysLeft",
    label: "Days Left",
    icon: Clock,
    format: (v) => `${v} days`,
    accent: "from-brand-teal/15 to-brand-teal/5 text-brand-teal",
  },
];

export default function CampaignStats({ stats }) {
  return (
    <section className="animate-fade-in-up">
      <div className="mb-6 sm:mb-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
          Campaign Statistics
        </h2>
        <p className="mt-2 text-sm text-brand-muted sm:text-base">
          Key metrics for this fundraising campaign
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {KPI_CONFIG.map(({ key, label, icon: Icon, format, accent }, index) => (
          <div
            key={key}
            className={cn(
              "group rounded-2xl border border-brand-border/70 bg-white p-4 sm:p-5",
              "shadow-[0_4px_20px_-8px_rgba(26,26,26,0.1)]",
              "transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-orange/30 hover:shadow-[0_12px_32px_-8px_rgba(232,116,26,0.18)]",
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div
              className={cn(
                "mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
                accent,
              )}
            >
              <Icon size={20} aria-hidden="true" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              {label}
            </p>
            <p className="mt-1.5 text-lg font-bold tracking-tight text-brand-dark sm:text-xl">
              {format(stats[key])}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
