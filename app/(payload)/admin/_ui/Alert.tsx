import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./classNames";

type AlertTone = "primary" | "success" | "warning" | "danger" | "info" | "slate";

const tones: Record<AlertTone, string> = {
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  primary: "border-[#c8d0ee] bg-[#eef1fb] text-[#405189]",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  tone?: AlertTone;
};

export function Alert({ children, className, icon, tone = "primary", ...props }: AlertProps) {
  return (
    <div className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm", tones[tone], className)} {...props}>
      {icon ? <span className="mt-0.5 grid shrink-0 place-items-center">{icon}</span> : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
