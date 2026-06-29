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
  dragOffset,
  isDragging,
  style,
  ...props
}: DialogPrimitive.Backdrop.Props & {
  onOpenChange: (open: boolean) => void;
  dragOffset: number;
  isDragging: boolean;
}) {
  const opacity = dragOffset > 0 ? Math.max(0, 1 - dragOffset / 400) : undefined;
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-203 bg-black/40 touch-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-200",
        className
      )}
      style={{
        opacity,
        transition: isDragging ? "none" : "opacity 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        ...style,
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      {...props}
    />
  );
}

export function BottomSheet({ open, onOpenChange, title, children, className, contentClassName }: BottomSheetProps) {
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragOffsetRef = React.useRef(0);

  React.useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  const popupRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setDragOffset(0);
      setIsDragging(false);
    }
  }, [open]);

  React.useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;

    const content = contentRef.current;

    let startY = 0;
    let isDraggingSheet = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isDraggingSheet = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      const target = e.target as HTMLElement;
      const isInsideContent = content && content.contains(target);

      if (isInsideContent) {
        const scrollTop = content.scrollTop;

        // Drag the sheet down only if moving down and at the top of scrollable container
        if (deltaY > 0 && scrollTop <= 0) {
          if (!isDraggingSheet) {
            isDraggingSheet = true;
            setIsDragging(true);
          }
          setDragOffset(deltaY);

          if (e.cancelable) {
            e.preventDefault();
          }
        } else if (isDraggingSheet) {
          // Already dragging, keep tracking
          if (deltaY > 0) {
            setDragOffset(deltaY);
          } else {
            setDragOffset(0);
            setIsDragging(false);
            isDraggingSheet = false;
          }
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      } else {
        // Touch is on header / non-scrollable part
        if (deltaY > 0) {
          if (!isDraggingSheet) {
            isDraggingSheet = true;
            setIsDragging(true);
          }
          setDragOffset(deltaY);
          if (e.cancelable) {
            e.preventDefault();
          }
        } else if (isDraggingSheet) {
          setDragOffset(0);
          setIsDragging(false);
          isDraggingSheet = false;
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (isDraggingSheet) {
        setIsDragging(false);
        isDraggingSheet = false;

        const finalOffset = dragOffsetRef.current;
        if (finalOffset > 100) {
          onOpenChange(false);
          setDragOffset(window.innerHeight);
        } else {
          setDragOffset(0);
        }
      }
    };

    popup.addEventListener("touchstart", handleTouchStart, { passive: true });
    popup.addEventListener("touchmove", handleTouchMove, { passive: false });
    popup.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      popup.removeEventListener("touchstart", handleTouchStart);
      popup.removeEventListener("touchmove", handleTouchMove);
      popup.removeEventListener("touchend", handleTouchEnd);
    };
  }, [open, onOpenChange]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <BottomSheetOverlay
          onOpenChange={onOpenChange}
          dragOffset={dragOffset}
          isDragging={isDragging}
        />
        <DialogPrimitive.Popup
          ref={popupRef}
          style={{
            transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
            transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-[301] flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] outline-none",
            "data-open:animate-in data-open:slide-in-from-bottom data-open:duration-300",
            "data-closed:animate-out data-closed:slide-out-to-bottom data-closed:duration-200",
            className
          )}
        >
          {/* Drag Handle & Header */}
          <div className="flex shrink-0 flex-col cursor-grab active:cursor-grabbing select-none">
            <div className="flex flex-col items-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-primary-200" aria-hidden />
            </div>

            <div className="flex items-center justify-between gap-2 border-b border-primary-100 px-3 pb-2">
              {title ? (
                <DialogPrimitive.Title className="min-w-0 flex-1 text-sm font-bold tracking-tight text-secondary-900 pt-1">
                  {title}
                </DialogPrimitive.Title>
              ) : (
                <span className="sr-only">Chi tiết</span>
              )}
              <DialogPrimitive.Close
                type="button"
                className="inline-flex size-8 cursor-pointer rounded-full items-center justify-center text-primary-400 transition-colors hover:bg-primary-50 hover:text-secondary-900"
              >
                <X size={18} />
                <span className="sr-only">Đóng</span>
              </DialogPrimitive.Close>
            </div>
          </div>

          <div
            ref={contentRef}
            className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-23", contentClassName)}
          >
            {children}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
