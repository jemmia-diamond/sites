import React from "react";
import { createPortal } from "react-dom";
import { X } from "@phosphor-icons/react";

interface LightboxModalProps {
  isFullscreen: boolean;
  lightboxRef: React.RefObject<HTMLDivElement | null>;
  selectedGeneratedImage: string | null;
  handleCloseFullscreen: () => void;
}

export function LightboxModal({
  isFullscreen,
  lightboxRef,
  selectedGeneratedImage,
  handleCloseFullscreen,
}: LightboxModalProps) {
  if (!isFullscreen) return null;

  return createPortal(
    <div
      ref={lightboxRef}
      className="fixed inset-0 bg-black z-[99999] flex flex-col items-center justify-center select-none cursor-pointer"
      onClick={handleCloseFullscreen}
    >
      <img
        src={selectedGeneratedImage || ""}
        className="w-full h-auto max-h-screen object-contain"
        alt="Fullscreen view"
      />
      <div className="absolute top-4 right-4 text-white p-2.5 bg-black/40 rounded-full hover:bg-black/60 transition-colors">
        <X size={24} weight="bold" />
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 w-full text-center text-xs font-semibold tracking-wide bg-black/40 py-1.5 rounded-full backdrop-blur-sm">
        Nhấp vào vùng bất kỳ để quay lại
      </div>
    </div>,
    document.body,
  );
}
