import { useState } from "react";
import { DiamondFilter } from "../../../types";
import { Button } from "@/components/ui/button";
import { FilterSection } from "./FilterSection";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { SizeFilter } from "./SizeFilter";
import { StockStatusFilter } from "./StockStatusFilter";
import { AreaFilter } from "./AreaFilter";
import { MultiSelectButtonFilter } from "./MultiSelectButtonFilter";

interface DiamondFilterSidebarProps {
  onApply: (filters: DiamondFilter) => void;
}

const SIZES = [
  { label: "3ly6", value: 3.6 },
  { label: "4ly", value: 4 },
  { label: "4ly5", value: 4.5 },
  { label: "5ly", value: 5 },
  { label: "5ly4", value: 5.4 },
  { label: "6ly", value: 6 },
  { label: "6ly3", value: 6.3 },
  { label: "7ly", value: 7 },
  { label: "7ly2", value: 7.2 },
  { label: "8ly1", value: 8.1 },
];

const COLORS = ["D", "E", "F", "G", "H", "I"];
const CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2"];
const FLUORESCENCE = ["None", "Faint", "Medium", "Strong", "Very Strong"];

const AREA_OPTIONS = [
  { id: "hcm", label: "Hồ Chí Minh", ids: ["1592770", "1582708", "1110168"] },
  { id: "cantho", label: "Cần Thơ", ids: ["1593276"] },
  { id: "hanoi", label: "Hà Nội", ids: ["1592778"] },
];

export function DiamondFilterSidebar({ onApply }: DiamondFilterSidebarProps) {
  const initialFilters: DiamondFilter = {
    salePriceFrom: undefined,
    salePriceTo: undefined,
    edgeSizes: [],
    warehouseIds: [],
    stockStatus: "IN_STOCK",
    color: [],
    clarity: [],
    fluorescence: [],
  };

  const [filters, setFilters] = useState<DiamondFilter>(initialFilters);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const toggleArea = (optionId: string) => {
    setSelectedAreas((prev) => {
      const updated = prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId];

      const selectedAreaConfigs = AREA_OPTIONS.filter((opt) => updated.includes(opt.id));
      const warehouseIds = selectedAreaConfigs.flatMap((opt) => opt.ids);

      setFilters((f) => ({ ...f, warehouseIds }));
      return updated;
    });
  };

  const toggleMultiSelect = (key: keyof DiamondFilter, value: any) => {
    setFilters((prev) => {
      const current = (prev[key] as any[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setSelectedAreas([]);
    onApply(initialFilters);
  };

  const handleMinPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceFrom: value }));
  };

  const handleMaxPriceChange = (value: number | undefined) => {
    setFilters((prev) => ({ ...prev, salePriceTo: value }));
  };

  const handleStockStatusChange = (status: "INCOMING" | "IN_STOCK") => {
    setFilters((prev) => ({ ...prev, stockStatus: status }));
  };

  return (
    <aside className="w-80 h-full border-r border-primary-100 bg-white flex flex-col pt-5 overflow-y-auto no-scrollbar">
      <div className="px-8 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-secondary-900 uppercase">Bộ lọc tinh hoa</h2>
          <p className="text-[10px] text-primary-400 mt-0.5 font-bold uppercase">Tuyển chọn kim cương</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-auto p-0 text-[9px] font-black text-primary-400 hover:text-secondary-900 hover:bg-transparent uppercase tracking-wider"
        >
          Xóa bộ lọc
        </Button>
      </div>

      <div className="flex-1 px-8 space-y-9 pb-20">
        <FilterSection label="KHOẢNG GIÁ">
          <PriceRangeFilter
            filters={filters}
            onMinPriceChange={handleMinPriceChange}
            onMaxPriceChange={handleMaxPriceChange}
          />
        </FilterSection>

        <FilterSection label="Kích thước (Ly)">
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
          <AreaFilter
            selectedAreas={selectedAreas}
            filters={filters}
            areaOptions={AREA_OPTIONS}
            onAreaToggle={toggleArea}
          />
        </FilterSection>

        <FilterSection label="Nước màu (Color)">
          <MultiSelectButtonFilter
            label="Color"
            options={COLORS}
            filters={filters}
            filterKey="color"
            onToggle={(value) => toggleMultiSelect("color", value)}
            variant="flex"
          />
        </FilterSection>

        <FilterSection label="Độ sạch (Clarity)">
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
            variant="flex"
          />
        </FilterSection>
      </div>

      <div className="p-8 border-t border-primary-100 bg-white sticky bottom-0 z-10 shadow-sm">
        <Button
          variant="secondary"
          size="lg"
          className="w-full h-12 rounded-none font-bold tracking-[0.2em] mt-2 shadow-lg shadow-secondary-900/10 cursor-pointer"
          onClick={() => onApply(filters)}
        >
          ÁP DỤNG BỘ LỌC
        </Button>
      </div>
    </aside>
  );
}