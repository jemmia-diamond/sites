import React from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface TryOnGuideProps {
  onClose: () => void;
}

export function TryOnGuide({ onClose }: TryOnGuideProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-85 md:max-w-xl bg-white overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300"
      >
        {/* Header containing the Close Button */}
        <div className="flex items-center justify-end px-4 pt-3 pb-2">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer p-1"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col">
          {/* Illustration Image */}
          <div className="w-full aspect-[4/3] bg-slate-50 overflow-hidden relative flex items-center justify-center">
            <img
              src="https://cdn.hstatic.net/files/200000355853/file/chatgpt_image_10_35_42_16_thg_6__2026_1__3_.png"
              className="w-full h-full object-cover select-none"
              alt="Đặt vùng đỏ tại vị trí thử nhẫn"
              draggable={false}
            />
          </div>

          {/* Title & Instructions */}
          <div className="p-5 flex flex-col items-center text-center space-y-3">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              Đặt vùng đỏ tại vị trí thử nhẫn
            </h3>
            <p className="text-xs md:text-sm text-slate-500 font-normal leading-relaxed">
              Di chuyển và căn chỉnh hình ảnh sao cho vùng màu đỏ trùng khớp với vị trí muốn thử nhẫn, như vậy hình ảnh nhẫn sẽ được ghép vào đúng chỗ bạn chọn
            </p>
          </div>
        </div>

        {/* Footer Area with Action Button */}
        <div className="px-5 pb-5">
          <Button
            onClick={onClose}
            className="w-full bg-[#004B49] hover:bg-[#003B39] text-white font-semibold text-sm h-11 flex items-center justify-center rounded-lg cursor-pointer border-none shadow-none"
          >
            Đã hiểu
          </Button>
        </div>
      </div>
    </div>
  );
}
