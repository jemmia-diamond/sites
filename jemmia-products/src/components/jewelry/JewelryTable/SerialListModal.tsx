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
          Thu mua:{" "}
          <span className={`${isMobile ? "text-[9px]" : ""} font-bold text-secondary-900`}>{match[1]}%</span>
        </span>
        {!isMobile && <span className="text-primary-200">|</span>}
        <span className={`${isMobile ? "text-[8px] font-bold text-primary-300 uppercase tracking-wider" : ""}`}>
          Thu đổi:{" "}
          <span className={`${isMobile ? "text-[9px]" : ""} font-bold text-secondary-900`}>{match[2]}%</span>
        </span>
      </span>
    );
  }
  return val;
}

function InventoryDiffWarning({ compact }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "flex items-start gap-1.5 bg-pending-50 text-pending-600 px-2 py-1.5 rounded-md border border-red-100"
          : "relative group/warning cursor-help inline-flex w-full sm:w-fit items-center gap-1.5 bg-pending-50 text-pending-600 px-2 py-1.5 rounded-md border border-red-100"
      }
    >
      <WarningCircle size={compact ? 14 : 16} className="shrink-0 mt-0.5" weight="bold" />
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-medium leading-snug">
          Có chênh lệch giữa tồn kho Haravan và dữ liệu serial
        </p>
        {compact && (
          <p className="text-[10px] font-medium leading-snug text-pending-600/90 mt-1">
            Vui lòng liên hệ trực tiếp cửa hàng để xác nhận serial nào còn trong kho.
          </p>
        )}
      </div>
      {!compact && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[280px] sm:w-[340px] opacity-0 group-hover/warning:opacity-100 pointer-events-none transition-opacity bg-secondary-900 text-white p-3 sm:p-4 rounded-md shadow-2xl z-50">
          <p className="text-[10px] sm:text-[11px] font-medium leading-relaxed">
            Vui lòng liên hệ trực tiếp cửa hàng để xác nhận chính xác serial nào hiện còn trong kho.
          </p>
          <div className="absolute -top-1.5 left-6 w-3 h-3 bg-secondary-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

function SerialListDesktopTable({ activeSerials }: { activeSerials: any[] }) {
  return (
    <div className="hidden sm:block">
      <div className="min-w-[800px]">
        <div className="flex items-center px-8 py-3 border-b border-gray-100 bg-gray-50/30">
          <span className="w-[120px] shrink-0 text-[10px] font-bold text-primary-300 uppercase tracking-wider">Serial</span>
          <span className="w-[160px] shrink-0 text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Vị trí kho</span>
          <span className="w-[130px] shrink-0 text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Trọng lượng vàng</span>
          <span className="w-[110px] shrink-0 text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Viên chủ</span>
          <span className="flex-1 text-center text-[10px] font-bold text-primary-300 uppercase tracking-wider">Chính sách</span>
          <span className="w-[120px] shrink-0 text-[10px] font-bold text-primary-300 uppercase tracking-wider text-right">Thời gian Quét kho</span>
        </div>
        <div className="divide-y divide-gray-50">
          {activeSerials.length > 0 ? (
            activeSerials.map((v, index) => (
              <div
                key={`${v.id}-${index}`}
                className="flex items-center px-8 py-4 hover:bg-primary-50/40 transition-all"
              >
                <div className="w-[120px] shrink-0 flex items-center gap-1.5">
                  <span className="text-xs font-bold text-secondary-900 tracking-tight leading-none">
                    {v.attributes?.serialNumber || "N/A"}
                  </span>
                  {v.inCombo && (
                    <Badge className="bg-amber-500 text-white text-[8px] px-1 py-0 h-3.5 leading-none border-none font-black rounded-sm tracking-tighter">
                      Không bán lẻ
                    </Badge>
                  )}
                </div>
                <div className="w-[160px] shrink-0 text-center">
                  <Badge className="rounded-full bg-secondary-900/5 text-secondary-900 border-none text-[10px] px-3 py-1 font-bold h-6 tracking-wider">
                    {v.stockAt || "Kho tổng"}
                  </Badge>
                </div>
                <div className="w-[130px] shrink-0 text-center flex flex-col justify-center items-center">
                  <span className="text-xs font-semibold text-secondary-600 leading-none block">
                    {v.attributes?.goldWeight ? `${formatGoldWeight(v.attributes.goldWeight)}` : "--"}
                  </span>
                </div>
                <div className="w-[110px] shrink-0 text-center">
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
                <div className="w-[120px] shrink-0 text-right">
                  <span className="text-[10px] font-medium text-secondary-900 leading-none">
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

function SerialListMobileCards({ activeSerials }: { activeSerials: any[] }) {
  return (
    <div className="space-y-2">
      {activeSerials.length > 0 ? (
        activeSerials.map((v, index) => (
          <div
            key={`${v.id}-${index}`}
            className="bg-white border border-primary-100 rounded-sm p-2 hover:bg-primary-50/40 transition-all shadow-sm"
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
              <Badge className="rounded-full bg-secondary-900/5 text-secondary-900 border-none text-[9px] px-2 py-0.5 font-bold h-5 tracking-wider shrink-0">
                {v.stockAt || "Kho tổng"}
              </Badge>
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
    <div className={large ? "p-20 text-center" : "py-10 text-center"}>
      <div
        className={`rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-2 ${
          large ? "w-12 h-12 mb-4" : "w-8 h-8"
        }`}
      >
        <Tag size={large ? 24 : 16} className="text-primary-200" />
      </div>
      <p className={`text-primary-300 font-bold uppercase tracking-widest italic ${large ? "text-[11px]" : "text-[10px]"}`}>
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
  open,
  onClose,
}: SerialListModalProps) {
  const isMobile = useIsMobile();
  const activeSerials = variants.filter((v) => (v.quantity || 0) > 0);
  const hasDiff =
    typeof totalQuantity === "number" &&
    typeof totalHaravanQuantity === "number" &&
    totalQuantity !== totalHaravanQuantity;

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
          <div className="flex flex-col gap-2">
            <span>DANH SÁCH SERIALS</span>
            {hasDiff && <InventoryDiffWarning compact />}
          </div>
        }
      >
        <div className="px-3 py-2">
          <SerialListMobileCards activeSerials={activeSerials} />
        </div>
      </BottomSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95%] sm:w-full sm:max-w-[900px] gap-0 bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden outline-none flex flex-col max-h-[90vh] sm:max-h-[75vh]">
        <DialogHeader className="px-4 sm:px-8 py-3 sm:py-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex flex-row justify-between flex-shrink-0 gap-3">
          <DialogTitle className="text-sm sm:text-[16px] flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center font-bold tracking-tight text-secondary-900 flex-1">
            <span>DANH SÁCH SERIALS</span>
            {hasDiff && <InventoryDiffWarning />}
          </DialogTitle>
          <DialogClose className="cursor-pointer shrink-0">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-white pb-3 no-scrollbar">
          <SerialListDesktopTable activeSerials={activeSerials} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
