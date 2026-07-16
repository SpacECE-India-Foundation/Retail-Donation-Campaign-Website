import { Link } from "react-router-dom";

export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Scan or tap at checkout",
      description:
        "Find the BrightMinds QR at any partner retail counter and scan with any UPI app.",
    },
    {
      number: 2,
      title: "Choose your amount",
      description:
        "₹10, ₹25, ₹50, ₹100 — or round up your bill. Every rupee is tracked and used.",
    },
    {
      number: 3,
      title: "Get your 80G receipt",
      description:
        "An automated tax receipt is sent to your email within 48 hours of every donation.",
    },
  ];

  return (
    <section className="w-full">
      {/* How it Works block */}
      <div className="mx-auto max-w-[1000px] px-6 lg:px-8 py-16">
        <p
          className="text-sm font-bold tracking-wide uppercase mb-2"
          style={{ color: "var(--color-brand-orange)" }}
        >
          How it Works
        </p>
        <h2
          className="text-3xl lg:text-4xl font-bold mb-10"
          style={{
            color: "var(--color-brand-dark)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Three simple steps to change a life
        </h2>

        <div className="flex flex-col gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-4 items-start">
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "var(--color-brand-orange)" }}
              >
                {step.number}
              </span>
              <div>
                <h3
                  className="text-lg font-semibold mb-1"
                  style={{ color: "var(--color-brand-dark)" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div
        className="w-full py-16 px-6 text-center"
        style={{ background: "#FCEBD9" }}
      >
        <h3
          className="text-2xl lg:text-3xl font-bold mb-2"
          style={{
            color: "var(--color-brand-dark)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          ₹1,000 = 6 months of learning
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Your donation is measurable, traceable, and transformational.
        </p>
        <Link
          to="/donate"
          className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-colors"
          style={{ background: "var(--color-brand-orange)" }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "var(--color-brand-orange-hover)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "var(--color-brand-orange)")
          }
        >
          Start Donating
        </Link>
      </div>
    </section>
  );
};