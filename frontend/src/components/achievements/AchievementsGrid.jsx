export const AchievementsGrid = () => {
  const achievements = [
    { icon: "👩‍🏫", number: "5000+", label: "CHILDREN REACHED", tag: "Verified Core Impact" },
    { icon: "🤝", number: "1200+", label: "PARENTS TRAINED (HAALS)", tag: "Verified Core Impact" },
    { icon: "🏛️", number: "80+", label: "ANGANWADIS SUPPORTED", tag: "Verified Core Impact" },
    { icon: "🤲", number: "50+", label: "ECE EXPERTS ENGAGED", tag: "Verified Core Impact" },
    { icon: "🏢", number: "200+", label: "INTERNS TRAINED", tag: "Verified Core Impact" },
    { icon: "🎨", number: "15+", label: "RESEARCH PUBLICATIONS", tag: "Verified Core Impact" },
    { icon: "📅", number: "8+", label: "YEARS OF OPERATION", tag: "Verified Core Impact" },
    { icon: "🏆", number: "Awarded", label: "GUIDESTAR CERTIFICATE", tag: "Credibility Platinum" },
  ];

  return (
    <section
      className="w-full py-16 lg:py-20 px-6"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center mb-12">
          <h1
            className="text-4xl lg:text-5xl font-extrabold mb-4"
            style={{ color: "var(--color-brand-dark)" }}
          >
            Our Track Record
          </h1>
          <p className="text-gray-600 mb-1">
            A comprehensive overview of our field metrics and impact reach.
          </p>
          <p className="text-xs text-gray-500">
            Note: These operational figures are indicative and subject to final data auditing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border-2"
              style={{ borderColor: "var(--color-brand-orange)" }}
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <p
                className="text-2xl font-extrabold mb-1"
                style={{ color: "var(--color-brand-dark)" }}
              >
                {item.number}
              </p>
              <p className="text-xs font-semibold text-gray-600 tracking-wide mb-4">
                {item.label}
              </p>
              <hr className="border-gray-200 mb-3" />
              <p
                className="text-xs font-semibold"
                style={{ color: "var(--color-brand-orange)" }}
              >
                {item.tag}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};