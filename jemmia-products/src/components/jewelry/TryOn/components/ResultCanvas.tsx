import React, { use, useState, useEffect } from "react";
import { DownloadSimple, WarningCircle, Copy, Check } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { TryOnContext } from "../context/TryOnContext";
import { downloadFile } from "@/lib/download";
import { copyImage } from "@/lib/media";
import { CircularProgress } from "./CircularProgress";

interface ResultCanvasProps {
  onViewProduct?: () => void;
}

export function ResultCanvas({ onViewProduct }: ResultCanvasProps) {
  const context = use(TryOnContext);
  const [copied, setCopied] = useState(false);

  if (!context) return null;

  const { state, actions } = context;
  const {
    isMobile,
    isGenerating,
    uploadedImage,
    selectedGeneratedImage,
    generatedImages,
    generationError,
    progress,
  } = state;

  const {
    handleSelectGeneratedImage,
    setIsFullscreen,
    setIsHistoryOpen,
  } = actions;

  const handleCopy = async (imageUrl: string) => {
    const success = await copyImage(imageUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (generationError) {
    return (
      <div className="w-full h-full bg-white border border-slate-200 shadow-md rounded-lg relative overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none mx-auto min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
          <WarningCircle size={32} weight="fill" />
        </div>
        <h4 className="text-primary-900 font-bold text-base mb-1">
          Không thể tạo ảnh
        </h4>
        <p className="text-xs text-primary-500 max-w-[280px] leading-relaxed">
          {generationError}
        </p>
      </div>
    );
  }
  // progress state is lifted to TryOnProvider

  const getStatusText = (prog: number) => {
    const p = Math.floor(prog);
    if (p <= 15) return "Đang tải và tối ưu hóa chất lượng hình ảnh";
    if (p <= 30) return "Đang kiểm tra điều kiện ánh sáng của ảnh gốc";
    if (p <= 45) return "Đang phân tích cấu trúc bàn tay và ngón tay";
    if (p <= 60) return "Đang xác định vị trí đặt nhẫn tối ưu";
    if (p <= 75) return "Đang tính toán kích thước và tỷ lệ góc chụp";
    if (p <= 90) return "Đang hòa trộn ánh sáng và đổ bóng thực tế";
    return "Đang hoàn thiện những chi tiết cuối cùng";
  };

  if (isGenerating) {
    /* State A: Loading / isGenerating is true */
    return (
      <div className="w-full h-full bg-slate-100 border border-slate-200 shadow-md rounded-lg relative overflow-hidden flex items-center justify-center select-none mx-auto min-h-[300px]">
        <img
          src={uploadedImage || ""}
          className="w-full h-full object-cover blur-md scale-105"
          alt="Hand Preview Blur"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center gap-4 text-center px-6">
          {/* Circular Progress Ring */}
          <CircularProgress progress={progress} />
          <div className="flex flex-col">
            {/* Active status text based on progress */}
            <span className="text-white text-xs md:text-sm font-medium tracking-wide animate-pulse drop-shadow-md select-none min-h-[40px] flex items-center justify-center">
              {getStatusText(progress)}
            </span>

            <p className="text-white/80 text-xs -mt-2 md:text-sm font-normal leading-relaxed select-none  drop-shadow-md">
              Quá trình xử lý ảnh sẽ tự động lưu trong{" "}
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="underline text-white font-semibold hover:text-slate-200 transition-colors bg-transparent border-none p-0 inline cursor-pointer outline-none align-baseline"
              >
                Lịch sử
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedGeneratedImage) {
    /* State B: Choose picture / single image preview or skeleton */
    const firstImg = generatedImages[0];
    if (firstImg) {
      return (
        <div className="w-full h-full relative overflow-hidden mx-auto flex items-center justify-center">
          <div className="relative w-fit h-fit max-w-full max-h-full bg-white border border-slate-200 shadow-md rounded-lg overflow-hidden">
            <img
              src={firstImg}
              className="max-w-full max-h-full block w-auto h-auto cursor-pointer"
              alt="AI Generated Try On Result"
              onClick={() => handleSelectGeneratedImage(firstImg)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-slate-100 border border-slate-200 shadow-md rounded-lg relative overflow-hidden flex items-center justify-center select-none mx-auto min-h-[300px]">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }

  /* State C: Final / selectedGeneratedImage is not null */
  return (
    <div className="max-w-225 h-full lg:h-auto w-full aspect-square bg-black border border-slate-200 shadow-md rounded-lg relative overflow-hidden mx-auto flex items-center justify-center">
      <div className="relative w-full h-full max-w-full max-h-full bg-white overflow-hidden">
        <img
          src={selectedGeneratedImage}
          className="w-full h-full object-contain bg-black cursor-pointer"
          alt="AI Generated Try On Result"
          onClick={() => setIsFullscreen(true)}
        />
        {/* Overlay actions inside the image */}
        <div
          className={`absolute bottom-4 right-4 flex items-center ${isMobile ? "gap-3" : "gap-4"
            }`}
        >
          <button
            onClick={() => selectedGeneratedImage && downloadFile(selectedGeneratedImage)}
            className={`${isMobile ? "w-11 h-11" : "w-12 h-12"
              } bg-white hover:bg-slate-50 rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform`}
            title="Tải xuống hình ảnh"
          >
            <DownloadSimple size={isMobile ? 20 : 22} />
          </button>
          <button
            onClick={() => selectedGeneratedImage && handleCopy(selectedGeneratedImage)}
            className={`${isMobile ? "w-11 h-11" : "w-12 h-12"
              } bg-white hover:bg-slate-50 rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform`}
            title="Sao chép hình ảnh"
          >
            {copied ? (
              <Check size={isMobile ? 18 : 20} className="text-emerald-600 font-bold" />
            ) : (
              <Copy size={isMobile ? 20 : 22} />
            )}
          </button>
          {onViewProduct && (
            <button
              onClick={onViewProduct}
              className={`${isMobile ? "w-11 h-11" : "w-12 h-12"
                } bg-white hover:bg-slate-50 rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform`}
              title="Xem thông tin sản phẩm"
            >
              <img src="https://cdn.hstatic.net/files/200000355853/file/ring.svg" alt="ring-icon" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
