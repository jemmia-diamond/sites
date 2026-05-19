import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MultiSelectButtonFilterProps {
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  columns?: number;
  labelModifier?: (value: string) => string;
}

export function MultiSelectButtonFilter({
  options,
  selectedValues,
  onToggle,
  columns = 2,
  labelModifier = (v) => v,
}: MultiSelectButtonFilterProps) {
  return (
    <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-3")}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option);
        return (
          <Button
            key={option}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "h-auto min-h-[32px] py-1.5 w-full px-2 rounded-none text-xs transition-all cursor-pointer hover:bg-secondary-900 hover:text-white hover:border-secondary-900 whitespace-normal text-left flex justify-start",
              isSelected
                ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
                : "bg-white text-primary-500 border-primary-100"
            )}
            onClick={() => onToggle(option)}
          >
            {labelModifier(option)}
          </Button>
        );
      })}
    </div>
  );
}
