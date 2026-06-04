"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "./classNames";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#405189] focus:ring-2 focus:ring-[#405189]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
          className
        )}
        {...props}
      />
    );
  }
);
