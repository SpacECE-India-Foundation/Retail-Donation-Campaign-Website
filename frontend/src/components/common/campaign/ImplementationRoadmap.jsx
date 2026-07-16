import React from "react";

/**
 * ImplementationRoadmap
 * Vertical timeline / stepper of roadmap phases.
 * `phases` is an array of { month, title, description }.
 */
export default function ImplementationRoadmap({ phases = [] }) {
  return (
    <div className="bg-[#FDF6EC] border border-[#1A1A1A]/10 rounded-2xl p-6 h-full">
      <h2 className="font-display text-lg font-bold text-[#1A1A1A] mb-6">
        Implementation Roadmap
      </h2>

      <ol className="relative border-l border-[#E8741A]/40 pl-6 space-y-6">
        {phases.map((phase, i) => (
          <li key={i} className="relative">
            {/* Timeline dot */}
            <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-[#FDF6EC] border-2 border-[#E8741A]" />

            <div className="bg-[#1A1A1A]/5 rounded-lg p-4">
              <p className="text-xs font-semibold text-[#E8741A] uppercase mb-1">
                {phase.month}
              </p>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">
                {phase.title}
              </h3>
              <p className="text-xs text-[#1A1A1A]/70">
                {phase.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}