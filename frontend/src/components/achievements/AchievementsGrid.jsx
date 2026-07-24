// export const AchievementsGrid = () => {
//   const achievements = [
//     { icon: "👩‍🏫", number: "5000+", label: "CHILDREN REACHED", tag: "Verified Core Impact" },
//     { icon: "🤝", number: "1200+", label: "PARENTS TRAINED (HAALS)", tag: "Verified Core Impact" },
//     { icon: "🏛️", number: "80+", label: "ANGANWADIS SUPPORTED", tag: "Verified Core Impact" },
//     { icon: "🤲", number: "50+", label: "ECE EXPERTS ENGAGED", tag: "Verified Core Impact" },
//     { icon: "🏢", number: "200+", label: "INTERNS TRAINED", tag: "Verified Core Impact" },
//     { icon: "🎨", number: "15+", label: "RESEARCH PUBLICATIONS", tag: "Verified Core Impact" },
//     { icon: "📅", number: "8+", label: "YEARS OF OPERATION", tag: "Verified Core Impact" },
//     { icon: "🏆", number: "Awarded", label: "GUIDESTAR CERTIFICATE", tag: "Credibility Platinum" },
//   ];

//   return (
//     <section
//       className="w-full py-16 lg:py-20 px-6"
//       style={{ background: "var(--color-brand-bg)" }}
//     >
//       <div className="mx-auto max-w-[1200px]">
//         <div className="text-center mb-12">
//           <h1
//             className="text-4xl lg:text-5xl font-extrabold mb-4"
//             style={{ color: "var(--color-brand-dark)" }}
//           >
//             Our Track Record
//           </h1>
//           <p className="text-gray-600 mb-1">
//             A comprehensive overview of our field metrics and impact reach.
//           </p>
//           <p className="text-xs text-gray-500">
//             Note: These operational figures are indicative and subject to final data auditing.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {achievements.map((item, index) => (
//             <div
//               key={index}
//               className="bg-white rounded-2xl p-6 border-2"
//               style={{ borderColor: "var(--color-brand-orange)" }}
//             >
//               <div className="text-3xl mb-3">{item.icon}</div>
//               <p
//                 className="text-2xl font-extrabold mb-1"
//                 style={{ color: "var(--color-brand-dark)" }}
//               >
//                 {item.number}
//               </p>
//               <p className="text-xs font-semibold text-gray-600 tracking-wide mb-4">
//                 {item.label}
//               </p>
//               <hr className="border-gray-200 mb-3" />
//               <p
//                 className="text-xs font-semibold"
//                 style={{ color: "var(--color-brand-orange)" }}
//               >
//                 {item.tag}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };
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
    { 
      icon: GraduationCap, 
      number: "5,000+", 
      label: "Children Reached", 
      tag: "Verified Core Impact",
      featured: true, // Highlights top metric
    },
    { 
      icon: Users, 
      number: "1,200+", 
      label: "Parents Trained (HAALS)", 
      tag: "Verified Core Impact" 
    },
    { 
      icon: Building2, 
      number: "80+", 
      label: "Anganwadis Supported", 
      tag: "Verified Core Impact" 
    },
    { 
      icon: BrainCircuit, 
      number: "50+", 
      label: "ECE Experts Engaged", 
      tag: "Verified Core Impact" 
    },
    { 
      icon: UserCheck, 
      number: "200+", 
      label: "Interns Trained", 
      tag: "Verified Core Impact" 
    },
    { 
      icon: BookOpenCheck, 
      number: "15+", 
      label: "Research Publications", 
      tag: "Verified Core Impact" 
    },
    { 
      icon: Calendar, 
      number: "8+ Years", 
      label: "Of Continuous Operation", 
      tag: "Verified Core Impact" 
    },
    { 
      icon: Award, 
      number: "Platinum", 
      label: "GuideStar Certificate", 
      tag: "Credibility Platinum",
      badgeIcon: ShieldCheck,
      isPlatinum: true
    },
  ];

  return (
    <section className="relative w-full py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-slate-50/50 overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 text-orange-700 text-xs font-bold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Transparent Impact
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Our Track Record
          </h2>
          <p className="text-lg text-slate-600 font-normal leading-relaxed">
            Real lives transformed through sustainable, community-first early childhood programs.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((item, index) => {
            const Icon = item.icon;
            const TagIcon = item.badgeIcon || CheckCircle2;

            return (
              <div
                key={index}
                className={`group relative flex flex-col justify-between p-7 rounded-3xl transition-all duration-300 bg-white border ${
                  item.isPlatinum
                    ? "border-amber-300 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/20 shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/15 hover:-translate-y-1"
                    : item.featured
                    ? "border-orange-200 bg-gradient-to-br from-orange-50/50 via-white to-white shadow-md hover:shadow-xl hover:border-orange-300 hover:-translate-y-1"
                    : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-1"
                }`}
              >
                {/* Top Section: Icon & Badge */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        item.isPlatinum
                          ? "bg-amber-100 text-amber-700"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                        item.isPlatinum
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <TagIcon className="w-3.5 h-3.5" />
                      {item.tag}
                    </span>
                  </div>

                  {/* Main Metric & Label */}
                  <div className="space-y-1">
                    <div
                      className={`text-4xl lg:text-5xl font-black tracking-tight ${
                        item.isPlatinum
                          ? "text-amber-900"
                          : "text-slate-900"
                      }`}
                    >
                      {item.number}
                    </div>
                    <p className="text-sm font-bold uppercase tracking-wider text-slate-500 pt-1">
                      {item.label}
                    </p>
                  </div>
                </div>

                {/* Subtle Decorative Bottom Accent */}
                <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Verified Data</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-orange-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Audit Disclaimer */}
        <p className="mt-10 text-center text-xs font-medium text-slate-400 max-w-lg mx-auto">
          *Note: Field metrics and operational figures are continuously monitored and subject to annual external data auditing.
        </p>
      </div>
    </section>
  );
};