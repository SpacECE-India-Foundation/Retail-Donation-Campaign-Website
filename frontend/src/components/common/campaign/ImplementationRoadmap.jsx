import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ClipboardList,
  FileCheck,
  HandHeart,
  PieChart,
  ShieldCheck,
  Users,
} from "lucide-react";

/**
 * ImplementationRoadmap ("Campaign Roadmap")
 * A single, site-wide overview of how a donation moves from contribution to
 * on-the-ground impact. This is generic process copy shown once on the
 * Campaign Listing page — not campaign-specific data, and not repeated on
 * every campaign detail page.
 *
 * Desktop (lg+): one horizontal timeline — numbered dots on a dashed line,
 * icons below, title/description below that. Text is left to wrap naturally
 * (no truncate/line-clamp) so nothing gets cut off at smaller widths.
 * Below lg: a simple stacked list, since 7 columns of readable text don't
 * fit on tablet/mobile widths.
 */
const TIMELINE_STEPS = [
  {
    step: "01",
    title: "You Donate",
    description: "You make a secure donation to a campaign that matters to you.",
    icon: HandHeart,
  },
  {
    step: "02",
    title: "We Verify",
    description: "Our team verifies the donation and updates the total in real time.",
    icon: FileCheck,
  },
  {
    step: "03",
    title: "Funds Allocated",
    description: "The amount is allocated to the campaign's milestones and planned activities.",
    icon: PieChart,
  },
  {
    step: "04",
    title: "Work In Progress",
    description: "Our team executes the work on the ground as per the plan and timeline.",
    icon: ClipboardList,
  },
  {
    step: "05",
    title: "Updates Shared",
    description: "Milestone updates, photos and stories are shared transparently.",
    icon: Camera,
  },
  {
    step: "06",
    title: "Impact Delivered",
    description: "The campaign creates real impact in the lives of beneficiaries.",
    icon: BadgeCheck,
  },
  {
    step: "07",
    title: "Community Benefits",
    description: "Stronger communities, better futures and lasting change.",
    icon: Users,
  },
];

// Half of one column's width, as a percentage of the row — used so the dashed
// line starts/ends exactly at the center of the first/last number badge
// instead of overshooting past the edges of the row.
const HALF_COLUMN_PERCENT = 50 / TIMELINE_STEPS.length;

export default function ImplementationRoadmap() {
  return (
    <section
      id="campaign-roadmap"
      className="rounded-[28px] border border-brand-border bg-brand-cream p-6 shadow-[0_8px_30px_-12px_rgba(26,26,26,0.15)] sm:p-10 lg:p-12"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
          Our Campaign Roadmap
        </h2>
        <p className="mt-2 text-sm text-brand-muted sm:text-base">
          From your kindness to real-world impact — here's how every donation creates change.
        </p>
        <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-brand-orange" aria-hidden="true" />
      </div>

      {/* lg+ : single horizontal timeline */}
      <div className="mt-12 hidden lg:block">
        <div className="relative grid grid-cols-7">
          <div
            className="absolute top-4 border-t-2 border-dashed border-brand-teal/40"
            style={{ left: `${HALF_COLUMN_PERCENT}%`, right: `${HALF_COLUMN_PERCENT}%` }}
            aria-hidden="true"
          />
          {TIMELINE_STEPS.map((item) => (
            <div key={item.step} className="relative z-10 flex justify-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal text-xs font-bold text-white">
                {item.step}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-7">
          {TIMELINE_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal/15 text-brand-teal">
                  <Icon size={24} aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-7 gap-x-2">
          {TIMELINE_STEPS.map((item) => (
            <div key={item.step} className="px-1 text-center">
              <h3 className="font-display text-sm font-bold leading-snug text-brand-dark">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-brand-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Below lg: simple stacked list, no horizontal timeline */}
      <div className="mt-8 flex flex-col gap-5 lg:hidden">
        {TIMELINE_STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-teal/15 text-brand-teal">
                <Icon size={24} aria-hidden="true" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-teal text-[10px] font-bold text-white">
                  {item.step}
                </span>
              </div>
              <div className="flex-1 rounded-2xl border border-brand-border/70 bg-brand-cream/40 p-4">
                <h3 className="font-display text-sm font-bold leading-snug text-brand-dark">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-start gap-6 rounded-[24px] bg-[#EAF3F2] p-7 sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-teal shadow-sm">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-brand-dark sm:text-lg">
              Accountability at Every Step
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-brand-muted">
              We maintain complete transparency in fund utilization. You can track campaign
              progress, view updates, and see how your contribution is making a difference.
            </p>
          </div>
        </div>

        {/* This component only renders on the Campaign Listing page (see
            CampaignPage.jsx), so a plain hash anchor scrolls straight to the
            "All Campaigns" grid on that same page — a react-router <Link>
            to the current route wouldn't visibly do anything. */}
        <a
          href="#all-campaigns"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-teal px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-teal/90"
        >
          Explore Campaigns
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
