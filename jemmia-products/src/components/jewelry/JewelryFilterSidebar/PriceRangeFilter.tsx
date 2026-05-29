import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JewelryFilter } from "../../../types";
import { ChevronRight } from "lucide-react";

interface PriceRangeFilterProps {
  filters: JewelryFilter;
  onMinPriceChange: (value: number | undefined) => void;
  onMaxPriceChange: (value: number | undefined) => void;
  onApply: () => void;
}

export function PriceRangeFilter({
  filters,
  onMinPriceChange,
  onMaxPriceChange,
  onApply,
}: PriceRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 space-y-1.5">
        <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối thiểu</span>
        <div className="relative">
          <Input
            type="number"
            placeholder="0"
            className="h-9 text-xs font-bold bg-primary-50/30 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
            value={filters.salePriceFrom ?? ""}
            onChange={(e) => onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-300 font-bold uppercase">triệu</span>
        </div>
      </div>

      <div className="pt-6 font-bold text-primary-200">-</div>

      <div className="flex-1 space-y-1.5">
        <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối đa</span>
        <div className="relative">
          <Input
            type="number"
            placeholder="∞"
            className="h-9 text-xs font-bold bg-primary-50/30 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
            value={filters.salePriceTo ?? ""}
            onChange={(e) => onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-300 font-bold uppercase">triệu</span>
        </div>
      </div>
      <div className="pt-6 hidden xl:block">
        <Button
          variant="secondary"
          className="w-full px-2 rounded-none font-bold tracking-[0.2em] shadow-lg shadow-secondary-900/10 cursor-pointer"
          onClick={onApply}
        >
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}
