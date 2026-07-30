import {
  Sparkles,
  Users,
  BookOpen,
  Baby,
  School,
  GraduationCap,
  TreePine,
  CheckCircle2,
  Landmark,
  Quote,
} from "lucide-react";

const IMPACT_TIERS = [
  {
    amount: "Rs. 500",
    description: "Trains one parent as a home learning facilitator for a full month.",
    icon: BookOpen,
  },
  {
    amount: "Rs. 1000",
    description: "Equips one Anganwadi centre with early stimulation materials for one term.",
    icon: Baby,
  },
  {
    amount: "Rs. 2,500",
    description: "Supports half a month of an Umang Fellow reaching 50+ children directly.",
    icon: Users,
  },
  {
    amount: "Rs. 5,000",
    description: "Supports one Umang Fellow for a full month, reaching 50+ children.",
    icon: GraduationCap,
  },
  {
    amount: "Rs. 15,000",
    description: "Runs a full parenting workshop for 30 families in an underserved community.",
    icon: School,
  },
  {
    amount: "Rs. 50,000",
    description: "Funds one HAALS community hub for an entire year, serving 200+ children.",
    icon: TreePine,
  },
];

const OUTCOMES = [
  "Reduced school dropout rates in primary grades.",
  "Stronger cognitive, emotional, and social development in the 0-8 age group.",
  "More capable, confident parents and caregivers as learning partners.",
  "Better-equipped frontline ICDS / Anganwadi workers.",
  "A generation of young Indians ready to learn, grow, and lead.",
];

function Eyebrow({ children }) {
  return (
    <p className="mb-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E8741A]">
      <Sparkles size={11} aria-hidden="true" />
      {children}
    </p>
  );
}

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden="true">
      <span
        className="h-px w-28 sm:w-44"
        style={{ background: "linear-gradient(90deg, transparent, rgba(232,116,26,0.4))" }}
      />
      <span className="h-1.5 w-1.5 rounded-full bg-[#E8741A]" />
      <span
        className="h-px w-28 sm:w-44"
        style={{ background: "linear-gradient(90deg, rgba(232,116,26,0.4), transparent)" }}
      />
    </div>
  );
}

function TierCard({ tier, index }) {
  const Icon = tier.icon;
  return (
    <div
      className="group relative animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="pointer-events-none absolute -inset-3 -z-10 rounded-[28px] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-80"
        style={{ background: "radial-gradient(circle at 50% 20%, rgba(232,116,26,0.28), transparent 72%)" }}
        aria-hidden="true"
      />
      <div
        className="h-full rounded-[20px] border border-[#F0E0D0]/90 p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#E0954D]/60 hover:shadow-[0_8px_32px_-12px_rgba(232,116,26,0.18)]"
        style={{
          background: "linear-gradient(160deg, #FFFFFF 0%, #FFFCF7 100%)",
          boxShadow: "0 2px 12px -6px rgba(31,41,55,0.05), 0 20px 40px -24px rgba(31,41,55,0.1)",
        }}
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 ease-out group-hover:scale-105"
          style={{ background: "rgba(232,116,26,0.1)" }}
        >
          <Icon size={21} strokeWidth={1.75} className="text-[#E8741A]" aria-hidden="true" />
        </div>
        <span
          className="inline-flex w-fit items-center rounded-full px-3.5 py-1 font-display text-base font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, rgba(232,116,26,0.14), rgba(232,116,26,0.04))",
            color: "#B65314",
          }}
        >
          {tier.amount}
        </span>
        <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">{tier.description}</p>
      </div>
    </div>
  );
}

function ImpactPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Page background — warm editorial cream with bottom-right orange glow */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: "linear-gradient(180deg, #FFF9F3 0%, #FFF4EA 55%, #FFF8F2 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(800px 560px at 105% 95%, rgba(232,116,26,0.16), transparent 58%), " +
            "radial-gradient(500px 400px at -5% 10%, rgba(255,201,138,0.12), transparent 55%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-8 top-24 -z-10 h-44 w-44 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(rgba(232,116,26,0.55) 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[8%] top-[40%] -z-10 h-64 w-64 rounded-full blur-[90px]"
        style={{ background: "rgba(255,220,180,0.25)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-28 lg:py-32">
        {/* Hero */}
        <div className="relative mx-auto mb-20 max-w-2xl animate-fade-in-up text-center sm:mb-24">
          <div
            className="pointer-events-none absolute -inset-12 -z-10 rounded-[48px] opacity-70 blur-3xl"
            style={{ background: "radial-gradient(circle at 50% 30%, rgba(232,116,26,0.14), transparent 70%)" }}
            aria-hidden="true"
          />
          <span
            className="mb-6 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ background: "rgba(232,116,26,0.1)", color: "#E8741A" }}
          >
            <Sparkles size={12} aria-hidden="true" />
            Measured Impact
          </span>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-[#0D4A52] sm:text-5xl lg:text-[52px]">
            Impact &amp; Delivery
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#6B7280] sm:text-lg">
            We translate strategic donation metrics into concrete human outcomes
            so you see exactly how your resource distribution drives change at
            the grassroots level.
          </p>
        </div>

        <div className="mb-20 sm:mb-24">
          <SectionDivider />
        </div>

        {/* Impact tiers */}
        <div
          className="relative -mx-4 rounded-[28px] px-4 py-14 sm:-mx-6 sm:px-6 sm:py-16"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,252,247,0.9) 0%, rgba(255,244,234,0.6) 100%)",
          }}
        >
          <div className="mb-10 text-center">
            <Eyebrow>Ways to Give</Eyebrow>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {IMPACT_TIERS.map((tier, index) => (
              <TierCard key={tier.amount} tier={tier} index={index} />
            ))}
          </div>
        </div>

        <div className="my-20 sm:my-24">
          <SectionDivider />
        </div>

        {/* Outcomes + Policy */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          <div
            className="animate-fade-in-up rounded-[20px] border border-[#F0E0D0]/90 p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#E0954D]/50 hover:shadow-[0_8px_32px_-12px_rgba(232,116,26,0.15)]"
            style={{
              background: "linear-gradient(160deg, #FFFFFF 0%, #FFFCF7 100%)",
              boxShadow: "0 2px 12px -6px rgba(31,41,55,0.05), 0 20px 40px -24px rgba(31,41,55,0.1)",
            }}
          >
            <Eyebrow>
              <span className="justify-start">Outcomes</span>
            </Eyebrow>
            <p className="mb-6 font-display text-xl font-semibold text-[#1F2937]">
              Long-Term Change Outcomes
            </p>
            <ul className="space-y-4">
              {OUTCOMES.map((outcome) => (
                <li key={outcome} className="flex items-start gap-3 text-sm leading-relaxed text-[#4B5563]">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#E8741A]" aria-hidden="true" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="animate-fade-in-up rounded-[20px] border border-[#F0E0D0]/90 p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#E0954D]/50 hover:shadow-[0_8px_32px_-12px_rgba(232,116,26,0.15)]"
            style={{
              animationDelay: "80ms",
              background: "linear-gradient(160deg, #FFFFFF 0%, #FFFCF7 100%)",
              boxShadow: "0 2px 12px -6px rgba(31,41,55,0.05), 0 20px 40px -24px rgba(31,41,55,0.1)",
            }}
          >
            <Eyebrow>
              <span className="justify-start">Policy</span>
            </Eyebrow>
            <div className="mb-6 flex items-center gap-3.5">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(232,116,26,0.1)" }}
              >
                <Landmark size={21} strokeWidth={1.75} className="text-[#E8741A]" aria-hidden="true" />
              </div>
              <p className="font-display text-xl font-semibold text-[#1F2937]">
                Strategic Policy Alignment
              </p>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-[#6B7280]">
              Our operational initiatives achieve direct system-level change
              systematically aligned with the National Education Policy (NEP)
              2020 and the National ECCE Policy 2013.
            </p>

            <div
              className="relative mb-5 rounded-[16px] py-4 pl-10 pr-4 text-[13px] italic leading-relaxed text-[#6B5A4A]"
              style={{
                background: "linear-gradient(135deg, rgba(232,116,26,0.07), rgba(232,116,26,0.02))",
                borderLeft: "3px solid #E8741A",
              }}
            >
              <Quote
                size={15}
                className="absolute left-3.5 top-4 text-[#E8741A]/45"
                aria-hidden="true"
              />
              "NEP 2020 mandates universal quality Early Childhood Education
              provision from age 3, with a target of full ECCE coverage by 2030."
            </div>

            <p className="text-sm font-semibold leading-relaxed text-[#1F2937]">
              The clear governmental mandate acts as a powerful structural
              tailwind for SpaceECE's frameworks across Indian communities.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial wave — soft transition into footer. Every stop here
          (overlay gradient, wave fill) matches the footer's own starting
          color (#FFF8F2) exactly, so there's no visible seam or banding
          where the two components meet. */}
      <div className="relative -mb-px" aria-hidden="true">
        <div
          className="h-16 w-full sm:h-20"
          style={{
            background: "linear-gradient(180deg, transparent 0%, #FFF8F2 100%)",
          }}
        />
        <svg
          className="block w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
            fill="#FFF8F2"
          />
        </svg>
      </div>
    </div>
  );
}

export default ImpactPage;
