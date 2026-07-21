import { CheckCircle2, Circle, Lock } from "lucide-react";
import { formatINR } from "../../../utils/donationForm";
import { cn } from "../../../utils/cn";

function getMilestoneStatus(milestone, index, sorted) {
  if (milestone.isCompleted) return "completed";

  const firstIncompleteIndex = sorted.findIndex((m) => !m.isCompleted);
  if (index === firstIncompleteIndex) return "in_progress";
  return "locked";
}

function getRaisedAmount(milestone) {
  if (milestone.raisedAmount != null) return milestone.raisedAmount;
  if (milestone.isCompleted) return milestone.targetAmount;
  return 0;
}

function getProgressPercent(milestone, status) {
  if (status === "locked") return 0;
  const raised = getRaisedAmount(milestone);
  return Math.min(Math.round((raised / milestone.targetAmount) * 100), 100);
}

const STATUS_LABELS = {
  completed: "Completed",
  in_progress: "In Progress",
  locked: "Locked",
};

const STATUS_STYLES = {
  completed: "bg-brand-success/10 text-brand-success",
  in_progress: "bg-brand-orange/10 text-brand-orange",
  locked: "bg-brand-muted/10 text-brand-muted",
};

export default function CampaignMilestones({ milestones = [] }) {
  const sorted = [...milestones].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  return (
    <section id="campaign-milestones" className="animate-fade-in-up">
      <div className="mb-4 sm:mb-5">
        <h2 className="font-display text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
          Campaign Milestones
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Follow the journey as this campaign reaches each goal
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white/60 px-4 py-8 text-center shadow-sm">
          <p className="text-sm text-brand-muted">
            No milestones available for this campaign.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-0">
          {sorted.map((milestone, index) => {
            const status = getMilestoneStatus(milestone, index, sorted);
            const raised = getRaisedAmount(milestone);
            const progress = getProgressPercent(milestone, status);
            const isLocked = status === "locked";

            return (
              <li
                key={milestone.id}
                className={cn(
                  "relative flex gap-3 pb-5 last:pb-0 sm:gap-4",
                  isLocked && "opacity-75",
                )}
              >
                {index < sorted.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-0.5 sm:left-[17px]",
                      status === "completed"
                        ? "bg-brand-success/40"
                        : "bg-brand-border",
                    )}
                    aria-hidden="true"
                  />
                )}

                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white sm:h-9 sm:w-9",
                    status === "completed" && "border-brand-success text-brand-success",
                    status === "in_progress" && "border-brand-orange text-brand-orange",
                    status === "locked" && "border-brand-border text-brand-muted",
                  )}
                >
                  {status === "completed" && <CheckCircle2 size={16} aria-hidden="true" />}
                  {status === "in_progress" && <Circle size={16} aria-hidden="true" />}
                  {status === "locked" && <Lock size={14} aria-hidden="true" />}
                </div>

                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-xl border bg-white px-3 py-3 sm:px-4 sm:py-3.5",
                    "shadow-[0_2px_12px_-4px_rgba(26,26,26,0.08)] transition-all duration-300",
                    !isLocked && "hover:border-brand-orange/25 hover:shadow-[0_4px_16px_-4px_rgba(232,116,26,0.1)]",
                    isLocked ? "border-brand-border/60 bg-brand-cream/30" : "border-brand-border/70",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-base font-bold leading-snug text-brand-dark sm:text-[17px]">
                      {milestone.milestoneTitle}
                    </h3>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        STATUS_STYLES[status],
                      )}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-brand-muted sm:text-sm">
                    {milestone.description}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold sm:text-xs">
                    <span className="text-brand-muted">
                      Target:{" "}
                      <span className="text-brand-dark">{formatINR(milestone.targetAmount)}</span>
                    </span>
                    <span className="text-brand-muted">
                      Raised:{" "}
                      <span className="text-brand-teal">{formatINR(raised)}</span>
                    </span>
                  </div>

                  {!isLocked && (
                    <div className="mt-2.5">
                      <div className="mb-1 flex justify-between text-[11px] sm:text-xs">
                        <span className="text-brand-muted">Progress</span>
                        <span className="font-bold text-brand-orange">{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-brand-cream">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            status === "completed"
                              ? "bg-brand-success"
                              : "bg-gradient-to-r from-brand-orange to-brand-orange-hover",
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
