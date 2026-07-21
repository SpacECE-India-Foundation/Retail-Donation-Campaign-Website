import visionIcon from "../../assets/icons/vision-icon.png";
import missionIcon from "../../assets/icons/mission-icon.png";

export const VisionMission = () => {
  const realities = [
    "India has 1.37 million Anganwadi centres (part of ICDS) but persistent quality gaps in early stimulation for children under 3.",
    "Disparities across states and socioeconomic strata mean millions of children start school behind, and never catch up.",
    "Parents and caregivers lack trained support to create nurturing, stimulating home environments during the 0–8 window.",
    "High dropout rates and learning deficits in primary school trace directly back to inadequate early childhood development.",
    "Frontline ICDS workers often lack the tools, training, and support to implement quality ECE programming at scale.",
  ];

  return (
    <section className="w-full py-16 lg:py-20 px-6" style={{ background: "#FFFFFF" }}>
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center mb-12">
          <h2
            className="text-3xl lg:text-4xl font-bold mb-4"
            style={{
              color: "var(--color-brand-dark)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Why SpacECE Exists
          </h2>
          <p className="text-gray-600 max-w-[600px] mx-auto">
            Understanding our organisation's core fundamental beliefs and the
            critical, developmental resource gaps we aim to bridge across
            India.
          </p>
        </div>

        {/* Vision / Mission cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          <div
            className="p-6 rounded-2xl border flex gap-4 items-start"
            style={{
              background: "var(--color-brand-bg)",
              borderColor: "var(--color-brand-orange)",
            }}
          >
            <img
              src={visionIcon}
              alt="Our Vision"
              className="w-16 h-16 flex-shrink-0 rounded-lg object-contain"
            />
            <div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "var(--color-brand-orange)" }}
              >
                Our Vision
              </h3>
              <p className="text-sm text-gray-600">
                SpacECE aspires to enrich the ecosystem for the holistic
                development of children in the early years.
              </p>
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border flex gap-4 items-start"
            style={{ background: "#F0F6F7", borderColor: "var(--color-brand-teal)" }}
          >
            <img
              src={missionIcon}
              alt="Our Mission"
              className="w-16 h-16 flex-shrink-0 rounded-lg object-contain"
            />
            <div>
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: "var(--color-brand-teal)" }}
              >
                Our Mission
              </h3>
              <p className="text-sm text-gray-600">
                SpacECE is a non-profit organisation dedicated to providing
                quality education, promoting lifelong learning, and
                empowering individuals and communities across India. The
                mission is to bridge the educational gap and create equal
                opportunities for all.
              </p>
            </div>
          </div>
        </div>

        {/* Core Structural Realities */}
        <h3
          className="text-xl lg:text-2xl font-bold mb-6"
          style={{
            color: "var(--color-brand-dark)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          The Core Structural Realities We Battle
        </h3>

        <div className="flex flex-col gap-3">
          {realities.map((text, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: "var(--color-brand-bg)" }}
            >
              <span
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ background: "var(--color-brand-orange)" }}
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