import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

function BottomSheetOverlay({
  className,
  onOpenChange,
  ...props
}: DialogPrimitive.Backdrop.Props & {
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-[200] bg-black/40 touch-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-200",
        className
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      {...props}
    />
  );
}

export function BottomSheet({ open, onOpenChange, title, children, className, contentClassName }: BottomSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <BottomSheetOverlay onOpenChange={onOpenChange} />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-x-0 bottom-0 z-[201] flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] outline-none",
            "data-open:animate-in data-open:slide-in-from-bottom data-open:duration-300",
            "data-closed:animate-out data-closed:slide-out-to-bottom data-closed:duration-200",
            className
          )}
        >
          <div className="flex shrink-0 flex-col items-center pt-3">
            <div className="h-1 w-10 rounded-full bg-primary-200" aria-hidden />
          </div>

          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-primary-100 px-3 pb-2">
            {title ? (
              <DialogPrimitive.Title className="min-w-0 flex-1 text-sm font-bold tracking-tight text-secondary-900">
                {title}
              </DialogPrimitive.Title>
            ) : (
              <span className="sr-only">Chi tiết</span>
            )}
            <DialogPrimitive.Close
              type="button"
              className="inline-flex size-8 -mt-2 cursor-pointer rounded-full items-center justify-center text-primary-400 transition-colors hover:bg-primary-50 hover:text-secondary-900"
            >
              <X size={18} />
              <span className="sr-only">Đóng</span>
            </DialogPrimitive.Close>
          </div>

          <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-23", contentClassName)}>
            {children}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
