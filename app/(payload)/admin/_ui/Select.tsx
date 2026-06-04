"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "./classNames";
import { inputClassName } from "./Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(inputClassName, "appearance-none pr-8", className)}
        {...props}
      >
        {children}
      </select>
    );
  }
);
