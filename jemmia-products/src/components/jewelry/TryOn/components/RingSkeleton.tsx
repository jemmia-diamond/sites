import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function RingSkeleton() {
  return (
    <div className="bg-white border border-primary-100 flex flex-col items-start justify-between p-2 space-y-3 w-full">
      <Skeleton className="w-full aspect-square bg-slate-100/50 rounded" />
      <div className="w-full space-y-1.5 px-0.5">
        <Skeleton className="h-3 w-2/3 bg-slate-100/50" />
        <Skeleton className="h-4.5 w-1/2 bg-slate-100/50" />
      </div>
    </div>
  );
}
