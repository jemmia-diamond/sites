import React from "react";
import { Camera, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface CompactGalleryProps {
  images: string[];
  showUpload?: boolean;
  brokenImages: Set<string>;
  onImageError: (url: string) => void;
  onPreview: (images: string[], index: number) => void;
}

export function CompactGallery({
  images,
  showUpload = false,
  brokenImages,
  onImageError,
  onPreview,
}: CompactGalleryProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validImages = images.filter((url) => !brokenImages.has(url));

  const displayCount = 4;
  const items = validImages.slice(0, displayCount);
  const totalCount = validImages.length;

  const isVideo = (url: string) =>
    !!url.match(/\.(mp4|webm|ogg|mov)$|^blob:|^data:video/i);

  return (
    <div className="flex items-center gap-2">
      <div className="w-[172px]">
        {validImages.length === 0 ? (
          <div className="h-10 w-full border border-dashed border-primary-100 flex items-center justify-center gap-2 bg-white">
            <Camera size={14} className="text-primary-200" />

            <span className="text-[11px] text-primary-300 whitespace-nowrap">
              Không có dữ liệu
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            {items.map((url, idx) => {
              const isVid = isVideo(url);

              return (
                <div
                  key={idx}
                  className="relative h-10 w-10 overflow-hidden cursor-pointer bg-white border border-primary-50 shadow-sm hover:z-10 transition-all hover:scale-110 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(validImages, idx);
                  }}
                >
                  {isVid ? (
                    <div className="h-full w-full bg-secondary-900 flex items-center justify-center relative">
                      <video
                        src={url}
                        className="h-full w-full object-cover opacity-50"
                      />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                          <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={url}
                      className="h-full w-full object-cover"
                      alt=""
                      onError={() => onImageError(url)}
                    />
                  )}

                  {idx === displayCount - 1 &&
                    totalCount > displayCount && (
                      <div className="absolute inset-0 bg-secondary-900/70 flex items-center justify-center z-10">
                        <span className="text-[9px] text-white font-bold">
                          +{totalCount - displayCount}
                        </span>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showUpload && (
        <Button
        variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 bg-slate-50 text-primary-300 hover:text-secondary-900 hover:bg-secondary-50 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <Plus size={12} weight="bold" />

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*,video/*"
          />
        </Button>
      )}
    </div>
  );
}