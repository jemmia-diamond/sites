import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DiamondFilter } from "../../../types";

interface MultiSelectButtonFilterProps {
  label: string;
  options: string[];
  filters: DiamondFilter;
  filterKey: keyof DiamondFilter;
  onToggle: (value: string) => void;
  variant?: "grid" | "flex";
  cols?: number;
}

export function MultiSelectButtonFilter({
  label,
  options,
  filters,
  filterKey,
  onToggle,
  variant = "flex",
  cols = 4,
}: MultiSelectButtonFilterProps) {
  const selectedValues = (filters[filterKey] as string[]) || [];

  return (
    <div className={variant === "grid" ? `grid grid-cols-${cols} gap-2` : "flex flex-wrap gap-2"}>
      {options.map((option) => (
        <Button
          key={option}
          variant={selectedValues.includes(option) ? "default" : "outline"}
          onClick={() => onToggle(option)}
          className={cn(
            "h-8 rounded-none text-[10px] border transition-all cursor-pointer uppercase tracking-tight hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
            selectedValues.includes(option)
              ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
              : "bg-white text-primary-500 border-primary-100"
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}