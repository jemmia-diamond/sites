import { Tag, Info } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SerialItem {
  id: string;
  location: string;
  status: "available" | "pre-order" | "sold";
  policy_value?: string;
}

const MOCK_SERIALS: SerialItem[] = [
  { id: "26040007", location: "TP.HCM", status: "available", policy_value: "80%-85%" },
  { id: "25050203", location: "Hà Nội", status: "available", policy_value: "80%-85%" },
  { id: "26040069", location: "Cần Thơ", status: "pre-order", policy_value: "60%-70%" },
  { id: "26040208", location: "TP.HCM", status: "available", policy_value: "80%-85%" },
  { id: "25100406", location: "Đà Nẵng", status: "sold", policy_value: "Không TM-TĐ" },
];

export function SerialListDialog() {
  const getStatusConfig = (status: SerialItem["status"]) => {
    switch (status) {
      case "available":
        return { label: "CÓ SẴN", className: "bg-success/10 text-success border-none font-bold" };
      case "pre-order":
        return { label: "ĐẶT TRƯỚC", className: "bg-pending/10 text-pending border-none font-bold" };
      case "sold":
        return { label: "ĐÃ BÁN", className: "bg-critical/10 text-critical border-none font-bold" };
    }
  };

  const formatPolicy = (val?: string) => {
    if (!val) return null;
    if (val === "Không TM-TĐ") return "Không Thu mua - Thu đổi";
    const match = val.match(/^(\d+)%-(\d+)%$/);
    if (match) {
      return (
        <span className="flex items-center gap-1.5 uppercase">
          <span>Thu mua: <span className="font-bold text-secondary-900">{match[1]}%</span></span>
          <span className="text-primary-200">|</span>
          <span>Thu đổi: <span className="font-bold text-secondary-900">{match[2]}%</span></span>
        </span>
      );
    }
    return val;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-4 w-4 mx-auto text-primary-300 hover:text-secondary-900 transition-colors p-0 rounded-none cursor-pointer border-none flex items-center justify-center">
          <Tag size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden outline-none">
        <DialogHeader className="p-8 pb-6 border-b border-primary-100 bg-primary-50">
          <DialogTitle className="text-2xl font-bold tracking-tight text-secondary-900 uppercase">Số Serial</DialogTitle>
        </DialogHeader>

        <div className="px-8 py-3 bg-amber-50/50 border-b border-amber-100 flex items-center gap-3">
          <Info size={18} className="text-amber-600 flex-shrink-0" weight="fill" />
          <p className="text-[11px] font-black text-amber-800 uppercase tracking-tight leading-tight">
            Lưu ý: Danh sách serial mang tính chất tham khảo, cần kiểm tra thực tế tại kho.
          </p>
        </div>
        
        <div className="p-2 space-y-1">
          {MOCK_SERIALS.map((serial, index) => {
            const config = getStatusConfig(serial.status);
            return (
              <div 
                key={serial.id} 
                className={cn(
                  "flex items-center justify-between p-6 rounded-none transition-colors hover:bg-primary-50 group",
                  index !== MOCK_SERIALS.length - 1 && "border-b border-primary-100"
                )}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-secondary-900 tracking-tight">{serial.id}</p>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-none bg-secondary-900/5 text-secondary-900 text-[10px] font-bold uppercase tracking-wider">
                      {serial.location}
                    </div>
                  </div>
                  {serial.policy_value && (
                    <p className="text-[11px] text-primary-500 font-bold tracking-tight">
                      {formatPolicy(serial.policy_value)}
                    </p>
                  )}
                </div>
                
                <Badge className={cn("px-4 py-2 rounded-none text-xs tracking-wider", config.className)}>
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
