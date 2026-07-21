import { CheckCircle2, Clock, Lock } from "lucide-react";

export default function CampaignTimeline({ milestones }) {
  if (!milestones || milestones.length === 0) return null;

  const getMilestoneStatus = (milestone) => {
    if (milestone.isCompleted) return "completed";
    if (milestone.raisedAmount > 0) return "in-progress";
    return "upcoming";
  };

  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      bg: "bg-green-50",
      border: "border-green-200",
      iconColor: "text-green-600",
      label: "Completed",
    },
    "in-progress": {
      icon: Clock,
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconColor: "text-blue-600",
      label: "In Progress",
    },
    upcoming: {
      icon: Lock,
      bg: "bg-gray-50",
      border: "border-gray-200",
      iconColor: "text-gray-600",
      label: "Upcoming",
    },
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-dark">
          Campaign Journey
        </h2>
        <p className="mt-2 text-brand-muted">
          Follow the milestones and progress of this campaign
        </p>
      </div>

      {/* Desktop Horizontal Timeline */}
      <div className="hidden lg:block">
        <div className="relative mb-12">
          {/* Connecting line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-brand-orange to-gray-200" />

          <div className="relative grid grid-cols-3 gap-6">
            {milestones.slice(0, 3).map((milestone, idx) => {
              const status = getMilestoneStatus(milestone);
              const config = statusConfig[status];
              const Icon = config.icon;

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-white ${config.bg} shadow-lg`}>
                    <Icon className={`${config.iconColor}`} size={28} />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-semibold text-brand-dark">
                      {milestone.milestoneTitle}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-brand-orange uppercase tracking-wider">
                      {config.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="lg:hidden space-y-4">
        {milestones.map((milestone, idx) => {
          const status = getMilestoneStatus(milestone);
          const config = statusConfig[status];
          const Icon = config.icon;

          return (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-white ${config.bg} shadow-md`}>
                  <Icon className={`${config.iconColor}`} size={20} />
                </div>
                {idx < milestones.length - 1 && (
                  <div className="mt-2 w-1 h-8 bg-gradient-to-b from-brand-orange to-gray-200" />
                )}
              </div>
              <div className="pb-4 flex-1 pt-2">
                <p className="font-semibold text-brand-dark">
                  {milestone.milestoneTitle}
                </p>
                <p className="mt-1 text-xs font-semibold text-brand-orange uppercase tracking-wider">
                  {config.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
