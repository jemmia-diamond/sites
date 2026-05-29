import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DiamondFilter } from "../../../types";
import { ChevronRight } from "lucide-react";

interface CaratRangeFilterProps {
  filters: DiamondFilter;
  onMinCaratChange: (value: number | undefined) => void;
  onMaxCaratChange: (value: number | undefined) => void;
  onApply: () => void;
}

export function CaratRangeFilter({
  filters,
  onMinCaratChange,
  onMaxCaratChange,
  onApply,
}: CaratRangeFilterProps) {
  const handleMinChange = (val: string) => {
    if (val === "") {
      onMinCaratChange(undefined);
      return;
    }
    const num = parseFloat(val);
    if (num < 0) return;
    onMinCaratChange(num);
  };

  const handleMaxChange = (val: string) => {
    if (val === "") {
      onMaxCaratChange(undefined);
      return;
    }
    const num = parseFloat(val);
    if (num < 0) return;
    onMaxCaratChange(num);
  };

  const handleApply = () => {
    if (filters.caratFrom !== undefined && filters.caratTo !== undefined && filters.caratTo < filters.caratFrom) {
      // If max is less than min, we can either swap them or just not apply and show something.
      // But the requirement says "tối đa bắt buộc phải >= tối thiểu".
      // We will set max to min if it's less.
      onMaxCaratChange(filters.caratFrom);
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
            step="0.01"
            min="0"
            placeholder="0"
            className="h-9 text-xs font-bold bg-primary-50/30 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
            value={filters.caratFrom ?? ""}
            onChange={(e) => handleMinChange(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-400 font-bold">Carat</span>
        </div>
      </div>

      <div className="pt-6 font-bold text-primary-200">-</div>

      <div className="flex-1 space-y-1.5">
        <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối đa</span>
        <div className="relative">
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="∞"
            className="h-9 text-xs font-bold bg-primary-50/30 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
            value={filters.caratTo ?? ""}
            onChange={(e) => handleMaxChange(e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-400 font-bold">Carat</span>
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
