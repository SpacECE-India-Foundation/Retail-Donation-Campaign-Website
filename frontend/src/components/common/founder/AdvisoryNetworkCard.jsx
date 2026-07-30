import { Sparkles } from "lucide-react";

function initialsOf(name) {
  return name
    .replace(/^(Dr|Ms|Mr|Mrs)\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * AdvisoryNetworkCard
 * Editorial "Advisory Network" block — a section header followed by a
 * grid of compact mini profile rows (avatar initials + name + org)
 * instead of one dense list crammed into a single box.
 * `members` is an array of { name, org }.
 */
export default function AdvisoryNetworkCard({
  title = "Advisory Network",
  subtitle = "Experts guiding our mission",
  note,
  members = [],
}) {
  return (
    <div>
      <div className="mx-auto mb-8 max-w-xl text-center">
        <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8741A]">
          <Sparkles size={12} aria-hidden="true" />
          {title}
        </p>
        <h2 className="mt-2.5 font-display text-3xl font-semibold tracking-tight text-[#1F2937] sm:text-4xl">
          {subtitle}
        </h2>
        {note && <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-[#6B7280]">{note}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {members.map((m, i) => (
          <div
            key={i}
            className="group flex items-center gap-4 rounded-2xl border border-[#F3D6BE] bg-white/70 p-3.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#E0954D] hover:bg-white hover:shadow-[0_8px_24px_-14px_rgba(232,116,26,0.25)]"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold"
              style={{ background: "rgba(232,116,26,0.12)", color: "#B65314" }}
            >
              {initialsOf(m.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-[15px] font-semibold text-[#1F2937]">{m.name}</p>
              {m.org && <p className="truncate text-xs leading-relaxed text-[#6B7280]">{m.org}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
