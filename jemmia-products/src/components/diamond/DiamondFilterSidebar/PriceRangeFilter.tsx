import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DiamondFilter } from "../../../types";
import { ChevronRight } from "lucide-react";

interface PriceRangeFilterProps {
  filters: DiamondFilter;
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
  const handleMinChange = (val: string) => {
    if (val === "") {
      onMinPriceChange(undefined);
      return;
    }
    const num = Number(val);
    if (num < 0) return;
    onMinPriceChange(num);
  };

  const handleMaxChange = (val: string) => {
    if (val === "") {
      onMaxPriceChange(undefined);
      return;
    }
    const num = Number(val);
    if (num < 0) return;
    onMaxPriceChange(num);
  };

  const handleApply = () => {
    if (filters.salePriceFrom !== undefined && filters.salePriceTo !== undefined && filters.salePriceTo < filters.salePriceFrom) {
      onMaxPriceChange(filters.salePriceFrom);
    }
    onApply();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 space-y-1.5">
        <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối thiểu</span>
        <div className="relative">
          <Input
            type="number"
            min="0"
            placeholder="0"
            className="h-9 text-xs font-bold bg-gray-50/50 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
            value={filters.salePriceFrom ?? ""}
            onChange={(e) => handleMinChange(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-400 font-bold uppercase">triệu</span>
        </div>
      </div>

      <div className="pt-6 font-bold text-gray-300">-</div>

      <div className="flex-1 space-y-1.5">
        <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối đa</span>
        <div className="relative">
          <Input
            type="number"
            min="0"
            placeholder="∞"
            className="h-9 text-xs font-bold bg-gray-50/50 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
            value={filters.salePriceTo ?? ""}
            onChange={(e) => handleMaxChange(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-400 font-bold uppercase">triệu</span>
        </div>
      </div>
      <div className="pt-6 hidden lg:block">
        <Button
          variant="secondary"
          className="w-full px-2 rounded-none font-bold tracking-[0.2em] shadow-lg shadow-secondary-900/10 cursor-pointer"
          onClick={handleApply}
        >
          <ChevronRight size={20} />
        </Button>
      </div>
    </div>
  );
}