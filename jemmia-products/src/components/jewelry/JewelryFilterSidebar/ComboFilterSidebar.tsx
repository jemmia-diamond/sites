import { useState, useEffect, useRef, useCallback } from "react";
import { ComboFilter } from "../../../services/comboService";
import { JewelryFilter } from "../../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { jewelryService } from "../../../services/jewelryService";
import { FilterSection } from "./FilterSection";
import { ProductTypeFilter } from "./ProductTypeFilter";
import { WarehouseFilter } from "./WarehouseFilter";
import { StoneSizeFilter } from "./StoneSizeFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { WAREHOUSES_LIST } from "@/src/config";

interface ComboFilterSidebarProps {
  onApply: (filters: Omit<ComboFilter, "page">) => void;
  currentFilters?: Omit<ComboFilter, "page">;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onChipsChange?: (chips: { key: string; value: any; label: string }[]) => void;
  isCollapsed?: boolean;
  isOpen?: boolean;
}

const STONE_SIZES = [
  "3.6",
  "4.0",
  "4.5",
  "5.0",
  "5.4",
  "6.0",
  "6.3",
  "7.0",
  "7.2",
  "8.1",
];

export function ComboFilterSidebar({
  onApply,
  currentFilters,
  onClose,
  onToggleCollapse,
  onChipsChange,
  isCollapsed,
  isOpen,
}: ComboFilterSidebarProps) {
  const [appliedChips, setAppliedChips] = useState<
    { key: string; value: any; label: string }[]
  >([]);
  const initialFilters: Omit<ComboFilter, "page"> = {
    type: undefined,
    warehouseIds: [],
    storageSize: [],
    salePriceFrom: undefined,
    salePriceTo: undefined,
  };

  const [filters, setFilters] = useState<Omit<ComboFilter, "page" | "limit">>(initialFilters);

  const applyFilters = useCallback(
    (nextFilters: Omit<ComboFilter, "page">) => {
      onApply(nextFilters);
    },
    [onApply],
  );

  const handleFastFilterChange = (
    updater: (prev: Omit<ComboFilter, "page">) => Omit<ComboFilter, "page">,
  ) => {
    setFilters((prev) => {
      const next = updater(prev);
      if (window.innerWidth >= 1280) {
        setTimeout(() => applyFilters(next), 0);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    onApply(initialFilters);
  };

  const { data: productTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["product-types"],
    queryFn: jewelryService.getProductTypes,
  });

  // Filter types: only Nhẫn nam, Nhẫn Nữ, Bông Tai, Mặt dây chuyền
  const allowedCategories = ["nhẫn nam", "nhẫn nữ", "bông tai", "mặt dây"];
  const filteredProductTypes = productTypes?.filter((type) => {
    const name = type.name.toLowerCase();
    if (name.includes("nguyên chiếc")) {
      return false;
    }
    if (name.includes("nhẫn cưới") || name.includes("nhẫn cặp")) {
      return false;
    }
    return allowedCategories.some((cat) => name.includes(cat));
  });

  const handleTypeChange = (typeId: string) => {
    handleFastFilterChange((prev) => ({
      ...prev,
      type: typeId === prev.type ? undefined : typeId, // Toggle type if clicked again
    }));
  };

  const handleWarehouseToggle = (areaId: string) => {
    const area = WAREHOUSES_LIST.find((a) => a.id === areaId);
    if (!area) return;

    handleFastFilterChange((prev) => {
      const currentIds = prev.warehouseIds || [];
      const hasAll = area.ids.every((id) => currentIds.includes(id));

      let nextIds;
      if (hasAll) {
        nextIds = currentIds.filter((id) => !area.ids.includes(id));
      } else {
        const idsToAdd = area.ids.filter((id) => !currentIds.includes(id));
        nextIds = [...currentIds, ...idsToAdd];
      }
      return { ...prev, warehouseIds: nextIds };
    });
  };

  const handleSizeToggle = (size: string) => {
    handleFastFilterChange((prev) => ({
      ...prev,
      storageSize: prev.storageSize?.includes(size)
        ? prev.storageSize.filter((s) => s !== size)
        : [...(prev.storageSize || []), size],
    }));
  };

  const handleMinPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceFrom: value }));
  };

  const handleMaxPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceTo: value }));
  };

  const buildChips = useCallback(
    (
      currentFilters: Omit<ComboFilter, "page">,
    ): { key: string; value: any; label: string }[] => {
      const chips: { key: string; value: any; label: string }[] = [];

      if (currentFilters.type && productTypes) {
        const typeName = productTypes.find((t) => String(t.id) === String(currentFilters.type))?.name;
        if (typeName) {
          const cleanTypeName = typeName.replace(/\s*nguyên chiếc/gi, "").trim();
          const lower = cleanTypeName.toLowerCase();
          let formattedName = cleanTypeName.charAt(0).toUpperCase() + cleanTypeName.slice(1);
          if (lower === "nhẫn nam") formattedName = "Nhẫn Nam";
          else if (lower === "nhẫn nữ") formattedName = "Nhẫn Nữ";
          else if (lower === "bông tai") formattedName = "Bông Tai";
          else if (lower === "mặt dây chuyền" || lower === "mặt dây") formattedName = "Mặt Dây Chuyền";

          chips.push({
            key: "type",
            value: currentFilters.type,
            label: formattedName,
          });
        }
      }

      if (
        currentFilters.warehouseIds &&
        currentFilters.warehouseIds.length > 0
      ) {
        const selectedAreaNames = WAREHOUSES_LIST.filter((area) =>
          area.ids.some((id) => currentFilters.warehouseIds?.includes(id)),
        ).map((area) => area.name);

        if (selectedAreaNames.length > 0) {
          chips.push({
            key: "warehouseIds",
            value: currentFilters.warehouseIds,
            label: selectedAreaNames.join(", "),
          });
        }
      }
      if (
        currentFilters.storageSize &&
        currentFilters.storageSize.length > 0
      ) {
        chips.push({
          key: "storageSize",
          value: currentFilters.storageSize,
          label: currentFilters.storageSize
            .map((s: string) => `${s} ly`)
            .join(", "),
        });
      }

      if (currentFilters.salePriceFrom || currentFilters.salePriceTo) {
        const from = currentFilters.salePriceFrom
          ? `${currentFilters.salePriceFrom.toLocaleString()} triệu`
          : "";
        const to = currentFilters.salePriceTo
          ? `${currentFilters.salePriceTo.toLocaleString()} triệu`
          : "";
        chips.push({
          key: "salePrice",
          value: {
            from: currentFilters.salePriceFrom,
            to: currentFilters.salePriceTo,
          },
          label: from && to ? `${from} - ${to}` : from || to,
        });
      }

      return chips;
    },
    [productTypes],
  );

  useEffect(() => {
    if (window.innerWidth >= 1280) {
      const chips = buildChips(currentFilters || filters);
      setAppliedChips(chips);
      onChipsChange?.(chips);
    }
  }, [currentFilters, filters, buildChips, onChipsChange]);

  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);
      if (window.innerWidth < 1280) {
        const chips = buildChips(currentFilters);
        setAppliedChips(chips);
        onChipsChange?.(chips);
      }
    }
  }, [currentFilters, buildChips, onChipsChange]);

  useEffect(() => {
    if (!isOpen && window.innerWidth < 1280 && currentFilters) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const removeChip = (key: string) => {
    const getResetValue = (k: string): any => {
      if (k === "salePrice") return undefined;
      if (
        k === "warehouseIds" ||
        k === "storageSize"
      )
        return [];
      return undefined;
    };

    let next;
    if (key === "salePrice") {
      next = {
        ...filters,
        salePriceFrom: undefined,
        salePriceTo: undefined,
      };
    } else {
      next = { ...filters, [key]: getResetValue(key) };
    }

    setFilters(next);
    if (window.innerWidth >= 1280) {
      applyFilters(next);
    }
  };

  return (
    <div className="flex h-full">
      {isCollapsed && (
        <aside className="hidden xl:flex w-16 h-full border-r border-primary-100 bg-white flex-col items-center sticky top-0 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleCollapse}
            className="h-9 w-9 rounded-full border-primary-200 hover:bg-primary-50 flex items-center justify-center cursor-pointer shadow-sm text-secondary-900 transition-all duration-300 mt-4"
            title="Hiển thị bộ lọc"
          >
            <ChevronRight size={18} />
          </Button>
        </aside>
      )}

      <aside
        className={`w-full xl:w-80 h-full border-r border-primary-100 bg-white flex flex-col overflow-y-auto no-scrollbar ${isCollapsed ? "xl:hidden" : "flex"}`}
      >
        {/* Sticky Header & Active Chips Block */}
        <div className="sticky top-0 bg-white z-30 border-b border-primary-50 shrink-0">
          <div className="px-6 xl:px-8 flex items-center justify-between py-4">
            <h2 className="text-sm font-bold tracking-widest text-secondary-900 uppercase">
              Bộ lọc
            </h2>
            <div className="flex items-center gap-2">
              {onToggleCollapse && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onToggleCollapse}
                  className="hidden xl:inline-flex h-8 w-8 text-secondary-900 border-primary-200 hover:bg-primary-50 cursor-pointer rounded-full items-center justify-center"
                  title="Ẩn bộ lọc"
                >
                  <ChevronLeft size={16} />
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 xl:hidden -mr-2 text-primary-900 cursor-pointer rounded-full items-center justify-center"
                >
                  <X size={18} />
                </Button>
              )}
            </div>
          </div>

          {/* Active Chips & Clear Filters Block inside the same sticky container */}
          {appliedChips.length > 0 && (
            <div className="px-6 xl:px-8 pb-4 flex flex-col gap-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="clear-filters-btn"
                >
                  Xóa bộ lọc
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[88px] overflow-y-auto pr-1 no-scrollbar">
                {appliedChips.map((chip) => (
                  <Badge
                    key={chip.key}
                    variant="secondary"
                    className="active-chip-badge"
                  >
                    <span>{chip.label}</span>
                    <button
                      onClick={() => removeChip(chip.key)}
                      className="ml-1 rounded-full p-0.5 hover:bg-primary-200/50 cursor-pointer transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 px-6 xl:px-8 space-y-9 py-6">
          <FilterSection label="KHOẢNG GIÁ">
            <PriceRangeFilter
              filters={filters as JewelryFilter}
              onMinPriceChange={handleMinPriceChange}
              onMaxPriceChange={handleMaxPriceChange}
              onApply={() => applyFilters(filters)}
            />
          </FilterSection>

          <FilterSection label="Loại sản phẩm">
            <ProductTypeFilter
              productTypes={filteredProductTypes}
              isLoadingTypes={isLoadingTypes}
              filters={filters as JewelryFilter}
              onTypeChange={handleTypeChange}
            />
          </FilterSection>

          <FilterSection label="Khu Vực">
            <WarehouseFilter
              filters={filters as JewelryFilter}
              warehouses={WAREHOUSES_LIST}
              onWarehouseToggle={handleWarehouseToggle}
            />
          </FilterSection>

          <FilterSection label="Kích Thước Viên Chủ">
            <StoneSizeFilter
              filters={{ ...filters, storageSize1: filters.storageSize } as any}
              stoneSizes={STONE_SIZES}
              onSizeToggle={handleSizeToggle}
            />
          </FilterSection>
        </div>

        <div className="xl:hidden px-6 py-3 sticky bottom-0 bg-white border-t border-primary-100 z-10">
          <Button
            onClick={() => {
              applyFilters(filters);
              const chips = buildChips(filters);
              setAppliedChips(chips);
              onChipsChange?.(chips);
              onClose?.();
            }}
            className="w-full bg-secondary-900 hover:bg-secondary-900 text-white font-bold"
          >
            Áp dụng
          </Button>
        </div>
      </aside>
    </div>
  );
}
