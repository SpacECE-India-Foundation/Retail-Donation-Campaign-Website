import { Eye, Target, AlertCircle } from "lucide-react";

export const VisionMission = () => {
  const realities = [
    "India has 1.37 million Anganwadi centres (part of ICDS) but persistent quality gaps in early stimulation for children under 3.",
    "Disparities across states and socioeconomic strata mean millions of children start school behind, and never catch up.",
    "Parents and caregivers lack trained support to create nurturing, stimulating home environments during the 0–8 window.",
    "High dropout rates and learning deficits in primary school trace directly back to inadequate early childhood development.",
    "Frontline ICDS workers often lack the tools, training, and support to implement quality ECE programming at scale.",
  ];

  return (
    <section className="w-full px-6 py-16 lg:py-24" style={{ background: "var(--color-brand-bg)" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-14 text-center">
          <h2
            className="mb-4 text-3xl font-bold lg:text-4xl"
            style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
          >
            Why SpacECE exists
          </h2>
          <p className="mx-auto max-w-[600px] text-gray-600">
            Understanding our organisation's core fundamental beliefs and the
            critical, developmental resource gaps we aim to bridge across
            India.
          </p>
        </div>

        {/* Vision / Mission cards */}
        <div className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="group rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <span
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
              style={{ background: "rgba(230,126,34,0.12)", color: "var(--color-brand-orange)" }}
            >
              <Eye size={22} aria-hidden="true" />
            </span>
            <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--color-brand-orange)" }}>
              Our vision
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              SpacECE aspires to enrich the ecosystem for the holistic
              development of children in the early years.
            </p>
          </div>

          <div className="group rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <span
              className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
              style={{ background: "rgba(20,148,140,0.12)", color: "var(--color-brand-teal)" }}
            >
              <Target size={22} aria-hidden="true" />
            </span>
            <h3 className="mb-2 text-lg font-bold" style={{ color: "var(--color-brand-teal)" }}>
              Our mission
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              SpacECE is a non-profit organisation dedicated to providing
              quality education, promoting lifelong learning, and empowering
              individuals and communities across India. The mission is to
              bridge the educational gap and create equal opportunities for
              all.
            </p>
          </div>
        </div>

        {/* Core Structural Realities */}
        <div className="mb-6 flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "rgba(230,126,34,0.12)", color: "var(--color-brand-orange)" }}
          >
            <AlertCircle size={18} aria-hidden="true" />
          </span>
          <h3
            className="text-xl font-bold lg:text-2xl"
            style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
          >
            The core structural realities we battle
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {realities.map((text, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-orange-hover))" }}
              >
                {index + 1}
              </span>
              <p className="text-sm text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};