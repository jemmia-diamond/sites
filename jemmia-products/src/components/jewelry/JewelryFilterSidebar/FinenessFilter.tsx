import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { JewelryFilter } from "../../../types";

interface FinenessFilterProps {
  filters: JewelryFilter;
  finenesses: string[];
  onFinenessChange: (fineness: string) => void;
}

export function FinenessFilter({
  filters,
  finenesses,
  onFinenessChange,
}: FinenessFilterProps) {
  return (
    <RadioGroup
      value={filters.fineness || ""}
      onValueChange={onFinenessChange}
      className="flex flex-col gap-3"
    >
      {finenesses.map((item) => (
        <div key={item} className="flex items-center space-x-3 group">
          <RadioGroupItem
            value={item}
            id={`fineness-${item}`}
            className="h-4 w-4 border-primary-300 text-secondary-900"
          />
          <Label
            htmlFor={`fineness-${item}`}
            className="text-xs text-primary-600 font-medium cursor-pointer group-hover:text-secondary-900"
          >
            {item}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
