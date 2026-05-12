import React from "react";
import { Globe, Camera, FileArrowUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface MediaGroupProps {
  title: string;
  images: string[];
  icon: React.ReactNode;
}

export function MediaGroup({ title, images, icon }: MediaGroupProps) {
  const displayImages = images.slice(0, 1);
  const hasMore = images.length > 1;

  return (
    <div className="flex flex-col gap-1 items-center">
      <div className="flex items-center gap-1 text-[8px] font-black text-primary-200 uppercase tracking-widest">
        {icon}
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {images.length > 0 ? (
          <div
            className="relative h-10 w-10 border border-primary-100 rounded-sm overflow-hidden cursor-pointer group/thumb bg-white"
            onClick={() => {}}
          >
            <img src={images[0]} className="h-full w-full object-cover transition-transform group-hover/thumb:scale-110" alt={title} />
            {hasMore && (
              <div className="absolute inset-0 bg-secondary-900/40 flex items-center justify-center">
                <span className="text-[10px] text-white font-black">+{images.length - 1}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="h-10 w-10 border border-dashed border-primary-100 rounded-sm flex items-center justify-center bg-gray-50/30">
          </div>
        )}
        {title !== "WEB" && (
          <button className="h-10 w-6 text-primary-200 hover:text-secondary-900 hover:bg-primary-50 rounded-none border-l border-primary-50 flex items-center justify-center">
            <FileArrowUp size={14} />
          </button>
        )}
      </div>
    </div>
  );
}