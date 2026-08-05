import React from "react";
import { AchievementsGrid } from "../components/achievements/AchievementsGrid";
import achievementsPoster from "../assets/achivements_poster2.png"; // use the cleaned version
import { Heart, Trophy, ArrowRight, PlayCircle } from "lucide-react";

export default function AchievementsPage() {
  return (
    <div className="bg-[#FFF8F1] min-h-screen text-slate-800">

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full pt-6 pb-2 sm:pt-10 px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="relative mx-auto max-w-7xl">
          {/* Main Hero Banner (clean image, no overlay badge needed since caption is baked cleanly) */}
          <div
            className="relative h-[380px] sm:h-[480px] lg:h-[560px] w-full rounded-3xl sm:rounded-[2.5rem] bg-center bg-cover bg-no-repeat overflow-hidden shadow-2xl"
            style={{
              backgroundImage: `url(${achievementsPoster})`,
              boxShadow: `
                0 20px 50px rgba(255, 180, 50, 0.15),
                0 10px 30px rgba(0, 0, 0, 0.08)
              `,
            }}
          />

          {/* CTA Buttons below hero */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">

             <a href="/donate"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-[#E8741A] text-white font-bold shadow-[0_8px_24px_-6px_rgba(232,116,26,0.5)] hover:-translate-y-0.5 hover:bg-[#D86712] transition-all duration-300"
            >
              Support a Program
              <ArrowRight size={18} />
            </a>

            <a  href="/impact"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white border border-slate-200 text-slate-700 font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <PlayCircle size={18} className="text-orange-500" />
              See Our Impact
            </a>
          </div>

          {/* Floating Stats Strip */}
          <div className="relative mt-8 flex justify-center px-2">
            <div className="w-full max-w-4xl rounded-2xl sm:rounded-full border border-white/80 bg-white/90 backdrop-blur-xl px-6 py-5 sm:px-8 shadow-[0_20px_50px_rgba(255,180,50,0.18)]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">

                {/* Left: Icon & Title */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center shadow-inner border border-rose-200/50">
                    <Heart className="text-rose-600 w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      Numbers That Carry Real Names
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
                      Every figure below is independently tracked and audited.
                    </p>
                  </div>
                </div>

                {/* Right: Quick Stats */}
                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-black text-orange-600">5,000+</p>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Children</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-orange-600">80+</p>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Anganwadis</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200" />
                  <div className="text-center">
                    <p className="text-2xl font-black text-orange-600">8+</p>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Years</p>
                  </div>
                  <Trophy className="text-amber-500 w-8 h-8 ml-1 hidden sm:block" />
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= GRID SECTION ================= */}
      {/* AchievementsGrid renders its own complete <section> with its own top/bottom
          padding (py-14 lg:py-20) — no extra wrapper padding here, or the two stack
          into a huge dead gap before "Transparent Impact" shows up. */}
      <AchievementsGrid />

    </div>
  );
}