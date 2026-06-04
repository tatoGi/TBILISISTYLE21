import type { ReactNode } from "react";
import { cn } from "./classNames";

type EmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
};

export function EmptyState({ action, className, description, icon, title }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
