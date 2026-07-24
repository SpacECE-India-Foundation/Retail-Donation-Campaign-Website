import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, CalendarDays, Users, Sparkles, HandHeart, TrendingUp } from "lucide-react";
import heroImg from "../../assets/logo2.png";

export const HeroSection = () => {
  return (
    <section className="relative -mt-24 w-full overflow-hidden px-6 pb-24 pt-40 lg:px-12 lg:pb-32 lg:pt-48">
      {/* Vivid mesh-gradient backdrop — this is the whole point, no flat single color.
          Orange and teal are kept apart (top-left vs bottom-right corners, both with a lot
          of transparent falloff) so they never overlap and muddy into a brownish tone in
          the middle — the cream base shows through as a neutral buffer between them. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 620px at 8% 0%, rgba(230,126,34,0.24), transparent 55%), radial-gradient(900px 620px at 96% 100%, rgba(20,148,140,0.24), transparent 55%), var(--color-brand-bg)",
        }}
        aria-hidden="true"
      />
      {/* Floating orbs for depth */}
      <div
        className="pointer-events-none absolute left-[6%] top-[18%] h-24 w-24 rounded-full blur-2xl"
        style={{ background: "var(--color-brand-orange)", opacity: 0.35 }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[10%] right-[8%] h-32 w-32 rounded-full blur-2xl"
        style={{ background: "var(--color-brand-teal)", opacity: 0.3 }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Text content */}
        <div className="text-center lg:text-left">
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-md"
            style={{ background: "rgba(255,255,255,0.55)", color: "var(--color-brand-orange)", border: "1px solid rgba(255,255,255,0.6)" }}
          >
            <Sparkles size={14} aria-hidden="true" />
            SpacECE India Foundation
          </div>

          <h1
            className="mb-7 text-5xl font-bold leading-[1.05] tracking-tight lg:text-7xl"
            style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
          >
            Empowering{" "}
            <span
              className="italic"
              style={{
                backgroundImage: "linear-gradient(90deg, var(--color-brand-orange), var(--color-brand-teal))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              futures
            </span>{" "}
            through early childhood education
          </h1>

          <p className="mx-auto mb-10 max-w-[500px] text-base text-gray-600 lg:mx-0 lg:text-lg">
            Every child deserves a strong start. Your donation helps bring
            quality early education to children aged 0–8 across underserved
            communities in Pune.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/donate"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-9 py-4 font-semibold text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-2xl"
              style={{
                backgroundImage: "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-orange-hover))",
                boxShadow: "0 12px 30px -8px rgba(230,126,34,0.55)",
              }}
            >
              Donate Now
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              to="/impact"
              className="inline-flex items-center gap-2 rounded-full px-9 py-4 font-semibold shadow-sm backdrop-blur-md transition hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.6)", color: "var(--color-brand-dark)", border: "1px solid rgba(255,255,255,0.7)" }}
            >
              See Our Impact
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
              <ShieldCheck size={16} style={{ color: "var(--color-brand-teal)" }} aria-hidden="true" />
              80G tax exempt
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
              <CalendarDays size={16} style={{ color: "var(--color-brand-teal)" }} aria-hidden="true" />
              8+ years in the field
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
              <Users size={16} style={{ color: "var(--color-brand-teal)" }} aria-hidden="true" />
              1,500+ children reached
            </span>
          </div>
        </div>

        {/* Image — plain, no card/blob/shadow behind it. This is a logo mark with a
            transparent background, not a photo, so it should just sit directly on the
            page and pop on its own rather than being boxed into a frame. A drop-shadow
            filter (not a background box) still gives it some lift, following the actual
            silhouette of the artwork instead of a rectangular/blob outline. */}
        <div className="relative mx-auto flex w-full max-w-[520px] items-center justify-center">
          <img
            src={heroImg}
            alt="SpacECE India Foundation"
            className="w-full max-w-[460px] object-contain"
            style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))" }}
          />

          {/* Floating glass card — top right */}
          <div
            className="absolute -right-4 top-2 flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md sm:-right-8"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.8)" }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(20,148,140,0.15)", color: "var(--color-brand-teal)" }}
            >
              <TrendingUp size={17} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: "var(--color-brand-dark)" }}>
                +400 families
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">engaged this year</p>
            </div>
          </div>

          {/* Floating glass card — bottom left */}
          <div
            className="absolute -bottom-10 -left-8 flex items-center gap-3 rounded-2xl px-5 py-4 shadow-xl backdrop-blur-md sm:-left-12"
            style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)" }}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(230,126,34,0.15)", color: "var(--color-brand-orange)" }}
            >
              <HandHeart size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold leading-none" style={{ color: "var(--color-brand-dark)" }}>
                1,500+
              </p>
              <p className="mt-1 text-xs text-gray-500">children reached</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};