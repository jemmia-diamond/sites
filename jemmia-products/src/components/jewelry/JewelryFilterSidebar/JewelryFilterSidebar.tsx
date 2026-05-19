import { useState, useEffect, useRef, useCallback } from "react";
import { JewelryFilter, StockStatusFilter } from "../../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { jewelryService } from "../../../services/jewelryService";
import { FilterSection } from "./FilterSection";
import { ProductTypeFilter } from "./ProductTypeFilter";
import { StockStatusFilter as StockStatusFilterComponent } from "./StockStatusFilter";
import { WarehouseFilter } from "./WarehouseFilter";
import { StoneSizeFilter } from "./StoneSizeFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { MultiSelectButtonFilter } from "./MultiSelectButtonFilter";
import { X } from "lucide-react";

interface JewelryFilterSidebarProps {
  onApply: (filters: JewelryFilter) => void;
  currentFilters?: JewelryFilter;
}

const ALL_WAREHOUSE_IDS = ["1592770", "1582708", "1110168", "1592778", "1593276"];

const STONE_SIZES = ["3.6", "4.0", "4.5", "5.0", "5.4", "6.0", "6.3", "7.0", "7.2", "8.1"];

const RING_HEAD_TITLES = ["Flower", "Halo", "Other", "Solid", "Solitaire", "Three Stone"];

const RING_BAND_STYLES = [
  "MR - Circle Ring",
  "MR - Hexagon Ring",
  "MR - Squared Ring",
  "MR - Unisex Ring",
  "MR - Watch Ring",
  "WD - Peculia",
  "WD - Twins",
  "WD - Xerox",
  "WR - Cathedral",
  "WR - Chevron",
  "WR - Eternity",
  "WR - Other",
  "WR - Solid",
  "WR - Split",
  "WR - Twist",
  "WR - Wrap"
];

const WAREHOUSES_LIST = [
  { id: "1582708", name: "Hồ Chí Minh", ids: ["1592770", "1582708", "1110168"] },
  { id: "1592778", name: "Hà Nội", ids: ["1592778"] },
  { id: "1593276", name: "Cần Thơ", ids: ["1593276"] },
];

const STOCK_LABELS: Record<string, string> = {
  all: "Tất cả",
  IN_STOCK: "Có hàng",
  OUT_OF_STOCK: "Hết hàng",
};

export function JewelryFilterSidebar({ onApply, currentFilters }: JewelryFilterSidebarProps) {
  const [appliedChips, setAppliedChips] = useState<{ key: string; value: any; label: string }[]>([]);
  const initialFilters: JewelryFilter = {
    type: undefined,
    stockStatus: "all",
    warehouseIds: [],
    storageSize1: [],
    salePriceFrom: undefined,
    salePriceTo: undefined,
    ringHeadStyles: [],
    ringBandStyles: [],
  };

  const [filters, setFilters] = useState<JewelryFilter>(initialFilters);
  const hasAutoSelected = useRef(false);

  useEffect(() => {
    if (currentFilters) {
      setFilters((prev) => ({
        ...prev,
        ...currentFilters,
        salePriceFrom: prev.salePriceFrom !== undefined ? prev.salePriceFrom : currentFilters.salePriceFrom,
        salePriceTo: prev.salePriceTo !== undefined ? prev.salePriceTo : currentFilters.salePriceTo,
      }));

      if (!currentFilters.type && !currentFilters.searchQuery) {
        hasAutoSelected.current = false;
      }
    }
  }, [currentFilters]);

  const applyFilters = useCallback(
    (nextFilters: JewelryFilter) => {
      onApply(nextFilters);
    },
    [onApply]
  );

  const handleFastFilterChange = (updater: (prev: JewelryFilter) => JewelryFilter) => {
    setFilters((prev) => {
      const next = updater(prev);
      setTimeout(() => applyFilters(next), 0);
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    onApply(initialFilters);
    hasAutoSelected.current = false;
  };

  const { data: productTypes, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["product-types"],
    queryFn: jewelryService.getProductTypes,
  });

  const getPrefix = useCallback((typeId: string | undefined) => {
    if (!typeId || !productTypes) return "WR";
    const type = productTypes.find(t => String(t.id) === String(typeId));
    if (!type) return "WR";

    const name = type.name.toLowerCase();
    if (name.includes("nhẫn nam")) return "MR";
    if (name.includes("nhẫn cưới")) return "WD";
    if (name.includes("nhẫn nữ")) return "WR";
    return "WR";
  }, [productTypes]);

  useEffect(() => {
    if (productTypes && productTypes.length > 0 && !hasAutoSelected.current && !filters.type) {
      const sorted = [...productTypes].sort((a, b) => {
        const isANhanNu = a.name.toLowerCase().includes("nhẫn nữ");
        const isBNhanNu = b.name.toLowerCase().includes("nhẫn nữ");
        if (isANhanNu && !isBNhanNu) return -1;
        if (!isANhanNu && isBNhanNu) return 1;
        return 0;
      });

      const firstId = sorted[0].id;
      hasAutoSelected.current = true;

      const next = { ...filters, type: firstId };
      setFilters(next);
      applyFilters(next);
    }
  }, [productTypes, isLoadingTypes, applyFilters, filters.type]);

  const handleTypeChange = (typeId: string) => {
    const newPrefix = getPrefix(typeId);

    handleFastFilterChange((prev) => {
      // Update head styles prefix when type changes
      const updatedHeadStyles = prev.ringHeadStyles?.map(s => {
        const parts = s.split(" - ");
        const title = parts.length > 1 ? parts[1] : parts[0];
        return `${newPrefix} - ${title}`;
      });

      return { 
        ...prev, 
        type: typeId, 
        ringHeadStyles: updatedHeadStyles 
      };
    });
  };

  const handleStockStatusChange = (status: StockStatusFilter) => {
    handleFastFilterChange((prev) => ({ ...prev, stockStatus: status }));
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
      storageSize1: prev.storageSize1?.includes(size) ? [] : [size],
    }));
  };

  const handleRingHeadStyleToggle = (title: string) => {
    const prefix = getPrefix(filters.type);
    const fullStyle = `${prefix} - ${title}`;

    handleFastFilterChange((prev) => {
      const current = prev.ringHeadStyles || [];
      const next = current.includes(fullStyle)
        ? current.filter(s => s !== fullStyle)
        : [...current, fullStyle];
      return { ...prev, ringHeadStyles: next };
    });
  };

  const handleRingBandStyleToggle = (style: string) => {
    handleFastFilterChange((prev) => {
      const current = prev.ringBandStyles || [];
      const next = current.includes(style)
        ? current.filter(s => s !== style)
        : [...current, style];
      return { ...prev, ringBandStyles: next };
    });
  };

  const handleMinPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceFrom: value }));
  };

  const handleMaxPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceTo: value }));
  };

  const buildChips = useCallback(
    (currentFilters: JewelryFilter): { key: string; value: any; label: string }[] => {
      const chips: { key: string; value: any; label: string }[] = [];

      if (currentFilters.stockStatus && currentFilters.stockStatus !== "all") {
        chips.push({
          key: "stockStatus",
          value: currentFilters.stockStatus,
          label: STOCK_LABELS[currentFilters.stockStatus] || currentFilters.stockStatus,
        });
      }
      if (currentFilters.warehouseIds && currentFilters.warehouseIds.length > 0) {
        const selectedAreaNames = WAREHOUSES_LIST.filter((area) =>
          area.ids.some((id) => currentFilters.warehouseIds?.includes(id))
        ).map((area) => area.name);

        if (selectedAreaNames.length > 0) {
          chips.push({
            key: "warehouseIds",
            value: currentFilters.warehouseIds,
            label: selectedAreaNames.join(", "),
          });
        }
      }
      if (currentFilters.storageSize1 && currentFilters.storageSize1.length > 0) {
        chips.push({
          key: "storageSize1",
          value: currentFilters.storageSize1,
          label: currentFilters.storageSize1.map((s: string) => `${s} ly`).join(", "),
        });
      }

      if (currentFilters.ringHeadStyles && currentFilters.ringHeadStyles.length > 0) {
        chips.push({
          key: "ringHeadStyles",
          value: currentFilters.ringHeadStyles,
          label: currentFilters.ringHeadStyles.map(s => {
            const parts = s.split(" - ");
            return parts.length > 1 ? parts[1] : parts[0];
          }).join(", "),
        });
      }

      if (currentFilters.ringBandStyles && currentFilters.ringBandStyles.length > 0) {
        chips.push({
          key: "ringBandStyles",
          value: currentFilters.ringBandStyles,
          label: currentFilters.ringBandStyles.map(s => {
            const parts = s.split(" - ");
            return parts.length > 1 ? parts[1] : parts[0];
          }).join(", "),
        });
      }

      if (currentFilters.salePriceFrom || currentFilters.salePriceTo) {
        const from = currentFilters.salePriceFrom ? `${currentFilters.salePriceFrom.toLocaleString()} triệu` : "";
        const to = currentFilters.salePriceTo ? `${currentFilters.salePriceTo.toLocaleString()} triệu` : "";
        chips.push({
          key: "salePrice",
          value: { from: currentFilters.salePriceFrom, to: currentFilters.salePriceTo },
          label: from && to ? `${from} - ${to}` : from || to,
        });
      }

      return chips;
    },
    [productTypes]
  );

  useEffect(() => {
    const chips = buildChips(filters);
    setAppliedChips(chips);
  }, [filters, buildChips]);

  const removeChip = (key: string) => {
    const getResetValue = (k: string): any => {
      if (k === "salePrice") return undefined;
      if (k === "stockStatus") return "all";
      if (k === "warehouseIds" || k === "storageSize1" || k === "ringHeadStyles" || k === "ringBandStyles") return [];
      return undefined;
    };

    if (key === "salePrice") {
      setFilters((prev) => ({ ...prev, salePriceFrom: undefined, salePriceTo: undefined }));
      applyFilters({ ...filters, salePriceFrom: undefined, salePriceTo: undefined });
    } else {
      setFilters((prev) => ({ ...prev, [key]: getResetValue(key) }));
      applyFilters({ ...filters, [key]: getResetValue(key) });
    }
  };

  const prefix = getPrefix(filters.type);
  const selectedType = productTypes?.find(t => String(t.id) === String(filters.type));
  const isRingType = selectedType?.name.toLowerCase().includes("nhẫn") || false;

  return (
    <aside className="w-80 h-full border-r border-primary-100 bg-white flex flex-col pt-5 overflow-y-auto no-scrollbar">
      <div className="px-8 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-secondary-900">BỘ LỌC</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-auto p-0 text-[9px] font-black text-primary-400 hover:text-secondary-900 hover:bg-transparent uppercase tracking-wider"
        >
          Xóa bộ lọc
        </Button>
      </div>

      {appliedChips.length > 0 && (
        <div className="px-8 mb-4 flex flex-wrap gap-2">
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

      <div className="flex-1 px-8 space-y-9 pb-20">
        <FilterSection label="Loại Trang Sức">
          <ProductTypeFilter
            productTypes={productTypes}
            isLoadingTypes={isLoadingTypes}
            filters={filters}
            onTypeChange={handleTypeChange}
          />
        </FilterSection>

        <FilterSection label="Tồn Kho">
          <StockStatusFilterComponent
            filters={filters}
            onStockStatusChange={handleStockStatusChange}
          />
        </FilterSection>

        <FilterSection label="Khu Vực">
          <WarehouseFilter
            filters={filters}
            warehouses={WAREHOUSES_LIST}
            onWarehouseToggle={handleWarehouseToggle}
          />
        </FilterSection>

        <FilterSection label="Kích Thước Viên Chủ">
          <StoneSizeFilter
            filters={filters}
            stoneSizes={STONE_SIZES}
            onSizeToggle={handleSizeToggle}
          />
        </FilterSection>

        {isRingType && prefix !== "MR" && prefix !== "WD" && (
          <FilterSection label="Kiểu đầu nhẫn">
            <MultiSelectButtonFilter
              options={RING_HEAD_TITLES}
              selectedValues={filters.ringHeadStyles?.map(s => {
                const parts = s.split(" - ");
                return parts.length > 1 ? parts[1] : parts[0];
              }) || []}
              onToggle={handleRingHeadStyleToggle}
            />
          </FilterSection>
        )}

        {isRingType && (
          <FilterSection label="Kiểu thân nhẫn">
            <MultiSelectButtonFilter
              options={RING_BAND_STYLES.filter(s => s.startsWith(getPrefix(filters.type)))}
              selectedValues={filters.ringBandStyles || []}
              onToggle={handleRingBandStyleToggle}
              columns={1}
              labelModifier={(v) => {
                const parts = v.split(" - ");
                return parts.length > 1 ? parts[1] : parts[0];
              }}
            />
          </FilterSection>
        )}

        <FilterSection label="KHOẢNG GIÁ">
          <PriceRangeFilter
            filters={filters}
            onMinPriceChange={handleMinPriceChange}
            onMaxPriceChange={handleMaxPriceChange}
            onApply={() => applyFilters(filters)}
          />
        </FilterSection>
      </div>
    </aside>
  );
}