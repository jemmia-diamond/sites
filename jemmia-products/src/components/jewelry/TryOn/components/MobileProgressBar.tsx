import React from "react";
import { cn } from "@/lib/utils";

interface MobileProgressBarProps {
  activeCount: number;
}

export function MobileProgressBar({ activeCount }: MobileProgressBarProps) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 w-8 rounded-full transition-all duration-300",
            i < activeCount ? "bg-primary-900" : "bg-primary-100",
          )}
        />
      ))}
    </div>
  );
}
