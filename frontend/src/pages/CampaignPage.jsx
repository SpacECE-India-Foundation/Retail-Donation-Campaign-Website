import React from "react";
import CriticalWindowCard from "../components/common/campaign/CriticalWindowCard";
import ImplementationRoadmap from "../components/common/campaign/ImplementationRoadmap";
import NationalPolicyContext from "../components/common/campaign/NationalPolicyContext";

// TODO: move this to services/api.js or a content file once
// the backend/CMS source is decided.
const roadmapPhases = [
  {
    month: "Month 1-2",
    title: "Onboard 500 parents",
    description:
      "Deploy parent onboarding blueprints across 10 active micro-communities via HAALS frameworks.",
  },
  {
    month: "Month 3-4",
    title: "Fellow Deployment",
    description:
      "Deploy 20 Umang fellows to coordinate essential FLN observation protocols and systemic monitoring structures.",
  },
  {
    month: "Month 6-8",
    title: "State Workshop Rollout",
    description:
      "Initiate extensive state-level parent empowerment modules and push transparent data repositories live.",
  },
  {
    month: "Month 8+",
    title: "Scalability Integration",
    description:
      "Synergize strategic core modules directly into state level tracking frameworks for ICDS scaling inside Maharashtra.",
  },
];

const policies = [
  {
    title: "National ECCE Policy (2013)",
    description:
      "Formally establishes the constitutional early care directives that shape our primary field initiatives.",
  },
  {
    title: "NEP 2020 Target Landscape",
    description:
      "Fully incorporates structured educational paths starting from age 3, aiming for complete community integration by 2030.",
  },
  {
    title: "ICDS Core Integration",
    description:
      "India operates 1.37 million Anganwadi centres. SpacECE frameworks directly complement and fortify this established structural network.",
  },
];

export default function CampaignPage() {
  return (
    <section className="bg-[#FDF6EC] min-h-screen px-6 py-16">
      {/* Heading */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#0D4A52] mb-4">
          Campaign &amp; Why Now
        </h1>
        <p className="text-[#1A1A1A]/70">
          Understanding the immediate national imperative, strategic
          implementation timelines and policy windows driving this
          synchronized early development framework.
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top full-width card */}
        <CriticalWindowCard />

        {/* Bottom two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <ImplementationRoadmap phases={roadmapPhases} />
          <NationalPolicyContext
            policies={policies}
            note="Validated Model"
          />
        </div>
      </div>
    </section>
  );
}