import { cn } from "./classNames";

type ProgressTone = "primary" | "success" | "warning" | "danger" | "info";

const tones: Record<ProgressTone, string> = {
  danger: "bg-rose-500",
  info: "bg-sky-500",
  primary: "bg-[#405189]",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
};

export function Progress({
  className,
  tone = "primary",
  value,
}: {
  className?: string;
  tone?: ProgressTone;
  value: number;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-100", className)}>
      <div className={cn("h-full rounded-full transition-all", tones[tone])} style={{ width: `${clamped}%` }} />
    </div>
  );
}
