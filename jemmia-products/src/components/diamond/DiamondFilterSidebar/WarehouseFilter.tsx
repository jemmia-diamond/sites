import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DiamondFilter } from "../../../types";
import { formatWarehouseName } from "@/lib/utils";

interface Warehouse {
  id: string;
  name: string;
}

interface WarehouseFilterProps {
  filters: DiamondFilter;
  warehouses: Warehouse[];
  onWarehouseToggle: (warehouseId: string) => void;
  disabled?: boolean;
}

export function WarehouseFilter({
  filters,
  warehouses,
  onWarehouseToggle,
  disabled,
}: WarehouseFilterProps) {
  return (
    <div className={`space-y-3 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      {warehouses.map((wh) => (
        <div key={wh.id} className="flex items-center space-x-3 group">
          <Checkbox
            id={wh.id}
            checked={filters.warehouseIds?.includes(wh.id)}
            onCheckedChange={() => onWarehouseToggle(wh.id)}
            disabled={disabled}
            className="h-4 w-4 rounded-none border-primary-300 data-[state=checked]:bg-secondary-900"
          />
          <Label
            htmlFor={wh.id}
            className={`text-xs text-primary-600 ${disabled ? "cursor-not-allowed" : "cursor-pointer group-hover:text-secondary-900"}`}
          >
            {formatWarehouseName(wh.name)}
          </Label>
        </div>
      ))}
    </div>
  );
}
