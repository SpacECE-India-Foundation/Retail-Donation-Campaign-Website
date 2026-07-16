export const CampaignProgress = () => {
  const goal = 500000;
  const raised = 210000;
  const percentage = Math.min((raised / goal) * 100, 100);

  return (
    <section
      className="w-full py-16 px-6"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="mx-auto max-w-[800px] text-center">
        <p
          className="text-sm font-bold tracking-wide uppercase mb-2"
          style={{ color: "var(--color-brand-orange)" }}
        >
          Campaign Progress
        </p>
        <h2
          className="text-2xl lg:text-3xl font-bold mb-8"
          style={{
            color: "var(--color-brand-dark)",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          Help Us Reach Our Goal
        </h2>

        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: '${percentage}%',
              background: "var(--color-brand-orange)",
            }}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-600 mb-8">
          <span className="font-semibold" style={{ color: "var(--color-brand-dark)" }}>
            ₹{raised.toLocaleString("en-IN")} raised
          </span>
          <span>Goal: ₹{goal.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </section>
  );
};