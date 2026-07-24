import { HandHeart, Users, Building2, CalendarDays, ArrowUpRight } from "lucide-react";

export const StatsStrip = () => {
  const secondaryStats = [
    { number: "400+", label: "Families engaged", icon: Users, accent: "var(--color-brand-teal)" },
    { number: "30+", label: "Anganwadis partnered", icon: Building2, accent: "var(--color-brand-orange)" },
    { number: "8+", label: "Years of field presence", icon: CalendarDays, accent: "var(--color-brand-teal)" },
  ];

  return (
    <section className="w-full px-6 py-16 lg:py-20" style={{ background: "var(--color-brand-bg)" }}>
      <div className="mx-auto grid max-w-[1200px] gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        {/* Featured stat — bold gradient card, spans 2 of 5 columns so the row fills exactly.
            An oversized outline icon watermark gives it a graphic, editorial feel instead
            of just being a big number on a flat color — that's what read as "boring". */}
        <div
          className="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl p-8 shadow-xl sm:col-span-2 lg:col-span-2"
          style={{ backgroundImage: "linear-gradient(135deg, var(--color-brand-orange), var(--color-brand-orange-hover))" }}
        >
          <HandHeart
            className="pointer-events-none absolute -bottom-8 -right-8 text-white/10"
            size={200}
            strokeWidth={1.2}
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <HandHeart size={22} className="text-white" aria-hidden="true" />
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              <ArrowUpRight size={13} aria-hidden="true" />
              Live impact
            </span>
          </div>

          <div className="relative">
            <p
              className="text-5xl font-bold text-white lg:text-6xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              1,500+
            </p>
            <p className="mt-2 text-sm font-medium text-white/85">Children directly reached</p>
          </div>
        </div>

        {secondaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <span
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${stat.accent}1f`, color: stat.accent }}
              >
                <Icon size={20} aria-hidden="true" />
              </span>
              <p
                className="text-3xl font-bold"
                style={{ color: "var(--color-brand-dark)", fontFamily: "'Playfair Display', serif" }}
              >
                {stat.number}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};