import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DiamondFilter } from "../../../types";
import { ChevronRight } from "lucide-react";

interface PriceRangeFilterProps {
  filters: DiamondFilter;
  onMinPriceChange: (value: number | undefined) => void;
  onMaxPriceChange: (value: number | undefined) => void;
}

export function PriceRangeFilter({
  filters,
  onMinPriceChange,
  onMaxPriceChange,
}: PriceRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 space-y-1.5">
        <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối thiểu</span>
        <div className="relative">
          <Input
            type="number"
            placeholder="0"
            className="h-9 text-xs font-bold bg-gray-50/50 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-12"
            value={filters.salePriceFrom || ""}
            onChange={(e) => onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-200 font-bold uppercase">triệu</span>
        </div>
      </div>

      <div className="pt-6 font-bold text-gray-300">-</div>

      <div className="flex-1 space-y-1.5">
        <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối đa</span>
        <div className="relative">
          <Input
            type="number"
            placeholder="100"
            className="h-9 text-xs font-bold bg-gray-50/50 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-12"
            value={filters.salePriceTo || ""}
            onChange={(e) => onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-200 font-bold uppercase">triệu</span>
        </div>
      </div>
    </div>
  );
}