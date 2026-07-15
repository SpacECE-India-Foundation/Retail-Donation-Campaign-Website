import React from "react";

/**
 * AdvisoryNetworkCard
 * Shell for the "Advisory Network / Ecosystem Collaborators" list.
 * `members` is an array of { name, org }.
 */
export default function AdvisoryNetworkCard({
  title = "Advisory Network",
  subtitle = "ECOSYSTEM COLLABORATORS",
  note,
  members = [],
}) {
  return (
    <div className="bg-[#FDF6EC] border border-[#1A1A1A]/10 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-display text-lg font-semibold text-[#1A1A1A]">
          {title}
        </h3>
        {/* Icon placeholder (globe/network icon in Figma) */}
        <div className="w-8 h-8 rounded-full bg-[#0D4A52]/10 shrink-0" />
      </div>

      <p className="text-xs font-semibold tracking-wide text-[#1A1A1A]/70 mb-1">
        {subtitle}
      </p>
      {note && (
        <p className="text-xs text-[#1A1A1A]/50 mb-4">{note}</p>
      )}

      <ul className="text-sm text-[#1A1A1A]/80 divide-y divide-[#1A1A1A]/10">
        {members.map((m, i) => (
          <li key={i} className="py-2">
            <span className="font-semibold">{m.name}</span>
            {m.org && (
              <span className="block text-[#1A1A1A]/60">{m.org}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}