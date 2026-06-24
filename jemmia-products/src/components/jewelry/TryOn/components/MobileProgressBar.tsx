import React from "react";
import { cn } from "@/lib/utils";

interface MobileProgressBarProps {
  activeCount: number;
  className?: string;
  onStepClick?: (step: number) => void;
  disabled?: boolean;
  maxStep?: number;
}

export function MobileProgressBar({ activeCount, className, onStepClick, disabled, maxStep }: MobileProgressBarProps) {
  // segment progress percentage (3 segments between 4 circles)
  const linePercent = activeCount <= 1 ? 0 : ((activeCount - 1) / 3) * 100;

  return (
    <div className={cn("relative flex items-center justify-between w-full md:max-w-75 mx-auto md:mx-0 select-none", className)}>
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
        const limitStep = maxStep ?? activeCount;
        const isClickable = stepNum <= limitStep && stepNum !== activeCount;
        const isCompleted = stepNum <= limitStep && stepNum !== activeCount;
        const isActive = stepNum === activeCount;

        return (
          <div
            key={i}
            onClick={() => {
              if (isClickable && onStepClick && !disabled) {
                onStepClick(stepNum);
              }
            }}
            className={cn(
              "rounded-full lg:pt-0.5 flex items-center justify-center font-medium text-xs transition-all duration-500 ease-in-out z-10",
              isClickable && !disabled && "w-8 h-8 cursor-pointer hover:scale-105 active:scale-95",
              isCompleted && "w-8 h-8 bg-secondary-900 border-2 xl:border-3 border-secondary-900 text-white shadow-sm",
              isActive && "bg-secondary-200 w-9 h-9 border-2 xl:border-3 border-secondary-900 text-secondary-900 shadow-sm",
              !isCompleted && !isActive && "w-8 h-8 bg-white border border-gray-400 text-gray-400"
            )}
          >
            0{stepNum}
          </div>
        );
      })}
    </div>
  );
}
