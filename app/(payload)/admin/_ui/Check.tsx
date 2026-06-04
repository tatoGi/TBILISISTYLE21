"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./classNames";

type CheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
  type?: "checkbox" | "radio";
};

export const Check = forwardRef<HTMLInputElement, CheckProps>(function Check(
  { className, label, type = "checkbox", ...props },
  ref
) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700", className)}>
      <input
        ref={ref}
        type={type}
        className="h-4 w-4 rounded border-slate-300 text-[#405189] accent-[#405189] focus:ring-[#405189]/20"
        {...props}
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
});

export const Switch = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label?: ReactNode }>(
  function Switch({ className, label, ...props }, ref) {
    return (
      <label className={cn("inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700", className)}>
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        <span className="relative h-5 w-9 rounded-full bg-slate-300 transition after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-[#405189] peer-checked:after:translate-x-4" />
        {label ? <span>{label}</span> : null}
      </label>
    );
  }
);
