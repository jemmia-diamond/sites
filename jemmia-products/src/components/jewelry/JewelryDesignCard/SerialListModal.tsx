import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SerialListModalProps {
  variants: any[];
  sku: string;
}

export function SerialListModal({ variants, sku }: SerialListModalProps) {
  const formatPolicy = (val?: string) => {
    if (!val) return null;
    if (val === "Không TM-TĐ") return "Không Thu mua - Thu đổi";
    const match = val.match(/^(\d+)%-(\d+)%$/);
    if (match) {
      return (
        <span className="flex items-center gap-1.5 justify-center">
          <span>Thu mua: <span className="font-bold text-secondary-900">{match[1]}%</span></span>
          <span className="text-primary-200">|</span>
          <span>Thu đổi: <span className="font-bold text-secondary-900">{match[2]}%</span></span>
        </span>
      );
    }
    return val;
  };

  const activeSerials = variants.filter(v => (v.quantity || 0) > 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-none border-primary-200">
          Chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] gap-1! bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden outline-none flex flex-col max-h-[75vh]">
        <DialogHeader className="px-6 py-3 border-b border-gray-100 bg-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-sm font-black tracking-widest text-secondary-900 uppercase">Danh sách Serials</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-0 bg-white pb-3">
          <div className="grid grid-cols-1 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center px-6 py-2 border-b border-gray-100">
              <span className="w-[110px] text-[10px] font-black text-primary-300 uppercase tracking-widest">Thông tin Serial</span>
              <span className="w-[180px] text-[10px] font-black text-primary-300 uppercase tracking-widest text-center">Vị trí</span>
              <span className="w-[110px] text-[10px] font-black text-primary-300 uppercase tracking-widest text-center">Trọng lượng</span>
              <span className="w-[110px] text-[10px] font-black text-primary-300 uppercase tracking-widest text-center">Viên chủ</span>
              <span className="flex-1 text-center text-[10px] font-black text-primary-300 uppercase tracking-widest">Chính sách Thu mua - Thu đổi</span>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {activeSerials.length > 0 ? (
              activeSerials.map((v, index) => (
                <div
                  key={v.id || index}
                  className="flex items-center px-6 py-2.5 transition-all hover:bg-primary-50/40 hover:pl-7 group"
                >
                  <div className="w-[110px]">
                    <span className="text-[14px] font-bold text-secondary-900 tracking-tight leading-none group-hover:text-primary-600 transition-colors">
                      {v.attributes?.serialNumber || "N/A"}
                    </span>
                  </div>

                  <div className="w-[180px] text-center">
                    <Badge className="rounded-none bg-secondary-900/5 hover:bg-secondary-900/5 text-secondary-900 border-none text-[10px] px-2 py-0.5 font-black h-5 uppercase tracking-wider">
                      {v.stockAt || "Kho tổng"}
                    </Badge>
                  </div>

                  <div className="w-[110px] text-center">
                    <span className="text-xs font-bold text-secondary-600 leading-none tracking-tight">
                      {v.attributes?.goldWeight ? `${v.attributes.goldWeight}g` : "--"}
                    </span>
                  </div>

                  <div className="w-[110px] text-center">
                    <span className="text-xs font-bold text-secondary-600 leading-none tracking-tight">
                      {v.attributes?.storageSize1 && v.attributes?.storageSize2
                        ? `${v.attributes.storageSize1}-${v.attributes.storageSize2}`
                        : v.attributes?.storageSize1 ||
                        v.attributes?.storageSize2 ||
                        "--"}
                    </span>
                  </div>

                  <div className="flex-1 text-center border-l border-gray-50">
                    <div className="text-xs text-primary-400 font-bold tracking-tight">
                      {formatPolicy(v.policy)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <p className="text-[10px] text-primary-300 font-black uppercase tracking-widest italic">Không có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}