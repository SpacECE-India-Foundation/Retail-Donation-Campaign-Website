import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export const AboutHero = () => {
  return (
    <section className="relative w-full overflow-hidden px-6 py-20 text-center lg:py-28">
      {/* Same soft mesh-gradient treatment as the home page hero, kept subtler here */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 500px at 10% 0%, rgba(230,126,34,0.18), transparent 55%), radial-gradient(800px 500px at 95% 100%, rgba(20,148,140,0.18), transparent 55%), var(--color-brand-bg)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[800px]">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-md"
          style={{ background: "rgba(255,255,255,0.55)", color: "var(--color-brand-orange)", border: "1px solid rgba(255,255,255,0.6)" }}
        >
          <Sparkles size={14} aria-hidden="true" />
          Retail Donation Campaign 2026
        </div>

        <h1
          className="mb-6 text-4xl font-bold leading-tight lg:text-5xl"
          style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
        >
          Every child deserves a{" "}
          <span
            className="italic"
            style={{
              backgroundImage: "linear-gradient(90deg, var(--color-brand-orange), var(--color-brand-teal))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            brilliant start
          </span>{" "}
          in life
        </h1>

        <p className="mx-auto mb-9 max-w-[650px] text-base text-gray-600 lg:text-lg">
          SpacECE focuses on children aged 0 to 8 years — the pivotal period
          of unparalleled growth and development. We believe that the
          foundations of all learning are laid during these transformative
          years, setting the stage for a lifetime of educational achievement.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/donate"
            className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-2xl"
            style={{
              backgroundImage: "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-orange-hover))",
              boxShadow: "0 12px 30px -8px rgba(230,126,34,0.5)",
            }}
          >
            Donate now
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold shadow-sm backdrop-blur-md transition hover:-translate-y-1"
            style={{ background: "rgba(255,255,255,0.6)", color: "var(--color-brand-dark)", border: "1px solid rgba(255,255,255,0.7)" }}
          >
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
};