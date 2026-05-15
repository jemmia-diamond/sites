import { X, Tag, Info, WarningCircle } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "./utils/formatters";

interface SerialListModalProps {
  variants: any[];
  sku: string;
  totalQuantity?: number;
  totalHaravanQuantity?: number;
  open: boolean;
  onClose: () => void;
}

export function SerialListModal({ variants, sku, totalQuantity, totalHaravanQuantity, open, onClose }: SerialListModalProps) {
  const formatPolicy = (val?: string) => {
    if (!val) return null;
    if (val === "Không TM-TĐ") return "Không Thu mua - Thu đổi";
    const match = val.match(/^(\d+)%-(\d+)%$/);
    if (match) {
      return (
        <span className="flex items-center gap-1.5 justify-center">
          <span>
            Thu mua:{" "}
            <span className="font-bold text-secondary-900">{match[1]}%</span>
          </span>
          <span className="text-primary-200">|</span>
          <span>
            Thu đổi:{" "}
            <span className="font-bold text-secondary-900">{match[2]}%</span>
          </span>
        </span>
      );
    }
    return val;
  };

  const activeSerials = variants.filter((v) => (v.quantity || 0) > 0);
  const hasDiff = typeof totalQuantity === "number" && typeof totalHaravanQuantity === "number" && totalQuantity !== totalHaravanQuantity;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[900px] gap-0 bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden outline-none flex flex-col max-h-[75vh]">
        <DialogHeader className="px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-10 flex flex-row justify-between flex-shrink-0">
          <DialogTitle className="text-[16px] flex gap-4 items-center font-bold tracking-tight text-secondary-900">
            <span>DANH SÁCH SERIALS</span>
            {hasDiff && (
              <div className="relative group/warning cursor-help inline-flex w-fit items-center gap-1.5 bg-pending-50 text-pending-600 px-2 py-1 rounded-md border border-red-100">
                <WarningCircle size={16} className="shrink-0" weight="bold" />
                <p className="text-xs font-medium mt-px">
                  Có chênh lệch giữa tồn kho Haravan và dữ liệu serial
                </p>
                <div className="absolute top-[calc(100%+8px)] left-0 w-[340px] opacity-0 group-hover/warning:opacity-100 pointer-events-none transition-opacity bg-secondary-900 text-white p-4 rounded-md shadow-2xl z-50">
                  <p className="text-[11px] font-medium leading-relaxed">
                    <strong className="text-pending-600">Nguyên nhân:</strong> Chưa gán serial cho đơn hàng, chưa quét kho hoặc dữ liệu serial chưa đồng bộ.
                    <br /><br />
                    Vui lòng liên hệ trực tiếp cửa hàng để xác nhận chính xác serial nào hiện còn trong kho.
                  </p>
                  <div className="absolute -top-1.5 left-6 w-3 h-3 bg-secondary-900 rotate-45"></div>
                </div>
              </div>
            )}
          </DialogTitle>
          <DialogClose className="cursor-pointer">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-white pb-3">
          <div className="flex items-center px-8 py-3 border-b border-gray-100 bg-gray-50/30">
            <span className="w-[120px] text-[10px] font-bold text-primary-300 uppercase tracking-wider">Serial</span>
            <span className="w-[160px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Vị trí kho</span>
            <span className="w-[110px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Trọng lượng</span>
            <span className="w-[110px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Viên chủ</span>
            <span className="flex-1 text-center text-[10px] font-bold text-primary-300 uppercase tracking-wider">Chính sách</span>
            <span className="w-[120px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-right">Thời gian Quét kho</span>
          </div>
          <div className="divide-y divide-gray-50">
            {activeSerials.length > 0 ? (
              activeSerials.map((v, index) => (
                <div
                  key={`${v.id}-${index}`}
                  className="flex items-center px-8 py-4 hover:bg-primary-50/40 transition-all"
                >
                  <div className="w-[120px]">
                    <span className="text-xs font-bold text-secondary-900 tracking-tight leading-none">
                      {v.attributes?.serialNumber || "N/A"}
                    </span>
                  </div>
                  <div className="w-[160px] text-center">
                    <Badge className="rounded-full bg-secondary-900/5 text-secondary-900 border-none text-[10px] px-3 py-1 font-bold h-6 tracking-wider">
                      {v.stockAt || "Kho tổng"}
                    </Badge>
                  </div>
                  <div className="w-[110px] text-center">
                    <span className="text-xs font-semibold text-secondary-600 leading-none">
                      {v.attributes?.goldWeight ? `${v.attributes.goldWeight}g` : "--"}
                    </span>
                  </div>
                  <div className="w-[110px] text-center">
                    <span className="text-xs font-semibold text-secondary-600 leading-none">
                      {v.attributes?.storageSize1 && v.attributes?.storageSize2
                        ? `${v.attributes.storageSize1}-${v.attributes.storageSize2}`
                        : v.attributes?.storageSize1 || v.attributes?.storageSize2 || "--"}
                    </span>
                  </div>
                  <div className="flex-1 text-center mt-[2px]">
                    <div className="text-xs text-primary-400 font-medium">
                      {formatPolicy(v.policy)}
                    </div>
                  </div>
                  <div className="w-[120px] text-center">
                    <span className="text-xs font-medium text-secondary-900 leading-none">
                      {formatDateTime(v.lastRfidScanTime)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <Tag size={24} className="text-primary-200" />
                </div>
                <p className="text-[11px] text-primary-300 font-bold uppercase tracking-widest italic">
                  Không có dữ liệu
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}