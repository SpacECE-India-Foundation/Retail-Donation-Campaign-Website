import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";

export default function SolutionCTA() {
  return (
    <section className="bg-[#FFFDF8] px-6 py-20 sm:px-8 sm:py-28">
      <div className="relative mx-auto max-w-6xl">
        <div
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[44px] opacity-70 blur-3xl"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(232,116,26,0.28), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="relative overflow-hidden rounded-[24px] transition-shadow duration-500"
          style={{ boxShadow: "0 2px 12px -6px rgba(31,41,55,0.15), 0 34px 70px -32px rgba(31,41,55,0.4)" }}
        >
        <img
          src="/coverImage2.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F2937]/90 via-[#1F2937]/75 to-[#1F2937]/50" />

        <div className="relative px-8 py-20 text-center sm:px-16 sm:py-24 lg:text-left">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:mx-0">
            Together, Every Contribution Creates Change
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg lg:mx-0">
            Join thousands of donors making a real difference in communities
            across India. Your support starts here.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Link
              to="/donate"
              className={cn(
                "inline-flex h-14 items-center justify-center rounded-full bg-[#E8741A] px-8 text-lg font-bold text-white",
                "shadow-[0_8px_32px_-8px_rgba(232,116,26,0.5)] transition-all duration-300",
                "hover:-translate-y-0.5 hover:bg-[#D86712]",
              )}
            >
              Donate Now
              <ArrowRight size={18} className="ml-2" aria-hidden="true" />
            </Link>

            <Link
              to="/campaign"
              className={cn(
                "inline-flex h-14 items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 text-lg font-bold text-white backdrop-blur-sm",
                "transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/20",
              )}
            >
              Explore Campaigns
            </Link>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
