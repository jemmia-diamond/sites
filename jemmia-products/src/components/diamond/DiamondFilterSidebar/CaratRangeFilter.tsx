import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DiamondFilter } from "../../../types";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaratRangeFilterProps {
  filters: DiamondFilter;
  onMinCaratChange: (value: number | undefined) => void;
  onMaxCaratChange: (value: number | undefined) => void;
  onApply: () => void;
  onPresetSelect?: (from: number | undefined, to: number | undefined) => void;
}

const CARAT_PRESETS = [
  { label: "0.30 - 0.39", from: 0.30, to: 0.39 },
  { label: "0.40 - 0.49", from: 0.40, to: 0.49 },
  { label: "0.50 - 0.69", from: 0.50, to: 0.69 },
  { label: "0.70 - 0.89", from: 0.70, to: 0.89 },
  { label: "0.90 - 0.99", from: 0.90, to: 0.99 },
  { label: "1.00 - 1.49", from: 1.00, to: 1.49 },
  { label: "1.50 - 1.99", from: 1.50, to: 1.99 },
  { label: "2.00 - 2.99", from: 2.00, to: 2.99 },
  { label: "3.00 - 3.99", from: 3.00, to: 3.99 },
];

export function CaratRangeFilter({
  filters,
  onMinCaratChange,
  onMaxCaratChange,
  onApply,
  onPresetSelect,
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
    onApply();
  };

  const handlePresetClick = (from: number, to: number) => {
    const isActive = filters.caratFrom === from && filters.caratTo === to;
    if (onPresetSelect) {
      if (isActive) {
        onPresetSelect(undefined, undefined);
      } else {
        onPresetSelect(from, to);
      }
    } else {
      if (isActive) {
        onMinCaratChange(undefined);
        onMaxCaratChange(undefined);
      } else {
        onMinCaratChange(from);
        onMaxCaratChange(to);
      }
      setTimeout(onApply, 0);
    }
  };

  return (
    <div className="space-y-3">
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
        <div className="pt-6 hidden xl:block">
          <Button
            variant="secondary"
            className="w-full px-2 rounded-none font-bold tracking-[0.2em] shadow-lg shadow-secondary-900/10 cursor-pointer"
            onClick={handleApply}
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {CARAT_PRESETS.map((preset) => {
          const isActive = filters.caratFrom === preset.from && filters.caratTo === preset.to;
          return (
            <Button
              key={preset.label}
              variant={isActive ? "default" : "outline"}
              onClick={() => handlePresetClick(preset.from, preset.to)}
              className={cn(
                "h-9 rounded-none text-xs px-1! border transition-all cursor-pointer font-medium tracking-tight hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
                isActive
                  ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
                  : "bg-white text-primary-600 border-primary-100"
              )}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
