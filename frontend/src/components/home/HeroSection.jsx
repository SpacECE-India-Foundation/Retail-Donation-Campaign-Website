import { Link } from "react-router-dom";
import heroImg from "../../assets/hero.png";

export const HeroSection = () => {
  return (
    <section
      className="w-full py-16 lg:py-24 px-6 lg:px-12"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="mx-auto max-w-[1200px] flex flex-col lg:flex-row items-center gap-12">
        {/* Text content */}
        <div className="flex-1 text-center lg:text-left">
          <p
            className="text-sm font-bold tracking-wide uppercase mb-4"
            style={{ color: "var(--color-brand-orange)" }}
          >
            SpacECE India Foundation
          </p>
          <h1
            className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            style={{
              color: "var(--color-brand-dark)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Empowering Futures Through Early Childhood Education
          </h1>
          <p className="text-base lg:text-lg text-gray-600 mb-8 max-w-[520px] mx-auto lg:mx-0">
            Every child deserves a strong start. Your donation helps bring
            quality early education to children aged 0–8 across underserved
            communities in Pune.
          </p>
          <Link
            to="/donate"
            className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-colors"
            style={{ background: "var(--color-brand-orange)" }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background =
                "var(--color-brand-orange-hover)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "var(--color-brand-orange)")
            }
          >
            Donate Now
          </Link>
        </div>

        {/* Image */}
        <div className="flex-1 flex justify-center">
          <img
            src={heroImg}
            alt="Children learning at SpacECE"
            className="w-full max-w-[480px] rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
};