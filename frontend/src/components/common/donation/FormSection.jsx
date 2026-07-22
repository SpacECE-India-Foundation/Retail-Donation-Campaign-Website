import { cn } from "../../../utils/cn";

export default function FormSection({ title, description, children, className }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-border/80 bg-brand-cream/30 p-5 sm:p-6",
        "transition-all duration-300",
        className,
      )}
    >
      <div className="mb-5 border-b border-brand-border/60 pb-4">
        <h3 className="font-display text-lg font-bold text-brand-dark">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-brand-muted">{description}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
