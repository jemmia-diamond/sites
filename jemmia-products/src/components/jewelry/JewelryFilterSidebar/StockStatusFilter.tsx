import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { StockStatusFilter as StockStatusFilterType, JewelryFilter } from "../../../types";

interface StockStatusFilterProps {
  filters: JewelryFilter;
  onStockStatusChange: (status: StockStatusFilterType) => void;
}

const STOCK_OPTIONS: { label: string; value: StockStatusFilterType }[] = [
  { label: "Có hàng", value: "IN_STOCK" },
  { label: "Hết hàng", value: "OUT_OF_STOCK" },
];

export function StockStatusFilter({ filters, onStockStatusChange }: StockStatusFilterProps) {
  return (
    <RadioGroup
      value={filters.stockStatus}
      onValueChange={onStockStatusChange}
      className="flex flex-col gap-3"
    >
      {STOCK_OPTIONS.map((item) => (
        <div key={item.value} className="flex items-center space-x-3 group">
          <RadioGroupItem
            value={item.value}
            id={item.value}
            className="h-4 w-4 border-primary-300 text-secondary-900"
          />
          <Label
            htmlFor={item.value}
            className="text-xs text-primary-600 font-medium cursor-pointer group-hover:text-secondary-900"
          >
            {item.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}