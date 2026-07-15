import React from "react";
import FounderCard from "../components/common/founder/FounderCard";
import AdvisoryNetworkCard from "../components/common/founder/AdvisoryNetworkCard";

// TODO: move this to services/api.js or a content/founders.js file
// once the backend endpoint / CMS source is decided.
const founder = {
  name: "Sachin",
  role: "Founder and CEO",
  education: [
    "B.Sc. Physics - Pune University",
    "PGD Child Psychology - JPIP",
    "PGD Corporate Social Responsibility - KinSS",
  ],
  quote:
    "Strong, motivated and trained organisational leadership is required to see community-led large-scale educational change and sustain it post-intervention.",
};

const advisoryMembers = [
  { name: "Ms Madhuri Sahasrabudhe", org: "Councilor, Pune Municipal Corporation (PMC)" },
  { name: "Dr Suneeta Kulkarni", org: "Granny Cloud (Early childhood education tech platform)" },
  { name: "Mr Chittaranjan Kaul", org: "CLR (Community Learning Resources)" },
  { name: "Mr Nilesh Kumar", org: "QUEST (Quality Education Initiative)" },
  { name: "Ms Sushma Padhye", org: "Grammangal (Rural Education NGO)" },
  { name: "Ms Shubhada Joshi", org: "Khelghar (Play-based learning for disadvantaged children)" },
  { name: "Dr Godbole", org: "Chiranjiv Clinic (Initiated the MS Talk Series on ECE)" },
];

export default function FounderPage() {
  return (
    <section className="bg-[#FDF6EC] min-h-screen px-6 py-16">
      {/* Heading */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
          Our Leadership &amp; Advisory Network
        </h1>
        <p className="text-[#1A1A1A]/70">
          Meet the visionaries guiding our early childhood architecture
          alongside strategic state-level institutional ecosystem
          collaborators.
        </p>
      </div>

      {/* Cards grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <FounderCard
          name={founder.name}
          role={founder.role}
          education={founder.education}
          quote={founder.quote}
        />

        <FounderCard isPlaceholder />

        <AdvisoryNetworkCard
          note="Sourced from Maharashtra State Meet on ECE (50+ Experts Engaged)"
          members={advisoryMembers}
        />
      </div>
    </section>
  );
}