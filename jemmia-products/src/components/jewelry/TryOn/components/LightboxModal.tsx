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
      className="fixed inset-0 bg-black z-[99999] flex flex-col items-center justify-center select-none"
    >
      <img
        src={selectedGeneratedImage || ""}
        className="w-full h-auto max-h-screen object-contain"
        alt="Fullscreen view"
      />
      <div onClick={handleCloseFullscreen} className="cursor-pointer absolute top-4 right-4 text-white p-2.5 bg-black/40 rounded-full hover:bg-black/60 transition-colors">
        <X size={24} weight="bold" />
      </div>
    </div>,
    document.body,
  );
}
