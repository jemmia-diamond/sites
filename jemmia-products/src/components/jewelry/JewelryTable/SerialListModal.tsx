import { X, Tag } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SerialListModalProps {
  variants: any[];
  sku: string;
  open: boolean;
  onClose: () => void;
}

export function SerialListModal({ variants, sku, open, onClose }: SerialListModalProps) {
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[800px] gap-0 bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden outline-none flex flex-col max-h-[75vh]">
        <DialogHeader className="px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10 flex flex-row justify-between flex-shrink-0">
          <DialogTitle className="text-[16px] block font-bold tracking-tight text-secondary-900 uppercase">
            Danh sách Serials
          </DialogTitle>
          <DialogClose className="cursor-pointer">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-white pb-3">
          <div className="flex items-center px-8 py-3 border-b border-gray-100 bg-gray-50/30">
            <span className="w-[120px] text-[10px] font-bold text-primary-300 uppercase tracking-wider">Serial</span>
            <span className="w-[180px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Vị trí kho</span>
            <span className="w-[110px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Trọng lượng</span>
            <span className="w-[110px] text-[10px] font-bold text-primary-300 uppercase tracking-wider text-center">Viên chủ</span>
            <span className="flex-1 text-center text-[10px] font-bold text-primary-300 uppercase tracking-wider">Chính sách TM - TĐ</span>
          </div>
          <div className="divide-y divide-gray-50">
            {activeSerials.length > 0 ? (
              activeSerials.map((v, index) => (
                <div
                  key={v.id || index}
                  className="flex items-center px-8 py-4 hover:bg-primary-50/40 transition-all"
                >
                  <div className="w-[120px]">
                    <span className="text-[14px] font-bold text-secondary-900 tracking-tight leading-none">
                      {v.attributes?.serialNumber || "N/A"}
                    </span>
                  </div>
                  <div className="w-[180px] text-center">
                    <Badge className="rounded-full bg-secondary-900/5 text-secondary-900 border-none text-[10px] px-3 py-1 font-bold h-6 uppercase tracking-wider">
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
                  <div className="flex-1 text-center">
                    <div className="text-[11px] text-primary-400 font-medium">
                      {formatPolicy(v.policy)}
                    </div>
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