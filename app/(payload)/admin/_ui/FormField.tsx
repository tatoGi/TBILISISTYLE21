import type { ReactNode } from "react";
import { cn } from "./classNames";
import { Label } from "./Label";

type FormFieldProps = {
  children: ReactNode;
  className?: string;
  error?: ReactNode;
  hint?: ReactNode;
  id?: string;
  label?: ReactNode;
};

export function FormField({ children, className, error, hint, id, label }: FormFieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      {children}
      {hint && !error ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}
    </div>
  );
}
