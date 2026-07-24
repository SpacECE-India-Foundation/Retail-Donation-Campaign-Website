// // // import { AchievementsGrid } from "../components/achievements/AchievementsGrid";

// // // export default function AchievementsPage() {
// // //   return (
// // //     <div>
// // //       <AchievementsGrid />
// // //     </div>
// // //   );
// // // }
// // import { AchievementsGrid } from "../components/achievements/AchievementsGrid";
// // import achievementsPoster from "../assets/achivements_poster2.png";

// // export default function AchievementsPage() {
// //   return (
// //     <div className="bg-[#FFF8F1]">

// //       {/* Hero Banner */}
// //       <section className="relative w-full h-[720px] overflow-hidden">
// //         <img
// //           src={achievementsPoster}
// //           alt="Achievements Banner"
// //           className="absolute inset-0 w-full h-full object-cover"
// //         />

// //         {/* Optional dark overlay for better readability */}
// //         <div className="absolute inset-0 bg-black/10" />
// //       </section>

// //       {/* Achievements */}
// //       <section className="relative mt-10">
// //         <AchievementsGrid />
// //       </section>

// //     </div>
// //   );
// // }
// // import { AchievementsGrid } from "../components/achievements/AchievementsGrid";
// // import achievementsPoster from "../assets/achivements_poster2.png";
// // import { Heart, Trophy, Sparkles } from "lucide-react";

// // export default function AchievementsPage() {
// //   return (
// //     <div className="bg-[#FFF8F1]">

// //   {/* ================= HERO ================= */}

// //   <section
// //     className="relative h-[650px] bg-center bg-cover bg-no-repeat overflow-visible shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
// //     style={{
// //       backgroundImage: `url(${achievementsPoster})`,
// //       boxShadow: `
// //       0 20px 45px rgba(255, 196, 77, 0.22),
// //       0 40px 100px rgba(255, 215, 0, 0.18),
// //       inset 0 -35px 70px rgba(255, 230, 150, 0.22)
// //     `,
// //     }}
// //   >
// //     {/* Light Overlay */}
// //     <div className="absolute inset-0 bg-white/5" />
// //     {/* Golden Bottom Glow */}


// //     {/* Floating Glass Card */}
// //     {/* Floating Glass Card */}
// // <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-20">

// //   <div
// //     className="
// //       w-[760px]
// //       rounded-full
// //       border border-white/50
// //       bg-white/25
// //       backdrop-blur-2xl
// //       px-8
// //       py-4
// //     "
// //     style={{
// //       boxShadow:
// //         "0 18px 55px rgba(255, 191, 73, 0.28), 0 8px 25px rgba(255,255,255,0.35)",
// //     }}
// //   >
// //     <div className="flex items-center justify-between">

// //       {/* Left */}
// //       <div className="flex items-center gap-4">

// //         <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center shadow-md">
// //           <Heart
// //             className="text-pink-600"
// //             size={30}
// //           />
// //         </div>

// //         <div>

// //           <h2 className="text-[28px] font-bold text-[#2D3748] leading-tight">
// //             Every Milestone Tells Our Story
// //           </h2>

// //           <p className="text-gray-600 mt-1 text-[15px]">
// //             Together we celebrate every achievement that creates brighter futures.
// //           </p>

// //         </div>

// //       </div>

// //       {/* Right */}
// //       <div className="flex items-center gap-4">

// //         <Sparkles
// //           className="text-yellow-500"
// //           size={28}
// //         />

// //         <Trophy
// //           className="text-amber-500"
// //           size={36}
// //         />

// //       </div>

// //     </div>

// //   </div>

// // </div>

// //   </section>

// //   {/* ================= GRID ================= */}

// //   <section className="relative pt-10">
// //     <AchievementsGrid />
// //   </section>

// // </div>
// //   );
// // }
import React from "react";
import { AchievementsGrid } from "../components/achievements/AchievementsGrid";
import achievementsPoster from "../assets/achivements_poster2.png";
import { Heart, Trophy, Sparkles, Award } from "lucide-react";

export default function AchievementsPage() {
  return (
    <div className="bg-[#FFF8F1] min-h-screen text-slate-800 selection:bg-amber-100 selection:text-amber-900">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full pb-2 pt-2 sm:pb-28 sm:pt-12 px-4 sm:px-6 lg:px-8 overflow-visible">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="relative mx-auto max-w-7xl">
          
          {/* Main Hero Banner */}
          <div
            className="relative h-[380px] sm:h-[480px] lg:h-[540px] w-full rounded-3xl sm:rounded-[2.5rem] bg-center bg-cover bg-no-repeat overflow-hidden shadow-2xl transition-all duration-500"
            style={{
              backgroundImage: `url(${achievementsPoster})`,
              boxShadow: `
                0 20px 50px rgba(255, 180, 50, 0.15),
                0 10px 30px rgba(0, 0, 0, 0.08)
              `,
            }}
          >
            {/* Soft Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

            {/* Top Badge Overlay */}
            <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-amber-900 text-xs sm:text-sm font-bold shadow-sm border border-white/60">
                <Award className="w-4 h-4 text-amber-600" />
                Impact & Milestones
              </span>
            </div>
          </div>

          {/* Floating Glass Card (Positioned Overlapping Hero Bottom) */}
          <div className="relative -mt-16 sm:-mt-20 z-20 flex justify-center px-2">
            <div
              className="
                w-full 
                max-w-4xl 
                rounded-2xl sm:rounded-full 
                border border-white/80 
                bg-white/70 
                backdrop-blur-xl 
                p-5 sm:px-8 sm:py-5
                shadow-[0_20px_50px_rgba(255,180,50,0.22)]
                hover:shadow-[0_25px_60px_rgba(255,170,30,0.28)]
                transition-all duration-300
              "
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
                
                {/* Left Side: Icon & Title */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl sm:rounded-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center shadow-inner border border-rose-200/50">
                    <Heart className="text-rose-600 w-7 h-7 stroke-[2.2]" />
                  </div>

                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 leading-tight">
                      Every Milestone Tells Our Story
                    </h1>
                    <p className="text-slate-600 text-xs sm:text-sm font-medium mt-0.5 max-w-md">
                      Together, we celebrate each step that brings brighter futures to children & families.
                    </p>
                  </div>
                </div>

                {/* Right Side: Decorative Accent Icons */}
                <div className="flex items-center justify-center gap-3 bg-amber-50/60 sm:bg-transparent px-4 py-2 sm:p-0 rounded-full border border-amber-200/40 sm:border-none">
                  <Sparkles className="text-amber-500 w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                  <Trophy className="text-amber-600 w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= GRID SECTION ================= */}
      <section className="relative pb-16">
        <AchievementsGrid />
      </section>

    </div>
  );
}
