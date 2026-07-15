import React from "react";

/**
 * FounderCard
 * Shell for the primary Founder / Co-Founder card.
 * Pass `isPlaceholder` for the co-founder slot where details
 * aren't finalized yet.
 */
export default function FounderCard({
  name,
  role,
  education = [],
  quote,
  isPlaceholder = false,
}) {
  return (
    <div className="bg-[#FDF6EC] border border-[#1A1A1A]/10 rounded-2xl p-6 flex flex-col h-full">
      {/* Photo placeholder */}
      <div className="w-16 h-16 rounded-full border border-[#1A1A1A]/30 mb-4" />

      {/* Name + role */}
      <h3 className="font-display text-lg font-semibold text-[#1A1A1A]">
        {isPlaceholder ? "[ Co-Founder Profile ]" : name}
      </h3>
      {role && (
        <p className="text-sm text-[#E8741A] font-medium mb-4">{role}</p>
      )}

      {isPlaceholder ? (
        <p className="text-sm text-[#1A1A1A]/60 mb-6">Details to be provided</p>
      ) : (
        education.length > 0 && (
          <ul className="text-sm text-[#1A1A1A]/80 space-y-2 mb-6">
            {education.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )
      )}

      <div className="border-t border-dashed border-[#1A1A1A]/20 pt-4 mt-auto">
        {isPlaceholder ? (
          <p className="text-sm text-center text-[#1A1A1A]/50">
            Details to be provided
          </p>
        ) : (
          quote && (
            <p className="text-sm italic text-[#1A1A1A]/70">"{quote}"</p>
          )
        )}
      </div>
    </div>
  );
}