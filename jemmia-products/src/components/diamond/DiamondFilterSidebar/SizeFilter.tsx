import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DiamondFilter } from "../../../types";
import { ChevronRight } from "lucide-react";

interface SizeFilterProps {
  filters: DiamondFilter;
  onMinEdgeLongChange: (value: number | undefined) => void;
  onMaxEdgeLongChange: (value: number | undefined) => void;
  onMinEdgeShortChange: (value: number | undefined) => void;
  onMaxEdgeShortChange: (value: number | undefined) => void;
  onApply: () => void;
}

export function SizeFilter({
  filters,
  onMinEdgeLongChange,
  onMaxEdgeLongChange,
  onMinEdgeShortChange,
  onMaxEdgeShortChange,
  onApply,
}: SizeFilterProps) {
  const handleMin1Change = (val: string) => {
    if (val === "") {
      onMinEdgeLongChange(undefined);
      return;
    }
    const num = parseFloat(val);
    if (num < 0) return;
    onMinEdgeLongChange(num);
  };

  const handleMax1Change = (val: string) => {
    if (val === "") {
      onMaxEdgeLongChange(undefined);
      return;
    }
    const num = parseFloat(val);
    if (num < 0) return;
    onMaxEdgeLongChange(num);
  };

  const handleMin2Change = (val: string) => {
    if (val === "") {
      onMinEdgeShortChange(undefined);
      return;
    }
    const num = parseFloat(val);
    if (num < 0) return;
    onMinEdgeShortChange(num);
  };

  const handleMax2Change = (val: string) => {
    if (val === "") {
      onMaxEdgeShortChange(undefined);
      return;
    }
    const num = parseFloat(val);
    if (num < 0) return;
    onMaxEdgeShortChange(num);
  };

  const handleApply1 = () => {
    onApply();
  };

  const handleApply2 = () => {
    onApply();
  };

  return (
    <div className="space-y-4">
      {/* Cạnh dài */}
      <div className="space-y-1.5">
        <span className="text-xs text-primary-400 font-medium pl-1">Cạnh dài</span>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              className="h-9 text-xs font-bold bg-primary-50/30 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
              value={filters.edgeLongFrom ?? ""}
              onChange={(e) => handleMin1Change(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-400 font-bold">mm</span>
          </div>

          <div className="font-bold text-primary-200">-</div>

          <div className="flex-1 relative">
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="∞"
              className="h-9 text-xs font-bold bg-primary-50/30 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
              value={filters.edgeLongTo ?? ""}
              onChange={(e) => handleMax1Change(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-400 font-bold">mm</span>
          </div>
          <div className="hidden xl:block">
            <Button
              variant="secondary"
              className="px-2 h-9 rounded-none font-bold tracking-[0.2em] shadow-lg shadow-secondary-900/10 cursor-pointer"
              onClick={handleApply1}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Cạnh ngắn */}
      <div className="space-y-1.5">
        <span className="text-xs text-primary-400 font-medium pl-1">Cạnh ngắn</span>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              className="h-9 text-xs font-bold bg-primary-50/30 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
              value={filters.edgeShortFrom ?? ""}
              onChange={(e) => handleMin2Change(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-400 font-bold">mm</span>
          </div>

          <div className="font-bold text-primary-200">-</div>

          <div className="flex-1 relative">
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="∞"
              className="h-9 text-xs font-bold bg-primary-50/30 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
              value={filters.edgeShortTo ?? ""}
              onChange={(e) => handleMax2Change(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-400 font-bold">mm</span>
          </div>
          <div className="hidden xl:block">
            <Button
              variant="secondary"
              className="px-2 h-9 rounded-none font-bold tracking-[0.2em] shadow-lg shadow-secondary-900/10 cursor-pointer"
              onClick={handleApply2}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}