import { useState } from "react";
import { ChevronDown, GraduationCap, Briefcase, Award } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * FounderCard — editorial leadership profile (not a boxed dashboard card).
 *
 * Composition, not decoration: a large portrait on one side, left-aligned
 * story on the other — image/name/role/tagline first, metrics and chips
 * pushed down and de-emphasised, "Leadership Journey" accordion last.
 * `reverse` flips which side the photo sits on so two stacked founders read
 * as an alternating editorial spread rather than two identical boxes.
 *
 * All facts (education, experiencePoints, focusAreas, quote, experienceYears)
 * are the same static data as before — only `tagline` is new copy (a short,
 * warm mission line), everything else is unchanged information, just
 * recomposed.
 */
export default function FounderCard({
  name,
  role,
  image,
  experienceYears,
  bio,
  tagline,
  experiencePoints = [],
  education = [],
  achievements = [],
  focusAreas = [],
  quote,
  reverse = false,
  isPlaceholder = false,
}) {
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("experience");

  if (isPlaceholder) {
    return (
      <div className="relative flex flex-col items-center rounded-[24px] border border-dashed border-[#E0D5C8] bg-white/40 p-7 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[20px] border-2 border-dashed border-[#E0D5C8] text-lg font-semibold text-[#C7B8A8]">
          ?
        </div>
        <h3 className="font-display text-lg font-semibold text-[#9A8B7A]">
          Team Profile
        </h3>
        <p className="mt-1 text-sm text-[#B3A594]">Details to be added</p>
        <p className="pt-8 text-xs leading-relaxed text-[#C7B8A8]">
          This profile is reserved for a future leadership team member.
        </p>
      </div>
    );
  }

  const openJourney = () => {
    setJourneyOpen(true);
    setActiveSection("experience");
  };

  const closeJourney = () => setJourneyOpen(false);

  const toggleSection = (key) => {
    setActiveSection((prev) => (prev === key ? null : key));
  };

  const metaLine = [
    experienceYears ? `${experienceYears}+ Years` : null,
    focusAreas.length > 0 ? `${focusAreas.length} Domains` : null,
    education.length > 0 ? `${education.length} Qualifications` : null,
  ]
    .filter(Boolean)
    .join("   ·   ");

  const hasJourneyContent =
    experiencePoints.length > 0 || bio || education.length > 0 || achievements.length > 0;

  return (
    <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-12">
      {/* Ambient glow — the same warm accent used across the page background,
          so the founder photo reads as part of the page rather than a card
          floating on top of it. */}
      <div
        className={cn(
          "pointer-events-none absolute -z-10 h-[420px] w-[420px] opacity-70 blur-3xl",
          reverse ? "-right-16 top-0" : "-left-16 top-0",
        )}
        style={{ background: "radial-gradient(circle, rgba(232,116,26,0.14), transparent 70%)" }}
        aria-hidden="true"
      />

      {/* ---------------- Portrait ---------------- */}
      <div className={cn("md:col-span-5", reverse && "md:order-2")}>
        <div
          className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-[28px] md:mx-0 md:max-w-[380px]"
          style={{ boxShadow: "0 24px 48px -20px rgba(232,116,26,0.35)" }}
        >
          <img src={image} alt={name} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* ---------------- Story ---------------- */}
      <div className={cn("md:col-span-7", reverse && "md:order-1")}>
        <h3 className="font-display text-2xl font-semibold text-[#1F2937] sm:text-3xl">{name}</h3>
        {role && <p className="mt-1 text-sm font-semibold text-[#E8741A]">{role}</p>}

        {tagline && (
          <p className="mt-4 max-w-md font-display text-lg leading-relaxed text-[#1A1A1A]/80 sm:text-xl">
            {tagline}
          </p>
        )}

        {metaLine && (
          <p className="mt-5 text-xs font-medium uppercase tracking-[0.14em] text-[#9A8B7A]">
            {metaLine}
          </p>
        )}

        {focusAreas.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B7280]">
            {focusAreas.map((tag, i) => (
              <span key={tag} className="flex items-center">
                {tag}
                {i < focusAreas.length - 1 && <span className="ml-2 text-[#E8741A]/50">&bull;</span>}
              </span>
            ))}
          </div>
        )}

        {hasJourneyContent && (
          <button
            type="button"
            onClick={journeyOpen ? closeJourney : openJourney}
            className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-[#E8741A] transition-colors duration-200 hover:text-[#C4691A]"
            aria-expanded={journeyOpen}
          >
            {journeyOpen ? (
              <>
                Collapse Profile
                <ChevronDown size={15} className="rotate-180 transition-transform duration-300" aria-hidden="true" />
              </>
            ) : (
              <>
                Leadership Journey
                <span aria-hidden="true">&rarr;</span>
              </>
            )}
          </button>
        )}

        {journeyOpen && (
          <div className="animate-fade-in-up mt-4 max-h-[400px] space-y-2.5 overflow-y-auto border-t border-[#F3D6BE] pr-1 pt-4">
            {(experiencePoints.length > 0 || bio) && (
              <AccordionSection
                title="Experience"
                icon={Briefcase}
                isOpen={activeSection === "experience"}
                onToggle={() => toggleSection("experience")}
              >
                {experiencePoints.length > 0 ? (
                  <ul className="space-y-2">
                    {experiencePoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-[#4B5563]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8741A]" aria-hidden="true" />
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm leading-relaxed text-[#4B5563]">{bio}</p>
                )}
              </AccordionSection>
            )}

            {education.length > 0 && (
              <AccordionSection
                title="Education"
                icon={GraduationCap}
                isOpen={activeSection === "education"}
                onToggle={() => toggleSection("education")}
              >
                <ul className="space-y-2.5">
                  {education.map((line, i) => {
                    const [degree, institution] = line.split(/\s+—\s+/);
                    return (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8741A]/10">
                          <GraduationCap size={12} className="text-[#E8741A]" aria-hidden="true" />
                        </span>
                        <span className="leading-relaxed text-[#374151]">
                          <span className="font-semibold">{degree}</span>
                          {institution && <span className="text-[#6B7280]"> &mdash; {institution}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </AccordionSection>
            )}

            {achievements.length > 0 && (
              <AccordionSection
                title="Achievements"
                icon={Award}
                isOpen={activeSection === "achievements"}
                onToggle={() => toggleSection("achievements")}
              >
                <ul className="space-y-2">
                  {achievements.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-[#4B5563]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8741A]" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </AccordionSection>
            )}

            {quote && (
              <blockquote className="border-l-2 border-[#E8741A] py-1 pl-3 text-xs italic leading-relaxed text-[#6B7280]">
                &ldquo;{quote}&rdquo;
              </blockquote>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AccordionSection({ title, icon: Icon, isOpen, onToggle, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#F3D6BE]/70 bg-[#FDFBF7]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#1F2937]">
          <Icon size={15} className="text-[#E8741A]" aria-hidden="true" />
          {title}
        </span>
        <ChevronDown
          size={15}
          className={cn("shrink-0 text-[#9A8B7A] transition-transform duration-300", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="px-3.5 pb-3.5 pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
