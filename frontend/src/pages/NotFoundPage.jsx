import { Link } from "react-router-dom";
import { Home, HeartHandshake, ArrowRight, Compass } from "lucide-react";

// Matches the established site language (HeroSection.jsx / VisionMission.jsx):
// mesh-gradient backdrop with soft orange/teal orbs, Playfair Display for the
// big display type, solid gradient primary button + bordered secondary
// button — no glassmorphism here since there's no photo/hero image behind it.
export default function NotFoundPage() {
  return (
    <section className="relative flex min-h-[80vh] w-full items-center overflow-hidden px-6 py-24 lg:px-12">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 620px at 8% 0%, rgba(230,126,34,0.2), transparent 55%), radial-gradient(900px 620px at 96% 100%, rgba(20,148,140,0.2), transparent 55%), var(--color-brand-bg)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-[8%] top-[20%] h-24 w-24 rounded-full blur-2xl"
        style={{ background: "var(--color-brand-orange)", opacity: 0.3 }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[14%] right-[10%] h-32 w-32 rounded-full blur-2xl"
        style={{ background: "var(--color-brand-teal)", opacity: 0.28 }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-[640px] flex-col items-center text-center">
        <span
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl shadow-md"
          style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-orange-hover))" }}
        >
          <Compass size={34} className="text-white" aria-hidden="true" />
        </span>

        <p
          className="mb-3 text-7xl font-bold leading-none lg:text-8xl"
          style={{
            backgroundImage: "linear-gradient(90deg, var(--color-brand-orange), var(--color-brand-teal))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          404
        </p>

        <h1
          className="mb-4 text-2xl font-bold lg:text-3xl"
          style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
        >
          This page wandered off
        </h1>

        <p className="mb-10 max-w-[440px] text-base text-gray-600">
          The page you're looking for doesn't exist or may have moved. Let's
          get you back to somewhere that does.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-2xl"
            style={{
              backgroundImage: "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-orange-hover))",
              boxShadow: "0 12px 30px -8px rgba(230,126,34,0.55)",
            }}
          >
            <Home size={17} aria-hidden="true" />
            Back to home
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-3.5 font-semibold shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            style={{ color: "var(--color-brand-dark)" }}
          >
            <HeartHandshake size={17} style={{ color: "var(--color-brand-teal)" }} aria-hidden="true" />
            Donate instead
          </Link>
        </div>
      </div>
    </section>
  );
}