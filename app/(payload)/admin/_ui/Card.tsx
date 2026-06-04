import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./classNames";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("rounded-lg border border-slate-200 bg-white shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({
  actions,
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { actions?: ReactNode }) {
  return (
    <div
      className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4", className)}
      {...props}
    >
      <div className="min-w-0">{children}</div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
