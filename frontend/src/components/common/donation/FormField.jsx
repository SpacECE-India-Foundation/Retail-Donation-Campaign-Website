import { cn } from "../../../utils/cn";

export default function FormField({
  id,
  label,
  required,
  error,
  children,
  className,
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-semibold tracking-wide text-brand-dark">
        {label}
        {required && <span className="ml-0.5 text-brand-danger">*</span>}
      </label>
      {children({ id, errorId, hasError: Boolean(error) })}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-brand-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function inputClass(hasError) {
  return cn(
    "w-full rounded-xl border bg-white px-4 py-3 text-base text-brand-dark outline-none transition-all duration-300",
    "placeholder:text-brand-muted/80 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 focus:shadow-sm",
    hasError ? "border-brand-danger" : "border-brand-border",
  );
}
