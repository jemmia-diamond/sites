import { useState } from "react";
import { ProductModel } from "../../../types";
import { Badge } from "@/components/ui/badge";
import { CaretDown, Copy, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useHoverPopover } from "./hooks/useHoverPopover";

interface ProductCodesProps {
  product: ProductModel;
  isExpanded: boolean;
}

export function ProductCodes({ product, isExpanded }: ProductCodesProps) {
  const { open, onEnter, onLeave } = useHoverPopover();

  const otherCodes = Array.from(
    new Set([
      product.attributes?.erpCode,
      product.attributes?.code,
      product.attributes?.backupCode,
    ].filter(Boolean))
  ).filter((c) => c !== product.attributes?.designCode);

  const hasOther = otherCodes.length > 0;

  return (
    <div className="relative inline-block" onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <Badge className="rounded-full bg-secondary-900 text-white px-2 py-0.5 text-[10px] font-black tracking-widest border-none shadow-sm uppercase whitespace-nowrap">
        {product.attributes?.designCode || "N/A"}
      </Badge>

      {hasOther && (
        <div
          className={cn(
            "absolute -right-5 top-1/2 -translate-y-1/2",
            "flex items-center justify-center w-4 h-4 rounded-full transition-all duration-200"
          )}
        >
          <CaretDown
            size={10}
            weight="bold"
            className={cn(
              "transition-all duration-200",
              isExpanded
                ? open ? "text-white rotate-180" : "text-white"
                : open ? "text-secondary-900 rotate-180" : "text-primary-400"
            )}
          />
        </div>
      )}

      {hasOther && open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[80]">
          <div className="bg-white border border-primary-100 shadow-xl p-1.5 flex flex-col gap-1 min-w-[160px] items-center">
            {otherCodes.map((c, i) => (
              <Badge
                key={i}
                className="w-full justify-center bg-primary-50 text-secondary-900 px-3 py-1.5 text-[9px] font-bold tracking-widest whitespace-nowrap border border-primary-100 rounded-md"
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}