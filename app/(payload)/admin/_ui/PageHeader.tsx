import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "./classNames";

type PageHeaderProps = {
  actions?: ReactNode;
  breadcrumbs?: Array<{ href?: string; label: string }>;
  className?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
};

export function PageHeader({
  actions,
  breadcrumbs,
  className,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  const crumbs = breadcrumbs ?? [
    { href: "/admin", label: "Dashboard" },
    ...(eyebrow ? [{ label: eyebrow }] : []),
    { label: title },
  ];

  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs font-semibold text-[#878a99]">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
              {index > 0 ? <span className="text-[#adb5bd]">/</span> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="transition hover:text-[#405189]">
                  {crumb.label}
                </Link>
              ) : (
                <span className={index === crumbs.length - 1 ? "text-[#405189]" : undefined}>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#405189]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
