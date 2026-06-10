import { X, Tag, WarningCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/useIsMobile";
import { formatDateTime } from "./utils/formatters";
import { cn, formatWarehouseName } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function formatGoldWeight(weightInChi: number | null | undefined): string {
  if (weightInChi === undefined || weightInChi === null || isNaN(weightInChi) || weightInChi <= 0) return "N/A";

  const roundedChi = Math.round(weightInChi * 100) / 100;
  const chiPart = Math.floor(roundedChi);
  const remainder = Math.round((roundedChi - chiPart) * 100);
  const phanPart = Math.floor(remainder / 10);
  const lyPart = remainder % 10;

  if (chiPart === 0) {
    if (phanPart === 0 && lyPart === 0) return "0p";
    return lyPart > 0 ? `${phanPart}p${lyPart}` : `${phanPart}p`;
  }
  if (phanPart === 0 && lyPart === 0) return `${chiPart}c`;
  return lyPart > 0 ? `${chiPart}c${phanPart}${lyPart}` : `${chiPart}c${phanPart}`;
}

interface SerialListModalProps {
  variants: any[];
  sku: string;
  totalQuantity?: number;
  totalHaravanQuantity?: number;
  stockStatus?: string;
  open: boolean;
  onClose: () => void;
}

function formatPolicy(val?: string, isMobile?: boolean) {
  if (!val) return null;
  if (val === "Không TM-TĐ") return "Không Thu mua - Thu đổi";
  const match = val.match(/^(\d+)%-(\d+)%$/);
  if (match) {
    return (
      <span className={`flex ${isMobile ? "gap-1" : "items-center gap-1.5 justify-center"}`}>
        <span className={`${isMobile ? "text-[8px] font-bold text-primary-300 uppercase tracking-wider" : ""}`}>
          {isMobile ? "Thu mua: " : "TM: "}
          <span className={`${isMobile ? "text-[9px]" : ""} font-bold text-secondary-900`}>{match[1]}%</span>
        </span>
        {!isMobile && <span className="text-primary-200">|</span>}
        <span className={`${isMobile ? "text-[8px] font-bold text-primary-300 uppercase tracking-wider" : ""}`}>
          {isMobile ? "Thu đổi: " : "TĐ: "}
          <span className={`${isMobile ? "text-[9px]" : ""} font-bold text-secondary-900`}>{match[2]}%</span>
        </span>
      </span>
    );
  }
  return val;
}

interface UnclearDataWarningProps {
  unclearSerials: any[];
  compact?: boolean;
}

function UnclearDataWarning({ unclearSerials, compact }: UnclearDataWarningProps) {
  const [show, setShow] = useState(false);
  const warningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (warningRef.current && !warningRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [show]);

  // Check if device supports hover
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouch(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  if (unclearSerials.length === 0) return null;

  const serialListStr = unclearSerials
    .map((v) => v.attributes?.serialNumber || "Không rõ")
    .filter(Boolean)
    .join(", ");

  return (
    <div
      ref={warningRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => !isTouch && setShow(true)}
      onMouseLeave={() => !isTouch && setShow(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShow((prev) => !prev);
        }}
        className={cn(
          "focus:outline-none inline-flex items-center gap-1 bg-amber-50 text-amber-600 hover:bg-amber-100/70 border border-amber-200/60 rounded-full px-2.5 py-1 text-[10px] md:text-xs font-black shadow-sm transition-all cursor-pointer select-none leading-none w-fit"
        )}
      >
        <WarningCircle size={compact ? 13 : 15} className="shrink-0" weight="bold" />
        <span>Dữ liệu không rõ ({unclearSerials.length})</span>
      </button>

      {show && (
        <div
          className={cn(
            "absolute top-[calc(100%+6px)] left-0 md:left-1/2 md:-translate-x-1/2 w-[280px] md:w-[320px] bg-secondary-900 text-white p-3.5 rounded-lg shadow-2xl border border-secondary-800 z-[99999] animate-in fade-in zoom-in-95 duration-150 text-left normal-case tracking-normal"
          )}
        >
          <p className="text-[10px] font-black text-amber-400 mb-1.5 uppercase tracking-wider">Danh sách serials không rõ:</p>
          <p className="text-[11px] font-bold leading-relaxed break-words text-white font-mono max-h-[120px] overflow-y-auto pr-1">
            {serialListStr}
          </p>
          <div className="absolute -top-1 w-2.5 h-2.5 bg-secondary-900 rotate-45 border-t border-l border-secondary-800 left-6 md:left-1/2 md:-translate-x-1/2" />
        </div>
      )}
    </div>
  );
}

function SerialListDesktopTable({
  activeSerials,
  showOrderCol,
  isOutOfStockTab,
}: {
  activeSerials: any[];
  showOrderCol: boolean;
  isOutOfStockTab: boolean;
}) {
    console.log(activeSerials);

  return (
    <div className="hidden md:block">
      <div className="min-w-[800px]">
        <div className="flex items-center px-8 py-2.5 border-b border-primary-100 bg-primary-50/40 sticky top-0 z-10">
          <span className="w-[80px] shrink-0 text-[10px] font-bold text-primary-400 uppercase tracking-wider">Serial</span>
          <span className="w-[120px] shrink-0 text-[10px] font-bold text-primary-400 uppercase tracking-wider text-center">Vị trí kho</span>
          <span className="w-[80px] shrink-0 text-[10px] font-bold text-primary-400 uppercase tracking-wider text-center">TL vàng</span>
          <span className="w-[80px] shrink-0 text-[10px] font-bold text-primary-400 uppercase tracking-wider text-center">Viên chủ</span>
          <span className="flex-1 text-center text-[10px] font-bold text-primary-400 uppercase tracking-wider">Chính sách</span>
          {showOrderCol && (
            <span className="flex-1 shrink-0 text-[10px] font-bold text-primary-400 uppercase tracking-wider text-center">Đơn hàng</span>
          )}
          <span className="w-[130px] shrink-0 text-[10px] font-bold text-primary-400 uppercase tracking-wider text-right">Thời gian Quét kho</span>
        </div>
        <div className="divide-y divide-primary-50">
          {activeSerials.length > 0 ? (
            activeSerials.map((v, index) => (
              <div
                key={`${v.id}-${index}`}
                className={cn(
                  "flex items-center px-8 py-3 hover:bg-primary-50/40 transition-all",
                  (v.quantity || 0) === 0 && !isOutOfStockTab && "opacity-40 grayscale-[20%]"
                )}
              >
                <div className="w-[80px] shrink-0 flex flex-col justify-center items-start gap-1">
                  <span className="text-xs font-bold text-secondary-900 tracking-tight leading-none">
                    {v.attributes?.serialNumber || "N/A"}
                  </span>
                  {v.inCombo && (
                    <Badge className="bg-amber-500 text-white text-[8px] px-1 py-0 h-3.5 leading-none border-none font-black rounded-sm tracking-tighter">
                      Không bán lẻ
                    </Badge>
                  )}
                </div>
                <div className="w-[120px] shrink-0 text-center">
                  <span className="text-xs text-secondary-900 font-medium">
                    {v.stockAt ? formatWarehouseName(v.stockAt) : "Kho tổng"}
                  </span>
                </div>
                <div className="w-[80px] shrink-0 text-center flex flex-col justify-center items-center">
                  <span className="text-xs font-semibold text-secondary-600 leading-none block">
                    {v.attributes?.goldWeight ? `${formatGoldWeight(v.attributes.goldWeight)}` : "--"}
                  </span>
                </div>
                <div className="w-[80px] shrink-0 text-center">
                  <span className="text-xs font-semibold text-secondary-600 leading-none">
                    {v.attributes?.storageSize1 && v.attributes?.storageSize2
                      ? `${v.attributes.storageSize1}-${v.attributes.storageSize2}`
                      : v.attributes?.storageSize1 || v.attributes?.storageSize2 || "--"}
                  </span>
                </div>
                <div className="flex-1 text-center mt-[2px]">
                  <div className="text-xs text-primary-400 font-medium">
                    {formatPolicy(v.policy, false)}
                  </div>
                </div>
                {showOrderCol && (
                  <div className="flex-1 shrink-0 text-center flex flex-row flex-wrap items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {v.orderId ? (
                      <a
                        href={`https://jemmiavn.myharavan.com/admin/orders/${v.orderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        {v.orderReference || "--"}
                      </a>
                    ) : (
                      <span className="text-xs font-medium text-secondary-600 leading-none">
                        {v.orderReference || "--"}
                      </span>
                    )}
                    {v.fulfillmentStatusValue && (
                      <span className="text-[10px] font-semibold text-primary-400">
                        ({v.fulfillmentStatusValue})
                      </span>
                    )}
                  </div>
                )}
                <div className="w-[130px] shrink-0 text-center">
                  <span className="text-xs font-medium text-secondary-900 leading-none">
                    {formatDateTime(v.lastRfidScanTime)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <SerialListEmptyState large />
          )}
        </div>
      </div>
    </div>
  );
}

function SerialListMobileCards({
  activeSerials,
  showOrderCol,
  isOutOfStockTab,
}: {
  activeSerials: any[];
  showOrderCol: boolean;
  isOutOfStockTab: boolean;
}) {
  console.log(activeSerials);
  return (
    <div className="space-y-2">
      {activeSerials.length > 0 ? (
        activeSerials.map((v, index) => (
          <div
            key={`${v.id}-${index}`}
            className={cn(
              "bg-white border border-primary-100 rounded-sm p-2 hover:bg-primary-50/40 transition-all shadow-sm",
              (v.quantity || 0) === 0 && !isOutOfStockTab && "opacity-40 grayscale-[20%]"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs font-bold text-secondary-900 tracking-tight leading-tight">
                  {v.attributes?.serialNumber || "N/A"}
                </span>
                {v.inCombo && (
                  <Badge className="bg-amber-500 text-white text-[7px] px-1 py-0 h-3.5 leading-none border-none font-black rounded-sm tracking-tighter">
                    Không bán lẻ
                  </Badge>
                )}
              </div>
              <span className="text-[9px] text-secondary-900 font-bold tracking-wider shrink-0">
                {v.stockAt ? formatWarehouseName(v.stockAt) : "Kho tổng"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-primary-300 uppercase tracking-wider">Trọng lượng vàng</span>
                <span className="text-[10px] -mt-0.5 font-semibold text-secondary-600 leading-none">
                  {v.attributes?.goldWeight ? `${formatGoldWeight(v.attributes.goldWeight)}` : "--"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-primary-300 uppercase tracking-wider">Viên chủ</span>
                <span className="text-[10px] -mt-0.5 font-semibold text-secondary-600 leading-none">
                  {v.attributes?.storageSize1 && v.attributes?.storageSize2
                    ? `${v.attributes.storageSize1}-${v.attributes.storageSize2}`
                    : v.attributes?.storageSize1 || v.attributes?.storageSize2 || "--"}
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] text-primary-400 font-medium">
                  {formatPolicy(v.policy, true)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold text-primary-300 uppercase tracking-wider">Quét kho</span>
                <span className="text-[9px] font-medium text-secondary-900">
                  {formatDateTime(v.lastRfidScanTime)}
                </span>
              </div>
              {showOrderCol && (
                <div className="flex items-center gap-2 col-span-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[8px] font-bold text-primary-300 uppercase tracking-wider">Đơn hàng</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {v.orderId ? (
                      <a
                        href={`https://jemmiavn.myharavan.com/admin/orders/${v.orderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] -mt-0.5 font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        {v.orderReference || "--"}
                      </a>
                    ) : (
                      <span className="text-[10px] -mt-0.5 font-bold text-blue-600 leading-none">
                        {v.orderReference || "--"}
                      </span>
                    )}
                    {v.fulfillmentStatusValue && (
                      <span className="text-[9px] font-semibold text-primary-400 -mt-0.5">
                        ({v.fulfillmentStatusValue})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <SerialListEmptyState />
      )}
    </div>
  );
}

function SerialListEmptyState({ large }: { large?: boolean }) {
  return (
    <div className={large ? "py-10 text-center" : "py-6 text-center"}>
      <div
        className={`rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-1.5 ${
          large ? "w-8 h-8" : "w-6 h-6"
        }`}
      >
        <Tag size={large ? 16 : 12} className="text-primary-200" />
      </div>
      <p className={`text-primary-300 font-bold uppercase tracking-widest italic ${large ? "text-[9px]" : "text-[8px]"}`}>
        Không có dữ liệu
      </p>
    </div>
  );
}

export function SerialListModal({
  variants,
  sku: _sku,
  totalQuantity,
  totalHaravanQuantity,
  stockStatus,
  open,
  onClose,
}: SerialListModalProps) {
  const isMobile = useIsMobile();
  const [cachedVariants, setCachedVariants] = useState<any[]>([]);
  const [cachedSku, setCachedSku] = useState("");
  const [cachedTotalQuantity, setCachedTotalQuantity] = useState<number | undefined>(undefined);
  const [cachedTotalHaravanQuantity, setCachedTotalHaravanQuantity] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"inStock" | "outOfStock">("inStock");

  const threshold = new Date("2026-05-12T00:00:00+07:00").getTime();

  useEffect(() => {
    if (open) {
      const filtered = (variants || []).filter((v) => v.attributes?.serialNumber !== null);
      setCachedVariants(filtered);
      setCachedSku(_sku);
      setCachedTotalQuantity(totalQuantity);
      setCachedTotalHaravanQuantity(totalHaravanQuantity);

      const hasInStock = filtered.some((v) => {
        if ((v.quantity || 0) <= 0) return false;
        if (!v.lastRfidScanTime) return false;
        return new Date(v.lastRfidScanTime).getTime() > threshold;
      });

      if (hasInStock) {
        setActiveTab("inStock");
      } else {
        setActiveTab("outOfStock");
      }
    }
  }, [open, variants, _sku, totalQuantity, totalHaravanQuantity, stockStatus]);

  const inStockSerials = cachedVariants
    .filter((v) => (v.quantity || 0) > 0)
    .filter((v) => {
      if (!v.lastRfidScanTime) return false;
      return new Date(v.lastRfidScanTime).getTime() > threshold;
    })
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0));

  const outOfStockSerials = cachedVariants
    .filter((v) => (v.quantity || 0) === 0);

  const displaySerials = activeTab === "inStock" ? inStockSerials : outOfStockSerials;

  const scannedBeforeOrNoScan = cachedVariants
    .filter((v) => (v.quantity || 0) > 0)
    .filter((v) => {
      if (!v.lastRfidScanTime) return true;
      return new Date(v.lastRfidScanTime).getTime() <= threshold;
    });

  const hasDiff =
    typeof cachedTotalQuantity === "number" &&
    typeof cachedTotalHaravanQuantity === "number" &&
    cachedTotalQuantity !== cachedTotalHaravanQuantity;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  if (isMobile) {
    return (
      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        className="max-h-[92vh]"
        contentClassName="px-0"
        title={
          <div className="flex flex-col gap-1.5 pb-2">
            <span className="text-xs font-bold text-secondary-900 tracking-wider">DANH SÁCH SERIALS</span>
            <UnclearDataWarning unclearSerials={scannedBeforeOrNoScan} compact />
          </div>
        }
      >
        <div className="px-4 py-2 flex flex-col gap-4">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
            <TabsList variant="line" className="w-full flex border-b border-primary-100 px-0 h-9">
              <TabsTrigger
                value="inStock"
                className={cn(
                  "flex-1 font-bold text-xs cursor-pointer pb-2 relative transition-all duration-200 rounded-none",
                  activeTab === "inStock"
                    ? "text-secondary-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-secondary-900"
                    : "text-primary-300 hover:text-secondary-900"
                )}
              >
                Có hàng ({inStockSerials.length})
              </TabsTrigger>
              <TabsTrigger
                value="outOfStock"
                className={cn(
                  "flex-1 font-bold text-xs cursor-pointer pb-2 relative transition-all duration-200 rounded-none",
                  activeTab === "outOfStock"
                    ? "text-secondary-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-secondary-900"
                    : "text-primary-300 hover:text-secondary-900"
                )}
              >
                Đã bán ({outOfStockSerials.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div>
            <SerialListMobileCards activeSerials={displaySerials} showOrderCol={activeTab === "outOfStock"} isOutOfStockTab={activeTab === "outOfStock"} />
          </div>
        </div>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95%] md:w-full md:max-w-[900px] gap-0 bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden outline-none flex flex-col max-h-[90vh] md:max-h-[75vh]">
        <DialogHeader className="pt-5 md:pt-6 pb-0 bg-white sticky top-0 z-20 flex flex-col gap-4 flex-shrink-0">
          <div className="flex flex-row justify-between items-center w-full px-4 md:px-8">
            <DialogTitle className="text-base md:text-lg font-bold tracking-wider text-secondary-900">
              DANH SÁCH SERIALS
            </DialogTitle>
            <DialogClose className="cursor-pointer shrink-0 text-primary-400 hover:text-secondary-900 transition-colors">
              <X className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          <div className="flex flex-row items-end justify-between border-b border-primary-100 w-full px-4 md:px-8 pb-0">
            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-fit">
              <TabsList variant="line" className="flex justify-start px-0 gap-6 h-9">
                <TabsTrigger
                  value="inStock"
                  className={cn(
                    "font-bold text-xs md:text-sm cursor-pointer pb-2 relative transition-all duration-200 rounded-none px-1",
                    activeTab === "inStock"
                      ? "text-secondary-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-secondary-900"
                      : "text-primary-300 hover:text-secondary-900"
                  )}
                >
                  Có hàng ({inStockSerials.length})
                </TabsTrigger>
                <TabsTrigger
                  value="outOfStock"
                  className={cn(
                    "font-bold text-xs md:text-sm cursor-pointer pb-2 relative transition-all duration-200 rounded-none px-1",
                    activeTab === "outOfStock"
                      ? "text-secondary-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-secondary-900"
                      : "text-primary-300 hover:text-secondary-900"
                  )}
                >
                  Đã bán ({outOfStockSerials.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="pb-1.5">
              <UnclearDataWarning unclearSerials={scannedBeforeOrNoScan} />
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-white pb-3">
          <SerialListDesktopTable activeSerials={displaySerials} showOrderCol={activeTab === "outOfStock"} isOutOfStockTab={activeTab === "outOfStock"} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
