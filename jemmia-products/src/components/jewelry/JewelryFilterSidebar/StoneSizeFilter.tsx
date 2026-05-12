import { Button } from "@/components/ui/button";
import { JewelryFilter } from "../../../types";
import { cn } from "@/lib/utils";

interface StoneSizeFilterProps {
  filters: JewelryFilter;
  stoneSizes: string[];
  onSizeToggle: (size: string) => void;
}

export function StoneSizeFilter({
  filters,
  stoneSizes,
  onSizeToggle,
}: StoneSizeFilterProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {stoneSizes.map((size) => (
        <Button
          key={size}
          variant={filters.storageSize1?.includes(size) ? "default" : "outline"}
          className={cn(
            "h-8 w-full px-0 rounded-none text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
            filters.storageSize1?.includes(size)
              ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
              : "bg-white text-primary-500 border-primary-100"
          )}
          onClick={() => onSizeToggle(size)}
        >
          {size} ly
        </Button>
      ))}
    </div>
  );
}