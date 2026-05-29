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
import { Filter, X } from "lucide-react";

interface DiamondFilterSidebarProps {
  onApply: (filters: DiamondFilter) => void;
  currentFilters?: DiamondFilter;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onChipsChange?: (chips: { key: string; value: any; label: string }[]) => void;
  isCollapsed?: boolean;
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

  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);
    }
  }, [currentFilters]);

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
      setTimeout(() => applyFilters(next), 0);
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
    onChipsChange?.(chips);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, buildChips]);

  const removeChip = (key: string) => {
    if (key === "salePrice") {
      const next = {
        ...filters,
        salePriceFrom: undefined,
        salePriceTo: undefined,
      };
      setFilters(next);
      applyFilters(next);
    } else if (key === "carat") {
      const next = { ...filters, caratFrom: undefined, caratTo: undefined };
      setFilters(next);
      applyFilters(next);
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
      const next = { ...filters, [key]: getResetValue(key) };
      setFilters(next);
      applyFilters(next);
    }
  };

  return (
    <div className="flex h-full">
      {/* GIAO DIỆN KHI BỊ ẨN (CHỈ HIỂN THỊ TRÊN DESKTOP) */}
      {isCollapsed && (
        <aside className="hidden lg:flex w-16 h-full border-r border-primary-100 bg-white flex-col items-center py-6 justify-between sticky top-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-auto p-2 writing-mode-vertical text-[11px] font-black text-secondary-900 hover:bg-primary-50 tracking-widest uppercase transition-all duration-300 flex items-center gap-2"
            style={{ writingMode: "vertical-lr" }}
          >
            <Filter size={16} />
          </Button>
        </aside>
      )}

      <aside
        className={`w-full lg:w-80 h-full border-r border-primary-100 bg-white flex flex-col overflow-y-auto no-scrollbar transition-all duration-300 ${
          isCollapsed ? "lg:hidden" : "flex"
        }`}
      >
        <div className="px-6 lg:px-8 mb-6 flex items-center justify-between sticky top-0 bg-white z-10 py-4 border-b border-primary-50">
          <h2 className="text-sm font-bold tracking-widest text-secondary-900 uppercase">
            Bộ lọc
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-auto p-0 text-[9px] font-black text-primary-400 hover:text-secondary-900 hover:bg-transparent tracking-wider uppercase"
            >
              Xóa bộ lọc
            </Button>
            {onToggleCollapse && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleCollapse}
                className="hidden lg:inline-flex h-8 px-3 text-[10px] font-bold uppercase tracking-wider border-primary-200"
              >
                Ẩn bộ lọc
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 lg:hidden -mr-2 text-primary-900"
              >
                <X size={18} />
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 px-6 lg:px-8 space-y-9 pb-6">
          {/* ... Giữ nguyên toàn bộ các thẻ <FilterSection> bên trong ... */}
          {appliedChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {appliedChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant="default"
                  className="flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 bg-primary-100 text-primary-900 border-primary-200 hover:bg-primary-100 hover:text-primary-900"
                >
                  <span className="text-xs font-medium">{chip.label}</span>
                  <button
                    onClick={() => removeChip(chip.key)}
                    className="ml-1 rounded-full p-0.5 hover:bg-primary-200/50 cursor-pointer transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

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

        <div className="lg:hidden px-6 py-3 sticky bottom-0 bg-white border-t border-primary-100 z-10">
          <Button
            onClick={onClose}
            className="w-full bg-secondary-900 hover:bg-secondary-900 text-white font-bold"
          >
            Áp dụng
          </Button>
        </div>
      </aside>
    </div>
  );
}
