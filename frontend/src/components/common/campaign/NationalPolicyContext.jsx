import React from "react";

/**
 * NationalPolicyContext
 * "National Policy Context" card — intro text + checklist of
 * policy alignments, with a closing note.
 */
export default function NationalPolicyContext({ policies = [], note }) {
  return (
    <div className="bg-[#FDF6EC] border border-[#1A1A1A]/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-[#1A1A1A]">
          National Policy Context
        </h2>
        {/* Icon placeholder */}
        <div className="w-10 h-10 rounded-lg bg-[#0D4A52]/10 shrink-0" />
      </div>

      <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">
        Macro Infrastructure Alignment
      </h3>
      <p className="text-xs text-[#1A1A1A]/70 mb-4">
        How our programs build synchronously upon India's verified official
        public education platforms:
      </p>

      <ul className="space-y-3 mb-4">
        {policies.map((p, i) => (
          <li key={i} className="flex gap-2">
            {/* Checkmark placeholder */}
            <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-700 text-xs flex items-center justify-center shrink-0 mt-0.5">
              ✓
            </span>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {p.title}
              </p>
              <p className="text-xs text-[#1A1A1A]/70">{p.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {note && (
        <p className="text-xs font-medium text-[#1A1A1A]/60 mt-auto">
          {note}
        </p>
      )}
    </div>
  );
}