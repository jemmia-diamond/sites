import React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { isVideo } from "@/lib/media";

interface FullscreenGalleryProps {
  mediaList: string[];
  currentUrl: string;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function FullscreenGallery({
  mediaList,
  currentUrl,
  onClose,
  onSelect,
}: FullscreenGalleryProps) {
  const currentIndex = mediaList.indexOf(currentUrl);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaList.length <= 1) return;
    const newIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
    onSelect(mediaList[newIndex]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaList.length <= 1) return;
    const newIndex = (currentIndex + 1) % mediaList.length;
    onSelect(mediaList[newIndex]);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (mediaList.length <= 1) return;
        const newIndex =
          (currentIndex - 1 + mediaList.length) % mediaList.length;
        onSelect(mediaList[newIndex]);
      } else if (e.key === "ArrowRight") {
        if (mediaList.length <= 1) return;
        const newIndex = (currentIndex + 1) % mediaList.length;
        onSelect(mediaList[newIndex]);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, mediaList, onSelect, onClose]);

  if (!currentUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/35 backdrop-blur-md flex flex-col justify-between select-none"
      onClick={onClose}
    >
      {/* Top Bar: Close Button */}
      <div className="flex justify-end p-4 md:p-6 shrink-0">
        <Button
          onClick={onClose}
          className="text-white hover:text-secondary-700 p-2 md:p-3 cursor-pointer! bg-white/10 hover:bg-white rounded-full transition-all duration-200 z-[10000] border border-white/10 shadow-lg flex items-center justify-center"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" weight="bold" />
        </Button>
      </div>

      {/* Main Preview Area with Next/Prev Arrows */}
      <div className="flex-1 flex items-center justify-between px-3 md:px-6 min-h-0 relative">
        {/* Prev Arrow */}
        {mediaList.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 md:left-6 z-10 text-white hover:text-[#004B49] bg-white/10 hover:bg-white p-2 md:p-4 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center w-10 h-10 md:w-14 md:h-14 border border-white/10 shadow-xl"
          >
            <CaretLeft className="w-5 h-5 md:w-8 md:h-8" weight="bold" />
          </button>
        )}

        {/* Media Content */}
        <div
          className="mx-auto max-w-[85%] max-h-[50vh] md:max-h-[70vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isVideo(currentUrl) ? (
            <video
              src={currentUrl}
              controls
              autoPlay
              className="max-w-full bg-white max-h-[50vh] md:max-h-[70vh] object-contain"
            />
          ) : (
            <img
              src={currentUrl}
              className="max-w-full bg-white max-h-[50vh] md:max-h-[70vh] object-contain"
              alt="Fullscreen preview"
            />
          )}
        </div>

        {/* Next Arrow */}
        {mediaList.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 md:right-6 z-10 text-white hover:text-[#004B49] bg-white/10 hover:bg-white p-2 md:p-4 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center w-10 h-10 md:w-14 md:h-14 border border-white/10 shadow-xl"
          >
            <CaretRight className="w-5 h-5 md:w-8 md:h-8" weight="bold" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnails List */}
      <div
        className="w-full py-4 md:py-6 bg-slate-950/45 backdrop-blur-sm flex justify-center overflow-x-auto gap-2 px-4 no-scrollbar shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaList.map((url, idx) => {
          const isVid = isVideo(url);
          const isSelected = url === currentUrl;
          return (
            <div
              key={idx}
              onClick={() => onSelect(url)}
              className={cn(
                "w-12 h-12 md:w-20 md:h-20 min-w-12 min-h-12 md:min-w-20 md:min-h-20 border-2 cursor-pointer overflow-hidden transition-all duration-200 relative rounded-sm",
                isSelected
                  ? "border-[#004B49] scale-105"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              {isVid ? (
                <div className="relative w-full h-full bg-slate-950">
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-white/80 flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[2px] md:border-t-[3px] border-t-transparent border-l-[4px] md:border-l-[6px] border-l-secondary-900 border-b-[2px] md:border-b-[3px] border-b-transparent ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={url}
                  className="w-full h-full object-cover bg-slate-50"
                  alt={`Thumbnail ${idx}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
