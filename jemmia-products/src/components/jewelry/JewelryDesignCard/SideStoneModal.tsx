import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "@phosphor-icons/react";
import { formatLySize } from "./utils/formatters";

interface SideStoneModalProps {
  fourView: { round: string; diamondCount: string }[];
}

export function SideStoneModal({ fourView }: SideStoneModalProps) {
  return (
    <Dialog>
      <DialogTrigger className="flex items-center hover:opacity-70 transition-opacity text-inherit cursor-pointer">
        <span className="text-secondary-900 flex items-center font-bold underline decoration-dotted underline-offset-4">
          <Info size={14} className="mr-1 text-secondary-900" /> Thông tin viên tấm
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-none border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-secondary-900 text-white p-8">
          <DialogTitle className="text-xl font-bold tracking-tight uppercase">Chi tiết đá tấm</DialogTitle>
        </DialogHeader>
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4">
            {fourView.map((stone, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-primary-50 rounded-none border border-primary-100">
                <span className="text-sm font-bold text-secondary-900">{formatLySize(stone.round)}</span>
                <span className="text-[11px] font-bold text-primary-500 bg-white px-2 py-1 rounded-none border border-primary-100 shadow-sm">
                  {stone.diamondCount} viên
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}