import { Link } from "react-router-dom";
import { QrCode, Wallet, FileCheck2, Heart, ArrowRight } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: QrCode,
      title: "Scan or tap at checkout",
      description:
        "Find the BrightMinds QR at any partner retail counter and scan with any UPI app.",
    },
    {
      number: 2,
      icon: Wallet,
      title: "Choose your amount",
      description:
        "₹10, ₹25, ₹50, ₹100 — or round up your bill. Every rupee is tracked and used.",
    },
    {
      number: 3,
      icon: FileCheck2,
      title: "Get your 80G receipt",
      description:
        "An automated tax receipt is sent to your email within 48 hours of every donation.",
    },
  ];

  return (
    <section className="w-full" style={{ background: "var(--color-brand-bg)" }}>
      {/* How it Works block */}
      <div className="mx-auto max-w-[1100px] px-6 py-16 lg:py-24 lg:px-8">
        <div className="mb-14 text-center">
          <p
            className="mb-2 text-sm font-bold uppercase tracking-wide"
            style={{ color: "var(--color-brand-orange)" }}
          >
            How it works
          </p>
          <h2
            className="text-3xl font-bold lg:text-4xl"
            style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
          >
            Three simple steps to change a life
          </h2>
        </div>

        <div className="relative grid gap-6 md:grid-cols-3 md:gap-8">
          {/* Gradient rail connecting the steps, desktop only */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-0.5 md:block"
            style={{
              background: "linear-gradient(90deg, var(--color-brand-orange), var(--color-brand-teal))",
              marginLeft: "calc(100% / 6)",
              marginRight: "calc(100% / 6)",
            }}
            aria-hidden="true"
          />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group relative rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-orange-hover))" }}
                  >
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "var(--color-brand-dark)" }}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-brand-dark)" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA banner — bold gradient with organic blobs */}
      <div
        className="relative w-full overflow-hidden px-6 py-16 lg:py-24"
        style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-teal))" }}
      >
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-[800px] flex-col items-center gap-5 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <Heart size={28} className="text-white" aria-hidden="true" />
          </span>
          <h3
            className="text-3xl font-bold text-white lg:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            ₹1,000 = 6 months of learning
          </h3>
          <p className="max-w-[440px] text-sm text-white/90 lg:text-base">
            Your donation is measurable, traceable, and transformational.
          </p>
          <Link
            to="/donate"
            className="group mt-2 inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 font-semibold shadow-xl transition-transform hover:-translate-y-1"
            style={{ color: "var(--color-brand-orange)" }}
          >
            Start donating
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};