import React from "react";
import { 
  GraduationCap, 
  Users, 
  Building2, 
  BrainCircuit, 
  UserCheck, 
  BookOpenCheck, 
  Calendar, 
  Award, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";

export const AchievementsGrid = () => {
  const achievements = [
    { icon: GraduationCap, number: "5,000+", label: "Children Reached", tag: "Verified Core Impact", featured: true, accent: "orange" },
    { icon: Users, number: "1,200+", label: "Parents Trained (HAALS)", tag: "Verified Core Impact", accent: "rose" },
    { icon: Building2, number: "80+", label: "Anganwadis Supported", tag: "Verified Core Impact", accent: "sky" },
    { icon: BrainCircuit, number: "50+", label: "ECE Experts Engaged", tag: "Verified Core Impact", accent: "violet" },
    { icon: UserCheck, number: "200+", label: "Interns Trained", tag: "Verified Core Impact", accent: "emerald" },
    { icon: BookOpenCheck, number: "15+", label: "Research Publications", tag: "Verified Core Impact", accent: "orange" },
    { icon: Calendar, number: "8+ Years", label: "Of Continuous Operation", tag: "Verified Core Impact", accent: "sky" },
    { icon: Award, number: "Platinum", label: "GuideStar Certificate", tag: "Credibility Platinum", badgeIcon: ShieldCheck, isPlatinum: true },
  ];

  const accentStyles = {
    orange: "bg-orange-50 text-orange-600",
    rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <section className="relative isolate w-full py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#FFF8F1]">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      {/* Bottom fade — eases this section's background into the white
          footer below instead of cutting off with a hard edge. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56"
        style={{ background: "linear-gradient(180deg, transparent 0%, #FFFFFF 100%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 text-orange-700 text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Transparent Impact
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Our Track Record
          </h2>
          <p className="text-lg text-slate-600 font-normal leading-relaxed">
            Real lives transformed through sustainable, community-first early childhood programs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {achievements.map((item, index) => {
            const Icon = item.icon;
            const TagIcon = item.badgeIcon || CheckCircle2;
            const iconStyle = item.isPlatinum
              ? "bg-amber-100 text-amber-700"
              : accentStyles[item.accent] || "bg-orange-50 text-orange-600";

            return (
              <div
                key={index}
                className={`group relative flex flex-col justify-between p-7 rounded-3xl transition-all duration-500 ease-out hover:scale-[1.02] border overflow-hidden ${
                  item.isPlatinum
                    ? "border-amber-300 bg-gradient-to-br from-amber-100/80 via-amber-50/40 to-white shadow-lg shadow-amber-500/15 hover:shadow-xl hover:shadow-amber-500/25 hover:-translate-y-1.5"
                    : item.featured
                    ? "border-orange-200 bg-gradient-to-br from-orange-50/60 via-white to-white shadow-md hover:shadow-xl hover:border-orange-300 hover:-translate-y-1.5"
                    : "bg-[#FFFDF9] border-orange-100 shadow-xl shadow-orange-100/20 hover:shadow-2xl hover:shadow-orange-200/25 hover:border-orange-300 hover:-translate-y-2"
                }`}
              >
                {/* Top accent bar for special cards */}
                {(item.isPlatinum || item.featured) && (
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      item.isPlatinum ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-orange-400 to-orange-300"
                    }`}
                  />
                )}

                {item.isPlatinum && (
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-300/25 rounded-full blur-2xl pointer-events-none" />
                )}

                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${iconStyle}`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                      item.isPlatinum ? "bg-amber-200/70 text-amber-900" : "bg-slate-100 text-slate-600"
                    }`}>
                      <TagIcon className="w-3.5 h-3.5" />
                      {item.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className={`text-5xl lg:text-[48px] font-black tracking-tight ${
                      item.isPlatinum ? "text-amber-900" : "text-slate-900"
                    }`}>
                      {item.number}
                    </div>
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-500 pt-1">
                      {item.label}
                    </p>
                  </div>
                </div>

                <div className={`relative mt-6 pt-4 border-t flex items-center justify-between text-xs font-medium ${
                  item.isPlatinum ? "border-amber-200/60 text-amber-700/70" : "border-slate-100/80 text-slate-400"
                }`}>
                  <span>Verified Data</span>
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    item.isPlatinum ? "bg-amber-400" : "bg-slate-300 group-hover:bg-orange-500"
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-12 mb-2 text-center text-xs font-medium text-slate-400 max-w-lg mx-auto leading-relaxed">
          *Note: Field metrics and operational figures are continuously monitored and subject to annual external data auditing.
        </p>
      </div>
    </section>
  );
};