import { useState } from "react";
import {
  Users,
  IndianRupee,
  GraduationCap,
  Heart,
} from "lucide-react";
import DonationWall from "../components/common/donation/DonationWall";
import SolutionImpactTimeline from "../components/solutions/SolutionImpactTimeline";
import SolutionTrustSection from "../components/solutions/SolutionTrustSection";

export default function SolutionPage() {
  const [statistics, setStatistics] = useState({
    totalRaised: 0,
    totalDonations: 0,
    totalCampaigns: 0,
  });

  return (
    <div className="relative isolate -mt-24 bg-[#FFFDF8] pb-20 pt-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24"
        style={{ background: "#F8F4EE" }}
        aria-hidden="true"
      />

      {/* ================= HERO (unchanged) ================= */}

     <div className="relative w-full overflow-visible" style={{ aspectRatio: "2109 / 745" }}>

        <img
        src="/coverImage2.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-top"
       />

        {/* Warm color-grade overlay — pulls the illustration's bright,
            generic pastel palette toward the site's own cream/orange tones
            so it reads as part of the same brand instead of a stock image
            dropped on top. Soft-light blend keeps the artwork legible. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgba(232,116,26,0.18)",
            mixBlendMode: "soft-light",
          }}
          aria-hidden="true"
        />
      </div>

      {/* ================= STATS CARD ================= */}
      {/* Solid card (no glass/translucency) sitting just below the hero image,
          with a small overlap so it still reads as "floating" without
          straddling the photo/page-background boundary. Icon accents use the
          site's standard alternating teal/orange pair instead of a rainbow
          of unrelated pastel colors. */}

      <div className="relative z-20 mx-auto -mt-14 w-[84%] max-w-5xl px-2 sm:-mt-20">
        <div className="overflow-hidden rounded-[26px] border border-gray-100 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.12)]">
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
            {[
              {
                icon: Users,
                value: statistics.totalDonations.toLocaleString("en-IN"),
                label: "Generous Donors",
                accent: "#E8741A",
                accentBg: "rgba(232, 116, 26, 0.1)",
              },
              {
                icon: IndianRupee,
                value: `₹${statistics.totalRaised.toLocaleString("en-IN")}`,
                label: "Total Raised",
                accent: "#E8741A",
                accentBg: "rgba(232, 116, 26, 0.1)",
              },
              {
                icon: GraduationCap,
                value: "1,845",
                label: "Children Impacted",
                accent: "#E8741A",
                accentBg: "rgba(232, 116, 26, 0.1)",
              },
              {
                icon: Heart,
                value: statistics.totalCampaigns.toLocaleString("en-IN"),
                label: "Campaigns",
                accent: "#E8741A",
                accentBg: "rgba(232, 116, 26, 0.1)",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex flex-col items-center py-6">
                  <div
                    className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: stat.accentBg }}
                  >
                    <Icon size={24} style={{ color: stat.accent }} aria-hidden="true" />
                  </div>

                  <h2 className="text-[30px] font-black leading-none text-[#E8741A]">
                    {stat.value}
                  </h2>

                  <p className="mt-1 text-xs font-medium text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= EDITORIAL SECTIONS ================= */}

      <div className="relative pt-24">
        <DonationWall setStatistics={setStatistics} variant="grid" />
        <SolutionImpactTimeline />
        <SolutionTrustSection statistics={statistics} />
      </div>

    </div>
  );
}
