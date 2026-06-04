"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./classNames";

export const inputClassName =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#405189] focus:ring-2 focus:ring-[#405189]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...props }, ref) {
    return <input ref={ref} type={type} className={cn(inputClassName, className)} {...props} />;
  }
);
