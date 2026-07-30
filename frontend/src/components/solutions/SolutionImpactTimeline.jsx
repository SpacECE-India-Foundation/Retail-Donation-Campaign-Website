import {
  Heart,
  ShieldCheck,
  Megaphone,
  Package,
  Users,
  FileCheck2,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    label: "Donation",
    description:
      "A supporter contributes to a cause they believe in — every rupee is logged the moment it arrives.",
    icon: Heart,
  },
  {
    step: "02",
    label: "Verification",
    description:
      "Our team reviews and confirms each contribution before it's counted, so every figure on this page reflects real, verified giving.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    label: "Campaign Allocation",
    description:
      "Verified funds are allocated directly to the specific campaign the donor chose to support.",
    icon: Megaphone,
  },
  {
    step: "04",
    label: "Resource Distribution",
    description:
      "Funds are converted into real resources — learning materials, meals, training, supplies — and delivered where they're needed.",
    icon: Package,
  },
  {
    step: "05",
    label: "Children Benefited",
    description:
      "Children and families on the ground receive direct, measurable support through the campaign's work.",
    icon: Users,
  },
  {
    step: "06",
    label: "Impact Report",
    description:
      "Outcomes are documented and shared back with donors, closing the loop on exactly where their generosity went.",
    icon: FileCheck2,
  },
];

function StepCard({ step }) {
  return (
    <div className="group/card relative">
      <div
        className="pointer-events-none absolute -inset-3 -z-10 rounded-[28px] opacity-0 blur-2xl transition-opacity duration-500 group-hover/card:opacity-60"
        style={{
          background: "radial-gradient(circle at 50% 25%, rgba(232,116,26,0.32), transparent 72%)",
        }}
        aria-hidden="true"
      />
      <div
        className="rounded-[20px] border border-[#1F2937]/[0.07] p-6 backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1.5 sm:p-7"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(255,251,243,0.75) 100%)",
          boxShadow:
            "0 2px 8px -4px rgba(31,41,55,0.05), 0 18px 38px -24px rgba(31,41,55,0.14)",
        }}
      >
        <p className="font-display text-lg font-semibold text-[#1F2937] sm:text-xl">
          {step.label}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#6B7280] sm:text-base">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export default function SolutionImpactTimeline() {
  return (
    <section className="relative overflow-hidden bg-[#FFFDF8] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-[8%] top-[10%] h-72 w-72 rounded-full bg-[#E8741A]/5 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[8%] h-72 w-72 rounded-full bg-[#0D4A52]/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 sm:px-8">
        <div className="mx-auto mb-20 max-w-2xl text-center sm:mb-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8741A]">
            Our Process
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#1F2937] sm:text-5xl">
            How Every Donation Creates Impact
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#6B7280] sm:text-lg">
            From your contribution to lasting change — every step is transparent and accounted for.
          </p>
        </div>

        <ol className="relative">
          {/* Connecting spine — centered on desktop for the alternating layout,
              aligned under the icon column on mobile/tablet's single-file layout. */}
          <div
            className="absolute left-8 top-2 bottom-2 hidden w-px bg-gradient-to-b from-transparent via-[#ECE6DD] to-transparent sm:block lg:left-1/2 lg:-translate-x-1/2"
            aria-hidden="true"
          />

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isReversed = index % 2 === 1;

            return (
              <li
                key={step.label}
                className="relative animate-fade-in-up pb-14 last:pb-0 sm:pb-16 lg:pb-24"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="grid grid-cols-[auto_1fr] items-start gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-10">
                  {/* Desktop-only left column — filled for non-reversed steps */}
                  <div className="hidden lg:block lg:text-right">
                    {!isReversed && <StepCard step={step} />}
                  </div>

                  {/* Center icon, shared across breakpoints */}
                  <div className="group/icon relative z-10 shrink-0">
                    <div
                      className="pointer-events-none absolute -inset-2 -z-10 rounded-full opacity-50 blur-xl transition-opacity duration-500 group-hover/icon:opacity-90"
                      style={{ background: "radial-gradient(circle, rgba(232,116,26,0.4), transparent 70%)" }}
                      aria-hidden="true"
                    />
                    <div
                      className="relative flex h-16 w-16 items-center justify-center rounded-full border transition-transform duration-300 hover:scale-105 lg:h-20 lg:w-20"
                      style={{
                        borderColor: "rgba(232,116,26,0.15)",
                        background: "linear-gradient(160deg, #FFFFFF 0%, #FFFAF0 100%)",
                        boxShadow: "0 2px 8px -4px rgba(31,41,55,0.06), 0 14px 32px -16px rgba(31,41,55,0.2)",
                      }}
                    >
                      <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#1F2937] text-[10px] font-bold text-white shadow-md lg:h-7 lg:w-7 lg:text-xs">
                        {step.step}
                      </span>
                      <Icon size={24} strokeWidth={1.5} className="text-[#E8741A] lg:h-7 lg:w-7" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Mobile/tablet content — always the same side, next to the icon */}
                  <div className="lg:hidden">
                    <StepCard step={step} />
                  </div>

                  {/* Desktop-only right column — filled for reversed steps */}
                  <div className="hidden lg:block">
                    {isReversed && <StepCard step={step} />}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
