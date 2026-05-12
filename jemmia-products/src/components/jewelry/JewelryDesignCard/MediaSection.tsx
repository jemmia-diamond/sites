import React, { useState } from "react";
import { DownloadSimple, X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaSectionProps {
  title: string;
  icon: React.ReactNode;
  images: string[];
}

export function MediaSection({ title, icon, images }: MediaSectionProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isWeb = title === "WEB";

  const handleDownloadAll = async () => {
    if (!images || images.length === 0) return;
    for (const imageUrl of images) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = imageUrl.split("/").pop() || "image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadSingle = async (url: string) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = url.split("/").pop() || "design-image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewIndex !== null) {
      setPreviewIndex((previewIndex + 1) % images.length);
    }
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewIndex !== null) {
      setPreviewIndex((previewIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="text-secondary-900">{icon}</div>
        <span className="text-[11px] font-bold text-secondary-900 tracking-tight uppercase">{title}</span>
        {images.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-secondary-900 hover:bg-primary-50 rounded-none cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadAll();
            }}
          >
            <DownloadSimple size={14} />
          </Button>
        )}
      </div>

      <div className="flex gap-2 min-h-[56px] items-center">
        {images.length === 0 && isWeb ? (
          <span className="text-[10px] font-medium text-primary-300 italic uppercase">Không có dữ liệu</span>
        ) : (
          <>
            {images.slice(0, 2).map((img, i) => (
              <div
                key={i}
                className="h-14 w-14 rounded-none border border-primary-100 overflow-hidden relative group cursor-pointer bg-white flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(i);
                }}
              >
                <img src={img} className="h-full w-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt={`Media ${i}`} />
              </div>
            ))}
            {images.length > 2 && (
              <div
                className="h-14 w-14 rounded-none border border-primary-100 overflow-hidden relative group cursor-pointer bg-white flex items-center justify-center flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(2);
                }}
              >
                <img
                  src={images[2]}
                  className="absolute inset-0 w-full h-full object-cover blur-[1px] opacity-60 transition-all group-hover:scale-110"
                  alt="Xem thêm"
                />
                <div className="absolute inset-0 bg-secondary-900/40 flex flex-col items-center justify-center group-hover:bg-secondary-900/30 transition-colors">
                  <span className="text-white text-xs font-black drop-shadow-sm">+{images.length - 2}</span>
                </div>
              </div>
            )}

            {!isWeb && (
              <div
                className="h-14 w-14 rounded-none border-2 border-dashed border-primary-100 flex items-center justify-center text-primary-300 cursor-pointer hover:border-primary-300 hover:text-primary-500 hover:bg-primary-50 transition-all bg-white flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" />
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={previewIndex !== null} onOpenChange={(open) => !open && setPreviewIndex(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[70vw]! w-auto h-max bg-white rounded-none border-none p-0 overflow-hidden shadow-2xl flex flex-col outline-none"
        >
          <div className="flex-1 relative bg-primary-50 flex items-center justify-center pt-4 pb-16 px-20 group">
            {previewIndex !== null && images[previewIndex] && (
              <>
                <img
                  src={images[previewIndex]}
                  className="w-[550px] h-auto aspect-square object-cover animate-in fade-in zoom-in duration-500 scale-95"
                  alt="Xem thử"
                />

                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={showPrev}
                      className="absolute left-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-white/80 hover:bg-white text-secondary-900 rounded-none shadow-xl cursor-pointer border-none"
                    >
                      <CaretLeft size={32} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={showNext}
                      className="absolute right-6 top-1/2 -translate-y-1/2 h-14 w-14 bg-white/80 hover:bg-white text-secondary-900 rounded-none shadow-xl cursor-pointer border-none"
                    >
                      <CaretRight size={32} />
                    </Button>
                  </>
                )}

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <div className="bg-secondary-900 text-white px-5 py-2 rounded-none text-xs font-bold shadow-xl tracking-widest uppercase">
                    {previewIndex + 1} / {images.length}
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => images[previewIndex!] && handleDownloadSingle(images[previewIndex!])}
                    className="h-10 w-10 bg-white hover:bg-primary-50 text-secondary-900 rounded-none shadow-xl cursor-pointer border-none"
                  >
                    <DownloadSimple size={20} />
                  </Button>
                </div>
              </>
            )}

            <div className="absolute top-6 right-6 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 bg-white/80 text-primary-400 rounded-none hover:bg-critical/10 hover:text-critical shadow-lg cursor-pointer"
                onClick={() => setPreviewIndex(null)}
              >
                <X size={24} />
              </Button>
            </div>
          </div>

          <div className="h-28 bg-white border-t border-primary-100 px-8 flex items-center gap-4 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <div
                key={i}
                className={cn(
                  "relative h-16 w-16 rounded-none overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0",
                  previewIndex === i
                    ? "ring-2 ring-secondary-900 ring-offset-2 scale-110 shadow-lg"
                    : "opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                )}
                onClick={() => setPreviewIndex(i)}
              >
                <img src={img} className="h-full w-full object-cover" alt={`Thumb ${i}`} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}