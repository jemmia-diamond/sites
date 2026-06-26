import { isVideo } from "@/lib/media";

interface MediaGridProps {
  activeImages: string[];
  onThumbnailClick: (url: string) => void;
}

export function MediaGrid({ activeImages, onThumbnailClick }: MediaGridProps) {
  return (
    <div className="overflow-y-auto pr-0.5 mt-3 flex-1 min-h-0">
      <div className="grid grid-cols-3 gap-2">
        {activeImages.map((url, idx) => {
          const isVid = url && isVideo(url);
          return (
            <div
              key={idx}
              onClick={() => onThumbnailClick(url)}
              className="w-full aspect-square cursor-pointer overflow-hidden transition-all duration-200 relative"
            >
              {isVid ? (
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  muted
                  playsInline
                />
              ) : (
                <img src={url} className="w-full h-full object-cover" alt={`Thumbnail ${idx}`} />
              )}
              {isVid && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-secondary-900 border-b-[4px] border-b-transparent ml-0.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {activeImages.length === 0 && (
        <div className="w-full text-center py-4 text-xs text-slate-400">
          Không có hình ảnh nào
        </div>
      )}
    </div>
  );
}
