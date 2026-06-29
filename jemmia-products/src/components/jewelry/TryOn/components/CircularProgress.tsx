import React from "react";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 6,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const currentProgress = Math.floor(progress);
  const strokeDashoffset = circumference * (1 - currentProgress / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="text-white/20"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="text-white transition-all duration-300 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      <span className="absolute text-white font-bold text-lg select-none">
        {currentProgress}%
      </span>
    </div>
  );
}
