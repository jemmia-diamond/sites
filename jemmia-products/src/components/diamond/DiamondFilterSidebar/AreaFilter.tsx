import { cn } from "@/lib/utils";
import { DiamondFilter } from "../../../types";

interface AreaOption {
  id: string;
  label: string;
  ids: string[];
}

interface AreaFilterProps {
  selectedAreas: string[];
  filters: DiamondFilter;
  areaOptions: AreaOption[];
  onAreaToggle: (optionId: string) => void;
}

export function AreaFilter({
  selectedAreas,
  filters,
  areaOptions,
  onAreaToggle,
}: AreaFilterProps) {
  return (
    <div className="space-y-3">
      {areaOptions.map((opt) => {
        const isActive = selectedAreas.includes(opt.id);
        return (
          <div key={opt.id} className="flex items-center space-x-3 group">
            <button
              onClick={() => onAreaToggle(opt.id)}
              className={cn(
                "h-4 w-4 rounded-none border border-primary-300 transition-colors flex items-center justify-center",
                isActive ? "bg-secondary-900 border-secondary-900" : "bg-white"
              )}
            >
              {isActive && <div className="h-2 w-2 bg-white" />}
            </button>
            <span
              onClick={() => onAreaToggle(opt.id)}
              className="text-[11px] text-primary-600 font-bold cursor-pointer group-hover:text-secondary-900 uppercase tracking-tight"
            >
              {opt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}