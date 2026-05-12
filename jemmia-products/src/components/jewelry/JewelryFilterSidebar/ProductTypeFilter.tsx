import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { JewelryFilter } from "../../../types";
import { cn } from "@/lib/utils";
import { ProductType } from "../../../types";

interface ProductTypeFilterProps {
  productTypes: ProductType[] | undefined;
  isLoadingTypes: boolean;
  filters: JewelryFilter;
  onTypeChange: (typeId: string) => void;
}

export function ProductTypeFilter({
  productTypes,
  isLoadingTypes,
  filters,
  onTypeChange,
}: ProductTypeFilterProps) {
  const sortedTypes = productTypes?.slice().sort((a, b) => {
    const isANhanNu = a.name.toLowerCase().includes("nhẫn nữ");
    const isBNhanNu = b.name.toLowerCase().includes("nhẫn nữ");
    if (isANhanNu && !isBNhanNu) return -1;
    if (!isANhanNu && isBNhanNu) return 1;
    return 0;
  });

  return (
    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
      {isLoadingTypes ? (
        Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full rounded-none" />
        ))
      ) : (
        <RadioGroup
          value={filters.type || ""}
          onValueChange={onTypeChange}
          className="space-y-2"
        >
          {sortedTypes?.map((cat) => {
            const isDisabled = cat.name === "Nhẫn Cưới";
            return (
              <div key={cat.id} className="flex items-center space-x-3 group">
                <RadioGroupItem
                  value={cat.id}
                  id={cat.id}
                  disabled={isDisabled}
                  className="h-4 w-4 border-primary-300 text-secondary-900 disabled:opacity-30 disabled:cursor-not-allowed"
                />
                <Label
                  htmlFor={cat.id}
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-tight transition-colors",
                    isDisabled
                      ? "text-primary-200 cursor-not-allowed"
                      : "text-primary-600 group-hover:text-secondary-900 cursor-pointer"
                  )}
                >
                  {cat.name}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      )}
    </div>
  );
}