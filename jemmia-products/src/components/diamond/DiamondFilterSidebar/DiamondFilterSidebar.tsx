import { useState, useCallback, useEffect } from "react";
import { DiamondFilter } from "../../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterSection } from "./FilterSection";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { CaratRangeFilter } from "./CaratRangeFilter";
import { SizeFilter } from "./SizeFilter";
import { StockStatusFilter } from "./StockStatusFilter";
import { WarehouseFilter } from "./WarehouseFilter";
import { MultiSelectButtonFilter } from "./MultiSelectButtonFilter";
import { Filter, X, ChevronLeft, ChevronRight } from "lucide-react";

interface DiamondFilterSidebarProps {
  onApply: (filters: DiamondFilter) => void;
  currentFilters?: DiamondFilter;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onChipsChange?: (chips: { key: string; value: any; label: string }[]) => void;
  isCollapsed?: boolean;
  isOpen?: boolean;
}

const SIZES = [
  { label: "3.6 ly", value: 3.6 },
  { label: "4 ly", value: 4 },
  { label: "4.5 ly", value: 4.5 },
  { label: "5 ly", value: 5 },
  { label: "5.4 ly", value: 5.4 },
  { label: "6 ly", value: 6 },
  { label: "6.3 ly < 1C", value: "6.3_<1C" },
  { label: "6.3 ly >= 1C", value: "6.3_>=1C" },
  { label: "7 ly", value: 7 },
  { label: "7.2 ly", value: 7.2 },
  { label: "8.1 ly", value: 8.1 },
];

const SHAPES = ["Round", "Heart", "Oval", "Pear", "Radiant", "Emerald"];
const COLORS = ["D", "E", "F", "G", "H", "I"];
const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2"];
const FLUORESCENCE = ["None", "Faint", "Medium", "Strong", "Very Strong"];

const WAREHOUSES_LIST = [
  {
    id: "1582708",
    name: "Hồ Chí Minh",
    ids: ["1592770", "1582708", "1110168"],
  },
  { id: "1592778", name: "Hà Nội", ids: ["1592778"] },
  { id: "1593276", name: "Cần Thơ", ids: ["1593276"] },
];

const STOCK_LABELS: Record<string, string> = {
  REAL_INCOMING: "Đang về",
  IN_STOCK: "Có hàng",
};

export function DiamondFilterSidebar({
  onApply,
  currentFilters,
  onClose,
  onToggleCollapse,
  onChipsChange,
  isCollapsed,
  isOpen,
}: DiamondFilterSidebarProps) {
  const [appliedChips, setAppliedChips] = useState<
    { key: string; value: any; label: string }[]
  >([]);
  const initialFilters: DiamondFilter = {
    salePriceFrom: undefined,
    salePriceTo: undefined,
    caratFrom: undefined,
    caratTo: undefined,
    edgeSizes: [],
    warehouseIds: [],
    stockStatus: "IN_STOCK",
    shapes: [],
    color: [],
    clarity: [],
    fluorescence: [],
  };

  const [filters, setFilters] = useState<DiamondFilter>(initialFilters);

  const applyFilters = useCallback(
    (nextFilters: DiamondFilter) => {
      onApply(nextFilters);
    },
    [onApply],
  );

  const handleFastFilterChange = (
    updater: (prev: DiamondFilter) => DiamondFilter,
  ) => {
    setFilters((prev) => {
      const next = updater(prev);
      if (window.innerWidth >= 1024) {
        setTimeout(() => applyFilters(next), 0);
      }
      return next;
    });
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

  const toggleMultiSelect = (key: keyof DiamondFilter, value: any) => {
    handleFastFilterChange((prev) => {
      const current = (prev[key] as any[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleClear = () => {
    setFilters(initialFilters);
    onApply(initialFilters);
  };

  const handleMinPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceFrom: value }));
  };

  const handleMaxPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceTo: value }));
  };

  const handleMinCaratChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, caratFrom: value }));
  };

  const handleMaxCaratChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, caratTo: value }));
  };

  const handleStockStatusChange = (status: "REAL_INCOMING" | "IN_STOCK") => {
    handleFastFilterChange((prev) => ({
      ...prev,
      stockStatus: status,
      warehouseIds: status === "REAL_INCOMING" ? [] : prev.warehouseIds,
    }));
  };

  const buildChips = useCallback(
    (
      currentFilters: DiamondFilter,
    ): { key: string; value: any; label: string }[] => {
      const chips: { key: string; value: any; label: string }[] = [];

      if (
        currentFilters.stockStatus &&
        currentFilters.stockStatus !== "IN_STOCK"
      ) {
        chips.push({
          key: "stockStatus",
          value: currentFilters.stockStatus,
          label:
            STOCK_LABELS[currentFilters.stockStatus] ||
            currentFilters.stockStatus,
        });
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

      if (currentFilters.edgeSizes && currentFilters.edgeSizes.length > 0) {
        chips.push({
          key: "edgeSizes",
          value: currentFilters.edgeSizes,
          label: currentFilters.edgeSizes
            .map((s) => {
              if (s === "6.3_<1C") return "6.3 ly < 1C";
              if (s === "6.3_>=1C") return "6.3 ly >= 1C";
              return `${s} ly`;
            })
            .join(", "),
        });
      }

      if (currentFilters.shapes && currentFilters.shapes.length > 0) {
        chips.push({
          key: "shapes",
          value: currentFilters.shapes,
          label: `${currentFilters.shapes.join(", ")}`,
        });
      }

      if (currentFilters.color && currentFilters.color.length > 0) {
        chips.push({
          key: "color",
          value: currentFilters.color,
          label: `${currentFilters.color.join(", ")}`,
        });
      }

      if (currentFilters.clarity && currentFilters.clarity.length > 0) {
        chips.push({
          key: "clarity",
          value: currentFilters.clarity,
          label: `${currentFilters.clarity.join(", ")}`,
        });
      }

      if (
        currentFilters.fluorescence &&
        currentFilters.fluorescence.length > 0
      ) {
        chips.push({
          key: "fluorescence",
          value: currentFilters.fluorescence,
          label: `${currentFilters.fluorescence.join(", ")}`,
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

      if (currentFilters.caratFrom || currentFilters.caratTo) {
        const from = currentFilters.caratFrom
          ? `${currentFilters.caratFrom} carat`
          : "";
        const to = currentFilters.caratTo
          ? `${currentFilters.caratTo} carat`
          : "";
        chips.push({
          key: "carat",
          value: { from: currentFilters.caratFrom, to: currentFilters.caratTo },
          label: from && to ? `${from} - ${to}` : from || to,
        });
      }

      return chips;
    },
    [],
  );

  useEffect(() => {
    const chips = buildChips(filters);
    setAppliedChips(chips);
    if (window.innerWidth >= 1024) {
      onChipsChange?.(chips);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, buildChips]);

  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);

      // On mobile, update the parent's chips only when currentFilters changes (which means filters were applied)!
      if (window.innerWidth < 1024) {
        const chips = buildChips(currentFilters);
        onChipsChange?.(chips);
      }
    }
  }, [currentFilters, buildChips, onChipsChange]);

  useEffect(() => {
    if (!isOpen && window.innerWidth < 1024 && currentFilters) {
      setFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const removeChip = (key: string) => {
    let next;
    if (key === "salePrice") {
      next = {
        ...filters,
        salePriceFrom: undefined,
        salePriceTo: undefined,
      };
    } else if (key === "carat") {
      next = { ...filters, caratFrom: undefined, caratTo: undefined };
    } else {
      const getResetValue = (k: string): any => {
        if (k === "stockStatus") return "IN_STOCK";
        if (
          [
            "edgeSizes",
            "shapes",
            "color",
            "clarity",
            "fluorescence",
            "warehouseIds",
          ].includes(k)
        )
          return [];
        return undefined;
      };
      next = { ...filters, [key]: getResetValue(key) };
    }

    setFilters(next);
    if (window.innerWidth >= 1024) {
      applyFilters(next);
    }
  };

  return (
    <div className="flex h-full">
      {/* GIAO DIỆN KHI BỊ ẨN (CHỈ HIỂN THỊ TRÊN DESKTOP) */}
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
        className={`w-full xl:w-80 h-full border-r border-primary-100 bg-white flex flex-col overflow-y-auto no-scrollbar transition-all duration-300 ${
          isCollapsed ? "xl:hidden" : "flex"
        }`}
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
                  onClick={handleClear}
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
              filters={filters}
              onMinPriceChange={handleMinPriceChange}
              onMaxPriceChange={handleMaxPriceChange}
              onApply={() => applyFilters(filters)}
            />
          </FilterSection>

          <FilterSection label="Hình dạng">
            <MultiSelectButtonFilter
              label="Shape"
              options={SHAPES}
              filters={filters}
              filterKey="shapes"
              onToggle={(value) => toggleMultiSelect("shapes", value)}
              variant="grid"
              cols={3}
            />
          </FilterSection>

          <FilterSection label="Nước màu">
            <MultiSelectButtonFilter
              label="Color"
              options={COLORS}
              filters={filters}
              filterKey="color"
              onToggle={(value) => toggleMultiSelect("color", value)}
              variant="grid"
            />
          </FilterSection>

          <FilterSection label="Độ sạch">
            <MultiSelectButtonFilter
              label="Clarity"
              options={CLARITIES}
              filters={filters}
              filterKey="clarity"
              onToggle={(value) => toggleMultiSelect("clarity", value)}
              variant="grid"
              cols={3}
            />
          </FilterSection>

          <FilterSection label="Huỳnh quang">
            <MultiSelectButtonFilter
              label="Fluorescence"
              options={FLUORESCENCE}
              filters={filters}
              filterKey="fluorescence"
              onToggle={(value) => toggleMultiSelect("fluorescence", value)}
              variant="grid"
              cols={3}
            />
          </FilterSection>

          <FilterSection label="Kích thước">
            <SizeFilter
              filters={filters}
              sizes={SIZES}
              onSizeToggle={(value) => toggleMultiSelect("edgeSizes", value)}
            />
          </FilterSection>

          <FilterSection label="Tồn Kho">
            <StockStatusFilter
              filters={filters}
              onStockStatusChange={handleStockStatusChange}
            />
          </FilterSection>

          <FilterSection label="Khu vực">
            <WarehouseFilter
              filters={filters}
              warehouses={WAREHOUSES_LIST}
              onWarehouseToggle={handleWarehouseToggle}
              disabled={filters.stockStatus === "REAL_INCOMING"}
            />
          </FilterSection>

          <FilterSection label="TRỌNG LƯỢNG (CARAT)">
            <CaratRangeFilter
              filters={filters}
              onMinCaratChange={handleMinCaratChange}
              onMaxCaratChange={handleMaxCaratChange}
              onApply={() => applyFilters(filters)}
            />
          </FilterSection>
        </div>

        <div className="xl:hidden px-6 py-3 sticky bottom-0 bg-white border-t border-primary-100 z-10">
          <Button
            onClick={() => {
              applyFilters(filters);
              onClose();
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
