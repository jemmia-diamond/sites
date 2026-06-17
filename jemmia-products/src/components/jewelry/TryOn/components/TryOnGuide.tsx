import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface TryOnGuideProps {
  guideStep: number;
  onNext: () => void;
  onClose: () => void;
}

export function TryOnGuide({ guideStep, onNext, onClose }: TryOnGuideProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center animate-in fade-in duration-200">
      {/* Phone Mockup Frame Container */}
      <div className="relative w-full h-full bg-white overflow-hidden flex flex-col justify-between animate-in zoom-in duration-300">
        {/* Header with Jemmia Logo and Close Button */}
        <div className="relative border-b border-slate-100 bg-white py-3 flex items-center justify-center">
          <img
            src="https://file.hstatic.net/200000355853/file/logo.svg"
            alt="Jemmia Logo"
            className="h-5 w-auto"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col pt-4 px-4 pb-0 justify-start overflow-y-auto no-scrollbar">
          {/* Illustration Container */}
          <div className="w-full bg-slate-50 overflow-hidden relative flex items-center justify-center">
            {/* Try to load guide illustration image; fall back to a beautiful mock placeholder if missing */}
            <img
              src={
                guideStep === 1
                  ? "https://cdn.hstatic.net/files/200000355853/file/chatgpt_image_10_35_42_16_thg_6__2026_1__2_.png"
                  : "https://cdn.hstatic.net/files/200000355853/file/chatgpt_image_10_35_42_16_thg_6__2026_1__3_.png"
              }
              className="w-full h-full object-cover select-none"
              alt={guideStep === 1 ? "Zoom Gesture" : "Drag Gesture"}
              draggable={false}
            />
          </div>

          {/* Title & Instructions */}
          {guideStep === 1 ? (
            <div className="mt-4 space-y-3 px-2">
              <h3 className="text-lg font-bold text-center text-black tracking-tight leading-snug">
                Dùng 2 ngón để phóng to/thu nhỏ
              </h3>
              <ul className="text-sm text-black space-y-2 list-disc pl-4 leading-relaxed font-normal">
                <li>
                  Đặt hai ngón tay lên màn hình để điều chỉnh kích thước red
                  mark
                </li>
                <li>Kéo ra xa để phóng to, kéo lại gần để thu nhỏ.</li>
              </ul>
            </div>
          ) : (
            <div className="mt-4 space-y-3 px-2">
              <h3 className="text-lg font-bold text-center text-black tracking-tight leading-snug">
                Dùng 1 ngón để chọn vị trí đeo nhẫn
              </h3>
              <ul className="text-sm text-black space-y-2 list-disc pl-4 leading-relaxed font-normal">
                <li>
                  Kéo red mark đến vị trí ngón tay bạn muốn thử nhẫn bằng 1 ngón
                  tay
                </li>
                <li>
                  Bạn có thể kết hợp phóng to/thu nhỏ để đặt khung chính xác hơn
                </li>
                <li>
                  Khi red box nằm đúng vị trí, hệ thống sẽ hiển thị nhẫn trên
                  ngón đó
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer Area with Action Button */}
        <div className="p-4 bg-white border-t border-slate-50">
          <Button
            onClick={onNext}
            className="w-full bg-secondary-800 hover:bg-secondary-700 text-white font-semibold text-sm h-12 flex items-center justify-center gap-2 rounded-none cursor-pointer border-none shadow-none"
          >
            <span>Tiếp tục</span>
            <ArrowRight size={14} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}
