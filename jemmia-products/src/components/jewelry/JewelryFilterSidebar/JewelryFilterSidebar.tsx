import { useState, useEffect, useRef, useCallback } from "react";
import { JewelryFilter, StockStatusFilter } from "../../../types";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { jewelryService } from "../../../services/jewelryService";
import { FilterSection } from "./FilterSection";
import { ProductTypeFilter } from "./ProductTypeFilter";
import { StockStatusFilter as StockStatusFilterComponent } from "./StockStatusFilter";
import { WarehouseFilter } from "./WarehouseFilter";
import { StoneSizeFilter } from "./StoneSizeFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";

interface JewelryFilterSidebarProps {
  onApply: (filters: JewelryFilter) => void;
  currentFilters?: JewelryFilter;
}

const ALL_WAREHOUSE_IDS = ["1592770", "1582708", "1110168", "1592778", "1593276"];

const STONE_SIZES = ["3.6", "4.0", "4.5", "5.0", "5.4", "6.0", "6.3", "7.0", "7.2", "8.1"];

const WAREHOUSES_LIST = [
  { id: "1582708", name: "Hồ Chí Minh" },
  { id: "1592778", name: "Hà Nội" },
  { id: "1593276", name: "Cần Thơ" },
];

export function JewelryFilterSidebar({ onApply, currentFilters }: JewelryFilterSidebarProps) {
  const initialFilters: JewelryFilter = {
    type: undefined,
    stockStatus: "all",
    warehouseIds: [],
    storageSize1: [],
    salePriceFrom: undefined,
    salePriceTo: undefined,
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
    handleFastFilterChange((prev) => ({ ...prev, type: typeId }));
  };

  const handleStockStatusChange = (status: StockStatusFilter) => {
    handleFastFilterChange((prev) => ({ ...prev, stockStatus: status }));
  };

  const handleWarehouseToggle = (warehouseId: string) => {
    handleFastFilterChange((prev) => {
      const isCurrentlySelected = prev.warehouseIds?.includes(warehouseId);
      return {
        ...prev,
        warehouseIds: isCurrentlySelected
          ? prev.warehouseIds?.filter((i) => i !== warehouseId)
          : [...(prev.warehouseIds || []), warehouseId],
      };
    });
  };

  const handleSizeToggle = (size: string) => {
    handleFastFilterChange((prev) => ({
      ...prev,
      storageSize1: prev.storageSize1?.includes(size) ? [] : [size],
    }));
  };

  const handleMinPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceFrom: value }));
  };

  const handleMaxPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceTo: value }));
  };

  return (
    <aside className="w-80 h-full border-r border-primary-100 bg-white flex flex-col pt-5 overflow-y-auto no-scrollbar">
      <div className="px-8 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-secondary-900">BỘ LỌC NÂNG CAO</h2>
          <p className="text-[10px] text-primary-400 mt-0.5 font-bold uppercase">Quản lý kho & Thiết kế</p>
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