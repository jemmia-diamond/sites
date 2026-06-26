import { ImageSquare } from "@phosphor-icons/react";
import { isVideo } from "@/lib/media";
import { ProductModel } from "../../../../types";

interface RingHeaderProps {
  selectedRing: ProductModel;
  previewImage: string | null;
  onPreviewClick: () => void;
}

export function RingHeader({ selectedRing, previewImage, onPreviewClick }: RingHeaderProps) {
  return (
    <div className="flex gap-4 items-center">
      <div
        onClick={onPreviewClick}
        className="w-1/3 flex justify-center items-center bg-white select-none cursor-pointer border border-primary-50 hover:opacity-95"
      >
        {previewImage ? (
          isVideo(previewImage) ? (
            <div className="relative aspect-square w-auto">
              <video src={previewImage} className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-secondary-900 border-b-[6px] border-b-transparent ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={previewImage}
              className="object-contain aspect-square w-auto"
              alt={selectedRing.title}
            />
          )
        ) : (
          <div className="w-full h-full aspect-square flex flex-col items-center justify-center bg-slate-100 text-xs text-slate-400 gap-2">
            <ImageSquare size={14} className="text-slate-400" />
            <span>Chưa có hình ảnh</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <h4 className="text-slate-700 font-medium text-base leading-snug">
          {selectedRing.type || "Loại nhẫn"}
        </h4>
        <h4 className="text-slate-900 font-black text-base leading-snug">
          {selectedRing.attributes?.designCode || "--"}
        </h4>
      </div>
    </div>
  );
}
