import React from "react";

/**
 * CriticalWindowCard
 * "The Critical 1,000-Day Window" section — description text,
 * a row of stage icons, and a bottom label strip.
 */
export default function CriticalWindowCard() {
  const stages = [
    { label: "Baby" },
    { label: "1 - 2 Years" },
    { label: "Toddler" },
  ];

  const bottomLabels = [
    "Core development",
    "Mental Growth",
    "Nurturing Care",
    "Early learning",
  ];

  return (
    <div className="bg-[#FDF6EC] border border-[#1A1A1A]/10 rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold text-[#0D4A52] mb-4">
        The Critical 1,000-Day Window
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Text column */}
        <div className="md:col-span-2 text-sm text-[#1A1A1A]/80 space-y-4">
          <p>
            The first 1,000 days of a child's life—from conception to age
            2—form a staggering 80% of human brain architecture. Missing
            this definitive biological window compounds systemic
            disadvantage across an individual's entire lifetime.
          </p>
          <p>
            Sourced from SpacECE's nurturing care documentation, our field
            operations align directly with the joint WHO, UNICEF and World
            Bank Nurturing Care Framework, engineered along five core
            developmental components.
          </p>
        </div>

        {/* Stage icons column */}
        <div className="bg-[#0D4A52]/5 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="flex gap-6 mb-2">
            {stages.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-[#E8741A]/20" />
                <span className="text-xs text-[#1A1A1A]/70">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-[#1A1A1A]/80 text-center">
            80% Brain Architecture Formed
          </p>
        </div>
      </div>

      {/* Bottom label strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-[#1A1A1A]/10 pt-4">
        {bottomLabels.map((label, i) => (
          <p
            key={i}
            className="text-xs font-medium text-center text-[#1A1A1A]/70"
          >
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}   