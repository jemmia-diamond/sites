import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("relative shrink-0", sizeClasses[size], className)}>
      <div className="absolute inset-0 border-2 border-primary-50 rounded-full" />
      <div className="absolute inset-0 border-2 border-t-secondary-900 rounded-full animate-spin" />
    </div>
  );
}
