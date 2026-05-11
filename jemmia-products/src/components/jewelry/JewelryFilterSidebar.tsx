
import { useState, useEffect, useRef, useCallback } from "react";
import { JewelryFilter, StockStatusFilter } from "../../types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { jewelryService } from "../../services/jewelryService";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

interface JewelryFilterSidebarProps {
  onApply: (filters: JewelryFilter) => void;
  currentFilters?: JewelryFilter;
}

export function JewelryFilterSidebar({ onApply, currentFilters }: JewelryFilterSidebarProps) {
  const ALL_WAREHOUSE_IDS = ["1592770", "1582708", "1110168", "1592778", "1593276"];

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

  // Sync internal state with external filters if needed (e.g. on reset)
  useEffect(() => {
    if (currentFilters) {
      setFilters(prev => ({
        ...prev,
        ...currentFilters,
        salePriceFrom: prev.salePriceFrom !== undefined ? prev.salePriceFrom : currentFilters.salePriceFrom,
        salePriceTo: prev.salePriceTo !== undefined ? prev.salePriceTo : currentFilters.salePriceTo,
      }));
    }
  }, [currentFilters]);

  const applyFilters = useCallback((nextFilters: JewelryFilter) => {
    onApply(nextFilters);
  }, [onApply]);

  const handleFastFilterChange = (updater: (prev: JewelryFilter) => JewelryFilter) => {
    setFilters(prev => {
      const next = updater(prev);
      // Execute apply outside of the state update to ensure it's reliable
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

  // Aggressive Auto-select first type on load
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

  const warehousesList = [
    { id: "1582708", name: "Hồ Chí Minh" },
    { id: "1592778", name: "Hà Nội" },
    { id: "1593276", name: "Cần Thơ" }
  ];

  const stoneSizes = ["3.6", "4.0", "4.5", "5.0", "5.4", "6.0", "6.3", "7.0", "7.2", "8.1"];

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
        {/* Category Filter */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Loại Trang Sức
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
            {isLoadingTypes ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-full rounded-none" />)
            ) : (
              <RadioGroup
                value={filters.type || ""}
                onValueChange={(val) => handleFastFilterChange(prev => ({ ...prev, type: val }))}
                className="space-y-2"
              >
                {productTypes
                  ?.slice()
                  .sort((a, b) => {
                    const isANhanNu = a.name.toLowerCase().includes("nhẫn nữ");
                    const isBNhanNu = b.name.toLowerCase().includes("nhẫn nữ");
                    if (isANhanNu && !isBNhanNu) return -1;
                    if (!isANhanNu && isBNhanNu) return 1;
                    return 0;
                  })
                  .map(cat => {
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
        </section>

        {/* Stock Status Filter */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Tồn Kho
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <RadioGroup
            value={filters.stockStatus}
            onValueChange={(val: StockStatusFilter) => handleFastFilterChange(prev => ({ ...prev, stockStatus: val }))}
            className="flex flex-col gap-3"
          >
            {[
              { label: "Tất cả", value: "all" },
              { label: "Hàng sẵn", value: "IN_STOCK" },
              { label: "Hàng đặt trước", value: "OUT_OF_STOCK" }
            ].map((item) => (
              <div key={item.value} className="flex items-center space-x-3 group">
                <RadioGroupItem value={item.value} id={item.value} className="h-4 w-4 border-primary-300 text-secondary-900" />
                <Label htmlFor={item.value} className="text-xs text-primary-600 font-medium cursor-pointer group-hover:text-secondary-900">
                  {item.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </section>

        {/* Warehouse Filter */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Khu Vực
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <div className="space-y-3">
            {warehousesList.map(wh => (
              <div key={wh.id} className="flex items-center space-x-3 group">
                <Checkbox
                  id={wh.id}
                  checked={filters.warehouseIds?.includes(wh.id)}
                  onCheckedChange={() => handleFastFilterChange(prev => {
                    const isCurrentlySelected = prev.warehouseIds?.includes(wh.id);
                    return {
                      ...prev,
                      warehouseIds: isCurrentlySelected
                        ? prev.warehouseIds?.filter(i => i !== wh.id)
                        : [...(prev.warehouseIds || []), wh.id]
                    };
                  })}
                  className="h-4 w-4 rounded-none border-primary-300 data-[state=checked]:bg-secondary-900"
                />
                <Label htmlFor={wh.id} className="text-[11px] text-primary-600 font-bold cursor-pointer group-hover:text-secondary-900 uppercase">
                  {wh.name}
                </Label>
              </div>
            ))}
          </div>
        </section>

        {/* Stone Size Filter */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Kích Thước Viên Chủ
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <div className="grid grid-cols-4 gap-2">
            {stoneSizes.map(size => (
              <Button
                key={size}
                variant={filters.storageSize1?.includes(size) ? "default" : "outline"}
                className={cn(
                  "h-8 w-full px-0 rounded-none text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
                  filters.storageSize1?.includes(size)
                    ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
                    : "bg-white text-primary-500 border-primary-100"
                )}
                onClick={() => handleFastFilterChange(prev => ({
                  ...prev,
                  storageSize1: prev.storageSize1?.includes(size) ? [] : [size]
                }))}
              >
                {size} ly
              </Button>
            ))}
          </div>
        </section>

        {/* Price Range */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            KHOẢNG GIÁ
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1.5">
              <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối thiểu</span>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0"
                  className="h-9 text-xs font-bold bg-gray-50/50 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
                  value={filters.salePriceFrom ?? ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, salePriceFrom: e.target.value ? Number(e.target.value) : undefined }))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-200 font-bold">triệu</span>
              </div>
            </div>

            <div className="pt-6 font-bold text-gray-300">-</div>

            <div className="flex-1 space-y-1.5">
              <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối đa</span>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="∞"
                  className="h-9 text-xs font-bold bg-gray-50/50 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-9 placeholder:text-primary-200"
                  value={filters.salePriceTo ?? ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, salePriceTo: e.target.value ? Number(e.target.value) : undefined }))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-200 font-bold uppercase">triệu</span>
              </div>
            </div>
            <div className="pt-6">
              <Button
                variant="secondary"
                className="w-full px-2 rounded-none font-bold tracking-[0.2em] shadow-lg shadow-secondary-900/10 cursor-pointer"
                onClick={() => {
                  applyFilters(filters);
                }}
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
