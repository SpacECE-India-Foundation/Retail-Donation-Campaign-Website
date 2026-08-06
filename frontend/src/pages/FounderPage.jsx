import { Sparkles, HeartHandshake } from "lucide-react";
import FounderCard from "../components/common/founder/FounderCard";
import AdvisoryNetworkCard from "../components/common/founder/AdvisoryNetworkCard";

// TODO: move this to services/api.js or a content/founders.js file once the
// backend endpoint / CMS source is decided. All of the founder data below is
// sourced from the official SpacECE "Our Team" page (spacece.in/about-us/our-team)
// and each founder's own subpage — it's still static, hand-authored content,
// no API calls were added or changed.
//
// Photos: point at /images/founders/*.jpg. These files could not be fetched
// automatically (the sandbox's network allowlist blocks the image CDN the
// official site serves from), so the two files below still need to be added
// manually — see the note at the bottom of this file. Until then the card
// gracefully falls back to a gradient-initials badge.
const founder = {
  name: "Sachin Mohite",
  role: "Founder & Chief Executive Officer",
  image: "/images/founders/sachin-mohite.jpg",
  experienceYears: 13,
  tagline:
    "Leading SpaceECE's mission to transform early childhood education through scalable, community-driven innovation.",
  // Same facts as the original bio paragraph, just split into scannable
  // bullets for the Experience accordion — no new information added.
  experiencePoints: [
    "13+ years in educational research, M&E & program design",
    "Led large-scale program implementation across sectors",
    "Leadership roles across non-profits and corporates",
    "Worked with Muttha Foundation, SAP, and Reliance Games",
    "Led initiatives at ed-tech startup Learning Yogi",
  ],
  bio:
    "13 years of experience in educational research, monitoring & evaluation, and large-scale program design & implementation, with leadership responsibilities across non-profits and corporates — including Muttha Foundation, SAP, Reliance Games, and the ed-tech startup Learning Yogi.",
  education: [
    "PhD in Education — University of York, UK",
    "MA in Education — Azim Premji University, Bangalore",
    "MCA (Management) — Pune University, India",
    "BSc (Physics) — Pune University, Maharashtra",
    "PGD Child Psychology — JPIP",
    "PGD Corporate Social Responsibility — KInSS",
  ],
  focusAreas: ["Educational Research", "M&E", "Program Design", "Leadership"],
  quote:
    "Strong, motivated and trained organisational leadership is required to see community-led large-scale educational change and sustain it post-intervention.",
};

const coFounder = {
  name: "Aparna Chaudhari",
  role: "Co-Founder & Chief Operations Officer",
  image: "/images/founders/aparna-chaudhari.jpg",
  experienceYears: 12,
  tagline:
    "Building safe, nurturing environments where every child's rights, growth, and education come first.",
  // Same facts as the original bio paragraph, just split into scannable
  // bullets for the Experience accordion — no new information added.
  experiencePoints: [
    "12+ years in child development & education",
    "Focus on child rights and protection",
    "Managerial and program leadership roles",
    "Worked with ChildLine and Campaign Against Child Labour",
    "Program leadership at Kaivalya Education Foundation",
  ],
  bio:
    "12 years of experience in child development, child rights and protection, and child education, with managerial and program leadership responsibilities — including roles at ChildLine, Campaign Against Child Labour, and Kaivalya Education Foundation.",
  education: [
    "Master in Education — Azim Premji University, Bangalore",
    "Master in Social Work (Psychiatry) — Pune University, Maharashtra",
    "Bachelor of Social Work — Nagpur University, Maharashtra",
    "Certificate in Social Work — Nagpur University, Maharashtra",
  ],
  focusAreas: ["Child Development", "Child Rights & Protection", "Child Education", "Program Leadership"],
  quote:
    "Surroundings make a huge impact on children's learning and their overall personality — it is our responsibility as caretakers, teachers, and parents to enrich their environment so children can become good human beings.",
};

const advisoryMembers = [
  { name: "Ms Madhuri Sahasrabudhe", org: "Councilor, Pune Municipal Corporation (PMC)" },
  { name: "Dr Suneeta Kulkarni", org: "Granny Cloud (Early childhood education tech platform)" },
  { name: "Mr Chittaranjan Kaul", org: "CLR (Community Learning Resources)" },
  // Corrected from "Nilesh Kumar" — the original SpacECE source lists
  // "Mr Nilesh Nimkar" as the QUEST representative.
  { name: "Mr Nilesh Nimkar", org: "QUEST (Quality Education Initiative)" },
  { name: "Ms Sushma Padhye", org: "Grammangal (Rural Education NGO)" },
  { name: "Ms Shubhada Joshi", org: "Khelghar (Play-based learning for disadvantaged children)" },
  { name: "Dr Godbole", org: "Chiranjiv Clinic (Initiated the MS Talk Series on ECE)" },
];

// Highlights are derived from real data above — combined years is a plain
// sum of the two founders' stated experience, not an invented figure.
const HIGHLIGHTS = [
  { label: "2 Founders" },
  { label: `${founder.experienceYears + coFounder.experienceYears}+ Years Combined Leadership` },
  { label: `${advisoryMembers.length}+ Advisory Collaborators` },
];

function SectionDivider() {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-24 sm:w-40" style={{ background: "linear-gradient(90deg, transparent, rgba(232,116,26,0.35))" }} />
      <span className="h-1.5 w-1.5 rounded-full bg-[#E8741A]" />
      <span className="h-px w-24 sm:w-40" style={{ background: "linear-gradient(90deg, rgba(232,116,26,0.35), transparent)" }} />
    </div>
  );
}

export default function FounderPage() {
  return (
    <section className="relative overflow-hidden bg-[#FDF6EC] px-6 py-20 sm:py-24">
      {/* Warm editorial background — same glow language as the Hero */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(700px 520px at -5% -5%, rgba(232,116,26,0.1), transparent 60%), " +
            "radial-gradient(650px 480px at 105% 100%, rgba(255,201,138,0.16), transparent 58%)",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-10 top-20 -z-10 h-48 w-48 opacity-[0.15]"
        style={{ backgroundImage: "radial-gradient(rgba(232,116,26,0.55) 1.5px, transparent 1.5px)", backgroundSize: "20px 20px" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span
            className="mb-5 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ background: "rgba(232,116,26,0.1)", color: "#E8741A" }}
          >
            <Sparkles size={12} aria-hidden="true" />
            Our People
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#1A1A1A] sm:text-4xl">
            Our Leadership &amp; Advisory Network
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#1A1A1A]/70">
            Meet the visionaries guiding our early childhood architecture
            alongside strategic state-level institutional ecosystem
            collaborators.
          </p>
        </div>

        {/* Leadership highlights strip */}
        <div className="mx-auto mb-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 sm:mb-20">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="flex items-center gap-2 text-sm font-medium text-[#4B5563]">
              <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(232,116,26,0.1)" }}>
                <HeartHandshake size={15} className="text-[#E8741A]" aria-hidden="true" />
              </span>
              {h.label}
            </div>
          ))}
        </div>

        {/* ================= Block 1 — Founders (editorial stack) ================= */}
        <div className="mb-16 space-y-14 sm:mb-20 sm:space-y-16">
          <FounderCard
            name={founder.name}
            role={founder.role}
            image={founder.image}
            experienceYears={founder.experienceYears}
            tagline={founder.tagline}
            experiencePoints={founder.experiencePoints}
            bio={founder.bio}
            education={founder.education}
            focusAreas={founder.focusAreas}
            quote={founder.quote}
          />

          <SectionDivider />

          <FounderCard
            name={coFounder.name}
            role={coFounder.role}
            image={coFounder.image}
            experienceYears={coFounder.experienceYears}
            tagline={coFounder.tagline}
            experiencePoints={coFounder.experiencePoints}
            bio={coFounder.bio}
            education={coFounder.education}
            focusAreas={coFounder.focusAreas}
            quote={coFounder.quote}
            reverse
          />
        </div>

        <div className="mb-16 sm:mb-20">
          <SectionDivider />
        </div>

        {/* ================= Block 2 — Advisory Network ================= */}
        <AdvisoryNetworkCard
          note="Sourced from the Maharashtra State Meet on ECE (50+ experts engaged)"
          members={advisoryMembers}
        />
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------
// To finish wiring in the real photographs referenced above, save the two
// official images from https://www.spacece.in/about-us/our-team as:
//   frontend/public/images/founders/sachin-mohite.jpg
//   frontend/public/images/founders/aparna-chaudhari.jpg
// No code changes needed once those files exist — FounderCard already
// points at those paths and will pick them up automatically.
// -----------------------------------------------------------------------