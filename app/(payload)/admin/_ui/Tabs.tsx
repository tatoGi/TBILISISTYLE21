import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "./classNames";

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("inline-flex rounded-lg bg-slate-100 p-1", className)} {...props} />;
}

export function TabLink({
  active,
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-bold transition",
        active ? "bg-[#405189] text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-[#405189]",
        className
      )}
      {...props}
    />
  );
}
