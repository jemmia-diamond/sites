import { Button } from "@/components/ui/button";
import { DiamondFilter } from "../../../types";
import { cn } from "@/lib/utils";

interface SizeButton {
  label: string;
  value: number;
}

interface SizeFilterProps {
  filters: DiamondFilter;
  sizes: SizeButton[];
  onSizeToggle: (value: number) => void;
}

export function SizeFilter({ filters, sizes, onSizeToggle }: SizeFilterProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {sizes.map((size) => (
        <Button
          key={size.label}
          variant={filters.edgeSizes?.includes(size.value) ? "default" : "outline"}
          onClick={() => onSizeToggle(size.value)}
          className={cn(
            "h-8 w-full px-0 rounded-none text-xs transition-all tracking-wider cursor-pointer hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
            filters.edgeSizes?.includes(size.value)
              ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
              : "bg-white text-primary-500 border-primary-100"
          )}
        >
          {size.label}
        </Button>
      ))}
    </div>
  );
}