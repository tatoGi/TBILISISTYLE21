"use client";

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import Link from "next/link";
import { cn } from "./classNames";

type ButtonVariant = "solid" | "outline" | "soft" | "ghost" | "link";
type ButtonColor = "primary" | "success" | "danger" | "slate";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  icon?: ReactNode;
  asChild?: boolean;
  href?: string;
};

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4",
};

const variants: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
  primary: "bg-[#405189] text-white hover:bg-[#364574] focus-visible:ring-[#405189]",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500",
    danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500",
    slate: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-700",
  },
  outline: {
    primary: "border border-[#405189] bg-white text-[#405189] hover:bg-[#f3f6f9] focus-visible:ring-[#405189]",
    success: "border border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500",
    danger: "border border-rose-600 bg-white text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500",
    slate: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-500",
  },
  soft: {
    primary: "bg-[#eef1fb] text-[#405189] hover:bg-[#dfe5f7] focus-visible:ring-[#405189]",
    success: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus-visible:ring-emerald-500",
    danger: "bg-rose-100 text-rose-700 hover:bg-rose-200 focus-visible:ring-rose-500",
    slate: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-500",
  },
  ghost: {
    primary: "text-[#405189] hover:bg-[#eef1fb] focus-visible:ring-[#405189]",
    success: "text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500",
    danger: "text-rose-700 hover:bg-rose-50 focus-visible:ring-rose-500",
    slate: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-500",
  },
  link: {
    primary: "h-auto px-0 text-[#405189] underline-offset-4 hover:underline focus-visible:ring-[#405189]",
    success: "h-auto px-0 text-emerald-700 underline-offset-4 hover:underline focus-visible:ring-emerald-500",
    danger: "h-auto px-0 text-rose-700 underline-offset-4 hover:underline focus-visible:ring-rose-500",
    slate: "h-auto px-0 text-slate-700 underline-offset-4 hover:underline focus-visible:ring-slate-500",
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    asChild = false,
    children,
    className,
    color = "primary",
    href,
    icon,
    size = "md",
    type = "button",
    variant = "solid",
    ...props
  },
  ref
) {
  const classes = cn(base, variant !== "link" && sizes[size], variants[variant][color], className);
  const content = (
    <>
      {icon ? <span className="grid shrink-0 place-items-center">{icon}</span> : null}
      {children}
    </>
  );

  if (asChild) {
    const child = Children.only(children);

    if (!isValidElement<HTMLAttributes<HTMLElement>>(child)) {
      return null;
    }

    return cloneElement(child as ReactElement<HTMLAttributes<HTMLElement>>, {
      className: cn(classes, child.props.className),
    });
  }

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} className={classes} {...props}>
      {content}
    </button>
  );
});
