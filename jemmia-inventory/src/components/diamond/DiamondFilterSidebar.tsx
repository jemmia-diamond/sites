import { useState } from "react";
import { DiamondFilter } from "../../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const AREA_OPTIONS = [
    { id: "hcm", label: "Hồ Chí Minh", ids: ["1592770", "1582708", "1110168"] },
    { id: "cantho", label: "Cần Thơ", ids: ["1593276"] },
    { id: "hanoi", label: "Hà Nội", ids: ["1592778"] },
  ];

  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const toggleArea = (optionId: string) => {
    setSelectedAreas(prev => {
      const updated = prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId];
      
      const selectedAreaConfigs = AREA_OPTIONS.filter(opt => updated.includes(opt.id));
      const warehouseIds = selectedAreaConfigs.flatMap(opt => opt.ids);
      
      setFilters(f => ({ ...f, warehouseIds }));
      return updated;
    });
  };

  const toggleMultiSelect = (key: keyof DiamondFilter, value: any) => {
    setFilters(prev => {
      const current = (prev[key] as any[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setSelectedAreas([]);
    onApply(initialFilters);
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
        {/* Price Range Filter */}
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
                  className="h-9 text-xs font-bold bg-gray-50/50 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-12"
                  value={filters.salePriceFrom || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, salePriceFrom: e.target.value ? Number(e.target.value) : undefined }))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-200 font-bold uppercase">triệu</span>
              </div>
            </div>

            <div className="pt-6 font-bold text-gray-300">-</div>

            <div className="flex-1 space-y-1.5">
              <span className="text-[9px] text-primary-300 font-black uppercase tracking-widest pl-1">Tối đa</span>
              <div className="relative">
                <Input 
                  type="number"
                  placeholder="100"
                  className="h-9 text-xs font-bold bg-gray-50/50 border-primary-100 rounded-none focus-visible:ring-1 focus-visible:ring-secondary-500 pr-12"
                  value={filters.salePriceTo || ""}
                  onChange={(e) => setFilters(prev => ({ ...prev, salePriceTo: e.target.value ? Number(e.target.value) : undefined }))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-primary-200 font-bold uppercase">triệu</span>
              </div>
            </div>
          </div>
        </section>

        {/* Kích thước (ly) */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Kích thước (Ly)
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map(size => (
              <Button
                key={size.label}
                variant={filters.edgeSizes?.includes(size.value) ? "default" : "outline"}
                onClick={() => toggleMultiSelect("edgeSizes", size.value)}
                className={cn(
                  "h-8 w-full px-0 rounded-none text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
                  filters.edgeSizes?.includes(size.value)
                    ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
                    : "bg-white text-primary-500 border-primary-100"
                )}
              >
                {size.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Tồn kho */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Tồn Kho
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <RadioGroup 
            value={filters.stockStatus} 
            onValueChange={(val: any) => setFilters(prev => ({ ...prev, stockStatus: val }))}
            className="flex flex-col gap-3"
          >
            {[
              { label: "Hàng sẵn", value: "IN_STOCK" },
              { label: "Hàng đặt trước", value: "INCOMING" }
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

        {/* Khu vực */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Khu vực
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <div className="space-y-3">
            {AREA_OPTIONS.map(opt => {
              const isActive = selectedAreas.includes(opt.id);
              return (
                <div key={opt.id} className="flex items-center space-x-3 group">
                  <button
                    onClick={() => toggleArea(opt.id)}
                    className={cn(
                      "h-4 w-4 rounded-none border border-primary-300 transition-colors flex items-center justify-center",
                      isActive ? "bg-secondary-900 border-secondary-900" : "bg-white"
                    )}
                  >
                    {isActive && <div className="h-2 w-2 bg-white" />}
                  </button>
                  <span 
                    onClick={() => toggleArea(opt.id)}
                    className="text-[11px] text-primary-600 font-bold cursor-pointer group-hover:text-secondary-900 uppercase tracking-tight"
                  >
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Color */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Nước màu (Color)
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(color => (
              <Button
                key={color}
                variant={filters.color?.includes(color) ? "default" : "outline"}
                onClick={() => toggleMultiSelect("color", color)}
                className={cn(
                  "h-8 w-8 p-0 flex items-center justify-center rounded-none text-[10px] font-bold border transition-all cursor-pointer hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
                  filters.color?.includes(color)
                    ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
                    : "bg-white text-primary-500 border-primary-100"
                )}
              >
                {color}
              </Button>
            ))}
          </div>
        </section>

        {/* Clarity */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Độ sạch (Clarity)
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CLARITIES.map(clarity => (
              <Button
                key={clarity}
                variant={filters.clarity?.includes(clarity) ? "default" : "outline"}
                onClick={() => toggleMultiSelect("clarity", clarity)}
                className={cn(
                  "h-8 rounded-none text-[10px] font-bold border transition-all cursor-pointer uppercase tracking-tight hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
                  filters.clarity?.includes(clarity)
                    ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
                    : "bg-white text-primary-500 border-primary-100"
                )}
              >
                {clarity}
              </Button>
            ))}
          </div>
        </section>

        {/* Fluorescence */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
            Huỳnh quang
            <div className="h-px flex-1 bg-primary-100" />
          </label>
          <div className="flex flex-wrap gap-2">
            {FLUORESCENCE.map(f => (
              <Button
                key={f}
                variant={filters.fluorescence?.includes(f) ? "default" : "outline"}
                onClick={() => toggleMultiSelect("fluorescence", f)}
                className={cn(
                  "h-8 px-3 rounded-none text-[10px] font-bold border transition-all cursor-pointer uppercase tracking-tight hover:bg-secondary-900 hover:text-white hover:border-secondary-900",
                  filters.fluorescence?.includes(f)
                    ? "bg-secondary-900 text-white border-secondary-900 shadow-sm"
                    : "bg-white text-primary-500 border-primary-100"
                )}
              >
                {f}
              </Button>
            ))}
          </div>
        </section>
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
