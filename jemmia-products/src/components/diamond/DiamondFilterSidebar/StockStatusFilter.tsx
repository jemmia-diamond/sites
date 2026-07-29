import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DiamondFilter } from "../../../types";

interface StockStatusFilterProps {
  filters: DiamondFilter;
  onStockStatusChange: (status: "REAL_INCOMING" | "IN_STOCK" | "UNAVAILABLE") => void;
}

const STOCK_OPTIONS: { label: string; value: "IN_STOCK" | "UNAVAILABLE" | "REAL_INCOMING" }[] = [
  { label: "Có hàng", value: "IN_STOCK" },
  { label: "Chưa có sẵn", value: "UNAVAILABLE" },
  { label: "Đang về", value: "REAL_INCOMING" },
];

export function StockStatusFilter({ filters, onStockStatusChange }: StockStatusFilterProps) {
  return (
    <RadioGroup
      value={filters.stockStatus || "IN_STOCK"}
      onValueChange={onStockStatusChange as any}
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
            className="text-xs text-primary-600 cursor-pointer group-hover:text-secondary-900"
          >
            {item.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}