import { Link } from "react-router-dom";

export const AboutHero = () => {
  return (
    <section
      className="w-full py-20 lg:py-28 px-6 text-center"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="mx-auto max-w-[800px]">
        <span
          className="inline-block text-xs font-semibold px-4 py-1.5 rounded-full border mb-6"
          style={{
            color: "var(--color-brand-orange)",
            borderColor: "var(--color-brand-orange)",
          }}
        >
          ● Retail Donation Campaign 2026
        </span>

        <h1
          className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight"
          style={{ color: "var(--color-brand-dark)" }}
        >
          Every child deserves a{" "}
          <span style={{ color: "var(--color-brand-orange)" }}>
            brilliant start
          </span>{" "}
          in life
        </h1>

        <p className="text-base lg:text-lg text-gray-600 mb-8 max-w-[650px] mx-auto">
          SpacECE focuses on children aged 0 to 8 years — the pivotal period
          of unparalleled growth and development. We believe that the
          foundations of all learning are laid during these transformative
          years, setting the stage for a lifetime of educational achievement.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/donate"
            className="px-7 py-3 rounded-full font-semibold text-white transition-colors"
            style={{ background: "var(--color-brand-orange)" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background =
                "var(--color-brand-orange-hover)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "var(--color-brand-orange)")
            }
          >
            Donate now
          </Link>
          <button
            className="px-7 py-3 rounded-full font-semibold border transition-colors"
            style={{
              color: "var(--color-brand-dark)",
              borderColor: "var(--color-brand-dark)",
            }}
          >
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
};