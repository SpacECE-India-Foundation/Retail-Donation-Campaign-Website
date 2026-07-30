import { Users, IndianRupee, Target } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

const METRICS = [
  {
    key: "totalDonations",
    label: "Generous Donors",
    icon: Users,
    format: (n) => n.toLocaleString("en-IN"),
  },
  {
    key: "totalRaised",
    label: "Total Raised",
    icon: IndianRupee,
    format: (n) => `₹${n.toLocaleString("en-IN")}`,
  },
  {
    key: "totalCampaigns",
    label: "Active Campaigns",
    icon: Target,
    format: (n) => n.toLocaleString("en-IN"),
  },
];

export default function SolutionImpactStrip({ statistics }) {
  return (
    <section
      className="bg-[#FFFDF8] py-16 sm:py-20"
      aria-label="Live impact statistics"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div
          className="flex flex-col items-stretch rounded-[28px] border border-[#ECE6DD] bg-white/70 px-8 py-10 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-12"
          style={{ boxShadow: "0 24px 60px -40px rgba(31,41,55,0.18)" }}
        >
          {METRICS.map((metric, index) => {
            const Icon = metric.icon;
            const value = statistics?.[metric.key] ?? 0;

            return (
              <div key={metric.key} className="flex flex-1 flex-col items-center">
                {index > 0 && (
                  <div
                    className="my-8 h-px w-full bg-[#ECE6DD] sm:hidden"
                    aria-hidden="true"
                  />
                )}

                <div className="flex w-full flex-1 items-center justify-center sm:justify-start">
                  {index > 0 && (
                    <div
                      className="mx-10 hidden h-14 w-px shrink-0 bg-[#ECE6DD] sm:block"
                      aria-hidden="true"
                    />
                  )}

                  <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                    <Icon
                      size={18}
                      strokeWidth={1.5}
                      className="mb-4 text-[#E8741A]/70"
                      aria-hidden="true"
                    />
                    <p className="font-display text-4xl font-semibold tracking-tight text-[#1F2937] sm:text-5xl">
                      <AnimatedCounter value={value} format={metric.format} />
                    </p>
                    <p className="mt-2 text-sm font-medium tracking-wide text-[#6B7280]">
                      {metric.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
