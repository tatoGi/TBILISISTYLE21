"use client";

import SimpleBar, { type Props as SimpleBarProps } from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { cn } from "./classNames";

export function Scrollable({ className, ...props }: SimpleBarProps) {
  return <SimpleBar className={cn("min-w-0", className)} {...props} />;
}
