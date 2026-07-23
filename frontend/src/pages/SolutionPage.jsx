import {
  Users,
  IndianRupee,
  GraduationCap,
  Heart,
} from "lucide-react";
import DonationWall from "../components/common/donation/DonationWall";

export default function SolutionPage() {
  return (
    <div className="bg-[#FFF8F1] pb-40">

      {/* ================= HERO ================= */}

      <div className="relative w-full h-[560px] overflow-visible">

        <img
          src="/coverImage2.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover" 
        />

        {/* ================= FLOATING GLASS CARD ================= */}

        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-20 w-[84%] max-w-5xl">

          <div
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border border-white/40
              bg-white/20
              backdrop-blur-[38px]
              shadow-[0_25px_80px_rgba(0,0,0,0.18)]
            "
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-white/10 to-transparent" />

            <div className="relative grid grid-cols-4">

              <div className="relative flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 shadow-md flex items-center justify-center mb-2">
                  <Users size={24} className="text-violet-700" />
                </div>

                <h2 className="text-[30px] leading-none font-black text-violet-700">
                  2,731
                </h2>

                <p className="mt-1 text-xs font-medium text-gray-600">
                  Generous Donors
                </p>

                <div className="absolute right-0 top-5 bottom-5 w-px bg-gradient-to-b from-transparent via-white/70 to-transparent" />
              </div>

              <div className="relative flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-100 to-rose-200 shadow-md flex items-center justify-center mb-2">
                  <IndianRupee size={24} className="text-pink-700" />
                </div>

                <h2 className="text-[30px] leading-none font-black text-pink-700">
                  ₹24.8L
                </h2>

                <p className="mt-1 text-xs font-medium text-gray-600">
                  Total Raised
                </p>

                <div className="absolute right-0 top-5 bottom-5 w-px bg-gradient-to-b from-transparent via-white/70 to-transparent" />
              </div>

              <div className="relative flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 shadow-md flex items-center justify-center mb-2">
                  <GraduationCap size={24} className="text-green-700" />
                </div>

                <h2 className="text-[30px] leading-none font-black text-green-700">
                  1,845
                </h2>

                <p className="mt-1 text-xs font-medium text-gray-600">
                  Children Impacted
                </p>

                <div className="absolute right-0 top-5 bottom-5 w-px bg-gradient-to-b from-transparent via-white/70 to-transparent" />
              </div>

              <div className="flex flex-col items-center py-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-amber-200 shadow-md flex items-center justify-center mb-2">
                  <Heart size={24} className="text-orange-600" />
                </div>

                <h2 className="text-[30px] leading-none font-black text-orange-600">
                  18
                </h2>

                <p className="mt-1 text-xs font-medium text-gray-600">
                  Active Campaigns
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ================= REST OF PAGE ================= */}

      <div
      className="min-h-screen bg-cover bg-center bg-no-repeat pt-24"
      style={{
      backgroundImage: "url('/donation_wall_background.png')",
    }}
    >
        <DonationWall />
      </div>

    </div>
  );
}