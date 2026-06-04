import type { HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "./classNames";

export function DropdownMenu({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-w-44 rounded-lg border border-slate-200 bg-white py-2 shadow-lg", className)}
      {...props}
    />
  );
}

export function DropdownItem({
  children,
  className,
  href,
  icon,
  ...props
}: HTMLAttributes<HTMLAnchorElement> & { href?: string; icon?: ReactNode }) {
  const classes = cn(
    "flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#f3f6f9] hover:text-[#405189]",
    className
  );
  const content = (
    <>
      {icon ? <span className="grid shrink-0 place-items-center text-slate-400">{icon}</span> : null}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <a className={classes} {...props}>
      {content}
    </a>
  );
}
