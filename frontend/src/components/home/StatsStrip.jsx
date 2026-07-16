export const StatsStrip = () => {
  const stats = [
    { number: "1,500+", label: "Children directly reached" },
    { number: "400+", label: "Families engaged" },
    { number: "30+", label: "Anganwadis partnered" },
    { number: "8+", label: "Years of field presence" },
  ];

  return (
    <section
      className="w-full py-12 px-6"
      style={{ background: "var(--color-brand-teal)" }}
    >
      <div className="mx-auto max-w-[1200px] grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p
              className="text-3xl lg:text-4xl font-bold mb-2 text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {stat.number}
            </p>
            <p className="text-sm text-gray-200">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};