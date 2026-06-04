import type { HTMLAttributes } from "react";
import { cn } from "./classNames";

type BadgeTone = "primary" | "success" | "danger" | "warning" | "info" | "slate";

const tones: Record<BadgeTone, string> = {
  primary: "bg-[#eef1fb] text-[#405189]",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-sky-100 text-sky-700",
  slate: "bg-slate-100 text-slate-700",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

export function Badge({ className, tone = "slate", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
