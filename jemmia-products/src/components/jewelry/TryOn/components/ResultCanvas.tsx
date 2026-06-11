import React from "react";
import { DownloadSimple, CornersOut, WarningCircle } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultCanvasProps {
  isMobile: boolean;
  isGenerating: boolean;
  uploadedImage: string | null;
  selectedGeneratedImage: string | null;
  generatedImages: string[];
  handleSelectGeneratedImage: (img: string | null) => void;
  handleDownload: () => void;
  setIsFullscreen: (f: boolean) => void;
  generationError?: string | null;
}

export function ResultCanvas({
  isMobile,
  isGenerating,
  uploadedImage,
  selectedGeneratedImage,
  generatedImages,
  handleSelectGeneratedImage,
  handleDownload,
  setIsFullscreen,
  generationError,
}: ResultCanvasProps) {
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
  if (isGenerating) {
    /* State A: Loading / isGenerating is true */
    return (
      <div className="w-full h-full bg-slate-100 border border-slate-200 shadow-md rounded-lg relative overflow-hidden flex items-center justify-center select-none mx-auto">
        <img
          src={uploadedImage || ""}
          className="w-full h-full object-cover blur-md scale-105"
          alt="Hand Preview Blur"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          {/* Radiating IOS Tick Spinner */}
          <svg
            className={`${
              isMobile ? "w-12 h-12" : "w-16 h-16"
            } animate-spin text-white`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (!selectedGeneratedImage) {
    /* State B: Choose picture / 2x2 grid */
    return (
      <div
        className={`w-full h-full grid grid-cols-2 grid-rows-2 ${
          isMobile ? "gap-2" : "gap-4"
        } mx-auto`}
      >
        {Array.from({ length: 4 }).map((_, idx) => {
          const img = generatedImages[idx];
          if (img) {
            return (
              <div
                key={idx}
                onClick={() => handleSelectGeneratedImage(img)}
                className={`w-full h-full bg-slate-50 border border-slate-100 rounded-lg overflow-hidden cursor-pointer shadow-sm ${
                  isMobile
                    ? "active:scale-98"
                    : "hover:shadow-md hover:scale-[1.02] active:scale-98"
                } transition-all duration-200`}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt={`Generated Option ${idx + 1}`}
                />
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="w-full h-full bg-slate-100 border border-dashed border-slate-200 rounded-lg flex items-center justify-center"
            >
              <Skeleton className="w-full h-full rounded-lg" />
            </div>
          );
        })}
      </div>
    );
  }

  /* State C: Final / selectedGeneratedImage is not null */
  return (
    <div className="w-full h-full relative overflow-hidden mx-auto flex items-center justify-center">
      <div className="relative w-fit h-fit max-w-full max-h-full bg-white border border-slate-200 shadow-md rounded-lg overflow-hidden">
        <img
          src={selectedGeneratedImage}
          className="max-w-full max-h-full block w-auto h-auto"
          alt="AI Generated Try On Result"
        />
        {/* Overlay actions inside the image */}
        <div
          className={`absolute bottom-4 right-4 flex items-center ${
            isMobile ? "gap-3" : "gap-4"
          }`}
        >
          <button
            onClick={handleDownload}
            className={`${
              isMobile ? "w-11 h-11" : "w-12 h-12"
            } bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform`}
          >
            <DownloadSimple size={isMobile ? 20 : 22} weight="bold" />
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className={`${
              isMobile ? "w-11 h-11" : "w-12 h-12"
            } bg-white hover:bg-slate-50 text-slate-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform`}
          >
            <CornersOut size={isMobile ? 20 : 22} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
