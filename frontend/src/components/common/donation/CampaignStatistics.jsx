import { Users, Target, TrendingUp, Calendar, Flag } from "lucide-react";
import { formatINR } from "../../../utils/donationForm";

export default function CampaignStatistics({ campaign, stats }) {
  if (!campaign || !stats) return null;

  const statCards = [
    {
      icon: Target,
      label: "Goal Amount",
      value: formatINR(stats.goal),
      color: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: TrendingUp,
      label: "Raised Amount",
      value: formatINR(stats.raised),
      color: "from-green-50 to-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: Flag,
      label: "Progress",
      value: `${stats.progressPercent}%`,
      color: "from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
    },
    {
      icon: Users,
      label: "Contributors",
      value: stats.contributors.toLocaleString("en-IN"),
      color: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: Calendar,
      label: "Days Left",
      value: `${stats.daysLeft} days`,
      color: "from-red-50 to-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-dark">
          Campaign at a Glance
        </h2>
        <p className="mt-2 text-brand-muted">
          Track the progress and impact of this campaign
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-6 sm:p-7 transition-all duration-300 hover:shadow-lg`}
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 transition-transform group-hover:scale-110" />
              <div className="relative">
                <div className={`inline-flex rounded-xl bg-white/30 p-3 ${card.iconColor} backdrop-blur-sm`}>
                  <Icon size={20} />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  {card.label}
                </p>
                <p className="mt-2 font-display text-2xl sm:text-3xl font-bold text-brand-dark">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated Progress Bar */}
      <div className="mt-8 sm:mt-12">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-brand-dark">Overall Progress</h3>
          <span className="text-sm font-bold text-brand-orange">{stats.progressPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-orange to-orange-500 transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(stats.progressPercent, 100)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-brand-muted">
          {formatINR(stats.raised)} of {formatINR(stats.goal)} raised by {stats.contributors.toLocaleString("en-IN")} supporters
        </p>
      </div>
    </section>
  );
}
