import React from "react";
import { cn } from "@/lib/utils";

interface MobileProgressBarProps {
  activeCount: number;
  className?: string;
}

export function MobileProgressBar({ activeCount, className }: MobileProgressBarProps) {
  // segment progress percentage (3 segments between 4 circles)
  const linePercent = activeCount <= 1 ? 0 : ((activeCount - 1) / 3) * 100;

  return (
    <div className={cn("relative flex items-center justify-between w-full md:max-w-[280px] mx-auto md:mx-0 select-none", className)}>
      {/* Background Line (Gray/Purple) */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-gray-400 z-0" />

      {/* Active Line Overlay (Teal) */}
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] z-0 overflow-hidden">
        <div
          className="h-full bg-secondary-900 transition-all duration-500 ease-in-out"
          style={{ width: `${linePercent}%` }}
        />
      </div>

      {Array.from({ length: 4 }).map((_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < activeCount;
        const isActive = stepNum === activeCount;

        return (
          <div
            key={i}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs transition-all duration-500 ease-in-out z-10",
              isCompleted && "bg-secondary-900 border-2 border-secondary-900 text-white shadow-sm",
              isActive && "bg-white border-2 border-secondary-900 text-secondary-900 shadow-sm",
              !isCompleted && !isActive && "bg-white border-2 border-gray-400 text-gray-400"
            )}
          >
            0{stepNum}
          </div>
        );
      })}
    </div>
  );
}
