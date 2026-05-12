import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { JewelryFilter } from "../../../types";

interface Warehouse {
  id: string;
  name: string;
}

interface WarehouseFilterProps {
  filters: JewelryFilter;
  warehouses: Warehouse[];
  onWarehouseToggle: (warehouseId: string) => void;
}

export function WarehouseFilter({
  filters,
  warehouses,
  onWarehouseToggle,
}: WarehouseFilterProps) {
  return (
    <div className="space-y-3">
      {warehouses.map((wh) => (
        <div key={wh.id} className="flex items-center space-x-3 group">
          <Checkbox
            id={wh.id}
            checked={filters.warehouseIds?.includes(wh.id)}
            onCheckedChange={() => onWarehouseToggle(wh.id)}
            className="h-4 w-4 rounded-none border-primary-300 data-[state=checked]:bg-secondary-900"
          />
          <Label
            htmlFor={wh.id}
            className="text-[11px] text-primary-600 font-bold cursor-pointer group-hover:text-secondary-900 uppercase"
          >
            {wh.name}
          </Label>
        </div>
      ))}
    </div>
  );
}