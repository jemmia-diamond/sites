import React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { HistoryContent } from "./HistoryContent";

interface HistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (imageUrl: string) => void;
  activeImageUrl?: string | null;
}

export const HistoryDialog: React.FC<HistoryDialogProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  activeImageUrl,
}) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop overlay with z-[240] to show above the TryOnDrawer (z-[200]) */}
        <DialogPrimitive.Backdrop
          className="fixed inset-0 isolate z-[240] bg-black/40 backdrop-blur-sm duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />

        {/* Content Popup with z-[250] to show above the TryOnDrawer (z-[200]) */}
        <DialogPrimitive.Popup
          className="fixed top-1/2 left-1/2 z-[250] flex flex-col w-[95vw]! max-w-[1000px]! -translate-x-1/2 -translate-y-1/2 gap-4 bg-white p-6 md:pt-6 md:pb-8 md:px-8 text-sm text-slate-900 border border-slate-100 shadow-2xl rounded-none outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between shrink-0">
            <DialogPrimitive.Title className="text-xl md:text-2xl font-bold text-slate-900 font-sans">
              Lịch sử tạo ảnh
            </DialogPrimitive.Title>

            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-full cursor-pointer"
                />
              }
            >
              <X size={20} />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Render the reusable HistoryContent */}
          <div className="flex-1 min-h-0">
            <HistoryContent
              onSelectImage={onSelectImage}
              activeImageUrl={activeImageUrl}
            />
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
