import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Megaphone, FileText, Award } from "lucide-react";
import { cn } from "../../utils/cn";
import AnimatedCounter from "./AnimatedCounter";

const TRUST_ITEMS = [
  {
    key: "verified",
    label: "Verified Donations",
    description: "Every contribution is reviewed and confirmed before it counts.",
    icon: ShieldCheck,
    statKey: "totalDonations",
    format: (n) => n.toLocaleString("en-IN"),
  },
  {
    key: "campaigns",
    label: "Active Campaigns",
    description: "Ongoing initiatives with clear goals and transparent progress.",
    icon: Megaphone,
    statKey: "totalCampaigns",
    format: (n) => n.toLocaleString("en-IN"),
  },
  {
    key: "reports",
    label: "Impact Reports",
    description: "Regular updates on how funds are allocated and outcomes achieved.",
    icon: FileText,
    statKey: null,
  },
  {
    key: "certificates",
    label: "80G Certificates",
    description: "Eligible donors receive tax exemption certificates for their giving.",
    icon: Award,
    statKey: null,
  },
];

export default function SolutionTrustSection({ statistics }) {
  return (
    <section className="border-t border-[#ECE6DD] bg-[#F8F4EE] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8741A]">
            Accountability
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#1F2937] sm:text-5xl">
            Trust & Transparency
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#6B7280]">
            We believe every donor deserves complete visibility into how their
            contribution creates change.
          </p>
        </div>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            const statValue = item.statKey ? statistics?.[item.statKey] ?? 0 : null;

            return (
              <div key={item.key} className="group relative h-full">
                <div
                  className="pointer-events-none absolute -inset-3 -z-10 rounded-[26px] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                  style={{
                    background: "radial-gradient(circle at 50% 20%, rgba(232,116,26,0.3), transparent 72%)",
                  }}
                  aria-hidden="true"
                />

                <div
                  className="h-full rounded-[20px] border border-[#1F2937]/[0.06] p-6 text-center backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-1.5 lg:text-left"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(255,253,248,0.6) 100%)",
                    boxShadow:
                      "0 2px 8px -4px rgba(31,41,55,0.05), 0 16px 36px -26px rgba(31,41,55,0.14)",
                  }}
                >
                  <div
                    className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl lg:mx-0"
                    style={{
                      background: "linear-gradient(160deg, rgba(232,116,26,0.14), rgba(232,116,26,0.05))",
                      boxShadow: "0 10px 24px -16px rgba(232,116,26,0.35)",
                    }}
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="text-[#E8741A]"
                      aria-hidden="true"
                    />
                  </div>

                  {statValue !== null && (
                    <p className="font-display text-3xl font-semibold text-[#1F2937]">
                      <AnimatedCounter value={statValue} format={item.format} />
                    </p>
                  )}

                  <h3
                    className={cn(
                      "font-display text-lg font-semibold text-[#1F2937]",
                      statValue !== null ? "mt-2" : "mt-0",
                    )}
                  >
                    {item.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 flex justify-center sm:mt-20">
          <Link
            to="/documents"
            className="group inline-flex items-center gap-2 rounded-full border border-[#ECE6DD] bg-[#FFFDF8] px-6 py-3 text-sm font-semibold text-[#1F2937] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E8741A]/30 hover:text-[#E8741A]"
          >
            View our certificates &amp; reports
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
